import {
  CalendarDays,
  ChevronRight,
  Gavel,
  Scale,
  ShieldAlert,
  UserRound,
  Vote,
} from "lucide-react";

function formatTribunalDate(value) {
  if (!value) {
    return "Date inconnue";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function TribunalCaseCard({
  tribunalCase,
  onOpen,
}) {
  const status =
    tribunalCase.status ?? "pending";

  const statusLabels = {
    pending: "En attente",
    voting: "Vote en cours",
    judged: "Jugée",
    dismissed: "Classée",
  };

  const statusLabel =
    statusLabels[status] ?? "En attente";

  const accused =
    tribunalCase.accusedProfile ??
    tribunalCase.accused ??
    null;

  const author =
    tribunalCase.createdByProfile ??
    tribunalCase.author ??
    null;

  const voteCount = Number(
    tribunalCase.voteCount ??
      tribunalCase.votes?.length ??
      0,
  );

  return (
    <article className="tribunal-case-card glass-panel">
      <button
        type="button"
        className="tribunal-case-card__button"
        onClick={() =>
          onOpen?.(tribunalCase)
        }
      >
        <div className="tribunal-case-card__top">
          <span
            className={[
              "tribunal-case-card__status",
              `tribunal-case-card__status--${status}`,
            ].join(" ")}
          >
            {status === "judged" ? (
              <Gavel size={15} />
            ) : status === "voting" ? (
              <Vote size={15} />
            ) : (
              <Scale size={15} />
            )}

            {statusLabel}
          </span>

          <ChevronRight
            size={19}
            className="tribunal-case-card__chevron"
          />
        </div>

        <div className="tribunal-case-card__icon">
          <ShieldAlert size={25} />
        </div>

        <div className="tribunal-case-card__content">
          <p className="tribunal-case-card__eyebrow">
            Affaire #{String(
              tribunalCase.caseNumber ??
                tribunalCase.id ??
                "",
            ).slice(0, 8)}
          </p>

          <h3>
            {tribunalCase.title ??
              "Nouvelle affaire"}
          </h3>

          <p className="tribunal-case-card__description">
            {tribunalCase.description ??
              tribunalCase.reason ??
              "Aucun motif renseigné."}
          </p>
        </div>

        <div className="tribunal-case-card__people">
          <div>
            <span>
              <UserRound size={16} />
            </span>

            <div>
              <small>Accusé</small>
              <strong>
                {accused?.nickname ??
                  accused?.firstName ??
                  "Membre inconnu"}
              </strong>
            </div>
          </div>

          <div>
            <span>
              <Scale size={16} />
            </span>

            <div>
              <small>Plainte déposée par</small>
              <strong>
                {author?.nickname ??
                  author?.firstName ??
                  "Membre inconnu"}
              </strong>
            </div>
          </div>
        </div>

        <footer className="tribunal-case-card__footer">
          <span>
            <CalendarDays size={15} />
            {formatTribunalDate(
              tribunalCase.createdAt ??
                tribunalCase.created_at,
            )}
          </span>

          <span>
            <Vote size={15} />
            {voteCount} vote
            {voteCount > 1 ? "s" : ""}
          </span>
        </footer>
      </button>
    </article>
  );
}

export default TribunalCaseCard;