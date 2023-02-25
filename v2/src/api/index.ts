import { ipcRenderer } from 'electron';

setTimeout(() => {
	ipcRenderer.send('removeLoading');
}, 5000);
