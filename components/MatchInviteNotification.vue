<script lang="ts" setup>
import TimeAgo from "./TimeAgo.vue";
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold mb-2">
      {{ $t("notifications.match.title") }}
    </h3>

    {{ $t("notifications.match.description", { match: invite.match_id }) }}

    <div class="flex justify-between space-x-2 mt-3">
      <p class="text-sm text-muted-foreground mb-2">
        {{ $t("notifications.match.invited_by") }}
        {{ invite.invited_by.name }}
        <TimeAgo :date="invite.created_at" class="text-xs" />
      </p>

      <div class="flex gap-2">
        <Button variant="outline" @click="denyInvite(invite.id)">{{
          $t("notifications.invite.deny")
        }}</Button>
        <Button variant="default" @click="acceptInvite(invite.id)">{{
          $t("notifications.invite.accept")
        }}</Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { generateMutation } from "~/graphql/graphqlGen";

export default {
  props: {
    invite: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  methods: {
    async acceptInvite(inviteId: string) {
      await this.$apollo.mutate({
        mutation: generateMutation({
          acceptInvite: [
            {
              type: this.type,
              invite_id: inviteId,
            },
            {
              success: true,
            },
          ],
        }),
      });

      this.$router.push(`/matches/${this.invite.match_id}`);
    },
    async denyInvite(inviteId: string) {
      await this.$apollo.mutate({
        mutation: generateMutation({
          denyInvite: [
            {
              type: this.type,
              invite_id: inviteId,
            },
            {
              success: true,
            },
          ],
        }),
      });
    },
  },
};
</script>
