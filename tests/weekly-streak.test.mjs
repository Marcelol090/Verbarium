import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {DAY_IDS,calendarWeek,imageForDay,renderWeekTokens,localDateKey,seedWeekActivity} from '../src/verbarium-kit/weekly-streak.js';
const base=new URL('../public/verbarium-weekly-v4/',import.meta.url);
test('each weekday has its original transparent PNGs, eight-frame WebP, and GIF',()=>{
 const manifest=JSON.parse(readFileSync(new URL('manifest.json',base),'utf8'));
 assert.deepEqual(manifest.days.map(x=>x.id),DAY_IDS);
 for(const day of manifest.days){
  for(const state of ['pending','completed']){
   const bytes=readFileSync(new URL('static/'+state+'/'+day.id+'.png',base));
   assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);
  }
  const bytes=readFileSync(new URL('animated/webp/'+day.id+'_complete.webp',base));
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.equal(day.frames,8);assert.equal(day.duration_ms,1445);
  assert.ok(existsSync(new URL('animated/gif/'+day.id+'_complete.gif',base)));
 }
});
test('Monday to Sunday calendar, not rolling seven days',()=>{
 const dates=calendarWeek(new Date(2026,10,10,12),['2026-11-09','2026-11-10']);
 assert.deepEqual(dates.map(d=>d.id),DAY_IDS);
 assert.deepEqual(dates.map(d=>d.date),['2026-11-09','2026-11-10','2026-11-11','2026-11-12','2026-11-13','2026-11-14','2026-11-15']);
 assert.deepEqual(dates.filter(d=>d.active).map(d=>d.id),['segunda','terca']);
 assert.equal(dates[6].isFuture,true);
 assert.equal((renderWeekTokens(dates).match(/class="vb4-week-day/g)||[]).length,7);
 assert.match(renderWeekTokens(dates),/static\/completed\/terca\.png/);
});
test('year rollover and semantic labels',()=>{
 const days=calendarWeek(new Date(2027,0,1,12),['2026-12-31']);
 assert.equal(days[0].date,'2026-12-28');assert.equal(days[6].date,'2027-01-03');
 assert.equal(days[3].active,true);
 assert.match(renderWeekTokens(days),/aria-label="quinta-feira/);
 assert.equal(localDateKey(new Date(2026,10,10,12)),'2026-11-10');
 assert.match(imageForDay('sabado','animated'),/sabado_complete\.webp$/);
 seedWeekActivity(['2026-11-09']);
});
test('home, weekly meta and progress all use real v4 tokens',()=>{
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 const ui=readFileSync(new URL('../src/verbarium-kit/ui.js',import.meta.url),'utf8');
 assert.match(app,/hydrateWeekTokens\(main\)/);
 assert.match(app,/renderWeekTokens\(week,/);
 assert.match(app,/renderWeekTokens\(daily,/);
 assert.match(ui,/renderWeekTokens\(cells,/);
});

test('responsive weekly tokens occupy their own row below desktop widths',()=>{
 const css=readFileSync(new URL('../src/verbarium-kit/weekly-streak.css',import.meta.url),'utf8');
 assert.match(css,/max-width:1180px/);
 assert.match(css,/order:3;flex:0 0 100%/);
 assert.match(css,/max-width:390px/);
});
