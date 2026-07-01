import { useMemo, useState } from 'react'
import {
  buildH5CreateOrderPayload,
  buildNativeCreateOrderPayload,
  formatFenAsYuan,
  parseYuanToFen
} from '../lib/paymentHelpers.mjs'

const tradeStateText = {
  SUCCESS: '支付成功',
  REFUND: '转入退款',
  NOTPAY: '未支付',
  CLOSED: '已关闭',
  REVOKED: '已撤销',
  USERPAYING: '支付中',
  PAYERROR: '支付失败'
}

function formatJson(value) {
  if (!value) return ''
  return JSON.stringify(value, null, 2)
}

async function postJson(url, body) {
  const headers = { 'Content-Type': 'application/json' }
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(body)
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok || !data.success) {
    throw new Error(data.error || `请求失败：HTTP ${response.status}`)
  }

  return data
}

export default function PaymentDemo() {
  const [amountInput, setAmountInput] = useState('0.01')
  const [outTradeNoInput, setOutTradeNoInput] = useState('')
  const [nativeAmountInput, setNativeAmountInput] = useState('0.01')
  const [nativeOutTradeNoInput, setNativeOutTradeNoInput] = useState('')
  const [creating, setCreating] = useState(false)
  const [querying, setQuerying] = useState(false)
  const [nativeCreating, setNativeCreating] = useState(false)
  const [nativeQuerying, setNativeQuerying] = useState(false)
  const [formError, setFormError] = useState('')
  const [nativeFormError, setNativeFormError] = useState('')
  const [createResult, setCreateResult] = useState(null)
  const [queryResult, setQueryResult] = useState(null)
  const [nativeCreateResult, setNativeCreateResult] = useState(null)
  const [nativeQueryResult, setNativeQueryResult] = useState(null)
  const [copyTip, setCopyTip] = useState('')

  const amountPreview = useMemo(() => {
    const parsed = parseYuanToFen(amountInput)
    if (parsed.error) return ''
    return `${parsed.amountFen} 分 / ${formatFenAsYuan(parsed.amountFen)} 元`
  }, [amountInput])

  const nativeAmountPreview = useMemo(() => {
    const parsed = parseYuanToFen(nativeAmountInput)
    if (parsed.error) return ''
    return `${parsed.amountFen} 分 / ${formatFenAsYuan(parsed.amountFen)} 元`
  }, [nativeAmountInput])

  const createOrder = async () => {
    const { payload, error } = buildH5CreateOrderPayload({ amountInput })
    if (error) {
      setFormError(error)
      return
    }

    try {
      setCreating(true)
      setFormError('')
      setCreateResult(null)
      setQueryResult(null)
      const data = await postJson('/api/payment/h5-create', payload)
      setCreateResult(data)
      setOutTradeNoInput(data.outTradeNo || '')
    } catch (error) {
      setFormError(error.message || '创建 H5 支付订单失败')
    } finally {
      setCreating(false)
    }
  }

  const queryOrder = async () => {
    const outTradeNo = String(outTradeNoInput || '').trim()
    if (!outTradeNo) {
      setFormError('请输入商户订单号')
      return
    }

    try {
      setQuerying(true)
      setFormError('')
      const data = await postJson('/api/payment/h5-query', { outTradeNo })
      setQueryResult(data)
    } catch (error) {
      setFormError(error.message || '查询订单失败')
    } finally {
      setQuerying(false)
    }
  }

  const createNativeOrder = async () => {
    const { payload, error } = buildNativeCreateOrderPayload({ amountInput: nativeAmountInput })
    if (error) {
      setNativeFormError(error)
      return
    }

    try {
      setNativeCreating(true)
      setNativeFormError('')
      setNativeCreateResult(null)
      setNativeQueryResult(null)
      const data = await postJson('/api/payment/native-create', payload)
      setNativeCreateResult(data)
      setNativeOutTradeNoInput(data.outTradeNo || '')
    } catch (error) {
      setNativeFormError(error.message || '创建 Native 支付订单失败')
    } finally {
      setNativeCreating(false)
    }
  }

  const queryNativeOrder = async () => {
    const outTradeNo = String(nativeOutTradeNoInput || '').trim()
    if (!outTradeNo) {
      setNativeFormError('请输入商户订单号')
      return
    }

    try {
      setNativeQuerying(true)
      setNativeFormError('')
      const data = await postJson('/api/payment/native-query', { outTradeNo })
      setNativeQueryResult(data)
    } catch (error) {
      setNativeFormError(error.message || '查询 Native 订单失败')
    } finally {
      setNativeQuerying(false)
    }
  }

  const copyText = async (text, label) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopyTip(`${label}已复制`)
      window.setTimeout(() => setCopyTip(''), 1800)
    } catch {
      setCopyTip('复制失败，请手动选择内容')
    }
  }

  const openH5Url = () => {
    if (!createResult?.h5Url) return
    window.open(createResult.h5Url, '_blank', 'noopener,noreferrer')
  }

  const queryState = queryResult?.tradeState || ''
  const stateLabel = tradeStateText[queryState] || queryResult?.tradeStateDesc || '暂无状态'
  const nativeQueryState = nativeQueryResult?.tradeState || ''
  const nativeStateLabel = tradeStateText[nativeQueryState] || nativeQueryResult?.tradeStateDesc || '暂无状态'

  return (
    <div className="layout">
      <header className="hero">
        <h1>微信支付 Demo</h1>
        <p>H5 支付 + Native 扫码支付（API v3），可直接复制到其他 Next.js 项目使用。</p>
      </header>

      <div className="payment-grid">
        <div className="card">
          <div className="section-title">
            <div>
              <h3>创建 H5 支付订单</h3>
              <p>创建成功后会返回 h5_url，建议在手机浏览器打开。</p>
            </div>
            {amountPreview ? <span className="amount-pill">{amountPreview}</span> : null}
          </div>

          <div className="form-grid">
            <label>
              <span>测试金额（元）</span>
              <input
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="0.01"
                inputMode="decimal"
              />
            </label>

            {formError ? <div className="alert error">{formError}</div> : null}
            {copyTip ? <div className="alert success">{copyTip}</div> : null}

            <div className="btn-row">
              <button type="button" onClick={createOrder} disabled={creating}>
                {creating ? '创建中...' : '创建 H5 支付链接'}
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  setCreateResult(null)
                  setQueryResult(null)
                  setFormError('')
                }}
              >
                清空结果
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-title">
            <div>
              <h3>查询 H5 订单</h3>
              <p>支付完成或取消后，用商户订单号查询微信侧交易状态。</p>
            </div>
            <span className={`status-badge ${queryState ? queryState.toLowerCase() : 'empty'}`}>
              {stateLabel}
            </span>
          </div>

          <div className="form-grid">
            <label>
              <span>商户订单号</span>
              <input
                value={outTradeNoInput}
                onChange={(e) => setOutTradeNoInput(e.target.value)}
                placeholder="H5..."
                spellCheck="false"
              />
            </label>

            <div className="btn-row">
              <button type="button" onClick={queryOrder} disabled={querying}>
                {querying ? '查询中...' : '查询状态'}
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => copyText(outTradeNoInput, '商户订单号')}
                disabled={!outTradeNoInput}
              >
                复制订单号
              </button>
            </div>
          </div>
        </div>
      </div>

      {createResult ? (
        <div className="card result-card">
          <div className="section-title">
            <div>
              <h3>H5 下单返回</h3>
              <p>PC 浏览器可能无法拉起微信支付，请用手机浏览器打开。</p>
            </div>
            <div className="btn-row">
              <button type="button" onClick={openH5Url} disabled={!createResult.h5Url}>
                打开支付页
              </button>
              <button type="button" className="ghost" onClick={() => copyText(createResult.h5Url, 'H5 支付链接')}>
                复制链接
              </button>
            </div>
          </div>

          <div className="summary-grid">
            <div><span>商户订单号</span><strong>{createResult.outTradeNo || '-'}</strong></div>
            <div><span>金额</span><strong>{createResult.amountYuan || '-'} 元</strong></div>
            <div><span>回调 API</span><strong>{createResult.notifyUrl || '-'}</strong></div>
            <div><span>返回页</span><strong>{createResult.redirectUrl || '-'}</strong></div>
          </div>

          <label className="url-field">
            <span>h5_url</span>
            <textarea readOnly rows={3} value={createResult.h5Url || ''} />
          </label>
          <pre>{formatJson(createResult)}</pre>
        </div>
      ) : null}

      {queryResult ? (
        <div className="card result-card">
          <div className="section-title">
            <div><h3>H5 查询返回</h3><p>{queryResult.message || ''}</p></div>
          </div>
          <pre>{formatJson(queryResult)}</pre>
        </div>
      ) : null}

      <div className="payment-grid">
        <div className="card">
          <div className="section-title">
            <div>
              <h3>创建 Native 支付订单</h3>
              <p>电脑网页扫码支付，创建成功后用手机微信扫描二维码。</p>
            </div>
            {nativeAmountPreview ? <span className="amount-pill">{nativeAmountPreview}</span> : null}
          </div>

          <div className="form-grid">
            <label>
              <span>测试金额（元）</span>
              <input
                value={nativeAmountInput}
                onChange={(e) => setNativeAmountInput(e.target.value)}
                placeholder="0.01"
                inputMode="decimal"
              />
            </label>

            {nativeFormError ? <div className="alert error">{nativeFormError}</div> : null}

            <div className="btn-row">
              <button type="button" onClick={createNativeOrder} disabled={nativeCreating}>
                {nativeCreating ? '创建中...' : '创建 Native 二维码'}
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  setNativeCreateResult(null)
                  setNativeQueryResult(null)
                  setNativeFormError('')
                }}
              >
                清空结果
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-title">
            <div>
              <h3>查询 Native 订单</h3>
              <p>扫码支付完成后，用商户订单号查询微信侧交易状态。</p>
            </div>
            <span className={`status-badge ${nativeQueryState ? nativeQueryState.toLowerCase() : 'empty'}`}>
              {nativeStateLabel}
            </span>
          </div>

          <div className="form-grid">
            <label>
              <span>商户订单号</span>
              <input
                value={nativeOutTradeNoInput}
                onChange={(e) => setNativeOutTradeNoInput(e.target.value)}
                placeholder="NT..."
                spellCheck="false"
              />
            </label>

            <div className="btn-row">
              <button type="button" onClick={queryNativeOrder} disabled={nativeQuerying}>
                {nativeQuerying ? '查询中...' : '查询状态'}
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => copyText(nativeOutTradeNoInput, 'Native 商户订单号')}
                disabled={!nativeOutTradeNoInput}
              >
                复制订单号
              </button>
            </div>
          </div>
        </div>
      </div>

      {nativeCreateResult ? (
        <div className="card result-card">
          <div className="section-title">
            <div><h3>Native 下单返回</h3><p>用手机微信扫一扫二维码完成支付。</p></div>
          </div>

          <div className="native-result-layout">
            <div className="qr-panel">
              {nativeCreateResult.qrDataUrl ? (
                <img className="qr-image" src={nativeCreateResult.qrDataUrl} alt="Native 支付二维码" />
              ) : null}
              <span>微信扫码支付</span>
            </div>
            <div className="summary-grid native-summary">
              <div><span>商户订单号</span><strong>{nativeCreateResult.outTradeNo || '-'}</strong></div>
              <div><span>金额</span><strong>{nativeCreateResult.amountYuan || '-'} 元</strong></div>
              <div><span>回调 API</span><strong>{nativeCreateResult.notifyUrl || '-'}</strong></div>
            </div>
          </div>
          <pre>{formatJson(nativeCreateResult)}</pre>
        </div>
      ) : null}

      {nativeQueryResult ? (
        <div className="card result-card">
          <div className="section-title">
            <div><h3>Native 查询返回</h3><p>{nativeQueryResult.message || ''}</p></div>
          </div>
          <pre>{formatJson(nativeQueryResult)}</pre>
        </div>
      ) : null}

      <div className="card note-card">
        <h3>API 路由</h3>
        <div className="api-list">
          <code>POST /api/payment/h5-create</code>
          <code>POST /api/payment/h5-query</code>
          <code>POST /api/payment/native-create</code>
          <code>POST /api/payment/native-query</code>
          <code>POST /api/pay/h5/notify</code>
          <code>POST /api/pay/native/notify</code>
        </div>
        <h3 style={{ marginTop: 20 }}>环境变量</h3>
        <div className="note-grid">
          <span>WECHAT_APPID</span>
          <span>WECHAT_MCH_ID</span>
          <span>WECHAT_PAY_SERIAL_NO</span>
          <span>WECHAT_PAY_PRIVATE_KEY</span>
          <span>WECHAT_PAY_API_V3_KEY</span>
          <span>WECHAT_PAY_NOTIFY_URL</span>
        </div>
      </div>

      <style jsx>{`
        .layout {
          max-width: 1100px;
          margin: 0 auto;
          padding: 32px 20px 48px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #1e293b;
        }

        .hero h1 { margin: 0; font-size: 28px; }
        .hero p { margin: 8px 0 28px; color: #64748b; }

        .payment-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .section-title {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }

        .section-title h3 { margin: 0; font-size: 18px; }
        .section-title p { margin: 6px 0 0; color: #64748b; font-size: 14px; line-height: 1.5; }

        .form-grid { display: grid; gap: 12px; }
        label { display: grid; gap: 6px; }
        label span { font-size: 13px; font-weight: 700; color: #334155; }

        input, textarea {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 14px;
          box-sizing: border-box;
        }

        .btn-row { display: flex; gap: 8px; flex-wrap: wrap; }

        button {
          border: 1px solid #d1d5db;
          background: #09090b;
          color: #fff;
          border-radius: 8px;
          padding: 8px 14px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
        }

        button.ghost { background: #fff; color: #334155; }
        button:disabled { opacity: 0.6; cursor: not-allowed; }

        .alert { border-radius: 10px; padding: 10px 12px; font-size: 14px; }
        .alert.error { background: #fee2e2; color: #991b1b; }
        .alert.success { background: #dcfce7; color: #166534; }

        .amount-pill, .status-badge {
          display: inline-flex;
          align-items: center;
          min-height: 28px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .amount-pill { background: #eef2ff; color: #3730a3; }
        .status-badge { background: #f1f5f9; color: #475569; }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .summary-grid div {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px;
        }

        .summary-grid span { display: block; color: #64748b; font-size: 12px; margin-bottom: 6px; }
        .summary-grid strong { display: block; font-size: 14px; word-break: break-all; }

        .native-result-layout {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          gap: 18px;
          margin-bottom: 16px;
        }

        .qr-panel {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
          padding: 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .qr-image { width: 240px; height: 240px; border-radius: 8px; background: #fff; }

        pre {
          margin: 0;
          background: #0f172a;
          color: #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-word;
          font-size: 12px;
          line-height: 1.6;
        }

        .api-list { display: grid; gap: 6px; }
        .api-list code { background: #f1f5f9; padding: 6px 10px; border-radius: 8px; font-size: 13px; }

        .note-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .note-grid span {
          background: #f1f5f9;
          color: #475569;
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 800;
        }

        @media (max-width: 900px) {
          .payment-grid, .summary-grid, .native-result-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
