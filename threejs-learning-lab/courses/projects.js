// 综合练习从基础几何逐步组合；生成后展示给学生的是完整、可运行的模块。
function projectCode(body, { animate = '', camera = [9, 8, 11], target = [0, 0.8, 0] } = {}) {
  return `import * as THREE from 'three'; // 导入 Three.js，并通过 THREE 名称使用其几何体、相机和材质等功能。
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // 导入轨道控制器，负责鼠标旋转、滚轮缩放和拖动平移。

const canvas = document.querySelector('#scene'); // 用 CSS 选择器找到 id 为 scene 的画布，三维画面将绘制到这里。
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); // canvas 指定绘制目标；antialias=true 开启边缘抗锯齿，减少锯齿感。
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 像素比取屏幕倍率与 2 的较小值，在清晰度与显卡负担之间折中。
renderer.setSize(window.innerWidth, window.innerHeight); // 两个参数依次为画布宽、高，单位是 CSS 像素，随当前预览区域尺寸变化。
renderer.shadowMap.enabled = true; // 启用渲染器的阴影系统；灯光和物体还需要分别开启阴影选项。
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 选择 PCF 柔和阴影过滤，使阴影边缘更平滑；并不会自动生成阴影。
const scene = new THREE.Scene(); // 创建场景，作为相机、灯光和可见物体的共同容器。
scene.background = new THREE.Color('#101c2b'); // 使用十六进制颜色设置场景背景，背景本身不会给物体照明。
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100); // 依次为垂直视角 45 度、宽高比、近裁剪面 0.1、远裁剪面 100；裁剪距离用场景单位。
camera.position.set(${camera.join(', ')}); // 按 X、Y、Z 设置相机所在位置，单位为场景单位；Y 表示高度，正负号决定方向。
const controls = new OrbitControls(camera, canvas); // 两个参数依次是受控相机、接收鼠标事件的画布，避免拖动其他区域时影响视角。
controls.target.set(${target.join(', ')}); // 按 X、Y、Z 设置轨道观察中心；这是被观察的目标点，并非相机的位置。
controls.enableDamping = true; // 开启阻尼，让旋转和平移逐渐停下；动画循环中必须调用 controls.update()。
scene.add(new THREE.HemisphereLight('#e3f7ff', '#475569', 2.1)); // 依次为天空色、地面反射色、光照强度；半球光模拟来自上下方向的环境光。
const light = new THREE.DirectionalLight('#fff4dc', 3); // 依次为方向光颜色、强度；方向光模拟平行光线，常用于表现太阳光。
light.position.set(4, 10, 6); // 按 X、Y、Z 设置灯光位置，单位为场景单位；默认照向原点，方向由二者连线决定。
light.castShadow = true; // 让该方向光生成阴影，只有启用了投射/接收阴影的物体才参与。
light.shadow.mapSize.set(1024, 1024); // 阴影贴图宽、高均为 1024 像素；分辨率越大越清晰，也越占显存。
Object.assign(light.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 }); // 设置阴影正交相机的左右上下边界，单位为场景单位；范围过大将降低阴影精度。
scene.add(light); // 把方向光加入场景后，渲染时才会计算它对物体的影响。
const overlay = document.querySelector('#overlay'); // 找到 id 为 overlay 的网页文字层，用它放说明、按钮和模拟数据面板。
overlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;font:13px/1.7 system-ui;color:#e5edf7;background:transparent;padding:0;max-width:none;border-radius:0'; // 固定文字层覆盖预览区；13px 字号、1.7 倍行高；pointer-events:none 让鼠标穿透到画布。

// 小工具仍是普通 Three.js：几何 + 材质 + 网格。
function box(w, h, d, color, x = 0, y = h / 2, z = 0) { // 定义造方块函数：w/h/d 为宽高深，color 为颜色，x/y/z 为中心坐标；尺寸和坐标均用场景单位，默认 y=h/2 使底部贴地。
  const mesh = new THREE.Mesh( // 开始创建网格；接下来两个参数分别是几何体和材质。
    new THREE.BoxGeometry(w, h, d), // 宽 w 沿 X、高 h 沿 Y、深 d 沿 Z；几何体默认以自身中心为原点。
    new THREE.MeshStandardMaterial({ color, roughness: 0.6 }) // 标准光照材质；color 是表面颜色，roughness 在 0～1 之间，越大高光越模糊。
  ); // 结束网格构造器的参数列表，前两行的几何体与材质组合成一个可显示的网格。
  mesh.position.set(x, y, z); // 按 X、Y、Z 设置网格中心位置，单位是场景单位，而不是像素。
  mesh.castShadow = true; // 允许此网格向其他开启 receiveShadow 的物体投下阴影。
  mesh.receiveShadow = true; // 允许此网格接收其他物体的阴影，需要灯光和渲染器同时启用阴影。
  scene.add(mesh); // 将网格加入场景；只创建 Mesh 而不加入场景，画面中不会出现它。
  return mesh; // 返回刚创建的网格，调用处可以继续修改其位置、材质或业务信息。
} // 结束 box 函数的定义；只有调用 box(...) 时，里面的造物步骤才会执行。
function label(text, x, y, z, color = '#c8fbef') { // 标签参数依次为文字、X/Y/Z 中心坐标、文字颜色；坐标用场景单位，颜色有默认值。
  const image = document.createElement('canvas'); // 创建离屏二维画布，先把文字绘成图片，再转换为三维纹理。
  image.width = 512; image.height = 100; // 设置文字图片的宽和高，单位是像素，与三维空间里的标签尺寸不同。
  const ctx = image.getContext('2d'); // 获取二维绘图上下文，后续用它设置颜色、字体和绘制文字。
  ctx.fillStyle = '#142b3e'; ctx.fillRect(0, 0, 512, 100); // 先设背景色；fillRect 的四个参数是左上角 x/y 与宽/高，单位均为画布像素。
  ctx.font = 'bold 38px sans-serif'; ctx.textAlign = 'center'; // 使用粗体 38 像素字体并把文本水平居中，便于后面按画布中心定位。
  ctx.fillStyle = color; ctx.fillText(text, 256, 64); // 先设文字颜色，再按文字、x=256、基线 y=64 的参数顺序绘制，坐标单位为像素。
  const texture = new THREE.CanvasTexture(image); // 把二维画布转换成可贴到三维物体上的纹理，参数是该画布对象。
  texture.colorSpace = THREE.SRGBColorSpace; // 标记为 sRGB 颜色纹理，让纹理颜色按正确的颜色空间参与显示。
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false })); // Sprite 始终面向相机；map 指定文字纹理，depthTest=false 使标签不被前方物体遮住。
  sprite.position.set(x, y, z); sprite.scale.set(2.6, 0.51, 1); // 先设标签中心 X/Y/Z，再设宽 2.6、高 0.51、深度倍率 1；三维尺寸与图片比例接近，减少拉伸。
  scene.add(sprite); // 将文字精灵加入场景，使它出现在三维标签位置。
  return sprite; // 返回文字精灵，调用处可继续更新其位置、缩放或可见性。
} // 结束 label 函数的定义；每次调用都会生成独立的文字画布、纹理和精灵。
function panel(html) { // 定义网页面板函数；html 是课程内预先编写的 HTML 字符串。
  const element = document.createElement('section'); // 创建 section 元素作为信息卡片容器，此时还没有插入页面。
  element.style.cssText = 'position:absolute;left:16px;top:16px;max-width:260px;padding:12px 16px;background:#10283ee8;border:1px solid #33566d;border-radius:12px'; // 设置卡片绝对定位、左上各偏移 16 像素、最大宽 260 像素，并添加内边距、背景、边框与圆角。
  element.innerHTML = html; // 把课程提供的 HTML 内容写进卡片；仅适合可信内容，外部输入应使用 textContent。
  overlay.append(element); // 把卡片插入 overlay 文字层，使面板显示在三维画面的上方。
  return element; // 返回面板元素，后续用它查询按钮、更新文字或设置样式。
} // 结束 panel 函数的定义；后面的课程逻辑可以反复调用它生成信息卡片。

${body.trim()}

let previousTime = 0; // 记录上一帧的时间，单位为秒；初始值用于计算第一次的帧间隔。
renderer.setAnimationLoop((milliseconds) => { // 登记逐帧回调；milliseconds 是浏览器传入的时间戳，单位为毫秒。
  const time = milliseconds / 1000; // 把毫秒换成秒，time 表示累计时间，可用于周期动画。
  const delta = Math.min(time - previousTime, 0.05); // 计算两帧相隔的秒数；上限 0.05 秒避免切回后台后对象突然跨越很远。
  previousTime = time; // 保存当前秒数，下一帧用它计算新的 delta。
  ${animate || '// 当前阶段的模型保持静止；鼠标可旋转观察。'}
  if (controls.enabled) controls.update(); // 只有轨道控制器启用时才更新阻尼；漫游模式禁用控制器后不会被它覆盖视角。
  renderer.render(scene, camera); // 用相机观察场景并绘制这一帧；两个参数依次是场景、相机。
}); // 结束逐帧回调的定义，并把它交给渲染器持续调用。
window.addEventListener('resize', () => { // 监听当前预览区域的尺寸变化，使画布和相机在调整大小后保持匹配。
  camera.aspect = innerWidth / innerHeight; // 透视相机宽高比等于预览宽度除以高度；两者都使用 CSS 像素。
  camera.updateProjectionMatrix(); // 通知相机根据新宽高比重算投影矩阵，否则画面会变形或保留旧视角。
  renderer.setSize(innerWidth, innerHeight); // 依次更新渲染画布的宽和高，单位为 CSS 像素。
}); // 结束尺寸变化回调的定义，并完成 resize 事件监听的登记。
`;
}

function factory(stage) {
  return projectCode(`
const machineCount = 4; // 设置要创建的设备数量；后面的循环根据这个数量生成对应的设备。
const floor = box(13, 0.15, 9, '#486371', 0, -0.08, 0); // 创建地板：参数依次为宽、高、深、颜色、中心 X/Y/Z；厚度 0.15，中心略低于地面。
box(13, 2.8, 0.15, '#8aaeb7', 0, 1.4, -4.5); // 创建后墙：宽/高/厚度、颜色、中心 X/Y/Z；负 Z 方向位于场景后侧。
box(0.15, 2.8, 9, '#6b939e', -6.5, 1.4, 0); // 创建左墙：厚度/高度/深度、颜色、中心 X/Y/Z；负 X 方向位于场景左侧。
const grid = new THREE.GridHelper(12, 12, '#60c5c2', '#617c88'); // 网格参数依次为边长 12、每边分成 12 格、中心线颜色、其他线颜色；长度用场景单位。
grid.position.y = 0.01; scene.add(grid); // 将网格抬高 0.01 个场景单位以避开地板重叠闪烁，再加入场景。
// 用 Group 将罐体、底座和管道组织成一台设备。
const machines = []; // 创建空数组，保存每一台设备的 Group，方便统一更新状态或位置。
for (let i = 0; i < machineCount; i++) { // i 从 0 开始，每次增加 1，直到达到设备数量；每次循环创建一台设备。
  const machine = new THREE.Group(); // 新建组合容器，罐体和底座将共用这一组的局部坐标。
  const body = new THREE.Mesh( // 开始创建反应罐网格，接下来的参数分别是圆柱几何与表面材质。
    new THREE.CylinderGeometry(0.7, 0.7, 1.7, 32), // 圆柱参数依次为上半径、下半径、高度、圆周分段数；前三个用场景单位，默认轴向为 Y。
    new THREE.MeshStandardMaterial({ color: '#d5e7eb', metalness: ${stage >= 2 ? '0.75' : '0.05'}, roughness: ${stage >= 2 ? '0.26' : '0.7'} }) // color 为基础色；metalness 金属度、roughness 粗糙度均取 0～1，前者越大越像金属，后者越小高光越集中。
  ); // 结束圆柱罐网格的创建，将圆柱形状与标准材质组合成 body。
  body.position.y = 1.25; body.castShadow = true; machine.add(body); // 把罐体中心放到组内高度 1.25，开启阴影投射，再加入设备组；位置相对于 Group。
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.4, 1.8), // 开始创建底座：BoxGeometry 的参数依次为宽 1.9、高 0.4、深 1.8，单位均为场景单位。
    new THREE.MeshStandardMaterial({ color: '#22485c' })); // 使用指定颜色的标准材质，并结束底座网格的创建；此材质需要灯光。
  base.position.y = 0.2; base.receiveShadow = true; machine.add(base); // 底座中心高度为厚度的一半以贴地，开启阴影接收，再加入设备组。
  machine.position.set((i % 2) * 4 - 2, 0, Math.floor(i / 2) * 3.8 - 2); // i%2 决定左右两列、间距 4；floor(i/2) 决定前后行、间距 3.8；偏移 -2 使布局靠近原点。
  machine.userData.name = '反应罐 ' + (i + 1); // 在 userData 保存设备名称；数组从 0 编号，显示时加 1 得到人类习惯的序号。
  scene.add(machine); machines.push(machine); // 将整台设备放进场景，同时存入 machines 数组，供后续状态和标签逻辑使用。
} // 结束本轮设备创建；循环继续处理下一索引，直到达到 machineCount。
${stage >= 2 ? `
// 同一纹理可以被多个网格共用；墙体仍使用纯色材质。
const tiles = new THREE.TextureLoader().load('assets/checker.svg'); // 从本课 assets 目录加载地砖图片为纹理，路径是相对路径，不依赖外部图片服务。
tiles.colorSpace = THREE.SRGBColorSpace; // 将地砖标记为 sRGB 颜色纹理，保持图片原有的颜色显示。
tiles.wrapS = tiles.wrapT = THREE.RepeatWrapping; // wrapS 控制横向、wrapT 控制纵向边界；RepeatWrapping 让超出 0～1 的纹理坐标重复采样。
tiles.repeat.set(6, 4); // 两个参数是纹理沿 U、V 方向的重复次数，次数越多，单块地砖看起来越小。
floor.material.map = tiles; floor.material.needsUpdate = true; // 把纹理交给地板材质的 map；needsUpdate=true 让渲染器重新编译使用贴图的材质配置。
const pipeMaterial = new THREE.MeshStandardMaterial({ color: '#4ce3cb', metalness: 0.4, roughness: 0.35 }); // 设置管道颜色、金属度与粗糙度；后两者取 0～1，所有管道共用这份材质以减少资源。
for (const x of [-2, 2]) { // 依次取 X=-2 和 X=2 的位置，各建立一条管道；数组中的数值是场景坐标。
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 4, 12), pipeMaterial); // 圆柱参数为上/下半径 0.07、高度 4、圆周 12 段；第二个 Mesh 参数是共用的管道材质。
  pipe.rotation.x = Math.PI / 2; pipe.position.set(x, 2.1, 0); scene.add(pipe); // 绕 X 轴转 π/2 弧度即 90 度，使圆柱轴转向 Z；再按 X/Y/Z 定位并加入场景。
} // 结束管道位置循环，左右两条管道均已加入场景。` : ''}
${stage >= 3 ? `
const maintenanceIndex = 2; // 设置待维护设备的数组索引；从 0 开始编号，0 对应第一台，2 对应第三台。
machines.forEach((machine, index) => { // 遍历所有设备；machine 为当前组，index 为从 0 开始的索引。
  const maintenance = index === maintenanceIndex; // 比较当前索引和待维护索引，结果是 true 或 false，供颜色与文字共用。
  machine.children[0].material.color.set(maintenance ? '#ffb45d' : '#c4e7ec'); // children[0] 是罐体；条件成立选维护色，否则选正常色，只改变该设备的罐体颜色。
  label(machine.userData.name + (maintenance ? ' · 待维护' : ' · 运行'), // 标签第一个参数是设备名称与状态文字，后续参数继续写在下一行。
    machine.position.x, 2.9, machine.position.z, maintenance ? '#ffd39c' : '#9af0d3'); // 依次补入标签中心 X/Y/Z 和颜色；高度 2.9 位于设备上方，颜色随维护状态改变。
}); // 结束设备状态遍历；每台设备的颜色与标签都使用同一个维护条件。
panel('<b>教学车间 · 状态示例</b><br>绿色标签：运行<br>橙色标签：待维护<br><small>状态为本地教学数据</small>'); // 展示颜色图例，并明确设备状态来自教学数据，帮助学生区分示例与真实生产系统。` : `
panel('<b>车间搭建 · 第 ${stage} 阶段</b><br>拖动鼠标观察设备与空间布局'); // 显示当前学习阶段和鼠标操作提示，参数是课程提供的 HTML 字符串。`}
`, { camera: [10, 9, 12], target: [0, 0.8, 0] });
}

function production(stage) {
  return projectCode(`
box(14, 0.2, 8, '#3b5264', 0, -0.1, 0); // 创建产线地板：宽/高/深、颜色、中心 X/Y/Z；中心 Y=-0.1 使顶面处于 Y=0。
box(11, 0.2, 1.65, '#243848', 0, 0.95, 0); // 创建输送带底板：宽/高/深、颜色、中心 X/Y/Z；中心高度 0.95，顶面高度 1.05。
// 滚筒的轴沿 z 方向，货箱沿 x 方向移动。
for (let x = -5; x <= 5; x += 0.5) { // X 从 -5 到 5，每次增加 0.5 个场景单位，等距建立输送滚筒。
  const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.6, 12), // 滚筒圆柱参数为上/下半径 0.11、轴长 1.6、圆周 12 段；下一行提供材质。
    new THREE.MeshStandardMaterial({ color: '#97b8c7', metalness: 0.7, roughness: 0.3 })); // color 为滚筒颜色；metalness=0.7 表示较强金属感，roughness=0.3 表示较集中的表面高光。
  roller.rotation.x = Math.PI / 2; roller.position.set(x, 1.12, 0); scene.add(roller); // 把圆柱绕 X 转 90 度使滚筒横跨 Z 方向，再以循环中的 X 值和高度 1.12 定位。
} // 结束滚筒创建循环，已按固定间距填满整条输送带。
for (const x of [-4.6, 0, 4.6]) { // 依次取三组 X 坐标作为支腿位置，循环内分别建立输送带两侧的支腿。
  box(0.2, 0.9, 0.2, '#748b99', x, 0.45, -0.55); // 创建一侧支腿：宽/高/深、颜色、中心 X/Y/Z；中心 Y=0.45 为高度 0.9 的一半。
  box(0.2, 0.9, 0.2, '#748b99', x, 0.45, 0.55); // 创建另一侧支腿；相同尺寸和 X 位置，通过正 Z=0.55 与前一条支腿分列两侧。
} // 结束支腿位置循环，三组支腿分别布置在输送带两侧。
box(0.25, 3, 0.25, '#58d5c4', 1.5, 1.5, -1.2); // 创建门架一侧立柱：宽/高/深、颜色、中心 X/Y/Z；高度 3，中心 Y=1.5 以贴地。
box(0.25, 3, 0.25, '#58d5c4', 1.5, 1.5, 1.2); // 创建门架另一侧立柱，尺寸相同而 Z 坐标为正，形成输送通道。
box(0.25, 0.25, 2.65, '#58d5c4', 1.5, 3, 0); // 创建顶部横梁：X 向厚度 0.25、Y 向高度 0.25、Z 向跨度 2.65，中心 Y=3。
const packages = []; // 保存货箱网格的数组；动画和复位逻辑都遍历这同一份对象列表。
for (let i = 0; i < 4; i++) { // 从索引 0 开始建立货箱，i 每次加 1；循环上限决定货箱数量。
  const parcel = box(0.9, 0.8, 0.9, i % 2 ? '#ffa657' : '#4acbb8', i * 2.5 - 4, 1.65, 0); // 货箱宽/高/深为 0.9/0.8/0.9；i%2 交替选色，X=i*2.5-4 形成间距 2.5 的排列，Y=1.65。
  packages.push(parcel); // 把刚创建的货箱加入数组，后续只需遍历数组即可统一移动。
} // 结束货箱创建循环，packages 数组中已保存所有货箱。
const speed = 1.4; // 设置输送速度，单位是场景单位/秒；动画中再乘 delta 得到本帧位移。
let running = ${stage >= 2 ? 'true' : 'false'}; // 保存允许运动的布尔值；true 允许运动，false 停止位移，渲染循环仍继续。
${stage >= 3 ? `
const dashboard = panel('<b>产线控制 · 教学模拟</b><br><span id="line-status">运行中</span><br>' + // 创建控制面板并开始拼接 HTML；line-status 是供状态更新代码查询的元素 id。
  '<button id="start">启动</button> <button id="stop">停止</button> <button id="reset">复位</button>'); // 继续拼接启动、停止、复位三个按钮；id 分别用于绑定对应点击事件。
dashboard.querySelectorAll('button').forEach(button => { // 在此面板内查询所有 button，逐个为按钮设置可交互的样式。
  button.style.cssText = 'pointer-events:auto;cursor:pointer;border:0;border-radius:6px;padding:6px 10px;margin-top:8px;background:#b5f4df;color:#173b39'; // pointer-events:auto 恢复按钮点击，cursor 显示手形；其余值控制圆角、间距和配色，尺寸用像素。
}); // 结束按钮样式遍历，三个按钮均已恢复鼠标点击能力。
function setRunning(value) { // 封装统一的运行状态更新函数；value 应传入 true 或 false。
  running = value; // 保存按钮传入的新运行状态，动画循环会读取它决定是否移动货箱。
  dashboard.querySelector('#line-status').textContent = value ? '运行中' : '已停止'; // 根据相同布尔值更新状态文字，使界面文案与动画状态保持一致。
} // 结束 setRunning 函数；调用它会同时更新动画状态与网页文字。
dashboard.querySelector('#start').onclick = () => setRunning(true); // 点击启动按钮时传入 true 开始运动；箭头函数让调用发生在点击时。
dashboard.querySelector('#stop').onclick = () => setRunning(false); // 点击停止按钮时传入 false 暂停位移，不清空货箱当前位置。
dashboard.querySelector('#reset').onclick = () => { // 为复位按钮登记点击回调，按下面的两步同时恢复状态和位置。
  setRunning(false); // 复位前先停止产线，并通过同一个函数同步状态文字。
  packages.forEach((parcel, index) => parcel.position.x = index * 2.5 - 4); // 按数组索引恢复每个货箱的初始 X 坐标；2.5 是间距，-4 是第一个货箱的位置。
}; // 结束复位按钮的点击回调，并完成 onclick 赋值；点击时才执行复位步骤。` : `
panel('<b>输送产线 · 第 ${stage} 阶段</b><br>${stage === 1 ? '先完成空间布局，再加入动画' : '货箱沿 x 轴移动；末端循环回到起点'}'); // 用 HTML 字符串创建说明面板，交代当前阶段要观察的布局或运动效果。`}
`, {
    camera: [10, 7, 10],
    animate: stage >= 2 ? `if (running) { // running 为 true 时才更新位置；暂停运动不会终止渲染或鼠标观察。
    for (const parcel of packages) { // 逐个读取 packages 数组里的货箱，parcel 是当前货箱网格。
      parcel.position.x += speed * delta; // 本帧 X 向位移=每秒速度×本帧秒数，避免运动快慢直接依赖屏幕帧率。
      if (parcel.position.x > 5) parcel.position.x = -5; // 超过输送带右端 X=5 时回到左端 X=-5，形成循环效果；这不是物理碰撞。
    } // 结束当前帧的货箱遍历，数组中每个货箱都已按相同时间间隔更新。
  } // 结束运行状态判断；running=false 时会跳过整个位置更新块。` : '',
  });
}

function exhibition(stage) {
  return projectCode(`
box(12, 0.2, 12, '#d2e3d8', 0, -0.1, 0); // 创建展厅地板：宽/高/深、颜色、中心 X/Y/Z；顶部位于 Y=0。
box(12, 3.6, 0.2, '#548979', 0, 1.8, -6); // 创建后墙：宽 12、高 3.6、厚 0.2；中心 Z=-6 位于房间后侧。
box(0.2, 3.6, 12, '#548979', -6, 1.8, 0); // 创建左墙：厚 0.2、高 3.6、深 12；中心 X=-6，前方保持开口。
box(0.2, 3.6, 12, '#7cac95', 6, 1.8, 0); // 创建右墙：厚 0.2、高 3.6、深 12；中心 X=6，与左墙对称。
const exhibits = []; // 保存三个展品网格，后面可用同一个数组统一更新它们。
const shapes = [new THREE.SphereGeometry(0.7, 32, 20), // 开始几何体数组；球体参数依次为半径、水平分段 32、垂直分段 20，半径用场景单位。
  new THREE.TorusKnotGeometry(0.45, 0.15, 80, 12), new THREE.IcosahedronGeometry(0.75)]; // 环面结依次为整体半径 0.45、管半径 0.15、沿环 80 段、截面 12 段；二十面体参数是半径 0.75。
for (let i = 0; i < 3; i++) { // 索引依次取 0、1、2，各创建一组展台与展品；每轮结束后 i 加 1。
  const x = (i - 1) * 3.4; // 把从 0 开始的索引减 1，再乘间距 3.4，得到左右对称的三个展品 X 坐标。
  box(1.8, 0.7, 1.8, '#244a42', x, 0.35, -1); // 创建展台：宽/高/深、颜色、中心 X/Y/Z；中心 Y=0.35 为高度的一半。
  const sculpture = new THREE.Mesh(shapes[i], // 按 i 从几何数组取当前造型，作为 Mesh 的第一个参数；材质在下一行。
    new THREE.MeshStandardMaterial({ color: ['#9ae4b9', '#e1c778', '#66c9ce'][i], roughness: 0.3, metalness: 0.25 })); // 用 i 选取不同展品颜色；roughness 粗糙度、metalness 金属度均为 0～1，材质需要灯光。
  sculpture.position.set(x, 1.65, -1); sculpture.castShadow = true; // 按 X/Y/Z 设置展品中心，让其位于展台上方，并允许它投下阴影。
  scene.add(sculpture); exhibits.push(sculpture); // 把展品加入场景并保存到 exhibits 数组，场景负责显示，数组便于统一操作。
} // 结束展台与展品创建循环，三个不同造型已完成空间排列。
label('GREEN EXHIBITION', 0, 3.2, -5.8); // 标签参数依次是文字、X/Y/Z 中心坐标；颜色使用 label 函数定义的默认值。
${stage >= 2 ? `
// 用 Canvas 画一张自己的展板图，再把它作为纹理贴到平面。
const board = document.createElement('canvas'); board.width = 512; board.height = 256; // 创建海报离屏画布，并设宽 512、高 256 像素；宽高比为 2:1。
const ctx = board.getContext('2d'); // 获取海报的二维绘图上下文，用于绘制背景、文字和柱形图。
ctx.fillStyle = '#143e34'; ctx.fillRect(0, 0, 512, 256); // 先设背景色，再画满矩形；四个数字依次为左上角 x/y、宽/高，单位为像素。
ctx.fillStyle = '#b9f6c8'; ctx.font = 'bold 42px sans-serif'; ctx.fillText('绿色未来', 34, 70); // 设置标题颜色和 42 像素粗体字；fillText 参数依次为文字、左边距 34、基线高度 70 像素。
ctx.font = '25px sans-serif'; ctx.fillText('减碳 · 循环 · 可持续', 34, 122); // 把字号改为 25 像素，再以文字、x=34、基线 y=122 的参数绘制副标题。
ctx.fillStyle = '#56c59a'; // 设置后面柱形图的填充颜色，这个属性本身不会立即绘图。
for (let i = 0; i < 5; i++) ctx.fillRect(35 + i * 88, 210 - i * 17, 50, 20 + i * 17); // 循环绘制五根柱：fillRect 参数为 x/y/宽/高，单位是像素；随 i 增大逐根抬高并增加高度。
const posterTexture = new THREE.CanvasTexture(board); posterTexture.colorSpace = THREE.SRGBColorSpace; // 将画布转成纹理，并按 sRGB 颜色空间显示，保持海报配色。
const poster = new THREE.Mesh(new THREE.PlaneGeometry(4, 2), // 开始创建海报网格；平面宽 4、高 2 个场景单位，与 512:256 像素保持相同比例。
  new THREE.MeshBasicMaterial({ map: posterTexture })); // map 指向海报纹理；基础材质不依赖灯光，因此文字不会因受光不足变暗。
poster.position.set(0, 1.8, -5.85); scene.add(poster); // 把海报中心设在后墙前方的 X/Y/Z 位置，再加入场景；略向前避免与墙重叠闪烁。` : ''}
${stage >= 3 ? `
// 这是受房间边界约束的基础漫游；没有物理碰撞和重力系统。
controls.enabled = false; // 禁用鼠标轨道控制，防止每帧更新时覆盖键盘漫游的相机位置和方向。
camera.position.set(0, 1.7, 4.8); camera.lookAt(0, 1.7, -2); // 设置漫游初始 X/Y/Z，并看向另一个 X/Y/Z 点；两处 Y=1.7 使视线保持水平。
const keys = new Set(); // 用集合记录当前按住的按键；同一按键重复触发 keydown 也只会保存一次。
window.addEventListener('keydown', event => { // 监听按键按下；event 包含触发事件的按键等信息。
  if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowLeft', 'ArrowRight'].includes(event.code)) { // 只处理 W/A/S/D 和左右方向键；event.code 表示键盘物理键位。
    event.preventDefault(); keys.add(event.code); // 阻止这些键的浏览器默认动作，并把当前键位加入按住集合。
  } // 结束允许键位的判断；其他按键不会被加入漫游输入集合。
}); // 结束 keydown 回调并登记监听，后续每次按键按下都会检查键位。
window.addEventListener('keyup', event => keys.delete(event.code)); // 松开时从集合删除该键，后续动画就会停止相应方向的运动。
window.addEventListener('blur', () => keys.clear()); // 窗口失去焦点时清空按键，避免切换窗口后因漏掉 keyup 而持续移动。
let heading = 0; // 保存水平朝向角，单位为弧度；初始 0 对应朝向负 Z。
const walkSpeed = 2.5; // 漫游速度的单位为场景单位/秒，稍后通过乘 delta 换算成本帧距离。
panel('<b>展厅漫游</b><br>先点击画面，再使用 W/A/S/D 移动<br>← / → 转向<br><small>基础版：只限制房间外边界，展台没有碰撞</small>'); // 说明点击画面获取键盘输入的方法，以及只有外边界限制、没有展台碰撞的练习范围。` : `
panel('<b>绿色展厅 · 第 ${stage} 阶段</b><br>鼠标拖动观察，滚轮调整距离'); // 在网页文字层显示学习阶段与鼠标提示；参数是预先编写的 HTML。`}
`, {
    camera: [10, 8, 13], target: [0, 1, -1],
    animate: stage >= 3 ? `const turn = Number(keys.has('ArrowLeft')) - Number(keys.has('ArrowRight')); // 将按键布尔值转成 1/0，左减右得到 -1、0 或 1 的转向输入。
  heading += turn * delta * 1.7; // 转向角增量=转向值×帧间秒数×1.7，1.7 的单位为弧度/秒。
  const forward = Number(keys.has('KeyW')) - Number(keys.has('KeyS')); // W 减 S 得到前后方向值，前进为 1、后退为 -1，同时按下时互相抵消。
  const side = Number(keys.has('KeyD')) - Number(keys.has('KeyA')); // D 减 A 得到横向方向值，右移为 1、左移为 -1。
  const distance = walkSpeed * delta / Math.max(1, Math.hypot(forward, side)); // 速度乘 delta 得到距离；除以方向向量长度，防止同时按两个方向时斜走更快，至少除以 1 避免除零。
  camera.position.x += (-Math.sin(heading) * forward + Math.cos(heading) * side) * distance; // 用朝向的正弦和余弦把前后/左右输入转成世界 X 轴位移，再乘本帧距离。
  camera.position.z += (-Math.cos(heading) * forward - Math.sin(heading) * side) * distance; // 同样计算世界 Z 轴位移；朝向为 0 时前进沿负 Z，与初始相机方向一致。
  camera.position.x = THREE.MathUtils.clamp(camera.position.x, -5.4, 5.4); // clamp 参数依次为当前 X、最小 X、最大 X；把相机限制在房间左右边界内。
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, -5.4, 5.4); // clamp 将当前 Z 夹在 -5.4 到 5.4 之间，避免相机越过房间前后外边界。
  camera.lookAt(camera.position.x - Math.sin(heading), 1.7, camera.position.z - Math.cos(heading)); // 按水平朝向构造前方目标点；lookAt 的参数为目标 X/Y/Z，Y=1.7 保持视线高度不变。` : '',
  });
}

function equipment(stage) {
  return projectCode(`
box(11, 0.2, 7, '#3a5366', 0, -0.1, 0); // 创建运维场景地板：宽/高/深、颜色、中心 X/Y/Z；高度 0.2、中心 Y=-0.1。
const devices = []; // 只保存可点击的设备主体；底座和装饰不进数组，避免射线选错目标。
const deviceCount = 3; // 设置需要创建的设备数量，循环将按此值生成外观和业务信息。
for (let i = 0; i < deviceCount; i++) { // 按从 0 开始的设备索引循环，i 小于数量时继续，每轮 i 加 1。
  const x = (i - 1) * 3; // 用索引计算左右对称的设备 X 坐标，相邻设备的间距为 3 个场景单位。
  box(2.3, 0.25, 2.3, '#26465a', x, 0.13, 0); // 创建底座：宽/高/深、颜色、中心 X/Y/Z；高度较薄，略抬高以避免与地面重叠。
  const device = box(1.65, 2.3, 1.4, '#77b6c3', x, 1.4, 0); // 创建设备主体：宽/高/深、颜色、中心 X/Y/Z；把返回的网格保存为 device，后续绑定业务信息。
  device.userData = { name: '冷却设备 ' + (i + 1), temperature: 36 + i * 7, running: i !== 2 }; // name 为名称，temperature 为模拟摄氏温度且每台相差 7℃，running 为运行布尔值；i=2 的第三台初始停机。
  devices.push(device); // 把设备主体存入候选数组，供后续射线选择和指示灯更新使用。
  for (let slot = 0; slot < 5; slot++) box(1.1, 0.07, 0.04, '#153344', x, 0.8 + slot * 0.25, 0.72); // 每台创建五条散热槽；box 参数为宽/高/深、颜色、X/Y/Z，槽位索引使 Y 每次增加 0.25。
  const indicator = box(0.25, 0.15, 0.05, '#9df3c8', x + 0.45, 2.25, 0.73); // 创建状态灯：宽/高/深、颜色、X/Y/Z；X 向右偏移 0.45，Z=0.73 稍超出设备正面以防闪烁。
  device.userData.indicator = indicator; // 把状态灯网格引用存进设备的 userData，后面可从设备直接找到并改色。
  label('设备 ' + (i + 1), x, 3.15, 0); // 参数依次为名称文字、X/Y/Z 中心坐标；Y=3.15 使标签位于设备上方。
} // 结束设备创建循环，每台设备均已有业务信息、散热槽、状态灯和标签。
${stage >= 2 ? `
// 鼠标坐标必须换算成当前 canvas 的标准化设备坐标。
const raycaster = new THREE.Raycaster(); // 创建射线工具，将二维鼠标位置转换成射入三维场景的直线并检测交点。
const pointer = new THREE.Vector2(); // 创建二维向量，稍后保存范围为 -1～1 的标准化设备坐标。
let selected = null; // 保存当前选中设备，初始 null 表示没有选择，不能直接读取设备属性。
const dashboard = panel('<b>设备巡检</b><br><span id="device-info">点击设备主体查看信息</span>${stage >= 3 ? '<br><button id="toggle" disabled>切换运行状态</button>' : ''}'); // 创建详情面板；device-info 的 id 用于更新读数，若有切换按钮，初始 disabled 禁止未选设备时操作。
function updateInfo() { // 定义详情刷新函数，在选择设备或切换运行状态后调用。
  if (!selected) return; // 没有选中设备时立即返回，防止对 null 读取 userData 而报错。
  const data = selected.userData; // 读取当前设备的业务数据，后面的名称、温度和状态都使用这同一份数据。
  dashboard.querySelector('#device-info').textContent = // 找到设备详情文字节点，准备设置其 textContent；赋值内容继续写在下一行。
    data.name + ' · ' + data.temperature + '℃ · ' + (data.running ? '运行' : '停机'); // 按名称、摄氏温度、运行状态拼成纯文字，三元表达式根据 running 选择运行或停机。
  ${stage >= 3 ? `dashboard.querySelector('#toggle').disabled = false; // 已有选中设备，取消按钮禁用状态；false 表示允许点击。` : ''}
} // 结束详情刷新函数，选中设备的名称、温度和状态已同步到文字面板。
canvas.addEventListener('pointerdown', event => { // 只监听画布上的指针按下事件，event 提供本次点击在视口中的坐标。
  const rect = canvas.getBoundingClientRect(); // 获取画布实际位置与尺寸，后面的鼠标换算以画布自身边界为准。
  pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, // 先算 X：鼠标距画布左侧的比例乘 2 再减 1，把左端映射为 -1、右端映射为 1。
    -(event.clientY - rect.top) / rect.height * 2 + 1); // 再算 Y：将鼠标距顶部的比例取反换算，使上端为 1、下端为 -1；这与网页向下的 Y 相反。
  raycaster.setFromCamera(pointer, camera); // 两个参数依次为标准化鼠标坐标、相机；由相机投影生成正确方向的射线。
  const hit = raycaster.intersectObjects(devices, false)[0]; // 检测 devices 内网格；false 表示不递归检查子物体，[0] 取距离相机最近的交点。
  if (!hit) return; // 没有交点时结束当前点击处理，保留原有选择状态。
  if (selected) selected.material.emissive.set('#000000'); // 若之前选中过设备，把旧设备的自发光恢复为黑色，取消之前的高亮。
  selected = hit.object; selected.material.emissive.set('#174b52'); // 保存命中网格并设置自发光颜色作为选择高亮；emissive 不会替换材质原有的基础色。
  updateInfo(); // 根据刚选中的设备重新显示名称、温度和状态。
}); // 结束画布点击回调并登记监听；下次点击会重新执行射线选择与详情刷新。` : `
panel('<b>设备运维 · 第 1 阶段</b><br>把设备外壳、底座、散热槽组合起来<br>' + // 开始拼接设备说明面板，下一行继续列出每台设备的模拟温度。
  devices.map(device => device.userData.name + '：' + device.userData.temperature + '℃').join('<br>') + // map 将每台设备转成名称与温度文字，join 用 HTML 换行标签连接这些条目。
  '<br><small>温度为教学模拟数据</small>'); // 补上模拟数据说明并完成面板创建，提醒读者这不是实时传感器读数。`}
${stage >= 3 ? `
const warningTemperature = 45; // 设置温度告警阈值，单位为摄氏度；运行设备的温度严格大于此值时告警。
function updateIndicators() { // 定义状态灯刷新函数，统一根据业务数据决定每台设备的灯色。
  devices.forEach(device => { // 逐台读取 devices 数组；device 是当前设备主体。
    const data = device.userData; // 取得当前设备的业务数据，包括温度、运行状态和指示灯引用。
    data.indicator.material.color.set(!data.running ? '#94a3b8' : // 优先判断停机：未运行就选灰色；正在运行时才继续判断下一行的温度条件。
      data.temperature > warningTemperature ? '#ffb45d' : '#9df3c8'); // 运行且温度超过阈值时选橙色，否则选绿色；以此结果更新灯的材质颜色。
  }); // 结束所有设备的指示灯遍历，每盏灯都按该设备自己的业务数据确定颜色。
} // 结束 updateIndicators 函数，后面可在初始化或状态改变时再次调用。
updateIndicators(); // 初始化各设备的状态灯，使首次显示就与模拟数据保持一致。
const toggle = dashboard.querySelector('#toggle'); // 从信息面板中找到 id 为 toggle 的按钮，后续绑定它的交互行为。
toggle.style.cssText = 'pointer-events:auto;cursor:pointer;border:0;border-radius:6px;padding:7px 12px;margin-top:8px;background:#b5f4df;color:#173b39'; // 恢复按钮的鼠标点击能力，并设置手形光标、圆角、内边距、上间距和配色；长度单位为像素。
toggle.onclick = () => { // 定义状态切换按钮的点击回调，内容在点击时执行。
  if (!selected) return; // 没有选中设备时立即返回，防止对 null 读取 userData 而报错。
  selected.userData.running = !selected.userData.running; // 逻辑非号将 true 与 false 互换，只切换当前选中设备的运行状态。
  updateIndicators(); updateInfo(); // 先刷新所有状态灯，再刷新当前详情文字，使颜色、数据与面板保持一致。
}; // 结束状态按钮的回调；每次点击只切换当前设备，再统一刷新显示。
dashboard.insertAdjacentHTML('beforeend', '<br><small>绿：正常 · 橙：高温 · 灰：停机<br>温度与状态均为教学模拟数据</small>'); // 在面板结尾追加颜色图例和教学数据声明；beforeend 表示插入到元素内容的末尾。` : ''}
`, { camera: [8, 6, 11], target: [0, 1.2, 0] });
}

function energy(stage) {
  return projectCode(`
box(13, 0.2, 9, '#284a59', 0, -0.1, 0); // 创建能源场景地面：宽/高/深、颜色、中心 X/Y/Z；顶部位于 Y=0。
box(2.4, 2, 2.2, '#64a9b6', -4, 1, 0); // 创建供能站：宽/高/深、颜色、中心 X/Y/Z；负 X 放在左侧，中心 Y 为高度的一半。
box(2.4, 2.6, 2.2, '#78c9b6', 4, 1.3, 0); // 创建用能楼：宽/高/深、颜色、中心 X/Y/Z；正 X 放在右侧，较大的高度表达楼体。
box(2.3, 0.45, 2, '#88b3ce', 0, 0.45, -2.8); // 创建光伏支座：宽/高/深、颜色、中心 X/Y/Z；负 Z 放在后方，与左右设备形成层次。
const solar = box(2.3, 0.06, 1.8, '#194a77', 0, 0.95, -2.8); // 创建光伏板：宽 2.3、厚 0.06、深 1.8、颜色、中心 X/Y/Z；保存返回值以便调整倾角。
solar.rotation.x = -0.3; // 绕 X 轴倾斜，单位为弧度而不是度；负号决定旋转方向，π 弧度等于 180 度。
label('供能站', -4, 2.8, 0); label('用能楼', 4, 3.5, 0); label('光伏', 0, 1.8, -2.8); // 为三个角色分别创建标签；每次参数均为文字、X/Y/Z，文字位置与对应设备一致。
${stage >= 2 ? `
const path = new THREE.CatmullRomCurve3([ // 用有序的三维控制点数组建立平滑曲线，点的顺序决定路径从供能端到用能端的方向。
  new THREE.Vector3(-2.7, 0.7, 0), new THREE.Vector3(-1.5, 0.7, 1.8), // 前两个控制点分别为 X/Y/Z，单位是场景单位；两点相同的 Y=0.7 保持管道水平。
  new THREE.Vector3(1.5, 0.7, 1.8), new THREE.Vector3(2.7, 0.7, 0) // 继续提供后两个 X/Y/Z 控制点，末点连接到用能端附近；调整它们会同时改变管道和动画。
]); // 结束控制点数组和曲线构造器调用，得到可重复使用的路径对象。
const pipe = new THREE.Mesh(new THREE.TubeGeometry(path, 48, 0.09, 8, false), // 管道参数为曲线、沿线 48 段、管半径 0.09、截面 8 段、是否闭合 false；尺寸用场景单位。
  new THREE.MeshStandardMaterial({ color: '#2ea790', roughness: 0.3, metalness: 0.3 })); // 设置管道颜色、粗糙度和金属度；roughness 与 metalness 的范围均为 0～1。
scene.add(pipe); // 将管道网格加入场景；之后流动点使用的仍是同一条路径。
const markers = []; // 创建空数组保存能量点，动画会按数组索引错开每个点的进度。
const markerCount = 8; // 设置沿管道循环移动的点数；增加数量会让视觉流动更密集。
for (let i = 0; i < markerCount; i++) { // 按从 0 开始的索引创建指定数量的点，每轮循环新增一个球形网格。
  const marker = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), // 球体参数为半径 0.13、水平 12 段、垂直 8 段；较少分段减轻多个小球的计算量。
    new THREE.MeshBasicMaterial({ color: '#baffd7' })); // 使用亮色的基础材质，颜色不受场景灯光影响；这种亮色不会真的照亮旁边物体。
  scene.add(marker); markers.push(marker); // 把能量点加入场景并存进 markers，便于动画统一定位。
} // 结束能量点创建循环，markers 已保存全部点，供逐帧动画定位。` : ''}
${stage >= 3 ? `
const dashboard = panel('<b>能源看板 · 教学模拟数据</b><br><span id="power"></span><br>' + // 创建能源看板并开始拼接 HTML；power 元素用于稍后更新总功率文字。
  '<span id="solar"></span><div style="height:8px;background:#284e62;border-radius:8px;margin-top:8px">' + // 继续创建光伏读数和进度条轨道；轨道高 8 像素，并设置底色、圆角与上间距。
  '<div id="bar" style="height:100%;background:#78e5bb;border-radius:8px"></div></div>' + // 创建 id 为 bar 的进度填充层，高度为轨道的 100%，稍后用百分比设置其宽度。
  '<small>绿色条表示光伏占比；数据按时间生成</small>'); // 补充光伏占比说明与教学数据声明，并结束面板创建。
let lastUpdate = -1; // 保存看板上一次更新的秒数；初始为 -1，使首次动画就能刷新数据。
const basePower = 120; // 设置模拟总功率的基础值，单位 kW；后面叠加随时间变化的波动。` : `
panel('<b>智慧能源 · 第 ${stage} 阶段</b><br>${stage === 1 ? '场景：供能站、光伏板、用能楼' : '流动点沿曲线移动，表示能量传递方向'}'); // 创建能源场景说明面板，参数是包含阶段名称和当前观察目标的 HTML。`}
`, {
    camera: [10, 9, 12],
    animate: stage >= 2 ? `markers.forEach((marker, index) => { // 遍历所有流动点；marker 是网格，index 是用于均匀错开进度的索引。
    const progress = (time * 0.12 + index / markers.length) % 1; // time*0.12 表示每秒走完 12% 路径，index/数量均匀错位，%1 将进度循环限制在 0～1。
    marker.position.copy(path.getPointAt(progress)); // getPointAt 按曲线弧长比例取三维坐标；copy 将该坐标写入点的位置，保持点沿管道运动。
  }); // 结束本帧流动点遍历，所有点已沿同一曲线更新到对应的进度位置。
  ${stage >= 3 ? `// DOM 每 0.25 秒更新一次，无需每帧重写文本。
  if (time - lastUpdate > 0.25) { // 只有距上次更新超过 0.25 秒时才刷新网页看板，减少每帧修改文字的开销。
    lastUpdate = time; // 记录本次刷新的秒数，用于判断下一次更新间隔。
    const power = basePower + Math.sin(time * 0.6) * 18; // 模拟总功率：基础值加上正弦波；0.6 是角频率（弧度/秒），18 是波动幅度（kW）。
    const solarPower = 40 + Math.sin(time * 0.35) * 10; // 模拟光伏功率：均值 40 kW、幅度 10 kW、角频率 0.35 弧度/秒；数据由本地时间公式生成。
    const ratio = solarPower / power * 100; // 光伏占比=光伏功率÷总功率×100，结果单位是百分数，两种功率必须使用相同单位。
    dashboard.querySelector('#power').textContent = '总功率 ' + power.toFixed(1) + ' kW'; // 将总功率保留 1 位小数并写入文字节点；toFixed 返回字符串，单位在末尾补为 kW。
    dashboard.querySelector('#solar').textContent = '光伏 ' + solarPower.toFixed(1) + ' kW · 占比 ' + ratio.toFixed(0) + '%'; // 把光伏功率保留 1 位小数、占比保留整数，拼成同一时刻的看板文字。
    dashboard.querySelector('#bar').style.width = ratio + '%'; // 把百分数与 % 拼成 CSS 宽度，使绿色填充条直观表示光伏占总功率的比例。
  } // 结束看板刷新条件块，未达到 0.25 秒间隔时跳过这次网页更新。` : ''}` : '',
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
  }, energy(1), ['solar.rotation.x = -0.3; // 绕 X 轴倾斜，单位为弧度而不是度；负号决定旋转方向，π 弧度等于 180 度。', 'solar.rotation.x = -0.6; // 绕 X 轴倾斜 -0.6 弧度，约为 -34.4 度，负号决定倾斜方向。\nsolar.position.y = 1.25; // 抬高板面中心至 Y=1.25 个场景单位，避免增大倾角后穿进下面的支座。']),
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
  return `import * as THREE from 'three'; // 导入 Three.js，并通过 THREE 名称访问本课使用的三维功能。
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // 导入轨道控制器，负责鼠标旋转、滚轮缩放和拖动平移。

const canvas = document.querySelector('#scene'); // 用 CSS 选择器找到 id 为 scene 的画布，三维画面将绘制到这里。
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); // canvas 指定绘制目标；antialias=true 开启边缘抗锯齿，减少锯齿感。
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 像素比取屏幕倍率与 2 的较小值，在清晰度与显卡负担之间折中。
renderer.setSize(innerWidth, innerHeight); // 依次更新渲染画布的宽和高，单位为 CSS 像素。
const scene = new THREE.Scene(); // 创建场景，作为相机、灯光和可见物体的共同容器。
scene.background = new THREE.Color('#101c2b'); // 使用十六进制颜色设置场景背景，背景本身不会给物体照明。
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100); // 依次为垂直视角 45 度、宽高比、近裁剪面 0.1、远裁剪面 100；裁剪距离用场景单位。
camera.position.set(9, 8, 11); // 参数依次为 X、Y、Z，单位为场景单位；这是相机位置，不是观察目标。
const controls = new OrbitControls(camera, canvas); // 两个参数依次是受控相机、接收鼠标事件的画布，避免拖动其他区域时影响视角。
controls.target.set(0, 1, 0); // 设置观察目标的 X/Y/Z；Y=1 将观察中心抬到物体附近。
controls.enableDamping = true; // 开启阻尼，让旋转和平移逐渐停下；动画循环中必须调用 controls.update()。
scene.add(new THREE.HemisphereLight('#e3f7ff', '#475569', 2)); // 依次传入天空颜色、地面颜色、强度，模拟上下方向的环境照明，并将灯光加入场景。
const light = new THREE.DirectionalLight('#fff4dc', 3); // 依次为方向光颜色、强度；方向光模拟平行光线，常用于表现太阳光。
light.position.set(4, 10, 6); // 按 X、Y、Z 设置灯光位置，单位为场景单位；默认照向原点，方向由二者连线决定。
scene.add(light); // 把方向光加入场景后，渲染时才会计算它对物体的影响。
scene.add(new THREE.GridHelper(20, 20, '#4b948f', '#29434e')); // 网格边长 20、每边分成 20 格；后两个参数是中心线和其他线的颜色，每格为 1 个场景单位。

${tasks.map((task, index) => '// TODO ' + (index + 1) + '：' + task).join('\n')}

let previousTime = 0; // 记录上一帧的时间，单位为秒；初始值用于计算第一次的帧间隔。
renderer.setAnimationLoop(milliseconds => { // 登记持续渲染回调；参数是浏览器提供的毫秒时间戳，不是帧数。
  const time = milliseconds / 1000; // 把毫秒换成秒，time 表示累计时间，可用于周期动画。
  const delta = Math.min(time - previousTime, 0.05); // 计算两帧相隔的秒数；上限 0.05 秒避免切回后台后对象突然跨越很远。
  previousTime = time; // 保存当前秒数，下一帧用它计算新的 delta。
  // TODO：需要动画时，在这里根据 time 或 delta 更新自己的对象。
  if (controls.enabled) controls.update(); // 只有轨道控制器启用时才更新阻尼；漫游模式禁用控制器后不会被它覆盖视角。
  renderer.render(scene, camera); // 用相机观察场景并绘制这一帧；两个参数依次是场景、相机。
}); // 结束挑战的动画回调并登记到渲染器；需要动画时在上方 TODO 区更新对象。
window.addEventListener('resize', () => { // 监听当前预览区域的尺寸变化，使画布和相机在调整大小后保持匹配。
  camera.aspect = innerWidth / innerHeight; // 透视相机宽高比等于预览宽度除以高度；两者都使用 CSS 像素。
  camera.updateProjectionMatrix(); // 通知相机根据新宽高比重算投影矩阵，否则画面会变形或保留旧视角。
  renderer.setSize(innerWidth, innerHeight); // 依次更新渲染画布的宽和高，单位为 CSS 像素。
}); // 结束挑战的尺寸变化回调，并完成窗口 resize 监听的登记。
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
