<script setup>
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
authStore.initialize();
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <!-- <NuxtWelcome /> -->
    <AppHeader />
    <NuxtPage />
  </div>
</template>
