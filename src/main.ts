import {Editor, MarkdownView, Notice, Plugin, TFile} from "obsidian";
import {SettingTab} from "./settings/SettingsTab";
import EventListener from "./event_listener";
import StatusBar from "./status_bar";
import DocumentChangesListener, {
    getPrefix, getSuffix,
    hasMultipleCursors,
    hasSelection
} from "./render_plugin/document_changes_listener";
import {EditorView} from "@codemirror/view";
import RenderSuggestionPlugin from "./render_plugin/render_surgestion_plugin";
import {InlineSuggestionState} from "./render_plugin/states";
import CompletionKeyWatcher from "./render_plugin/completion_key_watcher";
import {DEFAULT_SETTINGS, DEFAULT_SYSTEM_MESSAGE_ZH, Settings} from "./settings/versions";
import {deserializeSettings, serializeSettings} from "./settings/utils";
import { t, isZh } from "./i18n";


export default class CopilotPlugin extends Plugin {
    onload(): void {
        void this.initialize().catch(() => {
            new Notice(t("Copilot: Could not initialize the plugin."));
        });
    }

    private async initialize(): Promise<void> {
        const settings = await this.loadSettings();

        const settingsTab = SettingTab.addSettingsTab(
            this,
            settings,
            (updatedSettings) => this.saveSettings(updatedSettings)
        );
        const statusBar = StatusBar.fromApp(this);

        const eventListener = EventListener.fromSettings(
            settingsTab.settings,
            statusBar,
            this.app,
            this.manifest.version
        );
        settingsTab.addObserver(eventListener);
        this.registerEditorExtension([
            InlineSuggestionState,
            CompletionKeyWatcher(
                () => eventListener.handleAcceptKeyPressed(),
                () => eventListener.handlePartialAcceptKeyPressed(),
                () => eventListener.handleCancelKeyPressed(),
            ),
            DocumentChangesListener(
                (documentChange) => eventListener.handleDocumentChange(documentChange)
            ),
            RenderSuggestionPlugin(),
        ]);

        this.app.workspace.onLayoutReady(() => {
            const view = this.app.workspace.getActiveViewOfType(MarkdownView);

            if (view) {
                // @ts-expect-error, not typed
                const editorView = view.editor.cm as EditorView;
                eventListener.onViewUpdate(editorView);
            }
        });
        this.app.workspace.on("active-leaf-change", (leaf) => {
            if (leaf?.view instanceof MarkdownView) {
                // @ts-expect-error, not typed
                const editorView = leaf.view.editor.cm as EditorView;
                eventListener.onViewUpdate(editorView);
                if (leaf.view.file !== null) {
                    eventListener.handleFileChange(leaf.view.file);
                }
            }
        });
        this.app.metadataCache.on("changed", (file: TFile) => {
            eventListener.handleFileChange(file);
        });
        this.addCommand({
            id: "accept",
            name: t("Accept"),
            editorCheckCallback: (
                checking: boolean,
                editor: Editor,
                view: MarkdownView
            ) => {
                if (checking) {
                    return (
                        eventListener.isSuggesting()
                    );
                }

                eventListener.handleAcceptCommand();

                return true;
            },
        });

        this.addCommand({
            id: "predict",
            name: t("Predict"),
            editorCheckCallback: (
                checking: boolean,
                editor: Editor,
                view: MarkdownView
            ) => {
                // @ts-expect-error, not typed
                const editorView = editor.cm as EditorView;
                const state = editorView.state;
                if (checking) {
                    return eventListener.isIdle() && !hasMultipleCursors(state) && !hasSelection(state);
                }

                const prefix = getPrefix(state)
                const suffix = getSuffix(state)

                eventListener.handlePredictCommand(prefix, suffix);
                return true;
            },
        });

        this.addCommand({
            id: "toggle",
            name: t("Toggle"),
            callback: () => {
                const newValue = !settingsTab.settings.enabled;
                settingsTab.setEnable(newValue);
            },
        });
        this.addCommand({
            id: "enable",
            name: t("Enable"),
            checkCallback: (checking) => {
                if (checking) {
                    return !settingsTab.settings.enabled;
                }

                settingsTab.setEnable(true);
                return true;
            },
        });
        this.addCommand({
            id: "disable",
            name: t("Disable"),
            checkCallback: (checking) => {
                if (checking) {
                    return settingsTab.settings.enabled;
                }

                settingsTab.setEnable(false);
                return true;
            },
        });

    }

    private async saveSettings(settings: Settings): Promise<void> {
        const data = serializeSettings(settings);
        await this.saveData(data);
    }

    private async loadSettings(): Promise<Settings> {
        const data: unknown = await this.loadData();
        const isFirstRun = data === null || data === undefined;
        const result = deserializeSettings(data);
        if (result.isOk()) {
            const settings = result.value;
            if (isFirstRun && isZh()) {
                settings.systemMessage = DEFAULT_SYSTEM_MESSAGE_ZH;
                const known = new Set(settings.triggers.map((trigger) => trigger.value));
                for (const punctuation of ["。", "，", "：", "；", "！", "？"]) {
                    if (!known.has(punctuation)) {
                        settings.triggers.push({type: "string", value: punctuation});
                    }
                }
            }
            return settings;
        } else {
            new Notice(t("Copilot: Could not load settings, reverting to default settings"));
            console.error(result.error);
            return DEFAULT_SETTINGS
        }
    }

    onunload() {
    }
}
