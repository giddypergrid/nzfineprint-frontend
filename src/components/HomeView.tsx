import type { CorpusStats } from "../api/types";
import type { SearchMode } from "../lib/ui";
import SearchDeck from "./SearchDeck";
import YearChart from "./YearChart";

interface HomeViewProps {
  mode: SearchMode;
  query: string;
  contextTags: string[];
  submitting: boolean;
  stats: CorpusStats | null;
  onSetMode: (mode: SearchMode) => void;
  onQueryChange: (value: string) => void;
  onRemoveTag: (index: number) => void;
  onSubmit: () => void;
}

/** The front page: the search deck over the leader (hero + year chart). */
export default function HomeView({ stats, ...deck }: HomeViewProps) {
  return (
    <section className="home">
      <SearchDeck {...deck} />

      <div className="leader">
        <div>
          <h2>
            Look up any company, person, or property in the <span className="drop">public record</span>.
          </h2>
          <p>
            Every notice in the New Zealand Gazette since 2000, in one place — liquidations,
            receiverships, company removals, bankruptcies, land and legal notices. Look up your own
            name, or a company you are about to deal with.
          </p>
        </div>
        <div className="aside">
          <h3>Notices recorded each year</h3>
          <YearChart total={stats?.notice_count ?? null} />
        </div>
      </div>
    </section>
  );
}
