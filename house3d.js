// ============================================================================
//  3986 Voelker Ct — Procedural Three.js Model
//  Built with the img2threejs approach: code-only, primitives + procedural
//  textures, no mesh extraction. Reconstructed from the listing photos and
//  architectural elevations. Factory returns a THREE.Group + sculptRuntime.
//  Palette matched to the real house: warm grey-taupe lap siding, tan
//  ledgestone wainscot, greige garage doors, cream trim, navy door — daytime.
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
// Warm grey-taupe lap siding with soft horizontal shadow lines
function sidingTexture() {
  const c = cvs(256, 256), x = c.getContext('2d');
  x.fillStyle = '#807d75'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 256; i += 3) {
    x.fillStyle = `rgba(${118 + Math.random() * 22 | 0},${114 + Math.random() * 22 | 0},${104 + Math.random() * 22 | 0},0.28)`;
    x.fillRect(0, i, 256, 1.5);
  }
  for (let i = 0; i <= 256; i += 20) {           // lap board shadow lines
    x.strokeStyle = 'rgba(55,52,46,0.42)'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(0, i); x.lineTo(256, i); x.stroke();
    x.strokeStyle = 'rgba(200,196,186,0.18)'; x.lineWidth = 1; x.beginPath(); x.moveTo(0, i + 1.6); x.lineTo(256, i + 1.6); x.stroke();
  }
  return c;
}
// Tan / grey ledgestone wainscot
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
// Medium-grey asphalt shingle roof
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
// Greige painted garage door — subtle vertical shading
function doorTexture() {
  const c = cvs(128, 128), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 128, 0); g.addColorStop(0, '#75726a'); g.addColorStop(0.5, '#847f76'); g.addColorStop(1, '#6f6c64');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return c;
}
// Bright Park City daytime sky
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
  trim: new THREE.MeshStandardMaterial({ color: 0xcfc8b6, roughness: 0.6 }),           // cream window trim
  muntin: new THREE.MeshStandardMaterial({ color: 0xe6e0d2, roughness: 0.6 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x9fb6c8, roughness: 0.12, metalness: 0.55 }), // sky-reflecting
  door: new THREE.MeshStandardMaterial({ color: 0x2b3a56, roughness: 0.5 }),            // navy front door
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
  g.add(box(w + 0.6, h + 0.6, 0.3, MAT.trim, 0, 0, -0.05));   // cream frame
  g.add(box(w, h, 0.1, MAT.glass, 0, 0, 0.08));               // pane
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
  for (let i = 0; i < 7; i++) {                       // sparse bare branches
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
  const F = 9.5, H2 = F * 2;

  // ---- MAIN BODY (two-story) ----
  const mbW = 36, mbD = 30, mbFrontZ = mbD / 2;
  house.add(nodes.mainBody = box(mbW, H2, mbD, MAT.siding, 0, H2 / 2, 0));
  const mRoof = hipRoof(mbW, mbD, 8, 1.5, MAT.roof); mRoof.position.y = H2; house.add(mRoof);

  // ---- FRONT GABLE (dominant street gable with timber truss) ----
  const fgW = 16, fgD = 4, gzf = mbFrontZ + fgD;
  house.add(box(fgW, H2, fgD, MAT.sidingV, 0, H2 / 2, mbFrontZ + fgD / 2 - 0.01));
  const fgRise = 10;
  const fgRoof = gableRoof(fgW, fgD, fgRise, 1.4, MAT.roof); fgRoof.position.set(0, H2, mbFrontZ + fgD / 2); house.add(fgRoof);
  house.add(triMesh([[[-fgW / 2, H2, gzf], [fgW / 2, H2, gzf], [0, H2 + fgRise, gzf]]], MAT.sidingV));
  // craftsman gable truss
  const tieY = H2 + 2.4, tieW = fgW - 4;
  house.add(box(tieW, 0.7, 0.6, MAT.timber, 0, tieY, gzf + 0.25));
  house.add(box(0.6, fgRise - 2.4, 0.6, MAT.timber, 0, tieY + (fgRise - 2.4) / 2, gzf + 0.25));
  const brace = (sx) => { const b = box(0.5, tieW * 0.62, 0.5, MAT.timber, sx * tieW * 0.26, tieY + (fgRise - 2.4) * 0.32, gzf + 0.25); b.rotation.z = sx * 0.72; house.add(b); };
  brace(1); brace(-1);
  house.add(box(0.6, 0.6, 2.4, MAT.timber, 0, H2 + fgRise - 0.5, gzf + 1.1));
  for (const sx of [-1, 1]) for (let k = 0; k < 3; k++)
    house.add(box(0.4, 0.4, 1.6, MAT.timber, sx * (fgW / 2 + 0.6 - k * 0.4), H2 + 0.4 + k * 1.9, gzf - 0.2));

  // ---- GARAGE WING (front-left, hip roof, 3-car: double + single) ----
  const gW = 27, gD = 22, gH = 10.5, gZc = mbFrontZ + gD / 2 - 6, gXc = -13;
  house.add(nodes.garage = box(gW, gH, gD, MAT.siding, gXc, gH / 2, gZc));
  const gRoof = hipRoof(gW, gD, 7, 1.6, MAT.roof); gRoof.position.set(gXc, gH, gZc); house.add(gRoof);
  const gFrontZ = gZc + gD / 2;
  house.add(box(gW + 0.3, 3.4, gD + 0.3, MAT.stone, gXc, 1.7, gZc));       // stone base
  house.add(box(15, 7.4, 0.4, MAT.garageDoor, gXc - 5.5, 4.5, gFrontZ + 0.05));  // double door
  house.add(box(8, 7.4, 0.4, MAT.garageDoor, gXc + 7.5, 4.5, gFrontZ + 0.05));   // single door
  for (const [dx, dw] of [[gXc - 5.5, 15], [gXc + 7.5, 8]]) {
    for (let r = 0; r < 4; r++) house.add(box(dw - 0.6, 0.1, 0.08, MAT.timber, dx, 1.5 + r * 1.7, gFrontZ + 0.26));
    for (let cc = 1; cc < (dw > 12 ? 4 : 3); cc++) house.add(box(0.1, 7, 0.08, MAT.timber, dx - dw / 2 + cc * dw / (dw > 12 ? 4 : 3), 4.5, gFrontZ + 0.26));
    const cols = dw > 12 ? 4 : 3;                                          // top lite row (arched)
    for (let c = 0; c < cols; c++) house.add(box(dw / cols - 0.5, 0.8, 0.06, MAT.glass, dx - dw / 2 + (c + 0.5) * dw / cols, 7.3, gFrontZ + 0.24));
  }

  // ---- CHIMNEY CHASE (right side) ----
  house.add(nodes.chimney = box(5, H2 + 11, 5.5, MAT.sidingV, mbW / 2 - 1, (H2 + 11) / 2, 2));
  house.add(box(5.6, 1.2, 6.1, MAT.cap, mbW / 2 - 1, H2 + 11, 2));

  // ---- STONE WAINSCOT on main-floor front ----
  house.add(box(13, 3.4, 0.4, MAT.stone, 11, 1.7, mbFrontZ + 0.2));
  house.add(box(mbW, 2.2, 0.35, MAT.stone, 0, 1.1, mbFrontZ + 0.18));

  // ---- ENTRY (recessed, navy door, stone steps, address) ----
  const ez = mbFrontZ + 0.05;
  house.add(box(6, 0.5, 4, MAT.stone, 3, 0.25, ez + 3));
  house.add(box(5, 0.4, 1, MAT.stone, 3, 0.5, ez + 4.6));
  house.add(nodes.frontDoor = box(3.4, 6.8, 0.3, MAT.door, 3, 3.4, ez + 0.1));
  house.add(box(3.9, 7.3, 0.25, MAT.trim, 3, 3.65, ez - 0.02));            // door trim
  placeWindow(house, windowUnit(2.6, 1.3, 3, 1), 3, 7.7, ez + 0.12, '+z');
  house.add(box(0.6, 8.5, 0.6, MAT.timber, 0.4, 4.25, ez + 4.6));
  house.add(box(0.6, 8.5, 0.6, MAT.timber, 5.6, 4.25, ez + 4.6));
  house.add(box(8, 0.4, 5.5, MAT.roof, 3, 8.6, ez + 2.6));
  const ac = cvs(256, 64), ax = ac.getContext('2d');
  ax.fillStyle = '#2b3a56'; ax.fillRect(0, 0, 256, 64);
  ax.fillStyle = '#e6e0d2'; ax.font = 'bold 40px Georgia'; ax.textAlign = 'center'; ax.fillText('3986', 128, 46);
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.75), new THREE.MeshStandardMaterial({ map: tex(ac, 1, 1), roughness: 0.6 }));
  plaque.position.set(6.7, 6, ez + 0.15); house.add(plaque);

  // ---- WINDOWS ----
  for (const wx of [-4.6, 0, 4.6]) placeWindow(house, windowUnit(2.5, 5.2, 2, 4), wx, 13.4, gzf + 0.12, '+z');
  placeWindow(house, windowUnit(4, 4.2, 2, 3), -13, 13.6, mbFrontZ + 0.12, '+z');
  placeWindow(house, windowUnit(4, 4.2, 2, 3), 13, 13.6, mbFrontZ + 0.12, '+z');
  placeWindow(house, windowUnit(7.4, 5.4, 4, 3), 11, 5.6, mbFrontZ + 0.12, '+z');   // great-room window
  placeWindow(house, windowUnit(3, 4, 2, 3), mbW / 2 + 0.12, 13.4, -6, '+x');
  placeWindow(house, windowUnit(3, 4, 2, 3), mbW / 2 + 0.12, 5, -9, '+x');
  placeWindow(house, windowUnit(3.4, 4, 2, 3), -mbW / 2 - 0.12, 13.4, -3, '-x');
  placeWindow(house, windowUnit(8, 6, 4, 3), 4, 5, -mbD / 2 - 0.12, '-z');
  placeWindow(house, windowUnit(4.4, 4.2, 2, 3), -8, 13.4, -mbD / 2 - 0.12, '-z');
  placeWindow(house, windowUnit(4.4, 4.2, 2, 3), 8, 13.4, -mbD / 2 - 0.12, '-z');

  // ---- REAR DECK + HOT TUB + PERGOLA ----
  const deck = new THREE.Group();
  deck.add(box(22, 1, 16, MAT.timber, 0, 0.5, 0));
  for (const [px, pz] of [[-9, -6], [9, -6], [-9, 6], [9, 6]]) deck.add(box(0.6, 8, 0.6, MAT.timber, px, 4, pz));
  deck.add(box(22, 0.5, 16, MAT.timber, 0, 8, 0));
  for (let i = -10; i <= 10; i += 2) deck.add(box(0.3, 0.3, 16, MAT.timber, i, 8.3, 0));
  const tub = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 2.4, 24), MAT.timber); tub.position.set(6, 1.7, -3); deck.add(tub);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.2, 24), new THREE.MeshStandardMaterial({ color: 0x2a6a86, roughness: 0.1, metalness: 0.6 }));
  water.position.set(6, 2.85, -3); deck.add(water);
  deck.position.set(2, 1, -mbD / 2 - 8); house.add(nodes.deck = deck);

  house.userData.sculptRuntime = {
    source: 'img2threejs procedural build — 3986 Voelker Ct',
    units: 'feet', nodes, materials: Object.keys(MAT),
    footprint: 'L-shaped: 2-story main body + front-left hip garage + front gable',
    metrics: { livingArea: 2601, beds: 4, baths: 3, garage: '3-car', built: 1998 },
  };
  return house;
}

// ---------------------------------------------------------------------------
//  Scene / renderer / controls (lazy, one-time init) — daytime
// ---------------------------------------------------------------------------
let started = false;
const VIEWS = { iso: [46, 26, 56], front: [0, 12, 78], aerial: [34, 62, 62], rear: [4, 20, -74], corner: [-58, 22, 40] };

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
  scene.fog = new THREE.Fog(0xcadcec, 130, 340);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 2000);
  camera.position.set(...VIEWS.iso);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.07;
  controls.target.set(0, 10, 0); controls.minDistance = 24; controls.maxDistance = 220;
  controls.maxPolarAngle = Math.PI * 0.495; controls.autoRotateSpeed = 0.6;

  // Daytime lighting
  scene.add(new THREE.HemisphereLight(0xbcd6f2, 0x6b6350, 1.05));
  const sun = new THREE.DirectionalLight(0xfff4e2, 2.4);
  sun.position.set(-50, 55, 42); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.camera.near = 1; sun.shadow.camera.far = 260;
  sun.shadow.camera.left = -80; sun.shadow.camera.right = 80; sun.shadow.camera.top = 80; sun.shadow.camera.bottom = -80;
  sun.shadow.bias = -0.0004; scene.add(sun);
  const fill = new THREE.DirectionalLight(0x9db4d0, 0.45); fill.position.set(40, 24, -40); scene.add(fill);

  // Ground + hardscape
  const ground = new THREE.Mesh(new THREE.CircleGeometry(300, 48), MAT.lawn);
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const drive = new THREE.Mesh(new THREE.PlaneGeometry(24, 46), MAT.concrete);
  drive.rotation.x = -Math.PI / 2; drive.position.set(-8, 0.02, 44); drive.receiveShadow = true; scene.add(drive);
  const walk = new THREE.Mesh(new THREE.PlaneGeometry(6, 22), MAT.concrete);
  walk.rotation.x = -Math.PI / 2; walk.position.set(3, 0.02, 27); walk.receiveShadow = true; scene.add(walk);

  // Distant mountains (soft, hazy blue)
  for (let i = 0; i < 5; i++) {
    const mtn = new THREE.Mesh(new THREE.ConeGeometry(60 + i * 14, 40 + Math.random() * 26, 4), new THREE.MeshBasicMaterial({ color: 0x93a8c2, fog: false }));
    mtn.position.set(-160 + i * 80, 10, -190 - Math.random() * 40); mtn.rotation.y = Math.random(); scene.add(mtn);
  }

  scene.add(createVoelkerHouse());

  // Bare aspens + a few evergreens (Park City yard)
  [[-42, 34, 34], [44, 30, 32], [-30, 46, 30], [30, 50, 28], [50, -10, 30], [-48, -8, 32]].forEach(([x, z, h]) => scene.add(aspenTree(x, z, h)));
  [[-46, -30, 1.3], [40, -34, 1.2], [-24, 52, 0.9]].forEach(([x, z, s]) => scene.add(evergreen(x, z, s)));

  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize(); new ResizeObserver(resize).observe(container);
  (function loop() { requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); })();

  window.__cam3D = (name) => {
    if (name === 'auto') { controls.autoRotate = !controls.autoRotate; return controls.autoRotate; }
    const v = VIEWS[name]; if (!v) return;
    camera.position.set(...v); controls.target.set(0, name === 'aerial' ? 12 : 10, 0);
  };
}

window.__init3D = function () {
  const container = document.getElementById('td-canvas');
  if (!container) return;
  const loader = document.getElementById('td-load');
  try { initScene(container); if (loader) loader.style.display = 'none'; }
  catch (e) { if (loader) loader.textContent = 'WebGL unavailable — ' + (e.message || e); console.error(e); }
};
