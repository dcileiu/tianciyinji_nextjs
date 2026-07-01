# 微信支付 Demo（H5 + Native 扫码）

从 `wx-mj/backend` 抽离的独立支付示例，包含：

- **H5 支付**：手机浏览器拉起微信支付
- **Native 扫码支付**：PC 网页展示二维码，手机微信扫码付款

基于微信支付 **API v3**，无官方 SDK，使用 Node 内置 `crypto` + `fetch`。

## 目录结构

```
wechat-pay-demo/
├── lib/
│   ├── wechatPay.js          # v3 签名、请求、回调解密
│   ├── paymentHelpers.mjs    # 下单 payload、金额转换
│   └── requestUtils.mjs      # 公网 URL、IP、可选 API 密钥
├── pages/
│   ├── index.js              # 测试页（创建订单 + 查单 + 展示二维码）
│   ├── pay/h5/result.js      # H5 支付完成后的浏览器返回页
│   └── api/
│       ├── payment/          # 创建/查单（业务侧调用）
│       └── pay/              # 微信异步回调（公网可访问）
└── tests/
    └── paymentHelpers.test.mjs
```

## 快速开始

```bash
cd wechat-pay-demo
cp .env.example .env
# 填写微信支付商户配置
npm install
npm run dev
```

浏览器打开 `http://localhost:3000` 进行测试。

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `WECHAT_APPID` | 是 | 公众号/小程序 AppID |
| `WECHAT_MCH_ID` | 是 | 商户号 |
| `WECHAT_PAY_SERIAL_NO` | 是 | 商户 API 证书序列号 |
| `WECHAT_PAY_PRIVATE_KEY` | 是 | 商户 API 私钥 PEM |
| `WECHAT_PAY_API_V3_KEY` | 是 | APIv3 密钥（32 字节） |
| `WECHAT_PAY_NOTIFY_URL` | 是 | `getPayConfig()` 校验用，可填 H5 或 Native 回调地址 |
| `WECHAT_PAY_H5_NOTIFY_URL` | 否 | H5 回调，默认 `{域名}/api/pay/h5/notify` |
| `WECHAT_PAY_NATIVE_NOTIFY_URL` | 否 | Native 回调，默认 `{域名}/api/pay/native/notify` |
| `WECHAT_PAY_H5_APP_URL` | 否 | H5 场景页 URL，默认当前域名首页 |
| `WECHAT_PAY_APP_NAME` | 否 | H5 场景应用名 |
| `PAY_DEMO_API_SECRET` | 否 | 保护创建/查单 API，请求头 `x-api-secret` |

## API 说明

### 创建 H5 订单

```
POST /api/payment/h5-create
Content-Type: application/json

{ "amountFen": 1 }
```

返回 `h5Url`、`outTradeNo` 等。在手机浏览器打开 `h5Url` 完成支付。

### 查询订单（H5 / Native 通用）

```
POST /api/payment/h5-query
POST /api/payment/native-query

{ "outTradeNo": "H51700000000000ABCDEF" }
```

### 创建 Native 订单

```
POST /api/payment/native-create

{ "amountFen": 1 }
```

返回 `codeUrl`、`qrDataUrl`（Base64 二维码图）、`outTradeNo`。

### 微信回调（勿手动调用）

- `POST /api/pay/h5/notify`
- `POST /api/pay/native/notify`

回调会解密 `resource` 并打印日志。接入业务时在 notify 里判断 `trade_state === 'SUCCESS'` 后落库。

## 支付流程

### H5

1. 调用 `h5-create` 获取 `h5Url`
2. 用户手机浏览器打开链接完成支付
3. 微信异步通知 `/api/pay/h5/notify`
4. 用户跳转到 `/pay/h5/result?outTradeNo=...`
5. 调用 `h5-query` 确认最终状态

### Native

1. 调用 `native-create` 获取二维码
2. 用户手机微信扫码支付
3. 微信异步通知 `/api/pay/native/notify`
4. 调用 `native-query` 确认最终状态

## 迁移到其他项目

**方式一：整目录复制**

将整个 `wechat-pay-demo/` 复制到新项目根目录，配置 `.env` 后 `npm install && npm run dev`。

**方式二：只复制核心文件**

最少需要：

- `lib/wechatPay.js`
- `lib/paymentHelpers.mjs`（或按需精简）
- `pages/api/payment/*.js`
- `pages/api/pay/**/notify.js`

若使用 Express/Koa 等非 Next.js 框架，保留 `lib/wechatPay.js` 和 `paymentHelpers.mjs`，将 API 路由逻辑改写成对应框架的路由即可。

## 微信商户平台配置

1. 开通 H5 支付 / Native 支付产品
2. 配置 API 证书与 APIv3 密钥
3. 将回调 URL 加入白名单（需 HTTPS 公网地址）
4. H5 支付需配置「支付授权目录」和「H5 支付域名」

## 测试

```bash
npm test
```

## 注意事项

- H5 支付必须在**手机浏览器**测试，PC 端通常无法拉起微信
- 本地开发需内网穿透（如 ngrok）才能让微信回调到你的机器
- 订单号前缀：H5=`H5...`，Native=`NT...`
- Demo 回调**不落库**，生产环境务必做幂等处理
