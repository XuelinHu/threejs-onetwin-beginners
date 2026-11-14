# 设备运维系统：复现提示词

此提示词由公开模板配置与已验证页面行为整理，不是作者原始 AI 对话。需同时提供 source、assets 和 vendor。


```text
复现设备运维系统，画布 2048×1080，共 18 个组件。使用原背景、4 个 Picture、borderBox6、Decoration10、Time、标题和 3 个 VText；左侧有 Chart、ScrollTable、RadarTagWall；中部有 Radar；右侧 Container3D 使用 16719757054819227.gltf；底部有 ChartsMountain。单模型保留半球光和方向光、缓慢 y 轴旋转、鼠标拖动缩放。表格应显示索引和表头，支持轮播与悬停暂停。不要虚构真实工单或设备接口，不把教学练习的拾取功能说成原模板功能。

技术要求：读取本目录 source/template.json 和 source/assets.json；Three.js、GLTFLoader、DRACOLoader、ECharts 均从 vendor 本地加载，Draco 的 JS 与 WASM 版本匹配。用原生 HTML/CSS/JavaScript 和 Node 内置静态服务实现，不引入不必要的框架。尊重原始模型、数据、组件位置、字体和素材，不用通用几何体冒充原模型。必须显示加载/失败状态，限制像素倍率，处理窗口尺寸变化。逐个核对原版截图和交互后再报告一致性，未实现的行为要明确列出。

教学要求：先解释 scene、camera、renderer、Object3D、材质、动画和 DOM 图表分别负责什么；从 practice.html 的单项练习开始，每一步给出文件位置、修改代码、运行方式和预期结果，再解释完整 replica.mjs。涉及未实现的功能必须标注为扩展练习。
```

