/* ═══ ARX · Earn hub — unifies Rewards · Referrals · Contests under one roof ═══
   Additive sub-screen, opened via __arxOpenSub('earn'). Routes into the existing
   screens (rewards / rewards?tab=referrals / contests) — nothing is duplicated or
   removed, this is the single front door the audit asked for. */

const { useState: ehS } = React;

function EhCard({ icon, tint, title, sub, value, onClick }) {
  return (
    <button onClick={onClick} className="arx-row-press" style={{width:'100%', display:'flex', alignItems:'center', gap:13, padding:'15px 16px', textAlign:'left', cursor:'pointer',
      background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:16}}>
      <span style={{width:42, height:42, borderRadius:12, flexShrink:0, display:'inline-flex', alignItems:'center', justifyContent:'center', background:tint||'rgba(124,91,255,.12)', fontSize:20}}>{icon}</span>
      <div style={{flex:1, minWidth:0}}>
        <div style={{font:'700 14.5px var(--font-body)', color:'var(--text-primary)'}}>{title}</div>
        <div style={{font:'400 11.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>{sub}</div>
      </div>
      {value && <span style={{font:'700 12.5px var(--font-mono)', color:'var(--color-violet-500)', flexShrink:0}}>{value}</span>}
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><polyline points="9 6 15 12 9 18"/></svg>
    </button>
  );
}

function EarnHub({ onBack, onToast }) {
  const sub = (id, params)=> window.__arxOpenSub && window.__arxOpenSub(id, params);
  return (
    <SubShell title="Earn" onBack={onBack}>
      {/* points hero */}
      <div style={{margin:'6px 16px 4px', borderRadius:18, padding:18, color:'#fff', boxShadow:'var(--shadow-execute)',
        background:'linear-gradient(150deg, var(--color-violet-500), var(--color-violet-700))'}}>
        <div style={{font:'700 10px var(--font-body)', letterSpacing:'.08em', textTransform:'uppercase', color:'rgba(255,255,255,.74)'}}>Your $ARX points</div>
        <div className="num" style={{font:'800 34px var(--font-mono)', letterSpacing:'-.03em', lineHeight:1.1, marginTop:4}}>2,840</div>
        <div style={{display:'flex', alignItems:'center', gap:8, marginTop:8}}>
          <span style={{display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:999, background:'rgba(255,255,255,.16)', font:'700 11px var(--font-body)'}}>
            <span style={{width:7, height:7, borderRadius:'50%', background:'#9AA0AE'}}/>Silver tier
          </span>
          <span style={{font:'500 11px var(--font-body)', color:'rgba(255,255,255,.8)'}}>🔥 12-day streak</span>
        </div>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:9, padding:'12px 16px 8px'}}>
        <EhCard icon="🎁" title="Rewards & tiers" sub="Points, streak, redeem $ARX" value="2,840 pts" onClick={()=>sub('rewards',{tab:'rewards'})}/>
        <EhCard icon="👥" tint="rgba(45,212,155,.12)" title="Referrals" sub="Multi-level L1 · L2 · L3 · claim USDC" value="$142" onClick={()=>sub('rewards',{tab:'referrals'})}/>
        <EhCard icon="🏆" tint="rgba(251,191,36,.14)" title="Contests & campaigns" sub="World Cup · NBA · NVDA iPhone draw" value="2 live" onClick={()=>sub('contests')}/>
      </div>

      <div style={{margin:'8px 20px 0', font:'400 11.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>
        Every action on ARX earns $ARX points — copy a trader, trade daily, keep your streak, or refer a friend. Points climb your tier and unlock redeemable rewards.
      </div>
    </SubShell>
  );
}

Object.assign(window, { EarnHub });
