<script setup lang="ts">
import { Users } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useApplicationSettingsStore } from "~/stores/ApplicationSettings";
</script>

<template>
  <NuxtLink
    :to="{ name: 'matches-create' }"
    class="flex-1 p-6 border rounded-lg hover:bg-accent/10 cursor-pointer transition-all duration-200 group relative overflow-hidden"
  >
    <div class="flex items-start gap-4">
      <div
        class="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors"
      >
        <Users class="w-6 h-6 text-primary" />
      </div>
      <div class="space-y-2">
        <h3
          class="text-xl font-semibold group-hover:text-primary transition-colors"
        >
          {{ $t("custom_match.title") }}
        </h3>
        <p class="text-sm text-muted-foreground leading-relaxed">
          {{ $t("custom_match.description") }}
        </p>
      </div>
    </div>
    <div
      class="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mb-16 group-hover:bg-primary/10 transition-colors"
    ></div>
  </NuxtLink>
</template>

<script lang="ts">
export default {
  computed: {
    canCreateMatch() {
      return useApplicationSettingsStore().canCreateMatch;
    },
  },
};
</script>
