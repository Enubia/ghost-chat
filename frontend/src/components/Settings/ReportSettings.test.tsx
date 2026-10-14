import type { ReportFormProps } from './ReportSettings';

import { Diagnostics, Result } from '@bindings/ghost-chat/internal/bugreport/models.js';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { ReportForm } from './ReportSettings';
import { submitReport } from './reportSubmit';

const submit = vi.hoisted(() => vi.fn());

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key} ${JSON.stringify(opts)}` : key),
    }),
}));

vi.mock('@bindings/ghost-chat/app.js', () => ({
    PreviewDiagnostics: vi.fn(),
    SubmitBugReport: submit,
}));

const diagnostics = new Diagnostics({
    appVersion: '4.2.0',
    os: 'darwin',
    arch: 'arm64',
    platforms: ['twitch', 'kick'],
    logs: 'LOGLINE-1',
});

const base: ReportFormProps = {
    values: { title: '', description: '', steps: '', discord: '' },
    errors: {},
    status: 'idle',
    reportId: 0,
    includeDiagnostics: true,
    diagnostics,
    onChange: () => {},
    onIncludeChange: () => {},
    onSubmit: () => {},
};

function render(props: Partial<ReportFormProps> = {}) {
    return renderToStaticMarkup(<ReportForm {...{ ...base, ...props }} />);
}

describe('ReportForm', () => {
    it('shows field errors', () => {
        const html = render({ errors: { title: 'validation.report_title', discord: 'validation.report_discord' } });

        expect(html).toContain('validation.report_title');
        expect(html).toContain('validation.report_discord');
        expect(html).not.toContain('validation.report_description');
    });

    it('shows the discord hint', () => {
        expect(render()).toContain('settings.report.discord_hint');
    });

    it('shows the sent state with the report id', () => {
        const html = render({ status: 'sent', reportId: 42 });

        expect(html).toContain('settings.report.sent');
        expect(html).toContain('&quot;id&quot;:42');
        expect(html).not.toContain('settings.report.rate_limited');
    });

    it('shows the error state', () => {
        const html = render({ status: 'error' });

        expect(html).toContain('settings.report.error');
        expect(html).not.toContain('settings.report.sent');
    });

    it('shows the rate limited state', () => {
        expect(render({ status: 'rate_limited' })).toContain('settings.report.rate_limited');
    });

    it('shows the fallback state', () => {
        expect(render({ status: 'fallback' })).toContain('settings.report.fallback');
    });

    it('disables submit while sending', () => {
        expect(render({ status: 'sending' })).toMatch(/<button[^>]*type="submit"[^>]*disabled/);
        expect(render({ status: 'idle' })).not.toMatch(/<button[^>]*type="submit"[^>]*disabled/);
    });

    it('shows the diagnostics preview when checked', () => {
        const html = render();

        expect(html).toContain('4.2.0');
        expect(html).toContain('darwin');
        expect(html).toContain('twitch, kick');
        expect(html).toContain('LOGLINE-1');
    });

    it('hides the diagnostics preview when unchecked', () => {
        const html = render({ includeDiagnostics: false });

        expect(html).not.toContain('4.2.0');
        expect(html).not.toContain('LOGLINE-1');
    });
});

describe('submitReport', () => {
    const values = { title: 'App crashes', description: 'It closes', steps: '', discord: '@me_1' };

    it('returns client errors without calling the backend', async () => {
        submit.mockClear();

        const out = await submitReport({ ...values, title: 'x' }, true);

        expect(out).toEqual({ status: 'invalid', errors: { title: 'validation.report_title' } });
        expect(submit).not.toHaveBeenCalled();
    });

    it('passes the input to the backend and returns sent', async () => {
        submit.mockResolvedValue(new Result({ status: 'sent', id: 7 }));

        const out = await submitReport(values, false);

        expect(submit).toHaveBeenCalledWith({ ...values, includeDiagnostics: false });
        expect(out).toEqual({ status: 'sent', id: 7 });
    });

    it('maps backend invalid field to an error', async () => {
        submit.mockResolvedValue(new Result({ status: 'invalid', field: 'discord' }));

        expect(await submitReport(values, true)).toEqual({
            status: 'invalid',
            errors: { discord: 'validation.report_discord' },
        });
    });

    it('passes through rate_limited and fallback', async () => {
        submit.mockResolvedValue(new Result({ status: 'rate_limited', retryAfter: 60 }));

        expect(await submitReport(values, true)).toEqual({ status: 'rate_limited' });

        submit.mockResolvedValue(new Result({ status: 'fallback' }));

        expect(await submitReport(values, true)).toEqual({ status: 'fallback' });
    });

    it('returns error for an unmapped backend invalid field', async () => {
        submit.mockResolvedValue(new Result({ status: 'invalid', field: 'installId' }));

        expect(await submitReport(values, true)).toEqual({ status: 'error' });
    });

    it('returns error when the backend call throws', async () => {
        submit.mockRejectedValue(new Error('boom'));

        expect(await submitReport(values, true)).toEqual({ status: 'error' });
    });
});
