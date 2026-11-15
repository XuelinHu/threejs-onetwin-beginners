export const CATALOG = [
  {type:'box',label:'方块',icon:'▧',constructor:'BoxGeometry',args:'1.6, 1.6, 1.6',color:'#ec765a',description:'由宽、高、深决定的立方体，适合搭建展台、设备和墙面。',principle:'几何体决定形状，材质决定表面外观；二者组合成 Mesh 才能放入场景。',parameters:[['width / height / depth','宽、高、深；这里都设为 1.6。'],['position','物体中心的位置，单位是场景单位。'],['scale','沿 X、Y、Z 轴的缩放倍数。']]},
  {type:'sphere',label:'球体',icon:'●',constructor:'SphereGeometry',args:'0.85, 32, 20',color:'#6c9e91',description:'从半径和分段数创建球体，用来观察光照和材质最直观。',principle:'分段越多越圆滑，也会增加三角形数量。初学时先使用适中的分段数。',parameters:[['radius','球的半径，这里是 0.85。'],['widthSegments / heightSegments','水平与垂直分段数，这里是 32 和 20。'],['roughness','表面粗糙度，越接近 0，高光越集中。']]},
  {type:'cylinder',label:'圆柱',icon:'▥',constructor:'CylinderGeometry',args:'0.7, 0.7, 1.8, 32',color:'#7e9fc0',description:'可作为储罐、立柱和圆形展台，默认竖直放置。',principle:'顶、底半径相同得到圆柱；改变半径差可以得到截锥。',parameters:[['radiusTop / radiusBottom','顶面和底面的半径，这里均为 0.7。'],['height','沿 Y 轴的高度，这里是 1.8。'],['radialSegments','圆周分段数，这里是 32。']]},
  {type:'cone',label:'圆锥',icon:'▲',constructor:'ConeGeometry',args:'0.85, 1.8, 32',color:'#d9aa4d',description:'尖顶形状，可以组合成路标、屋顶和风格化树木。',principle:'圆锥默认沿 Y 轴竖立；旋转不会修改几何本身，只改变物体朝向。',parameters:[['radius','底面半径，这里是 0.85。'],['height','从底面到尖顶的高度，这里是 1.8。'],['rotation','属性面板使用角度，Three.js 运行时使用弧度。']]},
  {type:'torus',label:'圆环',icon:'◎',constructor:'TorusGeometry',args:'0.7, 0.24, 16, 48',color:'#ac8fc3',description:'像甜甜圈一样的几何体，默认位于 XY 平面。',principle:'大半径决定圆环中心线的大小，小半径决定管子的粗细。',parameters:[['radius / tube','圆环半径 0.7，管子半径 0.24。'],['radialSegments / tubularSegments','管截面与圆周分段数，这里是 16 和 48。'],['rotation.x','旋转 90°，就能让圆环平放。']]},
  {type:'plane',label:'平面',icon:'▱',constructor:'PlaneGeometry',args:'4, 4',color:'#ddd9cf',description:'没有厚度的矩形，适合练习地面、背景和简单墙面。',principle:'PlaneGeometry 默认在 XY 平面；绕 X 轴旋转 -90°，就成为水平地面。',parameters:[['width / height','平面的两个边长，这里均为 4。'],['DoubleSide','让平面的正反两面都可见。'],['rotation.x','本组件默认 -90°，使平面躺在地面上。']]},
  {type:'circle',label:'圆形',icon:'◉',constructor:'CircleGeometry',args:'1, 48',color:'#dfb75f',description:'没有厚度的圆形，适合做圆形地标和展台底座。',principle:'圆形由从圆心向外展开的三角形组成。它是平面图形，不是球体。',parameters:[['radius','从圆心到边缘的距离，这里是 1。'],['segments','圆周分段数，这里是 48。'],['rotation.x','默认 -90°，也可改为 0°观察竖直圆形。']]},
  {type:'pointLight',label:'点光源',icon:'☀',constructor:'PointLight',args:'color, intensity, distance',color:'#ffd9a0',description:'从一个点向四周发光，移动它可以观察亮面和高光的变化。',principle:'灯光本身没有可见表面；编辑器中的标记只是辅助。标准材质会响应灯光，基础材质不会。',parameters:[['color','光的颜色，不等于物体的颜色。'],['intensity','光强；本练习范围为 0～20，默认 8。'],['distance','照射距离上限；0 表示不额外设置距离上限。']]},
];

const catalogByType = new Map(CATALOG.map(item=>[item.type,item]));
const heights = {box:0.8,sphere:0.85,cylinder:0.9,cone:0.9,torus:0.94,plane:0.02,circle:0.025,pointLight:3};
const finite = (value,fallback,min,max)=>typeof value==='number'&&Number.isFinite(value)?Math.min(max,Math.max(min,value)):fallback;
const vector = (value,fallback,min,max)=>fallback.map((number,index)=>finite(Array.isArray(value)?value[index]:undefined,number,min,max));
const validColor = value=>typeof value==='string'&&/^#[\da-f]{6}$/i.test(value);
const cleanId = value=>typeof value==='string'?value.replace(/[^a-z0-9_-]/gi,'-').slice(0,64):'';

export function createRecord(type,id,position) {
  const item = catalogByType.get(type);
  if(!item)throw new Error('不支持的组件类型，请从左侧组件库选择。');
  return {
    id:cleanId(id)||'object',type,name:item.label,
    position:vector(position,[0,heights[type],0],-50,50),
    rotation:type==='plane'||type==='circle'?[-90,0,0]:[0,0,0],
    scale:[1,1,1],color:item.color,roughness:0.55,metalness:0.05,
    wireframe:false,visible:true,intensity:8,distance:0,
  };
}

export function normalizeScene(value) {
  if(!value||typeof value!=='object'||Array.isArray(value)||value.version!==1||!Array.isArray(value.objects))throw new Error('场景格式不正确，请导入本练习导出的 JSON 文件。');
  if(value.objects.length>80)throw new Error('一个练习最多放置 80 个组件，请先减少组件数量。');
  const usedIds = new Set();
  const objects = value.objects.map((record,index)=>{
    if(!record||typeof record!=='object'||Array.isArray(record)||!catalogByType.has(record.type))throw new Error(`第 ${index+1} 个组件的类型不受支持。`);
    const defaults = createRecord(record.type,`object-${index+1}`);
    let id = cleanId(record.id)||defaults.id;
    const baseId = id;
    let suffix = 2;
    while(usedIds.has(id))id=`${baseId}-${suffix++}`;
    usedIds.add(id);
    return {
      id,type:record.type,
      name:typeof record.name==='string'&&record.name.trim()?Array.from(record.name.trim()).slice(0,40).join(''):defaults.name,
      position:vector(record.position,defaults.position,-50,50),
      rotation:vector(record.rotation,defaults.rotation,-360,360),
      scale:vector(record.scale,defaults.scale,0.1,10),
      color:validColor(record.color)?record.color.toLowerCase():defaults.color,
      roughness:finite(record.roughness,defaults.roughness,0,1),
      metalness:finite(record.metalness,defaults.metalness,0,1),
      wireframe:typeof record.wireframe==='boolean'?record.wireframe:defaults.wireframe,
      visible:typeof record.visible==='boolean'?record.visible:defaults.visible,
      intensity:finite(record.intensity,defaults.intensity,0,20),
      distance:finite(record.distance,defaults.distance,0,100),
    };
  });
  return {version:1,objects};
}

const record = (type,id,name,options={})=>({...createRecord(type,id),name,...options});
export const PRESETS = {
  basics:{label:'基础形状',title:'从一个形状开始',description:'拖入一个新组件，选中它，再试着移动、旋转和缩放。目标：让方块、球体和圆形并排摆放。',objects:[
    record('box','basics-box','第一个方块',{position:[-1.5,0.8,0]}),
    record('sphere','basics-sphere','第一个球体',{position:[1.5,0.85,0]}),
  ]},
  materials:{label:'材质对比',title:'看见粗糙度与金属度',description:'三个球体使用同一种几何。选中它们，比较粗糙度和金属度；再添加一个圆环做同样的实验。',objects:[
    record('sphere','materials-matte','粗糙的球',{position:[-2.5,0.85,0],color:'#8aab9e',roughness:1,metalness:0}),
    record('sphere','materials-smooth','光滑的球',{position:[0,0.85,0],color:'#8aab9e',roughness:0.12,metalness:0}),
    record('sphere','materials-metal','金属的球',{position:[2.5,0.85,0],color:'#8aab9e',roughness:0.25,metalness:0.9}),
  ]},
  lights:{label:'灯光实验',title:'移动灯光，观察亮面',description:'选中点光源标记，尝试改变位置、颜色和光强。观察同一物体的亮面与高光如何随灯光移动。',objects:[
    record('sphere','lights-sphere','观察用的球',{position:[-1.2,0.85,0],color:'#dad8d1',roughness:0.28}),
    record('box','lights-box','观察用的方块',{position:[1.2,0.8,0],color:'#dad8d1',roughness:0.4}),
    record('pointLight','lights-point','暖色点光源',{position:[0,2.5,2],intensity:15,distance:10}),
  ]},
  workshop:{label:'车间搭建',title:'用方块和圆柱搭一间车间',description:'这是用基础形状组成的教学草图。复制一个圆柱作为第二个储罐，再拖入方块作为设备底座，练习对齐与命名。',objects:[
    record('plane','workshop-floor','车间地面',{scale:[2,1.5,1],color:'#d8ddd6'}),
    record('box','workshop-machine','设备底座',{position:[-1.8,0.4,0],scale:[1.2,0.5,1.4],color:'#7e9fc0'}),
    record('cylinder','workshop-tank','储罐',{position:[1.8,1.17,0],scale:[1.1,1.3,1.1],color:'#a3b5b2',metalness:0.6,roughness:0.35}),
  ]},
  production:{label:'产线排布',title:'把设备沿着产线排好',description:'选中并复制设备方块，开启网格吸附，把它们沿 X 轴等距摆放。再用旋转观察不同朝向。',objects:[
    record('box','production-belt','传送带',{position:[0,0.25,0],scale:[4.5,0.3,0.7],color:'#5d777f'}),
    record('box','production-machine-a','设备 A',{position:[-2.5,1.35,-1.5],scale:[0.8,1.6,0.9],color:'#7e9fc0'}),
    record('box','production-machine-b','设备 B',{position:[0,1.35,-1.5],scale:[0.8,1.6,0.9],color:'#7e9fc0'}),
    record('box','production-workpiece','工件',{position:[1.5,0.8,0],scale:[0.5,0.5,0.5],color:'#ec765a'}),
  ]},
  exhibition:{label:'展厅布置',title:'为展品安排一个展台',description:'圆柱是展台，球体是展品。添加自己的形状，调整展台比例，再用颜色和灯光区分主展品。',objects:[
    record('plane','exhibition-floor','展区地面',{scale:[2,1.5,1],color:'#e1dccf'}),
    record('cylinder','exhibition-plinth','圆形展台',{position:[0,0.3,0],scale:[1.8,0.33,1.8],color:'#a7b69a'}),
    record('sphere','exhibition-art','球形展品',{position:[0,1.45,0],color:'#d5ac63',metalness:0.65,roughness:0.28}),
    record('box','exhibition-wall','背景墙',{position:[0,1.6,-2.5],scale:[3.8,2,0.12],color:'#c8d3bf'}),
  ]},
  maintenance:{label:'设备组合',title:'让颜色表达设备状态',description:'先用方块组成设备，再用球体表示状态灯。复制并改色，尝试用绿色、橙色表示不同的设备状态。',objects:[
    record('box','maintenance-cabinet-a','设备柜 A',{position:[-1.6,1.2,0],scale:[1,1.5,0.8],color:'#7c929c'}),
    record('box','maintenance-cabinet-b','设备柜 B',{position:[1.6,1.2,0],scale:[1,1.5,0.8],color:'#7c929c'}),
    record('sphere','maintenance-lamp-a','运行指示灯',{position:[-1.6,2.65,0],scale:[0.26,0.26,0.26],color:'#6caa87'}),
    record('sphere','maintenance-lamp-b','待检查指示灯',{position:[1.6,2.65,0],scale:[0.26,0.26,0.26],color:'#e3b35c'}),
  ]},
  energy:{label:'能源场景',title:'用平面搭一组光伏板',description:'蓝色平面是简化光伏板，方块是储能设备。复制平面并等距排列，再调整倾斜角度和金属度。',objects:[
    record('plane','energy-panel-a','光伏板 A',{position:[-2,1,0],rotation:[-65,0,0],scale:[0.6,0.4,1],color:'#527d9e',metalness:0.55,roughness:0.35}),
    record('plane','energy-panel-b','光伏板 B',{position:[1,1,0],rotation:[-65,0,0],scale:[0.6,0.4,1],color:'#527d9e',metalness:0.55,roughness:0.35}),
    record('box','energy-storage','储能设备',{position:[0,0.8,-2.5],scale:[1.8,1,0.8],color:'#a6b9b0'}),
  ]},
};

const jsString = value=>JSON.stringify(value).replaceAll('\u2028','\\u2028').replaceAll('\u2029','\\u2029');
const geometryParameters = {
  box:'参数依次为 X 方向的宽、Y 方向的高、Z 方向的深，长度均为场景单位',
  sphere:'参数依次为半径、水平分段数、垂直分段数；半径为场景单位，分段越多越圆滑，但三角形越多',
  cylinder:'参数依次为顶面半径、底面半径、沿 Y 轴的高度、圆周分段数；长度为场景单位',
  cone:'参数依次为底面半径、沿 Y 轴的高度、圆周分段数；长度为场景单位',
  torus:'参数依次为圆环中心线半径、管子半径、管截面分段数、圆环圆周分段数；长度为场景单位',
  plane:'参数依次为局部 X、Y 方向的宽和高，单位为场景单位；初始位于 XY 平面',
  circle:'参数依次为半径、圆周分段数；半径为场景单位，初始位于 XY 平面',
};
export function sceneToCode(objects) {
  const sceneData = normalizeScene({version:1,objects});
  const sources = sceneData.objects.map((item,index)=>{
    const number = index+1;
    const definition = catalogByType.get(item.type);
    const variable = `object${number}`;
    const create = item.type==='pointLight'
      ? `const ${variable} = new THREE.PointLight(${jsString(item.color)}, ${item.intensity}, ${item.distance}); // 参数依次为光的颜色、光强（坎德拉）、照射距离上限（场景单位）；距离为 0 表示不额外限制范围。`
      : `const geometry${number} = new THREE.${definition.constructor}(${definition.args}); // ${geometryParameters[item.type]}。
const material${number} = new THREE.MeshStandardMaterial({ // 创建会响应灯光的标准材质，花括号内按属性名配置外观。
  color: ${jsString(item.color)}, // 表面基础色，使用 CSS 十六进制颜色字符串。
  roughness: ${item.roughness}, // 粗糙度范围 0～1：越小越光滑，高光越集中；越大越粗糙。
  metalness: ${item.metalness}, // 金属度范围 0～1：0 表示非金属，1 表示金属；高光还受灯光和环境影响。
  wireframe: ${item.wireframe}, // 是否只显示三角形边线：true 显示线框，false 显示表面。
  side: THREE.DoubleSide, // 正反两面都绘制，便于从背面观察没有厚度的平面与圆形。
}); // 结束材质配置并保存材质对象。
const ${variable} = new THREE.Mesh(geometry${number}, material${number}); // 两个参数依次为形状几何体、表面材质，组合成可渲染的网格。
${variable}.castShadow = true; // 允许物体向其他接收阴影的表面投影；还需要灯光和渲染器启用阴影。
${variable}.receiveShadow = true; // 允许本物体表面接收其他物体投下的阴影。`;
    return `// 组件 ${number}：${definition.label}。
${create}
${variable}.name = ${jsString(item.name)}; // 保存组件名称，便于在场景中按名字查找；名称本身不会绘制在画面上。
${variable}.position.set(${item.position.join(', ')}); // 参数依次为 X、Y、Z 位置，单位为场景单位；这里父级是场景，坐标也就是世界坐标。
${variable}.rotation.set(${item.rotation.map(value=>`THREE.MathUtils.degToRad(${value})`).join(', ')}); // 参数依次为绕 X、Y、Z 轴的欧拉角；degToRad 把面板角度乘以 π/180 转为弧度，默认旋转顺序为 XYZ。
${variable}.scale.set(${item.scale.join(', ')}); // 参数依次为局部 X、Y、Z 轴的缩放倍数，1 为原尺寸；灯光没有网格外形，缩放不会改变其光强或照射距离。
${variable}.visible = ${item.visible}; // true 显示组件，false 隐藏组件；对灯光设置 false 会停止该灯光照明。
scene.add(${variable}); // 把组件加入场景；只创建对象而不加入场景，渲染时看不到它。`;
  });
  return `import * as THREE from 'three'; // 导入 Three.js 的场景、几何体、材质和渲染器等 API，统一通过 THREE 访问。
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // 导入鼠标观察控制器，用于旋转、缩放和平移相机。

// 1. 场景与相机。
// 本例长度使用场景单位，1 单位的实际长度由项目约定；Three.js 的旋转属性使用弧度。
const scene = new THREE.Scene(); // 创建容纳物体和灯光的三维场景，此构造器不需要参数。
scene.background = new THREE.Color('#f0f3f7'); // 使用 CSS 十六进制颜色字符串设置画布背景色。
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200); // 参数依次为垂直视场角（度）、宽高比、近裁剪距离、远裁剪距离（场景单位）；宽高比先填 1，resize 中按实际画布更新。
camera.position.set(10, 9, 13); // 参数依次为相机的 X、Y、Z 坐标，单位为场景单位；Y 为高度，观察目标由 controls.target 设置。

// 2. 渲染器与鼠标观察。
const canvas = document.querySelector('#scene'); // 用 CSS 选择器查找页面中 id 为 scene 的 canvas 画布元素。
if (!canvas) throw new Error('页面中需要一个 id 为 scene 的 canvas。'); // 缺少画布时给出明确错误，避免继续创建无法显示的渲染器。
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); // canvas 指定绘制目标；antialias: true 开启边缘抗锯齿以减少锯齿。
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); // 像素比取设备值与 2 的较小值，在清晰度与显卡开销之间折中；它不是画布的 CSS 尺寸。
renderer.shadowMap.enabled = true; // 开启渲染器的阴影计算；灯光和物体还需分别配置投影与接收阴影。
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 使用柔化边缘的 PCF 阴影过滤方式。
const controls = new OrbitControls(camera, canvas); // 参数依次为被控制的相机、接收鼠标和触摸事件的画布。
controls.target.set(0, 1, 0); // 参数依次为观察目标的 X、Y、Z 坐标；相机围绕这个点转动。
controls.enableDamping = true; // 开启观察操作的惯性阻尼，必须在每帧调用 controls.update 才会生效。
controls.maxDistance = 65; // 相机到观察目标的最大距离为 65 个场景单位，限制滚轮拉远。
controls.minDistance = 2; // 相机到观察目标的最小距离为 2 个场景单位，限制滚轮拉近。
controls.maxPolarAngle = Math.PI * 0.49; // 限制从 Y 轴正方向量起的极角（弧度）；0.49π 约为 88.2°，避免转到地面下方。

// 3. 基础灯光、地面和网格。
scene.add(new THREE.HemisphereLight(0xffffff, 0x6b7b98, 2)); // 参数依次为天空色、地面反射色、光照强度；半球光提供随表面朝向变化的补光，本身不产生阴影。
const sun = new THREE.DirectionalLight(0xffffff, 3); // 参数依次为光的颜色、光照强度；平行光模拟远处太阳，强度不随距离衰减。
sun.position.set(6, 12, 8); // 设置灯光的 X、Y、Z 位置；它照向默认位于原点的 target，这两个点共同决定照射方向。
sun.castShadow = true; // 允许此平行光生成阴影，代价是额外渲染阴影贴图。
sun.shadow.mapSize.set(1024, 1024); // 参数依次为阴影贴图的宽、高像素数；越大越细腻，也越占显存和渲染时间。
sun.shadow.camera.left = -20; // 阴影正交相机的左边界，单位为场景单位；只在相机视锥覆盖范围内生成阴影。
sun.shadow.camera.right = 20; // 阴影正交相机的右边界，左右之差为阴影覆盖宽度。
sun.shadow.camera.top = 20; // 阴影正交相机的上边界，单位为场景单位。
sun.shadow.camera.bottom = -20; // 阴影正交相机的下边界，上下之差为阴影覆盖高度。
sun.shadow.camera.far = 60; // 阴影相机的远裁剪距离为 60 个场景单位；过远的物体不参与这张阴影贴图。
sun.shadow.bias = -0.0005; // 为阴影深度比较加小偏移以减轻表面条纹；绝对值过大可能让阴影与物体分离。
scene.add(sun); // 将灯光加入场景，让它参与后续渲染。
const ground = new THREE.Mesh( // 创建地面网格，下一行传几何体，再下一行传材质。
  new THREE.PlaneGeometry(100, 100), // 参数依次为局部 X、Y 方向的宽和高，长度为场景单位；初始平面没有厚度。
  new THREE.MeshStandardMaterial({ color: '#e6ebf1', roughness: 0.9 }) // color 为基础色；roughness 为 0～1 的粗糙度，0.9 让地面高光更分散。
); // 结束地面网格构造，保存为 ground 供后续调整。
ground.rotation.x = -Math.PI / 2; // 绕 X 轴旋转 -π/2 弧度（-90°），把默认 XY 平面放平到 XZ 平面。
ground.position.y = -0.025; // 沿 Y 轴下移 0.025 个场景单位，让地面略低于辅助网格以减少表面闪烁。
ground.receiveShadow = true; // 允许地面接收其他物体投下的阴影。
scene.add(ground); // 将地面加入场景使其可见。
scene.add(new THREE.GridHelper(50, 50, '#b4bcc9', '#d0d7e2')); // 参数依次为网格边长（场景单位）、每边分格数、中心轴颜色、普通网格线颜色；辅助网格位于 XZ 平面。

// 4. 你拖入并调整过的组件。
${sources.length?sources.join('\n\n'):'// 场景暂时没有组件，可以在这里添加一个 Mesh。'}

// 5. 页面尺寸变化时更新画布与相机。
function resize() { // 定义尺寸更新函数；首次加载和画布容器大小变化时都会调用。
  const width = Math.max(1, canvas.parentElement.clientWidth || innerWidth); // 优先取容器宽度（CSS 像素），取不到时用窗口宽度，并确保至少为 1。
  const height = Math.max(1, canvas.parentElement.clientHeight || innerHeight); // 优先取容器高度（CSS 像素），至少为 1，防止计算宽高比时除以零。
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); // 重新读取设备像素比，最多为 2，适应跨屏或缩放后清晰度的变化。
  renderer.setSize(width, height); // 参数依次为画布显示宽、高（CSS 像素）；实际渲染像素数还会乘以像素比。
  camera.aspect = width / height; // 把相机宽高比同步为画布宽除以高，避免物体被拉伸。
  camera.updateProjectionMatrix(); // 相机参数改变后重建投影矩阵，让新的宽高比真正用于下一次渲染。
} // 结束尺寸更新函数的定义。
new ResizeObserver(resize).observe(canvas.parentElement); // 监听画布父容器尺寸；发生变化时调用 resize，比只监听窗口变化更适合分栏页面。
resize(); // 首次立即计算尺寸，避免等到容器变化时才设置画布大小。

// 6. 每一帧更新观察控制器，再画出场景。
function render() { // 定义每一帧要执行的绘制步骤。
  requestAnimationFrame(render); // 请求浏览器在下一次绘制前再次调用 render；传入函数本身，而不是立即调用它。
  controls.update(); // 更新鼠标观察和阻尼造成的相机变化。
  renderer.render(scene, camera); // 参数依次为要绘制的场景、观察场景的相机，生成当前帧画面。
} // 结束每帧绘制函数的定义。
render(); // 首次调用以启动后续的动画帧循环。
`;
}
