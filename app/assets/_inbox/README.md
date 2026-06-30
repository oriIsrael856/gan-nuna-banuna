# Asset inbox

Drop **raw, unoptimized** image exports from Figma here (any size), then flag
them so they get optimized and moved to their final location.

Do **not** reference files in this folder from code — they are not optimized and
will be moved. The optimization pass (resize to retina display size + compress)
turns multi-MB exports into a few KB. See `scripts/optimize-parent-home-assets.mjs`
for the pattern and `docs/16-design-system.md` for the full flow.
