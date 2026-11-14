import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const view = document.querySelector('#view');
const status = document.querySelector('#status');
const canonical = url => new URL(url.startsWith('//') ? `https:${url}` : url, 'https://onetwin.cn').href.replace(/^http:/, 'https:');
const setPoint = (object, value = {}, fallback = 0) => object.set(value.x ?? fallback, value.y ?? fallback, value.z ?? fallback);

async function main() {
  const [template, assets] = await Promise.all([
    fetch('./source/template.json').then(response => { if (!response.ok) throw new Error('模板读取失败'); return response.json(); }),
    fetch('./source/assets.json').then(response => { if (!response.ok) throw new Error('素材清单读取失败'); return response.json(); }),
  ]);
  document.querySelector('#name').textContent = `${template.name} · 单项练习`;
  const component = template.canvasData.find(item => ['Three', 'Container3D'].includes(item.component));
  if (!component) {
    // 智慧能源原模板没有 Three 场景；先单独练习它的趋势图数据绑定。
    const source = template.canvasData.find(item => item.component === 'Chart').propValue;
    const option = structuredClone(source.option);
    option.xAxis[0].data = source.data.xData;
    option.series.forEach((series, index) => { series.data = source.data.seriesData[index]; });
    option.legend.data = option.series.map(series => series.name);
    option.grid = { left: '12%', right: '8%', top: '28%', bottom: '12%', containLabel: true };
    const chart = echarts.init(view);
    chart.setOption(option);
    addEventListener('resize', () => chart.resize());
    status.textContent = '本例为 ECharts 趋势图；主页面的能源管线也是二维图形。';
    window.practice = { template, chart, option };
    return;
  }

  const single = component.component === 'Container3D';
  const config = single ? component.propValue.attribute : component.propValue;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#081726');
  const camera = new THREE.PerspectiveCamera(config.camera?.fov || 50, innerWidth / innerHeight, .1, 3000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  view.append(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  scene.add(new THREE.HemisphereLight('#dff8ff', '#344e59', 2));
  const sun = new THREE.DirectionalLight('#ffffff', 2);
  sun.position.set(10, 20, 10);
  scene.add(sun);

  const manager = new THREE.LoadingManager();
  const localAsset = url => {
    if (/^(data:|blob:)/.test(url) || url.startsWith(location.origin)) return url;
    const entry = assets.entries[canonical(url)];
    if (!entry) throw new Error(`素材未下载：${url}`);
    return new URL(entry.file, location.href).href;
  };
  manager.setURLModifier(localAsset);
  const draco = new DRACOLoader();
  draco.setDecoderPath(new URL('./vendor/draco/', location.href).href);
  const loader = new GLTFLoader(manager);
  loader.setDRACOLoader(draco);
  const entries = single ? [{ ...config, name: '设备模型' }] : config.modelList;
  const models = [], mixers = [];
  for (const entry of entries) {
    status.textContent = `加载 ${entry.name}，大型模型首次打开需要等待…`;
    const original = canonical(entry.url);
    loader.setResourcePath(original.slice(0, original.lastIndexOf('/') + 1));
    const gltf = await loader.loadAsync(localAsset(entry.url));
    setPoint(gltf.scene.position, entry.position);
    setPoint(gltf.scene.scale, entry.scale, 1);
    setPoint(gltf.scene.rotation, entry.rotation);
    scene.add(gltf.scene);
    models.push(gltf.scene);
    const mixer = new THREE.AnimationMixer(gltf.scene);
    mixers.push(mixer);
    for (const clip of gltf.animations) {
      if (entry.animationsPlay && entry.selectAnimations?.some(name => name === clip.name || name === `${entry.name}_${clip.name}`)) mixer.clipAction(clip).play();
    }
  }
  if (config.camera) {
    setPoint(camera.position, config.camera.cameraPosition);
    setPoint(controls.target, config.camera.cameraLookAt);
  } else {
    const bounds = new THREE.Box3().setFromObject(models[0]);
    bounds.getCenter(controls.target);
    const size = bounds.getSize(new THREE.Vector3()).length();
    camera.position.copy(controls.target).add(new THREE.Vector3(size, size * .6, size * 1.5));
  }
  controls.update();
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), .05);
    if (document.hidden) return;
    mixers.forEach(mixer => mixer.update(dt));
    controls.update();
    renderer.render(scene, camera);
  });
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
  status.textContent = `已加载 ${models.length} 个模型。此练习只展示模型、相机和动画，完整面板在主页面。`;
  window.practice = { template, scene, camera, controls, renderer, models, mixers };
}
main().catch(error => { status.textContent = `加载失败：${error.message}`; console.error(error); });
