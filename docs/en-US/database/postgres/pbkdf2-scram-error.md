# PostgreSQL "unsupported PBKDF2 for SCRAM-SHA-256" 错误解决方案

## 错误说明

错误信息 **"unsupported PBKDF2 for SCRAM-SHA-256"** 表示系统或软件组件试图使用基于 **PBKDF2 的 SCRAM-SHA-256** 身份验证机制，但当前环境并不支持它。

这个错误通常出现在：
- PostgreSQL 客户端/驱动不支持 SCRAM-SHA-256
- OpenLDAP 或其他认证系统配置了不支持的 PBKDF2 SCRAM-SHA-256
- 第三方库依赖的 OpenSSL 版本不支持 PBKDF2 SCRAM

## 常见场景与解决办法

### 1. PostgreSQL 客户端/驱动不支持 SCRAM-SHA-256

如果你连接的是 PostgreSQL 数据库，可能是使用的客户端或驱动不支持 `SCRAM-SHA-256` 加密算法。

**解决方案：**

- **升级数据库客户端/驱动：**
  - Python：升级 `psycopg2` 到最新版（`>=2.8` 支持 SCRAM-SHA-256）
  - Java：升级 JDBC 驱动版本（建议使用 PostgreSQL JDBC Driver 42.2.5 以上）
  - Node.js：升级 `pg` 模块到最新版

- **回退 PostgreSQL 用户的加密方法为 `md5`（不推荐用于生产）：**
  ```sql
  ALTER USER your_user WITH PASSWORD your_password;
  ```
  PostgreSQL 会自动使用 `md5` 加密（除非显式配置了 `password_encryption = scram-sha-256）

### 2. OpenLDAP 或其他认证系统配置问题

某些认证服务（如 OpenLDAP、SASL 或 Kerberos）在配置中启用了 PBKDF2 作为 SCRAM-SHA-256 的 KDF，但客户端不支持这种扩展。

**解决方案：**
- 检查服务端的认证配置是否启用了非标准 KDF
- 使用标准的 SCRAM-SHA-256（非 PBKDF2）或兼容机制

### 3. OpenSSL 版本问题

某些语言的安全库依赖 OpenSSL，如果系统 OpenSSL 版本较老，可能缺失某些支持。

**解决方案：**
- 升级 OpenSSL 到较新的版本（如 1.1.1+）
- 检查库是否有可选编译支持 PBKDF2 的特性标志（如 `with-scram`）

## 检查 PostgreSQL 当前加密算法

运行以下 SQL 来查看用户的密码加密方式：

```sql
SELECT usename, passwd FROM pg_shadow;
```

- `md5`：传统加密
- `SCRAM-SHA-256$...`：新加密算法

## JDBC 驱动特定问题

如果你已经使用了 **支持 SCRAM-SHA-256 的 JDBC 驱动（42.2.5 及以上），但仍然出现错误：

> **"unsupported PBKDF2 for SCRAM-SHA-256"**

这说明 PostgreSQL 用户的密码不是标准的 SCRAM-SHA-256，而是一个 PostgreSQL 服务端 **非默认开启的"PBKDF2 强化版本"**（这是个增强机制，但并非所有客户端都支持它，包括部分 JDBC 实现）。

### 原因分析

从 PostgreSQL 14 开始，服务端支持 `PBKDF2` 加强的 SCRAM-SHA-256，但客户端 JDBC 驱动（即使支持 SCRAM）并**不一定支持 PBKDF2 派生方式的 SCRAM**。因此当密码用了 `PBKDF2` 加密后，JDBC 就可能报这个错误。

### 最佳解决方法（重设为标准 SCRAM）

#### 方法：重置密码为标准 SCRAM-SHA-256

你可以这样做，强制 PostgreSQL 使用标准 SCRAM 而非 PBKDF2 版本：

**步骤：**

1. **在 `postgresql.conf` 中配置：**
   ```conf
   password_encryption = scram-sha-256
   ```

2. **重启 PostgreSQL 服务**

3. **用 SQL 重设用户密码（重点步骤）：**
   ```sql
   ALTER ROLE your_user WITH PASSWORD your_password;
   ```

这会使用标准 SCRAM-SHA-256（不是 PBKDF2 的变种），JDBC 驱动就可以正常登录了。

### 验证加密方式

运行以下 SQL（用超级用户）确认密码格式：

```sql
SELECT usename, passwd FROM pg_shadow WHERE usename = your_user;
```

示例结果说明：

| passwd 前缀                      | 意义                           |
| ------------------------------ | ---------------------------- |
| `md5...`                       | 使用了 md5                      |
| `SCRAM-SHA-256$...`（不含 PBKDF2） | 标准 SCRAM                     |
| `SCRAM-SHA-256$pbkdf2$...`     | 加了 PBKDF2 的扩展版本（JDBC 可能不支持）❌ |

## 关于 `scram-sha-256+pbkdf2` 的说明

### 当前限制

**Java PostgreSQL 官方 JDBC 驱动（包括最新版本）并不支持 `PBKDF2` SCRAM 扩展**

这是 PostgreSQL 服务端从 **v14** 开始支持的新特性（用于提升 `SCRAM-SHA-256` 的安全性），但：

- PostgreSQL JDBC 驱动中用于 SCRAM 的库（`ongres-scram`）截至目前（2025年）**没有实现对 PBKDF2 的支持**
- 因此，即使使用了最新版的驱动（如 `42.7.x`），依然会看到错误：
  ```
  Unsupported PBKDF2 for SCRAM-SHA-256
  ```

### 可行的替代方案

#### ✔ 方法一：使用 **标准 SCRAM-SHA-256**（安全性已足够）

把数据库用户的密码重设为标准的 SCRAM-SHA-256 格式：

```sql
-- 配置 PostgreSQL
ALTER SYSTEM SET password_encryption = scram-sha-256;
SELECT pg_reload_conf();

-- 重新设置密码（非 PBKDF2）
ALTER ROLE your_user WITH PASSWORD your_password;
```

#### ✔ 方法二：仍想使用 PBKDF2，但用其他连接方式

目前已知可能支持 `PBKDF2-SCRAM` 的客户端工具：

- **`psql`（PostgreSQL CLI）**
- **libpq**（C语言连接库）较新版本

> JDBC、Node.js、Python（psycopg2）**暂不支持 PBKDF2 SCRAM**

## 总结

| 方案                  | 支持 PBKDF2 SCRAM？ | 建议         |
| ------------------- | ---------------- | ---------- |
| Java JDBC 驱动        | ❌ 不支持            | ❌ 不可用      |
| 标准 SCRAM-SHA-256    | ✅ 支持             | ✅ 推荐使用     |
| 使用 MD5              | ✅ 支持，但安全性较低      | ⚠️ 不推荐用于生产 |
| 等待 JDBC 官方支持 PBKDF2 | ❌ 尚未有计划          | 可关注驱动更新日志  |

如果你有安全合规的需求必须启用 `PBKDF2`，你可以选择使用 `psql`、`libpq` 方式进行连接，或者等待 JDBC 驱动更新支持。
