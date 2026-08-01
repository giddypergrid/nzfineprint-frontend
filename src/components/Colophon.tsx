/** Footer — carries the required non-affiliation disclaimer and the route to the legal page. */
export default function Colophon({ onOpenLegal }: { onOpenLegal: () => void }) {
  return (
    <div className="colophon">
      NZ Gazette Fine Print · Independent public-record search
      <br />
      Not affiliated with or endorsed by the New Zealand Government or the New Zealand Gazette
      <br />
      <button type="button" className="colophon-link" onClick={onOpenLegal}>
        About &amp; legal
      </button>
    </div>
  );
}
