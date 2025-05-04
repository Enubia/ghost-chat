export default class FetchVideoIdError extends Error {
    constructor() {
        super();
        this.message = 'failed-to-fetch-video-id';
    }
}
