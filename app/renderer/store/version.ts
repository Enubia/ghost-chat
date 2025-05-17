import { reactive } from 'vue';

export const versionStore = reactive({
    new: '',
    setNew: (newVersion: string) => {
        versionStore.new = newVersion;
    },
});
