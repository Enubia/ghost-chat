<script setup lang="ts">
import { IpcEvent } from '#ipc/constants/events';
import { StoreDefaults } from '#ipc/constants/store/defaults';
import { Icon } from '@iconify/vue';
import { useIpcRendererOn } from '@vueuse/electron';
import { onMounted, shallowRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import MenuButtons from './components/header/Buttons.vue';
import DropDownMenu from './components/header/Dropdown.vue';
import { downloadLink, kofiLink, paypalLink } from './constants/links';
import IpcHandler from './lib/ipchandler';
import { versionStore } from './store/version';

const router = useRouter();
const route = useRoute();

const { t, locale } = useI18n();

const showMenuBar = shallowRef(false);
const showFooter = shallowRef(false);
const additionalFooterClasses = shallowRef({
    position: '',
    pp: '',
    kofi: '',
});
const rerenderKey = shallowRef(0);

const savedWindowState = shallowRef(StoreDefaults.savedWindowState);
const settings = shallowRef(StoreDefaults.settings);
const isTransparent = shallowRef(false);
const notifications = shallowRef({
    showToggleUnbound: false,
});

const webviewRoutes: (typeof route.name)[] = ['/webview/twitch', '/webview/externalsource', '/webview/kick', '/webview/youtube', '/versioncheck'];

const $html = document.querySelector('html');
const $app = document.querySelector('#app');

onMounted(async () => {
    savedWindowState.value = await IpcHandler.getWindowState();
    settings.value = await IpcHandler.getSettings();

    const keybinds = await IpcHandler.getKeybinds();
    notifications.value = { showToggleUnbound: !keybinds.vanish.keybind };

    if (savedWindowState.value.theme) {
        $html?.classList.add(savedWindowState.value.theme);
    }

    if (!isTransparent.value) {
        if (settings.value.isOpen) {
            router.push('/settings/general');
        } else {
            router.push('/versioncheck');
        }
    }
});

watch(route, () => {
    showFooter.value = !webviewRoutes.includes(route.name) && !route.path.startsWith('/settings');
    showMenuBar.value = !(route.path.startsWith('/settings') || route.name === '/versioncheck');
    additionalFooterClasses.value =
        route.name === '/changelog'
            ? {
                  position: 'sticky bottom-0',
                  pp: 'bg-[#009bde]',
                  kofi: 'bg-[#ff6333]',
              }
            : {
                  position: '',
                  pp: '',
                  kofi: '',
              };
});

useIpcRendererOn(IpcEvent.Vanish, () => {
    $app?.setAttribute('vanished', 'true');
    showMenuBar.value = false;
});
useIpcRendererOn(IpcEvent.ShowApp, () => {
    $app?.removeAttribute('vanished');
    showMenuBar.value = !isTransparent.value && !settings.value.isOpen;
});
useIpcRendererOn(IpcEvent.Rerender, async () => {
    rerenderKey.value += 1;
    locale.value = (await IpcHandler.getGeneral()).language;
});
useIpcRendererOn(IpcEvent.ThemeChanged, () => {
    const isDarkTheme = $html?.classList.contains('dark');

    if (isDarkTheme) {
        $html?.classList.remove('dark');
    } else {
        $html?.classList.add('dark');
    }
});
useIpcRendererOn(IpcEvent.Notification, (_, notification) => {
    switch (notification.type) {
        case 'toggleUnbound':
            notifications.value = { showToggleUnbound: true };
            break;
        case 'toggleSet':
            notifications.value = { showToggleUnbound: false };
            break;
        default:
            break;
    }
});
</script>

<template>
    <div
        :key="rerenderKey"
        class="grid min-h-dvh grid-rows-[auto_1fr_auto]"
    >
        <header
            v-if="showMenuBar"
            class="flex justify-between w-full"
            :class="webviewRoutes.includes(route.name) ? 'absolute' : ''"
        >
            <DropDownMenu />
            <MenuButtons />
        </header>
        <main>
            <router-view v-slot="{ Component }">
                <template v-if="Component">
                    <Suspense>
                        <component
                            :is="Component"
                            :key="$route.path"
                        />
                        <template #fallback>
                            <Icon
                                icon="svg-spinners:6-dots-rotate"
                                class="text-4xl text-primary"
                            />
                        </template>
                    </Suspense>
                </template>
            </router-view>
        </main>
        <footer
            v-if="showFooter"
            class="dark:text-background"
            :class="additionalFooterClasses.position"
        >
            <div
                v-if="notifications.showToggleUnbound"
                class="flex justify-center text-yellow-600 bg-yellow-200"
            >
                <Icon
                    icon="fa6-solid:triangle-exclamation"
                    class="mr-2 text-1xl"
                />
                <small>{{ t('footer.toggle-missing') }}</small>
            </div>
            <div class="grid grid-cols-2">
                <a
                    :href="paypalLink"
                    class="center-elements bg-[#009bde36] py-2"
                    :class="additionalFooterClasses.pp"
                >
                    <img
                        src="./assets/brands/paypal.png"
                        alt="PayPal"
                        class="size-5"
                    />
                </a>
                <a
                    :href="kofiLink"
                    class="center-elements bg-[#ff633379] py-2"
                    :class="additionalFooterClasses.kofi"
                >
                    <img
                        src="./assets/brands/kofi_symbol.svg"
                        alt="Ko-fi"
                        class="size-5"
                    />
                </a>
            </div>
            <a
                v-if="versionStore.new.length"
                :href="downloadLink"
                class="py-2 bg-green-600 center-elements"
            >
                <small>{{ t('footer.download-link', { new: versionStore.new }) }}</small>
                <Icon
                    icon="mdi:open-in-new"
                    class="ml-2"
                />
            </a>
        </footer>
    </div>
</template>
