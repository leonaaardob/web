<script setup lang="ts">
import { Check, ChevronsUpDown, Languages } from "lucide-vue-next";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

definePageMeta({
  layout: "profile-settings",
});
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">
      {{ $t("pages.settings.language.title") }}
    </h3>
    <p class="text-sm text-muted-foreground">
      {{ $t("pages.settings.language.description") }}
    </p>
  </div>
  <Separator />

  <div class="grid gap-4"></div>
</template>
