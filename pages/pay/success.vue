<template>
    <main class="overflow-hidden pt-18 pt-md-30 bg-neutral-120">
    <div class="container py-10 py-md-30 text-neutral-0">
        <h1>付款成功！</h1>
         <div class="d-flex flex-column align-items-md-start">
            <h2 class="mb-6 mb-md-10 text-neutral-0 fs-7 fs-md-5 fw-bold">
              立即查看您的訂單紀錄
            </h2>
            <button
              class="btn btn-primary-100 px-md-15 py-4 text-neutral-0 fw-bold border-0 rounded-3"
              type="button"
              @click="navigateTo('/user/orders')"
            >
              前往我的訂單
            </button>
          </div>
    </div>
    </main>
</template>