import type { BrowserWindow } from 'electron';

import { WindowState } from '../types/windowState';

export const getWindowBoundsForStore = (window: BrowserWindow): WindowState => {
	const windowBounds = window.getBounds();

	return {
		x: windowBounds.x,
		y: windowBounds.y,
		width: windowBounds.width,
		height: windowBounds.height,
	};
};
