import {
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  Clock3,
  Dices,
  Plus,
  Search,
  Trophy,
} from "lucide-react";

import GageCard from "./GageCard";

function GagesSection({
  gages = [],
  members = [],

  gageLeaderboard = [],
  gageLeaderboardLoading = false,
  gageLeaderboardError = null,

  loading = false,
  error = null,

  onCreate,
  onOpen,
}) {
  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const filteredGages =
    useMemo(() => {
      let result = [...gages];

      if (filter !== "all") {
        result = result.filter(
          (gage) =>
            gage.status === filter,
        );
      }

      if (search.trim()) {
        const value = search
          .trim()
          .toLowerCase();

        result = result.filter(
          (gage) => {
            return (
              gage.title
                ?.toLowerCase()
                .includes(value) ||
              gage.description
                ?.toLowerCase()
                .includes(value) ||
              gage.assignedProfile
                ?.nickname
                ?.toLowerCase()
                .includes(value) ||
              gage.assignedProfile
                ?.firstName
                ?.toLowerCase()
                .includes(value)
            );
          },
        );
      }

      return result;
    }, [
      gages,
      search,
      filter,
    ]);

  const rankedGages =
    useMemo(() => {
      const membersById =
        new Map(
          members.map((member) => [
            String(member.id),
            member,
          ]),
        );

      return gageLeaderboard
        .map((row) => ({
          ...row,

          member:
            membersById.get(
              String(
                row.profileId ??
                  row.profile_id,
              ),
            ) ?? null,

          profileId:
            row.profileId ??
            row.profile_id,

          gagePoints:
            Number(
              row.gagePoints ??
                row.gage_points ??
                0,
            ),

          validatedGages:
            Number(
              row.validatedGages ??
                row.validated_gages ??
                0,
            ),
        }))
        .sort((rowA, rowB) => {
          const pointsDifference =
            rowB.gagePoints -
            rowA.gagePoints;

          if (
            pointsDifference !== 0
          ) {
            return pointsDifference;
          }

          const gagesDifference =
            rowB.validatedGages -
            rowA.validatedGages;

          if (
            gagesDifference !== 0
          ) {
            return gagesDifference;
          }

          return String(
            rowA.member?.nickname ??
              rowA.member?.firstName ??
              "",
          ).localeCompare(
            String(
              rowB.member?.nickname ??
                rowB.member?.firstName ??
                "",
            ),
            "fr",
            {
              sensitivity: "base",
            },
          );
        });
    }, [
      members,
      gageLeaderboard,
    ]);

  const stats = {
    total:
      gages.length,

    pending:
      gages.filter(
        (gage) =>
          gage.status ===
          "pending",
      ).length,

    completed:
      gages.filter(
        (gage) =>
          gage.status ===
            "completed" ||
          gage.status ===
            "validated",
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
            Tous les défis attribués
            aux membres des
            Co&apos;Pintes.
          </p>
        </div>

        <div className="gages-header__stats">
          <div>
            <Dices size={22} />

            <span>
              <strong>
                {stats.total}
              </strong>

              <small>
                Gages
              </small>
            </span>
          </div>

          <div>
            <Clock3 size={22} />

            <span>
              <strong>
                {stats.pending}
              </strong>

              <small>
                À faire
              </small>
            </span>
          </div>

          <div>
            <CheckCircle2
              size={22}
            />

            <span>
              <strong>
                {stats.completed}
              </strong>

              <small>
                Terminés
              </small>
            </span>
          </div>
        </div>
      </header>

      <section className="gage-leaderboard glass-panel">
        <header className="gage-leaderboard__header">
          <div>
            <span className="section-tag">
              Classement
            </span>

            <h2>
              Champions des gages
            </h2>

            <p>
              Classement basé uniquement
              sur les points gagnés grâce
              aux gages validés.
            </p>
          </div>

          <div className="gage-leaderboard__icon">
            <Trophy size={25} />
          </div>
        </header>

        {gageLeaderboardLoading ? (
          <div className="gage-leaderboard__state">
            Chargement du classement…
          </div>
        ) : gageLeaderboardError ? (
          <div className="gage-leaderboard__state gage-leaderboard__state--error">
            {gageLeaderboardError}
          </div>
        ) : rankedGages.length ===
          0 ? (
          <div className="gage-leaderboard__state">
            Aucun point de gage pour
            le moment.
          </div>
        ) : (
          <div className="gage-leaderboard__list">
            {rankedGages.map(
              (row, index) => {
                const member =
                  row.member;

                const avatarUrl =
                  member?.avatarUrl ??
                  member?.avatar_url ??
                  null;

                const memberName =
                  member?.nickname ??
                  member?.firstName ??
                  member?.first_name ??
                  "Membre";

                const initials =
                  member?.initials ??
                  memberName
                    .split(/\s+/)
                    .map(
                      (part) =>
                        part[0],
                    )
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                return (
                  <article
                    key={
                      row.profileId
                    }
                    className={[
                      "gage-leaderboard__member",
                      index === 0
                        ? "gage-leaderboard__member--first"
                        : "",
                      index === 1
                        ? "gage-leaderboard__member--second"
                        : "",
                      index === 2
                        ? "gage-leaderboard__member--third"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span className="gage-leaderboard__rank">
                      #{index + 1}
                    </span>

                    <div className="gage-leaderboard__identity">
                      <div className="gage-leaderboard__avatar">
                        {avatarUrl ? (
                          <img
                            src={
                              avatarUrl
                            }
                            alt=""
                          />
                        ) : (
                          <span>
                            {initials}
                          </span>
                        )}
                      </div>

                      <div className="gage-leaderboard__member-info">
                        <strong>
                          {memberName}
                        </strong>

                        <small>
                          {
                            row.validatedGages
                          }{" "}
                          gage
                          {row.validatedGages >
                          1
                            ? "s"
                            : ""}{" "}
                          validé
                          {row.validatedGages >
                          1
                            ? "s"
                            : ""}
                        </small>
                      </div>
                    </div>

                    <strong className="gage-leaderboard__points">
                      {row.gagePoints.toLocaleString(
                        "fr-FR",
                      )}{" "}
                      pts
                    </strong>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>

      <div className="gages-toolbar">
        <div className="gages-search">
          <Search size={18} />

          <input
            type="search"
            placeholder="Rechercher un gage..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
          />
        </div>

        <div className="gages-filters">
          {[
            [
              "all",
              "Tous",
            ],
            [
              "pending",
              "À faire",
            ],
            [
              "in_progress",
              "En cours",
            ],
            [
              "completed",
              "Réalisés",
            ],
            [
              "validated",
              "Validés",
            ],
          ].map(
            ([
              id,
              label,
            ]) => (
              <button
                key={id}
                type="button"
                className={
                  filter === id
                    ? "gages-filter gages-filter--active"
                    : "gages-filter"
                }
                onClick={() =>
                  setFilter(id)
                }
              >
                {label}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={onCreate}
        >
          <Plus size={18} />
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
        filteredGages.length ===
          0 && (
          <div className="gages-empty glass-panel">
            <Dices size={44} />

            <h2>
              Aucun gage
            </h2>

            <p>
              Aucun gage ne
              correspond à votre
              recherche.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        filteredGages.length >
          0 && (
          <div className="gages-grid">
            {filteredGages.map(
              (gage) => (
                <GageCard
                  key={gage.id}
                  gage={gage}
                  onOpen={
                    onOpen
                  }
                />
              ),
            )}
          </div>
        )}
    </section>
  );
}

export default GagesSection;