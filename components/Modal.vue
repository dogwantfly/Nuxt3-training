<script setup>
defineProps({
  isOpen: Boolean, // 傳入開關狀態
});

const emit = defineEmits(['update:isOpen']);

// 關閉 Modal
const closeModal = () => {
  emit('update:isOpen', false);
};

defineExpose({
  closeModal
});
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content bg-neutral-120 text-white">
        <slot></slot>
        <button @click="closeModal" class="btn btn-outline-primary-100 py-2 text-neutral-0 fw-bold">
          關閉
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}
.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}
</style>
