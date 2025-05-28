<script lang="ts" setup>
import MatchLineupScoreDisplay from "~/components/match/MatchLineupScoreDisplay.vue";
</script>

<template>
  <div class="flex gap-2">
    <template v-if="bracket.match">
      <MatchLineupScoreDisplay
        :match="bracket.match"
        :lineup="lineup"
      ></MatchLineupScoreDisplay>
    </template>
    <span>
      {{ lineup.name }}
    </span>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    lineup: {
      type: Object,
      required: true,
    },
    match: {
      type: Object,
      required: true,
    },
    bracket: {
      type: Object,
      required: true,
    },
  },
};
</script>
