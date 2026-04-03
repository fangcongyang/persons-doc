# RabbitMQ 安装与配置

:::tip
RabbitMQ 默认端口：
- 管理端口：15672
- 服务端口：5672
:::

## Linux 安装

### 安装前准备

建议先安装必要的依赖包：
```bash
yum install -y gcc gcc-c++ make ncurses-devel openssl-devel unixODBC-devel
```

### 安装脚本

:::tip
注意脚本中安装软件的路径及安装路径
:::

```sh title="安装脚本"
#!/bin/bash
# 进入软件目录
cd /home/software/

# 创建 Erlang 安装目录
mkdir /usr/local/erlang  

# 解压 Erlang 源码
tar -zxf otp_src_23.2.tar.gz -C /home

# 编译安装 Erlang
cd /home/otp_src_23.2
./configure  --prefix=/usr/local/erlang --without-javac
make && make install

# 配置环境变量
echo "export ERLANG_HOME=/usr/local/erlang" >> /etc/profile
echo "export PATH=\$ERLANG_HOME/bin:\$PATH" >> /etc/profile
ln -s /usr/local/erlang/bin/erl /usr/local/bin/erl
source /etc/profile

# 解压 RabbitMQ
xz -d rabbitmq-server-generic-unix-3.8.14.tar.xz
tar -xvf rabbitmq-server-generic-unix-3.8.14.tar -C /usr/local
cd /usr/local
mv rabbitmq_server-3.8.14 rabbitmq

# 配置 RabbitMQ 环境变量
echo "export RABBITMQ_HOME=/usr/local/rabbitmq" >> /etc/profile
echo "export PATH=\$RABBITMQ_HOME/sbin:\$PATH" >> /etc/profile
source /etc/profile

# 启动 RabbitMQ
cd /usr/local/rabbitmq/sbin
./rabbitmq-server -detached

# 添加管理员用户
rabbitmqctl add_user admin sanyi@147258
rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"
rabbitmqctl set_user_tags admin administrator 
```

### 常用管理命令

进入安装目录下的 sbin 目录：

```sh
# 启动服务
./rabbitmq-server -detached

# 停止服务
./rabbitmqctl stop

# 查看状态
./rabbitmqctl status

# 添加用户
rabbitmqctl add_user {账号} {密码}

# 赋予用户权限
rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"
rabbitmqctl set_user_tags admin administrator

# 删除用户
rabbitmqctl delete_user {用户名}

# 修改用户密码
rabbitmqctl change_password {用户名} {新密码}

# 列出所有用户
rabbitmqctl list_users

# 开启监控插件
rabbitmq-plugins enable rabbitmq_management

# 查看已启用的插件
rabbitmq-plugins list
```

### 集群安装

#### 集群安装额外步骤

1. 将主机的 `/root/.erlang.cookie` 复制到副节点服务器的 `/root` 文件夹下面
2. 修改副节点 `/etc/hosts` 文件，将主节点主机信息添加进去（所有集群服务器都需要加入）
3. 将副节点加入集群：`rabbitmqctl join_cluster rabbit@主机名称（hosts里面配置的名称）`
4. 启动副节点：`rabbitmqctl start_app`

#### 整体流程

1. 启动主机的 rabbitmq，将 `/root/.erlang.cookie` 复制到副节点服务器的 `/root` 文件夹下面
2. 修改副节点 `/etc/hosts` 文件，将主节点主机信息添加进去（所有集群服务器都需要加入）
3. 进入 rabbitmq 安装目录：`/usr/local/rabbitmq/sbin`
4. 启动 rabbitmq：`./rabbitmq-server -detached`
5. 新增用户和授权

```sh
rabbitmqctl add_user admin sanyi@147258
rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"
rabbitmqctl set_user_tags admin administrator
```

6. 将副节点加入集群：`rabbitmqctl join_cluster rabbit@主机名称（hosts里面配置的名称）`
7. 启动副节点：`rabbitmqctl start_app`
8. 开启监控插件：`rabbitmq-plugins enable rabbitmq_management`

#### 集群管理命令

```bash
# 查看集群状态
rabbitmqctl cluster_status

# 从集群中移除节点（在要移除的节点上执行）
rabbitmqctl stop_app
rabbitmqctl reset
rabbitmqctl start_app

# 从集群中移除节点（在其他节点上执行）
rabbitmqctl forget_cluster_node rabbit@节点名称
```

## Windows 安装

### 下载

[RabbitMQ 下载地址](https://github.com/rabbitmq/rabbitmq-server/releases)

下载 `rabbitmq-server-3.11.2.exe` 或 `rabbitmq-server-windows-3.11.2.zip` 都可以，推荐下载 `rabbitmq-server-windows-3.11.2.zip`

:::warning
注意：安装 RabbitMQ 前需要先安装对应版本的 Erlang！
Erlang 下载地址：https://www.erlang.org/downloads
:::

### 压缩包安装

1. 将 `rabbitmq-server-windows-3.11.2.zip` 解压到合适的位置，例如：`D:\soft\rabbitmq`

2. 按 `Win+Q`，搜索 `cmd`，使用**管理员身份**运行 cmd，进入 sbin 目录
   :::warning
   注：PowerShell 可能会有权限问题，要用 cmd
   :::

3. 安装 RabbitMQ 服务：
   ```cmd
   rabbitmq-service.bat install
   ```

4. 启用插件管理器：
   ```cmd
   rabbitmq-plugins enable rabbitmq_management
   ```

5. 启动 RabbitMQ 服务：
   ```cmd
   rabbitmq-service.bat start
   ```

6. 访问管理界面：
   打开浏览器访问：http://localhost:15672
   默认账号密码：guest / guest

### Windows 常用命令

```cmd
# 安装服务
rabbitmq-service.bat install

# 启动服务
rabbitmq-service.bat start

# 停止服务
rabbitmq-service.bat stop

# 重启服务
rabbitmq-service.bat restart

# 移除服务
rabbitmq-service.bat remove

# 启用管理插件
rabbitmq-plugins enable rabbitmq_management
```

## 常见问题与完善建议

### 1. 防火墙配置

开放 RabbitMQ 相关端口：
```bash
# CentOS 6
iptables -I INPUT -p tcp --dport 5672 -j ACCEPT
iptables -I INPUT -p tcp --dport 15672 -j ACCEPT
service iptables save

# CentOS 7+
firewall-cmd --zone=public --add-port=5672/tcp --permanent
firewall-cmd --zone=public --add-port=15672/tcp --permanent
firewall-cmd --reload
```

### 2. SELinux 配置

如遇到权限问题，建议关闭 SELinux：
```bash
# 临时关闭
setenforce 0

# 永久关闭（需要重启）
sed -i 's/SELINUX=enforcing/SELINUX=disabled/' /etc/selinux/config
```

### 3. 修改默认 guest 用户权限

出于安全考虑，建议删除或修改默认 guest 用户：
```bash
# 修改 guest 密码
rabbitmqctl change_password guest 新密码

# 或者删除 guest 用户（先创建好其他管理员用户）
rabbitmqctl delete_user guest
```

### 4. 日志查看

- Linux 日志路径：`/usr/local/rabbitmq/var/log/rabbitmq/`
- Windows 日志路径：`安装目录/var/log/rabbitmq/`

### 5. 版本兼容性

注意 RabbitMQ 与 Erlang 的版本兼容性，参考：
https://www.rabbitmq.com/which-erlang.html
