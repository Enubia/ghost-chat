<template>
    <div
        id="start"
        class="center-elements"
    >
        <div>
            <div class="center-elements">
                <img src="/icons/icon-128x128.png">
            </div>
            <Twitch
                v-if="showTwitchInput"
                :store="store"
                @channel="($event) => $emit('channel', $event)"
            />
            <External
                v-else
                :store="store"
                @source="($event) => $emit('source', $event)"
            />
            <div class="center-elements">
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
            <div id="support-buttons">
                <div class="center-elements">
                    <small id="support-buttons-info">
                        {{ t('start.supportButtonsInfo') }}
                    </small>
                </div>
                <div id="icons" class="center-elements">
                    <a
                        href="https://www.paypal.com/donate/?hosted_button_id=RQFDVMBP397KG"
                    >
                        <font-awesome-icon icon="fa-brands fa-paypal" style="font-size: 38pt; color: #00457C;" />
                    </a>
                    <a
                        href="https://www.buymeacoffee.com/enubia"
                    >
                        <img src="../assets/svg/buymeacoffee.svg" width="50px">
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ElectronStore from 'electron-store';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { AppStore } from '../../shared/types';
import External from '../components/start/External.vue';
import Twitch from '../components/start/Twitch.vue';

const { t } = useI18n();

const showTwitchInput = ref(true);

defineProps<{ store: ElectronStore<AppStore> }>();

defineEmits<{ (event: 'channel', channel: string): void; (event: 'source', source: string): void }>();
</script>
