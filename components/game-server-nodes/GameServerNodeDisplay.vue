<script setup lang="ts">
import FiveStackToolTip from "~/components/FiveStackToolTip.vue";
import { e_game_server_node_statuses_enum } from "~/generated/zeus";
</script>

<template>
  <div class="flex gap-2 items-center">
    <FiveStackToolTip>
      <template #trigger>
        <div
          class="h-2 w-2 rounded-full relative"
          :class="{
            ['bg-red-600']:
              gameServerNode.status ===
              e_game_server_node_statuses_enum.Offline,
            ['bg-green-600']:
              gameServerNode.status === e_game_server_node_statuses_enum.Online,
            ['bg-yellow-600']:
              gameServerNode.status ===
                e_game_server_node_statuses_enum.Setup ||
              gameServerNode.status ===
                e_game_server_node_statuses_enum.NotAcceptingNewMatches,
          }"
        >
          <span
            class="animate-ping absolute left-0 h-2 w-2 rounded-full opacity-75"
            :class="{
              ['bg-red-400']:
                gameServerNode.status ===
                e_game_server_node_statuses_enum.Offline,
              ['bg-yellow-400']:
                gameServerNode.status ===
                  e_game_server_node_statuses_enum.Setup ||
                gameServerNode.status ===
                  e_game_server_node_statuses_enum.NotAcceptingNewMatches,
            }"
            v-if="
              gameServerNode.status !== e_game_server_node_statuses_enum.Online
            "
          ></span>
        </div>
      </template>

      <template
        v-if="
          gameServerNode.status === e_game_server_node_statuses_enum.Offline
        "
      >
        {{ $t("pages.game_server_nodes.status.offline") }}
      </template>
      <template
        v-else-if="
          gameServerNode.status === e_game_server_node_statuses_enum.Online
        "
      >
        {{ $t("pages.game_server_nodes.status.online") }}
      </template>
      <template
        v-else-if="
          gameServerNode.status === e_game_server_node_statuses_enum.Setup
        "
      >
        {{ $t("pages.game_server_nodes.status.setup") }}
      </template>
      <template
        v-else-if="
          gameServerNode.status ===
          e_game_server_node_statuses_enum.NotAcceptingNewMatches
        "
      >
        {{ $t("pages.game_server_nodes.status.not_accepting") }}
      </template>
    </FiveStackToolTip>

    <span class="truncate">
      <div class="flex flex-col">
        <div class="font-medium text-sm">
          {{ gameServerNode.label || gameServerNode.id }}
        </div>
        <div class="text-muted-foreground text-xs" v-if="gameServerNode.label">
          {{ gameServerNode.id }}
        </div>
      </div>
    </span>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    gameServerNode: {
      type: Object,
      required: true,
    },
  },
};
</script>
