<script setup lang="ts">
import PageHeading from "~/components/PageHeading.vue";
import { PlusCircle } from "lucide-vue-next";
import MatchesTable from "~/components/MatchesTable.vue";
import Pagination from "~/components/Pagination.vue";
</script>

<template>
  <PageHeading>
    <template #title>{{ $t("pages.manage_matches.title") }}</template>
    <template #description>{{
      $t("pages.manage_matches.description")
    }}</template>
    <template #actions>
      <Button size="lg" @click="navigateTo('/matches/create')">
        <PlusCircle class="w-4 h-4" />
        <span class="hidden md:inline ml-2">{{
          $t("pages.matches.create")
        }}</span>
      </Button>
    </template>
  </PageHeading>

  <Separator class="my-4" />

  <div
    class="flex items-center space-x-2 mb-4 justify-end cursor-pointer"
    @click="showOnlyMyMatches = !showOnlyMyMatches"
  >
    <Switch :model-value="showOnlyMyMatches" />
    <Label class="text-sm">
      {{ $t("pages.manage_matches.only_my_matches") }}
    </Label>
  </div>

  <Card class="p-4">
    <matches-table
      class="p-3"
      :matches="matches"
      v-if="matches"
    ></matches-table>
  </Card>

  <Pagination
    :page="page"
    :per-page="perPage"
    @page="
      (_page) => {
        page = _page;
      }
    "
    :total="matchesAggregate"
    v-if="matchesAggregate"
  ></Pagination>
</template>

<script lang="ts">
import { typedGql } from "~/generated/zeus/typedDocumentNode";
import { simpleMatchFields } from "~/graphql/simpleMatchFields";
import { $, e_match_status_enum, order_by } from "~/generated/zeus";

interface MatchesData {
  matches: any[];
}

interface ComponentData {
  page: number;
  perPage: number;
  matches: any[];
  showOnlyMyMatches: boolean;
}

export default {
  data(): ComponentData {
    return {
      page: 1,
      perPage: 10,
      matches: [] as any[],
      showOnlyMyMatches: false,
    };
  },
  apollo: {
    $subscribe: {
      matches: {
        query: typedGql("subscription")({
          matches: [
            {
              limit: $("limit", "Int!"),
              offset: $("offset", "Int!"),
              order_by: [
                {},
                {
                  created_at: $("order_by", "order_by"),
                },
              ],
              where: $("where_clause", "matches_bool_exp!"),
            },
            simpleMatchFields,
          ],
        }),
        variables(this: any): {
          limit: number;
          order_by: order_by;
          offset: number;
          where_clause: any;
        } {
          const baseWhere = {
            status: {
              _in: [
                e_match_status_enum.Live,
                e_match_status_enum.Veto,
                e_match_status_enum.WaitingForCheckIn,
                e_match_status_enum.WaitingForServer,
                e_match_status_enum.Scheduled,
                e_match_status_enum.PickingPlayers,
              ],
            },
          };

          return {
            limit: this.perPage,
            order_by: order_by.desc,
            offset: (this.page - 1) * this.perPage,
            where_clause: this.showOnlyMyMatches
              ? {
                  ...baseWhere,
                  organizer_steam_id: {
                    _eq: useAuthStore().me?.steam_id,
                  },
                }
              : baseWhere,
          };
        },
        result({ data }: { data: MatchesData }) {
          (this as any).matches = data.matches;
        },
      },
    },
  },
  computed: {
    matchesAggregate() {
      return useMatchLobbyStore().managingMatchesCount;
    },
  },
};
</script>
