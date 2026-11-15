// 五个案例共用的本地音效：原版组件、教学运行器与普通 HTML 都可接入。
const STORAGE_KEY = 'onetwin-audio-v1';
const ASSET_BASE = new URL('./assets/audio/', import.meta.url);
const FILES = { click: 'clicker-sound.ogg', select: 'clicker-sound.ogg', confirm: 'short-beep.ogg', 'machine-start': 'short-beep.ogg', 'machine-stop': 'short-beep.ogg', alert: 'short-beep.ogg', footstep: 'footsteps.ogg' };
let caseNumber = Number(location.pathname.match(/\/0([1-5])-/)?.[1] || 0);
const readState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const value = Number(saved.volume);
    return { volume: Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0.35, muted: saved.muted === true };
  } catch { return { volume: 0.35, muted: false }; }
};
const state = readState();
const buffers = new Map();
const activeSources = new Set();
const events = [];
const hookedApis = new WeakSet();
const positions = new WeakMap();
const boundDocuments = new WeakSet();
const boundFrames = new WeakSet();
const keys = new Set();
let context, master, analyser, outputData, panel;
let unlocked = false, focused = document.hasFocus(), lastCueAt = 0;
let walkingWanted = false, walkingSource, walkingGeneration = 0, stepTimer, ambience;
let watchedApis = 0, moving = false, latestMachine = false, lastMovementAt = 0;

function record(name, source) {
  events.push({ name, source, time: Math.round(performance.now()) });
  if (events.length > 30) events.shift();
}
function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* 不可用的本地存储不阻止课堂练习 */ } }
function audible() { return unlocked && !state.muted && state.volume > 0 && !document.hidden && document.hasFocus(); }
function updatePanel() {
  if (!panel) return;
  panel.querySelector('[data-audio-enable]').textContent = unlocked ? '试听音效' : '启用音效';
  const mute = panel.querySelector('[data-audio-mute]');
  mute.textContent = state.muted ? '取消静音' : '静音';
  mute.setAttribute('aria-pressed', String(state.muted));
  panel.querySelector('[data-audio-volume]').value = Math.round(state.volume * 100);
  panel.querySelector('output').textContent = `${Math.round(state.volume * 100)}%`;
  panel.querySelector('[data-audio-status]').textContent = state.muted ? '已静音' : !unlocked ? '点击启用，可调音量' : state.volume === 0 ? '音量为 0' : walkingWanted ? '人物脚步声' : ambience ? ({ machine: '设备运行声', equipment: '设备电机声', energy: '能源流动声' }[ambience.kind]) : '已启用 · 操作页面可发声';
}
function updateVolume() {
  if (master) master.gain.setTargetAtTime(state.muted ? 0 : state.volume, context.currentTime, 0.015);
  if (!audible()) stopContinuous();
  updatePanel();
}
async function unlock() {
  if (!context) {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) { panel.querySelector('[data-audio-status]').textContent = '此浏览器不支持音效'; return false; }
    context = new Context();
    master = context.createGain();
    analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    outputData = new Float32Array(analyser.fftSize);
    master.connect(analyser).connect(context.destination);
    master.gain.value = state.muted ? 0 : state.volume;
  }
  try {
    if (context.state !== 'running') await context.resume();
    unlocked = context.state === 'running';
    updatePanel();
    return unlocked;
  } catch { panel.querySelector('[data-audio-status]').textContent = '请点击“启用音效”'; return false; }
}
function loadBuffer(file) {
  if (!buffers.has(file)) buffers.set(file, (async () => {
    const response = await fetch(new URL(file, ASSET_BASE));
    if (!response.ok) throw new Error(`本地音效读取失败：${response.status}`);
    return context.decodeAudioData(await response.arrayBuffer());
  })().catch(() => null));
  return buffers.get(file);
}
function bufferVolume(buffer) {
  const data = buffer.getChannelData(0);
  let peak = 0;
  for (let i = 0; i < data.length; i += 5) peak = Math.max(peak, Math.abs(data[i]));
  return Math.min(4, 0.65 / Math.max(0.05, peak));
}
function firstSound(buffer) {
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 16) if (Math.abs(data[i]) > 0.015) return Math.max(0, i / buffer.sampleRate - 0.008);
  return 0;
}
function track(source, gain) {
  source.connect(gain).connect(master);
  activeSources.add(source);
  source.onended = () => { activeSources.delete(source); source.disconnect(); gain.disconnect(); };
}
function tone(name) {
  if (!audible()) return;
  const config = { click: [760, 620, 0.06], select: [620, 840, 0.1], confirm: [680, 920, 0.16], 'machine-start': [180, 680, 0.24], 'machine-stop': [520, 120, 0.24], alert: [700, 180, 0.36], footstep: [120, 50, 0.12] }[name] || [620, 840, 0.1];
  const now = context.currentTime, oscillator = context.createOscillator(), gain = context.createGain();
  oscillator.type = name === 'alert' ? 'square' : 'triangle';
  oscillator.frequency.setValueAtTime(config[0], now);
  oscillator.frequency.exponentialRampToValueAtTime(config[1], now + config[2]);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.28, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + config[2]);
  track(oscillator, gain);
  oscillator.start(); oscillator.stop(now + config[2] + 0.02);
  record(name, 'local-synthesis');
}
async function play(name = 'click') {
  if (!unlocked || !audible()) return;
  // 一个按钮既经过 DOM，又经过原版 API 时只播一次。
  if (performance.now() - lastCueAt < 65) return;
  lastCueAt = performance.now();
  if (['machine-start', 'machine-stop', 'alert'].includes(name)) { tone(name); return; }
  const buffer = await loadBuffer(FILES[name] || FILES.click);
  if (!audible()) return;
  if (!buffer) { tone(name); return; }
  const source = context.createBufferSource(), gain = context.createGain();
  source.buffer = buffer;
  const offset = firstSound(buffer);
  gain.gain.value = bufferVolume(buffer) * 0.75;
  track(source, gain);
  source.start(0, offset, name === 'click' || name === 'select' ? Math.min(0.16, buffer.duration - offset) : buffer.duration - offset);
  record(name, new URL(FILES[name] || FILES.click, ASSET_BASE).pathname);
}
function stopWalking() {
  walkingWanted = false; walkingGeneration += 1;
  clearInterval(stepTimer); stepTimer = undefined;
  if (walkingSource) { try { walkingSource.stop(); } catch { /* 已结束 */ } walkingSource = undefined; }
}
async function startWalking() {
  if (!audible() || walkingWanted) return;
  walkingWanted = true;
  const generation = ++walkingGeneration;
  const buffer = await loadBuffer(FILES.footstep);
  if (!walkingWanted || generation !== walkingGeneration || !audible()) return;
  if (!buffer) {
    tone('footstep'); stepTimer = setInterval(() => tone('footstep'), 420); return;
  }
  const source = context.createBufferSource(), gain = context.createGain();
  source.buffer = buffer; source.loop = true; source.playbackRate.value = 1.1;
  gain.gain.value = bufferVolume(buffer) * 0.75;
  track(source, gain); walkingSource = source; source.start();
  record('footsteps', new URL(FILES.footstep, ASSET_BASE).pathname);
}
function stopAmbience() {
  if (!ambience) return;
  for (const source of ambience.sources) { try { source.stop(); } catch { /* 已结束 */ } }
  ambience = undefined;
}
function startAmbience(kind) {
  if (!audible()) return;
  if (ambience?.kind === kind) return;
  stopAmbience();
  const sources = [];
  const noise = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  const source = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
  source.buffer = noise; source.loop = true;
  filter.type = 'lowpass'; filter.frequency.value = kind === 'energy' ? 700 : 420;
  gain.gain.value = kind === 'energy' ? 0.1 : 0.055;
  source.connect(filter).connect(gain).connect(master);
  source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
  source.start(); sources.push(source);
  if (kind !== 'energy') {
    for (const frequency of [kind === 'equipment' ? 100 : 72, kind === 'equipment' ? 202 : 146]) {
      const motor = context.createOscillator(), volume = context.createGain();
      motor.type = 'sine'; motor.frequency.value = frequency;
      motor.connect(volume).connect(master); volume.gain.value = 0.075;
      motor.onended = () => { motor.disconnect(); volume.disconnect(); };
      motor.start(); sources.push(motor);
    }
  }
  ambience = { kind, sources };
  record(kind, 'local-synthesis');
}
function stopContinuous() {
  stopWalking(); stopAmbience();
  for (const source of activeSources) { try { source.stop(); } catch { /* 已结束 */ } }
}
function classify(target) {
  const explicit = target.closest('[data-audio]')?.dataset.audio;
  if (explicit) return explicit;
  const text = `${target.textContent || ''} ${target.getAttribute('title') || ''} ${target.getAttribute('aria-label') || ''}`;
  if (/急停|报警|告警/.test(text)) return 'alert';
  if (/停止|暂停|关闭|退出/.test(text)) return 'machine-stop';
  if (/启动|开始|运行|自动化|巡检|漫游|游览|播放|继续|刷新/.test(text)) return 'machine-start';
  return 'select';
}
function bindDocument(doc) {
  if (boundDocuments.has(doc)) return;
  boundDocuments.add(doc);
  doc.addEventListener('pointerdown', () => { focused = true; unlock(); }, true);
  doc.addEventListener('click', event => {
    const element = event.target?.nodeType === 1 ? event.target : null;
    if (!element || element.closest('.onetwin-audio')) return;
    let target = element.closest('button,[role="button"],a,[data-audio],.icon-outside,.el-tabs__item,canvas');
    if (!target) {
      for (let current = element, depth = 0; current && depth < 5; current = current.parentElement, depth += 1) {
        if (doc.defaultView.getComputedStyle(current).cursor === 'pointer') { target = current; break; }
      }
    }
    if (target) play(classify(target));
  }, true);
}
function bindFrames() {
  for (const frame of document.querySelectorAll('iframe')) {
    if (!boundFrames.has(frame)) {
      boundFrames.add(frame);
      frame.addEventListener('load', () => { try { if (frame.contentDocument) bindDocument(frame.contentDocument); } catch { /* 外部天气页不接管 */ } });
    }
    try { if (frame.contentDocument) bindDocument(frame.contentDocument); } catch { /* 只绑定同源图表 */ }
  }
}
function hookApi(api) {
  if (hookedApis.has(api)) return;
  hookedApis.add(api); watchedApis += 1;
  const cues = { changeAutoRotate: 'select', bottonChangeCamera: 'select', restoreControls: 'select', startRobot: 'confirm', stopRobot: 'machine-stop', textTab: 'select', handleModelClick: 'select' };
  for (const name of ['stopPlayAnimation', ...Object.keys(cues)]) {
    const original = api[name];
    if (typeof original !== 'function') continue;
    api[name] = function (...args) {
      const result = original.apply(this, args);
      const animation = args[0]?.animation;
      const cue = name === 'stopPlayAnimation' ? (animation?.stop?.length ? 'machine-stop' : 'machine-start') : cues[name];
      play(cue);
      return result;
    };
  }
}
function running(actions) {
  const list = actions instanceof Map ? [...actions.values()] : actions || [];
  return list.some(action => action.isRunning?.() && !action.paused && action.enabled !== false);
}
function hasMoved(object) {
  if (!object?.position) return false;
  const next = { x: object.position.x, z: object.position.z, time: performance.now() }, old = positions.get(object);
  positions.set(object, next);
  if (!old) return false;
  const distance = Math.hypot(next.x - old.x, next.z - old.z);
  return distance > 0.003 && distance < Math.max(1.5, (next.time - old.time) / 1000 * 12);
}
function pollScene() {
  // 单独启动某个案例时 URL 没有目录前缀，使用页面标题识别案例。
  if (!caseNumber) caseNumber = [[/GMP|制药/i, 1], [/工业控制/, 2], [/绿色.*展厅/, 3], [/设备运维/, 4], [/智慧能源/, 5]].find(([pattern]) => pattern.test(document.title))?.[1] || 0;
  const apis = window.__referenceApis || [];
  let machine = false, walking = false, movementIntent = false;
  for (const api of apis) {
    hookApi(api);
    machine ||= running(api.global?.actions);
    const robot = api.rebotConfig;
    const displaced = hasMoved(robot?.player);
    const intent = api.robotObj?.ifRobot && ['W', 'A', 'S', 'D'].some(key => robot?.keyEnum?.[key]);
    movementIntent ||= intent;
    if (intent && displaced) walking = true;
  }
  for (const viewer of window.__replica?.viewers || []) {
    machine ||= running(viewer.actions);
    const displaced = hasMoved(viewer.camera);
    const intent = [...keys].some(code => ['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(code));
    movementIntent ||= intent;
    if (intent && displaced) walking = true;
  }
  for (const mixer of window.practice?.mixers || []) machine ||= running(mixer._actions);
  if (walking) lastMovementAt = performance.now();
  walking ||= movementIntent && lastMovementAt > 0 && performance.now() - lastMovementAt < 240;
  latestMachine = machine; moving = walking;
  if (!audible()) { stopContinuous(); updatePanel(); return; }
  if (walking) startWalking(); else stopWalking();
  if ([1, 2].includes(caseNumber) && machine) startAmbience('machine');
  else if (caseNumber === 4 && document.documentElement.dataset.ready === 'true') startAmbience('equipment');
  else if (caseNumber === 5 && document.documentElement.dataset.ready === 'true') startAmbience('energy');
  else stopAmbience();
  updatePanel();
}
function setVolume(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return;
  state.volume = Math.min(1, Math.max(0, number)); save(); updateVolume();
}
function setMuted(value) { state.muted = Boolean(value); save(); updateVolume(); }
function diagnostics() {
  let outputRms = 0;
  if (analyser) { analyser.getFloatTimeDomainData(outputData); outputRms = Math.sqrt(outputData.reduce((sum, value) => sum + value * value, 0) / outputData.length); }
  return { caseNumber, unlocked, contextState: context?.state || 'not-started', volume: state.volume, muted: state.muted, outputRms, ambience: ambience?.kind || null, walking: walkingWanted, moving, machineRunning: latestMachine, hookedApis: watchedApis, events: [...events] };
}
function install() {
  if (window.__onetwinAudio) return;
  const style = document.createElement('style');
  style.textContent = `.onetwin-audio{position:fixed;right:16px;bottom:16px;z-index:2147483000;display:flex;align-items:center;gap:8px;flex-wrap:wrap;max-width:calc(100vw - 32px);padding:9px 11px;background:#ffffffed;border:1px solid #94a3b8;border-radius:10px;box-shadow:0 5px 18px #0f172a33;font:14px/1.4 "Microsoft YaHei",sans-serif;color:#111}.onetwin-audio button{border:1px solid #64748b;border-radius:6px;background:#f8fafc;color:#111;padding:6px 9px;font:inherit;cursor:pointer}.onetwin-audio button:hover{background:#e2e8f0}.onetwin-audio [data-audio-enable]{background:#e5efff;border-color:#2563eb}.onetwin-audio label{display:flex;align-items:center;gap:6px;white-space:nowrap}.onetwin-audio input{width:100px;accent-color:#2563eb}.onetwin-audio output{min-width:38px;text-align:right}.onetwin-audio [data-audio-status]{flex-basis:100%;font-size:12px;color:#111}@media(max-width:560px){.onetwin-audio{right:8px;bottom:8px;padding:6px 7px;font-size:12px;gap:5px}.onetwin-audio input{width:75px}}`;
  document.head.append(style);
  panel = document.createElement('section'); panel.className = 'onetwin-audio'; panel.setAttribute('aria-label', '本地音效控制');
  panel.innerHTML = '<button type="button" data-audio-enable>启用音效</button><button type="button" data-audio-mute>静音</button><label>音量 <input data-audio-volume type="range" min="0" max="100" step="1" aria-label="音量"><output></output></label><span data-audio-status role="status"></span>';
  document.body.append(panel);
  panel.querySelector('[data-audio-enable]').addEventListener('click', async () => { focused = true; if (await unlock()) { setMuted(false); await play('confirm'); pollScene(); } });
  panel.querySelector('[data-audio-mute]').addEventListener('click', async () => { focused = true; await unlock(); setMuted(!state.muted); });
  panel.querySelector('[data-audio-volume]').addEventListener('input', async event => { focused = true; await unlock(); state.muted = false; setVolume(Number(event.target.value) / 100); });
  bindDocument(document); bindFrames();
  addEventListener('keydown', event => { if (/^(INPUT|TEXTAREA|SELECT)$/.test(event.target?.tagName) || event.target?.isContentEditable) return; focused = true; unlock(); keys.add(event.code); }, true);
  addEventListener('keyup', event => { keys.delete(event.code); if (!keys.size) { lastMovementAt = 0; stopWalking(); } }, true);
  addEventListener('blur', () => { if (document.hasFocus()) return; focused = false; keys.clear(); stopContinuous(); updatePanel(); });
  addEventListener('focus', () => { focused = true; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { keys.clear(); stopContinuous(); } });
  addEventListener('pagehide', stopContinuous);
  new MutationObserver(bindFrames).observe(document.body, { childList: true, subtree: true });
  setInterval(pollScene, 120);
  window.__onetwinAudio = { play, startWalking, stopWalking, setVolume, setMuted, state, diagnostics };
  updatePanel(); pollScene();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
else install();
