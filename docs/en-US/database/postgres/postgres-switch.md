# PostgreSQL 切换数据库、切换模式 完整用法

> **pg 元命令说明**：本文中 `\c` `\l` `\dn` 为 psql 客户端元命令，在 SQL 终端（如 pgAdmin、DBeaver）不可用；`SET search_path` 等为标准 SQL，所有客户端通用。

PostgreSQL 里有两个层级：**数据库（Database）** 和 **模式（Schema）**，切换方式完全不同，本文整理最实用、最常用的命令，直接复制就能用。

---

## 一、切换 数据库（Database）

**必须重新连接**，不能在一个连接里直接切库。

### 1. psql 命令行切换数据库

```sql
\c 数据库名
```

或全称：

```sql
\connect 数据库名
```

示例：

```sql
\c mydb
-- 或完整写法
\connect mydb
```

### 2. 通过连接串切库（host 指定方式）

```bash
# 连接时直接指定目标库
psql "host=localhost dbname=mydb user=postgres"
# 连接后切库仍用 \c
\c another_db
```

### 3. 带用户名切换

```sql
\c 数据库名 用户名
```

---

## 二、切换 模式（Schema）

模式是**数据库内部的命名空间**，可以直接切换，不用重连。

### 1. 临时切换当前会话的模式（最常用）

```sql
SET search_path TO 模式名;
```

示例：

```sql
SET search_path TO public;
SET search_path TO my_schema;
```

### 2. 同时指定多个模式（按顺序查找）

```sql
SET search_path TO schema1, schema2, public;
```

### 3. 永久切换（当前数据库、当前用户）

```sql
ALTER ROLE 当前用户名 SET search_path TO 模式名;
```

### 4. 查看当前 search_path 值

```sql
SHOW search_path;
```

---

## 三、最常用查询（必记）

### 查看当前数据库

```sql
SELECT current_database();
```

### 查看当前模式

```sql
SELECT current_schema();
```

### 查看所有数据库

```sql
\l
```

### 查看所有模式

```sql
\dn
```

---

## 四、快速记忆口诀

- **切数据库**：`\c dbname`
- **切模式**：`set search_path to schemaname`
- **查当前在哪**：`select current_database(), current_schema();`

---

### 总结

1. **数据库** 是独立实例，必须用 `\c` 重连切换
2. **模式** 是库内目录，用 `SET search_path` 直接切换
3. 日常操作优先用 **临时切换模式**，最安全方便
