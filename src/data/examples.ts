// Shared by the search placeholder and the front-page try row, so there is one list to verify.
//
// Every NAME here was checked against the live DB (2026-08-01) AFTER search moved to
// phraseto_tsquery. That matters: a query of four words or fewer takes the keyword route and needs
// the words ADJACENT, so term+place and term+year shapes ("liquidation Auckland 2024") now return
// nothing. Anything added here must be a real contiguous name, re-checked with:
//   SELECT count(*) FROM notices WHERE search_vector @@ phraseto_tsquery('simple', 'Your Example');

/** Ordinary trading names — the shape someone checking a supplier or their own company types. */
const NAME_EXAMPLES = [
  "Resolve Electrical",
  "Beachlands Cafe",
  "Central Plumbing Services",
  "Lyford Transport",
  "Concept Builders Queenstown",
  "Energize Electrical",
  "Pacey Log Transport",
  "Du Val Group",
  "Smiths City",
  "Sacred Hill",
];

/** Over four words, so these take the LLM/semantic route and always return something. */
const SENTENCE_EXAMPLES = [
  "builders that went into liquidation in Christchurch",
  "a cafe put into liquidation this year",
  "companies wound up by Inland Revenue",
  "trucking firms placed in receivership",
  "companies struck off for not filing returns",
  "land taken by the council for a road",
];

/** What the placeholder cycles through: names first, so the name shape is what gets taught. */
export const SEARCH_EXAMPLES = [...NAME_EXAMPLES, ...SENTENCE_EXAMPLES];

export const ASK_EXAMPLES = [
  "Is it safe to do business with Resolve Electrical?",
  "Has anything been filed against Beachlands Cafe?",
  "My builder is Concept Builders Queenstown — should I be worried?",
  "A supplier of mine just had receivers appointed — how worried should I be?",
  "Is Sacred Hill still trading?",
  "Which construction companies in Christchurch went under recently?",
  "Are there directors who show up across lots of failed companies?",
  "Which banks appoint the most receivers?",
  "Any liquidations in the wine industry lately?",
  "Who is behind the Du Val collapse?",
  "What happened to Smiths City?",
];
