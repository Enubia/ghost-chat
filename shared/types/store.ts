export type ChannelOptions = {
	channel: string;
	showBotActivity: boolean;
	fadeMessages: boolean | number;
	customCSS: string;
	persistentChannel: string;
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

export type AppStore = {
	channelOptions: ChannelOptions;
	savedWindowState: WindowState;
	settings: Settings;
};
