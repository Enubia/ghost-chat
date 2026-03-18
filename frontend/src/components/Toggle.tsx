interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

export function Toggle({ checked, onChange, disabled }: ToggleProps) {
    return (
        <label className="toggle">
            <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className="toggle-slider" />
        </label>
    );
}
