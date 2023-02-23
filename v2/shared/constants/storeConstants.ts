import { WindowState } from '../types/windowState';

export const StoreKeys = {
	// in usage
	Channel: 'channel',
	ClickThrough: 'clickThrough',
	ShouldBeTransparent: 'shouldBeTransparent',
	SavedWindowState: 'savedWindowState',
	DataCleared: 'dataCleared',

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

type StoreKeysTypes = {
	channel: string;
	clickThrough: boolean;
	shouldBeTransparent: boolean;
	savedWindowState: WindowState;
	dataCleared: boolean;
};

type StoreKeysStrings = (typeof StoreKeys)[keyof typeof StoreKeys];

export type AppStore = {
	[K in StoreKeysStrings]: StoreKeysTypes[K];
};
