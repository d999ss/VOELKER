# 3986 Voelker Ct — Interactive Floor Plan Viewer

Live site: **https://voelker.vercel.app**

A static, single-page site for 3986 Voelker Ct, Park City, UT 84098. It renders an interactive main/upper floor plan, a render gallery, a listing-photo lightbox, and property/construction info.

## File map

| Path | What it is |
|------|------------|
| `index.html` | The whole site: inline SVG main + upper floor plans, view/layer toggles, photo and render lightbox, info panels. |
| `renders/` | 4 marketing renders: `front.png`, `iso-br.png`, `iso-fr.png`, `top.png`. |
| `voelker-house-photos/` | 40 listing photos (`photo-01.webp` … `photo-40.webp`). |
| `car-911sc.png` | Blueprint-style 1983 911 SC car image for the 3D garage. |
| `car-991.png` | Blueprint-style 2017 991.2 4S car image for the 3D garage. |
| `car-g550.png` | Blueprint-style Mercedes G550 car image for the 3D garage. |
| `README.md` | This file. |
| `.gitignore` | Ignore patterns for macOS / Node / log artifacts. |

## Locked plan rules

- **Footprint — L-shape, exact dims (10 px = 1 ft):**
  - Main body: X 4.0 → 46.8, Z 5.0 → 36.0 (42′-10″ × 31′), two stories.
  - Garage wing: X 4.0 → 29.3, Z 36.2 → 62.2 (25′-1″ × 26′), one story, extends toward street from the **left** portion of the main body.
  - Driveway slab: X 29.6 → 49.6, Z 36.2 → 62.4, to the **right** of the garage. Never below it. Never flip the garage to the right side.
- **Heights:**
  - Main floor plate 9′-1″, upper floor plate 8′-0″, floor thickness 1′.
  - Garage plate 9′-6″ (visually ~10′ to eave).
  - Living room (right side of main body) is a two-story vaulted void — no upper floor over it.
  - Upper floor volume sits only over the left/center of the main body (X 4.0 → ~30.4, 22′-4″ wide), never over the garage wing.
- **Roofs:** 6:12 pitch everywhere; hipped roof on garage wing; gable roof on main body with front-facing gables; 1.5′ eave overhang; dark asphalt shingle (#3a3a40). Stone/dark chimney chase on the right (east) wall near the living room.
- **Openings:** Garage doors on the right wall of the garage wing (16′ + 9′ doors, header at 8′). Front door on the street wall near X 25–31 with concrete steps. Living-room picture window, upper gable 3-window band, kitchen bay bump-out at back, rear sliders.
- **Materials:** Dark warm gray lap siding (#4a4d52), tan/buff fieldstone wainscot (~3′), near-black trim/fascia (#2a2c30), light concrete driveway, turf backyard, covered deck slab at back-left. All procedural — no external image textures. Gold `#D2A62C` is UI-only.
- **Cars in garage (locked dims and positions):**
  - 1983 911 SC: 14.1′ × 5.4′, center X 14.6 / Z 40.7, nose left (−X).
  - 2017 991.2 4S: 14.8′ × 6.1′, center X 14.4 / Z 50.5, nose left.
  - Mercedes G550: 15.8′ × 6.3′, center X 14.4 / Z 58.1, nose left.
- **Dollhouse mode:** Hide roofs + upper faces, extrude 0.4′-thick interior partition walls from the locked room rectangles; show room-name sprite labels.
- **Hard rules:** No external assets/textures (one self-contained HTML file); runs from `file://` and Vercel; display only the blueprint-sourced dimensions (42′-10″, 31′, 25′-1″, 26′, 22′-4″).
