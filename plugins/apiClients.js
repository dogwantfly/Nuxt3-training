import { defineNuxtPlugin, useRuntimeConfig } from '#app';


export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const apiClient = {
    get: (endpoint) => $fetch(endpoint, { baseURL: config.public.apiBase }),
    getWithAuth: (endpoint) => $fetch(endpoint, { baseURL: config.public.apiBase, headers: { 'Authorization': `Bearer ${useCookie('auth_token').value}` } }),
    post: (endpoint, data) => $fetch(endpoint, { baseURL: config.public.apiBase, method: 'POST', body: data, headers: { 'Authorization': `Bearer ${useCookie('auth_token').value}` } }),
  };

  nuxtApp.provide('apiClient', apiClient);
});
