import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  CalendarDays,
  Camera,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Dices,
  LoaderCircle,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";

function formatDate(value) {
  if (!value) {
    return "Sans échéance";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusLabel(status) {
  const labels = {
    pending: "À faire",
    in_progress: "En cours",
    completed: "Réalisé",
    validated: "Validé",
    cancelled: "Annulé",
  };

  return labels[status] ?? "À faire";
}

function GageDetailsModal({
  open,
  gage,
  currentProfile,
  saving = false,
  uploading = false,
  error = null,
  onClose,
  onStart,
  onComplete,
  onValidate,
  onCancel,
  onUploadProof,
  onDeleteProof,
}) {
  if (!gage) {
    return null;
  }

  const status = gage.status ?? "pending";

  const assignedMember =
    gage.assignedProfile ??
    gage.assignedMember ??
    null;

  const createdBy =
    gage.createdByProfile ??
    gage.author ??
    null;

  const currentProfileId =
    currentProfile?.id;

  const isAssignedMember =
    currentProfileId &&
    currentProfileId ===
      (assignedMember?.id ??
        gage.assigned_profile_id);

  const isAdmin =
    currentProfile?.role === "admin";

  const canStart =
    status === "pending" &&
    isAssignedMember;

  const canComplete =
    status === "in_progress" &&
    isAssignedMember;

  const canValidate =
    status === "completed" &&
    isAdmin;

  const canCancel =
    !["validated", "cancelled"].includes(
      status,
    ) &&
    isAdmin;

  const proofUrl =
    gage.proofUrl ??
    gage.proof_url ??
    null;

  const proofName =
    gage.proofFileName ??
    gage.proof_file_name ??
    "Preuve du gage";

  const handleFileChange = async (
    event,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    await onUploadProof?.({
      gage,
      file,
    });

    event.target.value = "";
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="gage-details-modal__overlay"
            aria-label="Fermer le détail du gage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.section
            className="gage-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gage-details-modal-title"
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
            <header className="gage-details-modal__header">
              <div>
                <span
                  className={[
                    "gage-details-modal__status",
                    `gage-details-modal__status--${status}`,
                  ].join(" ")}
                >
                  {status === "validated" ||
                  status === "completed" ? (
                    <CheckCircle2 size={16} />
                  ) : status === "in_progress" ? (
                    <Clock3 size={16} />
                  ) : (
                    <Dices size={16} />
                  )}

                  {getStatusLabel(status)}
                </span>

                <h2 id="gage-details-modal-title">
                  {gage.title ??
                    "Gage sans titre"}
                </h2>

                <p>
                  Gage #
                  {String(
                    gage.gageNumber ??
                      gage.id ??
                      "",
                  ).slice(0, 8)}
                </p>
              </div>

              <button
                type="button"
                className="gage-details-modal__close"
                aria-label="Fermer"
                disabled={
                  saving || uploading
                }
                onClick={onClose}
              >
                <X size={21} />
              </button>
            </header>

            <div className="gage-details-modal__content">
              <section className="gage-details-modal__people">
                <article>
                  <div className="gage-details-modal__avatar">
                    {assignedMember?.avatarUrl ? (
                      <img
                        src={
                          assignedMember.avatarUrl
                        }
                        alt=""
                      />
                    ) : (
                      <span>
                        {assignedMember?.initials ??
                          "CP"}
                      </span>
                    )}
                  </div>

                  <div>
                    <small>
                      Membre concerné
                    </small>

                    <strong>
                      {assignedMember?.nickname ??
                        assignedMember?.firstName ??
                        "Membre inconnu"}
                    </strong>
                  </div>
                </article>

                <article>
                  <div className="gage-details-modal__person-icon">
                    <UserRound size={20} />
                  </div>

                  <div>
                    <small>
                      Gage attribué par
                    </small>

                    <strong>
                      {createdBy?.nickname ??
                        createdBy?.firstName ??
                        "Membre inconnu"}
                    </strong>
                  </div>
                </article>

                <article>
                  <div className="gage-details-modal__person-icon">
                    <CalendarDays size={20} />
                  </div>

                  <div>
                    <small>
                      Date limite
                    </small>

                    <strong>
                      {formatDate(
                        gage.dueDate ??
                          gage.due_date,
                      )}
                    </strong>
                  </div>
                </article>
              </section>

              <section className="gage-details-modal__description">
                <div className="gage-details-modal__section-title">
                  <Dices size={19} />
                  <h3>Description du gage</h3>
                </div>

                <p>
                  {gage.description ??
                    "Aucune description renseignée."}
                </p>
              </section>

              <section className="gage-details-modal__proof">
                <div className="gage-details-modal__section-title">
                  <Camera size={19} />
                  <h3>Preuve</h3>
                </div>

                {proofUrl ? (
                  <div className="gage-details-modal__proof-card">
                    <a
                      href={proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="gage-details-modal__proof-preview"
                    >
                      <img
                        src={proofUrl}
                        alt={proofName}
                      />
                    </a>

                    <div className="gage-details-modal__proof-info">
                      <div>
                        <strong>
                          {proofName}
                        </strong>

                        <small>
                          Preuve ajoutée
                        </small>
                      </div>

                      {(isAssignedMember ||
                        isAdmin) && (
                        <button
                          type="button"
                          className="gage-details-modal__delete-proof"
                          disabled={
                            saving ||
                            uploading
                          }
                          onClick={() =>
                            onDeleteProof?.(
                              gage,
                            )
                          }
                        >
                          <Trash2 size={17} />
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="gage-details-modal__proof-empty">
                    <Camera size={28} />

                    <strong>
                      Aucune preuve ajoutée
                    </strong>

                    <p>
                      Une photo pourra être ajoutée
                      lorsque le gage aura été réalisé.
                    </p>
                  </div>
                )}

                {isAssignedMember &&
                  ["in_progress", "completed"].includes(
                    status,
                  ) && (
                    <label className="gage-details-modal__upload">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={
                          saving ||
                          uploading
                        }
                        onChange={
                          handleFileChange
                        }
                      />

                      {uploading ? (
                        <>
                          <LoaderCircle
                            size={18}
                            className="profile-spinner"
                          />
                          Envoi en cours…
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          {proofUrl
                            ? "Remplacer la preuve"
                            : "Ajouter une preuve"}
                        </>
                      )}
                    </label>
                  )}
              </section>

              {status === "validated" && (
                <section className="gage-details-modal__validation">
                  <ShieldCheck size={22} />

                  <div>
                    <strong>
                      Gage validé
                    </strong>

                    <p>
                      Ce gage a été validé par un
                      administrateur.
                    </p>
                  </div>
                </section>
              )}

              {status === "cancelled" && (
                <section className="gage-details-modal__cancelled">
                  <CircleAlert size={22} />

                  <div>
                    <strong>
                      Gage annulé
                    </strong>

                    <p>
                      Ce gage ne doit plus être
                      réalisé.
                    </p>
                  </div>
                </section>
              )}

              {error && (
                <div className="gage-details-modal__error">
                  <CircleAlert size={18} />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <footer className="gage-details-modal__footer">
              <button
                type="button"
                className="secondary-button"
                disabled={
                  saving || uploading
                }
                onClick={onClose}
              >
                Fermer
              </button>

              {canCancel && (
                <button
                  type="button"
                  className="secondary-button gage-cancel-button"
                  disabled={
                    saving || uploading
                  }
                  onClick={() =>
                    onCancel?.(gage)
                  }
                >
                  <Trash2 size={17} />
                  Annuler le gage
                </button>
              )}

              {canStart && (
                <button
                  type="button"
                  className="primary-button"
                  disabled={saving}
                  onClick={() =>
                    onStart?.(gage)
                  }
                >
                  <Clock3 size={17} />
                  Commencer le gage
                </button>
              )}

              {canComplete && (
                <button
                  type="button"
                  className="primary-button"
                  disabled={
                    saving || !proofUrl
                  }
                  onClick={() =>
                    onComplete?.(gage)
                  }
                >
                  <CheckCircle2 size={17} />
                  Marquer comme réalisé
                </button>
              )}

              {canValidate && (
                <button
                  type="button"
                  className="primary-button"
                  disabled={saving}
                  onClick={() =>
                    onValidate?.(gage)
                  }
                >
                  <ShieldCheck size={17} />
                  Valider le gage
                </button>
              )}
            </footer>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}

export default GageDetailsModal;