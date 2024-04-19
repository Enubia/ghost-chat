export const IpcEvent = {
    Close: 'close',
    Back: 'back',
    SetClickThrough: 'set-click-through',
    Minimize: 'minimize',
    Vanish: 'vanish',
    OpenSettings: 'open-settings',
    GetVersion: 'get-version',
    Rerender: 'rerender',
    ThemeChanged: 'theme-changed',
    Recreated: 'recreated',
    ShowApp: 'show-app',
    RegisterNewKeybind: 'register-new-keybind',
    CloseSettings: 'close-settings',

    // updater
    CheckingForUpdate: 'checking-for-update',
    UpdateAvailable: 'update-available',
    UpdateNotAvailable: 'update-not-available',
    Error: 'error',
    UpdateDownloaded: 'update-downloaded',
    ManualUpdateRequired: 'manual-update-required',
    AutoUpdateDisabled: 'auto-update-disabled',
    CheckForUpdates: 'check-for-updates',
    UpdateStatus: 'update-status',
} as const;
