<script setup lang="ts">
import { cn } from '#lib/utils/cn';
import type { DialogTitleProps } from 'radix-vue';
import { DialogTitle, useForwardProps } from 'radix-vue';
import type { HTMLAttributes } from 'vue';
import { computed } from 'vue';

const props = defineProps<DialogTitleProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;

    return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
    <DialogTitle
        v-bind="forwardedProps"
        :class="cn('text-lg font-semibold leading-none tracking-tight', props.class)"
    >
        <slot />
    </DialogTitle>
</template>
