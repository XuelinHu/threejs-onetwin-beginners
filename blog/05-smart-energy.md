# 05 智慧能源：从模板到 Three.js

本篇带你用“智慧能源”完成一次从运行、观察到改代码的学习。看懂二维能源流向图、数字指标和趋势图的数据组合，避免把所有数字孪生页面都当作 Three.js 场景。

本文依据已保存的 OneTwin 公开模板配置和本地可运行代码编写。完整入口直接使用原站公开组件与原始素材，可读练习另行编写；两者的来源与用途分别说明。首次学习建议先读[学习路线](./00-学习路线总览.html)。

**本课目标：** 理解 ECharts 趋势图、能源流向和数字指标的数据绑定。

**完成标准：** 能更新趋势图的一个数据点，并说明二维管线效果与 Three.js 场景的区别。

## 1. 先运行，再观察

首次运行先按[克隆与本地启动教程](../docs/THREEJS-LEARNING-GUIDE.html)取得仓库。在终端进入克隆后的仓库根目录（能看到 `server.mjs` 的位置），启动统一服务：

```powershell
node server.mjs
```

本机浏览器打开 `http://127.0.0.1:8760/`。本案例代码位于仓库的 `05-smart-energy/`。如果你已经通过局域网打开课程，就直接使用下面的入口，无需重复启动服务。请通过 HTTP 访问，不能直接双击 HTML 文件。

[打开完整案例](../05-smart-energy/) · [打开单项练习](../05-smart-energy/practice.html) · [打开基础练习](../05-smart-energy/lesson.html) · [打开组件拆解](../05-smart-energy/replica.html) · [拖拽搭建练习](../threejs-learning-lab/drag-lab/?preset=energy)

1. 打开主页面，观察中央供回水管线、温度标识和流动效果。
2. 核对左上数字：空调泵 48、地源泵 91、水源抽电 41.0、使用率 40.00%、水泵 10.00、开关 26.00%。
3. 观察右侧供回温、流量表，左侧设备状态表以及底部趋势和饼图。
4. 右上天气来自外部天气页面；离线时可能不可用，本地模型和图表不依赖该天气服务。
5. 打开 practice.html，单独练习 ECharts 趋势图的数据绑定；此页不创建 Three 场景。

同一局域网的其他设备使用“部署电脑的实际 IP:8760”访问统一入口。本页链接沿用当前服务地址，不会跳到访问者自己的电脑；三维画面由访问端浏览器绘制。

## 2. 对照模板，认识文件

原模板的画布为 2048×1080，共 69 个组件。组件清单为：`DecorationPicture` × 1，`borderBox7` × 8，`Iframe` × 1，`Time` × 1，`Picture2` × 20，`VText` × 15，`Decoration10` × 8，`ScrollTable` × 2，`NumberFlop` × 6，`CustomChart` × 1，`PieY` × 1，`VTextNew` × 1，`NeuralCore` × 1，`Chart` × 3。

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

这个模板没有 Three 或 Container3D。学习它的价值是看懂数据大屏和能源流向图的组成；不应为套用 Three.js 而把二维管线误写成三维场景。

| 模型文件 | 文件体积 | 本地位置 |
| --- | --- | --- |
| 无三维模型 | — | 中央图由 ECharts 绘制 |

先打开 source/template.json，搜索组件名，再找到 propValue。style 决定组件位于画布哪里，propValue 决定组件显示什么。改业务数字一般改 data；改面板位置一般改 style；两者不要混在一起。

## 3. 跑通一个完整的单项示例

打开[单项练习](../05-smart-energy/practice.html)。它只保留一张真实配置的趋势图，让你先理解数据如何进入图表。

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
const view = document.querySelector('#view');
const status = document.querySelector('#status');

async function main() {
  const response = await fetch('./source/template.json');
  if (!response.ok) throw new Error(`模板读取失败：HTTP ${response.status}`);
  const template = await response.json();
  document.querySelector('#name').textContent = `${template.name} · 趋势图练习`;
  const source = template.canvasData.find(item => item.component === 'Chart').propValue;
  const option = structuredClone(source.option);
  option.xAxis[0].data = source.data.xData;
  option.series.forEach((series, index) => { series.data = source.data.seriesData[index] || []; });
  option.legend.data = option.series.map(series => series.name);
  option.grid = { left: '12%', right: '8%', top: '28%', bottom: '12%', containLabel: true };
  const chart = echarts.init(view);
  chart.setOption(option);
  addEventListener('resize', () => chart.resize());
  status.textContent = '修改 source.data，再调用 chart.setOption(option) 即可更新趋势。主页面的能源管线也是二维图形。';
  window.practice = { template, chart, option };
}
main().catch(error => { status.textContent = `加载失败：${error.message}`; console.error(error); });
```


按执行顺序读代码：先取得模板和本地素材映射，再建立图表并绑定横轴和系列，最后处理尺寸变化与错误。chart.setOption 接收图表选项；修改普通数组后，需要再调用它更新画面。

## 4. 拆解这个案例的关键点

**观察 1。** 原模板共 69 个组件，没有 Three 或 Container3D。中央管线来自 CustomChart 的 HTML/JavaScript，使用 ECharts 的 graphic、graph 和 lines 绘制。

**观察 2。** NumberFlop 的 number 是数组；toFixed 控制小数位；content 为空时仍需要显示数字。否则 41.0 与 10.00 会消失。

**观察 3。** 供水和回水的流动来自 lines.effect 的周期、拖尾和线路坐标，不是三维管道模型，也不是物理水流仿真。

**观察 4。** CustomChart 运行在 iframe 中，必须等有效尺寸再初始化。零尺寸画布会让拖尾层反复报 drawImage 错误。

**观察 5。** 原自定义脚本中的 getData 在 Ajax 前直接 return，定时器也被注释。页面当前使用静态演示数据，不能把源码里的旧地址当成正在运行的数据接口。

完整入口的 reference.mjs 先把模板中的网址映射为本地素材，再将原始配置交给原站 PreviewCanvas 和组件运行库。reference-runtime/SOURCE.md 记录来源和本地适配，压缩组件代码不是本教程原创。另写的 replica.mjs 供拆解练习：boot 读取模板，renderThree 管模型与相机，renderData 管二维组件，asset 管素材映射。先读 practice.mjs，再选择一类组件读 replica.mjs，不必从压缩运行库开始。

## 5. 按顺序动手修改

先复制要改的文本文件作为练习备份，保留原始模型。每次只改一项，保存后刷新；预期现象出现后再做下一步。

1. 先运行 practice.html，在控制台查看 window.practice.option.xAxis[0].data 与 series[0].data。
2. 执行 window.practice.option.series[0].data[0] = 25，再执行 window.practice.chart.setOption(window.practice.option)，观察首月数据变化。
3. 在模板的 NumberFlop 中把 48 改为 49，刷新主页面；再改 toFixed 为 1，观察显示形式。
4. 在 CustomChart 的 script 中找到 lines.effect.period，把 8 改为 12，刷新比较流动速度；保留原线路坐标。

如果使用项目级工具重新生成页面，注意：tools/build-replicas.mjs 会把 runtime 中的公共文件复制到五个目录，覆盖各目录生成的 replica 和 practice 文件。自己的持续修改应保存到 runtime 或另存练习文件；不要在做完练习后无意覆盖它。

## 6. 给 AI 的可复用提示词

公开模板 API 提供了组件配置、素材和样例数据，没有提供作者最初的 AI 对话或原始提示词。下面是依据这些真实输入重新整理的“复现提示词”，不能当成作者原始提示词。它用于从零编写教学实现；完整对照入口直接复用原站组件，并不是“仅靠提示词生成一模一样”的实验结果。要复现几何与材质，AI 还需要本目录的原始模型和配置，单靠一段文字不能恢复同一份网格文件。


```text
复现智慧能源大屏，画布 2048×1080，共 69 个组件，没有 Three/Container3D。按 source/template.json 原始坐标组合背景、8 个 borderBox7、20 个 Picture2、标题、Time、天气 iframe、2 个 ScrollTable、6 个 NumberFlop、CustomChart、PieY、NeuralCore 和 3 个 Chart。中央图使用原 CustomChart.script 的 ECharts graph/graphic/lines 和原线路，保留流动效果。数字显示 48、91、41.0、40.00%、10.00、26.00%。NeuralCore 主值 64%，外围为 87%、1250MB、92%、65%。脚本只使用模板样例数据；不得启用原代码中已被 return 和注释停用的旧 Ajax 地址。修复 iframe 初次零尺寸及背景发白的问题。

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

模板来源：[OneTwin 原版 智慧能源](https://onetwin.cn/#/preview?kanbanId=6a0dcb7cd1cab66fb4f6dd75&mode=template)，模板编号 `6a0dcb7cd1cab66fb4f6dd75`。配置取自公开的 visual-template/get 接口，保留在 source/template.json；模型与图片使用该配置引用的素材。完整入口复用原站公开组件，来源、文件校验和本地适配记录在 reference-runtime/SOURCE.md 与 sources.json；practice.mjs、lesson.html 和 replica.mjs 是另写的教学代码。Three.js 许可文本保留在 vendor/THREE-LICENSE.txt。

当前状态：完整入口使用原站 69 个组件与原始管线脚本，保留边框、NeuralCore 和管线流动。ECharts 等 iframe 脚本已本地化；原站不可用的两张管线小图用透明像素兼容。天气仍依赖外部服务，数据仍是静态演示。原始模型、配置、原站组件与关键操作已在本机核对；动画阶段、滚动位置、天气和时钟会随运行时刻变化，不能用不同时间的截图逐像素判断。教学页与完整对照页的用途不要混淆。
