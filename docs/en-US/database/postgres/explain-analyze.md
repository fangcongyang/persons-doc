# PostgreSQL EXPLAIN 详解

## 基础用法

```sql
EXPLAIN SELECT * FROM users;
EXPLAIN ANALYZE SELECT * FROM users;
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users;
```

## 节点类型

- Seq Scan: 顺序扫描
- Index Scan: 索引扫描
- Nested Loop: 嵌套循环
- Hash Join: 哈希连接
- Merge Join: 归并连接
- Sort: 排序
- Aggregate: 聚合

## 成本解读

cost=0.00..100.00 rows=1000 width=100

## 缓冲区

Buffers: shared hit=100 read=50

