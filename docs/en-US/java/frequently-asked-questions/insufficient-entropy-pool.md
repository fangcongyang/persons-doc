# 问题说明

- 系统随机数获取依赖于随机事件（如键盘录入，鼠标点击等）
- 系统熵池不足导致如java线程中的生成随机数的方法被阻塞，进一步导致服务线程被阻塞

> 导致问题代码

```java
SecureRandom secureRandom = new SecureRandom();
byte[] ivBytes = new byte[16];
byte[] seedBytes = secureRandom.generateSeed(16);
secureRandom.setSeed(seedBytes);
secureRandom.nextBytes(ivBytes);
```

## 问题排查
 
- 查看系统熵池数值

```bash
#显示熵池数量，小于1000即不足
cat /proc/sys/kernel/random/entropy_avail
```

## 解决办法

### 🚀 安装`haveged`

- 安装haveged 增强熵池，haveged 是一个基于 CPU 计时器的熵增强工具，它可以提供额外的熵

- Ubuntu / Debian

```bash
sudo apt update
sudo apt install haveged
```

- CentOS / RHEL

```bash
# 查看当前系统内核（用于确定需要下载的版本，此处以centOS结果为例）
cat /etc/os-release

# 查看可用版本
curl -s http://mirrors.aliyun.com/epel/7/x86_64/Packages/h/ | findstr haveged

# 执行下载
curl -O http://mirrors.aliyun.com/epel/7/x86_64/Packages/h/haveged-1.9.13-1.el7.x86_64.rpm

# 安装软件包
rpm -ivh haveged-1.9.13-1.el7.x86_64.rpm
# 启动服务
systemctl start haveged
# 启用生效
systemctl enable haveged
```

- Arch Linux

```bash
sudo pacman -S haveged
```

### 修改代码

```java
SecureRandom secureRandom = new SecureRandom();
// 去除自定义部分，使用默认熵池
// byte[] ivBytes = new byte[16];
// byte[] seedBytes = secureRandom.generateSeed(16);
// secureRandom.setSeed(seedBytes);
secureRandom.nextBytes(ivBytes);
```