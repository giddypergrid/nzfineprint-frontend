# Fine Print, web

**Live at [nzfineprint.com](https://www.nzfineprint.com)** · backend in
[nzfineprint-backend](https://github.com/giddypergrid/nzfineprint-backend)

The React client for Fine Print, a search platform over 206,431 New Zealand Gazette notices. Two
things happen here: a search box that returns notices, and an Ask view that streams a research
agent's work step by step while it reads the record.

## The look is the argument

The site is deliberately styled as a print newspaper: salmon paper, a masthead, a colophon, serif
headlines. The content is company failure notices, and a newspaper is the format people already
trust for that.

Three other directions were built and thrown away first, a terminal look, a cartoon look, and a
heavy-bordered search page. All three read as generic AI-generated product design. The rule that
survived is restraint: one typeface family, one accent colour, no gradients, no shadows.

## Streaming the agent instead of spinning

An agent question takes several rounds of tool calls and can run for twenty seconds. A spinner for
twenty seconds reads as broken.

So every tool the agent calls carries a `narration` argument, a short present-tense line the model
writes itself, and the frontend renders those as they arrive:

```
  Looking for Sacred Hill in the record…
  Reading the receivership notice in full…
  Checking who else is named alongside them…
  ▌
```

The narration is a tool argument rather than message text on purpose. The model returns tool calls
with empty content, so anything written as prose in the reply gets lost. As an argument it always
arrives.

## Where to look

| File | Why |
|---|---|
| [`src/api/client.ts`](src/api/client.ts) | The only place that calls the API, including the streamed `/ask` reader |
| [`src/components/AskView.tsx`](src/components/AskView.tsx) | Renders the agent's rolling narration and the final cited answer |
| [`src/components/SearchDeck.tsx`](src/components/SearchDeck.tsx) | The search box. Read the note first: a backend change to phrase search silently zeroed the site's own example queries |
| [`src/styles/tokens.css`](src/styles/tokens.css) | Palette and type scale, the whole design system |

```
src/api/          types mirroring the backend schemas, plus the client
src/components/   one file per UI piece
src/lib/          formatting, facet options, routing
src/hooks/        useTypewriter, the animated placeholder
```

## Known gaps

- **No watchlist.** You cannot be told when a new notice names something you care about, which is the
  main reason anyone would come back.
- Mobile was badly broken until August 2026, the home view rendered 624px wide inside a 390px
  viewport. Fixed, but the backend and frontend branches have to deploy together.

---

React 19, TypeScript, Vite, plain CSS with custom properties. Deployed on Vercel, auto-deploys on
push to `main`. DNS is Cloudflare, grey-cloud for the Vercel records and orange only for `api`.

Development needs the backend running: `docker compose up -d db` and uvicorn from the backend repo,
then `npm run dev` here. Vite proxies `/search` and `/ask` so there is no CORS step in development.
In production, set `VITE_API_BASE` to the API origin.
