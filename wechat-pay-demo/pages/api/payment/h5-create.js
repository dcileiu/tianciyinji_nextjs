import { getPayConfig, randomStr, wechatPayRequest } from '../../../lib/wechatPay.js'
import {
  appendH5RedirectUrl,
  buildH5OrderPayload,
  formatFenAsYuan,
  normalizeClientIp
} from '../../../lib/paymentHelpers.mjs'
import {
  getClientIp,
  getH5AppUrl,
  getH5NotifyUrl,
  getH5RedirectUrl,
  rejectUnauthorized,
  verifyApiSecret
} from '../../../lib/requestUtils.mjs'

function buildOutTradeNo() {
  const ts = Date.now()
  const suffix = randomStr(8).toUpperCase()
  return `H5${ts}${suffix}`
}

export default async function handler(req, res) {
  if (!verifyApiSecret(req)) {
    return rejectUnauthorized(res)
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const total = Number(req.body?.amountFen)
    if (!Number.isInteger(total) || total < 1) {
      return res.status(400).json({ success: false, error: 'amountFen 必须为大于 0 的整数（单位：分）' })
    }

    const { appid, mchid } = getPayConfig()
    const outTradeNo = buildOutTradeNo()
    const clientIp = normalizeClientIp(getClientIp(req))
    const appUrl = getH5AppUrl(req)
    const notifyUrl = getH5NotifyUrl(req)
    const redirectUrl = getH5RedirectUrl(req, outTradeNo)
    const payload = buildH5OrderPayload({
      appid,
      mchid,
      notifyUrl,
      amountFen: total,
      clientIp,
      appUrl,
      outTradeNo
    })

    const data = await wechatPayRequest({
      method: 'POST',
      canonicalUrl: '/v3/pay/transactions/h5',
      body: JSON.stringify(payload)
    })

    if (!data?.h5_url) {
      throw new Error('微信返回 h5_url 为空')
    }

    const h5Url = appendH5RedirectUrl({
      h5Url: data.h5_url,
      redirectUrl
    })

    return res.json({
      success: true,
      outTradeNo,
      h5Url,
      rawH5Url: data.h5_url,
      amountFen: total,
      amountYuan: formatFenAsYuan(total),
      clientIp,
      appUrl,
      notifyUrl,
      redirectUrl
    })
  } catch (e) {
    console.error('[payment/h5-create]', e)
    return res.status(500).json({
      success: false,
      error: e.message || '创建 H5 支付订单失败'
    })
  }
}
