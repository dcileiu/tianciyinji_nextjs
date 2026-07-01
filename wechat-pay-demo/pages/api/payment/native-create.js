import QRCode from 'qrcode'
import { getPayConfig, randomStr, wechatPayRequest } from '../../../lib/wechatPay.js'
import {
  buildNativeOrderPayload,
  formatFenAsYuan
} from '../../../lib/paymentHelpers.mjs'
import {
  getNativeNotifyUrl,
  rejectUnauthorized,
  verifyApiSecret
} from '../../../lib/requestUtils.mjs'

function buildOutTradeNo() {
  const ts = Date.now()
  const suffix = randomStr(8).toUpperCase()
  return `NT${ts}${suffix}`
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
    const notifyUrl = getNativeNotifyUrl(req)
    const payload = buildNativeOrderPayload({
      appid,
      mchid,
      notifyUrl,
      amountFen: total,
      outTradeNo
    })

    const data = await wechatPayRequest({
      method: 'POST',
      canonicalUrl: '/v3/pay/transactions/native',
      body: JSON.stringify(payload)
    })

    if (!data?.code_url) {
      throw new Error('微信返回 code_url 为空')
    }

    const qrDataUrl = await QRCode.toDataURL(data.code_url, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 240
    })

    return res.json({
      success: true,
      outTradeNo,
      codeUrl: data.code_url,
      qrDataUrl,
      amountFen: total,
      amountYuan: formatFenAsYuan(total),
      notifyUrl
    })
  } catch (e) {
    console.error('[payment/native-create]', e)
    return res.status(500).json({
      success: false,
      error: e.message || '创建 Native 支付订单失败'
    })
  }
}
