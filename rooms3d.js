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
];

// ---------------------------------------------------------------------------
//  Scene
// ---------------------------------------------------------------------------
let started = false, current = null, scene, camera, controls, renderer;
function buildRoom(def) {
  if (current) { scene.remove(current); current.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  const g = new THREE.Group();
  shell(g, def.w, def.d, def.h);
  def.build(g);
  g.position.y = 0; scene.add(g); current = g;
  camera.position.set(...def.cam);
  controls.target.set(0, def.h * 0.35, 0); controls.update();
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
  controls.minDistance = 10; controls.maxDistance = 90; controls.maxPolarAngle = Math.PI * 0.5;
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
