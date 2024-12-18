<script setup>
import { useAuthStore } from '~/stores/auth';
import cityCountyData from '~/assets/cityCountyData.json';
import dayjs from 'dayjs';
definePageMeta({
  layout: 'user',
});
const { $showToast, $axios } = useNuxtApp();
const isEditPassword = ref(false);
const isEditProfile = ref(false);
const authStore = useAuthStore();
const formattedDate = computed(() => {
  return dayjs(authStore.user?.birthday).format("YYYY 年 M 月 D 日");
});
const formattedAddress = computed(() => {
  return `${formData.value.address.zipcode} ${formData.value.address.city} ${formData.value.address.area} ${formData.value.address.detail}`;
});
onMounted(async () => {
  await authStore.getUser();
  formData.value = authStore.user;

  cityCountyData.forEach((city) => {
    const currCity = city.AreaList.find(area => Number(area.ZipCode) === authStore.user.address.zipcode)
    if(currCity) {
      formData.value.address.city = city.CityName
      formData.value.address.area = currCity.AreaName
    }
  })
  const birthMonth = parseInt(authStore.user.birthday.split('-')[1]).toString();
  birthday.value = {
    year: authStore.user.birthday.split('-')[0],
    month: birthMonth,
    day: authStore.user.birthday.split('-')[2].split('T')[0],
  }

});
const formData = ref({
  email: '',
  name: '',
  phone: '',
  birthday: {
    year: '2000',
    month: '1',
    day: '1',
  },
  address: {
    city: '臺北市',
    area: '中正區',
    detail: '',
    zipcode: 100,
  }
});
const birthday = ref({
  year: '2000',
  month: '1',
  day: '1',
});
const daysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};
const areaList = ref([]);

const setAreaList = (cityName) => {
  const selectedCity = cityCountyData.find(city => city.CityName === cityName);
  areaList.value = selectedCity.AreaList;
  formData.value.address.area = areaList.value[0].AreaName;
  formData.value.address.zipcode = areaList.value[0].ZipCode;
};

watch(() => formData.value.address.city, (newCity) => {
  setAreaList(newCity);
});
watch(() => birthday.value.year, (newYear) => {
  daysInMonth(newYear, birthday.value.month);
});
watch(() => birthday.value.month, (newMonth) => {
  daysInMonth(birthday.value.year, newMonth);
});
watch(birthday, (newBirthday) => {
  console.log(newBirthday);
  formData.value.birthday = newBirthday;
}, { deep: true });

const resetForm = () => {
  formData.value = initialFormData;
};
const resetPasswordInfo = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});
const resetPassword = async () => {
  try {
    const data = {
      oldPassword: resetPasswordInfo.value.oldPassword,
    newPassword: resetPasswordInfo.value.newPassword,
    userId: authStore.user._id
  }
  const response = await $axios.put('/api/v1/user/', data)

  if(response.data.status) {
    isEditPassword.value = false;
    resetPasswordInfo.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    $showToast('密碼更新成功', {
      variant: 'success',
    });
  }
  } catch (error) {
    $showToast(`密碼更新失敗: ${error.response.data.message}`, {
      variant: 'danger',
    });
  }
};
const updateProfile = async () => {
  try {
    const data = {
      ...formData.value,
      userId: authStore.user._id,
      address: {
        city: formData.value.address.city,
        area: formData.value.address.area,
        detail: formData.value.address.detail,
        zipcode: formData.value.address.zipcode,
      },
      birthday: `${birthday.value.year}/${birthday.value.month}/${birthday.value.day}`
    }
    const response = await $axios.put('/api/v1/user/', data)
    if(response.data.status) {
      await authStore.getUser();
      isEditProfile.value = false;
      const county = cityCountyData.find(city => city.AreaList.find(area => area.ZipCode == response.data.result.address.zipcode));
      formData.value.address.city = county.CityName;
      formData.value.address.area = county.AreaList.find(area => area.ZipCode == response.data.result.address.zipcode).AreaName;

      formData.value = {
        ...response.data.result,
        address: {
          ...response.data.result.address,
          city: county.CityName,
          area: county.AreaList.find(area => area.ZipCode == response.data.result.address.zipcode).AreaName,
        },
      };
      
      $showToast('更新成功', {
        variant: 'success',
      });
    }
  } catch (error) {
    $showToast(`更新失敗: ${error}`, {
      variant: 'danger',
    });
  }
};



</script>

<template>
  <div class="row gap-6 gap-md-0">
    <div class="col-12 col-md-5">
      <section
        class="rounded-3xl d-flex flex-column gap-6 gap-md-10 p-6 p-md-10 bg-neutral-0"
      >
        <h2 class="fs-6 fs-md-5 fw-bold">修改密碼</h2>
        <div class="d-flex flex-column gap-4 gap-md-6">
          <div class="fs-8 fs-md-7">
            <p class="mb-2 text-neutral-80 fw-medium">電子信箱</p>
            <span
              class="form-control pe-none p-0 text-neutral-100 fw-bold border-0"
              >
              {{ authStore.user?.email }}
            </span>
          </div>

          <div
            class="d-flex justify-content-between align-items-center"
            :class="{ 'd-none': isEditPassword }"
          >
            <div>
              <label class="mb-0 text-neutral-80 fs-8 fs-md-7 fw-medium">
                密碼
              </label>
              <input
                class="form-control pe-none p-0 text-neutral-100 fs-5 fs-md-3 fw-bold border-0"
                type="password"
                value="**********"
              />
            </div>

            <button
              class="flex-shrink-0 text-primary-100 fs-8 fs-md-7 fw-bold text-decoration-underline border-0 bg-transparent"
              type="button"
              @click="isEditPassword = !isEditPassword"
            >
              重設
            </button>
          </div>

          <div
            class="d-flex flex-column gap-4 gap-md-6"
            :class="{ 'd-none': !isEditPassword }"
          >
            <div>
              <label for="oldPassword" class="form-label fs-8 fs-md-7 fw-bold"
                >舊密碼</label
              >
              <input
                id="oldPassword"
                type="password"
                class="form-control p-4 fs-7 rounded-3"
                placeholder="請輸入舊密碼"
                v-model="resetPasswordInfo.oldPassword"
                required
              />
            </div>

            <div>
              <label for="newPassword" class="form-label fs-8 fs-md-7 fw-bold"
                >新密碼</label
              >
              <input
                id="newPassword"
                type="password"
                class="form-control p-4 fs-7 rounded-3"
                placeholder="請輸入新密碼"
                v-model="resetPasswordInfo.newPassword"
                required
              />
            </div>

            <div>
              <label
                for="confirmPassword"
                class="form-label fs-8 fs-md-7 fw-bold"
                >確認新密碼</label
              >
              <input
                id="confirmPassword"
                type="password"
                class="form-control p-4 fs-7 rounded-3"
                placeholder="請再輸入一次新密碼"
                v-model="resetPasswordInfo.confirmPassword"
                required
              />
            </div>
          </div>

          <button
            :class="{ 'd-none': !isEditPassword }"
            class="btn btn-primary-100 align-self-md-start px-8 py-4 rounded-3 text-white fw-bold"
            type="button"
            :disabled="!resetPasswordInfo.oldPassword || !resetPasswordInfo.newPassword || !resetPasswordInfo.confirmPassword"
            @click="resetPassword"
          >
            儲存設定
          </button>
        </div>
      </section>
    </div>

    <div class="col-12 col-md-7">
      <section
        class="rounded-3xl d-flex flex-column gap-6 gap-md-10 p-6 p-md-10 bg-neutral-0"
      >
        <h2 class="fs-6 fs-md-5 fw-bold">基本資料</h2>
        <div class="d-flex flex-column gap-4 gap-md-6">
          <div class="fs-8 fs-md-7">
            <label
              class="form-label"
              :class="{
                'fw-bold text-neutral-100': isEditProfile,
                'fw-medium text-neutral-80': !isEditProfile,
              }"
              for="name"
            >
              姓名
            </label>
            <input
              id="name"
              name="name"
              class="form-control text-neutral-100 fw-bold"
              :class="{
                'pe-none p-0 border-0': !isEditProfile,
                'p-4': isEditProfile,
              }"
              type="text"
              :value="authStore.user?.name"
            />
          </div>

          <div class="fs-8 fs-md-7">
            <label
              class="form-label"
              :class="{
                'fw-bold text-neutral-100': isEditProfile,
                'fw-medium text-neutral-80': !isEditProfile,
              }"
              for="phone"
            >
              手機號碼
            </label>
            <input
              id="phone"
              name="phone"
              class="form-control text-neutral-100 fw-bold"
              :class="{
                'pe-none p-0 border-0': !isEditProfile,
                'p-4': isEditProfile,
              }"
              type="tel"
              :value="authStore.user?.phone"
            />
          </div>

          <div class="fs-8 fs-md-7">
            <label
              class="form-label"
              :class="{
                'fw-bold text-neutral-100': isEditProfile,
                'fw-medium text-neutral-80': !isEditProfile,
              }"
              for="birth"
            >
              生日
            </label>
            <span
              class="form-control pe-none p-0 text-neutral-100 fw-bold border-0"
              :class="{ 'd-none': isEditProfile }"
              >{{  formattedDate }}</span
            >
            <div class="d-flex gap-2" :class="{ 'd-none': !isEditProfile }">
            <select
              id="birth"
              class="form-select p-4 text-neutral-80 fw-medium rounded-3"
              v-model="birthday.year"
            >
              <option
                v-for="year in 100"
                :key="year"
                :value="new Date().getFullYear() - (100 - year)"
              >
                {{ new Date().getFullYear() - (100 - year) }} 年
              </option>
            </select>
            <select
              class="form-select p-4 text-neutral-80 fw-medium rounded-3"
              v-model="birthday.month"
            >
              <option
                v-for="month in 12"
                :key="month"
                :value="month"
              >
                {{ month }} 月
              </option>
            </select>
            <select
              class="form-select p-4 text-neutral-80 fw-medium rounded-3"
              v-model="birthday.day"
            >
              <option
                v-for="day in daysInMonth(birthday.year, birthday.month)"
                :key="day"
                :value="day"
              >
                {{ day }} 日
              </option>
              </select>
            </div>
          </div>

          <div class="fs-8 fs-md-7">
            <label
              class="form-label"
              :class="{
                'fw-bold text-neutral-100': isEditProfile,
                'fw-medium text-neutral-80': !isEditProfile,
              }"
              for="address"
            >
              地址
            </label>
            <span
              class="form-control pe-none p-0 text-neutral-100 fw-bold border-0"
              :class="{ 'd-none': isEditProfile }"
              >{{ formattedAddress }}</span
            >
            <div :class="{ 'd-none': !isEditProfile }">
              <div
              class="d-flex gap-2 mb-2"
            >
              <select
                class="form-select p-4 text-neutral-80 fw-medium rounded-3"
                v-model="formData.address.city"
              >
                <option v-for="city in cityCountyData" :key="city.CityName">
                  {{ city.CityName }}
                </option>
              </select>
              <select
                class="form-select p-4 text-neutral-80 fw-medium rounded-3"
                v-model="formData.address.area"
              >
                <option v-for="area in areaList" :key="area.AreaName">
                  {{ area.AreaName }}
                </option>
              </select>
            </div>
              <input
                id="address"
                type="text"
                class="form-control p-4 rounded-3"
                placeholder="請輸入詳細地址"
                v-model="formData.address.detail"
              />
            </div>
          </div>
        </div>
        <button
          :class="{ 'd-none': isEditProfile }"
          class="btn btn-outline-primary-100 align-self-start px-8 py-4 rounded-3"
          type="button"
          @click="isEditProfile = true"
        >
          編輯
        </button>

        <button
          :class="{ 'd-none': !isEditProfile }"
          class="btn btn-primary-100 align-self-md-start px-8 py-4 rounded-3 text-white fw-bold"
          type="button"
          @click="updateProfile"
        >
          儲存設定
        </button>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.rounded-3xl {
  border-radius: 1.25rem;
}

input[type='password'] {
  font: small-caption;
}

.form-control::placeholder {
  --neutral-60: #909090;
  color: var(--neutral-60);
  font-weight: 500;
}
</style>
