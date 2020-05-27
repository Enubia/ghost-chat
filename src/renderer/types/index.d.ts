import * as Electron from 'electron';
import * as ElectronStore from 'electron-store';

declare module 'vue/types/vue' {
  interface Vue {
    $electron: typeof Electron;
    $config: typeof ElectronStore;
  }
}
