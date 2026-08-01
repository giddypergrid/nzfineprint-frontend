# Frontend work — state and what's left

Written 2026-08-01 after the product audit, updated the same day once the first three items shipped.
Visual direction is locked (print-newspaper, C1 "financial intelligence") — do not redesign.

---

## Done

**Empty state.** `NoResults.tsx` replaces the one line of grey mono. Search requires adjacent words,
so a company that genuinely isn't in the record returns nothing — for someone looking up their own
name that IS the finding, so the screen states it, quotes what it was measured against, and says
what the Gazette does not hold (Companies Office, LINZ). A separate branch handles filters being on,
because then the record didn't come back empty, the filtered slice did.

**Real corpus numbers.** `GET /stats` on the API returns `{notice_count, oldest, newest}`, cached an
hour. The empty state and the masthead both read from it. The masthead used to claim `2000 —
Current`; it now shows the newest notice actually loaded, because the updater can be days behind.

**Copy.** Hero tricolon cut, leads with self-lookup. Tab `Ask the desk` → `Ask a question`. Search
hint states the real constraint instead of a dead example.

**Examples.** Rewritten around ordinary trading names, all re-verified against the live DB.

---

## The one trap to know before editing `SearchDeck.tsx`

Queries of four words or fewer take the keyword route, which uses `phraseto_tsquery` — the words must
be **adjacent**. When search moved to phrase matching, three shipped examples silently went to zero
hits, including the one hardcoded in the hint under the search box:

```
liquidation Auckland 2024   0     <- was the hint text
CBL Insurance liquidation   0
wine company liquidation    0
```

Term+place and term+year are dead shapes. Any short example must be a real contiguous name, verified
before it ships. Cheapest check is SQL, not the API (no rate limit):

```sql
SELECT count(*) FROM notices WHERE search_vector @@ phraseto_tsquery('simple', 'Your Example');
```

Anything over four words goes to the LLM/semantic route and always returns something.

---

## Left to do

**1. There is still no reason to come back.** Views are home → results → detail → agent. No watchlist,
no saved search, no alerts, no "quietly filed this week" feed. As shipped this is a **lookup** — used
once, answered, closed — while the north star describes a **radar**, an early-warning watch on your
interests. Nothing on the frontend fixes this: it needs subscriptions, a scheduler and email, which
is backend work. It is the real gap between what's built and what was designed. Decide it
deliberately, don't drift into it.

**2. Not deployed anywhere.** Hosting is undecided — Caddy on the existing box (the box is memory-
tight, but static files cost nothing) or Cloudflare Pages / Vercel. Before any production build,
`web/.env` needs `VITE_API_BASE=https://api.nzfineprint.com`. CORS already allows
`https://nzfineprint.com` and `https://www.nzfineprint.com` via `CORS_ORIGINS` on the server.

**3. `src/data/yearly.ts` is still hardcoded** (per-year counts + `TOTAL_NOTICES`). The year chart
will drift once the updater runs. `/stats` already exists; the same treatment would fix it, or extend
`/stats` to return the per-year series.
