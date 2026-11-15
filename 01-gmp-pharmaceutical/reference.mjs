// 使用原站公开组件进行对照；可读的 Three.js 教学实现见 practice.mjs。
import { configureLocalApp, createLocalApp, localVNode as h, localRef as ref, A as editorStore, O as threeStore } from './reference-runtime/static/js/index-local.js';
import { P as PreviewCanvas } from './reference-runtime/static/js/usePreviewScale-Djv4fxrG.js';
import { watchReferenceViews } from './view-navigation.mjs';

const status = document.querySelector('#reference-status');
const diagnostics = { errors: [], warnings: [], components: 0 };
const base = new URL('./', location.href);
try {
  const [template, manifest] = await Promise.all([
    fetch(new URL('source/template.json', base)).then(response => response.json()),
    fetch(new URL('source/assets.json', base)).then(response => response.json()),
  ]);
  const localAssets = new Map();
  for (const [url, entry] of Object.entries(manifest.entries)) {
    const local = new URL(entry.file, base).href;
    for (const variant of [url, decodeURI(url)]) {
      localAssets.set(variant, local);
      localAssets.set(variant.replace(/^https:/, ''), local);
      localAssets.set(variant.replace(/^https:/, 'http:'), local);
    }
    if (url.startsWith('https://onetwin.cn/')) localAssets.set(new URL(url).pathname, local);
  }
  function rewrite(value) {
    if (typeof value === 'string') {
      if (localAssets.has(value)) return localAssets.get(value);
      for (const [url, local] of localAssets) if (value.includes(url)) value = value.replaceAll(url, local);
      value = value.replace(/src=(['"])(?:\.\/|\/)?iframeJs\//g, `src=$1${new URL('reference-runtime/iframeJs/', base).href}`);
      value = value.replace(/\/asset\/get\/s\/data-(?:1605493703679-ydPWrx0rH|1605494522699-WjdxwqFTe)\.png/g, 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=');
      return value;
    }
    if (Array.isArray(value)) return value.map(rewrite);
    if (value && typeof value === 'object') {
      const result = Object.fromEntries(Object.entries(value).map(([key, item]) => [key, rewrite(item)]));
      // 旧配置的音频只映射到随项目分发的本地文件，避免请求原站。
      if (result.audio?.url) result.audio.url = new URL('assets/audio/short-beep.ogg', base).href;
      // 旧模板把 play 写作 paly，新版运行库读取 play；兼容已有动画按钮。
      if (Array.isArray(result.paly) && !Array.isArray(result.play)) result.play = result.paly;
      return result;
    }
    return value;
  }
  const data = rewrite(template);
  document.title = `${template.name} · 原版组件对照`;
  const width = ref(innerWidth);
  const height = ref(innerHeight);
  const app = configureLocalApp(createLocalApp({
    setup() {
      const store = editorStore();
      store.setMode('preview');
      store.setEditMode('preview');
      store.setComponentData(data.canvasData);
      store.setCanvasStyle(data.canvasStyle);
      function resize() {
        width.value = innerWidth;
        height.value = innerHeight;
        store.width_p = data.canvasStyle.width / innerWidth;
        store.height_p = data.canvasStyle.height / innerHeight;
        localStorage.setItem('scale', innerWidth / data.canvasStyle.width);
      }
      resize();
      addEventListener('resize', resize);
      window.__reference = { template: data, diagnostics, store, three:threeStore() };
      return () => h(PreviewCanvas, {
        copyData: store.componentData, canvasStyleData: data.canvasStyle,
        width: `${width.value}px`, height: `${height.value}px`, scaleMode: 'mode1',
        scaleProps: { width_p: data.canvasStyle.width / width.value, height_p: data.canvasStyle.height / height.value },
        bgMode: 'container',
      });
    },
  }));
  const modelViewers = new Set();
  app.mixin({
    mounted() { if (/^model-/.test(this.$options.name || '')) modelViewers.add(this); },
    unmounted() { modelViewers.delete(this); },
  });
  app.config.errorHandler = error => {
    diagnostics.errors.push(error.message);
    console.error(error);
    status.hidden = false;
    status.textContent = `组件错误：${error.message}`;
  };
  app.mount('#app');
  watchReferenceViews(modelViewers);
  diagnostics.components = data.canvasData.length;
  status.hidden = true;
  document.documentElement.dataset.ready = 'true';
} catch (error) {
  diagnostics.errors.push(error.message);
  status.textContent = `读取失败：${error.message}`;
  console.error(error);
}
