# 常用命令

## 数据库连接参数

```bash
- reWriteBatchedInserts=true  # 批量插入时，将多个插入语句合并为一个
```

## 用户管理

```sql

// 创建用户
CREATE USER user1 PASSWORD 'password';

// 创建数据库 
CREATE DATABASE testdb OWNER user1;

## 修改pgsql密码
ALTER USER postgres WITH PASSWORD '新密码';
```

## 系统信息查询

```sql
# 查询连接限制和最大连接数
SHOW max_connections;

# 当前数据库的连接限制
SELECT datname AS database_name, datconnlimit AS connection_limit
FROM pg_database
WHERE datname = 'your_database_name';
```

## 数据库信息查询

```sql

#查询所有表信息（排除以pg_, sql_开头的表名）
select relname as tabname,cast(obj_description(relfilenode,'pg_class') as varchar) as comment from pg_class c 
    where relname not like 'pg_%' and relname not like 'sql_%'

#查询具体表的字段信息
SELECT b.attname, b.type, d.description  
    FROM (select a.attnum, a.attrelid,a.attname,concat_ws('',t.typname,SUBSTRING(format_type(a.atttypid,a.atttypmod) from '\(.*\)')) as type
    from pg_class c, pg_attribute a, pg_type t
    WHERE c.relname = #{表名} and a.attnum > 0 and a.attrelid = c.oid and a.atttypid = t.oid ) b LEFT JOIN pg_description d 
    ON d.objoid=b.attrelid and d.objsubid=b.attnum

```

## 数据库性能优化参数

```sql
-- 临时建索引优化参数
SET maintenance_work_mem = '10GB';
SET max_parallel_maintenance_workers = 8;
CREATE INDEX fee_list_d_fixmedins_code_idx ON fee_list_d USING btree (task_exe_log_id, fixmedins_code, mdtrt_sn);

-- 临时查询写入sql优化参数
SET local synchronous_commit = off;
SET max_parallel_workers = 16;
SET max_parallel_workers_per_gather = 8;
insert into middle_library_fee_list_d 
select bkkp_sn, fixmedins_code, fixmedins_name, mdtrt_sn, mdtrt_id, setl_id, fee_ocur_time, rx_drord_no, psn_no, psn_insu_rlts_id, insu_admdvs, pay_loc,
	med_type, cnt, pric, det_item_fee_sumamt, pric_uplmt_amt, selfpay_prop, fulamt_ownpay_amt, overlmt_selfpay, preselfpay_amt, inscp_amt, 
	cvlserv_bedfee_amt, medins_disc_amt, chrgitm_lv, hilist_code, hilist_name, list_type, medins_list_code, medins_list_name, med_chrgitm_type,
	prodname, spec, dosform_name, bilg_dept_code, bilg_dept_name, bilg_dr_code, bilg_dr_name, acord_dept_code, acord_dept_name, acord_dr_code, 
	acord_dr_name, lmt_used_flag, hosp_prep_flag, hosp_appr_flag, tcmdrug_used_way, prodplac_type, bas_medn_flag, hi_nego_drug_flag, prcu_drug_flag,
	chld_medc_flag, etip_flag, etip_hosp_code, dscg_tkdrug_flag, list_sp_item_flag, matn_fee_flag, drt_reim_flag, reim_prop, oprn_oprt_code,
	sin_dos_dscr, used_frqu_dscr, prd_days, medc_way_dscr, memo, vali_flag, updt_time, poolarea_no, rx_circ_flag, dise_code, dise_name, chrg_bchno,
	init_feedetl_sn
from fee_list_d
```

## 数据库状态查询

### 数据库连接数查询

```sql
# 查询当前所有连接数
SELECT COUNT(*) AS total_connections
FROM pg_stat_activity;

# 查询每个数据库的连接数
SELECT datname AS database_name, COUNT(*) AS total_connections
FROM pg_stat_activity
GROUP BY datname
ORDER BY total_connections DESC;

# 查询每个用户的连接数
SELECT usename AS user_name, COUNT(*) AS total_connections
FROM pg_stat_activity
GROUP BY usename
ORDER BY total_connections DESC;
```

### 查询连接状态

状态解释：
+ active：活动连接
+ idle：空闲连接
+ idle in transaction：连接处于事务中，但未执行操作。
+ idle in transaction (aborted)：连接处于事务中，但事务已被中止。
+ disabled：禁用连接

```sql
SELECT state, COUNT(*) AS total_connections
FROM pg_stat_activity
GROUP BY state
ORDER BY total_connections DESC;
```

## 权限管理

```sql
## 赋予用户表操作权限
 grant select,insert,update,delete on {表名} to {用户名};
 
#批量授权某个模式下的所有表
SELECT format('GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE %I.%I TO %I;',
              table_schema, table_name, 'fc_admin')
FROM information_schema.tables
WHERE table_schema = 'dmas_znkf';

#赋予指定模式下所有表的权限
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'dmas_fc_audit' 
    LOOP
        EXECUTE format('GRANT ALL PRIVILEGES ON TABLE dmas_fc_audit.%I TO ylfwzb_rw;', r.tablename);
    END LOOP;
END $$;
```

## 常用函数

```sql
## 字符串切割函数 string_to_array
string_to_array(work_scope, ';');

## sql判断字段值是否包含 any
SD.dict_value = any (string_to_array(work_scope, ';'))  

## NULL转换函数
IFNULL(expr1,expr2)

## 字符串连接函数
-- 函数拼接
concat(expr1, expr2, ...) 
-- ||拼接
'%' || expr1 || '%'


```

## 数据库扩展模块

### pgcrypto

1. 开启数据库加解密模块

:::tip

数据库默认未启用且必须在public模式下开启才可以全局使用

:::

```sql
    //开启加密模块
    create extension pgcrypto;
    //关闭加密模块
    DROP EXTENSION pgcrypto;
```

> 使用示例

```sql
    //加密数据
    SELECT encode(encrypt('{利福平}', {加密密码}, 'aes'), 'hex');
    //解密数据
    select convert_from(decrypt(decode('3b719cc506628ad9c35248b656f7ecb9', 'hex'), {解密密码},'aes'), 'SQL_ASCII');
    //获取UUID
    select gen_random_uuid();
    //获取去掉-的UUID
    select replace(gen_random_uuid()::text, '-', '');
```

### uuid-ossp

1. 安装uuid拓展函数

```sql
    //开启加密模块
    create extension uuid-ossp;
    //关闭加密模块
    DROP EXTENSION uuid-ossp;
```

> 使用示例，v1和v4都可以,v4的效率会慢一点

```sql
    //获取UUID
    select uuid_generate_v1()
    select uuid_generate_v4();
    //获取去掉-的UUID
    select replace(uuid_generate_v4()::text, '-', '');
```

## 数据库高级特性

### 主键冲突更新

主键冲突操作，需注意conflict里面的字段需要建立唯一索引

> 冲突更新

``` sql
ON conflict(id)
DO UPDATE SET group_num = '张三'
```

> 主键冲突不做任何操作

```sql
ON conflict(id) 
DO NOTHINGON conflict(id)
```

## 问题排查

### 数据库连接数过多

1. 查看数据库连接数

```sql
    SELECT datname,numbackends FROM pg_stat_database;
```

2. 查看数据库连接数最多的用户

```sql
    SELECT usename,count(*) FROM pg_stat_activity GROUP BY usename ORDER BY count(*) DESC;
```

### 死锁

1. 查看死锁

```sql
-- 查看死锁进程 未验证
select * from pg_locks where mode='ExclusiveLock' and granted=false;

-- 查看死锁进程 已验证
SELECT 
    pid AS procpid, 
    datname, 
    usename, 
    query, 
    state, 
    wait_event_type, 
    wait_event
FROM 
    pg_stat_activity 
WHERE 
    state IN ('active', 'waiting') 
AND 
    wait_event IS NOT NULL;
```

2. kill掉死锁进程

```sql
-- kill掉死锁进程
select pg_terminate_backend(procpid);
```

### 数据写入方式查看

```sql
SELECT pid, query, state, query_start
FROM pg_stat_activity
WHERE query ~* '^\s*(INSERT|UPDATE|DELETE)'
  AND state = 'active';
```

### sql性能排查

1. 查看sql执行计划

```sql
EXPLAIN ANALYZE
SELECT * FROM employees WHERE department_id = 20;
```

## 常用sql

### 列转行

```sql
SELECT 
    id AS patient_id,
    'discharge' AS type,
    v.disease_id,
    v.disease_name,
    v.is_main
FROM patient_record p
CROSS JOIN LATERAL (
    VALUES
        (dischargeDiseaseIdMain,   dischargeDiseaseNameMain,   true),
        (dischargeDiseaseIdOther1, dischargeDiseaseNameOther1, false),
        (dischargeDiseaseIdOther2, dischargeDiseaseNameOther2, false),
        (dischargeDiseaseIdOther3, dischargeDiseaseNameOther3, false),
        (dischargeDiseaseIdOther4, dischargeDiseaseNameOther4, false),
        (dischargeDiseaseIdOther5, dischargeDiseaseNameOther5, false),
        (dischargeDiseaseIdOther6, dischargeDiseaseNameOther6, false),
        (dischargeDiseaseIdOther7, dischargeDiseaseNameOther7, false),
        (dischargeDiseaseIdOther8, dischargeDiseaseNameOther8, false),
        (dischargeDiseaseIdOther9, dischargeDiseaseNameOther9, false),
        (dischargeDiseaseIdOther10, dischargeDiseaseNameOther10, false),
        (dischargeDiseaseIdOther11, dischargeDiseaseNameOther11, false),
        (dischargeDiseaseIdOther12, dischargeDiseaseNameOther12, false),
        (dischargeDiseaseIdOther13, dischargeDiseaseNameOther13, false),
        (dischargeDiseaseIdOther14, dischargeDiseaseNameOther14, false),
        (dischargeDiseaseIdOther15, dischargeDiseaseNameOther15, false)
) AS v(disease_id, disease_name, is_main)
WHERE v.disease_id IS NOT NULL;
```

### 列拆分

```sql
SELECT 
    id AS patient_id,
    'admission' AS type,
    arr_id[idx] AS disease_id,
    arr_name[idx] AS disease_name,
    (idx = 1) AS is_main
FROM patient_record p
CROSS JOIN LATERAL (
    SELECT 
        string_to_array(admissionDiseaseId, '|')   AS arr_id,
        string_to_array(admissionDiseaseName, '|') AS arr_name
) s
CROSS JOIN LATERAL generate_subscripts(s.arr_id, 1) AS idx
WHERE idx <= array_length(s.arr_name, 1)
```
