import { en } from "./en";
import { zh } from "./zh";

export type Lang = "zh" | "en";
export type MessageKey = string;

const STORAGE_KEY = "cacm:lang";
const DICTS: Record<Lang, Record<string, string>> = { en, zh };

let current: Lang | null = null;

/** Detect language from Obsidian app language (localStorage) or navigator. */
export function detectLang(): Lang {
    try {
        const appLang =
            window.localStorage.getItem("language") ||
            window.localStorage.getItem("app_language") ||
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
        current = stored === "zh" || stored === "en" ? (stored as Lang) : detectLang();
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
        return stored === "zh" || stored === "en" ? (stored as Lang) : "auto";
    } catch {
        return "auto";
    }
}

export function isZh(): boolean {
    return getLang() === "zh";
}
