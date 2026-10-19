import * as React from "react";
import SettingsItem from "./SettingsItem";
import { useRef } from "react";

interface IProps {
    name: string;
    description: string;

    setValue(value: number): void;

    errorMessage?: string;
    suffix?: string;

    value: number;
    min: number;
    max: number;
    step: number;
}

export default function SliderSettingsItem(props: IProps): React.JSX.Element {
    const { errorMessage } = props;

    const [isFocused, setIsFocused] = React.useState<boolean>(false);
    const sliderRef = useRef<HTMLInputElement>(null);

    // Draft value for the number input: do not follow the slider while editing.
    const [inputText, setInputText] = React.useState<string>(String(props.value));
    const [isEditing, setIsEditing] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (!isEditing) {
            setInputText(String(props.value));
        }
    }, [props.value, isEditing]);

    const clamp = (raw: number): number => {
        let value = Math.min(props.max, Math.max(props.min, raw));
        if (props.step > 0) {
            const steps = Math.round((value - props.min) / props.step);
            value = props.min + steps * props.step;
            // Guard against float artifacts such as 0.30000000000000004
            value = Number(value.toFixed(6));
            value = Math.min(props.max, Math.max(props.min, value));
        }
        return value;
    };

    const commitInput = () => {
        setIsEditing(false);
        const parsed = Number(inputText);
        if (Number.isNaN(parsed)) {
            setInputText(String(props.value));
            return;
        }
        const next = clamp(parsed);
        setInputText(String(next));
        if (next !== props.value) {
            props.setValue(next);
        }
    };

    const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = Number(e.target.value);
        if (isNaN(value)) {
            return;
        }
        value = Math.min(props.max, Math.max(props.min, value));
        props.setValue(value);
    };
    const displayValue = props.value + (props.suffix ? props.suffix : "");

    return (
        <SettingsItem
            name={props.name}
            description={props.description}
            errorMessage={errorMessage}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    width: "100%",
                    justifyContent: "flex-end",
                }}
            >
                <input
                    ref={sliderRef}
                    onChange={onValueChange}
                    className="slider"
                    type="range"
                    min={props.min}
                    max={props.max}
                    step={props.step}
                    value={props.value}
                    onMouseEnter={() => setIsFocused(true)}
                    onMouseLeave={() => setIsFocused(false)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />

                <input
                    type="number"
                    className=""
                    style={{ width: "84px", flex: "0 0 auto" }}
                    min={props.min}
                    max={props.max}
                    step={props.step}
                    value={inputText}
                    title={t("Range {min} ~ {max}, step {step}", {min: props.min, max: props.max, step: props.step})}
                    aria-label={props.name}
                    onFocus={() => setIsEditing(true)}
                    onChange={(e) => {
                        setIsEditing(true);
                        setInputText(e.target.value);
                    }}
                    onBlur={commitInput}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            (e.target as HTMLInputElement).blur();
                        }
                        if (e.key === "Escape") {
                            setInputText(String(props.value));
                            setIsEditing(false);
                            (e.target as HTMLInputElement).blur();
                        }
                    }}
                />

                {props.suffix !== undefined && (
                    <span
                        className="setting-item-description"
                        style={{ flex: "0 0 auto" }}
                    >
                        {props.suffix}
                    </span>
                )}
            </div>

            {isFocused && sliderRef.current !== null && (
                <div
                    className="tooltip mod-top"
                    style={{
                        top: sliderRef.current.getBoundingClientRect().top - 30,
                        left:
                            sliderRef.current.getBoundingClientRect().left +
                            sliderRef.current.getBoundingClientRect().width / 2,
                    }}
                >
                    {displayValue}
                </div>
            )}
        </SettingsItem>
    );
}
