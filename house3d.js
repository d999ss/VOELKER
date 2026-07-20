// ============================================================================
//  3986 Voelker Ct — Procedural Three.js Model
//  Built with the img2threejs approach: code-only, primitives + procedural
//  textures, no mesh extraction / photogrammetry. Reconstructed from the
//  architectural elevations (front / rear / left / right side) and the dusk
//  hero renders.  Factory returns a THREE.Group + sculptRuntime metadata.
//  1 unit = 1 foot.
// ============================================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ---------------------------------------------------------------------------
//  Procedural texture helpers (drawn to canvas → CanvasTexture)
// ---------------------------------------------------------------------------
function cvs(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function tex(canvas, rx = 1, ry = 1) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
// Board-and-batten / lap siding — near-black charcoal with subtle plank shading
function sidingTexture(vertical) {
  const c = cvs(256, 256), x = c.getContext('2d');
  x.fillStyle = '#1c1d21'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 256; i += 4) { // fine wood grain noise
    x.fillStyle = `rgba(${8 + Math.random() * 10 | 0},${8 + Math.random() * 10 | 0},${10 + Math.random() * 10 | 0},0.5)`;
    x.fillRect(0, i, 256, 2);
  }
  x.strokeStyle = 'rgba(0,0,0,0.55)'; x.lineWidth = 2;
  if (vertical) { for (let i = 0; i <= 256; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 256); x.stroke(); } }
  else { for (let i = 0; i <= 256; i += 22) { x.beginPath(); x.moveTo(0, i); x.lineTo(256, i); x.stroke(); x.strokeStyle = 'rgba(255,255,255,0.03)'; } }
  return c;
}
// River-rock cobble wainscot — rounded multi-tone stones
function stoneTexture() {
  const c = cvs(320, 200), x = c.getContext('2d');
  x.fillStyle = '#3a3630'; x.fillRect(0, 0, 320, 200);
  const tones = ['#8f8578', '#a39a88', '#726a5e', '#b8ad98', '#5f574c', '#948b7a', '#c2b7a0'];
  for (let i = 0; i < 260; i++) {
    const px = Math.random() * 320, py = Math.random() * 200;
    const r = 7 + Math.random() * 11;
    const g = x.createRadialGradient(px - r * 0.3, py - r * 0.3, 1, px, py, r);
    const base = tones[Math.random() * tones.length | 0];
    g.addColorStop(0, base); g.addColorStop(0.7, base); g.addColorStop(1, 'rgba(20,18,15,0.9)');
    x.fillStyle = g; x.beginPath(); x.ellipse(px, py, r, r * (0.7 + Math.random() * 0.3), Math.random() * 6, 0, 7); x.fill();
    x.strokeStyle = 'rgba(15,13,10,0.6)'; x.lineWidth = 1.5; x.stroke();
  }
  return c;
}
// Dark asphalt shingle roof — horizontal courses with tab shadows
function shingleTexture() {
  const c = cvs(256, 256), x = c.getContext('2d');
  x.fillStyle = '#1a1a1e'; x.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 256; row += 20) {
    for (let cx = 0; cx < 256; cx += 26) {
      const off = (row / 20) % 2 ? 13 : 0;
      const shade = 18 + Math.random() * 16 | 0;
      x.fillStyle = `rgb(${shade},${shade},${shade + 4})`;
      x.fillRect(cx + off, row, 25, 19);
      x.strokeStyle = 'rgba(0,0,0,0.6)'; x.lineWidth = 1; x.strokeRect(cx + off, row, 25, 19);
    }
  }
  return c;
}
// Warm wood garage door — vertical grain, warm brown
function woodTexture() {
  const c = cvs(128, 128), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 128, 0); g.addColorStop(0, '#5a3a22'); g.addColorStop(0.5, '#6e4a2c'); g.addColorStop(1, '#4d321e');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 128; i += 2) { x.strokeStyle = `rgba(30,18,8,${0.15 + Math.random() * 0.2})`; x.beginPath(); x.moveTo(i, 0); x.lineTo(i + (Math.random() * 4 - 2), 128); x.stroke(); }
  return c;
}
// Dusk sky gradient (deep indigo → mauve → warm horizon)
function skyTexture() {
  const c = cvs(16, 512), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0.00, '#0b1024'); g.addColorStop(0.35, '#23284a');
  g.addColorStop(0.60, '#4a4368'); g.addColorStop(0.78, '#8a6a72'); g.addColorStop(0.90, '#c98d6e'); g.addColorStop(1.0, '#e3a878');
  x.fillStyle = g; x.fillRect(0, 0, 16, 512);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ---------------------------------------------------------------------------
//  Materials
// ---------------------------------------------------------------------------
const MAT = {
  sidingH: new THREE.MeshStandardMaterial({ map: tex(sidingTexture(false), 3, 3), roughness: 0.92, metalness: 0.0 }),
  sidingV: new THREE.MeshStandardMaterial({ map: tex(sidingTexture(true), 2, 2), roughness: 0.92, metalness: 0.0 }),
  stone: new THREE.MeshStandardMaterial({ map: tex(stoneTexture(), 2, 1), roughness: 1.0, metalness: 0.0 }),
  roof: new THREE.MeshStandardMaterial({ map: tex(shingleTexture(), 4, 4), roughness: 0.95, metalness: 0.0, side: THREE.DoubleSide }),
  wood: new THREE.MeshStandardMaterial({ map: tex(woodTexture(), 1, 1), roughness: 0.6, metalness: 0.05 }),
  timber: new THREE.MeshStandardMaterial({ color: 0x3b2a1c, roughness: 0.7 }),
  frame: new THREE.MeshStandardMaterial({ color: 0x0e0e11, roughness: 0.5, metalness: 0.2 }),
  muntin: new THREE.MeshStandardMaterial({ color: 0xcabfa8, roughness: 0.6 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x14161c, emissive: 0xffb85c, emissiveIntensity: 0.62, roughness: 0.15, metalness: 0.4 }),
  door: new THREE.MeshStandardMaterial({ color: 0x14100c, roughness: 0.5 }),
  concrete: new THREE.MeshStandardMaterial({ color: 0x2f3138, roughness: 0.45, metalness: 0.0 }),
  lawn: new THREE.MeshStandardMaterial({ color: 0x1a2416, roughness: 1.0 }),
  trunk: new THREE.MeshStandardMaterial({ color: 0x241a12, roughness: 0.9 }),
  pine: new THREE.MeshStandardMaterial({ color: 0x14251a, roughness: 1.0 }),
  chairRed: new THREE.MeshStandardMaterial({ color: 0x7a1518, roughness: 0.6 }),
  fixture: new THREE.MeshStandardMaterial({ color: 0x0a0a0a, emissive: 0xffcf8a, emissiveIntensity: 1.4, roughness: 0.4 }),
  cap: new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.7 }),
};

// ---------------------------------------------------------------------------
//  Geometry helpers
// ---------------------------------------------------------------------------
function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
}
function triMesh(tris, mat) {
  const pos = [];
  for (const t of tris) for (const v of t) pos.push(v[0], v[1], v[2]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; return m;
}
// Hip roof, ridge along the longer horizontal axis; base at y=0.
function hipRoof(w, d, rise, oh, mat) {
  const W = w / 2 + oh, D = d / 2 + oh;
  const alongX = w >= d, RL = Math.abs(w - d) / 2;
  const e0 = [-W, 0, D], e1 = [W, 0, D], e2 = [W, 0, -D], e3 = [-W, 0, -D];
  let r0, r1, tris;
  if (alongX) { r0 = [-RL, rise, 0]; r1 = [RL, rise, 0]; }
  else { r0 = [0, rise, RL]; r1 = [0, rise, -RL]; }
  tris = [[e0, e1, r1], [e0, r1, r0], [e2, e3, r0], [e2, r0, r1], [e1, e2, r1], [e3, e0, r0]];
  return triMesh(tris, mat);
}
// Front gable roof, ridge along Z (gable triangles face ±Z); base at y=0.
function gableRoof(w, d, rise, oh, mat) {
  const W = w / 2 + oh, D = d / 2 + oh;
  const lf = [-W, 0, D], lb = [-W, 0, -D], rf = [W, 0, D], rb = [W, 0, -D];
  const tf = [0, rise, D], tb = [0, rise, -D];
  return triMesh([[lf, lb, tb], [lf, tb, tf], [rf, tf, tb], [rf, tb, rb]], mat);
}

// A double-hung / colonial window: black frame, warm glowing glass, grilles.
// Local outward normal = +Z. cols×rows muntin grid.
function windowUnit(w, h, cols, rows) {
  const g = new THREE.Group();
  g.add(box(w + 0.5, h + 0.5, 0.3, MAT.frame, 0, 0, -0.05));           // frame
  const glass = box(w, h, 0.12, MAT.glass, 0, 0, 0.08); g.add(glass);   // glowing pane
  const t = 0.07;
  for (let c = 1; c < cols; c++) g.add(box(t, h, 0.14, MAT.muntin, -w / 2 + c * w / cols, 0, 0.12));
  for (let r = 1; r < rows; r++) g.add(box(w, t, 0.14, MAT.muntin, 0, -h / 2 + r * h / rows, 0.12));
  return g;
}
function placeWindow(parent, unit, x, y, z, face) {
  unit.position.set(x, y, z);
  if (face === '-z') unit.rotation.y = Math.PI;
  else if (face === '+x') unit.rotation.y = Math.PI / 2;
  else if (face === '-x') unit.rotation.y = -Math.PI / 2;
  parent.add(unit);
}

// A small warm exterior fixture (glowing box + point light)
function fixture(parent, x, y, z, lights) {
  parent.add(box(0.4, 0.7, 0.3, MAT.fixture, x, y, z));
  if (lights) {
    const p = new THREE.PointLight(0xffc078, 6, 22, 2); p.position.set(x, y, z + 1); parent.add(p);
  }
}

function pineTree(x, z, scale) {
  const g = new THREE.Group();
  g.add(box(0.8 * scale, 3 * scale, 0.8 * scale, MAT.trunk, 0, 1.5 * scale, 0));
  for (let i = 0; i < 4; i++) {
    const r = (4.5 - i * 0.9) * scale, hgt = 4 * scale;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(r, hgt, 8), MAT.pine);
    cone.position.y = (3 + i * 2.6) * scale; cone.castShadow = true; g.add(cone);
  }
  g.position.set(x, 0, z); return g;
}
function adirondack(x, z, ry) {
  const g = new THREE.Group();
  g.add(box(1.8, 0.2, 1.8, MAT.chairRed, 0, 1.1, 0));       // seat
  g.add(box(1.8, 2.0, 0.15, MAT.chairRed, 0, 2.0, -0.8));   // back
  g.add(box(0.15, 1.1, 1.8, MAT.chairRed, -0.8, 0.55, 0));  // side
  g.add(box(0.15, 1.1, 1.8, MAT.chairRed, 0.8, 0.55, 0));
  g.position.set(x, 0, z); g.rotation.y = ry || 0; return g;
}

// ---------------------------------------------------------------------------
//  House factory — returns THREE.Group with sculptRuntime metadata
// ---------------------------------------------------------------------------
function createVoelkerHouse() {
  const house = new THREE.Group();
  const nodes = {};
  const F = 9.5;            // floor-to-floor height
  const H2 = F * 2;         // two-story wall height (19)

  // ---- MAIN BODY (two-story) ----------------------------------------------
  const mbW = 36, mbD = 30, mbFrontZ = mbD / 2;   // front face z = +15
  const main = box(mbW, H2, mbD, MAT.sidingH, 0, H2 / 2, 0); house.add(main); nodes.mainBody = main;
  // main hip roof
  const mRoof = hipRoof(mbW, mbD, 8, 1.5, MAT.roof); mRoof.position.y = H2; house.add(mRoof); nodes.mainRoof = mRoof;

  // ---- FRONT GABLE PROJECTION (dominant street gable) ---------------------
  const fgW = 16, fgD = 4, fgZ = mbFrontZ + fgD / 2;  // projects to z=17, front face z=19
  const fg = box(fgW, H2, fgD, MAT.sidingV, 0, H2 / 2, mbFrontZ + fgD / 2 - 0.01); house.add(fg); nodes.frontGable = fg;
  const fgRise = 10;
  const fgRoof = gableRoof(fgW, fgD, fgRise, 1.4, MAT.roof); fgRoof.position.set(0, H2, mbFrontZ + fgD / 2); house.add(fgRoof);
  // gable-end siding triangle (fills under the ridge, front face)
  const gzf = mbFrontZ + fgD;   // 19
  house.add(triMesh([[[-fgW / 2, H2, gzf], [fgW / 2, H2, gzf], [0, H2 + fgRise, gzf]]], MAT.sidingV));
  // Craftsman gable truss (collar tie + king post + braces), set within the
  // gable triangle just below the roof slopes — not poking above the ridge.
  const tieY = H2 + 2.4, tieW = fgW - 4;
  house.add(box(tieW, 0.7, 0.6, MAT.timber, 0, tieY, gzf + 0.25));                 // collar tie
  house.add(box(0.6, fgRise - 2.4, 0.6, MAT.timber, 0, tieY + (fgRise - 2.4) / 2, gzf + 0.25)); // king post
  const brace = (sx) => { const b = box(0.5, tieW * 0.62, 0.5, MAT.timber, sx * tieW * 0.26, tieY + (fgRise - 2.4) * 0.32, gzf + 0.25); b.rotation.z = sx * 0.72; house.add(b); };
  brace(1); brace(-1);
  // proud ridge-beam tail projecting from the peak
  house.add(box(0.6, 0.6, 2.4, MAT.timber, 0, H2 + fgRise - 0.5, gzf + 1.1));
  // rafter tails under the gable eaves
  for (const sx of [-1, 1]) for (let k = 0; k < 3; k++)
    house.add(box(0.4, 0.4, 1.6, MAT.timber, sx * (fgW / 2 + 0.6 - k * 0.4), H2 + 0.4 + k * 1.9, gzf - 0.2));

  // ---- GARAGE WING (front-left, hip roof, 3-car: 16' + 9') ----------------
  const gW = 27, gD = 22, gH = 10.5, gZc = mbFrontZ + gD / 2 - 6, gXc = -13;
  const garage = box(gW, gH, gD, MAT.sidingH, gXc, gH / 2, gZc); house.add(garage); nodes.garage = garage;
  const gRoof = hipRoof(gW, gD, 7, 1.6, MAT.roof); gRoof.position.set(gXc, gH, gZc); house.add(gRoof);
  const gFrontZ = gZc + gD / 2;   // garage door face
  // garage stone wainscot base + side skirts
  house.add(box(gW + 0.3, 3.6, gD + 0.3, MAT.stone, gXc, 1.8, gZc));
  // two wood doors (16' double @ left, 9' single @ right)
  const doorY = 4.6;
  house.add(box(15, 7.4, 0.4, MAT.wood, gXc - 5.5, doorY, gFrontZ + 0.05));
  house.add(box(8, 7.4, 0.4, MAT.wood, gXc + 7.5, doorY, gFrontZ + 0.05));
  // door panel grid lines + top light row
  for (const [dx, dw] of [[gXc - 5.5, 15], [gXc + 7.5, 8]]) {
    for (let r = 0; r < 4; r++) house.add(box(dw - 0.6, 0.12, 0.1, MAT.timber, dx, 1.6 + r * 1.7, gFrontZ + 0.28));
    // glowing transom lights across the top
    const cols = dw > 12 ? 5 : 3;
    for (let c = 0; c < cols; c++) house.add(box(dw / cols - 0.5, 0.9, 0.1, MAT.glass, dx - dw / 2 + (c + 0.5) * dw / cols, 7.4, gFrontZ + 0.26));
  }
  fixture(house, gXc - 13.2, 7.2, gFrontZ + 0.4, true);
  fixture(house, gXc + 12.4, 7.2, gFrontZ + 0.4, true);

  // ---- CHIMNEY CHASE (right side) -----------------------------------------
  const chim = box(5, H2 + 12, 5.5, MAT.sidingV, mbW / 2 - 1, (H2 + 12) / 2, 2); house.add(chim); nodes.chimney = chim;
  house.add(box(5.2, 6, 5.7, MAT.stone, mbW / 2 - 1, 3, 2));              // stone base
  house.add(box(5.6, 1.2, 6.1, MAT.cap, mbW / 2 - 1, H2 + 12, 2));       // cap
  house.add(box(1.2, 1.6, 1.2, MAT.cap, mbW / 2 - 1, H2 + 13, 2));       // flue

  // ---- STONE WAINSCOT on main-floor front bays ----------------------------
  house.add(box(13, 3.6, 0.4, MAT.stone, 11, 1.8, mbFrontZ + 0.2));      // under right bay window
  house.add(box(mbW, 2.4, 0.35, MAT.stone, 0, 1.2, mbFrontZ + 0.18));    // continuous water table

  // ---- ENTRY PORCH (recessed, timber posts, stone steps, address) ---------
  const ez = mbFrontZ + 0.05;
  house.add(box(6, 0.5, 4, MAT.stone, 3, 0.25, ez + 3));                 // stoop slab
  house.add(box(5, 0.4, 1, MAT.stone, 3, 0.5, ez + 4.6));               // step
  const door = box(3.4, 6.8, 0.3, MAT.door, 3, 3.4, ez + 0.1); house.add(door); nodes.frontDoor = door;
  house.add(box(3.4, 6.8, 0.3, MAT.frame, 3, 3.4, ez)); // door frame behind
  placeWindow(house, windowUnit(2.6, 1.4, 3, 1), 3, 7.6, ez + 0.12, '+z'); // transom
  // porch posts + shed roof
  house.add(box(0.7, 8.5, 0.7, MAT.timber, 0.6, 4.25, ez + 4.6));
  house.add(box(0.7, 8.5, 0.7, MAT.timber, 5.4, 4.25, ez + 4.6));
  house.add(box(8, 0.4, 5.5, MAT.roof, 3, 8.6, ez + 2.6));
  // address plaque "3986"
  const ac = cvs(256, 64), ax = ac.getContext('2d');
  ax.fillStyle = '#0c0c0e'; ax.fillRect(0, 0, 256, 64);
  ax.fillStyle = '#c9a24a'; ax.font = 'bold 40px Georgia'; ax.textAlign = 'center'; ax.fillText('3986', 128, 46);
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.75), new THREE.MeshStandardMaterial({ map: tex(ac, 1, 1), emissive: 0x2a2410, emissiveIntensity: 0.4, roughness: 0.6 }));
  plaque.position.set(6.6, 6, ez + 0.15); house.add(plaque);

  // ---- WINDOWS ------------------------------------------------------------
  // Front gable — three tall colonial windows (upper floor)
  for (const wx of [-4.6, 0, 4.6]) placeWindow(house, windowUnit(2.5, 5.4, 2, 4), wx, 13.4, gzf + 0.12, '+z');
  // Upper-left window over garage (main body front)
  placeWindow(house, windowUnit(4, 4.2, 2, 3), -13, 13.6, mbFrontZ + 0.12, '+z');
  // Upper-right window (main body front, right of gable)
  placeWindow(house, windowUnit(4, 4.2, 2, 3), 13, 13.6, mbFrontZ + 0.12, '+z');
  // Main-floor right picture/bay window (big, over stone)
  placeWindow(house, windowUnit(7.2, 5.4, 4, 3), 11, 5.4, mbFrontZ + 0.12, '+z');
  // Side windows (right & left elevations)
  placeWindow(house, windowUnit(3, 4, 2, 3), mbW / 2 + 0.12, 13.4, -6, '+x');
  placeWindow(house, windowUnit(3, 4, 2, 3), mbW / 2 + 0.12, 5, -9, '+x');
  placeWindow(house, windowUnit(3.4, 4, 2, 3), -mbW / 2 - 0.12, 13.4, -3, '-x');
  // Rear windows / slider
  placeWindow(house, windowUnit(8, 6, 4, 3), 4, 5, -mbD / 2 - 0.12, '-z');
  placeWindow(house, windowUnit(4.4, 4.2, 2, 3), -8, 13.4, -mbD / 2 - 0.12, '-z');
  placeWindow(house, windowUnit(4.4, 4.2, 2, 3), 8, 13.4, -mbD / 2 - 0.12, '-z');
  // Interior warm spill lights behind the big glass
  const spill1 = new THREE.PointLight(0xffb060, 22, 40, 2); spill1.position.set(11, 6, mbFrontZ - 3); house.add(spill1);
  const spill2 = new THREE.PointLight(0xffbb6a, 16, 34, 2); spill2.position.set(0, 14, gzf - 3); house.add(spill2);

  // ---- REAR DECK + HOT TUB + PERGOLA --------------------------------------
  const deck = new THREE.Group();
  deck.add(box(22, 1, 16, MAT.timber, 0, 0.5, 0));
  for (const [px, pz] of [[-9, -6], [9, -6], [-9, 6], [9, 6]]) deck.add(box(0.6, 8, 0.6, MAT.timber, px, 4, pz));
  deck.add(box(22, 0.5, 16, MAT.timber, 0, 8, 0)); // pergola top
  for (let i = -10; i <= 10; i += 2) deck.add(box(0.3, 0.3, 16, MAT.timber, i, 8.3, 0));
  const tub = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 2.4, 24), MAT.timber);
  tub.position.set(6, 1.7, -3); deck.add(tub);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.2, 24), new THREE.MeshStandardMaterial({ color: 0x1a4a5a, emissive: 0x2a6a7a, emissiveIntensity: 0.5, roughness: 0.1, metalness: 0.6 }));
  water.position.set(6, 2.85, -3); deck.add(water);
  deck.position.set(2, 1, -mbD / 2 - 8); house.add(deck); nodes.deck = deck;

  house.userData.sculptRuntime = {
    source: 'img2threejs procedural build — 3986 Voelker Ct',
    units: 'feet',
    nodes,
    materials: Object.keys(MAT),
    footprint: 'L-shaped: 2-story main body + front-left hip garage + front gable',
    metrics: { livingArea: 2601, beds: 4, baths: 3, garage: '3-car (16\'+9\')', built: 1998 },
  };
  return house;
}

// ---------------------------------------------------------------------------
//  Scene / renderer / controls  (lazy, one-time init)
// ---------------------------------------------------------------------------
let started = false;
const VIEWS = {
  iso: [46, 26, 56], front: [0, 12, 78], aerial: [34, 62, 62], rear: [4, 20, -74], corner: [-58, 22, 40],
};

function initScene(container) {
  if (started) return; started = true;
  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.18;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  scene.background = skyTexture();
  scene.fog = new THREE.Fog(0x2a2740, 90, 260);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 2000);
  camera.position.set(...VIEWS.iso);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.07;
  controls.target.set(0, 10, 0); controls.minDistance = 24; controls.maxDistance = 220;
  controls.maxPolarAngle = Math.PI * 0.495; controls.autoRotateSpeed = 0.6;

  // Lighting — dusk: cool ambient + soft warm key + last-light rim
  scene.add(new THREE.HemisphereLight(0x4a5e84, 0x101018, 0.85));
  scene.add(new THREE.AmbientLight(0x2a3050, 0.3));
  const key = new THREE.DirectionalLight(0xffdcae, 1.5);
  key.position.set(-46, 40, 46); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.camera.near = 1; key.shadow.camera.far = 260;
  key.shadow.camera.left = -80; key.shadow.camera.right = 80; key.shadow.camera.top = 80; key.shadow.camera.bottom = -80;
  key.shadow.bias = -0.0004; scene.add(key);
  const rim = new THREE.DirectionalLight(0x8a6aa0, 0.5); rim.position.set(40, 24, -50); scene.add(rim);

  // Ground + hardscape
  const ground = new THREE.Mesh(new THREE.CircleGeometry(300, 48), MAT.lawn);
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const drive = new THREE.Mesh(new THREE.PlaneGeometry(24, 46), MAT.concrete);
  drive.rotation.x = -Math.PI / 2; drive.position.set(-13, 0.02, 44); drive.receiveShadow = true; scene.add(drive);
  const walk = new THREE.Mesh(new THREE.PlaneGeometry(6, 22), MAT.concrete);
  walk.rotation.x = -Math.PI / 2; walk.position.set(3, 0.02, 27); walk.receiveShadow = true; scene.add(walk);

  // Distant mountain silhouettes
  for (let i = 0; i < 5; i++) {
    const mtn = new THREE.Mesh(new THREE.ConeGeometry(60 + i * 14, 44 + Math.random() * 30, 4), new THREE.MeshBasicMaterial({ color: 0x1a1c2e, fog: false }));
    mtn.position.set(-160 + i * 80, 12, -180 - Math.random() * 40); mtn.rotation.y = Math.random(); scene.add(mtn);
  }

  // House
  const house = createVoelkerHouse(); scene.add(house);

  // Landscape: pines + chairs + path lights
  [[-40, 34, 1.1], [42, 30, 1.2], [-46, -20, 1.3], [40, -30, 1.15], [-30, -46, 1.0], [30, 48, 0.9]]
    .forEach(([x, z, s]) => scene.add(pineTree(x, z, s)));
  scene.add(adirondack(12, 21, -0.3)); scene.add(adirondack(15.5, 21, 0.1));
  [[-25, 40], [-1, 30], [6, 34], [-25, 52]].forEach(([x, z]) => {
    const p = new THREE.PointLight(0xffb060, 5, 18, 2); p.position.set(x, 2.5, z); scene.add(p);
    scene.add(box(0.25, 2.5, 0.25, MAT.fixture, x, 1.25, z));
  });

  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize(); new ResizeObserver(resize).observe(container);

  (function loop() { requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); })();

  // expose camera presets + autorotate to the page UI
  window.__cam3D = (name) => {
    if (name === 'auto') { controls.autoRotate = !controls.autoRotate; return controls.autoRotate; }
    const v = VIEWS[name]; if (!v) return;
    camera.position.set(...v); controls.target.set(0, name === 'aerial' ? 12 : 10, 0);
  };
}

// Public entry point called by index.html when the 3D tab opens
window.__init3D = function () {
  const container = document.getElementById('td-canvas');
  if (!container) return;
  const loader = document.getElementById('td-load');
  try {
    initScene(container);
    if (loader) loader.style.display = 'none';
  } catch (e) {
    if (loader) loader.textContent = 'WebGL unavailable — ' + (e.message || e);
    console.error(e);
  }
};
