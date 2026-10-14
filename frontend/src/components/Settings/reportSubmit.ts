import type { ReportErrors, ReportField, ReportValues } from './reportValidation';

import { SubmitBugReport } from '@bindings/ghost-chat/app.js';
import { Input } from '@bindings/ghost-chat/internal/bugreport/models.js';

import { validateReport } from './reportValidation';

export type SubmitOutcome =
    | { status: 'sent'; id: number }
    | { status: 'invalid'; errors: ReportErrors }
    | { status: 'rate_limited' }
    | { status: 'fallback' }
    | { status: 'error' };

const fields: ReportField[] = ['title', 'description', 'steps', 'discord'];

export async function submitReport(values: ReportValues, includeDiagnostics: boolean): Promise<SubmitOutcome> {
    const errors = validateReport(values);

    if (Object.keys(errors).length > 0) {
        return { status: 'invalid', errors };
    }

    try {
        const result = await SubmitBugReport(new Input({ ...values, includeDiagnostics }));

        switch (result.status) {
            case 'sent':
                return { status: 'sent', id: result.id };
            case 'invalid': {
                const field = fields.find((f) => f === result.field);

                if (!field) {
                    return { status: 'error' };
                }

                return { status: 'invalid', errors: { [field]: `validation.report_${field}` } };
            }
            case 'rate_limited':
                return { status: 'rate_limited' };
            case 'fallback':
                return { status: 'fallback' };
            default:
                return { status: 'error' };
        }
    } catch {
        return { status: 'error' };
    }
}
