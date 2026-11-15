// 仅用于组织课程源码；学生运行和导出的代码不依赖此文件。
export function sceneCode(body, options = {}) {
  const {
    camera = [5, 4, 7],
    target = [0, 0, 0],
    animate = '',
    imports = '',
    setup = '',
    background = '#edf2f7',
    controls = false,
    grid = false,
    projection = 'perspective',
    orthoSize = 3,
  } = options;
  const orthographic = projection === 'orthographic';
  const cameraSource = orthographic
    ? `const viewSize = ${orthoSize}; // 正交视野在相机视平面竖直方向的半高，单位为场景单位；增大后同一物体看起来更小。
const aspect = innerWidth / innerHeight; // 预览宽度除以高度，得到无单位的宽高比。
const camera = new THREE.OrthographicCamera( // 正交相机没有近大远小，参数依次为左、右、上、下、近、远裁剪面。
  -viewSize * aspect, viewSize * aspect, // 左、右边界：用宽高比扩展水平视野，防止物体被拉伸。
  viewSize, -viewSize, // 上、下边界：围绕相机视平面中心对称，完整可见高度为 viewSize 的两倍。
  0.1, 100 // 沿相机观察方向的近、远裁剪距离，单位为场景单位；超出裁剪面的部分不会绘制。
); // 完成正交相机的创建。`
    : 'const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100); // 参数依次为垂直视角（度）、宽高比、近裁剪距离、远裁剪距离（场景单位）；视角越大看得越广。';
  const orbitImport = controls ? "import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // 导入鼠标观察控制器，负责旋转、平移和缩放视角。\n" : '';
  const orbitSource = controls ? `
// 拖动鼠标观察；滚轮拉近或拉远。
const controls = new OrbitControls(camera, renderer.domElement); // 参数依次为被控制的相机、接收鼠标事件的画布。
controls.target.set(${target.join(', ')}); // 参数依次为观察目标的 X、Y、Z 世界坐标，单位为场景单位。
controls.enableDamping = true; // 开启缓动，让拖动结束后的观察变化逐渐停下；每帧需要调用 update。
` : '';
  const resizeCamera = orthographic
    ? `  const aspect = innerWidth / innerHeight; // 尺寸变化后重新计算预览区域的宽高比。
  camera.left = -viewSize * aspect; // 按新宽高比更新正交视野左边界，保持垂直可见范围不变。
  camera.right = viewSize * aspect; // 对称更新右边界，避免画面随窗口拉伸。`
    : '  camera.aspect = innerWidth / innerHeight; // 透视相机的宽高比必须与当前预览区域一致，避免物体变形。';
  return `import * as THREE from 'three'; // 将 Three.js 的公开功能导入 THREE 名称下，后续用 THREE.功能名 调用。
${orbitImport}${imports ? `${imports}\n` : ''}
// 1. 场景：放置物体的空间。
const scene = new THREE.Scene(); // 创建三维场景容器，用来组织物体、灯光和背景。
scene.background = new THREE.Color('${background}'); // 参数为十六进制颜色字符串；修改它会改变整个预览的背景色。

// 2. 相机：决定从哪里、朝哪个方向观察。
${cameraSource}
camera.position.set(${camera.join(', ')}); // 按 X、Y、Z 顺序设置相机位置；本例相机没有父级，位置就是世界坐标，Y 向上，单位为场景单位。
camera.lookAt(${target.join(', ')}); // 按 X、Y、Z 顺序指定相机看向的世界坐标；改变目标就会改变朝向。

// 3. 渲染器：把场景和相机转换为画面。
const canvas = document.querySelector('#scene'); // #scene 表示 HTML 中 id 为 scene 的画布元素。
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); // canvas 指定输出画布；antialias 为 true 时启用抗锯齿，减轻边缘锯齿。
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); // 将屏幕像素比限制在 Math.min 的第二个参数以内；上限越高越清晰，也越消耗显卡。
renderer.setSize(innerWidth, innerHeight); // 参数依次为预览宽、高，单位是 CSS 像素；实际绘制像素还会乘以像素比。
${orbitSource}${grid ? '\nscene.add(new THREE.GridHelper(10, 10, 0xb8c6d5, 0xd6dfe9)); // 参数依次为网格边长（场景单位）、每边分段数、中心轴颜色、普通线颜色；网格位于 XZ 平面。\n' : ''}${setup ? `\n${setup}\n` : ''}
// 4. 本节要学习的内容。
${body.trim()}

// 5. 预览区域改变大小时，同时更新相机和画布。
addEventListener('resize', () => { // 监听预览区域的 resize 尺寸变化事件，并执行后面的回调函数。
${resizeCamera}
  camera.updateProjectionMatrix(); // 修改相机投影参数后，重新计算投影矩阵才能反映到画面上。
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); // 重新读取屏幕像素比并限制上限，以适应窗口移到不同显示器的情况。
  renderer.setSize(innerWidth, innerHeight); // 将画布宽、高更新为当前预览尺寸，单位是 CSS 像素。
}); // 结束尺寸变化回调的注册；浏览器改变大小时才会调用它。

let previousTime = 0; // 保存上一帧的时间，单位为秒；let 表示这个值会在后续帧中改变。
function render(milliseconds) { // 浏览器每帧传入时间戳 milliseconds，单位为毫秒；此函数负责更新和绘制画面。
  const time = milliseconds * 0.001; // 毫秒乘以 0.001 转成秒，便于用每秒速度计算动画。
  const delta = Math.min(time - previousTime, 0.05); // 两帧间隔（秒）最多取 0.05，减少切回网页时因间隔过大造成的物体跳动。
  previousTime = time; // 本帧时间留给下一帧计算间隔。
${animate ? `${animate.trim().split('\n').map(line => `  ${line}`).join('\n')}\n` : ''}${controls ? '  controls.update(); // 更新鼠标控制及缓动；开启 enableDamping 后必须每帧调用。\n' : ''}  renderer.render(scene, camera); // 参数依次为要绘制的场景、观察场景的相机。
  requestAnimationFrame(render); // 将 render 函数交给浏览器，在下一帧继续执行；这里传函数名而不是立即调用。
} // 结束每帧执行的 render 函数定义。
requestAnimationFrame(render); // 请求第一帧，启动上面的持续渲染循环。
`;
}

export function makeLesson({ change, ...lesson }) {
  if (change) {
    if (!lesson.code.includes(change[0])) throw new Error(`${lesson.id}: 参考答案替换位置不存在`);
    lesson.solutionCode = lesson.code.replace(change[0], change[1]);
  }
  return lesson;
}
