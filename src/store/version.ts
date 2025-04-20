import { reactive } from 'vue';

// not best practice, but this is a simple way to keep all the version related code in one place
export const version = reactive({
    hasNew: false,
    downloadLink: 'https://github.com/enubia/ghost-chat/releases/latest',
});
