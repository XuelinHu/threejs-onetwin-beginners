# 绿色主题展厅：复现提示词

此提示词由公开模板配置与已验证页面行为整理，不是作者原始 AI 对话。需同时提供 source、assets 和 vendor。


```text
复现绿色主题展厅。原模板画布 2048×1080，只有一个 Three 组件。直接使用 source/template.json 指向的绿色主题展厅 GLB 和本地日落 HDR，保留模型的节点与材质，整体 scale 为 1.5；相机 (-80,60,48)，目标原点，fov 50。按源配置设置灯光、天空盒、辅助轴和 OrbitControls。底部“游览”要实现原配置人物“阿力”、重力、碰撞和视角切换；不得把简单相机位移声称为完整巡游。模型已使用 Blender 减面与 Draco 压缩到约 55.7 MiB，必须显示加载进度和失败原因。不要添加原模板不存在的数据大屏和四种天气按钮。

技术要求：读取本目录 source/template.json 和 source/assets.json；Three.js、GLTFLoader、DRACOLoader、ECharts 均从 vendor 本地加载，Draco 的 JS 与 WASM 版本匹配。用原生 HTML/CSS/JavaScript 和 Node 内置静态服务实现，不引入不必要的框架。尊重原始模型、数据、组件位置、字体和素材，不用通用几何体冒充原模型。必须显示加载/失败状态，限制像素倍率，处理窗口尺寸变化。逐个核对原版截图和交互后再报告一致性，未实现的行为要明确列出。

教学要求：先解释 scene、camera、renderer、Object3D、材质、动画和 DOM 图表分别负责什么；从 practice.html 的单项练习开始，每一步给出文件位置、修改代码、运行方式和预期结果，再解释完整 replica.mjs。涉及未实现的功能必须标注为扩展练习。
```

