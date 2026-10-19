# Copilot Auto Completion Mobile (i18n)

> ⚠️ **Personal use only · AI-generated code · No update guarantee**
>
> This repository is a **personal playground**. Most of the code in this fork was written or refactored by an AI assistant under a human's direction. It is provided **as-is**, with **no promise of maintenance, fixes, or responses to issues**. If something breaks, you are on your own — fork it and fix it.
>
> **自用项目 · AI 生成代码 · 不保证更新**
>
> 本仓库是**个人自用**的修改版，其中大部分改动由 AI 在人工指导下完成。代码按**现状**提供，**不承诺**持续维护、修复问题或回应 issue。出问题请自行 fork 修改。

> **Unofficial fork** of [Copilot Auto Completion Plus](https://github.com/yetanotherrepo/obsidian-copilot-auto-completion-plus) by Daniil Shipilov, which itself builds on [Copilot auto completion](https://github.com/j0rd1smit/obsidian-copilot-auto-completion) by Jordi Smit.
>
> **本仓库是第三方 fork，非官方版本。** 上游作者与本仓库维护者无关；使用风险自负。

[中文说明](#中文说明) · [English](#english)

---

## Platform support · 平台支持

| Platform | Status · 状态 | Notes · 说明 |
|---|---|---|
| Windows / macOS / Linux (Obsidian desktop) | ✅ Expected to work · 预期可用 | Same code path as upstream; no platform-specific APIs added. |
| **Android** | ✅ **Tested** · 已实机验证 | Verified on Honor tablet, Obsidian 1.9+, Android 14. |
| iOS / iPadOS | ⚠️ Expected to work · 预期可用 | Same WebView runtime as Android; not tested on a device. |
| Obsidian Publish / web | ❌ Not applicable | Plugins do not run there. |

The plugin only uses APIs available on every Obsidian platform: `requestUrl`, `registerEditorExtension`, CodeMirror 6. No Node.js, Electron or `child_process` calls remain in the bundle.

插件只使用各平台都有的 API（`requestUrl`、`registerEditorExtension`、CodeMirror 6），产物中不含任何 Node.js / Electron / `child_process` 调用。


## English

### What this fork adds

| Change | Detail |
|---|---|
| **Mobile support** | `isDesktopOnly` removed. The only runtime blocker was `picomatch` (used by the ignore-patterns feature) calling Node's `path` / `process` at module init; this build aliases `path` to `path-browserify` and defines `process.platform`/`process.version` at build time. No Node APIs remain in the bundle. |
| **zh / en UI** | All settings UI, notices and diagnostics are translated. Language follows the Obsidian app language by default; it can be overridden in *Advanced Settings → General → Interface language*. |
| **Numeric slider input** | Every slider (temperature, Top P, penalties, max tokens, prefix/suffix limits, delay) has a number box next to it: type a value and press Enter; Esc reverts; values are clamped to range and snapped to step. |
| **Language-aware defaults** | On first run, Chinese users get a Chinese system prompt, Chinese punctuation triggers (`。，：；！？`) and DeepSeek as the default provider. |
| **New plugin ID** | `copilot-auto-completion-mobile`. It can coexist with the official plugin; settings are not shared. |

### Install (manual)

1. Download `main.js`, `manifest.json`, `styles.css` from the latest release.
2. Put them in `<your vault>/.obsidian/plugins/copilot-auto-completion-mobile/`.
3. Reload Obsidian, then enable **Copilot Auto Completion Mobile (i18n)** in *Settings → Community plugins*.
4. Choose a provider (OpenAI / OpenRouter / DeepSeek / Anthropic / Gemini / Azure OpenAI / Ollama), paste your API key, press **Test connection**.

**Android / iOS:** the same three files work on mobile. On Android 11+, `Android/data` is sandboxed — if you cannot copy files there with a file manager, either use a vault in shared storage (e.g. `Documents/`) or push with `adb` (`adb push` into `<vault>/.obsidian/plugins/...`).

### Build

```bash
npm install
node esbuild.config.mjs production
```

### Notes & risks

- This fork has **not** been reviewed by the Obsidian team and is not listed in the community plugin directory.
- Mobile behaviour is verified by static analysis and on an Android tablet, but not across every device or ROM.
- MIT licensed. Upstream copyrights are preserved; see `LICENSE`.

---

## 中文说明

### 这个 fork 改了什么

| 改动 | 说明 |
|---|---|
| **移动端支持** | 去掉 `isDesktopOnly`。运行时唯一的拦路虎是忽略模式功能依赖的 `picomatch`，它在模块初始化时调用 Node 的 `path`/`process`；本版在构建期把 `path` 别名到 `path-browserify`，并把 `process.platform`/`process.version` 固定为安全值。产物中已无任何 Node API。 |
| **中英双语界面** | 设置界面、提示消息、诊断面板全部可翻译。默认跟随 Obsidian 界面语言，也可在「高级设置 → 通用 → 界面语言」里手动切换。 |
| **滑块可输入数值** | 温度、Top P、频率/存在惩罚、最大 Token、前/后缀长度、延迟——每个滑块右侧都有数字框：输入后回车生效，Esc 还原，超范围自动钳制、按步长对齐。 |
| **按语言的默认值** | 首次运行若界面为中文：默认系统提示词为中文版，默认触发器补上中文标点（`。，：；！？`），默认供应商为 DeepSeek。 |
| **新的插件 ID** | `copilot-auto-completion-mobile`，可与官方版共存；两者设置不共享。 |

### 手动安装

1. 从最新 Release 下载 `main.js`、`manifest.json`、`styles.css`。
2. 放入 `<你的库>/.obsidian/plugins/copilot-auto-completion-mobile/`。
3. 重启 Obsidian，在「设置 → 第三方插件」中启用 **Copilot Auto Completion Mobile (i18n)**。
4. 选择供应商（OpenAI / OpenRouter / DeepSeek / Anthropic / Gemini / Azure OpenAI / Ollama），填入 API Key，点「测试连接」。

**安卓 / iOS**：三个文件在移动端同样适用。安卓 11+ 的 `Android/data` 受沙箱保护；如果文件管理器无法写入，可改用共享存储中的库（如 `Documents/`），或用 `adb push` 直接推送到 `<库>/.obsidian/plugins/...`。

### 构建

```bash
npm install
node esbuild.config.mjs production
```

### 说明与风险

- 本 fork **未经 Obsidian 官方审核**，且因插件 ID 与上游不同，不会出现在社区插件市场。
- 移动端行为经过静态分析与一台安卓平板实机验证，但未覆盖所有机型与系统版本。
- MIT 许可，保留上游版权声明（见 `LICENSE`）。
