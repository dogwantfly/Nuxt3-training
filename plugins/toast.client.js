import { Toast } from 'bootstrap';

export default defineNuxtPlugin(() => {
  const showToast = (message, options = {}) => {
    // 動態創建 Toast 容器
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container position-fixed top-0 end-0 p-3';
      container.style.zIndex = 1055;
      document.body.appendChild(container);
    }

    // 創建 Toast 元素
    const toastElement = document.createElement('div');
    toastElement.className = `toast align-items-center text-bg-${options.variant || 'primary'} border-0`;
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');
    toastElement.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    // 添加到容器
    container.appendChild(toastElement);

    // 初始化 Bootstrap Toast
    const toast = new Toast(toastElement, {
      animation: true,
      autohide: true,
      delay: options.delay || 3000,
    });

    // 顯示並清理
    toast.show();
    toastElement.addEventListener('hidden.bs.toast', () => {
      toastElement.remove();
    });
  };

  return {
    provide: {
      showToast,
    },
  };
});
