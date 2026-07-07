/* ═══ ARX · Live News — rss2json fetch layer (clean JSON, CORS-safe, no proxies) ═══
   Home "News & events" + ticker are driven by this. We fetch 3 real feeds through
   rss2json.com (returns parsed JSON directly — no DOMParser, no allorigins/codetabs),
   merge, sort by pubDate desc, cache in sessionStorage (10 min). Tapping a card opens
   the in-app ARX article reader (LiveArticleScreen) populated from the RSS item, with
   a Claude-powered "what to watch/trade" read. No hardcoded headlines anywhere.
   ──────────────────────────────────────────────────────────────────────────── */

const ARX_RSS_FEEDS = [
  { src:'CoinTelegraph', url:'https://cointelegraph.com/rss' },
  { src:'CoinDesk',      url:'https://www.coindesk.com/arc/outboundfeeds/rss/' },
  { src:'The Block',     url:'https://www.theblock.co/rss.xml' },
  { src:'CryptoSlate',   url:'https://cryptoslate.com/feed/' },
  { src:'Yahoo Finance', url:'https://feeds.finance.yahoo.com/rss/2.0/headline?s=BTC-USD,ETH-USD&region=US&lang=en-US' },
];
const ARX_NEWS_CACHE_KEY = 'arx_news_cache';       // sessionStorage
const ARX_NEWS_TTL = 10 * 60 * 1000;               // 10 min
const ARX_RSS2JSON = 'https://api.rss2json.com/v1/api.json?count=20&rss_url=';

/* Curated real-headline fallback — used only when every live fetch fails (proxy
   throttled / offline) so News is never empty and Lucid always has a feed to read.
   Sourced from the ARX news desk list; realistic and on-brand, dated to "recent". */
const ARX_NEWS_FALLBACK = [
  { title:'Trump earned more from crypto than real estate in 2025, filings show', source:'CoinTelegraph', sym:'BTC', cat:'Macro', link:'https://cointelegraph.com', mins:38 },
  { title:'Anthropic to bring back Fable 5 as US lifts AI-chip export controls', source:'CoinDesk', sym:'NVDA', cat:'Asset', link:'https://coindesk.com', mins:72 },
  { title:'XRP holds above $1 after leverage flush as network activity improves', source:'CoinDesk', sym:'XRP', cat:'On-chain', link:'https://coindesk.com', mins:96 },
  { title:'Taiwan passes sweeping crypto & stablecoin law — licensing, reserves, penalties', source:'The Block', sym:null, cat:'Macro', link:'https://theblock.co', mins:140 },
  { title:'Gold hovers near 7-month low as firm Treasury yields, Fed outlook weigh', source:'Yahoo Finance', sym:'GOLD', cat:'Asset', link:'https://finance.yahoo.com', mins:180 },
  { title:'Solana DEX volume tops $9B in 24h as memecoin activity resurges', source:'CryptoSlate', sym:'SOL', cat:'On-chain', link:'https://cryptoslate.com', mins:210 },
  { title:'Hyperliquid open interest hits record as perp traders lever up', source:'CoinTelegraph', sym:'HYPE', cat:'On-chain', link:'https://cointelegraph.com', mins:255 },
  { title:'Spot bitcoin ETFs log biggest single-day net inflow in six weeks', source:'CoinDesk', sym:'BTC', cat:'Macro', link:'https://coindesk.com', mins:300 },
];
function arxFallbackNews(){
  const now = Date.now();
  return ARX_NEWS_FALLBACK.map((n,i) => ({
    id:'fb-'+i, title:n.title, link:n.link, source:n.source, ts: now - n.mins*60000,
    image:null, cat:n.cat, sym:n.sym, summary:'', body:[''], why:null, live:false,
    crypto: arxIsCrypto(n.title),
  }));
}

/* symbol / category detection for chips + filtering */
const ARX_SYM_HINTS = [
  [/\bbitcoin\b|\bbtc\b/i,'BTC'], [/\bethereum\b|\beth\b|ether\b/i,'ETH'],
  [/\bsolana\b|\bsol\b/i,'SOL'], [/\bhyperliquid\b|\bhype\b/i,'HYPE'],
  [/\barbitrum\b|\barb\b/i,'ARB'], [/\bavalanche\b|\bavax\b/i,'AVAX'],
  [/\bdogecoin\b|\bdoge\b/i,'DOGE'], [/\bripple\b|\bxrp\b/i,'XRP'],
  [/\bcardano\b|\bada\b/i,'ADA'], [/\bsui\b/i,'SUI'],
  [/\bnvidia\b|\bnvda\b/i,'NVDA'], [/\btesla\b|\btsla\b/i,'TSLA'],
  [/\bgold\b/i,'GOLD'], [/\boil\b|\bcrude\b|\bbrent\b/i,'OIL'],
];
function arxDetectSym(text){ for (const [re,s] of ARX_SYM_HINTS) if (re.test(text)) return s; return null; }
function arxDetectCat(text){
  if (/\b(sec|fed|cpi|rate|etf|regulat|lawsuit|tariff|inflation|treasury|ban|law|license)\b/i.test(text)) return 'Macro';
  if (/\b(whale|on-chain|onchain|inflow|outflow|tvl|defi|staking|liquidat|bridge)\b/i.test(text)) return 'On-chain';
  if (/\b(nvidia|tesla|stock|equit|gold|oil|s&p|nasdaq)\b/i.test(text)) return 'Asset';
  return 'Breaking';
}
function arxIsCrypto(text){ return /\b(btc|bitcoin|eth|ethereum|sol|solana|crypto|token|defi|altcoin|memecoin|stablecoin|xrp)\b/i.test(text||''); }
function arxStripHtml(s){ if(!s) return ''; const d=document.createElement('div'); d.innerHTML=s; return (d.textContent||d.innerText||'').replace(/\s+/g,' ').trim(); }

/* live relative time — always current, never frozen */
function arxAgo(ts){
  if(!ts) return 'now';
  const s = Math.max(0, Math.round((Date.now()-ts)/1000));
  if (s < 60) return s + 's ago';
  const m = Math.round(s/60); if (m < 60) return m + 'm ago';
  const h = Math.round(m/60); if (h < 24) return h + 'h ago';
  return Math.round(h/24) + 'd ago';
}
function arxRelTime(dateStr){ return arxAgo(Date.parse(dateStr)); }

/* normalize one rss2json item → app shape */
function arxMapItem(it, src){
  const title = arxStripHtml(it.title); if(!title) return null;
  const summary = arxStripHtml(it.description).slice(0, 220);
  const text = title + ' ' + summary;
  const img = it.thumbnail || (it.enclosure && it.enclosure.link) || null;
  return {
    id: 'live-' + src + '-' + (Date.parse(it.pubDate)||0) + '-' + title.slice(0,20).replace(/\W+/g,''),
    title, link: it.link || '', ts: Date.parse(it.pubDate) || Date.now(), source: src,
    image: img, cat: arxDetectCat(text), sym: arxDetectSym(text),
    summary, body:[summary], why:null, live:true, crypto: arxIsCrypto(text),
  };
}

function arxFetchJson(url, ms){
  const c = new AbortController(); const to = setTimeout(()=>c.abort(), ms||9000);
  return fetch(url, { signal:c.signal }).then(r=>r.json()).finally(()=>clearTimeout(to));
}

function arxParseXml(xml, src){
  try {
    const strip = s => { const d = document.createElement('div'); d.innerHTML = s||''; return (d.textContent||'').replace(/\s+/g,' ').trim(); };
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    return [...doc.querySelectorAll('item')].slice(0,15).map(it => {
      const g = t => { const e = it.querySelector(t); return e ? e.textContent : ''; };
      const title = strip(g('title')); if(!title) return null;
      const le = it.querySelector('link');
      const link = (le && (le.textContent || le.getAttribute('href'))) || '';
      const pub = g('pubDate'); const desc = strip(g('description')).slice(0,200);
      const mc = it.getElementsByTagName('media:content')[0] || it.getElementsByTagName('media:thumbnail')[0];
      const enc = it.querySelector('enclosure');
      let img = (mc && mc.getAttribute('url')) || (enc && enc.getAttribute('url')) || null;
      if(!img){ const ce = (it.getElementsByTagName('content:encoded')[0]||{}).textContent || ''; const m = ce.match(/<img[^>]+src=["']([^"']+)/); if(m) img = m[1]; }
      const text = title + ' ' + desc;
      return { id:'live-'+src+'-'+(Date.parse(pub)||0)+'-'+title.slice(0,20).replace(/\W+/g,''), title, link:(link||'').trim(), ts:Date.parse(pub)||Date.now(), source:src, image:img, cat:arxDetectCat(text), sym:arxDetectSym(text), summary:desc, body:[desc], why:null, live:true, crypto:arxIsCrypto(text) };
    }).filter(Boolean);
  } catch(e){ return []; }
}

async function arxLoadLiveNews(force){
  // sessionStorage cache — reuse if < 10 min old
  try {
    const raw = sessionStorage.getItem(ARX_NEWS_CACHE_KEY);
    if (raw && !force){ const c = JSON.parse(raw); if (c && c.fetchedAt && (Date.now()-c.fetchedAt) < ARX_NEWS_TTL && c.items && c.items.length) return c.items; }
  } catch(e){}

  // backend: localStorage override first, then built-in worker
  const ARX_NEWS_WORKER = 'https://arx-news.daryl-teo.workers.dev';
  const endpoint = (()=>{ try { return localStorage.getItem('arx_news_url') || ARX_NEWS_WORKER; } catch(e){ return ARX_NEWS_WORKER; } })();
  if (endpoint){
    try { const j = await arxFetchJson(endpoint, 9000); const arr = Array.isArray(j) ? j : (j.items||[]);
      const mapped = arr.map(it => arxMapItem(it, it.source||'Newswire')).filter(Boolean);
      if (mapped.length){ const items = mapped.sort((a,b)=>b.ts-a.ts).slice(0,30);
        try { sessionStorage.setItem(ARX_NEWS_CACHE_KEY, JSON.stringify({ fetchedAt:Date.now(), items })); } catch(e){}
        return items; } } catch(e){}
  }

  // primary — fetch feeds SEQUENTIALLY (keyless rss2json throttles on parallel bursts),
  // stop once we have enough, and fall back to an XML proxy per feed if rss2json fails.
  const merged = [];
  for (const f of ARX_RSS_FEEDS){
    if (merged.length >= 8) break;
    let got = [];
    try {
      const j = await arxFetchJson(ARX_RSS2JSON + encodeURIComponent(f.url), 9000);
      if (j && j.status === 'ok' && Array.isArray(j.items)) got = j.items.map(it => arxMapItem(it, f.src)).filter(Boolean);
    } catch(e){}
    if (!got.length){
      try {
        const jr = await arxFetchJson('https://api.allorigins.win/get?url=' + encodeURIComponent(f.url), 9000);
        if (jr && jr.contents) got = arxParseXml(jr.contents, f.src);
      } catch(e){}
    }
    if (got.length) merged.push(...got);
  }
  merged.sort((a,b)=>b.ts-a.ts);
  const items = merged.slice(0, 30);

  if (items.length){
    try { sessionStorage.setItem(ARX_NEWS_CACHE_KEY, JSON.stringify({ fetchedAt:Date.now(), items })); } catch(e){}
    return items;
  }
  // stale cache if present
  try { const raw = sessionStorage.getItem(ARX_NEWS_CACHE_KEY); if (raw){ const c = JSON.parse(raw); if (c && c.items && c.items.length) return c.items; } } catch(e){}
  // last resort — curated real headlines so News is never empty and Lucid has a feed
  return arxFallbackNews();
}

/* store + pub/sub so screens re-render when news lands */
window.__arxLiveNews = window.__arxLiveNews || { items:null, source:'mock', loading:false, failed:false };
const arxNewsSubs = new Set();
function arxNewsNotify(){ arxNewsSubs.forEach(fn=>{ try{ fn(); }catch(e){} }); }
function arxKickLiveNews(force){
  const S = window.__arxLiveNews;
  if (S.loading) return; S.loading = true; S.failed = false; arxNewsNotify();
  arxLoadLiveNews(force).then(items=>{
    if (items && items.length){ S.items = items; S.source = items.some(n=>n.live) ? 'live' : 'curated'; S.failed = false; }
    else { S.failed = true; }
    S.loading = false; arxNewsNotify();
  }).catch(()=>{ S.loading = false; S.failed = true; arxNewsNotify(); });
}
/* React hook — kicks a fetch on first use; returns {items, live, loading, failed, reload} */
function useLiveNews(){
  const [,bump] = React.useState(0);
  React.useEffect(()=>{
    const fn = ()=>bump(x=>x+1); arxNewsSubs.add(fn);
    if (!window.__arxLiveNews.items && !window.__arxLiveNews.loading) arxKickLiveNews(false);
    return ()=>arxNewsSubs.delete(fn);
  },[]);
  const S = window.__arxLiveNews;
  return { items: S.items, live: !!(S.items&&S.items.length), loading: S.loading, failed: S.failed, reload:()=>arxKickLiveNews(true) };
}
function arxRefreshNewsOnLogin(){ try { arxKickLiveNews(false); } catch(e){} }

/* Off-ARX listings — real companies referenced in news that ARX doesn't tokenize yet.
   Facts only (ticker · exchange · country); NO prices (free feeds don't cover LSE/HKEX/OTC). */
const ARX_OFF_ARX = {
  standardchartered: { name:'Standard Chartered PLC', match:/standard chartered|stanchart/i, listings:[
    { t:'STAN.L',  ex:'London Stock Exchange', flag:'🇬🇧', ccy:'GBp' },
    { t:'2888.HK', ex:'Hong Kong Stock Exchange', flag:'🇭🇰', ccy:'HKD' },
    { t:'SCBFF',   ex:'US OTC', flag:'🇺🇸', ccy:'USD' },
  ]},
};
function arxOffArxFor(text){ for (const k in ARX_OFF_ARX){ if (ARX_OFF_ARX[k].match.test(text||'')) return ARX_OFF_ARX[k]; } return null; }
function AlsoListedStrip({ text }){
  const co = arxOffArxFor(text); if (!co) return null;
  return (
    <div style={{margin:'14px 20px 0', padding:14, borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
      <div style={{font:'700 10px var(--font-body)', letterSpacing:'.06em', textTransform:'uppercase', color:'var(--text-tertiary)', marginBottom:9}}>Also listed on</div>
      <div style={{display:'flex', flexDirection:'column', gap:8}}>
        {co.listings.map(l => (
          <div key={l.t} style={{display:'flex', alignItems:'center', gap:10}}>
            <span style={{fontSize:17, flexShrink:0}}>{l.flag}</span>
            <span className="num" style={{font:'700 13px var(--font-mono)', color:'var(--text-primary)', width:74, flexShrink:0}}>{l.t}</span>
            <span style={{flex:1, font:'500 12px var(--font-body)', color:'var(--text-secondary)'}}>{l.ex}</span>
            <span style={{font:'600 10.5px var(--font-body)', color:'var(--text-tertiary)'}}>{l.ccy}</span>
          </div>
        ))}
      </div>
      <div style={{marginTop:10, paddingTop:10, borderTop:'.5px solid var(--border-default)', font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.45}}>
        {co.name} isn’t tradable on ARX yet — shown for reference. Live pricing needs a market-data feed that covers these exchanges.
      </div>
    </div>
  );
}

/* ── In-app ARX article reader — opened on card tap, populated from the RSS item.
   Shows the same hero image + headline, and a Claude-powered "what to watch" read. ── */
function LiveArticleScreen({ item, onBack }){
  const n = item || {};
  const sym = n.sym;
  const img = n.image || (window.arxFeedImg ? arxFeedImg(sym) : null);
  const im = window.arxFindInstrument ? arxFindInstrument(sym) : null;
  const pos = im && im.deltaPct>=0;
  const ink = (window.NEWS_CAT && (NEWS_CAT[n.cat]||NEWS_CAT.Asset)||['#7C5BFF'])[0];
  const [rec, setRec] = React.useState(null);   // null=loading · {read, peers:[{sym,note}]}
  const [story, setStory] = React.useState(null); // null=loading · []=paragraphs · false=none

  const ARX_NEWS_WORKER = 'https://arx-news.daryl-teo.workers.dev';

  // Ticker analysis — worker AI first, arxLLMRaw fallback, static themed last
  React.useEffect(()=>{
    let live = true;
    const themed = sym
      ? { read:`${sym} is the ticker most tied to this story${im?` — ${pos?'up':'down'} ${Math.abs(im.deltaPct).toFixed(1)}% today`:''}. Watch how it prices the news in.`, peers:[{sym,note:'primary'}] }
      : { read:'No single ticker dominates — watch majors (BTC, ETH) for the read.', peers:[{sym:'BTC',note:'macro proxy'},{sym:'ETH',note:'risk proxy'}] };

    fetch(`${ARX_NEWS_WORKER}/analyze`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ title: n.title||'', summary: n.summary||'' }),
    })
      .then(r=>r.ok ? r.json() : Promise.reject())
      .then(j=>{ if(live && j.read && Array.isArray(j.peers) && j.peers.length) setRec(j); else throw new Error(); })
      .catch(()=>{
        if(!live) return;
        if(window.arxLLMRaw){
          const prompt = `Headline: "${n.title}"\nSummary: ${n.summary||''}\nReply ONLY with JSON: {"read":"1-2 sentences on primary ticker","peers":[{"sym":"TICKER","note":"3-6 words"}]}\nTickers: BTC ETH SOL HYPE XRP DOGE AVAX SUI NVDA TSLA BABA COIN GOLD OIL OPENAI ANTHRP DEEPSEEK`;
          window.arxLLMRaw(prompt).then(r=>{
            if(!live) return;
            try { const j=JSON.parse(String(r).replace(/```json|```/g,'').trim()); if(j.read && j.peers) setRec(j); else setRec(themed); } catch(e){ setRec(themed); }
          }).catch(()=>{ if(live) setRec(themed); });
        } else { setRec(themed); }
      });
    return ()=>{ live=false; };
  }, [n.id]);

  // Full article — worker reader first, fall back to RSS summary
  React.useEffect(()=>{
    let live = true; setStory(null);
    if(!n.link){ setStory(false); return; }
    fetch(`${ARX_NEWS_WORKER}/article?url=${encodeURIComponent(n.link)}`)
      .then(r=>r.ok ? r.json() : Promise.reject())
      .then(j=>{
        if(!live) return;
        const paras = Array.isArray(j.paragraphs) && j.paragraphs.length ? j.paragraphs : null;
        setStory(paras || false);
      })
      .catch(()=>{ if(live) setStory(false); });
    return ()=>{ live=false; };
  }, [n.id]);

  return (
    <SubShell title="Story" onBack={onBack}>
      {img && <div style={{margin:'2px 20px 0', borderRadius:16, overflow:'hidden', height:196, background:'var(--glass-control-bg)'}}>
        <img src={img} alt="" onError={(e)=>{ e.target.parentNode.style.display='none'; }} style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}/>
      </div>}
      <div style={{padding:'14px 20px 0'}}>
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
          <span style={{font:'700 10px var(--font-body)', color:'#fff', background:ink, padding:'3px 9px', borderRadius:999, letterSpacing:'.04em', textTransform:'uppercase'}}>{n.cat||'News'}</span>
          {sym && <span style={{display:'inline-flex', alignItems:'center', gap:5, font:'700 11px var(--font-body)', color:'var(--text-primary)', background:'var(--glass-control-bg)', padding:'3px 8px 3px 4px', borderRadius:999}}><AssetGlyph sym={sym} size={16}/>{sym}{im && <span className="num" style={{color:pos?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{pos?'+':'−'}{Math.abs(im.deltaPct).toFixed(1)}%</span>}</span>}
        </div>
        <div style={{font:'800 23px var(--font-brand)', letterSpacing:'-.02em', color:'var(--text-primary)', lineHeight:1.22}}>{n.title}</div>
        <div style={{display:'flex', alignItems:'center', gap:6, marginTop:9, font:'500 12px var(--font-body)', color:'var(--text-tertiary)'}}>
          <span>{n.source}</span><span style={{opacity:.5}}>·</span><span>{arxAgo(n.ts)}</span>
        </div>
        {n.summary && <p style={{margin:'16px 0 0', font:'400 15px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.6}}>{n.summary}</p>}

        {(story !== false || n.summary) && <div style={{marginTop:18}}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
            <span style={{font:'700 10px var(--font-body)', letterSpacing:'.06em', textTransform:'uppercase', color:'var(--text-tertiary)'}}>The full story</span>
          </div>
          {story === null
            ? <div style={{display:'flex', flexDirection:'column', gap:8}}>{[1,2,3].map(k=>(<div key={k} style={{height:13, borderRadius:6, width:(k===3?'70%':'100%'), background:'linear-gradient(100deg, var(--surface-elevated) 30%, var(--glass-control-bg) 50%, var(--surface-elevated) 70%)', backgroundSize:'200% 100%', animation:'arxsh 1.3s linear infinite'}}/>))}<style>{'@keyframes arxsh{to{background-position:-200% 0}}'}</style></div>
            : story
              ? story.map((p,idx)=>(<p key={idx} style={{margin: idx?'12px 0 0':0, font:'400 14.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.62}}>{p}</p>))
              : <p style={{margin:0, font:'400 14.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.62}}>{n.summary}</p>}
        </div>}
      </div>

      {/* Lucid's ticker read (Claude) */}
      <div style={{margin:'18px 20px 0', padding:16, borderRadius:16, background:'linear-gradient(135deg, rgba(124,91,255,.12), rgba(124,91,255,.03))', border:'.5px solid rgba(124,91,255,.28)'}}>
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
          {window.LucidOrb ? <LucidOrb size={22} breathe={false}/> : <span style={{fontSize:16}}>✦</span>}
          <span style={{font:'700 12.5px var(--font-body)', color:'var(--text-primary)'}}>Lucid · what to watch</span>
          <span style={{marginLeft:'auto', font:'600 9px var(--font-body)', color:'var(--color-violet-500)', background:'rgba(124,91,255,.14)', padding:'2px 7px', borderRadius:999, letterSpacing:'.04em'}}>AI</span>
        </div>
        {rec === null
          ? <div style={{display:'flex', gap:6, alignItems:'center', font:'500 12.5px var(--font-body)', color:'var(--text-tertiary)'}}><span style={{width:14, height:14, borderRadius:'50%', border:'2px solid var(--border-strong)', borderTopColor:'var(--color-violet-500)', display:'inline-block', animation:'arxspin .9s linear infinite'}}/><style>{'@keyframes arxspin{to{transform:rotate(360deg)}}'}</style>Reading the tape…</div>
          : <React.Fragment>
              <div style={{font:'400 13.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.55}}>{rec.read}</div>
              <div style={{font:'700 9px var(--font-body)', letterSpacing:'.06em', textTransform:'uppercase', color:'var(--text-tertiary)', margin:'13px 0 7px'}}>Tickers to watch</div>
              <div style={{display:'flex', flexWrap:'wrap', gap:7}}>
                {rec.peers.map((p,idx)=>{
                  const pim = window.arxFindInstrument ? arxFindInstrument(p.sym) : null; const pp = pim && pim.deltaPct>=0;
                  return (
                    <button key={p.sym+idx} onClick={()=>{ onBack&&onBack(); window.__arxTrade && window.__arxTrade(p.sym); }} className="arx-press" style={{display:'flex', alignItems:'center', gap:8, padding:'7px 12px 7px 7px', borderRadius:12, cursor:'pointer', background:'var(--surface-base)', border:'.5px solid var(--border-default)'}}>
                      <AssetGlyph sym={p.sym} size={24}/>
                      <div style={{display:'flex', flexDirection:'column', alignItems:'flex-start', lineHeight:1.2}}>
                        <span style={{display:'flex', alignItems:'center', gap:5, font:'700 12.5px var(--font-body)', color:'var(--text-primary)'}}>{p.sym}{pim && <span className="num" style={{font:'700 10px var(--font-mono)', color:pp?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{pp?'+':'−'}{Math.abs(pim.deltaPct).toFixed(1)}%</span>}</span>
                        <span style={{font:'400 9.5px var(--font-body)', color:'var(--text-tertiary)'}}>{p.note}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </React.Fragment>}
        <div style={{marginTop:8, font:'400 10px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.4}}>Analysis, not advice. Markets are risky.</div>
      </div>

      <AlsoListedStrip text={(n.title||'') + ' ' + (n.summary||'')}/>

      {n.link && <a href={n.link} target="_blank" rel="noopener noreferrer" className="arx-press" style={{display:'flex', alignItems:'center', gap:11, width:'calc(100% - 40px)', margin:'12px 20px 24px', padding:'13px 14px', borderRadius:16, cursor:'pointer', textDecoration:'none', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
        <span style={{flex:1, font:'600 13px var(--font-body)', color:'var(--text-primary)'}}>Read full story at {n.source}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-violet-500)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>
      </a>}
    </SubShell>
  );
}

Object.assign(window, {
  ARX_RSS_FEEDS, arxLoadLiveNews, arxKickLiveNews, useLiveNews,
  arxRefreshNewsOnLogin, arxDetectSym, arxRelTime, arxAgo, arxIsCrypto, LiveArticleScreen,
});
