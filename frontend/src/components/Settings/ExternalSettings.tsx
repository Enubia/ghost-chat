import { useConfigStore } from '@/stores/config';

export function ExternalSettings() {
    const config = useConfigStore((s) => s.config);
    const update = useConfigStore((s) => s.update);
    const ext = config?.external;

    const set = (partial: Record<string, any>) => update({ external: partial });

    return (
        <>
            <div className="field">
                <label className="field-label">Default URL</label>
                <input
                    type="url"
                    value={ext?.default_url ?? ''}
                    onChange={(e) => set({ default_url: e.target.value })}
                    placeholder="https://..."
                />
            </div>

            <div className="field">
                <label className="field-label">Sources</label>
                <input
                    type="text"
                    value={(ext?.sources ?? []).join(', ')}
                    onChange={(e) =>
                        set({
                            sources: e.target.value
                                .split(',')
                                .map((s: string) => s.trim())
                                .filter(Boolean),
                        })
                    }
                    placeholder="https://url1.com, https://url2.com"
                />
            </div>
        </>
    );
}
