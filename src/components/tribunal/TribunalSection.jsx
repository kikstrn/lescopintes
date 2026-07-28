import { useMemo, useState } from "react";
import {
  CircleAlert,
  Gavel,
  Plus,
  Scale,
  Search,
  Vote,
} from "lucide-react";

import TribunalCaseCard from "./TribunalCaseCard";

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function TribunalSection({
  cases = [],
  loading = false,
  saving = false,
  error = null,
  isAdmin = false,
  onCreate,
  onOpenCase,
}) {
  const [searchValue, setSearchValue] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const filteredCases = useMemo(() => {
    const normalizedSearch =
      normalizeText(searchValue);

    return cases
      .filter((tribunalCase) => {
        if (
          statusFilter !== "all" &&
          tribunalCase.status !== statusFilter
        ) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const accused =
          tribunalCase.accusedProfile ??
          tribunalCase.accused ??
          {};

        const author =
          tribunalCase.createdByProfile ??
          tribunalCase.author ??
          {};

        const searchableText = [
          tribunalCase.title,
          tribunalCase.description,
          tribunalCase.reason,
          accused.nickname,
          accused.firstName,
          author.nickname,
          author.firstName,
        ]
          .map(normalizeText)
          .join(" ");

        return searchableText.includes(
          normalizedSearch,
        );
      })
      .sort((caseA, caseB) => {
        const dateA = new Date(
          caseA.createdAt ??
            caseA.created_at ??
            0,
        ).getTime();

        const dateB = new Date(
          caseB.createdAt ??
            caseB.created_at ??
            0,
        ).getTime();

        return dateB - dateA;
      });
  }, [
    cases,
    searchValue,
    statusFilter,
  ]);

  const pendingCount = useMemo(() => {
    return cases.filter(
      (tribunalCase) =>
        tribunalCase.status === "pending",
    ).length;
  }, [cases]);

  const votingCount = useMemo(() => {
    return cases.filter(
      (tribunalCase) =>
        tribunalCase.status === "voting",
    ).length;
  }, [cases]);

  const judgedCount = useMemo(() => {
    return cases.filter(
      (tribunalCase) =>
        tribunalCase.status === "judged",
    ).length;
  }, [cases]);

  if (loading) {
    return (
      <section className="tribunal-section">
        <div className="tribunal-state glass-panel">
          <span className="data-status__spinner" />

          <div>
            <strong>
              Chargement du tribunal
            </strong>

            <p>
              Récupération des affaires en cours…
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="tribunal-section">
        <div className="tribunal-state tribunal-state--error glass-panel">
          <CircleAlert size={34} />

          <div>
            <strong>
              Impossible de charger le tribunal
            </strong>

            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="tribunal-section">
      <header className="tribunal-header glass-panel">
        <div className="tribunal-header__content">
          <span className="section-heading__eyebrow">
            Justice interne
          </span>

          <h1>Le tribunal</h1>

          <p>
            Dépose une plainte, consulte les
            affaires en cours et participe aux
            votes de la bande.
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={onCreate}
            disabled={saving}
          >
            <Plus size={18} />
            Nouvelle affaire
          </button>
        </div>

        <div className="tribunal-header__stats">
          <div>
            <Scale size={20} />

            <span>
              <strong>
                {pendingCount}
              </strong>

              <small>En attente</small>
            </span>
          </div>

          <div>
            <Vote size={20} />

            <span>
              <strong>
                {votingCount}
              </strong>

              <small>Votes en cours</small>
            </span>
          </div>

          <div>
            <Gavel size={20} />

            <span>
              <strong>
                {judgedCount}
              </strong>

              <small>Jugées</small>
            </span>
          </div>
        </div>
      </header>

      <div className="tribunal-toolbar">
        <label className="tribunal-search">
          <Search size={18} />

          <input
            type="search"
            value={searchValue}
            placeholder="Rechercher une affaire…"
            onChange={(event) =>
              setSearchValue(
                event.target.value,
              )
            }
          />
        </label>

        <div
          className="tribunal-filters"
          role="group"
          aria-label="Filtrer les affaires"
        >
          <button
            type="button"
            className={
              statusFilter === "all"
                ? "tribunal-filter tribunal-filter--active"
                : "tribunal-filter"
            }
            onClick={() =>
              setStatusFilter("all")
            }
          >
            Toutes
          </button>

          <button
            type="button"
            className={
              statusFilter === "pending"
                ? "tribunal-filter tribunal-filter--active"
                : "tribunal-filter"
            }
            onClick={() =>
              setStatusFilter("pending")
            }
          >
            En attente
          </button>

          <button
            type="button"
            className={
              statusFilter === "voting"
                ? "tribunal-filter tribunal-filter--active"
                : "tribunal-filter"
            }
            onClick={() =>
              setStatusFilter("voting")
            }
          >
            Vote en cours
          </button>

          <button
            type="button"
            className={
              statusFilter === "judged"
                ? "tribunal-filter tribunal-filter--active"
                : "tribunal-filter"
            }
            onClick={() =>
              setStatusFilter("judged")
            }
          >
            Jugées
          </button>
        </div>
      </div>

      {filteredCases.length === 0 ? (
        <div className="tribunal-empty glass-panel">
          <span>
            <Scale size={30} />
          </span>

          <h2>
            Aucune affaire trouvée
          </h2>

          <p>
            Aucun dossier ne correspond à la
            recherche ou au filtre sélectionné.
          </p>

          <button
            type="button"
            className="secondary-button"
            onClick={onCreate}
          >
            <Plus size={17} />
            Déposer une plainte
          </button>
        </div>
      ) : (
        <div className="tribunal-grid">
          {filteredCases.map(
            (tribunalCase) => (
              <TribunalCaseCard
                key={tribunalCase.id}
                tribunalCase={tribunalCase}
                onOpen={onOpenCase}
              />
            ),
          )}
        </div>
      )}
    </section>
  );
}

export default TribunalSection;