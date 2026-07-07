// Arx — competitor-delta features (S2 execution + S7 trust), built on DS tokens.
// Shared, reusable pieces wired into Home / Markets / Trade / Instrument detail / Wallet detail / You.
const { useState: fS, useRef: fR, useEffect: fE } = React;

/* ════════ Mobile-first stat rail — horizontally snap-scrolling metric cards.
   The mobile pattern for >2 toplines (Coinbase/App Store style): one metric per card,
   big number first, label above, context line below, optional micro-viz. ════════ */
function StatCard({ label, value, valueColor, context, contextColor, children, width = 148 }) {
  return (
    <Card animate={false} style={{flexShrink:0, width, scrollSnapAlign:'start'}} padding={'13px 14px 12px'}>
      <div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em', whiteSpace:'nowrap'}}>{label}</div>
      <div className="num" style={{font:'700 22px var(--font-mono)', letterSpacing:'-.02em', marginTop:6, color: valueColor || 'var(--text-primary)', whiteSpace:'nowrap'}}>{value}</div>
      {children}
      {context && <div className="num" style={{font:'500 11px var(--font-mono)', color: contextColor || 'var(--text-tertiary)', marginTop:6, whiteSpace:'nowrap'}}>{context}</div>}
    </Card>
  );
}
function StatRail({ children, footnote }) {
  return (
    <div>
      <div style={{display:'flex', gap:10, overflowX:'auto', padding:'0 20px', scrollSnapType:'x mandatory',
        scrollPaddingLeft:20, scrollbarWidth:'none', WebkitOverflowScrolling:'touch'}}>
        {children}
        <div style={{flexShrink:0, width:10}}/>{/* right inset so the last card clears the screen edge */}
      </div>
      {footnote && <div style={{padding:'8px 20px 0', font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.45}}>{footnote}</div>}
    </div>
  );
}

/* ════════ Market sentiment — DS-native regime gauge (Fear & Greed reframed) ════════ */
function SentimentGauge({ value = 38, compact = false }) {
  const label = value<25?'Extreme fear':value<45?'Fear':value<55?'Neutral':value<75?'Greed':'Extreme greed';
  const ink = value<25?'var(--regime-crisis-mid)':value<45?'var(--regime-down-mid)':value<55?'var(--text-secondary)':value<75?'var(--regime-up-mid)':'var(--regime-up-dark)';
  const bar = (
    <div style={{position:'relative', height:8, borderRadius:4, marginTop: compact?8:12,
      background:'linear-gradient(90deg, var(--regime-down-dark), var(--regime-down-mid) 30%, #9aa0b4 50%, var(--regime-up-mid) 72%, var(--regime-up-dark))'}}>
      <div style={{position:'absolute', top:-4, left:`calc(${value}% - 8px)`, width:16, height:16, borderRadius:'50%',
        background:'var(--surface-elevated)', border:`2.5px solid ${ink}`, boxShadow:'0 1px 5px rgba(0,0,0,.3)'}}/>
    </div>
  );
  if (compact) return <div>{bar}</div>;
  return (
    <Card animate={false} style={{margin:'0 20px'}} padding={16}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
        <span style={{font:'600 11px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.08em', textTransform:'uppercase'}}>Market regime</span>
        <span style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)'}}>updated 4m ago</span>
      </div>
      <div style={{display:'flex', alignItems:'baseline', gap:8, marginTop:6}}>
        <span className="num" style={{font:'700 30px var(--font-mono)', color:ink, letterSpacing:'-0.02em'}}>{value}</span>
        <span style={{font:'600 15px var(--font-body)', color:ink}}>{label}</span>
      </div>
      {bar}
      <div style={{display:'flex', justifyContent:'space-between', marginTop:6, font:'500 11px var(--font-mono)', color:'var(--text-tertiary)'}}>
        <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
      </div>
      <div style={{marginTop:10, font:'400 11px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.45}}>
        Composite of funding, volatility, and smart-money positioning. Context, not a trade signal.
      </div>
    </Card>
  );
}

/* ════════ Quick-actions launcher grid ════════ */
const QA_ICONS = {
  leaderboard:<><path d="M4 20V10M10 20V4M16 20v-7M20 20h-2M20 20H4"/></>,
  watchlist:<><polygon points="12 3 14.5 8.5 20.5 9.2 16 13.3 17.3 19.2 12 16 6.7 19.2 8 13.3 3.5 9.2 9.5 8.5 12 3"/></>,
  calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
  funding:<><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9.5h4a1.5 1.5 0 0 1 0 3h-2a1.5 1.5 0 0 0 0 3h4"/></>,
  vaults:<><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M12 9v-1M12 16v-1"/></>,
  rewards:<><circle cx="12" cy="9" r="5"/><path d="M9 13l-2 8 5-3 5 3-2-8"/></>,
  signals:<><path d="M3 12h4l3-8 4 16 3-8h4"/></>,
  more:<><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></>,
};
function QuickActionsGrid({ items }) {
  const [open, setOpen] = React.useState(false);
  const visible = open ? items : items.slice(0,4);
  return (
    <div style={{padding:'0 16px'}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10}}>
      {visible.map(it => (
        <button key={it.label} onClick={it.onClick} className="arx-press" style={{
          background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:14,
          padding:'12px 4px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:7}}>
          <span style={{width:36, height:36, borderRadius:11, background:'rgba(124,91,255,.12)', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-violet-500)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{QA_ICONS[it.icon]||QA_ICONS.more}</svg>
          </span>
          <span style={{font:'600 11px var(--font-body)', color:'var(--text-secondary)', textAlign:'center', lineHeight:1.1}}>{it.label}</span>
        </button>
      ))}
      </div>
      {items.length>4 && (
        <button onClick={()=>setOpen(!open)} className="arx-press" style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap:5, width:'100%', height:30, marginTop:9,
          background:'none', border:'none', cursor:'pointer', color:'var(--text-tertiary)', font:'600 11.5px var(--font-body)'}}>
          {open?'Show fewer':'More actions'}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" style={{transform:open?'rotate(180deg)':'none', transition:'transform 200ms'}}><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      )}
    </div>
  );
}

/* ════════ Historical performance strip (1h/12h/24h/7d/30d) ════════ */
function EquityBreakdown({ stage = 'active', equity, range, rangeDelta }) {
  const [open, setOpen] = React.useState(false);
  const sc = window.arxStageState ? window.arxStageState(stage) : null;
  const eq = equity != null ? equity : (sc ? sc.equity : 24837.42);
  const dl = rangeDelta != null ? rangeDelta : (sc ? (sc.delta || 0) : 1204.18);
  const dpct = eq > 0 ? (dl / (eq - dl)) * 100 : 0;
  // per-stage allocation mix [perps%, spot%, copies%] — sums to 100, scaled to equity
  const MIX = { funded_no_trade:[0,100,0], first_trade:[23,77,0], copying:[6,24,70], active:[58,37,5], portfolio_monitor:[58,37,5], power_daily:[60,33,7], risk_stress:[68,27,5], dormant_return:[55,36,9] };
  const m = MIX[stage] || [58,37,5];
  const fmtUSD = (v) => '$' + Math.round(v).toLocaleString('en-US');
  const sdStr = (d) => (d>=0?'+':'−') + Math.abs(d).toFixed(1) + '%';
  const defs = [
    { k:'Perps',  pct:m[0], dMul:1.40, ink:'var(--color-violet-500)', tint:'rgba(124,91,255,.07)', subs:[['Crypto',0.64],['RWA',0.21],['FX',0.15]] },
    { k:'Spot',   pct:m[1], dMul:0.20, ink:'var(--regime-up-mid)',    tint:'rgba(45,212,155,.07)', subs:[['USDC',1]] },
    { k:'Copies', pct:m[2], dMul:0.85, ink:'var(--regime-range-mid)', tint:'rgba(59,130,246,.07)', subs:[['@HsakaTrades',0.58],['0x7a3f…c891',0.42]] },
  ];
  const rows = defs.map(s => {
    const val = eq * s.pct / 100;
    const d = dpct * s.dMul;
    return { k:s.k, pct:Math.round(s.pct), ink:s.ink, tint:s.tint, v:fmtUSD(val), dpct:d,
      sub: s.subs.map(([sk,r]) => [sk, fmtUSD(val*r), sdStr(d)]) };
  });
  const Delta = ({d, sz}) => <span className="num" style={{font:`600 ${sz||11.5}px var(--font-mono)`, color: d>=0?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{d>=0?'+':'−'}{Math.abs(d).toFixed(1)}%</span>;
  const ICONS = {
    Perps: <path d="M3 16.5 9 10l4 4 8-8M21 6v5M21 6h-5"/>,
    Spot: <g><ellipse cx="12" cy="6.5" rx="7" ry="3"/><path d="M5 6.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5M5 11.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/></g>,
    Copies: <g><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3.2 3.2 0 0 1 0 6.1M18 18.5a5.5 5.5 0 0 0-3-4.4"/></g>,
  };
  // tier 2 (asset class / leader) → tier 3 (instrument) tree, relative weights
  const TREE = {
    Perps:  [ {k:'Crypto', r:.64, kids:[['BTC',.5],['SOL',.3],['ETH',.2]]}, {k:'RWA', r:.21, kids:[['NVDA',.6],['GOLD',.4]]}, {k:'FX', r:.15, kids:[['EUR',1]]} ],
    Spot:   [ {k:'Crypto', r:.70, kids:[['BTC',.6],['ETH',.4]]}, {k:'Stablecoin', r:.30, kids:[['USDC',1]]} ],
    Copies: [ {k:'@HsakaTrades', r:.58, kids:[['SOL',.5],['BTC',.5]]}, {k:'0x7a3f…c891', r:.42, kids:[['ETH',.6],['HYPE',.4]]} ],
  };
  const [exp, setExp] = React.useState({});
  const tog = (k)=> setExp(p=>Object.assign({}, p, {[k]:!p[k]}));
  const jit = (base, i)=> base*(0.82 + 0.18*((i+1)%3));
  const Chev = ({open}) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0, transform:open?'rotate(90deg)':'none', transition:'transform 200ms'}}><polyline points="9 6 15 12 9 18"/></svg>;
  return (
    <div style={{margin:'2px 20px 4px', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:16, overflow:'hidden'}}>
      {/* TIER 0 — overall allocation bar (the glance) */}
      <div style={{display:'flex', height:7, margin:'12px 14px 0', borderRadius:999, overflow:'hidden', gap:2, background:'var(--surface-base)'}}>
        {rows.map(r => <span key={r.k} style={{width:r.pct+'%', background:r.ink}}/>)}
      </div>
      <div style={{display:'flex', gap:13, padding:'7px 14px 4px', font:'600 9.5px var(--font-body)', color:'var(--text-tertiary)'}}>
        {rows.map(r => <span key={r.k} style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:6, height:6, borderRadius:2, background:r.ink}}/>{r.k} {r.pct}%</span>)}
      </div>
      {/* TIER 1 sleeve → TIER 2 class/leader → TIER 3 instrument, progressive disclosure */}
      <div style={{paddingBottom:2}}>
        {rows.map((r,i) => {
          const sleeveVal = parseFloat(r.v.replace(/[$,]/g,''));
          const open1 = exp[r.k];
          return (
            <div key={r.k} style={{borderTop: i>0?'.5px solid var(--border-default)':'none'}}>
              <button onClick={()=>tog(r.k)} className="arx-row-press" style={{width:'100%', display:'flex', alignItems:'center', gap:11, padding:'8px 14px', background:'none', border:'none', cursor:'pointer', textAlign:'left'}}>
                <span style={{width:30, height:30, borderRadius:9, flexShrink:0, background:r.tint, display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={r.ink} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{ICONS[r.k]}</svg>
                </span>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{font:'600 13.5px var(--font-body)', color:'var(--text-primary)'}}>{r.k}</div>
                  <div style={{font:'500 10.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>{r.pct}% of equity</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <NumberRoll value={sleeveVal} format={v=>'$'+Math.round(v).toLocaleString('en-US')} style={{font:'700 14.5px var(--font-mono)', color:'var(--text-primary)', letterSpacing:'-.01em'}}/>
                  <div style={{marginTop:1}}><Delta d={r.dpct}/></div>
                </div>
                <Chev open={open1}/>
              </button>
              {open1 && (
                <div style={{background:'var(--surface-base)', borderTop:'.5px solid var(--border-default)'}}>
                  {TREE[r.k].map((c,ci) => {
                    const cVal = sleeveVal*c.r, cD = jit(r.dpct, ci), ckey = r.k+'/'+c.k, open2 = exp[ckey];
                    return (
                      <div key={ckey}>
                        <button onClick={()=>tog(ckey)} className="arx-row-press" style={{width:'100%', display:'flex', alignItems:'center', gap:10, padding:'9px 16px 9px 26px', background:'none', border:'none', borderTop: ci>0?'.5px solid var(--border-default)':'none', cursor:'pointer', textAlign:'left'}}>
                          <span style={{width:5, height:5, borderRadius:2, background:r.ink, flexShrink:0, opacity:.7}}/>
                          <span style={{flex:1, font:'600 13px var(--font-body)', color:'var(--text-primary)'}}>{c.k}</span>
                          <span className="num" style={{font:'600 13px var(--font-mono)', color:'var(--text-secondary)'}}>{fmtUSD(cVal)}</span>
                          <span style={{width:46, textAlign:'right'}}><Delta d={cD} sz={11}/></span>
                          <Chev open={open2}/>
                        </button>
                        {open2 && c.kids.map(([nm,kr],ni) => (
                          <div key={ckey+'/'+nm} style={{display:'flex', alignItems:'center', gap:10, padding:'7px 16px 7px 40px', borderTop:'.5px solid var(--border-default)'}}>
                            <AssetGlyph sym={/^[A-Z]+$/.test(nm)?nm:'USDC'} size={18}/>
                            <span style={{flex:1, font:'500 12.5px var(--font-body)', color:'var(--text-secondary)'}}>{nm}</span>
                            <span className="num" style={{font:'500 12px var(--font-mono)', color:'var(--text-tertiary)'}}>{fmtUSD(cVal*kr)}</span>
                            <span style={{width:46, textAlign:'right'}}><Delta d={jit(cD,ni)} sz={10.5}/></span>
                            <span style={{width:13, flexShrink:0}}/>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                  <button onClick={()=>{ const t = r.k==='Copies'?'wallets':'you'; window.__arxGoTab && window.__arxGoTab(t); }} className="arx-press" style={{width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'9px', background:'none', border:'none', borderTop:'.5px solid var(--border-default)', cursor:'pointer', color:'var(--color-violet-400)', font:'600 11px var(--font-body)'}}>
                    {r.k==='Copies'?'Manage copies':'View / manage positions'}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════ Historical performance strip (1h/12h/24h/7d/30d) ════════ */
function HistPerfRow({ data }) {
  return (
    <div style={{display:'flex', gap:1, margin:'0 20px', background:'var(--border-default)', borderRadius:12, overflow:'hidden', border:'.5px solid var(--border-default)'}}>
      {data.map(([w,v]) => (
        <div key={w} style={{flex:1, padding:'9px 4px', background:'var(--surface-elevated)', textAlign:'center'}}>
          <div style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.03em'}}>{w}</div>
          <div className="num" style={{font:'600 12px var(--font-mono)', color: v>=0?'var(--regime-up-mid)':'var(--regime-down-mid)', marginTop:3}}>{v>=0?'+':'−'}{Math.abs(v).toFixed(2)}%</div>
        </div>
      ))}
    </div>
  );
}

/* ════════ PNL Calendar — daily-PnL heatmap (evidence surface) ════════ */
function genPnl(seed=7, n=35) {
  const out = []; let s = seed;
  for (let i=0;i<n;i++){ s=(s*9301+49297)%233280; const r=s/233280; const v = i< (n-30) ? null : Math.round((r-0.42)*Math.pow(r,0.5)*900); out.push(v); }
  return out;
}
function PnlCalendar({ data, title='Daily PnL', sub }) {
  // Build a TRUE daily calendar: 30 real days ending today, padded so each
  // column lands on its real weekday (Mon-first). Makes the M–S labels honest.
  const raw = (data || genPnl()).filter(v=>v!=null).slice(-30);
  const today = new Date();
  const lastDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const firstDate = new Date(lastDate); firstDate.setDate(lastDate.getDate() - (raw.length-1));
  const lead = (firstDate.getDay()+6)%7;           // Mon=0
  const gridStart = new Date(firstDate); gridStart.setDate(firstDate.getDate() - lead);
  const days = [...Array(lead).fill(null), ...raw];
  while (days.length % 7 !== 0) days.push(null);    // trailing pad to full weeks
  const real = days.filter(v=>v!=null);
  const maxAbs = Math.max(1, ...real.map(v=>Math.abs(v)));
  const green = real.filter(v=>v>0).length, total = real.length;
  const net = real.reduce((a,b)=>a+b,0);
  const [sel, setSel] = fS(null);   // selected day index
  const cellColor = (v) => {
    if (v==null) return 'transparent';
    const a = Math.min(1, 0.18 + Math.abs(v)/maxAbs*0.82);
    return v>=0 ? `rgba(20,184,123,${a})` : `rgba(255,77,106,${a})`;
  };
  // Per-day detail (real grid date + deterministic trade breakdown).
  const dayDetail = (i, v) => {
    const d = new Date(gridStart); d.setDate(gridStart.getDate() + i);
    const dateStr = d.toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' });
    if (v == null) return { dateStr, empty:true };
    let s = (i + 1) * 2654435761 % 4294967296;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const SYMS = ['BTC','ETH','SOL','HYPE','ARB','AVAX','WIF','NVDA'];
    const nTrades = 1 + Math.floor(rnd() * 4);
    const rows = [];
    let remaining = v;
    for (let k = 0; k < nTrades; k++) {
      const sym = SYMS[Math.floor(rnd() * SYMS.length)];
      const share = k === nTrades - 1 ? remaining : Math.round(remaining * (0.3 + rnd() * 0.5));
      remaining -= share;
      const dir = (rnd() > 0.5) ? 'Long' : 'Short';
      const lev = [3,5,10,20][Math.floor(rnd()*4)] + '×';
      rows.push({ sym, dir, lev, pnl: share });
    }
    const wins = rows.filter(r=>r.pnl>=0).length;
    return { dateStr, empty:false, rows, wins, n:rows.length };
  };
  const WD = ['M','T','W','T','F','S','S'];
  const detail = sel != null ? dayDetail(sel, days[sel]) : null;
  return (
    <Card animate={false} style={{margin:'0 20px'}} padding={16}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:4}}>
        <span style={{font:'600 13px var(--font-body)'}}>{title}</span>
        <span className="num" style={{font:'600 13px var(--font-mono)', color: net>=0?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{net>=0?'+':'−'}${Math.abs(net).toLocaleString()}</span>
      </div>
      <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginBottom:10}}>{sub || `${green} of ${total} days green · last 30 days`}</div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:5}}>
        {WD.map((d,i)=><div key={i} style={{textAlign:'center', font:'600 9px var(--font-body)', color:'var(--text-tertiary)'}}>{d}</div>)}
        {days.map((v,i)=>(
          <button key={i} onClick={v==null?undefined:()=>setSel(sel===i?null:i)} aria-label={v==null?'No activity':'View day detail'}
            style={{aspectRatio:'1', borderRadius:5, padding:0, background: v==null?'var(--glass-control-bg)':cellColor(v),
            border: sel===i ? '1.5px solid var(--color-violet-500)' : '.5px solid var(--border-default)',
            cursor: v==null?'default':'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            transform: sel===i?'scale(1.08)':'none', transition:'transform .12s, border-color .12s'}}>
          </button>
        ))}
      </div>
      {detail && (
        <div className="arx-arrive" style={{marginTop:12, padding:'12px 14px', borderRadius:12, background:'var(--surface-modal)', border:'.5px solid var(--border-default)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:detail.empty?0:8}}>
            <span style={{font:'700 13px var(--font-body)', color:'var(--text-primary)'}}>{detail.dateStr}</span>
            {!detail.empty && <span className="num" style={{font:'700 15px var(--font-mono)', color: days[sel]>=0?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{days[sel]>=0?'+':'−'}${Math.abs(days[sel]).toLocaleString()}</span>}
          </div>
          {detail.empty ? (
            <span style={{font:'400 12px var(--font-body)', color:'var(--text-tertiary)'}}>No trading activity.</span>
          ) : (
            <React.Fragment>
              <div style={{font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', marginBottom:8}}>{detail.wins} of {detail.n} trades green · realized, after fees</div>
              <div style={{display:'flex', flexDirection:'column', gap:6}}>
                {detail.rows.map((r,k)=>(
                  <div key={k} style={{display:'flex', alignItems:'center', gap:8}}>
                    <span className="num" style={{font:'700 11px var(--font-mono)', color:'var(--text-primary)', width:42}}>{r.sym}</span>
                    <span style={{font:'600 10px var(--font-body)', color: r.dir==='Long'?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{r.dir}</span>
                    <span className="num" style={{font:'500 10px var(--font-mono)', color:'var(--text-tertiary)'}}>{r.lev}</span>
                    <span className="num" style={{marginLeft:'auto', font:'700 11px var(--font-mono)', color: r.pnl>=0?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{r.pnl>=0?'+':'−'}${Math.abs(r.pnl).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </React.Fragment>
          )}
        </div>
      )}
      <div style={{display:'flex', alignItems:'center', gap:14, marginTop:12, font:'500 10px var(--font-body)', color:'var(--text-tertiary)'}}>
        <span style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:10, height:10, borderRadius:3, background:'var(--regime-up-mid)'}}/>Profit</span>
        <span style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:10, height:10, borderRadius:3, background:'var(--regime-down-mid)'}}/>Loss</span>
        <span style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:10, height:10, borderRadius:3, background:'var(--glass-control-bg)', border:'.5px solid var(--border-default)'}}/>No trades</span>
        <span style={{marginLeft:'auto', font:'400 10px var(--font-body)'}}>Tap a day</span>
      </div>
    </Card>
  );
}

/* ════════ Leverage control — dial + presets + live liquidation preview ════════ */
function LeverageControl({ value, onChange, max=40 }) {
  const presets = [2,5,10,20,Math.min(max,50)].filter((x,i,a)=>x<=max && a.indexOf(x)===i);
  const pct = (value-1)/(max-1)*100;
  return (
    <Card animate={false} style={{margin:'0 20px 12px'}} padding={'14px 16px'}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
        <span style={{font:'500 12px var(--font-body)', color:'var(--text-secondary)'}}>Leverage</span>
        <span className="num" style={{display:'inline-flex', alignItems:'baseline', gap:1, font:'700 22px var(--font-mono)', color:'var(--color-violet-500)', letterSpacing:'-0.02em'}}>{value}<span style={{font:'600 13px var(--font-mono)'}}>×</span></span>
      </div>
      <input type="range" min="1" max={max} value={value} onChange={e=>onChange(+e.target.value)}
        style={{width:'100%', accentColor: value>20?'var(--regime-down-mid)':'var(--color-violet-500)'}}/>
      <div style={{display:'flex', gap:6, marginTop:10}}>
        {presets.map(p => (
          <button key={p} onClick={()=>onChange(p)} style={{flex:1, height:30, borderRadius:9, cursor:'pointer',
            border:'.5px solid ' + (value===p ? 'var(--color-violet-500)' : 'var(--border-default)'),
            background: value===p ? 'rgba(124,91,255,.14)' : 'transparent',
            color: value===p ? 'var(--color-violet-500)' : 'var(--text-secondary)', font:'600 12px var(--font-mono)'}}>{p}×</button>
        ))}
      </div>
      {value>10 && <div style={{marginTop:10, font:'400 10.5px var(--font-body)', color:'var(--regime-trans-mid)', lineHeight:1.4}}>High leverage amplifies both gains and losses.</div>}
    </Card>
  );
}

/* Live liquidation preview — entry vs est. liq price, with distance bar */
function LiquidationPreview({ price, lev, side='buy' }) {
  const long = side==='buy';
  const liq = long ? price*(1 - 0.92/lev) : price*(1 + 0.92/lev);
  const distPct = Math.abs((liq-price)/price*100);
  return (
    <Card animate={false} style={{margin:'0 20px 12px'}} padding={'12px 16px'}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
        <span style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>Est. liquidation</span>
        <span className="num" style={{font:'700 15px var(--font-mono)', color:'var(--regime-down-mid)'}}>${liq.toLocaleString(undefined,{maximumFractionDigits: price<10?4:2})}</span>
      </div>
      <div style={{position:'relative', height:6, borderRadius:3, marginTop:10, background:'var(--glass-control-bg)'}}>
        <div style={{position:'absolute', top:0, bottom:0, left: long?`${100-Math.min(distPct*3,100)}%`:'50%', right: long?'50%':`${100-Math.min(distPct*3,100)}%`,
          background:'linear-gradient(90deg, var(--regime-down-mid), transparent)', borderRadius:3, opacity:.5}}/>
        <div style={{position:'absolute', top:-3, left:'calc(50% - 6px)', width:12, height:12, borderRadius:'50%', background:'var(--color-violet-500)', border:'2px solid var(--surface-elevated)'}}/>
      </div>
      <div style={{display:'flex', justifyContent:'space-between', marginTop:6, font:'500 10px var(--font-mono)', color:'var(--text-tertiary)'}}>
        <span>{long?'Liq −'+distPct.toFixed(1)+'%':'Entry'}</span>
        <span>{long?'Entry':'Liq +'+distPct.toFixed(1)+'%'}</span>
      </div>
    </Card>
  );
}

/* ════════ Pro terminal pieces — candles · order book · trades tape ════════ */
function genCandles(seed=11, n=26, base=66000, vol=600) {
  const out=[]; let s=seed, p=base;
  for(let i=0;i<n;i++){ s=(s*9301+49297)%233280; const r=s/233280; const o=p; const c=o+(r-0.46)*vol; const hi=Math.max(o,c)+r*vol*0.5; const lo=Math.min(o,c)-(1-r)*vol*0.5; out.push([o,hi,lo,c]); p=c; }
  return out;
}
function CandleChart({ candles, height=170 }) {
  const data = candles || genCandles();
  const w=360, all=data.flatMap(c=>[c[1],c[2]]); const min=Math.min(...all), max=Math.max(...all), rng=(max-min)||1;
  const cw = w/data.length, bw = cw*0.56;
  const y = v => height-6 - ((v-min)/rng)*(height-18);
  const last = data[data.length-1][3];
  return (
    <div style={{padding:'0 20px'}}>
      <Card animate={false} style={{position:'relative', overflow:'hidden', height}} padding={0}>
        <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
          {[0.2,0.5,0.8].map(g=><line key={g} x1="0" x2={w} y1={height*g} y2={height*g} stroke="var(--border-default)" strokeWidth="1" strokeDasharray="2 4"/>)}
          {data.map((c,i)=>{ const [o,hi,lo,cl]=c; const up=cl>=o; const col=up?'var(--regime-up-mid)':'var(--regime-down-mid)'; const x=i*cw+cw/2;
            return <g key={i} stroke={col} fill={col}>
              <line x1={x} x2={x} y1={y(hi)} y2={y(lo)} strokeWidth="1"/>
              <rect x={x-bw/2} y={Math.min(y(o),y(cl))} width={bw} height={Math.max(2,Math.abs(y(o)-y(cl)))} rx="1"/>
            </g>;
          })}
          <line x1="0" x2={w} y1={y(last)} y2={y(last)} stroke="var(--color-violet-500)" strokeWidth="1" strokeDasharray="3 3"/>
        </svg>
        <div className="num" style={{position:'absolute', right:8, top:`calc(${y(last)/height*100}% - 9px)`, background:'var(--color-violet-500)', color:'#fff', font:'600 10px var(--font-mono)', padding:'1px 6px', borderRadius:5}}>{last.toLocaleString(undefined,{maximumFractionDigits:0})}</div>
      </Card>
    </div>
  );
}

function OrderBookLadder({ mark=214.6 }) {
  const rows = [3,2,1,0].map(i=>({ p:(mark+0.05*(i+1)), sz:(40+i*22+(i%2)*15) }));
  const bids = [0,1,2,3].map(i=>({ p:(mark-0.05*(i+1)), sz:(88-i*16) }));
  const maxSz = 110;
  const Row = ({r, side}) => {
    const ask = side==='ask';
    return (
      <div className="arx-row-press" style={{position:'relative', display:'flex', alignItems:'center', height:24, padding:'0 12px'}}>
        <div style={{position:'absolute', top:1, bottom:1, right:0, width:`${r.sz/maxSz*100}%`, background: ask?'rgba(242,106,106,.16)':'rgba(45,212,155,.16)'}}/>
        <span className="num" style={{position:'relative', flex:1, font:'600 11.5px var(--font-mono)', color: ask?'var(--regime-down-mid)':'var(--regime-up-mid)'}}>{r.p.toFixed(2)}</span>
        <span className="num" style={{position:'relative', font:'500 11px var(--font-mono)', color:'var(--text-secondary)'}}>{r.sz.toFixed(0)}K</span>
      </div>
    );
  };
  return (
    <Card animate={false} style={{margin:'0 20px'}} padding={'10px 0'}>
      <div style={{display:'flex', justifyContent:'space-between', padding:'0 12px 6px', font:'500 9px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}><span>Price</span><span>Size (USD)</span></div>
      {rows.map((r,i)=><Row key={'a'+i} r={r} side="ask"/>)}
      <div className="num" style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 12px', margin:'4px 0', borderTop:'.5px solid var(--border-default)', borderBottom:'.5px solid var(--border-default)'}}>
        <span style={{font:'700 14px var(--font-mono)', color:'var(--text-primary)'}}>{mark.toFixed(2)}</span>
        <span style={{font:'500 10px var(--font-mono)', color:'var(--regime-up-mid)'}}>Spread 0.02%</span>
      </div>
      {bids.map((r,i)=><Row key={'b'+i} r={r} side="bid"/>)}
    </Card>
  );
}

function TradesTape({ trades }) {
  const data = trades || (()=>{ const out=[]; let s=5, p=214.6; for(let i=0;i<11;i++){ s=(s*9301+49297)%233280; const r=s/233280; const long=r>0.45; p=p+(r-0.5)*0.2; out.push({long, sz:(0.2+r*9).toFixed(2), p:p.toFixed(2), t:`10:55:${(59-i).toString().padStart(2,'0')}`}); } return out; })();
  return (
    <Card animate={false} style={{margin:'0 20px', overflow:'hidden'}} padding={'10px 0'}>
      <div style={{display:'flex', padding:'0 14px 6px', font:'500 9px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>
        <span style={{flex:1}}>Side</span><span style={{flex:1, textAlign:'right'}}>Size</span><span style={{flex:1.2, textAlign:'right'}}>Price</span><span style={{flex:1, textAlign:'right'}}>Time</span>
      </div>
      {data.map((t,i)=>(
        <div key={i} style={{display:'flex', alignItems:'center', padding:'4px 14px'}}>
          <span style={{flex:1, font:'700 11px var(--font-body)', color: t.long?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{t.long?'Long':'Short'}</span>
          <span className="num" style={{flex:1, textAlign:'right', font:'500 11px var(--font-mono)', color:'var(--text-secondary)'}}>{t.sz}</span>
          <span className="num" style={{flex:1.2, textAlign:'right', font:'500 11px var(--font-mono)', color: t.long?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{t.p}</span>
          <span className="num" style={{flex:1, textAlign:'right', font:'500 10px var(--font-mono)', color:'var(--text-tertiary)'}}>{t.t}</span>
        </div>
      ))}
    </Card>
  );
}

Object.assign(window, {
  StatCard, StatRail,
  SentimentGauge, QuickActionsGrid, HistPerfRow, PnlCalendar,
  LeverageControl, LiquidationPreview, CandleChart, OrderBookLadder, TradesTape,
});
