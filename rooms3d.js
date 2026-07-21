// ============================================================================
//  3986 Voelker Ct — All-White Room Models ("clay" massing studies)
//  img2threejs approach: code-only white primitives, studio lighting, one
//  orbitable white model per room. Reconstructed from the floor plans + photos.
//  1 unit = 1 foot.
// ============================================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const W  = new THREE.MeshStandardMaterial({ color: 0xededed, roughness: 0.96 });
const W2 = new THREE.MeshStandardMaterial({ color: 0xd6d6d6, roughness: 0.9 });   // depth/accent
const WF = new THREE.MeshStandardMaterial({ color: 0xe7e7e7, roughness: 1.0 });   // floor
const GL = new THREE.MeshStandardMaterial({ color: 0xdce8ef, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.26 });

function b(w, h, d, x, y, z, m) { const e = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m || W); e.position.set(x, y, z); e.castShadow = true; e.receiveShadow = true; return e; }
function cyl(r, h, x, y, z, m, s = 20) { const e = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, s), m || W); e.position.set(x, y, z); e.castShadow = true; e.receiveShadow = true; return e; }
function leg(g, top, w, d, x, z, h) { for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(b(0.18, h, 0.18, x + sx * (w / 2 - 0.2), h / 2, z + sz * (d / 2 - 0.2), W2)); }

// Room shell: floor + back(-z) + left(-x) walls, open front/right for viewing.
function shell(g, w, d, h) {
  g.add(b(w, 0.3, d, 0, -0.15, 0, WF));
  g.add(b(w, h, 0.35, 0, h / 2, -d / 2, W));
  g.add(b(0.35, h, d, -w / 2, h / 2, 0, W));
  g.add(b(w, 0.55, 0.12, 0, 0.28, -d / 2 + 0.25, W2));
  g.add(b(0.12, 0.55, d, -w / 2 + 0.25, 0.28, 0, W2));
  // window openings (recessed frames) on the two walls
  g.add(b(w * 0.5, 4, 0.15, w * 0.08, h * 0.5, -d / 2 + 0.28, GL));
  g.add(b(0.15, 4, d * 0.4, -w / 2 + 0.28, h * 0.5, d * 0.06, GL));
}

// ---- furniture kit ---------------------------------------------------------
function sofa(g, x, z, len, rot) {
  const s = new THREE.Group();
  s.add(b(2.8, 0.7, len, 0, 0.55, 0, W)); s.add(b(2.8, 1.4, 0.6, -1.1, 1.1, 0, W2));  // seat + back
  s.add(b(0.6, 1.0, len, 1.2, 0.9, 0, W)); s.add(b(0.6, 1.0, len, -1.2, 0.9, 0, W));    // arms
  for (let i = 0; i < Math.max(2, len / 2.4 | 0); i++) s.add(b(2.4, 0.35, len / (len / 2.4 | 0) - 0.2, 0, 0.95, -len / 2 + (i + 0.5) * (len / (len / 2.4 | 0)), W));
  s.position.set(x, 0, z); s.rotation.y = rot || 0; g.add(s);
}
function bed(g, x, z, w, l, rot) {
  const s = new THREE.Group();
  s.add(b(w, 0.9, l, 0, 0.45, 0, W2));                        // frame
  s.add(b(w - 0.4, 0.6, l - 0.4, 0, 1.1, 0, W));              // mattress
  s.add(b(w, 3, 0.5, 0, 1.5, -l / 2, W));                     // headboard
  for (const sx of [-1, 1]) s.add(b(w * 0.32, 0.4, l * 0.28, sx * w * 0.24, 1.55, -l * 0.28, W)); // pillows
  s.add(b(w + 0.3, 0.2, l * 0.4, 0, 1.15, l * 0.28, W2));     // throw
  s.position.set(x, 0, z); s.rotation.y = rot || 0; g.add(s);
}
function nightstand(g, x, z) { g.add(b(1.6, 1.8, 1.4, x, 0.9, z, W)); g.add(cyl(0.3, 0.9, x, 2.6, z, W)); }
function table(g, x, z, w, d) { const t = new THREE.Group(); t.add(b(w, 0.25, d, 0, 2.4, 0, W)); leg(t, null, w, d, 0, 0, 2.4); t.position.set(x, 0, z); g.add(t); }
function chair(g, x, z, rot) { const c = new THREE.Group(); c.add(b(1.5, 0.25, 1.5, 0, 1.5, 0, W)); c.add(b(1.5, 2, 0.2, 0, 2.5, -0.65, W)); leg(c, null, 1.5, 1.5, 0, 0, 1.5); c.position.set(x, 0, z); c.rotation.y = rot || 0; g.add(c); }
function stool(g, x, z) { g.add(cyl(0.7, 0.25, x, 2.6, z, W)); g.add(cyl(0.12, 2.5, x, 1.25, z, W2)); }
function toilet(g, x, z, rot) { const t = new THREE.Group(); t.add(b(1.3, 1.2, 1.7, 0, 0.6, 0.1, W)); t.add(cyl(0.7, 0.5, 0, 1.05, 0.35, W, 16)); t.add(b(1.5, 1.9, 0.6, 0, 1.1, -0.75, W)); t.position.set(x, 0, z); t.rotation.y = rot || 0; g.add(t); }
function vanity(g, x, z, len, rot) { const v = new THREE.Group(); v.add(b(2, 3, len, 0, 1.5, 0, W)); v.add(b(2.3, 0.35, len + 0.3, 0, 3.15, 0, W2)); const n = Math.max(1, Math.round(len / 4)); for (let i = 0; i < n; i++) { const zz = -len / 2 + (i + 0.5) * len / n; v.add(b(1.3, 0.18, 1.3, 0.1, 3.05, zz, W2)); v.add(b(0.15, 2.4, 1.6, 1.02, 6, zz, W)); } v.position.set(x, 0, z); v.rotation.y = rot || 0; g.add(v); }
function alcove(g, x, z, rot) { const a = new THREE.Group(); a.add(b(3, 1.8, 6, 0, 0.9, 0, W)); a.add(b(3, 5, 0.3, 0, 3.5, -3, W)); a.add(b(0.3, 7, 6, -1.5, 3.5, 0, W)); a.add(b(0.12, 6, 6, 1.4, 3, 0, GL)); a.add(cyl(0.4, 0.15, 0, 6.4, -2.3, W)); a.position.set(x, 0, z); a.rotation.y = rot || 0; g.add(a); }
function appliance(g, x, z) { g.add(b(2.6, 3.4, 2.6, x, 1.7, z, W)); const d = cyl(0.9, 0.2, x, 1.8, z + 1.35, W2, 18); d.rotation.x = Math.PI / 2; g.add(d); }
function railingRun(g, x, z, len, rot) { const r = new THREE.Group(); r.add(b(len, 0.3, 0.3, 0, 3.2, 0, W)); r.add(b(len, 0.3, 0.3, 0, 0.3, 0, W)); const n = Math.round(len / 0.9); for (let i = 0; i <= n; i++) r.add(b(0.12, 3, 0.12, -len / 2 + i * len / n, 1.6, 0, W2)); r.position.set(x, 0, z); r.rotation.y = rot || 0; g.add(r); }
function stairsUp(g, x, z, w, steps, rot) { const s = new THREE.Group(); for (let i = 0; i < steps; i++) s.add(b(w, 0.7, 1.2, 0, 0.35 + i * 0.75, i * 1.2, W)); s.position.set(x, 0, z); s.rotation.y = rot || 0; g.add(s); }

// ---- exterior white massing (reuses the house factory's proportions) -------
const RF = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.95, side: THREE.DoubleSide });
function triMeshW(tris, m) { const p = []; for (const t of tris) for (const v of t) p.push(v[0], v[1], v[2]); const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); gg.computeVertexNormals(); const me = new THREE.Mesh(gg, m); me.castShadow = true; me.receiveShadow = true; return me; }
function hipRoofW(w, d, rise, oh, m) { const Wd = w / 2 + oh, D = d / 2 + oh, aX = w >= d, RL = Math.abs(w - d) / 2; const e0 = [-Wd, 0, D], e1 = [Wd, 0, D], e2 = [Wd, 0, -D], e3 = [-Wd, 0, -D]; let r0, r1; if (aX) { r0 = [-RL, rise, 0]; r1 = [RL, rise, 0]; } else { r0 = [0, rise, RL]; r1 = [0, rise, -RL]; } return triMeshW([[e0, e1, r1], [e0, r1, r0], [e2, e3, r0], [e2, r0, r1], [e1, e2, r1], [e3, e0, r0]], m); }
function gableRoofW(w, d, rise, oh, m) { const Wd = w / 2 + oh, D = d / 2 + oh; const lf = [-Wd, 0, D], lb = [-Wd, 0, -D], rf = [Wd, 0, D], rb = [Wd, 0, -D], tf = [0, rise, D], tb = [0, rise, -D]; return triMeshW([[lf, lb, tb], [lf, tb, tf], [rf, tf, tb], [rf, tb, rb]], m); }
function buildExterior(g) {
  const H2 = 18;
  // MAIN BODY — the street-facing bar of the L (front faces +Z, at z = 12)
  g.add(b(26, H2, 28, 9, H2 / 2, -2, W));
  const mR = gableRoofW(26, 28, 8, 2.5, RF); mR.position.set(9, H2, -2); g.add(mR);
  g.add(triMeshW([[[-4, H2, 12], [22, H2, 12], [9, H2 + 8, 12]]], W));            // front gable
  g.add(triMeshW([[[-4, H2, -16], [22, H2, -16], [9, H2 + 8, -16]]], W));
  for (const sx of [-1, 1]) { const bb = b(0.6, Math.hypot(13, 8), 0.5, 9 + sx * 6.5, H2 + 4, 12.2, W2); bb.rotation.z = sx * Math.atan2(13, 8); g.add(bb); }
  g.add(b(4.5, H2 + 9, 5, 21, (H2 + 9) / 2, -4, W)); g.add(b(5, 1, 5.5, 21, H2 + 9, -4, W2)); // chimney
  // GARAGE WING — the forward leg of the L; DOORS FACE +X, i.e. 90° from the front
  g.add(b(22, 10.5, 38, -15, 5.25, 20, W));
  const gR = hipRoofW(22, 38, 6.5, 2.4, RF); gR.position.set(-15, 10.5, 20); g.add(gR);
  g.add(b(22.3, 3.6, 38.3, -15, 1.8, 20, W2));                                    // garage stone base
  const gx = -3.85;                                                               // court-facing (+X) face of the wing
  for (const dz of [15, 24.5, 34]) {                                             // three 1-car doors = 3-car
    const dw = 8;
    g.add(b(0.4, 7.6, dw, gx, 4.5, dz, W2));                                      // door slab
    for (let r = 0; r < 4; r++) g.add(b(0.06, 0.12, dw - 0.6, gx + 0.22, 1.6 + r * 1.6, dz, W));         // panel lines
    for (let c = 0; c < 2; c++) g.add(b(0.05, 0.8, dw / 2 - 0.7, gx + 0.2, 7.4, dz - dw / 2 + (c + 0.5) * dw / 2, GL)); // top lites
  }
  for (const pz of [19.75, 29.25]) g.add(b(0.7, 8, 1.6, -4, 4, pz, W2));         // stone piers between the three doors
  // ENTRY + windows on the house front (+Z at z = 12)
  g.add(b(14.3, 3.6, 0.6, 15, 1.8, 12.15, W2));                                   // great-room stone base
  g.add(b(3.4, 6.8, 0.3, 4, 3.4, 12.15, W2));                                     // front door
  const win = (x, y, z, w, h) => g.add(b(w, h, 0.25, x, y, z, GL));
  win(9, 13.2, 12.15, 9, 4.6); win(15, 6.6, 12.15, 8, 5.6); win(15, 12.6, 12.15, 4.5, 4);
}

// ---- rooms -----------------------------------------------------------------
const ROOMS = [
  { key: 'living', name: 'Living Room', w: 17, d: 18, h: 17, cam: [16, 12, 20],
    build(g) {
      // 2-story vaulted ceiling
      const s1 = b(13, 0.3, 20, 0, 0, 0, W); s1.position.set(-4.6, 15.5, 0); s1.rotation.z = 0.72; g.add(s1);
      const s2 = b(13, 0.3, 20, 0, 0, 0, W); s2.position.set(4.6, 15.5, 0); s2.rotation.z = -0.72; g.add(s2);
      // stone fireplace on back wall (white massing)
      g.add(b(5, 17, 1.2, 3, 8.5, -8.2, W2)); g.add(b(7, 0.6, 2, 3, 0.4, -7.4, W)); g.add(b(6, 0.5, 1.5, 3, 4.2, -7.5, W2)); // hearth + mantel
      g.add(b(3.4, 3, 0.6, 3, 2.6, -7.3, GL));                                   // firebox
      sofa(g, -4.5, 1, 8, Math.PI / 2);                                          // sofa facing in
      sofa(g, 3, 5.5, 6, Math.PI);                                               // second sofa
      g.add(b(4, 0.5, 2.2, -1, 1.1, 1, W)); leg(g, null, 4, 2.2, -1, 1, 1.0);    // low coffee table
      g.add(b(10, 0.06, 7, -1, 0.06, 1, W2));                                     // rug
    } },
  { key: 'kitchen', name: 'Kitchen', w: 15, d: 15, h: 10, cam: [14, 10, 17],
    build(g) {
      g.add(b(15, 0.3, 15, 0, 10, 0, W));                                         // flat ceiling
      // perimeter L counter (back + left)
      g.add(b(14, 3, 2.2, 0, 1.5, -6.4, W)); g.add(b(14.4, 0.35, 2.4, 0, 3.15, -6.4, W2));
      g.add(b(2.2, 3, 12, -6.4, 1.5, 0.5, W)); g.add(b(2.4, 0.35, 12.4, -6.4, 3.15, 0.5, W2));
      // upper cabinets
      g.add(b(14, 2.4, 1.4, 0, 8, -6.8, W)); g.add(b(1.4, 2.4, 8, -6.8, 8, -1, W));
      // range + fridge
      g.add(b(3, 3, 2.2, 1, 1.5, -6.4, W2)); g.add(b(3, 0.2, 2, 1, 3.15, -6.4, W));
      g.add(b(3, 6, 2.6, -6.2, 3, 5.5, W));                                       // fridge
      // island + stools
      g.add(b(4, 3, 8, 1.5, 1.5, 1.5, W)); g.add(b(5, 0.4, 9, 1.5, 3.2, 1.5, W2));
      stool(g, 4.6, -1); stool(g, 4.6, 1.5); stool(g, 4.6, 4);
    } },
  { key: 'dining', name: 'Dining Room', w: 14, d: 14, h: 10, cam: [13, 10, 16],
    build(g) {
      g.add(b(14, 0.3, 14, 0, 10, 0, W));
      table(g, 0, 0, 4, 8); g.add(b(4, 0.5, 8, 0, 2.4, 0, W));
      for (const z of [-2.5, 0, 2.5]) { chair(g, -3, z, Math.PI / 2); chair(g, 3, z, -Math.PI / 2); }
      g.add(cyl(1.2, 0.4, 0, 8.5, 0, W)); g.add(cyl(0.1, 1.5, 0, 7.5, 0, W2));    // pendant
      g.add(b(9, 0.06, 5, 0, 0.06, 0, W2));                                        // rug
    } },
  { key: 'master', name: 'Master Bedroom', w: 16, d: 18, h: 14, cam: [15, 11, 20],
    build(g) {
      const s1 = b(11, 0.3, 20, 0, 0, 0, W); s1.position.set(-4, 14 + 2, 0); s1.rotation.z = 0.5; g.add(s1);
      const s2 = b(11, 0.3, 20, 0, 0, 0, W); s2.position.set(4, 14 + 2, 0); s2.rotation.z = -0.5; g.add(s2);
      bed(g, 0, -1.5, 7, 8, 0);
      nightstand(g, -4.5, -4.5); nightstand(g, 4.5, -4.5);
      g.add(b(6, 1.5, 1.6, 0, 0.75, 3.5, W2));                                     // bench at foot
      g.add(b(5, 3.5, 1.6, -5, 1.75, 5.5, W));                                     // dresser
      g.add(b(11, 0.06, 8, 0, 0.06, -1, W2));                                      // rug
    } },
  { key: 'mbath', name: 'Master Bath', w: 14, d: 12, h: 10, cam: [13, 9, 15],
    build(g) {
      g.add(b(14, 0.3, 12, 0, 10, 0, W));
      // freestanding soaking tub
      const tub = new THREE.Group(); tub.add(cyl(2, 2, 0, 1.1, 0, W)); tub.add(cyl(1.6, 1.2, 0, 1.7, 0, W2)); tub.position.set(-4, 0, 3); g.add(tub);
      // glass shower (corner)
      g.add(b(4.5, 0.2, 4.5, -4.5, 0.1, -3.5, W2)); g.add(b(0.15, 7, 4.5, -2.3, 3.5, -3.5, GL)); g.add(b(4.5, 7, 0.15, -4.5, 3.5, -1.3, GL));
      g.add(cyl(0.15, 2, -6, 5, -5, W2));                                          // shower head arm
      // dual vanity on right wall
      g.add(b(2.4, 3, 9, 5.6, 1.5, 0, W)); g.add(b(2.6, 0.3, 9.4, 5.6, 3.15, 0, W2));
      for (const z of [-2.5, 2.5]) { g.add(b(1.4, 0.25, 1.4, 5.4, 3.0, z, W2)); g.add(b(2, 3, 0.2, 6.6, 6, z, W)); } // sinks + mirrors
      // toilet
      g.add(b(1.4, 1.4, 1.8, 4.5, 0.7, -4.5, W)); g.add(b(1.6, 2, 0.6, 4.5, 1.5, -5.2, W));
    } },
  { key: 'bed3', name: 'Bedroom 3', w: 13, d: 13, h: 9, cam: [12, 9, 15],
    build(g) {
      g.add(b(13, 0.3, 13, 0, 9, 0, W));
      bed(g, -1, -1, 6, 7.5, 0);
      nightstand(g, -4.6, -3.5);
      g.add(b(5.5, 8, 1.6, 4.5, 4, -4.5, W));                                      // closet (barn door)
      g.add(b(5.5, 8, 0.12, 4.5, 4, -3.6, W2)); g.add(cyl(0.1, 5.5, 2, 7, -3.5, W2));
      g.add(b(8, 0.06, 6, -1, 0.06, 0.5, W2));                                     // rug
    } },
  { key: 'office', name: 'Bedroom 4 / Office', w: 12, d: 12, h: 9, cam: [11, 9, 14],
    build(g) {
      g.add(b(12, 0.3, 12, 0, 9, 0, W));
      g.add(b(5, 0.25, 2.4, -2, 2.5, -4, W)); leg(g, null, 5, 2.4, -2, -4, 2.5);   // desk
      g.add(b(2.6, 0.2, 1.4, -2, 2.75, -3.8, W2)); g.add(b(2.4, 1.6, 0.15, -2, 3.7, -4.6, W)); // monitor
      const ch = new THREE.Group(); ch.add(b(1.6, 0.25, 1.6, 0, 1.6, 0, W)); ch.add(b(1.6, 2.2, 0.2, 0, 2.6, -0.7, W)); ch.add(cyl(0.15, 1.6, 0, 0.8, 0, W2)); ch.position.set(-2, 0, -2); g.add(ch);
      g.add(b(6, 7, 1.4, 4, 3.5, -4.5, W));                                        // bookshelf
      for (let i = 0; i < 4; i++) g.add(b(5.6, 0.15, 1.2, 4, 1.2 + i * 1.7, -4.4, W2));
    } },
  { key: 'bath3', name: 'Bath 3', w: 9, d: 9, h: 9, cam: [10, 8, 12],
    build(g) { g.add(b(9, 0.3, 9, 0, 9, 0, W)); alcove(g, -2.4, -2, 0); vanity(g, 3.5, 1.5, 4, -Math.PI / 2); toilet(g, 2.8, -3.4, -Math.PI / 2); } },
  { key: 'laundry', name: 'Laundry', w: 9, d: 8, h: 9, cam: [10, 8, 12],
    build(g) { g.add(b(9, 0.3, 8, 0, 9, 0, W)); appliance(g, -2.6, -2.4); appliance(g, 0.4, -2.4); g.add(b(9, 0.35, 2.4, 0, 3.6, -2.6, W2)); g.add(b(9, 2, 1.5, 0, 7.6, -2.9, W)); g.add(b(2.6, 3, 2.4, 3.2, 1.5, 1.5, W)); g.add(b(2.8, 0.3, 2.6, 3.2, 3.15, 1.5, W2)); } },
  { key: 'halfbath', name: 'Half Bath', w: 6, d: 7, h: 9, cam: [8, 7, 10],
    build(g) { g.add(b(6, 0.3, 7, 0, 9, 0, W)); vanity(g, -1.8, -2, 3, 0); toilet(g, 1.6, 1.8, Math.PI); } },
  { key: 'foyer', name: 'Entry / Foyer', w: 11, d: 13, h: 17, cam: [14, 12, 17],
    build(g) { const s1 = b(15, 0.3, 22, 0, 0, 0, W); s1.position.set(-2.6, 15.5, 0); s1.rotation.z = 0.72; g.add(s1); const s2 = b(15, 0.3, 22, 0, 0, 0, W); s2.position.set(6.6, 15.5, 0); s2.rotation.z = -0.72; g.add(s2);
      g.add(b(3.6, 7, 0.3, -3, 3.5, -6.3, W2));                                    // front door
      stairsUp(g, 4, -5.5, 4.5, 12, 0); railingRun(g, 1.4, 1, 9, 0);
      g.add(b(4, 0.25, 1.4, -3.5, 2.7, 4.5, W)); leg(g, null, 4, 1.4, -3.5, 4.5, 2.7); } },
  { key: 'closet', name: 'Master Closet', w: 10, d: 9, h: 9, cam: [11, 8, 12],
    build(g) { g.add(b(10, 0.3, 9, 0, 9, 0, W)); g.add(b(10, 7, 1.4, 0, 4, -3.8, W)); g.add(b(1.4, 7, 9, -4.3, 4, 0, W));
      for (let i = 0; i < 4; i++) { g.add(b(9.6, 0.15, 1.2, 0, 1.5 + i * 1.7, -3.7, W2)); g.add(b(1.2, 0.15, 8.6, -4.2, 1.5 + i * 1.7, 0, W2)); }
      g.add(b(3.5, 2.8, 5, 1.5, 1.4, 1, W)); g.add(b(3.7, 0.3, 5.2, 1.5, 3, 1, W2)); } },
  { key: 'bath2', name: 'Bath 2', w: 9, d: 9, h: 9, cam: [10, 8, 12],
    build(g) { g.add(b(9, 0.3, 9, 0, 9, 0, W)); alcove(g, -2.4, -2, 0); vanity(g, 3.5, 1.5, 4, -Math.PI / 2); toilet(g, 2.8, -3.4, -Math.PI / 2); } },
  { key: 'hall', name: 'Upper Hall', w: 14, d: 8, h: 9, cam: [15, 10, 15],
    build(g) { g.add(b(14, 0.3, 8, 0, 9, 0, W)); railingRun(g, 0, 2.6, 12, 0); g.add(b(3, 7, 1.2, -5, 3.5, -3.4, W)); } },
  { key: 'garage', name: 'Garage (3-Car)', w: 26, d: 20, h: 10.5, cam: [16, 12, 26], tgt: [0, 4, 2],
    build(g) { g.add(b(26, 0.3, 20, 0, 10.5, 0, W));
      for (const dx of [-8.5, 0, 8.5]) { g.add(b(7.5, 7.6, 0.4, dx, 4.4, 9.8, W2));
        for (let c = 0; c < 2; c++) g.add(b(7.5 / 2 - 0.6, 0.8, 0.06, dx - 7.5 / 2 + (c + 0.5) * 7.5 / 2, 7.3, 9.95, GL)); }
      for (const px of [-4.25, 4.25]) g.add(b(1.2, 8, 0.6, px, 4, 9.8, W));                   // piers between bays
      g.add(b(5.4, 3.4, 11, -8.5, 1.7, -1, W)); g.add(b(5.4, 3.4, 11, 0, 1.7, -1, W)); g.add(b(5.4, 3.4, 11, 8.5, 1.7, -1, W)); } },  // 3 cars
  { key: 'exterior', name: 'Exterior (House)', noShell: true, h: 30, cam: [52, 26, 62], tgt: [-4, 6, 22], build: buildExterior },
];

// ---------------------------------------------------------------------------
//  Scene
// ---------------------------------------------------------------------------
let started = false, current = null, scene, camera, controls, renderer;
function buildRoom(def) {
  if (current) { scene.remove(current); current.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  const g = new THREE.Group();
  if (!def.noShell) shell(g, def.w, def.d, def.h);
  def.build(g);
  g.position.y = 0; scene.add(g); current = g;
  camera.position.set(...def.cam);
  controls.target.set(...(def.tgt || [0, def.h * 0.35, 0])); controls.update();
}

function initScene(container) {
  if (started) return; started = true;
  const canvas = document.createElement('canvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(canvas);

  scene = new THREE.Scene();
  // soft studio backdrop
  const bg = document.createElement('canvas'); bg.width = 8; bg.height = 256;
  const bx = bg.getContext('2d'); const gr = bx.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#eef0f3'); gr.addColorStop(1, '#c9ccd2'); bx.fillStyle = gr; bx.fillRect(0, 0, 8, 256);
  scene.background = new THREE.CanvasTexture(bg);

  camera = new THREE.PerspectiveCamera(40, 1, 0.5, 1000);
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.minDistance = 8; controls.maxDistance = 180; controls.maxPolarAngle = Math.PI * 0.5;
  controls.autoRotateSpeed = 0.7;

  scene.add(new THREE.HemisphereLight(0xffffff, 0xc4c8ce, 1.15));
  const key = new THREE.DirectionalLight(0xffffff, 1.7);
  key.position.set(18, 26, 22); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.camera.near = 1; key.shadow.camera.far = 120;
  key.shadow.camera.left = -30; key.shadow.camera.right = 30; key.shadow.camera.top = 30; key.shadow.camera.bottom = -30;
  key.shadow.bias = -0.0004; scene.add(key);
  const fill = new THREE.DirectionalLight(0xdfe6ee, 0.6); fill.position.set(-20, 14, 10); scene.add(fill);
  const grd = new THREE.Mesh(new THREE.CircleGeometry(120, 40), new THREE.MeshStandardMaterial({ color: 0xdadde1, roughness: 1 }));
  grd.rotation.x = -Math.PI / 2; grd.position.y = -0.32; grd.receiveShadow = true; scene.add(grd);

  buildRoom(ROOMS[0]);

  function resize() { const w = container.clientWidth, h = container.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  resize(); new ResizeObserver(resize).observe(container);
  (function loop() { requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); })();

  window.__room = (key) => { if (key === 'auto') { controls.autoRotate = !controls.autoRotate; return controls.autoRotate; } const d = ROOMS.find(r => r.key === key); if (d) buildRoom(d); };
  window.__rooms = ROOMS.map(r => ({ key: r.key, name: r.name }));
}

window.__initRooms = function () {
  const c = document.getElementById('rm-canvas'); if (!c) return;
  const l = document.getElementById('rm-load');
  try { initScene(c); if (l) l.style.display = 'none'; }
  catch (e) { if (l) l.textContent = 'WebGL unavailable — ' + (e.message || e); console.error(e); }
};
