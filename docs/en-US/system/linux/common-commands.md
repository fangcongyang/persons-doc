# 常用命令

## 系统命令

```sh

# 查看系统版本
cat /etc/os-release

# 查看mac地址
ifconfig -a

# 查看每个物理CPU中core的个数(即核数)
cat /proc/cpuinfo| grep "cpu cores"| uniq

# 查看逻辑CPU的个数
cat /proc/cpuinfo| grep "processor"| wc -l

# 端口占用
netstat -ntulp | grep {端口}

# 查看当前文件夹大小
du -sh

# 查看指定文件大小
du -sk filename 

# 统计当前文件夹(目录)大小，并按文件大小排序
du -sh * | sort -n

# 查看内存使用
free -m

# 列出所有可用块设备的信息
# 查看分配大小
lsblk
lsblk  -f

# 查看硬盘类型
lsblk -d -o name,rota

- 1 → HDD
- 0 → SSD

# 监控磁盘读写
iostat -dx /dev/mapper/xxx 60

# 删除指定前缀文件
rm abc*
```

## 定时任务使用

> 打开定时任务配置

```bash
crontab -e
```

> 配置定时任务

:::tip

创建定时任务需要遵循一定的规范， 在crond文件中，前面的五列都代表一个时间，从左到右分别是分钟、小时、天、月、星期，如果不做设置，可以用*跳过，最后一列表示要执行的任务。在每一列对应的地方写入具体数值就可以表示定时执行，还可以使用短杠表示一段时间，如果*后面加入斜杠，则表示没隔该端时间执行一次。

:::

配置示例

```bash
#没天23点执行
0 23 * * * sh {脚本文件路径}.sh

#每隔三小时执行
0 */3 * * *

#每个月2号的3点或者每周三的3点执行
0 3 2 * 3

#每天的１点到10执行
* 1-10 * * *
```

> 定时任务日志

```bash
#查看调用日志
tail -f /var/log/cron

#查看用户下脚本执行记录
/var/spool/mail/{用户}
```

## 用户命令

```bash
#添加用户
adduser {用户名}

#设置密码
echo "{密码}" | passwd {用户名} --stdin

#删除用户
userdel -r {用户名}
```

## 文件、文件夹

> 创建文件夹

```bash
//文件夹路径部分路径不存在会报错
mkdir {文件夹路径}

//创建文件夹路径下面所有的文件夹
mkdir -p {文件夹路径}
```

> 文件权限

```sh
## 赋予脚本可执行权限
chmod +x {脚本文件名}.sh
```

## 挂载硬盘流程

1. 查看挂载情况 df -h

2. 查看磁盘情况 fdisk -l

3. 为/dev/vdb设备分区 fdisk /dev/vdb

4. 格式化vdb ，格式成ext3格式文件系统  mkfs.ext3 /dev/vdb1

5. 挂载硬盘

:::tip

临时挂载命令: Mount /dev/vdb1 /挂载目录

永久挂载 vim /etc/fstab 添加配置

:::

6. mount -a 使配置生效

7. 验证挂载是否成功df -h

## 服务管理

- 服务状态： systemctl status `服务名`
- 启动服务： systemctl start `服务名`
- 停止服务： systemctl stop `服务名`
- 禁用自启动服务： systemctl disable `服务名`
- 启用自启动服务： systemctl enable `服务名`

## 防火墙

```bash
## 设置开机启用防火墙
systemctl enable firewalld.service
## 设置开机禁用防火墙：
systemctl disable firewalld.service
## 启动防火墙
systemctl start firewalld
## 关闭防火墙
systemctl stop firewalld
## 检查防火墙状态
systemctl status firewalld

## 开放http端口
firewall-cmd --zone=public --add-port=80/tcp --permanent
## 使配置生效命令
firewall-cmd --reload
## 查看防火墙状态
firewall-cmd --state
## 查看开放的端口
firewall-cmd --list-ports

```

## find命令

示例1：
查找`2013-08-08`到`2013-09-01`号之间的文件：

```bash
find {文件夹} -name '{以什么开头的文件}*' -newermt '2013-08-08' ! -newermt '2013-09-0'
```

示例2：
查找多少天以前被改动过的文件（如起始时间是2011/09/08 12:00，则找到的是前第三天以前 → 2011/09/05 12:00 以前的文件(> 72 小时)） 

```bash
find {文件夹} -mtime +3 -type f -print
```

示例3：
找出 3 天內被改动过的文件 (2011/09/05 12:00 ~ 2011/09/08 12:00 內的文件) (0 ~ 72 小时內)

```bash
find {文件夹} -mtime -3 -type f -print
```

示例4：
找出前第 3 天被改动过的文件 (2011/09/04 12:00 ~ 2011/09/05 12:00 內的文件) (72 ~ 96 小时)

```bash
find {文件夹} -mtime 3 -type f -print
```

示例5：
找出第 3 天被改动过的文件 (也可以这样写)

```bash
find {文件夹} -mtime +2 -mtime -4 -type f -print
```

## rpm命令

> 安装命令

选项

- -i : install 安装的意思
- -v : 查看更详细的安装信息
- -h: 显示安装进度，在安装升级的过程中，以“#”显示安装进度
- –force: 强制安装某个软件包，可以用于替换已安装版本或安装旧版本
- –nodeps: 安装、升级过程中，不检查与其他软件包的依赖关系

【常用】：

```bash

rpm -ivh {rpm软件包}

```

> rpm 升级与更新

选项

- -Uvh ：后面接的软件即使安装过，则系统将予以直接安装；若后面接的软件有安装过旧版，则系统自动更新至新版。
- -Fvh : 如果后面接的软件并未安装到你的Linux系统上，则该软件不会被安装，亦即只有安装至你的Linux系统内的软件会被升级

【常用】：

```bash

rpm -Fvh {rpm软件包}

```

> rpm 查询已安装的rpm包

选项

- -q ：仅查询，后面接的软件名称是否有安装
- -qa :列出已经安装在本机Linux系统上面的所有软件名称
- -qp:查询未安装的rpm软件包

【常用】：

```bash

rpm -q {rpm软件名称}

```

> rpm 软件包的卸载

选项

- -e ：卸载软件

【常用】：

```bash

rpm -e {rpm软件名称}

```

> rpm 软件包的验证

选项

- -V： 验证一个软件包，可以使用任何包选择选项来查询要验证的软件包
- -Vf： 验证包含特定文件的软件包
- -Va：验证所有已安装的软件包

【常用】：

```bash

rpm -v {rpm软件名称}

```

## 源码安装

```bash

#解压软件压缩包
tar -zxf {软件}.tar.gz -C {解压路径}

#设置安装路径，一般情况安装在/usr/local路径下
./configure --prefix=/usr/local/{软件名}

#编译及安装
make && make install

```

:::tip

注：部分软件安装需要从解压文件拷贝配置等文件过去

:::

## shell

> 变量定义

- 可以什么都不带 variable=value
- 可以单引号 variable='value'
- 可以双引号 variable="value"

```bash

#定义变量
variable=''

#$获取变量
echo $variable

#释放变量
unset variable

```

> 常用操作

```bash

#限时10s读取控制台输入，并赋值给 mysql_password 变量
read -t 10 -p "请再次输入数据库密码:" mysql_password

#判断上一条命令是否执行成功
ls
if [ $? -eq 0 ];then
  echo "上一条命令执行成功"
fi

```
