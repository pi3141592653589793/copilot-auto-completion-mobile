import * as React from "react";
import {useState} from "react";

import TextSettingItem from "./components/TextSettingItem";
import {checkForErrors} from "./utils";
import SliderSettingsItem from "./components/SliderSettingsItem";

import TriggerSettings from "./components/TriggerSettings";
import SettingsItem from "./components/SettingsItem";
import CheckBoxSettingItem from "./components/CheckBoxSettingItem";
import FewShotExampleSettings from "./components/FewShotExampleSettings";
import ConnectivityCheck from "./components/ConnectivityCheck";
import DropDownSettingItem from "./components/DropDownSettingItem";
import {Notice} from "obsidian";
import ProviderModelDropDownSettingItem from "./components/ProviderModelDropDownSettingItem";
import ReportIssueSettingItem from "./components/ReportIssueSettingItem";
import DiagnosticsSettingItem from "./components/DiagnosticsSettingItem";
import {capabilitiesForSettings} from "./model_capabilities";
import { getLang, getLangSetting, resetLang, setLang, t } from "../i18n";
import { applyLocalizedDefaults, summarizeLocalizedDefaults } from "./localized_defaults";
import {
    DEFAULT_SETTINGS,
    MAX_DELAY,
    MAX_FREQUENCY_PENALTY,
    MAX_MAX_CHAR_LIMIT,
    MAX_MAX_TOKENS,
    MAX_PRESENCE_PENALTY,
    MAX_TEMPERATURE,
    MAX_TOP_P,
    MIN_DELAY,
    MIN_FREQUENCY_PENALTY,
    MIN_MAX_CHAR_LIMIT,
    MIN_MAX_TOKENS,
    MIN_PRESENCE_PENALTY,
    MIN_TEMPERATURE,
    MIN_TOP_P,
    Settings
} from "./versions";

interface IProps {
    onSettingsChanged(settings: Settings): void;

    pluginVersion: string;
    settings: Settings;
}

const PROVIDER_LABELS: Record<Settings["apiProvider"], string> = {
    openai: "OpenAI",
    openrouter: "OpenRouter",
    deepseek: "DeepSeek",
    anthropic: "Anthropic",
    gemini: "Gemini",
    azure: "Azure OpenAI",
    ollama: "Ollama",
};

const PROVIDER_OPTIONS: Record<Settings["apiProvider"], string> = {
    openai: "OpenAI API",
    openrouter: "OpenRouter API",
    deepseek: "DeepSeek API",
    anthropic: "Anthropic API",
    gemini: "Gemini API",
    azure: "Azure OAI API",
    ollama: t("Self-hosted Ollama API"),
};

export default function SettingsView(props: IProps): React.JSX.Element {
    const [settings, _setSettings] = useState<Settings>(props.settings);
    const connectionSettingsRef = React.useRef<Settings>(settings);
    const connectionRevisionRef = React.useRef(0);
    if (!sameConnectionConfiguration(connectionSettingsRef.current, settings)) {
        connectionSettingsRef.current = settings;
        connectionRevisionRef.current += 1;
    }
    const connectionRevision = connectionRevisionRef.current;
    const [verifiedConnection, setVerifiedConnection] = useState<{
        provider: Settings["apiProvider"];
        model: string;
        revision: number;
    } | null>(null);
    const errors = checkForErrors(settings);
    const modelCapabilities = capabilitiesForSettings(settings);

    React.useEffect(() => {
        _setSettings(props.settings);
    }, [props.settings]);

    React.useEffect(() => {
        setVerifiedConnection(null);
    }, [connectionRevision]);

    const updateSettings = (update: Partial<Settings>) => {
        _setSettings((settings: Settings) => {
            const newSettings = {...settings, ...update};
            props.onSettingsChanged(newSettings);
            return newSettings;
        });
    };

    const resetSettings = () => {
        const azureOAIApiSettings = {
            ...settings.azureOAIApiSettings,
        };
        const openAIApiSettings = {
            ...settings.openAIApiSettings,
        };
        const openRouterApiSettings = {
            ...settings.openRouterApiSettings,
        };
        const deepSeekApiSettings = {
            ...settings.deepSeekApiSettings,
        };
        const anthropicApiSettings = {
            ...settings.anthropicApiSettings,
        };
        const geminiApiSettings = {
            ...settings.geminiApiSettings,
        };
        const ollamaApiSettings = {
            ...settings.ollamaApiSettings,
        };

        const newSettings: Settings = applyLocalizedDefaults({
            ...DEFAULT_SETTINGS,
            apiProvider: settings.apiProvider,
            azureOAIApiSettings,
            openAIApiSettings,
            openRouterApiSettings,
            deepSeekApiSettings,
            anthropicApiSettings,
            geminiApiSettings,
            ollamaApiSettings,
            advancedMode: settings.advancedMode,
        }, getLang());
        updateSettings(newSettings);
        new Notice(t("Factory reset complete."));
    };

    const restoreLanguageDefaults = () => {
        updateSettings(applyLocalizedDefaults(settings, getLang()));
        new Notice(t("Language defaults restored."));
    };

    const setProvider = (value: string) => {
        if (
            value === "openai"
            || value === "openrouter"
            || value === "deepseek"
            || value === "azure"
            || value === "ollama"
            || value === "anthropic"
            || value === "gemini"
        ) {
            updateSettings({apiProvider: value});
        }
    };

    const renderQuickEndpointIfNeeded = (provider: Settings["apiProvider"]) => {
        if (provider === "azure" || provider === "ollama") {
            return renderEndpointSetting(provider, "quick");
        }
        if (endpointError(provider) || currentEndpoint(provider) !== defaultEndpoint(provider)) {
            return renderEndpointSetting(provider, "quick");
        }
        return null;
    };

    const renderEndpointSetting = (provider: Settings["apiProvider"], mode: "quick" | "advanced") => {
        const name = provider === "azure"
            ? t("Azure OAI API URL")
            : provider === "ollama"
                ? t("Ollama API URL")
                : `${PROVIDER_LABELS[provider]} API URL`;
        const description = provider === "openrouter"
            ? t("OpenRouter requests use this official HTTPS endpoint. Custom endpoints are not accepted.")
            : provider === "deepseek"
                ? t("DeepSeek requests use this official HTTPS endpoint. Custom endpoints are not accepted.")
            : mode === "quick"
                ? t("Custom endpoint for this provider.")
                : t("The endpoint used for API requests.");

        if (provider === "openai") {
            return (
                <TextSettingItem
                    name={name}
                    description={description}
                    placeholder={"https://api.openai.com/v1/responses"}
                    type="url"
                    inputMode="url"
                    value={settings.openAIApiSettings.url}
                    errorMessage={errors.get("openAIApiSettings.url")}
                    setValue={(value: string) =>
                        updateSettings({
                            openAIApiSettings: {
                                ...settings.openAIApiSettings,
                                url: value,
                            },
                        })
                    }
                />
            );
        }
        if (provider === "anthropic") {
            return (
                <TextSettingItem
                    name={name}
                    description={description}
                    placeholder={"https://api.anthropic.com/v1/messages"}
                    type="url"
                    inputMode="url"
                    value={settings.anthropicApiSettings.url}
                    errorMessage={errors.get("anthropicApiSettings.url")}
                    setValue={(value: string) =>
                        updateSettings({
                            anthropicApiSettings: {
                                ...settings.anthropicApiSettings,
                                url: value,
                            },
                        })
                    }
                />
            );
        }
        if (provider === "openrouter") {
            return (
                <TextSettingItem
                    name={name}
                    description={description}
                    placeholder={"https://openrouter.ai/api/v1/chat/completions"}
                    type="url"
                    inputMode="url"
                    value={settings.openRouterApiSettings.url}
                    errorMessage={errors.get("openRouterApiSettings.url")}
                    setValue={(value: string) =>
                        updateSettings({
                            openRouterApiSettings: {
                                ...settings.openRouterApiSettings,
                                url: value,
                            },
                        })
                    }
                />
            );
        }
        if (provider === "deepseek") {
            return (
                <TextSettingItem
                    name={name}
                    description={description}
                    placeholder={"https://api.deepseek.com/chat/completions"}
                    type="url"
                    inputMode="url"
                    value={settings.deepSeekApiSettings.url}
                    errorMessage={errors.get("deepSeekApiSettings.url")}
                    setValue={(value: string) =>
                        updateSettings({
                            deepSeekApiSettings: {
                                ...settings.deepSeekApiSettings,
                                url: value,
                            },
                        })
                    }
                />
            );
        }
        if (provider === "gemini") {
            return (
                <TextSettingItem
                    name={name}
                    description={description}
                    placeholder={"https://generativelanguage.googleapis.com/v1beta"}
                    type="url"
                    inputMode="url"
                    value={settings.geminiApiSettings.url}
                    errorMessage={errors.get("geminiApiSettings.url")}
                    setValue={(value: string) =>
                        updateSettings({
                            geminiApiSettings: {
                                ...settings.geminiApiSettings,
                                url: value,
                            },
                        })
                    }
                />
            );
        }
        if (provider === "azure") {
            return (
                <TextSettingItem
                    name={name}
                    description={mode === "quick" ? t("Paste your Azure deployment URL.") : description}
                    placeholder={"https://resource.openai.azure.com/openai/deployments/model/chat/completions"}
                    type="url"
                    inputMode="url"
                    value={settings.azureOAIApiSettings.url}
                    errorMessage={errors.get("azureOAIApiSettings.url")}
                    setValue={(value: string) =>
                        updateSettings({
                            azureOAIApiSettings: {
                                ...settings.azureOAIApiSettings,
                                url: value,
                            },
                        })
                    }
                />
            );
        }
        return (
            <TextSettingItem
                name={name}
                description={mode === "quick" ? t("Local Ollama chat endpoint.") : description}
                placeholder={"http://localhost:11434/api/chat"}
                type="url"
                inputMode="url"
                value={settings.ollamaApiSettings.url}
                errorMessage={errors.get("ollamaApiSettings.url")}
                setValue={(value: string) =>
                    updateSettings({
                        ollamaApiSettings: {
                            ...settings.ollamaApiSettings,
                            url: value,
                        },
                    })
                }
            />
        );
    };

    const renderKeySetting = (provider: Exclude<Settings["apiProvider"], "ollama">, quick = false) => {
        const description = quick
            ? t("Paste your {provider} key. It stays in plugin settings.", {
                  provider: PROVIDER_LABELS[provider],
              })
            : t("The API key used in requests.");
        if (provider === "openai") {
            return (
                <TextSettingItem
                    name={t("OpenAI API Key")}
                    description={description}
                    placeholder={"sk-..."}
                    password
                    autoComplete="off"
                    value={settings.openAIApiSettings.key}
                    errorMessage={errors.get("openAIApiSettings.key")}
                    setValue={(value: string) =>
                        updateSettings({
                            openAIApiSettings: {
                                ...settings.openAIApiSettings,
                                key: value,
                            },
                        })
                    }
                />
            );
        }
        if (provider === "anthropic") {
            return (
                <TextSettingItem
                    name={t("Anthropic API Key")}
                    description={description}
                    placeholder={"sk-ant-..."}
                    password
                    autoComplete="off"
                    value={settings.anthropicApiSettings.key}
                    errorMessage={errors.get("anthropicApiSettings.key")}
                    setValue={(value: string) =>
                        updateSettings({
                            anthropicApiSettings: {
                                ...settings.anthropicApiSettings,
                                key: value,
                            },
                        })
                    }
                />
            );
        }
        if (provider === "openrouter") {
            return (
                <TextSettingItem
                    name={t("OpenRouter API Key")}
                    description={description}
                    placeholder={"sk-or-v1-..."}
                    password
                    autoComplete="off"
                    value={settings.openRouterApiSettings.key}
                    errorMessage={errors.get("openRouterApiSettings.key")}
                    setValue={(value: string) =>
                        updateSettings({
                            openRouterApiSettings: {
                                ...settings.openRouterApiSettings,
                                key: value,
                            },
                        })
                    }
                />
            );
        }
        if (provider === "deepseek") {
            return (
                <TextSettingItem
                    name={t("DeepSeek API Key")}
                    description={description}
                    placeholder={t("Your DeepSeek API key…")}
                    password
                    autoComplete="off"
                    value={settings.deepSeekApiSettings.key}
                    errorMessage={errors.get("deepSeekApiSettings.key")}
                    setValue={(value: string) =>
                        updateSettings({
                            deepSeekApiSettings: {
                                ...settings.deepSeekApiSettings,
                                key: value,
                            },
                        })
                    }
                />
            );
        }
        if (provider === "gemini") {
            return (
                <TextSettingItem
                    name={t("Gemini API Key")}
                    description={description}
                    placeholder={t("Your Gemini API key…")}
                    password
                    autoComplete="off"
                    value={settings.geminiApiSettings.key}
                    errorMessage={errors.get("geminiApiSettings.key")}
                    setValue={(value: string) =>
                        updateSettings({
                            geminiApiSettings: {
                                ...settings.geminiApiSettings,
                                key: value,
                            },
                        })
                    }
                />
            );
        }
        return (
            <TextSettingItem
                name={t("Azure API Key")}
                description={description}
                placeholder={t("Your Azure API key…")}
                password
                autoComplete="off"
                value={settings.azureOAIApiSettings.key}
                errorMessage={errors.get("azureOAIApiSettings.key")}
                setValue={(value: string) =>
                    updateSettings({
                        azureOAIApiSettings: {
                            ...settings.azureOAIApiSettings,
                            key: value,
                        },
                    })
                }
            />
        );
    };

    const renderModelSetting = (provider: Settings["apiProvider"], mode: "quick" | "advanced") => {
        if (provider === "openai") {
            return (
                <ProviderModelDropDownSettingItem
                    mode={mode}
                    settings={settings}
                    value={settings.openAIApiSettings.model}
                    verifiedModel={verifiedModelFor(provider)}
                    setValue={(value: string) =>
                        updateSettings({
                            openAIApiSettings: {
                                ...settings.openAIApiSettings,
                                model: value,
                            },
                        })
                    }
                    errorMessage={errors.get("openAIApiSettings.model")}
                />
            );
        }
        if (provider === "anthropic") {
            return (
                <ProviderModelDropDownSettingItem
                    mode={mode}
                    settings={settings}
                    value={settings.anthropicApiSettings.model}
                    verifiedModel={verifiedModelFor(provider)}
                    setValue={(value: string) =>
                        updateSettings({
                            anthropicApiSettings: {
                                ...settings.anthropicApiSettings,
                                model: value,
                            },
                        })
                    }
                    errorMessage={errors.get("anthropicApiSettings.model")}
                />
            );
        }
        if (provider === "openrouter") {
            return (
                <ProviderModelDropDownSettingItem
                    mode={mode}
                    settings={settings}
                    value={settings.openRouterApiSettings.model}
                    verifiedModel={verifiedModelFor(provider)}
                    setValue={(value: string) =>
                        updateSettings({
                            openRouterApiSettings: {
                                ...settings.openRouterApiSettings,
                                model: value,
                            },
                        })
                    }
                    errorMessage={errors.get("openRouterApiSettings.model")}
                />
            );
        }
        if (provider === "deepseek") {
            return (
                <ProviderModelDropDownSettingItem
                    mode={mode}
                    settings={settings}
                    value={settings.deepSeekApiSettings.model}
                    verifiedModel={verifiedModelFor(provider)}
                    setValue={(value: string) =>
                        updateSettings({
                            deepSeekApiSettings: {
                                ...settings.deepSeekApiSettings,
                                model: value,
                            },
                        })
                    }
                    errorMessage={errors.get("deepSeekApiSettings.model")}
                />
            );
        }
        if (provider === "gemini") {
            return (
                <ProviderModelDropDownSettingItem
                    mode={mode}
                    settings={settings}
                    value={settings.geminiApiSettings.model}
                    verifiedModel={verifiedModelFor(provider)}
                    setValue={(value: string) =>
                        updateSettings({
                            geminiApiSettings: {
                                ...settings.geminiApiSettings,
                                model: value,
                            },
                        })
                    }
                    errorMessage={errors.get("geminiApiSettings.model")}
                />
            );
        }
        if (provider === "ollama") {
            return (
                <TextSettingItem
                    name={t("Model")}
                    description={t("The local Ollama model to use.")}
                    placeholder="llama3.1:8b"
                    value={settings.ollamaApiSettings.model}
                    setValue={(value: string) =>
                        updateSettings({
                            ollamaApiSettings: {
                                ...settings.ollamaApiSettings,
                                model: value,
                            },
                        })
                    }
                    errorMessage={errors.get("ollamaApiSettings.model")}
                />
            );
        }
        return null;
    };

    const renderQuickProviderNotice = () => {
        if (settings.apiProvider === "openai") {
            return null;
        }
        return (
            <SettingsItem
                name={t("Provider")}
                description={t("This vault is already configured to use this provider. Change providers in Advanced Settings.")}
            >
                <span>{PROVIDER_LABELS[settings.apiProvider]}</span>
            </SettingsItem>
        );
    };

    const renderQuickSetup = () => {
        const provider = settings.apiProvider;
        return (
            <>
                <h2>{t("Quick Setup")}</h2>
                <CheckBoxSettingItem
                    name={t("Enable")}
                    description={t("Turn autocomplete on or off.")}
                    enabled={settings.enabled}
                    setEnabled={(value) => updateSettings({enabled: value})}
                />
                {renderQuickProviderNotice()}
                {renderQuickEndpointIfNeeded(provider)}
                {provider !== "ollama" && renderKeySetting(provider, true)}
                {renderModelSetting(provider, "quick")}
                <ConnectivityCheck
                    key={`quick-${provider}`}
                    pluginVersion={props.pluginVersion}
                    settings={settings}
                    connectionRevision={connectionRevision}
                    onVerificationChange={(verified) => setVerifiedConnection(verified
                        ? {provider, model: modelFor(settings), revision: connectionRevision}
                        : null)}
                />
            </>
        );
    };

    const renderAdvancedApiSettings = () => {
        const provider = settings.apiProvider;
        return (
            <>
                <h2>{t("Provider & Endpoints")}</h2>
                <DropDownSettingItem
                    name={t("API Provider")}
                    description={t("Choose the provider used for completion requests.")}
                    value={settings.apiProvider}
                    setValue={setProvider}
                    options={PROVIDER_OPTIONS}
                    errorMessage={errors.get("apiProvider")}
                />
                {renderEndpointSetting(provider, "advanced")}
                {provider !== "ollama" && renderKeySetting(provider)}
                {renderModelSetting(provider, "advanced")}
            </>
        );
    };

    const renderModelOptions = () => (
        <>
            <h2>{t("Model Options")}</h2>
            {modelCapabilities.isReasoningModel && (
                <SettingsItem
                    name={t("Reasoning Model")}
                    description={t("The selected model rejects some sampling controls, so unsupported options are hidden.")}
                >
                    <span/>
                </SettingsItem>
            )}
            {(modelCapabilities.supportsTemperature || modelCapabilities.supportsTopP) && (<>
                {modelCapabilities.supportsTemperature && (
                    <SliderSettingsItem
                        name={t("Temperature")}
                        description={t("Controls randomness. Lower values are steadier; higher values are more varied.")}
                        value={settings.modelOptions.temperature}
                        errorMessage={errors.get("modelOptions.temperature")}
                        setValue={(value: number) =>
                            updateSettings({
                                modelOptions: {
                                    ...settings.modelOptions,
                                    temperature: value,
                                },
                            })
                        }
                        min={MIN_TEMPERATURE}
                        max={MAX_TEMPERATURE}
                        step={0.05}
                    />
                )}
                {modelCapabilities.supportsTopP && (
                    <SliderSettingsItem
                        name={"Top P"}
                        description={t("Controls how widely the model samples likely next tokens.")}
                        value={settings.modelOptions.top_p}
                        errorMessage={errors.get("modelOptions.top_p")}
                        setValue={(value: number) =>
                            updateSettings({
                                modelOptions: {
                                    ...settings.modelOptions,
                                    top_p: value,
                                },
                            })
                        }
                        min={MIN_TOP_P}
                        max={MAX_TOP_P}
                        step={0.05}
                    />
                )}
            </>)}
            {(modelCapabilities.supportsFrequencyPenalty || modelCapabilities.supportsPresencePenalty) && (<>
                {modelCapabilities.supportsFrequencyPenalty && (
                    <SliderSettingsItem
                        name={t("Frequency Penalty")}
                        description={t("Reduces repeated wording based on how often tokens have already appeared.")}
                        value={settings.modelOptions.frequency_penalty}
                        errorMessage={errors.get("modelOptions.frequency_penalty")}
                        setValue={(value: number) =>
                            updateSettings({
                                modelOptions: {
                                    ...settings.modelOptions,
                                    frequency_penalty: value,
                                },
                            })
                        }
                        min={MIN_FREQUENCY_PENALTY}
                        max={MAX_FREQUENCY_PENALTY}
                        step={0.05}
                    />
                )}
                {modelCapabilities.supportsPresencePenalty && (
                    <SliderSettingsItem
                        name={t("Presence Penalty")}
                        description={t("Encourages the model to introduce wording it has not used yet.")}
                        value={settings.modelOptions.presence_penalty}
                        errorMessage={errors.get("modelOptions.presence_penalty")}
                        setValue={(value: number) =>
                            updateSettings({
                                modelOptions: {
                                    ...settings.modelOptions,
                                    presence_penalty: value,
                                },
                            })
                        }
                        min={MIN_PRESENCE_PENALTY}
                        max={MAX_PRESENCE_PENALTY}
                        step={0.05}
                    />
                )}
            </>)}
            {modelCapabilities.supportsMaxTokens && (
                <SliderSettingsItem
                    name={t("Max Tokens")}
                    description={t("Maximum completion length returned by the model.")}
                    value={settings.modelOptions.max_tokens}
                    errorMessage={errors.get("modelOptions.max_tokens")}
                    setValue={(value: number) =>
                        updateSettings({
                            modelOptions: {
                                ...settings.modelOptions,
                                max_tokens: value,
                            },
                        })
                    }
                    min={MIN_MAX_TOKENS}
                    max={MAX_MAX_TOKENS}
                    step={10}
                />
            )}
        </>
    );

    const renderProcessingSettings = () => (
        <>
            <h2>{t("Preprocessing")}</h2>
            <CheckBoxSettingItem
                name={t("Exclude Dataview Blocks")}
                description={t("Remove Dataview blocks before sending context to the provider.")}
                enabled={settings.dontIncludeDataviews}
                setEnabled={(value) =>
                    updateSettings({dontIncludeDataviews: value})
                }
            />
            <CheckBoxSettingItem
                name={t("Redact Sensitive Data")}
                description={t("Replace obvious emails, API tokens, bearer tokens, AWS keys, and private keys before requests.")}
                enabled={settings.redactSensitiveData}
                setEnabled={(value) =>
                    updateSettings({redactSensitiveData: value})
                }
            />
            <SliderSettingsItem
                name={t("Maximum Prefix Length")}
                description={t("Maximum characters before the cursor sent as context.")}
                value={settings.maxPrefixCharLimit}
                errorMessage={errors.get("maxPrefixCharLimit")}
                setValue={(value: number) =>
                    updateSettings({maxPrefixCharLimit: value})
                }
                min={MIN_MAX_CHAR_LIMIT}
                max={MAX_MAX_CHAR_LIMIT}
                step={100}
                suffix={" chars"}
            />
            <SliderSettingsItem
                name={t("Maximum Suffix Length")}
                description={t("Maximum characters after the cursor sent as context.")}
                value={settings.maxSuffixCharLimit}
                errorMessage={errors.get("maxSuffixCharLimit")}
                setValue={(value: number) =>
                    updateSettings({maxSuffixCharLimit: value})
                }
                min={MIN_MAX_CHAR_LIMIT}
                max={MAX_MAX_CHAR_LIMIT}
                step={100}
                suffix={" chars"}
            />
            <h2>{t("Postprocessing")}</h2>
            <CheckBoxSettingItem
                name={t("Remove Duplicate Math Markers")}
                description={t("Remove duplicate `$` markers when the cursor is already inside a math block.")}
                enabled={settings.removeDuplicateMathBlockIndicator}
                setEnabled={(value) =>
                    updateSettings({removeDuplicateMathBlockIndicator: value})
                }
            />
            <CheckBoxSettingItem
                name={t("Remove Duplicate Code Markers")}
                description={t("Remove duplicate code fence markers when the cursor is already inside a code block.")}
                enabled={settings.removeDuplicateCodeBlockIndicator}
                setEnabled={(value) =>
                    updateSettings({removeDuplicateCodeBlockIndicator: value})
                }
            />
        </>
    );

    const renderTriggerSettings = () => (
        <>
            <h2>{t("Trigger")}</h2>
            <SliderSettingsItem
                name={t("Delay")}
                description={t("Milliseconds between your last keystroke and the completion request.")}
                value={settings.delay}
                errorMessage={errors.get("delay")}
                setValue={(value: number) => updateSettings({delay: value})}
                min={MIN_DELAY}
                max={MAX_DELAY}
                step={100}
                suffix={"ms"}
            />
            <TriggerSettings
                name={t("Trigger Words")}
                description={t("Completions trigger when text before the cursor matches one of these strings or regexes.")}
                triggers={settings.triggers}
                setValues={(triggers) => updateSettings({triggers})}
                errorMessage={errors.get("triggerWords")}
                errorMessages={errors}
            />
        </>
    );

    const renderPrivacySettings = () => (
        <>
            <h2>{t("Privacy")}</h2>
            <SettingsItem
                name={t("Ignored Files")}
                description={
                    <div>
                        <p>{t("Ignore matching files or folders. Enter one glob pattern per line.")}</p>
                        <ul>
                            <li><code>path/to/folder/**</code>: ignore everything in a folder.</li>
                            <li><code>**/secret/**</code>: ignore any folder named <code>secret</code>.</li>
                            <li><code>!path/to/folder/example.md</code>: undo an ignore for one file.</li>
                        </ul>
                    </div>
                }
                display={"block"}
                errorMessage={errors.get("ignoredFilePatterns")}
            >
                <textarea
                    aria-label={t("Ignored Files")}
                    name="ignored-files"
                    className="setting-item-text-area-copilot-auto-completion"
                    rows={10}
                    placeholder="**/secret/**"
                    value={settings.ignoredFilePatterns}
                    onChange={(e) =>
                        updateSettings({
                            ignoredFilePatterns: e.target.value,
                        })
                    }
                    spellCheck={false}
                />
            </SettingsItem>
            <SettingsItem
                name={t("Ignored Tags")}
                description={t("Ignore files containing any of these tags. Enter one tag per line without #.")}
                display={"block"}
                errorMessage={errors.get("ignoredTags")}
            >
                <textarea
                    aria-label={t("Ignored Tags")}
                    name="ignored-tags"
                    className="setting-item-text-area-copilot-auto-completion"
                    rows={10}
                    placeholder="secret"
                    value={settings.ignoredTags}
                    onChange={(e) =>
                        updateSettings({
                            ignoredTags: e.target.value,
                        })
                    }
                    spellCheck={false}
                />
            </SettingsItem>
        </>
    );

    const renderSupportSettings = () => (
        <>
            <h2>{t("Support")}</h2>
            <DiagnosticsSettingItem/>
            <ReportIssueSettingItem pluginVersion={props.pluginVersion} settings={settings}/>

            <h2>{t("Danger Zone")}</h2>
            <SettingsItem
                name={t("Restore Language Defaults")}
                description={t("Replace the prompt, trigger words and few-shot examples with the {lang} defaults ({triggers} triggers, {examples} examples). API keys, endpoints and models are preserved.", {
                    lang: getLang() === "zh" ? t("Chinese") : t("English"),
                    triggers: summarizeLocalizedDefaults(getLang()).triggers,
                    examples: summarizeLocalizedDefaults(getLang()).examples,
                })}
            >
                <button
                    aria-label={t("Restore the language-specific prompt, triggers and examples")}
                    onClick={restoreLanguageDefaults}
                >
                    {t("Restore")}
                </button>
            </SettingsItem>
            <SettingsItem
                name={t("Factory Reset")}
                description={t("Restore defaults. Provider URLs, API keys, and selected models are preserved.")}
            >
                <button
                    aria-label={t("Reset to default settings")}
                    onClick={resetSettings}
                >
                    Reset
                </button>
            </SettingsItem>
        </>
    );

    const renderPromptSettings = () => (
        <>
            <h2>{t("Prompt Engineering")}</h2>
            <TextSettingItem
                name={t("Answer Extraction Regex")}
                description={t("Optional regex for removing preamble before the final completion.")}
                placeholder={t("your regex…")}
                value={settings.chainOfThoughRemovalRegex}
                errorMessage={errors.get("chainOfThoughRemovalRegex")}
                setValue={(value: string) =>
                    updateSettings({
                        chainOfThoughRemovalRegex: value,
                    })
                }
            />

            <SettingsItem
                name={t("System Message")}
                description={t("Instructions used to generate a completion.")}
                display={"block"}
                errorMessage={errors.get("systemMessage")}
            >
                <textarea
                    aria-label={t("System Message")}
                    name="system-message"
                    className="setting-item-text-area-copilot-auto-completion"
                    rows={10}
                    placeholder={t("Your system message…")}
                    value={settings.systemMessage}
                    onChange={(e) =>
                        updateSettings({
                            systemMessage: e.target.value,
                        })
                    }
                    spellCheck={false}
                />
            </SettingsItem>

            <SettingsItem
                name={t("User Message Template")}
                description={t("Template for formatting prefix and suffix with {{prefix}} and {{suffix}}.")}
                display={"block"}
                errorMessage={errors.get("userMessageTemplate")}
            >
                <textarea
                    aria-label={t("User Message Template")}
                    name="user-message-template"
                    className="setting-item-text-area-copilot-auto-completion"
                    rows={3}
                    placeholder="{{prefix}}<mask/>{{suffix}}"
                    value={settings.userMessageTemplate}
                    onChange={(e) =>
                        updateSettings({
                            userMessageTemplate: e.target.value,
                        })
                    }
                    spellCheck={false}
                />
            </SettingsItem>
            <FewShotExampleSettings
                fewShotExamples={settings.fewShotExamples}
                name={t("Few-Shot Examples")}
                description={t("Examples that teach the model the expected completion format for each context.")}
                setFewShotExamples={(value) =>
                    updateSettings({fewShotExamples: value})
                }
                errorMessages={errors}
            />
        </>
    );

    const renderAdvancedSettings = () => (
        <>
            <CheckBoxSettingItem
                name={t("Advanced Settings")}
                description={t("Show provider switching, endpoints, model parameters, triggers, privacy, diagnostics, reset, and prompts.")}
                enabled={settings.advancedMode}
                setEnabled={(value) => updateSettings({advancedMode: value})}
            />

            {settings.advancedMode && (
                <>
                    <h2>{t("General")}</h2>
                    <DropDownSettingItem
                        name={t("Interface language")}
                        description={t("Takes effect immediately. Auto follows the Obsidian app language.")}
                        value={getLangSetting()}
                        setValue={(value) => {
                            if (value === "auto") {
                                resetLang();
                            } else {
                                setLang(value === "zh" ? "zh" : "en");
                            }
                            updateSettings({});
                        }}
                        options={{auto: t("Auto"), zh: t("Chinese"), en: t("English")}}
                    />
                    <CheckBoxSettingItem
                        name={t("Cache Completions")}
                        description={t("Reuse recent completions after accepting or rejecting them.")}
                        enabled={settings.cacheSuggestions}
                        setEnabled={(value) => updateSettings({cacheSuggestions: value})}
                    />
                    <CheckBoxSettingItem
                        name={t("Debug Mode")}
                        description={t("Log request and response summaries. Note contents and API keys are not logged.")}
                        enabled={settings.debugMode}
                        setEnabled={(value) => updateSettings({debugMode: value})}
                    />
                    {renderAdvancedApiSettings()}
                    {renderModelOptions()}
                    {renderProcessingSettings()}
                    {renderTriggerSettings()}
                    {renderPrivacySettings()}
                    {renderSupportSettings()}
                    {renderPromptSettings()}
                </>
            )}
        </>
    );

    const currentEndpoint = (provider: Settings["apiProvider"]): string => {
        if (provider === "openai") {
            return settings.openAIApiSettings.url;
        }
        if (provider === "anthropic") {
            return settings.anthropicApiSettings.url;
        }
        if (provider === "openrouter") {
            return settings.openRouterApiSettings.url;
        }
        if (provider === "deepseek") {
            return settings.deepSeekApiSettings.url;
        }
        if (provider === "gemini") {
            return settings.geminiApiSettings.url;
        }
        if (provider === "azure") {
            return settings.azureOAIApiSettings.url;
        }
        return settings.ollamaApiSettings.url;
    };

    const defaultEndpoint = (provider: Settings["apiProvider"]): string => {
        if (provider === "openai") {
            return DEFAULT_SETTINGS.openAIApiSettings.url;
        }
        if (provider === "anthropic") {
            return DEFAULT_SETTINGS.anthropicApiSettings.url;
        }
        if (provider === "openrouter") {
            return DEFAULT_SETTINGS.openRouterApiSettings.url;
        }
        if (provider === "deepseek") {
            return DEFAULT_SETTINGS.deepSeekApiSettings.url;
        }
        if (provider === "gemini") {
            return DEFAULT_SETTINGS.geminiApiSettings.url;
        }
        if (provider === "azure") {
            return DEFAULT_SETTINGS.azureOAIApiSettings.url;
        }
        return DEFAULT_SETTINGS.ollamaApiSettings.url;
    };

    const endpointError = (provider: Settings["apiProvider"]): string | undefined => {
        if (provider === "openai") {
            return errors.get("openAIApiSettings.url");
        }
        if (provider === "anthropic") {
            return errors.get("anthropicApiSettings.url");
        }
        if (provider === "openrouter") {
            return errors.get("openRouterApiSettings.url");
        }
        if (provider === "deepseek") {
            return errors.get("deepSeekApiSettings.url");
        }
        if (provider === "gemini") {
            return errors.get("geminiApiSettings.url");
        }
        if (provider === "azure") {
            return errors.get("azureOAIApiSettings.url");
        }
        return errors.get("ollamaApiSettings.url");
    };

    const verifiedModelFor = (provider: Settings["apiProvider"]): string | undefined => {
        return verifiedConnection?.provider === provider
            && verifiedConnection.revision === connectionRevision
            ? verifiedConnection.model
            : undefined;
    };

    return (
        <div>
            {renderQuickSetup()}
            {renderAdvancedSettings()}
        </div>
    );
}

function modelFor(settings: Settings): string {
    if (settings.apiProvider === "openai") {
        return settings.openAIApiSettings.model;
    }
    if (settings.apiProvider === "anthropic") {
        return settings.anthropicApiSettings.model;
    }
    if (settings.apiProvider === "openrouter") {
        return settings.openRouterApiSettings.model;
    }
    if (settings.apiProvider === "deepseek") {
        return settings.deepSeekApiSettings.model;
    }
    if (settings.apiProvider === "gemini") {
        return settings.geminiApiSettings.model;
    }
    if (settings.apiProvider === "azure") {
        return t("Azure deployment");
    }
    return settings.ollamaApiSettings.model;
}

function keyFor(settings: Settings): string {
    if (settings.apiProvider === "openai") {
        return settings.openAIApiSettings.key;
    }
    if (settings.apiProvider === "anthropic") {
        return settings.anthropicApiSettings.key;
    }
    if (settings.apiProvider === "openrouter") {
        return settings.openRouterApiSettings.key;
    }
    if (settings.apiProvider === "deepseek") {
        return settings.deepSeekApiSettings.key;
    }
    if (settings.apiProvider === "gemini") {
        return settings.geminiApiSettings.key;
    }
    if (settings.apiProvider === "azure") {
        return settings.azureOAIApiSettings.key;
    }
    return "";
}

function endpointFor(settings: Settings): string {
    if (settings.apiProvider === "openai") {
        return settings.openAIApiSettings.url;
    }
    if (settings.apiProvider === "anthropic") {
        return settings.anthropicApiSettings.url;
    }
    if (settings.apiProvider === "openrouter") {
        return settings.openRouterApiSettings.url;
    }
    if (settings.apiProvider === "deepseek") {
        return settings.deepSeekApiSettings.url;
    }
    if (settings.apiProvider === "gemini") {
        return settings.geminiApiSettings.url;
    }
    if (settings.apiProvider === "azure") {
        return settings.azureOAIApiSettings.url;
    }
    return settings.ollamaApiSettings.url;
}

function sameConnectionConfiguration(left: Settings, right: Settings): boolean {
    return left.apiProvider === right.apiProvider
        && modelFor(left) === modelFor(right)
        && keyFor(left) === keyFor(right)
        && endpointFor(left) === endpointFor(right);
}
