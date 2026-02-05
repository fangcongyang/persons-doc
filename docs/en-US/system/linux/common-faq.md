# 常见问题

## 熵不足

`haveged`（**HArdware Volatile Entropy Gathering Daemon**）是一个在 Linux 系统上运行的用户空间守护进程，用于生成熵（entropy），填充内核的熵池，从而提高系统的随机数生成能力。

---

### 🔍 简要介绍

* **用途**：在熵不足的系统中（尤其是虚拟机或嵌入式设备），`haveged` 能通过测量 CPU 缓存访问时间的微小差异来生成高质量的随机熵。
* **目的**：增强 `/dev/random` 和 `/dev/urandom` 的熵池，避免阻塞或产生低质量随机数。

---

### 🚀 安装方式

#### Ubuntu / Debian：

```bash
sudo apt update
sudo apt install haveged
```

#### CentOS / RHEL：

```bash
sudo yum install haveged
```

#### Arch Linux：

```bash
sudo pacman -S haveged
```

---

### 🔧 使用方式

安装完成后，启动并设置为开机启动：

```bash
sudo systemctl start haveged
sudo systemctl enable haveged
```

你可以用以下命令检查当前熵池大小：

```bash
cat /proc/sys/kernel/random/entropy_avail
```

如果数字较低（比如小于 1000），表示系统熵不足，适合使用 `haveged`。

---

### 📌 使用场景

* 系统启动阶段 `/dev/random` 阻塞严重
* GPG/SSH 密钥生成速度缓慢
* OpenSSL 或 Java 应用获取随机数时卡顿
* 云服务器、容器等缺乏硬件熵源的环境

---

### ⚠️ 安全注意事项

虽然 `haveged` 提供了方便的熵源，但它是软件层面的模拟，不如真实硬件熵源（如 Intel RDRAND 或硬件 RNG）安全。因此：

* **不推荐用于强安全需求的场景作为唯一熵源**
* 在虚拟机等无其他选择的环境中非常实用

---


