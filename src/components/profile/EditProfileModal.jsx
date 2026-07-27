import {
  useEffect,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  AlertCircle,
  Check,
  Edit3,
  LoaderCircle,
  Save,
  UserRound,
  X,
} from "lucide-react";

function createInitialValues(profile) {
  return {
    firstName:
      profile?.firstName ?? "",

    nickname:
      profile?.nickname ?? "",

    initials:
      profile?.initials ?? "",

    bio:
      profile?.bio ?? "",
  };
}

function EditProfileModal({
  open,
  profile,
  saving = false,
  onClose,
  onSubmit,
}) {
  const [form, setForm] =
    useState(() =>
      createInitialValues(
        profile,
      ),
    );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(
      createInitialValues(
        profile,
      ),
    );

    setErrorMessage("");
  }, [
    open,
    profile,
  ]);

  const updateField = (
    field,
    value,
  ) => {
    setForm(
      (currentForm) => ({
        ...currentForm,
        [field]: value,
      }),
    );

    setErrorMessage("");
  };

  const handleInitialsChange = (
    value,
  ) => {
    updateField(
      "initials",
      value
        .replace(
          /[^a-zA-ZÀ-ÿ0-9]/g,
          "",
        )
        .slice(0, 3)
        .toUpperCase(),
    );
  };

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    setErrorMessage("");

    const firstName =
      form.firstName.trim();

    const nickname =
      form.nickname.trim();

    const initials =
      form.initials
        .trim()
        .toUpperCase();

    const bio =
      form.bio.trim();

    if (!firstName) {
      setErrorMessage(
        "Le prénom est obligatoire.",
      );
      return;
    }

    if (!nickname) {
      setErrorMessage(
        "Le pseudo est obligatoire.",
      );
      return;
    }

    if (!initials) {
      setErrorMessage(
        "Les initiales sont obligatoires.",
      );
      return;
    }

    if (
      initials.length > 3
    ) {
      setErrorMessage(
        "Les initiales ne peuvent pas dépasser 3 caractères.",
      );
      return;
    }

    if (bio.length > 300) {
      setErrorMessage(
        "La bio ne peut pas dépasser 300 caractères.",
      );
      return;
    }

    try {
      await onSubmit({
        firstName,
        nickname,
        initials,
        bio,
      });
    } catch (error) {
      setErrorMessage(
        error?.message ??
          "Impossible d’enregistrer les modifications.",
      );
    }
  };

  const hasChanges =
    form.firstName !==
      (profile?.firstName ??
        "") ||
    form.nickname !==
      (profile?.nickname ??
        "") ||
    form.initials !==
      (profile?.initials ??
        "") ||
    form.bio !==
      (profile?.bio ?? "");

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="profile-edit-modal__overlay"
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
            onClick={onClose}
          />

          <motion.section
            className="profile-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-edit-modal-title"
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
            <header className="profile-edit-modal__header">
              <div className="profile-edit-modal__title">
                <span>
                  <Edit3 size={21} />
                </span>

                <div>
                  <small>
                    Profil utilisateur
                  </small>

                  <h2 id="profile-edit-modal-title">
                    Modifier mon profil
                  </h2>
                </div>
              </div>

              <button
                type="button"
                className="icon-button"
                aria-label="Fermer"
                disabled={saving}
                onClick={onClose}
              >
                <X size={21} />
              </button>
            </header>

            <form
              className="profile-edit-form"
              onSubmit={
                handleSubmit
              }
            >
              <div className="profile-edit-form__body">
                <section className="profile-edit-form__preview">
                  <div className="profile-edit-form__avatar">
                    {profile?.avatarUrl ? (
                      <img
                        src={
                          profile.avatarUrl
                        }
                        alt=""
                      />
                    ) : (
                      <span>
                        {form.initials ||
                          "CP"}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="section-heading__eyebrow">
                      Aperçu
                    </span>

                    <h3>
                      {form.nickname ||
                        "Ton pseudo"}
                    </h3>

                    <p>
                      {form.firstName ||
                        "Ton prénom"}
                    </p>
                  </div>
                </section>

                <div className="profile-edit-form__grid">
                  <label className="profile-edit-form__field">
                    <span>
                      Prénom *
                    </span>

                    <div className="profile-edit-form__control">
                      <UserRound
                        size={18}
                      />

                      <input
                        type="text"
                        value={
                          form.firstName
                        }
                        maxLength={60}
                        autoComplete="given-name"
                        disabled={saving}
                        placeholder="Ex. Kilian"
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            "firstName",
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>
                  </label>

                  <label className="profile-edit-form__field">
                    <span>
                      Pseudo *
                    </span>

                    <div className="profile-edit-form__control">
                      <UserRound
                        size={18}
                      />

                      <input
                        type="text"
                        value={
                          form.nickname
                        }
                        maxLength={60}
                        disabled={saving}
                        placeholder="Ex. Kiks"
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            "nickname",
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>
                  </label>
                </div>

                <label className="profile-edit-form__field profile-edit-form__field--initials">
                  <span>
                    Initiales *
                  </span>

                  <div className="profile-edit-form__control">
                    <Check size={18} />

                    <input
                      type="text"
                      value={
                        form.initials
                      }
                      maxLength={3}
                      disabled={saving}
                      placeholder="KT"
                      onChange={(
                        event,
                      ) =>
                        handleInitialsChange(
                          event.target
                            .value,
                        )
                      }
                    />

                    <small>
                      {form.initials.length}
                      /3
                    </small>
                  </div>
                </label>

                <label className="profile-edit-form__field profile-edit-form__field--wide">
                  <span>
                    Bio
                  </span>

                  <textarea
                    value={
                      form.bio
                    }
                    rows={6}
                    maxLength={300}
                    disabled={saving}
                    placeholder="Quelques mots sur toi, ton style de jeu, tes sorties préférées…"
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "bio",
                        event.target
                          .value,
                      )
                    }
                  />

                  <small className="profile-edit-form__counter">
                    {
                      form.bio.length
                    }{" "}
                    / 300
                  </small>
                </label>

                {errorMessage && (
                  <motion.div
                    className="profile-edit-form__error"
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
              </div>

              <footer className="profile-edit-modal__footer">
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
                    !hasChanges
                  }
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        className="profile-spinner"
                        size={18}
                      />

                      Enregistrement…
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Enregistrer
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

export default EditProfileModal;