// Arx — Instrument detail (v38)
// Overview + tabs for SIG-I01 Bias / SIG-I02 Flow / SIG-I03 Entry & Risk Walls / SIG-I04 Stress

const { useState: vUS, useRef: vUR, useEffect: vUE } = React;

/* ─── phone shell with sticky tab bar + scroller ─── */
function PhoneShell({ width = 402, height = 880, top, tabs, activeTab, onTab, children, scrollerRef }) {
  return (
    <div style={{
      width, height, borderRadius:44, overflow:'hidden', position:'relative',
      background:'var(--surface-base)',
      boxShadow:'0 24px 48px rgba(7,5,26,.40), 0 0 0 1px rgba(255,255,255,.04)',
      color:'var(--text-primary)', fontFamily:'var(--font-body)'
    }}>
      <div style={{
        position:'absolute', top:11, left:'50%', transform:'translateX(-50%)',
        width:126, height:37, borderRadius:24, background:'#000', zIndex:50, pointerEvents:'none'
      }}/>
      <div style={{
        position:'absolute', top:0, left:0, right:0, zIndex:10, pointerEvents:'none',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'18px 36px 0', height:54
      }}>
        <span style={{ font:'600 16px -apple-system, system-ui', color:'#fff' }}>9:41</span>
        <span style={{display:'flex', gap:6}}>
          <svg width="18" height="11"><rect x="0" y="7" width="3" height="4" rx=".6" fill="#fff"/><rect x="4.5" y="5" width="3" height="6" rx=".6" fill="#fff"/><rect x="9" y="2.5" width="3" height="8.5" rx=".6" fill="#fff"/><rect x="13.5" y="0" width="3" height="11" rx=".6" fill="#fff"/></svg>
          <svg width="26" height="12"><rect x=".5" y=".5" width="22" height="11" rx="3" stroke="#fff" strokeOpacity=".4" fill="none"/><rect x="2" y="2" width="19" height="8" rx="1.5" fill="#fff"/></svg>
        </span>
      </div>
      <div ref={scrollerRef} style={{
        height:'100%', overflowY:'auto', overflowX:'hidden',
        paddingTop:54, paddingBottom:24,
        WebkitOverflowScrolling:'touch',
        scrollbarWidth:'thin', scrollbarColor:'rgba(124,91,255,.18) transparent'
      }}>
        {top}
        <TabBar tabs={tabs} active={activeTab} onChange={onTab}/>
        {children}
        <div style={{height:24}}/>
      </div>
      <div style={{
        position:'absolute', bottom:8, left:'50%', transform:'translateX(-50%)',
        width:139, height:5, borderRadius:3, background:'rgba(255,255,255,.5)',
        pointerEvents:'none', zIndex:20
      }}/>
    </div>
  );
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      position:'sticky', top:0, zIndex:5,
      background:'linear-gradient(to bottom, var(--surface-base) 70%, rgba(14,12,24,0))',
      paddingTop:6
    }}>
      <div style={{
        margin:'0 16px', padding:4, borderRadius:14,
        background:'var(--surface-elevated)',
        border:'.5px solid var(--border-default)',
        display:'flex', gap:2,
        backdropFilter:'blur(20px)'
      }}>
        {tabs.map(t => {
          const isActive = t.id === active;
          return (
            <button key={t.id} onClick={()=>onChange(t.id)} style={{
              flex:1, height:34, border:'none', borderRadius:10, cursor:'pointer',
              background: isActive ? 'var(--color-violet-500)' : 'transparent',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              font:`${isActive?700:600} 12px var(--font-body)`,
              letterSpacing:'-0.005em',
              boxShadow: isActive ? '0 4px 12px rgba(124,91,255,.30)' : 'none',
              transition:'all 180ms cubic-bezier(.32,.72,0,1)',
              whiteSpace:'nowrap'
            }}>{t.label}</button>
          );
        })}
      </div>
      <div style={{height:12, background:'linear-gradient(to bottom, var(--surface-base), rgba(14,12,24,0))'}}/>
    </div>
  );
}

function PhoneTopNav({ title }) {
  return (
    <div style={{
      padding:'8px 16px 6px',
      display:'flex', alignItems:'center', gap:10, justifyContent:'space-between'
    }}>
      <button style={{
        width:36, height:36, borderRadius:'50%', border:'none', cursor:'pointer',
        background:'rgba(124,91,255,.10)',
        display:'flex', alignItems:'center', justifyContent:'center'
      }}>
        <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
          <path d="M8 2L2 8l6 6" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div style={{
        flex:1, textAlign:'center',
        font:'600 13px var(--font-mono)', color:'var(--text-secondary)',
        letterSpacing:'.02em'
      }}>{title}</div>
      <div style={{display:'flex', gap:6}}>
        <button style={{
          width:36, height:36, borderRadius:'50%', border:'none', cursor:'pointer',
          background:'rgba(124,91,255,.10)',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L8.5 5L13 5.5L9.75 8.5L10.5 13L7 11L3.5 13L4.25 8.5L1 5.5L5.5 5L7 1Z" stroke="var(--text-primary)" strokeWidth="1.3" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

/* Overview topline card with mini-viz */
function ToplineCard({ sigId, name, state, stateTone, headline, sub, meta, miniViz, onGo }) {
  const toneMap = {
    bullish:{ ink:'var(--regime-up-mid)',    bg:'rgba(45,212,155,.10)',   border:'rgba(45,212,155,.22)' },
    bearish:{ ink:'var(--regime-down-mid)',  bg:'rgba(242,106,106,.10)',  border:'rgba(242,106,106,.22)' },
    warn:   { ink:'var(--regime-trans-mid)', bg:'rgba(251,191,36,.10)',   border:'rgba(251,191,36,.22)' },
    info:   { ink:'var(--regime-range-mid)', bg:'rgba(59,130,246,.10)',   border:'rgba(59,130,246,.22)' },
    violet: { ink:'var(--color-violet-300)', bg:'rgba(124,91,255,.10)',  border:'rgba(124,91,255,.22)' },
    crit:   { ink:'var(--regime-crisis-mid)',bg:'rgba(220,38,38,.10)',    border:'rgba(220,38,38,.22)' },
  };
  const t = toneMap[stateTone] || toneMap.violet;
  return (
    <button onClick={onGo} className="arx-press" style={{
      display:'block', width:'calc(100% - 32px)', margin:'0 16px 10px', textAlign:'left',
      padding:14, borderRadius:14,
      background:'var(--surface-elevated)',
      border:'.5px solid var(--border-default)', cursor:'pointer'
    }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginBottom:8}}>
        <div style={{display:'flex', gap:8, alignItems:'baseline'}}>
          {sigId && <span style={{
            font:'700 9px var(--font-mono)', color:'var(--color-violet-300)',
            letterSpacing:'.10em', textTransform:'uppercase'
          }}>{sigId}</span>}
          <span style={{
            font:'600 13px var(--font-body)', color:'var(--text-primary)',
            letterSpacing:'-0.01em'
          }}>{name}</span>
        </div>
        <span style={{
          font:'600 10px var(--font-body)', color:t.ink, background:t.bg,
          padding:'3px 8px', borderRadius:999, letterSpacing:'.04em', textTransform:'uppercase',
          border:`.5px solid ${t.border}`
        }}>{state}</span>
      </div>
      <div style={{display:'flex', gap:12, alignItems:'flex-start'}}>
        <div style={{flex:1, minWidth:0}}>
          <div style={{
            font:'600 15px var(--font-brand)', color:'var(--text-primary)',
            letterSpacing:'-0.01em', lineHeight:1.3
          }}>{headline}</div>
          {sub && <div style={{
            font:'400 12px var(--font-body)', color:'var(--text-secondary)',
            marginTop:4, lineHeight:1.4, letterSpacing:'-0.005em'
          }}>{sub}</div>}
        </div>
        {miniViz}
      </div>
      {meta && <div style={{
        marginTop:10, paddingTop:10, borderTop:'.5px solid var(--border-default)',
        display:'flex', gap:14, flexWrap:'wrap',
        font:'500 11px var(--font-mono)', color:'var(--text-secondary)'
      }}>
        {meta.map((m,i) => (
          <span key={i}><span style={{color:'var(--text-tertiary)'}}>{m.label}</span> <span style={{color:m.color||'var(--text-primary)'}}>{m.value}</span></span>
        ))}
      </div>}
      <div style={{
        marginTop:10, display:'flex', justifyContent:'space-between', alignItems:'center',
        font:'600 11px var(--font-body)', color:'var(--color-violet-300)',
        letterSpacing:'-0.005em'
      }}>
        <span>Open detail</span>
        <IconChevron color="var(--color-violet-300)" size={12}/>
      </div>
    </button>
  );
}

function SigSpark({ points, color, w = 56, h = 28, fill = true }) {
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const toX = (i) => (w/(points.length-1)) * i;
  const toY = (v) => h - 2 - ((v-min)/range) * (h-4);
  const path = points.map((v,i)=> (i?'L':'M') + toX(i).toFixed(1)+','+toY(v).toFixed(1)).join(' ');
  return (
    <svg width={w} height={h} style={{flexShrink:0}}>
      {fill && <path d={`${path} L${w},${h} L0,${h} Z`} fill={color} opacity="0.12"/>}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={toX(points.length-1)} cy={toY(points[points.length-1])} r="2.4" fill={color}/>
    </svg>
  );
}

function MiniBiasViz({ activeIdx }) {
  const colors = ['var(--regime-down-mid)','rgba(242,106,106,.55)','var(--text-tertiary)','rgba(45,212,155,.55)','var(--regime-up-mid)'];
  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(5, 8px)', gap:2, alignItems:'center'}}>
      {[0,1,2,3,4].map(i => (
        <div key={i} style={{
          width:8, height: 4 + i*2, borderRadius:1.5,
          background: i===activeIdx ? colors[i] : 'rgba(124,91,255,.16)',
          boxShadow: i===activeIdx ? `0 0 8px ${colors[i]}` : 'none'
        }}/>
      ))}
    </div>
  );
}

function MiniStressViz({ cells }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(4,7px)', gap:2}}>
      {cells.map((c, i) => (
        <div key={i} style={{
          width:7, height:7, borderRadius:2,
          background: c==='c'?'var(--regime-crisis-mid)'
                    : c==='e'?'var(--regime-down-mid)'
                    : c==='w'?'var(--regime-trans-mid)'
                    : c==='n'?'var(--regime-up-mid)'
                    : 'var(--border-default)'
        }}/>
      ))}
    </div>
  );
}

function MiniWallsViz() {
  return (
    <svg width="64" height="44" viewBox="0 0 64 44">
      <line x1="32" y1="2" x2="32" y2="42" stroke="var(--border-default)" strokeWidth="1" strokeDasharray="2 3"/>
      {/* Forced-exit above */}
      <rect x="20" y="6" width="24" height="3" rx="1.5" fill="var(--regime-down-mid)" opacity="0.85"/>
      {/* Possible profit-taking above */}
      <rect x="22" y="14" width="20" height="3" rx="1.5" fill="var(--regime-trans-mid)" opacity="0.75"/>
      {/* Mark */}
      <circle cx="32" cy="22" r="3.5" fill="var(--color-violet-400)" stroke="var(--surface-elevated)" strokeWidth="1.5"/>
      {/* Entry below */}
      <rect x="18" y="28" width="28" height="3" rx="1.5" fill="var(--regime-up-mid)" opacity="0.85"/>
      {/* Forced-exit below */}
      <rect x="22" y="36" width="20" height="3" rx="1.5" fill="var(--regime-down-mid)" opacity="0.7"/>
    </svg>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      padding:'14px 20px 8px',
      font:'600 10px var(--font-mono)', color:'var(--text-tertiary)',
      letterSpacing:'.12em', textTransform:'uppercase'
    }}>{children}</div>
  );
}

function ModuleSpacer({ h = 12 }) {
  return <div style={{height:h}}/>;
}

function DisclaimerFooter({ text }) {
  return (
    <div style={{
      padding:'20px 20px 0', font:'400 10px var(--font-body)',
      color:'var(--text-tertiary)', textAlign:'center', lineHeight:1.6,
      letterSpacing:'-0.005em'
    }}>{text}</div>
  );
}

/* ─── Instrument hero with entity-level data ─── */
function InstrumentHero() {
  return (
    <div style={{padding:'0 20px 18px'}}>
      <div style={{display:'flex', alignItems:'flex-start', gap:14, marginBottom:14}}>
        <AssetGlyph sym="BTC" size={44}/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{
            font:'700 28px var(--font-brand)', color:'var(--text-primary)',
            letterSpacing:'-0.025em', lineHeight:1.05
          }}>BTC-PERP</div>
          <div style={{
            font:'500 12px var(--font-body)', color:'var(--text-tertiary)',
            marginTop:3, letterSpacing:'-0.005em'
          }}>Bitcoin perpetual · cross margin</div>
        </div>
      </div>

      <div style={{
        display:'flex', alignItems:'flex-end', justifyContent:'space-between',
        gap:12, marginBottom:14
      }}>
        <div>
          <div className="num" style={{
            font:'700 34px var(--font-mono)', color:'var(--text-primary)',
            letterSpacing:'-0.03em', lineHeight:1
          }}>$66,247<span style={{color:'var(--text-tertiary)', font:'500 20px var(--font-mono)'}}>.30</span></div>
          <div className="num" style={{
            marginTop:6, display:'flex', gap:8, alignItems:'baseline'
          }}>
            <span style={{
              font:'600 13px var(--font-mono)', color:'var(--regime-up-mid)',
              letterSpacing:'-0.005em'
            }}>+$2,672.40</span>
            <span style={{
              font:'600 13px var(--font-mono)', color:'var(--regime-up-mid)'
            }}>+4.21%</span>
            <span style={{
              font:'500 11px var(--font-body)', color:'var(--text-tertiary)',
              letterSpacing:'.04em', textTransform:'uppercase'
            }}>24h</span>
          </div>
        </div>
        <div style={{paddingBottom:6}}>
          <SigSpark points={[44,46,42,48,52,56,54,58,63,66,68]} color="var(--regime-up-mid)" w={92} h={36}/>
        </div>
      </div>

      <div style={{
        display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:1,
        background:'var(--border-default)',
        borderRadius:12, overflow:'hidden',
        border:'.5px solid var(--border-default)'
      }}>
        {[
          { label:'24h vol',   value:'$8.2B' },
          { label:'Open int',  value:'$24.1B' },
          { label:'Funding',   value:'+0.012%', color:'var(--regime-up-mid)' },
          { label:'Premium',   value:'+0.04%',  color:'var(--regime-up-mid)' },
        ].map(s => (
          <div key={s.label} style={{
            padding:'9px 10px', background:'var(--surface-elevated)'
          }}>
            <div style={{
              font:'500 9px var(--font-body)', color:'var(--text-tertiary)',
              letterSpacing:'.06em', textTransform:'uppercase'
            }}>{s.label}</div>
            <div className="num" style={{
              font:'600 13px var(--font-mono)', color:s.color || 'var(--text-primary)',
              marginTop:3, letterSpacing:'-0.01em'
            }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Native sub-screen shell — renders inside the Arx app device (replaces standalone PhoneShell).
   Owns its own active-tab state so the tab pill and the body can never diverge. ─── */
function SignalsShell({ title, subtitle, tabs, defaultTab, onBack, top, renderTab, footer, headerRight, titleStyle, subtitleStyle }) {
  const [active, setActive] = vUS(defaultTab || (tabs[0] && tabs[0].id));
  const scrollerRef = vUR(null);
  const tabsRef = vUR(null);
  vUE(() => { const s=scrollerRef.current, t=tabsRef.current; if (s && t && s.scrollTop > t.offsetTop) s.scrollTop = t.offsetTop; }, [active]);
  return (
    <div style={{position:'absolute', inset:0, background:'var(--surface-base)', color:'var(--text-primary)',
      zIndex:30, display:'flex', flexDirection:'column', fontFamily:'var(--font-body)'}}>
      <div style={{display:'flex', alignItems:'center', gap:10, padding:'58px 16px 8px', flexShrink:0,
        background:'var(--surface-base)', zIndex:6}}>
        <button onClick={onBack} style={{width:34, height:34, borderRadius:'50%', border:'.5px solid var(--border-default)',
          background:'var(--surface-elevated)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          flexShrink:0, transform:'rotate(180deg)'}}>
          <IconChevron size={16} color="var(--text-primary)"/>
        </button>
        <div style={{flex:1, minWidth:0}}>
          <div style={Object.assign({font:'600 13px var(--font-mono)', color:'var(--text-secondary)',
            letterSpacing:'.02em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}, titleStyle)}>{title}</div>
          {subtitle && <div style={Object.assign({font:'500 10px var(--font-body)', color:'var(--text-tertiary)', marginTop:1,
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}, subtitleStyle)}>{subtitle}</div>}
        </div>
        {headerRight}
      </div>
      <div ref={scrollerRef} style={{flex:1, overflowY:'auto', overflowX:'hidden', paddingBottom:24,
        scrollbarWidth:'thin', scrollbarColor:'rgba(124,91,255,.18) transparent'}}>
        {top}
        <div ref={tabsRef} style={{position:'sticky', top:0, zIndex:5,
          background:'linear-gradient(to bottom, var(--surface-base) 70%, rgba(14,12,24,0))', paddingTop:6}}>
          <div style={{margin:'0 16px', padding:4, borderRadius:14, background:'var(--surface-elevated)',
            border:'.5px solid var(--border-default)', display:'flex', gap:2}}>
            {tabs.map(t => {
              const isActive = t.id === active;
              return (
                <button key={t.id} onClick={()=>setActive(t.id)} style={{
                  flex:1, height:34, border:'none', borderRadius:10, cursor:'pointer',
                  background: isActive ? 'var(--color-violet-500)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  font:`${isActive?700:600} 11px var(--font-body)`, letterSpacing:'-0.01em',
                  boxShadow: isActive ? '0 4px 12px rgba(124,91,255,.30)' : 'none',
                  transition:'color 180ms, font-weight 180ms', whiteSpace:'nowrap'
                }}>{t.label}</button>
              );
            })}
          </div>
          <div style={{height:12, background:'linear-gradient(to bottom, var(--surface-base), rgba(14,12,24,0))'}}/>
        </div>
        {renderTab(active, setActive)}
        <div style={{height: footer ? 12 : 24}}/>
      </div>
      {footer && (
        <div style={{flexShrink:0, padding:'10px 16px calc(14px + env(safe-area-inset-bottom))',
          background:'var(--glass-tab-bg)', backdropFilter:'blur(40px) saturate(180%)', WebkitBackdropFilter:'blur(40px) saturate(180%)',
          borderTop:'.5px solid var(--glass-tab-border)'}}>{footer}</div>
      )}
    </div>
  );
}

/* ─── Instrument signals (sub-screen) ─── */
function InstrumentSignalsScreen({ onBack }) {
  const tabs = [
    { id:'overview', label:'Overview' },
    { id:'bias',     label:'Bias' },
    { id:'flow',     label:'Flow' },
    { id:'walls',    label:'Walls' },
    { id:'stress',   label:'Stress' },
  ];
  return (
    <SignalsShell title="BTC-PERP · 0x1F39…BC42" tabs={tabs} onBack={onBack} top={<InstrumentHero/>}
      renderTab={(tab, go) => (
        <React.Fragment>
          {tab==='overview' && <InstrumentOverview onGo={go}/>}
          {tab==='bias'     && <InstrumentBiasTab/>}
          {tab==='flow'     && <InstrumentFlowTab/>}
          {tab==='walls'    && <InstrumentWallsTab/>}
          {tab==='stress'   && <InstrumentStressTab/>}
        </React.Fragment>
      )}/>
  );
}

/* ─── Overview ─── */
function InstrumentOverview({ onGo }) {
  return (
    <div>
      <div style={{padding:'4px 16px 14px'}}>
        <div style={{
          padding:14, borderRadius:14,
          background:'linear-gradient(135deg, rgba(124,91,255,.14), rgba(124,91,255,.03))',
          border:'.5px solid rgba(124,91,255,.30)', cursor:'pointer'
        }} className="arx-press" onClick={()=>window.__arxOpenLucid && window.__arxOpenLucid({ contextLabel:'On BTC-PERP', intro:{ action:"Here's how BTC-PERP reads right now.", body:'Bullish flow is rising, Smart Money added long exposure, and long-side stress is elevated. I can break down the flow, the cohorts, or the liquidation walls.' }, chips:[] })}>
          <div style={{
            font:'600 9px var(--font-body)', color:'var(--color-violet-300)',
            letterSpacing:'.10em', textTransform:'uppercase'
          }}>Combined read · 4h</div>
          <div style={{
            font:'600 15px var(--font-brand)', color:'var(--text-primary)',
            marginTop:6, lineHeight:1.35, letterSpacing:'-0.005em'
          }}>Bullish flow is rising. Smart Money added long exposure. Long-side stress is elevated.</div>
          <div style={{marginTop:10, display:'flex', gap:6, flexWrap:'wrap'}}>
            <Badge tone="up">Flow rising</Badge>
            <Badge tone="violet">Bias bullish</Badge>
            <Badge tone="down" small>Long stress</Badge>
            <Badge tone="info" small>Forced-exit wall above</Badge>
          </div>
          <div style={{display:'inline-flex', alignItems:'center', gap:4, marginTop:11, font:'700 11px var(--font-body)', color:'var(--color-violet-500)'}}>
            Continue in Lucid
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </div>
        </div>
      </div>

      <SectionLabel>Signals · tap to drill in</SectionLabel>

      <ToplineCard
        sigId="SIG-I02" name="Flow Momentum"
        state="Rising" stateTone="bullish"
        headline="Bullish flow is rising — 3.4× above normal."
        sub="Current 1h bullish flow $42.6M vs normal $12.5M. Whale Moves-led."
        meta={[
          { label:'Multiple', value:'3.4×', color:'var(--regime-up-mid)' },
          { label:'Wallets',  value:'334' },
          { label:'Top share',value:'38%' },
        ]}
        miniViz={<SigSpark points={[10,12,14,18,22,28,36,48]} color="var(--regime-up-mid)" w={64} h={32}/>}
        onGo={()=>onGo('flow')}
      />

      <ToplineCard
        sigId="SIG-I01" name="Position Bias"
        state="Bullish" stateTone="bullish"
        headline="Indecisive, leaning Bullish — Smart Money added."
        sub="Long-side pressure has increased, but positioning hasn't left the neutral band yet."
        meta={[
          { label:'4h delta', value:'+8 pts → Bullish', color:'var(--regime-up-mid)' },
          { label:'Drivers',  value:'Exposure · Wallets' },
        ]}
        miniViz={<MiniBiasViz activeIdx={3}/>}
        onGo={()=>onGo('bias')}
      />

      <ToplineCard
        sigId="SIG-I03" name="Entry & Risk Walls"
        state="Walls active" stateTone="info"
        headline="Forced-Exit Wall at $63,950 · −5.1% below."
        sub="Smart Money entry wall below at $65,900. Possible profit-taking area above at $69,800."
        meta={[
          { label:'Forced-exit', value:'$63.9K', color:'var(--regime-down-mid)' },
          { label:'Entry',       value:'$65.9K', color:'var(--regime-up-mid)' },
          { label:'Profit area', value:'$69.8K', color:'var(--regime-trans-mid)' },
        ]}
        miniViz={<MiniWallsViz/>}
        onGo={()=>onGo('walls')}
      />

      <ToplineCard
        sigId="SIG-I04" name="Liquidation & PnL Stress"
        state="Elevated" stateTone="bearish"
        headline="Long-side stress elevated — $96M vulnerable, 1.7K wallets."
        sub="Full Rekt longs crowded · 74% underwater · forced-exit zone very close."
        meta={[
          { label:'Vulnerable', value:'$96M', color:'var(--regime-down-mid)' },
          { label:'Underwater', value:'74%',  color:'var(--regime-down-mid)' },
          { label:'Wallets',    value:'1.7K' },
        ]}
        miniViz={<MiniStressViz cells={[
          'w','e','w','c',
          'n','w','e','c',
          'b','w','b','e',
        ]}/>}
        onGo={()=>onGo('stress')}
      />

      <SectionLabel>Who is driving this</SectionLabel>
      <Surface>
        <div style={{
          font:'500 12px var(--font-body)', color:'var(--text-secondary)',
          marginBottom:10, lineHeight:1.4
        }}>Top contributing wallets · last 4h</div>
        <ContributingWalletRow
          addr="0xA17...9F2C" alias="solana_max"
          perf="Above normal" cluster="Smart Money"
          notional="+$18.2M long"
          action="Opened long at $63,840 · added on retests. 33m after a $2.0M USDC deposit."
          capitalPair="Capital paired"
        />
        <ContributingWalletRow
          addr="0xB84...11DE" alias="vol_hunter"
          perf="Improving" cluster="Whale Moves"
          notional="+$12.4M long"
          action="Doubled position size 4h ago. Currently 8.4× leverage — above its own baseline."
          leverageDrift="Leverage drift 8.4×"
          last
        />
      </Surface>

      <DisclaimerFooter text="Signals describe qualified observations, not trade recommendations. Trading involves risk of loss. Past performance does not indicate future results."/>
    </div>
  );
}

/* ═══ Per-asset signal model — derives S01–S04 from the instrument (price, 24h Δ, OI, funding).
   Falls back to the BTC reference literals when no instrument is supplied. ═══ */
function ivHash(s){let h=2166136261;s=String(s);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return ((h>>>0)%1000)/1000;}
function ivParseUsd(s){if(typeof s!=='string')return 1e9;const x=/([\d.]+)\s*([BMK]?)/.exec(s.replace(/[$,]/g,''));if(!x)return 1e9;return (+x[1])*(x[2]==='B'?1e9:x[2]==='M'?1e6:x[2]==='K'?1e3:1);}
function ivUsd(n){const a=Math.abs(n);if(a>=1e9)return '$'+(a/1e9).toFixed(1)+'B';if(a>=1e6)return '$'+Math.round(a/1e6)+'M';if(a>=1e3)return '$'+Math.round(a/1e3)+'K';return '$'+Math.round(a);}

const BIAS_FB = {
  bucket:'Indecisive, leaning Bullish',
  plainRead:'Long-side pressure has increased, but overall positioning has not left the neutral band.',
  activeIdx:2, deltaPts:8, deltaDir:'bullish',
  trend:{ data:['7d','5d','3d','1d','now'], lines:[
    { name:'Overall', color:'var(--color-violet-400)', points:[48,46,52,56,58] },
    { name:'Smart Money', color:'var(--regime-up-mid)', points:[52,55,60,66,72] },
    { name:'Whale Moves', color:'var(--color-peach-500)', points:[44,48,50,58,68] },
    { name:'Rising Money', color:'var(--regime-range-mid)', points:[50,48,50,54,56], dashed:true },
    { name:'Full Rekt Crowd', color:'var(--regime-down-mid)', points:[60,62,64,58,52], dashed:true },
  ]},
  drivers:{
    direct:[
      { type:'Exposure', cluster:'Smart Money', action:'added long exposure', delta:'+$84M', deltaPct:'+7.9%', contribution:'Largest driver of the bias move', tag:'Smart Money support' },
      { type:'Wallets', cluster:'Full Rekt Crowd', action:'added long wallets', delta:'+1.2K', deltaPct:'+11%', contribution:'Second-largest driver', tag:'Broad crowd support' },
    ],
    overlays:[
      { type:'Leverage', cluster:'Whale Moves', action:'raised effective leverage', delta:'3.8× → 5.1×', deltaPct:'+34%', contribution:'Adds intensity but raises forced-exit risk', tag:'Leverage is rising' },
      { type:'Crowding', cluster:'Full Rekt Crowd', action:'long-side crowding', delta:'2.4× 30d median', deltaPct:null, contribution:'Crowd longs have accumulated quickly', tag:'Crowding is rising' },
    ],
    summary:'Smart Money added, crowd risk rising. Bias moved Bullish on real exposure, but leverage and crowding are also climbing.'
  },
  cohorts:[
    { name:'Smart Money', bucket:'Bullish', change:'Strengthening', activeIdx:3, longNotional:'$210M', longCount:'1.1K', shortNotional:'$103M', shortCount:'740', driver:'Exposure expansion · +$84M long', accent:'var(--color-violet-500)' },
    { name:'Whale Moves', bucket:'Bullish', change:'Strengthening', activeIdx:3, longNotional:'$86M', longCount:'46', shortNotional:'$22M', shortCount:'18', driver:'Leverage intensity · +34%', accent:'var(--color-peach-500)' },
    { name:'Rising Money', bucket:'Indecisive', change:'Stable', activeIdx:2, longNotional:'$54M', longCount:'2.8K', shortNotional:'$48M', shortCount:'2.2K', driver:'Mixed flow, no dominant driver', accent:'var(--regime-range-mid)' },
    { name:'Full Rekt Crowd', bucket:'Bullish', change:'Crowding', activeIdx:3, longNotional:'$96M', longCount:'5.4K', shortNotional:'$38M', shortCount:'1.8K', driver:'Wallet breadth · +1.2K longs', accent:'var(--regime-down-mid)' },
  ]
};
const FLOW_FB = {
  current:{ state:'rising', currentNotional:'+$42.6M', baselineNotional:'+$12.5M', multiple:'3.4', walletCount:'22', topShare:'38%', dominantCohort:'Whale Moves' },
  byWindow:[
    { window:'15m', multiple:'3.4', state:'rising', notional:'+$12.4M', walletCount:8, dominant:'Whale Moves' },
    { window:'1h', multiple:'3.1', state:'rising', notional:'+$24.0M', walletCount:22, dominant:'Whale Moves' },
    { window:'4h', multiple:'1.7', state:'above', notional:'+$48.0M', walletCount:64, dominant:'Smart Money' },
    { window:'24h', multiple:'1.1', state:'near', notional:'+$120M', walletCount:240, dominant:'Mixed' },
  ],
  topDrivers:[
    { name:'Whale Moves', notional:'+$20.4M', multiple:'3.1', share:'48%', wallets:'12', note:'Driven by large wallets — top single wallet holds 38% of this flow.' },
    { name:'Smart Money', notional:'+$13.6M', multiple:'1.6', share:'32%', wallets:'48', note:'Confirmed performers added long exposure.' },
    { name:'Rising Money', notional:'+$5.1M', multiple:'1.2', share:'12%', wallets:'94', note:'Slight long bias, no dominant actor.' },
  ],
  cohortBreakdown:[
    { name:'Smart Money', flow:'+$13.6M', normal:'+$8.4M', multiple:'1.6', wallets:'48', topShare:'18%', netSide:'bullish', accent:'var(--color-violet-500)' },
    { name:'Whale Moves', flow:'+$20.4M', normal:'+$6.6M', multiple:'3.1', wallets:'12', topShare:'38%', netSide:'bullish', accent:'var(--color-peach-500)' },
    { name:'Rising Money', flow:'+$5.1M', normal:'+$4.2M', multiple:'1.2', wallets:'94', topShare:'8%', netSide:'bullish', accent:'var(--regime-range-mid)' },
    { name:'Full Rekt Crowd', flow:'−$10.4M', normal:'−$4.0M', multiple:'2.6', wallets:'180', topShare:'4%', netSide:'bearish', accent:'var(--regime-down-mid)' },
  ]
};
const WALLS_FB = {
  keyWalls:[
    {kind:'entry',above:false,headline:'Smart Money-heavy support below current price',priceLow:65750,priceHigh:66050,center:65900,distance:'2.3%',value:'$210M entry value',wallets:'1.1K',dominant:'Smart Money',mix:[{name:'Smart Money',shortName:'Smart',pct:57},{name:'Whale Moves',shortName:'Whale',pct:20},{name:'Rising Money',shortName:'Rising',pct:13},{name:'Full Rekt Crowd',shortName:'Full Rekt',pct:10}],read:'Smart Money-heavy entry wall below current price.'},
    {kind:'forced',above:false,headline:'Full Rekt-heavy long liquidation below',priceLow:63800,priceHigh:64100,center:63950,distance:'5.1%',value:'$96M at risk in this wall',cumulativeValue:'$318M cumulative risk to this level',positions:'223',wallets:'1716',dominant:'Full Rekt Crowd',mix:[{name:'Full Rekt Crowd',shortName:'Full Rekt',pct:62},{name:'Rising Money',shortName:'Rising',pct:22},{name:'Whale Moves',shortName:'Whale',pct:12},{name:'Smart Money',shortName:'Smart',pct:4}],read:'Crowded long liquidation cluster — main forced-exit risk for longs.'},
    {kind:'profit',above:true,headline:'Possible profit-taking area above current price',confidence:'Inferred',priceLow:69650,priceHigh:69950,center:69800,distance:'3.5%',value:'$74M profitable exposure',wallets:'420',dominant:'Whale Moves',mix:[{name:'Whale Moves',shortName:'Whale',pct:44},{name:'Smart Money',shortName:'Smart',pct:30},{name:'Rising Money',shortName:'Rising',pct:18},{name:'Full Rekt Crowd',shortName:'Full Rekt',pct:8}],read:'Prior reductions detected near this area.'},
  ],
  mapMark:{price:66247,changePct:'+4.21%'},
  mapWalls:[
    {kind:'forced',above:true,center:71200,distance:'5.6%',dominant:'Full Rekt Crowd',value:'$54M at risk'},
    {kind:'profit',above:true,center:69800,distance:'3.5%',dominant:'Whale Moves',value:'$74M',confidence:'Inferred'},
    {kind:'entry',above:false,center:65900,distance:'2.3%',dominant:'Smart Money',value:'$210M'},
    {kind:'forced',above:false,center:63950,distance:'5.1%',dominant:'Full Rekt Crowd',value:'$96M at risk'},
  ]
};
const STRESS_FB = {
  read:{ state:'elevated', stateTone:'elevated', side:'Long', reasons:['Full Rekt longs are crowded.','74% of vulnerable long notional is underwater.','Main liquidation zone is very close to current price.'], vulnerable:'$96M', wallets:'1.7K' },
  driverCards:[
    { primitive:'Crowding', headline:'Full Rekt long exposure is crowded', evidence:'Full Rekt long notional is 2.4× its 30d median.', sev:'elevated', notional:'$96M vulnerable', walletShare:'1716 wallets' },
    { primitive:'PnL pain', headline:'74% of vulnerable long notional is underwater', evidence:'Underwater share has climbed from 48% over the last 4h.', sev:'elevated', notional:'$71M underwater' },
    { primitive:'Liquidation distance', headline:'Main liquidation zone is very close to current price', evidence:'Distance to liquidation is 0.4 normal daily moves — inside the critical band.', sev:'critical', notional:'$96M within band' },
  ],
  mapMark:66247,
  zones:[
    { price:71200, kind:'liquidation', label:'Short liquidation zone', note:'Full Rekt short side · $54M at risk' },
    { price:64950, kind:'pain', label:'Rising Money pain zone', note:'$28M underwater · nearby' },
    { price:63950, kind:'liquidation-critical', label:'Full Rekt liquidation zone', note:'$96M · very close to current price' },
  ],
  matrix:[
    { label:'Liq pressure', side:'Long', sideColor:'var(--regime-up-mid)', cells:[ {sev:'watch',vulnerable:'$8M',underwater:'12%',wallets:'48 w'},{sev:'elevated',vulnerable:'$22M',underwater:'18%',wallets:'46 w'},{sev:'watch',vulnerable:'$14M',underwater:'24%',wallets:'320 w'},{sev:'critical',vulnerable:'$96M',underwater:'74%',wallets:'1716 w'} ] },
    { label:'PnL pain', side:'Long', sideColor:'var(--regime-up-mid)', cells:[ {sev:'normal'},{sev:'elevated',vulnerable:'$28M',underwater:'22%',wallets:'30 w'},{sev:'watch',vulnerable:'$22M',underwater:'34%',wallets:'540 w'},{sev:'critical',vulnerable:'$71M',underwater:'74%',wallets:'1716 w'} ] },
    { label:'Liq pressure', side:'Short', sideColor:'var(--regime-down-mid)', cells:[ {sev:'normal'},{sev:'watch',vulnerable:'$4M',underwater:'6%',wallets:'12 w'},{sev:'normal'},{sev:'elevated',vulnerable:'$38M',underwater:'48%',wallets:'620 w'} ] },
  ]
};
function arxSignalsFor(m){
  if(!m||typeof m.price!=='number') return null;
  const clone=(o)=>JSON.parse(JSON.stringify(o));
  const sym=m.sym||'', P=m.price, bull=(m.deltaPct||0)>=0, h=ivHash(sym), h2=ivHash(sym+'~'), oi=ivParseUsd(m.oi);
  const bi=(bull?1:-1)*Math.round(14+h*44);
  const idx=bi<=-60?0:bi<=-20?1:bi<20?2:bi<60?3:4;
  const bucket=bi<=-60?'Very Bearish':bi<=-20?'Bearish':bi<20?(bi<=-10?'Indecisive, leaning Bearish':bi>=10?'Indecisive, leaning Bullish':'Indecisive'):bi<60?'Bullish':'Very Bullish';
  const dir=bull?'bullish':'bearish', Side=bull?'Long':'Short';
  const mult=1.4+h*2.3, curFlow=oi*(0.012+h*0.018), normFlow=curFlow/mult, vuln=oi*(0.05+h2*0.05), profitV=oi*(0.04+h2*0.05);
  const dist=(c)=>(Math.abs(c/P-1)*100).toFixed(1)+'%';
  const eEntry=P*(bull?0.977:1.013), eForcedDn=P*(bull?0.949:0.951), pProfit=P*(bull?1.035:0.965), eForcedUp=P*1.056;
  const rp=(p)=> p>=1000?Math.round(p): p>=10? +p.toFixed(1): +p.toFixed(2);
  const bias=clone(BIAS_FB);
  bias.bucket=bucket; bias.activeIdx=idx; bias.deltaPts=Math.abs(Math.round(4+h2*9)); bias.deltaDir=dir;
  bias.plainRead= bull?'Long-side pressure has increased, but overall positioning has not left the neutral band.':'Short-side pressure has increased; positioning is leaning bearish.';
  const flow=clone(FLOW_FB);
  flow.current.state= mult>=2?'rising':'above';
  flow.current.currentNotional=(bull?'+':'−')+ivUsd(curFlow);
  flow.current.baselineNotional=(bull?'+':'−')+ivUsd(normFlow);
  flow.current.multiple=mult.toFixed(1);
  const walls=clone(WALLS_FB), kw=walls.keyWalls;
  kw[0].center=rp(eEntry); kw[0].priceLow=rp(eEntry*0.998); kw[0].priceHigh=rp(eEntry*1.002); kw[0].distance=dist(eEntry); kw[0].value=ivUsd(oi*0.17)+' entry value';
  kw[1].center=rp(eForcedDn); kw[1].priceLow=rp(eForcedDn*0.998); kw[1].priceHigh=rp(eForcedDn*1.002); kw[1].distance=dist(eForcedDn); kw[1].value=ivUsd(vuln)+' at risk in this wall'; kw[1].cumulativeValue=ivUsd(vuln*3.3)+' cumulative risk to this level';
  kw[2].center=rp(pProfit); kw[2].priceLow=rp(pProfit*0.998); kw[2].priceHigh=rp(pProfit*1.002); kw[2].distance=dist(pProfit); kw[2].value=ivUsd(profitV)+' profitable exposure';
  walls.mapMark={price:rp(P), changePct:(bull?'+':'−')+Math.abs(m.deltaPct||0).toFixed(2)+'%'};
  walls.mapWalls[0].center=rp(eForcedUp); walls.mapWalls[0].distance=dist(eForcedUp); walls.mapWalls[0].value=ivUsd(oi*0.045)+' at risk';
  walls.mapWalls[1].center=rp(pProfit); walls.mapWalls[1].distance=dist(pProfit); walls.mapWalls[1].value=ivUsd(profitV);
  walls.mapWalls[2].center=rp(eEntry); walls.mapWalls[2].distance=dist(eEntry); walls.mapWalls[2].value=ivUsd(oi*0.17);
  walls.mapWalls[3].center=rp(eForcedDn); walls.mapWalls[3].distance=dist(eForcedDn); walls.mapWalls[3].value=ivUsd(vuln)+' at risk';
  const stress=clone(STRESS_FB);
  stress.read.side=Side; stress.read.vulnerable=ivUsd(vuln);
  stress.driverCards[0].notional=ivUsd(vuln)+' vulnerable';
  stress.driverCards[1].notional=ivUsd(vuln*0.74)+' underwater';
  stress.driverCards[2].notional=ivUsd(vuln)+' within band';
  stress.mapMark=rp(P);
  stress.zones=[
    { price:rp(eForcedUp), kind:'liquidation', label:(Side==='Long'?'Short':'Long')+' liquidation zone', note:'opposite side · '+ivUsd(oi*0.045)+' at risk' },
    { price:rp(P*(bull?0.98:1.02)), kind:'pain', label:'Rising Money pain zone', note:ivUsd(vuln*0.3)+' underwater · nearby' },
    { price:rp(eForcedDn), kind:'liquidation-critical', label:'Crowd liquidation zone', note:ivUsd(vuln)+' · very close to current price' },
  ];
  return { bias, flow, walls, stress, _meta:{ bull, bi, mult, vuln, oi, dir, sentiment: Math.round((bi+100)/2) } };
}

/* ─── Bias tab ─── */
function InstrumentBiasTab({ sig }) {
  const d = (sig && sig.bias) || BIAS_FB;
  return (
    <div>
      <SectionLabel>SIG-I01 · Position Bias</SectionLabel>
      <BiasCurrentState bucket={d.bucket} plainRead={d.plainRead} activeIdx={d.activeIdx} deltaPts={d.deltaPts} deltaDir={d.deltaDir}/>
      <ModuleSpacer/>
      <BiasTrend data={d.trend.data} lines={d.trend.lines}/>
      <ModuleSpacer/>
      <BiasDrivers direct={d.drivers.direct} overlays={d.drivers.overlays} summary={d.drivers.summary}/>
      <ModuleSpacer/>
      <div style={{padding:'0 20px 8px'}}>
        <div style={{
          font:'600 11px var(--font-body)', color:'var(--text-tertiary)',
          letterSpacing:'.08em', textTransform:'uppercase'
        }}>Cohort Bias Cards · 4h</div>
      </div>
      <CohortBiasGrid cards={d.cohorts}/>
      <DisclaimerFooter text="Bias describes positioning balance. It does not estimate future return. Stronger bias is not safer."/>
    </div>
  );
}

/* ─── Flow tab ─── */
function InstrumentFlowTab({ sig }) {
  const d = (sig && sig.flow) || FLOW_FB;
  return (
    <div>
      <SectionLabel>SIG-I02 · Flow Momentum</SectionLabel>
      <CurrentFlow
        state={d.current.state}
        currentNotional={d.current.currentNotional}
        baselineNotional={d.current.baselineNotional}
        multiple={d.current.multiple}
        walletCount={d.current.walletCount}
        topShare={d.current.topShare}
        dominantCohort={d.current.dominantCohort}
      />
      <ModuleSpacer/>
      <FlowByWindow tiles={d.byWindow}/>
      <ModuleSpacer/>
      <TopFlowDrivers drivers={d.topDrivers}/>
      <ModuleSpacer/>
      <CohortFlowBreakdown rows={d.cohortBreakdown}/>
      <DisclaimerFooter text="Flow shows what high-quality wallets did, not what price will do next. Whale-led flow can be concentrated in one actor."/>
    </div>
  );
}

/* ─── Walls tab (SIG-I03 Entry & Risk Walls) ─── */
function InstrumentWallsTab({ sig }) {
  const d = (sig && sig.walls) || WALLS_FB;
  return (
    <div>
      <SectionLabel>SIG-I03 · Entry & Risk Walls</SectionLabel>
      <KeyWalls walls={d.keyWalls}/>
      <ModuleSpacer/>
      <CenteredPriceMap mark={d.mapMark} walls={d.mapWalls}/>
      <DisclaimerFooter text="Entry Wall does not mean price will bounce. Forced-Exit Wall does not mean liquidation will happen. Possible Profit-Taking Area is inferred from prior reductions."/>
    </div>
  );
}

/* ─── Stress tab ─── */
function InstrumentStressTab({ sig }) {
  const d = (sig && sig.stress) || STRESS_FB;
  return (
    <div>
      <SectionLabel>SIG-I04 · Liquidation & PnL Stress</SectionLabel>
      <StressRead state={d.read.state} stateTone={d.read.stateTone} side={d.read.side} reasons={d.read.reasons} vulnerable={d.read.vulnerable} wallets={d.read.wallets}/>
      <ModuleSpacer/>
      <StressDriverCards cards={d.driverCards}/>
      <ModuleSpacer/>
      <RiskZoneMap mark={d.mapMark} zones={d.zones}/>
      <ModuleSpacer/>
      <StressDetailMatrix rows={d.matrix}/>
      <DisclaimerFooter text="Stress measures crowding, PnL pain, and distance to liquidation separately. Not all stressed wallets liquidate."/>
    </div>
  );
}

/* ─── Plain-language group header for the merged instrument tabs (replaces SIG-code labels). ─── */
function IvGroupHead({ title, sub }) {
  return (
    <div style={{padding:'20px 20px 10px'}}>
      <div style={{font:'800 18px var(--font-brand)', color:'var(--text-primary)', letterSpacing:'-.015em'}}>{title}</div>
      {sub && <div style={{font:'400 12px var(--font-body)', color:'var(--text-tertiary)', marginTop:3, lineHeight:1.4}}>{sub}</div>}
    </div>
  );
}

/* ─── Direction tab — open positioning (who's in, which way) + money flow (what's moving now).
   Merges the old Bias + Flow signals into one "which way, and is it fresh?" story. ─── */
function InstrumentDirectionTab({ sig }) {
  const b = (sig && sig.bias) || BIAS_FB;
  const f = (sig && sig.flow) || FLOW_FB;
  return (
    <div>
      <IvGroupHead title="Positioning" sub="Open positions right now — who's in, and which way, by cohort."/>
      <BiasCurrentState bucket={b.bucket} plainRead={b.plainRead} activeIdx={b.activeIdx} deltaPts={b.deltaPts} deltaDir={b.deltaDir}/>
      <ModuleSpacer/>
      <CohortBiasGrid cards={b.cohorts}/>
      <ModuleSpacer/>
      <BiasTrend data={b.trend.data} lines={b.trend.lines}/>
      <ModuleSpacer/>
      <BiasDrivers direct={b.drivers.direct} overlays={b.drivers.overlays} summary={b.drivers.summary}/>

      <IvGroupHead title="Money flow" sub="Positions opened and closed lately — is the move fresh, or fading?"/>
      <CurrentFlow state={f.current.state} currentNotional={f.current.currentNotional} baselineNotional={f.current.baselineNotional} multiple={f.current.multiple} walletCount={f.current.walletCount} topShare={f.current.topShare} dominantCohort={f.current.dominantCohort}/>
      <ModuleSpacer/>
      <FlowByWindow tiles={f.byWindow}/>
      <ModuleSpacer/>
      <CohortFlowBreakdown rows={f.cohortBreakdown}/>
      <DisclaimerFooter text="Positioning and flow describe what wallets did, not what price will do next. Stronger positioning is not safer; whale-led flow can sit in one actor."/>
    </div>
  );
}

/* ─── Risk tab — the price levels where positions cluster (entry support, profit-taking,
   forced-exit zones) + who's crowded / underwater / near liquidation.
   Merges the old Walls + Stress signals — this is the tab that sets a stop and a target. ─── */
function InstrumentRiskTab({ sig }) {
  const w = (sig && sig.walls) || WALLS_FB;
  const s = (sig && sig.stress) || STRESS_FB;
  return (
    <div>
      <IvGroupHead title="Price levels" sub="Where positions cluster — entry support, profit-taking, and the forced-exit zones that set your stop and target."/>
      <KeyWalls walls={w.keyWalls}/>
      <ModuleSpacer/>
      <CenteredPriceMap mark={w.mapMark} walls={w.mapWalls}/>

      <IvGroupHead title="Who's exposed" sub="Crowding, underwater PnL, and distance to a forced exit — the risk if you're on the crowded side."/>
      <StressRead state={s.read.state} stateTone={s.read.stateTone} side={s.read.side} reasons={s.read.reasons} vulnerable={s.read.vulnerable} wallets={s.read.wallets}/>
      <ModuleSpacer/>
      <StressDriverCards cards={s.driverCards}/>
      <ModuleSpacer/>
      <StressDetailMatrix rows={s.matrix}/>
      <DisclaimerFooter text="Entry support doesn't mean price will bounce; a forced-exit zone doesn't mean liquidation will happen. Profit-taking areas are inferred from prior reductions. Not all stressed wallets liquidate."/>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Compact instrument-detail tab modules — faithful port of
   "Instrument Detail - Mockup.html" (Positioning · Flow · Risk · Wallets · Info)
   ════════════════════════════════════════════════════════════════════ */
const IV_CARD = { background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:16, padding:'14px 15px' };
const IV_WARN = '#E7B24C';

function IdSecHead({ title, src }) {
  return (
    <div style={{display:'flex', alignItems:'baseline', gap:8, margin:'0 0 9px'}}>
      <h3 style={{font:'700 12px var(--font-body)', letterSpacing:'.02em', color:'var(--text-primary)'}}>{title}</h3>
      {src && <span style={{font:'500 9px var(--font-mono)', color:'var(--text-tertiary)', marginLeft:'auto'}}>{src}</span>}
    </div>
  );
}

function IdDisclosure({ rows }) {
  const [open, setOpen] = vUS(false);
  return (
    <div>
      <button onClick={()=>setOpen(o=>!o)} style={{font:'600 10px var(--font-body)', color:'var(--color-violet-300)', background:'none', border:'none', cursor:'pointer', padding:'8px 0 0', display:'flex', alignItems:'center', gap:4}}>{open?'Hide figures ▴':'Exact figures ▾'}</button>
      {open && <div style={{marginTop:10, paddingTop:11, borderTop:'1px dashed var(--border-strong)', font:'500 11px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.6}}>
        {rows.map((r,i)=>(<div key={i} style={{display:'flex', justifyContent:'space-between', padding:'2px 0'}}><span>{r[0]}</span><span className="num" style={{font:'600 11px var(--font-mono)', color:'var(--text-primary)'}}>{r[1]}</span></div>))}
      </div>}
    </div>
  );
}

/* ─── Positioning · SIG-I01 cohort bias matrix ─── */
function IdPositioning({ m }) {
  const rows = [
    ['Smart Money','broad',42,'58% S','un'],
    ['Whale Moves','narrow',29,'71% S','un'],
    ['Rising Money','mixed',54,'54% L','no'],
    ['Rekt Crowd','crowded',78,'78% L','un'],
    ['Overall','universe',63,'63% L','no'],
  ];
  return (
    <div style={{padding:'18px 16px 0'}}>
      <IdSecHead title="Cohort bias" src="S01"/>
      <div style={IV_CARD}>
        <div style={{display:'flex', justifyContent:'space-between', font:'600 8.5px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em', paddingBottom:4}}><span>Short</span><span>Long</span></div>
        {rows.map((r,i)=>{ const [nm,q,lng,pct,sk]=r; const isShort=String(pct).includes('S');
          return (
            <div key={nm} style={{display:'flex', alignItems:'center', gap:9, padding:'11px 0', borderTop:i?'.5px solid var(--border-default)':'none'}}>
              <div style={{width:70, flexShrink:0}}><div style={{font:'600 11.5px var(--font-body)'}}>{nm}</div><div style={{font:'500 8.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>{q}</div></div>
              <div style={{flex:1, height:18, borderRadius:5, overflow:'hidden', display:'flex', background:'var(--regime-down-mid)'}}><div style={{background:'var(--regime-up-mid)', height:'100%', width:lng+'%'}}/></div>
              <div className="num" style={{font:'700 11px var(--font-mono)', width:44, textAlign:'right', flexShrink:0, color:isShort?'var(--regime-down-mid)':'var(--regime-up-mid)'}}>{pct}</div>
              <div style={{font:'600 8.5px var(--font-body)', width:52, textAlign:'right', flexShrink:0, color:sk==='un'?IV_WARN:'var(--text-tertiary)'}}>{sk==='un'?('unusual '+(isShort?'S':'L')):'normal'}</div>
            </div>
          );
        })}
        <IdDisclosure rows={[['Smart Money short notional','$48.2M'],['Top-wallet share (lead side)','14%'],['Normal-bias band (p25–p75)','44–56% L'],['Wallets in cohort','312']]}/>
      </div>
      <DisclaimerFooter text="Bias describes positioning balance. It does not estimate future return. Stronger bias is not safer."/>
    </div>
  );
}

/* ─── Flow · SIG-I02 momentum grid ─── */
function IdFlow({ sf }) {
  const mult = (sf && sf.multiple) || '2.4';
  const grid = [['Smart','rise','rise','flat'],['Whale','rise','flat','flat'],['Crowd','fade','fade','rise']];
  const arrow = { rise:'↑', fade:'↓', flat:'≈' };
  const tone = { rise:['var(--regime-up-mid)','rgba(45,212,155,.14)'], fade:['var(--regime-down-mid)','rgba(242,106,106,.14)'], flat:['var(--text-tertiary)','rgba(255,255,255,.06)'] };
  return (
    <div style={{padding:'18px 16px 0'}}>
      <IdSecHead title="Flow momentum" src="S02"/>
      <div style={IV_CARD}>
        <div style={{display:'grid', gridTemplateColumns:'1fr auto auto auto', gap:'8px 6px', alignItems:'center'}}>
          {['Cohort','1H','4H','24H'].map((h,i)=>(<div key={h} style={{font:'600 8.5px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.04em', textAlign:i?'center':'left'}}>{h}</div>))}
          {grid.map(row=>(<React.Fragment key={row[0]}>
            <div style={{font:'600 11px var(--font-body)'}}>{row[0]}</div>
            {[1,2,3].map(j=>{ const st=row[j]; return <div key={j} className="num" style={{font:'700 10px var(--font-mono)', padding:'3px 7px', borderRadius:6, textAlign:'center', minWidth:30, color:tone[st][0], background:tone[st][1]}}>{arrow[st]}</div>; })}
          </React.Fragment>))}
        </div>
        <div style={{marginTop:11, font:'500 11px var(--font-body)', color:'var(--text-secondary)', background:'rgba(124,91,255,.08)', border:'.5px solid rgba(124,91,255,.2)', borderRadius:9, padding:'8px 11px', lineHeight:1.5}}>Short flow is <b style={{color:'var(--color-violet-300)'}}>{mult}× normal</b> — driven by <b style={{color:'var(--color-violet-300)'}}>Smart Money (61% of net flow)</b>, accelerating in the last hour.</div>
      </div>
      <DisclaimerFooter text="Flow shows what high-quality wallets did, not what price will do next. Whale-led flow can be concentrated in one actor."/>
    </div>
  );
}

/* ─── Risk · SIG-I03 walls + SIG-I04 stress (merged) ─── */
function IdRisk({ m }) {
  const P = m.price || 0;
  const money = (n)=> n>=1000 ? '$'+Math.round(n).toLocaleString() : '$'+n.toFixed(2);
  const ladder = [
    [money(P*1.03),'up',26,'thin'],
    [money(P*1.009),'up',52,'entry wall · +0.4 NDM'],
    [money(P),'mark',0,'◀ mark'],
    [money(P*0.963),'dn',88,'forced-exit · liq cluster · −1.2 NDM'],
    [money(P*0.92),'warn',44,'profit-taking · −2.6 NDM'],
  ];
  const lcol = { up:'var(--regime-up-mid)', dn:'var(--regime-down-mid)', warn:IV_WARN, mark:'var(--color-violet-300)' };
  const walls = [
    ['var(--regime-up-mid)','Entry wall','Smart + Rising · accumulation','+0.4',money(P*1.009),'var(--regime-up-mid)'],
    ['var(--regime-down-mid)','Forced-exit wall','Rekt Crowd longs · liquidation','−1.2',money(P*0.963),'var(--regime-down-mid)'],
    [IV_WARN,'Profit-taking area','Whale shorts · likely cover','−2.6',money(P*0.92),IV_WARN],
  ];
  return (
    <div style={{padding:'18px 16px 0'}}>
      <IdSecHead title="Liquidation & wall map" src="S03 + S04"/>
      <div style={IV_CARD}>
        <div style={{display:'flex', flexDirection:'column', gap:5, marginBottom:12, paddingBottom:12, borderBottom:'.5px solid var(--border-default)'}}>
          <div style={{font:'600 8.5px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:3}}>{`clustered value by price · mark ${money(P)}`}</div>
          {ladder.map((r,i)=>{ const [lp,ty,w,ll]=r; const mark=ty==='mark';
            return (
              <div key={i} style={{display:'flex', alignItems:'center', gap:8, height:mark?22:17, borderTop:mark?'1px dashed rgba(124,91,255,.55)':'none', borderBottom:mark?'1px dashed rgba(124,91,255,.55)':'none'}}>
                <span className="num" style={{font:'600 9.5px var(--font-mono)', color:mark?'var(--color-violet-300)':'var(--text-tertiary)', width:46, flexShrink:0, textAlign:'right'}}>{lp}</span>
                {w>0 && <div style={{height:11, borderRadius:3, minWidth:3, background:lcol[ty], width:w+'%'}}/>}
                <span style={{font:'600 8.5px var(--font-body)', color:mark?'var(--color-violet-300)':'var(--text-secondary)', whiteSpace:'nowrap'}}>{ll}</span>
              </div>
            );
          })}
        </div>
        {walls.map((w,i)=>(
          <div key={i} style={{display:'flex', alignItems:'center', gap:11, padding:'10px 0', borderTop:i?'.5px solid var(--border-default)':'none'}}>
            <div style={{width:8, height:8, borderRadius:'50%', flexShrink:0, background:w[0]}}/>
            <div style={{flex:1}}><div style={{font:'600 11.5px var(--font-body)'}}>{w[1]}{i===2 && <span style={{font:'8px', color:'var(--text-tertiary)', marginLeft:5}}>inferred</span>}</div><div style={{font:'500 9.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>{w[2]}</div></div>
            <div className="num" style={{font:'700 11px var(--font-mono)', textAlign:'right', color:w[5]}}>{w[3]}<div style={{font:'500 8.5px var(--font-body)', color:'var(--text-tertiary)'}}>daily moves ({w[4]})</div></div>
          </div>
        ))}
      </div>

      <div style={{height:14}}/>
      <IdSecHead title="Liquidation & PnL stress" src="S04"/>
      <div style={IV_CARD}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <span style={{font:'700 13px var(--font-body)', color:'var(--regime-down-mid)'}}>⚠ Elevated</span>
          <span style={{font:'600 10px var(--font-body)', color:'var(--text-tertiary)'}}>stressed side · LONG</span>
        </div>
        <div style={{height:8, borderRadius:5, background:'var(--glass-control-bg-strong)', overflow:'hidden', margin:'10px 0 8px'}}>
          <div style={{height:'100%', width:'68%', borderRadius:5, background:`linear-gradient(90deg, ${IV_WARN}, var(--regime-down-mid))`}}/>
        </div>
        <div style={{display:'flex', gap:6, flexWrap:'wrap', marginTop:9}}>
          {['Crowded longs','Underwater 41%','Near liquidation'].map(t=>(<span key={t} style={{font:'600 9.5px var(--font-body)', padding:'4px 9px', borderRadius:999, background:'rgba(242,106,106,.14)', color:'var(--regime-down-mid)'}}>{t}</span>))}
        </div>
        <IdDisclosure rows={[['Vulnerable notional (long)','$112M'],['Underwater share','41%'],['Risk-zone distance','−1.2 NDM'],['Affected wallets','1,840']]}/>
      </div>
      <DisclaimerFooter text="Entry walls do not guarantee a bounce; forced-exit walls do not guarantee liquidation. Stress measures crowding, PnL pain, and distance to liquidation separately."/>
    </div>
  );
}

/* ─── Wallets · bridge to S7 + event timeline ─── */
function IdWallets({ pro }) {
  const wallets = [
    ['0x7a','whale.lens','Whale Moves · entry −2.1 NDM · liq far','SHORT','s',false],
    ['0x3f','Smart · alpha-7','Smart Money · large exposure · low risk','SHORT','s',false],
    ['0xc2','degen.404','Rekt Crowd · underwater · near liq ⚠','LONG','l',true],
  ];
  const events = [
    ['2m','hi','Stress → Elevated (long)','underwater share crossed 40%'],
    ['38m','md','Smart Money flow flipped short','1h flow 2.4× normal'],
    ['3h','lo','Forced-exit wall formed −1.2 NDM','crowd longs clustering'],
  ];
  const sevCol = { hi:'var(--regime-down-mid)', md:IV_WARN, lo:'var(--text-tertiary)' };
  const openWallet = (i)=>{ try { if (typeof WALLETS!=='undefined' && WALLETS.length) window.__arxOpenSub && window.__arxOpenSub('walletDetail', { w: WALLETS[i%WALLETS.length] }); } catch(e){} };
  return (
    <div style={{padding:'18px 16px 0'}}>
      <IdSecHead title="Wallets behind the read" src="bridge → S7"/>
      <div style={IV_CARD}>
        {wallets.filter(w=>pro||!w[5]).map((w,i)=>{
          const wo = (window.WALLETS && window.WALLETS.length) ? window.WALLETS[i%window.WALLETS.length] : null;
          return (
          <div key={w[0]} onClick={()=>openWallet(i)} className="arx-row-press" style={{display:'flex', alignItems:'center', gap:11, padding:'11px 0', borderTop:i?'.5px solid var(--border-default)':'none', cursor:'pointer'}}>
            {(typeof WalletAvatar!=='undefined' && wo)
              ? <WalletAvatar w={wo} size={32}/>
              : <div className="num" style={{width:32, height:32, borderRadius:9, background:'var(--glass-control-bg-strong)', display:'grid', placeItems:'center', font:'700 11px var(--font-mono)', color:'var(--color-violet-300)', flexShrink:0}}>{w[0]}</div>}
            <div style={{flex:1, minWidth:0}}><div style={{font:'600 12px var(--font-body)'}}>{w[1]}</div><div style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>{w[2]}</div></div>
            <span style={{font:'700 8.5px var(--font-body)', padding:'3px 7px', borderRadius:6, background:w[4]==='s'?'rgba(242,106,106,.14)':'rgba(45,212,155,.14)', color:w[4]==='s'?'var(--regime-down-mid)':'var(--regime-up-mid)'}}>{w[3]}</span>
          </div>); })}
      </div>

      {pro && <React.Fragment>
        <div style={{height:14}}/>
        <IdSecHead title="What changed" src="EV-I01–04"/>
        <div style={IV_CARD}>
          {events.map((e,i)=>(
            <div key={i} style={{display:'flex', gap:11, padding:'9px 0', borderTop:i?'.5px solid var(--border-default)':'none'}}>
              <div className="num" style={{font:'600 10px var(--font-mono)', color:'var(--text-tertiary)', width:38, flexShrink:0, paddingTop:1}}>{e[0]}</div>
              <div style={{width:6, borderRadius:3, flexShrink:0, background:sevCol[e[1]]}}/>
              <div style={{flex:1}}><div style={{font:'600 11.5px var(--font-body)'}}>{e[2]}</div><div style={{font:'500 9.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>{e[3]}</div></div>
            </div>
          ))}
        </div>
      </React.Fragment>}
      <DisclaimerFooter text="Wallet aliases, sides, and distances are shown as bands. Tap a wallet to open its detail and review the evidence."/>
    </div>
  );
}

/* ─── Info · fundamentals (pending external feed) ─── */
function IdInfo({ m }) {
  const fields = [['Market cap','$92.1B'],['FDV','$112.4B'],['Next unlock','9 days · 1.4%','warn'],['Holders','1.2M']];
  return (
    <div style={{padding:'18px 16px 0'}}>
      <IdSecHead title={<span>Fundamentals <span style={{font:'600 8.5px var(--font-body)', color:'#fff', background:'var(--color-violet-500)', borderRadius:5, padding:'2px 6px', marginLeft:6}}>PENDING · §D</span></span>} src="new feed"/>
      <div style={{...IV_CARD, padding:'13px 14px'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'var(--border-default)', border:'.5px solid var(--border-default)', borderRadius:12, overflow:'hidden'}}>
          {fields.map((f,i)=>(
            <div key={i} style={{background:'var(--surface-elevated)', padding:'10px 12px'}}>
              <div style={{font:'600 8.5px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>{f[0]}</div>
              <div className="num" style={{font:'700 13px var(--font-mono)', marginTop:3, color:f[2]==='warn'?IV_WARN:'var(--text-primary)'}}>{f[1]}</div>
            </div>
          ))}
        </div>
      </div>
      <DisclaimerFooter text="Fundamentals are not in the Hyperliquid feed — sourced separately and shown as thin context. Per-asset-class fields vary."/>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   InstrumentLiqChart — Simple-mode native price chart with neutral
   liquidation walls (side fixed by region: below mark = long liqs,
   above = short liqs), Robinhood-style scrub-to-read, and a coordinated
   bottom drawer whose explanation is delivered as a Lucid card.
   (Pro mode renders TradingView instead — handled by the parent.)
   ════════════════════════════════════════════════════════════════════ */
const LIQ_COHORT = { Smart:'var(--color-violet-500)', Whale:'var(--color-violet-300)', Rising:'#5FA8C9', Rekt:'#9AA0B5' };

/* Real monthly closes (USD) for the crypto majors — the actual historic arc (≈2022→2024). Sliced/
   interpolated per timeframe and scaled so the series ends exactly at the instrument's live price. */
const BTC_MONTHLY = [46.2,38.5,43.2,45.5,37.6,31.8,19.0,23.3,20.0,19.4,20.5,17.2,16.5,23.1,23.1,28.5,29.2,27.2,30.5,29.2,25.9,27.0,34.7,37.7,42.3,42.6,61.2,71.3,60.6,67.5,62.7,64.6,58.1,63.0,66.8,69.0,68.24].map(v=>v*1000);
const ETH_MONTHLY = [3.68,2.69,2.92,2.82,1.94,1.07,1.68,1.55,1.33,1.57,1.30,1.20,1.57,1.64,1.60,1.87,1.91,1.85,1.93,1.71,1.67,1.67,2.05,2.29,2.39,3.34,3.55,3.01,3.81,3.45,3.16,2.69,2.51,2.43,3.20,3.51].map(v=>v*1000);
const SOL_MONTHLY = [170,98,84,131,42,33,40,31,33,33,32,11,10,16,22,21,24,20,27,24,18,23,38,60,96,102,118,178,202,150,135,143,145,158,176,214.6];
const ARX_HIST = { BTC:BTC_MONTHLY, ETH:ETH_MONTHLY, SOL:SOL_MONTHLY };
const ARX_TF_MONTHS = { '1D':1/22, '1W':0.25, '1M':1, '3M':3, '1Y':12, 'ALL':36 };
function arxHistSeries(sym, tf, P, N){
  N = N || 60;
  const months = ARX_TF_MONTHS[tf] || 1;
  const anchor = ARX_HIST[sym];
  let raw;
  if (anchor){
    const span = Math.max(2, Math.min(anchor.length, Math.round(months)+1));
    const seg = anchor.slice(anchor.length - span);
    raw = [];
    for (let i=0;i<N;i++){ const t=i/(N-1)*(seg.length-1), a=Math.floor(t), b=Math.min(seg.length-1,a+1), f=t-a; raw.push(seg[a]*(1-f)+seg[b]*f); }
  } else {
    let s=String(sym+tf).split('').reduce((x,c)=>x+c.charCodeAt(0),7)%99991||13;
    const r=()=>{s=(s*9301+49297)%233280; return s/233280;};
    const vol = months>=12?0.06:months>=3?0.035:months>=1?0.02:0.008;
    raw=[]; let p=1; for(let i=0;i<N;i++){ p*=1+(r()-0.485)*vol; raw.push(p); }
  }
  // fine intra-period jitter so resampled monthly segments don't read as straight lines
  let s2=String(sym+tf+'~').split('').reduce((x,c)=>x+c.charCodeAt(0),11)%99991||17;
  const rn=()=>{s2=(s2*9301+49297)%233280; return s2/233280;};
  const jit = months>=12?0.010:months>=3?0.014:months>=1?0.013:months>=0.25?0.009:0.005;
  raw = raw.map(v=> v*(1+(rn()-0.5)*jit));
  const k = P/(raw[raw.length-1]||1);
  const out = raw.map(v=> v*k);
  out[out.length-1] = P;
  return out;
}
function InstrumentLiqChart({ m, pos, liqOn = false, setLiqOn = null, big = false, livePrice = null }) {
  const sym = m.sym || '—';
  const P = m.price || 100;
  const LP = livePrice || P;   // live last price — synced with the hero above, keeps ticking
  const pfmt = (v)=> v.toLocaleString(undefined,{minimumFractionDigits:P<10?3:(P<1000?2:0), maximumFractionDigits:P<10?3:(P<1000?2:0)});
  const N=64, W=344;
  const padR = 46;                                 // right gutter = the PRICE axis (y-labels + LAST tag)
  const plotW = W - padR;                          // price line/area/scrub use the full plot width
  const padT = 14, padB = 22;                      // padB = bottom band reserved for the time axis
  const priceH = big ? 430 : 204;

  const [tf,setTf]=vUS('1D');                       // default interval — 1D (Robinhood / Coinbase convention)
  const [sel,setSel]=vUS(null);
  const [scrub,setScrub]=vUS(null);
  const [full,setFull]=vUS(false);
  const wrapRef = vUR(null);

  // ── price series — REAL historic data for BTC/ETH/SOL (scaled to the live price); seeded-realistic otherwise ──
  const series = (typeof arxHistSeries!=='undefined') ? arxHistSeries(sym, tf, P, N) : (()=>{ const a=[]; for(let i=0;i<N;i++) a.push(P*(0.97+0.03*i/(N-1))); a[N-1]=P; return a; })();
  const open = series[0];                           // period open → the dashed baseline reference
  const sLo=Math.min.apply(null,series), sHi=Math.max.apply(null,series);

  // ── liquidation walls — a NEAR-price read; only shown on the short ranges (1D · 1W) ──
  const nearTf = (tf==='1D' || tf==='1W');
  const wallsOn = liqOn && nearTf;
  const wSeed = String(sym).split('').reduce((a,c)=>a+c.charCodeAt(0),11)%97 || 7;
  const PCTS = [4.5,3.6,2.8,2.0,1.2,0.5,-0.5,-1.2,-2.0,-2.8,-3.6,-4.5];
  const mkComp = (side,dist)=>{ const rekt=Math.min(74, Math.round(28+dist*6+(side==='L'?10:0))); const smart=Math.max(8,Math.round(34-dist*3)); const whale=Math.max(4,Math.round(15-dist*1.6)); const rising=Math.max(6,100-rekt-smart-whale); return [['Smart',smart],['Whale',whale],['Rising',rising],['Rekt',rekt]]; };
  const ZONE_HALF=0.3;
  const walls = PCTS.map((pct,i)=>{ const side=pct>=0?'S':'L'; const dist=Math.abs(pct); const bell=Math.exp(-Math.pow((dist-2.1)/1.9,2)); const jit=0.62+((wSeed*(i+5))%50)/50*0.95; const usd=Math.max(9, Math.round(150*bell*jit)); return { id:(side==='S'?'s':'l')+i, side, pct, usd, price:LP*(1+pct/100), priceHi:LP*(1+(pct+ZONE_HALF)/100), priceLo:LP*(1+(pct-ZONE_HALF)/100), comp:mkComp(side,dist) }; });
  const maxUsd = Math.max.apply(null, walls.map(w=>w.usd));
  const largest = maxUsd;
  const keyWall = walls.reduce((a,b)=> b.usd>a.usd ? b : a, walls[0]);
  const sideCol = (w)=> w.side==='L' ? 'var(--regime-up-mid)' : 'var(--regime-down-mid)';
  const distLabel = (w)=> (w.pct>=0?'+':'−')+Math.abs(w.pct).toFixed(1)+'%';
  const selWall = walls.find(w=>w.id===sel);

  // ── price-axis domain — frames the real data; widened to include the ±5% wall band when walls show ──
  const dLo = wallsOn ? Math.min(sLo, LP*0.952) : sLo;
  const dHi = wallsOn ? Math.max(sHi, LP*1.048) : sHi;
  const padv = (dHi-dLo)*0.06 || P*0.02;
  const MIN = dLo - padv, MAX = dHi + padv;
  const y = v => padT + (1-(v-MIN)/(MAX-MIN))*(priceH-padT-padB);
  const lx = i => i*(plotW/(N-1));
  const yTicks = (typeof arxNiceTicks!=='undefined' ? arxNiceTicks(MIN, MAX, 4) : [MIN,(MIN+MAX)/2,MAX]);
  // side-wall (volume-profile) geometry — bars anchored to the price axis (x=plotW), grow LEFT, length ∝ notional
  const wallMaxLen = plotW*0.42, wallThick = big ? 13 : 9;
  const rowH = Math.max(big?18:14, (priceH-padT-padB)/13);

  const idxFromX = (clientX)=>{ const el=wrapRef.current; if(!el) return null; const rect=el.getBoundingClientRect(); const xv=((clientX-rect.left)/rect.width)*W; return Math.max(0,Math.min(N-1, Math.round(Math.min(xv,plotW)/plotW*(N-1)))); };
  const onDown=(e)=>{ const i=idxFromX(e.clientX); if(i!=null){ setScrub(i); if(e.currentTarget.setPointerCapture && e.pointerId!=null) try{e.currentTarget.setPointerCapture(e.pointerId);}catch(_){} } };
  const onMove=(e)=>{ if(scrub==null) return; const i=idxFromX(e.clientX); if(i!=null) setScrub(i); };
  const onUp=()=>setScrub(null);

  const TFS=['1D','1W','1M','3M','1Y','ALL'];
  const axisTick=(frac)=> (typeof arxAxisLabel!=='undefined' ? arxAxisLabel(tf,frac) : '');
  const stamp=(frac)=> (typeof arxScrubStamp!=='undefined' ? arxScrubStamp(tf,frac) : '');

  const linePath = series.map((c,i)=>(i?'L':'M')+lx(i).toFixed(1)+' '+y(c).toFixed(1)).join(' ');
  const rekt = (w)=> (w.comp.find(c=>c[0]==='Rekt')||[null,0])[1];
  const sq   = (w)=> (w.comp.find(c=>c[0]==='Smart')||[null,0])[1] + (w.comp.find(c=>c[0]==='Whale')||[null,0])[1];
  const quality = (w)=> rekt(w)>=50 ? 'mostly Rekt Crowd, so likelier to break than hold'
                    : sq(w)>=42 ? 'quality-held, so more likely to defend' : 'a mixed crowd';
  const verdict = (w)=> w.side==='L' ? `A downside trigger, ${Math.abs(w.pct).toFixed(1)}% away.` : `An upside squeeze, ${Math.abs(w.pct).toFixed(1)}% away.`;
  const explain = (w)=> w.side==='L'
    ? `If ${sym} falls to $${pfmt(w.price)}, about $${w.usd}M of long bets get force-sold — which can speed up a drop. A stop sits safer below $${pfmt(w.price)} than inside the band. If buyers defend it, it can hold as support. It's ${quality(w)}.`
    : `If ${sym} rises to $${pfmt(w.price)}, about $${w.usd}M of short bets get force-bought — which can speed up a rally. A target before $${pfmt(w.price)} banks more than chasing through it. If sellers cap it, it can act as resistance. It's ${quality(w)}.`;
  const askLucid = (w)=>{ try{ window.__arxOpenLucid && window.__arxOpenLucid({ contextLabel:'On '+sym+'-PERP · $'+pfmt(w.price)+' liquidation wall', intro:{ action: verdict(w), body: explain(w)+' I can break down who is stacked there, how reachable it is, or what a break would do.' }, chips:[] }); }catch(e){} };

  const expandIcon = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>;
  const px = scrub!=null ? series[scrub] : null;

  const chart = (
    <div style={{margin: big ? '0' : '2px 16px 0'}}>
      <div style={{borderRadius:big?14:12, overflow:'hidden', background:big?'var(--surface-elevated)':'transparent', border:big?'.5px solid var(--border-default)':'none'}}>
        {/* ── PRICE PLOT (full width · gridlines + right price axis + open baseline · price-aligned wall profile on the right) ── */}
        <div ref={wrapRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
          style={{position:'relative', touchAction:'none', cursor:'crosshair'}}>
          <svg width="100%" viewBox={`0 0 ${W} ${priceH}`} preserveAspectRatio="none" style={{display:'block', height:priceH}}>
            <defs><linearGradient id="liqpf" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="rgba(124,91,255,.17)"/><stop offset="0.55" stopColor="rgba(124,91,255,.06)"/><stop offset="1" stopColor="rgba(124,91,255,0)"/></linearGradient></defs>
            {yTicks.map((v,i)=>(<line key={'g'+i} x1="0" x2={plotW} y1={y(v)} y2={y(v)} stroke="var(--border-default)" strokeWidth="1" opacity=".5"/>))}
            {/* price-aligned liquidation walls — volume-profile bars anchored to the price axis, growing LEFT */}
            {wallsOn && walls.map(w=>{ const len=Math.max(5, w.usd/maxUsd*wallMaxLen); const isSel=sel===w.id; const f=sideCol(w);
              return <rect key={w.id} x={plotW-len} y={y(w.price)-wallThick/2} width={len} height={wallThick} fill={f} opacity={isSel?0.85:(w.usd===largest?0.4:0.24)} rx="1.5"/>; })}
            {wallsOn && selWall && (()=>{ const zt=y(selWall.priceHi), zb=y(selWall.priceLo), f=sideCol(selWall); return (<g><rect x="0" y={zt} width={plotW} height={Math.max(4,zb-zt)} fill={f} opacity=".12"/><line x1="0" x2={plotW} y1={y(selWall.price)} y2={y(selWall.price)} stroke={f} strokeWidth="1" strokeDasharray="4 3" opacity=".7"/></g>); })()}
            <line x1="0" x2={plotW} y1={y(open)} y2={y(open)} stroke="var(--text-tertiary)" strokeWidth="1" strokeDasharray="2 3" opacity=".55"/>
            <path d={`${linePath} L ${plotW} ${priceH-padB} L 0 ${priceH-padB} Z`} fill="url(#liqpf)"/>
            <path d={linePath} fill="none" stroke="var(--color-violet-500)" strokeWidth="2"/>
            {scrub!=null && <line x1={lx(scrub)} x2={lx(scrub)} y1={padT-6} y2={priceH-padB+6} stroke="var(--color-violet-500)" strokeWidth="1" strokeDasharray="3 3" opacity=".6"/>}
            {scrub!=null
              ? <g><circle cx={lx(scrub)} cy={y(series[scrub])} r="4.5" fill="var(--color-violet-500)"/><circle cx={lx(scrub)} cy={y(series[scrub])} r="8" fill="none" stroke="var(--color-violet-300)" strokeWidth="1.2"/></g>
              : <g><circle r="7" fill="var(--color-violet-500)" opacity="0.16"><animateMotion dur="4s" repeatCount="indefinite" path={linePath}/></circle><circle r="3.5" fill="var(--color-violet-500)"><animateMotion dur="4s" repeatCount="indefinite" path={linePath}/></circle><circle cx={lx(N-1)} cy={y(LP)} r="2.5" fill="var(--color-violet-500)"/></g>}
            <line x1="0" x2={plotW} y1={y(LP)} y2={y(LP)} stroke="var(--color-violet-500)" strokeWidth="1.2" strokeDasharray="4 3"/>
          </svg>

          {/* y-axis price labels — right gutter (the price scale) */}
          {yTicks.map((v,i)=>(<span key={'yl'+i} className="num" style={{position:'absolute', right:3, top:y(v), transform:'translateY(-50%)', font:'500 8.5px var(--font-mono)', color:'var(--text-tertiary)', pointerEvents:'none', lineHeight:1}}>${pfmt(v)}</span>))}
          {/* LAST — colored tag on the price axis */}
          <span className="num" style={{position:'absolute', right:2, top:y(LP), transform:'translateY(-50%)', background:'var(--color-violet-500)', color:'#fff', font:'600 9px var(--font-mono)', padding:'2px 5px', borderRadius:5, pointerEvents:'none', boxShadow:'0 1px 4px rgba(84,54,217,.4)'}}>${pfmt(LP)}</span>
          {/* baseline tag — period open, left edge */}
          <span className="num" style={{position:'absolute', left:3, top:y(open), transform:'translateY(-50%)', font:'500 8px var(--font-mono)', color:'var(--text-tertiary)', background:big?'var(--surface-elevated)':'var(--surface-base)', padding:'0 3px', borderRadius:3, pointerEvents:'none'}}>open ${pfmt(open)}</span>

          {/* price-aligned wall affordances — direction labels + per-row tap targets (right side) */}
          {wallsOn && <React.Fragment>
            <span style={{position:'absolute', right:`${(padR/W*100).toFixed(1)}%`, top:padT-3, font:'700 7.5px var(--font-body)', letterSpacing:'.05em', textTransform:'uppercase', color:'var(--regime-down-mid)', pointerEvents:'none'}}>Short liqs ↑</span>
            <span style={{position:'absolute', right:`${(padR/W*100).toFixed(1)}%`, top:priceH-padB-9, font:'700 7.5px var(--font-body)', letterSpacing:'.05em', textTransform:'uppercase', color:'var(--regime-up-mid)', pointerEvents:'none'}}>Long liqs ↓</span>
            {walls.map(w=>(
              <button key={'wt'+w.id} onClick={()=>setSel(s=>s===w.id?null:w.id)} onPointerDown={(e)=>e.stopPropagation()} aria-label={'Liquidation wall '+distLabel(w)+', $'+w.usd+'M'} className="arx-press" style={{position:'absolute', right:`${(padR/W*100).toFixed(1)}%`, top:y(w.price)-rowH/2, width:`${(wallMaxLen/W*100).toFixed(1)}%`, height:rowH, background:'none', border:'none', padding:0, cursor:'pointer'}}/>
            ))}
            {walls.filter(w=> w.usd===largest || w.id===sel).map(w=>{ const len=Math.max(5, w.usd/maxUsd*wallMaxLen); return (
              <span key={'w$'+w.id} className="num" style={{position:'absolute', right:`${((padR+len+3)/W*100).toFixed(1)}%`, top:y(w.price), transform:'translateY(-50%)', font:`700 ${big?9.5:8}px var(--font-mono)`, color:sideCol(w), pointerEvents:'none', whiteSpace:'nowrap', textShadow:'0 0 3px var(--surface-base), 0 0 3px var(--surface-base)'}}>${w.usd}M</span>
            ); })}
          </React.Fragment>}

          {/* full-screen toggle (compact · resting only) */}
          {!big && scrub==null && <button onClick={()=>setFull(true)} onPointerDown={(e)=>e.stopPropagation()} aria-label="Full screen" className="arx-press"
            style={{position:'absolute', top:6, left:6, width:28, height:28, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'.5px solid var(--border-strong)', background:'var(--surface-elevated)', color:'var(--text-secondary)', boxShadow:'0 1px 4px rgba(0,0,0,.12)'}}>{expandIcon}</button>}

          {/* scrub readout — price · delta vs last · the moment */}
          {scrub!=null && (()=>{ const dv=px-P, dp=dv/P*100; return (
            <div style={{position:'absolute', left:6, top:6, padding:'6px 10px', borderRadius:10, background:'var(--surface-elevated)', border:'.5px solid var(--border-strong)', boxShadow:'0 2px 10px rgba(0,0,0,.14)', pointerEvents:'none'}}>
              <div className="num" style={{font:'700 15px var(--font-mono)', color:'var(--text-primary)', letterSpacing:'-.01em'}}>${pfmt(px)}</div>
              <div className="num" style={{marginTop:2, font:'700 10px var(--font-mono)', color: dp>=0?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{dp>=0?'+':'−'}${pfmt(Math.abs(dv))} <span style={{opacity:.92}}>({dp>=0?'+':'−'}{Math.abs(dp).toFixed(2)}%)</span></div>
              <div style={{marginTop:3, font:'500 8.5px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.02em'}}>{stamp(scrub/(N-1))}</div>
            </div>
          ); })()}

          {/* time axis */}
          {scrub==null && [0,1,2,3].map(i=>{ const frac=i/3; const tx = i===0?'0':(i===3?'-100%':'-50%'); return (
            <span key={'tx'+i} className="num" style={{position:'absolute', left:`${(frac*plotW/W*100).toFixed(2)}%`, bottom:5, transform:`translateX(${tx})`, font:'500 8.5px var(--font-mono)', color:'var(--text-tertiary)', whiteSpace:'nowrap', pointerEvents:'none'}}>{axisTick(frac)}</span>
          ); })}
          {scrub!=null && <span className="num" style={{position:'absolute', left:`${(lx(scrub)/W*100).toFixed(2)}%`, bottom:3, transform:'translateX(-50%)', font:'700 8.5px var(--font-mono)', color:'#fff', background:'var(--color-violet-500)', borderRadius:5, padding:'2px 6px', whiteSpace:'nowrap', pointerEvents:'none'}}>{axisTick(scrub/(N-1))}</span>}
        </div>
      </div>

      {/* interval — unified segmented control (matches the portfolio equity hero) */}
      {typeof TimeRangeTabs!=='undefined' && <div style={{marginTop:11}}><TimeRangeTabs value={tf} onChange={setTf} tabs={TFS} m="0"/></div>}

      {/* liquidation-walls toggle — iOS switch; the walls are a near-price read (1D · 1W) */}
      {setLiqOn && <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:12}}>
        <span style={{display:'inline-flex', alignItems:'center', gap:7, font:'600 12.5px var(--font-body)', color: liqOn?'var(--text-primary)':'var(--text-secondary)'}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="15" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="11" y2="17"/></svg>
          Liquidation walls
          {liqOn && !nearTf && <span style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)'}}>· shown on 1D · 1W</span>}
        </span>
        <button onClick={()=>{ const nv=!liqOn; setLiqOn(nv); if(nv && !nearTf) setTf('1D'); }} aria-label="Toggle liquidation walls" className="arx-press" style={{position:'relative', width:44, height:26, borderRadius:999, border:'none', cursor:'pointer', background: liqOn?'var(--color-violet-500)':'var(--surface-modal)', transition:'background .2s', flexShrink:0}}>
          <span style={{position:'absolute', top:3, left: liqOn?21:3, width:20, height:20, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,.3)', transition:'left .2s'}}/>
        </button>
      </div>}

      {/* read bar (resting) / Lucid tip (a wall selected) */}
      {wallsOn && !sel && <button onClick={()=>setSel(keyWall.id)} className="arx-press" style={{display:'flex', alignItems:'center', gap:9, width:'100%', marginTop:10, padding:'10px 12px', borderRadius:12, cursor:'pointer', textAlign:'left',
        background:'rgba(124,91,255,.08)', border:'.5px solid rgba(124,91,255,.22)'}}>
        <span style={{width:7, height:7, borderRadius:'50%', background:sideCol(keyWall), flexShrink:0}}/>
        <span style={{flex:1, font:'600 11px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.35}}><b style={{color:'var(--text-primary)'}}>{verdict(keyWall).replace(/\.$/,'')}</b> — ${keyWall.usd}M at ${pfmt(keyWall.price)} · {distLabel(keyWall)} from last</span>
        <span style={{font:'700 12px var(--font-body)', color:'var(--color-violet-300)'}}>▾</span>
      </button>}

      {wallsOn && selWall && (
        <div className="arx-arrive" style={{marginTop:10, borderRadius:13, padding:'12px 13px', background:'linear-gradient(150deg, rgba(124,91,255,.17), rgba(124,91,255,.035) 80%)', border:'.5px solid rgba(124,91,255,.3)'}}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
            {typeof LucidOrb!=='undefined' ? <LucidOrb size={20}/> : <span style={{width:20, height:20, borderRadius:'50%', background:'var(--color-violet-500)', flexShrink:0}}/>}
            <span style={{font:'700 9px var(--font-body)', color:'var(--color-violet-300)', letterSpacing:'.06em', textTransform:'uppercase'}}>◆ Lucid · wall</span>
            <span className="num" style={{font:'600 9px var(--font-mono)', color:sideCol(selWall)}}>${pfmt(selWall.price)} · {selWall.side==='L'?'long liqs':'short liqs'}</span>
            <span onClick={()=>setSel(null)} style={{marginLeft:'auto', font:'700 11px var(--font-body)', color:'var(--text-tertiary)', cursor:'pointer', padding:'0 4px'}}>▴</span>
          </div>
          <div style={{font:'700 13px var(--font-brand)', color:'var(--text-primary)', letterSpacing:'-.01em', lineHeight:1.35}}>{verdict(selWall)}</div>
          <div style={{font:'500 11.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5, marginTop:6}}>{explain(selWall)}</div>
          <div style={{display:'flex', alignItems:'center', gap:7, marginTop:10, paddingTop:9, borderTop:'.5px solid rgba(124,91,255,.18)'}}>
            <span style={{font:'600 9px var(--font-body)', color:'var(--text-tertiary)'}}>Who</span>
            <span style={{flex:1, maxWidth:120, display:'flex', height:7, borderRadius:3, overflow:'hidden', gap:1}}>{selWall.comp.filter(c=>c[1]>0).map((c,i)=>(<span key={i} style={{width:c[1]+'%', background:LIQ_COHORT[c[0]]}}/>))}</span>
            <span style={{font:'600 9.5px var(--font-body)', color:'var(--text-tertiary)'}}>{rekt(selWall)}% Rekt · 1,840 wallets</span>
          </div>
          <button onClick={()=>askLucid(selWall)} className="arx-press" style={{display:'flex', alignItems:'center', gap:4, marginTop:10, background:'none', border:'none', padding:0, cursor:'pointer', font:'700 10px var(--font-body)', color:'var(--color-violet-300)'}}>Ask Lucid about this wall <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
        </div>
      )}
    </div>
  );

  if (big) return chart;
  const fsHost = typeof document!=='undefined' && document.getElementById('arx-portal-root');
  const fsOverlay = full ? (
    <div style={{position:'absolute', inset:0, zIndex:90, background:'var(--surface-base)', display:'flex', flexDirection:'column', animation:'pairScrim 220ms ease-out both'}}>
      <div style={{display:'flex', alignItems:'center', gap:10, padding:'calc(12px + env(safe-area-inset-top)) 16px 10px'}}>
        {typeof AssetGlyph!=='undefined' && <AssetGlyph sym={sym} size={28}/>}
        <div style={{flex:1, minWidth:0}}>
          <div style={{font:'700 14px var(--font-brand)', color:'var(--text-primary)'}}>{sym}-PERP</div>
          <div className="num" style={{font:'600 11px var(--font-mono)', color:'var(--text-secondary)'}}>${pfmt(P)}</div>
        </div>
        <button onClick={()=>setFull(false)} className="arx-press" aria-label="Exit full screen" style={{width:34, height:34, borderRadius:9, border:'.5px solid var(--border-strong)', background:'var(--surface-elevated)', color:'var(--text-secondary)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div>
      <div style={{flex:1, overflowY:'auto', padding:'4px 16px calc(24px + env(safe-area-inset-bottom))'}}>
        <InstrumentLiqChart m={m} pos={pos} liqOn={liqOn} setLiqOn={setLiqOn} livePrice={livePrice} big={true}/>
      </div>
    </div>
  ) : null;
  return (<React.Fragment>
    {chart}
    {full && (fsHost ? ReactDOM.createPortal(fsOverlay, fsHost) : fsOverlay)}
  </React.Fragment>);
}

Object.assign(window, {
  InstrumentLiqChart,
  IdSecHead, IdDisclosure, IdPositioning, IdFlow, IdRisk, IdWallets, IdInfo,
  PhoneShell, TabBar, PhoneTopNav,
  ToplineCard, SigSpark, MiniBiasViz, MiniStressViz, MiniWallsViz,
  InstrumentHero, SignalsShell, InstrumentSignalsScreen,
  InstrumentOverview, InstrumentBiasTab, InstrumentFlowTab, InstrumentWallsTab, InstrumentStressTab,
  IvGroupHead, InstrumentDirectionTab, InstrumentRiskTab,
  SectionLabel, DisclaimerFooter, ModuleSpacer, arxSignalsFor,
});
