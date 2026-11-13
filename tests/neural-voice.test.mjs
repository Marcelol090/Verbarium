import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateSpeechInput,secureTokenMatches,escapeXml,buildSsml,VOICES} from '../api/studio-tts.js';
import {lipGroupForViseme,timelineAt,validateNeuralClip,FACE_ANCHORS,VISEME_COUNT} from '../public/voice/speech-sync.js';
import {clipId} from '../public/voice/approved-speech.js';

test('neural synthesis validates character, locale and voice speed',()=>{
 const input=validateSpeechInput({text:'She eats an apple.',character:'explorer',accent:'en-US',speed:0.9});
 assert.equal(input.voice,VOICES.explorer['en-US']);
 assert.equal(input.speed,0.9);
 assert.throws(()=>validateSpeechInput({text:'',character:'explorer'}));
 assert.throws(()=>validateSpeechInput({text:'x'.repeat(221),character:'explorer'}));
 assert.throws(()=>validateSpeechInput({text:'Hello',character:'evil'}));
 assert.throws(()=>validateSpeechInput({text:'Hello',character:'explorer',accent:'pt-BR'}));
 assert.throws(()=>validateSpeechInput({text:'Hello',speed:2.0}));
 assert.ok(secureTokenMatches('safe-secret-123','safe-secret-123'));
 assert.equal(secureTokenMatches('safe-secret-123','safe-secret-124'),false);
 assert.equal(secureTokenMatches('safe','different-length'),false);
});

test('SSML escapes teacher text without allowing raw tags or provider voice injection',()=>{
 const cfg=validateSpeechInput({text:'Use <voice> & "quotes"',character:'blonde',accent:'en-GB'});
 const xml=buildSsml(cfg);
 assert.ok(xml.includes('&lt;voice&gt;'));
 assert.ok(xml.includes('&amp;'));
 assert.ok(xml.includes('&quot;'));
 assert.equal(xml.includes('<voice> &'),false);
 assert.equal(escapeXml("A&B"),'A&amp;B');
 assert.ok(xml.includes('en-GB-SoniaNeural'));
});

test('viseme registry contains 22 distinct IDs, ordered by synthesized audio time',()=>{
 assert.equal(VISEME_COUNT,22);
 assert.equal(Object.keys(FACE_ANCHORS).length,12);
 for(let id=0;id<22;id++)assert.ok(lipGroupForViseme(id));
 const visemes=[{timeMs:0,id:0},{timeMs:180,id:21},{timeMs:320,id:2},{timeMs:510,id:0}];
 assert.equal(timelineAt(visemes,0),0);
 assert.equal(timelineAt(visemes,220),21);
 assert.equal(timelineAt(visemes,500),2);
 assert.equal(timelineAt(visemes,800),0);
 assert.equal(timelineAt(visemes,-1,'id',99),99);
});

test('reject malformed or suspicious audio clips',()=>{
 const clip={version:1,format:'audio/mpeg',audioBase64:'AA==',visemes:[{timeMs:0,id:0},{timeMs:100,id:2}],words:[]};
 assert.equal(validateNeuralClip(clip),true);
 assert.equal(validateNeuralClip({...clip,visemes:[{timeMs:0,id:22}]}),false);
 assert.equal(validateNeuralClip({...clip,words:null}),false);
 assert.equal(validateNeuralClip({...clip,audioBase64:'x'.repeat(3_000_001)}),false);
});

test('voice asset names are stable and do not encode untrusted text as paths',async()=>{
 const data={text:'I eat an apple.',character:'explorer',accent:'en-US'};
 const a=await clipId(data),b=await clipId(data);
 assert.equal(a,b);assert.match(a,/^[0-9a-f]{28}$/);
 assert.notEqual(a,await clipId({...data,text:'You eat an apple.'}));
});

test('Studio uses a canonical shell with interchangeable activity blocks',()=>{
 const studio=readFileSync(new URL('../public/studio/index.html',import.meta.url),'utf8');
 const script=studio.slice(studio.indexOf('<script>')+8,studio.lastIndexOf('</script>'));
 assert.doesNotThrow(()=>new Function(script));
 assert.ok(studio.includes('layoutPreset'));
 assert.ok(studio.includes('vb-shell vb-shell-'));
 assert.ok(studio.includes('speech-sync.js'));
 assert.ok(studio.includes('id="export-neural"'));
 assert.doesNotMatch(studio,/\}\s*\.replace\('<img ','<img id="student-avatar"/);
});

test('students do not receive a provider credential or call paid synthesis directly',()=>{
 const root=new URL('../public/academy/sentence-lab/',import.meta.url);
 for(const file of ['lesson.js','practice.js']){
  const s=readFileSync(new URL(file,root),'utf8');
  assert.ok(s.includes('approvedSpeech'));
  assert.ok(s.includes('playNeuralClip'));
  assert.doesNotMatch(s,/VERBARIUM_TTS_ACCESS_TOKEN|AZURE_SPEECH_KEY|\/api\/studio-tts/);
 }
});
