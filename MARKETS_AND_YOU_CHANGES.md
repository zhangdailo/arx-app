# ARX Mobile — 行情(Markets) 与 我的(You) 改动说明

以下为 **Markets(行情)** 和 **You(我的)** 两个标签页的主要升级，采用 *改动前 → 现在* 的对照方式。以下全部为新增或优化 — 未删除任何现有功能。

---

## MARKETS(行情)标签页

### 起点问题
Markets 原本是一个不错的混合体(CEX 风格的数据终端 + 消费级编辑内容),但存在**点击死胡同** — 有些链接点了没有反应 — 而且交易标的页面只有单一扁平视图。

### 新增内容

**1. 每一次点击现在都有去处**
- **What-if(假设推演)** → 打开完整的**杠杆假设模拟器**:选择标的、拖动杠杆,查看同一波行情在**多空两个方向**上的对称结果(盈亏对称的真实呈现),并附"杠杆是双刃剑"提示、下单入口,以及"问大佬"解读。
- **Market regime(市场状态)** → 打开**市场状态解读页**:今日判读(Risk-on,第 7 天)、情绪量表,以及三大输入指标的通俗拆解(资金费率 · 波动率 · 聪明钱仓位),并附"问大佬"。
- **聪明交易者标签**(聪明钱 / 巨鲸 / 基金)→ 跳转到 Copy → 聪明钱 并按该标的筛选。
- **最新成交行** → 打开该交易者的钱包详情。

**2. Overview 现在是一个完整的驾驶舱**
可自定义的组件栈(可显示/隐藏 + 重新排序,且会保存):
- **当日判读** — 一句话概括市场风险天气
- **热力图** — 持仓量/成交量/清算 指标切换,鲜明的发散色阶,每个标的为一个加权色块
- **涨跌榜** — 涨幅 / 跌幅 / 持仓量变化 / 成交量变化,带流动性筛选
- **仓位矩阵** — 分群体的**多空矩阵**(全部 · ◆聪明钱 · 🐋巨鲸 · ☠爆仓),逆势单元格高亮
- **资金流向** — 按群体的 CVD(累计成交量差)
- **催化事件** — 资金费率翻转、链上事件、新闻(附来源说明)

**3. 真正的交易标的页**
点击任意标的 → 5 个标签的详情页:**概览 · 仓位 · 资金流 · 风险 · 交易者**,顶部固定**大佬综合解读**、清算墙图表,以及"24 小时内发生了什么"事件时间线。**交易者**标签显示哪些被追踪的钱包在该标的上有仓位,以及他们的群体、方向、杠杆和盈亏,外加一份"群体打法"(建议的方向/杠杆/止损/止盈,可一键应用到下单)。

**4. Pro 级数据**
- **资金费率倒计时**(下一个 8 小时结算点)— 仅 Pro 模式
- 真实持仓量、可排序的表头(最新价 / 成交量 / 涨跌幅)
- **一行直达下单** — 每个行情行都有快捷下单入口

**5. 打磨与数据**
- 标准化的导航语法(L1 分段 概览/发现/自选 · L2 合约/现货 · L3 筛选药丸 · 排序)
- **LIVE MARKETS · 24H MOVERS** 滚动条
- 永续列表:持仓量不再被截断、行高统一、表头与列对齐
- 全程真实资产图标 — 股票 logo(NVDA/TSLA…)、大宗商品图标(黄金、白银、原油、铀、天然气)、真实加密币图标,以及自定义的 HYPE / SUI / DOGE 标识

---

## YOU(我的)标签页

### 起点问题
You 原本**没有身份信息区块**,也**没有跟单(Copies)板块** — 这是个关键缺口,因为跟单交易者约占 95% 的用户。信任与安全相关的入口要么缺失,要么藏得很深。

### 新增内容

**1. 身份信息 + 主干**
- 顶部**身份区块**:头像 · `elon.musk` · `0x4b2e…91ac` · **◉ 自托管标识** → 点击进入个人页
- **吸顶快捷导航药丸**(概览 · 持仓 · 跟单 · 盈亏 · 历史 · 赚取)— 平滑滚动跳转,按用户画像设默认
- **大佬组合解读**置顶 — 资产总额数字下方即是这份执行摘要

**2. 跟单与资金分配(全新)**
针对每一位你正在跟单的领单者:头像 · 跟单本金 · 跟单盈亏 · **常驻的亏损上限余量条** · 偏移标记 · 自动暂停状态。这是最重要的新功能,也是 S7 用户的日常主页。

**3. 每日盈亏 — 真正的日历**
从通用网格重建为真实的每日日历(真实星期列)。**点击任意一天** → 内联拆解(逐笔成交行 + "N 笔中 X 笔盈利,已扣费")。简洁的双色图例;旧的彩虹色条和无解释的"+"号已移除。

**4. 奖励与推荐**
- **奖励** — 积分主卡 + 等级阶梯(铜 → 银 → 金 → 钻),12 天连签网格、赚取方式,以及**兑换 $ARX 积分**。银卡可点击 → 完整的万豪 Bonvoy 风格会员权益页。
- **推荐** — **多级 L1 / L2 / L3**(30% / 5% / 2% 分成),每一级可点击进入该级推荐列表,显示每位被推荐人的分成 % 和金额。可领取的 USDC 主卡,领取后**按钮锁定**并显示派发日期。分级收益带迷你走势图、周期切换、"满 100 推荐享 0 手续费兑换"里程碑、分享底栏(推荐码 **ARX-ELON**)。
- **分享某笔交易** → 黑紫配色的盈亏卡(ARX 品牌)+ 推荐二维码。

**5. 账户区 + 信任与安全**
零散的账户列表现已整合为**分组的账户主页**:资金 · 安全 · 帮助与支持 · 法务 · 设置 — 并加入了能建立信心的、罕见但关键的信任入口:
- **自托管证明**("你的私钥,你的资金")
- **撤销交易授权**(终止代理钱包的权限;资金不受影响)
- **"我为什么被清算了?"**解读
- 报告问题 · 系统状态
- **紧急退出** — 常驻的一键全平按钮(服务端执行)

**6. 设置与历史**
- **Simple / Pro 体验切换**(渐进式呈现 — Pro 解锁盘口深度、资金费率倒计时、进阶信号)
- 偏好设置:确认方式、App 锁、通知、货币、默认杠杆
- **历史已统一** — 单一分段的 成交 · 转账 视图(不再有重复页面)
- 持仓标签(持仓 · 委托 · 历史)现为分段控件,带筛选药丸(全部 / 合约 / 现货)

---

## 跨标签页改动
- **通知**新增 KOL"聪明钱动了"提醒(针对你关注的钱包)
- 搜索中加入 **大佬(Lucid)学习 / 问答中心** — 由 AI 驱动的新手问答
- 底部导航激活药丸滑动动画
- 设备外框自适应视口缩放;底部渐隐遮罩,让内容在悬浮标签栏下方干净过渡

---
---

# ARX Mobile — Markets & You: what changed

A summary of the major upgrades to the **Markets** and **You** tabs, framed as *before → now*. Everything below is additive or a refinement — no existing features were removed.

---

## MARKETS tab

### The problem we started with
Markets was a capable hybrid (CEX-style data terminal + consumer editorial) but had **dead-end taps** — links that led nowhere — and a single flat instrument view.

### What's new

**1. Every tap now goes somewhere**
- **What-if** → opens a full **leverage What-if simulator**: pick an asset, scrub leverage, see the same market move applied *both directions* (the honest gain/loss symmetry), with a "leverage cuts both ways" warning, a Trade CTA, and an Ask-大佬 explainer.
- **Market regime** → opens a **regime explainer**: today's read (Risk-on, day 7), a sentiment gauge, and a plain-language breakdown of the three inputs (funding · volatility · smart-money positioning), with Ask-大佬.
- **Smart-traders chips** (Smart money / Whales / Funds) → route into Copy → Smart Money for that asset.
- **Latest-trades rows** → open the trader's wallet detail.

**2. The Overview is now a full cockpit**
A customizable widget stack (show/hide + reorder, persists):
- **Day-read** — the market's risk weather in one line
- **Heatmap** — OI / Volume / Liquidity metric toggle, vivid diverging color scale, every instrument a weighted tile
- **Movers** — Gainers / Losers / OI-Δ / Vol-Δ with a liquidity filter
- **Positioning** — a cohort **side-matrix** (All · ◆ Smart · 🐋 Whale · ☠ Rekt) with contrarian cells popped
- **Trading Flow** — CVD by cohort
- **Catalysts** — funding flips, on-chain events, news with source disclosure

**3. A real instrument page**
Tap any market → a 5-tab instrument detail: **Overview · Positioning · Flow · Risk · Traders**, led by a pinned **大佬 composite read**, a liquidation-wall chart, and a "what changed · 24h" event timeline. The **Traders** tab shows which tracked wallets are positioned in this asset, their cohort, side, leverage and PnL, plus a Cohort Playbook (suggested direction/leverage/stop/take-profit you can apply to the ticket).

**4. Pro-tier data**
- **Funding countdown** (next 8h boundary) — gated to Pro mode
- Real OI, sortable table headers (Last / Vol / Change)
- **Row → Trade** one-tap fast path on every market row

**5. Polish & data**
- Standardized nav grammar (L1 segmented Overview/Discover/Watchlist · L2 Perps/Spot · L3 filter pills · Sort)
- **LIVE MARKETS · 24H MOVERS** ticker
- Perpetuals list: OI no longer truncates, uniform row heights, headers aligned to columns
- Real asset icons throughout — stock logos (NVDA/TSLA…), commodity glyphs (gold, silver, oil, uranium, natural gas), real crypto coin art, and custom HYPE / SUI / DOGE marks

---

## YOU tab

### The problem we started with
You had **no identity block** and **no Copies section** — a critical gap, since copy-traders are ~95% of users. Trust-and-safety surfaces were missing or buried.

### What's new

**1. Identity + spine**
- **Identity block** at the top: avatar · `elon.musk` · `0x4b2e…91ac` · **◉ self-custody chip** → taps to profile
- **Sticky quick-nav chips** (Overview · Holdings · Copies · PnL · History · Earn) — smooth-scroll jump-nav, persona-aware default
- **Portfolio read (大佬)** leads — the executive summary sits right under the equity number

**2. Copies & allocation (net-new)**
Per-leader you're copying: avatar · copy capital · copy PnL · an **always-on loss-limit headroom meter** · drift flag · auto-pause status. This is the biggest new feature and the daily home for S7 users.

**3. Daily PnL — a true calendar**
Rebuilt from a generic grid into an honest daily calendar (real weekday columns). **Tap any day** → inline breakdown (per-trade rows + "X of N green, after fees"). Clean two-swatch legend; the old rainbow bar and unexplained "+" marks are gone.

**4. Rewards & Referrals**
- **Rewards** — points hero with a tier ladder (Bronze → Silver → Gold → Diamond), 12-day streak grid, ways to earn, and **Redeem $ARX points**. The Silver tier card is clickable → a full Bonvoy-style membership-benefits page.
- **Referrals** — **multi-level L1 / L2 / L3** (30% / 5% / 2% cuts), each level tappable to its referral list with per-referral commission % and $. Claimable USDC hero with a claim flow that **locks after claiming** and shows the payout date. By-tier earnings with sparklines, period toggle, "$0-fee swaps at 100 referrals" milestone, share footer (code **ARX-ELON**).
- **Share a trade** → black/purple PnL card (ARX brand) with a referral QR.

**5. Account zone + Trust & Safety**
The loose account list is now a **grouped Account home**: Funding · Security · Help & support · Legal · Settings — with the rare-but-critical trust surfaces that drive confidence:
- **Self-custody proof** ("your keys, your funds")
- **Revoke trading access** (kills the agent-wallet's authority; funds untouched)
- **"Why was I liquidated?"** explainer
- Report an issue · system status
- **Emergency exit** — a persistent close-all panic button (executes server-side)

**6. Settings & history**
- **Simple / Pro experience toggle** (progressive disclosure — Pro unlocks order-book depth, funding countdowns, advanced signals)
- Preferences: confirm method, app lock, notifications, currency, default leverage
- **History unified** — one segmented Trades · Transfers view (no more duplicate screen)
- Holdings tabs (Positions · Orders · History) now a segmented control with filter pills (All / Perps / Spot)

---

## Cross-cutting
- **Notifications** enriched with KOL "smart money moved" alerts for wallets you watch
- **大佬 (Lucid) Learn / Answers hub** in search — beginner Q&A powered by the AI
- Bottom-nav active-pill glide animation
- Device-frame fit-to-viewport scaling; bottom scrim so content fades cleanly under the floating tab bar
