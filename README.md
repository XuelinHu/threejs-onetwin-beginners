# Three.js + OneTwin 新手课程

这是 Three.js + OneTwin 新手课程仓库，包含五个综合案例，以及独立的 `threejs-learning-lab` 零基础学习网站。五个案例目录包含完整页面、单项练习、基础练习、说明和重建提示词；学习网站从画圆、方块和相机开始，逐步进入综合练习。



```powershell
cd 'D:\workspace\front\threejs-onetwin-beginners\'
node server.mjs
```

课程入口：http://127.0.0.1:8760/

| 案例 | 本地目录 | 端口 | 分篇教程 |
| --- | --- | --- | --- |
| 1 GMP 制药车间数字孪生平台 | `01-gmp-pharmaceutical` | 8741 | `01-gmp-pharmaceutical/README.md` |
| 2 工业控制 | `02-industrial-control` | 8742 | `02-industrial-control/README.md` |
| 3 绿色主题展厅 | `03-green-exhibition-hall` | 8743 | `03-green-exhibition-hall/README.md` |
| 4 设备运维系统 | `04-equipment-operations` | 8744 | `04-equipment-operations/README.md` |
| 5 智慧能源 | `05-smart-energy` | 8745 | `05-smart-energy/README.md` |

教程正文在 `blog/`；共享运行器与来源说明在 `runtime/` 和 `reference-runtime/`。

## 零基础学习网站

`threejs-learning-lab/` 是与五个案例解耦的学习入口。启动仓库根目录服务后访问 [http://127.0.0.1:8760/](http://127.0.0.1:8760/)，或单独进入该目录执行 `npm start` 使用 8770 端口。局域网部署入口为 [http://192.168.1.9:8770/](http://192.168.1.9:8770/)。

运行不需要安装 npm/Python 包。每个案例也能独立运行 node server.mjs。服务绑定 0.0.0.0，局域网访问使用本笔记本的实际 IP。

完整入口使用原站公开组件、原始配置与素材；可读教学实现另存于 practice.mjs、lesson.html 和 replica.mjs。来源、校验与适配见 reference-runtime/SOURCE.md。公开模板没有原始 AI 对话，AI_PROMPT.md 是依据模板重新整理的提示词。

维护公共运行器时编辑 `runtime/`，再运行 `node tools/build-replicas.mjs`；该命令会覆盖各目录生成的运行文件。更新教程运行 `node tools/write-guides.mjs`。
