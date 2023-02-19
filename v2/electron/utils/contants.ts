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
};

export type StoreConstantsType = keyof typeof StoreConstants;

export const IpcConstants = {
	Close: 'close',
	Relaunch: 'relaunch',
	Reload: 'reload',
	SetClickThrough: 'setClickThrough',
	Resize: 'resize',
};

export type IpcConstantsType = keyof typeof IpcConstants;
