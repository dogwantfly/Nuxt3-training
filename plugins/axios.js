import axios from 'axios';

export default defineNuxtPlugin((nuxtApp) => {
  const instance = axios.create({
    baseURL: 'https://nuxt3-hotel-freyja.onrender.com',
  });

  // 添加請求攔截器，將 Token 自動添加到每個請求
  instance.interceptors.request.use((config) => {
    const token = useCookie('auth_token').value;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // 添加響應攔截器，統一處理錯誤
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

  nuxtApp.provide('axios', instance);
});
