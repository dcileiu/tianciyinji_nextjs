function getAppName() {
  return process.env.WECHAT_PAY_APP_NAME || '微信支付Demo'
}

function getH5Description() {
  return process.env.WECHAT_PAY_H5_DESCRIPTION || 'H5支付测试'
}

function getNativeDescription() {
  return process.env.WECHAT_PAY_NATIVE_DESCRIPTION || 'Native扫码支付测试'
}

function parseYuanToFen(input) {
  const raw = String(input || '').trim()

  if (!raw) {
    return { amountFen: 0, error: '请输入测试金额' }
  }

  if (!/^\d+(\.\d+)?$/.test(raw)) {
    return { amountFen: 0, error: '金额格式无效' }
  }

  if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
    return { amountFen: 0, error: '最多只能输入两位小数' }
  }

  const amount = Number(raw)
  if (!Number.isFinite(amount)) {
    return { amountFen: 0, error: '金额格式无效' }
  }

  const amountFen = Math.round(amount * 100)
  if (amountFen < 1) {
    return { amountFen: 0, error: '金额必须大于 0' }
  }

  return { amountFen, error: '' }
}

function formatFenAsYuan(amountFen) {
  const fen = Number(amountFen)
  if (!Number.isFinite(fen)) return '0.00'
  return (fen / 100).toFixed(2)
}

function buildH5CreateOrderPayload({ amountInput }) {
  const amountResult = parseYuanToFen(amountInput)
  if (amountResult.error) {
    return { payload: null, error: amountResult.error }
  }

  return {
    payload: { amountFen: amountResult.amountFen },
    error: ''
  }
}

function buildNativeCreateOrderPayload({ amountInput }) {
  const amountResult = parseYuanToFen(amountInput)
  if (amountResult.error) {
    return { payload: null, error: amountResult.error }
  }

  return {
    payload: { amountFen: amountResult.amountFen },
    error: ''
  }
}

function normalizeClientIp(rawIp) {
  const ip = String(rawIp || '').trim()
  if (!ip || ip === '::1') return '127.0.0.1'
  if (ip.startsWith('::ffff:')) return ip.slice('::ffff:'.length)
  return ip
}

function buildNativeOrderPayload({
  appid,
  mchid,
  notifyUrl,
  amountFen,
  outTradeNo,
  description = getNativeDescription()
}) {
  return {
    appid,
    mchid,
    description,
    out_trade_no: outTradeNo,
    notify_url: notifyUrl,
    amount: {
      total: amountFen,
      currency: 'CNY'
    }
  }
}

function buildH5OrderPayload({
  appid,
  mchid,
  notifyUrl,
  amountFen,
  clientIp,
  appUrl,
  outTradeNo,
  description = getH5Description()
}) {
  return {
    appid,
    mchid,
    description,
    out_trade_no: outTradeNo,
    notify_url: notifyUrl,
    amount: {
      total: amountFen,
      currency: 'CNY'
    },
    scene_info: {
      payer_client_ip: normalizeClientIp(clientIp),
      h5_info: {
        type: 'Wap',
        app_name: getAppName(),
        app_url: appUrl
      }
    }
  }
}

function appendH5RedirectUrl({ h5Url, redirectUrl }) {
  if (!h5Url || !redirectUrl) return h5Url || ''

  const url = new URL(h5Url)
  url.searchParams.set('redirect_url', redirectUrl)
  return url.toString()
}

export {
  appendH5RedirectUrl,
  buildH5CreateOrderPayload,
  buildH5OrderPayload,
  buildNativeCreateOrderPayload,
  buildNativeOrderPayload,
  formatFenAsYuan,
  getAppName,
  getH5Description,
  getNativeDescription,
  normalizeClientIp,
  parseYuanToFen
}
