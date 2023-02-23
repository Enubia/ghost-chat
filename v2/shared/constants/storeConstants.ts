export const StoreConstants = {
	// in usage
	Channel: 'channel',
	ClickThrough: 'clickThrough',
	ShouldBeTransparent: 'shouldBeTransparent',
	SavedWindowState: 'savedWindowState',
	DataCleared: 'dataCleared',

	// not used right now
	OpacityLevel: 'opacityLevel',
	BackgroundColor: 'backgroundColor',
	SavedOpacityLevel: 'savedOpacityLevel',
	FontSize: 'fontSize',
	Timer: 'timer',
	ChatColor: 'chatColor',
	IsSettingsPage: 'isSettingsPage',
	FontStroke: 'fontStroke',
	StrokeColor: 'strokeColor',
	DefaultChannel: 'defaultChannel',
	ReverseChat: 'reverseChat',
	UseSecondsForFadeout: 'useSecondsForFadeout',
} as const;

export type StoreConstantsOptions = (typeof StoreConstants)[keyof typeof StoreConstants];
