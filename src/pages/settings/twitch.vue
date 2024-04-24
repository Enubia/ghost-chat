<script setup lang="ts">
import type ElectronStore from 'electron-store';

import Settings from '@layouts/settings.vue';
import { ipcRenderer } from 'electron';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { AppStore, Twitch } from '@shared/types';

import Editor from '@components/settings/Editor.vue';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Switch } from '@components/ui/switch';
import { IpcEvent } from '@shared/constants';

const electronStore = inject('electronStore') as ElectronStore<AppStore>;

const { t, rt, tm } = useI18n();

const fontOptions = [] as string[];

for (const [_, value] of Object.entries(tm('settings.twitch.font.select-options'))) {
    fontOptions.push(rt(value));
}

const { twitch } = electronStore.get('options');

const fontSize = ref(String(twitch.fontSize));
const userBlacklist = ref(twitch.userBlacklist || []);

const defaultChannel = ref(twitch.defaultChannel);
const animate = ref(twitch.animate);
const fade = ref(twitch.fade);
const bots = ref(twitch.bots);
const hideCommands = ref(twitch.hideCommands);
const hideBadges = ref(twitch.hideBadges);
const font = ref(String(twitch.font));
const stroke = ref(String(twitch.stroke));
const shadow = ref(String(twitch.shadow));
const smallCaps = ref(twitch.smallCaps);
const fadeTimeout = ref(twitch.fadeTimeout);

const channelSuccess = ref(false);
const blacklistSuccess = ref(false);

function saveDefaultChannel() {
    const data: Twitch = {
        ...electronStore.get('options').twitch,
        defaultChannel: defaultChannel.value,
    };

    electronStore.set('options.twitch', data);
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
    enableChannelSuccess();
}

function saveAnimate() {
    const data: Twitch = {
        ...electronStore.get('options').twitch,
        animate: animate.value,
    };

    electronStore.set('options.twitch', data);
}

function saveFadeMessages() {
    const data: Twitch = {
        ...electronStore.get('options').twitch,
        fade: fade.value,
    };

    electronStore.set('options.twitch', data);
}

function saveShowBotActivity() {
    const data: Twitch = {
        ...electronStore.get('options').twitch,
        bots: bots.value,
    };

    electronStore.set('options.twitch', data);
}

function saveHideCommands() {
    const data: Twitch = {
        ...electronStore.get('options').twitch,
        hideCommands: hideCommands.value,
    };

    electronStore.set('options.twitch', data);
}

function saveHideBadges() {
    const data: Twitch = {
        ...electronStore.get('options').twitch,
        hideBadges: hideBadges.value,
    };

    electronStore.set('options.twitch', data);
}

function saveFont() {
    const data: Twitch = {
        ...electronStore.get('options').twitch,
        font: Number.parseInt(font.value) as typeof twitch.font,
    };

    electronStore.set('options.twitch', data);
}

function saveStroke() {
    let value: typeof twitch.stroke;

    switch (stroke.value) {
        case 'false':
            value = false;
            break;
        default:
            value = Number.parseInt(stroke.value) as typeof twitch.stroke;
            break;
    }

    const data: Twitch = {
        ...electronStore.get('options').twitch,
        stroke: value,
    };

    electronStore.set('options.twitch', data);
}

function saveShadow() {
    let value: typeof twitch.shadow;

    switch (shadow.value) {
        case 'false':
            value = false;
            break;
        default:
            value = Number.parseInt(shadow.value) as typeof twitch.shadow;
            break;
    }
    const data: Twitch = {
        ...electronStore.get('options').twitch,
        shadow: value,
    };

    electronStore.set('options.twitch', data);
}

function saveSmallCaps() {
    const data: Twitch = {
        ...electronStore.get('options').twitch,
        smallCaps: smallCaps.value,
    };

    electronStore.set('options.twitch', data);
}

function saveFontSize() {
    setTimeout(() => {
        const data: Twitch = {
            ...electronStore.get('options').twitch,
            fontSize: Number.parseInt(fontSize.value) as typeof twitch.fontSize,
        };

        electronStore.set('options.twitch', data);
    }, 200);
}

function updateBlacklist(event: Event) {
    const target = event.target as HTMLInputElement;
    const blacklist = target.value.split(',').map(user => user.trim());
    const data: Twitch = {
        ...electronStore.get('options').twitch,
        userBlacklist: blacklist,
    };

    electronStore.set('options.twitch', data);
    userBlacklist.value = blacklist;

    enableBlacklistSuccess();
}

function saveFadeTimeout() {
    if (fade.value) {
        const data: Twitch = {
            ...electronStore.get('options').twitch,
            fadeTimeout: fadeTimeout.value,
        };

        electronStore.set('options.twitch', data);
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
                id="user-blacklist" :default-value="userBlacklist.join(', ')"
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
