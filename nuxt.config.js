// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  plugins: ['~/plugins/axios.js'],
  compatibilityDate: '2024-11-27',
  css: ['bootstrap/scss/bootstrap.scss'],
});
