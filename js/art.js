/* ==========================================================================
   Little World of Wishes — Original SVG illustration library
   --------------------------------------------------------------------------
   Every drawing in this project is authored here as vector art, so nothing
   depends on a third-party image host. The same functions are used by the
   pages (via window.LWOWArt) and by tools/emit-art.mjs to export the
   standalone .svg files that live in assets/.
   ========================================================================== */
(function (root) {
  'use strict';

  let uid = 0;
  const nextId = (p) => `${p}${++uid}`;

  /* ---------- tiny seeded random so art is stable between reloads -------- */
  function rng(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  const r2 = (n) => Math.round(n * 100) / 100;
  const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;

  /* almond / teardrop petal pointing up, origin at its base */
  function petalPath(len, wid, tip = 0.55) {
    return `M0 0 C ${-wid} ${-len * 0.28} ${-wid * tip} ${-len * 0.78} 0 ${-len} ` +
      `C ${wid * tip} ${-len * 0.78} ${wid} ${-len * 0.28} 0 0 Z`;
  }

  function leafPath(len, wid) {
    return `M0 0 C ${wid} ${-len * 0.5} ${wid * 0.45} ${-len * 0.95} 0 ${-len} ` +
      `C ${-wid * 0.45} ${-len * 0.95} ${-wid} ${-len * 0.5} 0 0 Z`;
  }

  function defsGrad(id, stops, x2 = '0', y2 = '1') {
    const s = stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('');
    return `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${s}</linearGradient>`;
  }
  function defsRad(id, stops, cx = '50%', cy = '50%', rad = '60%') {
    const s = stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('');
    return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${rad}">${s}</radialGradient>`;
  }

  /* gentle ink line for an anime look */
  const ink = (color = '#8C5E74', w = 1.2, op = 0.35) =>
    `stroke="${color}" stroke-width="${w}" stroke-opacity="${op}" stroke-linejoin="round"`;

  /* --------------------------------------------------------------- palettes */
  const PALETTES = {
    rose:      { deep: '#C3617F', mid: '#E58AA6', light: '#F7B9CB', glow: '#FFE3EC' },
    tulip:     { deep: '#D2739A', mid: '#EE9DBA', light: '#F8C7D8', glow: '#FFE7EF' },
    lily:      { deep: '#E2A7BC', mid: '#F7DCE6', light: '#FFFFFF', glow: '#FFF6FA' },
    sunflower: { deep: '#D99A34', mid: '#F2C15B', light: '#FBE0A1', glow: '#FFF3D6' },
    sakura:    { deep: '#E88AAB', mid: '#F7B4C9', light: '#FFDCE7', glow: '#FFF1F6' },
    daisy:     { deep: '#E5D9DF', mid: '#FFFFFF', light: '#FFFFFF', glow: '#FBF7F9' },
    lavender:  { deep: '#8D76C6', mid: '#B49FE0', light: '#D9CCF3', glow: '#F0EAFC' }
  };
  const GREENS = { stem: '#8FAE8B', leaf: '#A9C6A0', leafDeep: '#7C9C80', vein: '#6C8A72' };

  /* ================================================================ FLOWERS */

  function stemAndLeaves(len, scale, seed) {
    const rand = rng(seed);
    const gid = nextId('g');
    let out = `<defs>${defsGrad(gid, [[0, GREENS.leafDeep], [1, GREENS.leaf]])}</defs>`;
    out += P(`M0 0 C ${2 - rand() * 6} ${len * 0.35} ${6 + rand() * 8} ${len * 0.7} ${3 + rand() * 5} ${len}`, 'none',
      `stroke="${GREENS.stem}" stroke-width="${4.2 * scale}" stroke-linecap="round"`);
    // two leaves, attached a little below the bloom
    const leaves = [
      { x: -1, y: len * 0.42, rot: -58, s: 1.05 },
      { x: 2, y: len * 0.64, rot: 52, s: 0.86 }
    ];
    for (const lf of leaves) {
      const L = 44 * scale * lf.s, W = 19 * scale * lf.s;
      out += `<g transform="translate(${lf.x} ${lf.y}) rotate(${lf.rot})">
        ${P(leafPath(L, W), `url(#${gid})`, ink('#5F7A66', 0.9, 0.25))}
        ${P(`M0 0 Q ${W * 0.12} ${-L * 0.5} 0 ${-L * 0.96}`, 'none', `stroke="${GREENS.vein}" stroke-width="${1.1}" stroke-opacity="0.45" fill="none"`)}
      </g>`;
    }
    return out;
  }

  function flowerRose(seed = 7, scale = 1) {
    const p = PALETTES.rose, rand = rng(seed);
    const g1 = nextId('rg'), g2 = nextId('rg');
    let s = `<defs>${defsRad(g1, [[0, p.light], [0.6, p.mid], [1, p.deep]], '44%', '40%', '68%')}` +
      `${defsRad(g2, [[0, p.glow, 0.9], [1, p.deep, 0]], '50%', '50%', '52%')}</defs>`;
    s += `<circle cx="0" cy="-10" r="70" fill="url(#${g2})" opacity="0.5"/>`;
    // outer ruffle — wide, overlapping petals
    for (let i = 0; i < 8; i++) {
      const a = 45 * i + (i % 2 ? 9 : -6) + rand() * 6;
      s += `<g transform="rotate(${r2(a)}) scale(1.55 1.2)">
        ${P(petalPath(40, 27, 0.72), `url(#${g1})`, `${ink('#9E5673', 1, 0.28)} opacity="0.97"`)}</g>`;
    }
    // second ring, offset half a step
    for (let i = 0; i < 7; i++) {
      const a = (360 / 7) * i + 22 + rand() * 8;
      s += `<g transform="rotate(${r2(a)}) scale(1.05 0.92)">
        ${P(petalPath(42, 25, 0.72), `url(#${g1})`, `${ink('#8F4A66', 1, 0.24)}`)}</g>`;
    }
    // third ring
    for (let i = 0; i < 5; i++) {
      const a = 72 * i + 12;
      s += `<g transform="rotate(${r2(a)}) scale(0.74 0.66)">
        ${P(petalPath(44, 26, 0.75), p.mid, 'opacity="0.97"')}</g>`;
    }
    // spiral heart
    s += `<g transform="translate(0 -6)">
      ${P('M-16 7 C -24 -6 -10 -21 2 -15 C 15 -22 26 -5 14 5 C 7 11 -9 14 -16 7 Z', p.deep, 'opacity="0.94"')}
      ${P('M-8 4 C -13 -5 -4 -12 3 -8 C 11 -12 15 -2 8 3 C 4 7 -4 7 -8 4 Z', p.mid)}
      ${P('M-3.6 1 C -5 -4 -0.5 -7 3 -4.6 C 5.6 -1 1 2.6 -3.6 1 Z', p.light, 'opacity="0.95"')}
    </g>`;
    return `<g transform="scale(${scale})">${s}</g>`;
  }

  function flowerTulip(seed = 11, scale = 1) {
    const p = PALETTES.tulip, rand = rng(seed);
    const g = nextId('tg'), g2 = nextId('tg');
    let s = `<defs>${defsGrad(g, [[0, p.light], [0.5, p.mid], [1, p.deep]], '0.18', '1')}` +
      `${defsGrad(g2, [[0, p.mid], [1, p.deep]], '0.3', '1')}</defs>`;
    // a second, smaller bud leaning to the right for a natural silhouette
    s += `<g transform="translate(26 -18) rotate(22) scale(0.52)">
      <path d="M0 6 C -30 0 -34 -26 -30 -50 C -16 -46 -8 -52 0 -54 C 8 -52 16 -46 30 -50 C 34 -26 30 0 0 6 Z" fill="url(#${g2})" ${ink('#B96A8D', 1.4, 0.3)}/>
      <path d="M-30 -48 C -20 -34 -14 -26 -9 -14 C -18 -22 -26 -34 -30 -48 Z" fill="${p.deep}" opacity="0.4"/>
    </g>`;
    // main cup
    s += `<path d="M0 10 C -34 2 -38 -28 -33 -56 C -18 -50 -9 -57 0 -60 C 9 -57 18 -50 33 -56 C 38 -28 34 2 0 10 Z" fill="url(#${g})" ${ink('#B96A8D', 1.1, 0.3)}/>`;
    s += `<path d="M0 -54 C -7 -34 -7 -10 0 8 C 7 -10 7 -34 0 -54 Z" fill="${p.light}" opacity="0.6"/>`;
    s += `<path d="M-33 -54 C -22 -38 -15 -29 -10 -16 C -20 -25 -29 -38 -33 -54 Z" fill="${p.deep}" opacity="0.34"/>`;
    s += `<path d="M33 -54 C 22 -38 15 -29 10 -16 C 20 -25 29 -38 33 -54 Z" fill="${p.deep}" opacity="0.26"/>`;
    s += P('M-33 -56 C -18 -50 -9 -57 0 -60 C 9 -57 18 -50 33 -56', 'none', `stroke="${p.glow}" stroke-width="2.2" stroke-opacity="0.6" stroke-linecap="round"`);
    s += `<path d="M-16 -34 C -8 -41 8 -41 16 -34" fill="none" stroke="${p.glow}" stroke-width="2" stroke-opacity="0.38" stroke-linecap="round"/>`;
    return `<g transform="scale(${scale})">${s}</g>`;
  }

  function flowerLily(seed = 13, scale = 1) {
    const p = PALETTES.lily, rand = rng(seed);
    const g = nextId('lg'), gs = nextId('lgs');
    let s = `<defs>${defsGrad(g, [[0, p.light], [0.62, p.mid], [1, p.deep]], '0.3', '1')}` +
      `${defsRad(gs, [[0, '#F6C46B'], [1, '#D99A3E']], '50%', '50%', '50%')}</defs>`;
    for (let i = 0; i < 6; i++) {
      const a = 60 * i + (i % 2 ? 3 : -3) + rand() * 3;
      const long = i % 2 === 0;
      s += `<g transform="rotate(${r2(a)})">
        ${P(petalPath(long ? 74 : 64, long ? 27 : 23, 0.5), `url(#${g})`, `${ink('#C98BA1', 1, 0.3)} opacity="0.97"`)}
        ${P(`M0 -10 Q 0 ${-34} 0 ${long ? -64 : -55}`, 'none', `stroke="${p.glow}" stroke-width="2" stroke-opacity="0.85"`)}
        <g opacity="0.45">${P(petalPath(20, 3.2, 0.35), '#D98FAA')}</g>
        <g opacity="0.35">${P(petalPath(13, 2.4, 0.35), '#D98FAA', 'transform="rotate(16)"')}</g>
      </g>`;
    }
    for (let i = 0; i < 5; i++) {
      const a = 72 * i + 12;
      s += `<g transform="rotate(${a})">${P('M0 0 Q 2 -12 0 -22', 'none', 'stroke="#C9A45C" stroke-width="1.8" stroke-linecap="round"')}
        <ellipse cx="0" cy="-25" rx="5.4" ry="2.8" fill="url(#${gs})" transform="rotate(12)"/></g>`;
    }
    return `<g transform="scale(${scale})">${s}</g>`;
  }

  function flowerSunflower(seed = 17, scale = 1) {
    const p = PALETTES.sunflower, rand = rng(seed);
    const g = nextId('sg'), gc = nextId('sgc');
    let s = `<defs>${defsGrad(g, [[0, p.light], [0.55, p.mid], [1, p.deep]], '0.35', '1')}` +
      `${defsRad(gc, [[0, '#8A6142'], [0.7, '#6B452C'], [1, '#4E2F1E']], '45%', '40%', '62%')}</defs>`;
    for (let ring = 0; ring < 2; ring++) {
      const n = ring === 0 ? 16 : 12;
      for (let i = 0; i < n; i++) {
        const a = (360 / n) * i + (ring ? 180 / n : 0) + rand() * 3;
        const len = ring === 0 ? 54 : 42;
        s += `<g transform="rotate(${r2(a)}) translate(0 -26) scale(${ring === 0 ? 1 : 0.82})">
          ${P(petalPath(len, ring === 0 ? 10 : 9, 0.62), `url(#${g})`, `${ink('#B98230', 0.9, 0.3)} opacity="${ring === 0 ? 0.97 : 0.92}"`)}</g>`;
      }
    }
    s += `<circle cx="0" cy="0" r="30" fill="url(#${gc})" ${ink('#4A2A18', 1.2, 0.35)}/>`;
    const rand2 = rng(seed + 5);
    for (let i = 0; i < 26; i++) {
      const a = rand2() * Math.PI * 2, rr = 6 + rand2() * 21;
      s += `<circle cx="${r2(Math.cos(a) * rr)}" cy="${r2(Math.sin(a) * rr)}" r="${r2(1 + rand2() * 1.6)}" fill="#3E2415" opacity="0.55"/>`;
    }
    s += `<circle cx="-9" cy="-11" r="9" fill="#A9784F" opacity="0.35"/>`;
    return `<g transform="scale(${scale})">${s}</g>`;
  }

  function sakuraBlossom(scale = 1, seed = 1) {
    const p = PALETTES.sakura, rand = rng(seed), g = nextId('sk');
    let s = `<defs>${defsRad(g, [[0, p.light], [0.7, p.mid], [1, p.deep]], '50%', '42%', '62%')}</defs>`;
    const notch = 'M0 2 C -17 -6 -19 -28 -10 -37 L -3.6 -31 L 0 -36 L 3.6 -31 L 10 -37 C 19 -28 17 -6 0 2 Z';
    for (let i = 0; i < 5; i++) {
      s += `<g transform="rotate(${72 * i + rand() * 4}) scale(1.08)">${P(notch, `url(#${g})`, `${ink('#D67E9F', 0.9, 0.32)} opacity="0.97"`)}
        <path d="M0 -3 L0 -26" stroke="#F4A6C0" stroke-width="1" stroke-opacity="0.5"/></g>`;
    }
    for (let i = 0; i < 7; i++) {
      const a = (360 / 7) * i;
      s += `<g transform="rotate(${a})">${P('M0 -2 L0 -10', 'none', 'stroke="#E58AAB" stroke-width="1.3" stroke-linecap="round"')}
        <circle cx="0" cy="-12" r="1.9" fill="#F3C25E"/></g>`;
    }
    s += `<circle r="3.4" fill="#F0B450"/><circle r="1.6" fill="#FBE3A6"/>`;
    return `<g transform="scale(${scale})">${s}</g>`;
  }

  function flowerSakura(seed = 19, scale = 1) {
    const rand = rng(seed);
    const g = nextId('sb');
    let s = `<defs>${defsGrad(g, [[0, '#8A6A55'], [1, '#6D5242']])}</defs>`;
    s += P('M-2 46 C 6 22 -4 0 2 -34', 'none', `stroke="#8A6A55" stroke-width="4.2" stroke-linecap="round"`);
    s += `<g transform="translate(-12 6) rotate(-64)">${P(leafPath(30, 7), GREENS.leaf, `${ink('#5F7A66', 0.8, 0.25)}`)}</g>`;
    s += `<g transform="translate(14 16) rotate(58)">${P(leafPath(26, 6), GREENS.leafDeep, `${ink('#5F7A66', 0.8, 0.25)}`)}</g>`;
    s += `<g transform="translate(0 -34)">${sakuraBlossom(1.18, seed)}</g>`;
    s += `<g transform="translate(-26 -14) rotate(-18)">${sakuraBlossom(0.72, seed + 2)}</g>`;
    s += `<g transform="translate(24 -8) rotate(16)">${sakuraBlossom(0.64, seed + 4)}</g>`;
    s += `<g transform="translate(10 -50) rotate(8)">${sakuraBlossom(0.5, seed + 6)}</g>`;
    return `<g transform="scale(${scale})">${s}</g>`;
  }

  function flowerDaisy(seed = 23, scale = 1) {
    const p = PALETTES.daisy, rand = rng(seed), g = nextId('dg'), gc = nextId('dgc');
    let s = `<defs>${defsGrad(g, [[0, '#FFFFFF'], [0.55, '#FDF6F9'], [1, p.deep]], '0.4', '1')}` +
      `${defsRad(gc, [[0, '#FBE07A'], [0.72, '#F0C24F'], [1, '#D9A22F']], '42%', '38%', '60%')}</defs>`;
    s += `<circle cx="0" cy="0" r="34" fill="#FFFDFB" opacity="0.55"/>`;
    for (let i = 0; i < 24; i++) {
      const a = 15 * i + (i % 2 ? 3 : 0) + rand() * 4;
      const outer = i % 2 === 0;
      s += `<g transform="rotate(${r2(a)}) translate(0 ${outer ? -14 : -10})">
        ${P(petalPath(outer ? 42 : 32, outer ? 10 : 8, 0.42), `url(#${g})`, `${ink('#D3BFCA', 0.9, 0.42)} opacity="${outer ? 0.97 : 0.9}"`)}</g>`;
    }
    s += `<circle r="19" fill="url(#${gc})" ${ink('#C99530', 1, 0.3)}/>`;
    const rnd = rng(seed + 3);
    for (let i = 0; i < 14; i++) {
      const a = rnd() * Math.PI * 2, rr = rnd() * 12;
      s += `<circle cx="${r2(Math.cos(a) * rr)}" cy="${r2(Math.sin(a) * rr)}" r="1.5" fill="#C99730" opacity="0.5"/>`;
    }
    return `<g transform="scale(${scale})">${s}</g>`;
  }

  function flowerLavender(seed = 29, scale = 1) {
    const p = PALETTES.lavender, rand = rng(seed);
    let s = '';
    const spikes = [
      { x: -16, y: 10, len: 92, rot: -9, s: 1 },
      { x: 0, y: 0, len: 112, rot: 0, s: 1.1 },
      { x: 16, y: 14, len: 86, rot: 8, s: 0.95 }
    ];
    for (const sp of spikes) {
      s += `<g transform="translate(${sp.x} ${sp.y}) rotate(${sp.rot})">`;
      s += P(`M0 44 C -2 12 2 -4 0 ${-sp.len * 0.55}`, 'none', `stroke="${GREENS.stem}" stroke-width="2.6" stroke-linecap="round"`);
      for (let i = 0; i < 9; i++) {
        const t = i / 8;
        const y = -34 - t * (sp.len * 0.6);
        const spread = 7.5 * (1 - t * 0.72);
        const col = t > 0.66 ? p.light : (t > 0.3 ? p.mid : p.deep);
        for (const dir of [-1, 1]) {
          s += `<ellipse cx="${r2(dir * spread + (rand() - 0.5) * 2)}" cy="${r2(y)}" rx="${r2(6.2 - t * 2.6)}" ry="${r2(4.4 - t * 1.6)}"
            fill="${col}" opacity="${r2(0.82 + rand() * 0.16)}" transform="rotate(${dir * 22} ${r2(dir * spread)} ${r2(y)})"/>`;
        }
        if (i % 2 === 0) s += `<ellipse cx="0" cy="${r2(y - 3)}" rx="${r2(4.6 - t * 2)}" ry="${r2(3.4 - t * 1.2)}" fill="${col}" opacity="0.9"/>`;
      }
      s += `<circle cx="0" cy="${r2(-34 - sp.len * 0.6 - 4)}" r="3" fill="${p.light}" opacity="0.95"/>`;
      s += `<g transform="translate(-3 26) rotate(-70)">${P(leafPath(22, 3.4), GREENS.leafDeep, 'opacity="0.9"')}</g>`;
      s += `<g transform="translate(3 34) rotate(72)">${P(leafPath(20, 3.2), GREENS.leaf, 'opacity="0.9"')}</g>`;
      s += `</g>`;
    }
    return `<g transform="scale(${scale})">${s}</g>`;
  }

  const FLOWER_BUILDERS = {
    rose: flowerRose, tulip: flowerTulip, lily: flowerLily,
    sunflower: flowerSunflower, sakura: flowerSakura,
    daisy: flowerDaisy, lavender: flowerLavender
  };

  /**
   * A complete flower on its stem.
   * `anchor` is the point inside each bloom drawing that should touch the top
   * of the stem, so no bloom ever floats away from its stem.
   * @returns {string} svg markup, 200 x 300 viewBox
   */
  function flower(type, opts = {}) {
    const { seed = 3, scale = 1, stem = true, viewBox = '0 0 200 300', className = '' } = opts;
    const build = FLOWER_BUILDERS[type] || flowerRose;
    const geo = {
      rose:      { stemLen: 104, anchor: 30, s: 0.92 },
      tulip:     { stemLen: 100, anchor: 2,  s: 0.95 },
      lily:      { stemLen: 108, anchor: 4,  s: 0.85 },
      sunflower: { stemLen: 106, anchor: 20, s: 0.82 },
      sakura:    { stemLen: 118, anchor: 12, s: 0.9 },
      daisy:     { stemLen: 108, anchor: 18, s: 0.92 },
      lavender:  { stemLen: 96,  anchor: 44, s: 0.92 }
    }[type] || { stemLen: 104, anchor: 20, s: 0.92 };

    const stemBaseY = 286;
    const stemTopY = stemBaseY - geo.stemLen;
    const bloomTransform = `translate(100 ${stemTopY}) translate(0 ${-geo.anchor * geo.s}) scale(${geo.s * scale})`;
    const inner = `${stem ? `<g transform="translate(100 ${stemTopY})">${stemAndLeaves(geo.stemLen, 1, seed)}</g>` : ''}
      <g transform="${bloomTransform}">${build(seed, 1)}</g>`;

    return `<svg class="flower-svg ${className}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMax meet" role="img" aria-hidden="true" data-flower="${type}">
      <ellipse class="flower__shadow" cx="100" cy="${stemBaseY + 8}" rx="34" ry="6.5" fill="#8C6F86" opacity="0.14"/>
      <g class="flower__art">${inner}</g>
    </svg>`;
  }

  /* ============================================================== OBJECTS */

  function cake(opts = {}) {
    const candles = opts.candles || 5;
    const gA = nextId('ck'), gB = nextId('ck'), gC = nextId('ck'), gl = nextId('ckl');
    let s = `<defs>
      ${defsGrad(gA, [[0, '#FFF6E9'], [1, '#F3DCC3']], '0', '1')}
      ${defsGrad(gB, [[0, '#FBD3E0'], [1, '#F0A9C0']], '0', '1')}
      ${defsGrad(gC, [[0, '#FFFDFB'], [1, '#F6E7EA']], '0', '1')}
      ${defsRad(gl, [[0, '#FFF3C4', 0.95], [1, '#FFD27A', 0]], '50%', '50%', '50%')}
    </defs>`;

    // ---- cake stand
    s += `<ellipse cx="250" cy="352" rx="150" ry="15" fill="#8C6F86" opacity="0.14"/>`;
    s += `<path d="M120 330 H380 L352 344 H148 Z" fill="#EFD9DE"/>`;
    s += `<rect x="238" y="344" width="24" height="16" rx="7" fill="#E4C6CD"/>`;
    s += `<ellipse cx="250" cy="364" rx="52" ry="9" fill="#E9CFD5"/>`;
    s += `<ellipse cx="250" cy="330" rx="130" ry="18" fill="#FFFDFC" ${ink('#C9A7B2', 1, 0.35)}/>`;

    // ---- bottom tier
    s += `<path d="M136 330 C 136 300 364 300 364 330 Z" fill="url(#${gA})"/>`.replace('Z"', 'Z"');
    s += `<rect x="136" y="248" width="228" height="82" fill="url(#${gA})"/>`;
    s += `<path d="M136 330 C 136 300 364 300 364 330 Z" fill="url(#${gA})"/>`;
    // frosting drip on the top edge of each tier
    s += `<path d="M136 252 C 136 236 364 236 364 252 C 356 268 344 250 334 262 C 324 274 312 252 300 264 C 288 276 276 252 264 264 C 252 276 240 252 228 264 C 216 276 204 252 192 262 C 180 272 168 250 158 260 C 148 268 140 258 136 252 Z" fill="#FFFDF9"/>`;
    s += `<path d="M136 248 C 136 232 364 232 364 248" fill="none" ${ink('#D9BDB0', 1, 0.3)}/>`;
    // tier shading
    s += `<rect x="136" y="248" width="228" height="82" fill="url(#${gB})" opacity="0.0"/>`;
    s += `<path d="M136 330 C 150 316 210 322 250 322 C 300 322 350 314 364 330 L364 330 Z" fill="#E9C3CE" opacity="0.35"/>`;

    // ---- middle tier
    s += `<rect x="176" y="196" width="148" height="54" rx="4" fill="url(#${gC})"/>`;
    s += `<path d="M176 200 C 176 186 324 186 324 200 C 316 214 306 198 296 208 C 286 218 276 198 264 208 C 252 218 242 198 230 208 C 218 218 206 196 194 206 C 186 212 180 204 176 200 Z" fill="#FBD9E4"/>`;
    s += `<path d="M176 196 C 176 182 324 182 324 196" fill="none" ${ink('#D9BDB0', 1, 0.28)}/>`;
    s += `<rect x="176" y="196" width="148" height="54" fill="#FFFDFB" opacity="0.0"/>`;
    // tiny floral piping on the middle tier
    for (let i = 0; i < 6; i++) {
      const x = 196 + i * 21.6, y = 228 + Math.sin(i) * 2;
      s += `<circle cx="${r2(x)}" cy="${r2(y)}" r="4.4" fill="#F5B8CE"/><circle cx="${r2(x)}" cy="${r2(y)}" r="1.7" fill="#FFF3F7"/>`;
    }

    // ---- top tier
    s += `<rect x="204" y="152" width="92" height="44" rx="4" fill="url(#${gB})"/>`;
    s += `<path d="M204 156 C 204 144 296 144 296 156 C 290 168 282 152 274 162 C 266 172 258 152 250 162 C 242 172 234 152 226 162 C 218 170 210 160 204 156 Z" fill="#FFFDF9"/>`;
    s += `<path d="M204 152 C 204 140 296 140 296 152" fill="none" ${ink('#D9BDB0', 1, 0.26)}/>`;

    // ---- flowers decorating the cake
    const decor = [
      { x: 172, y: 250, s: 0.32, type: 'rose' },
      { x: 328, y: 252, s: 0.3, type: 'rose' },
      { x: 250, y: 214, s: 0.26, type: 'rose' },
      { x: 206, y: 286, s: 0.22, type: 'lily' },
      { x: 296, y: 288, s: 0.22, type: 'lily' }
    ];
    for (const d of decor) {
      s += `<g transform="translate(${d.x} ${d.y}) scale(${d.s})">${d.type === 'lily' ? flowerLily(9, 1) : flowerRose(9, 1)}</g>`;
    }
    s += `<g transform="translate(250 152) scale(0.2)">${flowerSakura(3)}</g>`;

    // ---- candles
    const n = candles;
    const totalW = 132, startX = 250 - totalW / 2;
    for (let i = 0; i < n; i++) {
      const x = startX + (n === 1 ? totalW / 2 : (totalW / (n - 1)) * i);
      const y = 140;
      const hue = ['#F5B8CE', '#DCCCF5', '#FFE0B2', '#BFE3D0', '#F7C9D9'][i % 5];
      s += `<g class="candle" data-candle="${i}" transform="translate(${r2(x)} ${y})">
        <circle class="candle__hit" cx="0" cy="-44" r="17.5" fill="#fff" opacity="0"/>
        <rect x="-4.6" y="-46" width="9.2" height="48" rx="4" fill="${hue}"/>
        <path d="M-4.6 -46 c 2 6 7 6 9.2 0" fill="#fff" opacity="0.55"/>
        <rect x="-4.6" y="-14" width="9.2" height="3" fill="#FFF6FA" opacity="0.75"/>
        <rect x="-4.6" y="-28" width="9.2" height="3" fill="#FFF6FA" opacity="0.6"/>
        <path d="M0 -47 L0 -52" stroke="#8C6A55" stroke-width="2" stroke-linecap="round"/>
        <g class="candle__glow"><circle cx="0" cy="-60" r="26" fill="url(#${gl})"/></g>
        <g class="candle__flame">
          <path d="M0 -52 C 7 -60 6 -70 0 -80 C -6 -70 -7 -60 0 -52 Z" fill="#FFC662"/>
          <path d="M0 -55 C 4 -61 3.4 -67 0 -73 C -3.4 -67 -4 -61 0 -55 Z" fill="#FFF6D8"/>
          <path d="M0 -56 C 1.8 -60 1.6 -64 0 -67 C -1.6 -64 -1.8 -60 0 -56 Z" fill="#7FC8E8" opacity="0.55"/>
        </g>
        <g class="candle__smoke" opacity="0">
          <path d="M0 -52 C -6 -64 6 -70 0 -84 C -4 -92 3 -96 2 -102" fill="none" stroke="#B7A6B4" stroke-width="2.4" stroke-linecap="round" opacity="0.6"/>
        </g>
      </g>`;
    }
    // falling petals near the cake
    s += `<g opacity="0.85">
      <ellipse cx="112" cy="150" rx="6" ry="3.4" fill="#F8C4D6" transform="rotate(-24 112 150)"/>
      <ellipse cx="392" cy="182" rx="5" ry="3" fill="#EBD9F8" transform="rotate(32 392 182)"/>
      <ellipse cx="96" cy="228" rx="4" ry="2.4" fill="#F8C4D6" transform="rotate(12 96 228)"/>
      <ellipse cx="400" cy="266" rx="4.6" ry="2.6" fill="#F5D37E" transform="rotate(-16 400 266)"/>
    </g>`;

    return `<svg class="cake-svg" viewBox="0 0 500 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="An illustrated three-tier birthday cake with ${n} glowing candles">${s}</svg>`;
  }

  function gift() {
    const gb = nextId('gb'), gr = nextId('gr'), gl = nextId('gg');
    return `<svg class="gift-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A glowing gift box tied with ribbon">
      <defs>${defsGrad(gb, [[0, '#F9C6D6'], [1, '#E995B2']], '0.2', '1')}
      ${defsGrad(gr, [[0, '#F3D9A4'], [1, '#D8A1A9']], '0', '1')}
      ${defsRad(gl, [[0, '#FFF3C9', 0.75], [1, '#FFF3C9', 0]], '50%', '50%', '50%')}</defs>
      <circle cx="100" cy="106" r="86" fill="url(#${gl})"/>
      <ellipse cx="100" cy="176" rx="62" ry="10" fill="#8C6F86" opacity="0.16"/>
      <rect x="38" y="92" width="124" height="80" rx="10" fill="url(#${gb})" ${ink('#B96A8D', 1.2, 0.3)}/>
      <rect x="88" y="92" width="24" height="80" fill="url(#${gr})" opacity="0.95"/>
      <rect x="30" y="72" width="140" height="30" rx="9" fill="#FBD9E4" ${ink('#B96A8D', 1.2, 0.3)}/>
      <rect x="88" y="72" width="24" height="30" fill="url(#${gr})"/>
      <g transform="translate(100 72)">
        <path d="M0 0 C -34 -6 -38 -38 -16 -36 C -4 -35 -1 -16 0 0 Z" fill="url(#${gr})" opacity="0.98"/>
        <path d="M0 0 C 34 -6 38 -38 16 -36 C 4 -35 1 -16 0 0 Z" fill="url(#${gr})" opacity="0.9"/>
        <circle r="7" fill="#F6E3B8"/>
        <circle r="3" fill="#E7C57F"/>
      </g>
      <path d="M38 100 C 60 108 80 108 100 104 C 120 108 140 108 162 100" fill="none" stroke="#FFF3F7" stroke-width="2" stroke-opacity="0.5"/>
      <g fill="#FFF6DA" opacity="0.95">
        <path d="M152 62 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3 Z"/>
        <path d="M48 120 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 Z" opacity="0.7"/>
        <path d="M138 148 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" opacity="0.6"/>
      </g>
    </svg>`;
  }

  function wishingStar() {
    const g = nextId('ws'), gl = nextId('wsg');
    return `<svg class="star-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A glowing wishing star">
      <defs>${defsRad(gl, [[0, '#FFF6D0', 0.85], [0.6, '#F9D98A', 0.28], [1, '#F9D98A', 0]], '50%', '50%', '50%')}
      ${defsGrad(g, [[0, '#FFF9E3'], [0.55, '#FCE3A0'], [1, '#E9B45C']], '0.3', '1')}</defs>
      <circle cx="100" cy="98" r="94" fill="url(#${gl})"/>
      <g class="star-svg__core">
        <path d="M100 22 L114 78 L170 92 L114 106 L100 162 L86 106 L30 92 L86 78 Z" fill="url(#${g})" ${ink('#D9A24C', 1.2, 0.35)}/>
        <path d="M100 44 L109 82 L146 92 L109 102 L100 138 L91 102 L54 92 L91 82 Z" fill="#FFFDF2" opacity="0.7"/>
        <circle cx="100" cy="92" r="7" fill="#FFFDF4"/>
      </g>
      <g class="star-svg__sparkles" fill="#FFF6DA">
        <path d="M152 40 l2.4 7 7 2.4 -7 2.4 -2.4 7 -2.4 -7 -7 -2.4 7 -2.4 Z"/>
        <path d="M46 128 l2 5.6 5.6 2 -5.6 2 -2 5.6 -2 -5.6 -5.6 -2 5.6 -2 Z" opacity="0.85"/>
        <path d="M148 138 l1.8 5 5 1.8 -5 1.8 -1.8 5 -1.8 -5 -5 -1.8 5 -1.8 Z" opacity="0.7"/>
      </g>
    </svg>`;
  }

  function butterfly(opts = {}) {
    const hue = opts.hue || 'rose';
    const sets = {
      rose: { a: '#FCE1EA', b: '#F5A9C2', c: '#D9739A' },
      lilac: { a: '#EFE4FB', b: '#C9B0EE', c: '#9C7FD4' },
      gold: { a: '#FFF2D4', b: '#F7D08A', c: '#D9A24C' },
      sky: { a: '#E1F1FA', b: '#A9D4EE', c: '#6FA9CF' }
    };
    const c = sets[hue] || sets.rose;
    const id = nextId('bf');
    return `<svg class="butterfly-svg" viewBox="0 0 160 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A pastel butterfly">
      <defs>${defsGrad(id, [[0, c.a], [1, c.c]], '0.2', '1')}</defs>
      <g class="butterfly-svg__body">
        <ellipse cx="80" cy="74" rx="5.2" ry="26" fill="#7A5A6B"/>
        <circle cx="80" cy="44" r="7" fill="#8B6579"/>
        <path d="M80 40 C 72 28 62 24 54 22" fill="none" stroke="#8B6579" stroke-width="2" stroke-linecap="round"/>
        <path d="M80 40 C 88 28 98 24 106 22" fill="none" stroke="#8B6579" stroke-width="2" stroke-linecap="round"/>
        <circle cx="53" cy="21" r="2.4" fill="#8B6579"/><circle cx="107" cy="21" r="2.4" fill="#8B6579"/>
      </g>
      <g class="butterfly-svg__wing butterfly-svg__wing--l">
        <path d="M78 66 C 46 32 10 34 14 66 C 17 92 52 94 78 84 Z" fill="url(#${id})" ${ink('#B27A94', 1, 0.35)}/>
        <path d="M78 88 C 50 92 22 104 30 122 C 38 136 66 118 78 100 Z" fill="url(#${id})" ${ink('#B27A94', 1, 0.32)}/>
        <ellipse cx="44" cy="64" rx="11" ry="7" fill="#FFFDFB" opacity="0.55" transform="rotate(-12 44 64)"/>
        <circle cx="34" cy="110" r="4" fill="#FFFDFB" opacity="0.5"/>
      </g>
      <g class="butterfly-svg__wing butterfly-svg__wing--r">
        <path d="M82 66 C 114 32 150 34 146 66 C 143 92 108 94 82 84 Z" fill="url(#${id})" ${ink('#B27A94', 1, 0.35)}/>
        <path d="M82 88 C 110 92 138 104 130 122 C 122 136 94 118 82 100 Z" fill="url(#${id})" ${ink('#B27A94', 1, 0.32)}/>
        <ellipse cx="116" cy="64" rx="11" ry="7" fill="#FFFDFB" opacity="0.55" transform="rotate(12 116 64)"/>
        <circle cx="126" cy="110" r="4" fill="#FFFDFB" opacity="0.5"/>
      </g>
    </svg>`;
  }

  function lantern() {
    const g = nextId('ln'), gl = nextId('lng');
    return `<svg class="lantern-svg" viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A softly glowing paper lantern">
      <defs>${defsRad(g, [[0, '#FFE6B4'], [0.55, '#F7C079'], [1, '#D98B54']], '50%', '45%', '65%')}
      ${defsRad(gl, [[0, '#FFD89A', 0.55], [1, '#FFD89A', 0]], '50%', '50%', '50%')}</defs>
      <circle cx="60" cy="104" r="62" fill="url(#${gl})"/>
      <path d="M60 8 L60 26" stroke="#8B6A55" stroke-width="2"/>
      <rect x="44" y="24" width="32" height="9" rx="4" fill="#9A7A5E"/>
      <ellipse cx="60" cy="104" rx="42" ry="52" fill="url(#${g})" ${ink('#B37A50', 1, 0.32)}/>
      <path d="M22 92 Q 60 104 98 92 M22 114 Q 60 126 98 114" fill="none" stroke="#C98A5E" stroke-width="1.2" stroke-opacity="0.45"/>
      <ellipse cx="60" cy="104" rx="14" ry="52" fill="none" stroke="#FFF0CE" stroke-width="1.4" stroke-opacity="0.35"/>
      <rect x="46" y="152" width="28" height="8" rx="4" fill="#9A7A5E"/>
      <path d="M60 160 L60 176" stroke="#C98A5E" stroke-width="1.6"/>
      <path d="M60 176 C 56 182 62 184 60 190" fill="none" stroke="#E0A96F" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`;
  }

  function torii() {
    const g = nextId('tr');
    return `<svg class="torii-svg" viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A traditional torii gate illustration">
      <defs>${defsGrad(g, [[0, '#E9B9A6'], [1, '#CF8F80']], '0', '1')}</defs>
      <ellipse cx="120" cy="188" rx="96" ry="9" fill="#8C6F86" opacity="0.12"/>
      <path d="M18 30 C 60 20 180 20 222 30 L 214 42 C 176 34 64 34 26 42 Z" fill="url(#${g})"/>
      <rect x="30" y="52" width="180" height="12" rx="4" fill="#DBA18F"/>
      <rect x="52" y="64" width="14" height="122" rx="4" fill="#E3AE9B"/>
      <rect x="174" y="64" width="14" height="122" rx="4" fill="#E3AE9B"/>
      <rect x="104" y="42" width="32" height="24" rx="4" fill="#DBA18F" opacity="0.9"/>
      <rect x="52" y="46" width="14" height="16" fill="#D8978A"/>
      <rect x="174" y="46" width="14" height="16" fill="#D8978A"/>
      <rect x="60" y="104" width="120" height="9" rx="4" fill="#DBA18F"/>
      <ellipse cx="59" cy="186" rx="16" ry="5" fill="#C9A892" opacity="0.5"/>
      <ellipse cx="181" cy="186" rx="16" ry="5" fill="#C9A892" opacity="0.5"/>
      <g opacity="0.85">
        <ellipse cx="42" cy="70" rx="7" ry="4" fill="#F7C3D5" transform="rotate(-28 42 70)"/>
        <ellipse cx="206" cy="112" rx="6" ry="3.4" fill="#F7C3D5" transform="rotate(24 206 112)"/>
      </g>
    </svg>`;
  }

  function mountainLayers() {
    const a = nextId('mt'), b = nextId('mt');
    return `<svg class="mountain-svg" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true">
      <defs>${defsGrad(a, [[0, '#C9B7DE'], [1, '#A995C7']], '0', '1')}${defsGrad(b, [[0, '#B7A6D6'], [1, '#8E7DB4']], '0', '1')}</defs>
      <path d="M0 200 L0 132 L74 78 L128 112 L196 52 L268 120 L338 62 L408 116 L482 66 L548 110 L600 84 L600 200 Z" fill="url(#${a})" opacity="0.75"/>
      <path d="M0 200 L0 168 L70 128 L146 162 L214 118 L286 158 L362 120 L436 156 L512 128 L600 154 L600 200 Z" fill="url(#${b})" opacity="0.85"/>
    </svg>`;
  }

  function clouds() {
    return `<svg class="cloud-svg" viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g fill="#FFFFFF" opacity="0.85">
        <ellipse cx="120" cy="96" rx="86" ry="30"/>
        <ellipse cx="86" cy="78" rx="44" ry="34"/>
        <ellipse cx="150" cy="70" rx="52" ry="42"/>
        <ellipse cx="196" cy="88" rx="42" ry="28"/>
      </g>
    </svg>`;
  }

  function sprig(size = 1) {
    return `<svg class="sprig-svg" viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="--s:${size}">
      <g stroke="#A9C6A0" stroke-width="3" fill="none" stroke-linecap="round">
        <path d="M10 108 C 50 92 92 60 148 12"/>
        <path d="M52 86 C 60 74 74 70 86 68"/>
        <path d="M88 58 C 96 46 110 42 122 40"/>
      </g>
      <g fill="#F7B4C9">
        <circle cx="86" cy="68" r="7"/><circle cx="122" cy="40" r="6"/><circle cx="46" cy="92" r="5"/>
      </g>
      <g fill="#FFF1F6">
        <circle cx="86" cy="68" r="3"/><circle cx="122" cy="40" r="2.6"/>
      </g>
      <ellipse cx="68" cy="80" rx="7" ry="4" fill="#C9DDBF" transform="rotate(-28 68 80)"/>
      <ellipse cx="104" cy="52" rx="6" ry="3.4" fill="#C9DDBF" transform="rotate(-24 104 52)"/>
    </svg>`;
  }

  function moon() {
    const g = nextId('mn'), gl = nextId('mng');
    return `<svg class="moon-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>${defsRad(gl, [[0, '#FFF7E0', 0.6], [0.55, '#F6E6C8', 0.22], [1, '#F6E6C8', 0]], '50%', '50%', '50%')}
      ${defsRad(g, [[0, '#FFFDF4'], [0.7, '#F8EED6'], [1, '#EADFC4']], '42%', '38%', '62%')}</defs>
      <circle cx="100" cy="100" r="98" fill="url(#${gl})"/>
      <circle cx="100" cy="100" r="52" fill="url(#${g})"/>
      <g fill="#E6DAC2" opacity="0.55">
        <ellipse cx="86" cy="88" rx="12" ry="10"/><ellipse cx="118" cy="110" rx="8" ry="7"/>
        <ellipse cx="104" cy="74" rx="6" ry="5"/><ellipse cx="80" cy="118" rx="5" ry="4.4"/>
      </g>
    </svg>`;
  }

  /* ---------------------------------------------------------------- icons */
  const ICON_PATHS = {
    music: '<path d="M9 18V6l11-2.4v11.2"/><circle cx="6.4" cy="18" r="2.8"/><circle cx="17.4" cy="14.8" r="2.8"/>',
    musicOff: '<path d="M9 18V6l11-2.4v11.2"/><circle cx="6.4" cy="18" r="2.8"/><circle cx="17.4" cy="14.8" r="2.8"/><path d="M3 3l18 18"/>',
    sound: '<path d="M4 9.5h3.2L12 5.2v13.6L7.2 14.5H4z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6"/><path d="M18 6.4a7.8 7.8 0 0 1 0 11.2"/>',
    soundOff: '<path d="M4 9.5h3.2L12 5.2v13.6L7.2 14.5H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
    lock: '<rect x="4.8" y="10.4" width="14.4" height="10.4" rx="3"/><path d="M8.4 10.4V7.6a3.6 3.6 0 0 1 7.2 0v2.8"/><circle cx="12" cy="15.4" r="1.5"/>',
    unlock: '<rect x="4.8" y="10.4" width="14.4" height="10.4" rx="3"/><path d="M8.4 10.4V7.6a3.6 3.6 0 0 1 6.6-2"/><circle cx="12" cy="15.4" r="1.5"/>',
    arrowLeft: '<path d="M14.5 5.5 8 12l6.5 6.5"/><path d="M8 12h11"/>',
    arrowRight: '<path d="M9.5 5.5 16 12l-6.5 6.5"/><path d="M16 12H5"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    home: '<path d="M4 11.2 12 4.4l8 6.8"/><path d="M6.4 10v9.2h11.2V10"/><path d="M10.2 19.2v-4.4h3.6v4.4"/>',
    replay: '<path d="M4.6 12a7.4 7.4 0 1 0 2.6-5.6"/><path d="M4.4 4.6v4.6h4.6"/>',
    star: '<path d="M12 3.6l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17.4l-5.4 2.9 1.1-6.1L3.2 10l6.1-.8z"/>',
    flower: '<circle cx="12" cy="9.4" r="2.2"/><path d="M12 7.2c0-2.2 1-3.6 0-4.6-1 1 0 2.4 0 4.6zM13.9 10.6c2-.9 3.6-.6 4-2-.9-.9-2.6.4-4 2zM10.1 10.6c-2-.9-3.6-.6-4-2 .9-.9 2.6.4 4 2zM12 11.6c.4 2.2-.2 3.8 1 4.4 1-1-.3-2.6-1-4.4z"/><path d="M12 16.6V21"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    cake: '<path d="M4.4 20.4h15.2"/><path d="M5.6 20.2v-5.6c0-1.2 1-2.2 2.2-2.2h8.4c1.2 0 2.2 1 2.2 2.2v5.6"/><path d="M5.6 16.4c1.4 1.2 2.6 1.2 4 0s2.6-1.2 4 0 2.6 1.2 4 0"/><path d="M12 11.8V8.6"/><path d="M12 8.2c-1.1-1.2-.4-2.3.4-3.4.7 1.1 1.4 2.2.3 3.4z"/>',
    envelope: '<rect x="3.4" y="6" width="17.2" height="12.4" rx="2.4"/><path d="m4.6 7.6 7.4 5.6 7.4-5.6"/>',
    mountain: '<path d="M3 19.4 9 8.6l3.4 5.6 2-3 4.6 8.2z"/><path d="M7.8 19.4 9 17.2l1.4 2.2"/>',
    sprout: '<path d="M12 20.4v-6.8"/><path d="M12 13.6C12 9.8 9.2 7.4 5.4 7.4c0 3.8 2.8 6.2 6.6 6.2z"/><path d="M12 13.6c0-3.2 2.4-5.6 6.4-5.6 0 3.4-2.6 5.6-6.4 5.6z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7"/>',
    torii: '<path d="M3.4 6.4c5.6-1.2 11.6-1.2 17.2 0l-.8 2c-5.2-1-10.4-1-15.6 0z"/><path d="M5.6 9.4h12.8"/><path d="M7.4 11v9M16.6 11v9"/>',
    petals: '<path d="M12 4c3 0 4.6 2.2 4.6 4.6S14.8 14 12 14s-4.6-3-4.6-5.4S9 4 12 4z"/><path d="M12 14v6"/><path d="M8.6 16.4c1 .8 2.2 1.4 3.4 1.4"/>',
    check: '<path d="M5 12.6l4.4 4.4L19 7.4"/>',
    flame: '<path d="M12 20.4c3.2 0 5.4-2 5.4-5 0-3.8-3.4-5.4-3.4-9.4-2 .8-3 2.4-3 4.4 0 1.4.6 2.2.6 3-1.4-.6-2.2-2-2.2-3.6-1.6 1.4-2.8 3.4-2.8 5.6 0 3 2.2 5 5.4 5z"/>'
  };

  function icon(name, opts = {}) {
    const d = ICON_PATHS[name] || ICON_PATHS.sparkle;
    const filled = ['star', 'sparkle', 'flame'].includes(name);
    const stroke = opts.stroke || 'currentColor';
    return `<svg class="icon icon--${name}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"
      fill="${filled ? stroke : 'none'}" stroke="${filled ? 'none' : stroke}"
      stroke-width="${opts.weight || 1.7}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  }

  /* --------------------------------------------------------- background */
  function petal(seed = 1) {
    const p = ['#F9C9D9', '#F5B3C8', '#FBE0E8', '#EFC7E4'][seed % 4];
    return `<svg class="petal-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 2 C 19 6 21 12 18 17 C 15.4 21.4 8.6 21.4 6 17 C 3 12 5 6 12 2 Z" fill="${p}"/>
      <path d="M12 3.4 C 15 8 15.6 13 14 19" fill="none" stroke="#FFFFFF" stroke-width="1.1" stroke-opacity="0.5"/>
    </svg>`;
  }

  const api = {
    flower, flowerRose, flowerTulip, flowerLily, flowerSunflower, flowerSakura,
    flowerDaisy, flowerLavender, sakuraBlossom,
    cake, gift, wishingStar, butterfly, lantern, torii, mountainLayers, clouds,
    sprig, moon, icon, petal, PALETTES, ICON_PATHS
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.LWOWArt = api;
  if (typeof window !== 'undefined') window.LWOWArt = api;
})(typeof window !== 'undefined' ? window : globalThis);
