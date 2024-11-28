// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['nuxt-swiper'],
  plugins: ['~/plugins/axios.js'],
  compatibilityDate: '2024-11-27',
  css: [
    '@/assets/style/all.scss', 
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "bootstrap/scss/functions";
            @import "@/assets/style/_variables.scss";
            @import "@/assets/style/_variables-dark.scss";
            @import "bootstrap/scss/variables";
            @import "bootstrap/scss/variables-dark";
          `,
          quietDeps: true,
          api: 'modern-compiler'
        },
      },
    },
  },
  swiper: {
    prefix: 'Swiper', 
    styleLang: 'css', 
    modules: ['autoplay', 'navigation', 'pagination'],
  },
});
