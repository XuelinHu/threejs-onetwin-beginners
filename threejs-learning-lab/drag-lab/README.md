# 拖拽基础练习

面向初学者的独立 Three.js 场景搭建实验。启动仓库根目录的 `node server.mjs`，访问 `/threejs-learning-lab/drag-lab/`，与已有课程共用一个服务，不需要安装依赖。

## 怎么学

1. 从组件盒子拖入方块、球体、圆柱、圆锥、圆环、平面、圆形或点光源；手机上可以直接点选添加。
2. 点击物体或对象列表选中它。在移动模式下抓住物体即可沿地面拖动，彩色坐标轴可进行三维移动、旋转、缩放。
3. 在右侧输入位置、旋转角度、缩放、颜色与材质参数，同时阅读对应 API。位置和角度都可输入 0。
4. 试试网格吸附、复制、隐藏、撤销和重做。快捷键 W/E/R 切换移动/旋转/缩放，Delete 删除，Ctrl+Z 撤销。
5. “查看代码”按当前对象数据生成可运行的 Three.js 源码。“下载项目”带上本地 Three.js 依赖，可解压后独立运行。
6. “保存场景”导出 JSON，“打开场景”导入 JSON。每类练习也会自动保存在当前浏览器。切换浏览器或设备时请用 JSON 转移。

包含基础图形、材质、灯光，以及车间、产线、展厅、运维、能源五类轻量搭建草图。草图仅使用基础几何，独立于五个完整案例及其大型 GLB；不包含业务数据、真实设备连接或物理仿真。

输入最多 80 个组件，导入文件最多 1 MB。非法类型和版本会拒绝导入，数值会限制在可操作范围。重置和导入均可撤销。代码导出包含场景中的对象，不包含编辑器的光源标记、选择轮廓和坐标手柄。

## 来源

交互流程参考 [onetwin-open](https://github.com/1035141145/onetwin-open) 的组件库、拖入画布、属性栏及快照保存方式。本练习为独立编写，没有引入其 Vue/Vuex 或完整平台运行时。参考源码：[ComponentList.vue](https://github.com/1035141145/onetwin-open/blob/master/src/components/ComponentList.vue)、[编辑页面](https://github.com/1035141145/onetwin-open/blob/master/src/page/dragView/index.vue)、[snapshot.js](https://github.com/1035141145/onetwin-open/blob/master/src/store/snapshot.js)。

TransformControls 使用与现有 Three.js 一致的 r180 官方模块，保留原始源码和 MIT 许可，参见上级 `vendor/THREE-LICENSE.txt`。
