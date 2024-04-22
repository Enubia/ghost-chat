<script setup lang="ts">
import type ElectronStore from 'electron-store';

import { Icon } from '@iconify/vue/dist/iconify.js';
import Settings from '@layouts/settings.vue';
import { ipcRenderer } from 'electron';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { AppStore } from '@shared/types';

import Editor from '@components/settings/Editor.vue';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { IpcEvent } from '@shared/constants';

const { t } = useI18n();

const electronStore = inject('electronStore') as ElectronStore<AppStore>;
const { external } = electronStore.get('options');

const defaultUrl = ref(external.defaultUrl || '');
const channelSuccess = ref(false);
const sources = ref(external.sources || []);

function saveDefaultUrl() {
    electronStore.set('options.external.defaultUrl', defaultUrl.value);
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
    enableChannelSuccess();
}

function enableChannelSuccess() {
    channelSuccess.value = true;
    setTimeout(() => {
        channelSuccess.value = false;
    }, 2000);
}

function removeSource(index: number) {
    sources.value = sources.value.filter((_, i) => i !== index);
    electronStore.set('options.external.sources', sources.value);
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
}
</script>

<template>
    <Settings>
        <div class="flex flex-col gap-2">
            <Label for="default-url">
                {{ t('settings.external.default-url.input-label') }}
            </Label>
            <Input
                id="default-url" v-model="defaultUrl" :class="channelSuccess && 'border-green-600 border'"
                @focusout="saveDefaultUrl" @keydown.enter="saveDefaultUrl"
            />
            <small class="text-muted-foreground">{{ t('settings.external.default-url.info') }}</small>
        </div>

        <div v-if="sources.length" class="flex flex-col gap-2">
            <Label>{{ t('settings.external.sources.label') }}</Label>
            <div
                v-for="source, index in sources" :key="source" class="flex justify-between items-center gap-1"
                :value="index.toString()"
            >
                <Input v-model="sources[index]" readonly class="bg-gray-300" />
                <Button variant="destructive" @click="removeSource(index)">
                    <Icon icon="fa6-regular:trash-can" />
                </Button>
            </div>
            <small class="text-muted-foreground">{{ t('settings.external.sources.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <Label for="css-editor">
                {{ t('settings.external.css-editor.label') }}
            </Label>
            <small class="text-yellow-600">{{ t('settings.external.css-editor.info') }}</small>
            <Editor id="css-editor" type="external" :css="external.css" />
        </div>

        <div class="flex flex-col gap-2">
            <Label for="js-editor">
                {{ t('settings.external.js-editor.label') }}
            </Label>
            <small class="text-yellow-600">{{ t('settings.external.js-editor.info') }}</small>
            <Editor id="js-editor" type="external" :js="external.js" />
        </div>
    </Settings>
</template>
