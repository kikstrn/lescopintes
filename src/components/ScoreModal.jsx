import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Minus,
  Plus,
  RotateCcw,
  Trophy,
  X,
} from "lucide-react";

const initialSets = [
  { playerOne: 6, playerTwo: 3 },
  { playerOne: 6, playerTwo: 4 },
];

function ScoreControl({ value, onDecrease, onIncrease }) {
  return (
    <div className="score-control">
      <button
        type="button"
        aria-label="Retirer un jeu"
        onClick={onDecrease}
      >
        <Minus size={18} />
      </button>

      <motion.strong
        key={value}
        initial={{
          opacity: 0,
          scale: 0.75,
          y: 6,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        transition={{
          duration: 0.18,
        }}
      >
        {value}
      </motion.strong>

      <button
        type="button"
        aria-label="Ajouter un jeu"
        onClick={onIncrease}
      >
        <Plus size={18} />
      </button>
    </div>
  );
}

function ScoreModal({ open, members, onClose }) {
  const [playerOneId, setPlayerOneId] = useState(members[0]?.id ?? "");
  const [playerTwoId, setPlayerTwoId] = useState(members[1]?.id ?? "");
  const [sets, setSets] = useState(initialSets);
  const [saved, setSaved] = useState(false);

  const playerOne = useMemo(
    () => members.find((member) => member.id === Number(playerOneId)),
    [members, playerOneId],
  );

  const playerTwo = useMemo(
    () => members.find((member) => member.id === Number(playerTwoId)),
    [members, playerTwoId],
  );

  const winner = useMemo(() => {
    let playerOneSets = 0;
    let playerTwoSets = 0;

    sets.forEach((set) => {
      if (set.playerOne > set.playerTwo) {
        playerOneSets += 1;
      }

      if (set.playerTwo > set.playerOne) {
        playerTwoSets += 1;
      }
    });

    if (playerOneSets === playerTwoSets) {
      return null;
    }

    return playerOneSets > playerTwoSets ? playerOne : playerTwo;
  }, [sets, playerOne, playerTwo]);

  const updateSet = (setIndex, player, change) => {
    setSaved(false);

    setSets((currentSets) =>
      currentSets.map((set, index) => {
        if (index !== setIndex) {
          return set;
        }

        return {
          ...set,
          [player]: Math.max(0, Math.min(20, set[player] + change)),
        };
      }),
    );
  };

  const addSet = () => {
    if (sets.length >= 5) {
      return;
    }

    setSaved(false);

    setSets((currentSets) => [
      ...currentSets,
      {
        playerOne: 0,
        playerTwo: 0,
      },
    ]);
  };

  const removeSet = (index) => {
    if (sets.length <= 1) {
      return;
    }

    setSaved(false);
    setSets((currentSets) =>
      currentSets.filter((_, setIndex) => setIndex !== index),
    );
  };

  const resetScore = () => {
    setSaved(false);
    setSets(initialSets);
  };

  const saveScore = () => {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1100);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="score-modal__overlay"
            aria-label="Fermer la fenêtre"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.section
            className="score-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="score-modal-title"
            initial={{
              opacity: 0,
              scale: 0.94,
              y: 30,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            transition={{
              type: "spring",
              stiffness: 310,
              damping: 28,
            }}
          >
            <div className="score-modal__glow" />

            <header className="score-modal__header">
              <div className="score-modal__title">
                <span className="score-modal__title-icon">
                  <Trophy size={21} />
                </span>

                <div>
                  <span className="section-heading__eyebrow">
                    Module tennis
                  </span>

                  <h2 id="score-modal-title">
                    Ajouter un résultat
                  </h2>
                </div>
              </div>

              <button
                type="button"
                className="icon-button"
                aria-label="Fermer"
                onClick={onClose}
              >
                <X size={21} />
              </button>
            </header>

            <div className="score-modal__body">
              <div className="score-modal__players">
                <label className="score-player">
                  <span>Joueur 1</span>

                  <div className="score-player__select">
                    <span className="score-player__avatar">
                      {playerOne?.initials}
                    </span>

                    <select
                      value={playerOneId}
                      onChange={(event) => {
                        setSaved(false);
                        setPlayerOneId(event.target.value);
                      }}
                    >
                      {members.map((member) => (
                        <option
                          key={member.id}
                          value={member.id}
                          disabled={member.id === Number(playerTwoId)}
                        >
                          {member.nickname}
                        </option>
                      ))}
                    </select>

                    <ChevronDown size={17} />
                  </div>
                </label>

                <div className="score-modal__versus">
                  <span>VS</span>
                </div>

                <label className="score-player">
                  <span>Joueur 2</span>

                  <div className="score-player__select">
                    <span className="score-player__avatar">
                      {playerTwo?.initials}
                    </span>

                    <select
                      value={playerTwoId}
                      onChange={(event) => {
                        setSaved(false);
                        setPlayerTwoId(event.target.value);
                      }}
                    >
                      {members.map((member) => (
                        <option
                          key={member.id}
                          value={member.id}
                          disabled={member.id === Number(playerOneId)}
                        >
                          {member.nickname}
                        </option>
                      ))}
                    </select>

                    <ChevronDown size={17} />
                  </div>
                </label>
              </div>

              <div className="score-modal__scoreboard">
                <div className="score-modal__scoreboard-header">
                  <span>Sets</span>
                  <strong>{playerOne?.nickname}</strong>
                  <strong>{playerTwo?.nickname}</strong>
                  <span />
                </div>

                <AnimatePresence initial={false}>
                  {sets.map((set, index) => (
                    <motion.div
                      key={`set-${index}`}
                      className="score-modal__set"
                      initial={{
                        opacity: 0,
                        height: 0,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                      }}
                    >
                      <span className="score-modal__set-label">
                        Set {index + 1}
                      </span>

                      <ScoreControl
                        value={set.playerOne}
                        onDecrease={() =>
                          updateSet(index, "playerOne", -1)
                        }
                        onIncrease={() =>
                          updateSet(index, "playerOne", 1)
                        }
                      />

                      <ScoreControl
                        value={set.playerTwo}
                        onDecrease={() =>
                          updateSet(index, "playerTwo", -1)
                        }
                        onIncrease={() =>
                          updateSet(index, "playerTwo", 1)
                        }
                      />

                      <button
                        type="button"
                        className="score-modal__remove-set"
                        aria-label={`Supprimer le set ${index + 1}`}
                        disabled={sets.length <= 1}
                        onClick={() => removeSet(index)}
                      >
                        <X size={17} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <button
                type="button"
                className="score-modal__add-set"
                disabled={sets.length >= 5}
                onClick={addSet}
              >
                <Plus size={17} />
                Ajouter un set
              </button>

              <div className="score-modal__result">
                <span>Vainqueur actuel</span>

                <strong>
                  {winner
                    ? `${winner.nickname} mène le match`
                    : "Match à égalité"}
                </strong>
              </div>
            </div>

            <footer className="score-modal__footer">
              <button
                type="button"
                className="secondary-button"
                onClick={resetScore}
              >
                <RotateCcw size={17} />
                Réinitialiser
              </button>

              <motion.button
                type="button"
                className={`primary-button ${
                  saved ? "primary-button--success" : ""
                }`}
                whileTap={{
                  scale: 0.97,
                }}
                onClick={saveScore}
              >
                {saved ? (
                  <>
                    <Check size={18} />
                    Score enregistré
                  </>
                ) : (
                  <>
                    <Trophy size={18} />
                    Enregistrer le score
                  </>
                )}
              </motion.button>
            </footer>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}

export default ScoreModal;