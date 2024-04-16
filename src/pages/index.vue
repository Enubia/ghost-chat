<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import External from '@components/index/External.vue';
import Twitch from '@components/index/Twitch.vue';

const { t } = useI18n();

const showTwitchInput = ref(true);
</script>

<template>
    <div class="flex justify-center items-center pt-20">
        <div>
            <Twitch v-if="showTwitchInput" />
            <External v-else />
            <div class="center-elements">
                <small v-if="showTwitchInput" class="source-loader-info" @click="showTwitchInput = !showTwitchInput">
                    {{ t('start.twitch.sourceSwitcher') }}
                </small>
                <small v-else class="source-loader-info" @click="showTwitchInput = !showTwitchInput">
                    {{ t('start.external.sourceSwitcher') }}
                </small>
            </div>
        </div>
    </div>
</template>
