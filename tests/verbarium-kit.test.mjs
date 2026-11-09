import test from "node:test";
import assert from "node:assert/strict";
import {renderProgressRing,renderProgressBar,renderStreakWeek,renderProgressOverview,renderJourneyFlow,renderLessonMeter,renderHeroMascot} from "../src/verbarium-kit/ui.js";
test("rings clamp values and keep data readable",()=>{
 assert.match(renderProgressRing(120),/aria-valuenow="100"/);
 assert.match(renderProgressRing(-9),/aria-valuenow="0"/);
 assert.match(renderProgressBar(50),/data-vb-fill="50"/);
});
test("week streak shows real active days independently of lifetime streak",()=>{
 const days=[0,1,2,3,4,5,6].map(i=>({date:"2026-11-0"+(i+1),label:"S",active:i===1||i===4}));
 const out=renderStreakWeek(days,31);
 assert.match(out,/31 dias/);assert.match(out,/2\/7 na semana/);
 assert.equal((out.match(/is-complete/g)||[]).length,2);
});
test("overview and lesson components do not fake XP",()=>{
 const html=renderProgressOverview({completion:42,completed:5,total:12,attempts:4,accuracy:75,days:[]});
 assert.match(html,/5 de 12 aulas/);assert.doesNotMatch(html,/XP|\+50 Stars/);
 assert.match(renderLessonMeter(3,4),/75%/);
 assert.match(renderHeroMascot(),/mascot_explorer_waving\.png/);
});

test("all 112 original assets are independently published",async()=>{
 const fs=await import("node:fs");
 const manifest=JSON.parse(fs.readFileSync(new URL("../public/verbarium-assets/manifest.json",import.meta.url),"utf8"));
 assert.equal(manifest.assets.length,112);
 assert.equal(new Set(manifest.assets.map(a=>a.file)).size,112);
 assert.equal(manifest.assets.filter(a=>a.file.endsWith(".png")).length,97);
 assert.equal(manifest.assets.filter(a=>a.file.endsWith(".svg")).length,15);
 for(const a of manifest.assets)assert.ok(fs.existsSync(new URL("../public/verbarium-assets/"+a.file,import.meta.url)),a.file);
});
test("six original step assets render as a data-neutral explanation",()=>{
 const html=renderJourneyFlow();
 assert.equal((html.match(/flow\/step_marker_\d\.png/g)||[]).length,6);
 assert.doesNotMatch(html,/50 Stars|XP/);
});