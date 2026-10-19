import asyncio
from playwright.async_api import async_playwright
from PIL import Image
MODES=['classic','dominion','convergence','escort','eclipse','riftball','duel','survival','raid']
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();ims=[]
        for m in MODES:
            ctx=await b.new_context(viewport={'width':1280,'height':720});pg=await ctx.new_page()
            await pg.goto('http://localhost:8765/index.html');await pg.wait_for_timeout(300)
            await pg.evaluate("m=>{modeSelect.value=m}",m);await pg.click('#play');await pg.wait_for_timeout(5500)
            await pg.screenshot(path=f'd_{m}.png');ims.append(Image.open(f'd_{m}.png').resize((640,360)));await ctx.close()
        await b.close()
    for k in range(0,9,4):
        grp=ims[k:k+4]
        if len(grp)<1: continue
        W=Image.new('RGB',(1280,720))
        for i,im in enumerate(grp): W.paste(im,((i%2)*640,(i//2)*360))
        W.save(f'montage{k//4}.png')
asyncio.run(main())
