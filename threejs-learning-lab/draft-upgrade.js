// 逐行注释上线前（4fe5404）的标准源码指纹，只用于识别浏览器自动保存的未修改示例。
// 长度与两个独立散列同时匹配才升级；不按去注释后的相似度判断，避免覆盖学生修改。
const previousSources = {
  'first-scene': ["1330:wt36g8:m7creg","1327:16ifvwm:19bbisi"],
  'variables-properties': ["1555:pyrai9:i0syiz","1555:1954stg:1ko901s"],
  'draw-circle': ["1259:1y0vao4:vsdbf8","1259:i05ume:3bopum"],
  'draw-box': ["1241:1g2x0n9:c1rsdb","1237:162y2ig:9qbajg"],
  'functions-parameters': ["1503:1bv5dch:ksfww9","1503:xnh3ya:18vecby"],
  'circle-and-sphere': ["1449:6x0lzg:kz2u8a","1447:1jf39f8:ebk212"],
  'coordinates': ["1313:zjbauf:bzocxd","1313:jslj6m:1ygum9e"],
  'rotation': ["1361:d4u91p:1fv59q3","1362:14nu6ma:2poclm"],
  'scale': ["1444:82u3sk:hrdbww","1442:sjmt9f:f23p1l"],
  'perspective-camera': ["1229:1rr3c84:191fxx0","1229:a29xv4:1kkfrg4"],
  'arrays-loops': ["1528:1d1x6ar:1e60k4d","1536:ustkn8:1yao2rw"],
  'orthographic-camera': ["1546:i70nrf:ara1bz","1546:1gqm80s:1gvypby"],
  'orbit-controls': ["1575:i6g9c5:ml9blv","1574:8zq84f:1rs1eqj"],
  'groups': ["1811:gnaquy:j6gg3a","1838:f31pv:yszs1z"],
  'materials': ["1926:1t9uid5:ijb9kz","1926:1lgdxnn:w0ksjt"],
  'lights': ["1774:1f18e5r:ko0n91","1775:13gb0ly:1lsftq0"],
  'shadows': ["1989:w3yn13:19lzllt","1990:1pzl6he:43v1l6"],
  'image-textures': ["1719:1l5uhs6:1oiuvta","1717:kamsnq:18hnfda"],
  'uv-repeat': ["1857:1swrv9o:nkduku","1857:1v16qk4:1uwisum"],
  'canvas-textures': ["1984:eomvmd:1qq7uk3","1982:1tro5tr:c0snip"],
  'animation': ["1510:19bhv9g:1s57f14","1510:113c14h:f9jbel"],
  'curve-motion': ["1835:us2r74:1x6a7am","1835:85plo1:16ah6rv"],
  'events-conditions': ["1802:1sof0lq:wmqev0","1802:1mhh0dl:t0uok3"],
  'raycasting': ["2368:106b9rr:pyoftd","2368:10lqlph:b5qwjr"],
  'gltf-model': ["1886:1envrys:1odcwny","1896:1yq41vw:100aqok"],
  'loading-feedback': ["2431:qeed56:10t2h00","2445:1gm8fj8:14hu5qi"],
  'responsive': ["1508:jvy23z:1t839oh","1508:1jfj0zl:g3ojoh"],
  'instancing': ["2189:1xdi0gs:w0y2c8","2189:10jy243:hrrdi5"],
  'factory-layout': ["4115:10y98ap:tciypn","4117:17uptjj:1ti7ggr"],
  'factory-materials': ["4699:2g5wj4:g8fhj4","4699:9x4f82:v3lmte"],
  'factory-status': ["5086:1sw7onx:1gf3ibn","5086:qeh2z3:10ducw1","1569:oexyg2:pl3vug"],
  'production-layout': ["3988:u24boc:1y85slu","3988:1ejy6xb:n2o2k5"],
  'production-motion': ["4129:eiogrn:b2r8l5","4129:57pfg9:bw6ccb"],
  'production-controls': ["4895:b1fzpn:1m08m57","4896:w5l39v:3oedv1","1547:1xf498a:v1u5ai"],
  'exhibition-space': ["3862:zh3mqr:1tn9817","3862:b82ax1:f26tr9"],
  'exhibition-posters': ["4627:to2s4s:szm5j4","4630:12spdhm:1ugz0oc"],
  'exhibition-walk': ["5912:9fpp43:92j4rb","5912:18ztp9u:d87wpg","1551:1i1ysi0:f0u2qq"],
  'equipment-build': ["3873:12yumj7:kz6wq7","3873:kaj9qp:9q4gun"],
  'equipment-pick': ["4610:1y9e6if:17y5jq3","4610:1sxxk2g:18rx72y"],
  'equipment-status': ["5452:1aheb3y:1gdn1s2","5452:1rg2nh:16rtbnr","1570:12x62z0:zbk41o"],
  'energy-layout': ["3434:4zimxb:1azrbgd","3459:ezren5:pqednz"],
  'energy-flow': ["4199:ga5idb:1s2kelr","4200:1o50z0:og1tbo"],
  'energy-dashboard': ["5027:k5ouj5:w2r40p","5027:xe1i9c:1c3xrku","1575:i132lr:182r1ov"],
};

function fingerprint(code) {
  const source = code.replace(/\r\n/g, '\n');
  let first = 2166136261, second = 5381;
  for (let index = 0; index < source.length; index++) {
    const character = source.charCodeAt(index);
    first = Math.imul(first ^ character, 16777619);
    second = Math.imul(second, 33) ^ character;
  }
  return source.length + ':' + (first >>> 0).toString(36) + ':' + (second >>> 0).toString(36);
}

export function upgradeAnnotatedDrafts(lessons, drafts) {
  let upgraded = 0;
  for (const lesson of lessons) {
    const draft = drafts[lesson.id];
    if (typeof draft !== 'string' || !previousSources[lesson.id]) continue;
    const variant = previousSources[lesson.id].indexOf(fingerprint(draft));
    const replacement = [lesson.code, lesson.solutionCode, lesson.challenge?.code][variant];
    if (typeof replacement !== 'string') continue;
    drafts[lesson.id] = replacement;
    upgraded++;
  }
  return upgraded;
}
