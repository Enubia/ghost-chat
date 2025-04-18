<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ipcRenderer } from 'electron';
import { onMounted, ref as shallowRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import MenuButtons from '#components/header/Buttons.vue';
import DropDownMenu from '#components/header/Dropdown.vue';
import IpcHandler from '#lib/ipchandler';
import { IpcEvent, StoreDefaults } from '#shared/constants';

const router = useRouter();
const route = useRoute();

const { t } = useI18n();

const showMenuBar = shallowRef(true);
const showFooter = shallowRef(true);
const rerenderKey = shallowRef(0);

const savedWindowState = shallowRef(StoreDefaults.savedWindowState);
const settings = shallowRef(StoreDefaults.settings);
const isTransparent = shallowRef(false);
// const autoUpdatesDisabled = shallowRef(true);

const footerExcludeList: typeof route.name[] = ['/webview/twitch', '/webview/externalsource', '/webview/kick', '/versioncheck'];

const $html = document.querySelector('html');
const $app = document.querySelector('#app');

onMounted(async () => {
    savedWindowState.value = await IpcHandler.getWindowState();
    settings.value = await IpcHandler.getSettings();
    // autoUpdatesDisabled.value = await IpcHandler.getValueFromKey('updater.disableAutoUpdates');

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
    showFooter.value = !footerExcludeList.includes(route.name) && !route.path.startsWith('/settings');
    showMenuBar.value = !(route.path.startsWith('/settings') || route.name === '/versioncheck');
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
</script>

<template>
    <div :key="rerenderKey" class="min-h-dvh">
        <header
            v-if="showMenuBar" class="top-0 z-10 flex w-full items-center justify-between"
            :class="footerExcludeList.includes(route.name) ? 'absolute' : 'sticky'"
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
                            <Icon icon="fa5-solid:spinner" class="animate-spin text-4xl text-primary" />
                        </template>
                    </Suspense>
                </template>
            </router-view>
        </main>
        <footer v-if="showFooter" class="sticky bottom-0 w-full bg-background">
            <div id="paypal" class="center-elements px-10 py-2 sm:px-0">
                <a href="https://www.paypal.com/donate/?hosted_button_id=JMYLMVGSKXXEW" class="center-elements">
                    <small class="me-2">
                        {{ t('footer.support') }}
                    </small>
                    <Icon icon="fa6-brands:paypal" style="color: #009cde" />
                </a>
            </div>
        </footer>
    </div>
</template>
