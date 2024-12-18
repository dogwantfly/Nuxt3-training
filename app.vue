<script setup>
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
authStore.initialize();
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - 享樂酒店` : '享樂酒店';
  }
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <!-- <NuxtWelcome /> -->

    <NuxtLayout />
  </div>
</template>
