import { defineNuxtPlugin, useRuntimeConfig } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const apiClient = {
    get: (endpoint) => $fetch(endpoint, { baseURL: config.public.apiBase }),
  };

  nuxtApp.provide('apiClient', apiClient);
});
