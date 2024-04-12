<script setup lang="ts">
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type ElectronStore from 'electron-store';
import External from '@components/index/External.vue';
import Twitch from '@components/index/Twitch.vue';
import type { AppStore } from '@shared/types';

const { t } = useI18n();
const electronStore = inject<ElectronStore<AppStore>>('electronStore');

const supportBoxThreshold = 5;

const showTwitchInput = ref(true);

function closeSupport() {
    electronStore?.set('general', {
        ...electronStore.get('general'),
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
            <Twitch v-if="showTwitchInput" />
            <External v-else />
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
        </div>
        <div
            v-if="electronStore?.get('general').showSupportBox && electronStore?.get('general').launchCounter === supportBoxThreshold"
            id="donate"
            class="center-elements"
        >
            <article>
                <div id="close">
                    <button class="ghost" @click="closeSupport">
                        <font-awesome-icon icon="fa fa-xmark" />
                    </button>
                </div>
                <small class="center-elements text-center">
                    {{ t('start.supportBox.messageStart') }}
                    <br>
                    {{ t('start.supportBox.messageEnd') }}
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
</template>
