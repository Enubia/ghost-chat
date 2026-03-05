interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export function Toggle({ checked, onChange }: ToggleProps) {
    return (
        <label className="toggle">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className="toggle-slider" />
        </label>
    );
}
