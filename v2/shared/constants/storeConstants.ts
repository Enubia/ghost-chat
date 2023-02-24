import { WindowState } from '../types/windowState';

export const ChannelOptions = {
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

export const StoreKeys = {
	// in usage
	ChannelOptions: 'channelOptions',
	ClickThrough: 'clickThrough',
	ShouldBeTransparent: 'shouldBeTransparent',
	SavedWindowState: 'savedWindowState',

	// not used right now
	// OpacityLevel: 'opacityLevel',
	// BackgroundColor: 'backgroundColor',
	// SavedOpacityLevel: 'savedOpacityLevel',
	// FontSize: 'fontSize',
	// Timer: 'timer',
	// ChatColor: 'chatColor',
	// IsSettingsPage: 'isSettingsPage',
	// FontStroke: 'fontStroke',
	// StrokeColor: 'strokeColor',
	// DefaultChannel: 'defaultChannel',
	// ReverseChat: 'reverseChat',
	// UseSecondsForFadeout: 'useSecondsForFadeout',
} as const;

export type StoreKeys = {
	channelOptions: {
		[K in ChannelOptionsStrings]: ChannelOptions[K];
	};
	clickThrough: boolean;
	shouldBeTransparent: boolean;
	savedWindowState: WindowState;
};

type StoreKeysStrings = (typeof StoreKeys)[keyof typeof StoreKeys];

export type AppStore = {
	[K in StoreKeysStrings]: StoreKeys[K];
};
