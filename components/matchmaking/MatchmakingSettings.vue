<script setup lang="ts">
import { webrtc } from "~/web-sockets/Webrtc";
import { useApplicationSettingsStore } from "~/stores/ApplicationSettings";
import { Button } from "~/components/ui/button";
import { RefreshCw } from "lucide-vue-next";
import { Loader2 } from "lucide-vue-next";
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center p-8 border border-border rounded-lg bg-card">
      <div class="flex-1">
        <div class="flex justify-between mb-4">
          <Label class="text-lg font-semibold">
            {{ $t("pages.settings.matchmaking.max_acceptable_ping") }}
          </Label>

          <span class="text-xl font-medium">{{ maxAcceptablePing }}ms</span>
        </div>
        <input
          type="range"
          v-model="maxAcceptablePing"
          min="50"
          max="200"
          step="5"
          class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          @change="updateMaxAcceptablePing"
        />
        <p class="text-sm text-muted-foreground mt-2">
          {{ $t("pages.settings.matchmaking.max_ping_description") }}
        </p>
      </div>
    </div>
  </div>

  <div class="border border-border rounded-lg bg-card">
    <div class="p-4 flex justify-end">
      <Button
        variant="outline"
        size="sm"
        @click="refreshLatencies"
        :disabled="isRefreshing"
      >
        <Loader2 v-if="isRefreshing" class="h-4 w-4 mr-2 animate-spin" />
        <RefreshCw v-else class="h-4 w-4 mr-2" />
        {{ $t("common.refresh") }}
      </Button>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-border">
        <thead>
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              {{ $t("pages.settings.matchmaking.region") }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              {{ $t("pages.settings.matchmaking.average_latency") }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              {{ $t("pages.settings.matchmaking.preferred") }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr
            v-for="region in availableRegions"
            :key="region.value"
            :class="{
              'hover:bg-muted/50 transition-colors': true,
              'opacity-50':
                !availableRegions.includes(region) &&
                !isPreferredRegion(region.value),
            }"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              {{ region.description }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="{
                  'px-3 py-1 rounded-full text-xs font-medium': true,
                  'bg-green-500/20 text-green-400':
                    Number(getAverageLatency(region.value)) < 50,
                  'bg-blue-500/20 text-blue-400':
                    Number(getAverageLatency(region.value)) < 100 &&
                    Number(getAverageLatency(region.value)) >= 50,
                  'bg-yellow-500/20 text-yellow-400':
                    Number(getAverageLatency(region.value)) <
                      maxAcceptablePing &&
                    Number(getAverageLatency(region.value)) >= 100,
                  'bg-red-500/20 text-red-400':
                    Number(getAverageLatency(region.value)) >=
                    maxAcceptablePing,
                  'bg-gray-500/20 text-gray-400': isNaN(
                    Number(getAverageLatency(region.value)),
                  ),
                }"
              >
                {{
                  isNaN(Number(getAverageLatency(region.value)))
                    ? "Measuring..."
                    : `${getAverageLatency(region.value)} ms`
                }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <Switch
                class="text-sm text-muted-foreground cursor-pointer flex items-center gap-2"
                :model-value="isPreferredRegion(region.value)"
                @click="togglePreferredRegion(region.value)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      maxAcceptablePing: 75,
      isRefreshing: false,
    };
  },
  mounted() {
    this.maxAcceptablePing = useMatchmakingStore().maxAcceptablePing || 75;
  },
  methods: {
    async refreshLatencies() {
      this.isRefreshing = true;
      try {
        await useMatchmakingStore().refreshLatencies();
      } finally {
        this.isRefreshing = false;
      }
    },
    togglePreferredRegion(region: string) {
      useMatchmakingStore().togglePreferredRegion(region);
    },
    updateMaxAcceptablePing() {
      useMatchmakingStore().updateMaxAcceptablePing(this.maxAcceptablePing);
    },
    getAverageLatency(region: string): string {
      return useMatchmakingStore().getAverageLatency(region);
    },
    getLatencyStatus(region: string): string {
      const avg = Number(this.getAverageLatency(region));
      if (isNaN(avg)) {
        return "Measuring...";
      }

      if (avg < 50) {
        return "Excellent";
      }

      if (avg < 100) {
        return "Good";
      }

      if (avg < this.maxAcceptablePing) {
        return "Fair";
      }

      return "Poor";
    },
    isPreferredRegion(region: string): boolean {
      return (
        useMatchmakingStore().preferredRegions.find((r) => {
          return r.value === region;
        }) !== undefined
      );
    },
  },
  computed: {
    availableRegions() {
      return useApplicationSettingsStore()?.availableRegions || [];
    },
  },
};
</script>
