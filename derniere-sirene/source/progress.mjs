import { atlas, badges, containment, difficulty, metz, missions, tree } from './data.mjs';
import { validCustom } from './city.mjs';

const key='derniere-sirene-v1';
const ids=new Set(badges.map(b=>b[0]));
export const defaults=()=>({v:1, records:{}, containment:{}, retries:{}, defeats:{}, skills:[], badges:[], cities:[], survival:0,
  opts:{sound:true,music:true,quality:'medium',crowd:'auto',speed:1,level:'normal'}, seen:false});

export const skillPoints = save => Object.keys(save.records).length + atlas.filter(m=>save.containment[m.id]).length - save.skills.length;
export const available = (save,id) => id===0 || !!save.records[id-1];
export const recoveryCredits = defeats => Math.max(0,Math.min(4,defeats-1))*150;
export const nextDefeats = (current,phase) => phase==='won'?0:phase==='lost'?Math.min(Number.MAX_SAFE_INTEGER,current+1):current;
export function learn(save, id) {
  if(skillPoints(save)<=0 || save.skills.includes(id) || !tree.some(branch=>{
    const step=branch.nodes.findIndex(n=>n[0]===id);
    return step===0 || (step>0 && save.skills.includes(branch.nodes[step-1][0]));
  })) return false;
  save.skills.push(id);
  award(save,'skills');
  return true;
}
export function award(save,id) {
  if(ids.has(id) && !save.badges.includes(id)) save.badges.push(id);
}
export function finish(save, game) {
  const result=game.result();
  const id=game.mission.id;
  for(const flag of game.flags) award(save,flag);
  if(id==='survival') save.survival=Math.max(save.survival,result.wave);
  if(game.mission.atlas&&id!=='atlas-local') {
    const defeats=nextDefeats(save.defeats[id]||0,game.phase);
    if(defeats) save.defeats[id]=defeats;
    else delete save.defeats[id];
  }
  if(game.phase!=='won') return result;
  for(const [badge,condition] of [
    ['first',true],['rescue',result.saved>=20],['three',result.stars===3],['perfect',result.saved===game.mission.pop],
    ['noharm',!result.friendly],['hard',game.level==='hard'],['local',typeof id==='string'&&id.startsWith('local')],
    ['special',typeof id==='string'&&!id.startsWith('local')&&id!=='survival'&&!game.mission.containment],['bank',result.money>=500]
  ]) if(condition) award(save,badge);
  if(game.mission.containment && id!=='atlas-local' && result.score>(save.containment[id]?.score??-1)) {
    save.containment[id]={stars:result.stars,saved:result.saved,score:result.score};
  }
  if(typeof id==='number') {
    const prev=save.records[id]||{stars:0,saved:0,score:0};
    save.records[id]={stars:Math.max(prev.stars,result.stars),saved:Math.max(prev.saved,result.saved),score:Math.max(prev.score,result.score)};
    if(Object.keys(save.records).length>=6) award(save,'half');
    if(id===missions.length-1) award(save,'story');
    if(Object.values(save.records).reduce((a,b)=>a+b.stars,0)>=30) award(save,'stars');
  }
  return result;
}
export function parseSave(raw) {
  const input=JSON.parse(raw);
  if(input?.v!==1 || !input.records || !Array.isArray(input.skills) || !Array.isArray(input.cities) || !Array.isArray(input.badges)) throw Error('Format de sauvegarde inconnu.');
  const data=defaults();
  for(const {id,pop} of missions) {
    const r=input.records[id];
    if(!r || !available(data,id)) break;
    if(!Number.isInteger(r.stars)||r.stars<1||r.stars>3||!Number.isInteger(r.saved)||r.saved>pop||r.saved<0||!Number.isInteger(r.score)||r.score<0) break;
    data.records[id]={stars:r.stars,saved:r.saved,score:r.score};
  }
  for(const {id,pop} of [metz,...containment,...atlas]) {
    const r=input.containment?.[id];
    if(r&&Number.isInteger(r.stars)&&r.stars>=1&&r.stars<=3&&Number.isInteger(r.saved)&&r.saved<=pop&&r.saved>=0&&Number.isSafeInteger(r.score)&&r.score>=0) {
      data.containment[id]={stars:r.stars,saved:r.saved,score:r.score};
    }
  }
  for(const {id} of atlas) {
    const count=input.retries?.[id];
    if(Number.isSafeInteger(count)&&count>0) data.retries[id]=count;
    const defeats=input.defeats?.[id];
    if(Number.isSafeInteger(defeats)&&defeats>0) data.defeats[id]=defeats;
  }
  for(const id of input.badges) if(typeof id==='string') award(data,id);
  for(const id of input.skills) if(typeof id==='string') learn(data,id);
  data.survival=Number.isSafeInteger(input.survival)&&input.survival>0?input.survival:0;
  data.seen=input.seen===true;
  for(const {name,layout,start,end,seed} of input.cities.slice(0,20).filter(c=>c && typeof c==='object')) {
    if(typeof name==='string'&&name.trim()&&validCustom(layout,start,end)&&Number.isSafeInteger(seed)) {
      data.cities.push({name:name.trim().slice(0,38),layout,start,end,seed});
    }
  }
  const o=input.opts||{};
  if(typeof o.sound==='boolean') data.opts.sound=o.sound;
  if(typeof o.music==='boolean') data.opts.music=o.music;
  if(['low','medium','high'].includes(o.quality)) data.opts.quality=o.quality;
  if(['auto','low','full'].includes(o.crowd)) data.opts.crowd=o.crowd;
  if([.5,1,2,4].includes(o.speed)) data.opts.speed=o.speed;
  if(Object.hasOwn(difficulty,o.level)) data.opts.level=o.level;
  return data;
}
export function load() {
  try { const raw=localStorage.getItem(key); return raw ? parseSave(raw) : defaults(); }
  catch { return defaults(); }
}
export function store(save) {
  try { localStorage.setItem(key,JSON.stringify(save)); return true; }
  catch { return false; }
}
