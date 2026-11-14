# 工业控制

用工业产线解释多个模型的坐标关系、动画启动与停止、相机预设和运行指标的组合。



```powershell
cd 'D:\workspace\front\threejs-onetwin-beginners\02-industrial-control'
node server.mjs
```

- 完整案例：http://127.0.0.1:8742/
- 组件拆解：http://127.0.0.1:8742/replica.html
- 单项练习：http://127.0.0.1:8742/practice.html
- 基础练习：http://127.0.0.1:8742/lesson.html
- 飞书教程：https://my.feishu.cn/docx/RpqxdDtW8o5It8xM46Tc2hJAnng

原模板配置在 source/template.json；素材映射在 source/assets.json。运行不需要 npm install。

当前复现状态：完整入口使用原站组件、两个原始模型和原站巡检人物。启动、停止、急停均检查真实动画状态；旧配置中的 paly 字段兼容为新版运行库读取的 play，源模板保持原样。教学运行器的巡检仍为简化版本。

AI_PROMPT.md 是重建的复现提示词，不是作者原始提示词。
