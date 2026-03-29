# WSL2 ext4.vhdx 迁移指南

## 概述

`ext4.vhdx` 是 WSL2 的核心数据文件，包含了 Linux 子系统的完整文件系统数据。本文档介绍如何安全地将 WSL 系统迁移到其他磁盘。

## ext4.vhdx 文件说明

### 位置

通常位于：

```
C:\Users\<你的用户名>\AppData\Local\Packages\<发行版名称>\LocalState\ext4.vhdx
```

例如：

```
C:\Users\YourName\AppData\Local\Packages\CanonicalGroupLimited.Ubuntu22.04onWindows_79rhkp1fndgsc\LocalState\ext4.vhdx
```

### 是否需要迁移

| 问题                   | 是否需要迁移？                |
| -------------------- | ---------------------- |
| `ext4.vhdx` 占用 C 盘空间 | ✅ 是，如果你想把 WSL 系统移到其他盘  |
| 能不能直接剪切到别的盘？         | ❌ 不推荐，容易损坏系统，用导出/导入最安全 |

## 安全迁移流程

### 1. 查看 WSL 发行版名称

```bash
wsl --list --verbose
```

假设你看到的是 `Ubuntu-22.04`。

### 2. 导出当前系统（包含 ext4.vhdx）

```bash
wsl --export Ubuntu-22.04 D:\WSLBackups\ubuntu.tar
```

（创建你自己的目标目录）

### 3. 注销原发行版（会删除原来的 ext4.vhdx）

```bash
wsl --unregister Ubuntu-22.04
```

> ⚠️ **谨慎操作：只有在你确认备份成功后再执行这一步！**

### 4. 重新导入到 D 盘

```bash
wsl --import Ubuntu-22.04 D:\WSL\Ubuntu-22.04 D:\WSLBackups\ubuntu.tar
```

导入完成后你就可以从新位置使用 WSL 了，ext4.vhdx 文件也会生成在 D:\WSL\Ubuntu-22.04 文件夹中。
