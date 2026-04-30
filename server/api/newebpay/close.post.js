import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { MerchantOrderNo, Amt, CloseType, IndexType } = body

  if (!MerchantOrderNo || Amt === undefined || CloseType === undefined || IndexType === undefined) {
    throw createError({ statusCode: 400, message: 'MerchantOrderNo, Amt, CloseType and IndexType are required' })
  }

  const freyjaBase = process.env.NUXT_API_BASE_URL || 'http://localhost:3001'

  try {
    const result = await $fetch(`${freyjaBase}/newebpay_close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { MerchantOrderNo, Amt, CloseType, IndexType },
    })
    return result
  } catch (error) {
    const statusCode = error?.response?.status
    if (statusCode && statusCode >= 400 && statusCode < 500) {
      throw createError({ statusCode, message: error?.data?.error || 'Close failed' })
    }
    throw createError({ statusCode: 502, message: 'freyja service unavailable' })
  }
})
