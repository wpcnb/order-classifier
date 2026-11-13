"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=path.resolve(__dirname,".."),ctx={window:{}},source=fs.readFileSync(path.join(root,"free-star.js"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const game=fs.readFileSync(path.join(root,"game.js"),"utf8");
vm.runInNewContext(source,ctx,{filename:"free-star.js"});
const F=ctx.window.FreeStar;let done=0;
function test(name,fn){fn();done++;console.log("✓ "+done+"/10 "+name)}
function rng(seed){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296}}
test("competition configured for men only",()=>assert.equal(F.CURRENT_COMPETITION,"mens"));
test("fast creator never returns female or nonbinary",()=>{
 for(let i=1;i<=1500;i++)assert.equal(F.quickDraft(rng(i)).gender,"male")
});
test("fast creator height depends on the football position",()=>{
 for(let i=1;i<=1500;i++){
  const p=F.quickDraft(rng(i*97)),range=F.QUICK_HEIGHT[p.position];
  assert(range&&p.height>=range[0]&&p.height<=range[1])
 }
});
test("fast creator never generates 159cm outlier",()=>{
 for(let i=1;i<=1000;i++)assert(F.quickDraft(rng(i*31)).height>=165)
});
test("goalkeeper and centre-back fast profiles use appropriate bounds",()=>{
 assert.deepEqual(Array.from(F.QUICK_HEIGHT.GK),[183,203]);
 assert.deepEqual(Array.from(F.QUICK_HEIGHT.CB),[180,201])
});
test("custom creator silently coerces old female input to male for new players",()=>{
 assert.equal(F.validate({gender:"female",position:"ST"}).gender,"male");
 assert.equal(F.validate({gender:"nonbinary",position:"ST"}).gender,"male");
});
test("custom 159cm still allowed on purpose and role is retained",()=>{
 const p=F.validate({height:159,position:"LW",country:"中国"});
 assert.equal(p.height,159);assert.equal(p.gender,"male");assert.equal(p.position,"LW")
});
test("identity cannot change random potential or performance",()=>{
 const first=F.generatedProfile({gender:"male",country:"中国",skin:"fair",position:"CAM"},rng(309));
 const second=F.generatedProfile({gender:"female",country:"巴西",skin:"deep",position:"CAM"},rng(309));
 assert.equal(first.gender,"male");assert.equal(second.gender,"male");
 assert.equal(first.potential,second.potential);
 assert.equal(JSON.stringify(first.stats),JSON.stringify(second.stats))
});
test("game creator removes gender selection and declares male-only",()=>{
 assert(!game.includes('creatorSelect(id,"gender"'));
 assert(game.includes("男（固定）"));
 assert(game.includes("原有存档保持不变"));
 assert(game.includes("FS.validate(profile)"))
});
test("homepage version and local asset cache reflect change",()=>{
 assert(html.includes("版本 v9.0.0 · 更新时间 2026-11-13"));
 assert(html.includes('free-star.js?v=9.0.0'));
 assert(html.includes('game.js?v=9.0.0'))
});
assert.equal(done,10);console.log("10/10 v8.0.1 men's career creator checks passed");
