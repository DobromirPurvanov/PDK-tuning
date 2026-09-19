# Кадърът в хирото

`public/img/pdk-hero2.{webm,mp4,webp}` — въртящо се колело на стенд, дим по
бетона. Генериран с **Veo 3.1** на 19.09.2026; суровият файл е
`docs/source/veo-hero-master.mp4` (7,2 MB, извън `public/`, значи не се сервира).

Старият кадър (`pdk-hero.{webm,mp4,jpg}`) остава само защото от него се правят
снимката за споделяне (`scripts/make-og.mjs`) и снимката в структурираните
данни — там свети по-добре. В хирото вече не влиза.

## Текстът, с който е генериран

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

Изходът е 1470×630, 24 к/с, 8,04 s, 7,5 Mbps. `scripts/veo-hero.mjs` пуска
същото от терминала, но иска `--da` и ХАРЧИ пари.

## Примката

Димът расте през целия клип — от яркост 21,5 в началото до 41,2 в края — тоест
няма отрязък, в който да е спокоен, и права примка щеше да подскача на всеки
осем секунди.

Затова примката е построена, не изрязана: опашката `[3 s … край]` е основата, а
началото `[0 … 3 s]` се претопява върху нейния край. Изходът започва и свършва
на един и същи кадър:

```bash
ffmpeg -i docs/source/veo-hero-master.mp4 -filter_complex "
  [0:v]split[s1][s2];
  [s1]trim=3:8.04,setpts=PTS-STARTPTS[main];
  [s2]trim=0:3,setpts=PTS-STARTPTS[head];
  [main][head]xfade=transition=fade:duration=3:offset=2.04[v]" \
  -map "[v]" -an -c:v libx264 -crf 14 -preset medium loop.mp4
```

Разликата между първия и последния кадър пада от **22,16** на **1,14** от 255 —
шевът престава да се вижда. Дължина 5,04 s.

## Цветокорекцията

Запечена е във файла, не е `filter` в CSS: филтър върху въртящо се видео се
смята за всеки кадър върху цялата площ на екрана (при dpr 2 това са милиони
пиксели, 24 пъти в секунда), а корекцията не се мени между кадрите.

**Този кадър иска по-лека ръка от предишния.** Старата корекция беше
`contrast(1.2) brightness(.5) saturate(.34)`, но тя беше правена за светъл
изходен материал. Veo върна вече тъмен клип (средна яркост 21,5 от 255) и при
яркост 0,5 колелото изчезваше — тоест точно това, заради което е сменен кадърът.
Пробвани са четири степени, всяка снимана в самата страница; избраната е:

```
contrast(1.15) brightness(.7) saturate(.55)
```

Веригата смята същото, в същия ред, в sRGB:

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

Сметката за произволни стойности: `contrast(k)` → `c = k·c − (k−1)/2`;
`brightness(b)` → `c = b·c`; двете заедно в осем бита са
`out = b·k·val − b·(k−1)/2·255`. `saturate(s)` е матрицата на SVG с тегла
0.213 / 0.715 / 0.072.

Че е същото: кадър през `ctx.filter` в Chrome срещу кадър през ffmpeg —
**средна разлика 0,18 от 255.**

## `deblock` върви ПРЕДИ `unsharp`

Всеки материал, минал през кодек, носи квадратчетата му. Изострянето ги
подчертава заедно с детайла. Мярката е отношението на наклона през всеки 8-и
пиксел към наклона навсякъде другаде — 1,0 значи „не личат“:

| | квадратчета |
|---|---|
| корекция + изостряне | 1,104 |
| **с `deblock` преди изострянето** | **0,695** |

Заглаждане с `hqdn3d` НЕ върши работа (1,027): маже текстурата, а ръбовете на
блоковете остават и стават единственото видимо.

## Плакатът е WebP, не JPEG

Той се зарежда с `fetchpriority="high"`, стои разтеглен на цял екран до първия
кадър на видеото и точно него вижда човекът пръв. JPEG слага собствени 8×8
квадратчета точно върху тъмното:

| | квадратчета | размер |
|---|---|---|
| JPEG `-q:v 1` | 1,050 | 68 KB |
| **WebP качество 88** | **0,954** | **32 KB** |

Прави се с Pillow — ffmpeg на тази машина е без WebP кодер:

```python
from PIL import Image
Image.open('poster.png').convert('RGB').save('pdk-hero2.webp', 'WEBP', quality=88, method=6)
```

## Изрезът на телефон

Кадърът е 1470×630 — по-широк от всеки екран, на който ще застане. `cover` го
мащабира по ВИСОЧИНА и реже отстрани, значи вертикалната стойност на
`object-position` не прави нищо, а хоризонталната решава всичко.

На 390px от кадъра остава ивица от около една пета. При 52% тя пада в най-
черната част и хирото изглежда като празно черно поле; при 30% ляга върху
калника и колелото. Средната яркост се вдига от 14,0 на 20,8. Затова правилото
за тесен екран е отделно.

## Тежести

| | старото | сега |
|---|---|---|
| webm | 399 KB | **181 KB** |
| mp4 | 430 KB | **265 KB** |
| плакат | 45 KB | **33 KB** |

По-леко е въпреки по-високото качество, защото примката е 5 s вместо 10 и
защото кадърът е тъмен и чист.

## Какво остана скъпо за GPU — и защо е оставено

| състояние на хирото | кадри/сек |
|---|---|
| сега | 27 |
| без дима | 40 |
| без `backdrop-filter` в трите клетки | **60** |

Най-скъпото са трите `backdrop-filter:blur(12px)` върху командните клетки. НЕ са
махнати нарочно: под тях минава видеото и без размазването формите се четат през
числата — панелът престава да е панел.

**На Apple M4 нищо от това не изпуска кадри** — числата са от софтуерен растер
нарочно: те мерят колко работа иска кадърът, а това става на ток от батерия и на
изпуснати кадри на слаба машина.

## Капанът при подмяна

`/img/*` се кешира **един месец** (`public/_headers`). Ново съдържание → ново
име. Затова е `pdk-hero2`, а не презаписан `pdk-hero`.

Плакатът, предварителното зареждане и фонът при изключено движение сочат СЪЩИЯ
файл — иначе първите секунди изглеждат различно от видеото.
