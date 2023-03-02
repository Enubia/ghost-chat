// ---------------------- channel configs ----------------------

const ChannelOptions = {
	Channel: 'channel',
	ShowBotActivity: 'showBotActivity',
	FadeMessages: 'fadeMessages',
	CustomCSS: 'customCSS',
	PersistentChannel: 'persistentChannel',
} as const;

type ChannelOptions = {
	channel: string;
	showBotActivity: boolean;
	fadeMessages: boolean | number;
	customCSS: string;
	persistentChannel: string;
};

type ChannelOptionsStrings = (typeof ChannelOptions)[keyof typeof ChannelOptions];

// ---------------------- window state ----------------------

const WindowState = {
	X: 'x',
	Y: 'y',
	Width: 'width',
	Height: 'height',
	IsClickThrough: 'isClickThrough',
	IsTransparent: 'isTransparent',
	Theme: 'theme',
} as const;

type WindowState = {
	x: number;
	y: number;
	width: number;
	height: number;
	isClickThrough: boolean;
	isTransparent: boolean;
	theme?: 'dark' | 'light';
};

type WindowStateStrings = (typeof WindowState)[keyof typeof WindowState];

// ---------------------- settings ----------------------

const Settings = {
	IsOpen: 'isOpen',
	SavedWindowSate: 'savedWindowState',
} as const;

type Settings = {
	isOpen: boolean;
	savedWindowState: Omit<WindowState, 'isClickThrough' | 'isTransparent'>;
};

type SettingsStrings = (typeof Settings)[keyof typeof Settings];

// ---------------------- store ----------------------

export const StoreKeys = {
	ChannelOptions: 'channelOptions',
	SavedWindowState: 'savedWindowState',
	Settings: 'settings',
} as const;

type StoreKeysStrings = (typeof StoreKeys)[keyof typeof StoreKeys];

type StoreKeysMap = {
	channelOptions: {
		[K in ChannelOptionsStrings]: ChannelOptions[K];
	};
	savedWindowState: {
		[K in WindowStateStrings]: WindowState[K];
	};
	settings: {
		[K in SettingsStrings]: Settings[K];
	};
};

export type AppStore = {
	[K in StoreKeysStrings]: StoreKeysMap[K];
};
