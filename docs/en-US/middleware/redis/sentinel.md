# Redis 部署

## 哨兵模式

### 主节点配置流程

```sh
# 创建主节点 sentinel工作目录
mkdir -p /usr/local/redis-6379/sentinel/

# 将配置文件拷贝到sentinel工作目录下
cp redis-5.0.7/sentinel.conf /usr/local/redis-6379/sentinel/

# 修改哨兵相关配置
vim /usr/local/redis-6379/sentinel/sentinel.conf 

# 配置哨兵模式
21 port 26379
# 配置进程id存储地址
32 pidfile "/usr/local/redis-6379/redis-sentinel-26379.pid"
# 配置log路径    
37 logfile "/usr/local/redis-6379/sentinel/redis-sentinel.log"
# 配置哨兵工作目录
64 dir "/usr/local/redis-6379/sentinel"
# 配置监控的redis主节点
112 sentinel monitor mymaster 192.168.154.145 6379 2
# 配置主节点登录密码
120 sentinel auth-pass mymaster 123456
```

### 从节点1配置哨兵模式

```sh
# 配置哨兵端口
21 port 27001
# 配置进程id存储地址
32 pidfile "/usr/local/redis-7001/redis-sentinel-27001.pid"
# 配置log路径    
37 logfile "/usr/local/redis-7001/sentinel/redis-sentinel.log"
# 配置哨兵工作目录
64 dir "/usr/local/redis-7001/sentinel"
# 配置监控的redis主节点
112 sentinel monitor mymaster 192.168.154.145 6379 2
# 配置主节点登录密码
120 sentinel auth-pass mymaster 123456
```

### 从节点2配置哨兵模式

```sh
# 配置哨兵端口
21 port 27002
# 配置进程id存储地址
32 pidfile "/usr/local/redis-7002/redis-sentinel-27002.pid"
# 配置log路径    
37 logfile "/usr/local/redis-7002/sentinel/redis-sentinel.log"
# 配置哨兵工作目录
64 dir "/usr/local/redis-7002/sentinel"
# 配置监控的redis主节点
112 sentinel monitor mymaster 192.168.154.145 6379 2
# 配置主节点登录密码
120 sentinel auth-pass mymaster 123456
```

## 创建集群

```sh
# 其中：-a 123456是配置文件中的密码，cluster-replicas 1，表示1个从节点
./src/redis-cli -a 123456  --cluster create 192.168.20.15:8001 192.168.20.15:8002 192.168.20.15:8003 192.168.20.15:8004 192.168.20.15:8005 192.168.20.15:8006  --cluster-replicas 1

./src/redis-cli -a 123456  --cluster create 172.16.231.240:13345 172.16.231.176:13345 --cluster-replicas 1
```
