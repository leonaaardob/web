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

const { locale, locales, setLocale } = useI18n();
const availableLocales = computed(() => {
  return locales.value.filter((i) => i.code !== locale.value);
});

const currentLocale = computed(() => {
  return locales.value.find((i) => i.code === locale.value);
});

const handleLocaleChange = (newLocale: string) => {
  setLocale(newLocale as "en" | "sv");
};

const isLanguagePopoverOpen = ref(false);

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

  <div class="grid gap-4">
    <div class="space-y-2">
      <label
        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {{ $t("pages.settings.language.select") }}
      </label>
      <Popover v-model:open="isLanguagePopoverOpen">
        <PopoverTrigger as-child>
          <Button
            variant="outline"
            role="combobox"
            class="w-full justify-between"
          >
            <div class="flex items-center gap-2">
              <Languages class="size-4" />
              <span>
                {{ currentLocale?.flag }}
              </span>
              <span>
                {{ currentLocale?.name }}
              </span>
            </div>
            <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-full p-0">
          <Command>
            <CommandInput :placeholder="$t('pages.settings.language.search')" />
            <CommandList>
              <CommandGroup>
                <CommandItem
                  v-for="loc in availableLocales"
                  :key="loc.code"
                  :value="loc.code"
                  @select="
                    () => {
                      handleLocaleChange(loc.code);
                      isLanguagePopoverOpen = false;
                    }
                  "
                >
                  <div class="flex items-center gap-2">
                    <span>{{ loc.flag }}</span>
                    <span>{{ loc.name }}</span>
                  </div>
                  <Check
                    :class="[
                      'ml-auto h-4 w-4 flex-shrink-0',
                      locale === loc.code ? 'opacity-100' : 'opacity-0',
                    ]"
                  />
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  </div>
</template>
