/**
 * 默认触发词（按界面语言区分）。
 *
 * A trigger fires when the text directly before the cursor ends with a
 * `string` trigger, or matches a `regex` trigger. Regex triggers must end
 * with `$` (enforced by the settings schema) and are matched against the
 * whole prefix, so they never use the `^` anchor.
 */
export interface LocalizedTrigger {
    type: "string" | "regex";
    value: string;
}

/**
 * English / ASCII-oriented trigger set.
 *
 * Covers: sentence punctuation, inline code, quotes, headings, blockquotes,
 * tables, LaTeX blocks, bullet / numbered / task lists and code fences.
 */
export const TRIGGERS_EN: LocalizedTrigger[] = [
    // ---- strings: punctuation and block markers -------------------------
    {type: "string", value: "# "},
    {type: "string", value: ". "},
    {type: "string", value: ": "},
    {type: "string", value: ", "},
    {type: "string", value: "; "},
    {type: "string", value: "! "},
    {type: "string", value: "? "},
    {type: "string", value: "' "},
    {type: "string", value: "`"},
    {type: "string", value: "> "},
    {type: "string", value: "| "},
    {type: "string", value: "= "},
    {type: "string", value: "$ "},
    {type: "string", value: "\n"},

    // ---- regex: structural Markdown contexts ----------------------------
    // bullet list (-, * or +)
    {type: "regex", value: "[\\t ]*(\\-|\\*|\\+)[\\t ]+$"},
    // numbered list with a dot: "1. ", "a. "
    {type: "regex", value: "[\\t ]*[0-9A-Za-z]+\\.[\\t ]+$"},
    // numbered list with a parenthesis: "1) "
    {type: "regex", value: "[\\t ]*[0-9]+\\)[\\t ]+$"},
    // task list, plain / sub / numbered
    {type: "regex", value: "\\s*(-|[0-9]+\\.) \\[.\\]\\s+$"},
    // markdown multiline code block opening
    {type: "regex", value: "```[a-zA-Z0-9]*(\\n\\s*)?$"},
    // opening display math on its own line
    {type: "regex", value: "\\$\\$\\n[\\t ]*$"},
    // opening display math inline
    {type: "regex", value: "\\$\\$[\\t ]*$"},
    // inside a table row, right after a pipe
    {type: "regex", value: "\\|[\\t ]*$"},
    // footnote reference
    {type: "regex", value: "\\[\\^[^\\]\\n]*$"},
];

/**
 * Chinese-oriented trigger set.
 *
 * Chinese punctuation is followed directly by the next character (no space),
 * so the CJK entries are bare punctuation; the ASCII entries are kept because
 * Chinese notes are usually mixed with English words, code and formulas.
 * It also adds Chinese list markers such as "一、" or "（3）".
 */
export const TRIGGERS_ZH: LocalizedTrigger[] = [
    // ---- strings: Chinese punctuation (no trailing space) ---------------
    {type: "string", value: "。"},
    {type: "string", value: "，"},
    {type: "string", value: "："},
    {type: "string", value: "；"},
    {type: "string", value: "！"},
    {type: "string", value: "？"},
    {type: "string", value: "、"},
    // one ellipsis / dash covers "……" and "——" because matching uses endsWith
    {type: "string", value: "…"},
    {type: "string", value: "—"},
    {type: "string", value: "）"},
    {type: "string", value: "》"},
    {type: "string", value: "」"},
    {type: "string", value: "”"},

    // ---- strings: ASCII punctuation and block markers -------------------
    {type: "string", value: "# "},
    {type: "string", value: ". "},
    {type: "string", value: ": "},
    {type: "string", value: ", "},
    {type: "string", value: "; "},
    {type: "string", value: "! "},
    {type: "string", value: "? "},
    {type: "string", value: "`"},
    {type: "string", value: "> "},
    {type: "string", value: "| "},
    {type: "string", value: "= "},
    {type: "string", value: "$ "},
    {type: "string", value: "\n"},

    // ---- regex: structural Markdown contexts ----------------------------
    // bullet list (-, * or +)
    {type: "regex", value: "[\\t ]*(\\-|\\*|\\+)[\\t ]+$"},
    // Arabic numbered list with a dot or a parenthesis: "1. ", "1) "
    {type: "regex", value: "[\\t ]*[0-9A-Za-z]+[.)][\\t ]*$"},
    // Chinese numbered list: "一、", "（3）", "3、"
    {type: "regex", value: "[\\t ]*[0-9一二三四五六七八九十]+[、）)]$"},
    {type: "regex", value: "[\\t ]*[（(][0-9一二三四五六七八九十]+[）)]$"},
    // task list, plain / sub / numbered
    {type: "regex", value: "\\s*(-|[0-9]+\\.) \\[.\\]\\s+$"},
    // markdown multiline code block opening
    {type: "regex", value: "```[a-zA-Z0-9]*(\\n\\s*)?$"},
    // opening display math on its own line
    {type: "regex", value: "\\$\\$\\n[\\t ]*$"},
    // opening display math inline
    {type: "regex", value: "\\$\\$[\\t ]*$"},
    // inside a table row, right after a pipe
    {type: "regex", value: "\\|[\\t ]*$"},
    // footnote reference
    {type: "regex", value: "\\[\\^[^\\]\\n]*$"},
];
