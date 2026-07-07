// app/instrument-risk.jsx — Risk tab. Same grammar as Positioning/Flow. (v2 — DS-normalized:
// shared SevBadge/InfoTip, caption floor 11px, radii on 8/12/16 grid, severity via color-mix
// from one regime mid — no second red, no raw rgba.)
// Risk = enumeration of risk TYPES → price-centered liquidation map → cohort breakdown → figures.
// Window 1h·4h·1D·1W (default 4h). Definitions read from ARX_LOGIC.stressS04.definitions.

const { useState: rkUS } = React;

const RK_WINS = ['1h','4h','1D','1W'];
const RK_LEV = { 'Smart Money':5.1, 'Whale Moves':8.4, 'Rising Money':4.2, 'Full Rekt Crowd':6.8 };
const RK_ACC = { 'Smart Money':'var(--color-violet-500)', 'Whale Moves':'var(--color-peach-500)', 'Rising Money':'var(--regime-range-mid)', 'Full Rekt Crowd':'var(--regime-down-mid)' };
const RK_SHORT = { 'Smart Money':'Smart', 'Whale Moves':'Whale', 'Rising Money':'Rising', 'Full Rekt Crowd':'Rekt' };
const RK_RANK = { critical:3, elevated:2, watch:1, normal:0 };
const RK_SEVBG = { normal:'var(--surface-base)', watch:'color-mix(in oklab, var(--regime-trans-mid) 16%, transparent)', elevated:'color-mix(in oklab, var(--regime-down-mid) 16%, transparent)', critical:'color-mix(in oklab, var(--regime-crisis-mid) 22%, transparent)' };
const rkD = (k)=> (((window.ARX_LOGIC||{}).stressS04||{}).definitions||{})[k];

function rkUsd(s){ if(typeof s==='number') return s; if(!s) return 0; const x=String(s).replace(/[$,]/g,'').match(/([\d.]+)\s*([BMK]?)/i); if(!x) return 0; return parseFloat(x[1])*({B:1e9,M:1e6,K:1e3,'':1}[(x[2]||'').toUpperCase()]||1); }
function rkMoney(n){ const a=Math.abs(n); return a>=1e9?'$'+(a/1e9).toFixed(1)+'B':a>=1e6?'$'+Math.round(a/1e6)+'M':a>=1e3?'$'+Math.round(a/1e3)+'K':'$'+Math.round(a); }
function rkHash(s){ let x=2166136261; s=String(s); for(let i=0;i<s.length;i++){ x^=s.charCodeAt(i); x=Math.imul(x,16777619); } return (x>>>0)/4294967295; }

/* drift chip — how the metric moved over the window */
function RkDrift({ dir='up', win }){
  const flat = dir==='flat', up = dir==='up';
  const ink = flat?'var(--text-tertiary)':up?'var(--regime-down-mid)':'var(--regime-up-mid)';
  return (<span style={{display:'inline-flex', alignItems:'center', gap:3, font:'600 11px var(--font-mono)', color:ink, whiteSpace:'nowrap'}}>{flat?'→':up?'↑':'↓'} {win}</span>);
}

/* ── R1 · Risk read — overall state + the enumerated risk types ── */
function RiskRead({ sig, win }){
  const st = (sig.stress)||{}, read = st.read||{}, cards = st.driverCards||[];
  const cohorts = (sig.bias && sig.bias.cohorts) || [];
  let wsum=0, lsum=0; cohorts.forEach(c=>{ const n=rkUsd(c.longNotional)+rkUsd(c.shortNotional); wsum+=n; lsum+=n*(RK_LEV[c.name]||5); });
  const avgLev = wsum? lsum/wsum : 6.2, norm = 5.1;
  const highPct = Math.min(72, Math.max(8, Math.round((avgLev-norm)*22 + 18)));
  const levSev = avgLev>=10?'critical':avgLev>=7.5?'elevated':avgLev>=6?'watch':'normal';
  const find = (re)=> cards.find(c=>re.test(c.primitive||'')) || {};
  const liq = find(/liquidation/i), crowd = find(/crowd/i), pain = find(/pnl|pain/i);
  let types = [
    { key:'Leverage',    d:rkD('leverage'),            sev:levSev,                read:`Avg ${avgLev.toFixed(1)}× — vs ${norm.toFixed(1)}× norm · ${highPct}% of OI over 10×`, dir: avgLev>=norm?'up':'flat' },
    { key:'Liquidation', d:rkD('liquidationDistance'), sev:liq.sev||'elevated',   read: liq.evidence || liq.headline || 'Forced-exit zone near current price.', dir:'up' },
    { key:'Crowding',    d:rkD('crowding'),            sev:crowd.sev||'elevated', read: crowd.evidence || crowd.headline || 'Positioning is one-sided.', dir:'up' },
    { key:'Unrealized loss', d:rkD('underwater'),      sev:pain.sev||'elevated',  read: pain.evidence || pain.headline || 'A large share is at an unrealized loss.', dir:'up' },
  ];
  types.sort((a,b)=>(RK_RANK[b.sev]||0)-(RK_RANK[a.sev]||0));
  return (
    <Surface>
      <CardHeader title="Risk read" sub="What could break this position — worst first"/>
      <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:8}}>
        <SevBadge sev={read.stateTone||'elevated'}/>
        <span style={{font:'700 18px var(--font-brand)', color:'var(--text-primary)', letterSpacing:'-.01em'}}>{read.side||'Long'}-side risk</span>
      </div>
      <div style={{font:'500 12px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.45}}>
        <span className="num" style={{color:'var(--text-primary)', fontWeight:700}}>{read.vulnerable||'—'}</span> of {(read.side||'long').toLowerCase()} exposure vulnerable across {read.wallets||'—'} wallets.
      </div>
      <div style={{marginTop:8}}>
        {types.map((t)=>(
          <div key={t.key} style={{display:'flex', alignItems:'flex-start', gap:12, padding:'12px 0', borderTop:'.5px solid var(--border-default)'}}>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                <span style={{font:'700 13px var(--font-brand)', color:'var(--text-primary)'}}>{t.key}</span>
                <InfoTip d={t.d}/>
                <SevBadge sev={t.sev} size="sm"/>
              </div>
              <div className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-secondary)', lineHeight:1.4}}>{t.read}</div>
            </div>
            <RkDrift dir={t.dir} win={win}/>
          </div>
        ))}
      </div>
    </Surface>
  );
}

/* liquidation walls — chart-matching: ±4.5% / 12-level price ladder, short above mark, long below.
   Each wall is a FULL notional; the four tracked cohorts are a SUBSET of it (rest = untracked "Other"). */
const RK_PCTS = [4.5,3.6,2.8,2.0,1.2,0.5,-0.5,-1.2,-2.0,-2.8,-3.6,-4.5];
const RK_LIQCO = { 'Smart Money':'var(--color-violet-500)', 'Whale Moves':'var(--color-violet-300)', 'Rising Money':'#5FA8C9', 'Full Rekt Crowd':'#9AA0B5' };
const RK_OTHER = 'color-mix(in oklab, var(--text-tertiary) 20%, transparent)';
function rkLiqWalls(sig){
  const mark = (sig.walls && sig.walls.mapMark && sig.walls.mapMark.price) || (sig.stress && sig.stress.mapMark) || 100;
  const sym = (sig._meta && sig._meta.sym) || 'x';
  const walls = RK_PCTS.map((pct,i)=>{
    const side = pct>=0?'short':'long', dist = Math.abs(pct);
    const bell = Math.exp(-Math.pow((dist-2.1)/1.9,2)), jit = 0.62 + rkHash(sym+'w'+i)*0.95;
    const usd = Math.max(9, Math.round(150*bell*jit))*1e6;          // FULL wall notional
    const tracked = 0.55 + rkHash(sym+'t'+i)*0.30;                  // tracked-cohort share (subset)
    let rekt = Math.min(74, 28+dist*6+(side==='long'?10:0)), smart = Math.max(8, 34-dist*3), whale = Math.max(4, 15-dist*1.6);
    let rising = Math.max(6, 100-rekt-smart-whale); const sum = rekt+smart+whale+rising;
    const mix = [['Smart Money',smart/sum],['Whale Moves',whale/sum],['Rising Money',rising/sum],['Full Rekt Crowd',rekt/sum]];
    const wallets = Math.max(8, Math.round(usd/1e6*(side==='long'?22:9)));
    const underwater = side==='long' ? Math.max(0, Math.round(80 - dist*9 + (rkHash(sym+'u'+i)-0.5)*8)) : 0;
    return { side, pct, dist, usd, price:mark*(1+pct/100), tracked, mix, wallets, underwater };
  });
  return { mark, above: walls.filter(w=>w.side==='short'), below: walls.filter(w=>w.side==='long'), maxUsd: Math.max.apply(null, walls.map(w=>w.usd)) };
}

/* ── R2 · Liquidation map — full price-range walls, 4 cohorts highlighted as a subset ── */
function LiqMap({ sig }){
  const { mark, above, below, maxUsd } = rkLiqWalls(sig);
  const [sel,setSel] = rkUS(null);
  const all = above.concat(below);
  const total = all.reduce((a,w)=>a+w.usd,0);
  const trackedTot = all.reduce((a,w)=>a+w.usd*w.tracked,0);
  const sumLong = below.reduce((a,w)=>a+w.usd,0), sumShort = above.reduce((a,w)=>a+w.usd,0);
  const longPct = Math.round(sumLong/(total||1)*100);
  const fmtP = (n)=> '$'+Math.round(n).toLocaleString();
  const Row = (w,key)=>{
    const long = w.side==='long', col = long?'var(--regime-down-mid)':'var(--regime-up-mid)';
    const open = sel===key, barW = Math.max(6,(w.usd/maxUsd)*100);
    return (
      <div key={key}>
        <button onClick={()=>setSel(open?null:key)} className="arx-row-press" style={{display:'flex', alignItems:'center', gap:8, width:'100%', background:'none', border:'none', padding:'7px 0', cursor:'pointer', textAlign:'left'}}>
          <span className="num" style={{width:64, font:'700 11px var(--font-mono)', color:'var(--text-primary)', flexShrink:0}}>{fmtP(w.price)}</span>
          <div style={{flex:1, minWidth:0, display:'flex', alignItems:'center'}}>
            {/* full wall (length = full notional); 4 cohorts are the highlighted subset, rest = Other */}
            <div style={{width:barW+'%', height:11, borderRadius:4, overflow:'hidden', display:'flex', minWidth:10, background:RK_OTHER}}>
              {w.mix.map(([nm,p])=> <div key={nm} style={{width:(p*w.tracked*100)+'%', background:RK_LIQCO[nm]}}/>)}
            </div>
          </div>
          <span className="num" style={{width:104, textAlign:'right', font:'600 11px var(--font-mono)', color:col, flexShrink:0}}>{(long?'−':'+')+w.dist.toFixed(1)+'% · '+rkMoney(w.usd)}</span>
        </button>
        {open && (
          <div className="arx-arrive" style={{padding:'4px 0 12px 64px'}}>
            <div style={{display:'flex', flexWrap:'wrap', gap:'4px 12px', font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', marginBottom:8}}>
              <span>{rkMoney(w.usd)} full wall</span><span>{Math.round(w.tracked*100)}% tracked</span><span>{w.wallets} wallets</span>
              {long && <span style={{color: w.underwater>=50?'var(--regime-down-mid)':'var(--text-tertiary)'}}>{w.underwater}% underwater</span>}
            </div>
            {w.mix.slice().sort((a,b)=>b[1]-a[1]).map(([nm,p])=>(
              <div key={nm} style={{display:'flex', alignItems:'center', gap:8, padding:'2px 0'}}>
                <span style={{width:8, height:8, borderRadius:2, background:RK_LIQCO[nm], flexShrink:0}}/>
                <span style={{flex:1, font:'500 11px var(--font-body)', color:'var(--text-secondary)'}}>{nm}</span>
                <span className="num" style={{font:'600 11px var(--font-mono)', color:'var(--text-primary)'}}>{rkMoney(w.usd*p*w.tracked)}</span>
              </div>
            ))}
            <div style={{display:'flex', alignItems:'center', gap:8, padding:'2px 0'}}>
              <span style={{width:8, height:8, borderRadius:2, background:RK_OTHER, flexShrink:0}}/>
              <span style={{flex:1, font:'500 11px var(--font-body)', color:'var(--text-tertiary)'}}>Other · untracked</span>
              <span className="num" style={{font:'600 11px var(--font-mono)', color:'var(--text-tertiary)'}}>{rkMoney(w.usd*(1-w.tracked))}</span>
            </div>
          </div>
        )}
      </div>
    );
  };
  return (
    <Surface style={{padding:16}}>
      <div style={{padding:'0 2px 8px'}}><CardHeader title="Liquidation map" sub="Full liquidation walls by price (±4.5% of mark) — the four cohorts are the coloured subset of each wall. Tap a level."/></div>
      <div style={{display:'flex', flexWrap:'wrap', gap:'4px 12px', padding:'0 2px 12px'}}>
        {['Smart Money','Whale Moves','Rising Money','Full Rekt Crowd'].map(nm=>(
          <span key={nm} style={{display:'inline-flex', alignItems:'center', gap:5, font:'500 11px var(--font-body)', color:'var(--text-tertiary)'}}><span style={{width:8,height:8,borderRadius:2,background:RK_LIQCO[nm]}}/>{RK_SHORT[nm]}</span>
        ))}
        <span style={{display:'inline-flex', alignItems:'center', gap:5, font:'500 11px var(--font-body)', color:'var(--text-tertiary)'}}><span style={{width:8,height:8,borderRadius:2,background:RK_OTHER}}/>Other</span>
      </div>
      <div style={{padding:'2px 2px 12px', borderBottom:'.5px solid var(--border-default)', marginBottom:8}}>
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:8}}>
          <span style={{font:'600 11px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.06em', textTransform:'uppercase'}}>Total at risk · ±4.5% of mark</span>
          <span className="num" style={{font:'700 15px var(--font-mono)', color:'var(--text-primary)'}}>{rkMoney(total)}</span>
        </div>
        <div style={{display:'flex', height:9, borderRadius:999, overflow:'hidden', gap:2, background:'var(--surface-base)'}}>
          <div style={{width:Math.max(3,longPct)+'%', background:'var(--regime-down-mid)'}}/>
          <div style={{width:Math.max(3,100-longPct)+'%', background:'var(--regime-up-mid)'}}/>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', marginTop:6, font:'500 11px var(--font-mono)'}}>
          <span style={{color:'var(--regime-down-mid)'}}>{rkMoney(sumLong)} long liqs</span>
          <span style={{color:'var(--regime-up-mid)'}}>{rkMoney(sumShort)} short liqs</span>
        </div>
        <div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:8, lineHeight:1.4}}>Tracked cohorts account for {rkMoney(trackedTot)} ({Math.round(trackedTot/(total||1)*100)}%) of it; the rest sits in untracked wallets.</div>
      </div>
      {above.map((w,i)=>Row(w,'a'+i))}
      <div style={{display:'flex', alignItems:'center', gap:8, padding:'8px 0', margin:'2px 0'}}>
        <span className="num" style={{width:64, font:'700 11px var(--font-mono)', color:'var(--color-violet-300)'}}>{fmtP(mark)}</span>
        <div style={{flex:1, height:1.5, background:'var(--color-violet-400)', opacity:.55}}/>
        <span style={{width:104, textAlign:'right', font:'700 11px var(--font-body)', color:'var(--color-violet-300)', letterSpacing:'.06em', textTransform:'uppercase'}}>Mark · now</span>
      </div>
      {below.map((w,i)=>Row(w,'b'+i))}
      <div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:12, lineHeight:1.45}}>Short liqs sit above mark, long liqs below. A wall does not mean liquidation will happen — it marks where a cascade could accelerate.</div>
    </Surface>
  );
}

/* ── R3 · By cohort — who's most fragile ── */
function RiskCohortGrid({ sig }){
  const cohorts = (sig.bias && sig.bias.cohorts) || [];
  const matrix = (sig.stress && sig.stress.matrix) || [];
  const liqLong = matrix.find(r=>/liq/i.test(r.label) && r.side==='Long') || { cells:[] };
  return (
    <div style={{display:'flex', flexDirection:'column', gap:12}}>
      {cohorts.map((c,i)=>{
        const cell = liqLong.cells[i] || {};
        const longU = rkUsd(c.longNotional), shortU = rkUsd(c.shortNotional), pct = longU/((longU+shortU)||1);
        const oneSided = Math.round(Math.max(pct,1-pct)*100);
        const lev = RK_LEV[c.name] || 5;
        const Col = ({ k, d, children }) => (
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'flex', alignItems:'center', gap:4, font:'600 11px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.04em', textTransform:'uppercase'}}>{k}{d && <InfoTip d={d}/>}</div>
            <div style={{marginTop:4}}>{children}</div>
          </div>
        );
        return (
          <Surface key={c.name} style={{padding:16}}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
              <span style={{width:8, height:8, borderRadius:2, background:c.accent||RK_ACC[c.name], flexShrink:0}}/>
              <span style={{font:'700 14px var(--font-brand)', color:'var(--text-primary)', letterSpacing:'-.01em'}}>{c.name}</span>
              <span style={{marginLeft:'auto'}}><SevBadge sev={cell.sev||'normal'} size="sm"/></span>
            </div>
            <div style={{display:'flex', gap:12}}>
              <Col k="Avg lev"><span className="num" style={{font:'700 13px var(--font-mono)', color: lev>10?'var(--regime-trans-mid)':'var(--text-primary)'}}>{lev.toFixed(1)}×</span></Col>
              <div style={{width:'.5px', background:'var(--border-default)'}}/>
              <Col k="Unrealized loss" d={rkD('underwater')}><span className="num" style={{font:'700 13px var(--font-mono)', color: cell.underwater?'var(--regime-down-mid)':'var(--text-primary)'}}>{cell.underwater||'—'}</span></Col>
              <div style={{width:'.5px', background:'var(--border-default)'}}/>
              <Col k="Vulnerable" d={rkD('vulnerable')}><span className="num" style={{font:'700 13px var(--font-mono)', color:'var(--text-primary)'}}>{cell.vulnerable||'—'}</span></Col>
            </div>
            <div className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', marginTop:8}}>{oneSided}% one-sided ({pct>=0.5?'long':'short'}) · {cell.wallets||((c.longCount||'')+' w')}</div>
          </Surface>
        );
      })}
    </div>
  );
}

/* ── R4 · Exact figures — one number-meaning per row, labeled ── */
function RiskDetail({ sig }){
  const matrix = (sig.stress && sig.stress.matrix) || [];
  const cohorts = ((sig.bias && sig.bias.cohorts) || []).map(c=>RK_SHORT[c.name]||c.name);
  const mLong = matrix.find(r=>/liq/i.test(r.label) && r.side==='Long') || {cells:[]};
  const pLong = matrix.find(r=>/pnl|pain/i.test(r.label) && r.side==='Long') || {cells:[]};
  const mShort = matrix.find(r=>/liq/i.test(r.label) && r.side==='Short') || {cells:[]};
  const rows = [
    { label:'Long · at risk',         d:rkD('vulnerable'), cells:mLong.cells,  field:'vulnerable', tone:'var(--regime-up-mid)' },
    { label:'Long · unrealized loss', d:rkD('underwater'), cells:pLong.cells,  field:'underwater', tone:'var(--regime-up-mid)' },
    { label:'Short · at risk',        d:rkD('vulnerable'), cells:mShort.cells, field:'vulnerable', tone:'var(--regime-down-mid)' },
  ];
  return (
    <div>
      <Surface style={{padding:12}}>
        <div style={{display:'flex', gap:2, marginBottom:8, paddingLeft:108}}>
          {cohorts.map(n=> <span key={n} style={{flex:1, textAlign:'center', font:'600 11px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.02em'}}>{n}</span>)}
        </div>
        {rows.map((row,ri)=>(
          <div key={ri} style={{display:'flex', alignItems:'center', gap:2, marginBottom:4}}>
            <span style={{width:108, display:'flex', alignItems:'center', gap:4, font:'600 11px var(--font-body)', color:'var(--text-secondary)'}}>
              <span style={{width:5, height:5, borderRadius:'50%', background:row.tone, flexShrink:0}}/>{row.label}<InfoTip d={row.d}/>
            </span>
            {cohorts.map((_,ci)=>{ const cell=(row.cells||[])[ci]||{}; const v=cell[row.field];
              return (
                <div key={ci} style={{flex:1, height:32, borderRadius:8, background:RK_SEVBG[cell.sev||'normal'], display:'grid', placeItems:'center'}}>
                  {v && <span className="num" style={{font:'600 11px var(--font-mono)', color:'var(--text-primary)'}}>{v}</span>}
                </div>
              );
            })}
          </div>
        ))}
        <div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:10, lineHeight:1.45}}>
          Each cell is that cohort's figure for the row — <b style={{color:'var(--text-secondary)'}}>at risk</b> = $ vulnerable notional, <b style={{color:'var(--text-secondary)'}}>unrealized loss</b> = % of vulnerable now in loss. Cell shade = severity (watch → critical). Blank = not material.
        </div>
      </Surface>
    </div>
  );
}

/* ── Risk tab ── */
function InstrumentRiskTab2({ sig }){
  const [win,setWin] = rkUS('4h');
  if(!sig || !sig.stress) return (<div style={{padding:'24px 20px', font:'500 12px var(--font-body)', color:'var(--text-tertiary)'}}>No risk read available for this instrument.</div>);
  return (
    <div>
      <div style={{display:'flex', alignItems:'center', gap:12, padding:'12px 16px 2px'}}>
        <span style={{font:'600 11px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.04em'}}>Cohorts</span>
        <div style={{marginLeft:'auto'}}><CompactSelector options={RK_WINS} value={win} onChange={setWin}/></div>
      </div>
      <ModuleSpacer h={8}/>
      <RiskRead sig={sig} win={win}/>
      <ModuleSpacer/>
      <LiqMap sig={sig}/>
      <ModuleSpacer/>
      <IvGroupHead title="By cohort" sub="Who blows up first — leverage, how much is underwater, how much is vulnerable."/>
      <RiskCohortGrid sig={sig}/>
      <ModuleSpacer/>
      <IvGroupHead title="Exact figures" sub="Per-cohort at-risk and unrealized-loss notional, by side."/>
      <RiskDetail sig={sig}/>
      <DisclaimerFooter text="Risk measures leverage, crowding, PnL pain, and distance to liquidation separately. A close cluster does not mean liquidation will happen; not all stressed wallets liquidate."/>
    </div>
  );
}

Object.assign(window, { InstrumentRiskTab2 });
