<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { onMounted, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { StoreDefaults } from '#ipc/constants/store';
import IpcHandler from '#lib/ipchandler';

import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const router = useRouter();
const { t } = useI18n();

const external = shallowRef(StoreDefaults.options.external);
const source = shallowRef('');
const sources = shallowRef<string[]>([]);
const hasRegexError = shallowRef(false);
const hasError = shallowRef(false);

onMounted(async () => {
    external.value = await IpcHandler.getExternalOptions();
    source.value = external.value.defaultUrl;
    sources.value = external.value.sources;
});

function checkRegex() {
    if (source.value === '') {
        hasRegexError.value = false;
        return;
    }

    const regex
        = /^https?:\/\/(?:www\.)?[-\w@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-\w()@:%+.~#?&/=]*$/;

    hasRegexError.value = !regex.test(source.value);
}

function enableStartButton() {
    checkRegex();

    hasError.value = !(source.value !== '' && !hasRegexError.value);
}

async function routeExternal() {
    checkRegex();

    if (source.value !== '' && !hasRegexError.value) {
        if (!external.value.sources.includes(source.value)) {
            await IpcHandler.setKeyValue('options.external.sources', [
                ...external.value.sources,
                source.value,
            ]);
        }

        router.push(`/webview/externalsource?source=${encodeURIComponent(source.value)}`);
    }
}

function applySourceFromList(item: string) {
    source.value = item;
    enableStartButton();
}
</script>

<template>
    <Dialog>
        <DialogTrigger>
            <div class="flex justify-center rounded bg-secondary p-4 hover:cursor-pointer hover:bg-gray-400">
                <Icon icon="pepicons-print:internet" class="h-12 w-10 text-blue-500" />
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
            <small v-if="hasRegexError" class="text-xs text-red-500">{{ t('start.external.input.error') }}</small>
            <Select v-if="sources.length" @update:model-value="applySourceFromList">
                <SelectTrigger>
                    <SelectValue :placeholder="t('start.external.sources-placeholder')" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem
                        v-for="(item, index) of sources" :key="index" v-model="sources[index]" class="w-full"
                        :value="item"
                    >
                        {{ item.substring(0, 30) + (item.length > 30 ? '...' : '') }}
                    </SelectItem>
                </SelectContent>
            </Select>
            <Button :disabled="!source.length || hasError" @click="routeExternal">
                {{ t('start.external.button') }}
            </Button>
        </DialogContent>
    </Dialog>
</template>
