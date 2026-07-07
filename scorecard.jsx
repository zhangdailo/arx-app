/* ═══ ARX · WdScorecard — trader radar (migrated from prototype) ═══
   5-axis percentile radar with three overlays: this trader · peer avg · your fit.
   Tap any axis bar to reveal the evidence (L3). Seeded so the three shared axes
   (consistency / low-drawdown / win) corroborate the wallet-detail cohort bars.
   Self-contained card on DS v6 tokens. Load BEFORE wallet-detail.jsx. */

const { useState: scS } = React;

function scScore(seedKey, base) {
  let h = 0; const s = String(seedKey || 'x');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
  const r = () => ((h = (h * 9301 + 49297) % 233280) / 233280);
  const b = base || {};
  const clamp = (v) => Math.max(8, Math.min(99, Math.round(v)));
  return {
    profitability: clamp(b.profitability ?? 30 + r() * 55),
    consistency:   clamp(b.consistency   ?? 60 + r() * 38),
    risk:          clamp(b.risk          ?? 55 + r() * 42),
    win:           clamp(b.win           ?? 45 + r() * 45),
    capital:       clamp(b.capital       ?? 35 + r() * 55),
  };
}

function scVerdict(sc) {
  const hi = [], lo = [];
  const map = { profitability:'returns', consistency:'consistency', risk:'risk control', win:'win rate', capital:'capital quality' };
  Object.keys(map).forEach(k => { if (sc[k] >= 85) hi.push(map[k]); else if (sc[k] <= 45) lo.push(map[k]); });
  const lead = hi.length ? `Elite ${hi.slice(0, 2).join(' and ')}` : 'Balanced across the board';
  const tail = lo.length ? `, modest ${lo[0]}` : '';
  const proven = sc.consistency >= 80 && sc.risk >= 80;
  return `${lead}${tail} — ${proven ? 'a low-variance machine, proven over 90 days.' : 'an active profile with room to prove out.'}`;
}

const SC_AXES = [
  { key:'profitability', label:'Profitability',    ev:'Realized after fees. Return is steady rather than spiky — by design for this book.' },
  { key:'consistency',   label:'Consistency',      ev:'Gains spread across many days, not one lucky trade — biggest single win is a small share of total profit.' },
  { key:'risk',          label:'Risk control',     ev:'Shallow worst-drawdown, leverage held inside its usual range, zero liquidations in 90d.' },
  { key:'win',           label:'Win rate',         ev:'Most closes profitable with a favourable average-win vs average-loss payoff.' },
  { key:'capital',       label:'Capital quality',  ev:'Fresh capital deployed into positions quickly — conviction-backed entries, not idle float.' },
];

function WdScorecard({ seedKey, peer, label }) {
  // peer = { cons, dd, win } percentiles already shown on the cohort card.
  const base = peer ? { consistency: peer.cons, risk: peer.dd, win: peer.win } : null;
  const sc = scScore(seedKey, base);
  const [eviKey, setEviKey] = scS(null);
  const order = ['profitability','consistency','risk','win','capital'];
  const peerAvg = { profitability:55, consistency:60, risk:58, win:56, capital:52 };
  const yourFit = { profitability:60, consistency:80, risk:78, win:64, capital:55 };
  const cx = 100, cy = 96, R = 74;
  const poly = (vals) => order.map((k, i) => { const a = -Math.PI/2 + i*(2*Math.PI/5); const rad = (vals[k]/100)*R; return [cx+Math.cos(a)*rad, cy+Math.sin(a)*rad].join(','); }).join(' ');
  const axisLbl = ['Profit','Stable','Risk','Win%','Capital'];

  return (
    <div style={{margin:'10px 20px 0', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:14}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <span style={{font:'700 13px var(--font-body)', color:'var(--text-primary)'}}>Trader scorecard</span>
        <span style={{font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)'}}>percentile vs {label||'cluster'} · 90D</span>
      </div>
      <p style={{margin:0, font:'600 13.5px var(--font-body)', lineHeight:1.5, color:'var(--text-primary)', textWrap:'pretty'}}>{scVerdict(sc)}</p>

      <div style={{display:'flex', justifyContent:'center'}}>
        <svg viewBox="0 0 200 192" style={{width:220, height:200}}>
          {[0.25,0.5,0.75,1].map(f => (
            <polygon key={f} points={order.map((k,i)=>{const a=-Math.PI/2+i*(2*Math.PI/5); return [cx+Math.cos(a)*R*f, cy+Math.sin(a)*R*f].join(',');}).join(' ')} fill="none" stroke="var(--border-default)" strokeWidth="1"/>
          ))}
          {order.map((k,i)=>{const a=-Math.PI/2+i*(2*Math.PI/5); return <line key={k} x1={cx} y1={cy} x2={cx+Math.cos(a)*R} y2={cy+Math.sin(a)*R} stroke="var(--border-default)" strokeWidth="1"/>;})}
          <polygon points={poly(peerAvg)} fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeDasharray="3 3"/>
          <polygon points={poly(yourFit)} fill="rgba(20,184,123,0.10)" stroke="var(--regime-up-mid)" strokeWidth="1.5" strokeDasharray="2 3"/>
          <polygon points={poly(sc)} fill="rgba(124,91,255,0.18)" stroke="var(--color-violet-500)" strokeWidth="2"/>
          {order.map((k,i)=>{const a=-Math.PI/2+i*(2*Math.PI/5); const rad=(sc[k]/100)*R; return <circle key={k} cx={cx+Math.cos(a)*rad} cy={cy+Math.sin(a)*rad} r="2.5" fill="var(--color-violet-500)"/>;})}
          {order.map((k,i)=>{const a=-Math.PI/2+i*(2*Math.PI/5); return <text key={k} x={cx+Math.cos(a)*(R+12)} y={cy+Math.sin(a)*(R+12)+3} fontSize="8.5" fill="var(--text-secondary)" textAnchor="middle" fontWeight="600">{axisLbl[i]}</text>;})}
        </svg>
      </div>

      <div style={{display:'flex', gap:14, fontSize:10, color:'var(--text-tertiary)', justifyContent:'center', flexWrap:'wrap'}}>
        <span style={{display:'inline-flex', alignItems:'center', gap:5}}><i style={{width:12, height:2, background:'var(--color-violet-500)'}}/> This trader</span>
        <span style={{display:'inline-flex', alignItems:'center', gap:5}}><i style={{width:12, height:0, borderTop:'2px dashed var(--text-tertiary)'}}/> Peer avg</span>
        <span style={{display:'inline-flex', alignItems:'center', gap:5}}><i style={{width:12, height:0, borderTop:'2px dashed var(--regime-up-mid)'}}/> Your fit</span>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:10}}>
        {SC_AXES.map(a => (
          <button key={a.key} onClick={() => setEviKey(eviKey === a.key ? null : a.key)} style={{textAlign:'left', background:'none', border:'none', padding:0, cursor:'pointer', width:'100%'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
              <span style={{font:'600 13px var(--font-body)', color:'var(--text-primary)'}}>{a.label}</span>
              <span style={{font:'800 14px var(--font-mono)', color:'var(--text-primary)'}}>{sc[a.key]}</span>
            </div>
            <div style={{height:6, borderRadius:99, background:'var(--glass-control-bg)', marginTop:5, position:'relative', overflow:'hidden'}}>
              <div style={{position:'absolute', inset:0, width:sc[a.key]+'%', background:'var(--color-violet-500)', borderRadius:99}}/>
              <div style={{position:'absolute', top:-2, bottom:-2, left:peerAvg[a.key]+'%', width:2, background:'var(--text-tertiary)'}}/>
            </div>
            {eviKey === a.key && (
              <div className="arx-arrive" style={{marginTop:8, padding:'10px 12px', background:'var(--glass-control-bg)', borderRadius:10, font:'400 11.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5}}>
                <span style={{fontWeight:700, color:'var(--color-violet-500)'}}>Why {sc[a.key]}: </span>{a.ev}
              </div>
            )}
          </button>
        ))}
      </div>
      <span style={{font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', textAlign:'center'}}>Tap any score to see the evidence behind it</span>
    </div>
  );
}

Object.assign(window, { WdScorecard, scScore });
