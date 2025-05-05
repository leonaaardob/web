<script setup lang="ts">
import MatchmakingSettings from "~/components/matchmaking/MatchmakingSettings.vue";
definePageMeta({
  layout: "profile-settings",
});
</script>

<template>
  <div class="p-4 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">
          {{ $t("pages.settings.matchmaking.title") }}
        </h1>
        <p class="text-gray-400 mt-1">
          {{ $t("pages.settings.matchmaking.description") }}
        </p>
      </div>
    </div>
  </div>

  <MatchmakingSettings />
</template>

<script lang="ts">
export default {};
</script>
