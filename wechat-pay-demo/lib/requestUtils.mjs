function firstHeaderValue(value) {
  if (Array.isArray(value)) return value[0] || ''
  return String(value || '')
}

function getRequestBaseUrl(req) {
  const origin = firstHeaderValue(req.headers.origin)
  if (origin) {
    return origin.replace(/\/$/, '')
  }

  const forwardedProto = firstHeaderValue(req.headers['x-forwarded-proto']).split(',')[0]?.trim()
  const host = firstHeaderValue(req.headers['x-forwarded-host']) || firstHeaderValue(req.headers.host)
  const proto = forwardedProto || (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https')

  return host ? `${proto}://${host}` : 'http://localhost:3000'
}

function getClientIp(req) {
  const forwardedFor = firstHeaderValue(req.headers['x-forwarded-for'])
  const firstForwardedIp = forwardedFor.split(',')[0]?.trim()
  const realIp = firstHeaderValue(req.headers['x-real-ip'])
  const socketIp = req.socket?.remoteAddress || ''
  return firstForwardedIp || realIp || socketIp
}

function getH5AppUrl(req) {
  if (process.env.WECHAT_PAY_H5_APP_URL) {
    return process.env.WECHAT_PAY_H5_APP_URL
  }
  return getRequestBaseUrl(req)
}

function getH5NotifyUrl(req) {
  if (process.env.WECHAT_PAY_H5_NOTIFY_URL) {
    return process.env.WECHAT_PAY_H5_NOTIFY_URL
  }
  return `${getRequestBaseUrl(req)}/api/pay/h5/notify`
}

function getNativeNotifyUrl(req) {
  if (process.env.WECHAT_PAY_NATIVE_NOTIFY_URL) {
    return process.env.WECHAT_PAY_NATIVE_NOTIFY_URL
  }
  return `${getRequestBaseUrl(req)}/api/pay/native/notify`
}

function getH5RedirectUrl(req, outTradeNo) {
  const baseUrl = getRequestBaseUrl(req)
  return `${baseUrl}/pay/h5/result?outTradeNo=${encodeURIComponent(outTradeNo)}`
}

function verifyApiSecret(req) {
  const secret = process.env.PAY_DEMO_API_SECRET
  if (!secret) return true
  return firstHeaderValue(req.headers['x-api-secret']) === secret
}

function rejectUnauthorized(res) {
  return res.status(401).json({ success: false, error: '未授权，请检查 x-api-secret' })
}

export {
  firstHeaderValue,
  getRequestBaseUrl,
  getClientIp,
  getH5AppUrl,
  getH5NotifyUrl,
  getNativeNotifyUrl,
  getH5RedirectUrl,
  verifyApiSecret,
  rejectUnauthorized
}
