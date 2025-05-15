<script setup lang="ts">
import PlayerDisplay from "~/components/PlayerDisplay.vue";
import PlayerSearch from "~/components/PlayerSearch.vue";
import { Check, XIcon, Mail, Users } from "lucide-vue-next";
import MatchInvites from "./MatchInvites.vue";
import FriendsList from "./FriendsList.vue";
import MatchmakingLobbyAccess from "~/components/matchmaking-lobby/MatchmakingLobbyAccess.vue";
import MiniDisplay from "./MiniDisplay.vue";
</script>

<template>
  <div class="flex flex-col gap-4 overflow-auto">
    <template v-if="mini && showPendingActions">
      <div class="flex items-center justify-center mt-2">
        <Button variant="outline" size="icon" class="relative">
          <Mail class="h-4 w-4" />
          <div
            class="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"
          ></div>
        </Button>
      </div>
    </template>

    <template v-if="!mini">
      <MatchInvites v-if="matchInvites.length > 0" />

      <div class="flex flex-col gap-4" v-if="invitedLobbies?.length > 0">
        <h3 class="text-lg font-medium">
          {{ $t("matchmaking.lobby.invites") }}
        </h3>
        <template v-for="lobby of invitedLobbies">
          <div class="flex flex-row gap-2 justify-between">
            <div class="flex flex-row gap-2 items-center overflow-scroll">
              <div class="flex flex-row gap-2 items-center overflow-scroll">
                <TooltipProvider
                  :key="player.steam_id"
                  v-for="{ player } of lobby.players.filter(
                    (p) => p.player.steam_id !== me?.steam_id,
                  )"
                >
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <PlayerDisplay
                        :player="player"
                        :showOnline="false"
                        :showFlag="false"
                        :showName="false"
                        :showRole="false"
                        class="w-fit"
                      />
                    </TooltipTrigger>
                    <TooltipContent> {{ player.name }} </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div
                class="border border-gray-200 border-dashed h-full p-4 rounded-md cursor-pointer hover:bg-green-500/20 bg-transparent transition-all duration-200"
                @click="joinLobby(lobby.id)"
              >
                <Check class="h-3 w-3" />
              </div>
            </div>

            <div
              class="h-full p-4 rounded-md cursor-pointer hover:bg-red-500/20 bg-transparent transition-all duration-200"
            >
              <XIcon class="h-3 w-3" />
            </div>
          </div>
        </template>
      </div>
    </template>

    <template v-if="currentLobby">
      <div class="flex flex-row justify-between items-center" v-if="!mini">
        <div class="flex flex-row items-center gap-2">
          <h3 class="text-lg font-medium">
            {{ $t("matchmaking.lobby.title") }}
          </h3>
          <MatchmakingLobbyAccess :lobby="currentLobby" />
        </div>
        <Button
          variant="outline"
          @click="removeFromLobby(currentLobby.id, me?.steam_id)"
        >
          {{ $t("matchmaking.lobby.leave") }}
        </Button>
      </div>

      <player-search
        :label="$t('matchmaking.lobby.invite_player')"
        :self="false"
        @selected="(player) => inviteToLobby(player.steam_id)"
        v-if="!mini"
      ></player-search>

      <div
        class="flex flex-col gap-2"
        :class="{ 'max-h-[25vh] overflow-y-scroll': !mini }"
      >
        <template v-for="player of currentLobby?.players">
          <div
            :class="{
              'flex flex-row justify-between items-center': !mini,
              'animate-pulse border-2 border-dashed border-white/50 p-1':
                player.status === 'Invited',
            }"
          >
            <PlayerDisplay
              :player="player.player"
              :showOnline="false"
              :showName="!mini"
              :showFlag="!mini"
            />
            <Button
              variant="destructive"
              size="icon"
              @click="removeFromLobby(currentLobby.id, player.player.steam_id)"
              v-if="
                !mini &&
                (player.status === 'Invited' || player.status === 'Accepted') &&
                player.player.steam_id !== me?.steam_id &&
                isCaptain
              "
            >
              <XIcon class="h-4 w-4" />
            </Button>
          </div>
        </template>
      </div>
    </template>
    <template v-else>
      <MiniDisplay v-if="mini" />
      <FriendsList v-if="!mini" />
    </template>
  </div>
</template>

<script lang="ts">
import { typedGql } from "~/generated/zeus/typedDocumentNode";
import { playerFields } from "~/graphql/playerFields";
import { $ } from "~/generated/zeus";

export default {
  props: {
    mini: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      lobbies: null,
    };
  },
  apollo: {
    $subscribe: {
      lobbies: {
        query: typedGql("subscription")({
          lobbies: [
            {
              where: {
                players: {
                  steam_id: {
                    _eq: $("steam_id", "bigint!"),
                  },
                },
              },
            },
            {
              id: true,
              access: true,
              players: [
                {},
                {
                  status: true,
                  captain: true,
                  player: playerFields,
                },
              ],
            },
          ],
        }),
        variables() {
          return {
            steam_id: this.me?.steam_id,
          };
        },
        result({ data }: { data: any }) {
          this.lobbies = data.lobbies;
        },
      },
    },
  },
  computed: {
    me() {
      return useAuthStore().me;
    },
    isCaptain() {
      const me = this.currentLobby?.players.find(({ player }) => {
        return this.me.steam_id === player.steam_id;
      });
      return me?.captain;
    },
    currentLobby() {
      return this.lobbies?.find((lobby: any) => {
        return lobby.id === this.me?.current_lobby_id;
      });
    },
    invitedLobbies() {
      return this.lobbies?.filter((lobby: any) => {
        return lobby.id !== this.me?.current_lobby_id;
      });
    },
    friends() {
      return useMatchmakingStore().friends.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    },
    matchInvites() {
      return useMatchmakingStore().matchInvites;
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
    showPendingActions() {
      if (this.invitedLobbies?.length > 0) {
        return true;
      }

      if (this.matchInvites?.length > 0) {
        return true;
      }

      return this.friends?.some((friend) => {
        return (
          friend.status === "Pending" &&
          friend.invited_by_steam_id !== this.me?.steam_id
        );
      });
    },
  },
  methods: {
    async removeFromLobby(lobby_id: string, steam_id: string) {
      await this.$apollo.mutate({
        mutation: typedGql("mutation")({
          delete_lobby_players_by_pk: [
            {
              lobby_id,
              steam_id,
            },
            {
              __typename: true,
            },
          ],
        }),
      });
    },
    async joinLobby(lobby_id: string) {
      await this.$apollo.mutate({
        mutation: typedGql("mutation")({
          update_lobby_players_by_pk: [
            {
              pk_columns: {
                lobby_id,
                steam_id: this.me?.steam_id,
              },
              _set: {
                status: "Accepted",
              },
            },
            {
              __typename: true,
            },
          ],
        }),
      });
    },
    async inviteToLobby(steam_id: string) {
      await useMatchmakingStore().inviteToLobby(steam_id);
    },
  },
};
</script>
