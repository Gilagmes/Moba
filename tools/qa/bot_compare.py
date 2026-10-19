import asyncio,sys,json
from collections import Counter
from playwright.async_api import async_playwright
JS=open('redlog.py').read().split('JS=r"""')[1].split('"""')[0]
async def one(b,port,kind):
    pg=await (await b.new_context(viewport={'width':844,'height':390})).new_page()
    await pg.goto(f'http://localhost:{port}/index.html');await pg.wait_for_timeout(200)
    r=await pg.evaluate(JS.replace('oracle',kind));return r
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for port in (8765,8767):
            rs=await asyncio.gather(*[one(b,port,k) for k in ['oracle','tempest','archon']])
            d=sum(len(r['deaths']) for r in rs);ret=sum(r['states']['blue'].get('ОТСТУПЛЕНИЕ',0)+r['states']['red'].get('ОТСТУПЛЕНИЕ',0) for r in rs)
            print(port,'deaths(total 3 matches)',d,'retreat bot-secs',ret,'towers lost',[r['towersLost'] for r in rs])
        await b.close()
asyncio.run(main())
