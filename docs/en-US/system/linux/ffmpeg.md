# FFmpeg 安装与使用

## 简介

FFmpeg 是一个开源的跨平台音视频处理工具，可用于录制、转换和流式传输音视频内容。它包含了丰富的编解码器库和工具集。

## 安装前准备

### 系统要求

- Linux 系统（CentOS/Ubuntu/Debian 等）
- GCC 编译环境
- 至少 2GB 可用磁盘空间

### 安装依赖包

```bash
# CentOS/RHEL
yum install -y gcc gcc-c++ make automake autoconf libtool

# Ubuntu/Debian
apt-get install -y gcc g++ make automake autoconf libtool
```

## 安装 yasm

yasm 是汇编器，FFmpeg 编译时需要。

```bash
# 解压 yasm
tar -zxf yasm-1.3.0.tar.gz -C /home

# 进入源码目录
cd /home/yasm-1.3.0

# 配置安装路径
./configure --prefix=/usr/local/yasm

# 编译安装
make && make install

# 配置环境变量
echo "export PATH=/usr/local/yasm/bin:\$PATH" >> /etc/profile
source /etc/profile

# 验证安装
yasm --version
```

## 安装 FFmpeg

```bash
# 解压 FFmpeg
tar -zxf ffmpeg-4.0.tar.gz -C /home

# 进入源码目录
cd /home/ffmpeg-4.0

# 配置安装路径（推荐启用常用编解码器）
./configure --prefix=/usr/local/ffmpeg \
  --enable-gpl \
  --enable-libx264 \
  --enable-libx265 \
  --enable-libfdk-aac \
  --enable-libmp3lame \
  --enable-libopus \
  --enable-libvorbis \
  --enable-libvpx

# 编译安装（可能需要较长时间）
make && make install

# 配置环境变量
echo "export PATH=/usr/local/ffmpeg/bin:\$PATH" >> /etc/profile
echo "export LD_LIBRARY_PATH=/usr/local/ffmpeg/lib:\$LD_LIBRARY_PATH" >> /etc/profile
source /etc/profile

# 验证安装
ffmpeg -version
```

::: tip 提示
如果只需要基础功能，可以使用简化的配置：
```bash
./configure --prefix=/usr/local/ffmpeg
```
:::

## 常用命令

### 视频转码

```bash
# 转换为 MP4 格式（H.264 + AAC）
ffmpeg -i input.avi -c:v libx264 -c:a aac output.mp4

# 转换为 WebM 格式
ffmpeg -i input.mp4 -c:v libvpx -c:a libvorbis output.webm
```

### 视频切片（HLS）

```bash
# 将 MP4 切片为 HLS 格式（m3u8 + ts）
ffmpeg -i test.mp4 -codec:v libx264 -codec:a aac -strict -2 -map 0 \
  -f ssegment -segment_format mpegts -segment_list tos.m3u8 \
  -segment_time 10 taste_of_shanghai%04d.ts
```

参数说明：
- `-segment_time 10`：每个切片 10 秒
- `taste_of_shanghai%04d.ts`：输出文件命名格式（4位数字序号）

### 视频压缩

```bash
# 压缩视频，降低码率
ffmpeg -i input.mp4 -b:v 1M -b:a 128k output.mp4

# 调整视频分辨率
ffmpeg -i input.mp4 -s 1280x720 output_720p.mp4
```

### 音频提取

```bash
# 从视频中提取音频为 MP3
ffmpeg -i input.mp4 -vn -codec:a libmp3lame -q:a 2 output.mp3

# 提取音频为 AAC
ffmpeg -i input.mp4 -vn -codec:a aac -strict -2 output.aac
```

### 视频截取

```bash
# 从第 30 秒开始截取 10 秒
ffmpeg -i input.mp4 -ss 00:00:30 -t 00:00:10 -c copy output.mp4

# 从开始截取到第 2 分钟
ffmpeg -i input.mp4 -t 00:02:00 -c copy output.mp4
```

### 添加水印

```bash
# 在右下角添加图片水印
ffmpeg -i input.mp4 -i logo.png -filter_complex \
  "overlay=main_w-overlay_w-10:main_h-overlay_h-10" output.mp4

# 添加文字水印
ffmpeg -i input.mp4 -vf \
  "drawtext=text='Watermark':fontfile=/path/to/font.ttf:fontsize=24:fontcolor=white:x=10:y=10" \
  output.mp4
```

### 视频合并

```bash
# 创建文件列表 filelist.txt
echo "file 'part1.mp4'" > filelist.txt
echo "file 'part2.mp4'" >> filelist.txt

# 合并视频
ffmpeg -f concat -i filelist.txt -c copy output.mp4
```

## 常用参数说明

### 通用参数

| 参数 | 说明 |
|------|------|
| `-i` | 指定输入文件 |
| `-y` | 覆盖输出文件不提示 |
| `-c` | 指定编解码器（`-c:v` 视频，`-c:a` 音频） |
| `-c copy` | 直接复制流，不重新编码 |

### 视频参数

| 参数 | 说明 |
|------|------|
| `-s` | 视频分辨率，如 `1280x720` |
| `-b:v` | 视频码率，如 `1M`、`500k` |
| `-r` | 帧率，如 `24`、`30` |
| `-crf` | 恒定质量因子（H.264），范围 0-51，越小质量越好 |

### 音频参数

| 参数 | 说明 |
|------|------|
| `-b:a` | 音频码率，如 `128k`、`192k` |
| `-ar` | 采样率，如 `44100`、`48000` |
| `-ac` | 声道数，`1` 单声道，`2` 立体声 |
| `-vn` | 去除视频流 |

## 常见问题

### 编译失败

**问题**：configure 或 make 过程中报错

**解决方案**：
1. 检查是否安装了所有依赖包
2. 确保 yasm 已正确安装并在 PATH 中
3. 查看具体错误信息，安装缺失的库

### 找不到命令

**问题**：`ffmpeg: command not found`

**解决方案**：
```bash
# 重新加载环境变量
source /etc/profile

# 或者使用完整路径
/usr/local/ffmpeg/bin/ffmpeg -version
```

### 编码库缺失

**问题**：Unknown encoder 'libx264'

**解决方案**：
1. 安装 x264 开发库
2. 重新编译 FFmpeg 时添加 `--enable-libx264` 选项

## 参考资源

- [FFmpeg 官方文档](https://ffmpeg.org/documentation.html)
- [FFmpeg 常用命令 cheatsheet](https://gist.github.com/steven2358/ba153c493f240a9feb2b)
