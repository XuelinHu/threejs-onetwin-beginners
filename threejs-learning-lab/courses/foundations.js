import { sceneCode, makeLesson } from './helpers.js';

const light = `scene.add(new THREE.AmbientLight(0xffffff, 1.4)); // 添加环境光；参数依次是颜色与强度，为背光面提供均匀的基础照明。
const sun = new THREE.DirectionalLight(0xffffff, 3); // 创建方向光；参数依次是颜色与强度，照射方向由 position 与 target 共同确定。
sun.position.set(4, 6, 5); // 设置方向光的 x、y、z，单位为场景单位，默认照射目标位于原点。
scene.add(sun); // 把方向光加入场景，使标准材质得到有方向的照明。`;

const lessons = [
  {
    id: 'first-scene', title: '第一张画面与第一行代码', chapter: '01 · 从零开始', level: '入门', minutes: 10,
    summary: '认识 HTML、JavaScript 与 Three.js 各自负责什么。',
    goals: ['找到场景、相机和渲染器', '修改变量并看到对应的变化'],
    explanation: [
      '网页的 HTML 提供画布，JavaScript 描述行为，Three.js 负责组织三维物体。这里已经准备好画布，点击“查看代码”即可在弹窗中编辑带逐行中文注释的 JavaScript。',
      'const 用来声明变量，字符串写在引号中。scene、camera、renderer 分别代表场景、相机、渲染器；先认识它们，后面的课程会逐一解释。',
      '普通小项目可以放成 index.html、main.js、assets/ 三部分：网页入口、程序、素材。下载本课后可以查看这套结构。',
    ],
    exercise: { task: '把画面中的欢迎语改为“我的第一个三维作品”。', hint: '找到 const message 后面的字符串，只修改引号内的文字。', solution: '修改 message 的值。变量被赋给文字区域的 textContent 后，画面上的文字也随之改变。' },
    focus: 'const message',
    code: sceneCode(`const message = '你好，Three.js！'; // 声明欢迎语变量；const 声明的变量不能重新赋值，引号包住要显示的文字。
document.querySelector('#overlay').textContent = message; // 用 #overlay 选择文字区域，textContent 只显示纯文本，不把文字当作 HTML。

const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5); // BoxGeometry 的参数依次为 X 方向宽度、Y 方向高度、Z 方向深度，单位是场景单位而非像素。
const material = new THREE.MeshNormalMaterial(); // 创建法线材质；按表面法线方向着色，不需要额外灯光。
const cube = new THREE.Mesh(geometry, material); // Mesh 的两个参数依次是几何体 geometry 和材质 material，将形状与外观组合成网格物体。
scene.add(cube); // 把方块加入场景；只创建 Mesh 而不 add，渲染时不会显示。`, { camera: [3, 2, 4] }),
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
    code: sceneCode(`const settings = { // 定义设备配置对象；花括号中的属性把同一设备的设置放在一起。
  name: '设备 A', // name 是设备名称，字符串需要用引号包住。
  size: 1.3, // size 是方块边长，使用场景单位；同时用于几何体尺寸与中心高度。
  color: '#557bea' // color 是十六进制颜色字符串；三对十六进制数字依次表示红、绿、蓝分量。
}; // 结束设备配置对象定义。
const geometry = new THREE.BoxGeometry(settings.size, settings.size, settings.size); // 三个参数依次为宽、高、深；都读取 settings.size，得到等边方块。
const material = new THREE.MeshBasicMaterial({ color: settings.color }); // 基础材质的 color 读取配置颜色；它不计算灯光明暗，颜色不因光源位置改变。
const cube = new THREE.Mesh(geometry, material); // Mesh 的两个参数依次是几何体 geometry 和材质 material，将形状与外观组合成网格物体。
cube.position.y = settings.size / 2; // 设置中心的 Y 坐标为边长的一半，确保底面落在 y=0 的地面上。
scene.add(cube); // 把方块加入场景；只创建 Mesh 而不 add，渲染时不会显示。
document.querySelector('#overlay').textContent = settings.name + '，边长：' + settings.size; // 读取配置对象的名称与尺寸，用加号连接为画面说明文字。`, { grid: true, camera: [3, 2.5, 4], target: [0, 0.5, 0] }),
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
    code: sceneCode(`const geometry = new THREE.CircleGeometry(1.1, 64); // CircleGeometry 参数依次为半径、圆周分段数；圆位于 XY 平面，分段越多轮廓越圆滑。
const material = new THREE.MeshBasicMaterial({ color: '#4f74ed' }); // 创建不依赖灯光的基础材质，color 使用十六进制颜色字符串。
const circle = new THREE.Mesh(geometry, material); // 将圆的几何体与材质组合为 Mesh，此时尚未加入场景。
scene.add(circle); // 将平面圆加入场景，使相机有机会看见它。`, { camera: [0, 0, 5] }),
    change: ["const geometry = new THREE.CircleGeometry(1.1, 64); // CircleGeometry 参数依次为半径、圆周分段数；圆位于 XY 平面，分段越多轮廓越圆滑。\nconst material = new THREE.MeshBasicMaterial({ color: '#4f74ed' }); // 创建不依赖灯光的基础材质，color 使用十六进制颜色字符串。","const geometry = new THREE.CircleGeometry(1.6, 64); // CircleGeometry 参数依次为半径、圆周分段数；圆位于 XY 平面，分段越多轮廓越圆滑。\nconst material = new THREE.MeshBasicMaterial({ color: '#f59e0b' }); // 创建不依赖灯光的基础材质，color 使用十六进制颜色字符串。"],
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
    code: sceneCode(`const geometry = new THREE.BoxGeometry(1.4, 1.4, 1.4); // 三个参数依次为沿 X 的宽、沿 Y 的高、沿 Z 的深，单位均为场景单位。
const material = new THREE.MeshNormalMaterial(); // 创建法线材质；按表面法线方向着色，不需要额外灯光。
const cube = new THREE.Mesh(geometry, material); // Mesh 的两个参数依次是几何体 geometry 和材质 material，将形状与外观组合成网格物体。
scene.add(cube); // 把方块加入场景；只创建 Mesh 而不 add，渲染时不会显示。`, { camera: [3, 2.2, 4] }),
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
    code: sceneCode(`function createBox(width, height, depth, x) { // 定义造方块函数；width、height、depth 是宽高深，x 是中心 X 坐标，均使用场景单位。
  const geometry = new THREE.BoxGeometry(width, height, depth); // 读取函数参数 width、height、depth，依次创建对应宽、高、深的长方体。
  const material = new THREE.MeshNormalMaterial(); // 创建法线材质；按表面法线方向着色，不需要额外灯光。
  const cube = new THREE.Mesh(geometry, material); // Mesh 的两个参数依次是几何体 geometry 和材质 material，将形状与外观组合成网格物体。
  cube.position.set(x, height / 2, 0); // position.set 依次接收 x、y、z；中心高度取 height/2，使方块底面贴住 y=0。
  scene.add(cube); // 把方块加入场景；只创建 Mesh 而不 add，渲染时不会显示。
  return cube; // 把创建好的网格返回给调用处，便于后面继续移动或修改它。
} // 结束造方块函数定义，只有调用该函数时才执行其中步骤。

const left = createBox(1, 1, 1, -1.2); // 调用造方块函数；四个参数依次是宽、高、深、中心 X 坐标，返回值保存到 left。
const right = createBox(1, 1.6, 1, 1.2); // 调用同一函数创建右侧方块；四个参数仍依次表示宽、高、深、中心 X 坐标。`, { grid: true, camera: [4, 3.5, 6], target: [0, 0.8, 0] }),
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
    code: sceneCode(`const material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }); // 创建法线材质；side: DoubleSide 表示正反两面都显示，适合观察无厚度的圆。
const circle = new THREE.Mesh(new THREE.CircleGeometry(0.85, 48), material); // 创建平面圆网格；CircleGeometry 的两个参数依次为半径与圆周分段数，material 决定外观。
circle.position.x = -1.25; // 只修改圆中心的 X 坐标，负值沿 X 轴负方向平移，Y、Z 保持原值。
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.85, 40, 24), material); // 创建球体网格；SphereGeometry 参数依次为半径、水平分段数、垂直分段数；material 决定外观。
sphere.position.x = 1.25; // 只修改球中心的 X 坐标，正值沿 X 轴正方向平移。
scene.add(circle, sphere); // 一次把圆和球加入场景；add 可以接收多个物体。
document.querySelector('#overlay').textContent = '左：平面圆　　右：立体球'; // 在文字区域标明左右两个物体，帮助比较二维平面与三维体积。`, { camera: [0, 0.7, 6] }),
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
    code: sceneCode(`scene.add(new THREE.AxesHelper(3)); // 创建坐标轴辅助线；参数是轴线长度，红、绿、蓝分别表示 X、Y、Z 正方向。
const cube = new THREE.Mesh( // 开始创建方块网格；下两行依次提供几何体与材质。
  new THREE.BoxGeometry(1, 1, 1), // 创建单位方块；参数依次为宽、高、深，单位为场景单位。
  new THREE.MeshNormalMaterial() // 使用不依赖灯光的法线材质，以颜色区分朝向不同的表面。
); // 结束几何体与材质的构造调用，得到可继续设置变换的网格。
cube.position.set(0, 0.5, 0); // position.set 的参数依次为中心 x、y、z，单位为场景单位；高为 1 时 y=0.5 正好贴地。
scene.add(cube); // 把方块加入场景；只创建 Mesh 而不 add，渲染时不会显示。`, { grid: true, camera: [5, 4, 7] }),
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
    code: sceneCode(`const cube = new THREE.Mesh( // 开始创建方块网格；下两行依次提供几何体与材质。
  new THREE.BoxGeometry(2.4, 0.6, 0.9), // 创建长方体；三个参数依次为 X 方向宽度、Y 方向高度、Z 方向深度。
  new THREE.MeshNormalMaterial() // 使用不依赖灯光的法线材质，以颜色区分朝向不同的表面。
); // 结束几何体与材质的构造调用，得到可继续设置变换的网格。
cube.position.y = 0.6; // 设置网格中心的 Y 坐标；只改变高度，不改变 X、Z 坐标。
cube.rotation.y = THREE.MathUtils.degToRad(0); // degToRad 的参数使用度；转换为弧度后赋给 rotation.y，控制绕 Y 轴的旋转。
scene.add(cube); // 把方块加入场景；只创建 Mesh 而不 add，渲染时不会显示。
scene.add(new THREE.AxesHelper(2.5)); // 添加坐标轴辅助线；参数是每条轴线的长度，单位为场景单位。`, { camera: [4, 4, 6], grid: true }),
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
    code: sceneCode(`const geometry = new THREE.BoxGeometry(1, 1, 1); // 创建可被多个网格共享的方块几何体；参数依次为宽、高、深。
const material = new THREE.MeshNormalMaterial(); // 创建法线材质；按表面法线方向着色，不需要额外灯光。
const left = new THREE.Mesh(geometry, material); // 左侧网格复用 geometry 与 material，避免重复创建相同几何体和材质。
left.position.set(-1.2, 0.5, 0); // 设置左侧方块中心的 x、y、z 坐标；负 X 将它放到原点左边。
const right = new THREE.Mesh(geometry, material); // 右侧网格也复用相同形状与材质，但保有独立的位置、旋转和缩放。
right.position.set(1.2, 0.5, 0); // 设置右侧方块中心的 x、y、z；Y 必须随缩放后的高度调整，才能保持贴地。
right.scale.set(1, 1, 1); // scale.set 参数依次为 X、Y、Z 的倍率，无单位；1 保持原大小，2 表示该方向放大两倍。
scene.add(left, right); // 将左右两块同时加入场景，便于对比缩放效果。`, { grid: true, camera: [4, 3, 6] }),
    change: ["right.position.set(1.2, 0.5, 0); // 设置右侧方块中心的 x、y、z；Y 必须随缩放后的高度调整，才能保持贴地。\nright.scale.set(1, 1, 1); // scale.set 参数依次为 X、Y、Z 的倍率，无单位；1 保持原大小，2 表示该方向放大两倍。","right.position.set(1.2, 1, 0); // 设置右侧方块中心的 x、y、z；Y 必须随缩放后的高度调整，才能保持贴地。\nright.scale.set(1, 2, 1); // scale.set 参数依次为 X、Y、Z 的倍率，无单位；1 保持原大小，2 表示该方向放大两倍。"],
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
    code: sceneCode(`const cube = new THREE.Mesh( // 开始创建方块网格；下两行依次提供几何体与材质。
  new THREE.BoxGeometry(1.5, 1.5, 1.5), // 创建方块几何体；三个参数依次表示宽、高、深，单位均为场景单位。
  new THREE.MeshNormalMaterial() // 使用不依赖灯光的法线材质，以颜色区分朝向不同的表面。
); // 结束几何体与材质的构造调用，得到可继续设置变换的网格。
scene.add(cube); // 把方块加入场景；只创建 Mesh 而不 add，渲染时不会显示。
scene.add(new THREE.AxesHelper(2.5)); // 添加坐标轴辅助线；参数是每条轴线的长度，单位为场景单位。`, { camera: [0, 0, 5] }),
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
    code: sceneCode(`const positions = [-1.8, 0, 1.8]; // 声明 X 坐标数组；数组下标从 0 开始，每个数字对应一台设备的位置。
const geometry = new THREE.BoxGeometry(0.8, 1, 0.8); // 创建设备几何体；三个参数依次为宽、高、深，可由所有设备共享。
const material = new THREE.MeshNormalMaterial(); // 创建法线材质；按表面法线方向着色，不需要额外灯光。
for (let index = 0; index < positions.length; index++) { // 从下标 0 开始循环；小于数组长度时继续，index++ 在每轮结束后让下标加 1。
  const device = new THREE.Mesh(geometry, material); // 本轮新建一个设备网格；与其他设备共享几何体和材质，但位置互不影响。
  device.position.set(positions[index], 0.5, 0); // x 读取本轮数组坐标，y 是半个设备高度，z 是地面前后方向的坐标。
  scene.add(device); // 把本轮创建的设备加入场景。
} // 结束本轮设备创建循环。
document.querySelector('#overlay').textContent = '设备数量：' + positions.length; // 用 positions.length 获取坐标条目数量，并把设备总数显示在文字区域。`, { grid: true, camera: [3, 3, 7], target: [0, 0.5, 0] }),
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
    code: sceneCode(`const geometry = new THREE.BoxGeometry(1, 1, 1); // 创建可被多个网格共享的方块几何体；参数依次为宽、高、深。
const material = new THREE.MeshNormalMaterial(); // 创建法线材质；按表面法线方向着色，不需要额外灯光。
for (let i = 0; i < 3; i++) { // 从 i=0 开始，每轮加 1，i 小于 3 时继续，一共创建三台设备。
  const cube = new THREE.Mesh(geometry, material); // Mesh 的两个参数依次是几何体 geometry 和材质 material，将形状与外观组合成网格物体。
  cube.position.set(i - 1, 0.5, (i - 1) * 1.6); // 设置 x、y、z；i-1 让 X 围绕原点分布，Z 使用间距系数排开，Y 是半个方块高度。
  scene.add(cube); // 把方块加入场景；只创建 Mesh 而不 add，渲染时不会显示。
} // 结束本轮设备创建循环。`, { projection: 'orthographic', orthoSize: 3, camera: [5, 4, 7], grid: true }),
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
    code: sceneCode(`controls.minDistance = 1; // 限制相机到观察中心的最小距离，单位为场景单位；避免滚轮拉得过近。
controls.maxDistance = 20; // 限制相机到观察中心的最大距离，单位为场景单位；避免滚轮拉得过远。
const cube = new THREE.Mesh( // 开始创建方块网格；下两行依次提供几何体与材质。
  new THREE.BoxGeometry(1.5, 1.5, 1.5), // 创建方块几何体；三个参数依次表示宽、高、深，单位均为场景单位。
  new THREE.MeshNormalMaterial() // 使用不依赖灯光的法线材质，以颜色区分朝向不同的表面。
); // 结束几何体与材质的构造调用，得到可继续设置变换的网格。
cube.position.y = 0.75; // 把方块中心抬高半个边长，使底面落在地面上。
scene.add(cube); // 把方块加入场景；只创建 Mesh 而不 add，渲染时不会显示。`, { controls: true, grid: true, target: [0, 0.75, 0] }),
    change: ["controls.minDistance = 1; // 限制相机到观察中心的最小距离，单位为场景单位；避免滚轮拉得过近。\ncontrols.maxDistance = 20; // 限制相机到观察中心的最大距离，单位为场景单位；避免滚轮拉得过远。","controls.minDistance = 3; // 限制相机到观察中心的最小距离，单位为场景单位；避免滚轮拉得过近。\ncontrols.maxDistance = 8; // 限制相机到观察中心的最大距离，单位为场景单位；避免滚轮拉得过远。"],
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
    code: sceneCode(`const table = new THREE.Group(); // 创建空的 Group，后面将桌面与四条桌腿放入同一组。
const material = new THREE.MeshNormalMaterial(); // 创建法线材质；按表面法线方向着色，不需要额外灯光。
const top = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 1.5), material); // 创建桌面网格；BoxGeometry 参数依次为宽、高、深，material 为共享的外观材质。
top.position.y = 1.5; // 设置桌面中心高度，坐标相对于父对象 table 的局部原点。
table.add(top); // 将桌面加入 table 组；后续组的变换会一起作用于桌面。
for (const x of [-1, 1]) { // 依次取左右两个 X 坐标，为两侧的桌腿安排位置。
  for (const z of [-0.5, 0.5]) { // 在当前 X 坐标下依次取前后两个 Z 坐标，与外层循环组合得到四条腿。
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.4, 0.18), material); // 创建桌腿网格；BoxGeometry 参数依次为宽、高、深，与桌面共享材质。
    leg.position.set(x, 0.7, z); // 按 x、y、z 设置桌腿局部位置；中心高度为腿高的一半，使腿底落在组的 y=0。
    table.add(leg); // 把当前桌腿加入 table，保留它相对于桌子组的局部坐标。
  } // 结束当前一排桌腿的 Z 坐标循环。
} // 结束两侧桌腿的 X 坐标循环。
table.rotation.y = 0; // 设置整张桌子绕 Y 轴的转角，单位为弧度；组的所有零件一起旋转。
scene.add(table); // 将整张桌子的组加入场景，子物体也随之参与渲染。`, { controls: true, grid: true, target: [0, 0.7, 0] }),
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
    code: sceneCode(`const geometry = new THREE.SphereGeometry(0.8, 40, 24); // 球体参数依次为半径、水平分段数、垂直分段数；分段更多更平滑，但三角形也更多。
const basic = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: '#527be8' })); // 创建左球并使用基础材质；geometry 决定形状，color 决定颜色，灯光不参与该材质的明暗。
basic.position.x = -1.2; // 设置左球中心的 X 坐标，负 X 将它移到画面左侧。
const standardMaterial = new THREE.MeshStandardMaterial({ // 开始配置标准材质；它按照灯光、颜色、金属度和粗糙度计算表面明暗。
  color: '#527be8', metalness: 0.35, roughness: 0.8 // color 是底色；metalness 为 0–1 的金属程度，roughness 为 0–1 的粗糙程度，值越小高光越集中。
}); // 结束标准材质配置并创建材质。
const standard = new THREE.Mesh(geometry, standardMaterial); // 用共享的球形 geometry 和刚配置的标准材质创建右球。
standard.position.x = 1.2; // 设置右球中心的 X 坐标，正 X 将它移到画面右侧。
scene.add(basic, standard); // 同时加入两个球，比较同一形状在不同材质下的显示效果。
document.querySelector('#overlay').textContent = '左：基础材质　　右：标准材质'; // 显示左右材质名称，帮助对照光照是否影响表面明暗。`, { setup: light, controls: true, camera: [0, 1.2, 6] }),
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
    code: sceneCode(`scene.add(new THREE.AmbientLight(0xffffff, 0.7)); // 添加环境光；参数依次为光的颜色与强度，环境光均匀照亮表面，不产生方向性阴影。
const sun = new THREE.DirectionalLight(0xffffff, 3); // 创建方向光；参数依次为颜色与强度，强度越大照明贡献越强。
sun.position.set(4, 5, 3); // 设置方向光的 x、y、z；它与默认位于原点的 target 共同确定照射方向。
scene.add(sun); // 把方向光加入场景，标准材质才会受到它的照明影响。
const material = new THREE.MeshStandardMaterial({ color: '#7191ef', roughness: 0.5 }); // 创建标准材质；color 为底色，roughness 范围 0–1，越大高光越分散、表面越粗糙。
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.9, 40, 24), material); // 创建球形网格；球体参数依次为半径、水平分段、垂直分段，material 为共享标准材质。
sphere.position.x = -1.2; // 设置球中心的 X 坐标，负值表示放在 X 轴负方向。
const cube = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), material); // 创建方块网格；BoxGeometry 的三个参数依次为宽、高、深，material 决定受光外观。
cube.position.x = 1.2; // 设置方块中心的 X 坐标，正值表示放在 X 轴正方向。
scene.add(sphere, cube); // 把球和方块同时加入场景，比较不同表面对同一光源的响应。`, { controls: true, camera: [0, 1.7, 6] }),
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
    code: sceneCode(`renderer.shadowMap.enabled = true; // 开启渲染器阴影计算；仍需光源 castShadow、物体 castShadow 与地面 receiveShadow 配合。
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 选择 PCFSoftShadowMap 阴影过滤方式，使阴影边缘更柔和，但仍受贴图分辨率影响。
scene.add(new THREE.AmbientLight(0xffffff, 1.2)); // 添加环境光；两个参数依次为光色和强度，用于保留背光面的细节，环境光本身不投影。
const sun = new THREE.DirectionalLight(0xffffff, 3); // 创建方向光；参数依次为颜色与强度，强度越大照明贡献越强。
sun.position.set(3, 6, 3); // 设置方向光的 x、y、z 坐标，决定从哪个方向向默认目标原点照射。
sun.castShadow = true; // 允许这盏方向光生成阴影贴图；光源默认不会投射阴影。
sun.shadow.mapSize.set(1024, 1024); // 设置阴影贴图的宽、高像素数；分辨率越高通常越清晰，同时消耗更多显存和计算。
scene.add(sun); // 把方向光加入场景，标准材质才会受到它的照明影响。
const cube = new THREE.Mesh( // 开始创建方块网格；下两行依次提供几何体与材质。
  new THREE.BoxGeometry(1.5, 1.5, 1.5), // 创建方块几何体；三个参数依次表示宽、高、深，单位均为场景单位。
  new THREE.MeshStandardMaterial({ color: '#557bea' }) // 使用标准材质；color 是十六进制底色，该材质需要灯光才能看清明暗。
); // 结束几何体与材质的构造调用，得到可继续设置变换的网格。
cube.position.y = 0.75; // 把方块中心抬高半个边长，使底面落在地面上。
cube.castShadow = true; // 设置方块是否投射阴影；true 开启、false 关闭，不影响方块本身是否可见。
const ground = new THREE.Mesh( // 开始创建地面网格；下面依次传入平面几何体与标准材质。
  new THREE.PlaneGeometry(10, 10), // 创建 XY 平面；两个参数依次为宽、高，单位为场景单位，稍后旋转到 XZ 地面。
  new THREE.MeshStandardMaterial({ color: '#e2e7ef' }) // 为地面配置标准材质，color 指定底色，它能接收灯光和阴影。
); // 结束几何体与材质的构造调用，得到可继续设置变换的网格。
ground.rotation.x = -Math.PI / 2; // 绕 X 轴旋转负 π/2 弧度，即负 90°，把原本的 XY 平面放平到 XZ 平面。
ground.receiveShadow = true; // 允许地面接收其他物体投来的阴影；不代表地面自身也会投射阴影。
scene.add(cube, ground); // 同时加入方块和地面，阴影投射者与接收者都必须存在于场景中。`, { controls: true, target: [0, 0.5, 0], camera: [4, 4, 6] }),
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
    code: sceneCode(`const texture = new THREE.TextureLoader().load('assets/checker.svg'); // 加载项目内的纹理相对路径；load 立即返回 Texture，图片异步准备好后会自动显示。
texture.colorSpace = THREE.SRGBColorSpace; // 把颜色纹理标记为 sRGB；用于颜色显示的图片需要正确颜色空间，数据贴图不应照搬此设置。
const cube = new THREE.Mesh( // 开始创建方块网格；下两行依次提供几何体与材质。
  new THREE.BoxGeometry(2, 2, 2), // 创建方块；三个参数依次为宽、高、深，几何体自带 UV 供纹理映射。
  new THREE.MeshStandardMaterial({ map: texture, roughness: 0.65 }) // 标准材质的 map 接收颜色纹理；roughness 为 0–1 的粗糙度，越大高光越分散。
); // 结束几何体与材质的构造调用，得到可继续设置变换的网格。
scene.add(cube); // 把方块加入场景；只创建 Mesh 而不 add，渲染时不会显示。`, { setup: light, controls: true, camera: [4, 3, 5] }),
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
    code: sceneCode(`const texture = new THREE.TextureLoader().load('assets/checker.svg'); // 加载项目内的纹理相对路径；load 立即返回 Texture，图片异步准备好后会自动显示。
texture.colorSpace = THREE.SRGBColorSpace; // 把颜色纹理标记为 sRGB；用于颜色显示的图片需要正确颜色空间，数据贴图不应照搬此设置。
texture.wrapS = THREE.RepeatWrapping; // 设置 U 方向的包裹方式为重复；超出 0–1 的纹理坐标会循环取样。
texture.wrapT = THREE.RepeatWrapping; // 设置 V 方向的包裹方式为重复；需与 wrapS 配合才能在横纵两向平铺。
texture.repeat.set(2, 2); // repeat.set 参数依次为 U、V 方向的重复次数；次数越多，每块图案看起来越小。
const ground = new THREE.Mesh( // 开始创建地面网格；下面依次传入平面几何体与标准材质。
  new THREE.PlaneGeometry(6, 6), // 创建平面；两个参数依次为宽、高，默认 UV 让整张纹理覆盖一遍平面。
  new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8 }) // 将纹理传给 map；roughness 是 0–1 的粗糙程度，影响表面高光的集中程度。
); // 结束几何体与材质的构造调用，得到可继续设置变换的网格。
ground.rotation.x = -Math.PI / 2; // 绕 X 轴旋转负 π/2 弧度，即负 90°，把原本的 XY 平面放平到 XZ 平面。
scene.add(ground); // 把旋转后的地面加入场景。`, { setup: light, controls: true, camera: [4, 5, 6] }),
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
    code: sceneCode(`const labelText = 'PUMP 01'; // 声明铭牌文字；只修改引号内的内容即可改变稍后绘制出的贴图文字。
const label = document.createElement('canvas'); // 创建离屏二维画布，它用来生成纹理，不需要作为网页元素显示。
label.width = 512; // 设置纹理画布的横向像素数；像素越多细节越清楚，也占用更多纹理内存。
label.height = 256; // 设置纹理画布的纵向像素数；与 width 一起决定图片分辨率和比例。
const context = label.getContext('2d'); // 取得二维绘图上下文，'2d' 表示使用浏览器的 Canvas 二维绘图 API。
context.fillStyle = '#16334f'; // 设置后续填充操作的颜色；十六进制颜色字符串表示铭牌底色。
context.fillRect(0, 0, 512, 256); // fillRect 的参数依次为左上角 x、y、宽、高，单位是画布像素；此处填满背景。
context.fillStyle = '#6ee7c4'; // 切换填充颜色，后续绘制的装饰条使用此颜色。
context.fillRect(24, 24, 464, 8); // fillRect 依次接收 x、y、宽、高，均为像素；这里绘制一条窄装饰条。
context.fillStyle = '#ffffff'; // 切换填充色为白色，用于后面的铭牌文字。
context.font = 'bold 54px sans-serif'; // 设置文字为加粗、54 像素、无衬线字体；px 指画布内字体大小。
context.textAlign = 'center'; // 设置文字水平对齐为居中，fillText 的 x 坐标成为文字的中心位置。
context.fillText(labelText, 256, 145); // fillText 参数依次为文字、x、y；坐标单位是像素，y 是文字基线的位置。
const texture = new THREE.CanvasTexture(label); // 把二维画布转换成 Three.js 纹理；以后重画画布后要设 texture.needsUpdate=true。
texture.colorSpace = THREE.SRGBColorSpace; // 把颜色纹理标记为 sRGB；用于颜色显示的图片需要正确颜色空间，数据贴图不应照搬此设置。
const sign = new THREE.Mesh( // 开始创建铭牌网格，下面依次指定平面形状与显示画布纹理的材质。
  new THREE.PlaneGeometry(3.4, 1.7), // 创建铭牌平面；两个参数依次为宽、高，保持与画布分辨率相同的宽高比可避免图案变形。
  new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }) // 基础材质的 map 使用画布纹理，side: DoubleSide 允许从正反两面观察铭牌。
); // 结束几何体与材质的构造调用，得到可继续设置变换的网格。
scene.add(sign); // 将铭牌加入场景，二维文字就显示在三维平面上。`, { controls: true, camera: [0, 0.5, 5] }),
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
    code: sceneCode(`const cube = new THREE.Mesh( // 开始创建方块网格；下两行依次提供几何体与材质。
  new THREE.BoxGeometry(1.5, 1.5, 1.5), // 创建方块几何体；三个参数依次表示宽、高、深，单位均为场景单位。
  new THREE.MeshNormalMaterial() // 使用不依赖灯光的法线材质，以颜色区分朝向不同的表面。
); // 结束几何体与材质的构造调用，得到可继续设置变换的网格。
scene.add(cube); // 把方块加入场景；只创建 Mesh 而不 add，渲染时不会显示。`, { controls: true, camera: [3, 2, 5], animate: "cube.rotation.y = time * 0.6; // 设置绕 Y 轴的角度（弧度）为秒数乘角速度；乘数单位为弧度/秒，改大就转得更快。\ncube.position.y = Math.sin(time * 1.5) * 0.3; // 用正弦往返浮动；time 为秒，内部乘数控制频率（弧度/秒），外部乘数控制位移幅度（场景单位）。" }),
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
    code: sceneCode(`const curve = new THREE.CatmullRomCurve3([ // 使用控制点数组创建 Catmull-Rom 平滑曲线；后续数组元素必须是 Vector3。
  new THREE.Vector3(-2.5, 0, 0), // 添加路径控制点；Vector3 的三个参数依次为 x、y、z，单位是场景单位。
  new THREE.Vector3(-1, 0, 1), // 添加下一路径控制点；参数依次为 x、y、z，调整它会改变曲线经过的位置。
  new THREE.Vector3(1, 1, 0), // 添加路径控制点；参数依次为 x、y、z，正 Y 让路径向上抬高。
  new THREE.Vector3(2.5, 0, -0.5) // 添加最后一个控制点；参数依次为 x、y、z，决定开放曲线的终点。
]); // 结束控制点数组并创建曲线，后续使用这条路径生成管道与运动位置。
const pipe = new THREE.Mesh( // 开始创建管道网格，下面依次传入沿曲线的管状几何体和材质。
  new THREE.TubeGeometry(curve, 80, 0.09, 10, false), // TubeGeometry 参数依次为路径、路径分段数、管半径、截面分段数、是否首尾闭合；半径使用场景单位。
  new THREE.MeshBasicMaterial({ color: '#92a9cc' }) // 用基础材质显示管道；color 为底色，不依赖灯光，便于看清路径。
); // 结束几何体与材质的构造调用，得到可继续设置变换的网格。
const marker = new THREE.Mesh( // 开始创建沿路径运动的标记球，下面依次传入球体形状和材质。
  new THREE.SphereGeometry(0.18, 20, 14), // 球体参数依次为半径、水平分段、垂直分段；较小半径让它充当路径上的标记。
  new THREE.MeshBasicMaterial({ color: '#f59e0b' }) // 创建基础材质；color 为十六进制颜色字符串，不依赖灯光照明。
); // 结束几何体与材质的构造调用，得到可继续设置变换的网格。
scene.add(pipe, marker); // 把管道和标记球加入场景，标记的位置随后由动画循环更新。`, { controls: true, camera: [4, 4, 6], animate: "marker.position.copy(curve.getPointAt((time * 0.12) % 1)); // 秒数乘每秒路径进度，%1 将进度循环到 0–1；getPointAt 近似等距取样，copy 把结果复制到球的位置。" }),
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
    code: sceneCode(`const cube = new THREE.Mesh( // 开始创建方块网格；下两行依次提供几何体与材质。
  new THREE.BoxGeometry(1.5, 1.5, 1.5), // 创建方块几何体；三个参数依次表示宽、高、深，单位均为场景单位。
  new THREE.MeshNormalMaterial() // 使用不依赖灯光的法线材质，以颜色区分朝向不同的表面。
); // 结束几何体与材质的构造调用，得到可继续设置变换的网格。
scene.add(cube); // 把方块加入场景；只创建 Mesh 而不 add，渲染时不会显示。
let running = false; // 用 let 保存是否旋转的布尔状态；false 表示初始暂停，后面允许重新赋值。
const button = document.createElement('button'); // 创建网页按钮；它是 HTML 元素，不是三维 Mesh。
button.textContent = '启动旋转'; // 设置暂停状态下的按钮文字，提示下一次点击会启动旋转。
button.addEventListener('click', () => { // 监听 click 点击事件；第二个参数是回调函数，用户点击按钮时才执行。
  running = !running; // 对布尔状态取反；true 变 false，false 变 true，实现启动与暂停切换。
  if (running) { // 只在 running 为 true 时执行下面的启动状态分支。
    button.textContent = '暂停旋转'; // 设置运行状态下的按钮文字，提示下一次点击可以暂停旋转。
  } else { // 结束运行状态分支；else 中的代码只在 running 为 false 时执行。
    button.textContent = '启动旋转'; // 设置暂停状态下的按钮文字，提示下一次点击会启动旋转。
  } // 结束暂停状态分支。
}); // 结束点击事件回调的注册，事件发生时才执行回调。
document.querySelector('#overlay').append(button); // 把按钮放入页面文字区域，用户才能实际点击它。`, { controls: true, camera: [3, 2, 5], animate: "if (running) { // 只在启动状态更新角度；暂停时保留已有角度，因此恢复时不会跳回起点。\n  cube.rotation.y += delta * 0.8; // delta 是本帧与上帧的秒数差；乘数为弧度/秒，用累加角度保持不同帧率下速度相近。\n} // 结束运行状态判断，渲染循环仍继续显示当前静止画面。" }),
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
    code: sceneCode(`const devices = []; // 创建空数组保存设备网格，便于后面只在这些可选物体中做射线检测。
for (let i = 0; i < 3; i++) { // 从 i=0 开始，每轮加 1，i 小于 3 时继续，一共创建三台设备。
  const device = new THREE.Mesh( // 开始创建当前设备网格；下两行依次给出几何体与独立材质。
    new THREE.BoxGeometry(0.9, 1.3, 0.9), // 设备方块参数依次为宽、高、深，Y 方向高度的一半用于稍后贴地定位。
    new THREE.MeshBasicMaterial({ color: '#6486ea' }) // 为当前设备单独创建基础材质；color 为初始颜色，独立材质可避免改色时影响其他设备。
  ); // 结束几何体与材质的构造调用，得到可继续设置变换的网格。
  device.position.set((i - 1) * 1.5, 0.65, 0); // position.set 依次接收 x、y、z；i 控制 X 轴间距，Y 为半个设备高度，Z 保持在同一排。
  device.name = '设备 ' + (i + 1); // 生成设备名称；数组下标从 0 开始，用 i+1 得到从 1 起的显示编号。
  devices.push(device); // 把网格保存在可选设备数组中，后续射线只检测这批设备。
  scene.add(device); // 把本轮创建的设备加入场景。
} // 结束本轮设备创建循环。
const raycaster = new THREE.Raycaster(); // 创建射线检测器；它用于计算鼠标指向的射线与物体的交点，不会绘制可见线条。
const pointer = new THREE.Vector2(); // 创建二维向量，默认 x、y 都为 0，用于保存鼠标的标准化设备坐标。
canvas.addEventListener('click', event => { // 监听画布 click 事件；event 是浏览器传入的鼠标事件，包含窗口内的点击坐标。
  const rect = canvas.getBoundingClientRect(); // 读取画布在窗口中的位置与尺寸，单位为 CSS 像素；不能直接用整个页面尺寸代替。
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; // 鼠标 X 减画布左边距后除以画布宽，再从 0–1 映射为 -1–1 的横向标准化坐标。
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1; // 鼠标 Y 减画布顶边距后除以画布高，再取反映射为 -1–1，让向上的方向为正。
  raycaster.setFromCamera(pointer, camera); // 根据 pointer 的标准化坐标与 camera 的投影计算三维射线，参数顺序不能颠倒。
  const hit = raycaster.intersectObjects(devices)[0]; // 检测 devices 数组中的物体；交点按距离由近到远排列，[0] 取最近命中，未命中时为 undefined。
  if (hit) { // 只有存在命中结果时才执行选中逻辑，避免访问不存在的 object 属性。
    devices.forEach(device => device.material.color.set('#6486ea')); // 遍历全部设备，将各自材质的颜色恢复到初始色，为本次选择清除旧高亮。
    hit.object.material.color.set('#34c49b'); // 修改命中网格的材质颜色；set 接收新的颜色值，仅影响这个独立材质。
    document.querySelector('#overlay').textContent = '已选中：' + hit.object.name; // 读取最近交点的 object.name，将选中的设备名称显示在页面上。
  } // 结束命中设备后的选中处理分支。
}); // 结束点击事件回调的注册，事件发生时才执行回调。
document.querySelector('#overlay').textContent = '点击任意设备，观察状态颜色'; // 在用户点击前显示操作提示，便于知道哪些物体可以交互。`, { controls: true, grid: true, camera: [3, 3, 6], target: [0, 0.65, 0] }),
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
    code: sceneCode(`const loader = new GLTFLoader(); // 创建 glTF/GLB 加载器；无参数时使用默认资源管理器。
document.querySelector('#overlay').textContent = '正在加载课程模型…'; // 在异步请求开始前显示等待提示，避免用户以为画面卡住。
const result = await loader.loadAsync('assets/training-machine.gltf'); // await 等待相对路径的 glTF 模型加载完成；返回值同时包含场景、动画和相机等数据。
const model = result.scene; // 取出模型的根物体 scene；它不是本页面的 scene，可像 Group 一样整体变换。
model.rotation.y = 0; // 设置模型根物体绕 Y 轴的角度，单位为弧度；π/2 表示旋转 90°。
scene.add(model); // 将加载到的根物体加入本课场景，其全部子模型也随之显示。
document.querySelector('#overlay').textContent = '模型已加载；可拖动鼠标观察'; // 异步加载完成后更新提示；OrbitControls 允许拖动鼠标观察模型。`, { imports: "import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // 导入附加加载器 GLTFLoader，用来读取 glTF 或 GLB 格式的模型。", setup: light, controls: true, grid: true, camera: [4, 3, 5], target: [0, 0.8, 0] }),
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
    code: sceneCode(`const status = document.querySelector('#overlay'); // 获取页面已有的文字容器，用来显示加载状态或性能统计。
const message = document.createElement('div'); // 创建独立 div 显示加载信息，避免更新文字时把旁边的按钮一起删掉。
const simulateButton = document.createElement('button'); // 创建用于演示失败反馈的按钮；不会实际请求不存在的资源。
simulateButton.textContent = '模拟加载失败'; // 给按钮设置可读名称，点击后将调用统一的错误提示函数。
status.append(message, simulateButton); // 依次把状态文字与演示按钮加入容器，append 可以接收多个节点。
function showError(error) { // 定义统一的错误展示函数；error 是 Error 对象，它的 message 保存错误说明。
  message.textContent = '加载失败：' + error.message; // 读取 error.message 并显示失败原因；textContent 把它作为纯文本处理。
} // 结束错误展示函数定义。
simulateButton.addEventListener('click', () => { // 监听模拟按钮的 click；第二个参数是用户点击后才调用的回调函数。
  showError(new Error('模拟：资源暂时不可用')); // 创建带有模拟说明的 Error 并交给 showError，仅演示界面反馈，不发起网络请求。
}); // 结束点击事件回调的注册，事件发生时才执行回调。
const manager = new THREE.LoadingManager(); // 创建资源管理器，统计本次加载器管理的资源项目完成情况。
manager.onProgress = (url, loaded, total) => { // 注册资源完成回调；url 为项目路径，loaded 为已完成项目数，total 为总项目数，并非字节进度。
  message.textContent = '资源项目：' + loaded + ' / ' + total; // 显示完成项目数与总项目数；加号把数字和分隔符连接成文字。
}; // 结束资源项目完成回调的定义。
const loader = new GLTFLoader(manager); // 把 manager 作为 GLTFLoader 的管理器参数，使加载器使用上面注册的进度回调。
const modelPath = 'assets/training-machine.gltf'; // 用相对路径指定课程自带模型，项目移动到另一台电脑仍可加载。
try { // 开始可能失败的加载流程；try 中 await 抛出的错误由后面的 catch 处理。
  message.textContent = '正在准备模型…'; // 在等待模型时显示准备信息，而不是让画面一直空白。
  const result = await loader.loadAsync(modelPath); // await 等待 modelPath 对应模型准备完成，成功后才继续下一行。
  scene.add(result.scene); // 把加载结果的根场景加入课程场景，使模型中的各个零件参与渲染。
  message.textContent = '加载完成：可以开始观察'; // 加载成功后显示完成消息，保留旁边用于模拟失败的按钮。
} catch (error) { // 捕获 try 中的加载异常，error 保存失败原因，下面统一显示提示。
  showError(error); // 复用 showError 展示真实加载失败的原因，与模拟失败采用相同界面。
} // 结束加载失败处理代码块。`, { imports: "import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // 导入附加加载器 GLTFLoader，用来读取 glTF 或 GLB 格式的模型。", setup: light, controls: true, grid: true, camera: [4, 3, 5], target: [0, 0.8, 0] }),
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
    code: sceneCode(`const ring = new THREE.Mesh( // 开始创建圆环网格；下两行依次给出圆环形状与法线材质。
  new THREE.TorusGeometry(1.1, 0.3, 20, 72), // TorusGeometry 参数依次为大圆半径、管半径、管截面分段数、绕大圆分段数；半径使用场景单位。
  new THREE.MeshNormalMaterial() // 使用不依赖灯光的法线材质，以颜色区分朝向不同的表面。
); // 结束几何体与材质的构造调用，得到可继续设置变换的网格。
scene.add(ring); // 把圆环加入场景，用它检查画面拉伸后是否仍保持正确比例。
document.querySelector('#overlay').textContent = '调整预览区域大小，圆环应保持正确比例'; // 提示用户改变预览区域尺寸；相机宽高比与渲染器尺寸需要同步更新。`, { controls: true, camera: [0, 0.5, 4] }),
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
    code: sceneCode(`const countPerRow = 10; // 设置每行设备数量；它控制两层循环的范围，必须是正整数。
const count = countPerRow * countPerRow; // 总实例数等于行数乘列数；本例行数与列数都采用 countPerRow。
const geometry = new THREE.BoxGeometry(0.3, 0.55, 0.3); // 创建设备形状；参数依次为宽、高、深，所有实例共享这份几何体。
const material = new THREE.MeshNormalMaterial(); // 创建法线材质；按表面法线方向着色，不需要额外灯光。
const devices = new THREE.InstancedMesh(geometry, material, count); // InstancedMesh 参数依次为共享几何体、共享材质、最大实例数，适合大量形状和材质相同的物体。
const helper = new THREE.Object3D(); // 创建临时 Object3D，利用其位置、旋转、缩放生成每个实例需要的变换矩阵。
let index = 0; // 实例编号从 0 开始，后面每写入一次矩阵就递增一次。
for (let row = 0; row < countPerRow; row++) { // 外层按行遍历，从 row=0 开始到 countPerRow-1，row++ 每轮加 1。
  for (let col = 0; col < countPerRow; col++) { // 内层按列遍历，从 col=0 开始到 countPerRow-1，与外层组合出所有设备位置。
    helper.position.set((col - (countPerRow - 1) / 2) * 0.45, 0.275, // position.set 前两个参数是 x、y；减去半个总间距使 X 居中，间距系数为场景单位，Y 是半个设备高度。
      (row - (countPerRow - 1) / 2) * 0.45); // 第三个参数是 z；按行号计算前后间距并居中，最后右括号结束 position.set 调用。
    helper.updateMatrix(); // 根据 helper 当前的位置、旋转与缩放重建局部变换矩阵，不调用就仍是旧矩阵。
    devices.setMatrixAt(index++, helper.matrix); // setMatrixAt 参数为实例编号与变换矩阵；index++ 使用当前编号后再加 1。
  } // 结束当前行的设备列循环。
} // 结束设备行循环。
devices.instanceMatrix.needsUpdate = true; // 标记实例矩阵已修改，通知渲染器把新矩阵上传到显卡。
scene.add(devices); // 将整批实例加入场景，同形同材质的设备可共享少量绘制调用。
const status = document.querySelector('#overlay'); // 获取页面已有的文字容器，用来显示加载状态或性能统计。`, { controls: true, grid: true, camera: [6, 6, 8], animate: "status.textContent = '实例：' + count + '　绘制调用：' + renderer.info.render.calls // 读取上一帧实际的绘制调用数；这是当前渲染器的统计，不是整台电脑的显卡占用率。\n  + '　三角形：' + renderer.info.render.triangles; // 继续拼接上一帧绘制的三角形数量，便于比较实例数量变化对几何规模的影响。" }),
    change: ['const countPerRow = 10;', 'const countPerRow = 15;'],
  },
].map(makeLesson);

// 本课修改两处像素比例上限，答案需同时覆盖初始化与尺寸变化。
const responsive = lessons.find(lesson => lesson.id === 'responsive');
responsive.solutionCode = responsive.code.replaceAll('Math.min(devicePixelRatio, 2)', 'Math.min(devicePixelRatio, 1)');

export default lessons;
