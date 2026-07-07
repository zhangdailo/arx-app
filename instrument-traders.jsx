// app/instrument-traders.jsx — Traders tab (v3 — DS-normalized + playbook redesign).
// (1) T1 — top-10 tracked wallets positioned in THIS instrument, ranked + cohort-filtered, each wired
// to wallet detail, with a "See all in Copy" hand-off. PnL is unrealized (open position here).
// (2) T2 — cohort playbook (Smart · Whale · Rising): each card leads with WHO the cohort is (criteria),
// then a labelled key/value stack of the borrowable settings — not a cramped 3-col row. Apply to ticket.

const { useState: trUS } = React;

const TR_ACC = { 'Smart Money':'var(--color-violet-500)', 'Whale Moves':'var(--color-peach-500)', 'Rising Money':'var(--regime-range-mid)', 'Full Rekt Crowd':'var(--regime-down-mid)' };
const TR_SHORT = { 'Smart Money':'Smart', 'Whale Moves':'Whale', 'Rising Money':'Rising', 'Full Rekt Crowd':'Rekt' };
const TR_LEV = { 'Smart Money':5.1, 'Whale Moves':8.4, 'Rising Money':4.2 };
const TR_DEF = {
  'Smart Money':  'Proven 90-day record · controlled drawdown · active style',
  'Whale Moves':  '≥ $1M perp capital · not rekt · moves the tape',
  'Rising Money': 'Strong last 30 days · sub-whale · not yet proven',
};
const trDef = (k)=> (((window.ARX_LOGIC||{}).cohortPlaybook)||{})[k];

function trHash(s){ let x=2166136261; s=String(s); for(let i=0;i<s.length;i++){ x^=s.charCodeAt(i); x=Math.imul(x,16777619); } return (x>>>0)/4294967295; }
function trCohort(w){ const p=w.perf, c=w.cap; if(p==='smart_money') return 'Smart Money'; if(c==='whale' && p!=='full_rekt' && p!=='new_blood') return 'Whale Moves'; if(p==='rising_star') return 'Rising Money'; if(p==='full_rekt') return 'Full Rekt Crowd'; return null; }
function trMoney(n){ const a=Math.abs(n); const s=a>=1e9?'$'+(a/1e9).toFixed(1)+'B':a>=1e6?'$'+(a/1e6).toFixed(1)+'M':a>=1e3?'$'+Math.round(a/1e3)+'K':'$'+Math.round(a); return s; }
function trSigned(n){ return (n<0?'−':'+')+trMoney(n); }
function trPx(n){ return '$'+Math.round(n).toLocaleString(); }
function trUsd(s){ if(typeof s==='number')return s; if(!s)return 0; const x=String(s).replace(/[$,]/g,'').match(/([\d.]+)\s*([BMK]?)/i); return x?parseFloat(x[1])*({B:1e9,M:1e6,K:1e3,'':1}[(x[2]||'').toUpperCase()]||1):0; }
function trPos(w, sym){
  const r=trHash(w.addr+sym), b=trCohort(w);
  const longBias = b==='Full Rekt Crowd' ? 0.40 : b==='Smart Money' ? 0.66 : 0.58;
  const side = r < longBias ? 'Long' : 'Short';
  const lev = Math.max(2, Math.round((w.maxLev||5)*(0.5+trHash(w.addr+'l')*0.5)));
  const expo = (w.aumV||12000)*(0.3+trHash(w.addr+'e')*1.5);
  const upnl = expo*(side==='Long'?1:-1)*((trHash(w.addr+sym+'p')-0.42)*0.16);
  return { side, lev, expo, upnl };
}

/* ── T1 · Wallets in this market ── */
function TrWallets({ m, sort, coh }){
  const sym = m.sym;
  let ws = (window.WALLETS||[]).map(w=>({ w, coh:trCohort(w), pos:trPos(w,sym) })).filter(x=>x.coh);
  if(coh!=='all') ws = ws.filter(x=>x.coh===coh);
  ws.sort((a,b)=> sort==='upnl' ? b.pos.upnl-a.pos.upnl : b.pos.expo-a.pos.expo);
  const top = ws.slice(0,10);
  const open = (w)=>{ try{ window.__arxOpenSub && window.__arxOpenSub('walletDetail', { w }); }catch(e){} };
  return (
    <div style={{margin:'0 16px', borderRadius:16, border:'.5px solid var(--border-default)', background:'var(--surface-elevated)', overflow:'hidden'}}>
      {top.length? top.map((x,i)=>{
        const id = window.resolveIdentity ? window.resolveIdentity(x.w) : null;
        const nm = (id&&(id.handle||id.name)) || x.w.x || x.w.addr;
        const long = x.pos.side==='Long', sc = long?'var(--regime-up-mid)':'var(--regime-down-mid)';
        return (
          <button key={x.w.addr} onClick={()=>open(x.w)} className="arx-row-press" style={{display:'flex', alignItems:'center', gap:12, width:'100%', padding:'12px 16px', borderTop:i?'.5px solid var(--border-default)':'none', background:'none', border:'none', cursor:'pointer', textAlign:'left'}}>
            <span className="num" style={{width:14, font:'700 11px var(--font-mono)', color:'var(--text-tertiary)', flexShrink:0}}>{i+1}</span>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <span style={{font:'600 13px var(--font-body)', color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:120}}>{nm}</span>
                <span style={{font:'600 11px var(--font-body)', color:TR_ACC[x.coh], background:'color-mix(in oklab, '+TR_ACC[x.coh]+' 14%, transparent)', padding:'1px 8px', borderRadius:999, whiteSpace:'nowrap'}}>{TR_SHORT[x.coh]}</span>
              </div>
              <div className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', marginTop:3}}><span style={{color:sc}}>{x.pos.side} {x.pos.lev}×</span> · {trMoney(x.pos.expo)} · entry {trPx(m.price*(1-(x.pos.upnl>0?0.03:-0.02)))}</div>
            </div>
            <div className="num" style={{font:'700 13px var(--font-mono)', color: x.pos.upnl>=0?'var(--regime-up-mid)':'var(--regime-down-mid)', flexShrink:0}}>{trSigned(x.pos.upnl)}</div>
            <IconChevron color="var(--text-tertiary)" size={13}/>
          </button>
        );
      }) : <div style={{padding:18, font:'500 12px var(--font-body)', color:'var(--text-tertiary)', textAlign:'center'}}>No tracked wallets in this cohort are positioned here.</div>}
      <button onClick={()=>window.__arxGoTab && window.__arxGoTab('wallets')} className="arx-press" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:5, width:'100%', padding:12, borderTop:'.5px solid var(--border-default)', background:'var(--surface-base)', border:'none', cursor:'pointer', font:'700 12px var(--font-body)', color:'var(--color-violet-300)'}}>See all in Copy <IconChevron color="var(--color-violet-300)" size={12}/></button>
    </div>
  );
}

/* ── T2 · Cohort playbook — who they are, then the borrowable settings as a key/value stack ── */
function TrPlaybook({ sig, m }){
  const cohorts = (sig.bias && sig.bias.cohorts) || [];
  const walls = (sig.walls && sig.walls.keyWalls) || [];
  const wallOf = (k)=> (walls.find(w=>w.kind===k)||{}).center;
  const entry = wallOf('entry') || m.price*0.985, sl = wallOf('forced') || m.price*0.95, tp = wallOf('profit') || m.price*1.05;
  const apply = (nm)=>{ try{ window.__arxTrade && window.__arxTrade(m.sym); window.__arxToast && window.__arxToast(nm+' setup sent to ticket'); }catch(e){} };
  const Row = ({ k, d, v, col, last }) => (
    <div style={{display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderTop: last?'none':'.5px solid var(--border-default)'}}>
      <span style={{display:'flex', alignItems:'center', gap:5, flex:1, minWidth:0, font:'500 12px var(--font-body)', color:'var(--text-secondary)'}}>{k}{d && <InfoTip d={d}/>}</span>
      <span className="num" style={{font:'700 13px var(--font-mono)', color: col||'var(--text-primary)', whiteSpace:'nowrap'}}>{v}</span>
    </div>
  );
  return (
    <div style={{display:'flex', flexDirection:'column', gap:12}}>
      {['Smart Money','Whale Moves','Rising Money'].map(nm=>{
        const c = cohorts.find(x=>x.name===nm) || {};
        const longU = trUsd(c.longNotional), shortU = trUsd(c.shortNotional);
        const pctLong = Math.round(longU/((longU+shortU)||1)*100), long = pctLong>=50;
        const lev = TR_LEV[nm];
        return (
          <Surface key={nm} style={{padding:16}}>
            {/* who they are */}
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <span style={{width:8, height:8, borderRadius:2, background:TR_ACC[nm], flexShrink:0}}/>
              <span style={{font:'700 14px var(--font-brand)', color:'var(--text-primary)', letterSpacing:'-.01em'}}>{nm}</span>
              <span style={{marginLeft:'auto'}}><SevBadge tone={long?'up':'down'} size="sm">{Math.max(pctLong,100-pctLong)}% {long?'long':'short'}</SevBadge></span>
            </div>
            <div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:6, lineHeight:1.4, letterSpacing:'-.005em'}}>{TR_DEF[nm]}</div>
            {/* borrowable settings — labelled stack, breathing room */}
            <div style={{marginTop:12, padding:'0 2px'}}>
              <Row k="Typical leverage" d={trDef('leverage')} v={lev.toFixed(1)+'×'}/>
              <Row k="Entry · vol-weighted" d={trDef('entry')} v={trPx(entry)}/>
              <Row k="Stop-loss · forced-exit" d={trDef('stopLoss')} v={trPx(sl)} col="var(--regime-down-mid)"/>
              <Row k="Take-profit · inferred" d={trDef('takeProfit')} v={trPx(tp)} col="var(--regime-up-mid)" last/>
            </div>
            <button onClick={()=>apply(nm)} className="arx-press" style={{width:'100%', marginTop:12, height:40, borderRadius:12, border:'none', cursor:'pointer', background:'color-mix(in oklab, '+TR_ACC[nm]+' 16%, var(--surface-base))', color:'var(--text-primary)', font:'700 12px var(--font-body)'}}>Apply {TR_SHORT[nm]} setup to ticket →</button>
          </Surface>
        );
      })}
      <div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.45, padding:'0 2px'}}>Direction & leverage are the cohort's observed aggregate; entry / stop / take-profit are the instrument's walls (stop at the forced-exit cluster, take-profit inferred from prior reductions). Not advice.</div>
    </div>
  );
}

/* ── Traders tab ── */
function InstrumentTradersTab2({ sig, m, isPerp }){
  const [sort,setSort] = trUS('expo');
  const [coh,setCoh]   = trUS('all');
  return (
    <div>
      <div style={{display:'flex', alignItems:'center', gap:12, padding:'12px 16px 2px'}}>
        <div style={{flex:1, minWidth:0}}>
          <SegChips scroll value={coh} onChange={setCoh}
            options={[['all','All'],['Smart Money','Smart'],['Whale Moves','Whale'],['Rising Money','Rising']]}/>
        </div>
        <div style={{flexShrink:0}}><CompactSelector options={['Size','PnL']} value={sort==='upnl'?'PnL':'Size'} onChange={(v)=>setSort(v==='PnL'?'upnl':'expo')}/></div>
      </div>
      <ModuleSpacer h={8}/>
      <IvGroupHead title="In this market" sub={'Top 10 tracked wallets positioned in '+(m.sym||'')+' now — tap to open the trader.'}/>
      <div style={{padding:'0 16px 8px', display:'flex', alignItems:'center', gap:5, font:'500 11px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.4}}>PnL is unrealized — on the open position here; tap a trader for their realized record. <InfoTip d={trDef('pnlBasis')}/></div>
      <TrWallets m={m} sort={sort} coh={coh}/>
      <ModuleSpacer/>
      <IvGroupHead title="Cohort playbook" sub="Who each cohort is, and the settings you'd borrow — direction, leverage, entry, stop, take-profit."/>
      <TrPlaybook sig={sig} m={m}/>
      <DisclaimerFooter text="Wallets shown are tracked on-chain. Borrowed settings are observed/inferred aggregates, not a recommendation. You make all trading decisions."/>
    </div>
  );
}

Object.assign(window, { InstrumentTradersTab2 });
