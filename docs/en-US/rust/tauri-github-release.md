# Tauri GitHub 打包与自动更新

## Tauri 使用 GitHub 进行打包

在项目根目录下创建 `.github/workflows/release.yml` 文件：

```yaml title="release.yml"
name: Release
 
on:
  push:
    branches: [ master ]
    tags-ignore: [ updater ]
jobs:
  release:
    strategy:
      fail-fast: false
      matrix:
        config:
          - os: ubuntu-latest
            arch: x86_64
            rust_target: x86_64-unknown-linux-gnu
          - os: macos-latest
            arch: x86_64
            rust_target: x86_64-apple-darwin
          - os: macos-latest
            arch: aarch64
            rust_target: aarch64-apple-darwin
          - os: windows-latest
            arch: x86_64
            rust_target: x86_64-pc-windows-msvc
    runs-on: ${{ matrix.config.os }}
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
 
      - name: Install Node
        uses: actions/setup-node@v3
        with:
          node-version: 16
 
      - name: Install Rust stable
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
 
      - name: Install Dependencies (ubuntu only)
        if: matrix.config.os == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev webkit2gtk-4.0 libappindicator3-dev librsvg2-dev patchelf
 
      - name: install frontend dependencies
        run: yarn install
 
      - name: Build Tauri
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          TAURI_PRIVATE_KEY: ${{ secrets.TAURI_PRIVATE_KEY }}
          TAURI_KEY_PASSWORD:
        with:
          tagName: v__VERSION__
          releaseName: v__VERSION__
  update:
    needs: release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v2
  
      - name: Install Node
        uses: actions/setup-node@v1
        with:
          node-version: 16
  
      - run: yarn
  
      - name: Create Update
        run: yarn update
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 生成公、私钥

全局安装 tauri：

```bash
## 全局安装 tauri cli
npm install @tauri-apps/cli -g

## 创建公、私钥，`~`表示当前用户根路径
tauri signer generate -w ~/.tauri/myapp.key
```

:::tip
如果设置密码的话，需要记住密码。
:::

如果生成了公私钥就可以进行签名打包，并进行更新。但是需要进行配置以后才能使用。

```json title="tauri.conf.json"
{
  "tauri": {
    "updater": {
      "active": true,
      "dialog": true,
      "endpoints": ["https://github.com/xxx/xxx/releases/download/updater/update.json"],
      "pubkey": "xxx",
      "windows": {
        "installMode": "passive",
        "installerArgs": []
      }
    }
  }
}
```

然后在 GitHub 项目环境中配置私钥。

## 自动更新

在本地项目当中创建文件 `scripts/update.mjs`，文件内容：

```js title='update.mjs'
// @ts-nocheck
import fetch from 'node-fetch';
import { getOctokit, context } from '@actions/github';
 
const UPDATE_TAG_NAME = 'updater';
const UPDATE_FILE_NAME = 'update.json';
 
const getSignature = async (url) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/octet-stream' }
  });
  return response.text();
};
 
const updateData = {
  name: '',
  pub_date: new Date().toISOString(),
  platforms: {
    win64: { signature: '', url: '' },
    linux: { signature: '', url: '' },
    darwin: { signature: '', url: '' },
    'linux-x86_64': { signature: '', url: '' },
    'windows-x86_64': { signature: '', url: '' }
  }
};
 
const octokit = getOctokit(process.env.GITHUB_TOKEN);
const options = { owner: context.repo.owner, repo: context.repo.repo };
 
const { data: release } = await octokit.rest.repos.getLatestRelease(options);
updateData.name = release.tag_name;
// eslint-disable-next-line camelcase
for (const { name, browser_download_url } of release.assets) {
  if (name.endsWith('.msi.zip')) {
    // eslint-disable-next-line camelcase
    updateData.platforms.win64.url = browser_download_url;
    // eslint-disable-next-line camelcase
    updateData.platforms['windows-x86_64'].url = browser_download_url;
  } else if (name.endsWith('.msi.zip.sig')) {
    // eslint-disable-next-line no-await-in-loop
    const signature = await getSignature(browser_download_url);
    updateData.platforms.win64.signature = signature;
    updateData.platforms['windows-x86_64'].signature = signature;
  } else if (name.endsWith('.app.tar.gz')) {
    // eslint-disable-next-line camelcase
    updateData.platforms.darwin.url = browser_download_url;
  } else if (name.endsWith('.app.tar.gz.sig')) {
    // eslint-disable-next-line no-await-in-loop
    const signature = await getSignature(browser_download_url);
    updateData.platforms.darwin.signature = signature;
  } else if (name.endsWith('.AppImage.tar.gz')) {
    // eslint-disable-next-line camelcase
    updateData.platforms.linux.url = browser_download_url;
    // eslint-disable-next-line camelcase
    updateData.platforms['linux-x86_64'].url = browser_download_url;
  } else if (name.endsWith('.AppImage.tar.gz.sig')) {
    // eslint-disable-next-line no-await-in-loop
    const signature = await getSignature(browser_download_url);
    updateData.platforms.linux.signature = signature;
    updateData.platforms['linux-x86_64'].signature = signature;
  }
}
 
const { data: updater } = await octokit.rest.repos.getReleaseByTag({
  ...options,
  tag: UPDATE_TAG_NAME
});
 
for (const { id, name } of updater.assets) {
  if (name === UPDATE_FILE_NAME) {
    // eslint-disable-next-line no-await-in-loop
    await octokit.rest.repos.deleteReleaseAsset({ ...options, asset_id: id });
    break;
  }
}
 
await octokit.rest.repos.uploadReleaseAsset({
  ...options,
  release_id: updater.id,
  name: UPDATE_FILE_NAME,
  data: JSON.stringify(updateData)
});
```

在 GitHub 项目下生成一个 `update.json`，这需要在项目下首先打上一个 `updater` 的 tag：

```bash
git tag updater
git push --tags
```

然后 release 这个 updater tag。

再提交版本 tag 进行打包：

```bash
git tag v1.0.0
git push tags
```

## 常见问题

### Error: Resource not accessible by integration

`release.yml` 中的 GitHub 环境令牌 `GITHUB_TOKEN` 由 GitHub 为每个运行的工作流自动颁发，无需进一步配置，这意味着没有秘密泄露的风险。但是，此令牌在默认情况下仅具有读取权限，在运行工作流时可能会收到 `Resource not accessible by integration`（资源无法通过集成访问）错误。

如果发生这种情况，需要为此令牌添加写入权限。为此，请前往 GitHub 仓库 `Settings`，然后选择 `Actions`，向下滚动到 `Workflow permissions`（工作流权限）并选中 `Read and write permissions`（读取和写入权限）：

```
Settings -> Actions -> General -> Workflow permissions -> Read and write permissions
```
