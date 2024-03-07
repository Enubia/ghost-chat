<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

defineEmits<{ (event: 'source', source: string): void }>();

const { t } = useI18n();

const source = ref('');
const hasRegexError = ref(false);

function checkRegex() {
    if (source.value === '') {
        hasRegexError.value = false;
        return;
    }

    const regex
        = /^(http(s)?)?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

    hasRegexError.value = !regex.test(source.value);
}
</script>

<template>
    <div class="flex justify-center content-center">
        <Input
            v-model="source"
            :class="hasRegexError ? 'border-destructive' : ''"
            placeholder="https://twitch.tv"
            type="text"
            @change="checkRegex"
            @keydown.enter="$emit('source', source)"
        />
    </div>
    <div
        class="flex justify-center content-center"
    >
        <small
            v-if="hasRegexError"
            id="info"
            class="text-center text-destructive"
        >
            {{ t('start.external.input.error') }}
        </small>
        <small v-else>
            {{ t('start.external.input.info') }}
        </small>
    </div>
    <div class="flex justify-center content-center">
        <Button
            :disabled="!hasRegexError ? false : true"
            @click="$emit('source', source)"
        >
            {{ t('start.external.button') }}
        </Button>
    </div>
</template>
