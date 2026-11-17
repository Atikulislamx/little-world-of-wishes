# Scene artwork

The large illustrated backdrops used by the eight pages live in
`assets/backgrounds/` — that is where the site loads them from. This folder is
kept as the home for any additional anime-style scene art you may want to add
(for example a print-resolution version of the finale sky).

Keep filenames descriptive and kebab-cased, export WebP (1920 px wide) plus a
JPEG fallback, and update `theme.backdropOverride` or the `BACKDROPS` map in
`js/main.js` if you swap a scene.
