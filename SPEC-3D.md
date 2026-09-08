# SPEC — 3986 Voelker Ct Interactive 3D Model (`3d.html`)

Single self-contained page `3d.html` in this repo. Three.js (r160+) via CDN import map
(https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js + OrbitControls from
examples/jsm). No build step — static file deployed on Vercel alongside index.html.

## Coordinate system

Plan source: main-floor SVG, 10px = 1ft. Map plan x → world X (feet), plan y → world Z
(feet), up = world Y. Plan TOP (low y) = backyard, BOTTOM = street. So the street side is
+Z, backyard is −Z relative to the house.

## Footprint (LOCKED — feet, from plan px/10)

L-shape, exactly:
- Main body: X 4.0 → 46.8 (42'-10" wide), Z 5.0 → 36.0 (31' deep). Two stories.
- Garage wing: X 4.0 → 29.3 (25'-1"), Z 36.2 → 62.2 (26'). ONE story. Extends toward
  street from the LEFT portion of the main body.
- Driveway slab: X 29.6 → 49.6, Z 36.2 → 62.4 — to the RIGHT of the garage. NEVER below it.
- The house is NOT a rectangle. Never flip the garage to the right side.

## Heights

- Main floor plate: 9'-1". Upper floor plate: 8'-0". Floor thickness 1'.
- Garage plate: 9'-6" (must clear the 9' door minus header; visually ~10' to eave).
- Living room (right side of main body, X 31→46.8, Z 18.2→35.8) is a 2-story vaulted
  void — no upper floor over it.
- Upper floor volume sits over the LEFT/CENTER of the main body only (X 4.0 → ~30.4,
  22'-4" wide), never over the garage wing.

## Roofs (from listing photos — ground truth over any prior render)

- Pitch 6:12 everywhere.
- Garage wing: HIPPED roof (wraps around the front-left corner, like the photos).
- Main 2-story body: gable roof, ridge running X (left-right), with a large front-facing
  gable over the 2-story section and a secondary front gable stacked at the entry side —
  see photo-01/photo-02. Chimney: stone/dark chase on the RIGHT (east) wall near the
  living room, rising past the ridge.
- Eave overhang 1.5' all around. Roof color: dark asphalt shingle (#3a3a40 range).

## Openings

- Garage doors on the RIGHT wall of the garage wing facing the driveway: 16' door
  (Z 46.1→61.9) + 9' door (Z 36.5→45.3), header at 8'. Recessed panels, dark gray.
- Front door: main body street wall near X 25–31 (entry), with 2-3 concrete steps up.
- Windows (simplified, from photos): large picture-window group on the street wall of the
  living room; 3-window band on the upper front gable; kitchen bay bump-out at the back
  (X 18.5→31, Z 5) — model the bay as a shallow protrusion; sliders at back (bedroom 4,
  dining). White/light trim frames, dark glass with slight emissive/reflective material.

## Materials (photo-matched)

- Siding: dark warm gray lap siding, #4a4d52 base with subtle horizontal line texture
  (procedural — repeat thin darker stripes; no external image files).
- Stone wainscot: tan/buff fieldstone band around the base, height 3' on garage front,
  entry, and living-room street wall (like photos). Procedural blotch texture ok.
- Trim/fascia: near-black #2a2c30. Garage doors #3f4247.
- Ground: driveway light concrete slab; backyard = turf green rectangle behind the house
  (Z < 5) with covered deck slab at back-left; the rest neutral dark ground plane.
- Gold accent #D2A62C used ONLY for UI, not the house.

## Cars in garage (LOCKED dims, feet — boxes with rounded edges are fine)

| Car | L×W | Position (center X,Z) | Facing |
|---|---|---|---|
| 1983 911 SC | 14.1 × 5.4 | X 14.6, Z 40.7 | nose LEFT (−X), tail to door |
| 2017 991.2 4S | 14.8 × 6.1 | X 14.4, Z 50.5 | nose LEFT |
| Mercedes G550 | 15.8 × 6.3 | X 14.4, Z 58.1 | nose LEFT |

Cars horizontal, entering through the RIGHT-wall doors. Show them when the "Garage" toggle
is on; render garage roof/walls semi-transparent or cut away in that mode.

## Interior dollhouse mode (toggle)

"Dollhouse" toggle hides roofs + upper faces and extrudes interior partition walls (0.4'
thick, 9' main / 8' upper) from the LOCKED room rectangles (divide px by 10):

Main: Bedroom4 (4.2,5.2,14.3×12.1) · Kitchen (18.5,5.2,12.5×20.0) · Dining
(31.0,5.2,15.6×13.0) · Bath3 (4.2,17.3,9.0×5.2) · Laundry (4.2,22.5,9.0×5.5) · Mud
(4.2,28.0,10.0×6.0) · Stairs (19.5,21.0,5.0×9.5) · FAU (19.5,30.5,3.5×3.0) · HalfBath
(23.0,29.0,4.0×3.8) · Entry (25.0,31.8,6.0×4.0) · Living (31.0,18.2,15.6×17.6).
Format: (x, z, w×d) in feet. Room-name floating labels (sprites) in dollhouse mode.

## UI / page chrome

Match index.html styling: bg #111119, Courier New, gold #D2A62C headers, thin bordered
buttons. Header "3986 Voelker Ct — 3D Model". Controls row: Exterior · Dollhouse ·
Garage X-Ray · Auto-Rotate. OrbitControls with damping; initial camera = front-right
three-quarter aerial (like photo-02). Soft key light + hemisphere; shadows on.
Link back: "← Floor Plans" → index.html. Mobile: canvas fills viewport, buttons wrap.

## Hard rules (violations = rejected build)

1. Garage LEFT, doors facing RIGHT toward driveway; driveway RIGHT of garage.
2. L-shape footprint exactly as specified.
3. No dimensions displayed other than blueprint-sourced ones (42'-10", 31', 25'-1", 26', 22'-4").
4. No external assets/textures — everything procedural, one HTML file.
5. Page must run from file:// and from Vercel static hosting (CDN import map only).
