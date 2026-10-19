import * as React from "react";

import SettingsItem from "./SettingsItem";
import {getLastRequestDiagnostics} from "../../prediction_services/diagnostics";
import { t } from "../../i18n";

export default function DiagnosticsSettingItem(): React.JSX.Element {
    const diagnostics = getLastRequestDiagnostics();

    if (!diagnostics) {
        return (
            <SettingsItem
                name={t("Last request diagnostics")}
                description={t("Local-only diagnostics will appear here after a connection test or completion request.")}
            >
                <span>{t("Not available")}</span>
            </SettingsItem>
        );
    }

    return (
        <SettingsItem
            name={t("Last request diagnostics")}
            description={t("Local-only diagnostics. This does not include API keys or note contents.")}
            display={"block"}
        >
            <div>
                <p>{t("Provider")}: {diagnostics.provider}</p>
                <p>{t("Model")}: {diagnostics.model}</p>
                <p>{t("Endpoint")}: {diagnostics.endpoint}</p>
                <p>{t("Request chars")}: {diagnostics.requestCharCount ?? t("Unknown")}</p>
                <p>{t("Response chars")}: {diagnostics.responseCharCount ?? t("Unknown")}</p>
                <p>{t("Finish reason")}: {diagnostics.finishReason ?? t("Unknown")}</p>
                <p>{t("Output tokens")}: {diagnostics.outputTokenCount ?? t("Unknown")}</p>
                <p>{t("Reasoning tokens")}: {diagnostics.reasoningTokenCount ?? t("Unknown")}</p>
                <p>{t("Reasoning chars")}: {diagnostics.reasoningCharCount ?? t("Unknown")}</p>
                <p>{t("Latency")}: {diagnostics.latencyMs ?? t("Unknown")} {t("ms")}</p>
                <p>{t("Retries")}: {diagnostics.retryCount ?? 0}</p>
                <p>{t("Error")}: {diagnostics.errorCode ?? t("None")}</p>
                <p>{t("Prompt bundle")}: {diagnostics.promptBundleVersion ?? t("Unknown")}</p>
            </div>
        </SettingsItem>
    );
}
