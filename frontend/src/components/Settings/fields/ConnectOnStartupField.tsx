import { useTranslation } from 'react-i18next';

import { Toggle } from '@/components/Toggle';

interface ConnectOnStartupFieldProps {
    checked: boolean;
    channel: string;
    onChange: (checked: boolean) => void;
}

export function ConnectOnStartupField({ checked, channel, onChange }: ConnectOnStartupFieldProps) {
    const { t } = useTranslation();
    const hasChannel = channel.trim() !== '';

    return (
        <>
            <div className="field-row">
                <label className="field-label">{t('settings.platform.connect_on_startup')}</label>
                <Toggle
                    checked={checked}
                    disabled={!hasChannel}
                    onChange={onChange}
                />
            </div>

            {!hasChannel && <span className="field-hint">{t('settings.platform.connect_on_startup_hint')}</span>}
        </>
    );
}
