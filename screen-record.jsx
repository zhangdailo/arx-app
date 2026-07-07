/* ═══ ARX · Screen record — record ONLY the app frame, not the whole screen ═══
   A floating ⏺ button (fixed, outside the phone frame so it never appears in the
   capture). Press to start → the browser asks Valen to share "This Tab" → we crop
   the tab stream down to just the #arx-frame rect via a canvas, and record that to
   a .webm with MediaRecorder. Press again to stop → the video downloads.
   Pure browser APIs — works in any Chromium browser, no install. */

const { useState: srS, useRef: srR, useEffect: srE } = React;

function ScreenRecordButton({ frameSel = '#arx-frame' }) {
  const [state, setState] = srS('idle');   // idle · recording · saving · done
  const [secs, setSecs] = srS(0);
  const [err, setErr] = srS('');            // informative failure text (never a dead click)
  const ref = srR({});                       // holds streams/recorder/raf across renders
  // Hide on mobile — tab screen-recording (getDisplayMedia) is desktop-only anyway.
  const [hide, setHide] = srS(()=>{ try { return !window.matchMedia || window.matchMedia('(max-width: 700px)').matches || !(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia); } catch(e){ return false; } });
  srE(()=>{ if(!window.matchMedia) return; const mq = window.matchMedia('(max-width: 700px)');
    const h = ()=>setHide(mq.matches || !(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia));
    mq.addEventListener ? mq.addEventListener('change',h) : mq.addListener(h);
    return ()=> mq.removeEventListener ? mq.removeEventListener('change',h) : mq.removeListener(h); }, []);

  srE(()=>()=>stopAll(true), []);            // cleanup on unmount
  function stopAll(silent){
    const R = ref.current;
    if (R.raf) cancelAnimationFrame(R.raf);
    if (R.timer) clearInterval(R.timer);
    try { R.rec && R.rec.state !== 'inactive' && R.rec.stop(); } catch(e){}
    try { R.disp && R.disp.getTracks().forEach(t=>t.stop()); } catch(e){}
    try { R.canvasStream && R.canvasStream.getTracks().forEach(t=>t.stop()); } catch(e){}
    ref.current = {};
  }

  async function start(){
    setErr('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia){
      setErr('Recording needs desktop Chrome or Edge'); setTimeout(()=>setErr(''), 4200); return;
    }
    let disp;
    // Reliable signal: screen capture is blocked inside a framed/sandboxed preview.
    // If we're the top-level tab, don't pre-block — just show the browser picker.
    const framed = (()=>{ try { return window.self !== window.top; } catch(e){ return true; } })();
    const policyOK = (()=>{ try { return !document.featurePolicy || document.featurePolicy.allowsFeature('display-capture'); } catch(e){ return true; } })();
    if (framed || !policyOK){
      setErr('Open the app in its own browser tab to record'); setTimeout(()=>setErr(''), 6000); return;
    }
    if (!window.isSecureContext){
      setErr('Recording needs an https:// tab'); setTimeout(()=>setErr(''), 6000); return;
    }
    try {
      disp = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 }, audio: false, preferCurrentTab: true,
      });
    } catch(e){
      if (e && e.name === 'NotAllowedError'){
        /* user dismissed the share picker — stay silent */
      } else {
        setErr((e && e.name ? e.name : 'Recording') + ' — try desktop Chrome'); setTimeout(()=>setErr(''), 5000);
      }
      return;
    }
    const video = document.createElement('video');
    video.srcObject = disp; video.muted = true; await video.play().catch(()=>{});

    // map the on-screen frame rect → captured-surface pixels
    const frameEl = document.querySelector(frameSel);
    const R = ref.current; R.disp = disp;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const dpr = () => (video.videoWidth || window.innerWidth) / window.innerWidth;

    // size canvas to the frame (portrait phone) at capture resolution
    const rect0 = frameEl ? frameEl.getBoundingClientRect() : { width:402, height:874 };
    const scale = dpr();
    canvas.width  = Math.round(rect0.width  * scale);
    canvas.height = Math.round(rect0.height * scale);

    const draw = () => {
      const rect = frameEl ? frameEl.getBoundingClientRect() : rect0;
      const s = dpr();
      const sx = Math.max(0, rect.left * s), sy = Math.max(0, rect.top * s);
      const sw = rect.width * s, sh = rect.height * s;
      try { ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height); } catch(e){}
      R.raf = requestAnimationFrame(draw);
    };
    R.raf = requestAnimationFrame(draw);

    const canvasStream = canvas.captureStream(30); R.canvasStream = canvasStream;
    const mime = ['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(m=>MediaRecorder.isTypeSupported(m)) || 'video/webm';
    const rec = new MediaRecorder(canvasStream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
    R.rec = rec; R.chunks = [];
    rec.ondataavailable = e => { if (e.data && e.data.size) R.chunks.push(e.data); };
    rec.onstop = async () => {
      setState('saving');
      const blob = new Blob(R.chunks, { type: 'video/webm' });
      const fname = 'arx-demo-' + new Date().toISOString().slice(0,19).replace(/[:T]/g,'-') + '.webm';
      let saved = false;
      // write to the folder the user chose in stop() (File System Access API)
      if (R.fileHandle){
        try { const w = await R.fileHandle.createWritable(); await w.write(blob); await w.close(); saved = true; } catch(e){}
      }
      if (!saved){ // fallback → default downloads folder
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = fname;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(()=>URL.revokeObjectURL(url), 4000);
      }
      R.fileHandle = null;
      setState('done'); setSecs(0);
      setTimeout(()=>setState(s=> s==='done' ? 'idle' : s), 2600);
    };
    // if the user stops sharing via the browser bar, finish cleanly
    disp.getVideoTracks()[0].addEventListener('ended', ()=>{ if (ref.current.rec) stop(); });

    rec.start();
    setState('recording'); setSecs(0);
    R.timer = setInterval(()=>setSecs(s=>s+1), 1000);
  }

  async function stop(){
    const R = ref.current;
    // ask where to save FIRST, while we still have the click's user gesture,
    // so Valen can pick his own Desktop/folder (File System Access API).
    if (window.showSaveFilePicker && !R.fileHandle){
      try {
        R.fileHandle = await window.showSaveFilePicker({
          suggestedName: 'arx-demo-' + new Date().toISOString().slice(0,19).replace(/[:T]/g,'-') + '.webm',
          types: [{ description:'WebM video', accept:{ 'video/webm':['.webm'] } }],
        });
      } catch(e){ R.fileHandle = null; } // cancelled → falls back to downloads
    }
    if (R.timer) clearInterval(R.timer);
    if (R.raf) cancelAnimationFrame(R.raf);
    try { R.rec && R.rec.state !== 'inactive' && R.rec.stop(); } catch(e){}
    try { R.disp && R.disp.getTracks().forEach(t=>t.stop()); } catch(e){}
    try { R.canvasStream && R.canvasStream.getTracks().forEach(t=>t.stop()); } catch(e){}
  }

  const mm = String(Math.floor(secs/60)).padStart(2,'0'), ss = String(secs%60).padStart(2,'0');
  const recording = state === 'recording';
  const done = state === 'done';
  if (hide) return null;                     // mobile → button never appears

  return (
    <div style={{position:'fixed', right:20, bottom:22, zIndex:99999, display:'flex', flexDirection:'column', alignItems:'center', gap:8, fontFamily:'var(--font-body, system-ui)'}}>
      {/* status / error label above the button */}
      {err
        ? <div style={{maxWidth:190, textAlign:'center', fontStyle:'italic', font:'italic 600 12px var(--font-body, system-ui)', color:'#F5A524', textShadow:'0 1px 8px rgba(0,0,0,.3)'}}>{err}</div>
        : (recording || done) && (
        <div style={{fontStyle:'italic', font:'italic 700 13px var(--font-body, system-ui)', color: done ? '#12B76A' : '#FF3B4E', textShadow:'0 1px 8px rgba(0,0,0,.25)'}}>
          {done ? 'DONE!' : 'recording…'}
        </div>
      )}
      {recording && (
        <div style={{display:'inline-flex', alignItems:'center', gap:7, padding:'6px 11px', borderRadius:999, background:'rgba(20,18,30,.92)', backdropFilter:'blur(8px)', boxShadow:'0 6px 20px rgba(0,0,0,.35)'}}>
          <span style={{width:8, height:8, borderRadius:'50%', background:'#FF3B4E', animation:'arxRecBlink 1s steps(2,start) infinite'}}/>
          <span style={{font:'700 12px ui-monospace,monospace', color:'#fff', letterSpacing:'.04em'}}>{mm}:{ss}</span>
        </div>
      )}
      <button onClick={recording ? stop : start} disabled={state==='saving'} title={recording?'Stop & save recording':'Record the app'}
        style={{width:56, height:56, borderRadius:'50%', border:'none', cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center',
          background: recording ? '#FF3B4E' : 'linear-gradient(140deg,#7C5BFF,#5B3FD6)', boxShadow: recording?'0 8px 24px rgba(255,59,78,.45)':'0 8px 24px rgba(124,91,255,.45)', transition:'transform .15s, background .2s', opacity: state==='saving'?.6:1}}
        onMouseDown={e=>e.currentTarget.style.transform='scale(.92)'} onMouseUp={e=>e.currentTarget.style.transform='scale(1)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
        {recording
          ? <span style={{width:18, height:18, borderRadius:4, background:'#fff'}}/>
          : <span style={{width:20, height:20, borderRadius:'50%', background:'#fff'}}/>}
      </button>
      <style>{'@keyframes arxRecBlink{50%{opacity:.25}}'}</style>
    </div>
  );
}

Object.assign(window, { ScreenRecordButton });
