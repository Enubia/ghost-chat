import { describe, expect, it } from 'vitest';

import { validateReport } from './reportValidation';

const valid = { title: 'App crashes', description: 'It closes', steps: '', discord: '' };

describe('validateReport', () => {
    it('accepts a valid report', () => {
        expect(validateReport(valid)).toEqual({});
    });

    it('rejects short and long titles after trim', () => {
        expect(validateReport({ ...valid, title: '  abc  ' }).title).toBe('validation.report_title');
        expect(validateReport({ ...valid, title: 'a'.repeat(121) }).title).toBe('validation.report_title');
        expect(validateReport({ ...valid, title: 'a'.repeat(120) }).title).toBeUndefined();
    });

    it('requires a description up to 5000 code points', () => {
        expect(validateReport({ ...valid, description: '   ' }).description).toBe('validation.report_description');
        expect(validateReport({ ...valid, description: 'a'.repeat(5001) }).description).toBe(
            'validation.report_description'
        );
        expect(validateReport({ ...valid, description: '😀'.repeat(5000) }).description).toBeUndefined();
    });

    it('limits steps to 5000 code points', () => {
        expect(validateReport({ ...valid, steps: 'a'.repeat(5001) }).steps).toBe('validation.report_steps');
        expect(validateReport({ ...valid, steps: '😀'.repeat(5000) }).steps).toBeUndefined();
    });

    it('accepts discord usernames with optional @ and any case', () => {
        expect(validateReport({ ...valid, discord: '@Some_User.1' }).discord).toBeUndefined();
        expect(validateReport({ ...valid, discord: '' }).discord).toBeUndefined();
    });

    it('rejects invalid discord usernames', () => {
        for (const discord of ['a', '@a', 'a'.repeat(33), 'a..b', 'bad name', 'ü‑ser']) {
            expect(validateReport({ ...valid, discord }).discord, discord).toBe('validation.report_discord');
        }
    });
});
