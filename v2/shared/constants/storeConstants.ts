// ---------------------- channel configs ----------------------

const ChannelOptions = {
	Channel: 'channel',
	ShowBotActivity: 'showBotActivity',
	FadeMessages: 'fadeMessages',
	CustomCSS: 'customCSS',
} as const;

export type ChannelOptions = {
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

export type WindowState = {
	x: number;
	y: number;
	width: number;
	height: number;
	isClickThrough: boolean;
	isTransparent: boolean;
};

type WindowStateStrings = (typeof WindowState)[keyof typeof WindowState];

// ---------------------- store ----------------------

const StoreKeys = {
	ChannelOptions: 'channelOptions',
	SavedWindowState: 'savedWindowState',
} as const;

export type StoreKeys = {
	channelOptions: {
		[K in ChannelOptionsStrings]: ChannelOptions[K];
	};
	clickThrough: boolean;
	isTransparent: boolean;
	savedWindowState: {
		[K in WindowStateStrings]: WindowState[K];
	};
};

type StoreKeysStrings = (typeof StoreKeys)[keyof typeof StoreKeys];

export type AppStore = {
	[K in StoreKeysStrings]: StoreKeys[K];
};
