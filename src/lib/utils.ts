import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function cloneValue<T>(value: T): T {
    if (typeof value !== 'object' || value === null) {
        return value;
    }

    return JSON.parse(JSON.stringify(value));
}
