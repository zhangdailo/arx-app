/* ═══ ARX · Unified Search + Lucid omnibar ═══
   ONE field, two destinations. Top-docked on Markets + Copy.
     · typed ticker / X handle / 0x address → entity results (assets · wallets)
     · natural-language → handed to Lucid (same field, no mode switch)
   The classifier decides ordering; both kinds always reachable. The engine
   (arxSearchEntities + arxClassify) is shared — the Markets and Copy bars are
   the same component, and the Lucid hand-off reuses window.__arxOpenLucid. */

const { useState: sS, useRef: sR, useEffect: sE } = React;

/* ── flatten the instrument universe, category attached ── */
function arxFlatInstruments() {
  const out = [];
  Object.keys(D.instruments).forEach(cat => D.instruments[cat].forEach(m => out.push({ ...m, cat })));
  return out;
}
const ARX_ALIASES = {
  btc:'bitcoin xbt', eth:'ethereum ether', sol:'solana', hype:'hyperliquid',
  gold:'gold xau bullion', oil:'oil wti crude', 's&p':'sp500 spx index stocks', nvda:'nvidia stock',
  eur:'euro', gbp:'pound sterling cable', jpy:'yen japan',
  silver:'silver xag', copper:'copper hg', natgas:'natural gas henry',
};
function arxPrice(m) {
  const p = m.price;
  if (p >= 1000) return '$' + p.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (p >= 10)   return '$' + p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return '$' + p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

/* ── classifier — what the typed text most wants ── */
function arxClassify(raw) {
  const t = (raw || '').trim().toLowerCase();
  if (!t) return 'empty';
  if (t.startsWith('0x')) return 'wallet';
  if (t.startsWith('@'))  return 'wallet';
  const words = t.split(/\s+/).filter(Boolean);
  const nl = /\b(should|shall|would|could|what|whats|how|why|who|whose|when|where|explain|tell|show|worth|risk|risky|safe|good|better|best|vs|versus|compare|recommend|exposure|regime|funding|liquidat|portfolio|doing|happen|happened|away|miss|missed|leverage|trend|going|move|moving|right now|today)\b/.test(t) || t.endsWith('?');
  const tickerish = words.length === 1 && /^[a-z&]{2,6}$/.test(t);
  if (nl && words.length >= 2) return 'lucid';
  if (tickerish) return 'asset';
  if (words.length >= 3) return 'lucid';
  return 'mixed';
}

/* ── entity match — the literal search ── */
function arxSearchEntities(raw) {
  const t = (raw || '').trim().toLowerCase();
  if (!t) return { assets: [], wallets: [] };
  const handle = t.replace(/^@/, '');
  const rank = (sym) => sym === t ? 0 : sym.startsWith(t) ? 1 : 2;
  const assets = arxFlatInstruments().filter(a => {
    const sym = a.sym.toLowerCase(), nm = a.name.toLowerCase(), al = ARX_ALIASES[sym] || '';
    return sym.includes(t) || nm.includes(t) || (al && al.includes(t));
  }).sort((a, b) => rank(a.sym.toLowerCase()) - rank(b.sym.toLowerCase()));
  const wallets = WALLETS.filter(w => {
    const a = w.addr.toLowerCase(), x = (w.x || '').toLowerCase();
    return a.includes(t) || a.replace(/0x|…/g, '').includes(handle) || (x && x.replace('@', '').includes(handle));
  });
  return { assets, wallets };
}

/* ── recent searches (text queries the user committed to) ── */
function arxRecent() {
  try { return JSON.parse(localStorage.getItem('arx-recent-search') || '[]'); } catch (e) { return []; }
}
function arxPushRecent(q) {
  q = (q || '').trim();
  if (!q) return;
  try {
    const list = [q, ...arxRecent().filter(x => x.toLowerCase() !== q.toLowerCase())].slice(0, 6);
    localStorage.setItem('arx-recent-search', JSON.stringify(list));
  } catch (e) {}
}

/* ═══ The docked bar — Markets + Copy. A button that opens the overlay. ═══ */
/* ═══ The standard Lucid bar — activation button with rotating prompts (no search glyph) ═══
   One affordance: tap → the unified Lucid/search overlay. The orb + a cycling line teach what
   Lucid can do AND surface quick insights. `context` tunes the rotation per surface. */
const ARX_LUCID_PROMPTS = {
  default: [['ask','Ask Lucid anything'],['find','Search SOL, NVDA, gold, wallets…'],['ask','Is my exposure risky right now?'],['find','Find a wallet to copy']],
  home:    [['ask','What changed while I was away?'],['find','Search any market or wallet'],['ask','How are my copies doing?'],['ask','Is my risk okay right now?']],
  markets: [['ask','What\u2019s the regime right now?'],['find','Search SOL, NVDA, gold…'],['ask','Where is smart money active?'],['ask','Spot or perps for me?']],
  copy:    [['ask','Which wallets fit my style?'],['find','Search wallets & X handles'],['ask','Is this leader still hot?']],
  you:     [['ask','How is my risk right now?'],['ask','What moved my PnL today?'],['find','Search your positions'],['ask','Am I too concentrated?']],
  trade:   [['ask','Is funding a problem here?'],['ask','How far is my liquidation?'],['find','Switch market'],['ask','Where does smart money sit?']],
};
function LucidBar({ context = 'default', style }) {
  const prompts = ARX_LUCID_PROMPTS[context] || ARX_LUCID_PROMPTS.default;
  const [i, setI] = sS(0);
  const [show, setShow] = sS(true);
  sE(() => {
    const id = setInterval(() => { setShow(false); setTimeout(() => { setI(p => (p + 1) % prompts.length); setShow(true); }, 300); }, 3400);
    return () => clearInterval(id);
  }, [prompts.length]);
  const [kind, text] = prompts[i];
  const ask = kind === 'ask';
  return (
    <div className="arx-press" style={{
      display: 'flex', alignItems: 'center', gap: 10, width: 'calc(100% - 40px)', margin: '0 20px 14px',
      height: 48, padding: '0 6px 0 14px', borderRadius: 15,
      background: 'var(--surface-elevated)',
      border: '1px solid var(--lucid-bar-border, rgba(124,91,255,.22))',
      boxShadow: '0 1px 3px rgba(8,6,26,.05)',
      overflow: 'hidden', ...style
    }}>
      {/* leading affordance — reflects the current beat */}
      <button onClick={() => window.__arxOpenSearch && window.__arxOpenSearch('')} aria-label="Ask Lucid or search" style={{ display:'flex', alignItems:'center', gap:7, flex:1, minWidth:0, background:'none', border:'none', cursor:'pointer', padding:0, textAlign:'left' }}>
        <span style={{ width:26, height:26, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <LucidOrb size={26} breathe={false} />
        </span>
        <span style={{ font: '700 13.5px var(--font-body)', color: 'var(--color-violet-500)', flexShrink: 0, letterSpacing: '-.01em' }}>Lucid</span>
        <span style={{ font: '700 13.5px var(--font-body)', color: 'var(--color-violet-500)', opacity: .5, flexShrink: 0, marginLeft: -4 }}>:</span>
        <span style={{ flex: 1, minWidth: 0, position: 'relative', height: 20, overflow: 'hidden', marginLeft: 2 }}>
          <span key={i} style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            font: '500 13.5px var(--font-body)', color: 'var(--text-secondary)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(-9px)',
            transition: 'opacity 300ms cubic-bezier(.32,.72,0,1), transform 300ms cubic-bezier(.32,.72,0,1)'
          }}>{text}</span>
        </span>
      </button>
      {/* voice entry — Lucid is conversation, not search: a mic is the primary affordance */}
      <button onClick={() => window.__arxOpenSearch && window.__arxOpenSearch('', { voice: true })} aria-label="Ask Lucid by voice" className="arx-press" style={{ width:36, height:36, borderRadius:'50%', flexShrink:0, border:'none', cursor:'pointer', background:'rgba(124,91,255,.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-violet-500)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="21"/></svg>
      </button>
    </div>
  );
}
/* Back-compat: every call site passing `placeholder` keeps working; we map a few to a context. */
function UnifiedSearchBar({ placeholder = '', context, style }) {
  if (context) return <LucidBar context={context} style={style} />;
  const p = (placeholder || '').toLowerCase();
  const ctx = p.includes('portfolio') ? 'you' : p.includes('market') ? 'markets' : p.includes('wallet') ? 'copy' : p.includes('trade') ? 'trade' : 'default';
  return <LucidBar context={ctx} style={style} />;
}

/* ── mini sparkline ── */
function MiniSpark({ data, pos, w = 46, h = 20 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data), rng = (max - min) || 1;
  const pts = data.map((v, i) => [i / (data.length - 1) * w, h - 2 - ((v - min) / rng) * (h - 4)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const ink = pos ? 'var(--regime-up-mid)' : 'var(--regime-down-mid)';
  return <svg width={w} height={h} style={{ flexShrink: 0, display: 'block' }}><path d={d} fill="none" stroke={ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

/* ── result rows — literal lookup lane, now with one-tap actions ── */
function AssetResult({ m, q, onPick, onTrade }) {
  const pos = m.deltaPct >= 0;
  return (
    <div className="arx-row-press" style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '9px 20px' }}>
      <button onClick={onPick} style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 11, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
        <AssetGlyph sym={m.sym} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ font: '600 14.5px var(--font-body)', color: 'var(--text-primary)' }}>{m.sym}</span>
            <span style={{ font: '500 11px var(--font-body)', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</span>
          </div>
          <div className="num" style={{ font: '500 11.5px var(--font-mono)', color: 'var(--text-tertiary)', marginTop: 2 }}>{arxPrice(m)} · <span style={{ color: pos ? 'var(--regime-up-mid)' : 'var(--regime-down-mid)' }}>{pos ? '+' : '−'}{Math.abs(m.deltaPct).toFixed(1)}%</span></div>
        </div>
        <MiniSpark data={m.spark} pos={pos} />
      </button>
      <button onClick={() => onTrade && onTrade(m)} className="arx-press" style={{ flexShrink: 0, height: 30, padding: '0 14px', borderRadius: 9, border: 'none', cursor: 'pointer', background: 'rgba(124,91,255,.12)', color: 'var(--color-violet-500)', font: '700 12px var(--font-body)' }}>Trade</button>
    </div>
  );
}

function WalletResult({ w, onPick, onCopy }) {
  const id = window.resolveIdentity ? window.resolveIdentity(w) : { kind: 'anon' };
  const named = id.kind === 'claimed' || id.kind === 'kol';
  const title = named ? id.name : (w.x || w.addr);
  const roi = w.roi90 != null ? w.roi90 : (w.roi30 != null ? w.roi30 : null);
  return (
    <div className="arx-row-press" style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '9px 20px' }}>
      <button onClick={onPick} style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 11, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
        <WalletAvatar w={w} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span className={named ? '' : 'num'} style={{ font: `600 13.5px ${named ? 'var(--font-body)' : 'var(--font-mono)'}`, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
            {w.perf && <PerfBadge perf={w.perf} />}
          </div>
          <div className="num" style={{ font: '500 11px var(--font-mono)', color: 'var(--text-tertiary)', marginTop: 2 }}>
            {roi != null ? <span style={{ color: roi >= 0 ? 'var(--regime-up-mid)' : 'var(--regime-down-mid)' }}>{roi >= 0 ? '+' : '−'}{Math.abs(roi).toFixed(1)}% · </span> : ''}{w.copiers != null ? w.copiers.toLocaleString() + ' copiers' : 'wallet'}
          </div>
        </div>
      </button>
      <button onClick={() => onCopy && onCopy(w)} className="arx-press" style={{ flexShrink: 0, height: 30, padding: '0 14px', borderRadius: 9, border: 'none', cursor: 'pointer', background: 'rgba(124,91,255,.12)', color: 'var(--color-violet-500)', font: '700 12px var(--font-body)' }}>Copy</button>
    </div>
  );
}

/* ── the Ask-Lucid hand-off row ── */
function LucidRoute({ q, hero, onAsk }) {
  return (
    <button onClick={onAsk} className="arx-press" style={{
      display: 'flex', alignItems: 'center', gap: 12, width: 'calc(100% - 40px)', margin: '0 20px',
      padding: hero ? '14px 14px' : '12px 14px', borderRadius: 15, cursor: 'pointer', textAlign: 'left',
      background: hero ? 'linear-gradient(150deg, rgba(124,91,255,.16), rgba(124,91,255,.04) 75%)' : 'var(--surface-elevated)',
      border: '.5px solid ' + (hero ? 'rgba(124,91,255,.34)' : 'var(--border-default)')
    }}>
      <LucidOrb size={hero ? 34 : 28} breathe={hero} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ font: '700 13.5px var(--font-body)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Ask Lucid</span>
          <span style={{ font: '600 8.5px var(--font-body)', color: 'var(--color-violet-500)', background: 'rgba(124,91,255,.16)', padding: '2px 6px', borderRadius: 999, letterSpacing: '.06em' }}>AI</span>
        </div>
        <div style={{ font: '500 12.5px var(--font-body)', color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          “{q}”
        </div>
      </div>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-violet-500)" strokeWidth="2.4" strokeLinecap="round" style={{ flexShrink: 0 }}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
    </button>
  );
}

function SearchSectionLabel({ children, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px 6px' }}>
      <span style={{ flex: 1, font: '600 9.5px var(--font-body)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{children}</span>
      {action && <button onClick={onAction} style={{ background: 'none', border: 'none', cursor: 'pointer', font: '600 11px var(--font-body)', color: 'var(--color-violet-500)', padding: 0 }}>{action}</button>}
    </div>
  );
}

const ARX_LUCID_EXAMPLES = [
  'What changed while I was away?',
  'Should I worry about my SOL exposure?',
  "What's the market regime right now?",
  'Who should I copy?',
];

/* ── Learn with Lucid — beginner answers hub (powered by the AI), fomo-style ── */
const ARX_LUCID_LEARN = [
  ['◆', 'What is copy trading, and is it safe?'],
  ['◉', 'How do I read a wallet’s track record?'],
  ['⚠', 'What is liquidation — and how do I avoid it?'],
  ['≈', 'What does the “market regime” mean?'],
  ['✦', 'What makes a wallet “smart money”?'],
  ['÷', 'What is funding on perps?'],
  ['↑', 'How much should I size my first trade?'],
  ['△', 'What’s the difference between spot and perps?'],
];

/* ── inline fast-answer — crisp factual asks get a one-liner without the full panel ── */
const ARX_INLINE = [
  [/\bfunding\b/, 'SOL funding is +0.0084% / 8h — longs pay shorts, near its 8h average.'],
  [/\bregime|sentiment|fear|greed\b/, 'Market sentiment is in Fear (38). ETH is range-bound; SOL trending up, day 7.'],
  [/\bliquidat/, 'Your closest liquidation is on BTC — 6% away on mark price.'],
  [/\b(my )?risk\b/, 'Margin is healthy. Closest copy loss limit sits 14% away — nothing near a threshold.'],
  [/\bpnl|profit|today|doing\b/, 'Your copies are up +$340.10 today across 2 wallets. No guardrail came close.'],
];
function arxInlineAnswer(t) { const s = (t||'').toLowerCase(); for (const [re, a] of ARX_INLINE) if (re.test(s)) return a; return null; }

/* ═══ The overlay — top-anchored sheet, autofocus, two lanes, voice ═══ */
function SearchOverlay({ initialQuery = '', voice = false, onClose }) {
  const [q, setQ] = sS(initialQuery);
  const [recent, setRecent] = sS(arxRecent);
  const [listening, setListening] = sS(voice);
  const [heard, setHeard] = sS('');        // live transcript
  const [voiceErr, setVoiceErr] = sS('');   // unsupported / mic denied
  const inputRef = sR(null);
  const recRef = sR(null);
  const askLucidRef = sR(null);
  sE(() => { if (!listening) { const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 80); return () => clearTimeout(t); } }, [listening]);
  // Real voice capture via the Web Speech API (Chrome/Edge). Live-transcribes, then
  // routes the spoken text to Lucid. Graceful fallback to typing where unavailable.
  sE(() => {
    if (!listening) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setVoiceErr('Voice needs Chrome or Edge — type instead'); setListening(false); setTimeout(()=>inputRef.current&&inputRef.current.focus(),100); return; }
    setHeard(''); setVoiceErr('');
    let done = false, finalT = '';
    const rec = new SR(); recRef.current = rec;
    rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
    rec.onresult = (e) => { let interim=''; for (let i=e.resultIndex;i<e.results.length;i++){ const r=e.results[i]; if(r.isFinal) finalT+=r[0].transcript; else interim+=r[0].transcript; } setHeard((finalT+' '+interim).trim()); };
    rec.onerror = (e) => { if(done) return; done=true; const denied = e && (e.error==='not-allowed'||e.error==='service-not-allowed'); setVoiceErr(denied?'Mic permission blocked — type instead':'Didn’t catch that — tap the mic to retry, or type'); setListening(false); setTimeout(()=>inputRef.current&&inputRef.current.focus(),100); };
    rec.onend = () => { if(done) return; done=true; setListening(false); const said=(finalT||'').trim(); if(said){ setQ(said); askLucidRef.current && askLucidRef.current(said); } else { setTimeout(()=>inputRef.current&&inputRef.current.focus(),100); } };
    try { rec.start(); } catch(e){ setListening(false); }
    return () => { done=true; try{ rec.stop(); }catch(e){} };
  }, [listening]);

  const kind = arxClassify(q);
  const { assets, wallets } = arxSearchEntities(q);
  const lucidFirst = kind === 'lucid';
  const inline = q.trim() && lucidFirst ? arxInlineAnswer(q) : null;

  const openAsset = (m) => { arxPushRecent(m.sym); window.__arxOpenSub && window.__arxOpenSub('instrumentDetail', { m }); onClose(); };
  const openWallet = (w) => { arxPushRecent(w.x || w.addr); window.__arxOpenSub && window.__arxOpenSub('walletDetail', { w }); onClose(); };
  const tradeAsset = (m) => { arxPushRecent(m.sym); window.__arxTrade ? window.__arxTrade(m.sym) : (window.__arxOpenSub && window.__arxOpenSub('instrumentDetail', { m })); onClose(); };
  const copyWallet = (w) => { arxPushRecent(w.x || w.addr); window.__arxOpenSub && window.__arxOpenSub('walletDetail', { w }); onClose(); };
  const askLucid = (text) => {
    const t = (text || q).trim();
    if (!t) return;
    arxPushRecent(t);
    window.__arxOpenLucid && window.__arxOpenLucid({ query: t, contextLabel: 'From search · “' + t + '”' });
    onClose();
  };
  const clearRecent = () => { try { localStorage.removeItem('arx-recent-search'); } catch (e) {} setRecent([]); };
  askLucidRef.current = askLucid;

  const trending = ['SOL', 'BTC', 'HYPE', 'GOLD'].map(s => arxFlatInstruments().find(m => m.sym === s)).filter(Boolean);
  const suggestedWallets = WALLETS.filter(w => w.perf === 'smart_money' || (w.clusters && (w.clusters.includes('smart') || w.clusters.includes('whale')))).sort((a, b) => (b.roi90 || 0) - (a.roi90 || 0)).slice(0, 5);

  const hasEntities = assets.length || wallets.length;

  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 80, display: 'flex', flexDirection: 'column',
      background: 'rgba(8,6,26,.5)', backdropFilter: 'blur(16px) saturate(140%)', WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      animation: 'lucidScrim 300ms ease-out both' }}>
      <div onClick={e => e.stopPropagation()} style={{
        display: 'flex', flexDirection: 'column', flex: 1, marginTop: 'calc(76px + env(safe-area-inset-top))',
        background: 'var(--lucid-overlay-bg)',
        backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderRadius: '28px 28px 0 0', borderTop: '.5px solid var(--glass-sheet-border)',
        boxShadow: '0 -18px 64px rgba(8,6,26,.45), inset 0 .5px 0 rgba(255,255,255,.5)',
        overflow: 'hidden', position: 'relative',
        animation: 'lucidSheet 460ms cubic-bezier(.22,1,.36,1) both'
      }}>
        {/* grabber */}
        <div style={{ display:'flex', justifyContent:'center', paddingTop:9 }}>
          <div style={{ width:36, height:4, borderRadius:2, background:'var(--text-tertiary)', opacity:.4 }}/>
        </div>
        {/* search field — generous top spacing */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 12px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, height: 48, borderRadius: 14, padding: '0 10px 0 14px', background: 'var(--surface-elevated)', border: '.5px solid var(--border-strong)' }}>
            <IconSearch size={17} color="var(--text-tertiary)" />
            <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') askLucid(); }}
              placeholder="Search assets, wallets, or ask Lucid…"
              style={{ flex: 1, minWidth: 0, border: 'none', background: 'none', outline: 'none', font: '500 14.5px var(--font-body)', color: 'var(--text-primary)' }} />
            {q && <button onClick={() => { setQ(''); inputRef.current && inputRef.current.focus(); }} style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'var(--glass-control-bg-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconClose size={12} color="var(--text-secondary)" />
            </button>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', font: '600 14px var(--font-body)', color: 'var(--color-violet-500)', flexShrink: 0, padding: '0 2px' }}>Cancel</button>
        </div>

        {/* results */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}>
          {listening ? (
            <div onClick={()=>{ try{ recRef.current && recRef.current.stop(); }catch(e){} }} style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'56px 40px', cursor:'pointer' }}>
              <div style={{ position:'relative', width:96, height:96, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(124,91,255,.18)', animation:'lucidVoice 1.4s ease-out infinite' }}/>
                <span style={{ position:'absolute', inset:14, borderRadius:'50%', background:'rgba(124,91,255,.24)', animation:'lucidVoice 1.4s ease-out .3s infinite' }}/>
                <span style={{ width:60, height:60, borderRadius:'50%', background:'var(--color-violet-500)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--shadow-execute)' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="21"/></svg>
                </span>
              </div>
              <div style={{ font:'600 16px var(--font-body)', color:'var(--text-primary)', marginTop:22, minHeight:20, textAlign:'center', padding:'0 10px' }}>{heard || 'Listening…'}</div>
              <div style={{ font:'400 12.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:6 }}>{heard ? 'Tap to send' : 'Speak — a market, a wallet, or your risk'}</div>
            </div>
          ) : q.trim() === '' ? (
            <>
              {recent.length > 0 && (<>
                <SearchSectionLabel action="Clear" onAction={clearRecent}>Recent</SearchSectionLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 20px' }}>
                  {recent.map((r, i) => (
                    <button key={i} onClick={() => setQ(r)} className="arx-press" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 32, padding: '0 12px', borderRadius: 999, cursor: 'pointer', background: 'var(--surface-elevated)', border: '.5px solid var(--border-default)', font: '500 12.5px var(--font-body)', color: 'var(--text-primary)', maxWidth: 220 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></svg>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r}</span>
                    </button>
                  ))}
                </div>
              </>)}
              <SearchSectionLabel>Ask Lucid</SearchSectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 20px' }}>
                {ARX_LUCID_EXAMPLES.map((ex, i) => (
                  <button key={i} onClick={() => askLucid(ex)} className="arx-row-press" style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '11px 14px', borderRadius: 13, cursor: 'pointer', textAlign: 'left', background: 'var(--surface-elevated)', border: '.5px solid var(--border-default)' }}>
                    <LucidOrb size={22} breathe={false} />
                    <span style={{ flex: 1, font: '500 13px var(--font-body)', color: 'var(--text-secondary)' }}>{ex}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                ))}
              </div>
              <SearchSectionLabel>Learn with Lucid</SearchSectionLabel>
              <div style={{ display:'flex', gap:8, overflowX:'auto', padding:'0 20px 2px', scrollbarWidth:'none' }}>
                {ARX_LUCID_LEARN.map((t, i) => (
                  <button key={i} onClick={() => askLucid(t[1])} className="arx-press" style={{ flexShrink:0, width:172, textAlign:'left', padding:'12px 13px', borderRadius:14, cursor:'pointer', background:'linear-gradient(135deg, rgba(124,91,255,.10), rgba(124,91,255,.02))', border:'.5px solid rgba(124,91,255,.22)' }}>
                    <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:26, height:26, borderRadius:8, background:'rgba(124,91,255,.16)', color:'var(--color-violet-500)', font:'700 13px var(--font-body)' }}>{t[0]}</span>
                    <div style={{ font:'600 12.5px var(--font-body)', color:'var(--text-primary)', lineHeight:1.35, marginTop:9 }}>{t[1]}</div>
                  </button>
                ))}
              </div>
              <SearchSectionLabel>Trending</SearchSectionLabel>
              {trending.map(m => <AssetResult key={m.sym} m={m} onPick={() => openAsset(m)} onTrade={tradeAsset} />)}
              <SearchSectionLabel action="Browse all" onAction={() => { window.__arxGoTab && window.__arxGoTab('wallets'); onClose(); }}>Smart money to watch</SearchSectionLabel>
              {suggestedWallets.map(w => <WalletResult key={w.addr} w={w} onPick={() => openWallet(w)} onCopy={copyWallet} />)}
            </>
          ) : (
            <>
              {/* Ask Lucid — pinned at the top: Lucid is the headline function */}
              <div style={{ paddingTop: 12 }}><LucidRoute q={q.trim()} hero onAsk={() => askLucid()} /></div>

              {inline && (
                <div style={{ margin:'12px 20px 0', padding:'12px 14px', borderRadius:14, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
                    <LucidOrb size={18} breathe={false}/>
                    <span style={{ font:'700 10px var(--font-body)', color:'var(--color-violet-500)', letterSpacing:'.05em' }}>QUICK ANSWER</span>
                  </div>
                  <div style={{ font:'500 13px var(--font-body)', color:'var(--text-primary)', lineHeight:1.5 }}>{inline}</div>
                  <button onClick={() => askLucid()} className="arx-press" style={{ display:'flex', alignItems:'center', gap:6, marginTop:10, background:'none', border:'none', cursor:'pointer', padding:0, font:'600 12px var(--font-body)', color:'var(--color-violet-500)' }}>Open full chat
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                  </button>
                </div>
              )}

              {assets.length > 0 && (<>
                <SearchSectionLabel>Assets · {assets.length}</SearchSectionLabel>
                {assets.map(m => <AssetResult key={m.sym + m.cat} m={m} onPick={() => openAsset(m)} onTrade={tradeAsset} />)}
              </>)}

              {wallets.length > 0 && (<>
                <SearchSectionLabel>Wallets · {wallets.length}</SearchSectionLabel>
                {wallets.map(w => <WalletResult key={w.addr} w={w} onPick={() => openWallet(w)} onCopy={copyWallet} />)}
              </>)}

              {!hasEntities && !inline && (
                <div style={{ textAlign: 'center', padding: '28px 40px 18px' }}>
                  <div style={{ font: '600 14.5px var(--font-body)', color: 'var(--text-primary)' }}>No assets or wallets match</div>
                  <div style={{ font: '400 12.5px var(--font-body)', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>Lucid can take it from here — tap Ask Lucid above.</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes arxSearchDrop { from { opacity:.4; transform:translateY(-10px) } to { opacity:1; transform:translateY(0) } } @keyframes lucidVoice { 0%{transform:scale(.8); opacity:.7} 100%{transform:scale(1.5); opacity:0} } @keyframes lucidScrim { from{opacity:0} to{opacity:1} } @keyframes lucidSheet { from{transform:translateY(40px) scale(.97); opacity:0} 60%{opacity:1} to{transform:translateY(0) scale(1); opacity:1} }`}</style>
    </div>
  );
}

Object.assign(window, { UnifiedSearchBar, LucidBar, SearchOverlay, arxClassify, arxSearchEntities });
