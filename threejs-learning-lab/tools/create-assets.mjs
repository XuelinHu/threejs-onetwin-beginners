import {BoxGeometry,CylinderGeometry} from '../vendor/three.module.js';
import {writeFile} from 'node:fs/promises';

const chunks=[],bufferViews=[],accessors=[];
let offset=0;
function accessor(array,type,componentType,target,min,max){
  const bytes=Buffer.from(array.buffer,array.byteOffset,array.byteLength);
  const padding=(4-offset%4)%4;
  if(padding){chunks.push(Buffer.alloc(padding));offset+=padding;}
  const view=bufferViews.length;
  bufferViews.push({buffer:0,byteOffset:offset,byteLength:bytes.length,target});
  chunks.push(bytes);offset+=bytes.length;
  const result={bufferView:view,componentType,count:array.length/({VEC3:3,SCALAR:1}[type]),type};
  if(min)result.min=min;
  if(max)result.max=max;
  accessors.push(result);
  return accessors.length-1;
}
function mesh(geometry,material){
  geometry.computeBoundingBox();
  return {primitives:[{attributes:{POSITION:accessor(geometry.attributes.position.array,'VEC3',5126,34962,geometry.boundingBox.min.toArray(),geometry.boundingBox.max.toArray()),NORMAL:accessor(geometry.attributes.normal.array,'VEC3',5126,34962)},indices:accessor(geometry.index.array,'SCALAR',5123,34963),material}]};
}
const meshes=[mesh(new BoxGeometry(2,.3,1.7),1),mesh(new CylinderGeometry(.6,.6,1.5,24),0),mesh(new BoxGeometry(.7,.5,.15),2)];
const buffer=Buffer.concat(chunks);
const gltf={asset:{version:'2.0',generator:'Three.js 学习工坊 · 原创小型教学设备'},scene:0,scenes:[{nodes:[0]}],nodes:[{name:'教学设备',children:[1,2,3]},{name:'底座',mesh:0,translation:[0,.15,0]},{name:'储罐',mesh:1,translation:[0,1.05,0]},{name:'控制面板',mesh:2,translation:[0,.9,.65]}],meshes,materials:[{name:'青绿色外壳',pbrMetallicRoughness:{baseColorFactor:[.12,.5,.47,1],metallicFactor:.45,roughnessFactor:.35}},{name:'深色底座',pbrMetallicRoughness:{baseColorFactor:[.12,.17,.22,1],metallicFactor:.3,roughnessFactor:.6}},{name:'橙色面板',pbrMetallicRoughness:{baseColorFactor:[.94,.35,.16,1],metallicFactor:.1,roughnessFactor:.5}}],buffers:[{uri:'data:application/octet-stream;base64,'+buffer.toString('base64'),byteLength:buffer.length}],bufferViews,accessors};
await writeFile(new URL('../assets/training-machine.gltf',import.meta.url),JSON.stringify(gltf));
console.log(`已生成原创教学设备：${buffer.length} 字节几何数据。`);
