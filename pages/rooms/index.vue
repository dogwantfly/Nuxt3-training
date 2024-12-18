<script setup>
useHead({
  title: '客房旅宿',
})
const slides = ref(Array.from({ length: 5 }));

const importImage = (url) => {
  const image = new URL(url, import.meta.url);
  return image.href;
};
const { $apiClient } = useNuxtApp();

const response_rooms = await $apiClient.get('/api/v1/rooms/');
const rooms = response_rooms.result;

const roomImages = computed(() => {
  const rooms = ['a', 'b', 'c', 'd'];
  const nums = [1, 2, 3, 4, 5];

  const result = rooms.reduce((acc, roomId) => {
    acc[`room${roomId.toUpperCase()}`] = nums.reduce((obj, num) => {
      obj[num] = {
        desktop: importImage(`/images/room-${roomId}-${num}.png`),
        mobile: importImage(`/images/room-${roomId}-sm-${num}.png`),
      };
      return obj;
    }, {});

    return acc;
  }, {});

  return result;
});

const swiperStyles = {
  '--swiper-pagination-bottom': '32px',
  '--swiper-pagination-bullet-width': '32px',
  '--swiper-pagination-bullet-height': '4px',
  '--swiper-pagination-bullet-inactive-color': '#F1EAE4',
  '--swiper-pagination-color': '#BF9D7D',
  '--swiper-pagination-bullet-inactive-opacity': '1',
  '--swiper-pagination-bullet-opacity': '1',
  '--swiper-pagination-bullet-horizontal-gap': '6px',
  '--swiper-pagination-bullet-border-radius': '100px',
  '--swiper-navigation-color': '#BF9D7D',
  '--swiper-navigation-size': '44px',
  '--swiper-navigation-top-offset': '50%',
  '--swiper-navigation-sides-offset': '10px',
  '--swiper-navigation-background-color': 'rgba(255, 255, 255, 0.5)',
  '--swiper-navigation-padding': '8px',
  '--swiper-navigation-border-radius': '50%',
};
const bootstrapBreakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
  xxxl: 1537,
};

const heroSwiper = ref(null);
const swiperEl1 = ref(null);
const swiperEl2 = ref(null);
const swiperEl3 = ref(null);
const swiperEl4 = ref(null);

const swiperEls = ref([]);

onMounted(async () => {
  const heroSwiperStyle = document.createElement('style');
  heroSwiperStyle.textContent = `
    .swiper .swiper-pagination {
      bottom: 32px;
    }
    .swiper .swiper-wrapper {
      min-width: 0;
    }
    .swiper .swiper-pagination {
      bottom: 32px;
    }

    .swiper .swiper-pagination-bullet {
      width: 32px;
      height: 4px;
      background-color: #f1eae4;
      border-radius: 100px;
      opacity: 1;
    }

    .swiper .swiper-pagination-bullet-active {
      width: 60px;
      background-color: #bf9d7d;
    }

    :host {
      --swiper-theme-color: #bf9d7d;
    }
  `;

  const swiperStyleTextContent = `
    .swiper .swiper-wrapper {
      min-width: 0;
    }
    .swiper .swiper-button-prev,
    .swiper .swiper-button-next {
      width: 56px;
      height: 56px;
      background-color: #ffffff;
      color: #4b4b4b;
      border-radius: 100px;
    }
    @media (max-width: ${bootstrapBreakpoints.md}px) {
      .swiper .swiper-button-prev,
      .swiper .swiper-button-next {
        display: none;
      }
    }
      

    .swiper .swiper-button-prev svg,
    .swiper .swiper-button-next svg {
      font-size: 40px;
    }

    .swiper .swiper-button-prev svg {
      display: inline-block;
      width: 1em;
      height: 1em;
      --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='m14 18l-6-6l6-6l1.4 1.4l-4.6 4.6l4.6 4.6z'/%3E%3C/svg%3E");
      background-color: currentColor;
      -webkit-mask-image: var(--svg);
      mask-image: var(--svg);
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-size: 100% 100%;
      mask-size: 100% 100%;
    }

    .swiper .swiper-button-next svg {
      display: inline-block;
      width: 1em;
      height: 1em;
      --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M12.6 12L8 7.4L9.4 6l6 6l-6 6L8 16.6z'/%3E%3C/svg%3E");
      background-color: currentColor;
      -webkit-mask-image: var(--svg);
      mask-image: var(--svg);
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-size: 100% 100%;
      mask-size: 100% 100%;
    }


    .swiper .swiper-pagination {
      bottom: 32px;
    }

    .swiper .swiper-pagination-bullet {
      width: 32px;
      height: 4px;
      background-color: #f1eae4;
      border-radius: 100px;
      opacity: 1;
    }

    .swiper .swiper-pagination-bullet-active {
      width: 60px;
      background-color: #bf9d7d;
    }

    :host {
      --swiper-theme-color: #bf9d7d;
    }
  `;
  swiperEls.value = [swiperEl1, swiperEl2, swiperEl3, swiperEl4];
 
  await nextTick();
  
  heroSwiper.value.shadowRoot.appendChild(heroSwiperStyle);

  swiperEls.value.forEach((swiperRef, index) => {
        if (!swiperRef) {
          console.error(`swiperEls[${index}] is not a valid DOM node.`);
          return;
        }

        const observer = new MutationObserver(() => {
          if (swiperRef.shadowRoot) {
            const styleElement = document.createElement('style');
            styleElement.textContent = swiperStyleTextContent;
            swiperRef.shadowRoot.appendChild(styleElement);
            observer.disconnect(); // 停止觀察
          }
        });

        observer.observe(swiperRef, { childList: true });
      });
});
</script>
<template>
  <main>
    <section class="hero position-relative">
      <swiper-container
        :slides-per-view="1"
        :pagination="true"
        :autoplay="{
          delay: 3000,
          disableOnInteraction: false,
        }"
        :scrollbar="true"
        class="swiper"
        :style="swiperStyles"
        ref="heroSwiper"
      >
        <swiper-slide v-for="(num, index) in slides" :key="index">
          <picture>
            <source srcset="/images/home-hero.png" media="(min-width:576px)" />
            <img
              class="hero-img"
              src="/images/home-hero-sm.png"
              alt="hero banner"
            />
          </picture>
        </swiper-slide>
      </swiper-container>

      <div
        class="hero-wrapper d-flex flex-column justify-content-center align-items-center flex-md-row gap-10 gap-md-20 w-100 position-absolute z-2"
      >
        <div
          class="d-flex flex-column align-items-center text-center d-md-block text-md-start"
        >
          <div class="mt-10 mb-5 mt-md-0 mb-md-10 text-primary-100 fw-bold">
            <h2 class="fw-semibold">享樂酒店</h2>
            <h5 class="fs-7 fs-md-5 fw-semibold">Enjoyment Luxury Hotel</h5>
          </div>
          <div class="deco-line" />
        </div>
        <h1 class="mb-0 text-neutral-0 fw-bold">客房旅宿</h1>
      </div>
    </section>

    <section class="py-10 py-md-30 bg-primary-10">
      <div class="container mb-md-12">
        <h4 class="mb-2 mb-md-4 fs-8 fs-md-6 fw-bold text-neutral-80">
          房型選擇
        </h4>
        <h2 class="mb-10 mb-md-20 fs-1 fw-bold text-primary-100">
          各種房型，任您挑選
        </h2>
        <ul class="d-flex flex-column gap-6 gap-md-12 list-unstyled">
          <li class="card flex-lg-row border-0 rounded-3xl overflow-hidden" v-for="(room, index) in rooms" :key="room._id">
            <div class="row">
              <div class="col-12 col-lg-7">
                <ClientOnly>
                  <swiper-container
                    :slides-per-view="1"
                    :navigation="true"
                    :pagination="{ clickable: true }"
                    :autoplay="{
                      delay: 2500,
                      disableOnInteraction: false,
                    }"
                    class="swiper"
                    :style="swiperStyles"
                    :ref="(el) => {
                      swiperEls[index] = el
                    }"
                  >
                    <swiper-slide v-for="(roomImage, index) in room.imageUrlList_" :key="index">
                      <picture>
                        <source
                          :srcset="roomImage.desktop"
                          media="(min-width: 768px)"
                        />
                        <img
                          class="w-100 object-fit-cover"
                          :src="roomImage.sm"
                          loading="lazy"
                          :alt="`room-${room.name}-${index}`"
                        />
                      </picture>
                    </swiper-slide>
                  </swiper-container>
                </ClientOnly>
              </div>
              <div class="col-12 col-lg-5">
                <div class="card-body pe-md-10 py-md-10">
                  <h3 class="card-title fs-2 fw-bold text-neutral-100">
                    {{ room.name }}
                  </h3>
                  <p
                    class="card-text mb-6 mb-md-10 fs-8 fs-md-7 fw-medium text-neutral-80"
                  >
                    {{ room.description }}
                  </p>
                  <ul class="d-flex gap-4 mb-6 mb-md-10 list-unstyled">
                    <li
                      class="card-info px-4 py-5 border border-primary-40 rounded-3"
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
                      class="card-info px-4 py-5 border border-primary-40 rounded-3"
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
                      class="card-info px-4 py-5 border border-primary-40 rounded-3"
                    >
                      <Icon
                        class="mb-2 fs-5 text-primary-100"
                        icon="ic:baseline-person"
                      />
                      <p class="mb-0 fw-bold text-neutral-80 text-nowrap">
                        {{ room.maxPeople }} 人
                      </p>
                    </li>
                  </ul>
                  <div class="deco-line w-100 mb-6 mb-md-10" />
                  <div
                    class="d-flex justify-content-between align-items-center fs-7 fs-md-5 text-primary-100"
                  >
                    <p class="mb-0 fw-bold">NT$ {{ room.price }}</p>
                    <NuxtLink
                      :to="`/rooms/${room._id}`"
                      class="icon-link icon-link-hover text-primary-100"
                    >
                      <Icon class="bi fs-5" icon="mdi:arrow-right" />
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>

<style lang="scss">
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

.hero img {
  width: 100%;
  height: 100vh;
  object-fit: cover;
  filter: brightness(40%);
}

.hero-wrapper {
  inset: 0;
}

.deco-line {
  width: 33vw;
  height: 2px;
  background-image: linear-gradient(to right, #be9c7c, #ffffff);
}

.hero .deco-line {
  @include media-breakpoint-down(md) {
    width: 2px;
    height: 83px;
    z-index: 1;
    background-image: linear-gradient(to bottom, #be9c7c, #fff);
    margin-bottom: 2.5rem;
  }
}

.rounded-3xl {
  border-radius: 1.25rem;
}

.card-info {
  width: 97px;
  height: 97px;
}

.swiper {
  display: grid;
}
</style>
