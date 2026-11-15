# 02 工业控制：从模板到 Three.js

本篇带你用“工业控制”完成一次从运行、观察到改代码的学习。用工业产线解释多个模型的坐标关系、动画启动与停止、相机预设和运行指标的组合。

本文依据已保存的 OneTwin 公开模板配置和本地可运行代码编写。完整入口直接使用原站公开组件与原始素材，可读练习另行编写；两者的来源与用途分别说明。首次学习建议先读[学习路线](./00-学习路线总览.html)。

**本课目标：** 理解多个模型的坐标变换，以及 AnimationMixer 和动画启停。

**完成标准：** 能操作启动、停止与急停，解释模型动作和按钮状态的对应关系。

## 1. 先运行，再观察

首次运行先按[克隆与本地启动教程](../docs/THREEJS-LEARNING-GUIDE.html)取得仓库。在终端进入克隆后的仓库根目录（能看到 `server.mjs` 的位置），启动统一服务：

```powershell
node server.mjs
```

本机浏览器打开 `http://127.0.0.1:8760/`。本案例代码位于仓库的 `02-industrial-control/`。如果你已经通过局域网打开课程，就直接使用下面的入口，无需重复启动服务。请通过 HTTP 访问，不能直接双击 HTML 文件。

[打开完整案例](../02-industrial-control/) · [打开单项练习](../02-industrial-control/practice.html) · [打开基础练习](../02-industrial-control/lesson.html) · [打开组件拆解](../02-industrial-control/replica.html) · [拖拽搭建练习](../threejs-learning-lab/drag-lab/?preset=production)

1. 等待“自动产线1”和“地板”两个模型加载。只看到地板或设备缺失时，先检查素材清单和网络请求。
2. 点击“启动”，观察产线动画；点击“停止”或“急停”验证停止，再点击“启动”恢复。
3. 将鼠标放在图标上查看“自动旋转”和“重置相机”，比较旋转与恢复视角的区别。
4. 点击机器人图标进入“机器人巡检”，使用 WASD 移动；再次点击该图标退出。人物资源使用原站的“阿力”。
5. 打开 practice.html 学习两个 GLB 的加载与变换；lesson.html 是保留的基础几何体练习。

同一局域网的其他设备使用“部署电脑的实际 IP:8760”访问统一入口。本页链接沿用当前服务地址，不会跳到访问者自己的电脑；三维画面由访问端浏览器绘制。

## 2. 对照模板，认识文件

原模板的画布为 2048×1080，共 22 个组件。组件清单为：`Three` × 1，`DecorationPicture` × 1，`VTextNew` × 7，`decorationPicture` × 6，`StatusCapsule` × 1，`DataCardGroup` × 1，`Pie1` × 1，`GaugeGlow` × 1，`SlideLineChart` × 1，`FaultCodePanel` × 1，`SegmentStatRibbon` × 1。

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
| 自动产线1_17799680367021619.glb | 38.61 MB | `assets/70b999cd52ebd0063a.glb` |
| 地板_17731245240747550.glb | 7.66 MB | `assets/a77d54046be312c55c.glb` |

先打开 source/template.json，搜索组件名，再找到 propValue。style 决定组件位于画布哪里，propValue 决定组件显示什么。改业务数字一般改 data；改面板位置一般改 style；两者不要混在一起。

## 3. 跑通一个完整的单项示例

打开[单项练习](../02-industrial-control/practice.html)。它只保留模型、相机、灯光、动画和鼠标控制，去掉完整大屏的干扰；光照经过教学简化，因此不是完整页面的截图复刻。

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

**观察 1。** 自动产线和地板是两个独立的 GLB。地板位于 (3,1.5,-5)，缩放为 (0.39,1,0.34)；不能因为地板名称就假设它在世界原点。

**观察 2。** 初始相机约为 (2.02,10.25,14.34)，目标约为 (2.22,0.79,-4.13)，视场角为 58°。把两组值同时保留才能复原构图。

**观察 3。** AnimationMixer 负责时间推进，AnimationAction 控制某一个动画。播放、停止按钮不是简单地改变按钮文字。

**观察 4。** 启动和停止配置引用“自动产线1_Animation”，需要映射到 GLB 里的实际动画名称。

**观察 5。** 透明围墙是额外的图形效果，和实体产线模型不同；指标卡、饼图、仪表盘、滚动曲线都来自独立组件。

完整入口的 reference.mjs 先把模板中的网址映射为本地素材，再将原始配置交给原站 PreviewCanvas 和组件运行库。reference-runtime/SOURCE.md 记录来源和本地适配，压缩组件代码不是本教程原创。另写的 replica.mjs 供拆解练习：boot 读取模板，renderThree 管模型与相机，renderData 管二维组件，asset 管素材映射。先读 practice.mjs，再选择一类组件读 replica.mjs，不必从压缩运行库开始。

## 5. 按顺序动手修改

先复制要改的文本文件作为练习备份，保留原始模型。每次只改一项，保存后刷新；预期现象出现后再做下一步。

1. 在 practice.mjs 中暂时只加载 modelList 的第一个模型，再恢复两个模型，辨认地板对空间感的作用。
2. 在完整入口的控制台查看 window.__referenceGlobals[0].actions，找到“自动产线1_Animation”；在 practice.html 中查看 window.practice.mixers。
3. 启动后检查动作的 isRunning()；停止后再次检查，再观察模型动作是否停止。
4. 在模板的 DataCardGroup.data 中只改一个数值，刷新检查对应卡片；保留其余数据和布局。

如果使用项目级工具重新生成页面，注意：tools/build-replicas.mjs 会把 runtime 中的公共文件复制到五个目录，覆盖各目录生成的 replica 和 practice 文件。自己的持续修改应保存到 runtime 或另存练习文件；不要在做完练习后无意覆盖它。

## 6. 给 AI 的可复用提示词

公开模板 API 提供了组件配置、素材和样例数据，没有提供作者最初的 AI 对话或原始提示词。下面是依据这些真实输入重新整理的“复现提示词”，不能当成作者原始提示词。它用于从零编写教学实现；完整对照入口直接复用原站组件，并不是“仅靠提示词生成一模一样”的实验结果。要复现几何与材质，AI 还需要本目录的原始模型和配置，单靠一段文字不能恢复同一份网格文件。


```text
复现工业控制大屏，画布 2048×1080，共 22 个组件。加载 source/template.json 中自动产线1和地板两个 GLB，保留每个模型的位置、旋转、缩放；地板位置 (3,1.5,-5)，缩放 (0.39,1,0.34)。相机约 (2.02,10.25,14.34)，目标 (2.22,0.79,-4.13)，fov 58。实现自动旋转、重置相机、启动、停止、急停及巡检入口，启动/停止对应“自动产线1_Animation”。按配置渲染青色围墙。侧边保留 StatusCapsule、DataCardGroup、Pie1、GaugeGlow、SlideLineChart、FaultCodePanel、SegmentStatRibbon。所有指标使用模板样例数据。

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

模板来源：[OneTwin 原版 工业控制](https://onetwin.cn/#/preview?kanbanId=6aaf48496e35aa3450bb7847&mode=template)，模板编号 `6aaf48496e35aa3450bb7847`。配置取自公开的 visual-template/get 接口，保留在 source/template.json；模型与图片使用该配置引用的素材。完整入口复用原站公开组件，来源、文件校验和本地适配记录在 reference-runtime/SOURCE.md 与 sources.json；practice.mjs、lesson.html 和 replica.mjs 是另写的教学代码。Three.js 许可文本保留在 vendor/THREE-LICENSE.txt。

当前状态：完整入口使用原站组件、两个原始模型和原站巡检人物。启动、停止、急停均检查真实动画状态；旧配置中的 paly 字段兼容为新版运行库读取的 play，源模板保持原样。教学运行器的巡检仍为简化版本。原始模型、配置、原站组件与关键操作已在本机核对；动画阶段、滚动位置、天气和时钟会随运行时刻变化，不能用不同时间的截图逐像素判断。教学页与完整对照页的用途不要混淆。
