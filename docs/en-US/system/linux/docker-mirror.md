# Docker 国内镜像源配置指南

## 概述

本文档介绍如何配置 Docker 国内镜像源（镜像加速器），解决网络连接问题如 `connection reset by peer` 等。

## 一、修改 Docker daemon 配置

编辑（不存在就创建）配置文件：

```bash
sudo mkdir -p /etc/docker
sudo vi /etc/docker/daemon.json
```

填入国内镜像源（建议多配置几个）：

```json
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://dockerproxy.com",
    "https://mirror.baidubce.com",
    "https://ccr.ccs.tencentyun.com"
  ]
}
```

## 二、重启 Docker

```bash
sudo systemctl daemon-reexec
sudo systemctl restart docker
```

## 三、验证是否生效

```bash
docker info
```

查看输出中是否包含：

```text
Registry Mirrors:
 https://docker.m.daocloud.io
 ...
```

## 四、测试拉取

```bash
docker pull nginx
```

如果成功，说明加速器已经生效。

## 五、（可选）WSL / 无 systemd 情况

如果你是在 **WSL（尤其是没开 systemd）**，使用：

```bash
sudo service docker restart
```

或者：

```bash
sudo dockerd &
```

## 六、进阶：阿里云专属加速器（更稳定）

访问：
👉 [https://cr.console.aliyun.com/](https://cr.console.aliyun.com/)

获取你自己的专属地址（格式类似）：

```json
{
  "registry-mirrors": [
    "https://xxxxxx.mirror.aliyuncs.com"
  ]
}
```

稳定性通常比公共镜像更好。

## 七、如果仍然失败（关键排查）

如果遇到 `read: connection reset by peer` 错误，可能不只是源问题：

### 1. DNS 问题

修改：

```bash
sudo vi /etc/resolv.conf
```

添加：

```text
nameserver 8.8.8.8
```

### 2. 防火墙 / 公司网络限制

- 某些公司网络会拦截 Docker Hub
- 可以尝试切换手机热点测试

### 3. TLS / 时间问题

```bash
date
```

时间不对也会导致 HTTPS 失败

## 八、推荐最稳组合（实战）

```json
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://mirror.baidubce.com"
  ]
}
```
