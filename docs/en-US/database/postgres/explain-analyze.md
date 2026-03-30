# PostgreSQL EXPLAIN 详解

## 基础用法

```sql
EXPLAIN SELECT * FROM users;
EXPLAIN ANALYZE SELECT * FROM users;
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users;
EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT JSON) SELECT * FROM users;
```

## 节点类型详解

### 扫描节点
- **Seq Scan**: 顺序扫描（全表扫描），从头到尾读取整个表
  - 适用场景：小表、没有合适索引、查询返回大部分数据
  - 性能特征：数据量越大越慢

- **Index Scan**: 索引扫描，通过索引查找数据
  - 适用场景：查询条件有合适索引，返回少量数据
  - 特点：需要回表（除了覆盖索引）

- **Index Only Scan**: 仅索引扫描，不需要回表
  - 适用场景：查询的列都在索引中
  - 特点：性能最优，直接从索引获取数据

- **Bitmap Index Scan + Bitmap Heap Scan**: 位图扫描
  - 适用场景：多个索引条件组合、范围查询
  - 特点：先构建位图，再批量读取堆表

### 连接节点
- **Nested Loop**: 嵌套循环连接
  - 适用场景：外表小、内表有索引
  - 算法：对外表每一行，在内表中查找匹配行

- **Hash Join**: 哈希连接
  - 适用场景：大表连接、没有合适索引
  - 算法：构建哈希表 → 探测匹配

- **Merge Join**: 归并连接
  - 适用场景：两个表都按连接键排序
  - 算法：同时遍历两个有序表，匹配连接

### 其他节点
- **Sort**: 排序操作
  - 注意：内存排序 vs 磁盘排序（EXPLAIN 会显示 `Sort Method: External Merge Disk: NkB`）

- **Aggregate**: 聚合操作（SUM/COUNT/AVG 等）
  - HashAggregate: 基于哈希的聚合
  - GroupAggregate: 基于排序的分组聚合

- **Limit**: 限制返回行数
- **Unique**: 去重操作
- **CTE Scan**: 通用表表达式扫描
- **Subquery Scan**: 子查询扫描

## 成本解读

```
Seq Scan on users  (cost=0.00..100.00 rows=1000 width=100)
```

- **cost=0.00..100.00**: 
  - 第一个数字：启动成本（获取第一行前的成本）
  - 第二个数字：总成本（获取所有行的成本）
  - 成本单位：抽象单位，受 `cpu_tuple_cost`、`seq_page_cost` 等参数影响

- **rows=1000**: 预计返回行数（基于统计信息估算）

- **width=100**: 每行平均宽度（字节）

## 实际执行时间（ANALYZE）

```
Seq Scan on users  (cost=0.00..100.00 rows=1000 width=100)
                         (actual time=0.010..0.500 rows=1000 loops=1)
```

- **actual time=0.010..0.500**: 
  - 第一个数字：获取第一行的实际时间（毫秒）
  - 第二个数字：获取所有行的实际时间（毫秒）

- **rows=1000**: 实际返回行数

- **loops=1**: 该节点执行次数

## 缓冲区统计（BUFFERS）

```
Buffers: shared hit=100 read=50 dirtied=10 written=5
```

- **shared hit**: 共享缓冲区命中数（从内存读取）
- **read**: 磁盘读取数
- **dirtied**: 修改的缓冲区数
- **written**: 写回磁盘的缓冲区数

**关键指标**：
- 缓存命中率 = hit / (hit + read)
- 命中率越高越好，理想情况 > 99%

## 完整示例分析

### 示例 1：简单查询

```sql
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM users WHERE id = 1;
```

**执行计划**：
```
Index Scan using users_pkey on users  (cost=0.43..8.45 rows=1 width=100)
                                      (actual time=0.020..0.021 rows=1 loops=1)
  Index Cond: (id = 1)
Buffers: shared hit=3
Planning Time: 0.100 ms
Execution Time: 0.050 ms
```

**分析**：
- 使用主键索引扫描，性能很好
- 缓存命中 3 个块
- 总执行时间 0.05ms

### 示例 2：连接查询

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT u.name, o.amount 
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.id < 100;
```

**执行计划**：
```
Nested Loop  (cost=0.43..100.00 rows=50 width=40)
             (actual time=0.020..0.500 rows=50 loops=1)
  ->  Index Scan using users_pkey on users u  (cost=0.43..8.45 rows=10 width=20)
                                           (actual time=0.010..0.020 rows=10 loops=1)
        Index Cond: (id < 100)
  ->  Index Scan using orders_user_id_idx on orders o  (cost=0.43..9.00 rows=5 width=20)
                                                      (actual time=0.010..0.020 rows=5 loops=10)
        Index Cond: (user_id = u.id)
Buffers: shared hit=100
```

**分析**：
- 使用 Nested Loop 连接
- 外表 users 返回 10 行，内表 orders 循环执行 10 次
- 每次内表返回 5 行，总共 50 行

## 性能优化建议

### 常见问题识别

1. **Seq Scan 大表**
   - 问题：全表扫描大数据量
   - 解决：添加合适索引

2. **Sort Method: External Merge Disk**
   - 问题：排序溢出到磁盘
   - 解决：增加 `work_mem` 参数

3. **rows 估算差异大**
   - 问题：estimated rows 和 actual rows 相差很大
   - 解决：运行 `ANALYZE table_name;` 更新统计信息

4. **Buffers read 很高**
   - 问题：大量磁盘读取
   - 解决：增加 `shared_buffers`，优化索引

### 实用命令

```sql
-- 更新统计信息
ANALYZE users;

-- 查看表大小
SELECT pg_size_pretty(pg_total_relation_size(users));

-- 查看索引大小
SELECT pg_size_pretty(pg_relation_size(users_pkey));

-- 查看表和索引的缓存命中率
SELECT 
  relname,
  heap_blks_hit,
  heap_blks_read,
  idx_blks_hit,
  idx_blks_read
FROM pg_statio_user_tables 
WHERE relname = users;
```

## EXPLAIN 选项完整列表

| 选项 | 说明 |
|------|------|
| ANALYZE | 实际执行查询，获取真实时间 |
| BUFFERS | 显示缓冲区使用统计 |
| VERBOSE | 显示更多详细信息 |
| COSTS | 显示成本估算（默认 on） |
| SETTINGS | 显示相关配置参数 |
| FORMAT TEXT/XML/JSON/YAML | 输出格式 |
| WAL | 显示 WAL 相关信息（13+） |
| TIMING | 显示计时信息（默认 on） |
| SUMMARY | 显示总结信息（默认 on） |
