// Arx — Wallet detail (v38)
// Overview + tabs for SIG-W01 Performance / SIG-W02 Risk / SIG-W03 Capital

const { useState: wvUS, useEffect: wvUE } = React;

/* ─── Wallet hero (entity-level) ─── */
function WalletHero() {
  return (
    <div style={{padding:'0 20px 18px'}}>
      <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:14}}>
        <div style={{
          width:48, height:48, borderRadius:'50%', flexShrink:0,
          background:'conic-gradient(from 180deg at 50% 50%, #7C4FE0, #7C5BFF, #FCA98C, #7C4FE0)',
          padding:2, display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <div style={{
            width:'100%', height:'100%', borderRadius:'50%',
            background:'var(--surface-base)',
            display:'flex', alignItems:'center', justifyContent:'center',
            font:'700 14px var(--font-mono)', color:'var(--color-violet-300)'
          }}>SM</div>
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{
            font:'700 24px var(--font-brand)', color:'var(--text-primary)',
            letterSpacing:'-0.025em', lineHeight:1.05
          }}>solana_max</div>
          <div className="num" style={{
            font:'500 12px var(--font-mono)', color:'var(--text-tertiary)',
            marginTop:4, letterSpacing:'-0.005em'
          }}>0xA17F...0E9F2C</div>
        </div>
        <button className="arx-press" style={{
          padding:'7px 12px', height:32, borderRadius:999,
          background:'var(--color-violet-500)', color:'#fff', border:'none',
          font:'700 12px var(--font-body)', cursor:'pointer',
          letterSpacing:'-0.005em',
          boxShadow:'0 4px 12px rgba(124,91,255,.30)'
        }}>Follow</button>
      </div>

      <div style={{display:'flex', gap:6, marginBottom:14, flexWrap:'wrap'}}>
        <Badge tone="up">Above normal track record</Badge>
        <Badge tone="violet">Smart Money</Badge>
        <Badge tone="info" small>Position swing</Badge>
      </div>

      <div style={{
        display:'grid', gridTemplateColumns:'1fr 1fr', gap:1,
        background:'var(--border-default)',
        borderRadius:12, overflow:'hidden',
        border:'.5px solid var(--border-default)',
        marginBottom:10
      }}>
        {[
          { label:'Equity',         value:'$24.8M' },
          { label:'30d realized',   value:'+$1.82M', color:'var(--regime-up-mid)' },
          { label:'Open notional',  value:'$54.2M' },
          { label:'Open PnL',       value:'+$420K',  color:'var(--regime-up-mid)' },
          { label:'Avg leverage',   value:'5.8×',    color:'var(--regime-trans-mid)' },
          { label:'Max drawdown',   value:'−8.4%',   color:'var(--regime-down-mid)' },
        ].map(s => (
          <div key={s.label} style={{
            padding:'10px 12px', background:'var(--surface-elevated)'
          }}>
            <div style={{
              font:'500 9px var(--font-body)', color:'var(--text-tertiary)',
              letterSpacing:'.06em', textTransform:'uppercase'
            }}>{s.label}</div>
            <div className="num" style={{
              font:'600 14px var(--font-mono)', color:s.color || 'var(--text-primary)',
              marginTop:3, letterSpacing:'-0.01em'
            }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="num" style={{
        display:'flex', gap:14, flexWrap:'wrap',
        font:'500 11px var(--font-mono)', color:'var(--text-secondary)'
      }}>
        <span><span style={{color:'var(--text-tertiary)'}}>Active</span> 412 days</span>
        <span><span style={{color:'var(--text-tertiary)'}}>Trades 30d</span> 142</span>
        <span><span style={{color:'var(--text-tertiary)'}}>Liquidations</span> 0</span>
      </div>
    </div>
  );
}

/* Active positions (entity-level) */
function ActivePositionsList() {
  const positions = [
    { sym:'BTC', side:'long',  notional:'$18.2M', leverage:'8.4×', upnl:'+$412K', upnlColor:'var(--regime-up-mid)',  share:0.34, riskFlag:'lev' },
    { sym:'ETH', side:'long',  notional:'$14.6M', leverage:'7.1×', upnl:'+$228K', upnlColor:'var(--regime-up-mid)',  share:0.27, riskFlag:'lev' },
    { sym:'SOL', side:'long',  notional:'$11.0M', leverage:'9.2×', upnl:'+$184K', upnlColor:'var(--regime-up-mid)',  share:0.20, riskFlag:'lev' },
    { sym:'HYPE',side:'short', notional:'$9.2M',  leverage:'11.4×',upnl:'+$18K',  upnlColor:'var(--regime-up-mid)',  share:0.17, riskFlag:'lev' },
    { sym:'PEPE',side:'long',  notional:'$1.2M',  leverage:'4.0×', upnl:'−$14K',  upnlColor:'var(--regime-down-mid)',share:0.02, riskFlag:'pair' },
  ];
  const flagLabel = { lev:'lev drift', pair:'new pair' };
  return (
    <Surface>
      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'baseline',
        marginBottom:10
      }}>
        <div>
          <div style={{
            font:'500 11px var(--font-body)', color:'var(--text-tertiary)',
            letterSpacing:'.06em', textTransform:'uppercase'
          }}>Active positions</div>
          <div style={{
            font:'600 14px var(--font-body)', color:'var(--text-primary)',
            marginTop:2, letterSpacing:'-0.01em'
          }}>5 open · $54.2M notional</div>
        </div>
        <span style={{
          font:'500 11px var(--font-body)', color:'var(--color-violet-300)',
          letterSpacing:'-0.005em'
        }}>Concentrated</span>
      </div>

      <div style={{
        display:'flex', height:8, borderRadius:4, overflow:'hidden',
        background:'rgba(124,91,255,.06)', marginBottom:14
      }}>
        {positions.map((p,i) => (
          <div key={i} style={{
            flex: p.share,
            background: ['var(--color-violet-500)','var(--color-violet-400)','var(--color-peach-500)','var(--regime-down-mid)','var(--regime-range-mid)'][i],
            opacity: 0.85
          }}/>
        ))}
      </div>

      <div>
        {positions.map((p,i) => (
          <div key={p.sym} style={{
            display:'flex', gap:12, alignItems:'center',
            padding:'10px 0',
            borderBottom: i===positions.length-1 ? 'none' : '.5px solid var(--border-default)'
          }}>
            <AssetGlyph sym={p.sym} size={28}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', gap:6, alignItems:'baseline'}}>
                <span style={{font:'600 13px var(--font-body)', color:'var(--text-primary)', letterSpacing:'-0.005em'}}>{p.sym}-PERP</span>
                <span style={{
                  font:'600 9px var(--font-body)',
                  color: p.side==='long' ? 'var(--regime-up-mid)' : 'var(--regime-down-mid)',
                  background: p.side==='long' ? 'rgba(45,212,155,.10)' : 'rgba(242,106,106,.10)',
                  padding:'2px 6px', borderRadius:4, letterSpacing:'.04em', textTransform:'uppercase'
                }}>{p.side}</span>
                {p.riskFlag && <span style={{
                  font:'500 9px var(--font-body)', color:'var(--regime-trans-mid)',
                  background:'rgba(251,191,36,.08)',
                  padding:'2px 6px', borderRadius:4, letterSpacing:'.04em', textTransform:'uppercase',
                  border:'.5px solid rgba(251,191,36,.18)'
                }}>{flagLabel[p.riskFlag]}</span>}
              </div>
              <div className="num" style={{
                font:'500 11px var(--font-mono)', color:'var(--text-tertiary)',
                marginTop:3, letterSpacing:'-0.005em'
              }}>{p.notional} · {p.leverage}</div>
            </div>
            <div className="num" style={{
              font:'600 13px var(--font-mono)', color:p.upnlColor,
              letterSpacing:'-0.01em'
            }}>{p.upnl}</div>
          </div>
        ))}
      </div>
    </Surface>
  );
}

/* ─── Wallet signals (sub-screen) ─── */
function WalletSignalsScreen({ onBack }) {
  const tabs = [
    { id:'overview',    label:'Overview' },
    { id:'performance', label:'Performance' },
    { id:'risk',        label:'Risk' },
    { id:'capital',     label:'Capital' },
  ];
  return (
    <SignalsShell title="Wallet · 0xA17F…0E9F2C" tabs={tabs} onBack={onBack} top={<WalletHero/>}
      renderTab={(tab, go) => (
        <React.Fragment>
          {tab==='overview'    && <WalletOverview onGo={go}/>}
          {tab==='performance' && <WalletPerformanceTab/>}
          {tab==='risk'        && <WalletRiskTab/>}
          {tab==='capital'     && <WalletCapitalTab/>}
        </React.Fragment>
      )}/>
  );
}

/* Mini-viz for SIG-W02 overview card */
function MiniDriftViz({ lo, hi, mark }) {
  return (
    <div style={{width:64, height:28, display:'flex', alignItems:'center'}}>
      <div style={{
        width:'100%', height:6, borderRadius:3,
        background:'var(--surface-modal)', position:'relative'
      }}>
        <div style={{
          position:'absolute', top:0, bottom:0,
          left: `${lo*100}%`, width: `${(hi-lo)*100}%`,
          background:'rgba(45,212,155,.30)',
          borderLeft:'1px dashed rgba(45,212,155,.6)',
          borderRight:'1px dashed rgba(45,212,155,.6)'
        }}/>
        <div style={{
          position:'absolute', top:-3, bottom:-3,
          left:`calc(${mark*100}% - 1.5px)`, width:3,
          background:'var(--regime-down-mid)', borderRadius:2,
          boxShadow:'0 0 6px var(--regime-down-mid)'
        }}/>
      </div>
    </div>
  );
}

/* Mini-viz for SIG-W03 overview card */
function MiniCapitalViz() {
  const bars = [0.4, -0.2, 0.7, 0, -0.3, 0.5, 1.0];
  return (
    <svg width="64" height="28" viewBox="0 0 64 28">
      <line x1="0" x2="64" y1="14" y2="14" stroke="var(--border-default)" strokeWidth="1"/>
      {bars.map((v, i) => {
        const x = (64/bars.length) * i + 1;
        const bw = 64/bars.length - 2;
        const h = Math.abs(v) * 12;
        return v >= 0 ? (
          <rect key={i} x={x} y={14-h} width={bw} height={h}
            fill="var(--regime-up-mid)" opacity="0.85" rx="1.5"/>
        ) : (
          <rect key={i} x={x} y={14} width={bw} height={h}
            fill="var(--regime-down-mid)" opacity="0.85" rx="1.5"/>
        );
      })}
      <circle cx="59" cy="2" r="2.5" fill="var(--color-violet-500)" stroke="var(--surface-elevated)" strokeWidth="1.2"/>
    </svg>
  );
}

/* ─── Wallet Overview ─── */
function WalletOverview({ onGo }) {
  return (
    <div>
      <div style={{padding:'4px 16px 14px'}}>
        <div style={{
          padding:14, borderRadius:14,
          background:'linear-gradient(135deg, rgba(124,91,255,.14), rgba(124,91,255,.03))',
          border:'.5px solid rgba(124,91,255,.30)'
        }}>
          <div style={{
            font:'600 9px var(--font-body)', color:'var(--color-violet-300)',
            letterSpacing:'.10em', textTransform:'uppercase'
          }}>Combined read · 30d</div>
          <div style={{
            font:'600 15px var(--font-brand)', color:'var(--text-primary)',
            marginTop:6, lineHeight:1.35, letterSpacing:'-0.005em'
          }}>Above normal track record. Risk rising — leverage and concentration much higher than usual. Fresh inflow paired with BTC long build.</div>
          <div style={{marginTop:10, display:'flex', gap:6, flexWrap:'wrap'}}>
            <Badge tone="up">Above normal</Badge>
            <Badge tone="down" small>Risk rising</Badge>
            <Badge tone="warn" small>Much higher concentration</Badge>
            <Badge tone="info" small>Capital paired</Badge>
          </div>
        </div>
      </div>

      <SectionLabel>Signals · tap to drill in</SectionLabel>

      <ToplineCard
        sigId="SIG-W01" name="Performance Trajectory"
        state="Above normal" stateTone="bullish"
        headline="Above normal observed track record."
        sub="Realized +$1.82M / 30d · 23 of 27 active days profitable. Max drawdown −8.4%."
        meta={[
          { label:'30d PnL',      value:'+$1.82M', color:'var(--regime-up-mid)' },
          { label:'Consistency',  value:'23/27' },
          { label:'Followers',    value:'+$312K', color:'var(--regime-up-mid)' },
        ]}
        miniViz={<SigSpark points={[20,28,24,36,42,48,56,72,80,88]} color="var(--regime-up-mid)" w={64} h={32}/>}
        onGo={()=>onGo('performance')}
      />

      <ToplineCard
        sigId="SIG-W02" name="Risk Behavior"
        state="Risk rising" stateTone="bearish"
        headline="Concentration is much higher than usual."
        sub="BTC concentration 68% vs usual 25–42%. New-pair exposure elevated. Leverage normal."
        meta={[
          { label:'Biggest', value:'Concentration', color:'var(--regime-down-mid)' },
          { label:'Affected',value:'1 position' },
          { label:'Baseline',value:'30d' },
        ]}
        miniViz={<MiniDriftViz lo={0.25} hi={0.42} mark={0.78}/>}
        onGo={()=>onGo('risk')}
      />

      <ToplineCard
        sigId="SIG-W03" name="Capital Flow Confirmation"
        state="Paired sequence" stateTone="info"
        headline="$2.0M inflow → BTC long build 33m later."
        sub="Match confidence Above normal. Incremental position +$186K unrealized."
        meta={[
          { label:'Net 30d',  value:'+$3.2M', color:'var(--regime-up-mid)' },
          { label:'Lag',      value:'33m' },
          { label:'Match',    value:'Above normal', color:'var(--regime-up-mid)' },
        ]}
        miniViz={<MiniCapitalViz/>}
        onGo={()=>onGo('capital')}
      />

      <SectionLabel>Current exposure</SectionLabel>
      <ActivePositionsList/>

      <DisclaimerFooter text="Wallet signals are observations of behavior, not safety guarantees. Copying a leader does not guarantee profits."/>
    </div>
  );
}

/* ─── SIG-W01 Performance tab ─── */
function WalletPerformanceTab() {
  return (
    <div>
      <SectionLabel>SIG-W01 · Performance Trajectory</SectionLabel>
      <CurrentPerformanceState
        state="above_normal"
        metrics={[
          { label:'Realized PnL', value:'+$1.82M', color:'var(--regime-up-mid)' },
          { label:'Unrealized PnL', value:'+$420K', color:'var(--regime-up-mid)' },
          { label:'Consistency', value:'23 / 27 profitable active days' },
          { label:'Max drawdown', value:'−8.4%', color:'var(--regime-down-mid)' },
          { label:'Liquidations', value:'0' },
          { label:'Follower outcome', value:'+$312K actual', color:'var(--regime-up-mid)' },
        ]}
      />
      <ModuleSpacer/>
      <TrackRecordTimeline states={[
        { state:'above_normal',  when:'Now · day 412',
          note:'Strong state held 45 days. Drawdown contained to −8.4% across two cycles.',
          metric:'Realized PnL +$1.82M' },
        { state:'above_normal',  when:'Day 202',
          note:'Crossed sample-size threshold with consistent positive realized PnL.',
          metric:'Realized PnL +$1.48M' },
        { state:'improving',     when:'Day 60',
          note:'Realized PnL turned positive. Drawdown not worsening.',
          metric:'Realized PnL +$260K' },
        { state:'unproven',      when:'Day 1',
          note:'Visible but not qualified — sample size below threshold.' },
      ]}/>
      <ModuleSpacer/>
      <PerformanceDrivers drivers={[
        { kind:'Realized PnL', text:'BTC-PERP generated +$820K closed profit', value:'+$820K', color:'var(--regime-up-mid)' },
        { kind:'Consistency',  text:'23 of 27 active days were profitable', value:'85%' },
        { kind:'Drawdown',     text:'Largest drawdown was −8.4% over the period', value:'−8.4%', color:'var(--regime-down-mid)' },
        { kind:'Follower outcome', text:'Actual follower-trade profit since this wallet was visible', value:'+$312K', color:'var(--regime-up-mid)' },
      ]}/>
      <ModuleSpacer/>
      <InstrumentContribution rows={[
        { sym:'BTC',  pnl:'+$820K', pnlRaw:820,  trades:42, activeDays:24, winRate:'78%' },
        { sym:'ETH',  pnl:'+$540K', pnlRaw:540,  trades:36, activeDays:22, winRate:'72%' },
        { sym:'SOL',  pnl:'+$320K', pnlRaw:320,  trades:28, activeDays:18, winRate:'68%' },
        { sym:'HYPE', pnl:'+$180K', pnlRaw:180,  trades:18, activeDays:11, winRate:'61%' },
        { sym:'PEPE', pnl:'−$40K',  pnlRaw:-40, trades:6,  activeDays:4,  winRate:'33%' },
      ]}/>
      <DisclaimerFooter text="Performance is historical. Past performance does not indicate future results. Unrealized PnL is not equal to realized PnL."/>
    </div>
  );
}

/* ─── SIG-W02 Risk tab ─── */
function WalletRiskTab() {
  return (
    <div>
      <SectionLabel>SIG-W02 · Risk Behavior</SectionLabel>
      <CurrentRiskState
        state="rising"
        summary="BTC concentration is much higher than usual. New-pair exposure is elevated. Leverage and trade frequency are inside usual range."
        dimensions={[
          { dim:'Concentration', state:'much' },
          { dim:'New pair exposure', state:'elevated' },
          { dim:'Leverage', state:'normal' },
          { dim:'Trade frequency', state:'normal' },
          { dim:'Liquidations', state:'normal' },
          { dim:'Drawdown', state:'watch' },
        ]}
      />
      <ModuleSpacer/>
      <BiggestRiskDriver
        dim="BTC concentration"
        current="68%"
        normal="25%–42%"
        summary="This wallet is much more concentrated than usual. The top position is a larger share of total exposure than it typically carries."
        sev="much"
      />
      <ModuleSpacer/>
      <RiskVsUsualRange cards={[
        {
          dim:'Concentration', state:'much',
          current:68, median:33, rangeLow:25, rangeHigh:42, unit:'%',
          examples:['Top position · BTC-PERP $18.2M long']
        },
        {
          dim:'New pair exposure', state:'elevated',
          current:31, median:4, rangeLow:0, rangeHigh:12, unit:'%',
          examples:['Usually: BTC · ETH · SOL · HYPE','New: PEPE']
        },
        {
          dim:'Leverage', state:'normal',
          current:5.8, median:5.2, rangeLow:3.5, rangeHigh:7.0, unit:'×',
        },
        {
          dim:'Trade frequency', state:'normal',
          current:4.7, median:4.4, rangeLow:2.8, rangeHigh:6.6, unit:'/d',
        },
      ]}/>
      <ModuleSpacer/>
      <UsualRangeMethod/>
      <DisclaimerFooter text="Risk vs usual range means behavior changed from this wallet's own normal — not that it is objectively unsafe."/>
    </div>
  );
}

/* ─── SIG-W03 Capital tab ─── */
function WalletCapitalTab() {
  return (
    <div>
      <SectionLabel>SIG-W03 · Capital Flow Confirmation</SectionLabel>
      <CurrentCapitalState
        headline="Fresh inflow detected"
        amount="+$2.0M"
        walletEquityPct="8.1%"
        plain="BTC long sequence started 33m after the inflow. Incremental position is currently profitable."
        paired
        pairedTrade="BTC-PERP long build +$1.52M"
        pairedLag="33m after inflow"
        incrementalPnl="+$186K"
      />
      <ModuleSpacer/>
      <CapitalEventTimelineV2 events={[
        { kind:'inflow',  label:'+$2.0M USDC inflow',       time:'09:12 · today',
          detail:'External transfer from exchange wallet — 8.1% of wallet equity.' },
        { kind:'trade',   label:'BTC-PERP long +$1.1M',     time:'09:45 · today',
          detail:'33m after inflow. First leg of paired trade sequence.' },
        { kind:'trade',   label:'BTC-PERP long +$420K',     time:'10:18 · today',
          detail:'Added on retest within 1h of first leg.' },
        { kind:'inflow',  label:'+$400K USDC inflow',       time:'2d ago',
          detail:'Paired with SOL-PERP long build 1h 12m later.' },
        { kind:'outflow', label:'−$300K USDC withdrawal',   time:'12d ago',
          detail:'52m before ETH-PERP de-risking.' },
        { kind:'inflow',  label:'+$1.0M USDC inflow',       time:'17d ago',
          detail:'No meaningful trade followed within 7 days — unpaired.' },
      ]}/>
      <ModuleSpacer/>
      <FundingTradeMatch
        event="+$2.0M USDC inflow"
        trade="BTC-PERP long build +$1.52M"
        lag="33m"
        confidence="above"
        confidenceDetail="Within 24h and ≥5% of wallet equity. Strong funding-to-trade proximity."
      />
      <ModuleSpacer/>
      <PairedTradeOutcomes
        basis="PnL on incremental BTC-PERP long position added after the paired trade timestamp"
        outcomes={[
          { window:'1h after entry',  pnl:'+$42K',  pnlRaw:42,  note:'Position green' },
          { window:'24h after entry', pnl:'+$128K', pnlRaw:128, note:'Position still green' },
          { window:'7d after entry',  pnl:'+$186K', pnlRaw:186, note:'Position still open' },
          { window:'Current',         pnl:'+$186K', pnlRaw:186, note:'Open · winning' },
        ]}
      />
      <DisclaimerFooter text="Does not prove the inflow was deposited into a specific instrument. Does not prove causality between funding and trade. Delayed but meaningful trades within 7 days still pair."/>
    </div>
  );
}

Object.assign(window, {
  WalletHero, ActivePositionsList, WalletSignalsScreen,
  WalletOverview, WalletPerformanceTab, WalletRiskTab, WalletCapitalTab,
  MiniDriftViz, MiniCapitalViz
});
