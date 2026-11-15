# Three.js + OneTwin 新手学习与运行指南

这份文档给第一次接触 Three.js 的同学使用。项目把五个综合案例、零基础学习工坊、拖拽搭建实验和本地音效放在同一个仓库里，由一个 Node.js 服务统一提供。

已经能访问课程的同学，可以直接进入[第 1 课](../threejs-learning-lab/#first-scene)，或者先看[完整学习路线](../blog/00-学习路线总览.html)。

## 1. 获取项目

任选一个代码托管地址即可。两个地址内容保持同步：

- GitHub：<https://github.com/XuelinHu/threejs-onetwin-beginners>
- Gitee：<https://gitee.com/XuelinHu/threejs-onetwin-beginners>

推荐国内网络环境使用 Gitee：

```powershell
git clone https://gitee.com/XuelinHu/threejs-onetwin-beginners.git
cd threejs-onetwin-beginners
```

也可以使用 GitHub：

```powershell
git clone https://github.com/XuelinHu/threejs-onetwin-beginners.git
cd threejs-onetwin-beginners
```

绿色展厅包含较大的 GLB 文件。若使用 GitHub 版本并看到模型文件是指针文件，先安装 Git LFS，然后执行：

```powershell
git lfs install
git lfs pull
```

## 2. 本地启动

先确认 Node.js 版本：

```powershell
node --version
```

Node.js 18 或更新版本即可。这个项目使用原生 Node.js 静态服务，不需要安装 npm 包：

```powershell
node server.mjs
```

浏览器打开：

```text
http://127.0.0.1:8760/
```

局域网中的其他电脑打开本机 IP 加端口即可。例如部署电脑是 `192.168.1.9`：

```text
http://192.168.1.9:8760/
```

服务绑定 `0.0.0.0`，因此同一局域网可以直接访问。若打不开，检查 Windows 防火墙是否允许 Node.js 访问 8760 端口，并确认服务窗口仍在运行。

## 3. 推荐学习顺序

1. 进入[零基础第 1 课](../threejs-learning-lab/#first-scene)，先学习场景、相机、几何体、材质、灯光和动画。
2. 打开[拖拽组件搭建练习](../threejs-learning-lab/drag-lab/)，拖入方块、圆柱、文字和灯光，修改右侧关键 API 参数。
3. 按[学习路线](../blog/00-学习路线总览.html#section-5)进入五个综合案例。每个案例都提供完整案例、单项练习和基础练习。
4. 最后再阅读每个案例的 `AI_PROMPT.md`，尝试只根据提示词重新实现一个独立小项目。

建议每学完一个知识点就做一次小修改，例如把立方体颜色改成红色、把相机距离改为 `8`、把旋转速度改成 `0.01`，然后刷新页面观察变化。

## 4. 三个页面区域怎么用

学习工坊使用一个网页完成三个区域的学习：

- 左侧：课程目录，按基础知识到综合练习排列。
- 中间：实时 Three.js 预览，修改参数后可以马上观察结果。
- 右侧：关键 API、参数含义和常见原理。完整代码通过按钮弹窗查看，不会挤占预览空间。

综合案例的“完整案例”保留原始组件对照；“单项练习”是更容易读懂的 Three.js 版本；“基础练习”使用简化场景帮助初学者理解相机、灯光、模型和图表。

## 5. 音效功能

页面右下角的“音效”面板可以：

- 点击“启用音效”，再点“试听音效”确认当前页面可以发声。
- 拖动音量滑块调整音量。
- 点击“静音/取消静音”按钮切换静音。
- 在 GMP 制药车间和工业产线中，跟随设备动画的运行状态播放运行声。
- 选择工业控制中的“启动、停止、急停”等按钮时播放对应提示音。
- 进入绿色展厅的漫游模式后按 `W/A/S/D` 移动时播放脚步声，松开按键自动停止。
- 其他按钮、相机预设、模型选中和图表控制会播放轻量点击音。

浏览器必须先收到一次用户点击或键盘操作，才能允许网页发声。音量和静音状态会保存到浏览器本地存储。统一入口的所有页面共用 `8760` 这个来源；如果单独在某个案例目录启动服务，该案例会保存自己的音量设置。

音效已经下载到项目本地，不依赖运行时外网：

- `runtime/assets/audio/clicker-sound.ogg`：按钮点击，CC0 1.0。
- `runtime/assets/audio/short-beep.ogg`：设备启动/停止提示，CC0 1.0。
- `runtime/assets/audio/footsteps.ogg`：脚步，CC BY-SA 4.0。

来源和许可见 [`runtime/assets/audio/ATTRIBUTION.md`](../runtime/assets/audio/ATTRIBUTION.md)。五个案例目录也各自保留了一份音效文件和归属说明，便于单独运行。音频文件加载失败时，`runtime/audio.mjs` 会退回 Web Audio API 生成短音效，页面仍然可以学习和操作。

修改共享音效模块或替换音频文件后，在仓库根目录同步到五个案例：

```powershell
node tools/sync-audio.mjs
```

## 6. 学生的第一个修改任务

以工业控制为例：

1. 打开 `02-industrial-control/replica.html`。
2. 在页面中点击“启动”和“停止”，观察模型动画和音效变化。
3. 打开 `02-industrial-control/replica.mjs`，找到 `applyAction` 和按钮生成部分。
4. 找到 `runtime/audio.mjs` 中的 `classify` 和 `FILES`，给一个新按钮增加自己的音效分类。
5. 重新刷新页面，检查按钮文字、动画状态和音效是否一致。

以绿色展厅为例：

1. 打开 `03-green-exhibition-hall/replica.html`，点击“游览”。
2. 点击画布让它获得焦点，再按 `W/A/S/D` 漫游。
3. 阅读 `runtime/audio.mjs` 中人物位置与移动状态的判断，观察人物停止或碰到边界时声音如何停止。
4. 将脚步文件替换为自己的合法音效，并同步更新 `ATTRIBUTION.md`。

## 7. 继续做五个独立项目

每个案例目录都可以作为独立学习单元，先打开教程，再进入练习：

| 教程 | 完整案例 | 单项练习 |
| --- | --- | --- |
| [GMP 制药车间教程](../blog/01-gmp-pharmaceutical.html) | [打开制药车间](../01-gmp-pharmaceutical/) | [模型、相机与动画](../01-gmp-pharmaceutical/practice.html) |
| [工业控制教程](../blog/02-industrial-control.html) | [打开工业控制](../02-industrial-control/) | [产线模型](../02-industrial-control/practice.html) |
| [绿色展厅教程](../blog/03-green-exhibition-hall.html) | [打开绿色展厅](../03-green-exhibition-hall/) | [模型与环境](../03-green-exhibition-hall/practice.html) |
| [设备运维教程](../blog/04-equipment-operations.html) | [打开设备运维](../04-equipment-operations/) | [单模型取景](../04-equipment-operations/practice.html) |
| [智慧能源教程](../blog/05-smart-energy.html) | [打开智慧能源](../05-smart-energy/) | [趋势图数据绑定](../05-smart-energy/practice.html) |

每个目录都包含 `index.html`、`reference.html`、`replica.html`、`practice.html`、`lesson.html` 和对应的 JavaScript。修改共享运行器时编辑 `runtime/`，再运行：

```powershell
node tools/build-replicas.mjs
```

修改学习工坊时进入 `threejs-learning-lab/`，按照该目录的 README 操作。拖拽实验检查命令为：

```powershell
cd threejs-learning-lab
npm run check:drag
```

## 8. 常见问题

**页面显示空白或模型一直加载**：先等待大型 GLB 下载完成，再打开浏览器开发者工具查看 Network；确认是通过 `http://` 访问，而不是直接双击 HTML 文件。

**点击后没有声音**：先点右下角“启用音效”，再点“试听音效”。检查是否静音、音量是否为 0，并确认浏览器标签页没有被静音。

**局域网访问不了**：确认服务器终端没有退出，访问地址包含 `:8760`，并在部署电脑上放行 Node.js 的专用网络访问。

**修改后看不到变化**：使用 `Ctrl+F5` 强制刷新。服务器对 HTML、JavaScript 和 CSS 使用了禁止缓存设置。

**想换音效**：替换对应的 `.ogg` 文件即可，但要保留合法许可来源，并在 `ATTRIBUTION.md` 中写明作者、原始地址和许可证。

