// ================= Characters: upright 2.5D silhouettes (heroes, bots, enemy, minions) =================
const charState = new WeakMap();
const CHAR_CLASS = { guardian: 'tank', phantom: 'assassin', oracle: 'mage', tempest: 'ranger', seraph: 'support', archon: 'mage', warden: 'tank', forge: 'bruiser', lumen: 'mage' };
const ROLE_CLASS = { 'ТАНК': 'tank', 'МАГ': 'mage', 'УБИЙЦА': 'assassin', 'ПОДДЕРЖКА': 'support' };
const ARCH_CLASS = { duelist: 'assassin', bulwark: 'tank', arcanist: 'mage', hunter: 'ranger' };
// [skin, hair, accent]
const CHAR_LOOK = {
    guardian: ['#e3b896', '#2d3745', '#9cefff'], phantom: ['#d9b4a0', '#3a2a52', '#d6a6ff'], oracle: ['#f0cfae', '#e8d9a8', '#ffd86b'],
    tempest: ['#c99870', '#2f7a4d', '#8dffb0'], seraph: ['#f3d2bd', '#f6e3ee', '#ffd1e8'], archon: ['#e5bd98', '#b9c2cc', '#ffc46b'],
    warden: ['#b98a68', '#2a2440', '#b690ff'], forge: ['#9a6a4a', '#ff8a3d', '#ff9a4d'], lumen: ['#f2d3bf', '#ffe6fb', '#ffb3f2']
};
function shade(hex, amt) {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
    const n = parseInt(hex.slice(1), 16), f = amt < 0 ? 0 : 255, p = Math.abs(amt), r = n >> 16, g = n >> 8 & 255, b = n & 255;
    return `rgb(${Math.round((f - r) * p + r)},${Math.round((f - g) * p + g)},${Math.round((f - b) * p + b)})`;
}
function charAnim(u) {
    let s = charState.get(u);
    const cd = u.attackCd !== undefined ? u.attackCd : (typeof u.cd === 'number' ? u.cd : 0);
    if (!s) { s = { x: u.x, y: u.y, t: time, ph: Math.random() * 6, face: 1, mv: 0, sw: 0, hp: u.hp, flash: 0, cd, seed: Math.random() * 6 }; charState.set(u, s); }
    const dt = time - s.t;
    if (dt > 0 && dt < .5) {
        const dx = u.x - s.x, dy = u.y - s.y, d = Math.hypot(dx, dy);
        s.mv += ((d / dt > 14 ? 1 : 0) - s.mv) * Math.min(1, dt * 10);
        s.ph += d / 9;
        if (Math.abs(dx) > .3 && u.dir === undefined) s.face = dx > 0 ? 1 : -1;
        s.sw = Math.max(0, s.sw - dt * 4.2);
        s.flash = Math.max(0, s.flash - dt);
        if (cd > s.cd + .05) s.sw = 1;
        if (u.hp < s.hp - .5) s.flash = .14;
    } else if (dt !== 0) { s.sw = 0; s.flash = 0; s.mv = 0; }
    s.cd = cd; s.hp = u.hp; s.x = u.x; s.y = u.y; s.t = time;
    if (u.dir !== undefined && Math.abs(Math.cos(u.dir)) > .2) s.face = Math.cos(u.dir) > 0 ? 1 : -1;
    return s;
}
// Draws one character centred on the current origin. cls: tank|assassin|mage|ranger|support|bruiser|soldier|caster|siege|super
function drawCharacter(u, cls, o) {
    if (gl3dCharacter(u, cls, o)) return;
    const s = charAnim(u), S = (o.r || u.r || 20) / 20 * 1.25, kind = o.kind || '';
    const reduced = options.reducedMotion, mv = reduced ? 0 : s.mv;
    const bob = reduced ? 0 : -Math.abs(Math.sin(s.ph)) * 2.2 * mv + Math.sin(time * 2.2 + s.seed) * .7 * (1 - mv);
    const leg = Math.sin(s.ph) * 6 * mv;
    const team = o.team === 'red' ? '#ff5a6e' : '#4fdcff';
    const col = o.color || '#8ab', acc = o.accent || '#fff', skin = o.skin || '#e8c39e', hair = o.hair || '#2b2f3a', dark = '#0d1b24';
    const minion = cls === 'soldier' || cls === 'caster' || cls === 'siege' || cls === 'super';
    const p = 1 - s.sw, swinging = s.sw > 0;
    const armA = swinging ? -1.25 + 2.3 * p : .55 + Math.sin(time * 2 + s.seed) * .06;
    const sx = 6, sy = -10, hx = sx + Math.cos(armA) * 11, hy = sy + Math.sin(armA) * 11;
    const pulse = .5 + .5 * Math.sin(time * 4 + s.seed);
    if(qualityScale<1){ctx.save();ctx.scale(S,S);ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,15,16,6,0,0,6.283);ctx.fill();ctx.strokeStyle=team;ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(0,15,19,7,0,0,6.283);ctx.stroke();ctx.scale(s.face,1);ctx.fillStyle=shade(col,-.25);ctx.fillRect(-8,-10,16,22);ctx.fillStyle=skin;ctx.beginPath();ctx.arc(0,-17,minion?6:7,0,6.283);ctx.fill();ctx.strokeStyle=acc;ctx.lineWidth=3;ctx.beginPath();if(cls==='ranger'||cls==='caster'){ctx.moveTo(7,-8);ctx.lineTo(15,-17)}else if(cls==='tank'||cls==='bruiser'||cls==='soldier'||cls==='super'){ctx.moveTo(7,-6);ctx.lineTo(15,5)}else{ctx.moveTo(-11,-8);ctx.lineTo(11,-8)}ctx.stroke();ctx.restore();return}
    ctx.save();
    ctx.scale(S, S);
    // ground: shadow + team ring (readable team ownership)
    ctx.fillStyle = 'rgba(0,0,0,.34)'; ctx.beginPath(); ctx.ellipse(0, 15, 17, 6.5, 0, 0, 6.283); ctx.fill();
    ctx.strokeStyle = team; ctx.lineWidth = 2.4; ctx.globalAlpha = .9; ctx.beginPath(); ctx.ellipse(0, 15, 19.5, 7.8, 0, 0, 6.283); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.scale(s.face, 1); ctx.translate(0, bob);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const torso = (fill, robe) => {
        ctx.beginPath();
        if (robe) { ctx.moveTo(-9, -12); ctx.lineTo(9, -12); ctx.lineTo(13 + leg * .15, 13); ctx.lineTo(-13 + leg * .15, 13); }
        else { ctx.moveTo(-10, -12); ctx.lineTo(10, -12); ctx.lineTo(7.5, 6.5); ctx.lineTo(-7.5, 6.5); }
        ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    };
    const robe = cls === 'mage' || cls === 'support' || cls === 'caster';
    // ---- back layer ----
    if (cls === 'support') {
        ctx.fillStyle = acc; ctx.globalAlpha = .34;
        for (const r of [-.75, -.2]) { ctx.save(); ctx.translate(-5, -9); ctx.rotate(r + Math.sin(time * 3 + s.seed) * .08); ctx.beginPath(); ctx.ellipse(-10, 0, 14, 4.6, 0, 0, 6.283); ctx.fill(); ctx.restore(); }
        ctx.globalAlpha = 1;
    } else if (cls === 'ranger') {
        ctx.save(); ctx.translate(-6, -8); ctx.rotate(-.5); ctx.fillStyle = shade(col, -.5); ctx.fillRect(-2.5, -10, 5, 15);
        ctx.strokeStyle = acc; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-1, -10); ctx.lineTo(-1, -14); ctx.moveTo(1.5, -10); ctx.lineTo(1.5, -14); ctx.stroke(); ctx.restore();
    } else if (cls === 'tank' && kind !== 'warden') {
        ctx.fillStyle = shade(col, -.55); ctx.beginPath(); ctx.moveTo(-8, -12); ctx.lineTo(-15 - leg * .4, 9); ctx.lineTo(-6, 6); ctx.closePath(); ctx.fill();
    } else if (cls === 'assassin') {
        ctx.strokeStyle = '#cfd8e0'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(-6, -4); ctx.lineTo(-17, 3); ctx.stroke();
        ctx.strokeStyle = acc; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-5, -4.5); ctx.lineTo(-7.5, -3); ctx.stroke();
    } else if (kind === 'archon') {
        ctx.save(); ctx.translate(-7, -8); ctx.strokeStyle = acc; ctx.lineWidth = 1.8; ctx.globalAlpha = .85; ctx.beginPath(); ctx.arc(0, 0, 13, 0, 6.283); ctx.stroke();
        for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 11, Math.sin(a) * 11); ctx.lineTo(Math.cos(a) * 13, Math.sin(a) * 13); ctx.stroke(); }
        ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(time * 1.5) * 9, Math.sin(time * 1.5) * 9); ctx.stroke(); ctx.globalAlpha = 1; ctx.restore();
    }
    // ---- legs ----
    if (!robe && cls !== 'siege') {
        ctx.lineWidth = 6.5; ctx.strokeStyle = dark;
        ctx.beginPath(); ctx.moveTo(-3.5, 5); ctx.lineTo(-3.5 + leg * .6, 14.5 - Math.max(0, -leg) * .35); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(3.5, 5); ctx.lineTo(3.5 - leg * .6, 14.5 - Math.max(0, leg) * .35); ctx.stroke();
    }
    if (cls === 'siege') { // wheeled siege cart
        ctx.fillStyle = '#4b3a2a'; ctx.fillRect(-12, -2, 24, 11);
        ctx.fillStyle = dark; for (const wx of [-8, 8]) { ctx.beginPath(); ctx.arc(wx, 11, 5.5 + 0, 0, 6.283); ctx.fill(); ctx.strokeStyle = acc; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(wx, 11, 5.5, s.ph, s.ph + 6.283); ctx.stroke(); }
        ctx.save(); ctx.translate(2, -3); ctx.rotate(swinging ? -.35 - s.sw * .1 : -.18); ctx.fillStyle = '#6a6f78'; ctx.fillRect(0, -4, 22, 8); ctx.fillStyle = col; ctx.fillRect(18, -5, 5, 10); ctx.restore();
        if (swinging && s.sw > .6) { ctx.fillStyle = '#ffd98a'; ctx.beginPath(); ctx.arc(26, -7, 5 * s.sw, 0, 6.283); ctx.fill(); }
        ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(-6, -8, 5, 0, 6.283); ctx.fill(); ctx.fillStyle = shade(col, -.2); ctx.beginPath(); ctx.arc(-6, -10, 5.4, Math.PI, 0); ctx.fill();
        ctx.restore(); return;
    }
    // ---- torso ----
    const g = ctx.createLinearGradient(0, -13, 0, 8); g.addColorStop(0, col); g.addColorStop(1, shade(col, -.45));
    torso(g, robe);
    ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = team; ctx.fillRect(robe ? -9 : -7.5, 3.6, robe ? 18 : 15, 2.6);                    // belt in team colour
    if (cls === 'tank' || cls === 'bruiser' || cls === 'super') { ctx.fillStyle = shade(col, .22); for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sgn * 10, -11, 5.2, 3.8, 0, 0, 6.283); ctx.fill(); } }
    if (cls === 'support' || cls === 'mage') { ctx.fillStyle = acc; ctx.globalAlpha = .9; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(3, -5); ctx.lineTo(0, -1); ctx.lineTo(-3, -5); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; }
    // ---- head ----
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(1, -21, 7.6, 0, 6.283); ctx.fill();
    if (cls === 'tank' || cls === 'super' || cls === 'soldier') {          // helmet + visor
        ctx.fillStyle = cls === 'soldier' ? '#7d8791' : shade(col, -.15); ctx.beginPath(); ctx.arc(1, -22, 8.5, Math.PI, 0); ctx.lineTo(9.5, -17); ctx.lineTo(-7.5, -17); ctx.closePath(); ctx.fill();
        if (cls !== 'soldier') { ctx.fillStyle = acc; ctx.fillRect(1.5, -22.5, 7, 2.4); ctx.fillStyle = team; ctx.beginPath(); ctx.moveTo(-3, -30); ctx.lineTo(2, -37 - (cls === 'super' ? 4 : 0)); ctx.lineTo(6, -30); ctx.fill(); }
        else { ctx.fillStyle = team; ctx.fillRect(-6, -23.6, 14.5, 2); }
    } else if (cls === 'assassin') {                                            // hood + scarf
        ctx.fillStyle = shade(col, -.55); ctx.beginPath(); ctx.moveTo(-8, -14); ctx.quadraticCurveTo(-10, -32, 3, -31); ctx.quadraticCurveTo(10.5, -28, 9, -22); ctx.lineTo(1, -17.5); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = acc; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-6, -16); ctx.quadraticCurveTo(-16 - mv * 4, -15 + Math.sin(time * 9) * 3, -23 - mv * 6, -12 + Math.sin(time * 9 + 1) * 4); ctx.stroke();
    } else if (cls === 'ranger') {                                              // cap hair + ponytail + headband
        ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(.5, -22.5, 8.4, Math.PI * .95, Math.PI * 2.05); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = hair; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(-6, -22); ctx.quadraticCurveTo(-13, -20 + Math.sin(time * 6) * 2, -15, -12 + Math.sin(time * 6 + 1) * 3); ctx.stroke();
        ctx.fillStyle = acc; ctx.fillRect(-6.5, -24.4, 15, 2.2);
    } else if (cls === 'bruiser') {                                             // flame hair
        ctx.fillStyle = hair; for (let i = 0; i < 4; i++) { const hx0 = -5 + i * 3.6, fl = Math.sin(time * 10 + i * 1.7) * 2; ctx.beginPath(); ctx.moveTo(hx0 - 2.4, -27); ctx.lineTo(hx0 + fl * .4, -37 - (i % 2) * 3 + fl); ctx.lineTo(hx0 + 2.4, -27); ctx.fill(); }
        ctx.beginPath(); ctx.arc(.5, -23, 8, Math.PI, 0); ctx.fill();
    } else if (cls === 'mage' || cls === 'support' || cls === 'caster') {      // long hair / hat
        if (cls === 'caster') { ctx.fillStyle = shade(col, -.35); ctx.beginPath(); ctx.ellipse(1, -27, 10, 2.6, 0, 0, 6.283); ctx.fill(); ctx.beginPath(); ctx.moveTo(-4, -27); ctx.lineTo(2, -41); ctx.lineTo(7, -27); ctx.fill(); }
        else { ctx.fillStyle = hair; ctx.beginPath(); ctx.ellipse(-4.5, -16, 6, 12 + mv * 1.5, .15, 0, 6.283); ctx.fill(); ctx.beginPath(); ctx.arc(.5, -22.5, 8.4, Math.PI * .92, Math.PI * 2.08); ctx.closePath(); ctx.fill();
            ctx.fillStyle = acc; ctx.beginPath(); ctx.arc(4.2, -26, 1.9, 0, 6.283); ctx.fill(); }
        if (cls === 'support') { ctx.strokeStyle = '#ffe9a0'; ctx.lineWidth = 2.2; ctx.shadowColor = '#ffe9a0'; ctx.shadowBlur = 8; ctx.beginPath(); ctx.ellipse(1, -35, 8.5, 2.6, 0, 0, 6.283); ctx.stroke(); ctx.shadowBlur = 0; }
    }
    ctx.fillStyle = dark; ctx.beginPath(); ctx.ellipse(4.3, -20.4, 1.1, 1.7, 0, 0, 6.283); ctx.fill();   // eye shows facing
    // ---- front: shield / weapon / arm ----
    const trail = (rad) => { if (!swinging) return; ctx.save(); ctx.strokeStyle = acc; ctx.globalAlpha = Math.min(.7, s.sw * .8); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(sx, sy, rad, -1.25, armA); ctx.stroke(); ctx.restore(); };
    const arm = (colr) => { ctx.strokeStyle = colr; ctx.lineWidth = 4.6; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); ctx.stroke(); ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(hx, hy, 2.7, 0, 6.283); ctx.fill(); };
    if (cls === 'tank' && kind !== 'warden' || cls === 'super') {
        ctx.fillStyle = '#16303c'; ctx.strokeStyle = acc; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(1, -13); ctx.lineTo(12, -13); ctx.lineTo(12, -2); ctx.quadraticCurveTo(12, 6, 6.5, 9); ctx.quadraticCurveTo(1, 6, 1, -2); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = acc; ctx.globalAlpha = .75 + pulse * .2; ctx.beginPath(); ctx.moveTo(6.5, -9); ctx.lineTo(9, -3); ctx.lineTo(6.5, 3); ctx.lineTo(4, -3); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    }
    if (cls === 'tank' || cls === 'super' || cls === 'soldier' || cls === 'assassin' || cls === 'bruiser') trail(cls === 'bruiser' ? 28 : 24);
    arm(shade(col, -.15));
    ctx.save(); ctx.translate(hx, hy);
    if (cls === 'tank' && kind === 'warden') {                                  // gravity gauntlet
        ctx.fillStyle = shade(col, .1); ctx.beginPath(); ctx.arc(2, 0, 5.4, 0, 6.283); ctx.fill();
        ctx.strokeStyle = acc; ctx.lineWidth = 1.8; for (let i = 0; i < 2; i++) { ctx.globalAlpha = .85; ctx.beginPath(); ctx.ellipse(2, 0, 10 + i * 4 + (swinging ? s.sw * 6 : 0), 4 + i * 2, time * 2 + i, 0, 6.283); ctx.stroke(); } ctx.globalAlpha = 1;
    } else if (cls === 'tank' || cls === 'super' || cls === 'soldier') {        // sword / spear
        ctx.rotate(armA - .2);
        if (cls === 'soldier') { ctx.strokeStyle = '#8a6a44'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(24, 0); ctx.stroke(); ctx.fillStyle = '#dfe6ec'; ctx.beginPath(); ctx.moveTo(24, -3); ctx.lineTo(32, 0); ctx.lineTo(24, 3); ctx.fill(); }
        else { ctx.fillStyle = '#e2ecf3'; ctx.fillRect(2, -2, cls === 'super' ? 30 : 24, 4); ctx.fillStyle = acc; ctx.fillRect(1, -5, 3, 10); }
    } else if (cls === 'assassin') {
        ctx.rotate(armA - .15); ctx.fillStyle = '#e6eef5'; ctx.beginPath(); ctx.moveTo(0, -1.8); ctx.quadraticCurveTo(12, -3.4, 21, .4); ctx.quadraticCurveTo(12, 2.4, 0, 1.8); ctx.fill(); ctx.fillStyle = acc; ctx.fillRect(-3, -2.4, 4, 4.8);
    } else if (cls === 'bruiser') {                                             // forge hammer, glows with heat
        ctx.rotate(armA + .5); ctx.fillStyle = '#6b4a2e'; ctx.fillRect(-3, -1.6, 24, 3.2);
        const heat = Math.min(1, (u.forgeHeat || 0) / 100); ctx.fillStyle = '#7c8691'; ctx.fillRect(17, -7.5, 12, 15);
        if (heat > 0) { ctx.shadowColor = '#ff8d4d'; ctx.shadowBlur = 6 + heat * 10; ctx.fillStyle = `rgba(255,${Math.round(150 - heat * 60)},60,${.35 + heat * .5})`; ctx.fillRect(17, -7.5, 12, 15); ctx.shadowBlur = 0; }
        ctx.fillStyle = acc; ctx.fillRect(17, -2, 12, 4);
    } else if (cls === 'mage' || cls === 'support' || cls === 'caster') {      // staff with orb / ring
        ctx.rotate(-.12 + (swinging ? p * .7 : 0)); ctx.strokeStyle = '#b79b6a'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-1, 15); ctx.lineTo(2, -26); ctx.stroke();
        const rad = 4.2 + pulse * 1 + (swinging ? s.sw * 5 : 0), gl = ctx.createRadialGradient(2, -28, 0, 2, -28, rad * 3.2);
        gl.addColorStop(0, acc); gl.addColorStop(1, 'rgba(255,255,255,0)'); ctx.globalAlpha = .55; ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(2, -28, rad * 3.2, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1;
        if (cls === 'support') { ctx.strokeStyle = acc; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(2, -28, rad + 1.5, 0, 6.283); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(1, -31, 2, 6); ctx.fillRect(-1, -29, 6, 2); }
        else { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(2, -28, rad, 0, 6.283); ctx.fill(); ctx.fillStyle = acc; ctx.beginPath(); ctx.arc(2, -28, rad * .7, 0, 6.283); ctx.fill(); }
    } else if (cls === 'ranger') {                                              // bow, arrow, release flash
        ctx.translate(3, 0); ctx.rotate(-.1); const pull = swinging ? -4 * (s.sw > .6 ? 1 : 0) : 0;
        ctx.strokeStyle = '#caa46a'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(0, 0, 13, -1.15, 1.15); ctx.stroke();
        const bx = Math.cos(1.15) * 13, by = Math.sin(1.15) * 13; ctx.strokeStyle = '#e8eef2'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx, -by); ctx.lineTo(pull, 0); ctx.lineTo(bx, by); ctx.stroke();
        if (!swinging || s.sw > .6) { ctx.strokeStyle = acc; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(pull, 0); ctx.lineTo(16, 0); ctx.stroke(); }
        else { ctx.strokeStyle = acc; ctx.globalAlpha = s.sw * 1.6; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(40, 0); ctx.stroke(); ctx.globalAlpha = 1; }
    }
    ctx.restore();
    // orbiting accessories: oracle orbs, lumen prisms
    if (kind === 'oracle' || kind === 'lumen') {
        for (let i = 0; i < 3; i++) {
            const a = time * 2.2 + i * 2.094 + s.seed, ox = Math.cos(a) * 17, oy = -8 + Math.sin(a) * 6;
            ctx.fillStyle = acc; ctx.globalAlpha = .9; ctx.beginPath();
            if (kind === 'oracle') ctx.arc(ox, oy, 2.8, 0, 6.283);
            else { ctx.save(); ctx.translate(ox, oy); ctx.rotate(a * 2); ctx.moveTo(0, -4.5); ctx.lineTo(3.4, 3); ctx.lineTo(-3.4, 3); ctx.closePath(); ctx.restore(); }
            ctx.fill(); ctx.globalAlpha = 1;
        }
    }
    // hit flash
    if (s.flash > 0) { ctx.globalAlpha = Math.min(.55, s.flash * 4); torso('#fff', robe); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(1, -21, 7.6, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1; }
    ctx.restore();
}
function drawHeroCharacter(u, kind, team) {
    const look = CHAR_LOOK[kind] || CHAR_LOOK.guardian;
    drawCharacter(u, CHAR_CLASS[kind] || 'tank', { r: u.r, team, color: u.color, kind, skin: look[0], hair: look[1], accent: look[2] });
}
