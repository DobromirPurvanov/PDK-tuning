#!/usr/bin/env python3
"""Checks whether the visible text in a file sounds human-written.

python3 scripts/ai-text/check.py src/data/services.ts [...]

Compares the working copy with the version in git HEAD. Extracts only the text
in strings and markup (no comments). Same rules as for cc78 and Dinkovi:
dash <= 1 per 250 words, "not X, but Y" rare, no colon announcements, no
marketing words, no new numbers, length 0.85-1.15 of the original.
English files (path containing /en/) are measured against the English list.
Exit code 1 on ERROR.
"""
import re
import subprocess
import sys
from pathlib import Path

DASH = re.compile(r"\s[–—]\s|[–—]\s|\s[–—]|—")

BG = dict(
    ne_a=re.compile(r"\bне (?:е |са )?(?:просто |само )?[^.,;!?„“\"']{1,40}, а ", re.I),
    frazi=["Важно е да", "Нека ", "от ключово значение", "ключов ", "ключова", "ключово", "ключовите", "В заключение", "Истината е",
           "не само", "в днешно време", "цялостен подход", "комплексен подход", "Нещо повече",
           "Целта е проста", "Реалността", "Ето обаче", "Казано простичко", "Отговорът е", "Открийте",
           "идеален избор", "перфект", "безупреч", "изключително", "превъзход", "гарантира",
           "осигурява", "висококачествен", "иновативн", "революцион", "уникал", "незаменим",
           "в света на", "когато става дума", "съвършен", "Защо да изберете", "Благодарение на",
           "максимал", "впечатляващ", "бързо и лесно", "безпроблем", "Представете си", "Тайната",
           "отключ", "трансформир", "ненадмина", "безкомпромис", "Ключът", "Накратко",
           "С други думи", "Простото правило", "Златното правило", "По-долу", "гръбнак",
           "Физиката не се", "работният кон", "Честно казано", "Всъщност", "На практика"],
)
EN = dict(
    ne_a=re.compile(r"\b(?:not (?:just |only |simply )?[^.,;!?]{1,40}, but |isn't [^.,;!?]{1,40}[,;] it's |it's not [^.,;!?]{1,40}[,;—–] it's )", re.I),
    frazi=["delve", "seamless", "unlock", "elevate", "crucial", "robust", "tapestry", "testament",
           "In today's", "navigate the", "game-chang", "cutting-edge", "state-of-the-art",
           "Whether you", "look no further", "It's worth noting", "In conclusion", "Here's the thing",
           "The truth is", "The answer is", "Simply put", "In short", "Let's", "unleash",
           "not only", "world-class", "second to none", "top-notch", "empower", "harness",
           "meticulous", "journey", "realm", "Truth be told", "at the end of the day"],
)


def strip_comments(t: str) -> str:
    t = re.sub(r"/\*.*?\*/", " ", t, flags=re.S)
    t = re.sub(r"<!--.*?-->", " ", t, flags=re.S)
    t = re.sub(r"(?m)^\s*//.*$", " ", t)
    return t


def chunks(src: str, lang: str):
    """Visible text chunks: strings and text between tags with at least 2 words."""
    t = strip_comments(src)
    t = re.sub(r"<style\b[^>]*>.*?</style>", " ", t, flags=re.S)
    letters = r"[а-яА-Я]" if lang == "bg" else r"[a-zA-Z]"
    code, tpl = t, ""
    fm = re.match(r"\s*---\n(.*?)\n---\n(.*)", t, flags=re.S)
    if fm:  # .astro: code on top (strings only), markup below
        code, tpl = fm.group(1), fm.group(2)
        scripts = re.findall(r"<script\b[^>]*>(.*?)</script>", tpl, flags=re.S)
        code += "\n" + "\n".join(re.sub(r"(?m)//.*$", " ", s) for s in scripts)
        tpl = re.sub(r"<script\b[^>]*>.*?</script>", " ", tpl, flags=re.S)
    raw = []
    STR = r"'((?:[^'\\\n]|\\.)*)'|\"((?:[^\"\\\n]|\\.)*)\"|`((?:[^`\\]|\\.)*)`"
    for m in re.finditer(STR, code):
        raw.append(next(g for g in m.groups() if g is not None))
    for m in re.finditer(r"\{([^{}]*)\}", tpl):  # strings in {...} expressions
        for n in re.finditer(STR, m.group(1)):
            raw.append(next(g for g in n.groups() if g is not None))
    for m in re.finditer(r"\s[\w-]+=\"([^\"]*)\"", tpl):  # attributes: title, aria-label, content...
        raw.append(m.group(1))
    for m in re.finditer(r">([^<>]+)<", re.sub(r"\{[^{}]*\}", " ", tpl)):
        if not re.search(r"=>|&&|\|\||;\s*$", m.group(1)):
            raw.append(m.group(1))
    out = []
    for s in raw:
        s = re.sub(r"\$\{[^}]*\}", " ", s)
        s = re.sub(r"<[^>]+>", " ", s)
        if len(re.findall(letters + r"{2,}", s)) < 2 or re.fullmatch(r"[\w\s./#:-]*", s) and " " not in s.strip():
            continue
        if lang == "en" and re.search(r"[а-яА-Я]", s):
            continue
        if lang == "en" and not re.search(r"[A-Za-z]{2,}\s+[A-Za-z]{2,}\s+[A-Za-z]{2,}", s):
            continue
        out.append(" ".join(s.split()))
    return out


def numbers(t):
    return sorted({n.replace(",", ".") for n in re.findall(r"\d+(?:[.,]\d+)?", t)})


def prose(t):
    # ranges are not dashes in prose: 2–4, +15 to +25, 9:00–18:00, 300–500 €, Mon–Fri
    t = re.sub(r"[\d%€]\s*[–—-]\s*[+\-−]?\d", " ", t)
    t = re.sub(r"\b(Пон|Пн|Mon)[–—-](Пет|Съб|Нед|Пт|Fri|Sat|Sun)\b", " ", t)
    return t


def check(path: str) -> int:
    p = Path(path)
    lang = "en" if "/en/" in f"/{path}" else "bg"
    R = EN if lang == "en" else BG
    rel = subprocess.run(["git", "ls-files", "--full-name", path], capture_output=True, text=True).stdout.strip()
    old = subprocess.run(["git", "show", f"HEAD:{rel}"], capture_output=True, text=True).stdout if rel else ""
    new = p.read_text()
    co, cn = chunks(old, lang), chunks(new, lang)
    to, tn = " ".join(co), " ".join(cn)
    wo, wn = len(to.split()), len(tn.split())
    err, warn = [], []
    d_old, d = len(DASH.findall(prose(to))), len(DASH.findall(prose(tn)))
    allow = wn // 250
    if d > allow:
        ex = [c for c in cn if DASH.search(prose(c))][:4]
        err.append(f"dashes: {d} in {wn} words (allowed {allow}); e.g.: " + " | ".join(x[:90] for x in ex))
    na = R["ne_a"].findall(tn)
    if len(na) > max(1, wn // 1000):
        err.append(f"\"not X, but Y\": {len(na)} (allowed {max(1, wn // 1000)}): {na[:4]}")
    for f in R["frazi"]:
        # the slogan from the Canva board ("We know how to unlock it") is a brand mark, not a voice tell
        hits = [c for c in cn if re.search(re.escape(f), c, re.I) and c != "отключим"]
        if hits:
            err.append(f"banned phrase \"{f}\": {hits[0][:100]}")

    def colons(cs):
        return sum(max(0, c.count(":") - len(re.findall(r"\d:\d|https?:", c))) for c in cs if len(c.split()) > 4)

    col_o, col = colons(co), colons(cn)
    if col > max(col_o, wn // 200, 1):
        err.append(f"colons in sentences: {col} (original {col_o}); a dash is NOT replaced with a colon")
    two = [c for c in cn if any(s.count(":") - len(re.findall(r"\d:\d", s)) >= 2 for s in re.split(r"(?<=[.!?])\s+", c))]
    if two:
        err.append(f"sentence with two colons: {two[0][:100]}")
    sc = tn.count(";")
    if sc > max(1, wn // 300):
        err.append(f"semicolons: {sc} (allowed {max(1, wn // 300)})")
    add = sorted(set(numbers(tn)) - set(numbers(to)))
    lost = sorted(set(numbers(to)) - set(numbers(tn)))
    if add:
        err.append(f"new numbers not in the original: {add[:12]}")
    if lost:
        warn.append(f"vanished numbers (deleted fact?): {lost[:12]}")
    rep = re.findall(r"\b(\w{3,})\s+\1\b", tn, re.I)
    if rep:
        err.append(f"repeated words: {rep[:5]}")
    for c in cn:
        for s in re.split(r"(?<=[.!?])\s+", c):
            if 0 < len(s.split()) <= 4 and s.endswith(".") and len(c.split()) > 12:
                warn.append(f"short sentence in a paragraph (punchline?): \"{s}\"")
    if wo:
        ratio = wn / wo
        if not 0.85 <= ratio <= 1.15:
            err.append(f"length {wo}→{wn} words ({ratio:.2f}x; allowed 0.85-1.15)")
    print(f"[{path}] {'OK' if not err else 'ERROR'}  words {wo}→{wn}  dashes {d_old}→{d} (<={allow})  "
          f"colons {col_o}→{col}  not-X-but-Y {len(R['ne_a'].findall(to))}→{len(na)}")
    for e in err:
        print("   ✗", e)
    for w in warn[:8]:
        print("   !", w)
    return 1 if err else 0


if __name__ == "__main__":
    files = [a for a in sys.argv[1:] if not a.startswith("--")]
    sys.exit(max([check(f) for f in files] or [0]))
