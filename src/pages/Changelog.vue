<template>
    <div class="container">
        <div>
            <h3>Version 2.5.0</h3>
            <hr />
            <ul>
                <li>Added an in app changelog</li>
                <li>Added hotkey toggle option for vanish mode</li>
                <li>
                    Updated kapchat settings,
                    it is no longer required to manually save the settings after a change was done
                </li>
            </ul>
        </div>
        <hr />
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
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>
