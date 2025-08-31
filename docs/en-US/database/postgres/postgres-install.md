# pgsql

## 安装

[安装文件下载地址](https://yum.postgresql.org/rpmchart/)

### 源码安装启停

```sh
- 启动命令：pg_ctl start -D {数据保存路径}
- 停止命令：pg_ctl stop -D {数据保存路径}
```

### rpm安装启停

```sh
- 启动命令：systemctl start postgresql-{安装版本}
- 停止命令：systemctl stop postgresql-{安装版本}
- 禁用自启动：systemctl disable postgresql-{安装版本}
- 启用自启动服务：systemctl enable postgresql-{安装版本}
```

## 参数优化

### 内存管理

+ shared_buffers
    + 含义：共享内存缓冲区大小，默认128MB
    + 建议值：建议设置为物理内存的25%
+ work_mem 工作内存大小，默认4MB
    + 含义：指定每个查询操作（如排序、哈希连接）允许使用的内存大小
    + 建议值：取决于查询的复杂性。可以根据每个查询的需求调整，通常从 16MB 到 128MB。
+ maintenance_work_mem 维护工作内存大小，默认64MB
    + 含义：维护操作（如VACUUM、CREATE INDEX）允许使用的内存大小
    + 建议值：通常设置为 1-2 GB，特别是如果数据库有频繁的索引重建或清理操作。
+ effective_cache_size 
    + 含义：估算系统可用的缓存大小，影响查询计划选择。它帮助 PostgreSQL 的查询优化器判断索引是否有效。
    + 建议值：数据库缓存的大小，建议设置为物理内存的 50~75%

### 并发控制和连接管理

+ max_connections 
    + 含义：指定允许的最大数据库连接数。过多的连接会增加上下文切换和内存占用。
    + 建议值：设置为合理的连接数，不宜过大。可以使用连接池工具（如 PgBouncer）来管理连接数。
+ max_worker_processes 最大工作进程数，默认8
    + 含义：最大并发工作进程数，影响并行查询的能力。
    + 建议值：根据系统的CPU核心数设置，例如，如果有 8 核CPU，可以将此值设置为 8 或更高。
+ max_parallel_workers_per_gather 每个Gather节点最大并行工作进程数，默认2
    + 含义：设置并行查询时每个查询操作允许的最大工作进程数。
    + 建议值：通常设置为 2-4（如果你的数据库工作负载支持并行查询）。

### 磁盘 I/O 和写操作优化

+ wal_buffers
    + 含义：用于存储待写入 WAL (Write-Ahead Logging) 日志的缓冲区大小。适用于高写入负载的系统。
    + 建议值：一般设置为 16MB 或更高。
+ checkpoint_segments
    + 含义：控制 PostgreSQL 在执行写入操作时需要刷新 checkpoint 的频率。较高的值可以减少 checkpoint 操作的频繁性，但也会增加数据库恢复时的恢复时间。
    + 建议值：建议设置为 16-64（具体依据负载调整）。
+ checkpoint_completion_target
    + 含义：控制 checkpoint 完成的目标时间（即 checkpoint 操作的密集度）。
    + 建议值：通常设置为 0.9 或更高，这样可以使 checkpoint 分布更加平滑。

### 查询优化和计划选择

+ random_page_cost
    + 含义：估算随机磁盘页面访问的成本，用于查询优化器的决策。
    + 建议值：通常设置为 1.1 - 2.0（在现代硬盘上），在 SSD 上可以设为 1.0。
+ seq_page_cost
    + 含义：估算顺序磁盘页面访问的成本。
    + 建议值：通常设置为 1.0，表示顺序扫描和随机访问的成本是一样的。
+ effective_io_concurrency
    + 含义：允许的 I/O 并发数量，通常在使用SSD时需要调整这个参数来提高性能。
    + 建议值：如果使用 SSD 存储，可以设置为 200-400。

### 日志和监控

+ log_min_duration_statement
    + 含义：记录执行时间超过指定值的语句的日志。
    + 建议值：根据需要设置，例如 1000 毫秒（1 秒）。
+ log_statement
    + 含义：控制日志记录哪些 SQL 语句，none、ddl、mod、all。
    + 建议值：根据需要设置，例如 ddl、mod、all。一般设置为 mod，记录所有修改操作的语句。

## 导出与导入

· 导出数据库

> 参数说明

+ -F p 导出为纯文本格式
+ -n public 导出public schema下的所有对象
+ -f /data/master/dump.sql 导出文件路径
+ --data-only 只导出数据，不导出表结构
+ --no-comments 不导出注释
+ --no-tablespaces 不导出表空间

:::tip

导出时，建表等操作会带上schena信息，导入时如需指定schena请手动处理

:::

```sh
pg_dump -U postgres -h 127.0.0.1 -p 5432 -d postgres -n public -f /data/master/dump.sql
```

· 导入数据库

> 参数说明

+ --no-owner 不导入所有者信息
+ --role=username 导入时指定角色

```sh
pg_restore -U postgres -h 127.0.0.1 -p 5432 -d postgres -f /data/master/dump.sql
```

## 常见问题

### must be superuser to alter replication roles or change replication attribute

postGIS修改密码，没有超管权限，导致报错ERROR: must be superuser to alter replication roles or change replication attribute。很多解决方案修改 pg_hba.conf配置文件，把所有的md5改为trust,该方案尝试后，仍然无效。具体原因不详，但是在执行以下命令后，仍然提示需要超管权限，并且执行命令前修改的配置文件又变回MD5。

```bash

执行命令
su - postgres
psql -p 5432 -U postgres
ALTER USER postgres WITH PASSWORD 'xxx';

执行后仍然报错
ERROR:  must be superuser to alter replication roles or change replication attribute
并且改为trust的值，自动还原为md5了

```

- 配置文件部分内容

```bash

host    all             all             ::1/128                 trust
host    all             all              0.0.0.0/0             md5 
# Allow replication connections from localhost, by a user with the
# replication privilege.
local   replication     all                                             trust
host    replication     all             127.0.0.1/32            trust

```

- 解决方法

1. 停止postGIS服务，使用以下命令启动postGIS

```bash
执行以下命令
/home/data/app/postgres/app/bin/postgres  postGIS可执行文件
--single  模式
-D /data/master 数据目录
/home/data/app/postgres/app/bin/postgres --single -D /data/master
进入single模式，执行相应的命令
修改账户为超管
 ALTER USER postgres WITH SUPERUSER;
修改账户密码
ALTER USER postgres WITH PASSWORD 'xxx';

```

命令执行结束后，也没搞清如何退出，是不是需要刷新权限等，比如flush privilege。关闭当前窗口退出。

2. 重新启动postGIS服务，发现修改成功了

:::tip

如果修改不生效，很有可能就是修改后需要刷新权限，此时重新修改，输入flush privilege命名，但是会报错，然后在重新关闭。

:::