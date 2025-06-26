<script setup lang="ts">
import PublicFooter from "~/layouts/components/PublicFooter.vue";
import PublicHeader from "~/layouts/components/PublicHeader.vue";
import AlertsContainer from "~/layouts/components/AlertsContainer.vue";
</script>

<template>
  <AlertsContainer></AlertsContainer>
  <public-header></public-header>
  <slot></slot>
  <public-footer />
</template>

<script lang="ts">
export default {};
</script>
