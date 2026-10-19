import asyncio
from playwright.async_api import async_playwright
from PIL import Image
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();ims=[]
        for i,(mode,win,vp) in enumerate([('classic',True,(390,844)),('duel',False,(390,844)),('hunt',True,(844,390)),('skirmishranked',False,(390,844))]):
            c=await b.new_context(viewport={'width':vp[0],'height':vp[1]},is_mobile=True,has_touch=True);pg=await c.new_page();errs=[]
            pg.on('pageerror',lambda e:errs.append(str(e)[:80]))
            await pg.goto('http://localhost:8765/index.html');await pg.wait_for_timeout(300)
            await pg.evaluate("m=>{modeSelect.value=m}",mode);await pg.click('#play');await pg.wait_for_timeout(800)
            try: await pg.get_by_text('Продолжить вертикально').click(timeout=800)
            except Exception: pass
            await pg.evaluate("()=>{try{matchCountdown=0}catch(e){}for(let i=0;i<30*40;i++)update(1/30)}")
            await pg.evaluate("w=>endGame(w)",win);await pg.wait_for_timeout(1200)
            f=f'e_{i}.png';await pg.screenshot(path=f);im=Image.open(f);ims.append(im.resize((im.width*844//im.height if im.height>im.width else im.width,844) if False else im.size));print(mode,win,errs);await c.close()
        await b.close()
    W=Image.new('RGB',(sum(i.width for i in ims),max(i.height for i in ims)));x=0
    for im in ims: W.paste(im,(x,0));x+=im.width
    W.save('ends.png')
asyncio.run(main())
