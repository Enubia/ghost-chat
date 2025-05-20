import type { ShallowRef } from 'vue';

export function enableSuccessIndicator(ref: ShallowRef<boolean>) {
    ref.value = true;

    setTimeout(() => {
        ref.value = false;
    }, 2000);
}
