import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for name,vp,mob in [('desk',(1280,720),0),('port',(390,844),1)]:
            for m in ['hunt','runetrial','escort']:
                ctx=await b.new_context(viewport={'width':vp[0],'height':vp[1]},is_mobile=bool(mob),has_touch=bool(mob));pg=await ctx.new_page()
                await pg.goto('http://localhost:8765/index.html');await pg.wait_for_timeout(300)
                await pg.evaluate("m=>{modeSelect.value=m}",m);await pg.click('#play');await pg.wait_for_timeout(1200)
                try: await pg.get_by_text('Продолжить вертикально').click(timeout=500)
                except Exception: pass
                await pg.wait_for_timeout(3500)
                await pg.screenshot(path=f'{name}_{m}.png');await ctx.close()
        await b.close()
asyncio.run(main())
