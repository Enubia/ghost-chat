<template>
    <div id="settings">
        <div
            id="content"
            class="container"
        >
            <aside>
                <nav>
                    <ul>
                        <li>
                            <a
                                id="general"
                                class="contrast"
                                active
                                @click="showView('general')"
                            >
                                {{ t('settings.aside.1') }}
                            </a>
                        </li>
                        <li>
                            <a
                                id="options"
                                class="contrast"
                                @click="showView('options')"
                            >
                                {{ t('settings.aside.2') }}
                            </a>
                        </li>
                        <li>
                            <a
                                id="css"
                                class="contrast"
                                @click="showView('css')"
                            >{{ t('settings.aside.3') }}</a>
                        </li>
                        <li>
                            <a
                                id="js"
                                class="contrast"
                                @click="showView('js')"
                            >{{ t('settings.aside.4') }}</a>
                        </li>
                    </ul>
                </nav>
            </aside>
            <div v-if="showGeneral">
                <article>
                    <General :store="store" />
                </article>
            </div>
            <div v-else-if="showOptions">
                <article class="scroll-content">
                    <KapChat :store="store" />
                </article>
            </div>
            <div v-else-if="showCSSEditor">
                <article>
                    <Editor
                        :store="store"
                        type="css"
                    />
                </article>
            </div>
            <div v-else-if="showJSEditor">
                <article>
                    <Editor
                        :store="store"
                        type="js"
                    />
                </article>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type ElectronStore from 'electron-store';
import type { Ref } from 'vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { AppStore } from '../../shared/types';
import Editor from '../components/settings/Editor.vue';
import General from '../components/settings/General.vue';
import KapChat from '../components/settings/KapChat.vue';

const props = defineProps<{ store: ElectronStore<AppStore> }>();

const { t } = useI18n();

const theme = props.store.get('savedWindowState.theme');
const $html = document.querySelector('html');
$html?.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');

const showGeneral = ref(true);
const showOptions = ref(false);
const showCSSEditor = ref(false);
const showJSEditor = ref(false);
const showUpdates = ref(false);

type Views = 'general' | 'options' | 'css' | 'js' | 'updates';
const views: {
    [key in Views]: {
        ref: Ref<boolean>;
    };
} = {
    general: {
        ref: showGeneral,
    },
    options: {
        ref: showOptions,
    },
    css: {
        ref: showCSSEditor,
    },
    js: {
        ref: showJSEditor,
    },
    updates: {
        ref: showUpdates,
    },
};

function showView<T = Views>(view: T) {
    Object.keys(views).forEach((key) => {
        const viewKey = key as keyof typeof views;
        if (viewKey === view) {
            document.querySelector(`#${view}`)?.setAttribute('active', 'true');
            views[viewKey].ref.value = true;
        } else {
            document.querySelector(`#${viewKey}`)?.removeAttribute('active');
            views[viewKey].ref.value = false;
        }
    });
}
</script>
