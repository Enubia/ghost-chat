export const IpcConstants = {
	Close: 'close',
	Back: 'back',
	Reload: 'reload',
	SetClickThrough: 'setClickThrough',
	Minimize: 'minimize',
} as const;

export type IpcConstantsOptions = (typeof IpcConstants)[keyof typeof IpcConstants];
