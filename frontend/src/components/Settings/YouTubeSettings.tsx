import { useConfigStore } from '@/stores/config';

export function YouTubeSettings() {
    const config = useConfigStore((s) => s.config);
    const update = useConfigStore((s) => s.update);
    const yt = config?.youtube;

    const set = (partial: Record<string, any>) => update({ youtube: partial });

    return (
        <>
            <div className="field">
                <label className="field-label">Channel ID</label>
                <input
                    type="text"
                    value={yt?.channel_id ?? ''}
                    onChange={(e) => set({ channel_id: e.target.value })}
                    placeholder="UC..."
                />
            </div>

            <div className="field">
                <label className="field-label">Default Channel ID</label>
                <input
                    type="text"
                    value={yt?.default_channel_id ?? ''}
                    onChange={(e) => set({ default_channel_id: e.target.value })}
                    placeholder="UC..."
                />
            </div>

            <div className="field">
                <label className="field-label">Video URL</label>
                <input
                    type="url"
                    value={yt?.video_url ?? ''}
                    onChange={(e) => set({ video_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                />
            </div>

            <div className="field">
                <label className="field-label">Retries</label>
                <input
                    type="number"
                    value={yt?.retries ?? 50}
                    onChange={(e) => set({ retries: Number(e.target.value) })}
                    min={1}
                />
            </div>

            <div className="field">
                <label className="field-label">Fetch Delay (seconds)</label>
                <input
                    type="number"
                    value={yt?.fetch_delay ?? 5}
                    onChange={(e) => set({ fetch_delay: Number(e.target.value) })}
                    min={1}
                />
            </div>

            <div className="field">
                <label className="field-label">User Blacklist</label>
                <input
                    type="text"
                    value={(yt?.user_blacklist ?? []).join(', ')}
                    onChange={(e) =>
                        set({ user_blacklist: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })
                    }
                    placeholder="user1, user2, ..."
                />
            </div>
        </>
    );
}
