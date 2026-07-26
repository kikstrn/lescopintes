import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  Dices,
  History,
  RotateCcw,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";

const gages = [
  "Payer la première tournée",
  "Ramener les chips",
  "Porter un maillot ridicule",
  "Ranger le matériel",
  "Organiser le prochain apéro",
  "Faire dix pompes",
  "Être ramasseur de balles",
  "Apporter les balles neuves",
];

const initialHistory = [
  {
    id: 1,
    member: "Coco",
    initials: "CC",
    reason: "Arrivé avec 35 minutes de retard",
    gage: "Ramener les chips",
    date: "18 juillet 2026",
    status: "pending",
  },
  {
    id: 2,
    member: "Fab",
    initials: "FB",
    reason: "A oublié les balles",
    gage: "Apporter les balles neuves",
    date: "12 juillet 2026",
    status: "done",
  },
  {
    id: 3,
    member: "Tonton",
    initials: "GT",
    reason: "Défaite sans gagner un jeu",
    gage: "Payer la première tournée",
    date: "5 juillet 2026",
    status: "done",
  },
];

function GagesSection({ members = [] }) {
  const [selectedMemberId, setSelectedMemberId] = useState(
    members[0]?.id ?? "",
  );

  const [history, setHistory] = useState(initialHistory);
  const [result, setResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const timeoutRef = useRef(null);

  const selectedMember = useMemo(() => {
    return members.find((member) => {
      return member.id === Number(selectedMemberId);
    });
  }, [members, selectedMemberId]);

  const wheelSegments = useMemo(() => {
    const angle = 360 / gages.length;

    return gages.map((gage, index) => ({
      gage,
      start: index * angle,
      end: (index + 1) * angle,
      color:
        index % 4 === 0
          ? "var(--green)"
          : index % 4 === 1
            ? "var(--blue)"
            : index % 4 === 2
              ? "var(--amber)"
              : "var(--purple)",
    }));
  }, []);

  const spinWheel = () => {
    if (isSpinning || !selectedMember) {
      return;
    }

    setIsSpinning(true);
    setResult(null);

    const selectedIndex = Math.floor(Math.random() * gages.length);
    const segmentAngle = 360 / gages.length;

    /*
     * Le pointeur se trouve en haut.
     * On ajoute plusieurs tours complets avant d'arriver sur le segment choisi.
     */
    const targetAngle =
      360 * 6 +
      (360 - selectedIndex * segmentAngle - segmentAngle / 2);

    const newRotation = rotation + targetAngle;

    setRotation(newRotation);

    timeoutRef.current = window.setTimeout(() => {
      setResult({
        member: selectedMember.nickname,
        initials:
          selectedMember.initials ??
          selectedMember.nickname.slice(0, 2).toUpperCase(),
        gage: gages[selectedIndex],
      });

      setIsSpinning(false);
    }, 3200);
  };

  const confirmResult = () => {
    if (!result) {
      return;
    }

    const newEntry = {
      id: Date.now(),
      member: result.member,
      initials: result.initials,
      reason: "Tirage aléatoire de la roue",
      gage: result.gage,
      date: new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      status: "pending",
    };

    setHistory((currentHistory) => [
      newEntry,
      ...currentHistory,
    ]);

    setResult(null);
  };

  const resetWheel = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setIsSpinning(false);
    setResult(null);
    setRotation(0);
  };

  const toggleStatus = (entryId) => {
    setHistory((currentHistory) =>
      currentHistory.map((entry) => {
        if (entry.id !== entryId) {
          return entry;
        }

        return {
          ...entry,
          status:
            entry.status === "done"
              ? "pending"
              : "done",
        };
      }),
    );
  };

  const pendingCount = history.filter((entry) => {
    return entry.status === "pending";
  }).length;

  const completedCount = history.filter((entry) => {
    return entry.status === "done";
  }).length;

  return (
    <section className="gages-section">
      <motion.header
        className="gages-section__hero glass-panel"
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
        <div className="gages-section__hero-content">
          <span className="section-heading__eyebrow">
            Mauvaise foi autorisée
          </span>

          <h2>Les gages des Co’Pintes</h2>

          <p>
            Choisis un membre, fais tourner la roue et laisse
            le hasard décider de sa prochaine mission.
          </p>
        </div>

        <div className="gages-section__hero-stats">
          <div>
            <small>À réaliser</small>
            <strong>{pendingCount}</strong>
          </div>

          <div>
            <small>Réalisés</small>
            <strong>{completedCount}</strong>
          </div>

          <div>
            <small>Gages disponibles</small>
            <strong>{gages.length}</strong>
          </div>
        </div>
      </motion.header>

      <section className="gages-main-grid">
        <motion.article
          className="gages-wheel-card glass-panel"
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.08,
            duration: 0.42,
          }}
        >
          <div className="gages-card-heading">
            <div>
              <span className="section-heading__eyebrow">
                Tirage aléatoire
              </span>

              <h3>Roue des gages</h3>
            </div>

            <span className="gages-card-heading__icon">
              <Dices size={21} />
            </span>
          </div>

          <label className="gages-member-select">
            <span>Membre concerné</span>

            <div>
              <UserRound size={18} />

              <select
                value={selectedMemberId}
                onChange={(event) => {
                  setSelectedMemberId(event.target.value);
                  setResult(null);
                }}
                disabled={isSpinning}
              >
                {members.map((member) => (
                  <option
                    key={member.id}
                    value={member.id}
                  >
                    {member.nickname}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <div className="gages-wheel-wrapper">
            <div className="gages-wheel-pointer" />

            <motion.div
              className="gages-wheel"
              animate={{
                rotate: rotation,
              }}
              transition={{
                duration: 3.2,
                ease: [0.12, 0.72, 0.18, 1],
              }}
              style={{
                background: `conic-gradient(${wheelSegments
                  .map((segment) => {
                    return `${segment.color} ${segment.start}deg ${segment.end}deg`;
                  })
                  .join(", ")})`,
              }}
            >
              {wheelSegments.map((segment, index) => {
                const segmentAngle = 360 / gages.length;
                const centerAngle =
                  index * segmentAngle +
                  segmentAngle / 2;

                return (
                  <span
                    key={segment.gage}
                    className="gages-wheel__label"
                    style={{
                      transform: `rotate(${centerAngle}deg) translateY(-44%)`,
                    }}
                  >
                    <i
                      style={{
                        transform: `rotate(${-centerAngle}deg)`,
                      }}
                    >
                      {index + 1}
                    </i>
                  </span>
                );
              })}

              <div className="gages-wheel__center">
                <Dices size={30} />
                <span>Co’Pintes</span>
              </div>
            </motion.div>
          </div>

          <div className="gages-wheel-actions">
            <motion.button
              type="button"
              className="primary-button"
              whileTap={{
                scale: 0.97,
              }}
              disabled={
                isSpinning ||
                members.length === 0
              }
              onClick={spinWheel}
            >
              <Sparkles size={18} />
              {isSpinning
                ? "La roue tourne..."
                : "Faire tourner la roue"}
            </motion.button>

            <button
              type="button"
              className="secondary-button"
              disabled={isSpinning}
              onClick={resetWheel}
            >
              <RotateCcw size={17} />
              Réinitialiser
            </button>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div
                className="gages-result"
                initial={{
                  opacity: 0,
                  y: 14,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
              >
                <span className="gages-result__icon">
                  <Trophy size={22} />
                </span>

                <div className="gages-result__content">
                  <small>Le verdict est tombé</small>

                  <strong>{result.member}</strong>

                  <p>{result.gage}</p>
                </div>

                <button
                  type="button"
                  className="primary-button primary-button--compact"
                  onClick={confirmResult}
                >
                  <CheckCircle2 size={17} />
                  Ajouter
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.article>

        <motion.article
          className="gages-list-card glass-panel"
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.14,
            duration: 0.42,
          }}
        >
          <div className="gages-card-heading">
            <div>
              <span className="section-heading__eyebrow">
                Les possibilités
              </span>

              <h3>Liste des gages</h3>
            </div>

            <span className="gages-card-heading__count">
              {gages.length}
            </span>
          </div>

          <div className="gages-options-list">
            {gages.map((gage, index) => (
              <motion.article
                key={gage}
                className="gages-option"
                initial={{
                  opacity: 0,
                  x: 12,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.22 + index * 0.04,
                }}
              >
                <span className="gages-option__number">
                  {index + 1}
                </span>

                <p>{gage}</p>
              </motion.article>
            ))}
          </div>
        </motion.article>
      </section>

      <section className="gages-history-section">
        <div className="section-heading">
          <div>
            <span className="section-heading__eyebrow">
              Suivi
            </span>

            <h2>Historique des gages</h2>
          </div>
        </div>

        <div className="gages-history-grid">
          {history.map((entry, index) => {
            const isDone = entry.status === "done";

            return (
              <motion.article
                key={entry.id}
                className={`gages-history-card glass-panel ${
                  isDone
                    ? "gages-history-card--done"
                    : ""
                }`}
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
                <div className="gages-history-card__top">
                  <div className="gages-history-card__member">
                    <span>
                      {entry.initials}
                    </span>

                    <div>
                      <strong>{entry.member}</strong>
                      <small>{entry.date}</small>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`gages-history-card__status ${
                      isDone
                        ? "gages-history-card__status--done"
                        : ""
                    }`}
                    onClick={() =>
                      toggleStatus(entry.id)
                    }
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 size={15} />
                        Réalisé
                      </>
                    ) : (
                      <>
                        <Clock3 size={15} />
                        À faire
                      </>
                    )}
                  </button>
                </div>

                <div className="gages-history-card__reason">
                  <small>Motif</small>
                  <p>{entry.reason}</p>
                </div>

                <div className="gages-history-card__gage">
                  <span>
                    <Dices size={17} />
                  </span>

                  <div>
                    <small>Gage attribué</small>
                    <strong>{entry.gage}</strong>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <motion.footer
        className="gages-footer glass-panel"
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
      >
        <span className="gages-footer__icon">
          <History size={22} />
        </span>

        <div>
          <strong>
            Un gage n’est officiel qu’une fois validé
          </strong>

          <p>
            Les gages sont là pour rigoler entre amis. Ils
            peuvent être modifiés ou annulés à tout moment par
            l’administrateur.
          </p>
        </div>
      </motion.footer>
    </section>
  );
}

export default GagesSection;