/* ═══ ARX · Attention IA (Phase 4) ═══
   Splits attention into two dedicated surfaces, both reached from chrome (not the feed):
     · News  — market-moving stories on their own surface, each with a Lucid "why it
               matters to you" read and a deep-link into the related instrument.
     · Notifications — the daily-loop hub: copy alerts, leaderboard deltas, streaks,
               risk + regime, rewards. A "Your day so far" digest drives the return visit.
   Both reuse SubShell + the house tokens; routing goes through the global openers. */

const { useState: atS } = React;

function arxFindInstrument(sym) {
  for (const k in D.instruments) { const m = D.instruments[k].find(x => x.sym === sym); if (m) return { ...m }; }
  return null;
}
function arxStoryImg(seed, tint){
  const t = tint || '#7C5BFF';
  const s = encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='700' height='360'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='"+t+"'/><stop offset='1' stop-color='#16142e'/></linearGradient></defs><rect width='700' height='360' fill='url(#g)'/><circle cx='"+(500+seed%140)+"' cy='80' r='130' fill='#ffffff' opacity='0.12'/><circle cx='130' cy='310' r='100' fill='"+t+"' opacity='0.32'/><circle cx='360' cy='180' r='60' fill='#ffffff' opacity='0.06'/></svg>");
  return "data:image/svg+xml,"+s;
}
window.arxStoryImg = arxStoryImg;

/* ─────────────────────────────────────────────────────────────
   NEWS — its own surface
   ───────────────────────────────────────────────────────────── */
const ARX_NEWS = [
  { id:'n1', cat:'Macro', sym:'BTC', day:'today', time:'2h', source:'Bloomberg',
    image:'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=640&q=70&auto=format&fit=crop',
    title:'Fed hike odds jump to 32% on hot CPI',
    summary:'Core CPI rose 0.4% MoM, above the 0.3% consensus. Markets pushed the first cut out to Q3.',
    why:"You're long SOL via a copy — risk-off days pressure high-beta alts hardest." },
  { id:'n2', cat:'On-chain', sym:'SOL', day:'today', time:'3h', source:'Arx on-chain',
    image:'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=640&q=70&auto=format&fit=crop',
    title:'Smart money rotated $42M into SOL in 4 hours',
    summary:'Flow ran 3.4× above normal and whale-led. Smart Money turned net buyer in the window.',
    why:'Two wallets you follow added — your copy is already positioned for it.' },
  { id:'n3', cat:'Regime', sym:'ETH', day:'today', time:'5h', source:'Arx regime',
    image:'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=640&q=70&auto=format&fit=crop',
    title:'ETH flipped to range-bound',
    summary:'30-day volatility compressed below its average. Directional setups tend to chop here.',
    why:'Tighten stops on any directional ETH exposure.' },
  { id:'n4', cat:'Asset', sym:'NVDA', day:'today', time:'6h', source:'Reuters',
    image:'https://images.unsplash.com/photo-1518770660439-4636190af475?w=640&q=70&auto=format&fit=crop',
    title:'NVDA −3.6% after-hours on datacenter guide',
    summary:'Q4 datacenter guidance missed the whisper number. Shares gave back most of the week.',
    why:null },
  { id:'n5', cat:'On-chain', sym:'HYPE', day:'week', time:'1d', source:'Arx on-chain',
    image:'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=640&q=70&auto=format&fit=crop',
    title:'Hyperliquid open interest hits a record $420M',
    summary:'Perp OI set a new high as volume broadened beyond majors into mid-cap pairs.',
    why:'HYPE is on your watchlist.' },
  { id:'n6', cat:'Macro', sym:'GOLD', day:'week', time:'2d', source:'Reuters',
    image:'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=640&q=70&auto=format&fit=crop',
    title:'Gold holds $4,800 as real yields slip',
    summary:'Bullion steadied near record territory as the 10-year real yield eased four basis points.',
    why:null },
  { id:'n7', cat:'Asset', sym:'OIL', day:'week', time:'3d', source:'Bloomberg',
    image:'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=640&q=70&auto=format&fit=crop',
    title:'Crude slides 2% on demand worries',
    summary:'WTI fell as inventory builds and soft factory data revived oversupply concerns.',
    why:null },
];

/* real topical background photos for feed cards, keyed by symbol (Unsplash CDN) */
const ARX_FEED_IMG = {
  BTC:'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=640&q=70&auto=format&fit=crop',
  ETH:'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=640&q=70&auto=format&fit=crop',
  SOL:'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=640&q=70&auto=format&fit=crop',
  HYPE:'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=640&q=70&auto=format&fit=crop',
  XRP:'https://images.unsplash.com/photo-1640826514546-7d2eab70a4e5?w=640&q=70&auto=format&fit=crop',
  DOGE:'https://images.unsplash.com/photo-1622544392648-4d3aef3a3c12?w=640&q=70&auto=format&fit=crop',
  AVAX:'https://images.unsplash.com/photo-1639815188546-c43c240ff4df?w=640&q=70&auto=format&fit=crop',
  SUI:'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=640&q=70&auto=format&fit=crop',
  NVDA:'https://images.unsplash.com/photo-1518770660439-4636190af475?w=640&q=70&auto=format&fit=crop',
  TSLA:'https://images.unsplash.com/photo-1617704548623-340376564e68?w=640&q=70&auto=format&fit=crop',
  MSTR:'https://images.unsplash.com/photo-1612178991541-b48cc8e92a4d?w=640&q=70&auto=format&fit=crop',
  SPX:'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=640&q=70&auto=format&fit=crop',
  GOLD:'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=640&q=70&auto=format&fit=crop',
  SILVER:'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=640&q=70&auto=format&fit=crop',
  OPENAI:'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=640&q=70&auto=format&fit=crop',
  OIL:'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=640&q=70&auto=format&fit=crop',
  NATGAS:'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=640&q=70&auto=format&fit=crop',
  URANIUM:'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=640&q=70&auto=format&fit=crop',
};
function arxFeedImg(sym){ return ARX_FEED_IMG[sym] || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=640&q=70&auto=format&fit=crop'; }

const NEWS_BODY = {
  n1:["Core CPI rose 0.4% month-on-month, a tenth above the 0.3% consensus and the firmest reading in months. Shelter and services drove the surprise.","Rate futures repriced fast — the market now sees the first cut slipping to Q3. Crypto and other high-beta risk sold off on the print before stabilizing."],
  n2:["On-chain data shows roughly $42M of net inflow into SOL perps over four hours — about 3.4× the typical pace for the window, and whale-led.","Wallets in the Smart Money cohort flipped to net buyers during the window. Flow this size usually reflects positioning, not a single print — though it never guarantees direction."],
  n3:["ETH’s 30-day realized volatility has compressed below its own average, the signature of a range-bound regime. Directional setups tend to chop in this state.","In practice that argues for tighter stops on trend trades and more attention to the range edges. The regime label refreshes daily from price and on-chain structure."],
  n4:["NVIDIA fell about 3.6% after hours after Q4 datacenter guidance came in below the most optimistic estimates, even as headline results were solid.","The move unwound most of the week’s gain. Single-name equity perps can gap on guidance, so size and stops matter more than usual around earnings."],
  n5:["Open interest on Hyperliquid set a record near $420M as activity broadened beyond majors into mid-cap pairs.","Rising OI alongside steady funding points to new positioning rather than forced flows — a sign of growing depth on the venue."],
  n6:["Gold held near $4,800 as the 10-year real yield eased a few basis points, keeping a bid under non-yielding assets.","Bullion has stayed resilient through the recent risk wobble, trading more on real rates than on equity beta."],
  n7:["WTI crude slid about 2% as another inventory build and soft factory data revived concerns about oversupply into softening demand.","Energy has been a range trade; the move keeps it near the lower half of its recent band."],
};

const NEWS_CAT = {
  Macro:      ['var(--regime-range-mid)', 'rgba(59,130,246,.14)'],
  'On-chain': ['var(--color-violet-500)', 'rgba(124,91,255,.14)'],
  Regime:     ['var(--regime-trans-mid)', 'rgba(251,191,36,.16)'],
  Asset:      ['var(--text-secondary)',   'rgba(120,120,128,.14)'],
  Breaking:   ['var(--regime-down-mid)',  'rgba(242,106,106,.14)'],
};

/* Live-or-curated news list. When real RSS items are loaded they take over;
   otherwise the hand-written ARX_NEWS renders. Held-symbol stories get a
   "why it matters" line synthesised so the "Your book" filter still works. */
const ARX_HELD = { SOL:'You hold SOL via a copy — watch how this moves your position.', BTC:'BTC is your largest exposure — macro days like this set the tone.', ETH:'You have ETH exposure — mind your stops if the regime shifts.', HYPE:'HYPE is on your watchlist.', NVDA:'NVDA sits in your RWA book.' };
function arxNewsList(){
  const S = window.__arxLiveNews;
  if (S && S.items && S.items.length){
    return S.items.map(n => n.why ? n : (ARX_HELD[n.sym] ? { ...n, why: ARX_HELD[n.sym] } : n));
  }
  return ARX_NEWS;
}

function NewsCard({ n, onOpen }) {
  const [ink, bg] = NEWS_CAT[n.cat] || NEWS_CAT.Asset;
  const m = arxFindInstrument(n.sym);
  return (
    <button onClick={()=>onOpen(n)} className="arx-press arx-arrive" style={{
      display:'block', width:'calc(100% - 40px)', margin:'8px 20px 0', padding:'13px 15px', textAlign:'left',
      background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:16, cursor:'pointer', overflow:'hidden'
    }}>
      {n.image && (
        <div style={{margin:'-13px -15px 11px', height:150, overflow:'hidden', background:'var(--glass-control-bg)'}}>
          <img src={n.image} alt="" loading="lazy" onError={(e)=>{ e.target.parentNode.style.display='none'; }} style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}/>
        </div>
      )}
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <span style={{font:'600 9.5px var(--font-body)', color:ink, background:bg, padding:'3px 9px', borderRadius:999, letterSpacing:'.02em'}}>{n.cat}</span>
        <span style={{flex:1}}/>
        <span style={{font:'500 10.5px var(--font-body)', color:'var(--text-tertiary)'}}>{n.source} · {n.time} ago</span>
      </div>
      <div style={{font:'600 15px var(--font-body)', color:'var(--text-primary)', letterSpacing:'-.01em', lineHeight:1.3, marginTop:9}}>{n.title}</div>
      <div style={{font:'400 12.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5, marginTop:5}}>{n.summary}</div>
      {n.why && (
        <div style={{display:'flex', gap:8, alignItems:'flex-start', marginTop:11, padding:'8px 10px', borderRadius:11,
          background:'rgba(124,91,255,.08)', border:'.5px solid rgba(124,91,255,.18)'}}>
          <LucidOrb size={16} breathe={false}/>
          <span style={{font:'500 11.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.45}}>
            <b style={{color:'var(--text-primary)', fontWeight:600}}>Why it matters to you · </b>{n.why}
          </span>
        </div>
      )}
      {m && (
        <div style={{display:'flex', alignItems:'center', gap:8, marginTop:11, paddingTop:10, borderTop:'.5px solid var(--border-default)'}}>
          <AssetGlyph sym={n.sym} size={22}/>
          <span style={{font:'600 12px var(--font-body)', color:'var(--text-primary)'}}>{n.sym}</span>
          <span className="num" style={{font:'500 11.5px var(--font-mono)', color: m.deltaPct>=0?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{m.deltaPct>=0?'+':'−'}{Math.abs(m.deltaPct).toFixed(1)}%</span>
          <span style={{flex:1}}/>
          <span style={{font:'600 11.5px var(--font-body)', color:'var(--color-violet-500)'}}>Read ›</span>
        </div>
      )}
    </button>
  );
}

function NewsScreen({ onBack }) {
  const [filter, setFilter] = atS('All');
  const { live, loading } = useLiveNews();
  const FILTERS = ['All', 'Your book', 'Macro', 'On-chain', 'Regime'];
  const openStory = (n) => window.__arxOpenSub && window.__arxOpenSub('newsArticle', { id: n.id });
  const askPulse = () => window.__arxOpenLucid && window.__arxOpenLucid({
    contextLabel:'On the news · market pulse',
    intro:{ action:"Here's the through-line in today's news.", body:"Macro printed risk-off (hot CPI), but on-chain smart money kept adding to SOL and HYPE OI hit a record — while ETH compressed into a range. Net: selective risk appetite, not a broad bid. I can tie any story to your book." },
    chips:[
      { label:'What hits my positions?', reply:{ conf:'high', action:'SOL is your main exposure — and it\u2019s where smart money is adding.', body:'A risk-off macro day pressures high-beta alts, but the on-chain flow into SOL is a counterweight. ETH\u2019s shift to range-bound argues for tighter stops on directional ETH.', data:[['Your main exposure','SOL',''],['Smart-money flow','Net buyer','up'],['ETH regime','Range-bound','warn']] }},
      { label:'Is the macro read risk-off?', reply:{ conf:'medium', action:'Leaning risk-off \u2014 but on-chain isn\u2019t confirming a broad exit.', body:'Hot CPI pushed cut bets to Q3, which usually pressures crypto beta. Yet smart money kept adding to SOL and Hyperliquid OI set a record. Mixed signals, not a clean trend.', note:'Analysis, not a recommendation.' }},
    ],
  });
  const list = arxNewsList().filter(n => filter==='All' ? true : filter==='Your book' ? !!n.why : n.cat===filter);
  const today = list.filter(n => n.day==='today' || n.live);
  const week  = list.filter(n => n.day!=='today' && !n.live);
  const Group = ({ label, items }) => items.length ? (
    <>
      <div style={{padding:'18px 20px 2px', font:'600 11px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.08em'}}>{label}</div>
      {items.map(n => <NewsCard key={n.id} n={n} onOpen={openStory}/>)}
    </>
  ) : null;
  return (
    <SubShell title="News" onBack={onBack}>
      {/* Lucid market pulse — News is an inline-read surface */}
      <button onClick={askPulse} className="arx-press" style={{display:'flex', alignItems:'center', gap:11, width:'calc(100% - 40px)', margin:'6px 20px 2px',
        padding:'13px 14px', borderRadius:16, cursor:'pointer', textAlign:'left',
        background:'linear-gradient(150deg, rgba(124,91,255,.14), rgba(124,91,255,.03) 75%)', border:'.5px solid rgba(124,91,255,.3)'}}>
        <LucidOrb size={30}/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'flex', alignItems:'center', gap:7}}>
            <span style={{font:'700 12.5px var(--font-body)'}}>Market pulse</span>
            <span style={{font:'600 8px var(--font-body)', color:'var(--color-violet-500)', background:'rgba(124,91,255,.16)', padding:'2px 6px', borderRadius:999, letterSpacing:'.06em'}}>LUCID</span>
          </div>
          <div style={{font:'500 11.5px var(--font-body)', color:'var(--text-secondary)', marginTop:3, lineHeight:1.4}}>Risk-off macro, but smart money keeps adding to SOL — selective appetite, not a broad bid.</div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-violet-500)" strokeWidth="2.4" strokeLinecap="round" style={{flexShrink:0}}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>

      {/* filters */}
      <div style={{display:'flex', gap:8, overflowX:'auto', padding:'14px 20px 2px', scrollbarWidth:'none'}}>
        {FILTERS.map(f => (
          <button key={f} onClick={()=>setFilter(f)} className="arx-press" style={{
            flexShrink:0, height:32, padding:'0 14px', borderRadius:999, cursor:'pointer',
            background: filter===f ? 'var(--color-violet-500)' : 'var(--surface-elevated)',
            border:'.5px solid ' + (filter===f ? 'var(--color-violet-500)' : 'var(--border-default)'),
            color: filter===f ? '#fff' : 'var(--text-secondary)', font:`${filter===f?700:600} 12.5px var(--font-body)`
          }}>{f}</button>
        ))}
      </div>

      <Group label={live ? 'Latest' : 'Today'} items={today}/>
      <Group label="This week" items={week}/>
      {list.length===0 && <div style={{textAlign:'center', padding:'40px 30px', font:'500 13px var(--font-body)', color:'var(--text-tertiary)'}}>{loading ? 'Loading the latest…' : 'No stories in this filter.'}</div>}
      <div style={{textAlign:'center', font:'500 12px var(--font-body)', color:'var(--text-tertiary)', padding:'20px 0 8px'}}>{live ? 'Live from crypto newswires' : "You're caught up"}</div>
    </SubShell>
  );
}

/* ─── News reader — full story, why-it-matters, related-asset CTA, Lucid hand-off ─── */
function NewsArticleScreen({ id, onBack }) {
  useLiveNews();
  const all = arxNewsList();
  const n = all.find(x => x.id === id) || all[0];
  const [ink, bg] = NEWS_CAT[n.cat] || NEWS_CAT.Asset;
  const body = n.body || NEWS_BODY[n.id] || [n.summary];
  const m = arxFindInstrument(n.sym);
  const openInstr = () => { if (m) window.__arxOpenSub && window.__arxOpenSub('instrumentDetail', { m }); };
  const ask = () => window.__arxOpenLucid && window.__arxOpenLucid({
    contextLabel:'On the news · '+n.sym,
    intro:{ action:`Here's what the ${n.sym} story means for your book.`, body:(n.why ? n.why+' ' : '') + n.summary + ' I can break down the read, the on-chain reaction, or the risk to your positions.' },
    chips:[
      { label:`How does this hit my ${n.sym} exposure?`, reply:{ conf:'medium', action:`It's context for ${n.sym}, not a signal to act.`, body:(n.why || 'You hold related exposure.')+' Weigh it against your stop and size — the story shifts the odds, it doesn’t set them.', note:'Analysis, not a recommendation.' }},
      { label:'What would change the picture?', reply:{ conf:'low', action:'Watch for confirmation across price, flow, and funding.', body:'One headline rarely sets a trend. A move that shows up in on-chain flow and funding together is more durable than a single print.' }},
    ],
  });
  return (
    <SubShell title="Story" onBack={onBack}>
      {n.image && (
        <div style={{margin:'2px 20px 0', borderRadius:16, overflow:'hidden', height:188, background:'var(--glass-control-bg)'}}>
          <img src={n.image} alt="" onError={(e)=>{ e.target.parentNode.style.display='none'; }} style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}/>
        </div>
      )}
      <div style={{padding:'12px 20px 0'}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <span style={{font:'600 9.5px var(--font-body)', color:ink, background:bg, padding:'3px 9px', borderRadius:999}}>{n.cat}</span>
          <span style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)'}}>{n.source} · {n.time} ago</span>
        </div>
        <h1 style={{font:'700 23px var(--font-brand)', letterSpacing:'-.02em', lineHeight:1.22, margin:'12px 0 0', color:'var(--text-primary)'}}>{n.title}</h1>
        {body.map((p,i)=>(
          <p key={i} style={{font:'400 14px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.6, margin:'14px 0 0'}}>{p}</p>
        ))}
      </div>

      {n.why && (
        <div style={{display:'flex', gap:10, alignItems:'flex-start', margin:'18px 20px 0', padding:'12px 14px', borderRadius:14,
          background:'linear-gradient(150deg, rgba(124,91,255,.14), rgba(124,91,255,.03) 75%)', border:'.5px solid rgba(124,91,255,.3)'}}>
          <LucidOrb size={26}/>
          <div style={{flex:1, minWidth:0}}>
            <div style={{font:'700 10px var(--font-body)', color:'var(--color-violet-500)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4}}>Why it matters to you</div>
            <div style={{font:'500 13px var(--font-body)', color:'var(--text-primary)', lineHeight:1.5}}>{n.why}</div>
          </div>
        </div>
      )}

      {m && (
        <div style={{display:'flex', alignItems:'center', gap:12, margin:'14px 20px 0', padding:'13px 15px', borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
          <AssetGlyph sym={n.sym} size={38}/>
          <div style={{flex:1, minWidth:0}}>
            <div style={{font:'600 14px var(--font-body)'}}>{n.sym} · {m.name}</div>
            <div className="num" style={{font:'500 12px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2}}>{arxPrice(m)} · <span style={{color: m.deltaPct>=0?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{m.deltaPct>=0?'+':'−'}{Math.abs(m.deltaPct).toFixed(1)}%</span></div>
          </div>
          <button onClick={openInstr} className="arx-press" style={{height:34, padding:'0 15px', borderRadius:11, border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'700 12.5px var(--font-body)'}}>Open {n.sym}</button>
        </div>
      )}

      <button onClick={ask} className="arx-press" style={{display:'flex', alignItems:'center', gap:11, width:'calc(100% - 40px)', margin:'10px 20px 0',
        padding:'13px 14px', borderRadius:16, cursor:'pointer', textAlign:'left',
        background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
        <LucidOrb size={26} breathe={false}/>
        <span style={{flex:1, font:'600 13px var(--font-body)', color:'var(--text-primary)'}}>Ask Lucid what this means for you</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-violet-500)" strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>

      {n.link && (
        <a href={n.link} target="_blank" rel="noopener noreferrer" className="arx-press" style={{display:'flex', alignItems:'center', gap:11, width:'calc(100% - 40px)', margin:'10px 20px 0',
          padding:'13px 14px', borderRadius:16, cursor:'pointer', textAlign:'left', textDecoration:'none',
          background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
        <span style={{flex:1, font:'600 13px var(--font-body)', color:'var(--text-primary)'}}>Read full story at {n.source}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-violet-500)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>
      </a>
      )}

      <div style={{padding:'18px 20px 8px', font:'400 11px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>
        {n.source} · market commentary. Based on public and on-chain data. Returns shown are before fees. Not investment advice.
      </div>
    </SubShell>
  );
}

/* ─────────────────────────────────────────────────────────────
   NOTIFICATIONS — the daily-loop hub
   ───────────────────────────────────────────────────────────── */
const NCAT = {
  move:   ['var(--regime-range-mid)', 'rgba(59,130,246,.14)'],
  copy:   ['var(--regime-up-mid)',    'rgba(45,212,155,.14)'],
  leader: ['var(--color-violet-500)', 'rgba(124,91,255,.14)'],
  risk:   ['var(--regime-down-mid)',  'rgba(242,106,106,.14)'],
  regime: ['var(--regime-trans-mid)', 'rgba(251,191,36,.16)'],
  streak: ['var(--color-violet-500)', 'rgba(124,91,255,.14)'],
  reward: ['var(--color-violet-500)', 'rgba(124,91,255,.14)'],
  info:   ['var(--regime-range-mid)', 'rgba(59,130,246,.14)'],
};
function NotifIcon({ cat }) {
  const [ink, bg] = NCAT[cat] || NCAT.info;
  const p = {
    move:   <><path d="M13 2 3 14h8l-1 8 10-12h-8z"/></>,
    copy:   <><rect x="8" y="8" width="11" height="11" rx="2.5"/><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15"/></>,
    leader: <><polyline points="4 17 10 11 13 14 20 7"/><polyline points="15 7 20 7 20 12"/></>,
    risk:   <><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9.5" x2="12" y2="13.5"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    regime: <path d="M3 12h4l3-8 4 16 3-8h4"/>,
    streak: <path d="M12 3c.4 2.6-2.4 4-2.4 7.4a4.4 4.4 0 0 0 8.8 0c0-1.8-.9-3.2-1.9-4.2.2 1.4-.7 2.2-1.4 2.2C13.5 8.4 14.2 5.3 12 3z"/>,
    reward: <><circle cx="12" cy="9" r="5"/><path d="M9 13.4 7.6 21 12 18.2 16.4 21 15 13.4"/></>,
    info:   <><circle cx="12" cy="12" r="9.5"/><line x1="12" y1="8" x2="12" y2="12.5"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  }[cat] || null;
  return (
    <span style={{width:36, height:36, borderRadius:'50%', flexShrink:0, background:bg, color:ink, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">{p}</svg>
    </span>
  );
}

const NOTIFS = [
  { id:101, cat:'move', day:'today', time:'12m', unread:true, watch:true, title:'@HsakaTrades opened Long SOL',      detail:'6× · $420K · a wallet you watch just moved',     go:'wallet', handle:'@HsakaTrades' },
  { id:102, cat:'move', day:'today', time:'34m', unread:true, watch:true, title:'0x7a3f…c891 added to BTC long',        detail:'Whale you watch · position now $2.1M',            go:'wallet', addr:'0x7a3f…c891' },
  { id:103, cat:'move', day:'today', time:'1h',  unread:true, watch:true, title:'Kaleo closed ETH short',             detail:'Smart money · +18.4% realized · you watch them',  go:'wallet', handle:'Kaleo' },
  { id:104, cat:'move', day:'today', time:'3h',  unread:false, watch:true, title:'GCR opened Long HYPE',              detail:'3× · $180K · first HYPE position in 30d',       go:'wallet', handle:'GCR' },
  { id:1, cat:'copy',   day:'today', time:'2h',  unread:true,  title:'Copy mirrored an ETH long',          detail:'@HsakaTrades · +$96.40 to your side',          go:'sub',    sub:'copyDetails' },
  { id:2, cat:'leader', day:'today', time:'4h',  unread:true,  title:'@Pentosh1 climbed to #3',             detail:'Up 4 spots on the 7-day leaderboard',          go:'wallet', handle:'@Pentosh1' },
  { id:3, cat:'risk',   day:'today', time:'5h',  unread:true,  title:'A copy is nearing its loss limit',    detail:'14% of buffer left · copy of 0x44e9…1f07',     go:'sub',    sub:'copyDetails' },
  { id:4, cat:'streak', day:'today', time:'8h',  unread:true,  title:'12-day green streak',                 detail:'Your best run yet — keep it going',            go:'sub',    sub:'contests' },
  { id:5, cat:'regime', day:'today', time:'10h', unread:false, title:'ETH switched to range-bound',         detail:'Volatility compressed below its 20-day average', go:'instr', sym:'ETH' },
  { id:6, cat:'reward', day:'week',  time:'1d',  unread:false, title:'NVDA contest: you moved to #41',      detail:'Up from #58 · 2,118 entered',                  go:'sub',    sub:'contests' },
  { id:7, cat:'copy',   day:'week',  time:'2d',  unread:false, title:'Monthly copy PnL crossed +$280',      detail:'2 copies · no guardrail hits',                 go:'sub',    sub:'copyDetails' },
  { id:8, cat:'leader', day:'week',  time:'3d',  unread:false, title:'New label: 0x91be…77f0 → Rising money', detail:'Strong 30 days · no 90-day proof yet',        go:'wallet', addr:'0x91be…77f0' },
];

function notifRoute(n) {
  if (n.go==='instr')  { const m = arxFindInstrument(n.sym); if (m) window.__arxOpenSub && window.__arxOpenSub('instrumentDetail', { m }); return; }
  if (n.go==='wallet') { const w = WALLETS.find(x => x.x===n.handle || x.addr===n.addr) || WALLETS[0]; window.__arxOpenSub && window.__arxOpenSub('walletDetail', { w }); return; }
  if (n.go==='sub')    { window.__arxOpenSub && window.__arxOpenSub(n.sub, n.params||{}); }
}

const NFILTERS = [['All',null],['Watching','move'],['Copies','copy'],['Leaders','leader'],['Risk','risk'],['Rewards','reward']];
const NFILTER_MAP = { Risk:['risk','regime'], Rewards:['reward','streak'], Watching:['move','leader'] };

function NotificationsScreen({ onBack }) {
  const [items, setItems] = atS(NOTIFS);
  const [filter, setFilter] = atS('All');
  const matchFilter = (n) => filter==='All' ? true : (NFILTER_MAP[filter] ? NFILTER_MAP[filter].includes(n.cat) : n.cat===filter);
  const open = (n) => { setItems(prev => prev.map(x => x.id===n.id ? {...x, unread:false} : x)); notifRoute(n); };
  const markAll = () => setItems(prev => prev.map(x => ({...x, unread:false})));
  const unreadCount = items.filter(n => n.unread).length;
  const list = items.filter(matchFilter);
  const today = list.filter(n => n.day==='today');
  const week  = list.filter(n => n.day!=='today');

  const Row = ({ n }) => (
    <button onClick={()=>open(n)} className="arx-row-press" style={{display:'flex', gap:12, alignItems:'center', width:'100%', padding:'12px 20px',
      background: n.unread ? 'rgba(124,91,255,.05)' : 'transparent', border:'none', cursor:'pointer', textAlign:'left'}}>
      <NotifIcon cat={n.cat}/>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:'flex', alignItems:'center', gap:7}}>
          <span style={{font:'600 13.5px var(--font-body)', color:'var(--text-primary)', letterSpacing:'-.005em'}}>{n.title}</span>
          {n.unread && <span style={{width:7, height:7, borderRadius:'50%', background:'var(--color-violet-500)', flexShrink:0}}/>}
        </div>
        <div style={{font:'400 12px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.4, marginTop:2}}>{n.detail}</div>
      </div>
      <span style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', whiteSpace:'nowrap', alignSelf:'flex-start', marginTop:3}}>{n.time}</span>
    </button>
  );
  const Group = ({ label, rows }) => rows.length ? (
    <>
      <div style={{padding:'16px 20px 4px', font:'600 11px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.08em'}}>{label}</div>
      {rows.map(n => <Row key={n.id} n={n}/>)}
    </>
  ) : null;

  return (
    <SubShell title="Notifications" onBack={onBack}>
      {/* Your day so far — the daily-loop digest */}
      <div style={{margin:'6px 20px 2px', borderRadius:16, padding:'14px 16px', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:13}}>
          <LucidOrb size={20} breathe={false}/>
          <span style={{font:'700 12.5px var(--font-body)'}}>Your day so far</span>
          <span style={{flex:1}}/>
          <span style={{font:'500 10.5px var(--font-body)', color:'var(--text-tertiary)'}}>updated 2m ago</span>
        </div>
        <div style={{display:'flex'}}>
          {[['Leaders up','+$340','var(--regime-up-mid)'],['Copies acted','2','var(--text-primary)'],['Green streak','12d','var(--color-violet-500)']].map(([k,v,c],i)=>(
            <div key={k} style={{flex:1, paddingLeft: i?14:0, borderLeft: i?'.5px solid var(--border-default)':'none', marginLeft: i?14:0}}>
              <div style={{font:'500 9.5px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>{k}</div>
              <div className="num" style={{font:'700 18px var(--font-mono)', color:c, letterSpacing:'-.02em', marginTop:3}}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* filter chips + mark all read */}
      <div style={{display:'flex', alignItems:'center', gap:8, padding:'14px 20px 2px'}}>
        <div style={{display:'flex', gap:8, overflowX:'auto', flex:1, scrollbarWidth:'none'}}>
          {NFILTERS.map(([label]) => (
            <button key={label} onClick={()=>setFilter(label)} className="arx-press" style={{
              flexShrink:0, height:30, padding:'0 13px', borderRadius:999, cursor:'pointer',
              background: filter===label ? 'var(--color-violet-500)' : 'var(--surface-elevated)',
              border:'.5px solid ' + (filter===label ? 'var(--color-violet-500)' : 'var(--border-default)'),
              color: filter===label ? '#fff' : 'var(--text-secondary)', font:`${filter===label?700:600} 12px var(--font-body)`
            }}>{label}</button>
          ))}
        </div>
        {unreadCount>0 && <button onClick={markAll} style={{flexShrink:0, background:'none', border:'none', cursor:'pointer', font:'600 11.5px var(--font-body)', color:'var(--color-violet-500)', padding:0, whiteSpace:'nowrap'}}>Mark all read</button>}
      </div>

      <Group label="Today" rows={today}/>
      <Group label="This week" rows={week}/>
      {list.length===0 && <div style={{textAlign:'center', padding:'40px 30px', font:'500 13px var(--font-body)', color:'var(--text-tertiary)'}}>Nothing here in this filter.</div>}
      <div style={{padding:'16px 20px', font:'400 11px var(--font-body)', color:'var(--text-tertiary)', textAlign:'center', lineHeight:1.5}}>You're caught up. Signals you act on get smarter — mute any source from its profile.</div>
    </SubShell>
  );
}

/* ─────────────────────────────────────────────────────────────
   DAILY BRIEF — glanceable morning read: breaking · pulse · my relevance
   ───────────────────────────────────────────────────────────── */
function DailyBrief({ persona = 's7', onTabChange }) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
  // Real "since last open" delta — tracks an actual timestamp (migrated from prototype).
  const [gap] = React.useState(() => { try { const last = +localStorage.getItem('arx_brief_lastopen') || 0; const now = Date.now(); localStorage.setItem('arx_brief_lastopen', String(now)); return last ? Math.round((now - last) / 60000) : null; } catch (e) { return null; } });
  const gapLabel = gap == null ? null : gap < 1 ? 'just now' : gap < 60 ? gap + 'm' : gap < 1440 ? Math.round(gap / 60) + 'h' : Math.round(gap / 1440) + 'd';
  const deltas = persona === 's2'
    ? [['SOL','your long ticked +$48 — funding rising'],['BTC','reclaimed $73K'],['NVDA','+2.2% — RWA session open']]
    : [['ETH','funding flipped negative'],['SOL','+6% — smart money still adding'],['Copies','+$340 today, no guardrail tripped']];
  const top = ARX_NEWS.find(n => n.day === 'today') || ARX_NEWS[0];
  const openNews = () => window.__arxOpenSub && window.__arxOpenSub('news');
  const openArticle = (id) => window.__arxOpenSub && window.__arxOpenSub('newsArticle', { id });
  const relevance = persona === 's2'
    ? ['Your SOL long is +$284 — funding ticked up, watch the carry', '@Pentosh1 (watch) opened a BTC short 2h ago']
    : ['Your copies are up +$340 today — no guardrail came close', '@HsakaTrades, a wallet you copy, added SOL 3h ago'];
  return (
    <LucidShell
      title={greet + ', Sam'}
      opener={'Your brief — ' + new Date().toLocaleDateString(undefined,{weekday:'long', month:'short', day:'numeric'}) + ' · 3 things I\u2019d glance at'}
      foot="Ask Lucid to walk you through it"
      onAsk={()=>window.__arxOpenLucid && window.__arxOpenLucid({ query:'What changed while I was away?', contextLabel:'Your daily brief' })}
    >
      <LucidRow eyebrow={'Since last open' + (gapLabel ? ' · ' + gapLabel : '')} tint="rgba(124,91,255,.14)"
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-violet-500)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>}>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:8 }}>
          <span style={{ font:'600 13px var(--font-body)', color:'var(--text-primary)', lineHeight:1.35, marginTop:2 }}>What moved while you were away</span>
          <span style={{ font:'700 11px var(--font-mono)', color:'var(--color-violet-500)', flexShrink:0 }}>{deltas.length} moved</span>
        </div>
        {deltas.map(([sym, txt], i) => (
          <div key={i} style={{ display:'flex', gap:7, alignItems:'flex-start', marginTop:i?5:6 }}>
            <span style={{ font:'700 10.5px var(--font-mono)', color:'var(--text-tertiary)', width:42, flexShrink:0, marginTop:1 }}>{sym}</span>
            <span style={{ font:'500 12.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.45 }}>{txt}</span>
          </div>
        ))}
      </LucidRow>

      <LucidRow eyebrow={'Breaking · ' + top.source} tint="rgba(242,106,106,.14)" onClick={()=>openArticle(top.id)}
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--regime-down-mid)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 13z"/><path d="M11.6 16.8 A2 2 0 0 1 8 18"/></svg>}>
        <div style={{ font:'600 13px var(--font-body)', color:'var(--text-primary)', lineHeight:1.35, marginTop:2 }}>{top.title}</div>
      </LucidRow>

      <LucidRow eyebrow="Market pulse" tint="rgba(251,191,36,.16)"
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--regime-trans-mid)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>}>
        <div style={{ font:'500 12.5px var(--font-body)', color:'var(--text-primary)', lineHeight:1.4, marginTop:2 }}>Sentiment in <b>Fear (38)</b>. ETH range-bound; SOL trending, day 7. Smart money still adding to SOL.</div>
      </LucidRow>

      <LucidRow eyebrow="For you" tint="rgba(124,91,255,.14)"
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-violet-500)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/></svg>}>
        {relevance.map((r,i)=>(
          <div key={i} style={{ display:'flex', gap:7, alignItems:'flex-start', marginTop:i?5:3 }}>
            <span style={{ width:4, height:4, borderRadius:'50%', background:'var(--color-violet-500)', marginTop:6, flexShrink:0 }}/>
            <span style={{ font:'500 12.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.45 }}>{r}</span>
          </div>
        ))}
      </LucidRow>
    </LucidShell>
  );
}

/* ─────────────────────────────────────────────────────────────
   NEWS STREAM — Home's immersive body: a lead event + scannable feed
   ───────────────────────────────────────────────────────────── */
function NewsStream() {
  const [list, setList] = React.useState('breaking');
  const [visible, setVisible] = React.useState(12);
  const sentinelRef = React.useRef(null);
  const { items, live } = useLiveNews();

  React.useEffect(() => { setVisible(12); }, [list]);

  React.useEffect(() => {
    const el = sentinelRef.current; if (!el) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setVisible(v => v + 8);
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [sentinelRef.current]);
  const nsAgo = (ts) => { if(!ts) return 'now'; const q=Math.max(0,Math.round((Date.now()-ts)/1000)); if(q<60) return q+'s ago'; const m=Math.round(q/60); if(m<60) return m+'m ago'; const h=Math.round(m/60); if(h<24) return h+'h ago'; return Math.round(h/24)+'d ago'; };
  const nsCrypto = (t) => /\b(btc|bitcoin|eth|ethereum|sol|solana|crypto|token|defi|altcoin|memecoin|stablecoin)\b/i.test(t||'');
  const CAT_TINT = { Breaking:'#F26A6A', Macro:'#3B82F6', 'On-chain':'#7C5BFF', Asset:'#FBBF24' };
  // Never blank: fall back to the curated real-headline pool immediately; the live
  // RSS fetch upgrades it in place when the proxy responds.
  const fallback = () => (window.arxComposeFeed ? arxComposeFeed() : []).map(n => ({
    id:n.id, title:n.title, cat:n.cat, sym:n.sym, source:n.source||'ARX',
    image:(window.arxFeedImg?arxFeedImg(n.sym):null), ts:Date.now()-((parseInt(n.time)||5)*60000),
    link:null, summary:n.summary||'', crypto:nsCrypto(n.title||''), _immersive:true }));
  const src = (items && items.length) ? items : fallback();
  // filter per spec: Breaking = all · For you = crypto keyword · On-chain = CoinDesk only
  const filtered = src.filter(n =>
    list==='foryou' ? (n.crypto || nsCrypto((n.title||'')+' '+(n.summary||''))) :
    list==='onchain' ? (n.source==='CoinDesk') : true
  );
  const openLink = (n) => { if (window.__arxOpenSub) window.__arxOpenSub('liveArticle', { item:n }); else if (n && n.link) window.open(n.link, '_blank', 'noopener'); };

  const Header = (
    <>
      <div style={{padding:'8px 20px 8px'}}><span style={{font:'700 17px var(--font-brand)', letterSpacing:'-.01em', color:'var(--text-primary)'}}>News &amp; events</span></div>
      <div style={{display:'flex', gap:8, overflowX:'auto', padding:'0 20px 12px', scrollbarWidth:'none'}}>
        {[['breaking','Breaking'],['foryou','For you'],['onchain','On-chain']].map(([id,l])=>(
          <button key={id} onClick={()=>setList(id)} className="arx-press" style={{flexShrink:0, height:30, padding:'0 15px', borderRadius:999, cursor:'pointer',
            background: list===id?'var(--color-violet-500)':'var(--surface-elevated)', border:'.5px solid '+(list===id?'var(--color-violet-500)':'var(--border-default)'),
            color: list===id?'#fff':'var(--text-secondary)', font:(list===id?700:600)+' 12.5px var(--font-body)'}}>{l}</button>
        ))}
      </div>
    </>
  );

  if (!src.length && !failed){
    return (<>{Header}<div style={{padding:'0 20px'}}>
      {[250,190,190].map((h,i)=>(
        <div key={i} style={{height:h, borderRadius:20, marginBottom:14, background:'linear-gradient(100deg, var(--surface-elevated) 30%, var(--glass-control-bg) 50%, var(--surface-elevated) 70%)', backgroundSize:'200% 100%', animation:'arxsh 1.3s linear infinite', border:'.5px solid var(--border-default)'}}/>
      ))}
      <style>{'@keyframes arxsh{to{background-position:-200% 0}}'}</style>
      <div style={{textAlign:'center', font:'500 12px var(--font-body)', color:'var(--text-tertiary)', padding:'2px 0 18px'}}>Fetching live headlines…</div>
    </div></>);
  }
  if (!src.length){
    return (<>{Header}<div style={{padding:'0 20px 20px'}}>
      <div style={{padding:'34px 20px', textAlign:'center', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:20}}>
        <div style={{font:'600 13px var(--font-body)', color:'var(--text-secondary)'}}>Couldn't load live news right now</div>
        <button onClick={reload} className="arx-press" style={{marginTop:12, height:38, padding:'0 20px', borderRadius:999, border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'700 12.5px var(--font-body)'}}>Retry</button>
      </div>
    </div></>);
  }

  return (
    <>
      {Header}
      <div style={{padding:'0 20px'}}>
        {filtered.length===0 && <div style={{padding:'28px 20px', textAlign:'center', font:'500 12.5px var(--font-body)', color:'var(--text-tertiary)'}}>No stories in this filter right now.</div>}
        {filtered.slice(0, visible).map((n,i)=>{
          const tint = CAT_TINT[n.cat] || '#7C5BFF';
          const cardImg = n.image || (window.arxFeedImg ? arxFeedImg(n.sym) : null);
          const im = window.arxFindInstrument ? arxFindInstrument(n.sym) : null; const pos = im && im.deltaPct>=0;
          const hero = i===0; const H = hero?250:190; const breaking = n.cat==='Breaking';
          const ink = (NEWS_CAT[n.cat]||NEWS_CAT.Asset)[0];
          return (
            <button key={n.id} onClick={()=>openLink(n)} className="arx-press arx-arrive" style={{position:'relative', display:'block', width:'100%', height:H, textAlign:'left', cursor:'pointer', border:'.5px solid var(--border-default)', borderRadius:20, overflow:'hidden', marginBottom:14, background:'linear-gradient(150deg, '+tint+', #14101f 80%)'}}>
              {cardImg && <img src={cardImg} alt="" onError={(e)=>{ e.target.style.display='none'; }} style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.72}}/>}
              <div style={{position:'absolute', inset:0, background:'linear-gradient(150deg, '+tint+'55, transparent 50%)'}}/>
              <div style={{position:'absolute', left:0, right:0, bottom:0, height:'80%', background:'linear-gradient(to top, rgba(9,7,18,.95) 14%, rgba(9,7,18,.58) 48%, transparent)'}}/>
              <div style={{position:'absolute', top:12, left:12, right:12, display:'flex', alignItems:'center', gap:6}}>
                <span style={{display:'inline-flex', alignItems:'center', gap:5, font:'700 11px var(--font-body)', color:'#fff', background:ink, padding:'4px 10px', borderRadius:999, letterSpacing:'.04em', textTransform:'uppercase'}}>{breaking && <span className="arx-breath" style={{width:5, height:5, borderRadius:'50%', background:'#fff'}}/>}{n.cat}</span>
                <span style={{flex:1}}/>
                <span style={{font:'600 10.5px var(--font-body)', color:'rgba(255,255,255,.75)', background:'rgba(255,255,255,.14)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)', padding:'4px 9px', borderRadius:999}}>{n.source}</span>
              </div>
              <div style={{position:'absolute', left:14, right:14, bottom:13}}>
                {im && (
                  <div style={{display:'inline-flex', alignItems:'center', gap:6, marginBottom:9, padding:'4px 10px 4px 5px', background:'rgba(255,255,255,.13)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)', borderRadius:999}}>
                    <AssetGlyph sym={n.sym} size={18}/>
                    <span style={{font:'700 11.5px var(--font-body)', color:'#fff'}}>{n.sym}</span>
                    <span className="num" style={{font:'700 11.5px var(--font-mono)', color: pos?'#56E0A8':'#FF8A9B'}}>{pos?'+':'−'}{Math.abs(im.deltaPct).toFixed(1)}%</span>
                  </div>
                )}
                <div style={{font:'800 '+(hero?20:16)+'px var(--font-brand)', color:'#fff', lineHeight:1.18, letterSpacing:'-.015em', display:'-webkit-box', WebkitLineClamp: hero?3:2, WebkitBoxOrient:'vertical', overflow:'hidden', textShadow:'0 1px 14px rgba(0,0,0,.45)'}}>{n.title}</div>
                <div style={{display:'flex', alignItems:'center', gap:6, marginTop:7, font:'500 11px var(--font-body)', color:'rgba(255,255,255,.66)'}}>
                  <span>{n.source}</span><span style={{opacity:.5}}>·</span><span>{nsAgo(n.ts)}</span><span style={{opacity:.5}}>·</span><span>Open ↗</span>
                </div>
              </div>
            </button>
          );
        })}
        {visible < filtered.length && <div ref={sentinelRef} style={{height:40}}/>}
        <div style={{textAlign:'center', font:'500 12px var(--font-body)', color:'var(--text-tertiary)', padding:'2px 0 18px'}}>{live?'Live from crypto newswires':''}</div>
      </div>
    </>
  );
}


/* ── News ticker — horizontal auto-scrolling marquee of clickable headlines (Home) ── */
function NewsTicker() {
  const { items } = useLiveNews();
  const live = (items || []).slice(0, 8);
  // Fall back to the curated real-headline pool when the live fetch hasn't landed
  // (e.g. rss2json blocked/rate-limited on the viewer's network) — so the ticker
  // always scrolls real headlines instead of sitting on dead placeholder dots.
  const pool = live.length ? live
    : (window.arxComposeFeed ? arxComposeFeed() : []).slice(0, 8).map(n => ({ id:n.id, title:n.title, link:null, _immersive:true }));
  const openChip = (n) => { if (window.__arxOpenSub) window.__arxOpenSub('liveArticle', { item:n }); else if (n.link) window.open(n.link,'_blank','noopener'); };
  const Chip = ({ n }) => (
    <button onClick={()=>openChip(n)} className="arx-press" style={{flexShrink:0, display:'inline-flex', alignItems:'center', gap:6, padding:'0 5px', cursor:'pointer', background:'none', border:'none'}}>
      <span style={{width:4, height:4, borderRadius:'50%', background:'var(--regime-up-mid)', flexShrink:0}}/>
      <span style={{font:'500 11.5px var(--font-body)', color:'var(--text-secondary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:230}}>{n.title}</span>
      <span style={{flexShrink:0, width:1, height:11, background:'var(--border-default)', marginLeft:6}}/>
    </button>
  );
  if (!pool.length) return null;
  return <Ticker label="" compact duration={48} items={pool} renderChip={(n)=><Chip n={n}/>}/>;
}

/* ── Breaking strip — rotating headline below the Lucid bar (Home) ── */
function BreakingStrip() {
  const items = (window.arxComposeFeed ? window.arxComposeFeed() : ARX_NEWS).filter(n => n.cat==='Breaking' || n.cat==='On-chain').slice(0,5);
  const [i,setI] = React.useState(0); const [show,setShow] = React.useState(true);
  React.useEffect(()=>{ const id=setInterval(()=>{ setShow(false); setTimeout(()=>{ setI(p=>(p+1)%items.length); setShow(true); }, 280); }, 3600); return ()=>clearInterval(id); }, [items.length]);
  if(!items.length) return null;
  const n = items[i]; const im = arxFindInstrument(n.sym); const pos = im && im.deltaPct>=0;
  return (
    <button onClick={()=>window.__arxOpenSub && window.__arxOpenSub('newsImmersive', { startId:n.id, list:'breaking' })} className="arx-press" style={{display:'flex', alignItems:'center', gap:10, width:'calc(100% - 40px)', margin:'0 20px 12px', height:42, padding:'0 12px', borderRadius:12, cursor:'pointer', textAlign:'left', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', overflow:'hidden'}}>
      <span style={{display:'inline-flex', alignItems:'center', gap:5, flexShrink:0, font:'700 8.5px var(--font-body)', color:'var(--regime-down-mid)', letterSpacing:'.04em'}}><span className="arx-breath" style={{width:6, height:6, borderRadius:'50%', background:'var(--regime-down-mid)'}}/>{n.cat==='Breaking'?'BREAKING':'ON-CHAIN'}</span>
      <span style={{flex:1, minWidth:0, position:'relative', height:18, overflow:'hidden'}}>
        <span key={i} style={{position:'absolute', inset:0, display:'flex', alignItems:'center', font:'500 12px var(--font-body)', color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', opacity:show?1:0, transform:show?'translateY(0)':'translateY(-8px)', transition:'opacity 280ms cubic-bezier(.32,.72,0,1), transform 280ms cubic-bezier(.32,.72,0,1)'}}>{n.title}</span>
      </span>
      {im && <span className="num" style={{flexShrink:0, font:'600 11px var(--font-mono)', color: pos?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{n.sym} {pos?'+':'−'}{Math.abs(im.deltaPct).toFixed(1)}%</span>}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0}}><polyline points="9 6 15 12 9 18"/></svg>
    </button>
  );
}

Object.assign(window, { NewsScreen, NewsArticleScreen, NotificationsScreen, NewsCard, NotifIcon, ARX_NEWS, NEWS_BODY, NOTIFS, DailyBrief, NewsStream, BreakingStrip, NewsTicker });
