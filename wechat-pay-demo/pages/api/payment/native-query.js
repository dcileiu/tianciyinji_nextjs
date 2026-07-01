import { getPayConfig, wechatPayRequest } from '../../../lib/wechatPay.js'
import { rejectUnauthorized, verifyApiSecret } from '../../../lib/requestUtils.mjs'

export default async function handler(req, res) {
  if (!verifyApiSecret(req)) {
    return rejectUnauthorized(res)
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { outTradeNo } = req.body || {}
    if (!outTradeNo || typeof outTradeNo !== 'string') {
      return res.status(400).json({ success: false, error: '缺少 outTradeNo' })
    }

    const { mchid } = getPayConfig()
    const encodedOutTradeNo = encodeURIComponent(outTradeNo)
    const canonicalUrl = `/v3/pay/transactions/out-trade-no/${encodedOutTradeNo}?mchid=${encodeURIComponent(mchid)}`
    const data = await wechatPayRequest({
      method: 'GET',
      canonicalUrl
    })

    return res.json({
      success: true,
      outTradeNo,
      tradeState: data?.trade_state || '',
      tradeStateDesc: data?.trade_state_desc || '',
      transactionId: data?.transaction_id || '',
      amountFen: data?.amount?.total || 0,
      payerOpenid: data?.payer?.openid || '',
      message: data?.trade_state === 'SUCCESS' ? '支付成功' : (data?.trade_state_desc || '订单状态待确认')
    })
  } catch (e) {
    console.error('[payment/native-query]', e)
    return res.status(500).json({
      success: false,
      error: e.message || '查询 Native 支付订单失败'
    })
  }
}
