import type { AutoConnectResult, TwitchAuthStatus as AuthStatus } from '@bindings/ghost-chat/models.js';

const done: (...args: unknown[]) => Promise<void> = () => Promise.resolve();

export const AutoConnect = (): Promise<AutoConnectResult[]> => Promise.resolve([]);
export const CenterOnScreen = done;
export const Connect = done;
export const Disconnect = done;
export const ExpandForSettings = done;
export const ExportTheme = done;
export const GetConfig = () => Promise.resolve(null);
export const OpenConfigFolder = done;
export const SaveWindowState = done;
export const ShrinkToChat = done;
export const ToggleVanish = done;
export const ToggleWindowVisibility = done;
export const TwitchAuthStatus = (): Promise<AuthStatus> =>
    Promise.resolve({ loggedIn: false, login: '' } as AuthStatus);
export const TwitchLogout = done;
export const TwitchStartLogin = done;
export const UpdateConfig = done;
export const ResolveYouTubeVideo = (input: string) => Promise.resolve(input);
export const PreviewDiagnostics = () => Promise.reject(new Error('unavailable'));
export const SubmitBugReport = () => Promise.reject(new Error('unavailable'));
