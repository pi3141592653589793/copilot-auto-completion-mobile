import type {Lang} from "../../i18n";
import {
    DEFAULT_SETTINGS,
    DEFAULT_SYSTEM_MESSAGE_EN,
    DEFAULT_SYSTEM_MESSAGE_ZH,
    type Settings,
} from "../versions";
import type {FewShotExample} from "../versions/shared";
import FEW_SHOT_EN from "./few_shot_examples_en";
import FEW_SHOT_ZH from "./few_shot_examples_zh";
import {TRIGGERS_EN, TRIGGERS_ZH, type LocalizedTrigger} from "./triggers";

export type {LocalizedTrigger};

/**
 * Language-specific defaults for the three pieces of a completion prompt that
 * are actually language dependent: the system prompt, the trigger words and
 * the few-shot examples.
 *
 * Everything else (endpoints, model options, limits) is shared between
 * languages and lives in `versions/v4/v4.ts`.
 */
export interface LocalizedDefaults {
    lang: Lang;
    systemMessage: string;
    triggers: LocalizedTrigger[];
    fewShotExamples: FewShotExample[];
}

export const LOCALIZED_DEFAULTS: Record<Lang, LocalizedDefaults> = {
    en: {
        lang: "en",
        systemMessage: DEFAULT_SYSTEM_MESSAGE_EN,
        triggers: TRIGGERS_EN,
        fewShotExamples: FEW_SHOT_EN,
    },
    zh: {
        lang: "zh",
        systemMessage: DEFAULT_SYSTEM_MESSAGE_ZH,
        triggers: TRIGGERS_ZH,
        fewShotExamples: FEW_SHOT_ZH,
    },
};

export function getLocalizedDefaults(lang: Lang): LocalizedDefaults {
    return LOCALIZED_DEFAULTS[lang] ?? LOCALIZED_DEFAULTS.en;
}

function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Replace the prompt, triggers and few-shot examples of `settings` with the
 * defaults of `lang`. API keys, endpoints, models and all other options are
 * left untouched.
 */
export function applyLocalizedDefaults(settings: Settings, lang: Lang): Settings {
    const defaults = getLocalizedDefaults(lang);
    return {
        ...settings,
        systemMessage: defaults.systemMessage,
        triggers: clone(defaults.triggers),
        fewShotExamples: clone(defaults.fewShotExamples),
    };
}

// ---------------------------------------------------------------------------
// Legacy default detection
//
// Users that never customised the prompt still hold the upstream English
// defaults (or, for Chinese users, those defaults plus the six CJK
// punctuation triggers injected by older builds of this fork). For them we
// silently upgrade to the new language-specific defaults once, instead of
// forcing a factory reset.
// ---------------------------------------------------------------------------

const LEGACY_FEW_SHOT_EXAMPLES = JSON.stringify(DEFAULT_SETTINGS.fewShotExamples);

const LEGACY_SYSTEM_MESSAGES = new Set<string>([
    DEFAULT_SYSTEM_MESSAGE_EN,
    DEFAULT_SYSTEM_MESSAGE_ZH,
]);

const LEGACY_TRIGGERS_EN = JSON.stringify(DEFAULT_SETTINGS.triggers);

const LEGACY_TRIGGERS_ZH = JSON.stringify([
    ...DEFAULT_SETTINGS.triggers,
    ...["。", "，", "：", "；", "！", "？"].map((value) => ({type: "string", value})),
]);

export function hasUntouchedLegacyDefaults(settings: Settings): boolean {
    if (JSON.stringify(settings.fewShotExamples) !== LEGACY_FEW_SHOT_EXAMPLES) {
        return false;
    }
    if (!LEGACY_SYSTEM_MESSAGES.has(settings.systemMessage)) {
        return false;
    }
    const triggers = JSON.stringify(settings.triggers);
    return triggers === LEGACY_TRIGGERS_EN || triggers === LEGACY_TRIGGERS_ZH;
}

/**
 * Returns the upgraded settings when the current settings still hold untouched
 * legacy defaults, otherwise `null`.
 */
export function upgradeLegacyDefaults(settings: Settings, lang: Lang): Settings | null {
    return hasUntouchedLegacyDefaults(settings)
        ? applyLocalizedDefaults(settings, lang)
        : null;
}

/** Short human-readable summary, used by the settings UI. */
export function summarizeLocalizedDefaults(lang: Lang): {triggers: number; examples: number} {
    const defaults = getLocalizedDefaults(lang);
    return {
        triggers: defaults.triggers.length,
        examples: defaults.fewShotExamples.length,
    };
}
