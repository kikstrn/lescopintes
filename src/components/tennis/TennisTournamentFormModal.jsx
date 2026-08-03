import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  Check,
  Shuffle,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";

function getMemberElo(member) {
  return Number(
    member?.tennisElo ??
    member?.tennis_elo ??
    member?.elo ??
    1500,
  );
}

function TennisTournamentFormModal({
  open = false,
  members = [],
  currentProfileId,
  saving = false,
  error = null,
  onClose,
  onSubmit,
}) {
  const [name, setName] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    generationMode,
    setGenerationMode,
  ] = useState("elo");

  const [
    startsAt,
    setStartsAt,
  ] = useState("");

  const [
    selectedIds,
    setSelectedIds,
  ] = useState([]);

  const [
    localError,
    setLocalError,
  ] = useState(null);

  const sortedMembers =
    useMemo(
      () =>
        [...members].sort(
          (memberA, memberB) =>
            getMemberElo(
              memberB,
            ) -
            getMemberElo(
              memberA,
            ),
        ),
      [members],
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    setName("");
    setDescription("");
    setGenerationMode("elo");
    setStartsAt("");
    setLocalError(null);

    setSelectedIds(
      sortedMembers
        .slice(0, 5)
        .map(
          (member) =>
            member.id,
        ),
    );
  }, [
    open,
    sortedMembers,
  ]);

  if (!open) {
    return null;
  }

  const toggleMember = (
    memberId,
  ) => {
    setSelectedIds(
      (currentIds) => {
        if (
          currentIds.includes(
            memberId,
          )
        ) {
          return currentIds.filter(
            (id) =>
              id !== memberId,
          );
        }

        if (
          currentIds.length >= 5
        ) {
          setLocalError(
            "Le tournoi est limité à 5 joueurs.",
          );

          return currentIds;
        }

        setLocalError(null);

        return [
          ...currentIds,
          memberId,
        ];
      },
    );
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (!name.trim()) {
        setLocalError(
          "Saisis un nom pour le tournoi.",
        );
        return;
      }

      if (
        selectedIds.length !== 5
      ) {
        setLocalError(
          "Sélectionne exactement 5 joueurs.",
        );
        return;
      }

      setLocalError(null);

      await onSubmit?.({
        name:
          name.trim(),

        description:
          description.trim(),

        generationMode,

        participantIds:
          selectedIds,

        createdBy:
          currentProfileId,

        startsAt:
          startsAt
            ? new Date(
                startsAt,
              ).toISOString()
            : null,
      });
  };

  return (
    <div
      className="tournament-modal-backdrop"
      role="presentation"
    >
      <section
        className="tournament-modal glass-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tournament-modal-title"
      >
        <header className="tournament-modal__header">
          <div>
            <span className="section-heading__eyebrow">
              Compétition
            </span>

            <h2 id="tournament-modal-title">
              Créer un tournoi
            </h2>

            <p>
              Simple à 5 joueurs avec génération automatique du tableau.
            </p>
          </div>

          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>

        <form
          className="tournament-form"
          onSubmit={handleSubmit}
        >
          <label className="tournament-form__field">
            <span>
              Nom du tournoi
            </span>

            <input
              type="text"
              value={name}
              maxLength={100}
              placeholder="Tournoi d’été"
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
            />
          </label>

          <label className="tournament-form__field">
            <span>
              Description
            </span>

            <textarea
              value={description}
              maxLength={500}
              placeholder="Une courte description facultative…"
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
            />
          </label>

          <label className="tournament-form__field">
            <span>
              Date de début
            </span>

            <div className="tournament-form__input-icon">
              <CalendarDays
                size={17}
              />

              <input
                type="datetime-local"
                value={startsAt}
                onChange={(event) =>
                  setStartsAt(
                    event.target.value,
                  )
                }
              />
            </div>
          </label>

          <fieldset className="tournament-form__modes">
            <legend>
              Génération du tableau
            </legend>

            <button
              type="button"
              className={
                generationMode ===
                "elo"
                  ? "tournament-mode tournament-mode--active"
                  : "tournament-mode"
              }
              onClick={() =>
                setGenerationMode(
                  "elo",
                )
              }
            >
              <Trophy size={20} />

              <span>
                <strong>
                  Selon l’ELO
                </strong>

                <small>
                  Les deux ELO les plus faibles jouent le préliminaire.
                </small>
              </span>
            </button>

            <button
              type="button"
              className={
                generationMode ===
                "random"
                  ? "tournament-mode tournament-mode--active"
                  : "tournament-mode"
              }
              onClick={() =>
                setGenerationMode(
                  "random",
                )
              }
            >
              <Shuffle size={20} />

              <span>
                <strong>
                  Tirage aléatoire
                </strong>

                <small>
                  Les cinq positions sont mélangées.
                </small>
              </span>
            </button>
          </fieldset>

          <fieldset className="tournament-form__players">
            <legend>
              Participants
              <span>
                {selectedIds.length}/5
              </span>
            </legend>

            <div className="tournament-player-list">
              {sortedMembers.map(
                (member) => {
                  const selected =
                    selectedIds.includes(
                      member.id,
                    );

                  return (
                    <button
                      key={member.id}
                      type="button"
                      className={
                        selected
                          ? "tournament-player tournament-player--selected"
                          : "tournament-player"
                      }
                      onClick={() =>
                        toggleMember(
                          member.id,
                        )
                      }
                    >
                      <span className="tournament-player__avatar">
                        {member.avatarUrl ||
                        member.avatar_url ? (
                          <img
                            src={
                              member.avatarUrl ??
                              member.avatar_url
                            }
                            alt=""
                          />
                        ) : (
                          member.initials ??
                          member.nickname
                            ?.slice(
                              0,
                              2,
                            )
                            .toUpperCase() ??
                          "CP"
                        )}
                      </span>

                      <span className="tournament-player__identity">
                        <strong>
                          {member.nickname ??
                            member.firstName ??
                            "Membre"}
                        </strong>

                        <small>
                          ELO{" "}
                          {getMemberElo(
                            member,
                          )}
                        </small>
                      </span>

                      <span className="tournament-player__check">
                        {selected && (
                          <Check
                            size={16}
                          />
                        )}
                      </span>
                    </button>
                  );
                },
              )}
            </div>
          </fieldset>

          {(localError ||
            error) && (
            <p className="tournament-form__error">
              {localError ??
                error}
            </p>
          )}

          <footer className="tournament-form__footer">
            <button
              type="button"
              className="secondary-button"
              disabled={saving}
              onClick={onClose}
            >
              Annuler
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={
                saving ||
                selectedIds.length !==
                  5
              }
            >
              <Sparkles size={18} />

              {saving
                ? "Création…"
                : "Créer le tableau"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default TennisTournamentFormModal;
