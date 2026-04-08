---
title: Git命令参考
description: Git常用命令、tag操作、remote操作、命令组合、提交规范和常见问题
head:
  - - meta
    - name: keywords
      content: Git, 命令, 参考, tag, remote, 提交规范, 常见问题
---

# Git命令参考

## 常用命令

### 分支操作

```sh
# 切换分支
git checkout {分支名称}

# 拉取远程分支更新
git pull
```

### 文件操作

```sh
# Git存储库中删除文件（保留本地文件）
git rm -r --cached .\.vscode\
```

### 提交流程

```sh
# 提交所有修改文件
git add .
# 提交说明
git commit -m "提交说明"
# 推送到远程分支
git push origin <分支名称（如：master）>
```

### 配置管理

```sh
# 查看git配置信息
git config --list

# 设置全局信息
git config --global user.email fangcy@yinhai.com
git config --global user.name fangcy
git config --global user.password jyyh,147258

# 设置本地信息
git config --local user.email fangcy@yinhai.com
git config --local user.name fangcy
git config --local user.password jyyh,147258
```

## tag操作

```bash
# 新建版本标签
git tag v0.0.1

# 删除本地标签
git tag -d v0.0.1

# 删除远程标签（先删除本地再删除远程）
git push origin :refs/tags/v0.1.7

# 推送所有标签到远程
git push --tags
```

## remote操作

```bash
# 查看git对应的远程仓库地址
git remote -v               
# 删除关联对应的远程仓库地址        
git remote rm origin     
# 查看是否删除成功，如果没有任何返回结果，表示OK            
git remote -v       
# 重新关联git远程仓库地址
git remote add origin "新的仓库地址" 
# 查看远程仓库名称：origin 
git remote 
# 查看远程仓库地址
git remote get-url origin        
# 如果未设置ssh-key，此处仓库地址为 http://... 开头       
git remote set-url origin "新的仓库地址"
```

## 常用命令组合

### .gitignore不生效处理

```sh
## 方式1，清除本地所有缓存提交
git rm -r --cached .
git add .
git commit -m 'update .gitignore'
git push -u origin master

## 方式2，清除指定文件本地缓存提交
git rm -r --cached xxx.yml
## 在.gitignore文件中，将具体文件ignore掉
## 提交
git commit -m "清除git缓存，解决gitignore问题"
git push
```

### 向远程仓库导入内容

> 方式1：初始化新仓库并推送

```sh
git init
git add README.md
git commit -m "first commit"
git remote add origin https://github.com/用户名/仓库名.git
git push -u origin master
```

### 修改仓库地址

修改 .git/config 配置文件

```bash
cd .git      // 进入.git目录
vim config   // 修改config配置文件，快速找到remote "origin"下面的url并替换即可实现快速关联和修改
```

## git提交规范

| commit 的类别 | 说明 |
| -- | -- |
| feat | 新功能（feature） |
| fix | 修补bug |
| docs | 文档（documentation） |
| style | 格式（不影响代码运行的变动） |
| refactor | 重构（即不是新增功能，也不是修改bug的代码变动） |
| test | 增加测试 |
| chore | 构建过程或辅助工具的变动 |

## 常见问题

### github账号被锁，解封申请文本

```text
Dear sir or madam:
    I am writing to seek your help,My Github account has been flagged this morining 
and my profile is hidden from public.lt brings me a whole lot of trouble cos my tutor 
and friends on Github cannot see my open source project in my github warehouse .
i doubt whether this porblem has something to do with my recent network flutuation.
l would appreciate your help if you unlock the hiddden profile as soon as possible 
for I've left my open source project unfinished and my tutor is about to check them 
immediately.Thankyou so much.
```

### 使用建议

1. **提交规范**：建议在团队项目中遵循上述提交规范，便于生成清晰的changelog
2. **标签管理**：使用语义化版本控制（Semantic Versioning）来管理标签
3. **远程仓库**：推荐使用SSH方式连接GitHub，避免频繁输入密码
4. **配置管理**：根据项目需要选择全局配置或本地配置