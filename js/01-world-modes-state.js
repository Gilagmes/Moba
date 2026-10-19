const particles=[];const ultimateCinematic={time:0,max:1.35,title:'',color:'#fff'}; const cam={x:0,y:0};
// Камни, стены и лесные лагеря формируют проходимую геометрию карты.
const brushZones=[
 {x:520,y:1010,w:210,h:115},{x:980,y:820,w:190,h:105},{x:1370,y:1040,w:220,h:110},
 {x:1650,y:680,w:210,h:110},{x:760,y:1510,w:220,h:90},{x:1780,y:1510,w:230,h:90}
];
function inBrush(e){return brushZones.some(b=>e.x>b.x&&e.x<b.x+b.w&&e.y>b.y&&e.y<b.y+b.h)}
function heroHiddenFromRed(observer){if(!inBrush(hero)||hero.revealed>0)return false;if(Math.hypot(observer.x-hero.x,observer.y-hero.y)<145)return false;return !botHeroes.some(b=>b.team==='red'&&!b.dead&&Math.hypot(b.x-hero.x,b.y-hero.y)<145)&&!wards.some(w=>w.team==='red'&&!w.dead&&!w.disabled&&Math.hypot(w.x-hero.x,w.y-hero.y)<240)}
function brushRevealed(e){if(!inBrush(e)||e.revealed>0)return true;if(!hero.dead&&Math.hypot(hero.x-e.x,hero.y-e.y)<150)return true;return wards.some(w=>w.team!=='red'&&!w.dead&&Math.hypot(w.x-e.x,w.y-e.y)<210)}
const mapGeometry={walls:[
 {x:430,y:350,w:250,h:105,t:'trees'},
 {x:810,y:760,w:190,h:125,t:'rock'},{x:1020,y:570,w:210,h:95,t:'trees'},
 {x:1260,y:430,w:210,h:90,t:'rock'},{x:1360,y:540,w:180,h:80,t:'trees'},
 {x:1800,y:300,w:190,h:90,t:'rock'},{x:2000,y:740,w:210,h:105,t:'rock'},
 {x:2140,y:820,w:170,h:90,t:'trees'},
 {x:620,y:990,w:230,h:105,t:'rock'},{x:850,y:1420,w:260,h:95,t:'trees'},
 {x:930,y:1280,w:170,h:90,t:'rock'},{x:1120,y:1260,w:200,h:115,t:'trees'},
 {x:1450,y:920,w:220,h:100,t:'rock'},
 {x:1610,y:1280,w:280,h:100,t:'trees'},{x:1740,y:950,w:190,h:95,t:'trees'},
 {x:1960,y:900,w:180,h:90,t:'rock'},{x:2040,y:1120,w:240,h:105,t:'trees'},
 {x:470,y:740,w:150,h:85,t:'rock'},{x:690,y:960,w:150,h:80,t:'trees'},
 {x:1160,y:700,w:155,h:85,t:'trees'},{x:1390,y:580,w:165,h:85,t:'rock'},
 {x:1660,y:420,w:160,h:85,t:'trees'},{x:1870,y:1180,w:150,h:80,t:'rock'}
]};
const obstacles=mapGeometry.walls;
const towers=[
 {x:480,y:1400,team:'blue'},{x:850,y:1180,team:'blue'},{x:1840,y:610,team:'red'},{x:2140,y:390,team:'red'},
 {x:210,y:1120,team:'blue'},{x:210,y:680,team:'blue'},{x:2390,y:680,team:'red'},{x:2390,y:1120,team:'red'},
 {x:720,y:1590,team:'blue'},{x:1160,y:1590,team:'blue'},{x:1880,y:1590,team:'red'},{x:2260,y:1590,team:'red'}
];
towers.forEach((t,i)=>{t.lane=Math.floor(i/4)%3;t.tier=([0,1,4,5,8,9].includes(i)?(i%2===0?1:2):([2,3,6,7,10,11].includes(i)?(i%2===0?1:2):1));t.tier=t.tier||1;t.hp=t.maxHp=(t.tier===2?520:420);t.cd=0;t.r=34;t.rewarded=false;t.plates=3;t.focusTarget=null;t.focusStacks=0;t.focusGrace=0;t.dead=false});
const inhibitors=[
 {x:350,y:1410,team:'blue',lane:0},{x:210,y:450,team:'blue',lane:1},{x:520,y:1590,team:'blue',lane:2},
 {x:2250,y:390,team:'red',lane:0},{x:2390,y:450,team:'red',lane:1},{x:2080,y:220,team:'red',lane:2}
].map(i=>({...i,r:30,hp:520,maxHp:520,structure:'inhibitor',dead:false,respawn:0,rewarded:false}));
const minions=[];const matchPacing={firstKill:null,firstTower:null,firstDragon:null,lastProgress:0,stallLevel:0,totalProgress:0,duration:null,quality:null,qualityAssessment:null,experiment:null};let waveTimer=3,wave=0,gameOver=false,battleTier=1,nextEscalation=60,waveInterval=30,escalationInterval=60,gameMode='classic',matchMutator='standard',siegeDifficulty='normal',randomHeroChallenge=null,matchCoachFocus=null,matchCoachFocusMode='auto',balancePreset='standard',skirmishDoctrine='control',skirmishBan='duelist',teamStrategy='balanced',gamepadMode='hero',coopAllyIndex=0,rivalType='adaptive',summonerSpell='smite',keystone='assault',rolePosition='mid',targetPriority='heroes',autoBuyEnabled=false,autoBuyTimer=1,incomeTimer=1,comebackIncome=0,platesExpired=false,raidTime=360;const expedition={stage:1,maxStage:3,time:720,transition:0,completed:false,risk:0,bonusCredits:0,routes:[],bossHpMult:1,bossDamageMult:1,extraRelic:false};const duel={blue:0,red:0,target:3,round:1,finished:false,ratingDelta:0,opponentRating:1000,division:'Искатель'};
function duelDivision(r){return r>=1800?'Эфирный чемпион':r>=1600?'Алмаз':r>=1400?'Платина':r>=1200?'Золото':r>=1000?'Серебро':'Бронза'}
const hunt={blue:0,red:0,target:15,finished:false,pickups:[],collectedBlue:0,collectedRed:0,stealsBlue:0,stealsRed:0,depositedBlue:0,depositedRed:0,maxCarryBlue:0,leadTime:0,aiCd:1,raidBlue:0,raidRed:0,raidLockBlue:0,raidLockRed:0,raidsBlue:0,raidsRed:0,stolenBlue:0,stolenRed:0,banks:{blue:{x:430,y:1390},red:{x:2170,y:410}}};
const riftball={x:1300,y:900,vx:0,vy:0,blue:0,red:0,target:5,finished:false,reset:0,lastTouch:null,kicksBlue:0,kicksRed:0,savesBlue:0,savesRed:0,time:240,overtime:false,powerTimer:18,powerups:[],ratingDelta:0,goalBlue:{x:260,y:1510},goalRed:{x:2340,y:290}};
const eclipse={x:1300,y:900,radius:1050,targetRadius:260,phase:0,phaseTimer:55,time:360,blueLives:15,redLives:15,finished:false,supplies:[],supplyTimer:18,blueSupplies:0,redSupplies:0,outsideTime:0,deathMarks:new Map(),beacon:null,beaconProgress:0,beaconLock:0,beaconsBlue:0,beaconsRed:0,rareSuppliesBlue:0,rareSuppliesRed:0,anomaly:null,ratingDelta:0,opponentRating:1000,comebackBlue:false,comebackRed:false,startLives:15};
const runeTrial={time:300,phase:1,shielded:true,shieldHp:0,vulnerable:0,finished:false,seals:[],sealsBroken:0,dustEarned:0,cycles:0,perfect:true,hazardCd:8,phaseTransitions:0,forceStacks:0};
const convergence={blue:0,red:0,target:100,time:300,objective:'altar',objectiveTimer:45,round:1,finished:false,altar:{x:1300,y:900},shards:[],markedBlue:null,deathMarks:new Map(),objectivesBlue:0,objectivesRed:0,rotations:0,momentumBlue:0,momentumRed:0,phaseBlue:0,phaseRed:0,anomaly:'surge',overtime:false,overtimeStartBlue:0,overtimeStartRed:0,ratingDelta:0,opponentRating:1000,startTarget:100,guardianAwarded:false,guardiansBlue:0,guardiansRed:0};
const tournament={stage:1,maxStage:3,lives:3,livesLost:0,wins:0,finished:false,opponents:[],enemyCounted:false,heroCounted:false,baseHp:120,baseDamage:20,boons:[],boonPending:false,victoryHeal:.35,execute:0,roundShield:0};
const overlord={time:240,maxTime:240,lives:3,targetKills:12,kills:0,deaths:0,finished:false,enrage:0,pulseCd:8,hunterDeaths:0,evolutions:[],pulsePower:1,pulseRadius:240,killHeal:0,lifeSteal:0,evolutionPending:false};
const escort={x:360,y:1460,path:[],wp:1,progress:0,time:240,maxTime:240,finished:false,overtime:false,contested:false,checkpoints:0,pushTime:0,bestPushers:0,modules:[],speedMult:1,modulePulseCd:10,shieldPulse:0,healAura:0,disruptor:0,overtimeReserve:0};
const skirmish={blue:0,red:0,target:10,finished:false,killsBlue:0,killsRed:0,streakBlue:0,streakRed:0,bestStreak:0,ratingDelta:0,opponentRating:1000,division:'Серебро',doctrine:'control',ban:'duelist',enemyPick:'hunter',surgesBlue:0,surgesRed:0,doctrineAscended:false,comebackBlue:0,comebackRed:0,event:null,eventTimer:0,nextEventAt:5,eventCount:0,lastEvent:null};
function skirmishDivision(r){return r>=1900?'Эфирная легенда':r>=1650?'Алмаз':r>=1400?'Платина':r>=1200?'Золото':r>=950?'Серебро':'Бронза'}
function updateSkirmishScores(){if((gameMode!=='skirmish'&&gameMode!=='skirmishranked')||skirmish.finished)return;for(const unit of [hero,enemy,...botHeroes]){if(unit.dead){if(!unit.skirmishDeathCounted){unit.skirmishDeathCounted=true;recordSkirmishKill(unit.team==='red'?'blue':'red')}}else unit.skirmishDeathCounted=false}}
const skirmishEvents={well:{name:'ИСТОЧНИК ЖИЗНИ',color:'#68efb0'},storm:{name:'КОЛЬЦО РАЗЛОМА',color:'#c46fff'},overdrive:{name:'ТАКТИЧЕСКАЯ ПЕРЕГРУЗКА',color:'#ffd66b'}};
function startSkirmishEvent(){const ids=Object.keys(skirmishEvents).filter(id=>id!==skirmish.lastEvent),id=ids[Math.floor(Math.random()*ids.length)];skirmish.event=id;skirmish.lastEvent=id;skirmish.eventTimer=18;skirmish.eventCount++;skirmish.nextEventAt+=5;announce('СОБЫТИЕ АРЕНЫ · '+skirmishEvents[id].name);feed('Правила боя изменены на 18 секунд')}
function updateSkirmishEvent(dt){if(!(gameMode==='skirmish'||gameMode==='skirmishranked')||!skirmish.event||skirmish.finished)return;skirmish.eventTimer-=dt;const units=[hero,enemy,...botHeroes.filter(b=>!b.dead&&b.respawn<9000)];if(skirmish.event==='well'){for(const u of units)if(!u.dead&&Math.hypot(u.x-1320,u.y-900)<235)u.hp=Math.min(u.maxHp,u.hp+u.maxHp*.025*dt)}else if(skirmish.event==='storm'){for(const u of units)if(!u.dead&&Math.hypot(u.x-1320,u.y-900)>610){if(u===hero)hurtHero(hero.maxHp*.012*dt,true,'Кольцо Разлома','true');else u.hp-=u.maxHp*.012*dt}}else{for(const k of ['Q','W','E','R'])hero.cd[k]=Math.max(0,hero.cd[k]-dt*.55);for(const b of botHeroes)if(!b.dead){b.abilityCd=Math.max(0,b.abilityCd-dt*.7);b.ultCd=Math.max(0,b.ultCd-dt*.35)}enemy.abilityCd=Math.max(0,enemy.abilityCd-dt*.7);enemy.zoneCd=Math.max(0,enemy.zoneCd-dt*.5)}if(skirmish.eventTimer<=0){feed('Событие арены завершено');skirmish.event=null;skirmish.eventTimer=0}}
function triggerCaptainSurge(team){if(!(gameMode==='skirmish'||gameMode==='skirmishranked')||skirmish.finished)return;const allies=team==='blue'?[hero,...botHeroes.filter(b=>b.team==='blue'&&!b.dead)]:[enemy,...botHeroes.filter(b=>b.team==='red'&&!b.dead)],foes=team==='blue'?[enemy,...botHeroes.filter(b=>b.team==='red'&&!b.dead)]:[hero,...botHeroes.filter(b=>b.team==='blue'&&!b.dead)];if(team==='blue'){skirmish.surgesBlue++;if(skirmish.doctrine==='assault'){for(const u of foes)u.hp-=u.maxHp*.18;announce('ПРИКАЗ КАПИТАНА · ЭФИРНЫЙ ОБСТРЕЛ')}else if(skirmish.doctrine==='control'){for(const u of foes){u.stun=Math.max(u.stun,1.15);u.slow=Math.max(u.slow,2.2)}announce('ПРИКАЗ КАПИТАНА · ВРЕМЕННАЯ ПЕТЛЯ')}else{for(const u of allies){u.hp=Math.min(u.maxHp,u.hp+u.maxHp*.32);u.shield=(u.shield||0)+u.maxHp*.14}announce('ПРИКАЗ КАПИТАНА · ЖИВОЙ РУБЕЖ')}}else{skirmish.surgesRed++;for(const u of foes){if(u===hero)hurtHero(hero.maxHp*.13,true,'Контрприказ красных','magic');else u.hp-=u.maxHp*.13;u.slow=Math.max(u.slow,1.2)}announce('КРАСНЫЙ КОНТРПРИКАЗ')}for(const u of allies)particles.push({x:u.x,y:u.y,life:1,max:1,type:'nova'});feed(`${team==='blue'?'Синие':'Красные'} активировали командный приказ`,team)}
function ascendSkirmishDoctrine(){if(skirmish.doctrineAscended)return;skirmish.doctrineAscended=true;const allies=[hero,...botHeroes.filter(b=>b.team==='blue'&&!b.dead)];if(skirmish.doctrine==='assault')for(const u of allies)u.damage=Math.round(u.damage*1.08);else if(skirmish.doctrine==='control'){hero.cdr+=.08;for(const b of allies.slice(1))b.speed*=1.1}else for(const u of allies){u.maxHp=Math.round(u.maxHp*1.08);u.hp=Math.min(u.maxHp,u.hp+u.maxHp*.25)}announce('ВОЗНЕСЕНИЕ ДОКТРИНЫ');feed('Командная стратегия достигла высшей формы','blue')}
function recordSkirmishKill(team){if((gameMode!=='skirmish'&&gameMode!=='skirmishranked')||skirmish.finished)return;if(team==='blue'){skirmish.blue++;skirmish.killsBlue++;skirmish.streakBlue++;skirmish.streakRed=0;skirmish.bestStreak=Math.max(skirmish.bestStreak,skirmish.streakBlue)}else{skirmish.red++;skirmish.killsRed++;skirmish.streakRed++;skirmish.streakBlue=0}announce(`${team==='blue'?'СИНИЕ':'КРАСНЫЕ'} · УСТРАНЕНИЕ ${skirmish.blue}:${skirmish.red}`);const teamScore=team==='blue'?skirmish.blue:skirmish.red,totalScore=skirmish.blue+skirmish.red;if(totalScore>=skirmish.nextEventAt&&!skirmish.event)startSkirmishEvent();if(teamScore>0&&teamScore%3===0)triggerCaptainSurge(team);if(skirmish.blue>=5&&!skirmish.doctrineAscended)ascendSkirmishDoctrine();if(team==='blue'&&skirmish.red-skirmish.blue>=4){skirmish.comebackBlue++;hero.gold+=180;hero.hp=Math.min(hero.maxHp,hero.hp+hero.maxHp*.18);feed('ВОЗВРАЩЕНИЕ В ИГРУ · +180 золота','blue')}else if(team==='red'&&skirmish.blue-skirmish.red>=4){skirmish.comebackRed++;enemy.hp=Math.min(enemy.maxHp,enemy.hp+enemy.maxHp*.18);feed('Красные получили бонус возвращения','red')}if(skirmish.blue===skirmish.target-1||skirmish.red===skirmish.target-1)feed('МАТЧ-ПОЙНТ · следующее устранение может решить бой');if(skirmish.blue>=skirmish.target||skirmish.red>=skirmish.target){skirmish.finished=true;setTimeout(()=>endGame(skirmish.blue>=skirmish.target),650)}}
const dominion={blue:0,red:0,target:300,finished:false,holdTime:0,capturesBlue:0,capturesRed:0,aiCd:2,crownIndex:0,crownTimer:60,blueSweep:0,redSweep:0,sweepsBlue:0,sweepsRed:0,killsBlue:0,killsRed:0,overtime:false,powersBlue:0,powersRed:0,crownPowers:0};
function recordDominionKill(team){if(gameMode!=='dominion'||dominion.finished)return;if(team==='blue'){dominion.blue+=10;dominion.killsBlue++}else{dominion.red+=10;dominion.killsRed++}floatText(team==='blue'?hero.x:enemy.x,(team==='blue'?hero.y:enemy.y)-70,'ДОМИНИОН +10',team==='blue'?'#66e7ff':'#ff7180')}
const survival={target:15,cleared:0,bossWave:0,score:0,perfect:true,finished:false,nextWaveReady:false,fortifications:{arsenal:0,bulwark:0,medbay:0,turrets:0,treasury:0,barrier:0},drafts:0,bossKills:0,mutation:'',earnedCores:0,hazardCd:10};const aetherStorm={active:false,age:0,radius:1550,x:1300,y:900,strikeCd:8},stormCore={x:1300,y:900,r:72,progress:0,cooldown:0,owner:null},stormBuffs={blue:0,red:0};
const matchTimeline=[],botPurchaseLog=[];const botNavTelemetry={recoveries:0,blockedFrames:0,maxStuck:0,separationAdjustments:0,invalidSteerInputs:0,positionRepairs:0,unitStateRepairs:0},audioTelemetry={throttled:0,stolen:0,errors:0,stops:0},effectTelemetry={particleDrops:0,essentialOverflow:0,peakParticles:0,fogRedraws:0,fogSkips:0,textMerges:0},combatIntegrityTelemetry={invalidDamage:0,invalidDamageTypes:0,invalidHealing:0,overkillCapped:0,overhealCapped:0,invalidProjectileTargets:0,invalidStatuses:0,heroStateRepairs:0,damageFeedbacks:0,damageFeedbackThrottled:0,damageByType:{incoming:{physical:0,magic:0,true:0},outgoing:{physical:0,magic:0,true:0}}};const performanceTelemetry={checks:0,fpsSum:0,minFps:null,lowDetailSeconds:0,downgrades:0,restores:0};const threatTelemetry={currentLevel:'none',lastLevel:'none',contactSeconds:0,warnSeconds:0,dangerSeconds:0,dangerEvents:0,towerEvents:0,maxDps:0,currentDps:0,survivalSeconds:null,tradeState:'none',lastTradeState:'none',riskyTradeEvents:0,riskyTradeSeconds:0,favorableTradeSeconds:0,riskyTradeStreak:0,tradeAdviceCooldown:0,tradeAdviceEvents:0,tradeAdviceResponses:0,tradeAdviceAt:null,lastAdviceResponseAt:null,tradeDefenseActions:{},tradeDefenseOutcomes:{},tradeDefenseStabilized:0,tradeDefenseUnstable:0,pendingDefenseOutcome:null,primaryDefense:null};const teamOrderTelemetry={issued:0,attack:0,retreat:0,defend:0,move:0,acknowledged:0,completed:0,cancelled:0,expired:0,superseded:0,completionSeconds:0,plannedSeconds:0,maxDuration:0,released:0,activeAck:0,progress:0,lastType:null,lastAt:0};const rivalry={enemyStreak:0,playerStreak:0,level:0,defeats:0,bonusDamage:0,bonusHp:0,ultCd:18};const stats={kills:0,deaths:0,assists:0,minions:0,towers:0,monsters:0,wards:0,contracts:0,damageTaken:0,healingDone:0,goldEarned:0,passiveGold:0,teamGold:0,damage:0,started:0,streak:0,bestStreak:0,firstBlood:false,lastKill:0,dodges:0,riverRunes:0,chaosEvents:0,rivalDefeats:0,pings:0,expeditionBosses:0,coopKills:0,attackMoveTargets:0,attackMoveLeashBreaks:0,bufferedCasts:0,executedBufferedCasts:0,replacedBufferedCasts:0,cancelledBufferedCasts:0,expiredBufferedCasts:0,resourceRejectedBufferedCasts:0,aimedBufferedCasts:0,blockedCastFeedbacks:0,blockedAttackFeedbacks:0,invalidBufferedActions:0,tournamentStateRepairs:0,bufferedAttacks:0,executedBufferedAttacks:0,expiredBufferedAttacks:0,cancelledBufferedAttacks:0,movementCancelledBufferedAttacks:0,bufferedAttackRetargets:0,wallShortenedDashes:0,fullyBlockedDashes:0,invalidDashInputs:0,wallMovementBlocks:0,wallBlockedShots:0,wallOccludedAttacks:0,waveLastHits:0,waveXp:0,waveGold:0};
let battleContract=null,contractDelay=22,lastContract='',roleQuest=null,roleAscended=false;
const quests=[{title:'Охотник',goal:3,get:()=>stats.minions,rewarded:false},{title:'Лесник',goal:2,get:()=>stats.monsters,rewarded:false},{title:'Осадное дело',goal:1,get:()=>stats.towers,rewarded:false}];
const enemy={name:'РАЗОРИТЕЛЬ',color:'#ff5269',archetype:'duelist',x:1880,y:520,r:24,team:'red',hp:180,maxHp:180,damage:13,armor:24,resist:22,speed:145,cd:0,abilityCd:3,revealed:0,slow:0,stun:0,level:1,awakening:0,awakeningCd:25,zoneCd:5,kills:0,deaths:0,bounty:0,state:'ЛИНИЯ',dead:false,respawn:0,rewarded:false,dir:0};
const enemyHero=enemy;
const nexuses=[{x:210,y:1580,r:58,team:'blue',hp:900,maxHp:900},{x:2380,y:220,r:58,team:'red',hp:900,maxHp:900}];
const monsters=[
 {x:720,y:920,homeX:720,homeY:920,r:25,hp:220,maxHp:220,damage:9,kind:'stone',name:'КАМНЕЗУБ',cd:0,dead:false,respawn:0,rewarded:false},
 {x:1320,y:1210,homeX:1320,homeY:1210,r:28,hp:260,maxHp:260,damage:11,kind:'ember',name:'ОГНЕГРИВ',cd:0,dead:false,respawn:0,rewarded:false},
 {x:1770,y:870,homeX:1770,homeY:870,r:25,hp:230,maxHp:230,damage:10,kind:'wind',name:'ВЕТРОКЛЫК',cd:0,dead:false,respawn:0,rewarded:false},
 {x:1530,y:470,homeX:1530,homeY:470,r:34,hp:520,maxHp:520,damage:17,kind:'herald',name:'ОСАДНЫЙ КОЛОСС',cd:0,dead:false,respawn:0,rewarded:false},
 {x:930,y:590,homeX:930,homeY:590,r:38,hp:680,maxHp:680,damage:19,kind:'drake',element:'ember',name:'ПЛАМЕННЫЙ ДРАКОН',cd:0,dead:false,respawn:0,rewarded:false},
 {x:1300,y:900,homeX:1300,homeY:900,r:44,hp:900,maxHp:900,damage:22,kind:'titan',name:'ТИТАН РАЗЛОМА',cd:0,phase:1,slamCd:5,slamTimer:0,slamX:0,slamY:0,shardPhase:1,dead:false,respawn:0,rewarded:false}
];
const jungleCamps=[
 {id:'stone',monsterKind:'stone',x:720,y:920,label:'КАМНЕЗУБ',respawnBase:55,leash:250,contest:0,owner:'neutral'},
 {id:'ember',monsterKind:'ember',x:1320,y:1210,label:'ОГНЕГРИВ',respawnBase:65,leash:250,contest:0,owner:'neutral'},
 {id:'wind',monsterKind:'wind',x:1770,y:870,label:'ВЕТРОКЛЫК',respawnBase:60,leash:250,contest:0,owner:'neutral'},
 {id:'herald',monsterKind:'herald',x:1530,y:470,label:'ОСАДНЫЙ КОЛОСС',respawnBase:150,leash:320,contest:0,owner:'neutral'},
 {id:'drake',monsterKind:'drake',x:930,y:590,label:'ДРАКОН',respawnBase:180,leash:360,contest:0,owner:'neutral'},
 {id:'titan',monsterKind:'titan',x:1300,y:900,label:'ТИТАН',respawnBase:240,leash:420,contest:0,owner:'neutral'}
];
const jungleState={contests:0,lastContest:null,securedBlue:0,securedRed:0,clears:0,blueBuffs:0,redBuffs:0,routeIndex:0,lastClear:0,smiteUpgrades:0};
function updateJungleRoleSystem(dt){
 if(!running||gameMode==='training')return;
 if(rolePosition==='jungle'){
  hero.junglePower=1.22+(jungleState.clears*.012);
  hero.smitePower=1+(jungleState.smiteUpgrades*.08);
  if(!hero.items.has('jungleblade'))hero.items.add('jungleblade');
 }
 for(const c of jungleCamps){
  const m=monsters.find(x=>x.kind===c.monsterKind);
  if(!m)continue;
  c.nextRespawn=m.dead?Math.max(0,m.respawn):0;
 }
 if(rolePosition==='jungle'&&!hero.dead){
  const camp=jungleCamps.filter(c=>c.monsterKind==='stone'||c.monsterKind==='ember'||c.monsterKind==='wind').filter(c=>{const m=monsters.find(x=>x.kind===c.monsterKind);return m&&!m.dead}).sort((a,b)=>Math.hypot(a.x-hero.x,a.y-hero.y)-Math.hypot(b.x-hero.x,b.y-hero.y))[0];
  if(camp&&Math.hypot(camp.x-hero.x,camp.y-hero.y)<180){jungleState.routeIndex=jungleCamps.indexOf(camp);}
 }
}

function jungleCampFor(m){return jungleCamps.find(c=>c.monsterKind===m.kind)||null}
function jungleUnitNear(c,team){const units=[hero,enemy,...botHeroes];return units.some(u=>!u.dead&&u.team===team&&Math.hypot(u.x-c.x,u.y-c.y)<c.leash)}
function updateJungleCamps(dt){
 for(const c of jungleCamps){
  const m=monsters.find(x=>x.kind===c.monsterKind); if(!m) continue;
  if(m.dead){c.contest=0;c.owner='neutral';continue}
  const blue=jungleUnitNear(c,'blue'),red=jungleUnitNear(c,'red');
  c.contest=blue&&red?2:blue?1:red?3:0;
  if(c.contest===2){jungleState.contests+=dt;if(jungleState.lastContest!==c.id){jungleState.lastContest=c.id;feed('СПОРНАЯ ЗОНА · '+c.label,'red');floatText(c.x,c.y-65,'СПОРНО','#ffd45d')}}
  else if(c.contest===1||c.contest===3){c.owner=c.contest===1?'blue':'red'}
 }
}
let chaosTimer=35;const riverRune={active:false,x:1300,y:900,type:'wealth',life:0,next:75,cycle:0};const riverRuneTypes={wealth:{name:'РУНА БОГАТСТВА',color:'#ffd35a'},renewal:{name:'РУНА ОБНОВЛЕНИЯ',color:'#65f0a4'},surge:{name:'РУНА ПОРЫВА',color:'#65dfff'},wisdom:{name:'РУНА МУДРОСТИ',color:'#bc85ff'}};const buffs={stone:0,ember:0,wind:0},shrineBuffs={power:0,guard:0,haste:0},redShrineBuffs={power:0,guard:0,haste:0},dragonBuffs={blue:{ember:0,stone:0,wind:0,soul:false},red:{ember:0,stone:0,wind:0,soul:false}};let teamBuff=0,redTeamBuff=0,siegeBuff=0,redSiegeBuff=0;const aetherDirector={timer:35,balance:0,reason:''};
const plants=[
 {x:610,y:870,homeX:610,homeY:870,r:16,plant:'vital',kind:'plant',name:'ПЛОД ЖИЗНИ',hp:1,maxHp:1,dead:false,respawn:0},
 {x:1120,y:520,homeX:1120,homeY:520,r:17,plant:'blast',kind:'plant',name:'ВЗРЫВ-ЦВЕТОК',hp:1,maxHp:1,dead:false,respawn:0},
 {x:1610,y:1080,homeX:1610,homeY:1080,r:17,plant:'scry',kind:'plant',name:'ОКО-ЦВЕТОК',hp:1,maxHp:1,dead:false,respawn:0},
 {x:1980,y:650,homeX:1980,homeY:650,r:16,plant:'vital',kind:'plant',name:'ПЛОД ЖИЗНИ',hp:1,maxHp:1,dead:false,respawn:0}
];
const shrines=[
 {x:790,y:560,r:42,kind:'guard',name:'АЛТАРЬ СТРАЖА',color:'#69dfff',progress:0,cooldown:0},
 {x:1320,y:1190,r:42,kind:'power',name:'АЛТАРЬ ЯРОСТИ',color:'#ff6e72',progress:0,cooldown:0},
 {x:1840,y:760,r:42,kind:'haste',name:'АЛТАРЬ ВРЕМЕНИ',color:'#bd7dff',progress:0,cooldown:0}
];
const lanes=[
 [{x:250,y:1530},{x:1300,y:900},{x:2350,y:270}],
 [{x:220,y:1550},{x:220,y:220},{x:2380,y:220}],
 [{x:230,y:1580},{x:2380,y:1580},{x:2380,y:250}]
];
const botHeroes=[
 {name:'БАСТИОН',team:'blue',lane:0,x:300,y:1470,color:'#55ddff'},{name:'ИСКРА',team:'blue',lane:1,x:260,y:1430,color:'#79e7a7'},{name:'СТРЕЛА',team:'blue',lane:2,x:340,y:1580,color:'#71a7ff'},{name:'МУДРЕЦ',team:'blue',lane:0,x:350,y:1500,color:'#a8efff'},
 {name:'ЖНЕЦ',team:'red',lane:0,x:2280,y:300,color:'#ff596b'},{name:'ПЕПЕЛ',team:'red',lane:1,x:2330,y:350,color:'#ff8b5d'},{name:'КОГОТЬ',team:'red',lane:2,x:2250,y:250,color:'#df73ff'},{name:'ВЕЩУН',team:'red',lane:0,x:2220,y:320,color:'#ff9cac'}
].map((b,i)=>({...b,r:20,hp:130,maxHp:130,damage:18,cd:0,dead:false,respawn:0,rewarded:false,isBot:true,level:1,kills:0,deaths:0,bounty:0,revealed:0,slow:0,stun:0,abilityCd:2,ultCd:12,sigCd:10,secureCd:0,awakening:0,awakeningCd:20,gear:[],gold:0,lastHits:0,abilityPower:1,healPower:1,wardCd:12+Math.random()*15,wp:1,dir:0}));
const roleStats=[
 {role:'ТАНК',hp:190,damage:13,armor:48,resist:30,range:90,speed:110,symbol:'⬡'},
 {role:'МАГ',hp:105,damage:25,armor:14,resist:34,range:190,speed:118,symbol:'✦'},
 {role:'УБИЙЦА',hp:115,damage:29,armor:22,resist:18,range:105,speed:155,symbol:'◆'},
 {role:'ПОДДЕРЖКА',hp:130,damage:16,armor:25,resist:32,range:165,speed:125,symbol:'✚'}
];
botHeroes.forEach((b,i)=>{const r=roleStats[i%4],positions=['solo','mid','jungle','support'];Object.assign(b,r,{position:positions[i%4],hp:r.hp,maxHp:r.hp,healCd:4})});
const teamPositionDefs={solo:{name:'Верх · боец',role:'ТАНК',lane:2},mid:{name:'Центр · маг',role:'МАГ',lane:1},carry:{name:'Низ · урон',role:'УБИЙЦА',lane:0},jungle:{name:'Лес · охотник',role:'УБИЙЦА',lane:1},support:{name:'Поддержка',role:'ПОДДЕРЖКА',lane:0}};
function balancedTeamDraft(){const player=document.querySelector('#rolePosition')?.value||'mid';return Object.keys(teamPositionDefs).filter(x=>x!==player).slice(0,4)}
function renderTeamDraft(){const list=document.querySelector('#teamDraftList'),status=document.querySelector('#teamDraftStatus'),player=document.querySelector('#rolePosition')?.value||'mid',available=Object.entries(teamPositionDefs);if(!Array.isArray(profile.teamDraft)||profile.teamDraft.length!==4)profile.teamDraft=balancedTeamDraft();list.innerHTML='';botHeroes.filter(b=>b.team==='blue').forEach((bot,i)=>{const row=document.createElement('label'),select=document.createElement('select');row.className='team-draft-row';row.innerHTML=`<b>${bot.name}</b>`;for(const [id,d] of available){const o=document.createElement('option');o.value=id;o.textContent=d.name+(id===player?' · занято игроком':'');o.disabled=id===player;o.selected=profile.teamDraft[i]===id;select.appendChild(o)}select.onchange=()=>{profile.teamDraft[i]=select.value;saveProfile();renderTeamDraft()};row.appendChild(select);list.appendChild(row)});const duplicate=profile.teamDraft.some((x,i,a)=>a.indexOf(x)!==i),missing=Object.keys(teamPositionDefs).filter(x=>x!==player&&!profile.teamDraft.includes(x));status.textContent=duplicate?'⚠ В составе повторяются позиции':missing.length?'⚠ Не назначено: '+missing.map(x=>teamPositionDefs[x].name).join(', '):'✓ Все пять позиций распределены';status.className=duplicate||missing.length?'draft-warning':'draft-ready'}
function applyTeamDraft(){const picks=profile.teamDraft||balancedTeamDraft(),blue=botHeroes.filter(b=>b.team==='blue');blue.forEach((b,i)=>{const position=picks[i]||balancedTeamDraft()[i],def=teamPositionDefs[position],stats=roleStats.find(r=>r.role===def.role)||roleStats[0];Object.assign(b,stats,{position,lane:def.lane,maxHp:stats.hp,hp:stats.hp});if(position==='carry'){b.range=210;b.damage=Math.max(b.damage,25);b.speed=Math.max(b.speed,130)}b.state='ПОЗИЦИЯ: '+def.name.toUpperCase()})}
