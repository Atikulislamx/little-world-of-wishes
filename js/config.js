/* ==========================================================================
   Little World of Wishes — Central Configuration
   --------------------------------------------------------------------------
   Everything personal about the experience lives in this one file:
   the secret PIN, the date, the letter, the 19 wishes, the five dreams,
   the three surprises and the soundtrack.

   You can safely edit any text between quotes. After editing, keep the
   syntax intact (commas between entries, matching quotes) and reload.

   NOTE ON THE PIN: this is a front-end only "aesthetic gate". It keeps the
   surprise hidden from a casual visitor but it is NOT real security — anyone
   with developer tools can read this file. Please don't reuse an important
   PIN here.
   ========================================================================== */

window.LWOW_CONFIG = {
  /* ---------------------------------------------------------------------
     1. THE SECRET GATE
     --------------------------------------------------------------------- */
  pin: {
    code: '1119',              // 4 digits — the birthday, November 19
    length: 4,                 // must match the number of digits above
    storageKey: 'lwow.unlocked',   // sessionStorage key (cleared by "lock" button)
    maxAttemptsHint: 3         // after this many misses show a gentle hint
  },

  /* ---------------------------------------------------------------------
     2. THE DATE
     --------------------------------------------------------------------- */
  birthday: {
    iso: '2026-11-19',
    display: 'November 19, 2026',
    short: '19 · 11 · 2026',
    monthDay: 'November 19'
  },

  /* ---------------------------------------------------------------------
     3. THEME
     --------------------------------------------------------------------- */
  theme: {
    /* These are the palette swatches the artwork and CSS were designed with.
       They are a reference card, not a live colour switcher: the stylesheet
       holds the real values in css/global.css (search for :root). */
    cream: '#FFF8F0',
    softPink: '#FCE4EC',
    primaryPink: '#F5B8CE',
    lavender: '#DCCCF5',
    plum: '#483449',
    roseGold: '#D8A1A9',
    white: '#FFFFFF',
    // how many drifting petals / fireflies / stars the background layer draws.
    // Lower these if you want an even lighter page.
    particles: { petals: 18, sparkles: 22, fireflies: 14 },
    // "auto" follows the route, or force one backdrop for every page:
    // 'sakuraGate' | 'gardenMorning' | 'festivalGlow' | 'gardenWishes' |
    // 'letterDesk' | 'dreamsSky' | 'eveningMagic' | 'nightGarden'
    backdropOverride: null
  },

  /* ---------------------------------------------------------------------
     4. AUDIO
     --------------------------------------------------------------------- */
  audio: {
    enabled: true,                 // set false to hide the music button everywhere
    src: 'assets/music/petals-at-dusk.mp3',
    title: 'Petals at Dusk',
    subtitle: 'an original instrumental lullaby',
    volume: 0.38,
    fadeInMs: 2600,
    fadeOutMs: 700,
    loop: true
    // Music always starts muted and only begins after a real tap/click.
  },

  /* ---------------------------------------------------------------------
     5. NAVIGATION (order of the eight pages)
     --------------------------------------------------------------------- */
  journey: [
    { file: 'index.html',       label: 'The Secret Gate',   step: '01' },
    { file: 'welcome.html',     label: 'A Warm Welcome',    step: '02' },
    { file: 'celebration.html', label: 'The Celebration',   step: '03' },
    { file: 'garden.html',      label: 'A Garden of Wishes',step: '04' },
    { file: 'letter.html',      label: 'A Little Note',     step: '05' },
    { file: 'dreams.html',      label: 'Dreams & Destinations', step: '06' },
    { file: 'surprise.html',    label: 'A Little Extra Magic', step: '07' },
    { file: 'finale.html',      label: 'A Beautiful Tomorrow', step: '08' }
  ],

  /* ---------------------------------------------------------------------
     6. SMALL UI STRINGS
     --------------------------------------------------------------------- */
  ui: {
    siteName: 'Little World of Wishes',
    tagline: 'created to make your special day a little more magical',
    backLabel: 'Back',
    homeLabel: 'Home',
    lockLabel: 'Lock this world',
    lockConfirm: 'Lock the little world again? You will need the PIN to return.',
    musicOn: 'Turn music on',
    musicOff: 'Turn music off',
    soundOn: 'Turn sounds on',
    soundOff: 'Turn sounds off',
    musicUnavailable: 'Soundtrack unavailable',
    musicError: 'The soundtrack could not be loaded — everything else works as usual.'
  },

  /* ---------------------------------------------------------------------
     7. PAGE 02 — WELCOME
     --------------------------------------------------------------------- */
  welcome: {
    eyebrow: 'The gate is open',
    heading: 'Welcome to Your Little World',
    body: 'A tiny corner filled with flowers, smiles, and beautiful wishes, created to make your special day a little more magical.',
    cta: 'Begin the Journey'
  },

  /* ---------------------------------------------------------------------
     8. PAGE 03 — CELEBRATION
     --------------------------------------------------------------------- */
  celebration: {
    heading: 'Happy Birthday!',
    body: 'Today is all about celebrating you and the wonderful person you continue to become.',
    cakeCandles: 5,
    cakeHint: 'Five little candles, one quiet wish — tap each flame.',
    candlesOut: 'The candles are out. May every wish you keep today find its way to you.',
    cakeAgain: 'Light them again',
    cta: 'Explore Your Garden'
  },

  /* ---------------------------------------------------------------------
     9. PAGE 04 — GARDEN OF WISHES (19 flowers, 19 wishes)
     --------------------------------------------------------------------- */
  garden: {
    intro: '19 Flowers, 19 Beautiful Wishes',
    body: 'A garden planted for you. Touch a flower and let its wish bloom.',
    cta: 'Continue to Your Little Note',
    closing: 'Every flower here holds one wish — and every one of them is yours.',
    flowers: [
      { type: 'rose',        name: 'A Rose',          wish: 'May happiness find you every day.' },
      { type: 'tulip',       name: 'A Tulip',         wish: 'May your dreams become beautiful realities.' },
      { type: 'lily',        name: 'A Lily',          wish: 'May you always have reasons to smile.' },
      { type: 'sunflower',   name: 'A Sunflower',     wish: 'May success follow your dedication.' },
      { type: 'sakura',      name: 'A Cherry Blossom',wish: 'May your journey be filled with wonderful discoveries.' },
      { type: 'daisy',       name: 'A Daisy',         wish: 'May peace accompany every step you take.' },
      { type: 'lavender',    name: 'Lavender',        wish: 'May your confidence grow stronger every day.' },
      { type: 'rose',        name: 'A Rose',          wish: 'May life surprise you with beautiful opportunities.' },
      { type: 'tulip',       name: 'A Tulip',         wish: 'May your hard work bring meaningful rewards.' },
      { type: 'lily',        name: 'A Lily',          wish: 'May you always believe in your potential.' },
      { type: 'sunflower',   name: 'A Sunflower',     wish: 'May your days be filled with kindness.' },
      { type: 'sakura',      name: 'A Cherry Blossom',wish: 'May new adventures bring you joy.' },
      { type: 'daisy',       name: 'A Daisy',         wish: 'May you find beauty in little things.' },
      { type: 'lavender',    name: 'Lavender',        wish: 'May every challenge make you stronger.' },
      { type: 'rose',        name: 'A Rose',          wish: 'May your future shine with possibilities.' },
      { type: 'tulip',       name: 'A Tulip',         wish: 'May you always have the courage to dream.' },
      { type: 'lily',        name: 'A Lily',          wish: 'May your efforts lead to great achievements.' },
      { type: 'sunflower',   name: 'A Sunflower',     wish: 'May your life be surrounded by positivity.' },
      { type: 'sakura',      name: 'A Cherry Blossom',wish: 'May this new chapter be your most beautiful one yet.' }
    ]
  },

  /* ---------------------------------------------------------------------
     10. PAGE 05 — THE LETTER
     --------------------------------------------------------------------- */
  letter: {
    eyebrow: 'A little note',
    heading: 'Something I Wanted to Say',
    intro: 'A letter was left here for you. Take a breath, then open it.',
    openButton: 'Open Your Letter',
    closeButton: 'Fold the letter',
    salutation: 'Happy Birthday!',
    paragraphs: [
      'I hope your special day brings you countless smiles, peaceful moments, and beautiful memories.',
      'May the coming year open doors to exciting opportunities, meaningful achievements, and wonderful experiences.',
      'Keep believing in yourself, keep exploring new possibilities, and never stop growing into the person you aspire to be.',
      'Wishing you happiness, success, good health, and endless reasons to smile.',
      'Have a truly beautiful birthday!'
    ],
    signature: 'With Best Wishes',
    postscript: 'Delivered by hand, to your little world.',
    cta: 'Continue to Your Dreams'
  },

  /* ---------------------------------------------------------------------
     11. PAGE 06 — DREAMS AND DESTINATIONS
     --------------------------------------------------------------------- */
  dreams: {
    eyebrow: 'Dreams & destinations',
    heading: 'A Beautiful Future Awaits',
    body: 'Five little doors into what is coming for you. Each one is already open.',
    cta: 'Discover Another Surprise',
    cards: [
      { key: 'dream',    title: 'Dream Big',              text: 'May you always have the courage to pursue your dreams.', icon: 'star',    tone: 'rose' },
      { key: 'grow',     title: 'Keep Growing',           text: 'May every experience help you discover new strengths.', icon: 'sprout',  tone: 'sage' },
      { key: 'happy',    title: 'Find Happiness',         text: 'May your everyday life bring moments worth remembering.', icon: 'sun',     tone: 'gold' },
      { key: 'achieve',  title: 'Achieve Great Things',   text: 'May your dedication lead you towards meaningful success.', icon: 'mountain',tone: 'lavender' },
      { key: 'begin',    title: 'Embrace New Beginnings', text: 'May every new chapter bring exciting possibilities.', icon: 'torii',   tone: 'peach' }
    ]
  },

  /* ---------------------------------------------------------------------
     12. PAGE 07 — A LITTLE EXTRA MAGIC
     --------------------------------------------------------------------- */
  surprise: {
    eyebrow: 'A little extra magic',
    heading: 'Three Little Surprises',
    body: 'The lanterns are lit and the fireflies have come out. Something is waiting behind each glow.',
    cta: 'One Last Little Wish',
    progress: 'surprises found',
    allFound: 'You found all three. Look up — the garden is celebrating with you.',
    items: [
      { key: 'gift',     label: 'The Mystery Gift',   hint: 'A ribboned box, humming softly.',    message: 'May today bring you unexpected happiness.' },
      { key: 'star',     label: 'The Wishing Star',   hint: 'A star that leans a little closer.', message: 'Every new day is another chance to create something wonderful.' },
      { key: 'butterfly', label: 'The Wandering Butterfly', hint: 'Something small and bright.',  message: 'Keep shining in your own beautiful way.' }
    ]
  },

  /* ---------------------------------------------------------------------
     13. PAGE 08 — FINALE
     --------------------------------------------------------------------- */
  finale: {
    eyebrow: 'The last little wish',
    heading: 'May Your Every Tomorrow Be Beautiful',
    paragraphs: [
      'May the year ahead bring you new opportunities, unforgettable experiences, personal growth, and countless happy moments.',
      'May you always find strength in difficult times, confidence in your abilities, and happiness in the little things.',
      'Keep smiling, keep dreaming, and keep shining.'
    ],
    encore: 'Happy Birthday Once Again!',
    replay: 'Experience Again',
    restart: 'Return to Beginning',
    starWishIntro: 'One last thing — hold a star and make it yours.',
    starWishPrompt: 'Tap the brightest star to send your wish into the sky.',
    starWishThanks: 'Your wish is safely on its way.'
  }
};
