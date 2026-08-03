import {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  Clock3,
  History,
  Pencil,
  RotateCcw,
  ShieldAlert,
  Trophy,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

const ACTION_CONTENT = {
  edit_result: {
    icon: Pencil,
    title: "Modifier le résultat",
    description:
      "Le score actuel sera chargé dans le formulaire afin de préparer sa correction.",
    confirmLabel:
      "Préparer la modification",
    tone: "warning",
  },

  cancel_result: {
    icon: XCircle,
    title: "Annuler le résultat",
    description:
      "Cette action retirera ensuite le vainqueur du tableau et rouvrira le match.",
    confirmLabel:
      "Préparer l’annulation",
    tone: "danger",
  },

  replay: {
    icon: RotateCcw,
    title: "Rejouer le match",
    description:
      "Le résultat sera ensuite annulé, mais les deux joueurs resteront affectés à ce match.",
    confirmLabel:
      "Préparer le nouveau match",
    tone: "warning",
  },

  history: {
    icon: History,
    title: "Historique du match",
    description:
      "Le journal détaillé des actions sera disponible dans le ZIP 2.1B.",
    confirmLabel:
      "Fermer",
    tone: "neutral",
  },
};

function getPlayerName(player) {
  return (
    player?.nickname ??
    player?.firstName ??
    "En attente"
  );
}

const HISTORY_LABELS = {
  created:
    "Match créé",

  score_added:
    "Résultat ajouté",

  score_edited:
    "Résultat modifié",

  result_cancelled:
    "Résultat annulé",

  replayed:
    "Match remis à jouer",

  players_changed:
    "Joueurs modifiés",

  status_changed:
    "Statut modifié",

  deleted:
    "Match supprimé",
};

function formatHistoryDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(
    new Date(value),
  );
}

function getHistoryLabel(action) {
  return (
    HISTORY_LABELS[action] ??
    action ??
    "Modification"
  );
}

function TennisTournamentMatchAdminModal({
  open = false,
  action = "history",
  match,
  history = [],
  historyLoading = false,
  historyError = null,

  resetImpact = null,
  resetImpactLoading = false,
  resetImpactError = null,

  saving = false,
  error = null,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] =
    useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setReason("");
  }, [
    open,
    action,
    match?.id,
  ]);

  if (!open || !match) {
    return null;
  }

  const content =
    ACTION_CONTENT[action] ??
    ACTION_CONTENT.history;

  const Icon = content.icon;

  const completed =
    match.status === "completed";

  return (
    <div className="match-admin-preview-backdrop">
      <section
        className="match-admin-preview-modal glass-panel"
        role="dialog"
        aria-modal="true"
      >
        <header>
          <div>
            <span className="section-heading__eyebrow">
              Administration du match
            </span>

            <h2>{content.title}</h2>
          </div>

          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>

        <div
          className={`match-admin-preview-icon match-admin-preview-icon--${content.tone}`}
        >
          <Icon size={27} />
        </div>

        <div className="match-admin-preview-versus">
          <article>
            <strong>
              {getPlayerName(
                match.playerOne,
              )}
            </strong>

            <small>
              ELO {match.playerOne?.elo ?? "—"}
            </small>
          </article>

          <span>VS</span>

          <article>
            <strong>
              {getPlayerName(
                match.playerTwo,
              )}
            </strong>

            <small>
              ELO {match.playerTwo?.elo ?? "—"}
            </small>
          </article>
        </div>

        <p className="match-admin-preview-description">
          {content.description}
        </p>

        {completed &&
          action !== "history" && (
            <div className="match-admin-preview-warning">
              <ShieldAlert size={18} />

              <span>
                Dans les prochaines étapes,
                cette action vérifiera aussi les
                matchs suivants, le champion,
                l’ELO, les points et l’XP.
              </span>
            </div>
          )}


        {(action === "cancel_result" ||
          action === "replay") && (
          <section className="match-reset-impact">
            <header>
              <strong>
                Conséquences sur le tableau
              </strong>
            </header>

            {resetImpactLoading && (
              <div className="match-reset-impact__state">
                Analyse de la branche…
              </div>
            )}

            {!resetImpactLoading &&
              resetImpactError && (
                <div className="match-reset-impact__state match-reset-impact__state--error">
                  {resetImpactError}
                </div>
              )}

            {!resetImpactLoading &&
              !resetImpactError &&
              resetImpact && (
                <div className="match-reset-impact__summary">
                  <article>
                    <strong>
                      {
                        resetImpact
                          .affectedMatchCount
                      }
                    </strong>

                    <span>
                      match(s) concerné(s)
                    </span>
                  </article>

                  <article>
                    <strong>
                      {
                        resetImpact
                          .completedMatchCount
                      }
                    </strong>

                    <span>
                      résultat(s) invalidé(s)
                    </span>
                  </article>

                  <article>
                    <strong>
                      {resetImpact
                        .championWillBeRemoved
                        ? "Oui"
                        : "Non"}
                    </strong>

                    <span>
                      champion retiré
                    </span>
                  </article>
                </div>
              )}

            {!resetImpactLoading &&
              !resetImpactError &&
              resetImpact
                ?.affectedMatches
                ?.length > 0 && (
                <div className="match-reset-impact__matches">
                  {resetImpact
                    .affectedMatches
                    .map(
                      (
                        affectedMatch,
                      ) => (
                        <div
                          key={
                            affectedMatch.id
                          }
                        >
                          <span>
                            {
                              affectedMatch
                                .round_label
                            }
                          </span>

                          <small>
                            {
                              affectedMatch
                                .status
                            }
                          </small>
                        </div>
                      ),
                    )}
                </div>
              )}
          </section>
        )}

        {(action === "cancel_result" ||
          action === "replay") && (
          <label className="match-admin-reason">
            <span>
              Motif de la correction
            </span>

            <textarea
              value={reason}
              maxLength={500}
              placeholder="Exemple : score saisi par erreur…"
              onChange={(event) =>
                setReason(
                  event.target.value,
                )
              }
            />

            <small>
              Le motif sera conservé dans l’historique du match.
            </small>
          </label>
        )}

        {action === "history" && (
          <div className="match-history-panel">
            {historyLoading && (
              <div className="match-history-state">
                <Clock3 size={21} />

                <strong>
                  Chargement de l’historique…
                </strong>
              </div>
            )}

            {!historyLoading &&
              historyError && (
                <div className="match-history-state match-history-state--error">
                  <ShieldAlert
                    size={21}
                  />

                  <strong>
                    {historyError}
                  </strong>
                </div>
              )}

            {!historyLoading &&
              !historyError &&
              history.length === 0 && (
                <div className="match-history-state">
                  <History size={22} />

                  <strong>
                    Aucun événement
                  </strong>

                  <small>
                    Les prochaines actions sur ce match apparaîtront ici.
                  </small>
                </div>
              )}

            {!historyLoading &&
              !historyError &&
              history.length > 0 && (
                <div className="match-history-timeline">
                  {history.map(
                    (entry) => (
                      <article
                        key={entry.id}
                        className="match-history-entry"
                      >
                        <span className="match-history-entry__marker">
                          <CheckCircle2
                            size={15}
                          />
                        </span>

                        <div className="match-history-entry__content">
                          <header>
                            <strong>
                              {getHistoryLabel(
                                entry.action,
                              )}
                            </strong>

                            <time>
                              {formatHistoryDate(
                                entry.createdAt,
                              )}
                            </time>
                          </header>

                          <p>
                            {entry.note ||
                              "Action enregistrée automatiquement."}
                          </p>

                          <footer>
                            <UserRound
                              size={14}
                            />

                            <span>
                              {entry.author
                                ?.nickname ??
                                "Système"}
                            </span>
                          </footer>
                        </div>
                      </article>
                    ),
                  )}
                </div>
              )}
          </div>
        )}

        {error && (
          <p className="match-admin-action-error">
            {error}
          </p>
        )}

        <footer>
          <button
            type="button"
            className={
              action === "history"
                ? "primary-button"
                : "secondary-button"
            }
            onClick={onClose}
          >
            {action === "history"
              ? "Fermer"
              : "Annuler"}
          </button>

          {action !== "history" && (
            <button
              type="button"
              className={
                content.tone === "danger"
                  ? "danger-button"
                  : "primary-button"
              }
              disabled={
                saving ||
                resetImpactLoading ||
                Boolean(
                  resetImpactError,
                )
              }
              onClick={() =>
                onConfirm?.({
                  reason:
                    reason.trim(),
                })
              }
            >
              <Icon size={17} />

              {saving
                ? "Traitement…"
                : content.confirmLabel}
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}

export default TennisTournamentMatchAdminModal;
