import type { Notice } from "../api/types";
import { formatCategory, noticeTitle } from "../lib/format";

interface DetailViewProps {
  notice: Notice;
  onResearch: (entityName: string) => void;
}

/** One notice as a full article — plain-English lead, parties, and the original Gazette text. */
export default function DetailView({ notice, onResearch }: DetailViewProps) {
  const parties = notice.affected_parties ?? [];
  const researchSubject = parties[0] || noticeTitle(notice);

  const copyNotice = () => {
    const text = [
      noticeTitle(notice),
      "",
      notice.plain_english ?? "",
      "",
      `Notice ${notice.id}${notice.landing_url ? " · " + notice.landing_url : ""}`,
    ].join("\n");
    navigator.clipboard?.writeText(text);
  };

  return (
    <article className="article">
      <div className="kick">{formatCategory(notice.event_category) || "Notice"}</div>
      <h2>{noticeTitle(notice)}</h2>

      <div className="byline">
        <span>Notice {notice.id}</span>
        {notice.date && <span>Published {notice.date}</span>}
        {notice.significance_score != null && <span>Significance {notice.significance_score} / 100</span>}
      </div>

      {notice.plain_english && <p className="lead">{notice.plain_english}</p>}

      {parties.length > 0 && (
        <div className="parties-line">
          <span className="lbl">Parties named</span>
          {parties.join("  ·  ")}
        </div>
      )}

      <div className="orig-head">Original notice, as published in the Gazette</div>
      <div className="body">{notice.fulltext || "The original text is not available for this notice."}</div>

      <div className="acts">
        <a className="solid" onClick={() => onResearch(researchSubject)}>
          Research this in depth →
        </a>
        <a onClick={copyNotice}>Copy</a>
        {notice.landing_url && (
          <a href={notice.landing_url} target="_blank" rel="noreferrer">
            View original ↗
          </a>
        )}
      </div>
    </article>
  );
}
