import { reactive } from 'vue';

export const versionState = reactive({
    new: '',
    setNew: (newVersion: string) => {
        versionState.new = newVersion;
    },
});
