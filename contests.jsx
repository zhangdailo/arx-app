/* ═══ ARX · contests — interactive campaign detail screens ═══
   Migrated from the prototype, rebuilt on DS v6 tokens + SubShell.
   World Cup (predict) · NBA (pick) · NVIDIA RWA leaderboard (SO CLOSE / AT RISK).
   Opened as sub-screens: __arxOpenSub('contestWC' | 'contestNBA' | 'contestNVDA').
   Banners on Home (BannerCarousel) deep-link straight here. */

const { useState: cS } = React;

const WC_TEAMS = [
  { id:'arg', name:'Argentina',   flag:'🇦🇷', pct:18 },
  { id:'bra', name:'Brazil',      flag:'🇧🇷', pct:16 },
  { id:'fra', name:'France',      flag:'🇫🇷', pct:14 },
  { id:'eng', name:'England',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', pct:11 },
  { id:'esp', name:'Spain',       flag:'🇪🇸', pct:10 },
  { id:'ger', name:'Germany',     flag:'🇩🇪', pct:8 },
  { id:'por', name:'Portugal',    flag:'🇵🇹', pct:7 },
  { id:'ned', name:'Netherlands', flag:'🇳🇱', pct:5 },
  { id:'usa', name:'USA',         flag:'🇺🇸', pct:4 },
  { id:'bel', name:'Belgium',     flag:'🇧🇪', pct:3 },
  { id:'cro', name:'Croatia',     flag:'🇭🇷', pct:2 },
  { id:'mar', name:'Morocco',     flag:'🇲🇦', pct:2 },
];

// All 30 NBA franchises (2026-27 season). abbr = ESPN logo CDN slug. pct = title odds.
const NBA_TEAMS = [
  { id:'okc', name:'Oklahoma City Thunder', abbr:'okc',  sub:'Western · favourite', pct:13 },
  { id:'bos', name:'Boston Celtics',        abbr:'bos',  sub:'Eastern · favourite', pct:9 },
  { id:'cle', name:'Cleveland Cavaliers',   abbr:'cle',  sub:'Eastern',             pct:8 },
  { id:'den', name:'Denver Nuggets',        abbr:'den',  sub:'Western',             pct:8 },
  { id:'nyk', name:'New York Knicks',       abbr:'ny',   sub:'Eastern',             pct:7 },
  { id:'hou', name:'Houston Rockets',       abbr:'hou',  sub:'Western',             pct:7 },
  { id:'min', name:'Minnesota Timberwolves',abbr:'min',  sub:'Western',             pct:6 },
  { id:'lal', name:'Los Angeles Lakers',    abbr:'lal',  sub:'Western',             pct:5 },
  { id:'orl', name:'Orlando Magic',         abbr:'orl',  sub:'Eastern',             pct:5 },
  { id:'sas', name:'San Antonio Spurs',     abbr:'sa',   sub:'Western · rising',    pct:5 },
  { id:'dal', name:'Dallas Mavericks',      abbr:'dal',  sub:'Western',             pct:4 },
  { id:'gsw', name:'Golden State Warriors', abbr:'gs',   sub:'Western',             pct:4 },
  { id:'lac', name:'LA Clippers',           abbr:'lac',  sub:'Western',             pct:4 },
  { id:'mil', name:'Milwaukee Bucks',       abbr:'mil',  sub:'Eastern',             pct:3 },
  { id:'phi', name:'Philadelphia 76ers',    abbr:'phi',  sub:'Eastern',             pct:3 },
  { id:'ind', name:'Indiana Pacers',        abbr:'ind',  sub:'Eastern',             pct:3 },
  { id:'atl', name:'Atlanta Hawks',         abbr:'atl',  sub:'Eastern',             pct:3 },
  { id:'det', name:'Detroit Pistons',       abbr:'det',  sub:'Eastern',             pct:3 },
  { id:'mem', name:'Memphis Grizzlies',     abbr:'mem',  sub:'Western',             pct:2 },
  { id:'phx', name:'Phoenix Suns',          abbr:'phx',  sub:'Western',             pct:2 },
  { id:'mia', name:'Miami Heat',            abbr:'mia',  sub:'Eastern',             pct:2 },
  { id:'sac', name:'Sacramento Kings',      abbr:'sac',  sub:'Western',             pct:2 },
  { id:'nop', name:'New Orleans Pelicans',  abbr:'no',   sub:'Western',             pct:1 },
  { id:'chi', name:'Chicago Bulls',         abbr:'chi',  sub:'Eastern',             pct:1 },
  { id:'por', name:'Portland Trail Blazers',abbr:'por',  sub:'Western',             pct:1 },
  { id:'tor', name:'Toronto Raptors',       abbr:'tor',  sub:'Eastern',             pct:1 },
  { id:'cha', name:'Charlotte Hornets',     abbr:'cha',  sub:'Eastern',             pct:1 },
  { id:'bkn', name:'Brooklyn Nets',         abbr:'bkn',  sub:'Eastern',             pct:1 },
  { id:'was', name:'Washington Wizards',    abbr:'wsh',  sub:'Eastern',             pct:1 },
  { id:'uta', name:'Utah Jazz',             abbr:'utah', sub:'Western',             pct:1 },
];
function TeamLogo({ abbr, size=46 }){
  return <img src={`https://a.espncdn.com/i/teamlogos/nba/500/${abbr}.png`} alt="" onError={(e)=>{ e.target.style.visibility='hidden'; }} style={{width:size, height:size, objectFit:'contain'}}/>;
}

/* ── shared styling helpers (DS tokens, inline) ── */
const cLabel = { font:'600 11px var(--font-body)', letterSpacing:'.08em', textTransform:'uppercase', color:'var(--text-tertiary)' };
const cCard  = { background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:'var(--r-lg)' };
const cBtnPrimary = { width:'100%', height:48, border:'none', borderRadius:'var(--r-md)', cursor:'pointer',
  background:'var(--button-primary-bg)', color:'#fff', font:'700 15px var(--font-body)', boxShadow:'var(--shadow-execute)' };
const cBtnGhost = { width:'100%', height:48, borderRadius:'var(--r-md)', cursor:'pointer',
  background:'transparent', color:'var(--text-secondary)', border:'.5px solid var(--border-default)', font:'600 15px var(--font-body)' };

function StickyCTA({ children }) {
  return (
    <div style={{position:'sticky', bottom:0, padding:'12px 20px 24px', background:'linear-gradient(to top, var(--surface-base) 72%, transparent)',
      display:'flex', flexDirection:'column', gap:8}}>{children}</div>
  );
}

function HowItWorks({ steps }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:8}}>
      <span style={cLabel}>How it works</span>
      {steps.map((s, i) => (
        <div key={i} style={{...cCard, padding:12, display:'flex', gap:12, alignItems:'flex-start'}}>
          <span style={{width:26, height:26, borderRadius:'50%', flexShrink:0, background:'rgba(124,91,255,.14)', color:'var(--color-violet-500)',
            display:'inline-flex', alignItems:'center', justifyContent:'center', font:'800 12px var(--font-mono)'}}>{i + 1}</span>
          <div style={{display:'flex', flexDirection:'column', gap:1}}>
            <span style={{font:'700 13.5px var(--font-body)', color:'var(--text-primary)'}}>{s.t}</span>
            <span style={{font:'400 12px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.4}}>{s.s}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function RulesList({ rules }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:8}}>
      <span style={cLabel}>Contest rules</span>
      <div style={{...cCard, padding:14, display:'flex', flexDirection:'column', gap:8}}>
        {rules.map((r, i) => (
          <div key={i} style={{display:'flex', gap:8, alignItems:'flex-start'}}>
            <span style={{color:'var(--text-tertiary)', fontSize:12, marginTop:1}}>•</span>
            <span style={{flex:1, font:'400 13px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.4}}>{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── shared confirmation (crowd %) ── */
function ContestResult({ onBack, title, pickLabel, pct, blurb }) {
  const [shared, setShared] = cS(false);
  const share = () => {
    const url = 'https://arx.trade/app?ref=ARXLEGEN';
    if (navigator.share) navigator.share({ title:'Join me on ARX', text:'I just made my prediction on ARX — pick yours & win.', url }).catch(()=>{});
    else if (navigator.clipboard) navigator.clipboard.writeText(url);
    setShared(true); setTimeout(() => setShared(false), 1600);
  };
  return (
    <SubShell title="You're in!" onBack={onBack}>
      <div style={{display:'flex', flexDirection:'column', gap:22, alignItems:'center', textAlign:'center', padding:'12px 24px 24px'}}>
        <div style={{width:88, height:88, borderRadius:26, background:'rgba(124,91,255,.14)', color:'var(--color-violet-500)',
          display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:44}}>🎉</div>
        <div style={{display:'flex', flexDirection:'column', gap:4}}>
          <span style={{font:'800 24px var(--font-brand)', color:'var(--text-primary)'}}>{title}</span>
          <span style={{font:'400 15px var(--font-body)', color:'var(--text-tertiary)'}}>Your prediction has been recorded.</span>
        </div>
        <div style={{...cCard, padding:'14px 20px', width:'100%', textAlign:'left'}}>
          <span style={{display:'block', marginBottom:4, font:'400 11px var(--font-body)', color:'var(--text-tertiary)'}}>Your pick</span>
          <span style={{font:'800 20px var(--font-body)', color:'var(--text-primary)'}}>{pickLabel}</span>
        </div>
        <div style={{...cCard, padding:18, width:'100%'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
            <span style={{font:'600 13px var(--font-body)', color:'var(--text-primary)'}}>Players who agree with you</span>
            <span style={{font:'800 22px var(--font-mono)', color:'var(--color-violet-500)'}}>{pct}%</span>
          </div>
          <div style={{height:10, borderRadius:99, background:'var(--surface-modal)', overflow:'hidden'}}>
            <div style={{width:pct + '%', height:'100%', borderRadius:99, background:'var(--color-violet-500)', transition:'width .6s cubic-bezier(.2,.7,.2,1)'}}/>
          </div>
          <p style={{margin:'10px 0 0', font:'400 11px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.4}}>{blurb}</p>
        </div>
      </div>
      <StickyCTA>
        <button style={cBtnPrimary} onClick={share}>{shared ? 'Link copied!' : 'Share with friends'}</button>
        <button style={cBtnGhost} onClick={onBack}>Back to home</button>
      </StickyCTA>
    </SubShell>
  );
}

/* ═══ WORLD CUP ═══ */
function ContestWC({ onBack }) {
  const [stage, setStage] = cS('landing');
  const [pick, setPick] = cS(null);

  if (stage === 'done') {
    const team = WC_TEAMS.find(t => t.id === pick);
    return <ContestResult onBack={onBack} title="You're in!" pickLabel={<span>{team.flag} {team.name}</span>} pct={team.pct}
      blurb={`${team.pct}% of ARX players also backed ${team.name} to lift the trophy.`}/>;
  }
  if (stage === 'pick') {
    return (
      <SubShell title="Pick your champion" onBack={() => setStage('landing')}>
        <div style={{display:'flex', flexDirection:'column', gap:8, padding:'8px 20px 24px'}}>
          <p style={{margin:'0 0 6px', font:'400 13px var(--font-body)', color:'var(--text-tertiary)'}}>Who lifts the 2026 trophy? Pick one — locks before kickoff.</p>
          {WC_TEAMS.map(t => (
            <button key={t.id} onClick={() => setPick(t.id)} style={{
              padding:14, display:'flex', alignItems:'center', gap:12, textAlign:'left', width:'100%', borderRadius:'var(--r-lg)', cursor:'pointer',
              border:pick === t.id ? '2px solid var(--color-violet-500)' : '.5px solid var(--border-default)',
              background:pick === t.id ? 'rgba(124,91,255,.10)' : 'var(--surface-elevated)'}}>
              <span style={{fontSize:26}}>{t.flag}</span>
              <span style={{flex:1, font:'700 15px var(--font-body)', color:'var(--text-primary)'}}>{t.name}</span>
              {pick === t.id && <span style={{width:22, height:22, borderRadius:99, background:'var(--color-violet-500)', color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center'}}><IconCheck size={13} color="#fff"/></span>}
            </button>
          ))}
        </div>
        <StickyCTA><button style={{...cBtnPrimary, opacity:pick?1:.4}} disabled={!pick} onClick={() => setStage('done')}>Submit prediction</button></StickyCTA>
      </SubShell>
    );
  }
  return (
    <SubShell title="World Cup" onBack={onBack}>
      <div style={{display:'flex', flexDirection:'column', gap:20, padding:'4px 20px 24px'}}>
        <div style={{borderRadius:18, overflow:'hidden'}}><img src="assets/banner-wc.png" alt="Predict the 2026 champion" style={{width:'100%', display:'block'}}/></div>
        <div style={{display:'flex', flexDirection:'column', gap:4}}>
          <h1 style={{margin:0, font:'800 26px var(--font-brand)', letterSpacing:'-.02em', color:'var(--text-primary)'}}>Predict. Win. Celebrate.</h1>
          <p style={{margin:0, font:'400 15px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5}}>Pick the team you think will lift football's biggest trophy in 2026 and stand a chance to win an official Adidas national team jersey.</p>
        </div>
        <HowItWorks steps={[
          { t:'Make your prediction', s:'Choose the nation you believe becomes 2026 champion.' },
          { t:'Submit before kickoff', s:'Predictions lock before the tournament begins.' },
          { t:'Watch the action', s:'Follow the tournament and cheer for your pick.' },
          { t:'Win big', s:'If your prediction is correct, you enter the prize draw.' },
        ]}/>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <span style={cLabel}>Prize</span>
          <div style={{...cCard, padding:14, display:'flex', gap:12, alignItems:'center'}}>
            <span style={{fontSize:30}}>👕</span>
            <div style={{display:'flex', flexDirection:'column', gap:2}}>
              <span style={{font:'700 14px var(--font-body)', color:'var(--text-primary)'}}>Official Adidas National Team Jersey</span>
              <span style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)'}}>Authentic licensed · winner picks size · global shipping included</span>
            </div>
          </div>
        </div>
        <RulesList rules={['One entry per verified ARX account','Prediction cannot be changed after submission','Winners selected from all correct entries','ARX reserves the right to verify eligibility']}/>
      </div>
      <StickyCTA><button style={cBtnPrimary} onClick={() => setStage('pick')}>Predict Now</button></StickyCTA>
    </SubShell>
  );
}

/* ═══ NBA ═══ */
function ContestNBA({ onBack }) {
  const [stage, setStage] = cS('landing');
  const [pick, setPick] = cS(null);

  if (stage === 'done') {
    const team = NBA_TEAMS.find(t => t.id === pick);
    return <ContestResult onBack={onBack} title="You're in!" pickLabel={<span style={{display:'inline-flex', alignItems:'center', gap:8}}><TeamLogo abbr={team.abbr} size={26}/>{team.name}</span>} pct={team.pct}
      blurb={`${team.pct}% of ARX players are riding with the ${team.name.split(' ').slice(-1)} too.`}/>;
  }
  if (stage === 'pick') {
    return (
      <SubShell title="Pick a champion" onBack={() => setStage('landing')}>
        <div style={{display:'flex', flexDirection:'column', gap:12, padding:'8px 20px 24px'}}>
          <p style={{margin:0, font:'400 13px var(--font-body)', color:'var(--text-tertiary)'}}>Choose the team you believe finishes as champion.</p>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
            {NBA_TEAMS.map(t => (
              <button key={t.id} onClick={() => setPick(t.id)} style={{
                padding:'16px 10px', display:'flex', flexDirection:'column', alignItems:'center', gap:7, borderRadius:'var(--r-lg)', cursor:'pointer',
                border:pick === t.id ? '2px solid var(--color-violet-500)' : '.5px solid var(--border-default)',
                background:pick === t.id ? 'rgba(124,91,255,.10)' : 'var(--surface-elevated)'}}>
                <TeamLogo abbr={t.abbr} size={46}/>
                <span style={{font:'700 12.5px var(--font-body)', textAlign:'center', lineHeight:1.2, color:'var(--text-primary)'}}>{t.name}</span>
                <span style={{font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)'}}>{t.sub}</span>
                {pick === t.id && <span style={{font:'700 10.5px var(--font-body)', color:'var(--color-violet-500)'}}>✓ Selected</span>}
              </button>
            ))}
          </div>
        </div>
        <StickyCTA><button style={{...cBtnPrimary, opacity:pick?1:.4}} disabled={!pick} onClick={() => setStage('done')}>Pick My Champion</button></StickyCTA>
      </SubShell>
    );
  }
  return (
    <SubShell title="NBA Champion Challenge" onBack={onBack}>
      <div style={{display:'flex', flexDirection:'column', gap:20, padding:'4px 20px 24px'}}>
        <div style={{borderRadius:18, overflow:'hidden', background:'#000'}}><img src="assets/banner-nba-champion.png" alt="Pick a Champion — new NBA season" style={{width:'100%', display:'block'}}/></div>
        <div style={{display:'flex', flexDirection:'column', gap:6}}>
          <h1 style={{margin:0, font:'800 26px var(--font-brand)', letterSpacing:'-.02em', color:'var(--text-primary)'}}>Pick a Champion.</h1>
          <p style={{margin:0, font:'400 15px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5}}>Pick one NBA team before Opening Night. If they lift the trophy you earn Champion Points, win exclusive ARX rewards, and climb the global leaderboard.</p>
        </div>

        <HowItWorks steps={[
          { t:'Pick', s:'Choose ONE NBA team before the season starts.' },
          { t:'Hold', s:'Your prediction is locked — no switching.' },
          { t:'Earn', s:'Every playoff win earns points. Later rounds multiply.' },
        ]}/>

        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <span style={cLabel}>Points multiplier</span>
          <div style={{...cCard, padding:'4px 14px'}}>
            {[['Regular season','1×'],['Playoffs','2×'],['Conference finals','3×'],['NBA Finals','5×'],['Champion','10×']].map(([k,v],i,a)=>(
              <div key={k} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:i<a.length-1?'.5px solid var(--border-default)':'none'}}>
                <span style={{font:'500 13px var(--font-body)', color:'var(--text-primary)'}}>{k}</span>
                <span style={{font:'800 14px var(--font-mono)', color: v==='10×'?'var(--color-violet-500)':'var(--text-secondary)'}}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <span style={cLabel}>Bonus challenges · all season</span>
          <div style={{display:'flex', flexWrap:'wrap', gap:7}}>
            {['MVP','Rookie of the Year','Finals MVP','Most Improved','Defensive POY','Playoff Bracket'].map(x=>(
              <span key={x} style={{display:'inline-flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:999, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', font:'600 12px var(--font-body)', color:'var(--text-primary)'}}>⭐ {x}</span>
            ))}
          </div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
            <span style={cLabel}>Live title odds</span>
            <span style={{font:'700 10px var(--font-mono)', color:'var(--color-violet-500)'}}>Pick early = higher multiplier</span>
          </div>
          <div style={{...cCard, padding:14, display:'flex', flexDirection:'column', gap:10}}>
            {NBA_TEAMS.slice(0,5).map(t=>(
              <div key={t.id} style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{width:64, font:'600 12.5px var(--font-body)', color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{t.name.split(' ').slice(-1)}</span>
                <div style={{flex:1, height:7, borderRadius:999, background:'var(--glass-control-bg)', overflow:'hidden'}}><div style={{width:Math.min(100,t.pct*4)+'%', height:'100%', borderRadius:999, background:'var(--color-violet-500)'}}/></div>
                <span style={{width:34, textAlign:'right', font:'700 12px var(--font-mono)', color:'var(--text-secondary)'}}>{t.pct}%</span>
              </div>
            ))}
            <p style={{margin:'2px 0 0', font:'400 11px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.45}}>Odds update every game. Back a favourite later and earn fewer points; back an underdog early and earn a multiplier if they go all the way.</p>
          </div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <span style={cLabel}>Rewards</span>
          <div style={{...cCard, padding:14, display:'flex', flexDirection:'column', gap:9}}>
            {[['🏆','Champion Trophy NFT'],['💰','USDC payouts'],['👕','Exclusive ARX merch'],['🎟','VIP experiences'],['🔥','Early access to future campaigns']].map(([ic,x])=>(
              <div key={x} style={{display:'flex', gap:10, alignItems:'center'}}>
                <span style={{fontSize:17, width:22, textAlign:'center'}}>{ic}</span>
                <span style={{flex:1, font:'500 13px var(--font-body)', color:'var(--text-primary)'}}>{x}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{borderRadius:16, padding:16, background:'linear-gradient(135deg, rgba(124,91,255,.18), rgba(124,91,255,.04))', border:'.5px solid rgba(124,91,255,.3)'}}>
          <div style={{font:'700 10px var(--font-body)', letterSpacing:'.08em', textTransform:'uppercase', color:'var(--color-violet-500)'}}>Grand prize</div>
          <div style={{font:'700 15px var(--font-brand)', color:'var(--text-primary)', marginTop:5, lineHeight:1.35}}>Predict the Champion correctly + finish Top 100 on the leaderboard = 🏆 Grand Prize Winner</div>
        </div>

        <RulesList rules={['One entry per verified account','Prediction locks at Opening Night — no switching','Points accrue per playoff win with round multipliers','New users can still join mid-season at lower multipliers','ARX may substitute rewards with equivalent value']}/>
      </div>
      <StickyCTA><button style={cBtnPrimary} onClick={() => setStage('pick')}>Join & Win</button></StickyCTA>
    </SubShell>
  );
}

/* ═══ NVIDIA RWA leaderboard — top 5 win, SO CLOSE / AT RISK framing ═══ */
function ContestNVDA({ onBack }) {
  const leaders = [
    { rank:1, name:'Al Jefferson',       vol:'$4.2M', pts:'18,420' },
    { rank:2, name:'The Great Gary',     vol:'$3.1M', pts:'14,905' },
    { rank:3, name:'Bernardo Di Caprio', vol:'$2.4M', pts:'11,200' },
    { rank:4, name:'Anyma Fan',          vol:'$1.8M', pts:'8,640' },
    { rank:5, name:'Rays of Dai Lo',     vol:'$1.1M', pts:'5,310' },
  ];
  const bubble = [
    { rank:6,  name:'frostbyte',   vol:'$980K', pts:'4,870' },
    { rank:7,  name:'ChartNinja',  vol:'$910K', pts:'4,512' },
    { rank:8,  name:'delta_hedge', vol:'$870K', pts:'4,295' },
    { rank:9,  name:'moonfarmer',  vol:'$820K', pts:'4,038' },
    { rank:10, name:'sol_sniper',  vol:'$790K', pts:'3,902' },
  ];
  const gapToTop5 = 5310 - 3902;
  const up = 'var(--regime-up-mid)', down = 'var(--regime-down-mid)';

  const row = (l, isBubble, last) => (
    <div key={l.rank} style={{display:'flex', alignItems:'center', gap:10, padding:isBubble ? '9px 10px' : '10px 10px',
      borderBottom:!last ? '.5px solid var(--border-default)' : 'none', opacity:isBubble ? 0.94 : 1}}>
      <span style={{width:22, textAlign:'center', font:`800 ${isBubble?13:14}px var(--font-mono)`, color:(!isBubble && l.rank<=3) ? up : 'var(--text-tertiary)'}}>{l.rank}</span>
      <Avatar label={l.name} size={isBubble ? 28 : 30}/>
      <div style={{display:'flex', flexDirection:'column', flex:1, minWidth:0, gap:0}}>
        <span style={{font:`600 ${isBubble?12.5:13}px var(--font-body)`, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{l.name}</span>
        <span style={{font:'400 11px var(--font-mono)', color:'var(--text-tertiary)'}}>{l.vol} volume</span>
      </div>
      {(!isBubble && l.rank >= 4) && (
        <span style={{font:'800 9px var(--font-body)', color:down, background:'rgba(255,77,106,.12)', padding:'2px 6px', borderRadius:999, whiteSpace:'nowrap', flexShrink:0}}>AT RISK</span>
      )}
      {(isBubble && l.rank >= 6 && l.rank <= 8) && (
        <span style={{font:'800 9px var(--font-body)', color:up, background:'rgba(20,184,123,.14)', padding:'2px 6px', borderRadius:999, whiteSpace:'nowrap', flexShrink:0}}>SO CLOSE</span>
      )}
      <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:0, width:56, flexShrink:0}}>
        <span style={{font:`700 ${isBubble?12.5:13}px var(--font-mono)`, color:'var(--text-primary)'}}>{l.pts}</span>
        <span style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)'}}>pts</span>
      </div>
      <span style={{width:18, textAlign:'center', fontSize:15, flexShrink:0}}>{isBubble ? '' : '📱'}</span>
    </div>
  );

  return (
    <SubShell title="Trade NVDA · win iPhone 18" onBack={onBack}>
      <div style={{display:'flex', flexDirection:'column', gap:20, padding:'4px 20px 24px'}}>
        <div style={{borderRadius:18, overflow:'hidden', background:'#000'}}><img src="assets/banner-nvidia.png" alt="Trade NVIDIA, win iPhone 18" style={{width:'100%', display:'block'}}/></div>
        <div style={{display:'flex', flexDirection:'column', gap:4}}>
          <h1 style={{margin:0, font:'800 26px var(--font-brand)', letterSpacing:'-.02em', color:'var(--text-primary)'}}>Trade NVIDIA. Win iPhone 18.</h1>
          <p style={{margin:0, font:'400 15px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5}}>Trade tokenized real-world assets — NVIDIA, Gold, Silver and more — on ARX and climb the leaderboard. The top 5 traders each win the latest iPhone 18.</p>
        </div>

        <div style={{background:'var(--surface-modal)', border:'.5px solid var(--border-default)', borderRadius:'var(--r-lg)', padding:14, display:'flex', gap:12, alignItems:'center'}}>
          <span style={{fontSize:26}}>⏰</span>
          <div style={{display:'flex', flexDirection:'column', gap:1}}>
            <span style={{font:'700 13px var(--font-body)', color:'var(--text-primary)'}}>Ends 9 September 2026</span>
            <span style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)'}}>Leaderboard updates weekly · 11:59 PM UTC</span>
          </div>
        </div>

        <HowItWorks steps={[
          { t:'Trade eligible RWAs', s:'NVIDIA, Gold, Silver, major tokenized equities & more.' },
          { t:'Earn leaderboard points', s:'From trading volume, consistency & eligible-market activity.' },
          { t:'Climb the leaderboard', s:'Standings refresh every week through the campaign.' },
        ]}/>

        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <span style={cLabel}>Leaderboard · this week</span>
          <div style={{...cCard, padding:6}}>{leaders.map((l, i) => row(l, false, i === leaders.length - 1))}</div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
            <span style={cLabel}>On the bubble · keep climbing</span>
            <span style={{font:'700 11px var(--font-mono)', color:up}}>+{gapToTop5.toLocaleString()} pts to Top 5</span>
          </div>
          <div style={{borderRadius:'var(--r-lg)', padding:6, border:'1px dashed var(--border-strong)', background:'transparent'}}>{bubble.map((l, i) => row(l, true, i === bubble.length - 1))}</div>
          <p style={{margin:'2px 4px 0', font:'400 11px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.4}}>Ranks 6–10 are one strong week from the prize zone. Trade more eligible RWAs to climb into the Top 5.</p>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <span style={cLabel}>Prizes · Top 5 win</span>
          <div style={{...cCard, padding:14, display:'flex', gap:12, alignItems:'center'}}>
            <span style={{fontSize:30}}>📱</span>
            <div style={{display:'flex', flexDirection:'column', gap:2}}>
              <span style={{font:'700 14px var(--font-body)', color:'var(--text-primary)'}}>Latest iPhone 18 ×5</span>
              <span style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)'}}>One for each of the top 5 traders on the final leaderboard.</span>
            </div>
          </div>
        </div>

        <RulesList rules={[
          'Campaign ends 9 September 2026, 11:59 PM UTC',
          'Only trades on eligible RWA markets count toward the leaderboard',
          'Weekly updates are indicative and subject to final verification',
          'ARX may disqualify fraudulent or abusive trading activity',
          'Winners contacted within 14 days after completion',
        ]}/>
        <p style={{textAlign:'center', margin:0, font:'400 11px var(--font-body)', color:'var(--text-tertiary)'}}>Powered by Hyperliquid</p>
      </div>
      <StickyCTA><button style={cBtnPrimary} onClick={() => { onBack(); window.__arxTrade && window.__arxTrade('NVDA'); }}>Trade NVIDIA now</button></StickyCTA>
    </SubShell>
  );
}

/* ── Home banner carousel — deep-links to the contest details ── */
function BannerCarousel() {
  const banners = [
    { id:'wc',   img:'assets/banner-wc.png',     alt:'Predict the 2026 champion', sub:'contestWC' },
    { id:'nba',  img:'assets/banner-nba-champion.png', alt:'Pick a Champion — new NBA season', sub:'contestNBA' },
    { id:'nvda', img:'assets/banner-nvidia.png', alt:'Trade NVIDIA, win iPhone 18', sub:'contestNVDA' },
  ];
  const [idx, setIdx] = cS(0);
  const ref = React.useRef(null);
  const pausedUntil = React.useRef(0);
  const idxRef = React.useRef(0);
  const tweenRef = React.useRef(null);
  idxRef.current = idx;
  const goTo = (i, smooth = true) => {
    const el = ref.current; if (!el) return;
    const target = i * el.clientWidth;
    if (!smooth) { el.scrollLeft = target; return; }
    // Manual tween (native smooth-scroll is unreliable inside throttled iframes).
    if (tweenRef.current) clearInterval(tweenRef.current);
    const start = el.scrollLeft, dist = target - start, dur = 420, t0 = Date.now();
    tweenRef.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / dur);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      el.scrollLeft = start + dist * e;
      if (p >= 1) { clearInterval(tweenRef.current); tweenRef.current = null; }
    }, 16);
  };
  const onScroll = () => { const el = ref.current; if (!el) return; setIdx(Math.round(el.scrollLeft / el.clientWidth)); };
  const pause = () => { pausedUntil.current = Date.now() + 6000; if (tweenRef.current) { clearInterval(tweenRef.current); tweenRef.current = null; } };
  React.useEffect(() => {
    const t = setInterval(() => {
      if (Date.now() < pausedUntil.current) return;
      const el = ref.current; if (!el || el.clientWidth === 0) return;
      if (document.hidden) return;
      goTo((idxRef.current + 1) % banners.length);
    }, 3000);
    return () => { clearInterval(t); if (tweenRef.current) clearInterval(tweenRef.current); };
  }, []);
  return (
    <div style={{display:'flex', flexDirection:'column', gap:8}}>
      <div ref={ref} onScroll={onScroll} onPointerDown={pause} onTouchStart={pause} style={{display:'flex', gap:10, overflowX:'auto', scrollSnapType:'x mandatory', scrollbarWidth:'none', WebkitOverflowScrolling:'touch', margin:'0 -20px', padding:'0 20px'}}>
        {banners.map(b => (
          <button key={b.id} onClick={() => window.__arxOpenSub && window.__arxOpenSub(b.sub)} style={{
            flex:'0 0 100%', scrollSnapAlign:'center', border:'none', padding:0, cursor:'pointer', borderRadius:'var(--r-lg)',
            overflow:'hidden', background:'#000', aspectRatio:'2.2 / 1'}}>
            <img src={b.img} alt={b.alt} style={{width:'100%', height:'100%', objectFit:'contain', display:'block'}}/>
          </button>
        ))}
      </div>
      <div style={{display:'flex', gap:5, justifyContent:'center'}}>
        {banners.map((b, i) => (
          <button key={b.id} aria-label={'Go to banner ' + (i+1)} onClick={() => { pause(); goTo(i); }} style={{
            width:i === idx ? 16 : 5, height:5, borderRadius:99, padding:0, border:'none', cursor:'pointer',
            background:i === idx ? 'var(--color-violet-500)' : 'var(--border-strong)', transition:'width .25s'}}/>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ContestWC, ContestNBA, ContestNVDA, BannerCarousel });
