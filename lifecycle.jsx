/* ═══ ARX · Phase 1 — Lifecycle Home + Risk-state system ═══
   GROUND RULES (real-estate discipline):
   1. Landing view is sacred — for funded users, equity + positions lead. The hero
      never pushes them fully below the fold.
   2. Three tiers only:
        · TAKEOVER (full card)  — ONLY the critical risk state. Safety earns the space.
        · STRIP (one line + one action) — activation + contextual nudges.
        · NONE — active / power-daily / portfolio-monitor: the normal Home IS the hero.
   3. No exit / withdrawal encouragement. Arx optimizes for engaged, risk-aware trading,
      not cashing out — so there is no "take profit" nudge.
   4. One hero at a time. */

const { useState: lcS } = React;

/* ── risk-state tokens (proposed DS) ── */
const RISK = {
  normal:   { ink:'var(--regime-up-mid)',    bg:'rgba(20,184,123,.12)',  label:'Normal' },
  elevated: { ink:'var(--regime-trans-mid)', bg:'rgba(251,191,36,.14)',  label:'Elevated' },
  critical: { ink:'var(--regime-down-mid)',  bg:'rgba(255,77,106,.14)',  label:'Critical' },
};

/* ── lifecycle stages (06 lifecycle map) — profit/exit removed by objective ── */
const LIFECYCLE_STAGES = [
  ['first_install',       '0 · First install'],
  ['connected_no_deposit','1 · Created · no deposit'],
  ['funded_no_trade',     '2 · Funded · no trade'],
  ['first_trade',         '3 · First-trade explore'],
  ['copying',             '4 · Copying active'],
  ['active',              '5 · Active trading'],
  ['portfolio_monitor',   '6 · Portfolio monitor'],
  ['power_daily',         '7 · Power · daily'],
  ['risk_stress',         '8 · Risk / liquidation'],
  ['dormant_return',      '9 · Dormant return'],
];

const lcBtn = (label, ink, bg, fn, primary) => (
  <button onClick={fn} className="arx-press" style={{
    height:40, padding:'0 16px', borderRadius:11, cursor:'pointer', border:'none',
    background: primary ? ink : bg, color: primary ? '#fff' : ink,
    font:'700 13px var(--font-body)', boxShadow: primary ? 'var(--shadow-execute)' : 'none',
    display:'inline-flex', alignItems:'center', gap:7
  }}>{label}</button>
);

/* ── STRIP — compact, one line + one action; never dominates the fold ──
   Activation nudges are brand moments → Violet (DS brand/CTA color), never
   regime/risk green. Risk colour is reserved for the takeover + Trade + top bar. */
function LcStrip({ tone, eyebrow, text, ctaLabel, onCta, ctaInk }) {
  return (
    <div className="arx-arrive" style={{
      margin:'2px 20px 10px', padding:'11px 12px 11px 15px', borderRadius:14,
      background:'rgba(124,91,255,.05)', border:'.5px solid rgba(124,91,255,.18)',
      display:'flex', alignItems:'center', gap:12
    }}>
      <div style={{flex:1, minWidth:0}}>
        {eyebrow && <div style={{font:'600 9px var(--font-body)', letterSpacing:'.08em', textTransform:'uppercase', color:'var(--text-tertiary)', marginBottom:3}}>{eyebrow}</div>}
        <div style={{font:'500 12.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.4}}>{text}</div>
      </div>
      {ctaLabel && <button onClick={onCta} className="arx-press" style={{flexShrink:0, height:34, padding:'0 15px', borderRadius:10, border:'none', cursor:'pointer',
        background:'var(--color-violet-500)', color:'#fff', font:'700 12.5px var(--font-body)', boxShadow:'0 4px 12px rgba(124,91,255,.3)'}}>{ctaLabel}</button>}
    </div>
  );
}

/* ── the lifecycle hero — three tiers, by stage × persona ── */
function LifecycleHero({ stage, persona, onTrade, onTabChange }) {
  const openSub = (id, p) => window.__arxOpenSub && window.__arxOpenSub(id, p||{});
  const s7 = persona !== 's2';
  const askLucid = () => { const f=[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Ask Lucid'); f&&f.click(); };

  switch (stage) {
    // TIER: none — landing view (equity + positions) is the hero
    case 'active':
    case 'power_daily':
    case 'portfolio_monitor':
      return null;

    // TIER: takeover — only the critical state earns a full card
    case 'risk_stress':
      return <RiskTakeover onTrade={onTrade} onTabChange={onTabChange}/>;

    // TIER: strip — activation + contextual nudges
    case 'first_install':
      return <LcStrip eyebrow="Welcome" text="See who's winning on-chain — proven, not lucky."
        ctaLabel="Browse" onCta={()=>onTabChange('wallets')}/>;
    case 'connected_no_deposit':
      return <LcStrip eyebrow="One step to start"
        text={s7 ? "$500 copying @HsakaTrades ≈ +$440 over 90d." : "Add funds to place your first trade."}
        ctaLabel="Add funds" onCta={()=>openSub('funding')}/>;
    case 'funded_no_trade':
      return <LcStrip eyebrow="You're funded"
        text={s7 ? "Make your first copy — guardrails on by default." : "Place your first trade — risk stays in view."}
        ctaLabel={s7?'Copy':'Trade'} onCta={s7?(()=>onTabChange('wallets')):onTrade}/>;
    case 'first_trade':
      return <LcStrip eyebrow="First trade" text="Every confirm shows your risk and liquidation price."
        ctaLabel="Ask Lucid" ctaInk="var(--color-violet-500)" onCta={askLucid}/>;
    case 'copying':
      return <LcStrip eyebrow="Your copies · today" text="Up +$340 · mirrored 92% · loss limit 31% away."
        ctaLabel="Manage" onCta={()=>onTabChange('wallets')}/>;
    case 'dormant_return':
      return <LcStrip eyebrow="While you were away · 6d" text="Copies held up +$210 — nothing tripped a guardrail."
        ctaLabel="See" onCta={()=>openSub('notifications')}/>;
    default:
      return null;
  }
}

/* ── the critical-state takeover (the one stage allowed full real estate) ── */
function RiskTakeover({ onTrade, onTabChange }) {
  const t = RISK.critical;
  const askRisk = () => window.__arxOpenLucid && window.__arxOpenLucid({
    contextLabel:'On BTC-PERP · liquidation risk',
    intro:{ action:"You're 6% from liquidation on BTC. Here are your levers.", body:'Adding margin moves your liquidation price away. Reducing closes part of the position now. A stop-loss caps the loss before liquidation. I\u2019ll lay out the trade-offs — the decision is yours.' },
    chips:[
      { label:'What happens if I do nothing?', reply:{ conf:'high', action:'If BTC falls 6% to $62,180, the position is force-closed.', body:'Liquidation realizes the loss at market and can slip further in fast conditions. Distance is measured on mark price, which can move faster than last. This is structure, not a prediction.', data:[['Liq. price','$62,180','warn'],['Distance','6.0%','warn'],['Position','$120K · 12×','']] }},
      { label:'Add margin or reduce?', reply:{ conf:'medium', action:'Both widen the buffer — they cost different things.', body:'Adding margin keeps the position but ties up more capital. Reducing frees margin and cuts exposure but locks in part of the loss now. Neither is “right” — it depends on your conviction.', note:'Analysis, not a recommendation to trade.' }},
    ],
  });
  return (
    <div className="arx-arrive" style={{
      margin:'4px 20px 10px', padding:'18px', borderRadius:20,
      background:'linear-gradient(180deg, rgba(255,77,106,.16), rgba(255,77,106,.05))',
      border:'1px solid rgba(255,77,106,.4)', boxShadow:'0 10px 30px rgba(255,77,106,.18)'
    }}>
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
        <span className="arx-breath" style={{width:9, height:9, borderRadius:'50%', background:t.ink, boxShadow:'0 0 10px '+t.ink}}/>
        <span style={{font:'700 10px var(--font-body)', letterSpacing:'.08em', textTransform:'uppercase', color:t.ink}}>Risk · action needed</span>
      </div>
      <div style={{font:'700 19px var(--font-body)', letterSpacing:'-.01em', color:'var(--text-primary)'}}>You're 6% from liquidation on BTC.</div>
      <div style={{display:'flex', gap:16, margin:'14px 0 4px'}}>
        {[['Liq price','$62,180'],['Distance','6.0%'],['Position','$120K · 12×']].map(([k,v])=>(
          <div key={k}>
            <div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.04em'}}>{k}</div>
            <div className="num" style={{font:'700 15px var(--font-mono)', color: k==='Distance'?t.ink:'var(--text-primary)', marginTop:2}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex', gap:9, marginTop:14, flexWrap:'wrap'}}>
        {lcBtn('Add margin', t.ink, t.bg, ()=>window.__arxOpenSub && window.__arxOpenSub('funding'), true)}
        {lcBtn('Reduce position', t.ink, t.bg, onTrade)}
        {lcBtn('Wind down', t.ink, t.bg, ()=>onTabChange('wallets'))}
      </div>
      <button onClick={askRisk} className="arx-press" style={{marginTop:13, paddingTop:12, display:'flex', alignItems:'center', gap:9, width:'100%',
        background:'none', border:'none', borderTop:'.5px solid rgba(255,77,106,.22)', cursor:'pointer', textAlign:'left'}}>
        <LucidOrb size={20} breathe={false}/>
        <span style={{flex:1, font:'600 12px var(--font-body)', color:'var(--text-primary)'}}>Ask Lucid to walk the trade-offs</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-violet-500)" strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>
      <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:12, lineHeight:1.45}}>
        Adding margin moves your liquidation price away. Reducing closes part of the position now. Realized loss can still exceed estimates in fast markets.
      </div>
    </div>
  );
}

/* ── unified side demo panel — theme · persona · lifecycle (review scaffold) ── */
function DemoSeg({ options, value, onChange }) {
  return (
    <div style={{display:'flex', background:'rgba(255,255,255,.06)', border:'.5px solid rgba(255,255,255,.12)', borderRadius:9, padding:3, gap:2}}>
      {options.map(([id,l])=>(
        <button key={id} onClick={()=>onChange(id)} style={{flex:1, height:28, borderRadius:6, border:'none', cursor:'pointer',
          background: value===id?'#7C5BFF':'transparent', color: value===id?'#fff':'#A8A4B8', font:'700 11px -apple-system,sans-serif', whiteSpace:'nowrap'}}>{l}</button>
      ))}
    </div>
  );
}
function DemoPanel({ theme, setTheme }) {
  const [persona, setP] = lcS(()=>{ try{return localStorage.getItem('arx-persona')||'s7';}catch(e){return 's7';} });
  const [stage, setSt] = lcS(()=>{ try{return localStorage.getItem('arx-lifecycle')||'active';}catch(e){return 'active';} });
  const [open, setOpen] = lcS(()=>{ try{return localStorage.getItem('arx-demo-panel')!=='closed';}catch(e){return true;} });
  const setPanel = (v)=>{ setOpen(v); try{localStorage.setItem('arx-demo-panel', v?'open':'closed');}catch(e){} };
  const fire = ()=>{ try{ window.dispatchEvent(new Event('arx-demo')); }catch(e){} };
  const pickP = (p)=>{ setP(p); try{localStorage.setItem('arx-persona',p);}catch(e){} fire(); };
  const pickS = (s)=>{ setSt(s); try{localStorage.setItem('arx-lifecycle',s);}catch(e){} fire(); };
  const lbl = ()=>({font:'700 9px -apple-system,sans-serif', letterSpacing:'.08em', textTransform:'uppercase', color:'#6E6A80', margin:'14px 0 7px'});

  // Collapsed → a small floating chip to reopen (so it's dismissable on a phone but never lost)
  if (!open) return (
    <button onClick={()=>setPanel(true)} title="Show demo controls" style={{position:'fixed', left:16, top:16, zIndex:9000, height:32, padding:'0 12px', borderRadius:999, cursor:'pointer',
      background:'#15131F', border:'1px solid rgba(255,255,255,.14)', color:'#B3A1FF', font:'700 11px -apple-system,sans-serif', display:'inline-flex', alignItems:'center', gap:6, boxShadow:'0 8px 24px rgba(0,0,0,.4)'}}>
      <span style={{fontSize:12}}>⚙</span> Demo
    </button>
  );

  return (
    <div style={{position:'fixed', left:20, top:'50%', transform:'translateY(-50%)', width:188, zIndex:9000,
      background:'#15131F', border:'1px solid rgba(255,255,255,.12)', borderRadius:18, padding:'16px 16px 18px',
      boxShadow:'0 18px 50px rgba(0,0,0,.5)', fontFamily:'-apple-system,sans-serif'}}>
      <div style={{display:'flex', alignItems:'flex-start', gap:8}}>
        <div style={{flex:1}}>
          <div style={{font:'800 12px -apple-system,sans-serif', color:'#F4F2FA', letterSpacing:'-.01em'}}>Demo controls</div>
          <div style={{font:'500 10px -apple-system,sans-serif', color:'#7C7890', marginTop:2, lineHeight:1.4}}>One app · the journey changes what surfaces.</div>
        </div>
        <button onClick={()=>setPanel(false)} title="Close" aria-label="Close demo controls" style={{flexShrink:0, width:24, height:24, borderRadius:'50%', cursor:'pointer', background:'rgba(255,59,78,.16)', border:'1px solid rgba(255,59,78,.5)', color:'#FF3B4E', font:'700 13px -apple-system,sans-serif', lineHeight:1, display:'inline-flex', alignItems:'center', justifyContent:'center'}}>✕</button>
      </div>

      <div style={lbl()}>Theme</div>
      <DemoSeg options={[['light','☀ Light'],['dark','☾ Dark']]} value={theme} onChange={setTheme}/>

      <div style={lbl()}>Lifecycle stage</div>
      <div style={{display:'flex', flexDirection:'column', gap:4, maxHeight:230, overflowY:'auto', scrollbarWidth:'thin'}}>
        {LIFECYCLE_STAGES.map(([id,l])=>(
          <button key={id} onClick={()=>pickS(id)} style={{textAlign:'left', height:28, padding:'0 11px', borderRadius:8, cursor:'pointer',
            background: stage===id?'rgba(124,91,255,.16)':'transparent', border:'.5px solid '+(stage===id?'rgba(124,91,255,.4)':'transparent'),
            color: stage===id?'#B3A1FF':'#A8A4B8', font:(stage===id?'700':'500')+' 11px -apple-system,sans-serif'}}>{l}</button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { LifecycleHero, RiskTakeover, LcStrip, DemoPanel, LIFECYCLE_STAGES, RISK });
