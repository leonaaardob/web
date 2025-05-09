<script setup lang="ts">
import { Info } from "lucide-vue-next";
import PageHeading from "~/components/PageHeading.vue";
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Search } from "lucide-vue-next";
import MapForm from "~/components/map-pools/MapForm.vue";
import MapPoolRow from "~/components/map-pools/MapPoolRow.vue";
import FiveStackToolTip from "~/components/FiveStackToolTip.vue";
</script>

<template>
  <div class="flex-grow flex flex-col gap-4">
    <PageHeading>
      <template #title>{{ $t("pages.map_pools.title") }}</template>

      <template #description>
        {{ $t("pages.map_pools.description") }}
      </template>

      <template #actions>
        <div class="flex flex-row items-center gap-4">
          <div class="flex flex-row items-center gap-2">
            <FiveStackToolTip>
              <template #trigger>
                <div
                  class="flex items-center gap-2"
                  @click="toggleUpdateMapPools"
                >
                  <div class="flex items-center gap-1">
                    <Info :size="14" />
                    {{
                      $t("pages.settings.application.update_map_pools.title")
                    }}
                  </div>
                  <Switch
                    :model-value="updateMapPools"
                    @update:model-value="toggleUpdateMapPools"
                  />
                </div>
              </template>
              {{
                $t("pages.settings.application.update_map_pools.description")
              }}
            </FiveStackToolTip>
          </div>
          <Button @click="mapFormSheet = true">
            {{ $t("pages.map_pools.add_new_map") }}
          </Button>
        </div>
      </template>
    </PageHeading>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="pool in map_pools"
        :key="pool.id"
        class="relative p-4 bg-background rounded-lg shadow-md"
      >
        <h2 class="text-lg font-semibold">{{ pool.type }} Pool</h2>
        {{ pool.maps.map((map) => map.name).join(", ") }}
        <NuxtLink
          :to="{ name: 'map-pools-id', params: { id: pool.id } }"
          class="absolute top-4 right-4 text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded shadow"
        >
          {{ $t("pages.map_pools.edit") }}
        </NuxtLink>
      </div>
    </div>

    <Separator />

    <div
      v-if="missingMaps.length > 0"
      class="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-yellow-800"
    >
      <p class="font-medium">
        {{ $t("pages.map_pools.missing_from_collection_description") }}
      </p>
      <ul class="list-disc list-inside">
        <li v-for="mapId in missingMaps" :key="mapId">{{ mapId }}</li>
      </ul>
    </div>

    <Separator />

    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">
        {{ $t("pages.map_pools.maps") }}
      </h2>
      <div class="relative w-full max-w-sm">
        <Input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('pages.map_pools.search')"
          class="pl-10"
        />
        <Search
          class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5"
        />
      </div>
    </div>
    <table class="min-w-full bg-background rounded-lg shadow-md">
      <thead>
        <tr>
          <th class="px-4 py-2 text-left text-sm font-medium"></th>
          <th class="px-4 py-2 text-left text-sm font-medium">
            {{ $t("pages.map_pools.active_duty") }}
          </th>
          <th class="px-4 py-2 text-left text-sm font-medium">
            {{ $t("pages.map_pools.available_modes") }}
          </th>
          <th class="px-4 py-2 text-left text-sm font-medium">
            {{ $t("pages.map_pools.workshop_id") }}
          </th>
          <th class="px-4 py-2 text-left text-sm font-medium"></th>
        </tr>
      </thead>
      <tbody>
        <MapPoolRow
          v-for="map in availableMaps"
          :key="map.id"
          :map="map"
          :match-types="matchTypes"
          :is-in-collection="workshopMapIds.includes(map.workshop_map_id)"
        />
      </tbody>
    </table>
  </div>

  <Sheet :open="mapFormSheet" @update:open="(open) => (mapFormSheet = open)">
    <SheetContent>
      <SheetHeader>
        <SheetTitle>{{ $t("pages.dedicated_servers.detail.edit") }}</SheetTitle>
        <SheetDescription>
          <MapForm @created="mapFormSheet = false" />
        </SheetDescription>
      </SheetHeader>
    </SheetContent>
  </Sheet>
</template>

<script lang="ts">
import { generateQuery, generateSubscription } from "~/graphql/graphqlGen";
import { e_map_pool_types_enum, e_match_types_enum } from "~/generated/zeus";
import { mapFields } from "~/graphql/mapGraphql";
import { settings_constraint, settings_update_column } from "~/generated/zeus";
import { generateMutation } from "~/graphql/graphqlGen";

interface Map {
  id: string;
  name: string;
  type: string;
  patch?: string;
  poster?: string;
  active_pool: boolean;
  workshop_map_id?: string;
  poolTypes: string[];
  enabled: boolean;
}

interface MapPool {
  id: string;
  type: string;
  maps: {
    id: string;
    name: string;
    type: string;
    patch?: string;
    poster?: string;
    active_pool: boolean;
    workshop_map_id?: string;
  }[];
}

export default {
  data() {
    return {
      mapFormSheet: false,
      map_pools: [] as MapPool[],
      maps: [] as Map[],
      searchQuery: "",
      matchTypes: [
        e_match_types_enum.Competitive,
        e_match_types_enum.Wingman,
        e_match_types_enum.Duel,
      ],
      workshopMapIds: [] as string[],
    };
  },
  apollo: {
    $subscribe: {
      maps: {
        query: generateSubscription({
          maps: [
            {},
            {
              ...mapFields,
              enabled: true,
            },
          ],
        }),
        result: function ({ data }) {
          this.maps = data.maps;
        },
      },
    },
    map_pools: {
      query: generateQuery({
        map_pools: [
          {
            where: {
              type: {
                _neq: e_map_pool_types_enum.Custom,
              },
            },
          },
          {
            id: true,
            type: true,
            maps: [{}, mapFields],
          },
        ],
      }),
    },
  },
  methods: {
    async toggleUpdateMapPools() {
      await this.$apollo.mutate({
        mutation: generateMutation({
          insert_settings_one: [
            {
              object: {
                name: "update_map_pools",
                value: this.updateMapPools ? "false" : "true",
              },
              on_conflict: {
                constraint: settings_constraint.settings_pkey,
                update_columns: [settings_update_column.value],
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
  watch: {
    collectionId: {
      immediate: true,
      async handler() {
        if (!this.collectionId) {
          return;
        }

        const response = await fetch(
          `/api/get-workshop-map-collection?collection_id=${this.collectionId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        this.workshopMapIds = await response.json();
      },
    },
  },
  computed: {
    missingMaps() {
      if (this.workshopMapIds.length === 0 || this.maps.length === 0) {
        return [];
      }

      return this.workshopMapIds.filter((id) => {
        return !this.maps?.some(function (map) {
          return map.workshop_map_id === id;
        });
      });
    },
    availableMaps(): Map[] {
      const uniqueMapsMap = new Map<string, Map>();

      for (const map of this.maps) {
        if (!uniqueMapsMap.has(map.name)) {
          uniqueMapsMap.set(map.name, {
            ...map,
            poolTypes: [],
          });
        }

        if (map.enabled) {
          uniqueMapsMap.get(map.name)?.poolTypes.push(map.type);
        }
      }

      return Array.from(uniqueMapsMap.values())
        .sort((a, b) => {
          return a.name.localeCompare(b.name);
        })
        .sort((a, b) => {
          return a.name
            .replace("de_", "")
            .localeCompare(b.name.replace("de_", ""));
        })
        .filter((map) => {
          if (!this.searchQuery) {
            return true;
          }
          return map.name
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase());
        });
    },
    settings() {
      return useApplicationSettingsStore().settings;
    },
    collectionId() {
      return this.settings.find((setting) => setting.name === "collection_id")
        ?.value;
    },
    updateMapPools() {
      const updateMapPoolsSetting = this.settings.find(
        (setting) => setting.name === "update_map_pools",
      );

      if (updateMapPoolsSetting) {
        return updateMapPoolsSetting.value === "true";
      }

      return true;
    },
  },
};
</script>
