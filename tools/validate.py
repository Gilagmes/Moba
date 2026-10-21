#!/usr/bin/env python3
from pathlib import Path
import re, sys
root=Path(__file__).resolve().parents[1]
errors=[]
idx=(root/'index.html').read_text()
for ref in re.findall(r'(?:href|src)="([^"]+)"',idx):
    if ref.startswith(('http:','https:','#','data:')): continue
    ref=ref.split('?',1)[0]
    if not (root/ref).exists(): errors.append(f'missing asset: {ref}')
jsfiles=sorted((root/'js').glob('*.js'))
js='\n'.join(f.read_text() for f in jsfiles)
if 'src="js/' not in idx: errors.append('modules not linked in index.html')
for f in jsfiles:
    if 'js/'+f.name not in idx: errors.append('module not in index.html: '+f.name)
    if './js/'+f.name not in (root/'sw.js').read_text(): errors.append('module not in sw.js: '+f.name)
_order=re.findall(r'src="(js/[^"?]+)',idx)
if _order!=['js/'+f.name for f in jsfiles]: errors.append('module load order differs from file order')
# cheap static integrity checks for accidental truncation / unmatched braces
pairs={'{':'}','(':')','[':']'}
for a,b in pairs.items():
    if js.count(a)!=js.count(b): errors.append(f'js modules delimiter mismatch {a}{b}: {js.count(a)} != {js.count(b)}')
for token in ['startHeroArt','runSystemAudit','requestAnimationFrame']:
    if token not in js and token!='startHeroArt': errors.append(f'expected token absent: {token}')
# Every draw/update helper invoked by render/update must exist. This catches black-canvas regressions.
for owner in ('render','update'):
    match=re.search(rf'function {owner}\([^)]*\)\{{(.*?)\nfunction ',js,re.S)
    if not match:
        errors.append(f'{owner} function body not found')
        continue
    for call in sorted(set(re.findall(r'\b((?:draw|update|sync|render)[A-Z]\w*)\(',match.group(1)))):
        if not re.search(rf'(?:function|const|let|var)\s+{call}\b',js):
            errors.append(f'undefined runtime helper in {owner}: {call}')
if 'function render(){if(mobileLaunch' in js: errors.append('mobile launch is hidden by pre-match render')
if 'function loop(now){if(!running||paused)return;if(mobileLaunch' not in js: errors.append('mobile launch running-state guard missing')
if '#mobileLaunch:not([hidden])' not in (root/'v396.css').read_text(): errors.append('embedded-preview launch rule missing')
css=(root/'v380.css').read_text()
css381=(root/'v384.css').read_text()
if '#start' not in css or '.start-visual' not in css: errors.append('v380 visual layer incomplete')
if '384' not in css381: errors.append('v384 combat readability release marker missing')
if 'drawCombatCommandHUD' not in js: errors.append('combat HUD function missing')
if 'killBurst' not in js: errors.append('kill impact effect missing')
if 'abilityTelegraph' not in js: errors.append('v383 ability telegraph missing')
if 'pushAbilityTelegraph' not in js: errors.append('ability telegraph helper missing')
if 'drawStatusChips' not in js: errors.append('status chips helper missing')
if 'v465' not in idx: errors.append('v465 cache marker missing')
if not (root/'v396.css').exists(): errors.append('v396 stylesheet missing')
if 'aether-clash-v465' not in (root/'sw.js').read_text(): errors.append('v465 service worker cache missing')
if 'updateVisionGameplay' not in js: errors.append('vision gameplay updater missing')
if 'wardActive' not in js: errors.append('ward lifecycle helper missing')
if 'placeControlWard' not in js: errors.append('control ward placement missing')
if 'visionControl' not in js: errors.append('objective vision control missing')
if 'ТОТЕМ ОБНАРУЖЕН' not in js: errors.append('counter-vision feedback missing')
if "cat==='crit'" not in js: errors.append('combat number hierarchy missing')
try:
    import subprocess
    for f in jsfiles: subprocess.run(['node','--check',str(f)],check=True,capture_output=True,text=True)
except Exception as exc:
    errors.append(f'node syntax check failed: {exc}')
print('AETHER CLASH VALIDATOR')
print('version: v465')
print('assets:', 'OK' if not any(x.startswith('missing asset') for x in errors) else 'FAIL')
print('js modules delimiters:', 'OK' if not any('delimiter mismatch' in x for x in errors) else 'FAIL')

# v401: every renderer helper that is called must be defined (a lost definition = ReferenceError every frame = black canvas)
import re as _re
_js=js
for _fn in ('foliage','shade','charAnim','drawCharacter','drawHeroCharacter','drawMinionCharacter','drawMonsterBody','gl3dBegin','gl3dFlush','gl3dCharacter','gl3dTower','gl3dInhibitor','gl3dNexus','gl3dMonster','gl3dObstacle','gl3dRuins'):
    if not _re.search(r'function\s+'+_fn+r'\b',_js): errors.append('renderer function missing: '+_fn)

if 'hero.x=820;hero.y=1120' in _js: errors.append('duel spawn (820,1120) is inside a rock obstacle: hero cannot move')

if 'function unstickAll' not in _js or 'unstickAll();' not in _js: errors.append('spawn unstick safety net missing')

if 'id="shopComponents"' not in (root/'index.html').read_text(): errors.append('shop components section missing: items cannot be bought')
if "next.type==='component'" not in _js: errors.append('autobuy must buy components for component-type purchases')
if errors:
    print('\n'.join('ERROR: '+x for x in errors)); sys.exit(1)
print('RESULT: PASS')
