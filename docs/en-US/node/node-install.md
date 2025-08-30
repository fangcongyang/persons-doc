# linux-node安装

## 离线安装

> 环境搭建（npm安装）

若Linux上没有npm，则需要先安装npm：[npm官方下载地址](https://nodejs.cn/download/)

> 建议下载16.20.3版本，更高版本依赖要求版本高。需要升级很多依赖版本。

[16.20.3下载地址](https://nodejs.org/download/release/v16.20.2/)

> 安装步骤

```
完成下载后，开始解压
tar -xf node-v16.20.3-linux-x64.tar.xz

解压后的内容迁移至用户目录
mv node-v16.20.3-linux-x64 /usr/local/node

建立软连接
cd /usr/bin
ln -s /usr/local/node/bin/node node
ln -s /usr/local/node/bin/npm npm

将npm资源下载站更换为淘宝镜像
npm config set registry https://registry.npm.taobao.org

查看当前使用的镜像源，用于检查
npm config get registry
```