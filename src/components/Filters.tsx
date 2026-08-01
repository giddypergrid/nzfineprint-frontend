import { CATEGORY_FILTERS } from "../lib/facets";

interface FiltersProps {
  category: string | null;
  sinceYear: number;
  minSignificance: number;
  onCategoryChange: (value: string | null) => void; // commits (re-runs the search) at once
  onSinceYearChange: (year: number) => void; // live display only
  onMinSignificanceChange: (value: number) => void; // live display only
  onCommit: () => void; // re-run the search — fired when a slider is released
}

/** The results sidebar: category chips + two range sliders. Sliders show live, apply on release. */
export default function Filters({
  category,
  sinceYear,
  minSignificance,
  onCategoryChange,
  onSinceYearChange,
  onMinSignificanceChange,
  onCommit,
}: FiltersProps) {
  const toggleCategory = (value: string) => onCategoryChange(category === value ? null : value);

  return (
    <aside className="filters">
      <h4>Category</h4>
      {CATEGORY_FILTERS.map((option) => (
        <span
          key={option.value}
          className={category === option.value ? "fchip on" : "fchip"}
          onClick={() => toggleCategory(option.value)}
        >
          {option.label}
        </span>
      ))}

      <h4>Published since</h4>
      <input
        type="range"
        min={2000}
        max={2026}
        value={sinceYear}
        onChange={(event) => onSinceYearChange(Number(event.target.value))}
        onMouseUp={onCommit}
        onTouchEnd={onCommit}
        onKeyUp={onCommit}
      />
      <div className="rangeval">{sinceYear}</div>

      <h4>Min. significance</h4>
      <input
        type="range"
        min={0}
        max={100}
        value={minSignificance}
        onChange={(event) => onMinSignificanceChange(Number(event.target.value))}
        onMouseUp={onCommit}
        onTouchEnd={onCommit}
        onKeyUp={onCommit}
      />
      <div className="rangeval">{minSignificance} / 100</div>
    </aside>
  );
}
