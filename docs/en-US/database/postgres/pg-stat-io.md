# PostgreSQL `pg_stat_io` 深入分析与性能调优指南

本文档详细介绍 PostgreSQL 16+ 引入的 `pg_stat_io` 视图，包括：

- 整体特征总结与实例 I/O 模式诊断
- 高风险点识别与性能瓶颈分析
- 完整的字段解释与使用方法
- 常用分析 SQL 示例

---

## 一、整体结构观察总结（高层视角）

### 1. 大量 I/O 发生在 client backend 的 normal / bulkread

**`client backend | relation | bulkread`**：
- `reads` = **841M**
- `hits` = **75M**
- `evictions` = **16M**
- `reuses` = **827M**

**`client backend | relation | normal`**：
- `reads` = **844M**
- `hits` = **26,828M（2.6 亿）**
- `writes` = **404M**
- `extends` = **212M**

➡️ **业务产生极大数据量的 heap I/O（读 + 写）**

---

### 2. autovacuum worker I/O 也非常巨大

**autovacuum worker | vacuum**：
- `reads` = **186M**
- `writes` = **160M**
- `reuses` = **186M**

➡️ 表明数据库存在 **空间膨胀 / 垃圾堆积严重**，autovacuum 不断处理

---

### 3. background worker 的 bulkread 也非常高

**background worker | bulkread**：
- `reads` = **332M**

➡️ 有大量后台任务（可能是 logical decoding、extension、CDC、job worker）在做顺序读

---

### 4. checkpointer / background writer 写入非常高

- background writer writes = **83M**
- checkpointer writes = **118M**
- checkpointer fsyncs = **190k**

➡️ 系统写 I/O 压力持续偏高

---

## 最大的异常：所有 time 字段几乎都是 0

包括：
- `read_time`
- `write_time`
- `writeback_time`
- `extend_time`
- `fsync_time`

但 `reads` / `writes` 都是 **百万、千万、亿级**。

### 原因：尚未开启 I/O timing（`track_io_timing = on`）

PostgreSQL 只有开启这个参数才会记录真实的 I/O 时间。

否则：
- 所有 `read_time` / `write_time` 显示 0
- `pg_stat_io` 无法反映 I/O 性能
- 只能看次数，不能做性能诊断

### 确认方法：

```sql
SHOW track_io_timing;
```

建议开启：

```sql
ALTER SYSTEM SET track_io_timing = on;
SELECT pg_reload_conf();
```

---

## 二、深入分析（在没 I/O 时间的情况下）

### 二-1. client backend 的 normal / bulkread 读写量非常巨大

| 指标        | 数值                 |
| --------- | ------------------ |
| `reads`   | **844,666,846**    |
| `writes`  | **404,579,364**    |
| `extends` | **212,802,701**    |
| `hits`    | **26,828,461,848** |
| `evictions` | **1,051,905,558**  |

**解释：**

1. **读写总量巨大，属于大型 OLTP+OLAP 混合业务**
   - read/write 都是亿级
   - hits 高达 **268 亿**

2. **`evictions` = 10.5 亿**
   - 说明 `shared_buffers` 太小
   - 访问数据集远大于 `shared_buffers`
   - 需要更多内存或更大 `shared_buffers`

---

### 二-2. bulkread 读量巨大（841M）

**client backend | bulkread**：
- `reads`: **841M**
- `reuses`: **827M**

`bulkread` 通常只在：
- 顺序扫描（Seq Scan）
- 扫描大表
- 聚合、JOIN 大表
- parallel worker

**说明：SQL 中存在大量大表顺序扫描**

特别是：
- 缺少 WHERE 条件
- 索引不匹配
- 多表 JOIN

---

### 二-3. client backend 的 extend 也非常巨大（212M）

意味着：
- 表频繁扩容（大量 INSERT）
- 大表频繁增长

典型场景：
- 日志表每日写入量大
- 统计表或交易流水
- 未使用 partition，导致表无限增长

---

### 二-4. autovacuum worker 的 vacuum I/O 极大（186M reads）

**autovacuum worker | vacuum**：

| 指标     | 数值       |
| ------ | -------- |
| `reads`  | **186M** |
| `writes` | **160M** |
| `reuses` | **186M** |

➡️ 大型表膨胀严重，autovacuum 正在不停清理。

**反映：表有大量 UPDATE / DELETE，或者死元组膨胀严重**

---

### 二-5. checkpointer 写入巨大（118M）

**checkpointer**：
- `writes` = **118M**
- `fsyncs` = **190k**

➡️ checkpoint 压力大，会造成：
- 后台写入风暴（WAL flush）
- 查询延迟抖动
- 磁盘随机 I/O 增加

这是典型的：
- 大量 INSERT / UPDATE
- autovacuum intense
- `shared_buffers` 不够大
- checkpoint 太频繁

---

## 三、综合诊断：你的数据库是一种什么负载？

结合所有数据：

### 特征 1：读写量极大（OLTP 负载）
- 每天亿级读写
- 大表持续增长（extend 200M）
- checkpoints 频繁写入

### 特征 2：查询扫描大量 tuple（部分 OLAP）
- bulkread 841M（顺序扫描）
- background worker bulkread 332M

### 特征 3：autovacuum 高强度运行
- vacuum reads 186M
- writes 160M

### 特征 4：shared_buffers 压力极大
- evictions = 1,051,905,558
- reuses = 827M

### 特征 5：巨大 I/O 但无 I/O 时间 → track_io_timing 未开

---

## 四、你的实例可能存在的瓶颈（按严重程度排序）

### 1. `shared_buffers` 明显过小

`evictions` = **10.5 亿** 是极高的指标。

**建议：**
```
shared_buffers = 25% 内存
```

---

### 2. autovacuum 负载过高

vacuum I/O 量超过 3 亿。

说明：
- 表膨胀严重
- 更新/删除太多
- autovacuum 不够 aggressive

**建议开启：**
```
autovacuum_vacuum_scale_factor = 0.02
autovacuum_analyze_scale_factor = 0.01
```

并考虑 **分区表**。

---

### 3. checkpoint 写压力高

checkpointer 写 118M + fsync 190k

**建议：**
```
max_wal_size = 10GB 或以上
checkpoint_timeout = 20min
checkpoint_completion_target = 0.9
```

---

### 4. SQL 大表扫描过多（Seq Scan）

bulkread 巨大 → 未命中索引的查询很多。

应该：
- 检查 slow query log
- 建索引
- 使用 partition

---

### 5. `track_io_timing` 未开，无法分析 I/O 性能

**第一步最重要：**
```sql
ALTER SYSTEM SET track_io_timing = on;
SELECT pg_reload_conf();
```

---

## 五、`pg_stat_io` 超详细解释

### 5.1 `pg_stat_io` 是什么？

`pg_stat_io` 是 PostgreSQL 16 引入的新视图，专门用于监控数据库的 **I/O 行为**，比过去的 `pg_stat_bgwriter` 等要更加精细全面。

它按以下维度进行分类统计：
- **后端类型**（backend type）
- **I/O 类型**（read/ write/ extend/ fsync）
- **对象类型**（relation/file type）
- **I/O channel**

📌 目标是让你能看清楚：
- 是谁在读（backend / autovacuum / background worker）
- 读什么类型（buffered read、direct read、wal write…）
- 读哪个对象（heap、index、FSM、VM、WAL…）
- 等待了多久（等待 OS I/O、等待锁…）
- 发起多少系统调用（pread / pwrite 等）

---

### 5.2 `pg_stat_io` 核心字段详细解释

#### 5.2.1 `backend_type`

表示是哪种进程在发起 I/O：

| backend_type            | 意义               |
| ----------------------- | ---------------- |
| `client backend`        | 普通 SQL 会话（查询、更新） |
| `autovacuum worker`     | 自动 VACUUM 进程     |
| `autovacuum launcher`   | VACUUM 调度器       |
| `checkpointer`          | checkpoint 进程    |
| `background writer`     | 写缓冲脏页的后台进程       |
| `walwriter`             | 写 WAL 的进程        |

---

#### 5.2.2 `object`

表示 I/O 作用的对象类型：

| object            | 说明                   |
| ----------------- | -------------------- |
| `relation`        | 普通表、索引               |
| `smgr`            | 存储管理层（rare）          |
| `temp relation`   | 临时表                  |
| `wal`             | WAL 文件               |
| `other`           | 不属于上述对象，如控制文件、clog 等 |

---

#### 5.2.3 `context`（关键）

表示 I/O 某种语义上下文：

| context          | 意义                        |
| ---------------- | ------------------------- |
| `normal`         | 正常读写 buffer 的 I/O         |
| `bulkread`       | 顺序大块读（VACUUM、顺序扫描）        |
| `bulkwrite`      | 顺序写（COPY、VACUUM truncate） |
| `vacuum`         | VACUUM 特殊 I/O             |
| `bgwriter`       | 后台写脏页                     |
| `checkpointer`   | checkpoint 强制写            |
| `wal`            | WAL 写入                    |

---

#### 5.2.4 `io_operation`（核心字段）

表示具体的 I/O 类型：

| io_operation  | 含义                  |
| ------------- | ------------------- |
| `read`        | 从 OS 读取数据页          |
| `write`       | 写 OS（flush 不一定）     |
| `extend`      | 扩张 relation（增大文件）   |
| `fsync`       | 执行 fsync（强制落盘）      |
| `prefetch`    | 请求预读（posix_fadvise） |
| `writeback`   | 后台 write-back       |

**注意：write ≠ 落盘！只有 fsync 才是 durable。**

---

#### 5.2.5 `io_object`（PostgreSQL 16 特有）

比 `object` 更细：

| io_object | 说明             |
| --------- | -------------- |
| `heap`    | 表页             |
| `index`   | 索引页            |
| `toast`   | toast table    |
| `vm`      | Visibility Map |
| `fsm`     | Free Space Map |
| `wal`     | WAL            |

---

#### 5.2.6 read/write metrics

| 指标       | 说明             |
| -------- | -------------- |
| `reads`  | 读取次数           |
| `writes` | 写入次数           |
| `extends`| 文件"扩展写"的次数（新增文件块） |

---

#### 5.2.7 timing 系列（I/O 性能瓶颈分析关键）

| 字段              | 含义             |
| --------------- | -------------- |
| `read_time`     | 真实 read 时间（ms） |
| `write_time`    | write 系统调用时间   |
| `extend_time`   | extend 操作花费时间  |
| `fsync_time`    | fsync 操作耗时     |

---

#### 5.2.8 wait_event 系列

| 字段                   | 描述               |
| -------------------- | ---------------- |
| `read_wait_time`     | 读操作等待 OS I/O 的时间 |
| `write_wait_time`    | 写等待时间            |
| `extend_wait_time`   | 扩容操作等待           |
| `fsync_wait_time`    | fsync 等待         |

**重要区分：**
- `read_time` 表示系统调用内部的执行时间
- `read_wait_time` 是等待队列 + 排队时间

这两个结合起来可以判断：
- 是磁盘慢（`read_time` 高）
- 还是 I/O 队列堵塞（`wait_time` 高）

---

### 5.3 为什么 PostgreSQL 需要 `pg_stat_io`？

**原因：**
- 过去无法区分谁在导致 I/O 压力
- 无法区分 buffer read 与 direct read
- 无法看到 extend 和 fsync 的时间
- 无法分析 autovacuum 造成的 I/O 抖动
- checkpoint 对写 I/O 的影响更不透明

**现在：**
✔ 能看到 autovacuum 是否造成大量随机读
✔ 能看到 checkpoint 是否引发写入风暴
✔ 能量化 fsync 的性能瓶颈
✔ 能区分 heap/index/VM/FSM 的读写情况

---

### 5.4 如何使用 `pg_stat_io` 定位 I/O 瓶颈？

#### 5.4.1 识别 read I/O 过高（缓存不足）

```sql
SELECT backend_type, io_operation, io_object,
       reads, read_time, read_wait_time
FROM pg_stat_io
WHERE reads > 0
ORDER BY read_time DESC
LIMIT 20;
```

如果：
- `client backend + read + heap` 高 → 缓存不足
- `autovacuum worker + read` 高 → autovacuum 在扫描大表导致 I/O 压力

---

#### 5.4.2 识别 fsync 写瓶颈（磁盘落盘慢）

```sql
SELECT backend_type, fsyncs, fsync_time, fsync_wait_time
FROM pg_stat_io
WHERE fsyncs > 0
ORDER BY fsync_time DESC;
```

如果 checkpoint、walwriter 的 fsync 特别高 → I/O 设备不够快。

---

#### 5.4.3 识别 checkpoint 写入风暴

```sql
SELECT *
FROM pg_stat_io
WHERE backend_type = 'checkpointer'
ORDER BY write_time DESC;
```

checkpoint 写脏页会导致：
- flush storm（写入风暴）
- query 延迟抖动

---

#### 5.4.4 找出磁盘瓶颈是 I/O 等待还是系统调用慢？

判断方法：
- **`read_wait_time` >> `read_time` → 队列排队导致慢**
- **`read_time` >> `read_wait_time` → 磁盘本身慢**

---

### 5.5 和其他 pg_stat 视图的区别

| 视图                    | 功能                           | 粒度  |
| --------------------- | ---------------------------- | --- |
| `pg_stat_io`          | PostgreSQL 16+ 新版，细粒度 I/O 统计 | ⭐最细 |
| `pg_stat_bgwriter`    | 只能看到后台写 I/O                  | 粗   |
| `pg_stat_database`    | 提供 blks_read / blks_hit      | 较粗  |
| `pg_statio_user_tables` | 表级别统计                        | 表级  |

---

### 5.6 常用完整示例：最常查的 I/O 热点分析表

获取所有 I/O 热点（按总耗时排序）：

```sql
SELECT backend_type, context, io_operation, io_object,
       reads, read_time,
       writes, write_time,
       fsyncs, fsync_time
FROM pg_stat_io
ORDER BY (read_time + write_time + fsync_time) DESC
L