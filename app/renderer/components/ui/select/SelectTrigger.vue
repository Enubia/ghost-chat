<script setup lang="ts">
import { CaretSortIcon } from '@radix-icons/vue';
import type { SelectTriggerProps } from 'radix-vue';
import { SelectIcon, SelectTrigger, useForwardProps } from 'radix-vue';
import type { HTMLAttributes } from 'vue';
import { computed } from 'vue';

import { cn } from '#lib/utils/cn';

const props = defineProps<SelectTriggerProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;

    return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
    <SelectTrigger
        v-bind="forwardedProps"
        :class="
            cn(
                'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
                props.class,
            )
        "
    >
        <slot />
        <SelectIcon as-child>
            <CaretSortIcon class="opacity-50 size-4" />
        </SelectIcon>
    </SelectTrigger>
</template>
