/* ═══ ARX · You — Batch 3 (Account zone · Trust & Safety · Emergency exit) ═══
   Folds the loose "Account & funding" list into the predictable Account home from
   YOU_IA_AUDIT/SPEC: Funding · Security · Help & support · Legal · Settings — plus
   the rare-but-critical trust surfaces (self-custody proof, revoke trading access,
   "why was I liquidated?", report an issue) and an Emergency exit (close-all).
   Time-critical surfaces open an inline explainer; the rest route to real sub-screens. */

const { useState: yaS } = React;

const YA_EXPLAIN = {
  custody: { t:'Your keys, your funds', b:'Arx never holds your money. Funds live in your own self-custody wallet on-chain — you can withdraw any time, and no one (not even Arx) can freeze or block it. Arx only ever holds permission to place trades on your behalf, which you can revoke instantly below.' },
  revoke: { t:'Revoke trading access', b:'This kills the agent-wallet\u2019s authority to open or cancel orders — immediately and on-chain. Your funds are untouched (they were never held); only the permission to trade for you is removed. Use this if a device is lost or anything looks wrong.' },
  liq: { t:'Why was I liquidated?', b:'A position is liquidated when its margin can no longer cover the loss at the mark price. Because execution is on-chain, every liquidation is verifiable — we show the mark price, your maintenance margin, and the exact block. There\u2019s no counterparty to dispute; the chain is the record. Open any liquidated position to see its attribution.' },
  report: { t:'Report an issue', b:'This opens a tracked ticket to a human (not a bot loop) — describe what happened and we follow up. For a suspicious trader or wallet, use the ⋯ menu on their profile to flag them into the copy-graph safety review.' },
  status: { t:'System status', b:'All systems operational. Hyperliquid execution, price feeds, and copy engine are live with no incidents in the last 24h. During any incident this banner turns amber with the affected component and an ETA.' },
};

function YaRow({ icon, label, value, tint, danger, onClick }) {
  return (
    <button onClick={onClick} className="arx-row-press" style={{width:'100%', display:'flex', alignItems:'center', gap:12, padding:'13px 16px', background:'none', border:'none', cursor:'pointer', textAlign:'left'}}>
      {icon && <span style={{width:30, height:30, borderRadius:9, flexShrink:0, display:'inline-flex', alignItems:'center', justifyContent:'center', background: danger?'rgba(242,106,106,.12)':(tint||'var(--glass-control-bg)')}}>{icon}</span>}
      <span style={{flex:1, font:'500 14.5px var(--font-body)', color: danger?'var(--regime-down-mid)':'var(--text-primary)'}}>{label}</span>
      {value && <span style={{font:'500 12.5px var(--font-body)', color:'var(--text-tertiary)'}}>{value}</span>}
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><polyline points="9 6 15 12 9 18"/></svg>
    </button>
  );
}
function YaGroup({ title, children }) {
  return (
    <div style={{margin:'4px 0 0'}}>
      <div style={{padding:'14px 20px 6px', font:'700 10.5px var(--font-body)', letterSpacing:'.06em', textTransform:'uppercase', color:'var(--text-tertiary)'}}>{title}</div>
      <div style={{margin:'0 16px', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:16, overflow:'hidden'}}>{children}</div>
    </div>
  );
}
function ico(d){ return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>; }

function YouAccountZone({ onToast }) {
  const [sheet, setSheet] = yaS(null);
  const go = (id)=> window.__arxOpenSub && window.__arxOpenSub(id);
  const ex = (k)=> setSheet(YA_EXPLAIN[k]);
  return (
    <div data-you-sec="account">
      <YaGroup title="Earn">
        <YaRow icon={<span style={{fontSize:16}}>🎁</span>} tint="rgba(124,91,255,.12)" label="Earn hub" value="2,840 pts" onClick={()=>go('earn')}/>
      </YaGroup>
      <YaGroup title="Funding & transfers">
        <YaRow icon={ico(<><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>)} label="Funding & transfers" value="Card · crypto" onClick={()=>go('funding')}/>
        <div style={{height:'.5px', background:'var(--border-default)', margin:'0 16px'}}/>
        <YaRow icon={<span style={{color:'var(--regime-up-mid)'}}>◉</span>} tint="rgba(45,212,155,.12)" label="Self-custody proof" value="Withdraw anytime" onClick={()=>ex('custody')}/>
      </YaGroup>

      <YaGroup title="Security">
        <YaRow icon={ico(<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>)} label="Passkeys & devices" value="2 active" onClick={()=>go('secureWallet')}/>
        <div style={{height:'.5px', background:'var(--border-default)', margin:'0 16px'}}/>
        <YaRow icon={ico(<><path d="M12 2 4 5v6c0 5 3.5 8 8 11 4.5-3 8-6 8-11V5z"/></>)} label="Key backup & recovery" value="Backed up" onClick={()=>go('secureWallet')}/>
        <div style={{height:'.5px', background:'var(--border-default)', margin:'0 16px'}}/>
        <YaRow icon={ico(<><path d="M18.36 6.64A9 9 0 1 1 5.64 6.64"/><line x1="12" y1="2" x2="12" y2="12"/></>)} danger label="Revoke trading access" onClick={()=>ex('revoke')}/>
      </YaGroup>

      <YaGroup title="Help & support">
        <YaRow icon={ico(<><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></>)} label="Why was I liquidated?" onClick={()=>ex('liq')}/>
        <div style={{height:'.5px', background:'var(--border-default)', margin:'0 16px'}}/>
        <YaRow icon={ico(<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>)} label="Report an issue" onClick={()=>ex('report')}/>
        <div style={{height:'.5px', background:'var(--border-default)', margin:'0 16px'}}/>
        <YaRow icon={<span style={{width:8, height:8, borderRadius:'50%', background:'var(--regime-up-mid)'}} className="arx-breath"/>} label="System status" value="Operational" onClick={()=>ex('status')}/>
        <div style={{height:'.5px', background:'var(--border-default)', margin:'0 16px'}}/>
        <YaRow icon={ico(<><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></>)} label="Contests & badges" value="2 live · 2 earned" onClick={()=>go('contests')}/>
      </YaGroup>

      <YaGroup title="Legal">
        <YaRow icon={ico(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></>)} label="Terms & risk disclosures" onClick={()=>onToast&&onToast('Terms · leverage & copy-risk disclosures')}/>
        <div style={{height:'.5px', background:'var(--border-default)', margin:'0 16px'}}/>
        <YaRow icon={ico(<><path d="M12 2 4 5v6c0 5 3.5 8 8 11 4.5-3 8-6 8-11V5z"/></>)} label="Privacy & data" onClick={()=>onToast&&onToast('Privacy policy · export or delete your data')}/>
      </YaGroup>

      <YaGroup title="Settings">
        <YaRow icon={ico(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>)} label="Preferences & display" value="Simple/Pro · language" onClick={()=>go('youSettings')}/>
        <div style={{height:'.5px', background:'var(--border-default)', margin:'0 16px'}}/>
        <YaRow icon={ico(<><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>)} label="Data sources" value="Live news · Lucid" onClick={()=>go('dataSources')}/>
      </YaGroup>

      {/* Emergency exit — persistent panic button (promoted in risk stage elsewhere) */}
      <div style={{margin:'18px 16px 4px'}}>
        <button onClick={()=>{ if(window.confirm) {} setSheet({ t:'Emergency exit — close everything?', b:'This flattens every open position at market, now. The close is submitted on-chain server-side, so it executes even if the app crashes or you lose signal. You can\u2019t undo it.', confirm:true }); }} className="arx-press" style={{width:'100%', height:48, borderRadius:14, cursor:'pointer', background:'rgba(242,106,106,.10)', border:'.5px solid rgba(242,106,106,.4)', color:'var(--regime-down-mid)', font:'700 14px var(--font-body)', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8}}>
          ⚠ Emergency exit · close all positions
        </button>
      </div>

      {/* explainer / confirm sheet */}
      {sheet && (
        <div onClick={()=>setSheet(null)} style={{position:'absolute', inset:0, zIndex:90, background:'rgba(6,6,16,.6)', display:'flex', alignItems:'flex-end', animation:'arx-fade-in .16s ease'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:'100%', background:'var(--surface-base)', borderRadius:'24px 24px 0 0', padding:'10px 22px calc(24px + env(safe-area-inset-bottom))', borderTop:'.5px solid var(--border-default)'}}>
            <div style={{width:38, height:4, borderRadius:99, background:'var(--border-strong)', margin:'4px auto 16px'}}/>
            <div style={{font:'800 18px var(--font-brand)', color:'var(--text-primary)', marginBottom:8}}>{sheet.t}</div>
            <div style={{font:'400 13.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.6}}>{sheet.b}</div>
            {sheet.confirm ? (
              <div style={{display:'flex', gap:10, marginTop:18}}>
                <button onClick={()=>setSheet(null)} style={{flex:1, height:48, borderRadius:13, border:'.5px solid var(--border-strong)', background:'transparent', color:'var(--text-primary)', font:'600 14px var(--font-body)', cursor:'pointer'}}>Cancel</button>
                <button onClick={()=>{ setSheet(null); onToast&&onToast('All positions closed at market'); }} style={{flex:1.4, height:48, borderRadius:13, border:'none', background:'var(--regime-down-mid)', color:'#fff', font:'700 14px var(--font-body)', cursor:'pointer'}}>Close everything</button>
              </div>
            ) : (
              <button onClick={()=>setSheet(null)} style={{width:'100%', height:48, borderRadius:13, marginTop:18, border:'none', background:'var(--color-violet-500)', color:'#fff', font:'700 14px var(--font-body)', cursor:'pointer'}}>Got it</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { YouAccountZone });
