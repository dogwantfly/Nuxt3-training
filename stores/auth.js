import { defineStore } from 'pinia';
const { $axios, $showToast } = useNuxtApp();

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    setToken(token) {
      this.token = token;
      const tokenCookie = useCookie('auth_token',{
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      tokenCookie.value = token; // 存入 Cookie
    },
    clearToken() {
      this.token = null;
      const tokenCookie = useCookie('auth_token');
      tokenCookie.value = null; // 清除 Cookie
    },
    async getUser() {
      try {
        const { $axios } = useNuxtApp();
        const response = await $axios.get('/api/v1/user');
        this.user = response.data.result;
      } catch (error) {
        const { $showToast } = useNuxtApp();
        $showToast('取得使用者資料失敗', { variant: 'danger' });
        throw error;
      }
    },
    async login(data) {
      try {
        const { email, password } = data;
        const { $axios } = useNuxtApp();
        const response = await $axios.post('/api/v1/user/login', {
          email,
          password,
        });
        const token = response.data.token;
        this.setToken(token);
        navigateTo('/');
      } catch (error) {
        const { $showToast } = useNuxtApp();
        $showToast('登入失敗', { variant: 'danger' });
        throw error;
      }
    },
    async register(data, resetForm) {
      try {
        const { $axios } = useNuxtApp();
        const {  name, email ,password ,phone ,birthday ,address } = data;
        const format_birthday = `${birthday.year}/${birthday.month}/${birthday.day}`;
        const response = await $axios.post('/api/v1/user/signup', {
          name,
          email,
          password,
          phone,
          birthday: format_birthday,
          address
        });
        if (response && response.status) {
          this.setToken(response.data.token);
          if (resetForm) resetForm();
          navigateTo('/account/login');
        }
      } catch (error) {
        const { $showToast } = useNuxtApp();
        $showToast('註冊失敗', { variant: 'danger' });
        throw error;
      }
    },
    async checkToken() {
      try{
        const { $axios } = useNuxtApp();
        const response = await $axios.get('/api/v1/user/check');
        if (response.status) {
          this.setToken(response.data.token);
        } 
      } catch (error) {
        const { $showToast } = useNuxtApp();
        $showToast('檢查 Token 失敗', { variant: 'danger' });
        throw error;
      }
    },
    initialize() {
      const tokenCookie = useCookie('auth_token');
      if (tokenCookie.value) {
        this.token = tokenCookie.value;
        this.getUser();
      }
    },
    logout() {
      this.clearToken();
      this.user = null;
      navigateTo('/account/login');
    },
  },
});
