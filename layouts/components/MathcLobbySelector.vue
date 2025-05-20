<script lang="ts" setup>
import MatchLobby from "./MatchLobby.vue";
</script>

<template>
  <div
    class="hidden md:flex gap-2 p-1 rounded-sm border transition-colors bg-background"
    :class="{
      'flex-col': showSwitch,
      'cursor-pointer': canRoute,
      'hover:border-gray-600': canRoute,
    }"
    @click="goToMatch"
  >
    <div
      class="flex items-center justify-center px-4 py-1 gap-1 bg-accent/70 text-green-400 text-xs font-medium rounded-sm"
      :class="{
        'animate-pulse': pulse,
      }"
    >
      {{ match.e_match_status.description }}
    </div>

    <MatchLobby :match="match"></MatchLobby>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    match: {
      required: true,
    },
    showSwitch: {
      default: false,
      type: Boolean,
    },
    pulse: {
      default: false,
      type: Boolean,
    },
  },
  methods: {
    goToMatch() {
      this.$router.push({
        name: "matches-id",
        params: { id: this.match.id },
      });
    },
  },
  computed: {
    canRoute() {
      return this.$route.params?.id !== this.match?.id;
    },
  },
};
</script>
