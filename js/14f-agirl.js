/* Imported character (CC-BY-4.0): "Horned Anime Girl Tripo AI vs Meshy vs SupaVoxel" by Alina Berg.
   Decimated to ~46k triangles offline and split into palette colour groups so it uses the same cel/outline pipeline as the procedural heroes. */
const G3_AGH = 20, G3_AGA = 0;           // model height/2 in game units; facing angle in glTF xz-plane (0: model looks to +X, 90deg: +Z)
function g3AgMeshes(V, meshes) {
    try {
        const D = G3_AG, b64 = s => { const t = atob(s), u = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) u[i] = t.charCodeAt(i); return u.buffer; };
        const P = new Int16Array(b64(D.p)), N = new Int8Array(b64(D.n)), H = G3_AGH, fx = Math.cos(G3_AGA), fz = Math.sin(G3_AGA);
        const px = new Float32Array(D.np), py = new Float32Array(D.np), pz = new Float32Array(D.np), nx = new Float32Array(D.np), ny = new Float32Array(D.np), nz = new Float32Array(D.np);
        for (let i = 0; i < D.np; i++) {
            const gx = P[i * 3] / 16000, gy = P[i * 3 + 1] / 16000, gz = P[i * 3 + 2] / 16000, ax = N[i * 3] / 127, ay = N[i * 3 + 1] / 127, az = N[i * 3 + 2] / 127;
            px[i] = (gx * fx + gz * fz) * H; py[i] = (gx * fz - gz * fx) * H; pz[i] = (gy + 1) * H; nx[i] = ax * fx + az * fz; ny[i] = ax * fz - az * fx; nz[i] = ay;
        }
        G3.agK = [];
        D.k.forEach((c, k) => {
            const T = new Uint16Array(b64(c.t)), s = V.length / 6;
            for (let i = 0; i < T.length; i++) { const v = T[i]; V.push(px[v], py[v], pz[v], nx[v], ny[v], nz[v]); }
            meshes['ag' + k] = [s, T.length];
            let col = c.c; const r = parseInt(col.substr(1, 2), 16), g = parseInt(col.substr(3, 2), 16), bl = parseInt(col.substr(5, 2), 16);
            if (r + g + bl < 110) { const h = x => ('0' + Math.round(Math.min(255, x)).toString(16)).slice(-2); col = '#' + h(r * .5 + 30) + h(g * .5 + 28) + h(bl * .5 + 42); }
            G3.agK.push({ m: 'ag' + k, c: col, r: c.r });
        });
        G3.agOk = true;
    } catch (e) { G3.agOk = false; console.warn('imported model failed:', e); }
}
function g3AgDraw(C) {
    const { s, mv, sw, swinging, cst } = C, hair0 = G3.hair;
    g3Push();
    if (swinging) { g3T(sw * 3, 0, 0); g3RY(-sw * .3); }
    if (cst) g3T(0, 0, cst * 1.5);
    const stepB = mv * Math.abs(Math.sin(s.ph)) * .6; g3T(0, 0, stepB); g3RX(Math.sin(s.ph) * .06 * mv);
    const ol0 = G3.ol; G3.ol = 1.1;
    for (const k of G3.agK) {
        if (k.r === 4) { G3.hair = k.c; G3.mat = 0; } else G3.mat = k.r;
        g3D(k.m, k.c, 0, 1, 1);
    }
    G3.ol = ol0; G3.mat = 0; G3.hair = hair0; g3Pop(); g3Slash(C); g3CastFx(C);
}
try { const ag = document.querySelector('#agirl'); if (ag) ag.onchange = () => { options.agirl = ag.checked; applyOptions(); }; } catch (e) { }
