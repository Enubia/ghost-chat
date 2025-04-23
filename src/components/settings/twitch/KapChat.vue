<script setup lang="ts">
import { shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { Input } from '#components/ui/input';
import { Label } from '#components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#components/ui/select';
import Slider from '#components/ui/slider/Slider.vue';
import { Switch } from '#components/ui/switch';

const props = defineProps<{
    theme: string;
    preventClipping: boolean;
    fade: boolean;
    bots: boolean;
    fontSizeExact: number;
    fadeTimeout: number;
}>();

const emit = defineEmits([
    'update:theme',
    'update:preventClipping',
    'update:fade',
    'update:bots',
    'update:fontSizeExact',
    'update:fadeTimeout',
]);

const theme = shallowRef(props.theme);
const preventClipping = shallowRef(props.preventClipping);
const fade = shallowRef(props.fade);
const bots = shallowRef(props.bots);
const fontSizeExact = shallowRef([props.fontSizeExact]);
const fadeTimeout = shallowRef(props.fadeTimeout);

const { t, tm, rt } = useI18n();
</script>

<template>
    <div class="flex flex-col gap-2">
        <Label for="theme">
            {{ t('settings.twitch.theme.label') }}
        </Label>
        <Select id="theme" v-model="theme" @update:model-value="emit('update:theme', $event)">
            <SelectTrigger>
                <SelectValue :placeholder="t('settings.twitch.theme.select-label')" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem
                    v-for="[key, value] in Object.entries(tm('settings.twitch.theme.select-options'))"
                    :key="key" :value="key"
                >
                    {{ rt(value) }}
                </SelectItem>
            </SelectContent>
        </Select>
        <small class="text-muted-foreground">{{ t('settings.twitch.theme.info') }}</small>
    </div>
    <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
            <Switch v-model:checked="preventClipping" @update:checked="emit('update:preventClipping', $event)" />
            <Label class="align-elements" for="prevent-clipping">
                {{ t('settings.twitch.prevent-clipping.label') }}
            </Label>
        </div>
        <small class="text-muted-foreground">{{ t('settings.twitch.prevent-clipping.info') }}</small>
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
        <Label class="align-elements" for="font-size-exact">
            {{ t('settings.twitch.font-size-exact.label') }}
        </Label>
        <Slider
            id="font-size-exact" v-model="fontSizeExact" class="my-3" :default-value="fontSizeExact" :min="10"
            :max="50" :step="1"
            @update:model-value="emit('update:fontSizeExact', $event ? $event[0] : fontSizeExact[0])"
        />
        <small class="text-muted-foreground" :style="`font-size: ${fontSizeExact[0]}px;`">
            {{ t('settings.twitch.font-size-exact.info', { size: fontSizeExact[0] }) }}
        </small>
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
</template>
