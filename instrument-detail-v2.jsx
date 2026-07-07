// app/instrument-detail-v2.jsx — below-chart structure v3
// Pinned: Lucid composite read (IdV2Lucid). Top-level tabs (no Overview/Book/About):
//   perp → Bias · Flow · Walls · Stress · Traders · Changes
//   spot → Bias · Flow · Traders · Changes
// Signal tabs reuse Instrument{Bias,Flow,Walls,Stress}Tab (instrument-view.jsx).
// Changes = "What changed · 24h" event timeline (EV-I01–04, 08-2-6).
// Restore old tabbed build: localStorage['arx-id-v2']='0'.

const v2On = (()=>{ try { return localStorage.getItem('arx-id-v2')!=='0'; } catch(e){ return true; } })();
function v2Tier(m){ const n=(function(v){ if(typeof v!=='string') return 0; const x=v.replace(/[$,]/g,'').match(/([\d.]+)\s*([BMK]?)/i); if(!x) return 0; return parseFloat(x[1])*({B:1e9,M:1e6,K:1e3,'':1}[(x[2]||'').toUpperCase()]||1); })(m&&m.oi); if(!n) return 'ok'; if(n < 6e7) return 'thin'; if(n > 5e8) return 'deep'; return 'ok'; }

/* ── Lucid composite read · uses the DS-standard LucidTip template ── */
function IdV2Lucid({ m, bull, sf, acctPro }){
  const sym = m.sym;
  const mult = (sf && sf.multiple) || '2.4';
  if (typeof LucidTip==='undefined') return null;
  if (v2Tier(m)==='thin') return (<LucidTip kicker="Lucid read"
    verdict={{ tone:'warn', text:`No clean read on ${sym} — too thin. Under 20 tracked wallets and a shallow book; treat anything here as low-confidence.` }}
    groups={[]} foot="Ask Lucid"
    seed={{ contextLabel:'On '+sym, intro:{ action:`${sym} is too thin for a clean read.`, body:'Fewer than 20 tracked wallets and a shallow book. Signals are baseline-forming.' } }}/>);
  const side = bull ? 'long' : 'short';
  const opp  = bull ? 'short' : 'long';
  return (<LucidTip kicker="Lucid read"
    verdict={{ tone: bull?'up':'warn', text: bull ? 'Smart money is building the long side.' : 'Quality capital is short against a crowded long.' }}
    groups={[{ label:'Evidence', tone:'note', items:[
      `Smart Money & Whales lean ${side}; the broad crowd is ${opp}.`,
      `Flow is ${mult}× normal and accelerating.`,
      `${bull?'Short':'Long'}-side stress elevated near a forced-exit wall.`
    ]}]}
    foot="Continue with Lucid"
    seed={{ contextLabel:'On '+sym+'-PERP · positioning', intro:{ action:`Here's what the ${sym} order flow is really saying.`, body:`${bull?'Bullish':'Bearish'} flow is ${mult}× above normal and Smart Money is on the ${side} side, but ${opp}-side liquidation stress is elevated.` } }}/>);
}

/* ── small shared bits ── */
function V2Head({children, right}){ return (<div style={{display:'flex', alignItems:'baseline', gap:6, margin:'2px 0 0'}}>
  <span style={{font:'700 13px var(--font-brand)', color:'var(--text-primary)', letterSpacing:'-.01em'}}>{children}</span>
  {right && <span style={{marginLeft:'auto', font:'600 10px var(--font-body)', color:'var(--color-violet-300)'}}>{right}</span>}
</div>); }
const v2Card = { background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:16 };

/* ════════════════════════════════════════════════════════════════════
   Changes — "What changed · 24h" event timeline (EV-I01–04, 08-2-6)
   The temporal layer the page otherwise lacks: observed state changes
   in bias / flow / walls / stress, newest first, each drilling into its
   signal tab. Derived from the per-asset sig model.
   ════════════════════════════════════════════════════════════════════ */
const IDV2_SEV = { critical:'var(--regime-crisis-mid)', high:'var(--regime-down-mid)', med:'var(--regime-trans-mid)', low:'var(--text-tertiary)' };

function idv2Changes(sig, bull, isPerp){
  if(!sig) return [];
  const f=(sig.flow&&sig.flow.current)||{}, b=sig.bias||{}, st=(sig.stress&&sig.stress.read)||{};
  const kw=(sig.walls&&sig.walls.keyWalls)||[]; const fE=kw.find(w=>w.kind==='forced')||{};
  const dir = bull?'bullish':'bearish';
  const cap = (s)=> String(s||'').replace(/^./,c=>c.toUpperCase());
  const evs=[];
  // EV-I04 Stress (risk) — most recent, highest stakes
  if(isPerp && st.state){
    const sev = st.stateTone==='critical'?'critical': st.stateTone==='elevated'?'high':'med';
    evs.push({ ev:'EV-I04', job:'Risk', tab:'risk', sev, mins:38,
      title:`${st.side||'Long'}-side stress rose to ${cap(st.state)}`,
      detail:`Underwater share crossed 40% · ${st.vulnerable||'—'} vulnerable, ${st.wallets||'—'} wallets` });
  }
  // EV-I02 Flow (timing)
  if(f.state){
    evs.push({ ev:'EV-I02', job:'Timing', tab:'direction', sev:'med', mins:124,
      title:`${f.dominantCohort||'Smart Money'}-led ${dir} flow ${f.state==='rising'?'is rising':'is above normal'}`,
      detail:`1h flow ${f.multiple||'—'}× normal · ${f.currentNotional||''} vs ${f.baselineNotional||''} normal` });
  }
  // EV-I03 Wall (structure)
  if(isPerp && fE.center){
    evs.push({ ev:'EV-I03', job:'Structure', tab:'risk', sev:'med', mins:191,
      title:`Forced-exit wall formed −${fE.distance||''} below`,
      detail:`Crowd ${bull?'longs':'shorts'} clustering · ${fE.value||''}` });
  }
  // EV-I01 Bias (direction) — slowest to matter
  if(b.bucket){
    evs.push({ ev:'EV-I01', job:'Direction', tab:'direction', sev:'low', mins:312,
      title:`Bias moved to ${b.bucket}`,
      detail:`Smart Money added ${b.deltaDir==='bearish'?'short':'long'} exposure · +${b.deltaPts||0} pts (4h)` });
  }
  return evs.sort((a,b)=>a.mins-b.mins);
}

function IdV2Changes({ m, sig, bull, isPerp, go }){
  const evs = idv2Changes(sig, bull, isPerp);
  const ago = (mm)=> mm<60 ? mm+'m ago' : Math.round(mm/60)+'h ago';
  return (<div className="arx-arrive" style={{padding:'12px 16px 4px'}}>
    <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, marginBottom:11}}>
      <div>
        <div style={{font:'600 11px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.08em', textTransform:'uppercase'}}>What changed</div>
        <div style={{font:'500 11.5px var(--font-body)', color:'var(--text-secondary)', marginTop:3, lineHeight:1.35}}>Observed state changes on {m.sym} · last 24h</div>
      </div>
      <span style={{display:'inline-flex', alignItems:'center', gap:5, flexShrink:0, padding:'4px 9px', borderRadius:999, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', font:'600 9.5px var(--font-body)', color:'var(--text-secondary)', letterSpacing:'.02em'}}>
        <span className="arx-breath" style={{width:6, height:6, borderRadius:'50%', background:'var(--regime-up-mid)', boxShadow:'0 0 6px var(--regime-up-mid)'}}/>Live
      </span>
    </div>

    {evs.length ? (
      <div style={{...v2Card, padding:'2px 14px'}}>
        {evs.map((e,i)=>{ const last=i===evs.length-1; const ink=IDV2_SEV[e.sev]; const newest=i===0;
          return (
          <button key={e.ev} onClick={()=>go&&go(e.tab)} className="arx-row-press" style={{display:'flex', gap:13, width:'100%', textAlign:'left', background:'none', border:'none', padding:'13px 0', cursor:'pointer', alignItems:'stretch'}}>
            {/* severity rail + connector */}
            <div style={{position:'relative', width:11, flexShrink:0, display:'flex', justifyContent:'center'}}>
              <span className={newest?'arx-breath':''} style={{position:'absolute', top:5, width:10, height:10, borderRadius:'50%', background:ink, boxShadow:newest?`0 0 8px ${ink}`:'none', border:'2px solid var(--surface-elevated)', boxSizing:'border-box', zIndex:1}}/>
              {!last && <span style={{position:'absolute', top:16, bottom:-13, left:'50%', transform:'translateX(-50%)', width:1.5, background:'var(--border-default)'}}/>}
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', alignItems:'baseline', gap:8, justifyContent:'space-between'}}>
                <span style={{display:'inline-flex', alignItems:'center', gap:6, minWidth:0}}>
                  <span style={{font:'700 8.5px var(--font-body)', color:ink, letterSpacing:'.06em', textTransform:'uppercase', whiteSpace:'nowrap'}}>{e.job}</span>
                  <span style={{width:3, height:3, borderRadius:'50%', background:'var(--text-tertiary)', opacity:.6, flexShrink:0}}/>
                  <span className="num" style={{font:'600 9px var(--font-mono)', color:'var(--text-tertiary)', letterSpacing:'.04em', whiteSpace:'nowrap'}}>{e.ev}</span>
                </span>
                <span className="num" style={{font:'500 10px var(--font-mono)', color:'var(--text-tertiary)', flexShrink:0}}>{ago(e.mins)}</span>
              </div>
              <div style={{font:'600 13.5px var(--font-body)', color:'var(--text-primary)', marginTop:4, letterSpacing:'-.005em', lineHeight:1.3}}>{e.title}</div>
              <div className="num" style={{font:'500 11.5px var(--font-mono)', color:'var(--text-secondary)', marginTop:4, lineHeight:1.45}}>{e.detail}</div>
              <span style={{display:'inline-flex', alignItems:'center', gap:3, marginTop:8, font:'700 10px var(--font-body)', color:'var(--color-violet-300)'}}>
                View {e.tab.replace(/^./,c=>c.toUpperCase())}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </span>
            </div>
          </button>);
        })}
      </div>
    ) : (
      <div style={{...v2Card, padding:16, font:'500 12px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>Quiet on {m.sym} — no decision-changing moves in the last 24h. Bias and flow are holding their state.</div>
    )}

    <DisclaimerFooter text="Events are observed state changes, not predictions. Each marks a signal moving enough to matter (EV-I01–04)."/>
  </div>);
}

/* ── Traders: relevant wallets (reuse IdWallets) + borrow + leaderboard ── */
function IdV2Borrow({ bull }){
  const side = bull?'longs':'shorts';
  const rows=[['Leverage','~5×','observed median','var(--text-primary)'],['Stop-loss','at forced-exit wall','inferred','var(--regime-up-mid)'],['Take-profit','at profit-taking wall','inferred','var(--regime-trans-mid)']];
  return (<div style={{...v2Card, padding:14, background:'linear-gradient(150deg, rgba(124,91,255,.12), rgba(124,91,255,.03))', border:'.5px solid rgba(124,91,255,.3)'}}>
    <div style={{display:'flex', alignItems:'center', gap:7, marginBottom:8}}>
      <span style={{width:16, height:16, borderRadius:'50%', background:'radial-gradient(circle at 35% 30%, var(--color-violet-300), var(--color-violet-700))'}}/>
      <span style={{font:'700 12px var(--font-brand)', color:'var(--text-primary)'}}>Borrow settings from smart money</span></div>
    <div style={{font:'500 11px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5, marginBottom:10}}>Aggregate of Smart Money + Whale {side} here — leverage = median (observed), SL/TP = nearest walls (inferred). Not advice.</div>
    {rows.map((r,i)=>(<div key={r[0]} style={{display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderTop:i?'.5px solid var(--border-default)':'none'}}>
      <span style={{width:72, font:'600 11px var(--font-body)', color:'var(--text-tertiary)'}}>{r[0]}</span>
      <span className="num" style={{font:'700 12px var(--font-mono)', color:r[3]}}>{r[1]}</span>
      <span style={{flex:1, textAlign:'right', font:'500 9px var(--font-body)', color:'var(--text-tertiary)'}}>{r[2]}</span></div>))}
    <button className="arx-press" style={{width:'100%', marginTop:11, height:38, borderRadius:11, border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'700 12px var(--font-body)'}}>Apply to trade ticket →</button>
  </div>);
}
function IdV2Leaderboard({ m }){
  const ws=(window.WALLETS||[]).slice().sort((a,b)=>(b.copierPnlV||0)-(a.copierPnlV||0)).slice(0,4);
  const f$=(v)=>{ const n=Math.abs(v); const s=n>=1e6?'$'+(n/1e6).toFixed(2)+'M':n>=1e3?'$'+(n/1e3).toFixed(0)+'K':'$'+n; return (v<0?'−':'+')+s; };
  return (<div style={{...v2Card, padding:'4px 14px 10px'}}>
    <div style={{display:'flex', font:'600 8.5px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.05em', textTransform:'uppercase', padding:'8px 0 4px'}}>
      <span style={{flex:1}}>Trader</span><span style={{width:60, textAlign:'right'}}>uPnL</span><span style={{width:46, textAlign:'right'}}>ROI</span></div>
    {ws.map((w,i)=>{ const id=window.resolveIdentity?window.resolveIdentity(w):null; const nm=(id&&(id.handle||id.name))||w.x||w.addr; return (
      <div key={w.addr} style={{display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderTop:'.5px solid var(--border-default)'}}>
        <span className="num" style={{width:14, font:'700 10px var(--font-mono)', color:'var(--text-tertiary)'}}>{i+1}</span>
        <div style={{flex:1, minWidth:0}}><div style={{font:'600 11.5px var(--font-body)', color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{nm}</div></div>
        <span className="num" style={{width:60, textAlign:'right', font:'700 11px var(--font-mono)', color:(w.copierPnlV||0)>=0?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{f$(w.copierPnlV||0)}</span>
        <span className="num" style={{width:46, textAlign:'right', font:'600 10px var(--font-mono)', color:'var(--text-tertiary)'}}>{w.roi30!=null?(w.roi30>=0?'+':'−')+Math.abs(w.roi30).toFixed(0)+'%':'—'}</span></div>); })}
    <div style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)', marginTop:9}}>Based on on-chain data. Returns shown are before fees.</div>
  </div>);
}
function IdV2Traders({ m, bull, acctPro, isPerp }){
  return (<div className="arx-arrive" style={{padding:'12px 16px 4px', display:'flex', flexDirection:'column', gap:12}}>
    <div><V2Head right="open now · quality-first">Relevant wallets</V2Head>
      <div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', margin:'2px 0 8px', lineHeight:1.4}}>Tracked wallets positioned in {m.sym} now · sorted by open notional (exposure) · role vs the read.</div>
      {typeof IdWallets!=='undefined' ? <IdWallets pro={acctPro}/> : null}</div>
    {isPerp && <IdV2Borrow bull={bull}/>}
    <div><V2Head right="Unrealized · 30d ▾">PnL leaderboard · this market</V2Head>
      <div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', margin:'2px 0 8px', lineHeight:1.4}}>Tracked wallets · ranked by unrealized PnL on open positions (not exposure).</div>
      <IdV2Leaderboard m={m}/></div>
  </div>);
}

/* ── Overview — conviction read + drill-in cards + what-changed timeline.
   The pinned Lucid read sits above the tabs; Overview is the glance into Positioning/Flow/Risk. ── */
function IdV2Overview({ m, sig, bull, isPerp, go }){
  const cap = (s)=> String(s||'').replace(/^./,c=>c.toUpperCase());
  const b=(sig&&sig.bias)||{}, f=(sig&&sig.flow&&sig.flow.current)||{}, st=(sig&&sig.stress&&sig.stress.read)||{};
  const kw=(sig&&sig.walls&&sig.walls.keyWalls)||[]; const fE=kw.find(w=>w.kind==='forced')||{};
  const mult=(f.multiple)||'2.4'; const multN=parseFloat(mult)||1;
  const flowState = multN>=3?'Surging':multN>=1.5?'Elevated':'Normal';
  const convLine = (typeof posConvictionLine!=='undefined') ? posConvictionLine(sig) : null;
  const card = (typeof ToplineCard!=='undefined');
  return (<div className="arx-arrive">
    {convLine && <div style={{padding:'12px 16px 0'}}>
      <div style={{padding:'11px 13px', borderRadius:12, background:'linear-gradient(150deg, rgba(124,91,255,.12), rgba(124,91,255,.03))', border:'.5px solid rgba(124,91,255,.26)'}}>
        <span style={{display:'block', font:'700 8.5px var(--font-body)', color:'var(--color-violet-300)', letterSpacing:'.12em', textTransform:'uppercase', marginBottom:5}}>Conviction read</span>
        <span style={{font:'600 13px var(--font-brand)', color:'var(--text-primary)', lineHeight:1.4, letterSpacing:'-.005em'}}>{convLine}</span>
      </div>
    </div>}
    <div style={{height:12}}/>
    {card && <ToplineCard
      name="Positioning" state={bull?'Leaning long':'Leaning short'} stateTone={bull?'bullish':'bearish'}
      headline={(b.bucket || (bull?'Leaning long':'Leaning short'))+'.'}
      sub={`Smart Money on the ${bull?'long':'short'} side vs the crowd.`}
      meta={[
        { label:'Net lean', value: b.bucket || (bull?'Bullish':'Bearish') },
        { label:'4h', value:(b.deltaPts>0?'+':'')+(b.deltaPts||0)+' toward '+(b.deltaDir==='bearish'?'short':'long'), color: b.deltaDir==='bearish'?'var(--regime-down-mid)':'var(--regime-up-mid)' },
      ]}
      miniViz={typeof MiniBiasViz!=='undefined' ? <MiniBiasViz activeIdx={bull?3:1}/> : null}
      onGo={()=>go&&go('positioning')}
    />}
    {card && <ToplineCard
      name="Flow" state={flowState} stateTone={bull?'bullish':'bearish'}
      headline={`${bull?'Buying':'Selling'} ${mult}\u00d7 normal—${flowState.toLowerCase()}.`}
      sub={`Net ${f.currentNotional||'—'} vs ${f.baselineNotional||'—'} normal · ${f.dominantCohort||'mixed'}-led.`}
      meta={[
        { label:'Net flow', value: f.currentNotional || '—', color: bull?'var(--regime-up-mid)':'var(--regime-down-mid)' },
        { label:'Intensity', value: mult+'\u00d7 normal' },
      ]}
      miniViz={typeof SigSpark!=='undefined' ? <SigSpark points={[10,12,14,18,22,28,36,48]} color={bull?'var(--regime-up-mid)':'var(--regime-down-mid)'} w={64} h={32}/> : null}
      onGo={()=>go&&go('flow')}
    />}
    {card && isPerp && <ToplineCard
      name="Risk" state={st.state?cap(st.state):'Elevated'} stateTone="bearish"
      headline={`${st.side||'Long'}-side stress ${st.state||'elevated'}${fE.distance?(' — cluster −'+fE.distance+' below'):''}.`}
      sub={`${st.vulnerable||''} vulnerable · ${st.wallets||''} wallets near a forced exit.`}
      meta={[
        { label:'Liq cluster', value: fE.center ? ('$'+Math.round(fE.center).toLocaleString()) : '—', color:'var(--regime-down-mid)' },
        { label:'Vulnerable', value: st.vulnerable || '—', color:'var(--regime-down-mid)' },
      ]}
      miniViz={typeof MiniWallsViz!=='undefined' ? <MiniWallsViz/> : null}
      onGo={()=>go&&go('risk')}
    />}
    <IdV2Changes m={m} sig={sig} bull={bull} isPerp={isPerp} go={go}/>
  </div>);
}

/* ── tab registry consumed by screens.jsx (only when v2On) ── */
function idv2Tabs(isPerp){
  return isPerp
    ? [{id:'overview',label:'Overview'},{id:'positioning',label:'Positioning'},{id:'flow',label:'Flow'},{id:'risk',label:'Risk'},{id:'traders',label:'Traders'}]
    : [{id:'overview',label:'Overview'},{id:'positioning',label:'Positioning'},{id:'flow',label:'Flow'},{id:'traders',label:'Traders'}];
}
function IdV2Tab(tab, ctx){
  const { m, sf, bull, acctPro, isPerp, sig, go } = ctx;
  if (tab==='overview')    return <IdV2Overview m={m} sig={sig} bull={bull} isPerp={isPerp} go={go}/>;
  if (tab==='positioning') return (typeof InstrumentPositioningTab!=='undefined' ? <InstrumentPositioningTab sig={sig}/> : null);
  if (tab==='flow')        return (typeof InstrumentFlowTab2!=='undefined' ? <InstrumentFlowTab2 sig={sig}/> : null);
  if (tab==='risk')        return (typeof InstrumentRiskTab2!=='undefined' ? <InstrumentRiskTab2 sig={sig}/> : null);
  if (tab==='traders')     return (typeof InstrumentTradersTab2!=='undefined' ? <InstrumentTradersTab2 sig={sig} m={m} isPerp={isPerp}/> : <IdV2Traders m={m} bull={bull} acctPro={acctPro} isPerp={isPerp}/>);
  return null;
}

Object.assign(window, { IdV2Lucid });
if (v2On) {
  window.idv2Tabs = idv2Tabs;
  window.IdV2Tab = IdV2Tab;
}
