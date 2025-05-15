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
      <div class="flex gap-4 items-center">
        <Button size="lg" @click="navigateTo('/matches/create')">
          <PlusCircle class="w-4 h-4" />
          <span class="hidden md:inline ml-2">{{
            $t("pages.matches.create")
          }}</span>
        </Button>
      </div>
    </template>
  </PageHeading>

  <Separator class="my-4" />

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

export default {
  data() {
    return {
      page: 1,
      perPage: 10,
      matches: [],
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
              where: {
                organizer_steam_id: {
                  _eq: $("steam_id", "bigint!"),
                },
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
              },
            },
            simpleMatchFields,
          ],
        }),
        variables: function () {
          return {
            limit: this.perPage,
            order_by: order_by.desc,
            offset: (this.page - 1) * this.perPage,
            steam_id: useAuthStore().me?.steam_id,
          };
        },
        result: function ({ data }) {
          this.matches = data.matches;
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
