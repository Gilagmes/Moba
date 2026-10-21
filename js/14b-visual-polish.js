/* Visual polish layer (v465): world lighting, additive VFX, cheap bloom, vignette. All canvas 2D, cached sprites, skipped on low quality. */
const VFX_ADDITIVE=new Set(['nova','enemyNova','botBlast','wardPulse','killBurst','heroNova','impact','blade','spark','move','shield','dash','recall','heal','mastery','ready','cast','upgrade','wealth']);
const _glowSprites={};
function glowSprite(color){let c=_glowSprites[color];if(c)return c;c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,color+'cc');r.addColorStop(.35,color+'55');r.addColorStop(1,color+'00');g.fillStyle=r;g.fillRect(0,0,128,128);return _glowSprites[color]=c}
function lightPool(x,y,radius,color,alpha){if(x+radius<cam.x||x-radius>cam.x+W||y+radius<cam.y||y-radius>cam.y+H)return;ctx.globalAlpha=alpha;ctx.drawImage(glowSprite(color),x-radius,y-radius,radius*2,radius*2)}
function drawWorldLighting(){if(qualityScale<1||options.reducedMotion)return;ctx.save();ctx.globalCompositeOperation='lighter';const pulse=.5+.5*Math.sin(time*1.6);
 for(const n of nexuses)if(n.hp>0)lightPool(n.x,n.y,430+pulse*30,n.team==='blue'?'#4fdcff':'#ff5a6e',.2+pulse*.05);
 for(const t of towers)if(!t.dead&&t.hp>0)lightPool(t.x,t.y,175,t.team==='blue'?'#4fdcff':'#ff5a6e',.13);
 for(const i of inhibitors)if(!i.dead)lightPool(i.x,i.y,120,i.team==='blue'?'#4fdcff':'#ff5a6e',.1);
 if(!hero.dead)lightPool(hero.x,hero.y,250,(hero.color&&/^#[0-9a-f]{6}$/i.test(hero.color))?hero.color:'#63e6ff',.1);
 ctx.restore()}
let _bloomCv=null,_bloomCtx=null,_bloomFrame=0;
const VFX_BLOOM=false; /* canvas->canvas readback costs ~18 ms/frame in software raster; keep off until measured on real devices */
function drawBloom(){if(!VFX_BLOOM||qualityScale<1||options.reducedMotion||!options.particles||W<300)return;const bw=Math.max(64,Math.round(W/6)),bh=Math.max(40,Math.round(H/6));if(!_bloomCv){_bloomCv=document.createElement('canvas');_bloomCtx=_bloomCv.getContext('2d')}if(_bloomCv.width!==bw||_bloomCv.height!==bh){_bloomCv.width=bw;_bloomCv.height=bh}
 if((_bloomFrame++&1)===0){_bloomCtx.globalCompositeOperation='copy';_bloomCtx.imageSmoothingEnabled=true;_bloomCtx.drawImage(canvas,0,0,canvas.width,canvas.height,0,0,bw,bh)}
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='screen';ctx.globalAlpha=.2;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(_bloomCv,0,0,bw,bh,0,0,canvas.width,canvas.height);ctx.restore();ctx.setTransform(dpr,0,0,dpr,0,0)}
let _vig=null,_vigKey='';
function drawScreenPolish(){canvas.classList.toggle('vfx-grade',qualityScale>=1&&!options.reducedMotion);if(options.reducedMotion&&qualityScale<1)return;const key=W+'x'+H;if(_vigKey!==key){_vigKey=key;_vig=document.createElement('canvas');_vig.width=Math.max(2,Math.round(W/4));_vig.height=Math.max(2,Math.round(H/4));const g=_vig.getContext('2d'),r=g.createRadialGradient(_vig.width/2,_vig.height/2,Math.min(_vig.width,_vig.height)*.35,_vig.width/2,_vig.height/2,Math.hypot(_vig.width,_vig.height)*.58);r.addColorStop(0,'rgba(2,8,14,0)');r.addColorStop(1,'rgba(2,8,14,.55)');g.fillStyle=r;g.fillRect(0,0,_vig.width,_vig.height)}
 ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=true;ctx.drawImage(_vig,0,0,W,H);ctx.restore()}

/* v465: impact burst — flash, shock ring and sparks at every damage hit */
function drawImpact(p) {
    const q = 1 - p.life / p.max, e = 1 - (1 - q) * (1 - q), R = (14 + 34 * e) * p.big, a = 1 - q;
    ctx.save(); ctx.translate(p.x, p.y);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R * .9); g.addColorStop(0, 'rgba(255,255,255,' + (.95 * a) + ')'); g.addColorStop(.35, p.color); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = a * .75; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R * .9 * (1 - q * .4), 0, 6.283); ctx.fill();
    ctx.globalAlpha = a; ctx.strokeStyle = p.color; ctx.lineWidth = 3.2 * a * p.big + .5; ctx.beginPath(); ctx.arc(0, 0, R * 1.15, 0, 6.283); ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.lineCap = 'round'; ctx.lineWidth = 2.2 * a;
    const n = p.big > 1.3 ? 10 : 7; ctx.beginPath();
    for (let i = 0; i < n; i++) { const an = p.a + i * 6.283 / n + (i % 2) * .22, r0 = R * (.55 + e * .4), r1 = r0 + (10 + (i % 3) * 7) * p.big * (1 - q * .6); ctx.moveTo(Math.cos(an) * r0, Math.sin(an) * r0); ctx.lineTo(Math.cos(an) * r1, Math.sin(an) * r1); }
    ctx.stroke(); ctx.restore();
}
