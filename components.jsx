// Arx Mobile UI Kit — v2 components
// Robinhood-tight · iOS 26 liquid-glass sheets · strict v6 tokens
const { useState, useMemo } = React;

/* ─── Icons (Lucide outline, 1.5px) ──────────────────────── */
const Icon = ({ size = 24, sw = 1.5, color = 'currentColor', children, fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const IconSearch  = (p) => <Icon {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></Icon>;
const IconUser    = (p) => <Icon {...p}><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></Icon>;
const IconHome    = (p) => <Icon {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z"/></Icon>;
const IconRadar   = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Icon>;
const IconBolt    = (p) => <Icon {...p}><path d="M13 10V3L4 14h7v7l9-11h-7z"/></Icon>;
const IconBars    = (p) => <Icon {...p}><line x1="4" y1="20" x2="4" y2="12"/><line x1="10" y1="20" x2="10" y2="6"/><line x1="16" y1="20" x2="16" y2="14"/><line x1="22" y1="20" x2="22" y2="9"/></Icon>;
const IconUp      = (p) => <Icon {...p} size={p.size||12} sw={2}><polyline points="6 15 12 9 18 15"/></Icon>;
const IconDown    = (p) => <Icon {...p} size={p.size||12} sw={2}><polyline points="6 9 12 15 18 9"/></Icon>;
const IconChevron = (p) => <Icon {...p} size={p.size||16}><polyline points="9 18 15 12 9 6"/></Icon>;
const IconCheck   = (p) => <Icon {...p} size={p.size||14} sw={2}><polyline points="20 6 9 17 4 12"/></Icon>;
const IconClose   = (p) => <Icon {...p} size={p.size||18} sw={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Icon>;
const IconBell    = (p) => <Icon {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></Icon>;
const IconWallet  = (p) => <Icon {...p}><rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M3 10 L18 10 V7 a2 2 0 0 0 -2 -2 H7 a4 4 0 0 0 -4 3"/><circle cx="17" cy="14" r="1.2" fill="currentColor"/></Icon>;

/* ─── Animation system · three categories only ─────────────
   ARRIVAL — content entering a surface (once per transition)
   BREATH  — only on live data (price tick, notif dot)
   INTERRUPT — sheets, modals, destructive confirms
─────────────────────────────────────────────────────────── */
const _arxAnim = `
@keyframes arxArrive { from{transform:translateY(16px)} to{transform:translateY(0)} }
@keyframes arxBreath { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
@keyframes arxInterrupt { from{transform:translateY(100%)} to{transform:translateY(0)} }
@keyframes arxTabPop { 0%{transform:scale(1)} 45%{transform:scale(1.32)} 100%{transform:scale(1.16)} }
@keyframes arxScalePop { 0%{transform:translateX(-50%) scale(.6);opacity:0} 100%{transform:translateX(-50%) scale(1);opacity:1} }
@keyframes arxTick { 0%{transform:scale(1)} 30%{transform:scale(1.03)} 100%{transform:scale(1)} }
@keyframes arxAmbient { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.03);opacity:.9} }
.arx-arrive{animation:arxArrive 800ms cubic-bezier(.32,.72,0,1)}
.arx-breath{animation:arxBreath 2s ease-in-out infinite}
.arx-ambient{animation:arxAmbient 4s ease-in-out infinite}
.arx-tick{animation:arxTick 320ms cubic-bezier(.32,.72,0,1)}
.arx-press{transition:transform 200ms cubic-bezier(.32,.72,0,1)}
.arx-press:active{transform:scale(.97)}
.arx-press:active .arx-icon-magnetic{transform:translate(2px,-1px) scale(1.06)}
.arx-icon-magnetic{transition:transform 200ms cubic-bezier(.32,.72,0,1)}
.arx-row-press{transition:background 140ms ease}
.arx-row-press:active{background:rgba(120,120,128,.10)}
.arx-eyebrow-pill{display:inline-block;padding:3px 10px;border-radius:9999px;background:rgba(124,91,255,.14);font:600 11px var(--font-body);color:var(--color-violet-700);letter-spacing:.18em;text-transform:uppercase}
.arx-grain{position:absolute;inset:0;pointer-events:none;opacity:.04;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")}
`;
function ArxAnimStyles() { return <style>{_arxAnim}</style>; }

/* Scroll-reveal hook — IntersectionObserver wired globally on mount */
function useScrollReveal() {
  _arxUseEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.arx-arrive').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ─── Card primitive · one chrome for everything ─── */
function Card({ children, style = {}, onClick, animate = true, padding = 14 }) {
  return (
    <div onClick={onClick} className={`${onClick?'arx-press':''} ${animate?'arx-arrive':''}`} style={{
      background:'var(--surface-elevated)',
      border:'.5px solid var(--border-default)',
      borderRadius:16, padding, cursor: onClick?'pointer':'default',
      boxShadow:'var(--shadow-card)',
      ...style
    }}>{children}</div>
  );
}
/* ─── NumberRoll · brand-signature odometer animation ─────
   200ms spring deceleration on value change. Use for prices,
   PnL, funding, equity, mark. BANNED on errors, risk warnings,
   validation messages, count-of-positions in headers.
─────────────────────────────────────────────────────────── */
const { useState: _arxUseState, useRef: _arxUseRef, useEffect: _arxUseEffect } = React;
function NumberRoll({ value, format = (v)=>String(v), prefix = '', suffix = '', sign = false, style = {}, className = '' }) {
  const ref = _arxUseRef(null);
  const prev = _arxUseRef(value);
  const signStr = sign ? (value >= 0 ? '+' : '−') : '';
  const formatted = `${signStr}${prefix}${format(Math.abs(value))}${suffix}`;
  _arxUseEffect(() => {
    if (prev.current !== value && ref.current) {
      ref.current.animate(
        [
          { transform: 'translateY(8%)', opacity: 0.6 },
          { transform: 'translateY(0)',  opacity: 1   }
        ],
        { duration: 200, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' }
      );
      prev.current = value;
    }
  }, [value]);
  return (
    <span ref={ref} className={`num ${className}`} style={{
      display:'inline-block', fontVariantNumeric:'lining-nums tabular-nums',
      ...style
    }}>{formatted}</span>
  );
}

function HeroValue({ value, delta, deltaPct, label = 'Total equity', range = '1D', chart }) {
  const positive = delta >= 0;
  // DS: account equity must read true immediately. Render real values on mount;
  // NumberRoll animates (200ms ≤ 400ms cap) only on an actual value change.
  // (Was a 1.2s rAF count-up from $0.00 — off-spec, and stuck at $0.00 when rAF throttled.)
  const animValue = value, animDelta = delta, animPct = deltaPct;
  return (
    <div className="arx-arrive" style={{margin:'4px 20px 12px'}}>
      <div style={{
        background:'linear-gradient(135deg, #9C7DF0 0%, #7C5BFF 22%, #5B3FD1 48%, #7A57E8 68%, #4529A8 100%)',
        borderRadius:24, padding:'24px 22px 22px',
        boxShadow:'0 16px 40px rgba(88,58,180,.42), 0 4px 12px rgba(88,58,180,.24)',
        position:'relative', overflow:'hidden'
      }}>
        {/* Sheen sweep · loops every 6s */}
        <div style={{
          position:'absolute', top:0, left:0, width:'60%', height:'100%',
          background:'linear-gradient(110deg, transparent 30%, rgba(255,255,255,.22) 50%, transparent 70%)',
          animation:'heroSheen 6s cubic-bezier(.32,.72,0,1) 0.4s infinite',
          pointerEvents:'none'
        }}/>
      <div className="arx-grain"></div>
        {/* Ambient orb · slowly drifts */}
        <div style={{
          position:'absolute', right:-40, top:-40, width:160, height:160, borderRadius:'50%',
          background:'radial-gradient(circle at 30% 30%, rgba(255,255,255,.18), transparent 60%)',
          animation:'heroOrb 8s ease-in-out infinite', pointerEvents:'none'
        }}/>
        <div style={{position:'relative'}}>
          <div style={{
            font:'500 11px var(--font-body)', color:'rgba(255,255,255,.70)',
            letterSpacing:'.14em', textTransform:'uppercase', marginBottom:10,
            display:'flex', alignItems:'center', gap:8
          }}>
            <span>{label.split('').map((ch,i)=>(
              <span key={i} style={{
                display:'inline-block',
                animation:`heroChar 500ms cubic-bezier(.32,.72,0,1) ${i*30}ms both`
              }}>{ch==' '?'\u00A0':ch}</span>
            ))}</span>
            <span style={{
              display:'inline-flex', alignItems:'center', gap:5,
              padding:'2px 7px', borderRadius:9999,
              background:'rgba(255,255,255,.15)'
            }}>
              <span style={{
                width:5, height:5, borderRadius:'50%', background:'#86EFAC',
                animation:'heroLive 1.6s ease-in-out infinite'
              }}/>
              <span style={{font:'600 11px var(--font-mono)', color:'#fff', letterSpacing:'.12em'}}>LIVE</span>
            </span>
          </div>
          <NumberRoll
            value={animValue} prefix="$"
            format={(v)=>v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
            style={{font:'600 38px var(--font-mono)', letterSpacing:'-0.02em', color:'#FFFFFF', lineHeight:1.02}}
          />
          <div style={{display:'flex', gap:8, alignItems:'baseline', marginTop:12}}>
            {/* Trending arrow · subtle bob */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
                 style={{ animation:'heroBob 2s ease-in-out infinite', transform: positive ? 'rotate(0deg)' : 'rotate(180deg)' }}>
              <polyline points="6 15 12 9 18 15"/>
            </svg>
            <NumberRoll
              value={animDelta} sign prefix="$"
              format={(v)=>v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
              style={{font:'600 14px var(--font-mono)', color:'#FFFFFF'}}
            />
            <NumberRoll
              value={animPct} sign suffix="%"
              format={(v)=>v.toFixed(2)}
              style={{font:'500 14px var(--font-mono)', color:'rgba(255,255,255,.70)'}}
            />
            <span style={{font:'500 12px var(--font-body)', color:'rgba(255,255,255,.6)', marginLeft:'auto'}}>{range}</span>
          </div>
          {chart && (() => {
            const cw=360, ch=76, mn=Math.min(...chart), mx=Math.max(...chart), rg=(mx-mn)||1;
            const pts=chart.map((v,i)=>[(i/(chart.length-1))*cw, ch-8-((v-mn)/rg)*(ch-22)]);
            const ld=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
            const ad=ld+` L${cw},${ch} L0,${ch} Z`;
            const lp=pts[pts.length-1];
            return (
              <div style={{margin:'18px -22px -22px', height:ch, position:'relative'}}>
                <svg width="100%" height={ch} viewBox={`0 0 ${cw} ${ch}`} preserveAspectRatio="none" style={{display:'block'}}>
                  <defs><linearGradient id="hero-eq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#fff" stopOpacity=".28"/>
                    <stop offset="1" stopColor="#fff" stopOpacity="0"/>
                  </linearGradient></defs>
                  <path d={ad} fill="url(#hero-eq)"/>
                  <path d={ld} fill="none" stroke="rgba(255,255,255,.92)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{position:'absolute', left:`${(lp[0]/cw)*100}%`, top:lp[1], width:7, height:7, marginLeft:-3.5, marginTop:-3.5, borderRadius:'50%', background:'#fff', boxShadow:'0 0 9px rgba(255,255,255,.85)'}}/>
              </div>
            );
          })()}
        </div>
      </div>
      <style>{`
        @keyframes heroSheen { 0%{transform:translateX(-120%)} 50%,100%{transform:translateX(360%)} }
        @keyframes heroBob   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes heroOrb   { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,12px) scale(1.1)} }
        @keyframes heroChar  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes heroLive  { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(166,255,77,.6)} 50%{opacity:.7;box-shadow:0 0 0 4px rgba(166,255,77,0)} }
      `}</style>
    </div>
  );
}

/* ─── Line chart · light-violet frame + gradient fill ──── */
function LineChart({ data, positive = true, height = 140 }) {
  const w = 360;
  const min = Math.min(...data), max = Math.max(...data);
  const range = (max - min) || 1;
  const pts = data.map((v,i) => {
    const x = (i/(data.length-1))*w;
    const y = height - 24 - ((v-min)/range)*(height-44);
    return [x, y];
  });
  const lineD = pts.map((p,i)=> (i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  const areaD = `${lineD} L${w},${height} L0,${height} Z`;
  const last = pts[pts.length-1];
  return (
    <div style={{padding:'0 20px 4px'}}>
      <div style={{
        position:'relative', overflow:'hidden',
        background:'rgba(124,91,255,.07)',
        border:'.5px solid rgba(124,91,255,.16)',
        borderRadius:18, height
      }}>
        <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7C5BFF" stopOpacity=".35"/>
              <stop offset="1" stopColor="#7C5BFF" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#lc-fill)"/>
          <path d={lineD} fill="none" stroke="#7C5BFF" strokeWidth="1.75"
            strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx={last[0]} cy={last[1]} r="3.5" fill="#9880FF" style={{filter:'drop-shadow(0 0 6px rgba(124,91,255,.9))'}}/>
        </svg>
      </div>
    </div>
  );
}

/* ─── Time-range tabs · iOS-26 segmented control with sliding puck ─── */
function TimeRangeTabs({ value, onChange }) {
  const tabs = ['1H','1D','1W','1M','3M','YTD','ALL'];
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'2px 24px 14px', position:'relative'}}>
      {tabs.map(t => {
        const on = value===t;
        return (
          <button key={t} onClick={()=>onChange(t)} style={{
            position:'relative', background:'none', border:'none', cursor:'pointer', padding:'4px 2px',
            color: on?'var(--color-violet-500)':'var(--text-tertiary)', font:`${on?700:500} 12px var(--font-body)`,
            letterSpacing:'.02em', transition:'color 200ms'
          }}>{t}
            {on && <span style={{position:'absolute', left:'50%', bottom:-2, transform:'translateX(-50%)', width:5, height:5, borderRadius:'50%', background:'var(--color-violet-500)'}}/>}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Empty equity (unfunded lifecycle stages) — designed zero-state, one CTA ─── */
function EmptyEquity({ stage = 'first_install' }) {
  const sc = window.arxStageState ? window.arxStageState(stage) : null;
  const cta = (sc && sc.cta) || 'Add funds';
  const go = () => window.__arxOpenSub && window.__arxOpenSub('funding');
  return (
    <div className="arx-arrive" style={{margin:'4px 20px 12px'}}>
      <div style={{
        background:'linear-gradient(135deg, #9C7DF0 0%, #7C5BFF 22%, #5B3FD1 48%, #7A57E8 68%, #4529A8 100%)',
        borderRadius:24, padding:'24px 22px', position:'relative', overflow:'hidden'
      }}>
        <div className="arx-grain"></div>
        <div style={{position:'relative'}}>
          <div style={{font:'500 11px var(--font-body)', color:'rgba(255,255,255,.70)', letterSpacing:'.14em', textTransform:'uppercase', marginBottom:10}}>Total equity</div>
          <div className="num" style={{font:'600 38px var(--font-mono)', letterSpacing:'-0.02em', color:'#FFFFFF', lineHeight:1.02}}>$0.00</div>
          <div style={{font:'500 13px var(--font-body)', color:'rgba(255,255,255,.82)', lineHeight:1.5, marginTop:12, maxWidth:280}}>Your portfolio starts here. Add funds to begin — start with as little as $50.</div>
          <button onClick={go} className="arx-press" style={{marginTop:16, height:44, padding:'0 20px', borderRadius:12, border:'none', cursor:'pointer', background:'#fff', color:'var(--color-violet-700)', font:'700 14px var(--font-body)', display:'inline-flex', alignItems:'center', gap:8, boxShadow:'0 6px 18px rgba(8,6,26,.22)'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-violet-700)" strokeWidth="2.3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Section header (iOS-native · sentence case + trailing action) ─── */
function SectionHeader({ children, action, onAction }) {
  return (
    <div style={{
      display:'flex', alignItems:'baseline', justifyContent:'space-between',
      padding:'48px 20px 14px'
    }}>
      <div className="arx-eyebrow-pill">{children}</div>
      {action && (
        <button onClick={onAction} className="arx-press" style={{
          background:'none', border:'none', cursor:'pointer',
          font:'500 14px var(--font-body)', color:'var(--color-violet-500)',
          padding:0, display:'inline-flex', alignItems:'center', gap:6
        }}>{action}
          <span className="arx-icon-magnetic" style={{
            width:22, height:22, borderRadius:'50%',
            background:'rgba(124,91,255,.14)',
            display:'inline-flex', alignItems:'center', justifyContent:'center'
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
        </button>
      )}
    </div>
  );
}

/* ─── Asset glyph (tight 32px circle) ──────────────────── */
function AssetGlyph({ sym, size = 32 }) {
  const map = {
    BTC:['#F7931A','#FFB860'], ETH:['#627EEA','#8FA0F0'], SOL:['#9945FF','#14F195'],
    USDC:['#2775CA','#5BA0E0'], LINK:['#2A5ADA','#3D7BE0'], AVAX:['#E84142','#F47678'],
    HYPE:['#9bf4cf','#22d1ee'],
    NVDA:['#76B900','#A6E22E'], TSLA:['#E31937','#FF6B7A'], MSTR:['#F7931A','#FFB860'], 'S&P':['#2A6FDB','#5B9BF0'],
    OPENAI:['#10A37F','#1FD6A6'], SPACEX:['#1B3A6B','#3D6FB0'], STRIPE:['#635BFF','#9B8BFF'],
    GOLD:['#D4AF37','#F0D98A'], OIL:['#3A3A3A','#6B6B6B'], SILVER:['#9CA3AF','#C8CDD6'], COPPER:['#B87333','#D9955B'], NATGAS:['#2A6FDB','#5B9BF0'],
    EUR:['#2A6FDB','#5B9BF0'], GBP:['#5436D9','#7C5BFF'], JPY:['#C0392B','#E07065'],
    XYZ:['#7C5BFF','#A78BFF'], XYZ100:['#7C5BFF','#A78BFF'], MU:['#0A2540','#3D6FB0'], SKHX:['#E84142','#F47678'], SPCX:['#1B3A6B','#3D6FB0'], SNDK:['#E31937','#FF6B7A'], INTC:['#0071C5','#4DA6E0'], MRVL:['#0A2540','#3D6FB0']
  };
  const key = map[sym] ? sym : (map[String(sym).replace(/[0-9]+$/,'')] ? String(sym).replace(/[0-9]+$/,'') : sym);
  const [c1,c2] = map[key] || ['#5436D9','#7C5BFF'];
  const glyph = /[0-9]/.test(String(sym)) ? String(sym).replace(/[^0-9]/g,'').slice(0,3) : String(sym).slice(0,1);
  const SU = String(sym).toUpperCase();
  // Crypto → real coin art (spothq CDN). Stocks/Pre-IPO → official company logo (Clearbit).
  // Commodities → symbol glyph. All degrade to the colored lettermark on error.
  const CRYPTO = { BTC:1,ETH:1,SOL:1,AVAX:1,LINK:1,XRP:1,ADA:1,ARB:1,DOT:1,LTC:1,UNI:1,MATIC:1,USDC:1,BCH:1,XLM:1,ATOM:1,NEAR:1,APT:1,OP:1 };
  const STOCK = { NVDA:'nvidia.com', TSLA:'tesla.com', MSTR:'microstrategy.com', AAPL:'apple.com', META:'meta.com', AMZN:'amazon.com', GOOGL:'google.com', MSFT:'microsoft.com', AMD:'amd.com', COIN:'coinbase.com', OPENAI:'openai.com', SPACEX:'spacex.com', STRIPE:'stripe.com', ANTHRP:'anthropic.com', DBRX:'databricks.com', REVLT:'revolut.com', CANVA:'canva.com', EPIC:'epicgames.com' };
  const cdn = CRYPTO[SU] ? `https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/128/color/${String(sym).toLowerCase()}.png` : null;
  const LOCAL = { HYPE:'assets/hype.png', NATGAS:'assets/natgas.png', DOGE:'assets/doge.png', GOLD:'assets/gold.png', SILVER:'assets/silver.png', SUI:'assets/sui.png' };
  const LOCAL_BG = { HYPE:'#0A2E28', NATGAS:'#0A1A2E', DOGE:'var(--surface-elevated)', GOLD:'var(--surface-elevated)', SILVER:'var(--surface-elevated)', SUI:'#4A9FF5' };
  const local = LOCAL[SU];
  const dom = STOCK[SU];
  const COMMOD = { COPPER:'🥉', OIL:'🛢️', BRENT:'🛢️', WHEAT:'🌾', PLAT:'💠' };
  const emoji = COMMOD[SU] || null;
  // FX pairs → real circular country-flag icons (hatscripts/circle-flags CDN, no key).
  const FX_FLAG = { EUR:'eu', GBP:'gb', JPY:'jp', CAD:'ca', AUD:'au', CHF:'ch', CNH:'cn', CNY:'cn', NZD:'nz', SGD:'sg', HKD:'hk', SEK:'se', NOK:'no', MXN:'mx', ZAR:'za', TRY:'tr', INR:'in', KRW:'kr' };
  const flag = FX_FLAG[SU] ? `https://cdn.jsdelivr.net/gh/hatscripts/circle-flags@gh-pages/flags/${FX_FLAG[SU]}.svg` : null;
  // Listed tickers → Parqet logo (no token). Pre-IPO (no real ticker) → favicon by domain.
  const REALTICKER = { NVDA:1,TSLA:1,MSTR:1,AAPL:1,META:1,AMZN:1,GOOGL:1,MSFT:1,AMD:1,COIN:1 };
  const favico = dom ? `https://www.google.com/s2/favicons?domain=${dom}&sz=128` : null;
  const logoPrimary = dom ? (REALTICKER[SU] ? `https://assets.parqet.com/logos/symbol/${SU}?format=png&size=128` : favico) : null;
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0, position:'relative', overflow:'hidden',
      background: local ? (LOCAL_BG[SU]||'#0A2E28') : (emoji==='⚛️' ? '#123D33' : (emoji ? 'var(--glass-control-bg)' : (dom ? '#fff' : `linear-gradient(135deg, ${c1}, ${c2})`))),
      border: 'none',
      display:'flex', alignItems:'center', justifyContent:'center',
      font:`700 ${Math.max(9, Math.round(size*0.4))}px var(--font-body)`, color: dom ? 'var(--text-primary)' : '#fff'
    }}>
      <span style={emoji ? {fontSize:Math.round(size*0.52), lineHeight:1} : undefined}>{emoji || (size >= 20 ? glyph : '')}</span>
      {local && <img src={local} alt="" onError={(e)=>{ e.target.style.display='none'; }} style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover'}}/>}
      {cdn && <img src={cdn} alt="" onError={(e)=>{ e.target.style.display='none'; }} style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover'}}/>}
      {flag && <img src={flag} alt="" onError={(e)=>{ e.target.style.display='none'; }} style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover'}}/>}
      {dom && <img src={logoPrimary} alt="" data-fb="0" onError={(e)=>{ const s=e.target; if(s.dataset.fb==='0' && favico && s.src!==favico){ s.dataset.fb='1'; s.src=favico; } else { s.style.display='none'; } }} style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover'}}/>}
    </div>
  );
}

/* ─── Sparkline (inline, 60×24, tight) ──────────────────── */
function Spark({ data, positive, muted = false, w=64, h=24 }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = (max - min) || 1;
  const pts = data.map((v,i) => `${(i/(data.length-1))*w},${h - ((v-min)/range)*h}`).join(' ');
  const stroke = muted
    ? 'var(--text-tertiary)'
    : (positive?'var(--regime-up-mid)':'var(--regime-down-mid)');
  return (
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── List row · regime color is vocabulary, lives on the numeric only ─── */
function ListRow({ sym, name, price, delta, deltaPct, sparkline, shares, onClick }) {
  const positive = delta >= 0;
  return (
    <button onClick={onClick} className="arx-row-press" style={{
      width:'100%', display:'flex', alignItems:'center', gap:14, padding:'12px 20px',
      background:'transparent', border:'none', cursor:'pointer', textAlign:'left'
    }}>
      <AssetGlyph sym={sym}/>
      <div style={{flex:1, minWidth:0}}>
        <div style={{font:'600 15px var(--font-body)', color:'var(--text-primary)', lineHeight:1.2}}>{sym}</div>
        <div style={{
          font:'500 12px var(--font-body)', color:'var(--text-tertiary)',
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginTop:2
        }}>{shares ? `${shares} ${sym}` : name}</div>
      </div>
      {sparkline && <Spark data={sparkline} positive={positive} muted/>}
      <div style={{textAlign:'right', minWidth:78}}>
        <div className="num" style={{font:'500 14px var(--font-mono)', color:'var(--text-primary)'}}>
          ${price.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}
        </div>
        <div className="num" style={{
          font:'500 12px var(--font-mono)', marginTop:2,
          color: positive?'var(--regime-up-mid)':'var(--regime-down-mid)'
        }}>{positive?'+':'−'}{Math.abs(deltaPct).toFixed(2)}%</div>
      </div>
      <IconChevron color="var(--text-tertiary)" size={14}/>
    </button>
  );
}

/* ─── Brand wordmark ─── */
function ArxWordmark({ color = 'var(--color-violet-500)', height = 22 }) {
  return (
    <svg height={height} viewBox="0 0 379 146" fill={color} aria-label="arx" style={{display:'block'}}>
      <path fillRule="nonzero" d="M 69.299 0 C 81.115 0 91.502 1.929 100.462 5.771 C 109.412 9.624 116.351 15.177 121.278 22.428 L 121.283 22.428 C 126.205 29.684 128.671 38.327 128.671 48.352 L 128.671 143.447 L 90.794 143.447 L 90.794 130.282 C 85.061 135.478 78.571 139.414 71.32 142.1 C 64.069 144.785 56.32 146.128 48.088 146.128 C 38.591 146.128 30.226 144.385 22.97 140.889 C 15.714 137.392 10.073 132.47 6.045 126.112 C 2.017 119.76 0 112.459 0 103.685 C 0 94.91 1.748 87.566 5.239 81.658 C 8.731 75.745 14.058 70.91 21.222 67.15 C 28.38 63.391 37.697 60.437 49.157 58.288 L 89.72 50.231 L 89.72 49.963 C 89.72 44.587 87.703 40.382 83.675 37.335 C 79.646 34.293 74.861 32.77 68.767 32.77 C 62.673 32.77 57.39 34.112 52.917 36.798 C 48.439 39.488 45.398 44.006 43.786 49.377 L 2.686 49.377 C 3.936 39.172 7.476 29.908 13.297 22.564 C 19.112 15.225 26.768 9.629 36.261 5.776 C 45.748 1.929 56.764 0 69.299 0 Z M 266.399 2.314 C 272.562 2.315 278.333 5.347 281.834 10.42 L 288.548 20.162 C 295.633 30.441 310.516 30.836 318.192 21.314 C 318.472 20.973 318.993 20.251 319.008 20.23 L 319.35 19.737 L 331.587 2.456 L 379 2.456 L 335.737 58.498 C 330.669 65.095 330.625 74.265 335.62 80.911 L 359.034 112.055 C 368.76 124.99 359.531 143.477 343.345 143.477 C 337.256 143.477 331.563 140.487 328.101 135.478 L 317.489 120.106 C 310.16 109.491 294.5 109.432 287.088 119.984 L 270.589 143.477 L 223.444 143.477 L 270.384 82.176 C 270.384 82.176 270.75 81.688 270.921 81.438 C 275.438 74.905 275.296 66.169 270.477 59.772 L 250.783 33.619 C 241.086 20.738 250.276 2.314 266.399 2.314 Z M 184.713 28.145 C 184.951 14.054 196.445 2.705 210.592 2.705 C 224.887 2.705 236.477 14.294 236.477 28.59 C 236.477 42.886 224.887 54.475 210.592 54.475 C 196.445 54.475 184.951 43.125 184.713 29.035 L 184.713 143.442 L 143.344 143.442 L 143.344 2.686 L 184.713 2.686 L 184.713 28.145 Z M 94.51 64.284 C 80.212 64.284 68.625 75.872 68.625 90.169 C 68.625 104.466 80.217 116.054 94.51 116.054 C 108.807 116.054 120.394 104.466 120.395 90.169 C 120.395 75.872 108.807 64.284 94.51 64.284 Z"/>
    </svg>
  );
}

/* ─── Brand a-mark only ─── */
function ArxAMark({ color = 'var(--color-violet-500)', size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="-12 -10 102 110" fill={color} style={{display:'block'}}>
      <path fillRule="nonzero" d="M 41.689 0 C 48.798 0 55.046 1.16 60.437 3.472 C 65.821 5.789 69.995 9.13 72.959 13.492 L 72.962 13.492 C 75.923 17.857 77.406 23.056 77.406 29.087 L 77.406 86.295 L 54.62 86.295 L 54.62 78.375 C 51.171 81.5 47.267 83.869 42.905 85.484 C 38.543 87.1 33.881 87.907 28.929 87.907 C 23.215 87.907 18.183 86.859 13.818 84.756 C 9.453 82.653 6.06 79.692 3.637 75.867 C 1.213 72.046 0 67.654 0 62.375 C 0 57.096 1.052 52.678 3.152 49.124 C 5.253 45.567 8.457 42.658 12.767 40.396 C 17.073 38.135 22.678 36.357 29.572 35.064 L 53.974 30.218 L 53.974 30.057 C 53.974 26.822 52.76 24.293 50.337 22.46 C 47.914 20.63 45.035 19.714 41.369 19.714 C 37.703 19.714 34.525 20.521 31.834 22.137 C 29.14 23.755 27.31 26.473 26.341 29.704 L 1.616 29.704 C 2.368 23.565 4.498 17.992 7.999 13.574 C 11.498 9.159 16.104 5.792 21.814 3.475 C 27.522 1.16 34.149 0 41.689 0 Z M 56.855 38.672 C 48.255 38.672 41.284 45.643 41.284 54.244 C 41.284 62.845 48.258 69.815 56.855 69.815 C 65.456 69.815 72.428 62.845 72.428 54.244 C 72.428 45.643 65.456 38.672 56.855 38.672 Z"/>
    </svg>
  );
}

/* ─── Insight card · solid surface, leading symbol, single arrival animation ─── */
function Insight({ asset, title, body, time, tone = 'violet', onClick }) {
  const tones = {
    violet:  { ink:'var(--color-violet-500)',  tint:'rgba(124,91,255,.14)' },
    up:      { ink:'var(--regime-up-mid)',     tint:'rgba(45,212,155,.14)'  },
    down:    { ink:'var(--regime-down-mid)',   tint:'rgba(242,106,106,.14)' },
    warn:    { ink:'var(--regime-trans-mid)',  tint:'rgba(251,191,36,.16)'  },
    info:    { ink:'var(--regime-range-mid)',  tint:'rgba(59,130,246,.14)'  },
    delight: { ink:'var(--color-violet-500)',  tint:'rgba(124,91,255,.14)' },
  };
  const t = tones[tone];
  return (
    <button onClick={onClick} className="arx-press arx-arrive" style={{
      width:'calc(100% - 32px)', margin:'8px 20px', padding:'12px 12px 12px 14px',
      display:'flex', gap:12, alignItems:'center',
      background:'var(--surface-elevated)', border:'.5px solid var(--border-default)',
      borderRadius:14, cursor:'pointer', textAlign:'left',
      boxShadow:'var(--shadow-card)'
    }}>
      <div style={{
        width:36, height:36, borderRadius:'50%', flexShrink:0,
        background:t.tint, color:t.ink,
        display:'flex', alignItems:'center', justifyContent:'center'
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          {tone==='up'      && <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>}
          {tone==='down'    && <><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></>}
          {tone==='warn'    && <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}
          {tone==='info'    && <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}
          {tone==='violet'  && <><path d="M12 3 L20 12 L12 21 L4 12 Z"/><path d="M12 7.5 L16.5 12 L12 16.5 L7.5 12 Z" opacity=".5"/></>}
          {tone==='delight' && <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>}
        </svg>
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:'flex', gap:6, alignItems:'baseline', marginBottom:2}}>
          {asset && <span style={{
            font:'600 11px var(--font-body)', color:t.ink, letterSpacing:'.02em'
          }}>{asset}</span>}
          <span style={{font:'600 15px var(--font-body)', color:'var(--text-primary)', letterSpacing:'-0.005em'}}>{title}</span>
        </div>
        <div style={{font:'400 13px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.4}}>{body}</div>
        <div style={{
          font:'500 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:4
        }}>{time}</div>
      </div>
      <IconChevron color="var(--text-tertiary)"/>
    </button>
  );
}

/* ─── Liquid Glass sheet (iOS-26 modal · thick material · multi-detent shape) ─── */
/* ─── GlassSheet · retained name → routes to the canonical solid Sheet ───
   The DS forbids text on glass, and every call-site is a content sheet, so
   GlassSheet now renders the solid Sheet shell. One shell, zero call-site churn. */
function GlassSheet(props) { return <Sheet {...props}/>; }

/* ─── Sheet · canonical detented bottom-sheet shell (solid · text-safe) ───
   One shell for every commit/flow sheet: scrim · 36×5 grabber · 28px top radius
   · 380ms iOS rise · scrim-tap dismiss · safe-area. Replaces per-feature wrappers. */
function Sheet({ children, onClose, maxHeight = '88%', dismissible = true, zIndex = 75 }) {
  return (
    <div onClick={dismissible ? onClose : undefined} style={{
      position:'absolute', inset:0, zIndex, display:'flex', flexDirection:'column', justifyContent:'flex-end',
      background:'rgba(6,4,18,.46)', backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)',
      animation:'fadeIn 250ms cubic-bezier(.32,.72,0,1)'
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:'var(--surface-base)', borderRadius:'28px 28px 0 0', borderTop:'.5px solid var(--border-strong)',
        maxHeight, overflow:'auto', paddingBottom:'calc(10px + env(safe-area-inset-bottom))',
        boxShadow:'0 -16px 40px rgba(0,0,0,.28)', animation:'slideUp 380ms cubic-bezier(.32,.72,0,1) both'
      }}>
        <div style={{display:'flex', justifyContent:'center', padding:'10px 0 4px'}}>
          <div style={{width:36, height:5, borderRadius:3, background:'var(--text-tertiary)', opacity:.4}}/>
        </div>
        {children}
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </div>
  );
}

/* ─── Ticker · canonical live marquee — eyebrow + edge-faded auto-scroll, hover-pause ───
   One shell for Home news, Copy smart-money trades, Markets movers. Chips are content-typed
   per surface (passed via renderChip); the marquee mechanics (3× loop · mask · pause) live here. */
function Ticker({ label, items, renderChip, duration = 44, compact = false }) {
  if (!items || !items.length) return null;
  const lane = (p) => items.map((it, i) => <React.Fragment key={p + i}>{renderChip(it, i)}</React.Fragment>);
  const trackRef = React.useRef(null);
  const pause = () => { if (trackRef.current) trackRef.current.style.animationPlayState = 'paused'; };
  const resume = () => { if (trackRef.current) trackRef.current.style.animationPlayState = 'running'; };
  const hoverProps = { onMouseEnter:pause, onMouseLeave:resume, onTouchStart:pause, onTouchEnd:resume, onTouchCancel:resume };
  if (compact) {
    // FYI strip — slim marquee, optional inline pill label, no bulky header line.
    return (
      <div className="arx-marq" {...hoverProps} style={{overflow:'hidden', margin:'0 0 12px', height:30, display:'flex', alignItems:'center', WebkitMaskImage:'linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)', maskImage:'linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)'}}>
        {label && (
          <div style={{flexShrink:0, display:'inline-flex', alignItems:'center', gap:5, padding:'0 12px 0 20px'}}>
            <span className="arx-breath" style={{width:5, height:5, borderRadius:'50%', background:'var(--regime-up-mid)'}}/>
            <span style={{font:'700 9px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.06em', textTransform:'uppercase'}}>{label}</span>
          </div>
        )}
        {!label && <div style={{flexShrink:0, width:20}}/>}
        <div ref={trackRef} className="arx-marq-track" style={{display:'inline-flex', alignItems:'center', animation:`arxMarq ${duration}s linear infinite`, willChange:'transform'}}>
          {lane('a')}{lane('b')}{lane('c')}
        </div>
        <style>{`@keyframes arxMarq{from{transform:translateX(0)}to{transform:translateX(-33.333%)}}`}</style>
      </div>
    );
  }
  return (
    <>
      {label && (
      <div style={{display:'flex', alignItems:'center', gap:7, padding:'2px 20px 8px'}}>
        <span className="arx-breath" style={{width:6, height:6, borderRadius:'50%', background:'var(--regime-up-mid)'}}/>
        <span style={{font:'700 11px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.07em', textTransform:'uppercase'}}>{label}</span>
      </div>
      )}
      <div className="arx-marq" {...hoverProps} style={{overflow:'hidden', margin:'0 0 16px', height:38, display:'flex', alignItems:'center', borderTop:'.5px solid var(--border-default)', borderBottom:'.5px solid var(--border-default)', WebkitMaskImage:'linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent)', maskImage:'linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent)'}}>
        <div ref={trackRef} className="arx-marq-track" style={{display:'inline-flex', alignItems:'center', animation:`arxMarq ${duration}s linear infinite`, willChange:'transform'}}>
          {lane('a')}{lane('b')}{lane('c')}
        </div>
        <style>{`@keyframes arxMarq{from{transform:translateX(0)}to{transform:translateX(-33.333%)}}`}</style>
      </div>
    </>
  );
}

/* ─── Top bar — iOS large-title pattern · big bold sentence case ─── */
function HeaderBalance({ balance, risk }) {
  const r = { normal:'var(--regime-up-mid)', elevated:'var(--regime-trans-mid)', critical:'var(--regime-down-mid)' }[risk] || 'var(--regime-up-mid)';
  return (
    <button onClick={()=>window.__arxGoTab && window.__arxGoTab('you')} className="arx-press" aria-label="Balance and risk" style={{
      display:'inline-flex', alignItems:'center', gap:7, height:36, padding:'0 12px', borderRadius:999, cursor:'pointer',
      background:'var(--glass-control-bg-strong)', border:'.5px solid var(--glass-tab-border)',
      backdropFilter:'blur(20px) saturate(180%)', WebkitBackdropFilter:'blur(20px) saturate(180%)'
    }}>
      <span className="arx-breath" style={{width:7, height:7, borderRadius:'50%', background:r, boxShadow:'0 0 6px '+r, flexShrink:0}}/>
      <span className="num" style={{font:'600 13px var(--font-mono)', color:'var(--text-primary)'}}>{balance}</span>
    </button>
  );
}
/* ─── Carousel · scroll-snap pager with dots (hero estate: equity ⇄ brief) ─── */
function Carousel({ children, gap = 12, dots = true }) {
  const slides = React.Children.toArray(children).filter(Boolean);
  const [idx, setIdx] = _arxUseState(0);
  const [h, setH] = _arxUseState(null);
  const ref = _arxUseRef(null);
  const slideRefs = _arxUseRef([]);
  const measure = (i) => { const el = slideRefs.current[i]; if (el) setH(el.offsetHeight); };
  _arxUseEffect(() => { measure(idx); }, [idx, slides.length]);
  _arxUseEffect(() => {
    const ro = new ResizeObserver(() => measure(idx));
    slideRefs.current.forEach(el => el && ro.observe(el));
    return () => ro.disconnect();
  }, [idx, slides.length]);
  const onScroll = () => { const el = ref.current; if (!el) return; const w = el.clientWidth || 1; const n = Math.round(el.scrollLeft / w); if (n !== idx) setIdx(n); };
  return (
    <div>
      <div ref={ref} onScroll={onScroll} style={{ display:'flex', overflowX:'auto', overflowY:'hidden', scrollSnapType:'x mandatory', scrollbarWidth:'none', WebkitOverflowScrolling:'touch', gap, height: h ? h + 'px' : undefined, transition:'height 260ms cubic-bezier(.2,.7,.2,1)', alignItems:'flex-start' }}>
        {slides.map((s,i) => (
          <div key={i} ref={el => slideRefs.current[i] = el} style={{ flex:'0 0 100%', minWidth:'100%', scrollSnapAlign:'center', alignSelf:'flex-start' }}>{s}</div>
        ))}
      </div>
      {dots && slides.length > 1 && (
        <div style={{ display:'flex', justifyContent:'center', gap:6, padding:'10px 0 2px' }}>
          {slides.map((_,i) => (
            <span key={i} style={{ width: i===idx?18:6, height:6, borderRadius:999, background: i===idx?'var(--color-violet-500)':'var(--border-strong)', transition:'width 240ms, background 240ms' }}/>
          ))}
        </div>
      )}
    </div>
  );
}

function TopBar({ title, subtitle, balance, risk = 'normal', stage, bellCount = 0, onProfile }) {
  const liveStage = stage || (()=>{ try { return localStorage.getItem('arx-lifecycle') || 'active'; } catch(e) { return 'active'; } })();
  const st = (window.arxStageState ? window.arxStageState(liveStage) : { canTrade:true, equity:24837 });
  const eq = st.equity != null ? st.equity : 24837;
  const unfunded = eq <= 0;
  const balStr = window.arxFmtUSD ? window.arxFmtUSD(eq) : (balance || '$24,837');
  const riskDot = risk === 'critical' ? 'var(--regime-down-mid)' : risk === 'warn' ? 'var(--regime-trans-mid)' : 'var(--regime-up-mid)';
  const openWallet = () => window.__arxOpenSub && window.__arxOpenSub('wallet');
  const openBell = () => window.__arxOpenSub && window.__arxOpenSub('notifications');
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 20px 8px', gap:10 }}>
      <div style={{ minWidth:0 }}>
        <div style={{ font:'700 24px var(--font-brand)', letterSpacing:'-0.02em', color:'var(--text-primary)', lineHeight:1.1 }}>{title}</div>
        {subtitle && (
          <div style={{ display:'flex', alignItems:'center', gap:7, marginTop:3 }}>
            <span className="arx-breath" style={{ width:6, height:6, borderRadius:'50%', background:'var(--regime-up-mid)', boxShadow:'0 0 7px var(--regime-up-mid)', flexShrink:0 }}/>
            <span style={{ font:'600 10px var(--font-mono)', color:'var(--text-secondary)', letterSpacing:'.04em' }}>LIVE ON HYPERLIQUID</span>
            <span className="num" style={{ font:'500 10px var(--font-mono)', color:'var(--text-tertiary)' }}>· {subtitle}</span>
          </div>
        )}
      </div>
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        {unfunded ? (
          <button onClick={openWallet} className="arx-press" aria-label="Add funds" style={{ display:'flex', alignItems:'center', gap:6, height:44, padding:'0 16px 0 13px', borderRadius:999, border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'700 12.5px var(--font-body)', boxShadow:'0 4px 12px rgba(124,91,255,.3)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add funds
          </button>
        ) : (
          <button onClick={openWallet} className="arx-press" aria-label="Wallet" style={{ display:'flex', alignItems:'center', gap:7, height:44, padding:'0 14px', borderRadius:999, cursor:'pointer',
            background:'var(--glass-control-bg-strong)', backdropFilter:'blur(20px) saturate(180%)', WebkitBackdropFilter:'blur(20px) saturate(180%)', border:'.5px solid var(--border-default)' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:riskDot, boxShadow:'0 0 6px '+riskDot, flexShrink:0 }}/>
            <span className="num" style={{ font:'600 13px var(--font-mono)', color:'var(--text-primary)' }}>{balStr}</span>
          </button>
        )}
        <CircleBtn onClick={openBell}>
          <IconBell size={18} color="var(--text-primary)"/>
          {bellCount>0 && <span style={{ position:'absolute', top:6, right:6, width:8, height:8, borderRadius:'50%', background:'var(--regime-down-mid)', border:'1.5px solid var(--surface-base)' }}/>}
        </CircleBtn>
      </div>
    </div>
  );
}

function CircleBtn({ children, onClick }) {
  // Liquid-glass chrome · theme-aware
  return (
    <button onClick={onClick} style={{
      width:44, height:44, borderRadius:'50%', position:'relative',
      background:'var(--glass-control-bg-strong)',
      backdropFilter:'blur(20px) saturate(180%)',
      WebkitBackdropFilter:'blur(20px) saturate(180%)',
      border:'.5px solid var(--glass-tab-border)',
      boxShadow:'inset 0 .5px 0 rgba(255,255,255,.12)',
      display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'
    }}>{children}</button>
  );
}

/* ─── Bottom tab bar · iOS-26 floating pill · bespoke displaced-circle icons ─── */
/* Each glyph carries the wordmark's displaced-circle signature — the circle sits where the counter would. */
const TabIcon = ({ id, active }) => {
  const c = 'currentColor';
  const paths = {
    home: <>
      <path d="M4 10.2 L12 3.6 L20 10.2 V19 a1.6 1.6 0 0 1-1.6 1.6 H5.6 A1.6 1.6 0 0 1 4 19 Z"/>
      <circle cx="12" cy="14.6" r="2.5" fill={active?c:'none'}/>
    </>,
    wallets: <>
      <rect x="8.2" y="8.2" width="12" height="12" rx="3"/>
      <path d="M4 15.4 V6.6 A2.6 2.6 0 0 1 6.6 4 h8.8" opacity=".75"/>
      <circle cx="14.2" cy="14.2" r="2.3" fill={active?c:'none'}/>
    </>,
    trade: <>
      <path d="M13.2 9.6 V3.4 L4.6 13.8 h6.2 v6.8 L19.4 10.2 h-6.2 Z"/>
      <circle cx="18.2" cy="5" r="1.9" fill={active?c:'none'}/>
    </>,
    markets: <>
      <line x1="4.4" y1="19.6" x2="4.4" y2="12.4"/>
      <line x1="9.6" y1="19.6" x2="9.6" y2="8.6"/>
      <line x1="14.8" y1="19.6" x2="14.8" y2="14.2"/>
      <line x1="20" y1="19.6" x2="20" y2="9.4"/>
      <circle cx="9.6" cy="4.8" r="1.9" fill={active?c:'none'}/>
    </>,
    you: <>
      <path d="M4.6 20.4 v-1.2 a5.8 5.8 0 0 1 5.8-5.8 h3.2 a5.8 5.8 0 0 1 5.8 5.8 v1.2"/>
      <circle cx="13.4" cy="6.8" r="3.4" fill={active?c:'none'}/>
    </>,
  };
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={active?2:1.7}
         strokeLinecap="round" strokeLinejoin="round">{paths[id]}</svg>
  );
};

function BottomTabBar({ active, onChange }) {
  const tabs = [
    { id:'home',    label:'Home' },
    { id:'wallets', label:'Copy' },
    { id:'trade',   label:'Trade' },
    { id:'markets', label:'Markets' },
    { id:'you',     label:'You' },
  ];
  const activeIdx = Math.max(0, tabs.findIndex(t => t.id === active));
  return (
    <div style={{
      position:'absolute', left:14, right:14, bottom:14, height:66,
      background:'var(--glass-tab-bg)',
      backdropFilter:'blur(22px) saturate(140%)',
      WebkitBackdropFilter:'blur(22px) saturate(140%)',
      border:'.5px solid var(--glass-tab-border)',
      borderRadius:33,
      boxShadow:'0 8px 24px rgba(0,0,0,.10)',
      display:'flex', alignItems:'center', padding:'0 8px', zIndex:40
    }}>
      {/* sliding active pill — calm glide to match the uploaded design (no overshoot) */}
      <span aria-hidden="true" style={{
        position:'absolute', top:16, left:8, width:`calc((100% - 16px) / ${tabs.length})`, height:34,
        transform:`translateX(${activeIdx * 100}%)`,
        transition:'transform 380ms cubic-bezier(.4,0,.2,1)',
        pointerEvents:'none', display:'flex', justifyContent:'center'
      }}>
        <span style={{ width:50, height:34, borderRadius:18, background:'rgba(124,91,255,.16)' }}/>
      </span>
      {tabs.map(t => {
        const isActive = active === t.id;
        const color = isActive ? 'var(--color-violet-600)' : 'var(--text-tertiary)';
        return (
          <button key={t.id} onClick={()=>onChange(t.id)} style={{
            flex:1, height:54, background:'none', border:'none', cursor:'pointer',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2,
            position:'relative', padding:0, color
          }}>
            <span style={{
              position:'relative', display:'flex',
              transform: isActive ? 'scale(1.06)' : 'scale(1)',
              transition:'transform 300ms cubic-bezier(.4,0,.2,1)'
            }}>
              <TabIcon id={t.id} active={isActive}/>
            </span>
            <span style={{
              font:`${isActive?700:500} 9.5px var(--font-body)`, color,
              letterSpacing:'.01em', position:'relative',
              transition:'color 240ms ease'
            }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Regime pill (iOS-26 capsule · thin material · SF-style dot) ─── */
function RegimePill({ regime, day, size = 'md' }) {
  const map = {
    up: ['var(--regime-up-mid)','Trending up'],
    down: ['var(--regime-down-mid)','Trending down'],
    range: ['var(--regime-range-mid)','Range-bound'],
    transition: ['var(--regime-trans-mid)','Transition'],
    compression: ['var(--regime-comp-mid)','Compression'],
    crisis: ['var(--regime-crisis-mid)','Crisis'],
  };
  const [c, label] = map[regime] || map.range;
  const h = size==='sm'?24:28;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:7, height:h,
      padding:'0 12px', borderRadius:999,
      background:'var(--glass-control-bg-strong)',
      backdropFilter:'blur(20px) saturate(180%)',
      WebkitBackdropFilter:'blur(20px) saturate(180%)',
      border:'.5px solid var(--glass-tab-border)',
      boxShadow:'inset 0 .5px 0 rgba(255,255,255,.10)'
    }}>
      <span style={{width:7, height:7, borderRadius:'50%', background:c, boxShadow:`0 0 6px ${c}`}}/>
      <span style={{font:'600 12px var(--font-body)', color:'var(--text-primary)', letterSpacing:'-0.005em'}}>{label}</span>
      {day != null && <span className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-secondary)'}}>Day {day}</span>}
    </span>
  );
}

/* ─── ConfirmAction · THE standard commit control (trade + copy) ───────────
   One component, all states built in:
     · method: 'hold' (press-and-hold ring) | 'slide' (drag-to-end) — user-chosen, consistent app-wide
     · express: single-tap commit (earned via T3 consent)
     · tone: violet (default) · up (long/buy) · down (short/sell/close)
     · lifecycle: idle → arming → signing → submitted → pending → filled (on-chain receipt)
   Pass `action` (verb phrase e.g. "open long", "start copying"); the label is built per method. ─── */
function useConfirmMethod() {
  const read = () => { try { return localStorage.getItem('arx-confirm-method') || 'slide'; } catch(e) { return 'slide'; } };
  const [m, setM] = _arxUseState(read);
  _arxUseEffect(() => { const h = () => setM(read()); window.addEventListener('arx-confirm-method', h); return () => window.removeEventListener('arx-confirm-method', h); }, []);
  const set = (v) => { try { localStorage.setItem('arx-confirm-method', v); } catch(e){} setM(v); window.dispatchEvent(new Event('arx-confirm-method')); };
  return [m, set];
}
const _CONFIRM_TONE = {
  violet: ['var(--color-violet-500)', '#fff', 'var(--shadow-execute)'],
  up:     ['var(--regime-up-mid)', '#06140F', '0 8px 22px rgba(45,212,155,.32)'],
  down:   ['var(--regime-down-mid)', '#fff', '0 8px 22px rgba(242,106,106,.30)'],
};
function ConfirmAction({ action, label, consequence, onConfirm, express = false, tone = 'violet', method }) {
  const [savedMethod] = useConfirmMethod();
  const m = method || savedMethod;                 // 'hold' | 'slide'
  const [phase, setPhase] = _arxUseState('idle');  // idle | arming | signing | submitted | pending | filled
  const raf = _arxUseRef(null), t0 = _arxUseRef(null), ringRef = _arxUseRef(null);
  const trackRef = _arxUseRef(null), dragging = _arxUseRef(false);
  const [sx, setSx] = _arxUseState(0);
  const C = 56.5, H = 54, TH = H - 8;
  const [ink, fg, glow] = _CONFIRM_TONE[tone] || _CONFIRM_TONE.violet;
  const verb = action || 'confirm';
  const idleLabel = label || (express ? verb.charAt(0).toUpperCase()+verb.slice(1) : (m==='hold' ? `Hold to ${verb}` : `Slide to ${verb}`));

  const run = () => {
    cancelAnimationFrame(raf.current);
    setPhase('signing');
    setTimeout(()=>setPhase('submitted'), 500);
    setTimeout(()=>setPhase('pending'), 1100);
    setTimeout(()=>{ setPhase('filled'); onConfirm && onConfirm(); }, 2300);
    setTimeout(()=>{ setPhase('idle'); setSx(0); if (ringRef.current) ringRef.current.style.strokeDashoffset = C; }, 4800);
  };
  // hold
  const holdStart = (e) => {
    if (phase!=='idle') return; e.preventDefault();
    if (express) { run(); return; }
    setPhase('arming'); t0.current=null;
    const tick = (ts) => { if(!t0.current)t0.current=ts; const p=Math.min(1,(ts-t0.current)/800); if(ringRef.current)ringRef.current.style.strokeDashoffset=C*(1-p); if(p>=1){run();return;} raf.current=requestAnimationFrame(tick); };
    raf.current=requestAnimationFrame(tick);
  };
  const holdCancel = () => { if(phase!=='arming')return; cancelAnimationFrame(raf.current); if(ringRef.current)ringRef.current.style.strokeDashoffset=C; setPhase('idle'); };
  // slide
  const slideMove = (clientX) => {
    if(!dragging.current || phase!=='idle' && phase!=='arming') return;
    const t=trackRef.current; if(!t)return; const r=t.getBoundingClientRect();
    let nx=Math.max(0, Math.min(clientX-r.left-TH/2, r.width-TH)); setSx(nx); if(phase==='idle')setPhase('arming');
    if(nx>=r.width-TH-6){ dragging.current=false; setSx(r.width-TH); run(); }
  };

  const lifecycle = { signing:['Signing…',ink], submitted:['Submitted · 0x4f…a2','var(--regime-range-mid)'], pending:['On-chain · pending','var(--regime-trans-mid)'], filled:['Filled ✓','var(--regime-up-mid)'] };
  const inFlight = lifecycle[phase];
  const showConsequence = consequence && (!express || (express && phase!=='idle'));

  return (
    <div>
      {showConsequence && <div style={{font:'500 12px var(--font-body)', color:'var(--text-secondary)', marginBottom:8, textAlign:'center'}}>{express && phase!=='idle' ? `Receipt — ${consequence}` : consequence}</div>}

      {/* SLIDE */}
      {m==='slide' && !express && phase!=='filled' && !inFlight ? (
        <div ref={trackRef} style={{position:'relative', height:H, borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid '+ink, overflow:'hidden', boxShadow:glow, touchAction:'none'}}>
          <div style={{position:'absolute', left:0, top:0, bottom:0, width:(sx+TH)+'px', background:ink, opacity:.16}}/>
          <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', font:'700 15px var(--font-body)', color:'var(--text-secondary)', opacity:Math.max(.3, 1-sx/120), pointerEvents:'none'}}>{idleLabel}</div>
          <div onPointerDown={e=>{dragging.current=true; e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>slideMove(e.clientX)} onPointerUp={()=>{dragging.current=false; if(phase!=='signing'&&phase!=='submitted'&&phase!=='pending'){setSx(0); setPhase('idle');}}}
            style={{position:'absolute', top:4, left:4, width:TH, height:TH, borderRadius:13, background:ink, display:'flex', alignItems:'center', justifyContent:'center', cursor:'grab', transform:`translateX(${sx}px)`, transition:dragging.current?'none':'transform 200ms cubic-bezier(.32,.72,0,1)', touchAction:'none'}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"/><polyline points="3 6 9 12 3 18" opacity=".45"/></svg>
          </div>
        </div>
      ) : (
        /* HOLD / EXPRESS / IN-FLIGHT */
        <button onPointerDown={m==='hold'?holdStart:undefined} onPointerUp={m==='hold'?holdCancel:undefined} onPointerLeave={m==='hold'?holdCancel:undefined} onClick={express&&phase==='idle'?run:undefined} style={{
          width:'100%', height:H, borderRadius:16, border:'none',
          cursor: phase==='idle'||phase==='arming'?'pointer':'default',
          background: phase==='filled'?'var(--regime-up-mid)':ink, color: phase==='filled'?'#06140F':fg,
          font:'700 15px var(--font-body)', boxShadow: phase==='filled'?'0 8px 22px rgba(45,212,155,.32)':glow,
          display:'flex', alignItems:'center', justifyContent:'center', gap:10, userSelect:'none', WebkitUserSelect:'none', touchAction:'none', transition:'background 250ms, box-shadow 250ms'
        }}>
          {(phase==='idle'||phase==='arming') && m==='hold' && !express && (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{transform:'rotate(-90deg)'}}>
              <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,.3)" strokeWidth="2.5"/>
              <circle ref={ringRef} cx="12" cy="12" r="9" stroke={fg} strokeWidth="2.5" strokeDasharray={C} strokeDashoffset={C} strokeLinecap="round"/>
            </svg>
          )}
          {phase==='idle' && idleLabel}
          {phase==='arming' && m==='hold' && 'Keep holding…'}
          {inFlight && <span className="num" style={{display:'flex', alignItems:'center', gap:8}}>{phase!=='filled' && <span style={{width:7, height:7, borderRadius:'50%', background:fg, opacity:.9}} className="arx-breath"/>}{inFlight[0]}</span>}
        </button>
      )}
    </div>
  );
}

/* ─── HoldConfirm · legacy wrapper → ConfirmAction (keeps existing call sites working) ─── */
function HoldConfirm({ label, consequence, onConfirm, express = false, tone, method }) {
  // derive a verb from the label so slide/hold labels stay correct under the global method
  const action = (label||'').replace(/^(Hold to|Slide to)\s+/i, '');
  return <ConfirmAction action={action} label={undefined} consequence={consequence} onConfirm={onConfirm} express={express} tone={tone} method={method}/>;
}

/* ─── ExpressConsentSheet · T3 typed consent to enable Express (ConfirmFlow spec) ─── */
function ExpressConsentSheet({ onClose, onEnable }) {
  const [typed, setTyped] = _arxUseState('');
  const ok = typed.trim().toUpperCase() === 'EXPRESS';
  return (
    <GlassSheet onClose={onClose}>
      <div style={{padding:'8px 24px 30px'}}>
        <div style={{font:'700 19px var(--font-body)', marginBottom:8}}>Enable Express</div>
        <div style={{font:'400 13.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.55, marginBottom:14}}>
          Orders will submit on a <b style={{color:'var(--text-primary)'}}>single tap</b> with no hold.
          On-chain fills are final — there is no undo. Applies to order entry only;
          withdrawals and new addresses always keep full confirmation.
        </div>
        <div style={{
          display:'flex', alignItems:'center', height:46, borderRadius:12,
          background:'var(--glass-control-bg)', border:'.5px solid var(--border-strong)',
          padding:'0 14px', marginBottom:12
        }}>
          <input value={typed} onChange={e=>setTyped(e.target.value)} placeholder="Type EXPRESS to confirm"
            style={{flex:1, border:'none', background:'none', outline:'none',
              font:'600 15px var(--font-mono)', letterSpacing:'.08em',
              color:'var(--text-primary)', textTransform:'uppercase'}}/>
          {ok && <IconCheck color="var(--regime-up-mid)" size={16}/>}
        </div>
        <button disabled={!ok} onClick={onEnable} className="arx-press" style={{
          width:'100%', height:50, borderRadius:14, border:'none',
          cursor: ok?'pointer':'default', opacity: ok?1:.4,
          background:'var(--color-violet-500)', color:'#fff',
          font:'700 15px var(--font-body)', boxShadow: ok?'var(--shadow-execute)':'none',
          transition:'opacity 200ms'
        }}>Enable Express</button>
        <button onClick={onClose} style={{
          width:'100%', height:42, marginTop:8, borderRadius:12, border:'none', cursor:'pointer',
          background:'transparent', color:'var(--text-secondary)', font:'600 14px var(--font-body)'
        }}>Keep Hold</button>
      </div>
    </GlassSheet>
  );
}

Object.assign(window, {
  HeroValue, EmptyEquity, LineChart, TimeRangeTabs, SectionHeader, AssetGlyph, Spark, ListRow,
  Insight, GlassSheet, Sheet, Ticker, TopBar, CircleBtn, BottomTabBar, RegimePill,
  ArxWordmark, ArxAMark, Card, ArxAnimStyles, NumberRoll, useScrollReveal, HoldConfirm, ConfirmAction, useConfirmMethod, ExpressConsentSheet, Carousel,
  IconSearch, IconUser, IconHome, IconRadar, IconBolt, IconBars,
  IconUp, IconDown, IconChevron, IconCheck, IconClose, IconBell, IconWallet
});
