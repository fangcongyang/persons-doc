# Nginx 安装与配置

## 命令

### 源码安装命令

``` sh
# 启动命令
./sbin/nginx

# 重启
./sbin/nginx -s reload

# 关闭
./sbin/nginx -s stop
```

## Nginx 配置示例

```nginx
user nginx;

worker_processes auto;
error_log /home/nginx/log/error.log crit;

worker_rlimit_nofile 204800;

events {
    use epoll;
    worker_connections 204800;
    multi_accept on;
}

http {
    include mime.types;
    default_type  application/octet-stream;
    server_names_hash_bucket_size 128;
    client_header_buffer_size 2k;
    large_client_header_buffers 4 4k;
    client_max_body_size 8m;

    server_tokens off;

    proxy_cache_path /home/nginx/cache levels=1:2 keys_zone=my_zone:100m max_size=10g inactive=30m use_temp_path=off;

    map $http_upgrade $connection_upgrade {
        default upgrade;
        ''   close;
    }
	
    upstream xxl-job-admin {
        ip_hash;
        server 172.18.34.143:9085 weight=1;
        server 172.18.34.144:9085 weight=1;
        server 172.18.34.145:9085 weight=1;
    }
	
    upstream websocket {
        ip_hash;
        server 172.18.34.143:9091 weight=1;
        server 172.18.34.144:9091 weight=1;
        server 172.18.34.145:9091 weight=1;
    }

    # NGINX 虚拟主机，监听9200端口
    server {
        listen 9200;
        access_log /home/nginx/log/access.log;

        # Gzip 压缩配置
        gzip on;
        gzip_comp_level 6;
        gzip_vary on;
        gzip_min_length  1000;
        gzip_proxied any;
        gzip_types text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript;
        gzip_buffers 16 8k;

        # 定时任务服务代理
        location /xxl-job-admin {
            proxy_redirect    off;
            proxy_buffer_size 1024k;
            proxy_buffers 16 1024k;
            proxy_busy_buffers_size 2048k;
            proxy_temp_file_write_size 2048k;
            proxy_set_header  X-Forwarded-For  $proxy_add_x_forwarded_for;
            proxy_set_header  X-Real-IP  $remote_addr;
            proxy_set_header  Host $http_host;
            proxy_pass http://xxl-job-admin;
        }
		
        # WebSocket 服务代理
        location /websocket {
            proxy_redirect    off;
            proxy_buffer_size 1024k;
            proxy_buffers 16 1024k;
            proxy_busy_buffers_size 2048k;
            proxy_temp_file_write_size 2048k;
            proxy_set_header  X-Forwarded-For  $proxy_add_x_forwarded_for;
            proxy_set_header  X-Real-IP  $remote_addr;
            proxy_set_header  Host $http_host;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            proxy_pass http://websocket;
        }
    }
}
```

## 单机安装

```sh
# 进入软件目录
cd /home/software/

# 创建安装目录
mkdir /usr/local/nginx

# 解压源码
tar -zxf nginx-1.18.0.tar.gz -C /home
cd /home/nginx-1.18.0

# 编译配置
./configure --prefix=/usr/local/nginx

# 编译安装
make && make install

# 复制启动脚本
cp /home/software/nginx /etc/init.d/
chmod +x /etc/init.d/nginx
```

## 集群安装（Keepalived + Nginx）

### Keepalived 安装

```sh
cd /home/software/

mkdir /usr/local/keepalived
tar -zxf keepalived-2.0.6.tar.gz -C /home
cd /home/keepalived-2.0.6
./configure --prefix=/usr/local/keepalived
make && make install

mkdir /etc/keepalived
cp /home/software/keepalived.conf /etc/keepalived/
cp /home/keepalived-2.0.6/keepalived/etc/init.d/keepalived /etc/init.d/ 
cp /usr/local/keepalived/etc/sysconfig/keepalived /etc/sysconfig/
cp /usr/local/keepalived/sbin/keepalived /usr/sbin/
chmod +x /etc/init.d/keepalived
cp /home/software/nginx_check.sh /usr/local/keepalived
chmod +x /usr/local/keepalived/nginx_check.sh

chkconfig --add keepalived
chkconfig keepalived on
```

### Keepalived 配置文件

```keepalived
! Configuration File for keepalived
global_defs {
   # 指定脚本执行用户
   script_user root
   enable_script_security
   # 路由id每个服务器需要配置成不同的
   router_id 80
}

vrrp_script nginx_check
{
    # 执行脚本路径
    script "/usr/local/keepalived/nginx_check.sh"
    # 每4秒执行一次检测
    interval 4
}

vrrp_instance VI_1 {
    # state 状态 MASTER主机 BACKUP 备机
    state MASTER
    # 指定网卡
    interface eth2
    # 虚拟路由 所有同一集群需要保持一致
    virtual_router_id 60
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    # 虚拟IP
    virtual_ipaddress {
        172.18.34.146
    }
	
    track_script {
        nginx_check
    }
}
```

### Nginx 状态检测脚本

```sh
#!/bin/bash
temp=`ps -C nginx --no-header | wc -l`
if [ `echo $temp | awk -v tem="1" '{print($1>tem)? "1":"0"}'` -eq "0" ];then
    service nginx start # 尝试重新启动nginx
    sleep 2  # 睡眠2秒
    temp1=`ps -C nginx --no-header | wc -l`
    if [ `echo $temp1 | awk -v tem="1" '{print($1>tem)? "1":"0"}'` -eq "0" ];then
        killall keepalived # 启动失败，将keepalived服务杀死。将vip漂移到其它备份节点
    fi
fi
```

### 日志查看

日志存储路径：`/var/log/messages`

## CentOS 6 版本服务启动文件

:::warning
为与脚本保持一致，故此脚本文件名必须为：nginx
:::

```sh
#!/bin/sh
# Name:nginx4comex
# nginx - this script starts and stops the nginx daemon
#
# description:  Nginx is an HTTP(S) server, HTTP(S) reverse \
#               proxy and IMAP/POP3 proxy server
# processname: nginx
# config:      /usr/local/nginx/conf/nginx.conf
# pidfile:     /usr/local/nginx/nginx.pid
#
# Created By http://comexchan.cnblogs.com/

# Source function library.
. /etc/rc.d/init.d/functions

# Source networking configuration.
. /etc/sysconfig/network

# Check that networking is up.
[ "$NETWORKING" = "no" ] && exit 0

NGINX_DAEMON_PATH="/usr/local/nginx/sbin/nginx"
NGINX_CONF_FILE="/usr/local/nginx/conf/nginx.conf"
NGINX_LOCK_FILE="/var/lock/subsys/nginx"
prog=$(basename $NGINX_DAEMON_PATH)

start() {
    [ -x $NGINX_DAEMON_PATH ] || exit 5
    [ -f $NGINX_CONF_FILE ] || exit 6
    echo -n $"Starting $prog: "
    daemon $NGINX_DAEMON_PATH -c $NGINX_CONF_FILE
    retval=$?
    echo
    [ $retval -eq 0 ] && touch $NGINX_LOCK_FILE
    return $retval
}

stop() {
    echo -n $"Stopping $prog: "
    killproc $prog -QUIT
    retval=$?
    echo
    [ $retval -eq 0 ] && rm -f $NGINX_LOCK_FILE
    return $retval
}

restart() {
    configtest || return $?
    stop
    start
}

reload() {
    configtest || return $?
    echo -n $"Reloading $prog: "
    killproc $NGINX_DAEMON_PATH -HUP
    RETVAL=$?
    echo
}

force_reload() {
    restart
}

configtest() {
  $NGINX_DAEMON_PATH -t -c $NGINX_CONF_FILE
}

rh_status() {
    status $prog
}

rh_status_q() {
    rh_status >/dev/null 2>&1
}

case "$1" in
    start)
        rh_status_q && exit 0
        $1
        ;;
    stop)
        rh_status_q || exit 0
        $1
        ;;
    restart|configtest)
        $1
        ;;
    reload)
        rh_status_q || exit 7
        $1
        ;;
    force-reload)
        force_reload
        ;;
    status)
        rh_status
        ;;
    condrestart|try-restart)
        rh_status_q || exit 0
            ;;
    *)
        echo $"Usage: $0 {start|stop|status|restart|condrestart|try-restart|reload|force-reload|configtest}"
        exit 2
esac
```

## 常见问题

### SELinux 问题

需要关闭 SELinux。

查看 SELinux 状态：
```bash
getenforce
```

临时关闭（重启后失效）：
```bash
setenforce 0
```

永久关闭（需要重启）：
编辑 `/etc/selinux/config` 文件，将 `SELINUX=enforcing` 改为 `SELINUX=disabled`
```bash
sed -i 's/SELINUX=enforcing/SELINUX=disabled/' /etc/selinux/config
```

### 完善建议

1. **安装依赖**：编译安装 Nginx 前建议先安装依赖包：
   ```bash
   yum install -y gcc gcc-c++ make pcre-devel zlib-devel openssl-devel
   ```

2. **配置文件检测**：修改配置后先检测语法再重启：
   ```bash
   ./sbin/nginx -t
   ```

3. **用户权限**：确保 Nginx 用户对日志和缓存目录有读写权限

4. **防火墙配置**：记得开放相应端口：
   ```bash
   iptables -I INPUT -p tcp --dport 80 -j ACCEPT
   service iptables save
   ```
