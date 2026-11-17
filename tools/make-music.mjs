/* ==========================================================================
   tools/make-music.mjs
   --------------------------------------------------------------------------
   Generates the original instrumental used by the site:
     assets/music/petals-at-dusk.mp3

   Nothing is sampled or downloaded — the whole track is synthesised here
   (harp-like plucks, a warm pad, a soft bass and a Schroeder reverb) on a
   Japanese pentatonic scale, then encoded to MP3 with lamejs.

   Usage:  node tools/make-music.mjs
   (requires the dev-only package "@breezystack/lamejs"; see README)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import lamejs from '@breezystack/lamejs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'assets', 'music');
const SR = 44100;

/* ------------------------------------------------------------------ music */
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
// Ashiya / "Yo" pentatonic flavour: D E G A B
const SCALE = [62, 64, 67, 69, 71, 74, 76, 79, 81, 83, 86]; // D4 … D6

const BPM = 62;
const BEAT = 60 / BPM;          // ~0.968s
const BAR = BEAT * 4;           // ~3.871s
const BARS = 24;                // ~93s
const DURATION = BAR * BARS;
const N = Math.ceil(DURATION * SR);

const L = new Float32Array(N);
const R = new Float32Array(N);

function addVoice(startSec, freq, { amp = 0.2, decay = 1.6, pan = 0, kind = 'pluck', attack = 0.006 } = {}) {
  const start = Math.floor(startSec * SR);
  const len = Math.floor(Math.min(decay * 4.2, DURATION - startSec) * SR);
  if (len <= 0) return;
  const gl = Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = Math.sin(((pan + 1) * Math.PI) / 4);
  const harmonics = kind === 'pluck'
    ? [[1, 1], [2, 0.34], [3, 0.16], [4, 0.075], [5, 0.035], [6.02, 0.018]]
    : [[1, 1], [2, 0.12], [3, 0.05]];
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.min(1, t / attack) * Math.exp(-t / (decay * 0.42));
    if (env < 1e-4) continue;
    let s = 0;
    for (const [h, a] of harmonics) {
      const detune = 1 + (h - 1) * 0.0008;
      s += a * Math.sin(2 * Math.PI * freq * h * detune * t);
    }
    // gentle low-pass-ish softening of the attack transient
    const soften = 1 - 0.35 * Math.exp(-t / 0.02);
    const v = s * env * amp * soften;
    const idx = start + i;
    L[idx] += v * gl;
    R[idx] += v * gr;
  }
}

function addPad(startSec, freq, durSec, { amp = 0.05, pan = 0 } = {}) {
  const start = Math.floor(startSec * SR);
  const len = Math.floor(durSec * SR);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < len && start + i < N; i++) {
    const t = i / SR;
    const a = Math.min(1, t / 2.2);
    const r = Math.min(1, (durSec - t) / 2.4);
    const env = Math.max(0, Math.min(a, r));
    const vib = 1 + 0.0016 * Math.sin(2 * Math.PI * 0.21 * t);
    let s = Math.sin(2 * Math.PI * freq * vib * t) * 0.6
      + Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.14
      + Math.sin(2 * Math.PI * freq * 2 * t) * 0.06;
    s += 0.012 * Math.sin(2 * Math.PI * (freq * 0.5) * t);
    const v = s * amp * env * (0.92 + 0.08 * Math.sin(2 * Math.PI * 0.13 * t));
    L[start + i] += v * gl;
    R[start + i] += v * gr;
  }
}

/* deterministic random */
let seed = 20261119;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

/* a slow, breathing chord bed: Dmaj7 → Bm7 → Gmaj7 → A(sus) */
const CHORDS = [
  [50, 57, 62, 66], // D  A  D  F#
  [47, 54, 59, 62], // B  F# B  D
  [43, 50, 55, 59], // G  D  G  B
  [45, 52, 57, 64]  // A  E  A  E
];

for (let bar = 0; bar < BARS; bar++) {
  const t0 = bar * BAR;
  const chord = CHORDS[bar % CHORDS.length];

  // pad: two octaves of the chord, very quiet
  chord.forEach((n, i) => addPad(t0, midi(n), BAR * 1.05, { amp: 0.035, pan: (i - 1.5) * 0.25 }));
  addPad(t0, midi(chord[0] - 12), BAR * 1.05, { amp: 0.045 });

  // bass: root on beat 1, fifth on beat 3
  addVoice(t0, midi(chord[0] - 12), { amp: 0.16, decay: 2.4, pan: 0, kind: 'pluck' });
  if (bar % 2 === 1) addVoice(t0 + BEAT * 2, midi(chord[0] - 5), { amp: 0.1, decay: 2.0 });

  // arpeggio, eighth notes, sprinkled rests for air
  const octaveUp = bar % 4 === 2 ? 12 : 0;
  const pattern = [0, 1, 2, 3, 2, 1, 3, 2];
  for (let step = 0; step < 8; step++) {
    if (step === 5 && bar % 3 !== 0) continue;
    if (step === 7 && bar % 2 === 0) continue;
    const noteIdx = pattern[step];
    const n = chord[noteIdx % chord.length] + octaveUp;
    const jitter = (rand() - 0.5) * 0.012;
    addVoice(t0 + step * BEAT * 0.5 + jitter, midi(n + 12), {
      amp: 0.085 + rand() * 0.03,
      decay: 1.5 + rand() * 0.7,
      pan: (rand() - 0.5) * 1.1
    });
  }

  // a high, glassy sparkle every other bar
  if (bar % 2 === 1) {
    const n = SCALE[Math.floor(rand() * SCALE.length)] + 12;
    addVoice(t0 + BEAT * (2 + Math.floor(rand() * 2)), midi(n), { amp: 0.042, decay: 2.6, pan: (rand() - 0.5) * 1.4 });
  }
}

/* ------------------------------------------------------- Schroeder reverb */
function reverb(input, { room = 0.84, damp = 0.28, wet = 0.42 } = {}) {
  const combs = [1557, 1617, 1491, 1422].map((d) => Math.round(d * SR / 44100));
  const aps = [556, 441].map((d) => Math.round(d * SR / 44100));
  const out = new Float32Array(input.length);
  const combBufs = combs.map((d) => new Float32Array(d));
  const combIdx = new Array(combs.length).fill(0);
  const combStore = new Float32Array(combs.length);
  const apBufs = aps.map((d) => new Float32Array(d));
  const apIdx = new Array(aps.length).fill(0);

  for (let i = 0; i < input.length; i++) {
    const x = input[i];
    let acc = 0;
    for (let c = 0; c < combs.length; c++) {
      const y = combBufs[c][combIdx[c]];
      combStore[c] = y * (1 - damp) + combStore[c] * damp;
      combBufs[c][combIdx[c]] = x + combStore[c] * room;
      combIdx[c] = (combIdx[c] + 1) % combs[c].length;
      acc += y;
    }
    acc *= 0.25;
    for (let a = 0; a < aps.length; a++) {
      const buf = apBufs[a];
      const idx = apIdx[a];
      const bufout = buf[idx];
      const y = -acc + bufout;
      buf[idx] = acc + bufout * 0.5;
      apIdx[a] = (idx + 1) % buf.length;
      acc = y;
    }
    out[i] = input[i] * (1 - wet) + acc * wet;
  }
  return out;
}

const wl = reverb(L, { room: 0.86, damp: 0.3, wet: 0.5 });
const wr = reverb(R, { room: 0.83, damp: 0.32, wet: 0.5 });

/* --------------------------------------------------------- master + fade */
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(wl[i]), Math.abs(wr[i]));
const gain = 0.82 / (peak || 1);
const fadeIn = Math.floor(SR * 2.2);
const fadeOut = Math.floor(SR * 3.2);
const outL = new Int16Array(N);
const outR = new Int16Array(N);
for (let i = 0; i < N; i++) {
  let env = 1;
  if (i < fadeIn) env = i / fadeIn;
  if (i > N - fadeOut) env = Math.min(env, (N - i) / fadeOut);
  const l = Math.tanh(wl[i] * gain * env * 1.12) * 0.92;
  const r = Math.tanh(wr[i] * gain * env * 1.12) * 0.92;
  outL[i] = Math.max(-32768, Math.min(32767, Math.round(l * 32767)));
  outR[i] = Math.max(-32768, Math.min(32767, Math.round(r * 32767)));
}

/* ------------------------------------------------------------ mp3 encode */
fs.mkdirSync(OUT, { recursive: true });
const enc = new lamejs.Mp3Encoder(2, SR, 80);
const block = 1152;
const chunks = [];
for (let i = 0; i < N; i += block) {
  const l = outL.subarray(i, Math.min(i + block, N));
  const r = outR.subarray(i, Math.min(i + block, N));
  const buf = enc.encodeBuffer(l, r);
  if (buf.length) chunks.push(Buffer.from(buf));
}
const tail = enc.flush();
if (tail.length) chunks.push(Buffer.from(tail));
const mp3 = Buffer.concat(chunks);
const file = path.join(OUT, 'petals-at-dusk.mp3');
fs.writeFileSync(file, mp3);
console.log(`wrote ${path.relative(process.cwd(), file)} — ${(mp3.length / 1024).toFixed(0)} KB, ${DURATION.toFixed(1)}s`);
