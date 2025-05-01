<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ipcRenderer } from 'electron';
import { onMounted, shallowRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import MenuButtons from '#components/header/Buttons.vue';
import DropDownMenu from '#components/header/Dropdown.vue';
import IpcHandler from '#lib/ipchandler';
import { downloadLink, IpcEvent, kofiLink, paypalLink, StoreDefaults } from '#shared/constants';

import { versionState } from './state/version';

const router = useRouter();
const route = useRoute();

const { t } = useI18n();

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

const webviewRoutes: typeof route.name[] = ['/webview/twitch', '/webview/externalsource', '/webview/kick', '/versioncheck'];

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
    additionalFooterClasses.value = route.name === '/changelog'
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

ipcRenderer.on(IpcEvent.Vanish, () => {
    $app?.setAttribute('vanished', 'true');
    showMenuBar.value = false;
});
ipcRenderer.on(IpcEvent.ShowApp, () => {
    $app?.removeAttribute('vanished');
    showMenuBar.value = !isTransparent.value && !settings.value.isOpen;
});
ipcRenderer.on(IpcEvent.Rerender, () => {
    rerenderKey.value += 1;
});
ipcRenderer.on(IpcEvent.ThemeChanged, () => {
    const isDarkTheme = $html?.classList.contains('dark');

    if (isDarkTheme) {
        $html?.classList.remove('dark');
    } else {
        $html?.classList.add('dark');
    }
});
ipcRenderer.on(IpcEvent.Notification, (_, notification) => {
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
    <div :key="rerenderKey" class="grid min-h-dvh grid-rows-[auto_1fr_auto]">
        <header
            v-if="showMenuBar" class="flex w-full justify-between"
            :class="webviewRoutes.includes(route.name) ? 'absolute' : ''"
        >
            <DropDownMenu />
            <MenuButtons />
        </header>
        <main>
            <router-view v-slot="{ Component }">
                <template v-if="Component">
                    <Suspense>
                        <component :is="Component" :key="$route.path" />
                        <template #fallback>
                            <Icon icon="fa6-solid:spinner" class="animate-spin text-4xl text-primary" />
                        </template>
                    </Suspense>
                </template>
            </router-view>
        </main>
        <footer v-if="showFooter" class="dark:text-background" :class="additionalFooterClasses.position">
            <div v-if="notifications.showToggleUnbound" class="flex justify-center bg-yellow-200 text-yellow-600">
                <Icon icon="fa6-solid:triangle-exclamation" class="text-1xl mr-2" />
                <small>{{ t('footer.toggle-missing') }}</small>
            </div>
            <div class="grid grid-cols-2">
                <a :href="paypalLink" class="center-elements bg-[#009bde36] py-2" :class="additionalFooterClasses.pp">
                    <img src="./assets/brands/paypal.png" alt="PayPal" class="size-5">
                </a>
                <a :href="kofiLink" class="center-elements bg-[#ff633379] py-2" :class="additionalFooterClasses.kofi">
                    <img src="./assets/brands/kofi_symbol.svg" alt="Ko-fi" class="size-5">
                </a>
            </div>
            <a v-if="versionState.new.length" :href="downloadLink" class="center-elements bg-green-600 py-2">
                <small>{{ t('footer.download-link', { new: versionState.new }) }}</small>
                <Icon icon="mdi:open-in-new" class="ml-2" />
            </a>
        </footer>
    </div>
</template>
