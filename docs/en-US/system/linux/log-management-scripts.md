# Linux 日志管理脚本

本文档提供两个常用的 Linux 日志管理脚本，并分析其存在的问题及改进方案。

## 1. 日志清除脚本

### 原始脚本

```bash
#!/bin/bash
path=/绝对路径
filename=$path/console.log

#搜索大于10KB的文件
#-size +10k
#搜索小于10KB的文件
#-size -10k
#搜索等于10KB的文件
#-size 10k

if [ $# -ne 1 ]  
then  
        #echo "默认设置文件大小为500M"  
        filesize=500M
    else
        filesize=$1
fi 


echo "设置清除文件大小：$filesize"

find $path -name "*.*"  -size +$filesize -exec ls -lh {} \; | awk '{ print $5,$9}' > $filename

for line in `cat $filename`
do
	#如果有匹配的内容则立即返回状态值0
    echo "$line" | grep -q "$path"
    #$? 是指上一条命令的执行状态， 0就是正常
    if [  $? -eq 0 ]
    then
        #获取文件类型
        filetype=${line#*.}
        if [ $filetype == "zip"  ];then
            echo "rm -rf $line"
            rm -rf $line
        else
            echo "执行清空命令 cat /dev/null > $line"
            cat /dev/null >  $line
        fi
    fi
done
```

### 存在的问题

1. **文件名分割问题**：`for line in `cat $filename`` 按空格分割而不是按行，文件名包含空格时会出错
2. **中间文件未清理**：创建了 `console.log` 但没有删除
3. **文件匹配不严谨**：`-name "*.*"` 会漏掉没有扩展名的文件
4. **扩展名提取错误**：`filetype=${line#*.}` 在文件名含多个点时会提取错误
5. **变量未加引号**：`$line` 等变量未用引号包裹，路径含空格会出错
6. **缺少错误处理**：没有对操作结果进行检查

### 改进后的脚本

```bash
#!/bin/bash

# 默认配置
DEFAULT_PATH="/var/log"
DEFAULT_SIZE="500M"

# 参数处理
path="${1:-$DEFAULT_PATH}"
filesize="${2:-$DEFAULT_SIZE}"

echo "日志清除配置 - 路径: $path, 大小阈值: $filesize"

# 验证路径存在
if [ ! -d "$path" ]; then
    echo "错误: 路径 $path 不存在"
    exit 1
fi

# 查找并处理大文件
find "$path" -type f -size "+$filesize" -print0 | while IFS= read -r -d '' file; do
    echo "处理文件: $file"
    
    # 获取文件扩展名
    filename=$(basename "$file")
    extension="${filename##*.}"
    
    if [ "$extension" = "zip" ]; then
        echo "删除 ZIP 文件: $file"
        rm -f "$file"
    else
        echo "清空文件内容: $file"
        if truncate -s 0 "$file" 2>/dev/null; then
            echo "✓ 成功清空"
        else
            echo "✗ 清空失败，尝试备用方法"
            cat /dev/null > "$file" 2>/dev/null || echo "✗ 备用方法也失败"
        fi
    fi
done

echo "日志清除完成"
```

## 2. 日志删除脚本

### 原始脚本

```bash
#!/bin/sh

path=/home/logs

#如果没有输入变量值，默认天数为10
FilePath=$path

if [ ! -n "$1" ];
then
	day=10
else
 	day=$1
fi

#-mtime 10 表示文件修改时间距离当前为0天的文件，即距离当前时间不到1天（24小时）以内的文件
find $FilePath -mtime +$day -name '*.log*'  -exec rm -rf {} \;
```

### 存在的问题

1. **多余变量赋值**：`FilePath=$path` 没有必要
2. **变量未加引号**：`$FilePath` 等变量未用引号包裹
3. **效率问题**：`-exec rm -rf {} \;` 每个文件启动一个 rm 进程，效率低
4. **缺少验证**：没有验证路径是否存在
5. **缺少提示**：没有显示删除了哪些文件

### 改进后的脚本

```bash
#!/bin/bash

# 默认配置
DEFAULT_PATH="/home/logs"
DEFAULT_DAYS=10

# 参数处理
path="${1:-$DEFAULT_PATH}"
days="${2:-$DEFAULT_DAYS}"

echo "日志删除配置 - 路径: $path, 保留天数: $days"

# 验证路径存在
if [ ! -d "$path" ]; then
    echo "错误: 路径 $path 不存在"
    exit 1
fi

# 统计待删除文件
count=$(find "$path" -type f -mtime "+$days" -name "*.log*" | wc -l)
echo "找到 $count 个符合条件的日志文件"

if [ "$count" -eq 0 ]; then
    echo "没有需要删除的文件"
    exit 0
fi

# 显示待删除文件
echo "即将删除以下文件:"
find "$path" -type f -mtime "+$days" -name "*.log*" -print

# 确认删除
read -p "确认删除? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 使用 -delete 高效删除
    find "$path" -type f -mtime "+$days" -name "*.log*" -delete
    echo "删除完成"
else
    echo "取消删除"
fi
```

## 使用建议

1. **测试先行**：在实际使用前，先用 `echo` 替代 `rm` 或清空操作进行测试
2. **备份重要日志**：定期备份重要日志文件
3. **定时任务**：可以将这些脚本添加到 crontab 中定时执行
4. **日志轮转**：对于系统日志，推荐使用 logrotate 工具替代手动脚本
