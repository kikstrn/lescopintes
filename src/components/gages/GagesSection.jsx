import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Dices,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import GageCard from "./GageCard";

function GagesSection({
  gages = [],
  loading = false,
  error = null,
  onCreate,
  onOpen,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredGages = useMemo(() => {
    let result = [...gages];

    if (filter !== "all") {
      result = result.filter(
        (gage) => gage.status === filter,
      );
    }

    if (search.trim()) {
      const value = search.toLowerCase();

      result = result.filter((gage) => {
        return (
          gage.title?.toLowerCase().includes(value) ||
          gage.description
            ?.toLowerCase()
            .includes(value) ||
          gage.assignedProfile?.nickname
            ?.toLowerCase()
            .includes(value)
        );
      });
    }

    return result;
  }, [gages, search, filter]);

  const stats = {
    total: gages.length,
    pending: gages.filter(
      (g) => g.status === "pending",
    ).length,
    completed: gages.filter(
      (g) =>
        g.status === "completed" ||
        g.status === "validated",
    ).length,
  };

  return (
    <section className="gages-section">

      <header className="gages-header glass-panel">
        <div className="gages-header__content">

          <span className="section-tag">
            Les gages
          </span>

          <h1>Les gages</h1>

          <p>
            Tous les défis attribués aux
            membres des Co'Pintes.
          </p>

        </div>

        <div className="gages-header__stats">

          <div>
            <Dices size={22}/>
            <span>
              <strong>{stats.total}</strong>
              <small>Gages</small>
            </span>
          </div>

          <div>
            <Clock3 size={22}/>
            <span>
              <strong>{stats.pending}</strong>
              <small>À faire</small>
            </span>
          </div>

          <div>
            <CheckCircle2 size={22}/>
            <span>
              <strong>{stats.completed}</strong>
              <small>Terminés</small>
            </span>
          </div>

        </div>

      </header>

      <div className="gages-toolbar">

        <div className="gages-search">

          <Search size={18}/>

          <input
            placeholder="Rechercher un gage..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        <div className="gages-filters">

          {[
            ["all","Tous"],
            ["pending","À faire"],
            ["in_progress","En cours"],
            ["completed","Terminés"],
          ].map(([id,label]) => (

            <button
              key={id}
              type="button"
              className={
                filter===id
                  ? "gages-filter gages-filter--active"
                  : "gages-filter"
              }
              onClick={() => setFilter(id)}
            >
              {label}
            </button>

          ))}

        </div>

        <button
          className="primary-button"
          onClick={onCreate}
        >
          <Plus size={18}/>
          Nouveau gage
        </button>

      </div>

      {loading && (
        <div className="gages-state">
          Chargement...
        </div>
      )}

      {!loading && error && (
        <div className="gages-state gages-state--error">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        filteredGages.length === 0 && (

        <div className="gages-empty glass-panel">

          <Dices size={44}/>

          <h2>Aucun gage</h2>

          <p>
            Aucun gage ne correspond à
            votre recherche.
          </p>

        </div>

      )}

      {!loading &&
        !error &&
        filteredGages.length > 0 && (

        <div className="gages-grid">

          {filteredGages.map((gage) => (

            <GageCard
              key={gage.id}
              gage={gage}
              onOpen={onOpen}
            />

          ))}

        </div>

      )}

    </section>
  );
}

export default GagesSection;