import { Modal, Toast } from 'bootstrap';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('bootstrap', {
    Modal: (element, options) => new Modal(element, options),
    Toast: (message, options) => new Toast(message, options),
  });
});
