import asyncio
from playwright.async_api import async_playwright
JS="""()=>{const s=document.querySelector('#shop');const r=s.getBoundingClientRect();const bad=[];for(const el of s.querySelectorAll('button,.shop-item,section')){const b=el.getBoundingClientRect();if(b.width&&(b.right>innerWidth+1||b.left<-1))bad.push((el.id||el.className||el.tagName).toString().slice(0,30)+':'+Math.round(b.left)+'-'+Math.round(b.right))}return {shop:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],sw:s.scrollWidth,cw:s.clientWidth,vis:getComputedStyle(s).display,bad:bad.slice(0,8)}}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for vp in [(390,844),(360,740),(844,390)]:
            ctx=await b.new_context(viewport={'width':vp[0],'height':vp[1]},is_mobile=True,has_touch=True);pg=await ctx.new_page();errs=[]
            pg.on('pageerror',lambda e:errs.append(str(e)[:100]))
            await pg.goto('http://localhost:8765/index.html');await pg.wait_for_timeout(300);await pg.click('#play');await pg.wait_for_timeout(800)
            if vp[1]>vp[0]:
                try: await pg.get_by_text('Продолжить вертикально').click(timeout=1500)
                except Exception: pass
            await pg.evaluate("()=>{updateShopRecommendations();shop.classList.remove('hidden')}")
            await pg.wait_for_timeout(500)
            print(vp,await pg.evaluate(JS),errs)
            await pg.screenshot(path=f'shop_{vp[0]}.png')
            await ctx.close()
        await b.close()
asyncio.run(main())
