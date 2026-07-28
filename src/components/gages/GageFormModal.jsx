import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CalendarDays,
  Dices,
  LoaderCircle,
  Send,
  UserRound,
  X,
} from "lucide-react";

function getInitialValues(currentProfileId) {
  return {
    assignedProfileId: "",
    title: "",
    description: "",
    dueDate: "",
    createdBy: currentProfileId ?? "",
  };
}

function GageFormModal({
  open,
  members = [],
  currentProfileId,
  saving = false,
  error = null,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() =>
    getInitialValues(currentProfileId),
  );

  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(getInitialValues(currentProfileId));
    setValidationError("");
  }, [open, currentProfileId]);

  const sortedMembers = useMemo(() => {
    return [...members].sort((memberA, memberB) => {
      const nameA =
        memberA.nickname ??
        memberA.firstName ??
        "";

      const nameB =
        memberB.nickname ??
        memberB.firstName ??
        "";

      return String(nameA).localeCompare(
        String(nameB),
        "fr",
        {
          sensitivity: "base",
        },
      );
    });
  }, [members]);

  const selectedMember = useMemo(() => {
    return sortedMembers.find(
      (member) =>
        member.id === form.assignedProfileId,
    );
  }, [sortedMembers, form.assignedProfileId]);

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    setValidationError("");
  };

  const handleClose = () => {
    if (saving) {
      return;
    }

    onClose?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setValidationError("");

    const assignedProfileId =
      form.assignedProfileId.trim();

    const title =
      form.title.trim();

    const description =
      form.description.trim();

    if (!assignedProfileId) {
      setValidationError(
        "Sélectionne le membre qui doit réaliser le gage.",
      );
      return;
    }

    if (!title) {
      setValidationError(
        "Le titre du gage est obligatoire.",
      );
      return;
    }

    if (title.length < 5) {
      setValidationError(
        "Le titre doit contenir au moins 5 caractères.",
      );
      return;
    }

    if (!description) {
      setValidationError(
        "La description du gage est obligatoire.",
      );
      return;
    }

    if (description.length < 15) {
      setValidationError(
        "La description doit contenir au moins 15 caractères.",
      );
      return;
    }

    if (!currentProfileId) {
      setValidationError(
        "Impossible d’identifier le membre connecté.",
      );
      return;
    }

    try {
      await onSubmit?.({
        assignedProfileId,
        createdBy: currentProfileId,
        title,
        description,
        dueDate:
          form.dueDate || null,
        status: "pending",
      });
    } catch (submitError) {
      setValidationError(
        submitError?.message ??
          "Impossible de créer le gage.",
      );
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="gage-form-modal__overlay"
            aria-label="Fermer le formulaire"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <motion.section
            className="gage-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gage-form-modal-title"
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 12,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.97,
              y: 8,
            }}
          >
            <header className="gage-form-modal__header">
              <div className="gage-form-modal__title">
                <span>
                  <Dices size={22} />
                </span>

                <div>
                  <small>
                    Défi de la bande
                  </small>

                  <h2 id="gage-form-modal-title">
                    Créer un gage
                  </h2>
                </div>
              </div>

              <button
                type="button"
                className="gage-form-modal__close"
                aria-label="Fermer"
                disabled={saving}
                onClick={handleClose}
              >
                <X size={21} />
              </button>
            </header>

            <form
              className="gage-form"
              onSubmit={handleSubmit}
            >
              <div className="gage-form__body">
                <section className="gage-form__notice">
                  <span>
                    <Dices size={22} />
                  </span>

                  <div>
                    <strong>
                      Un gage doit rester amusant
                    </strong>

                    <p>
                      Décris clairement le défi et choisis une échéance réaliste.
                    </p>
                  </div>
                </section>

                <label className="gage-form__field">
                  <span>
                    Membre concerné *
                  </span>

                  <div className="gage-form__select-control">
                    <UserRound size={18} />

                    <select
                      value={
                        form.assignedProfileId
                      }
                      disabled={saving}
                      onChange={(event) =>
                        updateField(
                          "assignedProfileId",
                          event.target.value,
                        )
                      }
                    >
                      <option value="">
                        Sélectionner un membre
                      </option>

                      {sortedMembers.map(
                        (member) => (
                          <option
                            key={member.id}
                            value={member.id}
                          >
                            {member.nickname ??
                              member.firstName ??
                              "Membre"}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                </label>

                {selectedMember && (
                  <motion.section
                    className="gage-form__member-preview"
                    initial={{
                      opacity: 0,
                      y: -4,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                  >
                    <div className="gage-form__member-avatar">
                      {selectedMember.avatarUrl ? (
                        <img
                          src={selectedMember.avatarUrl}
                          alt=""
                        />
                      ) : (
                        <span>
                          {selectedMember.initials ??
                            "CP"}
                        </span>
                      )}
                    </div>

                    <div>
                      <small>
                        Gage attribué à
                      </small>

                      <strong>
                        {selectedMember.nickname ??
                          selectedMember.firstName ??
                          "Membre"}
                      </strong>

                      <p>
                        {selectedMember.role === "admin"
                          ? "Administrateur"
                          : "Membre"}
                      </p>
                    </div>
                  </motion.section>
                )}

                <label className="gage-form__field">
                  <span>
                    Titre du gage *
                  </span>

                  <div className="gage-form__control">
                    <Dices size={18} />

                    <input
                      type="text"
                      value={form.title}
                      maxLength={120}
                      disabled={saving}
                      placeholder="Ex. Venir au prochain match déguisé"
                      onChange={(event) =>
                        updateField(
                          "title",
                          event.target.value,
                        )
                      }
                    />

                    <small>
                      {form.title.length}/120
                    </small>
                  </div>
                </label>

                <label className="gage-form__field">
                  <span>
                    Description *
                  </span>

                  <textarea
                    value={form.description}
                    rows={7}
                    maxLength={1200}
                    disabled={saving}
                    placeholder="Décris précisément le gage à réaliser…"
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value,
                      )
                    }
                  />

                  <small className="gage-form__counter">
                    {form.description.length}/1200
                  </small>
                </label>

                <label className="gage-form__field">
                  <span>
                    Date limite
                  </span>

                  <div className="gage-form__control">
                    <CalendarDays size={18} />

                    <input
                      type="date"
                      value={form.dueDate}
                      disabled={saving}
                      onChange={(event) =>
                        updateField(
                          "dueDate",
                          event.target.value,
                        )
                      }
                    />
                  </div>
                </label>

                {(validationError || error) && (
                  <motion.div
                    className="gage-form__error"
                    role="alert"
                    initial={{
                      opacity: 0,
                      y: -4,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                  >
                    <AlertCircle size={18} />

                    <span>
                      {validationError || error}
                    </span>
                  </motion.div>
                )}
              </div>

              <footer className="gage-form-modal__footer">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={saving}
                  onClick={handleClose}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        className="profile-spinner"
                        size={18}
                      />

                      Création en cours…
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Créer le gage
                    </>
                  )}
                </button>
              </footer>
            </form>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}

export default GageFormModal;