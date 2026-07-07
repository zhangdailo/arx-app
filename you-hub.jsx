/* ═══ ARX · you-hub — the You-tab restructure (IA map §E) ═══
   Distributed entry points off the You money-home:
     · avatar  → ProfileScreen   (public trader card · the copy loop-closer)
     · gear ⚙  → SettingsScreen   (native inset-grouped list)
     · row     → RewardsScreen    (XP · referrals · airdrop · contests)
   Built on DS tokens + existing primitives (SubShell, IconChevron, Avatar,
   WalletAvatar, RegimePill, Badge, PrefToggleRow, useConfirmMethod, useAppLock). */

const { useState: yhS } = React;

/* spot holdings — cash/perp/spot money model (shared with You preview) */
const ARX_SPOT = [
  { sym:'SOL',  amt:'6.41',   px:'$191.20',  value:'$1,226.40', chg:'+4.2%', pos:true,  avg:'$168.30', ret:'+$147.60', retPct:'+13.7%', up:true },
  { sym:'HYPE', amt:'18.2',   px:'$36.43',   value:'$663.00',   chg:'+1.8%', pos:true,  avg:'$29.10',  ret:'+$133.38', retPct:'+25.2%', up:true },
  { sym:'BTC',  amt:'0.0061', px:'$93,540',  value:'$570.60',   chg:'−0.6%', pos:false, avg:'$98,200', ret:'−$28.42',  retPct:'−4.7%',  up:false },
];

/* gear glyph — settings entry */
function IconGear({ size = 20, color = 'var(--text-secondary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

/* ─── native inset-grouped list primitives (iOS Settings idiom) ─── */
function SgGroup({ header, footer, children }) {
  return (
    <div style={{margin:'0 0 6px'}}>
      {header && <div style={{padding:'var(--sp-md) var(--sp-md) var(--sp-2xs)', font:'600 12px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>{header}</div>}
      <div style={{margin:'0 var(--sp-md)', borderRadius:'var(--r-lg)', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', overflow:'hidden'}}>{children}</div>
      {footer && <div style={{padding:'var(--sp-xs) var(--sp-md) var(--sp-2xs)', font:'400 11.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.45}}>{footer}</div>}
    </div>
  );
}
function SgRow({ icon, label, value, danger, onClick, last }) {
  return (
    <button onClick={onClick} className="arx-row-press" style={{width:'100%', display:'flex', alignItems:'center', gap:'var(--sp-sm)', padding:'var(--sp-sm) var(--sp-md)',
      background:'none', border:'none', cursor:'pointer', textAlign:'left', borderTop: last===false?undefined:'.5px solid var(--border-default)'}}>
      {icon && <span style={{width:26, display:'flex', justifyContent:'center', color: danger?'var(--regime-down-mid)':'var(--text-secondary)'}}>{icon}</span>}
      <span style={{flex:1, font:'500 14.5px var(--font-body)', color: danger?'var(--regime-down-mid)':'var(--text-primary)'}}>{label}</span>
      {value!=null && <span style={{font:'500 12.5px var(--font-body)', color:'var(--text-tertiary)', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{value}</span>}
      {onClick && <IconChevron color="var(--text-tertiary)"/>}
    </button>
  );
}
function SgToggle({ label, sub, on, onToggle, last }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:'var(--sp-sm)', padding:'var(--sp-sm) var(--sp-md)', borderTop: last===false?undefined:'.5px solid var(--border-default)'}}>
      <div style={{flex:1}}>
        <div style={{font:'500 14.5px var(--font-body)', color:'var(--text-primary)'}}>{label}</div>
        {sub && <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>{sub}</div>}
      </div>
      <button onClick={onToggle} style={{width:46, height:28, borderRadius:14, border:'none', cursor:'pointer', position:'relative', flexShrink:0,
        background: on ? 'var(--regime-up-mid)' : 'var(--glass-control-bg)', transition:'background 200ms'}}>
        <span style={{position:'absolute', top:3, left: on ? 21 : 3, width:22, height:22, borderRadius:'50%', background:'#fff', boxShadow:'0 2px 6px rgba(0,0,0,.3)', transition:'left 220ms cubic-bezier(.32,.72,0,1)'}}/>
      </button>
    </div>
  );
}
function SgSegment({ value, options, onChange, width=132 }) {
  const idx = options.findIndex(o=>o[0]===value);
  return (
    <div style={{position:'relative', display:'flex', background:'var(--glass-control-bg)', borderRadius:9, padding:2, height:32, width}}>
      <div style={{position:'absolute', top:2, bottom:2, left:`calc(${idx*100/options.length}% + 2px)`, width:`calc(${100/options.length}% - 4px)`, background:'var(--surface-elevated)', borderRadius:7, boxShadow:'0 3px 8px rgba(0,0,0,.22)', transition:'left 260ms cubic-bezier(.32,.72,0,1)'}}/>
      {options.map(([id,l])=>(
        <button key={id} onClick={()=>onChange(id)} style={{flex:1, position:'relative', zIndex:1, background:'none', border:'none', cursor:'pointer', color: value===id?'var(--text-primary)':'var(--text-secondary)', font:`${value===id?700:500} 12px var(--font-body)`}}>{l}</button>
      ))}
    </div>
  );
}

/* ════════════ PROFILE · public trader card (the copy loop-closer) ════════════ */
function ProfileScreen({ onBack, onToast }) {
  const [win, setWin] = yhS('30D');
  const leaderStatus = (()=>{ try { return localStorage.getItem('arx-leader-status')||'none'; } catch(e){ return 'none'; } })();
  // self-consistent with YouScreen ($24,837 equity)
  const STATS = {
    '24H': { pnl:'+$1,204', pnlPos:true, ret:'+5.1%', retPos:true, dd:'−2.1%', cons:'8/9', liq:'0', win:'62%' },
    '7D':  { pnl:'+$3,820', pnlPos:true, ret:'+16.2%', retPos:true, dd:'−4.8%', cons:'29/41', liq:'0', win:'63%' },
    '30D': { pnl:'+$6,140', pnlPos:true, ret:'+32.8%', retPos:true, dd:'−7.4%', cons:'112/168', liq:'1', win:'61%' },
    '90D': { pnl:'−$420', pnlPos:false, ret:'−1.8%', retPos:false, dd:'−14.2%', cons:'300/502', liq:'3', win:'54%' },
  };
  const st = STATS[win];
  const perfInk = (typeof PERF_COLOR!=='undefined' && PERF_COLOR.smart_money) || 'var(--regime-up-mid)';
  const perfLabel = (typeof TAX!=='undefined' && TAX.smart_money && TAX.smart_money.label) || 'Smart Money';
  return (
    <SubShell title="Your profile" onBack={onBack}>
      {/* identity — mirrors wallet detail */}
      <div style={{display:'flex', alignItems:'center', gap:12, padding:'4px 20px 0'}}>
        {typeof PersonAvatar!=='undefined' ? <PersonAvatar seed="elon.musk" size={56} ring="var(--color-violet-500)"/> : <Avatar label="EM" size={56}/>}
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'flex', alignItems:'center', gap:7}}>
            <span style={{font:'700 20px var(--font-brand)', letterSpacing:'-.02em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>elon.musk</span>
            {typeof IdentityBadge!=='undefined' && <IdentityBadge id={{kind:'kol', verified:true}}/>}
          </div>
          <div style={{display:'flex', alignItems:'center', gap:8, marginTop:5, flexWrap:'wrap'}}>
            <a href="https://x.com/elonmusk" target="_blank" rel="noopener" style={{display:'inline-flex', alignItems:'center', gap:4, font:'600 12px var(--font-body)', color:'var(--color-violet-500)', textDecoration:'none'}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.3 8.3L23.3 22h-6.6l-5.2-6.8L5.6 22H2.5l7.8-8.9L1.1 2h6.8l4.7 6.2L18.9 2zm-1.2 18h1.8L7.4 3.9H5.5L17.7 20z"/></svg>
              @elonmusk
            </a>
            <span className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)'}}>0x4b2e…91ac</span>
          </div>
        </div>
      </div>
      {/* 3D wallet labels — performance · capital · style (same as wallet detail) */}
      <div style={{display:'flex', gap:6, padding:'13px 20px 0', flexWrap:'wrap'}}>
        <WdChip l={perfLabel} ink={perfInk} bg={perfInk+'22'}/>
        <WdChip l="Whale" ink="var(--text-secondary)" bg="var(--glass-control-bg)"/>
        <WdChip l="Swing" ink="var(--text-secondary)" bg="var(--glass-control-bg)"/>
      </div>
      {/* proof line — on-chain · age · trades · proof window · freshness */}
      <div style={{display:'flex', alignItems:'center', gap:7, padding:'9px 20px 0', flexWrap:'wrap', font:'500 11.5px var(--font-body)', color:'var(--text-tertiary)'}}>
        <span style={{display:'inline-flex', alignItems:'center', gap:4, color:'var(--regime-up-mid)'}}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>On-chain</span>
        <span style={{opacity:.45}}>·</span>
        <span className="num" style={{color:'var(--text-secondary)'}}>312d on chain</span>
        <span style={{opacity:.45}}>·</span>
        <span className="num" style={{color:'var(--text-secondary)'}}>502 trades</span>
        <span style={{opacity:.45}}>·</span>
        <span>90-day verified</span>
        <span style={{opacity:.45}}>·</span>
        <span>last trade 2h ago</span>
        <span style={{opacity:.45}}>·</span>
        <span>updated 12m ago</span>
      </div>

      {/* master time window — same control as wallet detail */}
      <div style={{margin:'14px 20px 0', padding:'11px 13px', borderRadius:12, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
          <span style={{font:'600 12px var(--font-body)', color:'var(--text-primary)'}}>Time window</span>
          <span style={{flex:1}}/>
          <div style={{display:'flex', background:'var(--glass-control-bg)', borderRadius:8, padding:2}}>
            {['24H','7D','30D','90D'].map(x => (
              <button key={x} onClick={()=>setWin(x)} className="num" style={{height:27, width:43, borderRadius:6, border:'none', cursor:'pointer', background: win===x?'var(--surface-modal, var(--surface-base))':'transparent', boxShadow: win===x?'0 2px 6px rgba(0,0,0,.2)':'none', color: win===x?'var(--text-primary)':'var(--text-tertiary)', font:(win===x?'700':'500')+' 11px var(--font-mono)', padding:0}}>{x}</button>
            ))}
          </div>
        </div>
        <div style={{font:'400 10px var(--font-body)', color:'var(--text-tertiary)', marginTop:7, lineHeight:1.4}}>Master control · realized PnL, return, win rate and consistency below reflect <b style={{color:'var(--text-secondary)'}}>{win}</b>.</div>
      </div>

      {/* topline — key metrics on the master window (same as wallet detail) */}
      <WdCard pad="14px 15px 4px">
        <div style={{display:'flex', alignItems:'center', gap:7}}>
          <span style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>Key metrics</span>
          <span className="num" style={{font:'600 10px var(--font-mono)', color:'var(--color-violet-700)', background:'rgba(124,91,255,.12)', padding:'2px 7px', borderRadius:6}}>{win}</span>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', marginTop:8}}>
          {[
            ['Realized PnL · '+win, st.pnl, st.pnlPos?'var(--regime-up-mid)':'var(--regime-down-mid)', 'after fees & funding'],
            ['Return · '+win, st.ret, st.retPos?'var(--regime-up-mid)':'var(--regime-down-mid)', 'on account equity'],
            ['Win rate · '+win, st.win, 'var(--text-primary)', 'profitable trades'],
            ['Max drawdown · '+win, st.dd, 'var(--regime-down-mid)', 'worst peak-to-trough'],
            ['Consistency · '+win, st.cons, 'var(--text-primary)', 'profitable days'],
            ['Liquidations · 90d', st.liq, st.liq==='0'?'var(--regime-up-mid)':'var(--text-primary)', 'forced closes'],
          ].map(([k,v,c,sub],i)=>(
            <div key={k} style={{padding:'10px 0 12px', paddingLeft: i%2?14:0, borderLeft: i%2?'.5px solid var(--border-default)':'none', borderTop: i>1?'.5px solid var(--border-default)':'none', minWidth:0}}>
              <div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em', whiteSpace:'nowrap'}}>{k}</div>
              <div className="num" style={{font:'700 20px var(--font-mono)', letterSpacing:'-.02em', marginTop:3, color:c, whiteSpace:'nowrap'}}>{v}</div>
              <div style={{font:'400 9.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:2, whiteSpace:'nowrap'}}>{sub}</div>
            </div>
          ))}
        </div>
        <div style={{padding:'8px 0 4px', marginTop:4, font:'400 10px var(--font-body)', color:'var(--text-tertiary)', borderTop:'.5px solid var(--border-default)'}}>Based on on-chain data · before fees. Performance and labels are earned — read-only.</div>
      </WdCard>

      {/* reach — same card language */}
      <WdCard>
        <WdH>Your reach</WdH>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', marginTop:2}}>
          {[['Followers','128','var(--text-primary)'],['Copiers','12','var(--text-primary)'],['Follower outcome','+$8,420','var(--regime-up-mid)']].map(([k,v,c],i)=>(
            <div key={k} style={{padding:'4px 0', paddingLeft:i?12:0, borderLeft:i?'.5px solid var(--border-default)':'none', minWidth:0}}>
              <div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em', whiteSpace:'nowrap'}}>{k}</div>
              <div className="num" style={{font:'700 18px var(--font-mono)', letterSpacing:'-.01em', marginTop:3, color:c, whiteSpace:'nowrap'}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{font:'400 10px var(--font-body)', color:'var(--text-tertiary)', marginTop:10, lineHeight:1.45}}>Anyone can copy your wallet — no approval needed. Followers watch; copiers mirror your trades with their own capital.</div>
      </WdCard>
      <div style={{margin:'10px 20px 2px', font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)'}}>Copying does not guarantee profits. Copiers allocate their own capital and set their own guardrails.</div>

      {/* on-chain identity */}
      <SectionHeader>On-chain identity</SectionHeader>
      <SgGroup>
        <SgRow label="Wallet address" value="0x4b2e…91ac" onClick={()=>onToast('Address copied')} last={false}/>
        <SgRow label="Show QR code" onClick={()=>window.__arxOpenSub && window.__arxOpenSub('profileQR')}/>
        <SgRow label="View on explorer" onClick={()=>(function(){ try{ window.open('https://hyperevmscan.io/address/0x4b2e','_blank'); }catch(e){} onToast('Opening explorer'); })()}/>
        <SgRow label="Connected wallets" value="1 · self-custody" onClick={()=>window.__arxOpenSub && window.__arxOpenSub('connectedWallets')}/>
      </SgGroup>

      <div style={{position:'sticky', bottom:0, display:'flex', gap:10, padding:'12px 16px calc(12px + env(safe-area-inset-bottom))', background:'linear-gradient(to top, var(--surface-base) 72%, transparent)', zIndex:5}}>
        <button onClick={()=>window.__arxOpenSub && window.__arxOpenSub('editProfile',{w:{addr:'0x4b2e…91ac'}})} className="arx-press" style={{flex:1, height:46, borderRadius:12, cursor:'pointer', background:'var(--surface-elevated)', border:'.5px solid var(--border-strong)', color:'var(--text-primary)', font:'600 14px var(--font-body)'}}>Edit profile</button>
        <button onClick={()=>window.__arxOpenSub && window.__arxOpenSub('trackCard')} className="arx-press" style={{flex:1, height:46, borderRadius:12, cursor:'pointer', background:'var(--color-violet-500)', border:'none', color:'#fff', font:'700 14px var(--font-body)'}}>Share</button>
      </div>
    </SubShell>
  );
}

/* ════════════ REWARDS · points · tiers · streak · redeem · airdrop ════════════ */
const RW_TIERS = [['Bronze',0],['Silver',2000],['Gold',4000],['Diamond',8000]];
function RewardsScreen({ onBack, onToast }) {
  const pts = 2840;
  const ti = RW_TIERS.reduce((acc,t,i)=> pts>=t[1]?i:acc, 0);
  const cur = RW_TIERS[ti], next = RW_TIERS[ti+1];
  const tierPct = next ? (pts-cur[1])/(next[1]-cur[1]) : 1;
  const STREAK = 12, claimedToday = false;
  return (
    <SubShell title="Rewards" onBack={onBack}>
      {/* points hero + tier ladder */}
      <div style={{margin:'4px 16px 6px', padding:18, borderRadius:16, background:'linear-gradient(135deg, rgba(124,91,255,.20), rgba(124,91,255,.04))', border:'.5px solid rgba(124,91,255,.30)'}}>
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between'}}>
          <span style={{font:'600 11px var(--font-body)', color:'var(--color-violet-300)', textTransform:'uppercase', letterSpacing:'.06em'}}>$ARX points</span>
          <span style={{font:'600 11px var(--font-body)', color:'var(--text-tertiary)'}}>{cur[0]} tier</span>
        </div>
        <div className="num" style={{font:'700 36px var(--font-mono)', letterSpacing:'-.02em', marginTop:6}}>{pts.toLocaleString()} <span style={{font:'600 16px var(--font-mono)', color:'var(--text-tertiary)'}}>pts</span></div>
        <div style={{marginTop:14}}>
          <div style={{position:'relative', height:8, borderRadius:4, background:'var(--glass-control-bg)', overflow:'hidden'}}><div style={{height:'100%', width:`${Math.round(tierPct*100)}%`, borderRadius:4, background:'var(--color-violet-500)'}}/></div>
          <div style={{display:'flex', justifyContent:'space-between', marginTop:10}}>
            {RW_TIERS.map((t,i)=>(
              <div key={t[0]} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:3}}>
                <span style={{width:9, height:9, borderRadius:'50%', background: i<=ti?'var(--color-violet-500)':'var(--glass-control-bg)', border:'.5px solid '+(i<=ti?'var(--color-violet-500)':'var(--border-strong)')}}/>
                <span style={{font:`${i===ti?700:500} 10px var(--font-body)`, color: i===ti?'var(--color-violet-300)':'var(--text-tertiary)'}}>{t[0]}</span>
              </div>
            ))}
          </div>
          {next && <div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:8, textAlign:'center'}}>{(next[1]-pts).toLocaleString()} pts to {next[0]}</div>}
        </div>
      </div>

      {/* daily streak + 7-day claim grid */}
      <SectionHeader>Daily streak</SectionHeader>
      <div style={{margin:'0 16px 6px', padding:16, borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:12}}>
          <span className="num" style={{font:'700 20px var(--font-mono)', color:'var(--color-violet-300)'}}>{STREAK}<span style={{font:'600 12px var(--font-body)', color:'var(--text-tertiary)'}}>-day</span></span>
          <span style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)'}}>+10 pts / day kept</span>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6}}>
          {Array.from({length:7}).map((_,i)=>{ const done=i<5, today=i===5;
            return (
              <div key={i} style={{aspectRatio:'1', borderRadius:10, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2,
                background: done?'color-mix(in oklab, var(--color-violet-500) 16%, transparent)':(today?'var(--color-violet-500)':'var(--glass-control-bg)'),
                border:'.5px solid '+(done||today?'transparent':'var(--border-default)')}}>
                <span style={{font:'700 11px var(--font-body)', color: today?'#fff':(done?'var(--color-violet-300)':'var(--text-tertiary)')}}>{done?'✓':'+10'}</span>
                <span style={{font:'500 9px var(--font-body)', color: today?'rgba(255,255,255,.8)':'var(--text-tertiary)'}}>D{i+1}</span>
              </div>
            );
          })}
        </div>
        <button onClick={()=>onToast(claimedToday?'Already claimed today':'+10 pts claimed · streak kept')} className="arx-press" style={{marginTop:12, height:42, width:'100%', borderRadius:12, border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'700 13px var(--font-body)'}}>Claim today · +10 pts</button>
      </div>

      <SectionHeader>Ways to earn</SectionHeader>
      <SgGroup>
        {[['Copy a trader','+50 pts'],['Daily trade','+20 pts'],['Keep the streak','+10 pts / day'],['Refer a friend','+200 pts']].map(([k,v],i)=>(
          <div key={k} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 15px', borderTop:i===0?undefined:'.5px solid var(--border-default)'}}>
            <span style={{flex:1, font:'500 14px var(--font-body)'}}>{k}</span>
            <span style={{font:'600 12px var(--font-body)', color:'var(--color-violet-300)'}}>{v}</span>
          </div>
        ))}
      </SgGroup>

      {/* redeem catalog */}
      <SectionHeader>Redeem $ARX points</SectionHeader>
      <SgGroup footer="Points are redeemed at claim; tiers unlock as you rank up. Prototype catalog.">
        {[['Fee rebate · 7 days','1,000 pts',true],['$25 trading credit','2,500 pts',true],['Pro analytics · 30 days','4,000 pts',false],['Custom wallet badge','6,000 pts',false],['$100 trading credit','8,000 pts',false]].map(([k,v,ok],i)=>(
          <button key={k} onClick={()=>onToast(ok?(k+' — redeem flow (prototype)'):'Earn more points to unlock')} className="arx-row-press" style={{width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 15px', background:'none', border:'none', borderTop:i===0?undefined:'.5px solid var(--border-default)', cursor:'pointer', textAlign:'left', opacity: ok?1:0.55}}>
            <span style={{flex:1, font:'500 14px var(--font-body)', color:'var(--text-primary)'}}>{k}</span>
            <span className="num" style={{font:'600 12px var(--font-mono)', color: ok?'var(--color-violet-300)':'var(--text-tertiary)'}}>{v}</span>
            <IconChevron color="var(--text-tertiary)" size={14}/>
          </button>
        ))}
      </SgGroup>

      {/* airdrop */}
      <SectionHeader>Token & airdrop</SectionHeader>
      <div style={{margin:'0 16px 6px', padding:16, borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <div style={{flex:1}}>
            <div style={{font:'600 14px var(--font-body)'}}>Airdrop eligibility</div>
            <div style={{font:'400 11.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:3}}>Check your wallet against the snapshot. Claim on-chain if eligible.</div>
          </div>
          <Badge tone="violet">Soon</Badge>
        </div>
        <button onClick={()=>onToast('Eligibility check — prototype')} className="arx-press" style={{marginTop:12, height:42, width:'100%', borderRadius:11, cursor:'pointer', background:'var(--surface-base)', border:'.5px solid var(--border-strong)', color:'var(--text-primary)', font:'700 13px var(--font-body)'}}>Check eligibility</button>
      </div>

      <SectionHeader>More</SectionHeader>
      <SgGroup footer="Contests rank by PnL % on equal terms. No entry fees.">
        <SgRow label="Quests" value="3 active" onClick={()=>onToast('Quests — complete tasks for bonus XP (prototype)')} last={false}/>
        <SgRow label="Contests" value="2 live" onClick={()=>window.__arxOpenSub && window.__arxOpenSub('contests')}/>
        <SgRow label="Badges" value="2 earned" onClick={()=>window.__arxOpenSub && window.__arxOpenSub('badges')}/>
      </SgGroup>
      <div style={{height:26}}/>
    </SubShell>
  );
}

/* ════════════ REFERRALS · multi-level L1/L2/L3 · claimable USDC ════════════ */
const REF_CODE = 'ARX-GARY';
const REF_LEVELS = [
  { id:'L1', name:'Direct', cut:'30%', count:8,  usd:312.50, accent:'var(--color-violet-500)',
    people:[['@degenmike','30%',84.20],['@solqueen','30%',61.40],['@maxi_eth','30%',52.10],['@0xverde','30%',44.80],['@chartwizard','30%',38.00],['@nightowl','30%',18.00],['@pumpfan','30%',8.40],['@hodlsteve','30%',5.60]] },
  { id:'L2', name:'Indirect', cut:'5%', count:24, usd:86.20, accent:'var(--color-violet-300)',
    people:[['@anon_4471','5%',14.20],['@lev10life','5%',11.80],['@gmgmgm','5%',9.40],['+21 more','5%',50.80]] },
  { id:'L3', name:'Network', cut:'2%', count:61, usd:41.10, accent:'#5FA8C9',
    people:[['@cryptoكarl','2%',6.10],['@yieldhunter','2%',4.40],['+59 more','2%',30.60]] },
];
function RefSpark({ pts, color }){
  const max=Math.max(...pts), min=Math.min(...pts), rng=max-min||1, W=58, H=22;
  const d=pts.map((v,i)=>(i?'L':'M')+(i/(pts.length-1)*W).toFixed(1)+','+(H-((v-min)/rng)*H).toFixed(1)).join(' ');
  return <svg width={W} height={H} style={{display:'block'}}><path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
/* faux-QR — deterministic module grid + centre a-mark (decorative scan target for the invite card) */
function InviteQR({ size=92, fg='#0c1024', bg='#ffffff' }){
  const N=15, cell=size/N;
  let s=20260626; const rnd=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
  const finder=(x,y)=>(x<7&&y<7)||(x>=N-7&&y<7)||(x<7&&y>=N-7);
  const rects=[];
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){ if(finder(x,y))continue; if(rnd()>0.5) rects.push(<rect key={x+'-'+y} x={(x*cell).toFixed(1)} y={(y*cell).toFixed(1)} width={cell.toFixed(2)} height={cell.toFixed(2)} fill={fg}/>); }
  const mark=(ox,oy)=>(<g key={ox+'f'+oy}><rect x={ox*cell} y={oy*cell} width={cell*7} height={cell*7} fill={fg}/><rect x={(ox+1)*cell} y={(oy+1)*cell} width={cell*5} height={cell*5} fill={bg}/><rect x={(ox+2)*cell} y={(oy+2)*cell} width={cell*3} height={cell*3} fill={fg}/></g>);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display:'block', borderRadius:7}}>
      <rect width={size} height={size} fill={bg}/>
      {rects}{mark(0,0)}{mark(N-7,0)}{mark(0,N-7)}
      <rect x={size/2-cell*1.7} y={size/2-cell*1.7} width={cell*3.4} height={cell*3.4} rx={cell*0.8} fill={bg}/>
      <rect x={size/2-cell*1.1} y={size/2-cell*1.1} width={cell*2.2} height={cell*2.2} rx={cell*0.6} fill="#7C5BFF"/>
    </svg>
  );
}
/* Share invite — a beautiful invite card (member · warm line · code · QR) you send to friends */
function ShareInvite({ onClose, onToast }){
  const R = (typeof window.EARN_REFERRAL!=='undefined') ? window.EARN_REFERRAL : { code:'ARX-GARY', accent:'#9CB0F5' };
  const ME = (typeof window.EARN_ME!=='undefined') ? window.EARN_ME : { name:'Gary Tan', seed:'elon.musk' };
  const first = (ME.name||'Gary').split(' ')[0];
  const A = R.accent || '#9CB0F5';
  return (
    <GlassSheet onClose={onClose}>
      <div style={{padding:'4px 18px calc(20px + env(safe-area-inset-bottom))'}}>
        <div style={{font:'700 17px var(--font-brand)', color:'var(--text-primary)', textAlign:'center', marginBottom:14}}>Invite a friend</div>
        <div style={{position:'relative', borderRadius:22, overflow:'hidden', padding:'22px 22px 20px', background:'linear-gradient(150deg, #1e2450, #0b0e20)', boxShadow:'0 16px 40px rgba(0,0,0,.4), inset 0 0 0 .5px rgba(255,255,255,.12)'}}>
          <span style={{position:'absolute', width:'72%', height:'74%', right:'-16%', top:'-24%', borderRadius:'50%', background:`radial-gradient(circle, ${A}55, transparent 64%)`, filter:'blur(20px)'}}/>
          <div style={{position:'relative', display:'flex', alignItems:'center', gap:11, marginBottom:15}}>
            {typeof window.PersonAvatar!=='undefined'
              ? <span style={{borderRadius:'50%', overflow:'hidden', boxShadow:`0 0 0 2px ${A}88`}}><window.PersonAvatar seed={ME.seed} size={42}/></span>
              : <span style={{width:42, height:42, borderRadius:'50%', background:A}}/>}
            <div>
              <div style={{font:'700 16px var(--font-brand)', color:'#fff'}}>{first} invites you to Arx</div>
              <div style={{font:'500 11px var(--font-body)', color:'rgba(255,255,255,.6)', marginTop:2}}>Copy-trade proven wallets · keep your own keys</div>
            </div>
          </div>
          <div style={{position:'relative', font:'500 13px var(--font-body)', color:'rgba(255,255,255,.86)', lineHeight:1.5, marginBottom:18}}>“I trade on Arx — the cleanest way to follow smart money. Join with my code and we both get a fee credit.”</div>
          <div style={{position:'relative', display:'flex', alignItems:'flex-end', gap:14}}>
            <div style={{flex:1, minWidth:0}}>
              <div style={{font:'500 9px var(--font-mono)', color:'rgba(255,255,255,.5)', letterSpacing:'.18em'}}>INVITE CODE</div>
              <div className="num" style={{font:'700 23px var(--font-mono)', color:'#fff', letterSpacing:'.1em', marginTop:3}}>{R.code}</div>
              <div className="num" style={{font:'500 10px var(--font-mono)', color:A, marginTop:9, letterSpacing:'.02em'}}>arx.app/r/{R.code}</div>
            </div>
            <div style={{background:'#fff', padding:7, borderRadius:11, boxShadow:'0 4px 14px rgba(0,0,0,.3)', flexShrink:0}}><InviteQR size={88}/></div>
          </div>
        </div>
        <div style={{display:'flex', gap:10, marginTop:16}}>
          <button onClick={()=>onToast('Invite link copied · arx.app/r/'+R.code)} className="arx-press" style={{flex:1, height:46, borderRadius:13, cursor:'pointer', background:'var(--surface-elevated)', border:'.5px solid var(--border-strong)', font:'600 13px var(--font-body)', color:'var(--text-primary)'}}>Copy link</button>
          <button onClick={()=>onToast('Sharing your invite card (prototype)')} className="arx-press" style={{flex:1, height:46, borderRadius:13, border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'700 14px var(--font-body)', display:'flex', alignItems:'center', justifyContent:'center', gap:7}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M16 6l-4-4-4 4M12 2v14"/></svg>Share card</button>
        </div>
        <div style={{font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', textAlign:'center', marginTop:12, lineHeight:1.5}}>You earn 30% of their fees, plus 5% and 2% deeper. They start with a fee credit. Rewards paid in USDC.</div>
      </div>
    </GlassSheet>
  );
}
function ReferralsScreen({ onBack, onToast }) {
  const [claimed, setClaimed] = yhS(()=>{ try{ return localStorage.getItem('arx-ref-claimed')==='1'; }catch(e){ return false; } });
  const [per, setPer] = yhS('30D');
  const [openLvl, setOpenLvl] = yhS(null);
  const [share, setShare] = yhS(false);
  const claimable = 128.40, lifetime = 1284.60, active30 = 17, joined = 76, refTotal = REF_LEVELS.reduce((a,l)=>a+l.count,0);
  const milestone = 100, milePct = Math.min(1, refTotal/milestone);
  const sparks = { L1:[4,5,5,7,6,8,9], L2:[2,2,3,3,4,4,5], L3:[1,1,2,2,2,3,3] };
  const claim = ()=>{ setClaimed(true); try{ localStorage.setItem('arx-ref-claimed','1'); }catch(e){} onToast('$'+claimable.toFixed(2)+' USDC claimed'); };
  return (
    <SubShell title="Referrals" onBack={onBack}>
      {/* full membership-style referral card — the brand identity for this bucket */}
      {typeof ReferralCard!=='undefined' && (
        <div style={{margin:'4px 16px 12px'}}>
          {typeof EarnCardStyles!=='undefined' && <EarnCardStyles/>}
          <ReferralCard styleKey={typeof earnStyleKey!=='undefined'?earnStyleKey():'metal'} onOpen={()=>onToast('Referral code ARX-GARY copied')}/>
        </div>
      )}
      {/* claimable hero */}
      <div style={{margin:'4px 16px 6px', padding:18, borderRadius:16, background:'linear-gradient(135deg, rgba(124,91,255,.20), rgba(124,91,255,.04))', border:'.5px solid rgba(124,91,255,.30)'}}>
        <span style={{font:'600 11px var(--font-body)', color:'var(--color-violet-300)', textTransform:'uppercase', letterSpacing:'.06em'}}>Claimable</span>
        <div className="num" style={{font:'700 34px var(--font-mono)', letterSpacing:'-.02em', marginTop:4}}>${claimable.toFixed(2)} <span style={{font:'600 15px var(--font-mono)', color:'var(--text-tertiary)'}}>USDC</span></div>
        {claimed
          ? <div style={{marginTop:12, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--surface-base)', border:'.5px solid var(--border-strong)', font:'600 12px var(--font-body)', color:'var(--text-tertiary)'}}>Claimed · next payout tomorrow 00:00 UTC</div>
          : <button onClick={claim} className="arx-press" style={{marginTop:12, height:44, width:'100%', borderRadius:12, border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'700 14px var(--font-body)'}}>Claim ${claimable.toFixed(2)} USDC</button>}
      </div>

      {/* joined vs invited + lifetime */}
      <div style={{margin:'6px 16px', display:'flex', gap:10}}>
        {[['Joined',joined,'var(--regime-up-mid)'],['Invited',refTotal,'var(--text-primary)'],['Lifetime','$'+lifetime.toLocaleString(),'var(--regime-up-mid)']].map(([k,v,c])=>(
          <div key={k} style={{flex:1, padding:'12px 13px', borderRadius:14, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
            <div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.04em'}}>{k}</div>
            <div className="num" style={{font:'700 17px var(--font-mono)', color:c, marginTop:4}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{margin:'-1px 16px 4px', font:'400 11px var(--font-body)', color:'var(--text-tertiary)'}}>{refTotal-joined} invited haven’t funded yet — nudge them to unlock your cut.</div>

      {/* multi-level structure — tap a level to see its referrals */}
      <SectionHeader>Your network</SectionHeader>
      <div style={{margin:'0 16px 6px', borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', overflow:'hidden'}}>
        {REF_LEVELS.map((l,i)=>(
          <div key={l.id} style={{borderTop:i?'.5px solid var(--border-default)':'none'}}>
            <button onClick={()=>setOpenLvl(openLvl===l.id?null:l.id)} className="arx-row-press" style={{width:'100%', display:'flex', alignItems:'center', gap:12, padding:'13px 15px', background:'none', border:'none', cursor:'pointer', textAlign:'left'}}>
              <span style={{width:32, height:32, borderRadius:9, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'color-mix(in oklab, '+l.accent+' 16%, transparent)', font:'700 11px var(--font-body)', color:l.accent}}>{l.id}</span>
              <div style={{flex:1, minWidth:0}}>
                <div style={{font:'600 13px var(--font-body)', color:'var(--text-primary)'}}>{l.name} <span style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)'}}>· {l.cut} cut</span></div>
                <div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>{l.count} referrals</div>
              </div>
              <span className="num" style={{font:'700 13px var(--font-mono)', color:'var(--regime-up-mid)'}}>+${l.usd.toFixed(2)}</span>
              <span style={{fontSize:8, color:'var(--text-tertiary)', transition:'transform .2s', transform:openLvl===l.id?'rotate(180deg)':'none'}}>▼</span>
            </button>
            {openLvl===l.id && (
              <div className="arx-arrive" style={{padding:'0 15px 12px'}}>
                {l.people.map(([nm,pct,usd],pi)=>(
                  <div key={pi} style={{display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderTop:'.5px solid var(--border-default)'}}>
                    <span style={{flex:1, font:'500 12px var(--font-body)', color:'var(--text-secondary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{nm}</span>
                    <span style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)'}}>{pct}</span>
                    <span className="num" style={{font:'600 12px var(--font-mono)', color:'var(--regime-up-mid)', width:64, textAlign:'right'}}>+${usd.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* by-tier earnings + period toggle */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'2px 20px 8px'}}>
        <span style={{font:'600 11px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>By tier</span>
        <SgSegment value={per} options={[['1D','1D'],['7D','7D'],['30D','30D']]} onChange={setPer} width={150}/>
      </div>
      <div style={{margin:'0 16px 6px', borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', overflow:'hidden'}}>
        {REF_LEVELS.map((l,i)=>{ const mult = per==='1D'?0.05:per==='7D'?0.3:1; return (
          <div key={l.id} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 15px', borderTop:i?'.5px solid var(--border-default)':'none'}}>
            <span style={{width:7, height:7, borderRadius:2, background:l.accent, flexShrink:0}}/>
            <span style={{flex:1, font:'500 13px var(--font-body)', color:'var(--text-primary)'}}>{l.id} · {l.name}</span>
            <RefSpark pts={sparks[l.id]} color={l.accent}/>
            <span className="num" style={{font:'700 13px var(--font-mono)', color:'var(--regime-up-mid)', width:66, textAlign:'right'}}>+${(l.usd*mult).toFixed(0)}</span>
          </div>
        ); })}
      </div>

      {/* milestone */}
      <div style={{margin:'6px 16px', padding:16, borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:8}}>
          <span style={{font:'600 12px var(--font-body)', color:'var(--text-primary)'}}>$0-fee swaps</span>
          <span className="num" style={{font:'600 12px var(--font-mono)', color:'var(--text-tertiary)'}}>{refTotal} / {milestone}</span>
        </div>
        <div style={{height:8, borderRadius:4, background:'var(--glass-control-bg)', overflow:'hidden'}}><div style={{height:'100%', width:`${Math.round(milePct*100)}%`, borderRadius:4, background:'var(--color-violet-500)'}}/></div>
        <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:8}}>Unlock lifetime zero-fee swaps at {milestone} total referrals.</div>
      </div>
      <div style={{height:80}}/>

      {share && <ShareInvite onClose={()=>setShare(false)} onToast={onToast}/>}
      {/* sticky copy-link + share */}
      <div style={{position:'sticky', bottom:0, padding:'12px 16px calc(12px + env(safe-area-inset-bottom))', background:'linear-gradient(to top, var(--surface-base) 70%, transparent)', display:'flex', gap:10}}>
        <button onClick={()=>onToast('Code '+REF_CODE+' copied')} className="arx-press" style={{flex:1, height:46, borderRadius:13, cursor:'pointer', background:'var(--surface-elevated)', border:'.5px solid var(--border-strong)', display:'flex', alignItems:'center', justifyContent:'center', gap:8, font:'600 13px var(--font-body)', color:'var(--text-primary)'}}>
          <span className="num" style={{letterSpacing:'.04em'}}>{REF_CODE}</span><span style={{font:'700 12px var(--font-body)', color:'var(--color-violet-500)'}}>Copy</span>
        </button>
        <button onClick={()=>setShare(true)} className="arx-press" style={{flex:1, height:46, borderRadius:13, border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'700 14px var(--font-body)'}}>Share & earn</button>
      </div>
    </SubShell>
  );
}

/* ════════════ SETTINGS · native inset-grouped hub (gear ⚙) ════════════ */
/* ════════════ FAQ ════════════ */
function FaqScreen({ onBack }){
  const FAQ = [
    ['Funding & withdrawals', [
      ['How do I add funds?','Add funds by card, Apple Pay or crypto — from $50. Onramper routes you to the cheapest provider for your region.'],
      ['How fast are withdrawals?','On-chain withdrawals settle in minutes. Your funds sit in your own wallet — nothing for Arx to process or block.'],
    ]],
    ['Copy trading', [
      ['How does copying work?','You mirror a proven wallet’s trades at your own size, inside guardrails you set — a loss limit, leverage cap and per-trade size. Pause anytime.'],
      ['Does copying guarantee profit?','No. Copying does not guarantee profits — you may lose some or all of your capital.'],
    ]],
    ['Liquidations', [
      ['Why was I liquidated?','A position is liquidated when its margin can no longer cover losses. Arx prices liquidations off the on-chain mark price — every one is verifiable on-chain.'],
      ['How do I avoid it?','Watch your liquidation distance, keep leverage modest, and set a Maintenance buffer (Settings › Margin & balances) to auto-reduce before liquidation.'],
    ]],
  ];
  const [open, setOpen] = yhS('0-0');
  return (
    <SubShell title="FAQ" onBack={onBack}>
      {FAQ.map(([sec, qs], si)=>(
        <div key={si}>
          <SectionHeader>{sec}</SectionHeader>
          <div style={{margin:'0 16px 6px', borderRadius:14, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', overflow:'hidden'}}>
            {qs.map(([q,a],qi)=>{ const id=si+'-'+qi; const isOpen=open===id;
              return (
              <div key={qi} style={{borderTop:qi?'.5px solid var(--border-default)':'none'}}>
                <button onClick={()=>setOpen(isOpen?null:id)} className="arx-row-press" style={{width:'100%', display:'flex', alignItems:'center', gap:10, padding:'13px 15px', background:'none', border:'none', cursor:'pointer', textAlign:'left'}}>
                  <span style={{flex:1, font:'600 13.5px var(--font-body)', color:'var(--text-primary)'}}>{q}</span>
                  <span style={{fontSize:9, color:'var(--text-tertiary)', transition:'transform .2s', transform:isOpen?'rotate(180deg)':'none'}}>▼</span>
                </button>
                {isOpen && <div className="arx-arrive" style={{padding:'0 15px 13px', font:'400 12.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.55}}>{a}</div>}
              </div>
            );})}
          </div>
        </div>
      ))}
      <div style={{padding:'10px 20px 30px', font:'400 11px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>Still stuck? Report an issue from You › Help &amp; support and a person will get back to you.</div>
    </SubShell>
  );
}

function RevealSecret({ kind, onClose, onToast }){
  const isPhrase = kind==='phrase';
  const [authed, setAuthed] = React.useState(false);
  const [shown, setShown] = React.useState(false);
  const [ack, setAck] = React.useState(false);
  const WORDS = ['violet','harbor','signal','ledger','copper','mirror','tundra','almond','rocket','pledge','satin','umbra'];
  const KEY = '0xa3f9c2e1b87d4506f1aa92cc73be20d4e5f6079a1c2b3d4e5f60718293a4b5c6';
  const copy = () => { try{ navigator.clipboard && navigator.clipboard.writeText(isPhrase?WORDS.join(' '):KEY); }catch(e){} onToast((isPhrase?'Recovery phrase':'Private key')+' copied — store it offline, then clear your clipboard'); };
  return (
    <GlassSheet onClose={onClose}>
      <div style={{padding:'6px 22px 26px'}}>
        <div style={{font:'700 18px var(--font-body)', marginBottom:4}}>{isPhrase?'Recovery phrase':'Private key'}</div>
        <div style={{font:'400 12.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5, marginBottom:16}}>{isPhrase?'These 12 words restore your wallet on any device. Anyone who has them controls your funds. Arx never sees them and cannot recover them for you.':'This key controls your wallet directly. Anyone who has it can move your funds. Arx never sees it and cannot recover it for you.'}</div>
        {!authed ? (<>
          <div style={{display:'flex', gap:10, alignItems:'flex-start', padding:'12px 13px', borderRadius:13, background:'rgba(255,77,106,.07)', border:'.5px solid rgba(255,77,106,.24)', marginBottom:16}}>
            <span style={{marginTop:1, color:'var(--regime-down-mid)', flexShrink:0, display:'flex'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>
            <div style={{font:'500 11.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.45}}>Make sure no one is watching your screen. Never type this into a website or paste it into chat — that is how wallets get drained.</div>
          </div>
          <button onClick={()=>setAuthed(true)} className="arx-press" style={{width:'100%', height:48, borderRadius:13, border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'700 14px var(--font-body)', display:'flex', alignItems:'center', justifyContent:'center', gap:8}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Authenticate with Face ID</button>
        </>) : (<>
          <div onPointerDown={()=>setShown(true)} onPointerUp={()=>setShown(false)} onPointerLeave={()=>setShown(false)} style={{position:'relative', padding:16, borderRadius:14, background:'var(--surface-base)', border:'.5px solid var(--border-default)', userSelect:'none', cursor:'pointer', minHeight:isPhrase?138:70}}>
            {isPhrase ? (
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 14px', filter:shown?'none':'blur(7px)', transition:'filter 120ms'}}>{WORDS.map((w,i)=>(<div key={i} style={{display:'flex', gap:7, alignItems:'baseline'}}><span style={{font:'600 10px var(--font-mono)', color:'var(--text-tertiary)', width:14}}>{i+1}</span><span style={{font:'600 13px var(--font-mono)', color:'var(--text-primary)'}}>{w}</span></div>))}</div>
            ) : (
              <div style={{font:'600 12.5px var(--font-mono)', color:'var(--text-primary)', wordBreak:'break-all', lineHeight:1.7, filter:shown?'none':'blur(7px)', transition:'filter 120ms'}}>{KEY}</div>
            )}
            {!shown && <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none'}}><span style={{font:'600 12px var(--font-body)', color:'var(--text-secondary)', background:'var(--surface-elevated)', padding:'6px 12px', borderRadius:999, border:'.5px solid var(--border-strong)'}}>Press and hold to reveal</span></div>}
          </div>
          <button onClick={copy} className="arx-press" style={{width:'100%', height:44, marginTop:12, borderRadius:12, cursor:'pointer', background:'var(--surface-elevated)', border:'.5px solid var(--border-strong)', color:'var(--text-primary)', font:'600 13px var(--font-body)', display:'flex', alignItems:'center', justifyContent:'center', gap:8}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy {isPhrase?'phrase':'key'}</button>
          <div onClick={()=>setAck(!ack)} style={{display:'flex', gap:10, alignItems:'flex-start', marginTop:16, cursor:'pointer'}}>
            <span style={{width:22, height:22, borderRadius:7, flexShrink:0, marginTop:1, display:'flex', alignItems:'center', justifyContent:'center', background:ack?'var(--color-violet-500)':'transparent', border:ack?'none':'1.5px solid var(--border-strong)'}}>{ack && <IconCheck color="#fff" size={13}/>}</span>
            <span style={{font:'500 12.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.45}}>I have stored {isPhrase?'these words':'this key'} somewhere safe and offline. I understand Arx cannot recover {isPhrase?'them':'it'}.</span>
          </div>
          <button disabled={!ack} onClick={onClose} className="arx-press" style={{width:'100%', height:48, marginTop:16, borderRadius:13, border:'none', cursor:ack?'pointer':'not-allowed', background:ack?'var(--color-violet-500)':'var(--surface-elevated)', color:ack?'#fff':'var(--text-tertiary)', font:'700 14px var(--font-body)', opacity:ack?1:.7}}>Done</button>
        </>)}
      </div>
    </GlassSheet>
  );
}

function SettingsSheet({ kind, currency, setCurrency, onClose, onToast }){
  const [notif, setNotif] = React.useState(()=>{ try{ return JSON.parse(localStorage.getItem('arx-notif')||'null') || {liq:true,price:true,copy:true,fill:true,news:true,promo:false}; }catch(e){ return {liq:true,price:true,copy:true,fill:true,news:true,promo:false}; } });
  const tg = (k)=>{ const n={...notif,[k]:!notif[k]}; setNotif(n); try{ localStorage.setItem('arx-notif',JSON.stringify(n)); }catch(e){} };
  const [ltab, setLtab] = React.useState('terms');
  const CUR = [['USD','US Dollar','$'],['EUR','Euro','\u20ac'],['GBP','British Pound','\u00a3'],['JPY','Japanese Yen','\u00a5'],['KRW','Korean Won','\u20a9'],['CNY','Chinese Yuan','\u00a5'],['AUD','Australian Dollar','$'],['CAD','Canadian Dollar','$']];
  const title = kind==='currency'?'Display currency':kind==='notif'?'Notifications':kind==='security'?'Security':'Legal';
  return (
    <GlassSheet onClose={onClose}>
      <div style={{padding:'6px 22px 26px'}}>
        <div style={{font:'700 18px var(--font-body)', marginBottom:12}}>{title}</div>
        {kind==='currency' && (<>
          <div style={{font:'400 12px var(--font-body)', color:'var(--text-tertiary)', marginBottom:8, lineHeight:1.4}}>Prices and balances display in this currency. Trades still settle in USD-pegged collateral.</div>
          {CUR.map(([code,name,sym])=>(
            <button key={code} onClick={()=>{ setCurrency(code); try{ localStorage.setItem('arx-currency',code); }catch(e){} onToast('Display currency \u2014 '+code); onClose(); }} style={{width:'100%', display:'flex', alignItems:'center', gap:12, height:50, background:'none', border:'none', borderBottom:'.5px solid var(--border-default)', cursor:'pointer'}}>
              <span style={{width:26, font:'600 14px var(--font-mono)', color:'var(--text-secondary)', textAlign:'left'}}>{sym}</span>
              <span style={{flex:1, textAlign:'left', font:(currency===code?'600':'500')+' 15px var(--font-body)', color:currency===code?'var(--color-violet-500)':'var(--text-primary)'}}>{code} <span style={{color:'var(--text-tertiary)', font:'400 12px var(--font-body)'}}>{name}</span></span>
              {currency===code && <IconCheck color="var(--color-violet-500)" size={16}/>}
            </button>
          ))}
        </>)}
        {kind==='notif' && (<>
          <div style={{font:'400 12px var(--font-body)', color:'var(--text-tertiary)', marginBottom:6, lineHeight:1.4}}>Push notifications for the things that move your money.</div>
          <SgToggle label="Liquidation warnings" sub="When a position nears liquidation" on={notif.liq} onToggle={()=>tg('liq')}/>
          <SgToggle label="Price alerts" sub="Big moves on your assets & watchlist" on={notif.price} onToggle={()=>tg('price')}/>
          <SgToggle label="Copy activity" sub="When a leader you copy opens or closes" on={notif.copy} onToggle={()=>tg('copy')}/>
          <SgToggle label="Order fills" sub="Limit, stop & TP fills" on={notif.fill} onToggle={()=>tg('fill')}/>
          <SgToggle label="News & daily brief" sub="Market recap and breaking news" on={notif.news} onToggle={()=>tg('news')}/>
          <SgToggle label="Promotions" sub="Rewards, tiers & referrals" on={notif.promo} onToggle={()=>tg('promo')}/>
        </>)}
        {kind==='security' && (<>
          <div style={{font:'500 10px var(--font-body)', letterSpacing:'.06em', textTransform:'uppercase', color:'var(--text-tertiary)', margin:'4px 0 8px'}}>Passkeys</div>
          <div style={{display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'.5px solid var(--border-default)'}}>
            <div style={{flex:1}}><div style={{font:'600 14px var(--font-body)'}}>iPhone 15 Pro</div><div style={{font:'400 11.5px var(--font-body)', color:'var(--text-tertiary)'}}>This device \u00b7 added Jun 2026</div></div>
            <span style={{font:'600 11px var(--font-mono)', color:'var(--regime-up-mid)'}}>Active</span>
          </div>
          <button onClick={()=>onToast('Add a passkey \u2014 Face ID / hardware key (prototype)')} style={{width:'100%', textAlign:'left', padding:'13px 0', background:'none', border:'none', borderBottom:'.5px solid var(--border-default)', cursor:'pointer', font:'600 14px var(--font-body)', color:'var(--color-violet-500)'}}>+ Add a passkey</button>
          <div style={{font:'500 10px var(--font-body)', letterSpacing:'.06em', textTransform:'uppercase', color:'var(--text-tertiary)', margin:'16px 0 8px'}}>Active sessions</div>
          {[['This iPhone','San Francisco \u00b7 now',true],['Chrome \u00b7 macOS','San Francisco \u00b7 2h ago',false]].map(([d,m,cur])=>(
            <div key={d} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'.5px solid var(--border-default)'}}>
              <div style={{flex:1}}><div style={{font:'600 14px var(--font-body)'}}>{d}</div><div style={{font:'400 11.5px var(--font-body)', color:'var(--text-tertiary)'}}>{m}</div></div>
              {cur ? <span style={{font:'600 11px var(--font-mono)', color:'var(--text-tertiary)'}}>Current</span> : <button onClick={()=>onToast('Session revoked')} style={{font:'600 12px var(--font-body)', color:'var(--regime-down-mid)', background:'none', border:'none', cursor:'pointer'}}>Revoke</button>}
            </div>
          ))}
          <button onClick={()=>onToast('All other sessions signed out')} style={{width:'100%', marginTop:14, height:44, borderRadius:12, background:'var(--surface-elevated)', border:'.5px solid var(--border-strong)', cursor:'pointer', font:'600 13px var(--font-body)', color:'var(--text-primary)'}}>Sign out all other sessions</button>
        </>)}
        {kind==='legal' && (<>
          <div style={{display:'flex', gap:6, marginBottom:14, background:'var(--glass-control-bg)', borderRadius:10, padding:3}}>
            {[['terms','Terms'],['privacy','Privacy'],['risk','Risk'],['fees','Fees']].map(([id,l])=>(
              <button key={id} onClick={()=>setLtab(id)} style={{flex:1, height:32, borderRadius:8, border:'none', cursor:'pointer', background:ltab===id?'var(--surface-modal)':'transparent', color:ltab===id?'var(--text-primary)':'var(--text-tertiary)', font:'600 11.5px var(--font-body)'}}>{l}</button>
            ))}
          </div>
          <div style={{font:'400 13px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.6}}>
            {ltab==='terms' && 'By using Arx you agree to trade at your own risk. Arx is a non-custodial interface to the Hyperliquid protocol — you hold your own keys and Arx never takes custody of your funds. Trading involves risk of loss. Past performance does not indicate future results.'}
            {ltab==='privacy' && 'Arx stores the minimum needed to run the app. Your wallet keys never leave your device and are never sent to Arx. On-chain activity is public by nature of the blockchain. We do not sell your data.'}
            {ltab==='risk' && 'Leverage amplifies both gains and losses — you can lose more than your initial margin. Copying a leader does not guarantee profits; you may lose some or all of your capital. Returns shown are before fees and based on on-chain data.'}
            {ltab==='fees' && 'Maker / taker fees follow the Hyperliquid schedule and fall with your volume tier. Funding is exchanged every 8 hours between longs and shorts. On-chain withdrawals cost network gas. Arx adds no deposit fee.'}
          </div>
          <div style={{marginTop:16, font:'400 11px var(--font-body)', color:'var(--text-tertiary)'}}>Full legal text \u00b7 arx.app/legal</div>
        </>)}
      </div>
    </GlassSheet>
  );
}

function SettingsScreen({ onBack, onToast, onSignOut, flip, setFlip, frame, setFrame, lang, setLang, confirmMode, onRequestExpress, onDisableExpress }) {
  const [confirmMethod, setConfirmMethod] = useConfirmMethod();
  const [appLock, toggleLock] = useAppLock();
  const [sound, setSound] = yhS(true);
  const backed = (()=>{ try { return localStorage.getItem('arx-wallet-backed')==='1'; } catch(e){ return false; } })();
  const [proMode, setProMode] = yhS(()=>{ try { return localStorage.getItem('arx-pro-mode')==='1'; } catch(e){ return false; } });
  const [marginMode, setMarginMode] = yhS(()=>{ try { return localStorage.getItem('arx-margin-mode')||'cross'; } catch(e){ return 'cross'; } });
  const [buffer, setBuffer] = yhS(()=>{ try { return localStorage.getItem('arx-maint-buffer')||'125%'; } catch(e){ return '125%'; } });
  const pickMargin = (v)=>{ setMarginMode(v); try { localStorage.setItem('arx-margin-mode',v); } catch(e){} };
  const pickBuffer = (v)=>{ setBuffer(v); try { localStorage.setItem('arx-maint-buffer',v); } catch(e){} };
  const [langOpen, setLangOpen] = yhS(false);
  const [reveal, setReveal] = React.useState(null);
  const [sheet, setSheet] = React.useState(null);
  const [currency, setCurrency] = React.useState(()=>{ try{ return localStorage.getItem('arx-currency')||'USD'; }catch(e){ return 'USD'; } });
  const LANGS = ['English','中文','한국어','Tiếng Việt','日本語'];
  const setPro = (v)=>{ setProMode(v); try { localStorage.setItem('arx-pro-mode', v?'1':'0'); } catch(e){} onToast(v?'Pro mode on — advanced trading UI':'Simple mode on'); };

  return (
    <SubShell title="Settings" onBack={onBack}>
      <SgGroup header="Account & security">
        <SgRow label="Account details" value="sam.crypto" onClick={()=>window.__arxOpenSub && window.__arxOpenSub('account')} last={false}/>
        <SgRow label="Security & passkeys" value="1 passkey" onClick={()=>setSheet('security')}/>
        <SgRow label="Connect X" value="Not connected" onClick={()=>onToast('X OAuth — prototype')}/>
        <SgRow label="Devices & sessions" value="2 active" onClick={()=>setSheet('security')}/>
      </SgGroup>

      <SgGroup header="Self-custody & wallets" footer="Your keys never leave your hands. Back up your recovery phrase — it's the only way to restore this wallet.">
        <SgRow label="Wallet backup" value={backed?'On':'Set up'} onClick={()=>window.__arxOpenSub && window.__arxOpenSub('secureWallet')} last={false}/>
        <SgRow label="Recovery phrase" onClick={()=>setReveal('phrase')}/>
        <SgRow label="Export private keys" onClick={()=>setReveal('key')}/>
        <SgRow label="Connected wallets" value="1" onClick={()=>onToast('Connected wallets — prototype')}/>
        <SgRow label="Revoke trading access" value="Kill agent-wallet" danger onClick={()=>onToast('Trading access revoked — your funds stay in your wallet')}/>
      </SgGroup>

      <SgGroup header="Trading">
        <SgToggle label="Express orders" sub="Submit on tap — no hold/slide" on={confirmMode==='express'} onToggle={()=> confirmMode==='express' ? onDisableExpress() : onRequestExpress()}/>
        <SgToggle label="Pro mode" sub="Advanced order types & order book" on={proMode} onToggle={()=>setPro(!proMode)}/>
        <SgRow label="Default leverage" value="Max" onClick={()=>onToast('Default leverage — Max (prototype)')}/>
        <SgRow label="Currency" value={currency} onClick={()=>setSheet('currency')}/>
        <SgRow label="Notifications" value="On" onClick={()=>setSheet('notif')}/>
      </SgGroup>

      <SgGroup header="Wallet & funding" footer="Saved destinations and payment methods for deposits & withdrawals.">
        <SgRow label="Payment methods" value="Apple Pay · card" onClick={()=>onToast('Payment methods — Apple Pay, cards & ramps (prototype)')} last={false}/>
        <SgRow label="Address book" value="2 saved" onClick={()=>onToast('Address book — saved withdrawal addresses (prototype)')}/>
      </SgGroup>

      {proMode && (<SgGroup header="Margin & balances" footer="Pro only · Unified USD auto-swaps your stablecoins. Maintenance buffer auto-reduces before liquidation.">
        <SgRow label="Account standard" value="Unified USD" onClick={()=>onToast('Unified USD — USDC, USDT & USDH trade as one balance · auto-swap on')} last={false}/>
        <div style={{display:'flex', alignItems:'center', gap:12, padding:'12px 15px', borderTop:'.5px solid var(--border-default)'}}>
          <span style={{flex:1, font:'500 14.5px var(--font-body)'}}>Margin mode</span>
          <SgSegment value={marginMode} options={[['cross','Cross'],['isolated','Isolated']]} onChange={pickMargin}/>
        </div>
        <div style={{padding:'12px 15px', borderTop:'.5px solid var(--border-default)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
            <span style={{font:'500 14.5px var(--font-body)'}}>Maintenance buffer</span>
            <span style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)'}}>auto-reduce trigger</span>
          </div>
          <div style={{display:'flex', gap:6, marginTop:10}}>
            {['Off','110%','125%','150%'].map(o=>(
              <button key={o} onClick={()=>pickBuffer(o)} className="arx-press" style={{flex:1, height:34, borderRadius:10, cursor:'pointer', border: buffer===o?'1px solid var(--color-violet-500)':'.5px solid var(--border-default)', background: buffer===o?'rgba(124,91,255,.12)':'var(--surface-base)', color: buffer===o?'var(--color-violet-500)':'var(--text-secondary)', font:'600 12px var(--font-body)'}}>{o}</button>
            ))}
          </div>
        </div>
      </SgGroup>)}

      <SgGroup header="Display">
        <SgToggle label="App lock" sub="Face ID on open" on={appLock} onToggle={toggleLock}/>
        <SgToggle label="Sounds & haptics" on={sound} onToggle={()=>setSound(!sound)}/>
        <SgRow label="Language" value={lang} onClick={()=>setLangOpen(true)}/>
        <div style={{padding:'12px 15px', borderTop:'.5px solid var(--border-default)'}}>
          <div style={{font:'500 14.5px var(--font-body)'}}>Profit color</div>
          <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:2, marginBottom:10}}>Flips every up/down color. Common in CN · KR markets.</div>
          <div style={{display:'flex', gap:8}}>
            {[[false,'Green up'],[true,'Red up']].map(([val,t])=>(
              <button key={String(val)} onClick={()=>setFlip(val)} style={{flex:1, display:'flex', alignItems:'center', gap:8, padding:'10px 11px', borderRadius:11, cursor:'pointer', textAlign:'left',
                border: flip===val?'1px solid var(--color-violet-500)':'.5px solid var(--border-default)', background:'var(--surface-base)'}}>
                <span style={{display:'flex', borderRadius:6, overflow:'hidden', flexShrink:0}}>
                  <span style={{width:14, height:18, background: val?'#FF4D6A':'#14B87B'}}/>
                  <span style={{width:14, height:18, background: val?'#14B87B':'#FF4D6A'}}/>
                </span>
                <span style={{flex:1, font:'600 12px var(--font-body)'}}>{t}</span>
                {flip===val && <IconCheck color="var(--color-violet-500)" size={13}/>}
              </button>
            ))}
          </div>
        </div>
      </SgGroup>

      <SgGroup header="Support & legal" footer="Trading involves risk of loss. Past performance does not indicate future results.">
        <SgRow label="Help center" onClick={()=>onToast('Help center — prototype')} last={false}/>
        <SgRow label="Rate Arx" onClick={()=>onToast('Opening App Store rating — prototype')}/>
        <SgRow label="Fee schedule" onClick={()=>setSheet('legal')}/>
        <SgRow label="Risk & disclaimers" onClick={()=>setSheet('legal')}/>
        <SgRow label="Terms & privacy" onClick={()=>setSheet('legal')}/>
        <SgRow label="Version" value="1.6.0" onClick={()=>onToast('Arx 1.6.0 · build 2406')}/>
        <SgRow label="Close account" danger onClick={()=>onToast('Close account — withdraw funds first · confirm required')}/>
      </SgGroup>

      <div style={{padding:'10px 16px 30px'}}>
        <button onClick={onSignOut} style={{width:'100%', height:46, background:'transparent', color:'var(--regime-down-mid)', border:'.5px solid var(--border-default)', borderRadius:12, font:'600 14px var(--font-body)', cursor:'pointer'}}>Log out</button>
      </div>

      {langOpen && (
        <GlassSheet onClose={()=>setLangOpen(false)}>
          <div style={{padding:'6px 22px 26px'}}>
            <div style={{font:'700 18px var(--font-body)', marginBottom:10}}>Language</div>
            {LANGS.map(l=>(
              <button key={l} onClick={()=>{ setLang(l); setLangOpen(false); }} style={{width:'100%', display:'flex', alignItems:'center', height:48, background:'none', border:'none', cursor:'pointer', borderBottom:'.5px solid var(--border-default)'}}>
                <span style={{flex:1, textAlign:'left', font:(lang===l?'600':'500')+' 15px var(--font-body)', color: lang===l?'var(--color-violet-500)':'var(--text-primary)'}}>{l}</span>
                {lang===l && <IconCheck color="var(--color-violet-500)" size={16}/>}
              </button>
            ))}
            <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:12}}>Full translation ships with the production i18n layer — prototype stays English.</div>
          </div>
        </GlassSheet>
      )}
      {reveal && <RevealSecret kind={reveal} onClose={()=>setReveal(null)} onToast={onToast}/>}
      {sheet && <SettingsSheet kind={sheet} currency={currency} setCurrency={setCurrency} onClose={()=>setSheet(null)} onToast={onToast}/>}
    </SubShell>
  );
}

/* ════════════ FUNDING & TRANSFERS · hub ════════════ */
function FundingHubScreen({ onBack, onToast }) {
  return (
    <SubShell title="Funding & transfers" onBack={onBack}>
      {/* quick actions */}
      <div style={{display:'flex', gap:8, padding:'4px 16px 10px'}}>
        {[['deposit','Deposit','funding',true],['withdraw','Withdraw','withdraw',false],['swap','Swap','swap',false]].map(([icon,label,id,prim])=>(
          <button key={id} onClick={()=>window.__arxOpenSub && window.__arxOpenSub(id)} className="arx-press" style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'12px 2px 10px', borderRadius:13, cursor:'pointer', background: prim?'var(--color-violet-500)':'var(--surface-elevated)', border: prim?'none':'.5px solid var(--border-strong)'}}>
            <span style={{color: prim?'#fff':'var(--text-primary)', display:'flex'}}>{txIcon(icon,18)}</span>
            <span style={{font:'600 11.5px var(--font-body)', color: prim?'#fff':'var(--text-primary)'}}>{label}</span>
          </button>
        ))}
      </div>

      {/* auto-swap status */}
      <div style={{margin:'0 16px 6px', padding:'12px 14px', borderRadius:14, background:'rgba(45,212,155,.08)', border:'.5px solid rgba(45,212,155,.22)', display:'flex', gap:10, alignItems:'flex-start'}}>
        <span style={{marginTop:1}}><IconCheck color="var(--regime-up-mid)" size={15}/></span>
        <div><div style={{font:'600 12.5px var(--font-body)'}}>Collateral auto-swap is on</div><div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:2, lineHeight:1.4}}>USDC, USDT and USDH balances unify automatically — you never pick a stablecoin to trade.</div></div>
      </div>

      <SgGroup header="Payment methods" footer="Used for card / bank on- and off-ramps.">
        <SgRow icon={txIcon('deposit',17)} label="Apple Pay" value="Default" onClick={()=>onToast('Manage Apple Pay — prototype')} last={false}/>
        <SgRow icon={txIcon('deposit',17)} label="Visa ···· 4242" value="Card" onClick={()=>onToast('Manage card — prototype')}/>
        <SgRow label="Add payment method" onClick={()=>onToast('Add method — card · bank · ramp (prototype)')}/>
      </SgGroup>

      <SgGroup header="Address book" footer="Saved destinations make withdrawals faster and safer.">
        <SgRow label="Cold wallet" value="0x9f2c…ab10" onClick={()=>onToast('Edit address — prototype')} last={false}/>
        <SgRow label="Kraken" value="0x71de…3c84" onClick={()=>onToast('Edit address — prototype')}/>
        <SgRow label="Add address" onClick={()=>onToast('Add withdrawal address — prototype')}/>
      </SgGroup>

      <SgGroup header="Activity">
        <SgRow label="Fees & funding history" onClick={()=>window.__arxOpenSub && window.__arxOpenSub('history')} last={false}/>
        <SgRow label="Transfers" onClick={()=>window.__arxOpenSub && window.__arxOpenSub('txHistory')}/>
      </SgGroup>
      <div style={{height:26}}/>
    </SubShell>
  );
}

/* ─── checkbox row for the verify flow ─── */
function VCheck({ checked, label, sub, onToggle }) {
  return (
    <button onClick={onToggle} className="arx-row-press" style={{width:'100%', display:'flex', gap:12, alignItems:'flex-start', padding:'13px 15px', background:'none', border:'none', borderTop:'.5px solid var(--border-default)', cursor:'pointer', textAlign:'left'}}>
      <span style={{width:22, height:22, borderRadius:7, flexShrink:0, marginTop:1, display:'flex', alignItems:'center', justifyContent:'center',
        background: checked?'var(--color-violet-500)':'transparent', border: checked?'none':'1.5px solid var(--border-strong)', transition:'all 150ms'}}>
        {checked && <IconCheck color="#fff" size={13}/>}
      </span>
      <div style={{flex:1}}>
        <div style={{font:'500 13.5px var(--font-body)', color:'var(--text-primary)'}}>{label}</div>
        {sub && <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:2, lineHeight:1.4}}>{sub}</div>}
      </div>
    </button>
  );
}

/* ════════════ LEADER VERIFICATION · Three-Gate flow ════════════ */
function LeaderVerifyScreen({ onBack, onToast }) {
  const [step, setStep] = yhS(0);              // 0,1,2 gates · 3 = submitted
  const [signed, setSigned] = yhS(false);
  const [g2, setG2] = yhS({ perf:false, terms:false, positions:false });
  const [g3, setG3] = yhS({ disc:false });
  const allG2 = g2.perf && g2.terms && g2.positions;
  const allG3 = signed && g3.disc;
  const submit = () => { try { localStorage.setItem('arx-leader-status','pending'); } catch(e){} setStep(3); };

  const dots = (
    <div style={{display:'flex', gap:6, alignItems:'center', padding:'0 20px 14px'}}>
      {[0,1,2].map(i=>(
        <div key={i} style={{flex:1, height:4, borderRadius:2, background: step>i ? 'var(--regime-up-mid)' : step===i ? 'var(--color-violet-500)' : 'var(--border-default)', transition:'background 200ms'}}/>
      ))}
      <span style={{font:'600 10.5px var(--font-mono)', color:'var(--text-tertiary)', marginLeft:8}}>{step<3?`Gate ${step+1} / 3`:'Done'}</span>
    </div>
  );

  if (step===3) return (
    <SubShell title="Leader application" onBack={onBack}>
      <div style={{padding:'30px 24px', textAlign:'center'}}>
        <div style={{width:72, height:72, margin:'0 auto 18px', borderRadius:'50%', background:'rgba(45,212,155,.14)', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <IconCheck color="var(--regime-up-mid)" size={34}/>
        </div>
        <div style={{font:'700 20px var(--font-body)', letterSpacing:'-.01em'}}>Application submitted</div>
        <div style={{font:'400 13.5px var(--font-body)', color:'var(--text-secondary)', marginTop:8, lineHeight:1.5}}>We're verifying your track record, identity, and risk terms. You'll hear back within 48 hours. Your stats stay private until you're approved.</div>
        <button onClick={onBack} className="arx-press" style={{marginTop:24, height:48, width:'100%', borderRadius:13, border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'700 14px var(--font-body)'}}>Back to profile</button>
      </div>
    </SubShell>
  );

  return (
    <SubShell title="Become a copy leader" onBack={onBack}>
      {dots}

      {step===0 && (<>
        <div style={{padding:'0 20px 4px', font:'600 15px var(--font-brand)'}}>Gate 1 · Track record</div>
        <div style={{padding:'4px 20px 12px', font:'400 12.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5}}>Leaders qualify on verified on-chain performance — not followers. Your wallet already clears the bar.</div>
        <SgGroup>
          {[['90+ days on chain','312 days',true],['100+ trades','502 trades',true],['Positive 90-day expectancy','+0.4R avg',true],['Max drawdown within band','−14.2% · OK',true]].map(([k,v,ok],i)=>(
            <div key={k} style={{display:'flex', alignItems:'center', gap:10, padding:'12px 15px', borderTop:i===0?undefined:'.5px solid var(--border-default)'}}>
              <span style={{width:20, height:20, borderRadius:'50%', flexShrink:0, background:'rgba(45,212,155,.16)', display:'flex', alignItems:'center', justifyContent:'center'}}><IconCheck color="var(--regime-up-mid)" size={12}/></span>
              <span style={{flex:1, font:'500 13.5px var(--font-body)'}}>{k}</span>
              <span className="num" style={{font:'500 12px var(--font-mono)', color:'var(--text-tertiary)'}}>{v}</span>
            </div>
          ))}
        </SgGroup>
        <div style={{padding:'10px 20px 0', font:'400 11px var(--font-body)', color:'var(--text-tertiary)'}}>Qualification is re-checked continuously. Falling below the bar pauses new copiers.</div>
        <div style={{padding:'18px 16px 26px'}}>
          <button onClick={()=>setStep(1)} className="arx-press" style={{height:48, width:'100%', borderRadius:13, border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'700 14px var(--font-body)'}}>Continue</button>
        </div>
      </>)}

      {step===1 && (<>
        <div style={{padding:'0 20px 4px', font:'600 15px var(--font-brand)'}}>Gate 2 · Transparency & terms</div>
        <div style={{padding:'4px 20px 12px', font:'400 12.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5}}>Copiers see what you do. These are non-negotiable for a verified leader.</div>
        <div style={{margin:'0 16px', borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', overflow:'hidden'}}>
          <div style={{height:1}}/>
          <VCheck checked={g2.perf} onToggle={()=>setG2({...g2, perf:!g2.perf})} label="Make my performance public" sub="PnL, win rate, drawdown and trades become visible on your leader card."/>
          <VCheck checked={g2.positions} onToggle={()=>setG2({...g2, positions:!g2.positions})} label="Mirror my trades in real time" sub="Opens and closes copy to followers within seconds, at their own size."/>
          <VCheck checked={g2.terms} onToggle={()=>setG2({...g2, terms:!g2.terms})} label="Accept the leader agreement" sub="No guaranteed returns, no solicitation, 10% performance fee on copier profit."/>
        </div>
        <div style={{padding:'18px 16px 26px'}}>
          <button disabled={!allG2} onClick={()=>setStep(2)} className="arx-press" style={{height:48, width:'100%', borderRadius:13, border:'none', cursor: allG2?'pointer':'default', background: allG2?'var(--color-violet-500)':'var(--glass-control-bg)', color: allG2?'#fff':'var(--text-tertiary)', font:'700 14px var(--font-body)', transition:'all 160ms'}}>Continue</button>
        </div>
      </>)}

      {step===2 && (<>
        <div style={{padding:'0 20px 4px', font:'600 15px var(--font-brand)'}}>Gate 3 · Identity</div>
        <div style={{padding:'4px 20px 12px', font:'400 12.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5}}>Prove you own the wallet. This signature costs no gas and authorizes nothing on-chain.</div>
        <div style={{margin:'0 16px 6px', padding:16, borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{flex:1}}>
              <div style={{font:'600 14px var(--font-body)'}}>Verify wallet ownership</div>
              <div style={{font:'400 11.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>Sign a message from 0x4b2e…91ac</div>
            </div>
            {signed
              ? <span style={{display:'flex', alignItems:'center', gap:5, font:'700 12px var(--font-body)', color:'var(--regime-up-mid)'}}><IconCheck color="var(--regime-up-mid)" size={14}/>Verified</span>
              : <button onClick={()=>{ setSigned(true); onToast('Wallet ownership verified'); }} className="arx-press" style={{height:36, padding:'0 16px', borderRadius:10, border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'700 12px var(--font-body)'}}>Sign</button>}
          </div>
        </div>
        <div style={{margin:'0 16px', borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', overflow:'hidden'}}>
          <div style={{height:1}}/>
          <VCheck checked={g3.disc} onToggle={()=>setG3({disc:!g3.disc})} label="I understand my responsibility" sub="Copiers risk real capital following my trades. Past performance does not guarantee future results."/>
        </div>
        <div style={{padding:'18px 16px 26px'}}>
          <button disabled={!allG3} onClick={submit} className="arx-press" style={{height:48, width:'100%', borderRadius:13, border:'none', cursor: allG3?'pointer':'default', background: allG3?'var(--color-violet-500)':'var(--glass-control-bg)', color: allG3?'#fff':'var(--text-tertiary)', font:'700 14px var(--font-body)', boxShadow: allG3?'var(--shadow-execute)':'none', transition:'all 160ms'}}>Submit application</button>
        </div>
      </>)}
    </SubShell>
  );
}

/* ════════════ PORTFOLIO · dedicated holdings detail ════════════ */
function PortfolioScreen({ onBack, onToast, initTab }) {
  const TAB_MAP = { Cash:'balances', Spot:'balances', Perp:'positions', Copies:'positions' };
  const [tab, setTab] = yhS((initTab && (TAB_MAP[initTab] || initTab)) || 'positions');
  const alloc = [['SOL','42%','42','var(--regime-up-mid)'],['ETH','23%','23','var(--regime-down-mid)'],['Copies','15%','15','var(--color-violet-500)'],['Cash','20%','20','var(--text-tertiary)']];

  return (
    <SubShell title="Portfolio" onBack={onBack}>
      {/* compact equity readout — this screen is the LEDGER; the equity chart lives on the You home (no duplicate hero) */}
      <div style={{padding:'2px 20px 14px'}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <span style={{font:'500 10px var(--font-body)', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--color-violet-300)'}}>Total equity</span>
          <span style={{display:'inline-flex', alignItems:'center', gap:5, padding:'2px 7px', borderRadius:999, background:'rgba(20,184,123,.12)', border:'.5px solid rgba(20,184,123,.26)'}}><span className="arx-breath" style={{width:5,height:5,borderRadius:'50%',background:'var(--regime-up-mid)'}}/><span style={{font:'600 9px var(--font-mono)', color:'var(--regime-up-mid)', letterSpacing:'.1em'}}>LIVE</span></span>
        </div>
        <div className="num" style={{font:'700 34px var(--font-mono)', letterSpacing:'-.025em', lineHeight:1.04, marginTop:6}}>$24,837.42</div>
        <div style={{display:'flex', alignItems:'baseline', gap:8, marginTop:6}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--regime-up-mid)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 15 12 9 18 15"/></svg>
          <span className="num" style={{font:'700 13px var(--font-mono)', color:'var(--regime-up-mid)'}}>+$1,204.10</span>
          <span className="num" style={{font:'500 13px var(--font-mono)', color:'var(--regime-up-mid)', opacity:.82}}>+5.1%</span>
          <span style={{marginLeft:'auto', font:'500 11px var(--font-body)', color:'var(--text-tertiary)'}}>today</span>
        </div>
      </div>
      {/* account breakdown — where the equity sits (this screen's anchor) */}
      <div style={{margin:'0 16px 12px', borderRadius:18, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', padding:'2px 16px'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
          {[['Cash · USDC','$9,214.10','Available'],['Perp','$11,963.32','Margin + open PnL'],['Spot','$2,460.00','3 tokens'],['Copies','$1,200.00','2 leaders']].map(([k,v,sub],i)=>(
            <div key={k} style={{padding:`${i>1?'14px':'15px'} 0 ${i<2?'14px':'15px'} ${i%2?'16px':'0'}`, borderLeft:i%2?'.5px solid var(--border-default)':'none', borderTop:i>1?'.5px solid var(--border-default)':'none'}}>
              <div style={{font:'500 9.5px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>{k}</div>
              <div className="num" style={{font:'600 15px var(--font-mono)', color:'var(--text-primary)', marginTop:3}}>{v}</div>
              <div style={{font:'400 10px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* exposure allocation */}
      <div style={{padding:'4px 20px 8px', display:'flex', alignItems:'baseline', justifyContent:'space-between'}}>
        <span style={{font:'600 11px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.06em'}}>Exposure</span>
        <span style={{font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)'}}>share of book</span>
      </div>
      <div style={{margin:'0 16px 8px', padding:16, borderRadius:18, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
        <div style={{display:'flex', height:16, borderRadius:8, overflow:'hidden', gap:2}}>
          {alloc.map(([k,p,w,c])=>(<div key={k} style={{flex:Number(w), background:c}}/>))}
        </div>
        <div style={{display:'flex', flexWrap:'wrap', gap:'9px 18px', marginTop:14}}>
          {alloc.map(([k,p,w,c])=>(
            <div key={k} style={{display:'flex', alignItems:'center', gap:7}}>
              <span style={{width:10, height:10, borderRadius:3, background:c}}/>
              <span style={{font:'500 12px var(--font-body)', color:'var(--text-secondary)'}}>{k}</span>
              <span className="num" style={{font:'600 12px var(--font-mono)', color:'var(--text-primary)'}}>{p}</span>
            </div>
          ))}
        </div>
      </div>

      <PortfolioLedger tab={tab} setTab={setTab} onToast={onToast}/>
    </SubShell>
  );
}

/* The deep ledger — Positions · Balances · Orders · PnL · History.
   Inlined under the You portfolio card (view + manage together; §8.9 Layer 2); also used by PortfolioScreen. */
function PortfolioLedger({ tab, setTab, onToast }) {
  const open = (id, params) => window.__arxOpenSub && window.__arxOpenSub(id, params);
  // copies — same shape + states as the Copy tab's My-wallets (rendered via the shared CopyManageList, so the two surfaces are identical)
  const MYCOPIES = [
    { x:'@HsakaTrades', addr:'@HsakaTrades', tax:'All-Weather', alloc:'$520', allocV:520, pnl:'+$284.10', state:'live',     since:'34d', lossLeft:'62% to loss limit' },
    { x:'@solqueen',    addr:'@solqueen',    tax:'Specialist',  alloc:'$430', allocV:430, pnl:'+$61.00',  state:'live',     since:'21d', lossLeft:'34% to loss limit' },
    { x:'@maxi_eth',    addr:'@maxi_eth',    tax:'Aggressive',  alloc:'$250', allocV:250, pnl:'−$42.00', state:'drawdown', since:'48d', lossLeft:'stopped at loss limit' },
  ];
  const copyCapTotal = MYCOPIES.reduce((s,c)=>s+c.allocV,0);
  const BENCH = [['You','+5.1%',5.1,true],['BTC','+3.2%',3.2,false],['ETH','+1.8%',1.8,false]];   // 30-day return vs market
  const POS = [
    { sym:'SOL', dir:'LONG',  lev:'6×', size:'$3,420', sizeV:3420, entry:'$182.41', mark:'$191.20', liq:'$168.20', margin:'$570', pnl:'+$284.10', pos:true, roe:'+8.3%', liqDist:12.0 },
    { sym:'ETH', dir:'SHORT', lev:'4×', size:'$1,860', sizeV:1860, entry:'$3,910.20', mark:'$3,968.00', liq:'$4,120.00', margin:'$465', pnl:'−$42.30', pos:false, roe:'−2.3%', liqDist:3.8 },
    { sym:'HYPE', dir:'LONG', lev:'3×', size:'$1,240', sizeV:1240, entry:'$31.80', mark:'$36.43', liq:'$24.10', margin:'$413', pnl:'+$181.40', pos:true, roe:'+14.6%', liqDist:18.5 },
    { sym:'BTC', dir:'LONG',  lev:'2×', size:'$2,100', sizeV:2100, entry:'$88,200', mark:'$93,540', liq:'$52,300', margin:'$1,050', pnl:'+$127.10', pos:true, roe:'+6.1%', liqDist:28.0 },
    { sym:'ARB', dir:'SHORT', lev:'5×', size:'$620', sizeV:620, entry:'$0.92', mark:'$0.96', liq:'$1.08', margin:'$124', pnl:'−$26.80', pos:false, roe:'−4.3%', liqDist:9.2 },
  ];
  const ords = [
    { sym:'SOL',  type:'Limit', side:'Buy',  detail:'$500 @ $208.00', trigger:null,                   state:'pending' },
    { sym:'HYPE', type:'Limit', side:'Buy',  detail:'$300 @ $36.00',  trigger:null,                   state:'partial' },
    { sym:'ETH',  type:'Stop',  side:'Sell', detail:'Reduce $1,860',  trigger:'trigger $4,120 · mark', state:'pending' },
    { sym:'SOL',  type:'TP',    side:'Sell', detail:'Close 50%',      trigger:'trigger $214.00',      state:'pending' },
    { sym:'BTC',  type:'Limit', side:'Sell', detail:'$1,000 @ $96,000', trigger:null,                 state:'pending' },
    { sym:'ARB',  type:'TP',    side:'Sell', detail:'Close 100%',     trigger:'trigger $1.10',        state:'pending' },
  ];
  const ordTone = (t) => t==='Stop' ? 'var(--regime-down-mid)' : t==='TP' ? 'var(--regime-up-mid)' : 'var(--color-violet-400)';
  const hist = [['SOL','+$284.10','2h ago','filled'],['BTC','−$96.40','1d ago','filled'],['XRP','−$210.00','2d ago','liquidated'],['ETH','$0.00','3d ago','failed']];
  const liqTone = (d) => d < 5 ? 'var(--regime-down-mid)' : d < 10 ? 'var(--regime-trans-mid)' : 'var(--regime-up-mid)';
  // pagination — cap long ledger lists; per-tab "Show all" toggle
  const CAP = 4;
  const [expand, setExpand] = yhS({});
  const cut = (key, arr) => expand[key] ? arr : arr.slice(0, CAP);
  const moreBtn = (key, total) => total>CAP ? (
    <button onClick={()=>setExpand(e=>({...e,[key]:!e[key]}))} className="arx-press" style={{display:'block', width:'calc(100% - 40px)', margin:'10px 20px 2px', padding:'10px', borderRadius:11, cursor:'pointer', background:'none', border:'.5px solid var(--border-default)', font:'600 12px var(--font-body)', color:'var(--color-violet-300)', textAlign:'center'}}>{expand[key] ? 'Show less' : `Show all ${total}`}</button>
  ) : null;

  return (
    <div>
      {/* tabs */}
      <div style={{display:'flex', gap:16, padding:'12px 20px 6px', borderBottom:'.5px solid var(--border-default)', margin:'6px 0 0', overflowX:'auto', scrollbarWidth:'none'}}>
        {[['positions','Positions'],['copies','Copies'],['balances','Balances'],['orders','Orders'],['pnl','PnL'],['history','History']].map(([id,l])=>(
          <button key={id} onClick={()=>setTab(id)} style={{background:'none', border:'none', cursor:'pointer', padding:'4px 0 10px', position:'relative', font:`${tab===id?700:500} 14px var(--font-body)`, color: tab===id?'var(--text-primary)':'var(--text-tertiary)'}}>{l}{tab===id && <span style={{position:'absolute', left:0, right:0, bottom:-1, height:2, background:'var(--color-violet-500)', borderRadius:1}}/>}</button>
        ))}
      </div>

      {tab==='positions' && (<>{cut('pos',POS).map((p,i)=>{
        const pParam = {sym:p.sym,dir:p.dir,lev:p.lev,size:p.size,pnl:p.pnl,entry:p.entry,liq:p.liq,margin:p.margin,markPx:p.mark};
        return (
        <div key={i} style={{padding:'13px 20px', borderBottom:'.5px solid var(--border-default)'}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <AssetGlyph sym={p.sym} size={34}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', alignItems:'center', gap:6}}><span style={{font:'600 14px var(--font-body)'}}>{p.sym}-PERP</span><span style={{font:'700 9px var(--font-body)', color:p.pos?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{p.dir} {p.lev}</span></div>
              <div className="num" style={{font:'500 10.5px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2}}>Size {p.size} · margin {p.margin}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div className="num" style={{font:'600 14px var(--font-mono)', color:p.pos?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{p.pnl}</div>
              <div className="num" style={{font:'500 10.5px var(--font-mono)', color:p.pos?'var(--regime-up-mid)':'var(--regime-down-mid)', marginTop:1}}>{p.roe}</div>
            </div>
          </div>
          {/* entry → mark → liq + liq distance bar */}
          <div style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}>
            <div className="num" style={{font:'500 10px var(--font-mono)', color:'var(--text-tertiary)', whiteSpace:'nowrap'}}>entry {p.entry} · mark {p.mark}</div>
            <div style={{flex:1, height:5, borderRadius:3, background:'var(--glass-control-bg)', overflow:'hidden', position:'relative'}}>
              <div style={{position:'absolute', left:0, top:0, bottom:0, width:`${Math.max(6,100-p.liqDist*5)}%`, background:liqTone(p.liqDist), borderRadius:3, opacity:.85}}/>
            </div>
            <div className="num" style={{font:'600 10px var(--font-mono)', color:liqTone(p.liqDist), whiteSpace:'nowrap'}}>liq {p.liqDist}%</div>
          </div>
          <div style={{display:'flex', gap:8, marginTop:11}}>
            <button onClick={()=>open('managePos',{p:pParam})} className="arx-press" style={{flex:1, height:34, borderRadius:9, cursor:'pointer', background:'var(--surface-base)', border:'.5px solid var(--border-strong)', color:'var(--text-primary)', font:'600 12px var(--font-body)'}}>Manage</button>
            <button onClick={()=>open('managePos',{p:pParam, tab:'close'})} className="arx-press" style={{flex:1, height:34, borderRadius:9, cursor:'pointer', background:'var(--surface-base)', border:'.5px solid var(--border-strong)', color:'var(--regime-down-mid)', font:'700 12px var(--font-body)'}}>Close</button>
          </div>
        </div>
      );})}{moreBtn('pos',POS.length)}</>)}

      {tab==='copies' && (<>
        {/* copy-capital control */}
        <div style={{margin:'12px 16px 6px', padding:'13px 15px', borderRadius:14, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div><div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>Copy capital</div><div className="num" style={{font:'700 19px var(--font-mono)', marginTop:2}}>{'$'+copyCapTotal.toLocaleString('en-US')+'.00'}</div></div>
            <div style={{display:'flex', gap:8}}>
              <button onClick={()=>onToast('Top up copy capital — choose an amount (prototype)')} className="arx-press" style={{height:34, padding:'0 14px', borderRadius:9, cursor:'pointer', background:'var(--color-violet-500)', border:'none', color:'#fff', font:'700 12px var(--font-body)'}}>Top up</button>
              <button onClick={()=>onToast('Withdraw copy capital — funds return to cash (prototype)')} className="arx-press" style={{height:34, padding:'0 14px', borderRadius:9, cursor:'pointer', background:'var(--surface-base)', border:'.5px solid var(--border-strong)', color:'var(--text-primary)', font:'600 12px var(--font-body)'}}>Withdraw</button>
            </div>
          </div>
        </div>
        {typeof CopyManageList!=='undefined' && <CopyManageList data={MYCOPIES}/>}
        <div style={{padding:'12px 20px 4px', font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>Copying does not guarantee profits. You may lose some or all of your capital. Caps apply per leader.</div>
      </>)}

      {tab==='balances' && (<>
        <div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em', padding:'12px 20px 6px'}}>Cash</div>
        <div style={{display:'flex', alignItems:'center', gap:12, padding:'2px 20px 12px'}}>
          <div style={{width:34, height:34, borderRadius:'50%', flexShrink:0, background:'linear-gradient(135deg,#2775CA,#1a5fa0)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', font:'700 13px var(--font-body)'}}>$</div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{font:'600 14px var(--font-body)'}}>USDC</div>
            <div className="num" style={{font:'500 10.5px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2}}>Available to trade · auto-swaps</div>
          </div>
          <div className="num" style={{font:'600 14px var(--font-mono)'}}>$9,214.10</div>
        </div>
        <div style={{display:'flex', gap:8, padding:'0 20px 8px'}}>
          {[['Deposit','funding'],['Withdraw','withdraw'],['Swap','swap']].map(([label,id],i)=>(
            <button key={id} onClick={()=>open(id)} className="arx-press" style={{flex:1, height:34, borderRadius:9, cursor:'pointer', background: i===0?'var(--color-violet-500)':'var(--surface-base)', border: i===0?'none':'.5px solid var(--border-strong)', color: i===0?'#fff':'var(--text-primary)', font:'600 12px var(--font-body)'}}>{label}</button>
          ))}
        </div>
        <div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em', padding:'12px 20px 6px'}}>Spot · {ARX_SPOT.length} tokens</div>
        {ARX_SPOT.map((s)=>(
          <div key={s.sym} style={{display:'flex', alignItems:'center', gap:10, padding:'13px 20px', borderBottom:'.5px solid var(--border-default)'}}>
            <button onClick={()=>open('instrumentDetail',{m:{sym:s.sym}})} className="arx-row-press" style={{flex:1, minWidth:0, display:'flex', alignItems:'center', gap:12, background:'none', border:'none', cursor:'pointer', textAlign:'left', padding:0}}>
              <AssetGlyph sym={s.sym} size={34}/>
              <div style={{flex:1, minWidth:0}}>
                <div><span style={{font:'600 14px var(--font-body)'}}>{s.sym}</span><span style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', marginLeft:6}}>Spot</span></div>
                <div className="num" style={{font:'500 10.5px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2}}>{s.amt} {s.sym} · avg {s.avg} · today {s.chg}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div className="num" style={{font:'600 14px var(--font-mono)'}}>{s.value}</div>
                <div className="num" style={{font:'600 10.5px var(--font-mono)', color:s.up?'var(--regime-up-mid)':'var(--regime-down-mid)', marginTop:1}}>{s.ret} · {s.retPct}</div>
              </div>
            </button>
            <button onClick={()=>onToast('Sell '+s.sym+' — spot order (prototype)')} className="arx-press" style={{flexShrink:0, height:32, padding:'0 13px', borderRadius:9, cursor:'pointer', background:'transparent', border:'.5px solid var(--border-strong)', color:'var(--regime-down-mid)', font:'600 12px var(--font-body)'}}>Sell</button>
          </div>
        ))}
        <div style={{padding:'12px 20px 4px', font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>Spot holdings settle in USDC. Selling converts to cash at market.</div>
      </>)}

      {tab==='pnl' && (<div style={{padding:'12px 0'}}>
        {/* performance vs market — 30-day return benchmark */}
        <div style={{margin:'0 20px 14px', padding:'13px 15px', borderRadius:14, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
          <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:10}}>
            <span style={{font:'600 12px var(--font-body)', color:'var(--text-primary)'}}>Performance vs market</span>
            <span style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.04em'}}>30 days</span>
          </div>
          {BENCH.map(([k,v,pct,me])=>(
            <div key={k} style={{display:'flex', alignItems:'center', gap:10, marginBottom:7}}>
              <span style={{width:32, font:`${me?700:500} 11px var(--font-body)`, color: me?'var(--text-primary)':'var(--text-tertiary)'}}>{k}</span>
              <div style={{flex:1, height:7, borderRadius:4, background:'var(--glass-control-bg)', overflow:'hidden'}}><div style={{height:'100%', width:(pct/5.1*100)+'%', borderRadius:4, background: me?'var(--color-violet-500)':'var(--border-strong)'}}/></div>
              <span className="num" style={{width:42, textAlign:'right', font:`${me?700:500} 11.5px var(--font-mono)`, color: me?'var(--regime-up-mid)':'var(--text-secondary)'}}>{v}</span>
            </div>
          ))}
          <div style={{font:'500 10.5px var(--font-body)', color:'var(--text-secondary)', marginTop:8, lineHeight:1.4}}>You're beating BTC by <b style={{color:'var(--regime-up-mid)'}}>1.9 pts</b> this period · before fees.</div>
        </div>
        {typeof PnlCalendar!=='undefined' && <PnlCalendar monthly/>}
      </div>)}

      {tab==='orders' && (<>
        <div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em', padding:'12px 20px 6px'}}>Open orders · {ords.length}</div>
        {cut('ord',ords).map((o,i)=>(
        <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'13px 20px', borderBottom:'.5px solid var(--border-default)'}}>
          <AssetGlyph sym={o.sym} size={34}/>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>
              <span style={{font:'600 14px var(--font-body)'}}>{o.sym}-PERP</span>
              <span style={{font:'700 8.5px var(--font-body)', color:ordTone(o.type), background:'color-mix(in oklab, '+ordTone(o.type)+' 14%, transparent)', padding:'1px 6px', borderRadius:999, textTransform:'uppercase', letterSpacing:'.04em'}}>{o.type}</span>
              <OrderStateBadge state={o.state}/>
            </div>
            <div className="num" style={{font:'500 10.5px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2}}>{o.side} · {o.detail}{o.trigger?' · '+o.trigger:''}</div>
          </div>
          <div style={{display:'flex', gap:6, flexShrink:0}}>
            <button onClick={()=>onToast('Edit order — price / size / trigger (prototype)')} className="arx-press" style={{height:32, padding:'0 13px', borderRadius:9, border:'.5px solid var(--border-strong)', background:'transparent', color:'var(--text-primary)', font:'600 12px var(--font-body)', cursor:'pointer'}}>Edit</button>
            <button onClick={()=>onToast(o.sym+' order canceled')} className="arx-press" style={{height:32, padding:'0 13px', borderRadius:9, border:'.5px solid var(--border-strong)', background:'transparent', color:'var(--regime-down-mid)', font:'600 12px var(--font-body)', cursor:'pointer'}}>Cancel</button>
          </div>
        </div>
        ))}
        {moreBtn('ord',ords.length)}
      </>)}

      {tab==='history' && (<>
        <div style={{display:'flex', gap:1, margin:'10px 16px 4px', borderRadius:14, overflow:'hidden', background:'var(--border-default)'}}>
          {[['Realized · 30d','+$1,842.60','var(--regime-up-mid)'],['Win rate','61%','var(--text-primary)'],['Trades','168','var(--text-primary)']].map(([k,v,c])=>(
            <div key={k} style={{flex:1, padding:'11px 12px', background:'var(--surface-elevated)'}}>
              <div style={{font:'500 9.5px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.04em'}}>{k}</div>
              <div className="num" style={{font:'600 14px var(--font-mono)', color:c, marginTop:3}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em', padding:'12px 20px 6px'}}>Recent activity</div>
        {(typeof ARX_TX!=='undefined'?ARX_TX:[]).slice(0,3).map((t,i)=>{
          const ink = t.dir==='in'?'var(--regime-up-mid)':t.dir==='out'?'var(--regime-down-mid)':'var(--color-violet-500)';
          const bg  = t.dir==='in'?'rgba(45,212,155,.12)':t.dir==='out'?'rgba(242,106,106,.12)':'rgba(124,91,255,.10)';
          return (
          <button key={i} onClick={()=>open('txHistory')} className="arx-row-press" style={{display:'flex', alignItems:'center', gap:12, width:'100%', padding:'13px 20px', borderBottom:'.5px solid var(--border-default)', background:'none', border:'none', cursor:'pointer', textAlign:'left'}}>
            <span style={{width:34, height:34, borderRadius:'50%', flexShrink:0, background:bg, color:ink, display:'flex', alignItems:'center', justifyContent:'center'}}>{typeof txIcon!=='undefined'?txIcon(t.kind):null}</span>
            <div style={{flex:1, minWidth:0}}>
              <div style={{font:'600 14px var(--font-body)', color:'var(--text-primary)'}}>{t.title}</div>
              <div style={{font:'500 10.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{t.sub}</div>
            </div>
            <div style={{textAlign:'right', flexShrink:0}}>
              <div className="num" style={{font:'600 14px var(--font-mono)', color: t.dir==='in'?'var(--regime-up-mid)':'var(--text-primary)'}}>{t.amt}</div>
              <div style={{font:'500 10.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>{t.time}</div>
            </div>
          </button>
        );})}
        <button onClick={()=>open('txHistory')} className="arx-press" style={{display:'block', width:'calc(100% - 40px)', margin:'10px 20px 4px', padding:'11px', borderRadius:11, cursor:'pointer', background:'none', border:'.5px solid var(--border-default)', font:'600 12.5px var(--font-body)', color:'var(--color-violet-500)', textAlign:'center'}}>View all activity →</button>
      </>)}

      <div style={{padding:'14px 20px 26px', font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>Mark price drives liquidation. Liq % is distance from mark to your liquidation price. Realized PnL is net of fees and funding.</div>
    </div>
  );
}

/* ════════════ SECURE WALLET · Privy durable-backup flow (post-onboarding) ════════════ */
function SecureWalletScreen({ onBack, onToast }) {
  const [method, setMethod] = yhS('passkey');
  const backed = (()=>{ try { return localStorage.getItem('arx-wallet-backed')==='1'; } catch(e){ return false; } })();
  const M = [['passkey','Passkey','Face ID / Touch ID on this device','recommended'],['email','Email','Recovery link to your inbox',''],['phone','Phone','SMS code backup','']];
  const addBackup = () => {
    try { localStorage.setItem('arx-wallet-backed','1'); window.dispatchEvent(new Event('arx-demo')); } catch(e){}
    onToast('Wallet backup added'); onBack();
  };
  return (
    <SubShell title="Secure your wallet" onBack={onBack}>
      <div style={{padding:'2px 20px 6px'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:6}}>
          <span style={{width:40, height:40, borderRadius:12, flexShrink:0, background:'rgba(124,91,255,.14)', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-violet-500)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
          </span>
          {backed && <span style={{font:'700 9px var(--font-body)', color:'var(--regime-up-dark)', background:'rgba(45,212,155,.14)', padding:'3px 8px', borderRadius:999}}>BACKUP ON</span>}
        </div>
        <div style={{font:'400 13px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5}}>You signed in with a social login. Those can be lost or suspended — and your wallet goes with them. Add a durable backup so you can always recover, especially before you add funds.</div>
      </div>
      <div style={{margin:'14px 16px 0', borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', overflow:'hidden'}}>
        {M.map(([id,t,d,rec],i)=>(
          <button key={id} onClick={()=>setMethod(id)} className="arx-row-press" style={{width:'100%', display:'flex', alignItems:'center', gap:12, padding:'14px 15px', background:'none', border:'none', cursor:'pointer', textAlign:'left', borderTop:i?'.5px solid var(--border-default)':'none'}}>
            <div style={{flex:1}}>
              <div style={{display:'flex', alignItems:'center', gap:8}}><span style={{font:'600 14.5px var(--font-body)'}}>{t}</span>{rec && <span style={{font:'700 8.5px var(--font-body)', color:'var(--regime-up-dark)', background:'rgba(45,212,155,.14)', padding:'2px 7px', borderRadius:999}}>RECOMMENDED</span>}</div>
              <div style={{font:'400 12px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>{d}</div>
            </div>
            <span style={{width:22, height:22, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:method===id?'var(--color-violet-500)':'transparent', border:method===id?'none':'1.5px solid var(--border-strong)'}}>{method===id && <IconCheck color="#fff" size={13}/>}</span>
          </button>
        ))}
      </div>
      <div style={{padding:'12px 20px 0', font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>Neither Arx nor Privy can re-link a new login on your behalf. A backup is your only recovery path.</div>
      <div style={{padding:'16px 16px 28px'}}>
        <button onClick={addBackup} className="arx-press" style={{height:48, width:'100%', borderRadius:13, border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'700 14px var(--font-body)', boxShadow:'var(--shadow-execute)'}}>{method==='passkey'?'Add a passkey':method==='email'?'Add email backup':'Add phone backup'}</button>
        <button onClick={onBack} style={{marginTop:10, height:44, width:'100%', borderRadius:12, cursor:'pointer', background:'transparent', border:'.5px solid var(--border-default)', color:'var(--text-secondary)', font:'600 13px var(--font-body)'}}>Maybe later</button>
      </div>
    </SubShell>
  );
}

Object.assign(window, { FaqScreen, ProfileScreen, SettingsScreen, RewardsScreen, ReferralsScreen, FundingHubScreen, LeaderVerifyScreen, PortfolioScreen, PortfolioLedger, SecureWalletScreen, IconGear, SgGroup, SgRow, SgToggle, SgSegment, ARX_SPOT });
