<script setup>
import dayjs from 'dayjs';
const route = useRoute();
const { bookingId } = route.params;
const { $axios } = useNuxtApp();
const config = useRuntimeConfig();
const paymentURL = config.public.PayGateWay;
const merchantID = config.public.MerchantID;
const version = config.public.Version;

const paymentForm = ref(null)
const paymentInfo = ref({})



const order = ref({
  userInfo: {
    name: '',
    phone: '',
    email: '',
  },
});
const daysCount = computed(() => {
  const startDate = new Date(order.value.checkInDate);
  const endDate = new Date(order.value.checkOutDate);
  const timeDiff = Math.abs(endDate - startDate);
  const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return days;
});
useHead({
  title: '信用卡付款',
});
  
const response = await $axios.get(`/api/v1/orders/${bookingId}`);
order.value = response.data.result;
if (order.value && order.value.paymentInfo) {
  paymentInfo.value = order.value.paymentInfo
}

onMounted(() => {
  if (paymentForm.value) {
    paymentForm.value.submit()
  }
})

</script>

<template>
  <main class="overflow-hidden pt-18 pt-md-30 bg-neutral-120">
    <div class="container py-10 py-md-30">
      <div class="row gap-15 gap-md-0">
        <div class="col-md-6 col-lg-7">
          <div
            class="d-flex flex-column flex-md-row align-items-md-center gap-4 gap-md-10 mb-8 mb-md-10"
          >
            <Icon
              class="p-2 display-4 text-neutral-0 rounded-circle"
              icon="material-symbols:credit-card"
            />
            <div class="text-neutral-0 fs-2 fs-lg-1">
              <h1 class="fw-bold fs-2 fs-lg-1">信用卡付款</h1>
            </div>
          </div>

          <hr class="my-10 my-md-20 opacity-100 text-neutral-40" />
          <section class="text-neutral-0">
            <p>正在導向付款頁面，請稍候...</p>

            <form ref="paymentForm" :action="paymentURL" method="post">
              <input type="hidden" name="MerchantID" :value="merchantID" />
              <input type="hidden" name="TradeInfo" :value="paymentInfo.aesEncrypt" />
              <input type="hidden" name="TradeSha" :value="paymentInfo.shaEncrypt" />
              <input type="hidden" name="Version" :value="version" />
            </form>
          </section>

          <hr class="my-10 my-md-20 opacity-100 text-neutral-40" />

          <h2 class="mb-6 mb-md-10 text-neutral-0 fs-5 fw-bold">訂房人資訊</h2>
          <div class="d-flex flex-column gap-6">
            <div>
              <p class="mb-2 text-neutral-40 fw-medium">姓名</p>
              <span class="text-neutral-0 fw-bold">{{
                order.userInfo.name
              }}</span>
            </div>
            <div>
              <p class="mb-2 text-neutral-40 fw-medium">手機號碼</p>
              <span class="text-neutral-0 fw-bold">{{
                order.userInfo.phone
              }}</span>
            </div>
            <div>
              <p class="mb-2 text-neutral-40 fw-medium">電子信箱</p>
              <span class="text-neutral-0 fw-bold">{{
                order.userInfo.email
              }}</span>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6 col-lg-5">
          <div
            class="rounded-3xl d-flex flex-column gap-6 gap-md-10 p-4 p-md-6 p-lg-10 mx-auto ms-md-auto bg-neutral-0"
            style="max-width: 478px"
          >
            <div>
              <p class="mb-2 text-neutral-80 fs-8 fs-md-7 fw-medium">
                預訂參考編號： {{ bookingId }}
              </p>
              <h2 class="mb-0 text-neutral-100 fs-7 fs-md-5 fw-bold">
                即將來的行程
              </h2>
            </div>

            <img
              class="img-fluid rounded-3"
              :src="order.roomId?.imageUrl"
              :alt="order.roomId?.name"
            />

            <section class="d-flex flex-column gap-6">
              <h3
                class="d-flex align-items-center mb-6 text-neutral-80 fs-8 fs-lg-6 fw-bold"
              >
                <p class="mb-0">{{ order.roomId?.name }}，{{ daysCount }} 晚</p>
                <span
                  class="d-inline-block mx-4 bg-neutral-80"
                  style="width: 1px; height: 18px"
                />
                <p class="mb-0">住宿人數：{{ order.peopleNum }} 位</p>
              </h3>

              <div class="text-neutral-80 fs-8 fs-lg-7 fw-bold">
                <p class="title-deco mb-2">
                  入住：{{
                    dayjs(order.checkInDate).format('MM 月 DD 日 dddd')
                  }}，15:00 可入住
                </p>
                <p class="title-deco mb-0">
                  退房：{{
                    dayjs(order.checkOutDate).format('MM 月 DD 日 dddd')
                  }}，12:00 前退房
                </p>
              </div>

              <p class="mb-0 text-neutral-80 fs-8 fs-md-7 fw-bold">
                NT$ {{ order.roomId?.price }}
              </p>
            </section>

            <hr class="my-0 opacity-100 text-neutral-40" />

            <section>
              <h3
                class="title-deco mb-4 mb-md-6 text-neutral-100 fs-8 fs-md-7 fw-bold"
              >
                房內設備
              </h3>
              <ul
                class="d-flex flex-wrap row-gap-2 column-gap-10 p-6 mb-0 fs-8 fs-md-7 bg-neutral-0 border border-neutral-40 rounded-3 list-unstyled"
              >
                <li
                  class="flex-item d-flex gap-2"
                  v-for="item in order.roomId?.facilityInfo"
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
                  <p class="mb-0 text-neutral-80 fw-bold">{{ item.title }}</p>
                </li>
              </ul>
            </section>

            <section>
              <h3
                class="title-deco mb-4 mb-md-6 text-neutral-100 fs-8 fs-md-7 fw-bold"
              >
                備品提供
              </h3>
              <ul
                class="d-flex flex-wrap row-gap-2 column-gap-10 p-6 mb-0 fs-8 fs-md-7 bg-neutral-0 border border-neutral-40 rounded-3 list-unstyled"
              >
                <li
                  class="flex-item d-flex gap-2"
                  v-for="item in order.roomId?.amenityInfo"
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
        </div>
      </div>
    </div>
    <picture>
      <source
        srcset="/images/deco-line-group-horizontal-full.svg"
        media="(min-width:576px)"
      />
      <img
        class="w-100"
        src="/images/deco-line-group-horizontal-sm.svg"
        alt="deco-line-group"
      />
    </picture>
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
#tappay-iframe {
  font-family: Lato, 'Helvetica Neue', Arial, Helvetica, sans-serif;
  margin: 0;
  outline: 0;
  -webkit-appearance: none;
  tap-highlight-color: rgba(255, 255, 255, 0);
  line-height: 1.21428571em;
  padding: 0.578571em 1em;
  font-size: 1em;
  background: #fff;
  border: 1px solid rgba(34, 36, 38, 0.15);
  color: rgba(0, 0, 0, 0.87);
  border-radius: 0.28571429rem;
  box-shadow: 0 0 0 0 transparent inset;
  -webkit-transition: color 0.1s ease, border-color 0.1s ease;
  transition: color 0.1s ease, border-color 0.1s ease;
  width: 100%;
}
</style>
