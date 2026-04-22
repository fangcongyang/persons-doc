---
sidebar_position: 1
tags: [oracle, database]
---

# oracle

## 命令

### 用户

```sql

- 解锁用户账号
ALTER USER 用户名 ACCOUNT UNLOCK;

- 删除用户
drop user {用户名} cascade;

- 修改用户密码
ALTER USER 用户名 IDENTIFIED BY 新密码;

```

### 数据文件

```sql

# 删除数据文件
alter database tempfile '{数据文件绝对路径}' drop;

# 删除表空间及数据文件
drop tablespace {表空间名} including contents and datafiles;

```

### 分页查询

```sql

-- 方式1
-- 40为pageCurrent * pageSize，30 应为为(pageCurrent - 1) * pageSize
SELECT * FROM  
(  
SELECT A.*, ROWNUM RN  
FROM (SELECT * FROM TABLE_NAME 
      WHERE 1 = 1 -- 条件
      ORDER BY CREATETIME DESC -- 排序
     ) A  
    WHERE ROWNUM <= 40  
 )  
WHERE RN > 30

-- 方式2
SELECT * FROM  
(  
SELECT A.*, ROWNUM RN  
FROM (SELECT * FROM TABLE_NAME) A  
)  
WHERE 30 < RN AND RN <= 40 

```

方法一比方法二效率要高很多，查询效率提高主要体现在 WHERE ROWNUM &lt;= 40 这个语句上。

### 系统信息查询

&gt; 字段注释查询

```sql

select * from user_col_comments a
where Table_Name='这里填表名'
order by column_name

```

## 导入导出

### 导出

```sql

expdp {数据库账号}/\"{数据库密码}\"@{数据库地址}/orclpdb DIRECTORY=DATA_PUMP_DIR dumpfile={备份文件名称}.dump logfile={备份日志名称}.log schemas={备份的模式};

```

### 导入

> Data Pump 导入（推荐）
>
> 如果 .dmp 文件是通过 expdp 导出的，使用 impdp

```sql

impdp user_name/password@database_name DIRECTORY=dpump_dir DUMPFILE=file.dmp LOGFILE=import.log

```

常用参数：

- `DIRECTORY`：数据库中的目录对象
- `DUMPFILE`：导入的 .dmp 文件名
- `LOGFILE`：导入日志文件名
- `SCHEMAS`：导入特定模式
- `TABLES`：导入特定表
- `FULL=Y`：导入整个数据库
- `REMAP_SCHEMA=source:target`：模式映射
- `REMAP_TABLESPACE=source:target`：表空间映射
- `TABLE_EXISTS_ACTION=REPLACE`：表已存在时重创建
- `TABLE_EXISTS_ACTION=SKIP`：表已存在时跳过

示例：

```bash

impdp system/password@orcl DIRECTORY=DATA_PUMP_DIR DUMPFILE=backup.dmp LOGFILE=import.log REMAP_SCHEMA=source_schema:target_schema

```

> 传统导入（适用于 EXP 导出的文件）

```bash

imp user_name/password@database_name file=/path/to/file.dmp log=/path/to/log.log full=y

```

从指定用户导入到目标用户：

```bash

imp system/password file=/backup/db.dmp fromuser=source_user touser=target_user

```

### 环境准备

导入前需要创建表空间、用户并授权：

> 创建表空间

```sql

CREATE TABLESPACE user_tablespace DATAFILE '/path/to/user_tablespace.dbf' SIZE 100M AUTOEXTEND ON;

```

> 创建临时表空间

```sql

CREATE TEMPORARY TABLESPACE user_temp TEMPFILE '/path/to/user_temp.dbf' SIZE 100M AUTOEXTEND ON;

```

> 创建用户

```sql

CREATE USER user_name IDENTIFIED BY password
DEFAULT TABLESPACE user_tablespace
TEMPORARY TABLESPACE user_temp
ACCOUNT UNLOCK;

```

> 授予权限

```sql

-- 基本权限
GRANT CONNECT, RESOURCE TO user_name;
-- 无限表空间限额
GRANT UNLIMITED TABLESPACE TO user_name;
-- 创建视图权限
GRANT CREATE VIEW TO user_name;
-- 创建同义词权限
GRANT CREATE SYNONYM TO user_name;
-- 目录读写权限（Data Pump 必需）
GRANT READ, WRITE ON DIRECTORY dpump_dir TO user_name;

```

> 查询目录对象

```sql

SELECT directory_name, directory_path FROM dba_directories;

```

:::tip
如果管理员用户不能直接登录，需要通过 `sys as SYSDBA` 方式登录
:::

## 表空间查询

### 查看所有表空间

```sql
SELECT tablespace_name, status, contents, extent_management
FROM dba_tablespaces;
```

- `tablespace_name`：表空间名称
- `status`：状态（ONLINE、OFFLINE 等）
- `contents`：内容类型（PERMANENT、TEMPORARY、UNDO）
- `extent_management`：段空间管理类型（LOCAL 或 DICTIONARY）

### 查看表空间大小及使用情况

```sql
SELECT
    tablespace_name,
    ROUND(SUM(bytes) / 1024 / 1024, 2) AS total_size_mb,
    ROUND(SUM(bytes) / 1024 / 1024 -
          SUM(NVL(free_bytes, 0)) / 1024 / 1024, 2) AS used_size_mb,
    ROUND(SUM(NVL(free_bytes, 0)) / 1024 / 1024, 2) AS free_size_mb,
    ROUND((SUM(bytes) - SUM(NVL(free_bytes, 0))) / SUM(bytes) * 100, 2) AS used_percent
FROM (
    SELECT tablespace_name, bytes, 0 AS free_bytes
    FROM dba_data_files
    UNION ALL
    SELECT tablespace_name, 0 AS bytes, bytes AS free_bytes
    FROM dba_free_space
)
GROUP BY tablespace_name;
```

### 查看用户默认表空间

```sql
SELECT username, default_tablespace, temporary_tablespace
FROM dba_users
WHERE username = 'USER_NAME';
```

### 查看表空间的数据文件

```sql
SELECT tablespace_name, file_name, bytes / 1024 / 1024 AS size_mb
FROM dba_data_files
WHERE tablespace_name = 'TABLESPACE_NAME';
```

### 查看特定表空间中的表

```sql
SELECT owner, table_name
FROM dba_tables
WHERE tablespace_name = 'TABLESPACE_NAME';
```

## Data Pump 常见问题

### 目录名无效（ORA-39087）

当报错提示目录名无效时，按以下步骤排查：

#### 1. 确保目录对象已创建

Data Pump 使用目录对象而非直接文件系统路径：

```sql
CREATE OR REPLACE DIRECTORY dpump_dir AS 'C:\software\app\admin\orcl\dpdump\';
GRANT READ, WRITE ON DIRECTORY dpump_dir TO system;
```

- `dpump_dir` 是目录对象名称
- 路径使用单斜杠 `/` 或双反斜杠 `\\`

#### 2. 验证目录对象

```sql
SELECT directory_name, directory_path
FROM dba_directories
WHERE directory_name = 'DPUMP_DIR';
```

检查 `directory_name` 和 `directory_path` 是否正确。

#### 3. 确保路径可访问

- 确保 Oracle 服务运行用户对目录有读写权限
- Windows 上右键目录 -> 安全 -> 为 Oracle 服务用户添加完全控制

#### 4. impdp 命令中使用目录对象名

```bash
impdp system/password@orcl DIRECTORY=dpump_dir DUMPFILE=backup.dmp LOGFILE=import.log
```

:::tip
DIRECTORY 参数的值是目录对象名称（如 `dpump_dir`），而非实际文件路径。
:::

### 其他导入常见问题

| 问题 | 解决方案 |
|------|----------|
| 权限不足 | `GRANT READ, WRITE ON DIRECTORY dpump_dir TO user_name;` |
| 字符集不一致 | 查询 `SELECT * FROM nls_database_parameters WHERE parameter LIKE 'NLS_CHARACTERSET';` |
| 表已存在 | 添加 `TABLE_EXISTS_ACTION=REPLACE` 或 `TABLE_EXISTS_ACTION=SKIP` |
| IMP 与 IMPDP 不兼容 | 确认导出工具（EXP 用 IMP，EXPDP 用 IMPDP） |

## 常见问题

:::tip
windows cmd启动jar包，用户名中文导致数据库连接不上
:::

```bash
启动时加上参数：-Duser.name=user
```
