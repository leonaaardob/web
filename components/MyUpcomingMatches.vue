<script lang="ts" setup>
import SimpleMatchDisplay from "./SimpleMatchDisplay.vue";
</script>

<template>
  <div
    class="flex gap-4 overflow-x-auto"
    v-if="matches.length > 0 && !isCurrentMatch"
  >
    <template v-if="matches?.length > 0">
      <SimpleMatchDisplay
        :key="match.id"
        :match="match"
        v-for="match of matches"
      ></SimpleMatchDisplay>
    </template>
    <template v-else>
      <div class="text-center w-full p-4">
        <p class="text-muted-foreground">
          {{ $t("match.my_upcoming.no_matches") }}
        </p>
      </div>
    </template>
  </div>
  <slot v-if="matches.length > 0 && !isCurrentMatch"></slot>
</template>

<script lang="ts">
export default {
  computed: {
    matches() {
      return useMatchLobbyStore().managingMatches;
    },
    isCurrentMatch() {
      return (
        this.matches.length === 1 &&
        this.matches.at(0).id === useMatchLobbyStore().currentMatch?.id
      );
    },
  },
};
</script>
