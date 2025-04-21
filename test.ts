// Function to get live video ID from a channel
async function getLiveVideoID(channelId: string): Promise<string> {
    // Fetch the livestream page
    const response = await fetch(`https://www.youtube.com/embed/live_stream?channel=${channelId}`);

    if (!response.ok) {
        throw new Error("Couldn't fetch data");
    }

    const data = await response.text();

    // Find the video ID using regex
    const matches = data.match(/"VIDEO_ID":"(.*?)"/);

    if (matches && matches[1]) {
        return matches[1];
    } else {
        throw new Error("Couldn't find video ID");
    }
}

// Main function that gets chat URL
// eslint-disable-next-line unused-imports/no-unused-vars
async function getYoutubeChatURL(channelId: string): Promise<string> {
    try {
        const videoId = await getLiveVideoID(channelId);

        // Return the Chat URL
        return `https://www.youtube.com/live_chat?v=${videoId}`;
    } catch (error) {
    // Handle the error
        if (error instanceof Error) {
            throw new TypeError(`ERROR: ${error.message}`);
        }
        throw new Error('An unknown error occurred');
    }
}

// getYoutubeChatURL(process.argv[2].toString())
//     .then(url => console.log(url))
//     .catch(error => console.error(error));
