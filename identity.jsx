/* ═══ ARX · Identity — the human behind the wallet ═══
   Trust ladder, honest by design:
   · KOL / X-matched  → real handle + verified badge + x.com link
   · Claimed          → owner-provided profile (stored locally for the demo)
   · Unclaimed        → a warm, deterministic illustrated avatar (humanizes the
                        hex) + an honest "Unclaimed · Claim this wallet" seam.
   We never fabricate a named person for an anonymous wallet — warmth, not deception. */

const { useState: idS, useEffect: idE } = React;

/* ── deterministic hash from a seed string ── */
function idHash(str) {
  let h = 2166136261;
  for (let i = 0; i < (str||'').length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

/* ── palettes for the illustrated portrait ── */
const SKIN  = ['#F2C9A0','#E8B88A','#D89B6A','#C07B4E','#9C5C36','#7A4527','#F6D5B8'];
const HAIR  = ['#2B2118','#4A3525','#6B4A2E','#8A6A3E','#1A1A1F','#5A5560','#B5793A','#C9A14A'];
const BG    = [['#E5DCFA','#CBB9F2'],['#D9E7FB','#B9D0F2'],['#DFF3E8','#BFE6CF'],['#FBE7D6','#F4CDB0'],
               ['#F3DCF0','#E6BEDF'],['#E2E6EE','#C9D0DC'],['#FDEAC8','#F6D89A'],['#D7EEF2','#B3DDE5']];
const SHIRT = ['#7C5BFF','#2F8F6B','#C2603C','#3B6FB0','#5A5560','#B5793A','#995BB5'];

/* ── the avatar: a flat, friendly portrait built from the seed ── */
function PersonAvatar({ seed, size = 48, photo, ring }) {
  const [imgFail, setImgFail] = React.useState(false);
  const h = idHash(seed || 'arx');
  const skin  = SKIN[h % SKIN.length];
  const hair  = HAIR[(h >> 3) % HAIR.length];
  const bg    = BG[(h >> 6) % BG.length];
  const shirt = SHIRT[(h >> 9) % SHIRT.length];
  const style = (h >> 12) % 4;            // 0 short · 1 buzz · 2 long/parted · 3 bald-ish
  const acc   = (h >> 15) % 5;            // 0/1 none · 2 glasses · 3 beard · 4 both
  const glasses = acc === 2 || acc === 4;
  const beard   = acc === 3 || acc === 4;
  const id = 'pa' + (h % 100000);

  const ringStyle = ring
    ? { boxShadow: `0 0 0 2px var(--surface-base), 0 0 0 3.5px ${ring}` }
    : {};

  if (photo && !imgFail) {
    return <img src={photo} alt="" onError={()=>setImgFail(true)} style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', flexShrink:0, ...ringStyle }}/>;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ flexShrink:0, borderRadius:'50%', display:'block', ...ringStyle }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={bg[0]}/><stop offset="1" stopColor={bg[1]}/>
        </linearGradient>
        <clipPath id={id+'c'}><circle cx="50" cy="50" r="50"/></clipPath>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <rect width="100" height="100" fill={`url(#${id})`}/>
        {/* shoulders */}
        <path d="M16 100 C16 78 32 68 50 68 C68 68 84 78 84 100 Z" fill={shirt}/>
        <path d="M50 68 C44 68 40 72 40 72 L50 84 L60 72 C60 72 56 68 50 68 Z" fill="#fff" opacity=".14"/>
        {/* neck + head */}
        <rect x="43" y="56" width="14" height="14" rx="6" fill={skin}/>
        <circle cx="50" cy="44" r="20" fill={skin}/>
        {/* hair */}
        {style === 0 && <path d="M28 44 C28 28 42 22 50 22 C58 22 72 28 72 44 C72 38 66 33 62 33 C60 30 54 28 50 28 C46 28 40 30 38 33 C34 33 28 38 28 44 Z" fill={hair}/>}
        {style === 1 && <path d="M30 42 C30 28 42 23 50 23 C58 23 70 28 70 42 C66 36 60 34 50 34 C40 34 34 36 30 42 Z" fill={hair}/>}
        {style === 2 && <path d="M27 52 C25 30 42 21 50 21 C58 21 75 29 73 52 C72 44 70 40 68 38 C66 33 58 30 50 30 C42 30 36 32 33 37 C30 41 28 45 27 52 Z" fill={hair}/>}
        {style === 3 && <path d="M32 40 C34 30 42 26 50 26 C58 26 66 30 68 40 C62 36 57 35 50 35 C43 35 38 36 32 40 Z" fill={hair}/>}
        {/* eyes */}
        {glasses ? (
          <g>
            <circle cx="42" cy="45" r="6" fill="none" stroke="#2A2A30" strokeWidth="1.6"/>
            <circle cx="58" cy="45" r="6" fill="none" stroke="#2A2A30" strokeWidth="1.6"/>
            <line x1="48" y1="45" x2="52" y2="45" stroke="#2A2A30" strokeWidth="1.6"/>
            <circle cx="42" cy="45" r="2" fill="#2A2A30"/><circle cx="58" cy="45" r="2" fill="#2A2A30"/>
          </g>
        ) : (
          <g><circle cx="43" cy="45" r="2.4" fill="#2A2A30"/><circle cx="57" cy="45" r="2.4" fill="#2A2A30"/></g>
        )}
        {/* smile */}
        <path d="M44 53 Q50 58 56 53" fill="none" stroke="#9C5C45" strokeWidth="2" strokeLinecap="round"/>
        {/* beard */}
        {beard && <path d="M34 50 C34 64 42 70 50 70 C58 70 66 64 66 50 C62 58 57 60 50 60 C43 60 38 58 34 50 Z" fill={hair} opacity=".85"/>}
      </g>
    </svg>
  );
}

/* ── known KOL identities (handle → display name) ── */
const KOL_MAP = {
  '@hsakatrades': { name:'Hsaka',    followers:'436K' },
  '@blknoiz06':   { name:'Ansem',    followers:'810K' },
  '@pentosh1':    { name:'Pentoshi', followers:'703K' },
  '@52kskew':     { name:'Skew',     followers:'168K' },
  '@cobie':       { name:'Cobie',    followers:'790K' },
  '@gainzy222':   { name:'Gainzy',   followers:'212K' },
  '@giganticrebirth': { name:'GCR',  followers:'758K' },
  '@cryptokaleo': { name:'Kaleo',    followers:'641K' },
};

/* ── claim store (demo persistence) ── */
function readClaims() { try { return JSON.parse(localStorage.getItem('arx-claims') || '{}'); } catch(e) { return {}; } }
function writeClaim(addr, data) {
  const all = readClaims(); all[addr] = data;
  try { localStorage.setItem('arx-claims', JSON.stringify(all)); } catch(e) {}
}

/* ── resolve a wallet's identity into one model the UI reads ── */
function resolveIdentity(w) {
  const claim = readClaims()[w.addr];
  if (claim) return { kind:'claimed', name:claim.name, handle:claim.xUrl||null, bio:claim.bio||'', photo:claim.photo||null, seed:w.addr, verified:false, claimed:true };
  if (w.x) {
    const k = KOL_MAP[w.x.toLowerCase()];
    return { kind:'kol', name:k?k.name:w.x.replace('@',''), handle:w.x, followers:k?k.followers:null, photo:'https://unavatar.io/twitter/'+w.x.replace('@',''), seed:w.x, verified:true };
  }
  return { kind:'anon', name:null, handle:null, photo:null, seed:w.addr, verified:false };
}

/* ── verified / claim status pill ── */
function IdentityBadge({ id }) {
  if (id.kind === 'kol') return (
    <span style={{display:'inline-flex', alignItems:'center', gap:4, height:20, padding:'0 8px', borderRadius:999, background:'rgba(45,212,155,.12)', flexShrink:0}}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--regime-up-mid)"><path d="M12 2l2.4 2.1 3.1-.4 1.2 2.9 2.9 1.2-.4 3.1L23 16l-2.1 2.4.4 3.1-2.9 1.2-1.2 2.9-3.1-.4L12 22l-2.4-2.1-3.1.4-1.2-2.9-2.9-1.2.4-3.1L1 12l2.1-2.4-.4-3.1 2.9-1.2L6.8 2.4l3.1.4z"/><path d="M9.5 12.5l1.8 1.8 3.6-3.8" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      <span style={{font:'600 10px var(--font-body)', color:'var(--regime-up-mid)'}}>Verified</span>
    </span>
  );
  if (id.kind === 'claimed') return (
    <span style={{display:'inline-flex', alignItems:'center', gap:4, height:20, padding:'0 8px', borderRadius:999, background:'rgba(124,91,255,.12)', flexShrink:0}}>
      <span style={{font:'600 10px var(--font-body)', color:'var(--color-violet-500)'}}>Claimed</span>
    </span>
  );
  return (
    <span style={{display:'inline-flex', alignItems:'center', gap:4, height:20, padding:'0 8px', borderRadius:999, background:'var(--glass-control-bg)', flexShrink:0}}>
      <span style={{font:'600 10px var(--font-body)', color:'var(--text-tertiary)'}}>Unclaimed</span>
    </span>
  );
}

/* ── claim flow (bottom sheet) ── */
function ClaimSheet({ w, onClose, onToast }) {
  const [step, setStep] = idS('verify');   // verify | profile | done
  const [name, setName] = idS('');
  const [handle, setHandle] = idS('');
  const [bio, setBio] = idS('');

  const submit = () => {
    writeClaim(w.addr, { name: name || w.addr, xUrl: handle ? (handle.startsWith('@')?handle:'@'+handle) : '', bio });
    setStep('done');
    onToast && onToast('Wallet claimed — profile live');
  };

  return (
    <Sheet onClose={onClose} maxHeight="88%" zIndex={80}>

        {step === 'verify' && (
          <div style={{padding:'4px 22px 0'}}>
            <div style={{font:'700 21px var(--font-brand)', letterSpacing:'-.02em'}}>Claim this wallet</div>
            <div style={{font:'400 13.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5, marginTop:8}}>
              Prove you control <span className="num" style={{color:'var(--text-primary)'}}>{w.addr}</span> by signing a message from it. No gas, no transaction — a signature only.
            </div>
            <div style={{margin:'18px 0 0', padding:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:16}}>
              {['Sign a one-time message from this wallet','Add your name, photo and X link','Followers see a verified human, not a hex'].map((t,i)=>(
                <div key={i} style={{display:'flex', gap:11, alignItems:'flex-start', padding:'7px 0'}}>
                  <span style={{width:22, height:22, borderRadius:'50%', background:'rgba(124,91,255,.14)', color:'var(--color-violet-500)', font:'700 11px var(--font-mono)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>{i+1}</span>
                  <span style={{font:'500 13px var(--font-body)', color:'var(--text-primary)', lineHeight:1.4, paddingTop:2}}>{t}</span>
                </div>
              ))}
            </div>
            <button onClick={()=>setStep('profile')} className="arx-press" style={{width:'100%', height:52, marginTop:18, borderRadius:14, border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'700 15px var(--font-body)', boxShadow:'var(--shadow-execute)'}}>Sign to verify ownership</button>
            <div style={{textAlign:'center', font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:12, lineHeight:1.5}}>Only the wallet's owner can sign. Arx never takes custody.</div>
          </div>
        )}

        {step === 'profile' && (
          <div style={{padding:'4px 22px 0'}}>
            <div style={{font:'700 21px var(--font-brand)', letterSpacing:'-.02em'}}>Your public profile</div>
            <div style={{font:'400 13px var(--font-body)', color:'var(--text-secondary)', marginTop:6}}>This is what copiers see at the top of your wallet.</div>
            <div style={{display:'flex', justifyContent:'center', margin:'18px 0 6px'}}>
              <div style={{position:'relative'}}>
                <PersonAvatar seed={name || w.addr} size={76}/>
                <span style={{position:'absolute', right:-2, bottom:-2, width:26, height:26, borderRadius:'50%', background:'var(--color-violet-500)', border:'2px solid var(--surface-base)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                </span>
              </div>
            </div>
            {[['Display name', name, setName, 'e.g. Alex Rivera'], ['X / Twitter (optional)', handle, setHandle, '@yourhandle'], ['Bio (optional)', bio, setBio, 'One line about your style']].map(([l,v,set,ph],i)=>(
              <div key={i} style={{marginTop:14}}>
                <div style={{font:'600 11px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6}}>{l}</div>
                <input value={v} onChange={e=>set(e.target.value)} placeholder={ph} style={{width:'100%', height:46, borderRadius:12, border:'.5px solid var(--border-strong)', background:'var(--glass-control-bg)', padding:'0 14px', font:'500 14px var(--font-body)', color:'var(--text-primary)', outline:'none', boxSizing:'border-box'}}/>
              </div>
            ))}
            <button onClick={submit} className="arx-press" style={{width:'100%', height:52, marginTop:20, borderRadius:14, border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'700 15px var(--font-body)', boxShadow:'var(--shadow-execute)'}}>Publish profile</button>
          </div>
        )}

        {step === 'done' && (
          <div style={{padding:'10px 22px 0', textAlign:'center'}}>
            <div style={{display:'flex', justifyContent:'center', marginBottom:14}}>
              <PersonAvatar seed={name || w.addr} size={84} ring="var(--color-violet-500)"/>
            </div>
            <div style={{font:'700 21px var(--font-brand)', letterSpacing:'-.02em'}}>{name || 'Wallet'} is live</div>
            <div style={{font:'400 13.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5, marginTop:8}}>Copiers now see a verified human behind this wallet. You can edit your profile any time from this screen.</div>
            <button onClick={onClose} className="arx-press" style={{width:'100%', height:52, marginTop:22, borderRadius:14, border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'700 15px var(--font-body)', boxShadow:'var(--shadow-execute)'}}>Done</button>
          </div>
        )}
    </Sheet>
  );
}

Object.assign(window, { PersonAvatar, resolveIdentity, IdentityBadge, ClaimSheet, KOL_MAP });
