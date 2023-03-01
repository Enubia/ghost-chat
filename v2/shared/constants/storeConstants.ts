// ---------------------- channel configs ----------------------

const ChannelOptions = {
	Channel: 'channel',
	ShowBotActivity: 'showBotActivity',
	FadeMessages: 'fadeMessages',
	CustomCSS: 'customCSS',
} as const;

type ChannelOptions = {
	channel: string;
	showBotActivity: boolean;
	fadeMessages: boolean | number;
	customCSS: string;
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
} as const;

type WindowState = {
	x: number;
	y: number;
	width: number;
	height: number;
	isClickThrough: boolean;
	isTransparent: boolean;
};

type WindowStateStrings = (typeof WindowState)[keyof typeof WindowState];

// ---------------------- store ----------------------

export const StoreKeys = {
	ChannelOptions: 'channelOptions',
	SavedWindowState: 'savedWindowState',
} as const;

type StoreKeysStrings = (typeof StoreKeys)[keyof typeof StoreKeys];

type StoreKeysMap = {
	channelOptions: {
		[K in ChannelOptionsStrings]: ChannelOptions[K];
	};
	savedWindowState: {
		[K in WindowStateStrings]: WindowState[K];
	};
};

export type AppStore = {
	[K in StoreKeysStrings]: StoreKeysMap[K];
};
