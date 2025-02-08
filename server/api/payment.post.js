// server/api/payment.post.js
import axios from 'axios'
import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  // 從請求中讀取資料 (包含 prime、amount、cardholder 等)
  const body = await readBody(event)

  // 可依需求做額外的參數驗證
  if (!body.prime) {
    return { error: '缺少 prime 值' }
  }


  const paymentData = {
    partner_key: process.env.TAPPAY_PARTNER_KEY, 
    prime: body.prime,
    amount: body.amount || "1",
    merchant_id: process.env.TAPPAY_MERCHANT_ID, 
    details: body.details || "Some item",
    cardholder: body.cardholder,
  }

  try {

    const response = await axios.post(
      'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime',
      paymentData,
      {
        headers: {
          'content-type': 'application/json',
          'x-api-key': process.env.TAPPAY_PARTNER_KEY
        }
      }
    )

    return response.data
  } catch (error) {
    console.error("TapPay API 呼叫錯誤:", error)
    return { error: error.message }
  }
})
