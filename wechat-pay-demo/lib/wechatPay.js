import crypto from 'crypto'

const WECHAT_PAY_BASE = 'https://api.mch.weixin.qq.com'

function randomStr(len = 32) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let out = ''
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

function normalizePrivateKey(raw = '') {
  if (!raw) return ''
  return raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw
}

function getPayConfig() {
  const appid = process.env.WECHAT_APPID
  const mchid = process.env.WECHAT_MCH_ID
  const serialNo = process.env.WECHAT_PAY_SERIAL_NO
  const privateKey = normalizePrivateKey(process.env.WECHAT_PAY_PRIVATE_KEY || '')
  const notifyUrl = process.env.WECHAT_PAY_NOTIFY_URL

  if (!appid || !mchid || !serialNo || !privateKey || !notifyUrl) {
    throw new Error('微信支付配置不完整，请检查 WECHAT_APPID / WECHAT_MCH_ID / WECHAT_PAY_SERIAL_NO / WECHAT_PAY_PRIVATE_KEY / WECHAT_PAY_NOTIFY_URL')
  }

  return { appid, mchid, serialNo, privateKey, notifyUrl }
}

function getApiV3Key() {
  const key = process.env.WECHAT_PAY_API_V3_KEY || ''
  if (!key) {
    throw new Error('缺少 WECHAT_PAY_API_V3_KEY，无法解密微信支付回调')
  }
  if (Buffer.byteLength(key, 'utf8') !== 32) {
    throw new Error('WECHAT_PAY_API_V3_KEY 长度必须为 32 字节')
  }
  return key
}

function signWithMerchantKey(message, privateKey) {
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(message)
  sign.end()
  return sign.sign(privateKey, 'base64')
}

function buildAuthorization({ method, canonicalUrl, body = '', mchid, serialNo, privateKey }) {
  const nonceStr = randomStr(32)
  const timestamp = String(Math.floor(Date.now() / 1000))
  const message = `${method}\n${canonicalUrl}\n${timestamp}\n${nonceStr}\n${body}\n`
  const signature = signWithMerchantKey(message, privateKey)

  return `WECHATPAY2-SHA256-RSA2048 mchid="${mchid}",nonce_str="${nonceStr}",timestamp="${timestamp}",serial_no="${serialNo}",signature="${signature}"`
}

async function wechatPayRequest({ method, canonicalUrl, body = '' }) {
  const { mchid, serialNo, privateKey } = getPayConfig()
  const authorization = buildAuthorization({
    method,
    canonicalUrl,
    body,
    mchid,
    serialNo,
    privateKey
  })

  const url = `${WECHAT_PAY_BASE}${canonicalUrl}`
  const res = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authorization
    },
    body: method === 'GET' ? undefined : body
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.message || data?.detail || `HTTP ${res.status}`
    throw new Error(`微信支付请求失败: ${msg}`)
  }
  return data
}

function decryptWechatPayResource({ associatedData = '', nonce = '', ciphertext = '' }) {
  const apiV3Key = getApiV3Key()
  const data = Buffer.from(ciphertext, 'base64')
  const authTag = data.subarray(data.length - 16)
  const encrypted = data.subarray(0, data.length - 16)
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(apiV3Key, 'utf8'), Buffer.from(nonce, 'utf8'))

  if (associatedData) {
    decipher.setAAD(Buffer.from(associatedData, 'utf8'))
  }
  decipher.setAuthTag(authTag)

  const decoded = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
  return JSON.parse(decoded)
}

export {
  getPayConfig,
  getApiV3Key,
  randomStr,
  wechatPayRequest,
  decryptWechatPayResource
}
