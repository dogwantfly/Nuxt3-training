<script setup>
import { useRouter } from 'vue-router';
import { useBookingStore } from '~/stores/booking';
import { useAuthStore } from '~/stores/auth';
import cityCountyData from '~/assets/cityCountyData.json';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';
dayjs.locale('zh-tw');

const { $apiClient } = useNuxtApp();
const router = useRouter();
const bookingStore = useBookingStore();
const authStore = useAuthStore();
const room = ref({
  name: '',
  areaInfo: '',
  bedInfo: '',
  maxPeople: 0,
  layoutInfo: [],
  facilityInfo: [],
  amenityInfo: [],
});

const goBack = () => {
  router.back();
};
const isLoading = ref(false);
useHead({
  title: '確認訂房資訊',
});
const { $showToast, $axios } = useNuxtApp();
const confirmBooking = async () => {
  const userInfo = bookingInfo.value.user;
  const isAllFilled = Object.values(userInfo).every((value) => value !== '');
  if (!isAllFilled) {
    $showToast('請填寫完整資料', {
      variant: 'danger',
    });
    return;
  }
  isLoading.value = true;
  const data = {
    ...bookingInfo.value,
    roomId: bookingInfo.value.roomId,
    checkInDate: bookingInfo.value.bookingDate.date.start,
    checkOutDate: bookingInfo.value.bookingDate.date.end,
    peopleNum: bookingInfo.value.bookingNum,
    userInfo: {
      address: {
        zipcode: bookingInfo.value.user.address.zipcode,
        detail: bookingInfo.value.user.address.detail,
      },
      name: bookingInfo.value.user.name,
      phone: bookingInfo.value.user.phone,
      email: bookingInfo.value.user.email,
    },
  };
  try {
    const response = await $axios.post('/api/v1/orders/', data);
    if (response.data.status) {
      localStorage.removeItem('bookingInfo');
      localStorage.removeItem('bookingDate');
      setTimeout(() => {
        isLoading.value = false;
        navigateTo(`/booking_confirmation/${response.data.result._id}`);
      }, 1500);
    }
  } catch (error) {
    $showToast(`訂房失敗: ${error.response.data.message}`, {
      variant: 'danger',
    });
  } finally {
    isLoading.value = false;
  }
};
const bookingInfo = ref({
  user: {
    name: '',
    phone: '',
    email: '',
    address: {
      city: '臺北市',
      area: '中正區',
      zipCode: 100,
      detail: '',
    },
  },
});

onMounted(async () => {
  setAreaList(bookingInfo.value.user.address.city);
  const storedBookingInfo = JSON.parse(localStorage.getItem('bookingInfo'));

  bookingInfo.value = {
    bookingDate: {
      date: {
        start: '',
        end: '',
      },
    },

    user: {
      name: '',
      phone: '',
      email: '',
      address: {
        city: '臺北市',
        area: '中正區',
        zipCode: 100,
        detail: '',
      },
    },
    ...storedBookingInfo,
  };
  const response = await $apiClient.get(
    `/api/v1/rooms/${bookingInfo.value.roomId}`
  );
  if (response && response.result) {
    room.value = response.result;
  } else {
    console.error('Failed to load room data');
  }
});
const daysCount = computed(() => {
  const date = bookingInfo.value.bookingDate?.date;
  if (!date || !date.start || !date.end) return 2;
  const startDate = dayjs(bookingInfo.value.bookingDate.date.start);
  const endDate = dayjs(bookingInfo.value.bookingDate.date.end);
  return endDate.diff(startDate, 'day');
});
const formatDate = (date) => {
  const offsetToUTC8 = date.getHours() + 8;
  date.setHours(offsetToUTC8);
  return date.toISOString().split('T')[0];
};
const handleUseMemberInfo = () => {
  bookingInfo.value.user = authStore.user;
  const county = cityCountyData.find((city) =>
    city.AreaList.find((area) => area.ZipCode == authStore.user.address.zipcode)
  );
  bookingInfo.value.user.address.city = county.CityName;
  bookingInfo.value.user.address.area = county.AreaList.find(
    (area) => area.ZipCode == authStore.user.address.zipcode
  ).AreaName;
};
const areaList = ref([]);

const setAreaList = (cityName) => {
  console.log(cityName);
  const selectedCity = cityCountyData.find(
    (city) => city.CityName === cityName
  );
  areaList.value = selectedCity.AreaList;
  bookingInfo.value.user.address.area = areaList.value[0].AreaName;
  bookingInfo.value.user.address.zipcode = areaList.value[0].ZipCode;
};
watch(
  () => bookingInfo.value.user.address.city,
  (newCity) => {
    setAreaList(newCity);
  }
);

const isEdit = ref({
  roomName: false,
  bookingDate: false,
  bookingNum: false,
  userInfo: false,
});

const response_rooms = await $apiClient.get('/api/v1/rooms/');
const rooms = response_rooms.result;

const handleEditBooking = () => {
  isEdit.value.roomName = false;
  bookingInfo.value.roomId = room.value._id;
  room.value = rooms.find((room) => room._id === bookingInfo.value.roomId);
};
</script>

<template>
  <main class="pt-18 pt-md-30 bg-neutral-120">
    <section class="py-10 py-md-30 bg-primary-10">
      <div class="container">
        <button
          class="d-flex align-items-baseline gap-2 mb-10 bg-transparent border-0"
          type="button"
          @click="goBack"
        >
          <Icon class="fs-5 text-neutral-100" icon="mdi:keyboard-arrow-left" />
          <h1 class="mb-0 text-neutral-100 fs-3 fw-bold">確認訂房資訊</h1>
        </button>

        <div class="row gap-10 gap-md-0">
          <div class="col-12 col-md-6 col-lg-7">
            <section>
              <h2 class="mb-8 mb-md-10 text-neutral-100 fs-6 fs-md-4 fw-bold">
                訂房資訊
              </h2>
              <div class="d-flex flex-column gap-6">
                <div
                  class="d-flex justify-content-between align-items-center text-neutral-100"
                >
                  <div>
                    <h3 class="title-deco mb-2 fs-7 fw-bold">選擇房型</h3>
                    <p class="mb-0 fw-medium">{{ room.name }}</p>
                    <template v-if="isEdit.roomName">
                      <select
                        class="form-select p-4 text-neutral-80 fs-8 fs-md-7 fw-medium rounded-3 mt-2"
                        v-model="room._id"
                      >
                        <option
                          v-for="room in rooms"
                          :key="room._id"
                          :value="room._id"
                        >
                          {{ room.name }}
                        </option>
                      </select>
                    </template>
                  </div>
                  <button
                    class="bg-transparent border-0 fw-bold text-decoration-underline"
                    type="button"
                    @click="isEdit.roomName = !isEdit.roomName"
                  >
                    {{ !isEdit.roomName ? '編輯' : '取消' }}
                  </button>
                  <button
                    class="bg-transparent border-0 fw-bold text-decoration-underline"
                    type="button"
                    @click="handleEditBooking"
                    v-if="isEdit.roomName"
                  >
                    確定
                  </button>
                </div>
                <div
                  class="d-flex justify-content-between align-items-center text-neutral-100"
                >
                  <div>
                    <h3 class="title-deco mb-2 fs-7 fw-bold">訂房日期</h3>
                    <p class="mb-2 fw-medium">
                      入住：{{
                        dayjs(bookingInfo.bookingDate?.date.start).format(
                          'M 月 D 日 dddd'
                        )
                      }}
                    </p>
                    <p class="mb-0 fw-medium">
                      退房：{{
                        dayjs(bookingInfo.bookingDate?.date.end).format(
                          'M 月 D 日 dddd'
                        )
                      }}
                    </p>
                  </div>
                  <button
                    class="bg-transparent border-0 fw-bold text-decoration-underline"
                    type="button"
                  >
                    編輯
                  </button>
                </div>
                <div
                  class="d-flex justify-content-between align-items-center text-neutral-100"
                >
                  <div>
                    <h3 class="title-deco mb-2 fs-7 fw-bold">房客人數</h3>
                    <p class="mb-0 fw-medium">
                      {{ bookingInfo.bookingNum }} 人
                    </p>
                  </div>
                  <button
                    class="bg-transparent border-0 fw-bold text-decoration-underline"
                    type="button"
                  >
                    編輯
                  </button>
                </div>
              </div>
            </section>

            <hr class="my-10 my-md-12 opacity-100 text-neutral-60" />

            <section>
              <div
                class="d-flex justify-content-between align-items-center mb-10"
              >
                <h2 class="mb-0 text-neutral-100 fs-6 fs-md-4 fw-bold">
                  訂房人資訊
                </h2>
                <button
                  class="text-primary-100 bg-transparent border-0 fw-bold text-decoration-underline"
                  type="button"
                  @click="handleUseMemberInfo"
                >
                  套用會員資料
                </button>
              </div>

              <div class="d-flex flex-column gap-6">
                <div class="text-neutral-100">
                  <label for="name" class="form-label fs-8 fs-md-7 fw-bold"
                    >姓名</label
                  >
                  <input
                    id="name"
                    type="text"
                    class="form-control p-4 fs-8 fs-md-7 rounded-3"
                    placeholder="請輸入姓名"
                    v-model="bookingInfo.user.name"
                  />
                </div>

                <div class="text-neutral-100">
                  <label for="phone" class="form-label fs-8 fs-md-7 fw-bold"
                    >手機號碼</label
                  >
                  <input
                    id="phone"
                    type="tel"
                    class="form-control p-4 fs-8 fs-md-7 rounded-3"
                    placeholder="請輸入手機號碼"
                    v-model="bookingInfo.user.phone"
                  />
                </div>

                <div class="text-neutral-100">
                  <label for="email" class="form-label fs-8 fs-md-7 fw-bold"
                    >電子信箱</label
                  >
                  <input
                    id="email"
                    type="email"
                    class="form-control p-4 fs-8 fs-md-7 rounded-3"
                    placeholder="請輸入電子信箱"
                    v-model="bookingInfo.user.email"
                  />
                </div>

                <div class="text-neutral-100">
                  <label for="address" class="form-label fs-8 fs-md-7 fw-bold"
                    >地址</label
                  >
                  <div class="d-flex gap-2 mb-4">
                    <select
                      class="form-select w-50 p-4 text-neutral-80 fs-8 fs-md-7 fw-medium rounded-3"
                      v-model="bookingInfo.user.address.city"
                    >
                      <option
                        v-for="city in cityCountyData"
                        :key="city.CityName"
                      >
                        {{ city.CityName }}
                      </option>
                    </select>
                    <select
                      class="form-select w-50 p-4 text-neutral-80 fs-8 fs-md-7 fw-medium rounded-3"
                      v-model="bookingInfo.user.address.area"
                    >
                      <option v-for="area in areaList" :key="area.AreaName">
                        {{ area.AreaName }}
                      </option>
                    </select>
                  </div>
                  <input
                    id="address"
                    type="text"
                    class="form-control p-4 fs-8 fs-md-7 rounded-3"
                    placeholder="請輸入詳細地址"
                    v-model="bookingInfo.user.address.detail"
                  />
                </div>
              </div>
            </section>

            <hr class="my-10 my-md-12 opacity-100 text-neutral-60" />

            <section>
              <h2 class="mb-8 mb-md-10 text-neutral-100 fs-6 fs-md-4 fw-bold">
                房間資訊
              </h2>
              <div class="d-flex flex-column gap-6">
                <section>
                  <h3 class="title-deco mb-4 mb-md-6 fs-7 fs-md-5 fw-bold">
                    房型基本資訊
                  </h3>
                  <ul class="d-flex gap-4 list-unstyled">
                    <li
                      class="card-info px-4 py-5 bg-neutral-0 border border-primary-40 rounded-3"
                    >
                      <Icon
                        class="mb-2 fs-5 text-primary-100"
                        icon="fluent:slide-size-24-filled"
                      />
                      <p class="mb-0 fw-bold text-neutral-80 text-nowrap">
                        {{ room.areaInfo }}
                      </p>
                    </li>
                    <li
                      class="card-info px-4 py-5 bg-neutral-0 border border-primary-40 rounded-3"
                    >
                      <Icon
                        class="mb-2 fs-5 text-primary-100"
                        icon="material-symbols:king-bed"
                      />
                      <p class="mb-0 fw-bold text-neutral-80 text-nowrap">
                        {{ room.bedInfo }}
                      </p>
                    </li>
                    <li
                      class="card-info px-4 py-5 bg-neutral-0 border border-primary-40 rounded-3"
                    >
                      <Icon
                        class="mb-2 fs-5 text-primary-100"
                        icon="ic:baseline-person"
                      />
                      <p class="mb-0 fw-bold text-neutral-80 text-nowrap">
                        2-{{ room.maxPeople }} 人
                      </p>
                    </li>
                  </ul>
                </section>

                <section>
                  <h3
                    class="title-deco mb-4 mb-md-6 text-neutral-100 fs-7 fs-md-5 fw-bold"
                  >
                    房間格局
                  </h3>
                  <ul
                    class="d-flex flex-wrap gap-6 gap-md-10 p-6 fs-8 fs-md-7 bg-neutral-0 rounded-3 list-unstyled"
                  >
                    <li
                      class="flex-item d-flex gap-2"
                      v-for="item in room.layoutInfo"
                      :key="item.title"
                    >
                      <Icon
                        class="fs-5 text-primary-100"
                        :icon="
                          item.isProvide
                            ? `material-symbols:check`
                            : `material-symbols:close`
                        "
                      />
                      <p class="mb-0 text-neutral-80 fw-bold">
                        {{ item.title }}
                      </p>
                    </li>
                  </ul>
                </section>

                <section>
                  <h3
                    class="title-deco mb-4 mb-md-6 text-neutral-100 fs-7 fs-md-5 fw-bold"
                  >
                    房內設備
                  </h3>
                  <ul
                    class="d-flex flex-wrap row-gap-2 column-gap-10 p-6 mb-0 fs-8 fs-md-7 bg-neutral-0 rounded-3 list-unstyled"
                  >
                    <li
                      class="flex-item d-flex gap-2"
                      v-for="item in room.facilityInfo"
                      :key="item.title"
                    >
                      <Icon
                        class="fs-5 text-primary-100 flex-shrink-0"
                        :icon="
                          item.isProvide
                            ? `material-symbols:check`
                            : `material-symbols:close`
                        "
                      />
                      <p class="mb-0 text-neutral-80 fw-bold text-nowrap">
                        {{ item.title }}
                      </p>
                    </li>
                  </ul>
                </section>

                <section>
                  <h3
                    class="title-deco mb-4 mb-md-6 text-neutral-100 fs-7 fs-md-5 fw-bold"
                  >
                    備品提供
                  </h3>
                  <ul
                    class="d-flex flex-wrap row-gap-2 column-gap-10 p-6 mb-0 fs-8 fs-md-7 bg-neutral-0 rounded-3 list-unstyled"
                  >
                    <li
                      class="flex-item d-flex gap-2"
                      v-for="item in room.amenityInfo"
                      :key="item.title"
                    >
                      <Icon
                        class="fs-5 text-primary-100 flex-shrink-0"
                        :icon="
                          item.isProvide
                            ? `material-symbols:check`
                            : `material-symbols:close`
                        "
                      />
                      <p class="mb-0 text-neutral-80 fw-bold text-nowrap">
                        {{ item.title }}
                      </p>
                    </li>
                  </ul>
                </section>
              </div>
            </section>
          </div>

          <div class="col-12 col-md-6 col-lg-5">
            <div
              class="confirm-form rounded-3xl d-flex flex-column gap-10 p-6 p-md-10 mx-auto ms-md-auto me-md-0 bg-neutral-0"
            >
              <img
                class="img-fluid rounded-3"
                src="/images/room-a-1.png"
                alt="room-a"
              />

              <div>
                <h2 className="mb-6 text-neutral-100 fs-6 fs-md-4 fw-bold">
                  價格詳情
                </h2>
                <div
                  class="d-flex justify-content-between align-items-center mb-3"
                >
                  <div
                    class="d-flex align-items-center text-neutral-100 fw-medium"
                  >
                    <span class="text-nowrap">NT$ {{ room.price }}</span>
                    <Icon
                      class="ms-2 me-1 text-neutral-80"
                      icon="material-symbols:close"
                    />
                    <span class="text-neutral-80 text-nowrap"
                      >{{ daysCount }} 晚</span
                    >
                  </div>
                  <span class="fw-medium text-nowrap">
                    NT$ {{ room.price * daysCount }}
                  </span>
                </div>
                <div
                  class="d-flex justify-content-between align-items-center fw-medium"
                >
                  <p class="d-flex align-items-center mb-0 text-neutral-100">
                    住宿折扣
                  </p>
                  <span class="text-primary-100">
                    -NT$ {{ room.discount || 1000 }}
                  </span>
                </div>
                <hr class="my-6 opacity-100 text-neutral-40" />
                <div
                  class="d-flex justify-content-between align-items-center text-neutral-100 fw-bold"
                >
                  <p class="d-flex align-items-center mb-0">總價</p>
                  <span>
                    NT$ {{ room.price * daysCount - (room.discount || 1000) }}
                  </span>
                </div>
              </div>

              <button
                class="btn btn-primary-100 py-4 text-neutral-0 fw-bold rounded-3"
                type="button"
                @click="confirmBooking"
              >
                確認訂房
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <RoomBookingLoading v-if="isLoading" />
  </main>
</template>

<style lang="scss" scoped>
@import 'bootstrap/scss/mixins/breakpoints';

$grid-breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px,
  xxxl: 1537px,
);

.title-deco {
  display: flex;
  align-items: center;
}

.title-deco::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 24px;
  background-color: #bf9d7d;
  border-radius: 10px;
  margin-right: 0.75rem;
}

.form-control::placeholder {
  --neutral-60: #909090;
  color: var(--neutral-60);
  font-weight: 500;
}

.card-info {
  width: 97px;
  height: 97px;
}

.flex-item {
  width: 15%;
  flex-shrink: 0;
}

.rounded-3xl {
  border-radius: 1.25rem;
}

.confirm-form {
  position: sticky;
  top: 160px;
  max-width: 478px;

  @include media-breakpoint-down(md) {
    position: static;
    top: 0;
    max-width: auto;
  }
}
</style>
