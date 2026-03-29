# pnpm 发布包指南

## 概述

本文档介绍使用 pnpm 发布包到 NPM 注册表的完整步骤，以及如何处理 NPM 与国内镜像的切换问题。

## 一、发布包的步骤

### 1. 初始化项目

确保你已经在你的项目目录中运行了 `pnpm init`，以创建 `package.json` 文件。

```bash
pnpm init
```

### 2. 编写代码

完成你的代码，并确保你的项目文件结构和依赖项设置正确。

### 3. 添加发布信息

在 `package.json` 文件中，确保包含以下字段：

```json
{
  "name": "你的包名",
  "version": "1.0.0",
  "main": "index.js",
  "repository": {
    "type": "git",
    "url": "你的仓库地址"
  },
  "publishConfig": {
    "registry": "https://registry.npmjs.org/"
  }
}
```

### 4. 登录 NPM

如果你尚未登录到 NPM，运行以下命令：

```bash
pnpm login
```

输入你的 NPM 用户名、密码和邮箱。

### 5. 发布包

使用以下命令发布你的包：

```bash
pnpm publish
```

如果你想要发布预发布版本，可以使用 `--tag` 选项来指定标签，例如：

```bash
pnpm publish --tag beta
```

### 6. 查看发布状态

发布完成后，你可以在 NPM 上查看你的包，确认是否成功发布。

## 注意事项

* 确保你在一个干净的 Git 状态下发布，所有的改动都已提交。
* 如果你的包名已经存在，你需要更改包名或版本号，然后再尝试发布。

## 二、NPM 与国内镜像切换

如果你在运行 `pnpm login` 时登录到的是 `cnpm` 而不是 `npm`，很可能是因为你当前的 `npm` 配置文件中设置了一个国内镜像（如淘宝镜像 `registry.npm.taobao.org` 或 `cnpm`）。

### 1. 检查当前的 registry 设置

运行以下命令，查看当前的 NPM registry：

```bash
npm config get registry
```

如果输出是 `https://registry.npm.taobao.org/` 或者其他非官方的镜像地址，那么这就是问题所在。

### 2. 切换到官方 NPM registry

你可以通过以下命令将 registry 切换回官方的 NPM 注册表：

```bash
npm config set registry https://registry.npmjs.org/
```

此时再运行 `npm config get registry`，确保输出是：

```bash
https://registry.npmjs.org/
```

### 3. 重新登录

现在你可以重新运行登录命令，这次它会登录到官方的 NPM 注册表：

```bash
pnpm login
```

这将让你登录到官方的 NPM，而不是 `cnpm` 或淘宝镜像。

### 4. 如果需要使用淘宝镜像

如果你确实想要使用国内的 `cnpm` 或淘宝镜像，你可以将镜像设置为：

```bash
npm config set registry https://registry.npm.taobao.org/
```

然后你可以选择在需要的时候切换 registry，但发布包时一般建议使用官方的 NPM 注册表，以便更广泛的用户能够访问。

这样，你可以轻松切换和管理 `npm` 和 `cnpm` 的登录及包发布。
