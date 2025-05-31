<script setup lang="ts">
import Editor from '#components/settings/Editor.vue';
import Input from '#components/ui/input/Input.vue';
import Label from '#components/ui/label/Label.vue';
import { chatV2, githubcss } from '#constants/links';
import { StoreDefaults } from '#ipc/constants/store/defaults';
import Settings from '#layouts/settings.vue';
import IpcHandler from '#lib/ipchandler';
import { enableSuccessIndicator } from '#lib/utils/enableSuccessIndicator';
import { save } from '#lib/utils/save';
import { onMounted, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const defaultChannelId = shallowRef(StoreDefaults.options.youtube.defaultChannelId);
const retries = shallowRef(StoreDefaults.options.youtube.retries);
const fetchDelay = shallowRef(StoreDefaults.options.youtube.fetchDelay);
const userBlacklist = shallowRef(StoreDefaults.options.youtube.userBlacklist);

const channelSuccess = shallowRef(false);
const retriesSuccess = shallowRef(false);
const fetchDelaySuccess = shallowRef(false);

onMounted(async () => {
    const youtubeOptions = await IpcHandler.getYoutubeOptions();

    defaultChannelId.value = youtubeOptions.defaultChannelId;
    retries.value = youtubeOptions.retries;
    fetchDelay.value = youtubeOptions.fetchDelay;
    userBlacklist.value = youtubeOptions.userBlacklist;
});

async function saveDefaultChannelId(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    await save('options.youtube.defaultChannelId', value.trim());
    enableSuccessIndicator(channelSuccess);
}

async function saveRetries(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const parsedValue = Number.parseInt(value);

    if (Number.isNaN(parsedValue) || parsedValue < 0) {
        return;
    }

    await save('options.youtube.retries', parsedValue);
    enableSuccessIndicator(retriesSuccess);
}

async function saveFetchDelay(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const parsedValue = Number.parseInt(value);

    if (Number.isNaN(parsedValue) || parsedValue < 0) {
        return;
    }

    await save('options.youtube.fetchDelay', parsedValue);
    enableSuccessIndicator(fetchDelaySuccess);
}
</script>

<template>
    <Settings>
        <div class="flex flex-col gap-2">
            <Label for="default-channel-id">
                {{ t('settings.youtube.default-channel-id.input-label') }}
            </Label>
            <Input
                id="default-channel-id"
                v-model="defaultChannelId"
                :class="channelSuccess && 'border-green-600 border'"
                @change="saveDefaultChannelId"
            />
            <small class="text-muted-foreground">
                {{
                    t('settings.youtube.default-channel-id.info', {
                        channelIdInfo: t('start.youtube.channel-id.info'),
                    })
                }}
            </small>
        </div>

        <div class="flex flex-col gap-2">
            <Label for="retries">
                {{ t('settings.youtube.retries.input-label') }}
            </Label>
            <Input
                id="retries"
                v-model="retries"
                :class="retriesSuccess && 'border-green-600 border'"
                @change="saveRetries"
            />
        </div>

        <div class="flex flex-col gap-2">
            <Label for="fetchDelay">
                {{ t('settings.youtube.fetch-delay.input-label') }}
            </Label>
            <Input
                id="fetchDelay"
                v-model="fetchDelay"
                :class="fetchDelaySuccess && 'border-green-600 border'"
                @change="saveFetchDelay"
            />
        </div>

        <div class="flex flex-col gap-2">
            <Label
                for="css-editor"
                class="flex flex-col gap-1"
            >
                {{ t('settings.youtube.css-editor.label') }}
                <small class="flex flex-col gap-2 font-light">
                    {{ t('settings.youtube.css-editor.link-info') }}
                    <hr />
                    <span>
                        <a
                            class="underline text-primary"
                            :href="chatV2"
                            >{{ chatV2 }}</a
                        >
                        {{ t('settings.youtube.css-editor.chatv2') }}
                    </span>
                    <a
                        v-for="(item, index) of githubcss"
                        :key="index"
                        class="underline text-primary"
                        :href="item"
                        >{{ item }}</a
                    >
                </small>
            </Label>
            <Editor
                id="css-editor"
                option="youtube"
                type="css"
            />
        </div>

        <div class="flex flex-col gap-2">
            <Label for="js-editor">
                {{ t('settings.youtube.js-editor.label') }}
            </Label>
            <Editor
                id="js-editor"
                option="youtube"
                type="js"
            />
        </div>
    </Settings>
</template>
