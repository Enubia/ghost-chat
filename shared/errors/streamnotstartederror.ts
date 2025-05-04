export default class StreamNotStartedError extends Error {
    constructor() {
        super();
        this.message = 'stream-not-started';
    }
}
