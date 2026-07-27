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
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";

function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  }

  if (password.length >= 12) {
    score += 1;
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  }

  if (score <= 2) {
    return {
      label: "Faible",
      className:
        "profile-password-strength--weak",
      score,
    };
  }

  if (score <= 4) {
    return {
      label: "Correct",
      className:
        "profile-password-strength--medium",
      score,
    };
  }

  return {
    label: "Fort",
    className:
      "profile-password-strength--strong",
    score,
  };
}

function ChangePasswordModal({
  open,
  changingPassword = false,
  onClose,
  onSubmit,
}) {
  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const strength = useMemo(
    () =>
      getPasswordStrength(
        newPassword,
      ),
    [newPassword],
  );

  const requirements = useMemo(
    () => [
      {
        id: "length",
        label:
          "Au moins 8 caractères",
        valid:
          newPassword.length >= 8,
      },
      {
        id: "uppercase",
        label:
          "Une lettre majuscule",
        valid:
          /[A-Z]/.test(
            newPassword,
          ),
      },
      {
        id: "lowercase",
        label:
          "Une lettre minuscule",
        valid:
          /[a-z]/.test(
            newPassword,
          ),
      },
      {
        id: "number",
        label: "Un chiffre",
        valid:
          /[0-9]/.test(
            newPassword,
          ),
      },
    ],
    [newPassword],
  );

  const allRequirementsMet =
    requirements.every(
      (requirement) =>
        requirement.valid,
    );

  const passwordsMatch =
    newPassword.length > 0 &&
    newPassword ===
      confirmPassword;

  useEffect(() => {
    if (!open) {
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrorMessage("");
    setSuccessMessage("");
  }, [open]);

  const handleClose = () => {
    if (changingPassword) {
      return;
    }

    onClose();
  };

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!newPassword) {
      setErrorMessage(
        "Renseigne un nouveau mot de passe.",
      );
      return;
    }

    if (!allRequirementsMet) {
      setErrorMessage(
        "Le mot de passe ne respecte pas encore tous les critères.",
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setErrorMessage(
        "Les deux mots de passe ne correspondent pas.",
      );
      return;
    }

    try {
      await onSubmit(
        newPassword,
      );

      setSuccessMessage(
        "Ton mot de passe a bien été modifié.",
      );

      setNewPassword("");
      setConfirmPassword("");

      window.setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error) {
      setErrorMessage(
        error?.message ??
          "Impossible de modifier le mot de passe.",
      );
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="profile-password-modal__overlay"
            aria-label="Fermer la fenêtre"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={
              handleClose
            }
          />

          <motion.section
            className="profile-password-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-password-modal-title"
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 10,
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
            <header className="profile-password-modal__header">
              <div className="profile-password-modal__title">
                <span>
                  <KeyRound
                    size={21}
                  />
                </span>

                <div>
                  <small>
                    Sécurité du compte
                  </small>

                  <h2 id="profile-password-modal-title">
                    Changer le mot de passe
                  </h2>
                </div>
              </div>

              <button
                type="button"
                className="icon-button"
                aria-label="Fermer"
                disabled={
                  changingPassword
                }
                onClick={
                  handleClose
                }
              >
                <X size={21} />
              </button>
            </header>

            <form
              className="profile-password-form"
              onSubmit={
                handleSubmit
              }
            >
              <div className="profile-password-form__body">
                <section className="profile-password-form__notice">
                  <span>
                    <ShieldCheck
                      size={22}
                    />
                  </span>

                  <div>
                    <strong>
                      Choisis un mot de passe sécurisé
                    </strong>

                    <p>
                      Utilise une combinaison de lettres,
                      chiffres et caractères spéciaux.
                    </p>
                  </div>
                </section>

                <label className="profile-password-form__field">
                  <span>
                    Nouveau mot de passe *
                  </span>

                  <div className="profile-password-form__control">
                    <LockKeyhole
                      size={18}
                    />

                    <input
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        newPassword
                      }
                      autoComplete="new-password"
                      disabled={
                        changingPassword
                      }
                      placeholder="Au moins 8 caractères"
                      onChange={(
                        event,
                      ) => {
                        setNewPassword(
                          event.target
                            .value,
                        );

                        setErrorMessage(
                          "",
                        );

                        setSuccessMessage(
                          "",
                        );
                      }}
                    />

                    <button
                      type="button"
                      aria-label={
                        showNewPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                      disabled={
                        changingPassword
                      }
                      onClick={() =>
                        setShowNewPassword(
                          (current) =>
                            !current,
                        )
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye
                          size={18}
                        />
                      )}
                    </button>
                  </div>
                </label>

                {newPassword && (
                  <section className="profile-password-strength">
                    <div className="profile-password-strength__heading">
                      <span>
                        Solidité
                      </span>

                      <strong
                        className={
                          strength.className
                        }
                      >
                        {
                          strength.label
                        }
                      </strong>
                    </div>

                    <div className="profile-password-strength__bars">
                      {Array.from({
                        length: 6,
                      }).map(
                        (
                          _,
                          index,
                        ) => (
                          <span
                            key={
                              index
                            }
                            className={
                              index <
                              strength.score
                                ? `profile-password-strength__bar profile-password-strength__bar--active ${strength.className}`
                                : "profile-password-strength__bar"
                            }
                          />
                        ),
                      )}
                    </div>
                  </section>
                )}

                <div className="profile-password-requirements">
                  {requirements.map(
                    (
                      requirement,
                    ) => (
                      <div
                        key={
                          requirement.id
                        }
                        className={
                          requirement.valid
                            ? "profile-password-requirement profile-password-requirement--valid"
                            : "profile-password-requirement"
                        }
                      >
                        <span>
                          <Check
                            size={14}
                          />
                        </span>

                        <small>
                          {
                            requirement.label
                          }
                        </small>
                      </div>
                    ),
                  )}
                </div>

                <label className="profile-password-form__field">
                  <span>
                    Confirmer le mot de passe *
                  </span>

                  <div
                    className={
                      confirmPassword &&
                      passwordsMatch
                        ? "profile-password-form__control profile-password-form__control--valid"
                        : "profile-password-form__control"
                    }
                  >
                    <LockKeyhole
                      size={18}
                    />

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        confirmPassword
                      }
                      autoComplete="new-password"
                      disabled={
                        changingPassword
                      }
                      placeholder="Saisis à nouveau le mot de passe"
                      onChange={(
                        event,
                      ) => {
                        setConfirmPassword(
                          event.target
                            .value,
                        );

                        setErrorMessage(
                          "",
                        );

                        setSuccessMessage(
                          "",
                        );
                      }}
                    />

                    <button
                      type="button"
                      aria-label={
                        showConfirmPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                      disabled={
                        changingPassword
                      }
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) =>
                            !current,
                        )
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye
                          size={18}
                        />
                      )}
                    </button>
                  </div>

                  {confirmPassword &&
                    !passwordsMatch && (
                      <small className="profile-password-form__hint profile-password-form__hint--error">
                        Les mots de passe ne correspondent pas.
                      </small>
                    )}

                  {passwordsMatch && (
                    <small className="profile-password-form__hint profile-password-form__hint--success">
                      Les mots de passe correspondent.
                    </small>
                  )}
                </label>

                {errorMessage && (
                  <motion.div
                    className="profile-password-form__message profile-password-form__message--error"
                    initial={{
                      opacity: 0,
                      y: -4,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    role="alert"
                  >
                    <AlertCircle
                      size={18}
                    />

                    <span>
                      {
                        errorMessage
                      }
                    </span>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    className="profile-password-form__message profile-password-form__message--success"
                    initial={{
                      opacity: 0,
                      y: -4,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    role="status"
                  >
                    <Check
                      size={18}
                    />

                    <span>
                      {
                        successMessage
                      }
                    </span>
                  </motion.div>
                )}
              </div>

              <footer className="profile-password-modal__footer">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={
                    changingPassword
                  }
                  onClick={
                    handleClose
                  }
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    changingPassword ||
                    !allRequirementsMet ||
                    !passwordsMatch
                  }
                >
                  {changingPassword ? (
                    <>
                      <LoaderCircle
                        className="profile-spinner"
                        size={18}
                      />

                      Modification…
                    </>
                  ) : (
                    <>
                      <KeyRound
                        size={18}
                      />

                      Modifier le mot de passe
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

export default ChangePasswordModal;