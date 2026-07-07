/* ═══ ARX · Immersive News & Events ═══
   Full-screen, swipeable story viewer (text + video), with overlays that drive action.
   Categories (per IA): Breaking · Scheduled · For you.  Regime lives under On-chain.
   Each story layers: media → summary → sources → why it matters → on-chain overlay →
   prediction market → history→price → related assets + correlation → what it means to you → CTA. */

const { useState: niS, useRef: niR, useEffect: niE } = React;

/* ── 10 demo stories (illustrative market content for the prototype) ── */
const ARX_FEED = [
  { id:'f1', cat:'Breaking', sym:'BTC', source:'Cointelegraph', time:'4h',
    media:{ type:'video', tint:'#F26A6A' },
    title:'Trump earned more from crypto than real estate in 2025, filings show',
    summary:'New financial filings show the President’s 2025 crypto income outpaced his real-estate earnings for the first time.',
    why:"Policy-tone headlines swing BTC sentiment fast — worth watching your BTC exposure.",
    onchain:{ kind:'Cluster exit', text:'6 smart-money wallets trimmed BTC longs within 12 min of the print.', tone:'down' },
    pred:{ q:'Fed cuts by July?', odds:32, delta:-9 },
    hist:{ text:'Last 5 hot-CPI prints: median BTC −2.1% / 24h, recovered within 3 days 4×.' },
    related:[['ETH',0.86],['SOL',0.79],['GOLD',-0.32]] },
  { id:'f2', cat:'On-chain', sym:'SOL', source:'Arx on-chain', time:'34m',
    media:{ type:'gradient', tint:'#7C5BFF' },
    title:'Smart money rotated $42M into SOL in four hours',
    summary:'Flow ran 3.4× above normal and whale-led. The Smart Money cohort flipped to net buyer.',
    why:'Two wallets you follow added — your copy is already positioned for it.',
    onchain:{ kind:'Rotation', text:'Net +$42M into SOL perps, sourced mostly from ETH and stables.', tone:'up' },
    pred:{ q:'SOL > $240 this month?', odds:58, delta:+11 },
    hist:{ text:'Similar 3×+ inflow clusters preceded a 7-day move >8% in 6 of last 9 instances.' },
    related:[['HYPE',0.74],['ETH',0.69],['BTC',0.66]] },
  { id:'f3', cat:'On-chain', sym:'ETH', source:'Arx regime', time:'1h',
    media:{ type:'gradient', tint:'#FBBF24' },
    title:'ETH flipped to range-bound — volatility compressed below average',
    summary:'30-day realized vol dropped under its 20-day mean. Directional setups tend to chop in this regime.',
    why:'Tighten stops on any directional ETH exposure.',
    onchain:{ kind:'Leverage shift', text:'Aggregate ETH perp leverage fell 14% as desks de-risked into the range.', tone:'warn' },
    pred:{ q:'ETH breaks $4.2K before July?', odds:41, delta:-4 },
    hist:{ text:'Range regimes on ETH have lasted a median 9 days before a directional break.' },
    related:[['BTC',0.81],['SOL',0.7]] },
  { id:'f4', cat:'Breaking', sym:'NVDA', source:'Cointelegraph', time:'2h',
    media:{ type:'video', tint:'#2DD49B' },
    title:'Anthropic to bring back Fable 5 as US lifts export controls',
    summary:'Washington eased AI-chip export controls; Anthropic will revive its Fable 5 model line for the affected markets.',
    why:'You hold NVDA-PERP — looser AI-chip controls are a tailwind for the datacenter names.',
    onchain:{ kind:'Positioning', text:'Perp OI on NVDA at a record; crowd 71% long into the event.', tone:'warn' },
    pred:{ q:'NVDA beats datacenter guide?', odds:64, delta:+2 },
    hist:{ text:'Last 4 earnings: median |move| 8.4%; gapped through the implied range twice.' },
    related:[['S&P',0.77],['BTC',0.41]] },
  { id:'f5', cat:'On-chain', sym:'HYPE', source:'Arx on-chain', time:'3h',
    media:{ type:'gradient', tint:'#22D1EE' },
    title:'Hyperliquid OI hits a record $420M as a whale opens $30M long',
    summary:'A single tracked whale opened a $30M HYPE long at 8×; OI broke its prior high on the move.',
    why:'HYPE is on your watchlist.',
    onchain:{ kind:'New position', text:'0x91be…77f0 (Whale) opened $30M HYPE long · 8× · entry $37.10.', tone:'up' },
    pred:{ q:'HYPE > $45 this month?', odds:47, delta:+6 },
    hist:{ text:'Record-OI breaks on HYPE resolved up within 48h in 5 of 7 cases.' },
    related:[['SOL',0.72],['ETH',0.58]] },
  { id:'f6', cat:'Scheduled', sym:'BTC', source:'Arx calendar', time:'5h',
    media:{ type:'gradient', tint:'#B38DF4' },
    title:'Taiwan passes sweeping crypto & stablecoin law — licensing, reserves, penalties',
    summary:'Taiwan’s legislature approved a full regime: exchange licensing, stablecoin reserve mandates, and tough penalties.',
    why:'Clear Asian regulation tends to steady sentiment across majors — a constructive backdrop for your book.',
    onchain:{ kind:'Positioning', text:'Put/call skew steepened; desks net short gamma above $66K.', tone:'warn' },
    pred:{ q:'BTC closes >$65K Friday?', odds:44, delta:-3 },
    hist:{ text:'Price closed within 1.5% of max pain on 7 of last 10 monthly expiries.' },
    related:[['ETH',0.86]] },
  { id:'f7', cat:'On-chain', sym:'SOL', source:'Arx on-chain', time:'6h',
    media:{ type:'gradient', tint:'#2DD49B' },
    title:'A copied leader added 40% to a SOL long',
    summary:'@HsakaTrades scaled an existing SOL position; your mirror followed at the capped size.',
    why:'Your copy acted automatically — review your allocation if conviction differs.',
    onchain:{ kind:'Conviction add', text:'@HsakaTrades +40% to SOL long · now $1.2M · 5×.', tone:'up' },
    pred:{ q:'SOL > $240 this month?', odds:58, delta:+11 },
    hist:{ text:"This leader's conviction adds have a 62% 7-day hit rate over 90 days." },
    related:[['HYPE',0.74],['ETH',0.69]] },
  { id:'f8', cat:'Breaking', sym:'GOLD', source:'Reuters', time:'8h',
    media:{ type:'gradient', tint:'#FBBF24' },
    title:'Gold slips as firmer Treasury yields and Fed outlook weigh',
    summary:'Bullion eased as the 10-year yield firmed and rate-cut odds cooled; haven demand softened into the print.',
    why:null,
    onchain:{ kind:'Rotation', text:'Macro desks rotated into gold-perps; net +$18M over 6h.', tone:'up' },
    pred:{ q:'Gold > $5,000 this quarter?', odds:53, delta:+7 },
    hist:{ text:'New-high breakouts on gold continued higher 10 sessions later in 6 of 8 cases.' },
    related:[['SILVER',0.83],['BTC',0.28]] },
  { id:'f9', cat:'Breaking', sym:'ETH', source:'Arx on-chain', time:'11h',
    media:{ type:'gradient', tint:'#F26A6A' },
    title:'$120M ETH liquidation cascade clears leveraged longs',
    summary:'A fast wick triggered clustered liquidations; funding reset toward neutral after.',
    why:'No open ETH position — but the reset lowers carry if you were considering one.',
    onchain:{ kind:'Liquidation', text:'$120M ETH longs liquidated in 9 min; one tracked wallet hit for $4.2M.', tone:'down' },
    pred:{ q:'ETH reclaims $3.9K in 24h?', odds:38, delta:-6 },
    hist:{ text:'Post-cascade, ETH bounced within 24h in 5 of 8 comparable events.' },
    related:[['BTC',0.81],['SOL',0.7]] },
  { id:'f10', cat:'Scheduled', sym:'OPENAI', source:'Arx calendar', time:'1d',
    media:{ type:'video', tint:'#B38DF4' },
    title:'OpenAI pre-IPO perp lists on Arx Friday',
    summary:'A new pre-IPO market opens for trading. Initial leverage capped at 5× while liquidity builds.',
    why:'You traded pre-IPO before — early markets are thin; size accordingly.',
    onchain:{ kind:'Positioning', text:'Pre-launch interest building; watchlist adds up 4× week-over-week.', tone:'up' },
    pred:{ q:'OPENAI opens above $320?', odds:55, delta:0 },
    hist:{ text:'Recent pre-IPO listings opened volatile: median first-day range 14%.' },
    related:[['SPACEX',0.61],['NVDA',0.49]] },
  { id:'f11', cat:'Breaking', sym:'SOL', source:'Arx on-chain', time:'13h',
    media:{ type:'gradient', tint:'#2DD49B' },
    title:'SOL jumps 6% as a $90M short squeeze clears the book',
    summary:'A fast move through $218 triggered clustered short liquidations; funding flipped positive after.',
    why:"You're long SOL via a copy — this is your position moving.",
    onchain:{ kind:'Liquidation', text:'$90M SOL shorts liquidated in 7 min; one desk hit for $6.1M.', tone:'up' },
    pred:{ q:'SOL > $240 this month?', odds:61, delta:+14 },
    hist:{ text:'Squeezes this size on SOL extended higher next session in 5 of 7 cases.' },
    related:[['HYPE',0.74],['ETH',0.66]] },
  { id:'f12', cat:'Breaking', sym:'HYPE', source:'Reuters', time:'16h',
    media:{ type:'gradient', tint:'#22D1EE' },
    title:'HYPE breaks out to a new all-time high above $40',
    summary:'Hyperliquid’s token cleared $40 on record volume as perp open interest hit a fresh high.',
    why:'HYPE is on your watchlist.',
    onchain:{ kind:'Breakout', text:'Spot + perp volume ran 2.6× the 7-day average through $40.', tone:'up' },
    pred:{ q:'HYPE > $45 this month?', odds:52, delta:+9 },
    hist:{ text:'Prior ATH breakouts on HYPE held above the level a week later in 4 of 6 cases.' },
    related:[['SOL',0.72],['ETH',0.55]] },
  { id:'f13', cat:'On-chain', sym:'ETH', source:'Arx on-chain', time:'19h',
    media:{ type:'gradient', tint:'#7C5BFF' },
    title:'A tracked whale opened a $25M ETH long at 5×',
    summary:'One of the largest single ETH perp adds this week landed near $3,560.',
    why:'Moves your book — ETH is correlated with your SOL exposure.',
    onchain:{ kind:'New position', text:'0x2c9b…4e07 opened $25M ETH long · 5× · entry $3,560.', tone:'up' },
    pred:{ q:'ETH > $4K this month?', odds:46, delta:+5 },
    hist:{ text:'Whale adds this size led ETH higher over 48h in 6 of 10 prior cases.' },
    related:[['BTC',0.81],['SOL',0.70]] },
];
/* ── attention model — rank by relevance to YOU × salience × freshness ──
   relevance: held (a position/copy) > watched > correlated (moves your book) > market-wide. */
const FEED_REL = { f1:'correlated', f2:'held', f3:'correlated', f4:'held', f5:'watched', f6:'correlated', f7:'held', f8:'market', f9:'market', f10:'watched', f11:'held', f12:'watched', f13:'correlated' };
const REL_META = {
  held:       ['Your book', 'var(--regime-up-mid)',    100],
  watched:    ['Watching',  'var(--color-violet-500)',  60],
  correlated: ['Moves your book', 'var(--regime-trans-mid)', 40],
  market:     ['Market-wide', 'var(--text-tertiary)',   10],
};
const SAL_W = { Breaking:30, 'On-chain':20, Scheduled:15 };
function arxFeedScore(n, i){ const rel = REL_META[(FEED_REL[n.id]||'market')][2]; const sal = SAL_W[n.cat]||10; const fresh = (ARX_FEED.length - i); return rel*1.5 + sal + fresh; }
/* Per-load seed → the fallback feed reshuffles every refresh (new lead card + images),
   so it feels live even without a configured source. Real external news still takes over
   when arx_news_url / an RSS key is set (news-live.jsx). */
const __ARX_FEED_SEED = Math.floor(Date.now()/1000);
function arxComposeFeed(){
  const seed = __ARX_FEED_SEED;
  return ARX_FEED
    .map((n,i)=>{ const j = (((seed>>(i%13)) ^ (n.id.charCodeAt(1)*97 + seed)) % 1000)/1000; return { n, s:arxFeedScore(n,i) + j*26 }; })
    .sort((a,b)=>b.s-a.s).map(x=>x.n);
}
const FEED_CAT_COLORS = {
  Breaking:  ['var(--regime-down-mid)', 'rgba(242,106,106,.16)'],
  Scheduled: ['var(--regime-range-mid)', 'rgba(59,130,246,.14)'],
  'On-chain':['var(--color-violet-500)', 'rgba(124,91,255,.14)'],
};
function feedFind(sym){ for(const k in D.instruments){ const m=(D.instruments[k]||[]).find(x=>x.sym===sym); if(m) return m; } return null; }

/* ── Story media — video (real <video> if src, else animated gradient + play) ── */
function StoryMedia({ media, cat, title, source, time, rel }) {
  const [ink, bg] = FEED_CAT_COLORS[cat] || FEED_CAT_COLORS['On-chain'];
  const rm = REL_META[rel||'market'];
  return (
    <div style={{ position:'relative', height:300, flexShrink:0, overflow:'hidden',
      background:`linear-gradient(150deg, ${media.tint||'#7C5BFF'}, #1a1430 78%)` }}>
      {/* sample media — image (poster) layer; video stories get the play badge below */}
      <img src={(window.arxStoryImg?window.arxStoryImg((title||'').length, media.tint):'')} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity: media.type==='video'?.62:.55 }}/>
      <div style={{ position:'absolute', inset:0, background:`linear-gradient(150deg, ${media.tint||'#7C5BFF'}55, transparent 55%)` }}/>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(130% 90% at 75% 8%, rgba(255,255,255,.16), transparent 55%)' }}/>
      {/* animated sheen to read as motion/video */}
      <div style={{ position:'absolute', top:0, bottom:0, width:'55%', background:'linear-gradient(110deg, transparent 30%, rgba(255,255,255,.12) 50%, transparent 70%)', animation:'niSheen 5.5s linear infinite' }}/>
      {media.type==='video' && (
        <div style={{ position:'absolute', top:'42%', left:'50%', transform:'translate(-50%,-50%)', width:62, height:62, borderRadius:'50%', background:'rgba(255,255,255,.22)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
        </div>
      )}
      <div style={{ position:'absolute', left:0, right:0, bottom:0, padding:'40px 18px 16px', background:'linear-gradient(to top, rgba(10,8,24,.95), transparent)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:9, flexWrap:'wrap' }}>
          <span style={{ font:'700 9.5px var(--font-body)', color:'#fff', background:ink, padding:'3px 9px', borderRadius:999, letterSpacing:'.04em' }}>{cat}</span>
          {rm && <span style={{ font:'700 9.5px var(--font-body)', color:'#fff', background:'rgba(0,0,0,.32)', padding:'3px 9px', borderRadius:999, letterSpacing:'.02em', display:'inline-flex', alignItems:'center', gap:5 }}><span style={{ width:6, height:6, borderRadius:'50%', background:rm[1] }}/>{rm[0]}</span>}
          <span style={{ font:'500 11px var(--font-body)', color:'rgba(255,255,255,.8)' }}>{source} · {time} ago</span>
          {media.type==='video' && <span style={{ font:'600 9px var(--font-body)', color:'rgba(255,255,255,.7)', border:'.5px solid rgba(255,255,255,.4)', padding:'2px 6px', borderRadius:5 }}>▶ 0:48</span>}
        </div>
        <div style={{ font:'700 21px var(--font-brand)', color:'#fff', lineHeight:1.22, letterSpacing:'-.02em' }}>{title}</div>
      </div>
    </div>
  );
}

function OverlayCard({ icon, label, tone, children }) {
  const ink = tone==='up'?'var(--regime-up-mid)':tone==='down'?'var(--regime-down-mid)':tone==='warn'?'var(--regime-trans-mid)':'var(--color-violet-500)';
  const bg = tone==='up'?'rgba(45,212,155,.1)':tone==='down'?'rgba(242,106,106,.1)':tone==='warn'?'rgba(251,191,36,.12)':'rgba(124,91,255,.08)';
  return (
    <div style={{ margin:'10px 18px 0', borderRadius:14, padding:'12px 14px', background:bg, border:'.5px solid '+ink.replace('mid','mid')+'33' }}>
      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:7 }}>
        <span style={{ color:ink, display:'flex' }}>{icon}</span>
        <span style={{ font:'700 10px var(--font-body)', color:ink, textTransform:'uppercase', letterSpacing:'.05em' }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

/* like / save row */
function StoryActions({ id }) {
  const [liked, setLiked] = niS(false);
  const [saved, setSaved] = niS(false);
  return (
    <div style={{ display:'flex', gap:8, marginTop:13 }}>
      <button onClick={()=>setLiked(!liked)} className="arx-press" style={{ display:'flex', alignItems:'center', gap:6, height:32, padding:'0 13px', borderRadius:999, cursor:'pointer', background:liked?'rgba(242,106,106,.12)':'var(--surface-elevated)', border:'.5px solid '+(liked?'rgba(242,106,106,.4)':'var(--border-default)'), color:liked?'var(--regime-down-mid)':'var(--text-secondary)', font:'600 11.5px var(--font-body)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={liked?'currentColor':'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>
        {liked?'Liked':'Like'}
      </button>
      <button onClick={()=>setSaved(!saved)} className="arx-press" style={{ display:'flex', alignItems:'center', gap:6, height:32, padding:'0 13px', borderRadius:999, cursor:'pointer', background:saved?'rgba(124,91,255,.12)':'var(--surface-elevated)', border:'.5px solid '+(saved?'rgba(124,91,255,.4)':'var(--border-default)'), color:saved?'var(--color-violet-500)':'var(--text-secondary)', font:'600 11.5px var(--font-body)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={saved?'currentColor':'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        {saved?'Saved':'Save'}
      </button>
      <span style={{flex:1}}/>
      <button onClick={()=>window.__arxOpenSearch && window.__arxOpenSearch('')} aria-label="Search news" className="arx-press" style={{ width:32, height:32, borderRadius:'50%', cursor:'pointer', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>
      </button>
    </div>
  );
}

/* one related-event block — clean editorial row, no card */
function HappeningRow({ label, time, children }) {
  return (
    <div style={{ position:'relative', display:'flex', gap:12, margin:'0 18px' }}>
      <div style={{ flexShrink:0, width:10, display:'flex', flexDirection:'column', alignItems:'center', paddingTop:16 }}>
        <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--color-violet-500)', zIndex:1 }}/>
        <span style={{ flex:1, width:1.5, background:'var(--border-default)', marginTop:2 }}/>
      </div>
      <div style={{ flex:1, minWidth:0, padding:'14px 0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
          <span style={{ flex:1, font:'600 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.07em' }}>{label}</span>
          {time && <span className="num" style={{ font:'500 10px var(--font-mono)', color:'var(--text-tertiary)', flexShrink:0 }}>{time}</span>}
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── one story page — summary → why it matters → what's happening in the same 24h ── */
function StoryPage({ n, onTrade, onAlert, onAsk }) {
  const m = feedFind(n.sym);
  const fact = { font:'500 12.5px var(--font-body)', color:'var(--text-primary)', lineHeight:1.5 };
  const impacted = [['Spot', n.sym+'/USDC', 'direct'],['Perp', n.sym+'-PERP', 'direct'],['Prediction', n.pred.q, n.pred.odds+'%']];
  return (
    <div style={{ height:'100%', overflowY:'auto', WebkitOverflowScrolling:'touch', paddingBottom:'96px', background:'var(--surface-base)' }}>
      <StoryMedia media={n.media} cat={n.cat} title={n.title} source={n.source} time={n.time} rel={FEED_REL[n.id]}/>

      {/* summary + like/save/search */}
      <div style={{ padding:'16px 18px 16px', borderBottom:'.5px solid var(--border-default)' }}>
        <div style={{ font:'400 14.5px var(--font-body)', color:'var(--text-primary)', lineHeight:1.55 }}>{n.summary}</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginTop:12 }}>
          {[n.source,'Arx on-chain'].filter((v,i,a)=>a.indexOf(v)===i).map(s=>(
            <span key={s} style={{ display:'inline-flex', alignItems:'center', gap:5, height:24, padding:'0 9px', borderRadius:999, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', font:'500 10.5px var(--font-body)', color:'var(--text-tertiary)' }}><span style={{ width:4, height:4, borderRadius:'50%', background:'var(--text-tertiary)' }}/>{s}</span>
          ))}
          <span style={{ font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', alignSelf:'center' }}>· evidence-based · not advice</span>
        </div>
        <StoryActions id={n.id}/>
      </div>

      {/* why it matters to you — the one violet moment, with the Long/Short CTA folded in */}
      {n.why && (
        <div style={{ margin:'16px 18px 4px', borderRadius:16, padding:'14px', background:'rgba(124,91,255,.07)', border:'.5px solid rgba(124,91,255,.26)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <LucidOrb size={22} breathe={false}/>
            <span style={{ font:'700 10px var(--font-body)', color:'var(--color-violet-500)', textTransform:'uppercase', letterSpacing:'.06em' }}>Why it matters to you</span>
          </div>
          <div style={{ font:'600 13.5px var(--font-body)', color:'var(--text-primary)', lineHeight:1.5 }}>{n.why}</div>
          <button onClick={()=>onAsk(n)} className="arx-press" style={{ display:'flex', alignItems:'center', gap:7, marginTop:10, background:'none', border:'none', cursor:'pointer', padding:0, font:'600 11.5px var(--font-body)', color:'var(--color-violet-500)' }}>
            Ask Lucid to turn this into a plan on {n.sym}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      )}

      {/* related events in the same time window */}
      <div style={{ padding:'18px 0 4px' }}>
        <div style={{ padding:'0 18px 4px' }}>
          <div style={{ font:'700 15px var(--font-body)', color:'var(--text-primary)', letterSpacing:'-.01em' }}>In the same 24-hour window</div>
          <div style={{ font:'400 11.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:3, lineHeight:1.45 }}>Independent, fact-backed events that line up with this move — newest first.</div>
        </div>

        <HappeningRow label={'On-chain flow · '+n.onchain.kind} time="18m ago"><div style={fact}>{n.onchain.text}</div></HappeningRow>

        <HappeningRow label="Prediction market" time="1h ago">
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ font:'500 12px var(--font-body)', color:'var(--text-primary)' }}>{n.pred.q}</div>
              <div style={{ height:5, borderRadius:3, background:'var(--glass-control-bg)', marginTop:7, overflow:'hidden' }}><div style={{ width:n.pred.odds+'%', height:'100%', background:'var(--text-secondary)' }}/></div>
            </div>
            <div style={{ textAlign:'right' }}><div className="num" style={{ font:'700 17px var(--font-mono)', color:'var(--text-primary)' }}>{n.pred.odds}%</div><div className="num" style={{ font:'600 10px var(--font-mono)', color:'var(--text-tertiary)' }}>{n.pred.delta>=0?'+':'−'}{Math.abs(n.pred.delta)} pts</div></div>
          </div>
        </HappeningRow>

        <HappeningRow label="Moves with it" time="3h ago">
          <div style={{ display:'flex', gap:8, overflowX:'auto', scrollbarWidth:'none' }}>
            {n.related.map(([sym,corr])=>{ const rm=feedFind(sym); return (
              <button key={sym} onClick={()=>rm&&window.__arxOpenSub&&window.__arxOpenSub('instrumentDetail',{m:rm})} className="arx-press" style={{ flex:'0 0 84px', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:12, padding:'9px', textAlign:'center', cursor:'pointer' }}>
                <div style={{ display:'flex', justifyContent:'center' }}><AssetGlyph sym={sym} size={22}/></div>
                <div style={{ font:'600 11.5px var(--font-body)', marginTop:5 }}>{sym}</div>
                <div className="num" style={{ font:'500 10px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2 }}>ρ {corr>=0?'+':'−'}{Math.abs(corr).toFixed(2)}</div>
              </button>
            );})}
          </div>
        </HappeningRow>

        <HappeningRow label="How it played out before" time="prior cycles"><div style={fact}>{n.hist.text}</div></HappeningRow>

        <HappeningRow label="Where it lands · spot · perp · prediction">
          {impacted.map(([k,v,tag])=>(
            <div key={k} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0' }}>
              <span style={{ width:54, font:'600 9.5px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase' }}>{k}</span>
              <span style={{ flex:1, font:'500 12px var(--font-body)', color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{v}</span>
              <span className="num" style={{ font:'500 11px var(--font-mono)', color:'var(--text-tertiary)' }}>{tag}</span>
            </div>
          ))}
        </HappeningRow>
      </div>
    </div>
  );
}

/* ── the immersive viewer — horizontal swipe between stories, action bar pinned ── */
function NewsImmersive({ startId, filter, list:initialList, onClose }) {
  const LISTS = [['breaking','Breaking'],['foryou','For you'],['onchain','On-chain']];
  const [list, setList] = niS(initialList || 'foryou');
  const composed = arxComposeFeed();
  const listFilter = (n) => list==='breaking' ? n.cat==='Breaking' : list==='onchain' ? n.cat==='On-chain' : true; // foryou = relevance-ranked all
  const base = filter ? composed.filter(filter) : composed;
  const feed = base.filter(listFilter);
  const start = Math.max(0, feed.findIndex(n => n.id === startId));
  const [idx, setIdx] = niS(start < 0 ? 0 : start);
  const ref = niR(null);
  niE(() => { const el = ref.current; if (el) el.scrollTo({ left: 0, behavior:'instant' }); setIdx(0); }, [list]);
  const onScroll = () => { const el = ref.current; if (!el) return; setIdx(Math.round(el.scrollLeft / (el.clientWidth||1))); };
  const cur = feed[idx] || feed[0];
  const m = cur && feedFind(cur.sym);
  const trade = () => { window.__arxTrade ? window.__arxTrade(cur.sym) : (m && window.__arxOpenSub && window.__arxOpenSub('instrumentDetail',{m})); onClose(); };
  const alert = () => window.__arxToast && window.__arxToast('Alert set on '+cur.sym);
  const ask = (n) => { window.__arxOpenLucid && window.__arxOpenLucid({ query:'What does this mean for my book?', contextLabel:'On the news · '+n.sym }); };

  return (
    <div onClick={onClose} style={{ position:'absolute', inset:0, zIndex:85, display:'flex', flexDirection:'column',
      background:'rgba(8,6,26,.5)', backdropFilter:'blur(16px) saturate(140%)', WebkitBackdropFilter:'blur(16px) saturate(140%)',
      animation:'lucidScrim 300ms ease-out both' }}>
      <div onClick={e=>e.stopPropagation()} style={{ position:'relative', display:'flex', flexDirection:'column', flex:1,
        marginTop:'calc(40px + env(safe-area-inset-top))', background:'var(--surface-base)',
        borderRadius:'28px 28px 0 0', borderTop:'1px solid rgba(124,91,255,.22)',
        boxShadow:'0 -18px 64px rgba(8,6,26,.5)', overflow:'hidden',
        animation:'lucidSheet 460ms cubic-bezier(.22,1,.36,1) both' }}>
        {/* grabber */}
        <div style={{ display:'flex', justifyContent:'center', paddingTop:8, position:'absolute', top:0, left:0, right:0, zIndex:4 }}><div style={{ width:36, height:4, borderRadius:2, background:'rgba(255,255,255,.5)' }}/></div>
        {/* TikTok-style chrome: list tabs ABOVE the progress bar, both over the media */}
        <div style={{ position:'absolute', top:18, left:0, right:0, zIndex:4, padding:'0 12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center', position:'relative' }}>
            {LISTS.map(([id,l])=>(
              <button key={id} onClick={()=>setList(id)} className="arx-press" style={{ height:28, padding:'0 13px', borderRadius:999, cursor:'pointer', border:'none',
                background: list===id?'rgba(255,255,255,.92)':'rgba(0,0,0,.32)', backdropFilter:'blur(8px)',
                color: list===id?'#1a1430':'#fff', font:`${list===id?700:600} 11.5px var(--font-body)` }}>{l}</button>
            ))}
            <button onClick={onClose} aria-label="Close" style={{ position:'absolute', right:0, width:30, height:30, borderRadius:'50%', border:'none', cursor:'pointer', background:'rgba(0,0,0,.35)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
            </button>
          </div>
          {/* progress bar — below the tabs, on the image */}
          <div style={{ display:'flex', gap:4, marginTop:12 }}>
            {feed.map((_,i)=>(<span key={i} style={{ flex:1, height:3, borderRadius:2, background: i<=idx?'#fff':'rgba(255,255,255,.4)', transition:'background 200ms' }}/>))}
          </div>
        </div>

        {/* swipe pager */}
        <div ref={ref} key={list} onScroll={onScroll} style={{ flex:1, display:'flex', overflowX:'auto', overflowY:'hidden', scrollSnapType:'x mandatory', scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}>
          {feed.map(n => (
            <div key={n.id} style={{ flex:'0 0 100%', minWidth:'100%', height:'100%', scrollSnapAlign:'center' }}>
              <StoryPage n={n} onTrade={trade} onAlert={alert} onAsk={ask}/>
          </div>
        ))}
      </div>

      {/* action bar — the conversion */}
      <div style={{ position:'absolute', left:0, right:0, bottom:0, zIndex:5, display:'flex', gap:10, padding:'12px 16px calc(14px + env(safe-area-inset-bottom))', background:'linear-gradient(to top, var(--surface-base) 92%, transparent)' }}>
        <button onClick={()=>{ window.__arxTradeSide && window.__arxTradeSide(cur.sym,'sell'); (window.__arxTrade?window.__arxTrade(cur.sym):0); onClose(); }} className="arx-press" style={{ flex:1, height:48, borderRadius:14, border:'none', cursor:'pointer', background:'var(--regime-down-mid)', color:'#fff', font:'700 15px var(--font-body)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          Short {cur.sym}
        </button>
        <button onClick={()=>{ window.__arxTradeSide && window.__arxTradeSide(cur.sym,'buy'); (window.__arxTrade?window.__arxTrade(cur.sym):0); onClose(); }} className="arx-press" style={{ flex:1, height:48, borderRadius:14, border:'none', cursor:'pointer', background:'var(--regime-up-mid)', color:'#06140F', font:'700 15px var(--font-body)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          Long {cur.sym}
        </button>
      </div>
      </div>

      <style>{`@keyframes niSheen { 0%{transform:translateX(-160%)} 100%{transform:translateX(320%)} }`}</style>
    </div>
  );
}

Object.assign(window, { NewsImmersive, ARX_FEED, arxComposeFeed, FEED_REL });
