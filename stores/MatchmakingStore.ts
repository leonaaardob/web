import { ref, watch, computed } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";
import { e_match_types_enum, $, e_lobby_access_enum } from "~/generated/zeus";
import getGraphqlClient from "~/graphql/getGraphqlClient";
import { generateQuery, generateSubscription } from "~/graphql/graphqlGen";
import { playerFields } from "~/graphql/playerFields";
import { typedGql } from "~/generated/zeus/typedDocumentNode";
import { webrtc } from "~/web-sockets/Webrtc";

const REGION_LATENCY_PREFIX = "5stack_region_latency_";
const MAX_PING_KEY = "5stack_max_acceptable_ping";
const PREFERRED_REGIONS_KEY = "5stack_preferred_regions";

export const useMatchmakingStore = defineStore("matchmaking", () => {
  const playersOnline = ref([]);
  const onlinePlayerSteamIds = ref<string[]>([]);

  const joinedMatchmakingQueues = ref<{
    details?: {
      totalInQueue: number;
      type: e_match_types_enum;
      regions: Array<string>;
    };
    confirmation?: {
      matchId: string;
      isReady: boolean;
      expiresAt: string;
      confirmed: number;
      confirmationId: string;
      type: e_match_types_enum;
      region: string;
    };
  }>({
    details: undefined,
    confirmation: undefined,
  });

  const regionStats = ref<
    Partial<Record<string, Partial<Record<e_match_types_enum, number>>>>
  >({});

  const queryPlayers = async () => {
    const steamIds = onlinePlayerSteamIds.value;
    if (steamIds.length === 0) {
      return;
    }
    const { data } = await getGraphqlClient().query({
      query: generateQuery({
        players: [
          {
            where: {
              steam_id: {
                _in: $("steam_ids", "[bigint]!"),
              },
            },
          },
          playerFields,
        ],
      }),
      variables: {
        steam_ids: steamIds,
      },
    });

    playersOnline.value = data.players;
  };

  const friends = ref([]);
  const subscribeToFriends = async (mySteamId: bigint) => {
    const subscription = getGraphqlClient().subscribe({
      query: generateSubscription({
        my_friends: [
          {},
          {
            elo: true,
            name: true,
            role: true,
            country: true,
            steam_id: true,
            avatar_url: true,
            status: true,
            invited_by_steam_id: true,
            player: {
              lobby_players: [
                {
                  limit: 1,
                  where: {
                    lobby: {
                      _not: {
                        players: {
                          steam_id: {
                            _eq: $("mySteamId", "bigint!"),
                          },
                        },
                      },
                      access: {
                        _in: [
                          e_lobby_access_enum.Friends,
                          e_lobby_access_enum.Open,
                        ],
                      },
                    },
                  },
                },
                {
                  lobby_id: true,
                  lobby: {
                    id: true,
                    players: [
                      {},
                      {
                        player: {
                          name: true,
                          country: true,
                          steam_id: true,
                          avatar_url: true,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      }),
      variables: {
        mySteamId,
      },
    });

    subscription.subscribe({
      next: ({ data }) => {
        friends.value = data.my_friends;
      },
    });
  };

  watch(
    () => useAuthStore().me,
    (me) => {
      if (me) {
        subscribeToFriends(me.steam_id);
      }
    },
    { immediate: true },
  );

  watch(onlinePlayerSteamIds, (newSteamIds, oldSteamIds) => {
    if (
      newSteamIds.length !== oldSteamIds.length ||
      !newSteamIds.every((id, index) => id === oldSteamIds[index])
    ) {
      queryPlayers();
    }
  });

  const inviteToLobby = async (steam_id: string) => {
    const me = useAuthStore().me;

    let lobby_id = me?.current_lobby_id;

    if (!lobby_id) {
      const { data } = await getGraphqlClient().mutate({
        mutation: typedGql("mutation")({
          insert_lobbies_one: [
            {
              object: {},
            },
            {
              id: true,
            },
          ],
        }),
      });
      lobby_id = data.insert_lobbies_one.id;
    }

    await getGraphqlClient().mutate({
      mutation: typedGql("mutation")({
        insert_lobby_players_one: [
          {
            object: {
              steam_id,
              lobby_id,
            },
          },
          {
            __typename: true,
          },
        ],
      }),
    });
  };

  const savedRegions = localStorage.getItem(PREFERRED_REGIONS_KEY);
  const preferredRegions = ref<string[]>(
    savedRegions ? JSON.parse(savedRegions) : [],
  );

  const latencies = ref(new Map<string, number[]>());

  // Load existing latencies from localStorage for each region
  useApplicationSettingsStore().availableRegions.forEach((region) => {
    const savedLatency = localStorage.getItem(
      REGION_LATENCY_PREFIX + region.value,
    );
    if (savedLatency) {
      latencies.value.set(region.value, JSON.parse(savedLatency));
    }
  });

  const savedMaxPing = localStorage.getItem(MAX_PING_KEY);
  const maxAcceptablePing = ref(savedMaxPing ? parseInt(savedMaxPing) : 75);

  const isRefreshing = ref(false);
  async function refreshLatencies() {
    isRefreshing.value = true;
    resetLatencies();
    await Promise.all(
      useApplicationSettingsStore().availableRegions.map((region) =>
        getLatency(region.value),
      ),
    );
    isRefreshing.value = false;
  }

  function checkLatenies() {
    if (latencies.value.size === 0) {
      refreshLatencies();
    }
  }

  async function getLatency(region: string) {
    try {
      const latencyArray: number[] = [];
      let pingCount = 0;
      const totalPings = 4;
      let startTime: number;

      const datachannel = await webrtc.connect(region, () => {
        const endTime = performance.now();
        const latency = endTime - startTime;
        latencyArray.push(latency);

        if (latencyArray.length === totalPings) {
          latencies.value.set(region, latencyArray);
          localStorage.setItem(
            REGION_LATENCY_PREFIX + region,
            JSON.stringify(latencyArray),
          );
          datachannel.close();
          return;
        }

        startTime = performance.now();
        datachannel.send("");
        pingCount++;
      });

      startTime = performance.now();
      datachannel.send("");
      pingCount++;
    } catch (error) {
      console.error(`Failed to get latency for ${region}`, error);
    }
  }

  function togglePreferredRegion(region: string) {
    const index = preferredRegions.value.indexOf(region);
    if (index !== -1) {
      preferredRegions.value.splice(index, 1);
    } else {
      preferredRegions.value.push(region);
    }
    localStorage.setItem(
      PREFERRED_REGIONS_KEY,
      JSON.stringify(preferredRegions.value.filter(Boolean)),
    );
  }

  function updateMaxAcceptablePing(ping: number) {
    maxAcceptablePing.value = ping;
    localStorage.setItem(MAX_PING_KEY, ping.toString());
  }

  function resetLatencies() {
    latencies.value.clear();
    useApplicationSettingsStore().availableRegions.forEach((region) => {
      localStorage.removeItem(REGION_LATENCY_PREFIX + region.value);
    });
  }

  function getAverageLatency(region: string): string {
    const regionLatencies = latencies.value.get(region);
    if (!regionLatencies || regionLatencies.length === 0) {
      return "Measuring...";
    }
    const avg =
      regionLatencies.reduce((a: number, b: number) => a + b, 0) /
      regionLatencies.length;
    return avg.toFixed(0);
  }

  const preferredRegionsComputed = computed(() => {
    const availableRegions = useApplicationSettingsStore().availableRegions;

    if (isRefreshing.value) {
      return availableRegions;
    }

    if (preferredRegions.value.length > 0) {
      return availableRegions.filter((region) =>
        preferredRegions.value.includes(region.value),
      );
    }

    const filteredRegions = availableRegions.filter((region) => {
      const avgLatency = Number(getAverageLatency(region.value));
      return !isNaN(avgLatency) && avgLatency <= maxAcceptablePing.value;
    });

    if (filteredRegions.length === 0) {
      return availableRegions;
    }

    return filteredRegions;
  });

  return {
    friends,
    regionStats,
    playersOnline,
    onlinePlayerSteamIds,
    joinedMatchmakingQueues,

    checkLatenies,
    refreshLatencies,
    getAverageLatency,
    togglePreferredRegion,
    updateMaxAcceptablePing,

    latencies,
    preferredRegions: preferredRegionsComputed,
    maxAcceptablePing,

    inviteToLobby,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMatchmakingStore, import.meta.hot));
}
