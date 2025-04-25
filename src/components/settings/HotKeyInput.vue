<script setup lang="ts">
import { shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { Input } from '#components/ui/input';
import { Label } from '#components/ui/label';
import { hotkeyToString, isFunctionKey, KeyToCode } from '#shared/utils/keyToCode';

const props = defineProps<{
    modelValue: string | null;
}>();
const emit = defineEmits(['update:keyup']);
const { t } = useI18n();

const showSingleKeyError = shallowRef(false);
const showMetaError = shallowRef(false);
const inputValue = shallowRef(props.modelValue);

function handleKeyup(event: KeyboardEvent) {
    if (event.code === 'Backspace') {
        inputValue.value = null;
        return emit('update:keyup', null);
    }

    let { code, ctrlKey, shiftKey, altKey, metaKey } = event;

    if (metaKey || code === 'MetaLeft' || code === 'MetaRight') {
        showMetaError.value = true;
        return;
    } else {
        showMetaError.value = false;
    }

    if (code.startsWith('Key')) {
        code = code.slice('Key'.length);
    } else if (code.startsWith('Digit')) {
        code = code.slice('Digit'.length);
    } else if (event.key === 'Cancel' && code === 'Pause') {
        code = 'Cancel';
    }

    if ((KeyToCode as Record<string, number>)[code]) {
        code = hotkeyToString([code], ctrlKey, shiftKey, altKey);

        if (!isFunctionKey(code) && !code.includes('+')) {
            showSingleKeyError.value = true;
            return;
        } else {
            showSingleKeyError.value = false;
        }

        inputValue.value = code;

        emit('update:keyup', code);
    }
}
</script>

<template>
    <div>
        <Label for="keybind-input">
            {{ t('settings.general.keybind-change.label') }}
        </Label>
        <Input
            id="keybind-input"
            :placeholder="inputValue || t('settings.general.keybind-change.no-key')"
            :class="{
                'border-red-500': showSingleKeyError || showMetaError,
            }"
            @focusout="() => showSingleKeyError = showMetaError = false"
            @keyup="handleKeyup"
            @keydown.prevent
        />
        <div class="flex flex-col">
            <small v-if="showMetaError" class="text-red-500">
                {{ t('settings.general.keybind-change.meta-error') }}
            </small>
            <small v-if="showSingleKeyError" class="text-red-500">
                {{ t('settings.general.keybind-change.single-key-error') }}
            </small>
        </div>
    </div>
</template>
