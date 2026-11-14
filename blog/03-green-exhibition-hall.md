# 03 绿色主题展厅：从模板到 Three.js

本篇带你用“绿色主题展厅”完成一次从运行、观察到改代码的学习。从一个大体量 GLB 展厅学习模型加载、环境贴图、缩放与相机，以及漫游和碰撞之间的区别。

本文依据已保存的 OneTwin 公开模板配置和本地可运行代码编写。完整入口直接使用原站公开组件与原始素材，可读练习另行编写；两者的来源与用途分别说明。首次学习建议先读[学习路线](https://my.feishu.cn/docx/Sqvzda7k4o5DWdxZLIUcDoefnDh)。

## 1. 先运行，再观察

这台笔记本的项目目录是 

```text
D:\workspace\front\threejs-onetwin-beginners\03-green-exhibition-hall
```

在 PowerShell 中运行：

```powershell
cd 'D:\workspace\front\threejs-onetwin-beginners\03-green-exhibition-hall'
node server.mjs
```

看到服务地址后，打开[完整案例](http://127.0.0.1:8743/)。如果该地址已经能打开，说明服务正在运行，不要重复启动。地址栏里不能使用 file:// 直接打开 HTML，模块与素材需要通过 HTTP 加载。

1. 打开主页面后等待大型展厅模型加载；首次需要从本机服务读取约 244MB 模型并解码，加载时间明显长于其他案例。
2. 模板默认选中“游览”；模型、人物和碰撞体就绪后，会进入展厅内的人物视角。
3. 使用 WASD 移动，观察人物与展墙、地面的关系；不要只凭能移动来判断碰撞已生效。
4. 完整入口使用原站人物“阿力”、重力与碰撞。practice.html 是独立的轨道观察练习，没有人物物理。
5. 打开 practice.html 单独练习模型和相机；lesson.html 用小型基础几何体练习，适合先熟悉坐标。

同一局域网的其他设备可以使用“这台笔记本的实际局域网 IP:8743”。这是笔记本上的项目，与 192.168.1.9 的 Saltline 服务是不同的服务。网页三维画面由访问端浏览器绘制。

## 2. 对照模板，认识文件

原模板的画布为 2048×1080，共 1 个组件。组件清单为：`Three` × 1。

| 文件或目录 | 你在这里学什么 |
| --- | --- |
| index.html、reference.mjs、reference-runtime/ | 完整入口、本地配置适配与原站公开组件 |
| source/template.json | 原模板的组件、坐标、模型配置和样例数据 |
| source/assets.json | 原始素材 URL 与本地文件的对应关系 |
| assets/ | 模型、图片、HDR 和字体 |
| vendor/、replica.html、replica.mjs | 练习依赖与另写的简化运行器；原站组件另存于 reference-runtime/ |
| practice.html、practice.mjs | 本文逐步解释的单项练习 |
| lesson.html | 早期基础几何体练习，与原版完整页面分开 |
| AI_PROMPT.md | 根据真实模板整理的复现提示词 |
| server.mjs | 只负责提供本地文件的服务 |

下面列的是已保存到本地的原始模型。MB 按 1,000,000 字节计算，尺寸是文件体积，不是显存用量。

| 模型文件 | 文件体积 | 本地位置 |
| --- | --- | --- |
| 绿色主题展厅_17874151526596118.glb | 244.31 MB | `assets/a7219cf2cad0037720.glb` |

先打开 source/template.json，搜索组件名，再找到 propValue。style 决定组件位于画布哪里，propValue 决定组件显示什么。改业务数字一般改 data；改面板位置一般改 style；两者不要混在一起。

## 3. 跑通一个完整的单项示例

打开[单项练习](http://127.0.0.1:8743/practice.html)。它只保留模型、相机、灯光、动画和鼠标控制，去掉完整大屏的干扰；光照经过教学简化，因此不是完整页面的截图复刻。

practice.html 的完整内容如下，可用它理解页面如何引入本地模块：

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="icon" href="./favicon.svg" type="image/svg+xml">
  <title>模型与数据练习</title>
  <style>
    html,body{height:100%;margin:0;background:#081726;color:#def5ff;font:14px/1.6 "Microsoft YaHei",sans-serif}
    #view{position:absolute;inset:0}header{position:fixed;top:12px;left:16px;z-index:1;padding:10px 16px;background:#071321d9;border:1px solid #397782;max-width:70vw}
    a{color:#58e7df}p{margin:4px 0}canvas{display:block}#status{color:#f2d37c}
  </style>
  <script type="importmap">{"imports":{"three":"./vendor/three.module.js","three/addons/":"./vendor/addons/"}}</script>
  <script src="./vendor/echarts.min.js"></script>
</head>
<body>
  <div id="view"></div>
  <header><strong id="name">加载练习…</strong><p>鼠标拖动旋转，滚轮缩放。<a href="./">返回完整案例</a></p><p id="status">正在读取本地模板</p></header>
  <script type="module" src="./practice.mjs"></script>
</body>
</html>
```

页面底部加载 practice.mjs。以下是该文件的完整可运行内容；保留同目录的 source、assets、vendor 即可运行，无需安装 npm 包：

```javascript
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const view = document.querySelector('#view');
const status = document.querySelector('#status');
const canonical = url => new URL(url.startsWith('//') ? `https:${url}` : url, 'https://onetwin.cn').href.replace(/^http:/, 'https:');
const setPoint = (object, value = {}, fallback = 0) => object.set(value.x ?? fallback, value.y ?? fallback, value.z ?? fallback);

async function main() {
  const [template, assets] = await Promise.all([
    fetch('./source/template.json').then(response => { if (!response.ok) throw new Error('模板读取失败'); return response.json(); }),
    fetch('./source/assets.json').then(response => { if (!response.ok) throw new Error('素材清单读取失败'); return response.json(); }),
  ]);
  document.querySelector('#name').textContent = `${template.name} · 单项练习`;
  const component = template.canvasData.find(item => ['Three', 'Container3D'].includes(item.component));
  if (!component) {
    // 智慧能源原模板没有 Three 场景；先单独练习它的趋势图数据绑定。
    const source = template.canvasData.find(item => item.component === 'Chart').propValue;
    const option = structuredClone(source.option);
    option.xAxis[0].data = source.data.xData;
    option.series.forEach((series, index) => { series.data = source.data.seriesData[index]; });
    option.legend.data = option.series.map(series => series.name);
    option.grid = { left: '12%', right: '8%', top: '28%', bottom: '12%', containLabel: true };
    const chart = echarts.init(view);
    chart.setOption(option);
    addEventListener('resize', () => chart.resize());
    status.textContent = '本例为 ECharts 趋势图；主页面的能源管线也是二维图形。';
    window.practice = { template, chart, option };
    return;
  }

  const single = component.component === 'Container3D';
  const config = single ? component.propValue.attribute : component.propValue;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#081726');
  const camera = new THREE.PerspectiveCamera(config.camera?.fov || 50, innerWidth / innerHeight, .1, 3000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  view.append(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  scene.add(new THREE.HemisphereLight('#dff8ff', '#344e59', 2));
  const sun = new THREE.DirectionalLight('#ffffff', 2);
  sun.position.set(10, 20, 10);
  scene.add(sun);

  const manager = new THREE.LoadingManager();
  const localAsset = url => {
    if (/^(data:|blob:)/.test(url) || url.startsWith(location.origin)) return url;
    const entry = assets.entries[canonical(url)];
    if (!entry) throw new Error(`素材未下载：${url}`);
    return new URL(entry.file, location.href).href;
  };
  manager.setURLModifier(localAsset);
  const draco = new DRACOLoader();
  draco.setDecoderPath(new URL('./vendor/draco/', location.href).href);
  const loader = new GLTFLoader(manager);
  loader.setDRACOLoader(draco);
  const entries = single ? [{ ...config, name: '设备模型' }] : config.modelList;
  const models = [], mixers = [];
  for (const entry of entries) {
    status.textContent = `加载 ${entry.name}，大型模型首次打开需要等待…`;
    const original = canonical(entry.url);
    loader.setResourcePath(original.slice(0, original.lastIndexOf('/') + 1));
    const gltf = await loader.loadAsync(localAsset(entry.url));
    setPoint(gltf.scene.position, entry.position);
    setPoint(gltf.scene.scale, entry.scale, 1);
    setPoint(gltf.scene.rotation, entry.rotation);
    scene.add(gltf.scene);
    models.push(gltf.scene);
    const mixer = new THREE.AnimationMixer(gltf.scene);
    mixers.push(mixer);
    for (const clip of gltf.animations) {
      if (entry.animationsPlay && entry.selectAnimations?.some(name => name === clip.name || name === `${entry.name}_${clip.name}`)) mixer.clipAction(clip).play();
    }
  }
  if (config.camera) {
    setPoint(camera.position, config.camera.cameraPosition);
    setPoint(controls.target, config.camera.cameraLookAt);
  } else {
    const bounds = new THREE.Box3().setFromObject(models[0]);
    bounds.getCenter(controls.target);
    const size = bounds.getSize(new THREE.Vector3()).length();
    camera.position.copy(controls.target).add(new THREE.Vector3(size, size * .6, size * 1.5));
  }
  controls.update();
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), .05);
    if (document.hidden) return;
    mixers.forEach(mixer => mixer.update(dt));
    controls.update();
    renderer.render(scene, camera);
  });
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
  status.textContent = `已加载 ${models.length} 个模型。此练习只展示模型、相机和动画，完整面板在主页面。`;
  window.practice = { template, scene, camera, controls, renderer, models, mixers };
}
main().catch(error => { status.textContent = `加载失败：${error.message}`; console.error(error); });
```


按执行顺序读代码：先取得模板和本地素材映射，再建立场景、相机和渲染器，再把模型加入场景，最后处理尺寸变化与错误。renderer.render 是绘制，AnimationMixer.update 是推进模型动画，两者的职责不同。

## 4. 拆解这个案例的关键点

**观察 1。** 原模板只有 1 个 Three 组件。展台、墙面、装饰等大部分内容已经建在 GLB 内，不能根据看到的物体数量来推断组件数量。

**观察 2。** 模型大小约 244.31MB，整体缩放为 1.5。模型压缩、网络下载和浏览器解码是三个不同阶段。

**观察 3。** 初始相机 (-80,60,48)，目标原点，fov 50；这是一组远景参数，不宜直接拿一个小模型的相机参数套用。

**观察 4。** 模板使用日落 HDR 环境贴图。HDR 作为 scene.environment 影响反射；作为 scene.background 决定是否看见天空。

**观察 5。** 原模板的游览配置指定人物“阿力”，并开启重力和碰撞。OrbitControls 只负责观察，不会自动让人物站在地板上，也不会阻止穿墙。

完整入口的 reference.mjs 先把模板中的网址映射为本地素材，再将原始配置交给原站 PreviewCanvas 和组件运行库。reference-runtime/SOURCE.md 记录来源和本地适配，压缩组件代码不是本教程原创。另写的 replica.mjs 供拆解练习：boot 读取模板，renderThree 管模型与相机，renderData 管二维组件，asset 管素材映射。先读 practice.mjs，再选择一类组件读 replica.mjs，不必从压缩运行库开始。

## 5. 按顺序动手修改

先复制要改的文本文件作为练习备份，保留原始模型。每次只改一项，保存后刷新；预期现象出现后再做下一步。

1. 先打开 lesson.html 熟悉拖动和缩放，再打开 practice.html 比较原始 GLB 与基础几何体。
2. 在模板中将模型 scale 的 x/y/z 同时从 1.5 改成 1.2，刷新并观察，不要只改一个轴。
3. 在 practice.mjs 的相机赋值之后将 controls.target.y 增加 2，比较观察目标变化。
4. 在 practice.mjs 中暂时注释 environment 赋值，比较金属和玻璃材质，再恢复；不要修改原站压缩组件代码来做入门练习。

如果使用项目级工具重新生成页面，注意：tools/build-replicas.mjs 会把 runtime 中的公共文件复制到五个目录，覆盖各目录生成的 replica 和 practice 文件。自己的持续修改应保存到 runtime 或另存练习文件；不要在做完练习后无意覆盖它。

## 6. 给 AI 的可复用提示词

公开模板 API 提供了组件配置、素材和样例数据，没有提供作者最初的 AI 对话或原始提示词。下面是依据这些真实输入重新整理的“复现提示词”，不能当成作者原始提示词。它用于从零编写教学实现；完整对照入口直接复用原站组件，并不是“仅靠提示词生成一模一样”的实验结果。要复现几何与材质，AI 还需要本目录的原始模型和配置，单靠一段文字不能恢复同一份网格文件。


```text
复现绿色主题展厅。原模板画布 2048×1080，只有一个 Three 组件。直接使用 source/template.json 指向的绿色主题展厅 GLB 和本地日落 HDR，保留模型的节点与材质，整体 scale 为 1.5；相机 (-80,60,48)，目标原点，fov 50。按源配置设置灯光、天空盒、辅助轴和 OrbitControls。底部“游览”要实现原配置人物“阿力”、重力、碰撞和视角切换；不得把简单相机位移声称为完整巡游。模型约 244MB，必须显示加载进度和失败原因。不要添加原模板不存在的数据大屏和四种天气按钮。

技术要求：读取本目录 source/template.json 和 source/assets.json；Three.js、GLTFLoader、DRACOLoader、ECharts 均从 vendor 本地加载，Draco 的 JS 与 WASM 版本匹配。用原生 HTML/CSS/JavaScript 和 Node 内置静态服务实现，不引入不必要的框架。尊重原始模型、数据、组件位置、字体和素材，不用通用几何体冒充原模型。必须显示加载/失败状态，限制像素倍率，处理窗口尺寸变化。逐个核对原版截图和交互后再报告一致性，未实现的行为要明确列出。

教学要求：先解释 scene、camera、renderer、Object3D、材质、动画和 DOM 图表分别负责什么；从 practice.html 的单项练习开始，每一步给出文件位置、修改代码、运行方式和预期结果，再解释完整 replica.mjs。涉及未实现的功能必须标注为扩展练习。
```


让 AI 先输出它识别到的模型、组件数量、数据来源和未实现项，再写代码。检查它是否把本篇指出的静态演示数据说成实时数据，或添加原模板没有的按钮。代码生成后要实际运行、操作和对照截图。

## 7. 排错与自查

| 现象 | 先查哪里 | 处理方法 |
| --- | --- | --- |
| 端口被占用 | 原服务是否已经启动 | 先访问本端口；已运行时复用服务 |
| 页面能开但模型不出现 | 浏览器网络中的 GLB/glTF 和 Draco 请求 | 检查 source/assets.json 指向的本地文件，避免 file:// |
| 只有黑色背景 | 加载失败提示、相机目标、灯光、材质 | 先运行 practice.html 区分模型问题和面板问题 |
| 模块找不到 | importmap、vendor/addons 路径 | 不要只复制 HTML，保留完整目录 |
| 页面明显卡顿 | 访问端显卡、分辨率和模型体积 | 少开大型场景标签，降低像素倍率，先用单项练习定位 |
| 指标不变化 | 模板是否仅为静态样例 | 本项目不会自动连接真实生产或能源系统 |

学习完成后，你应能独立启动该目录，指出一个模型或图表的数据位置，完成本篇一次修改并解释变化原因。完整入口可用 window.__reference.diagnostics 检查组件错误；前三个场景还可查看 window.__referenceGlobals[0] 的模型、相机和动作。replica.html 使用 window.__replica，practice.html 使用 window.practice；这些对象不能代替画面和交互验收。

## 8. 来源与当前复现状态

模板来源：[OneTwin 原版 绿色主题展厅](https://onetwin.cn/#/preview?kanbanId=6a89cd164d6c702da8c2e993&mode=template)，模板编号 `6a89cd164d6c702da8c2e993`。配置取自公开的 visual-template/get 接口，保留在 source/template.json；模型与图片使用该配置引用的素材。完整入口复用原站公开组件，来源、文件校验和本地适配记录在 reference-runtime/SOURCE.md 与 sources.json；practice.mjs、lesson.html 和 replica.mjs 是另写的教学代码。Three.js 许可文本保留在 vendor/THREE-LICENSE.txt。

当前状态：完整入口使用原站展厅、HDR、人物与游览组件。实测人物按 W 移动，重力和碰撞开启，场景登记 1,485 个碰撞对象；模型首次加载和构建碰撞体较重。practice.html 与 replica.html 的相机观察和漫游是教学简化版本。原始模型、配置、原站组件与关键操作已在本机核对；动画阶段、滚动位置、天气和时钟会随运行时刻变化，不能用不同时间的截图逐像素判断。教学页与完整对照页的用途不要混淆。
