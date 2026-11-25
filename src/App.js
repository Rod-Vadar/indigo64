import React, { useEffect, useRef, useState } from 'react';
import traffic from './traffic.jpg';
import cleanTraffic from './cleantraffic.jpg';

const Icon = ({ name, size = 18 }) => {
  const paths = {
    upload: <><path d="M12 16V4m-4 4 4-4 4 4"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    download: <><path d="M12 4v12m-4-4 4 4 4-4"/><path d="M4 17v3h16v-3"/></>,
    spark: <><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

const formatBytes = n => n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`;

export default function App() {
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState('');
  const [dimensions, setDimensions] = useState(null);
  const [processor, setProcessor] = useState('auto');
  const [memory, setMemory] = useState(64);
  const [progress, setProgress] = useState(null);
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [split, setSplit] = useState(50);
  const [dragging, setDragging] = useState(false);
  const input = useRef(null);
  const canvas = useRef(null);
  const worker = useRef(null);
  const busy = state === 'working' || state === 'cancelling';

  useEffect(() => {
    if (!files.length) { setPreview(''); setDimensions(null); return; }
    const url = URL.createObjectURL(files[0]);
    setPreview(url);
    let active = true;
    createImageBitmap(files[0]).then(bitmap => {
      if (active) setDimensions({ width: bitmap.width, height: bitmap.height });
      bitmap.close();
    }).catch(() => { if (active) setDimensions(null); });
    return () => { active = false; URL.revokeObjectURL(url); };
  }, [files]);

  useEffect(() => () => { worker.current?.postMessage({ type: 'cancel' }); }, []);
  useEffect(() => {
    if (!result || !canvas.current) return;
    canvas.current.width = result.width;
    canvas.current.height = result.height;
    canvas.current.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(result.buffer), result.width, result.height), 0, 0);
  }, [result]);

  function chooseFiles(list) {
    if (busy) return;
    const selected = Array.from(list).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
    if (!selected.length) return;
    if (selected.some(file => !file.type.startsWith('image/') && !/\.(jpe?g|png|bmp|webp|tiff?)$/i.test(file.name))) {
      setError('Please select image files only.'); return;
    }
    setFiles(selected); setResult(null); setProgress(null); setError(''); setState('idle');
  }

  function start() {
    if (files.length < 2) { setError('Choose at least two images from the same fixed-camera sequence.'); return; }
    if (!window.isSecureContext || !navigator.storage?.getDirectory) {
      setError('Temporary browser storage is unavailable. Open Indigo64 in a supported browser over HTTPS or localhost.'); return;
    }
    setError(''); setResult(null); setProgress(null); setState('working');
    const instance = new Worker(new URL('./mode.worker.js', import.meta.url));
    worker.current = instance;
    instance.onmessage = ({ data }) => {
      if (data.type === 'progress') setProgress(data.progress);
      if (data.type === 'done') { setResult(data); setState('done'); instance.terminate(); worker.current = null; }
      if (data.type === 'error') {
        if (data.name === 'AbortError') { setState('idle'); setProgress(null); }
        else {
          setState('idle');
          if (data.name === 'QuotaExceededError') setError('There is not enough browser storage for this stack. Free some space or try fewer images.');
          else if (/WebGPU|GPU adapter/i.test(data.message)) setError(`GPU processing could not start: ${data.message}. Try Automatic or CPU, or check your browser’s hardware acceleration settings.`);
          else setError(`Could not process the stack: ${data.message}. Check that your browser supports the image format and that all images have the same dimensions.`);
        }
        instance.terminate(); worker.current = null;
      }
    };
    instance.onerror = () => { setState('idle'); setError('The processing worker could not start. Try a current version of Chrome or Edge.'); instance.terminate(); worker.current = null; };
    instance.postMessage({ type: 'start', files, processor, memory });
  }

  function download() {
    canvas.current?.toBlob(blob => {
      if (!blob) { setError('Could not create the PNG download.'); return; }
      const url = URL.createObjectURL(blob); const link = document.createElement('a');
      link.href = url; link.download = 'indigo64-clean-plate.png'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }

  const percent = progress?.phase === 'prepare' ? Math.round(40 * progress.completed / progress.total) : progress?.phase === 'process' ? Math.round(40 + 60 * progress.completed / progress.total) : 0;
  const title = result ? 'Your clean plate' : files.length ? 'Your first frame' : 'See the difference';
  const before = preview || traffic;

  return <div className="app">
    <header className="topbar"><a className="brand" href="#top" aria-label="Indigo64 home"><span className="brand-mark"><span /></span><span>INDIGO<span>64</span><small>IMAGE STACKING STUDIO</small></span></a><nav><a className="active" href="#workspace">Workspace</a><a href="#how-it-works">How it works</a></nav><div className="top-right"><span className="privacy"><i /> PRIVATE BY DESIGN</span><a className="github" href="https://github.com/Rod-Vadar/indigo64" target="_blank" rel="noreferrer">GitHub <span>↗</span></a></div></header>
    <main id="top"><section className="intro"><div><div className="eyebrow"><span className="eyebrow-line" /> YOUR CREATIVE WORKSPACE <span className="eyebrow-end"> / 01</span></div><h1>Make room for <em>the scene.</em></h1><p>Turn a sequence of images into one beautifully clear moment. Remove moving distractions and let the things that stay take centre stage.</p></div><div className="intro-note"><span className="note-icon"><Icon name="spark" size={19}/></span><span>ONE SCENE. MANY MOMENTS.<br/><strong>Something remarkable.</strong></span></div></section>
    <section className="workspace" id="workspace"><div className="section-heading"><div><span className="section-number">01 / WORKSPACE</span><h2>Let’s create your clean plate<span>.</span></h2></div><p>Everything you need, in one place.</p></div>
    <div className="workspace-grid"><div className="preview-panel panel"><div className="panel-heading"><div><span className="micro">THE CANVAS</span><h3>{title}</h3></div><span className="pill"><span className="dot" />{result ? 'RESULT' : files.length ? 'SOURCE' : 'SAMPLE SCENE'}</span></div>
      <div className="image-stage"><img className="scene-image" src={before} alt={files.length ? 'First image in your selected sequence' : 'LA traffic before mode stacking'} />{!files.length && <><div className="comparison" style={{clipPath: `inset(0 ${100 - split}% 0 0)`}}><img src={cleanTraffic} alt="" /></div><div className="split-line" style={{left: `${split}%`}}><span>‹ <b>│</b> ›</span></div><div className="image-label label-left">AFTER</div><div className="image-label label-right">BEFORE</div><input className="split-input" type="range" min="0" max="100" value={split} onChange={e => setSplit(Number(e.target.value))} aria-label="Compare before and after" /></>}{result && <canvas ref={canvas} className="result-canvas" aria-label="Processed clean plate"/>}</div>
      <div className="preview-bottom"><div><span className="tiny-icon"><Icon name="image" size={16}/></span><span><strong>{result ? 'Mode stack complete' : files.length ? files[0].name : 'LA traffic · sample sequence'}</strong><small>{result ? `${result.width} × ${result.height} px · PNG ready` : files.length ? 'First frame in filename order' : 'Drag the slider to compare'}</small></span></div><span className="corner-index">{result ? 'OUTPUT / 01' : 'PREVIEW / 01'}</span></div></div>
    <div className="control-panel panel"><div className="panel-heading"><div><span className="micro">YOUR IMAGE SEQUENCE</span><h3>Start with your images</h3></div><span className="step-icon">01</span></div><p className="panel-copy">A fixed scene, captured over time. We’ll find what stays.</p>
      <div className={`dropzone ${dragging ? 'dragging' : ''} ${busy ? 'disabled' : ''}`} onDragOver={e => { e.preventDefault(); if (!busy) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); chooseFiles(e.dataTransfer.files); }}><div className="upload-icon"><Icon name="upload" size={23}/></div><strong>{files.length ? `${files.length} images selected` : 'Drop your image sequence here'}</strong><span>{files.length ? `${formatBytes(files.reduce((sum, file) => sum + file.size, 0))} total${dimensions ? ` · ${dimensions.width} × ${dimensions.height} px` : ''}` : 'or choose files from your computer'}</span><button className="browse" type="button" onClick={() => input.current.click()} disabled={busy}>{files.length ? 'Change images' : 'Browse files'} <span>↗</span></button><input ref={input} type="file" accept="image/*,.bmp,.tif,.tiff" multiple hidden onChange={e => { chooseFiles(e.target.files); e.target.value = ''; }}/></div>
      <div className="file-hint"><span>JPG, PNG, BMP &amp; more <b>·</b> Same dimensions</span><span>MIN. 2 FRAMES</span></div>
      <details className="settings"><summary><span>Processing settings</span><span>＋</span></summary><div className="settings-body"><label>Processor<select value={processor} onChange={e => setProcessor(e.target.value)} disabled={busy}><option value="auto">Automatic (WebGPU when available)</option><option value="cpu">CPU</option><option value="webgpu">WebGPU</option></select></label><label>Strip working memory<select value={memory} onChange={e => setMemory(Number(e.target.value))} disabled={busy}><option value="64">64 MB</option><option value="128">128 MB</option><option value="256">256 MB</option></select></label><small>Automatic uses the CPU when WebGPU is unavailable. Memory is a strip target, not a limit on total browser memory.</small></div></details>
      {error && <div className="error" role="alert">{error}</div>}
      {busy && <div className="progress" role="status"><div><span>{state === 'cancelling' ? 'Cancelling…' : progress?.phase === 'gpu-adapter' ? 'Checking GPU adapter…' : progress?.phase === 'gpu-device' ? 'Starting GPU device…' : progress?.phase === 'process' ? `Processing${progress.processor ? ` · ${progress.processor.toUpperCase()}` : ''}` : progress?.phase === 'prepare' && progress.completed === progress.total ? 'Starting processing…' : 'Preparing images'}</span><strong>{percent}%</strong></div><div className="progress-track"><span style={{width: `${percent}%`}}/></div><small>Keep this tab open while your stack is processed.</small></div>}
      {result && <div className="success"><Icon name="check" size={16}/> Your clean plate is ready to download.</div>}
      {busy ? <button className="primary secondary" onClick={() => { setState('cancelling'); worker.current?.postMessage({type: 'cancel'}); }} disabled={state === 'cancelling'}>Cancel processing <Icon name="close"/></button> : result ? <button className="primary" onClick={download}>Download clean plate <Icon name="download"/></button> : <button className="primary" onClick={start} disabled={files.length < 2}>Create clean plate <Icon name="arrow"/></button>}
      <div className="private-note"><span>✧</span> Your images are processed on your device.</div></div></div></section>
    <section className="how" id="how-it-works"><div className="how-heading"><span className="section-number">02 / THE PROCESS</span><h2>A little time. <em>A clearer view.</em></h2><p>Built for the moments that belong in the picture.</p></div><div className="steps"><div><span>01 <i>↗</i></span><h3>Capture a sequence</h3><p>Keep your camera still and take multiple images of the same scene.</p></div><div><span>02 <i>✳</i></span><h3>Find what stays</h3><p>Mode stacking finds the most frequent colour at each pixel position.</p></div><div><span>03 <i>↓</i></span><h3>Make it yours</h3><p>Download your resulting image and take it wherever you create.</p></div></div></section>
    <div className="fineprint">For best results, use aligned images from a fixed camera. Results depend on the scene and how often colours repeat. Browser support and temporary storage space limit very large stacks; transparency is ignored.</div></main><footer><div className="footer-brand"><span className="brand-mark small-mark"><span /></span> INDIGO64</div><span>MADE FOR THE MOMENTS THAT STAY.</span><a href="#top">BACK TO TOP ↑</a></footer></div>;
}
