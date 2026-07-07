/* ═══ ARX · screens2 — onboarding + funding flows (merged delta, rebuilt on DS tokens) ═══
   D1 Welcome → Create (email + OTP) / Connect (seed · key · watch · Hyperliquid) → Find match
   D2 Add funds → Deposit QR / Buy with card → quote → pending → done
   Terminology + data honesty per baseline: PnL register, S7-scale mocks, violet executes. */

const { useState: o2S, useEffect: o2E } = React;

/* shared chrome */
function FlowShell({ onBack, children }) {
  return (
    <div style={{position:'absolute', inset:0, background:'var(--surface-base)', color:'var(--text-primary)', overflow:'auto', zIndex:30}}>
      {onBack && (
        <button onClick={onBack} style={{margin:'64px 0 0 20px', width:34, height:34, borderRadius:'50%',
          border:'.5px solid var(--border-default)', background:'var(--surface-elevated)', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', transform:'rotate(180deg)'}}>
          <IconChevron size={16} color="var(--text-primary)"/>
        </button>
      )}
      {children}
    </div>
  );
}
function FlowTitle({ k, sub }) {
  return (
    <div style={{padding:'18px 24px 6px'}}>
      <div style={{font:'700 26px var(--font-body)', letterSpacing:'-.02em', lineHeight:1.15}}>{k}</div>
      {sub && <div style={{font:'400 13px var(--font-body)', color:'var(--text-secondary)', marginTop:8, lineHeight:1.5}}>{sub}</div>}
    </div>
  );
}
function FlowField({ label, value, onChange, placeholder, mono }) {
  return (
    <div style={{margin:'12px 24px 0'}}>
      <div style={{font:'600 11px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6}}>{label}</div>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} spellCheck="false"
        style={{width:'100%', boxSizing:'border-box', height:50, padding:'0 16px', borderRadius:14,
          border:'.5px solid var(--border-strong)', background:'var(--surface-elevated)',
          color:'var(--text-primary)', font:(mono?'500 14px var(--font-mono)':'500 15px var(--font-body)'), outline:'none'}}/>
    </div>
  );
}
function FlowCTA({ label, onClick, disabled, ghost }) {
  return (
    <button onClick={disabled?undefined:onClick} className={disabled?'':'arx-press'} style={{
      display:'block', width:'calc(100% - 48px)', margin:'18px 24px 0', height:52, borderRadius:16, cursor:disabled?'default':'pointer',
      border: ghost ? '.5px solid var(--border-strong)' : 'none',
      background: ghost ? 'transparent' : disabled ? 'rgba(124,91,255,.35)' : 'var(--color-violet-500)',
      color: ghost ? 'var(--text-primary)' : '#fff', font:'700 15px var(--font-body)',
      boxShadow: (!ghost && !disabled) ? 'var(--shadow-execute)' : 'none'
    }}>{label}</button>
  );
}

/* ─── Staged-depth wallet carousel (onboarding hero) ───
   5 wallet cards in a vertical depth stack: middle card in focus (100%),
   neighbours recede (50% / 30%), slow auto-advance. The "watch first" proof. */
const WELCOME_WALLETS = [
  { a:'@GiganticRebirth', x:'@giganticrebirth', t:'Smart money',  r:'+58.4%', tone:'up' },
  { a:'@HsakaTrades',     x:'@hsakatrades',     t:'Smart money',  r:'+24.1%', tone:'up' },
  { a:'@Pentosh1',        x:'@pentosh1',        t:'Smart money',  r:'+52.4%', tone:'up' },
  { a:'@blknoiz06',       x:'@blknoiz06',       t:'Rising money', r:'+31.7%', tone:'up' },
  { a:'0x4c2d…aa19',      x:null,               t:'Whale',        r:'+19.6%', tone:'up' },
  { a:'@CryptoKaleo',     x:'@cryptokaleo',     t:'Smart money',  r:'+44.0%', tone:'up' },
  { a:'0x7a3f…c891',      x:null,               t:'Whale',        r:'+38.2%', tone:'up' },
];
const WELCOME_TAX = { 'Smart money':['var(--regime-up-dark)','rgba(45,212,155,.14)'], 'Whale':['var(--regime-range-dark)','rgba(59,130,246,.14)'], 'Rising money':['var(--color-violet-700)','rgba(124,91,255,.14)'] };
function WelcomeStack() {
  const n = WELCOME_WALLETS.length;
  const [active, setActive] = o2S(2);
  o2E(() => {
    const id = setInterval(() => setActive(a => (a + 1) % n), 2400);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{margin:'34px 0 0'}}>
    <div style={{position:'relative', height:300, margin:'0 24px', overflow:'hidden'}}>
      {WELCOME_WALLETS.map((w, i) => {
        // signed circular distance from the active card
        let d = i - active;
        if (d > n/2) d -= n; if (d < -n/2) d += n;
        const ad = Math.abs(d);
        const focused = d === 0;
        const scale = focused ? 1 : ad === 1 ? 0.9 : 0.8;
        const opacity = focused ? 1 : ad === 1 ? 0.5 : 0.26;
        const ty = d * 62;                       // vertical depth offset
        const z = 10 - ad;
        return (
          <div key={w.a} aria-hidden={!focused} style={{
            position:'absolute', left:0, right:0, top:'50%',
            transform:`translateY(-50%) translateY(${ty}px) scale(${scale})`,
            opacity, zIndex:z, transition:'transform 620ms cubic-bezier(.32,.72,0,1), opacity 620ms cubic-bezier(.32,.72,0,1)',
            pointerEvents:'none'
          }}>
            <div style={{
              display:'flex', alignItems:'center', gap:12, padding:'15px 16px',
              borderRadius:18, background:'var(--surface-elevated)',
              border:'.5px solid ' + (focused ? 'rgba(124,91,255,.45)' : 'var(--border-default)'),
              boxShadow: focused ? '0 14px 38px rgba(124,91,255,.20)' : '0 4px 14px rgba(8,6,26,.06)'
            }}>
              <WalletAvatar w={{addr:w.a, x:w.x}} size={focused ? 40 : 34}/>
              <div style={{flex:1, minWidth:0}}>
                <div className="num" style={{font:`700 ${focused?15:13}px var(--font-mono)`, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{w.a}</div>
                <div style={{font:'600 10px var(--font-body)', color:(WELCOME_TAX[w.t]||WELCOME_TAX['Smart money'])[0], marginTop:3, display:'inline-block', background:(WELCOME_TAX[w.t]||WELCOME_TAX['Smart money'])[1], padding:'2px 8px', borderRadius:999}}>{w.t}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div className="num" style={{font:`700 ${focused?17:14}px var(--font-mono)`, color:'var(--regime-up-mid)'}}>{w.r}</div>
                <div style={{font:'400 9px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>90d PnL</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
      {/* progress dots */}
      <div style={{display:'flex', justifyContent:'center', gap:5, marginTop:18}}>
        {WELCOME_WALLETS.map((_, i) => (
          <span key={i} style={{width:i===active?16:5, height:5, borderRadius:999, background:i===active?'var(--color-violet-500)':'var(--border-strong)', transition:'width .4s'}}/>
        ))}
      </div>
    </div>
  );
}

/* ─── D1 · Onboarding ─── */
function OnboardFlow({ onDone }) {
  const [step, setStep] = o2S('welcome');   // welcome | create | otp | connect | connectInput | match
  const [email, setEmail] = o2S('');
  const [name, setName] = o2S('');
  const [agree, setAgree] = o2S(false);
  const [otp, setOtp] = o2S(0);
  const [connectKind, setConnectKind] = o2S(null);
  const [secret, setSecret] = o2S('');
  const [ans, setAns] = o2S({});

  const TOP = [
    ['0x7a3f…c891','Smart money','+38.2%'],
    ['@HsakaTrades','Smart money','+24.1%'],
    ['0x91be…77d2','Rising money','+31.7%'],
  ];

  if (step === 'welcome') return (
    <FlowShell>
      <div style={{padding:'76px 24px 0'}}><ArxWordmark height={30}/></div>
      <div style={{padding:'34px 24px 0'}}>
        <div style={{font:'600 11px var(--font-body)', color:'var(--color-violet-500)', letterSpacing:'.1em', textTransform:'uppercase'}}>Built on real wallets</div>
        <div style={{font:'700 34px var(--font-body)', letterSpacing:'-.02em', lineHeight:1.12, marginTop:10}}>Copy the proven,<br/>not the loud.</div>
        <div style={{font:'400 14px var(--font-body)', color:'var(--text-secondary)', marginTop:12, lineHeight:1.55}}>
          Every wallet here is labeled from its on-chain record. Watch first, copy when convinced.
        </div>
        <div style={{display:'flex', gap:7, marginTop:16}}>
          {[['Copy the best','◆'],['Trade everything','◎'],['Self-custody','◉']].map(([t,ic])=>(
            <div key={t} style={{flex:1, display:'flex', flexDirection:'column', gap:5, padding:'10px 8px', borderRadius:12, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
              <span style={{font:'700 14px var(--font-body)', color:'var(--color-violet-500)'}}>{ic}</span>
              <span style={{font:'600 10.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.25}}>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <WelcomeStack/>
      <div style={{position:'absolute', left:0, right:0, bottom:34}}>
        <FlowCTA label="Create wallet with e-mail" onClick={()=>setStep('create')}/>
        <button onClick={onDone} style={{display:'block', margin:'14px auto 0', background:'none', border:'none', cursor:'pointer', font:'500 13px var(--font-body)', color:'var(--text-tertiary)'}}>Proceed as a guest</button>
      </div>
    </FlowShell>
  );

  if (step === 'create') return (
    <FlowShell onBack={()=>setStep('welcome')}>
      <FlowTitle k={<span>Create new wallet<br/>with e-mail.</span>} sub="A self-custody wallet, secured by your e-mail. No seed phrase to lose."/>
      <FlowField label="Email address" value={email} onChange={setEmail} placeholder="you@example.com"/>
      <FlowField label="Your name" value={name} onChange={setName} placeholder="How should we greet you?"/>
      <label style={{display:'flex', alignItems:'center', gap:10, margin:'16px 24px 0', cursor:'pointer'}}>
        <span onClick={()=>setAgree(!agree)} style={{width:22, height:22, borderRadius:7, flexShrink:0,
          background: agree ? 'var(--color-violet-500)' : 'transparent',
          border: agree ? 'none' : '1.5px solid var(--border-strong)',
          display:'flex', alignItems:'center', justifyContent:'center'}}>
          {agree && <IconCheck color="#fff" size={13}/>}
        </span>
        <span style={{font:'400 12.5px var(--font-body)', color:'var(--text-secondary)'}}>
          I agree to the <b style={{color:'var(--color-violet-500)'}}>Terms of Service</b> and <b style={{color:'var(--color-violet-500)'}}>Privacy Policy</b>
        </span>
      </label>
      <FlowCTA label="Send code" disabled={!email.includes('@') || !agree} onClick={()=>{setOtp(0); setStep('otp');}}/>
    </FlowShell>
  );

  if (step === 'otp') return (
    <FlowShell onBack={()=>setStep('create')}>
      <FlowTitle k="Verify your e-mail" sub={'Enter the 6-digit code sent to ' + (email ? '•••••' + email.slice(email.indexOf('@')-2) : 'your inbox') + '.'}/>
      <div style={{display:'flex', gap:8, padding:'18px 24px 0'}} onClick={()=>setOtp(Math.min(6, otp+ (otp<6?6:0)))}>
        {[0,1,2,3,4,5].map(i => (
          <div key={i} className="num" style={{flex:1, height:54, borderRadius:13, display:'flex', alignItems:'center', justifyContent:'center',
            border:'1px solid ' + (i<otp ? 'var(--color-violet-500)' : 'var(--border-strong)'),
            background:'var(--surface-elevated)', font:'600 20px var(--font-mono)'}}>{i<otp ? String(i+1) : ''}</div>
        ))}
      </div>
      <div style={{padding:'10px 24px 0', font:'400 11px var(--font-body)', color:'var(--text-tertiary)'}}>Tap the boxes to autofill in this prototype.</div>
      <FlowCTA label="Confirm code" disabled={otp<6} onClick={()=>setStep('match')}/>
      <FlowCTA label="Resend" ghost onClick={()=>setOtp(0)}/>
    </FlowShell>
  );

  if (step === 'connect') {
    const OPTS = [
      ['walletconnect','WalletConnect','Scan from any mobile wallet'],
      ['seed','Import seed phrase','12 or 24 words'],
      ['key','Import private key','Single-address import'],
      ['watch','Watch an address','Read-only — no signing'],
      ['hl','Link Hyperliquid API','Mirror your existing account'],
    ];
    return (
      <FlowShell onBack={()=>setStep('welcome')}>
        <FlowTitle k="Connect existing wallet" sub="Your keys stay yours — Arx never holds funds."/>
        <div style={{margin:'14px 24px 0', borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', overflow:'hidden'}}>
          {OPTS.map(([id,t,d],i) => (
            <button key={id} onClick={()=>{ setConnectKind([id,t,d]); setSecret(''); setStep('connectInput'); }} style={{
              width:'100%', display:'flex', alignItems:'center', gap:12, padding:'14px 16px', textAlign:'left',
              background:'none', border:'none', cursor:'pointer', borderTop: i? '.5px solid var(--border-default)':'none'}}>
              <div style={{flex:1}}>
                <div style={{font:'600 14.5px var(--font-body)', color:'var(--text-primary)'}}>{t}</div>
                <div style={{font:'400 12px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>{d}</div>
              </div>
              <IconChevron color="var(--text-tertiary)"/>
            </button>
          ))}
        </div>
      </FlowShell>
    );
  }

  if (step === 'connectInput') {
    const [id, t] = connectKind || ['seed','Import seed phrase'];
    const hint = id==='seed' ? 'word1 word2 word3 …' : id==='key' ? '0x4f8a…' : id==='watch' ? '0x… or name.eth' : id==='hl' ? 'API key' : '';
    return (
      <FlowShell onBack={()=>setStep('connect')}>
        <FlowTitle k={t} sub={id==='watch' ? 'Read-only. Great for studying a wallet before trusting it.' : 'Encrypted on this device — never sent to Arx servers.'}/>
        {id==='walletconnect' ? (
          <div style={{margin:'20px 24px 0', padding:24, borderRadius:18, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', textAlign:'center'}}>
            <QRBlock size={170}/>
            <div style={{font:'400 12px var(--font-body)', color:'var(--text-tertiary)', marginTop:12}}>Scan with your wallet app</div>
          </div>
        ) : (
          <FlowField label={t} value={secret} onChange={setSecret} placeholder={hint} mono/>
        )}
        <FlowCTA label={id==='watch' ? 'Start watching' : 'Connect'} disabled={id!=='walletconnect' && secret.length<4} onClick={()=>setStep('match')}/>
      </FlowShell>
    );
  }

  /* find match — 3 questions, then in */
  const Q = [
    ['exp','How much trading have you done?',['First timer','Some spot','Perps before']],
    ['goal','What are you here for?',['Steady growth','High conviction bets','Just watching']],
    ['risk','A copy drops 15% in a week. You…',['Stop it','Hold the plan','Add more']],
  ];
  const ready = Q.every(([k]) => ans[k]);
  return (
    <FlowShell onBack={()=>setStep('welcome')}>
      <FlowTitle k="Find your match" sub="Three questions — we'll preset guardrails and a starting lens for you. Changeable any time."/>
      {Q.map(([k,q,opts]) => (
        <div key={k} style={{margin:'16px 24px 0'}}>
          <div style={{font:'600 13.5px var(--font-body)', marginBottom:8}}>{q}</div>
          <div style={{display:'flex', gap:8}}>
            {opts.map(o => (
              <button key={o} onClick={()=>setAns(p=>({...p,[k]:o}))} style={{
                flex:1, minHeight:40, padding:'8px 6px', borderRadius:11, cursor:'pointer',
                border:'.5px solid ' + (ans[k]===o ? 'var(--color-violet-500)' : 'var(--border-default)'),
                background: ans[k]===o ? 'rgba(124,91,255,.16)' : 'var(--surface-elevated)',
                color: ans[k]===o ? 'var(--color-violet-500)' : 'var(--text-primary)',
                font:'600 12px var(--font-body)', lineHeight:1.25}}>{o}</button>
            ))}
          </div>
        </div>
      ))}
      <FlowCTA label="Enter Arx" disabled={!ready} onClick={onDone}/>
      <div style={{height:34}}/>
    </FlowShell>
  );
}

/* fake QR — deterministic grid */
function QRBlock({ size = 160 }) {
  const cells = [];
  let seed = 7;
  for (let y=0; y<21; y++) for (let x=0; x<21; x++) {
    seed = (seed * 137 + x*31 + y*17) % 97;
    const finder = (x<7&&y<7)||(x>13&&y<7)||(x<7&&y>13);
    if (finder ? ((x%6===0||y%6===0||x===2&&y>=2&&y<=4||y===2&&x>=2&&x<=4)&&x<7&&y<7) || ((x===14||x===20||y===0||y===6)&&x>13&&y<7) || ((x===0||x===6||y===14||y===20)&&x<7&&y>13) || (x>=16&&x<=18&&y>=2&&y<=4) || (x>=2&&x<=4&&y>=16&&y<=18) : seed%5<2) {
      cells.push(<rect key={x+'-'+y} x={x} y={y} width="1" height="1"/>);
    }
  }
  return (
    <svg width={size} height={size} viewBox="0 0 21 21" style={{display:'block', margin:'0 auto', background:'#fff', borderRadius:10, padding:8, boxSizing:'border-box'}} fill="#0F0E14">{cells}</svg>
  );
}

/* ─── D2 · Funding flow ─── */
function FundingFlow({ onClose, onToast }) {
  const [step, setStep] = o2S('menu');   // menu | deposit | buy | quote | pending
  const [net, setNet] = o2S('Arbitrum');
  const [amt, setAmt] = o2S('200');
  const [ccy, setCcy] = o2S('SGD');
  const [pay, setPay] = o2S('applepay');
  const [phase, setPhase] = o2S('working');
  o2E(() => {
    if (step !== 'pending') return;
    setPhase('working');
    const t = setTimeout(()=>setPhase('done'), 1600);
    return () => clearTimeout(t);
  }, [step]);

  const FX = { SGD:1.35, USD:1, EUR:0.92, GBP:0.79, JPY:157 };
  const usd = (parseFloat(amt)||0) / FX[ccy];
  const recv = (usd * 0.969);
  const back = step==='menu' ? onClose
    : step==='pending' ? null
    : ()=>setStep('menu');

  return (
    <FlowShell onBack={back}>
      {step==='menu' && (<>
        <FlowTitle k="Add funds" sub="Your money lands in your own wallet — Arx never holds it."/>
        {[
          ['deposit','Deposit crypto','USDC from another wallet or exchange · ~1–2 min'],
          ['buy','Buy with card or Apple Pay','Fiat via Onramper · best-route provider'],
        ].map(([id,t,d]) => (
          <button key={id} onClick={()=>setStep(id)} className="arx-press" style={{
            display:'flex', alignItems:'center', gap:12, width:'calc(100% - 48px)', margin:'14px 24px 0',
            padding:'16px', borderRadius:16, textAlign:'left', cursor:'pointer',
            background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
            <div style={{flex:1}}>
              <div style={{font:'600 15px var(--font-body)', color:'var(--text-primary)'}}>{t}</div>
              <div style={{font:'400 12px var(--font-body)', color:'var(--text-tertiary)', marginTop:3}}>{d}</div>
            </div>
            <IconChevron color="var(--text-tertiary)"/>
          </button>
        ))}
      </>)}

      {step==='deposit' && (<>
        <FlowTitle k={'Deposit USDC on ' + net} sub="Arrives after ~1–2 minutes. Bridging by Unit, an independent third party."/>
        <div style={{margin:'16px 24px 0', padding:'22px 20px 16px', borderRadius:18, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
          <QRBlock size={172}/>
          <div className="num" style={{margin:'14px auto 0', width:'fit-content', padding:'8px 14px', borderRadius:10,
            background:'var(--glass-control-bg)', font:'500 12px var(--font-mono)', color:'var(--text-secondary)'}}>0x4b2e91ac…dnwv4f8a</div>
        </div>
        <div style={{padding:'16px 24px 0', font:'600 11px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>Network</div>
        <div style={{display:'flex', gap:8, padding:'8px 24px 0'}}>
          {['Arbitrum','Optimism','Base','Solana'].map(n => (
            <button key={n} onClick={()=>setNet(n)} style={{
              flex:1, height:34, borderRadius:10, cursor:'pointer',
              border:'.5px solid ' + (net===n ? 'var(--color-violet-500)' : 'var(--border-default)'),
              background: net===n ? 'rgba(124,91,255,.16)' : 'transparent',
              color: net===n ? 'var(--color-violet-500)' : 'var(--text-secondary)', font:'600 11.5px var(--font-body)'}}>{n}</button>
          ))}
        </div>
        <FlowCTA label="Copy address" onClick={()=>onToast('Address copied')}/>
        <FlowCTA label="Share" ghost onClick={()=>onToast('Share sheet — prototype')}/>
      </>)}

      {step==='buy' && (<>
        <FlowTitle k="Buy USDC" sub="Card or Apple Pay via Onramper — routed to the best available provider."/>
        {/* You spend */}
        <div style={{margin:'16px 24px 0', padding:'14px 16px', borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
          <div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>You spend</div>
          <div style={{display:'flex', alignItems:'center', gap:10, marginTop:6}}>
            <input value={amt} onChange={e=>setAmt(e.target.value.replace(/[^0-9.]/g,''))} inputMode="decimal"
              style={{flex:1, minWidth:0, border:'none', background:'none', outline:'none', font:'700 28px var(--font-mono)', color:'var(--text-primary)'}}/>
            <div style={{display:'flex', gap:4, background:'var(--glass-control-bg)', borderRadius:10, padding:3}}>
              {['SGD','USD','EUR'].map(c => (
                <button key={c} onClick={()=>setCcy(c)} style={{height:30, padding:'0 10px', borderRadius:8, border:'none', cursor:'pointer',
                  background: ccy===c ? 'var(--color-violet-500)' : 'transparent', color: ccy===c ? '#fff' : 'var(--text-secondary)',
                  font:`${ccy===c?700:600} 12px var(--font-mono)`}}>{c}</button>
              ))}
            </div>
          </div>
        </div>
        {/* You get */}
        <div style={{margin:'10px 24px 0', padding:'14px 16px', borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:8}}>
            <span style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em', whiteSpace:'nowrap'}}>You get</span>
            <span style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', whiteSpace:'nowrap'}}>on {net}</span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:10, marginTop:6}}>
            <span className="num" style={{flex:1, font:'700 28px var(--font-mono)', color:'var(--text-primary)'}}>{recv.toFixed(2)}</span>
            <span style={{display:'inline-flex', alignItems:'center', gap:6, height:34, padding:'0 12px', borderRadius:999, background:'rgba(39,117,202,.12)', border:'.5px solid rgba(39,117,202,.25)'}}>
              <span style={{width:16, height:16, borderRadius:'50%', background:'#2775CA', display:'inline-flex', alignItems:'center', justifyContent:'center', font:'700 9px var(--font-body)', color:'#fff'}}>$</span>
              <span style={{font:'700 13px var(--font-body)', color:'var(--text-primary)'}}>USDC</span>
            </span>
          </div>
        </div>
        {/* network */}
        <div style={{padding:'14px 24px 0', font:'600 11px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>Receive on</div>
        <div style={{display:'flex', gap:8, padding:'8px 24px 0'}}>
          {['Arbitrum','Base','Solana'].map(nn => (
            <button key={nn} onClick={()=>setNet(nn)} style={{flex:1, height:34, borderRadius:10, cursor:'pointer',
              border:'.5px solid ' + (net===nn ? 'var(--color-violet-500)' : 'var(--border-default)'),
              background: net===nn ? 'rgba(124,91,255,.16)' : 'transparent', color: net===nn ? 'var(--color-violet-500)' : 'var(--text-secondary)', font:'600 11.5px var(--font-body)'}}>{nn}</button>
          ))}
        </div>
        {/* pay using */}
        <div style={{padding:'16px 24px 0', font:'600 11px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>Pay using</div>
        {[['applepay','  Apple Pay','Recommended'],['card','Credit / debit card','Visa · Mastercard']].map(([id,t,d]) => (
          <button key={id} onClick={()=>setPay(id)} style={{display:'flex', alignItems:'center', gap:12, width:'calc(100% - 48px)', margin:'8px 24px 0',
            padding:'13px 14px', borderRadius:14, cursor:'pointer', textAlign:'left',
            border:'.5px solid ' + (pay===id ? 'var(--color-violet-500)' : 'var(--border-default)'), background:'var(--surface-elevated)'}}>
            <div style={{flex:1}}>
              <div style={{font:'600 14px var(--font-body)', color:'var(--text-primary)'}}>{t}</div>
              <div style={{font:'400 11px var(--font-body)', color: d==='Recommended'?'var(--regime-up-mid)':'var(--text-tertiary)', marginTop:2}}>{d}</div>
            </div>
            <span style={{width:20, height:20, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
              background: pay===id ? 'var(--color-violet-500)' : 'transparent', border: pay===id ? 'none' : '1.5px solid var(--border-strong)'}}>
              {pay===id && <IconCheck color="#fff" size={12}/>}
            </span>
          </button>
        ))}
        <div style={{margin:'14px 24px 0', font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>
          Rate 1 USDC = {(FX[ccy]).toFixed(2)} {ccy} · provider fee ~3.1% · quote refreshes at checkout.
        </div>
        <FlowCTA label={'Buy '+recv.toFixed(2)+' USDC'} onClick={()=>setStep('pending')}/>
        <div style={{textAlign:'center', margin:'12px 0 0', font:'400 10px var(--font-body)', color:'var(--text-tertiary)'}}>Powered by Onramper</div>
      </>)}

      {step==='pending' && (
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:16}}>
          {phase==='working' ? (<>
            <div className="arx-breath" style={{width:56, height:56, borderRadius:'50%', border:'3px solid rgba(124,91,255,.3)', borderTopColor:'var(--color-violet-500)', animation:'arxspin .9s linear infinite'}}/>
            <style>{'@keyframes arxspin{to{transform:rotate(360deg)}}'}</style>
            <div style={{font:'600 15px var(--font-body)'}}>Processing your purchase…</div>
            <div style={{font:'400 12px var(--font-body)', color:'var(--text-tertiary)'}}>Onramper · usually under a minute</div>
          </>) : (<>
            <div style={{width:62, height:62, borderRadius:'50%', background:'rgba(45,212,155,.14)', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <IconCheck color="var(--regime-up-mid)" size={28}/>
            </div>
            <div style={{font:'700 18px var(--font-body)'}}>{recv.toFixed(2)} USDC added</div>
            <div style={{font:'400 12.5px var(--font-body)', color:'var(--text-secondary)'}}>In your wallet · ready to trade or copy</div>
            <FlowCTA label="Done" onClick={onClose}/>
          </>)}
        </div>
      )}
    </FlowShell>
  );
}

Object.assign(window, { OnboardFlow, FundingFlow, FlowShell, FlowTitle, FlowCTA, QRBlock });
