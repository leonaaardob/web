<script lang="ts" setup>
import SimpleMatchDisplay from "./SimpleMatchDisplay.vue";
</script>

<template>
  <div class="flex gap-4 overflow-x-auto" v-if="matches.length > 0">
    <template v-if="matches?.length > 0">
      <div class="flex gap-4 overflow-x-auto">
        <SimpleMatchDisplay
          :key="match.id"
          :match="match"
          v-for="match of matches"
          class="flex-shrink-0"
        ></SimpleMatchDisplay>
      </div>
    </template>
    <template v-else>
      <div class="text-center w-full p-4">
        <p class="text-muted-foreground">
          {{ $t("match.my_upcoming.no_matches") }}
        </p>
      </div>
    </template>
  </div>
  <slot v-if="matches.length > 0"></slot>
</template>

<script lang="ts">
export default {
  computed: {
    matches() {
      return useMatchLobbyStore().myMatches;
    },
    currentMatch() {
      return useMatchLobbyStore().currentMatch;
    },
  },
};
</script>
