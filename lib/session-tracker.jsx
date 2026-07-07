// arx/session-tracker.jsx — lightweight session recorder for in-prototype
// user interviews. Behind a Tweak toggle (default off). When ON:
//
//   1. Captures every click event via delegation on document.body. For each
//      click we resolve the nearest button/link, store its text + DOM path.
//   2. Tracks screen-visit changes (via a window.dispatchEvent we'll wire
//      from app.jsx whenever the nav stack changes).
//   3. Exposes a floating "💬 Note" button so the tester can drop a comment
//      tied to the current screen.
//   4. Exposes a triple-tap on the arx wordmark to open a Session debug
//      sheet — view recent events, name the session, copy as JSON, clear.
//
// Events live in localStorage under "arx_session_log" (a JSON array). Capped
// at 1000 events to keep things tidy. The main agent reads this directly
// via eval_js_user_view to produce the feedback doc post-session.

const SESSION_KEY = 'arx_session_log';
const SESSION_META_KEY = 'arx_session_meta';
const MAX_EVENTS = 1000;

// ───────────────────────────────────────────────────────────────
// Storage helpers
// ───────────────────────────────────────────────────────────────
function readLog() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || '[]'); }
  catch (e) { return []; }
}
function writeLog(arr) {
  try {
    // Trim from the front to MAX_EVENTS
    const out = arr.length > MAX_EVENTS ? arr.slice(arr.length - MAX_EVENTS) : arr;
    localStorage.setItem(SESSION_KEY, JSON.stringify(out));
  } catch (e) {}
}
function readMeta() {
  try { return JSON.parse(localStorage.getItem(SESSION_META_KEY) || '{}'); }
  catch (e) { return {}; }
}
function writeMeta(m) {
  try { localStorage.setItem(SESSION_META_KEY, JSON.stringify(m)); } catch (e) {}
}

// Public global API — used by other prototype code AND by us in chat.
window.arx = window.arx || {};
window.arx.track = function track(eventType, props) {
  if (!isRecording()) return;
  const log = readLog();
  log.push({
    t: Date.now(),
    type: eventType,
    screen: currentScreen(),
    session: readMeta().name || 'unnamed',
    ...props,
  });
  writeLog(log);
};
window.arx.note = function note(text) {
  if (!isRecording()) return;
  window.arx.track('note', { text });
};
window.arx.session = {
  start(name) {
    writeMeta({ name: name || `session-${new Date().toISOString().slice(0,19)}`, startedAt: Date.now() });
    window.dispatchEvent(new CustomEvent('arx:session-change'));
  },
  stop() {
    writeMeta({});
    window.dispatchEvent(new CustomEvent('arx:session-change'));
  },
  clear() {
    writeLog([]);
    window.dispatchEvent(new CustomEvent('arx:session-change'));
  },
  log: readLog,
  meta: readMeta,
  export() {
    return { meta: readMeta(), events: readLog() };
  },
};

function isRecording() { return !!readMeta().name; }
function currentScreen() {
  // Look up the most recent "screen" event. Fallback: read the data-screen-label
  // attribute on the active app shell child.
  const log = readLog();
  for (let i = log.length - 1; i >= 0; i--) {
    if (log[i].type === 'screen') return log[i].id;
  }
  return null;
}

// ───────────────────────────────────────────────────────────────
// Global click delegate
// One listener on document captures all clicks. We resolve the nearest
// <button>/<a> and capture its visible text + its component tag where we
// can. Lightweight — no React tree introspection.
// ───────────────────────────────────────────────────────────────
function setupClickDelegate() {
  if (window.__arxClickDelegated) return;
  window.__arxClickDelegated = true;
  document.addEventListener('click', (e) => {
    if (!isRecording()) return;
    const el = e.target.closest('button, a, [role="button"]');
    if (!el) return;
    const text  = (el.innerText || el.textContent || '').trim().slice(0, 80);
    const label = el.getAttribute('aria-label') || null;
    const href  = el.getAttribute('href') || null;
    window.arx.track('click', {
      text, label, href,
      path: domPath(el),
    });
  }, true);
}
function domPath(el) {
  const parts = [];
  let cur = el;
  for (let i = 0; cur && i < 6; i++) {
    const tag = cur.tagName?.toLowerCase();
    if (!tag) break;
    const cls = (cur.className && typeof cur.className === 'string')
      ? '.' + cur.className.split(/\s+/).filter(Boolean).slice(0, 2).join('.')
      : '';
    parts.unshift(tag + cls);
    cur = cur.parentElement;
  }
  return parts.join(' > ');
}
setupClickDelegate();

// ───────────────────────────────────────────────────────────────
// React UI — recording indicator + note button + session sheet
// ───────────────────────────────────────────────────────────────
const { useState: useSessState, useEffect: useSessEff, useRef: useSessRef } = React;

function useIsRecording() {
  const [rec, setRec] = useSessState(() => isRecording());
  useSessEff(() => {
    const h = () => setRec(isRecording());
    window.addEventListener('arx:session-change', h);
    return () => window.removeEventListener('arx:session-change', h);
  }, []);
  return rec;
}

// Floating "● REC" pill + "Note" button — only visible while recording.
function SessionOverlay() {
  const recording = useIsRecording();
  const [sheetOpen, setSheetOpen] = useSessState(false);
  const [noteOpen, setNoteOpen] = useSessState(false);
  if (!recording) return null;
  return (
    <>
      {/* Recording pill — top-right under the iOS status bar */}
      <div style={{
        position: 'absolute', top: 64, right: 12, zIndex: 50,
        display: 'flex', gap: 6, alignItems: 'center',
      }}>
        <button onClick={() => setSheetOpen(true)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 10px', borderRadius: 999,
          background: 'rgba(255,77,106,0.95)', color: '#fff',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: 99, background: '#fff',
            animation: 'arx-live-pulse 1.6s ease-out infinite',
          }}/>
          REC
        </button>
        <button onClick={() => setNoteOpen(true)} style={{
          padding: '6px 10px', borderRadius: 999,
          background: 'rgba(0,0,0,0.65)', color: '#fff',
          fontSize: 11, fontWeight: 600,
        }}>💬 Note</button>
      </div>

      {noteOpen   && <NoteModal onClose={() => setNoteOpen(false)}/>}
      {sheetOpen  && <SessionSheet onClose={() => setSheetOpen(false)}/>}
    </>
  );
}

function NoteModal({ onClose }) {
  const [text, setText] = useSessState('');
  const ref = useSessRef(null);
  useSessEff(() => { ref.current?.focus(); }, []);
  const submit = () => {
    if (text.trim()) window.arx.note(text.trim());
    onClose();
  };
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--surface)', color: 'var(--ink)',
        width: '100%', maxWidth: 340, borderRadius: 18,
        padding: 18, display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <span className="label">Drop a note · {currentScreen() || 'no screen'}</span>
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's the tester saying / thinking right now?"
          rows={4}
          style={{
            width: '100%', resize: 'none',
            background: 'var(--card-2)', color: 'var(--ink)',
            border: '1px solid var(--line)', borderRadius: 12,
            padding: 12, fontSize: 14, fontFamily: 'var(--f-ui)',
            outline: 'none',
          }}/>
        <div className="row gap-2">
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ flex: 1, minHeight: 38 }}>Cancel</button>
          <button onClick={submit} className="btn btn-primary btn-sm" style={{ flex: 1, minHeight: 38 }} disabled={!text.trim()}>Save note</button>
        </div>
      </div>
    </div>
  );
}

function SessionSheet({ onClose }) {
  const [tick, setTick] = useSessState(0);
  useSessEff(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const meta = readMeta();
  const log = readLog();
  const elapsed = meta.startedAt ? Math.floor((Date.now() - meta.startedAt) / 1000) : 0;
  const counts = log.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc; }, {});
  const lastN = log.slice(-10).reverse();

  const copyJSON = () => {
    const blob = JSON.stringify({ meta, events: log }, null, 2);
    if (navigator.clipboard) navigator.clipboard.writeText(blob);
  };

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--surface)', color: 'var(--ink)',
        width: '100%', maxHeight: '85%',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '8px 20px 24px',
        display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden',
      }}>
        <div className="row center" style={{ paddingTop: 6, paddingBottom: 4 }}>
          <i style={{ width: 40, height: 4, borderRadius: 99, background: 'var(--line-strong)' }}/>
        </div>

        <div className="row between" style={{ alignItems: 'baseline' }}>
          <div className="col gap-1" style={{ minWidth: 0 }}>
            <h2 className="h-2" style={{ margin: 0 }}>Session</h2>
            <span className="t-xs dim" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{meta.name}</span>
          </div>
          <button onClick={onClose} className="btn-sm" style={{ color: 'var(--ink-mid)', padding: 8 }}>Close</button>
        </div>

        <div className="row gap-2">
          <Stat label="Time"   value={fmtElapsed(elapsed)}/>
          <Stat label="Events" value={log.length}/>
          <Stat label="Clicks" value={counts.click || 0}/>
          <Stat label="Notes"  value={counts.note || 0}/>
        </div>

        <div className="col gap-1" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <span className="label">Last 10 events</span>
          <div className="col gap-1">
            {lastN.length === 0 && <span className="t-sm dim" style={{ padding: '10px 0' }}>No events yet. Click around.</span>}
            {lastN.map((e, i) => <EventRow key={log.length - i} ev={e}/>)}
          </div>
        </div>

        <div className="row gap-2">
          <button onClick={copyJSON} className="btn btn-ghost btn-sm" style={{ flex: 1, minHeight: 38, fontSize: 12 }}>Copy JSON</button>
          <button onClick={() => { window.arx.session.clear(); }} className="btn btn-ghost btn-sm" style={{ flex: 1, minHeight: 38, fontSize: 12, borderColor: 'var(--down)', color: 'var(--down)' }}>Clear</button>
          <button onClick={() => { window.arx.session.stop(); onClose(); }} className="btn btn-primary btn-sm" style={{ flex: 1, minHeight: 38, fontSize: 12 }}>Stop recording</button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card-2" style={{ flex: 1, padding: '10px 8px', textAlign: 'center' }}>
      <div className="num" style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
      <div className="t-xs dim">{label}</div>
    </div>
  );
}

function EventRow({ ev }) {
  const t = new Date(ev.t).toLocaleTimeString([], { hour12: false });
  const icon = ev.type === 'click' ? '👆' : ev.type === 'note' ? '💬' : ev.type === 'screen' ? '📱' : '·';
  return (
    <div className="row gap-2" style={{ padding: '6px 8px', borderBottom: '1px solid var(--line)' }}>
      <span style={{ fontSize: 12 }}>{icon}</span>
      <span className="t-xs dim" style={{ fontFamily: 'var(--f-mono)', minWidth: 70 }}>{t}</span>
      <span className="t-sm" style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {ev.type === 'note' ? <em>"{ev.text}"</em> :
         ev.type === 'click' ? (ev.text || ev.label || '(unlabeled)') :
         ev.type === 'screen' ? `→ ${ev.id}` :
         ev.type}
      </span>
      {ev.screen && <span className="t-xs dim" style={{ fontFamily: 'var(--f-mono)' }}>{ev.screen}</span>}
    </div>
  );
}

function fmtElapsed(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

Object.assign(window, { SessionOverlay });
