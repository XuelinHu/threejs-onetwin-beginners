import { sceneCode, makeLesson } from './helpers.js';

const light = `scene.add(new THREE.AmbientLight(0xffffff, 1.4));
const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(4, 6, 5);
scene.add(sun);`;

const lessons = [
  {
    id: 'first-scene', title: '第一张画面与第一行代码', chapter: '01 · 从零开始', level: '入门', minutes: 10,
    summary: '认识 HTML、JavaScript 与 Three.js 各自负责什么。',
    goals: ['找到场景、相机和渲染器', '修改变量并看到对应的变化'],
    explanation: [
      '网页的 HTML 提供画布，JavaScript 描述行为，Three.js 负责组织三维物体。这里已经准备好画布，可以直接编辑右下方的 JavaScript。',
      'const 用来声明变量，字符串写在引号中。scene、camera、renderer 分别代表场景、相机、渲染器；先认识它们，后面的课程会逐一解释。',
      '普通小项目可以放成 index.html、main.js、assets/ 三部分：网页入口、程序、素材。下载本课后可以查看这套结构。',
    ],
    exercise: { task: '把画面中的欢迎语改为“我的第一个三维作品”。', hint: '找到 const message 后面的字符串，只修改引号内的文字。', solution: '修改 message 的值。变量被赋给文字区域的 textContent 后，画面上的文字也随之改变。' },
    focus: 'const message',
    code: sceneCode(`const message = '你好，Three.js！';
document.querySelector('#overlay').textContent = message;

const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);`, { camera: [3, 2, 4] }),
    change: ["const message = '你好，Three.js！';", "const message = '我的第一个三维作品';"],
  },
  {
    id: 'variables-properties', title: '变量与属性：给物体一张配置卡', chapter: '01 · 从零开始', level: '入门', minutes: 10,
    summary: '用字符串、数字和对象，把物体的设置集中写清楚。',
    goals: ['分辨数字与字符串', '通过对象属性读取名字、大小和颜色'],
    explanation: [
      '变量像一个有名字的标签。const size = 1.3 把数字保存为 size；文字需要引号，例如 const name = "设备 A"。数字可以参与计算，字符串可以用加号连接成说明文字。',
      '对象把相关设置放在花括号里，例如 { size: 1.3, color: "#557bea" }。点号用于读取属性：settings.size 是大小，settings.color 是颜色。',
      '配置中的 size 会同时用于几何体尺寸和中心高度，所以改一个数字，方块仍能贴住地面。const 不允许把变量换成另一个对象，但对象本身的属性可以修改；后面会再接触需要重新赋值的 let。',
    ],
    exercise: { task: '只修改配置卡，把设备的边长改为 1.8。', hint: '在 settings 对象中把 size: 1.3 改成 size: 1.8；后面读取 settings.size 的代码不需要改。', solution: '设置值被读取到几何体的宽、高、深中，中心高度又取边长的一半。统一修改配置可以避免多个数字不一致。' },
    focus: 'const settings =',
    code: sceneCode(`const settings = {
  name: '设备 A',
  size: 1.3,
  color: '#557bea'
};
const geometry = new THREE.BoxGeometry(settings.size, settings.size, settings.size);
const material = new THREE.MeshBasicMaterial({ color: settings.color });
const cube = new THREE.Mesh(geometry, material);
cube.position.y = settings.size / 2;
scene.add(cube);
document.querySelector('#overlay').textContent = settings.name + '，边长：' + settings.size;`, { grid: true, camera: [3, 2.5, 4], target: [0, 0.5, 0] }),
    change: ['size: 1.3,', 'size: 1.8,'],
  },
  {
    id: 'draw-circle', title: '画一个圆：形状与颜色', chapter: '01 · 从零开始', level: '入门', minutes: 8,
    summary: '用几何体与材质组合出第一个平面圆。',
    goals: ['理解 Geometry、Material、Mesh 的组合', '修改圆的半径和颜色'],
    explanation: [
      'Geometry 决定形状，Material 决定表面怎么显示，Mesh 把二者组合成可以放进场景的物体。创建物体后，还要用 scene.add 加入场景。',
      'CircleGeometry 的第一个参数是半径，第二个是圆周分段数。这个圆位于 XY 平面，本身没有厚度；它不是球体。',
      'MeshBasicMaterial 不依赖灯光，适合先练习形状与颜色。颜色可以直接使用 CSS 的十六进制颜色字符串。',
    ],
    exercise: { task: '把圆的半径改为 1.6，并把它改成橙色。', hint: '修改 CircleGeometry 的第一个参数，以及 material 的 color。', solution: '半径决定圆的大小；color 改为 #f59e0b 会得到橙色。分段数保持 64 即可。' },
    focus: 'new THREE.CircleGeometry',
    code: sceneCode(`const geometry = new THREE.CircleGeometry(1.1, 64);
const material = new THREE.MeshBasicMaterial({ color: '#4f74ed' });
const circle = new THREE.Mesh(geometry, material);
scene.add(circle);`, { camera: [0, 0, 5] }),
    change: ["const geometry = new THREE.CircleGeometry(1.1, 64);\nconst material = new THREE.MeshBasicMaterial({ color: '#4f74ed' });", "const geometry = new THREE.CircleGeometry(1.6, 64);\nconst material = new THREE.MeshBasicMaterial({ color: '#f59e0b' });"],
  },
  {
    id: 'draw-box', title: '画一个方块：进入三维空间', chapter: '01 · 从零开始', level: '入门', minutes: 8,
    summary: '区分宽、高、深，观察方块的多个面。',
    goals: ['创建 BoxGeometry', '理解三维物体多出来的深度'],
    explanation: [
      'BoxGeometry 的三个参数依次是宽、高、深。它们沿 X、Y、Z 三个方向展开，不是画面上的像素。',
      '相机斜着观察时，可以同时看到多个面。MeshNormalMaterial 根据表面方向显示颜色，帮助你辨认不同朝向。',
    ],
    exercise: { task: '把方块改成“宽 2、高 1、深 0.5”的长方体。', hint: '把 BoxGeometry 的三个参数依次改为 2、1、0.5。', solution: '三个参数分别控制宽、高、深。只修改某一个方向，就会得到对应方向变长或变扁的长方体。' },
    focus: 'new THREE.BoxGeometry',
    code: sceneCode(`const geometry = new THREE.BoxGeometry(1.4, 1.4, 1.4);
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);`, { camera: [3, 2.2, 4] }),
    change: ['new THREE.BoxGeometry(1.4, 1.4, 1.4)', 'new THREE.BoxGeometry(2, 1, 0.5)'],
  },
  {
    id: 'functions-parameters', title: '函数与参数：复用一段造方块的代码', chapter: '01 · 从零开始', level: '入门', minutes: 12,
    summary: '把重复步骤写成函数，再传入不同的尺寸与位置。',
    goals: ['区分定义函数和调用函数', '理解参数如何传进函数'],
    explanation: [
      'function createBox(...) { ... } 是定义一套步骤；只有调用 createBox(...) 时，这些步骤才会执行。函数名后面的括号接收参数，花括号包住需要执行的代码。',
      '调用 createBox(1, 2, 1, 1.2) 时，四个数字依次传给 width、height、depth、x。函数用这些名字创建物体，因此同一段代码可以制造不同的方块。',
      'return cube 把创建的物体返回给调用处。后面的课程还会出现箭头函数：() => { ... } 也是函数的一种写法，常用于告诉浏览器“以后发生某件事时执行什么”。',
    ],
    exercise: { task: '只修改第二次调用，让右边设备的高度从 1.6 变为 2.2。', hint: 'createBox 的第二个参数是 height；不要修改函数定义中的名字。', solution: '把第二次调用改为 createBox(1, 2.2, 1, 1.2)。函数也会自动用 height / 2 抬高中心，保持设备底部贴地。' },
    focus: 'function createBox',
    code: sceneCode(`function createBox(width, height, depth, x) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshNormalMaterial();
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(x, height / 2, 0);
  scene.add(cube);
  return cube;
}

const left = createBox(1, 1, 1, -1.2);
const right = createBox(1, 1.6, 1, 1.2);`, { grid: true, camera: [4, 3.5, 6], target: [0, 0.8, 0] }),
    change: ['createBox(1, 1.6, 1, 1.2)', 'createBox(1, 2.2, 1, 1.2)'],
  },
  {
    id: 'circle-and-sphere', title: '圆与球：平面和体积的区别', chapter: '01 · 从零开始', level: '入门', minutes: 8,
    summary: '把圆和球放在一起，理解二维形状与三维物体。',
    goals: ['创建 SphereGeometry', '通过表面方向辨认球体'],
    explanation: [
      '左边是没有厚度的圆，右边是向各个方向展开的球。球体表面的朝向连续变化，所以法线材质会显示渐变。',
      'SphereGeometry 的参数包括半径、横向分段和纵向分段。分段越少，轮廓越容易出现棱角；分段更多也会增加计算量。',
    ],
    exercise: { task: '把右边的球改成低分段球，观察轮廓的变化。', hint: '把 SphereGeometry 的 40、24 改成 8、6。', solution: '降低横纵分段后，球由更少的面组成，边缘会呈现明显折线。半径不变，所以总体大小保持一致。' },
    focus: 'new THREE.SphereGeometry',
    code: sceneCode(`const material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
const circle = new THREE.Mesh(new THREE.CircleGeometry(0.85, 48), material);
circle.position.x = -1.25;
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.85, 40, 24), material);
sphere.position.x = 1.25;
scene.add(circle, sphere);
document.querySelector('#overlay').textContent = '左：平面圆　　右：立体球';`, { camera: [0, 0.7, 6] }),
    change: ['new THREE.SphereGeometry(0.85, 40, 24)', 'new THREE.SphereGeometry(0.85, 8, 6)'],
  },
  {
    id: 'coordinates', title: '坐标与位置：X、Y、Z', chapter: '02 · 物体与空间', level: '入门', minutes: 10,
    summary: '用坐标轴和网格理解物体放在哪里。',
    goals: ['认识三个坐标方向', '使用 position.set 移动物体'],
    explanation: [
      'AxesHelper 的红、绿、蓝线分别指向 X、Y、Z 正方向。我们通常让 Y 朝上，用 X 和 Z 表示地面上的两个方向。',
      'position.set(x, y, z) 一次设置三个坐标。网格位于 y = 0；一个高为 1 的方块，中心放在 y = 0.5 时，底面正好贴住网格。',
    ],
    exercise: { task: '把方块从原点上方移到 x = 2、y = 0.5、z = 1。', hint: '找到 cube.position.set，只修改其中三个数字。', solution: 'position.set(2, 0.5, 1) 会沿红色 X 方向移动 2 个单位、沿蓝色 Z 方向移动 1 个单位，并维持贴地高度。' },
    focus: 'cube.position.set',
    code: sceneCode(`scene.add(new THREE.AxesHelper(3));
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshNormalMaterial()
);
cube.position.set(0, 0.5, 0);
scene.add(cube);`, { grid: true, camera: [5, 4, 7] }),
    change: ['cube.position.set(0, 0.5, 0);', 'cube.position.set(2, 0.5, 1);'],
  },
  {
    id: 'rotation', title: '旋转：度数与弧度', chapter: '02 · 物体与空间', level: '基础', minutes: 8,
    summary: '绕指定坐标轴旋转物体。',
    goals: ['理解 rotation 的三个方向', '把角度转换为弧度'],
    explanation: [
      'rotation.x、rotation.y、rotation.z 分别控制绕对应轴的旋转。Three.js 的旋转值通常使用弧度，而不是直接填写度数。',
      'Math.PI 表示 180 度，Math.PI / 2 表示 90 度。THREE.MathUtils.degToRad(角度) 可以把熟悉的度数换成弧度。',
    ],
    exercise: { task: '让长方体绕 Y 轴转过 45 度。', hint: '把 degToRad(0) 改成 degToRad(45)。', solution: 'Y 轴朝上，所以绕 Y 轴旋转相当于在地面上改变朝向。先转换为弧度，再赋给 rotation.y。' },
    focus: 'cube.rotation.y',
    code: sceneCode(`const cube = new THREE.Mesh(
  new THREE.BoxGeometry(2.4, 0.6, 0.9),
  new THREE.MeshNormalMaterial()
);
cube.position.y = 0.6;
cube.rotation.y = THREE.MathUtils.degToRad(0);
scene.add(cube);
scene.add(new THREE.AxesHelper(2.5));`, { camera: [4, 4, 6], grid: true }),
    change: ['cube.rotation.y = THREE.MathUtils.degToRad(0);', 'cube.rotation.y = THREE.MathUtils.degToRad(45);'],
  },
  {
    id: 'scale', title: '缩放：改变物体的比例', chapter: '02 · 物体与空间', level: '基础', minutes: 8,
    summary: '区分几何体本身大小与物体缩放。',
    goals: ['使用 scale.set', '辨认等比缩放与单轴缩放'],
    explanation: [
      'scale 的默认值是 (1, 1, 1)，表示保持原大小。三个方向都乘 2 是等比放大，只有一个方向变化则会改变比例。',
      '多个 Mesh 可以共享同一份几何体；对其中一个 Mesh 缩放，不会修改另一个 Mesh 的比例。',
    ],
    exercise: { task: '把右边方块变成两倍高，宽和深保持不变。', hint: 'right.scale.set 的三个参数依次对应 X、Y、Z；同时将中心抬高以保持贴地。', solution: '缩放为 (1, 2, 1)，高度变为 2；中心的 Y 坐标改为 1，底面仍在地面上。' },
    focus: 'right.scale.set',
    code: sceneCode(`const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshNormalMaterial();
const left = new THREE.Mesh(geometry, material);
left.position.set(-1.2, 0.5, 0);
const right = new THREE.Mesh(geometry, material);
right.position.set(1.2, 0.5, 0);
right.scale.set(1, 1, 1);
scene.add(left, right);`, { grid: true, camera: [4, 3, 6] }),
    change: ['right.position.set(1.2, 0.5, 0);\nright.scale.set(1, 1, 1);', 'right.position.set(1.2, 1, 0);\nright.scale.set(1, 2, 1);'],
  },
  {
    id: 'perspective-camera', title: '透视相机：从哪里看物体', chapter: '03 · 相机与观察', level: '基础', minutes: 12,
    summary: '连接相机位置、朝向和最终画面。',
    goals: ['调整 camera.position', '理解 lookAt 与视野角度'],
    explanation: [
      '透视相机呈现近大远小的效果。PerspectiveCamera 的第一个参数是垂直视野角度；角度变大，能看到的范围通常也更大。',
      'position 决定站在哪里，lookAt 决定看向哪里。相机移动后，如果仍要对准原点，就要继续朝向 (0, 0, 0)。',
      '物体在相机背后、超出近远裁剪范围、或没有加入 scene，都会导致看不见。先检查位置和朝向，再检查材质与灯光。',
    ],
    exercise: { task: '把相机放到 (3, 2, 4)，让方块同时露出三个面。', hint: '修改代码顶部的 camera.position.set，保留 lookAt(0, 0, 0)。', solution: '相机沿 X、Y、Z 三个方向都离开原点，再看向方块中心，就可以看见顶面和两个侧面。' },
    focus: 'camera.position.set',
    code: sceneCode(`const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 1.5, 1.5),
  new THREE.MeshNormalMaterial()
);
scene.add(cube);
scene.add(new THREE.AxesHelper(2.5));`, { camera: [0, 0, 5] }),
    change: ['camera.position.set(0, 0, 5);', 'camera.position.set(3, 2, 4);'],
  },
  {
    id: 'arrays-loops', title: '数组与循环：按清单摆放设备', chapter: '03 · 相机与观察', level: '入门', minutes: 12,
    summary: '用一份坐标清单和一个循环创建多个方块。',
    goals: ['通过下标读取数组中的值', '理解 for 循环的起点、条件与更新'],
    explanation: [
      '数组把多个值放进方括号，例如 [-1.8, 0, 1.8]。下标从 0 开始：positions[0] 是第一个值，positions.length 是清单里一共有多少项。',
      'for (let index = 0; index < positions.length; index++) 的意思是：从第 0 项开始；只要下标还在范围内就执行；每次完成后把下标加 1。let 允许 index 的值不断变化。',
      '循环中的每一轮都创建一个新的 Mesh，再读取这一项坐标。几何体和材质放在循环外共享，设备的位置则各自保存。',
    ],
    exercise: { task: '把清单改成四个均匀分布的位置，创建四台设备。', hint: '把 positions 改为 [-2.7, -0.9, 0.9, 2.7]；循环会根据 length 自动多执行一轮。', solution: '数组有四项，循环就执行四次。无需复制创建设备的代码，也无需手动修改循环次数。' },
    focus: 'for (let index',
    code: sceneCode(`const positions = [-1.8, 0, 1.8];
const geometry = new THREE.BoxGeometry(0.8, 1, 0.8);
const material = new THREE.MeshNormalMaterial();
for (let index = 0; index < positions.length; index++) {
  const device = new THREE.Mesh(geometry, material);
  device.position.set(positions[index], 0.5, 0);
  scene.add(device);
}
document.querySelector('#overlay').textContent = '设备数量：' + positions.length;`, { grid: true, camera: [3, 3, 7], target: [0, 0.5, 0] }),
    change: ['const positions = [-1.8, 0, 1.8];', 'const positions = [-2.7, -0.9, 0.9, 2.7];'],
  },
  {
    id: 'orthographic-camera', title: '正交相机：没有近大远小', chapter: '03 · 相机与观察', level: '基础', minutes: 10,
    summary: '体验适合平面示意和等轴视图的观察方式。',
    goals: ['辨认 OrthographicCamera', '调整可见范围 viewSize'],
    explanation: [
      '正交相机使用左、右、上、下四条边界决定可见范围。相同大小的物体，在不同距离处也保持相同的投影尺寸。',
      '这份代码用 viewSize 表示可见区域的一半高度。减小 viewSize 会缩小可见范围，因此物体看起来更大。',
    ],
    exercise: { task: '把 viewSize 从 3 改成 2，观察物体是否变大。', hint: '找到顶部的 const viewSize；不要改方块几何体的大小。', solution: '相机可见范围缩小，但物体实际大小未变，于是它在预览区域占据了更多像素。' },
    focus: 'const viewSize',
    code: sceneCode(`const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshNormalMaterial();
for (let i = 0; i < 3; i++) {
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(i - 1, 0.5, (i - 1) * 1.6);
  scene.add(cube);
}`, { projection: 'orthographic', orthoSize: 3, camera: [5, 4, 7], grid: true }),
    change: ['const viewSize = 3;', 'const viewSize = 2;'],
  },
  {
    id: 'orbit-controls', title: '鼠标观察：拖动、平移与缩放', chapter: '03 · 相机与观察', level: '基础', minutes: 10,
    summary: '给相机加入可操作的轨道控制器。',
    goals: ['导入并创建 OrbitControls', '调整观察中心和距离范围'],
    explanation: [
      'OrbitControls 是 Three.js 的附加模块。它监听画布上的鼠标或触摸操作，改变相机的位置与朝向。',
      '左键拖动旋转，滚轮缩放，右键拖动平移。target 是围绕观察的中心；阻尼开启后，需要每帧调用 controls.update。',
    ],
    exercise: { task: '限制相机只能在 3 到 8 个单位的距离内缩放。', hint: '给 controls.minDistance 和 controls.maxDistance 设置合适的值。', solution: '最小距离设为 3，最大距离设为 8，可以避免贴进物体或拉得过远。拖动仍围绕 target 指定的中心进行。' },
    focus: 'controls.minDistance',
    code: sceneCode(`controls.minDistance = 1;
controls.maxDistance = 20;
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 1.5, 1.5),
  new THREE.MeshNormalMaterial()
);
cube.position.y = 0.75;
scene.add(cube);`, { controls: true, grid: true, target: [0, 0.75, 0] }),
    change: ['controls.minDistance = 1;\ncontrols.maxDistance = 20;', 'controls.minDistance = 3;\ncontrols.maxDistance = 8;'],
  },
  {
    id: 'groups', title: '组合物体：拼一张小桌子', chapter: '04 · 组织场景', level: '基础', minutes: 12,
    summary: '用父子关系一次移动多个零件。',
    goals: ['使用 Group 组织物体', '理解局部坐标与整体变换'],
    explanation: [
      'Group 像一个空的收纳盒。把零件加入同一个 Group 后，移动或旋转 Group 会带动全部子物体。',
      '桌腿的位置是相对于桌子组设置的。先在局部坐标中拼好桌子，再把整组摆到场景中的指定位置，比逐个移动零件更容易维护。',
    ],
    exercise: { task: '把整张桌子绕 Y 轴旋转 30 度。', hint: '修改 table.rotation.y，无需修改五个零件。', solution: '对 table 组应用旋转后，桌面和四条桌腿都会一起转动，子物体之间的相对位置保持不变。' },
    focus: 'table.rotation.y',
    code: sceneCode(`const table = new THREE.Group();
const material = new THREE.MeshNormalMaterial();
const top = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 1.5), material);
top.position.y = 1.5;
table.add(top);
for (const x of [-1, 1]) {
  for (const z of [-0.5, 0.5]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.4, 0.18), material);
    leg.position.set(x, 0.7, z);
    table.add(leg);
  }
}
table.rotation.y = 0;
scene.add(table);`, { controls: true, grid: true, target: [0, 0.7, 0] }),
    change: ['table.rotation.y = 0;', 'table.rotation.y = THREE.MathUtils.degToRad(30);'],
  },
  {
    id: 'materials', title: '材质：颜色、金属与粗糙度', chapter: '05 · 光照与外观', level: '基础', minutes: 12,
    summary: '比较基础材质与受到光照影响的标准材质。',
    goals: ['辨认 MeshBasicMaterial 与 MeshStandardMaterial', '调整 roughness 和 metalness'],
    explanation: [
      '基础材质不会因为灯的位置改变而产生明暗。标准材质会根据光照、粗糙度和金属度计算外观，适合表现常见实体表面。',
      'roughness 接近 1 时表面更粗糙，接近 0 时更光滑；metalness 接近 1 时更像金属。金属表面还需要合适的灯光或环境才能看清，不能只调整一个数字。',
    ],
    exercise: { task: '把右侧球的粗糙度改为 0.2，并观察高光。', hint: '只修改 standardMaterial 的 roughness，保留灯光。', solution: '粗糙度降低后，高光通常会变得更集中。这里保留一定金属度与方向光，便于观察光滑表面的变化。' },
    focus: 'roughness: 0.8',
    code: sceneCode(`const geometry = new THREE.SphereGeometry(0.8, 40, 24);
const basic = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: '#527be8' }));
basic.position.x = -1.2;
const standardMaterial = new THREE.MeshStandardMaterial({
  color: '#527be8', metalness: 0.35, roughness: 0.8
});
const standard = new THREE.Mesh(geometry, standardMaterial);
standard.position.x = 1.2;
scene.add(basic, standard);
document.querySelector('#overlay').textContent = '左：基础材质　　右：标准材质';`, { setup: light, controls: true, camera: [0, 1.2, 6] }),
    change: ['roughness: 0.8', 'roughness: 0.2'],
  },
  {
    id: 'lights', title: '光照：让物体有明暗', chapter: '05 · 光照与外观', level: '基础', minutes: 10,
    summary: '用环境光与方向光塑造立体感。',
    goals: ['区分环境光和方向光', '改变光源方向'],
    explanation: [
      '环境光为场景提供均匀的基础照明，方向光沿统一方向照亮物体。二者结合能让暗面保留细节，同时看见明暗变化。',
      '方向光的 position 和 target 一起决定照射方向。这里默认 target 在原点，移动 sun.position 就可以改变受光的一侧。',
    ],
    exercise: { task: '把主光从物体右侧移到左侧。', hint: '把 sun.position.set 的第一个参数从 4 改成 -4。', solution: 'X 坐标从正变负，相当于把灯移到另一侧；球的亮面和方块的受光面会跟着改变。' },
    focus: 'sun.position.set',
    code: sceneCode(`scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(4, 5, 3);
scene.add(sun);
const material = new THREE.MeshStandardMaterial({ color: '#7191ef', roughness: 0.5 });
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.9, 40, 24), material);
sphere.position.x = -1.2;
const cube = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), material);
cube.position.x = 1.2;
scene.add(sphere, cube);`, { controls: true, camera: [0, 1.7, 6] }),
    change: ['sun.position.set(4, 5, 3);', 'sun.position.set(-4, 5, 3);'],
  },
  {
    id: 'shadows', title: '阴影：三个开关都要打开', chapter: '05 · 光照与外观', level: '基础', minutes: 12,
    summary: '让方块把影子投到地面上。',
    goals: ['开启渲染器阴影', '设置投射者、接收者和光源'],
    explanation: [
      '阴影需要渲染器允许计算、光源投射阴影、物体投射阴影以及地面接收阴影。这几处缺少任意一项，都可能看不到预期效果。',
      '阴影贴图越大通常越细致，但也更占资源。先用 1024 尺寸观察，再按画面需要调整，而不是直接设成最大值。',
    ],
    exercise: { task: '关闭方块的 castShadow，再打开它，对比地面的变化。', hint: '把 cube.castShadow 改成 false；参考答案展示关闭状态。', solution: '方块仍然可见和受光，但不再参与投射阴影；地面上的方块影子消失。改回 true 即可恢复。' },
    focus: 'cube.castShadow',
    code: sceneCode(`renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
scene.add(new THREE.AmbientLight(0xffffff, 1.2));
const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(3, 6, 3);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 1.5, 1.5),
  new THREE.MeshStandardMaterial({ color: '#557bea' })
);
cube.position.y = 0.75;
cube.castShadow = true;
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({ color: '#e2e7ef' })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(cube, ground);`, { controls: true, target: [0, 0.5, 0], camera: [4, 4, 6] }),
    change: ['cube.castShadow = true;', 'cube.castShadow = false;'],
  },
  {
    id: 'image-textures', title: '图片贴图：给方块贴上图案', chapter: '06 · 纹理与贴图', level: '基础', minutes: 12,
    summary: '从项目素材加载图片并应用到表面。',
    goals: ['使用 TextureLoader', '理解相对路径与颜色空间'],
    explanation: [
      '纹理是映射到物体表面的图像。TextureLoader 加载图片后，把结果传给材质的 map 属性；加载是异步过程，图片准备好后会自动参与后续渲染。',
      'assets/checker.svg 是课程自带的小素材，路径相对于网页入口，不是电脑的磁盘路径。保存完整项目后，在别的电脑运行也能找到它。',
      '用于颜色的图片通常需要标记为 SRGBColorSpace，使颜色按预期显示。法线、粗糙度等数据贴图则有不同的用途。',
    ],
    exercise: { task: '把棋盘图案替换成自带的金属纹理。', hint: '把 assets/checker.svg 改成 assets/metal.svg。', solution: '保持几何体不变，仅替换加载的图片路径。同一份模型可以通过换材质和纹理获得不同外观。' },
    focus: "load('assets/checker.svg')",
    code: sceneCode(`const texture = new THREE.TextureLoader().load('assets/checker.svg');
texture.colorSpace = THREE.SRGBColorSpace;
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshStandardMaterial({ map: texture, roughness: 0.65 })
);
scene.add(cube);`, { setup: light, controls: true, camera: [4, 3, 5] }),
    change: ["load('assets/checker.svg')", "load('assets/metal.svg')"],
  },
  {
    id: 'uv-repeat', title: 'UV 与重复：铺满一块地板', chapter: '06 · 纹理与贴图', level: '进阶', minutes: 12,
    summary: '用 UV 坐标理解图片如何铺到几何体表面。',
    goals: ['理解 U、V 表示图片中的位置', '配置 RepeatWrapping 与 repeat'],
    explanation: [
      'UV 把几何体表面的位置对应到图片中的位置。可以把 U 理解为图片的横向，V 理解为纵向；平面的默认 UV 通常覆盖整张图。',
      '要让图片重复，既要把 wrapS、wrapT 设置为 RepeatWrapping，也要设置 repeat 次数。只改 repeat 而保留默认包裹方式，结果可能是边缘被拉伸。',
      '复杂模型的 UV 一般在建模工具里展开；在 Three.js 中可以读取 UV，并调整纹理的重复、偏移和旋转。',
    ],
    exercise: { task: '让地板横纵方向各重复 6 次。', hint: '把 texture.repeat.set 的两个参数都改为 6。', solution: '两个方向分别控制 U、V 的重复。设置为 (6, 6) 后，纹理在整块平面上形成六行六列的重复图案。' },
    focus: 'texture.repeat.set',
    code: sceneCode(`const texture = new THREE.TextureLoader().load('assets/checker.svg');
texture.colorSpace = THREE.SRGBColorSpace;
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(2, 2);
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(6, 6),
  new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);`, { setup: light, controls: true, camera: [4, 5, 6] }),
    change: ['texture.repeat.set(2, 2);', 'texture.repeat.set(6, 6);'],
  },
  {
    id: 'canvas-textures', title: '自己生成纹理：制作设备铭牌', chapter: '06 · 纹理与贴图', level: '进阶', minutes: 15,
    summary: '用 Canvas 绘制文字，然后把它变成贴图。',
    goals: ['使用 CanvasTexture', '理解动态更新与 needsUpdate'],
    explanation: [
      '纹理不一定来自图片文件，也可以来自画布。先用浏览器的二维 Canvas 绘制背景和文字，再用 CanvasTexture 把画布交给 Three.js。',
      '铭牌、编号、简单仪表可以采用这种方式生成。画布内容后来发生改变时，需要把 texture.needsUpdate 设为 true，才能再次上传到显卡。',
    ],
    exercise: { task: '把铭牌上的“PUMP 01”改为“设备 02”。', hint: '修改 labelText 字符串，其他 Canvas 绘图代码保持不变。', solution: 'fillText 使用 labelText 绘制文字。重新运行后先生成新画布，再创建纹理，所以新文字会出现在物体表面。' },
    focus: 'const labelText',
    code: sceneCode(`const labelText = 'PUMP 01';
const label = document.createElement('canvas');
label.width = 512;
label.height = 256;
const context = label.getContext('2d');
context.fillStyle = '#16334f';
context.fillRect(0, 0, 512, 256);
context.fillStyle = '#6ee7c4';
context.fillRect(24, 24, 464, 8);
context.fillStyle = '#ffffff';
context.font = 'bold 54px sans-serif';
context.textAlign = 'center';
context.fillText(labelText, 256, 145);
const texture = new THREE.CanvasTexture(label);
texture.colorSpace = THREE.SRGBColorSpace;
const sign = new THREE.Mesh(
  new THREE.PlaneGeometry(3.4, 1.7),
  new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
);
scene.add(sign);`, { controls: true, camera: [0, 0.5, 5] }),
    change: ["const labelText = 'PUMP 01';", "const labelText = '设备 02';"],
  },
  {
    id: 'animation', title: '动画：让物体按时间运动', chapter: '07 · 动画与交互', level: '基础', minutes: 12,
    summary: '用连续渲染和时间函数控制运动。',
    goals: ['理解 requestAnimationFrame', '使用秒而不是帧数驱动动画'],
    explanation: [
      '浏览器通过 requestAnimationFrame 安排下一帧。每一帧先更新物体状态，再调用 renderer.render，连续起来就是动画。',
      '本例将毫秒换算成秒，并用 time 计算旋转。这样在不同帧率的电脑上，相同时间对应的旋转角度仍然一致。',
      'Math.sin(time) 产生往返变化，可以用于浮动和摆动。乘在 time 上的数字控制速度，外面的数字控制幅度。',
    ],
    exercise: { task: '把方块的旋转速度加倍，保留上下浮动。', hint: '在 render 函数里，把 time * 0.6 改成 time * 1.2。', solution: '旋转角度由经过的秒数乘以速度得到。将系数翻倍，会在相同时间内旋转两倍角度；浮动使用另一条语句控制。' },
    focus: 'cube.rotation.y = time',
    code: sceneCode(`const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 1.5, 1.5),
  new THREE.MeshNormalMaterial()
);
scene.add(cube);`, { controls: true, camera: [3, 2, 5], animate: 'cube.rotation.y = time * 0.6;\ncube.position.y = Math.sin(time * 1.5) * 0.3;' }),
    change: ['cube.rotation.y = time * 0.6;', 'cube.rotation.y = time * 1.2;'],
  },
  {
    id: 'curve-motion', title: '路径运动：沿管线移动的小球', chapter: '07 · 动画与交互', level: '进阶', minutes: 15,
    summary: '为后面的产线和能源流动打下基础。',
    goals: ['用控制点创建曲线', '按进度取得路径上的位置'],
    explanation: [
      '曲线由几个 Vector3 控制点定义。TubeGeometry 沿曲线创建管道，曲线的 getPointAt 则可以按进度取得对应的位置。',
      '进度从 0 到 1；用取余运算 % 让它不断回到起点，就能形成循环运动。这里是位置动画，尚未模拟真实流体。',
    ],
    exercise: { task: '把小球沿路径移动的速度加倍。', hint: '找到 render 中的 time * 0.12，将 0.12 改为 0.24。', solution: '进度增加得更快，小球就会更快经过同一条路径。管道的几何形状和控制点无需改变。' },
    focus: 'curve.getPointAt',
    code: sceneCode(`const curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-2.5, 0, 0),
  new THREE.Vector3(-1, 0, 1),
  new THREE.Vector3(1, 1, 0),
  new THREE.Vector3(2.5, 0, -0.5)
]);
const pipe = new THREE.Mesh(
  new THREE.TubeGeometry(curve, 80, 0.09, 10, false),
  new THREE.MeshBasicMaterial({ color: '#92a9cc' })
);
const marker = new THREE.Mesh(
  new THREE.SphereGeometry(0.18, 20, 14),
  new THREE.MeshBasicMaterial({ color: '#f59e0b' })
);
scene.add(pipe, marker);`, { controls: true, camera: [4, 4, 6], animate: 'marker.position.copy(curve.getPointAt((time * 0.12) % 1));' }),
    change: ['time * 0.12', 'time * 0.24'],
  },
  {
    id: 'events-conditions', title: '事件与判断：点击按钮启动旋转', chapter: '07 · 动画与交互', level: '基础', minutes: 12,
    summary: '在点击发生时改变状态，再根据状态决定是否运动。',
    goals: ['理解事件回调并非立即执行', '用布尔值与 if 控制动画'],
    explanation: [
      'addEventListener("click", 函数) 表示注册一个回调：现在把函数交给浏览器，等用户点击时再调用。()=>{...} 是箭头函数写法；括号里没有内容表示这段回调不需要参数。',
      'running 是布尔值，只能表示 true 或 false。!running 会取反；点击一次变为启动，再点击一次变为暂停。用 let 声明是因为它需要重新赋值。',
      'if (running) 只在状态为 true 时执行花括号内的代码，else 处理另一种情况。按钮文字与动画都读取同一个状态，所以能保持一致。',
    ],
    exercise: { task: '让点击启动后的旋转速度加倍，同时保留暂停功能。', hint: '在 render 函数的 if (running) 中，把 delta * 0.8 改成 delta * 1.6。', solution: '事件只负责切换 running；每一帧的 if 决定是否转动。修改运动系数不会影响启动、暂停的判断逻辑。' },
    focus: "button.addEventListener('click'",
    code: sceneCode(`const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 1.5, 1.5),
  new THREE.MeshNormalMaterial()
);
scene.add(cube);
let running = false;
const button = document.createElement('button');
button.textContent = '启动旋转';
button.addEventListener('click', () => {
  running = !running;
  if (running) {
    button.textContent = '暂停旋转';
  } else {
    button.textContent = '启动旋转';
  }
});
document.querySelector('#overlay').append(button);`, { controls: true, camera: [3, 2, 5], animate: 'if (running) {\n  cube.rotation.y += delta * 0.8;\n}' }),
    change: ['cube.rotation.y += delta * 0.8;', 'cube.rotation.y += delta * 1.6;'],
  },
  {
    id: 'raycasting', title: '点击选择：给设备换状态', chapter: '07 · 动画与交互', level: '进阶', minutes: 15,
    summary: '把鼠标点击转换成三维物体选择。',
    goals: ['使用 Raycaster', '把画布坐标换算为标准化坐标'],
    explanation: [
      'Raycaster 从相机出发，沿鼠标指向发出一条虚拟射线，找出与它相交的物体。通常使用最近的相交结果处理点击。',
      '鼠标坐标先减去画布左上角，再换算到 -1 到 1 的区间。这样即使预览区域只是整个网页的一部分，点击位置也仍然准确。',
      '本例给每个方块独立的材质。若多个物体共享同一材质，修改颜色可能会同时影响它们。',
    ],
    exercise: { task: '把点击选中后的高亮颜色改为橙色。', hint: '找到 hit.object.material.color.set，修改颜色字符串。', solution: '射线负责找中哪个物体，材质负责改变它的外观；把高亮色改为 #f59e0b 即可。' },
    focus: 'raycaster.setFromCamera',
    code: sceneCode(`const devices = [];
for (let i = 0; i < 3; i++) {
  const device = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 1.3, 0.9),
    new THREE.MeshBasicMaterial({ color: '#6486ea' })
  );
  device.position.set((i - 1) * 1.5, 0.65, 0);
  device.name = '设备 ' + (i + 1);
  devices.push(device);
  scene.add(device);
}
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
canvas.addEventListener('click', event => {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(devices)[0];
  if (hit) {
    devices.forEach(device => device.material.color.set('#6486ea'));
    hit.object.material.color.set('#34c49b');
    document.querySelector('#overlay').textContent = '已选中：' + hit.object.name;
  }
});
document.querySelector('#overlay').textContent = '点击任意设备，观察状态颜色';`, { controls: true, grid: true, camera: [3, 3, 6], target: [0, 0.65, 0] }),
    change: ["hit.object.material.color.set('#34c49b');", "hit.object.material.color.set('#f59e0b');"],
  },
  {
    id: 'gltf-model', title: '模型加载：从方块走向设备', chapter: '08 · 资源与完整项目', level: '进阶', minutes: 15,
    summary: '加载课程自带的小型 glTF 模型。',
    goals: ['导入 GLTFLoader', '把加载的模型加入场景并调整位置'],
    explanation: [
      '复杂模型可以在建模工具里制作，再导出为 glTF 或 GLB。GLTFLoader 会读取模型、材质、层级，有时还包含动画。',
      '资源不会立即准备好：loadAsync 返回一个 Promise，表示一个将来才能得到的结果。await 表示在这段模块代码中等待它完成，再执行下一行；加载结果的 scene 是模型的根物体，可以像 Group 一样变换。',
      '另一种写法是 loader.load(路径, 成功回调)。成功回调是在资源准备好之后才被调用的函数，和“点击之后执行”类似；本课用 await，让读取顺序更直观。',
      '本课的教学模型和数据随项目提供。先学会加载这个小模型，再换成合法获得的复杂素材；不要把别人的整套页面当成模型加载。',
    ],
    exercise: { task: '把模型绕 Y 轴转过 90 度。', hint: '修改 model.rotation.y，使用 Math.PI / 2。', solution: '加载后的根物体可以使用与普通 Mesh 相同的变换属性。对根物体旋转会带动模型中的全部零件。' },
    focus: 'await loader.loadAsync',
    code: sceneCode(`const loader = new GLTFLoader();
document.querySelector('#overlay').textContent = '正在加载课程模型…';
const result = await loader.loadAsync('assets/training-machine.gltf');
const model = result.scene;
model.rotation.y = 0;
scene.add(model);
document.querySelector('#overlay').textContent = '模型已加载；可拖动鼠标观察';`, { imports: "import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';", setup: light, controls: true, grid: true, camera: [4, 3, 5], target: [0, 0.8, 0] }),
    change: ['model.rotation.y = 0;', 'model.rotation.y = Math.PI / 2;'],
  },
  {
    id: 'loading-feedback', title: '加载反馈：等待与错误也要可见', chapter: '08 · 资源与完整项目', level: '进阶', minutes: 12,
    summary: '用真实加载状态解释等待，并显示失败原因。',
    goals: ['使用 LoadingManager', '用 try/catch 处理加载失败'],
    explanation: [
      '加载过程可能经历等待、成功或失败。LoadingManager 可以报告资源项目的完成数量；这个数量不是文件传输的字节百分比。',
      'manager.onProgress 接收一个回调函数：加载器在资源项目完成时调用它，并传入路径、已完成数量、总数量。注册函数的这一刻不会立即得到完成结果。',
      'try/catch 可以捕获 await 加载失败，并调用统一的 showError 函数。按钮也调用同一函数来演示错误画面；模拟不会请求不存在的文件，正常运行仍会加载真实的课程模型。',
    ],
    exercise: { task: '给错误提示补上“请点击运行重试”，再点击“模拟加载失败”检查结果。', hint: '在 showError 函数中，给 message.textContent 的字符串末尾增加重试建议。不要修改正确的模型路径。', solution: '正常加载与错误反馈共用同一套界面。按钮调用 showError 展示模拟情况；真实加载失败时 catch 也调用它，所以新增的重试建议在两种情况下都会显示。' },
    focus: 'function showError',
    code: sceneCode(`const status = document.querySelector('#overlay');
const message = document.createElement('div');
const simulateButton = document.createElement('button');
simulateButton.textContent = '模拟加载失败';
status.append(message, simulateButton);
function showError(error) {
  message.textContent = '加载失败：' + error.message;
}
simulateButton.addEventListener('click', () => {
  showError(new Error('模拟：资源暂时不可用'));
});
const manager = new THREE.LoadingManager();
manager.onProgress = (url, loaded, total) => {
  message.textContent = '资源项目：' + loaded + ' / ' + total;
};
const loader = new GLTFLoader(manager);
const modelPath = 'assets/training-machine.gltf';
try {
  message.textContent = '正在准备模型…';
  const result = await loader.loadAsync(modelPath);
  scene.add(result.scene);
  message.textContent = '加载完成：可以开始观察';
} catch (error) {
  showError(error);
}`, { imports: "import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';", setup: light, controls: true, grid: true, camera: [4, 3, 5], target: [0, 0.8, 0] }),
    change: ["message.textContent = '加载失败：' + error.message;", "message.textContent = '加载失败：' + error.message + '。请点击运行重试。';"],
  },
  {
    id: 'responsive', title: '屏幕适配：拉伸区域也不变形', chapter: '08 · 资源与完整项目', level: '进阶', minutes: 10,
    summary: '理解画布尺寸、相机宽高比与像素比例。',
    goals: ['同时更新相机和渲染器尺寸', '认识 devicePixelRatio 的资源成本'],
    explanation: [
      '透视相机的 aspect 要与预览区域的宽高比一致。区域大小改变时，只改画布大小而不改相机，物体就可能被压扁或拉长。',
      'resize 中先更新 camera.aspect，再更新投影矩阵和 renderer 尺寸。本站切换预览大小时会触发这段逻辑。',
      'devicePixelRatio 控制实际绘制像素与 CSS 像素的比例。限制到 2 是一个折中；性能较弱的设备可以进一步限制到 1。',
    ],
    exercise: { task: '把渲染像素比例上限改为 1，比较细节和流畅度。', hint: '代码有初始化与 resize 两处设置；两处 Math.min 的上限都要改。', solution: '统一限制到 1 可以减少实际绘制像素。预览尺寸和相机宽高比不变，物体比例仍然正确，但边缘精细度可能降低。' },
    focus: 'camera.aspect =',
    code: sceneCode(`const ring = new THREE.Mesh(
  new THREE.TorusGeometry(1.1, 0.3, 20, 72),
  new THREE.MeshNormalMaterial()
);
scene.add(ring);
document.querySelector('#overlay').textContent = '调整预览区域大小，圆环应保持正确比例';`, { controls: true, camera: [0, 0.5, 4] }),
    change: ['renderer.setPixelRatio(Math.min(devicePixelRatio, 2));', 'renderer.setPixelRatio(Math.min(devicePixelRatio, 1));'],
  },
  {
    id: 'instancing', title: '性能入门：用实例绘制一组设备', chapter: '08 · 资源与完整项目', level: '进阶', minutes: 18,
    summary: '把大量相似物体组织成 InstancedMesh。',
    goals: ['认识绘制调用与三角形数量', '用实例复用同一份几何体和材质'],
    explanation: [
      '画面压力不仅取决于模型大小，也与绘制调用、材质、阴影、贴图和屏幕像素有关。先测量，再决定优化哪一部分。',
      'InstancedMesh 适合几何体和材质相同、变换不同的一组物体。每个实例保存自己的变换矩阵，从而减少逐个 Mesh 绘制的开销。',
      '这里展示 renderer.info 的实际统计，代表当前预览的绘制情况，不是整台电脑的显卡使用率。综合项目中还应按需要释放不再使用的几何体、材质和纹理。',
    ],
    exercise: { task: '把每排设备从 10 个改成 15 个，观察实例数和绘制统计。', hint: '修改 countPerRow；总数量由它的平方计算，循环也使用同一个变量。', solution: '总设备数从 100 增加到 225。它们仍由一份 InstancedMesh 管理，三角形数量会增加，但设备这一批的绘制调用通常保持很少。' },
    focus: 'new THREE.InstancedMesh',
    code: sceneCode(`const countPerRow = 10;
const count = countPerRow * countPerRow;
const geometry = new THREE.BoxGeometry(0.3, 0.55, 0.3);
const material = new THREE.MeshNormalMaterial();
const devices = new THREE.InstancedMesh(geometry, material, count);
const helper = new THREE.Object3D();
let index = 0;
for (let row = 0; row < countPerRow; row++) {
  for (let col = 0; col < countPerRow; col++) {
    helper.position.set((col - (countPerRow - 1) / 2) * 0.45, 0.275,
      (row - (countPerRow - 1) / 2) * 0.45);
    helper.updateMatrix();
    devices.setMatrixAt(index++, helper.matrix);
  }
}
devices.instanceMatrix.needsUpdate = true;
scene.add(devices);
const status = document.querySelector('#overlay');`, { controls: true, grid: true, camera: [6, 6, 8], animate: "status.textContent = '实例：' + count + '　绘制调用：' + renderer.info.render.calls\n  + '　三角形：' + renderer.info.render.triangles;" }),
    change: ['const countPerRow = 10;', 'const countPerRow = 15;'],
  },
].map(makeLesson);

// 本课修改两处像素比例上限，答案需同时覆盖初始化与尺寸变化。
const responsive = lessons.find(lesson => lesson.id === 'responsive');
responsive.solutionCode = responsive.code.replaceAll('Math.min(devicePixelRatio, 2)', 'Math.min(devicePixelRatio, 1)');

export default lessons;
