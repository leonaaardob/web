<script setup lang="ts">
import { Switch } from "@/components/ui/switch";
import { ExternalLink } from "lucide-vue-next";
definePageMeta({
  layout: "application-settings",
});
</script>

<template>
  <form @submit.prevent="updateSettings" class="grid gap-4">
    <div
      class="flex flex-row items-center justify-between rounded-lg border p-4 cursor-pointer"
      @click="toggleCpuPinning"
    >
      <div class="space-y-0.5">
        <h4 class="text-base font-medium">
          {{ $t("pages.settings.application.servers.enable_cpu_pinning") }}
        </h4>
        <p class="text-sm text-muted-foreground">
          {{
            $t(
              "pages.settings.application.servers.enable_cpu_pinning_description",
            )
          }}
        </p>
      </div>
      <Switch
        :model-value="cpuPinningEnabled"
        @update:model-value="toggleCpuPinning"
      />
    </div>

    <FormField v-slot="{ componentField }" name="number_of_cpus_per_server">
      <FormItem>
        <FormLabel>{{
          $t("pages.settings.application.servers.number_of_cpus_per_server")
        }}</FormLabel>
        <FormDescription>{{
          $t(
            "pages.settings.application.servers.number_of_cpus_per_server_description",
          )
        }}</FormDescription>
        <Input type="number" v-bind="componentField" min="1" />
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="collection_id">
      <FormItem>
        <FormLabel class="text-lg font-semibold">{{
          $t("pages.settings.application.servers.collection")
        }}</FormLabel>
        <FormDescription>{{
          $t("pages.settings.application.servers.collection_description")
        }}</FormDescription>
        <FormControl>
          <Input v-bind="componentField" type="text" />
          <a
            v-if="collectionLink"
            :href="collectionLink"
            target="_blank"
            class="text-sm text-muted-foreground flex flex-row items-center gap-2"
          >
            View on Steam
            <ExternalLink class="w-4 h-4" />
          </a>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="flex justify-start">
      <Button
        type="submit"
        :disabled="Object.keys(form.errors).length > 0"
        class="my-3"
      >
        {{ $t("pages.settings.application.servers.update") }}
      </Button>
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
  data() {
    return {
      form: useForm({
        validationSchema: toTypedSchema(
          z.object({
            collection_id: z.string().optional(),
            number_of_cpus_per_server: z.number().min(1).default(2),
          }),
        ),
      }),
    };
  },
  watch: {
    settings: {
      immediate: true,
      handler() {
        for (const setting of this.settings) {
          if (setting.name === "number_of_cpus_per_server") {
            this.form.setFieldValue(setting.name, parseInt(setting.value));
          }
          if (setting.name === "collection_id") {
            this.form.setFieldValue(setting.name, setting.value);
          }
        }
      },
    },
  },
  methods: {
    async updateSettings() {
      console.log(this.form.values);
      await this.$apollo.mutate({
        mutation: generateMutation({
          insert_settings: [
            {
              objects: [
                {
                  name: "number_of_cpus_per_server",
                  value: this.form.values.number_of_cpus_per_server?.toString(),
                },
                {
                  name: "collection_id",
                  value: this.form.values.collection_id,
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
        title: this.$t("pages.settings.application.servers.update"),
      });
    },

    async toggleCpuPinning() {
      await this.$apollo.mutate({
        mutation: generateMutation({
          insert_settings: [
            {
              objects: [
                {
                  name: "enable_cpu_pinning",
                  value: this.cpuPinningEnabled ? "false" : "true",
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
        title: this.$t("pages.settings.application.servers.update"),
      });
    },
  },
  computed: {
    settings() {
      return useApplicationSettingsStore().settings;
    },
    collectionLink() {
      const collectionId = this.settings.find((setting) => {
        return setting.name === "collection_id";
      })?.value;

      if (!collectionId) {
        return;
      }
      return `https://steamcommunity.com/sharedfiles/filedetails/?id=${collectionId}`;
    },
    cpuPinningEnabled() {
      return (
        this.settings.find((setting) => {
          return setting.name === "enable_cpu_pinning";
        })?.value === "true"
      );
    },
  },
};
</script>
