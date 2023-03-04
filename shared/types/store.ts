export type ChannelOptions = {
	channel: string;
	showBotActivity: boolean;
	fadeMessages: boolean;
	fadeTimeout: number;
	customCSS: string;
	customJS: string;
	defaultChannel: string;
	preventClipping: boolean;
	chatTheme: string;
};

export type WindowState = {
	x: number;
	y: number;
	width: number;
	height: number;
	isClickThrough: boolean;
	isTransparent: boolean;
	theme: 'dark' | 'light' | null;
};

export type Settings = {
	isOpen: boolean;
	savedWindowState: Omit<WindowState, 'isClickThrough' | 'isTransparent'>;
};

export type Updater = {
	channel: 'latest' | 'beta' | 'alpa';
};

export type AppStore = {
	channelOptions: ChannelOptions;
	savedWindowState: WindowState;
	settings: Settings;
	updater: Updater;
};
