/* First-match quick start card: shown once per profile, after the countdown, dismissed by tap/click or after 12 s. */
(()=>{const card=document.createElement('div');card.id='quickStart';card.setAttribute('role','dialog');card.setAttribute('aria-label','Быстрый старт');card.hidden=true;
Object.assign(card.style,{position:'fixed',left:'50%',top:'18%',transform:'translateX(-50%)',zIndex:'60',maxWidth:'min(92vw,440px)',padding:'12px 16px',background:'#071a22f2',border:'1px solid #4fd6ee',borderRadius:'10px',color:'#dff7fb',font:'600 13px/1.45 system-ui,sans-serif',boxShadow:'0 8px 30px #000a',cursor:'pointer'});
document.body.appendChild(card);let timer=0;
const hide=()=>{card.hidden=true;clearTimeout(timer)};card.addEventListener('pointerdown',hide);
function show(){let seen=false;try{seen=!!profile.quickStartSeen}catch(e){}if(seen||!running||gameMode==='training')return;
 const touch=typeof compactUI==='function'&&compactUI();
 const rows=touch?['<b>Слева</b> — джойстик: двигайтесь','<b>Справа</b> — кнопки Q W E R: способности, большая кнопка — атака','<b>Золото</b> тратьте в магазине у своей базы','Цель: разрушить вражеское <b>ядро</b>. Башни защищают путь']:['<b>WASD</b> — движение, <b>Пробел</b> — атака','<b>Q E R T</b> — способности (клавиши подписаны на панели внизу)','<b>B</b> — вернуться на базу: там открывается магазин, тратьте золото','Цель: разрушить вражеское <b>ядро</b>. Башни защищают путь'];
 card.innerHTML='<div style="color:#7be7f8;font-weight:800;letter-spacing:.04em;margin-bottom:4px">БЫСТРЫЙ СТАРТ</div>'+rows.map(r=>'<div>• '+r+'</div>').join('')+'<div style="opacity:.6;font-size:11px;margin-top:4px">Коснитесь, чтобы закрыть</div>';
 card.hidden=false;try{profile.quickStartSeen=true;saveProfile()}catch(e){}timer=setTimeout(hide,12000)}
play.addEventListener('click',()=>{hide();setTimeout(show,5600)})})();
