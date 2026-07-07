// app/market-heatmap.jsx — Arx DS MarketHeatmap (canonical "D · Deeper" scale), ported into the app.
// Source: design-system components/market-heatmap. Birds-eye market: every instrument a weighted
// tile, sized by importance, tinted by 24h move on the CVD-safe heat scale (magnitude on lightness),
// sign + delta% the redundant cue, ink auto-flips. Exposes window.ArxHeat + MarketHeatmap + HeatLegend.

/* ── canonical Arx DS heat scale · "D · Deeper" (v6.6) ── up green / down red, pale→deep by
   |move| on a cool-neutral centre. Magnitude rides LIGHTNESS (the CVD-safe channel) so the
   intensity reads even for deuteranopes; sign + delta% is the redundant cue. Ink auto-flips
   dark-on-pale / white-on-deep so labels always read. Tint is an oklch lerp. ASCII: this is the
   reference look — muted sage→emerald / dusty-rose→brick, NOT a saturated candy fill. ── */
function heatColor(deltaPct, maxAbs = 8) {
  const t = Math.max(-1, Math.min(1, (deltaPct || 0) / (maxAbs || 8)));
  const mag = Math.abs(t), f = Math.pow(mag, 0.82), up = t >= 0;
  const lerp = (a, b) => a + (b - a) * f;
  const L = lerp(0.800, up ? 0.505 : 0.495);
  const C = lerp(0.015, up ? 0.160 : 0.193);
  const H = mag < 0.02 ? 210 : (up ? 158 : 19);
  const deep = L <= 0.62;
  const bg = `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H})`;
  return { bg, fill: bg, ink: deep ? '#FFFFFF' : '#0A0D12', deep, up, mag };
}
function heatStops(n = 21, maxAbs = 8) {
  return Array.from({ length: n }, (_, i) => heatColor((-1 + (2 * i) / (n - 1)) * maxAbs, maxAbs).bg);
}
/* adaptive ceiling — stretch the scale to the data's actual range (90th pct of |move|,
   clamped 3–25%) so calm markets aren't all-gray and volatile ones aren't all-saturated.
   Canonical DS behaviour — this is what gives the tiles their true colour. */
function heatAutoMaxAbs(values, p = 0.9, lo = 3, hi = 25) {
  const a = (values || []).map((v) => Math.abs(v || 0)).filter((v) => v > 0).sort((x, y) => x - y);
  if (!a.length) return lo;
  const q = a[Math.min(a.length - 1, Math.floor(p * (a.length - 1)))];
  return Math.max(lo, Math.min(hi, Math.ceil(q)));
}
if (typeof window !== 'undefined') window.ArxHeat = window.ArxHeat || { heatColor, heatStops, autoMaxAbs: heatAutoMaxAbs };

/* ── squarified treemap (Bruls et al.) on a normalized box ── */
function heatSquarify(data, W, H) {
  const out = [], total = data.reduce((s, d) => s + d.weight, 0) || 1;
  const items = data.map((d) => ({ d, _a: (d.weight / total) * W * H }));
  let rect = { x: 0, y: 0, w: W, h: H }, row = [], rem = items.slice();
  const worst = (r, side) => { const s = r.reduce((a, x) => a + x._a, 0), mx = Math.max.apply(null, r.map((x) => x._a)), mn = Math.min.apply(null, r.map((x) => x._a)), s2 = s * s; return Math.max((side * side * mx) / s2, s2 / (side * side * mn)); };
  const lay = (r, rc, vert) => { const s = r.reduce((a, x) => a + x._a, 0); if (vert) { const rw = s / rc.h; let yy = rc.y; r.forEach((x) => { const rh = x._a / rw; out.push(Object.assign({}, x.d, { x: rc.x, y: yy, w: rw, h: rh })); yy += rh; }); return { x: rc.x + rw, y: rc.y, w: rc.w - rw, h: rc.h }; } const rh = s / rc.w; let xx = rc.x; r.forEach((x) => { const rw = x._a / rh; out.push(Object.assign({}, x.d, { x: xx, y: rc.y, w: rw, h: rh })); xx += rw; }); return { x: rc.x, y: rc.y + rh, w: rc.w, h: rc.h - rh }; };
  while (rem.length) { const vert = rect.w >= rect.h, side = vert ? rect.h : rect.w, nx = rem[0]; if (!row.length) { row.push(nx); rem.shift(); continue; } if (worst(row.concat([nx]), side) <= worst(row, side)) { row.push(nx); rem.shift(); } else { rect = lay(row, rect, vert); row = []; } }
  if (row.length) lay(row, rect, rect.w >= rect.h);
  return out;
}

/* ── MarketHeatmap — weighted treemap, canonical heat tint, adaptive ink ── */
function MarketHeatmap({ items = [], maxTiles = 12, maxAbs = 'auto', height = 260, width = 360, onTap, style = {} }) {
  let shown = items.slice().sort((a, b) => b.weight - a.weight);
  if (shown.length > maxTiles) {
    const head = shown.slice(0, maxTiles - 1), tail = shown.slice(maxTiles - 1);
    shown = head.concat([{ symbol: 'Other', weight: tail.reduce((s, x) => s + x.weight, 0), deltaPct: tail.reduce((s, x) => s + x.deltaPct, 0) / (tail.length || 1) }]);
  }
  const ma = maxAbs === 'auto' ? heatAutoMaxAbs(items.map((x) => x.deltaPct)) : maxAbs;
  const fmt = (d, up) => (up ? '+' : '\u2212') + Math.abs(d).toFixed(1) + '%';
  const tiles = heatSquarify(shown, width, height);
  return (
    <div style={Object.assign({}, style)} role="group" aria-label={`Market heatmap, ${shown.length} markets sized by importance, coloured by 24-hour change. Green up, red down.`}>
      {/* canonical D·Deeper substrate — seamless tiles (no seams, no gaps), no panel border;
          magnitude rides lightness, ink auto-flips dark-on-pale / white-on-deep. */}
      <div style={{ position: 'relative', width: '100%', height, borderRadius: 18, overflow: 'hidden', background: 'var(--surface-base)' }}>
        {tiles.map((it) => {
          const up = it.deltaPct >= 0, c = heatColor(it.deltaPct, ma);
          const small = Math.min(it.w, it.h);
          const showVal = it.w > 44 && it.h > 34;
          const symLen = String(it.symbol).length;
          // width-aware font: long tickers (NATGAS/URANIUM/COPPER) shrink to fit their tile instead of overflowing
          const padX = small > 70 ? 24 : 18;
          const fitW = (it.w - padX) / (symLen * 0.62);
          const fs = Math.max(9, Math.min(19, Math.round(Math.min(it.w / 4.6, it.h / 4.9, fitW))));
          return (
            <div key={it.symbol} style={{ position: 'absolute', left: `${(it.x / width) * 100}%`, top: `${(it.y / height) * 100}%`, width: `${(it.w / width) * 100}%`, height: `${(it.h / height) * 100}%` }}>
              <button onClick={onTap ? () => onTap(it.symbol) : undefined}
                aria-label={`${it.symbol}, ${up ? 'up' : 'down'} ${Math.abs(it.deltaPct).toFixed(1)} percent`}
                className={onTap ? 'arx-card-press' : ''}
                style={{ position: 'absolute', inset: 0, background: c.bg, border: 'none', borderRadius: 0,
                  color: c.ink, cursor: onTap ? 'pointer' : 'default', boxSizing: 'border-box',
                  padding: small > 70 ? '10px 12px' : '7px 9px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 2, overflow: 'hidden',
                  transition: 'background 300ms ease' }}>
                <span style={{ font: `700 ${fs}px/1.04 var(--font-brand)`, letterSpacing: '-.01em', color: c.ink, textShadow: c.deep ? '0 1px 2px rgba(0,0,0,.28)' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', opacity: it.symbol === 'Other' ? 0.7 : 1 }}>{it.symbol}</span>
                {showVal && <span className="num" style={{ font: `600 ${Math.max(10, Math.round(fs * 0.74))}px var(--font-mono)`, color: c.ink, opacity: 0.9, textShadow: c.deep ? '0 1px 2px rgba(0,0,0,.28)' : 'none', whiteSpace: 'nowrap' }}>{fmt(it.deltaPct, up)}</span>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── HeatLegend — the scale key (DS spec: pale→deep, sign-anchored ends).
   Prominent diverging pill, bold sign-anchored ends, optional breadth marker
   (a delta value, e.g. the mean move of the shown tiles) shown as a white thumb. ── */
function HeatLegend({ maxAbs = 8, label, marker }) {
  const grad = `linear-gradient(90deg, ${heatStops(15, maxAbs).join(',')})`;
  const hasMark = typeof marker === 'number' && isFinite(marker);
  const frac = hasMark ? Math.max(0, Math.min(1, (marker / (maxAbs || 8) + 1) / 2)) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 2px' }}>
      <span className="num" style={{ font: '600 10.5px var(--font-mono)', color: 'var(--regime-down-mid)', flexShrink: 0 }}>{'\u2212'}{maxAbs}%</span>
      <span style={{ position: 'relative', flex: 1, height: 8, borderRadius: 999, background: grad, boxShadow: 'inset 0 0 0 .5px var(--border-default)' }}>
        {hasMark && (
          <span aria-hidden="true" style={{ position: 'absolute', top: '50%', left: `${(frac * 100).toFixed(1)}%`, transform: 'translate(-50%,-50%)',
            width: 4, height: 15, borderRadius: 2, background: 'var(--color-violet-500)', boxShadow: '0 0 0 2px var(--surface-base)' }} />
        )}
      </span>
      <span className="num" style={{ font: '600 10.5px var(--font-mono)', color: 'var(--regime-up-mid)', flexShrink: 0 }}>+{maxAbs}%</span>
      {label && <span style={{ flexShrink: 0, font: '500 10px var(--font-body)', color: 'var(--text-tertiary)', paddingLeft: 2 }}>{label}</span>}
    </div>
  );
}

Object.assign(window, { MarketHeatmap, HeatLegend, ArxHeat: window.ArxHeat });
