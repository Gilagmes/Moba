import asyncio,json,sys
from playwright.async_api import async_playwright
JS="""async ([kind,cap])=>{
  window.requestAnimationFrame=()=>0;let res=null;
  const og=endGame;endGame=function(w){if(res===null)res=w?'blue':'red';return og.apply(this,arguments)};
  document.querySelector('.hero-card[data-hero="'+kind+'"]').click();modeSelect.value='classic';autoBuySelect.checked=true;play.click();try{matchCountdown=0}catch(e){}
  const dt=1/30;let t=0;
  const ctl=()=>{if(hero.dead)return;const foes=[enemy,...botHeroes.filter(b=>b.team==='red'),...minions.filter(m=>m.team==='red')].filter(u=>u&&!u.dead&&u.hp>0);if(!foes.length)return;foes.sort((a,b)=>Math.hypot(a.x-hero.x,a.y-hero.y)-Math.hypot(b.x-hero.x,b.y-hero.y));const tg=foes[0],d=Math.hypot(tg.x-hero.x,tg.y-hero.y);hero.target=tg;if(d<520){hero.dir=Math.atan2(tg.y-hero.y,tg.x-hero.x);if(hero.hp/hero.maxHp<.55&&hero.cd.W<=0)cast('W');if(hero.cd.R<=0)cast('R');if(hero.cd.Q<=0)cast('Q');else if(hero.cd.E<=0&&d>220)cast('E');else if(hero.attackCd<=0)attack()}else hero.moveTarget={x:tg.x,y:tg.y}};
  let wt=null;while(!gameOver&&t<cap){try{ctl();update(dt)}catch(e){}t+=dt;const rc=nexuses.find(n=>n.team==='red'),bc=nexuses.find(n=>n.team==='blue');if(rc.hp<=0){wt=Math.round(t);res=res||'blue';break}if(bc.hp<=0){wt=Math.round(t);res=res||'red';break}}
  await new Promise(r=>setTimeout(r,400));
  return {res,wt,t:Math.round(t),over:gameOver,bk:botHeroes.filter(b=>b.team==='blue').reduce((n,b)=>n+b.kills,0)+hero.kills,rk:botHeroes.filter(b=>b.team==='red').reduce((n,b)=>n+b.kills,0)+enemy.kills}}"""
HEROES=['guardian','phantom','oracle','tempest','seraph','archon','warden','forge','lumen']
async def one(b,sem,k,i,f):
    async with sem:
        ctx=await b.new_context(viewport={'width':844,'height':390});pg=await ctx.new_page()
        try:
            await pg.goto('http://localhost:8765/index.html');await pg.wait_for_timeout(200)
            r=await pg.evaluate(JS,[k,1800]);r.update(kind=k,i=i)
        except Exception as e: r=dict(kind=k,i=i,fail=str(e)[:100])
        f.write(json.dumps(r)+'\n');f.flush();await ctx.close()
async def main():
    sem=asyncio.Semaphore(5)
    async with async_playwright() as p:
        b=await p.chromium.launch()
        with open('bal6.jsonl','w') as f:
            await asyncio.gather(*[one(b,sem,k,i,f) for i in range(2) for k in HEROES])
        await b.close()
asyncio.run(main())
