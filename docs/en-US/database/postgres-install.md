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