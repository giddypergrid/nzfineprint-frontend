import { useMemo, useState } from "react";
import { FIRST_YEAR, LAST_FULL_YEAR, YEARLY_NOTICE_COUNTS } from "../data/yearly";

// Chart geometry (viewBox units) — same as the prototype.
const W = 360;
const H = 180;
const PAD = { left: 6, right: 6, top: 22, bottom: 24 };

interface Point {
  x: number;
  y: number;
  year: number;
  value: number;
}

/** The year line-graph in the home aside. Hover a year to see its exact count.
 *  `total` comes from /stats: the caption used to hardcode 205,246, which the nightly updater
 *  quietly falsified every time it loaded a notice. Null while it is in flight — the caption drops
 *  the clause rather than print a stale number. */
export default function YearChart({ total }: { total: number | null }) {
  const [hover, setHover] = useState<Point | null>(null);

  const { points, polyline, areaPolygon, peak } = useMemo(() => buildChart(), []);

  return (
    <>
      <div className="chart">
        <svg viewBox={`0 0 ${W} ${H}`}>
          <polygon fill="rgba(153,0,61,0.07)" points={areaPolygon} />
          <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#c2a988" strokeWidth="1" />
          <polyline fill="none" stroke="#99003d" strokeWidth="1.8" points={polyline} />

          <circle cx={peak.x} cy={peak.y} r="3" fill="#99003d" />
          <text x={peak.x} y={peak.y - 7} textAnchor="middle" fontFamily="ui-monospace,monospace" fontSize="9" fill="#99003d">
            peak {peak.value.toLocaleString()}
          </text>

          {hover && <circle cx={hover.x} cy={hover.y} r="4" fill="#99003d" />}

          <text x={PAD.left} y={H - 8} fontFamily="ui-monospace,monospace" fontSize="9" fill="#8a7d6b">
            {FIRST_YEAR}
          </text>
          <text x={W - PAD.right} y={H - 8} textAnchor="end" fontFamily="ui-monospace,monospace" fontSize="9" fill="#8a7d6b">
            {FIRST_YEAR + points.length - 1}
          </text>

          {/* wide transparent hit targets over each year */}
          {points.map((p) => (
            <circle
              key={p.year}
              className="pt"
              cx={p.x}
              cy={p.y}
              r="10"
              fill="transparent"
              onMouseEnter={() => setHover(p)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
        </svg>

        {hover && (
          <div
            className="charttip"
            style={{ left: `${(hover.x / W) * 100}%`, top: `${(hover.y / H) * 100}%` }}
          >
            {hover.year} · {hover.value.toLocaleString()} notices
          </div>
        )}
      </div>
      <div className="chartcap">
        {total !== null && `${total.toLocaleString()} notices in total · `}
        full years {FIRST_YEAR} – {LAST_FULL_YEAR} · hover a year for the count
      </div>
    </>
  );
}

/** Compute the polyline / area / hit-points from the yearly counts. */
function buildChart() {
  const data = YEARLY_NOTICE_COUNTS.slice(0, 26); // drop the partial current year
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const floor = min - span * 0.5; // headroom so the low point never looks like zero

  const xAt = (i: number) => PAD.left + (i * (W - PAD.left - PAD.right)) / (data.length - 1);
  const yAt = (v: number) => PAD.top + (1 - (v - floor) / (max - floor)) * (H - PAD.top - PAD.bottom);

  const points: Point[] = data.map((value, i) => ({
    x: +xAt(i).toFixed(1),
    y: +yAt(value).toFixed(1),
    year: FIRST_YEAR + i,
    value,
  }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPolygon = `${PAD.left},${H - PAD.bottom} ${polyline} ${W - PAD.right},${H - PAD.bottom}`;

  const peakIndex = data.indexOf(max);
  const peak = points[peakIndex];

  return { points, polyline, areaPolygon, peak };
}
