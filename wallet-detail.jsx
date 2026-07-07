/* ═══ Arx · Wallet Detail v5 — self-reviewed & enhanced ═══
   IA: header → trust → standout → topline (4 metrics, master window) → tabs.
   Overview = equity curve + trajectory TIMELINE + decision tiles + follower proof.
   Activity = full positions + last 10 settled trades. Copiers = ranked, tappable list.
   Pure-SVG charts — RN-portable via Skia / victory-native-xl. */

const { useState: wdS, useRef: wdR } = React;

/* ─── deterministic derivations (mock until real data wired) ─── */
const WD_TOPWIN = { smart_money:9, rising_star:18, degen_winner:31, one_shot_winner:64, full_rekt:42, unproven:24, new_blood:38 };
const WD_DAYS = { '24H':1, '7D':6, '30D':26, '90D':78 };
const WD_WF = { '24H':.04, '7D':.22, '30D':1, '90D':2.4 };
const WD_UPSTREAM = { '0x5f12…a3d6': { addr:'0x9f2e…11ab', share:84 }, '0x1c90…ff03': { addr:'0xde44…a1c2', share:78 } };
/* watchlist store — seeded with a few copy-eligible wallets; the Watch toggle keeps it live */
const WD_WATCH = new Set((typeof WALLETS!=='undefined'?WALLETS:[]).filter(x=>x.copyable).slice(0,4).map(x=>x.addr));
const wdFmt$ = (v) => { const a=Math.abs(v); const t = a>=1e6?(a/1e6).toFixed(1)+'M':a>=1e3?(a/1e3).toFixed(1)+'K':a.toFixed(0); return (v<0?'−$':'+$')+t; };
const wdCap$ = (v) => { const a=Math.abs(v); return a>=1e6?'$'+(a/1e6).toFixed(1)+'M':a>=1e3?'$'+Math.round(a/1e3)+'K':'$'+Math.round(a); };

function wdDerive(w) {
  const sig = deriveSig(w);
  const trades = tradesOf(w);
  const topWin = WD_TOPWIN[w.perf] != null ? WD_TOPWIN[w.perf] : 22;
  const qual = w.roi90 != null
    ? { l:'90d proven', sub: trades.t < 60 ? 'low freq · '+trades.t+' trades' : trades.t+' settled trades', ok:true }
    : w.roi30 != null
      ? { l:'qualified at 30d only', sub: trades.t+' trades — 90d proof pending', ok:false }
      : { l:'not yet qualified', sub: trades.t+' trades · under 30 active days', ok:false };
  const consist = (win) => { const d = WD_DAYS[win]; const p = Math.min(d, Math.round(d * (w.posWeeks/Math.max(w.weeks,1)) + 0.3)); return { p, d }; };
  const drifting = sig.risk.state !== 'Normal';
  const upstream = WD_UPSTREAM[w.addr] || null;
  const early = w.copiers <= 200 && (w.perf==='smart_money' || w.perf==='rising_star');

  const standouts = [];
  const c30 = consist('30D');
  if (w.posWeeks/Math.max(w.weeks,1) >= 0.75) standouts.push({ t:'High consistency for its style — '+c30.p+' of '+c30.d+' active days profitable', go:'perf' });
  if (topWin <= 12) standouts.push({ t:'No lucky-trade dependence — biggest win is '+topWin+'% of all profits', go:'perf' });
  if (sig.flow) standouts.push({ t:'Fresh capital backed recent entries — funding → trade within 33m', go:'activity' });
  if (early) standouts.push({ t:'Only '+w.copiers+' copiers for this standing — early', go:'copiers' });
  if (w.liqs === 0 && standouts.length < 3) standouts.push({ t:'0 liquidations in 90 days', go:'perf' });

  const watches = [];
  if (drifting) watches.push({ t: sig.risk.driver, go:'risk' });
  if (w.dd > 25) watches.push({ t:'Deep drawdowns — max −'+w.dd.toFixed(1)+'%', go:'perf' });
  if (topWin >= 50) watches.push({ t:'Profits concentrated — one trade is '+topWin+'% of all gains', go:'perf' });
  if (!qual.ok && watches.length < 2) watches.push({ t:'Track record '+qual.l, go:'perf' });

  return { sig, trades, topWin, qual, consist, drifting, upstream, early,
    standouts: standouts.slice(0,3), watches: watches.slice(0,2) };
}

/* ─── shared bits ─── */
function WdChip({ l, ink, bg }) {
  return <span style={{font:'600 10px var(--font-body)', color:ink, background:bg, padding:'3px 9px', borderRadius:999, whiteSpace:'nowrap', flexShrink:0}}>{l}</span>;
}
function WdRow({ k, v, c }) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', gap:10, padding:'8px 0', borderBottom:'.5px solid var(--border-default)'}}>
      <span style={{font:'500 12.5px var(--font-body)', color:'var(--text-secondary)'}}>{k}</span>
      <span className="num" style={{font:'500 12px var(--font-mono)', color:c||'var(--text-primary)', textAlign:'right'}}>{v}</span>
    </div>
  );
}
function WdCard({ children, pad }) {
  return <div style={{margin:'12px 20px 0', padding: pad!=null?pad:'16px', borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>{children}</div>;
}
function WdH({ children, right }) {
  return (
    <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:10, marginBottom:8}}>
      <span style={{font:'600 13.5px var(--font-body)'}}>{children}</span>
      {right && <span style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', textAlign:'right'}}>{right}</span>}
    </div>
  );
}

/* ═══ Charts — pure SVG, RN-portable ═══ */

/* Equity curve — axis labels, drawdown shading, live end dot */
function WdEquity({ spark, positive, endLabel }) {
  const W=330, H=132, n=spark.length;
  const min=Math.min(...spark), max=Math.max(...spark), rng=(max-min)||1;
  const x=(i)=>6+(i/(n-1))*(W-14), y=(v)=>H-20-((v-min)/rng)*(H-38);
  // smooth midpoint-quadratic path
  const pts=spark.map((v,i)=>[x(i),y(v)]);
  let line='M'+pts[0][0].toFixed(1)+' '+pts[0][1].toFixed(1);
  for(let i=1;i<n;i++){ const mx=((pts[i-1][0]+pts[i][0])/2).toFixed(1), my=((pts[i-1][1]+pts[i][1])/2).toFixed(1);
    line+=' Q'+pts[i-1][0].toFixed(1)+' '+pts[i-1][1].toFixed(1)+' '+mx+' '+my; }
  line+=' L'+pts[n-1][0].toFixed(1)+' '+pts[n-1][1].toFixed(1);
  const area=line+' L'+x(n-1).toFixed(1)+' '+(H-14)+' L'+x(0).toFixed(1)+' '+(H-14)+' Z';
  const col= positive?'var(--regime-up-mid)':'var(--regime-down-mid)';
  let pk=0; for(let i=1;i<n;i++) if(spark[i]>spark[pk]) pk=i;
  let tr=pk; for(let i=pk;i<n;i++) if(spark[i]<spark[tr]) tr=i;
  return (
    <svg width="100%" viewBox={'0 0 '+W+' '+H} style={{display:'block'}}>
      <defs><linearGradient id="wdeq" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={positive?'#2DD49B':'#F26A6A'} stopOpacity=".30"/>
        <stop offset="1" stopColor={positive?'#2DD49B':'#F26A6A'} stopOpacity="0"/>
      </linearGradient></defs>
      <path d={area} fill="url(#wdeq)"/>
      {tr>pk && <rect x={x(pk)} y={10} width={x(tr)-x(pk)} height={H-28} rx="4" fill="rgba(242,106,106,.06)"/>}
      <path d={line} fill="none" stroke={col} strokeWidth="2.25" strokeLinecap="round"/>
      {tr>pk && <text x={(x(pk)+x(tr))/2} y={H-5} textAnchor="middle" style={{font:'500 7.5px var(--font-body)', fill:'var(--regime-down-mid)', opacity:.8}}>worst stretch</text>}
      <circle cx={x(n-1)} cy={y(spark[n-1])} r="4" fill={col}/>
      <circle cx={x(n-1)} cy={y(spark[n-1])} r="8" fill="none" stroke={col} strokeOpacity=".3"/>
      {endLabel && (<g>
        <rect x={W-52} y={4} width={46} height={17} rx={8.5} fill={positive?'rgba(45,212,155,.16)':'rgba(242,106,106,.16)'}/>
        <text x={W-29} y={16} textAnchor="middle" className="num" style={{font:'700 10px var(--font-mono)', fill:col}}>{endLabel}</text>
      </g>)}
    </svg>
  );
}

/* Trajectory — a timeline: state milestones in order, latest emphasized */
function WdTimeline({ steps }) {
  return (
    <div style={{position:'relative', padding:'2px 0 0 6px'}}>
      {steps.map(([d,s,note],i)=>{
        const last = i===steps.length-1;
        return (
          <div key={i} style={{display:'flex', gap:12}}>
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', width:14}}>
              <span style={{width:last?12:9, height:last?12:9, borderRadius:'50%', flexShrink:0, marginTop:3,
                background: last?'var(--regime-up-mid)':'var(--surface-elevated)',
                border:'2px solid '+(last?'var(--regime-up-mid)':'var(--border-strong)'),
                boxShadow: last?'0 0 8px rgba(45,212,155,.5)':'none'}}/>
              {i<steps.length-1 && <span style={{flex:1, width:2, background:'var(--border-strong)', margin:'2px 0', minHeight:14}}/>}
            </div>
            <div style={{flex:1, paddingBottom: i<steps.length-1?12:0, minWidth:0}}>
              <div style={{display:'flex', alignItems:'baseline', gap:8}}>
                <span style={{font:(last?'700':'600')+' 12.5px var(--font-body)', color: last?'var(--text-primary)':'var(--text-secondary)'}}>{s}</span>
                <span className="num" style={{font:'500 10px var(--font-mono)', color:'var(--text-tertiary)'}}>{d}</span>
              </div>
              {note && <div className="num" style={{font:'500 10.5px var(--font-mono)', color:'var(--text-tertiary)', marginTop:1}}>{note}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Native stat row — label + plain-language value + thin progress bar (no dashboard gauges) */
function WdBarRow({ k, v, pct, color, sub, last }) {
  return (
    <div style={{padding:'10px 0', borderBottom: last?'none':'.5px solid var(--border-default)'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:10}}>
        <span style={{font:'500 13px var(--font-body)', color:'var(--text-secondary)', whiteSpace:'nowrap'}}>{k}</span>
        <span className="num" style={{font:'600 13px var(--font-mono)', color:'var(--text-primary)', textAlign:'right'}}>{v}</span>
      </div>
      {pct!=null && (
        <div style={{display:'flex', height:4, borderRadius:2, overflow:'hidden', background:'var(--glass-control-bg)', marginTop:7}}>
          <div style={{width:Math.min(100,Math.max(2,pct))+'%', background:color||'var(--regime-up-mid)', borderRadius:2}}/>
        </div>
      )}
      {sub && <div style={{font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:5}}>{sub}</div>}
    </div>
  );
}

/* Exposure breakdown — open positions only, same hierarchy as the Customize filters (market → asset class) */
const WD_CLASS = { BTC:'Crypto', ETH:'Crypto', SOL:'Crypto', HYPE:'Crypto', PEPE:'Crypto', GOLD:'Commodities', OIL:'Commodities', SILVER:'Commodities', NATGAS:'Commodities', NVDA:'Stocks', 'S&P':'Stocks', EUR:'FX', GBP:'FX', JPY:'FX' };
const WD_CLASS_COL = { Crypto:'var(--color-violet-500)', Commodities:'var(--regime-trans-mid)', Stocks:'var(--regime-range-mid)', FX:'var(--regime-up-mid)' };
const wdParse$ = (s) => { const m=/([\d.]+)\s*([KM]?)/.exec((s||'').replace('$','')); if(!m) return 0; return +m[1] * (m[2]==='M'?1e6:m[2]==='K'?1e3:1); };
function WdExposure({ positions }) {
  const byClass = {};
  let total = 0;
  positions.forEach(p => { const c = WD_CLASS[p.sym] || 'Crypto'; const v = wdParse$(p.size); byClass[c]=(byClass[c]||0)+v; total+=v; });
  const rows = Object.entries(byClass).sort((a,b)=>b[1]-a[1]);
  if (!total) return <div style={{font:'400 12.5px var(--font-body)', color:'var(--text-tertiary)', padding:'4px 0'}}>No open exposure right now.</div>;
  return (
    <div>
      <div style={{display:'flex', height:8, borderRadius:4, overflow:'hidden', gap:2}}>
        {rows.map(([c,v]) => <div key={c} style={{flex:v, background:WD_CLASS_COL[c], borderRadius:4, opacity:.9}}/>)}
      </div>
      <div style={{marginTop:10}}>
        {rows.map(([c,v],i) => (
          <div key={c} style={{display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom: i<rows.length-1?'.5px solid var(--border-default)':'none'}}>
            <span style={{width:8, height:8, borderRadius:3, background:WD_CLASS_COL[c], flexShrink:0}}/>
            <span style={{flex:1, font:'500 12.5px var(--font-body)', color:'var(--text-secondary)'}}>{c}</span>
            <span className="num" style={{font:'600 12.5px var(--font-mono)'}}>{Math.round(v/total*100)}%</span>
            <span className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', width:54, textAlign:'right'}}>{wdCap$(v)}</span>
          </div>
        ))}
      </div>
      <div style={{font:'400 10px var(--font-body)', color:'var(--text-tertiary)', marginTop:8}}>Open perp positions only · notional at entry</div>
    </div>
  );
}
function WdRange({ dim }) {
  const [label, lo, hi, cur, unit] = dim;
  const max = Math.max(hi*1.6, cur*1.15);
  const pct = (v) => Math.min(100, (v/max)*100);
  const drifted = cur > hi;
  const sev = cur > hi*1.6 ? 'much higher' : drifted ? 'elevated' : 'within range';
  return (
    <div style={{padding:'7px 0'}}>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
        <span style={{font:'500 11.5px var(--font-body)', color:'var(--text-secondary)'}}>{label}</span>
        <span className="num" style={{font:'600 10.5px var(--font-mono)', color: drifted?'var(--regime-trans-mid)':'var(--text-tertiary)'}}>{cur}{unit} · {sev}</span>
      </div>
      <div style={{position:'relative', height:10}}>
        <div style={{position:'absolute', top:4, left:0, right:0, height:2, borderRadius:1, background:'var(--glass-control-bg)'}}/>
        <div style={{position:'absolute', top:2, height:6, borderRadius:3, left:pct(lo)+'%', width:Math.max(2,(pct(hi)-pct(lo)))+'%', background:'rgba(120,120,128,.25)'}}/>
        <div style={{position:'absolute', top:0, left:'calc('+pct(cur)+'% - 5px)', width:10, height:10, borderRadius:'50%',
          background: drifted?'var(--regime-trans-mid)':'var(--regime-up-mid)', border:'2px solid var(--surface-elevated)'}}/>
      </div>
    </div>
  );
}

/* settled-trade rows (deterministic) */
function wdTrades(w, count) {
  const syms=[...new Set([...w.positions.map(p=>p.sym),'BTC','ETH','SOL','HYPE'])].slice(0,5);
  const rows=[]; let s=w.aumV%97;
  const whenL=['2h','9h','1d','2d','4d','6d','8d','11d','13d','16d'];
  const heldL=['3h','7h','1d','2d','5d','30m','9h','3d','1d','6h'];
  for(let i=0;i<count;i++){ s=(s*9301+49297)%233280; const r=s/233280; const winT = r < w.winRate/100;
    const amt = Math.round((0.002+r*0.02)*w.aumV);
    rows.push({ sym:syms[i%syms.length], dir:r>0.45?'LONG':'SHORT', win:winT, amt, when:whenL[i], held:heldL[i] }); }
  return rows;
}

/* ─── the page ─── */
function WalletDetail({ w, onBack, onToast, onClaim }) {
  const D2 = wdDerive(w);
  const { sig, trades, topWin, qual, drifting, upstream, early } = D2;
  const stand = STANDING[standingOf(w, sig)];
  const t = TAX[w.perf];
  const [win, setWin] = wdS('30D');
  const [tab, setTab] = wdS('overview');
  const [exact, setExact] = wdS(false);
  const [copierSort, setCopierSort] = wdS('pnl');
  const [setupOpen, setSetupOpen] = wdS(false);
  const [cmpOpen, setCmpOpen] = wdS(false);
  const [watched, setWatched] = wdS(WD_WATCH.has(w.addr));
  const scRef = wdR(null);
  const go = (id) => { setTab(id); if (scRef.current) scRef.current.scrollTop = 0; };

  const st = w.stats[win];
  const realized = st ? st.pnl : '— too new';
  const realPos = st ? !st.pnl.startsWith('−') : true;
  const cs = D2.consist(win);
  const wf = WD_WF[win];
  const copierReal = w.copierPnlV * wf;
  const capLabel = { micro:'Micro · <$1K', small:'Small · $1–10K', mid:'Mid · $10–100K', large:'Large · $100K–1M', whale:'Whale · ≥$1M' }[w.cap] || w.cap;
  const TABS = [['overview','Overview'],['perf','Record'],['risk','Risk'],['activity','Activity'],['copiers','Copiers']];
  const roiPos = (st ? st.roi : (w.roi90!=null?w.roi90:w.roi30||0)) >= 0;
  const timeline = sig.timeline || [['Day 1','Unproven',''],['Now', sig.perfState, qual.sub]];

  /* ranked copier list — real WALLETS entries act as copier identities, so rows open real profiles */
  const copierBase = WALLETS.filter(x => x.addr !== w.addr).slice(0, 5);
  const copierRows = copierBase.map((c, i) => {
    const cap = [12000, 8400, 5200, 2600, 900][i];
    const real = Math.round(cap * (st ? st.roi * 0.55 / 100 : 0.02) * (1 - i*0.12));
    return { c, cap, real, unreal: Math.round(real*0.1), since: [64, 41, 33, 19, 6][i] };
  }).sort((a,b)=> copierSort==='pnl' ? b.real-a.real : copierSort==='aum' ? b.cap-a.cap : a.since-b.since);

  /* ── Peer percentiles vs cohort + follower realized-vs-stated gap ── */
  const peerCons = Math.max(5, Math.min(96, Math.round((cs.p/Math.max(cs.d,1))*100*0.95)));
  const peerDD   = Math.max(5, Math.min(96, Math.round(100 - w.dd*2.0)));
  const peerWin  = Math.max(5, Math.min(96, Math.round(w.winRate*1.05)));
  const statedRoi = w.roi90!=null ? w.roi90 : (w.roi30||0);
  const followerRoi = Math.round(statedRoi*0.62);

  return (
    <div style={{position:'absolute', inset:0, background:'var(--surface-base)', zIndex:30, display:'flex', flexDirection:'column', fontFamily:'var(--font-body)'}}>
      {/* nav */}
      <div style={{display:'flex', alignItems:'center', gap:10, padding:'58px 16px 6px', flexShrink:0}}>
        <button onClick={onBack} style={{width:34, height:34, borderRadius:'50%', border:'.5px solid var(--border-default)', background:'var(--surface-elevated)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transform:'rotate(180deg)', flexShrink:0}}>
          <IconChevron size={15} color="var(--text-primary)"/>
        </button>
        <span className="num" style={{flex:1, font:'600 12.5px var(--font-mono)', color:'var(--text-secondary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{w.x ? w.x+' · '+w.addr : w.addr}</span>
        <button onClick={()=>{ const next=!watched; setWatched(next); next?WD_WATCH.add(w.addr):WD_WATCH.delete(w.addr); onToast(next?'Watching — alerts on':'Removed from watchlist'); }} aria-label="Watch" className="arx-press" style={{width:36, height:36, borderRadius:'50%', cursor:'pointer', flexShrink:0,
          border:'.5px solid ' + (watched?'var(--color-violet-500)':'var(--border-strong)'),
          background: watched?'rgba(124,91,255,.16)':'transparent', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill={watched?'var(--color-violet-500)':'none'} stroke={watched?'var(--color-violet-500)':'var(--text-secondary)'} strokeWidth="1.8" strokeLinejoin="round"><polygon points="12 2.5 15 8.8 22 9.8 17 14.6 18.2 21.5 12 18.2 5.8 21.5 7 14.6 2 9.8 9 8.8 12 2.5"/></svg>
        </button>
      </div>

      <div ref={scRef} style={{flex:1, overflowY:'auto', paddingBottom:96}}>
        {/* header */}
        {/* header — the human behind the wallet */}
        {(() => { const idn = resolveIdentity(w); return (
        <div style={{display:'flex', alignItems:'flex-start', gap:13, padding:'10px 20px 0'}}>
          <WalletAvatar w={w} size={54} ring={idn.kind==='kol'?'var(--regime-up-mid)':idn.kind==='claimed'?'var(--color-violet-500)':null}/>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'flex', alignItems:'center', gap:8, minWidth:0, flexWrap:'wrap'}}>
              {idn.kind==='anon'
                ? <span className="num" style={{font:'600 16px var(--font-mono)', letterSpacing:'-.01em', whiteSpace:'nowrap'}}>{w.addr}</span>
                : <span style={{font:'700 20px var(--font-brand)', letterSpacing:'-.02em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:160}}>{idn.name}</span>}
              <IdentityBadge id={idn}/>
              {idn.kind!=='anon' && <span style={{display:'inline-flex', alignItems:'center', gap:3, font:'700 10.5px var(--font-body)', color:'var(--regime-up-mid)', background:'rgba(45,212,155,.10)', padding:'3px 8px', borderRadius:999, whiteSpace:'nowrap'}}>✓ On-chain</span>}
            </div>
            {idn.kind==='anon' ? (
              <button onClick={()=>onClaim && onClaim(w)} className="arx-press" style={{display:'inline-flex', alignItems:'center', gap:5, marginTop:6, height:26, padding:'0 11px', borderRadius:999, background:'rgba(124,91,255,.10)', border:'.5px solid rgba(124,91,255,.28)', cursor:'pointer'}}>
                <span style={{font:'600 11.5px var(--font-body)', color:'var(--color-violet-500)'}}>Is this you? Claim wallet</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--color-violet-500)" strokeWidth="2.6" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </button>
            ) : (
              <div style={{display:'flex', alignItems:'center', gap:8, marginTop:5, flexWrap:'wrap'}}>
                {idn.handle && <a href={'https://x.com/'+idn.handle.replace('@','')} target="_blank" rel="noopener" style={{display:'inline-flex', alignItems:'center', gap:4, font:'600 12px var(--font-body)', color:'var(--color-violet-500)', textDecoration:'none'}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.3 8.3L23.3 22h-6.6l-5.2-6.8L5.6 22H2.5l7.8-8.9L1.1 2h6.8l4.7 6.2L18.9 2zm-1.2 18h1.8L7.4 3.9H5.5L17.7 20z"/></svg>
                  {idn.handle}{idn.followers && <span style={{color:'var(--text-tertiary)', fontWeight:500}}> · {idn.followers}</span>}
                </a>}
              </div>
            )}
            <div style={{display:'flex', alignItems:'center', gap:7, marginTop:7, flexWrap:'wrap'}}>
              <WdChip l={stand.l} ink={stand.ink} bg={stand.bg}/>
              <span style={{font:'500 12px var(--font-body)', color: qual.ok?'var(--text-tertiary)':'var(--regime-trans-mid)'}}>{qual.l} · {qual.sub}</span>
            </div>
          </div>
        </div>
        );})()}

        {/* labels — one calm meta line (On-chain proof now sits inline with the identity badge) */}
        <div style={{padding:'14px 20px 0', font:'500 11.5px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.005em'}}>
          {t.label} · {capLabel} · {w.style.replace('_trader','').replace(/^./,c=>c.toUpperCase())} trader · labels refreshed 12m ago
        </div>

        {/* Lucid tips — synthesized insight beyond the card · tap to continue in Lucid */}
        {(() => {
          const stands = D2.standouts.slice(0,2).map(s=>s.t);
          const changed = [];
          if (drifting) changed.push(sig.risk.driver);
          (sig.events||[]).slice(0, drifting?1:2).forEach(e=> changed.push(e[0] + (e[1]?' · '+e[1]:'')));
          const watch = D2.watches.slice(0,2).map(s=>s.t);
          const lc = s => s ? s.charAt(0).toLowerCase()+s.slice(1) : s;
          const verdict = watch.length
            ? { tone:'warn', text: `${stand.l}, but ${lc(watch[0])} — worth watching.` }
            : { tone:'up',   text: `${stand.l} — ${lc(stands[0]||'steady and inside its usual range')}.` };
          const groups = [];
          if (stands.length) groups.push({ label:'Beyond its card', tone:'up', items:stands });
          if (changed.length) groups.push({ label:'Recent shifts · 30d', tone:'note', items:changed });
          if (watch.length>1) groups.push({ label:'Also watch', tone:'warn', items:watch.slice(1) });
          if (!stands.length && !changed.length && !watch.length) return null;
          const strength = qual.ok && w.dd<20 ? 'a stronger-than-typical' : 'a middle-of-the-pack';
          const seed = {
            contextLabel: 'On '+(w.x||w.addr)+' · '+t.label,
            intro: {
              action: `Here's how ${w.x||w.addr} reads beyond its card.`,
              body: `${t.label} · ${capLabel} · ${stand.l.toLowerCase()}. ${qual.l}. I can compare it to its cohort, flag what's changed, or stress-test the risk — you decide whether to copy.`
            },
            chips: [
              { label:'Compare to its cohort', reply:{ conf:'medium',
                action:`It reads as ${strength} ${t.label} wallet.`,
                body:`Consistency runs ${cs.p}/${cs.d} profitable days and its biggest win is ${topWin}% of all profit — ${topWin<=12?'well spread, skill-shaped':topWin>=50?'concentrated in one trade':'moderately concentrated'}. Worst drawdown −${w.dd.toFixed(1)}%, ${w.dd<20?'shallower':'deeper'} than the cohort norm.`,
                data:[['Profitable days', cs.p+'/'+cs.d, cs.p/Math.max(cs.d,1)>=.7?'up':''],['Biggest-win share', topWin+'%', topWin>=50?'warn':''],['Max drawdown','−'+w.dd.toFixed(1)+'%', w.dd>25?'warn':'']] }},
              { label:'What changed recently?', reply:{ conf: drifting?'medium':'high',
                action: drifting ? sig.risk.driver : 'Behaviour is steady — no notable drift.',
                body: ((sig.events||[]).slice(0,3).map(e=>e[0]).join('. ') || 'Risk and exposure are holding near their 30-day norms') + '.',
                data: (sig.risk.dims||[]).map(d=>[d[0], d[3]+(d[4]||''), d[3]>d[2]?'warn':'']) }},
              w.copyable
                ? { label:'Safe to copy at my size?', reply:{ conf:'low',
                    action:'At $500+, your fills mirror ~95% of its trades.',
                    body:`Pick a loss limit you can stomach — its worst 90-day stretch was −${w.dd.toFixed(1)}%. Copying is forward-only: you mirror new trades, not its ${w.positions.length} open one${w.positions.length===1?'':'s'}.`,
                    note:'Copying a wallet does not guarantee profits. You may lose some or all of your capital.' }}
                : { label:'Why can’t I copy it?', reply:{ conf:'high', action:'It isn’t copy-eligible yet.', body:'It hasn’t cleared the proof bar — too few settled trades or an unproven record. You can still watch it for changes.' }},
            ],
          };
          return <LucidTip kicker="Lucid tips" verdict={verdict} groups={groups} seed={seed} foot="Continue with Lucid"/>;
        })()}

        {/* topline — 4 metrics on the master window */}
        <WdCard pad="14px 15px 4px">
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <span style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>All metrics · {win}</span>
            <div style={{position:'relative', display:'flex', background:'var(--glass-control-bg)', borderRadius:8, padding:2}}>
              {['24H','7D','30D','90D'].map(x => (
                <button key={x} onClick={()=>setWin(x)} className="num" style={{height:23, width:37, borderRadius:6, border:'none', cursor:'pointer',
                  background: win===x?'var(--surface-elevated)':'transparent', boxShadow: win===x?'0 2px 5px rgba(0,0,0,.18)':'none',
                  color: win===x?'var(--text-primary)':'var(--text-tertiary)', font:(win===x?'600':'500')+' 10px var(--font-mono)', padding:0}}>{x}</button>
              ))}
            </div>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', marginTop:8}}>
            {[
              ['Realized · '+win, realized, st ? (realPos?'var(--regime-up-mid)':'var(--regime-down-mid)') : 'var(--text-tertiary)', 'after fees & funding'],
              ['Return · '+win, st ? (st.roi>=0?'+':'−')+Math.abs(st.roi).toFixed(1)+'%' : '—', st ? (st.roi>=0?'var(--regime-up-mid)':'var(--regime-down-mid)') : 'var(--text-tertiary)', 'on account equity'],
              ['Unrealized · now', sig.unreal || (w.positions.length ? '+$1.2K' : '—'), sig.unreal?'var(--regime-up-mid)':'var(--text-tertiary)', 'open, mark price'],
              ['Account value', w.aum, 'var(--text-primary)', 'perp equity'],
            ].map(([k,v,c,sub],i)=>(
              <div key={k} style={{padding:'10px 0 12px', paddingLeft: i%2?14:0, borderLeft: i%2?'.5px solid var(--border-default)':'none', borderTop: i>1?'.5px solid var(--border-default)':'none', minWidth:0}}>
                <div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em', whiteSpace:'nowrap'}}>{k}</div>
                <div className="num" style={{font:'700 20px var(--font-mono)', letterSpacing:'-.02em', marginTop:3, color:c, whiteSpace:'nowrap'}}>{v}</div>
                <div style={{font:'400 9.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:2, whiteSpace:'nowrap'}}>{sub}</div>
              </div>
            ))}
          </div>
        </WdCard>

        {/* tabs — iOS scrollable segmented, larger hit targets */}
        <div style={{position:'sticky', top:0, zIndex:5, background:'linear-gradient(to bottom, var(--surface-base) 78%, transparent)', padding:'10px 0 8px'}}>
          <div style={{display:'flex', gap:2, margin:'0 20px', padding:4, borderRadius:14, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
            {TABS.map(([id,l]) => (
              <button key={id} onClick={()=>setTab(id)} style={{
                flex:1, height:36, border:'none', borderRadius:10, cursor:'pointer', padding:0,
                background: tab===id ? 'var(--surface-modal, var(--surface-base))' : 'transparent',
                boxShadow: tab===id ? '0 2px 8px rgba(0,0,0,.16)' : 'none',
                color: tab===id ? 'var(--text-primary)' : 'var(--text-secondary)',
                font:(tab===id?700:600)+' 12px var(--font-body)', whiteSpace:'nowrap',
                transition:'background 180ms, color 180ms'
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* ── OVERVIEW ── */}
        {tab==='overview' && (<div className="arx-arrive">
          <WdCard>
            <WdH right={'equity · '+win}>Equity curve</WdH>
            <WdEquity spark={w.spark} positive={roiPos} endLabel={st ? (st.roi>=0?'+':'−')+Math.abs(st.roi).toFixed(0)+'%' : null}/>
          </WdCard>
          <WdCard>
            <WdH right={qual.ok ? 'state recomputed every 15m' : 'building history'}>Trajectory</WdH>
            <WdTimeline steps={timeline}/>
          </WdCard>
          {/* How it wins — the ranked decision facts, native grouped list */}
          <WdCard>
            <WdH right={'window: '+win}>How it wins</WdH>
            <WdBarRow k="Profitable days" v={cs.p+' of '+cs.d} pct={cs.d?cs.p/cs.d*100:0}
              color={cs.p/Math.max(cs.d,1)>=0.7?'var(--regime-up-mid)':'var(--regime-trans-mid)'}
              sub={cs.p/Math.max(cs.d,1)>=0.7 ? 'wins most days it trades' : 'mixed day-to-day results'}/>
            <WdBarRow k="Follower outcome" v={sig.follower ? sig.follower.replace(' actual follower profit','').replace(' follower profit','') : (w.copiers ? '—' : 'No copiers yet')} pct={null}
              sub={sig.follower ? 'what people copying it actually made' : 'no Arx copy history yet'}/>
            <WdBarRow k="Worst drawdown" v={'−'+w.dd.toFixed(1)+'%'} pct={Math.min(w.dd/60,1)*100}
              color={w.dd<15?'var(--regime-up-mid)':w.dd<25?'var(--regime-trans-mid)':'var(--regime-down-mid)'}
              sub={(w.dd<15?'shallow':w.dd<25?'moderate':'deep')+' · '+w.liqs+' liquidations in 90d'}/>
            <WdBarRow k="Risk vs its usual" v={sig.risk.state==='Normal'?'Within usual range':sig.risk.state} pct={null} sub={sig.risk.driver} last/>
          </WdCard>
          {/* Vs its cohort — percentile rank, made obvious */}
          <WdCard>
            <WdH right={t.label+' · percentile'}>Vs its cohort</WdH>
            {[['Consistency', peerCons],['Low drawdown', peerDD],['Win rate', peerWin]].map(([lbl,p],i)=>{
              const ink = p>=66?'var(--regime-up-mid)':p>=40?'var(--regime-trans-mid)':'var(--regime-down-mid)';
              return (
                <div key={i} style={{padding:'10px 0', borderBottom: i<2?'.5px solid var(--border-default)':'none'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:7}}>
                    <span style={{font:'500 12.5px var(--font-body)', color:'var(--text-secondary)'}}>{lbl}</span>
                    <span className="num" style={{font:'700 13.5px var(--font-mono)', color:ink}}>top {100-p}%</span>
                  </div>
                  <div style={{position:'relative', height:8, borderRadius:4, background:'var(--glass-control-bg)'}}>
                    <div style={{position:'absolute', top:0, bottom:0, left:0, width:p+'%', borderRadius:4, background:ink, opacity:.85}}/>
                    <div style={{position:'absolute', top:-3, left:'calc('+p+'% - 7px)', width:14, height:14, borderRadius:'50%', background:'var(--surface-elevated)', border:'2.5px solid '+ink, boxShadow:'0 1px 4px rgba(0,0,0,.2)'}}/>
                  </div>
                </div>
              );
            })}
            <div style={{marginTop:8, font:'400 10px var(--font-body)', color:'var(--text-tertiary)'}}>Rank among {t.label} wallets · marker = where this wallet sits · higher is better.</div>
          </WdCard>
          {window.WdScorecard && <WdScorecard seedKey={w.addr} label={t.label} peer={{cons:peerCons, dd:peerDD, win:peerWin}}/>}
          {/* Exposure now — open positions, same hierarchy as the Customize filters */}
          <WdCard>
            <WdH right="open positions">Exposure now</WdH>
            <WdExposure positions={w.positions}/>
          </WdCard>
          {sig.follower && (
            <WdCard>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{width:34, height:34, borderRadius:10, background:'rgba(45,212,155,.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                  <IconCheck size={16} color="var(--regime-up-mid)"/>
                </span>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{font:'600 13px var(--font-body)'}}>What copiers actually kept</div>
                  <div className="num" style={{font:'500 11.5px var(--font-mono)', color:'var(--text-secondary)', marginTop:2}}>stated +{statedRoi.toFixed(0)}% → copiers ~+{followerRoi}% · after fees & slippage</div>
                </div>
                <button onClick={()=>go('copiers')} style={{background:'none', border:'none', cursor:'pointer', font:'600 12px var(--font-body)', color:'var(--color-violet-500)', whiteSpace:'nowrap', padding:0}}>See copiers ›</button>
              </div>
            </WdCard>
          )}
          <div style={{margin:'10px 20px 0', font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>
            Everything here is read from the chain. Open Record for the full proof.
          </div>
        </div>)}

        {/* ── RECORD ── */}
        {tab==='perf' && (<div className="arx-arrive">
          <WdCard>
            <WdH right={'window: '+win}>The record</WdH>
            <WdRow k="Consistency" v={cs.p+' of '+cs.d+' days profitable'}/>
            <WdRow k={'Realized PnL · '+win} v={st ? st.pnl : '— too new'} c={st ? (st.roi>=0?'var(--regime-up-mid)':'var(--regime-down-mid)') : 'var(--text-tertiary)'}/>
            <WdRow k="Max drawdown" v={'−'+w.dd.toFixed(1)+'% — '+(w.dd<15?'shallow':w.dd<25?'moderate':'deep')} c={w.dd>25?'var(--regime-trans-mid)':'var(--text-primary)'}/>
            <WdRow k="Liquidations · 90d" v={String(w.liqs)} c={w.liqs>0?'var(--regime-down-mid)':'var(--text-primary)'}/>
            {sig.follower && <WdRow k="Follower outcome" v={sig.follower} c="var(--regime-up-mid)"/>}
            <button onClick={()=>setExact(!exact)} style={{marginTop:10, background:'none', border:'none', cursor:'pointer', padding:0, font:'600 12px var(--font-body)', color:'var(--color-violet-500)'}}>{exact?'Hide exact figures':'Exact figures'}</button>
            {exact && (
              <div className="arx-arrive" style={{marginTop:4}}>
                <WdRow k="Win rate (settled)" v={w.winRate.toFixed(1)+'% · '+trades.win+'/'+trades.t}/>
                <WdRow k="Qualifying window" v={qual.l}/>
                <WdRow k="PnL basis" v="after fees · funding estimated"/>
              </div>
            )}
          </WdCard>
          <WdCard>
            <WdH>Daily PnL · 30d</WdH>
            <div style={{margin:'0 -15px'}}><PnlCalendar title="" sub={w.posWeeks+' of '+w.weeks+' weeks green · realized, after fees'}/></div>
          </WdCard>
        </div>)}

        {/* ── RISK ── */}
        {tab==='risk' && (<div className="arx-arrive">
          <WdCard>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
              <span style={{font:'600 13.5px var(--font-body)'}}>Vs its own usual range</span>
              <WdChip l={sig.risk.state} ink={sig.risk.stateInk} bg={drifting?'rgba(251,191,36,.14)':'rgba(45,212,155,.12)'}/>
            </div>
            <div style={{font:'400 11.5px var(--font-body)', color:'var(--text-tertiary)', marginBottom:8}}>{sig.risk.driver}</div>
            {sig.risk.dims.map((d,i)=><WdRange key={i} dim={d}/>)}
            <div style={{marginTop:8, padding:'8px 10px', borderRadius:10, background:'var(--glass-control-bg)', font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>
              Bands are this wallet's own usual range (p25–p75) · 30d baseline · 412 hourly snapshots.
              {w.maxLev>=12 && ' Note: leverage is chronically high — normal for this wallet, extreme vs peers.'}
            </div>
          </WdCard>
        </div>)}

        {/* ── ACTIVITY — full positions + last 10 settled + flow + events ── */}
        {tab==='activity' && (<div className="arx-arrive">
          <WdCard>
            <WdH right={w.positions.length ? 'all open' : 'flat'}>Open positions · {w.positions.length}</WdH>
            {w.positions.map((p,i)=>{
              const lv=+p.lev.replace('x','');
              const liqDist = lv<=5 ? ['comfortable','var(--regime-up-mid)','rgba(45,212,155,.12)'] : lv<=10 ? ['watch','var(--regime-trans-mid)','rgba(251,191,36,.14)'] : ['close','var(--regime-down-mid)','rgba(242,106,106,.12)'];
              return (
                <div key={i} style={{padding:'10px 0', borderBottom: i<w.positions.length-1?'.5px solid var(--border-default)':'none'}}>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <AssetGlyph sym={p.sym} size={28}/>
                    <span style={{font:'600 13.5px var(--font-body)'}}>{p.sym}-PERP</span>
                    <span style={{font:'700 10px var(--font-body)', color: p.dir==='LONG'?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{p.dir} {p.lev}</span>
                    <span style={{flex:1}}/>
                    <WdChip l={'liq: '+liqDist[0]} ink={liqDist[1]} bg={liqDist[2]}/>
                  </div>
                  <div className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', marginTop:5}}>size {p.size} · entry ~{p.entry}</div>
                </div>
              );
            })}
            {w.positions.length===0 && <div style={{padding:'6px 0', font:'400 12.5px var(--font-body)', color:'var(--text-tertiary)'}}>No open exposure right now.</div>}
          </WdCard>
          <WdCard>
            <WdH right="capped at 10 · full history on chain">Recent settled trades</WdH>
            {wdTrades(w,10).map((x,i)=>(
              <div key={i} style={{display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom: i<9?'.5px solid var(--border-default)':'none'}}>
                <AssetGlyph sym={x.sym} size={26}/>
                <div style={{flex:1, minWidth:0}}>
                  <span style={{font:'600 12.5px var(--font-body)'}}>{x.sym}</span>
                  <span style={{font:'700 9.5px var(--font-body)', marginLeft:6, color:x.dir==='LONG'?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{x.dir}</span>
                  <div style={{font:'400 10px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>held {x.held} · closed by trader</div>
                </div>
                <div style={{textAlign:'right', flexShrink:0}}>
                  <div className="num" style={{font:'600 12.5px var(--font-mono)', color:x.win?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{(x.win?'+$':'−$')+x.amt.toLocaleString()}</div>
                  <div style={{font:'400 10px var(--font-body)', color:'var(--text-tertiary)'}}>{x.when} ago</div>
                </div>
              </div>
            ))}
            <div style={{marginTop:10, paddingTop:12, borderTop:'.5px solid var(--border-default)', display:'flex', alignItems:'center', gap:10}}>
              <div style={{flex:1, font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.45}}>Copying mirrors their <b style={{color:'var(--text-secondary)'}}>new</b> trades from when you start — not these past ones.</div>
              {w.copyable && <button onClick={()=>setSetupOpen(true)} className="arx-press" style={{flexShrink:0, height:34, padding:'0 16px', borderRadius:11, border:'none', cursor:'pointer', background:'rgba(124,91,255,.14)', color:'var(--color-violet-500)', font:'700 12.5px var(--font-body)'}}>Copy</button>}
            </div>
          </WdCard>
          {sig.flow && (
            <WdCard>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
                <span style={{font:'600 13.5px var(--font-body)'}}>Capital flow</span>
                <WdChip l="Conviction-backed" ink="var(--regime-up-mid)" bg="rgba(45,212,155,.12)"/>
              </div>
              {[['Money in', sig.flow.in, '2d ago'],['Trade', sig.flow.seq, ''],['Outcome', sig.flow.out+' open', 'now']].map(([k,v,when],i,arr)=>(
                <div key={k} style={{display:'flex', gap:10}}>
                  <div style={{display:'flex', flexDirection:'column', alignItems:'center', width:12}}>
                    <span style={{width:8, height:8, borderRadius:'50%', background: i===arr.length-1?'var(--regime-up-mid)':'var(--color-violet-500)', marginTop:4, flexShrink:0}}/>
                    {i<arr.length-1 && <span style={{flex:1, width:2, background:'var(--border-strong)', margin:'2px 0'}}/>}
                  </div>
                  <div style={{flex:1, paddingBottom: i<arr.length-1?14:0, minWidth:0}}>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                      <span style={{font:'600 12px var(--font-body)'}}>{k}</span>
                      <span style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)'}}>{when}</span>
                    </div>
                    <div className="num" style={{font:'500 12px var(--font-mono)', color:'var(--text-secondary)', marginTop:1}}>{v}</div>
                  </div>
                </div>
              ))}
              <div style={{marginTop:4, font:'400 10px var(--font-body)', color:'var(--text-tertiary)'}}>match: trade within 24h · ≥5% of equity</div>
            </WdCard>
          )}
          <WdCard>
            <WdH>Recent changes</WdH>
            {sig.events.map(([e,when,tone],i)=>(
              <div key={i} style={{display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom: i<sig.events.length-1?'.5px solid var(--border-default)':'none'}}>
                <span style={{width:7, height:7, borderRadius:'50%', flexShrink:0, background: tone==='warn'?'var(--regime-trans-mid)':tone==='up'?'var(--regime-up-mid)':'var(--regime-range-mid)'}}/>
                <span style={{flex:1, font:'500 12.5px var(--font-body)', color:'var(--text-secondary)'}}>{e}</span>
                <span style={{font:'500 10.5px var(--font-body)', color:'var(--text-tertiary)'}}>{when}</span>
              </div>
            ))}
          </WdCard>
        </div>)}

        {/* ── COPIERS — ranked list + copy graph + early & capturable ── */}
        {tab==='copiers' && (<div className="arx-arrive">
          <WdCard>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
              <span style={{flex:1, font:'600 13.5px var(--font-body)'}}>Top copiers · {w.copiers.toLocaleString()}</span>
              <div style={{display:'flex', background:'var(--glass-control-bg)', borderRadius:8, padding:2}}>
                {[['pnl','PnL'],['aum','Capital'],['since','Newest']].map(([id,l])=>(
                  <button key={id} onClick={()=>setCopierSort(id)} style={{height:24, padding:'0 10px', borderRadius:6, border:'none', cursor:'pointer',
                    background: copierSort===id?'var(--surface-elevated)':'transparent', boxShadow: copierSort===id?'0 2px 5px rgba(0,0,0,.15)':'none',
                    color: copierSort===id?'var(--text-primary)':'var(--text-tertiary)', font:(copierSort===id?'700':'500')+' 10.5px var(--font-body)', whiteSpace:'nowrap'}}>{l}</button>
                ))}
              </div>
            </div>
            {w.copiers===0 && <div style={{padding:'6px 0', font:'400 12.5px var(--font-body)', color:'var(--text-tertiary)'}}>No copiers yet.</div>}
            {w.copiers>0 && copierRows.map((r,i)=>(
              <button key={r.c.addr} onClick={()=>window.__arxOpenSub && window.__arxOpenSub('walletDetail',{w:r.c})} className="arx-row-press" style={{
                width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 0', background:'none', border:'none', cursor:'pointer', textAlign:'left',
                borderBottom: i<copierRows.length-1?'.5px solid var(--border-default)':'none'}}>
                <span className="num" style={{width:16, font:'600 11px var(--font-mono)', color:'var(--text-tertiary)', flexShrink:0}}>{i+1}</span>
                <WalletAvatar w={r.c} size={32}/>
                <div style={{flex:1, minWidth:0}}>
                  <div className="num" style={{font:'600 12px var(--font-mono)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.c.x || r.c.addr}</div>
                  <div className="num" style={{font:'500 10px var(--font-mono)', color:'var(--text-tertiary)', marginTop:1}}>{wdCap$(r.cap)} capital · {r.since}d copying</div>
                </div>
                <div style={{textAlign:'right', flexShrink:0}}>
                  <div className="num" style={{font:'600 12px var(--font-mono)', color: r.real>=0?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{wdFmt$(r.real)}</div>
                  <div className="num" style={{font:'500 9.5px var(--font-mono)', color:'var(--text-tertiary)', marginTop:1}}>{wdFmt$(r.unreal)} open</div>
                </div>
                <IconChevron size={13} color="var(--text-tertiary)"/>
              </button>
            ))}
            {w.copiers>0 && <div style={{marginTop:8, font:'400 10px var(--font-body)', color:'var(--text-tertiary)'}}>Realized follows the {win} window · tap a copier to open their wallet. Arx sessions only.</div>}
          </WdCard>
          <WdCard>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
              <span style={{font:'600 13.5px var(--font-body)'}}>Copy graph</span>
              <WdChip l={upstream ? 'Echo' : 'Original'} ink={upstream?'var(--regime-trans-mid)':'var(--regime-up-mid)'} bg={upstream?'rgba(251,191,36,.14)':'rgba(45,212,155,.12)'}/>
            </div>
            {upstream && (
              <div style={{margin:'0 0 8px', padding:'10px 12px', borderRadius:10, background:'rgba(251,191,36,.08)', border:'.5px solid rgba(251,191,36,.3)', font:'400 12px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5}}>
                <b style={{color:'var(--text-primary)'}}>This wallet appears to copy {upstream.addr}.</b> {upstream.share}% of its entries follow that wallet within 90 seconds (inferred from fill timing — not confirmed). The jewel is usually the source.
              </div>
            )}
            <WdRow k={'Copier realized · '+win} v={w.copiers ? wdFmt$(copierReal) : '—'} c={copierReal>=0?'var(--regime-up-mid)':'var(--regime-down-mid)'}/>
            <WdRow k="Copier unrealized · now" v={w.copiers ? wdFmt$(Math.round(copierReal*0.08)) : '—'}/>
            <WdRow k={'Median copier · '+win} v={st ? ((st.roi*0.55>=0?'+':'−')+Math.abs(st.roi*0.55).toFixed(1)+'%') : '—'}/>
            {w.copiers>0 && <WdRow k="Realized vs stated" v="copiers capture ~92% (fees + slippage)"/>}
            <div style={{marginTop:8, font:'400 10px var(--font-body)', color:'var(--text-tertiary)'}}>Upstream reads are inferred from on-chain timing.</div>
          </WdCard>
          <WdCard>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
              <span style={{font:'600 13.5px var(--font-body)'}}>Early & capturable</span>
              {early && <WdChip l="Early" ink="var(--color-violet-500)" bg="rgba(124,91,255,.14)"/>}
            </div>
            <WdRow k="Quality vs crowd" v={early ? 'few copiers for this standing' : w.copiers>600 ? 'consensus pick' : 'moderate following'}/>
            <WdRow k="Copier trend · 7d" v={w.copiers ? '+'+Math.max(1,Math.round(w.copiers*0.02))+' this week' : '—'}/>
            <WdRow k="Mirror rate at your size" v={'~95% at '+wdCap$(Math.max(50,w.aumV*0.1))+' · ~60–70% at '+wdCap$(Math.max(50,w.aumV*0.03))}/>
            <WdRow k="Capacity ceiling" v={'~'+wdCap$(w.aumV)+' total copy capital'}/>
            <WdRow k="Copy slots" v={w.slots}/>
            <div style={{marginTop:8, font:'400 10px var(--font-body)', color:'var(--text-tertiary)'}}>Capacity is approximate — beyond ~1:1, copier orders start moving this wallet's own books.</div>
          </WdCard>
        </div>)}

        <div style={{margin:'14px 20px 0', font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', textAlign:'center', lineHeight:1.5}}>
          Not a copy recommendation. Your copy fills may differ from this wallet's. On-chain data, after fees where available.
        </div>
      </div>

      {/* floating actions — frosted glass */}
      <div style={{position:'absolute', left:16, right:16, bottom:'calc(16px + env(safe-area-inset-bottom))', display:'flex', gap:10, zIndex:8, pointerEvents:'none'}}>
        <button onClick={()=>setCmpOpen(true)} className="arx-press" style={{pointerEvents:'auto', flex:1, height:54, borderRadius:17, cursor:'pointer',
          border:'.5px solid var(--border-strong)',
          background:'var(--surface-elevated)',
          backdropFilter:'blur(28px) saturate(180%)', WebkitBackdropFilter:'blur(28px) saturate(180%)',
          color:'var(--text-primary)', font:'600 14px var(--font-body)',
          boxShadow:'0 10px 28px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.12)'}}>Compare</button>
        {w.copyable
          ? <button onClick={()=>setSetupOpen(true)} className="arx-press" style={{pointerEvents:'auto', flex:1.6, height:54, borderRadius:17, cursor:'pointer',
              border:'.5px solid rgba(255,255,255,.2)',
              background:'linear-gradient(180deg, rgba(150,118,255,.92) 0%, rgba(124,91,255,.86) 100%)',
              backdropFilter:'blur(28px) saturate(180%)', WebkitBackdropFilter:'blur(28px) saturate(180%)',
              color:'#fff', font:'700 15px var(--font-body)',
              boxShadow:'0 12px 32px rgba(124,91,255,.5), inset 0 1px 0 rgba(255,255,255,.3)'}}>Copy this wallet</button>
          : <div style={{pointerEvents:'auto', flex:1.6, height:54, borderRadius:17, background:'rgba(120,120,128,.16)', backdropFilter:'blur(28px) saturate(180%)', WebkitBackdropFilter:'blur(28px) saturate(180%)', border:'.5px solid rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', font:'600 12.5px var(--font-body)', color:'var(--text-tertiary)'}}>Not copy-eligible</div>}
      </div>

      {setupOpen && <CopySetupSheet w={w} onClose={()=>setSetupOpen(false)} onConfirm={()=>{ setSetupOpen(false); onToast('Copying '+(w.x||w.addr)+' — allocation set'); }}/>}
      {cmpOpen && <WdCompareSheet a={w} da={D2} onClose={()=>setCmpOpen(false)}/>}
    </div>
  );
}

/* ─── Compare sheet — pick a wallet you watch, then see the tiebreakers ─── */
function WdCompareSheet({ a, da, onClose }) {
  const candidates = WALLETS.filter(x => x.addr !== a.addr && WD_WATCH.has(x.addr));
  const [b, setB] = wdS(null);
  const r30 = (w) => w.stats['30D'] ? w.stats['30D'].pnl : '—';
  const Row = ({k, va, vb, ca: cA, cb: cB}) => (
    <div style={{display:'grid', gridTemplateColumns:'1.1fr 1fr 1fr', gap:8, padding:'9px 0', borderBottom:'.5px solid var(--border-default)', alignItems:'center'}}>
      <span style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)'}}>{k}</span>
      <span className="num" style={{font:'600 11.5px var(--font-mono)', color:cA||'var(--text-primary)'}}>{va}</span>
      <span className="num" style={{font:'600 11.5px var(--font-mono)', color:cB||'var(--text-primary)'}}>{vb}</span>
    </div>
  );
  let db, ca, cb, stA, stB;
  if (b) { db = wdDerive(b); ca = da.consist('30D'); cb = db.consist('30D'); stA = STANDING[standingOf(a, da.sig)]; stB = STANDING[standingOf(b, db.sig)]; }
  return (
    <GlassSheet onClose={onClose}>
      {!b && (
        <div style={{padding:'4px 22px 28px'}}>
          <div style={{font:'700 18px var(--font-body)'}}>Compare</div>
          <div style={{font:'400 12px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>Pick a wallet you watch to see them side by side.</div>
          {candidates.length===0 ? (
            <div style={{margin:'18px 0 4px', padding:'24px 18px', borderRadius:14, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', textAlign:'center'}}>
              <div style={{font:'600 13.5px var(--font-body)'}}>No watched wallets yet</div>
              <div style={{font:'400 12px var(--font-body)', color:'var(--text-tertiary)', marginTop:5, lineHeight:1.5}}>Tap ☆ Watch on any wallet, then come back to compare it against this one.</div>
            </div>
          ) : (
            <div style={{marginTop:12}}>
              {candidates.map(c => {
                const dc = wdDerive(c); const sc = STANDING[standingOf(c, dc.sig)]; const r = c.stats['30D'];
                return (
                  <button key={c.addr} onClick={()=>setB(c)} className="arx-row-press" style={{width:'100%', display:'flex', alignItems:'center', gap:11, padding:'11px 0', background:'none', border:'none', borderBottom:'.5px solid var(--border-default)', cursor:'pointer', textAlign:'left'}}>
                    <WalletAvatar w={c} size={36}/>
                    <div style={{flex:1, minWidth:0}}>
                      <div className="num" style={{font:'600 12.5px var(--font-mono)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.x || c.addr}</div>
                      <div style={{marginTop:3}}><WdChip l={sc.l} ink={sc.ink} bg={sc.bg}/></div>
                    </div>
                    <div style={{textAlign:'right', flexShrink:0}}>
                      <div className="num" style={{font:'600 12.5px var(--font-mono)', color: r ? (r.pnl.startsWith('−')?'var(--regime-down-mid)':'var(--regime-up-mid)') : 'var(--text-tertiary)'}}>{r?r.pnl:'—'}</div>
                      <div style={{font:'400 9.5px var(--font-body)', color:'var(--text-tertiary)'}}>30D</div>
                    </div>
                    <IconChevron size={14} color="var(--text-tertiary)"/>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
      {b && (
        <div style={{padding:'4px 22px 28px'}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <button onClick={()=>setB(null)} style={{width:30, height:30, borderRadius:'50%', border:'.5px solid var(--border-default)', background:'var(--surface-elevated)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transform:'rotate(180deg)', flexShrink:0}}><IconChevron size={14} color="var(--text-primary)"/></button>
            <div style={{font:'700 18px var(--font-body)'}}>Compare</div>
            <span style={{flex:1}}/>
            <span style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)'}}>from your watchlist</span>
          </div>
          {candidates.length>1 && (
            <div style={{display:'flex', gap:6, margin:'12px 0 0', overflowX:'auto', scrollbarWidth:'none'}}>
              {candidates.map(c => (
                <button key={c.addr} onClick={()=>setB(c)} className="num" style={{flexShrink:0, height:30, padding:'0 11px', borderRadius:999, cursor:'pointer',
                  border:'.5px solid ' + (b.addr===c.addr?'var(--color-violet-500)':'var(--border-default)'),
                  background: b.addr===c.addr?'rgba(124,91,255,.16)':'transparent',
                  color: b.addr===c.addr?'var(--color-violet-500)':'var(--text-secondary)', font:'600 11px var(--font-mono)'}}>{c.x || c.addr}</button>
              ))}
            </div>
          )}
          <div style={{display:'grid', gridTemplateColumns:'1.1fr 1fr 1fr', gap:8, padding:'14px 0 4px'}}>
            <span/>
            <span className="num" style={{font:'700 11.5px var(--font-mono)', color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{a.x || a.addr.slice(0,7)}</span>
            <span className="num" style={{font:'700 11.5px var(--font-mono)', color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{b.x || b.addr.slice(0,7)}</span>
          </div>
          <Row k="Standing" va={stA.l} vb={stB.l} ca={stA.ink} cb={stB.ink}/>
          <Row k="Qualified" va={da.qual.l.replace('proven over ','')} vb={db.qual.l.replace('proven over ','')}/>
          <Row k="Realized · 30D" va={r30(a)} vb={r30(b)} ca={r30(a).startsWith('−')?'var(--regime-down-mid)':'var(--regime-up-mid)'} cb={r30(b).startsWith('−')?'var(--regime-down-mid)':'var(--regime-up-mid)'}/>
          <Row k="Profitable days" va={ca.p+'/'+ca.d} vb={cb.p+'/'+cb.d}/>
          <Row k="Follower outcome" va={da.sig.follower?da.sig.follower.replace(' actual follower profit','').replace(' follower profit',''):'—'} vb={db.sig.follower?db.sig.follower.replace(' actual follower profit','').replace(' follower profit',''):'—'} ca="var(--regime-up-mid)" cb="var(--regime-up-mid)"/>
          <Row k="Max drawdown" va={'−'+a.dd.toFixed(1)+'%'} vb={'−'+b.dd.toFixed(1)+'%'}/>
          <Row k="Liquidations" va={String(a.liqs)} vb={String(b.liqs)} ca={a.liqs>0?'var(--regime-down-mid)':null} cb={b.liqs>0?'var(--regime-down-mid)':null}/>
          <Row k="Risk now" va={da.sig.risk.state} vb={db.sig.risk.state} ca={da.sig.risk.stateInk} cb={db.sig.risk.stateInk}/>
          <Row k="Originality" va={da.upstream?'echo':'original'} vb={db.upstream?'echo':'original'} ca={da.upstream?'var(--regime-trans-mid)':'var(--regime-up-mid)'} cb={db.upstream?'var(--regime-trans-mid)':'var(--regime-up-mid)'}/>
          <Row k="Copiers" va={a.copiers.toLocaleString()} vb={b.copiers.toLocaleString()}/>
          {window.scScore && (() => {
            const order=['profitability','consistency','risk','win','capital'];
            const axisLbl=['Profit','Stable','Risk','Win%','Capital'];
            const scA=window.scScore(a.addr), scB=window.scScore(b.addr);
            const cx=100, cy=96, R=70;
            const poly=v=>order.map((k,i)=>{const an=-Math.PI/2+i*(2*Math.PI/5);const rad=(v[k]/100)*R;return [cx+Math.cos(an)*rad,cy+Math.sin(an)*rad].join(',');}).join(' ');
            const cA='var(--color-violet-500)', cB='var(--regime-range-mid)';
            return (
              <div style={{marginTop:16, paddingTop:16, borderTop:'.5px solid var(--border-default)'}}>
                <div style={{font:'600 11px var(--font-body)', letterSpacing:'.06em', textTransform:'uppercase', color:'var(--text-tertiary)', marginBottom:4}}>Shape · percentile radar</div>
                <div style={{display:'flex', justifyContent:'center'}}>
                  <svg viewBox="0 0 200 192" style={{width:210, height:196}}>
                    {[0.25,0.5,0.75,1].map(f=>(<polygon key={f} points={order.map((k,i)=>{const an=-Math.PI/2+i*(2*Math.PI/5);return [cx+Math.cos(an)*R*f,cy+Math.sin(an)*R*f].join(',');}).join(' ')} fill="none" stroke="var(--border-default)" strokeWidth="1"/>))}
                    {order.map((k,i)=>{const an=-Math.PI/2+i*(2*Math.PI/5);return <line key={k} x1={cx} y1={cy} x2={cx+Math.cos(an)*R} y2={cy+Math.sin(an)*R} stroke="var(--border-default)" strokeWidth="1"/>;})}
                    <polygon points={poly(scB)} fill="rgba(59,130,246,0.14)" stroke={cB} strokeWidth="2"/>
                    <polygon points={poly(scA)} fill="rgba(124,91,255,0.18)" stroke={cA} strokeWidth="2"/>
                    {order.map((k,i)=>{const an=-Math.PI/2+i*(2*Math.PI/5);return <text key={k} x={cx+Math.cos(an)*(R+12)} y={cy+Math.sin(an)*(R+12)+3} fontSize="8.5" fill="var(--text-secondary)" textAnchor="middle" fontWeight="600">{axisLbl[i]}</text>;})}
                  </svg>
                </div>
                <div style={{display:'flex', gap:14, justifyContent:'center', fontSize:10, color:'var(--text-tertiary)'}}>
                  <span style={{display:'inline-flex', alignItems:'center', gap:5}}><i style={{width:12, height:2, background:cA}}/> {a.x||a.addr.slice(0,7)}</span>
                  <span style={{display:'inline-flex', alignItems:'center', gap:5}}><i style={{width:12, height:2, background:cB}}/> {b.x||b.addr.slice(0,7)}</span>
                </div>
              </div>
            );
          })()}
          <div style={{marginTop:12, font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>Same windows, same basis. Past results don't predict.</div>
        </div>
      )}
    </GlassSheet>
  );
}

Object.assign(window, { WalletDetail });
