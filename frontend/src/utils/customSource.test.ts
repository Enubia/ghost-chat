import { describe, expect, it } from 'vitest';

import { isValidSourceURL } from './customSource';

describe('isValidSourceURL', () => {
    describe('accepts valid http/https URLs', () => {
        it('accepts https with domain', () => {
            expect(isValidSourceURL('https://example.com')).toBe(true);
        });

        it('accepts http with localhost and port', () => {
            expect(isValidSourceURL('http://localhost:8080/overlay')).toBe(true);
        });

        it('accepts https with query string and fragment', () => {
            expect(isValidSourceURL('https://x.io/a?token=abc&b=1#frag')).toBe(true);
        });
    });

    describe('does not mutate the input string', () => {
        it('returns stable results across repeated calls with query+fragment', () => {
            const input = 'https://x.io/a?token=abc&b=1#frag';

            const first = isValidSourceURL(input);
            const second = isValidSourceURL(input);

            expect(first).toBe(true);
            expect(second).toBe(true);
            expect(input).toBe('https://x.io/a?token=abc&b=1#frag');
        });
    });

    describe('rejects invalid inputs', () => {
        it('rejects empty string', () => {
            expect(isValidSourceURL('')).toBe(false);
        });

        it('rejects whitespace-only string', () => {
            expect(isValidSourceURL('   ')).toBe(false);
        });

        it('rejects javascript: scheme', () => {
            expect(isValidSourceURL('javascript:alert(1)')).toBe(false);
        });

        it('rejects file: scheme', () => {
            expect(isValidSourceURL('file:///etc/passwd')).toBe(false);
        });

        it('rejects data: scheme', () => {
            expect(isValidSourceURL('data:text/html,x')).toBe(false);
        });

        it('rejects ftp: scheme', () => {
            expect(isValidSourceURL('ftp://x')).toBe(false);
        });

        it('rejects bare domain with no scheme', () => {
            expect(isValidSourceURL('example.com')).toBe(false);
        });

        it('rejects relative path', () => {
            expect(isValidSourceURL('/relative/path')).toBe(false);
        });
    });
});
