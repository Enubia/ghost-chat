import FetchVideoIdError from '#shared/errors/fetchvideoiderror';
import StreamNotStartedError from '#shared/errors/streamnotstartederror';
import { delay } from '#shared/utils/delay';

const FIVE_SECONDS = 1000 * 5;
export const FETCH_VIDEO_ID_ERROR = 'fetch-video-id-error' as const;
export const TIMEOUT_EXCEEDED = 'timeout-exceeded' as const;

async function getLiveVideoID(channelId: string) {
    const response = await fetch(`https://www.youtube.com/embed/live_stream?channel=${channelId}`);

    if (!response.ok) {
        throw new FetchVideoIdError();
    }

    const data = await response.text();

    const matches = data.match(/"VIDEO_ID":"(.*?)"/)?.at(1);

    if (matches) {
        return matches;
    } else {
        throw new StreamNotStartedError();
    }
}

export async function getYoutubeChatURL(channelId: string) {
    let tries = 50;

    do {
        try {
            const videoId = await getLiveVideoID(channelId);
            return new URL(`https://www.youtube.com/live_chat?is_popout=1&v=${videoId}`);
        } catch (error) {
            if (error instanceof FetchVideoIdError) {
                return FETCH_VIDEO_ID_ERROR;
            }

            if (error instanceof StreamNotStartedError) {
                tries--;
                await delay(FIVE_SECONDS);
            }
        }
    } while (tries > 0);

    return TIMEOUT_EXCEEDED;
}
