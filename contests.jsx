/* ═══ ARX · contests — interactive campaign detail screens ═══
   Migrated from the prototype, rebuilt on DS v6 tokens + SubShell.
   World Cup (predict) · NBA (pick) · NVIDIA RWA leaderboard (SO CLOSE / AT RISK).
   Opened as sub-screens: __arxOpenSub('contestWC' | 'contestNBA' | 'contestNVDA').
   Banners on Home (BannerCarousel) deep-link straight here. */

const { useState: cS } = React;

// English Premier League 2026/27 — all 20 clubs. logo = local badge asset. pct = illustrative title odds.
const EPL_TEAMS = [
  { id:'mci', name:'Manchester City',      logo:'assets/epl/manchester_city.png',      pct:22 },
  { id:'liv', name:'Liverpool',            logo:'assets/epl/liverpool.png',             pct:18 },
  { id:'ars', name:'Arsenal',              logo:'assets/epl/arsenal.png',               pct:16 },
  { id:'che', name:'Chelsea',              logo:'assets/epl/chelsea.png',               pct:10 },
  { id:'mun', name:'Manchester United',    logo:'assets/epl/manchester_united.png',     pct:8 },
  { id:'tot', name:'Tottenham Hotspur',    logo:'assets/epl/tottenham_hotspur.png',     pct:6 },
  { id:'avl', name:'Aston Villa',          logo:'assets/epl/aston_villa.png',           pct:5 },
  { id:'new', name:'Newcastle United',     logo:'assets/epl/newcastle_united.png',      pct:4 },
  { id:'bha', name:'Brighton & Hove Albion', logo:'assets/epl/brighton_hove_albion.png', pct:3 },
  { id:'ful', name:'Fulham',               logo:'assets/epl/fulham.png',                pct:2 },
  { id:'brf', name:'Brentford',            logo:'assets/epl/brentford.png',             pct:1 },
  { id:'eve', name:'Everton',              logo:'assets/epl/everton.png',               pct:1 },
  { id:'cry', name:'Crystal Palace',       logo:'assets/epl/crystal_palace.png',        pct:1 },
  { id:'nfo', name:'Nottingham Forest',    logo:'assets/epl/nottingham_forest.png',     pct:1 },
  { id:'bou', name:'AFC Bournemouth',      logo:'assets/epl/afc_bournemouth.png',       pct:0.5 },
  { id:'sun', name:'Sunderland',           logo:'assets/epl/sunderland.png',            pct:0.5 },
  { id:'lee', name:'Leeds United',         logo:'assets/epl/leeds_united.png',          pct:0.4 },
  { id:'ips', name:'Ipswich Town',         logo:'assets/epl/ipswich_town.png',          pct:0.3 },
  { id:'hul', name:'Hull City',            logo:'assets/epl/hull_city.png',             pct:0.2 },
  { id:'cov', name:'Coventry City',        logo:'assets/epl/coventry_city.png',         pct:0.2 },
];
function EplLogo({ src, size=46 }){
  return <img src={src} alt="" onError={(e)=>{ e.target.style.visibility='hidden'; }} style={{width:size, height:size, objectFit:'contain'}}/>;
}

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

/* ═══ ENGLISH PREMIER LEAGUE 2026/27 — Pick the Champion ═══ */
function ContestWC({ onBack }) {
  const [stage, setStage] = cS('landing');
  const [pick, setPick] = cS(null);

  if (stage === 'done') {
    const team = EPL_TEAMS.find(t => t.id === pick);
    return <ContestResult onBack={onBack} title="You're in! ⚽" pickLabel={<span style={{display:'inline-flex', alignItems:'center', gap:8}}><EplLogo src={team.logo} size={26}/>{team.name}</span>} pct={team.pct}
      blurb={`Your Premier League Champion prediction has been locked. Now let the season begin.`}/>;
  }
  if (stage === 'pick') {
    return (
      <SubShell title="Pick your champion" onBack={() => setStage('landing')}>
        <div style={{display:'flex', flexDirection:'column', gap:8, padding:'8px 20px 24px'}}>
          <p style={{margin:'0 0 6px', font:'400 13px var(--font-body)', color:'var(--text-tertiary)'}}>Choose ONE Premier League team. Once submitted, your prediction cannot be changed.</p>
          {EPL_TEAMS.map(t => (
            <button key={t.id} onClick={() => setPick(t.id)} style={{
              padding:12, display:'flex', alignItems:'center', gap:12, textAlign:'left', width:'100%', borderRadius:'var(--r-lg)', cursor:'pointer',
              border:pick === t.id ? '2px solid var(--color-violet-500)' : '.5px solid var(--border-default)',
              background:pick === t.id ? 'rgba(124,91,255,.10)' : 'var(--surface-elevated)'}}>
              <EplLogo src={t.logo} size={32}/>
              <span style={{flex:1, font:'700 15px var(--font-body)', color:'var(--text-primary)'}}>{t.name}</span>
              {pick === t.id && <span style={{width:22, height:22, borderRadius:99, background:'var(--color-violet-500)', color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0}}><IconCheck size={13} color="#fff"/></span>}
            </button>
          ))}
        </div>
        <StickyCTA><button style={{...cBtnPrimary, opacity:pick?1:.4}} disabled={!pick} onClick={() => setStage('done')}>Pick My Champion</button></StickyCTA>
      </SubShell>
    );
  }
  return (
    <SubShell title="English Premier League" onBack={onBack}>
      <div style={{display:'flex', flexDirection:'column', gap:20, padding:'4px 20px 24px'}}>
        <div style={{borderRadius:18, overflow:'hidden'}}><img src="assets/banner-epl.png" alt="Guess who will win the Premier League" style={{width:'100%', display:'block'}}/></div>
        <div style={{display:'flex', flexDirection:'column', gap:4}}>
          <span style={cLabel}>English Premier League 2026/27</span>
          <h1 style={{margin:0, font:'800 26px var(--font-brand)', letterSpacing:'-.02em', color:'var(--text-primary)'}}>Pick the Champion.</h1>
          <p style={{margin:0, font:'400 15px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5}}>Who will lift the Premier League trophy? Make your prediction before entries close and pick the team you believe will finish the 2026/27 season as Premier League Champions.</p>
        </div>
        <HowItWorks steps={[
          { t:'Pick your champion', s:'Choose ONE Premier League team.' },
          { t:'Lock in your prediction', s:'Once submitted, your prediction cannot be changed.' },
          { t:'Watch the season unfold', s:'Follow your team\u2019s journey throughout the 2026/27 season.' },
          { t:'Win your dream jersey', s:'Correctly predict the Champion and qualify for the Grand Prize Draw.' },
        ]}/>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <span style={cLabel}>Grand prize</span>
          <div style={{...cCard, padding:14, display:'flex', gap:12, alignItems:'center'}}>
            <span style={{fontSize:30}}>🏆</span>
            <div style={{display:'flex', flexDirection:'column', gap:2}}>
              <span style={{font:'700 14px var(--font-body)', color:'var(--text-primary)'}}>Your dream football jersey — on us</span>
              <span style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)'}}>Your club · your size · your name · your number · shipping covered by ARX</span>
            </div>
          </div>
        </div>
        <RulesList rules={[
          'One prediction per verified ARX account',
          'Only one team may be selected',
          'Predictions cannot be changed after submission',
          'Your selected team must win the 2026/27 Premier League to qualify for the Grand Prize Draw',
          'One winner will be selected from all eligible correct entries',
          'ARX reserves the right to verify participant eligibility',
        ]}/>
      </div>
      <StickyCTA><button style={cBtnPrimary} onClick={() => setStage('pick')}>Pick My Champion</button></StickyCTA>
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

/* ── line icons matching the Copy-tab tile set (stroke, no emoji) ── */
function IconLink2({ size=15, color='currentColor' }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>);
}
function IconBars({ size=15, color='currentColor' }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="20" x2="5" y2="12"/><line x1="12" y1="20" x2="12" y2="5"/><line x1="19" y1="20" x2="19" y2="9"/>
  </svg>);
}
function IconTrendUp({ size=15, color='currentColor' }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 16 10 10 14 13 20 6"/><polyline points="14 6 20 6 20 12"/>
  </svg>);
}
function IconUsers2({ size=15, color='currentColor' }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M16 8.2a2.7 2.7 0 1 1 0 5.4"/><path d="M15.5 14.6c2.6.4 4.5 2.3 4.5 5.4"/>
  </svg>);
}
function IconPerson({ size=13, color='currentColor' }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.9 3.6-6 8-6s8 2.1 8 6"/>
  </svg>);
}

/* ═══ ARX Leaderboard — Referral / Volume / Profit / Copiers rankings ═══
   Standalone flow (not the Copy-tab leaderboard). Opened via
   __arxOpenSub('arxLeaderboard'). Same visual language as ContestNVDA. */
function ArxLeaderboard({ onBack }) {
  const [tab, setTab] = cS('referral');
  const up = 'var(--regime-up-mid)', down = 'var(--regime-down-mid)';

  const TABS = [
    { id:'referral', label:'Referrals', Icon:IconLink2 },
    { id:'volume',    label:'Volume',   Icon:IconBars },
    { id:'profit',    label:'Profit',   Icon:IconTrendUp },
    { id:'copiers',   label:'Copiers',  Icon:IconUsers2 },
  ];
  const active = TABS.find(t => t.id === tab);

  const StatUnits = ({ n }) => (
    <span style={{display:'inline-flex', alignItems:'center', gap:3}}>
      <IconPerson size={11} color='var(--text-tertiary)'/>{n}
    </span>
  );

  const DATA = {
    referral: [
      { name:'Al Jefferson',       stat:842, pts:'42,100' },
      { name:'The Great Gary',     stat:611, pts:'30,550' },
      { name:'Rays of Dai Lo',     stat:488, pts:'24,400' },
      { name:'Bernardo Di Caprio', stat:355, pts:'17,750' },
      { name:'Anyma Fan',          stat:290, pts:'14,500' },
      { name:'frostbyte',          stat:204, pts:'10,200' },
      { name:'ChartNinja',         stat:177, pts:'8,850' },
      { name:'delta_hedge',        stat:149, pts:'7,450' },
    ],
    volume: [
      { name:'Bernardo Di Caprio', stat:'$22,000,222', pts:'18,400' },
      { name:'Al Jefferson',       stat:'$16,480,050', pts:'14,900' },
      { name:'moonfarmer',         stat:'$11,205,400', pts:'11,200' },
      { name:'The Great Gary',     stat:'$9,640,180',  pts:'9,600' },
      { name:'sol_sniper',         stat:'$8,112,900',  pts:'8,100' },
      { name:'Rays of Dai Lo',     stat:'$6,404,220',  pts:'6,400' },
      { name:'ChartNinja',         stat:'$5,205,600',  pts:'5,200' },
      { name:'Anyma Fan',          stat:'$24,000',     pts:'4,700' },
    ],
    profit: [
      { name:'The Great Gary',     stat:'+$22,000,000', pts:'68,200' },
      { name:'Al Jefferson',       stat:'+$514,200',    pts:'51,400' },
      { name:'delta_hedge',        stat:'+$391,050',    pts:'39,100' },
      { name:'Rays of Dai Lo',     stat:'+$308,600',    pts:'30,800' },
      { name:'Bernardo Di Caprio', stat:'+$255,300',    pts:'25,500' },
      { name:'frostbyte',          stat:'+$201,150',    pts:'20,100' },
      { name:'moonfarmer',         stat:'+$168,400',    pts:'16,800' },
      { name:'Anyma Fan',          stat:'+$24,000',     pts:'14,000' },
    ],
    copiers: [
      { name:'Al Jefferson',       stat:1240, pts:'12,400' },
      { name:'Rays of Dai Lo',     stat:980,  pts:'9,800' },
      { name:'The Great Gary',     stat:842,  pts:'8,420' },
      { name:'Anyma Fan',          stat:705,  pts:'7,050' },
      { name:'Bernardo Di Caprio', stat:611,  pts:'6,110' },
      { name:'ChartNinja',         stat:488,  pts:'4,880' },
      { name:'sol_sniper',         stat:402,  pts:'4,020' },
      { name:'frostbyte',          stat:355,  pts:'3,550' },
    ],
  };
  const rows = DATA[tab];
  const isPeople = tab === 'referral' || tab === 'copiers';
  const top5 = rows.slice(0, 5);
  const bubble = rows.slice(5, 10);
  const gapToTop5 = isPeople
    ? (top5[4] ? Number(String(top5[4].stat).replace(/,/g,'')) - Number(String(bubble[0] && bubble[0].stat || 0).replace(/,/g,'')) : 0)
    : Number(String(top5[4] ? top5[4].pts : 0).replace(/,/g,'')) - Number(String(bubble[0] ? bubble[0].pts : 0).replace(/,/g,''));
  const CTA = {
    referral: { label:'Refer now',  sub:'rewards', params:{tab:'referrals'} },
    volume:   { label:'Trade now',  sub:'trade' },
    profit:   { label:'Trade now',  sub:'copy' },
    copiers:  { label:'Invite now', sub:'rewards', params:{tab:'referrals'} },
  }[tab];

  const goCta = () => {
    onBack();
    const c = CTA;
    if (c.sub === 'trade') { window.__arxTrade && window.__arxTrade(); return; }
    if (c.sub === 'copy')  { window.__arxGoTab && window.__arxGoTab('copy'); return; }
    window.__arxOpenSub && window.__arxOpenSub(c.sub, c.params || {});
  };

  const row = (r, i, isBubble) => (
    <div key={r.name} style={{display:'flex', alignItems:'center', gap:10, padding:isBubble?'9px 10px':'10px 10px',
      borderBottom: (isBubble ? i<bubble.length-1 : i<top5.length-1) ? '.5px solid var(--border-default)' : 'none', opacity:isBubble?0.94:1}}>
      <span style={{width:22, textAlign:'center', font:`800 ${isBubble?13:14}px var(--font-mono)`, color:(!isBubble && i<3) ? up : 'var(--text-tertiary)'}}>{isBubble ? i+6 : i+1}</span>
      <Avatar label={r.name} size={isBubble?28:30}/>
      <div style={{display:'flex', flexDirection:'column', flex:1, minWidth:0, gap:0}}>
        <span style={{font:`600 ${isBubble?12.5:13}px var(--font-body)`, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.name}</span>
        <span style={{font:'400 11px var(--font-mono)', color:'var(--text-tertiary)'}}>{isPeople ? <StatUnits n={r.stat}/> : r.stat}</span>
      </div>
      {(!isBubble && i>=3) && (
        <span style={{font:'800 9px var(--font-body)', color:down, background:'rgba(255,77,106,.12)', padding:'2px 6px', borderRadius:999, whiteSpace:'nowrap', flexShrink:0}}>AT RISK</span>
      )}
      {(isBubble && i<3) && (
        <span style={{font:'800 9px var(--font-body)', color:up, background:'rgba(20,184,123,.14)', padding:'2px 6px', borderRadius:999, whiteSpace:'nowrap', flexShrink:0}}>SO CLOSE</span>
      )}
      <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:0, width:56, flexShrink:0}}>
        <span style={{font:`700 ${isBubble?12.5:13}px var(--font-mono)`, color:'var(--text-primary)'}}>{r.pts}</span>
        <span style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)'}}>pts</span>
      </div>
    </div>
  );

  return (
    <SubShell title="Leaderboard" onBack={onBack}>
      <div style={{display:'flex', flexDirection:'column', gap:20, padding:'4px 20px 24px'}}>
        <div style={{display:'flex', flexDirection:'column', gap:4}}>
          <h1 style={{margin:0, font:'800 24px var(--font-brand)', letterSpacing:'-.02em', color:'var(--text-primary)'}}>ARX Leaderboard</h1>
          <p style={{margin:0, font:'400 14px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5}}>Top traders across referrals, volume, profit and copiers — updated weekly.</p>
        </div>

        <div style={{display:'flex', gap:6, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:'var(--r-md)', padding:4}}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'8px 4px', borderRadius:'calc(var(--r-md) - 4px)',
              border:'none', cursor:'pointer', background: tab===t.id ? 'var(--color-violet-500)' : 'transparent',
              transition:'background 160ms'}}>
              <t.Icon size={15} color={tab===t.id ? '#fff' : 'var(--text-secondary)'}/>
              <span style={{font:`${tab===t.id?700:500} 10.5px var(--font-body)`, color: tab===t.id ? '#fff' : 'var(--text-secondary)'}}>{t.label}</span>
            </button>
          ))}
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <span style={cLabel}>{active.label} · this week</span>
          <div style={{...cCard, padding:6}}>{top5.map((r,i)=>row(r,i,false))}</div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
            <span style={cLabel}>On the bubble · keep climbing</span>
            <span style={{font:'700 11px var(--font-mono)', color:up}}>+{gapToTop5.toLocaleString()} pts to Top 5</span>
          </div>
          <div style={{borderRadius:'var(--r-lg)', padding:6, border:'1px dashed var(--border-strong)', background:'transparent'}}>{bubble.map((r,i)=>row(r,i,true))}</div>
          <p style={{margin:'2px 4px 0', font:'400 11px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.4}}>Ranks 6–10 are one strong week from the prize zone. {active.label} more to climb into the Top 5.</p>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <span style={cLabel}>Prizes · Top 5 win</span>
          <div style={{...cCard, padding:14, display:'flex', gap:12, alignItems:'center'}}>
            <span style={{fontSize:30}}>🏆</span>
            <div style={{display:'flex', flexDirection:'column', gap:2}}>
              <span style={{font:'700 14px var(--font-body)', color:'var(--text-primary)'}}>ARX prize pool</span>
              <span style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)'}}>Top 5 on each leaderboard split the weekly reward pool.</span>
            </div>
          </div>
        </div>

        <RulesList rules={[
          'Rankings refresh weekly, every Monday 00:00 UTC',
          'Referral ranking counts new funded accounts from your invite link',
          'Volume and profit rankings use realized trades across all ARX markets',
          'Copiers ranking counts active followers on your Copy profile',
          'ARX may disqualify fraudulent or abusive activity',
        ]}/>
        <p style={{textAlign:'center', margin:0, font:'400 11px var(--font-body)', color:'var(--text-tertiary)'}}>Powered by Hyperliquid</p>
      </div>
      <StickyCTA><button style={cBtnPrimary} onClick={goCta}>{CTA.label}</button></StickyCTA>
    </SubShell>
  );
}

/* ── Home banner carousel — deep-links to the contest details ── */
function BannerCarousel() {
  const banners = [
    { id:'wc',   img:'assets/banner-epl.png',    alt:'Guess who will win the Premier League', sub:'contestWC' },
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
            <img src={b.img} alt={b.alt} style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}/>
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

Object.assign(window, { ContestWC, ContestNBA, ContestNVDA, ArxLeaderboard, BannerCarousel });
