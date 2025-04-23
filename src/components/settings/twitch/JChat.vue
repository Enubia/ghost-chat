<script setup lang="ts">
import { shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { Input } from '#components/ui/input';
import { Label } from '#components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#components/ui/select';
import { Switch } from '#components/ui/switch';

const props = defineProps<{
    fontSize: string;
    stroke: string;
    animate: boolean;
    fade: boolean;
    fadeTimeout: number;
    bots: boolean;
    hideCommands: boolean;
    hideBadges: boolean;
    font: string;
    shadow: string;
    smallCaps: boolean;
}>();

const emit = defineEmits([
    'update:fontSize',
    'update:stroke',
    'update:animate',
    'update:fade',
    'update:fadeTimeout',
    'update:bots',
    'update:hideCommands',
    'update:hideBadges',
    'update:font',
    'update:shadow',
    'update:smallCaps',
]);

const { t, rt, tm } = useI18n();

const fontSize = shallowRef(props.fontSize);
const stroke = shallowRef(props.stroke);
const animate = shallowRef(props.animate);
const fade = shallowRef(props.fade);
const fadeTimeout = shallowRef(props.fadeTimeout);
const bots = shallowRef(props.bots);
const hideCommands = shallowRef(props.hideCommands);
const hideBadges = shallowRef(props.hideBadges);
const font = shallowRef(props.font);
const shadow = shallowRef(props.shadow);
const smallCaps = shallowRef(props.smallCaps);
</script>

<template>
    <div class="flex flex-col gap-2">
        <Label for="font-size">
            {{ t('settings.twitch.font-size.label') }}
        </Label>
        <Select id="font-size" v-model="fontSize" @update:model-value="emit('update:fontSize', $event)">
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
        <Select id="stroke" v-model="stroke" @update:model-value="emit('update:stroke', $event)">
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
            <Switch id="animate" v-model:checked="animate" @update:checked="emit('update:animate', $event)" />
            <Label class="align-elements" for="animate">
                {{ t('settings.twitch.animate.label') }}
            </Label>
        </div>
        <small class="text-muted-foreground">{{ t('settings.twitch.animate.info') }}</small>
    </div>

    <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                <Switch id="fade" v-model:checked="fade" @update:checked="emit('update:fade', $event)" />
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
                    @update:model-value="emit('update:fadeTimeout', $event)"
                />
            </div>
        </div>
        <small class="text-muted-foreground">{{ t('settings.twitch.fade.info') }}</small>
    </div>

    <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
            <Switch id="show-bots" v-model:checked="bots" @update:checked="emit('update:bots', $event)" />
            <Label class="align-elements" for="show-bots">
                {{ t('settings.twitch.show-bots.label') }}
            </Label>
        </div>
        <small class="text-muted-foreground">{{ t('settings.twitch.show-bots.info') }}</small>
    </div>

    <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
            <Switch
                id="hide-commands" v-model:checked="hideCommands"
                @update:checked="emit('update:hideCommands', $event)"
            />
            <Label class="align-elements" for="hide-commands">
                {{ t('settings.twitch.hide-commands.label') }}
            </Label>
        </div>
        <small class="text-muted-foreground">{{ t('settings.twitch.hide-commands.info') }}</small>
    </div>

    <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
            <Switch
                id="hide-badges" v-model:checked="hideBadges"
                @update:checked="emit('update:hideBadges', $event)"
            />
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
        <Select id="font" v-model="font" @update:model-value="emit('update:font', $event)">
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
        <Select id="shadow" v-model="shadow" @update:model-value="emit('update:shadow', $event)">
            <SelectTrigger>
                <SelectValue :placeholder="t('settings.twitch.shadow.select-label')" />
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
            <Switch id="small-caps" v-model:checked="smallCaps" @update:checked="emit('update:smallCaps', $event)" />
            <Label class="align-elements" for="small-caps">
                {{ t('settings.twitch.small-caps.label') }}
            </Label>
        </div>
        <small class="text-muted-foreground">{{ t('settings.twitch.small-caps.info') }}</small>
    </div>
</template>
