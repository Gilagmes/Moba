/* 3D character models (v465): authored humanoid rigs built from custom meshes (rounded boxes, pills, blades, gems, feathers, capes).
   Each hero/class has its own silhouette. Falls back to the v430 primitive models on any error. */
const G3_METAL = '#cfd8de', G3_DMETAL = '#59666f';
/* v465: swept glowing blade streak in front of a swinging unit */
function g3Slash(C) {
    if (!C.swinging || C.lod || options.reducedMotion || C.sw < .08) return;
    const al = Math.min(.75, C.sw * 1.3), ang = (C.p - .5) * -2.6, ol0 = G3.ol; G3.ol = 0; G3.mat = 0;
    g3Push(); g3T(1, 0, 14); g3RZ(ang); g3RX(.35); g3P('feather', '#ffffff', 3, 0, 0, 26, 5.5, 1, 1, al * .8, 2); g3RZ(-.22); g3P('feather', C.acc, 3, 0, 0, 30, 9, 1, 1, al * .5, 2); g3Pop(); G3.ol = ol0;
}
/* v465: skill-cast flash — each hero has its own style */
const G3_CASTSTY = { guardian: 'dome', forge: 'quake', phantom: 'cross', tempest: 'spiral', oracle: 'orbs', archon: 'orbs', lumen: 'orbs', seraph: 'halo', warden: 'halo' };
/* v465: ultimate — big flash on top of the normal cast style */
function g3UltFx(C, u) {
    const ol0 = G3.ol, e = 1 - u, acc = C.acc; G3.ol = 0; G3.mat = 0; g3Push(); g3T(0, 0, .6);
    const ring = (r, col, al, z) => { g3Push(); g3T(0, 0, z || 0); g3S(r, r, 1); g3D('ring', col, 1, Math.max(0, Math.min(.9, al)), 2); g3Pop(); };
    ring(14 + e * 56, acc, u * .9); ring(8 + e * 36, '#fff', u * .7); ring(5 + e * 22, acc, u * .6, e * 14);
    g3P('cyl6', acc, 0, 0, 0, 6 + u * 4, 6 + u * 4, 60 + e * 30, 1, u * .2, 2); g3P('cyl6', '#fff', 0, 0, 0, 1.6 + u * 1.4, 1.6 + u * 1.4, 70 + e * 30, 1, u * .3, 2);
    for (let i = 0; i < 10; i++) { const a = i * .628 + time * 2.2, d = 14 + e * 38; g3P('sph', i % 2 ? '#fff' : acc, Math.cos(a) * d, Math.sin(a) * d, 4 + e * 55 + (i % 4) * 7, 2.6 + u * 2, 2.6 + u * 2, 2.6 + u * 2, 1, u * .9, 2); }
    g3P('sph', '#fff', 0, 0, 16, 14 * u + 4, 14 * u + 4, 14 * u + 4, 1, u * u * .3, 2); g3Pop(); G3.ol = ol0;
}
function g3CastFx(C) {
    const gs = G3.ys.get(C.u), ult = gs && gs.ultT !== undefined ? Math.max(0, 1 - (time - gs.ultT) / 1.1) : 0, c = C.cst; if ((!c && !ult) || C.lod || options.reducedMotion) return; if (ult) g3UltFx(C, ult); if (!c) return; const ol0 = G3.ol, st = G3_CASTSTY[C.key] || 'dome', acc = C.acc, e = 1 - c, R = 12 + e * 30; G3.ol = 0; G3.mat = 0;
    g3Push(); g3T(0, 0, .6);
    const ring = (r, col, al, z) => { g3Push(); g3T(0, 0, z || 0); g3S(r, r, 1); g3D('ring', col, 1, Math.max(0, Math.min(.9, al)), 2); g3Pop(); };
    if (st === 'dome') { ring(R, acc, c * 1.1); ring(R * .55, '#fff', c * .7); g3P('cyl6', acc, 0, 0, 0, 5 + c * 3, 5 + c * 3, 28 + e * 24, 1, c * .38, 2); }
    else if (st === 'quake') { ring(R * 1.2, acc, c); ring(R * .7, '#fff', c * .6); for (let i = 0; i < 6; i++) { const a = i * 1.047 + .3, d = 8 + e * 26; g3Push(); g3T(Math.cos(a) * d, Math.sin(a) * d, 0); g3RZ(a); g3P('cone4', acc, 0, 0, 0, 3.4, 3.4, 10 * c + 2, 1, .8 * c + .1, 2); g3Pop(); } }
    else if (st === 'cross') { ring(R * .8, acc, c * .8); for (let i = 0; i < 2; i++) { g3Push(); g3T(0, 0, 12); g3RZ(i * 1.57 + .8 + e * 1.4); g3RX(.2); g3P('feather', '#fff', -17 - e * 8, 0, 0, 34 + e * 16, 3.6, 1, 1, c * .85, 2); g3P('feather', acc, -17 - e * 8, 0, 0, 34 + e * 16, 8, 1, 1, c * .45, 2); g3Pop(); } }
    else if (st === 'spiral') { for (let i = 0; i < 3; i++) ring(R * (.5 + i * .22), i ? acc : '#fff', c * .8, e * 26 + i * 7); g3P('cyl6', acc, 0, 0, 0, 3, 3, 40 + e * 20, 1, c * .3, 2); }
    else if (st === 'orbs') { ring(R * .8, acc, c * .7); for (let i = 0; i < 6; i++) { const a = i * 1.047 + time * 3, d = 10 + e * 6; g3P('sph', i % 2 ? '#fff' : acc, Math.cos(a) * d, Math.sin(a) * d, 4 + e * 34 + (i % 3) * 5, 2.4 + c * 1.6, 2.4 + c * 1.6, 2.4 + c * 1.6, 1, c * .9, 2); } g3P('sph', acc, 0, 0, 16, 9 * c + 4, 9 * c + 4, 9 * c + 4, 1, c * .25, 2); }
    else if (st === 'halo') { ring(R * .9, acc, c * .7); g3P('sph', acc, 0, 0, 14, 12 + e * 12, 12 + e * 12, 12 + e * 12, 1, c * .22, 2); g3Push(); g3T(0, 0, 40); g3S(9 + e * 4, 9 + e * 4, 1); g3D('ring', '#fff', 1, c * .9, 2); g3Pop(); }
    g3Pop(); G3.ol = ol0;
}
function g3Metal(fn) { G3.mat = 1; fn(); G3.mat = 0; }
function g3Hold(ang, mode, fn) { g3Push(); g3RY(mode === 'fwd' ? 1.05 - ang * .4 : mode === 'flat' ? Math.PI / 2 - ang : -ang); fn(); g3Pop(); }
function g3Limb(col, r, l1, l2, a1, a2, tip) {
    g3Push(); g3RY(a1); g3P('pill', col, 0, 0, -l1 / 2, r * 2, r * 2, l1 + r * .8);
    g3T(0, 0, -l1); g3P('sph', col, 0, 0, 0, r * 1.02, r * 1.02, r * 1.02);
    g3RY(a2); g3P('pill', col, 0, 0, -l2 / 2, r * 1.8, r * 1.8, l2 + r * .8);
    g3T(0, 0, -l2); if (tip) tip(a1 + a2); g3Pop();
}
const G3_KIND_MAP = { tank: 'guardian', assassin: 'phantom', mage: 'oracle', ranger: 'tempest', support: 'seraph', bruiser: 'forge', soldier: 'soldier', caster: 'caster', super: 'superk' };
const G3K = {
    guardian: {
        setup(C) { C.armor = true; C.tw = 12; C.legCol = shade(C.col, -.45); C.bootCol = '#2a3038'; C.armCol = shade(C.col, -.12); C.eyeCol = '#2d8fd0'; C.handCol = '#8a97a0';
            C.wep = (ang) => g3Hold(ang, 'fwd', () => { g3P('pill', '#5a4030', 0, 0, -1.5, 1.3, 1.3, 5); g3P('sq', C.acc, 0, 0, 1, 1.4, 7.4, 1.3, .5); g3Metal(() => g3P('blade', '#e8f1f6', 0, 0, 1.5, 3.6, 1.3, 20)); g3P('sph', '#c9a85a', 0, 0, -4.2, 1.7, 1.7, 1.7); });
            C.off = () => { g3P('sq', '#243c48', 2.3, .8, .8, 1.9, 7.4, 10.5); g3P('sq', C.acc, 3.2, .8, .8, .6, 4.6, 6.8, .6 + C.pulse * .3); g3Push(); g3T(3.5, .8, .8); g3RY(Math.PI / 2); g3S(1.7, 1.7, 1.2); g3D('gem6', C.teamC, 1); g3Pop(); }; },
        post(C) { const { tw, col, acc, teamC, mv, s, light } = C;
            G3.mat = 1; g3P('sq', '#9db6c4', 1.1, 0, 18.6, tw * .82, 6.2, 4.6); g3Push(); g3T(4, 0, 18.7); g3RY(Math.PI / 2); g3S(2.3, 2.3, 1.2); g3D('gem6', acc, .9); g3Pop();
            for (const sd of [-1, 1]) { g3P('sq', light, 0, sd * (tw / 2 + 1.7), 21.2, 5.8, 5.4, 3.8); g3P('sq', acc, 0, sd * (tw / 2 + 1.7), 22.9, 4.8, 4.4, .9, .5); }
            G3.mat = 0; g3P('sq', teamC, 3.3, 0, 8.6, .9, 5.6, 6.5, .15); G3.mat = 1;
            g3P('sq2', shade(col, -.2), -.6, 0, 30.9, 8.7, 9.1, 6.2); g3P('sq', '#9db6c4', 3.9, 0, 28.6, .8, 1, 4.6); g3P('sq', acc, 3.7, 0, 29.9, .8, 8.4, .9, .7);
            G3.mat = 0; g3Push(); g3T(-1.8, 0, 33.6); g3RY(-.5 - mv * .2); g3P('cone4', teamC, 0, 0, 0, 3.6, 2.2, 10, .6); g3Pop();
            for (const sd of [-1, 1]) { g3Push(); g3T(-.8, sd * 4.6, 31.6); g3RX(sd * -.5); g3RZ(sd * 1.2); g3S(6, 2.6, 1); g3D('feather', '#f2f7fa', .35, 1, 1); g3Pop(); }
            g3Push(); g3T(-3.8, 0, 21.4); g3RY(.1 + mv * .3 + Math.sin(time * 3 + s.seed) * .06 * (1 + mv * 2)); g3S(5.2, tw + 3, 17.5); g3D('cape', shade(col, -.55)); g3Pop(); } },
    warden: {
        setup(C) { C.armor = true; C.tw = 12.6; C.legCol = shade(C.col, -.5); C.bootCol = '#241f33'; C.armCol = shade(C.col, -.2); C.eyeCol = '#b690ff'; C.handCol = shade(C.col, .1);
            C.wep = (ang) => g3Hold(ang, 'flat', () => { G3.mat = 1; g3P('sq2', shade(C.col, .15), 1.4, 0, 0, 6.2, 5.6, 6, .15); G3.mat = 0; for (let i = 0; i < 2; i++) { g3Push(); g3T(2, 0, 0); g3RX(time * 2 + i * 1.5); g3RY(1 + i * .6); g3S(8 + i * 3 + (C.swinging ? C.sw * 4 : 0), 8 + i * 3, 1); g3D('ring', C.acc, 1, .85, 2); g3Pop(); } });
            C.off = () => { g3P('sq2', shade(C.col, .1), 1, 0, -.5, 5.2, 4.8, 5.4); }; },
        post(C) { const { tw, col, acc, mv, s } = C;
            g3P('sq', shade(col, .06), 1, 0, 18.4, tw * .86, 6.4, 5.4); g3P('sq2', shade(col, -.45), -1.4, 0, 29.8, 9, 10, 9.6); g3P('sq', '#1a1526', 3.5, 0, 25.6, 1.2, 6.8, 2.6);
            g3Push(); g3T(-4.6, 0, 33); g3RY(-2.1); g3P('cone', shade(col, -.45), 0, 0, 0, 4.4, 4.4, 8); g3Pop();
            for (const sd of [-1, 1]) { g3P('sq', shade(col, .15), 0, sd * (tw / 2 + 2), 21.2, 6.6, 6, 4.2); g3Push(); g3T(0, sd * (tw / 2 + 2.8), 22.6); g3RX(sd * -.55); g3S(2.4, 2.4, 6.5); g3D('horn', acc, .5); g3Pop(); }
            g3Push(); g3T(0, 0, 15); g3RX(1.45); g3RZ(time * .8); g3S(12, 12, 1); g3D('ring', acc, .8, .55, 2); g3Pop();
            g3Push(); g3T(-3.8, 0, 21.2); g3RY(.12 + mv * .3 + Math.sin(time * 3 + s.seed) * .05); g3S(5, tw + 3, 15); g3D('cape', shade(col, -.6)); g3Pop(); } },
    phantom: {
        setup(C) { C.tw = 9.2; C.legCol = shade(C.col, -.55); C.bootCol = '#15111f'; C.armCol = shade(C.col, -.35); C.eyeCol = '#e65bd8'; C.handCol = '#1d1830'; C.lean = .12;
            const dagger = (ang) => g3Hold(ang, 'fwd', () => { g3P('pill', '#2a2236', 0, 0, -1.2, 1.2, 1.2, 4); g3P('sq', C.acc, 0, 0, 1, 1.2, 4.4, 1, .5); g3Metal(() => g3P('blade', '#e6eef5', 0, 0, 1.4, 2.6, .9, 13)); });
            C.wep = dagger; C.off = dagger; },
        post(C) { const { tw, col, acc, mv, s } = C, sw2 = Math.sin(time * 9 + s.seed);
            g3P('sq', shade(col, -.2), .6, 0, 18.4, tw * .9, 6.2, 5);
            g3P('sq2', shade(col, -.6), -1.7, 0, 29.4, 8.8, 9.8, 9.2); g3P('sq', '#17121f', 3.5, 0, 25.4, 1.2, 6.8, 3.2);
            g3Push(); g3T(-4.8, 0, 32); g3RY(-2.2); g3P('cone', shade(col, -.6), 0, 0, 0, 5, 5, 10); g3Pop();
            for (let k = 0; k < 2; k++) { g3Push(); g3T(-3.6, (k ? 1.6 : -1.6), 20.4); g3RY(.5 + mv * .8 + sw2 * .14); g3RX((k ? .1 : -.1) + sw2 * .1 * (k ? 1 : -1)); g3S(1.6, 1.6, 10 + mv * 2.5); g3D('cape', shade(acc, -.35), .2); g3Pop(); }
            g3Push(); g3T(-4.4, 0, 14); g3RY(.5); g3P('pill', '#1d1830', 0, 0, 0, 2.2, 2.2, 9); g3Pop(); } },
    oracle: {
        setup(C) { C.fem = true; C.tw = 9.4; C.robe = true; C.bootCol = '#4a3a26'; C.armCol = shade(C.col, -.05); C.eyeCol = '#c8921c'; C.handCol = C.skin;
            C.wep = (ang) => g3Hold(ang, 'up', () => { g3P('pill', '#b79b6a', 0, 0, 9, 1.3, 1.3, 34); g3P('sph', '#fff', 0, 0, 27, 3.2 + C.pulse * .4, 3.2 + C.pulse * .4, 3.2 + C.pulse * .4, 1); g3P('sph', C.acc, 0, 0, 27, 6.5, 6.5, 6.5, .8, .4, 2); for (const sd of [-1, 1]) g3P('sq', C.acc, 0, sd * 1.6, 24, 1.2, 1, 3, .6); }); },
        post(C) { const { tw, col, acc, hair, s, mv } = C;
            g3P('rob', acc, 0, 0, .6, 7.6, 7.6, 1.3, .5); g3P('sq', acc, 0, 0, 12.7, tw * .9, 6.4, 1.1, .6);
            g3P('sq2', hair, -4, 0, 23.4, 5.8, 8.2, 13.5); for (const sd of [-1, 1]) g3P('pill', hair, -1, sd * 4.4, 24.4, 2.6, 2.6, 9);
            g3P('sq2', hair, -.5, 0, 30.4, 8.6, 9.1, 5); for (const sd of [-1, 1]) g3P('sq2', hair, 2.7, sd * 3.1, 29.7, 3, 2.8, 3);
            g3P('gem6', acc, 3.9, 0, 31.2, 1.5, 1.5, 2.3, 1);
            for (let i = 0; i < 3; i++) { const a = time * 2.2 + i * 2.094 + s.seed; g3P('sph', acc, Math.cos(a) * 12, Math.sin(a) * 12, 19 + Math.sin(a * 2) * 2, 2.3, 2.3, 2.3, 1); } } },
    archon: {
        setup(C) { C.armor = true; C.tw = 11; C.legCol = shade(C.col, -.45); C.bootCol = '#2b3340'; C.armCol = shade(C.col, -.1); C.eyeCol = '#3a9ad8'; C.handCol = '#9aa8b4';
            C.wep = (ang) => g3Hold(ang, 'up', () => { g3P('pill', '#8793a0', 0, 0, 8, 1.4, 1.4, 30); g3Push(); g3T(0, 0, 25); g3RZ(time); g3S(3.2, 3.2, 6.5); g3D('gem6', C.acc, 1.1); g3Pop(); }); },
        post(C) { const { tw, col, acc, hair, light, s, mv } = C;
            G3.mat = 1; g3P('sq', light, 1, 0, 18.5, tw * .84, 6.2, 5); G3.mat = 0; g3P('sq', acc, 3.9, 0, 18.7, .8, 4, 2.4, .8); g3P('sq', acc, 0, 0, 21.3, tw * .78, 6.2, 1, .5);
            g3P('sq2', hair, -.5, 0, 30.3, 8.7, 9.2, 5.2); for (let i = 0; i < 3; i++) g3P('cone4', hair, -3.2, (i - 1) * 2.8, 31.5, 2.4, 2.4, 6);
            for (const sd of [-1, 1]) g3P('gem6', acc, 0, sd * (tw / 2 + 4.6), 22.5 + Math.sin(time * 2.4 + sd) * 1.6, 2, 2, 4.4, 1);
            g3Push(); g3T(-3.6, 1, 21.2); g3RY(.12 + mv * .3 + Math.sin(time * 3 + s.seed) * .05); g3S(4, tw + 2.5, 15); g3D('cape', shade(col, -.45)); g3Pop(); } },
    lumen: {
        setup(C) { C.fem = true; C.tw = 9.2; C.robe = true; C.bootCol = '#5a3a5a'; C.armCol = C.skin; C.eyeCol = '#c050d8'; C.handCol = C.skin;
            C.wep = (ang) => g3Hold(ang, 'up', () => { g3P('pill', '#cfa9d8', 0, 0, 6, 1.1, 1.1, 24); g3Push(); g3T(0, 0, 19); g3RZ(time * 1.4); g3S(3, 3, 6); g3D('gem6', C.acc, 1.1); g3Pop(); }); },
        post(C) { const { tw, col, acc, hair, s, mv } = C, fl = Math.sin(time * 5 + s.seed) * .22;
            g3P('rob', acc, 0, 0, .6, 7.4, 7.4, 1.2, .6); g3P('sq', acc, 0, 0, 12.7, tw * .9, 6.3, 1, .6);
            g3P('sq2', hair, -.5, 0, 30.4, 8.6, 9.2, 5); g3P('sq2', hair, -3.4, 0, 26, 4.6, 8, 8);
            for (const sd of [-1, 1]) { const sw = Math.sin(time * 3 + sd + s.seed) * 1.2 + mv * sd; g3P('pill', hair, -1.6, sd * 5.4 + sw, 23.2, 3, 3, 13); g3Push(); g3T(-.4, sd * 5.2, 30); g3RX(sd * .6); g3S(2.2, 4.4, 2.2); g3D('gem6', acc, 1); g3Pop(); }
            for (const sd of [-1, 1]) for (let i = 0; i < 2; i++) { g3Push(); g3T(-3.4, sd * 3, 19.5 - i * 2); g3RX(sd * (.45 + fl)); g3RZ(sd * (1.25 + i * .5)); g3S(10 - i * 2.4, 3.6, 1); g3D('feather', acc, .6, .88, 1); g3Pop(); }
            for (let i = 0; i < 3; i++) { const a = time * 2.2 + i * 2.094 + s.seed; g3Push(); g3T(Math.cos(a) * 12, Math.sin(a) * 12, 20 + Math.sin(a * 2) * 2); g3RZ(a * 2); g3S(2.2, 2.2, 4); g3D('gem6', acc, 1); g3Pop(); } } },
    seraph: {
        setup(C) { C.fem = true; C.tw = 9.4; C.robe = true; C.bootCol = '#b78c9a'; C.armCol = shade(C.col, .02); C.eyeCol = '#e0508a'; C.handCol = C.skin;
            C.wep = (ang) => g3Hold(ang, 'up', () => { g3P('pill', '#d8b878', 0, 0, 9, 1.3, 1.3, 33); g3P('sph', C.acc, 0, 0, 26, 3.2, 3.2, 3.2, .8); g3P('cube', '#fff', 0, 0, 27.5, 1.2, 1.2, 8, 1); g3P('cube', '#fff', 0, 0, 27.5, 1.2, 6, 1.2, 1); }); },
        post(C) { const { tw, col, acc, hair, s, mv } = C, fl = Math.sin(time * 4 + s.seed) * .2 * (1 + mv);
            g3P('rob', '#ffe9a0', 0, 0, .6, 7.7, 7.7, 1.3, .5); g3P('sq', '#ffe9a0', 0, 0, 12.7, tw * .9, 6.3, 1.1, .5);
            g3P('sq2', hair, -4.1, 0, 22.8, 6, 8.4, 15); g3P('sq2', hair, -.5, 0, 30.4, 8.6, 9.2, 5); for (const sd of [-1, 1]) g3P('sq2', hair, 2.6, sd * 3.2, 29.6, 3, 2.8, 3);
            g3Push(); g3T(0, 0, 36.6); g3S(5.4, 5.4, 1); g3D('ring', '#ffe9a0', 1, .95, 2); g3Pop();
            for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) { g3Push(); g3T(-3.6, sd * 2.6, 20.6 - i * 1.4); g3RX(sd * (.5 + fl + i * .06)); g3RZ(sd * (1.0 + i * .34)); g3S(12 - i * 1.4, 3.8, 1); g3D('feather', i % 2 ? '#fff4f8' : '#ffd1e8', .5, 1, 1); g3Pop(); } } },
    tempest: {
        setup(C) { C.fem = true; C.armor = false; C.tw = 9.6; C.legCol = '#5a4632'; C.bootCol = '#3a2c1e'; C.armCol = shade(C.col, -.1); C.eyeCol = '#2f9a5a'; C.handCol = '#7a5a3a';
            C.armBase = -1.0 + (C.swinging ? C.sw * .5 : 0); C.armBend = -1.25; C.offA1 = -1.5; C.offA2 = -.1;
            C.wep = () => { };
            C.off = (ang) => g3Hold(ang, 'up', () => { const n = 7, seg = []; for (let i = 0; i <= n; i++) { const t = i / n * 2 - 1; seg.push([2.6 - t * t * 3.2, 12 * t]); }
                for (let i = 0; i < n; i++) { const a = seg[i], b = seg[i + 1], dx = b[0] - a[0], dz = b[1] - a[1]; g3Push(); g3T((a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2); g3RY(Math.atan2(dx, dz)); g3P('pill', '#caa46a', 0, 0, 0, 1.2, 1.2, Math.hypot(dx, dz) + .8); g3Pop(); }
                g3P('pill', '#e8eef2', -.6, 0, 0, .4, .4, 24); g3Push(); g3T(-.6, 0, 0); g3RY(Math.PI / 2); g3P('pill', '#caa46a', 0, 0, 5, .7, .7, 16); g3P('cone4', C.acc, 0, 0, 13, 1.2, 1, 3, .8); g3Pop(); }); },
        post(C) { const { tw, col, acc, hair, s, mv } = C;
            g3P('sq', '#6a4a30', .8, 0, 18.4, tw * .88, 6.2, 5.2); g3P('sq', acc, 0, 0, 12.5, tw * .9, 6.4, 1, .5);
            g3P('sq2', hair, -.6, 0, 30.5, 8.6, 9.1, 5.2); g3P('sq', acc, 0, 0, 29.4, 8.7, 9.2, 1.3, .6);
            g3P('sph', hair, -4.6, 0, 29.6 + Math.sin(time * 6) * .6, 2.6, 2.4, 2.6); g3P('sph', hair, -6.4, Math.sin(time * 6 + 1) * 1.4, 26.6, 2.3, 2.1, 3.6); g3P('sph', hair, -7.2, Math.sin(time * 6 + 2) * 2, 22.8, 1.9, 1.7, 3.4);
            g3Push(); g3T(-4.4, -2, 15); g3RY(.5); g3P('pill', '#6a4a30', 0, 0, 5, 3.2, 3.2, 12); for (let i = 0; i < 3; i++) g3P('cone4', acc, 0, (i - 1) * 1.1, 12.4, 1.1, 1.1, 3.4, .6); g3Pop(); } },
    forge: {
        setup(C) { C.armor = true; C.tw = 14; C.legCol = '#3a3a44'; C.bootCol = '#2a2a30'; C.armCol = C.skin; C.eyeCol = '#d8661e'; C.handCol = '#3a2c22';
            C.wep = (ang) => g3Hold(ang, 'fwd', () => { const heat = Math.min(1, (C.u.forgeHeat || 0) / 100); g3P('pill', '#6b4a2e', 0, 0, 6, 1.9, 1.9, 25); G3.mat = heat > .1 ? 0 : 1; g3P('sq', heat > .1 ? '#ff9a4d' : '#7c8691', 0, 0, 22, 9.5, 7.2, 8.6, heat); G3.mat = 0; g3P('sq', C.acc, 0, 0, 22, 9.9, 7.5, 2.2, .7); }); },
        post(C) { const { tw, col, acc, hair, s, mv, teamC } = C;
            g3P('sq', '#6a4630', 3.4, 0, 9.2, 1, tw * .6, 9);
            g3P('sq', shade(col, -.1), .4, 0, 18.4, tw * .96, 7, 6.2);
            g3P('sq', '#4a4f5a', 0, tw / 2 + 1.7, 21.4, 7, 6.2, 4.4); g3P('sq', acc, 0, tw / 2 + 1.7, 23.2, 5.6, 5, .9, .6);
            g3P('sq2', hair, -.6, 0, 30.5, 8.6, 9.1, 5); for (let i = 0; i < 5; i++) { const f = Math.sin(time * 10 + i * 1.7); g3P('cone4', i % 2 ? '#ffb84d' : hair, -1 + (i % 2) * 2, -5 + i * 2.5, 32.5, 2.6, 2.6, 8 + (i % 2) * 3 + f * 1.4, 1); }
            g3P('pill', '#2a2a30', 0, 0, 29.6, 1.2, 9.6, 1.2); for (const sd of [-1, 1]) g3P('sq2', acc, 3.4, sd * 2.3, 30.6, 1.8, 3.2, 3.2, .8);
            g3P('sq', '#4b4f58', -5.6, 0, 16, 4.4, 8.4, 10); for (let i = 0; i < 3; i++) g3P('cone4', '#ff9a4d', -8, (i - 1) * 2.4, 18 + i % 2, 1.4, 1.4, 4 + Math.sin(time * 9 + i) * 1.2, 1); } },
    soldier: {
        setup(C) { C.armor = true; C.tw = 9.4; C.legCol = shade(C.col, -.5); C.bootCol = '#2a2f38'; C.armCol = shade(C.col, -.2); C.eyeCol = '#2a3a52'; C.handCol = '#7d8791';
            C.wep = (ang) => g3Hold(ang, 'fwd', () => { g3P('pill', '#8a6a44', 0, 0, 6, 1, 1, 30); g3Metal(() => g3P('cone4', '#dfe6ec', 0, 0, 22, 2.2, 1.2, 8)); });
            C.off = () => { g3Push(); g3T(2.3, .6, .4); g3RY(Math.PI / 2); g3P('pill', '#3a5a6a', 0, 0, 0, 8, 8, 1.6); g3P('sph', C.teamC, 1, 0, 0, 1.8, 1.8, 1.4, .8); g3Pop(); }; },
        post(C) { const { tw, col, teamC } = C; g3P('sq', teamC, 3.3, 0, 12, .9, 5.4, 9, .15); g3P('sq2', '#7d8791', -.5, 0, 30.8, 8.5, 9, 6); g3P('sq', teamC, 3.7, 0, 30, .8, 8.2, 1.2, .5); } },
    caster: {
        setup(C) { C.tw = 9.4; C.robe = true; C.bootCol = '#2a2230'; C.armCol = shade(C.col, -.1); C.eyeCol = '#2a3a52'; C.handCol = C.skin;
            C.wep = (ang) => g3Hold(ang, 'up', () => { g3P('pill', '#b79b6a', 0, 0, 8, 1.2, 1.2, 28); g3P('sph', '#fff', 0, 0, 23, 2.8, 2.8, 2.8, 1); g3P('sph', C.acc, 0, 0, 23, 5.4, 5.4, 5.4, .8, .4, 2); }); },
        post(C) { const { col, hair, teamC } = C; g3P('rob', teamC, 0, 0, .6, 7.5, 7.5, 1.1, .5); g3P('sq2', hair, -.5, 0, 30.2, 8.5, 9, 4.6);
            g3P('pill', shade(col, -.4), 0, 0, 32.4, 11.4, 11.4, 1.3); g3Push(); g3T(-.6, 0, 32.8); g3RY(-.18); g3P('cone', shade(col, -.4), 0, 0, 0, 6.4, 6.4, 12); g3Pop(); } },
    superk: {
        setup(C) { G3K.guardian.setup(C); C.tw = 13; },
        post(C) { G3K.guardian.post(C); } }
};
function g3Model(u, cls, o, sx, sy, sc, dth) {
    const s = charAnim(u), r = (o.r || u.r || 20), S = r / 20 * 1.25 * sc, kind = o.kind || '';
    const reduced = options.reducedMotion, mv = reduced ? 0 : s.mv, lod = G3.lod;
    const bob = reduced ? 0 : Math.abs(Math.sin(s.ph)) * 1.2 * mv + Math.sin(time * 2.2 + s.seed) * .3 * (1 - mv);
    const sw = s.sw, p = 1 - sw, swinging = sw > 0, swing = Math.sin(s.ph) * .85 * mv, pulse = .5 + .5 * Math.sin(time * 4 + s.seed);
    const teamC = o.team === 'red' ? '#ff5a6e' : '#4fdcff', col = o.color || '#8ab', acc = o.accent || '#fff', skin = o.skin || '#e8c39e', hair = o.hair || '#2b2f3a';
    const yaw = g3Yaw(u, s), gy = sy + 14 * S, cst = dth ? 0 : g3Cast(u), dk = 1 - dth * .55;
    G3.flash = s.flash > 0 ? Math.min(.7, s.flash * 5) : 0; G3.ol = 1.6; if (dth) G3.flash = Math.max(G3.flash, .65 * (1 - dth));
    g3Id(sx, gy, .2, 1); g3Push(); g3T(5.5 * S * dk, -2.8 * S * dk, 0); g3S(19 * S * dk, 7.6 * S * dk, 1); g3D('disc', '#000', 0, .38 * (1 - dth), 0); g3Pop();
    if (!dth) { g3Push(); g3S(20 * S, 8.2 * S, 1); g3D('ring', teamC, 1, .95, 0); g3Pop(); }
    const gs = G3.ys.get(u), pop = gs ? Math.min(1, .55 + (time - (gs.born || (gs.born = time))) * 3.2) : 1, over = pop < 1 ? 1 : 1 + Math.max(0, .12 - (time - gs.born - .14) * .5) * (time - gs.born < .4 ? 1 : 0);
    const key = G3K[kind] ? kind : G3_KIND_MAP[cls] || 'guardian', K = G3K[key];
    const C = { u, s, cls, kind, key, col, acc, skin, hair, teamC, mv, swing, sw, p, swinging, pulse, cst, lod, light: shade(col, .22), tw: 10, robe: false, legCol: shade(col, -.4), bootCol: '#2a2f38', armCol: col, eyeCol: '#2a3a52', handCol: skin, lean: 0 };
    K.setup(C);
    g3Id(sx, gy, 0, S * 1.62 * pop * over * dk * (cls === 'super' ? 1.18 : 1)); g3RZ(yaw); g3T(0, 0, bob);
    if (!lod) g3RY(mv * .1 + (swinging ? sw * .22 : 0) + C.lean); if (dth) g3RY(-dth * 1.3); if (cst) g3RY(cst * .18);
    if (key === 'phantom' && G3.agOk && options.agirl !== false) { g3AgDraw(C); K.post && 0; return; }
    const tw = C.tw;
    // ---- legs / skirt ----
    if (!C.robe) { for (const sd of [-1, 1]) { g3Push(); g3T(0, sd * tw * .22, 10.2); const a = swing * sd; g3Limb(C.legCol, 1.55 * tw / 10, 5, 5, a, Math.max(0, -a) * .9 + .05, () => { g3P('sq', C.bootCol, 1.2, 0, -.3, 4.8, 3.2, 2.8); if (!lod) { G3.mat = C.armor ? 1 : 0; g3P('pill', C.armor ? '#8d9aa4' : shade(C.legCol, .15), 0, 0, 2.7, 3.6 * tw / 10, 3.6 * tw / 10, 4.6); G3.mat = 0; g3P('sq', C.bootCol, 2.8, 0, -.2, 1.6, 2.8, 1.8); } }); g3Pop(); } }
    else { g3P('rob', C.col, 0, 0, .6, 7.2 + mv * .3, 7.2, 13); g3P('sq', C.bootCol, 2.4 + swing * 1.6, 2.4, .8, 4, 2.6, 1.8); g3P('sq', C.bootCol, 2.4 - swing * 1.6, -2.4, .8, 4, 2.6, 1.8); }
    // ---- torso ----
    if (!C.robe) g3P('sq', C.legCol, 0, 0, 10.6, tw * .82, 6, 3.6);
    g3P('sq', teamC, 0, 0, 12.4, tw * .86, 6.4, 1.2, .5);
    g3P('sq', C.robe ? shade(col, .04) : col, 0, 0, 16.2, tw, 6.8, 8.6); g3P('sq', shade(col, .1), .4, 0, 18.4, tw * .94, 6.5, 4.8);
    if (!lod) {
        if (!C.robe) { g3Push(); g3T(3.5, 0, 16.6); g3RX(.62); g3P('sq', shade(acc, -.25), 0, 0, 0, .9, 1.5, 12.8); g3Pop(); for (const sd of [-1, 1]) g3P('sq', shade(col, -.55), 0, sd * tw * .46, 11.3, 2.4, 2.6, 2.8); }
        else { g3Push(); g3T(3, 3, 12.6); g3RY(.1 + Math.sin(time * 3 + s.seed) * .06 + mv * .3); g3S(2, 2.6, 7.5); g3D('cape', shade(acc, -.2), .25); g3Pop(); }
        g3P('gem6', acc, 3.9, 0, 12.5, 1.5, 1.5, 2, .9);
    }
    G3.hair = hair; G3.mat = 2; g3P('pill', skin, 0, 0, 21.5, 2.6, 2.6, 2.4);
    // ---- head & face ----
    G3.mat = 2; g3P('sq2', skin, 0, 0, 27.6, 7.6, 8.2, 8); G3.mat = 0;
    const ol0 = G3.ol; G3.ol = .45;
    G3.mat = 0; g3P('sq2', '#fff', 3.3, 2.1, 27.6, .9, 2.1, 2.7); g3P('sq2', '#fff', 3.3, -2.1, 27.6, .9, 2.1, 2.7);
    for (const sd of [-1, 1]) {            // anime eyes: dark upper lid, iris with gradient, pupil, two highlights
        g3P('sq2', C.eyeCol, 3.75, sd * 2.1, 27.5, .8, 1.6, 2.5); g3P('sq2', shade(C.eyeCol, .4), 3.85, sd * 2.1, 26.6, .7, 1.25, 1.1); g3P('sq2', '#10131c', 3.95, sd * 2.1, 27.7, .6, .8, 1.5);
        g3P('sq', '#171221', 3.7, sd * 2.1, 29.0, .5, 3.0, .32);
    }
    if (!lod) {
        g3P('sq2', '#fff', 4.2, 1.7, 28.4, .4, .7, .95, 1); g3P('sq2', '#fff', 4.2, -2.5, 28.4, .4, .7, .95, 1); g3P('sq2', '#fff', 4.15, 2.5, 26.5, .3, .4, .45, 1); g3P('sq2', '#fff', 4.15, -1.7, 26.5, .3, .4, .45, 1);
        g3P('sq', shade(hair, -.2), 3.3, 2.2, 29.7, .6, 2.6, .6); g3P('sq', shade(hair, -.2), 3.3, -2.2, 29.7, .6, 2.6, .6);
        g3P('sq2', shade(skin, -.1), 3.9, 0, 26.2, 1, 1, 1); g3P('sq', '#8a4a4a', 3.7, 0, 24.9, .4, 2, .5);
        g3P('sq2', skin, 0, 4.1, 27.3, 1.3, 1, 2.2); g3P('sq2', skin, 0, -4.1, 27.3, 1.3, 1, 2.2);
        if (C.fem) for (const sd of [-1, 1]) { g3P('sq2', '#f09aa6', 3.4, sd * 3.3, 25.9, .5, 1.7, 1.1); g3P('sq', '#1a1220', 3.5, sd * 2.9, 29, .5, 2.4, .5); }
    }
    G3.ol = ol0;
    // ---- arms ----
    const armBase = C.armBase !== undefined ? C.armBase : (swinging ? .55 - 2.7 * p : -.25 + Math.sin(time * 2 + s.seed) * .05 - Math.abs(swing) * .15);
    const armBend = C.armBend !== undefined ? C.armBend : (swinging ? -.25 : -.55);
    const offA1 = (C.offA1 !== undefined ? C.offA1 : -.15 - swing * .35) * (1 - cst) - 2.1 * cst, offA2 = (C.offA2 !== undefined ? C.offA2 : -.35) * (1 - cst) - .2 * cst;
    for (const sd of [1, -1]) {
        const weapon = sd === -1, a1 = weapon ? armBase : offA1, a2 = weapon ? armBend : offA2;
        g3Push(); g3T(0, sd * (tw / 2 + 1.5), 19.6);
        g3Limb(C.armCol, 1.45, 4.8, 4.4, a1, a2, (ang) => {
            if (!lod) { G3.mat = C.armor ? 1 : 0; g3P('pill', shade(C.armCol, C.armor ? .2 : -.1), 0, 0, 2.3, 3.1, 3.1, 3.4); G3.mat = 0; } g3P('sq2', C.handCol, 0, 0, -1, 3.2, 3, 3.2);
            if (cst && !weapon) g3P('sph', acc, 0, 0, -2, 3 + cst * 3, 3 + cst * 3, 3 + cst * 3, 1, .85 * cst, 2);
            const f = weapon ? C.wep : C.off; if (f) f(ang);
        });
        g3Pop();
    }
    g3Slash(C); g3CastFx(C); K.post(C); G3.mat = 0;
}
function g3Char(u, cls, o, sx, sy, sc, dth) {
    if (cls === 'siege') return g3CharLegacy(u, cls, o, sx, sy, sc, dth);
    try { g3Model(u, cls, o, sx, sy, sc, dth); }
    catch (e) { if (!G3.merr) { G3.merr = String(e && e.message || e); console.warn('3D model error:', G3.merr); } g3CharLegacy(u, cls, o, sx, sy, sc, dth); }
}
