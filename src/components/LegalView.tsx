const CONTACT_EMAIL = "sunziyuan000@gmail.com";
const REPO_FRONTEND = "https://github.com/giddypergrid/nzfineprint-frontend";
const REPO_BACKEND = "https://github.com/giddypergrid/nzfineprint-backend";

/**
 * Usage, copyright, disclaimer, contact. Leads with the two facts that matter most — the material
 * is already public, and the site is free and non-commercial — then the narrower legal points in
 * newspaper columns.
 */
export default function LegalView() {
  return (
    <section className="legal">
      <div className="kick">About &amp; legal</div>
      <h2>Everything here is already public</h2>

      <p className="legal-lead">
        The New Zealand Gazette is the official newspaper of the New Zealand Government. Every notice
        on this site was published there by law, for anyone to read. Nothing here is private, nothing
        was obtained by any other means, and nothing is republished that was not already open to the
        public.
      </p>

      <div className="legal-cols">
        <div className="legal-sec">
          <h3>Free, and not a business</h3>
          <p>
            Fine Print is free to use and non-commercial. Nothing is sold, there is no advertising,
            there are no accounts or payments, and no information about you is collected, stored or
            passed to anyone. It is run as a public service.
          </p>
        </div>

        <div className="legal-sec">
          <h3>Where the notices come from</h3>
          <p>
            Notice text and metadata are retrieved through DigitalNZ, the National Library's public
            search service. The Gazette remains the authoritative source: every notice here links
            back to its original entry, and where the two differ, the original is correct.
          </p>
        </div>

        <div className="legal-sec">
          <h3>Copyright</h3>
          <p>
            The notices are official government publications and remain Crown copyright. This site
            claims no ownership of them. The plain-language summaries, categories and significance
            scores are produced here and are not part of the official record.
          </p>
        </div>

        <div className="legal-sec">
          <h3>Independent</h3>
          <p>
            Not affiliated with, endorsed by, or connected to the New Zealand Government, the
            Department of Internal Affairs, or the New Zealand Gazette.
          </p>
        </div>

        <div className="legal-sec">
          <h3>Not advice</h3>
          <p>
            Nothing here is legal, financial or credit advice. A notice records that something was
            published on a date. It does not establish the current status of any company or person.
            Company registration and director records are held by the Companies Office; land titles
            are held by LINZ.
          </p>
        </div>

        <div className="legal-sec">
          <h3>Accuracy</h3>
          <p>
            This is a copy of the record and can be incomplete or behind the official publication. A
            search finding nothing is not proof that nothing was published — check the Gazette
            directly if it matters.
          </p>
        </div>

        <div className="legal-sec">
          <h3>Corrections and contact</h3>
          <p>
            If something here is wrong, or you are named in a notice and want to raise it, write to{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </div>

        <div className="legal-sec">
          <h3>Source code</h3>
          <p>
            Open source. The search API and offline pipeline are at{" "}
            <a href={REPO_BACKEND} target="_blank" rel="noreferrer">
              nzfineprint-backend
            </a>
            ; this interface is at{" "}
            <a href={REPO_FRONTEND} target="_blank" rel="noreferrer">
              nzfineprint-frontend
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
