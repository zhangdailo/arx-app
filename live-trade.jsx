/* ═══ ARX · Live Trade — social co-watching rooms ═══
   Room list (liveTrade) → Room detail (liveTradeRoom). Two room kinds:
   'contract' (prediction-market cents, e.g. World Cup winner) and
   'perp' (BTC-PERP style, Join Bulls/Bears). Seed data only — no live feed.
   Opened via __arxOpenSub('liveTrade') / ('liveTradeRoom',{room}). */
const { useState: ltS, useRef: ltR, useEffect: ltE } = React;

const LT_ROOMS = [
  { id:'wc', kind:'contract', title:'ARX Cup Call Room', tag:'World Cup · Champion', listening:3130,
    market:{ label:'Argentina', price:'22.1¢', deltaC:-0.4, contracts:[
      { sym:'BRA', price:'6.5¢', d:-0.1 }, { sym:'FRA', price:'21.7¢', d:-1.4 }, { sym:'ARG', price:'22.1¢', d:-0.4 }, { sym:'ENG', price:'7.2¢', d:0.4 },
      { sym:'ESP', price:'4.1¢', d:1.8 }, { sym:'GER', price:'2.8¢', d:-1.4 }, { sym:'POR', price:'24.1¢', d:1.9 }, { sym:'NED', price:'11.6¢', d:-0.8 },
    ]},
    seats:[
      { name:'Viv', pnl:-170.51, pos:'POR @25¢' }, { name:'Momo', pnl:94.68, pos:'FLAT', rank:3 },
      { name:'Kai', pnl:74.78, pos:'FLAT' }, { name:'Sable', pnl:-203.65, pos:'POR @22¢' },
      { name:'Rex', pnl:95.22, pos:'POR @24¢', rank:2 }, { name:'Luna', pnl:-31.28, pos:'FLAT' },
      { name:'Dex', pnl:759.52, pos:'POR @26¢', rank:1 }, { name:'Aya', pnl:-161.99, pos:'POR @26¢' },
    ],
    lead:{ name:'Dex', pnl:759.52, you:5 },
    cta:'contract' },
  { id:'alpha', kind:'perp', title:'ARX Alpha Lounge', tag:'BTC-PERP', listening:1410,
    market:{ sym:'BTC-PERP', price:63914.0, deltaPct:-0.35 },
    seats:[
      { name:'Viv', pnl:-14.86, pos:'LONG 10×' }, { name:'Momo', pnl:411.54, pos:'SHORT 5×', rank:1 },
      { name:'Kai', pnl:25.28, pos:'FLAT' }, { name:'Sable', pnl:-181.05, pos:'LONG 20×' },
      { name:'Rex', pnl:233.31, pos:'SHORT 5×', rank:2 }, { name:'Luna', pnl:-1.45, pos:'SHORT 20×' },
      { name:'Dex', pnl:96.21, pos:'LONG 5×', rank:3 }, { name:'Aya', pnl:-42.10, pos:'FLAT' },
    ],
    lead:{ name:'Momo', pnl:411.54, you:5 },
    cta:'perp' },
  { id:'lucid', kind:'perp', title:'Beat Lucid — Live Arena', tag:'BTC-PERP · Challenge', listening:3230,
    market:{ sym:'BTC-PERP', price:64081.4, deltaPct:-0.14 },
    seats:[
      { name:'Viv', pnl:-4.83, pos:'LONG 10×' }, { name:'Momo', pnl:411.91, pos:'SHORT 20×', rank:1, verified:true },
      { name:'Kai', pnl:-5.07, pos:'FLAT' }, { name:'Sable', pnl:-178.20, pos:'FLAT' },
      { name:'Rex', pnl:132.32, pos:'SHORT 20×', rank:2 }, { name:'Luna', pnl:0.40, pos:'SHORT 20×' },
      { name:'Dex', pnl:96.40, pos:'FLAT', rank:3 }, { name:'Aya', pnl:-42.10, pos:'FLAT' },
    ],
    lead:{ name:'Momo', pnl:411.91, you:5 },
    versus:{ a:{ name:'Momo', pnl:411.91 }, b:{ name:'Lucid', pnl:173.40, bot:true }, ahead:'1/9', left:'14:42' },
    cta:'perp' },
];

function LtAvatar({ name, size=52, rank, verified }) {
  const ring = rank===1 ? 'linear-gradient(135deg,#FFD76A,#F5A623)' : rank===2 ? 'linear-gradient(135deg,#D8DEE9,#9AA5B8)' : rank===3 ? 'linear-gradient(135deg,#E7B98C,#B5651D)' : 'transparent';
  return (
    <div style={{position:'relative', width:size, height:size}}>
      <div style={{position:'absolute', inset:-3, borderRadius:'50%', background:ring}}/>
      <div style={{position:'absolute', inset:0, borderRadius:'50%', overflow:'hidden'}}><PersonAvatar seed={name} size={size}/></div>
      {rank && <div style={{position:'absolute', bottom:-2, right:-2, width:18, height:18, borderRadius:'50%', background:'var(--surface-base)', border:'1.5px solid var(--surface-base)', display:'flex', alignItems:'center', justifyContent:'center', font:'800 10px var(--font-mono)', color:'var(--text-primary)'}}>{rank}</div>}
      {verified && <div style={{position:'absolute', top:-2, right:-2, width:16, height:16, borderRadius:'50%', background:'var(--color-violet-500)', border:'1.5px solid var(--surface-base)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:9}}>✓</div>}
      <div style={{position:'absolute', bottom:-2, left:-2, width:16, height:16, borderRadius:'50%', background:'var(--surface-elevated)', border:'1.5px solid var(--surface-base)', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.4" strokeLinecap="round"><path d="M12 2v10M8 5a7 7 0 1 0 8 0"/></svg>
      </div>
    </div>
  );
}

function LtLiveBadge() {
  return (<span style={{display:'inline-flex', alignItems:'center', gap:4, font:'800 11px var(--font-body)', color:'var(--regime-down-mid)', background:'rgba(255,77,106,.12)', padding:'4px 9px', borderRadius:999}}>
    <span style={{width:6, height:6, borderRadius:'50%', background:'var(--regime-down-mid)'}}/>LIVE
  </span>);
}

/* ── Room list ── */
function LiveTradeScreen({ onBack }) {
  return (
    <SubShell title="Live Trade" onBack={onBack}>
      <div style={{display:'flex', flexDirection:'column', gap:14, padding:'4px 20px 24px'}}>
        <p style={{margin:0, font:'400 14px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5}}>Watch live call rooms — trade alongside other traders, in real time, with chat.</p>
        {LT_ROOMS.map(r => (
          <button key={r.id} onClick={()=>window.__arxOpenSub && window.__arxOpenSub('liveTradeRoom',{room:r.id})} style={{
            textAlign:'left', border:'.5px solid var(--border-default)', borderRadius:'var(--r-lg)', background:'var(--surface-elevated)',
            padding:14, cursor:'pointer', display:'flex', flexDirection:'column', gap:10}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
              <div style={{display:'flex', flexDirection:'column', gap:2}}>
                <span style={{font:'700 15px var(--font-body)', color:'var(--text-primary)'}}>{r.title}</span>
                <span style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.04em'}}>{r.tag} · {(r.listening/1000).toFixed(2)}K listening</span>
              </div>
              <LtLiveBadge/>
            </div>
            <div style={{display:'flex', gap:-8}}>
              {r.seats.slice(0,6).map((s,i) => (
                <div key={s.name} style={{marginLeft: i===0?0:-10, zIndex:6-i}}><LtAvatar name={s.name} size={30} rank={s.rank}/></div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </SubShell>
  );
}

function LtRoomChart({ height=90, seed=1 }) {
  const w = 320;
  const data = React.useMemo(() => {
    let v = 100, out = [];
    for (let i=0;i<28;i++) { const o=v; v += (Math.sin(i*0.7+seed)*2.2 + (Math.random()-0.5)*3); const hi=Math.max(o,v)+Math.random()*1.4; const lo=Math.min(o,v)-Math.random()*1.4; out.push([o, hi, lo, v]); }
    return out;
  }, [seed]);
  const all = data.flatMap(c=>[c[1],c[2]]); const min=Math.min(...all), max=Math.max(...all), rng=(max-min)||1;
  const cw = w/data.length, bw = cw*0.56;
  const y = v => height-4 - ((v-min)/rng)*(height-10);
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{display:'block'}}>
      {data.map((c,i)=>{ const [o,hi,lo,cl]=c; const up=cl>=o; const col=up?'var(--regime-up-mid)':'var(--regime-down-mid)'; const x=i*cw+cw/2;
        return <g key={i} stroke={col} fill={col}>
          <line x1={x} x2={x} y1={y(hi)} y2={y(lo)} strokeWidth="1"/>
          <rect x={x-bw/2} y={Math.min(y(o),y(cl))} width={bw} height={Math.max(1.4,Math.abs(y(o)-y(cl)))} rx="1"/>
        </g>;
      })}
    </svg>
  );
}

/* ── Room detail ── */
function LiveTradeRoomScreen({ roomId, onBack, onToast }) {
  const room = LT_ROOMS.find(r => r.id === roomId) || LT_ROOMS[0];
  const [lev, setLev] = ltS(10);
  const [amt, setAmt] = ltS(100);
  const [msgs, setMsgs] = ltS([
    { kind:'join', who:'nova.eth' },
    { kind:'chat', who:room.seats[3].name, text: room.kind==='contract' ? 'GER always shows up in knockouts' : 'humans cope, bots scalp' },
    { kind:'trade', who: room.kind==='contract' ? room.seats[1].name : (room.versus ? 'Lucid' : room.seats[4].name), action: room.kind==='contract' ? 'dumped ARG position' : 'opened', tag: room.kind==='contract' ? null : 'SHORT 10×', pnl: room.kind==='contract' ? -25.03 : null },
  ]);
  const listRef = ltR(null);
  ltE(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [msgs]);
  const [text, setText] = ltS('');
  const send = () => { if (!text.trim()) return; setMsgs(m => [...m, { kind:'chat', who:'You', text }]); setText(''); };

  const bull = 'var(--regime-up-mid)', bear = 'var(--regime-down-mid)';

  return (
    <div style={{position:'absolute', inset:0, background:'var(--surface-base)', color:'var(--text-primary)', zIndex:30, display:'flex', flexDirection:'column'}}>
      <div style={{display:'flex', alignItems:'center', gap:10, padding:'48px 20px 8px', flexShrink:0}}>
        <button onClick={onBack} style={{width:34, height:34, borderRadius:'50%', border:'.5px solid var(--border-default)',
          background:'var(--surface-elevated)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transform:'rotate(180deg)', flexShrink:0}}>
          <window.IconChevron size={16} color="var(--text-primary)"/>
        </button>
        <div style={{display:'flex', flexDirection:'column', flex:1, minWidth:0}}>
          <span style={{font:'700 17px var(--font-body)', letterSpacing:'-.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{room.title}</span>
          <span style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.04em'}}>{room.tag} · {(room.listening/1000).toFixed(2)}K listening</span>
        </div>
        <LtLiveBadge/>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:14, padding:'2px 20px 8px'}}>
        <button onClick={()=>onToast && onToast('Leaderboard')} style={{display:'flex', alignItems:'center', gap:10, border:'.5px solid var(--border-default)', borderRadius:'var(--r-md)', background:'var(--surface-elevated)', padding:'8px 12px', cursor:'pointer'}}>
          <span style={{fontSize:16}}>🏆</span>
          <PersonAvatar seed={room.lead.name} size={22}/>
          <span style={{font:'700 13px var(--font-body)', color:'var(--text-primary)'}}>{room.lead.name}</span>
          <span style={{font:'700 13px var(--font-mono)', color:bull}}>+${room.lead.pnl.toFixed(2)}</span>
          <span style={{flex:1}}/>
          <span style={{font:'600 12px var(--font-body)', color:'var(--color-violet-500)'}}>You #{room.lead.you}</span>
          <span style={{color:'var(--text-tertiary)'}}>›</span>
        </button>

        {room.versus && (
          <div style={{border:'.5px solid var(--border-default)', borderRadius:'var(--r-md)', background:'var(--surface-elevated)', padding:12, display:'flex', flexDirection:'column', gap:8}}>
            <div style={{display:'flex', justifyContent:'space-between', font:'600 12px var(--font-body)', color:'var(--text-secondary)'}}>
              <span>BEAT LUCID · {room.versus.ahead} ahead</span>
              <span style={{color:'var(--color-violet-500)', fontFamily:'var(--font-mono)'}}>{room.versus.left} left ›</span>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <span style={{font:'600 12px var(--font-body)', color:'var(--text-primary)'}}>{room.versus.a.name}</span>
              <span className="num" style={{font:'700 12px var(--font-mono)', color:bull}}>+${room.versus.a.pnl.toFixed(2)}</span>
              <div style={{flex:1, height:6, borderRadius:999, background:'var(--surface-base)', overflow:'hidden', display:'flex'}}>
                <div style={{width:'71%', background:bull}}/><div style={{width:'29%', background:'var(--color-violet-500)'}}/>
              </div>
              <span className="num" style={{font:'700 12px var(--font-mono)', color:'var(--color-violet-500)'}}>+${room.versus.b.pnl.toFixed(2)}</span>
              <span style={{font:'600 12px var(--font-body)', color:'var(--text-primary)'}}>{room.versus.b.name}</span>
            </div>
          </div>
        )}

        {room.kind === 'contract' ? (
          <div style={{border:'.5px solid var(--border-default)', borderRadius:'var(--r-lg)', background:'var(--surface-elevated)', padding:14, display:'flex', flexDirection:'column', gap:10}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <span style={{width:26, height:26, borderRadius:'50%', background:'var(--color-violet-500)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', font:'700 10px var(--font-body)'}}>ARG</span>
                <span style={{font:'700 15px var(--font-body)', color:'var(--text-primary)'}}>{room.market.label}</span>
                <span className="num" style={{font:'700 14px var(--font-mono)', color:'var(--text-primary)'}}>{room.market.price}</span>
                <span className="num" style={{font:'600 12px var(--font-mono)', color:bear}}>{room.market.deltaC}¢</span>
              </div>
              <span style={{font:'600 10px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.05em'}}>TO WIN</span>
            </div>
            <div style={{height:80, borderRadius:10, background:'var(--surface-base)', overflow:'hidden'}}><LtRoomChart height={80} seed={2}/></div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6}}>
              {room.market.contracts.map(c => (
                <div key={c.sym} style={{textAlign:'center', padding:'8px 4px', borderRadius:10, background: c.sym==='ARG' ? 'var(--color-violet-500)' : 'var(--surface-base)'}}>
                  <div style={{font:`700 11px var(--font-mono)`, color: c.sym==='ARG' ? '#fff' : 'var(--text-tertiary)'}}>{c.sym}</div>
                  <div className="num" style={{font:'700 13px var(--font-mono)', color: c.sym==='ARG' ? '#fff' : 'var(--text-primary)'}}>{c.price}</div>
                  <div className="num" style={{font:'600 10px var(--font-mono)', color: c.sym==='ARG' ? 'rgba(255,255,255,.85)' : (c.d>=0?bull:bear)}}>{c.d>=0?'↑':'↓'}{Math.abs(c.d)}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{border:'.5px solid var(--border-default)', borderRadius:'var(--r-lg)', background:'var(--surface-elevated)', padding:14, display:'flex', flexDirection:'column', gap:10}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <span style={{width:26, height:26, borderRadius:'50%', background:'#F7931A', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', font:'700 13px var(--font-body)'}}>₿</span>
                <span style={{font:'700 14px var(--font-body)', color:'var(--text-primary)'}}>{room.market.sym}</span>
                <span className="num" style={{font:'700 14px var(--font-mono)', color:'var(--text-primary)'}}>${room.market.price.toLocaleString()}</span>
                <span className="num" style={{font:'600 12px var(--font-mono)', color: room.market.deltaPct>=0?bull:bear}}>{room.market.deltaPct}%</span>
              </div>
              <span style={{font:'500 10px var(--font-mono)', color:'var(--text-tertiary)'}}>1M</span>
            </div>
            {window.CandleChart ? <div style={{margin:'0 -14px'}}><window.CandleChart height={140}/></div> : <div style={{height:140, borderRadius:10, background:'var(--surface-base)', overflow:'hidden'}}><LtRoomChart height={140} seed={5}/></div>}
          </div>
        )}

        <div style={{display:'flex', flexDirection:'column', gap:6}}>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12}}>
            {room.seats.map(s => (
              <div key={s.name} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:6}}>
                <LtAvatar name={s.name} rank={s.rank} verified={s.verified}/>
                <span style={{font:'600 12px var(--font-body)', color:'var(--text-primary)'}}>{s.name}</span>
                <span className="num" style={{font:'700 11px var(--font-mono)', color: s.pnl>0?bull:(s.pnl<0?bear:'var(--text-tertiary)')}}>{s.pnl>0?'+':(s.pnl<0?'-':'')}${Math.abs(s.pnl).toFixed(2)}</span>
                <span style={{font:'600 9px var(--font-mono)', color: s.pos==='FLAT' ? 'var(--text-tertiary)' : (s.pos.startsWith('SHORT')?bear:bull), background: s.pos==='FLAT' ? 'var(--surface-base)' : (s.pos.startsWith('SHORT')?'rgba(255,77,106,.12)':'rgba(20,184,123,.12)'), padding:'2px 6px', borderRadius:999}}>{s.pos}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div ref={listRef} style={{flex:1, minHeight:0, overflowY:'auto', padding:'4px 20px 8px', display:'flex', flexDirection:'column', gap:8}}>
        {msgs.map((m,i) => {
          if (m.kind==='join') return <div key={i} style={{font:'600 12px var(--font-body)', color:'var(--color-violet-500)'}}>{m.who} joined the room</div>;
          if (m.kind==='trade') return (
            <div key={i} style={{display:'flex', alignItems:'center', gap:10, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:'var(--r-md)', padding:'8px 12px'}}>
              <PersonAvatar seed={m.who} size={26}/>
              <div style={{display:'flex', flexDirection:'column', flex:1, minWidth:0}}>
                <span style={{font:'700 12.5px var(--font-body)', color:'var(--text-primary)'}}>{m.who} <span style={{fontWeight:500, color:'var(--text-secondary)'}}>{m.action}</span></span>
              </div>
              {m.tag && <span style={{font:'800 9px var(--font-body)', color:bear, background:'rgba(255,77,106,.12)', padding:'2px 6px', borderRadius:999}}>{m.tag}</span>}
              {m.pnl != null && <span className="num" style={{font:'700 12px var(--font-mono)', color: m.pnl>=0?bull:bear}}>{m.pnl>=0?'+':'-'}${Math.abs(m.pnl).toFixed(2)}</span>}
            </div>
          );
          return (
            <div key={i} style={{display:'flex', gap:8, alignItems:'flex-start'}}>
              <PersonAvatar seed={m.who} size={24}/>
              <div style={{display:'flex', flexDirection:'column', gap:2}}>
                <span style={{font:'600 11px var(--font-body)', color:'var(--text-tertiary)'}}>{m.who}</span>
                <span style={{font:'500 13px var(--font-body)', color:'var(--text-primary)', background:'var(--surface-elevated)', borderRadius:'var(--r-md)', padding:'6px 10px', display:'inline-block'}}>{m.text}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{padding:'8px 20px 10px', display:'flex', gap:8, borderTop:'.5px solid var(--border-default)'}}>
        {room.kind === 'contract' ? (
          <React.Fragment>
            {[50,100,250].map(v => (
              <button key={v} onClick={()=>setAmt(v)} style={{padding:'10px 12px', borderRadius:999, border:'.5px solid var(--border-default)', background: amt===v ? 'var(--color-violet-500)' : 'var(--surface-elevated)', color: amt===v?'#fff':'var(--text-primary)', font:'700 13px var(--font-mono)', cursor:'pointer'}}>${v}</button>
            ))}
            <button onClick={()=>{onToast && onToast(`Backed ${room.market.label} · ${room.market.price} · $${amt}`);}} style={{flex:1, borderRadius:999, border:'none', background:'#2FA8E0', color:'#fff', font:'700 14px var(--font-body)', cursor:'pointer'}}>Back {room.market.label.split(' ')[0]===room.market.label?room.market.label:room.market.label} · {room.market.price}</button>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {[5,10,20].map(v => (
              <button key={v} onClick={()=>setLev(v)} style={{padding:'10px 12px', borderRadius:999, border:'.5px solid var(--border-default)', background: lev===v ? 'var(--color-violet-500)' : 'var(--surface-elevated)', color: lev===v?'#fff':'var(--text-primary)', font:'700 13px var(--font-mono)', cursor:'pointer'}}>{v}×</button>
            ))}
            <button onClick={()=>{onToast && onToast(`Joined Bulls · ${room.market.sym} · ${lev}×`);}} style={{flex:1, borderRadius:999, border:'none', background:bull, color:'#fff', font:'700 14px var(--font-body)', cursor:'pointer'}}>Join Bulls</button>
            <button onClick={()=>{onToast && onToast(`Joined Bears · ${room.market.sym} · ${lev}×`);}} style={{flex:1, borderRadius:999, border:'none', background:bear, color:'#fff', font:'700 14px var(--font-body)', cursor:'pointer'}}>Join Bears</button>
          </React.Fragment>
        )}
      </div>
      <div style={{padding:'0 20px 16px', display:'flex', gap:8, alignItems:'center'}}>
        <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter' && send()} placeholder="Say hi…" style={{flex:1, border:'.5px solid var(--border-default)', borderRadius:999, background:'var(--surface-elevated)', padding:'11px 16px', font:'400 14px var(--font-body)', color:'var(--text-primary)', outline:'none'}}/>
        <button onClick={send} style={{width:38, height:38, borderRadius:'50%', background:'var(--color-violet-500)', border:'none', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
        </button>
        <button style={{width:38, height:38, borderRadius:'50%', background:'rgba(124,91,255,.15)', border:'none', color:'var(--color-violet-500)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16}}>🎁</button>
      </div>
    </div>
  );
}

Object.assign(window, { LiveTradeScreen, LiveTradeRoomScreen });
