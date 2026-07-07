// app/instrument-flow.jsx — Flow tab (v2 — DS-normalized: shared SevBadge, caption floor 11px,
// radii/spacing on grid). Same grammar as Positioning: window selector → F1 Net flow (now) →
// F2 Momentum (accel/decel across 15m·1h·4h·1D) → F3 By cohort → F4 Drivers. No SIG codes.
// Cohorts = the four on-chain cohorts. State copy grounded in 08-2-5 flowS02 ladder.

const { useState: flUS } = React;

const FL_WINS = ['15m','1h','4h','1D'];
const flDataKey = (w)=> w==='1D'?'24h':w;   // selector value → data-model window key
const flLabel = (w)=> w==='24h'?'1D':w;      // data-model key → display label
const FL_ACCENT = { 'Smart Money':'var(--color-violet-500)', 'Whale Moves':'var(--color-peach-500)', 'Rising Money':'var(--regime-range-mid)', 'Full Rekt Crowd':'var(--regime-down-mid)' };
const flTone = (t)=> ({ flat:'neutral', warn:'watch' }[t] || t);   // flState tone → SevBadge tone

function flNum(s){ if(typeof s==='number') return s; if(!s) return 0; const x=String(s).replace(/[$,]/g,'').match(/(-|−|\+)?\s*([\d.]+)\s*([BMK]?)/i); if(!x) return 0; const sign=(x[1]==='-'||x[1]==='−')?-1:1; return sign*parseFloat(x[2])*({B:1e9,M:1e6,K:1e3,'':1}[(x[3]||'').toUpperCase()]||1); }
function flMul(s){ return parseFloat(String(s==null?'0':s))||0; }
function flFUsd(n){ const a=Math.abs(n); const s=a>=1e9?'$'+(a/1e9).toFixed(1)+'B':a>=1e6?'$'+Math.round(a/1e6)+'M':a>=1e3?'$'+Math.round(a/1e3)+'K':'$'+Math.round(a); return (n<0?'−':'+')+s; }

/* state ladder → plain label + tone (grounded in flowS02 §1.2) */
function flState(state){
  const m = { rising:['Rising','up'], above_normal:['Above normal','up'], above:['Above normal','up'],
    near_normal:['Near normal','flat'], near:['Near normal','flat'], below_normal:['Below normal','down'],
    below:['Below normal','down'], decreasing:['Fading','down'], flipped:['Flipped','warn'] };
  return m[state] || ['Above normal','up'];
}

/* ── intensity bar with a 1× normal marker ── */
function FlIntensityBar({ mult, col }){
  const cap = 4, pct = Math.min(100,(mult/cap)*100), onePct = (1/cap)*100;
  return (<div style={{position:'relative', height:10, borderRadius:999, background:'var(--surface-base)', overflow:'hidden'}}>
    <div style={{position:'absolute', left:0, top:0, bottom:0, width:Math.max(2,pct)+'%', background:col, opacity:.85}}/>
    <div style={{position:'absolute', left:onePct+'%', top:-2, bottom:-2, width:1.5, background:'var(--text-tertiary)'}}/>
  </div>);
}

/* ── F1 · Net flow (selected window) ── */
function FlowNow({ flow, win, accel }){
  const wd = (flow.byWindow||[]).find(r=>r.window===flDataKey(win)) || flow.current || {};
  const net = flNum(wd.notional), bull = net>=0, col = bull?'var(--regime-up-mid)':'var(--regime-down-mid)';
  const mult = flMul(wd.multiple), [lbl,tone] = flState(wd.state);
  const baseline = flFUsd(net/(mult||1));
  return (
    <Surface>
      <CardHeader title="Net flow" sub="Buying vs selling across all cohorts · vs its own baseline"/>
      <div style={{display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap'}}>
        <span className="num" style={{font:'700 26px var(--font-mono)', color:col, letterSpacing:'-.02em'}}>{wd.notional||'—'}</span>
        <span style={{font:'600 12px var(--font-body)', color:'var(--text-secondary)'}}>net {bull?'buying':'selling'} · this {win}</span>
      </div>
      <div style={{marginTop:16}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
          <span style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.06em', textTransform:'uppercase'}}>Intensity vs normal</span>
          <span className="num" style={{font:'700 13px var(--font-mono)', color:col}}>{mult.toFixed(1)}× normal</span>
        </div>
        <FlIntensityBar mult={mult} col={col}/>
        <div className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', marginTop:8}}>Normal {win} flow ≈ {baseline} · {wd.walletCount||'—'} wallets · {wd.dominant||wd.dominantCohort||'mixed'}-led</div>
      </div>
      <div style={{display:'flex', gap:8, marginTop:16}}>
        <SevBadge tone={flTone(tone)}>{lbl}</SevBadge>
        <SevBadge tone={accel>=0?'up':'down'}>{accel>=0?'Accelerating ↑':'Fading ↓'}</SevBadge>
      </div>
    </Surface>
  );
}

/* ── F2 · Momentum across timeframes (the accel/decel read) ── */
function FlowMomentum({ flow, win }){
  const rows = (flow.byWindow||[]).slice();
  const maxMul = Math.max(2, ...rows.map(r=>flMul(r.multiple)));
  const m15 = flMul((rows.find(r=>r.window==='15m')||{}).multiple);
  const m4 = flMul((rows.find(r=>r.window==='4h')||{}).multiple);
  const accel = m15 - m4;
  return (
    <Surface style={{padding:16}}>
      <div style={{padding:'0 2px 12px'}}>
        <CardHeader title="Momentum" sub="Flow vs normal across timeframes"
          control={<SevBadge tone={accel>=0?'up':'down'}>{accel>=0?'Accelerating ↑':'Cooling ↓'}</SevBadge>}/>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        {rows.map(r=>{
          const mult = flMul(r.multiple), bull = flNum(r.notional)>=0, col = bull?'var(--regime-up-mid)':'var(--regime-down-mid)';
          const active = r.window===flDataKey(win);
          return (
            <div key={r.window} style={{display:'flex', alignItems:'center', gap:8}}>
              <span className="num" style={{width:32, font:`${active?700:600} 11px var(--font-mono)`, color: active?'var(--text-primary)':'var(--text-tertiary)'}}>{flLabel(r.window)}</span>
              <div style={{flex:1, height:8, borderRadius:999, background:'var(--surface-base)', overflow:'hidden'}}>
                <div style={{width:Math.max(3,Math.min(100,(mult/maxMul)*100))+'%', height:'100%', background:col, opacity: active?1:0.55}}/>
              </div>
              <span className="num" style={{width:38, textAlign:'right', font:'700 11px var(--font-mono)', color:col}}>{mult.toFixed(1)}×</span>
              <span className="num" style={{width:74, textAlign:'right', font:'500 11px var(--font-mono)', color:'var(--text-tertiary)'}}>{r.notional}</span>
            </div>
          );
        })}
      </div>
      <div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:12, lineHeight:1.45}}>{accel>=0?'Flow is hotter on shorter timeframes — building right now.':'Flow is cooler on shorter timeframes — the burst is older than it looks.'}</div>
    </Surface>
  );
}

/* ── F3 · By cohort ── */
function FlowCohortGrid({ flow }){
  const rows = flow.cohortBreakdown || [];
  const Col = ({ k, children }) => (
    <div style={{flex:1, minWidth:0}}>
      <div style={{font:'600 11px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.04em', textTransform:'uppercase'}}>{k}</div>
      <div style={{marginTop:4}}>{children}</div>
    </div>
  );
  return (
    <div style={{display:'flex', flexDirection:'column', gap:12}}>
      {rows.map(c=>{
        const net = flNum(c.flow), bull = c.netSide ? c.netSide==='bullish' : net>=0, col = bull?'var(--regime-up-mid)':'var(--regime-down-mid)';
        const mult = flMul(c.multiple);
        return (
          <Surface key={c.name} style={{padding:16}}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <span style={{width:8, height:8, borderRadius:2, background:c.accent||FL_ACCENT[c.name]||'var(--color-violet-400)', flexShrink:0}}/>
              <span style={{font:'700 14px var(--font-brand)', color:'var(--text-primary)', letterSpacing:'-.01em'}}>{c.name}</span>
              <span style={{marginLeft:'auto'}}><SevBadge tone={bull?'up':'down'} size="sm">{bull?'Buying':'Selling'}</SevBadge></span>
            </div>
            <div style={{display:'flex', gap:12, marginTop:12}}>
              <Col k="Net flow">
                <div className="num" style={{font:'700 13px var(--font-mono)', color:col}}>{c.flow}</div>
                <div className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2}}>vs {c.normal} normal</div>
              </Col>
              <div style={{width:'.5px', background:'var(--border-default)'}}/>
              <Col k="Intensity">
                <div className="num" style={{font:'700 13px var(--font-mono)', color: mult>=1.5?col:'var(--text-primary)'}}>{mult.toFixed(1)}×</div>
                <div className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2}}>normal</div>
              </Col>
              <div style={{width:'.5px', background:'var(--border-default)'}}/>
              <Col k="Concentration">
                <div className="num" style={{font:'700 13px var(--font-mono)', color: flMul(c.topShare)>=35?'var(--regime-trans-mid)':'var(--text-primary)'}}>{c.topShare}</div>
                <div className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2}}>{c.wallets} wallets</div>
              </Col>
            </div>
          </Surface>
        );
      })}
    </div>
  );
}

/* ── F4 · Drivers ── */
function FlowDrivers({ drivers }){
  return (
    <div style={{display:'flex', flexDirection:'column', gap:8}}>
      {(drivers||[]).map((d,i)=>(
        <Surface key={d.name} style={{padding:'12px 16px'}}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <span className="num" style={{width:14, font:'700 11px var(--font-mono)', color:'var(--text-tertiary)'}}>{i+1}</span>
            <span style={{font:'700 13px var(--font-brand)', color:'var(--text-primary)'}}>{d.name}</span>
            <span className="num" style={{marginLeft:'auto', font:'700 13px var(--font-mono)', color: flNum(d.notional)>=0?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{d.notional}</span>
          </div>
          <div className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', marginTop:6}}>{d.multiple}× normal · {d.share} of flow · {d.wallets} wallets</div>
          {d.note && <div style={{font:'500 11px var(--font-body)', color:'var(--text-secondary)', marginTop:6, lineHeight:1.4}}>{d.note}</div>}
        </Surface>
      ))}
    </div>
  );
}

/* ── Flow tab ── */
function InstrumentFlowTab2({ sig }){
  const [win,setWin] = flUS('1h');
  const flow = sig && sig.flow;
  if(!flow) return (<div style={{padding:'24px 20px', font:'500 12px var(--font-body)', color:'var(--text-tertiary)'}}>No flow read available for this instrument.</div>);
  const bw = flow.byWindow || [];
  const accel = flMul((bw.find(r=>r.window==='15m')||{}).multiple) - flMul((bw.find(r=>r.window==='4h')||{}).multiple);
  return (
    <div>
      <div style={{display:'flex', alignItems:'center', gap:12, padding:'12px 16px 2px'}}>
        <span style={{font:'600 11px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.04em'}}>Cohorts</span>
        <div style={{marginLeft:'auto'}}><CompactSelector options={FL_WINS} value={win} onChange={setWin}/></div>
      </div>
      <ModuleSpacer h={8}/>
      <FlowNow flow={flow} win={win} accel={accel}/>
      <ModuleSpacer/>
      <FlowMomentum flow={flow} win={win}/>
      <ModuleSpacer/>
      <IvGroupHead title="By cohort" sub="Each cohort's flow vs its own normal — who's pressing buy or sell."/>
      <FlowCohortGrid flow={flow}/>
      <ModuleSpacer/>
      <IvGroupHead title="What's driving it" sub="Top contributors to this window's flow."/>
      <FlowDrivers drivers={flow.topDrivers}/>
      <DisclaimerFooter text="Flow shows what tracked wallets did, not what price will do next. Each multiple is vs that window's own baseline; whale-led flow can sit in one wallet."/>
    </div>
  );
}

Object.assign(window, { InstrumentFlowTab2 });
