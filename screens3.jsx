/* ═══ ARX · screens3 — merged sub-screens (D3–D7), rebuilt on DS tokens ═══
   CopyDetails · Signals · Notifications · Account (incl. C4 profit-color flip + bezel) · Contests · Badges */

const { useState: s3S } = React;

/* overlay shell with iOS sub-screen header */
function SubShell({ title, onBack, children }) {
  return (
    <div style={{position:'absolute', inset:0, background:'var(--surface-base)', color:'var(--text-primary)', overflow:'auto', zIndex:30, paddingBottom:40}}>
      <div style={{display:'flex', alignItems:'center', gap:10, padding:'48px 20px 8px', position:'sticky', top:0, background:'var(--surface-base)', zIndex:2}}>
        <button onClick={onBack} style={{width:34, height:34, borderRadius:'50%', border:'.5px solid var(--border-default)',
          background:'var(--surface-elevated)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transform:'rotate(180deg)'}}>
          <IconChevron size={16} color="var(--text-primary)"/>
        </button>
        <span style={{font:'700 18px var(--font-body)', letterSpacing:'-.01em'}}>{title}</span>
      </div>
      {children}
    </div>
  );
}

/* ─── D3 · Copy details — a copy session across its full state machine ───
   States: live · paused (manual) · drawdown (loss limit fired) · inactive (leader 30d quiet) · error (connectivity)
   Editable per Arx_5-6 §3.9.3: Copy Capital, Loss Limit (tighten now / loosen 24h), Leverage Cap,
   Position Size Limit, Margin Mode, Advanced (slippage caps · pair filter · custom SL/TP · size filter),
   Mirror Exits Only (Wind down). End = positions stay, Arx stops monitoring. */
function CopyDetailsScreen({ f, onBack, onToast }) {
  const data = f || { addr:'0x7a3f…c891', tax:'All-Weather', alloc:'$1,200', allocV:1200, pnl:'+$218.40', state:'live', since:'34d' };
  const [state, setState] = s3S(data.state || 'live');
  const [windDown, setWindDown] = s3S(false);
  const neg = (data.pnl||'').startsWith('−');
  const stopAt = '$' + Math.round((data.allocV||1200) * 0.5).toLocaleString();

  const ST = {
    live:     { l:'Live',               ink:'var(--regime-up-mid)',    bg:'rgba(45,212,155,.12)' },
    paused:   { l:'Paused',             ink:'var(--regime-trans-mid)', bg:'rgba(251,191,36,.14)' },
    drawdown: { l:'Loss limit reached', ink:'var(--regime-down-mid)',  bg:'rgba(242,106,106,.12)' },
    inactive: { l:'Leader inactive',    ink:'var(--text-secondary)',   bg:'rgba(120,120,128,.14)' },
    error:    { l:'Reconnecting',       ink:'var(--regime-trans-mid)', bg:'rgba(251,191,36,.14)' },
    closed:   { l:'Ended',              ink:'var(--text-tertiary)',    bg:'rgba(120,120,128,.14)' },
  };
  const st = ST[state] || ST.live;

  const BANNERS = {
    paused:   ['Copying paused. Positions held — no new mirrors until you resume.', 'var(--regime-trans-mid)', 'rgba(251,191,36,.10)'],
    drawdown: ['Loss limit reached — copy paused. All positions were closed. Resuming resets the loss-limit reference to current equity.', 'var(--regime-down-mid)', 'rgba(242,106,106,.08)'],
    inactive: ["Leader hasn't traded in 30 days — copy paused. Resume to keep mirroring, or end the copy.", 'var(--text-secondary)', 'rgba(120,120,128,.10)'],
    error:    ['We couldn\u2019t reach Hyperliquid. Orders held — retrying automatically. No new mirrors until reconnected.', 'var(--regime-trans-mid)', 'rgba(251,191,36,.10)'],
    closed:   ['Copy ended. Your open positions stay in your wallet — Arx no longer monitors them.', 'var(--text-tertiary)', 'rgba(120,120,128,.10)'],
  };
  const banner = BANNERS[state];

  const manageRow = (label, value, note, onTap) => (
    <button key={label} onClick={onTap} className="arx-row-press" style={{width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 0',
      background:'none', border:'none', borderBottom:'.5px solid var(--border-default)', cursor:'pointer', textAlign:'left'}}>
      <div style={{flex:1, minWidth:0}}>
        <div style={{font:'500 13px var(--font-body)', color:'var(--text-primary)'}}>{label}</div>
        {note && <div style={{font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>{note}</div>}
      </div>
      <span className="num" style={{font:'500 12.5px var(--font-mono)', color:'var(--text-secondary)', whiteSpace:'nowrap'}}>{value}</span>
      <IconChevron size={14} color="var(--text-tertiary)"/>
    </button>
  );

  return (
    <SubShell title="Copy details" onBack={onBack}>
      <div style={{display:'flex', alignItems:'center', gap:12, padding:'10px 20px 0'}}>
        <WalletAvatar w={{addr:data.addr, x:data.x}} size={44}/>
        <div style={{flex:1}}>
          <div className="num" style={{font:'600 15px var(--font-mono)'}}>{data.addr}</div>
          <div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>{data.tax} · copying for {data.since || '34d'}</div>
        </div>
        <span style={{font:'600 10px var(--font-body)', color:st.ink, background:st.bg, padding:'3px 9px', borderRadius:999, whiteSpace:'nowrap'}}>{st.l}</span>
      </div>

      {banner && (
        <div style={{margin:'12px 20px 0', padding:'11px 13px', borderRadius:12, background:banner[2],
          border:'.5px solid var(--border-strong)',
          font:'400 12px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5}}>{banner[0]}</div>
      )}

      <div style={{margin:'14px 20px 0', borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', padding:'4px 16px'}}>
        {[
          ['Copy capital', data.alloc, 'var(--text-primary)'],
          ['Current value', state==='drawdown' ? '$249.00' : '$1,418.40', 'var(--text-primary)'],
          ['PnL', data.pnl, neg ? 'var(--regime-down-mid)' : 'var(--regime-up-mid)'],
          ['Mirror rate', '94% of leader trades', 'var(--text-primary)'],
          ['Avg slippage vs leader', '0.06%', 'var(--text-primary)'],
        ].map(([k,v,c],i,arr) => (
          <div key={k} style={{display:'flex', justifyContent:'space-between', gap:10, padding:'10px 0', borderBottom: i<arr.length-1 ? '.5px solid var(--border-default)' : 'none'}}>
            <span style={{font:'500 13px var(--font-body)', color:'var(--text-secondary)', whiteSpace:'nowrap'}}>{k}</span>
            <span className="num" style={{font:'500 12.5px var(--font-mono)', color:c, textAlign:'right'}}>{v}</span>
          </div>
        ))}
      </div>

      {state!=='closed' && (<>
        <div style={{padding:'18px 20px 2px', font:'600 15px var(--font-body)'}}>Manage copy</div>
        <div style={{margin:'4px 20px 0', borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', padding:'0 16px'}}>
          {manageRow('Copy capital', data.alloc, 'Raising never loosens your loss limit · lowering resets its reference', ()=>onToast('Copy capital — add or reduce'))}
          {manageRow('Loss limit', '−50% · stops at '+stopAt, 'Tightening applies now · loosening takes effect after 24h', ()=>onToast('Loss limit — tighten now, loosen after 24h'))}
          {manageRow('Leverage cap', 'Follow leader', null, ()=>onToast('Leverage cap — Follow leader or 1–40×'))}
          {manageRow('Position size limit', '70% of capital', 'Caps any single position before it opens', ()=>onToast('Position size limit — 20–100%'))}
          {manageRow('Margin mode', 'Follow leader', null, ()=>onToast('Margin mode — Follow leader · Isolated · Cross'))}
          {manageRow('Advanced', 'All off', 'Slippage caps · pair filter · custom SL/TP · trade size filter', ()=>onToast('Advanced — 7 parameters, all off = faithful mirror'))}
          <button onClick={()=>{ const next=!windDown; setWindDown(next); onToast(next ? 'Winding down — exits only' : 'Wind down off — full mirroring'); }} className="arx-row-press" style={{
            width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 0', background:'none', border:'none', cursor:'pointer', textAlign:'left'}}>
            <div style={{flex:1}}>
              <div style={{font:'500 13px var(--font-body)', color:'var(--text-primary)'}}>Wind down</div>
              <div style={{font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>Mirror exits only — no new opens, positions close with the leader</div>
            </div>
            <span style={{width:40, height:24, borderRadius:12, flexShrink:0,
              background: windDown ? 'var(--color-violet-500)' : 'var(--glass-control-bg)', position:'relative', transition:'background 200ms'}}>
              <span style={{position:'absolute', top:3, left: windDown?19:3, width:18, height:18, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,.3)', transition:'left 200ms'}}/>
            </span>
          </button>
        </div>
      </>)}

      {state!=='drawdown' && state!=='closed' && (<>
        <div style={{padding:'14px 20px 6px', font:'600 15px var(--font-body)'}}>Mirrored positions · 2</div>
        {[['ETH','LONG','4x','$96.40','+$12.80'],['BTC','LONG','3x','$71.20','+$4.10']].map(([sym,dir,lev,size,pnl]) => (
          <div key={sym} style={{display:'flex', alignItems:'center', gap:12, padding:'9px 20px'}}>
            <AssetGlyph sym={sym} size={30}/>
            <div style={{flex:1}}>
              <span style={{font:'600 14px var(--font-body)'}}>{sym}-PERP</span>
              <span style={{font:'700 11px var(--font-body)', marginLeft:8, color:'var(--regime-up-mid)'}}>{dir} {lev}</span>
            </div>
            <div style={{textAlign:'right'}}>
              <div className="num" style={{font:'500 12.5px var(--font-mono)'}}>{size}</div>
              <div className="num" style={{font:'500 11px var(--font-mono)', color:'var(--regime-up-mid)'}}>{pnl}</div>
            </div>
          </div>
        ))}
      </>)}

      <div style={{padding:'14px 20px 6px', font:'600 15px var(--font-body)'}}>Copy activity</div>
      <div style={{margin:'0 20px 4px', font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)'}}>Every leader trade — mirrored, skipped, or clipped — with the reason.</div>
      {(state==='drawdown'
        ? [['Loss limit fired at −50% · all positions closed','2h ago'],['SOL exit filled · slippage 0.4%','2h ago'],['Mirrored SOL add · $84.00','9h ago']]
        : state==='inactive'
        ? [['Leader marked inactive — 30 days without a trade','1d ago'],['Mirrored ETH long · $96.40','31d ago'],['Their BTC add → your $71.20 fill','33d ago']]
        : [['Mirrored ETH long → your $96.40 fill · 0.05% slippage','2h ago'],['Skipped DOGE long — outside your Crypto-only pair filter','5h ago'],['Mirrored BTC add → your $71.20 fill','1d ago'],['Skipped SOL scalp — below the $10 venue minimum','1d ago'],['Clipped ETH add to your 70% position-size limit','2d ago'],['Funding −$0.84 across 2 positions','1d ago']]
      ).map(([e,t]) => (
        <div key={e} style={{display:'flex', alignItems:'center', gap:10, padding:'7px 20px'}}>
          <span style={{width:6, height:6, borderRadius:'50%', background:'var(--regime-range-mid)', flexShrink:0}}/>
          <span style={{flex:1, font:'500 12.5px var(--font-body)', color:'var(--text-secondary)'}}>{e}</span>
          <span style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)'}}>{t}</span>
        </div>
      ))}

      <div style={{margin:'18px 20px 0'}}>
        {state==='live' && (<>
          <button onClick={()=>{ setState('paused'); onToast('Copying paused — positions held'); }} className="arx-press" style={{
            width:'100%', height:48, borderRadius:14, border:'.5px solid var(--border-strong)', cursor:'pointer',
            background:'var(--surface-elevated)', color:'var(--text-primary)', font:'700 14px var(--font-body)'}}>Pause copying</button>
          <div style={{margin:'8px 0 12px', font:'400 11px var(--font-body)', color:'var(--text-tertiary)', textAlign:'center'}}>Pausing holds positions — nothing closes.</div>
        </>)}
        {(state==='paused' || state==='inactive') && (
          <button onClick={()=>{ setState('live'); onToast('Copying resumed — mirroring from the next trade'); }} className="arx-press" style={{
            width:'100%', height:48, borderRadius:14, border:'none', cursor:'pointer', marginBottom:12,
            background:'var(--color-violet-500)', color:'#fff', font:'700 14px var(--font-body)'}}>Resume copying</button>
        )}
        {state==='drawdown' && (<>
          <button onClick={()=>{ setState('live'); onToast('Copy resumed — loss limit reference reset to current equity'); }} className="arx-press" style={{
            width:'100%', height:48, borderRadius:14, border:'none', cursor:'pointer',
            background:'var(--color-violet-500)', color:'#fff', font:'700 14px var(--font-body)'}}>Resume copying</button>
          <div style={{margin:'8px 0 12px', font:'400 11px var(--font-body)', color:'var(--text-tertiary)', textAlign:'center'}}>Resuming resets the loss-limit reference to current equity.</div>
        </>)}
        {state==='error' && (
          <div style={{padding:'12px 14px', borderRadius:12, marginBottom:12, background:'var(--glass-control-bg)', font:'500 12.5px var(--font-body)', color:'var(--text-secondary)', textAlign:'center'}}>
            Retrying every 5s — we’ll push a notification if this lasts over a minute.
          </div>
        )}
        {state!=='closed' ? (
          <ConfirmAction
            tone="down"
            action="end copy"
            consequence={'Open positions stay in your wallet, untouched — Arx stops mirroring and monitoring'}
            onConfirm={()=>{ setState('closed'); onToast('Copy ended — positions left untouched'); }}/>
        ) : (
          <div style={{padding:'12px 14px', borderRadius:12, background:'var(--glass-control-bg)', font:'500 12.5px var(--font-body)', color:'var(--text-secondary)', textAlign:'center'}}>
            Copy ended. Final PnL {data.pnl}. The wallet stays in your Watching list.
          </div>
        )}
      </div>
    </SubShell>
  );
}

/* ─── D4 · Signals — positioning intel for one instrument ─── */
function SignalsScreen({ m, onBack }) {
  const name = (m && m.sym) || 'BTC';
  const bars = [42,-18,30,-26,52,24,-14,38,60,-22,46,28,-30,54,70,36,-18,62];
  const heat = [];
  let sd = 3;
  for (let r=0; r<6; r++) for (let c=0; c<26; c++) {
    sd = (sd*73 + r*29 + c*13) % 100;
    heat.push([r, c, sd]);
  }
  return (
    <SubShell title={name + ' · Signals'} onBack={onBack}>
      <div style={{padding:'2px 20px 10px', font:'400 12px var(--font-body)', color:'var(--text-secondary)'}}>
        How proven wallets are positioned right now — context, not advice.
      </div>

      {/* Legends net positions */}
      <div style={{margin:'0 20px 14px', padding:16, borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
          <span style={{font:'600 13.5px var(--font-body)'}}>Smart money net positions</span>
          <span style={{font:'500 10.5px var(--font-body)', color:'var(--text-tertiary)'}}>refreshed 10s ago</span>
        </div>
        <div className="num" style={{font:'600 30px var(--font-mono)', color:'var(--regime-up-mid)', marginTop:8, letterSpacing:'-.02em'}}>$412M</div>
        <div style={{font:'500 11.5px var(--font-body)', color:'var(--text-secondary)', marginTop:2}}>
          net <b style={{color:'var(--regime-up-mid)'}}>LONG</b> · top-labeled wallets · last 30d cohort
        </div>
        <div style={{display:'flex', height:18, borderRadius:9, overflow:'hidden', marginTop:12}}>
          <div style={{flex:36, background:'var(--regime-down-mid)', opacity:.75, display:'flex', alignItems:'center', paddingLeft:8}}>
            <span style={{font:'700 9.5px var(--font-body)', color:'#fff'}}>SHORTS 36%</span>
          </div>
          <div style={{flex:64, background:'var(--regime-up-mid)', display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:8}}>
            <span style={{font:'700 9.5px var(--font-body)', color:'#fff'}}>LONGS 64%</span>
          </div>
        </div>
      </div>

      {/* Unrealized PnL bars */}
      <div style={{margin:'0 20px 14px', padding:16, borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10}}>
          <span style={{font:'600 13.5px var(--font-body)'}}>Top wallets · unrealized PnL</span>
          <span className="num" style={{font:'500 10.5px var(--font-mono)', color:'var(--regime-up-mid)'}}>longs +$345K</span>
        </div>
        <svg width="100%" height="86" viewBox="0 0 360 86" preserveAspectRatio="none">
          <line x1="0" y1="43" x2="360" y2="43" stroke="var(--border-strong)" strokeWidth="1"/>
          {bars.map((b,i) => (
            <rect key={i} x={i*20+4} width="11" rx="2.5"
              y={b>=0 ? 43-Math.abs(b)*0.62 : 43}
              height={Math.abs(b)*0.62}
              fill={b>=0 ? 'var(--regime-up-mid)' : 'var(--regime-down-mid)'} opacity={b>=0?1:.7}/>
          ))}
        </svg>
        <div style={{font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:6}}>One bar per top wallet, sorted by entry time. Above the line = currently in profit.</div>
      </div>

      {/* Liquidation heat map */}
      <div style={{margin:'0 20px 14px', padding:16, borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10}}>
          <span style={{font:'600 13.5px var(--font-body)'}}>Liquidation heat</span>
          <span className="num" style={{font:'500 10.5px var(--font-mono)', color:'var(--text-tertiary)'}}>mark $73,212</span>
        </div>
        <svg width="100%" height="78" viewBox="0 0 260 60" preserveAspectRatio="none">
          {heat.map(([r,c,v]) => (
            <rect key={r+'-'+c} x={c*10} y={r*10} width="9" height="9" rx="1.5"
              fill={ v>78 ? 'var(--regime-trans-mid)' : v>52 ? 'var(--color-violet-500)' : 'var(--glass-control-bg)' }
              opacity={ v>78 ? .95 : v>52 ? .55 : .9 }/>
          ))}
          <line x1="130" y1="0" x2="130" y2="60" stroke="var(--text-primary)" strokeWidth="1.2" strokeDasharray="3 3"/>
        </svg>
        <div style={{display:'flex', justifyContent:'space-between', font:'500 10px var(--font-mono)', color:'var(--text-tertiary)', marginTop:4}}>
          <span>$58k</span><span>$66k</span><span>mark</span><span>$84k</span><span>$96k</span>
        </div>
        <div style={{font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:6}}>Amber = dense clusters of leveraged positions that would liquidate there. Price gets pulled toward heat.</div>
      </div>
    </SubShell>
  );
}

/* ─── D5 · Notifications — moved to attention.jsx (Phase 4 attention hub) ─── */

/* ─── D6 + C4 · Account — General | UI settings (language · profit color flip · bezel) ─── */
function AccountScreen({ onBack, flip, setFlip, frame, setFrame, lang, setLang, onToast }) {
  const [seg, setSeg] = s3S('general');
  const [langOpen, setLangOpen] = s3S(false);
  const [exp, setExp] = s3S(()=>{ try { return localStorage.getItem('arx-experience') || 'new'; } catch(e){ return 'new'; } });
  const setExperience = (v)=>{ setExp(v); try { localStorage.setItem('arx-experience', v); window.__arxPro = (v==='pro'); window.dispatchEvent(new Event('arx-experience')); } catch(e){} onToast && onToast(v==='pro' ? 'Pro mode on — advanced data unlocked' : 'Simple mode — pro tools tucked away'); };
  const LANGS = ['English','中文','한국어','Tiếng Việt','日本語'];
  const Row = ({ k, v, onClick }) => (
    <button onClick={onClick} style={{width:'100%', display:'flex', alignItems:'center', gap:10, padding:'13px 16px',
      background:'none', border:'none', cursor:'pointer', textAlign:'left', borderTop:'.5px solid var(--border-default)'}}>
      <span style={{flex:1, font:'500 14.5px var(--font-body)', color:'var(--text-primary)'}}>{k}</span>
      <span style={{font:'500 12.5px var(--font-body)', color:'var(--text-tertiary)'}}>{v}</span>
      <IconChevron color="var(--text-tertiary)"/>
    </button>
  );
  const Toggle = ({ on, onClick }) => (
    <button onClick={onClick} style={{width:46, height:28, borderRadius:14, border:'none', cursor:'pointer', position:'relative',
      background: on ? 'var(--regime-up-mid)' : 'var(--glass-control-bg)', transition:'background 200ms'}}>
      <span style={{position:'absolute', top:3, left: on ? 21 : 3, width:22, height:22, borderRadius:'50%', background:'#fff',
        boxShadow:'0 2px 6px rgba(0,0,0,.3)', transition:'left 220ms cubic-bezier(.32,.72,0,1)'}}/>
    </button>
  );
  return (
    <SubShell title="Account details" onBack={onBack}>
      <div style={{position:'relative', display:'flex', background:'var(--glass-control-bg)', borderRadius:11, padding:2, height:36, margin:'4px 20px 16px'}}>
        <div style={{position:'absolute', top:2, bottom:2, left: seg==='general' ? 2 : '50%', width:'calc(50% - 2px)',
          background:'var(--surface-elevated)', borderRadius:9, boxShadow:'0 3px 8px rgba(0,0,0,.25)', transition:'left 260ms cubic-bezier(.32,.72,0,1)'}}/>
        {[['general','General'],['ui','UI settings']].map(([id,l]) => (
          <button key={id} onClick={()=>setSeg(id)} style={{flex:1, position:'relative', zIndex:1, background:'none', border:'none', cursor:'pointer',
            color: seg===id ? 'var(--text-primary)' : 'var(--text-secondary)', font:(seg===id?'600':'500')+' 13px var(--font-body)'}}>{l}</button>
        ))}
      </div>

      {seg==='general' ? (<>
        <div style={{display:'flex', alignItems:'center', gap:14, padding:'4px 20px 16px'}}>
          <Avatar label="SC" size={56}/>
          <div>
            <div style={{font:'700 17px var(--font-body)'}}>sam.crypto</div>
            <button onClick={()=>onToast('Image picker — prototype')} style={{background:'none', border:'none', cursor:'pointer', padding:0, font:'600 12px var(--font-body)', color:'var(--color-violet-500)', marginTop:2}}>Upload image</button>
          </div>
        </div>
        <div style={{margin:'0 20px', borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', overflow:'hidden'}}>
          <Row k="Account email" v="sam@crypto.xyz" onClick={()=>onToast('Email change — verification required')}/>
          <Row k="Connect X" v="Not connected" onClick={()=>onToast('X OAuth — prototype')}/>
          <Row k="Security & passkeys" v="1 passkey" onClick={()=>onToast('Passkeys — prototype')}/>
        </div>
        <div style={{padding:'18px 20px 6px', font:'600 12px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>Personalization</div>
        <div style={{margin:'0 20px', borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
          <button onClick={()=>onToast('Re-runs the find-your-match questions')} style={{width:'100%', display:'flex', alignItems:'center', gap:10, padding:'14px 16px', background:'none', border:'none', cursor:'pointer', textAlign:'left'}}>
            <div style={{flex:1}}>
              <div style={{font:'600 14px var(--font-body)', color:'var(--text-primary)'}}>Personalize defaults</div>
              <div style={{font:'400 11.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:3}}>Careful starter · guardrails preset tight · lens: Smart money</div>
            </div>
            <IconChevron color="var(--text-tertiary)"/>
          </button>
        </div>

        <div style={{padding:'18px 20px 6px', font:'600 12px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>Experience</div>
        <div style={{margin:'0 20px 4px', font:'400 11.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>Simple keeps the app clean for everyday copy-trading. Pro surfaces order-book depth, funding countdowns and advanced signals.</div>
        <div style={{display:'flex', gap:10, padding:'10px 20px 0'}}>
          {[['new','Simple','Clean & guided','🌱'],['pro','Pro','Full depth & data','⚡']].map(([id,t,d,ic])=>(
            <button key={id} onClick={()=>setExperience(id)} className="arx-press" style={{flex:1, textAlign:'left', padding:14, borderRadius:16, cursor:'pointer',
              border: exp===id ? '2px solid var(--color-violet-500)' : '.5px solid var(--border-default)',
              background: exp===id ? 'rgba(124,91,255,.10)' : 'var(--surface-elevated)'}}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                <span style={{fontSize:20}}>{ic}</span>
                {exp===id && <span style={{width:18, height:18, borderRadius:'50%', background:'var(--color-violet-500)', display:'inline-flex', alignItems:'center', justifyContent:'center'}}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>}
              </div>
              <div style={{font:'700 15px var(--font-body)', color:'var(--text-primary)', marginTop:8}}>{t}</div>
              <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>{d}</div>
            </button>
          ))}
        </div>
      </>) : (<>
        <div style={{margin:'0 20px', borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', overflow:'hidden'}}>
          <Row k="Language" v={lang} onClick={()=>setLangOpen(true)}/>
          <div style={{display:'flex', alignItems:'center', gap:10, padding:'13px 16px', borderTop:'.5px solid var(--border-default)'}}>
            <span style={{flex:1, font:'500 14.5px var(--font-body)'}}>Show iOS bezel</span>
            <Toggle on={frame} onClick={()=>setFrame(!frame)}/>
          </div>
        </div>

        <div style={{padding:'18px 20px 6px', font:'600 12px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>Profit color</div>
        <div style={{margin:'0 20px 4px', font:'400 11.5px var(--font-body)', color:'var(--text-tertiary)'}}>Flips every up/down data color — charts, deltas, long/short. Common in CN · KR markets.</div>
        {[[false,'Green = up · Red = down','Default'],[true,'Red = up · Green = down','CN / KR convention']].map(([val, t, d]) => (
          <button key={String(val)} onClick={()=>setFlip(val)} style={{
            display:'flex', alignItems:'center', gap:12, width:'calc(100% - 40px)', margin:'10px 20px 0',
            padding:'13px 14px', borderRadius:14, cursor:'pointer', textAlign:'left',
            border: flip===val ? '1px solid var(--color-violet-500)' : '.5px solid var(--border-default)',
            background:'var(--surface-elevated)'}}>
            <span style={{display:'flex', borderRadius:8, overflow:'hidden', flexShrink:0}}>
              <span style={{padding:'4px 10px', font:'700 10px var(--font-body)', color:'#fff', background: val ? '#FF4D6A' : '#14B87B'}}>Long</span>
              <span style={{padding:'4px 10px', font:'700 10px var(--font-body)', color:'#fff', background: val ? '#14B87B' : '#FF4D6A'}}>Short</span>
            </span>
            <div style={{flex:1}}>
              <div style={{font:'600 13px var(--font-body)', color:'var(--text-primary)'}}>{t}</div>
              <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>{d}</div>
            </div>
            {flip===val && <span style={{width:22, height:22, borderRadius:'50%', background:'var(--color-violet-500)', display:'flex', alignItems:'center', justifyContent:'center'}}><IconCheck color="#fff" size={12}/></span>}
          </button>
        ))}
      </>)}

      {langOpen && (
        <GlassSheet onClose={()=>setLangOpen(false)}>
          <div style={{padding:'6px 22px 26px'}}>
            <div style={{font:'700 18px var(--font-body)', marginBottom:10}}>Language</div>
            {LANGS.map(l => (
              <button key={l} onClick={()=>{ setLang(l); setLangOpen(false); }} style={{
                width:'100%', display:'flex', alignItems:'center', height:48, background:'none', border:'none', cursor:'pointer',
                borderBottom:'.5px solid var(--border-default)'}}>
                <span style={{flex:1, textAlign:'left', font:(lang===l?'600':'500')+' 15px var(--font-body)', color: lang===l ? 'var(--color-violet-500)' : 'var(--text-primary)'}}>{l}</span>
                {lang===l && <IconCheck color="var(--color-violet-500)" size={16}/>}
              </button>
            ))}
            <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:12}}>Full translation ships with the production i18n layer — prototype stays English.</div>
          </div>
        </GlassSheet>
      )}
    </SubShell>
  );
}

/* ─── D7 · Contests + Badges ─── */
function ContestsScreen({ onBack, onToast, onBadges }) {
  const C = [
    ['assets/banner-nvidia.png','Trade NVDA · win iPhone 18','Top 5 by PnL · ends in 4d','2,118 entered','contestNVDA'],
    ['assets/banner-nba.png','Pick a champ · Spurs vs Knicks','Predict & climb the table','8,402 entered','contestNBA'],
    ['assets/banner-epl.png','Pick the Champion · Premier League','Guess who will win the EPL','9,204 entered','contestWC'],
  ];
  return (
    <SubShell title="Contests" onBack={onBack}>
      {C.map(([img, t, d, n, sub]) => (
        <div key={t} onClick={()=>window.__arxOpenSub && window.__arxOpenSub(sub)} style={{margin:'10px 20px 0', borderRadius:16, overflow:'hidden', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', cursor:'pointer'}}>
          <img src={img} alt="" style={{display:'block', width:'100%', height:108, objectFit:'cover'}}/>
          <div style={{display:'flex', alignItems:'center', gap:10, padding:'12px 14px'}}>
            <div style={{flex:1}}>
              <div style={{font:'600 14px var(--font-body)'}}>{t}</div>
              <div style={{font:'400 11.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>{d} · <span className="num" style={{fontFamily:'var(--font-mono)'}}>{n}</span></div>
            </div>
            <button onClick={(e)=>{e.stopPropagation(); window.__arxOpenSub && window.__arxOpenSub(sub);}} className="arx-press" style={{height:34, padding:'0 16px', borderRadius:10, border:'none', cursor:'pointer',
              background:'var(--color-violet-500)', color:'#fff', font:'700 12px var(--font-body)'}}>View</button>
          </div>
        </div>
      ))}
      <button onClick={onBadges} style={{display:'flex', alignItems:'center', gap:10, width:'calc(100% - 40px)', margin:'16px 20px 0',
        padding:'13px 14px', borderRadius:14, cursor:'pointer', textAlign:'left',
        background:'rgba(124,91,255,.10)', border:'.5px solid rgba(124,91,255,.25)'}}>
        <span style={{flex:1, font:'600 13.5px var(--font-body)', color:'var(--color-violet-700)'}}>Your badges — 2 earned, 4 to go</span>
        <IconChevron color="var(--color-violet-500)"/>
      </button>
      <div style={{padding:'14px 20px', font:'400 11px var(--font-body)', color:'var(--text-tertiary)'}}>Contests rank by PnL % on equal terms. No entry fees, prizes funded by Arx.</div>
    </SubShell>
  );
}

function BadgesScreen({ onBack }) {
  const B = [
    ['assets/badge-warrior.jpg','Warrior','First 10 trades', true],
    ['assets/badge-whale.jpg','Whale watcher','Watched 5 wallets', true],
    [null,'Steady hand','4 green weeks copying', false],
    [null,'Scholar','Read 10 wallet profiles', false],
    [null,'First copy','Start your first copy', false],
    [null,'Contender','Finish top 100 in a contest', false],
  ];
  return (
    <SubShell title="Badges" onBack={onBack}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, padding:'8px 20px 0'}}>
        {B.map(([img, t, d, got]) => (
          <div key={t} style={{borderRadius:16, overflow:'hidden', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', opacity: got ? 1 : .55}}>
            {img ? (
              <img src={img} alt="" style={{display:'block', width:'100%', height:96, objectFit:'cover'}}/>
            ) : (
              <div style={{height:96, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--glass-control-bg)'}}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
              </div>
            )}
            <div style={{padding:'10px 12px'}}>
              <div style={{font:'600 13px var(--font-body)'}}>{t}</div>
              <div style={{font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>{d}</div>
            </div>
          </div>
        ))}
      </div>
    </SubShell>
  );
}

Object.assign(window, { SubShell, CopyDetailsScreen, SignalsScreen, AccountScreen, ContestsScreen, BadgesScreen });
