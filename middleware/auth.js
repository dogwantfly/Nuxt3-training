export default defineNuxtRouteMiddleware((to, from) => {
  const tokenCookie = useCookie('auth_token');
  if (!tokenCookie.value && to.path !== '/login') {
    return navigateTo('/login');
  }
  // authStore.checkToken();
});
