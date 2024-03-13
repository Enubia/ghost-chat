<script setup lang="ts">
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type ElectronStore from 'electron-store';
import External from '../components/start/External.vue';
import Twitch from '../components/start/Twitch.vue';
import type { AppStore } from '../../shared/types';

defineEmits<{ (event: 'channel', channel: string): void; (event: 'source', source: string): void }>();

const { t } = useI18n();
const store = inject<ElectronStore<AppStore>>('store');

const supportBoxThreshold = 5;

const showTwitchInput = ref(true);

function closeSupport() {
    store?.set('general', {
        ...store.get('general'),
        showSupportBox: false,
    });
    document.querySelector('#donate')?.classList.add('d-none');
}
</script>

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
                @channel="($event) => $emit('channel', $event)"
            />
            <External
                v-else
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
            <div
                v-if="store?.get('general').showSupportBox && store?.get('general').launchCounter === supportBoxThreshold"
                id="donate"
                class="center-elements"
            >
                <article>
                    <div id="close">
                        <button class="ghost" @click="closeSupport">
                            <font-awesome-icon icon="fas fa-xmark" />
                        </button>
                    </div>
                    <small class="center-elements text-center">
                        Like the app?
                        <br>
                        Consider supporting the development!
                    </small>
                    <div id="paypal" class="center-elements">
                        <a href="https://www.paypal.com/donate/?hosted_button_id=JMYLMVGSKXXEW">
                            <img
                                src="https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white"
                                alt="Donate with PayPal"
                            >
                        </a>
                    </div>
                    <div id="buymeacoffee" class="center-elements">
                        <a href="https://www.buymeacoffee.com/enubia">
                            <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=enubia&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff">
                        </a>
                    </div>
                </article>
            </div>
        </div>
    </div>
</template>
