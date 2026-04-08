# Rust Nightly 工具链配置指南

## 问题背景

在使用 Rust 开发 GUI 应用时，编译 `gpui`（Zed Editor 的核心 UI 库）经常会遇到以下错误：

```
error: use of unstable library feature `round_char_boundary`
   --> src/xxx.rs:xxx:xx
    |
xxx |     line.ceil_char_boundary(truncate_ix + 1)
    |          ^^^^^^^^^^^^^^^^^^^^
    |
    = note: see https://doc.rust-lang.org/edition-guide/rust-2024/the-unstable-langfeatures.html for more information
```

### 根因分析

这个错误的本质很明确：

| 要素 | 说明 |
|------|------|
| **触发原因** | 使用的 Rust 编译器是 `stable` 版本 |
| **问题 API** | `str::ceil_char_boundary` |
| **Feature Gate** | `round_char_boundary` |
| **支持情况** | ❌ stable 不支持 ✅ 仅 nightly 可用 |

gpui 作为 Zed Editor 的 UI 核心库，使用了 Rust 标准库中尚未稳定的高级文本处理 API。因此官方项目默认就是 **nightly-first**。

---

## 解决方案

### 方案一：项目目录覆盖（推荐）

在项目根目录执行：

```bash
rustup override set nightly
```

**效果**：
- 仅当前目录（及子目录）使用 nightly
- 不影响其他项目
- 无需每次加 `+nightly` 前缀

**验证**：

```bash
rustc --version
# 输出：rustc 1.xx.x-nightly (xxxxxxx)
```

---

### 方案二：使用 rust-toolchain.toml（更规范）

在项目根目录创建 `rust-toolchain.toml` 文件：

```toml
# rust-toolchain.toml
[toolchain]
channel = "nightly"
```

**优势**：
- 团队协作友好，clone 后自动使用 nightly
- CI/CD 也会统一工具链
- 声明式配置，便于版本管理

**锁定具体版本**（推荐用于生产环境）：

```toml
[toolchain]
channel = "nightly-2026-03-01"
components = ["rustfmt", "clippy"]
```

这样可以避免 nightly  Breaking Changes，确保构建稳定性。

---

### 方案三：临时使用 nightly

仅本次构建使用 nightly：

```bash
cargo +nightly build
```

或：

```bash
cargo +nightly run
```

**适用场景**：临时测试，不适合长期开发。

---

### 方案四：Stable 替代方案（不推荐）

如果必须使用 stable，可以手动实现等价功能：

```rust
// 将这段
line.ceil_char_boundary(truncate_ix + 1)

// 替换为
let mut idx = truncate_ix + 1;
while !line.is_char_boundary(idx) {
    idx += 1;
}
&line[idx..]
```

⚠️ **注意**：
- 只有 crate 本身可以开启 `#![feature(round_char_boundary)]`
- 你无法在依赖外部强行开启 feature
- 随意修改第三方依赖源码会导致维护困难

---

## 为什么不使用全局切换？

```bash
rustup default nightly  # ❌ 不推荐
```

**问题**：
- 所有 Rust 项目都会变成 nightly
- 容易踩坑，尤其当你有 stable 项目时
- 可能导致其他依赖出现问题

**推荐做法**：使用项目级配置（方案一或方案二）

---

## 快速排查清单

| 步骤 | 命令 | 预期结果 |
|------|------|----------|
| 1. 检查当前工具链 | `rustc --version` | 应显示 `stable-x.x.x`（问题状态） |
| 2. 切换到 nightly | `rustup override set nightly` | 无输出 |
| 3. 验证切换 | `rustc --version` | 应显示 `nightly-x.x.x` |
| 4. 清理缓存 | `cargo clean` | 无输出 |
| 5. 重新构建 | `cargo build` | 成功 ✅ |

---

## 总结

| 场景 | 推荐方案 |
|------|----------|
| 开发/测试 gpui / Zed 相关项目 | **方案二**（rust-toolchain.toml） |
| 临时验证问题 | **方案三**（+nightly） |
| 必须使用 stable | 避免使用 git 版本 gpui，改用 crates.io 发布版 |

gpui 作为 Zed Editor 的核心库，默认依赖 nightly 是正常设计。选择合适的工具链配置方式，即可顺畅开发。

---

## 相关文档

- [Cargo 入门指南](./cargo.md)
- [Tauri GitHub Release 自动化](./tauri-github-release.md)
- [Rust 快速起步](./rust-start-quickly.md)