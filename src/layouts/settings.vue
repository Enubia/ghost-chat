<script setup lang="ts">
import type ElectronStore from 'electron-store';

import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

import type { AppStore } from '@shared/types';

import SidebarNav from '@components/settings/SidebarNav.vue';
import { Separator } from '@components/ui/separator';

const electronStore = inject('electronStore') as ElectronStore<AppStore>;

const { t } = useI18n();

const theme = electronStore.get('savedWindowState.theme');
const $html = document.querySelector('html');
$html?.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
</script>

<template>
    <!-- <div id="settings">
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
    </div> -->
    <div class="space-y-6 p-10 pb-16 block">
        <div class="space-y-0.5">
            <h2 class="text-2xl font-bold tracking-tight">
                {{ t('settings.title') }}
            </h2>
            <p class="text-muted-foreground">
                {{ t('settings.info') }}
            </p>
        </div>
        <Separator class="my-6" />
        <div class="flex space-y-8 space-x-12">
            <aside class="w-1/6">
                <SidebarNav />
            </aside>
            <div class="w-5/6">
                <div class="space-y-6">
                    <slot />
                </div>
            </div>
        </div>
    </div>
</template>
