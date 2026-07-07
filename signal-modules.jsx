// Arx — Instrument signal modules (v38)
// SIG-I01 Position Bias · SIG-I02 Flow Momentum · SIG-I03 Entry & Risk Walls · SIG-I04 Liquidation & PnL Stress
// Copy and structure aligned to 5-7-5 Production v38.

const { useState: sUS, useMemo: sUM } = React;

/* ────────────────────────────────────────────────────────────
   Scaffolding
   ──────────────────────────────────────────────────────────── */

function Surface({ children, style = {} }) {
  return (
    <div style={{
      background:'var(--surface-elevated)',
      border:'.5px solid var(--border-default)',
      borderRadius:16, padding:16, margin:'0 16px',
      ...style
    }}>{children}</div>
  );
}

function CardHeader({ title, control, sub }) {
  return (
    <div style={{
      display:'flex', justifyContent:'space-between', alignItems:'flex-start',
      gap:12, marginBottom: sub ? 4 : 12
    }}>
      <div>
        <div style={{
          font:'600 11px var(--font-body)', color:'var(--text-tertiary)',
          letterSpacing:'.08em', textTransform:'uppercase'
        }}>{title}</div>
        {sub && <div style={{
          font:'500 12px var(--font-body)', color:'var(--text-secondary)',
          marginTop:3, letterSpacing:'-0.005em'
        }}>{sub}</div>}
      </div>
      {control}
    </div>
  );
}

function CompactSelector({ options, value, onChange }) {
  return (
    <div style={{
      display:'inline-flex', background:'rgba(124,91,255,.08)',
      borderRadius:8, padding:2, height:26
    }}>
      {options.map(o => {
        const on = value===o;
        return (
        <button key={o} onClick={()=>onChange&&onChange(o)} style={{
          height:22, padding:'0 8px', borderRadius:6, boxSizing:'border-box',
          background: on ? 'color-mix(in oklab, var(--color-violet-500) 16%, var(--surface-base))' : 'transparent',
          border: on ? '.5px solid color-mix(in oklab, var(--color-violet-500) 42%, transparent)' : '.5px solid transparent',
          color: on ? 'color-mix(in oklab, var(--color-violet-500) 60%, var(--text-primary))' : 'var(--text-secondary)',
          font:`${on?700:500} 11px var(--font-mono)`,
          letterSpacing:'.02em', cursor:'pointer'
        }}>{o}</button>
      ); })}
    </div>
  );
}

function StaticControl({ label }) {
  // Header chip showing the widget's fixed default delta, e.g. "Δ 4h"
  return (
    <div style={{
      padding:'4px 10px', borderRadius:999, height:26,
      background:'rgba(124,91,255,.10)',
      border:'.5px solid rgba(124,91,255,.18)',
      font:'600 11px var(--font-mono)', color:'var(--color-violet-300)',
      letterSpacing:'.02em',
      display:'inline-flex', alignItems:'center'
    }}>{label}</div>
  );
}

function FreshnessLine({ text = 'Updated 4m ago' }) {
  return (
    <div style={{
      font:'500 10px var(--font-body)', color:'var(--text-tertiary)',
      letterSpacing:'-0.005em'
    }}>{text}</div>
  );
}

/* ────────────────────────────────────────────────────────────
   Shared DS primitives (v39) — one badge, one chip-row, one tooltip.
   Caption floor 11px · radii on the 8/12/16 grid · severity derives from
   ONE regime mid colour via color-mix (kills the second red, no raw rgba).
   ──────────────────────────────────────────────────────────── */

/* tone → ink colour (everything else is mixed from it) */
const SIG_TONE = {
  up:'var(--regime-up-mid)', down:'var(--regime-down-mid)',
  watch:'var(--regime-trans-mid)', critical:'var(--regime-crisis-mid)',
  brand:'var(--color-violet-500)', neutral:'var(--text-tertiary)',
};
/* severity word → tone (one source of truth for risk severities) */
const SIG_SEV_TONE = { normal:'neutral', watch:'watch', elevated:'down', critical:'critical' };
function sigToneInk(t){ return SIG_TONE[t] || SIG_TONE.neutral; }
function sigToneBg(t){ const ink=sigToneInk(t); return t==='neutral'?'var(--surface-base)':`color-mix(in oklab, ${ink} 13%, transparent)`; }
function sigToneBorder(t){ const ink=sigToneInk(t); return t==='neutral'?'var(--border-default)':`color-mix(in oklab, ${ink} 26%, transparent)`; }

/* SevBadge — the one status pill. Pass tone (up/down/watch/critical/brand/neutral) OR sev (normal/watch/elevated/critical). */
function SevBadge({ tone, sev, children, size = 'md' }) {
  const t = tone || SIG_SEV_TONE[sev] || 'neutral';
  const sm = size === 'sm';
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      font:`700 11px var(--font-body)`, color:sigToneInk(t),
      background:sigToneBg(t), border:`.5px solid ${sigToneBorder(t)}`,
      padding: sm ? '2px 8px' : '3px 9px', borderRadius:999,
      letterSpacing:'.03em', whiteSpace:'nowrap', textTransform: sev?'uppercase':'none'
    }}>{sev ? (String(sev).charAt(0).toUpperCase()+String(sev).slice(1)) : children}</span>
  );
}

/* SegChips — the one inline filter/segment row. options: [[id,label],…] */
function SegChips({ options, value, onChange, scroll = false }) {
  return (
    <div style={{ display:'flex', gap:6, ...(scroll?{overflowX:'auto', scrollbarWidth:'none'}:{flexWrap:'wrap'}) }}>
      {options.map(([id,label]) => {
        const on = value===id;
        return (
          <button key={id} onClick={()=>onChange&&onChange(id)} className="arx-press" style={{
            flexShrink:0, height:28, padding:'0 12px', borderRadius:999, cursor:'pointer',
            background: on ? 'color-mix(in oklab, var(--color-violet-500) 16%, var(--surface-base))' : 'transparent',
            border: '.5px solid ' + (on ? 'color-mix(in oklab, var(--color-violet-500) 42%, transparent)' : 'var(--border-default)'),
            color: on ? 'color-mix(in oklab, var(--color-violet-500) 60%, var(--text-primary))' : 'var(--text-secondary)',
            font:`${on?700:600} 12px var(--font-body)`, whiteSpace:'nowrap'
          }}>{label}</button>
        );
      })}
    </div>
  );
}

/* InfoTip — the one tap-to-define tooltip. d = { term, def, how } (e.g. ARX_LOGIC.*.definitions.*) */
function InfoTip({ d }) {
  const [o,setO] = sUS(false);
  if (!d) return null;
  return (
    <span style={{ position:'relative', display:'inline-flex', verticalAlign:'middle' }}>
      <button onClick={(e)=>{ e.stopPropagation(); setO(!o); }} aria-label={(d.term||'')+' — what is this'} style={{
        width:15, height:15, borderRadius:'50%', border:'.5px solid var(--border-strong)', background:'none',
        color:'var(--text-tertiary)', font:'italic 700 10px var(--font-brand)', cursor:'pointer', lineHeight:1,
        display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0, padding:0
      }}>i</button>
      {o && (
        <span className="arx-arrive" style={{
          position:'absolute', bottom:'150%', left:'50%', transform:'translateX(-50%)', width:212, zIndex:30,
          background:'var(--surface-modal)', border:'.5px solid var(--border-strong)', borderRadius:12,
          padding:'10px 12px', boxShadow:'0 8px 24px rgba(0,0,0,.34)'
        }}>
          <span style={{ display:'block', font:'700 11px var(--font-body)', color:'var(--text-primary)', marginBottom:3 }}>{d.term}</span>
          <span style={{ display:'block', font:'500 11px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.45 }}>{d.def}</span>
          {d.how && <span style={{ display:'block', font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', lineHeight:1.4, marginTop:5 }}>{d.how}</span>}
        </span>
      )}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
   SIG-I01 — Position Bias
   ──────────────────────────────────────────────────────────── */

/* 5-zone energy rail */
function BiasBar({ activeIdx = 2, compact = false }) {
  const labels = ['Very bearish','Bearish','Indecisive','Bullish','Very bullish'];
  const colors = [
    'var(--regime-down-mid)',
    'rgba(242,106,106,.55)',
    'var(--text-tertiary)',
    'rgba(45,212,155,.55)',
    'var(--regime-up-mid)',
  ];
  return (
    <div>
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:3,
        marginBottom: compact?5:8
      }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{
            height: compact?6:10, borderRadius:3,
            background: i===activeIdx ? colors[i] : 'rgba(124,91,255,.10)',
            boxShadow: i===activeIdx ? `0 0 10px ${colors[i]}` : 'none',
            transition:'all 300ms'
          }}/>
        ))}
      </div>
      {!compact && <div style={{
        display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:3,
      }}>
        {labels.map((l, i) => (
          <div key={l} style={{
            font:`${i===activeIdx?600:400} 10px var(--font-body)`,
            color: i===activeIdx ? colors[i] : 'var(--text-tertiary)',
            textAlign:'center', letterSpacing:'-0.01em'
          }}>{l}</div>
        ))}
      </div>}
    </div>
  );
}

/* Current State — bias rail with hero + plain read + delta */
function BiasCurrentState({ bucket, plainRead, activeIdx, deltaPts, deltaDir, freshness = 'Updated 4m ago' }) {
  const deltaColor = deltaDir==='bullish' ? 'var(--regime-up-mid)'
                   : deltaDir==='bearish' ? 'var(--regime-down-mid)'
                   : 'var(--text-secondary)';
  return (
    <Surface>
      <CardHeader title="Current State" control={<StaticControl label="Δ 4h"/>}/>
      <div style={{marginBottom:14}}>
        <div style={{
          font:'600 22px var(--font-brand)', color:'var(--text-primary)',
          letterSpacing:'-0.02em', lineHeight:1.2
        }}>{bucket}</div>
        <div style={{
          font:'400 13px var(--font-body)', color:'var(--text-secondary)',
          marginTop:6, lineHeight:1.45, letterSpacing:'-0.005em'
        }}>{plainRead}</div>
      </div>
      <BiasBar activeIdx={activeIdx}/>
      <div style={{
        marginTop:14, padding:'10px 12px', borderRadius:10,
        background:'rgba(124,91,255,.06)',
        border:'.5px solid var(--border-default)',
        display:'flex', justifyContent:'space-between', alignItems:'center'
      }}>
        <span style={{
          font:'500 10px var(--font-body)', color:'var(--text-tertiary)',
          letterSpacing:'.08em', textTransform:'uppercase'
        }}>4h Delta</span>
        <span className="num" style={{
          font:'600 14px var(--font-mono)', color:deltaColor,
          letterSpacing:'-0.01em'
        }}>{deltaPts > 0 ? '+' : ''}{deltaPts} pts → {deltaDir==='bullish'?'Bullish':deltaDir==='bearish'?'Bearish':'Indecisive'}</span>
      </div>
      <div style={{marginTop:10, textAlign:'right'}}>
        <FreshnessLine text={freshness}/>
      </div>
    </Surface>
  );
}

/* Bias Trend chart with cohort line toggles */
function BiasTrend({ data, lines }) {
  const w = 326, h = 140, pad = 6;
  const [visible, setVisible] = sUS(() => Object.fromEntries(lines.map(l => [l.name, true])));
  const toY = (v) => pad + (h - pad*2) * (1 - v/100);
  const toX = (i, n) => pad + (w - pad*2) * (i / (n-1));
  return (
    <Surface style={{padding:14}}>
      <div style={{padding:'0 4px 12px'}}>
        <CardHeader
          title="Bias Trend"
          control={<CompactSelector options={['24h','7d','30d']} value="7d"/>}
        />
      </div>
      <div style={{position:'relative', height:h+24, padding:'0 0 0 56px'}}>
        <div style={{position:'absolute', left:0, top:0, bottom:24, width:52, display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
          {['Very bullish','Bullish','Indecisive','Bearish','Very bearish'].map((l) => (
            <div key={l} style={{
              font:'500 9px var(--font-body)', color:'var(--text-tertiary)',
              textAlign:'right', paddingRight:6, letterSpacing:'-0.01em'
            }}>{l}</div>
          ))}
        </div>
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:'block'}}>
          {[0,25,50,75,100].map(v => (
            <line key={v} x1={pad} x2={w-pad} y1={toY(v)} y2={toY(v)}
                  stroke="rgba(124,91,255,.08)" strokeWidth="1"
                  strokeDasharray={v===50?"":"2 3"}/>
          ))}
          <line x1={pad} x2={w-pad} y1={toY(50)} y2={toY(50)}
                stroke="rgba(124,91,255,.16)" strokeWidth="1"/>
          {lines.map(L => visible[L.name] && (
            <path key={L.name}
              d={L.points.map((v,i)=> (i?'L':'M')+toX(i,L.points.length).toFixed(1)+','+toY(v).toFixed(1)).join(' ')}
              fill="none" stroke={L.color} strokeWidth={L.name==='Overall'?2:1.5}
              strokeOpacity={L.name==='Overall'?1:0.85}
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={L.dashed?"3 3":""}/>
          ))}
          {(()=>{
            const L = lines.find(l=>l.name==='Overall');
            if(!L) return null;
            const i = L.points.length-1;
            return <circle cx={toX(i,L.points.length)} cy={toY(L.points[i])} r="3.5" fill={L.color} stroke="var(--surface-elevated)" strokeWidth="1.5"/>;
          })()}
        </svg>
        <div style={{
          display:'flex', justifyContent:'space-between', padding:'4px 6px 0',
          font:'400 9px var(--font-mono)', color:'var(--text-tertiary)'
        }}>
          {data.map(d => <span key={d}>{d}</span>)}
        </div>
      </div>
      <div style={{
        display:'flex', flexWrap:'wrap', gap:6, marginTop:10, padding:'0 4px'
      }}>
        {lines.map(L => (
          <button key={L.name} onClick={()=>setVisible(v=>({...v,[L.name]:!v[L.name]}))} style={{
            display:'inline-flex', gap:6, alignItems:'center',
            padding:'4px 9px', borderRadius:999,
            border:'.5px solid var(--border-default)',
            background: visible[L.name] ? 'rgba(124,91,255,.06)' : 'transparent',
            opacity: visible[L.name] ? 1 : 0.45,
            font:'500 10px var(--font-body)', color:'var(--text-secondary)',
            cursor:'pointer', letterSpacing:'-0.01em'
          }}>
            <span style={{
              width:8, height:2, borderRadius:1, background:L.color,
              ...(L.dashed?{background:`repeating-linear-gradient(to right, ${L.color} 0 2px, transparent 2px 4px)`}:{})
            }}/>
            {L.name}
          </button>
        ))}
      </div>
    </Surface>
  );
}

/* Driver row — direct driver or risk overlay */
function DriverRow({ kind, type, cluster, action, delta, deltaPct, contribution, tag, last }) {
  // kind: 'direct' (green icon) | 'overlay' (amber icon)
  const isOverlay = kind === 'overlay';
  const iconBg   = isOverlay ? 'rgba(251,191,36,.10)' : 'rgba(45,212,155,.10)';
  const iconInk  = isOverlay ? 'var(--regime-trans-mid)' : 'var(--regime-up-mid)';
  const tagBg    = isOverlay ? 'rgba(251,191,36,.10)' : 'rgba(45,212,155,.10)';
  const tagInk   = isOverlay ? 'var(--regime-trans-mid)' : 'var(--regime-up-mid)';
  const tagBd    = isOverlay ? 'rgba(251,191,36,.22)' : 'rgba(45,212,155,.22)';
  const icon = type==='Exposure' ? '$'
             : type==='Wallets'  ? '#'
             : type==='Leverage' ? '×'
             : type==='Crowding' ? '⌬'
             : '◆';
  return (
    <div style={{
      padding:'14px 0', display:'flex', gap:14,
      borderBottom: last?'none':'.5px solid var(--border-default)'
    }}>
      <div style={{
        width:32, height:32, borderRadius:8, flexShrink:0,
        background:iconBg, color:iconInk,
        display:'flex', alignItems:'center', justifyContent:'center',
        font:'700 15px var(--font-mono)'
      }}>{icon}</div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:8
        }}>
          <div>
            <div style={{
              font:'500 10px var(--font-body)', color:'var(--text-tertiary)',
              letterSpacing:'.08em', textTransform:'uppercase'
            }}>{type}</div>
            <div style={{
              font:'600 14px var(--font-body)', color:'var(--text-primary)',
              marginTop:3, letterSpacing:'-0.005em'
            }}>{cluster} {action}</div>
          </div>
          <div className="num" style={{textAlign:'right', flexShrink:0}}>
            <div style={{font:'600 14px var(--font-mono)', color:'var(--text-primary)'}}>{delta}</div>
            {deltaPct && <div style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2}}>{deltaPct}</div>}
          </div>
        </div>
        <div style={{
          font:'400 12px var(--font-body)', color:'var(--text-secondary)',
          marginTop:6, letterSpacing:'-0.005em'
        }}>{contribution}</div>
        {tag && <div style={{marginTop:8}}>
          <span style={{
            font:'500 10px var(--font-body)', color:tagInk, background:tagBg,
            padding:'3px 8px', borderRadius:999, letterSpacing:'.01em',
            border:`.5px solid ${tagBd}`
          }}>{tag}</span>
        </div>}
      </div>
    </div>
  );
}

function BiasDrivers({ direct, overlays, summary }) {
  return (
    <Surface>
      <CardHeader
        title="Drivers"
        control={<CompactSelector options={['1h','4h','24h']} value="4h"/>}
      />
      {/* Direct */}
      <div style={{
        font:'500 10px var(--font-body)', color:'var(--text-tertiary)',
        letterSpacing:'.08em', textTransform:'uppercase', marginTop:6
      }}>Direct bias drivers</div>
      <div>
        {direct.map((r, i) => <DriverRow key={'d'+i} kind="direct" {...r} last={i===direct.length-1}/>)}
      </div>
      {/* Risk overlays */}
      {overlays && overlays.length > 0 && <>
        <div style={{
          marginTop:12, paddingTop:12, borderTop:'.5px solid var(--border-default)',
          font:'500 10px var(--font-body)', color:'var(--text-tertiary)',
          letterSpacing:'.08em', textTransform:'uppercase'
        }}>Risk overlays</div>
        <div>
          {overlays.map((r, i) => <DriverRow key={'o'+i} kind="overlay" {...r} last={i===overlays.length-1}/>)}
        </div>
      </>}
      <div style={{
        marginTop:12, padding:'10px 12px', borderRadius:10,
        background:'rgba(124,91,255,.06)',
        border:'.5px solid rgba(124,91,255,.16)',
        font:'500 12px var(--font-body)', color:'var(--text-primary)',
        lineHeight:1.45, letterSpacing:'-0.005em'
      }}>
        <span style={{
          font:'600 10px var(--font-body)', color:'var(--color-violet-300)',
          letterSpacing:'.08em', textTransform:'uppercase', marginRight:8
        }}>Read</span>
        {summary}
      </div>
    </Surface>
  );
}

/* Cohort bias cards */
function CohortBiasCard({ name, bucket, change, activeIdx, longNotional, longCount, shortNotional, shortCount, driver, accent }) {
  return (
    <div style={{
      flex:1, minWidth:0,
      padding:14, borderRadius:14,
      background:'var(--surface-modal)',
      border:'.5px solid var(--border-default)',
      position:'relative', overflow:'hidden'
    }}>
      <div style={{
        position:'absolute', top:0, left:0, width:'3px', height:'100%',
        background: accent || 'var(--color-violet-500)'
      }}/>
      <div style={{
        font:'600 13px var(--font-body)', color:'var(--text-primary)',
        letterSpacing:'-0.01em'
      }}>{name}</div>
      <div style={{
        font:'500 11px var(--font-body)', color:'var(--text-secondary)',
        marginTop:2, letterSpacing:'-0.005em'
      }}>{bucket} · <span style={{color:'var(--text-tertiary)'}}>{change}</span></div>
      <div style={{marginTop:10, marginBottom:10}}>
        <BiasBar activeIdx={activeIdx} compact={true}/>
      </div>
      <div className="num" style={{
        font:'500 11px var(--font-mono)', color:'var(--text-secondary)',
        display:'flex', justifyContent:'space-between', marginBottom:3
      }}>
        <span><span style={{color:'var(--regime-up-mid)'}}>L</span> {longNotional}</span>
        <span style={{color:'var(--text-tertiary)'}}>{longCount} wallets</span>
      </div>
      <div className="num" style={{
        font:'500 11px var(--font-mono)', color:'var(--text-secondary)',
        display:'flex', justifyContent:'space-between'
      }}>
        <span><span style={{color:'var(--regime-down-mid)'}}>S</span> {shortNotional}</span>
        <span style={{color:'var(--text-tertiary)'}}>{shortCount} wallets</span>
      </div>
      <div style={{
        marginTop:10, paddingTop:10, borderTop:'.5px solid var(--border-default)',
        font:'400 11px var(--font-body)', color:'var(--text-secondary)',
        lineHeight:1.4, letterSpacing:'-0.005em'
      }}>{driver}</div>
    </div>
  );
}

function CohortBiasGrid({ cards }) {
  return (
    <div style={{padding:'0 16px'}}>
      <div style={{
        display:'grid', gridTemplateColumns:'1fr 1fr', gap:10
      }}>
        {cards.map(c => <CohortBiasCard key={c.name} {...c}/>)}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   SIG-I02 — Flow Momentum
   ──────────────────────────────────────────────────────────── */

const FLOW_STATE_META = {
  rising:    { copy:'Bullish flow is rising',      tone:'bullish', dot:'var(--regime-up-mid)' },
  above:     { copy:'Bullish flow is above normal',tone:'bullish', dot:'var(--regime-up-mid)' },
  near:      { copy:'Bullish flow is near normal', tone:'neutral', dot:'var(--text-tertiary)' },
  decreasing:{ copy:'Bullish flow is decreasing',  tone:'warn',    dot:'var(--regime-trans-mid)' },
  flipped:   { copy:'Flow flipped to bearish',     tone:'bearish', dot:'var(--regime-down-mid)' },
  rising_b:  { copy:'Bearish flow is rising',      tone:'bearish', dot:'var(--regime-down-mid)' },
};

/* Current Flow (hero) */
function CurrentFlow({ state, currentNotional, baselineNotional, multiple, walletCount, topShare, dominantCohort, freshness = 'Updated 1m ago' }) {
  const meta = FLOW_STATE_META[state] || FLOW_STATE_META.near;
  const toneColor = meta.tone==='bullish' ? 'var(--regime-up-mid)'
                  : meta.tone==='bearish' ? 'var(--regime-down-mid)'
                  : meta.tone==='warn'    ? 'var(--regime-trans-mid)'
                  : 'var(--text-secondary)';
  return (
    <Surface>
      <CardHeader title="Current Flow" control={<StaticControl label="1h"/>}/>
      <div style={{
        font:'600 20px var(--font-brand)', color:toneColor,
        letterSpacing:'-0.02em', display:'flex', alignItems:'center', gap:8
      }}>
        <span style={{
          width:8, height:8, borderRadius:'50%', background:meta.dot,
          boxShadow:`0 0 8px ${meta.dot}`, flexShrink:0
        }}/>
        {meta.copy}
      </div>

      <div className="num" style={{
        marginTop:14, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8
      }}>
        <div style={{
          padding:'10px 12px', borderRadius:10,
          background:'var(--surface-modal)',
          border:'.5px solid var(--border-default)'
        }}>
          <div style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.06em', textTransform:'uppercase'}}>Current 1h flow</div>
          <div style={{font:'600 16px var(--font-mono)', color:toneColor, marginTop:4, letterSpacing:'-0.02em'}}>{currentNotional}</div>
        </div>
        <div style={{
          padding:'10px 12px', borderRadius:10,
          background:'var(--surface-modal)',
          border:'.5px solid var(--border-default)'
        }}>
          <div style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.06em', textTransform:'uppercase'}}>Normal 1h flow</div>
          <div style={{font:'600 16px var(--font-mono)', color:'var(--text-primary)', marginTop:4, letterSpacing:'-0.02em'}}>{baselineNotional}</div>
        </div>
      </div>

      <div className="num" style={{
        marginTop:10, padding:'10px 12px', borderRadius:10,
        background:'rgba(124,91,255,.06)',
        border:'.5px solid var(--border-default)',
        display:'flex', justifyContent:'space-between', alignItems:'center'
      }}>
        <span style={{
          font:'500 10px var(--font-body)', color:'var(--text-tertiary)',
          letterSpacing:'.08em', textTransform:'uppercase'
        }}>vs normal</span>
        <span style={{
          font:'700 16px var(--font-mono)', color:toneColor, letterSpacing:'-0.02em'
        }}>{multiple}× <span style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)'}}>above normal</span></span>
      </div>

      <div style={{
        marginTop:12, paddingTop:12, borderTop:'.5px solid var(--border-default)',
        display:'flex', justifyContent:'space-between', alignItems:'center'
      }}>
        <div>
          <div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.08em', textTransform:'uppercase'}}>{dominantCohort}-led</div>
          <div className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-secondary)', marginTop:3}}>{walletCount} wallets · top wallet share {topShare}</div>
        </div>
        <FreshnessLine text={freshness}/>
      </div>
    </Surface>
  );
}

/* Flow by Window — 15m / 1h / 4h / 24h */
function FlowByWindow({ tiles }) {
  return (
    <Surface>
      <CardHeader title="Flow by Window"/>
      <div style={{display:'flex', gap:8}}>
        {tiles.map(t => <FlowWindowTile key={t.window} {...t}/>)}
      </div>
    </Surface>
  );
}

function FlowWindowTile({ window: w, multiple, state, notional, walletCount, dominant }) {
  const meta = FLOW_STATE_META[state] || FLOW_STATE_META.near;
  const toneColor = meta.tone==='bullish' ? 'var(--regime-up-mid)'
                  : meta.tone==='bearish' ? 'var(--regime-down-mid)'
                  : meta.tone==='warn'    ? 'var(--regime-trans-mid)'
                  : 'var(--text-secondary)';
  // Simplified state label for tile (no "Bullish flow is" prefix)
  const tileLabel = state==='rising' || state==='rising_b' ? 'Rising'
                  : state==='above'      ? 'Above normal'
                  : state==='near'       ? 'Near normal'
                  : state==='decreasing' ? 'Decreasing'
                  : state==='flipped'    ? 'Flipped' : 'Near normal';
  return (
    <div style={{
      flex:1, minWidth:0, padding:'12px 10px', borderRadius:12,
      background:'var(--surface-modal)',
      border:'.5px solid var(--border-default)',
    }}>
      <div className="num" style={{
        font:'600 10px var(--font-mono)', color:'var(--text-tertiary)',
        letterSpacing:'.08em', textTransform:'uppercase'
      }}>{w}</div>
      <div className="num" style={{
        marginTop:8, font:'700 19px var(--font-mono)', color:toneColor,
        letterSpacing:'-0.03em'
      }}>{multiple}<span style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', marginLeft:3}}>×</span></div>
      <div style={{
        marginTop:4, font:'600 11px var(--font-body)', color:toneColor,
        letterSpacing:'-0.005em'
      }}>{tileLabel}</div>
      <div className="num" style={{
        marginTop:8, font:'500 11px var(--font-mono)', color:'var(--text-primary)'
      }}>{notional}</div>
      <div className="num" style={{
        marginTop:2, font:'500 10px var(--font-mono)', color:'var(--text-tertiary)'
      }}>{walletCount} wallets</div>
      {dominant && <div style={{
        marginTop:6, font:'500 9px var(--font-body)', color:'var(--text-secondary)',
        letterSpacing:'-0.005em'
      }}>{dominant}-led</div>}
    </div>
  );
}

/* Top Flow Drivers — ranked contributors */
function TopFlowDrivers({ drivers }) {
  return (
    <Surface>
      <CardHeader title="Top Flow Drivers" sub="Contributors to the current bullish flow"/>
      <div style={{marginTop:6}}>
        {drivers.map((d, i) => (
          <div key={d.name} style={{
            display:'flex', gap:12, alignItems:'flex-start',
            padding:'12px 0',
            borderBottom: i===drivers.length-1 ? 'none' : '.5px solid var(--border-default)'
          }}>
            <div style={{
              width:24, height:24, borderRadius:6, flexShrink:0,
              background:'rgba(124,91,255,.10)', color:'var(--color-violet-300)',
              display:'flex', alignItems:'center', justifyContent:'center',
              font:'700 12px var(--font-mono)'
            }}>{i+1}</div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:8}}>
                <span style={{font:'600 13px var(--font-body)', color:'var(--text-primary)', letterSpacing:'-0.005em'}}>{d.name}</span>
                <span className="num" style={{font:'600 13px var(--font-mono)', color:'var(--regime-up-mid)', letterSpacing:'-0.01em'}}>{d.notional}</span>
              </div>
              <div className="num" style={{
                marginTop:4, display:'flex', gap:10, flexWrap:'wrap',
                font:'500 11px var(--font-mono)', color:'var(--text-secondary)'
              }}>
                <span><span style={{color:'var(--text-tertiary)'}}>Multiple</span> {d.multiple}×</span>
                <span><span style={{color:'var(--text-tertiary)'}}>Share</span> {d.share}</span>
                <span><span style={{color:'var(--text-tertiary)'}}>Wallets</span> {d.wallets}</span>
              </div>
              {d.note && <div style={{
                marginTop:4, font:'400 11px var(--font-body)', color:'var(--text-secondary)',
                lineHeight:1.4
              }}>{d.note}</div>}
            </div>
          </div>
        ))}
      </div>
    </Surface>
  );
}

/* Cohort Flow Breakdown — complete split */
function CohortFlowBreakdown({ rows }) {
  return (
    <Surface>
      <CardHeader title="Cohort Flow Breakdown" sub="Directional flow split across all cohort families"/>
      <div style={{marginTop:6}}>
        {rows.map((r, i) => (
          <div key={r.name} style={{
            padding:'12px 0',
            borderBottom: i===rows.length-1 ? 'none' : '.5px solid var(--border-default)'
          }}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <span style={{
                width:3, alignSelf:'stretch', borderRadius:2, background:r.accent,
                height:34, flexShrink:0
              }}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:8}}>
                  <span style={{font:'600 13px var(--font-body)', color:'var(--text-primary)', letterSpacing:'-0.005em'}}>{r.name}</span>
                  <span className="num" style={{
                    font:'600 13px var(--font-mono)',
                    color: r.netSide==='bullish' ? 'var(--regime-up-mid)' : r.netSide==='bearish' ? 'var(--regime-down-mid)' : 'var(--text-primary)',
                    letterSpacing:'-0.01em'
                  }}>{r.flow}</span>
                </div>
                <div className="num" style={{
                  marginTop:4, display:'flex', gap:10, flexWrap:'wrap',
                  font:'500 11px var(--font-mono)', color:'var(--text-secondary)'
                }}>
                  <span><span style={{color:'var(--text-tertiary)'}}>Normal</span> {r.normal}</span>
                  <span><span style={{color:'var(--text-tertiary)'}}>×</span> {r.multiple}</span>
                  <span><span style={{color:'var(--text-tertiary)'}}>Wallets</span> {r.wallets}</span>
                  <span><span style={{color:'var(--text-tertiary)'}}>Top</span> {r.topShare}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Surface>
  );
}

/* ────────────────────────────────────────────────────────────
   SIG-I03 — Entry & Risk Walls
   ──────────────────────────────────────────────────────────── */

const WALL_META = {
  entry: {
    label:'Entry Wall',
    ink:'var(--regime-up-mid)',
    bg:'rgba(45,212,155,.10)',
    border:'rgba(45,212,155,.22)',
  },
  forced: {
    label:'Forced-Exit Wall',
    ink:'var(--regime-down-mid)',
    bg:'rgba(242,106,106,.10)',
    border:'rgba(242,106,106,.22)',
  },
  profit: {
    label:'Possible Profit-Taking Area',
    ink:'var(--regime-trans-mid)',
    bg:'rgba(251,191,36,.10)',
    border:'rgba(251,191,36,.22)',
  },
};

const COHORT_COLORS = {
  'Smart Money':      'var(--color-violet-500)',
  'Whale Moves':      'var(--color-peach-500)',
  'Rising Money':     'var(--regime-range-mid)',
  'Full Rekt Crowd':  'var(--regime-down-mid)',
};

/* Cohort mix stacked bar (Smart 57% / Whale 20% / Rising 13% / Full Rekt 10%) */
function CohortMixBar({ mix, height = 6 }) {
  return (
    <div>
      <div style={{
        display:'flex', height, borderRadius:height/2, overflow:'hidden',
        background:'rgba(124,91,255,.05)'
      }}>
        {mix.map(m => (
          <div key={m.name} style={{
            width:`${m.pct}%`, background:COHORT_COLORS[m.name] || 'var(--color-violet-400)',
            opacity:0.9
          }}/>
        ))}
      </div>
      <div style={{
        marginTop:6, display:'flex', flexWrap:'wrap', gap:'4px 10px'
      }}>
        {mix.map(m => (
          <span key={m.name} style={{
            display:'inline-flex', gap:5, alignItems:'center',
            font:'500 10px var(--font-body)', color:'var(--text-secondary)',
            letterSpacing:'-0.005em'
          }}>
            <span style={{width:6, height:6, borderRadius:2, background:COHORT_COLORS[m.name]}}/>
            {m.shortName} {m.pct}%
          </span>
        ))}
      </div>
    </div>
  );
}

/* Wall card */
function WallCard({ wall }) {
  const meta = WALL_META[wall.kind];
  const dirArrow = wall.above ? '▲' : '▼';
  const dirSign = wall.above ? '+' : '−';
  return (
    <div style={{
      padding:14, borderRadius:14,
      background:'var(--surface-elevated)',
      border:`.5px solid var(--border-default)`,
      margin:'0 16px 10px',
      position:'relative', overflow:'hidden'
    }}>
      <div style={{
        position:'absolute', top:0, left:0, width:3, height:'100%',
        background: meta.ink
      }}/>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10}}>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
            <span style={{
              font:'600 10px var(--font-body)', color:meta.ink, background:meta.bg,
              padding:'3px 8px', borderRadius:999, letterSpacing:'.04em', textTransform:'uppercase',
              border:`.5px solid ${meta.border}`
            }}>{meta.label}</span>
            {wall.confidence && <span style={{
              font:'500 10px var(--font-body)', color:'var(--text-tertiary)',
              letterSpacing:'.04em', textTransform:'uppercase'
            }}>{wall.confidence}</span>}
          </div>
          <div style={{
            marginTop:8, font:'600 14px var(--font-body)', color:'var(--text-primary)',
            letterSpacing:'-0.005em', lineHeight:1.35
          }}>{wall.headline}</div>
          <div className="num" style={{
            marginTop:6, font:'500 12px var(--font-mono)', color:'var(--text-secondary)'
          }}>
            ${wall.priceLow.toLocaleString()} → ${wall.priceHigh.toLocaleString()}
          </div>
          <div className="num" style={{
            font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2
          }}>
            Center ${wall.center.toLocaleString()} · {dirSign}{wall.distance}
          </div>
        </div>
        <div className="num" style={{
          textAlign:'right', flexShrink:0,
          font:'700 18px var(--font-mono)', color:meta.ink,
          letterSpacing:'-0.02em'
        }}>
          <div style={{font:'500 9px var(--font-mono)', color:'var(--text-tertiary)', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:2}}>{wall.above?'Above':'Below'}</div>
          <div>{dirArrow}</div>
        </div>
      </div>

      {/* Wall value block */}
      <div style={{
        marginTop:12, padding:'10px 12px', borderRadius:10,
        background:'var(--surface-modal)',
        border:'.5px solid var(--border-default)'
      }}>
        <div className="num" style={{
          display:'flex', justifyContent:'space-between',
          font:'500 11px var(--font-mono)', color:'var(--text-secondary)'
        }}>
          <span><span style={{color:'var(--text-tertiary)'}}>{wall.kind==='forced'?'At-risk value':'Wall value'}</span> <span style={{color:'var(--text-primary)'}}>{wall.value}</span></span>
          <span><span style={{color:'var(--text-tertiary)'}}>Wallets</span> <span style={{color:'var(--text-primary)'}}>{wall.wallets}</span></span>
        </div>
        {wall.cumulativeValue && <div className="num" style={{
          marginTop:6, display:'flex', justifyContent:'space-between',
          font:'500 11px var(--font-mono)', color:'var(--text-secondary)'
        }}>
          <span><span style={{color:'var(--text-tertiary)'}}>Cumulative to this level</span> <span style={{color:'var(--regime-down-mid)'}}>{wall.cumulativeValue}</span></span>
          {wall.positions && <span><span style={{color:'var(--text-tertiary)'}}>Positions</span> <span style={{color:'var(--text-primary)'}}>{wall.positions}</span></span>}
        </div>}
      </div>

      {/* Cohort mix */}
      <div style={{marginTop:12}}>
        <div style={{
          font:'500 10px var(--font-body)', color:'var(--text-tertiary)',
          letterSpacing:'.06em', textTransform:'uppercase', marginBottom:6
        }}>Cohort mix · most impacted: <span style={{color:'var(--text-primary)'}}>{wall.dominant}</span></div>
        <CohortMixBar mix={wall.mix}/>
      </div>

      {wall.read && <div style={{
        marginTop:12, padding:'8px 10px', borderRadius:8,
        background:'rgba(124,91,255,.05)',
        border:'.5px solid rgba(124,91,255,.12)',
        font:'500 11px var(--font-body)', color:'var(--text-primary)',
        lineHeight:1.4, letterSpacing:'-0.005em'
      }}>
        <span style={{
          font:'600 9px var(--font-body)', color:'var(--color-violet-300)',
          letterSpacing:'.08em', textTransform:'uppercase', marginRight:6
        }}>Read</span>
        {wall.read}
      </div>}
    </div>
  );
}

function KeyWalls({ walls }) {
  return (
    <div>
      <div style={{padding:'0 20px 8px'}}>
        <div style={{
          font:'600 11px var(--font-body)', color:'var(--text-tertiary)',
          letterSpacing:'.08em', textTransform:'uppercase'
        }}>Key Walls</div>
        <div style={{
          font:'500 12px var(--font-body)', color:'var(--text-secondary)',
          marginTop:3
        }}>Nearest entry, forced-exit, and possible profit-taking area</div>
      </div>
      {walls.map((w, i) => <WallCard key={i} wall={w}/>)}
    </div>
  );
}

/* Centered Price Map — current price as the rail centerline */
function CenteredPriceMap({ mark, walls }) {
  const above = walls.filter(w => w.above).sort((a,b)=>a.center - b.center).reverse(); // farthest first
  const below = walls.filter(w => !w.above).sort((a,b)=>b.center - a.center); // closest first

  return (
    <Surface>
      <CardHeader
        title="Centered Price Map"
        control={<CompactSelector options={['±2%','±5%','±10%']} value="±5%"/>}
      />
      <div style={{marginTop:6}}>
        <div style={{
          font:'500 9px var(--font-body)', color:'var(--text-tertiary)',
          letterSpacing:'.08em', textTransform:'uppercase', marginBottom:8
        }}>Above current price</div>
        {above.length === 0 && <EmptyRow text="No strong wall nearby"/>}
        {above.map((w, i) => <PriceMapRow key={'a'+i} wall={w}/>)}

        <div style={{
          margin:'12px 0',
          padding:'10px 12px', borderRadius:10,
          background:'rgba(124,91,255,.08)',
          border:'.5px solid rgba(124,91,255,.32)',
          display:'flex', alignItems:'center', justifyContent:'space-between'
        }}>
          <div>
            <div style={{
              font:'600 10px var(--font-body)', color:'var(--color-violet-300)',
              letterSpacing:'.10em', textTransform:'uppercase'
            }}>Current price</div>
            <div className="num" style={{
              font:'700 18px var(--font-mono)', color:'var(--text-primary)',
              marginTop:2, letterSpacing:'-0.02em'
            }}>${mark.price.toLocaleString()}</div>
          </div>
          {mark.changePct && <div className="num" style={{
            font:'600 13px var(--font-mono)',
            color: mark.changePct.startsWith('+') ? 'var(--regime-up-mid)' : 'var(--regime-down-mid)'
          }}>{mark.changePct} <span style={{font:'500 10px var(--font-mono)', color:'var(--text-tertiary)'}}>24h</span></div>}
        </div>

        <div style={{
          font:'500 9px var(--font-body)', color:'var(--text-tertiary)',
          letterSpacing:'.08em', textTransform:'uppercase', marginBottom:8
        }}>Below current price</div>
        {below.length === 0 && <EmptyRow text="No strong wall nearby"/>}
        {below.map((w, i) => <PriceMapRow key={'b'+i} wall={w}/>)}
      </div>
    </Surface>
  );
}

function EmptyRow({ text }) {
  return (
    <div style={{
      padding:'8px 12px', borderRadius:8,
      background:'rgba(124,91,255,.04)',
      border:'.5px dashed var(--border-default)',
      font:'500 11px var(--font-body)', color:'var(--text-tertiary)',
      letterSpacing:'-0.005em', textAlign:'center'
    }}>{text}</div>
  );
}

function PriceMapRow({ wall }) {
  const meta = WALL_META[wall.kind];
  return (
    <div style={{
      padding:'10px 12px', borderRadius:10, marginBottom:6,
      background:'var(--surface-modal)',
      border:'.5px solid var(--border-default)',
      display:'flex', gap:12, alignItems:'center'
    }}>
      <div style={{
        width:4, alignSelf:'stretch', borderRadius:2,
        background:meta.ink, height:32
      }}/>
      <div className="num" style={{
        font:'600 13px var(--font-mono)', color:'var(--text-primary)',
        flexShrink:0, width:74, letterSpacing:'-0.01em'
      }}>${wall.center.toLocaleString()}</div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{
          font:'500 12px var(--font-body)', color:meta.ink,
          letterSpacing:'-0.005em'
        }}>{meta.label}{wall.confidence==='Inferred'?' · Inferred':''}</div>
        <div className="num" style={{
          font:'500 10px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2
        }}>{wall.dominant}-heavy · {wall.value}</div>
      </div>
      <div className="num" style={{
        font:'600 12px var(--font-mono)',
        color: wall.above ? 'var(--regime-up-mid)' : 'var(--regime-down-mid)',
        flexShrink:0, letterSpacing:'-0.01em'
      }}>{wall.above?'+':'−'}{wall.distance}</div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   SIG-I04 — Liquidation & PnL Stress
   ──────────────────────────────────────────────────────────── */

/* Stress Read */
function StressRead({ state, stateTone, side, reasons, vulnerable, wallets, freshness = 'Updated 4m ago' }) {
  const toneMap = {
    critical: { ink:'var(--regime-crisis-mid)', bg:'rgba(220,38,38,.10)', border:'rgba(220,38,38,.22)' },
    elevated: { ink:'var(--regime-down-mid)',   bg:'rgba(242,106,106,.10)', border:'rgba(242,106,106,.22)' },
    watch:    { ink:'var(--regime-trans-mid)',  bg:'rgba(251,191,36,.10)', border:'rgba(251,191,36,.22)' },
    normal:   { ink:'var(--regime-up-mid)',     bg:'rgba(45,212,155,.10)', border:'rgba(45,212,155,.22)' },
  };
  const t = toneMap[stateTone] || toneMap.elevated;
  return (
    <Surface>
      <CardHeader title="Stress Read" control={<StaticControl label="Side · Long"/>}/>
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
        <span style={{
          width:8, height:8, borderRadius:'50%', background:t.ink,
          boxShadow:`0 0 8px ${t.ink}`
        }}/>
        <span style={{
          font:'600 18px var(--font-brand)', color:'var(--text-primary)',
          letterSpacing:'-0.01em'
        }}>{side}-side stress {state}</span>
      </div>
      <div style={{
        font:'500 10px var(--font-body)', color:'var(--text-tertiary)',
        letterSpacing:'.08em', textTransform:'uppercase', marginBottom:6
      }}>Why</div>
      <ol style={{
        margin:0, padding:'0 0 0 18px',
        font:'500 13px var(--font-body)', color:'var(--text-primary)',
        lineHeight:1.5, letterSpacing:'-0.005em'
      }}>
        {reasons.map((r, i) => <li key={i} style={{marginBottom:4}}>{r}</li>)}
      </ol>
      <div style={{
        marginTop:14, paddingTop:12, borderTop:'.5px solid var(--border-default)',
        display:'flex', justifyContent:'space-between', alignItems:'center'
      }}>
        <div className="num" style={{display:'flex', gap:18}}>
          <div>
            <div style={{font:'500 9px var(--font-mono)', color:'var(--text-tertiary)', letterSpacing:'.06em', textTransform:'uppercase'}}>Vulnerable</div>
            <div style={{font:'700 16px var(--font-mono)', color:t.ink, marginTop:3, letterSpacing:'-0.02em'}}>{vulnerable}</div>
          </div>
          <div>
            <div style={{font:'500 9px var(--font-mono)', color:'var(--text-tertiary)', letterSpacing:'.06em', textTransform:'uppercase'}}>Wallets</div>
            <div style={{font:'700 16px var(--font-mono)', color:'var(--text-primary)', marginTop:3, letterSpacing:'-0.02em'}}>{wallets}</div>
          </div>
        </div>
        <FreshnessLine text={freshness}/>
      </div>
    </Surface>
  );
}

/* Stress Drivers (Crowding / PnL pain / Liquidation distance) */
function StressDriverCards({ cards }) {
  return (
    <div style={{padding:'0 16px', display:'flex', flexDirection:'column', gap:10}}>
      {cards.map(c => <StressDriverCard key={c.primitive} {...c}/>)}
    </div>
  );
}

function StressDriverCard({ primitive, headline, evidence, sev, notional, walletShare }) {
  const sevMap = {
    critical:{ ink:'var(--regime-crisis-mid)', bg:'rgba(220,38,38,.10)', border:'rgba(220,38,38,.22)', label:'Critical' },
    elevated:{ ink:'var(--regime-down-mid)',   bg:'rgba(242,106,106,.10)', border:'rgba(242,106,106,.22)', label:'Elevated' },
    watch:   { ink:'var(--regime-trans-mid)',  bg:'rgba(251,191,36,.10)', border:'rgba(251,191,36,.22)', label:'Watch' },
  };
  const s = sevMap[sev] || sevMap.watch;
  return (
    <div style={{
      padding:14, borderRadius:12,
      background:'var(--surface-elevated)',
      border:'.5px solid var(--border-default)'
    }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10}}>
        <div style={{flex:1, minWidth:0}}>
          <div style={{
            font:'500 10px var(--font-body)', color:'var(--text-tertiary)',
            letterSpacing:'.08em', textTransform:'uppercase'
          }}>{primitive}</div>
          <div style={{
            font:'600 14px var(--font-body)', color:'var(--text-primary)',
            marginTop:4, letterSpacing:'-0.005em'
          }}>{headline}</div>
          {evidence && <div style={{
            font:'400 12px var(--font-body)', color:'var(--text-secondary)',
            marginTop:6, lineHeight:1.4
          }}>{evidence}</div>}
        </div>
        <span style={{
          font:'600 10px var(--font-body)', color:s.ink, background:s.bg,
          padding:'3px 8px', borderRadius:999, letterSpacing:'.04em', textTransform:'uppercase',
          border:`.5px solid ${s.border}`, flexShrink:0
        }}>{s.label}</span>
      </div>
      {(notional || walletShare) && (
        <div style={{
          marginTop:10, paddingTop:10, borderTop:'.5px solid var(--border-default)',
          display:'flex', gap:14, flexWrap:'wrap',
          font:'500 11px var(--font-mono)', color:'var(--text-secondary)'
        }}>
          {notional && <span><span style={{color:'var(--text-tertiary)'}}>Notional</span> <span style={{color:s.ink}}>{notional}</span></span>}
          {walletShare && <span><span style={{color:'var(--text-tertiary)'}}>Wallets</span> <span style={{color:'var(--text-primary)'}}>{walletShare}</span></span>}
        </div>
      )}
    </div>
  );
}

/* Risk Zone Map — price-anchored stress zones */
function RiskZoneMap({ mark, zones }) {
  return (
    <Surface>
      <CardHeader title="Risk Zone Map"/>
      <div className="num" style={{
        padding:'10px 12px', borderRadius:10,
        background:'rgba(124,91,255,.08)',
        border:'.5px solid rgba(124,91,255,.20)',
        display:'flex', justifyContent:'space-between', alignItems:'baseline',
        marginBottom:8
      }}>
        <div>
          <div style={{font:'600 9px var(--font-body)', color:'var(--color-violet-300)', letterSpacing:'.10em', textTransform:'uppercase'}}>Current mark</div>
        </div>
        <div style={{font:'700 16px var(--font-mono)', color:'var(--text-primary)', letterSpacing:'-0.02em'}}>${mark.toLocaleString()}</div>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:6}}>
        {zones.map((z, i) => <RiskZoneRow key={i} zone={z} mark={mark}/>)}
      </div>
    </Surface>
  );
}

function RiskZoneRow({ zone, mark }) {
  const inkMap = {
    'liquidation':'var(--regime-down-mid)',
    'liquidation-critical':'var(--regime-crisis-mid)',
    'pain':'var(--regime-trans-mid)',
  };
  const ink = inkMap[zone.kind] || 'var(--regime-down-mid)';
  const pct = ((zone.price - mark) / mark) * 100;
  return (
    <div style={{
      padding:'10px 12px', borderRadius:10,
      background:'var(--surface-modal)',
      border:'.5px solid var(--border-default)',
      display:'flex', gap:12, alignItems:'center'
    }}>
      <div className="num" style={{
        width:74, font:'600 13px var(--font-mono)', color:'var(--text-primary)',
        flexShrink:0, letterSpacing:'-0.01em'
      }}>${zone.price.toLocaleString()}</div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{font:'500 12px var(--font-body)', color:ink, letterSpacing:'-0.005em'}}>{zone.label}</div>
        <div className="num" style={{font:'500 10px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2}}>{zone.note}</div>
      </div>
      <div className="num" style={{
        font:'600 11px var(--font-mono)', color:'var(--text-tertiary)',
        flexShrink:0, letterSpacing:'-0.01em'
      }}>{pct>0?'+':''}{pct.toFixed(1)}%</div>
    </div>
  );
}

/* Stress Detail — secondary matrix view (cohort × side × primitive) */
function StressDetailMatrix({ rows }) {
  const cohorts = ['Smart Money','Whale Moves','Rising Money','Full Rekt'];
  return (
    <Surface>
      <CardHeader title="Stress Detail" sub="Cohort × side × primitive"/>
      <div style={{
        display:'grid', gridTemplateColumns:'62px repeat(4, 1fr)',
        gap:6, marginBottom:6, marginTop:6
      }}>
        <div/>
        {cohorts.map(c => (
          <div key={c} style={{
            font:'500 9px var(--font-body)', color:'var(--text-tertiary)',
            letterSpacing:'-0.01em', textAlign:'center', lineHeight:1.2
          }}>{c}</div>
        ))}
      </div>
      {rows.map((r, ri) => (
        <div key={'r'+ri} style={{
          display:'grid', gridTemplateColumns:'62px repeat(4, 1fr)',
          gap:6, marginBottom:6
        }}>
          <div style={{
            font:'600 10px var(--font-body)', color:'var(--text-primary)',
            letterSpacing:'-0.01em', display:'flex', flexDirection:'column',
            justifyContent:'center', lineHeight:1.2
          }}>
            <div>{r.label}</div>
            <div style={{
              font:'500 9px var(--font-mono)', color:r.sideColor,
              marginTop:2, letterSpacing:'.04em', textTransform:'uppercase'
            }}>{r.side}</div>
          </div>
          {r.cells.map((c, i) => <StressDetailCell key={i} {...c}/>)}
        </div>
      ))}
    </Surface>
  );
}

function StressDetailCell({ sev, vulnerable, underwater, wallets }) {
  const sevMap = {
    critical:{ bg:'rgba(220,38,38,.12)', ink:'var(--regime-crisis-mid)', border:'rgba(220,38,38,.24)', label:'Critical' },
    elevated:{ bg:'rgba(242,106,106,.10)', ink:'var(--regime-down-mid)', border:'rgba(242,106,106,.22)', label:'Elevated' },
    watch:   { bg:'rgba(251,191,36,.08)',  ink:'var(--regime-trans-mid)',border:'rgba(251,191,36,.18)', label:'Watch' },
    normal:  { bg:'transparent', ink:'var(--text-tertiary)', border:'var(--border-default)', label:'Normal' },
  };
  const s = sevMap[sev] || sevMap.normal;
  return (
    <div style={{
      padding:8, borderRadius:8, background:s.bg,
      border:`.5px solid ${s.border}`,
      minHeight:80, display:'flex', flexDirection:'column'
    }}>
      <div style={{
        font:'600 9px var(--font-body)', color:s.ink,
        letterSpacing:'.04em', textTransform:'uppercase'
      }}>{s.label}</div>
      {sev!=='normal' && <>
        <div className="num" style={{
          font:'600 12px var(--font-mono)', color:'var(--text-primary)',
          marginTop:5, letterSpacing:'-0.01em'
        }}>{vulnerable}</div>
        {underwater && <div className="num" style={{
          font:'500 10px var(--font-mono)', color:s.ink, marginTop:2
        }}>{underwater} uw</div>}
        <div className="num" style={{
          font:'500 10px var(--font-mono)', color:'var(--text-tertiary)',
          marginTop:'auto', paddingTop:6
        }}>{wallets}</div>
      </>}
    </div>
  );
}

Object.assign(window, {
  Surface, CardHeader, CompactSelector, StaticControl, FreshnessLine,
  SevBadge, SegChips, InfoTip,
  // SIG-I01
  BiasBar, BiasCurrentState, BiasTrend, BiasDrivers, CohortBiasCard, CohortBiasGrid,
  // SIG-I02
  CurrentFlow, FlowByWindow, FlowWindowTile, TopFlowDrivers, CohortFlowBreakdown,
  FLOW_STATE_META,
  // SIG-I03
  WallCard, KeyWalls, CenteredPriceMap, CohortMixBar, WALL_META,
  // SIG-I04
  StressRead, StressDriverCards, StressDriverCard, RiskZoneMap, StressDetailMatrix,
});
