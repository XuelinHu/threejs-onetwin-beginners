# Three.js 学习工坊

面向零基础学习者的独立互动教材。左侧为课程目录，右侧以运行预览为主；点击“查看代码”打开可编辑弹窗，讲解与练习按需展开。43 节课从画圆、方块、相机逐步进入五类综合练习。

当前局域网入口：[http://192.168.1.9:8770/](http://192.168.1.9:8770/)。已部署到服务器 `/home/xuelin/front/threejs-learning-lab`，本地开发副本位于 `D:\workspace\front\threejs-onetwin-beginners\threejs-learning-lab`。部署说明见 [DEPLOYMENT.md](DEPLOYMENT.md)。

## 启动

需要已安装 Node.js 18 或更新版本，不需要安装 npm 或 Python 包。

```powershell
cd 'D:\workspace\front\threejs-onetwin-beginners\threejs-learning-lab'
npm start
```

本机默认地址：http://127.0.0.1:8770/ 。服务监听 `0.0.0.0`；同一局域网设备使用这台电脑的实际 IP 和 8770 端口访问。更换端口可设置 `PORT` 环境变量。

项目也可整体复制到任意静态 HTTP 服务，不需要旧案例目录、数据库、账号或外部 CDN。不能直接双击 HTML 使用，因为 JavaScript 模块和模型需要通过 HTTP 加载。

## 学习方式

1. 从目录选择课程，点击“本课讲解”展开解释与目标，再次点击可收起。
2. 点击“查看代码”打开编辑弹窗，修改后点击“运行并查看效果”或按 Ctrl+Enter；运行成功后自动关闭弹窗，返回大幅预览。也可按 Esc 或点击关闭按钮收起代码。
3. 打开“动手练习”，先尝试，再逐步查看提示、参考思路和参考代码。
4. “标记本课已学”记录个人进度，由学习者自行判断是否掌握。
5. “下载练习”导出 ZIP，含当前编辑代码、完整依赖、素材与单独运行说明。

代码草稿、进度保存在当前浏览器的本地存储中，不跨设备同步。导出 ZIP 可以转移练习。AI 学习提示词会带上本课任务与当前代码，需自行复制到 Codex 使用；本站没有接入付费 API。

## 课程

- 28 节基础：必要的 JavaScript、场景、圆与方块、三维变换、相机、光照阴影、材质、图片与 Canvas 纹理、UV、动画、曲线路径、点击交互、glTF 加载、屏幕适配与实例化。
- 15 节综合：制药车间、工业产线、绿色展厅、设备运维、智慧能源，每类分 3 个递进阶段。

五类项目最后一课各带“独立挑战”：从只有相机、灯光和网格的空白场景开始，按任务搭建自己的项目。提示提供步骤，参考思路提供学生自检标准，需要时再载入完整参考项目。

综合课使用原创简化几何与模拟数据展示技术，不连接真实设备，不加载之前五个项目的代码或大型素材。漫游课使用键盘移动与房间边界约束，完整物理碰撞、工业模型制作和真实业务接入需要后续扩展。

## 目录

```text
index.html / styles.css / app.js  学习网站
preview.html / preview.js         独立的课程运行画面
courses/foundations.js            基础课程与答案
courses/projects.js               五类综合项目与答案
courses/helpers.js                教学源码生成器（不进入导出代码）
assets/                          原创小型纹理与设备模型
vendor/                          Three.js r180 独立副本
download.js                      浏览器打包练习，不依赖额外库
server.mjs                       静态 HTTP 服务
tools/                           素材生成与课程检查
```

## 验证与维护

```powershell
npm run check
```

此检查验证 43 节课程元数据、91 份示例/答案/挑战语法和素材路径；真实渲染与交互仍需浏览器验证。修改课程后刷新页面；已有草稿会优先恢复，点击“重置”可载入课程最新示例。

切换课程会销毁上一课的渲染器，释放几何、材质、纹理与动画，控制同时运行的 3D 画面数量。默认像素比限制为 2。

## 来源与许可

本站界面、讲解、教学代码、SVG 纹理与设备模型为本次独立编写。五类项目只作为能力目标，不使用原站的组件运行时。Three.js r180 及所附 controls/loaders/utils 保留原始文件与 [MIT 许可证](vendor/THREE-LICENSE.txt)。

学习参考：[Three.js 基础](https://threejs.org/manual/pages/fundamentals.html)、[纹理](https://threejs.org/manual/pages/textures.html)、[资源释放](https://threejs.org/manual/pages/cleanup.html)。
