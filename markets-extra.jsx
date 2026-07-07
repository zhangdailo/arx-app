/* ═══ ARX · Markets extras — What-if simulator + Regime explainer ═══
   Two full-page sub-screens, opened via:
     __arxOpenSub('whatif', { sym })   — the leverage What-if simulator
     __arxOpenSub('regime')            — the market-regime explainer (+ Lucid)
   Built on SubShell + existing components (WhatIfSpotlight, SentimentGauge). */

const { useState: meS } = React;

/* ── What-if simulator (full page) ── */
function WhatIfScreen({ sym = 'SOL', onBack, onToast }) {
  const trade = (s) => { onBack && onBack(); window.__arxTrade && window.__arxTrade(s || sym); };
  const ask = () => window.__arxOpenLucid && window.__arxOpenLucid({
    contextLabel: 'On the What-if simulator',
    intro: { action: 'Leverage multiplies both directions — equally.',
      body: 'The simulator shows the same move applied to your stake at each leverage. The dial that triples a gain triples the loss, and past a point one bad move wipes the position. Tell me a symbol and size and I’ll walk through the realistic range.' },
    chips: [
      { label: 'What leverage is sensible for me?', reply: { conf:'medium', action:'Start low — 2–5× — until the strategy is proven.', body:'Higher leverage shrinks the move it takes to liquidate you. Most consistent copy-traders sit at 3–6× on majors.' } },
      { label: 'How is liquidation calculated?', reply: { conf:'high', action:'Roughly: your liquidation is ~100/leverage % away from entry.', body:'At 10× a ~10% adverse move wipes the margin; at 5× it’s ~20%. Adding margin or lowering leverage widens that buffer.' } },
    ],
  });

  return (
    <SubShell title="What-if simulator" onBack={onBack}>
      <div style={{display:'flex', flexDirection:'column', gap:4, padding:'4px 20px 2px'}}>
        <span style={{font:'800 20px var(--font-brand)', letterSpacing:'-.02em', color:'var(--text-primary)'}}>See it both ways</span>
        <span style={{font:'400 12.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>Pick an asset and leverage. The same market move is applied up and down — so you feel the symmetry before you size a real trade.</span>
      </div>

      {/* the live simulator (asset switcher + leverage scrubber + up/down split) */}
      <WhatIfSpotlight sym={sym} onTrade={trade}/>

      {/* honest framing */}
      <div style={{margin:'8px 20px 0', padding:14, borderRadius:16, background:'rgba(242,106,106,.08)', border:'.5px solid rgba(242,106,106,.20)'}}>
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--regime-down-mid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span style={{font:'700 12.5px var(--font-body)', color:'var(--regime-down-mid)'}}>Leverage cuts both ways</span>
        </div>
        <span style={{font:'400 12px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5}}>This is a what-if, not a prediction. The higher the multiplier, the smaller the adverse move needed to liquidate the position entirely.</span>
      </div>

      {/* Lucid explain */}
      <button onClick={ask} className="arx-press" style={{display:'flex', alignItems:'center', gap:11, width:'calc(100% - 40px)', margin:'12px 20px 0', padding:'13px 14px', borderRadius:16, cursor:'pointer', textAlign:'left',
        background:'linear-gradient(135deg, rgba(124,91,255,.14), rgba(124,91,255,.03))', border:'.5px solid rgba(124,91,255,.30)'}}>
        {window.LucidOrb ? <LucidOrb size={26} breathe={false}/> : <span style={{fontSize:20}}>✨</span>}
        <div style={{flex:1, minWidth:0}}>
          <div style={{font:'700 13px var(--font-body)', color:'var(--text-primary)'}}>Ask Lucid about leverage</div>
          <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>Sensible sizing, liquidation math, your risk</div>
        </div>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M9 18l6-6-6-6"/></svg>
      </button>

      <div style={{padding:'14px 20px 8px'}}>
        <button onClick={()=>trade(sym)} className="arx-press" style={{width:'100%', height:50, borderRadius:'var(--r-md)', border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'700 15px var(--font-body)', boxShadow:'var(--shadow-execute)'}}>Trade {sym} for real</button>
      </div>
    </SubShell>
  );
}

/* ── Regime explainer (full page + Lucid) ── */
const REGIME_INPUTS = [
  { icon:'📊', t:'Funding', s:'When perp funding is positive, longs pay shorts — a sign the crowd is leaning long. Extreme funding often precedes a flush.', v:'+0.011% / 8h', tone:'up' },
  { icon:'🌊', t:'Volatility', s:'Realized vs implied volatility. Compressed vol tends to expand; elevated vol tends to mean-revert.', v:'Compressing', tone:'note' },
  { icon:'🧠', t:'Smart-money positioning', s:'How the proven 90-day cohort is positioned. When they lean one way with size, it carries weight.', v:'64% long', tone:'up' },
];
function RegimeScreen({ onBack }) {
  const ask = () => window.__arxOpenLucid && window.__arxOpenLucid({
    contextLabel: 'On the market regime',
    intro: { action: 'Right now the read is Risk-on — day 7.',
      body: 'Funding is mildly positive (crowd leaning long), volatility is compressing (a move is building), and smart money sits 64% long. Net: constructive, but a crowded long side means sharp pullbacks are possible. I can break down any one input.' },
    chips: [
      { label: 'What flips this to risk-off?', reply: { conf:'medium', action:'Funding spiking + smart money de-risking together.', body:'A regime flip usually shows up as funding pushing to an extreme while the proven cohort cuts longs — that combination has preceded the sharper drawdowns.' } },
      { label: 'What is a regime, exactly?', reply: { conf:'learn', action:'The market’s prevailing risk weather — not a price call.', body:'It’s a composite of funding, volatility and positioning that tells you whether conditions favour risk-taking or caution. Context for your trades, never a signal to act on alone.' } },
    ],
  });
  const toneColor = { up:'var(--regime-up-mid)', down:'var(--regime-down-mid)', note:'var(--color-violet-500)' };
  return (
    <SubShell title="Market regime" onBack={onBack}>
      <div style={{display:'flex', flexDirection:'column', gap:4, padding:'4px 20px 8px'}}>
        <span style={{font:'800 20px var(--font-brand)', letterSpacing:'-.02em', color:'var(--text-primary)'}}>Today’s read: Risk-on</span>
        <span style={{font:'400 12.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>The regime is the market’s risk weather — a composite of three inputs. It’s context, never a trade signal on its own.</span>
      </div>

      {window.RegimePill && <div style={{padding:'0 20px 10px'}}><RegimePill regime="up" day={7}/></div>}
      {window.SentimentGauge && <SentimentGauge value={38}/>}

      <div style={{padding:'10px 20px 0', font:'700 10px var(--font-body)', letterSpacing:'.07em', textTransform:'uppercase', color:'var(--text-tertiary)'}}>The three inputs</div>
      <div style={{display:'flex', flexDirection:'column', gap:8, padding:'8px 20px 0'}}>
        {REGIME_INPUTS.map((x,i)=>(
          <div key={i} style={{background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:16, padding:'13px 14px', display:'flex', alignItems:'flex-start', gap:12}}>
            <span style={{width:38, height:38, borderRadius:11, background:'var(--glass-control-bg)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0}}>{x.icon}</span>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:8}}>
                <span style={{font:'700 13.5px var(--font-body)', color:'var(--text-primary)'}}>{x.t}</span>
                <span className="num" style={{font:'700 12px var(--font-mono)', color:toneColor[x.tone], flexShrink:0}}>{x.v}</span>
              </div>
              <div style={{font:'400 11.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:3, lineHeight:1.5}}>{x.s}</div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={ask} className="arx-press" style={{display:'flex', alignItems:'center', gap:11, width:'calc(100% - 40px)', margin:'14px 20px 24px', padding:'13px 14px', borderRadius:16, cursor:'pointer', textAlign:'left',
        background:'linear-gradient(135deg, rgba(124,91,255,.14), rgba(124,91,255,.03))', border:'.5px solid rgba(124,91,255,.30)'}}>
        {window.LucidOrb ? <LucidOrb size={26} breathe={false}/> : <span style={{fontSize:20}}>✨</span>}
        <div style={{flex:1, minWidth:0}}>
          <div style={{font:'700 13px var(--font-body)', color:'var(--text-primary)'}}>Ask Lucid to explain the regime</div>
          <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>What it means for your book · what flips it</div>
        </div>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </SubShell>
  );
}

Object.assign(window, { WhatIfScreen, RegimeScreen });
