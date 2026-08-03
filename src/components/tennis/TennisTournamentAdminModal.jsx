import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Check,
  Copy,
  Pencil,
  RefreshCw,
  Save,
  Shuffle,
  Trash2,
  Trophy,
  UserRoundCog,
  X,
  XCircle,
} from "lucide-react";

function toDateTimeLocal(
  value,
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  const timezoneOffset =
    date.getTimezoneOffset() *
    60_000;

  return new Date(
    date.getTime() -
      timezoneOffset,
  )
    .toISOString()
    .slice(0, 16);
}

function TennisTournamentAdminModal({
  open = false,
  mode = "edit",
  tournament,
  saving = false,
  error = null,
  onClose,
  onSaveTournament,
  onSaveSeeds,
  onRegenerate,
  onDuplicate,
  onCancelTournament,
  onDeleteTournament,
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
    orderedPlayers,
    setOrderedPlayers,
  ] = useState([]);

  const [
    confirmation,
    setConfirmation,
  ] = useState("");

  const [
    localError,
    setLocalError,
  ] = useState(null);

  useEffect(() => {
    if (
      !open ||
      !tournament
    ) {
      return;
    }

    setName(
      tournament.name ?? "",
    );

    setDescription(
      tournament.description ??
      "",
    );

    setGenerationMode(
      tournament.generationMode ??
      "elo",
    );

    setStartsAt(
      toDateTimeLocal(
        tournament.startsAt,
      ),
    );

    setOrderedPlayers(
      [...(
        tournament.players ?? []
      )].sort(
        (playerA, playerB) =>
          playerA.seed -
          playerB.seed,
      ),
    );

    setConfirmation("");
    setLocalError(null);
  }, [
    open,
    tournament,
    mode,
  ]);

  const hasPlayedMatch =
    useMemo(
      () =>
        Boolean(
          tournament?.matches?.some(
            (match) =>
              match.tennisMatchId ||
              match.status ===
                "completed",
          ),
        ),
      [tournament],
    );

  if (
    !open ||
    !tournament
  ) {
    return null;
  }

  const movePlayer = (
    index,
    direction,
  ) => {
    const targetIndex =
      index + direction;

    if (
      targetIndex < 0 ||
      targetIndex >=
        orderedPlayers.length
    ) {
      return;
    }

    setOrderedPlayers(
      (currentPlayers) => {
        const nextPlayers =
          [...currentPlayers];

        [
          nextPlayers[index],
          nextPlayers[targetIndex],
        ] = [
          nextPlayers[targetIndex],
          nextPlayers[index],
        ];

        return nextPlayers;
      },
    );
  };

  const submitEdit =
    async (event) => {
      event.preventDefault();

      if (!name.trim()) {
        setLocalError(
          "Le nom est obligatoire.",
        );
        return;
      }

      setLocalError(null);

      await onSaveTournament?.({
        tournamentId:
          tournament.id,

        name:
          name.trim(),

        description:
          description.trim(),

        generationMode,

        startsAt:
          startsAt
            ? new Date(
                startsAt,
              ).toISOString()
            : null,
      });
  };

  const submitSeeds =
    async () => {
      if (hasPlayedMatch) {
        setLocalError(
          "L’ordre ne peut plus être modifié après le premier résultat.",
        );
        return;
      }

      await onSaveSeeds?.({
        tournamentId:
          tournament.id,

        orderedProfileIds:
          orderedPlayers.map(
            (player) =>
              player.profileId,
          ),
      });
  };

  const destructiveReady =
    confirmation.trim() ===
    tournament.name.trim();

  const titles = {
    edit:
      "Modifier le tournoi",
    players:
      "Modifier l’ordre des joueurs",
    regenerate:
      "Régénérer le tableau",
    duplicate:
      "Dupliquer le tournoi",
    cancel:
      "Annuler le tournoi",
    delete:
      "Supprimer le tournoi",
  };

  return (
    <div className="tournament-admin-backdrop">
      <section
        className="tournament-admin-modal glass-panel"
        role="dialog"
        aria-modal="true"
      >
        <header className="tournament-admin-modal__header">
          <div>
            <span className="section-heading__eyebrow">
              Administration
            </span>

            <h2>
              {titles[mode]}
            </h2>

            <p>
              {tournament.name}
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

        {mode === "edit" && (
          <form
            className="tournament-admin-form"
            onSubmit={submitEdit}
          >
            <label>
              <span>
                Nom
              </span>

              <input
                value={name}
                maxLength={100}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>
                Description
              </span>

              <textarea
                value={description}
                maxLength={500}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>
                Date de début
              </span>

              <div className="tournament-admin-input-icon">
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

            <fieldset className="tournament-admin-mode-grid">
              <legend>
                Mode de génération
              </legend>

              <button
                type="button"
                className={
                  generationMode ===
                  "elo"
                    ? "tournament-admin-choice tournament-admin-choice--active"
                    : "tournament-admin-choice"
                }
                onClick={() =>
                  setGenerationMode(
                    "elo",
                  )
                }
              >
                <Trophy size={19} />
                Selon l’ELO
              </button>

              <button
                type="button"
                className={
                  generationMode ===
                  "random"
                    ? "tournament-admin-choice tournament-admin-choice--active"
                    : "tournament-admin-choice"
                }
                onClick={() =>
                  setGenerationMode(
                    "random",
                  )
                }
              >
                <Shuffle size={19} />
                Aléatoire
              </button>
            </fieldset>

            <footer>
              <button
                type="button"
                className="secondary-button"
                onClick={onClose}
              >
                Annuler
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                <Save size={17} />
                Enregistrer
              </button>
            </footer>
          </form>
        )}

        {mode === "players" && (
          <div className="tournament-admin-players">
            {hasPlayedMatch && (
              <p className="tournament-admin-warning">
                Un résultat existe déjà : l’ordre des joueurs est verrouillé.
              </p>
            )}

            <div className="tournament-admin-player-list">
              {orderedPlayers.map(
                (player, index) => (
                  <article
                    key={player.id}
                    className="tournament-admin-player"
                  >
                    <strong>
                      #{index + 1}
                    </strong>

                    <span className="tournament-admin-player__avatar">
                      {player.profile
                        ?.avatarUrl ? (
                        <img
                          src={
                            player.profile
                              .avatarUrl
                          }
                          alt=""
                        />
                      ) : (
                        player.profile
                          ?.initials ??
                        "CP"
                      )}
                    </span>

                    <span>
                      <b>
                        {player.profile
                          ?.nickname ??
                          "Membre"}
                      </b>

                      <small>
                        ELO{" "}
                        {player.startingElo}
                      </small>
                    </span>

                    <div>
                      <button
                        type="button"
                        aria-label="Monter"
                        disabled={
                          hasPlayedMatch ||
                          index === 0
                        }
                        onClick={() =>
                          movePlayer(
                            index,
                            -1,
                          )
                        }
                      >
                        <ArrowUp
                          size={16}
                        />
                      </button>

                      <button
                        type="button"
                        aria-label="Descendre"
                        disabled={
                          hasPlayedMatch ||
                          index ===
                            orderedPlayers.length -
                              1
                        }
                        onClick={() =>
                          movePlayer(
                            index,
                            1,
                          )
                        }
                      >
                        <ArrowDown
                          size={16}
                        />
                      </button>
                    </div>
                  </article>
                ),
              )}
            </div>

            <footer>
              <button
                type="button"
                className="secondary-button"
                onClick={onClose}
              >
                Fermer
              </button>

              <button
                type="button"
                className="primary-button"
                disabled={
                  saving ||
                  hasPlayedMatch
                }
                onClick={
                  submitSeeds
                }
              >
                <UserRoundCog
                  size={17}
                />
                Enregistrer l’ordre
              </button>
            </footer>
          </div>
        )}

        {[
          "regenerate",
          "duplicate",
          "cancel",
          "delete",
        ].includes(mode) && (
          <div className="tournament-admin-confirm">
            <span
              className={[
                "tournament-admin-confirm__icon",
                mode === "delete" ||
                mode === "cancel"
                  ? "tournament-admin-confirm__icon--danger"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {mode ===
              "regenerate" ? (
                <RefreshCw
                  size={25}
                />
              ) : mode ===
                "duplicate" ? (
                <Copy size={25} />
              ) : mode ===
                "cancel" ? (
                <XCircle
                  size={25}
                />
              ) : (
                <Trash2
                  size={25}
                />
              )}
            </span>

            <h3>
              {mode ===
              "regenerate"
                ? "Recréer entièrement le tableau ?"
                : mode ===
                    "duplicate"
                  ? "Créer une copie du tournoi ?"
                  : mode ===
                      "cancel"
                    ? "Annuler ce tournoi ?"
                    : "Supprimer définitivement ce tournoi ?"}
            </h3>

            <p>
              {mode ===
              "regenerate"
                ? "Cette action est possible uniquement avant le premier résultat."
                : mode ===
                    "duplicate"
                  ? "Les cinq joueurs et le mode de génération seront conservés."
                  : mode ===
                      "cancel"
                    ? "Le tournoi restera consultable, mais aucun nouveau résultat ne devra être ajouté."
                    : "Le tournoi, ses joueurs et son tableau seront supprimés. Les matchs tennis déjà enregistrés ne seront pas supprimés."}
            </p>

            {mode ===
              "regenerate" &&
              hasPlayedMatch && (
                <p className="tournament-admin-warning">
                  Impossible : au moins un match possède déjà un résultat.
                </p>
              )}

            {(mode === "delete" ||
              mode === "cancel") && (
              <label className="tournament-admin-confirm__name">
                <span>
                  Recopie le nom du tournoi pour confirmer
                </span>

                <input
                  value={confirmation}
                  placeholder={
                    tournament.name
                  }
                  onChange={(event) =>
                    setConfirmation(
                      event.target.value,
                    )
                  }
                />
              </label>
            )}

            <footer>
              <button
                type="button"
                className="secondary-button"
                onClick={onClose}
              >
                Retour
              </button>

              <button
                type="button"
                className={
                  mode === "delete" ||
                  mode === "cancel"
                    ? "danger-button"
                    : "primary-button"
                }
                disabled={
                  saving ||
                  (mode ===
                    "regenerate" &&
                    hasPlayedMatch) ||
                  ((mode ===
                    "delete" ||
                    mode ===
                      "cancel") &&
                    !destructiveReady)
                }
                onClick={() => {
                  if (
                    mode ===
                    "regenerate"
                  ) {
                    return onRegenerate?.(
                      tournament.id,
                    );
                  }

                  if (
                    mode ===
                    "duplicate"
                  ) {
                    return onDuplicate?.(
                      tournament.id,
                    );
                  }

                  if (
                    mode ===
                    "cancel"
                  ) {
                    return onCancelTournament?.(
                      tournament.id,
                    );
                  }

                  return onDeleteTournament?.(
                    tournament.id,
                  );
                }}
              >
                {mode ===
                "regenerate" ? (
                  <RefreshCw
                    size={17}
                  />
                ) : mode ===
                  "duplicate" ? (
                  <Copy size={17} />
                ) : mode ===
                  "cancel" ? (
                  <XCircle
                    size={17}
                  />
                ) : (
                  <Trash2
                    size={17}
                  />
                )}

                Confirmer
              </button>
            </footer>
          </div>
        )}

        {(localError ||
          error) && (
          <p className="tournament-admin-error">
            {localError ??
              error}
          </p>
        )}
      </section>
    </div>
  );
}

export default TennisTournamentAdminModal;
