import foundations from './courses/foundations.js';
import projects from './courses/projects.js';
import {downloadLesson} from './download.js';
import {getApiGuide} from './api-guide.js';

const lessons=[...foundations,...projects];
const $=id=>document.getElementById(id);
const editor=$('editor');
const codeDialog=$('code-dialog');
const storageKey='threejs-learning-lab:v1';
let saved={drafts:{},modes:{},completed:[],lessonId:lessons[0].id};
try{const value=JSON.parse(localStorage.getItem(storageKey)||'null');if(value&&typeof value==='object')saved={...saved,...value,drafts:value.drafts&&typeof value.drafts==='object'?value.drafts:{},modes:value.modes&&typeof value.modes==='object'?value.modes:{},completed:Array.isArray(value.completed)?value.completed:[]};}catch{/* 禁用存储时课程仍然可以运行。 */}
let current,runToken='',runCode='',saveTimer,toastTimer,runTimeout,challengeActive=false;
let storageWarned=false;
let activeTab=null,returnToPreview=false;
const escape=text=>String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3200);}
function persist(){
  if(current){saved.drafts[current.id]=editor.value;saved.modes[current.id]=challengeActive;}
  try{localStorage.setItem(storageKey,JSON.stringify(saved));}
  catch{if(!storageWarned){toast('浏览器暂时无法保存进度，你仍可下载练习保留代码。');storageWarned=true;}}
}
function paintCode(){
  const source=editor.value;
  const pattern=/\/\/[^\n]*|\/\*[\s\S]*?\*\/|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|\b(?:import|from|const|let|var|new|function|return|if|else|for|of|in|while|async|await|export|default|true|false|null|throw|try|catch|class|extends|this|typeof)\b|\b\d+(?:\.\d+)?\b/g;
  let markup='',position=0;
  for(const match of source.matchAll(pattern)){
    markup+=escape(source.slice(position,match.index));
    const word=match[0],kind=word.startsWith('//')||word.startsWith('/*')?'comment':/^['"`]/.test(word)?'string':/^\d/.test(word)?'number':'keyword';
    markup+=`<span class="token ${kind}">${escape(word)}</span>`;position=match.index+word.length;
  }
  $('code-highlight').innerHTML=markup+escape(source.slice(position))+'\n';
  $('line-numbers').textContent=Array.from({length:source.split('\n').length},(_,i)=>i+1).join('\n');
  syncScroll();
  $('editor-status').textContent=`JavaScript · ${source.split('\n').length} 行 · 修改后点击运行`;
}
function syncScroll(){
  $('code-highlight').scrollTop=editor.scrollTop;
  $('code-highlight').scrollLeft=editor.scrollLeft;
  $('line-numbers').scrollTop=editor.scrollTop;
}
function focusCode(){
  const position=editor.value.indexOf(current.focus||'// 4.');
  if(position<0)return;
  const line=editor.value.slice(0,position).split('\n').length;
  editor.scrollTop=Math.max(0,(line-3)*parseFloat(getComputedStyle(editor).lineHeight));syncScroll();
  $('editor-status').textContent=`本课重点：第 ${line} 行起 · 修改后运行`;
}
function openCode(){
  closeSidebar();
  if(!codeDialog.open)codeDialog.showModal();
  $('open-code').setAttribute('aria-expanded','true');
  requestAnimationFrame(()=>{paintCode();focusCode();editor.focus({preventScroll:true});});
}
function closeCode(){if(codeDialog.open)codeDialog.close();}
function renderProgress(){
  const count=lessons.filter(lesson=>saved.completed.includes(lesson.id)).length;
  $('progress-text').textContent=`已学 ${count} / ${lessons.length}`;
  $('progress-bar').style.width=`${count/lessons.length*100}%`;
  const track=$('progress-bar').parentElement;
  track.removeAttribute('aria-hidden');track.setAttribute('role','progressbar');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax',String(lessons.length));track.setAttribute('aria-valuenow',String(count));track.setAttribute('aria-label','学习进度');
  if(current){const completed=saved.completed.includes(current.id);$('complete-lesson').textContent=completed?'✓ 已标记学会':'标记本课已学';$('complete-lesson').classList.toggle('completed',completed);$('complete-lesson').setAttribute('aria-pressed',String(completed));}
}
function renderNavigation(){
  const query=$('course-search').value.trim().toLowerCase();
  const groups=new Map();
  for(const [index,lesson]of lessons.entries()){
    if(query&&!`${lesson.title} ${lesson.chapter} ${lesson.summary} ${lesson.goals.join(' ')}`.toLowerCase().includes(query))continue;
    if(!groups.has(lesson.chapter))groups.set(lesson.chapter,[]);
    groups.get(lesson.chapter).push({lesson,index});
  }
  $('course-list').replaceChildren();
  for(const [chapter,items]of groups){
    const section=document.createElement('section');section.className='course-group';
    const heading=document.createElement('h3');heading.className='chapter-title';heading.textContent=chapter;section.append(heading);
    for(const {lesson,index}of items){
      const button=document.createElement('button');button.type='button';button.className='lesson-link';button.dataset.lesson=lesson.id;
      const completed=saved.completed.includes(lesson.id);button.classList.toggle('completed',completed);button.classList.toggle('active',current?.id===lesson.id);
      if(current?.id===lesson.id)button.setAttribute('aria-current','page');
      button.innerHTML=`<span class="lesson-index">${completed?'✓':String(index+1).padStart(2,'0')}</span><span class="lesson-name">${escape(lesson.title)}<span class="lesson-meta">${escape(lesson.level)} · ${lesson.minutes} 分钟</span></span>`;
      button.addEventListener('click',()=>selectLesson(lesson.id));section.append(button);
    }
    $('course-list').append(section);
  }
  if(!groups.size){const empty=document.createElement('p');empty.className='empty-search';empty.textContent='没有找到课程，试试“相机”“纹理”或“动画”。';$('course-list').append(empty);}
  renderProgress();
}
function setTab(name){
  activeTab=name;
  const exercise=name==='exercise';
  $('lesson-notes').hidden=!name;
  $('lesson-panel').hidden=name!=='lesson';$('exercise-panel').hidden=!exercise;
  for(const [id,selected]of [['lesson-tab',name==='lesson'],['exercise-tab',exercise]]){$(id).setAttribute('aria-selected',String(selected));$(id).setAttribute('aria-expanded',String(selected));$(id).classList.toggle('active',selected);}
}
function renderGuideList(id,items){
  $(id).replaceChildren(...items.map(([name,value,description])=>{const item=document.createElement('article');item.className='api-item';const title=document.createElement('div');title.className='api-item-title';const nameElement=document.createElement('code');nameElement.textContent=name;const valueElement=document.createElement('span');valueElement.textContent=value;title.append(nameElement,valueElement);const detail=document.createElement('p');detail.textContent=description;item.append(title,detail);return item;}));
}
function renderApiGuide(){
  const guide=getApiGuide(current);$('api-summary').textContent=guide.summary;renderGuideList('api-list',guide.apis);renderGuideList('parameter-list',guide.parameters);renderGuideList('config-list',guide.config);$('principle-list').replaceChildren(...guide.principles.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
}
function paragraphs(element,texts){element.replaceChildren(...texts.map(text=>{const p=document.createElement('p');p.textContent=text;return p;}));}
function getPrompt(){return`我正在从零学习 Three.js，目前学习“${current.title}”。\n学习目标：${current.goals.join('；')}。\n当前练习：${challengeActive?current.challenge.brief:current.exercise.task}\n请先用初学者能理解的中文解释这个知识点，再分步提示我修改下面的代码。先给提示，等我尝试后再提供完整答案。不要使用其他项目、电脑绝对路径或额外框架。\n\n我的代码：\n${editor.value}`;}
async function copyPrompt(){
  const text=getPrompt();
  try{await navigator.clipboard.writeText(text);toast('已复制本课学习提示词和你的当前代码。');}
  catch{
    const field=document.createElement('textarea');field.value=text;field.style.cssText='position:fixed;left:-9999px';document.body.append(field);field.select();const ok=document.execCommand('copy');field.remove();toast(ok?'已复制本课学习提示词。':'复制受限，请从提示词框中手动复制。');
  }
}
function selectLesson(id,{scroll=false}={}){
  const lesson=lessons.find(item=>item.id===id);if(!lesson)return;
  closeCode();
  clearTimeout(saveTimer);persist();current=lesson;saved.lessonId=id;challengeActive=!!lesson.challenge&&!!saved.modes[id];
  const index=lessons.indexOf(lesson);
  $('lesson-number').textContent=`LESSON ${String(index+1).padStart(2,'0')} / ${lessons.length}`;
  $('lesson-title').textContent=lesson.title;$('lesson-summary').textContent=lesson.summary;
  const dragPreset=({factory:'workshop',production:'production',exhibition:'exhibition',equipment:'maintenance',energy:'energy'})[lesson.project]||(/material|texture|uv/.test(lesson.id)?'materials':/light|shadow/.test(lesson.id)?'lights':'basics');
  $('drag-practice').href=`./drag-lab/?preset=${dragPreset}`;
  $('code-dialog-title').textContent=`${lesson.title} · 代码`;
  $('lesson-level').textContent=lesson.level;$('lesson-duration').textContent=`约 ${lesson.minutes} 分钟`;
  $('lesson-goals').replaceChildren(...lesson.goals.map(goal=>{const li=document.createElement('li');li.textContent=goal;return li;}));
  paragraphs($('lesson-explanation'),lesson.explanation);
  renderExercise();renderChallenge();renderApiGuide();
  editor.value=typeof saved.drafts[id]==='string'?saved.drafts[id]:lesson.code;
  editor.scrollTop=0;editor.scrollLeft=0;paintCode();setTab(null);
  $('prev-lesson').disabled=index===0;$('next-lesson').disabled=index===lessons.length-1;
  history.replaceState(null,'',`#${encodeURIComponent(id)}`);renderNavigation();persist();closeSidebar();runPreview();
  requestAnimationFrame(focusCode);
  if(scroll)$('course-list').querySelector('[aria-current="page"]')?.scrollIntoView({block:'nearest'});
}
function renderExercise(){
  const exercise=challengeActive?{task:current.challenge.brief,hint:current.challenge.steps.map((step,i)=>`${i+1}. ${step}`).join('\n'),solution:'自检标准：\n'+current.challenge.criteria.map(item=>'• '+item).join('\n')}:current.exercise;
  $('exercise-task').textContent=exercise.task;$('hint-content').textContent=exercise.hint;$('hint-content').hidden=true;
  $('hint-toggle').setAttribute('aria-expanded','false');$('hint-toggle').textContent='给我一点提示';
  $('solution-content').replaceChildren();$('solution-content').hidden=true;
  $('solution-toggle').setAttribute('aria-expanded','false');$('solution-toggle').textContent='查看参考思路';
  const solution=document.createElement('p');solution.textContent=exercise.solution;$('solution-content').append(solution);
  const button=document.createElement('button');button.type='button';button.className='small-button';button.textContent=challengeActive?'载入完整参考项目':'载入参考代码';
  button.addEventListener('click',()=>{editor.value=challengeActive?current.code:current.solutionCode;paintCode();persist();openCode();runPreview();toast('已载入参考代码，你还可以继续修改。');});$('solution-content').append(button);
}
function renderChallenge(){
  challengeSection.replaceChildren();challengeSection.hidden=!current.challenge;
  if(!current.challenge)return;
  const summary=document.createElement('summary');summary.textContent='毕业挑战：从空白场景完成这个项目';
  const brief=document.createElement('p');brief.textContent=current.challenge.brief;
  const list=document.createElement('ol');for(const step of current.challenge.steps){const li=document.createElement('li');li.textContent=step;list.append(li);}
  const note=document.createElement('p');note.textContent='先自己实现，再按提示中的标准检查。需要时可载入完整参考项目。';
  const button=document.createElement('button');button.type='button';button.className='small-button';button.textContent='从空白场景开始挑战';
  button.addEventListener('click',()=>{challengeActive=true;editor.value=current.challenge.code;renderExercise();paintCode();persist();openCode();runPreview();setTab('exercise');toast('已进入独立挑战，按任务逐步搭建你的作品。');});
  challengeSection.append(summary,brief,list,note,button);
}
function translateError(message){
  return String(message).replace(/([\w$]+) is not defined/g,'找不到变量 $1，请检查拼写以及是否先创建了它').replace('Unexpected token','出现无法识别的符号').replace('Unexpected end of input','代码似乎没有写完，请检查括号和引号').replace('Failed to fetch dynamically imported module','代码或依赖加载失败，请确认通过 HTTP 服务访问');
}
function runPreview({closeEditor=false}={}){
  returnToPreview=closeEditor;
  clearTimeout(runTimeout);persist();runToken=`${Date.now()}-${Math.random().toString(36).slice(2)}`;runCode=editor.value;
  $('error-panel').hidden=true;$('error-panel').textContent='';
  $('preview-status').textContent='正在运行…';$('preview-status').dataset.state='loading';
  $('preview-frame').contentWindow?.postMessage({type:'dispose'},location.origin);
  $('preview-frame').src=`./preview.html?run=${encodeURIComponent(runToken)}`;
  runTimeout=setTimeout(()=>{if($('preview-status').dataset.state==='loading'){$('preview-status').textContent='加载较慢，可稍后重新运行';$('preview-status').dataset.state='error';}},15000);
}
window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==$('preview-frame').contentWindow)return;
  const data=event.data;if(data?.source!=='threejs-learning-preview'||data.runToken!==runToken)return;
  if(data.type==='ready'){$('preview-frame').contentWindow.postMessage({type:'run',runToken,code:runCode},location.origin);}
  else if(data.type==='success'){clearTimeout(runTimeout);if($('error-panel').hidden){$('preview-status').textContent='运行正常';$('preview-status').dataset.state='success';if(returnToPreview)closeCode();returnToPreview=false;}}
  else if(data.type==='error'){
    clearTimeout(runTimeout);returnToPreview=false;$('preview-status').textContent='检查一下代码';$('preview-status').dataset.state='error';
    const line=String(data.stack).match(/lesson-code\.js:(\d+):(\d+)/);
    $('error-panel').textContent=`${line?`第 ${line[1]} 行：`:''}${translateError(data.message)}。修改后点击“运行”，或用“重置”回到本课示例。`;$('error-panel').hidden=false;
    openCode();
  }
});
function closeSidebar(){document.body.classList.remove('sidebar-open');$('sidebar').classList.remove('open');$('menu-toggle').setAttribute('aria-expanded','false');}
function closeApi(){document.body.classList.remove('api-open');$('api-panel').classList.remove('open');$('toggle-api').setAttribute('aria-expanded','false');}
editor.addEventListener('input',()=>{paintCode();clearTimeout(saveTimer);saveTimer=setTimeout(persist,300);});
editor.addEventListener('scroll',syncScroll);
editor.addEventListener('keydown',event=>{
  if(event.key==='Tab'&&!event.shiftKey){event.preventDefault();const start=editor.selectionStart,end=editor.selectionEnd;editor.setRangeText('  ',start,end,'end');editor.dispatchEvent(new Event('input'));}
});
document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();runPreview({closeEditor:codeDialog.open});}if(event.key==='Escape')closeSidebar();});
$('course-search').addEventListener('input',renderNavigation);
$('run-code').addEventListener('click',()=>runPreview({closeEditor:true}));
$('open-code').addEventListener('click',openCode);
$('toggle-api').addEventListener('click',()=>{const open=!document.body.classList.contains('api-open');document.body.classList.toggle('api-open',open);$('api-panel').classList.toggle('open',open);$('toggle-api').setAttribute('aria-expanded',String(open));});
$('close-api').addEventListener('click',closeApi);
$('close-code').addEventListener('click',closeCode);
$('finish-code').addEventListener('click',closeCode);
codeDialog.addEventListener('close',()=>{persist();$('open-code').setAttribute('aria-expanded','false');$('open-code').focus({preventScroll:true});});
codeDialog.addEventListener('click',event=>{if(event.target!==codeDialog)return;const r=codeDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeCode();});
$('reset-code').addEventListener('click',()=>{challengeActive=false;renderExercise();editor.value=current.code;paintCode();persist();runPreview();toast('已恢复本课初始示例。');});
$('hint-toggle').addEventListener('click',()=>{const show=$('hint-content').hidden;$('hint-content').hidden=!show;$('hint-toggle').textContent=show?'收起提示':'给我一点提示';$('hint-toggle').setAttribute('aria-expanded',String(show));});
$('solution-toggle').addEventListener('click',()=>{const show=$('solution-content').hidden;$('solution-content').hidden=!show;$('solution-toggle').textContent=show?'收起参考思路':'查看参考思路';$('solution-toggle').setAttribute('aria-expanded',String(show));});
$('lesson-tab').addEventListener('click',()=>setTab(activeTab==='lesson'?null:'lesson'));
$('exercise-tab').addEventListener('click',()=>setTab(activeTab==='exercise'?null:'exercise'));
$('complete-lesson').addEventListener('click',()=>{
  const completed=saved.completed.includes(current.id);
  saved.completed=completed?saved.completed.filter(id=>id!==current.id):[...saved.completed,current.id];persist();renderNavigation();toast(completed?'已取消本课标记。':'已记录学习进度。可以试着不看答案完成练习。');
});
$('prev-lesson').addEventListener('click',()=>selectLesson(lessons[lessons.indexOf(current)-1]?.id,{scroll:true}));
$('next-lesson').addEventListener('click',()=>selectLesson(lessons[lessons.indexOf(current)+1]?.id,{scroll:true}));
$('download-code').addEventListener('click',async()=>{
  const button=$('download-code');button.disabled=true;const label=button.textContent;button.textContent='正在打包…';
  try{const lesson=challengeActive?{...current,exercise:{...current.exercise,task:current.challenge.brief,hint:current.challenge.steps.join('\n')}}:current;await downloadLesson(lesson,editor.value);toast('练习已下载，含当前代码、依赖、素材和运行说明。');}
  catch(error){toast(`下载失败：${error.message}`);}
  finally{button.disabled=false;button.textContent=label;}
});
$('menu-toggle').addEventListener('click',()=>{const open=!document.body.classList.contains('sidebar-open');document.body.classList.toggle('sidebar-open',open);$('sidebar').classList.toggle('open',open);$('menu-toggle').setAttribute('aria-expanded',String(open));});
$('sidebar-close').addEventListener('click',closeSidebar);
$('sidebar-backdrop')?.addEventListener('click',closeSidebar);
const focusButton=document.createElement('button');focusButton.type='button';focusButton.className='focus-code';focusButton.textContent='本课重点';focusButton.title='定位到当前课程重点代码';focusButton.addEventListener('click',focusCode);$('run-code').before(focusButton);
const promptDetails=document.createElement('details');promptDetails.className='ai-prompt';
const challengeSection=document.createElement('details');challengeSection.className='project-challenge';$('exercise-panel').append(challengeSection);
const promptSummary=document.createElement('summary');promptSummary.textContent='用 AI 辅助理解这一课';
const promptText=document.createElement('p');promptText.textContent='复制本课目标、练习和你当前的代码，向 Codex 提问。建议先让它给提示，再自己动手尝试。';
const promptButton=document.createElement('button');promptButton.type='button';promptButton.className='small-button';promptButton.textContent='复制本课学习提示词';promptButton.addEventListener('click',copyPrompt);
promptDetails.append(promptSummary,promptText,promptButton);$('exercise-panel').append(promptDetails);
window.addEventListener('beforeunload',persist);
document.addEventListener('visibilitychange',()=>{if(document.hidden)persist();});
let requested='';try{requested=decodeURIComponent(location.hash.slice(1));}catch{}
const initial=lessons.find(item=>item.id===requested)||lessons.find(item=>item.id===saved.lessonId)||lessons[0];
selectLesson(initial.id,{scroll:true});
window.addEventListener('hashchange',()=>{let id='';try{id=decodeURIComponent(location.hash.slice(1));}catch{}if(id!==current.id)selectLesson(id,{scroll:true});});
// 仅公开课程元数据，便于维护者检查教材，不参与课程运行。
window.__learningLab={lessons:lessons.map(({id,title,chapter,level})=>({id,title,chapter,level})),getCurrent:()=>current.id};
