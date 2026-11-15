// 共享音效控制：五个案例和学习入口都可直接使用，不依赖 Three.js。
const STORAGE_KEY = 'onetwin-audio-v1';
const ASSET_BASE = new URL('./assets/audio/', import.meta.url);
const FILES = {
  click: 'clicker-sound.ogg',
  select: 'clicker-sound.ogg',
  confirm: 'short-beep.ogg',
  'machine-start': 'short-beep.ogg',
  'machine-stop': 'short-beep.ogg',
  alert: 'short-beep.ogg',
  footstep: 'footsteps.ogg',
};
const CUES = {
  click: { frequency: 760, duration: 0.055, type: 'square' },
  select: { frequency: 620, duration: 0.07, type: 'sine' },
  confirm: { frequency: 880, duration: 0.16, type: 'sine' },
  'machine-start': { frequency: 220, end: 680, duration: 0.24, type: 'sawtooth' },
  'machine-stop': { frequency: 520, end: 150, duration: 0.22, type: 'triangle' },
  alert: { frequency: 180, end: 90, duration: 0.28, type: 'square' },
  footstep: { frequency: 100, duration: 0.11, type: 'noise' },
};

const readState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { volume: Math.min(1, Math.max(0, Number(saved.volume) || 0.35)), muted: saved.muted === true };
  } catch {
    return { volume: 0.35, muted: false };
  }
};

const state = readState();
let context;
let master;
let stepAudio;
let stepTimer;
const activeAudio = new Set();

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* 隐私模式下允许继续使用 */ }
}

function updateVolume() {
  if (master) master.gain.value = state.muted ? 0 : state.volume;
  for (const audio of activeAudio) audio.volume = state.muted ? 0 : state.volume;
  if (stepAudio) stepAudio.volume = state.muted ? 0 : state.volume;
}

async function ensureContext() {
  if (!context) {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (Context) {
      context = new Context();
      master = context.createGain();
      master.connect(context.destination);
      updateVolume();
    }
  }
  if (context?.state === 'suspended') await context.resume();
}

function fallbackCue(name) {
  if (!context || state.muted) return;
  const cue = CUES[name] || CUES.click;
  const now = context.currentTime;
  if (cue.type === 'noise') {
    const buffer = context.createBuffer(1, context.sampleRate * cue.duration, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.42, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + cue.duration);
    source.connect(gain).connect(master);
    source.start(now);
    source.stop(now + cue.duration + 0.02);
    return;
  }
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = cue.type;
  oscillator.frequency.setValueAtTime(cue.frequency, now);
  if (cue.end) oscillator.frequency.exponentialRampToValueAtTime(cue.end, now + cue.duration);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.42, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + cue.duration);
  oscillator.connect(gain).connect(master);
  oscillator.start(now);
  oscillator.stop(now + cue.duration + 0.02);
}

function playFile(name) {
  const file = FILES[name];
  if (!file || state.muted) return false;
  const audio = new Audio(new URL(file, ASSET_BASE).href);
  audio.preload = 'auto';
  audio.volume = state.volume;
  audio.playbackRate = name === 'footstep' ? 1 : 1.8;
  audio.addEventListener('ended', () => activeAudio.delete(audio), { once: true });
  audio.addEventListener('error', () => { activeAudio.delete(audio); fallbackCue(name); }, { once: true });
  activeAudio.add(audio);
  const result = audio.play();
  if (result?.catch) result.catch(() => { activeAudio.delete(audio); fallbackCue(name); });
  return true;
}

async function play(name = 'click') {
  await ensureContext();
  if (state.muted) return;
  if (!playFile(name)) fallbackCue(name);
}

async function startWalking() {
  await ensureContext();
  if (state.muted || stepAudio) return;
  stepAudio = new Audio(new URL(FILES.footstep, ASSET_BASE).href);
  stepAudio.loop = true;
  stepAudio.volume = state.volume;
  stepAudio.playbackRate = 1.25;
  stepAudio.addEventListener('error', () => {
    stepAudio = undefined;
    clearInterval(stepTimer);
    stepTimer = setInterval(() => fallbackCue('footstep'), 420);
  }, { once: true });
  stepAudio.play().catch(() => { stepAudio = undefined; });
}

function stopWalking() {
  clearInterval(stepTimer);
  stepTimer = undefined;
  if (stepAudio) {
    stepAudio.pause();
    stepAudio.currentTime = 0;
    stepAudio = undefined;
  }
}

function classifyButton(target) {
  const explicit = target.closest('[data-audio]')?.dataset.audio;
  if (explicit) return explicit;
  const text = target.closest('button,[role="button"],a')?.textContent?.trim() || '';
  if (/急停|报警|告警/.test(text)) return 'alert';
  if (/停止|暂停|关闭|退出/.test(text)) return 'machine-stop';
  if (/启动|开始|运行|自动化|巡检|漫游|播放|继续|刷新/.test(text)) return 'machine-start';
  return 'click';
}

function injectPanel() {
  if (document.querySelector('.onetwin-audio')) return;
  const style = document.createElement('style');
  style.textContent = `
    .onetwin-audio{position:fixed;right:16px;bottom:16px;z-index:2147483000;display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,.96);border:1px solid #94a3b8;border-radius:10px;box-shadow:0 5px 18px rgba(15,23,42,.2);font:14px/1.4 "Microsoft YaHei",sans-serif;color:#111827}
    .onetwin-audio button{border:1px solid #64748b;border-radius:6px;background:#f8fafc;color:#111827;padding:5px 8px;font:inherit;cursor:pointer}
    .onetwin-audio button:hover{background:#e2e8f0}.onetwin-audio label{display:flex;align-items:center;gap:6px;white-space:nowrap}.onetwin-audio input{width:105px;accent-color:#2563eb}.onetwin-audio output{min-width:38px;text-align:right}
    @media(max-width:560px){.onetwin-audio{right:8px;bottom:8px;gap:5px;padding:6px 7px;font-size:12px}.onetwin-audio input{width:80px}}
  `;
  document.head.append(style);
  const panel = document.createElement('div');
  panel.className = 'onetwin-audio';
  panel.innerHTML = `<button type="button" data-audio-mute aria-pressed="${state.muted}">${state.muted ? '🔇 已静音' : '🔊 音效'}</button><label>音量 <input data-audio-volume type="range" min="0" max="100" step="1" value="${Math.round(state.volume * 100)}" aria-label="音量"><output data-audio-output>${Math.round(state.volume * 100)}%</output></label>`;
  document.body.append(panel);
  const mute = panel.querySelector('[data-audio-mute]');
  const volume = panel.querySelector('[data-audio-volume]');
  const output = panel.querySelector('[data-audio-output]');
  mute.addEventListener('click', async () => { await ensureContext(); state.muted = !state.muted; saveState(); updateVolume(); mute.textContent = state.muted ? '🔇 已静音' : '🔊 音效'; mute.setAttribute('aria-pressed', String(state.muted)); });
  volume.addEventListener('input', () => { state.volume = Number(volume.value) / 100; state.muted = false; saveState(); updateVolume(); output.textContent = `${volume.value}%`; mute.textContent = '🔊 音效'; mute.setAttribute('aria-pressed', 'false'); });
}

function install() {
  injectPanel();
  addEventListener('pointerdown', () => { ensureContext(); }, { once: true, capture: true });
  addEventListener('keydown', event => {
    ensureContext();
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) startWalking();
  }, { capture: true });
  addEventListener('keyup', event => { if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) stopWalking(); }, { capture: true });
  addEventListener('blur', stopWalking);
  document.addEventListener('click', event => {
    if (event.target.closest('.onetwin-audio')) return;
    const target = event.target.closest('button,[role="button"],a,[data-audio]');
    if (target) play(classifyButton(target));
  }, true);
  window.__onetwinAudio = { play, startWalking, stopWalking, setVolume(value) { state.volume = Math.min(1, Math.max(0, Number(value))); saveState(); updateVolume(); }, setMuted(value) { state.muted = Boolean(value); saveState(); updateVolume(); }, state };
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
else install();
