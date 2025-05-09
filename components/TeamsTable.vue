<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>{{ $t("team.table.team") }}</TableHead>
        <TableHead>{{ $t("team.table.wins") }}</TableHead>
        <TableHead>{{ $t("team.table.losses") }}</TableHead>
        <TableHead>{{ $t("team.table.overtime_losses") }}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <template v-if="teams.length === 0">
        <TableRow>
          <TableCell colspan="4" class="text-center py-8">
            <div class="text-gray-500 dark:text-gray-400">
              <p>
                <slot name="none-found">{{
                  $t("team.table.no_teams_found")
                }}</slot>
              </p>
            </div>
          </TableCell>
        </TableRow>
      </template>
      <template v-else>
        <TableRow class="cursor-pointer" v-for="team in teams" :key="team.id">
          <NuxtLink
            :to="{ name: 'teams-id', params: { id: team.id } }"
            class="contents"
          >
            <TableCell class="font-medium">
              {{ team.name }}
            </TableCell>
            <TableCell>{{ team.wins }}</TableCell>
            <TableCell>{{ team.losses }}</TableCell>
            <TableCell>{{ team.overtimeLosses }}</TableCell>
          </NuxtLink>
        </TableRow>
      </template>
    </TableBody>
  </Table>
</template>

<script lang="ts">
export default {
  props: {
    teams: {
      required: true,
      type: Object,
    },
  },
};
</script>
