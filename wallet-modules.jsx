// Arx — Wallet signal modules (v38)
// SIG-W01 Performance Trajectory · SIG-W02 Risk Behavior · SIG-W03 Capital Flow Confirmation

const { useState: wUS } = React;

/* ────────────────────────────────────────────────────────────
   Shared bits (Badge, AttentionRow legacy)
   ──────────────────────────────────────────────────────────── */

function Badge({ children, tone = 'violet', small = false }) {
  const map = {
    violet: ['rgba(124,91,255,.12)','var(--color-violet-300)','rgba(124,91,255,.24)'],
    up:     ['rgba(45,212,155,.10)', 'var(--regime-up-mid)',  'rgba(45,212,155,.22)'],
    down:   ['rgba(242,106,106,.10)','var(--regime-down-mid)','rgba(242,106,106,.22)'],
    warn:   ['rgba(251,191,36,.10)', 'var(--regime-trans-mid)','rgba(251,191,36,.22)'],
    info:   ['rgba(59,130,246,.10)', 'var(--regime-range-mid)','rgba(59,130,246,.22)'],
    crit:   ['rgba(220,38,38,.10)',  'var(--regime-crisis-mid)','rgba(220,38,38,.22)'],
  };
  const [bg, ink, border] = map[tone] || map.violet;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      font:`600 ${small?9:10}px var(--font-body)`, color:ink, background:bg,
      padding: small?'2px 6px':'3px 8px', borderRadius:999,
      border:`.5px solid ${border}`, letterSpacing:'.02em'
    }}>{children}</span>
  );
}

/* Contributing wallet row (used in Instrument Overview) */
function ContributingWalletRow({ addr, alias, perf, cluster, action, notional, leverageDrift, capitalPair, last }) {
  return (
    <div style={{
      padding:'14px 0', display:'flex', gap:12, alignItems:'flex-start',
      borderBottom: last?'none':'.5px solid var(--border-default)'
    }}>
      <div style={{
        width:36, height:36, borderRadius:'50%', flexShrink:0,
        background:'linear-gradient(135deg, var(--color-violet-700), var(--color-violet-400))',
        display:'flex', alignItems:'center', justifyContent:'center',
        font:'700 12px var(--font-mono)', color:'#fff'
      }}>{addr.slice(2,4).toUpperCase()}</div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:8}}>
          <div style={{font:'600 13px var(--font-mono)', color:'var(--text-primary)', letterSpacing:'-0.005em'}}>
            {addr}
            {alias && <span style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', marginLeft:6}}>· {alias}</span>}
          </div>
          <div className="num" style={{
            font:'600 13px var(--font-mono)', color:action.startsWith('+')?'var(--regime-up-mid)':'var(--regime-down-mid)'
          }}>{notional}</div>
        </div>
        <div style={{display:'flex', gap:6, marginTop:6, flexWrap:'wrap'}}>
          <Badge tone="violet">{cluster}</Badge>
          <Badge tone={perf==='Above normal'?'up':perf==='Improving'?'info':'warn'}>{perf}</Badge>
          {leverageDrift && <Badge tone="down" small>{leverageDrift}</Badge>}
          {capitalPair && <Badge tone="info" small>{capitalPair}</Badge>}
        </div>
        <div style={{font:'400 11px var(--font-body)', color:'var(--text-secondary)', marginTop:6, lineHeight:1.4}}>
          {action}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   SIG-W01 — Performance Trajectory
   ──────────────────────────────────────────────────────────── */

const PERF_STATE_META = {
  unproven:      { label:'Unproven',                              color:'var(--text-tertiary)' },
  improving:     { label:'Improving',                             color:'var(--regime-range-mid)' },
  above_normal:  { label:'Above normal observed track record',    color:'var(--regime-up-mid)' },
  deteriorating: { label:'Deteriorating',                         color:'var(--regime-down-mid)' },
  recovering:    { label:'Recovering',                            color:'var(--color-peach-500)' },
};

/* Current Performance State */
function CurrentPerformanceState({ state, metrics, freshness = 'Updated 12m ago' }) {
  const meta = PERF_STATE_META[state] || PERF_STATE_META.improving;
  return (
    <Surface>
      <CardHeader title="Performance State" control={<CompactSelector options={['7d','30d','90d','all']} value="30d"/>}/>
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:14}}>
        <span style={{
          width:8, height:8, borderRadius:'50%', background:meta.color,
          boxShadow:`0 0 8px ${meta.color}`
        }}/>
        <span style={{
          font:'600 18px var(--font-brand)', color:'var(--text-primary)',
          letterSpacing:'-0.01em', lineHeight:1.3
        }}>{meta.label}</span>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:8}}>
        {metrics.map((m, i) => (
          <div key={i} style={{
            display:'flex', justifyContent:'space-between', alignItems:'baseline',
            padding:'8px 12px', borderRadius:10,
            background:'var(--surface-modal)',
            border:'.5px solid var(--border-default)'
          }}>
            <span style={{
              font:'500 12px var(--font-body)', color:'var(--text-secondary)',
              letterSpacing:'-0.005em'
            }}>{m.label}</span>
            <span className="num" style={{
              font:'600 13px var(--font-mono)', color:m.color || 'var(--text-primary)',
              letterSpacing:'-0.01em'
            }}>{m.value}</span>
          </div>
        ))}
      </div>
      <div style={{marginTop:10, textAlign:'right'}}>
        <FreshnessLine text={freshness}/>
      </div>
    </Surface>
  );
}

/* Track Record Over Time — state-transition timeline */
function TrackRecordTimeline({ states }) {
  return (
    <Surface>
      <CardHeader title="Track Record Over Time" control={<CompactSelector options={['7d','30d','90d','all']} value="all"/>}/>
      <div style={{position:'relative', padding:'8px 0', marginTop:4}}>
        <div style={{
          position:'absolute', left:9, top:18, bottom:18, width:2,
          background:'var(--border-default)'
        }}/>
        {states.map((s, i) => {
          const meta = PERF_STATE_META[s.state] || PERF_STATE_META.improving;
          const isCurrent = i === 0;
          return (
            <div key={i} style={{
              display:'flex', gap:14, alignItems:'flex-start',
              padding:'10px 0', position:'relative'
            }}>
              <div style={{
                width:20, height:20, borderRadius:'50%', flexShrink:0,
                background:isCurrent ? meta.color : 'var(--surface-elevated)',
                border:`2px solid ${meta.color}`,
                boxShadow: isCurrent ? `0 0 12px ${meta.color}` : 'none',
                zIndex:1, marginTop:2
              }}/>
              <div style={{flex:1}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:8}}>
                  <div style={{
                    font:`${isCurrent?600:500} 13px var(--font-body)`,
                    color:isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)',
                    letterSpacing:'-0.005em'
                  }}>{meta.label}</div>
                  <div className="num" style={{
                    font:'500 10px var(--font-mono)', color:'var(--text-tertiary)'
                  }}>{s.when}</div>
                </div>
                {s.note && <div style={{
                  font:'400 12px var(--font-body)', color:'var(--text-secondary)',
                  marginTop:4, lineHeight:1.4
                }}>{s.note}</div>}
                {s.metric && <div className="num" style={{
                  font:'500 12px var(--font-mono)', color:meta.color, marginTop:4
                }}>{s.metric}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </Surface>
  );
}

/* Performance Drivers — list of contributing factors */
function PerformanceDrivers({ drivers }) {
  return (
    <Surface>
      <CardHeader title="Performance Drivers"/>
      <div>
        {drivers.map((d, i) => (
          <div key={i} style={{
            padding:'12px 0', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12,
            borderBottom: i===drivers.length-1 ? 'none' : '.5px solid var(--border-default)'
          }}>
            <div style={{flex:1, minWidth:0}}>
              <div style={{
                font:'500 10px var(--font-body)', color:'var(--text-tertiary)',
                letterSpacing:'.08em', textTransform:'uppercase'
              }}>{d.kind}</div>
              <div style={{
                font:'500 13px var(--font-body)', color:'var(--text-primary)',
                marginTop:4, letterSpacing:'-0.005em', lineHeight:1.4
              }}>{d.text}</div>
            </div>
            {d.value && <div className="num" style={{
              font:'600 13px var(--font-mono)', color:d.color || 'var(--text-primary)',
              flexShrink:0, letterSpacing:'-0.01em'
            }}>{d.value}</div>}
          </div>
        ))}
      </div>
    </Surface>
  );
}

/* Instrument Contribution — by-pair breakdown */
function InstrumentContribution({ rows }) {
  const maxAbs = Math.max(...rows.map(r => Math.abs(r.pnlRaw)));
  return (
    <Surface>
      <CardHeader title="Instrument Contribution" sub="Realized PnL by pair"/>
      <div style={{marginTop:6}}>
        {rows.map((r, i) => (
          <div key={r.sym} style={{
            padding:'10px 0',
            borderBottom: i===rows.length-1 ? 'none' : '.5px solid var(--border-default)'
          }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:8, marginBottom:6}}>
              <span style={{font:'600 13px var(--font-body)', color:'var(--text-primary)', letterSpacing:'-0.005em'}}>{r.sym}-PERP</span>
              <span className="num" style={{
                font:'600 13px var(--font-mono)',
                color: r.pnlRaw >= 0 ? 'var(--regime-up-mid)' : 'var(--regime-down-mid)',
                letterSpacing:'-0.01em'
              }}>{r.pnl}</span>
            </div>
            <div style={{
              height:6, borderRadius:3, background:'rgba(124,91,255,.05)',
              position:'relative', overflow:'hidden'
            }}>
              <div style={{
                position:'absolute', left:'50%', top:0, bottom:0,
                width:`${Math.abs(r.pnlRaw)/maxAbs * 50}%`,
                transform: r.pnlRaw < 0 ? 'translateX(-100%)' : 'none',
                background: r.pnlRaw >= 0 ? 'var(--regime-up-mid)' : 'var(--regime-down-mid)',
                opacity:0.85
              }}/>
              <div style={{
                position:'absolute', left:'50%', top:-1, bottom:-1, width:1,
                background:'var(--border-default)'
              }}/>
            </div>
            <div className="num" style={{
              marginTop:5, display:'flex', justifyContent:'space-between',
              font:'500 10px var(--font-mono)', color:'var(--text-tertiary)'
            }}>
              <span>{r.trades} trades · {r.activeDays} active days</span>
              <span>{r.winRate} win</span>
            </div>
          </div>
        ))}
      </div>
    </Surface>
  );
}

/* ────────────────────────────────────────────────────────────
   SIG-W02 — Risk Behavior
   ──────────────────────────────────────────────────────────── */

const RISK_DIM_STATE = {
  normal:    { label:'Normal',                color:'var(--regime-up-mid)' },
  watch:     { label:'Watch',                 color:'var(--regime-range-mid)' },
  elevated:  { label:'Elevated',              color:'var(--regime-trans-mid)' },
  much:      { label:'Much higher than usual',color:'var(--regime-down-mid)' },
};

/* Current Risk State */
function CurrentRiskState({ state, summary, dimensions, freshness = 'Updated 1h ago' }) {
  const stateMap = {
    normal:   { ink:'var(--regime-up-mid)',    label:'Normal' },
    rising:   { ink:'var(--regime-trans-mid)', label:'Risk rising' },
    elevated: { ink:'var(--regime-down-mid)',  label:'Elevated' },
    critical: { ink:'var(--regime-crisis-mid)',label:'Critical' },
  };
  const s = stateMap[state] || stateMap.rising;
  return (
    <Surface>
      <CardHeader title="Wallet Risk" control={<StaticControl label="30d baseline"/>}/>
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
        <span style={{
          width:8, height:8, borderRadius:'50%', background:s.ink,
          boxShadow:`0 0 8px ${s.ink}`
        }}/>
        <span style={{
          font:'600 18px var(--font-brand)', color:'var(--text-primary)',
          letterSpacing:'-0.01em'
        }}>{s.label}</span>
      </div>
      {summary && <div style={{
        font:'400 13px var(--font-body)', color:'var(--text-secondary)',
        lineHeight:1.5, letterSpacing:'-0.005em', marginBottom:10
      }}>{summary}</div>}
      <div style={{display:'flex', flexDirection:'column', gap:6}}>
        {dimensions.map((d, i) => {
          const meta = RISK_DIM_STATE[d.state] || RISK_DIM_STATE.normal;
          return (
            <div key={i} style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'8px 12px', borderRadius:8,
              background:'var(--surface-modal)',
              border:'.5px solid var(--border-default)'
            }}>
              <span style={{
                font:'500 12px var(--font-body)', color:'var(--text-primary)',
                letterSpacing:'-0.005em'
              }}>{d.dim}</span>
              <span style={{
                font:'600 11px var(--font-body)', color:meta.color,
                letterSpacing:'-0.005em'
              }}>{meta.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{marginTop:10, textAlign:'right'}}>
        <FreshnessLine text={freshness}/>
      </div>
    </Surface>
  );
}

/* Risk vs Usual Range — card per dimension */
function RiskVsUsualRange({ cards }) {
  return (
    <div style={{padding:'0 16px', display:'flex', flexDirection:'column', gap:10}}>
      <div style={{padding:'0 4px'}}>
        <div style={{
          font:'600 11px var(--font-body)', color:'var(--text-tertiary)',
          letterSpacing:'.08em', textTransform:'uppercase'
        }}>Risk vs Usual Range</div>
        <div style={{
          font:'500 12px var(--font-body)', color:'var(--text-secondary)',
          marginTop:3, letterSpacing:'-0.005em'
        }}>Current behavior vs this wallet's own 30d normal</div>
      </div>
      {cards.map((c, i) => <UsualRangeCard key={i} {...c}/>)}
    </div>
  );
}

function UsualRangeCard({ dim, state, current, median, rangeLow, rangeHigh, unit, examples }) {
  const meta = RISK_DIM_STATE[state] || RISK_DIM_STATE.normal;
  // Range layout uses an extended axis so the dot can sit beyond p25/p75.
  const axisMin = rangeLow != null ? Math.min(rangeLow * 0.4, current * 0.85) : 0;
  const axisMax = rangeHigh != null ? Math.max(rangeHigh * 1.8, current * 1.15) : 1;
  const pct = v => axisMin === axisMax ? 50 : ((v - axisMin) / (axisMax - axisMin)) * 100;
  const hasRange = rangeLow != null && rangeHigh != null;
  return (
    <div style={{
      padding:14, borderRadius:12,
      background:'var(--surface-elevated)',
      border:'.5px solid var(--border-default)'
    }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10, marginBottom:8}}>
        <div>
          <div style={{
            font:'500 10px var(--font-body)', color:'var(--text-tertiary)',
            letterSpacing:'.08em', textTransform:'uppercase'
          }}>{dim}</div>
          <div className="num" style={{
            font:'700 22px var(--font-mono)', color:'var(--text-primary)',
            marginTop:4, letterSpacing:'-0.025em'
          }}>{current}{unit}</div>
        </div>
        <span style={{
          font:'600 10px var(--font-body)', color:meta.color, background:`${meta.color}1A`,
          padding:'3px 8px', borderRadius:999, letterSpacing:'.04em', textTransform:'uppercase',
          border:`.5px solid ${meta.color}33`, flexShrink:0
        }}>{meta.label}</span>
      </div>

      {hasRange && (
        <div style={{margin:'10px 0 4px'}}>
          <div style={{
            position:'relative', height:28,
            background:'var(--surface-modal)', borderRadius:6, overflow:'visible',
            border:'.5px solid var(--border-default)'
          }}>
            {/* Usual range band */}
            <div style={{
              position:'absolute', top:0, bottom:0,
              left:`${pct(rangeLow)}%`, width:`${pct(rangeHigh)-pct(rangeLow)}%`,
              background:'rgba(45,212,155,.18)',
              borderLeft:'1px dashed rgba(45,212,155,.55)',
              borderRight:'1px dashed rgba(45,212,155,.55)',
            }}/>
            {/* Median */}
            <div style={{
              position:'absolute', top:0, bottom:0,
              left:`calc(${pct(median)}% - 1px)`, width:2,
              background:'var(--regime-up-mid)', opacity:0.6
            }}/>
            {/* Current marker */}
            <div style={{
              position:'absolute', top:-4, bottom:-4,
              left:`calc(${pct(current)}% - 2px)`, width:4,
              background:meta.color, borderRadius:2,
              boxShadow:`0 0 8px ${meta.color}`
            }}/>
          </div>
          <div className="num" style={{
            display:'flex', justifyContent:'space-between', marginTop:6, gap:10,
            font:'500 10px var(--font-mono)', color:'var(--text-tertiary)'
          }}>
            <span>Usual <span style={{color:'var(--regime-up-mid)'}}>{rangeLow}{unit}–{rangeHigh}{unit}</span></span>
            <span>Median <span style={{color:'var(--text-primary)'}}>{median}{unit}</span></span>
          </div>
        </div>
      )}

      {examples && (
        <div style={{
          marginTop:10, paddingTop:10, borderTop:'.5px solid var(--border-default)',
          display:'flex', gap:6, flexWrap:'wrap'
        }}>
          {examples.map(e => (
            <span key={e} style={{
              font:'500 10px var(--font-mono)', color:'var(--text-secondary)',
              background:'rgba(124,91,255,.05)',
              padding:'3px 8px', borderRadius:6,
              border:'.5px solid var(--border-default)'
            }}>{e}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* Biggest Risk Driver — singular callout */
function BiggestRiskDriver({ dim, current, normal, summary, sev = 'much' }) {
  const meta = RISK_DIM_STATE[sev] || RISK_DIM_STATE.elevated;
  return (
    <Surface style={{borderColor:`${meta.color}33`}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10}}>
        <div>
          <div style={{
            font:'500 10px var(--font-body)', color:'var(--text-tertiary)',
            letterSpacing:'.08em', textTransform:'uppercase'
          }}>Biggest risk driver</div>
          <div style={{
            font:'600 18px var(--font-brand)', color:'var(--text-primary)',
            marginTop:4, letterSpacing:'-0.01em'
          }}>{dim}</div>
        </div>
        <span style={{
          font:'600 10px var(--font-body)', color:meta.color, background:`${meta.color}1A`,
          padding:'3px 8px', borderRadius:999, letterSpacing:'.04em', textTransform:'uppercase',
          border:`.5px solid ${meta.color}33`
        }}>{meta.label}</span>
      </div>
      <div style={{
        marginTop:12, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8
      }}>
        <div style={{
          padding:'10px 12px', borderRadius:10,
          background:'var(--surface-modal)',
          border:'.5px solid var(--border-default)'
        }}>
          <div style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.06em', textTransform:'uppercase'}}>Current</div>
          <div className="num" style={{font:'600 16px var(--font-mono)', color:meta.color, marginTop:4, letterSpacing:'-0.02em'}}>{current}</div>
        </div>
        <div style={{
          padding:'10px 12px', borderRadius:10,
          background:'var(--surface-modal)',
          border:'.5px solid var(--border-default)'
        }}>
          <div style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.06em', textTransform:'uppercase'}}>Usual range</div>
          <div className="num" style={{font:'600 16px var(--font-mono)', color:'var(--regime-up-mid)', marginTop:4, letterSpacing:'-0.02em'}}>{normal}</div>
        </div>
      </div>
      <div style={{
        marginTop:10, font:'500 13px var(--font-body)', color:'var(--text-primary)',
        lineHeight:1.45, letterSpacing:'-0.005em'
      }}>{summary}</div>
    </Surface>
  );
}

/* Usual Range Method — collapsible explainer */
function UsualRangeMethod() {
  const [open, setOpen] = wUS(false);
  return (
    <Surface>
      <button onClick={()=>setOpen(o=>!o)} style={{
        width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:0, background:'transparent', border:'none', cursor:'pointer', textAlign:'left'
      }}>
        <span style={{
          font:'600 11px var(--font-body)', color:'var(--text-tertiary)',
          letterSpacing:'.08em', textTransform:'uppercase'
        }}>Usual Range Method</span>
        <span style={{
          font:'700 14px var(--font-mono)', color:'var(--text-tertiary)',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          transition:'transform 200ms'
        }}>+</span>
      </button>
      {open && (
        <div style={{
          marginTop:10, font:'400 12px var(--font-body)', color:'var(--text-secondary)',
          lineHeight:1.55, letterSpacing:'-0.005em'
        }}>
          Baseline uses this wallet's own last 30 days.<br/>
          We sample hourly.<br/>
          Usual range = middle 50% of observed values (p25–p75).<br/>
          Median = typical behavior.<br/>
          90d baseline available where sample is sufficient (≥360 hourly snapshots).
        </div>
      )}
    </Surface>
  );
}

/* ────────────────────────────────────────────────────────────
   SIG-W03 — Capital Flow Confirmation
   ──────────────────────────────────────────────────────────── */

/* Current Capital State */
function CurrentCapitalState({ headline, plain, amount, paired, walletEquityPct, pairedTrade, pairedLag, incrementalPnl, freshness = 'Updated 3m ago' }) {
  return (
    <Surface>
      <CardHeader title="Current Capital State" control={<StaticControl label="24h"/>}/>
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
        <span style={{
          width:8, height:8, borderRadius:'50%', background:'var(--color-violet-300)',
          boxShadow:'0 0 8px var(--color-violet-400)'
        }}/>
        <span style={{
          font:'600 18px var(--font-brand)', color:'var(--text-primary)',
          letterSpacing:'-0.01em'
        }}>{headline}</span>
      </div>
      <div className="num" style={{
        font:'700 28px var(--font-mono)',
        color: amount.startsWith('+') ? 'var(--regime-up-mid)' : 'var(--regime-down-mid)',
        letterSpacing:'-0.03em'
      }}>{amount} <span style={{font:'500 14px var(--font-mono)', color:'var(--text-tertiary)'}}>USDC</span></div>
      {walletEquityPct && <div className="num" style={{
        marginTop:4, font:'500 11px var(--font-mono)', color:'var(--text-tertiary)'
      }}>{walletEquityPct} of wallet equity</div>}
      {plain && <div style={{
        marginTop:10, font:'500 13px var(--font-body)', color:'var(--text-secondary)',
        lineHeight:1.45, letterSpacing:'-0.005em'
      }}>{plain}</div>}

      {paired && (
        <div style={{
          marginTop:14, padding:'10px 12px', borderRadius:10,
          background:'rgba(124,91,255,.08)',
          border:'.5px solid rgba(124,91,255,.20)'
        }}>
          <div style={{
            font:'600 10px var(--font-body)', color:'var(--color-violet-300)',
            letterSpacing:'.08em', textTransform:'uppercase', marginBottom:4
          }}>Paired trade sequence</div>
          <div style={{
            font:'600 13px var(--font-body)', color:'var(--text-primary)',
            letterSpacing:'-0.005em'
          }}>{pairedTrade}</div>
          <div className="num" style={{
            marginTop:6, display:'flex', justifyContent:'space-between',
            font:'500 11px var(--font-mono)', color:'var(--text-secondary)'
          }}>
            <span><span style={{color:'var(--text-tertiary)'}}>Lag</span> {pairedLag}</span>
            <span><span style={{color:'var(--text-tertiary)'}}>Incremental PnL</span> <span style={{color:incrementalPnl.startsWith('+')?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{incrementalPnl}</span></span>
          </div>
        </div>
      )}
      <div style={{marginTop:10, textAlign:'right'}}>
        <FreshnessLine text={freshness}/>
      </div>
    </Surface>
  );
}

/* Capital Event Timeline — chronological list of events */
function CapitalEventTimelineV2({ events }) {
  return (
    <Surface>
      <CardHeader title="Capital Event Timeline" control={<CompactSelector options={['24h','7d','30d']} value="7d"/>}/>
      <div style={{position:'relative', padding:'8px 0', marginTop:4}}>
        <div style={{
          position:'absolute', left:9, top:18, bottom:18, width:2,
          background:'var(--border-default)'
        }}/>
        {events.map((e, i) => {
          const dot = e.kind==='inflow'  ? 'var(--regime-up-mid)'
                    : e.kind==='outflow' ? 'var(--regime-down-mid)'
                    : 'var(--color-violet-400)';
          const labelInk = e.kind==='inflow'  ? 'var(--regime-up-mid)'
                         : e.kind==='outflow' ? 'var(--regime-down-mid)'
                         : 'var(--color-violet-300)';
          return (
            <div key={i} style={{
              display:'flex', gap:14, alignItems:'flex-start',
              padding:'10px 0', position:'relative'
            }}>
              <div style={{
                width:20, height:20, borderRadius:'50%', flexShrink:0,
                background: i===0 ? dot : 'var(--surface-elevated)',
                border:`2px solid ${dot}`,
                zIndex:1, marginTop:2,
                boxShadow: i===0 ? `0 0 12px ${dot}` : 'none',
                display:'flex', alignItems:'center', justifyContent:'center',
                font:'700 11px var(--font-mono)',
                color: i===0 ? '#fff' : dot
              }}>{e.kind==='inflow'?'+':e.kind==='outflow'?'−':'◆'}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:8}}>
                  <span className="num" style={{
                    font:'600 13px var(--font-mono)', color:labelInk,
                    letterSpacing:'-0.005em'
                  }}>{e.label}</span>
                  <span className="num" style={{
                    font:'500 11px var(--font-mono)', color:'var(--text-tertiary)'
                  }}>{e.time}</span>
                </div>
                {e.detail && <div style={{
                  font:'400 12px var(--font-body)', color:'var(--text-secondary)',
                  marginTop:4, lineHeight:1.4, letterSpacing:'-0.005em'
                }}>{e.detail}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </Surface>
  );
}

/* Funding → Trade Match */
function FundingTradeMatch({ event, trade, lag, confidence, confidenceDetail }) {
  const cMap = {
    above:    { ink:'var(--regime-up-mid)',    bg:'rgba(45,212,155,.10)', border:'rgba(45,212,155,.22)', label:'Above normal' },
    moderate: { ink:'var(--regime-range-mid)', bg:'rgba(59,130,246,.10)', border:'rgba(59,130,246,.22)', label:'Moderate' },
    weak:     { ink:'var(--regime-trans-mid)', bg:'rgba(251,191,36,.10)', border:'rgba(251,191,36,.22)', label:'Weak' },
  };
  const c = cMap[confidence] || cMap.moderate;
  return (
    <Surface>
      <CardHeader title="Funding → Trade Match"/>
      <div style={{
        padding:'12px 14px', borderRadius:12,
        background:'rgba(45,212,155,.06)',
        border:'.5px solid rgba(45,212,155,.18)',
        marginBottom:8
      }}>
        <div style={{
          font:'500 10px var(--font-body)', color:'var(--text-tertiary)',
          letterSpacing:'.08em', textTransform:'uppercase'
        }}>Capital event</div>
        <div className="num" style={{
          font:'600 16px var(--font-mono)', color:'var(--regime-up-mid)',
          marginTop:4, letterSpacing:'-0.02em'
        }}>{event}</div>
      </div>
      <div style={{
        display:'flex', justifyContent:'center', alignItems:'center', gap:8,
        padding:'4px 0',
        font:'500 11px var(--font-body)', color:'var(--text-tertiary)',
        letterSpacing:'.04em', textTransform:'uppercase'
      }}>
        <span style={{width:24, height:1, background:'var(--border-default)'}}/>
        {lag} later
        <span style={{width:24, height:1, background:'var(--border-default)'}}/>
      </div>
      <div style={{
        padding:'12px 14px', borderRadius:12,
        background:'rgba(124,91,255,.06)',
        border:'.5px solid rgba(124,91,255,.18)',
        marginTop:8
      }}>
        <div style={{
          font:'500 10px var(--font-body)', color:'var(--text-tertiary)',
          letterSpacing:'.08em', textTransform:'uppercase'
        }}>Matched trade sequence</div>
        <div style={{
          font:'600 14px var(--font-body)', color:'var(--text-primary)',
          marginTop:4, letterSpacing:'-0.005em'
        }}>{trade}</div>
      </div>
      <div style={{
        marginTop:12, padding:'10px 12px', borderRadius:10,
        background:c.bg, border:`.5px solid ${c.border}`
      }}>
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center', gap:8
        }}>
          <span style={{
            font:'500 10px var(--font-body)', color:'var(--text-tertiary)',
            letterSpacing:'.08em', textTransform:'uppercase'
          }}>Match confidence</span>
          <span style={{
            font:'700 12px var(--font-body)', color:c.ink,
            letterSpacing:'-0.005em'
          }}>{c.label}</span>
        </div>
        <div style={{
          marginTop:4, font:'400 11px var(--font-body)', color:'var(--text-secondary)',
          lineHeight:1.4, letterSpacing:'-0.005em'
        }}>{confidenceDetail}</div>
      </div>
    </Surface>
  );
}

/* Paired Trade Outcomes */
function PairedTradeOutcomes({ outcomes, basis }) {
  return (
    <Surface>
      <CardHeader title="Paired Trade Outcomes" sub={basis}/>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:6}}>
        {outcomes.map((o, i) => (
          <div key={i} style={{
            padding:'12px', borderRadius:10,
            background:'var(--surface-modal)',
            border:'.5px solid var(--border-default)'
          }}>
            <div style={{
              font:'500 10px var(--font-body)', color:'var(--text-tertiary)',
              letterSpacing:'.08em', textTransform:'uppercase'
            }}>{o.window}</div>
            <div className="num" style={{
              font:'700 18px var(--font-mono)',
              color: o.pnlRaw >= 0 ? 'var(--regime-up-mid)' : 'var(--regime-down-mid)',
              marginTop:4, letterSpacing:'-0.025em'
            }}>{o.pnl}</div>
            <div className="num" style={{
              marginTop:4, font:'500 10px var(--font-mono)', color:'var(--text-tertiary)'
            }}>{o.note}</div>
          </div>
        ))}
      </div>
    </Surface>
  );
}

Object.assign(window, {
  Badge, ContributingWalletRow,
  // SIG-W01
  CurrentPerformanceState, TrackRecordTimeline, PerformanceDrivers, InstrumentContribution,
  PERF_STATE_META,
  // SIG-W02
  CurrentRiskState, RiskVsUsualRange, UsualRangeCard, BiggestRiskDriver, UsualRangeMethod,
  RISK_DIM_STATE,
  // SIG-W03
  CurrentCapitalState, CapitalEventTimelineV2, FundingTradeMatch, PairedTradeOutcomes,
});
