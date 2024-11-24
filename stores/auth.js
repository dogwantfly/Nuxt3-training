import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    setToken(token) {
      this.token = token;
      const tokenCookie = useCookie('auth_token');
      tokenCookie.value = token; // 存入 Cookie
    },
    clearToken() {
      this.token = null;
      const tokenCookie = useCookie('auth_token');
      tokenCookie.value = null; // 清除 Cookie
    },
    async login(email, password) {
      try {
        const { $axios } = useNuxtApp();
        const response = await $axios.post('/api/v1/user/login', {
          email,
          password,
        });
        const token = response.data.token;
        this.setToken(token);
      } catch (error) {
        console.error('登入失敗', error);
        throw error;
      }
    },
    initialize() {
      const tokenCookie = useCookie('auth_token');
      if (tokenCookie.value) {
        this.token = tokenCookie.value;
      }
    },
    logout() {
      this.clearToken();
    },
  },
});
