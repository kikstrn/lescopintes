import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Gavel,
  Scale,
  ShieldAlert,
  UserRound,
  Vote,
  X,
} from "lucide-react";

function formatDate(value) {
  if (!value) {
    return "Date inconnue";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusLabel(status) {
  const labels = {
    pending: "En attente",
    voting: "Vote en cours",
    judged: "Jugée",
    dismissed: "Classée sans suite",
  };

  return labels[status] ?? "En attente";
}

function TribunalCaseModal({
  open,
  tribunalCase,
  currentProfile,
  saving = false,
  error = null,
  onClose,
  onVote,
  onStartVoting,
  onJudge,
  onDismiss,
}) {
  if (!tribunalCase) {
    return null;
  }

  const status =
    tribunalCase.status ?? "pending";

  const accused =
    tribunalCase.accusedProfile ??
    tribunalCase.accused ??
    null;

  const author =
    tribunalCase.createdByProfile ??
    tribunalCase.author ??
    null;

  const votes =
    tribunalCase.votes ?? [];

  const currentVote = votes.find(
    (vote) =>
      vote.profileId ===
        currentProfile?.id ||
      vote.profile_id ===
        currentProfile?.id,
  );

  const guiltyVotes = votes.filter(
    (vote) =>
      vote.value === "guilty" ||
      vote.vote === "guilty",
  ).length;

  const notGuiltyVotes = votes.filter(
    (vote) =>
      vote.value === "not_guilty" ||
      vote.vote === "not_guilty",
  ).length;

  const canVote =
    status === "voting" &&
    currentProfile?.id &&
    currentProfile.id !== accused?.id;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="tribunal-case-modal__overlay"
            aria-label="Fermer l’affaire"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.section
            className="tribunal-case-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tribunal-case-modal-title"
            initial={{
              opacity: 0,
              scale: 0.97,
              y: 14,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.98,
              y: 8,
            }}
          >
            <header className="tribunal-case-modal__header">
              <div>
                <span
                  className={[
                    "tribunal-case-modal__status",
                    `tribunal-case-modal__status--${status}`,
                  ].join(" ")}
                >
                  {status === "judged" ? (
                    <Gavel size={16} />
                  ) : status === "voting" ? (
                    <Vote size={16} />
                  ) : (
                    <Scale size={16} />
                  )}

                  {getStatusLabel(status)}
                </span>

                <h2 id="tribunal-case-modal-title">
                  {tribunalCase.title ??
                    "Affaire sans titre"}
                </h2>

                <p>
                  Affaire #
                  {String(
                    tribunalCase.caseNumber ??
                      tribunalCase.id ??
                      "",
                  ).slice(0, 8)}
                </p>
              </div>

              <button
                type="button"
                className="tribunal-case-modal__close"
                aria-label="Fermer"
                onClick={onClose}
              >
                <X size={21} />
              </button>
            </header>

            <div className="tribunal-case-modal__content">
              <section className="tribunal-case-modal__people">
                <article>
                  <div className="tribunal-case-modal__avatar">
                    {accused?.avatarUrl ? (
                      <img
                        src={accused.avatarUrl}
                        alt=""
                      />
                    ) : (
                      accused?.initials ?? "CP"
                    )}
                  </div>

                  <div>
                    <small>Accusé</small>
                    <strong>
                      {accused?.nickname ??
                        accused?.firstName ??
                        "Membre inconnu"}
                    </strong>
                  </div>
                </article>

                <article>
                  <div className="tribunal-case-modal__person-icon">
                    <UserRound size={20} />
                  </div>

                  <div>
                    <small>Plainte déposée par</small>
                    <strong>
                      {author?.nickname ??
                        author?.firstName ??
                        "Membre inconnu"}
                    </strong>
                  </div>
                </article>

                <article>
                  <div className="tribunal-case-modal__person-icon">
                    <CalendarDays size={20} />
                  </div>

                  <div>
                    <small>Date de dépôt</small>
                    <strong>
                      {formatDate(
                        tribunalCase.createdAt ??
                          tribunalCase.created_at,
                      )}
                    </strong>
                  </div>
                </article>
              </section>

              <section className="tribunal-case-modal__reason">
                <div className="tribunal-case-modal__section-title">
                  <ShieldAlert size={19} />
                  <h3>Motif de la plainte</h3>
                </div>

                <p>
                  {tribunalCase.description ??
                    tribunalCase.reason ??
                    "Aucun motif renseigné."}
                </p>
              </section>

              {tribunalCase.evidence && (
                <section className="tribunal-case-modal__evidence">
                  <div className="tribunal-case-modal__section-title">
                    <CircleAlert size={19} />
                    <h3>Preuve ou précision</h3>
                  </div>

                  <p>
                    {tribunalCase.evidence}
                  </p>
                </section>
              )}

              {status === "voting" && (
                <section className="tribunal-case-modal__vote-section">
                  <div className="tribunal-case-modal__section-title">
                    <Vote size={19} />
                    <h3>Vote des membres</h3>
                  </div>

                  <div className="tribunal-case-modal__vote-results">
                    <div>
                      <span>Coupable</span>
                      <strong>{guiltyVotes}</strong>
                    </div>

                    <div>
                      <span>Non coupable</span>
                      <strong>{notGuiltyVotes}</strong>
                    </div>
                  </div>

                  {canVote && (
                    <div className="tribunal-case-modal__vote-actions">
                      <button
                        type="button"
                        className={[
                          "tribunal-vote-button",
                          currentVote?.value ===
                            "guilty" ||
                          currentVote?.vote ===
                            "guilty"
                            ? "tribunal-vote-button--active"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        disabled={saving}
                        onClick={() =>
                          onVote?.({
                            tribunalCase,
                            value: "guilty",
                          })
                        }
                      >
                        <Gavel size={18} />
                        Coupable
                      </button>

                      <button
                        type="button"
                        className={[
                          "tribunal-vote-button",
                          currentVote?.value ===
                            "not_guilty" ||
                          currentVote?.vote ===
                            "not_guilty"
                            ? "tribunal-vote-button--active"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        disabled={saving}
                        onClick={() =>
                          onVote?.({
                            tribunalCase,
                            value:
                              "not_guilty",
                          })
                        }
                      >
                        <CheckCircle2 size={18} />
                        Non coupable
                      </button>
                    </div>
                  )}
                </section>
              )}

              {status === "judged" && (
                <section className="tribunal-case-modal__verdict">
                  <div className="tribunal-case-modal__section-title">
                    <Gavel size={19} />
                    <h3>Verdict</h3>
                  </div>

                  <div className="tribunal-case-modal__verdict-card">
                    <strong>
                      {tribunalCase.verdict ===
                      "guilty"
                        ? "Coupable"
                        : "Non coupable"}
                    </strong>

                    {tribunalCase.sanction && (
                      <p>
                        {tribunalCase.sanction}
                      </p>
                    )}
                  </div>
                </section>
              )}

              {error && (
                <div className="tribunal-case-modal__error">
                  <CircleAlert size={18} />
                  <p>{error}</p>
                </div>
              )}
            </div>

            <footer className="tribunal-case-modal__footer">
              <button
                type="button"
                className="secondary-button"
                onClick={onClose}
              >
                Fermer
              </button>

              {status === "pending" && (
                <>
                  <button
                    type="button"
                    className="secondary-button tribunal-dismiss-button"
                    disabled={saving}
                    onClick={() =>
                      onDismiss?.(
                        tribunalCase,
                      )
                    }
                  >
                    Classer sans suite
                  </button>

                  <button
                    type="button"
                    className="primary-button"
                    disabled={saving}
                    onClick={() =>
                      onStartVoting?.(
                        tribunalCase,
                      )
                    }
                  >
                    <Vote size={17} />
                    Ouvrir le vote
                  </button>
                </>
              )}

              {status === "voting" && (
                <button
                  type="button"
                  className="primary-button"
                  disabled={saving}
                  onClick={() =>
                    onJudge?.(
                      tribunalCase,
                    )
                  }
                >
                  <Gavel size={17} />
                  Rendre le verdict
                </button>
              )}
            </footer>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}

export default TribunalCaseModal;