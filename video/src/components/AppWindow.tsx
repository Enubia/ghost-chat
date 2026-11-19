import type React from 'react';

import appStyles from '@/App.module.css';
import { TitleBar } from '@/components/TitleBar/TitleBar';

export interface WindowProps {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
    vanish?: number;
    settings?: React.ReactNode;
    settingsWidth?: number;
    children: React.ReactNode;
}

export function AppWindow({
    x,
    y,
    width,
    height,
    scale,
    vanish = 0,
    settings,
    settingsWidth = 0,
    children,
}: WindowProps) {
    const vanished = vanish >= 1;
    const chrome = 1 - vanish;

    return (
        <div
            data-vanished={vanished || undefined}
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width,
                height,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                borderRadius: 10,
                overflow: 'hidden',
                boxShadow: `0 30px 80px rgba(0, 0, 0, ${0.55 * chrome}), 0 0 0 1px rgba(255, 255, 255, ${0.08 * chrome})`,
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--color-bg)',
                    opacity: chrome,
                }}
            />
            <div
                className={appStyles.app}
                style={{ height: '100%', position: 'relative' }}
            >
                <div style={{ opacity: chrome }}>
                    <TitleBar
                        onSettingsToggle={() => {}}
                        settingsOpen={settingsWidth > 0}
                        updateInfo={null}
                    />
                </div>
                <div className={appStyles.body}>
                    {settings && settingsWidth > 0 && (
                        <div
                            className={appStyles.settingsPanel}
                            style={{ width: settingsWidth }}
                        >
                            <div style={{ width: 400, height: '100%' }}>{settings}</div>
                        </div>
                    )}
                    <div className={appStyles.main}>{children}</div>
                </div>
            </div>
        </div>
    );
}
