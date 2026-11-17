# Flower artwork

Every flower in the garden is generated as original vector art by the library
in `js/art.js` (`LWOWArt.flower(type, options)`), so the page needs no image
files and stays crisp at any size.

Supported types: `rose`, `tulip`, `lily`, `sunflower`, `sakura`, `daisy`,
`lavender`.

This folder is the place for optional hand-painted flower bitmaps if you later
want to replace a vector bloom. Export them with a transparent background and
reference them from a page module instead of `LWOWArt.flower()`.
