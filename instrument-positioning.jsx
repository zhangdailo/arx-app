// app/instrument-positioning.jsx — Positioning tab (v2 — DS-normalized: shared SevBadge,
// caption floor 11px [10px axis-tick exception], radii/spacing on grid; dead ConvictionBadge/
// PosScoreTip removed).
// Grammar: ControlsStrip → P1 Net lean → P2 Lean trend → P3 By cohort → P4 Drivers.
// Cohorts = the four on-chain cohorts (capital × performance × style). Window drives trend span + change.

const { useState: pUS } = React;

/* ── parse / format ── */
function posUsd(s){ if(typeof s==='number') return s; if(!s) return 0; const x=String(s).replace(/[$,+\u2212-]/g,'').match(/([\d.]+)\s*([BMK]?)/i); if(!x) return 0; return parseFloat(x[1])*({B:1e9,M:1e6,K:1e3,'':1}[(x[2]||'').toUpperCase()]||1); }
function posCount(s){ if(typeof s==='number') return s; if(!s) return 0; const x=String(s).replace(/[,]/g,'').match(/([\d.]+)\s*([KM]?)/i); if(!x) return 0; return parseFloat(x[1])*({M:1e6,K:1e3,'':1}[(x[2]||'').toUpperCase()]||1); }
function posFUsd(n){ const a=Math.abs(n); const s=a>=1e9?'$'+(a/1e9).toFixed(1)+'B':a>=1e6?'$'+Math.round(a/1e6)+'M':a>=1e3?'$'+Math.round(a/1e3)+'K':'$'+Math.round(a); return s; }
function posFCount(n){ const a=Math.abs(n); return a>=1e6?(a/1e6).toFixed(1)+'M':a>=1e3?(a/1e3).toFixed(a>=1e4?0:1)+'K':String(Math.round(a)); }
function posHash(s){ let h=2166136261; s=String(s); for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return (h>>>0); }

const POS_WINS = ['1h','4h','1D','1W'];
const POS_WIN_DELTA = { '1h':0.35, '4h':1, '1D':1.9, '1W':3.1 };
const POS_WIN_TICKS = {
  '1h':['60m','45m','30m','15m','now'],
  '4h':['4h','3h','2h','1h','now'],
  '1D':['24h','18h','12h','6h','now'],
  '1W':['7d','5d','3d','1d','now'],
};
const POS_SHORT = { 'Smart Money':'Smart', 'Whale Moves':'Whales', 'Rising Money':'Rising', 'Full Rekt Crowd':'Crowd' };
const POS_LEV = { 'Smart Money':5.1, 'Whale Moves':8.4, 'Rising Money':4.2, 'Full Rekt Crowd':6.8 };
// each cohort = a blend of the 3 taxonomy labels (08-2-1 §9), not a performance label alone
const POS_CLUSTER_DEF = {
  'Smart Money':     'Proven 90d record · active style',
  'Whale Moves':     '≥$1M capital · not rekt · active',
  'Rising Money':    'Strong 30d · sub-whale · active',
  'Full Rekt Crowd': 'Lost ≥10% · active style',
};

/* deterministic lean series (0..100) ending at endScore, swing scaled to the window */
function posSeries(seed, endScore, win){
  const amp = { '1h':5, '4h':8, '1D':12, '1W':16 }[win] || 10;
  const h = posHash(seed + '|' + win);
  const drift = (((h % 200) / 100) - 1) * amp;          // -amp..amp
  const start = Math.max(8, Math.min(92, endScore - drift));
  const n = 5, pts = [];
  for(let i=0;i<n;i++){
    const t = i/(n-1);
    const base = start + (endScore - start) * t;
    const wig = Math.sin((h % 17) + i*1.7) * amp * 0.32 * (1 - t*0.5);
    pts.push(Math.max(5, Math.min(95, i===n-1 ? endScore : base + wig)));
  }
  return pts;
}

/* ── cohort builders ── */
function posNorm(name, c, f){
  const longUsd = posUsd(c.longNotional), shortUsd = posUsd(c.shortNotional);
  return {
    name, short: POS_SHORT[name] || name,
    accent: c.accent || 'var(--color-violet-400)',
    longUsd, shortUsd,
    longCount: posCount(c.longCount), shortCount: posCount(c.shortCount),
    flowMult: f && f.multiple ? parseFloat(f.multiple) : 1,
    netSide: (f && f.netSide) || 'neutral',
    lev: POS_LEV[name] || 5,
  };
}
function posClusterActors(sig){
  const bc = (sig && sig.bias && sig.bias.cohorts) || [];
  const fb = (sig && sig.flow && sig.flow.cohortBreakdown) || [];
  const fby = {}; fb.forEach(f=>{ fby[f.name]=f; });
  return ['Smart Money','Whale Moves','Rising Money','Full Rekt Crowd']
    .filter(nm => bc.some(x=>x.name===nm))
    .map(nm => { const c = bc.find(x=>x.name===nm) || {}; return posNorm(nm, c, fby[nm]); });
}
function posTotals(sig){
  const all = ((sig && sig.bias && sig.bias.cohorts) || []).map(c=>posNorm(c.name, c, null));
  return all.reduce((a,c)=>({ longUsd:a.longUsd+c.longUsd, shortUsd:a.shortUsd+c.shortUsd, longCount:a.longCount+c.longCount, shortCount:a.shortCount+c.shortCount }), { longUsd:0, shortUsd:0, longCount:0, shortCount:0 });
}
const posPct = (c)=> c.longUsd/((c.longUsd + c.shortUsd) || 1);
const posScore = (c)=> Math.round(posPct(c)*100);

/* ── conviction = lean magnitude × add-rate vs normal (used by Overview line) ── */
function posConviction(c){
  const pct = posPct(c), strong = Math.abs(pct-0.5) >= 0.12, fast = c.flowMult >= 1.5;
  const adding = (pct>0.5 && c.netSide==='bullish') || (pct<0.5 && c.netSide==='bearish');
  if (strong && fast && adding) return 'High';
  if (strong && adding) return 'Building';
  if (strong && !adding) return 'Fading';
  return 'Low';
}
function posConvictionLine(sig){
  const sm = posClusterActors(sig)[0]; if(!sm) return null;
  const pct = posPct(sm), side = pct>=0.5?'long':'short', lvl = posConviction(sm);
  const act = sm.flowMult>=1.5 ? `adding ${sm.flowMult.toFixed(1)}× normal` : 'holding';
  return `Smart Money: ${lvl.toLowerCase()}-conviction ${side} — ${Math.round(Math.max(pct,1-pct)*100)}% one-sided, ${act}.`;
}

/* ── long/short split bar ── */
function LongShortBar({ pctLong, h=12, showLabels=true }){
  const L = Math.round(pctLong*100), S = 100-L;
  return (<div>
    {showLabels && <div style={{display:'flex', justifyContent:'space-between', font:'700 11px var(--font-mono)', marginBottom:6}}>
      <span style={{color:'var(--regime-up-mid)'}}>{L}% long</span>
      <span style={{color:'var(--regime-down-mid)'}}>{S}% short</span>
    </div>}
    <div style={{display:'flex', height:h, borderRadius:999, overflow:'hidden', gap:2, background:'var(--surface-base)'}}>
      <div style={{width:Math.max(2,L)+'%', background:'var(--regime-up-mid)'}}/>
      <div style={{width:Math.max(2,S)+'%', background:'var(--regime-down-mid)'}}/>
    </div>
  </div>);
}

/* ── P1 · Net lean ── */
function PosNetLean({ sig, win }){
  const b = (sig && sig.bias) || {};
  const t = posTotals(sig);
  const pctN = t.longUsd/((t.longUsd + t.shortUsd) || 1);
  const dir = (b.deltaDir==='bearish') ? 'short' : 'long';
  const dCol = dir==='short' ? 'var(--regime-down-mid)' : 'var(--regime-up-mid)';
  const series = posSeries('overall', Math.round(pctN*100), win);
  return (
    <Surface>
      <CardHeader title="Net lean" sub="Long vs short across all cohorts · by open interest"/>
      <div style={{font:'700 21px var(--font-brand)', color:'var(--text-primary)', letterSpacing:'-.02em', lineHeight:1.15, marginBottom:12}}>{b.bucket || 'Indecisive'}</div>
      <LongShortBar pctLong={pctN}/>
      <div style={{marginTop:16, padding:12, borderRadius:12, background:'color-mix(in oklab, var(--color-violet-500) 5%, transparent)', border:'.5px solid var(--border-default)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
        <div>
          <div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.06em', textTransform:'uppercase'}}>Long share vs {win} ago</div>
          <div className="num" style={{font:'700 15px var(--font-mono)', color: Math.round(pctN*100)>=Math.round(series[0])?'var(--regime-up-mid)':'var(--regime-down-mid)', marginTop:4}}>{Math.round(series[0])}% → {Math.round(pctN*100)}%</div>
        </div>
        {typeof SigSpark!=='undefined' && <SigSpark points={series} color={dCol} w={72} h={34}/>}
      </div>
      <div style={{marginTop:12, textAlign:'right'}}><FreshnessLine text="Updated 4m ago"/></div>
    </Surface>
  );
}

/* ── P2 · Lean trend (responsive) ── */
function PosLeanTrend({ sig, win }){
  const cohorts = posClusterActors(sig);
  const t = posTotals(sig);
  const ovScore = Math.round(t.longUsd/((t.longUsd+t.shortUsd)||1)*100);
  const lines = [{ name:'Overall', accent:'var(--color-violet-400)', score:ovScore, bold:true }]
    .concat(cohorts.map(c=>({ name:c.name, short:c.short, accent:c.accent, score:posScore(c) })));
  const def = {}; lines.forEach((l,i)=>{ def[l.name] = l.bold || i===1 || i===lines.length-1; });
  const [vis,setVis] = pUS(def);
  const VW=320, VH=132, pad=8;
  const toX = (i,n)=> pad + (VW-pad*2)*(i/(n-1));
  const toY = (v)=> pad + (VH-pad*2)*(1 - v/100);
  const ticks = POS_WIN_TICKS[win] || POS_WIN_TICKS['1W'];
  const qual = cohorts[0], crowd = cohorts[cohorts.length-1];
  const gap = posScore(qual) - posScore(crowd);
  const sym = (sig && sig._meta && sig._meta.sym) || '';
  return (
    <Surface style={{padding:16}}>
      <div style={{padding:'0 2px 12px'}}>
        <CardHeader title="Lean trend" sub={`Overall vs cohorts · last ${win}`}
          control={<SevBadge tone={gap>=0?'up':'down'} size="sm">{qual.short} {gap>=0?'+':'−'}{Math.abs(gap)} vs {crowd.short}</SevBadge>}/>
      </div>
      <div style={{display:'flex'}}>
        <div style={{width:52, flexShrink:0, height:VH, display:'flex', flexDirection:'column', justifyContent:'space-between', paddingRight:6}}>
          {['Very long','Long','Even','Short','Very short'].map(l=>(
            <div key={l} style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', textAlign:'right', lineHeight:1}}>{l}</div>
          ))}
        </div>
        <div style={{flex:1, minWidth:0}}>
          <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" height={VH} preserveAspectRatio="none" style={{display:'block', overflow:'visible'}}>
            {[0,25,50,75,100].map(v=>(
              <line key={v} x1={pad} x2={VW-pad} y1={toY(v)} y2={toY(v)} stroke={v===50?'rgba(124,91,255,.18)':'rgba(124,91,255,.07)'} strokeWidth="1" strokeDasharray={v===50?'':'2 3'} vectorEffect="non-scaling-stroke"/>
            ))}
            {lines.map(L=> vis[L.name] && (
              <path key={L.name} vectorEffect="non-scaling-stroke"
                d={posSeries(L.name+sym, L.score, win).map((v,i,a)=> (i?'L':'M')+toX(i,a.length).toFixed(1)+','+toY(v).toFixed(1)).join(' ')}
                fill="none" stroke={L.accent} strokeWidth={L.bold?2.4:1.6} strokeOpacity={L.bold?1:0.9} strokeLinecap="round" strokeLinejoin="round"/>
            ))}
          </svg>
          <div style={{display:'flex', justifyContent:'space-between', padding:'5px 2px 0', font:'400 10px var(--font-mono)', color:'var(--text-tertiary)'}}>
            {ticks.map(d=> <span key={d}>{d}</span>)}
          </div>
        </div>
      </div>
      <div style={{display:'flex', flexWrap:'wrap', gap:8, marginTop:12, padding:'0 2px'}}>
        {lines.map(L=>(
          <button key={L.name} onClick={()=>setVis(v=>({...v,[L.name]:!v[L.name]}))} className="arx-press" style={{display:'inline-flex', gap:6, alignItems:'center', padding:'4px 10px', borderRadius:999, border:'.5px solid var(--border-default)', background: vis[L.name]?'color-mix(in oklab, var(--color-violet-500) 6%, transparent)':'transparent', opacity: vis[L.name]?1:0.42, font:'500 11px var(--font-body)', color:'var(--text-secondary)', cursor:'pointer'}}>
            <span style={{width:9, height:9, borderRadius:3, border:`2px solid ${L.accent}`, background: vis[L.name]?L.accent:'transparent', boxSizing:'border-box'}}/>
            {L.short || L.name}
          </button>
        ))}
      </div>
    </Surface>
  );
}

/* ── P3 · By cohort ── */
function PosCohortGrid({ sig }){
  const cohorts = posClusterActors(sig);
  const t = posTotals(sig);
  const ovScore = Math.round(t.longUsd/((t.longUsd+t.shortUsd)||1)*100);
  const Col = ({ k, ink, children, sub }) => (
    <div style={{flex:1, minWidth:0}}>
      <div style={{font:'600 11px var(--font-body)', color: ink||'var(--text-tertiary)', letterSpacing:'.04em', textTransform:'uppercase'}}>{k}</div>
      <div className="num" style={{font:'700 13px var(--font-mono)', color:'var(--text-primary)', marginTop:4}}>{children}</div>
      {sub && <div className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2}}>{sub}</div>}
    </div>
  );
  return (
    <div style={{display:'flex', flexDirection:'column', gap:12}}>
      {cohorts.map(c=>{
        const pct = posPct(c), gap = posScore(c) - ovScore;
        return (
          <Surface key={c.name} style={{padding:16}}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
              <span style={{width:8, height:8, borderRadius:2, background:c.accent, flexShrink:0}}/>
              <span style={{font:'700 14px var(--font-brand)', color:'var(--text-primary)', letterSpacing:'-.01em'}}>{c.name}</span>
              <span className="num" style={{font:'600 11px var(--font-mono)', color: gap>=0?'var(--regime-up-mid)':'var(--regime-down-mid)', marginLeft:2}}>{gap>=0?'+':'−'}{Math.abs(gap)} vs field</span>
            </div>
            {POS_CLUSTER_DEF[c.name] && <div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', margin:'-2px 0 10px', letterSpacing:'-.005em'}}>{POS_CLUSTER_DEF[c.name]}</div>}
            <LongShortBar pctLong={pct} h={9} showLabels={false}/>
            <div style={{display:'flex', gap:12, marginTop:12}}>
              <Col k="Long" ink="var(--regime-up-mid)" sub={posFCount(c.longCount)+' wallets'}>{posFUsd(c.longUsd)}</Col>
              <div style={{width:'.5px', background:'var(--border-default)'}}/>
              <Col k="Short" ink="var(--regime-down-mid)" sub={posFCount(c.shortCount)+' wallets'}>{posFUsd(c.shortUsd)}</Col>
              <div style={{width:'.5px', background:'var(--border-default)'}}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{font:'600 11px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.04em', textTransform:'uppercase'}}>Avg lev</div>
                <div className="num" style={{font:'700 13px var(--font-mono)', color: c.lev>10?'var(--regime-trans-mid)':'var(--text-primary)', marginTop:4}}>{c.lev.toFixed(1)}×</div>
                <div className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2}}>median</div>
              </div>
            </div>
          </Surface>
        );
      })}
    </div>
  );
}

/* ── Positioning tab ── */
function InstrumentPositioningTab({ sig }){
  const [win,setWin] = pUS('1D');
  if(!sig || !sig.bias) return (<div style={{padding:'24px 20px', font:'500 12px var(--font-body)', color:'var(--text-tertiary)'}}>No positioning read available for this instrument.</div>);
  const b = sig.bias;
  return (
    <div>
      <div style={{display:'flex', alignItems:'center', gap:12, padding:'12px 16px 2px'}}>
        <span style={{font:'600 11px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.04em'}}>Cohorts</span>
        <div style={{marginLeft:'auto'}}><CompactSelector options={POS_WINS} value={win} onChange={setWin}/></div>
      </div>
      <ModuleSpacer h={8}/>
      <PosNetLean sig={sig} win={win}/>
      <ModuleSpacer/>
      <PosLeanTrend sig={sig} win={win}/>
      <ModuleSpacer/>
      <IvGroupHead title="By cohort" sub="Four on-chain cohorts — each blends capital size, performance & trading style."/>
      <PosCohortGrid sig={sig}/>
      <ModuleSpacer/>
      <IvGroupHead title="What's driving it" sub="What moved the lean over the window."/>
      {typeof BiasDrivers!=='undefined' && <BiasDrivers direct={b.drivers.direct} overlays={b.drivers.overlays} summary={b.drivers.summary}/>}
      <DisclaimerFooter text="Positioning describes balance of open positions, not a forecast. Stronger lean is not safer. Cohorts blend on-chain capital size, performance, and trading style."/>
    </div>
  );
}

Object.assign(window, {
  InstrumentPositioningTab, LongShortBar,
  posConviction, posConvictionLine, posClusterActors,
});
