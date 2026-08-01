const CONTACT_EMAIL = "sunziyuan000@gmail.com";
const REPO_FRONTEND = "https://github.com/giddypergrid/nzfineprint-frontend";
const REPO_BACKEND = "https://github.com/giddypergrid/nzfineprint-backend";

/**
 * Usage, copyright, disclaimer, contact. Deliberately plain — this page exists to be believed,
 * so it states limits rather than reassuring, and points at the authoritative source each time.
 */
export default function LegalView() {
  return (
    <section className="legal">
      <div className="kick">About &amp; legal</div>
      <h2>What this site is, and what it isn't</h2>

      <h3>What this is</h3>
      <p>
        Fine Print is an independent search over notices published in the New Zealand Gazette. It
        reproduces the text of each notice, adds a plain-language summary, and links back to the
        original entry.
      </p>

      <h3>Where the notices come from</h3>
      <p>
        The New Zealand Gazette is the official newspaper of the New Zealand Government, published by
        the Department of Internal Affairs. Notice text and metadata are retrieved through DigitalNZ.
      </p>
      <p>
        The Gazette itself remains the authoritative source. Every notice here links to its original
        entry, and where the two differ, the original is correct.
      </p>
      <p>
        The notices are official government publications and remain Crown copyright; this site claims
        no ownership of them. The summaries, categories and significance scores are produced by this
        site and are not part of the official record.
      </p>

      <h3>What this is not</h3>
      <p>
        Not affiliated with, endorsed by, or connected to the New Zealand Government, the Department
        of Internal Affairs, or the New Zealand Gazette.
      </p>
      <p>
        Not legal, financial or credit advice. A notice records that something was published on a
        date. It does not establish the current status of any company or person. Company registration
        and director records are held by the Companies Office; land titles are held by LINZ.
      </p>

      <h3>Accuracy</h3>
      <p>
        The record here is a copy, and it can be incomplete or behind the official publication. A
        search finding nothing is not proof that nothing was published — check the Gazette directly if
        it matters.
      </p>
      <p>
        If you find an error, or you are named in a notice and want to raise something, get in touch.
      </p>

      <h3>Contact</h3>
      <p>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>

      <h3>Source code</h3>
      <p>
        This site is open source. The search API and offline pipeline are at{" "}
        <a href={REPO_BACKEND} target="_blank" rel="noreferrer">
          nzfineprint-backend
        </a>
        , and this interface is at{" "}
        <a href={REPO_FRONTEND} target="_blank" rel="noreferrer">
          nzfineprint-frontend
        </a>
        .
      </p>
    </section>
  );
}
