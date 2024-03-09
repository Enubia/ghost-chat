<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { Primitive, type PrimitiveProps } from 'radix-vue';
import { type ButtonVariants, buttonVariants } from '.';
import { cn } from '@/lib/utils';

interface Props extends PrimitiveProps {
    variant?: ButtonVariants['variant'];
    size?: ButtonVariants['size'];
    rounded?: ButtonVariants['rounded'];
    as?: string;
    class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
    as: 'button',
});
</script>

<template>
    <Primitive
        :as="as"
        :as-child="asChild"
        :class="cn(buttonVariants({ variant, size, rounded }), props.class)"
    >
        <slot />
    </Primitive>
</template>
