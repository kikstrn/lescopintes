import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  AlertCircle,
  FileWarning,
  LoaderCircle,
  Scale,
  Send,
  ShieldAlert,
  UserRound,
  X,
} from "lucide-react";

function getInitialFormValues(currentProfileId) {
  return {
    accusedProfileId: "",
    title: "",
    description: "",
    evidence: "",
    createdBy: currentProfileId ?? "",
  };
}

function TribunalFormModal({
  open,
  members = [],
  currentProfileId,
  saving = false,
  error = null,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() =>
    getInitialFormValues(currentProfileId),
  );

  const [validationError, setValidationError] =
    useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(
      getInitialFormValues(currentProfileId),
    );

    setValidationError("");
  }, [
    open,
    currentProfileId,
  ]);

  const availableMembers = useMemo(() => {
    return members
      .filter(
        (member) =>
          member.id !== currentProfileId,
      )
      .sort((memberA, memberB) =>
        String(
          memberA.nickname ??
            memberA.firstName ??
            "",
        ).localeCompare(
          String(
            memberB.nickname ??
              memberB.firstName ??
              "",
          ),
          "fr",
          {
            sensitivity: "base",
          },
        ),
      );
  }, [
    members,
    currentProfileId,
  ]);

  const selectedMember = useMemo(() => {
    return availableMembers.find(
      (member) =>
        member.id === form.accusedProfileId,
    );
  }, [
    availableMembers,
    form.accusedProfileId,
  ]);

  const updateField = (
    field,
    value,
  ) => {
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

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    setValidationError("");

    const accusedProfileId =
      form.accusedProfileId.trim();

    const title =
      form.title.trim();

    const description =
      form.description.trim();

    const evidence =
      form.evidence.trim();

    if (!accusedProfileId) {
      setValidationError(
        "Sélectionne le membre accusé.",
      );
      return;
    }

    if (!title) {
      setValidationError(
        "Le titre de l’affaire est obligatoire.",
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
        "Le motif de la plainte est obligatoire.",
      );
      return;
    }

    if (description.length < 20) {
      setValidationError(
        "Le motif doit contenir au moins 20 caractères.",
      );
      return;
    }

    if (!currentProfileId) {
      setValidationError(
        "Impossible d’identifier l’auteur de la plainte.",
      );
      return;
    }

    try {
      await onSubmit?.({
        accusedProfileId,
        title,
        description,
        evidence:
          evidence || null,
        createdBy:
          currentProfileId,
        status: "pending",
      });
    } catch (submitError) {
      setValidationError(
        submitError?.message ??
          "Impossible de déposer la plainte.",
      );
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="tribunal-form-modal__overlay"
            aria-label="Fermer le formulaire"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={handleClose}
          />

          <motion.section
            className="tribunal-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tribunal-form-modal-title"
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
            <header className="tribunal-form-modal__header">
              <div className="tribunal-form-modal__title">
                <span>
                  <Scale size={22} />
                </span>

                <div>
                  <small>
                    Tribunal des Co’Pintes
                  </small>

                  <h2 id="tribunal-form-modal-title">
                    Déposer une plainte
                  </h2>
                </div>
              </div>

              <button
                type="button"
                className="tribunal-form-modal__close"
                aria-label="Fermer"
                disabled={saving}
                onClick={handleClose}
              >
                <X size={21} />
              </button>
            </header>

            <form
              className="tribunal-form"
              onSubmit={handleSubmit}
            >
              <div className="tribunal-form__body">
                <section className="tribunal-form__notice">
                  <span>
                    <ShieldAlert size={22} />
                  </span>

                  <div>
                    <strong>
                      Toute accusation devra être défendue
                    </strong>

                    <p>
                      Décris clairement les faits. La plainte pourra ensuite
                      être soumise au vote des membres.
                    </p>
                  </div>
                </section>

                <label className="tribunal-form__field">
                  <span>
                    Membre accusé *
                  </span>

                  <div className="tribunal-form__select-control">
                    <UserRound size={18} />

                    <select
                      value={
                        form.accusedProfileId
                      }
                      disabled={saving}
                      onChange={(event) =>
                        updateField(
                          "accusedProfileId",
                          event.target.value,
                        )
                      }
                    >
                      <option value="">
                        Sélectionner un membre
                      </option>

                      {availableMembers.map(
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
                    className="tribunal-form__accused-preview"
                    initial={{
                      opacity: 0,
                      y: -4,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                  >
                    <div className="tribunal-form__accused-avatar">
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
                        Personne mise en cause
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

                <label className="tribunal-form__field">
                  <span>
                    Titre de l’affaire *
                  </span>

                  <div className="tribunal-form__control">
                    <Scale size={18} />

                    <input
                      type="text"
                      value={form.title}
                      maxLength={120}
                      disabled={saving}
                      placeholder="Ex. Disparition suspecte d’une tournée"
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

                <label className="tribunal-form__field">
                  <span>
                    Motif de la plainte *
                  </span>

                  <textarea
                    value={form.description}
                    rows={7}
                    maxLength={1200}
                    disabled={saving}
                    placeholder="Décris précisément les faits reprochés, le contexte et les personnes présentes…"
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value,
                      )
                    }
                  />

                  <small className="tribunal-form__counter">
                    {form.description.length}/1200
                  </small>
                </label>

                <label className="tribunal-form__field">
                  <span>
                    Preuve ou précision
                  </span>

                  <div className="tribunal-form__textarea-wrapper">
                    <FileWarning size={18} />

                    <textarea
                      value={form.evidence}
                      rows={4}
                      maxLength={600}
                      disabled={saving}
                      placeholder="Témoins, photo, message, circonstance aggravante…"
                      onChange={(event) =>
                        updateField(
                          "evidence",
                          event.target.value,
                        )
                      }
                    />

                    <small>
                      {form.evidence.length}/600
                    </small>
                  </div>
                </label>

                {(validationError || error) && (
                  <motion.div
                    className="tribunal-form__error"
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
                      {validationError ||
                        error}
                    </span>
                  </motion.div>
                )}
              </div>

              <footer className="tribunal-form-modal__footer">
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

                      Dépôt en cours…
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Déposer la plainte
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

export default TribunalFormModal;