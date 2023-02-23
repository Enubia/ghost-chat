export const StoreConstants = {
	Channel: 'channel',
	OpacityLevel: 'opacityLevel',
	BackgroundColor: 'backgroundColor',
	ClickThrough: 'clickThrough',
	ShowBorders: 'showBorders',
	HideBordersByIcon: 'hideBordersByIcon',
	SavedOpacityLevel: 'savedOpacityLevel',
	FontSize: 'fontSize',
	DataCleared: 'dataCleared',
	Timer: 'timer',
	ChatColor: 'chatColor',
	IsSettingsPage: 'isSettingsPage',
	SavedWindowState: 'savedWindowState',
	FontStroke: 'fontStroke',
	StrokeColor: 'strokeColor',
	DefaultChannel: 'defaultChannel',
	ReverseChat: 'reverseChat',
	UseSecondsForFadeout: 'useSecondsForFadeout',
} as const;

export type StoreConstantsOptions = (typeof StoreConstants)[keyof typeof StoreConstants];