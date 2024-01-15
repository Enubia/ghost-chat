export const IpcEvent = {
    Close: 'close',
    Back: 'back',
    SetClickThrough: 'set-click-through',
    Minimize: 'minimize',
    Vanish: 'vanish',
    OpenSettings: 'open-settings',
    GetVersion: 'get-version',
    Rerender: 'rerender',
    Recreated: 'recreated',
    ShowApp: 'show-app',
    RegisterNewKeybind: 'register-new-keybind',

    // updater
    CheckingForUpdate: 'checking-for-update',
    UpdateAvailable: 'update-available',
    UpdateNotAvailable: 'update-not-available',
    Error: 'error',
    UpdateDownloaded: 'update-downloaded',
    ManualUpdateRequired: 'manual-update-required',
} as const;
