<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ipcRenderer } from 'electron';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import Editor from '#components/settings/Editor.vue';
import { Button } from '#components/ui/button';
import { Input } from '#components/ui/input';
import { Label } from '#components/ui/label';
import Settings from '#layouts/settings.vue';
import IpcHandler from '#lib/ipchandler';
import { IpcEvent } from '#shared/constants';

const { t } = useI18n();

const defaultUrl = ref('');
const channelSuccess = ref(false);
const sources = ref<string[]>([]);

onMounted(async () => {
    const external = await IpcHandler.getExternalOptions();

    defaultUrl.value = external.defaultUrl;
    sources.value = external.sources;
});

async function saveDefaultUrl() {
    await IpcHandler.setValueFromKey('options.external.defaultUrl', defaultUrl.value);
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
    enableChannelSuccess();
}

function enableChannelSuccess() {
    channelSuccess.value = true;
    setTimeout(() => {
        channelSuccess.value = false;
    }, 2000);
}

async function removeSource(index: number) {
    sources.value = sources.value.filter((_, i) => i !== index);
    await IpcHandler.setValueFromKey('options.external.sources', sources.value);
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
            <Editor id="css-editor" option="external" type="css" />
        </div>

        <div class="flex flex-col gap-2">
            <Label for="js-editor">
                {{ t('settings.external.js-editor.label') }}
            </Label>
            <small class="text-yellow-600">{{ t('settings.external.js-editor.info') }}</small>
            <Editor id="js-editor" option="external" type="js" />
        </div>
    </Settings>
</template>
