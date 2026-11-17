// Procedural weapon models. Barrel points along -Z, +Y is up, origin sits near the trigger.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { G } from './ctx.js';
import { NOISE_GLSL } from './atmos.js';

let MAT = null;
// Gun finishes are painted in the shader from the model's own coordinates (object space), so they stay put while the gun moves.
// metal: blued steel with fine grain, darker in recesses, bare worn metal in patches; wood: walnut grain running along the stock.
function finish(mat, kind, tint) {
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vOP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvOP = position;');
    let col = '', rough = '';
    if (kind === 'metal') {
      col = `float gF = n3(vOP * 260.0), gM = fb3(vOP * 34.0), wear = smoothstep(0.66, 0.8, fb3(vOP * 11.0 + 3.0));
        diffuseColor.rgb *= 0.78 + 0.32 * gF + 0.18 * (gM - 0.5);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(${tint}), wear * 0.75);`;
      rough = `roughnessFactor = clamp(roughnessFactor * (0.7 + 0.6 * gM) - wear * 0.22, 0.12, 1.0);`;
    } else if (kind === 'wood') {
      col = `float g = fb3(vec3(vOP.z * 4.0, vOP.y * 70.0, vOP.x * 70.0));
        float ring = sin(vOP.y * 210.0 + vOP.x * 120.0 + g * 9.0 + vOP.z * 6.0) * 0.5 + 0.5;
        float pore = smoothstep(0.55, 0.8, n3(vec3(vOP.z * 30.0, vOP.y * 900.0, vOP.x * 900.0)));
        vec3 c = mix(vec3(${tint}) * 0.55, vec3(${tint}), ring * 0.55 + g * 0.45) * (1.0 - pore * 0.25);
        float rub = smoothstep(0.62, 0.78, fb3(vOP * 9.0));
        diffuseColor.rgb = mix(c, c * 1.5, rub * 0.5);`;
      rough = `roughnessFactor = clamp(roughnessFactor * (0.85 + 0.3 * g) - rub * 0.1, 0.2, 1.0);`;
    }
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vOP;' + NOISE_GLSL)
      .replace('#include <map_fragment>', '#include <map_fragment>\n' + col)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n' + rough);
  };
  mat.customProgramCacheKey = () => 'gun-' + kind + tint;
  return mat;
}
export function gunMats() {
  if (MAT) return MAT;
  const env = G.scene.environment, S = (o) => new THREE.MeshStandardMaterial({ envMap: env, envMapIntensity: 1, ...o });
  const W = (o) => new THREE.MeshPhysicalMaterial({ envMap: env, envMapIntensity: 0.8, clearcoat: 0.45, clearcoatRoughness: 0.35, ...o });
  MAT = {
    steel: finish(S({ color: 0x23262b, metalness: 0.9, roughness: 0.42 }), 'metal', '0.42, 0.43, 0.45'),
    dark: finish(S({ color: 0x121315, metalness: 0.75, roughness: 0.6 }), 'metal', '0.25, 0.25, 0.26'),
    worn: finish(S({ color: 0x4c4f53, metalness: 0.95, roughness: 0.32 }), 'metal', '0.6, 0.6, 0.6'),
    wood: finish(W({ color: 0xffffff, roughness: 0.55 }), 'wood', '0.13, 0.045, 0.016'),
    woodEx: finish(W({ color: 0xffffff, roughness: 0.58 }), 'wood', '0.11, 0.038, 0.013'),
    brass: finish(S({ color: 0xb08035, metalness: 1, roughness: 0.32 }), 'metal', '0.9, 0.7, 0.35'),
    copper: finish(S({ color: 0xb4623a, metalness: 1, roughness: 0.35 }), 'metal', '0.95, 0.55, 0.35'),
    poly: finish(S({ color: 0x1c1d1a, metalness: 0.0, roughness: 0.75 }), 'metal', '0.18, 0.18, 0.17'),
    core: new THREE.MeshStandardMaterial({ color: 0x0a1a2a, emissive: new THREE.Color(0.35, 0.8, 1.6), emissiveIntensity: 1.6, roughness: 0.2, transparent: true, opacity: 0.92 }),
    green: finish(S({ map: G.tex.metalGreen, metalness: 0.5, roughness: 0.6 }), 'metal', '0.35, 0.35, 0.33'),
    glass: S({ color: 0x0a1420, metalness: 0.9, roughness: 0.06, envMapIntensity: 2.5 }),
    // upgraded finish: deep violet anodising, gold wear, dark red varnish
    upSteel: finish(S({ color: 0x2a1d48, metalness: 0.95, roughness: 0.3, emissive: 0x12062a, emissiveIntensity: 0.8 }), 'metal', '0.85, 0.66, 0.3'),
    upDark: finish(S({ color: 0x150d26, metalness: 0.9, roughness: 0.35, emissive: 0x0a031c }), 'metal', '0.6, 0.45, 0.2'),
    upWorn: finish(S({ color: 0xc9a44a, metalness: 1, roughness: 0.25 }), 'metal', '1.0, 0.85, 0.45'),
    upWood: finish(W({ color: 0xffffff, roughness: 0.35, clearcoat: 0.9 }), 'wood', '0.1, 0.012, 0.014'),
    upWoodEx: finish(W({ color: 0xffffff, roughness: 0.35, clearcoat: 0.9 }), 'wood', '0.09, 0.01, 0.012'),
  };
  MAT.upgrade = new Map([[MAT.steel, MAT.upSteel], [MAT.dark, MAT.upDark], [MAT.worn, MAT.upWorn], [MAT.wood, MAT.upWood], [MAT.woodEx, MAT.upWoodEx]]);
  return MAT;
}
// reflections of the actual room instead of the neutral studio used at start-up
export function setGunEnv(tex) { const m = gunMats(); for (const k in m) if (m[k] && m[k].isMaterial) { m[k].envMap = tex; m[k].needsUpdate = true; } }
const rb = (w, h, d, r = 0.004) => new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.2, h / 2.2, d / 2.2));
const cz = (r, len, seg = 18, r2 = r) => new THREE.CylinderGeometry(r2, r, len, seg).rotateX(Math.PI / 2); // axis along Z, r2 at the muzzle (-Z) end
const cx = (r, len, seg = 14) => new THREE.CylinderGeometry(r, r, len, seg).rotateZ(Math.PI / 2); // axis along X
function P(parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); parent.add(m); return m; }
// Side profile ([z, y] points) extruded across X with a bevel: gives real silhouettes for stocks, grips and receivers.
function ex(parent, pts, thick, mat, x = 0, bevel = 0.003) {
  const sh = new THREE.Shape(); pts.forEach(([z, y], i) => (i ? sh.lineTo(-z, y) : sh.moveTo(-z, y)));
  const d = Math.max(0.001, thick - 2 * bevel);
  const g = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 4 });
  g.translate(0, 0, -d / 2); g.rotateY(Math.PI / 2);
  const m = new THREE.Mesh(g, mat); m.position.x = x; parent.add(m); return m;
}
function guard(g, m, z, y = -0.012, r = 0.021) { P(g, new THREE.TorusGeometry(r, 0.0026, 6, 16, Math.PI), m.dark, 0, y, z, Math.PI, Math.PI / 2, 0); ex(g, [[z - 0.002, y + 0.002], [z + 0.004, y + 0.002], [z + 0.001, y - 0.016], [z - 0.004, y - 0.014]], 0.005, m.worn, 0, 0.001); }
const pin = (g, m, y, z, w, r = 0.003) => P(g, cx(r, w, 8), m.worn, 0, y, z);
function ring(g, m, r, y, z, t = 0.0022) { return P(g, new THREE.TorusGeometry(r, t, 6, 16), m.dark, 0, y, z); }

export const BUILD = {
  pistol(g, m) {
    const slide = new THREE.Group(); g.add(slide);
    ex(slide, [[-0.168, 0.02], [0.05, 0.02], [0.056, 0.03], [0.052, 0.05], [-0.162, 0.05], [-0.168, 0.044]], 0.029, m.steel);
    for (let i = 0; i < 7; i++) P(slide, rb(0.0304, 0.021, 0.0024, 0.0005), m.dark, 0, 0.037, 0.016 + i * 0.0052);
    P(slide, rb(0.011, 0.004, 0.04, 0.001), m.dark, 0.008, 0.0505, -0.035);
    P(slide, rb(0.0035, 0.006, 0.008, 0.001), m.dark, 0, 0.0545, -0.155);
    for (const s of [-1, 1]) P(slide, rb(0.005, 0.007, 0.008, 0.001), m.dark, s * 0.0075, 0.055, 0.042);
    ex(g, [[-0.125, 0.0], [-0.125, 0.02], [0.05, 0.02], [0.062, 0.004], [0.07, -0.02], [0.084, -0.1], [0.042, -0.108], [0.027, -0.03], [0.012, -0.012], [-0.045, -0.012], [-0.05, 0.0]], 0.026, m.dark);
    ex(g, [[0.032, -0.014], [0.066, -0.014], [0.078, -0.092], [0.045, -0.098]], 0.0325, m.woodEx, 0, 0.002);
    for (const s of [-1, 1]) for (const [y, z] of [[-0.03, 0.05], [-0.08, 0.062]]) P(g, cx(0.003, 0.002, 8), m.worn, s * 0.0165, y, z);
    P(g, cz(0.0068, 0.03), m.worn, 0, 0.036, -0.168); P(g, cz(0.0042, 0.02), m.worn, 0, 0.0245, -0.13);
    guard(g, m, -0.012, -0.012, 0.021);
    ex(g, [[0.05, 0.036], [0.064, 0.05], [0.07, 0.044], [0.058, 0.03]], 0.008, m.dark, 0, 0.001);
    P(g, rb(0.003, 0.008, 0.022, 0.001), m.worn, -0.0145, 0.014, -0.005);
    const mag = P(g, rb(0.02, 0.095, 0.03, 0.003), m.worn, 0, -0.058, 0.057, 0.14); P(mag, rb(0.025, 0.007, 0.038, 0.002), m.dark, 0, -0.05, 0.001);
    return { slide, mag, muzzle: [0, 0.036, -0.186], sightY: 0.0585, grip: [0, -0.05, 0.056], eject: [0.02, 0.05, -0.03] };
  },
  magnum(g, m) {
    ex(g, [[-0.07, 0.002], [-0.07, 0.05], [0.03, 0.05], [0.044, 0.036], [0.05, 0.0], [0.03, -0.012], [-0.02, -0.012]], 0.024, m.worn);
    const cyl = P(g, cz(0.0235, 0.05, 20), m.steel, 0, 0.026, -0.03);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.283 + 0.52; P(cyl, cz(0.0075, 0.03, 8), m.dark, Math.cos(a) * 0.0215, Math.sin(a) * 0.0215, -0.012); }
    P(g, cz(0.0105, 0.2), m.worn, 0, 0.037, -0.165); ex(g, [[-0.26, 0.012], [-0.07, 0.012], [-0.07, 0.03], [-0.26, 0.03]], 0.012, m.worn, 0, 0.002);
    ex(g, [[-0.262, 0.046], [-0.07, 0.046], [-0.07, 0.054], [-0.262, 0.052]], 0.007, m.dark, 0, 0.001);
    ex(g, [[-0.258, 0.052], [-0.235, 0.052], [-0.24, 0.064]], 0.004, m.dark, 0, 0.001);
    P(g, rb(0.012, 0.007, 0.01, 0.001), m.dark, 0, 0.056, 0.022);
    P(g, cz(0.004, 0.08, 8), m.steel, 0, 0.012, -0.11);
    ex(g, [[0.02, -0.006], [0.052, 0.012], [0.064, -0.02], [0.088, -0.1], [0.07, -0.115], [0.042, -0.108], [0.034, -0.03]], 0.031, m.woodEx, 0, 0.005);
    ex(g, [[0.042, 0.044], [0.056, 0.066], [0.066, 0.06], [0.054, 0.036]], 0.008, m.dark, 0, 0.001);
    guard(g, m, -0.006, -0.012, 0.02);
    return { slide: null, mag: cyl, magSpin: true, muzzle: [0, 0.037, -0.275], sightY: 0.0655, grip: [0, -0.052, 0.06], eject: null };
  },
  smg(g, m) {
    P(g, cz(0.021, 0.31, 20), m.steel, 0, 0.03, -0.07); P(g, cz(0.022, 0.012, 20), m.dark, 0, 0.03, 0.086);
    P(g, cz(0.0085, 0.2), m.worn, 0, 0.03, -0.3); P(g, cz(0.0135, 0.03, 12), m.dark, 0, 0.03, -0.24);
    P(g, rb(0.014, 0.006, 0.09, 0.001), m.dark, 0.016, 0.036, -0.06); P(g, cx(0.004, 0.022, 8), m.worn, 0.03, 0.036, -0.03);
    ex(g, [[-0.19, -0.02], [-0.19, 0.016], [0.07, 0.016], [0.078, -0.01], [0.09, -0.11], [0.05, -0.115], [0.036, -0.03], [0.012, -0.02]], 0.03, m.dark);
    ex(g, [[0.04, -0.022], [0.074, -0.018], [0.086, -0.104], [0.054, -0.108]], 0.035, m.woodEx, 0, 0.003);
    P(g, rb(0.031, 0.05, 0.042, 0.003), m.steel, 0, -0.04, -0.15);
    const mag = P(g, rb(0.022, 0.19, 0.03, 0.003), m.worn, 0, -0.13, -0.15); for (let i = 0; i < 4; i++) P(mag, rb(0.0235, 0.003, 0.02, 0.0005), m.dark, 0, -0.06 + i * 0.035, 0);
    guard(g, m, 0.008, -0.02);
    for (const s of [-1, 1]) P(g, cz(0.004, 0.27, 6), m.steel, s * 0.014, 0.004, 0.2); P(g, rb(0.04, 0.1, 0.012, 0.004), m.steel, 0, -0.02, 0.338);
    P(g, rb(0.006, 0.026, 0.008, 0.001), m.dark, 0, 0.058, -0.385); ring(g, m, 0.012, 0.066, -0.385); P(g, rb(0.016, 0.014, 0.01, 0.002), m.dark, 0, 0.05, -0.385);
    P(g, rb(0.016, 0.02, 0.008, 0.002), m.dark, 0, 0.058, 0.03); P(g, rb(0.02, 0.008, 0.02, 0.002), m.dark, 0, 0.05, 0.03);
    return { mag, muzzle: [0, 0.03, -0.41], sightY: 0.067, grip: [0, -0.06, 0.062], fore: [0, -0.05, -0.15], foreMag: true, eject: [0.03, 0.04, -0.06] };
  },
  drum(g, m) {
    ex(g, [[-0.2, -0.02], [-0.2, 0.012], [0.02, 0.012], [0.06, 0.0], [0.12, 0.014], [0.36, 0.006], [0.37, -0.085], [0.2, -0.05], [0.12, -0.04], [0.085, -0.075], [0.055, -0.07], [0.04, -0.03], [0.0, -0.022]], 0.036, m.woodEx, 0, 0.006);
    P(g, rb(0.036, 0.1, 0.01, 0.003), m.dark, 0, -0.04, 0.372);
    P(g, rb(0.034, 0.03, 0.3, 0.008), m.steel, 0, 0.03, -0.06); P(g, rb(0.03, 0.012, 0.22, 0.005), m.dark, 0, 0.049, -0.06);
    P(g, rb(0.04, 0.042, 0.24, 0.016), m.steel, 0, 0.028, -0.32);
    for (let i = 0; i < 5; i++) for (const s of [-1, 1]) P(g, rb(0.003, 0.012, 0.03, 0.001), m.dark, s * 0.0195, 0.03, -0.23 - i * 0.042);
    for (let i = 0; i < 5; i++) P(g, rb(0.012, 0.003, 0.03, 0.001), m.dark, 0, 0.049, -0.23 - i * 0.042);
    ex(g, [[-0.44, 0.008], [-0.44, 0.05], [-0.47, 0.03]], 0.04, m.steel, 0, 0.003);
    P(g, cz(0.0075, 0.1), m.worn, 0, 0.028, -0.4);
    const mag = P(g, cx(0.068, 0.052, 28), m.steel, 0, -0.07, -0.13); P(mag, cx(0.05, 0.056, 20), m.dark, 0, 0, 0); P(mag, cx(0.014, 0.06, 10), m.worn, 0, 0, 0);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.283; P(mag, rb(0.054, 0.004, 0.016, 0.001), m.steel, 0, Math.cos(a) * 0.058, Math.sin(a) * 0.058, a); }
    guard(g, m, 0.02, -0.024);
    P(g, rb(0.005, 0.02, 0.006, 0.001), m.dark, 0, 0.062, -0.4); for (const s of [-1, 1]) P(g, rb(0.003, 0.022, 0.012, 0.001), m.dark, s * 0.009, 0.064, -0.4);
    P(g, rb(0.018, 0.016, 0.012, 0.002), m.dark, 0, 0.062, 0.0); P(g, cx(0.0045, 0.02, 8), m.worn, 0.027, 0.036, -0.03);
    return { mag, muzzle: [0, 0.028, -0.46], sightY: 0.072, grip: [0, -0.045, 0.075], fore: [0, -0.02, -0.26], foreB: [0.005, 0.02], eject: [0.025, 0.06, -0.05] };
  },
  shotgun(g, m) {
    ex(g, [[-0.15, -0.012], [-0.15, 0.05], [0.07, 0.05], [0.09, 0.03], [0.09, -0.012]], 0.036, m.steel, 0, 0.005);
    P(g, rb(0.006, 0.02, 0.07, 0.002), m.dark, 0.018, 0.026, -0.05);
    P(g, cz(0.0125, 0.6), m.steel, 0, 0.038, -0.44); P(g, cz(0.0115, 0.44), m.dark, 0, 0.011, -0.37); P(g, cz(0.0135, 0.016, 12), m.worn, 0, 0.011, -0.585);
    P(g, rb(0.012, 0.03, 0.012, 0.002), m.steel, 0, 0.025, -0.56);
    const pump = new THREE.Group(); g.add(pump);
    P(pump, cz(0.022, 0.18, 18), m.wood, 0, 0.012, -0.37); for (let i = 0; i < 7; i++) P(pump, cz(0.0228, 0.006, 18), m.wood, 0, 0.012, -0.3 - i * 0.022);
    for (const s of [-1, 1]) P(pump, cz(0.003, 0.2, 6), m.steel, s * 0.016, 0.024, -0.25);
    ex(g, [[0.085, 0.034], [0.14, 0.03], [0.4, 0.018], [0.41, -0.09], [0.22, -0.045], [0.16, -0.04], [0.135, -0.085], [0.1, -0.08], [0.088, -0.014]], 0.034, m.woodEx, 0, 0.007);
    P(g, rb(0.036, 0.11, 0.014, 0.004), m.dark, 0, -0.036, 0.413);
    guard(g, m, 0.06, -0.016); P(g, new THREE.SphereGeometry(0.0042, 8, 6), m.brass, 0, 0.0545, -0.735); P(g, rb(0.007, 0.005, 0.2, 0.001), m.dark, 0, 0.0535, -0.05);
    return { pump, mag: null, muzzle: [0, 0.038, -0.75], sightY: 0.0585, grip: [0, -0.05, 0.118], fore: [0, -0.01, -0.37], foreB: [-0.011, 0.023], eject: [0.03, 0.03, -0.06] };
  },
  double(g, m) {
    for (const s of [-1, 1]) { P(g, cz(0.0118, 0.36), m.steel, s * 0.0118, 0.034, -0.24); P(g, cz(0.0096, 0.01, 12), m.dark, s * 0.0118, 0.034, -0.416); }
    P(g, rb(0.006, 0.005, 0.36, 0.001), m.dark, 0, 0.0465, -0.24); P(g, new THREE.SphereGeometry(0.004, 8, 6), m.brass, 0, 0.052, -0.41);
    ex(g, [[-0.08, -0.008], [-0.08, 0.05], [0.04, 0.05], [0.075, 0.028], [0.08, -0.012]], 0.05, m.worn, 0, 0.006);
    P(g, rb(0.01, 0.006, 0.05, 0.002), m.dark, 0, 0.054, 0.02); for (const s of [-1, 1]) ex(g, [[0.036, 0.046], [0.05, 0.068], [0.06, 0.062], [0.05, 0.04]], 0.008, m.dark, s * 0.016, 0.001);
    ex(g, [[-0.3, -0.004], [-0.3, 0.02], [-0.08, 0.024], [-0.08, -0.012], [-0.2, -0.016]], 0.046, m.woodEx, 0, 0.008);
    ex(g, [[0.07, 0.03], [0.12, 0.02], [0.16, -0.02], [0.2, -0.11], [0.15, -0.125], [0.11, -0.05], [0.085, -0.014]], 0.04, m.woodEx, 0, 0.009);
    guard(g, m, 0.045, -0.014, 0.024);
    return { mag: null, breakOpen: true, muzzle: [0, 0.034, -0.43], sightY: 0.056, grip: [0, -0.06, 0.135], fore: [0, -0.015, -0.2], foreB: [-0.018, 0.024], eject: null };
  },
  carbine(g, m) {
    ex(g, [[-0.5, -0.004], [-0.5, 0.022], [-0.1, 0.024], [0.06, 0.02], [0.1, 0.0], [0.16, 0.012], [0.43, 0.004], [0.44, -0.1], [0.24, -0.055], [0.15, -0.045], [0.12, -0.06], [0.09, -0.03], [-0.02, -0.03], [-0.1, -0.022]], 0.04, m.woodEx, 0, 0.008);
    P(g, rb(0.04, 0.12, 0.012, 0.004), m.dark, 0, -0.048, 0.443);
    ex(g, [[-0.46, 0.022], [-0.46, 0.05], [-0.16, 0.052], [-0.16, 0.022]], 0.034, m.woodEx, 0, 0.007);
    P(g, rb(0.036, 0.034, 0.25, 0.008), m.steel, 0, 0.038, -0.03); P(g, rb(0.006, 0.014, 0.08, 0.002), m.dark, 0.018, 0.042, -0.05);
    P(g, cx(0.005, 0.03, 8), m.worn, 0.03, 0.04, -0.02); P(g, new THREE.SphereGeometry(0.007, 8, 6), m.worn, 0.046, 0.04, -0.02);
    P(g, cz(0.009, 0.24), m.steel, 0, 0.04, -0.6); P(g, cz(0.0075, 0.2, 10), m.dark, 0, 0.02, -0.58); P(g, cz(0.0135, 0.03, 10), m.steel, 0, 0.03, -0.69);
    P(g, rb(0.004, 0.024, 0.006, 0.001), m.dark, 0, 0.064, -0.69); for (const s of [-1, 1]) P(g, rb(0.003, 0.026, 0.02, 0.001), m.dark, s * 0.011, 0.064, -0.69, 0, 0, s * -0.25);
    P(g, rb(0.026, 0.02, 0.03, 0.003), m.dark, 0, 0.064, 0.07); ring(g, m, 0.007, 0.078, 0.07, 0.0025);
    P(g, rb(0.03, 0.018, 0.09, 0.003), m.steel, 0, -0.034, -0.02);
    const mag = P(g, rb(0.016, 0.03, 0.05, 0.002), m.brass, 0, 0.05, -0.04);
    guard(g, m, 0.062, -0.034, 0.022);
    return { mag, clip: true, muzzle: [0, 0.04, -0.725], sightY: 0.078, grip: [0, -0.062, 0.14], fore: [0, -0.016, -0.3], foreB: [-0.016, 0.021], eject: [0.03, 0.06, -0.04] };
  },
  rifle(g, m) {
    ex(g, [[-0.19, -0.012], [-0.19, 0.045], [0.085, 0.045], [0.095, 0.02], [0.09, -0.012], [0.03, -0.012], [0.01, -0.03], [-0.1, -0.03], [-0.1, -0.012]], 0.034, m.steel, 0, 0.004);
    P(g, rb(0.03, 0.02, 0.26, 0.009), m.dark, 0, 0.053, -0.05); for (let i = 0; i < 5; i++) P(g, rb(0.031, 0.004, 0.012, 0.001), m.steel, 0, 0.06, -0.14 + i * 0.04);
    P(g, rb(0.006, 0.014, 0.07, 0.002), m.dark, 0.017, 0.032, -0.06); P(g, cx(0.0045, 0.03, 8), m.worn, 0.03, 0.036, -0.02);
    P(g, cz(0.0095, 0.34), m.steel, 0, 0.034, -0.5);
    ex(g, [[-0.42, 0.006], [-0.42, 0.03], [-0.19, 0.034], [-0.19, -0.012], [-0.3, -0.012]], 0.04, m.woodEx, 0, 0.008);
    ex(g, [[-0.4, 0.04], [-0.4, 0.066], [-0.2, 0.068], [-0.2, 0.04]], 0.032, m.woodEx, 0, 0.007);
    P(g, cz(0.008, 0.12, 10), m.dark, 0, 0.058, -0.48); P(g, rb(0.016, 0.03, 0.022, 0.003), m.dark, 0, 0.05, -0.43);
    P(g, rb(0.012, 0.05, 0.016, 0.002), m.dark, 0, 0.064, -0.565); ring(g, m, 0.011, 0.092, -0.565); P(g, rb(0.003, 0.016, 0.004, 0.001), m.dark, 0, 0.088, -0.565);
    P(g, rb(0.02, 0.012, 0.05, 0.002), m.dark, 0, 0.068, -0.11); for (const s of [-1, 1]) P(g, rb(0.004, 0.016, 0.008, 0.001), m.dark, s * 0.007, 0.082, -0.09);
    P(g, cz(0.0125, 0.05, 12), m.dark, 0, 0.034, -0.685); for (const s of [-1, 1]) P(g, rb(0.004, 0.006, 0.012, 0.001), m.steel, s * 0.012, 0.034, -0.69);
    const mag = new THREE.Group(); g.add(mag);
    ex(mag, [[-0.095, -0.028], [-0.04, -0.028], [-0.032, -0.08], [-0.012, -0.15], [0.02, -0.21], [-0.03, -0.235], [-0.07, -0.16], [-0.09, -0.08]], 0.024, m.worn, 0, 0.003);
    for (const [z, y, r] of [[-0.062, -0.06, 0.0], [-0.052, -0.11, 0.2], [-0.03, -0.165, 0.42]]) P(mag, rb(0.0255, 0.004, 0.05, 0.001), m.dark, 0, y, z, r);
    ex(g, [[0.035, -0.012], [0.07, -0.012], [0.1, -0.1], [0.064, -0.11]], 0.03, m.woodEx, 0, 0.007);
    guard(g, m, 0.012, -0.016);
    ex(g, [[0.09, 0.04], [0.14, 0.036], [0.4, 0.03], [0.405, -0.085], [0.2, -0.03], [0.095, -0.006]], 0.032, m.woodEx, 0, 0.008);
    P(g, rb(0.034, 0.118, 0.014, 0.004), m.dark, 0, -0.028, 0.408);
    for (const z of [-0.15, 0.06]) pin(g, m, 0.01, z, 0.037);
    return { mag, muzzle: [0, 0.034, -0.715], sightY: 0.0865, grip: [0, -0.06, 0.07], fore: [0, -0.005, -0.31], foreB: [-0.014, 0.021], eject: [0.03, 0.045, -0.05] };
  },
  sniper(g, m) {
    ex(g, [[-0.52, -0.006], [-0.52, 0.02], [-0.1, 0.024], [0.07, 0.02], [0.1, 0.004], [0.17, 0.02], [0.3, 0.036], [0.45, 0.03], [0.46, -0.09], [0.26, -0.05], [0.16, -0.045], [0.13, -0.075], [0.1, -0.07], [0.09, -0.03], [-0.03, -0.034], [-0.12, -0.024]], 0.042, m.woodEx, 0, 0.009);
    P(g, rb(0.042, 0.12, 0.014, 0.004), m.dark, 0, -0.03, 0.465);
    P(g, cz(0.017, 0.26, 18), m.steel, 0, 0.036, -0.03); P(g, cz(0.0105, 0.52, 14, 0.0085), m.steel, 0, 0.036, -0.42); P(g, cz(0.011, 0.02, 12), m.dark, 0, 0.036, -0.68);
    P(g, cx(0.005, 0.045, 8), m.worn, 0.035, 0.03, 0.06, 0, 0, -0.5); P(g, new THREE.SphereGeometry(0.0095, 10, 8), m.worn, 0.058, 0.02, 0.06);
    P(g, rb(0.026, 0.012, 0.07, 0.003), m.dark, 0, -0.04, -0.02);
    // scope
    P(g, cz(0.0135, 0.2, 18), m.dark, 0, 0.082, -0.04); P(g, cz(0.0135, 0.07, 18, 0.022), m.dark, 0, 0.082, -0.175); P(g, cz(0.022, 0.04, 18), m.dark, 0, 0.082, -0.23);
    P(g, cz(0.019, 0.06, 18, 0.0135), m.dark, 0, 0.082, 0.09); P(g, cz(0.019, 0.025, 18), m.dark, 0, 0.082, 0.13);
    P(g, cz(0.0195, 0.004, 18), m.glass, 0, 0.082, -0.249); P(g, cz(0.0165, 0.004, 18), m.glass, 0, 0.082, 0.1415);
    P(g, new THREE.CylinderGeometry(0.009, 0.009, 0.018, 12), m.dark, 0, 0.102, -0.04); P(g, cx(0.009, 0.018, 12), m.dark, 0.02, 0.082, -0.04);
    for (const z of [-0.11, 0.04]) { P(g, rb(0.014, 0.03, 0.016, 0.002), m.steel, 0, 0.06, z); ring(g, m, 0.0145, 0.082, z, 0.003); }
    guard(g, m, 0.062, -0.036, 0.022);
    return { mag: null, bolt: true, scope: true, muzzle: [0, 0.036, -0.7], sightY: 0.082, grip: [0, -0.058, 0.135], fore: [0, -0.02, -0.3], foreB: [-0.019, 0.022], eject: [0.03, 0.05, 0.0] };
  },
  lmg(g, m) {
    ex(g, [[-0.26, -0.02], [-0.26, 0.056], [0.11, 0.056], [0.12, 0.02], [0.11, -0.02]], 0.046, m.steel, 0, 0.005);
    P(g, rb(0.042, 0.016, 0.24, 0.006), m.dark, 0, 0.066, -0.1); P(g, cx(0.004, 0.05, 8), m.worn, 0, 0.066, 0.02);
    P(g, cz(0.0125, 0.46), m.steel, 0, 0.034, -0.49); for (let i = 0; i < 12; i++) P(g, cz(0.021, 0.005, 16), m.dark, 0, 0.034, -0.3 - i * 0.018);
    P(g, cz(0.0165, 0.06, 12, 0.022), m.dark, 0, 0.034, -0.735);
    P(g, cz(0.008, 0.22, 10), m.dark, 0, 0.012, -0.37); P(g, rb(0.018, 0.034, 0.024, 0.003), m.dark, 0, 0.022, -0.49);
    const mag = P(g, rb(0.07, 0.1, 0.13, 0.008), m.green, -0.012, -0.075, -0.12); P(mag, rb(0.072, 0.012, 0.132, 0.003), m.dark, 0, 0.046, 0); P(mag, rb(0.03, 0.012, 0.05, 0.003), m.brass, 0.014, 0.058, 0.0);
    for (const s of [-1, 1]) P(g, cz(0.0045, 0.3, 6), m.dark, s * 0.016, 0.004, -0.55);
    P(g, rb(0.01, 0.036, 0.012, 0.002), m.dark, 0, 0.066, -0.67); P(g, rb(0.003, 0.02, 0.004, 0.001), m.dark, 0, 0.092, -0.67); for (const s of [-1, 1]) P(g, rb(0.003, 0.02, 0.014, 0.001), m.dark, s * 0.009, 0.09, -0.67);
    P(g, rb(0.022, 0.026, 0.02, 0.002), m.dark, 0, 0.086, 0.04); for (const s of [-1, 1]) P(g, rb(0.004, 0.012, 0.008, 0.001), m.dark, s * 0.007, 0.103, 0.04);
    P(g, new THREE.TorusGeometry(0.032, 0.0055, 6, 14, Math.PI), m.dark, 0.0, 0.074, -0.22, 0, Math.PI / 2, 0);
    ex(g, [[0.05, -0.02], [0.088, -0.02], [0.115, -0.115], [0.078, -0.122]], 0.032, m.woodEx, 0, 0.007);
    guard(g, m, 0.028, -0.024);
    ex(g, [[0.115, 0.05], [0.4, 0.04], [0.41, -0.08], [0.22, -0.03], [0.115, -0.01]], 0.036, m.woodEx, 0, 0.008); P(g, rb(0.038, 0.125, 0.014, 0.004), m.dark, 0, -0.02, 0.412);
    return { mag, muzzle: [0, 0.034, -0.775], sightY: 0.104, grip: [0, -0.068, 0.085], fore: [0, -0.012, -0.36], foreB: [0.003, 0.021], eject: [0.035, 0.03, -0.06] };
  },
  flamer(g, m) {
    ex(g, [[-0.17, -0.012], [-0.17, 0.05], [0.08, 0.05], [0.095, 0.025], [0.09, -0.012]], 0.042, m.steel, 0, 0.005);
    P(g, rb(0.03, 0.012, 0.2, 0.004), m.dark, 0, 0.056, -0.04);
    P(g, rb(0.016, 0.018, 0.012, 0.002), m.dark, 0, 0.066, 0.03); for (const s of [-1, 1]) P(g, rb(0.004, 0.012, 0.008, 0.001), m.dark, s * 0.006, 0.078, 0.03);
    P(g, cz(0.011, 0.42), m.steel, 0, 0.03, -0.38);
    P(g, cz(0.026, 0.22, 22), m.dark, 0, 0.03, -0.34); for (let i = 0; i < 6; i++) ring(g, m, 0.0268, 0.03, -0.25 - i * 0.034, 0.0028);
    P(g, cz(0.016, 0.05, 18, 0.021), m.worn, 0, 0.03, -0.575); P(g, cz(0.013, 0.004, 16), m.dark, 0, 0.03, -0.6015);
    P(g, rb(0.016, 0.018, 0.05, 0.003), m.brass, 0, 0.003, -0.55); P(g, cz(0.003, 0.09, 6), m.brass, 0, 0.0, -0.49);
    P(g, rb(0.004, 0.022, 0.006, 0.001), m.dark, 0, 0.066, -0.45); ring(g, m, 0.011, 0.072, -0.45);
    const tank = new THREE.Group(); g.add(tank); tank.position.set(0, -0.046, -0.12);
    P(tank, cz(0.04, 0.22, 26), m.green, 0, 0, 0);
    P(tank, new THREE.SphereGeometry(0.04, 22, 10, 0, 6.283, 0, Math.PI / 2).rotateX(-Math.PI / 2), m.green, 0, 0, -0.11);
    P(tank, new THREE.SphereGeometry(0.04, 22, 10, 0, 6.283, 0, Math.PI / 2).rotateX(Math.PI / 2), m.green, 0, 0, 0.11);
    for (const z of [-0.1, 0.1]) P(tank, cz(0.0412, 0.01, 26), m.worn, 0, 0, z);
    P(tank, new THREE.CylinderGeometry(0.007, 0.007, 0.03, 10), m.brass, 0.02, 0.04, -0.06); P(tank, new THREE.TorusGeometry(0.012, 0.0025, 6, 14), m.brass, 0.02, 0.056, -0.06, Math.PI / 2);
    P(g, new THREE.TorusGeometry(0.04, 0.0055, 8, 18, Math.PI), m.dark, 0.026, -0.02, -0.1, 0, Math.PI / 2, 0);
    ex(g, [[0.035, -0.012], [0.07, -0.012], [0.1, -0.1], [0.064, -0.11]], 0.03, m.woodEx, 0, 0.007);
    guard(g, m, 0.012, -0.016);
    ex(g, [[-0.322, 0.006], [-0.284, 0.006], [-0.29, -0.1], [-0.326, -0.1]], 0.03, m.woodEx, 0, 0.006);
    for (const y of [0.03, -0.006]) P(g, rb(0.01, 0.01, 0.22, 0.003), m.steel, 0, y, 0.2); P(g, rb(0.036, 0.1, 0.014, 0.004), m.dark, 0, 0.0, 0.31);
    const dial = new THREE.Group(); dial.position.set(0.023, 0.02, -0.06); dial.rotation.z = -Math.PI / 2; g.add(dial);
    P(dial, new THREE.CylinderGeometry(0.019, 0.019, 0.01, 22), m.brass, 0, 0, 0); P(dial, new THREE.CylinderGeometry(0.0155, 0.0155, 0.011, 22), m.glass, 0, 0.0005, 0);
    P(dial, rb(0.002, 0.0125, 0.0014, 0.0005), m.brass, 0.003, 0.0062, 0, 0, 0.6);
    for (const [y, z] of [[0.04, -0.15], [0.04, 0.06], [-0.002, -0.15], [-0.002, 0.06]]) P(g, new THREE.SphereGeometry(0.0035, 8, 6), m.worn, 0.0215, y, z);
    const pilot = new THREE.Sprite(new THREE.SpriteMaterial({ map: G.tex.glow, color: new THREE.Color(0.7, 1.1, 3.2), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    pilot.scale.setScalar(0.045); pilot.position.set(0, -0.004, -0.588); g.add(pilot);
    return { mag: tank, pilot, muzzle: [0, 0.03, -0.6], sightY: 0.076, grip: [0, -0.06, 0.07], fore: [0, -0.045, -0.304], foreMag: true, eject: null };
  },
  burst(g, m) {
    // squared modern receiver, polymer furniture, carry rail
    ex(g, [[-0.2, -0.012], [-0.2, 0.05], [0.09, 0.05], [0.1, 0.02], [0.095, -0.012]], 0.036, m.steel, 0, 0.004);
    P(g, rb(0.026, 0.014, 0.27, 0.003), m.dark, 0, 0.058, -0.06); for (let i = 0; i < 12; i++) P(g, rb(0.028, 0.005, 0.009, 0.001), m.dark, 0, 0.067, -0.18 + i * 0.022);
    P(g, rb(0.016, 0.03, 0.03, 0.003), m.dark, 0, 0.083, -0.15); ring(g, m, 0.009, 0.098, -0.15); P(g, rb(0.018, 0.024, 0.02, 0.003), m.dark, 0, 0.08, 0.04); for (const s of [-1, 1]) P(g, rb(0.004, 0.014, 0.01, 0.001), m.dark, s * 0.007, 0.094, 0.04);
    ex(g, [[-0.43, -0.006], [-0.43, 0.046], [-0.2, 0.05], [-0.2, -0.016], [-0.35, -0.02]], 0.042, m.poly, 0, 0.008);
    for (let i = 0; i < 5; i++) for (const s of [-1, 1]) P(g, rb(0.003, 0.02, 0.018, 0.001), m.dark, s * 0.022, 0.02, -0.25 - i * 0.034);
    P(g, cz(0.009, 0.26), m.steel, 0, 0.032, -0.55); P(g, cz(0.015, 0.06, 12, 0.017), m.dark, 0, 0.032, -0.7); for (let i = 0; i < 4; i++) P(g, rb(0.022, 0.003, 0.008, 0.001), m.dark, 0, 0.032 + (i % 2 ? 0.012 : -0.012), -0.69 - i * 0.006);
    const mag = new THREE.Group(); g.add(mag);
    ex(mag, [[-0.09, -0.012], [-0.04, -0.012], [-0.03, -0.09], [-0.018, -0.16], [-0.06, -0.165], [-0.075, -0.09]], 0.024, m.poly, 0, 0.003);
    ex(g, [[0.035, -0.012], [0.07, -0.012], [0.1, -0.1], [0.064, -0.11]], 0.03, m.poly, 0, 0.007); guard(g, m, 0.012, -0.016);
    ex(g, [[0.095, 0.045], [0.13, 0.04], [0.37, 0.045], [0.38, -0.09], [0.32, -0.09], [0.24, -0.02], [0.095, -0.004]], 0.034, m.poly, 0, 0.007);
    P(g, rb(0.036, 0.13, 0.016, 0.004), m.dark, 0, -0.02, 0.385); P(g, rb(0.01, 0.02, 0.05, 0.002), m.worn, 0.02, 0.024, -0.02);
    return { mag, muzzle: [0, 0.032, -0.735], sightY: 0.1065, grip: [0, -0.06, 0.07], fore: [0, -0.005, -0.31], foreB: [-0.02, 0.022], eject: [0.03, 0.045, -0.05] };
  },
  autoshot(g, m) {
    ex(g, [[-0.16, -0.02], [-0.16, 0.055], [0.08, 0.055], [0.1, 0.03], [0.095, -0.02]], 0.044, m.steel, 0, 0.006);
    P(g, rb(0.03, 0.012, 0.22, 0.003), m.dark, 0, 0.064, -0.04); P(g, rb(0.006, 0.022, 0.05, 0.002), m.dark, 0.023, 0.03, -0.05);
    P(g, cz(0.0145, 0.4), m.steel, 0, 0.034, -0.36); P(g, cz(0.0185, 0.05, 14, 0.021), m.dark, 0, 0.034, -0.57); P(g, rb(0.012, 0.03, 0.012, 0.002), m.dark, 0, 0.056, -0.55);
    ex(g, [[-0.16, -0.025], [-0.16, 0.018], [-0.42, 0.016], [-0.43, -0.028]], 0.046, m.poly, 0, 0.008);
    const mag = new THREE.Group(); mag.position.set(0, -0.1, -0.08); g.add(mag);
    P(mag, cx(0.07, 0.06, 26), m.dark, 0, 0, 0); P(mag, cx(0.074, 0.012, 26), m.steel, 0.026, 0, 0); P(mag, cx(0.074, 0.012, 26), m.steel, -0.026, 0, 0); P(mag, cx(0.022, 0.064, 12), m.worn, 0, 0, 0);
    for (let i = 0; i < 10; i++) { const a = (i / 10) * 6.283; P(mag, rb(0.064, 0.004, 0.02, 0.001), m.steel, 0, Math.cos(a) * 0.062, Math.sin(a) * 0.062, a); }
    ex(g, [[0.04, -0.02], [0.075, -0.02], [0.105, -0.115], [0.068, -0.122]], 0.032, m.poly, 0, 0.007); guard(g, m, 0.018, -0.024);
    ex(g, [[0.095, 0.05], [0.4, 0.04], [0.41, -0.085], [0.22, -0.035], [0.095, -0.012]], 0.036, m.poly, 0, 0.008); P(g, rb(0.038, 0.12, 0.016, 0.004), m.dark, 0, -0.02, 0.412);
    return { mag, muzzle: [0, 0.034, -0.6], sightY: 0.073, grip: [0, -0.068, 0.078], fore: [0, -0.025, -0.3], foreB: [-0.025, 0.024], eject: [0.03, 0.04, -0.05] };
  },
  orage(g, m) {
    // the special: a copper-wound field generator with a glass storm core and three discharge prongs
    ex(g, [[-0.12, -0.02], [-0.12, 0.012], [-0.02, 0.05], [0.07, 0.06], [0.11, 0.03], [0.1, -0.02]], 0.05, m.dark, 0, 0.008);
    const core = P(g, cz(0.028, 0.2, 24), m.core, 0, 0.035, -0.22); P(g, cz(0.032, 0.012, 24), m.brass, 0, 0.035, -0.115); P(g, cz(0.032, 0.012, 24), m.brass, 0, 0.035, -0.325);
    for (let i = 0; i < 4; i++) { const r = P(g, rb(0.006, 0.07, 0.006, 0.002), m.steel, 0, 0.035, -0.22); r.rotation.z = (i / 4) * Math.PI; r.position.z = -0.22; r.geometry = r.geometry.clone().translate(0, 0.0, 0); r.position.x = Math.cos((i / 4) * 6.283) * 0.034; r.position.y = 0.035 + Math.sin((i / 4) * 6.283) * 0.034; r.rotation.set(Math.PI / 2, 0, 0); r.scale.set(1, 2.9, 1); }
    for (let i = 0; i < 14; i++) P(g, new THREE.TorusGeometry(0.03, 0.0035, 6, 18), m.copper, 0, 0.035, -0.12 - i * 0.0075 + (i > 6 ? -0.06 : 0));
    P(g, cz(0.022, 0.06, 18, 0.03), m.dark, 0, 0.035, -0.36);
    const tips = [];
    for (let i = 0; i < 3; i++) { const a = (i / 3) * 6.283 + Math.PI / 2, pr = P(g, cz(0.0045, 0.09, 8, 0.002), m.copper, Math.cos(a) * 0.02, 0.035 + Math.sin(a) * 0.02, -0.43); pr.rotation.set(-Math.sin(a) * 0.3, Math.cos(a) * 0.3, 0); tips.push(pr); }
    P(g, rb(0.016, 0.03, 0.04, 0.004), m.dark, 0, 0.08, 0.03); P(g, rb(0.028, 0.006, 0.05, 0.002), m.dark, 0, 0.096, 0.03); ring(g, m, 0.012, 0.115, 0.03); P(g, rb(0.004, 0.02, 0.006, 0.001), m.core, 0, 0.075, -0.4);
    P(g, cx(0.016, 0.02, 14), m.brass, 0.034, 0.02, -0.02); P(g, new THREE.CylinderGeometry(0.006, 0.006, 0.05, 8), m.copper, 0.034, 0.045, -0.02);
    ex(g, [[0.04, -0.02], [0.075, -0.02], [0.105, -0.115], [0.068, -0.122]], 0.032, m.woodEx, 0, 0.007); guard(g, m, 0.018, -0.024);
    ex(g, [[0.1, 0.05], [0.3, 0.04], [0.31, -0.06], [0.2, -0.03], [0.1, -0.012]], 0.036, m.dark, 0, 0.008);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: G.tex.glow, color: new THREE.Color(0.6, 1.4, 3.2), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    glow.scale.set(0.09, 0.09, 1); glow.position.set(0, 0.035, -0.47); g.add(glow);
    return { mag: core, coreGlow: glow, arcGun: true, muzzle: [0, 0.035, -0.48], sightY: 0.115, grip: [0, -0.068, 0.078], fore: [0, -0.02, -0.25], foreMag: true, eject: null };
  },
  crossbow(g, m) {
    ex(g, [[-0.4, -0.012], [-0.4, 0.03], [0.05, 0.035], [0.1, 0.0], [0.38, 0.012], [0.39, -0.085], [0.2, -0.04], [0.12, -0.03], [0.095, -0.075], [0.06, -0.07], [0.04, -0.02], [-0.3, -0.03]], 0.04, m.woodEx, 0, 0.008);
    P(g, rb(0.04, 0.11, 0.014, 0.004), m.dark, 0, -0.03, 0.393); P(g, rb(0.012, 0.006, 0.42, 0.002), m.dark, 0, 0.034, -0.18);
    // bow limbs: two arcs sweeping back from the front block, string between their tips
    P(g, rb(0.08, 0.04, 0.05, 0.008), m.steel, 0, 0.028, -0.38);
    const limb = new THREE.TorusGeometry(0.24, 0.007, 8, 24, 0.95).rotateX(Math.PI / 2);
    for (const s of [-1, 1]) { const l = P(g, limb, m.dark, 0, 0.03, -0.38 + 0.2, 0, 0, 0); l.rotation.set(0, s > 0 ? -1.05 : Math.PI + 1.05 - 0.95, 0); l.position.set(s * 0.0, 0.03, -0.2); }
    const string = new THREE.Mesh(new THREE.CylinderGeometry(0.0016, 0.0016, 0.42, 4).rotateZ(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xc9bfa5, roughness: 0.8 })); string.position.set(0, 0.034, -0.035); g.add(string);
    const bolt = new THREE.Group(); bolt.position.set(0, 0.042, -0.2); g.add(bolt);
    P(bolt, cz(0.0035, 0.34, 6), m.wood, 0, 0, 0); P(bolt, cz(0.0001, 0.035, 8, 0.008), m.steel, 0, 0, -0.185); for (const a of [0, 2.1, 4.2]) P(bolt, rb(0.0015, 0.016, 0.05, 0.0005), m.brass, Math.cos(a) * 0.006, Math.sin(a) * 0.006, 0.13, 0, 0, a);
    P(g, rb(0.016, 0.026, 0.05, 0.003), m.dark, 0, 0.065, 0.02); P(g, cz(0.012, 0.11, 14), m.dark, 0, 0.085, 0.0); P(g, cz(0.0115, 0.002, 14), m.glass, 0, 0.085, -0.0555);
    guard(g, m, 0.06, -0.03, 0.021);
    return { mag: bolt, crossbow: true, muzzle: [0, 0.042, -0.4], sightY: 0.085, grip: [0, -0.06, 0.12], fore: [0, -0.012, -0.22], foreB: [-0.012, 0.02], eject: null };
  },
  lever(g, m) {
    ex(g, [[-0.08, -0.012], [-0.08, 0.05], [0.07, 0.05], [0.09, 0.028], [0.085, -0.012]], 0.034, m.worn, 0, 0.005);
    P(g, cz(0.0105, 0.5), m.steel, 0, 0.036, -0.33); P(g, cz(0.0085, 0.44), m.dark, 0, 0.014, -0.3); P(g, cz(0.0115, 0.02, 10), m.worn, 0, 0.025, -0.53);
    ex(g, [[-0.36, -0.002], [-0.36, 0.026], [-0.08, 0.03], [-0.08, -0.012]], 0.036, m.woodEx, 0, 0.007);
    P(g, rb(0.003, 0.014, 0.006, 0.001), m.brass, 0, 0.052, -0.575); P(g, rb(0.016, 0.012, 0.012, 0.002), m.dark, 0, 0.056, -0.06); P(g, rb(0.004, 0.012, 0.004, 0.001), m.dark, 0, 0.066, -0.06);
    for (const s of [-1, 1]) P(g, cx(0.0035, 0.004, 8), m.brass, s * 0.017, 0.02, 0.02);
    const lever = new THREE.Group(); lever.position.set(0, -0.008, 0.03); g.add(lever);
    P(lever, new THREE.TorusGeometry(0.03, 0.0035, 6, 16, Math.PI * 1.25), m.worn, 0, -0.03, 0.035, 0, Math.PI / 2, Math.PI * 0.6); P(lever, rb(0.006, 0.006, 0.07, 0.002), m.worn, 0, -0.006, 0.0);
    ex(g, [[0.08, 0.044], [0.13, 0.035], [0.38, 0.018], [0.39, -0.09], [0.2, -0.045], [0.14, -0.04], [0.11, -0.07], [0.085, -0.03]], 0.034, m.woodEx, 0, 0.008);
    P(g, rb(0.036, 0.11, 0.014, 0.004), m.dark, 0, -0.035, 0.392);
    return { mag: null, lever, muzzle: [0, 0.036, -0.585], sightY: 0.067, grip: [0, -0.05, 0.12], fore: [0, -0.002, -0.28], foreB: [-0.012, 0.021], eject: [0.03, 0.05, -0.02] };
  },
  launcher(g, m) {
    P(g, cz(0.029, 0.3, 22), m.steel, 0, 0.034, -0.2); P(g, cz(0.031, 0.02, 22), m.dark, 0, 0.034, -0.345); P(g, cz(0.031, 0.03, 22), m.dark, 0, 0.034, -0.06); P(g, cz(0.0235, 0.004, 20), m.dark, 0, 0.034, -0.354);
    ex(g, [[-0.07, -0.012], [-0.07, 0.066], [0.07, 0.066], [0.09, 0.04], [0.09, -0.012]], 0.05, m.steel, 0, 0.006);
    P(g, rb(0.012, 0.01, 0.05, 0.002), m.dark, 0, 0.072, 0.03);
    ex(g, [[-0.3, -0.012], [-0.3, 0.004], [-0.09, 0.006], [-0.09, -0.03], [-0.25, -0.03]], 0.044, m.woodEx, 0, 0.008);
    ex(g, [[0.085, 0.04], [0.14, 0.034], [0.38, 0.022], [0.39, -0.09], [0.22, -0.045], [0.16, -0.04], [0.135, -0.085], [0.1, -0.08], [0.088, -0.014]], 0.036, m.woodEx, 0, 0.008);
    P(g, rb(0.038, 0.115, 0.014, 0.004), m.dark, 0, -0.034, 0.393);
    P(g, rb(0.03, 0.05, 0.004, 0.001), m.dark, 0, 0.095, -0.12); P(g, rb(0.022, 0.03, 0.006, 0.001), m.glass, 0, 0.098, -0.12); P(g, rb(0.004, 0.014, 0.004, 0.001), m.dark, 0, 0.078, -0.33);
    guard(g, m, 0.058, -0.016);
    const mag = P(g, cz(0.019, 0.07, 14), m.brass, 0, 0.034, 0.0); mag.visible = false;
    return { mag, shell: true, muzzle: [0, 0.034, -0.36], sightY: 0.098, grip: [0, -0.05, 0.118], fore: [0, -0.02, -0.2], foreB: [-0.032, 0.026], eject: null };
  },
};

export function buildGunModel(id, vm = false) {
  const m = gunMats(), g = new THREE.Group();
  g.userData = BUILD[id](g, m);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = !vm; o.receiveShadow = false; o.userData.base = o.material; } });
  return g;
}
// static display copy: one mesh per material instead of ~30 parts, no shadows (wall boards, supply crate)
export function flattenGun(g) {
  g.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(g.matrixWorld).invert(), by = new Map(), keep = [];
  g.traverse((o) => { if (o.isMesh) { const m = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld), geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); geo.applyMatrix4(m); for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv'].includes(k)) geo.deleteAttribute(k); if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2)); (by.get(o.material) || by.set(o.material, []).get(o.material)).push(geo); } else if (o.isSprite) keep.push(o); });
  const out = new THREE.Group(); out.userData = g.userData;
  for (const [mat, list] of by) { const m = new THREE.Mesh(mergeGeometries(list), mat); m.castShadow = false; m.receiveShadow = false; out.add(m); }
  for (const sp of keep) { const c = sp.clone(); c.position.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, sp.matrixWorld)); out.add(c); }
  return out;
}
export function skinGun(g, up) { const map = gunMats().upgrade; g.traverse((o) => { if (o.isMesh) o.material = up ? map.get(o.userData.base) || o.userData.base : o.userData.base; }); }
