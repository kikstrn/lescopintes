import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  ChevronDown,
  LoaderCircle,
  Minus,
  Plus,
  RotateCcw,
  Trophy,
  UserRound,
  UsersRound,
  X,
  Trash2,
  CalendarDays,
} from "lucide-react";

function createDefaultSets() {
  return [
    {
      teamOne: 0,
      teamTwo: 0,
    },
    {
      teamOne: 0,
      teamTwo: 0,
    },
  ];
}

function getTodayValue() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getInitialPlayers(members) {
  return {
    playerOneId: members[0]?.id ?? "",
    playerTwoId: members[1]?.id ?? "",
    playerThreeId: members[2]?.id ?? "",
    playerFourId: members[3]?.id ?? "",
  };
}

function ScoreControl({
  value,
  disabled,
  onDecrease,
  onIncrease,
}) {
  return (
    <div className="score-control">
      <button
        type="button"
        aria-label="Retirer un jeu"
        disabled={disabled}
        onClick={onDecrease}
      >
        <Minus size={18} />
      </button>

      <motion.strong
        key={value}
        initial={{
          opacity: 0,
          scale: 0.75,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
      >
        {value}
      </motion.strong>

      <button
        type="button"
        aria-label="Ajouter un jeu"
        disabled={disabled}
        onClick={onIncrease}
      >
        <Plus size={18} />
      </button>
    </div>
  );
}

function PlayerSelect({
  label,
  value,
  members,
  excludedIds,
  disabled,
  onChange,
}) {
  const selectedMember = members.find(
    (member) => member.id === value,
  );

  return (
    <label className="score-player">
      <span>{label}</span>

      <div className="score-player__select">
        <span className="score-player__avatar">
          {selectedMember?.initials ?? "CP"}
        </span>

        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Choisir</option>

          {members.map((member) => (
            <option
              key={member.id}
              value={member.id}
              disabled={
                excludedIds.includes(member.id) &&
                member.id !== value
              }
            >
              {member.nickname}
            </option>
          ))}
        </select>

        <ChevronDown size={17} />
      </div>
    </label>
  );
}

function ScoreModal({
  open,
  members = [],
  saving = false,
  onClose,
  onSave,
}) {
  const [matchType, setMatchType] = useState("single");

  const [playerOneId, setPlayerOneId] = useState("");
  const [playerTwoId, setPlayerTwoId] = useState("");
  const [playerThreeId, setPlayerThreeId] = useState("");
  const [playerFourId, setPlayerFourId] = useState("");

  const [sets, setSets] = useState(() => createDefaultSets());
  const [playedDate, setPlayedDate] = useState(getTodayValue());
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
  if (!open) {
    return;
  }

  document.body.classList.add(
    "modal-is-open",
  );

  return () => {
    document.body.classList.remove(
      "modal-is-open",
    );
  };
}, [open]);

  const resetForm = () => {
    const initialPlayers = getInitialPlayers(members);

    setMatchType("single");
    setPlayerOneId(initialPlayers.playerOneId);
    setPlayerTwoId(initialPlayers.playerTwoId);
    setPlayerThreeId(initialPlayers.playerThreeId);
    setPlayerFourId(initialPlayers.playerFourId);

    /*
     * Un nouveau tableau est créé à chaque fois.
     * React détecte donc correctement la réinitialisation.
     */
    setSets(createDefaultSets());
    setPlayedDate(getTodayValue());
    setNotes("");
    setErrorMessage("");
  };

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, members]);

  const allSelectedIds = [
    playerOneId,
    playerTwoId,
    playerThreeId,
    playerFourId,
  ].filter(Boolean);

  const getMember = (memberId) =>
    members.find((member) => member.id === memberId);

  const playerOne = getMember(playerOneId);
  const playerTwo = getMember(playerTwoId);
  const playerThree = getMember(playerThreeId);
  const playerFour = getMember(playerFourId);

  const teamOneName =
    matchType === "double"
      ? `${playerOne?.nickname ?? "Joueur 1"} / ${playerTwo?.nickname ?? "Joueur 2"
      }`
      : playerOne?.nickname ?? "Joueur 1";

  const teamTwoName =
    matchType === "double"
      ? `${playerThree?.nickname ?? "Joueur 3"} / ${playerFour?.nickname ?? "Joueur 4"
      }`
      : playerTwo?.nickname ?? "Joueur 2";

  const result = useMemo(() => {
    let teamOneSets = 0;
    let teamTwoSets = 0;
    let hasTiedSet = false;

    sets.forEach((set) => {
      if (set.teamOne > set.teamTwo) {
        teamOneSets += 1;
      } else if (set.teamTwo > set.teamOne) {
        teamTwoSets += 1;
      } else {
        hasTiedSet = true;
      }
    });

    const winnerTeam =
      teamOneSets === teamTwoSets
        ? null
        : teamOneSets > teamTwoSets
          ? 1
          : 2;

    return {
      teamOneSets,
      teamTwoSets,
      winnerTeam,
      hasTiedSet,
    };
  }, [sets]);

  const updateSet = (setIndex, team, change) => {
    setSets((currentSets) =>
      currentSets.map((set, index) => {
        if (index !== setIndex) {
          return set;
        }

        return {
          ...set,
          [team]: Math.max(
            0,
            Math.min(20, set[team] + change),
          ),
        };
      }),
    );

    setErrorMessage("");
  };

  const addSet = () => {
    if (sets.length >= 5) {
      return;
    }

    setSets((currentSets) => [
      ...currentSets,
      {
        teamOne: 0,
        teamTwo: 0,
      },
    ]);
  };

  const removeSet = (setIndex) => {
    if (sets.length <= 2) {
      return;
    }

    setSets((currentSets) =>
      currentSets.filter((_, index) => index !== setIndex),
    );
  };

  const handleMatchTypeChange = (newType) => {
    setMatchType(newType);
    setSets(createDefaultSets());
    setErrorMessage("");
  };

  const handleSubmit = async () => {
    setErrorMessage("");

    const requiredPlayers =
      matchType === "double"
        ? [
          playerOneId,
          playerTwoId,
          playerThreeId,
          playerFourId,
        ]
        : [playerOneId, playerTwoId];

    if (requiredPlayers.some((playerId) => !playerId)) {
      setErrorMessage(
        matchType === "double"
          ? "Sélectionne les quatre joueurs."
          : "Sélectionne les deux joueurs.",
      );
      return;
    }

    if (new Set(requiredPlayers).size !== requiredPlayers.length) {
      setErrorMessage(
        "Un même joueur ne peut pas être sélectionné plusieurs fois.",
      );
      return;
    }

    if (result.hasTiedSet) {
      setErrorMessage(
        "Aucun set ne peut se terminer sur une égalité.",
      );
      return;
    }

    if (!result.winnerTeam) {
      setErrorMessage("Le match doit avoir un vainqueur.");
      return;
    }

    if (!playedDate) {
      setErrorMessage("Renseigne la date du match.");
      return;
    }

    try {
      await onSave({
        matchType,
        playerOneId,
        playerTwoId,
        playerThreeId:
          matchType === "double" ? playerThreeId : null,
        playerFourId:
          matchType === "double" ? playerFourId : null,
        sets,
        playedAt: new Date(
          `${playedDate}T12:00:00`,
        ).toISOString(),
        notes,
      });
    } catch (error) {
      setErrorMessage(
        error?.message ??
        "Impossible d’enregistrer le match.",
      );
    }
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
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.97,
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
                    Tennis
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
                disabled={saving}
                onClick={onClose}
              >
                <X size={21} />
              </button>
            </header>

            <div className="score-modal__body">
              <section className="score-modal__step score-modal__step--match-type">
                <div className="score-modal__step-heading">
                  <strong>
                    <span>1.</span>
                    Type de match
                  </strong>

                  <p>Choisis le format de la rencontre</p>
                </div>

                <div className="score-modal__match-types">
                  <button
                    type="button"
                    className={
                      matchType === "single"
                        ? "score-modal__match-type score-modal__match-type--active"
                        : "score-modal__match-type"
                    }
                    disabled={saving}
                    onClick={() => handleMatchTypeChange("single")}
                  >
                    <span className="score-modal__match-type-icon">
                      <UserRound size={26} />
                    </span>

                    <span className="score-modal__match-type-content">
                      <strong>SIMPLE</strong>
                      <small>Un contre un</small>
                    </span>

                    {matchType === "single" && (
                      <span className="score-modal__match-type-check">
                        <Check size={18} />
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    className={
                      matchType === "double"
                        ? "score-modal__match-type score-modal__match-type--active"
                        : "score-modal__match-type"
                    }
                    disabled={saving}
                    onClick={() => handleMatchTypeChange("double")}
                  >
                    <span className="score-modal__match-type-icon">
                      <UsersRound size={27} />
                    </span>

                    <span className="score-modal__match-type-content">
                      <strong>DOUBLE</strong>
                      <small>Deux contre deux</small>
                    </span>

                    {matchType === "double" && (
                      <span className="score-modal__match-type-check">
                        <Check size={18} />
                      </span>
                    )}
                  </button>
                </div>
              </section>

              <section className="score-modal__step">
                <div className="score-modal__step-heading">
                  <strong>
                    <span>2.</span>
                    Date du match
                  </strong>
                </div>

                <label className="score-modal__date-control">
                  <CalendarDays size={19} />

                  <input
                    type="date"
                    value={playedDate}
                    disabled={saving}
                    onChange={(event) => {
                      setPlayedDate(event.target.value);
                      setErrorMessage("");
                    }}
                  />
                </label>
              </section>

              <section className="score-modal__teams-step">
                {matchType === "single" ? (
                  <>
                    <section className="score-modal__team-panel">
                      <div className="score-modal__team-heading">
                        <strong>
                          <span>3.</span>
                          Joueur 1
                        </strong>
                      </div>

                      <PlayerSelect
                        label="Joueur"
                        value={playerOneId}
                        members={members}
                        excludedIds={allSelectedIds}
                        disabled={saving}
                        onChange={setPlayerOneId}
                      />
                    </section>

                    <div className="score-modal__versus-display">
                      <span />
                      <strong>VS</strong>
                      <span />
                    </div>

                    <section className="score-modal__team-panel">
                      <div className="score-modal__team-heading">
                        <strong>
                          <span>4.</span>
                          Joueur 2
                        </strong>
                      </div>

                      <PlayerSelect
                        label="Joueur"
                        value={playerTwoId}
                        members={members}
                        excludedIds={allSelectedIds}
                        disabled={saving}
                        onChange={setPlayerTwoId}
                      />
                    </section>
                  </>
                ) : (
                  <>
                    <section className="score-modal__team-panel">
                      <div className="score-modal__team-heading">
                        <strong>
                          <span>3.</span>
                          Équipe 1
                        </strong>
                      </div>

                      <PlayerSelect
                        label="Joueur 1"
                        value={playerOneId}
                        members={members}
                        excludedIds={allSelectedIds}
                        disabled={saving}
                        onChange={setPlayerOneId}
                      />

                      <PlayerSelect
                        label="Joueur 2"
                        value={playerTwoId}
                        members={members}
                        excludedIds={allSelectedIds}
                        disabled={saving}
                        onChange={setPlayerTwoId}
                      />
                    </section>

                    <div className="score-modal__versus-display">
                      <span />
                      <strong>VS</strong>
                      <span />
                    </div>

                    <section className="score-modal__team-panel">
                      <div className="score-modal__team-heading">
                        <strong>
                          <span>4.</span>
                          Équipe 2
                        </strong>
                      </div>

                      <PlayerSelect
                        label="Joueur 3"
                        value={playerThreeId}
                        members={members}
                        excludedIds={allSelectedIds}
                        disabled={saving}
                        onChange={setPlayerThreeId}
                      />

                      <PlayerSelect
                        label="Joueur 4"
                        value={playerFourId}
                        members={members}
                        excludedIds={allSelectedIds}
                        disabled={saving}
                        onChange={setPlayerFourId}
                      />
                    </section>
                  </>
                )}
              </section>

              <section className="score-modal__step score-modal__step--sets">
                <div className="score-modal__step-heading score-modal__step-heading--inline">
                  <strong>
                    <span>5.</span>
                    Sets
                  </strong>

                  <small>Best of 3 ou 5</small>
                </div>


                <div className="score-modal__scoreboard">
                  <div className="score-modal__scoreboard-header">
                    <span>Sets</span>
                    <strong>{teamOneName}</strong>
                    <strong>{teamTwoName}</strong>
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
                          value={set.teamOne}
                          disabled={saving}
                          onDecrease={() =>
                            updateSet(index, "teamOne", -1)
                          }
                          onIncrease={() =>
                            updateSet(index, "teamOne", 1)
                          }
                        />

                        <ScoreControl
                          value={set.teamTwo}
                          disabled={saving}
                          onDecrease={() =>
                            updateSet(index, "teamTwo", -1)
                          }
                          onIncrease={() =>
                            updateSet(index, "teamTwo", 1)
                          }
                        />

                        <button
                          type="button"
                          className="score-modal__remove-set"
                          aria-label={`Supprimer le set ${index + 1}`}
                          disabled={sets.length <= 2 || saving}
                          onClick={() => removeSet(index)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  className="score-modal__add-set"
                  disabled={sets.length >= 5 || saving}
                  onClick={addSet}
                >
                  <Plus size={17} />
                  Ajouter un set
                </button>
              </section>

              <section className="score-modal__step">
                <div className="score-modal__step-heading score-modal__step-heading--inline">
                  <strong>
                    <span>6.</span>
                    Commentaire
                  </strong>

                  <small>Optionnel</small>
                </div>

                <label className="score-modal__notes">

                  <textarea
                    value={notes}
                    rows={3}
                    maxLength={500}
                    disabled={saving}
                    placeholder="Ex. Match très serré…"
                    onChange={(event) =>
                      setNotes(event.target.value)
                    }
                  />

                  <span className="score-modal__notes-count">
                    {notes.length} / 500
                  </span>
                </label>
              </section>

              {errorMessage && (
                <motion.div
                  className="score-modal__error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  role="alert"
                >
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </div>

            <footer className="score-modal__footer">
              <button
                type="button"
                className="secondary-button"
                disabled={saving}
                onClick={resetForm}
              >
                <RotateCcw size={17} />
                Réinitialiser
              </button>

              <motion.button
                type="button"
                className="primary-button"
                whileTap={{
                  scale: 0.97,
                }}
                disabled={saving}
                onClick={handleSubmit}
              >
                {saving ? (
                  <>
                    <LoaderCircle
                      className="score-modal__spinner"
                      size={18}
                    />
                    Enregistrement…
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Enregistrer le match
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