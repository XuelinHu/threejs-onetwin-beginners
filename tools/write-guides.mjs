import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cases } from './cases.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const fence = (language, code) => `\n\n\`\`\`${language}\n${code.trim()}\n\`\`\`\n\n`;
const localPath = folder => `D:\\workspace\\front\\threejs-onetwin-beginners\\${folder}`;
const overviewDoc = 'Sqvzda7k4o5DWdxZLIUcDoefnDh';
const documents = [];
await mkdir(join(root, 'blog'), { recursive: true });

for (const [index, item] of cases.entries()) {
  const base = join(root, item.folder);
  const source = JSON.parse(await readFile(join(base, 'source/template.json'), 'utf8'));
  const assets = JSON.parse(await readFile(join(base, 'source/assets.json'), 'utf8'));
  const typeCounts = {};
  for (const component of source.canvasData) typeCounts[component.component] = (typeCounts[component.component] || 0) + 1;
  const modelFiles = Object.entries(assets.entries).filter(([url]) => /\.(glb|gltf)$/i.test(new URL(url).pathname));
  const modelRows = modelFiles.length ? modelFiles.map(([url, asset]) => `| ${decodeURIComponent(new URL(url).pathname.split('/').pop())} | ${(asset.bytes / 1e6).toFixed(2)} MB | \`${asset.file}\` |`).join('\n') : '| 无三维模型 | — | 中央图由 ECharts 绘制 |';
  const title = `${String(index + 1).padStart(2, '0')} ${item.name}：从模板到 Three.js`;
  const original = `https://onetwin.cn/#/preview?kanbanId=${source.templateId}&mode=template`;
  const prompt = `${item.prompt}\n\n技术要求：读取本目录 source/template.json 和 source/assets.json；Three.js、GLTFLoader、DRACOLoader、ECharts 均从 vendor 本地加载，Draco 的 JS 与 WASM 版本匹配。用原生 HTML/CSS/JavaScript 和 Node 内置静态服务实现，不引入不必要的框架。尊重原始模型、数据、组件位置、字体和素材，不用通用几何体冒充原模型。必须显示加载/失败状态，限制像素倍率，处理窗口尺寸变化。逐个核对原版截图和交互后再报告一致性，未实现的行为要明确列出。\n\n教学要求：先解释 scene、camera、renderer、Object3D、材质、动画和 DOM 图表分别负责什么；从 practice.html 的单项练习开始，每一步给出文件位置、修改代码、运行方式和预期结果，再解释完整 replica.mjs。涉及未实现的功能必须标注为扩展练习。`;
  const code = await readFile(join(base, 'practice.mjs'), 'utf8');
  const html = await readFile(join(base, 'practice.html'), 'utf8');
  const modelExplanation = modelFiles.length ? '下面列的是已保存到本地的原始模型。MB 按 1,000,000 字节计算，尺寸是文件体积，不是显存用量。' : '这个模板没有 Three 或 Container3D。学习它的价值是看懂数据大屏和能源流向图的组成；不应为套用 Three.js 而把二维管线误写成三维场景。';
  const steps = item.use.map((text, i) => `${i + 1}. ${text}`).join('\n');
  const theory = item.concepts.map((text, i) => `**观察 ${i + 1}。** ${text}`).join('\n\n');
  const exercises = item.exercise.map((text, i) => `${i + 1}. ${text}`).join('\n');
  const markdown = `# ${title}

本篇带你用“${item.name}”完成一次从运行、观察到改代码的学习。${item.purpose}

本文依据已保存的 OneTwin 公开模板配置和本地可运行代码编写。完整入口直接使用原站公开组件与原始素材，可读练习另行编写；两者的来源与用途分别说明。首次学习建议先读[学习路线](https://my.feishu.cn/docx/${overviewDoc})。

## 1. 先运行，再观察

这台笔记本的项目目录是 ${fence('text', localPath(item.folder))}在 PowerShell 中运行：${fence('powershell', `cd '${localPath(item.folder)}'\nnode server.mjs`)}看到服务地址后，打开[完整案例](http://127.0.0.1:${item.port}/)。如果该地址已经能打开，说明服务正在运行，不要重复启动。地址栏里不能使用 file:// 直接打开 HTML，模块与素材需要通过 HTTP 加载。

${steps}

同一局域网的其他设备可以使用“这台笔记本的实际局域网 IP:${item.port}”。这是笔记本上的项目，与 192.168.1.9 的 Saltline 服务是不同的服务。网页三维画面由访问端浏览器绘制。

## 2. 对照模板，认识文件

原模板的画布为 ${source.canvasStyle.width}×${source.canvasStyle.height}，共 ${source.canvasData.length} 个组件。组件清单为：${Object.entries(typeCounts).map(([name, count]) => `\`${name}\` × ${count}`).join('，')}。

| 文件或目录 | 你在这里学什么 |
| --- | --- |
| index.html、reference.mjs、reference-runtime/ | 完整入口、本地配置适配与原站公开组件 |
| source/template.json | 原模板的组件、坐标、模型配置和样例数据 |
| source/assets.json | 原始素材 URL 与本地文件的对应关系 |
| assets/ | 模型、图片、HDR 和字体 |
| vendor/、replica.html、replica.mjs | 练习依赖与另写的简化运行器；原站组件另存于 reference-runtime/ |
| practice.html、practice.mjs | 本文逐步解释的单项练习 |
| lesson.html | 早期基础几何体练习，与原版完整页面分开 |
| AI_PROMPT.md | 根据真实模板整理的复现提示词 |
| server.mjs | 只负责提供本地文件的服务 |

${modelExplanation}

| 模型文件 | 文件体积 | 本地位置 |
| --- | --- | --- |
${modelRows}

先打开 source/template.json，搜索组件名，再找到 propValue。style 决定组件位于画布哪里，propValue 决定组件显示什么。改业务数字一般改 data；改面板位置一般改 style；两者不要混在一起。

## 3. 跑通一个完整的单项示例

打开[单项练习](http://127.0.0.1:${item.port}/practice.html)。${index === 4 ? '它只保留一张真实配置的趋势图，让你先理解数据如何进入图表。' : '它只保留模型、相机、灯光、动画和鼠标控制，去掉完整大屏的干扰；光照经过教学简化，因此不是完整页面的截图复刻。'}

practice.html 的完整内容如下，可用它理解页面如何引入本地模块：${fence('html', html)}页面底部加载 practice.mjs。以下是该文件的完整可运行内容；保留同目录的 source、assets、vendor 即可运行，无需安装 npm 包：${fence('javascript', code)}
按执行顺序读代码：先取得模板和本地素材映射，再建立${index === 4 ? '图表并绑定横轴和系列' : '场景、相机和渲染器，再把模型加入场景'}，最后处理尺寸变化与错误。${index === 4 ? 'chart.setOption 接收图表选项；修改普通数组后，需要再调用它更新画面。' : 'renderer.render 是绘制，AnimationMixer.update 是推进模型动画，两者的职责不同。'}

## 4. 拆解这个案例的关键点

${theory}

完整入口的 reference.mjs 先把模板中的网址映射为本地素材，再将原始配置交给原站 PreviewCanvas 和组件运行库。reference-runtime/SOURCE.md 记录来源和本地适配，压缩组件代码不是本教程原创。另写的 replica.mjs 供拆解练习：boot 读取模板，renderThree 管模型与相机，renderData 管二维组件，asset 管素材映射。先读 practice.mjs，再选择一类组件读 replica.mjs，不必从压缩运行库开始。

## 5. 按顺序动手修改

先复制要改的文本文件作为练习备份，保留原始模型。每次只改一项，保存后刷新；预期现象出现后再做下一步。

${exercises}

如果使用项目级工具重新生成页面，注意：tools/build-replicas.mjs 会把 runtime 中的公共文件复制到五个目录，覆盖各目录生成的 replica 和 practice 文件。自己的持续修改应保存到 runtime 或另存练习文件；不要在做完练习后无意覆盖它。

## 6. 给 AI 的可复用提示词

公开模板 API 提供了组件配置、素材和样例数据，没有提供作者最初的 AI 对话或原始提示词。下面是依据这些真实输入重新整理的“复现提示词”，不能当成作者原始提示词。它用于从零编写教学实现；完整对照入口直接复用原站组件，并不是“仅靠提示词生成一模一样”的实验结果。要复现几何与材质，AI 还需要本目录的原始模型和配置，单靠一段文字不能恢复同一份网格文件。
${fence('text', prompt)}
让 AI 先输出它识别到的模型、组件数量、数据来源和未实现项，再写代码。检查它是否把本篇指出的静态演示数据说成实时数据，或添加原模板没有的按钮。代码生成后要实际运行、操作和对照截图。

## 7. 排错与自查

| 现象 | 先查哪里 | 处理方法 |
| --- | --- | --- |
| 端口被占用 | 原服务是否已经启动 | 先访问本端口；已运行时复用服务 |
| 页面能开但模型不出现 | 浏览器网络中的 GLB/glTF 和 Draco 请求 | 检查 source/assets.json 指向的本地文件，避免 file:// |
| 只有黑色背景 | 加载失败提示、相机目标、灯光、材质 | 先运行 practice.html 区分模型问题和面板问题 |
| 模块找不到 | importmap、vendor/addons 路径 | 不要只复制 HTML，保留完整目录 |
| 页面明显卡顿 | 访问端显卡、分辨率和模型体积 | 少开大型场景标签，降低像素倍率，先用单项练习定位 |
| 指标不变化 | 模板是否仅为静态样例 | 本项目不会自动连接真实生产或能源系统 |

学习完成后，你应能独立启动该目录，指出一个模型或图表的数据位置，完成本篇一次修改并解释变化原因。完整入口可用 window.__reference.diagnostics 检查组件错误；前三个场景还可查看 window.__referenceGlobals[0] 的模型、相机和动作。replica.html 使用 window.__replica，practice.html 使用 window.practice；这些对象不能代替画面和交互验收。

## 8. 来源与当前复现状态

模板来源：[OneTwin 原版 ${item.name}](${original})，模板编号 \`${source.templateId}\`。配置取自公开的 visual-template/get 接口，保留在 source/template.json；模型与图片使用该配置引用的素材。完整入口复用原站公开组件，来源、文件校验和本地适配记录在 reference-runtime/SOURCE.md 与 sources.json；practice.mjs、lesson.html 和 replica.mjs 是另写的教学代码。Three.js 许可文本保留在 vendor/THREE-LICENSE.txt。

当前状态：${item.limitations}原始模型、配置、原站组件与关键操作已在本机核对；动画阶段、滚动位置、天气和时钟会随运行时刻变化，不能用不同时间的截图逐像素判断。教学页与完整对照页的用途不要混淆。
`;
  await writeFile(join(root, 'blog', `${item.folder}.md`), markdown);
  await writeFile(join(base, 'AI_PROMPT.md'), `# ${item.name}：复现提示词\n\n此提示词由公开模板配置与已验证页面行为整理，不是作者原始 AI 对话。需同时提供 source、assets 和 vendor。\n${fence('text', prompt)}`);
  await writeFile(join(base, 'README.md'), `# ${item.name}\n\n${item.purpose}\n\n${fence('powershell', `cd '${localPath(item.folder)}'\nnode server.mjs`)}- 完整案例：http://127.0.0.1:${item.port}/\n- 组件拆解：http://127.0.0.1:${item.port}/replica.html\n- 单项练习：http://127.0.0.1:${item.port}/practice.html\n- 基础练习：http://127.0.0.1:${item.port}/lesson.html\n- 飞书教程：https://my.feishu.cn/docx/${item.doc}\n\n原模板配置在 source/template.json；素材映射在 source/assets.json。运行不需要 npm install。\n\n当前复现状态：${item.limitations}\n\nAI_PROMPT.md 是重建的复现提示词，不是作者原始提示词。\n`);
  documents.push({ file: `blog/${item.folder}.md`, documentId: item.doc, title, templateId: source.templateId });
}

const table = cases.map((item, i) => `| ${i+1} ${item.name} | \`${item.folder}\` | ${item.port} | [教程](https://my.feishu.cn/docx/${item.doc}) |`).join('\n');
const overview = `# Three.js 数字孪生新手学习路线

这套课程把 OneTwin 的五个公开案例分别保存到当前笔记本，每个目录可独立运行。学习目标是能打开案例、找到真实模型和数据、理解关键代码，并完成一个可以观察到结果的小改动。完整复现页面、单项练习和基础几何体练习分别保留，不把练习中新增的功能说成原模板功能。

## 1. 先确认五个案例分别做什么

| 案例 | 本地目录 | 端口 | 分篇教程 |
| --- | --- | --- | --- |
${table}

GMP 和工业控制是三维场景叠加指标面板；绿色主题展厅主要是一个大型 GLB 场景；设备运维是二维大屏加单模型窗口；智慧能源的管线是 ECharts 二维图形，原模板没有 Three 场景。这个区别决定了你应从哪里读代码。

## 2. 启动课程入口
${fence('powershell', `cd '${localPath('')}'\nnode server.mjs`)}打开[本机课程入口](http://127.0.0.1:8760/)，选择一个案例。入口服务可以直接提供五个子目录的静态文件；单独运行案例的 server.mjs 则使用上表的独立端口。如果页面已经能打开，复用现有服务即可。

课程不需要安装 Python 包或运行 npm install。本地已保存 Three.js、加载器、Draco 解码器、ECharts、模型、图像和字体。智慧能源右上天气仍来自外部服务；不能把整个项目称为完全离线。

同一局域网的其他电脑可把地址中的 127.0.0.1 换成这台笔记本的实际 IP。服务器发送文件，访问端浏览器负责运行 JavaScript 和绘制三维画面；把代码放到 192.168.1.9 不会自动让网页使用服务器的 5090。

## 3. 推荐的动手顺序

1. 先看设备运维的 practice.html，认识单模型、相机、灯光和鼠标控制。它的模型约 2.20MB，比较适合第一次练习。
2. 学 GMP，观察 GLB 内的多个节点、区域标签、相机按钮、动画，以及 DOM 面板如何叠在三维场景上。
3. 学工业控制，比较两个模型的坐标，实际操作启动、停止与急停，理解 AnimationMixer 和 AnimationAction。
4. 学绿色展厅，观察 HDR 环境和大型模型的加载成本，再理解漫游、重力、碰撞分别需要什么。
5. 学智慧能源，区分数据大屏与三维场景，练习 NumberFlop、ECharts 数据绑定、iframe 尺寸和管线动画。

每篇都有完整运行命令、原模板事实、完整可运行的 practice 示例、该案例的关键原理、练习、AI 提示词和排错方法。读完一节就改一个值并刷新验证，不必先读懂所有源码。

## 4. 读代码前认识这些词

| 名称 | 负责什么 | 新手常见误解 |
| --- | --- | --- |
| HTML / CSS / JavaScript | 页面结构 / 外观 / 行为 | 只有一个 HTML 不等于没有依赖 |
| Scene | 保存三维对象与灯光 | 加入场景不保证相机能看到 |
| Object3D / Group / Mesh | 对象层级 / 分组 / 几何加材质 | 一个 GLB 可能包含很多 Mesh |
| Camera | 决定从哪里看、看向哪里 | 相机位置和观察目标不能混为一谈 |
| Renderer | 把场景绘制到 canvas | 它不会自动推进动画或碰撞 |
| Material / Texture / Light | 表面规则 / 图像信息 / 光照 | 灯光、色彩空间和环境会一起影响材质 |
| GLTFLoader / DRACOLoader | 读取 glTF / 解码压缩网格 | GLB 体积不等于显存用量 |
| AnimationMixer / AnimationAction | 推进动画时间 / 控制一个动画 | 点“启动”必须真的启动动作 |
| OrbitControls | 拖动、缩放、平移视角 | 它不会自动提供人物重力和碰撞 |
| DOM / ECharts | 二维文字、表格与图表 | 外观像管道不代表它是三维模型 |

## 5. 关于 AI 提示词的来源

公开模板包含组件配置和素材，没有作者原始 AI 对话。因此每篇与 AI_PROMPT.md 提供的都是依据真实模板重新整理的复现提示词，不能称为提取出的原始提示词。

让 AI 复现时，应一起提供 source/template.json、source/assets.json 和对应模型。文字提示能说明任务，原模型与配置才能约束几何、材质、组件位置和数据。要求 AI 在交付前说明验证了什么、还有什么未完成，不把截图相似或加载成功直接当成一模一样。

## 6. 当前交付与来源说明

旧的飞书课程文件夹已在本任务前序操作中删除。这六篇文档已放在用户指定知识库的 Three JS 节点下，不再使用旧文件夹地址。

五个本地目录的完整入口已采用原站公开组件和原始模型、素材与配置，保留原版布局、视角、扫描效果、图表与游览。实测五页组件数为 30、22、1、18、69；工业动画启停与急停正常，展厅人物移动、重力与碰撞正常。原站组件来源与本地适配保存在 reference-runtime/SOURCE.md，压缩组件代码不是教程作者原创。practice.html、lesson.html 与 replica.html 保留为另写的学习实现，外观和交互经过简化。天气、时钟、滚动位置和动画阶段随时间变化；本地对照结果不等于“只靠 AI 提示词生成相同项目”的证明。

## 7. 排错时按这个顺序

先确认地址和服务，再看页面加载提示与浏览器控制台，然后检查模型/纹理请求，再检查相机、灯光和组件数据。只有网络传输慢时才优先查网络；文件已传完但画面卡住时，应查访问端的关卡解码、图形编译、显卡和绘制负载。

绿色展厅模型约 244MB，第一次加载与解码都更重。先只打开一个场景，避免同时运行多个大型标签。不要在没有看到加载进度和错误信息的情况下反复刷新。
`;
await writeFile(join(root, 'blog/00-学习路线总览.md'), overview);
documents.unshift({ file: 'blog/00-学习路线总览.md', documentId: overviewDoc, title: 'Three.js 数字孪生新手学习路线' });
await mkdir(join(root, 'publication'), { recursive: true });
await writeFile(join(root, 'publication/documents.json'), JSON.stringify(documents, null, 2) + '\n');

await writeFile(join(root, 'README.md'), `# Three.js + OneTwin 新手课程\n\n五个独立案例的原始模板、模型与素材已保存到本机。每个目录包含完整页面、单项练习、基础练习、说明和重建提示词。\n\n${fence('powershell', `cd '${localPath('')}'\nnode server.mjs`)}课程入口：http://127.0.0.1:8760/\n\n| 案例 | 本地目录 | 端口 | 分篇教程 |\n| --- | --- | --- | --- |\n${table}\n\n教程正文在 blog/；飞书学习路线：https://my.feishu.cn/docx/${overviewDoc}\n\n运行不需要安装 npm/Python 包。每个案例也能独立运行 node server.mjs。服务绑定 0.0.0.0，局域网访问使用本笔记本的实际 IP。\n\n完整入口使用原站公开组件、原始配置与素材；可读教学实现另存于 practice.mjs、lesson.html 和 replica.mjs。来源、校验与适配见 reference-runtime/SOURCE.md。公开模板没有原始 AI 对话，AI_PROMPT.md 是依据模板重新整理的提示词。\n\n维护公共运行器时编辑 runtime/，再运行 node tools/build-replicas.mjs；该命令会覆盖各目录生成的运行文件。更新教程运行 node tools/write-guides.mjs，不会自动发布到飞书。\n`);
const cards = cases.map((item,i) => `<article class="card"><h2>${String(i+1).padStart(2,'0')} ${item.name}</h2><p>${item.purpose}</p><div class="links"><a href="${item.folder}/">完整案例</a><a href="${item.folder}/practice.html">单项练习</a><a href="${item.folder}/lesson.html">基础练习</a><a href="https://my.feishu.cn/docx/${item.doc}" target="_blank" rel="noopener">飞书教程</a></div></article>`).join('');
await writeFile(join(root, 'index.html'), `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><link rel="icon" href="./favicon.svg" type="image/svg+xml"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Three.js OneTwin 新手课程</title><style>body{margin:0;background:#07131c;color:#e8f7ff;font:16px "Microsoft YaHei",Arial,sans-serif}main{width:min(1100px,calc(100% - 32px));margin:auto;padding:48px 0}h1{color:#59e7ff;font-size:38px;margin:0 0 12px}p{color:#a3bdc8;line-height:1.8}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:30px}.card{padding:22px;border:1px solid #235165;background:#0b202b;border-radius:8px}.card h2{margin:0 0 10px;color:#59e7ff;font-size:20px}.links{display:flex;gap:16px;flex-wrap:wrap}.links a{color:#8aeeed;text-decoration:none;border-bottom:1px solid #31696b;padding-bottom:3px}@media(max-width:700px){.grid{grid-template-columns:1fr}h1{font-size:28px}}</style></head><body><main><h1>Three.js + OneTwin 新手课程</h1><p>先运行一个案例，再拆开模型、相机和数据，最后亲手改出可见的变化。大型展厅约 244MB，首次打开请等待加载进度。</p><div class="links"><a href="https://my.feishu.cn/docx/${overviewDoc}" target="_blank" rel="noopener">飞书学习路线</a><a href="blog/00-学习路线总览.md">本地教程源文</a></div><section class="grid">${cards}</section></main></body></html>`);
console.log(`已更新 ${cases.length} 个项目说明、提示词、${documents.length} 篇教程和课程入口。`);
