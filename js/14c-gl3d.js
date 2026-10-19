/* 3D layer (v455): procedural low-poly cel-shaded WebGL models (heroes, minions, monsters, towers, inhibitors, nexus).
   No external libraries or assets. Map, HUD, effects stay 2D. Any failure -> automatic fallback to the 2D art. */
const G3 = { act: false, tried: false, ok: false, gl: null, cv: null, W: 0, H: 0, M: new Float32Array(16), st: [], sp: 0, flash: 0, ol: 0, mat: 0, meshes: {}, col: new Map(), lod: false, n: 0, pool: [null, null, null], cnt: [0, 0, 0], ys: new WeakMap(), seen: new Map(), corpses: [], frame: 0 };
const G3_CMAX = 2600, G3_K = 0.8;
const G3_PR = `uniform vec3 uCam;uniform vec2 uScr;uniform vec4 uPR;
vec4 pr(vec3 p){
if(uPR.x<.5)return vec4(p.x*2./uCam.x-1.,1.-(p.y-p.z*${G3_K.toFixed(2)})*2./uCam.y,-(p.y+.6*p.z-uCam.y*.5)/(uCam.y*.5+700.),1.);
float D=uPR.y,cp=uPR.z,sp=uPR.w,u=p.x-uCam.x*.5,v=p.y-uCam.y*.5,z=p.z*1.35;float zc=D-v*cp-z*sp,yc=-v*sp+z*cp;
return vec4(u*D*2./uScr.x,yc*D*2./uScr.y,1.06897*zc-413.79,zc);}`;
const G3_VS = `attribute vec3 aP;attribute vec3 aN;attribute vec4 aM0;attribute vec4 aM1;attribute vec4 aM2;attribute vec4 aM3;attribute vec4 aC;attribute vec4 aQ;uniform mediump float uOP;varying vec3 vN;varying vec4 vC;varying vec2 vQ;varying float vZ;varying float vH;
${G3_PR}
void main(){mat4 uM=mat4(aM0,aM1,aM2,aM3);vec4 w=uM*vec4(aP,1.);vec3 n=normalize(mat3(uM)*aN);vec4 c=pr(w.xyz);
if(uOP>.5){vec4 c2=pr(w.xyz+n*8.);vec2 d=(c2.xy/c2.w-c.xy/c.w)*uScr*.5;float l=length(d);d=l>1e-4?d/l:vec2(0.,-1.);c.xy+=d*aQ.w*2./uScr*c.w;c.z+=.004*c.w;}
vN=n;vC=aC;vQ=aQ.yz;vZ=w.z;vH=uPR.x>.5?smoothstep(1250.,1650.,c.w)*.5:0.;gl_Position=c;}`;
const G3_GVS = `attribute vec2 aG;varying vec2 vT;varying float vH;${G3_PR}
void main(){vT=aG/uCam.xy;vec4 c=pr(vec3(aG,0.));vH=smoothstep(1250.,1650.,c.w)*.5;gl_Position=c;}`;
const G3_GFS = `precision mediump float;varying vec2 vT;varying float vH;uniform sampler2D uTex;
void main(){vec3 c=texture2D(uTex,vT).rgb;c=mix(c,vec3(.02,.07,.09),vH);gl_FragColor=vec4(c,1.);}`;
const G3_FS = `precision mediump float;varying vec3 vN;varying vec4 vC;varying vec2 vQ;varying float vZ;varying float vH;uniform mediump float uOP;
void main(){vec4 uC=vC;if(uOP>.5){gl_FragColor=vec4(uC.rgb*.22*uC.a,uC.a);return;}
vec3 n=normalize(vN);float mat=floor((vQ.x+.01)/4.);float em=vQ.x-mat*4.;
if(mat>2.5){float f=pow(max(dot(n,normalize(vec3(0.,.5,.85))),0.),1.5);gl_FragColor=vec4(uC.rgb*uC.a*f*1.5,0.);return;}
float d=dot(n,normalize(vec3(-.45,.5,.78)));
float b=.56+.2*smoothstep(-.1,.08,d)+.24*smoothstep(.45,.62,d);
float rim=pow(1.-max(dot(n,normalize(vec3(0.,.5,.85))),0.),3.)*.3;
vec3 col=uC.rgb*b*vec3(1.03,1.,.97)+rim*vec3(.55,.75,1.)*.55+uC.rgb*max(n.z,0.)*.08;
col*=mix(.72,1.,smoothstep(0.,16.,vZ));
vec3 hv=normalize(normalize(vec3(-.45,.5,.78))+normalize(vec3(0.,.5,.85)));float spc=pow(max(dot(n,hv),0.),mat>1.5?10.:34.)*(mat>.5?(mat>1.5?.3:.8):0.);col+=spc*vec3(1.,.98,.92);
col=mix(col,uC.rgb*(1.15+em*.5)+em*.12,min(1.,em));col=mix(col,vec3(1.),vQ.y);col=mix(vec3(dot(col,vec3(.3,.59,.11))),col,1.2);col=mix(col,vec3(.02,.07,.09),vH);
gl_FragColor=vec4(col*uC.a,uC.a);}`;
function g3Col(s) {
    let c = G3.col.get(s); if (c) return c;
    let r = .6, g = .6, b = .65, m;
    if (typeof s === 'string') {
        if ((m = /^#([0-9a-f]{6})/i.exec(s))) { const n = parseInt(m[1], 16); r = (n >> 16) / 255; g = (n >> 8 & 255) / 255; b = (n & 255) / 255; }
        else if ((m = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(s))) { r = parseInt(m[1], 16) / 15; g = parseInt(m[2], 16) / 15; b = parseInt(m[3], 16) / 15; }
        else if (s.startsWith('rgb') && (m = s.match(/\d+/g))) { r = m[0] / 255; g = m[1] / 255; b = m[2] / 255; }
    }
    c = [r, g, b]; G3.col.set(s, c); return c;
}
function g3Build() {
    const V = [], meshes = {};
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const nrm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
    const put = (p, n) => V.push(p[0], p[1], p[2], n[0], n[1], n[2]);
    // flat triangle, auto-oriented away from ref
    const tri = (a, b, c, ref) => { let n = nrm(cross(sub(b, a), sub(c, a))); const cen = [(a[0] + b[0] + c[0]) / 3 - ref[0], (a[1] + b[1] + c[1]) / 3 - ref[1], (a[2] + b[2] + c[2]) / 3 - ref[2]]; if (n[0] * cen[0] + n[1] * cen[1] + n[2] * cen[2] < 0) { const t = b; b = c; c = t; n = [-n[0], -n[1], -n[2]]; } put(a, n); put(b, n); put(c, n); };
    // smooth triangle with vertex normals
    const trs = (a, b, c, na, nb, nc) => { const n = cross(sub(b, a), sub(c, a)); if (n[0] * (na[0] + nb[0] + nc[0]) + n[1] * (na[1] + nb[1] + nc[1]) + n[2] * (na[2] + nb[2] + nc[2]) < 0) { put(a, na); put(c, nc); put(b, nb); } else { put(a, na); put(b, nb); put(c, nc); } };
    const def = (name, fn) => { const s = V.length / 6; fn(); meshes[name] = [s, V.length / 6 - s]; };
    def('cube', () => { const R = [0, 0, 0], q = (a, b, c, d) => { tri(a, b, c, R); tri(a, c, d, R); };
        q([.5, -.5, -.5], [.5, .5, -.5], [.5, .5, .5], [.5, -.5, .5]); q([-.5, -.5, -.5], [-.5, -.5, .5], [-.5, .5, .5], [-.5, .5, -.5]);
        q([-.5, .5, -.5], [-.5, .5, .5], [.5, .5, .5], [.5, .5, -.5]); q([-.5, -.5, -.5], [.5, -.5, -.5], [.5, -.5, .5], [-.5, -.5, .5]);
        q([-.5, -.5, .5], [.5, -.5, .5], [.5, .5, .5], [-.5, .5, .5]); q([-.5, -.5, -.5], [-.5, .5, -.5], [.5, .5, -.5], [.5, -.5, -.5]); });
    const sphere = (name, seg, rings) => def(name, () => { const p = (i, j) => { const th = i / rings * Math.PI, ph = j / seg * Math.PI * 2; return [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)]; };
        for (let i = 0; i < rings; i++)for (let j = 0; j < seg; j++) { const a = p(i, j), b = p(i + 1, j), c = p(i + 1, j + 1), d = p(i, j + 1); if (i > 0) trs(a, b, d, a, b, d); if (i < rings - 1) trs(b, c, d, b, c, d); } });
    sphere('sph', 12, 8); sphere('sphL', 8, 5);
    const frus = (name, seg, rt, flat) => def(name, () => { const ref = [0, 0, .5], P = (j, z, r) => [Math.cos(j / seg * 6.2832) * r, Math.sin(j / seg * 6.2832) * r, z];
        for (let j = 0; j < seg; j++) { const a = P(j, 0, 1), b = P(j + 1, 0, 1), c = P(j + 1, 1, rt), d = P(j, 1, rt);
            if (flat) { tri(a, b, c, ref); if (rt > 0) tri(a, c, d, ref); }
            else { const na = nrm([a[0], a[1], 1 - rt]), nb = nrm([b[0], b[1], 1 - rt]); trs(a, b, c, na, nb, nb); if (rt > 0) trs(a, c, d, na, nb, na); }
            put([0, 0, 0], [0, 0, -1]); put(b, [0, 0, -1]); put(a, [0, 0, -1]);
            if (rt > 0) { put([0, 0, 1], [0, 0, 1]); put(c, [0, 0, 1]); put(d, [0, 0, 1]); } } });
    frus('cyl', 10, 1, false); frus('cyl6', 6, 1, true); frus('cone', 8, 0, false); frus('cone4', 4, 0, true); frus('cone6', 6, 0, true); frus('rob', 10, .5, false); frus('hex', 6, .8, true);
    def('ring', () => { const seg = 22, P = (j, r) => [Math.cos(j / seg * 6.2832) * r, Math.sin(j / seg * 6.2832) * r, 0];
        for (let j = 0; j < seg; j++) { const a = P(j, 1), b = P(j + 1, 1), c = P(j + 1, .84), d = P(j, .84); put(a, [0, 0, 1]); put(c, [0, 0, 1]); put(b, [0, 0, 1]); put(a, [0, 0, 1]); put(d, [0, 0, 1]); put(c, [0, 0, 1]); put(a, [0, 0, -1]); put(b, [0, 0, -1]); put(c, [0, 0, -1]); put(a, [0, 0, -1]); put(c, [0, 0, -1]); put(d, [0, 0, -1]); } });
    def('disc', () => { const seg = 22; for (let j = 0; j < seg; j++) { put([0, 0, 0], [0, 0, 1]); put([Math.cos((j + 1) / seg * 6.2832), Math.sin((j + 1) / seg * 6.2832), 0], [0, 0, 1]); put([Math.cos(j / seg * 6.2832), Math.sin(j / seg * 6.2832), 0], [0, 0, 1]); } });
    def('octa', () => { const px = [1, 0, 0], nx = [-1, 0, 0], py = [0, 1, 0], ny = [0, -1, 0], pz = [0, 0, 1], nz = [0, 0, -1], R = [0, 0, 0];
        for (const a of [px, nx])for (const b of [py, ny])for (const c of [pz, nz]) tri(a, b, c, R); });
    // ---- v455 authored meshes: superellipsoids (rounded boxes / pills / soft heads), blade, gem, feather, cape, horn ----
    const sgp = (w, m) => { const c = Math.cos(w), sn = Math.sin(w); return [Math.sign(c) * Math.pow(Math.abs(c), m), Math.sign(sn) * Math.pow(Math.abs(sn), m)]; };
    const se = (name, e1, e2, nu, nv) => def(name, () => {
        const P = (i, j) => { const v = -Math.PI / 2 + i / nv * Math.PI, u = -Math.PI + j / nu * Math.PI * 2, a = sgp(v, e1), b = sgp(u, e2), a2 = sgp(v, 2 - e1), b2 = sgp(u, 2 - e2);
            return [[.5 * a[0] * b[0], .5 * a[0] * b[1], .5 * a[1]], nrm([a2[0] * b2[0], a2[0] * b2[1], a2[1]])]; };
        for (let i = 0; i < nv; i++) for (let j = 0; j < nu; j++) { const A = P(i, j), B = P(i + 1, j), C = P(i + 1, j + 1), D = P(i, j + 1); trs(A[0], B[0], C[0], A[1], B[1], C[1]); trs(A[0], C[0], D[0], A[1], C[1], D[1]); }
    });
    se('sq', .38, .38, 14, 8); se('sq2', .8, .85, 14, 9); se('pill', .4, 1, 10, 6);
    const dbl = (a, b, c) => { const n = nrm(cross(sub(b, a), sub(c, a))), m = [-n[0], -n[1], -n[2]]; put(a, n); put(b, n); put(c, n); put(a, m); put(c, m); put(b, m); };
    def('blade', () => { const R = [0, 0, .4], r0 = [[.5, 0, 0], [0, .2, 0], [-.5, 0, 0], [0, -.2, 0]], r1 = [[.42, 0, .82], [0, .14, .84], [-.42, 0, .82], [0, -.14, .84]], tip = [0, 0, 1];
        for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; tri(r0[i], r0[j], r1[j], R); tri(r0[i], r1[j], r1[i], R); tri(r1[i], r1[j], tip, R); } });
    def('gem6', () => { const R = [0, 0, .5], top = [0, 0, 1], bot = [0, 0, 0], ring = []; for (let i = 0; i < 6; i++) { const a = i / 6 * 6.2832; ring.push([Math.cos(a), Math.sin(a), .5]); }
        for (let i = 0; i < 6; i++) { const j = (i + 1) % 6; tri(ring[i], ring[j], top, R); tri(ring[j], ring[i], bot, R); } });
    def('feather', () => { const N = 5, w = t => Math.sin(Math.PI * Math.pow(t, .7)) * .5; for (let i = 0; i < N; i++) { const t0 = i / N, t1 = (i + 1) / N, a = [t0, -w(t0), 0], b = [t1, -w(t1), 0], c = [t1, w(t1), 0], d = [t0, w(t0), 0]; dbl(a, b, c); dbl(a, c, d); } });
    def('cape', () => { const NY = 4, NZ = 5, P = (i, k) => { const y = -.5 + i / NY; return [.1 * Math.cos(y * Math.PI) - .35 * (k / NZ) * (k / NZ), y, -k / NZ]; };
        for (let i = 0; i < NY; i++) for (let k = 0; k < NZ; k++) { const a = P(i, k), b = P(i + 1, k), c = P(i + 1, k + 1), d = P(i, k + 1); dbl(a, b, c); dbl(a, c, d); } });
    def('horn', () => { const N = 5, M = 6, ring = [], c = t => [.4 * t * t, 0, t], r = t => 1 - t * .93;
        for (let i = 0; i <= N; i++) { const t = i / N, p = c(t), T = nrm([.8 * t, 0, 1]), N2 = nrm(cross(T, [0, 1, 0])), rr = []; for (let j = 0; j < M; j++) { const a = j / M * 6.2832, cs = Math.cos(a), sn = Math.sin(a), rd = r(t) * .5;
            rr.push([[p[0] + rd * (cs * N2[0] + sn * 0), p[1] + rd * sn, p[2] + rd * (cs * N2[2])], nrm([cs * N2[0], sn, cs * N2[2]])]); } ring.push(rr); }
        for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) { const k = (j + 1) % M, A = ring[i][j], B = ring[i + 1][j], C = ring[i + 1][k], D = ring[i][k]; trs(A[0], B[0], C[0], A[1], B[1], C[1]); trs(A[0], C[0], D[0], A[1], C[1], D[1]); } });
    return { V: new Float32Array(V), meshes };
}
function g3Init() {
    if (G3.tried) return G3.ok; G3.tried = true;
    try {
        const cv = document.createElement('canvas'); cv.width = 16; cv.height = 16;
        const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: !(typeof location!=='undefined'&&/noaa/.test(location.search)), depth: true, stencil: false, powerPreference: 'high-performance' });
        if (!gl) return false;
        const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
        const pg = gl.createProgram(); gl.attachShader(pg, sh(gl.VERTEX_SHADER, G3_VS)); gl.attachShader(pg, sh(gl.FRAGMENT_SHADER, G3_FS)); ['aP', 'aN', 'aM0', 'aM1', 'aM2', 'aM3', 'aC', 'aQ'].forEach((n, i) => gl.bindAttribLocation(pg, i, n)); gl.linkProgram(pg);
        if (!gl.getProgramParameter(pg, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pg));
        const pg2 = gl.createProgram(); gl.attachShader(pg2, sh(gl.VERTEX_SHADER, G3_GVS)); gl.attachShader(pg2, sh(gl.FRAGMENT_SHADER, G3_GFS)); gl.bindAttribLocation(pg2, 0, 'aG'); gl.linkProgram(pg2);
        if (!gl.getProgramParameter(pg2, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pg2));
        G3.pg = pg; G3.pg2 = pg2; G3.ug = {}; for (const n of ['uCam', 'uScr', 'uPR', 'uTex']) G3.ug[n] = gl.getUniformLocation(pg2, n);
        G3.gbuf = gl.createBuffer(); G3.tex = gl.createTexture();
        gl.useProgram(pg);
        const b = g3Build(), buf = gl.createBuffer(); G3.vbuf = buf; gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, b.V, gl.STATIC_DRAW);
        const ext = gl.getExtension('ANGLE_instanced_arrays'); if (!ext) throw new Error('no instancing'); G3.ext = ext;
        gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
        for (let i = 2; i < 8; i++) { gl.enableVertexAttribArray(i); ext.vertexAttribDivisorANGLE(i, 1); }
        G3.ibuf = gl.createBuffer(); G3.inst = new Float32Array(G3_CMAX * 3 * 24);
        G3.meshes = b.meshes; G3.gl = gl; G3.cv = cv;
        G3.u = {}; for (const n of ['uCam', 'uOP', 'uScr', 'uPR']) G3.u[n] = gl.getUniformLocation(pg, n);
        for (let i = 0; i < 3; i++) G3.pool[i] = new Float32Array(G3_CMAX * 24);
        G3.mid = {}; let k = 0; for (const n in b.meshes) G3.mid[n] = k++; G3.mn = Object.keys(b.meshes);
        cv.addEventListener('webglcontextlost', e => { e.preventDefault(); G3.ok = false; G3.act = false; });
        G3.ok = true;
    } catch (e) { G3.ok = false; G3.err = String(e && e.message || e); console.warn('3D disabled:', G3.err); }
    return G3.ok;
}
/* ---- matrix stack (column-major, model space: x forward, y left, z up) ---- */
function g3Id(x, y, z, s) { const M = G3.M; M.fill(0); M[0] = M[5] = M[10] = s; M[15] = 1; M[12] = x; M[13] = y; M[14] = z; G3.sp = 0; }
function g3Push() { const o = G3.st[G3.sp] || (G3.st[G3.sp] = new Float32Array(16)); o.set(G3.M); G3.sp++; }
function g3Pop() { G3.M.set(G3.st[--G3.sp]); }
function g3T(x, y, z) { const M = G3.M; M[12] += M[0] * x + M[4] * y + M[8] * z; M[13] += M[1] * x + M[5] * y + M[9] * z; M[14] += M[2] * x + M[6] * y + M[10] * z; }
function g3S(x, y, z) { const M = G3.M; M[0] *= x; M[1] *= x; M[2] *= x; M[4] *= y; M[5] *= y; M[6] *= y; M[8] *= z; M[9] *= z; M[10] *= z; }
function g3Rot(a, i, j, sgn) { const M = G3.M, c = Math.cos(a), s = Math.sin(a) * sgn; for (let k = 0; k < 3; k++) { const p = M[i * 4 + k], q = M[j * 4 + k]; M[i * 4 + k] = c * p + s * q; M[j * 4 + k] = -s * p + c * q; } }
function g3RZ(a) { g3Rot(a, 0, 1, 1); }      // col0' = c*col0 + s*col1
function g3RX(a) { g3Rot(a, 1, 2, 1); }      // col1' = c*col1 + s*col2
function g3RY(a) { g3Rot(a, 2, 0, 1); }      // col2' = c*col2 + s*col0
/* draw a mesh with the current matrix. layer 0 = ground translucent (shadows), 1 = opaque (outlined), 2 = late translucent glow */
function g3D(mesh, col, em, alpha, layer) {
    layer = layer || 1; const n = G3.cnt[layer]; if (n >= G3_CMAX) return; G3.cnt[layer] = n + 1;
    const p = G3.pool[layer], o = n * 24, c = g3Col(col);
    p.set(G3.M, o); p[o + 16] = c[0]; p[o + 17] = c[1]; p[o + 18] = c[2]; p[o + 19] = alpha === undefined ? 1 : alpha; p[o + 20] = G3.mid[mesh]; p[o + 21] = (em || 0) + 4 * ((layer === 2 && mesh === 'sph' && alpha !== undefined && alpha < .95) ? 3 : G3.mat); p[o + 22] = G3.flash; p[o + 23] = layer === 1 && !G3.lod ? G3.ol : 0;
}
/* part: translate, scale, draw */
function g3P(mesh, col, tx, ty, tz, sx, sy, sz, em, alpha, layer) { g3Push(); g3T(tx, ty, tz); g3S(sx, sy, sz); g3D(mesh, col, em, alpha, layer); g3Pop(); }
function g3Frame() {
    const gl = G3.gl, w = canvas.width, h = canvas.height;
    if (G3.cv.width !== w || G3.cv.height !== h) { G3.cv.width = w; G3.cv.height = h; }
    G3.W = W; G3.H = H;
}
function gl3dBegin() {
    G3.cnt[0] = G3.cnt[1] = G3.cnt[2] = 0; G3.mN = 0;
    G3.frame++; for (const [u, e] of G3.seen) { if (e.f >= G3.frame - 1) continue; G3.seen.delete(u); if (e.f === G3.frame - 2 && (u.dead || u.hp <= 0) && G3.corpses.length < 24 && !options.reducedMotion) G3.corpses.push({ u, cls: e.cls, o: e.o, x: e.x, y: e.y, sc: e.sc, t: time }); }
    G3.act = false;
    if (typeof options !== 'undefined' && options.model3d === false) return;
    if (!G3.tried) g3Init();
    if (!G3.ok) return;
    G3.act = true; G3.lod = qualityScale < 1; G3.mat = 0;
}
function gl3dFlush(gw) {
    if (!G3.act) return;
    if (!gw) g3Corpses(); const total = G3.cnt[0] + G3.cnt[1] + G3.cnt[2]; if (!total && !gw) return;
    const gl = G3.gl, u = G3.u; g3Frame();
    gl.viewport(0, 0, G3.cv.width, G3.cv.height); gl.clearColor(0, 0, 0, 0); gl.clearDepth(1); gl.depthMask(true); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const cp = Math.cos(G3P.phi), sp = Math.sin(G3P.phi), vw = gw ? gw.vw : W, vh = gw ? gw.vh : H, pm = gw ? 1 : 0;
    if (gw) {                                                // ground: the whole 2D world rendered to a texture, drawn on a tilted plane
        gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE); gl.useProgram(G3.pg2); const g = G3.ug;
        gl.uniform3f(g.uCam, vw, vh, 0); gl.uniform2f(g.uScr, W, H); gl.uniform4f(g.uPR, 1, G3P.D, cp, sp); gl.uniform1i(g.uTex, 0);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, G3.tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gw.cv);
        gl.bindBuffer(gl.ARRAY_BUFFER, G3.gbuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, vw, 0, 0, vh, vw, vh]), gl.STREAM_DRAW);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); for (let i = 1; i < 8; i++) gl.disableVertexAttribArray(i); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); for (let i = 1; i < 8; i++) gl.enableVertexAttribArray(i);
        gl.useProgram(G3.pg);
    }
    gl.uniform3f(u.uCam, vw, vh, 0); gl.uniform2f(u.uScr, W, H); gl.uniform4f(u.uPR, pm, G3P.D, cp, sp);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LESS); gl.enable(gl.CULL_FACE); gl.frontFace(gl.CW);
    // pack all instances grouped by (layer, mesh) -> one instanced draw per group
    const NM = G3.mn.length, inst = G3.inst, groups = [[], [], []]; let off = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, G3.ibuf);
    for (let layer = 0; layer < 3; layer++) {
        const p = G3.pool[layer], n = G3.cnt[layer]; if (!n) continue;
        const counts = new Int32Array(NM); for (let i = 0; i < n; i++) counts[p[i * 24 + 20]]++;
        const start = new Int32Array(NM); let acc = off; for (let m = 0; m < NM; m++) { start[m] = acc; if (counts[m]) groups[layer].push([m, acc, counts[m]]); acc += counts[m]; }
        for (let i = 0; i < n; i++) { const m = p[i * 24 + 20], o = start[m]++ * 24; for (let k = 0; k < 24; k++) inst[o + k] = p[i * 24 + k]; }
        off = acc;
    }
    gl.bufferData(gl.ARRAY_BUFFER, inst.subarray(0, off * 24), gl.DYNAMIC_DRAW);
    const ext = G3.ext, run = (layer, outline) => {
        gl.uniform1f(u.uOP, outline ? 1 : 0);
        for (const g of groups[layer]) {
            const r = G3.meshes[G3.mn[g[0]]], base = g[1] * 96;
            gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 96, base); gl.vertexAttribPointer(3, 4, gl.FLOAT, false, 96, base + 16); gl.vertexAttribPointer(4, 4, gl.FLOAT, false, 96, base + 32); gl.vertexAttribPointer(5, 4, gl.FLOAT, false, 96, base + 48);
            gl.vertexAttribPointer(6, 4, gl.FLOAT, false, 96, base + 64); gl.vertexAttribPointer(7, 4, gl.FLOAT, false, 96, base + 80);
            ext.drawArraysInstancedANGLE(gl.TRIANGLES, r[0], r[1], g[2]);
        }
    };
    gl.bindBuffer(gl.ARRAY_BUFFER, G3.vbuf); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12); gl.bindBuffer(gl.ARRAY_BUFFER, G3.ibuf);
    gl.depthMask(false); gl.disable(gl.CULL_FACE); run(0, false);
    gl.depthMask(true); gl.enable(gl.CULL_FACE);
    if (!G3.lod) { gl.cullFace(gl.FRONT); run(1, true); gl.cullFace(gl.BACK); }
    run(1, false);
    gl.depthMask(false); gl.disable(gl.CULL_FACE); run(2, false);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true; ctx.drawImage(G3.cv, 0, 0); ctx.restore();
}
/* ---- true perspective camera (v455) ---- */
const G3P = { D: 1250, phi: 0.98 };
G3.persp = false; G3.ov = []; G3.ms = 1.2;
function g3S2G(sx, sy, force) {      // screen px -> ground px (coordinates of the old top-down screen)
    if (!G3.persp && !force) return [sx, sy];
    const cp = Math.cos(G3P.phi), sp = Math.sin(G3P.phi), D = G3P.D, X = sx - W / 2, yn = H / 2 - sy;
    const v = yn * D / (yn * cp - D * sp), zc = D - v * cp;
    return [X * zc / D + W / 2, v + H / 2];
}
function g3G2S(gx, gy, z, w, h) {          // ground px (+height) -> screen px (w, h: optional real viewport size while the world pass overrides W/H)
    if (!G3.persp) return [gx, gy - (z || 0) * G3_K, 1];
    const cp = Math.cos(G3P.phi), sp = Math.sin(G3P.phi), D = G3P.D, W0 = w || W, H0 = h || H, u = gx - W0 / 2, v = gy - H0 / 2, zz = (z || 0) * 1.35, zc = D - v * cp - zz * sp, yc = -v * sp + zz * cp;
    return [W0 / 2 + u * D / zc, H0 / 2 - yc * D / zc, D / zc];
}
function scrToWorld(sx, sy) { const g = g3S2G(sx, sy); return { x: g[0] + cam.x, y: g[1] + cam.y }; }
function worldToScr(x, y, z) { return g3G2S(x - cam.x, y - cam.y, z); }
function g3Ext() {                   // size of the ground area (px) that must be in the texture to cover the screen
    let mu = 0, mv = 0; for (const c of [[0, 0], [W, 0], [0, H], [W, H]]) { const g = g3S2G(c[0], c[1], true); mu = Math.max(mu, Math.abs(g[0] - W / 2)); mv = Math.max(mv, Math.abs(g[1] - H / 2)); }
    return [Math.ceil((mu + 40) * 2), Math.ceil((mv + 40) * 2)];
}
function g3WorldBegin() {
    G3.persp = false; if (!G3.act || (typeof options !== 'undefined' && options.persp === false)) return null;
    const e = g3Ext(), vw = e[0], vh = e[1]; let s = Math.min(1, 2600 / vw); if (qualityScale < 1) s *= .7;
    const wc = G3.wc || (G3.wc = document.createElement('canvas')), pw = Math.ceil(vw * s), ph = Math.ceil(vh * s);
    if (wc.width !== pw || wc.height !== ph) { wc.width = pw; wc.height = ph; }
    G3.wx = wc.getContext('2d', { alpha: false }); if (!G3.wx.g3hook) g3HookText(G3.wx);
    G3.ov.length = 0;
    const st = { ctx, W, H, dpr, cx: cam.x, cy: cam.y, vw, vh, s, cv: wc };
    G3.cur = st; ctx = G3.wx; cam.x -= (vw - W) / 2; cam.y -= (vh - H) / 2; W = vw; H = vh; dpr = s; G3.persp = true; return st;
}
function g3WorldEnd(st) { if (!st) return; ctx = st.ctx; W = st.W; H = st.H; dpr = st.dpr; cam.x = st.cx; cam.y = st.cy; }
function g3Compose(st) { if (!st || !G3.act) return; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); gl3dFlush(st); }
if (typeof mouse !== 'undefined') Object.defineProperty(mouse, 'wx', { get() { return scrToWorld(mouse.x, mouse.y).x; } }), Object.defineProperty(mouse, 'wy', { get() { return scrToWorld(mouse.x, mouse.y).y; } });
/* ---- upright overlay: text and bars drawn on the tilted ground are re-projected and drawn upright (v455) ---- */
function g3Rec(o, x, y) {
    const st = G3.cur, c = G3.wx, tf = c.getTransform(), sc = st.s, px = (tf.a * x + tf.c * y + tf.e) / sc, py = (tf.b * x + tf.d * y + tf.f) / sc;
    o.gx = px - (st.vw - st.W) / 2; o.gy = py - (st.vh - st.H) / 2; o.k = Math.hypot(tf.a, tf.b) / sc; o.al = c.globalAlpha;
    if (o.gx < -200 || o.gx > st.W + 200 || o.gy < -200 || o.gy > st.H + 260) return;
    if (G3.ov.length < 1200) G3.ov.push(o);
}
function g3HookText(c) {
    c.g3hook = true; const rec = (kind) => function (t, x, y) {
        if (!G3.persp || ctx !== c) return;
        g3Rec({ kind, t: String(t), font: c.font, fill: kind === 'text' ? c.fillStyle : c.strokeStyle, align: c.textAlign, base: c.textBaseline, sc: c.shadowColor, sb: c.shadowBlur, lw: c.lineWidth }, x, y);
    };
    c.fillText = rec('text'); c.strokeText = rec('stroke');
}
function g3Bar(x, y, w, h, val, col) {
    if (!(G3.persp && ctx === G3.wx)) return false;
    g3Rec({ kind: 'bar', w, h, val, fill: col }, x, y); return true;
}
function g3Overlay() {
    if (!G3.persp && !G3.ov.length) return; const ov = G3.ov, c = ctx; c.save(); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const placed = [];
    for (const o of ov) {
        if (o.scr) { c.globalAlpha = o.al; c.save(); c.translate(o.x, o.y); c.rotate(o.a); c.fillStyle = o.fill; c.beginPath(); c.moveTo(15, 0); c.lineTo(-9, -8); c.lineTo(-9, 8); c.closePath(); c.fill(); c.fillStyle = '#fff'; c.font = '800 9px system-ui'; c.textAlign = 'center'; c.rotate(-o.a); c.fillText(o.t, 0, -13); c.restore(); continue; }
        const p = g3G2S(o.gx, o.gy, 0), sx = p[0], k = p[2] * o.k, sy = p[1] - (16 + (G3.ms - 1) * 60) * k; if (sx < -200 || sx > W + 200 || sy < -100 || sy > H + 100) continue;
        c.globalAlpha = o.al;
        if (o.kind === 'bar') { const w = o.w * k, h = Math.max(3, o.h * k); c.fillStyle = '#071116cc'; c.fillRect(sx - w / 2, sy, w, h); c.fillStyle = o.fill; c.fillRect(sx - w / 2 + 1.5, sy + 1.5, (w - 3) * Math.max(0, o.val), h - 3); continue; }
        c.font = o.font.replace(/(\d+(?:\.\d+)?)px/, (m, n) => (n * Math.min(1.4, Math.max(.6, k))).toFixed(1) + 'px'); c.textAlign = o.align; c.textBaseline = o.base; c.shadowColor = o.sc; c.shadowBlur = o.sb;
        if (o.kind === 'text') { const w = c.measureText(o.t).width, fh = parseFloat(c.font.match(/(\d+(?:\.\d+)?)px/)[1]) || 14, x0 = o.align === 'center' ? sx - w / 2 : o.align === 'right' || o.align === 'end' ? sx - w : sx; let yy = sy; for (let t = 0; t < 4; t++) { const hit = placed.find(r => x0 < r.x1 && x0 + w > r.x0 && yy - fh < r.y1 && yy > r.y0); if (!hit) break; yy = hit.y0 - 2; } placed.push({ x0, x1: x0 + w, y0: yy - fh, y1: yy }); if (yy !== sy) { c.fillStyle = o.fill; c.fillText(o.t, sx, yy); continue; } }
        if (o.kind === 'stroke') { c.strokeStyle = o.fill; c.lineWidth = o.lw; c.strokeText(o.t, sx, sy); } else { c.fillStyle = o.fill; c.fillText(o.t, sx, sy); }
    }
    c.restore(); G3.ov.length = 0;
}
/* ================= characters ================= */
function g3Yaw(u, s) {
    let st = G3.ys.get(u); if (!st) { st = { yaw: Math.PI / 2, x: u.x, y: u.y, t: time }; G3.ys.set(u, st); }
    const dt = Math.max(0, Math.min(.1, time - st.t)); let tgt = null;
    if (s.sw > .3 && u.target && u.target.x !== undefined && !u.target.dead) tgt = Math.atan2(u.target.y - u.y, u.target.x - u.x);
    else if (u.dir !== undefined && typeof u.dir === 'number' && u.hp !== undefined && u === hero) tgt = u.dir;
    else { const dx = u.x - st.x, dy = u.y - st.y; if (dx * dx + dy * dy > .25) tgt = Math.atan2(dy, dx); }
    if (tgt !== null) { let d = tgt - st.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); st.yaw += d * Math.min(1, dt * 14); }
    st.x = u.x; st.y = u.y; st.t = time; return st.yaw;
}
function gl3dCharacter(u, cls, o) {
    if (!G3.act) return false;
    const tf = ctx.getTransform(), sx = tf.e / dpr, sy = tf.f / dpr, sc = tf.a / dpr * G3.ms;
    if (sx < -120 || sx > W + 120 || sy < -160 || sy > H + 160) return true;
    G3.seen.set(u, { u, cls, o: Object.assign({}, o), x: u.x, y: u.y, sc, f: G3.frame });
    g3Char(u, cls, o, sx, sy, sc, 0); return true;
}
function g3Corpses() {          // collapse animation for units that died since the last frame
    if (!G3.corpses.length) return;
    const tf = ctx.getTransform(), ox = tf.e / dpr, oy = tf.f / dpr, k = tf.a / dpr;
    G3.corpses = G3.corpses.filter(c => time - c.t < .7 && time >= c.t);
    for (const c of G3.corpses) { const sx = ox + c.x * k, sy = oy + c.y * k; if (sx < -120 || sx > W + 120 || sy < -160 || sy > H + 160) continue; g3Char(c.u, c.cls, c.o, sx, sy, c.sc, Math.min(1, (time - c.t) / .55)); }
}
function g3Cast(u) {          // cast pose: detect a cooldown jump on the unit's ability table
    const st = G3.ys.get(u); if (!st || !u.cd || typeof u.cd !== 'object') return 0;
    let sum = 0; for (const k in u.cd) { const v = u.cd[k]; if (typeof v === 'number') sum += v; }
    if (st.cdSum !== undefined && sum > st.cdSum + .8) st.castT = time; st.cdSum = sum;
    return st.castT !== undefined ? Math.max(0, 1 - (time - st.castT) / .5) : 0;
}
function g3CharLegacy(u, cls, o, sx, sy, sc, dth) {
    const s = charAnim(u), r = (o.r || u.r || 20), S = r / 20 * 1.25 * sc, kind = o.kind || '';
    const reduced = options.reducedMotion, mv = reduced ? 0 : s.mv;
    const bob = reduced ? 0 : Math.abs(Math.sin(s.ph)) * 1.4 * mv + Math.sin(time * 2.2 + s.seed) * .35 * (1 - mv);
    const swing = Math.sin(s.ph) * .85 * mv, sw = s.sw, p = 1 - sw, swinging = sw > 0, pulse = .5 + .5 * Math.sin(time * 4 + s.seed);
    const teamC = o.team === 'red' ? '#ff5a6e' : '#4fdcff', col = o.color || '#8ab', acc = o.accent || '#fff', skin = o.skin || '#e8c39e', hair = o.hair || '#2b2f3a';
    const dark = shade(col, -.35), light = shade(col, .22), lod = G3.lod;
    const minion = cls === 'soldier' || cls === 'caster' || cls === 'siege' || cls === 'super';
    const yaw = g3Yaw(u, s), gy = sy + 14 * S, cst = dth ? 0 : g3Cast(u);
    G3.flash = s.flash > 0 ? Math.min(.7, s.flash * 5) : 0; G3.ol = 1.6; if (dth) G3.flash = Math.max(G3.flash, .65 * (1 - dth)); const dk = 1 - dth * .55;
    // ground shadow + team ring (flat, translucent)
    g3Id(sx, gy, .2, 1); g3Push(); g3S(17 * S * dk, 7 * S * dk, 1); g3D('disc', '#000', 0, .34 * (1 - dth), 0); g3Pop();
    if (!dth) { g3Push(); g3S(20 * S, 8.2 * S, 1); g3D('ring', teamC, 1, .95, 0); g3Pop(); }
    const sc3 = S * 1.5, siege = cls === 'siege';
    const gs = G3.ys.get(u), pop = gs ? Math.min(1, .55 + (time - (gs.born || (gs.born = time))) * 3.2) : 1, over = pop < 1 ? 1 : 1 + Math.max(0, .12 - (time - gs.born - .14) * .5) * (time - gs.born < .4 ? 1 : 0);
    g3Id(sx, gy, 0, sc3 * pop * over * dk); g3RZ(yaw); g3T(0, 0, bob); if (!lod) g3RY(mv * .1 + (swinging ? sw * .22 : 0)); if (dth) g3RY(-dth * 1.3); if (cst) g3RY(cst * .18);
    const T = (x, y, z) => g3T(x, y, z);
    if (siege) {                                              // siege cart
        g3P('cube', dark, 0, 0, 5, 14, 9, 4); g3P('cube', col, -1, 0, 8.5, 12, 8, 3); g3P('cube', teamC, -1, 0, 10.2, 12.4, 8.4, .8, .6);
        for (const sd of [-1, 1]) { g3Push(); g3T(-2, sd * 5.5, 3.5); g3RX(Math.PI / 2); g3S(3.6, 3.6, 1.6); g3T(0, 0, -.5); g3D('cyl', '#5c4a38'); g3Pop(); }
        g3Push(); g3T(3, 0, 11); g3RY(Math.PI / 2 - .35 + (swinging ? sw * .25 : 0)); g3S(2.6, 2.6, 15); g3D('cyl', '#46505a'); g3Pop();
        g3P('sph', acc, 12, 0, 16.4, 2.2, 2.2, 2.2, .8); g3P('sph', skin, -5, 0, 14.5, 3, 3, 3); g3P('hex', '#7d8791', -5, 0, 15.5, 3.4, 3.4, 2.4);
        return true;
    }
    const wide = cls === 'tank' || cls === 'bruiser' || cls === 'super', robe = cls === 'mage' || cls === 'support' || cls === 'caster';
    const tw = wide ? 12 : robe ? 10 : 9.5, bodyCol = cls === 'assassin' ? shade(col, -.3) : col;
    // legs
    if (!robe) for (const sd of [-1, 1]) { g3Push(); g3T(0, sd * 2.8, 9); g3RY(swing * sd); g3P('cyl6', dark, 0, 0, -9, 2.5, 2.5, 9); g3P('cube', '#2a2f38', .8, 0, -8.6, 5, 4, 2.2); g3Pop(); }
    else { g3P('rob', bodyCol, 0, 0, 1, 7.4 + mv * .4, 7.4, 14); g3P('cube', '#2a2f38', 2 + swing * 1.5, 2.6, .6, 4, 3, 1.4); g3P('cube', '#2a2f38', 2 - swing * 1.5, -2.6, .6, 4, 3, 1.4); }
    // torso
    if (!robe) { g3P('cube', bodyCol, 0, 0, 14, tw, 7.4, 10); g3P('cube', teamC, 0, 0, 9.6, tw + .4, 7.8, 1.6, .5); }
    else { g3P('cyl', bodyCol, 0, 0, 12.5, 5.2, 4.6, 8); g3P('cube', teamC, 0, 0, 12.8, 10.6, 8.6, 1.4, .5); g3P('octa', acc, 3.6, 0, 18, 1.4, 1.1, 2, .8); }
    if (wide) for (const sd of [-1, 1]) g3P('sph', light, 0, sd * (tw / 2 + 1), 19.5, 4.6, 4.2, 3.6);
    if (cls === 'tank' && kind !== 'warden' && !lod) g3P('cube', acc, 3.8, 0, 15, .8, 3.6, 5, .5);
    if (!lod && !minion) {                                       // hero-specific back pieces
        const wob = Math.sin(time * 5 + s.seed) * (.6 + mv * 2), fl = Math.sin(time * 6 + s.seed) * .35;
        if (kind === 'guardian') { g3Push(); g3T(-4.2, 0, 19); g3RY(.14 + mv * .35 + wob * .03); g3P('cube', shade(col, -.45), -.6, 0, -7, 1.2, tw + 1, 15); g3P('cube', teamC, -.6, 0, -13.5, 1.3, tw + 1.2, 1.6, .5); g3Pop(); }
        else if (kind === 'phantom') for (const sd of [-1, 1]) { g3Push(); g3T(-4, sd * 3, 15); g3RY(.35 + mv * .6 + wob * .05); g3P('cone4', shade(col, -.55), 0, 0, -12, 3.4, 3, 12); g3Pop(); }
        else if (kind === 'seraph' || kind === 'lumen') for (const sd of [-1, 1]) { g3Push(); g3T(-4, sd * 3, 20); g3RX(sd * (.55 + fl)); for (let i = 0; i < 3; i++) g3P('octa', acc, -1 - i * .6, sd * (5 + i * 4.5), 3 - i * 2.6, 2.2, 6.5 - i * 1.2, 1.1, .9, .92, 1); g3Pop(); }
        else if (kind === 'tempest') { g3Push(); g3T(-4.4, -2, 14); g3RY(.5); g3P('cyl6', '#7a5a3a', 0, 0, 0, 2.4, 2.4, 12); for (let i = 0; i < 3; i++) g3P('cone4', acc, 0, (i - 1) * 1.3, 12, .9, .9, 3.6, .6); g3Pop(); }
        else if (kind === 'forge') { g3P('cube', '#4b4f58', -5.4, 0, 15, 4, 8, 9); for (let i = 0; i < 3; i++) g3P('cone4', '#ff9a4d', -7.2, (i - 1) * 2.4, 17 + i % 2, 1.4, 1.4, 4 + Math.sin(time * 9 + i) * 1.2, 1); }
        else if (kind === 'archon') for (const sd of [-1, 1]) g3P('octa', acc, -1, sd * (tw / 2 + 5), 22 + Math.sin(time * 2.4 + sd) * 1.6, 1.8, 1.8, 3.6, 1);
        else if (kind === 'warden') { g3Push(); g3T(0, 0, 14); g3RX(1.4); g3RZ(time * .8); g3S(11, 11, 1); g3D('ring', acc, .8, .6, 2); g3Pop(); }
        else if (kind === 'oracle') g3P('ring', acc, 0, 0, 36, 5, 5, 1, 1, .7, 2);
    }
    // head
    const hz = 27 + bob * 0;
    g3P('sph', skin, 0, 0, hz, 7.3, 6.9, 7.1);
    for (const sd of [-1, 1]) { g3P('sph', '#fff', 6, sd * 2.8, hz + .6, .9, 1.5, 1.9); g3P('sph', '#14212a', 6.7, sd * 2.8, hz + .6, .6, 1.1, 1.4); }
    if (cls === 'tank' || cls === 'super' || cls === 'soldier') {
        g3P('sph', cls === 'soldier' ? '#7d8791' : dark, -.4, 0, hz + 1.6, 7.9, 7.6, 6.2);
        if (cls !== 'soldier') { g3P('cube', acc, 6.6, 0, hz + .6, 1.4, 7.8, 1.8, .7); g3P('cone4', teamC, -1, 0, hz + 6.4, 3.8, 1.8, 9 + (cls === 'super' ? 3 : 0), .6); }
        else g3P('cyl', teamC, -.4, 0, hz + 1.2, 8.1, 7.8, 1.4, .4);
    } else if (cls === 'assassin') {
        g3P('sph', shade(col, -.55), -1, 0, hz + 1.4, 8.1, 7.8, 7.4); g3P('cone', shade(col, -.55), -4.5, 0, hz + 1, 3.6, 3, 10);
        const sw2 = Math.sin(time * 9) * 2;
        for (let i = 0; i < 3; i++) g3P('cube', acc, -6 - i * 3.6 - mv * i, sw2 * (i + 1) * .35, hz - 3 - i * .6 + Math.sin(time * 9 + i) * .9, 4.4, 2.4, 1.2, .6);
    } else if (cls === 'ranger') {
        g3P('sph', hair, -.6, 0, hz + 1.5, 7.9, 7.5, 6.4); g3P('cube', acc, 0, 0, hz + 3, 7.8, 7.8, 1.4, .6);
        g3P('sph', hair, -8, 0, hz - 1 + Math.sin(time * 6) * .8, 2.6, 2.2, 2.6); g3P('sph', hair, -10.5, Math.sin(time * 6 + 1) * 1.5, hz - 5, 2.2, 2, 3.4);
    } else if (cls === 'bruiser') {
        g3P('sph', hair, -.6, 0, hz + 1.3, 7.9, 7.4, 5.8);
        for (let i = 0; i < 4; i++) { const f = Math.sin(time * 10 + i * 1.7); g3P('cone4', hair, -2 + (i % 2) * 2.4, -4.5 + i * 3, hz + 4, 2.4, 2.4, 8 + (i % 2) * 3 + f * 1.4, .9); }
    } else {                                                     // mage / support / caster
        if (cls === 'caster') { g3P('cyl', shade(col, -.35), 0, 0, hz + 4.4, 10.4, 10.4, 1.1); g3P('cone', shade(col, -.35), 0, 0, hz + 5.4, 6.2, 6.2, 13); }
        else { g3P('sph', hair, -.8, 0, hz + 1.4, 7.9, 7.5, 6.6); g3P('sph', hair, -4.4, 0, hz - 5, 5.6, 6, 10 + mv); g3P('sph', acc, 4.4, 4.4, hz + 5.4, 1.5, 1.5, 1.5, .9); }
        if (cls === 'support') g3P('ring', '#ffe9a0', 0, 0, hz + 9.5, 7, 7, 1, 1, .95, 2);
    }
    // arms + weapons
    const armBase = swinging ? 0.55 - 2.7 * p : -.25 + Math.sin(time * 2 + s.seed) * .05 - Math.abs(swing) * .15;
    for (const sd of [1, -1]) {
        const weapon = sd === -1;
        g3Push(); g3T(0, sd * (tw / 2 + 1.4), 18.5); g3RY(weapon ? armBase : (cls === 'ranger' ? -1.4 : (-.15 - swing * .35) * (1 - cst) - 2.1 * cst)); if (cst && !weapon) g3P('sph', acc, 0, 0, -10, 3 + cst * 3, 3 + cst * 3, 3 + cst * 3, 1, .85 * cst, 2);
        g3P('cyl6', bodyCol === col ? shade(col, -.15) : bodyCol, 0, 0, -8.5, 2.1, 2.1, 8.5); g3P('sph', skin, 0, 0, -9, 2.4, 2.4, 2.4);
        if (weapon) {
            g3T(0, 0, -9); g3RY(Math.PI / 2 - .35);
            if (cls === 'tank' && kind === 'warden') {
                g3P('sph', light, 2, 0, 0, 5, 5, 5, .2);
                for (let i = 0; i < 2; i++) { g3Push(); g3T(2, 0, 0); g3RX(time * 2 + i * 1.5); g3RY(1 + i * .6); g3S(8 + i * 3 + (swinging ? sw * 4 : 0), 8 + i * 3, 1); g3D('ring', acc, 1, .85, 2); g3Pop(); }
            } else if (cls === 'tank' || cls === 'super' || cls === 'soldier') {
                if (cls === 'soldier') { g3P('cyl6', '#8a6a44', 0, 0, -6, 1, 1, 30); g3P('cone4', '#dfe6ec', 0, 0, 24, 2.2, 1.2, 8); }
                else { g3P('cube', acc, 0, 0, 1, 1.6, 6, 1.4, .5); g3P('cube', '#e8f1f6', 0, 0, 12, 1.5, 3.6, 22 + (cls === 'super' ? 8 : 0)); g3P('cone4', '#e8f1f6', 0, 0, 22 + (cls === 'super' ? 8 : 0), 1.4, 1.8, 4); }
            } else if (cls === 'assassin') {
                g3P('cube', acc, 0, 0, .5, 1.4, 4.4, 1.4, .5); g3P('cube', '#e6eef5', 0, 0, 8, .9, 3, 15); g3P('cone4', '#e6eef5', 0, 0, 15.5, .9, 1.7, 4);
            } else if (cls === 'bruiser') {
                g3P('cyl6', '#6b4a2e', 0, 0, -3, 1.5, 1.5, 22); const heat = Math.min(1, (u.forgeHeat || 0) / 100);
                g3P('cube', heat > .1 ? '#ff9a4d' : '#7c8691', 0, 0, 19, 8, 6, 8, heat); g3P('cube', acc, 0, 0, 19, 8.4, 2, 8.4, .6);
            } else if (cls === 'mage' || cls === 'support' || cls === 'caster') {
                g3RY(-Math.PI / 2 + .35 + .1); g3P('cyl6', '#b79b6a', 0, 0, -10, 1, 1, 34); const rad = 3.2 + pulse * .5 + (swinging ? sw * 3 : 0);
                g3P('sph', '#fff', 0, 0, 25, rad, rad, rad, 1); g3P('sph', acc, 0, 0, 25, rad * 1.7, rad * 1.7, rad * 1.7, .8, .42, 2);
                if (cls === 'support') { g3P('cube', '#fff', 0, 0, 25, 1.3, 1.3, 9, 1, 1, 2); g3P('cube', '#fff', 0, 0, 25, 1.3, 7, 1.3, 1, 1, 2); }
            } else if (cls === 'ranger') {
                g3RY(-.5); g3P('cyl6', '#caa46a', 0, 0, -10, .8, .8, 20); g3P('cube', '#e8eef2', 0, -.2, 10, .3, .3, 14);
                g3P('cube', acc, 4, 0, 2, 1, 1, 16, .8);
                if (swinging && sw > .2) g3P('cube', acc, 10, 0, 2, 1.2, 1.2, 30, 1, Math.min(1, sw * 1.6), 2);
            }
        }
        g3Pop();
        if (!weapon && (cls === 'tank' && kind !== 'warden' || cls === 'super')) { g3P('cube', '#16303c', 4, tw / 2 + 4.2, 14.5, 1.8, 8.5, 12); g3P('cube', acc, 5, tw / 2 + 4.2, 14.5, .8, 5.5, 8, .7 + pulse * .3); g3P('cube', acc, 5.4, tw / 2 + 4.2, 14.5, .8, 2, 3.5, 1); }
    }
    if (kind === 'oracle' || kind === 'lumen') for (let i = 0; i < 3; i++) {
        const a = time * 2.2 + i * 2.094 + s.seed, ox = Math.cos(a) * 12, oy = Math.sin(a) * 12;
        g3Push(); g3T(ox, oy, 20 + Math.sin(a * 2) * 2); if (kind === 'oracle') g3S(2.4, 2.4, 2.4), g3D('sph', acc, 1, 1, 2); else { g3RZ(a * 2); g3S(2.4, 2.4, 3.8); g3D('octa', acc, 1, 1, 2); } g3Pop();
    }
    return true;
}
/* ================= structures & monsters ================= */
function g3Anchor(x, y) { const tf = ctx.getTransform(); return [tf.e / dpr + x * tf.a / dpr, tf.f / dpr + y * tf.d / dpr]; }
function gl3dTower(t, c) {
    if (!G3.act) return false;
    const a = g3Anchor(t.x, t.y), sx = a[0], gy = a[1] + 16; if (sx < -120 || sx > W + 120 || gy < -160 || gy > H + 220) return true;
    const big = t.tier === 2, f = big ? 1.15 : 1, tp = time * (t.focusTarget ? 2.2 : 1), hpr = Math.max(0, t.hp / t.maxHp), low = hpr < .3;
    G3.flash = 0; G3.ol = 2;
    g3Id(sx, gy, 0, f); g3Push(); g3T((40) * .3, -(17) * .4, 0); g3S((40) * 1.08, (17) * 1.1, 1); g3D('disc', '#000', 0, .34, 0); g3Pop();
    g3P('cyl6', '#4b5a60', 0, 0, 0, 28, 28, 8); g3P('cyl6', '#6a7a80', 0, 0, 8, 24, 24, 4);
    g3Push(); g3T(0, 0, 12); g3S(17, 17, 34); g3D('hex', '#76868b'); g3Pop();
    for (let i = 0; i < 3; i++) g3P('cyl6', c, 0, 0, 16 + i * 10, 16.2 - i * 1.7, 16.2 - i * 1.7, 1.8, .9);
    for (const sd of [-1, 1]) { g3P('pill', '#56666c', sd * 25, 6, 5, 2, 2, 10); g3P('gem6', c, sd * 25, 6, 12, 2.4, 2.4, 3.4, 1); g3P('sph', c, sd * 25, 6, 13.5, 9, 9, 9, 1, .6, 2); }
    for (let i = 0; i < 4; i++) { const a2 = i * Math.PI / 2 + Math.PI / 4; g3P('cube', '#56666c', Math.cos(a2) * 14, Math.sin(a2) * 14, 8, 5, 5, 26 + (big ? 6 : 0)); }
    g3P('cyl6', '#56666c', 0, 0, 46, 21, 21, 3);
    const hv = Math.sin(tp * 2) * 2;
    g3Push(); g3T(0, 0, 64 + hv); g3RZ(tp); g3S(7.5, 7.5, big ? 15 : 12); g3D('octa', c, 1.2); g3Pop();
    g3P('sph', c, 0, 0, 64 + hv, 14, 14, 14, .8, low ? .35 + .2 * Math.sin(time * 10) : .22, 2); if (t.focusTarget && !t.focusTarget.dead) g3P('sph', '#fff', 0, 0, 64 + hv, 5, 5, 5, 1, .9, 2);
    if (low) { g3Id(sx, gy, 0, 1); g3Smoke(0, 0, 76, 5, 20, 48, g3Hash(t.x, t.y)); g3Id(sx, gy, 0, f); }
    if (big) for (let i = 0; i < 3; i++) { const a2 = tp * 1.3 + i * 2.094; g3P('octa', c, Math.cos(a2) * 13, Math.sin(a2) * 13, 56 + hv, 2.4, 2.4, 4.4, 1); }
    return true;
}
function gl3dInhibitor(i, c) {
    if (!G3.act) return false;
    const a = g3Anchor(i.x, i.y), sx = a[0], gy = a[1] + 10; if (sx < -120 || sx > W + 120 || gy < -160 || gy > H + 200) return true;
    G3.flash = 0; G3.ol = 1.8; g3Id(sx, gy, 0, 1);
    g3Push(); g3T((34) * .3, -(14) * .4, 0); g3S((34) * 1.08, (14) * 1.1, 1); g3D('disc', '#000', 0, .32, 0); g3Pop();
    g3P('cyl6', '#3c4a50', 0, 0, 0, 26, 26, 5); g3P('cyl6', c, 0, 0, 5, 20, 20, 1.4, .9);
    for (let k = 0; k < 4; k++) { const a2 = k * Math.PI / 2 + time * .45; g3P('cone4', '#56666c', Math.cos(a2) * 17, Math.sin(a2) * 17, 5, 3.4, 3.4, 15); }
    g3Push(); g3T(0, 0, 33 + Math.sin(time * 2) * 3); g3RZ(time * .9); g3S(11, 11, 20); g3D('octa', c, 1.2); g3Pop();
    g3P('sph', c, 0, 0, 33, 22, 22, 22, .8, .22, 2);
    return true;
}
function gl3dNexus(n, c) {
    if (!G3.act) return false;
    const a = g3Anchor(n.x, n.y), sx = a[0], gy = a[1] + 22; if (sx < -160 || sx > W + 160 || gy < -200 || gy > H + 260) return true;
    G3.flash = 0; G3.ol = 2.4; g3Id(sx, gy, 0, 1);
    const pulse = .5 + .5 * Math.sin(time * 3), hv = Math.sin(time * 1.7) * 3;
    g3Push(); g3T((62) * .3, -(26) * .4, 0); g3S((62) * 1.08, (26) * 1.1, 1); g3D('disc', '#000', 0, .34, 0); g3Pop();
    g3P('cyl', '#3c4a50', 0, 0, 0, 50, 50, 8); g3P('cyl6', '#5b6b71', 0, 0, 8, 42, 42, 6); g3P('cyl6', c, 0, 0, 14, 36, 36, 1.6, .9);
    for (let k = 0; k < 6; k++) { const a2 = k * Math.PI / 3 + .52; g3P('cube', '#56666c', Math.cos(a2) * 32, Math.sin(a2) * 32, 14, 8, 8, 30 + (k % 2) * 8); g3P('cone4', c, Math.cos(a2) * 32, Math.sin(a2) * 32, 44 + (k % 2) * 8, 5, 5, 8, 1); }
    g3Push(); g3T(0, 0, 58 + hv); g3RZ(time * .8); g3S(20, 20, 38 + pulse * 3); g3D('octa', c, 1.3); g3Pop();
    g3P('sph', c, 0, 0, 58 + hv, 46, 46, 46, .9, .5 + pulse * .2, 2);
    for (const sd of [-1, 1]) { g3Push(); g3T(sd * 46, 14, 0); g3P('pill', '#56666c', 0, 0, 22, 2.6, 2.6, 44); g3P('gem6', c, 0, 0, 46, 3, 3, 4.4, 1); g3Push(); g3T(0, 0, 42); g3RY(.1 + Math.sin(time * 2.4 + sd) * .1); g3S(10, 1.5 + Math.sin(time * 3) * .4, 22); g3RZ(Math.PI / 2); g3D('cape', c, .35); g3Pop(); g3Pop(); }
    for (let k = 0; k < 2; k++) { g3Push(); g3T(0, 0, 58 + hv); g3RX(1.1 + k * .8); g3RZ(time * (k ? -1.4 : 1.1)); g3S(32 + k * 6, 32 + k * 6, 1); g3D('ring', '#fff', 1, .75, 2); g3Pop(); }
    return true;
}
function gl3dMonster(m, c) {
    if (!G3.act) return false;
    const a = g3Anchor(m.x, m.y), sx = a[0], r = m.r, gy = a[1] + r * .6; if (sx < -200 || sx > W + 200 || gy < -250 || gy > H + 250) return true;
    const k = m.kind, t = time * (k === 'titan' ? 2 : 3) + m.x * .01, f = r / 25 * 1.25, bob = Math.sin(t) * 1.5;
    G3.flash = m.flash > 0 ? .5 : 0; G3.ol = 2.2; g3Id(sx, gy, 0, f);
    g3Push(); g3T((30) * .3, -(13) * .4, 0); g3S((30) * 1.08, (13) * 1.1, 1); g3D('disc', '#000', 0, .34, 0); g3Pop();
    const ang = typeof hero !== 'undefined' ? Math.atan2(hero.y - m.y, hero.x - m.x) : 0; g3RZ(ang);
    const eyeC = k === 'titan' || k === 'drake' ? '#ff3b4e' : '#14212a', dk = shade(c, -.4), lt = shade(c, .25);
    const eyes = (x, z, sp, sz) => { for (const sd of [-1, 1]) { g3P('sph', '#fff', x, sd * sp, z, sz, sz * .8, sz * 1.1); g3P('sph', eyeC, x + sz * .6, sd * sp, z, sz * .6, sz * .55, sz * .7, k === 'titan' || k === 'drake' ? 1 : 0); } };
    if (k === 'stone' || k === 'shard' || k === 'titan') {          // rock golem
        const big = k === 'titan' ? 1.35 : 1;
        g3P('cube', dk, 0, 0, 7, 26, 22, 14); g3P('octa', c, 0, 0, 24 + bob, 17 * big, 15 * big, 17 * big); g3P('octa', lt, -4, -9, 31, 8, 7, 8);
        for (const sd of [-1, 1]) { g3Push(); g3T(0, sd * 22, 22 + bob); g3RY(Math.sin(t) * .15); g3P('octa', dk, 0, 0, -6, 7.5, 7, 12); g3P('sph', c, 2, 0, -17, 8, 7, 7); g3Pop(); }
        eyes(13, 30 + bob, 5, 2.8);
        if (k === 'shard' || k === 'titan') for (let i = 0; i < 5; i++) { const a2 = i * 1.26 + t * .15; g3P('cone4', '#d17dff', Math.cos(a2) * 12 - 6, Math.sin(a2) * 14, 36 + bob + (i % 2) * 3, 3, 3, 9 + (i % 2) * 5, 1); }
        if (k === 'titan') for (const sd of [-1, 1]) g3P('cone', '#e8d7ff', 4, sd * 8, 42 + bob, 3.2, 3.2, 14, .4);
    } else if (k === 'ember') {                                      // fire beast
        g3P('sph', c, 0, 0, 14 + bob, 19, 16, 15); g3P('sph', '#ffd36b', 3, 0, 10 + bob, 9, 9, 8, 1, .8);
        for (const sd of [-1, 1]) { g3P('cone4', '#ff5a3a', -4, sd * 8, 25 + bob, 4, 4, 12 + Math.sin(t * 2 + sd) * 3, 1); g3P('sph', dk, 2, sd * 14, 4, 5, 4, 4); }
        for (let i = 0; i < 5; i++) g3P('cone4', i % 2 ? '#ff9a3d' : '#ff5a3a', -8, (i - 2) * 5, 20 + bob, 3, 3, 12 + Math.sin(t * 3 + i) * 4, 1);
        eyes(14, 18 + bob, 5, 3);
    } else if (k === 'drake' || k === 'herald' || k === 'wind') {   // winged
        const fl = Math.sin(t * 1.6) * .35;
        g3P('sph', c, 0, 0, 20 + bob, 22, 14, 13); g3P('sph', lt, 4, 0, 16 + bob, 14, 10, 8);
        g3P('sph', c, 18, 0, 26 + bob, 9, 8, 8); g3P('cone4', dk, 26, 0, 24 + bob, 5, 4, 8); // head+snout
        for (let i = 0; i < 4; i++) g3P('sph', c, -22 - i * 8, 0, 18 + bob - i * 1.4, 7 - i, 5 - i * .7, 5 - i);
        for (const sd of [-1, 1]) { g3Push(); g3T(-2, sd * 11, 28 + bob); g3RX(sd * (.5 + fl)); g3P('cube', shade(c, -.15), -3, sd * 11, 0, 11, 20, 1.6); g3P('cone4', dk, 0, sd * 21, 0, 2.4, 2.4, 7); g3Pop(); }
        for (const sd of [-1, 1]) g3P('cone4', '#ffe9b0', 15, sd * 4, 33 + bob, 2.4, 2.4, 9);
        if (k === 'herald') { g3P('cyl6', '#e3b451', 0, 0, 33 + bob, 8, 8, 3, .6); g3P('octa', '#fff1a0', 0, 0, 38 + bob, 4, 4, 6, 1); }
        eyes(22, 29 + bob, 4, 2.4);
    } else {                                                          // slime / generic
        g3P('sph', c, 0, 0, 13 + bob, 20, 18, 14 + Math.sin(t * 1.5) * 1.5); g3P('sph', lt, -4, -4, 20 + bob, 6, 5, 4, .3, .8);
        eyes(16, 16 + bob, 6, 3.2);
    }
    return true;
}
function g3Smoke(x0, y0, z0, n, spread, rise, seed) {      // rising translucent puffs (call with a clean matrix)
    if (G3.lod || options.reducedMotion) return;
    for (let i = 0; i < n; i++) { const ph = (time * .45 + i / n + seed) % 1, a = i * 2.4 + seed * 9; g3Push(); g3T(x0 + Math.sin(a) * spread * ph, y0 + Math.cos(a) * spread * .5 * ph, z0 + ph * rise); const r = 3 + ph * 8; g3S(r, r, r); g3D('sphL', '#9aa7ad', .3, .55 * (1 - ph), 2); g3Pop(); }
}
function g3Hash(a, b) { const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return n - Math.floor(n); }
function gl3dObstacle(o) {
    if (!G3.act) return;
    const a = g3Anchor(o.x, o.y), ox = a[0], oy = a[1]; if (ox > W + 80 || ox + o.w < -80 || oy > H + 80 || oy + o.h < -120) return;
    G3.flash = 0; G3.ol = 1.6;
    const HB = G3.persp ? 9 : 0;                           // raised stone plinth under the rocks / grove (true-perspective mode only)
    if (HB) { g3Id(ox + o.w / 2, oy + o.h / 2, 0, 1); g3Push(); g3S(o.w * .8, o.h * .8, HB); g3D('sq2', o.t === 'rock' ? '#5f7a82' : '#2f5a48', 0, 1, 1); g3Pop(); g3P('sq2', o.t === 'rock' ? '#6f8c93' : '#376a54', 0, 0, HB * .93, o.w * .68, o.h * .68, 1.4); }
    if (o.t === 'rock') {
        const n = Math.max(3, Math.round(o.w * o.h / 4200));
        for (let i = 0; i < n; i++) {
            const h1 = g3Hash(o.x + i * 7, o.y), h2 = g3Hash(o.y + i * 3, o.x), h3 = g3Hash(i, o.x + o.y);
            const x = ox + o.w * (.18 + .64 * ((i + h1 * .6) / n)), y = oy + o.h * (.3 + .45 * h2), rw = 26 + h1 * 22, rh = 18 + h3 * 14, hh = 16 + h2 * 16;
            g3Id(x, y + rh * .5, HB, 1); g3RZ(h3 * 6);
            g3Push(); g3T((rw * 1.3) * .3, -(rh * .7) * .4, 0); g3S((rw * 1.3) * 1.08, (rh * .7) * 1.1, 1); g3D('disc', '#000', 0, .28, 0); g3Pop();
            g3P('octa', i % 2 ? '#6f827d' : '#7d908a', 0, 0, hh * .65, rw, rh, hh); g3P('octa', '#93a69f', rw * .1, -rh * .15, hh * 1.2, rw * .5, rh * .5, hh * .45);
        }
        return;
    }
    const cols = Math.max(2, Math.floor(o.w / 38)), rows = Math.max(1, Math.floor(o.h / 42));
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const h1 = g3Hash(c + o.x, r + o.y), x = ox + 18 + c * 38 + h1 * 8, y = oy + 30 + r * 42 + (c % 2) * 8, k = .85 + h1 * .35;
        if (x > W + 40 || x < -40) continue;
        g3Id(x, y, HB, k);
        g3Push(); g3T((15) * .3, -(7) * .4, 0); g3S((15) * 1.08, (7) * 1.1, 1); g3D('disc', '#000', 0, .3, 0); g3Pop();
        const sw = Math.sin(time * 1.4 + x * .05 + y * .03) * .05; g3P('cyl6', '#5a4030', 0, 0, 0, 2.6, 2.6, 10); g3Push(); g3T(0, 0, 6); g3RY(sw); g3P('cone6', h1 > .5 ? '#2c8f5b' : '#27804f', 0, 0, 0, 13, 13, 20); g3RY(sw * 1.5); g3P('cone6', h1 > .5 ? '#37a96b' : '#319a5d', 0, 0, 12, 9.5, 9.5, 18); g3Pop();
    }
}
function gl3dBrush(b, bi) {        // swaying grass tufts over the painted bush (true-perspective mode only)
    if (!G3.act || !G3.persp) return;
    const a = g3Anchor(b.x, b.y), ox = a[0], oy = a[1]; if (ox > W + 60 || ox + b.w < -60 || oy > H + 60 || oy + b.h < -60) return;
    G3.flash = 0; G3.ol = G3.lod ? 0 : 1.1;
    const cols = Math.max(2, Math.floor(b.w / 34)), rows = Math.max(1, Math.floor(b.h / 30)), cl = ['#2f8a59', '#3a9b62', '#26744d'];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const h1 = g3Hash(c + b.x, r + b.y), x = ox + (c + .5 + (r % 2) * .5) * b.w / (cols + .5), y = oy + (r + .7) * b.h / (rows + .3);
        if (x > ox + b.w - 6 || x < -30 || x > W + 30 || y < -40 || y > H + 40) continue;
        const sw = options.reducedMotion ? 0 : Math.sin(time * 1.8 + bi * 1.7 + x * .031 + r) * .22, col = cl[(c + r) % 3];
        g3Id(x, y, 0, 1);
        for (let i = 0; i < 3; i++) { g3Push(); g3T((i - 1) * 4.5, (h1 - .5) * 5, 0); g3RY(sw + (i - 1) * .26); g3P('cone4', i === 1 ? '#57ad73' : col, 0, 0, 0, 3.4, 3.4, 16 + h1 * 10 + (i === 1 ? 4 : 0)); g3Pop(); }
    }
}
function gl3dRiver() {             // water glints and ripples along the river band (true-perspective mode only)
    if (!G3.act || !G3.persp) return;
    const x0 = 1050, y0 = -100, x1 = 1560, y1 = 1900, dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len, a = g3Anchor(0, 0);
    G3.flash = 0; G3.ol = 0; const n = G3.lod ? 36 : 90;
    for (let i = 0; i < n; i++) {
        const h1 = g3Hash(i * 3, 71), h2 = g3Hash(i * 5, 13), t = (i / n + time * .006 * (.5 + h1)) % 1, lat = (h2 - .5) * 125, wx = x0 + dx * t + nx * lat, wy = y0 + dy * t + ny * lat;
        const x = a[0] + wx, y = a[1] + wy; if (x < -40 || x > W + 40 || y < -40 || y > H + 40) continue;
        const tw = .5 + .5 * Math.sin(time * 2.2 + h1 * 30), p = (time * .38 + h2 * 7) % 1;
        g3Id(x, y, 1.2, 1);
        if (i % 3 === 0) { g3Push(); g3S(5 + p * 17, 2 + p * 6.5, 1); g3D('ring', '#a8efff', 0, .5 * (1 - p), 2); g3Pop(); }
        else { g3Push(); g3S(4 + h1 * 7, 1.1, 1); g3D('disc', '#d6fbff', 1, .12 + .38 * tw, 2); g3Pop(); }
    }
}
function gl3dBolt(p) {             // glowing 3D projectile over the 2D trail (true-perspective mode only)
    if (!G3.act || !G3.persp) return;
    const a = g3Anchor(p.x, p.y), x = a[0], y = a[1]; if (x < -40 || x > W + 40 || y < -60 || y > H + 40) return;
    const col = p.type === 'towerShot' ? (p.power >= 3 ? '#ffffff' : p.power >= 1 ? '#ff5268' : '#ff9f57') : p.type === 'minionShot' ? (p.siege ? '#ffd56d' : '#c4f4ff') : (p.color || '#fff4a8'), big = p.type === 'towerShot' ? 1.4 : p.siege ? 1.25 : 1;
    G3.flash = 0; G3.ol = 0; g3Id(x, y, 0, 1);
    g3Push(); g3S(7 * big, 3 * big, 1); g3D('disc', '#000', 0, .22, 0); g3Pop();
    g3P('sph', col, 0, 0, 22, 4.2 * big, 4.2 * big, 4.2 * big, 1, .92, 2); g3P('sph', '#ffffff', 0, 0, 22, 2.2 * big, 2.2 * big, 2.2 * big, 1, .98, 2);
    if (p.tx !== undefined) { const dx = p.x - p.tx, dy = p.y - p.ty, d = Math.hypot(dx, dy) || 1; for (let i = 1; i <= 3; i++) g3P('sph', col, dx / d * i * 8, dy / d * i * 8, 22 - i * .8, (3.2 - i * .7) * big, (3.2 - i * .7) * big, (3.2 - i * .7) * big, 1, .5 - i * .1, 2); }
}
function gl3dMote(p) {             // floating glowing mote for generic effect particles (heal, shield, dash, cast...) (true-perspective mode only)
    if (!G3.act || !G3.persp || p.type === 'move' || G3.lod || G3.mN > 110) return;
    const a = g3Anchor(p.x, p.y), x = a[0], y = a[1]; if (x < -30 || x > W + 30 || y < -50 || y > H + 30) return; G3.mN++;
    const col = p.type === 'mastery' ? (p.color || '#ffd36b') : p.type === 'shield' ? '#72f2ff' : p.type === 'dash' ? (p.color || '#b882ff') : p.type === 'recall' ? '#6da8ff' : p.type === 'heal' ? '#62ed94' : '#ffcf60', f = Math.min(1, Math.max(0, p.life * 1.7));
    G3.flash = 0; G3.ol = 0; g3Id(x, y, 0, 1); g3P('sph', col, 0, 0, 10 + (1 - f) * 26 + Math.sin(time * 6 + p.x) * 2, 2.8, 2.8, 2.8, 1, .35 + .55 * f, 2);
}
function gl3dAmbient() {           // drifting fireflies and pollen in the air (true-perspective mode only)
    if (!G3.act || !G3.persp || G3.lod || options.reducedMotion || options.particles === false) return;
    const cs = 300, c0 = Math.floor(cam.x / cs) - 1, r0 = Math.floor(cam.y / cs) - 1, nc = Math.ceil(W / cs) + 2, nr = Math.ceil(H / cs) + 2;
    const a = g3Anchor(0, 0); G3.flash = 0; G3.ol = 0;
    for (let r = 0; r < nr; r++) for (let c = 0; c < nc; c++) for (let k = 0; k < 2; k++) {
        const gx = c0 + c, gy = r0 + r, h1 = g3Hash(gx * 3 + k, gy * 7), h2 = g3Hash(gy * 5 + k, gx * 11), h3 = g3Hash(gx + k * 13, gy + 5);
        if (h1 < .35) continue;
        const ph = time * (.25 + h2 * .35) + h3 * 6.28, x = a[0] + gx * cs + h1 * cs + Math.sin(ph) * 40, y = a[1] + gy * cs + h2 * cs + Math.cos(ph * .8) * 30, z = 24 + h3 * 46 + Math.sin(time * 1.3 + h1 * 9) * 7;
        if (x < -30 || x > W + 30 || y < -60 || y > H + 60) continue;
        const tw = .55 + .45 * Math.sin(time * 3 + h2 * 20), warm = h3 > .5;
        g3Id(x, y, 0, 1); g3Push(); g3S(5, 2.2, 1); g3D('disc', '#000', 0, .12, 0); g3Pop();
        g3P('sph', warm ? '#ffe9a0' : '#9ff5d0', 0, 0, z, 4, 4, 4, 1, .55 + .45 * tw, 2);
    }
}
function gl3dRuins(t) {
    if (!G3.act) return;
    const a = g3Anchor(t.x, t.y), sx = a[0], gy = a[1] + 12; if (sx < -100 || sx > W + 100 || gy < -100 || gy > H + 160) return;
    G3.flash = 0; G3.ol = 1.6; g3Id(sx, gy, 0, 1);
    const c = t.team === 'blue' ? '#4bdcff' : '#ff5267';
    g3P('cyl6', '#3d4a4f', 0, 0, 0, 27, 27, 4);
    for (let i = 0; i < 6; i++) { const a2 = i * 1.05 + g3Hash(t.x, i) * .6, d = 10 + (i % 3) * 8, h = 6 + g3Hash(i, t.y) * 12; g3Push(); g3T(Math.cos(a2) * d, Math.sin(a2) * d * .8, 3); g3RZ(a2); g3RY(.3 * (i % 2 ? 1 : -1)); g3S(8 + i % 3 * 2, 6, h); g3D('cube', i % 2 ? '#56666c' : '#6a7a80'); g3Pop(); }
    g3P('octa', c, 4, -3, 6, 3.4, 3, 5, .35); g3Id(sx, gy, 0, 1); g3Smoke(0, 0, 14, 5, 22, 46, g3Hash(t.x, t.y)); g3P('sph', c, 0, 0, 10, 16, 16, 12, .5, .1 + .05 * Math.sin(time * 3), 2);
}
try { const m3 = document.querySelector('#model3d'); if (m3) m3.onchange = () => { options.model3d = m3.checked; applyOptions(); }; } catch (e) { }
try { const pc = document.querySelector('#persp'); if (pc) pc.onchange = () => { options.persp = pc.checked; applyOptions(); }; } catch (e) { }
try { G3P.phi = (+options.camTilt || 56) * Math.PI / 180; const ct = document.querySelector('#camTilt'); if (ct) ct.onchange = () => { options.camTilt = +ct.value; G3P.phi = options.camTilt * Math.PI / 180; applyOptions(); }; } catch (e) { }
try { const ms = document.querySelector('#modelScale'); G3.ms = (+options.modelScale || 120) / 100; if (ms) ms.onchange = () => { options.modelScale = +ms.value; G3.ms = options.modelScale / 100; applyOptions(); }; } catch (e) { }
