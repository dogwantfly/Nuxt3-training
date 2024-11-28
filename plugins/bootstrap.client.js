import { Modal } from 'bootstrap';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('bootstrap', {
    Modal: (element, options) => new Modal(element, options),
  });
});
