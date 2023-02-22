export const IpcConstants = {
	Close: 'close',
	Relaunch: 'relaunch',
	Reload: 'reload',
	SetClickThrough: 'setClickThrough',
	Resize: 'resize',
};

export type IpcConstantsOptions = keyof typeof IpcConstants;
