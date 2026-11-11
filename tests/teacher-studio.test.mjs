import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const studio=readFileSync(new URL('../public/studio/index.html',import.meta.url),'utf8');

test('Teacher Studio ships as an independent route, without modifying student navigation',()=>{
 assert.match(studio,/<title>Verbarium Studio/);
 assert.match(studio,/Criador de aulas/);
 assert.match(studio,/const TYPE_INFO=/);
 assert.match(studio,/const REMOTE_POSES=/);
 assert.match(studio,/assets\/v6/);
 assert.match(studio,/\bbootstrap\(\);/);
});

test('All ten teacher-authored activity types are available',()=>{
 for(const type of ['intro','visual','pairs','fill','sentence','listening','dialogue','speaking','explain','review']) {
  assert.match(studio,new RegExp('\\b'+type+':\\s*\\{','m'), 'missing: '+type);
 }
 assert.match(studio,/verbarium\.lesson-pack/);
 assert.match(studio,/schemaVersion:1/);
});

test('Student preview has honest oral-practice grading and safe voice fallback',()=>{
 assert.match(studio,/\['intro','explain','review','speaking'\]/);
 assert.match(studio,/speechSynthesis/);
 assert.match(studio,/studio-tts/);
 assert.match(studio,/Voice|voiceAccent/);
 assert.doesNotMatch(studio,/ELEVENLABS_API_KEY/);
 assert.match(studio,/const ESC =/);
});
