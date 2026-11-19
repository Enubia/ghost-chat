import type React from 'react';

import { useEffect, useState } from 'react';
import { continueRender, delayRender } from 'remotion';

export function Preload({ urls, children }: { urls: string[]; children: React.ReactNode }) {
    const [handle] = useState(() => delayRender('Loading chat images'));

    useEffect(() => {
        const load = (url: string) =>
            new Promise<void>((resolve) => {
                const img = new Image();
                img.addEventListener('load', () => resolve());
                img.addEventListener('error', () => resolve());
                img.src = url;
            });

        void Promise.all(urls.map(load)).then(() => continueRender(handle));
    }, [handle, urls]);

    return children;
}
