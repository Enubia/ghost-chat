import { useFetch } from '@vueuse/core';

import { delay } from './utils/delay';
import { StoreDefaults } from '#ipc/constants/store';

export const FETCH_VIDEO_ID_ERROR = 'fetch-video-id-error' as const;
export const TIMEOUT_EXCEEDED = 'timeout-exceeded' as const;
export const UNEXPECTED_ERROR = 'unexpected-error' as const;

export async function getYoutubeChatURL(channelId: string, options: Partial<Youtube>) {
    const FIVE_SECONDS = 1000 * (options.fetch_delay || StoreDefaults.options.youtube.fetch_delay);

    let tries = options.retries || StoreDefaults.options.retries;

    const { abort, error, data, execute } = useFetch(`https://www.youtube.com/embed/live_stream?channel=${channelId}`).get().text();

    do {
        await execute();

        if (error) {
            return UNEXPECTED_ERROR;
        }

        const videoId = data.value?.match(/"VIDEO_ID":"(.*?)"/)?.at(1);

        if (videoId && videoId !== 'live_stream') {
            return new URL(`https://www.youtube.com/live_chat?is_popout=1&v=${videoId}`);
        } else {
            tries--;
            await delay(FIVE_SECONDS);
        }
    } while (tries > 0);

    abort();
    return TIMEOUT_EXCEEDED;
}
