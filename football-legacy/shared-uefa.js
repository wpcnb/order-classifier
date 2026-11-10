"use strict";
/* Shared 36-club European season: one immutable league-phase fixture list,
 * one final table, one seeded knock-out tree and one champion per competition.
 * Outputs are invented football simulation results, never historical claims. */
(function(){
 const DAYS=["09-10","10-13","10-21","11-03","11-25","12-08","01-20","01-27"];
 const KODATES={"附加赛":["02-17","02-24"],"十六强":["03-10","03-17"],"八强":["04-07","04-14"],"半决赛":["05-05","05-12"],"决赛":["05-29"]};
 function table(names){return Object.fromEntries(names.map(name=>[name,{name,p:0,w:0,d:0,l:0,gf:0,ga:0,points:0}]))}
 function knockoutPair(a,b,stage,year,index,score){
  const games=[],legs=stage==="决赛"?1:2;
  for(let leg=0;leg<legs;leg++){
   const home=leg?a:b,away=leg?b:a,[hs,as]=score(home,away);
   games.push({id:"global_"+stage+"_"+index+"_"+leg,kind:"europeKO",
    date:(year+1)+"-"+KODATES[stage][leg],stage,leg:leg+1,home,away,hs,as});
  }
  const ga=games.reduce((v,m)=>v+(m.home===a?m.hs:m.as),0);
  const gb=games.reduce((v,m)=>v+(m.home===b?m.hs:m.as),0);
  const winner=ga>gb?a:gb>ga?b:Math.random()<.5?a:b;
  games.forEach(m=>m.winner=winner);
  return {a,b,stage,winner,ga,gb,games};
 }
 function create({year,type,participants,pool,officialTeams,officialRounds,draw,score,updateTable,ranked}){
  const official=year===2026&&type==="欧冠"&&participants.includes("曼联")&&
   Array.isArray(officialRounds)&&officialRounds.length===8&&participants.every(x=>officialTeams.includes(x));
  const clubs=official?officialTeams.slice():[...new Set([...participants,...pool])].slice(0,36);
  if(clubs.length!==36||participants.some(c=>!clubs.includes(c)))throw Error("统一欧战赛程的36支参赛球队不完整");
  const source=official?officialRounds:draw(clubs);
  const rounds=source.map((round,i)=>round.map((m,j)=>{
   const real=!!m.real||Number.isInteger(m.hs)&&Number.isInteger(m.as);
   const [hs,as]=real?[m.hs,m.as]:score(m.home,m.away);
   return {id:"eu_"+i+"_"+j,kind:"europe",round:i,date:m.date||((i>=6?year+1:year)+"-"+DAYS[i]),
    home:m.home,away:m.away,competition:type,hs,as,real,processed:false,npcAllocated:false};
  }));
  const expected=table(clubs);
  for(const r of rounds)for(const m of r)updateTable(expected,m.home,m.away,m.hs,m.as);
  const standings=ranked(expected).map(x=>x.name);
  const knockout=[],ko=[];
  function compete(teams,stage){
   const won=[];
   for(let i=0;i<teams.length;i+=2){
    const tie=knockoutPair(teams[i],teams[i+1],stage,year,i,score);
    knockout.push(tie);ko.push(...tie.games);won.push(tie.winner);
   }
   return won;
  }
  const playoff=[];for(let i=0;i<8;i++)playoff.push(standings[8+i],standings[23-i]);
  const advance=compete(playoff,"附加赛");
  const round16=[];for(let i=0;i<8;i++)round16.push(standings[i],advance[7-i]);
  const quarter=compete(round16,"十六强");
  const semifinal=compete(quarter,"八强");
  const finalPair=compete(semifinal,"半决赛");
  const champion=compete(finalPair,"决赛")[0];
  return {key:year+":"+type,year,type,clubs,rounds,table:table(clubs),knockout,ko,
   champion,standings,processedRounds:{},processedKO:{},
   source:official?"官方赛程历史比分＋游戏预测":"统一模拟赛程",verifiedHistory:official};
 }
 window.FOOTBALL_SHARED_UEFA={create};
})();