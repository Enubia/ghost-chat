<script setup lang="ts">
import type ElectronStore from 'electron-store';
import type { Ref } from 'vue';

import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { AppStore } from '@shared/types';

import Editor from '@components/settings/Editor.vue';
import General from '@components/settings/General.vue';
import Twitch from '@components/settings/Twitch.vue';

const electronStore = inject('electronStore') as ElectronStore<AppStore>;

const { t } = useI18n();

const theme = electronStore.get('savedWindowState.theme');
const $html = document.querySelector('html');
$html?.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');

const showGeneral = ref(true);
const showTwitch = ref(false);
const showCSSEditor = ref(false);
const showJSEditor = ref(false);

type Views = 'general' | 'twitch' | 'css' | 'js';
const views: {
    [key in Views]: {
        ref: Ref<boolean>;
    };
} = {
    general: {
        ref: showGeneral,
    },
    twitch: {
        ref: showTwitch,
    },
    css: {
        ref: showCSSEditor,
    },
    js: {
        ref: showJSEditor,
    },
};

function showView<T = Views>(view: T) {
    Object.keys(views).forEach((key) => {
        const viewKey = key as keyof typeof views;
        if (viewKey === view) {
            document.querySelector(`#${viewKey}`)?.setAttribute('active', 'true');
            views[viewKey].ref.value = true;
        } else {
            document.querySelector(`#${viewKey}`)?.removeAttribute('active');
            views[viewKey].ref.value = false;
        }
    });
}
</script>

<template>
    <div id="settings">
        <div id="content" class="container">
            <aside>
                <nav>
                    <ul>
                        <li>
                            <a id="general" class="contrast" active @click="showView('general')">
                                {{ t('settings.aside.1') }}
                            </a>
                        </li>
                        <li>
                            <a id="twitch" class="contrast" @click="showView('twitch')">
                                {{ t('settings.aside.2') }}
                            </a>
                        </li>
                        <li>
                            <a id="css" class="contrast" @click="showView('css')">
                                {{ t('settings.aside.3') }}
                            </a>
                        </li>
                        <li>
                            <a id="js" class="contrast" @click="showView('js')">
                                {{ t('settings.aside.4') }}
                            </a>
                        </li>
                    </ul>
                </nav>
            </aside>
            <div v-if="showGeneral">
                <article class="scroll-content">
                    <General />
                </article>
            </div>
            <div v-else-if="showTwitch">
                <article class="scroll-content">
                    <Twitch />
                </article>
            </div>
            <div v-else-if="showCSSEditor">
                <article class="h-full">
                    <Editor type="css" />
                </article>
            </div>
            <div v-else-if="showJSEditor">
                <article class="h-full">
                    <Editor type="js" />
                </article>
            </div>
        </div>
    </div>
</template>
