/* ═══ ARX · Data sources — paste live-data endpoints without the console ═══
   Opened via __arxOpenSub('dataSources'). Persists to the same localStorage keys
   the live layers read: arx_news_url / arx_rss2json_key (news-live.jsx) and
   arx_ai_endpoint (lucid.jsx). Saving reloads the relevant caches so it takes
   effect immediately. Additive — no existing screen changed. */

const { useState: dsS } = React;

function DsField({ label, hint, placeholder, k, onSaved }) {
  const [v, setV] = dsS(()=>{ try { return localStorage.getItem(k) || ''; } catch(e){ return ''; } });
  const [saved, setSaved] = dsS(false);
  const save = () => {
    try { const t = v.trim(); if (t) localStorage.setItem(k, t); else localStorage.removeItem(k); } catch(e){}
    setSaved(true); setTimeout(()=>setSaved(false), 1400);
    onSaved && onSaved();
  };
  return (
    <div style={{margin:'0 16px 14px', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:16, padding:14}}>
      <div style={{font:'700 13px var(--font-body)', color:'var(--text-primary)'}}>{label}</div>
      <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:2, lineHeight:1.45}}>{hint}</div>
      <div style={{display:'flex', gap:8, marginTop:10}}>
        <input value={v} onChange={e=>setV(e.target.value)} placeholder={placeholder} spellCheck={false} autoCapitalize="off" autoCorrect="off"
          style={{flex:1, minWidth:0, height:40, borderRadius:10, border:'.5px solid var(--border-default)', background:'var(--surface-base)', color:'var(--text-primary)', padding:'0 12px', font:'500 12px var(--font-mono)', outline:'none'}}/>
        <button onClick={save} className="arx-press" style={{flexShrink:0, height:40, padding:'0 16px', borderRadius:10, border:'none', cursor:'pointer', background: saved?'var(--regime-up-mid)':'var(--color-violet-500)', color:'#fff', font:'700 12.5px var(--font-body)'}}>{saved?'Saved ✓':'Save'}</button>
      </div>
    </div>
  );
}

function DataSourcesScreen({ onBack, onToast }) {
  const reloadNews = () => { try { localStorage.removeItem('arx_live_news_v1'); window.arxKickLiveNews && window.arxKickLiveNews(true); } catch(e){} onToast && onToast('Live news source updated'); };
  const reloadAI = () => { onToast && onToast('Lucid backend updated'); };
  return (
    <SubShell title="Data sources" onBack={onBack}>
      <div style={{margin:'6px 20px 14px', font:'400 12.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>
        Connect live backends without touching code. Leave blank to use the built-in demo data. Values are stored on this device only.
      </div>

      <div style={{padding:'2px 20px 6px', font:'700 10.5px var(--font-body)', letterSpacing:'.06em', textTransform:'uppercase', color:'var(--text-tertiary)'}}>News feed</div>
      <DsField label="News endpoint URL" k="arx_news_url" onSaved={reloadNews}
        placeholder="https://your-api/news"
        hint="Your server returns { items:[{title, summary, source, image, link, pubDate}] }. Best option — no CORS or rate limits. Real headlines + images refresh on each load."/>
      <DsField label="rss2json API key" k="arx_rss2json_key" onSaved={reloadNews}
        placeholder="paste key (free tier)"
        hint="No backend? Paste a free rss2json.com key and ARX fetches the 12 crypto feeds directly in-browser."/>

      <div style={{padding:'10px 20px 6px', font:'700 10.5px var(--font-body)', letterSpacing:'.06em', textTransform:'uppercase', color:'var(--text-tertiary)'}}>Lucid AI</div>
      <DsField label="Lucid router URL" k="arx_lucid_router" onSaved={reloadAI}
        placeholder="http://localhost:3000/lucid/ask"
        hint="Multi-LLM router (grok→groq→claude→qwen→deepseek). POST { question } → { answer }. Tried first for every Lucid answer; falls back to the built-in cascade if unreachable."/>
      <DsField label="Lucid backend URL" k="arx_ai_endpoint" onSaved={reloadAI}
        placeholder="https://your-api/chat"
        hint="Routes Lucid's answers to your DataWorks/Hologres service (POST { system, messages }). Falls back to the built-in model when blank."/>
      <DsField label="Warehouse snapshot URL" k="arx_snapshot_url" onSaved={reloadAI}
        placeholder="https://your-api/wallet-snapshot.json"
        hint="Optional baked wallet-classification snapshot so Lucid can answer real count/filter questions."/>
      <DsField label="Deposit flow URL" k="arx_deposit_flow_url" onSaved={reloadAI}
        placeholder="https://your-router/deposit-flow?windowHours=24"
        hint="Real Arbitrum Bridge2 deposits + withdrawals by cohort. Include withdrawalsByCohort in the response for a real net figure — Lucid states deposits-only if it's absent."/>

      <div style={{margin:'6px 20px 24px', font:'400 11px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>
        Tip: the Markets cockpit already pulls live crypto data from the ARX quant warehouse automatically — these fields are for news and the Lucid copilot.
      </div>
    </SubShell>
  );
}

Object.assign(window, { DataSourcesScreen });
