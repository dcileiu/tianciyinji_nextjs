import Link from 'next/link'
import { useRouter } from 'next/router'

export default function H5PayResult() {
  const router = useRouter()
  const outTradeNo = typeof router.query.outTradeNo === 'string'
    ? router.query.outTradeNo
    : ''

  const copyOutTradeNo = async () => {
    if (!outTradeNo) return
    await navigator.clipboard.writeText(outTradeNo)
  }

  return (
    <main className="page">
      <section className="panel">
        <div className="mark">✓</div>
        <h1>已返回支付页</h1>
        <p className="desc">
          微信 H5 支付结果以回调和查单为准。请回到首页，用商户订单号查询最终状态。
        </p>

        <div className="order-box">
          <span>商户订单号</span>
          <strong>{outTradeNo || '未获取到订单号'}</strong>
        </div>

        <div className="actions">
          <button type="button" onClick={copyOutTradeNo} disabled={!outTradeNo}>
            复制订单号
          </button>
          <Link href="/">回到支付测试</Link>
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          box-sizing: border-box;
          background: #f8fafc;
          color: #1e293b;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .panel {
          width: 100%;
          max-width: 460px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
          text-align: center;
        }

        .mark {
          width: 48px;
          height: 48px;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #dcfce7;
          color: #166534;
          font-size: 24px;
          font-weight: 900;
        }

        h1 {
          margin: 0;
          font-size: 24px;
        }

        .desc {
          margin: 12px 0 20px;
          color: #64748b;
          line-height: 1.6;
          font-size: 14px;
        }

        .order-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
          text-align: left;
        }

        .order-box span {
          display: block;
          color: #64748b;
          font-size: 12px;
          margin-bottom: 6px;
        }

        .order-box strong {
          display: block;
          word-break: break-all;
          font-size: 15px;
        }

        .actions {
          display: flex;
          gap: 10px;
          margin-top: 18px;
        }

        button,
        a {
          flex: 1;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
          box-sizing: border-box;
        }

        button {
          background: #6366f1;
          color: #fff;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        a {
          color: #334155;
          background: #fff;
        }

        @media (max-width: 480px) {
          .panel {
            padding: 24px 18px;
          }

          .actions {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  )
}
