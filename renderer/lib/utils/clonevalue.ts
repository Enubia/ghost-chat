/**
 * Clones a value using JSON serialization.
 * This function is specifically designed for sending values via the Electron context bridge.
 * It handles specific Electron errors that occur with non-serializable values and circular references.
 * Note: This function is not intended for general use.
 */
export function cloneValue<T>(value: T): T {
    if (typeof value !== 'object' || value === null) {
        return value;
    }

    return JSON.parse(JSON.stringify(value));
}
