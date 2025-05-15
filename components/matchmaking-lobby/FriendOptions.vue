<script lang="ts" setup>
import { Plus, Trash2, User } from "lucide-vue-next";
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <slot></slot>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-56">
      <DropdownMenuItem>
        <NuxtLink
          :to="{ name: 'players-id', params: { id: player.steam_id } }"
          class="flex items-center"
        >
          <User class="mr-2 h-4 w-4" />
          <span>{{ $t("matchmaking.friends.view_profile") }}</span>
        </NuxtLink>
      </DropdownMenuItem>

      <DropdownMenuItem @click="inviteToLobby">
        <Plus class="mr-2 h-4 w-4" />
        <span>{{ $t("matchmaking.friends.invite_to_lobby") }}</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        @click="inviteToMatch"
        :class="!canInviteToMatch ? 'opacity-50 pointer-events-none' : ''"
      >
        <Plus class="mr-2 h-4 w-4" />
        <span>{{ $t("matchmaking.friends.invite_to_match") }}</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem @click="removeFriend" class="text-red-500">
        <Trash2 class="mr-2 h-4 w-4" />
        <span>{{ $t("matchmaking.friends.remove") }}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script lang="ts">
import { typedGql } from "~/generated/zeus/typedDocumentNode";
import { generateMutation } from "~/graphql/graphqlGen";
import { e_lobby_access_enum } from "~/generated/zeus";

export default {
  props: {
    player: {
      type: Object,
      required: true,
    },
  },
  computed: {
    me() {
      return useAuthStore().me;
    },
    currentMatch() {
      return useMatchLobbyStore().currentMatch;
    },
    canInviteToMatch() {
      if (!this.currentMatch) {
        return false;
      }

      if (
        ![
          e_lobby_access_enum.Open,
          e_lobby_access_enum.Friends,
          e_lobby_access_enum.Invite,
        ].includes(this.currentMatch.options.lobby_access)
      ) {
        return false;
      }

      if (
        this.currentMatch.lineup_counts.lineup_1_count <
          this.currentMatch.max_players_per_lineup ||
        this.currentMatch.lineup_counts.lineup_2_count <
          this.currentMatch.max_players_per_lineup
      ) {
        return true;
      }

      return false;
    },
    invitedToMatch() {
      if (!this.currentMatch) {
        return false;
      }

      return this.currentMatch.invites.find(
        (invite) => invite.steam_id === this.player.steam_id,
      );
    },
  },
  methods: {
    async inviteToLobby() {
      await useMatchmakingStore().inviteToLobby(this.player.steam_id);
    },
    async inviteToMatch() {
      if (!this.currentMatch) {
        return;
      }

      await this.$apollo.mutate({
        mutation: generateMutation({
          insert_match_invites_one: [
            {
              object: {
                steam_id: this.player.steam_id,
                match_id: this.currentMatch.id,
              },
            },
            {
              __typename: true,
            },
          ],
        }),
      });
    },
    async removeFriend() {
      await this.$apollo.mutate({
        mutation: typedGql("mutation")({
          delete_my_friends: [
            {
              where: {
                steam_id: {
                  _eq: this.player.steam_id,
                },
              },
            },
            {
              __typename: true,
            },
          ],
        }),
      });
    },
  },
};
</script>
