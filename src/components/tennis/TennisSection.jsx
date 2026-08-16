import {
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ChevronDown,
  ExternalLink,
  History,
  Medal,
  Plus,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

function formatMatchDate(value) {
  if (!value) {
    return "Date inconnue";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function getMemberName(member) {
  return (
    member?.nickname ??
    member?.firstName ??
    member?.first_name ??
    "Membre"
  );
}

function getMemberAvatarUrl(member) {
  return (
    member?.avatarUrl ??
    member?.avatar_url ??
    null
  );
}

function getMemberInitials(member) {
  const name = getMemberName(member);

  return (
    member?.initials ??
    name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  );
}

function TennisSection({
  matches = [],
  members = [],
  tennisLeaderboard = [],
  tennisLeaderboardLoading = false,
  tennisLeaderboardError = null,
  loading = false,
  error = null,
  onAddMatch,
}) {
  const [selectedPlayerId, setSelectedPlayerId] =
    useState("all");

  const ranking = useMemo(() => {
    return [...members].sort(
      (memberA, memberB) =>
        Number(memberB.elo ?? 0) -
        Number(memberA.elo ?? 0),
    );
  }, [members]);

  const rankedTennis = useMemo(() => {
    const membersById = new Map(
      members.map((member) => [
        String(member.id),
        member,
      ]),
    );

    return tennisLeaderboard
      .map((row) => {
        const profileId =
          row.profileId ??
          row.profile_id;

        const matchesPlayed = Number(
          row.matchesPlayed ??
          row.matches_played ??
          0,
        );

        const matchesWon = Number(
          row.matchesWon ??
          row.matches_won ??
          0,
        );

        return {
          ...row,
          profileId,
          member:
            membersById.get(
              String(profileId),
            ) ?? null,
          tennisPoints: Number(
            row.tennisPoints ??
            row.tennis_points ??
            0,
          ),
          matchesPlayed,
          matchesWon,
          winRate:
            matchesPlayed > 0
              ? Math.round(
                (matchesWon /
                  matchesPlayed) *
                100,
              )
              : 0,
        };
      })
      .sort((rowA, rowB) => {
        const pointsDifference =
          rowB.tennisPoints -
          rowA.tennisPoints;

        if (pointsDifference !== 0) {
          return pointsDifference;
        }

        const winsDifference =
          rowB.matchesWon -
          rowA.matchesWon;

        if (winsDifference !== 0) {
          return winsDifference;
        }

        return getMemberName(
          rowA.member,
        ).localeCompare(
          getMemberName(rowB.member),
          "fr",
          {
            sensitivity: "base",
          },
        );
      });
  }, [members, tennisLeaderboard]);

  const filteredMatches = useMemo(() => {
    if (selectedPlayerId === "all") {
      return matches;
    }

    return matches.filter((match) => {
      const participantIds = [
        match.playerOne?.id,
        match.playerTwo?.id,
        match.playerThree?.id,
        match.playerFour?.id,
      ]
        .filter(Boolean)
        .map(String);

      return participantIds.includes(
        String(selectedPlayerId),
      );
    });
  }, [matches, selectedPlayerId]);

  const totalSets = matches.reduce(
    (total, match) =>
      total +
      (Array.isArray(match.sets)
        ? match.sets.length
        : 0),
    0,
  );

  return (
    <section className="tennis-section">
      <motion.header
        className="tennis-section__hero glass-panel"
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <div>
          <span className="section-heading__eyebrow">
            Jeu, set et match
          </span>

          <h2>Tennis des Co’Pintes</h2>

          <p>
            Enregistre les résultats, consulte
            l’historique et suis l’évolution du
            classement ELO et des points tennis.
          </p>
        </div>

        <div className="tennis-section__hero-actions">
          <div>
            <small>Matchs</small>
            <strong>{matches.length}</strong>
          </div>

          <div>
            <small>Sets joués</small>
            <strong>{totalSets}</strong>
          </div>

          <div className="tennis-section__action-buttons">
            <a
              href="https://asdro.kstudio.workers.dev
/connexion"
              target="_blank"
              rel="noopener noreferrer"
              className="tennis-booking-button"
              aria-label="Réserver un terrain de tennis"
            >
              <CalendarDays size={18} />

              <span>
                <small>Planning des terrains</small>
                <strong>Réserver un créneau</strong>
              </span>

              <ExternalLink size={16} />
            </a>

            <button
              type="button"
              className="primary-button"
              onClick={onAddMatch}
            >
              <Plus size={18} />
              Ajouter un match
            </button>
          </div>
        </div>
      </motion.header>

      {loading && (
        <div className="data-status glass-panel">
          <span className="data-status__spinner" />

          <div>
            <strong>
              Chargement des matchs
            </strong>

            <p>
              Récupération des résultats Supabase…
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="data-status data-status--error glass-panel">
          <div>
            <strong>
              Impossible de charger les matchs
            </strong>

            <p>{error}</p>
          </div>
        </div>
      )}

      <motion.article
        className="tennis-points-leaderboard glass-panel"
        initial={{
          opacity: 0,
          y: 16,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.08,
        }}
      >
        <div className="tennis-points-leaderboard__header">
          <div>
            <span className="section-heading__eyebrow">
              Points tennis
            </span>

            <h3>Classement Tennis</h3>

            <p>
              5 points pour un match joué et
              15 points supplémentaires pour une victoire.
            </p>
          </div>

          <span className="tennis-points-leaderboard__icon">
            <Sparkles size={21} />
          </span>
        </div>

        {tennisLeaderboardLoading ? (
          <div className="tennis-points-leaderboard__state">
            Chargement du classement…
          </div>
        ) : tennisLeaderboardError ? (
          <div className="tennis-points-leaderboard__state tennis-points-leaderboard__state--error">
            {tennisLeaderboardError}
          </div>
        ) : rankedTennis.length === 0 ? (
          <div className="tennis-points-leaderboard__state">
            Aucun point tennis pour le moment.
          </div>
        ) : (
          <div className="tennis-points-leaderboard__list">
            {rankedTennis.map(
              (row, index) => {
                const member = row.member;
                const memberName =
                  getMemberName(member);
                const avatarUrl =
                  getMemberAvatarUrl(member);

                return (
                  <motion.article
                    key={
                      row.profileId ?? index
                    }
                    className={[
                      "tennis-points-leaderboard__row",
                      index === 0
                        ? "tennis-points-leaderboard__row--leader"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    initial={{
                      opacity: 0,
                      x: 10,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay:
                        0.12 +
                        index * 0.035,
                    }}
                  >
                    <strong className="tennis-points-leaderboard__rank">
                      #{index + 1}
                    </strong>

                    <span className="tennis-points-leaderboard__avatar">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt=""
                        />
                      ) : (
                        getMemberInitials(
                          member,
                        )
                      )}
                    </span>

                    <div className="tennis-points-leaderboard__identity">
                      <strong>
                        {memberName}
                      </strong>

                      <small>
                        {row.matchesWon} victoire
                        {row.matchesWon > 1
                          ? "s"
                          : ""}
                        {" · "}
                        {row.matchesPlayed} match
                        {row.matchesPlayed > 1
                          ? "s"
                          : ""}
                        {" · "}
                        {row.winRate} %
                      </small>
                    </div>

                    <div className="tennis-points-leaderboard__points">
                      <strong>
                        {row.tennisPoints.toLocaleString(
                          "fr-FR",
                        )}
                      </strong>

                      <small>points</small>
                    </div>
                  </motion.article>
                );
              },
            )}
          </div>
        )}
      </motion.article>

      <section className="tennis-section__layout">
        <article className="tennis-ranking glass-panel">
          <div className="tennis-card-heading">
            <div>
              <span className="section-heading__eyebrow">
                Niveau sportif
              </span>

              <h3>Classement ELO</h3>
            </div>

            <span>
              <Medal size={20} />
            </span>
          </div>

          <div className="tennis-ranking__list">
            {ranking.map((member, index) => {
              const wins = Number(
                member.wins ?? 0,
              );
              const losses = Number(
                member.losses ?? 0,
              );
              const total = wins + losses;

              const rate =
                total > 0
                  ? Math.round(
                    (wins / total) * 100,
                  )
                  : 0;

              const avatarUrl =
                getMemberAvatarUrl(member);

              return (
                <motion.article
                  key={member.id}
                  className={
                    index === 0
                      ? "tennis-ranking__row tennis-ranking__row--leader"
                      : "tennis-ranking__row"
                  }
                  initial={{
                    opacity: 0,
                    x: 12,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                >
                  <strong className="tennis-ranking__position">
                    {index + 1}
                  </strong>

                  <span className="tennis-ranking__avatar">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt=""
                      />
                    ) : (
                      getMemberInitials(member)
                    )}
                  </span>

                  <div className="tennis-ranking__identity">
                    <strong>
                      {getMemberName(member)}
                    </strong>

                    <small>
                      {wins} V · {losses} D · {rate} %
                    </small>
                  </div>

                  <div className="tennis-ranking__elo">
                    <strong>
                      {Number(
                        member.elo ?? 1500,
                      )}
                    </strong>

                    <small>ELO</small>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </article>

        <article className="tennis-history glass-panel">
          <div className="tennis-card-heading">
            <div>
              <span className="section-heading__eyebrow">
                Résultats
              </span>

              <h3>Historique des matchs</h3>
            </div>

            <label className="tennis-history__filter">
              <select
                value={selectedPlayerId}
                onChange={(event) =>
                  setSelectedPlayerId(
                    event.target.value,
                  )
                }
              >
                <option value="all">
                  Tous les joueurs
                </option>

                {members.map((member) => (
                  <option
                    key={member.id}
                    value={member.id}
                  >
                    {getMemberName(member)}
                  </option>
                ))}
              </select>

              <ChevronDown size={16} />
            </label>
          </div>

          <div className="tennis-history__list">
            {filteredMatches.map(
              (match, index) => (
                <motion.article
                  key={match.id}
                  className="tennis-match-card"
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.04,
                  }}
                >
                  <div className="tennis-match-card__date">
                    <CalendarDays size={15} />
                    {formatMatchDate(
                      match.playedAt,
                    )}
                  </div>

                  <div className="tennis-match-card__players">
                    <div
                      className={
                        match.winnerTeam === 1
                          ? "tennis-match-player tennis-match-player--winner"
                          : "tennis-match-player"
                      }
                    >
                      <span>
                        {match.playerOne
                          ?.initials}
                      </span>

                      <strong>
                        {match.playerOne
                          ?.nickname}
                      </strong>
                    </div>

                    <div className="tennis-match-card__score">
                      <strong>
                        {match.playerOneSets}
                        {" – "}
                        {match.playerTwoSets}
                      </strong>

                      <small>sets</small>
                    </div>

                    <div
                      className={
                        match.winnerTeam === 2
                          ? "tennis-match-player tennis-match-player--winner"
                          : "tennis-match-player"
                      }
                    >
                      <span>
                        {match.playerTwo
                          ?.initials}
                      </span>

                      <strong>
                        {match.playerTwo
                          ?.nickname}
                      </strong>
                    </div>
                  </div>

                  <div className="tennis-match-card__sets">
                    {(match.sets ?? []).map(
                      (set) => (
                        <span key={set.id}>
                          {set.playerOne}
                          {"–"}
                          {set.playerTwo}
                        </span>
                      ),
                    )}
                  </div>

                  {match.notes && (
                    <p>{match.notes}</p>
                  )}

                  <footer>
                    <Trophy size={15} />

                    Vainqueur :
                    <strong>
                      {match.winner?.nickname}
                    </strong>
                  </footer>
                </motion.article>
              ),
            )}

            {!loading &&
              filteredMatches.length === 0 && (
                <div className="tennis-history__empty">
                  <History size={30} />

                  <strong>
                    Aucun match enregistré
                  </strong>

                  <p>
                    Ajoute le premier résultat
                    pour lancer le classement.
                  </p>
                </div>
              )}
          </div>
        </article>
      </section>

      <footer className="tennis-section__information glass-panel">
        <Target size={22} />

        <div>
          <strong>
            Deux classements complémentaires
          </strong>

          <p>
            Le classement ELO mesure le niveau sportif,
            tandis que les points tennis récompensent
            la participation et les victoires.
          </p>
        </div>

        <Trophy size={22} />
      </footer>
    </section>
  );
}

export default TennisSection;
