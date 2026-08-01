# Frontend work — next up

Written 2026-08-01, straight after the backend search fix. Read `DECISIONS.md` and `HANDOFF.md` §0
for the product core first. Visual direction is locked (print-newspaper, C1 "financial intelligence")
— do not redesign, only fix what's listed here.

---

## 1. The empty state — do this first

**Why it moved to the top.** The backend now uses `phraseto_tsquery`, so words must be adjacent to
match. Searching a company that genuinely isn't in the record returns `count: 0` instead of borrowing
words from unrelated companies in a bulk-removal notice. That is correct, and it means **zero results
just became a common, normal answer** — six of the twelve cases in `app/tests/search_probe.py` return
zero on purpose.

Right now `ResultsView.tsx` renders that as one line of 13px grey mono:

```
No notices matched. Try different words or widen the filters.
```

That reads as a broken search. For this product, zero results IS the answer — it means you're clean —
and it's the single moment the whole "credit-check for the public record" idea has to land. It should
be the most confident screen on the site, not the failure screen.

**Where:** `src/components/ResultsView.tsx`, the `results.length === 0` branch in `ResultsBody`.
Needs the query string passed down (App.tsx currently doesn't pass it to ResultsView).

**Copy — use as written. No taglines, no reassurance padding:**

```
Nothing on the record

No notice in the New Zealand Gazette mentions "Sunrise Cafe Limited".

Searched 205,501 notices, 2000 to today.

Fine Print covers liquidations, receiverships, company removals, bankruptcies,
land and legal notices. Company registration details and director records are
held by the Companies Office. Land titles are held by LINZ.
```

Three jobs, in order: state the result plainly, state the scope so the "nothing" is believable, and
be honest about what the Gazette does not hold. The last paragraph is what makes it trustworthy
rather than just empty — per the north star, never shrug at gaps, point at the right source instead.

**The count must be real.** `205,501` is correct as of 2026-08-01 but the `updater` will change it.
Either add a small `GET /stats` to the API returning `{notice_count, oldest, newest}` (~10 lines,
cache it) and fetch once on load, or thread it through the search response. Do not hardcode a number
that will silently drift — a wrong count in the sentence that exists to establish trust is worse than
no count.

Style it as a real block: heading in the serif face, the searched name quoted, scope line in the
muted ink, the outward pointers as ordinary body text. No card, no border-radius, no icon.

---

## 2. Home page copy — two AI tells

**`HomeView.tsx`, the hero paragraph.** Currently:

> We collect every notice in the New Zealand Gazette from 2000 to today and make it simple to search
> — liquidations, receiverships, removals, land and legal notices. Check a company before you deal
> with it, look up your own, or ask the desk a question and get a straight answer back.

The second sentence is a tricolon of benefits — three parallel clauses selling three use cases in one
breath. That cadence is the giveaway. Cut it to what the site actually does, and lead with self-lookup
because that's the core, not company-checking.

**`SearchDeck.tsx`, "Ask the desk".** The label and its note ("The desk runs several inquiries and
files a full report") put theme ahead of clarity on the more impressive of the two features. A
first-time visitor can't tell what "the desk" is or how it differs from Search. Keep the newspaper
voice, but the label has to say what it does.

---

## 3. The examples teach the wrong product

`SearchDeck.tsx` holds ~40 example queries and they are almost all famous corporate collapses — Du
Val, Mainzeal, Blue Chip, Smiths City, CBL. Examples teach the product, and these teach "browse
interesting NZ business failures", a curiosity tool. The north star is self-lookup.

Worse, that's also the query shape that has always worked, while the self-lookup shape was the broken
one. The site was quietly optimised for the demo.

Rewrite around ordinary names and ordinary situations — the kind of thing a supplier, landlord or
tradie would actually type. Keep a couple of famous ones for recognition, not twenty.

Every example must be verified against the live API before shipping (the current list was, on
2026-07-24 — keep that standard). `python app/tests/search_probe.py https://api.nzfineprint.com`
shows the pattern.

---

## 4. Strategic, not now — there is no reason to come back

Views are home → results → detail → agent. No watchlist, no saved search, no alerts, no "quietly
filed this week" feed. As shipped this is a **lookup**: used once, answered, closed. The north star
describes a **radar** — an early-warning watch on your interests.

Nothing on this list makes it bookmarkable. That needs subscriptions + a scheduler + email, which is
backend work, and it's the real gap between what's built and what was designed. Decide it
deliberately, don't drift into it.

---

## Before any production build

`web/.env` needs `VITE_API_BASE=https://api.nzfineprint.com`. The API is live and CORS already allows
`https://nzfineprint.com` and `https://www.nzfineprint.com` (set via `CORS_ORIGINS` on the server).
The frontend is not deployed anywhere yet and is deliberately not in the backend repo.
