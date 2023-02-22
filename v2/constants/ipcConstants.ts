export const IpcConstants = {
	Close: 'close',
	Relaunch: 'relaunch',
	Reload: 'reload',
	SetClickThrough: 'setClickThrough',
	Resize: 'resize',
} as const;

export type IpcConstantsOptions = (typeof IpcConstants)[keyof typeof IpcConstants];
