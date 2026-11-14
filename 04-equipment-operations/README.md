# 设备运维系统

理解运维大屏如何由二维图表、滚动表格和一个小型三维设备窗口构成。



```powershell
cd 'D:\workspace\front\threejs-onetwin-beginners\04-equipment-operations'
node server.mjs
```

- 完整案例：http://127.0.0.1:8744/
- 组件拆解：http://127.0.0.1:8744/replica.html
- 单项练习：http://127.0.0.1:8744/practice.html
- 基础练习：http://127.0.0.1:8744/lesson.html
- 飞书教程：https://my.feishu.cn/docx/HZATdXne0orXzaxg0rScQgMHncd

原模板配置在 source/template.json；素材映射在 source/assets.json。运行不需要 npm install。

当前复现状态：完整入口采用原站 Container3D 与原始 glTF，保留其自动取景、材质、灯光、旋转和 RadarTagWall 装饰。practice.html 单独演示包围盒取景，光照经过教学简化；演示指标未接入真实运维系统。

AI_PROMPT.md 是重建的复现提示词，不是作者原始提示词。
