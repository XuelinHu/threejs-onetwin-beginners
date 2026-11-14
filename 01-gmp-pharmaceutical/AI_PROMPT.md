# GMP 制药车间数字孪生平台：复现提示词

此提示词由公开模板配置与已验证页面行为整理，不是作者原始 AI 对话。需同时提供 source、assets 和 vendor。


```text
复现 GMP 制药车间数字孪生平台。画布 4240×2160，共 30 个组件；中央使用 source/template.json 的药品制造 GLB，位置 (-2,2,0)，相机 (0,14,-19)，目标原点，fov 50。保留 5 个区域标签、自动旋转、重置相机、自动化设备视角和模型 Animation。按配置对 18 组外墙叠加半透明扫描材质。周边包含 StatComparisonCard、2 个 BatteryMetric、ThermoAlertGroup、Charts3DMultiPillar、DataConveyor、RingProgressGroup、FaultCodePanel、SlideLineChart、Bar1 和 StatusCapsule。产能主值 128450，对比值 114200；全部数据取模板，不能杜撰实时接口或额外天气按钮。

技术要求：读取本目录 source/template.json 和 source/assets.json；Three.js、GLTFLoader、DRACOLoader、ECharts 均从 vendor 本地加载，Draco 的 JS 与 WASM 版本匹配。用原生 HTML/CSS/JavaScript 和 Node 内置静态服务实现，不引入不必要的框架。尊重原始模型、数据、组件位置、字体和素材，不用通用几何体冒充原模型。必须显示加载/失败状态，限制像素倍率，处理窗口尺寸变化。逐个核对原版截图和交互后再报告一致性，未实现的行为要明确列出。

教学要求：先解释 scene、camera、renderer、Object3D、材质、动画和 DOM 图表分别负责什么；从 practice.html 的单项练习开始，每一步给出文件位置、修改代码、运行方式和预期结果，再解释完整 replica.mjs。涉及未实现的功能必须标注为扩展练习。
```

