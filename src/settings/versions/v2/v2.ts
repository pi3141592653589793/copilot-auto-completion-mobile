import {z} from "zod";

import {
    DEFAULT_SETTINGS as DEFAULT_SETTINGS_V1,
    settingsSchema as settingsSchemaV1,
    triggerSchema,
} from "../v1/v1";
import {FewShotExample, promptBundleVersionSchema} from "../shared";

export const DEFAULT_SYSTEM_MESSAGE_EN = `Your job is to predict the most logical text that should be written at the location of the <mask/>.
Return only the text that should replace <mask/>.
Do not include explanations, labels, analysis, Markdown fences, or surrounding text unless the replacement itself needs them.
Your answer can be code, a single word, or multiple sentences.
If the <mask/> is in the middle of a partial sentence, return only the missing word or words needed to complete that sentence.
Do not repeat text that already appears directly before or after the <mask/>.
Use the same language, style, formatting, indentation, and Markdown context as the surrounding text.`;

export const DEFAULT_SYSTEM_MESSAGE_ZH = `你的任务是预测 <mask/> 处最应该出现的文本，并且只返回用来替换 <mask/> 的内容。

规则：
1. 只输出要写入的文本，不要解释、不要标签、不要分析，也不要 Markdown 代码围栏（除非替换内容本身需要）。
2. 输出可以是几段文字、一句话、一个词，也可以是代码或公式。
3. 如果 <mask/> 位于句子中间，只返回补全该句所需的缺失词语，不要重写整句。
4. 不要重复 <mask/> 之前或之后已经出现的文本。
5. 严格沿用上下文使用的语言、风格、格式、缩进和 Markdown 语境：上下文是中文就用中文，是英文就用英文。
6. 上下文位于数学块（$...$ 或 $$...$$）内时，输出合法的 LaTeX 公式，并保持与上下文一致的记号习惯。
7. 上下文位于代码块内时，输出符合该语言语法的代码，并保持缩进风格。
8. 如果上下文信息不足以做出合理预测，返回空字符串。`;

// Kept for backwards compatibility; the language-specific default is chosen at first run.
export const DEFAULT_ANSWER_ONLY_SYSTEM_MESSAGE = DEFAULT_SYSTEM_MESSAGE_EN;

export const settingsSchema = settingsSchemaV1.extend({
    version: z.literal("2"),
    promptBundleVersion: promptBundleVersionSchema,
    redactSensitiveData: z.boolean(),
}).strict();

export const pluginDataSchema = z.object({
    settings: settingsSchema,
}).strict();

export const DEFAULT_SETTINGS: Settings = {
    ...DEFAULT_SETTINGS_V1,
    version: "2",
    systemMessage: DEFAULT_ANSWER_ONLY_SYSTEM_MESSAGE,
    fewShotExamples: DEFAULT_SETTINGS_V1.fewShotExamples.map(stripAnswerPrefix),
    chainOfThoughRemovalRegex: "",
    promptBundleVersion: "answer_only_v2",
    redactSensitiveData: false,
};

function stripAnswerPrefix(example: FewShotExample): FewShotExample {
    return {
        ...example,
        answer: example.answer.replace(/^[\s\S]*ANSWER:\s*/, ""),
    };
}

export type Settings = z.input<typeof settingsSchema>;
export type Trigger = z.infer<typeof triggerSchema>;
export type PluginData = z.infer<typeof pluginDataSchema>;
