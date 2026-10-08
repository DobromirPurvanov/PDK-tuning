# Measurement: Search Console and Analytics

What exists today, what is missing and who can do it. Checked on **16.09.2026**.

---

## What the old site has

The pages of `www.pdktuning.com` contain:

| | |
|---|---|
| GA4 tag | `G-13T4ZTVM1W` |
| Tag manager | `GTM-5MKF4JB` |

That is, **visits have been measured for years** and this property holds a
history that would cost money to rebuild. The property belongs to the client — it
is not in our account (`workdobromirjustpablo@gmail.com`); searching for "pdk" in
Google Analytics returns nothing.

## What is missing

**Search Console.** `pdktuning.com` is not a property in our account — neither as
a domain (`sc-domain:pdktuning.com`) nor as a URL (`https://www.pdktuning.com/`).
Both give "You don't have access to this property" (Google's message, in
Bulgarian: „Нямате достъп до тази собственост“).

Whether the client has their own console **cannot be seen from outside**: the
pages of the old site have no `google-site-verification` meta tag, so if a
property exists, it was verified through DNS, a file or Analytics, under their
profile.

**The old site's `robots.txt` is missing.** The address returns status 200 and
700 KB of HTML — the home page instead of rules. Every search engine that asks
for it gets a page. This is not urgent (a missing robots means "crawl
everything"), but it is a sign that the site has not been looked at from below.

**The sitemap has the wrong namespace.** `sitemap.xml` carries
`xmlns="https://www.sitemaps.org/..."`, while the specification requires
`http://www.sitemaps.org/...`. Google is lenient, but validators are not.
5,586 URLs, of which 5,585 are under `/en/`.

---

## What is ready on our side

`PUBLIC_GSC_VERIFY` in the Pages environment writes the verification meta tag on
every page. Empty key = the tag is not there at all. ONLY the content of
`content` is copied, without the wrapper:

```
<meta name="google-site-verification" content="abc123xyz" />
                                               ^^^^^^^^^  this
```

`PUBLIC_GA_ID` has also been ready for a long time: Google's script is downloaded
ONLY after a "yes" from the cookie banner, with Consent Mode v2 and without
advertising permissions. On refusal nothing is downloaded; on withdrawal the tag
is switched off and the cookies are deleted.

---

## Which request goes to whom

### 1. Analytics — two different things, not one

**a) Permission to use the tag. This does NOT tolerate delay.** The tag itself is
already known (`G-13T4ZTVM1W`, readable from their pages) — they only need to say
"yes". It goes into `PUBLIC_GA_ID` on the day of the transfer and the data keeps
flowing into their property, without interruption. Without it their measurement
drops to zero the second `www` moves to us.

**b) Access to the reports. This can wait as long as it needs to.** The
**Viewer** role (or Editor, if we are going to configure events) on the
property, from Admin → Property access management → Add. The data is collected
without it — we just don't see it.

The difference matters, because "a" costs one line in the environment and
preserves years of history, while "b" is only a convenience for us.

### 2. Search Console — a DOMAIN-type property

The better one, because it covers `www`, `new`, `catalog` and everything else at
once and does not break when the subdomain changes. It requires a **DNS TXT
record**, which only whoever holds the zone can create:

```
Type   TXT
Name   @  (or pdktuning.com)
Value  google-site-verification=<the code Google gives>
```

The code is obtained like this: Search Console → Add property → **Domain** →
enter `pdktuning.com` → Google shows the line to copy.

Our Cloudflare token has `pages:write` and `zone:read`, but **does not have
`dns:write`**, and the `pdktuning.com` zone is not in our account either — the
record goes through the client's IT, the same person who also makes the CNAME
from `docs/letter-to-it.md`.

### 3. If a domain property doesn't work out — a URL property

The fallback path, which requires nobody but us:

1. Search Console → Add property → **URL prefix** →
   `https://new.pdktuning.com/`
2. Choose the "**HTML tag**" method and copy the code from `content`.
3. The code goes in as `PUBLIC_GSC_VERIFY` in the environment of the Pages
   project `new-pdk`.
4. **A new deploy** — an uploaded key does not take effect until a build is run.
5. Back in Search Console → "Verify".

The limitation: this property applies to `new.pdktuning.com` and does NOT apply
to `www`. At stage 2 a second one is added, for `https://www.pdktuning.com/`, in
the same order.

---

## Order of actions

**Decided (Dobo, 16.09.2026): access is obtained AFTER the transfer.** This works
for Search Console and does not work for one thing in Analytics — the difference
is below, because it costs data.

### Search Console waits calmly

Google keeps search data **at site level, not at property level**. Once the
property is verified — no matter when — the reports show the history going back
(up to 16 months), they do not start from zero on the day of verification. So
nothing is lost if the console arrives a week after the transfer.

The only thing that really needs an order is submitting our sitemap, and that
happens after the switchover anyway.

### The Analytics tag does NOT wait

The moment `www` moves to us, the pages are ours. Our code does not contain their
GTM, so **the client's measurement stops in that same second** — not because we
turned it off, but because the tag simply is no longer in the page. The client
will see a flat line at zero and will rightly ask what we broke.

The good part is that this **needs no access**. The tag is already known —
`G-13T4ZTVM1W`, readable from the pages of the old site. All that is needed is
for the client to say "yes, use it", and it goes into `PUBLIC_GA_ID` on the day of
the transfer. The data keeps flowing into THEIR property, continuously; the right
to view the reports can come whenever it comes.

**What must NOT be done:** create a new property "temporarily". Then the history
splits in two — the old one in their property, the new one in ours — and there is
no merging. Better a few days without measurement than two properties for one
site.

### In order

1. **On the day of the switchover:** `PUBLIC_INDEXABLE=true` and `PUBLIC_GA_ID`
   with their tag, together, one deploy. Without the second, measurement drops to
   zero.
2. **After the switchover, when the access arrives:**
   - Search Console → verification (DNS TXT from IT, or a meta tag via
     `PUBLIC_GSC_VERIFY` + a new deploy) → submit
     `https://www.pdktuning.com/sitemap.xml`, ours, 183 URLs;
   - Google Analytics → a role on the property `G-13T4ZTVM1W`, so the reports can
     be viewed.
3. **Watch "Coverage".** The old 5,586 URLs will start to drop — this is
   expected. 117 of them have a successor with a 301, the rest continue to be
   served by the old site through `LEGACY_ORIGIN`.

The checks for the switchover itself are in `docs/cutover.md`, and the
message to IT is in `docs/letter-to-it.md`.
