import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const stage = document.querySelector('#stage');
const loading = document.querySelector('#loading');
const charts = [];
const viewers = [];
const diagnostics = { models: [], effects: [], errors: [], components: [], unsupported: [] };
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const px = value => `${Number(value) || 0}px`;
const point = (target, value = {}, defaults = {}) => target.set(value.x ?? defaults.x ?? 0, value.y ?? defaults.y ?? 0, value.z ?? defaults.z ?? 0);
const color = value => new THREE.Color().setStyle(String(value || '#ffffff').replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, 'rgb($1,$2,$3)'));
const canonical = value => new URL(value.startsWith('//') ? `https:${value}` : value, 'https://onetwin.cn').href.replace(/^http:/, 'https:');
let template;
let manifest;
let noticeTimer;

function notice(message) {
  const element = document.querySelector('#notice');
  element.textContent = message;
  element.hidden = false;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { element.hidden = true; }, 4500);
}
function asset(value) {
  if (!value || /^(data:|blob:)/.test(value)) return value || '';
  if (/^https?:/.test(value) && new URL(value).origin === location.origin) return value;
  const entry = manifest.entries[canonical(value)];
  return entry ? new URL(entry.file, location.href).href : canonical(value);
}
function styleComponent(element, source) {
  const style = source.style || {};
  Object.assign(element.style, {
    left: px(style.left), top: px(style.top), width: px(style.width), height: px(style.height),
    opacity: style.opacity ?? 1, borderRadius: px(style.borderRadius),
    transform: `rotate(${Number(style.rotate) || 0}deg) rotateX(${Number(style.rotateX) || 0}deg) rotateY(${Number(style.rotateY) || 0}deg) scale(${style.scaleX ?? 1},${style.scaleY ?? 1})`,
  });
  for (const key of ['color', 'backgroundColor', 'fontWeight', 'fontFamily', 'textAlign', 'textShadow']) if (style[key]) element.style[key] = style[key];
  if (style.fontSize) element.style.fontSize = px(style.fontSize);
  if (style.letterSpacing) element.style.letterSpacing = px(style.letterSpacing);
  if (style.lineHeight) element.style.lineHeight = String(style.lineHeight);
}
function panelStyle(element, source, option = source) {
  Object.assign(element.style, {
    background: option.containerBg || '', border: `${option.borderWidth || 0}px solid ${option.borderColor || 'transparent'}`,
    borderRadius: px(option.radius), padding: `${option.paddingY || 0}px ${option.paddingX || 0}px`,
    color: option.nameColor || '#fff', fontSize: px(option.nameSize || 14),
  });
}
function title(source) {
  return source.showTitle ? `<div class="panel-title" style="color:${source.titleColor || '#00e9db'};font-size:${source.titleSize || 16}px">${escapeHTML(source.title)}</div>` : '';
}
function chart(element, option) {
  const instance = echarts.init(element, null, { renderer: 'canvas', devicePixelRatio: 1 });
  instance.setOption(option);
  charts.push(instance);
  return instance;
}
function resize() {
  const { width, height } = template.canvasStyle;
  stage.style.transform = `scale(${innerWidth / width},${innerHeight / height})`;
  for (const viewer of viewers) viewer.resize();
}

function standardChart(type, p, element) {
  const option = structuredClone(p.option || p);
  const data = p.data;
  if (type === 'Chart') {
    const xAxis = Array.isArray(option.xAxis) ? option.xAxis : [option.xAxis];
    if (xAxis[0]) xAxis[0].data = data.xData;
    option.series.forEach((series, index) => { series.data = data.seriesData[index] || []; });
    if (option.legend) option.legend.data = option.series.map(series => series.name);
  } else if (type === 'Radar') {
    option.radar.indicator = data.indicators;
    option.series = option.series.map((series, index) => ({ ...series, type: 'radar', data: [{ name: series.name, value: data.seriesData[index] }] }));
  } else if (type === 'Pie1') {
    option.series[0].data = data.map(item => ({ ...item, itemStyle: { color: item.color } }));
  } else if (type === 'GaugeGlow') {
    option.series[0].data = [{ name: data.name, value: data.value }];
    option.series[0].max = data.max;
  } else if (type === 'ChartsMountain') {
    option.xAxis.data = data.xAxis;
    option.series = [{ ...option.series, ...p.config, type: 'pictorialBar', data: data.series, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, p.config.colorStops) } }];
  } else if (type === 'Bar1') {
    const items = [...data.data].reverse();
    option.yAxis[0].data = items.map(item => item.name);
    option.xAxis[0].max = data.max;
    option.series[0].data = items.map(item => ({ value: item.value, itemStyle: { color: item.color } }));
    option.series[1].data = items.map(() => data.max - .5);
    option.series[2].data = items.map(item => ({ value: data.max, itemStyle: { color: item.color } }));
    option.series[3].data = items.map(item => ({ value: 0, itemStyle: { color: item.color } }));
  }
  chart(element, option);
}

function slideChart(element, p) {
  const config = p.config;
  const data = p.data;
  const count = Math.min(config.visibleCount || 6, data.length);
  const inner = document.createElement('div');
  Object.assign(inner.style, { width: '100%', height: '100%', background: config.bgColor || '' });
  element.append(inner);
  const instance = chart(inner, {});
  let offset = 0;
  let paused = false;
  function draw() {
    const current = Array.from({ length: count }, (_, index) => data[(offset + index) % data.length]);
    instance.setOption({
      grid: { left: '5%', right: '5%', top: '16%', bottom: '24%', containLabel: true },
      tooltip: { trigger: 'axis', formatter: values => values.map(value => `${escapeHTML(current[value.dataIndex].name)}: ${value.value}${escapeHTML(current[value.dataIndex].unit || '')}`).join('<br>') },
      xAxis: { type: 'category', data: current.map(item => item.name), axisLine: { lineStyle: { color: config.axisColor } }, axisTick: { show: false }, axisLabel: { color: config.labelColor, fontSize: config.labelFontSize, interval: 0 } },
      yAxis: { type: 'value', show: config.showGridLines || false, splitLine: { show: !!config.showGridLines } },
      series: [{ type: 'line', data: current.map(item => item.value), smooth: config.smoothLine, symbolSize: config.nodeSize || 10,
        lineStyle: { color: config.lineColor, width: config.lineWidth, shadowColor: config.glowColor, shadowBlur: config.glowIntensity || 0 },
        itemStyle: { color: config.nodeColor, borderColor: config.nodeBorderColor, borderWidth: config.nodeBorderWidth },
        areaStyle: config.showArea ? { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: config.areaColor }, { offset: 1, color: 'transparent' }]) } : undefined,
        label: { show: config.showLabel, position: 'top', color: config.valueColor, fontSize: config.valueFontSize, formatter: value => `${value.value}${current[value.dataIndex].unit || ''}` },
      }],
    });
  }
  if (config.showControls) {
    const controls = document.createElement('div');
    controls.className = 'chart-controls';
    for (const [label, action] of [['上一组', -1], ['暂停轮播', 0], ['下一组', 1]]) {
      const button = document.createElement('button'); button.textContent = label;
      button.onclick = () => { if (!action) { paused = !paused; button.textContent = paused ? '继续轮播' : '暂停轮播'; } else { offset = (offset + action + data.length) % data.length; draw(); } };
      controls.append(button);
    }
    element.append(controls);
  }
  if (config.autoSlide) setInterval(() => { if (!document.hidden && !paused) { offset = (offset + 1) % data.length; draw(); } }, config.slideInterval || 3000);
  draw();
}

function multiPillar(element, p) {
  const { width, height } = element.getBoundingClientRect();
  const w = Number(element.style.width.replace('px', '')) || width;
  const h = Number(element.style.height.replace('px', '')) || height;
  const gap = w / p.data.length;
  const maximum = Math.max(...p.data.map(item => item.value));
  element.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" role="img" aria-label="产线达标排名">${p.data.map((item, i) => {
    const x = gap * (i + .5), y = h - 75, barH = (h - 140) * item.value / maximum, r = Math.min(gap * .32, (p.config.barWidth || 80) / 2);
    return `<defs><linearGradient id="bar-${i}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${item.color1}"/><stop offset="1" stop-color="${item.color2}" stop-opacity=".4"/></linearGradient></defs><ellipse cx="${x}" cy="${y}" rx="${r + 15}" ry="${r / 2 + 8}" fill="none" stroke="#31e4d1" stroke-dasharray="5 5"/><path d="M${x-r} ${y-barH}v${barH}a${r} ${r/2} 0 0 0 ${r*2} 0v${-barH}" fill="url(#bar-${i})"/><ellipse cx="${x}" cy="${y-barH}" rx="${r}" ry="${r/2}" fill="${item.color1}"/><text x="${x}" y="${y-barH-r/2-20}" fill="${item.color1}" text-anchor="middle" font-size="${p.config.valueFontSize || 30}">${item.value}</text><text x="${x}" y="${h-20}" fill="${p.config.labelColor}" text-anchor="middle" font-size="${p.config.labelFontSize || 20}">${escapeHTML(item.name)}</text>`;
  }).join('')}</svg>`;
}

function renderData(type, element, p) {
  if (['Chart', 'Radar', 'Pie1', 'PieY', 'GaugeGlow', 'ChartsMountain', 'Bar1'].includes(type)) return standardChart(type, p, element);
  if (type === 'SlideLineChart') return slideChart(element, p);
  if (type === 'Charts3DMultiPillar') return multiPillar(element, p);
  if (type === 'StatusCapsule') {
    panelStyle(element, p);
    element.innerHTML = `${title(p)}<div class="capsule-list">${p.data.map(item => `<div class="capsule-row" style="margin-bottom:${p.itemGap}px;padding:${p.itemPaddingY}px ${p.itemPaddingX}px;background:${item.rowBg || p.itemBg}"><span class="name" style="color:${item.nameColor || p.nameColor};font-size:${p.nameSize || 14}px">${escapeHTML(item.name)}</span><span class="value" style="color:${item.valueColor || p.valueColor};font-size:${p.valueSize}px">${escapeHTML(item.value)}</span><span class="status" style="color:${item.textColor};background:${item.statusColor};font-size:${p.statusFontSize}px;padding:${p.statusPaddingY}px ${p.statusPaddingX}px;border-radius:${p.statusRadius}px">${escapeHTML(item.status)}</span></div>`).join('')}</div>`;
    if (p.autoScroll) setInterval(() => { if (!document.hidden) { const list = element.querySelector('.capsule-list'); list.append(list.firstElementChild); } }, (p.scrollInterval || 2.5) * 1000);
  } else if (type === 'DataCardGroup') {
    panelStyle(element, p);
    element.innerHTML = `${title(p)}<div class="data-grid" style="grid-template-columns:repeat(${p.columns},1fr);gap:${p.rowGap}px ${p.columnGap}px">${p.data.map(item => `<div class="data-card" style="padding:${p.cardPaddingY}px ${p.cardPaddingX}px;background:${item.cardBg || p.cardBg};border:1px solid ${item.borderColor || p.cardBorderColor}"><div class="name" style="color:${p.nameColor}">${escapeHTML(item.name)}</div><div class="value" style="font-size:${p.valueSize}px;color:${item.valueColor || p.valueColor}">${escapeHTML(item.value)}<small>${escapeHTML(item.unit)}</small></div><div class="sub">${escapeHTML(item.sub)}</div></div>`).join('')}</div>`;
  } else if (type === 'StatComparisonCard') {
    panelStyle(element, p);
    const d = p.data, percent = (d.value - d.comparisonValue) / d.comparisonValue * 100;
    element.innerHTML = `<div style="font-size:${p.titleSize}px;color:${p.titleColor}">${escapeHTML(d.title)}</div><div style="height:75%;display:flex;align-items:center;justify-content:space-between"><b style="font-size:${p.valueSize}px;color:${p.valueColor}">${escapeHTML(d.value)}<small style="font-size:${p.unitSize}px"> ${escapeHTML(d.unit)}</small></b><span style="color:${percent >= 0 ? p.upColor : p.downColor};font-size:${p.comparisonTextSize}px">↑${percent.toFixed(p.percentDecimal)}%<br><span style="color:${p.comparisonTextColor}">${escapeHTML(d.comparisonText)}</span></span></div>`;
  } else if (type === 'BatteryMetric') {
    panelStyle(element, p);
    const d = p.data, fill = +d.value <= p.lowThreshold ? p.lowColor : +d.value <= p.midThreshold || d.status === 'warning' ? p.midColor : p.highColor;
    element.innerHTML = `<div style="text-align:center;font-size:${p.titleSize}px;font-weight:${p.titleWeight};margin-bottom:12px">${escapeHTML(d.title)}</div><div class="battery-shell" style="height:${p.shellHeight}px"><div class="battery-fill" style="color:${fill};width:${Math.min(100,Math.max(0,+d.value))}%"><b style="font-size:${p.valueSize}px">${escapeHTML(d.value)}${escapeHTML(d.unit)}</b></div></div>`;
  } else if (type === 'ThermoAlertGroup') {
    panelStyle(element, p);
    element.innerHTML = `${title(p)}<div class="thermo-grid" style="grid-template-columns:repeat(${p.columns},1fr);gap:${p.itemGap}px">${p.data.map(item => {
      const c = p[`${item.status}Color`] || p.normalColor;
      return `<div class="thermo-item" style="background:${p.itemBg};border:1px solid ${p.itemBorderColor};font-size:${p.nameSize}px"><div class="thermo-name">${escapeHTML(item.name)}</div><div class="thermo-body" style="color:${c}"><div class="thermo-tube"><i style="height:${Math.min(100,Math.max(0,(item.value-p.minTemp)/(p.maxTemp-p.minTemp)*100))}%"></i></div><span class="thermo-value" style="font-size:${p.valueSize}px">${item.value}<small style="font-size:${p.unitSize}px">${escapeHTML(item.unit)}</small></span></div><div style="color:${c};font-size:${p.statusSize}px">${escapeHTML(item.statusText || ({normal:'正常',notice:'偏高',warning:'预警',danger:'危险',offline:'离线'})[item.status])}</div><small style="color:${p.descColor};font-size:${p.descSize}px">${escapeHTML(item.desc)}</small></div>`;
    }).join('')}</div>`;
  } else if (type === 'RingProgressGroup') {
    const o = p.option;
    element.innerHTML = `<div class="ring-grid">${p.data.items.map(item => {
      const ratio = item.value / item.max, c = item.color || o.normalColor;
      return `<div class="ring-item"><svg viewBox="0 0 180 180"><circle cx="90" cy="90" r="70" fill="none" stroke="${o.bgColor}" stroke-width="${o.strokeWidth}"/><circle cx="90" cy="90" r="70" fill="none" stroke="${c}" stroke-width="${o.strokeWidth}" stroke-dasharray="${ratio*440} 440" transform="rotate(-90 90 90)" style="filter:drop-shadow(0 0 5px ${c})"/><text x="90" y="105" text-anchor="middle" fill="${c}" font-size="${o.valueSize}">${Math.round(item.value)}</text></svg><p style="font-size:${o.labelSize}px">${escapeHTML(item.name)}</p></div>`;
    }).join('')}</div>`;
  } else if (type === 'DataConveyor') {
    const o = p.option;
    element.innerHTML = `<div class="conveyor" style="font-size:${o.fontSize}px">${p.data.pipelines.map(item => `<div class="conveyor-row" style="color:${item.status==='warning'?o.warningColor:o.normalColor}"><span class="conveyor-node">⊙ ${escapeHTML(item.source)}</span><span class="conveyor-pipe">· · · ${escapeHTML(item.label)} · · ·</span><span class="conveyor-node">⊙ ${escapeHTML(item.target)}</span><span class="conveyor-value" style="font-size:${o.valueSize}px;color:${o.valueColor}">${item.throughput}<small style="font-size:${o.unitSize}px">${escapeHTML(item.unit)}</small></span></div>`).join('')}</div>`;
  } else if (type === 'FaultCodePanel') {
    const o = p.option;
    panelStyle(element, p, o);
    element.innerHTML = `<div style="font-size:${o.headerSize}px">当前故障信息　<span style="color:${o.countColor}">${p.data.faults.length}</span></div>${p.data.faults.map(item => `<div class="fault-row"><span style="color:${o[`${item.level}Color`]};font-size:${o.codeSize}px">[${escapeHTML(item.code)}] ${escapeHTML(item.level).toUpperCase()}</span><div class="desc" style="font-size:${o.descSize}px;color:${o.descColor}">${escapeHTML(item.desc)}</div><small style="font-size:${o.timeSize}px">${escapeHTML(item.time)} · ${escapeHTML(item.source)}</small></div>`).join('')}`;
    let index = 0;
    setInterval(() => { if (!document.hidden) { const rows = element.querySelectorAll('.fault-row'); if (rows.length) { element.append(rows[index % rows.length]); index++; } } }, Math.max(2000, (o.scrollSpeed || 3) * 1000));
  } else if (type === 'SegmentStatRibbon') {
    panelStyle(element, p);
    element.innerHTML = `${title(p)}<div class="stat-ribbon">${p.data.map((item,index)=>`<div style="color:${item.color || p.palette[index]}"><span style="font-size:${p.labelSize}px">${escapeHTML(item.label)}</span><strong style="font-size:${p.valueSize}px">${escapeHTML(item.value)}<small style="font-size:${p.unitSize}px">${escapeHTML(item.unit)}</small></strong><small>${escapeHTML(item.trend)}</small></div>`).join('')}</div>`;
  } else if (type === 'ScrollTable') {
    const rows = p.data.slice(1), config = p.config;
    let offset = 0;
    const cell = item => escapeHTML(item).replace(/&lt;span style=&quot;color:(red|blue);&quot;&gt;([^<]*?)&lt;\/span&gt;/g,'<span style="color:$1">$2</span>');
    const draw = () => { element.innerHTML = `<table style="height:100%;font-size:${parseFloat(element.style.fontSize)||14}px"><thead style="background:${config.headerBGC}"><tr>${config.index?'<th style="width:40px">#</th>':''}${p.data[0].map(item=>`<th>${cell(item)}</th>`).join('')}</tr></thead><tbody>${Array.from({length:Math.min(config.rowNum,rows.length)},(_,i)=>({row:rows[(offset+i)%rows.length],index:(offset+i)%rows.length})).map(({row,index},i)=>`<tr style="background:${i%2?config.evenRowBGC:config.oddRowBGC}">${config.index?`<td>${index+1}</td>`:''}${row.map(item=>`<td>${cell(item)}</td>`).join('')}</tr>`).join('')}</tbody></table>`; };
    draw(); let hover = false; element.onmouseenter=()=>{hover=true;};element.onmouseleave=()=>{hover=false;};
    if(rows.length>config.rowNum)setInterval(()=>{if(!document.hidden&&!(hover&&config.hoverPause)){offset=(offset+1)%rows.length;draw();}},config.waitTime||2000);
  } else if (type === 'NumberFlop') {
    const c = p.config;
    element.style.cssText += `;display:grid;place-items:center;color:${c.style.fill};font-size:${c.style.fontSize}px`;
    element.textContent = (c.content || '{nt}').replace('{nt}', Number(c.number[0]).toFixed(c.toFixed));
  } else if (type === 'RadarTagWall') {
    panelStyle(element, p);
    const cards = p.data.map(item=>`<div class="radar-card" style="font-size:${p.nameSize}px">${escapeHTML(item.name)}<b style="font-size:${p.valueSize}px;color:${p[`${item.status}Color`]}">${escapeHTML(item.value)}<small style="font-size:${p.unitSize}px">${escapeHTML(item.unit)}</small></b></div>`);
    element.innerHTML = `<div class="radar-wall"><div>${cards.slice(0,3).join('')}</div><div class="radar-core">${escapeHTML(p.coreText)}</div><div>${cards.slice(3).join('')}</div></div>`;
  } else if (type === 'NeuralCore') {
    const [core, ...nodes] = p.data.data, o = p.option, c = o.coreStyle, f = o.fontConfig;
    const positions = [[22,26],[78,24],[70,68],[26,72],[14,48],[86,50]];
    element.innerHTML = `<div class="neural-map" style="--core-color:${c.primaryColor};--core-secondary:${c.secondaryColor};--core-size:${c.coreSize}px;--core-glow:${c.glowSize}px;--ring-speed:${360/o.animation.ringRotateSpeed}s"><svg class="neural-connections" viewBox="0 0 100 100" preserveAspectRatio="none">${nodes.map((item,i)=>`<line x1="50" y1="50" x2="${positions[i][0]}" y2="${positions[i][1]}" stroke="${item.color||c.primaryColor}" stroke-width="${o.nodes.lineWidth}" stroke-opacity="${o.nodes.lineOpacity}" stroke-dasharray="1.2 1.2"/>`).join('')}</svg><div class="neural-orbits"><i></i><i></i></div><div class="neural-orb"><span style="font-size:${f.centerLabelSize}px">${escapeHTML(core.name)}</span><strong style="font-size:${f.centerValueSize}px;color:${c.secondaryColor}">${core.value}<small>${escapeHTML(core.unit)}</small></strong></div>${nodes.map((item,i)=>`<div class="neural-node" style="left:${positions[i][0]}%;top:${positions[i][1]}%;border-color:${item.color||c.primaryColor};color:${item.color||c.primaryColor};box-shadow:0 0 14px ${item.color||c.primaryColor}"><span style="font-size:${f.labelSize}px;color:${c.textColor}">${escapeHTML(item.name)}</span><b style="font-size:${f.valueSize}px">${item.value}<small>${escapeHTML(item.unit)}</small></b></div>`).join('')}</div>`;
  } else if (type === 'CustomChart') {
    const iframe=document.createElement('iframe');iframe.title='能源工艺示意图';iframe.setAttribute('sandbox','allow-scripts');
    const base=new URL('.',location.href).href;
    let content=p.script.replace(/<script[^>]+(?:echarts-gl|jquery)[^>]*><\/script>/gi,'');
    content=content.replace('/iframeJs/echarts.min.js',`${base}vendor/echarts.min.js`);
    // 原图表会在 iframe 首次布局前初始化；显式尺寸防止拖尾层创建零尺寸画布。
    content=content.replace('renderer: "canvas",',`renderer: "canvas", width: ${parseFloat(element.style.width)}, height: ${parseFloat(element.style.height)}, devicePixelRatio: 1,`);
    content=content.replace('</head>','<style>html,body{background:transparent;color-scheme:light;overflow:hidden}</style></head>');
    // 原站这两条图片地址实际返回 HTML，原画面也未显示它们。
    for(const path of ['/asset/get/s/data-1605493703679-ydPWrx0rH.png','/asset/get/s/data-1605494522699-WjdxwqFTe.png'])content=content.replaceAll(path,'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    for(const [url,entry]of Object.entries(manifest.entries))content=content.replaceAll(new URL(url).pathname,new URL(entry.file,base).href);
    iframe.srcdoc=content;element.append(iframe);
  } else {diagnostics.unsupported.push(type);element.textContent=`未支持的组件：${type}`;}
}

async function renderThree(element, component) {
  const p = component.propValue;
  const single = component.component === 'Container3D';
  const attribute = single ? p.attribute : p;
  const canvas = document.createElement('canvas');canvas.className='three-canvas';canvas.tabIndex=0;element.append(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
  renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  const scene=new THREE.Scene();
  const c=single?{}:attribute.camera;
  const camera=new THREE.PerspectiveCamera(c.fov||50,component.style.width/component.style.height,c.near||.1,c.far||3000);
  point(camera.position,c.cameraPosition||{x:15,y:15,z:15});
  const controls=new OrbitControls(camera,canvas);point(controls.target,c.cameraLookAt);
  Object.assign(controls,{enableDamping:!!attribute.controls?.enableDamping,dampingFactor:attribute.controls?.dampingFactor||.1,enableZoom:attribute.controls?.enableZoom!==false,enablePan:attribute.controls?.enablePan!==false,autoRotate:!!attribute.controls?.autoRotate,autoRotateSpeed:attribute.controls?.autoRotateSpeed||1});
  if(attribute.controls?.maxPolarAngle)controls.maxPolarAngle=THREE.MathUtils.degToRad(attribute.controls.maxPolarAngle);
  controls.update();
  const lights=[];
  function setLights(configs){
    for(const light of lights)scene.remove(light);lights.length=0;
    for(const config of configs||[]){
      const type=config.lightType||config.type;
      let light;
      if(type==='HemisphereLight')light=new THREE.HemisphereLight(color(config.skyColor),color(config.groundColor),config.intensity);
      else if(type==='AmbientLight')light=new THREE.AmbientLight(color(config.lightColor||config.color),config.intensity);
      else if(type==='SpotLight'){light=new THREE.SpotLight(color(config.lightColor||config.color),config.intensity,config.spotDistance||0,config.spotAngle||Math.PI/3,config.spotPenumbra||0);}
      else if(type==='PointLight')light=new THREE.PointLight(color(config.lightColor||config.color),config.intensity,config.spotDistance||0);
      else light=new THREE.DirectionalLight(color(config.lightColor||config.color),config.intensity);
      point(light.position,config.lightPosition||config.position);
      // 仅主方向光生成阴影，避免每个局部灯光重复渲染整个模型。
      if(type==='DirectionalLight'&&config.shadow){light.castShadow=true;light.shadow.mapSize.set(1024,1024);}
      scene.add(light);lights.push(light);
    }
  }
  setLights(attribute.lights);
  function setFog(config){scene.fog=config?.enabled?(config.type==='Fog'?new THREE.Fog(color(config.color),config.near,config.far):new THREE.FogExp2(color(config.color),config.density)):null;}
  setFog(attribute.fog);
  async function setSkybox(config){
    if(!config)return;
    try{
      if(config.useHdr&&config.hdrUrl){const texture=await new HDRLoader().loadAsync(asset(config.hdrUrl));texture.mapping=THREE.EquirectangularReflectionMapping;scene.environment=texture;if(config.showSkybox)scene.background=texture;}
      else if(config.showSkybox&&config.url){const texture=await new THREE.TextureLoader().loadAsync(asset(config.url));texture.mapping=THREE.EquirectangularReflectionMapping;texture.colorSpace=THREE.SRGBColorSpace;scene.background=texture;}
      else if(config.color)scene.background=color(config.color);
    }catch(error){diagnostics.errors.push(`天空盒：${error.message}`);}
  }
  await setSkybox(attribute.skybox);
  const manager=new THREE.LoadingManager();manager.setURLModifier(url=>url.startsWith('blob:')||url.startsWith('data:')?url:asset(url));
  const loader=new GLTFLoader(manager),draco=new DRACOLoader();draco.setDecoderPath(new URL('./vendor/draco/',location.href).href);loader.setDRACOLoader(draco);
  const mixers=[],actions=new Map(),models=[];
  const effectMaterials=[];
  const entries=single?[{name:'设备模型',url:attribute.url,scale:attribute.scale,position:attribute.position}]:attribute.modelList||[];
  for(const entry of entries){
    try{
      loading.hidden=false;loading.textContent=`正在加载 ${entry.name}…`;
      const original=canonical(entry.url);loader.setResourcePath(original.slice(0,original.lastIndexOf('/')+1));
      const gltf=await loader.loadAsync(asset(entry.url),progress=>{if(progress.total)loading.textContent=`正在加载 ${entry.name} · ${Math.round(progress.loaded/progress.total*100)}%`;});
      const model=gltf.scene;model.name=entry.name;point(model.position,entry.position);point(model.scale,entry.scale,{x:1,y:1,z:1});point(model.rotation,entry.rotation);model.visible=!entry.hide;scene.add(model);models.push(model);
      const mixer=new THREE.AnimationMixer(model);mixers.push(mixer);
      for(const clip of gltf.animations){const action=mixer.clipAction(clip);actions.set(clip.name,action);actions.set(`${entry.name}_${clip.name}`,action);if(entry.animationsPlay&&(entry.selectAnimations||[]).some(name=>name===clip.name||name===`${entry.name}_${clip.name}`)){action.setEffectiveTimeScale(entry.timeScale||1);action.play();}}
      const bounds=new THREE.Box3().setFromObject(model);
      diagnostics.models.push({name:entry.name,loaded:true,animations:gltf.animations.map(clip=>clip.name),bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()}});
      if(single){const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());controls.target.copy(center);camera.position.copy(center).add(new THREE.Vector3(size.length()*.7,size.length()*.3,size.length()*.8));camera.near=Math.max(.01,size.length()/1000);camera.far=Math.max(3000,size.length()*20);camera.updateProjectionMatrix();controls.update();}
    }catch(error){diagnostics.models.push({name:entry.name,loaded:false});diagnostics.errors.push(`${entry.name}: ${error.message}`);notice(`${entry.name} 加载失败，请检查 source/assets.json`);}
  }
  for(const effect of attribute.shader||[]){
    if(!effect.show)continue;
    const options=effect.config.options||{};
    if(effect.type==='xray'){
      const material=new THREE.ShaderMaterial({
        uniforms:{uColor:{value:color(options.color)},uEdge:{value:color(options.edgeColor)},uOpacity:{value:options.baseOpacity??.15},uPower:{value:options.edgePower||1.5},uSpeed:{value:options.scanSpeed||1},uTime:{value:0}},
        vertexShader:'varying vec3 vNormal; varying vec3 vView; varying vec3 vWorld; void main(){ vec4 world=modelMatrix*vec4(position,1.0); vWorld=world.xyz; vNormal=normalize(normalMatrix*normal); vec4 view=modelViewMatrix*vec4(position,1.0); vView=-view.xyz; gl_Position=projectionMatrix*view; }',
        fragmentShader:'uniform vec3 uColor; uniform vec3 uEdge; uniform float uOpacity; uniform float uPower; uniform float uSpeed; uniform float uTime; varying vec3 vNormal; varying vec3 vView; varying vec3 vWorld; void main(){ float rim=pow(1.0-abs(dot(normalize(vNormal),normalize(vView))),uPower); float scan=pow(1.0-abs(fract(vWorld.y*.55-uTime*uSpeed*.12)*2.0-1.0),12.0); gl_FragColor=vec4(mix(uColor,uEdge,rim),min(.7,uOpacity+rim*.18+scan*.1)); }',
        transparent:true,depthWrite:false,side:THREE.DoubleSide,
      });
      effectMaterials.push(material);
      let matched=0;
      for(const name of options.groupNames||[])for(const model of models){const target=model.getObjectByName(name);if(!target)continue;matched++;target.traverse(object=>{if(!object.isMesh)return;object.material=material;object.renderOrder=1;const outline=new THREE.LineSegments(new THREE.EdgesGeometry(object.geometry,25),new THREE.LineBasicMaterial({color:color(options.edgeColor),transparent:true,opacity:.25}));object.add(outline);});}
      diagnostics.effects.push({type:effect.type,targets:options.groupNames.length,matched});
    }else if(effect.type==='wall'){
      const material=new THREE.ShaderMaterial({
        uniforms:{uColor:{value:color(options.baseColor)},uTime:{value:0}},
        vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
        fragmentShader:'uniform vec3 uColor;uniform float uTime;varying vec2 vUv;void main(){float stripe=pow(max(0.0,sin(vUv.y*60.0-uTime*3.0)),8.0);gl_FragColor=vec4(uColor,(1.0-vUv.y)*(.12+stripe*.2));}',
        transparent:true,depthWrite:false,side:THREE.DoubleSide,
      });effectMaterials.push(material);
      const wall=new THREE.Mesh(new THREE.BoxGeometry(options.width,options.height,options.length),material);point(wall.position,options.position);wall.position.y+=options.height/2;scene.add(wall);diagnostics.effects.push({type:'wall',loaded:true});
    }else diagnostics.effects.push({type:effect.type,loaded:false});
  }
  const labels=(attribute.css2D||[]).map(config=>{const label=document.createElement('button');label.className='model-label';label.textContent=config.label;Object.assign(label.style,{fontSize:px(config.fontSize||14),background:config.color,color:config.fontColor});label.onclick=()=>{const target=new THREE.Vector3();point(target,config.position);controls.target.copy(target);camera.position.copy(target).add(new THREE.Vector3(0,config.nearNum||3,(config.nearNum||3)*2));controls.update();};element.append(label);return{element:label,position:config.position};});
  function restore(){point(camera.position,c.cameraPosition||{x:15,y:15,z:15});point(controls.target,c.cameraLookAt);controls.autoRotate=false;controls.update();}
  function applyAction(config){
    const types=config.types||[config.type];
    if(types.includes('autoRotate'))controls.autoRotate=!controls.autoRotate;
    if(types.includes('restore'))restore();
    if(types.includes('changeCamera')||config.camera?.cameraPreview){point(camera.position,config.camera.changeCameraPosition);point(controls.target,config.camera.changeCameraLookAt);controls.update();}
    if(types.includes('playAnimation')){for(const name of config.animation.paly||[])actions.get(name)?.reset().play();for(const name of config.animation.stop||[])actions.get(name)?.stop();}
    if(types.some(type=>type==='robot'||type==='robotRoaming')){const position=config.robot?.position||{x:0,y:.5,z:0};point(camera.position,position);camera.position.y+=1.65;controls.target.copy(camera.position).add(new THREE.Vector3(0,0,-2));controls.update();canvas.focus();notice('已进入漫游视角，WASD 移动，拖动鼠标转向。');}
    if(types.includes('scenePreset')&&config.scenePreset){const preset=attribute.scenePresets?.find(item=>item.name===config.scenePreset);if(preset){setFog(preset.fog);setSkybox(preset.skybox);if(preset.lights?.length)setLights(preset.lights);}}
  }
  for(const config of attribute.bottons||[]){const button=document.createElement('button');button.className='scene-button';button.textContent=config.showText===false?'◈':config.name;Object.assign(button.style,{left:px(config.position.x),top:px(config.position.y),fontSize:px(config.textFontSize||20),fontWeight:config.textFontWeight||500,width:px((config.labelWidth||130)+60),height:px((config.fontSize||30)+25),color:config.textColor||config.color,borderColor:config.borderColor,background:config.backgroundColor});button.onclick=()=>applyAction(config);element.append(button);}
  if(attribute.tabsBtn?.show){const config=attribute.tabsBtn,tabs=document.createElement('div');tabs.className='scene-tabs';Object.assign(tabs.style,{left:px(config.x),top:px(config.y),width:px(config.width),height:px(config.height),fontSize:px(config.fontSize)});for(const tab of config.tabData){const button=document.createElement('button');button.textContent=tab.label;button.onclick=()=>{tabs.querySelectorAll('button').forEach(item=>item.classList.toggle('active',item===button));applyAction({...tab,types:tab.type});};tabs.append(button);}element.append(tabs);}
  const keys=new Set();canvas.addEventListener('keydown',event=>{keys.add(event.code);if(['KeyW','KeyA','KeyS','KeyD','Space'].includes(event.code))event.preventDefault();});canvas.addEventListener('keyup',event=>keys.delete(event.code));canvas.addEventListener('blur',()=>keys.clear());
  const raycaster=new THREE.Raycaster();canvas.addEventListener('dblclick',event=>{const rect=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1),camera);const hit=raycaster.intersectObjects(models,true)[0];if(hit){controls.target.copy(hit.point);controls.update();notice(`选中：${hit.object.name||'模型部件'}`);}});
  const viewer={scene,camera,controls,renderer,actions,models,resize(){const ratio=Math.min(devicePixelRatio||1,1.5),scale=Math.min(innerWidth/template.canvasStyle.width,innerHeight/template.canvasStyle.height),w=Math.max(16,Math.round(component.style.width*scale*ratio)),h=Math.max(16,Math.round(component.style.height*scale*ratio));renderer.setSize(w,h,false);camera.aspect=component.style.width/component.style.height;camera.updateProjectionMatrix();}};viewers.push(viewer);viewer.resize();
  let last=performance.now();
  function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.05);last=now;if(document.hidden)return;for(const material of effectMaterials)material.uniforms.uTime.value=now/1000;for(const mixer of mixers)mixer.update(dt);if(single&&models[0])models[0].rotation[attribute.rotation||'y']+=attribute.run||.001;if(keys.size){const direction=new THREE.Vector3();camera.getWorldDirection(direction);direction.y=0;direction.normalize();const side=new THREE.Vector3().crossVectors(direction,camera.up).normalize();const movement=new THREE.Vector3();movement.addScaledVector(direction,(Number(keys.has('KeyW'))-Number(keys.has('KeyS')))*dt*5);movement.addScaledVector(side,(Number(keys.has('KeyD'))-Number(keys.has('KeyA')))*dt*5);camera.position.add(movement);controls.target.add(movement);}controls.update();renderer.render(scene,camera);for(const label of labels){const v=new THREE.Vector3();point(v,label.position);v.project(camera);label.element.hidden=v.z>1||v.z<-1;label.element.style.left=px((v.x*.5+.5)*component.style.width);label.element.style.top=px((-.5*v.y+.5)*component.style.height);}}
  requestAnimationFrame(frame);
}

async function boot(){
  const responses=await Promise.all([fetch('./source/template.json'),fetch('./source/assets.json')]);
  for(const response of responses)if(!response.ok)throw new Error(`模板读取失败：HTTP ${response.status}`);
  [template,manifest]=await Promise.all(responses.map(response=>response.json()));
  document.title=`${template.name} · 本地复现`;
  const s=template.canvasStyle;Object.assign(stage.style,{width:px(s.width),height:px(s.height),background:s.backgroundColor||'#080e1b'});
  if(s.url&&manifest.entries[canonical(s.url)]){stage.style.backgroundImage=`url("${asset(s.url)}")`;stage.style.backgroundSize='100% 100%';}
  resize();const pending=[];
  for(const component of template.canvasData){
    const element=document.createElement('section');element.className='component';element.id=component.id;element.dataset.component=component.component;element.setAttribute('aria-label',component.label||component.component);styleComponent(element,component);element.hidden=!!component.hideSelf;stage.append(element);diagnostics.components.push({id:component.id,type:component.component});
    const type=component.component,p=component.propValue;
    try{
      if(type==='Three'||type==='Container3D')pending.push(renderThree(element,component));
      else if(['Picture','Picture2','DecorationPicture','decorationPicture'].includes(type)){element.classList.add('image');const img=document.createElement('img');img.src=asset(p.url);img.alt='';img.draggable=false;if(p.flip)img.style.transform=`scale(${p.flip.horizontal?-1:1},${p.flip.vertical?-1:1})`;element.append(img);}
      else if(type==='VText'||type==='VTextNew'){element.classList.add('text');const span=document.createElement('span');span.textContent=type==='VText'?p:p.data.text;element.append(span);}
      else if(type==='Time'){const update=()=>{const now=new Date(),pad=value=>String(value).padStart(2,'0');element.textContent=`星期${'日一二三四五六'[now.getDay()]}　${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}　${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;};update();setInterval(update,1000);}
      else if(type==='Decoration10')element.innerHTML='<div class="decoration-line"></div>';
      else if(type==='borderBox6'||type==='borderBox7')element.classList.add('border-box');
      else if(type==='Iframe'){const iframe=document.createElement('iframe');iframe.src=p.url;iframe.title='天气信息';iframe.loading='lazy';element.append(iframe);}
      else renderData(type,element,p);
    }catch(error){diagnostics.errors.push(`${type}: ${error.message}`);console.error(type,error);}
  }
  addEventListener('resize',resize);await Promise.all(pending);loading.hidden=true;
  window.__replica={template,diagnostics,viewers,charts,asset};
  document.documentElement.dataset.ready='true';
  if(diagnostics.models.some(model=>!model.loaded))notice('部分模型未加载成功，详见浏览器控制台。');
}
boot().catch(error=>{loading.hidden=false;loading.textContent=`加载失败：${error.message}`;diagnostics.errors.push(error.message);console.error(error);});
