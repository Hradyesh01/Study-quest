# Custom badge artwork

Drop a square image here named exactly after the badge's `id` (see `src/data/badges.js`)
and it will replace the lucide-react icon automatically — no code changes needed.

Expected filenames (PNG or SVG, any one per badge):

- first-steps.png
- night-owl.png
- early-bird.png
- marathoner.png
- streak-3.png
- streak-7.png
- streak-30.png
- hours-10.png
- hours-50.png
- hours-100.png

Recommended export: 512x512px (or any 1:1 square), PNG with a transparent
background. If a file is missing, that badge just falls back to its default
icon — nothing breaks.
