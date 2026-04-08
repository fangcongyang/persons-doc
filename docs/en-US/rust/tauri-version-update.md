# Tauri 版本更新与 VSCode 配置

## 版本更新

Tauri 项目需要同时更新前端依赖（Node.js）和后端依赖（Rust）。以下是完整的版本更新流程：

### 更新前端版本

```bash
npm install @tauri-apps/cli@latest @tauri-apps/api@latest
```

### 更新后端版本

```bash
cargo update
```

### 开发运行

```bash
npm run tauri dev
```

### 打包发布

```bash
npm run tauri build
```

## VSCode 配置问题

在 Windows 环境下使用 VSCode 开发 Tauri 项目时，可能会遇到 `tauri::command` 无法识别的问题。这通常是由于 Rust 分析器（rust-analyzer）无法正确找到 Rust 的系统根路径所致。

### 解决方案

在 VSCode 设置中添加以下配置：

```json title="settings.json"
{
    "npm.keybindingsChangedWarningShown": true,
    "tabnine.experimentalAutoInserts": true,
    "rust-analyzer.cargo.extraEnv": {},
    "rust-analyzer.cargo.sysrootSrc": "C:\\Program Files\\Rust stable MSVC 1.69",
    "git.openRepositoryInParentFolders": "never",
    "editor.largeFileOptimizations": false
}
```

### 配置说明

- **rust-analyzer.cargo.sysrootSrc**: 指定 Rust 系统根目录路径，确保 rust-analyzer 能正确解析 Tauri 的宏和依赖
- **其他设置**: 优化 VSCode 在大型项目中的性能表现

### 注意事项

1. **路径适配**: 根据实际安装的 Rust 版本调整路径中的版本号（例如 `1.69`）
2. **环境变量**: 如果使用 Rustup 管理工具链，可能需要额外配置 `RUSTUP_TOOLCHAIN` 环境变量
3. **重启生效**: 修改配置后需要重启 VSCode 或重新加载窗口使更改生效

## 常见问题排查

### 1. 命令未找到错误

如果运行 `tauri` 命令时提示命令未找到，请检查：

```bash
# 检查 Tauri CLI 是否已全局安装
which tauri
# 或
where tauri

# 如未安装，执行全局安装
npm install -g @tauri-apps/cli
```

### 2. 构建失败

构建过程中可能出现依赖缺失或版本冲突：

```bash
# 清理缓存并重新构建
cargo clean
npm run tauri build --verbose
```

### 3. Rust 工具链问题

确保使用正确的 Rust 工具链版本：

```bash
# 查看当前激活的工具链
rustup show

# 如果使用 nightly 版本，请切换
rustup default stable
```

## 最佳实践

1. **定期更新**: 建议每季度检查一次 Tauri 和相关依赖的更新
2. **版本锁定**: 在生产环境中使用固定版本以避免意外变更
3. **环境隔离**: 使用虚拟环境或容器确保开发环境一致性
4. **文档参考**: 访问 [Tauri 官方文档](https://tauri.app/v1/guides/) 获取最新信息

---

> 提示：本文档基于实际开发经验整理，适用于 Tauri 1.x 版本。如遇特殊问题，请查阅官方 GitHub Issues 或社区讨论。