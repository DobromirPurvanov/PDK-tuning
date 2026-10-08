# Contract: the new.pdktuning.com texts without an AI hand (25.09.2026)

The site belongs to PDK Tuning, a chip tuning and software repair shop in Varna.
The texts are already concrete and useful: engine codes, what gets checked,
where the headroom is. The problem is the **hand**, not the content. So this
is an **edit, not a rewrite**: the same facts, the same meaning, roughly the
same length, but sentences that sound like a mechanic explaining things to a
customer at the counter.

We applied the same rules to cc78.bg and dinkovi.com.

## Check

After every file:

```
cd ~/dev/pdk-tuning/site
python3 scripts/ai-text/check.py <file> [<file> ...]
node_modules/.bin/esbuild <file.ts> --log-level=error >/dev/null   # .ts only: the syntax is intact
```

`check.py` must print `OK` for each of your files. Fix until it does.
Also review the warnings (`!`). A missing number usually means a deleted fact,
so put it back. A short sentence in a paragraph is often a punchline, so merge it
into the neighbouring one.

Do NOT run `npm run build` (another agent may be building at the same time). Do NOT
commit. Do NOT touch files outside your list.

## What is NOT touched

1. The code: keys, `slug`, `href`, `class`, `id`, icons, `priceKey`,
   `related`, imports, logic, expressions in `{…}`. You only touch the text inside strings and
   the text between tags.
2. **Code comments** (`//`, `/* */`, `{/* */}`, `<!-- -->`) stay as they
   are. They are not visible on the site.
3. Numbers, prices, percentages, years, power figures, engine codes (N47, OM651,
   TDI, DQ250…), brand names, phone, address, working hours.
4. The meaning of every technical and legal claim. **The legal boundary for DPF,
   EGR, AdBlue and Vmax** ("only for machines off public roads") stays
   exactly as clear and strict.
5. The polite form "вие" ("Изберете", "обадете се", "вашата кола"). You do not
   switch to "ти".
6. The keywords in `title`, `h1`, `h2` and `description` (чип тунинг, Варна,
   the service name, the brand). They may be rephrased, but the words stay.
   ` | PDK Tuning` at the end of titles stays.
7. The slogan and the triad from the brand panel: "Всеки автомобил има
   потенциал", "Ние знаем как да го отключим" and "Анализ · Настройка ·
   Оптимизация". The triple is intentional and stays. The dash after it
   may be removed.
8. The number of elements in the arrays (points, steps, questions, paragraphs) does not
   change.

## Human sound (mandatory)

- **Dashes** ` — ` / ` – ` in the text: at most 1 per 250 words. In a small file
  that means **zero**. A dash stays only in ranges (`2–4 часа`,
  `2015–2019`) and in names.
- **How to remove a dash properly:** split into two sentences; or insert
  "защото", "така че", "например", "тоест", "затова"; or a comma if it is
  subordinate; or parentheses for an explanation. **A dash is NOT replaced by a colon.**
  Colons must not become more numerous than in the original. A sentence with two
  colons is forbidden.
- **"не X, а Y"** and "X, не Y": at most 1 per page/service. State the
  positive directly ("Пишем файла за конкретния блок след прочит на
  оригинала."), without contrasting it with an imaginary bad shop.
- **No punchlines.** A short verdict sentence at the end of a paragraph ("Физиката не се
  заобикаля.", "Затова е първа.", "Двигателят е само половината.") is merged
  with the neighbouring one or removed if it carries no fact. Short labels in steps
  and cards ("Първата крива на стенда.") are acceptable as long as they are descriptions.
- **No colon announcements:** "Причината: …", "Ключът: …", "Правилото е
  просто: …". Say the thing directly.
- **No triplets for rhythm** ("бързо, точно и надеждно") and no rhetorical question
  with a dramatic answer.
- **Banned words and phrases** (the check catches them): Важно е да, Нека,
  ключов/ключът, не само, В заключение, Истината е, Всъщност, На практика,
  Честно казано, По-долу, гръбнак, работният кон, Физиката не се…, перфектен,
  безупречен, изключително, гарантира, осигурява, максимален, впечатляващ,
  уникален, иновативен, Благодарение на, Представете си, Тайната, отключва,
  трансформира. Instead of "по-долу" write "под това", "в избирача", "в списъка"
  or simply drop the pointer.
- Sentences vary in length. The tone is calm, concrete and businesslike,
  without promotional enthusiasm and without familiarity.
- No new facts, numbers, promises, customer stories or statistics.

## The English files

The same in English: an em dash ` — ` at most 1 per 250 words (zero in a small
file), no "not X, but Y" / "it's not X, it's Y", no punchlines, no
"Here's the thing", "The truth is", "Let's", "unlock", "seamless", "robust",
"crucial", "elevate", "delve", "Whether you…", "In short". A semicolon
at most 1 per 300 words. British or American spelling, whichever is already
in the file. The slogan in English, if there is one, stays.

## Example (from services.ts)

Before:
> Заради това между заводската настройка и физическата граница на хардуера
> остава резерв. Чип тунингът работи в този резерв — не измисля мощност, а
> сваля предпазните граници до реалната възможност на конкретния двигател.

After:
> Затова между заводската настройка и физическата граница на хардуера остава
> резерв. Чип тунингът работи в него. Файлът сваля предпазните граници до
> това, което конкретният двигател реално може да поеме.

Before:
> Ако използвате новата мощност, разходът се качва. Физиката не се заобикаля:
> повече мощност е повече изгорено гориво.

After:
> Ако използвате новата мощност, разходът се качва, защото повече мощност
> значи повече изгорено гориво.

## What you return

For each file: the output of `check.py` (the last run) and 1–2 lines with the
most characteristic changes. If anywhere you could not remove a dash without
changing the meaning, say where.
