import { defineStore } from 'pinia';
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://nuxt3-hotel-freyja.onrender.com',
});

instance.interceptors.request.use((config) => {
  const token = useCookie('auth_token').value;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useCookie('auth_token').value = null;
      navigateTo('/login');
    }
    return Promise.reject(error);
  }
);

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
      const tokenCookie = useCookie('auth_token', {
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
        const response = await instance.get('/api/v1/user');
        this.user = response.data.result;
      } catch (error) {
        return `取得使用者資料失敗 ${error}`;
      }
    },
    async login(data) {
      try {
        const { email, password } = data;
        const response = await instance.post('/api/v1/user/login', {
          email,
          password,
        });
        const token = response.data.token;
        this.setToken(token);
        navigateTo('/');
      } catch (error) {
        return `登入失敗 ${error}`;
      }
    },
    async register(data, resetForm) {
      try {
        const { name, email, password, phone, birthday, address } = data;
        const format_birthday = `${birthday.year}/${birthday.month}/${birthday.day}`;
        const response = await instance.post('/api/v1/user/signup', {
          name,
          email,
          password,
          phone,
          birthday: format_birthday,
          address,
        });
        if (response && response.status) {
          this.setToken(response.data.token);
          if (resetForm) resetForm();
          navigateTo('/account/login');
        }
      } catch (error) {
        return `註冊失敗 ${error}`;
      }
    },
    async checkToken() {
      try {
        const response = await instance.get('/api/v1/user/check');
        if (response.status) {
          this.setToken(response.data.token);
        }
      } catch (error) {
        console.log(error);
        return `檢查 Token 失敗 ${error}`;
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
      this.user = null;
      navigateTo('/account/login');
    },
  },
});
