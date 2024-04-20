<script setup lang="ts">
import type ElectronStore from 'electron-store';

import { Icon } from '@iconify/vue';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router/auto';

import type { AppStore, ExternalBrowserSource } from '@shared/types';

import { Button } from '@components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog';
import { Input } from '@components/ui/input';

const router = useRouter();
const { t } = useI18n();

const electronStore = inject('electronStore') as ElectronStore<AppStore>;

const source = ref('');
const hasRegexError = ref(false);
const hasError = ref(false);

function checkRegex() {
    if (source.value === '') {
        hasRegexError.value = false;
        return;
    }

    const regex
        = /^(http(s)?)?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

    hasRegexError.value = !regex.test(source.value);
}

function enableStartButton() {
    checkRegex();

    if (source.value !== '' && !hasRegexError.value) {
        hasError.value = false;
    } else {
        hasError.value = true;
    }
}

function routeExternal() {
    checkRegex();

    if (source.value !== '' && !hasRegexError.value) {
        const data: ExternalBrowserSource = {
            css: '',
            js: '',
            sources: [
                ...electronStore.get('options').external.sources,
                source.value,
            ],
        };
        electronStore.set('options.external', data);
        router.push(`/webview/externalsource?source=${source.value}`);
    }
}
</script>

<template>
    <Dialog>
        <DialogTrigger>
            <div class="flex justify-center rounded p-4 hover:cursor-pointer hover:scale-105 bg-secondary shadow-xl">
                <Icon icon="pepicons-print:internet" class="w-10 h-12 text-blue-500" />
            </div>
        </DialogTrigger>
        <DialogContent class="w-3/4 rounded">
            <DialogHeader class="text-start">
                <DialogTitle>
                    {{ t('start.external.title') }}
                </DialogTitle>
                <DialogDescription class="grid gap-3">
                    {{ t('start.external.info') }}
                </DialogDescription>
            </DialogHeader>
            <Input
                v-model="source" :class="hasRegexError ? 'border-red-500' : ''" placeholder="https://twitch.tv"
                @change="enableStartButton" @keydown.enter="routeExternal"
            />
            <small v-if="hasRegexError" class="text-red-500 text-xs">{{ t('start.external.input.error') }}</small>
            <Button :disabled="!source.length || hasError" @click="routeExternal">
                {{ t('start.external.button') }}
            </Button>
        </DialogContent>
    </Dialog>
</template>
