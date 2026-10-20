import { getLanguage } from "obsidian";

import { en } from "./en";
import { zh } from "./zh";

export type Lang = "zh" | "en";
export type MessageKey = string;

const STORAGE_KEY = "cacm:lang";
const DICTS: Record<Lang, Record<string, string>> = { en, zh };

let current: Lang | null = null;

/** Detect language from the Obsidian UI language, falling back to navigator. */
export function detectLang(): Lang {
    try {
        // getLanguage() is missing on very old builds; guard so detection still
        // falls back to the browser language instead of throwing.
        const appLang =
            (typeof getLanguage === "function" ? getLanguage() : "") ||
            navigator.language ||
            "en";
        return appLang.toLowerCase().startsWith("zh") ? "zh" : "en";
    } catch {
        return "en";
    }
}

export function getLang(): Lang {
    if (current === null) {
        const stored = (() => {
            try {
                return window.localStorage.getItem(STORAGE_KEY);
            } catch {
                return null;
            }
        })();
        current = stored === "zh" || stored === "en" ? stored : detectLang();
    }
    return current;
}

export function setLang(lang: Lang): void {
    current = lang;
    try {
        window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
        // ignore storage errors (private mode etc.)
    }
}

/** Translate a key. Supports {name} placeholders. */
export function t(key: MessageKey, vars?: Record<string, string | number>): string {
    const dict = DICTS[getLang()] ?? en;
    let text = dict[key] ?? en[key] ?? key;
    if (vars) {
        for (const [k, v] of Object.entries(vars)) {
            text = text.split("{" + k + "}").join(String(v));
        }
    }
    return text;
}

export function resetLang(): void {
    current = null;
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        // ignore
    }
}

export function getLangSetting(): "auto" | Lang {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return stored === "zh" || stored === "en" ? stored : "auto";
    } catch {
        return "auto";
    }
}

export function isZh(): boolean {
    return getLang() === "zh";
}
