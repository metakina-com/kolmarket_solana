# Solana 生态可嵌入项 — 提升体验与流量

> 哪些 Solana 生态能力可以嵌入到 KOLMarket 系统中，带来更好的用户体验和流量。

---

## 一、当前已集成

| 生态 | 用途 | 状态 | 体验/流量贡献 |
|------|------|------|----------------|
| **Solana Wallet Adapter** | Phantom、Solflare 连接 | ✅ | 基础链上交互 |
| **Jupiter Terminal + API** | 前端 Swap UI、报价与成交 | ✅ | Terminal 交易、价格展示 |
| **Cookie.fun / Mindshare** | KOL 影响力数据 | ✅ | Alpha Market 与 KOL 卡片 |
| **Solana Agent Kit** | 策略执行、交易逻辑 | ✅ | 自动化与分红 |
| **ElizaOS** | KOL 数字分身、聊天 | ✅ | Chat、Agent Suite |
| **可配置 RPC** | `NEXT_PUBLIC_SOLANA_RPC`（Helius 等）→ 钱包、Jupiter | ✅ | 更稳、少限速 |
| **Explorer 链接** | `NEXT_PUBLIC_EXPLORER_URL` → 地址/tx 跳转 Solscan 等 | ✅ | 查链上更方便 |
| **Solana Pay 打赏** | `NEXT_PUBLIC_TIP_RECIPIENT` → KOL 详情、Terminal Tip | ✅ | 一键打赏、链接易传播 |
| **Jupiter 价格 API** | `useJupiterPrice` hook + `TokenPriceDisplay` 组件 | ✅ | 统一价格获取、KOL 详情页展示 |
| **Birdeye 价格 API** | `useBirdeyePrice` hook（备选，需 API Key） | ✅ | 更详细的价格数据（24h 变化、市值等） |

---

## 二、推荐嵌入项（按优先级）

### P0 — 立刻提升体验 & 可量化收益

#### 1. Helius RPC

- **作用**：替换公网 RPC，更稳、更快、少限速；支持 DAS API（Token/NFT）、WebSocket。
- **体验**：连接/交易更顺畅，Terminal、钱包、历史查询更稳定。
- **流量**：间接（减少报错、提升留存）。
- **落地**：
  -  env：`NEXT_PUBLIC_HELIUS_RPC`（前端）或 `SOLANA_MAINNET_RPC`（服务端）。
  -  Devnet：`https://devnet.helius-rpc.com/?api-key=KEY`
  -  Mainnet：`https://mainnet.helius-rpc.com/?api-key=KEY`
  -  修改 `ClientWalletProvider`、`JupiterTerminal`、`lib/utils/env-config`、各 execution API 的 `Connection` 使用 Helius endpoint。
- **参考**： [Helius Docs](https://www.helius.dev/docs/api-reference/endpoints)

#### 2. Solana Pay（打赏 / 支付）

- **作用**：生成支付链接或 QR，用户用钱包扫一扫即可向 KOL / 项目方打赏 SOL 或 SPL。
- **体验**：打赏路径极短，无跳转复杂 DeFi；适合「为 Alpha 付费」场景。
- **流量**：可做「Tip KOL」传播点，方便在 X/Telegram 分享支付链接。
- **落地**：
  -  `npm i @solana/pay`（若用 QR 可加 `qrcode`）。
  -  在 KOL 详情页 / Terminal 增加「Tip」入口；服务端生成 `recipient`、`amount`、`reference`、`label`，前端 `encodeURL` + 展示 QR 或跳转链接。
  -  reference 用于校验到账，务必服务端生成并校验。
- **参考**： [Solana Pay](https://docs.solanapay.com/core/transfer-request/merchant-integration)、[Commerce Kit](https://github.com/solana-foundation/commerce-kit)

---

### P1 — 强体验 + 引流

#### 3. Birdeye（行情 / 价格）✅

- **作用**：Token 价格、走势、排行榜；可 iframe 嵌入图表或调 API 做自定义 UI。
- **体验**：KOL 卡片、Terminal、Token 页展示实时价格与简单图表，增强「交易感」。
- **流量**：Birdeye 用户体量大，若做「某某 KOL 相关 Token」等专题，易二次传播。
- **落地**：
  -  ✅ API Hook：`useBirdeyePrice` 已实现，支持价格、24h 变化、市值等（需 `NEXT_PUBLIC_BIRDEYE_API_KEY`）。
  -  iframe：`https://birdeye.so/tv-widget-builder/[token]?chain=solana` 生成图表，可嵌入 KOL 或 Token 页（待集成）。
  -  API：`/defi/token_trending` 等，用于列表、选币、简单看板（待集成）。
- **参考**： [Birdeye iframe](https://docs.birdeye.so/docs/iframe)、[API](https://docs.birdeye.so/docs/premium-apis-1)

#### 4. 链上浏览器链接（Solana FM / Solscan / XRAY）

- **作用**：交易、地址、Token 详情页链接到第三方浏览器。
- **体验**：用户一键查 tx、余额、代币，减少「查不到」的困惑。
- **流量**：从浏览器反向跳回场景较少，但提升信任与回访。
- **落地**：
  -  在 Terminal 交易历史、分红记录、钱包地址等处加「View on Explorer」。
  -  用 `https://solscan.io/tx/`、`https://solana.fm/address/` 等，或统一用 env 配置 base URL。

#### 5. Jupiter 价格 API（已用）— 强化展示 ✅

- **作用**：你们已用 `api.jup.ag/price/v2` 做 SOL 等价格。
- **体验**：在 Terminal、KOL 相关资产处统一用 Jupiter 价格，并适当展示涨跌、多 Token。
- **流量**：配合 Birdeye 做「价格来源」说明，增加专业感。
- **落地**：✅ 已抽象成 `useJupiterPrice` hook 和 `TokenPriceDisplay` 组件，Terminal 和 KOL 详情页已集成。

---

### P2 — 增强粘性与传播

#### 6. .sol 域名（SNS / Bonfida）

- **作用**：展示 `xxx.sol` 替代 raw 地址。
- **体验**：KOL 主页、打赏、跟单等场景更易读、更易记。
- **流量**：便于口头传播、分享「请打赏 to xxx.sol」。
- **落地**：调 SNS/Bonfida API 做 address → name 解析，在 UI 优先展示 .sol；无则回退地址。

#### 7. Tensor / Magic Eden（NFT）

- **作用**：展示 KOL 或项目相关 NFT（PFP、合作系列等）。
- **体验**：KOL 主页「NFT 展示」增加人设感，便于社区传播。
- **流量**：NFT 用户与 KOL 受众重叠高，易从 NFT 社区导流。
- **落地**：预留「KOL NFT 合约 / 集合」配置；用 Tensor 或 Magic Eden 的 embed/API 做小卡片或链接。

#### 8. 通知（Dialect / Notify）

- **作用**：钱包链上动态、订单状态、分红到账等通知。
- **体验**：用户不必反复刷新，提高回访与复购。
- **流量**：通过通知拉回流失用户，间接提升留存与访问频次。
- **落地**：集成 Dialect Notify 等；在关键事件（交易成功、分红、订阅）触发推送。

---

### P3 — 流量与收录

#### 9. Solana 生态目录 & dApp 收录

- **作用**：进入官方与第三方 dApp 列表，被生态用户主动发现。
- **体验**：新用户多一个入口。
- **流量**：**直接带来访问**。
- **落地**：
  -  [Solana 官方提交](https://solana.com/ecosystem/submit-project)
  -  [Solana Ecosystem](https://www.solanaecosystem.com/) — Submit Your Project
  -  [Solana Index](https://solanaindex.one/)、[Rayo / The Dapp List](https://thedapplist.com/chain/solana) 等按各自规则提交。
  -  准备：项目名、简介、Logo、官网、Category（e.g. SocialFi / AI）、链上地址等。

#### 10. Solana Mobile dApp Store

- **作用**：上架 Solana 手机端 dApp 商店，触达 Mobile 用户。
- **体验**：移动端有独立入口，体验更原生。
- **流量**：Mobile 专属流量。
- **落地**：按 [Solana Mobile 上架指南](https://solanamobile.com/developers) 适配 dApp 并提交。

#### 11. UTM & 推荐链接

- **作用**：在 X、Telegram、Discord 等链接带 `utm_*` 或推荐码。
- **体验**：无直接变化。
- **流量**：区分渠道来源，优化投放与合作。
- **落地**：前端保留 `utm_*`；后端打点统计；推荐码可绑钱包或 Cookie。

---

## 三、实施顺序建议

| 阶段 | 项 | 预估 | 说明 |
|------|----|------|------|
| **立即可做** | Helius RPC | 0.5d | 换 endpoint，少量配置 |
| **立即可做** | 链上 Explorer 链接 | 0.5d | 交易/地址处加链接 |
| **1–2 天** | Solana Pay 打赏 | 1d | KOL 详情 / Terminal 增加 Tip |
| **1–2 天** | 提交 dApp 目录 | 0.5d | 填表、备素材，纯运营 |
| **按需** | Birdeye 图表/API | 1–2d | KOL/Token 页行情 |
| **按需** | .sol、NFT、通知 | 各 1–2d | 视产品优先级 |

---

## 四、环境变量与配置建议

```bash
# RPC（建议优先 Helius）
SOLANA_MAINNET_RPC=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
NEXT_PUBLIC_SOLANA_RPC=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY   # 若前端直连

# 已有
SOLANA_RPC_URL=...
NEXT_PUBLIC_COOKIE_FUN_API_URL=...

# 新增可选
BIRDEYE_API_KEY=...
HELIUS_API_KEY=...
```

- 前端直连 RPC 时，建议用 Helius 的 **domain-restricted / 限流** 方案，降低 key 滥用风险。

---

## 五、与现有模块的对接点

| 模块 | 可接入生态 | 用途 |
|------|------------|------|
| **ClientWalletProvider** | Helius RPC | Connection endpoint |
| **JupiterTerminal** | Helius RPC、Jupiter Price | RPC + 价格 |
| **Terminal 页** | Solana Pay、Explorer、Birdeye | 打赏、查 tx、行情 |
| **KOL 详情 / 卡片** | Solana Pay、.sol、NFT | 打赏、展示身份与藏品 |
| **Execution APIs** | Helius RPC | 策略、分红、KMT 等 |
| **Footer / 关于** | dApp 目录链接 | 引流至官方提交页 |

---

## 六、小结

- **体验**：优先做 **Helius RPC**、**Solana Pay 打赏**、**Explorer 链接**；再视需求加 **Birdeye**、**.sol**、**NFT**、**通知**。
- **流量**：优先 **提交 Solana 生态目录与 dApp 列表**；配合 **UTM/推荐链接** 与 **Solana Pay 分享**，把「打赏链接」当传播抓手。

按上表从 P0 做起，再逐步覆盖 P1–P3，即可在现有架构上嵌入 Solana 生态能力，带来更好体验和更多流量。
