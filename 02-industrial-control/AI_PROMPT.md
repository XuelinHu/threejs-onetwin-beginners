# 工业控制：复现提示词

此提示词由公开模板配置与已验证页面行为整理，不是作者原始 AI 对话。需同时提供 source、assets 和 vendor。


```text
复现工业控制大屏，画布 2048×1080，共 22 个组件。加载 source/template.json 中自动产线1和地板两个 GLB，保留每个模型的位置、旋转、缩放；地板位置 (3,1.5,-5)，缩放 (0.39,1,0.34)。相机约 (2.02,10.25,14.34)，目标 (2.22,0.79,-4.13)，fov 58。实现自动旋转、重置相机、启动、停止、急停及巡检入口，启动/停止对应“自动产线1_Animation”。按配置渲染青色围墙。侧边保留 StatusCapsule、DataCardGroup、Pie1、GaugeGlow、SlideLineChart、FaultCodePanel、SegmentStatRibbon。所有指标使用模板样例数据。

技术要求：读取本目录 source/template.json 和 source/assets.json；Three.js、GLTFLoader、DRACOLoader、ECharts 均从 vendor 本地加载，Draco 的 JS 与 WASM 版本匹配。用原生 HTML/CSS/JavaScript 和 Node 内置静态服务实现，不引入不必要的框架。尊重原始模型、数据、组件位置、字体和素材，不用通用几何体冒充原模型。必须显示加载/失败状态，限制像素倍率，处理窗口尺寸变化。逐个核对原版截图和交互后再报告一致性，未实现的行为要明确列出。

教学要求：先解释 scene、camera、renderer、Object3D、材质、动画和 DOM 图表分别负责什么；从 practice.html 的单项练习开始，每一步给出文件位置、修改代码、运行方式和预期结果，再解释完整 replica.mjs。涉及未实现的功能必须标注为扩展练习。
```

