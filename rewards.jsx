/* ═══ ARX · Rewards & Referrals (migrated from prototype, rebuilt on DS v6) ═══
   Opened as a sub-screen: __arxOpenSub('rewards') or ('rewards',{tab:'referrals'}).
   Two tabs:
     · Rewards   — points, tier ladder (Bronze→Silver→Gold→Diamond), daily streak, ways to earn
     · Referrals — multi-level L1/L2/L3 structure, claimable USDC, by-tier earnings, milestone
   Uses SubShell + Spark from the base. Referral code ties to the signed-in handle. */

const { useState: rwS } = React;

const RW_CODE = 'ARX-ELON';
const RW_LINK = 'arx.trade/?ref=ARX-ELON';

/* ── ARX membership tiers — Coincall-style VIP fee ladder × Bonvoy-style elite benefits.
   Points come from trading/copying/streaks (like Bonvoy nights); each tier unlocks
   a maker/taker fee discount (like Coincall VIP) plus lifestyle perks. ── */
const ARX_TIERS = [
  { id:'member',   label:'Member',   min:0,     color:'#8A8FA3', disc:'0%',  taker:0.045, maker:0.015, mult:'1×',    slots:5,  blurb:'Where everyone starts.' },
  { id:'silver',   label:'Silver',   min:2000,  color:'#B7BCC9', disc:'5%',  taker:0.043, maker:0.014, mult:'1.05×', slots:10, blurb:'For the consistent trader.' },
  { id:'gold',     label:'Gold',     min:5000,  color:'#E5B23B', disc:'15%', taker:0.038, maker:0.013, mult:'1.1×',  slots:20, blurb:'Serious volume, serious perks.' },
  { id:'platinum', label:'Platinum', min:12000, color:'#9AA7B8', disc:'25%', taker:0.034, maker:0.011, mult:'1.2×',  slots:'∞', blurb:'The pro tier.' },
  { id:'black',    label:'Black',    min:30000, color:'#7C5BFF', disc:'40%', taker:0.027, maker:0.009, mult:'1.3×',  slots:'∞', blurb:'By invitation. The summit.' },
];
const RW_TIERS = ARX_TIERS; // back-compat for the hero progress logic

/* Per-tier benefit list (Bonvoy member-benefits style) — cumulative: each tier
   inherits everything below it, plus the items shown. */
const TIER_BENEFITS = {
  member:   [['💱','Standard trading fees','Taker 0.045% · Maker 0.015%'],['🔁','5 copy slots','Mirror up to 5 traders at once'],['🎯','Earn $ARX points','On every trade, copy & daily streak']],
  silver:   [['💱','5% fee discount','Taker 0.043% · Maker 0.014%'],['🔁','10 copy slots','Double your mirrored traders'],['⚡','Priority support','Front-of-queue chat support'],['✨','1.05× points','5% bonus on everything you earn']],
  gold:     [['💱','15% fee discount','Taker 0.038% · Maker 0.013%'],['🔁','20 copy slots','Run a deep copy book'],['💸','2 free withdrawals / mo','Network fees on us'],['🚀','Early market access','Trade new listings 24h early'],['✨','1.1× points','10% bonus on everything you earn']],
  platinum: [['💱','25% fee discount','Taker 0.034% · Maker 0.011%'],['♾️','Unlimited copy slots','No cap on mirrored traders'],['💸','Unlimited free withdrawals','Network fees always on us'],['🏆','Exclusive contests','Platinum-only prize pools'],['🧑‍💼','Dedicated manager','A human, on call'],['✨','1.2× points','20% bonus on everything you earn']],
  black:    [['💱','40% fee discount','Taker 0.027% · Maker 0.009% — best on ARX'],['🔭','Private signal desk','Curated alpha from the ARX desk'],['🥂','IRL events & concierge','Invites + a concierge line'],['🎁','Bespoke rewards','Hand-picked redemptions'],['✨','1.3× points','30% bonus — the highest multiplier']],
};

/* $ARX points redemption catalog (Bonvoy redeem style) — grouped. */
const REDEEM_CATALOG = [
  { group:'Fee rebates', items:[
    { id:'fee25',  icon:'💸', t:'$25 fee rebate',  s:'Credited to your next 30 days of fees', cost:1500 },
    { id:'fee100', icon:'💸', t:'$100 fee rebate', s:'Credited to your next 30 days of fees', cost:5000 },
    { id:'feemo',  icon:'🪙', t:'30 days zero maker fees', s:'Maker fees waived for a month', cost:7000 },
  ]},
  { group:'$ARX token', items:[
    { id:'arx500',  icon:'🟣', t:'500 $ARX', s:'Airdropped to your wallet', cost:4000 },
    { id:'arx1500', icon:'🟣', t:'1,500 $ARX', s:'Airdropped to your wallet', cost:11000 },
  ]},
  { group:'Status & access', items:[
    { id:'blacktrial', icon:'⬛', t:'Black tier · 30-day trial', s:'Taste the summit — best fees + perks', cost:10000 },
    { id:'signals',    icon:'🔭', t:'Private signals · 30 days', s:'The ARX desk’s curated alpha', cost:4000 },
    { id:'contest',    icon:'🏆', t:'VIP contest entry', s:'Into the next Platinum-only pool', cost:2500 },
  ]},
  { group:'Merch', items:[
    { id:'cap',    icon:'🧢', t:'ARX cap', s:'Purple-on-black, embroidered mark', cost:3000 },
    { id:'hoodie', icon:'👕', t:'ARX hoodie', s:'Heavyweight, limited run', cost:6000 },
  ]},
];

function rwCopy(txt, onToast){ try{ if(navigator.clipboard) navigator.clipboard.writeText(txt); }catch(e){} onToast && onToast('Copied to clipboard'); }
function rwShare(onToast){
  const text = 'Trade everything, copy the best — on ARX. Use my code ' + RW_CODE;
  if (navigator.share) navigator.share({ title:'Join me on ARX', text, url:'https://'+RW_LINK }).catch(()=>{});
  else rwCopy(RW_LINK, onToast);
}

/* ── small UI atoms on DS tokens ── */
const rwLabel = { font:'700 10px var(--font-body)', letterSpacing:'.07em', textTransform:'uppercase', color:'var(--text-tertiary)' };
const rwCard  = { background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:16 };

function RwStat({ label, value, sub }) {
  return (
    <div style={{...rwCard, flex:1, padding:14}}>
      <div style={rwLabel}>{label}</div>
      <div className="num" style={{font:'700 22px var(--font-mono)', letterSpacing:'-.02em', marginTop:5, color:'var(--text-primary)'}}>{value}</div>
      {sub && <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>{sub}</div>}
    </div>
  );
}

/* ════════ REWARDS TAB ════════ */
function RewardsBody({ onToast, onOpenMembership, onOpenRedeem }) {
  const pts = 2840;
  const cur = RW_TIERS.filter(t => pts >= t.min).pop();
  const next = RW_TIERS.find(t => t.min > pts);
  const prevMin = cur.min, span = next ? next.min - prevMin : 1;
  const prog = next ? Math.min(1, (pts - prevMin) / span) : 1;
  const streak = 12;
  const week = [1,1,1,1,1,1,0]; // last 7 days claimed

  const EARN = [
    { icon:'🔁', t:'Copy a trader', s:'+50 pts per new copy started', pts:'+50' },
    { icon:'📈', t:'Daily trade',   s:'+20 pts for a trade each day',  pts:'+20' },
    { icon:'🔥', t:'Keep the streak', s:'+10 pts/day · bonus at 7 & 30', pts:'+10' },
    { icon:'👥', t:'Refer a friend', s:'+200 pts when they fund',       pts:'+200' },
  ];

  return (
    <div style={{display:'flex', flexDirection:'column', gap:16, padding:'8px 20px 28px'}}>
      {/* Points hero + tier progress — tap to open membership */}
      <button onClick={onOpenMembership} className="arx-press" style={{textAlign:'left', width:'100%', border:'none', cursor:'pointer', background:'linear-gradient(150deg, var(--color-violet-500), var(--color-violet-700))', borderRadius:18, padding:18, color:'#fff', boxShadow:'var(--shadow-execute)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
          <div>
            <div style={{font:'700 10px var(--font-body)', letterSpacing:'.08em', textTransform:'uppercase', color:'rgba(255,255,255,.72)'}}>Your points</div>
            <div className="num" style={{font:'800 38px var(--font-mono)', letterSpacing:'-.03em', lineHeight:1.05, marginTop:4}}>{pts.toLocaleString()}</div>
          </div>
          <span style={{display:'inline-flex', alignItems:'center', gap:6, padding:'5px 11px', borderRadius:999, background:'rgba(255,255,255,.16)', font:'700 12px var(--font-body)'}}>
            <span style={{width:8, height:8, borderRadius:'50%', background:cur.color}}/>{cur.label} tier
          </span>
        </div>
        <div style={{marginTop:16}}>
          <div style={{display:'flex', justifyContent:'space-between', font:'600 11px var(--font-body)', color:'rgba(255,255,255,.82)', marginBottom:6}}>
            <span>{cur.label}</span>
            {next ? <span>{(next.min - pts).toLocaleString()} pts to {next.label}</span> : <span>Max tier reached</span>}
          </div>
          <div style={{height:8, borderRadius:999, background:'rgba(255,255,255,.22)', overflow:'hidden'}}>
            <div style={{width:(prog*100)+'%', height:'100%', borderRadius:999, background:'#fff', transition:'width .5s cubic-bezier(.2,.7,.2,1)'}}/>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:5, marginTop:11, font:'600 11.5px var(--font-body)', color:'rgba(255,255,255,.9)'}}>
            View {cur.label} benefits
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        </div>
      </button>

      {/* Streak */}
      <div style={{...rwCard, padding:16}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <span style={{fontSize:20}}>🔥</span>
            <div>
              <div style={{font:'700 14px var(--font-body)', color:'var(--text-primary)'}}>{streak}-day streak</div>
              <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)'}}>Your best run yet — don't break it</div>
            </div>
          </div>
          <span className="num" style={{font:'700 12px var(--font-mono)', color:'var(--color-violet-500)'}}>+10/day</span>
        </div>
        <div style={{display:'flex', gap:6}}>
          {week.map((on,i)=>(
            <div key={i} style={{flex:1, height:32, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
              background: on ? 'rgba(124,91,255,.16)' : 'var(--glass-control-bg)',
              border: on ? '1px solid var(--color-violet-500)' : '.5px solid var(--border-default)',
              font:'700 10px var(--font-body)', color: on ? 'var(--color-violet-500)' : 'var(--text-tertiary)'}}>
              {on ? '✓' : ['M','T','W','T','F','S','S'][i]}
            </div>
          ))}
        </div>
      </div>

      {/* Ways to earn */}
      <div style={{display:'flex', flexDirection:'column', gap:8}}>
        <div style={rwLabel}>Ways to earn</div>
        {EARN.map((e,i)=>(
          <div key={i} style={{...rwCard, padding:'12px 14px', display:'flex', alignItems:'center', gap:12}}>
            <span style={{width:38, height:38, borderRadius:11, background:'var(--glass-control-bg)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0}}>{e.icon}</span>
            <div style={{flex:1}}>
              <div style={{font:'700 13.5px var(--font-body)', color:'var(--text-primary)'}}>{e.t}</div>
              <div style={{font:'400 11.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>{e.s}</div>
            </div>
            <span className="num" style={{font:'700 13px var(--font-mono)', color:'var(--regime-up-mid)', flexShrink:0}}>{e.pts}</span>
          </div>
        ))}
      </div>

      {/* Redeem CTA */}
      <button onClick={onOpenRedeem} className="arx-press" style={{height:50, borderRadius:'var(--r-md)', border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'700 14.5px var(--font-body)', boxShadow:'var(--shadow-execute)', display:'flex', alignItems:'center', justifyContent:'center', gap:8}}>
        Redeem $ARX points
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  );
}

/* ════════ REFERRALS TAB ════════ */
/* Deterministic per-tier referral list — each referral's 30d volume drives the
   commission at this tier's cut, and the sum reconciles to the tier total. */
const REF_NAMES = ['cryptodad.eth','@solrider','0x7a3f…c891','@degenmax','liquidity.eth','@apexwhale','0x4f21…2d6a','@chainwatch','frosty.eth','@moonops','0x91be…77f0','@deltaone','vault.eth','@nightowl','0x2aab…6265','@razorback'];
function buildRefList(tier, mult){
  const cutPct = parseInt(tier.cut, 10);       // 30 / 5 / 2
  const feeRate = 0.0004;                        // ~4bps blended taker fee
  let h = 0; for (const c of tier.id) h = (h*31 + c.charCodeAt(0)) % 99991;
  const rnd = () => { h = (h*9301 + 49297) % 233280; return h/233280; };
  const showN = tier.id==='L1' ? 12 : tier.refs;
  const weights = []; let wsum = 0;
  for (let i=0;i<showN;i++){ const w = Math.pow(0.82,i)*(0.7+rnd()*0.6); weights.push(w); wsum += w; }
  const earned = tier.earned * mult;
  const joinedOpts = ['2d','5d','1w','2w','3w','1mo','1mo','2mo','2mo','3mo','4mo','5mo'];
  const off = tier.id==='L2' ? 4 : tier.id==='L3' ? 10 : 0;
  return weights.map((w,i)=>{
    const comm = earned * (w/wsum);
    const vol = comm / (feeRate * (cutPct/100));
    return { name: REF_NAMES[(i+off)%REF_NAMES.length], joined: joinedOpts[i%12], vol, comm, active: rnd() > 0.34 };
  });
}
const fmtMoney = v => v>=1e6 ? '$'+(v/1e6).toFixed(2)+'M' : v>=1e3 ? '$'+(v/1e3).toFixed(0)+'K' : '$'+v.toFixed(0);
const fmtComm  = v => v>=1000 ? '$'+v.toFixed(0) : '$'+v.toFixed(2);

function TierDetail({ tier, onBack, onToast }){
  const cutPct = parseInt(tier.cut, 10);
  return (
    <div style={{display:'flex', flexDirection:'column', gap:14, padding:'8px 20px 40px'}}>
      <button onClick={onBack} style={{display:'inline-flex', alignItems:'center', gap:7, background:'none', border:'none', padding:0, cursor:'pointer', alignSelf:'flex-start', color:'var(--color-violet-500)'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        <span style={{font:'700 13px var(--font-body)'}}>All tiers</span>
      </button>

      {/* tier summary */}
      <div style={{...rwCard, padding:16, display:'flex', alignItems:'center', gap:14}}>
        <span style={{width:48, height:48, borderRadius:'50%', flexShrink:0, background:'rgba(124,91,255,.14)', color:'var(--color-violet-500)', display:'inline-flex', alignItems:'center', justifyContent:'center', font:'800 16px var(--font-mono)'}}>{tier.id}</span>
        <div style={{flex:1}}>
          <div style={{font:'700 16px var(--font-body)', color:'var(--text-primary)'}}>{tier.label}</div>
          <div style={{font:'400 12px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>{tier.refs} referrals · you earn {cutPct}% of their fees</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div className="num" style={{font:'800 20px var(--font-mono)', color:'var(--text-primary)'}}>{fmtComm(tier.earned*tier.mult)}</div>
          <div style={{font:'400 10px var(--font-body)', color:'var(--text-tertiary)'}}>{tier.periodLabel}</div>
        </div>
      </div>

      <div style={{...rwLabel, display:'flex', justifyContent:'space-between'}}>
        <span>Referral</span><span>Your commission</span>
      </div>

      {/* per-referral list */}
      <div style={{display:'flex', flexDirection:'column', gap:8}}>
        {tier.list.map((r,i)=>(
          <div key={i} style={{...rwCard, padding:'12px 14px', display:'flex', alignItems:'center', gap:12}}>
            <span style={{width:38, height:38, borderRadius:'50%', flexShrink:0, background:'var(--glass-control-bg)', color:'var(--text-secondary)', display:'inline-flex', alignItems:'center', justifyContent:'center', font:'700 14px var(--font-body)', position:'relative'}}>
              {r.name.replace(/^[@0]/,'').charAt(0).toUpperCase()}
              <span style={{position:'absolute', right:-1, bottom:-1, width:10, height:10, borderRadius:'50%', border:'2px solid var(--surface-elevated)', background: r.active ? 'var(--regime-up-mid)' : 'var(--text-tertiary)'}}/>
            </span>
            <div style={{flex:1, minWidth:0}}>
              <div className="num" style={{font:'600 13px var(--font-body)', color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.name}</div>
              <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>joined {r.joined} · {fmtMoney(r.vol)} vol</div>
            </div>
            <div style={{textAlign:'right', flexShrink:0}}>
              <div className="num" style={{font:'700 14px var(--font-mono)', color:'var(--regime-up-mid)'}}>{fmtComm(r.comm)}</div>
              <div style={{font:'400 10px var(--font-body)', color:'var(--text-tertiary)'}}>{cutPct}% cut</div>
            </div>
          </div>
        ))}
      </div>
      {tier.id==='L1' && tier.refs > tier.list.length && (
        <div style={{textAlign:'center', font:'500 12px var(--font-body)', color:'var(--text-tertiary)', padding:'4px 0'}}>+{tier.refs - tier.list.length} more referrals</div>
      )}
    </div>
  );
}

function ReferralsBody({ onToast, onOpenTier }) {
  const [period, setPeriod] = rwS('30d');
  const tiers = [
    { id:'L1', label:'Direct (L1)',   cut:'30% cut', refs:32, earned:360, spark:[10,12,11,13,14,13,16,18,22,28,32,36] },
    { id:'L2', label:'Indirect (L2)', cut:'5% cut',  refs:5,  earned:44,  spark:[3,4,3,4,5,5,6,6,8,9,10,11] },
    { id:'L3', label:'Network (L3)',  cut:'2% cut',  refs:1,  earned:7,   spark:[1,1,1,2,2,2,3,3,4,5,6,7] },
  ];
  const total = tiers.reduce((s,t)=>s+t.earned,0);
  const mult = period==='7d' ? 0.3 : period==='all' ? 4.1 : 1;
  const [claimed, setClaimed] = rwS(false);
  const payoutAt = (()=>{ const d=new Date(); d.setUTCDate(d.getUTCDate()+1); d.setUTCHours(0,0,0,0); return d.toLocaleDateString(undefined,{month:'short',day:'numeric'})+' · 00:00 UTC'; })();
  const periodLabel = period==='7d'?'last 7 days':period==='all'?'all time':'last 30 days';
  const openTier = (t) => onOpenTier && onOpenTier({ ...t, mult, periodLabel, list: buildRefList(t, mult) });

  return (
    <div style={{display:'flex', flexDirection:'column', gap:14, padding:'8px 20px 28px'}}>
      {/* Code */}
      <div style={{display:'flex', flexDirection:'column', gap:4}}>
        <div style={rwLabel}>Your referral code</div>
        <button onClick={()=>rwCopy(RW_CODE, onToast)} style={{display:'flex', alignItems:'baseline', gap:8, background:'none', border:'none', padding:0, cursor:'pointer', alignSelf:'flex-start'}}>
          <span className="num" style={{font:'800 30px var(--font-mono)', letterSpacing:'-.02em', color:'var(--color-violet-500)', whiteSpace:'nowrap'}}>{RW_CODE}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
        </button>
      </div>

      {/* Claimable hero */}
      <div style={{background:'linear-gradient(150deg, var(--color-violet-500), var(--color-violet-700))', borderRadius:18, padding:18, color:'#fff', display:'flex', alignItems:'center', gap:14, boxShadow:'var(--shadow-execute)'}}>
        <div style={{flex:1}}>
          <div style={{font:'700 10px var(--font-body)', letterSpacing:'.08em', textTransform:'uppercase', color:'rgba(255,255,255,.74)'}}>Claimable</div>
          <div style={{display:'flex', alignItems:'baseline', gap:6, marginTop:3}}>
            <span className="num" style={{font:'800 36px var(--font-mono)', letterSpacing:'-.03em', lineHeight:1}}>$142.40</span>
            <span style={{font:'700 12px var(--font-body)', color:'rgba(255,255,255,.74)'}}>USDC</span>
          </div>
          <div style={{font:'400 11.5px var(--font-body)', color:'rgba(255,255,255,.78)', marginTop:4}}>{claimed ? `Paid out ${payoutAt}` : 'Next payout: tomorrow · 00:00 UTC'}</div>
        </div>
        {claimed ? (
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'8px 18px', borderRadius:999, background:'rgba(255,255,255,.16)', flexShrink:0}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            <span style={{font:'700 10px var(--font-body)', color:'#fff', letterSpacing:'.03em'}}>CLAIMED</span>
          </div>
        ) : (
          <button onClick={()=>{ setClaimed(true); onToast('$142.40 USDC claimed · paying '+payoutAt); }} className="arx-press" style={{padding:'11px 22px', borderRadius:999, background:'#fff', color:'var(--color-violet-700)', border:'none', font:'700 14px var(--font-body)', cursor:'pointer', flexShrink:0}}>Claim</button>
        )}
      </div>

      {/* Stat cards */}
      <div style={{display:'flex', gap:10}}>
        <RwStat label="Lifetime earned" value="$1,284" sub="38 referrals"/>
        <RwStat label="Active (30d)" value="12" sub="of 38 total"/>
      </div>

      {/* By tier */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', paddingTop:2}}>
        <div>
          <div style={{font:'700 15px var(--font-body)', color:'var(--text-primary)'}}>By tier</div>
          <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>Total ${Math.round(total*mult)} · {period==='7d'?'last 7 days':period==='all'?'all time':'last 30 days'}</div>
        </div>
        <div style={{display:'flex', background:'var(--glass-control-bg)', padding:2, borderRadius:999}}>
          {[['7d','7d'],['30d','30d'],['all','All']].map(([id,l])=>(
            <button key={id} onClick={()=>setPeriod(id)} style={{padding:'6px 13px', borderRadius:999, border:'none', cursor:'pointer', font:'700 12px var(--font-body)',
              background: period===id ? 'var(--color-violet-500)' : 'transparent', color: period===id ? '#fff' : 'var(--text-secondary)'}}>{l}</button>
          ))}
        </div>
      </div>

      {/* Tier rows */}
      <div style={{display:'flex', flexDirection:'column', gap:8}}>
        {tiers.map(t=>(
          <button key={t.id} onClick={()=>openTier(t)} className="arx-press" style={{...rwCard, padding:14, display:'flex', alignItems:'center', gap:12, cursor:'pointer', textAlign:'left', width:'100%'}}>
            <span style={{width:44, height:44, borderRadius:'50%', flexShrink:0, background:'rgba(124,91,255,.14)', color:'var(--color-violet-500)',
              display:'inline-flex', alignItems:'center', justifyContent:'center', font:'800 14px var(--font-mono)'}}>{t.id}</span>
            <div style={{flex:1, minWidth:0}}>
              <div style={{font:'700 14px var(--font-body)', color:'var(--text-primary)'}}>{t.label}</div>
              <div style={{font:'400 11.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>{t.refs} referrals · {t.cut}</div>
            </div>
            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4}}>
              <span className="num" style={{font:'700 16px var(--font-mono)', color:'var(--text-primary)'}}>${Math.round(t.earned*mult)}</span>
              <Spark data={t.spark} positive w={64} h={20}/>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M9 18l6-6-6-6"/></svg>
          </button>
        ))}
      </div>

      {/* How multi-level works */}
      <div style={{...rwCard, padding:14}}>
        <div style={{font:'700 13px var(--font-body)', color:'var(--text-primary)', marginBottom:6}}>How multi-level works</div>
        <div style={{font:'400 12px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.55}}>
          You earn on <b style={{color:'var(--text-primary)'}}>three levels</b>. <b style={{color:'var(--color-violet-500)'}}>L1</b> — people who use your code (30% of their fees). <b style={{color:'var(--color-violet-500)'}}>L2</b> — people <i>they</i> refer (5%). <b style={{color:'var(--color-violet-500)'}}>L3</b> — the next level out (2%). Rewards accrue in USDC and are claimable daily.
        </div>
      </div>

      {/* Milestone */}
      <div style={{display:'flex', flexDirection:'column', gap:8, paddingTop:2}}>
        <div style={{font:'700 15px var(--font-body)', color:'var(--text-primary)'}}>Next milestone</div>
        <div style={{...rwCard, padding:14}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10}}>
            <span style={{font:'600 13.5px var(--font-body)', color:'var(--text-primary)'}}>$0-fee swaps at 100 referrals</span>
            <span className="num" style={{font:'700 13px var(--font-mono)', color:'var(--color-violet-500)'}}>38/100</span>
          </div>
          <div style={{height:7, background:'rgba(124,91,255,.16)', borderRadius:999, overflow:'hidden'}}>
            <div style={{height:'100%', width:'38%', background:'var(--color-violet-500)', borderRadius:999}}/>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════ MEMBERSHIP BENEFITS (Bonvoy member-benefits style) ════════ */
function MembershipBenefits({ onBack }) {
  const pts = 2840;
  const curIdx = ARX_TIERS.reduce((a,t,i)=> pts>=t.min ? i : a, 0);
  const [view, setView] = rwS(curIdx);
  const t = ARX_TIERS[view];
  const benefits = TIER_BENEFITS[t.id];
  return (
    <div style={{display:'flex', flexDirection:'column', gap:16, padding:'8px 20px 40px'}}>
      <button onClick={onBack} style={{display:'inline-flex', alignItems:'center', gap:7, background:'none', border:'none', padding:0, cursor:'pointer', alignSelf:'flex-start', color:'var(--color-violet-500)'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        <span style={{font:'700 13px var(--font-body)'}}>Rewards</span>
      </button>

      <div style={{display:'flex', flexDirection:'column', gap:3}}>
        <span style={rwLabel}>ARX Membership</span>
        <span style={{font:'800 22px var(--font-brand)', letterSpacing:'-.02em', color:'var(--text-primary)'}}>Five tiers. One climb.</span>
        <span style={{font:'400 12.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>Earn $ARX points on every trade, copy and streak. Each tier cuts your fees and unlocks more.</span>
      </div>

      {/* tier selector */}
      <div style={{display:'flex', gap:7, overflowX:'auto', margin:'0 -20px', padding:'0 20px', scrollbarWidth:'none'}}>
        {ARX_TIERS.map((x,i)=>(
          <button key={x.id} onClick={()=>setView(i)} className="arx-press" style={{flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'12px 14px', borderRadius:14, cursor:'pointer',
            border: view===i ? '2px solid var(--color-violet-500)' : '.5px solid var(--border-default)',
            background: view===i ? 'rgba(124,91,255,.10)' : 'var(--surface-elevated)', minWidth:78}}>
            <span style={{width:30, height:30, borderRadius:'50%', background:x.color, display:'inline-flex', alignItems:'center', justifyContent:'center', font:'800 11px var(--font-mono)', color:'#fff', boxShadow:i<=curIdx?'0 0 0 3px rgba(124,91,255,.18)':'none'}}>{x.label[0]}</span>
            <span style={{font:'700 11px var(--font-body)', color: view===i?'var(--text-primary)':'var(--text-secondary)'}}>{x.label}</span>
            {i===curIdx && <span style={{font:'700 8px var(--font-body)', color:'var(--color-violet-500)', letterSpacing:'.04em'}}>YOU</span>}
            {i!==curIdx && <span style={{font:'500 8px var(--font-mono)', color:'var(--text-tertiary)'}}>{x.min.toLocaleString()}</span>}
          </button>
        ))}
      </div>

      {/* selected tier hero */}
      <div style={{...rwCard, padding:18, background:'linear-gradient(150deg, '+t.color+'22, var(--surface-elevated))'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <div style={{font:'800 22px var(--font-brand)', color:'var(--text-primary)', display:'flex', alignItems:'center', gap:8}}>
              <span style={{width:12, height:12, borderRadius:'50%', background:t.color}}/>{t.label}
            </div>
            <div style={{font:'400 12px var(--font-body)', color:'var(--text-tertiary)', marginTop:3}}>{t.blurb}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div className="num" style={{font:'800 20px var(--font-mono)', color:'var(--color-violet-500)'}}>−{t.disc}</div>
            <div style={{font:'400 10px var(--font-body)', color:'var(--text-tertiary)'}}>trading fees</div>
          </div>
        </div>
        <div style={{display:'flex', gap:8, marginTop:14}}>
          {[['Taker', t.taker+'%'],['Maker', t.maker+'%'],['Copy slots', t.slots],['Points', t.mult]].map(([k,v])=>(
            <div key={k} style={{flex:1, background:'var(--glass-control-bg)', borderRadius:10, padding:'8px 6px', textAlign:'center'}}>
              <div className="num" style={{font:'700 13px var(--font-mono)', color:'var(--text-primary)'}}>{v}</div>
              <div style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>{k}</div>
            </div>
          ))}
        </div>
      </div>

      {/* benefits list */}
      <div style={{display:'flex', flexDirection:'column', gap:8}}>
        <span style={rwLabel}>{view>curIdx ? `Unlock at ${t.label}` : `${t.label} benefits`}</span>
        {benefits.map((b,i)=>(
          <div key={i} style={{...rwCard, padding:'13px 14px', display:'flex', alignItems:'flex-start', gap:12, opacity: view>curIdx?0.92:1}}>
            <span style={{width:38, height:38, borderRadius:11, background:'var(--glass-control-bg)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0}}>{b[0]}</span>
            <div style={{flex:1}}>
              <div style={{font:'700 13.5px var(--font-body)', color:'var(--text-primary)'}}>{b[1]}</div>
              <div style={{font:'400 11.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:1, lineHeight:1.4}}>{b[2]}</div>
            </div>
            {view<=curIdx && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--regime-up-mid)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0, marginTop:2}}><path d="M20 6L9 17l-5-5"/></svg>}
            {view>curIdx && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" style={{flexShrink:0, marginTop:3}}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>}
          </div>
        ))}
        {view>curIdx && (
          <div style={{font:'400 11.5px var(--font-body)', color:'var(--text-tertiary)', textAlign:'center', padding:'4px 10px', lineHeight:1.5}}>
            {(t.min - pts).toLocaleString()} more points to reach {t.label}. Plus everything in {ARX_TIERS[view-1].label}.
          </div>
        )}
      </div>

      {/* full fee ladder */}
      <div style={{display:'flex', flexDirection:'column', gap:8}}>
        <span style={rwLabel}>Fee schedule · all tiers</span>
        <div style={{...rwCard, overflow:'hidden'}}>
          <div style={{display:'grid', gridTemplateColumns:'1.3fr 1fr 1fr 1fr', padding:'10px 12px', borderBottom:'.5px solid var(--border-default)', font:'700 9.5px var(--font-body)', letterSpacing:'.04em', textTransform:'uppercase', color:'var(--text-tertiary)'}}>
            <span>Tier</span><span style={{textAlign:'right'}}>Taker</span><span style={{textAlign:'right'}}>Maker</span><span style={{textAlign:'right'}}>From</span>
          </div>
          {ARX_TIERS.map((x,i)=>(
            <div key={x.id} style={{display:'grid', gridTemplateColumns:'1.3fr 1fr 1fr 1fr', padding:'11px 12px', borderBottom: i<ARX_TIERS.length-1?'.5px solid var(--border-default)':'none', alignItems:'center', background: i===curIdx?'rgba(124,91,255,.07)':'transparent'}}>
              <span style={{display:'inline-flex', alignItems:'center', gap:7, font:'700 12.5px var(--font-body)', color:'var(--text-primary)'}}><span style={{width:8, height:8, borderRadius:'50%', background:x.color}}/>{x.label}</span>
              <span className="num" style={{textAlign:'right', font:'600 12px var(--font-mono)', color:'var(--text-secondary)'}}>{x.taker}%</span>
              <span className="num" style={{textAlign:'right', font:'600 12px var(--font-mono)', color:'var(--text-secondary)'}}>{x.maker}%</span>
              <span className="num" style={{textAlign:'right', font:'600 11px var(--font-mono)', color:'var(--text-tertiary)'}}>{x.min===0?'0':(x.min/1000)+'k'}</span>
            </div>
          ))}
        </div>
        <span style={{font:'400 10px var(--font-body)', color:'var(--text-tertiary)', textAlign:'center'}}>Discounts apply to perps & spot. Points reset never — tiers reviewed every 90 days.</span>
      </div>
    </div>
  );
}

/* ════════ REDEEM $ARX POINTS (Bonvoy redeem style) ════════ */
function RedeemCatalog({ onBack, onToast }) {
  const [bal, setBal] = rwS(2840);
  const redeem = (it) => {
    if (bal < it.cost) { onToast && onToast('Not enough points yet'); return; }
    setBal(b => b - it.cost);
    onToast && onToast('Redeemed · ' + it.t);
  };
  return (
    <div style={{display:'flex', flexDirection:'column', gap:16, padding:'8px 20px 40px'}}>
      <button onClick={onBack} style={{display:'inline-flex', alignItems:'center', gap:7, background:'none', border:'none', padding:0, cursor:'pointer', alignSelf:'flex-start', color:'var(--color-violet-500)'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        <span style={{font:'700 13px var(--font-body)'}}>Rewards</span>
      </button>

      {/* balance hero */}
      <div style={{background:'linear-gradient(150deg, var(--color-violet-500), var(--color-violet-700))', borderRadius:18, padding:'16px 18px', color:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'var(--shadow-execute)'}}>
        <div>
          <div style={{font:'700 10px var(--font-body)', letterSpacing:'.08em', textTransform:'uppercase', color:'rgba(255,255,255,.74)'}}>Available to redeem</div>
          <div className="num" style={{font:'800 30px var(--font-mono)', letterSpacing:'-.02em', marginTop:3}}>{bal.toLocaleString()} <span style={{font:'700 14px var(--font-body)', color:'rgba(255,255,255,.74)'}}>pts</span></div>
        </div>
        <span style={{fontSize:32}}>🟣</span>
      </div>

      {REDEEM_CATALOG.map(grp=>(
        <div key={grp.group} style={{display:'flex', flexDirection:'column', gap:8}}>
          <span style={rwLabel}>{grp.group}</span>
          {grp.items.map(it=>{
            const can = bal >= it.cost;
            return (
              <div key={it.id} style={{...rwCard, padding:'13px 14px', display:'flex', alignItems:'center', gap:12}}>
                <span style={{width:42, height:42, borderRadius:12, background:'var(--glass-control-bg)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0}}>{it.icon}</span>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{font:'700 13.5px var(--font-body)', color:'var(--text-primary)'}}>{it.t}</div>
                  <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:1, lineHeight:1.4}}>{it.s}</div>
                </div>
                <button onClick={()=>redeem(it)} className="arx-press" style={{flexShrink:0, height:34, padding:'0 14px', borderRadius:10, border:'none', cursor: can?'pointer':'default',
                  background: can?'var(--color-violet-500)':'var(--glass-control-bg)', color: can?'#fff':'var(--text-tertiary)', font:'700 11.5px var(--font-mono)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', lineHeight:1.1}}>
                  <span>{it.cost.toLocaleString()}</span>
                  <span style={{font:'600 7.5px var(--font-body)', opacity:.85}}>{can?'REDEEM':'pts'}</span>
                </button>
              </div>
            );
          })}
        </div>
      ))}
      <span style={{font:'400 10px var(--font-body)', color:'var(--text-tertiary)', textAlign:'center', lineHeight:1.5}}>Redemptions are final. $ARX airdrops settle within 24h. Merch ships in 2–3 weeks.</span>
    </div>
  );
}

/* ════════ SHELL ════════ */
function RewardsScreen({ onBack, onToast, params }) {
  const [tab, setTab] = rwS((params && params.tab) || 'rewards');
  const [tier, setTier] = rwS(null);
  const [rwView, setRwView] = rwS('main'); // main | membership | redeem
  const toast = onToast || (()=>{});
  const inTier = tab==='referrals' && tier;
  const inRwSub = tab==='rewards' && rwView!=='main';
  return (
    <SubShell title="Rewards & Referrals" onBack={onBack}>
      {/* segmented tabs */}
      <div style={{display:'flex', gap:6, padding:'4px 20px 0'}}>
        {[['rewards','Rewards'],['referrals','Referrals']].map(([id,l])=>(
          <button key={id} onClick={()=>{ setTab(id); setTier(null); setRwView('main'); }} style={{flex:1, height:38, borderRadius:10, border:'none', cursor:'pointer', font:'700 13px var(--font-body)',
            background: tab===id ? 'var(--color-violet-500)' : 'var(--glass-control-bg)', color: tab===id ? '#fff' : 'var(--text-secondary)'}}>{l}</button>
        ))}
      </div>

      {tab==='rewards'
        ? (rwView==='membership' ? <MembershipBenefits onBack={()=>setRwView('main')}/>
          : rwView==='redeem'    ? <RedeemCatalog onBack={()=>setRwView('main')} onToast={toast}/>
          : <RewardsBody onToast={toast} onOpenMembership={()=>setRwView('membership')} onOpenRedeem={()=>setRwView('redeem')}/>)
        : (inTier ? <TierDetail tier={tier} onBack={()=>setTier(null)} onToast={toast}/>
                  : <ReferralsBody onToast={toast} onOpenTier={setTier}/>)}

      {/* sticky share footer (referrals list only) */}
      {tab==='referrals' && !inTier && (
        <div style={{position:'sticky', bottom:0, padding:'12px 20px calc(20px + env(safe-area-inset-bottom))', background:'var(--surface-base)', borderTop:'.5px solid var(--border-default)', boxShadow:'0 -8px 20px var(--surface-base)', display:'flex', gap:10}}>
          <button onClick={()=>rwCopy(RW_LINK, toast)} style={{flex:1, minWidth:0, height:48, borderRadius:'var(--r-md)', border:'.5px solid var(--border-default)', background:'var(--surface-elevated)', cursor:'pointer', display:'flex', alignItems:'center', gap:8, padding:'0 14px'}}>
            <span className="num" style={{flex:1, minWidth:0, font:'500 12px var(--font-mono)', color:'var(--text-secondary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', textAlign:'left'}}>{RW_LINK}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
          </button>
          <button onClick={()=>rwShare(toast)} style={{flex:'0 0 auto', height:48, padding:'0 22px', borderRadius:'var(--r-md)', border:'none', background:'var(--color-violet-500)', color:'#fff', font:'700 14px var(--font-body)', cursor:'pointer', boxShadow:'var(--shadow-execute)'}}>Share</button>
        </div>
      )}
    </SubShell>
  );
}

Object.assign(window, { RewardsScreen });
