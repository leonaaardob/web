<script setup lang="ts">
import { TooltipProvider, type TooltipProviderProps } from 'reka-ui'

const props = defineProps<TooltipProviderProps>()
</script>

<template>
  <TooltipProvider v-bind="props" :delay-duration="props.delayDuration || 0">
    <slot />
  </TooltipProvider>
</template>
