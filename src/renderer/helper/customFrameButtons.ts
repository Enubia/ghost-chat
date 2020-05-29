import { remote } from 'electron';

export function handleCustomButtons(): void {
  document.getElementById('min-btn')?.addEventListener('click', () => {
    console.log('click min');
    const window = remote.getCurrentWindow();
    window?.minimize();
  });

  document.getElementById('close-btn')?.addEventListener('click', () => {
    console.log('click close');
    const window = remote.getCurrentWindow();
    window?.close();
  });
}
