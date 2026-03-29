# GitHub 认证配置指南

## 概述

本文档介绍如何为 GitHub 私有仓库配置 HTTPS 认证，使用个人访问令牌（Personal Access Token, PAT）避免重复输入用户名和密码。

## 问题描述

在使用 HTTPS 方式克隆或拉取 GitHub 私有仓库时，Git 会反复提示输入用户名和密码，这给开发带来不便。

## 解决方案

### 方案选择

我们选择使用 **GitHub Personal Access Token（PAT）** 方案，原因如下：

- 配置简单，一次性设置后无需重复输入认证信息
- 可以精确控制令牌权限范围
- 比直接使用账户密码更安全

### 配置步骤

#### 1. 生成 GitHub Personal Access Token

1. 登录 GitHub 账户
2. 点击右上角头像 → Settings
3. 左侧菜单选择 Developer settings → Personal access tokens → Tokens (classic)
4. 点击 Generate new token → Generate new token (classic)
5. 设置令牌过期时间和所需权限（至少需要 repo 权限）
6. 点击 Generate token
7. **重要**：立即复制生成的令牌，只显示一次！

#### 2. 配置 Git 远程 URL

将 PAT 嵌入到 Git 远程 URL 中：

```bash
# 格式
git remote set-url origin https://<USERNAME>:<TOKEN>@github.com/<REPO_OWNER>/<REPO_NAME>.git

# 示例
git remote set-url origin https://fangcongyang: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@github.com/fangcongyang/persons-doc.git
```

#### 3. 验证配置

```bash
# 查看远程仓库配置
git remote -v

# 测试拉取操作
git pull
```

### 项目当前配置

本项目（persons-doc）已配置好 GitHub PAT 认证：

- **用户名**: fangcongyang
- **仓库**: fangcongyang/persons-doc
- **认证方式**: PAT 嵌入远程 URL

## 安全注意事项

1. **不要将 PAT 提交到公开仓库**
2. 定期轮换 PAT
3. 为不同项目使用不同的 PAT
4. 设置合理的令牌过期时间
5. 只授予必要的最小权限

## 其他方案

### Git Credential Storage

如果不想在 URL 中嵌入令牌，也可以使用 Git 凭据存储：

```bash
# 启用凭据存储
git config --global credential.helper store

# 第一次输入后，凭据会被保存
```

## 故障排除

### 认证失败

- 确认 PAT 未过期
- 确认 PAT 有足够的权限
- 检查远程 URL 格式是否正确

### 更换 PAT

```bash
# 重新设置远程 URL 包含新的 PAT
git remote set-url origin https://<USERNAME>:<NEW_TOKEN>@github.com/<REPO_OWNER>/<REPO_NAME>.git
```
