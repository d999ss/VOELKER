// ============================================================================
//  3986 Voelker Ct — Procedural Three.js Model
//  Built with the img2threejs approach: code-only, primitives + procedural
//  textures, no mesh extraction. Massing + palette reconstructed from the
//  listing photos: low projecting hip bay out front, broad craftsman gable
//  set back behind it, lower 2-story right wing with the great-room window,
//  garage tucked far-left, deep overhanging eaves. Daytime Park City setting.
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
function sidingTexture() {
  const c = cvs(256, 256), x = c.getContext('2d');
  x.fillStyle = '#807d75'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 256; i += 3) {
    x.fillStyle = `rgba(${118 + Math.random() * 22 | 0},${114 + Math.random() * 22 | 0},${104 + Math.random() * 22 | 0},0.28)`;
    x.fillRect(0, i, 256, 1.5);
  }
  for (let i = 0; i <= 256; i += 20) {
    x.strokeStyle = 'rgba(55,52,46,0.42)'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(0, i); x.lineTo(256, i); x.stroke();
    x.strokeStyle = 'rgba(200,196,186,0.18)'; x.lineWidth = 1; x.beginPath(); x.moveTo(0, i + 1.6); x.lineTo(256, i + 1.6); x.stroke();
  }
  return c;
}
function stoneTexture() {
  const c = cvs(320, 200), x = c.getContext('2d');
  x.fillStyle = '#8a8069'; x.fillRect(0, 0, 320, 200);
  const tones = ['#b7ab90', '#cabd9f', '#9c9078', '#d6cab0', '#8f8369', '#c0b498', '#e0d5ba', '#a89a7e'];
  for (let i = 0; i < 260; i++) {
    const px = Math.random() * 320, py = Math.random() * 200, r = 7 + Math.random() * 11;
    const g = x.createRadialGradient(px - r * 0.3, py - r * 0.3, 1, px, py, r);
    const base = tones[Math.random() * tones.length | 0];
    g.addColorStop(0, base); g.addColorStop(0.7, base); g.addColorStop(1, 'rgba(70,62,48,0.85)');
    x.fillStyle = g; x.beginPath(); x.ellipse(px, py, r, r * (0.7 + Math.random() * 0.3), Math.random() * 6, 0, 7); x.fill();
    x.strokeStyle = 'rgba(60,52,40,0.5)'; x.lineWidth = 1.5; x.stroke();
  }
  return c;
}
function shingleTexture() {
  const c = cvs(256, 256), x = c.getContext('2d');
  x.fillStyle = '#4c4c50'; x.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 256; row += 20) {
    for (let cx = 0; cx < 256; cx += 26) {
      const off = (row / 20) % 2 ? 13 : 0, s = 66 + Math.random() * 26 | 0;
      x.fillStyle = `rgb(${s},${s},${s + 4})`; x.fillRect(cx + off, row, 25, 19);
      x.strokeStyle = 'rgba(20,20,24,0.5)'; x.lineWidth = 1; x.strokeRect(cx + off, row, 25, 19);
    }
  }
  return c;
}
function doorTexture() {
  const c = cvs(128, 128), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 128, 0); g.addColorStop(0, '#75726a'); g.addColorStop(0.5, '#847f76'); g.addColorStop(1, '#6f6c64');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return c;
}
function skyTexture() {
  const c = cvs(16, 512), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0.0, '#3f7ad0'); g.addColorStop(0.45, '#7aa9e0'); g.addColorStop(0.75, '#b9d3ee'); g.addColorStop(1.0, '#dce8f2');
  x.fillStyle = g; x.fillRect(0, 0, 16, 512);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ---------------------------------------------------------------------------
//  Materials
// ---------------------------------------------------------------------------
const MAT = {
  siding: new THREE.MeshStandardMaterial({ map: tex(sidingTexture(), 3, 3), roughness: 0.9 }),
  sidingV: new THREE.MeshStandardMaterial({ map: tex(sidingTexture(), 2, 2.4), roughness: 0.9 }),
  stone: new THREE.MeshStandardMaterial({ map: tex(stoneTexture(), 2, 1), roughness: 1.0 }),
  roof: new THREE.MeshStandardMaterial({ map: tex(shingleTexture(), 4, 4), roughness: 0.92, side: THREE.DoubleSide }),
  garageDoor: new THREE.MeshStandardMaterial({ map: tex(doorTexture(), 1, 1), roughness: 0.65 }),
  timber: new THREE.MeshStandardMaterial({ color: 0x4a4038, roughness: 0.75 }),
  trim: new THREE.MeshStandardMaterial({ color: 0xcfc8b6, roughness: 0.6 }),
  muntin: new THREE.MeshStandardMaterial({ color: 0xe6e0d2, roughness: 0.6 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x9fb6c8, roughness: 0.12, metalness: 0.55 }),
  door: new THREE.MeshStandardMaterial({ color: 0x2b3a56, roughness: 0.5 }),
  concrete: new THREE.MeshStandardMaterial({ color: 0xb4b0a6, roughness: 0.7 }),
  lawn: new THREE.MeshStandardMaterial({ color: 0x8f9068, roughness: 1.0 }),
  aspenBark: new THREE.MeshStandardMaterial({ color: 0xd8d5c8, roughness: 0.9 }),
  twig: new THREE.MeshStandardMaterial({ color: 0x6b6152, roughness: 0.9 }),
  evergreen: new THREE.MeshStandardMaterial({ color: 0x2f4632, roughness: 1.0 }),
  cap: new THREE.MeshStandardMaterial({ color: 0x3a3a40, roughness: 0.8 }),
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
function hipRoof(w, d, rise, oh, mat) {
  const W = w / 2 + oh, D = d / 2 + oh, alongX = w >= d, RL = Math.abs(w - d) / 2;
  const e0 = [-W, 0, D], e1 = [W, 0, D], e2 = [W, 0, -D], e3 = [-W, 0, -D];
  let r0, r1;
  if (alongX) { r0 = [-RL, rise, 0]; r1 = [RL, rise, 0]; } else { r0 = [0, rise, RL]; r1 = [0, rise, -RL]; }
  return triMesh([[e0, e1, r1], [e0, r1, r0], [e2, e3, r0], [e2, r0, r1], [e1, e2, r1], [e3, e0, r0]], mat);
}
function gableRoof(w, d, rise, oh, mat) {
  const W = w / 2 + oh, D = d / 2 + oh;
  const lf = [-W, 0, D], lb = [-W, 0, -D], rf = [W, 0, D], rb = [W, 0, -D], tf = [0, rise, D], tb = [0, rise, -D];
  return triMesh([[lf, lb, tb], [lf, tb, tf], [rf, tf, tb], [rf, tb, rb]], mat);
}
function windowUnit(w, h, cols, rows) {
  const g = new THREE.Group();
  g.add(box(w + 0.6, h + 0.6, 0.3, MAT.trim, 0, 0, -0.05));
  g.add(box(w, h, 0.1, MAT.glass, 0, 0, 0.08));
  const t = 0.07;
  for (let c = 1; c < cols; c++) g.add(box(t, h, 0.13, MAT.muntin, -w / 2 + c * w / cols, 0, 0.12));
  for (let r = 1; r < rows; r++) g.add(box(w, t, 0.13, MAT.muntin, 0, -h / 2 + r * h / rows, 0.12));
  return g;
}
function placeWindow(parent, unit, x, y, z, face) {
  unit.position.set(x, y, z);
  if (face === '-z') unit.rotation.y = Math.PI;
  else if (face === '+x') unit.rotation.y = Math.PI / 2;
  else if (face === '-x') unit.rotation.y = -Math.PI / 2;
  parent.add(unit);
}
function aspenTree(x, z, h) {
  const g = new THREE.Group();
  g.add(box(0.5, h, 0.5, MAT.aspenBark, 0, h / 2, 0));
  for (let i = 0; i < 7; i++) {
    const b = box(0.14, 2 + Math.random() * 2.5, 0.14, MAT.twig, 0, h * (0.5 + i * 0.06), 0);
    b.rotation.z = (Math.random() - 0.5) * 1.6; b.rotation.x = (Math.random() - 0.5) * 1.6;
    b.position.x = (Math.random() - 0.5); g.add(b);
  }
  g.position.set(x, 0, z); return g;
}
function evergreen(x, z, s) {
  const g = new THREE.Group();
  g.add(box(0.7 * s, 3 * s, 0.7 * s, MAT.twig, 0, 1.5 * s, 0));
  for (let i = 0; i < 4; i++) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry((4.2 - i * 0.85) * s, 4 * s, 8), MAT.evergreen);
    cone.position.y = (3 + i * 2.5) * s; cone.castShadow = true; g.add(cone);
  }
  g.position.set(x, 0, z); return g;
}

// ---------------------------------------------------------------------------
//  House factory
// ---------------------------------------------------------------------------
function createVoelkerHouse() {
  const house = new THREE.Group();
  const nodes = {};
  const H2 = 18;                          // two-story wall height

  // cream fascia boards around an eave line — deep craftsman overhangs
  const eaves = (cx, cz, w, d, y, oh) => {
    const W = w + 2 * oh, D = d + 2 * oh, t = 0.55, e = 0.4;
    house.add(box(W, t, e, MAT.trim, cx, y, cz + D / 2));
    house.add(box(W, t, e, MAT.trim, cx, y, cz - D / 2));
    house.add(box(e, t, D, MAT.trim, cx - W / 2, y, cz));
    house.add(box(e, t, D, MAT.trim, cx + W / 2, y, cz));
  };

  // ---- MAIN BODY (2-story) with broad craftsman front gable, left-center ----
  const mbW = 24, mbD = 28, mbXc = -4, mbFrontZ = mbD / 2;   // front face z = 14
  house.add(nodes.mainBody = box(mbW, H2, mbD, MAT.siding, mbXc, H2 / 2, 0));
  const gRise = 8, gOh = 2.5;
  const mRoof = gableRoof(mbW, mbD, gRise, gOh, MAT.roof); mRoof.position.set(mbXc, H2, 0); house.add(mRoof);
  house.add(triMesh([[[mbXc - mbW / 2, H2, mbFrontZ], [mbXc + mbW / 2, H2, mbFrontZ], [mbXc, H2 + gRise, mbFrontZ]]], MAT.sidingV));
  house.add(triMesh([[[mbXc - mbW / 2, H2, -mbFrontZ], [mbXc + mbW / 2, H2, -mbFrontZ], [mbXc, H2 + gRise, -mbFrontZ]]], MAT.sidingV));
  // side eave fascia
  house.add(box(0.45, 0.55, mbD + 2 * gOh, MAT.trim, mbXc - mbW / 2 - gOh, H2, 0));
  house.add(box(0.45, 0.55, mbD + 2 * gOh, MAT.trim, mbXc + mbW / 2 + gOh, H2, 0));
  // bargeboards along the front gable rake + ridge tail + collar tie
  for (const sx of [-1, 1]) {
    const bb = box(0.55, Math.hypot(mbW / 2, gRise), 0.5, MAT.timber, mbXc + sx * mbW / 4, H2 + gRise / 2, mbFrontZ + 0.2);
    bb.rotation.z = sx * Math.atan2(mbW / 2, gRise); house.add(bb);
  }
  house.add(box(0.6, 0.6, 2.6, MAT.timber, mbXc, H2 + gRise - 0.4, mbFrontZ + 1.2));
  house.add(box(mbW * 0.46, 0.6, 0.55, MAT.timber, mbXc, H2 + 2.4, mbFrontZ + 0.2));
  for (const sx of [-1, 1]) { const br = box(0.5, 5, 0.5, MAT.timber, mbXc + sx * 3.2, H2 + 4.4, mbFrontZ + 0.2); br.rotation.z = sx * 0.7; house.add(br); }

  // ---- RIGHT WING (2-story, lower, roof hips down to the right) ----
  const rwW = 14, rwD = 26, rwXc = 13, rwH = 16, rwFrontZ = rwD / 2;   // front z = 13
  house.add(box(rwW, rwH, rwD, MAT.siding, rwXc, rwH / 2, 0));
  const rwRoof = hipRoof(rwW, rwD, 6, 2.2, MAT.roof); rwRoof.position.set(rwXc, rwH, 0); house.add(rwRoof);
  eaves(rwXc, 0, rwW, rwD, rwH, 2.2);
  house.add(box(rwW + 0.3, 3.6, 0.4, MAT.stone, rwXc, 1.8, rwFrontZ + 0.15));  // stone base

  // ---- LIVING-ROOM BAY (single-story, projecting out front, low hip roof) ----
  const lbW = 15, lbD = 9, lbXc = -7, lbH = 10, lbFrontZ = mbFrontZ + lbD;     // front z = 23
  house.add(box(lbW, lbH, lbD, MAT.siding, lbXc, lbH / 2, mbFrontZ + lbD / 2));
  const lbRoof = hipRoof(lbW, lbD + 2, 4.5, 2.4, MAT.roof); lbRoof.position.set(lbXc, lbH, mbFrontZ + lbD / 2); house.add(lbRoof);
  eaves(lbXc, mbFrontZ + lbD / 2, lbW, lbD + 2, lbH, 2.4);
  house.add(box(lbW + 0.3, 3.6, lbD + 0.3, MAT.stone, lbXc, 1.8, mbFrontZ + lbD / 2));

  // ---- GARAGE (far-left, single-story, doors face street, 3-car) ----
  const gaW = 22, gaD = 20, gaXc = -24, gaZc = 10, gaH = 10.5, gaFrontZ = gaZc + gaD / 2; // front z = 20
  house.add(nodes.garage = box(gaW, gaH, gaD, MAT.siding, gaXc, gaH / 2, gaZc));
  const gaRoof = hipRoof(gaW, gaD, 6, 2, MAT.roof); gaRoof.position.set(gaXc, gaH, gaZc); house.add(gaRoof);
  eaves(gaXc, gaZc, gaW, gaD, gaH, 2);
  house.add(box(gaW + 0.3, 3.4, gaD + 0.3, MAT.stone, gaXc, 1.7, gaZc));
  for (const [dx, dw] of [[-28, 13], [-16.5, 7]]) {
    house.add(box(dw + 0.7, 7.8, 0.28, MAT.trim, dx, 4.6, gaFrontZ + 0.02));    // door trim
    house.add(box(dw, 7.2, 0.4, MAT.garageDoor, dx, 4.4, gaFrontZ + 0.12));     // door
    for (let r = 1; r < 4; r++) house.add(box(dw - 0.5, 0.1, 0.06, MAT.timber, dx, 1.4 + r * 1.6, gaFrontZ + 0.33));
    const nc = dw > 10 ? 4 : 2;
    for (let c = 1; c < nc; c++) house.add(box(0.1, 6.8, 0.06, MAT.timber, dx - dw / 2 + c * dw / nc, 4.4, gaFrontZ + 0.33));
    for (let c = 0; c < nc; c++) house.add(box(dw / nc - 0.7, 0.7, 0.05, MAT.glass, dx - dw / 2 + (c + 0.5) * dw / nc, 7.2, gaFrontZ + 0.31)); // top lites
  }

  // ---- CHIMNEY (right) ----
  house.add(nodes.chimney = box(4.5, H2 + 9, 5, MAT.sidingV, 19, (H2 + 9) / 2, 1));
  house.add(box(5, 1.1, 5.5, MAT.cap, 19, H2 + 9, 1));

  // ---- ENTRY (recessed between bay and right wing) ----
  const ex = 3.5, ez = mbFrontZ + 0.05;
  house.add(box(6, 0.5, 4, MAT.stone, ex, 0.25, ez + 3));
  house.add(box(5, 0.4, 1, MAT.stone, ex, 0.5, ez + 4.4));
  house.add(nodes.frontDoor = box(3.4, 6.8, 0.3, MAT.door, ex, 3.4, ez + 0.1));
  house.add(box(3.9, 7.3, 0.25, MAT.trim, ex, 3.65, ez - 0.02));
  placeWindow(house, windowUnit(2.6, 1.3, 3, 1), ex, 7.7, ez + 0.12, '+z');
  house.add(box(0.6, 8.4, 0.6, MAT.timber, ex - 2.6, 4.2, ez + 4.3));
  house.add(box(0.6, 8.4, 0.6, MAT.timber, ex + 2.6, 4.2, ez + 4.3));
  const eRoof = gableRoof(7, 5, 3.2, 1, MAT.roof); eRoof.position.set(ex, 8.4, ez + 2.2); house.add(eRoof);
  const ac = cvs(256, 64), ax = ac.getContext('2d');
  ax.fillStyle = '#2b3a56'; ax.fillRect(0, 0, 256, 64);
  ax.fillStyle = '#e6e0d2'; ax.font = 'bold 40px Georgia'; ax.textAlign = 'center'; ax.fillText('3986', 128, 46);
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.75), new THREE.MeshStandardMaterial({ map: tex(ac, 1, 1), roughness: 0.6 }));
  plaque.position.set(ex + 3.4, 6, ez + 0.15); house.add(plaque);

  // ---- WINDOWS ----
  placeWindow(house, windowUnit(9, 4.6, 4, 2), mbXc, 13.2, mbFrontZ + 0.12, '+z');          // upper gable band
  placeWindow(house, windowUnit(10, 4.2, 4, 2), lbXc, 6.4, lbFrontZ + 0.12, '+z');          // living-room bay
  placeWindow(house, windowUnit(8, 5.6, 4, 3), rwXc, 6.6, rwFrontZ + 0.12, '+z');           // great room
  placeWindow(house, windowUnit(4.5, 4, 3, 3), rwXc, 12.6, rwFrontZ + 0.12, '+z');          // upper right
  placeWindow(house, windowUnit(3, 4, 2, 3), rwXc + rwW / 2 + 0.12, 6, -6, '+x');
  placeWindow(house, windowUnit(3, 4, 2, 3), mbXc - mbW / 2 - 0.12, 12.5, -2, '-x');
  placeWindow(house, windowUnit(8, 6, 4, 3), mbXc + 2, 5, -mbD / 2 - 0.12, '-z');
  placeWindow(house, windowUnit(4.4, 4.2, 2, 3), mbXc, 13, -mbD / 2 - 0.12, '-z');

  // ---- REAR DECK + HOT TUB + PERGOLA ----
  const deck = new THREE.Group();
  deck.add(box(22, 1, 16, MAT.timber, 0, 0.5, 0));
  for (const [px, pz] of [[-9, -6], [9, -6], [-9, 6], [9, 6]]) deck.add(box(0.6, 8, 0.6, MAT.timber, px, 4, pz));
  deck.add(box(22, 0.5, 16, MAT.timber, 0, 8, 0));
  for (let i = -10; i <= 10; i += 2) deck.add(box(0.3, 0.3, 16, MAT.timber, i, 8.3, 0));
  const tub = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 2.4, 24), MAT.timber); tub.position.set(6, 1.7, -3); deck.add(tub);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.2, 24), new THREE.MeshStandardMaterial({ color: 0x2a6a86, roughness: 0.1, metalness: 0.6 }));
  water.position.set(6, 2.85, -3); deck.add(water);
  deck.position.set(mbXc + 2, 1, -mbD / 2 - 8); house.add(nodes.deck = deck);

  house.userData.sculptRuntime = {
    source: 'img2threejs procedural build — 3986 Voelker Ct',
    units: 'feet', nodes, materials: Object.keys(MAT),
    footprint: 'front hip bay + set-back craftsman gable + lower 2-story right wing + far-left garage',
    metrics: { livingArea: 2601, beds: 4, baths: 3, garage: '3-car', built: 1998 },
  };
  return house;
}

// ---------------------------------------------------------------------------
//  Scene / renderer / controls (lazy, one-time init) — daytime
// ---------------------------------------------------------------------------
let started = false;
const VIEWS = { iso: [48, 26, 60], front: [-2, 12, 82], aerial: [30, 64, 64], rear: [0, 20, -74], corner: [-62, 22, 44] };

function initScene(container) {
  if (started) return; started = true;
  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  scene.background = skyTexture();
  scene.fog = new THREE.Fog(0xcadcec, 140, 360);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 2000);
  camera.position.set(...VIEWS.iso);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.07;
  controls.target.set(0, 9, 0); controls.minDistance = 26; controls.maxDistance = 240;
  controls.maxPolarAngle = Math.PI * 0.495; controls.autoRotateSpeed = 0.6;

  scene.add(new THREE.HemisphereLight(0xbcd6f2, 0x6b6350, 1.05));
  const sun = new THREE.DirectionalLight(0xfff4e2, 2.4);
  sun.position.set(-52, 56, 46); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.camera.near = 1; sun.shadow.camera.far = 280;
  sun.shadow.camera.left = -90; sun.shadow.camera.right = 90; sun.shadow.camera.top = 90; sun.shadow.camera.bottom = -90;
  sun.shadow.bias = -0.0004; scene.add(sun);
  const fill = new THREE.DirectionalLight(0x9db4d0, 0.45); fill.position.set(44, 24, -42); scene.add(fill);

  const ground = new THREE.Mesh(new THREE.CircleGeometry(320, 48), MAT.lawn);
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const drive = new THREE.Mesh(new THREE.PlaneGeometry(30, 50), MAT.concrete);
  drive.rotation.x = -Math.PI / 2; drive.position.set(-18, 0.02, 46); drive.receiveShadow = true; scene.add(drive);
  const walk = new THREE.Mesh(new THREE.PlaneGeometry(6, 24), MAT.concrete);
  walk.rotation.x = -Math.PI / 2; walk.position.set(3.5, 0.02, 30); walk.receiveShadow = true; scene.add(walk);

  for (let i = 0; i < 5; i++) {
    const mtn = new THREE.Mesh(new THREE.ConeGeometry(60 + i * 14, 40 + Math.random() * 26, 4), new THREE.MeshBasicMaterial({ color: 0x93a8c2, fog: false }));
    mtn.position.set(-160 + i * 80, 10, -200 - Math.random() * 40); mtn.rotation.y = Math.random(); scene.add(mtn);
  }

  scene.add(createVoelkerHouse());

  [[-46, 36, 34], [48, 30, 32], [-34, 48, 30], [34, 52, 28], [56, -6, 30], [-52, -4, 32]].forEach(([x, z, h]) => scene.add(aspenTree(x, z, h)));
  [[-52, -30, 1.3], [44, -34, 1.2], [-30, 54, 0.9]].forEach(([x, z, s]) => scene.add(evergreen(x, z, s)));

  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize(); new ResizeObserver(resize).observe(container);
  (function loop() { requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); })();

  window.__cam3D = (name) => {
    if (name === 'auto') { controls.autoRotate = !controls.autoRotate; return controls.autoRotate; }
    const v = VIEWS[name]; if (!v) return;
    camera.position.set(...v); controls.target.set(0, name === 'aerial' ? 11 : 9, 0);
  };
}

window.__init3D = function () {
  const container = document.getElementById('td-canvas');
  if (!container) return;
  const loader = document.getElementById('td-load');
  try { initScene(container); if (loader) loader.style.display = 'none'; }
  catch (e) { if (loader) loader.textContent = 'WebGL unavailable — ' + (e.message || e); console.error(e); }
};
