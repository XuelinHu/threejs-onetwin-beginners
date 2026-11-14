# GMP 制药车间数字孪生平台

在一个完整车间模型外叠加产能、温度、进度和故障信息，理解三维场景与二维大屏怎样组合。



```powershell
cd 'D:\workspace\front\threejs-onetwin-beginners\01-gmp-pharmaceutical'
node server.mjs
```

- 完整案例：http://127.0.0.1:8741/
- 组件拆解：http://127.0.0.1:8741/replica.html
- 单项练习：http://127.0.0.1:8741/practice.html
- 基础练习：http://127.0.0.1:8741/lesson.html
- 飞书教程：https://my.feishu.cn/docx/IVaOdufgtoH1zmxgxzGcOLr5nVd

原模板配置在 source/template.json；素材映射在 source/assets.json。运行不需要 npm install。

当前复现状态：完整入口使用原站组件、原始 GLB、原视角和扫描材质；本地模型与扫描层已通过运行检查。practice.html 和 replica.html 是另写的教学实现，外观经过简化。时钟、滚动数据和扫描动画随时间变化。

AI_PROMPT.md 是重建的复现提示词，不是作者原始提示词。
