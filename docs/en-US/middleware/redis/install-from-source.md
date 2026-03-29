# Redis 源码安装指南

## 概述

本文档介绍标准、可用于生产环境的 Redis 源码安装流程，适用于 CentOS、Rocky、Ubuntu 等 Linux 系统。

## 一、下载 Redis 源码

Redis 官方站点：https://redis.io/

### 1. 下载最新稳定版本

```bash
wget https://download.redis.io/releases/redis-7.2.4.tar.gz
```

或去官网下载指定版本。

## 二、解压源码

```bash
tar -zxvf redis-7.2.4.tar.gz
cd redis-7.2.4
```

## 三、编译 Redis

Redis 使用 C 编写，编译非常简单。

### 1. 安装编译环境

#### CentOS / Rocky

```bash
yum install -y gcc make
```

#### Ubuntu / Debian

```bash
apt update
apt install -y build-essential
```

### 2. 开始编译

```bash
make
```

如果要编译为生产优化版本：

```bash
make MALLOC=jemalloc
```

编译成功后，主要可执行文件在：

```
src/
```

包括：

* redis-server
* redis-cli
* redis-benchmark
* redis-check-rdb
* redis-check-aof

## 四、安装到系统目录（可选）

```bash
make install
```

默认会安装到：

```
/usr/local/bin
```

你可以验证：

```bash
redis-server -v
```

## 五、配置 Redis

复制默认配置文件：

```bash
mkdir /etc/redis
cp redis.conf /etc/redis/
```

修改关键配置：

```bash
vim /etc/redis/redis.conf
```

### 建议修改项

```conf
# 后台运行
daemonize yes

# 监听地址（生产建议指定）
bind 0.0.0.0

# 端口
port 6379

# 设置密码
requirepass yourpassword

# 数据目录
dir /var/lib/redis
```

创建数据目录：

```bash
mkdir -p /var/lib/redis
```

## 六、启动 Redis

```bash
redis-server /etc/redis/redis.conf
```

检查是否成功：

```bash
ps -ef | grep redis
```

## 七、连接测试

```bash
redis-cli
```

如果设置了密码：

```bash
redis-cli -a yourpassword
```

测试：

```bash
127.0.0.1:6379> ping
PONG
```

## 八、设置开机自启（推荐）

创建 systemd 服务文件：

```bash
vim /etc/systemd/system/redis.service
```

内容：

```ini
[Unit]
Description=Redis
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/bin/redis-server /etc/redis/redis.conf
ExecStop=/usr/local/bin/redis-cli shutdown
Restart=always

[Install]
WantedBy=multi-user.target
```

启动并开机自启：

```bash
systemctl daemon-reload
systemctl start redis
systemctl enable redis
```

## 九、常见问题排查

### 1. 编译报错：缺少 tcl

```bash
yum install tcl
```

然后测试：

```bash
make test
```

### 2. 端口被占用

```bash
netstat -tunlp | grep 6379
```

### 3. 无法远程访问

检查：

* bind 是否 0.0.0.0
* 防火墙是否放行 6379
* 云服务器安全组是否开放

## 十、生产环境建议

* 关闭 protected-mode（或正确配置密码）
* 设置 maxmemory
* 开启 AOF 持久化
* 设置合适的 save 规则
* 配置日志文件
* 使用专用 redis 用户运行
