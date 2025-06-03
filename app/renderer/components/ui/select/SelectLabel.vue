<script setup lang="ts">
import type { SelectLabelProps } from 'radix-vue';
import { SelectLabel } from 'radix-vue';
import type { HTMLAttributes } from 'vue';

import { cn } from '#lib/utils/cn';

const props = defineProps<SelectLabelProps & { class?: HTMLAttributes['class'] }>();
</script>

<template>
    <SelectLabel :class="cn('px-2 py-1.5 text-sm font-semibold', props.class)">
        <slot />
    </SelectLabel>
</template>
