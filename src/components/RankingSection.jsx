import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Bike,
  CalendarCheck,
  Crown,
  Medal,
  Minus,
  Target,
  Trophy,
} from "lucide-react";

const rankingTabs = [
  {
    id: "general",
    label: "Général",
    icon: Trophy,
  },
  {
    id: "tennis",
    label: "Tennis",
    icon: Target,
  },
  {
    id: "bike",
    label: "Cyclisme",
    icon: Bike,
  },
  {
    id: "events",
    label: "Participation",
    icon: CalendarCheck,
  },
];

const positionChanges = {
  1: 0,
  2: 1,
  3: -1,
  4: 1,
  5: -1,
};

function getRankingValue(member, rankingType) {
  switch (rankingType) {
    case "tennis":
      return member.elo ?? 1500;

    case "bike":
      return member.bikeKm ?? 0;

    case "events":
      return member.events ?? 0;

    case "general":
    default:
      return member.points ?? 0;
  }
}

function getRankingUnit(rankingType) {
  switch (rankingType) {
    case "tennis":
      return "ELO";

    case "bike":
      return "km";

    case "events":
      return "événements";

    case "general":
    default:
      return "points";
  }
}

function getRankingDescription(rankingType) {
  switch (rankingType) {
    case "tennis":
      return "Classement calculé à partir des performances et du niveau ELO.";

    case "bike":
      return "Classement basé sur le nombre total de kilomètres parcourus.";

    case "events":
      return "Classement selon la participation aux événements du groupe.";

    case "general":
    default:
      return "Classement global combinant les activités et les performances.";
  }
}

function PositionChange({ value }) {
  if (value > 0) {
    return (
      <span className="ranking-change ranking-change--up">
        <ArrowUp size={14} />
        {value}
      </span>
    );
  }

  if (value < 0) {
    return (
      <span className="ranking-change ranking-change--down">
        <ArrowDown size={14} />
        {Math.abs(value)}
      </span>
    );
  }

  return (
    <span className="ranking-change ranking-change--stable">
      <Minus size={14} />
    </span>
  );
}

function PodiumAvatar({ member, rank }) {
  return (
    <motion.article
      className={`ranking-podium__member ranking-podium__member--${rank}`}
      initial={{
        opacity: 0,
        y: 30,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        delay: rank * 0.1,
        type: "spring",
        stiffness: 240,
        damping: 22,
      }}
    >
      <div className="ranking-podium__identity">
        {rank === 1 && (
          <motion.span
            className="ranking-podium__crown"
            animate={{
              y: [0, -5, 0],
              rotate: [0, -4, 4, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Crown size={27} />
          </motion.span>
        )}

        <div className="ranking-podium__avatar-ring">
          <div className="ranking-podium__avatar">
            {member.initials ??
              member.nickname?.slice(0, 2).toUpperCase()}
          </div>
        </div>

        <strong>{member.nickname}</strong>
        <small>{member.firstName}</small>
      </div>

      <div className="ranking-podium__platform">
        <span>{rank}</span>
      </div>
    </motion.article>
  );
}

function RankingSection({ members = [] }) {
  const [activeTab, setActiveTab] = useState("general");

  const ranking = useMemo(() => {
    return [...members].sort((memberA, memberB) => {
      return (
        getRankingValue(memberB, activeTab) -
        getRankingValue(memberA, activeTab)
      );
    });
  }, [members, activeTab]);

  const first = ranking[0];
  const second = ranking[1];
  const third = ranking[2];

  const unit = getRankingUnit(activeTab);
  const description = getRankingDescription(activeTab);

  const leaderValue = first
    ? getRankingValue(first, activeTab)
    : 0;

  const totalValue = ranking.reduce((total, member) => {
    return total + getRankingValue(member, activeTab);
  }, 0);

  const averageValue =
    ranking.length > 0
      ? Math.round(totalValue / ranking.length)
      : 0;

  return (
    <section className="ranking-section">
      <motion.header
        className="ranking-section__hero glass-panel"
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="ranking-section__hero-content">
          <span className="section-heading__eyebrow">
            Saison 2026
          </span>

          <h2>Classement des Co’Pintes</h2>

          <p>{description}</p>
        </div>

        <div className="ranking-section__hero-stats">
          <div>
            <small>Leader actuel</small>
            <strong>{first?.nickname ?? "—"}</strong>
          </div>

          <div>
            <small>Meilleur score</small>
            <strong>
              {leaderValue.toLocaleString("fr-FR")} {unit}
            </strong>
          </div>

          <div>
            <small>Moyenne du groupe</small>
            <strong>
              {averageValue.toLocaleString("fr-FR")} {unit}
            </strong>
          </div>
        </div>
      </motion.header>

      <div className="ranking-tabs">
        {rankingTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              className={`ranking-tabs__button ${
                isActive ? "ranking-tabs__button--active" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {isActive && (
                <motion.span
                  layoutId="ranking-active-tab"
                  className="ranking-tabs__active-background"
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 34,
                  }}
                />
              )}

              <Icon size={17} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -10,
          }}
          transition={{
            duration: 0.28,
          }}
        >
          <section className="ranking-layout">
            <div className="ranking-podium-card glass-panel">
              <div className="ranking-card-heading">
                <div>
                  <span className="section-heading__eyebrow">
                    Top 3
                  </span>

                  <h3>Podium actuel</h3>
                </div>

                <span className="ranking-card-heading__icon">
                  <Medal size={21} />
                </span>
              </div>

              <div className="ranking-podium">
                {second && (
                  <PodiumAvatar
                    member={second}
                    rank={2}
                  />
                )}

                {first && (
                  <PodiumAvatar
                    member={first}
                    rank={1}
                  />
                )}

                {third && (
                  <PodiumAvatar
                    member={third}
                    rank={3}
                  />
                )}
              </div>
            </div>

            <div className="ranking-table-card glass-panel">
              <div className="ranking-card-heading">
                <div>
                  <span className="section-heading__eyebrow">
                    Classement complet
                  </span>

                  <h3>Tous les membres</h3>
                </div>

                <span className="ranking-card-heading__count">
                  {ranking.length} membres
                </span>
              </div>

              <div className="ranking-table">
                <div className="ranking-table__header">
                  <span>Position</span>
                  <span>Membre</span>
                  <span>Performances</span>
                  <span>Valeur</span>
                  <span>Évolution</span>
                </div>

                <div className="ranking-table__body">
                  {ranking.map((member, index) => {
                    const position = index + 1;
                    const value = getRankingValue(
                      member,
                      activeTab,
                    );

                    const matches =
                      (member.wins ?? 0) +
                      (member.losses ?? 0);

                    const winRate =
                      matches > 0
                        ? Math.round(
                            ((member.wins ?? 0) / matches) * 100,
                          )
                        : 0;

                    return (
                      <motion.article
                        key={member.id}
                        className={`ranking-row ${
                          position === 1
                            ? "ranking-row--leader"
                            : ""
                        }`}
                        initial={{
                          opacity: 0,
                          x: 18,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay: index * 0.05,
                        }}
                      >
                        <div className="ranking-row__position">
                          {position <= 3 ? (
                            <span
                              className={`ranking-row__medal ranking-row__medal--${position}`}
                            >
                              <Medal size={18} />
                            </span>
                          ) : (
                            <strong>{position}</strong>
                          )}
                        </div>

                        <div className="ranking-row__member">
                          <span className="ranking-row__avatar">
                            {member.initials ??
                              member.nickname
                                ?.slice(0, 2)
                                .toUpperCase()}
                          </span>

                          <div>
                            <strong>{member.nickname}</strong>
                            <small>{member.firstName}</small>
                          </div>
                        </div>

                        <div className="ranking-row__performance">
                          {activeTab === "tennis" && (
                            <>
                              <span>
                                {member.wins ?? 0} victoires
                              </span>
                              <small>{winRate} % de réussite</small>
                            </>
                          )}

                          {activeTab === "bike" && (
                            <>
                              <span>
                                {member.bikeKm ?? 0} km parcourus
                              </span>
                              <small>
                                Record annuel personnel
                              </small>
                            </>
                          )}

                          {activeTab === "events" && (
                            <>
                              <span>
                                {member.events ?? 0} participations
                              </span>
                              <small>
                                Activité dans le groupe
                              </small>
                            </>
                          )}

                          {activeTab === "general" && (
                            <>
                              <span>
                                {member.wins ?? 0} victoires
                              </span>
                              <small>
                                {member.events ?? 0} événements
                              </small>
                            </>
                          )}
                        </div>

                        <div className="ranking-row__value">
                          <strong>
                            {value.toLocaleString("fr-FR")}
                          </strong>

                          <small>{unit}</small>
                        </div>

                        <PositionChange
                          value={positionChanges[member.id] ?? 0}
                        />
                      </motion.article>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </motion.div>
      </AnimatePresence>

      <section className="ranking-member-cards">
        {ranking.map((member, index) => {
          const matches =
            (member.wins ?? 0) +
            (member.losses ?? 0);

          const winRate =
            matches > 0
              ? Math.round(
                  ((member.wins ?? 0) / matches) * 100,
                )
              : 0;

          return (
            <motion.article
              key={member.id}
              className="ranking-member-card glass-panel"
              initial={{
                opacity: 0,
                y: 18,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                delay: index * 0.05,
              }}
              whileHover={{
                y: -5,
              }}
            >
              <div className="ranking-member-card__top">
                <span className="ranking-member-card__rank">
                  #{index + 1}
                </span>

                <PositionChange
                  value={positionChanges[member.id] ?? 0}
                />
              </div>

              <div className="ranking-member-card__identity">
                <span className="ranking-member-card__avatar">
                  {member.initials ??
                    member.nickname
                      ?.slice(0, 2)
                      .toUpperCase()}
                </span>

                <div>
                  <strong>{member.nickname}</strong>
                  <small>{member.firstName}</small>
                </div>
              </div>

              <div className="ranking-member-card__stats">
                <div>
                  <small>Points</small>
                  <strong>{member.points ?? 0}</strong>
                </div>

                <div>
                  <small>ELO</small>
                  <strong>{member.elo ?? 1500}</strong>
                </div>

                <div>
                  <small>Victoires</small>
                  <strong>{member.wins ?? 0}</strong>
                </div>

                <div>
                  <small>Réussite</small>
                  <strong>{winRate} %</strong>
                </div>
              </div>

              <div className="ranking-member-card__progress">
                <span>
                  <i
                    style={{
                      width: `${Math.min(100, winRate)}%`,
                    }}
                  />
                </span>
              </div>
            </motion.article>
          );
        })}
      </section>
    </section>
  );
}

export default RankingSection;