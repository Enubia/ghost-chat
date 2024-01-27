<template>
    <label for="keybind-input">
        {{ t('settings.document.general.keybind-change.label') }}
    </label>
    <small v-if="showError" class="error-text">
        {{ t('settings.document.general.keybind-change.error') }}
    </small>
    <input
        @keyup="handleKeyup"
        @keydown.prevent
        :placeholder="inputValue || t('settings.document.general.keybind-change.no-key')"
        id="keybind-input"
        name="keybind-setting"
        :aria-invalid="showError ? 'true' : undefined"
    />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { KeyToCode, hotkeyToString, isFunctionKey } from '../../../shared/utils/keyToCode';

const { t } = useI18n();
const emit = defineEmits(['update:modelValue']);
const props = defineProps<{
    modelValue: string | null;
}>();

const showError = ref(false);
const inputValue = ref(props.modelValue);

const handleKeyup = (event: KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.code === 'Backspace') {
        inputValue.value = null;
        return emit('update:modelValue', null);
    }

    let { code, ctrlKey, shiftKey, altKey, metaKey } = event;

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
            return;
        }

        inputValue.value = code;

        if (metaKey) {
            showError.value = true;
            return;
        } else {
            showError.value = false;
        }

        emit('update:modelValue', code);
    }
};
</script>
