<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

defineEmits<{ (event: 'channel', channel: string): void; (event: 'source', source: string): void }>();

const { t } = useI18n();

const showTwitchInput = ref(true);
</script>

<template>
    <div
        id="start"
        class="flex justify-center items-center"
    >
        <div>
            <div class="flex justify-center items-center">
                <img src="/icons/icon-128x128.png">
            </div>
            <Twitch
                v-if="showTwitchInput"
                @channel="($event) => $emit('channel', $event)"
            />
            <External
                v-else
                @source="($event) => $emit('source', $event)"
            />
            <div class="flex justify-center items-center">
                <small
                    v-if="showTwitchInput"
                    class="source-loader-info"
                    @click="showTwitchInput = !showTwitchInput"
                >
                    {{ t('start.twitch.sourceSwitcher') }}
                </small>
                <small
                    v-else
                    class="source-loader-info"
                    @click="showTwitchInput = !showTwitchInput"
                >
                    {{ t('start.external.sourceSwitcher') }}
                </small>
            </div>
        </div>
    </div>
</template>
