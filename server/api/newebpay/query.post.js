import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { MerchantOrderNo, Amt } = body

  if (!MerchantOrderNo || Amt === undefined) {
    throw createError({ statusCode: 400, message: 'MerchantOrderNo and Amt are required' })
  }

  const freyjaBase = process.env.NUXT_API_BASE_URL || 'http://localhost:3001'

  try {
    const result = await $fetch(`${freyjaBase}/newebpay_query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { MerchantOrderNo, Amt },
    })
    return result
  } catch (error) {
    const statusCode = error?.response?.status
    if (statusCode && statusCode >= 400 && statusCode < 500) {
      throw createError({ statusCode, message: error?.data?.error || 'Query failed' })
    }
    throw createError({ statusCode: 502, message: 'freyja service unavailable' })
  }
})
