<template>
    <div id="changelog" class="container">
        <h2>Current</h2>
        <div>
            <h3>2.5.2</h3>
            <hr />
            <ul>
                <li>
                    <span>Added new tray icon menu options.</span>
                    <ul>
                        <li>You can now reset your config and clear old logs.</li>
                        <li>Added debug information copy button for bug reporting.</li>
                    </ul>
                    <mark><u><small>These options can be found in the Miscellaneous section.</small></u></mark>
                </li>
                <li>Updated default font size to always apply.</li>
            </ul>
        </div>
        <hr />
        <div id="support-buttons">
            <div class="center-elements">
                <small id="support-buttons-info">
                    {{ t('start.supportButtonsInfo') }}
                </small>
            </div>
            <div id="icons">
                <a
                    href="https://www.paypal.com/donate/?hosted_button_id=RQFDVMBP397KG"
                    role="button"
                    class="secondary"
                >
                    <font-awesome-icon icon="fa-brands fa-paypal" style="font-size: 37pt; color: #00457C;" />
                </a>
                <a
                    href="https://www.buymeacoffee.com/enubia"
                    role="button"
                    class="secondary"
                >
                    <img src="../assets/svg/buymeacoffee.svg" width="50px">
                </a>
            </div>
        </div>
        <hr />
        <h2>Previous</h2>
        <div>
            <h3>2.5.0</h3>
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
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>
