<script setup lang="ts">
definePageMeta({
  layout: "application-settings",
});
</script>

<template>
  <form @submit.prevent="updateSettings" class="grid gap-4">
    <FormField v-slot="{ componentField }" name="s3_min_retention">
      <FormItem>
        <FormLabel>{{
          $t("pages.settings.application.s3.min_retention")
        }}</FormLabel>
        <FormDescription>{{
          $t("pages.settings.application.s3.min_retention_description")
        }}</FormDescription>
        <Input type="number" v-bind="componentField"></Input>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="s3_max_storage">
      <FormItem>
        <FormLabel>{{
          $t("pages.settings.application.s3.max_storage")
        }}</FormLabel>
        <FormDescription>{{
          $t("pages.settings.application.s3.max_storage_description")
        }}</FormDescription>
        <Input type="number" v-bind="componentField"></Input>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="cloudflare_worker_url">
      <FormItem>
        <FormLabel>{{
          $t("pages.settings.application.s3.cloudflare_worker_url")
        }}</FormLabel>
        <FormDescription>
          {{
            $t(
              "pages.settings.application.s3.cloudflare_worker_url_description",
            )
          }}
          <a
            href="https://docs.5stack.gg/s3/backblaze"
            target="_blank"
            class="text-primary hover:underline"
          >
            https://docs.5stack.gg/s3/backblaze
          </a>
        </FormDescription>
        <Input v-bind="componentField"></Input>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="flex justify-start">
      <Button
        type="submit"
        :disabled="Object.keys(form.errors).length > 0"
        class="my-3"
      >
        {{ $t("pages.settings.application.s3.update") }}
      </Button>
    </div>
  </form>
</template>

<script lang="ts">
import { settings_constraint, settings_update_column } from "~/generated/zeus";
import { typedGql } from "~/generated/zeus/typedDocumentNode";
import { generateMutation } from "~/graphql/graphqlGen";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { toast } from "@/components/ui/toast";

export default {
  data() {
    return {
      settings: [],
      form: useForm({
        validationSchema: toTypedSchema(
          z.object({
            s3_min_retention: z.number().int().min(1).optional().default(1),
            s3_max_storage: z.number().int().min(1).default(10),
            cloudflare_worker_url: z.string().url().optional(),
          }),
        ),
      }),
    };
  },
  apollo: {
    $subscribe: {
      servers: {
        query: typedGql("subscription")({
          settings: [
            {},
            {
              name: true,
              value: true,
            },
          ],
        }),
        result({ data }) {
          this.settings = data.settings;
          for (const setting of data.settings) {
            if (
              setting.name === "s3_min_retention" ||
              setting.name === "s3_max_storage"
            ) {
              this.form.setFieldValue(setting.name, parseInt(setting.value));
            } else {
              this.form.setFieldValue(setting.name, setting.value);
            }
          }
        },
      },
    },
  },
  methods: {
    async updateSettings() {
      await this.$apollo.mutate({
        mutation: generateMutation({
          insert_settings: [
            {
              objects: [
                {
                  name: "s3_min_retention",
                  value: this.form.values.s3_min_retention?.toString(),
                },
                {
                  name: "s3_max_storage",
                  value: this.form.values.s3_max_storage?.toString(),
                },
                {
                  name: "cloudflare_worker_url",
                  value: this.form.values.cloudflare_worker_url,
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
        title: "Updated S3 Settings",
      });
    },
  },
};
</script>
