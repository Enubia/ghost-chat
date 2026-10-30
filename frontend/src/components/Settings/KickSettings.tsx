import type { KickConfig } from '@bindings/ghost-chat/internal/config/models.js';

import type { DeepPartial } from '@/types/utils';

import { useConfigStore } from '@/stores/config';
import { validateKickChannel } from '@/utils/validate';

import { BlacklistField } from './fields/BlacklistField';
import { ChannelField } from './fields/ChannelField';
import { ConnectOnStartupField } from './fields/ConnectOnStartupField';
import { FadeControls } from './fields/FadeControls';

export function KickSettings() {
    const kick = useConfigStore((s) => s.config?.kick);
    const update = useConfigStore((s) => s.update);

    const set = (partial: DeepPartial<KickConfig>) => update({ kick: partial });

    return (
        <>
            <ChannelField
                initialValue={kick?.default_channel ?? ''}
                labelKey="settings.platform.default_channel"
                placeholderKey="settings.kick.default_channel_placeholder"
                onSave={(v) => set({ default_channel: v })}
                normalize={(v) => v.toLowerCase()}
                validator={validateKickChannel}
            />

            <ConnectOnStartupField
                checked={kick?.connect_on_startup ?? false}
                channel={kick?.default_channel ?? ''}
                onChange={(v) => set({ connect_on_startup: v })}
            />

            <FadeControls
                fade={kick?.fade ?? false}
                fadeTimeout={kick?.fade_timeout ?? 30}
                onFadeChange={(v) => set({ fade: v })}
                onFadeTimeoutChange={(v) => set({ fade_timeout: v })}
            />

            <BlacklistField
                initialValue={kick?.user_blacklist ?? []}
                onSave={(v) => set({ user_blacklist: v })}
            />
        </>
    );
}
