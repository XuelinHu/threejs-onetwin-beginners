import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {runInNewContext} from 'node:vm';
import * as THREE from '../vendor/three.module.js';
import {CATALOG,PRESETS,createRecord,normalizeScene,sceneToCode} from '../drag-lab/scene-data.js';

const scene = objects=>({version:1,objects});
assert.equal(CATALOG.length,8,'组件库应有 8 种基础组件');
assert.equal(Object.keys(PRESETS).length,8,'应有 8 个练习模板');
for(const value of [null,{},[],{version:2,objects:[]},scene([{type:'unknown'}]),scene(Array.from({length:81},()=>createRecord('box','box'))) ]){
  assert.throws(()=>normalizeScene(value),Error,'错误格式、版本、组件类型或超限场景应被拒绝');
}

const origin = createRecord('box','origin',[0,0,0]);
assert.deepEqual(normalizeScene(scene([origin])).objects[0].position,[0,0,0],'零坐标不能被默认高度覆盖');
const extreme = {...origin,position:[-100,0,100],rotation:[-720,0,720],scale:[-1,0,100],roughness:-2,metalness:3,intensity:30,distance:-1};
const clamped = normalizeScene(scene([extreme])).objects[0];
assert.deepEqual(clamped.position,[-50,0,50]);
assert.deepEqual(clamped.rotation,[-360,0,360]);
assert.deepEqual(clamped.scale,[0.1,0.1,10]);
assert.deepEqual([clamped.roughness,clamped.metalness,clamped.intensity,clamped.distance],[0,1,20,0]);
const nonFinite = normalizeScene(scene([{...origin,position:[NaN,Infinity,-Infinity],scale:[NaN,Infinity,-Infinity]}])).objects[0];
assert.deepEqual(nonFinite.position,[0,0.8,0],'无穷或 NaN 坐标应回退到组件默认值');
assert.deepEqual(nonFinite.scale,[1,1,1]);
const duplicates = normalizeScene(scene([origin,{...origin},{...origin,id:'origin-2'}])).objects;
assert.equal(new Set(duplicates.map(item=>item.id)).size,3,'重复 ID 必须修复，包括与修复结果重名的情况');

const allTypes = CATALOG.map((definition,index)=>({
  ...createRecord(definition.type,`all-${index}`),name:`组件 ${index+1}`,
  position:[0,index-3,index===0?0:-index],rotation:[0,45,-30],scale:[1,1.2,0.8],
  color:'#3489bc',roughness:0.25,metalness:0.65,wireframe:index%2===0,
  visible:index!==3,intensity:0,distance:12,
}));
const roundTrip = normalizeScene(JSON.parse(JSON.stringify(scene(allTypes))));
assert.deepEqual(roundTrip,scene(allTypes),'JSON 场景往返应保留全部组件参数');
assert.notEqual(roundTrip.objects[0],allTypes[0],'导入应生成新记录');
assert.equal(normalizeScene(scene([{...origin,name:'测'.repeat(80)}])).objects[0].name.length,40,'名称应限制为 40 字');

// 使用真实 Three.js 几何与材质，仅替换依赖浏览器和显卡的渲染器。
function executeExport(objects) {
  let renderedScene;
  class Renderer {
    shadowMap = {};
    setPixelRatio() {}
    setSize() {}
    render(value) {renderedScene=value;}
  }
  class Controls {
    target = new THREE.Vector3();
    update() {}
  }
  const sandbox = {
    THREE:{...THREE,WebGLRenderer:Renderer},OrbitControls:Controls,
    document:{querySelector:()=>({parentElement:{clientWidth:960,clientHeight:640}})},
    devicePixelRatio:1,innerWidth:960,innerHeight:640,
    ResizeObserver:class {observe() {}},requestAnimationFrame() {},nameExecuted:false,
  };
  const code = sceneToCode(objects).replace(/^import .+;$/gm,'');
  runInNewContext(code,sandbox,{timeout:1000});
  assert.ok(renderedScene?.isScene,'导出源码应可建立并渲染 Three.js 场景');
  assert.equal(sandbox.nameExecuted,false,'组件名称必须作为文本保留，不能执行其中的语句');
  return renderedScene;
}

const rendered = executeExport(allTypes);
for(const item of allTypes){
  const object = rendered.getObjectByName(item.name);
  assert.ok(object,`${item.name} 没有出现在导出场景中`);
  assert.deepEqual(object.position.toArray(),item.position);
  assert.deepEqual(object.scale.toArray(),item.scale);
  assert.deepEqual([object.rotation.x,object.rotation.y,object.rotation.z],item.rotation.map(THREE.MathUtils.degToRad));
  assert.equal(object.visible,item.visible);
  if(item.type==='pointLight'){
    assert.equal(object.isPointLight,true);
    assert.equal(object.intensity,item.intensity);
    assert.equal(object.distance,item.distance);
    assert.equal('#'+object.color.getHexString(),item.color);
  }else{
    assert.equal(object.geometry.type,CATALOG.find(definition=>definition.type===item.type).constructor);
    assert.equal('#'+object.material.color.getHexString(),item.color);
    assert.equal(object.material.roughness,item.roughness);
    assert.equal(object.material.metalness,item.metalness);
    assert.equal(object.material.wireframe,item.wireframe);
  }
}

const specialNames = [
  '";globalThis.nameExecuted=1;//',
  "';globalThis.nameExecuted=1;//",
  '` ${globalThis.nameExecuted=1}',
  '换行\n反斜杠\\引号"与</script>',
  '分隔符\u2028中\u2029文',
];
const specialObjects = specialNames.map((name,index)=>({...createRecord('box',`name-${index}`),name}));
const namedScene = executeExport(specialObjects);
for(const name of specialNames)assert.ok(namedScene.getObjectByName(name),'特殊名称在导出后应保持原样');

const variants = [...Object.entries(PRESETS).map(([name,preset])=>[name,preset.objects]),['全部组件',allTypes],['特殊名称',specialObjects],['空场景',[]]];
for(const [name,objects] of variants){
  const check = spawnSync(process.execPath,['--input-type=module','--check'],{input:sceneToCode(objects),encoding:'utf8'});
  assert.equal(check.status,0,`${name} 的导出源码语法错误：${check.stderr||check.error||''}`);
  assert.deepEqual(normalizeScene(JSON.parse(JSON.stringify(scene(objects)))),scene(objects),`${name} 场景往返参数不一致`);
}
console.log(`通过：${Object.keys(PRESETS).length} 个拖拽练习模板、${CATALOG.length} 种组件，${variants.length} 份导出源码；场景校验、参数往返和名称文本安全检查通过。`);
