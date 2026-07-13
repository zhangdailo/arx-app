// Arx Mobile — v3 screens · 5-tab IA: Home · Wallets · Trade · Markets · You
const { useState: uS } = React;

/* ─── Shared data ─── */
const D = {
  equity: 24837.42, delta: 1204.18, deltaPct: 5.10,
  chart: [10,11,10.5,12,11.8,12.5,13,12.7,14,15,14.6,16,15.8,17,18,17.4,18.6,19,18.5,20.1,21],
  positions: [
    { sym:'BTC', name:'Bitcoin',  shares:'0.0142', price:933.21, delta:42.18, deltaPct:4.72, spark:[10,11,12,11,13,14,13,15,16,17,18,17,18,19,20] },
    { sym:'SOL', name:'Solana',   shares:'8.62',  price:1278.34, delta:121.48, deltaPct:10.52, spark:[8,9,10,12,13,12,15,16,18,17,19,21,22,24,25] },
  ],
  topAssets: [
    { sym:'HYPE', name:'Hyperliquid', price:38.12, deltaPct:6.8 },
    { sym:'SOL',  name:'Solana',      price:214.60, deltaPct:4.2 },
    { sym:'GOLD', name:'XAU-PERP',    price:4832,  deltaPct:1.2 },
    { sym:'NVDA', name:'NVDA-PERP',   price:1184,  deltaPct:3.0 },
  ],
  topTraders: [
    { handle:'@solana_max', pnl:42.7, badge:'All-Weather', bc:'rgba(45,212,155,.16)', bi:'var(--regime-up-mid)' },
    { handle:'@vol_hunter', pnl:38.1, badge:'Specialist',  bc:'rgba(59,130,246,.16)', bi:'var(--regime-range-mid)' },
    { handle:'@grid_mstr',  pnl:21.0, badge:'Specialist',  bc:'rgba(59,130,246,.16)', bi:'var(--regime-range-mid)' },
    { handle:'@delta_n',    pnl:18.6, badge:'Unproven',    bc:'rgba(120,120,128,.14)', bi:'var(--text-secondary)' },
  ],
  news: [
    { title:'Fed hike odds jump to 32% on hot CPI', body:'BTC weakening at $77K; three scenarios with watch levels on Hyperliquid.', time:'2h ago' },
    { title:'Gold −10%, Oil +45% — Iran war day 70', body:'The textbook trade was wrong on two of three. Counter-intuitive RWA playbook.', time:'5h ago' },
  ],
  wallets: [
    { addr:'0x7a3f…c891', tax:'All-Weather',  score:84, roi:170.2, dd:12.4, win:68.5, aum:'$660.8K', slots:'12/50', tc:'rgba(45,212,155,.16)',  ti:'var(--regime-up-mid)' },
    { addr:'0x2c9b…4e07', tax:'Specialist',   score:79, roi:91.9,  dd:16.3, win:71.2, aum:'$7.2M',   slots:'31/50', tc:'rgba(59,130,246,.16)',  ti:'var(--regime-range-mid)' },
    { addr:'0x5f12…a3d6', tax:'Cooling down', score:73, roi:71.8,  dd:24.8, win:63.0, aum:'$62.8K',  slots:'4/50',  tc:'rgba(251,191,36,.18)',  ti:'var(--regime-trans-mid)' },
    { addr:'0x91be…77f0', tax:'Unproven',     score:61, roi:48.3,  dd:31.0, win:55.1, aum:'$18.4K',  slots:'2/50',  tc:'rgba(120,120,128,.14)', ti:'var(--text-secondary)' },
  ],
  followed: [
    { addr:'0x7a3f…c891', tax:'All-Weather', alloc:'$1,200', allocV:1200, pnl:'+$218.40', state:'live',     since:'34d', lossLeft:'31% to loss limit' },
    { addr:'0xcc01…2b88', tax:'Specialist',  alloc:'$800',   allocV:800,  pnl:'+$64.10',  state:'paused',   since:'21d', lossLeft:'paused 2d ago' },
    { addr:'0x44e9…1f07', tax:'Aggressive',  alloc:'$500',   allocV:500,  pnl:'−$251.00', state:'drawdown', since:'12d', lossLeft:'stopped at −50%' },
    { addr:'0x09ad…b733', tax:'Specialist',  alloc:'$400',   allocV:400,  pnl:'+$12.80',  state:'inactive', since:'48d', lossLeft:'no trades 30d' },
    { addr:'0x82bb…6612', tax:'All-Weather', alloc:'$600',   allocV:600,  pnl:'−$38.40',  state:'error',    since:'9d',  lossLeft:'venue reconnecting' },
  ],
  watching: [
    { addr:'0x91be…77f0', x:'@blknoiz06', taxK:'rising_star', roi:'+48.3%', win:'30D', flag:'Risk ↑', chg:'Leverage above its usual range · 6h ago' },
    { addr:'0x5f12…a3d6', x:'@Pentosh1',  taxK:'degen_winner', roi:'+71.8%', win:'90D', flag:'New high', chg:'New 90d high in realized PnL · 2d ago' },
  ],
  instruments: {
    Crypto: [
      { sym:'BTC',  name:'BTC-PERP', price:68240, deltaPct: 2.1, oi:'$1.2B', vol:'$8.2B', spark:[10,11,12,11,13,14,15,14,16,17] },
      { sym:'ETH',  name:'ETH-PERP', price:3512,  deltaPct: 1.5, oi:'$640M', vol:'$3.1B', spark:[11,12,11,13,12,14,13,15,14,16] },
      { sym:'SOL',  name:'SOL-PERP', price:214.6, deltaPct: 4.2, oi:'$310M', vol:'$1.4B', spark:[8,10,9,12,13,15,14,17,19,21] },
      { sym:'HYPE', name:'HYPE-PERP',price:38.12, deltaPct: 6.8, oi:'$420M', vol:'$799M', spark:[7,9,11,10,13,15,17,16,19,22] },
      { sym:'XRP',  name:'XRP-PERP', price:2.34,  deltaPct: 3.4, oi:'$280M', vol:'$1.1B', spark:[9,10,9,11,12,11,13,14,13,15] },
      { sym:'DOGE', name:'DOGE-PERP',price:0.162, deltaPct:-2.1, oi:'$190M', vol:'$820M', spark:[16,15,15,14,13,14,12,13,12,11] },
      { sym:'AVAX', name:'AVAX-PERP',price:38.6,  deltaPct: 5.2, oi:'$140M', vol:'$610M', spark:[8,9,11,10,12,14,13,16,17,19] },
      { sym:'SUI',  name:'SUI-PERP', price:3.42,  deltaPct: 7.1, oi:'$96M',  vol:'$440M', spark:[7,8,10,9,12,13,15,17,19,22] },
    ],
    Stocks: [
      { sym:'NVDA', name:'NVDA-PERP',price:1184,  deltaPct: 3.0, oi:'$112M', vol:'$210M', spark:[9,10,12,11,13,15,14,16,18,19] },
      { sym:'TSLA', name:'TSLA-PERP',price:348.77, deltaPct: 2.2, oi:'$98M', vol:'$176M', spark:[12,11,13,12,14,13,15,16,15,17] },
      { sym:'MSTR', name:'MSTR-PERP',price:1640,  deltaPct: 5.1, oi:'$64M',  vol:'$130M', spark:[8,10,9,12,13,12,15,16,18,20] },
      { sym:'S&P',  name:'SPX-PERP', price:6840,  deltaPct: 0.3, oi:'$76M',  vol:'$120M', spark:[12,12,13,13,14,13,14,14,15,15] },
      { sym:'AAPL', name:'AAPL-PERP',price:248.3, deltaPct: 0.8, oi:'$88M',  vol:'$150M', spark:[12,12,13,12,13,14,13,14,15,15] },
      { sym:'META', name:'META-PERP',price:612.4, deltaPct: 1.9, oi:'$72M',  vol:'$128M', spark:[10,11,12,11,13,12,14,15,14,16] },
      { sym:'AMZN', name:'AMZN-PERP',price:224.1, deltaPct: 1.2, oi:'$66M',  vol:'$115M', spark:[11,11,12,13,12,13,14,13,15,15] },
      { sym:'GOOGL',name:'GOOGL-PERP',price:196.8,deltaPct:-0.5, oi:'$58M',  vol:'$98M',  spark:[14,14,13,14,13,12,13,12,13,12] },
    ],
    PreIPO: [
      { sym:'OPENAI', name:'OPENAI-PERP', price:312.0, deltaPct: 4.8, oi:'$54M', vol:'$88M', spark:[7,9,8,11,12,14,13,16,18,20] },
      { sym:'SPACEX', name:'SPACEX-PERP', price:182.4, deltaPct: 1.4, oi:'$38M', vol:'$61M', spark:[11,12,11,13,12,14,13,14,15,16] },
      { sym:'STRIPE', name:'STRIPE-PERP', price:96.40, deltaPct:-0.6, oi:'$22M', vol:'$40M', spark:[15,14,15,13,14,12,13,12,12,11] },
      { sym:'ANTHRP', name:'ANTHROPIC-PERP', price:184.0, deltaPct: 6.2, oi:'$44M', vol:'$77M', spark:[7,9,8,11,13,12,15,17,19,21] },
      { sym:'DBRX', name:'DATABRICKS-PERP', price:142.5, deltaPct: 2.8, oi:'$28M', vol:'$52M', spark:[9,10,11,10,12,13,12,14,15,16] },
      { sym:'REVLT', name:'REVOLUT-PERP', price:88.2, deltaPct: 1.1, oi:'$19M', vol:'$34M', spark:[11,12,11,13,12,13,14,13,14,15] },
      { sym:'CANVA', name:'CANVA-PERP', price:64.8, deltaPct:-1.4, oi:'$14M', vol:'$26M', spark:[15,14,14,13,14,13,12,13,12,11] },
      { sym:'EPIC', name:'EPICGAMES-PERP', price:52.3, deltaPct: 0.9, oi:'$11M', vol:'$21M', spark:[11,11,12,11,12,13,12,13,13,14] },
    ],
    Commodities: [
      { sym:'GOLD', name:'XAU-PERP',  price:4832,  deltaPct: 1.2, oi:'$145M', vol:'$188M', spark:[10,11,12,13,12,14,15,16,15,17] },
      { sym:'OIL',  name:'WTI-PERP', price:74.12, deltaPct:-0.8, oi:'$89M',  vol:'$96M',  spark:[16,15,14,15,13,14,12,13,12,11] },
      { sym:'SILVER', name:'XAG-PERP', price:64.02, deltaPct:-6.6, oi:'$48M',  vol:'$188M', spark:[18,17,16,15,14,13,12,11,10,9] },
      { sym:'COPPER', name:'HG-PERP',  price:4.612, deltaPct: 1.1, oi:'$22M',  vol:'$74M',  spark:[11,11,12,12,13,12,13,14,13,14] },
      { sym:'NATGAS', name:'NG-PERP',  price:2.914, deltaPct: 4.5, oi:'$31M',  vol:'$110M', spark:[8,9,10,9,11,12,11,13,14,16] },
      { sym:'PLAT', name:'XPT-PERP',  price:1024,  deltaPct: 0.7, oi:'$26M',  vol:'$58M',  spark:[11,12,11,12,13,12,13,14,13,14] },
      { sym:'WHEAT',name:'ZW-PERP',   price:5.84,  deltaPct:-1.8, oi:'$14M',  vol:'$32M',  spark:[15,14,15,14,13,14,12,13,12,11] },
      { sym:'URANIUM',name:'UX-PERP', price:84.5,  deltaPct: 3.3, oi:'$9M',   vol:'$24M',  spark:[8,9,10,9,11,12,13,12,14,15] },
    ],
    Fx: [
      { sym:'EUR', name:'EUR-USD',  price:1.0842, deltaPct: 0.2, oi:'$54M', vol:'$310M', spark:[12,12,13,12,13,13,14,13,14,14] },
      { sym:'GBP', name:'GBP-USD',  price:1.2710, deltaPct:-0.4, oi:'$32M', vol:'$180M', spark:[14,14,13,14,12,13,12,12,11,12] },
      { sym:'JPY', name:'USD-JPY',  price:156.42, deltaPct: 0.6, oi:'$41M', vol:'$220M', spark:[10,11,11,12,12,13,13,14,14,15] },
      { sym:'AUD', name:'AUD-USD',  price:0.6612, deltaPct: 0.3, oi:'$28M', vol:'$140M', spark:[11,11,12,11,12,12,13,13,14,14] },
      { sym:'CAD', name:'USD-CAD',  price:1.3842, deltaPct:-0.2, oi:'$24M', vol:'$120M', spark:[14,14,13,14,13,13,12,13,12,12] },
      { sym:'CHF', name:'USD-CHF',  price:0.8821, deltaPct: 0.1, oi:'$19M', vol:'$96M',  spark:[12,12,13,12,13,12,13,13,13,14] },
      { sym:'CNH', name:'USD-CNH',  price:7.182,  deltaPct:-0.3, oi:'$22M', vol:'$110M', spark:[13,13,14,13,13,12,13,12,12,12] },
      { sym:'MXN', name:'USD-MXN',  price:18.42,  deltaPct: 0.5, oi:'$14M', vol:'$72M',  spark:[11,11,12,12,12,13,13,13,14,14] },
    ],
  },
  activity: [
    { who:'0x29d5…e123', tag:'Whale',       side:'SHORT', verb:'Opened',  sym:'GOLD', size:'$133.22K', price:'4,157.15', pnl:null,       time:'21s' },
    { who:'0x5f50…fb8c', tag:'Smart money', side:'LONG',  verb:'Closed',  sym:'ETH',  size:'$170.86K', price:'1,619.06', pnl:'−$9.23',   time:'32s' },
    { who:'0xecb6…2b00', tag:'Smart money', side:'LONG',  verb:'Reduced', sym:'BTC',  size:'$105.57K', price:'61,216.0', pnl:'−$316.12', time:'1m'  },
    { who:'0x9426…1b2e', tag:'Whale',       side:'SHORT', verb:'Reduced', sym:'BTC',  size:'$190.74K', price:'61,219.1', pnl:'+$115.93', time:'1m'  },
    { who:'0x63d4…0522', tag:'Following',   side:'LONG',  verb:'Reduced', sym:'BTC',  size:'$116.56K', price:'61,222.0', pnl:'−$3.23K',  time:'45s' },
    { who:'0x7a3f…c891', tag:'Following',   side:'LONG',  verb:'Opened',  sym:'SOL',  size:'$420.00K', price:'212.40',   pnl:null,       time:'3m'  },
  ],
  clusterTrades: [
    { who:'0x7a3f…c891', tag:'Smart money', side:'LONG',  size:'$420K', entry:'$212.40', time:'4m' },
    { who:'0x2c9b…4e07', tag:'Whale',       side:'LONG',  size:'$1.1M', entry:'$211.86', time:'11m' },
    { who:'0x5f12…a3d6', tag:'Smart money', side:'SHORT', size:'$88K',  entry:'$215.02', time:'26m' },
  ],
};

/* ─── Small shared pieces ─── */
function Avatar({ label, size = 44 }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:'linear-gradient(135deg, var(--color-violet-700), var(--color-violet-400))',
      display:'flex', alignItems:'center', justifyContent:'center',
      font:`700 ${Math.round(size*0.32)}px var(--font-body)`, color:'#fff'
    }}>{label.replace(/[@0x]/g,'').slice(0,2).toUpperCase()}</div>
  );
}
function TaxBadge({ tax, bg, ink }) {
  return <span style={{font:'600 11px var(--font-body)', color:ink, background:bg, padding:'2px 8px', borderRadius:999, letterSpacing:'.02em', whiteSpace:'nowrap'}}>{tax}</span>;
}
function Screen({ children, bg, theme }) {
  return <div data-theme={theme} style={{position:'absolute', top:54, left:0, right:0, bottom:0, overflow:'auto', paddingBottom:118, background:bg||'none', color:'var(--text-primary)'}}>{children}</div>;
}

/* Live on-chain action row (Activity feed) — tap identity to study, Copy to start the same forward-only flow */
const ACT_WALLET = { 'Smart money':0, 'Whale':3, 'Following':1, 'New':2 };
function actWalletFor(a){ return WALLETS[ACT_WALLET[a.tag] != null ? ACT_WALLET[a.tag] : 0]; }
function ActivityRow({ a }) {
  const long = a.side==='LONG';
  const sideInk = long ? 'var(--regime-up-mid)' : 'var(--regime-down-mid)';
  const sideBg = long ? 'rgba(45,212,155,.12)' : 'rgba(242,106,106,.12)';
  const w = actWalletFor(a);
  return (
    <div style={{margin:'8px 20px', padding:'12px 14px', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:14}}>
      <div style={{display:'flex', alignItems:'flex-start', gap:10}}>
        <AssetGlyph sym={a.sym} size={30}/>
        <button onClick={()=>window.__arxOpenSub && window.__arxOpenSub('walletDetail',{w})} style={{flex:1, minWidth:0, background:'none', border:'none', padding:0, cursor:'pointer', textAlign:'left'}}>
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            <span className="num" style={{font:'600 12.5px var(--font-mono)'}}>{a.who}</span>
            <span style={{font:'600 9px var(--font-body)', color:'var(--color-violet-700)', background:'rgba(124,91,255,.14)', padding:'1px 6px', borderRadius:999}}>{a.tag}</span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:6, marginTop:5}}>
            <span style={{font:'700 9.5px var(--font-body)', color:sideInk, background:sideBg, padding:'2px 7px', borderRadius:6, textTransform:'uppercase', letterSpacing:'.03em'}}>{a.side}</span>
            <span style={{font:'500 12.5px var(--font-body)', color:'var(--text-secondary)'}}>{a.verb} <b style={{color:'var(--text-primary)'}}>{a.sym}</b></span>
          </div>
        </button>
        <span style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', flexShrink:0}}>{a.time}</span>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:10, marginTop:8}}>
        <div className="num" style={{font:'700 17px var(--font-mono)'}}>{a.size} <span style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)'}}>@ {a.price}</span></div>
        {a.pnl && <div className="num" style={{font:'600 13px var(--font-mono)', color: a.pnl.startsWith('+')?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{a.pnl}</div>}
        <span style={{flex:1}}/>
        {w.copyable && <button onClick={()=>window.__arxOpenSub && window.__arxOpenSub('copySetup',{w})} className="arx-press" style={{flexShrink:0, height:30, padding:'0 14px', borderRadius:9, border:'none', cursor:'pointer', background:'rgba(124,91,255,.14)', color:'var(--color-violet-500)', font:'700 12px var(--font-body)'}}>Copy</button>}
      </div>
    </div>
  );
}

/* ═══ 1 · HOME — equity · positions · top assets · top traders · news · feed ═══ */
function HomeScreen({ onTrade, onTabChange }) {
  const [range, setRange] = uS('1D');
  const [feedTab, setFeedTab] = uS('feed');
  const [actFilter, setActFilter] = uS('All');
  const [lcStage, setLcStage] = uS(()=>{ try { return localStorage.getItem('arx-lifecycle')||'active'; } catch(e){ return 'active'; } });
  const [persona, setPersona] = uS(()=>{ try { return localStorage.getItem('arx-persona')||'s7'; } catch(e){ return 's7'; } });
  const setStage = (s)=>{ setLcStage(s); try{ localStorage.setItem('arx-lifecycle', s); }catch(e){} };
  const setPers = (p)=>{ setPersona(p); try{ localStorage.setItem('arx-persona', p); }catch(e){} };
  const [revealBanner, setRevealBanner] = uS(false);
  React.useEffect(()=>{
    const check = (e)=>{ const t=e.target; if (t && typeof t.scrollTop==='number' && t.scrollTop>70) setRevealBanner(true); };
    document.addEventListener('scroll', check, true);
    return ()=>document.removeEventListener('scroll', check, true);
  }, []);
  useScrollReveal();
  React.useEffect(()=>{
    const h=()=>{ try{ setLcStage(localStorage.getItem('arx-lifecycle')||'active'); setPersona(localStorage.getItem('arx-persona')||'s7'); }catch(e){} };
    window.addEventListener('arx-demo', h);
    return ()=>window.removeEventListener('arx-demo', h);
  }, []);
  return (
    <Screen bg="none">
      <TopBar title="Home" stage={lcStage} bellCount={4} balance="$24,837" risk={lcStage==='risk_stress'?'critical':'normal'}/>
      <UnifiedSearchBar context="home"/>
      <NewsTicker/>
      <LifecycleHero stage={lcStage} persona={persona} onTrade={onTrade} onTabChange={onTabChange}/>
      <Carousel dots={false}>
        <div>
          {(() => {
            const sc = window.arxStageState ? window.arxStageState(lcStage) : null;
            const eq = sc && sc.equity != null ? sc.equity : D.equity;
            const dl = sc && sc.delta != null ? sc.delta : D.delta;
            const dpct = eq > 0 ? (dl / (eq - dl)) * 100 : 0;
            return eq > 0 ? (
              <React.Fragment>
                <HeroValue value={eq} delta={dl} deltaPct={dpct} range={range} chart={D.chart}/>
                <TimeRangeTabs value={range} onChange={setRange}/>
                <EquityBreakdown stage={lcStage} equity={eq}/>
              </React.Fragment>
            ) : <EmptyEquity stage={lcStage}/>;
          })()}
        </div>
        <DailyBrief persona={persona==='s2'?'s2':'s7'} onTabChange={onTabChange}/>
      </Carousel>

      {(() => {
        const s2Home = persona === 's2';
        const quick = s2Home ? [
          {label:'Trade', icon:'signals', onClick:onTrade},
          {label:'Positions', icon:'more', onClick:()=>onTabChange('you')},
          {label:'Markets', icon:'vaults', onClick:()=>onTabChange('markets')},
          {label:'Watchlist', icon:'watchlist', onClick:()=>onTabChange('wallets')},
          {label:'Signals', icon:'signals', onClick:()=>onTabChange('markets')},
          {label:'Add funds', icon:'funding', onClick:()=>window.__arxOpenSub && window.__arxOpenSub('funding')},
          {label:'PnL Calendar', icon:'calendar', onClick:()=>onTabChange('you')},
        ] : [
          {label:'Positions', icon:'more', onClick:()=>onTabChange('you')},
          {label:'Leaderboard', icon:'leaderboard', onClick:()=>onTabChange('wallets')},
          {label:'Watchlist', icon:'watchlist', onClick:()=>onTabChange('wallets')},
          {label:'Add funds', icon:'funding', onClick:()=>window.__arxOpenSub && window.__arxOpenSub('funding')},
          {label:'PnL Calendar', icon:'calendar', onClick:()=>onTabChange('you')},
          {label:'Signals', icon:'signals', onClick:()=>onTabChange('markets')},
          {label:'Rewards', icon:'rewards', onClick:()=>window.__arxOpenSub && window.__arxOpenSub('rewards')},
          {label:'Markets', icon:'vaults', onClick:()=>onTabChange('markets')},
        ];
        const Positions = (
          <React.Fragment key="pos">
            <SectionHeader action="View all" onAction={()=>onTabChange('you')}>Positions</SectionHeader>
            {D.positions.map(p => <ListRow key={p.sym} {...p} sparkline={p.spark} onClick={onTrade}/>)}
          </React.Fragment>
        );
        const Regime = (
          <React.Fragment key="reg">
            <SectionHeader action="Markets" onAction={()=>onTabChange('markets')}>Market regime</SectionHeader>
            <SentimentGauge value={38}/>
          </React.Fragment>
        );
        const WhatIf = (
          <WhatIfSpotlight key="whatif" sym="SOL" onTrade={(s)=>onTrade && onTrade(s)}/>
        );
        const Heat = (
          <React.Fragment key="heat">
            {window.MarketHeatmap ? (() => {
              const hItems = (D.topMarkets||[]).map(m=>({ symbol:m.sym, weight:Math.abs(parseFloat(String(m.vol||'1').replace(/[$BMK,]/g,''))*(String(m.vol||'').includes('B')?1e9:String(m.vol||'').includes('M')?1e6:1e3)), deltaPct:m.deltaPct||0 }));
              return <div style={{padding:'0 20px'}}><MarketHeatmap items={hItems} height={220} width={362} onTap={sym=>{const m=D.topMarkets.find(x=>x.sym===sym); if(m) window.__arxOpenSub&&window.__arxOpenSub('instrumentDetail',{m});}}/></div>;
            })() : <Heatmap onOpen={(m)=>window.__arxOpenSub && window.__arxOpenSub('instrumentDetail',{m})}/>}
          </React.Fragment>
        );
        const Positioning = (
          <MarketPositioning key="pos2" sym="SOL" longPct={64}/>
        );
        const Assets = (
          <React.Fragment key="ast">
            <SectionHeader action="Markets" onAction={()=>onTabChange('markets')}>Top assets</SectionHeader>
            <div style={{display:'flex', gap:10, overflowX:'auto', padding:'2px 20px 6px', scrollbarWidth:'none'}}>
              {D.topAssets.map(a => (
                <button key={a.sym} className="arx-press" onClick={()=>onTabChange('markets')} style={{
                  flex:'0 0 124px', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)',
                  borderRadius:14, padding:12, textAlign:'left', cursor:'pointer'
                }}>
                  <AssetGlyph sym={a.sym} size={26}/>
                  <div style={{font:'600 13px var(--font-body)', marginTop:8}}>{a.sym}</div>
                  <div className="num" style={{font:'500 12px var(--font-mono)', color:'var(--text-secondary)', marginTop:2}}>${a.price.toLocaleString()}</div>
                  <div className="num" style={{font:'600 12px var(--font-mono)', color:a.deltaPct>=0?'var(--regime-up-mid)':'var(--regime-down-mid)', marginTop:2}}>{a.deltaPct>=0?'+':'−'}{Math.abs(a.deltaPct).toFixed(1)}%</div>
                </button>
              ))}
            </div>
          </React.Fragment>
        );
        const Traders = (
          <React.Fragment key="trd">
            <SectionHeader action="Copy" onAction={()=>onTabChange('wallets')}>Top traders</SectionHeader>
            <div style={{display:'flex', gap:10, overflowX:'auto', padding:'2px 20px 6px', scrollbarWidth:'none'}}>
              {D.topTraders.map(t => (
                <button key={t.handle} className="arx-press" onClick={()=>onTabChange('wallets')} style={{
                  flex:'0 0 132px', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)',
                  borderRadius:14, padding:12, textAlign:'center', cursor:'pointer'
                }}>
                  <div style={{display:'flex', justifyContent:'center'}}><PersonAvatar seed={t.handle} size={40}/></div>
                  <div style={{font:'600 12px var(--font-body)', marginTop:8}}>{t.handle}</div>
                  <div className="num" style={{font:'600 14px var(--font-mono)', color:'var(--regime-up-mid)', marginTop:3}}>+{t.pnl}%</div>
                  <div style={{marginTop:6}}><TaxBadge tax={t.badge} bg={t.bc} ink={t.bi}/></div>
                </button>
              ))}
            </div>
          </React.Fragment>
        );
        const Brief = (
          <DailyBrief key="brief" persona={persona==='s2'?'s2':'s7'} onTabChange={onTabChange}/>
        );
        const Stream = (<NewsStream key="stream"/>);
        const Banner = (revealBanner && !['first_install','connected_no_deposit'].includes(lcStage))
          ? <div key="banner" className="arx-arrive" style={{padding:'4px 20px 12px'}}><BannerCarousel/></div> : null;
        // Quick actions sit right under the equity card; the promo carousel sits
        // right above News & events; the body is the daily catch-up.
        const order = s2Home ? [WhatIf, Banner, Stream] : [Banner, Stream];
        return (
          <React.Fragment>
            <div style={{padding:'16px 0 2px'}}><QuickActionsGrid items={quick}/></div>
            {order}
          </React.Fragment>
        );
      })()}
    </Screen>
  );
}

/* ═══ 2 · COPY — S7-first discovery: search · wizard · clusters · taxonomy cards · profile ═══ */

const TAX = {
  // performance_type → badge + plain-language expectancy (spec 5-7-1 §7: never raw ratios, win rate never without context)
  new_blood:       { label:'New blood',       bg:'rgba(59,130,246,.14)',  ink:'var(--regime-range-mid)', exp:'Too new to judge — under 30 days of evidence.' },
  smart_money:     { label:'Smart money',     bg:'rgba(45,212,155,.16)',  ink:'var(--regime-up-mid)',   exp:'Consistent gains, controlled risk — proven over 90 days.' },
  rising_star:     { label:'Rising star',     bg:'rgba(124,91,255,.16)', ink:'var(--color-violet-500)',exp:'Hot last 30 days — no long track record yet.' },
  degen_winner:    { label:'Degen winner',    bg:'rgba(251,191,36,.16)',  ink:'var(--regime-trans-mid)',exp:'Profitable, but the ride is violent.' },
  one_shot_winner: { label:'One-shot winner', bg:'rgba(251,191,36,.16)',  ink:'var(--regime-trans-mid)',exp:'Most of the profit came from one big win.' },
  unproven:        { label:'Unproven',        bg:'rgba(120,120,128,.14)', ink:'var(--text-secondary)',  exp:'No clear edge yet, either way.' },
  full_rekt:       { label:'Full rekt',            bg:'rgba(242,106,106,.16)', ink:'var(--regime-down-mid)', exp:'Wins often — loses big when wrong.' },
};
const BTC_BENCH = { '24H':1.2, '7D':4.8, '30D':9.5, '90D':31.0 };  // BTC-PERP return per window — the benchmark every PnL is judged against
const CAP = { micro:'Micro · <$1K', small:'Small · $1K–10K', mid:'Mid · $10K–100K', large:'Large · $100K–1M', whale:'Whale · $1M+' };  // 5-7-1 §6.3 bands
const STYLE = { scalper:'Scalper', day_trader:'Day trader', swing_trader:'Swing trader', position_trader:'Position trader' };

/* Settled-trade counts — industry definition: win rate = winning settled trades / all settled trades.
   Deterministic per wallet (style sets cadence) until real fill history is wired. */
const TRADES_90D = { scalper:702, day_trader:286, swing_trader:124, position_trader:48 };
const tradesOf = (w) => {
  const base = TRADES_90D[w.style] || 120;
  const t = Math.max(8, Math.round(base * (0.75 + (w.aumV % 7) / 14)));
  return { t, win: Math.round(t * w.winRate / 100) };
};

const WALLETS = [
  { addr:'0x7a3f…c891', winRate:68.5, copierPnlV:1200000, aumV:660800, assets:["majors","rwa"], liqs:0, maxLev:6, perf:'smart_money', cap:'whale', style:'position_trader', clusters:['smart','whale'], x:null,
    roi90:142.6, roi30:38.4, dd:12.4, posWeeks:11, weeks:13, copiers:1284, slots:'12/50', aum:'$660.8K',
    stats:{ '24H':{pnl:'+$12.4K',roi:1.9,dd:1.2,rec:'7/9',recL:'Green trades'}, '7D':{pnl:'+$48.2K',roi:7.3,dd:3.8,rec:'6/7',recL:'Green days'}, '30D':{pnl:'+$418.7K',roi:38.4,dd:8.9,rec:'3/4',recL:'Green weeks'}, '90D':{pnl:'+$1.02M',roi:142.6,dd:12.4,rec:'11/13',recL:'Green weeks'} },
    spark:[10,11,12,12,13,14,13,15,16,17,18,18,19,20,21], copyable:true,
    positions:[{sym:'SOL', dir:'LONG', lev:'6x', size:'$420K', entry:'$212.40'},{sym:'GOLD', dir:'LONG', lev:'3x', size:'$180K', entry:'$4,790'}] },
  { addr:'0x2c9b…4e07', winRate:71.2, copierPnlV:184000, aumV:84200, assets:["majors"], liqs:0, maxLev:5, perf:'smart_money', cap:'mid', style:'swing_trader', clusters:['smart'], x:'@HsakaTrades',
    roi90:91.9, roi30:24.1, dd:16.3, posWeeks:10, weeks:13, copiers:902, slots:'31/50', aum:'$84.2K',
    stats:{ '24H':{pnl:'+$640',roi:1.5,dd:2.1,rec:'4/6',recL:'Green trades'}, '7D':{pnl:'+$2.1K',roi:4.8,dd:5.2,rec:'5/7',recL:'Green days'}, '30D':{pnl:'+$9.4K',roi:24.1,dd:11.0,rec:'3/4',recL:'Green weeks'}, '90D':{pnl:'+$31.2K',roi:91.9,dd:16.3,rec:'10/13',recL:'Green weeks'} },
    spark:[12,13,12,14,15,14,16,17,16,18,19,20,19,21,22], copyable:true,
    positions:[{sym:'ETH', dir:'SHORT', lev:'4x', size:'$36K', entry:'$3,560'}] },
  { addr:'0x91be…77f0', winRate:63.0, copierPnlV:8200, aumV:8400, assets:["alts"], liqs:0, maxLev:8, perf:'rising_star', cap:'small', style:'day_trader', clusters:['rising'], x:'@blknoiz06',
    roi90:null, roi30:48.3, dd:18.0, posWeeks:4, weeks:4, copiers:188, slots:'6/50', aum:'$8.4K',
    stats:{ '24H':{pnl:'+$310',roi:3.8,dd:2.4,rec:'5/6',recL:'Green trades'}, '7D':{pnl:'+$1.9K',roi:12.1,dd:6.0,rec:'6/7',recL:'Green days'}, '30D':{pnl:'+$3.6K',roi:48.3,dd:18.0,rec:'4/4',recL:'Green weeks'}, '90D':null },
    spark:[10,10,11,12,11,13,14,16,15,18,20,22,21,24,26], copyable:true,
    positions:[{sym:'HYPE', dir:'LONG', lev:'8x', size:'$3.2K', entry:'$36.90'}] },
  { addr:'0x5f12…a3d6', winRate:55.4, copierPnlV:-92000, aumV:310000, assets:["majors","alts"], liqs:1, maxLev:12, perf:'degen_winner', cap:'large', style:'swing_trader', clusters:['whale'], x:'@Pentosh1',
    roi90:71.8, roi30:-9.2, dd:34.8, posWeeks:7, weeks:13, copiers:451, slots:'4/50', aum:'$310K',
    stats:{ '24H':{pnl:'−$2.2K',roi:-0.8,dd:4.0,rec:'2/5',recL:'Green trades'}, '7D':{pnl:'−$8.4K',roi:-3.1,dd:12.5,rec:'3/7',recL:'Green days'}, '30D':{pnl:'−$24.0K',roi:-9.2,dd:21.0,rec:'2/4',recL:'Green weeks'}, '90D':{pnl:'+$182K',roi:71.8,dd:34.8,rec:'7/13',recL:'Green weeks'} },
    spark:[10,14,9,16,11,19,13,22,15,25,17,28,20,24,27], copyable:true,
    positions:[{sym:'BTC', dir:'LONG', lev:'12x', size:'$120K', entry:'$67,400'}] },
  { addr:'0xcc01…2b88', winRate:58.8, copierPnlV:3100, aumV:6100, assets:["rwa"], liqs:0, maxLev:4, perf:'one_shot_winner', cap:'small', style:'position_trader', clusters:[], x:null,
    roi90:38.2, roi30:2.1, dd:14.5, posWeeks:6, weeks:13, copiers:96, slots:'9/50', aum:'$6.1K',
    stats:{ '24H':{pnl:'+$12',roi:0.2,dd:0.8,rec:'2/3',recL:'Green trades'}, '7D':{pnl:'+$60',roi:0.4,dd:2.2,rec:'4/7',recL:'Green days'}, '30D':{pnl:'+$180',roi:2.1,dd:6.8,rec:'2/4',recL:'Green weeks'}, '90D':{pnl:'+$2.2K',roi:38.2,dd:14.5,rec:'6/13',recL:'Green weeks'} },
    spark:[10,10,10,11,10,11,11,22,22,23,22,23,23,22,23], copyable:true,
    positions:[] },
  { addr:'0x44d2…09be', winRate:61.0, copierPnlV:0, aumV:12800, assets:["alts"], liqs:2, maxLev:20, perf:'full_rekt', cap:'mid', style:'scalper', clusters:['rekt'], x:null,
    roi90:-42.0, roi30:-18.6, dd:51.2, posWeeks:3, weeks:13, copiers:0, slots:'—', aum:'$12.8K',
    stats:{ '24H':{pnl:'−$280',roi:-2.2,dd:5.1,rec:'1/4',recL:'Green trades'}, '7D':{pnl:'−$1.1K',roi:-6.2,dd:9.0,rec:'2/7',recL:'Green days'}, '30D':{pnl:'−$3.2K',roi:-18.6,dd:22.4,rec:'1/4',recL:'Green weeks'}, '90D':{pnl:'−$8.9K',roi:-42.0,dd:51.2,rec:'3/13',recL:'Green weeks'} },
    spark:[20,21,19,22,18,20,16,18,14,15,12,13,10,9,8], copyable:false,
    positions:[{sym:'SOL', dir:'SHORT', lev:'20x', size:'$9K', entry:'$209.10'}] },
];
WALLETS.push({ addr:'0x09af…3e21', winRate:52.0, copierPnlV:0, aumV:640, assets:["majors"], liqs:0, maxLev:3, perf:'new_blood', cap:'micro', style:'day_trader', clusters:[], x:null,
    roi90:null, roi30:null, dd:6.2, posWeeks:1, weeks:2, copiers:0, slots:'0/50', aum:'$640',
    stats:{ '24H':{pnl:'+$9',roi:1.4,dd:0.6,rec:'3/4',recL:'Green trades'}, '7D':{pnl:'+$38',roi:3.1,dd:2.0,rec:'4/7',recL:'Green days'}, '30D':null, '90D':null },
    spark:[10,10,11,10,11,12,11,12,12,13,12,13,13,14,14], copyable:false, positions:[] });

/* ── Extended roster — covers the remaining copy scenarios, ranks by PnL ── */
WALLETS.push({ addr:'0x6f22…0a9c', winRate:73.8, copierPnlV:1640000, aumV:920000, assets:["majors","alts"], liqs:0, maxLev:5, perf:'smart_money', cap:'whale', style:'position_trader', clusters:['smart','whale'], x:'@GiganticRebirth',
  roi90:96.4, roi30:33.2, dd:9.1, posWeeks:12, weeks:13, copiers:1620, slots:'48/50', aum:'$920.0K',
  stats:{ '24H':{pnl:'+$18.9K',roi:2.1,dd:1.0,rec:'8/9',recL:'Green trades'}, '7D':{pnl:'+$72.4K',roi:8.6,dd:3.1,rec:'7/7',recL:'Green days'}, '30D':{pnl:'+$305.2K',roi:33.2,dd:7.4,rec:'4/4',recL:'Green weeks'}, '90D':{pnl:'+$886K',roi:96.4,dd:9.1,rec:'12/13',recL:'Green weeks'} },
  spark:[11,12,13,13,14,15,15,16,17,18,19,20,21,22,23], copyable:true,
  positions:[{sym:'BTC', dir:'LONG', lev:'4x', size:'$520K', entry:'$66,900'},{sym:'ETH', dir:'LONG', lev:'5x', size:'$240K', entry:'$3,480'}] });
WALLETS.push({ addr:'0xde44…a1c2', winRate:66.9, copierPnlV:412000, aumV:148000, assets:["majors","rwa"], liqs:0, maxLev:6, perf:'smart_money', cap:'large', style:'day_trader', clusters:['smart'], x:'@CryptoKaleo',
  roi90:118.2, roi30:29.0, dd:14.0, posWeeks:11, weeks:13, copiers:980, slots:'22/50', aum:'$148.0K',
  stats:{ '24H':{pnl:'+$3.1K',roi:1.7,dd:1.8,rec:'6/8',recL:'Green trades'}, '7D':{pnl:'+$11.4K',roi:6.1,dd:4.0,rec:'6/7',recL:'Green days'}, '30D':{pnl:'+$42.9K',roi:29.0,dd:9.8,rec:'3/4',recL:'Green weeks'}, '90D':{pnl:'+$174K',roi:118.2,dd:14.0,rec:'10/13',recL:'Green weeks'} },
  spark:[10,11,11,13,12,14,15,14,16,17,18,17,19,21,22], copyable:true,
  positions:[{sym:'SOL', dir:'LONG', lev:'5x', size:'$88K', entry:'$210.80'}] });
WALLETS.push({ addr:'0x3b8e…7d51', winRate:64.4, copierPnlV:41000, aumV:46000, assets:["alts","majors"], liqs:0, maxLev:9, perf:'rising_star', cap:'mid', style:'swing_trader', clusters:['rising'], x:null,
  roi90:null, roi30:37.1, dd:21.5, posWeeks:5, weeks:6, copiers:243, slots:'14/50', aum:'$46.0K',
  stats:{ '24H':{pnl:'+$910',roi:2.0,dd:3.0,rec:'5/7',recL:'Green trades'}, '7D':{pnl:'+$4.4K',roi:9.6,dd:7.1,rec:'5/7',recL:'Green days'}, '30D':{pnl:'+$12.6K',roi:37.1,dd:14.2,rec:'4/4',recL:'Green weeks'}, '90D':null },
  spark:[10,11,10,12,13,12,15,16,15,18,19,21,20,23,25], copyable:true,
  positions:[{sym:'HYPE', dir:'LONG', lev:'9x', size:'$18K', entry:'$37.40'},{sym:'SUI', dir:'LONG', lev:'6x', size:'$9K', entry:'$4.02'}] });
WALLETS.push({ addr:'0x82bb…6612', winRate:62.1, copierPnlV:128000, aumV:96000, assets:["majors"], liqs:0, maxLev:7, perf:'smart_money', cap:'mid', style:'swing_trader', clusters:['smart'], x:'@52kskew',
  roi90:58.3, roi30:-6.4, dd:22.0, posWeeks:9, weeks:13, copiers:514, slots:'19/50', aum:'$96.0K',
  stats:{ '24H':{pnl:'−$1.1K',roi:-1.0,dd:3.2,rec:'3/6',recL:'Green trades'}, '7D':{pnl:'−$3.8K',roi:-3.6,dd:8.0,rec:'3/7',recL:'Green days'}, '30D':{pnl:'−$6.1K',roi:-6.4,dd:15.5,rec:'2/4',recL:'Green weeks'}, '90D':{pnl:'+$54.2K',roi:58.3,dd:22.0,rec:'9/13',recL:'Green weeks'} },
  spark:[12,14,13,16,18,17,19,18,20,19,18,17,16,15,16], copyable:true,
  positions:[{sym:'ETH', dir:'LONG', lev:'7x', size:'$54K', entry:'$3,610'}] });
WALLETS.push({ addr:'0x1c90…ff03', winRate:60.2, copierPnlV:22000, aumV:38000, assets:["alts"], liqs:0, maxLev:10, perf:'degen_winner', cap:'mid', style:'day_trader', clusters:[], x:null,
  roi90:44.0, roi30:18.4, dd:19.2, posWeeks:7, weeks:11, copiers:131, slots:'8/50', aum:'$38.0K',
  stats:{ '24H':{pnl:'+$420',roi:1.1,dd:2.6,rec:'4/7',recL:'Green trades'}, '7D':{pnl:'+$2.0K',roi:5.4,dd:6.6,rec:'4/7',recL:'Green days'}, '30D':{pnl:'+$6.8K',roi:18.4,dd:12.0,rec:'3/4',recL:'Green weeks'}, '90D':{pnl:'+$15.9K',roi:44.0,dd:19.2,rec:'7/11',recL:'Green weeks'} },
  spark:[10,11,12,11,13,14,13,15,14,16,15,17,16,18,19], copyable:true,
  positions:[{sym:'SOL', dir:'LONG', lev:'10x', size:'$12K', entry:'$211.90'}] });
WALLETS.push({ addr:'0xa7d1…4e88', winRate:57.0, copierPnlV:9400, aumV:7200, assets:["alts"], liqs:1, maxLev:18, perf:'degen_winner', cap:'small', style:'scalper', clusters:[], x:null,
  roi90:64.2, roi30:11.0, dd:41.0, posWeeks:6, weeks:12, copiers:74, slots:'11/50', aum:'$7.2K',
  stats:{ '24H':{pnl:'+$140',roi:1.9,dd:5.4,rec:'4/9',recL:'Green trades'}, '7D':{pnl:'+$520',roi:7.0,dd:13.0,rec:'4/7',recL:'Green days'}, '30D':{pnl:'+$790',roi:11.0,dd:24.0,rec:'2/4',recL:'Green weeks'}, '90D':{pnl:'+$4.6K',roi:64.2,dd:41.0,rec:'6/12',recL:'Green weeks'} },
  spark:[10,13,9,15,11,18,12,20,14,9,17,22,15,24,26], copyable:true,
  positions:[{sym:'PEPE', dir:'LONG', lev:'18x', size:'$3.1K', entry:'$0.0000182'}] });
WALLETS.push({ addr:'0xe3b1…77a4', winRate:54.6, copierPnlV:1200, aumV:21000, assets:["majors"], liqs:0, maxLev:6, perf:'unproven', cap:'mid', style:'swing_trader', clusters:[], x:null,
  roi90:6.4, roi30:1.2, dd:13.0, posWeeks:6, weeks:13, copiers:18, slots:'2/50', aum:'$21.0K',
  stats:{ '24H':{pnl:'+$40',roi:0.2,dd:1.4,rec:'3/6',recL:'Green trades'}, '7D':{pnl:'+$120',roi:0.6,dd:4.0,rec:'4/7',recL:'Green days'}, '30D':{pnl:'+$250',roi:1.2,dd:7.5,rec:'2/4',recL:'Green weeks'}, '90D':{pnl:'+$1.3K',roi:6.4,dd:13.0,rec:'6/13',recL:'Green weeks'} },
  spark:[12,12,13,12,13,12,13,13,12,13,14,13,14,13,14], copyable:true,
  positions:[{sym:'ETH', dir:'LONG', lev:'5x', size:'$14K', entry:'$3,540'}] });

/* ── Real Hyperliquid 30D leaderboard (transcribed from the live HL board) ──
   These are genuine top-PnL HL wallets. Figures: account value · 30D PnL · 30D ROI
   · 30D volume. They surface at the top of the Copy leaderboard (ranked by PnL)
   and open a wallet-detail page like any other. The live path (useHLLeaderboard)
   replaces these with the real-time board when live data is enabled. */
const ARX_HL_BOARD = [
  ['Penision Fund', 31578254, 23243217, 67.70, 438135073],
  ['BobbyBigSize',  29830851, 16982241, 43.03, 1473609451],
  ['0xfc66…ca06',   67675106, 13632677, 15.20, 7445781933],
  ['0x87f9…e2cf',   83377960, 13599182, 18.16, 32733284314],
  ['0x17c3…a868',   23662855, 12445993, 34.03, 493229541],
  ['0xf822…e01a',   37050755, 12217815, 40.96, 215280145],
  ['0xecb6…2b00',   88202238, 11933412, 10.67, 9841429740],
  ['0xb83d…6e36',   91270086, 10048035, 45.70, 150785697],
  ['0x8cfa…b6ab',   9769447,  9105144,  1370.63, 0],
  ['0xb3bd…221d',   68111150, 8893499,  15.02, 0],
];
const f$Big = (n)=>{ const a=Math.abs(n); return a>=1e9?'$'+(a/1e9).toFixed(2)+'B':a>=1e6?'$'+(a/1e6).toFixed(1)+'M':a>=1e3?'$'+(a/1e3).toFixed(0)+'K':'$'+a; };
ARX_HL_BOARD.forEach(([name, av, pnl, roi, vol], i) => {
  const winRate = 52 + (roi>100?20:Math.min(18, Math.round(roi/4)));
  const dd = roi>100?28:Math.max(6, Math.round(22 - roi/6));
  WALLETS.push({
    addr:name, hlBoard:true, winRate, copierPnlV:pnl, aumV:av, vol30V:vol,
    assets:["majors","alts"], liqs:0, maxLev:roi>100?10:5,
    perf:'smart_money', cap:'whale', style: roi>100?'day_trader':'position_trader', clusters:['smart','whale'], x:null,
    roi90:roi, roi30:roi, dd, posWeeks:11, weeks:13, copiers: Math.max(40, Math.round(pnl/12000)), slots:'—', aum:f$Big(av),
    stats:{
      '24H':{pnl:'+'+f$Big(pnl*0.03),roi:+(roi*0.04).toFixed(1),dd:+(dd*0.2).toFixed(1),rec:'7/9',recL:'Green trades'},
      '7D':{pnl:'+'+f$Big(pnl*0.22),roi:+(roi*0.28).toFixed(1),dd:+(dd*0.5).toFixed(1),rec:'6/7',recL:'Green days'},
      '30D':{pnl:'+'+f$Big(pnl),roi:+roi.toFixed(2),dd:+dd.toFixed(1),rec:'3/4',recL:'Green weeks'},
      '90D':{pnl:'+'+f$Big(pnl*2.3),roi:+(roi*1.9).toFixed(1),dd:+(dd*1.3).toFixed(1),rec:'9/13',recL:'Green weeks'} },
    spark:[10,11,12,12,13,14,15,16,17,18,19,20,21,22,24], copyable:true,
    positions:[{sym:'BTC', dir:'LONG', lev:'5x', size:f$Big(av*0.4), entry:'$66,900'},{sym:'ETH', dir:'LONG', lev:'4x', size:f$Big(av*0.2), entry:'$3,480'}] });
});

const CLUSTERS = [
  { id:'smart',  name:'Smart money',  desc:'Proven 90d · controlled risk', ink:'var(--regime-up-mid)',    bg:'rgba(45,212,155,.12)' },
  { id:'kol',    name:'KOLs',         desc:'Wallets matched to public X identities · ranked by PnL', ink:'var(--color-violet-500)', bg:'rgba(124,91,255,.12)' },
  { id:'whale',  name:'Whale moves',  desc:'$1M+ wallets in motion',       ink:'var(--regime-range-mid)', bg:'rgba(59,130,246,.12)' },
  { id:'rising', name:'Rising money', desc:'Hot 30d, watch closely',       ink:'var(--color-violet-500)', bg:'rgba(124,91,255,.12)' },
];
// Full-rekt cohort is a fade SIGNAL, not a copyable set — it lives in Signals/insights, never in copy browse.

function PerfBadge({ perf }) {
  const t = TAX[perf];
  return <span style={{font:'600 10px var(--font-body)', color:t.ink, background:t.bg, padding:'2px 8px', borderRadius:999, whiteSpace:'nowrap'}}>{t.label}</span>;
}

/* Card v3 — decongested: identity · expectancy · 3 stats · actions. Benchmark = BTC overlay on the spark (5-6). */
const BTC_SPARK = [10,10.4,10.9,10.7,11.3,11.7,11.5,12,12.3,12.7,12.5,12.9,13.2,13.5,13.9];

function BenchSpark({ data, w=66, h=26 }) {
  const all = [...data, ...BTC_SPARK];
  const min = Math.min(...all), max = Math.max(...all), range = (max-min)||1;
  const pts = (arr) => arr.map((v,i) => `${(i/(arr.length-1))*w},${h - ((v-min)/range)*h}`).join(' ');
  return (
    <svg width={w} height={h}>
      <polyline points={pts(BTC_SPARK)} fill="none" stroke="var(--text-tertiary)" strokeWidth="1" strokeDasharray="2 3" opacity=".6"/>
      <polyline points={pts(data)} fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function TraderCard({ w, win, onOpen, onLabel }) {
  const [watched, setWatched] = uS(false);
  const t = TAX[w.perf];
  const st = w.stats[win];   // no cross-window fallback — too new shows —, never another window's number
  const Chip = ({ txt, ink, bg, dim, val }) => (
    <button onClick={(e)=>{ e.stopPropagation(); onLabel && onLabel(dim, val); }} className="arx-press" style={{
      height:25, padding:'0 11px', borderRadius:999, cursor:'pointer', flexShrink:0,
      background: bg || 'var(--glass-control-bg)', border:'.5px solid ' + (ink ? 'transparent' : 'var(--border-default)'),
      color: ink || 'var(--text-secondary)', font:'600 10.5px var(--font-body)', whiteSpace:'nowrap'
    }}>{txt}</button>
  );
  const Metric = ({ k, children }) => (
    <div style={{flex:1, minWidth:0}}>
      <div style={{font:'500 9.5px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.06em', whiteSpace:'nowrap'}}>{k}</div>
      <div style={{marginTop:5}}>{children}</div>
    </div>
  );
  return (
    <div className="arx-arrive" onClick={()=>onOpen(w)} style={{
      margin:'12px 20px', padding:'17px 16px', background:'var(--surface-elevated)',
      border:'.5px solid var(--border-default)', borderRadius:16, cursor:'pointer'
    }}>
      {/* identity */}
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <div style={{position:'relative'}}>
          <WalletAvatar w={w} size={42}/>
          {w.x && <span style={{position:'absolute', right:-2, bottom:-2, width:16, height:16, borderRadius:'50%',
            background:'var(--color-violet-500)', border:'2px solid var(--surface-elevated)',
            display:'flex', alignItems:'center', justifyContent:'center'}}>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="#fff"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.2l7.3-8.3L2.4 2h6.4l4.4 5.9L18.9 2z"/></svg>
          </span>}
        </div>
        <div style={{flex:1, minWidth:0}}>
          {w.x
            ? <div style={{font:'600 15px var(--font-body)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{w.x}</div>
            : <div className="num" style={{font:'600 14px var(--font-mono)', whiteSpace:'nowrap'}}>{w.addr}</div>}
          <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>{w.copiers>0 ? w.copiers.toLocaleString()+' copying' : 'No copiers yet'}</div>
        </div>
        <BenchSpark data={w.spark}/>
      </div>

      {/* 3D label anchors — tap to filter, same dimensions as Customize */}
      <div style={{display:'flex', gap:7, marginTop:13, flexWrap:'wrap'}}>
        <Chip txt={t.label} ink={t.ink} bg={t.bg} dim="perf" val={w.perf}/>
        <Chip txt={CAP[w.cap].split('·')[0].trim()} dim="cap" val={w.cap}/>
        <Chip txt={STYLE[w.style]} dim="style" val={w.style}/>
      </div>

      {/* expectancy */}
      <div style={{font:'400 12.5px var(--font-body)', color:'var(--text-secondary)', margin:'13px 0 0', lineHeight:1.5, letterSpacing:'-.003em'}}>
        {t.exp}
      </div>

      {/* metrics — roomy, one row, no crowding */}
      <div style={{display:'flex', gap:14, marginTop:15, paddingTop:14, borderTop:'.5px solid var(--border-default)'}}>
        <Metric k="PnL">
          <span className="num" style={{font:'600 17px var(--font-mono)', color: st ? (st.roi>=0?'var(--regime-up-mid)':'var(--regime-down-mid)') : 'var(--text-tertiary)', whiteSpace:'nowrap'}}>{st?st.pnl:'—'}</span>
        </Metric>
        <Metric k="Max DD">
          <span className="num" style={{font:'600 17px var(--font-mono)', whiteSpace:'nowrap', color: st && st.dd>25?'var(--regime-trans-mid)':'var(--text-primary)'}}>{st?st.dd.toFixed(1)+'%':'—'}</span>
        </Metric>
        <Metric k="Win rate">
          <span className="num" style={{font:'600 17px var(--font-mono)', whiteSpace:'nowrap'}}>{Math.round(w.winRate)}%</span>
          <span className="num" style={{font:'500 10px var(--font-mono)', color:'var(--text-tertiary)', display:'block', marginTop:1}}>{tradesOf(w).win}/{tradesOf(w).t} trades</span>
        </Metric>
      </div>

      {/* actions */}
      <div style={{display:'flex', gap:9, marginTop:14}}>
        <button onClick={(e)=>{e.stopPropagation(); setWatched(!watched);}} title="Watch" className="arx-press" style={{
          width:44, height:44, borderRadius:13, cursor:'pointer', flexShrink:0,
          background: watched ? 'rgba(124,91,255,.16)' : 'var(--glass-control-bg)',
          border:'.5px solid ' + (watched ? 'var(--color-violet-500)' : 'transparent'),
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={watched?'var(--color-violet-500)':'none'} stroke={watched?'var(--color-violet-500)':'var(--text-secondary)'} strokeWidth="1.8" strokeLinejoin="round"><polygon points="12 2.5 15 8.8 22 9.8 17 14.6 18.2 21.5 12 18.2 5.8 21.5 7 14.6 2 9.8 9 8.8 12 2.5"/></svg>
        </button>
        {w.copyable
          ? <button onClick={(e)=>{e.stopPropagation(); window.__arxOpenSub && window.__arxOpenSub('copySetup',{w});}} className="arx-press" style={{
              flex:1, height:44, borderRadius:13, border:'none', cursor:'pointer',
              background:'var(--color-violet-500)', color:'#fff', font:'700 14px var(--font-body)', boxShadow:'0 6px 18px rgba(124,91,255,.32)'
            }}>Copy this wallet</button>
          : <div style={{flex:1, height:44, borderRadius:13, background:'var(--glass-control-bg)', display:'flex', alignItems:'center', justifyContent:'center', font:'600 12.5px var(--font-body)', color:'var(--text-tertiary)'}}>Not copy-eligible</div>}
      </div>
    </div>
  );
}

/* Customize drawer v3 — three logical groups, one tap per row, live match count.
   Per 5-4-7 §6.5: PnL / win rate are evidence, never filters. Defaults per 5-6 guardrails. */
/* ─── Customize — the spec-minimum filter set (5-7-7 §6.5 + 5-7-1 3D taxonomy).
   Canonical values from 5-7-1: capital_size §6.3 bands · trading_style §8.2 · performance_type §7.2.
   Labels + assets are MULTI-select; liquidations + leverage are SINGLE-select caps.
   Raw return / drawdown / win-rate are NOT filters — evidence only (§6.5). ─── */
const GUARD_SUGGESTED = { perf:['smart_money'], cap:[], style:[], active:true, minHist:'30', maxDD:'25', liq:'0', levCap:'10', mkt:'any', classes:[], pairs:[] };
const GUARD_OFF       = { perf:[], cap:[], style:[], active:false, minHist:'any', maxDD:'any', liq:'any', levCap:'any', mkt:'any', classes:[], pairs:[] };
const MAX_PAIRS = 5;   // focused-lens cap: OR-matching beyond ~5 pairs stops narrowing anything

/* Exposure model — market (perp | spot) × asset class. Perp lists crypto/stock/commodity/fx;
   spot is crypto-only for now. Derived from wallet records until real venue data is wired. */
const EXPOSURE_X = { '0x2c9b…4e07': { perp:['crypto','fx'], spot:['crypto'] } };
const exposureOf = (w) => {
  if (EXPOSURE_X[w.addr]) return EXPOSURE_X[w.addr];
  const perp = [];
  if (w.assets.includes('majors') || w.assets.includes('alts')) perp.push('crypto');
  if (w.assets.includes('rwa')) perp.push('commodity','stock');
  return { perp, spot: w.assets.includes('majors') ? ['crypto'] : [] };
};

function CustomizeSheet({ init, countFn, onApply, onClose }) {
  const [a, setA] = uS(init || GUARD_OFF);
  const [pairInput, setPairInput] = uS('');
  const set = (k,v) => setA(p => ({...p, [k]: v}));
  const toggle = (k,v) => setA(p => ({...p, [k]: p[k].includes(v) ? p[k].filter(x=>x!==v) : [...p[k], v]}));
  const addPair = () => {
    const t = pairInput.trim().toUpperCase();
    if (!t || a.pairs.includes(t) || a.pairs.length >= MAX_PAIRS) return;
    setA(p => ({...p, pairs:[...p.pairs, t]})); setPairInput('');
  };
  const setMkt = (v) => setA(p => ({...p, mkt:v, classes: v==='spot' ? p.classes.filter(c=>c==='crypto') : p.classes}));
  const n = countFn(a);
  const suggestedOn = JSON.stringify(a) === JSON.stringify(GUARD_SUGGESTED);

  /* Multi-select = discrete chips with a checkmark (select all that apply).
     Single-select = connected segmented control (choose one) — shape carries the rule. */
  const chip = (active, key, label, onClick, sub, disabled) => (
    <button key={key} onClick={disabled?undefined:onClick} style={{
      height: sub?44:34, borderRadius:10, cursor: disabled?'default':'pointer', padding:'0 4px',
      border:'.5px solid ' + (active ? 'var(--color-violet-500)' : 'var(--border-default)'),
      background: active ? 'rgba(124,91,255,.16)' : 'transparent',
      color: active ? 'var(--color-violet-500)' : 'var(--text-primary)', opacity: disabled?.35:1,
      font:'600 12px var(--font-body)', whiteSpace:'nowrap', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:1
    }}>
      <span style={{display:'inline-flex', alignItems:'center', gap:4}}>{active && <IconCheck size={11} color="var(--color-violet-500)"/>}{label}</span>
      {sub && <span className="num" style={{font:'500 9px var(--font-mono)', color: active?'var(--color-violet-500)':'var(--text-tertiary)', opacity:.85}}>{sub}</span>}
    </button>
  );
  const seg = (cur, opts, onPick) => (
    <div style={{display:'flex', background:'var(--glass-control-bg)', borderRadius:10, padding:2, marginBottom:12}}>
      {opts.map(([v,l]) => (
        <button key={String(v)} onClick={()=>onPick(v)} style={{
          flex:1, height:32, borderRadius:8, border:'none', cursor:'pointer',
          background: cur===v ? 'var(--surface-elevated)' : 'transparent',
          boxShadow: cur===v ? '0 2px 6px rgba(0,0,0,.18)' : 'none',
          color: cur===v ? 'var(--text-primary)' : 'var(--text-secondary)',
          font:(cur===v?'700':'500')+' 12px var(--font-body)', whiteSpace:'nowrap'
        }}>{l}</button>
      ))}
    </div>
  );
  const RowHead = ({label, hint}) => (
    <div style={{display:'flex', alignItems:'baseline', gap:8, marginBottom:6}}>
      <span style={{font:'500 12px var(--font-body)', color:'var(--text-secondary)'}}>{label}</span>
      {hint && <span style={{font:'400 10px var(--font-body)', color:'var(--text-tertiary)'}}>{hint}</span>}
    </div>
  );
  const H = ({children}) => <div style={{font:'600 11px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.07em', margin:'16px 0 10px'}}>{children}</div>;
  const spotOnly = a.mkt==='spot';
  return (
    <GlassSheet onClose={onClose}>
      <div style={{padding:'4px 22px 28px'}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <span style={{flex:1, font:'700 18px var(--font-body)'}}>Customize</span>
          <button onClick={()=>setA(suggestedOn ? GUARD_OFF : GUARD_SUGGESTED)} style={{
            height:30, padding:'0 12px', borderRadius:999, cursor:'pointer',
            border:'.5px solid ' + (suggestedOn ? 'var(--color-violet-500)' : 'var(--border-strong)'),
            background: suggestedOn ? 'rgba(124,91,255,.16)' : 'transparent',
            color: suggestedOn ? 'var(--color-violet-500)' : 'var(--text-secondary)', font:'600 12px var(--font-body)'
          }}>Suggested filters</button>
        </div>
        <div style={{font:'400 12px var(--font-body)', color:'var(--text-tertiary)', marginTop:3}}>Every wallet carries three on-chain labels — filter by them, plus risk and exposure.</div>

        <H>Wallet labels</H>
        <RowHead label="Performance type" hint="select all that apply"/>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, marginBottom:12}}>
          {[['smart_money','Smart money'],['rising_star','Rising star'],['degen_winner','Degen winner'],['one_shot_winner','One-shot win'],['unproven','Unproven'],['new_blood','New blood']].map(([v,l]) =>
            chip(a.perf.includes(v), v, l, ()=>toggle('perf',v)))}
        </div>
        <RowHead label="Capital size" hint="select all that apply"/>
        <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6, marginBottom:12}}>
          {[['micro','Micro','<$1K'],['small','Small','1–10K'],['mid','Mid','10–100K'],['large','Large','100K–1M'],['whale','Whale','≥$1M']].map(([v,l,sub]) =>
            chip(a.cap.includes(v), v, l, ()=>toggle('cap',v), sub))}
        </div>
        <RowHead label="Trading style" hint="select all that apply"/>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:12}}>
          {[['scalper','Scalper','minutes'],['day_trader','Day','intraday'],['swing_trader','Swing','<7 days'],['position_trader','Position','≥7 days']].map(([v,l,sub]) =>
            chip(a.style.includes(v), v, l, ()=>toggle('style',v), sub))}
        </div>

        <H>Track record</H>
        <RowHead label="Active leaders only" hint="dormant 30d+ auto-pauses copy"/>
        {seg(a.active ? 'on' : 'off', [['on','Active only'],['off','Any']], v=>set('active', v==='on'))}
        <RowHead label="Minimum history" hint="track-record readiness"/>
        {seg(a.minHist, [['any','Any'],['30','30d+'],['90','90d+']], v=>set('minHist',v))}

        <H>Risk</H>
        <RowHead label="Liquidations · last 90d"/>
        {seg(a.liq, [['0','None'],['2','≤2'],['5','≤5'],['any','Any']], v=>set('liq',v))}
        <RowHead label="Leverage they use"/>
        {seg(a.levCap, [['5','≤5×'],['10','≤10×'],['20','≤20×'],['any','Any']], v=>set('levCap',v))}
        <RowHead label="Max drawdown" hint="downside ceiling · risk, not return"/>
        {seg(a.maxDD, [['15','≤15%'],['25','≤25%'],['40','≤40%'],['any','Any']], v=>set('maxDD',v))}

        <H>Exposure</H>
        <RowHead label="Market"/>
        {seg(a.mkt, [['any','Any'],['perp','Perps'],['spot','Spot']], setMkt)}
        <RowHead label="Asset classes" hint={spotOnly ? 'spot is crypto-only for now' : 'select all that apply'}/>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:12}}>
          {[['crypto','Crypto'],['stock','Stocks'],['commodity','Commod.'],['fx','FX']].map(([v,l]) =>
            chip(a.classes.includes(v), v, l, ()=>toggle('classes',v), null, spotOnly && v!=='crypto'))}
        </div>
        <RowHead label="Pairs" hint={'add up to '+MAX_PAIRS+' · matches wallets holding any of them'}/>
        {a.pairs.length > 0 && (
          <div style={{display:'flex', flexWrap:'wrap', gap:6, marginBottom:8}}>
            {a.pairs.map(p => (
              <span key={p} className="num" style={{display:'inline-flex', alignItems:'center', gap:5, height:28, padding:'0 10px', borderRadius:999,
                background:'rgba(124,91,255,.16)', border:'.5px solid var(--color-violet-500)', color:'var(--color-violet-500)', font:'600 11.5px var(--font-mono)'}}>
                {p}
                <button onClick={()=>setA(prev=>({...prev, pairs:prev.pairs.filter(x=>x!==p)}))} style={{background:'none', border:'none', cursor:'pointer', color:'var(--color-violet-500)', font:'700 12px var(--font-body)', padding:0}}>×</button>
              </span>
            ))}
          </div>
        )}
        <div style={{display:'flex', alignItems:'center', gap:8, height:40, borderRadius:12, padding:'0 6px 0 12px', marginBottom:4,
          background:'var(--glass-control-bg)', border:'.5px solid var(--border-default)', opacity: a.pairs.length>=MAX_PAIRS ? .5 : 1}}>
          <IconSearch size={14} color="var(--text-tertiary)"/>
          <input value={pairInput} onChange={e=>setPairInput(e.target.value.toUpperCase().slice(0,8))}
            onKeyDown={e=>{ if (e.key==='Enter') addPair(); }}
            disabled={a.pairs.length>=MAX_PAIRS}
            placeholder={a.pairs.length>=MAX_PAIRS ? 'Pair limit reached' : 'Add a pair, e.g. SOL'}
            style={{flex:1, minWidth:0, border:'none', background:'none', outline:'none', font:'500 13px var(--font-body)', color:'var(--text-primary)'}}/>
          <span className="num" style={{font:'500 10px var(--font-mono)', color:'var(--text-tertiary)', flexShrink:0}}>{a.pairs.length}/{MAX_PAIRS}</span>
          <button onClick={addPair} disabled={!pairInput.trim() || a.pairs.length>=MAX_PAIRS} style={{
            height:28, padding:'0 12px', borderRadius:9, border:'none', flexShrink:0,
            cursor: pairInput.trim() && a.pairs.length<MAX_PAIRS ? 'pointer' : 'default',
            background: pairInput.trim() && a.pairs.length<MAX_PAIRS ? 'var(--color-violet-500)' : 'var(--glass-control-bg)',
            color: pairInput.trim() && a.pairs.length<MAX_PAIRS ? '#fff' : 'var(--text-tertiary)', font:'600 12px var(--font-body)'}}>Add</button>
        </div>

        <div style={{font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5, margin:'10px 0 0'}}>
          PnL, drawdown and win rate aren't filters — they're evidence on every card. Your loss limit bounds the risk.
        </div>

        <div style={{display:'flex', gap:10, marginTop:16}}>
          <button onClick={()=>{ setA(GUARD_OFF); setPairInput(''); }} style={{flex:1, height:46, borderRadius:13, cursor:'pointer',
            background:'transparent', border:'.5px solid var(--border-strong)',
            color:'var(--text-secondary)', font:'600 13px var(--font-body)'}}>Clear</button>
          <button onClick={()=>onApply(a)} disabled={n===0} className="arx-press" style={{flex:2, height:46, borderRadius:13, border:'none',
            cursor: n>0?'pointer':'default', opacity: n>0?1:.45,
            background:'var(--color-violet-500)', color:'#fff', font:'700 14px var(--font-body)',
            boxShadow: n>0?'var(--shadow-execute)':'none'}}>{n>0 ? 'Show '+n+' wallet'+(n>1?'s':'') : 'No matches'}</button>
        </div>
      </div>
    </GlassSheet>
  );
}

/* Detailed profile v2 — S7 wallet detail per 5-4-7 §7: standing → trajectory (S05) → risk behavior (S06)
   → capital flow (S07) → exposure → events → copy study context. Signals, not just stats. */

const STANDING = {
  worth:   { l:'Worth studying',     ink:'var(--regime-up-mid)',    bg:'rgba(45,212,155,.14)' },
  mixed:   { l:'Mixed',              ink:'var(--regime-trans-mid)', bg:'rgba(251,191,36,.16)' },
  caution: { l:'High caution',       ink:'var(--regime-down-mid)',  bg:'rgba(242,106,106,.14)' },
  thin:    { l:'Not enough history', ink:'var(--text-secondary)',   bg:'rgba(120,120,128,.14)' },
};
const SIGX = {
  '0x7a3f…c891': {
    age:'312d', perfState:'Above-normal track record', qual:'proven over 90d', unreal:'+$186K',
    follower:'+$312K actual follower profit',
    timeline:[['Day 1','Unproven',''],['Day 60','Improving','+$260K realized'],['Day 202','Above normal','+$1.48M realized'],['Now','Above normal','+$1.82M · DD −8.4%']],
    risk:{ state:'Normal', stateInk:'var(--regime-up-mid)', driver:'Everything inside its usual range',
      dims:[['Concentration',20,55,38,'%'],['Leverage',3,8,6,'x'],['New pairs',0,2,1,'/wk'],['Trade pace',4,12,8,'/d']] },
    flow:{ in:'+$2.0M inflow', seq:'BTC long · 33m later', out:'+$186K open', conf:'above-normal match' },
    events:[['New 90d high in realized PnL','2d ago','up'],['Added GOLD-PERP — first RWA position','5d ago','info']],
  },
  '0x2c9b…4e07': {
    age:'204d', perfState:'Above-normal track record', qual:'proven over 90d', unreal:'+$4.1K',
    follower:'+$28K actual follower profit',
    timeline:[['Day 1','Unproven',''],['Day 45','Improving','+$6K realized'],['Now','Above normal','+$31.2K · DD −16.3%']],
    risk:{ state:'Risk rising', stateInk:'var(--regime-trans-mid)', driver:'Leverage drifted above its usual range',
      dims:[['Concentration',25,60,44,'%'],['Leverage',2,5,7,'x'],['New pairs',0,1,0,'/wk'],['Trade pace',2,8,6,'/d']] },
    flow:{ in:'+$20K inflow', seq:'ETH short · 2h later', out:'+$2.2K open', conf:'normal match' },
    events:[['Leverage above usual range','6h ago','warn'],['Reduced ETH exposure 40%','1d ago','info']],
  },
};
function deriveSig(w) {
  if (SIGX[w.addr]) return SIGX[w.addr];
  const standing = w.perf==='smart_money' ? 'worth' : w.perf==='full_rekt' ? 'caution'
    : (w.perf==='new_blood'||w.perf==='unproven') ? 'thin' : 'mixed';
  return {
    age: w.perf==='new_blood' ? '12d' : '96d',
    perfState: TAX[w.perf].label, qual: w.roi90!=null ? 'proven over 90d' : '30d window only',
    unreal: null, follower: w.copierPnlV>0 ? '+'+Math.round(w.copierPnlV/1000)+'K follower profit' : null,
    timeline: null,
    risk: w.dd>25
      ? { state:'Elevated', stateInk:'var(--regime-down-mid)', driver:'Drawdown beyond its own usual range',
          dims:[['Concentration',20,50,68,'%'],['Leverage',4,10,w.maxLev,'x'],['New pairs',0,2,3,'/wk'],['Trade pace',5,15,18,'/d']] }
      : { state:'Normal', stateInk:'var(--regime-up-mid)', driver:'Inside its usual range',
          dims:[['Concentration',20,55,40,'%'],['Leverage',2,8,Math.min(w.maxLev,8),'x'],['New pairs',0,2,1,'/wk'],['Trade pace',3,10,6,'/d']] },
    flow: null, events: [['Label refreshed','today','info']],
    _standing: standing,
  };
}
function standingOf(w, sig) {
  if (sig._standing) return sig._standing;
  return w.perf==='smart_money' ? 'worth' : w.perf==='full_rekt' ? 'caution'
    : (w.perf==='new_blood'||w.perf==='unproven') ? 'thin' : 'mixed';
}

/* Usual-range gauge — current vs the wallet's own p25–p75 band (S06) */
function RangeBar({ dim }) {
  const [label, lo, hi, cur, unit] = dim;
  const max = Math.max(hi*1.6, cur*1.15);
  const pct = (v) => Math.min(100, (v/max)*100);
  const drifted = cur > hi;
  return (
    <div style={{display:'flex', alignItems:'center', gap:10, padding:'7px 0'}}>
      <span style={{flexShrink:0, width:92, font:'500 11.5px var(--font-body)', color:'var(--text-secondary)'}}>{label}</span>
      <div style={{flex:1, position:'relative', height:14}}>
        <div style={{position:'absolute', top:6, left:0, right:0, height:2, borderRadius:1, background:'var(--glass-control-bg)'}}/>
        <div style={{position:'absolute', top:4, height:6, borderRadius:3, left:pct(lo)+'%', width:(pct(hi)-pct(lo))+'%', background:'rgba(120,120,128,.22)'}}/>
        <div style={{position:'absolute', top:2, width:10, height:10, borderRadius:'50%', left:'calc('+pct(cur)+'% - 5px)',
          background: drifted ? 'var(--regime-trans-mid)' : 'var(--text-primary)',
          boxShadow: drifted ? '0 0 8px rgba(251,191,36,.6)' : 'none'}}/>
      </div>
      <span className="num" style={{flexShrink:0, width:46, textAlign:'right', font:'600 11.5px var(--font-mono)',
        color: drifted ? 'var(--regime-trans-mid)' : 'var(--text-primary)'}}>{cur}{unit}</span>
    </div>
  );
}

/* Copy setup — the 5-6 wizard: capital → loss limit (leader MaxDD adjacent) → caps → disclosure → hold */
/* Copy setup — Bitget-lean: two decisions (capital + loss limit), everything else follows the leader.
   Forward-only mirror · inner relationships shown live (loss floor from capital, mirror rate from ratio). */
function CopySetupSheet({ w: wIn, onClose, onConfirm }) {
  const w = Object.assign({ aumV:0, positions:[], assets:[], addr:'0x…', x:null }, wIn || {});
  const [cap, setCap] = uS('900');
  const [loss, setLoss] = uS('50');
  const [adv, setAdv] = uS(false);
  const [lev, setLev] = uS('leader');       // follow leader by default (Bitget default)
  const [margin, setMargin] = uS('leader');
  const [ptm, setPtm] = uS('leader');
  const [slip, setSlip] = uS('1');
  const [eslip, setESlip] = uS('0.5');
  const [sl, setSl] = uS('10');
  const [tp, setTp] = uS('50');
  const [tsMin, setTsMin] = uS('100');
  const [tsMax, setTsMax] = uS(String(Math.round(w.aumV*0.5)));
  const [sltpOn, setSltpOn] = uS(false);
  const [sizeOn, setSizeOn] = uS(false);
  const [exitsOnly, setExitsOnly] = uS(false);
  const [pairCats, setPairCats] = uS(['Crypto','Stocks','Commodities','FX']);
  const capV = +cap || 0;
  const MY = 9214;
  const SMAX = Math.min(MY, w.aumV);
  const fmtK = (v)=> v>=1e6?'$'+(v/1e6).toFixed(1)+'M':'$'+Math.round(v/1e3)+'K';
  const mirrorRate = (r)=> r>=10?'~95%':r>=5?'~80%':r>=3?'~65%':r>=1?'~50%':'their largest only';
  const ratio = (capV / Math.max(w.aumV,1)) * 100;
  const tiny = ratio < 3;
  const floorV = Math.round(capV * (1 - (+loss)/100));
  const levLabel = lev==='leader' ? 'Follow leader' : '≤'+lev+'×';
  const marginLabel = margin==='leader' ? 'Follow leader' : margin==='iso' ? 'Isolated' : 'Cross';
  const chip = (on) => ({
    flex:1, height:38, borderRadius:10, cursor:'pointer',
    border:'.5px solid ' + (on ? 'var(--color-violet-500)' : 'var(--border-default)'),
    background: on ? 'rgba(124,91,255,.16)' : 'transparent',
    color: on ? 'var(--color-violet-500)' : 'var(--text-primary)', font:'600 12px var(--font-body)'
  });
  const Lab = ({children, hint}) => (
    <div style={{display:'flex', alignItems:'baseline', gap:8, margin:'16px 0 7px'}}>
      <span style={{font:'600 13px var(--font-body)'}}>{children}</span>
      {hint && <span style={{font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)'}}>{hint}</span>}
    </div>
  );
  return (
    <GlassSheet onClose={onClose}>
      <div style={{padding:'4px 22px 28px'}}>
        <div style={{font:'700 18px var(--font-body)'}}>Copy {w.x || w.addr}</div>

        {/* Forward-only explainer — what you're actually signing up for */}
        <div style={{display:'flex', gap:11, margin:'12px 0 0', padding:'12px 13px', borderRadius:12, background:'rgba(124,91,255,.08)', border:'.5px solid rgba(124,91,255,.2)'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-violet-500)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0, marginTop:1}}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          <div>
            <div style={{font:'600 12.5px var(--font-body)'}}>Forward-only mirror</div>
            <div style={{font:'400 11px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5, marginTop:2}}>You'll mirror their <b style={{color:'var(--text-primary)'}}>new</b> perp trades from the moment you start. Their {w.positions.length} open position{w.positions.length===1?'':'s'} stay theirs — you won't inherit them. Spot stays separate.</div>
          </div>
        </div>

        {/* 1 · Copy capital — % of your wallet, live leader-ratio + mirror rate */}
        <Lab hint="from your $9,214 available">Copy capital</Lab>
        <div style={{display:'flex', alignItems:'center', gap:6, height:54, borderRadius:13, padding:'0 14px', background:'var(--surface-elevated)', border:'.5px solid var(--border-strong)'}}>
          <span style={{font:'700 22px var(--font-mono)', color:'var(--text-tertiary)'}}>$</span>
          <input value={cap} onChange={e=>setCap(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" style={{flex:1, minWidth:0, border:'none', background:'none', outline:'none', font:'700 22px var(--font-mono)', color:'var(--text-primary)'}}/>
          <span style={{font:'600 11px var(--font-body)', color:'var(--text-tertiary)', whiteSpace:'nowrap'}}>{Math.round(capV/MY*100)}% of wallet</span>
        </div>
        <div style={{display:'flex', gap:7, marginTop:9}}>
          {[['10%',MY*.1],['25%',MY*.25],['50%',MY*.5],['Max',SMAX]].map(([l,v]) => <button key={l} onClick={()=>setCap(String(Math.round(v)))} style={chip(Math.abs(capV-v)<1)}>{l}</button>)}
        </div>
        <style>{`input.arxsl{-webkit-appearance:none;appearance:none;height:6px;border-radius:3px;outline:none}input.arxsl::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#fff;border:2px solid var(--color-violet-500);box-shadow:0 2px 6px rgba(0,0,0,.22);cursor:pointer}input.arxsl::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:#fff;border:2px solid var(--color-violet-500);cursor:pointer}`}</style>
        <input type="range" className="arxsl" min="0" max={SMAX} value={Math.min(capV,SMAX)} onChange={e=>setCap(e.target.value)} style={{width:'100%', marginTop:13, background:'linear-gradient(90deg, var(--color-violet-500) '+Math.round(Math.min(capV,SMAX)/SMAX*100)+'%, var(--glass-control-bg) '+Math.round(Math.min(capV,SMAX)/SMAX*100)+'%)'}}/>
        <div style={{display:'flex', justifyContent:'space-between', font:'500 9px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>
          <span>$50 min</span><span>{ratio>=10?'✓ recommended':'10% of leader = full mirror'}</span><span>cap {fmtK(SMAX)}</span>
        </div>
        <div style={{marginTop:10, padding:'10px 12px', borderRadius:10, background: ratio<3?'var(--risk-caution-bg)':'rgba(45,212,155,.10)', font:'500 11.5px var(--font-body)', color: ratio<3?'var(--risk-caution-ink)':'var(--text-secondary)', lineHeight:1.5}}>
          = {ratio<0.1?'<0.1':ratio<3?ratio.toFixed(1):Math.round(ratio)}% of {w.x||'leader'}’s {fmtK(w.aumV)} book → you’ll mirror <b style={{color: ratio<3?'inherit':'var(--text-primary)'}}>{mirrorRate(ratio)}</b> of their trades.{ratio<3?' Below 3% skips many small trades.':''}
        </div>

        {/* 2 · Loss limit — slider 20–75% with the leader's 90d MaxDD marked on the track */}
        <Lab hint="closes & pauses if equity drops this much">Loss limit</Lab>
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between'}}>
          <span className="num" style={{font:'700 22px var(--font-mono)', color:'var(--regime-down-mid)'}}>−{loss}%</span>
          <span className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)'}}>stops near ${floorV.toLocaleString()}</span>
        </div>
        <input type="range" className="arxsl" min="20" max="75" value={loss} onChange={e=>setLoss(e.target.value)} style={{width:'100%', marginTop:6, background:'linear-gradient(90deg, var(--color-violet-500) '+Math.round((+loss-20)/55*100)+'%, var(--glass-control-bg) '+Math.round((+loss-20)/55*100)+'%)'}}/>
        <div style={{position:'relative', height:18}}>
          {w.dd>=20 && w.dd<=75 && (
            <div style={{position:'absolute', left:((w.dd-20)/55*100)+'%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', top:-2}}>
              <div style={{width:2, height:6, background:'var(--regime-trans-mid)'}}/>
              <span style={{font:'500 8.5px var(--font-body)', color:'var(--regime-trans-mid)', whiteSpace:'nowrap', marginTop:1}}>leader −{w.dd.toFixed(0)}% worst</span>
            </div>
          )}
        </div>
        <div style={{marginTop:8, font:'400 11px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.45}}>
          Auto-stops copying near <b className="num" style={{color:'var(--text-secondary)'}}>${floorV.toLocaleString()}</b>. Raising capital later never loosens it.
        </div>

        {/* Everything else follows the leader — collapsed by default */}
        <button onClick={()=>setAdv(!adv)} style={{margin:'16px 0 0', background:'none', border:'none', cursor:'pointer', padding:0,
          font:'600 12.5px var(--font-body)', color:'var(--color-violet-500)'}}>{adv ? 'Hide advanced ↑' : 'Advanced settings →'}</button>
        {!adv && (
          <div style={{marginTop:8, font:'400 11px var(--font-body)', color:'var(--text-tertiary)'}}>Leverage {levLabel.toLowerCase()} · margin {marginLabel.toLowerCase()} · otherwise an exact copy.</div>
        )}
        {adv && (<div className="arx-arrive">
          <Lab>Leverage cap</Lab>
          <div style={{display:'flex', gap:8}}>
            {[['leader','Follow leader'],['6','≤6×'],['10','≤10×']].map(([id2,l2]) => <button key={id2} onClick={()=>setLev(id2)} style={chip(lev===id2)}>{l2}</button>)}
          </div>
          {lev!=='leader' && +lev>10 && <div style={{marginTop:7, font:'500 10.5px var(--font-body)', color:'var(--risk-caution-ink)'}}>High leverage amplifies both gains and losses.</div>}
          <Lab>Margin mode</Lab>
          <div style={{display:'flex', gap:8}}>
            {[['leader','Follow leader'],['iso','Isolated'],['cross','Cross']].map(([id2,l2]) => <button key={id2} onClick={()=>setMargin(id2)} style={chip(margin===id2)}>{l2}</button>)}
          </div>
          <Lab hint="limits any one trade to a share of your capital">Position size limit</Lab>
          <div style={{display:'flex', gap:8}}>
            {[['leader','Follow leader'],['fixed','Fixed $200'],['ratio','Ratio 1:10']].map(([id2,l2]) => <button key={id2} onClick={()=>setPtm(id2)} style={chip(ptm===id2)}>{l2}</button>)}
          </div>
          <Lab hint="cancel a fill worse than this vs leader">Entry slippage cap</Lab>
          <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between'}}><span className="num" style={{font:'700 16px var(--font-mono)'}}>{eslip}%</span><span style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)'}}>tighter = fewer chased fills</span></div>
          <input type="range" className="arxsl" min="0.1" max="2" step="0.1" value={eslip} onChange={e=>setESlip(e.target.value)} style={{width:'100%', marginTop:6, background:'linear-gradient(90deg, var(--color-violet-500) '+Math.round((+eslip-0.1)/1.9*100)+'%, var(--glass-control-bg) '+Math.round((+eslip-0.1)/1.9*100)+'%)'}}/>
          <Lab hint="wider — exits fill in stress">Exit slippage cap</Lab>
          <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between'}}><span className="num" style={{font:'700 16px var(--font-mono)'}}>{slip}%</span><span style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)'}}>loss-limit exits ignore this</span></div>
          <input type="range" className="arxsl" min="0.5" max="5" step="0.5" value={slip} onChange={e=>setSlip(e.target.value)} style={{width:'100%', marginTop:6, background:'linear-gradient(90deg, var(--color-violet-500) '+Math.round((+slip-0.5)/4.5*100)+'%, var(--glass-control-bg) '+Math.round((+slip-0.5)/4.5*100)+'%)'}}/>
          {[['Custom stop-loss / take-profit', sltpOn, setSltpOn, sltpOn?'SL 10% · TP 50% on every mirror':'Off — mirror the leader’s stops'],
            ['Trade size filter', sizeOn, setSizeOn, sizeOn?'skip < $100 and > '+fmtK(w.aumV*0.5):'Off — mirror all trade sizes'],
            ['Mirror exits only', exitsOnly, setExitsOnly, 'Wind down — no new opens, close with the leader']].map(([lbl,on,setOn,sub])=>(
            <div key={lbl} style={{display:'flex', alignItems:'center', gap:10, marginTop:15}}>
              <div style={{flex:1, minWidth:0}}><div style={{font:'600 13px var(--font-body)'}}>{lbl}</div><div style={{font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>{sub}</div></div>
              <button onClick={()=>setOn(!on)} style={{width:40, height:24, borderRadius:12, border:'none', cursor:'pointer', flexShrink:0, background:on?'var(--color-violet-500)':'var(--glass-control-bg)', position:'relative'}}><span style={{position:'absolute', top:3, left:on?19:3, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 200ms', boxShadow:'0 1px 3px rgba(0,0,0,.3)'}}/></button>
            </div>
          ))}
          {sizeOn && (<div className="arx-arrive">
            <Lab hint="skip the leader's dust trades">Min trade size</Lab>
            <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between'}}><span className="num" style={{font:'700 16px var(--font-mono)'}}>${(+tsMin).toLocaleString()}</span><span style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)'}}>leader-side notional</span></div>
            <input type="range" className="arxsl" min="10" max="1000" step="10" value={tsMin} onChange={e=>setTsMin(e.target.value)} style={{width:'100%', marginTop:6, background:'linear-gradient(90deg, var(--color-violet-500) '+Math.round((+tsMin-10)/990*100)+'%, var(--glass-control-bg) '+Math.round((+tsMin-10)/990*100)+'%)'}}/>
            <Lab hint="skip the leader's all-in trades">Max trade size</Lab>
            <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between'}}><span className="num" style={{font:'700 16px var(--font-mono)'}}>{fmtK(+tsMax)}</span></div>
            <input type="range" className="arxsl" min={1000} max={Math.round(w.aumV)} step="1000" value={Math.min(+tsMax,Math.round(w.aumV))} onChange={e=>setTsMax(e.target.value)} style={{width:'100%', marginTop:6, background:'linear-gradient(90deg, var(--color-violet-500) '+Math.round(Math.min(+tsMax,w.aumV)/w.aumV*100)+'%, var(--glass-control-bg) '+Math.round(Math.min(+tsMax,w.aumV)/w.aumV*100)+'%)'}}/>
          </div>)}
          {sltpOn && (<div className="arx-arrive">
            <Lab hint="replaces the leader's stop, on every trade">Stop-loss</Lab>
            <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between'}}><span className="num" style={{font:'700 16px var(--font-mono)', color:'var(--regime-down-mid)'}}>−{sl}%</span><span style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)'}}>price move · not equity loss</span></div>
            <input type="range" className="arxsl" min="1" max="100" value={sl} onChange={e=>setSl(e.target.value)} style={{width:'100%', marginTop:6, background:'linear-gradient(90deg, var(--color-violet-500) '+Math.round((+sl-1)/99*100)+'%, var(--glass-control-bg) '+Math.round((+sl-1)/99*100)+'%)'}}/>
            <Lab hint="close in profit at this gain">Take-profit</Lab>
            <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between'}}><span className="num" style={{font:'700 16px var(--font-mono)', color:'var(--regime-up-mid)'}}>+{tp}%</span><span style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)'}}>up to 500%</span></div>
            <input type="range" className="arxsl" min="1" max="500" value={tp} onChange={e=>setTp(e.target.value)} style={{width:'100%', marginTop:6, background:'linear-gradient(90deg, var(--color-violet-500) '+Math.round((+tp-1)/499*100)+'%, var(--glass-control-bg) '+Math.round((+tp-1)/499*100)+'%)'}}/>
          </div>)}
          <Lab hint="by asset class — same as Customize">Pair filter</Lab>
          <div style={{display:'flex', gap:7, flexWrap:'wrap', marginTop:2}}>
            {['Crypto','Stocks','Commodities','FX'].map(cat => <button key={cat} onClick={()=>setPairCats(p=>p.includes(cat)?p.filter(x=>x!==cat):[...p,cat])} style={chip(pairCats.includes(cat))}>{cat}</button>)}
          </div>
          <div style={{marginTop:7, font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)'}}>{pairCats.length>=4?'All classes — mirror every pair the leader trades':pairCats.length?'Only '+pairCats.join(' · ')+' mirrored · others skipped':'No class selected — nothing will mirror'}</div>
        </div>)}

        {/* What you'll copy — live summary */}
        <div style={{margin:'16px 0 0', padding:'13px 15px', borderRadius:12, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
          <div style={{font:'600 9.5px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:8}}>What you'll copy</div>
          {[['Copy capital','$'+capV.toLocaleString()],['Loss limit','−'+loss+'% · ~$'+floorV.toLocaleString()],['Leverage',levLabel],['Mirror','New trades only · forward-only']].map(([k,v],i,arr)=>(
            <div key={k} style={{display:'flex', justifyContent:'space-between', gap:10, padding:'6px 0', borderBottom: i<arr.length-1?'.5px solid var(--border-default)':'none'}}>
              <span style={{font:'500 12px var(--font-body)', color:'var(--text-secondary)'}}>{k}</span>
              <span className="num" style={{font:'600 12px var(--font-mono)', textAlign:'right'}}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{margin:'12px 0 14px', font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>
          Copying a leader does not guarantee profits. You may lose some or all of your capital. In fast markets your realized loss can exceed the limit you set.
        </div>

        <ConfirmAction
          tone="violet"
          action="start copying"
          consequence={'Copies '+(w.x||w.addr)+' with $'+capV.toLocaleString()+' · loss limit −'+loss+'% · '+levLabel.toLowerCase()+' · forward-only'}
          onConfirm={()=>{ onConfirm(w); }}/>
      </div>
    </GlassSheet>
  );
}

function TraderProfile({ w, onBack, onCopy }) {
  const t = TAX[w.perf];
  const sig = deriveSig(w);
  const stand = STANDING[standingOf(w, sig)];
  const [setupOpen, setSetupOpen] = uS(false);
  const [watched, setWatched] = uS(false);
  const roi = w.roi90 != null ? w.roi90 : w.roi30;
  const Sec = ({k, right, children}) => (<>
    <div style={{display:'flex', alignItems:'baseline', padding:'22px 20px 8px'}}>
      <span style={{flex:1, font:'600 15px var(--font-body)', letterSpacing:'-.005em'}}>{k}</span>
      {right && <span style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)'}}>{right}</span>}
    </div>
    {children}
  </>);
  const CardBox = ({children, pad}) => (
    <div style={{margin:'0 20px', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:16, padding: pad!=null?pad:'4px 16px'}}>{children}</div>
  );
  return (
    <Screen>
      {/* 1 · Header — identity + standing */}
      <div style={{display:'flex', alignItems:'center', gap:10, padding:'10px 20px 0'}}>
        <button onClick={onBack} style={{width:34, height:34, borderRadius:'50%', border:'.5px solid var(--border-default)',
          background:'var(--surface-elevated)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transform:'rotate(180deg)'}}>
          <IconChevron size={16} color="var(--text-primary)"/>
        </button>
        <div style={{position:'relative'}}>
          <WalletAvatar w={w} size={46}/>
          {w.x && <span style={{position:'absolute', right:-2, bottom:-2, width:17, height:17, borderRadius:'50%',
            background:'var(--color-violet-500)', border:'2px solid var(--surface-base)',
            display:'flex', alignItems:'center', justifyContent:'center'}}>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="#fff"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.2l7.3-8.3L2.4 2h6.4l4.4 5.9L18.9 2z"/></svg>
          </span>}
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'flex', gap:7, alignItems:'center'}}>
            {w.x ? <span style={{font:'600 15.5px var(--font-body)'}}>{w.x}</span>
                 : <span className="num" style={{font:'600 14.5px var(--font-mono)'}}>{w.addr}</span>}
            <span style={{font:'600 10.5px var(--font-body)', color:stand.ink, background:stand.bg, padding:'3px 9px', borderRadius:999, whiteSpace:'nowrap'}}>{stand.l}</span>
          </div>
          <div className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', marginTop:3}}>
            {w.x ? w.addr+' · ' : ''}{sig.age} old · updated 3m ago
          </div>
        </div>
        <button onClick={()=>setWatched(!watched)} style={{width:36, height:36, borderRadius:11, cursor:'pointer',
          background: watched ? 'rgba(124,91,255,.16)' : 'transparent',
          border:'.5px solid ' + (watched ? 'var(--color-violet-500)' : 'var(--border-strong)'),
          display:'flex', alignItems:'center', justifyContent:'center'}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill={watched?'var(--color-violet-500)':'none'} stroke={watched?'var(--color-violet-500)':'var(--text-secondary)'} strokeWidth="1.8" strokeLinejoin="round"><polygon points="12 2.5 15 8.8 22 9.8 17 14.6 18.2 21.5 12 18.2 5.8 21.5 7 14.6 2 9.8 9 8.8 12 2.5"/></svg>
        </button>
      </div>
      <div style={{display:'flex', gap:6, padding:'10px 20px 0', flexWrap:'wrap'}}>
        <PerfBadge perf={w.perf}/>
        <span style={{font:'600 10px var(--font-body)', color:'var(--text-secondary)', background:'rgba(120,120,128,.12)', padding:'2px 8px', borderRadius:999}}>{CAP[w.cap]}</span>
        <span style={{font:'600 10px var(--font-body)', color:'var(--text-secondary)', background:'rgba(120,120,128,.12)', padding:'2px 8px', borderRadius:999}}>{STYLE[w.style]}</span>
      </div>
      <div style={{padding:'10px 20px 0', font:'400 13px var(--font-body)', color:'var(--text-secondary)'}}>{t.exp}</div>

      {/* Wallet signals deep-dive — absorbs SIG-W01..W03 */}
      <button onClick={()=>window.__arxOpenSub && window.__arxOpenSub('signals',{focus:'wallet'})} className="arx-press" style={{
        display:'flex', alignItems:'center', gap:12, width:'calc(100% - 40px)', margin:'14px 20px 0',
        padding:'12px 14px', borderRadius:14, cursor:'pointer', textAlign:'left',
        background:'linear-gradient(135deg, rgba(124,91,255,.14), rgba(124,91,255,.03))', border:'.5px solid rgba(124,91,255,.30)'}}>
        <div style={{width:34, height:34, borderRadius:10, background:'rgba(124,91,255,.16)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-violet-500)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>
        </div>
        <div style={{flex:1}}>
          <div style={{font:'600 13.5px var(--font-body)', color:'var(--text-primary)'}}>Full signal breakdown</div>
          <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>Performance · Risk behavior · Capital flow</div>
        </div>
        <IconChevron color="var(--text-tertiary)"/>
      </button>

      {/* 2 · Performance trajectory (S05) */}
      <Sec k="Track record" right={sig.qual}>
        <LineChart data={w.spark} positive={roi>=0}/>
        <CardBox>
          {[
            ['PnL · 90d', w.stats['90D'] ? w.stats['90D'].pnl : '— too new', w.stats['90D'] && w.stats['90D'].roi>=0 ? 'var(--regime-up-mid)' : 'var(--text-tertiary)'],
            sig.unreal && ['Unrealized PnL', sig.unreal, 'var(--text-primary)'],
            ['Win rate', w.winRate.toFixed(1)+'% · '+tradesOf(w).win+'/'+tradesOf(w).t+' settled', 'var(--text-primary)'],
            ['Max drawdown', w.dd.toFixed(1)+'% — '+(w.dd<15?'shallow':w.dd<25?'moderate':'deep'), w.dd>25?'var(--regime-trans-mid)':'var(--text-primary)'],
            ['Liquidations', String(w.liqs), w.liqs>0?'var(--regime-down-mid)':'var(--text-primary)'],
            sig.follower && ['Follower outcome', sig.follower, 'var(--regime-up-mid)'],
          ].filter(Boolean).map(([k,v,c]) => (
            <div key={k} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'.5px solid var(--border-default)'}}>
              <span style={{font:'500 13px var(--font-body)', color:'var(--text-secondary)'}}>{k}</span>
              <span className="num" style={{font:'500 13px var(--font-mono)', color:c}}>{v}</span>
            </div>
          ))}
        </CardBox>
        <div style={{margin:'8px 20px 0', font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>
          Win rate counts settled trades only — read it with drawdown, never alone. PnL is after fees where available.
        </div>
        {sig.timeline && (
          <div style={{margin:'14px 20px 0', paddingLeft:6}}>
            {sig.timeline.map(([d,st,note],i) => (
              <div key={i} style={{display:'flex', gap:12, position:'relative', paddingBottom: i<sig.timeline.length-1 ? 16 : 0}}>
                {i < sig.timeline.length-1 && <div style={{position:'absolute', left:4.5, top:12, bottom:0, width:1, background:'var(--border-strong)'}}/>}
                <div style={{flexShrink:0, width:10, height:10, borderRadius:'50%', marginTop:3,
                  background: i===sig.timeline.length-1 ? 'var(--regime-up-mid)' : 'var(--surface-elevated)',
                  border:'1.5px solid ' + (i===sig.timeline.length-1 ? 'var(--regime-up-mid)' : 'var(--border-strong)')}}/>
                <div style={{flex:1, display:'flex', gap:8, alignItems:'baseline'}}>
                  <span className="num" style={{width:56, font:'500 10.5px var(--font-mono)', color:'var(--text-tertiary)'}}>{d}</span>
                  <span style={{font:'600 12.5px var(--font-body)'}}>{st}</span>
                  {note && <span className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)'}}>{note}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Sec>

      {/* 3 · Risk behavior (S06) — vs its OWN usual range */}
      <Sec k="Risk behavior" right="vs its own usual range">
        <CardBox pad="12px 16px">
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
            <span style={{width:8, height:8, borderRadius:'50%', background:sig.risk.stateInk, boxShadow:'0 0 8px '+sig.risk.stateInk}}/>
            <span style={{font:'600 13.5px var(--font-body)', color:sig.risk.stateInk}}>{sig.risk.state}</span>
            <span style={{font:'400 12px var(--font-body)', color:'var(--text-secondary)'}}>· {sig.risk.driver}</span>
          </div>
          {sig.risk.dims.map(dim => <RangeBar key={dim[0]} dim={dim}/>)}
          <div style={{font:'400 10px var(--font-body)', color:'var(--text-tertiary)', marginTop:6}}>
            Gray band = this wallet's usual range (30d baseline). Amber = drifted above it.
          </div>
        </CardBox>
      </Sec>

      {/* 4 · Capital flow (S07) */}
      {sig.flow && (
        <Sec k="Capital flow" right={sig.flow.conf}>
          <CardBox pad="14px 16px">
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              {[sig.flow.in, sig.flow.seq, sig.flow.out].map((step,i) => (
                <React.Fragment key={i}>
                  {i>0 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>}
                  <span className="num" style={{flex:1, font:'500 11px var(--font-mono)', color: i===2?'var(--regime-up-mid)':'var(--text-primary)', textAlign: i===1?'center':'left'}}>{step}</span>
                </React.Fragment>
              ))}
            </div>
            <div style={{font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:8}}>
              Fresh money went in, became a trade, and is working — real conviction, not idle balance.
            </div>
          </CardBox>
        </Sec>
      )}

      {/* 5 · Current exposure */}
      {w.positions.length > 0 && (
        <Sec k="Holding now" right={w.positions.length+' open'}>
          {w.positions.map((p,i) => (
            <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'9px 20px'}}>
              <AssetGlyph sym={p.sym} size={28}/>
              <div style={{flex:1}}>
                <span style={{font:'600 14px var(--font-body)'}}>{p.sym}</span>
                <span style={{font:'700 11px var(--font-body)', marginLeft:8, color:p.dir==='LONG'?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{p.dir} {p.lev}</span>
              </div>
              <div className="num" style={{font:'500 12px var(--font-mono)', color:'var(--text-secondary)'}}>{p.size} · entry {p.entry}</div>
            </div>
          ))}
        </Sec>
      )}

      {/* 6 · Event timeline */}
      <Sec k="Recent behavior">
        {sig.events.map(([e,when,tone],i) => (
          <div key={i} style={{display:'flex', alignItems:'center', gap:10, padding:'8px 20px'}}>
            <span style={{width:7, height:7, borderRadius:'50%', flexShrink:0,
              background: tone==='up'?'var(--regime-up-mid)':tone==='warn'?'var(--regime-trans-mid)':'var(--regime-range-mid)'}}/>
            <span style={{flex:1, font:'500 13px var(--font-body)'}}>{e}</span>
            <span style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)'}}>{when}</span>
          </div>
        ))}
      </Sec>

      {/* 7 · Copy study context — only path to copying */}
      <div style={{margin:'22px 20px 0'}}>
        {w.copyable ? (<>
          <button onClick={()=>setSetupOpen(true)} className="arx-press" style={{
            width:'100%', height:54, borderRadius:16, border:'none', cursor:'pointer',
            background:'var(--color-violet-500)', color:'#fff',
            font:'700 16px var(--font-body)', boxShadow:'var(--shadow-execute)'
          }}>Set up copy</button>
          <div style={{font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', textAlign:'center', marginTop:8, lineHeight:1.5}}>
            Not a copy recommendation. Your copy fills may differ from this wallet's.
          </div>
        </>) : (
          <div style={{padding:'12px 14px', borderRadius:12, background:'var(--risk-caution-bg)',
            font:'500 12.5px var(--font-body)', color:'var(--risk-caution-ink)', lineHeight:1.5}}>
            This wallet can't be copied — it's shown as a signal of what the crowd gets wrong. Losses outweigh wins over its recent window.
          </div>
        )}
      </div>

      {setupOpen && <CopySetupSheet w={w} onClose={()=>setSetupOpen(false)} onConfirm={(x)=>{ setSetupOpen(false); onCopy(x); }}/>}
    </Screen>
  );
}

/* Live herd counter — ticks up every few seconds; NumberRoll animates each change */
function LiveNum({ base, step = 2, every = 3000 }) {
  const [v, setV] = uS(base);
  _arxUseEffect(() => {
    const id = setInterval(() => setV(x => x + 1 + Math.floor(Math.random()*step)), every + Math.random()*1200);
    return () => clearInterval(id);
  }, []);
  return <NumberRoll value={v} format={(x)=>Math.round(x).toLocaleString()} style={{font:'inherit', color:'var(--text-secondary)'}}/>;
}

/* ── Leader ticker — horizontal auto-scrolling marquee of clickable top wallets (Copy) ── */
function LeaderTicker({ onPick }) {
  const top = [...WALLETS].sort((a,b)=>{
    const ra = a.roi90!=null?a.roi90:(a.roi30||0), rb = b.roi90!=null?b.roi90:(b.roi30||0);
    return rb - ra;
  }).slice(0, 8);
  if (!top.length) return null;
  const Chip = ({ w }) => {
    const id = window.resolveIdentity ? window.resolveIdentity(w) : { kind:'anon' };
    const named = id.kind==='claimed' || id.kind==='kol';
    const title = named ? id.name : (w.x || (w.addr.slice(0,6)+'…'+w.addr.slice(-4)));
    const roi = w.roi90!=null?w.roi90:(w.roi30||0); const pos = roi>=0;
    return (
      <button onClick={()=>onPick && onPick(w)} className="arx-press" style={{flexShrink:0, display:'inline-flex', alignItems:'center', gap:8, height:42, padding:'0 13px 0 7px', marginRight:10, borderRadius:999, cursor:'pointer', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
        <WalletAvatar w={w} size={28}/>
        <span style={{display:'flex', flexDirection:'column', alignItems:'flex-start', lineHeight:1.15}}>
          <span style={{font:'600 12px var(--font-body)', color:'var(--text-primary)', whiteSpace:'nowrap', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis'}}>{title}</span>
          <span style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)', whiteSpace:'nowrap'}}>{(w.copiers||0).toLocaleString()} copiers</span>
        </span>
        <span className="num" style={{flexShrink:0, font:'700 12px var(--font-mono)', color: pos?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{pos?'+':'−'}{Math.abs(roi).toFixed(1)}%</span>
      </button>
    );
  };
  return (
    <>
      <div style={{display:'flex', alignItems:'center', gap:7, padding:'0 20px 8px'}}>
        <span className="arx-breath" style={{width:6, height:6, borderRadius:'50%', background:'var(--regime-up-mid)'}}/>
        <span style={{font:'700 9.5px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.07em', textTransform:'uppercase'}}>Top performers · 90d</span>
      </div>
      <div className="arx-marq" style={{overflow:'hidden', margin:'0 0 16px', padding:'9px 0', borderTop:'.5px solid var(--border-default)', borderBottom:'.5px solid var(--border-default)', WebkitMaskImage:'linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent)', maskImage:'linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent)'}}>
        <div className="arx-marq-track" style={{display:'inline-flex', animation:'arxLeadMarq 48s linear infinite', willChange:'transform'}}>
          {top.map(w => <Chip key={'a'+w.addr} w={w}/>)}
          {top.map(w => <Chip key={'b'+w.addr} w={w}/>)}
          {top.map(w => <Chip key={'c'+w.addr} w={w}/>)}
        </div>
        <style>{`@keyframes arxLeadMarq { from{transform:translateX(0)} to{transform:translateX(-33.333%)} } .arx-marq:active .arx-marq-track,.arx-marq:hover .arx-marq-track{animation-play-state:paused}`}</style>
      </div>
    </>
  );
}

/* ── Smart-money / whale / KOL live trade stream (Copy · Discover) ── */
function smTradeTag(w){
  if(w.x) return ['KOL','var(--color-violet-500)','rgba(124,91,255,.12)'];
  if(w.cap==='whale' || (w.clusters&&w.clusters.includes('whale'))) return ['Whale','var(--regime-range-mid)','rgba(59,130,246,.12)'];
  if(w.perf==='smart_money' || (w.clusters&&w.clusters.includes('smart'))) return ['Smart money','var(--regime-up-mid)','rgba(45,212,155,.12)'];
  return ['Trader','var(--text-tertiary)','var(--glass-control-bg)'];
}
function SmartTradeStream({ onPick }){
  const VERBS=[['opened',1],['added to',1],['closed',0],['reduced',0]];
  // Only real on-chain wallets — hlLive means clearinghouseState loaded successfully
  const evs = WALLETS.filter(w=>w.hlLive&&w.positions&&w.positions.length).slice(0,8).map((w,i)=>{
    const p = w.positions[i%w.positions.length] || w.positions[0];
    const v = VERBS[i%VERBS.length];
    return { w, verb:v[0], dir:p.dir, sym:p.sym, size:p.size, lev:(p.lev||'').replace('x','×') };
  });
  if(!evs.length) return null;
  const Chip = ({ e }) => {
    const [tag,ink,bg] = smTradeTag(e.w);
    const long = e.dir==='LONG';
    const id = window.resolveIdentity ? window.resolveIdentity(e.w) : { kind:'anon' };
    const named = id.kind==='claimed' || id.kind==='kol';
    const title = named ? id.name : (e.w.x || (e.w.addr.slice(0,6)+'…'+e.w.addr.slice(-4)));
    return (
      <button onClick={()=>onPick && onPick(e.w)} className="arx-press" style={{flexShrink:0, display:'inline-flex', alignItems:'center', gap:7, padding:'0 6px', cursor:'pointer', background:'none', border:'none'}}>
        <WalletAvatar w={e.w} size={22}/>
        <span style={{font:'600 12px var(--font-body)', color:'var(--text-primary)', whiteSpace:'nowrap', maxWidth:110, overflow:'hidden', textOverflow:'ellipsis'}}>{title}</span>
        <span style={{font:'700 8px var(--font-body)', color:ink, background:bg, padding:'2px 6px', borderRadius:999, flexShrink:0, letterSpacing:'.02em', whiteSpace:'nowrap'}}>{tag}</span>
        <span style={{font:'500 12px var(--font-body)', color:'var(--text-secondary)', whiteSpace:'nowrap'}}>just {e.verb}</span>
        <span style={{font:'600 12px var(--font-body)', color: long?'var(--regime-up-mid)':'var(--regime-down-mid)', whiteSpace:'nowrap'}}>{long?'Long':'Short'}</span>
        <AssetGlyph sym={e.sym} size={14}/>
        <span style={{font:'600 12px var(--font-body)', color:'var(--text-primary)', whiteSpace:'nowrap'}}>{e.sym}{e.lev?' · '+e.lev:''}</span>
        <span className="num" style={{font:'600 12px var(--font-mono)', color:'var(--text-secondary)', whiteSpace:'nowrap'}}>{e.size}</span>
        <span style={{flexShrink:0, width:1, height:14, background:'var(--border-default)', marginLeft:8}}/>
      </button>
    );
  };
  return <Ticker label="Live trades · smart money, whales & KOLs" duration={52} items={evs} renderChip={(e)=><Chip e={e}/>}/>;
}

function WalletsScreen({ onCopy }) {
  const [seg, setSeg] = uS('discover');
  const [q, setQ] = uS('');
  const [,bumpWhales] = uS(0);
  React.useEffect(()=>{ const h=()=>bumpWhales(x=>x+1); window.addEventListener('arx-whales-live', h); return ()=>window.removeEventListener('arx-whales-live', h); }, []);
  // Real HL stat: latest daily active wallet count from stats-data.hyperliquid.xyz
  const [hlUserCount, setHlUserCount] = uS(null);
  React.useEffect(()=>{
    const KEY='arx_hl_users', TTL=6*3600*1000;
    try { const c=sessionStorage.getItem(KEY); if(c){ const p=JSON.parse(c); if(Date.now()-p.t<TTL){ setHlUserCount(p.v); return; } } } catch(e){}
    fetch('https://stats-data.hyperliquid.xyz/Mainnet/daily_unique_users')
      .then(r=>r.json()).then(d=>{ if(!Array.isArray(d)||!d.length) return;
        const v=d[d.length-1].n; setHlUserCount(v);
        try{ sessionStorage.setItem(KEY,JSON.stringify({v,t:Date.now()})); }catch(e){} })
      .catch(()=>{});
  },[]);
  const [cluster, setCluster] = uS(null);          // population, single-select
  const [sel, setSel] = uS(null);
  const [custom, setCustom] = uS(GUARD_OFF);     // default lens: All wallets — customize is opt-in
  const [drawerOpen, setDrawerOpen] = uS(false);
  const [win, setWin] = uS('30D');
  const [sort, setSort] = uS('pnl');
  const [infoOpen, setInfoOpen] = uS(false);
  const [sortOpen, setSortOpen] = uS(false);
  const SORTS = [['pnl','PnL'],['win','Win rate'],['dd','Max drawdown'],['volume','Volume'],['cprofit','Copier profit'],['aum','AUM']];
  const volOf = (w) => w.vol30V != null ? w.vol30V : w.aumV * (1.5 + (Math.round(w.winRate)%9)/4);
  const netProfitV = (w) => w.aumV * ((w.roi90!=null?w.roi90:(w.roi30||0))/100);

  const wstat = (w, wn) => w.stats[wn||win] || w.stats['90D'] || w.stats['30D'] || w.stats['7D'] || w.stats['24H'];

  const applyCriteria = (arr, a) => {
    let l = arr;
    if (a.perf.length) l = l.filter(w => a.perf.includes(w.perf));
    if (a.cap.length) l = l.filter(w => a.cap.includes(w.cap));
    if (a.style.length) l = l.filter(w => a.style.includes(w.style));
    if (a.liq !== 'any') l = l.filter(w => w.liqs <= +a.liq);
    if (a.levCap !== 'any') l = l.filter(w => w.maxLev <= +a.levCap);
    if (a.active) l = l.filter(w => w.dormant !== true);
    if (a.minHist && a.minHist !== 'any') l = l.filter(w => (w.ageDays != null ? w.ageDays : 999) >= +a.minHist);
    if (a.maxDD && a.maxDD !== 'any') l = l.filter(w => w.dd == null || w.dd <= +a.maxDD);
    if (a.mkt !== 'any' || a.classes.length) l = l.filter(w => {
      const ex = exposureOf(w);
      const mkts = a.mkt === 'any' ? ['perp','spot'] : [a.mkt];
      if (a.mkt !== 'any' && !ex[a.mkt].length) return false;
      if (!a.classes.length) return true;
      return mkts.some(m => a.classes.some(c => ex[m].includes(c)));
    });
    if (a.pairs.length) l = l.filter(w => w.positions.some(p => a.pairs.includes(p.sym.toUpperCase())));
    return l;
  };
  const countFn = (a) => applyCriteria(WALLETS, a).length;

  if (sel) return <TraderProfile w={sel} onBack={()=>setSel(null)} onCopy={(w)=>{ onCopy(w); }}/>;

  const customActive = JSON.stringify(custom) !== JSON.stringify(GUARD_OFF);

  let list = WALLETS;
  if (q) list = list.filter(w => w.addr.toLowerCase().includes(q.toLowerCase()) || (w.x && w.x.toLowerCase().includes(q.toLowerCase())));
  const followedList = q ? D.followed.filter(f => f.addr.toLowerCase().includes(q.toLowerCase())) : D.followed;
  if (cluster==='kol') list = list.filter(w => !!w.x);
  else if (cluster) list = list.filter(w => w.clusters.includes(cluster));
  else if (customActive) list = applyCriteria(list, custom);

  // Demo ranking: surface real / X-verified identities first, then apply the chosen
  // metric within each tier. Reordering only — every wallet's trades & stats are unchanged.
  const isVerified = (w) => (w.x ? 2 : 0) + (w.hlLive || w.liveName ? 1 : 0);
  list = [...list].sort((a,b) => {
    const va = isVerified(a), vb = isVerified(b);
    if (va !== vb) return vb - va;
    const sa = wstat(a), sb = wstat(b);
    if (sort==='pnl')     return netProfitV(b) - netProfitV(a);
    if (sort==='win')     return b.winRate - a.winRate;
    if (sort==='dd')      return a.dd - b.dd;
    if (sort==='cprofit') return b.copierPnlV - a.copierPnlV;
    if (sort==='volume')  return volOf(b) - volOf(a);
    if (sort==='aum')     return b.aumV - a.aumV;
    return 0;
  });

  // Aggregations follow the lens — honest math. “Typical copier” = median wallet ROI for the
  // window × ~55% realized copier capture (fees, slippage, skipped trades). $ figures are sums.
  const fmt$ = (v) => { const a = Math.abs(v); const t = a>=1e9 ? (a/1e9).toFixed(1)+'B' : a>=1e6 ? (a/1e6).toFixed(1)+'M' : a>=1e3 ? (a/1e3).toFixed(0)+'K' : a.toFixed(0); return (v<0?'−$':'$')+t; };
  const fmtN = (n) => n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1e3 ? Math.round(n/1e3)+'K' : String(n);
  // agg: real on-chain data from hlLive wallets (clearinghouseState, loaded by arx-whales.jsx).
  // totalUpnl = sum of unrealized PnL across live-loaded wallets — real, changes with price.
  // medRoi = median (liveUpnl / accountValue) × 100 — honest snapshot, not ARX copy-trading history.
  const agg = (() => {
    const live = WALLETS.filter(w => w.hlLive && (w.aumV||0) > 0);
    const n = live.length;
    if (!n) return { n:0, profs:0, medRoi:0, totalUpnl:0, oi:0 };
    const rois = live.map(w => (w.liveUpnl||0) / (w.aumV||1)).sort((a,b)=>a-b);
    const profs = rois.filter(r => r > 0).length;
    const mid = n % 2 ? rois[(n-1)/2] : (rois[n/2-1] + rois[n/2]) / 2;
    const totalUpnl = live.reduce((t,w) => t + (w.liveUpnl||0), 0);
    const oi = live.reduce((t,w) => t + (w.aumV||0), 0);
    return { n, profs, medRoi: mid * 100, totalUpnl, oi };
  })();

  const popCaption = cluster
    ? CLUSTERS.find(c=>c.id===cluster).desc
    : customActive
      ? [custom.perf.length && custom.perf.map(p=>TAX[p]?TAX[p].label:p).join('/'),
         custom.cap.length && custom.cap.join('/') + ' capital',
         custom.style.length && custom.style.map(s=>s.replace('_trader','')).join('/'),
         custom.liq!=='any' && (custom.liq==='0'?'no liquidations':'≤'+custom.liq+' liquidations'),
         custom.levCap!=='any' && ('≤'+custom.levCap+'×'),
         custom.mkt!=='any' && (custom.mkt==='perp'?'perps':'spot'),
         custom.classes.length && custom.classes.join('+'),
         custom.pairs.length && ('holding '+custom.pairs.join('/'))].filter(Boolean).join(' · ')
      : 'Pick one — tap again to clear';

  return (
    <Screen>
      <TopBar title="Copy" balance="$24,837" risk="normal" bellCount={4}/>

      <UnifiedSearchBar placeholder="Ask Lucid, or search wallets…"/>

      <SmartTradeStream onPick={(w)=>setSel(w)}/>

      {window.CohortLegend && <CohortLegend/>}

      <div style={{position:'relative', display:'flex', background:'var(--glass-control-bg)', borderRadius:11, padding:2, height:36, margin:'0 20px 18px'}}>
        <div style={{position:'absolute', top:2, bottom:2, left: seg==='discover' ? 2 : '50%', width:'calc(50% - 2px)',
          background:'var(--surface-elevated)', borderRadius:9, boxShadow:'0 3px 8px rgba(0,0,0,.22)',
          transition:'left 280ms cubic-bezier(.32,.72,0,1)'}}/>
        {[['discover','Discover'],['following','My wallets · '+(D.followed.length + D.watching.length)]].map(([id,l]) => (
          <button key={id} onClick={()=>setSeg(id)} style={{
            flex:1, position:'relative', zIndex:1, background:'none', border:'none', cursor:'pointer',
            color: seg===id ? 'var(--text-primary)' : 'var(--text-secondary)',
            font:(seg===id?'600':'500')+' 12.5px var(--font-body)'
          }}>{l}</button>
        ))}
      </div>

      {seg==='following' ? (<>
        <div style={{padding:'2px 20px 6px', font:'600 17px var(--font-body)', letterSpacing:'-0.01em'}}>Copying · {D.followed.length}</div>
        <div style={{margin:'0 20px 6px', padding:'14px 16px', borderRadius:16,
          background:'var(--surface-elevated)', border:'.5px solid var(--border-default)',
          display:'flex', alignItems:'baseline', gap:10}}>
          <div style={{flex:1}}>
            <div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>Copy PnL · all time</div>
            <div className="num" style={{font:'600 24px var(--font-mono)', color:'var(--regime-up-mid)', marginTop:3}}>+$44.30</div>
          </div>
          <div style={{textAlign:'right', flexShrink:0}}>
            <div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em', whiteSpace:'nowrap'}}>Copy capital</div>
            <div className="num" style={{font:'600 16px var(--font-mono)', marginTop:3}}>$2,900</div>
          </div>
        </div>
        <div style={{margin:'0 20px 4px', font:'400 11px var(--font-body)', color:'var(--text-tertiary)'}}>
          Copies mirror perp trades only — spot is separate.
        </div>
        {followedList.map(f => {
          const ST = {
            live:     { l:'Live',               ink:'var(--regime-up-mid)',    bg:'rgba(45,212,155,.12)',  sub:f.lossLeft+' · copying '+f.since,            act:'Pause' },
            paused:   { l:'Paused',             ink:'var(--regime-trans-mid)', bg:'rgba(251,191,36,.14)',  sub:'Positions held · '+f.lossLeft,               act:'Resume' },
            drawdown: { l:'Loss limit reached', ink:'var(--regime-down-mid)',  bg:'rgba(242,106,106,.12)', sub:'Positions closed · '+f.lossLeft,             act:'Review & resume' },
            inactive: { l:'Leader inactive',    ink:'var(--text-secondary)',   bg:'rgba(120,120,128,.14)', sub:'No trades in 30 days — copy paused',         act:'Resume' },
            error:    { l:'Reconnecting',       ink:'var(--regime-trans-mid)', bg:'rgba(251,191,36,.14)',  sub:'Venue unreachable — orders held, retrying',  act:null },
          };
          const st = ST[f.state] || ST.live;
          const neg = f.pnl.startsWith('−');
          return (
          <div onClick={()=>window.__arxOpenSub && window.__arxOpenSub('copyDetails',{f})} key={f.addr} style={{
            margin:'8px 20px', padding:'12px 14px', background:'var(--surface-elevated)',
            border:'.5px solid ' + (f.state==='drawdown' ? 'rgba(242,106,106,.35)' : 'var(--border-default)'), borderRadius:14, cursor:'pointer'
          }}>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <WalletAvatar w={f} size={36}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:'flex', alignItems:'center', gap:7}}>
                  <span className="num" style={{font:'600 13px var(--font-mono)'}}>{f.addr}</span>
                  <span style={{font:'600 9.5px var(--font-body)', color:st.ink, background:st.bg, padding:'2px 8px', borderRadius:999, whiteSpace:'nowrap'}}>{st.l}</span>
                </div>
                <div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:3}}>{st.sub}</div>
              </div>
              {st.act && <button onClick={(e)=>{e.stopPropagation(); window.__arxOpenSub && window.__arxOpenSub('copyDetails',{f});}} className="arx-press" style={{
                height:30, padding:'0 12px', borderRadius:9, cursor:'pointer', flexShrink:0,
                background: f.state==='live' ? 'var(--glass-control-bg)' : f.state==='drawdown' ? 'rgba(242,106,106,.14)' : 'rgba(45,212,155,.14)',
                color: f.state==='live' ? 'var(--text-secondary)' : f.state==='drawdown' ? 'var(--regime-down-mid)' : 'var(--regime-up-mid)',
                border:'none', font:'600 12px var(--font-body)', whiteSpace:'nowrap'
              }}>{st.act}</button>}
            </div>
            <div style={{display:'flex', alignItems:'baseline', gap:14, marginTop:9, paddingTop:9, borderTop:'.5px solid var(--border-default)'}}>
              <span className="num" style={{font:'600 14px var(--font-mono)', color: neg?'var(--regime-down-mid)':'var(--regime-up-mid)'}}>{f.pnl}</span>
              <span className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)'}}>of {f.alloc} copy capital</span>
              <span style={{flex:1}}/>
              <span style={{font:'500 11px var(--font-body)', color:'var(--color-violet-500)'}}>Manage ›</span>
            </div>
          </div>
        );})}
        <div style={{padding:'16px 20px 6px', font:'600 17px var(--font-body)', letterSpacing:'-0.01em'}}>Watching · {D.watching.length}</div>
        <div style={{margin:'0 20px 6px', font:'400 11.5px var(--font-body)', color:'var(--text-tertiary)'}}>No capital deployed — signals and moves only.</div>
        {D.watching.map(wt => (
          <div key={wt.addr} style={{
            margin:'8px 20px', padding:'12px 14px', background:'var(--surface-elevated)',
            border:'.5px solid var(--border-default)', borderRadius:14,
            display:'flex', alignItems:'center', gap:10
          }}>
            <WalletAvatar w={wt} size={36}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', gap:6, alignItems:'center'}}>
                <span style={{font:'600 13px ' + (wt.x ? 'var(--font-body)' : 'var(--font-mono)')}} className={wt.x?'':'num'}>{wt.x || wt.addr}</span>
                <PerfBadge perf={wt.taxK}/>
              </div>
              <div className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2}}>
                ROI {wt.win} <span style={{color:'var(--regime-up-mid)'}}>{wt.roi}</span>{wt.flag && <span style={{marginLeft:6, font:'600 9px var(--font-body)', color:'var(--regime-trans-mid)', background:'rgba(251,191,36,.16)', padding:'1px 6px', borderRadius:999}}>{wt.flag}</span>}
              </div>
              {wt.chg && <div style={{font:'400 10.5px var(--font-body)', color:'var(--text-secondary)', marginTop:3, lineHeight:1.4}}>{wt.chg}</div>}
            </div>
            <button onClick={()=>onCopy(wt)} className="arx-press" style={{
              height:30, padding:'0 14px', borderRadius:9, border:'none', cursor:'pointer',
              background:'var(--color-violet-500)', color:'#fff', font:'600 12px var(--font-body)'
            }}>Copy</button>
            <button title="Stop watching" style={{
              width:30, height:30, borderRadius:9, cursor:'pointer',
              background:'rgba(124,91,255,.16)', border:'none',
              display:'flex', alignItems:'center', justifyContent:'center'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-violet-500)" stroke="var(--color-violet-500)" strokeWidth="1.6" strokeLinejoin="round"><polygon points="12 2.5 15 8.8 22 9.8 17 14.6 18.2 21.5 12 18.2 5.8 21.5 7 14.6 2 9.8 9 8.8 12 2.5"/></svg>
            </button>
          </div>
        ))}
        <div style={{textAlign:'center', padding:'10px 0'}}>
          <button onClick={()=>setSeg('discover')} style={{background:'none', border:'none', cursor:'pointer',
            font:'600 13px var(--font-body)', color:'var(--color-violet-500)'}}>+ Find another wallet</button>
        </div>
      </>) : (<>

      {/* Topline — the S7 story, all visible at once (no swipe): 
         the market mostly loses → copiers on Arx earn → what the typical copier made. Fluid widths. */}
      <div style={{margin:'0 20px 22px', borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
        <div style={{padding:'14px 16px 13px'}}>
          <div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>Daily active wallets · Hyperliquid</div>
          <div className="num" style={{font:'700 24px var(--font-mono)', letterSpacing:'-.02em', marginTop:5}}>
            {hlUserCount ? fmtN(hlUserCount) : '—'}<span style={{color:'var(--text-tertiary)', fontSize:14, fontWeight:500}}> today</span>
          </div>
          <div style={{marginTop:9, font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)'}}>
            {WALLETS.filter(w=>w.hlLive).length > 0
              ? WALLETS.filter(w=>w.hlLive).length+' wallets tracked live · '+fmt$(WALLETS.filter(w=>w.hlLive).reduce((s,w)=>s+(w.aumV||0),0))+' AUM'
              : 'Loading live wallet data…'}
          </div>
        </div>
        <div style={{display:’grid’, gridTemplateColumns:’1fr 1fr’, borderTop:’.5px solid var(--border-default)’}}>
          <div style={{padding:’12px 16px 13px’, minWidth:0}}>
            <div style={{font:’500 10px var(--font-body)’, color:’var(--text-tertiary)’, textTransform:’uppercase’, letterSpacing:’.05em’, lineHeight:1.4}}>Live portfolio P&amp;L</div>
            <div className="num" style={{font:’700 21px var(--font-mono)’, letterSpacing:’-.02em’, marginTop:4, color: agg.totalUpnl>=0?’var(--regime-up-mid)’:’var(--regime-down-mid)’}}>
              {agg.n > 0 ? fmt$(agg.totalUpnl) : ‘—‘}
            </div>
            <div style={{font:’400 10.5px var(--font-body)’, color:’var(--text-tertiary)’, marginTop:3, lineHeight:1.35}}>
              {agg.n > 0 ? agg.n+’ wallets · open positions’ : ‘loading…’}
            </div>
          </div>
          <div style={{padding:’12px 16px 13px’, borderLeft:’.5px solid var(--border-default)’, minWidth:0}}>
            <div style={{font:’500 10px var(--font-body)’, color:’var(--text-tertiary)’, textTransform:’uppercase’, letterSpacing:’.05em’, lineHeight:1.4}}>Median wallet ROI</div>
            <div className="num" style={{font:’700 21px var(--font-mono)’, letterSpacing:’-.02em’, marginTop:4, color: agg.medRoi>=0?’var(--regime-up-mid)’:’var(--regime-down-mid)’}}>
              {agg.n > 0 ? (agg.medRoi>=0?’+’:’−’)+Math.abs(agg.medRoi).toFixed(1)+’%’ : ‘—‘}
            </div>
            <div style={{font:’400 10.5px var(--font-body)’, color:’var(--text-tertiary)’, marginTop:3, lineHeight:1.35}}>unrealized · live snapshot</div>
          </div>
        </div>
        <div style={{padding:’8px 16px 10px’, borderTop:’.5px solid var(--border-default)’, font:’400 10.5px var(--font-body)’, color:’var(--text-tertiary)’, lineHeight:1.45}}>
          On-chain unrealized P&amp;L from {agg.n > 0 ? agg.n : ‘—‘} live wallets · changes with price · not ARX copy-trading history
        </div>
      </div>

      {/* Browse by — curated groups · single-select · ⓘ explains our definitions */}
      <div style={{display:'flex', alignItems:'center', gap:8, padding:'0 20px 10px'}}>
        <span style={{font:'600 13px var(--font-body)', letterSpacing:'-.005em'}}>Browse by</span>
        <button onClick={()=>setInfoOpen(true)} title="What these groups mean" style={{
          width:20, height:20, borderRadius:'50%', border:'none', cursor:'pointer', padding:0,
          background:'var(--glass-control-bg)', display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 11v5"/><circle cx="12" cy="7.5" r=".6" fill="var(--text-secondary)"/></svg>
        </button>
        <span style={{flex:1}}/>
      </div>
      <div style={{display:'flex', gap:8, overflowX:'auto', padding:'0 20px 2px', scrollbarWidth:'none'}}>
        {CLUSTERS.map(c => (
          <button key={c.id} onClick={()=>{ const on = cluster===c.id; setCluster(on?null:c.id); if(!on) setCustom(GUARD_OFF); }} className="arx-press" style={{
            flexShrink:0, height:36, padding:'0 15px', borderRadius:999, cursor:'pointer',
            display:'flex', alignItems:'center', gap:6,
            background: cluster===c.id ? c.bg : 'var(--surface-elevated)',
            border:'.5px solid ' + (cluster===c.id ? c.ink : 'var(--border-default)'),
            color: cluster===c.id ? c.ink : 'var(--text-primary)',
            font:'600 13px var(--font-body)', whiteSpace:'nowrap', lineHeight:1
          }}>{c.name}{cluster===c.id && <span style={{font:'700 13px var(--font-body)', opacity:.8}}>×</span>}</button>
        ))}
        {/* Customize — the last lens: your own guardrails. Tap to set; tap × to clear. */}
        <button onClick={()=>setDrawerOpen(true)} className="arx-press" style={{
          flexShrink:0, height:36, padding:'0 15px', borderRadius:999, cursor:'pointer',
          display:'flex', alignItems:'center', gap:6,
          background: (customActive && !cluster) ? 'rgba(124,91,255,.16)' : 'var(--surface-elevated)',
          border:'.5px solid ' + ((customActive && !cluster) ? 'var(--color-violet-500)' : 'var(--border-default)'),
          color: (customActive && !cluster) ? 'var(--color-violet-500)' : 'var(--text-primary)', font:'600 13px var(--font-body)', whiteSpace:'nowrap', lineHeight:1
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><circle cx="9" cy="7" r="2.4"/><line x1="4" y1="16" x2="20" y2="16"/><circle cx="15" cy="16" r="2.4"/></svg>
          Customize
          {(customActive && !cluster) && <span onClick={(e)=>{ e.stopPropagation(); setCustom(GUARD_OFF); }} style={{font:'700 13px var(--font-body)', opacity:.8, padding:'0 2px'}}>×</span>}
        </button>
      </div>
      {(cluster || customActive) && (
        <div style={{padding:'8px 20px 0', font:'400 12px var(--font-body)', color:'var(--text-tertiary)'}}>{popCaption}</div>
      )}

      <div style={{display:'flex', alignItems:'center', gap:14, padding:'26px 20px 0'}}>
        <span style={{flex:1, minWidth:0, font:'600 15.5px var(--font-body)', letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
          {cluster ? CLUSTERS.find(c=>c.id===cluster).name : customActive ? 'Custom filters' : 'All wallets'}
        </span>
        <div style={{position:'relative', display:'flex', background:'var(--glass-control-bg)', borderRadius:8, padding:2, flexShrink:0}}>
          <div style={{position:'absolute', top:2, bottom:2,
            left:'calc(' + (['24H','7D','30D','90D'].indexOf(win)*25) + '% + 2px)', width:'calc(25% - 4px)',
            background:'var(--surface-elevated)', borderRadius:6, boxShadow:'0 2px 6px rgba(0,0,0,.2)',
            transition:'left 260ms cubic-bezier(.32,.72,0,1)'}}/>
          {['24H','7D','30D','90D'].map(t => (
            <button key={t} onClick={()=>setWin(t)} className="num" style={{
              height:24, width:37, borderRadius:6, border:'none', cursor:'pointer',
              background:'transparent', position:'relative', zIndex:1,
              color: win===t ? 'var(--text-primary)' : 'var(--text-tertiary)',
              font:(win===t?'600':'500')+' 10px var(--font-mono)', padding:0
            }}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{display:'flex', alignItems:'center', padding:'10px 20px 0'}}>
        <button onClick={()=>setSortOpen(true)} style={{
          background:'none', border:'none', cursor:'pointer', padding:0,
          display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap',
          font:'500 12.5px var(--font-body)', color:'var(--text-secondary)'
        }}>
          Sorted by <b style={{color:'var(--text-primary)', fontWeight:600, whiteSpace:'nowrap'}}>{SORTS.find(x=>x[0]===sort)[1]}</b>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>
      {list.map(w => <TraderCard key={w.addr} w={w} win={win} onOpen={(ww)=>window.__arxOpenSub && window.__arxOpenSub('walletDetail',{w:ww})} onLabel={(dim,val)=>{ setCluster(null); setCustom({...GUARD_OFF, [dim]:[val]}); }}/>)}
      {list.length===0 && (
        <div style={{textAlign:'center', padding:'30px 40px'}}>
          <div style={{font:'600 15px var(--font-body)'}}>No wallets match</div>
          <div style={{font:'400 12.5px var(--font-body)', color:'var(--text-secondary)', marginTop:6}}>Loosen a filter, or search a specific address.</div>
        </div>
      )}

      </>)}


      {infoOpen && (
        <GlassSheet onClose={()=>setInfoOpen(false)}>
          <div style={{padding:'6px 22px 30px'}}>
            <div style={{font:'700 18px var(--font-body)', marginBottom:4}}>What these groups mean</div>
            <div style={{font:'400 12px var(--font-body)', color:'var(--text-secondary)', marginBottom:16}}>Every wallet is labeled from its on-chain record — nothing self-reported.</div>
            {[
              ['Smart money','var(--regime-up-mid)','rgba(45,212,155,.14)','Strong 90-day record with controlled drawdown and week-after-week consistency. The proven set.'],
              ['Whale moves','var(--regime-range-mid)','rgba(59,130,246,.14)','Wallets running $1M+ of perp capital. When they move, markets feel it.'],
              ['Rising money','var(--color-violet-500)','rgba(124,91,255,.14)','Strong last 30 days, but no mature 90-day proof yet. Watch closely, size small.'],
              ['Full rekt crowd','var(--regime-down-mid)','rgba(242,106,106,.12)','Recent losses outweigh wins. A fade signal surfaced in Signals and insights — never listed for copying, so it isn\u2019t a browse group.'],
            ].map(([n,ink,bg,d]) => (
              <div key={n} style={{display:'flex', gap:12, padding:'12px 0', borderBottom:'.5px solid var(--border-default)', alignItems:'flex-start'}}>
                <span style={{flexShrink:0, marginTop:1, font:'600 11px var(--font-body)', color:ink, background:bg, padding:'4px 10px', borderRadius:999}}>{n}</span>
                <span style={{font:'400 13px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5}}>{d}</span>
              </div>
            ))}
            <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:14, lineHeight:1.5}}>
              Labels refresh daily from Hyperliquid history: capital size × performance pattern × trading style.
            </div>
          </div>
        </GlassSheet>
      )}

      {sortOpen && (
        <GlassSheet onClose={()=>setSortOpen(false)}>
          <div style={{padding:'6px 22px 26px'}}>
            <div style={{font:'700 18px var(--font-body)', marginBottom:10}}>Sort by</div>
            {SORTS.map(([k,l]) => (
              <button key={k} onClick={()=>{ setSort(k); setSortOpen(false); }} style={{
                width:'100%', display:'flex', alignItems:'center', height:50,
                background:'none', border:'none', cursor:'pointer', padding:0,
                borderBottom:'.5px solid var(--border-default)'
              }}>
                <span style={{flex:1, textAlign:'left', font:(sort===k?'600':'500')+' 15px var(--font-body)',
                  color: sort===k ? 'var(--color-violet-500)' : 'var(--text-primary)'}}>{l}</span>
                {sort===k && <IconCheck color="var(--color-violet-500)" size={16}/>}
              </button>
            ))}
          </div>
        </GlassSheet>
      )}

      {drawerOpen && <CustomizeSheet
        init={customActive ? custom : GUARD_OFF}
        countFn={countFn}
        onClose={()=>setDrawerOpen(false)}
        onApply={(a)=>{ setCustom(a); setCluster(null); setDrawerOpen(false); }}/>}
    </Screen>
  );
}

/* ═══ 3 · TRADE — full page · Simple / Pro switch ═══ */
function TradeScreen({ sym='SOL', onConfirm, confirmMode = 'hold', onRequestExpress, onDisableExpress }) {
  // Trade mode is the USER's choice, not their persona — everyone defaults to Simple; Pro is opt-in.
  const [mode, setMode] = uS(()=>{ try{ return localStorage.getItem('arx-trade-mode')||'Simple'; }catch(e){ return 'Simple'; } });
  React.useEffect(()=>{ try{ localStorage.setItem('arx-trade-mode', mode); }catch(e){} }, [mode]);
  // Spot vs Perps — spot is the safe default (no leverage, no liquidation).
  const [market, setMarket] = uS(()=>{ try{ return localStorage.getItem('arx-trade-market')||'spot'; }catch(e){ return 'spot'; } });
  React.useEffect(()=>{ try{ localStorage.setItem('arx-trade-market', market); }catch(e){} }, [market]);
  const isPerp = market==='perp';
  const A = (function(){ for(const k in D.instruments){ const m=(D.instruments[k]||[]).find(x=>x.sym===sym); if(m) return {...m, cat:k}; } return {sym:sym||'SOL', name:(sym||'SOL')+'-PERP', price:214.6, deltaPct:4.2, oi:'$310M', vol:'$1.4B'}; })();
  const symLabel = isPerp ? `${A.sym}-PERP` : `${A.sym}/USDC`;
  const priceStr = window.discPrice ? window.discPrice(A.price) : '$'+A.price.toLocaleString();
  const pos24 = A.deltaPct>=0;
  const pctStr = (pos24?'+':'−')+Math.abs(A.deltaPct).toFixed(1)+'%';
  const LEVCAP = ({BTC:40,ETH:40,SOL:20,HYPE:20,GOLD:10,OIL:10,'S&P':10,NVDA:10,EUR:50,GBP:50,JPY:50,SILVER:10,COPPER:10,NATGAS:10})[A.sym] || 20;
  React.useEffect(()=>{ setLev(LEVCAP); }, [A.sym, market]);
  const sideLabel = (s) => isPerp ? (s==='buy'?'Long':'Short') : (s==='buy'?'Buy':'Sell');
  // Funding nudge belongs only in the unfunded state, not on every ticket.
  const funded = (()=>{ try{ const s=localStorage.getItem('arx-lifecycle'); return s!=='first_install' && s!=='connected_no_deposit'; }catch(e){ return true; } })();
  const [side, setSide] = uS(()=>{ try{ const s=window.__arxPendingSide; window.__arxPendingSide=null; return s||'buy'; }catch(e){ return 'buy'; } });
  const [placed, setPlaced] = uS(false);
  const [padOpen, setPadOpen] = uS(false);
  const [amount, setAmount] = uS('500');
  const [lev, setLev] = uS(6);
  const [orderType, setOrderType] = uS('Market');
  const [proView, setProView] = uS('chart');      // chart | orderbook | trades
  const [bookView, setBookView] = uS('book');      // book | trades (Pro continuous panel)
  const [posTab, setPosTab] = uS('positions');     // positions | orders | history | balances
  const [tpsl, setTpsl] = uS(false);
  const [tpPx, setTpPx] = uS('');
  const [slPx, setSlPx] = uS('');
  const [optsOpen, setOptsOpen] = uS(false);
  const [triggerPx, setTriggerPx] = uS('');
  const [reduceOnly, setReduceOnly] = uS(false);
  const [pairOpen, setPairOpen] = uS(false);
  const [marginMode, setMarginMode] = uS('cross');   // cross | isolated
  const [tick, setTick] = uS('0.01');                 // order-book price increment
  const [limitPx, setLimitPx] = uS('');
  const [tif, setTif] = uS('GTC');
  const stage = useLifecycleStage();
  const cfg = arxTradeStage(stage);
  const hasPos = !!(window.ARX_POSITIONS && window.ARX_POSITIONS[A.sym]);
  const [promptHidden, setPromptHidden] = uS(() => {
    try { return localStorage.getItem('arx-express-prompt') === 'hidden'; } catch(e) { return false; }
  });
  const hidePrompt = () => { setPromptHidden(true); try { localStorage.setItem('arx-express-prompt','hidden'); } catch(e) {} };
  const express = confirmMode === 'express';
  const PRICE = A.price;
  const longSide = side==='buy';
  // ── derived order math (inputs → outputs) ──
  const amtNum = parseFloat(amount||0);
  const cashAvail = 840.10;
  const marginUsd = isPerp ? (lev>0?amtNum/lev:amtNum) : amtNum;
  const remainingCash = Math.max(0, cashAvail - marginUsd);
  const estLiqPx = side==='buy' ? PRICE*(1-0.9/lev) : PRICE*(1+0.9/lev);
  const slipPct = isPerp ? 0.08 : 0.06;
  const tokenQty = PRICE>0 ? amtNum/PRICE : 0;
  const entryPx = (orderType==='Limit' && parseFloat(limitPx)>0) ? parseFloat(limitPx) : PRICE;
  const tpDefault = entryPx*(longSide?1.18:0.82);
  const slDefault = entryPx*(longSide?0.94:1.06);
  const tpVal = parseFloat(tpPx)>0 ? parseFloat(tpPx) : tpDefault;
  const slVal = parseFloat(slPx)>0 ? parseFloat(slPx) : slDefault;
  const rrRatio = Math.abs(tpVal-entryPx) / (Math.abs(entryPx-slVal)||1);
  const riskUsd = entryPx>0 ? amtNum * Math.abs(entryPx-slVal)/entryPx : 0;
  const rewardUsd = entryPx>0 ? amtNum * Math.abs(tpVal-entryPx)/entryPx : 0;
  // TP/SL order derivation + validation — pending orders MUST match the ticket inputs
  const posQty = isPerp ? (PRICE>0 ? (amtNum*lev)/PRICE : 0) : tokenQty;   // notional qty (size×lev), not just margin
  const tpValid = longSide ? tpVal > entryPx : tpVal < entryPx;
  const slValid = longSide ? slVal < entryPx : slVal > entryPx;
  const tpslDirOk = tpValid && slValid;
  const rrWeak = tpslDirOk && rrRatio < 1;
  const pxFmt = (v)=> v.toLocaleString(undefined,{maximumFractionDigits: PRICE<10?4:0});
  const liveTpslOrders = tpsl ? [
    [A.sym, 'TAKE PROFIT MARKET '+(longSide?'SELL':'BUY'), posQty.toFixed(5)+' '+A.sym+' @ $'+pxFmt(tpVal), 'pending'],
    [A.sym, 'STOP MARKET '+(longSide?'SELL':'BUY'),       posQty.toFixed(5)+' '+A.sym+' @ $'+pxFmt(slVal), 'pending'],
  ] : [];
  const toggleTpsl = () => { const n=!tpsl; if(n){ if(!(parseFloat(tpPx)>0)) setTpPx(tpDefault.toFixed(PRICE<10?4:2)); if(!(parseFloat(slPx)>0)) setSlPx(slDefault.toFixed(PRICE<10?4:2)); } setTpsl(n); };
  const smartLean = (()=>{ const rs=arxAssetPos(A.sym); return rs.filter(r=>r.dir==='long').length >= rs.length/2 ? 'long' : 'short'; })();
  const matchSmart = () => { setSide(smartLean==='long'?'buy':'sell'); if(isPerp) setLev(5); setTpsl(true); window.__arxToast && window.__arxToast('Matched smart money · '+smartLean+(isPerp?' · 5×':'')+' · TP/SL 3:1'); };
  const seg = (id, label, cur, set) => (
    <button key={id} onClick={()=>set(id)} style={{flex:1, height:30, border:'none', borderRadius:8, cursor:'pointer',
      background: cur===id ? 'var(--surface-elevated)' : 'transparent', boxShadow: cur===id ? '0 2px 6px rgba(0,0,0,.15)' : 'none',
      color: cur===id ? 'var(--text-primary)' : 'var(--text-secondary)', font:`${cur===id?700:500} 12px var(--font-body)`}}>{label}</button>
  );
  return (
    <React.Fragment>
    <Screen>
      {pairOpen && <PairSelector market={market} sym={A.sym} onSelect={({sym:s,market:mk})=>{ setMarket(mk); window.__arxTrade && window.__arxTrade(s); }} onClose={()=>setPairOpen(false)}/>}
      <div style={{font:'700 24px var(--font-brand)', letterSpacing:'-0.02em', color:'var(--text-primary)', lineHeight:1.1, padding:'10px 20px 2px'}}>Trade</div>
      <div style={{display:'flex', alignItems:'center', gap:8, padding:'4px 16px 8px'}}>
        {/* pair = the navigation tool: search + group by instrument → asset class → volume; market is predecided by the pair */}
        <button onClick={()=>setPairOpen(true)} className="arx-press" aria-label="Switch market" style={{display:'flex', gap:9, alignItems:'center', background:'var(--glass-control-bg)', border:'.5px solid var(--border-default)', borderRadius:12, padding:'5px 11px 5px 6px', cursor:'pointer'}}>
          <AssetGlyph sym={A.sym} size={30}/>
          <div style={{textAlign:'left'}}>
            <div style={{font:'700 14.5px var(--font-body)', color:'var(--text-primary)', display:'flex', alignItems:'center', gap:4}}>
              {symLabel} <IconChevron size={13} color="var(--text-tertiary)"/>
            </div>
            <div className="num" style={{font:'500 11px var(--font-mono)', color: pos24?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{priceStr} · {pctStr}</div>
          </div>
        </button>
        <span style={{flex:1}}/>
        {/* open the rich asset detail page */}
        <button onClick={()=>{ window.__arxOpenSub && window.__arxOpenSub('instrumentDetail',{m:A}); }} className="arx-press" aria-label="Asset details" style={{width:34, height:34, borderRadius:'50%', border:'.5px solid var(--border-default)', background:'var(--surface-elevated)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>
        </button>
        {/* compact Lucid — opens the panel seeded with the ticket */}
        <button onClick={()=>window.__arxOpenLucid && window.__arxOpenLucid({contextLabel:'On '+A.sym+' · your ticket'})} className="arx-press" aria-label="Ask Lucid" style={{width:34, height:34, borderRadius:'50%', border:'.5px solid rgba(124,91,255,.3)', background:'rgba(124,91,255,.10)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
          <LucidOrb size={20} breathe={false}/>
        </button>
        <div style={{position:'relative', display:'flex', background:'var(--glass-control-bg)', borderRadius:9, padding:2, height:32, width:104, flexShrink:0}}>
          <div style={{position:'absolute', top:2, bottom:2, left:mode==='Simple'?2:'50%', width:'calc(50% - 2px)',
            background:'var(--surface-elevated)', borderRadius:7, boxShadow:'0 3px 8px rgba(0,0,0,.25)', transition:'left 280ms cubic-bezier(.32,.72,0,1)'}}/>
          {['Simple','Pro'].map(m => (
            <button key={m} onClick={()=>setMode(m)} style={{flex:1, position:'relative', zIndex:1, background:'none', border:'none', cursor:'pointer',
              color:mode===m?'var(--text-primary)':'var(--text-secondary)', font:`${mode===m?600:500} 11.5px var(--font-body)`}}>{m}</button>
          ))}
        </div>
      </div>

      {/* Spot vs Perps — predecided by the pair you selected; no toggle here */}
      <TicketBanner banner={cfg.banner} onAct={()=>window.__arxOpenSub&&window.__arxOpenSub('managePos',{p:Object.assign({sym:A.sym},(window.ARX_POSITIONS&&window.ARX_POSITIONS[A.sym])||{})})}/>


      {/* PRO · Hyperliquid-style two-column — order book (left) + order form (right), chart & positions below */}
      {mode==='Pro' && (<React.Fragment>
        {/* PRO top status — critical pre-trade metrics for S2 */}
        <div style={{margin:'0 16px 12px'}}>
          <div style={{display:'flex', alignItems:'baseline', gap:9}}>
            <span className="num" style={{font:'700 26px var(--font-mono)', letterSpacing:'-.02em', color: pos24?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{priceStr}</span>
            <span className="num" style={{font:'600 12px var(--font-mono)', color: pos24?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{pctStr}</span>
            <span style={{flex:1}}/>
            <span style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.04em'}}>{isPerp?'Mark · Perp':'Last · Spot'}</span>
          </div>
          <div style={{display:'flex', marginTop:9, padding:'8px 0', borderTop:'.5px solid var(--border-default)', borderBottom:'.5px solid var(--border-default)'}}>
            {(isPerp ? [['Oracle','$'+(PRICE*0.9998).toFixed(PRICE<10?4:2)],['Funding','+0.0084%'],['OI',A.oi||'—'],['24h Vol',A.vol||'—']] : [['24h High','$'+(PRICE*1.034).toFixed(PRICE<10?4:2)],['24h Low','$'+(PRICE*0.971).toFixed(PRICE<10?4:2)],['24h Vol',A.vol||'—'],['Spread','0.01%']]).map(([k,v],i)=>(
              <div key={k} style={{flex:1, paddingLeft:i?9:0, borderLeft:i?'.5px solid var(--border-default)':'none'}}>
                <div style={{font:'500 8.5px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.03em', whiteSpace:'nowrap'}}>{k}</div>
                <div className="num" style={{font:'600 11px var(--font-mono)', marginTop:2, color:'var(--text-primary)', whiteSpace:'nowrap'}}>{v}</div>
              </div>
            ))}
          </div>
          {isPerp && <div style={{marginTop:7, font:'500 10.5px var(--font-mono)', color:'var(--regime-up-mid)'}}><FundingCountdown rate="Funding +0.0084% / 8h · next"/></div>}
        </div>

        {/* Side · margin · leverage — primary decisions up top */}
        <div style={{padding:'0 16px 12px'}}>
          <div style={{display:'flex', gap:6, marginBottom: isPerp?10:0}}>
            {['sell','buy'].map(sd=>(
              <button key={sd} onClick={()=>setSide(sd)} style={{flex:1, height:40, borderRadius:11, border:'none', cursor:'pointer', background: side===sd?(sd==='buy'?'var(--regime-up-mid)':'var(--regime-down-mid)'):'var(--glass-control-bg)', color: side===sd?'#fff':'var(--text-secondary)', font:'700 14px var(--font-body)'}}>{sideLabel(sd)}</button>
            ))}
          </div>
          {isPerp && (
            <div style={{display:'flex', gap:9, alignItems:'center'}}>
              <div style={{display:'flex', gap:5, flexShrink:0}}>
                {[['cross','Cross'],['isolated','Isolated']].map(([id,l])=>(
                  <button key={id} onClick={()=>setMarginMode(id)} style={{height:30, padding:'0 11px', borderRadius:8, cursor:'pointer', border:'.5px solid var(--border-default)', background:marginMode===id?'rgba(124,91,255,.14)':'transparent', color:marginMode===id?'var(--color-violet-700)':'var(--text-secondary)', font:'600 10.5px var(--font-body)'}}>{l}</button>
                ))}
              </div>
              <div style={{flex:1, display:'flex', alignItems:'center', gap:8, minWidth:0}}>
                <input type="range" min="1" max={LEVCAP} step="1" value={lev} onChange={e=>setLev(+e.target.value)} style={{flex:1, minWidth:0, accentColor: lev>20?'var(--regime-down-mid)':'var(--color-violet-500)'}}/>
                <span className="num" style={{font:'700 15px var(--font-mono)', color: lev>20?'var(--regime-down-mid)':'var(--color-violet-500)', minWidth:34, textAlign:'right'}}>{lev}{'×'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Order book (gapless) + order form */}
        <div style={{display:'flex', gap:10, padding:'0 16px 14px', alignItems:'stretch'}}>
          <div style={{flex:'0 0 44%', minWidth:0, display:'flex', flexDirection:'column', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:12, padding:'6px 0', overflow:'hidden'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 9px 5px', flexShrink:0}}>
              <span style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.03em'}}>Price · Size</span>
              <button onClick={()=>setTick(tick==='0.01'?'0.1':tick==='0.1'?'1':'0.01')} style={{display:'inline-flex', alignItems:'center', gap:3, height:17, padding:'0 6px', borderRadius:5, cursor:'pointer', border:'.5px solid var(--border-default)', background:'var(--glass-control-bg)', color:'var(--text-secondary)', font:'600 9px var(--font-mono)'}}>{tick}<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg></button>
            </div>
            <div style={{flex:1, display:'flex', flexDirection:'column-reverse'}}>
              {[1,2,3,4,5,6,7].map(i=>(
                <div key={'a'+i} style={{flex:1, position:'relative', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 9px', minHeight:16}}>
                  <div style={{position:'absolute', right:0, top:1, bottom:1, width:Math.min(96,i*13+8)+'%', background:'rgba(242,106,106,.13)'}}/>
                  <span className="num" style={{position:'relative', font:'500 10px var(--font-mono)', color:'var(--regime-down-mid)'}}>{(PRICE*(1+0.0005*i)).toFixed(PRICE<10?4:2)}</span>
                  <span className="num" style={{position:'relative', font:'500 9.5px var(--font-mono)', color:'var(--text-tertiary)'}}>{(40+i*9)}K</span>
                </div>
              ))}
            </div>
            <div className="num" style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 9px', margin:'3px 0', borderTop:'.5px solid var(--border-default)', borderBottom:'.5px solid var(--border-default)', flexShrink:0}}>
              <span style={{font:'700 12px var(--font-mono)', color: pos24?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{PRICE.toFixed(PRICE<10?4:2)}</span>
              <span style={{font:'500 8px var(--font-mono)', color:'var(--text-tertiary)'}}>0.02%</span>
            </div>
            <div style={{flex:1, display:'flex', flexDirection:'column'}}>
              {[1,2,3,4,5,6,7].map(i=>(
                <div key={'b'+i} style={{flex:1, position:'relative', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 9px', minHeight:16}}>
                  <div style={{position:'absolute', right:0, top:1, bottom:1, width:Math.min(96,i*13+8)+'%', background:'rgba(45,212,155,.13)'}}/>
                  <span className="num" style={{position:'relative', font:'500 10px var(--font-mono)', color:'var(--regime-up-mid)'}}>{(PRICE*(1-0.0005*i)).toFixed(PRICE<10?4:2)}</span>
                  <span className="num" style={{position:'relative', font:'500 9.5px var(--font-mono)', color:'var(--text-tertiary)'}}>{(48-i*5)}K</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:8}}>
            <div style={{display:'flex', gap:4, overflowX:'auto', scrollbarWidth:'none'}}>
              {['Market','Limit','Stop Limit','Stop Market','TWAP','Scale'].map(t=>(
                <button key={t} onClick={()=>setOrderType(t)} style={{flexShrink:0, height:30, padding:'0 10px', borderRadius:8, cursor:'pointer', border:'.5px solid var(--border-default)', background:orderType===t?'rgba(124,91,255,.14)':'transparent', color:orderType===t?'var(--color-violet-700)':'var(--text-secondary)', font:'600 10.5px var(--font-body)', whiteSpace:'nowrap'}}>{t}</button>
              ))}
            </div>
            {(orderType==='Stop Limit' || orderType==='Stop Market') && (
              <div style={{display:'flex', alignItems:'center', gap:8, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:10, padding:'7px 11px'}}>
                <span style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)'}}>Trigger</span>
                <input value={triggerPx} onChange={e=>setTriggerPx(e.target.value.replace(/[^0-9.]/g,''))} placeholder={PRICE.toFixed(PRICE<10?4:2)} inputMode="decimal" className="num" style={{flex:1, minWidth:0, border:'none', background:'none', outline:'none', textAlign:'right', font:'600 13px var(--font-mono)', color:'var(--text-primary)'}}/>
              </div>
            )}
            {(orderType==='Limit' || orderType==='Stop Limit' || orderType==='Scale') && (
              <div style={{display:'flex', alignItems:'center', gap:8, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:10, padding:'7px 11px'}}>
                <span style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)'}}>{orderType==='Scale'?'Top':'Limit'}</span>
                <input value={limitPx} onChange={e=>setLimitPx(e.target.value.replace(/[^0-9.]/g,''))} placeholder={PRICE.toFixed(PRICE<10?4:2)} inputMode="decimal" className="num" style={{flex:1, minWidth:0, border:'none', background:'none', outline:'none', textAlign:'right', font:'600 13px var(--font-mono)', color:'var(--text-primary)'}}/>
                <button onClick={()=>setLimitPx(String(PRICE.toFixed(PRICE<10?4:2)))} style={{font:'600 9px var(--font-mono)', color:'var(--color-violet-500)', background:'rgba(124,91,255,.12)', border:'none', borderRadius:5, padding:'2px 6px', cursor:'pointer'}}>BBO</button>
              </div>
            )}
            <div style={{background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:10, padding:'8px 11px'}}>
              <div style={{font:'500 8.5px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.04em'}}>Size · USD{isPerp?' (notional)':''}</div>
              <input value={amount} onChange={e=>setAmount(e.target.value.replace(/[^0-9.]/g,'')||'0')} inputMode="decimal" className="num" style={{width:'100%', border:'none', background:'none', outline:'none', font:'600 19px var(--font-mono)', color:'var(--text-primary)', marginTop:2, padding:0}}/>
            </div>
            <div style={{display:'flex', gap:5}}>
              {[['25%',.25],['50%',.5],['75%',.75],['Max',1]].map(([l,f])=>(
                <button key={l} onClick={()=>setAmount(String(Math.floor((isPerp?840*lev:840)*f)))} style={{flex:1, height:26, borderRadius:7, cursor:'pointer', border:'.5px solid var(--border-default)', background:'transparent', color:'var(--text-secondary)', font:'600 10px var(--font-body)'}}>{l}</button>
              ))}
            </div>
            {orderType==='Limit' && (
              <div style={{display:'flex', gap:5}}>
                {['GTC','IOC','ALO'].map(o=>(
                  <button key={o} onClick={()=>setTif(o)} style={{flex:1, height:26, borderRadius:7, cursor:'pointer', border:'.5px solid var(--border-default)', background:tif===o?'rgba(124,91,255,.14)':'transparent', color:tif===o?'var(--color-violet-700)':'var(--text-tertiary)', font:'600 10px var(--font-body)'}}>{o}</button>
                ))}
              </div>
            )}
            <button onClick={toggleTpsl} style={{display:'flex', alignItems:'center', justifyContent:'space-between', background:'none', border:'none', cursor:'pointer', padding:'2px 0'}}>
              <span style={{font:'500 12px var(--font-body)', color:'var(--text-primary)'}}>TP / SL</span>
              <span style={{width:38, height:22, borderRadius:11, background: tpsl?'var(--regime-up-mid)':'var(--glass-control-bg-strong)', position:'relative', flexShrink:0}}><span style={{position:'absolute', top:3, left: tpsl?18:3, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left 200ms'}}/></span>
            </button>
            {tpsl && (
              <div>
                <div style={{display:'flex', gap:6}}>
                  {[['TP', tpPx, setTpPx, tpDefault, 'var(--regime-up-mid)'],['SL', slPx, setSlPx, slDefault, 'var(--regime-down-mid)']].map(([k,val,setter,def,c])=>(
                    <div key={k} style={{flex:1, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:8, padding:'5px 8px'}}>
                      <div style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.03em'}}>{k}</div>
                      <input value={val} onChange={e=>setter(e.target.value.replace(/[^0-9.]/g,''))} placeholder={'$'+def.toFixed(PRICE<10?4:2)} inputMode="decimal" className="num" style={{width:'100%', border:'none', background:'none', outline:'none', font:'600 12px var(--font-mono)', color:c, marginTop:1, padding:0}}/>
                    </div>
                  ))}
                </div>
                <div style={{font:'500 10px var(--font-body)', color:'var(--text-secondary)', marginTop:6, textAlign:'center'}}>R:R <b style={{color: rrWeak?'var(--regime-trans-mid)':'var(--text-primary)'}}>{rrRatio.toFixed(1)}:1</b></div>
                {!tpslDirOk && <div style={{marginTop:6, font:'500 10px var(--font-body)', color:'var(--regime-down-mid)', textAlign:'center', lineHeight:1.4}}>For a {longSide?'long':'short'}, TP must be {longSide?'above':'below'} & SL {longSide?'below':'above'} entry.</div>}
                {rrWeak && <div style={{marginTop:4, font:'500 10px var(--font-body)', color:'var(--regime-trans-mid)', textAlign:'center', lineHeight:1.4}}>Risking more than the target gain.</div>}
              </div>
            )}
            <button onClick={()=>setReduceOnly(!reduceOnly)} style={{display:'flex', alignItems:'center', justifyContent:'space-between', background:'none', border:'none', cursor:'pointer', padding:'2px 0'}}>
              <span style={{font:'500 12px var(--font-body)', color:'var(--text-primary)'}}>Reduce-only</span>
              <span style={{width:38, height:22, borderRadius:11, background: reduceOnly?'var(--color-violet-500)':'var(--glass-control-bg-strong)', position:'relative', flexShrink:0}}><span style={{position:'absolute', top:3, left: reduceOnly?18:3, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left 200ms'}}/></span>
            </button>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'var(--border-default)', borderRadius:10, overflow:'hidden', border:'.5px solid var(--border-default)'}}>
              {(isPerp ? [['Cost (margin)','$'+(parseFloat(amount||0)/lev).toFixed(2),''],['Est. liq.','$'+(side==='buy'?PRICE*(1-0.9/lev):PRICE*(1+0.9/lev)).toFixed(PRICE<10?4:2),'down'],['Slippage','0.08%',''],['Fee','$'+(parseFloat(amount||0)*0.00035).toFixed(2),'']] : [['Cost','$'+parseFloat(amount||0).toFixed(2),''],['You receive','≈'+(parseFloat(amount||0)/PRICE).toFixed(3)+' '+A.sym,''],['Slippage','0.06%',''],['Fee','$'+(parseFloat(amount||0)*0.00035).toFixed(2),'']]).map(([k,v,tone])=>(
                <div key={k} style={{background:'var(--surface-elevated)', padding:'6px 9px'}}>
                  <div style={{font:'500 8.5px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.03em', whiteSpace:'nowrap'}}>{k}</div>
                  <div className="num" style={{font:'600 11.5px var(--font-mono)', marginTop:2, color: tone==='down'?'var(--regime-down-mid)':'var(--text-primary)'}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA — fixed right after the two columns */}
        <div style={{position:'sticky', bottom:80, zIndex:20, padding:'12px 16px', background:'linear-gradient(to top, var(--surface-base) 58%, transparent)'}}>
          {!cfg.canTrade ? (
            <button onClick={()=>window.__arxOpenSub&&window.__arxOpenSub('funding')} className="arx-press" style={{width:'100%', height:48, borderRadius:13, border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'700 15px var(--font-body)', boxShadow:'var(--shadow-execute)'}}>{cfg.gate}</button>
          ) : (
          <ConfirmAction express={express} tone="violet" action={isPerp ? ('open '+(longSide?'long':'short')) : ((longSide?'buy':'sell')+' '+A.sym)} consequence={isPerp?(lev+'× '+(longSide?'long':'short')+' '+A.sym+' · $'+amount):((longSide?'Buy':'Sell')+' $'+amount+' '+A.sym)} onConfirm={()=>onConfirm({side, amount, market, sym:A.sym})}/>
          )}
        </div>

        {/* Signals — directional bias · momentum · smart-money holdings */}
        <div style={{padding:'4px 16px 0'}}>
          <div style={{font:'700 13px var(--font-body)', color:'var(--text-primary)', margin:'2px 0 10px'}}>Signals</div>
          {(()=>{ const ps=arxAssetPos(A.sym); const ln=Math.round(ps.filter(x=>x.dir==='long').length/ps.length*100); return (
            <div style={{display:'flex', gap:8, marginBottom:12}}>
              <div style={{flex:1, padding:'10px 12px', borderRadius:12, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
                <div style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.04em'}}>Directional bias</div>
                <div style={{font:'700 14px var(--font-body)', color: ln>=50?'var(--regime-up-mid)':'var(--regime-down-mid)', marginTop:3}}>{ln>=50?'Long':'Short'} {Math.max(ln,100-ln)}%</div>
                <div style={{display:'flex', height:5, borderRadius:3, overflow:'hidden', marginTop:7, background:'var(--regime-down-mid)'}}><div style={{width:ln+'%', background:'var(--regime-up-mid)'}}/></div>
              </div>
              <div style={{flex:1, padding:'10px 12px', borderRadius:12, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
                <div style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.04em'}}>Momentum</div>
                <div style={{font:'700 14px var(--font-body)', color: pos24?'var(--regime-up-mid)':'var(--regime-down-mid)', marginTop:3}}>{pos24?'Bullish':'Bearish'}</div>
                <div style={{font:'400 9.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:6}}>{pos24?'Above 20 & 50 MA · RSI 61':'Below 20 & 50 MA · RSI 41'}</div>
              </div>
            </div>
          ); })()}
        </div>
        <TradeSocialProof sym={A.sym} onMatch={(c)=>{ setSide(c.dir==='long'?'buy':'sell'); if(isPerp) setLev(parseInt(c.lev)||5); window.__arxToast && window.__arxToast('Matched consensus · '+c.dir+' '+c.lev); }} onCopy={(r)=>{ window.__arxOpenSub && window.__arxOpenSub('copySetup',{w:{x:r.x, addr:r.addr, aumV:660800, positions:[], assets:[]}}); }} onProfile={(r)=>{ window.__arxOpenSub && window.__arxOpenSub('walletDetail',{w:{x:r.x, addr:r.addr, aumV:660800, positions:[], assets:[], perf:'smart_money', cap:'whale'}}); }}/>

        {/* Positions / Orders / History / Balances — the norm */}
        <div style={{display:'flex', gap:14, padding:'0 16px', borderBottom:'.5px solid var(--border-default)', marginTop:6}}>
          {[['positions','Positions'],['orders','Orders'],['history','History'],['balances','Balances']].map(([id,l])=>(
            <button key={id} onClick={()=>setPosTab(id)} style={{background:'none', border:'none', cursor:'pointer', padding:'4px 0 10px', position:'relative', font:(posTab===id?700:500)+' 13px var(--font-body)', color: posTab===id?'var(--text-primary)':'var(--text-tertiary)'}}>{l}{posTab===id && <span style={{position:'absolute', left:0, right:0, bottom:-1, height:2, background:'var(--color-violet-500)', borderRadius:1}}/>}</button>
          ))}
        </div>
        {posTab==='positions' && [['SOL','LONG','6×','$3,420','+$284.10'],['ETH','SHORT','4×','$1,860','−$42.30']].map((p,i)=>(
          <button key={i} onClick={()=>window.__arxOpenSub && window.__arxOpenSub('managePos',{p:{sym:p[0],dir:p[1],lev:p[2],size:p[3],pnl:p[4],entry:p[0]==='SOL'?'$182.41':'$3,910.20',liq:p[0]==='SOL'?'$168.20':'$4,120.00',margin:p[0]==='SOL'?'$570':'$465'}})} className="arx-row-press" style={{width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:'.5px solid var(--border-default)', background:'transparent', border:'none', cursor:'pointer', textAlign:'left'}}>
            <AssetGlyph sym={p[0]} size={30}/>
            <div style={{flex:1}}><div><span style={{font:'600 13px var(--font-body)', color:'var(--text-primary)'}}>{p[0]}-PERP</span><span style={{font:'700 9px var(--font-body)', marginLeft:6, color:p[1]==='LONG'?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{p[1]} {p[2]}</span></div><div className="num" style={{font:'500 10.5px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2}}>Size {p[3]} · tap to manage</div></div>
            <div className="num" style={{font:'600 12.5px var(--font-mono)', color:p[4].startsWith('+')?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{p[4]}</div>
          </button>
        ))}
        {posTab==='orders' && [...liveTpslOrders, ['SOL','LIMIT BUY','$500 @ $208.00','pending'],['HYPE','LIMIT BUY','$300 @ $36.00','partial']].map((o,i)=>(
          <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:'.5px solid var(--border-default)'}}>
            <AssetGlyph sym={o[0]} size={28}/>
            <div style={{flex:1}}><div style={{display:'flex', alignItems:'center', gap:6}}><span style={{font:'600 12.5px var(--font-body)'}}>{o[0]}-PERP</span><OrderStateBadge state={o[3]}/></div><div style={{font:'600 9.5px var(--font-body)', letterSpacing:'.03em', marginTop:2, color: String(o[1]).includes('TAKE PROFIT')?'var(--regime-up-mid)':String(o[1]).includes('STOP')?'var(--regime-down-mid)':'var(--text-secondary)'}}>{o[1]}</div><div className="num" style={{font:'500 10.5px var(--font-mono)', color:'var(--text-tertiary)', marginTop:1}}>{o[2]}</div></div>
            <button style={{height:26, padding:'0 11px', borderRadius:8, border:'.5px solid var(--border-strong)', background:'transparent', color:'var(--text-secondary)', font:'600 10.5px var(--font-body)', cursor:'pointer'}}>Cancel</button>
          </div>
        ))}
        {posTab==='history' && [['SOL','+$284.10','2h ago','filled'],['BTC','−$96.40','1d ago','filled'],['XRP','−$210.00','2d ago','liquidated'],['ETH','$0.00','3d ago','failed']].map((h,i)=>(
          <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'11px 16px', borderBottom:'.5px solid var(--border-default)'}}><AssetGlyph sym={h[0]} size={26}/><div style={{flex:1}}><div style={{display:'flex', alignItems:'center', gap:6}}><span style={{font:'600 12.5px var(--font-body)'}}>{h[0]}-PERP</span><OrderStateBadge state={h[3]}/></div><div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>{h[2]}</div></div><span className="num" style={{font:'600 12px var(--font-mono)', color:h[1].startsWith('+')?'var(--regime-up-mid)':h[1].startsWith('−')?'var(--regime-down-mid)':'var(--text-tertiary)'}}>{h[1]}</span></div>
        ))}
        {posTab==='balances' && (
          <div style={{margin:'12px 16px 0', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:14, padding:'4px 14px'}}>
            {[['USDC','$840.10'],['Margin used','$0.00'],['Unrealized PnL','+$0.00']].map(([k,v],i)=>(<div key={k} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:i<2?'.5px solid var(--border-default)':'none'}}><span style={{font:'500 12.5px var(--font-body)', color:'var(--text-secondary)'}}>{k}</span><span className="num" style={{font:'600 12.5px var(--font-mono)'}}>{v}</span></div>))}
          </div>
        )}
        <div style={{height:72}}/>
      </React.Fragment>)}

      {mode==='Simple' && (<React.Fragment>

      {/* Top-up entry — surfaces only for unfunded users (right state) */}
      {!funded && (<div style={{display:'flex', alignItems:'center', gap:12, margin:'2px 20px 12px',
        padding:'12px 14px', borderRadius:14, background:'rgba(124,91,255,.12)', border:'.5px solid rgba(124,91,255,.25)'}}>
        <div style={{width:34, height:34, borderRadius:10, background:'var(--color-violet-500)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="6 13 12 19 18 13"/></svg>
        </div>
        <div style={{flex:1}}>
          <div style={{font:'600 13.5px var(--font-body)', color:'var(--text-primary)'}}>Top up your wallet</div>
          <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>Crypto or card · lands in ~1 min</div>
        </div>
        <button onClick={()=>window.__arxOpenSub && window.__arxOpenSub('funding')} className="arx-press" style={{height:32, padding:'0 14px', borderRadius:10, border:'none', cursor:'pointer',
          background:'var(--color-violet-500)', color:'#fff', font:'600 12px var(--font-body)'}}>Add funds</button>
      </div>)}

      {/* Sell / Buy — short first */}
      <div style={{display:'flex', padding:4, background:'var(--glass-control-bg)', borderRadius:14, margin:'0 20px 14px'}}>
        {['sell','buy'].map(s => (
          <button key={s} onClick={()=>setSide(s)} style={{
            flex:1, height:42, border:'none', borderRadius:11, cursor:'pointer',
            background: side===s ? (s==='buy'?'var(--regime-up-mid)':'var(--regime-down-mid)') : 'transparent',
            color: side===s ? '#fff' : 'var(--text-secondary)', font:'700 14px var(--font-body)', textTransform:'capitalize', transition:'background 200ms'
          }}>{sideLabel(s)}</button>
        ))}
      </div>

      {/* Size — tap to bring up the iOS keypad */}
      <button onClick={()=>setPadOpen(true)} style={{display:'block', width:'100%', textAlign:'center', padding:'2px 0 6px', background:'none', border:'none', cursor:'pointer'}}>
        <div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.05em', textTransform:'uppercase'}}>{isPerp?'Size':'Amount'}</div>
        <div className="num" style={{font:'500 44px var(--font-mono)', letterSpacing:'-.03em', marginTop:4, color:'var(--text-primary)', borderBottom: padOpen?'2px solid var(--color-violet-500)':'2px solid transparent', display:'inline-block', paddingBottom:2, transition:'border-color 160ms'}}>${amount}</div>
        <div className="num" style={{font:'500 12.5px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2}}>≈ {tokenQty.toFixed(4)} {A.sym}{isPerp?` · ${lev}×`:''}</div>
      </button>
      {!padOpen && (
        <div style={{display:'flex', gap:8, margin:'0 20px 14px'}}>
          {[['25%',.25],['50%',.5],['75%',.75],['Max',1]].map(([l,f]) => (
            <button key={l} onClick={()=>setAmount(String(Math.floor((isPerp?Math.floor(840*lev):840)*f)))} className="arx-press" style={{flex:1, height:34, borderRadius:999, cursor:'pointer', border:'.5px solid var(--border-default)',
              background:'var(--surface-elevated)', color:'var(--text-primary)', font:'600 12.5px var(--font-body)'}}>{l}</button>
          ))}
        </div>
      )}

      {/* Order options — progressive disclosure (market/limit · leverage · TP/SL) */}
      <div style={{margin:'2px 20px 12px', borderRadius:14, border:'.5px solid var(--border-default)', overflow:'hidden'}}>
        <button onClick={()=>setOptsOpen(!optsOpen)} className="arx-press" style={{width:'100%', display:'flex', alignItems:'center', gap:8, padding:'11px 14px', background:'var(--surface-elevated)', border:'none', cursor:'pointer', textAlign:'left'}}>
          <span style={{font:'600 12.5px var(--font-body)', color:'var(--text-primary)'}}>Order options</span>
          <span style={{flex:1}}/>
          <span className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)'}}>{orderType}{isPerp?` · ${lev}×`:''} · {tpsl?'TP/SL':'No TP/SL'}</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.4" strokeLinecap="round" style={{transform:optsOpen?'rotate(180deg)':'none', transition:'transform 200ms', flexShrink:0}}><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        {optsOpen && (
          <div style={{padding:'12px 14px 14px', borderTop:'.5px solid var(--border-default)'}}>
            <div style={{display:'flex', gap:6, marginBottom:14}}>
              {['Market','Limit'].map(t=>(
                <button key={t} onClick={()=>setOrderType(t)} className="arx-press" style={{flex:1, height:30, borderRadius:8, cursor:'pointer', border:'none', background:orderType===t?'var(--surface-modal)':'var(--glass-control-bg)', color:orderType===t?'var(--text-primary)':'var(--text-tertiary)', font:`${orderType===t?600:500} 11.5px var(--font-body)`, boxShadow:orderType===t?'0 1px 3px rgba(0,0,0,.12)':'none'}}>{t}</button>
              ))}
            </div>
            {orderType==='Limit' && (
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:14, background:'var(--surface-modal)', border:'.5px solid var(--border-default)', borderRadius:10, padding:'8px 12px'}}>
                <span style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)'}}>Limit price</span>
                <input value={limitPx} onChange={e=>setLimitPx(e.target.value.replace(/[^0-9.]/g,''))} placeholder={PRICE.toFixed(PRICE<10?4:2)} inputMode="decimal" className="num" style={{flex:1, minWidth:0, border:'none', background:'none', outline:'none', textAlign:'right', font:'600 13px var(--font-mono)', color:'var(--text-primary)'}}/>
                <button onClick={()=>setLimitPx(String(PRICE.toFixed(PRICE<10?4:2)))} style={{font:'600 9px var(--font-mono)', color:'var(--color-violet-500)', background:'rgba(124,91,255,.12)', border:'none', borderRadius:6, padding:'3px 7px', cursor:'pointer'}}>MID</button>
              </div>
            )}
            {isPerp && (
              <div style={{marginBottom:14}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:7}}>
                  <span style={{font:'500 12px var(--font-body)', color:'var(--text-secondary)'}}>Leverage</span>
                  <span className="num" style={{font:'700 18px var(--font-mono)', color: lev>20?'var(--regime-down-mid)':'var(--color-violet-500)', letterSpacing:'-.02em'}}>{lev}×</span>
                </div>
                <input type="range" min="1" max={LEVCAP} step="1" value={lev} onChange={e=>setLev(+e.target.value)} style={{width:'100%', accentColor: lev>20?'var(--regime-down-mid)':'var(--color-violet-500)'}}/>
                <div style={{display:'flex', justifyContent:'space-between', marginTop:2}}>
                  {[1,5,10,20,LEVCAP].filter((x,i,a)=>x<=LEVCAP && a.indexOf(x)===i).map(p=>(
                    <button key={p} onClick={()=>setLev(p)} style={{background:'none', border:'none', cursor:'pointer', font:`${lev===p?700:500} 10px var(--font-mono)`, color: lev===p?'var(--color-violet-500)':'var(--text-tertiary)', padding:0}}>{p}×</button>
                  ))}
                </div>
                {lev>10 && <div style={{marginTop:8, font:'400 10.5px var(--font-body)', color:'var(--regime-trans-mid)', lineHeight:1.4}}>High leverage amplifies gains and losses — liquidation comes faster.</div>}
              </div>
            )}
            <button onClick={toggleTpsl} style={{width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', background:'none', border:'none', cursor:'pointer', padding:0}}>
              <span style={{font:'500 13px var(--font-body)', color:'var(--text-primary)'}}>Take profit / Stop loss <span style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)'}}>· optional</span></span>
              <span style={{width:40, height:24, borderRadius:12, background: tpsl?'var(--regime-up-mid)':'var(--glass-control-bg-strong)', position:'relative', flexShrink:0, transition:'background 200ms'}}><span style={{position:'absolute', top:3, left: tpsl?19:3, width:18, height:18, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,.3)', transition:'left 200ms'}}/></span>
            </button>
            {tpsl && (<React.Fragment>
              <div style={{display:'flex', gap:8, marginTop:12}}>
                {[['Take profit', tpPx, setTpPx, tpDefault, 'var(--regime-up-mid)'],['Stop loss', slPx, setSlPx, slDefault, 'var(--regime-down-mid)']].map(([k,val,setter,def,c])=>(
                  <div key={k} style={{flex:1, padding:'8px 11px', borderRadius:10, background:'var(--surface-modal)', border:'.5px solid var(--border-default)'}}>
                    <div style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.04em'}}>{k}</div>
                    <input value={val} onChange={e=>setter(e.target.value.replace(/[^0-9.]/g,''))} placeholder={'$'+def.toFixed(PRICE<10?4:2)} inputMode="decimal" className="num" style={{width:'100%', border:'none', background:'none', outline:'none', font:'600 14px var(--font-mono)', color:c, marginTop:3, padding:0}}/>
                  </div>
                ))}
              </div>
              <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginTop:10, font:'500 11px var(--font-body)', color:'var(--text-secondary)'}}>
                <span>Risk <b className="num" style={{color:'var(--regime-down-mid)'}}>−${riskUsd.toFixed(0)}</b></span>
                <span style={{color:'var(--text-tertiary)'}}>·</span>
                <span>Reward <b className="num" style={{color:'var(--regime-up-mid)'}}>+${rewardUsd.toFixed(0)}</b></span>
                <span style={{color:'var(--text-tertiary)'}}>·</span>
                <span>R:R <b style={{color:'var(--text-primary)'}}>{rrRatio.toFixed(1)}:1</b></span>
              </div>
              {!tpslDirOk && <div style={{marginTop:9, padding:'8px 11px', borderRadius:9, background:'rgba(242,106,106,.10)', font:'500 11px var(--font-body)', color:'var(--regime-down-mid)', lineHeight:1.45}}>For a {longSide?'long':'short'}, take-profit must be {longSide?'above':'below'} entry and stop-loss {longSide?'below':'above'}. Adjust to arm these orders.</div>}
              {rrWeak && <div style={{marginTop:9, padding:'8px 11px', borderRadius:9, background:'rgba(251,191,36,.12)', font:'500 11px var(--font-body)', color:'var(--regime-trans-mid)', lineHeight:1.45}}>Risk-reward {rrRatio.toFixed(1)}:1 — you’re risking more than the target gain.</div>}
              <div style={{font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:9, lineHeight:1.5}}>Defaults to <b style={{color:'var(--text-secondary)'}}>3:1</b> — the target aims to make 3× what you’d lose at the stop, so you can be right under half the time and still come out ahead.</div>
            </React.Fragment>)}
          </div>
        )}
      </div>

      {/* Survival line — the one consequence always visible */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', margin:'0 20px 14px', padding:'10px 14px', borderRadius:12, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
        {isPerp ? (<React.Fragment>
          <div><div style={{font:'400 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.04em'}}>Est. liquidation</div><div className="num" style={{font:'600 14px var(--font-mono)', color:'var(--regime-down-mid)', marginTop:2}}>${estLiqPx.toFixed(PRICE<10?4:2)}</div></div>
          <div style={{textAlign:'right'}}><div style={{font:'400 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.04em'}}>Cash left</div><div className="num" style={{font:'600 14px var(--font-mono)', color:'var(--text-primary)', marginTop:2}}>${remainingCash.toFixed(2)}</div></div>
        </React.Fragment>) : (<React.Fragment>
          <div><div style={{font:'400 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.04em'}}>You buy</div><div className="num" style={{font:'600 14px var(--font-mono)', color:'var(--text-primary)', marginTop:2}}>≈ {tokenQty.toFixed(4)} {A.sym}</div></div>
          <div style={{textAlign:'right'}}><div style={{font:'400 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.04em'}}>Cash left</div><div className="num" style={{font:'600 14px var(--font-mono)', color:'var(--text-primary)', marginTop:2}}>${remainingCash.toFixed(2)}</div></div>
        </React.Fragment>)}
      </div>

      {/* Primary CTA — inline, directly under the survival line */}
      <div style={{margin:'0 20px 18px'}}>
        {!cfg.canTrade ? (
          <button onClick={()=>window.__arxOpenSub&&window.__arxOpenSub('funding')} className="arx-press" style={{width:'100%', height:50, borderRadius:14, border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'700 15px var(--font-body)', boxShadow:'var(--shadow-execute)'}}>{cfg.gate}</button>
        ) : placed ? (
          <button onClick={()=>window.__arxGoTab && window.__arxGoTab('you')} className="arx-press arx-arrive" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', height:50, borderRadius:14, cursor:'pointer', background:'var(--color-violet-500)', border:'none', color:'#fff', font:'700 14px var(--font-body)', boxShadow:'var(--shadow-execute)'}}>
            View in your portfolio
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        ) : (
        <ConfirmAction
          express={express}
          tone="violet"
          action={isPerp ? `open ${longSide?'long':'short'}` : `${longSide?'buy':'sell'} ${A.sym}`}
          consequence={isPerp ? `Opens a ${lev}× ${longSide?'long':'short'} on ${symLabel} · $${amount} size` : `${longSide?'Buys':'Sells'} $${amount} of ${A.sym} at ~${priceStr}`}
          onConfirm={()=>{ setPlaced(true); onConfirm({side, amount, market, sym:A.sym}); }}/>
        )}
      </div>

      {/* Social proof — who's positioned on this asset (last-mile confidence) */}
      <TradeSocialProof sym={A.sym} onMatch={(c)=>{ setSide(c.dir==='long'?'buy':'sell'); if(isPerp) setLev(parseInt(c.lev)||5); window.__arxToast && window.__arxToast('Matched consensus · '+c.dir+' '+c.lev); }} onCopy={(r)=>{ window.__arxOpenSub && window.__arxOpenSub('copySetup',{w:{x:r.x, addr:r.addr, aumV:660800, positions:[], assets:[]}}); }} onProfile={(r)=>{ window.__arxOpenSub && window.__arxOpenSub('walletDetail',{w:{x:r.x, addr:r.addr, aumV:660800, positions:[], assets:[], perf:'smart_money', cap:'whale'}}); }}/>

      {/* Open positions — tap to manage / close (Simple users need this too, not just Pro) */}
      {(()=>{ const OPEN=[['SOL','LONG','6×','$3,420','+$284.10','$182.41','$168.20','$570'],['ETH','SHORT','4×','$1,860','−$42.30','$3,910.20','$4,120.00','$465']]; return (
        <div style={{marginTop:8}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px 8px'}}>
            <span style={{font:'700 14px var(--font-body)', color:'var(--text-primary)'}}>Open positions</span>
            <button onClick={()=>window.__arxGoTab && window.__arxGoTab('you')} style={{background:'none', border:'none', cursor:'pointer', font:'600 12px var(--font-body)', color:'var(--color-violet-500)'}}>View all</button>
          </div>
          {OPEN.map((p,i)=>(
            <button key={i} onClick={()=>window.__arxOpenSub && window.__arxOpenSub('managePos',{p:{sym:p[0],dir:p[1],lev:p[2],size:p[3],pnl:p[4],entry:p[5],liq:p[6],margin:p[7]}})} className="arx-row-press" style={{width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderTop:'.5px solid var(--border-default)', background:'transparent', border:'none', cursor:'pointer', textAlign:'left'}}>
              <AssetGlyph sym={p[0]} size={30}/>
              <div style={{flex:1, minWidth:0}}><div><span style={{font:'600 13px var(--font-body)', color:'var(--text-primary)'}}>{p[0]}-PERP</span><span style={{font:'700 9px var(--font-body)', marginLeft:6, color:p[1]==='LONG'?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{p[1]} {p[2]}</span></div><div className="num" style={{font:'500 10.5px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2}}>Size {p[3]} · tap to close or manage</div></div>
              <div className="num" style={{font:'600 12.5px var(--font-mono)', color:p[4].startsWith('+')?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{p[4]}</div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
        </div>
      ); })()}

      <div style={{height:24}}/>

      </React.Fragment>)}
    </Screen>
    {mode==='Simple' && <IOSDecimalPad value={amount} onChange={setAmount} available={isPerp?Math.floor(840*lev):840} min={1.10} open={padOpen} onDone={()=>setPadOpen(false)} qty={tokenQty} sym={A.sym}/>}
    </React.Fragment>
  );
}

/* ═══ Trade social proof · who's positioned on this asset (smart money / KOLs / whales) ═══ */
const ARX_ASSET_POS = {
  SOL:[ {x:'@HsakaTrades',kind:'KOL',dir:'long',lev:'10×',pnl30:'+38.4%',watched:true,pos:true},
        {addr:'0x7a3f…c891',kind:'Whale',dir:'long',lev:'5×',pnl30:'+22.1%',watched:true,pos:true},
        {addr:'0x5e2b…a07d',kind:'Whale',dir:'long',lev:'3×',pnl30:'+14.7%',watched:false,pos:true},
        {x:'@CL207',kind:'Smart',dir:'short',lev:'8×',pnl30:'−6.2%',watched:false,pos:false} ],
  BTC:[ {x:'@GCRClassic',kind:'KOL',dir:'long',lev:'5×',pnl30:'+19.3%',watched:true,pos:true},
        {addr:'0x9c12…ab84',kind:'Whale',dir:'long',lev:'3×',pnl30:'+11.8%',watched:false,pos:true},
        {x:'@52kskew',kind:'Smart',dir:'long',lev:'10×',pnl30:'+27.5%',watched:false,pos:true},
        {addr:'0x3a77…bd21',kind:'Whale',dir:'long',lev:'2×',pnl30:'+8.4%',watched:false,pos:true} ],
  ETH:[ {x:'@DegenSpartan',kind:'KOL',dir:'short',lev:'4×',pnl30:'+12.6%',watched:true,pos:true},
        {addr:'0x2c9b…4e07',kind:'Whale',dir:'long',lev:'5×',pnl30:'+18.9%',watched:false,pos:true},
        {x:'@lightcrypto',kind:'Smart',dir:'short',lev:'6×',pnl30:'−4.1%',watched:false,pos:false},
        {addr:'0x8f04…c3e2',kind:'Whale',dir:'long',lev:'3×',pnl30:'+9.7%',watched:false,pos:true} ],
  HYPE:[ {x:'@0xHamz',kind:'KOL',dir:'long',lev:'10×',pnl30:'+52.1%',watched:true,pos:true},
        {addr:'0x4d81…f2a0',kind:'Whale',dir:'long',lev:'4×',pnl30:'+31.4%',watched:false,pos:true},
        {x:'@smcrypto',kind:'Smart',dir:'long',lev:'7×',pnl30:'+16.2%',watched:false,pos:true},
        {addr:'0x6b29…e810',kind:'Whale',dir:'long',lev:'2×',pnl30:'+11.0%',watched:false,pos:true} ],
};
function arxAssetPos(sym){ return ARX_ASSET_POS[sym] || [
  {x:'@HsakaTrades',kind:'KOL',dir:'long',lev:'8×',pnl30:'+24.3%',watched:true,pos:true},
  {addr:'0x7a3f…c891',kind:'Whale',dir:'long',lev:'5×',pnl30:'+15.1%',watched:false,pos:true},
  {x:'@CL207',kind:'Smart',dir:'long',lev:'6×',pnl30:'+9.6%',watched:false,pos:true},
]; }
function TradeSocialProof({ sym, onMatch, onCopy, onProfile }){
  const [showList, setShowList] = React.useState(false);
  const rows = arxAssetPos(sym);
  const longN = rows.filter(r=>r.dir==='long').length;
  const lean = Math.round(longN/rows.length*100);
  const isLong = longN >= rows.length/2;
  const levCount = {}; rows.forEach(r=>{ levCount[r.lev]=(levCount[r.lev]||0)+1; });
  const commonLev = Object.keys(levCount).sort((a,b)=>levCount[b]-levCount[a])[0];
  const dirN = isLong ? longN : rows.length-longN;
  return (
    <div style={{margin:'0 20px 14px'}}>
      <div style={{font:'700 12.5px var(--font-body)', color:'var(--text-primary)', marginBottom:8}}>Smart-money consensus on {sym}</div>
      <div style={{display:'flex', alignItems:'center', gap:10, padding:'11px 13px', borderRadius:14, marginBottom:10, background: isLong?'rgba(45,212,155,.08)':'rgba(242,106,106,.08)', border:'.5px solid '+(isLong?'rgba(45,212,155,.28)':'rgba(242,106,106,.28)')}}>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'flex', alignItems:'baseline', gap:7}}>
            <span style={{font:'800 15px var(--font-body)', color: isLong?'var(--regime-up-mid)':'var(--regime-down-mid)', letterSpacing:'.02em'}}>{isLong?'LONG':'SHORT'}</span>
            <span className="num" style={{font:'700 13px var(--font-mono)', color:'var(--text-primary)'}}>{commonLev}</span>
            <span style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)'}}>most common</span>
          </div>
          <div style={{font:'400 10.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>{dirN} of {rows.length} tracked traders · {lean}% long</div>
        </div>
        <button onClick={()=>onMatch&&onMatch({dir:isLong?'long':'short', lev:commonLev})} className="arx-press" style={{flexShrink:0, height:32, padding:'0 15px', borderRadius:10, cursor:'pointer', border:'none', background:'var(--color-violet-500)', color:'#fff', font:'600 12px var(--font-body)'}}>Match</button>
      </div>
      <button onClick={()=>setShowList(!showList)} className="arx-press" style={{display:'flex', alignItems:'center', gap:5, background:'none', border:'none', cursor:'pointer', padding:'0 0 8px', font:'600 11px var(--font-body)', color:'var(--color-violet-500)'}}>
        {showList?'Hide traders':`See ${rows.length} traders`}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" style={{transform:showList?'rotate(180deg)':'none', transition:'transform 200ms'}}><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {showList && (<React.Fragment>
      <div style={{display:'flex', flexDirection:'column', gap:1, background:'var(--border-default)', border:'.5px solid var(--border-default)', borderRadius:14, overflow:'hidden'}}>
        {[...rows].sort((a,b)=>(b.watched?1:0)-(a.watched?1:0)).map((r,i)=>{ const long=r.dir==='long'; const down=r.pnl30.charAt(0)==='−'; return (
          <div key={i} style={{display:'flex', alignItems:'center', gap:9, padding:'9px 12px', background:'var(--surface-elevated)'}}>
            <button onClick={()=>onProfile&&onProfile(r)} className="arx-press" style={{flex:1, minWidth:0, display:'flex', alignItems:'center', gap:9, background:'none', border:'none', cursor:'pointer', textAlign:'left', padding:0}}>
              <WalletAvatar w={{x:r.x, addr:r.addr}} size={32}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:'flex', alignItems:'center', gap:5}}>
                  <span style={{font:'600 12.5px var(--font-body)', color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.x||r.addr}</span>
                  {r.watched
                    ? <span style={{font:'600 8px var(--font-body)', color:'var(--color-violet-500)', background:'rgba(124,91,255,.12)', padding:'1px 5px', borderRadius:5, letterSpacing:'.03em', flexShrink:0}}>WATCHING</span>
                    : <span style={{font:'600 8px var(--font-body)', color:'var(--text-tertiary)', background:'var(--glass-control-bg)', padding:'1px 5px', borderRadius:5, letterSpacing:'.04em', flexShrink:0}}>{r.kind.toUpperCase()}</span>}
                </div>
                <div style={{display:'flex', alignItems:'center', gap:5, marginTop:3}}>
                  <span style={{font:'700 9.5px var(--font-body)', color: long?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{long?'LONG':'SHORT'} {r.lev}</span>
                  <span style={{font:'400 9.5px var(--font-body)', color:'var(--text-tertiary)'}}>· holds {sym}</span>
                </div>
              </div>
            </button>
            <div style={{textAlign:'right', flexShrink:0}}>
              <div style={{font:'400 7.5px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.05em'}}>30D PNL</div>
              <div className="num" style={{font:'700 12.5px var(--font-mono)', color: down?'var(--regime-down-mid)':'var(--regime-up-mid)', marginTop:1}}>{r.pnl30}</div>
            </div>
            <button onClick={()=>onCopy&&onCopy(r)} className="arx-press" style={{flexShrink:0, height:30, padding:'0 12px', borderRadius:9, cursor:'pointer', border:'.5px solid var(--color-violet-500)', background:'rgba(124,91,255,.10)', color:'var(--color-violet-500)', font:'600 11.5px var(--font-body)'}}>Copy</button>
          </div>
        );})}
      </div>
      <div style={{font:'400 10px var(--font-body)', color:'var(--text-tertiary)', marginTop:7, lineHeight:1.45}}>Wallets you watch + top holders of {sym} · tap a trader for their profile · context, not advice.</div>
      </React.Fragment>)}
    </div>
  );
}

/* ── Trade-ticket Lucid · suppressed by default, one read on request ──
   Silent until tapped so it never competes with Execute. Steady voice, context not advice. */
function TradeLucidChip({ sym='SOL', lev, longSide }) {
  const [open, setOpen] = uS(false);
  const liqAway = Math.max(4, Math.round(90/lev));
  const ask = () => window.__arxOpenLucid && window.__arxOpenLucid({
    contextLabel:'On '+sym+'-PERP · your ticket',
    intro:{ action:`Here's the context around a ${lev}× ${longSide?'long':'short'} on ${sym}.`,
      body:`Funding is +0.0084% / 8h — longs pay shorts, near its 8h average — and smart money sits 64% long. At ${lev}×, your estimated liquidation is roughly ${liqAway}% away. I can break down funding, the crowd, or your liquidation buffer. I won't tell you whether to take the trade.` },
    chips:[
      { label:'Is funding a problem here?', reply:{ conf:'medium', action:'Not yet — funding is positive but near its 8h average.', body:'At +0.0084% / 8h, longs pay shorts a small carry. It only bites if it spikes or you hold for days. A 3×+ spike is the level that has historically preceded pullbacks.', data:[['Funding / 8h','+0.0084%',''],['Vs 8h average','~1.0×',''],['Paid by','Longs → shorts','']] }},
      { label:'How much liquidation buffer do I have?', reply:{ conf:'high', action:`At ${lev}×, liquidation sits roughly ${liqAway}% from entry.`, body:'Lowering leverage or adding margin widens that buffer; a stop-loss caps the downside before liquidation. Fast markets can still gap through. This is structure, not a recommendation.', data:[['Leverage',lev+'×',''],['Est. liq. distance','~'+liqAway+'%',''],['Side',longSide?'Long':'Short','']] }},
      { label:'Where does smart money sit?', reply:{ conf:'medium', action:'Smart money on '+sym+' is 64% long — the crowd leans your way.', body:'A crowded side cuts both ways: momentum can carry it, but a flush hits the majority. Read it as positioning, not a green light.', data:[['Smart money','64% long','up'],['Crowd','Leaning long','']] }},
    ],
  });
  if (!open) return (
    <div style={{margin:'0 20px 12px'}}>
      <button onClick={()=>setOpen(true)} className="arx-press" style={{display:'inline-flex', alignItems:'center', gap:8, height:32, padding:'0 13px 0 7px', borderRadius:999, cursor:'pointer',
        background:'rgba(124,91,255,.08)', border:'.5px solid rgba(124,91,255,.22)'}}>
        <LucidOrb size={17} breathe={false}/>
        <span style={{font:'600 11.5px var(--font-body)', color:'var(--color-violet-500)'}}>Ask Lucid about this trade</span>
      </button>
    </div>
  );
  return (
    <div className="arx-arrive" style={{margin:'0 20px 12px', borderRadius:14, padding:'12px 13px',
      background:'linear-gradient(150deg, rgba(124,91,255,.12), rgba(124,91,255,.02) 72%)', border:'.5px solid rgba(124,91,255,.28)'}}>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <LucidOrb size={20} breathe={false}/>
        <span style={{font:'700 11.5px var(--font-body)'}}>Lucid · context</span>
        <span style={{font:'600 8px var(--font-body)', color:'var(--color-violet-500)', background:'rgba(124,91,255,.16)', padding:'2px 6px', borderRadius:999, letterSpacing:'.06em'}}>AI</span>
        <span style={{flex:1}}/>
        <button onClick={()=>setOpen(false)} style={{background:'none', border:'none', cursor:'pointer', color:'var(--text-tertiary)', font:'600 15px var(--font-body)', padding:'0 2px', lineHeight:1}}>×</button>
      </div>
      <div style={{display:'flex', gap:9, alignItems:'flex-start', marginTop:9}}>
        <span style={{width:5, height:5, borderRadius:'50%', flexShrink:0, marginTop:6, background:'var(--color-violet-500)'}}/>
        <span style={{font:'600 12px var(--font-body)', color:'var(--text-primary)', lineHeight:1.45}}>At {lev}×, your estimated liquidation sits ~{liqAway}% away. Funding is +0.0084% / 8h — near its 8h average, longs pay shorts.</span>
      </div>
      <div style={{font:'400 10px var(--font-body)', color:'var(--text-tertiary)', marginTop:8, lineHeight:1.45}}>Context, not advice. Never blocks your order.</div>
      <button onClick={ask} className="arx-press" style={{marginTop:10, paddingTop:10, display:'flex', alignItems:'center', gap:7, width:'100%', background:'none', border:'none', borderTop:'.5px solid rgba(124,91,255,.18)', cursor:'pointer'}}>
        <LucidOrb size={16} breathe={false}/>
        <span style={{flex:1, font:'600 11.5px var(--font-body)', color:'var(--color-violet-500)', textAlign:'left'}}>Continue with Lucid</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-violet-500)" strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>
    </div>
  );
}

/* ═══ MarketRow · canonical asset browse-row primitive (shared, was a local closure in MarketsScreen) ═══
   The rich market row: glyph · symbol+suffix+leverage · OI/funding-or-vol · smart-money lean · price · vol · 24h Δ · watch star.
   marketKind picks perp(-PERP/OI/funding/lev) vs spot(/USDC/vol). smart = 'long'|'short'|undefined lean. */
function MarketRow({ m, marketKind='perp', smart, onOpen, onTrade }) {
  const pos = m.deltaPct>=0;
  const pr = typeof m.price==='number' ? m.price.toLocaleString(undefined,{minimumFractionDigits: m.price<10?4:2, maximumFractionDigits: m.price<10?4:2}) : m.price;
  const suffix = marketKind==='perp' ? '-PERP' : '/USDC';
  return (
    <div className="arx-row-press" style={{
      width:'100%', display:'flex', alignItems:'center', padding:'12px 20px'}}>
      <button onClick={()=>onOpen && onOpen(m)} style={{flex:1, minWidth:0, display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer', textAlign:'left', padding:0}}>
      <AssetGlyph sym={m.sym} size={30}/>
      <div style={{flex:1, minWidth:0}}>
        <div style={{font:'600 14px var(--font-body)', color:'var(--text-primary)', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:6}}>{m.sym}<span style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)'}}>{suffix}</span></div>
        <div style={{display:'flex', alignItems:'center', gap:5, marginTop:3, whiteSpace:'nowrap', overflow:'hidden'}}>
          {marketKind==='perp' && <span style={{font:'600 9px var(--font-mono)', color:'var(--text-tertiary)', background:'var(--glass-control-bg)', padding:'1px 5px', borderRadius:5, flexShrink:0}}>{DISCOVER_LEV[m.sym]||20}×</span>}
          <span style={{font:'500 10.5px var(--font-body)', color:'var(--text-tertiary)', flexShrink:0}}>{marketKind==='perp'?`OI ${m.oi}`:`Vol ${m.vol}`}</span>
          {smart && <span style={{flexShrink:0, display:'inline-flex', alignItems:'center', gap:3, font:'700 9.5px var(--font-body)', color: smart==='long'?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>· ◆ {smart==='long'?'Long':'Short'}</span>}
        </div>
      </div>
      </button>
      <div style={{display:'flex', alignItems:'center', gap:8, flexShrink:0}}>
        <div className="num" style={{width:70, textAlign:'right', font:'600 13px var(--font-mono)', color:'var(--text-primary)'}}>{pr}</div>
        <div className="num" style={{width:58, textAlign:'right', font:'600 12px var(--font-mono)', color: pos?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{pos?'+':'−'}{Math.abs(m.deltaPct).toFixed(2)}%</div>
        <WatchStar sym={m.sym} size={18}/>
        {onTrade && <button onClick={(e)=>{ e.stopPropagation(); onTrade(m.sym); }} className="arx-press" aria-label={'Trade '+m.sym} style={{width:54, height:28, borderRadius:999, border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'700 11px var(--font-body)'}}>Trade</button>}
      </div>
    </div>
  );
}

/* ═══ 4 · MARKETS — markets → instrument → clusters → individual trades ═══ */
function MarketsScreen() {
  const [view, setView] = uS('overview');           // overview | favorites | browse
  const [gl, setGl] = uS('top');
  const [marketKind, setMarketKind] = uS('perp');   // spot | perp
  const [cls, setCls] = uS('Crypto');               // active asset class in browse
  const [sel, setSel] = uS(null);
  const [sortKey, setSortKey] = uS(null);
  const [sortDir, setSortDir] = uS('desc');
  const [moverLens, setMoverLens] = uS('top');
  const trHash2 = s=>{ let h=2166136261; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);} return ((h>>>0)%100)/100; };
  const watch = useWatchlist();
  const SMART = { SOL:'long', HYPE:'long', BTC:'long', ETH:'short', GOLD:'long', NVDA:'long', TSLA:'long', MSTR:'long', OPENAI:'long' };  // smart-money lean overlay
  const LEV = DISCOVER_LEV;

  if (sel) return (
    <Screen>
      {/* Instrument detail */}
      <div style={{display:'flex', alignItems:'center', gap:10, padding:'10px 20px'}}>
        <button onClick={()=>setSel(null)} style={{width:34, height:34, borderRadius:'50%', border:'.5px solid var(--border-default)',
          background:'var(--surface-elevated)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transform:'rotate(180deg)'}}>
          <IconChevron size={16} color="var(--text-primary)"/>
        </button>
        <AssetGlyph sym={sel.sym}/>
        <div style={{flex:1}}>
          <div style={{font:'700 17px var(--font-body)'}}>{sel.name}</div>
          <div className="num" style={{font:'500 12px var(--font-mono)', color:sel.deltaPct>=0?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>
            ${sel.price.toLocaleString()} · {sel.deltaPct>=0?'+':'−'}{Math.abs(sel.deltaPct)}% · OI {sel.oi}
          </div>
        </div>
        <RegimePill regime={sel.deltaPct>=0?'up':'down'} size="sm"/>
      </div>
      <LineChart data={sel.spark} positive={sel.deltaPct>=0}/>

      {/* D4 entry — positioning signals */}
      <button onClick={()=>window.__arxOpenSub && window.__arxOpenSub('signals',{focus:'instrument'})} className="arx-press" style={{
        display:'flex', alignItems:'center', gap:12, width:'calc(100% - 40px)', margin:'4px 20px 0',
        padding:'12px 14px', borderRadius:14, cursor:'pointer', textAlign:'left',
        background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-violet-500)" strokeWidth="1.8" strokeLinecap="round"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>
        <div style={{flex:1}}>
          <div style={{font:'600 13.5px var(--font-body)', color:'var(--text-primary)'}}>Positioning signals</div>
          <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>Bias · Flow · Entry walls · Liquidation stress</div>
        </div>
        <IconChevron color="var(--text-tertiary)"/>
      </button>

      {false && <SectionHeader>Smart traders in this market</SectionHeader>}
      <div style={{display:'flex', gap:8, padding:'0 20px 6px', overflowX:'auto', scrollbarWidth:'none'}}>
        {[['Smart money','12 wallets','rgba(124,91,255,.14)','var(--color-violet-700)','smart'],
          ['Whales','6 wallets','rgba(59,130,246,.14)','var(--regime-range-dark)','whale'],
          ['Funds','3 wallets','rgba(45,212,155,.14)','var(--regime-up-dark)','smart']].map(([t,c,bg,ink,cohort]) => (
          <button key={t} onClick={()=>{ window.__arxGoTab && window.__arxGoTab('wallets'); window.__arxToast && window.__arxToast(t+' on '+sel.sym+' — in Copy → Smart Money'); }} className="arx-press" style={{flexShrink:0, padding:'10px 16px', borderRadius:12, border:'none', cursor:'pointer', background:bg, textAlign:'left'}}>
            <div style={{font:'600 13px var(--font-body)', color:ink}}>{t}</div>
            <div style={{font:'500 11px var(--font-body)', color:ink, opacity:.7, marginTop:2}}>{c}</div>
          </button>
        ))}
      </div>

      <SectionHeader>Latest trades</SectionHeader>
      {D.clusterTrades.map((t,i) => (
        <button key={i} onClick={()=>{ const w = WALLETS.find(x=>x.addr===t.who) || WALLETS[t.tag==='Whale'?3:0]; window.__arxOpenSub && window.__arxOpenSub('walletDetail',{w}); }} className="arx-row-press" style={{display:'flex', alignItems:'center', gap:12, padding:'11px 20px', width:'100%', background:'none', border:'none', cursor:'pointer', textAlign:'left'}}>
          <WalletAvatar w={{addr:t.who}} size={34}/>
          <div style={{flex:1}}>
            <div style={{display:'flex', gap:6, alignItems:'center'}}>
              <span className="num" style={{font:'600 13px var(--font-mono)'}}>{t.who}</span>
              <span style={{font:'600 9px var(--font-body)', color:'var(--color-violet-700)', background:'rgba(124,91,255,.14)', padding:'1px 6px', borderRadius:999}}>{t.tag}</span>
            </div>
            <div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>entry {t.entry} · {t.time} ago</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{font:'700 12px var(--font-body)', color:t.side==='LONG'?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{t.side}</div>
            <div className="num" style={{font:'500 12px var(--font-mono)', color:'var(--text-secondary)', marginTop:1}}>{t.size}</div>
          </div>
        </button>
      ))}
    </Screen>
  );

  const flatAll = (()=>{ const o=[]; for(const k in D.instruments) D.instruments[k].forEach(m=>o.push({...m, cat:k})); return o; })();
  const openInstr = (m)=>window.__arxOpenSub && window.__arxOpenSub('instrumentDetail',{m});
  // classes available for the current market kind (spot is crypto-only for now)
  const classesForKind = marketKind==='spot' ? MARKET_CLASSES.filter(([k])=>SPOT_CLASSES.includes(k)) : MARKET_CLASSES;
  const enterBrowse = (kind)=>{ setMarketKind(kind); setView('browse'); setGl('top'); if(kind==='spot' && !SPOT_CLASSES.includes(cls)) setCls('Crypto'); };

  const Row = (m) => <MarketRow key={m.sym} m={m} marketKind={marketKind} smart={SMART[m.sym]} onOpen={openInstr} onTrade={(s)=>window.__arxTrade && window.__arxTrade(s)}/>;

  // column sort (applies to the browse table)
  const sortRows = (rows) => {
    if (!sortKey) return rows;
    const num = (v)=> typeof v==='number' ? v : parseFloat(String(v).replace(/[^0-9.\-]/g,''))||0;
    const key = (m)=> sortKey==='price' ? num(m.price) : sortKey==='vol' ? num(m.vol)*(/B/.test(m.vol)?1000:1) : m.deltaPct;
    const out = [...rows].sort((a,b)=> key(b)-key(a));
    return sortDir==='asc' ? out.reverse() : out;
  };
  const onSort = (k) => { if (sortKey===k) setSortDir(d=>d==='desc'?'asc':'desc'); else { setSortKey(k); setSortDir('desc'); } };

  // body rows for browse
  let classRows = discByClass(cls);
  classRows = gl==='gainers' ? [...classRows].sort((a,b)=>b.deltaPct-a.deltaPct)
    : gl==='losers' ? [...classRows].sort((a,b)=>a.deltaPct-b.deltaPct)
    : gl==='trending' ? [...classRows].sort((a,b)=>Math.abs(b.deltaPct)-Math.abs(a.deltaPct))
    : gl==='smart' ? classRows.filter(m=>SMART[m.sym]) : classRows;
  const favRows = flatAll.filter(m=>watch.includes(m.sym));
  const topMovers = [...flatAll].sort((a,b)=>Math.abs(b.deltaPct)-Math.abs(a.deltaPct)).slice(0,5);
  const smartRows = flatAll.filter(m=>SMART[m.sym]).sort((a,b)=>b.deltaPct-a.deltaPct).slice(0,4);
  const sortArrow = (k)=> sortKey===k ? (sortDir==='desc'?' ↓':' ↑') : '';
  const railColHead = (
    <div style={{display:'flex', alignItems:'center', padding:'2px 20px 8px', font:'500 9px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.06em', textTransform:'uppercase'}}>
      <span style={{flex:1}}>{marketKind==='perp'?'Perpetuals':'Spot'}</span>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <button onClick={()=>onSort('price')} style={{width:70, textAlign:'right', background:'none', border:'none', cursor:'pointer', font:'inherit', letterSpacing:'inherit', textTransform:'inherit', color: sortKey==='price'?'var(--color-violet-500)':'var(--text-tertiary)'}}>Last{sortArrow('price')}</button>
        <button onClick={()=>onSort('change')} style={{width:58, textAlign:'right', background:'none', border:'none', cursor:'pointer', font:'inherit', letterSpacing:'inherit', textTransform:'inherit', color: sortKey==='change'?'var(--color-violet-500)':'var(--text-tertiary)'}}>Change{sortArrow('change')}</button>
        <span style={{width:18}}/>
        <span style={{width:54}}/>
      </div>
    </div>
  );

  return (
    <Screen>
      <TopBar title="Markets" balance="$24,837" risk="normal" bellCount={4}/>
      <UnifiedSearchBar placeholder="Ask Lucid, or search assets…"/>
      <TickerTape/>

      {/* PRIMARY RAIL — Overview · Favorites · Spot · Perps (horizontal scroll, not tabs) */}
      <div style={{display:'flex', gap:8, overflowX:'auto', padding:'12px 20px 12px', scrollbarWidth:'none'}}>
        {[
          {id:'overview', label:'Overview', active: view==='overview', on:()=>{ setView('overview'); }},
          {id:'favorites', label:'★ Favorites', active: view==='favorites', on:()=>{ setView('favorites'); }},
          {id:'spot', label:'Spot', active: view==='browse' && marketKind==='spot', on:()=>enterBrowse('spot')},
          {id:'perp', label:'Perps', active: view==='browse' && marketKind==='perp', on:()=>enterBrowse('perp')},
        ].map(({id,label,active,on}) => (
          <button key={id} onClick={on} className="arx-press" style={{
            flexShrink:0, height:34, padding:'0 16px', borderRadius:999, cursor:'pointer',
            background: active ? 'var(--color-violet-500)' : 'var(--surface-elevated)',
            border:'.5px solid ' + (active ? 'var(--color-violet-500)' : 'var(--border-default)'),
            color: active ? '#fff' : 'var(--text-secondary)', font:`${active?700:600} 13px var(--font-body)`
          }}>{label}</button>
        ))}
      </div>

      {view==='overview' ? (
        window.MarketsOverview ? (
          <>
            <MarketsOverview inst="perp" onOpen={openInstr} onNews onSeeAll={()=>enterBrowse('perp')}/>
            <div style={{display:'flex', gap:8, padding:'4px 20px 18px'}}>
              <button onClick={()=>window.__arxOpenSub&&window.__arxOpenSub('whatif',{sym:'SOL'})} className="arx-press" style={{flex:1, height:40, borderRadius:12, border:'.5px solid var(--border-default)', background:'var(--surface-elevated)', color:'var(--text-primary)', font:'700 12.5px var(--font-body)', cursor:'pointer'}}>What-if simulator</button>
              <button onClick={()=>window.__arxOpenSub&&window.__arxOpenSub('regime')} className="arx-press" style={{flex:1, height:40, borderRadius:12, border:'.5px solid var(--border-default)', background:'var(--surface-elevated)', color:'var(--text-primary)', font:'700 12.5px var(--font-body)', cursor:'pointer'}}>Regime explainer</button>
            </div>
          </>
        ) : (
        <>
          <div style={{padding:'0 20px 12px'}}><RegimePill regime="up" day={7}/></div>
          {/* News & events stream entry */}
          <button onClick={()=>window.__arxOpenSub && window.__arxOpenSub('newsImmersive', {})} className="arx-press" style={{display:'flex', alignItems:'center', gap:12, width:'calc(100% - 40px)', margin:'0 20px 6px', padding:'13px 15px', borderRadius:16, cursor:'pointer', textAlign:'left', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
            <span style={{width:38, height:38, borderRadius:11, flexShrink:0, background:'rgba(124,91,255,.12)', color:'var(--color-violet-500)', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 13z"/><path d="M11.6 16.8 A2 2 0 0 1 8 18"/></svg>
            </span>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', alignItems:'center', gap:7}}><span style={{font:'700 13.5px var(--font-body)'}}>News &amp; events</span><span style={{width:6, height:6, borderRadius:'50%', background:'var(--regime-down-mid)'}} className="arx-breath"/></div>
              <div style={{font:'500 11.5px var(--font-body)', color:'var(--text-secondary)', marginTop:2}}>Fed CPI · SOL inflows · ETH regime — 3 new</div>
            </div>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0}}><polyline points="9 6 15 12 9 18"/></svg>
          </button>
          <SectionHeader action="What-if" onAction={()=>window.__arxOpenSub && window.__arxOpenSub('whatif',{sym:'SOL'})}>Spotlight</SectionHeader>
          <SpotlightCards syms={['BTC','ETH','SOL','HYPE','NVDA','GOLD','OPENAI']} onOpen={openInstr}/>
          <SectionHeader action="All" onAction={()=>enterBrowse('perp')}>Top movers</SectionHeader>
          {(()=>{
            const lenses = [['top','Gainers'],['losers','Losers'],['oidelta','OI-Δ'],['voldelta','Vol-Δ']];
            const [ml, setMl] = [moverLens, setMoverLens];
            const lensRows = ml==='losers' ? [...flatAll].sort((a,b)=>a.deltaPct-b.deltaPct).slice(0,5)
              : ml==='oidelta' ? [...flatAll].sort((a,b)=>Math.abs(b.deltaPct)*1.4+trHash2(b.sym)*20 - (Math.abs(a.deltaPct)*1.4+trHash2(a.sym)*20)).slice(0,5)
              : ml==='voldelta' ? [...flatAll].sort((a,b)=>parseFloat(String(b.vol||'0').replace(/[$BMK,]/g,''))*(String(b.vol||'').includes('B')?1e9:1e6) - parseFloat(String(a.vol||'0').replace(/[$BMK,]/g,''))*(String(a.vol||'').includes('B')?1e9:1e6)).slice(0,5)
              : [...flatAll].sort((a,b)=>b.deltaPct-a.deltaPct).slice(0,5);
            return <>
              <div style={{display:'flex', gap:6, overflowX:'auto', padding:'2px 20px 8px', scrollbarWidth:'none'}}>{lenses.map(([id,l])=>(<button key={id} onClick={()=>setMl(id)} style={{flexShrink:0, height:27, padding:'0 12px', borderRadius:999, border:'none', cursor:'pointer', font:`${ml===id?700:500} 11.5px var(--font-body)`, background:ml===id?'var(--color-violet-500)':'var(--glass-control-bg)', color:ml===id?'#fff':'var(--text-secondary)'}}>{l}</button>))}</div>
              {lensRows.map(Row)}</> ;
          })()}
          <SectionHeader action="Explain" onAction={()=>window.__arxOpenSub && window.__arxOpenSub('regime')}>Market regime</SectionHeader>
          <SentimentGauge value={38}/>
          <MarketPositioning sym="SOL" longPct={64}/>
          {(()=>{
            const upCount = flatAll.filter(m=>m.deltaPct>=0).length;
            const avgFund = '+0.011%';
            const vol = flatAll.reduce((s,m)=>s+(parseFloat(String(m.oi||'0').replace(/[$BMK,]/g,''))*(String(m.oi||'').includes('B')?1e9:String(m.oi||'').includes('M')?1e6:1e3)),0);
            const volStr = vol>=1e12?'$'+(vol/1e12).toFixed(1)+'T':vol>=1e9?'$'+(vol/1e9).toFixed(0)+'B':'$'+(vol/1e6).toFixed(0)+'M';
            return (
              <div style={{display:'flex', gap:0, padding:'2px 20px 10px', borderBottom:'.5px solid var(--border-default)', marginBottom:4}}>
                {[[''+upCount+' / '+flatAll.length+' up','Breadth'],['OI '+volStr,'Open interest'],[avgFund+' / 8h','Net funding'],['Compressing','Volatility']].map(([v,l],i)=>(
                  <div key={l} style={{flex:1, borderLeft:i?'.5px solid var(--border-default)':undefined, paddingLeft:i?10:0}}>
                    <div className="num" style={{font:'700 11.5px var(--font-mono)', color:'var(--text-primary)', letterSpacing:'-.01em', whiteSpace:'nowrap'}}>{v}</div>
                    <div style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.04em', textTransform:'uppercase', marginTop:2}}>{l}</div>
                  </div>
                ))}
              </div>
            );
          })()}
          {window.MarketHeatmap ? (() => {
            const hItems = flatAll.slice(0,20).map(m=>({symbol:m.sym, weight:parseFloat(String(m.oi||'1').replace(/[$BMK,]/g,''))*(String(m.oi||'').includes('B')?1e9:String(m.oi||'').includes('M')?1e6:1e3)||1e6, deltaPct:m.deltaPct||0}));
            return <div style={{padding:'0 20px'}}><MarketHeatmap items={hItems} height={220} width={362} onTap={sym=>{const mi=flatAll.find(x=>x.sym===sym); if(mi)openInstr(mi);}}/></div>;
          })() : <Heatmap onOpen={openInstr}/>}
          <SectionHeader>Smart money is active</SectionHeader>
          {smartRows.map(Row)}
          <div style={{margin:'14px 20px 0', font:'400 12px var(--font-body)', color:'var(--text-tertiary)', textAlign:'center'}}>Tap Spot or Perps above to browse every market.</div>
        </>
        )
      ) : view==='favorites' ? (
        favRows.length ? (<>{railColHead}{favRows.map(Row)}</>) : (
          <div style={{textAlign:'center', padding:'40px 40px', color:'var(--text-tertiary)'}}>
            <div style={{font:'600 14px var(--font-body)', color:'var(--text-primary)'}}>Nothing watched yet</div>
            <div style={{font:'400 12.5px var(--font-body)', marginTop:6, lineHeight:1.5}}>Tap the star on any market to follow it here.</div>
          </div>
        )
      ) : (
        <>
          {/* SECOND TIER — asset classes for this market kind (horizontal scroll) */}
          <div style={{display:'flex', gap:8, overflowX:'auto', padding:'0 20px 10px', scrollbarWidth:'none'}}>
            {classesForKind.map(([id,l]) => (
              <button key={id} onClick={()=>{ setCls(id); setGl('top'); }} className="arx-press" style={{
                flexShrink:0, height:30, padding:'0 15px', borderRadius:999, cursor:'pointer',
                background: cls===id ? 'rgba(124,91,255,.14)' : 'transparent',
                border:'.5px solid ' + (cls===id ? 'var(--color-violet-500)' : 'var(--border-default)'),
                color: cls===id ? 'var(--color-violet-700)' : 'var(--text-secondary)', font:`${cls===id?700:600} 12.5px var(--font-body)`}}>{l}</button>
            ))}
          </div>
          {/* lens chips */}
          <div style={{display:'flex', gap:8, overflowX:'auto', padding:'0 20px 8px', scrollbarWidth:'none'}}>
            {[['top','All'],['gainers','Gainers'],['losers','Losers'],['trending','Trending'],['smart','Smart-money active']].map(([id,l]) => (
              <button key={id} onClick={()=>setGl(id)} className="arx-press" style={{
                flexShrink:0, height:28, padding:'0 13px', borderRadius:999, cursor:'pointer',
                border:'.5px solid ' + (gl===id ? 'var(--border-strong)' : 'var(--border-default)'),
                background: gl===id ? 'var(--surface-elevated)' : 'transparent',
                color: gl===id ? 'var(--text-primary)' : 'var(--text-secondary)', font:`${gl===id?700:600} 12px var(--font-body)`}}>{l}</button>
            ))}
          </div>
          {railColHead}
          {sortRows(classRows).map(Row)}
          {classRows.length===0 && <div style={{textAlign:'center', padding:'30px 40px', font:'500 12.5px var(--font-body)', color:'var(--text-tertiary)'}}>No markets in this lens.</div>}
          <div style={{margin:'10px 20px 0', font:'400 12px var(--font-body)', color:'var(--text-tertiary)', textAlign:'center'}}>Tap an instrument → signals · positioning · risk</div>
        </>
      )}
    </Screen>
  );
}

/* ═══ 5 · YOU — portfolio · deposit/withdraw · referrals · rewards · prefs ═══ */
function YouScreen({ onSignOut, onToast, confirmMode = 'hold', onRequestExpress, onDisableExpress }) {
  const [appLock, toggleLock] = useAppLock();
  const [holdTab, setHoldTab] = uS('positions');
  const [showPnl, setShowPnl] = uS(false);
  const [histTab, setHistTab] = uS('trades');
  const [posFilter, setPosFilter] = uS('all');
  const [confirmMethod, setConfirmMethod] = useConfirmMethod();
  const persona = (()=>{ try { return localStorage.getItem('arx-persona')||'s7'; } catch(e){ return 's7'; } })();
  return (
    <Screen>
      <TopBar title="You" balance="$24,837" risk="normal" bellCount={4}/>
      {/* Profile stat card */}
      <div style={{margin:'8px 20px 0', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:18, overflow:'hidden'}}>
        <div onClick={()=>window.__arxOpenSub&&window.__arxOpenSub('profile')} className="arx-press" role="button" style={{width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 14px 10px', cursor:'pointer', textAlign:'left'}}>
          <PersonAvatar seed="elon.musk" photo="assets/elon.png" size={52}/>
          <div style={{flex:1, minWidth:0}}>
            <div style={{font:'700 17px var(--font-body)', display:'flex', alignItems:'center', gap:8}}>elon.musk<span style={{font:'600 10px var(--font-body)', color:'var(--regime-up-mid)', background:'rgba(45,212,155,.12)', padding:'2px 7px', borderRadius:999}}>Whale · Smart</span></div>
            <div style={{font:'500 11.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:3, display:'flex', alignItems:'center', gap:6}}><span className="num" style={{fontFamily:'var(--font-mono)'}}>0x4b2e…91ac</span><span style={{display:'inline-flex', alignItems:'center', gap:3, font:'600 9.5px var(--font-body)', color:'var(--regime-up-mid)', background:'rgba(45,212,155,.12)', padding:'2px 7px', borderRadius:999}}>◉ self-custody</span></div>
          </div>
          {window.IconGear ? <button onClick={(e)=>{e.stopPropagation(); window.__arxOpenSub&&window.__arxOpenSub('youSettings');}} style={{width:34, height:34, borderRadius:10, background:'var(--glass-control-bg)', border:'.5px solid var(--border-default)', cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0}}><IconGear size={16}/></button> : <IconChevron color="var(--text-tertiary)"/>}
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:0, borderTop:'.5px solid var(--border-default)'}}>
          {[['30D Return','+32.8%','var(--regime-up-mid)'],['Win rate','61%','var(--text-primary)'],['Copiers','12','var(--text-primary)'],['Followers','128','var(--text-primary)']].map(([l,v,c],i)=>(
            <div key={l} style={{padding:'10px 0 10px', borderLeft:i?'.5px solid var(--border-default)':undefined, textAlign:'center'}}>
              <div className="num" style={{font:'700 15px var(--font-mono)', color:c}}>{v}</div>
              <div style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.04em', marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {window.YouQuickNav && <YouQuickNav persona={persona}/>}

      <UnifiedSearchBar placeholder="Ask Lucid about your portfolio…"/>

      {/* Spot holdings mini-strip */}
      <div style={{display:'flex', gap:10, overflowX:'auto', padding:'4px 20px 0', scrollbarWidth:'none'}}>
        {[{sym:'SOL',val:'$1,226',chg:'+4.2%',up:true},{sym:'HYPE',val:'$663',chg:'+1.8%',up:true},{sym:'BTC',val:'$571',chg:'−0.6%',up:false},{sym:'NVDA',val:'$320',chg:'+2.2%',up:true},{sym:'USDC',val:'$9,214',chg:'',up:true}].map(h=>(
          <div key={h.sym} style={{flexShrink:0, minWidth:140, display:'flex', alignItems:'center', gap:10, padding:'10px 13px', borderRadius:14, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
            <AssetGlyph sym={h.sym} size={28}/>
            <div style={{flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:2}}>
              <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:8}}>
                <span style={{font:'700 13px var(--font-body)', color:'var(--text-primary)'}}>{h.sym}</span>
                <span className="num" style={{font:'700 11px var(--font-mono)', color:h.chg?(h.up?'var(--regime-up-mid)':'var(--regime-down-mid)'):'var(--text-tertiary)'}}>{h.chg || 'Cash'}</span>
              </div>
              <span className="num" style={{font:'500 11.5px var(--font-mono)', color:'var(--text-tertiary)'}}>{h.val}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Portfolio summary */}
      <div data-you-sec="overview" style={{margin:'12px 20px', padding:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:16}}>
        <div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>Portfolio</div>
        <div className="num" style={{font:'600 30px var(--font-mono)', letterSpacing:'-.02em', marginTop:6}}>$24,837.42</div>
        <div style={{display:'flex', marginTop:12, paddingTop:12, borderTop:'.5px solid var(--border-default)'}}>
          {[['Available','$9,214.10'],['Margin used','$14,423.32'],['Copying','$1,200.00']].map(([k,v]) => (
            <div key={k} style={{flex:1}}>
              <div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)'}}>{k}</div>
              <div className="num" style={{font:'600 14px var(--font-mono)', marginTop:2}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{display:'flex', gap:10, marginTop:14}}>
          <button onClick={()=>onToast('Add funds to your Arx wallet')} className="arx-press" style={{flex:1, height:42, borderRadius:12, border:'none', cursor:'pointer',
            background:'var(--color-violet-500)', color:'#fff', font:'600 14px var(--font-body)'}}>Deposit</button>
          <button onClick={()=>onToast('Withdraw — USDC to your wallet')} className="arx-press" style={{flex:1, height:42, borderRadius:12, cursor:'pointer',
            background:'transparent', color:'var(--text-primary)', border:'.5px solid var(--border-strong)', font:'600 14px var(--font-body)'}}>Withdraw</button>
          <button onClick={()=>window.__arxOpenSub && window.__arxOpenSub('transfer')} className="arx-press" style={{flex:1, height:42, borderRadius:12, cursor:'pointer',
            background:'transparent', color:'var(--text-primary)', border:'.5px solid var(--border-strong)', font:'600 14px var(--font-body)'}}>Transfer</button>
        </div>
      </div>

      <LucidTip kicker="Portfolio read"
        verdict={{text:'Equity $24,837 — up 5.1% today. Margin healthy, nothing near a threshold.', tone:'up'}}
        groups={[
          {label:'Where it stands', tone:'note', items:['$9,214 available · $14,423 working as margin · $1,200 in copies','Margin usage is comfortable — no maintenance threshold in reach']},
          {label:'Worth knowing', tone:'warn', items:['Closest copy loss limit is 14% away — your guardrails have room','SOL drives most of today\u2019s move — single-name concentration to watch']},
        ]}
        foot="Ask Lucid about your portfolio"
        seed={{
          contextLabel:'On your portfolio · $24,837',
          intro:{ action:'Equity is $24,837 — up 5.1% on the day.', body:'$9,214 is available, $14,423 is working as margin, and $1,200 is in copies. Margin usage is healthy and nothing is near a maintenance threshold. I can break down the allocation, your risk, or what moved today.' },
          chips:[
            { label:'How is my risk right now?', reply:{ conf:'high', action:'Comfortable — margin usage is healthy and no position is near liquidation.', body:'Your closest copy loss limit sits 14% away, and account margin is well above maintenance. Nothing needs action right now. This is a read, not a recommendation.', data:[['Margin used','$14,423.32',''],['Closest loss limit','14% away',''],['Available','$9,214.10','']] }},
            { label:'What moved today?', reply:{ conf:'high', action:"SOL did most of the work — up 4.2%, and you're long it via a copy.", body:'Your @HsakaTrades copy carried the day, and SOL is the largest single contributor. That also means today\u2019s gain is concentrated — a pullback in one name would show up fast.', data:[['SOL today','+4.2%','up'],['Copy PnL · today','+$340.10','up'],['Top contributor','SOL','']] }},
            { label:'Am I too concentrated?', reply:{ conf:'medium', action:'A bit — SOL drives an outsized share of today\u2019s move.', body:"Concentration isn't inherently wrong, but it raises single-name risk. Spreading copy capital or trimming size are the usual levers. You decide.", note:'Analysis, not a recommendation.' }},
          ],
        }}/>

      {window.YouCopies && <YouCopies persona={persona} onToast={onToast}/>}

      <button data-you-sec="pnl" onClick={()=>setShowPnl(v=>!v)} className="arx-press" style={{display:'flex', alignItems:'center', gap:8, width:'100%', background:'none', border:'none', cursor:'pointer', padding:'24px 20px 12px'}}>
        <span className="arx-eyebrow-pill">Daily PnL</span>
        <span style={{flex:1}}/>
        <span style={{font:'600 11px var(--font-body)', color:'var(--text-tertiary)'}}>{showPnl?'Hide':'Show'}</span>
        <span style={{font:'700 12px var(--font-body)', color:'var(--text-tertiary)', transform:showPnl?'rotate(180deg)':'none', transition:'transform .2s'}}>⌄</span>
      </button>
      {showPnl && <PnlCalendar title="Your daily PnL · 30d" sub="Realized across spot, perps and copies"/>}

      {/* Holdings — Positions · Orders · History (the portfolio home) */}
      <div data-you-sec="holdings"></div>
      <div style={{padding:'18px 20px 8px'}}>
        <div style={{position:'relative', display:'flex', background:'var(--glass-control-bg)', borderRadius:10, padding:3, height:36}}>
          <div style={{position:'absolute', top:3, bottom:3, width:'calc((100% - 6px)/3)', left:`calc(${['positions','orders','history'].indexOf(holdTab)} * (100% - 6px)/3 + 3px)`, background:'var(--surface-base)', borderRadius:8, boxShadow:'0 1px 3px rgba(0,0,0,.12)', transition:'left 280ms cubic-bezier(.4,0,.2,1)'}}/>
          {[['positions','Positions'],['orders','Orders'],['history','History']].map(([id,l])=>(
            <button key={id} onClick={()=>setHoldTab(id)} style={{flex:1, position:'relative', zIndex:1, background:'none', border:'none', cursor:'pointer', font:`${holdTab===id?700:600} 13px var(--font-body)`, color: holdTab===id?'var(--color-violet-700)':'var(--text-secondary)', transition:'color 200ms'}}>{l}</button>
          ))}
        </div>
      </div>
      {holdTab==='positions' && (
        <div style={{display:'flex', gap:7, padding:'0 20px 8px'}}>
          {[['all','All'],['perp','Perps'],['spot','Spot']].map(([id,l])=>{ const on=posFilter===id; return <button key={id} onClick={()=>setPosFilter(id)} style={{height:28, padding:'0 13px', borderRadius:999, border:'none', cursor:'pointer', font:`${on?700:600} 12px var(--font-body)`, background: on?'color-mix(in srgb, var(--color-violet-500) 15%, var(--surface-base))':'transparent', color: on?'var(--text-primary)':'var(--text-tertiary)'}}>{l}</button>; })}
        </div>
      )}
      {holdTab==='positions' && posFilter==='spot' && <div style={{textAlign:'center', padding:'28px 20px', font:'500 12.5px var(--font-body)', color:'var(--text-tertiary)'}}>No spot positions yet</div>}
      {holdTab==='positions' && posFilter!=='spot' && [['SOL','LONG','6×','$3,420','+$912.40','$182.41','$148.20'],['ETH','LONG','5×','$1,860','+$472.20','$3,410.20','$2,890.00'],['BTC','LONG','4×','$5,200','+$1,144.00','$63,200','$52,800'],['HYPE','LONG','8×','$2,100','+$588.00','$32.10','$27.40'],['AVAX','LONG','5×','$1,540','+$431.20','$34.60','$29.10']].map((p,i)=>(
        <button key={i} onClick={()=>window.__arxOpenSub && window.__arxOpenSub('managePos',{p:{sym:p[0],dir:p[1],lev:p[2],size:p[3],pnl:p[4],entry:p[5],liq:p[6]}})} className="arx-row-press" style={{width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderBottom:'.5px solid var(--border-default)', background:'none', border:'none', cursor:'pointer', textAlign:'left'}}>
          <AssetGlyph sym={p[0]} size={32}/>
          <div style={{flex:1, minWidth:0}}><div><span style={{font:'600 13.5px var(--font-body)', color:'var(--text-primary)'}}>{p[0]}-PERP</span><span style={{font:'700 9px var(--font-body)', marginLeft:6, color:p[1]==='LONG'?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{p[1]} {p[2]}</span></div><div className="num" style={{font:'500 10.5px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>Size {p[3]} · entry {p[5]} · liq {p[6]}</div></div>
          <div className="num" style={{font:'600 13px var(--font-mono)', whiteSpace:'nowrap', flexShrink:0, color:p[4].startsWith('+')?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{p[4]}</div>
        </button>
      ))}
      {holdTab==='orders' && [['SOL','LIMIT BUY','$500 @ $208.00','pending'],['HYPE','LIMIT BUY','$300 @ $36.00','partial'],['BTC','LIMIT BUY','$1,000 @ $62,000','pending'],['ETH','LIMIT BUY','$600 @ $3,350.00','pending'],['AVAX','LIMIT BUY','$400 @ $33.50','partial']].map((o,i)=>(
        <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderBottom:'.5px solid var(--border-default)'}}>
          <AssetGlyph sym={o[0]} size={28}/>
          <div style={{flex:1}}><div style={{display:'flex', alignItems:'center', gap:6}}><span style={{font:'600 12.5px var(--font-body)'}}>{o[0]}-PERP</span><OrderStateBadge state={o[3]}/></div><div style={{font:'600 9.5px var(--font-body)', letterSpacing:'.03em', marginTop:2, color: String(o[1]).includes('TAKE PROFIT')?'var(--regime-up-mid)':String(o[1]).includes('STOP')?'var(--regime-down-mid)':'var(--text-secondary)'}}>{o[1]}</div><div className="num" style={{font:'500 10.5px var(--font-mono)', color:'var(--text-tertiary)', marginTop:1}}>{o[2]}</div></div>
          <button onClick={()=>onToast('Order canceled')} style={{height:26, padding:'0 11px', borderRadius:8, border:'.5px solid var(--border-strong)', background:'transparent', color:'var(--text-secondary)', font:'600 10.5px var(--font-body)', cursor:'pointer'}}>Cancel</button>
        </div>
      ))}
      {holdTab==='history' && <div style={{display:'flex', gap:7, padding:'2px 20px 8px'}}>{[['trades','Trades'],['transfers','Transfers']].map(([id,l])=>{const on=histTab===id;return <button key={id} onClick={()=>setHistTab(id)} style={{height:28,padding:'0 14px',borderRadius:999,border:'none',cursor:'pointer',font:`${on?700:600} 12px var(--font-body)`,background:on?'color-mix(in srgb, var(--color-violet-500) 15%, var(--surface-base))':'transparent',color:on?'var(--text-primary)':'var(--text-tertiary)'}}>{l}</button>;})}</div>}
      {holdTab==='history' && histTab==='trades' && [['SOL','+$912.40','2h ago','filled'],['ETH','+$472.20','5h ago','filled'],['BTC','+$1,144.00','1d ago','filled'],['HYPE','+$588.00','2d ago','filled'],['AVAX','+$431.20','3d ago','filled']].map((h,i)=>(
        <button key={i} onClick={()=>window.__arxOpenSub && window.__arxOpenSub('history')} className="arx-row-press" style={{width:'100%', display:'flex', alignItems:'center', gap:12, padding:'11px 20px', borderBottom:'.5px solid var(--border-default)', background:'none', border:'none', cursor:'pointer', textAlign:'left'}}><AssetGlyph sym={h[0]} size={26}/><div style={{flex:1}}><div style={{display:'flex', alignItems:'center', gap:6}}><span style={{font:'600 12.5px var(--font-body)'}}>{h[0]}-PERP</span><OrderStateBadge state={h[3]}/></div><div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>{h[2]}</div></div><span className="num" style={{font:'600 12px var(--font-mono)', color:h[1].startsWith('+')?'var(--regime-up-mid)':h[1].startsWith('−')?'var(--regime-down-mid)':'var(--text-tertiary)'}}>{h[1]}</span></button>
      ))}
      {holdTab==='history' && histTab==='transfers' && [['Deposit','Card · USDC','+$5,000.00','3d ago','↓','var(--regime-up-mid)'],['Withdraw','To 0x4b2e…','−$1,200.00','6d ago','↑','var(--regime-down-mid)'],['Swap','USDC → SOL','$800.00','8d ago','⇄','var(--text-secondary)']].map((t,i)=>(
        <button key={i} onClick={()=>window.__arxOpenSub && window.__arxOpenSub('funding')} className="arx-row-press" style={{width:'100%', display:'flex', alignItems:'center', gap:12, padding:'11px 20px', borderBottom:'.5px solid var(--border-default)', background:'none', border:'none', cursor:'pointer', textAlign:'left'}}><span style={{width:30, height:30, borderRadius:9, flexShrink:0, display:'inline-flex', alignItems:'center', justifyContent:'center', background:'var(--glass-control-bg)', color:t[5], font:'700 14px var(--font-body)'}}>{t[4]}</span><div style={{flex:1}}><div style={{font:'600 12.5px var(--font-body)'}}>{t[0]}</div><div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>{t[1]} · {t[3]}</div></div><span className="num" style={{font:'600 12px var(--font-mono)', color:t[5]}}>{t[2]}</span></button>
      ))}
      <div style={{height:28}}/>

      {/* Rewards + referral */}
      <div data-you-sec="earn" style={{display:'flex', gap:10, margin:'4px 20px 8px'}}>
        <button onClick={()=>window.__arxOpenSub && window.__arxOpenSub('rewards',{tab:'rewards'})} style={{flex:1, textAlign:'left', padding:14, background:'rgba(124,91,255,.10)', border:'none', borderRadius:14, cursor:'pointer'}}>
          <div style={{font:'500 11px var(--font-body)', color:'var(--color-violet-700)', textTransform:'uppercase', letterSpacing:'.05em'}}>Rewards</div>
          <div style={{font:'700 21px var(--font-body)', color:'var(--color-violet-700)', marginTop:4, letterSpacing:'-.01em'}}>2,840 <span style={{font:'600 13px var(--font-body)'}}>pts</span></div>
          <div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>Silver tier · 12-day streak</div>
        </button>
        <button onClick={()=>window.__arxOpenSub && window.__arxOpenSub('rewards',{tab:'referrals'})} style={{flex:1, textAlign:'left', padding:14, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:14, cursor:'pointer'}}>
          <div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>Referrals</div>
          <div style={{font:'700 21px var(--font-body)', marginTop:4, letterSpacing:'-.01em'}}>38 <span style={{font:'600 13px var(--font-body)'}}>joined</span></div>
          <div style={{font:'600 12px var(--font-body)', color:'var(--color-violet-500)', marginTop:2}}>Share ARX-ELON →</div>
        </button>
      </div>

      {window.YouAccountZone && <YouAccountZone onToast={onToast}/>}

      <div style={{padding:'18px 20px 8px'}}>
        <button onClick={onSignOut} style={{width:'100%', height:46, background:'transparent',
          color:'var(--regime-down-mid)', border:'.5px solid var(--border-default)',
          borderRadius:12, font:'600 14px var(--font-body)', cursor:'pointer'}}>Log out</button>
      </div>
    </Screen>
  );
}

/* Narrative header that opens each topic layer */
function DetailIntro({ kicker, title, body }) {
  return (
    <div style={{padding:'16px 20px 2px'}}>
      <div style={{font:'700 9px var(--font-mono)', color:'var(--color-violet-300)', letterSpacing:'.14em', textTransform:'uppercase'}}>{kicker}</div>
      <div style={{font:'600 18px var(--font-brand)', color:'var(--text-primary)', letterSpacing:'-0.015em', marginTop:7, lineHeight:1.25}}>{title}</div>
      <div style={{font:'400 12.5px var(--font-body)', color:'var(--text-secondary)', marginTop:6, lineHeight:1.5}}>{body}</div>
    </div>
  );
}

/* Topic gateway card on an Overview tab — summarises a layer, drills into its tab */
function TopicCard({ kicker, title, sub, tone='violet', metrics, miniViz, onGo }) {
  const tones = {
    up:'var(--regime-up-mid)', down:'var(--regime-down-mid)', warn:'var(--regime-trans-mid)',
    info:'var(--regime-range-mid)', violet:'var(--color-violet-300)'
  };
  const ink = tones[tone] || tones.violet;
  return (
    <button onClick={onGo} className="arx-press" style={{
      display:'block', width:'calc(100% - 32px)', margin:'0 16px 10px', textAlign:'left',
      padding:14, borderRadius:14, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', cursor:'pointer'}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8}}>
        <span style={{font:'700 9px var(--font-mono)', color:ink, letterSpacing:'.10em', textTransform:'uppercase'}}>{kicker}</span>
        <span style={{display:'flex', alignItems:'center', gap:4, font:'600 11px var(--font-body)', color:'var(--color-violet-300)'}}>Open<IconChevron color="var(--color-violet-300)" size={12}/></span>
      </div>
      <div style={{display:'flex', gap:12, alignItems:'flex-start', marginTop:8}}>
        <div style={{flex:1, minWidth:0}}>
          <div style={{font:'600 15px var(--font-brand)', color:'var(--text-primary)', letterSpacing:'-0.01em', lineHeight:1.3}}>{title}</div>
          {sub && <div style={{font:'400 12px var(--font-body)', color:'var(--text-secondary)', marginTop:4, lineHeight:1.4}}>{sub}</div>}
        </div>
        {miniViz}
      </div>
      {metrics && <div style={{marginTop:10, paddingTop:10, borderTop:'.5px solid var(--border-default)', display:'flex', gap:14, flexWrap:'wrap', font:'500 11px var(--font-mono)'}}>
        {metrics.map((mt,i)=>(<span key={i}><span style={{color:'var(--text-tertiary)'}}>{mt[0]}</span> <span style={{color:mt[2]||'var(--text-primary)'}}>{mt[1]}</span></span>))}
      </div>}
    </button>
  );
}

/* ════════ INSTRUMENT DETAIL · S2 choosing an instrument ════════
   Layered: hero → Overview (combined read + drill + who's trading) → Positioning / Flow / Walls / Stress → Trade.
   Consolidates SIG-I01 bias · I02 flow · I03 walls · I04 stress with live trades and the trade ticket. */
function InstrumentDetail({ m: mIn, onBack, onToast, onTrade }) {
  const m = Object.assign({ price:0, deltaPct:0, oi:'—', vol:'—', sym:'—', name:'' }, mIn||{});
  const pos = m.deltaPct >= 0;
  const acctPro = (()=>{ try { return localStorage.getItem('arx-experience')==='pro'; } catch(e){ return false; } })();
  const sig = window.arxSignalsFor ? window.arxSignalsFor(m) : null;
  const bull = (sig && sig._meta) ? sig._meta.bull : pos;
  const hero = (
    <div style={{padding:'2px 20px 16px'}}>
      <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:12}}>
        <AssetGlyph sym={m.sym} size={44}/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{font:'700 24px var(--font-brand)', letterSpacing:'-0.02em', lineHeight:1.05}}>{m.sym}-PERP</div>
          <div style={{font:'500 12px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>{m.name} · cross margin</div>
        </div>
        <RegimePill regime={pos?'up':'down'} size="sm"/>
      </div>
      <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:12, marginBottom:12}}>
        <div>
          <div className="num" style={{font:'700 30px var(--font-mono)', letterSpacing:'-0.03em', lineHeight:1}}>${m.price.toLocaleString()}</div>
          <div className="num" style={{marginTop:5, font:'600 13px var(--font-mono)', color: pos?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{pos?'+':'−'}{Math.abs(m.deltaPct).toFixed(2)}% <span style={{color:'var(--text-tertiary)', fontWeight:500}}>24h</span></div>
        </div>
        <SigSpark points={m.spark || [10,11,12,11,13,14,13,15,16,17]} color={pos?'var(--regime-up-mid)':'var(--regime-down-mid)'} w={92} h={36}/>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:1, background:'var(--border-default)', borderRadius:12, overflow:'hidden', border:'.5px solid var(--border-default)'}}>
        {[['Open int', m.oi||'$24.1B'],['24h vol','$8.2B'],['Funding','+0.012%','var(--regime-up-mid)'],['Premium','+0.04%','var(--regime-up-mid)']].map(([k,v,c])=>(
          <div key={k} style={{padding:'9px 10px', background:'var(--surface-elevated)'}}>
            <div style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.05em', textTransform:'uppercase'}}>{k}</div>
            <div className="num" style={{font:'600 13px var(--font-mono)', color:c||'var(--text-primary)', marginTop:3}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{marginTop:12}}><HistPerfRow data={[['1h', m.deltaPct*0.1],['12h', m.deltaPct*0.45],['24h', m.deltaPct],['7d', m.deltaPct*2.1],['30d', m.deltaPct*3.4]]}/></div>
      {window.InstrumentLiqChart && <div style={{marginTop:4}}><InstrumentLiqChart m={m} pos={pos} liqOn={true}/></div>}
    </div>
  );
  const footer = (
    <button onClick={onTrade} className="arx-press" style={{
      width:'100%', height:50, borderRadius:14, border:'none', cursor:'pointer',
      background:'var(--color-violet-500)', color:'#fff', font:'700 15px var(--font-body)', boxShadow:'var(--shadow-execute)'}}>Trade {m.sym}-PERP</button>
  );
  return (
    <SignalsShell
      title={m.sym + '-PERP'} subtitle="Instrument signals · positioning & risk"
      tabs={ window.idv2Tabs ? window.idv2Tabs(true) : [{id:'overview',label:'Overview'},{id:'positioning',label:'Positioning'},{id:'flow',label:'Flow'},{id:'walls',label:'Walls'},{id:'stress',label:'Stress'},{id:'traders',label:'Traders'}] }
      defaultTab={ window.idv2Tabs ? 'overview' : 'positioning' }
      onBack={onBack} top={hero} footer={footer}
      renderTab={(tab, go) => window.IdV2Tab ? window.IdV2Tab(tab, { m, sf:(sig&&sig.flow&&sig.flow.current)||{}, bull, acctPro, isPerp:true, sig, go }) : (
        <React.Fragment>
          {tab==='overview' && (
            <div>
              <TradingViewChart sym={m.sym} positive={pos}/>
              <div style={{padding:'4px 16px 10px'}}>
                <div style={{padding:16, borderRadius:14, background:'linear-gradient(135deg, rgba(124,91,255,.16), rgba(124,91,255,.03))', border:'.5px solid rgba(124,91,255,.30)'}}>
                  <div style={{font:'600 9px var(--font-body)', color:'var(--color-violet-300)', letterSpacing:'.10em', textTransform:'uppercase'}}>Combined read · 4h</div>
                  <div style={{font:'600 15px var(--font-brand)', color:'var(--text-primary)', marginTop:7, lineHeight:1.4}}>Bullish flow is rising and Smart Money is driving it — but long-side liquidation stress is elevated with a forced-exit wall close below.</div>
                  <div style={{marginTop:10, display:'flex', gap:6, flexWrap:'wrap'}}>
                    <Badge tone="up">Flow rising</Badge><Badge tone="violet">Bias bullish</Badge><Badge tone="down" small>Long stress</Badge><Badge tone="info" small>Exit wall below</Badge>
                  </div>
                </div>
              </div>
              <LucidTip kicker={'Lucid tips · '+m.sym} groups={[
                {label:'What the flow says', tone:'up', items:['Bullish flow 3.4× above normal — whale-led, $42.6M vs a typical $12.5M','Smart Money turned net buyer in the last 4h']},
                {label:'Worth watching', tone:'warn', items:['$96M of longs vulnerable — forced-exit wall 5.1% below, 74% underwater']},
              ]} foot={'Ask Lucid about '+m.sym} seed={{
                contextLabel:'On '+m.sym+'-PERP · positioning',
                intro:{ action:`Here's what the ${m.sym} order flow is really saying.`, body:`Bullish flow is rising 3.4× above normal and Smart Money is adding — but long-side liquidation stress is elevated with a forced-exit wall ~5% below. I can break down the flow, the bias, or the liquidation risk.` },
                chips:[
                  { label:'Who is driving the flow?', reply:{ conf:'high', action:'Whales lead it — $42.6M of flow vs a normal $12.5M.', body:'334 wallets are net adding on the long side, and Smart Money turned net buyer in the last 4h. That reads as genuine positioning, not one print.', data:[['Flow multiple','3.4×','up'],['Long wallets','334',''],['Smart-money bias','Net long','up']] }},
                  { label:'How bad is the liquidation risk?', reply:{ conf:'medium', action:'Long-side stress is elevated — a forced-exit wall sits ~5.1% below.', body:'$96M of long positions are vulnerable and 74% sit underwater near the wall. A sweep through it could cascade. This is structure, not a prediction.', data:[['Vulnerable','$96M','warn'],['Underwater','74%','warn'],['Exit wall','−5.1%','warn']], note:'Analysis, not a recommendation to trade.' }},
                  { label:'Explain liquidation walls', reply:{ conf:'learn', action:'A liquidation wall — where clustered leverage gets force-closed.', body:'When price reaches the level where many leveraged positions liquidate, those forced market orders push price further the same way — a cascade. A wall below is downside fuel; above is upside fuel.' }},
                ],
              }}/>
              <div style={{padding:'0 0 4px'}}><SentimentGauge value={42}/></div>
              <SectionHeader>By topic</SectionHeader>
              <TopicCard kicker="SIG-I02 · Flow momentum" tone="up" title="Bullish flow rising — 3.4× above normal" sub="Whale-led · $42.6M vs normal $12.5M"
                metrics={[['Multiple','3.4×','var(--regime-up-mid)'],['Wallets','334']]} miniViz={<SigSpark points={[10,12,14,18,22,28,36,48]} color="var(--regime-up-mid)" w={64} h={32}/>} onGo={()=>go('flow')}/>
              <TopicCard kicker="SIG-I01 · Position bias" tone="up" title="Indecisive, leaning Bullish" sub="Smart Money added; not out of the neutral band yet"
                metrics={[['4h delta','+8 pts','var(--regime-up-mid)']]} miniViz={<MiniBiasViz activeIdx={3}/>} onGo={()=>go('positioning')}/>
              <TopicCard kicker="SIG-I04 · Liquidation stress" tone="down" title="Long-side stress elevated" sub="$96M vulnerable · 74% underwater · exit wall −5.1%"
                metrics={[['Vulnerable','$96M','var(--regime-down-mid)'],['Wallets','1.7K']]} miniViz={<MiniStressViz cells={['w','e','w','c','n','w','e','c','b','w','b','e']}/>} onGo={()=>go('stress')}/>
              <TopicCard kicker="SIG-I03 · Entry & risk walls" tone="info" title="Forced-exit wall 5.1% below" sub="Smart Money entry wall at $65.9K · profit-taking area above"
                metrics={[['Exit','$63.9K','var(--regime-down-mid)'],['Entry','$65.9K','var(--regime-up-mid)']]} miniViz={<MiniWallsViz/>} onGo={()=>go('walls')}/>

              <SectionHeader>Who's trading it now</SectionHeader>
              {D.clusterTrades.map((tr,i)=>(
                <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'11px 20px'}}>
                  <WalletAvatar w={{addr:tr.who}} size={34}/>
                  <div style={{flex:1}}>
                    <div style={{display:'flex', gap:6, alignItems:'center'}}>
                      <span className="num" style={{font:'600 13px var(--font-mono)'}}>{tr.who}</span>
                      <span style={{font:'600 9px var(--font-body)', color:'var(--color-violet-700)', background:'rgba(124,91,255,.14)', padding:'1px 6px', borderRadius:999}}>{tr.tag}</span>
                    </div>
                    <div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>entry {tr.entry} · {tr.time} ago</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{font:'700 12px var(--font-body)', color:tr.side==='LONG'?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{tr.side}</div>
                    <div className="num" style={{font:'500 12px var(--font-mono)', color:'var(--text-secondary)', marginTop:1}}>{tr.size}</div>
                  </div>
                </div>
              ))}
              <RwaFundamentals sym={m.sym}/>
              <RelatedAssets sym={m.sym} onOpen={(rm)=>window.__arxOpenSub && window.__arxOpenSub('instrumentDetail',{m:rm})}/>
              <DisclaimerFooter text="Signals describe qualified observations, not trade recommendations. Trading involves risk of loss."/>
            </div>
          )}
          {tab==='positioning' && (<div><DetailIntro kicker="SIG-I01 · Position bias" title="Where the crowd sits" body="How proven and crowd wallets are positioned, which way bias is shifting, and what's driving it."/><InstrumentBiasTab/></div>)}
          {tab==='flow' && (<div><DetailIntro kicker="SIG-I02 · Flow momentum" title="Money in motion" body="Net directional flow versus normal, by window and by cohort — what high-quality wallets are doing right now."/><InstrumentFlowTab/></div>)}
          {tab==='walls' && (<div><DetailIntro kicker="SIG-I03 · Entry & risk walls" title="Price levels that matter" body="Where capital clusters as entry support, forced-exit risk, and possible profit-taking — around current price."/><InstrumentWallsTab/></div>)}
          {tab==='stress'   && (<div><DetailIntro kicker="SIG-I04 · Liquidation & PnL stress" title="Where it could break" body="Crowding, PnL pain, and distance to liquidation — separated by cohort and side."/><InstrumentStressTab/></div>)}
          {tab==='traders' && window.InstrumentTradersTab2 && <InstrumentTradersTab2 sig={deriveSig(m.sym)} m={m} isPerp={true}/>}
        </React.Fragment>
      )}/>
  );
}

Object.assign(window, { HomeScreen, WalletsScreen, TradeScreen, MarketsScreen, YouScreen, InstrumentDetail, DetailIntro, TopicCard, MarketRow,
  WALLETS, TAX, STANDING, deriveSig, standingOf, tradesOf, exposureOf, CopySetupSheet, Avatar });
