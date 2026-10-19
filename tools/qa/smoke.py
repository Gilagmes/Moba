import asyncio,json,sys
from playwright.async_api import async_playwright
JS="""async ([kind,mode,secs])=>{
  const errs={};const note=(where,e)=>{const k=where+': '+(e&&e.message||e)+' @ '+String(e&&e.stack||'').split('\\n')[1]?.trim().replace(/file:\\/\\/\\/\\S*\\//,'');errs[k]=(errs[k]||0)+1};
  window.requestAnimationFrame=()=>0;
  document.querySelector('.hero-card[data-hero="'+kind+'"]').click();
  modeSelect.value=mode; autoBuySelect.checked=true;
  try{play.click()}catch(e){note('play',e)}
  try{matchCountdown=0}catch(e){}
  const dt=1/30;let t=0,steps=0;
  const ctl=()=>{if(hero.dead)return;const foes=[enemy,...botHeroes.filter(b=>b.team==='red'),...minions.filter(m=>m.team==='red')].filter(u=>u&&!u.dead&&u.hp>0);if(!foes.length)return;foes.sort((a,b)=>Math.hypot(a.x-hero.x,a.y-hero.y)-Math.hypot(b.x-hero.x,b.y-hero.y));const tg=foes[0],d=Math.hypot(tg.x-hero.x,tg.y-hero.y);hero.target=tg;if(d<520){hero.dir=Math.atan2(tg.y-hero.y,tg.x-hero.x);if(hero.hp/hero.maxHp<.55&&hero.cd.W<=0)cast('W');if(hero.cd.R<=0)cast('R');if(hero.cd.Q<=0)cast('Q');else if(hero.cd.E<=0&&d>220)cast('E');else if(hero.attackCd<=0)attack()}else hero.moveTarget={x:tg.x,y:tg.y}};
  while(!gameOver&&t<secs){
    try{ctl()}catch(e){note('ctl',e)}
    try{update(dt)}catch(e){note('update',e)}
    if(steps%6===0){try{render()}catch(e){note('render',e)}}
    t+=dt;steps++}
  return {errs,t:Math.round(t),over:gameOver}}"""
async def one(b,sem,kind,mode,out):
    async with sem:
        ctx=await b.new_context(viewport={'width':844,'height':390},is_mobile=True,has_touch=True); pg=await ctx.new_page(); perr=[]
        pg.on('pageerror',lambda e:perr.append(str(e)[:120]))
        try:
            await pg.goto('http://localhost:8765/index.html'); await pg.wait_for_timeout(200)
            r=await pg.evaluate(JS,[kind,mode,60]); r['page']=perr[:3]
        except Exception as e: r={'errs':{'HARNESS: '+str(e)[:150]:1},'page':perr[:3]}
        r.update(kind=kind,mode=mode); out.append(r); await ctx.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']); pg=await b.new_page(); await pg.goto('http://localhost:8765/index.html')
        modes=await pg.evaluate("()=>[...modeSelect.options].map(o=>o.value)"); await pg.close()
        heroes=sys.argv[1].split(','); out=[]; sem=asyncio.Semaphore(6)
        await asyncio.gather(*[one(b,sem,k,m,out) for m in modes for k in heroes]); await b.close()
    agg={}
    for r in out:
        for k,c in r['errs'].items(): agg.setdefault(k,[]).append(f"{r['mode']}/{r['kind']}")
        for e in r['page']: agg.setdefault('PAGEERROR '+e,[]).append(f"{r['mode']}/{r['kind']}")
    print('runs',len(out),'| distinct errors',len(agg))
    for k,v in sorted(agg.items(),key=lambda x:-len(x[1])): print(f'  x{len(v)} {k[:230]}\n      e.g. {v[:4]}')
    json.dump(out,open(sys.argv[2],'w'))
asyncio.run(main())
