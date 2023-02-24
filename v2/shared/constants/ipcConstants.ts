export const IpcConstants = {
	Close: 'close',
	Back: 'back',
	SetClickThrough: 'setClickThrough',
	Minimize: 'minimize',
	Vanish: 'vanish',
} as const;

export type IpcConstantsOptions = (typeof IpcConstants)[keyof typeof IpcConstants];
