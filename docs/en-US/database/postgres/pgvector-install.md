# PostgreSQL pgvector 扩展安装指南

pgvector 是一个用于 PostgreSQL 的向量相似度搜索扩展，支持向量存储和高效的相似度查询。本指南将介绍在 Windows、WSL 和 Linux 服务器上安装 pgvector 的方法。

## 目录
- [Windows 安装](#windows-安装)
- [WSL 安装](#wsl-安装)
- [Linux 服务器安装](#linux-服务器安装)
- [验证安装](#验证安装)

## Windows 安装

在 Windows 上安装 pgvector 需要一些额外的步骤，因为 PostgreSQL 的扩展通常是在 Linux 环境下构建和使用的。

### 步骤一：安装 PostgreSQL

1. **下载并安装 PostgreSQL**
   从 [PostgreSQL 官网](https://www.postgresql.org/download/windows/) 下载并安装 PostgreSQL。安装时确保选择开发工具（头文件和库文件）。

### 步骤二：准备编译环境

1. **安装 Microsoft Visual Studio**
   下载并安装 [Visual Studio](https://visualstudio.microsoft.com/downloads/)，确保安装 C/C++ 编译工具。

2. **安装 MSYS2（可选但推荐）**
   从 [MSYS2 官网](https://www.msys2.org/) 下载并安装 MSYS2，它提供类 Unix 的构建环境。

### 步骤三：编译并安装 pgvector

1. **下载 pgvector 源代码**
   ```bash
   git clone https://github.com/pgvector/pgvector.git
   cd pgvector
   ```

2. **编译扩展**
   
   使用 Visual Studio Developer Command Prompt：
   ```bash
   # 设置 PostgreSQL 路径（根据实际安装路径调整）
   set PATH=C:\Program Files\PostgreSQL\15\bin;%PATH%
   
   # 编译
   nmake /f Makefile.win
   nmake /f Makefile.win install
   ```
   
   或者使用 MSYS2：
   ```bash
   # 在 MSYS2 终端中
   export PATH=/c/Program\ Files/PostgreSQL/15/bin:$PATH
   make
   make install
   ```

## WSL 安装

使用 WSL（Windows Subsystem for Linux）可以在 Windows 上运行 Linux 环境，从而更容易地安装和编译 pgvector。

### 步骤一：安装 WSL 和 Linux 发行版

1. **启用 WSL**
   ```powershell
   # 以管理员身份运行 PowerShell
   wsl --install
   ```

2. **安装 Linux 发行版**
   从 Microsoft Store 安装 Ubuntu 或其他 Linux 发行版。

### 步骤二：在 WSL 中安装 PostgreSQL

1. **更新包管理器**
   ```bash
   sudo apt update
   sudo apt upgrade
   ```

2. **安装 PostgreSQL**
   ```bash
   sudo apt install postgresql postgresql-contrib postgresql-server-dev-all
   ```

### 步骤三：编译并安装 pgvector

1. **安装编译工具**
   ```bash
   sudo apt install build-essential git
   ```

2. **下载并编译 pgvector**
   ```bash
   git clone https://github.com/pgvector/pgvector.git
   cd pgvector
   make
   sudo make install
   ```

## Linux 服务器安装

在 Linux 服务器上安装 pgvector 相对简单直接。

### 步骤一：安装 PostgreSQL 和开发文件

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib postgresql-server-dev-all build-essential git
```

**CentOS/RHEL:**
```bash
sudo yum install postgresql postgresql-contrib postgresql-devel gcc git
```

### 步骤二：编译并安装 pgvector

1. **下载源代码**
   ```bash
   git clone https://github.com/pgvector/pgvector.git
   cd pgvector
   ```

2. **编译和安装**
   ```bash
   make
   sudo make install
   ```

## 验证安装

### 步骤一：配置 PostgreSQL 加载扩展

1. **启动 PostgreSQL 服务**
   ```bash
   # Linux/WSL
   sudo systemctl start postgresql
   
   # Windows
   # 使用服务管理器启动 PostgreSQL 服务
   ```

2. **连接到数据库并创建扩展**
   ```bash
   # 连接到 PostgreSQL
   sudo -u postgres psql
   ```

   在 psql 中执行：
   ```sql
   -- 创建扩展
   CREATE EXTENSION IF NOT EXISTS vector;
   
   -- 验证扩展是否安装
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```

### 步骤二：测试 pgvector 功能

```sql
-- 创建表
CREATE TABLE items (
    id bigserial PRIMARY KEY,
    embedding vector(3)
);

-- 插入数据
INSERT INTO items (embedding) VALUES
    ('[1,2,3]'),
    ('[4,5,6]'),
    ('[7,8,9]');

-- 执行相似度查询
SELECT * FROM items ORDER BY embedding <-> '[3,1,2]' LIMIT 5;
```

## 错误排查

### 常见问题

1. **找不到 vector.control 文件**
   - 确保扩展已正确编译和安装
   - 检查 PostgreSQL 的 `shared_preload_libraries` 配置
   - 验证扩展安装路径是否正确

2. **编译错误**
   - 确保安装了 PostgreSQL 开发文件
   - 检查编译器版本兼容性
   - 查看 pgvector 项目的 GitHub Issues 寻求解决方案

3. **权限问题**
   - 确保使用 sudo 或具有适当权限的用户执行安装
   - 检查 PostgreSQL 数据目录的权限

## 替代方案

如果在本地安装遇到困难，可以考虑以下方案：

1. **使用 Docker**
   ```bash
   docker run -d \
       --name pgvector \
       -p 5432:5432 \
       -e POSTGRES_PASSWORD=mysecretpassword \
       pgvector/pgvector:pg15
   ```

2. **使用托管数据库服务**
   许多云服务商（如 AWS RDS、Google Cloud SQL）已经支持 pgvector 扩展。

## 参考资源

- [pgvector GitHub 仓库](https://github.com/pgvector/pgvector)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [pgvector 文档](https://github.com/pgvector/pgvector#usage)
