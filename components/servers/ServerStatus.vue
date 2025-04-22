<script setup lang="ts">
import FiveStackToolTip from "~/components/FiveStackToolTip.vue";
</script>

<template>
  <FiveStackToolTip>
    <template #trigger>
      <div
        class="h-2 w-2 rounded-full relative"
        :class="{
          'bg-red-600': !server.connected,
          'bg-yellow-600': server.connected && !server.rcon_status,
          'bg-green-600': server.connected && server.rcon_status,
        }"
      >
        <span
          class="animate-ping absolute left-0 h-2 w-2 rounded-full opacity-75"
          :class="{
            'bg-red-600': !server.connected,
            'bg-yellow-600': server.connected && !server.rcon_status,
          }"
          v-if="!server.connected || !server.rcon_status"
        ></span>
      </div>
    </template>

    <template v-if="!server.connected">
      {{ $t("pages.dedicated_servers.detail.status.disconnected") }}
    </template>
    <template v-else-if="!server.rcon_status">
      {{ $t("pages.dedicated_servers.detail.status.no_rcon") }}
    </template>
    <template v-else>
      connected
      {{ $t("pages.dedicated_servers.detail.status.connected") }}
    </template>
  </FiveStackToolTip>
</template>

<script lang="ts">
export default {
  props: {
    server: {
      type: Object,
      required: true,
    },
  },
};
</script>
