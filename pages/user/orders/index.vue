<script setup>
import dayjs from 'dayjs';
definePageMeta({
  layout: 'user',
});

const { $axios, $bootstrap, $showToast } = useNuxtApp();
const orders = ref([]);
const comingSoonOrders = ref([]);
const getOrders = async () => {
  const res = await $axios.get('/api/v1/orders');
  orders.value = res.data.result.sort((a, b) =>
    dayjs(b.checkInDate).diff(dayjs(a.checkInDate))
  );
  const today = dayjs().format('YYYY-MM-DD');
  comingSoonOrders.value = res.data.result.filter(
    (order) => dayjs(order.checkInDate).isAfter(today) && order.status !== -1
  );
};

onMounted(async () => {
  await getOrders();
  $bootstrap.Modal(document.getElementById('cancelModal'));
});
const handleDeleteOrder = async (id) => {
  try {
    const res = await $axios.delete(`/api/v1/orders/${id}`);
    await getOrders();
    $showToast('刪除訂單成功', { variant: 'success' });
  } catch (error) {
    console.error(error);
    $showToast('刪除訂單失敗', { variant: 'danger' });
  }
};
</script>

<template>
  <div class="row gap-6 gap-md-0">
    <div class="col-12 col-md-7">
      <template v-if="comingSoonOrders.length > 0">
        <div
          class="rounded-3xl d-flex flex-column gap-6 gap-md-10 p-4 p-md-10 bg-neutral-0"
          style="max-width: 730px"
        >
          <div>
            <p class="mb-2 text-neutral-80 fs-8 fs-md-7 fw-medium">
              預訂參考編號： {{ comingSoonOrders[0]._id }}
            </p>
            <h2 class="mb-0 text-neutral-100 fs-7 fs-md-5 fw-bold">
              即將來的行程
            </h2>
          </div>

          <img
            class="img-fluid rounded-3"
            :src="comingSoonOrders[0].roomId?.imageUrl"
            :alt="comingSoonOrders[0].roomId?.name"
          />

          <section class="d-flex flex-column gap-6">
            <h3
              class="d-flex align-items-center mb-0 text-neutral-80 fs-8 fs-lg-6 fw-bold"
            >
              <p class="mb-0">
                {{ comingSoonOrders[0].roomId?.name }}，{{
                  dayjs(comingSoonOrders[0].checkOutDate).diff(
                    dayjs(comingSoonOrders[0].checkInDate),
                    'day'
                  )
                }}
                晚
              </p>
              <span
                class="d-inline-block mx-4 bg-neutral-80"
                style="width: 1px; height: 18px"
              />
              <p class="mb-0">
                住宿人數：{{ comingSoonOrders[0].peopleNum }} 位
              </p>
            </h3>

            <div class="text-neutral-80 fs-8 fs-md-7 fw-bold">
              <p class="title-deco mb-2">
                入住：{{
                  dayjs(comingSoonOrders[0].checkInDate).format(
                    'MM 月 DD 日 dddd'
                  )
                }}，15:00 可入住
              </p>
              <p class="title-deco mb-0">
                退房：{{
                  dayjs(comingSoonOrders[0].checkOutDate).format(
                    'MM 月 DD 日 dddd'
                  )
                }}，12:00 前退房
              </p>
            </div>

            <p class="mb-0 text-neutral-80 fs-8 fs-md-7 fw-bold">
              NT$ {{ comingSoonOrders[0].roomId?.price }}
            </p>
          </section>

          <hr class="my-0 opacity-100 text-neutral-40" />

          <section>
            <h3 class="title-deco mb-6 text-neutral-100 fs-8 fs-md-7 fw-bold">
              房內設備
            </h3>
            <ul
              class="d-flex flex-wrap row-gap-2 column-gap-10 p-6 mb-0 fs-8 fs-md-7 bg-neutral-0 border border-neutral-40 rounded-3 list-unstyled"
            >
              <li
                class="flex-item d-flex gap-2"
                v-for="item in comingSoonOrders[0].roomId?.facilityInfo"
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
            <h3 class="title-deco mb-6 text-neutral-100 fs-8 fs-md-7 fw-bold">
              備品提供
            </h3>
            <ul
              class="d-flex flex-wrap row-gap-2 column-gap-10 p-6 mb-0 fs-8 fs-md-7 bg-neutral-0 border border-neutral-40 rounded-3 list-unstyled"
            >
              <li
                class="flex-item d-flex gap-2"
                v-for="item in comingSoonOrders[0].roomId?.amenityInfo"
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

          <div class="d-flex gap-4">
            <button
              data-bs-toggle="modal"
              data-bs-target="#cancelModal"
              class="btn btn-outline-primary-100 w-50 py-4 fw-bold"
              style="--bs-btn-hover-color: #fff"
              type="button"
              @click="openCancelModal"
            >
              取消預訂
            </button>
            <NuxtLink
              @click="handleClickDetail"
              class="btn btn-primary-100 text-neutral-0 w-50 py-4 fw-bold"
            >
              查看詳情
            </NuxtLink>
          </div>
        </div>
      </template>
      <template v-else>
        <p class="text-neutral-80 fs-8 fs-md-7 fw-medium">
          目前沒有任何即將來的行程
        </p>
      </template>
    </div>
    <div class="col-12 col-md-5">
      <div
        class="rounded-3xl d-flex flex-column gap-6 gap-md-10 p-4 p-md-10 bg-neutral-0"
      >
        <h2 class="mb-0 text-neutral-100 fs-7 fs-md-5 fw-bold">歷史訂單</h2>
        <template v-if="orders.length > 0">
          <div
            class="d-flex flex-column flex-lg-row gap-6"
            v-for="order in orders"
            :key="order.id"
          >
            <img
              class="img-fluid object-fit-cover rounded-3"
              style="max-width: 120px; height: 80px"
              :src="order.roomId?.imageUrl"
              :alt="order.roomId?.name"
            />
            <section class="d-flex flex-column gap-4">
              <p class="mb-0 text-neutral-80 fs-8 fs-md-7 fw-medium">
                預訂參考編號： {{ order._id }}
              </p>

              <h3
                class="d-flex align-items-center mb-0 text-neutral-80 fs-8 fs-md-6 fw-bold"
              >
                {{ order.roomId?.name }}
              </h3>

              <div class="text-neutral-80 fw-medium">
                <p class="mb-2">
                  住宿天數：
                  {{
                    dayjs(order.checkOutDate).diff(
                      dayjs(order.checkInDate),
                      'day'
                    )
                  }}
                  晚
                </p>
                <p class="mb-0">住宿人數：{{ order.peopleNum }} 位</p>
              </div>

              <div class="text-neutral-80 fs-8 fs-md-7 fw-medium">
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
          </div>

          <hr
            class="my-0 opacity-100 text-neutral-40"
            v-if="orders.length > 1"
          />
        </template>
        <template v-else>
          <p class="text-neutral-80 fs-8 fs-md-7 fw-medium">
            目前沒有任何歷史訂單
          </p>
        </template>

        <button
          v-if="orders.length > 3"
          class="btn btn-outline-primary-100 py-4 fw-bold"
          style="--bs-btn-hover-color: #fff"
          type="button"
        >
          查看更多
        </button>
      </div>
    </div>
  </div>
  <ClientOnly>
    <div id="cancelModal" class="modal fade" tabindex="-1">
      <div
        class="modal-dialog modal-dialog-centered align-items-end align-items-md-center m-0 mx-md-auto h-100"
      >
        <div class="modal-content">
          <div class="modal-header">
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>
          <div
            class="modal-body mx-auto my-10 my-md-15 text-neutral-80 fs-8 fs-md-6 fw-bold"
          >
            確定要取消此房型的預訂嗎？
          </div>
          <div class="modal-footer d-flex gap-4">
            <button
              type="button"
              class="btn btn-outline-primary-100 flex-grow-1 m-0 py-4 fw-bold"
              style="--bs-btn-hover-color: #fff"
              data-bs-dismiss="modal"
            >
              關閉視窗
            </button>
            <button
              type="button"
              class="btn btn-primary-100 flex-grow-1 m-0 py-4 text-white fw-bold"
              data-bs-dismiss="modal"
              @click="handleDeleteOrder(comingSoonOrders[0]._id)"
            >
              確定取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
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

.rounded-3xl {
  border-radius: 1.25rem;
}

.title-deco {
  display: flex;
  align-items: center;
}

.title-deco::before {
  --color: #bf9d7d;
  content: '';
  display: inline-block;
  width: 4px;
  height: 24px;
  background-color: var(--color);
  border-radius: 10px;
  margin-right: 0.75rem;
}

.title-deco:nth-child(2)::before {
  --color: #909090;
}

.flex-item {
  max-width: 97px;
  width: 100%;
  white-space: nowrap;
}

.modal {
  backdrop-filter: blur(10px);

  @include media-breakpoint-down(md) {
    backdrop-filter: none;
  }
}

.modal-header {
  @include media-breakpoint-down(md) {
    border-bottom: 0 !important;
  }
}

.modal-content {
  @include media-breakpoint-down(md) {
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
  }
}
</style>
