<script setup lang="ts">
import { Switch } from "@/components/ui/switch";
definePageMeta({
  layout: "application-settings",
});
</script>

<template>
  <form @submit.prevent class="grid gap-4">
    <div
      class="flex flex-row items-center justify-between rounded-lg border p-4 cursor-pointer"
      @click="toggleTelemetry"
    >
      <div class="space-y-0.5">
        <h4 class="text-base font-medium">
          {{ $t("pages.settings.application.telemetry.telemetry") }}
        </h4>
        <p class="text-sm text-muted-foreground">
          {{ $t("pages.settings.application.telemetry.telemetry_description") }}
        </p>
      </div>
      <Switch
        :model-value="telemetryEnabled"
        @update:model-value="toggleTelemetry"
      />
    </div>
  </form>
</template>

<script lang="ts">
import { toast } from "@/components/ui/toast";
import { generateMutation } from "~/graphql/graphqlGen";
import { settings_constraint, settings_update_column } from "~/generated/zeus";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

export default {
  methods: {
    async toggleTelemetry() {
      await this.$apollo.mutate({
        mutation: generateMutation({
          insert_settings: [
            {
              objects: [
                {
                  name: "telemetry",
                  value: this.telemetryEnabled ? "false" : "true",
                },
              ],
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

      toast({
        title: this.$t("pages.settings.application.telemetry.update"),
      });
    },
  },
  computed: {
    settings() {
      return useApplicationSettingsStore().settings;
    },
    telemetryEnabled() {
      return (
        this.settings.find((setting) => {
          return setting.name === "telemetry";
        })?.value !== "false"
      );
    },
  },
};
</script>
