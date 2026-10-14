export interface ReportValues {
    title: string;
    description: string;
    steps: string;
    discord: string;
}

export type ReportField = keyof ReportValues;
export type ReportErrors = Partial<Record<ReportField, string>>;

const DISCORD_CHARS = /^[a-z0-9_.]+$/;

function length(value: string): number {
    return Array.from(value.trim()).length;
}

function validDiscord(value: string): boolean {
    const name = value.trim().replace(/^@/, '').toLowerCase();

    if (!name) {
        return true;
    }

    const size = Array.from(name).length;

    return size >= 2 && size <= 32 && !name.includes('..') && DISCORD_CHARS.test(name);
}

export function validateReport(values: ReportValues): ReportErrors {
    const errors: ReportErrors = {};
    const title = length(values.title);
    const description = length(values.description);

    if (title < 5 || title > 120) {
        errors.title = 'report.errors.title';
    }

    if (description < 1 || description > 5000) {
        errors.description = 'report.errors.description';
    }

    if (length(values.steps) > 5000) {
        errors.steps = 'report.errors.steps';
    }

    if (!validDiscord(values.discord)) {
        errors.discord = 'report.errors.discord';
    }

    return errors;
}
