# cargo

## cargo发布流程

### 前置条件

1. 注册 crates.io 账号

- 使用 GitHub 账号登录 https://crates.io

- crates.io 通过 GitHub OAuth 做身份认证

2. 获取 API Token

- crates.io → Account Settings → API Tokens

- 生成 token（只会显示一次）

本地配置：

```bash
cargo login <YOUR_API_TOKEN>
```

配置后会写入：

```bash
~/.cargo/credentials.toml
```

### 项目结构与 Cargo.toml 要求

> 必须字段

```toml
[package]
name = "your_crate_name"          # 全站唯一
version = "0.1.0"                 # 语义化版本
edition = "2021"

description = "A short description"
license = "MIT OR Apache-2.0"
repository = "https://github.com/xxx/yyy"
```

crates.io 强制校验项：

- description

- license 或 license-file

- name + version 唯一

> README

- 默认读取 README.md

- 可显式指定：

```toml
readme = "README.md"
```
README 会直接渲染在 crates.io 页面。

### 发布前自检

> 本地校验（不会真正发布）

```bash
cargo publish --dry-run
```
会执行：

- 打包

- 校验 Cargo.toml

- 编译依赖

- 校验 README / license

> 检查将被打包的文件

```bash
cargo package --list
```

默认会 忽略：

- target/

- .git/

可通过：

```toml
include = ["src/**", "Cargo.toml", "README.md"]
exclude = ["tests/data/**"]
```

### 正式发包流程

使用cargo配置的registry发布，配置文件路径为`用户目录\.cargo\config.toml`

```bash
cargo publish
```

显式指定 registry

```bash
cargo publish --registry crates.io
```
