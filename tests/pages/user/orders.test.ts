import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockAxiosGet = vi.fn()
const mockAxiosPost = vi.fn()
const mockShowToast = vi.fn()
const mockModal = vi.fn()

mockNuxtImport('useNuxtApp', () => () => ({
  $axios: {
    get: mockAxiosGet,
    post: mockAxiosPost,
  },
  $showToast: mockShowToast,
  $bootstrap: { Modal: mockModal },
}))

const upcomingOrder = {
  _id: '676512ae9519e0b01d74c55a',
  checkInDate: '2099-12-01',
  checkOutDate: '2099-12-03',
  peopleNum: 2,
  status: 0,
  roomId: {
    name: '豪華雙人房',
    price: 3000,
    imageUrl: '/test.jpg',
    facilityInfo: [],
    amenityInfo: [],
  },
}

async function mountOrders(ordersData = [upcomingOrder]) {
  mockAxiosGet.mockImplementation((url: string) => {
    if (url === '/api/v1/orders') {
      return Promise.resolve({ data: { result: ordersData } })
    }
    if (url.includes('/payment-status')) {
      return Promise.resolve({
        data: { Status: 'SUCCESS', Result: { PaymentType: 'CREDIT', Amt: 3000 } },
      })
    }
    return Promise.reject(new Error(`unexpected GET ${url}`))
  })

  const OrdersPage = (await import('~/pages/user/orders/index.vue')).default
  const wrapper = mount(OrdersPage, { attachTo: document.body })
  await flushPromises()
  return wrapper
}

describe('orders page — cancel with new endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('calls POST /api/v1/orders/:id/cancel on confirm cancel (task 3.1)', async () => {
    mockAxiosPost.mockResolvedValue({ data: { success: true } })
    const wrapper = await mountOrders()

    const confirmBtn = wrapper.find('.modal-footer .btn-primary-100')
    await confirmBtn.trigger('click')
    await flushPromises()

    expect(mockAxiosPost).toHaveBeenCalledWith(
      `/api/v1/orders/${upcomingOrder._id}/cancel`
    )
  })

  it('shows API error message in toast on cancel failure (task 3.2)', async () => {
    mockAxiosPost.mockRejectedValue({
      response: { data: { error: '退款失敗：藍新錯誤' } },
    })
    const wrapper = await mountOrders()

    const confirmBtn = wrapper.find('.modal-footer .btn-primary-100')
    await confirmBtn.trigger('click')
    await flushPromises()

    expect(mockShowToast).toHaveBeenCalledWith(
      '退款失敗：藍新錯誤',
      expect.objectContaining({ variant: 'danger' })
    )
  })
})

describe('orders page — payment status on mount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = '<div id="cancelModal"></div>'
  })

  it('queries payment status for the upcoming order on mount (task 4.1)', async () => {
    await mountOrders([upcomingOrder])

    const paymentStatusCalls = (mockAxiosGet.mock.calls as string[][]).filter(
      ([url]) => url.includes('/payment-status')
    )
    expect(paymentStatusCalls.length).toBeGreaterThan(0)
    expect(paymentStatusCalls[0][0]).toBe(
      `/api/v1/orders/${upcomingOrder._id}/payment-status`
    )
  })

  it('does NOT query payment status when no upcoming orders (task 4.1)', async () => {
    const pastOrder = {
      ...upcomingOrder,
      checkInDate: '2020-01-01',
      checkOutDate: '2020-01-03',
    }
    await mountOrders([pastOrder])

    const paymentStatusCalls = (mockAxiosGet.mock.calls as string[][]).filter(
      ([url]) => url.includes('/payment-status')
    )
    expect(paymentStatusCalls).toHaveLength(0)
  })

  it('shows payment status section when query succeeds (task 4.2)', async () => {
    const wrapper = await mountOrders([upcomingOrder])
    expect(wrapper.html()).toContain('付款成功')
  })

  it('silently suppresses payment status errors — no toast shown (task 4.3)', async () => {
    mockAxiosGet.mockImplementation((url: string) => {
      if (url === '/api/v1/orders') {
        return Promise.resolve({ data: { result: [upcomingOrder] } })
      }
      if (url.includes('/payment-status')) {
        return Promise.reject(new Error('query failed'))
      }
      return Promise.reject(new Error(`unexpected GET ${url}`))
    })

    mount(
      (await import('~/pages/user/orders/index.vue')).default,
      { attachTo: document.body }
    )
    await flushPromises()

    expect(mockShowToast).not.toHaveBeenCalled()
  })
})
