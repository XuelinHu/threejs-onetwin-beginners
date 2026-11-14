# 绿色主题展厅

从一个大体量 GLB 展厅学习模型加载、环境贴图、缩放与相机，以及漫游和碰撞之间的区别。



```powershell
cd 'D:\workspace\front\threejs-onetwin-beginners\03-green-exhibition-hall'
node server.mjs
```

- 完整案例：http://127.0.0.1:8743/
- 组件拆解：http://127.0.0.1:8743/replica.html
- 单项练习：http://127.0.0.1:8743/practice.html
- 基础练习：http://127.0.0.1:8743/lesson.html
- 飞书教程：https://my.feishu.cn/docx/Xn5mdabUUoCKXoxEW5Bcwb81nxb

原模板配置在 source/template.json；素材映射在 source/assets.json。运行不需要 npm install。

当前复现状态：完整入口使用原站展厅、HDR、人物与游览组件。实测人物按 W 移动，重力和碰撞开启，场景登记 1,485 个碰撞对象；模型首次加载和构建碰撞体较重。practice.html 与 replica.html 的相机观察和漫游是教学简化版本。

AI_PROMPT.md 是重建的复现提示词，不是作者原始提示词。
