import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for mode in ['classic','dominion','escort','duel','hunt','survival','raid']:
            c=await b.new_context(viewport={'width':844,'height':390},is_mobile=True,has_touch=True);pg=await c.new_page();errs=[]
            pg.on('pageerror',lambda e:errs.append(str(e)[:100]))
            await pg.goto('http://localhost:8765/index.html');await pg.wait_for_timeout(300)
            await pg.evaluate("m=>{modeSelect.value=m}",mode);await pg.click('#play')
            await pg.evaluate("()=>{window.requestAnimationFrame=()=>0;try{matchCountdown=0}catch(e){}for(let i=0;i<30*20;i++)update(1/30);saveMatch()}")
            t1=await pg.evaluate("[Math.round(time),Math.round(hero.x),Math.round(hero.y),hero.level]")
            has=await pg.evaluate("!!localStorage.getItem('aetherMatchSave')")
            await pg.reload();await pg.wait_for_timeout(600)
            vis=await pg.evaluate("(()=>{const e=document.querySelector('#resumeMatch');return e?getComputedStyle(e).display+'|'+e.className:'none'})()")
            try:
                await pg.click('#resumeMatch',timeout=2000);await pg.wait_for_timeout(500)
                await pg.evaluate("()=>{window.requestAnimationFrame=()=>0;for(let i=0;i<30*10;i++)update(1/30)}")
                t2=await pg.evaluate("[Math.round(time),Math.round(hero.x),Math.round(hero.y),hero.level,gameMode,running]")
            except Exception as e: t2='click failed '+str(e)[:60]
            print(mode,'saved',has,t1,'resume btn',vis,'->',t2,errs[:2])
            await c.close()
        await b.close()
asyncio.run(main())
