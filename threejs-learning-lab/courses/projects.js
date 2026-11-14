// 综合练习从基础几何逐步组合；生成后展示给学生的是完整、可运行的模块。
function projectCode(body, { animate = '', camera = [9, 8, 11], target = [0, 0.8, 0] } = {}) {
  return `import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#101c2b');
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
camera.position.set(${camera.join(', ')});
const controls = new OrbitControls(camera, canvas);
controls.target.set(${target.join(', ')});
controls.enableDamping = true;
scene.add(new THREE.HemisphereLight('#e3f7ff', '#475569', 2.1));
const light = new THREE.DirectionalLight('#fff4dc', 3);
light.position.set(4, 10, 6);
light.castShadow = true;
light.shadow.mapSize.set(1024, 1024);
Object.assign(light.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 });
scene.add(light);
const overlay = document.querySelector('#overlay');
overlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;font:13px/1.7 system-ui;color:#e5edf7;background:transparent;padding:0;max-width:none;border-radius:0';

// 小工具仍是普通 Three.js：几何 + 材质 + 网格。
function box(w, h, d, color, x = 0, y = h / 2, z = 0) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}
function label(text, x, y, z, color = '#c8fbef') {
  const image = document.createElement('canvas');
  image.width = 512; image.height = 100;
  const ctx = image.getContext('2d');
  ctx.fillStyle = '#142b3e'; ctx.fillRect(0, 0, 512, 100);
  ctx.font = 'bold 38px sans-serif'; ctx.textAlign = 'center';
  ctx.fillStyle = color; ctx.fillText(text, 256, 64);
  const texture = new THREE.CanvasTexture(image);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }));
  sprite.position.set(x, y, z); sprite.scale.set(2.6, 0.51, 1);
  scene.add(sprite);
  return sprite;
}
function panel(html) {
  const element = document.createElement('section');
  element.style.cssText = 'position:absolute;left:16px;top:16px;max-width:260px;padding:12px 16px;background:#10283ee8;border:1px solid #33566d;border-radius:12px';
  element.innerHTML = html;
  overlay.append(element);
  return element;
}

${body.trim()}

let previousTime = 0;
renderer.setAnimationLoop((milliseconds) => {
  const time = milliseconds / 1000;
  const delta = Math.min(time - previousTime, 0.05);
  previousTime = time;
  ${animate || '// 当前阶段的模型保持静止；鼠标可旋转观察。'}
  if (controls.enabled) controls.update();
  renderer.render(scene, camera);
});
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`;
}

function factory(stage) {
  return projectCode(`
const machineCount = 4;
const floor = box(13, 0.15, 9, '#486371', 0, -0.08, 0);
box(13, 2.8, 0.15, '#8aaeb7', 0, 1.4, -4.5);
box(0.15, 2.8, 9, '#6b939e', -6.5, 1.4, 0);
const grid = new THREE.GridHelper(12, 12, '#60c5c2', '#617c88');
grid.position.y = 0.01; scene.add(grid);
// 用 Group 将罐体、底座和管道组织成一台设备。
const machines = [];
for (let i = 0; i < machineCount; i++) {
  const machine = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.7, 1.7, 32),
    new THREE.MeshStandardMaterial({ color: '#d5e7eb', metalness: ${stage >= 2 ? '0.75' : '0.05'}, roughness: ${stage >= 2 ? '0.26' : '0.7'} })
  );
  body.position.y = 1.25; body.castShadow = true; machine.add(body);
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.4, 1.8),
    new THREE.MeshStandardMaterial({ color: '#22485c' }));
  base.position.y = 0.2; base.receiveShadow = true; machine.add(base);
  machine.position.set((i % 2) * 4 - 2, 0, Math.floor(i / 2) * 3.8 - 2);
  machine.userData.name = '反应罐 ' + (i + 1);
  scene.add(machine); machines.push(machine);
}
${stage >= 2 ? `
// 同一纹理可以被多个网格共用；墙体仍使用纯色材质。
const tiles = new THREE.TextureLoader().load('assets/checker.svg');
tiles.colorSpace = THREE.SRGBColorSpace;
tiles.wrapS = tiles.wrapT = THREE.RepeatWrapping;
tiles.repeat.set(6, 4);
floor.material.map = tiles; floor.material.needsUpdate = true;
const pipeMaterial = new THREE.MeshStandardMaterial({ color: '#4ce3cb', metalness: 0.4, roughness: 0.35 });
for (const x of [-2, 2]) {
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 4, 12), pipeMaterial);
  pipe.rotation.x = Math.PI / 2; pipe.position.set(x, 2.1, 0); scene.add(pipe);
}` : ''}
${stage >= 3 ? `
const maintenanceIndex = 2;
machines.forEach((machine, index) => {
  const maintenance = index === maintenanceIndex;
  machine.children[0].material.color.set(maintenance ? '#ffb45d' : '#c4e7ec');
  label(machine.userData.name + (maintenance ? ' · 待维护' : ' · 运行'),
    machine.position.x, 2.9, machine.position.z, maintenance ? '#ffd39c' : '#9af0d3');
});
panel('<b>教学车间 · 状态示例</b><br>绿色标签：运行<br>橙色标签：待维护<br><small>状态为本地教学数据</small>');` : `
panel('<b>车间搭建 · 第 ${stage} 阶段</b><br>拖动鼠标观察设备与空间布局');`}
`, { camera: [10, 9, 12], target: [0, 0.8, 0] });
}

function production(stage) {
  return projectCode(`
box(14, 0.2, 8, '#3b5264', 0, -0.1, 0);
box(11, 0.2, 1.65, '#243848', 0, 0.95, 0);
// 滚筒的轴沿 z 方向，货箱沿 x 方向移动。
for (let x = -5; x <= 5; x += 0.5) {
  const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.6, 12),
    new THREE.MeshStandardMaterial({ color: '#97b8c7', metalness: 0.7, roughness: 0.3 }));
  roller.rotation.x = Math.PI / 2; roller.position.set(x, 1.12, 0); scene.add(roller);
}
for (const x of [-4.6, 0, 4.6]) {
  box(0.2, 0.9, 0.2, '#748b99', x, 0.45, -0.55);
  box(0.2, 0.9, 0.2, '#748b99', x, 0.45, 0.55);
}
box(0.25, 3, 0.25, '#58d5c4', 1.5, 1.5, -1.2);
box(0.25, 3, 0.25, '#58d5c4', 1.5, 1.5, 1.2);
box(0.25, 0.25, 2.65, '#58d5c4', 1.5, 3, 0);
const packages = [];
for (let i = 0; i < 4; i++) {
  const parcel = box(0.9, 0.8, 0.9, i % 2 ? '#ffa657' : '#4acbb8', i * 2.5 - 4, 1.65, 0);
  packages.push(parcel);
}
const speed = 1.4;
let running = ${stage >= 2 ? 'true' : 'false'};
${stage >= 3 ? `
const dashboard = panel('<b>产线控制 · 教学模拟</b><br><span id="line-status">运行中</span><br>' +
  '<button id="start">启动</button> <button id="stop">停止</button> <button id="reset">复位</button>');
dashboard.querySelectorAll('button').forEach(button => {
  button.style.cssText = 'pointer-events:auto;cursor:pointer;border:0;border-radius:6px;padding:6px 10px;margin-top:8px;background:#b5f4df;color:#173b39';
});
function setRunning(value) {
  running = value;
  dashboard.querySelector('#line-status').textContent = value ? '运行中' : '已停止';
}
dashboard.querySelector('#start').onclick = () => setRunning(true);
dashboard.querySelector('#stop').onclick = () => setRunning(false);
dashboard.querySelector('#reset').onclick = () => {
  setRunning(false);
  packages.forEach((parcel, index) => parcel.position.x = index * 2.5 - 4);
};` : `
panel('<b>输送产线 · 第 ${stage} 阶段</b><br>${stage === 1 ? '先完成空间布局，再加入动画' : '货箱沿 x 轴移动；末端循环回到起点'}');`}
`, {
    camera: [10, 7, 10],
    animate: stage >= 2 ? `if (running) {
    for (const parcel of packages) {
      parcel.position.x += speed * delta;
      if (parcel.position.x > 5) parcel.position.x = -5;
    }
  }` : '',
  });
}

function exhibition(stage) {
  return projectCode(`
box(12, 0.2, 12, '#d2e3d8', 0, -0.1, 0);
box(12, 3.6, 0.2, '#548979', 0, 1.8, -6);
box(0.2, 3.6, 12, '#548979', -6, 1.8, 0);
box(0.2, 3.6, 12, '#7cac95', 6, 1.8, 0);
const exhibits = [];
const shapes = [new THREE.SphereGeometry(0.7, 32, 20),
  new THREE.TorusKnotGeometry(0.45, 0.15, 80, 12), new THREE.IcosahedronGeometry(0.75)];
for (let i = 0; i < 3; i++) {
  const x = (i - 1) * 3.4;
  box(1.8, 0.7, 1.8, '#244a42', x, 0.35, -1);
  const sculpture = new THREE.Mesh(shapes[i],
    new THREE.MeshStandardMaterial({ color: ['#9ae4b9', '#e1c778', '#66c9ce'][i], roughness: 0.3, metalness: 0.25 }));
  sculpture.position.set(x, 1.65, -1); sculpture.castShadow = true;
  scene.add(sculpture); exhibits.push(sculpture);
}
label('GREEN EXHIBITION', 0, 3.2, -5.8);
${stage >= 2 ? `
// 用 Canvas 画一张自己的展板图，再把它作为纹理贴到平面。
const board = document.createElement('canvas'); board.width = 512; board.height = 256;
const ctx = board.getContext('2d');
ctx.fillStyle = '#143e34'; ctx.fillRect(0, 0, 512, 256);
ctx.fillStyle = '#b9f6c8'; ctx.font = 'bold 42px sans-serif'; ctx.fillText('绿色未来', 34, 70);
ctx.font = '25px sans-serif'; ctx.fillText('减碳 · 循环 · 可持续', 34, 122);
ctx.fillStyle = '#56c59a';
for (let i = 0; i < 5; i++) ctx.fillRect(35 + i * 88, 210 - i * 17, 50, 20 + i * 17);
const posterTexture = new THREE.CanvasTexture(board); posterTexture.colorSpace = THREE.SRGBColorSpace;
const poster = new THREE.Mesh(new THREE.PlaneGeometry(4, 2),
  new THREE.MeshBasicMaterial({ map: posterTexture }));
poster.position.set(0, 1.8, -5.85); scene.add(poster);` : ''}
${stage >= 3 ? `
// 这是受房间边界约束的基础漫游；没有物理碰撞和重力系统。
controls.enabled = false;
camera.position.set(0, 1.7, 4.8); camera.lookAt(0, 1.7, -2);
const keys = new Set();
window.addEventListener('keydown', event => {
  if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
    event.preventDefault(); keys.add(event.code);
  }
});
window.addEventListener('keyup', event => keys.delete(event.code));
window.addEventListener('blur', () => keys.clear());
let heading = 0;
const walkSpeed = 2.5;
panel('<b>展厅漫游</b><br>先点击画面，再使用 W/A/S/D 移动<br>← / → 转向<br><small>基础版：只限制房间外边界，展台没有碰撞</small>');` : `
panel('<b>绿色展厅 · 第 ${stage} 阶段</b><br>鼠标拖动观察，滚轮调整距离');`}
`, {
    camera: [10, 8, 13], target: [0, 1, -1],
    animate: stage >= 3 ? `const turn = Number(keys.has('ArrowLeft')) - Number(keys.has('ArrowRight'));
  heading += turn * delta * 1.7;
  const forward = Number(keys.has('KeyW')) - Number(keys.has('KeyS'));
  const side = Number(keys.has('KeyD')) - Number(keys.has('KeyA'));
  const distance = walkSpeed * delta / Math.max(1, Math.hypot(forward, side));
  camera.position.x += (-Math.sin(heading) * forward + Math.cos(heading) * side) * distance;
  camera.position.z += (-Math.cos(heading) * forward - Math.sin(heading) * side) * distance;
  camera.position.x = THREE.MathUtils.clamp(camera.position.x, -5.4, 5.4);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, -5.4, 5.4);
  camera.lookAt(camera.position.x - Math.sin(heading), 1.7, camera.position.z - Math.cos(heading));` : '',
  });
}

function equipment(stage) {
  return projectCode(`
box(11, 0.2, 7, '#3a5366', 0, -0.1, 0);
const devices = [];
const deviceCount = 3;
for (let i = 0; i < deviceCount; i++) {
  const x = (i - 1) * 3;
  box(2.3, 0.25, 2.3, '#26465a', x, 0.13, 0);
  const device = box(1.65, 2.3, 1.4, '#77b6c3', x, 1.4, 0);
  device.userData = { name: '冷却设备 ' + (i + 1), temperature: 36 + i * 7, running: i !== 2 };
  devices.push(device);
  for (let slot = 0; slot < 5; slot++) box(1.1, 0.07, 0.04, '#153344', x, 0.8 + slot * 0.25, 0.72);
  const indicator = box(0.25, 0.15, 0.05, '#9df3c8', x + 0.45, 2.25, 0.73);
  device.userData.indicator = indicator;
  label('设备 ' + (i + 1), x, 3.15, 0);
}
${stage >= 2 ? `
// 鼠标坐标必须换算成当前 canvas 的标准化设备坐标。
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selected = null;
const dashboard = panel('<b>设备巡检</b><br><span id="device-info">点击设备主体查看信息</span>${stage >= 3 ? '<br><button id="toggle" disabled>切换运行状态</button>' : ''}');
function updateInfo() {
  if (!selected) return;
  const data = selected.userData;
  dashboard.querySelector('#device-info').textContent =
    data.name + ' · ' + data.temperature + '℃ · ' + (data.running ? '运行' : '停机');
  ${stage >= 3 ? `dashboard.querySelector('#toggle').disabled = false;` : ''}
}
canvas.addEventListener('pointerdown', event => {
  const rect = canvas.getBoundingClientRect();
  pointer.set((event.clientX - rect.left) / rect.width * 2 - 1,
    -(event.clientY - rect.top) / rect.height * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(devices, false)[0];
  if (!hit) return;
  if (selected) selected.material.emissive.set('#000000');
  selected = hit.object; selected.material.emissive.set('#174b52');
  updateInfo();
});` : `
panel('<b>设备运维 · 第 1 阶段</b><br>把设备外壳、底座、散热槽组合起来<br>' +
  devices.map(device => device.userData.name + '：' + device.userData.temperature + '℃').join('<br>') +
  '<br><small>温度为教学模拟数据</small>');`}
${stage >= 3 ? `
const warningTemperature = 45;
function updateIndicators() {
  devices.forEach(device => {
    const data = device.userData;
    data.indicator.material.color.set(!data.running ? '#94a3b8' :
      data.temperature > warningTemperature ? '#ffb45d' : '#9df3c8');
  });
}
updateIndicators();
const toggle = dashboard.querySelector('#toggle');
toggle.style.cssText = 'pointer-events:auto;cursor:pointer;border:0;border-radius:6px;padding:7px 12px;margin-top:8px;background:#b5f4df;color:#173b39';
toggle.onclick = () => {
  if (!selected) return;
  selected.userData.running = !selected.userData.running;
  updateIndicators(); updateInfo();
};
dashboard.insertAdjacentHTML('beforeend', '<br><small>绿：正常 · 橙：高温 · 灰：停机<br>温度与状态均为教学模拟数据</small>');` : ''}
`, { camera: [8, 6, 11], target: [0, 1.2, 0] });
}

function energy(stage) {
  return projectCode(`
box(13, 0.2, 9, '#284a59', 0, -0.1, 0);
box(2.4, 2, 2.2, '#64a9b6', -4, 1, 0);
box(2.4, 2.6, 2.2, '#78c9b6', 4, 1.3, 0);
box(2.3, 0.45, 2, '#88b3ce', 0, 0.45, -2.8);
const solar = box(2.3, 0.06, 1.8, '#194a77', 0, 0.95, -2.8);
solar.rotation.x = -0.3;
label('供能站', -4, 2.8, 0); label('用能楼', 4, 3.5, 0); label('光伏', 0, 1.8, -2.8);
${stage >= 2 ? `
const path = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-2.7, 0.7, 0), new THREE.Vector3(-1.5, 0.7, 1.8),
  new THREE.Vector3(1.5, 0.7, 1.8), new THREE.Vector3(2.7, 0.7, 0)
]);
const pipe = new THREE.Mesh(new THREE.TubeGeometry(path, 48, 0.09, 8, false),
  new THREE.MeshStandardMaterial({ color: '#2ea790', roughness: 0.3, metalness: 0.3 }));
scene.add(pipe);
const markers = [];
const markerCount = 8;
for (let i = 0; i < markerCount; i++) {
  const marker = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8),
    new THREE.MeshBasicMaterial({ color: '#baffd7' }));
  scene.add(marker); markers.push(marker);
}` : ''}
${stage >= 3 ? `
const dashboard = panel('<b>能源看板 · 教学模拟数据</b><br><span id="power"></span><br>' +
  '<span id="solar"></span><div style="height:8px;background:#284e62;border-radius:8px;margin-top:8px">' +
  '<div id="bar" style="height:100%;background:#78e5bb;border-radius:8px"></div></div>' +
  '<small>绿色条表示光伏占比；数据按时间生成</small>');
let lastUpdate = -1;
const basePower = 120;` : `
panel('<b>智慧能源 · 第 ${stage} 阶段</b><br>${stage === 1 ? '场景：供能站、光伏板、用能楼' : '流动点沿曲线移动，表示能量传递方向'}');`}
`, {
    camera: [10, 9, 12],
    animate: stage >= 2 ? `markers.forEach((marker, index) => {
    const progress = (time * 0.12 + index / markers.length) % 1;
    marker.position.copy(path.getPointAt(progress));
  });
  ${stage >= 3 ? `// DOM 每 0.25 秒更新一次，无需每帧重写文本。
  if (time - lastUpdate > 0.25) {
    lastUpdate = time;
    const power = basePower + Math.sin(time * 0.6) * 18;
    const solarPower = 40 + Math.sin(time * 0.35) * 10;
    const ratio = solarPower / power * 100;
    dashboard.querySelector('#power').textContent = '总功率 ' + power.toFixed(1) + ' kW';
    dashboard.querySelector('#solar').textContent = '光伏 ' + solarPower.toFixed(1) + ' kW · 占比 ' + ratio.toFixed(0) + '%';
    dashboard.querySelector('#bar').style.width = ratio + '%';
  }` : ''}` : '',
  });
}

function lesson(data, code, change) {
  return { level: '综合', minutes: 18, ...data, code, solutionCode: change ? code.replace(change[0], change[1]) : code };
}

const projects = [
  lesson({
    id: 'factory-layout', title: '车间 ① · 用几何搭建设备布局', chapter: '综合 · 制药车间', project: 'factory',
    summary: '把圆柱罐、底座、墙面组合成一个可观察的小车间。',
    goals: ['用 Group 表示一台设备', '用循环排列多台设备', '根据坐标规划车间布局'],
    explanation: ['先把复杂设备简化成圆柱体和方块。理解组成关系以后，再考虑导入真实模型。', '设备内部的位置相对于 Group；移动 Group 就能一起移动罐体与底座。网格辅助线用来观察间距。新增设备时，还要检查底座是否完整落在地面范围内。'],
    exercise: { task: '把车间从 4 台设备扩展为 6 台，保留每行两台，并扩展地面和墙体容纳它们。', hint: 'machineCount 改为 6；新增一行的底座最远到 z=6.5，因此地面和左墙的深度改为 13，后墙移到 z=-6.5。', solution: '将 machineCount 改为 6。把地面与左墙的深度从 9 改为 13，并把后墙从 z=-4.5 移到 -6.5。这样地面覆盖 z=-6.5 到 6.5，六台设备的底座都在地面之内。参考代码同时完成这些修改。' },
    focus: 'machineCount',
  }, factory(1), ['const machineCount = 4;', 'const machineCount = 6;']),
  lesson({
    id: 'factory-materials', title: '车间 ② · 金属设备与重复地砖', chapter: '综合 · 制药车间', project: 'factory',
    summary: '保留原有布局，给罐体设置金属材质，给地面贴上自带纹理。',
    goals: ['区分 metalness 与 roughness', '设置颜色纹理的色彩空间', '使用 RepeatWrapping 和 repeat'],
    explanation: ['金属感需要材质与光照共同作用。这里用方向光和半球光观察 roughness 变化，没有引入环境贴图。', '地面纹理来自本课程 assets/checker.svg。repeat 决定重复次数，两个方向都需要开启 RepeatWrapping。'],
    exercise: { task: '让地砖在两个方向都显示 8 次重复。', hint: '找到 tiles.repeat.set；第一个数是水平方向，第二个数是竖直方向。', solution: '把 tiles.repeat.set(6, 4) 改为 tiles.repeat.set(8, 8)。地面尺寸不变，单块纹理看起来会更小。' },
    focus: 'tiles.repeat.set',
  }, factory(2), ['tiles.repeat.set(6, 4);', 'tiles.repeat.set(8, 8);']),
  lesson({
    id: 'factory-status', title: '车间 ③ · 给设备加名称和状态', chapter: '综合 · 制药车间', project: 'factory',
    summary: '在材质与布局之上，用标签和颜色表达维护状态。',
    goals: ['把业务名称保存在 userData', '使用 CanvasTexture 制作文字标签', '让状态与颜色保持一致'],
    explanation: ['label 函数在 Canvas 上画文字，再把 CanvasTexture 交给 Sprite。它是普通 Three.js 代码，可复制到自己的项目。', 'maintenanceIndex 是零起始下标；2 指第三台设备。状态为教学示例数据，没有连接实际设备。'],
    exercise: { task: '把“待维护”状态从第三台设备移到第一台设备。', hint: '找到 maintenanceIndex；数组的第一个元素下标为 0。', solution: '把 maintenanceIndex 改为 0。运行后第一台设备的材质和标签都变成橙色，其余设备恢复正常显示。' },
    focus: 'maintenanceIndex',
  }, factory(3), ['const maintenanceIndex = 2;', 'const maintenanceIndex = 0;']),
  lesson({
    id: 'production-layout', title: '产线 ① · 搭建滚筒输送机', chapter: '综合 · 工业控制', project: 'production',
    summary: '用方块、圆柱和循环创建传送带、支腿与检测门。',
    goals: ['理解圆柱默认的轴向', '利用循环生成重复结构', '确定货箱的初始位置'],
    explanation: ['圆柱默认沿 y 轴延伸。将滚筒绕 x 轴旋转 Math.PI / 2，就能让轴朝向 z 方向。', '这一阶段先保持货箱静止，便于检查高度、尺寸和间距。后续课程保留这些几何，增加运动与控制。'],
    exercise: { task: '把初始显示的货箱从 4 个改为 3 个。', hint: '只修改创建 packages 的循环，不要改滚筒循环。', solution: '将货箱循环中的 i < 4 改为 i < 3。数组只会保留三个网格，后面的动画会自动遍历现有货箱。' },
    focus: 'const packages',
  }, production(1), ['for (let i = 0; i < 4; i++)', 'for (let i = 0; i < 3; i++)']),
  lesson({
    id: 'production-motion', title: '产线 ② · 让货箱沿输送带移动', chapter: '综合 · 工业控制', project: 'production',
    summary: '给现有场景加入基于时间的位移和循环返回。',
    goals: ['用 delta 表示帧间隔', '区分每秒速度与每帧位移', '处理运动范围的边界'],
    explanation: ['位移等于 speed 乘 delta。不同刷新率的屏幕也能获得接近的每秒运动距离。', '货箱越过 x=5 时回到 x=-5，这是教学中的循环输送效果，并非真实物理运输仿真。'],
    exercise: { task: '让输送速度降低为每秒 0.7 个单位。', hint: '找到 speed，保持 position.x += speed * delta 不变。', solution: '把 speed 从 1.4 改为 0.7。速度减半，跨越输送带所需时间大约加倍。' },
    focus: 'const speed',
  }, production(2), ['const speed = 1.4;', 'const speed = 0.7;']),
  lesson({
    id: 'production-controls', title: '产线 ③ · 实现启动、停止和复位', chapter: '综合 · 工业控制', project: 'production',
    summary: '用普通网页按钮控制 Three.js 动画中的运行状态。',
    goals: ['通过布尔值控制动画', '把按钮事件连接到场景状态', '区分停止与复位'],
    explanation: ['按钮不直接操作渲染器，而是修改 running。动画每帧检查这个状态，决定是否更新货箱位置。', '停止会保留当前位置；复位还会把每个货箱放回初始位置。它们都不会终止渲染循环，所以鼠标仍能观察场景。'],
    exercise: { task: '让产线打开时保持停止，点击“启动”后才开始运行。', hint: '修改 running 的初始值，并让初始状态文字与它一致。', solution: '将 let running = true 改成 false，再把初始文案“运行中”改为“已停止”。参考代码同时完成这两处修改。' },
    focus: 'let running',
  }, production(3), null),
  lesson({
    id: 'exhibition-space', title: '展厅 ① · 墙面、展台和展品', chapter: '综合 · 绿色展厅', project: 'exhibition',
    summary: '用基础几何搭建开放式展厅，并安排三个造型不同的展品。',
    goals: ['规划房间与观察方向', '组合展台与展品', '比较球体、环面结和多面体'],
    explanation: ['为了便于从外部观察，这个展厅保留了前方开口。房间尺寸、墙面高度和展品间距都能从代码直接修改。', '展品由几何体产生，整个例子不需要下载大型工业模型。后续可以用 GLTFLoader 替换其中某个展品。'],
    exercise: { task: '把球形展品改成半径 0.9 的球。', hint: '在 shapes 数组中找到 SphereGeometry，第一个参数是半径。', solution: '把 SphereGeometry(0.7, 32, 20) 改为 SphereGeometry(0.9, 32, 20)。必要时再增加展品的 y 坐标，避免穿入展台。' },
    focus: 'const shapes',
  }, exhibition(1), ['new THREE.SphereGeometry(0.7, 32, 20)', 'new THREE.SphereGeometry(0.9, 32, 20)']),
  lesson({
    id: 'exhibition-posters', title: '展厅 ② · 自己绘制一张展板纹理', chapter: '综合 · 绿色展厅', project: 'exhibition',
    summary: '在 Canvas 上画标题、文字和图形，再将其贴到展厅后墙。',
    goals: ['生成不依赖图片文件的纹理', '匹配平面与图片的宽高比', '区分画布像素与三维尺寸'],
    explanation: ['Canvas 的 512×256 是像素尺寸，PlaneGeometry 的 4×2 是三维尺寸。它们保持相同宽高比，文字就不会被拉伸。', '这张海报完全由课程代码生成；修改文字后重新运行，即可得到一张新纹理。'],
    exercise: { task: '把展板标题改成“我的第一座展厅”。', hint: '找到 ctx.fillText 中的“绿色未来”，只修改文字字符串。', solution: '将“绿色未来”替换为“我的第一座展厅”。文字变长时可以把标题字体从 42px 调小，或者增大画布宽度并匹配平面比例。' },
    focus: '绿色未来',
  }, exhibition(2), ["ctx.fillText('绿色未来', 34, 70);", "ctx.fillText('我的第一座展厅', 34, 70);"]),
  lesson({
    id: 'exhibition-walk', title: '展厅 ③ · 键盘漫游与房间边界', chapter: '综合 · 绿色展厅', project: 'exhibition',
    summary: '在同一展厅中加入 W/A/S/D 移动和方向键转向。',
    goals: ['记录按键状态', '按朝向计算水平位移', '限制相机的移动范围'],
    explanation: ['先点击预览画面，使键盘事件进入当前练习。W/S 前后移动，A/D 左右移动，方向键左右转向。', '这节用数值范围限制房间外边界，没有重力、人物模型和展台碰撞。复杂漫游还需要进一步学习碰撞检测与角色控制。'],
    exercise: { task: '把漫游速度从每秒 2.5 个单位调为 1.5。', hint: '找到 walkSpeed；不要改变 delta，否则动画会受到影响。', solution: '把 walkSpeed 改为 1.5。斜向移动经过归一化处理，因此不会比单方向移动更快。' },
    focus: 'walkSpeed',
  }, exhibition(3), ['const walkSpeed = 2.5;', 'const walkSpeed = 1.5;']),
  lesson({
    id: 'equipment-build', title: '运维 ① · 组合设备与业务信息', chapter: '综合 · 设备运维', project: 'equipment',
    summary: '用网格制作设备外观，并在 userData 中保存设备信息。',
    goals: ['区分设备主体与装饰网格', '存储名称、温度与运行状态', '用数据生成重复场景'],
    explanation: ['设备包含外壳、底座、散热槽和指示灯。devices 数组只保存可被选中的设备主体，避免下一课误选装饰件。', 'userData 可以保存自己的业务字段。本节温度是本地教学数据，不代表真实传感器读数。'],
    exercise: { task: '将三台设备的基础温度提高 5℃，观察面板中的读数。', hint: '找到 temperature: 36 + i * 7；只修改基础值。', solution: '把基础温度 36 改成 41。三台设备的温度变为 41℃、48℃、55℃，每台设备之间仍相差 7℃。面板从 userData 读取这些数据。' },
    focus: 'device.userData',
  }, equipment(1), ['temperature: 36 + i * 7', 'temperature: 41 + i * 7']),
  lesson({
    id: 'equipment-pick', title: '运维 ② · 点击设备显示信息', chapter: '综合 · 设备运维', project: 'equipment',
    summary: '用 Raycaster 在三维场景中识别点击目标，并更新网页信息。',
    goals: ['换算鼠标的标准化坐标', '使用射线选中设备', '同步高亮与详情文字'],
    explanation: ['Raycaster 需要的坐标范围是 -1 到 1，并且 y 轴朝上。使用 canvas 的实际矩形换算，可以适应不同预览尺寸。', '选中后通过 emissive 增加高亮，并从同一网格的 userData 读取详情。点击空白处不会改变当前选择。'],
    exercise: { task: '将选中设备的高亮颜色改为暖橙色。', hint: '找到 selected.material.emissive.set 的非黑色值。', solution: '把 #174b52 换成 #6b3515。emissive 是材质的自发光颜色，原来的主体颜色仍然保留。' },
    focus: 'raycaster.setFromCamera',
  }, equipment(2), ["selected.material.emissive.set('#174b52');", "selected.material.emissive.set('#6b3515');"]),
  lesson({
    id: 'equipment-status', title: '运维 ③ · 状态按钮与温度告警', chapter: '综合 · 设备运维', project: 'equipment',
    summary: '把设备数据、状态指示灯和按钮操作组织成一个小运维页面。',
    goals: ['根据阈值确定告警颜色', '操作当前选中设备', '让数据、指示灯和面板保持同步'],
    explanation: ['先点击设备主体，再点击“切换运行状态”。按钮修改数据后，同时刷新指示灯和详情文字。', '判断顺序很重要：停机时显示灰色；运行且高于阈值显示橙色；其他运行设备显示绿色。'],
    exercise: { task: '把高温告警阈值从 45℃ 调为 40℃，观察第二台运行设备的指示灯。', hint: '找到 warningTemperature；当前第二台设备的温度是 43℃。', solution: '把 warningTemperature 改为 40。第二台设备由正常转为高温告警；第三台因为停机，仍显示灰色。' },
    focus: 'warningTemperature',
  }, equipment(3), ['const warningTemperature = 45;', 'const warningTemperature = 40;']),
  lesson({
    id: 'energy-layout', title: '能源 ① · 搭建供能、光伏与用能场景', chapter: '综合 · 智慧能源', project: 'energy',
    summary: '先用简单体块表达系统关系，再考虑设备细节。',
    goals: ['用空间位置区分业务角色', '让标签与设备一一对应', '用旋转表达光伏板倾角'],
    explanation: ['场景从左到右分别是供能站和用能楼，后方是光伏板。名称标签帮助观察者理解空间中的角色。', '这个阶段先不接数据，也不做流动效果。确认构图清楚以后，再增加管线和看板。'],
    exercise: { task: '把光伏板倾角由 -0.3 弧度改为 -0.6 弧度，并提高板面，避免穿过支座。', hint: '修改 solar.rotation.x 后，将 solar.position.y 设为 1.25。旋转使用弧度，位置使用场景单位。', solution: '把 solar.rotation.x 设为 -0.6，再把 solar.position.y 设为 1.25。倾斜后的板面最低处约为 0.72，高于支座顶面 0.675；只改变倾角而不抬高，会穿入支座。' },
    focus: 'solar.rotation.x',
  }, energy(1), ['solar.rotation.x = -0.3;', 'solar.rotation.x = -0.6;\nsolar.position.y = 1.25;']),
  lesson({
    id: 'energy-flow', title: '能源 ② · 沿曲线移动的能量点', chapter: '综合 · 智慧能源', project: 'energy',
    summary: '利用同一条曲线生成管道，并计算流动点的位置。',
    goals: ['创建 CatmullRomCurve3 曲线', '用 TubeGeometry 生成管道', '沿曲线的长度方向移动物体'],
    explanation: ['管道与流动点共用 path。这样修改控制点之后，管道形状和动画路径会一起变化。', 'getPointAt 使用沿曲线长度分布的参数。多个点通过 index / markers.length 错开位置，形成连续的方向提示。'],
    exercise: { task: '把管道上的流动点从 8 个增加到 12 个。', hint: '修改 markerCount；动画中的错位间距会根据数组长度自动调整。', solution: '把 markerCount 改为 12。点的数量增加，但管道形状、运动速度和整体方向不变。' },
    focus: 'markerCount',
  }, energy(2), ['const markerCount = 8;', 'const markerCount = 12;']),
  lesson({
    id: 'energy-dashboard', title: '能源 ③ · 场景与模拟数据看板', chapter: '综合 · 智慧能源', project: 'energy',
    summary: '组合场景、流动效果、功率数据和占比条，完成综合作品。',
    goals: ['明确区分模拟数据与真实数据', '计算光伏功率占比', '控制网页面板的更新频率'],
    explanation: ['这里按时间生成教学模拟数据，不会请求任何远程接口。学习重点是把计算结果同步到面板和进度条。', '三维动画持续渲染，网页数据每 0.25 秒更新一次。界面更新与图形渲染可以使用不同频率。'],
    exercise: { task: '把基础总功率从 120 kW 改为 150 kW，比较光伏占比变化。', hint: '找到 basePower，保持光伏功率的计算不变。', solution: '把 basePower 改为 150。对同一模拟时刻，光伏功率不变而总功率增加，因此光伏占比和绿色条的宽度会降低。' },
    focus: 'basePower',
  }, energy(3), ['const basePower = 120;', 'const basePower = 150;']),
];

// 扩展设备数量时也扩展空间，确保最后一排的底座仍落在地面上。
const layoutLesson = projects.find(item => item.id === 'factory-layout');
layoutLesson.solutionCode = layoutLesson.solutionCode
  .replace("box(13, 0.15, 9, '#486371'", "box(13, 0.15, 13, '#486371'")
  .replace("box(13, 2.8, 0.15, '#8aaeb7', 0, 1.4, -4.5)", "box(13, 2.8, 0.15, '#8aaeb7', 0, 1.4, -6.5)")
  .replace("box(0.15, 2.8, 9, '#6b939e'", "box(0.15, 2.8, 13, '#6b939e'");

// 这道任务要同步修改状态变量和初始文字，避免界面与逻辑不一致。
const controlsLesson = projects.find(item => item.id === 'production-controls');
controlsLesson.solutionCode = controlsLesson.code
  .replace('let running = true;', 'let running = false;')
  .replace('<span id="line-status">运行中</span>', '<span id="line-status">已停止</span>');

function challengeStarter(tasks) {
  return `import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#101c2b');
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
camera.position.set(9, 8, 11);
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 1, 0);
controls.enableDamping = true;
scene.add(new THREE.HemisphereLight('#e3f7ff', '#475569', 2));
const light = new THREE.DirectionalLight('#fff4dc', 3);
light.position.set(4, 10, 6);
scene.add(light);
scene.add(new THREE.GridHelper(20, 20, '#4b948f', '#29434e'));

${tasks.map((task, index) => '// TODO ' + (index + 1) + '：' + task).join('\n')}

let previousTime = 0;
renderer.setAnimationLoop(milliseconds => {
  const time = milliseconds / 1000;
  const delta = Math.min(time - previousTime, 0.05);
  previousTime = time;
  // TODO：需要动画时，在这里根据 time 或 delta 更新自己的对象。
  if (controls.enabled) controls.update();
  renderer.render(scene, camera);
});
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`;
}

const challenges = {
  'factory-status': {
    brief: '独立挑战：从空白场景搭建一个有四台设备的小车间，用地砖、金属材质、名称标签和维护状态表达车间信息。',
    steps: ['创建地面和两面墙，确定四台设备的摆放范围。', '用 Group、圆柱罐和方形底座制作设备，排列成两行两列。', '为地面设置重复纹理，并调整罐体的 metalness 与 roughness。', '用 userData 保存设备名称与状态，用 CanvasTexture 和 Sprite 显示文字标签。', '把其中一台标记为待维护，让设备颜色和标签同时表达这个状态。'],
    criteria: ['四台设备及其底座均落在地面内，鼠标旋转后仍能看清布局。', '地面有重复纹理，罐体使用可观察到光照变化的材质。', '四台设备分别有名称，标签与设备位置对应。', '待维护设备的名称、颜色和状态一致，其他设备显示正常状态。'],
  },
  'production-controls': {
    brief: '独立挑战：从空白场景制作滚筒输送线，让多个货箱循环移动，并用启动、停止和复位按钮控制它们。',
    steps: ['用方块和圆柱搭建输送机、滚筒与支腿。', '用数组保存至少三个货箱，为每个货箱设置初始位置。', '在动画循环中使用 speed * delta 移动货箱，超出末端后返回起点。', '在 overlay 内创建三个按钮，用 running 状态决定是否更新位置。', '实现复位：停止运动，将所有货箱放回起始位置，并同步状态文字。'],
    criteria: ['至少三个货箱沿同一个输送方向移动，并能循环回到起点。', '点击停止后货箱保持当前位置，点击启动后继续移动。', '点击复位后货箱回到原来的排列位置，状态显示已停止。', '停止货箱后仍可旋转观察场景，按钮文字与实际运行状态一致。'],
  },
  'exhibition-walk': {
    brief: '独立挑战：从空白场景创建三件展品的绿色展厅，自己绘制展板，并实现受房间边界约束的键盘漫游。',
    steps: ['用地面和墙面确定房间边界，给入口保留开口。', '搭建三个展台，分别放上球体、环面结和多面体等基础几何展品。', '在 Canvas 上绘制自己的展板，把纹理贴到房间中的平面上。', '记录 W/A/S/D 与左右方向键的按下和松开，计算移动与转向。', '进入漫游时禁用轨道控制，用 clamp 限制房间外边界，窗口失焦时清空按键状态。'],
    criteria: ['三个展品分别位于展台上，展板文字可读且宽高比正确。', '点击预览后，W/A/S/D 能移动，左右方向键能转向。', '前进方向随朝向变化，斜向移动速度与单方向接近。', '相机保持固定视线高度、不会越过房间外边界，松开按键后停止移动。'],
  },
  'equipment-status': {
    brief: '独立挑战：从空白场景制作三台设备的小运维场景，点击设备查看温度和状态，并通过按钮切换所选设备的运行状态。',
    steps: ['组合设备外壳、底座、散热槽和指示灯，将设备主体保存在数组中。', '在每台设备的 userData 中保存名称、模拟温度与 running 状态。', '将鼠标位置换算为标准化设备坐标，用 Raycaster 选择设备主体。', '高亮当前选择，并将设备名称、温度与状态显示在 overlay 信息面板。', '添加状态按钮，切换所选设备，并根据停机状态、温度阈值更新指示灯。'],
    criteria: ['点击不同设备时，高亮和信息面板均切换到对应设备。', '未选择设备时按钮不可操作，选择后只修改当前设备。', '指示灯能区分正常、高温与停机，停机状态优先显示。', '按钮操作后指示灯、文字与数据一致，面板明确注明模拟数据。'],
  },
  'energy-dashboard': {
    brief: '独立挑战：从空白场景构建供能站、光伏与用能楼，用曲线管道、流动点和教学模拟数据看板表达能量关系。',
    steps: ['使用基础几何摆放供能站、光伏板和用能楼，并添加各自名称。', '创建 CatmullRomCurve3，用同一条曲线生成 TubeGeometry 管道。', '让多个发光色小球通过 getPointAt 沿管道移动，错开它们的初始进度。', '按时间生成总功率与光伏功率，计算光伏功率占总功率的百分比。', '在 overlay 显示功率、占比条与“教学模拟数据”说明，定时刷新面板。'],
    criteria: ['设备和名称对应清楚，管道连接供能与用能区域。', '多个流动点始终沿管道移动，并呈现连续的传递方向。', '总功率、光伏功率和百分比条持续更新，百分比计算一致。', '面板注明教学模拟数据，调整窗口大小后画面比例仍正常。'],
  },
};

for (const item of projects) {
  const challenge = challenges[item.id];
  if (challenge) item.challenge = { ...challenge, code: challengeStarter(challenge.steps) };
}

export default projects;
