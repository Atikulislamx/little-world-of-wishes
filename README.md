# Little World of Wishes

A quiet, eight-page interactive birthday experience: an illustrated Japanese
garden of cherry blossoms, flowers, wishes and soft music. Built as a plain
static site — HTML5, CSS3 and vanilla JavaScript — so it runs anywhere, with no
build step, database or backend.

Everything personal lives in a single file: **`js/config.js`**.

---

## 1. What is inside

| # | Page | File | What happens there |
|---|------|------|--------------------|
| 01 | The Secret Gate | `index.html` | A four-digit PIN keypad opens the world (session only) |
| 02 | A Warm Welcome | `welcome.html` | Introduction and the start of the journey |
| 03 | The Celebration | `celebration.html` | Tap the five candle flames; confetti when they are all out |
| 04 | A Garden of Wishes | `garden.html` | 19 illustrated flowers, each with one unique wish |
| 05 | A Little Note | `letter.html` | A sealed envelope that opens into a letter |
| 06 | Dreams & Destinations | `dreams.html` | Five animated wish cards |
| 07 | A Little Extra Magic | `surprise.html` | Gift box, wishing star and butterfly; a firework when all three are found |
| 08 | A Beautiful Tomorrow | `finale.html` | Closing message, a wish on a star, replay and return |

Plus `404.html` (GitHub Pages-friendly fallback), `site.webmanifest` and the
shared assets in `assets/`.

```
little-world-of-wishes/
├── index.html · welcome.html · celebration.html · garden.html
├── letter.html · dreams.html · surprise.html · finale.html
├── 404.html · site.webmanifest · README.md · .gitignore
├── css/
│   ├── global.css        design tokens, fonts, base layout
│   ├── components.css    buttons, cards, top bar, PIN, envelope, modals
│   ├── animations.css    every keyframe and ambient effect
│   ├── pages.css         one block per page
│   ├── effects.css       canvas atmosphere, music invitation
│   └── responsive.css    breakpoints (mobile-first, 320 → 2560 px)
├── js/
│   ├── config.js         ← all the personal content and settings
│   ├── guard.js          PIN session check (runs before paint)
│   ├── art.js            original SVG illustration library
│   ├── main.js           runtime: backdrop, canvas, reveals, modals, toasts
│   ├── shell.js          shared top bar and footer
│   ├── music.js          soundtrack + UI sounds
│   ├── router.js         optional soft page transitions (progressive)
│   ├── navigation.js     lock / replay / journey controls
│   ├── pin-lock.js · cake.js · flowers.js · letter.js
│   ├── dreams.js · surprises.js · finale.js
├── assets/
│   ├── backgrounds/      8 illustrated backdrops (WebP + JPG fallback)
│   ├── fonts/            self-hosted Cormorant Garamond, Jost, Klee One
│   ├── music/            petals-at-dusk.mp3 (original instrumental)
│   └── icons/            favicon, app icons
└── tools/                optional asset generators (not needed to run the site)
```

---

## 2. Run it locally

Any static file server works. The site is plain files, so opening
`index.html` directly from disk also works in most browsers (the PIN falls back
to an in-memory session when storage is blocked).

```bash
# from the project root
python3 -m http.server 8080
# then open http://localhost:8080/
```

or `npx serve .`, or VS Code's Live Server extension.

---

## 3. Deploy to GitHub Pages

1. Push this folder to the repository (branch `main`).
2. On GitHub open **Settings → Pages**.
3. Under **Build and deployment** choose **Deploy from a branch**,
   branch **`main`**, folder **`/ (root)`**, then **Save**.
4. Wait for the green check, then open:

   `https://<your-username>.github.io/little-world-of-wishes/`

All paths are relative, so a project site served from a sub-folder works
exactly like the local preview. `404.html` is picked up automatically.

### Optional: the included workflow

`.github/workflows/pages.yml` publishes the branch on every push using the
official Pages actions. If you use the branch/folder method above, delete the
workflow file to avoid two deployment methods fighting each other.

---

## 4. Customising (one file)

Open `js/config.js` and edit the strings. Nothing else needs touching.

| What | Where |
|------|-------|
| **PIN** | `pin.code` — must keep `pin.length` digits (`'1119'` = the birthday) |
| Birthday date | `birthday.display`, `birthday.monthDay`, `birthday.iso` |
| PIN lock text | `ui.*`, page copy in `index.html` |
| Welcome copy | `welcome.*` |
| Cake | `celebration.cakeCandles`, `celebration.candlesOut`, … |
| The 19 wishes | `garden.flowers[]` — `{ type, name, wish }` |
| Flower types | `rose · tulip · lily · sunflower · sakura · daisy · lavender` |
| The letter | `letter.salutation`, `letter.paragraphs[]`, `letter.signature` |
| Dreams cards | `dreams.cards[]` |
| Surprises | `surprise.items[]` |
| Finale | `finale.*` |
| Music | `audio.src`, `audio.volume`, `audio.enabled` |
| Theme colours | `theme.*` and the CSS variables in `css/global.css` |

### The PIN is a decorative gate

The PIN is checked in the browser and the code lives in `js/config.js`, so a
determined visitor with developer tools can read it. It exists to keep the
surprise hidden from a casual glance — it is **not** security, and no personal
or private information should be placed behind it. Do not reuse an important
PIN here.

The unlock lasts for the browser tab (sessionStorage), with an in-memory and
`window.name` fallback when storage is unavailable. The lock button in the top
bar (and “Return to Beginning” on the last page) ends the session.

---

## 5. Music

- **Default: off.** Nothing autoplays. A visitor turns music on from the
  speaker button in the top bar (or the one-time “Add a little music?” note).
- The preference is remembered in `localStorage`; the position in
  `sessionStorage`.
- Moving between pages normally reloads the page, so the soundtrack restarts
  from the remembered position. On browsers that support the optional soft
  router the audio element is never reloaded and the track plays continuously.
- If the MP3 is missing or blocked the site logs nothing, disables the music
  button and keeps working — the UI sounds (a separate, tiny WebAudio synth)
  are unaffected.
- Preference between page loads follows the last choice; a browser that
  refuses programmatic playback simply waits for the next tap.

`assets/music/petals-at-dusk.mp3` was **composed and synthesised for this
project** by `tools/make-music.mjs` (a D-major pentatonic harp figure over a
warm pad, ~93 s). It is original, so it is free to use here without
third-party licensing. Regenerate or tweak it with:

```bash
npm i @breezystack/lamejs          # dev-only dependency
node tools/make-music.mjs
```

To use your own track instead, drop an `.mp3` into `assets/music/` and point
`audio.src` at it. Keep it instrumental, calm and around 50–150 seconds if you
want it to loop gracefully.

---

## 6. Artwork and fonts

- Every illustration used in the interface (flowers, cake, gift, star,
  butterfly, lanterns, torii, icons) is original vector art drawn by
  `js/art.js`. Nothing is borrowed from commercial anime.
- The eight full-page backdrops in `assets/backgrounds/` are original
  illustrations made for this project, exported as WebP (1920 px and 960 px)
  with a JPEG fallback. They are decorative, lazy-mounted by JavaScript, and
  degrade to a soft CSS gradient if an image ever fails.
- Typography is self-hosted (no Google Fonts request, no third-party CDN):
  Cormorant Garamond (display serif), Jost (body) and Klee One (handwritten
  notes), all under the SIL Open Font License. Their licence files live next to
  the fonts in `assets/fonts/`.

The site makes **no external network requests at runtime**.

---

## 7. Accessibility

- Semantic landmarks, one `<h1>` per page, ordered headings.
- Full keyboard support: the PIN keypad, candles, flowers, envelope and
  surprises are all reachable and operable with Tab / Enter / Space; the
  garden and surprise dialogs trap focus and restore it on close; Escape works.
- Visible focus rings, including on the dark night pages.
- `prefers-reduced-motion` stops the canvas, petals, balloons, confetti and
  transitions, and shows all content immediately.
- Touch targets are at least 40–48 px; text contrast was tuned per background
  and re-checked with a readability scrim behind copy.
- Decorative art is marked `aria-hidden`; the backdrop image carries empty alt
  text; live regions announce PIN errors, candle state and wishes.

---

## 8. Performance

- No frameworks, no external requests, ~30 KB of gzipped JS and CSS in total.
- Fonts are subset WOFF2 files, preloaded; the backgrounds are WebP with
  responsive `sizes`, and the small variant is preloaded on phones.
- Animations are CSS-driven; the ambient canvas is capped (and reduced further
  on low-power devices), pauses when the tab is hidden, and is disabled
  entirely for `prefers-reduced-motion`.
- Reveal-on-scroll uses `IntersectionObserver` with a safety net so content can
  never stay hidden.

---

## 9. Testing performed

Automated passes in Chromium (Playwright) — screenshots and assertions for
every page at **320, 375, 390, 430, 768, 1024, 1440, 1920 and 2560 px** wide
(64 width × page combinations), plus a keyboard-only and a reduced-motion run,
plus the whole journey served from a **nested folder** to mimic
`/little-world-of-wishes/` on GitHub Pages:

- [x] PIN keypad (tap and physical keyboard), wrong-PIN shake + message,
      correct PIN unlocks, session persists across pages, direct access while
      locked redirects to the gate, lock button ends the session
- [x] All eight pages load with no console errors and no failed requests
- [x] Every internal navigation, back/forward, refresh and deep link
- [x] 19 flower wishes open, are unique, progress counter and “all found” state
- [x] Cake candles extinguish individually, confetti, message, relight
- [x] Envelope opens, the full letter and signature render
- [x] Five dream cards and three surprises, firework after the third
- [x] Finale wish star, replay (stays unlocked) and return to beginning
- [x] Music: off by default, starts only on a click, survives navigation,
      mute/unmute, sensible behaviour with the audio file missing
- [x] No horizontal scroll at any tested width; no undersized tap targets
- [x] Keyboard-only pass (Tab order, Enter/Space on every control), reduced
      motion pass, dialog focus trap + focus restoration, Escape to close
- [x] Zero console errors, zero failed requests, zero missing local files
      (60 asset/link references resolved) on every page

---

## 10. Known limitations

- The PIN is a front-end gate, not real protection (see above).
- Music preference and position are per-browser. Some browsers require a tap
  before audio may play on a new page load — in that case the soundtrack resumes
  from the remembered point on the next interaction rather than instantly.
- On browsers without the optional soft router, the track restarts at the
  remembered position on each page change instead of playing continuously;
  the preference itself is never lost.
- The illustrated backdrops are 16:9; on very tall, narrow screens the edges are
  cropped by `object-fit: cover` (intentional, the centre of each scene is the
  focal point).
- `404.html` only works when the site is hosted with GitHub Pages (or another
  host that supports custom error pages); opening files from disk simply will
  not find a missing file.

---

## 11. Regenerating assets (optional)

`tools/` is only for maintainers; the site never needs it.

```bash
node tools/make-music.mjs   # rebuilds assets/music/petals-at-dusk.mp3
```

The backdrops were produced outside the repository and are shipped as-is;
replace the files in `assets/backgrounds/` (same names, WebP + JPG) if you want
different scenery.

---

Made with care, just to celebrate a special day.
