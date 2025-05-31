<script setup lang="ts">
import { cn } from '#lib/utils/cn';
import type { LabelProps } from 'radix-vue';
import { Label } from 'radix-vue';
import type { HTMLAttributes } from 'vue';
import { computed } from 'vue';

const props = defineProps<LabelProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;

    return delegated;
});
</script>

<template>
    <Label
        v-bind="delegatedProps"
        :class="cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', props.class)"
    >
        <slot />
    </Label>
</template>
