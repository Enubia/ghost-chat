export * as Create from 'wails-create';

const noop = () => {};

export const Events = {
    On: () => noop,
    Off: noop,
    Emit: () => Promise.resolve(),
};

export const Browser = {
    OpenURL: (_url: string) => Promise.resolve(),
};

export const System = {
    IsWindows: () => true,
    IsMac: () => false,
    IsLinux: () => false,
};

export const Window = new Proxy({}, { get: () => () => Promise.resolve() }) as Record<string, () => Promise<void>>;
