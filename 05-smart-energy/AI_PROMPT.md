# 智慧能源：复现提示词

此提示词由公开模板配置与已验证页面行为整理，不是作者原始 AI 对话。需同时提供 source、assets 和 vendor。


```text
复现智慧能源大屏，画布 2048×1080，共 69 个组件，没有 Three/Container3D。按 source/template.json 原始坐标组合背景、8 个 borderBox7、20 个 Picture2、标题、Time、天气 iframe、2 个 ScrollTable、6 个 NumberFlop、CustomChart、PieY、NeuralCore 和 3 个 Chart。中央图使用原 CustomChart.script 的 ECharts graph/graphic/lines 和原线路，保留流动效果。数字显示 48、91、41.0、40.00%、10.00、26.00%。NeuralCore 主值 64%，外围为 87%、1250MB、92%、65%。脚本只使用模板样例数据；不得启用原代码中已被 return 和注释停用的旧 Ajax 地址。修复 iframe 初次零尺寸及背景发白的问题。

技术要求：读取本目录 source/template.json 和 source/assets.json；Three.js、GLTFLoader、DRACOLoader、ECharts 均从 vendor 本地加载，Draco 的 JS 与 WASM 版本匹配。用原生 HTML/CSS/JavaScript 和 Node 内置静态服务实现，不引入不必要的框架。尊重原始模型、数据、组件位置、字体和素材，不用通用几何体冒充原模型。必须显示加载/失败状态，限制像素倍率，处理窗口尺寸变化。逐个核对原版截图和交互后再报告一致性，未实现的行为要明确列出。

教学要求：先解释 scene、camera、renderer、Object3D、材质、动画和 DOM 图表分别负责什么；从 practice.html 的单项练习开始，每一步给出文件位置、修改代码、运行方式和预期结果，再解释完整 replica.mjs。涉及未实现的功能必须标注为扩展练习。
```

