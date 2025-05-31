<script setup lang="ts">
import Editor from '#components/settings/Editor.vue';
import { Button } from '#components/ui/button';
import { Input } from '#components/ui/input';
import { Label } from '#components/ui/label';
import { IpcEvent } from '#ipc/constants/events';
import Settings from '#layouts/settings.vue';
import IpcHandler from '#lib/ipchandler';
import { enableSuccessIndicator } from '#lib/utils/enableSuccessIndicator';
import { Icon } from '@iconify/vue';
import { ipcRenderer } from 'electron';
import { onMounted, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const defaultUrl = shallowRef('');
const channelSuccess = shallowRef(false);
const sources = shallowRef<string[]>([]);

onMounted(async () => {
    const external = await IpcHandler.getExternalOptions();

    defaultUrl.value = external.defaultUrl;
    sources.value = external.sources;
});

async function saveDefaultUrl() {
    await IpcHandler.setKeyValue('options.external.defaultUrl', defaultUrl.value);
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
    enableSuccessIndicator(channelSuccess);
}

async function removeSource(index: number) {
    sources.value = sources.value.filter((_, i) => i !== index);
    await IpcHandler.setKeyValue('options.external.sources', sources.value);
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
                id="default-url"
                v-model="defaultUrl"
                :class="channelSuccess && 'border-green-600 border'"
                @focusout="saveDefaultUrl"
                @keydown.enter="saveDefaultUrl"
            />
            <small class="text-muted-foreground">{{ t('settings.external.default-url.info') }}</small>
        </div>

        <div
            v-if="sources.length"
            class="flex flex-col gap-2"
        >
            <Label>{{ t('settings.external.sources.label') }}</Label>
            <div
                v-for="(source, index) in sources"
                :key="source"
                class="flex items-center justify-between gap-1"
                :value="index.toString()"
            >
                <Input
                    v-model="sources[index]"
                    readonly
                    class="bg-gray-300"
                />
                <Button
                    variant="destructive"
                    @click="removeSource(index)"
                >
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
            <Editor
                id="css-editor"
                option="external"
                type="css"
            />
        </div>

        <div class="flex flex-col gap-2">
            <Label for="js-editor">
                {{ t('settings.external.js-editor.label') }}
            </Label>
            <small class="text-yellow-600">{{ t('settings.external.js-editor.info') }}</small>
            <Editor
                id="js-editor"
                option="external"
                type="js"
            />
        </div>
    </Settings>
</template>
