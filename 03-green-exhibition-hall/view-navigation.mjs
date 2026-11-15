// 视角工具只操作相机与轨道控制器，不移动场景物体。
export function configureViewMouse(controls) {
  controls.mouseButtons.MIDDLE = 0; // Three.js 的 ROTATE；Shift＋旋转键由控制器切换为平移。
  controls.enableRotate = true;
  controls.enablePan = true;
  controls.enableZoom = true;
}

export function mountViewNavigation({ camera, controls, canvas, api, render = () => {} }) {
  configureViewMouse(controls);
  // 原版大屏使用 CSS 缩放；工具条放在页面顶层，避免文字随大屏缩小。
  const host = document.body;
  if (!document.querySelector('#view-navigation-style')) {
    const style = document.createElement('style');
    style.id = 'view-navigation-style';
    style.textContent = '.view-navigation{position:absolute;right:10px;top:10px;z-index:8;max-width:calc(100% - 20px);padding:7px;border:1px solid #c7cdd2;border-radius:7px;background:#ffffffed;color:#111;font:12px/1.5 Arial,"Microsoft YaHei",sans-serif;box-shadow:0 2px 10px #0002;pointer-events:auto}.view-navigation nav{display:flex;flex-wrap:wrap;gap:4px}.view-navigation button{border:1px solid #bdc8ce;background:#fff;color:#111;border-radius:4px;padding:4px 7px;font:inherit;cursor:pointer}.view-navigation button:hover,.view-navigation button:focus-visible{background:#e0edf7;outline:2px solid #3577a0;outline-offset:1px}.view-navigation p{margin:5px 1px 0;font-size:11px;color:#222}.view-navigation output{display:block;color:#111;font-size:11px}.view-navigation output:empty{display:none}@media(max-width:600px){.view-navigation{top:6px;right:6px;padding:5px;max-width:calc(100% - 12px)}.view-navigation p{max-width:180px;font-size:10px}}';
    document.head.append(style);
  }
  const initial = {
    position: camera.position.clone(), target: controls.target.clone(),
    up: camera.up.clone(), zoom: camera.zoom,
  };
  const panel = document.createElement('section');
  panel.className = 'view-navigation';
  panel.style.position = 'fixed';
  panel.style.transform = 'translateX(-50%)';
  panel.style.right = 'auto';
  panel.setAttribute('aria-label', '三维视角控制');
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', '切换观察方向');
  const feedback = document.createElement('output');
  feedback.setAttribute('aria-live', 'polite');
  const directions = { front: [0, 0, 1], right: [1, 0, 0], top: [0, 1, 0.00001], oblique: [1, 0.8, 1] };
  let observing = false;
  const startRobot = api?.startRobot;
  if (api) api.startRobot = function (...args) {
    // 角色文件异步加载完后会再次启动；已选择观察时忽略这次迟到的启动。
    if (observing && !api.robotObj.ifRobot) return;
    observing = false;
    api.removeWindowEvent();
    api.addWindowEvent();
    return startRobot.apply(this, args);
  };
  function observe() {
    observing = true;
    if (api && (api.robotObj?.ifRobot || api.global.camera !== controls.object)) {
      // 漫游相机每帧跟随角色；先解除全局鼠标监听，再恢复轨道相机。
      api.removeWindowEvent();
      // 原版退出会启动 2.5 秒相机动画并禁用鼠标；观察操作需要立即接管。
      const animateCamera = api.updateCameraAnimation;
      try {
        api.updateCameraAnimation = () => {};
        api.cancelCurrentAnimation();
        api.stopRobot();
      } finally {
        api.updateCameraAnimation = animateCamera;
      }
      api.robotObj.ifRobot = false;
      api.global.camera = controls.object;
      controls.enabled = true;
      if (document.pointerLockElement === canvas) document.exitPointerLock();
    }
  }
  function changeView(view) {
    observe();
    if (!controls.enabled) {
      feedback.textContent = '请先结束物体拖动或退出漫游，再切换视角。';
      return;
    }
    controls.autoRotate = false;
    const damping = controls.enableDamping;
    controls.enableDamping = false;
    controls.update();
    if (view === 'reset') {
      camera.position.copy(initial.position);
      camera.up.copy(initial.up);
      camera.zoom = initial.zoom;
      controls.target.copy(initial.target);
    } else {
      const distance = Math.max(camera.position.distanceTo(controls.target), 0.01);
      const direction = camera.position.clone().set(...directions[view]).normalize();
      camera.position.copy(controls.target).addScaledVector(direction, distance);
      camera.up.set(0, 1, 0);
    }
    camera.updateProjectionMatrix();
    camera.lookAt(controls.target);
    // 清除上一次拖动的阻尼余量，避免切换方向后继续漂移。
    controls.update();
    controls.enableDamping = damping;
    feedback.textContent = '';
    render();
  }
  for (const [view, label, title] of [
    ['front', '正视', '沿 Z 轴观察（数字键盘 1）'],
    ['right', '右视', '沿 X 轴观察（数字键盘 3）'],
    ['top', '俯视', '沿 Y 轴观察（数字键盘 7）'],
    ['oblique', '斜视', '从斜上方观察'],
    ['reset', '复位', '恢复刚打开页面时的相机和缩放（Home）'],
  ]) {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = label; button.title = title;
    button.dataset.view = view;
    button.addEventListener('click', () => changeView(view));
    nav.append(button);
  }
  const help = document.createElement('p');
  help.textContent = '中键旋转 · Shift＋中键平移 · 滚轮缩放';
  if (api) help.title = '拖动或切换视角时自动退出角色漫游；可用原页面按钮重新进入漫游。';
  panel.append(nav, help, feedback);
  host.append(panel);
  const input = controls.domElement || canvas;
  const rotateSpeed = controls.rotateSpeed ?? 1, panSpeed = controls.panSpeed ?? 1;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    panel.hidden = rect.width < 2 || rect.height < 2;
    panel.style.left = `${rect.left + rect.width / 2}px`;
    panel.style.top = `${Math.max(rect.top + 8, rect.height > innerHeight * 0.75 ? 64 : 8)}px`;
    panel.style.maxWidth = `${Math.max(100, Math.min(rect.width - 16, innerWidth - 16))}px`;
    // 控制器用未缩放的 clientHeight 计算角度，补偿模板缩放后过慢的拖动。
    const scale = Math.max(0.1, Math.min(10, input.clientHeight / (input.getBoundingClientRect().height || 1)));
    controls.rotateSpeed = rotateSpeed * scale;
    controls.panSpeed = panSpeed * scale;
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  addEventListener('resize', resize);
  resize();
  canvas.tabIndex = canvas.tabIndex < 0 ? 0 : canvas.tabIndex;
  function focusCanvas(event) {
    // 中键专用于观察，左键继续保留原页面的角色与业务交互。
    if (event.button === 1) observe();
    canvas.focus({ preventScroll: true });
  }
  function shortcut(event) {
    const view = { Numpad1: 'front', Numpad3: 'right', Numpad7: 'top', Home: 'reset' }[event.code];
    if (!view || event.ctrlKey || event.altKey || event.metaKey) return;
    event.preventDefault(); changeView(view);
  }
  canvas.addEventListener('pointerdown', focusCanvas, true);
  canvas.addEventListener('keydown', shortcut);
  return () => {
    panel.remove();
    if (api) api.startRobot = startRobot;
    observer.disconnect();
    removeEventListener('resize', resize);
    controls.rotateSpeed = rotateSpeed;
    controls.panSpeed = panSpeed;
    canvas.removeEventListener('pointerdown', focusCanvas, true);
    canvas.removeEventListener('keydown', shortcut);
  };
}

// Three 大场景通过适配 API 获取控制器；Container3D 通过组件实例获取。
export function watchReferenceViews(modelViewers) {
  const mounted = new Map();
  const update = () => {
    const viewers = [...(window.__referenceApis || []).map(api => api.global), ...modelViewers];
    for (const viewer of viewers) {
      const { controls, renderer, scene } = viewer || {};
      // 漫游时 global.camera 指向角色相机，轨道控制器仍绑定原观察相机。
      const camera = controls?.object || viewer?.camera;
      const api = (window.__referenceApis || []).find(item => item.global === viewer);
      const canvas = renderer?.domElement;
      if (!camera || !controls?.mouseButtons || !canvas?.isConnected) continue;
      // 小模型加载前相机与目标都在原点，此时不能保存有效的复位视角。
      if (camera.position.distanceToSquared(controls.target) < 1e-12) continue;
      if (mounted.get(canvas)?.controls === controls) continue;
      mounted.get(canvas)?.dispose();
      const dispose = mountViewNavigation({ camera, controls, canvas, api, render: () => renderer.render(scene, camera) });
      mounted.set(canvas, { controls, dispose });
    }
    for (const [canvas, item] of mounted) if (!canvas.isConnected) { item.dispose(); mounted.delete(canvas); }
    window.__referenceViews = viewers.filter(viewer => viewer?.controls && viewer.renderer?.domElement?.isConnected);
  };
  update();
  const timer = setInterval(update, 300);
  addEventListener('pagehide', () => { clearInterval(timer); mounted.forEach(item => item.dispose()); }, { once: true });
}
