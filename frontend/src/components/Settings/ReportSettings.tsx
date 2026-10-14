import type { Diagnostics } from '@bindings/ghost-chat/internal/bugreport/models.js';

import type { ReportErrors, ReportField, ReportValues } from './reportValidation';

import { PreviewDiagnostics } from '@bindings/ghost-chat/app.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './ReportSettings.module.css';
import { submitReport } from './reportSubmit';

export type ReportStatus = 'idle' | 'sending' | 'sent' | 'rate_limited' | 'fallback' | 'error';

export interface ReportFormProps {
    values: ReportValues;
    errors: ReportErrors;
    status: ReportStatus;
    reportId: number;
    includeDiagnostics: boolean;
    diagnostics: Diagnostics | null;
    onChange: (field: ReportField, value: string) => void;
    onIncludeChange: (value: boolean) => void;
    onSubmit: () => void;
}

export function ReportForm({
    values,
    errors,
    status,
    reportId,
    includeDiagnostics,
    diagnostics,
    onChange,
    onIncludeChange,
    onSubmit,
}: ReportFormProps) {
    const { t } = useTranslation();

    const error = (field: ReportField) => errors[field] && <span className="field-error">{t(errors[field])}</span>;

    return (
        <form
            className={styles.form}
            noValidate
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            <div className="field">
                <label className="field-label">{t('report.title')}</label>
                <input
                    type="text"
                    value={values.title}
                    onChange={(e) => onChange('title', e.target.value)}
                />
                {error('title')}
            </div>

            <div className="field">
                <label className="field-label">{t('report.description')}</label>
                <textarea
                    rows={4}
                    value={values.description}
                    onChange={(e) => onChange('description', e.target.value)}
                />
                {error('description')}
            </div>

            <div className="field">
                <label className="field-label">{t('report.steps')}</label>
                <textarea
                    rows={3}
                    value={values.steps}
                    onChange={(e) => onChange('steps', e.target.value)}
                />
                {error('steps')}
            </div>

            <div className="field">
                <label className="field-label">{t('report.discord')}</label>
                <input
                    type="text"
                    value={values.discord}
                    onChange={(e) => onChange('discord', e.target.value)}
                />
                <span className="field-hint">{t('report.discord_hint')}</span>
                {error('discord')}
            </div>

            <label className={styles.checkbox}>
                <input
                    type="checkbox"
                    checked={includeDiagnostics}
                    onChange={(e) => onIncludeChange(e.target.checked)}
                />
                {t('report.include_diagnostics')}
            </label>

            {includeDiagnostics && diagnostics && (
                <details className={styles.preview}>
                    <summary>{t('report.preview')}</summary>
                    <dl>
                        <dt>{t('report.diagnostics.version')}</dt>
                        <dd>{diagnostics.appVersion}</dd>
                        <dt>{t('report.diagnostics.os')}</dt>
                        <dd>
                            {diagnostics.os}/{diagnostics.arch}
                        </dd>
                        <dt>{t('report.diagnostics.platforms')}</dt>
                        <dd>{diagnostics.platforms.join(', ')}</dd>
                        <dt>{t('report.diagnostics.logs')}</dt>
                    </dl>
                    <pre>{diagnostics.logs}</pre>
                </details>
            )}

            <button
                type="submit"
                className={styles.submit}
                disabled={status === 'sending'}
            >
                {t('report.submit')}
            </button>

            {status === 'sent' && <span className="field-success">{t('report.sent', { id: reportId })}</span>}
            {status === 'rate_limited' && <span className="field-error">{t('report.rate_limited')}</span>}
            {status === 'fallback' && <span className="field-hint">{t('report.fallback')}</span>}
            {status === 'error' && <span className="field-error">{t('report.error')}</span>}
        </form>
    );
}

const emptyValues: ReportValues = { title: '', description: '', steps: '', discord: '' };

export function ReportSettings() {
    const [values, setValues] = useState<ReportValues>(emptyValues);
    const [errors, setErrors] = useState<ReportErrors>({});
    const [status, setStatus] = useState<ReportStatus>('idle');
    const [reportId, setReportId] = useState(0);
    const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
    const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);

    useEffect(() => {
        let active = true;

        PreviewDiagnostics()
            .then((d) => active && setDiagnostics(d))
            .catch(() => undefined);

        return () => {
            active = false;
        };
    }, []);

    const handleSubmit = async () => {
        setStatus('sending');
        setErrors({});

        const outcome = await submitReport(values, includeDiagnostics);

        if (outcome.status === 'invalid') {
            setErrors(outcome.errors);
            setStatus('idle');

            return;
        }

        if (outcome.status === 'sent') {
            setReportId(outcome.id);
            setValues(emptyValues);
        }

        setStatus(outcome.status);
    };

    return (
        <ReportForm
            values={values}
            errors={errors}
            status={status}
            reportId={reportId}
            includeDiagnostics={includeDiagnostics}
            diagnostics={diagnostics}
            onChange={(field, value) => setValues({ ...values, [field]: value })}
            onIncludeChange={setIncludeDiagnostics}
            onSubmit={() => void handleSubmit()}
        />
    );
}
