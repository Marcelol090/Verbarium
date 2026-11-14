import {ITEMS} from './catalog.js';
const expected=new Set(ITEMS);
/** Pure integrity gate: a manifest must name exactly the 235 expected source sprites. */
export function validateRasterManifest(data){
 if(!data||data.count!==235||!Array.isArray(data.assets)||data.assets.length!==235)return false;
 const ids=data.assets.map(x=>typeof x==='string'?x:x?.id);
 return ids.every(id=>expected.has(id))&&new Set(ids).size===235;
}
