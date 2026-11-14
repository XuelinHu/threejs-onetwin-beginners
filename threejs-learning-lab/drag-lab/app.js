import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {TransformControls} from 'three/addons/controls/TransformControls.js';
import {CATALOG,PRESETS,createRecord,normalizeScene,sceneToCode} from './scene-data.js';
import {downloadLesson} from '../download.js';

const $=id=>document.getElementById(id);
const storageKey='threejs-drag-lab:v1:';
const types=new Map(CATALOG.map(item=>[item.type,item]));
const entries=new Map();
const parameters=new URLSearchParams(location.search);
let preset=Object.hasOwn(PRESETS,parameters.get('preset'))?parameters.get('preset'):'basics';
let records=[],selectedId=null,history=[],historyIndex=-1,messageTimer,saveWarned=false;
let renderer,scene,camera,orbit,transform,selectionBox,grid,floor;
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),ground=new THREE.Plane(new THREE.Vector3(0,1,0),0);
let pointerStart=null,wasTransforming=false,draggingId=null,moveStarted=false,dragOffset=new THREE.Vector3();
let directPointerId=null,directStartPosition=null;

function message(text){$('scene-message').textContent=text;$('scene-message').hidden=false;clearTimeout(messageTimer);messageTimer=setTimeout(()=>$('scene-message').hidden=true,4500);}
function uid(){return globalThis.crypto?.randomUUID?.()||`object-${Date.now()}-${Math.random().toString(36).slice(2)}`;}
function selected(){return records.find(record=>record.id===selectedId);}
function number(value,min,max,fallback){const n=Number(value);return Number.isFinite(n)?THREE.MathUtils.clamp(n,min,max):fallback;}
function closePanels(){document.body.classList.remove('library-open','properties-open');$('toggle-library').setAttribute('aria-expanded','false');$('toggle-properties').setAttribute('aria-expanded','false');}
function togglePanel(name){const active=document.body.classList.contains(name+'-open');closePanels();document.body.classList.toggle(name+'-open',!active);$('toggle-'+name).setAttribute('aria-expanded',String(!active));}
function persist(){
  try{localStorage.setItem(storageKey+preset,JSON.stringify({version:1,objects:records}));$('status-text').textContent=`${records.length} 个组件 · 已保存在此浏览器`;}
  catch{if(!saveWarned){message('浏览器无法保存，请使用“保存场景”下载文件保留作品。');saveWarned=true;}$('status-text').textContent=`${records.length} 个组件 · 请下载保存`;}
}
function snapshot(){return JSON.stringify({version:1,objects:records});}
function checkpoint(){
  const current=snapshot();if(history[historyIndex]===current)return;
  history=history.slice(0,historyIndex+1);history.push(current);if(history.length>50)history.shift();historyIndex=history.length-1;
  persist();updateHistory();
}
function updateHistory(){$('undo').disabled=historyIndex<=0;$('redo').disabled=historyIndex>=history.length-1;}
function disposeEntry(entry){entry.root.traverse(object=>{object.geometry?.dispose();if(Array.isArray(object.material))object.material.forEach(material=>material.dispose());else object.material?.dispose();});scene.remove(entry.root);}
function geometry(type){
  switch(type){
    case 'box':return new THREE.BoxGeometry(1.6,1.6,1.6);
    case 'sphere':return new THREE.SphereGeometry(.85,32,20);
    case 'cylinder':return new THREE.CylinderGeometry(.7,.7,1.8,32);
    case 'cone':return new THREE.ConeGeometry(.85,1.8,32);
    case 'torus':return new THREE.TorusGeometry(.7,.24,16,48);
    case 'plane':return new THREE.PlaneGeometry(4,4);
    case 'circle':return new THREE.CircleGeometry(1,48);
    default:throw new Error('不支持的组件类型');
  }
}
function createEntry(record){
  let root,light;
  if(record.type==='pointLight'){
    root=new THREE.Group();light=new THREE.PointLight(record.color,record.intensity,record.distance,2);root.add(light);
    const marker=new THREE.Mesh(new THREE.SphereGeometry(.16,12,8),new THREE.MeshBasicMaterial({color:record.color}));root.add(marker);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.25,.025,8,24),new THREE.MeshBasicMaterial({color:record.color}));root.add(ring);
  }else{
    root=new THREE.Mesh(geometry(record.type),new THREE.MeshStandardMaterial({side:THREE.DoubleSide}));root.castShadow=true;root.receiveShadow=true;
  }
  root.userData.recordId=record.id;scene.add(root);const entry={root,light};entries.set(record.id,entry);applyRecord(record);return entry;
}
function applyRecord(record){
  const entry=entries.get(record.id),root=entry.root;root.name=record.name;root.visible=record.visible;
  root.position.fromArray(record.position);root.rotation.set(...record.rotation.map(THREE.MathUtils.degToRad));root.scale.fromArray(record.scale);
  if(entry.light){entry.light.color.set(record.color);entry.light.intensity=record.intensity;entry.light.distance=record.distance;root.children.filter(child=>child.isMesh).forEach(child=>child.material.color.set(record.color));}
  else{root.material.color.set(record.color);root.material.roughness=record.roughness;root.material.metalness=record.metalness;root.material.wireframe=record.wireframe;}
  root.updateMatrixWorld(true);
  if(selectedId===record.id){selectionBox.visible=record.visible&&record.type!=='pointLight';if(selectionBox.visible)selectionBox.setFromObject(root);}
}
function replaceScene(next){
  endDirectDrag(true);
  cancelTransform();
  transform.detach();selectionBox.visible=false;entries.forEach(disposeEntry);entries.clear();records=normalizeScene(next).objects;
  records.forEach(createEntry);selectObject(records.some(record=>record.id===selectedId)?selectedId:null);renderList();
}
function renderList(){
  const nodes=records.map(record=>{
    const button=document.createElement('button');button.type='button';button.className='object-item';button.dataset.objectId=record.id;button.classList.toggle('active',record.id===selectedId);button.setAttribute('aria-pressed',String(record.id===selectedId));
    const icon=document.createElement('span');icon.className='object-icon';icon.textContent=types.get(record.type).icon;
    const name=document.createElement('span');name.className='object-name';name.textContent=record.name;
    const state=document.createElement('small');state.textContent=record.visible?'':'已隐藏';button.append(icon,name,state);button.addEventListener('click',()=>selectObject(record.id));return button;
  });
  if(!nodes.length){const empty=document.createElement('p');empty.className='list-empty';empty.textContent='还没有组件，先拖一个方块进来。';nodes.push(empty);}
  $('object-list').replaceChildren(...nodes);$('empty-hint').hidden=records.length>0;
  for(const id of ['duplicate','delete-object'])$(id).disabled=!selected();
}
function selectObject(id){
  if(draggingId&&id!==draggingId)endDirectDrag(true);
  cancelTransform();
  selectedId=entries.has(id)?id:null;transform.detach();const record=selected();
  if(record?.visible){transform.attach(entries.get(record.id).root);selectionBox.visible=record.type!=='pointLight';if(selectionBox.visible)selectionBox.setFromObject(entries.get(record.id).root);}else selectionBox.visible=false;
  renderList();renderProperties();
}
function renderProperties(){
  const record=selected();$('property-form').hidden=!record;$('no-selection').hidden=!!record;
  if(!record){$('api-title').textContent='从拖入一个组件开始';$('api-call').textContent='scene.add(mesh)';$('api-description').textContent='左边选择形状，中间查看结果，右边理解它的关键参数。';$('api-parameters').replaceChildren();$('api-principle').textContent='形状由 Geometry 决定，外观由 Material 决定，把两者装进 Mesh 后加入 Scene。';return;}
  const meta=types.get(record.type),light=record.type==='pointLight';
  $('object-name').value=record.name;$('object-color').value=record.color;$('object-visible').checked=record.visible;
  $('mesh-fields').hidden=light;$('light-fields').hidden=!light;
  $('object-roughness').value=record.roughness;$('object-metalness').value=record.metalness;$('object-wireframe').checked=record.wireframe;
  $('light-intensity').value=record.intensity;$('light-distance').value=record.distance;
  syncTransformInputs();$('api-title').textContent=meta.label;$('api-call').textContent=`new THREE.${meta.constructor}(${meta.args})`;
  $('api-description').textContent=meta.description;$('api-principle').textContent=meta.principle;
  const params=[...meta.parameters,['position.set(x, y, z)','位置：X 左右、Y 高低、Z 前后。拖动物体或输入数值都在修改这里。'],['rotation / scale','旋转输入使用度，Three.js 内部使用弧度；缩放 1 表示原尺寸。']];
  $('api-parameters').replaceChildren(...params.flatMap(([name,description])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=description;return[dt,dd];}));
}
function syncTransformInputs(){const record=selected();if(!record)return;for(const input of $('transform-fields').querySelectorAll('input')){if(document.activeElement!==input)input.value=Number(record[input.dataset.field][Number(input.dataset.axis)].toFixed(2));}}
function syncFromRoot(){
  const record=selected();if(!record)return;const root=entries.get(record.id).root;
  record.position=root.position.toArray().map(value=>number(value,-50,50,0));record.rotation=[root.rotation.x,root.rotation.y,root.rotation.z].map(value=>THREE.MathUtils.euclideanModulo(THREE.MathUtils.radToDeg(value)+180,360)-180);record.scale=root.scale.toArray().map(value=>number(value,.1,10,1));
  applyRecord(record);syncTransformInputs();
}
function dropPosition(clientX,clientY){
  const rect=$('scene').getBoundingClientRect();pointer.set((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
  const point=new THREE.Vector3();if(!raycaster.ray.intersectPlane(ground,point))return new THREE.Vector3();
  point.x=number(point.x,-25,25,0);point.z=number(point.z,-25,25,0);
  if($('snap-grid').checked){point.x=Math.round(point.x*2)/2;point.z=Math.round(point.z*2)/2;}return point;
}
function addObject(type,point){
  if(!types.has(type))return;if(records.length>=80){message('最多放置 80 个组件，先精简一下场景。');return;}
  const record=createRecord(type,uid());if(point){record.position[0]=point.x;record.position[2]=point.z;}else{record.position[0]=(records.length%5-2)*2;record.position[2]=Math.floor(records.length/5)*2;}
  records.push(record);createEntry(record);selectObject(record.id);checkpoint();closePanels();message(`已添加${types.get(type).label}，拖动彩色轴移动，也可在右侧输入参数。`);
}
function hitObject(event){
  const rect=$('scene').getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
  const hits=raycaster.intersectObjects(records.filter(record=>record.visible).map(record=>entries.get(record.id).root),true);
  if(!hits.length)return null;let root=hits[0].object;while(root&&!root.userData.recordId)root=root.parent;return root?.userData.recordId||null;
}
function loadPreset(key){
  preset=Object.hasOwn(PRESETS,key)?key:'basics';const template=PRESETS[preset];let next={version:1,objects:template.objects};
  try{const draft=localStorage.getItem(storageKey+preset);if(draft)next=normalizeScene(JSON.parse(draft));}catch{message('保存的场景无法读取，已恢复本练习的起始场景。');}
  selectedId=null;replaceScene(next);history=[];historyIndex=-1;checkpoint();$('preset-select').value=preset;
  $('task-title').textContent=template.title;$('task-description').textContent=template.description;
  const url=new URL(location.href);url.searchParams.set('preset',preset);window.history.replaceState(null,'',url);resetCamera();
}
function resetCamera(){camera.position.set(10,9,13);orbit.target.set(0,1,0);orbit.update();}
function setMode(mode){transform.setMode(mode);document.querySelectorAll('[data-mode]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.mode===mode));button.classList.toggle('active',button.dataset.mode===mode);});}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
function endDirectDrag(cancel=false){
  const id=draggingId,pointerId=directPointerId,record=records.find(item=>item.id===id),moved=moveStarted,start=directStartPosition;
  draggingId=null;directPointerId=null;directStartPosition=null;moveStarted=false;pointerStart=null;
  if(record&&cancel&&start){record.position=[...start];applyRecord(record);syncTransformInputs();}
  if(record&&moved&&!cancel)checkpoint();
  if(orbit)orbit.enabled=true;
  if(pointerId!==null&&$('scene').hasPointerCapture(pointerId))$('scene').releasePointerCapture(pointerId);
}
function cancelTransform(){if(transform?.dragging){if(transform.object)transform.reset();transform.dragging=false;orbit.enabled=true;}}
function removeSelected(){if(!selected())return;endDirectDrag(true);cancelTransform();const id=selectedId;transform.detach();disposeEntry(entries.get(id));entries.delete(id);records=records.filter(record=>record.id!==id);selectObject(null);checkpoint();message('已删除组件，可点击“撤销”恢复。');}
function duplicateSelected(){const record=selected();if(!record)return;if(records.length>=80){message('最多放置 80 个组件。');return;}const copy=structuredClone(record);copy.id=uid();copy.name=(copy.name+' 副本').slice(0,40);copy.position[0]=number(copy.position[0]+2,-50,50,0);records.push(copy);createEntry(copy);selectObject(copy.id);checkpoint();}

function init(){
  renderer=new THREE.WebGLRenderer({canvas:$('scene'),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  scene=new THREE.Scene();scene.background=new THREE.Color('#f0f3f7');camera=new THREE.PerspectiveCamera(45,1,.1,200);
  orbit=new OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;orbit.minDistance=2;orbit.maxDistance=65;orbit.maxPolarAngle=Math.PI*.49;
  scene.add(new THREE.HemisphereLight(0xffffff,0x6b7b98,2));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(6,12,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20,far:60});sun.shadow.bias=-.0005;scene.add(sun);
  floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshStandardMaterial({color:'#e6ebf1',roughness:.9}));floor.rotation.x=-Math.PI/2;floor.position.y=-.025;floor.receiveShadow=true;scene.add(floor);
  grid=new THREE.GridHelper(50,50,0xb4bcc9,0xd0d7e2);scene.add(grid);
  transform=new TransformControls(camera,renderer.domElement);transform.setSize(.85);scene.add(transform.getHelper());
  selectionBox=new THREE.BoxHelper(new THREE.Object3D(),0xeb6547);selectionBox.visible=false;scene.add(selectionBox);
  transform.addEventListener('dragging-changed',event=>{orbit.enabled=!event.value;wasTransforming=event.value||wasTransforming;if(!event.value){syncFromRoot();checkpoint();setTimeout(()=>wasTransforming=false,0);}});
  transform.addEventListener('objectChange',syncFromRoot);
  const resize=()=>{const {width,height}=$('viewport').getBoundingClientRect();renderer.setSize(Math.max(width,1),Math.max(height,1),false);camera.aspect=Math.max(width,1)/Math.max(height,1);camera.updateProjectionMatrix();};new ResizeObserver(resize).observe($('viewport'));resize();
  renderer.setAnimationLoop(()=>{orbit.update();renderer.render(scene,camera);});
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();message('绘图暂时中断，请刷新页面；本地保存的场景仍可恢复。');});
  setupUI();loadPreset(preset);setMode('translate');setSnap();document.documentElement.dataset.ready='true';
}
function setSnap(){const enabled=$('snap-grid').checked;transform.setTranslationSnap(enabled?.5:null);transform.setRotationSnap(enabled?Math.PI/12:null);transform.setScaleSnap(enabled?.1:null);}
function setupUI(){
  $('palette').replaceChildren(...CATALOG.map(item=>{const button=document.createElement('button');button.type='button';button.draggable=true;button.className='palette-item';button.dataset.type=item.type;button.setAttribute('aria-label',`添加${item.label}`);const icon=document.createElement('span');icon.className='palette-icon';icon.textContent=item.icon;const copy=document.createElement('span');const title=document.createElement('strong');title.className='palette-name';title.textContent=item.label;const detail=document.createElement('small');detail.className='palette-description';detail.textContent=item.constructor;copy.append(title,detail);button.append(icon,copy);button.addEventListener('dragstart',event=>{event.dataTransfer.setData('application/x-three-component',item.type);event.dataTransfer.setData('text/plain',item.type);event.dataTransfer.effectAllowed='copy';$('viewport').classList.add('drop-active');$('drop-hint').hidden=false;});button.addEventListener('dragend',()=>{$('viewport').classList.remove('drop-active');$('drop-hint').hidden=true;});button.addEventListener('click',()=>addObject(item.type));return button;}));
  const fieldNodes=[];for(const [field,label,min,max,step]of [['position','位置',-50,50,.1],['rotation','旋转（度）',-360,360,1],['scale','缩放',.1,10,.1]]){const group=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent=label;group.append(legend);for(const [axis,index]of ['X','Y','Z'].map((axis,index)=>[axis,index])){const wrap=document.createElement('label'),input=document.createElement('input');wrap.textContent=axis;input.type='number';input.min=min;input.max=max;input.step=step;input.dataset.field=field;input.dataset.axis=index;input.setAttribute('aria-label',`${label} ${axis}`);wrap.append(input);group.append(wrap);}fieldNodes.push(group);}$('transform-fields').replaceChildren(...fieldNodes);
  $('property-form').addEventListener('submit',event=>event.preventDefault());
  $('property-form').addEventListener('input',event=>{
    const record=selected(),input=event.target;if(!record||input.tagName!=='INPUT')return;
    if(input.dataset.field){if(input.value==='')return;const field=input.dataset.field,axis=Number(input.dataset.axis);record[field][axis]=number(input.value,field==='scale'?.1:field==='rotation'?-360:-50,field==='scale'?10:field==='rotation'?360:50,record[field][axis]);}
    else switch(input.id){case 'object-name':record.name=input.value.slice(0,40);break;case 'object-color':record.color=input.value;break;case 'object-visible':record.visible=input.checked;break;case 'object-wireframe':record.wireframe=input.checked;break;case 'object-roughness':record.roughness=number(input.value,0,1,.5);break;case 'object-metalness':record.metalness=number(input.value,0,1,0);break;case 'light-intensity':record.intensity=number(input.value,0,20,5);break;case 'light-distance':record.distance=number(input.value,0,100,20);break;}
    applyRecord(record);if(input.id==='object-visible'){if(record.visible)transform.attach(entries.get(record.id).root);else transform.detach();}renderList();
  });
  $('property-form').addEventListener('change',()=>{checkpoint();renderProperties();});
  const viewport=$('viewport');viewport.addEventListener('dragover',event=>{if(![...event.dataTransfer.types].some(type=>['application/x-three-component','text/plain'].includes(type)))return;event.preventDefault();event.dataTransfer.dropEffect='copy';viewport.classList.add('drop-active');});viewport.addEventListener('dragleave',event=>{if(!viewport.contains(event.relatedTarget)){viewport.classList.remove('drop-active');$('drop-hint').hidden=true;}});viewport.addEventListener('drop',event=>{event.preventDefault();viewport.classList.remove('drop-active');$('drop-hint').hidden=true;const type=event.dataTransfer.getData('application/x-three-component')||event.dataTransfer.getData('text/plain');if(types.has(type))addObject(type,dropPosition(event.clientX,event.clientY));});
  const canvas=$('scene');
  // 抓住物体本身可沿地面移动；彩色坐标轴支持三维变换。
  canvas.addEventListener('pointerdown',event=>{if(event.button!==0||transform.axis||transform.dragging)return;const id=hitObject(event);pointerStart={x:event.clientX,y:event.clientY,id};if(id){selectObject(id);if(transform.mode==='translate'){draggingId=id;directPointerId=event.pointerId;directStartPosition=[...selected().position];dragOffset.copy(entries.get(id).root.position).sub(dropPosition(event.clientX,event.clientY));orbit.enabled=false;canvas.setPointerCapture(event.pointerId);}}},true);
  canvas.addEventListener('pointermove',event=>{if(!draggingId||!pointerStart)return;if(Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y)<4&&!moveStarted)return;const record=records.find(item=>item.id===draggingId);if(!record){endDirectDrag(true);return;}moveStarted=true;const point=dropPosition(event.clientX,event.clientY).add(dragOffset);record.position[0]=number(point.x,-50,50,0);record.position[2]=number(point.z,-50,50,0);if($('snap-grid').checked){record.position[0]=Math.round(record.position[0]*2)/2;record.position[2]=Math.round(record.position[2]*2)/2;}applyRecord(record);syncTransformInputs();});
  function finishPointer(event){if(draggingId){endDirectDrag(event.type==='pointercancel');}else if(pointerStart&&!pointerStart.id&&!wasTransforming&&Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y)<4)selectObject(null);pointerStart=null;}
  canvas.addEventListener('pointerup',finishPointer);canvas.addEventListener('pointercancel',finishPointer);canvas.addEventListener('lostpointercapture',()=>{if(draggingId)endDirectDrag(true);});
  document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.mode)));
  $('undo').addEventListener('click',()=>{if(historyIndex<=0)return;historyIndex--;replaceScene(JSON.parse(history[historyIndex]));persist();updateHistory();});$('redo').addEventListener('click',()=>{if(historyIndex>=history.length-1)return;historyIndex++;replaceScene(JSON.parse(history[historyIndex]));persist();updateHistory();});
  $('duplicate').addEventListener('click',duplicateSelected);$('delete-object').addEventListener('click',removeSelected);
  $('reset-scene').addEventListener('click',()=>{replaceScene({version:1,objects:PRESETS[preset].objects});checkpoint();message('已恢复练习起点，可点击“撤销”恢复你的作品。');});
  $('reset-camera').addEventListener('click',resetCamera);$('preset-select').addEventListener('change',event=>{closePanels();loadPreset(event.target.value);});$('snap-grid').addEventListener('change',setSnap);$('show-grid').addEventListener('change',event=>grid.visible=event.target.checked);
  $('open-code').addEventListener('click',()=>{$('generated-code').textContent=sceneToCode(records);$('code-dialog').showModal();});$('close-code').addEventListener('click',()=>$('code-dialog').close());
  $('copy-code').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('generated-code').textContent);message('已复制 Three.js 代码。');}catch{const selection=window.getSelection(),range=document.createRange();range.selectNodeContents($('generated-code'));selection.removeAllRanges();selection.addRange(range);try{if(!document.execCommand('copy'))throw new Error();message('已复制 Three.js 代码。');}catch{message('请在代码窗口按 Ctrl+C 复制选中的代码。');}}});
  $('export-json').addEventListener('click',()=>downloadBlob(new Blob([JSON.stringify({version:1,objects:records},null,2)],{type:'application/json'}),'threejs-scene.json'));
  $('import-json').addEventListener('click',()=>$('import-file').click());$('import-file').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>1024*1024)throw new Error('场景文件不能超过 1 MB。');const next=normalizeScene(JSON.parse(await file.text()));replaceScene(next);checkpoint();message(`已导入 ${records.length} 个组件，可撤销本次导入。`);}catch(error){message('导入失败：'+(error instanceof SyntaxError?'请选择有效的 JSON 场景文件。':error.message));}finally{event.target.value='';}});
  $('download-project').addEventListener('click',async()=>{const button=$('download-project');button.disabled=true;try{await downloadLesson({id:'drag-scene',title:'我的 Three.js 拖拽作品',summary:'从拖拽组件生成的独立 Three.js 场景。',exercise:{task:'修改 main.js 中的颜色、位置与缩放，观察效果。',hint:'每个 mesh 都对应你放置的一个组件。'}},sceneToCode(records));message('已下载完整项目，解压后按 README 启动。');}catch(error){message('下载失败：'+error.message);}finally{button.disabled=false;}});
  $('toggle-library').addEventListener('click',()=>togglePanel('library'));$('toggle-properties').addEventListener('click',()=>togglePanel('properties'));$('close-library').addEventListener('click',closePanels);$('close-properties').addEventListener('click',closePanels);$('panel-backdrop').addEventListener('click',closePanels);
  document.addEventListener('keydown',event=>{if($('code-dialog').open||event.target.closest('input,textarea,select,[contenteditable="true"]'))return;if(event.key==='Escape'){closePanels();selectObject(null);}if(event.ctrlKey||event.metaKey){if(event.key.toLowerCase()==='z'){event.preventDefault();$(event.shiftKey?'redo':'undo').click();}else if(event.key.toLowerCase()==='y'){event.preventDefault();$('redo').click();}return;}const modes={w:'translate',e:'rotate',r:'scale'};if(modes[event.key.toLowerCase()]){event.preventDefault();setMode(modes[event.key.toLowerCase()]);}if(event.key==='Delete'){event.preventDefault();removeSelected();}});
}

try{init();}catch(error){$('scene-message').hidden=false;$('scene-message').textContent='场景未能启动：'+error.message;$('status-text').textContent='请确认浏览器开启了硬件加速，再刷新重试。';console.error(error);}
