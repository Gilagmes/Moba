import asyncio,json
from collections import Counter
from playwright.async_api import async_playwright
JS=r"""()=>{window.requestAnimationFrame=()=>0;document.querySelector('.hero-card[data-hero="oracle"]').click();modeSelect.value='classic';play.click();try{matchCountdown=0}catch(e){}
const dt=1/30;let t=0;const deaths=[],states={blue:{},red:{}},wasDead=new Map();
while(t<600&&!gameOver){try{update(dt)}catch(e){}t+=dt;
 for(const b of botHeroes){const k=b.name;if(b.dead&&!wasDead.get(k)){deaths.push({t:Math.round(t),team:b.team,n:k,x:Math.round(b.x),y:Math.round(b.y),st:b.state})}wasDead.set(k,b.dead)
  if(!b.dead&&Math.round(t*30)%30===0){const s=b.state||'-';states[b.team][s]=(states[b.team][s]||0)+1}}}
return {deaths,states,towersLost:{blue:towers.filter(x=>x.team==='blue'&&x.hp<=0).length,red:towers.filter(x=>x.team==='red'&&x.hp<=0).length}}}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await (await b.new_context(viewport={'width':844,'height':390})).new_page()
        await pg.goto('http://localhost:8765/index.html');await pg.wait_for_timeout(200)
        r=await pg.evaluate(JS)
        print('towers lost',r['towersLost'])
        for tm in ['blue','red']:
            d=[x for x in r['deaths'] if x['team']==tm];print(tm,'deaths',len(d));
            print('  by state',Counter(x['st'] for x in d).most_common(6))
            print('  by bot',Counter(x['n'] for x in d).most_common(5))
            print('  zone',Counter(('base' if (x['x']<700 and x['y']>1100) or (x['x']>1900 and x['y']<500) else 'mid/lane') for x in d))
            print('  state-time',sorted(r['states'][tm].items(),key=lambda kv:-kv[1])[:8])
        await b.close()
asyncio.run(main())
