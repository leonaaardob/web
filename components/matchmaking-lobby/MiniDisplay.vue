<script setup lang="ts">
import { Users } from "lucide-vue-next";
</script>

<template>
  <div class="flex flex-col gap-2 mt--4">
    <div
      class="flex items-center justify-center gap-2 text-sm text-muted-foreground"
    >
      <Users class="h-4 w-4" />
      <span>{{ onlineFriends?.length || 0 }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Users } from "lucide-vue-next";

export default {
  computed: {
    friends() {
      return useMatchmakingStore().friends.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    },
    onlineFriends() {
      return this.friends?.filter((friend) => {
        if (friend.status === "Pending") {
          return false;
        }

        return useMatchmakingStore().onlinePlayerSteamIds.includes(
          friend.steam_id,
        );
      });
    },
  },
};
</script>
