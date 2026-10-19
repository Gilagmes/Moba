import asyncio
from playwright.async_api import async_playwright
JS=r"""()=>{window.requestAnimationFrame=()=>0;document.querySelector('.hero-card[data-hero="tempest"]').click();modeSelect.value='classic';play.click();try{matchCountdown=0}catch(e){}
const dt=1/30;for(let i=0;i<30*120;i++){try{update(dt)}catch(e){}}
let tu=0,tr=0;const N=300;for(let i=0;i<N;i++){let a=performance.now();update(dt);tu+=performance.now()-a;a=performance.now();render();tr+=performance.now()-a}
return {update_ms:+(tu/N).toFixed(2),render_ms:+(tr/N).toFixed(2),units:minions.length+botHeroes.length,particles:particles.length}}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for vp,mob in [((844,390),1),((1280,720),0),((1920,1080),0)]:
            c=await b.new_context(viewport={'width':vp[0],'height':vp[1]},is_mobile=bool(mob),has_touch=bool(mob),device_scale_factor=2 if mob else 1);pg=await c.new_page()
            await pg.goto('http://localhost:8765/index.html');await pg.wait_for_timeout(200)
            print(vp,await pg.evaluate(JS))
        await b.close()
asyncio.run(main())
