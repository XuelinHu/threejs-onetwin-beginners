import foundations from '../courses/foundations.js';
import projects from '../courses/projects.js';
import {spawnSync} from 'node:child_process';
import {readFile,stat} from 'node:fs/promises';

const lessons=[...foundations,...projects],ids=new Set();
let sources=0;
for(const lesson of lessons){
  if(ids.has(lesson.id))throw new Error(`课程 ID 重复：${lesson.id}`);ids.add(lesson.id);
  for(const field of ['title','chapter','summary','code'])if(typeof lesson[field]!=='string'||!lesson[field].trim())throw new Error(`${lesson.id} 缺少 ${field}`);
  for(const field of ['goals','explanation'])if(!Array.isArray(lesson[field])||!lesson[field].length)throw new Error(`${lesson.id} 缺少 ${field}`);
  for(const field of ['task','hint','solution'])if(!lesson.exercise?.[field])throw new Error(`${lesson.id} 缺少练习 ${field}`);
  const variants=[['示例',lesson.code],['答案',lesson.solutionCode]];
  if(lesson.challenge){
    if(!lesson.challenge.brief||lesson.challenge.steps?.length<4||lesson.challenge.criteria?.length<3)throw new Error(`${lesson.id} 独立挑战内容不完整`);
    variants.push(['独立挑战',lesson.challenge.code]);
  }
  for(const [kind,code]of variants){
    if(!code)throw new Error(`${lesson.id} 缺少可运行答案`);
    if(/192\.168\.|[A-Z]:\\|onetwin|reference-runtime|https?:\/\//i.test(code))throw new Error(`${lesson.id} 引用项目以外的运行资源`);
    const check=spawnSync(process.execPath,['--input-type=module','--check'],{input:code,encoding:'utf8'});
    if(check.status!==0)throw new Error(`${lesson.id} ${kind}语法错误：${check.stderr}`);
    for(const match of code.matchAll(/['"](assets\/[^'"]+)['"]/g))await stat(new URL('../'+match[1],import.meta.url));
    sources++;
  }
  if(lesson.solutionCode===lesson.code)throw new Error(`${lesson.id} 参考答案没有体现练习变化`);
}
for(const path of ['index.html','app.js','preview.js','download.js','server.mjs']){
  const code=await readFile(new URL('../'+path,import.meta.url),'utf8');
  if(path.endsWith('.js')||path.endsWith('.mjs')){
    const check=spawnSync(process.execPath,['--input-type=module','--check'],{input:code,encoding:'utf8'});
    if(check.status!==0)throw new Error(`${path}: ${check.stderr}`);
  }
}
console.log(`通过：${foundations.length} 节基础课、${projects.length} 节综合课，${sources} 份示例、答案与挑战源码；依赖和素材均为项目内相对路径。`);
