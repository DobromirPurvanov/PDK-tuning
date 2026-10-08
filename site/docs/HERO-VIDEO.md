# The frame in the hero

`public/img/pdk-hero2.{webm,mp4,webp}` — a wheel spinning on a test bench, smoke
over the concrete. Generated with **Veo 3.1** on 19.09.2026; the raw file is
`docs/source/veo-hero-master.mp4` (7.2 MB, outside `public/`, so it is not served).

The old frame (`pdk-hero.{webm,mp4,jpg}`) stays only because the sharing image
(`scripts/make-og.mjs`) and the image in the structured data are made from it —
it shines better there. It no longer goes into the hero.

## The prompt it was generated with

```
Cinematic automotive commercial shot inside a dark tuning workshop at night.
A modern black performance sedan is strapped down on a chassis dynamometer,
rear wheels spinning fast on the polished dyno rollers, thin tyre smoke
drifting low across the wet concrete floor. Static locked-off camera, low
angle near the floor level, slight wide lens, shallow depth of field, the car
positioned in the right half of the frame, the left half falling into darkness.
Cold hard key light raking along the car's flank, a faint acid-green accent
light spilling from the left edge, deep shadows, wet floor reflections, steel
ramps and out-of-focus industrial racking in the background. Photorealistic,
high detail, anamorphic lens, 24fps film look, subtle handheld-free stillness.
No people, no text, no logos, no on-screen graphics, no lens flares.
```

The output is 1470×630, 24 fps, 8.04 s, 7.5 Mbps. `scripts/veo-hero.mjs` runs
the same thing from the terminal, but requires `--da` and SPENDS money.

## The loop

The smoke grows through the whole clip — from a brightness of 21.5 at the start
to 41.2 at the end — so there is no stretch where it is calm, and a straight loop
would jump every eight seconds.

That is why the loop is built, not cut: the tail `[3 s … end]` is the base, and
the start `[0 … 3 s]` is cross-faded over its end. The output begins and ends on
the same frame:

```bash
ffmpeg -i docs/source/veo-hero-master.mp4 -filter_complex "
  [0:v]split[s1][s2];
  [s1]trim=3:8.04,setpts=PTS-STARTPTS[main];
  [s2]trim=0:3,setpts=PTS-STARTPTS[head];
  [main][head]xfade=transition=fade:duration=3:offset=2.04[v]" \
  -map "[v]" -an -c:v libx264 -crf 14 -preset medium loop.mp4
```

The difference between the first and the last frame drops from **22.16** to
**1.14** out of 255 — the seam stops being visible. Length 5.04 s.

## The colour grade

It is baked into the file, not a CSS `filter`: a filter on a playing video is
computed for every frame over the whole area of the screen (at dpr 2 that is
millions of pixels, 24 times a second), while the correction does not change
between frames.

**This frame needs a lighter hand than the previous one.** The old correction was
`contrast(1.2) brightness(.5) saturate(.34)`, but it was made for bright source
material. Veo returned an already dark clip (mean brightness 21.5 out of 255) and
at brightness 0.5 the wheel disappeared — exactly what the frame was replaced to
avoid. Four levels were tried, each photographed in the page itself; the chosen
one is:

```
contrast(1.15) brightness(.7) saturate(.55)
```

The chain computes the same thing, in the same order, in sRGB:

```bash
cd site/public/img
CHAIN="format=gbrp,\
lutrgb=r='clip(0.805*val-13.3875,0,255)':g='clip(0.805*val-13.3875,0,255)':b='clip(0.805*val-13.3875,0,255)',\
colorchannelmixer=.64585:.32175:.0324:0:.09585:.87175:.0324:0:.09585:.32175:.5824,\
deblock=filter=strong:block=8:alpha=0.12:beta=0.10,\
unsharp=5:5:0.5:5:5:0.2,\
format=yuv420p"

ffmpeg -y -i loop.mp4 -vf "$CHAIN" -c:v libvpx-vp9 -crf 30 -b:v 0 -row-mt 1 -an pdk-hero2.webm
ffmpeg -y -i loop.mp4 -vf "$CHAIN" -c:v libx264 -crf 24 -preset slow \
       -profile:v high -pix_fmt yuv420p -an -movflags +faststart pdk-hero2.mp4
```

The calculation for arbitrary values: `contrast(k)` → `c = k·c − (k−1)/2`;
`brightness(b)` → `c = b·c`; the two together in eight bits are
`out = b·k·val − b·(k−1)/2·255`. `saturate(s)` is the SVG matrix with weights
0.213 / 0.715 / 0.072.

That it is the same: a frame through `ctx.filter` in Chrome against a frame
through ffmpeg — **mean difference 0.18 out of 255.**

## `deblock` goes BEFORE `unsharp`

Any material that has passed through a codec carries its blocks. Sharpening
emphasises them along with the detail. The measure is the ratio of the gradient
at every 8th pixel to the gradient everywhere else — 1.0 means "not noticeable":

| | blockiness |
|---|---|
| correction + sharpening | 1.104 |
| **with `deblock` before sharpening** | **0.695** |

Smoothing with `hqdn3d` does NOT work (1.027): it smears the texture, while the
block edges remain and become the only visible thing.

## The poster is WebP, not JPEG

It is loaded with `fetchpriority="high"`, sits stretched to the full screen until
the first frame of the video, and it is exactly what a person sees first. JPEG
puts its own 8×8 blocks right on the dark area:

| | blockiness | size |
|---|---|---|
| JPEG `-q:v 1` | 1.050 | 68 KB |
| **WebP quality 88** | **0.954** | **32 KB** |

It is made with Pillow — ffmpeg on this machine has no WebP encoder:

```python
from PIL import Image
Image.open('poster.png').convert('RGB').save('pdk-hero2.webp', 'WEBP', quality=88, method=6)
```

## The crop on a phone

The frame is 1470×630 — wider than any screen it will sit on. `cover` scales it
by HEIGHT and crops at the sides, so the vertical value of `object-position` does
nothing, while the horizontal one decides everything.

At 390px about one fifth of the frame remains, as a strip. At 52% it falls in the
blackest part and the hero looks like an empty black field; at 30% it lies over
the fender and the wheel. The mean brightness rises from 14.0 to 20.8. That is
why the rule for a narrow screen is separate.

## Weights

| | old | now |
|---|---|---|
| webm | 399 KB | **181 KB** |
| mp4 | 430 KB | **265 KB** |
| poster | 45 KB | **33 KB** |

It is lighter despite the higher quality, because the loop is 5 s instead of 10
and because the frame is dark and clean.

## What stayed expensive for the GPU — and why it was left

| state of the hero | frames/sec |
|---|---|
| now | 27 |
| without the smoke | 40 |
| without `backdrop-filter` in the three cells | **60** |

The most expensive are the three `backdrop-filter:blur(12px)` on the command
cells. They are NOT removed on purpose: the video passes beneath them, and
without the blur the shapes read through the numbers — the panel stops being a
panel.

**On an Apple M4 none of this drops frames** — the numbers come from a software
raster on purpose: they measure how much work a frame requires, and that shows up
as battery drain and as dropped frames on a weak machine.

## The replacement trap

`/img/*` is cached for **one month** (`public/_headers`). New content → new name.
That is why it is `pdk-hero2`, not an overwritten `pdk-hero`.

The poster, the preload and the background with motion disabled point to the SAME
file — otherwise the first seconds look different from the video.
