<script lang="ts" setup>
import { Info } from "lucide-vue-next";
</script>

<template>
  <TooltipProvider
    :ignoreNonKeyboardFocus="true"
    :delay-duration="delayDuration"
  >
    <Tooltip>
      <TooltipTrigger type="button">
        <slot name="trigger">
          <Info :size="size" v-bind="$attrs"> </Info>
        </slot>
      </TooltipTrigger>
      <TooltipContent :side="side">
        <slot></slot>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
  props: {
    size: {
      type: Number,
      default: 12,
    },
    side: {
      type: String,
      required: false,
    },
    delayDuration: {
      type: Number,
      default: 0,
    },
  },
};
</script>
