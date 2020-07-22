import ElectronStore from 'electron-store';

declare module 'vue/types/vue' {
  interface Vue {
    $config: ElectronStore;
    $windowBackgroundColor: string;
    $showBorder: boolean;
    $fontSize: string;
  }
}
