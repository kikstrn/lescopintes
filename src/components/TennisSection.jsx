import {
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ChevronDown,
  History,
  Medal,
  Plus,
  Target,
  Trophy,
} from "lucide-react";

function formatMatchDate(value) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function TennisSection({
  matches = [],
  members = [],
  loading,
  error,
  onAddMatch,
}) {
  const [selectedPlayerId, setSelectedPlayerId] =
    useState("all");

  const ranking = useMemo(() => {
    return [...members].sort(
      (memberA, memberB) =>
        memberB.elo - memberA.elo,
    );
  }, [members]);

  const filteredMatches = useMemo(() => {
    if (selectedPlayerId === "all") {
      return matches;
    }

    return matches.filter(
      (match) =>
        match.playerOne?.id ===
          selectedPlayerId ||
        match.playerTwo?.id ===
          selectedPlayerId,
    );
  }, [matches, selectedPlayerId]);

  const totalSets = matches.reduce(
    (total, match) =>
      total + match.sets.length,
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
            classement ELO.
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

          <button
            type="button"
            className="primary-button"
            onClick={onAddMatch}
          >
            <Plus size={18} />
            Ajouter un match
          </button>
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

      <section className="tennis-section__layout">
        <article className="tennis-ranking glass-panel">
          <div className="tennis-card-heading">
            <div>
              <span className="section-heading__eyebrow">
                Classement
              </span>

              <h3>Classement ELO</h3>
            </div>

            <span>
              <Medal size={20} />
            </span>
          </div>

          <div className="tennis-ranking__list">
            {ranking.map((member, index) => {
              const total =
                member.wins + member.losses;

              const rate =
                total > 0
                  ? Math.round(
                      (member.wins / total) *
                        100,
                    )
                  : 0;

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
                    {member.initials}
                  </span>

                  <div className="tennis-ranking__identity">
                    <strong>
                      {member.nickname}
                    </strong>

                    <small>
                      {member.wins} V ·{" "}
                      {member.losses} D ·{" "}
                      {rate} %
                    </small>
                  </div>

                  <div className="tennis-ranking__elo">
                    <strong>
                      {member.elo}
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
                    {member.nickname}
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
                    {match.sets.map((set) => (
                      <span key={set.id}>
                        {set.playerOne}
                        {"–"}
                        {set.playerTwo}
                      </span>
                    ))}
                  </div>

                  {match.notes && (
                    <p>
                      {match.notes}
                    </p>
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
            Le classement est automatique
          </strong>

          <p>
            Chaque résultat met à jour les
            victoires, les défaites et le niveau
            ELO des deux joueurs.
          </p>
        </div>

        <Trophy size={22} />
      </footer>
    </section>
  );
}

export default TennisSection;