import { readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../reference-runtime/static/js/', import.meta.url));
const originalRoot=fileURLToPath(new URL('./.reference-originals/static/js/',import.meta.url));
const source = await readFile(join(originalRoot, 'index-BPebULkk.js'), 'utf8');
const start = source.lastIndexOf(',cme=Fe(Ni);var pme;');
const end = source.lastIndexOf('export{');
if (start < 0 || end < start) throw new Error('原站启动结构已改变，需要重新核对。');
const helper = `;
export function configureLocalApp(app) {
  // 本地文件由 HTTP 缓存管理，直接加载，避免原站二次写入大型模型缓存。
  XH = async function(options) {
    const loader = new Aa();
    if (options.draco) loader.setDRACOLoader(qH);
    try {
      const model = await loader.loadAsync(RH(options.url), options.onprocess);
      options.complete(model);
    } catch (error) {
      options.onerror?.(error);
      throw error;
    }
  };
  for (const [name, component] of Object.entries(u)) app.component(name, component);
  app.directive('permission', Wi);
  app.component('SvgIcon', Hi);
  app.component('Group', ume);
  app.component('GroupAttr', dme);
  app.component('ColorPickerPro', Sv);
  app.config.globalProperties.$baseUrl = location.origin + '/';
  app.use(Wt);
  app.use(Xl);
  Xi = app;
  return app;
}
export { Fe as createLocalApp, Ae as localVNode, ye as localRef };
`;
const localSource = (source.slice(0, start) + helper + source.slice(end))
  .replace('n=new Dl;n.showPanel(0);', 'n=new Dl;(window.__referenceGlobals??=[]).push(t);n.showPanel(0);')
  .replace('m.initTransformControls(),Oa.enabled=', '(window.__referenceApis??=[]).push(m),m.initTransformControls(),Oa.enabled=');
await writeFile(join(root, 'index-local.js'), localSource);
for (const file of await readdir(root)) {
  if (!file.endsWith('.js') || file === 'index-BPebULkk.js') continue;
  const path = join(root, file);
  const text = file==='index-local.js' ? await readFile(path,'utf8') : await readFile(join(originalRoot,file),'utf8');
  let patched = text.replaceAll('./index-BPebULkk.js', './index-local.js');
  if (!patched.startsWith('const __referenceBase=')) {
    patched = 'const __referenceBase=new URL("../../",import.meta.url).href;\n' + patched
      .replaceAll('"/static/', '__referenceBase+"static/')
      .replaceAll('"/image/', '__referenceBase+"image/')
      .replaceAll('"/draco/', '__referenceBase+"draco/')
      .replaceAll('"/man2.glb"', '__referenceBase+"man2.glb"')
      .replaceAll('"/man.glb"', '__referenceBase+"man.glb"');
  }
  await writeFile(path, patched);
}
console.log('已禁用原站启动流程，保留组件与预览画布。');
const cssRoot = fileURLToPath(new URL('../reference-runtime/static/css/', import.meta.url));
for (const file of await readdir(cssRoot)) {
  const path = join(cssRoot, file);
  const css = await readFile(fileURLToPath(new URL(`./.reference-originals/static/css/${file}`,import.meta.url)), 'utf8');
  await writeFile(path, css.replaceAll('url(/static/', 'url(../').replaceAll('url("/static/', 'url("../'));
}
