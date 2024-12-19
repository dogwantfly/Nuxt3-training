<script setup>
import { useAuthStore } from '~/stores/auth';
import { useToggle } from '@vueuse/core';

definePageMeta({
  layout: 'account',
});
const loginInfo = ref({
  email: '',
  password: '',
});
const authStore = useAuthStore();
const verifyEmail = ref('');
const showResetPassword = ref(false);
const resetPasswordInfo = ref({
  email: '',
  code: '',
  newPassword: '',
});
const verifyEmailModal = ref(null);
const resetPasswordModal = ref(null);

onMounted(() => {
  if (authStore.isAuthenticated) {
    navigateTo('/');
  }
});

const [isModalOpen, toggleModal] = useToggle(false);
const handleForgotPassword = () => {
  toggleModal();
};
const { $axios, $showToast } = useNuxtApp();
const handleSendEmailCode = async () => {
  try {
    

    const response = await $axios.post('/api/v1/verify/email', {
      email: verifyEmail.value,
    });

    if (!response.data.result.isEmailExists) {
      $showToast('信箱不存在', { variant: 'danger' });
      return;
    }
    if (response.data.status) {
      const response = await $axios.post('/api/v1/verify/generateEmailCode', {
        email: verifyEmail.value,
      });


      if (response.data.status) {
        showResetPassword.value = true;
        verifyEmail.value = '';
        console.log(verifyEmailModal.value)
        verifyEmailModal.value.closeModal();
        showResetPassword.value = true;
      }
    }
    
  } catch (err) {
    $showToast('發送驗證碼失敗，請稍後再試', { variant: 'danger' });
  }
};
const handleResetPassword = async () => {
  try {
    const response = await $axios.post('/api/v1/user/forgot', resetPasswordInfo.value);
    if (response.data.status) {
      $showToast('重設密碼成功', { variant: 'success' });
      resetPasswordModal.value.closeModal();
      resetPasswordInfo.value = {
        email: '',
        code: '',
        newPassword: '',
      };
      showResetPassword.value = false;
    }
  } catch (err) {
    $showToast('重設密碼失敗，請稍後再試', { variant: 'danger' });
  }
};

</script>

<template>
  <div class="px-5 px-md-0">
    <div class="mb-10">
      <p class="mb-2 text-primary-100 fs-8 fs-md-7 fw-bold">
        享樂酒店，誠摯歡迎
      </p>
      <h1 class="text-neutral-0 fw-bold">
        立即開始旅程
      </h1>
    </div>

    <form class="mb-10">
      <div class="mb-4 fs-8 fs-md-7">
        <label
          class="mb-2 text-neutral-0 fw-bold"
          for="email"
        >
          電子信箱
        </label>
        <input
          id="email"
          class="form-control p-4 text-neutral-100 fw-medium border-neutral-40"
          v-model="loginInfo.email"
          placeholder="請輸入信箱"
          type="email"
        >
      </div>
      <div class="mb-4 fs-8 fs-md-7">
        <label
          class="mb-2 text-neutral-0 fw-bold"
          for="password"
        >
          密碼
        </label>
        <input
          id="password"
          class="form-control p-4 text-neutral-100 fw-medium border-neutral-40"
          placeholder="請輸入密碼"
          type="password"
          v-model="loginInfo.password"
        >
      </div>
      <div class="d-flex justify-content-between align-items-center mb-10 fs-8 fs-md-7">
        <div class="form-check d-flex align-items-end gap-2 text-neutral-0">
          <input
            id="remember"
            class="form-check-input"
            type="checkbox"
            value=""
          >
          <label
            class="form-check-label fw-bold"
            for="remember"
          >
            記住帳號
          </label>
        </div>
        <button
          class="text-primary-100 fw-bold text-decoration-underline bg-transparent border-0"
          type="button"
          @click="handleForgotPassword"
        >
          忘記密碼？
        </button>
      </div>
      <button
        class="btn btn-primary-100 w-100 py-4 text-neutral-0 fw-bold"
        type="button"
        @click="authStore.login(loginInfo)"
        :disabled="!loginInfo.email || !loginInfo.password"
      >
        會員登入
      </button>
    </form>

    <p class="mb-0 fs-8 fs-md-7">
      <span class="me-2 text-neutral-0 fw-medium">沒有會員嗎？</span>
      <NuxtLink
        to="/account/sign_up"
        class="text-primary-100 fw-bold text-decoration-underline bg-transparent border-0"
      >
        <span>前往註冊</span>
      </NuxtLink>
    </p>


  
    <Modal :isOpen="isModalOpen" @update:isOpen="isModalOpen = $event" ref="verifyEmailModal">
      <form>
        <div class="mb-4 fs-8 fs-md-7">
          <label
            class="mb-2 text-neutral-0 fw-bold"
            for="email"
          >
            電子信箱
          </label>
          <input
            id="email"
            class="form-control p-4 text-neutral-100 fw-medium border-neutral-40 mb-2"
            v-model="verifyEmail"
            placeholder="請輸入信箱"
            type="email"
          >
          <button
            class="btn btn-primary-100 py-2 text-neutral-0 fw-bold"
            type="button"
            @click="handleSendEmailCode"
          >
            發送驗證碼
          </button>
        </div>
      </form>
    </Modal>
    <Modal :isOpen="showResetPassword" @update:isOpen="showResetPassword = $event" ref="resetPasswordModal">
      <form>
        <h3 class="mb-4 fs-5 fw-bold text-center">重設密碼</h3>
        <div class="mb-4 fs-8 fs-md-7 fw-bold">
          <label for="resetPasswordEmail">Email</label>
          <input
            id="resetPasswordEmail"
            class="form-control p-4 text-neutral-100 fw-medium border-neutral-40 mb-2"
            type="text"
            placeholder="請輸入信箱"
            v-model="resetPasswordInfo.email"
          >
        </div>
        <div class="mb-4 fs-8 fs-md-7 fw-bold">
          <label for="resetPassword">密碼</label>
          <input
            id="resetPassword"
            class="form-control p-4 text-neutral-100 fw-medium border-neutral-40 mb-2"
            type="password"
            placeholder="請輸入密碼"
            v-model="resetPasswordInfo.newPassword"
          >
        </div>
        
        <div class="mb-4 fs-8 fs-md-7 fw-bold">
          <label class="mb-2 text-neutral-0 fw-bold" for="resetPasswordCode">
            驗證碼
          </label>
          <input
            id="resetPasswordCode"
            class="form-control p-4 text-neutral-100 fw-medium border-neutral-40 mb-2"
            type="text"
            placeholder="請輸入驗證碼"
            v-model="resetPasswordInfo.code"
          >
          <button
            class="btn btn-primary-100 py-2 text-neutral-0 fw-bold"
            type="button"
            @click="handleResetPassword"
          >
            重設密碼
          </button>
        </div>
      </form>
    </Modal>
  </div>

  

</template>

<style lang="scss" scoped>
@import "bootstrap/scss/mixins/breakpoints";

$grid-breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px,
  xxxl: 1537px
);


input[type="password"] {
  font: small-caption;
  font-size: 1.5rem;
}

input::placeholder {
  color: #909090;
  font-size: 1rem;
  font-weight: 500;

  @include media-breakpoint-down(md) {
    font-size: 14px;
  }
}

.form-check-input {
  width: 1.5rem;
  height: 1.5rem;
}

.form-check-input:checked {
  background-color: #BF9D7D;
  border-color: #BF9D7D;
}
</style>