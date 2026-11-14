# 智慧能源

看懂二维能源流向图、数字指标和趋势图的数据组合，避免把所有数字孪生页面都当作 Three.js 场景。



```powershell
cd 'D:\workspace\front\threejs-onetwin-beginners\05-smart-energy'
node server.mjs
```

- 完整案例：http://127.0.0.1:8745/
- 组件拆解：http://127.0.0.1:8745/replica.html
- 单项练习：http://127.0.0.1:8745/practice.html
- 基础练习：http://127.0.0.1:8745/lesson.html
- 飞书教程：https://my.feishu.cn/docx/QQOtdR8SZo9caVxYLDTcTNW1nOh

原模板配置在 source/template.json；素材映射在 source/assets.json。运行不需要 npm install。

当前复现状态：完整入口使用原站 69 个组件与原始管线脚本，保留边框、NeuralCore 和管线流动。ECharts 等 iframe 脚本已本地化；原站不可用的两张管线小图用透明像素兼容。天气仍依赖外部服务，数据仍是静态演示。

AI_PROMPT.md 是重建的复现提示词，不是作者原始提示词。
