const runToken=new URLSearchParams(location.search).get('run');
let active=false;
let cleaned=false;
const frames=new Set();
const timers=new Set();
const nativeFrame=window.requestAnimationFrame.bind(window);
const nativeInterval=window.setInterval.bind(window);
window.requestAnimationFrame=callback=>{
  const id=nativeFrame(time=>{frames.delete(id);if(!cleaned)callback(time);});
  frames.add(id);
  return id;
};
window.setInterval=(callback,delay,...args)=>{const id=nativeInterval(callback,delay,...args);timers.add(id);return id;};
function send(type,payload={}){parent.postMessage({source:'threejs-learning-preview',runToken,type,...payload},location.origin);}
function report(error){send('error',{message:error?.message||String(error),stack:error?.stack||''});}
window.addEventListener('error',event=>report(event.error||new Error(event.message)));
window.addEventListener('unhandledrejection',event=>{event.preventDefault();report(event.reason);});
document.querySelector('#scene').addEventListener('webglcontextlost',event=>{if(!cleaned){event.preventDefault();report(new Error('显卡上下文已中断，请点击运行重新加载，或关闭其他较重的 3D 页面。'));}});
function cleanup(){
  if(cleaned)return;
  cleaned=true;
  frames.forEach(id=>cancelAnimationFrame(id));
  timers.forEach(id=>clearInterval(id));
  const debug=window.__lessonDebug;
  debug?.scene?.traverse?.(object=>{
    object.geometry?.dispose();
    for(const material of [].concat(object.material||[])){
      for(const value of Object.values(material))if(value?.isTexture)value.dispose();
      material.dispose();
    }
  });
  debug?.controls?.dispose?.();
  debug?.renderer?.dispose?.();
  debug?.renderer?.forceContextLoss?.();
}
window.addEventListener('pagehide',cleanup);
window.addEventListener('message',async event=>{
  if(event.origin!==location.origin||event.source!==parent)return;
  if(event.data?.type==='dispose'){cleanup();return;}
  if(event.data?.type!=='run'||active||event.data.runToken!==runToken)return;
  active=true;
  // 学员源码独立执行；仅在末尾记录对象用于切课时释放显存。
  const diagnostic=`\nwindow.__lessonDebug={scene:typeof scene!=='undefined'?scene:null,camera:typeof camera!=='undefined'?camera:null,renderer:typeof renderer!=='undefined'?renderer:null,controls:typeof controls!=='undefined'?controls:null};\n//# sourceURL=lesson-code.js\n`;
  const sourceUrl=URL.createObjectURL(new Blob([event.data.code,diagnostic],{type:'text/javascript'}));
  try{
    await import(sourceUrl);
    await new Promise(resolve=>nativeFrame(()=>nativeFrame(resolve)));
    send('success');
  }catch(error){report(error);}
  finally{URL.revokeObjectURL(sourceUrl);}
});
send('ready');
