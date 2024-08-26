<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { Button } from '#components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '#components/ui/dialog';
import { Input } from '#components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#components/ui/select';
import IpcHandler from '#lib/ipchandler';
import { StoreDefaults } from '#shared/constants';

const router = useRouter();
const { t } = useI18n();

const external = ref(StoreDefaults.options.external);
const source = ref('');
const sources = ref<string[]>([]);
const hasRegexError = ref(false);
const hasError = ref(false);

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
            await IpcHandler.setValueFromKey('options.external.sources', [
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
