<script setup lang="ts">
import Settings from '@layouts/settings.vue';
import { ipcRenderer } from 'electron';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Twitch } from '@shared/types';

import Editor from '@components/settings/Editor.vue';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Switch } from '@components/ui/switch';
import IpcHandler from '@lib/ipchandler';
import { IpcEvent, StoreDefaults } from '@shared/constants';

const { t, rt, tm } = useI18n();

const fontOptions = [] as string[];

for (const [_, value] of Object.entries(tm('settings.twitch.font.select-options'))) {
    fontOptions.push(rt(value));
}

const fontSize = ref(String(StoreDefaults.options.twitch.fontSize));
const userBlacklist = ref(StoreDefaults.options.twitch.userBlacklist);
const defaultChannel = ref(StoreDefaults.options.twitch.defaultChannel);
const animate = ref(StoreDefaults.options.twitch.animate);
const fade = ref(StoreDefaults.options.twitch.fade);
const bots = ref(StoreDefaults.options.twitch.bots);
const hideCommands = ref(StoreDefaults.options.twitch.hideCommands);
const hideBadges = ref(StoreDefaults.options.twitch.hideBadges);
const font = ref(String(StoreDefaults.options.twitch.font));
const stroke = ref(String(StoreDefaults.options.twitch.stroke));
const shadow = ref(String(StoreDefaults.options.twitch.shadow));
const smallCaps = ref(StoreDefaults.options.twitch.smallCaps);
const fadeTimeout = ref(StoreDefaults.options.twitch.fadeTimeout);

onMounted(async () => {
    const twitch = await IpcHandler.getTwitchOptions();

    fontSize.value = String(twitch.fontSize);
    userBlacklist.value = twitch.userBlacklist;
    defaultChannel.value = twitch.defaultChannel;
    animate.value = twitch.animate;
    fade.value = twitch.fade;
    bots.value = twitch.bots;
    hideCommands.value = twitch.hideCommands;
    hideBadges.value = twitch.hideBadges;
    font.value = String(twitch.font);
    stroke.value = String(twitch.stroke);
    shadow.value = String(twitch.shadow);
    smallCaps.value = twitch.smallCaps;
    fadeTimeout.value = twitch.fadeTimeout;
});

const channelSuccess = ref(false);
const blacklistSuccess = ref(false);

async function saveDefaultChannel() {
    await IpcHandler.setValueFromKey('options.twitch.defaultChannel', defaultChannel.value);
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
    enableChannelSuccess();
}

async function saveAnimate() {
    await IpcHandler.setValueFromKey('options.twitch.animate', animate.value);
}

async function saveFadeMessages() {
    await IpcHandler.setValueFromKey('options.twitch.fade', fade.value);
}

async function saveShowBotActivity() {
    await IpcHandler.setValueFromKey('options.twitch.bots', bots.value);
}

async function saveHideCommands() {
    await IpcHandler.setValueFromKey('options.twitch.hideCommands', hideCommands.value);
}

async function saveHideBadges() {
    await IpcHandler.setValueFromKey('options.twitch.hideBadges', hideBadges.value);
}

async function saveFont() {
    await IpcHandler.setValueFromKey('options.twitch.font', Number.parseInt(font.value) as Twitch['font']);
}

async function saveStroke() {
    let value: Twitch['stroke'];

    switch (stroke.value) {
        case 'false':
            value = false;
            break;
        default:
            value = Number.parseInt(stroke.value) as Twitch['stroke'];
            break;
    }

    await IpcHandler.setValueFromKey('options.twitch.stroke', value);
}

async function saveShadow() {
    let value: Twitch['shadow'];

    switch (shadow.value) {
        case 'false':
            value = false;
            break;
        default:
            value = Number.parseInt(shadow.value) as Twitch['shadow'];
            break;
    }

    await IpcHandler.setValueFromKey('options.twitch.shadow', value);
}

async function saveSmallCaps() {
    await IpcHandler.setValueFromKey('options.twitch.smallCaps', smallCaps.value);
}

async function saveFontSize() {
    await IpcHandler.setValueFromKey('options.twitch.fontSize', Number.parseInt(fontSize.value) as Twitch['fontSize']);
}

async function updateBlacklist(event: Event) {
    const target = event.target as HTMLInputElement;
    const blacklist = target.value.split(',').map(user => user.trim());

    await IpcHandler.setValueFromKey('options.twitch.userBlacklist', blacklist);
    userBlacklist.value = blacklist;

    enableBlacklistSuccess();
}

async function saveFadeTimeout() {
    if (fade.value) {
        await IpcHandler.setValueFromKey('options.twitch.fadeTimeout', fadeTimeout.value);
    }
}

function enableChannelSuccess() {
    channelSuccess.value = true;
    setTimeout(() => {
        channelSuccess.value = false;
    }, 2000);
}

function enableBlacklistSuccess() {
    blacklistSuccess.value = true;
    setTimeout(() => {
        blacklistSuccess.value = false;
    }, 2000);
}
</script>

<template>
    <Settings>
        <div class="flex flex-col gap-2">
            <Label for="default-channel">
                {{ t('settings.twitch.default-channel.input-label') }}
            </Label>
            <Input
                id="default-channel" v-model="defaultChannel" :class="channelSuccess && 'border-green-600 border'"
                @change="saveDefaultChannel"
            />
            <small class="text-muted-foreground">{{ t('settings.twitch.default-channel.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <Label for="font-size">
                {{ t('settings.twitch.font-size.label') }}
            </Label>
            <Select id="font-size" v-model="fontSize" @update:model-value="saveFontSize">
                <SelectTrigger>
                    <SelectValue :placeholder="t('settings.twitch.font-size.select-label')" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1">
                        {{ t('settings.twitch.font-size.select-options.small') }}
                    </SelectItem>
                    <SelectItem value="2">
                        {{ t('settings.twitch.font-size.select-options.medium') }}
                    </SelectItem>
                    <SelectItem value="3">
                        {{ t('settings.twitch.font-size.select-options.large') }}
                    </SelectItem>
                </SelectContent>
            </Select>
            <small class="text-muted-foreground">{{ t('settings.twitch.font-size.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <Label class="align-elements" for="stroke">
                {{ t('settings.twitch.stroke.label') }}
            </Label>
            <Select id="stroke" v-model="stroke" @update:model-value="saveStroke">
                <SelectTrigger>
                    <SelectValue :placeholder="t('settings.twitch.stroke.select-label')" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="false">
                        {{ t('settings.twitch.stroke.select-options.off') }}
                    </SelectItem>
                    <SelectItem value="1">
                        {{ t('settings.twitch.stroke.select-options.thin') }}
                    </SelectItem>
                    <SelectItem value="2">
                        {{ t('settings.twitch.stroke.select-options.medium') }}
                    </SelectItem>
                    <SelectItem value="3">
                        {{ t('settings.twitch.stroke.select-options.thick') }}
                    </SelectItem>
                    <SelectItem value="4">
                        {{ t('settings.twitch.stroke.select-options.thicker') }}
                    </SelectItem>
                </SelectContent>
            </Select>
            <small class="text-muted-foreground">{{ t('settings.twitch.stroke.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <Switch id="animate" v-model:checked="animate" @update:checked="saveAnimate" />
                <Label class="align-elements" for="animate">
                    {{ t('settings.twitch.animate.label') }}
                </Label>
            </div>
            <small class="text-muted-foreground">{{ t('settings.twitch.animate.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <Switch id="fade" v-model:checked="fade" @update:checked="saveFadeMessages" />
                    <Label class="cursor-pointer" for="fade">
                        {{ t('settings.twitch.fade.label') }}
                    </Label>
                </div>
                <div v-if="fade">
                    <Label class="cursor-pointer" for="fadeTimeout">
                        {{ t('settings.twitch.fade.timeout-label', { seconds: fadeTimeout }) }}
                    </Label>
                    <Input
                        id="fadeTimeout" v-model="fadeTimeout" class="w-30 text-center" type="number"
                        @change="saveFadeTimeout"
                    />
                </div>
            </div>
            <small class="text-muted-foreground">{{ t('settings.twitch.fade.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <Switch id="show-bots" v-model:checked="bots" @update:checked="saveShowBotActivity" />
                <Label class="align-elements" for="show-bots">
                    {{ t('settings.twitch.show-bots.label') }}
                </Label>
            </div>
            <small class="text-muted-foreground">{{ t('settings.twitch.show-bots.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <Switch id="hide-commands" v-model:checked="hideCommands" @update:checked="saveHideCommands" />
                <Label class="align-elements" for="hide-commands">
                    {{ t('settings.twitch.hide-commands.label') }}
                </Label>
            </div>
            <small class="text-muted-foreground">{{ t('settings.twitch.hide-commands.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <Switch id="hide-badges" v-model:checked="hideBadges" @update:checked="saveHideBadges" />
                <Label class="align-elements" for="hide-badges">
                    {{ t('settings.twitch.hide-badges.label') }}
                </Label>
            </div>
            <small class="text-muted-foreground">{{ t('settings.twitch.hide-badges.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <Label for="font">
                {{ t('settings.twitch.font.label') }}
            </Label>
            <Select id="font" v-model="font" @update:model-value="saveFont">
                <SelectTrigger>
                    <SelectValue :placeholder="t('settings.twitch.font.select-label')" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem
                        v-for="[key, value], index in Object.entries(tm('settings.twitch.font.select-options'))"
                        :key="key" :value="index.toString()"
                    >
                        {{ rt(value) }}
                    </SelectItem>
                </SelectContent>
            </Select>
            <small class="text-muted-foreground">{{ t('settings.twitch.font.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <Label class="align-elements" for="shadow">
                {{ t('settings.twitch.shadow.label') }}
            </Label>
            <Select id="shadow" v-model="shadow" @update:model-value="saveShadow">
                <SelectTrigger>
                    <SelectValue :placeholder="t('settings.twitch.shadow.select-label') " />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="false">
                        {{ t('settings.twitch.shadow.select-options.off') }}
                    </SelectItem>
                    <SelectItem value="1">
                        {{ t('settings.twitch.shadow.select-options.small') }}
                    </SelectItem>
                    <SelectItem value="2">
                        {{ t('settings.twitch.shadow.select-options.medium') }}
                    </SelectItem>
                    <SelectItem value="3">
                        {{ t('settings.twitch.shadow.select-options.large') }}
                    </SelectItem>
                </SelectContent>
            </Select>
            <small class="text-muted-foreground">{{ t('settings.twitch.shadow.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <Switch id="small-caps" v-model:checked="smallCaps" @update:checked="saveSmallCaps" />
                <Label class="align-elements" for="small-caps">
                    {{ t('settings.twitch.small-caps.label') }}
                </Label>
            </div>
            <small class="text-muted-foreground">{{ t('settings.twitch.small-caps.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <Label for="user-blacklist">
                {{ t('settings.twitch.user-blacklist.label') }}
            </Label>
            <Input
                id="user-blacklist"
                :model-value="userBlacklist.join(', ')"
                :class="blacklistSuccess && 'border-green-600 border'" @change="updateBlacklist"
            />
            <small class="text-muted-foreground">{{ t('settings.twitch.user-blacklist.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <Label for="css-editor">
                {{ t('settings.twitch.css-editor.label') }}
            </Label>
            <small class="text-yellow-600">{{ t('settings.twitch.css-editor.info') }}</small>
            <Editor id="css-editor" option="twitch" type="css" />
        </div>

        <div class="flex flex-col gap-2">
            <Label for="js-editor">
                {{ t('settings.twitch.js-editor.label') }}
            </Label>
            <small class="text-yellow-600">{{ t('settings.twitch.js-editor.info') }}</small>
            <Editor id="js-editor" option="twitch" type="js" />
        </div>
    </Settings>
</template>
