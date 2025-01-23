<script setup>
import { useAuthStore } from '~/stores/auth';
useHead({
  title: '管理後台',
})

const authStore = useAuthStore();
authStore.getUser();
</script>

<template>
  <div>
    <AppHeader />
    <main class="pt-18 pt-md-30 bg-neutral-120">
        <NuxtPage />
    </main>
    <AppFooter />
  </div>
</template>

<style lang="scss" scoped>
@import 'bootstrap/scss/mixins/breakpoints';

$grid-breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px,
  xxxl: 1537px,
);

</style>
