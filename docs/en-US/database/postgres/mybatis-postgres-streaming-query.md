# MyBatis + PostgreSQL 流式查询与事务冲突问题

## 问题背景

在使用 MyBatis 进行大批量数据抽取时，为了避免 OOM（内存溢出），通常会使用 PostgreSQL 的**游标（Cursor）**机制进行流式查询。然而，即使代码中正确配置了 `sqlSessionFactory.openSession(false)`，在大数据量场景下仍然出现了：

- **ClientWrite 堵塞**
- **CPU 占用飙升（可高达 1295%）**
- **12GB 内存 OOM**

## 根本原因：MyBatis-Spring 的事务暗坑

PostgreSQL JDBC 驱动开启游标有一个硬性前提：**底层物理 JDBC 连接必须 `autoCommit=false`**。

### 问题链路

1. 代码中写了 `sqlSessionFactory.openSession(false)`，意图关闭自动提交
2. 但 `MLStandardDataExtractPhaseImpl` 类上加了 `@NoTransactional`（无 Spring 事务）
3. 在 MyBatis-Spring 集成环境中，如果没有 Spring 事务包裹，HikariCP 连接池拿出的连接**默认 `autoCommit=true`**
4. Spring 的 `SpringManagedTransaction` 接管了连接管理，**MyBatis 修改 `autoCommit` 的请求被静默忽略**
5. PostgreSQL 驱动检测到 `autoCommit=true`，拒绝使用游标，将全量数据一次性加载到内存

### 框架冲突的本质

| 环境 | `openSession(false)` 行为 |
|------|--------------------------|
| 纯 MyBatis | 有效，MyBatis 直接修改 JDBC 连接 `autoCommit` |
| MyBatis + Spring（无 `@Transactional`） | **无效**，Spring 认为"只有我才能动事务开关"，静默忽略 MyBatis 的请求 |
| MyBatis + Spring（有 `@Transactional`） | 有效，Spring 开启事务时主动将 `autoCommit` 设为 `false` |

## 为什么不能加 @Transactional

虽然加 `@Transactional` 能解决游标问题，但在大数据抽取场景下是**灾难性的选择**：

1. **长事务代价高昂**：百万/千万级数据抽取耗时数小时，数据库需要维持 MVCC 隔离级别，长期持有 Undo/Redo 日志
2. **一荣俱荣一损俱损**：如果在插入第 99 万条时网络抖动，整个事务回滚，前功尽弃

因此，在 `MLStandardDataExtractPhaseImpl` 上加 `@NoTransactional` 是**高明的架构决定**。

## 解决方案：越过框架直接操作 JDBC Connection

在 `MLStandardClosableIterator` 中，越过 MyBatis 和 Spring 代理，直接获取并操作底层 JDBC Connection：

```java
java.sql.Connection connection = this.sqlSession.getConnection();
if (connection != null && connection.getAutoCommit()) {
    connection.setAutoCommit(false);
}
```

### 修改一：强杀自动提交（MLStandardClosableIterator.java）

```java
@Override
public T fetch() {
    if (this.rs != null) {
        try {
            if (this.rs.next()) {
                // 获取底层 JDBC Connection 并强制关闭自动提交
                java.sql.Connection connection = this.sqlSession.getConnection();
                if (connection != null && connection.getAutoCommit()) {
                    connection.setAutoCommit(false);
                }
                
                this.current = this.rowHandler.map(this.rs, this.namingPolicy);
                this.sqlSession.clearCache(); // 清理 MyBatis 一级缓存
                return this.current;
            }
        } catch (SQLException e) {
            throw new DataExtractException("Failed to fetch next row", e);
        }
    }
    return null;
}

@Override
public void close() {
    // 安全释放资源
    try {
        if (this.rs != null) {
            this.rs.close();
        }
    } catch (SQLException e) {
        // log error
    }
    
    try {
        // 回滚并关闭连接，释放数据库游标锁
        java.sql.Connection connection = this.sqlSession.getConnection();
        if (connection != null) {
            connection.rollback();
            connection.setAutoCommit(true); // 恢复默认状态
        }
    } catch (SQLException e) {
        // log error
    }
    
    if (this.sqlSession != null) {
        this.sqlSession.close();
    }
}
```

### 修改二：显式声明游标类型（MLStandardMdtrtDMapper.xml）

```xml
<select id="selectMdtrtDList" resultType="com.yinhai.fcbdst.dataextract.database.model.MLStandardMdtrtDModel"
        resultSetType="FORWARD_ONLY">
    <!-- your SQL -->
</select>
```

- `resultSetType="FORWARD_ONLY"` 杜绝框架将其篡改为滚动游标

### 修改三：保留本地缓存清理

```java
this.sqlSession.clearCache(); // 清理 MyBatis 一级缓存
```

双管齐下：
- **JDBC 层面**：确保 PostgreSQL 使用游标，内存占用极低
- **MyBatis 层面**：清理一级缓存，防止 MyBatis 侧内存膨胀

## 方案评价

| 维度 | 评价 |
|------|------|
| **内存占用** | 极低，轻松跑几千万条数据 |
| **CPU 占用** | 健康，不再出现 1295% 的异常飙升 |
| **事务安全性** | 无大事务困扰，只读取管道设为非自动提交 |
| **框架封装** | 稍显破坏（直接操作原生 Connection），但这是绕过 Spring 代理的必要代价 |
| **可维护性** | 代码注释清晰，后续开发者能理解动机 |

## 原理总结

这是一个**框架设计哲学碰撞**的典型案例，而非 Bug：

1. **MyBatis** 遵循"开发者可控"原则，允许手动关闭自动提交
2. **Spring** 遵循"连接统一生命周期管理"原则，强制接管所有事务状态
3. **两者在无事务边界时产生暗坑**：Spring 将连接原封不动交给 MyBatis，导致 MyBatis 的事务配置被静默忽略

本次修改方案是在这个暗坑里最精准的一把"手术刀"——**仅修改读取管道的连接状态**，既满足了 PostgreSQL 游标的硬性要求，又避免了大事务的副作用。
