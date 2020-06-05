import * as ElectronStore from 'electron-store';

declare module 'vue/types/vue' {
  interface Vue {
    $config: typeof ElectronStore;
  }
}
