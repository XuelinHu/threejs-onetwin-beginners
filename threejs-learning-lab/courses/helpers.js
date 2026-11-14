// 仅用于组织课程源码；学生运行和导出的代码不依赖此文件。
export function sceneCode(body, options = {}) {
  const {
    camera = [5, 4, 7],
    target = [0, 0, 0],
    animate = '',
    imports = '',
    setup = '',
    background = '#edf2f7',
    controls = false,
    grid = false,
    projection = 'perspective',
    orthoSize = 3,
  } = options;
  const orthographic = projection === 'orthographic';
  const cameraSource = orthographic
    ? `const viewSize = ${orthoSize};
const aspect = innerWidth / innerHeight;
const camera = new THREE.OrthographicCamera(
  -viewSize * aspect, viewSize * aspect, viewSize, -viewSize, 0.1, 100
);`
    : 'const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);';
  const orbitImport = controls ? "import { OrbitControls } from 'three/addons/controls/OrbitControls.js';\n" : '';
  const orbitSource = controls ? `
// 拖动鼠标观察；滚轮拉近或拉远。
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(${target.join(', ')});
controls.enableDamping = true;
` : '';
  const resizeCamera = orthographic
    ? `  const aspect = innerWidth / innerHeight;
  camera.left = -viewSize * aspect;
  camera.right = viewSize * aspect;`
    : '  camera.aspect = innerWidth / innerHeight;';
  return `import * as THREE from 'three';
${orbitImport}${imports ? `${imports}\n` : ''}
// 1. 场景：放置物体的空间。
const scene = new THREE.Scene();
scene.background = new THREE.Color('${background}');

// 2. 相机：决定从哪里、朝哪个方向观察。
${cameraSource}
camera.position.set(${camera.join(', ')});
camera.lookAt(${target.join(', ')});

// 3. 渲染器：把场景和相机转换为画面。
const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
${orbitSource}${grid ? '\nscene.add(new THREE.GridHelper(10, 10, 0xb8c6d5, 0xd6dfe9));\n' : ''}${setup ? `\n${setup}\n` : ''}
// 4. 本节要学习的内容。
${body.trim()}

// 5. 预览区域改变大小时，同时更新相机和画布。
addEventListener('resize', () => {
${resizeCamera}
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
});

let previousTime = 0;
function render(milliseconds) {
  const time = milliseconds * 0.001;
  const delta = Math.min(time - previousTime, 0.05);
  previousTime = time;
${animate ? `${animate.trim().split('\n').map(line => `  ${line}`).join('\n')}\n` : ''}${controls ? '  controls.update();\n' : ''}  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`;
}

export function makeLesson({ change, ...lesson }) {
  if (change) {
    if (!lesson.code.includes(change[0])) throw new Error(`${lesson.id}: 参考答案替换位置不存在`);
    lesson.solutionCode = lesson.code.replace(change[0], change[1]);
  }
  return lesson;
}
