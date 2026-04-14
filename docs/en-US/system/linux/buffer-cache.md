---
sidebar_position: 11
tags: [linux]
---

# Linux buffer/cache 内存占用过高的原因以及解决办法

## 表现现象

在Linux系统中，我们经常用free命令来查看系统内存的使用状态。在一个 CoreOS 的系统上，free命令的显示内容大概是这样一个状态：

```bash
core@localhost ~ $ free
              total        used        free      shared  buff/cache   available
Mem:        8145320      391200     333888      204616      7420232     311660
Swap:             0           0           0
```

这里的默认显示单位是kb，我们可以通过添加-h参数，来让free 命令显示的更为友好一些。

```bash
core@localhost ~ $ free -h
              total        used        free      shared  buff/cache   available
Mem:          7.8Gi       381Mi       0.3Gi       199Mi       7.4Gi       0.3Gi
Swap:            0B          0B          0B          0B          0B          0B
```

新版linux相对来说已经好很多了，在老版的时候，是没有available字段的。

所以放当时来说，大家可能会有下面几种反应：

1. 对于不太了解linux系统的人来说，看到 free 之后，会觉得内存用了好多，我都没跑什么程序，内存就用完了！Linux好占内存！
2. 稍微了解linux，并在百度搜索过相关知识的人也许会说，嗯，看起来free是没有多少了，但是真实内存才用了 400Mi 不到，还有很多剩余内存可用。buff/cache 占用比较多，说明系统中有进程曾经读写过文件，但是不要紧，这部分内存在系统内存吃紧的时候会释放出来的。

但是，上面两种说法都有些片面了，都不是很正确。接下来让我们重新来认识一下buff和cache。

## 什么是 buff/cache？

在Linux 2.4的内存管理中，buffer指Linux内存的：Buffer cache。cache指Linux内存中的：Page cache。一般呢，是这么解释两者的。

- A buffer is someting that has yet to be 'written' to disk.
- A cache is someting that has been 'read' from the disk and stored for later use.

翻译过来就是说：

1. buffer(buff) 是用来缓存尚未"写入"磁盘的内容。
2. cache 是用来缓存从磁盘"读取"出来的东西

所以 buffer 被用来当成对io设备写的缓存。而 cache 被用来当作对io设备的读缓存。这里的io设备，主要指的是块设备文件和文件系统上的普通文件。

> 但是在 Linux 2.6 以后，它们的意义不一样了。

在Linux 2.6之后Linux将他们统一合并到了Page cache作为文件层的缓存。而buffer则被用作block层的缓存。
block层的缓存是什么意思呢，你可以认为一个buffer是一个physical disk block在内存的代表，用来将内存中的pages映射为disk blocks，这部分被使用的内存被叫做buffer。

:::tip
buffer里面的pages，指的是Page cache中的pages，所以，buffer也可以被认为Page cache的一部分。
:::

或者简单来说，buffer负责裸设备相关的缓存，cache负责文件系统的缓存。

### Buffer 的具体职责

在当前的系统实现里，buffer主要是设计用来在系统对块设备进行读写时作为缓存来使用。这意味着对块的操作会使用buffer进行缓存，比如我们在格式化文件系统的时候。

但是一般情况下两个缓存系统是一起配合使用的，比如当我们对一个文件进行写操作的时候，cache的内容会被改变，而buffer则用来将cache的page标记为不同的缓冲区，并记录是哪一个缓冲区被修改了。

这样，内核在后续执行脏数据的回写（writeback）时，就不用将整个page写回，而只需要写回修改的部分即可。

### Cache 的具体职责

cache主要用来作为文件系统上的文件数据的缓存来用，当进程对文件有read/write操作的时候。包括将文件映射到内存的系统调用mmap，就会用到cache。

因为cache被作为文件类型的缓存来用，所以事实上也负责了大部分的块设备文件的缓存工作。

## 怎么回收 buff/cache？

Linux内核会在内存将要耗尽的时候，自动触发内存回收的工作，以便释放出内存给急需内存的进程使用。

但是这种回收的工作也并不是没有成本。

理解cache是干什么的就知道，cache中存在着一部分write操作的数据。所以必须保证cache中的数据跟对应文件中的数据一致，才能对cache进行释放。

于是伴随着cache清除的行为的，一般都是系统IO飙高。这是因为内核要将cache中缓存的write数据进行回写。

我们可以使用下面这个文件来人工触发缓存清除的操作，Linux 提供了三种清空方式：

1. `echo 1 > /proc/sys/vm/drop_caches` # 仅清除页面缓存
2. `echo 2 > /proc/sys/vm/drop_caches` # 清除目录项和inode
3. `echo 3 > /proc/sys/vm/drop_caches` # 清除页面缓存、目录项以及inode

但是这种放时只能在执行的当时起作用，过一段时间之后又会发现内存被占满，怎么办呢？

实际上内核提供了vm.vfs_cache_pressure参数用来控制缓冲区的回收频率，我们可以调整它。

这个参数是用来控制内核回收VFS缓存的频率。修改这个值会提高或者降低回收VFS缓存的频率。值可以设置为0-200中的任意值。越大回收频率越快，可以把vm.vfs_cache_pressure赋值为200来获得最快的回收频率。这个值默认值一般为100。

另外也可以使用slabtop分析内存使用情况。一般情况下，dentry和*_inode_cache值越高回收的效果越好。

为什么是dentry和*_inode_cache呢，这是因为当读写文件时内核会为该文件对象建立一个dentry，并将其缓存起来，方便下一次读写时直接从内存中取出提高效率。至于*_inode_cache我就不是很清楚了，只知道是为了加快对索引节点的索引，如果有清楚的可以告诉我一下。

## 测试一下

首先，我们先看一下目前的内存使用量

```bash
core@localhost ~ $ free -h
              total        used        free      shared  buff/cache   available
Mem:          7.8Gi       383Mi       7.1Gi       199Mi       291Mi       7.0Gi
Swap:            0B          0B          0B          0B          0B          0B
```

生成一个文件测试一下

```bash
core@localhost ~ $ dd if=/dev/zero of=testfile bs=1M count=1000
1000+0 records in
1000+0 records out
1048576000 bytes (1.0 GB, 1000 MiB) copied, 1.39192 s, 753 MB/s
```

检查一下内存的使用情况，是否和上面介绍的一样

```bash
core@localhost ~ $ free -h
              total        used        free      shared  buff/cache   available
Mem:          7.8Gi       383Mi       6.1Gi       199Mi       1.3Gi       7.0Gi
Swap:            0B          0B          0B          0B          0B          0B
```

手动执行一下释放，看能否将内存释放出来

```bash
core@localhost ~ $ echo 1 | sudo tee /proc/sys/vm/drop_caches
1
```

检查一下内存是否被释放掉

```bash
core@localhost ~ $ free -h
              total        used        free      shared  buff/cache   available
Mem:          7.8Gi       383Mi       7.1Gi       199Mi       291Mi       7.0Gi
Swap:            0B          0B          0B          0B          0B          0B
```

:::tip
虽然有时显示释放成功，但实际未释放。找到占用的应用重起才会真正释放掉。
:::
