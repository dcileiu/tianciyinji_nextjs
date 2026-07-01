import { decryptWechatPayResource } from '../../../../lib/wechatPay.js'

function replySuccess(res) {
  return res.status(200).json({ code: 'SUCCESS', message: '成功' })
}

function replyFail(res, message = '失败') {
  return res.status(200).json({ code: 'FAIL', message })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const body = req.body || {}
    const resource = body.resource || {}
    if (!resource.ciphertext || !resource.nonce) {
      return replyFail(res, '参数不完整')
    }

    const payment = decryptWechatPayResource({
      associatedData: resource.associated_data || '',
      nonce: resource.nonce,
      ciphertext: resource.ciphertext
    })

    // Demo：仅打印解密结果。接入业务时在此判断 trade_state === 'SUCCESS' 并落库。
    console.log('[pay/native/notify] decrypted:', payment)

    return replySuccess(res)
  } catch (e) {
    console.error('[pay/native/notify]', e)
    return replyFail(res, e.message || 'Native 回调处理失败')
  }
}
