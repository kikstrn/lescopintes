import {
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Dices,
  UserRound,
} from "lucide-react";

function formatGageDate(value) {
  if (!value) {
    return "Sans échéance";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function GageCard({
  gage,
  onOpen,
}) {
  const status =
    gage.status ?? "pending";

  const statusLabels = {
    pending: "À faire",
    in_progress: "En cours",
    completed: "Réalisé",
    validated: "Validé",
    cancelled: "Annulé",
  };

  const assignedMember =
    gage.assignedProfile ??
    gage.assignedMember ??
    null;

  const createdBy =
    gage.createdByProfile ??
    gage.author ??
    null;

  const statusLabel =
    statusLabels[status] ?? "À faire";

  return (
    <article className="gage-card glass-panel">
      <button
        type="button"
        className="gage-card__button"
        onClick={() => onOpen?.(gage)}
      >
        <div className="gage-card__top">
          <span
            className={[
              "gage-card__status",
              `gage-card__status--${status}`,
            ].join(" ")}
          >
            {status === "validated" ||
            status === "completed" ? (
              <CheckCircle2 size={15} />
            ) : status === "in_progress" ? (
              <Clock3 size={15} />
            ) : (
              <Dices size={15} />
            )}

            {statusLabel}
          </span>

          <ChevronRight
            size={19}
            className="gage-card__chevron"
          />
        </div>

        <div className="gage-card__icon">
          <Dices size={25} />
        </div>

        <div className="gage-card__content">
          <p className="gage-card__eyebrow">
            Gage #
            {String(
              gage.gageNumber ??
                gage.id ??
                "",
            ).slice(0, 8)}
          </p>

          <h3>
            {gage.title ??
              "Gage sans titre"}
          </h3>

          <p className="gage-card__description">
            {gage.description ??
              "Aucune description renseignée."}
          </p>
        </div>

        <div className="gage-card__people">
          <div>
            <span>
              <UserRound size={16} />
            </span>

            <div>
              <small>Membre concerné</small>

              <strong>
                {assignedMember?.nickname ??
                  assignedMember?.firstName ??
                  "Membre inconnu"}
              </strong>
            </div>
          </div>

          <div>
            <span>
              <Dices size={16} />
            </span>

            <div>
              <small>Attribué par</small>

              <strong>
                {createdBy?.nickname ??
                  createdBy?.firstName ??
                  "Membre inconnu"}
              </strong>
            </div>
          </div>
        </div>

        <footer className="gage-card__footer">
          <span>
            <CalendarDays size={15} />

            {formatGageDate(
              gage.dueDate ??
                gage.due_date,
            )}
          </span>

          {gage.proofUrl && (
            <span>
              <Camera size={15} />
              Preuve ajoutée
            </span>
          )}
        </footer>
      </button>
    </article>
  );
}

export default GageCard;