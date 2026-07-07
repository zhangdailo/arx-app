// you-profile-extras.jsx — complete the profile actions:
// TrackRecordCard (shareable 战绩卡) · ProfileQR · ConnectedWallets.
// DS-tokened; uses global Sheet, PersonAvatar, IdentityBadge, IconChevron.

const { useState: pxUS } = React;

/* deterministic QR-ish matrix from a seed (visual only) */
function PxQR({ seed='arx', size=180 }){
  const n=25, cell=size/n;
  let h=2166136261; for(let i=0;i<seed.length;i++){ h^=seed.charCodeAt(i); h=Math.imul(h,16777619); }
  const on=(x,y)=>{ let v=(x*73856093)^(y*19349663)^h; v=Math.imul(v,2654435761); return ((v>>>13)&1)===1; };
  const finder=(gx,gy,x,y)=>{ const dx=x-gx, dy=y-gy; if(dx<0||dy<0||dx>6||dy>6) return null; const ring=(dx===0||dx===6||dy===0||dy===6); const core=(dx>=2&&dx<=4&&dy>=2&&dy<=4); return ring||core; };
  const rects=[];
  for(let y=0;y<n;y++) for(let x=0;x<n;x++){
    let f=finder(0,0,x,y); if(f===null)f=finder(n-7,0,x,y); if(f===null)f=finder(0,n-7,x,y);
    const dark = f!==null ? f : on(x,y);
    if(dark) rects.push(<rect key={x+'-'+y} x={(x*cell).toFixed(1)} y={(y*cell).toFixed(1)} width={cell+0.5} height={cell+0.5} rx={cell*0.28} fill="var(--surface-modal)"/>);
  }
  return (<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display:'block'}}><rect width={size} height={size} fill="#fff"/>{rects}</svg>);
}

/* ── shareable track-record card (战绩卡) ── */
function TrackRecordCard({ onClose, onToast }){
  const vitals=[
    ['Realized PnL','+$6,140','var(--regime-up-mid)'],
    ['Return · 30d','+32.8%','var(--regime-up-mid)'],
    ['Win rate','61%','var(--text-primary)'],
    ['Max drawdown','−7.4%','var(--regime-down-mid)'],
  ];
  const reach=[['Followers','128'],['Copiers','12'],['Follower outcome','+$8,420']];
  return (
    <Sheet onClose={onClose} maxHeight="92%" zIndex={85}>
      <div style={{padding:'2px 18px 0'}}>
        <div style={{font:'700 19px var(--font-brand)', letterSpacing:'-.02em', marginBottom:12}}>Share your track record</div>
        {/* the card */}
        <div style={{borderRadius:20, overflow:'hidden', border:'.5px solid var(--border-strong)', background:'linear-gradient(160deg, #16122e 0%, var(--surface-modal) 60%)'}}>
          <div style={{padding:'18px 18px 0', display:'flex', alignItems:'center', gap:12}}>
            {typeof PersonAvatar!=='undefined' ? <PersonAvatar seed="elon.musk" size={46} ring="var(--regime-up-mid)"/> : <div style={{width:46,height:46,borderRadius:'50%',background:'var(--color-violet-500)'}}/>}
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', alignItems:'center', gap:6}}>
                <span style={{font:'700 16px var(--font-body)', color:'#fff'}}>elon.musk</span>
                {typeof IdentityBadge!=='undefined' && <IdentityBadge id={{kind:'kol', verified:true}}/>}
              </div>
              <div className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2}}>Whale · Smart money · Swing</div>
            </div>
            <span style={{font:'800 15px var(--font-brand)', color:'var(--color-violet-300)', letterSpacing:'.02em'}}>Arx</span>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'var(--border-default)', margin:'16px 0 0'}}>
            {vitals.map(([k,v,c])=>(
              <div key={k} style={{padding:'13px 16px', background:'var(--surface-modal)'}}>
                <div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.04em'}}>{k}</div>
                <div className="num" style={{font:'700 19px var(--font-mono)', color:c, marginTop:3}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex', padding:'12px 16px', gap:14, borderTop:'.5px solid var(--border-default)', background:'var(--surface-modal)'}}>
            {reach.map(([k,v])=>(
              <div key={k} style={{flex:1}}>
                <div style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.04em'}}>{k}</div>
                <div className="num" style={{font:'600 13px var(--font-mono)', color: k==='Follower outcome'?'var(--regime-up-mid)':'#fff', marginTop:2}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderTop:'.5px solid var(--border-default)', background:'var(--surface-modal)'}}>
            <div style={{borderRadius:8, overflow:'hidden', flexShrink:0}}><PxQR seed="arx-elon-follow" size={52}/></div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{font:'600 11px var(--font-body)', color:'var(--text-secondary)'}}>Scan to copy me on Arx</div>
              <div className="num" style={{font:'700 13px var(--font-mono)', color:'var(--color-violet-300)', marginTop:2}}>ARX-ELON</div>
            </div>
            <span style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)', textAlign:'right', maxWidth:90, lineHeight:1.3}}>On-chain · before fees · not advice</span>
          </div>
        </div>
        <div style={{display:'flex', gap:10, marginTop:16, paddingBottom:4}}>
          <button onClick={()=>onToast&&onToast('Card image saved')} className="arx-press" style={{flex:1, height:48, borderRadius:13, cursor:'pointer', background:'var(--surface-elevated)', border:'.5px solid var(--border-strong)', color:'var(--text-primary)', font:'600 14px var(--font-body)'}}>Save image</button>
          <button onClick={()=>onToast&&onToast('Share sheet — track-record card')} className="arx-press" style={{flex:1, height:48, borderRadius:13, cursor:'pointer', background:'var(--color-violet-500)', border:'none', color:'#fff', font:'700 14px var(--font-body)'}}>Share</button>
        </div>
      </div>
    </Sheet>
  );
}

/* ── receive / follow QR ── */
function ProfileQR({ onClose, onToast, initial }){
  const [tab,setTab]=pxUS(initial==='receive'?'receive':'follow');
  const addr='0x4b2e…91ac';
  return (
    <Sheet onClose={onClose} maxHeight="88%" zIndex={85}>
      <div style={{padding:'2px 22px 0', textAlign:'center'}}>
        <div style={{font:'700 19px var(--font-brand)', letterSpacing:'-.02em', marginBottom:4}}>{tab==='follow'?'Your follow-me QR':'Receive'}</div>
        <div style={{font:'400 12.5px var(--font-body)', color:'var(--text-secondary)', marginBottom:16}}>{tab==='follow'?'Scan to follow & copy you on Arx':'Scan to send funds to this wallet'}</div>
        <div style={{display:'inline-flex', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:10, padding:3, marginBottom:18}}>
          {[['follow','Follow me'],['receive','Receive']].map(([id,l])=>(
            <button key={id} onClick={()=>setTab(id)} className="arx-press" style={{padding:'6px 16px', borderRadius:8, cursor:'pointer', border:'none', background: tab===id?'var(--color-violet-500)':'transparent', color: tab===id?'#fff':'var(--text-secondary)', font:'600 12px var(--font-body)'}}>{l}</button>
          ))}
        </div>
        <div style={{display:'flex', justifyContent:'center'}}>
          <div style={{padding:16, background:'#fff', borderRadius:20, boxShadow:'0 8px 30px rgba(0,0,0,.3)'}}><PxQR seed={tab==='follow'?'arx-follow-elon':'arx-addr-0x4b2e'} size={196}/></div>
        </div>
        <div className="num" style={{font:'600 13px var(--font-mono)', color:'var(--text-primary)', marginTop:16}}>{tab==='follow'?'ARX-ELON':addr}</div>
        <div style={{display:'flex', gap:10, margin:'18px 0 4px'}}>
          <button onClick={()=>onToast&&onToast(tab==='follow'?'Follow link copied':'Address copied')} className="arx-press" style={{flex:1, height:46, borderRadius:12, cursor:'pointer', background:'var(--surface-elevated)', border:'.5px solid var(--border-strong)', color:'var(--text-primary)', font:'600 13px var(--font-body)'}}>Copy</button>
          <button onClick={()=>onToast&&onToast('Saved to photos')} className="arx-press" style={{flex:1, height:46, borderRadius:12, cursor:'pointer', background:'var(--surface-elevated)', border:'.5px solid var(--border-strong)', color:'var(--text-primary)', font:'600 13px var(--font-body)'}}>Save</button>
          <button onClick={()=>onToast&&onToast('Share sheet')} className="arx-press" style={{flex:1, height:46, borderRadius:12, cursor:'pointer', background:'var(--color-violet-500)', border:'none', color:'#fff', font:'700 13px var(--font-body)'}}>Share</button>
        </div>
      </div>
    </Sheet>
  );
}

/* ── connected wallets ── */
function ConnectedWallets({ onClose, onToast }){
  const wallets=[
    { nm:'Arx wallet', sub:'Privy · embedded · self-custody', tag:'Active', addr:'0x4b2e…91ac' },
  ];
  const add=[
    ['Connect a wallet','MetaMask · Rabby · WalletConnect','Connect an external wallet — prototype'],
    ['Watch an address','Read-only, no trading','Watch address — prototype'],
    ['Link Hyperliquid','Scan to pair · sub-accounts','Link Hyperliquid — scan to pair (prototype)'],
  ];
  return (
    <Sheet onClose={onClose} maxHeight="88%" zIndex={85}>
      <div style={{padding:'2px 18px 0'}}>
        <div style={{font:'700 19px var(--font-brand)', letterSpacing:'-.02em'}}>Connected wallets</div>
        <div style={{font:'400 12.5px var(--font-body)', color:'var(--text-secondary)', marginTop:6, marginBottom:14}}>One active wallet today. Sub-accounts and multiple venues are coming.</div>
        {wallets.map((w,i)=>(
          <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'13px 14px', borderRadius:14, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', marginBottom:8}}>
            {typeof PersonAvatar!=='undefined' ? <PersonAvatar seed={w.addr} size={36}/> : <div style={{width:36,height:36,borderRadius:'50%',background:'var(--color-violet-500)'}}/>}
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', alignItems:'center', gap:6}}><span style={{font:'600 14px var(--font-body)', color:'var(--text-primary)'}}>{w.nm}</span><span style={{font:'600 9px var(--font-body)', color:'var(--regime-up-mid)', background:'rgba(20,184,123,.14)', padding:'1px 7px', borderRadius:999}}>{w.tag}</span></div>
              <div className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2}}>{w.addr} · {w.sub}</div>
            </div>
          </div>
        ))}
        <div style={{font:'600 11px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em', margin:'14px 2px 8px'}}>Add a wallet</div>
        <div style={{borderRadius:14, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', overflow:'hidden'}}>
          {add.map(([t,s,msg],i)=>(
            <button key={i} onClick={()=>onToast&&onToast(msg)} className="arx-row-press" style={{display:'flex', alignItems:'center', gap:11, width:'100%', padding:'13px 14px', background:'transparent', border:'none', borderTop:i?'.5px solid var(--border-default)':'none', cursor:'pointer', textAlign:'left'}}>
              <div style={{flex:1, minWidth:0}}><div style={{font:'600 13.5px var(--font-body)', color:'var(--text-primary)'}}>{t}</div><div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>{s}</div></div>
              {typeof IconChevron!=='undefined' && <IconChevron color="var(--text-tertiary)"/>}
            </button>
          ))}
        </div>
        <div style={{font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', margin:'12px 2px 4px', lineHeight:1.5}}>Trading authority is a non-custodial agent-wallet (Order/Cancel only — never Withdraw). Revoke any time in Security.</div>
      </div>
    </Sheet>
  );
}

Object.assign(window, { TrackRecordCard, ProfileQR, ConnectedWallets, PxQR });
