# v1.6.4 — 按语言的默认设置（提示词 / 触发词 / 少样本示例）

> **自用项目 · AI 生成代码 · 不保证更新。**
> 这是个人自用的修改版，大部分改动由 AI 在人工指导下完成。代码按**现状**提供，不保证持续维护、修复问题或回应 issue；升级前请先备份 `.obsidian/plugins/`，出问题请自行 fork。

## 中文

### 默认设置现在按界面语言区分

系统提示词、触发词、少样本示例各准备了一整套中英两套默认值：

| | 中文 | English |
|---|---|---|
| 触发词 | **36 条** | 23 条 |
| 少样本示例 | **22 条** | 22 条 |
| 系统提示词 | 中文版 | 英文版 |

- **触发词变多**：中文套加入 `。，：；！？、…—）》《」”` 等中文标点（中文标点后不带空格，按裸标点触发），并新增表格单元格 `|`、脚注 `[^`、行内 `$$`、`1)` 编号、`+` 项目符号、中文序号「一、」「（3）」等结构触发；英文套同样补了表格、脚注、行内公式、`1)` 编号、`+` 项目符号。
- **示例从 14 条扩到 22 条**：覆盖 8 个上下文（正文 5、标题 2、引用 2、无序列表 3、有序列表 2、代码块 3、公式块 3、任务列表 2），每条都很短（输入 1–4 行、答案一行）。
- **几乎不增加 token**：插件只把 `context` 与当前光标所在结构匹配的示例拼进请求，实际每次大约带 2–5 条。

### 怎么生效

1. **首次运行**：按界面语言注入对应那一套。
2. **手动切换**：`高级设置 → 危险区 → 恢复本语言默认值`，只替换提示词 / 触发词 / 示例，API 密钥、接口地址、已选模型都保留。
3. **静默升级**：如果提示词、触发词、示例三项**都还是旧版默认值**（没被改动过），首次加载会自动升级并保存。自己改过的库不会被覆盖。

### 顺带修的

- `detectLang()` 改用 Obsidian 的 `getLanguage()`，老版本缺这个 API 时回退到浏览器语言。
- 修掉两处历史测试红灯（本 fork 默认 DeepSeek 后，测试仍按 OpenAI 断言）。

## English

- **Language-specific defaults.** The system prompt, trigger words and few-shot examples now ship as two complete sets — Chinese: 36 triggers + 22 examples; English: 23 triggers + 22 examples.
- **More triggers** include CJK punctuation (`。，：；！？、…—`), table cells, footnotes, inline `$$`, `1)` numbering and `+` bullets.
- **More examples** (14 → 22) cover all eight editing contexts, at least two short examples each. Only examples matching the current context are sent, so the prompt stays small.
- **How it applies:** on first run, via *Advanced Settings → Danger Zone → Restore Language Defaults* (keys, endpoints and models are kept), or silently on load when the prompt / triggers / examples are still the untouched legacy defaults.

## 安装 / Install

1. 下载下方 `main.js`、`manifest.json`、`styles.css` / Download the three assets below.
2. 放入 `<你的库>/.obsidian/plugins/copilot-auto-completion-mobile/`。
3. 重启 Obsidian，在「设置 → 第三方插件」启用 **Copilot Auto Completion Mobile (i18n)**。

> 非官方 fork，基于 [Copilot Auto Completion Plus](https://github.com/yetanotherrepo/obsidian-copilot-auto-completion-plus)（MIT）。与上游作者、Microsoft / GitHub Copilot 均无关联。
> Unofficial fork of Copilot Auto Completion Plus (MIT). Not affiliated with the upstream author, Microsoft or GitHub Copilot. **Personal use, AI-generated code, no maintenance guarantee.**
