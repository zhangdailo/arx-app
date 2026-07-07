/* ═══ ARX · Share PnL ═══════════════════════════════════════════════
   Two steps:
     1. Pick a trade — a list of the user's closed/open trades.
     2. Poster — a Coincall-style share card, restyled black + ARX purple
        (the green is replaced), with the trade details, referral code + QR.
   Opened as a sub-screen:
     __arxOpenSub('pnlShare')            → starts at the trade picker
     __arxOpenSub('pnlShare',{ pos })    → jumps straight to the poster for `pos`
   ──────────────────────────────────────────────────────────────────── */

const { useState: psS } = React;

/* Elon's trades — what the picker shows. Each has everything the poster needs. */
const PS_TRADES = [
  { sym:'SOL',  contract:'SOL-PERP',  dir:'LONG',  lev:'6×',  roi:63.38,  entry:'182.41',   last:'198.30',  size:'$3,420', pnl:'+$284.10' },
  { sym:'HYPE', contract:'HYPE-PERP', dir:'LONG',  lev:'10×', roi:142.10, entry:'18.92',    last:'24.10',   size:'$2,980', pnl:'+$2,980' },
  { sym:'BTC',  contract:'BTC-PERP',  dir:'LONG',  lev:'3×',  roi:28.40,  entry:'71,840',   last:'73,212',  size:'$8,200', pnl:'+$1,240' },
  { sym:'ETH',  contract:'ETH-PERP',  dir:'SHORT', lev:'4×',  roi:-12.10, entry:'3,910.20', last:'4,120.00',size:'$1,860', pnl:'−$210' },
  { sym:'NVDA', contract:'NVDA-RWA',  dir:'LONG',  lev:'2×',  roi:8.20,   entry:'1,094',    last:'1,184',   size:'$2,020', pnl:'+$166' },
];

const PS_CODE = 'ARX-ELON';
const PS_HANDLE = 'elon.musk';

function PsQR() {
  const cells = 21; let seed = 88; const on = [];
  for (let i = 0; i < cells*cells; i++) { seed = (seed*9301 + 49297) % 233280; on.push(seed/233280 > 0.48); }
  // finder squares in 3 corners
  const finder = (ox,oy) => { const c=[]; for(let y=0;y<7;y++)for(let x=0;x<7;x++){ const edge=x===0||x===6||y===0||y===6; const core=x>=2&&x<=4&&y>=2&&y<=4; if(edge||core)c.push([ox+x,oy+y]); } return c; };
  const fcells = [...finder(0,0), ...finder(cells-7,0), ...finder(0,cells-7)];
  const isFinder = (x,y)=> (x<8&&y<8)||(x>cells-9&&y<8)||(x<8&&y>cells-9);
  return (
    <svg viewBox={`0 0 ${cells} ${cells}`} style={{ width:'100%', height:'100%', display:'block' }} shapeRendering="crispEdges">
      {on.map((v,i)=>{ const x=i%cells, y=Math.floor(i/cells); if(isFinder(x,y)||!v) return null; return <rect key={i} x={x} y={y} width="1" height="1" fill="#0B0712"/>; })}
      {fcells.map(([x,y],i)=><rect key={'f'+i} x={x} y={y} width="1" height="1" fill="#0B0712"/>)}
    </svg>
  );
}

/* The poster — Coincall layout, ARX black + purple. */
function PnLPoster({ t, onBack, onToast }) {
  const up = t.roi >= 0;
  const accent = up ? '#A78BFA' : '#FF4D6A';        // purple replaces Coincall green
  const now = new Date();
  const stamp = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0')+' '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0')+':'+String(now.getSeconds()).padStart(2,'0');
  const share = () => {
    const txt = `${up?'+':''}${t.roi.toFixed(2)}% on ${t.contract} — trade on ARX. Referral ${PS_CODE}`;
    if (navigator.share) navigator.share({ title:'My ARX trade', text:txt, url:'https://arx.trade/?ref='+PS_CODE }).catch(()=>{});
    else onToast && onToast('Poster ready to share');
  };

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
      <div style={{display:'flex', alignItems:'center', gap:10, padding:'4px 20px 10px'}}>
        <button onClick={onBack} style={{display:'inline-flex', alignItems:'center', gap:6, background:'none', border:'none', padding:0, cursor:'pointer', color:'var(--color-violet-500)'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          <span style={{font:'700 13px var(--font-body)'}}>Trades</span>
        </button>
      </div>

      <div style={{flex:1, overflowY:'auto', padding:'0 18px 12px', display:'flex', justifyContent:'center', alignItems:'flex-start'}}>
        {/* the exportable poster */}
        <div id="arx-pnl-card" style={{width:'100%', maxWidth:340, background:'#0B0712', borderRadius:22, padding:'24px 22px', color:'#fff', border:'1px solid rgba(124,91,255,.30)', position:'relative', overflow:'hidden'}}>
          <div style={{position:'absolute', top:-60, right:-50, width:230, height:230, background:'radial-gradient(circle, rgba(124,91,255,.40), transparent 68%)', filter:'blur(26px)', pointerEvents:'none'}}/>

          {/* top: wordmark + datestamp */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative'}}>
            {window.ArxWordmark ? <ArxWordmark size={24} color="#fff"/> : <span style={{font:'800 22px var(--font-brand)'}}>arx</span>}
            <span style={{font:'500 10px var(--font-mono)', color:'rgba(255,255,255,.45)'}}>Date {stamp}</span>
          </div>

          {/* side + contract */}
          <div style={{marginTop:26, position:'relative'}}>
            <span style={{font:'700 14px var(--font-body)', color: t.dir==='LONG' ? '#A78BFA' : '#FF4D6A'}}>{t.dir==='LONG'?'Buy':'Sell'}</span>
            <div style={{font:'700 24px var(--font-mono)', marginTop:3, letterSpacing:'-.01em'}}>{t.contract} · {t.lev}</div>
          </div>

          {/* big % + illustration */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:14, position:'relative'}}>
            <span style={{font:'800 46px var(--font-mono)', letterSpacing:'-.03em', color:accent, lineHeight:1}}>{up?'+':''}{t.roi.toFixed(2)}%</span>
            <svg width="92" height="92" viewBox="0 0 92 92" fill="none" style={{flexShrink:0, filter:'drop-shadow(0 6px 16px rgba(124,91,255,.45))'}}>
              <defs>
                <linearGradient id="psArrow" x1="46" y1="8" x2="46" y2="64" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#C4B5FD"/><stop offset="1" stopColor="#7C5BFF"/>
                </linearGradient>
                <linearGradient id="psCoin" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#C4B5FD"/><stop offset="1" stopColor="#7C5BFF"/>
                </linearGradient>
              </defs>
              {up ? <path d="M46 8 L66 34 H54 V60 H38 V34 H26 Z" fill="url(#psArrow)"/>
                  : <path d="M46 64 L26 38 H38 V12 H54 V38 H66 Z" fill="url(#psArrow)"/>}
              <circle cx="64" cy="66" r="15" fill="url(#psCoin)" stroke="#0B0712" strokeWidth="2"/>
              <text x="64" y="71" fontSize="15" fontWeight="800" fill="#0B0712" textAnchor="middle" fontFamily="var(--font-mono)">$</text>
              <circle cx="34" cy="74" r="11" fill="url(#psCoin)" stroke="#0B0712" strokeWidth="2" opacity="0.92"/>
              <text x="34" y="78.5" fontSize="11" fontWeight="800" fill="#0B0712" textAnchor="middle" fontFamily="var(--font-mono)">$</text>
            </svg>
          </div>

          {/* entry / last */}
          <div style={{marginTop:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, position:'relative'}}>
            <div>
              <div style={{font:'400 11px var(--font-body)', color:'rgba(255,255,255,.45)'}}>Entry Price</div>
              <div style={{font:'700 19px var(--font-mono)', marginTop:3}}>{t.entry}</div>
            </div>
            <div>
              <div style={{font:'400 11px var(--font-body)', color:'rgba(255,255,255,.45)'}}>Last Price</div>
              <div style={{font:'700 19px var(--font-mono)', marginTop:3}}>{t.last}</div>
            </div>
          </div>

          {/* referral footer */}
          <div style={{marginTop:22, padding:14, borderRadius:16, background:'rgba(124,91,255,.10)', border:'.5px solid rgba(124,91,255,.22)', display:'flex', gap:12, alignItems:'center', position:'relative'}}>
            <div style={{flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:5}}>
              <span style={{font:'400 12px var(--font-body)', color:'rgba(255,255,255,.82)', lineHeight:1.35}}>Trade everything. Copy the best — on ARX.</span>
              <span style={{font:'400 11px var(--font-body)'}}>
                <span style={{background:'#7C5BFF', color:'#fff', padding:'2px 7px', borderRadius:5, fontWeight:700}}>Referral</span>
                <span style={{color:'#fff', marginLeft:7, fontFamily:'var(--font-mono)', fontWeight:600}}>{PS_CODE}</span>
              </span>
              <span style={{font:'500 10.5px var(--font-body)', color:'#C4B5FD'}}>arx.trade/?ref={PS_CODE}</span>
            </div>
            <div style={{width:62, height:62, borderRadius:9, background:'#fff', padding:5, flexShrink:0}}><PsQR/></div>
          </div>

          <div style={{marginTop:14, textAlign:'center', font:'500 10px var(--font-body)', color:'rgba(255,255,255,.4)', position:'relative'}}>Shared by {PS_HANDLE}</div>
        </div>
      </div>

      <div style={{padding:'10px 18px calc(18px + env(safe-area-inset-bottom))', flexShrink:0, display:'flex', gap:10}}>
        <button onClick={onBack} style={{flex:1, height:48, borderRadius:'var(--r-md)', cursor:'pointer', background:'transparent', border:'.5px solid var(--border-strong)', color:'var(--text-primary)', font:'600 15px var(--font-body)'}}>Pick another</button>
        <button onClick={share} style={{flex:1.6, height:48, borderRadius:'var(--r-md)', cursor:'pointer', background:'var(--color-violet-500)', border:'none', color:'#fff', font:'700 15px var(--font-body)', boxShadow:'var(--shadow-execute)'}}>Share image</button>
      </div>
    </div>
  );
}

/* Step 1 — pick a trade */
function TradePicker({ onPick }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:12, padding:'6px 20px 28px'}}>
      <div style={{display:'flex', flexDirection:'column', gap:3}}>
        <span style={{font:'800 20px var(--font-brand)', letterSpacing:'-.02em', color:'var(--text-primary)'}}>Share a win</span>
        <span style={{font:'400 12.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>Pick a trade to turn into a shareable card.</span>
      </div>
      {PS_TRADES.map((t,i)=>{
        const up = t.roi >= 0;
        return (
          <button key={i} onClick={()=>onPick(t)} className="arx-press" style={{display:'flex', alignItems:'center', gap:12, width:'100%', textAlign:'left', cursor:'pointer',
            background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:16, padding:'13px 14px'}}>
            {window.AssetGlyph ? <AssetGlyph sym={t.sym} size={36}/> : <span style={{width:36,height:36}}/>}
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', alignItems:'center', gap:7}}>
                <span style={{font:'700 14px var(--font-body)', color:'var(--text-primary)'}}>{t.contract}</span>
                <span style={{font:'700 9px var(--font-body)', color: t.dir==='LONG'?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{t.dir} {t.lev}</span>
              </div>
              <div className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2}}>Size {t.size} · entry {t.entry}</div>
            </div>
            <div style={{textAlign:'right', flexShrink:0}}>
              <div className="num" style={{font:'800 16px var(--font-mono)', color: up?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{up?'+':''}{t.roi.toFixed(1)}%</div>
              <div className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', marginTop:1}}>{t.pnl}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M9 18l6-6-6-6"/></svg>
          </button>
        );
      })}
    </div>
  );
}

/* Entry — full-screen sheet over the app */
function PnLShareCard({ pos, onClose, onToast }) {
  const initial = pos ? { sym:pos.sym, contract:(pos.sym||'SOL')+'-PERP', dir:(pos.dir||'LONG').toUpperCase(), lev:pos.lev||'6×',
    roi: pos.roi!=null?pos.roi:(String(pos.pnl||'+').trim().startsWith('−')||String(pos.pnl||'+').trim().startsWith('-')?-42.1:63.38),
    entry:(pos.entry||'182.41').replace('$',''), last:(pos.liq||pos.last||'198.30').replace('$',''), size:pos.size||'$3,420', pnl:pos.pnl||'+$284.10' } : null;
  const [trade, setTrade] = psS(initial);

  return (
    <div onClick={onClose} style={{position:'absolute', inset:0, zIndex:80, background:'rgba(6,6,10,.55)', backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)', display:'flex', flexDirection:'column', justifyContent:'flex-end', animation:'arx-fade-in .18s ease'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'var(--surface-base)', borderRadius:'24px 24px 0 0', borderTop:'.5px solid var(--border-strong)', height:'92%', display:'flex', flexDirection:'column', overflow:'hidden', animation:'slideUp 380ms cubic-bezier(.32,.72,0,1) both'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px 8px', flexShrink:0}}>
          <span style={{font:'700 16px var(--font-body)', color:'var(--text-primary)'}}>Share PnL</span>
          <button onClick={onClose} style={{width:32, height:32, borderRadius:'50%', background:'var(--glass-control-bg)', border:'none', cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center'}}>
            {window.IconClose ? <IconClose size={16} color="var(--text-secondary)"/> : <span style={{color:'var(--text-secondary)'}}>✕</span>}
          </button>
        </div>
        <div style={{flex:1, minHeight:0, display:'flex', flexDirection:'column'}}>
          {trade ? <PnLPoster t={trade} onBack={()=>pos?onClose():setTrade(null)} onToast={onToast}/>
                 : <div style={{flex:1, overflowY:'auto'}}><TradePicker onPick={setTrade}/></div>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PnLShareCard, PnLPoster, TradePicker });
