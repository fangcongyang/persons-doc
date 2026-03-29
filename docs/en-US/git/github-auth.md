# GitHub 认证配置指南

## 概述

本文档介绍如何配置 GitHub HTTPS 认证，避免每次操作都需要输入用户名和密码。

## 方案选择

推荐使用 GitHub Personal Access Token（PAT）方式进行认证，相比 Git 凭据存储更加安全和灵活。

## 配置步骤

### 1. 生成 GitHub Personal Access Token

1. 访问 GitHub 设置页面：https://github.com/settings/tokens
2. 点击 "Generate new token" -> "Generate new token (classic)"
3. 设置 Token 过期时间（建议设置合理的过期时间）
4. 选择必要的权限范围（至少需要 `repo` 权限）
5. 点击 "Generate token"
6. **重要**：复制生成的 Token 并妥善保存，只显示一次

### 2. 配置 Git Remote URL

将 PAT 嵌入到 Git 远程仓库 URL 中：

```bash
git remote set-url origin https://<用户名>:<Token>@github.com/<用户名>/<仓库名>.git
```

**示例**：
```bash
git remote set-url origin https://your-username:ghp_xxxxxxxxxxxxxxxxxxxx@github.com/your-username/your-repo.git
```

### 3. 验证配置

```bash
# 查看远程仓库配置
git remote -v

# 测试拉取操作
git pull
```

## 安全注意事项

1. **不要将 Token 提交到代码仓库**
2. **定期更换 Token**
3. **设置合理的 Token 权限范围**
4. **Token 泄露后立即在 GitHub 上撤销**

## 其他方案

如果不希望在 URL 中嵌入 Token，也可以使用 Git 凭据存储：

```bash
# 配置 Git 凭据缓存（默认缓存 15 分钟）
git config --global credential.helper cache

# 或者永久存储（不推荐在共享机器上使用）
git config --global credential.helper store
```

## 相关资源

- [GitHub 官方文档：创建 Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Git 官方文档：凭据存储](https://git-scm.com/book/en/v2/Git-Tools-Credential-Storage)
