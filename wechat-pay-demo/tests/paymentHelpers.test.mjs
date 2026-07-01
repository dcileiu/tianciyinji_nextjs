import test from 'node:test'
import assert from 'node:assert/strict'

import {
  appendH5RedirectUrl,
  buildH5CreateOrderPayload,
  buildH5OrderPayload,
  buildNativeCreateOrderPayload,
  buildNativeOrderPayload,
  formatFenAsYuan,
  parseYuanToFen,
} from '../lib/paymentHelpers.mjs'

test('parseYuanToFen converts yuan input to integer fen', () => {
  assert.equal(parseYuanToFen('9.90').amountFen, 990)
  assert.equal(parseYuanToFen('0.01').amountFen, 1)
  assert.equal(parseYuanToFen('18').amountFen, 1800)
})

test('parseYuanToFen rejects invalid or zero amount input', () => {
  assert.equal(parseYuanToFen('').error, '请输入测试金额')
  assert.equal(parseYuanToFen('0').error, '金额必须大于 0')
  assert.equal(parseYuanToFen('abc').error, '金额格式无效')
  assert.equal(parseYuanToFen('1.234').error, '最多只能输入两位小数')
})

test('buildH5CreateOrderPayload returns create API body', () => {
  assert.deepEqual(buildH5CreateOrderPayload({ amountInput: '1.23' }), {
    payload: { amountFen: 123 },
    error: ''
  })
})

test('buildNativeCreateOrderPayload returns create API body', () => {
  assert.deepEqual(buildNativeCreateOrderPayload({ amountInput: '2.34' }), {
    payload: { amountFen: 234 },
    error: ''
  })
})

test('buildNativeOrderPayload returns WeChat Pay Native payload', () => {
  assert.deepEqual(buildNativeOrderPayload({
    appid: 'wx-test-appid',
    mchid: '1900000109',
    notifyUrl: 'https://example.com/api/pay/native/notify',
    amountFen: 234,
    outTradeNo: 'NT17000000000000ABCDEF',
    description: 'Native测试'
  }), {
    appid: 'wx-test-appid',
    mchid: '1900000109',
    description: 'Native测试',
    out_trade_no: 'NT17000000000000ABCDEF',
    notify_url: 'https://example.com/api/pay/native/notify',
    amount: {
      total: 234,
      currency: 'CNY'
    }
  })
})

test('buildH5OrderPayload returns WeChat Pay H5 payload', () => {
  assert.deepEqual(buildH5OrderPayload({
    appid: 'wx-test-appid',
    mchid: '1900000109',
    notifyUrl: 'https://example.com/api/pay/h5/notify',
    amountFen: 123,
    clientIp: '203.0.113.10',
    appUrl: 'https://example.com/',
    outTradeNo: 'H51700000000000ABCDEF',
    description: 'H5测试'
  }), {
    appid: 'wx-test-appid',
    mchid: '1900000109',
    description: 'H5测试',
    out_trade_no: 'H51700000000000ABCDEF',
    notify_url: 'https://example.com/api/pay/h5/notify',
    amount: {
      total: 123,
      currency: 'CNY'
    },
    scene_info: {
      payer_client_ip: '203.0.113.10',
      h5_info: {
        type: 'Wap',
        app_name: '微信支付Demo',
        app_url: 'https://example.com/'
      }
    }
  })
})

test('appendH5RedirectUrl adds return page to h5_url', () => {
  const h5Url = appendH5RedirectUrl({
    h5Url: 'https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?prepay_id=abc',
    redirectUrl: 'https://example.com/pay/h5/result?outTradeNo=H5123'
  })

  assert.equal(
    h5Url,
    'https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?prepay_id=abc&redirect_url=https%3A%2F%2Fexample.com%2Fpay%2Fh5%2Fresult%3FoutTradeNo%3DH5123'
  )
})

test('formatFenAsYuan renders fixed two-decimal yuan labels', () => {
  assert.equal(formatFenAsYuan(1), '0.01')
  assert.equal(formatFenAsYuan(990), '9.90')
})
