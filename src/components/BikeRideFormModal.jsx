import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Bike,
  CalendarDays,
  Check,
  Clock3,
  Gauge,
  LoaderCircle,
  MapPin,
  Mountain,
  Route,
  Save,
  Users,
  X,
} from "lucide-react";

function pad(value) {
  return String(value).padStart(2, "0");
}

function getDateParts(value) {
  if (!value) {
    return {
      date: "",
      time: "",
    };
  }

  const date = new Date(value);

  return {
    date: `${date.getFullYear()}-${pad(
      date.getMonth() + 1,
    )}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(
      date.getMinutes(),
    )}`,
  };
}

function createIsoDate(dateValue, timeValue) {
  if (!dateValue || !timeValue) {
    return null;
  }

  const date = new Date(
    `${dateValue}T${timeValue}:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function createInitialValues(
  ride,
  currentProfileId,
) {
  const dateParts = getDateParts(
    ride?.rideDate,
  );

  return {
    title: ride?.title ?? "",
    description: ride?.description ?? "",
    date: dateParts.date,
    time: dateParts.time,
    location: ride?.location ?? "",
    distanceKm:
      ride?.distanceKm > 0
        ? String(ride.distanceKm)
        : "",
    elevationM:
      ride?.elevationM > 0
        ? String(ride.elevationM)
        : "",
    durationMinutes:
      ride?.durationMinutes === null ||
      ride?.durationMinutes === undefined
        ? ""
        : String(ride.durationMinutes),
    averageSpeed:
      ride?.averageSpeed === null ||
      ride?.averageSpeed === undefined
        ? ""
        : String(ride.averageSpeed),
    status: ride?.status ?? "completed",
    participantIds:
      ride?.participantIds ??
      (currentProfileId
        ? [currentProfileId]
        : []),
  };
}

function BikeRideFormModal({
  open,
  ride,
  members = [],
  currentProfileId,
  saving = false,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() =>
    createInitialValues(
      ride,
      currentProfileId,
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

  document.body.classList.add(
    "modal-is-open",
  );

  return () => {
    document.body.classList.remove(
      "modal-is-open",
    );
  };
}, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(
      createInitialValues(
        ride,
        currentProfileId,
      ),
    );

    setErrorMessage("");
  }, [
    open,
    ride,
    currentProfileId,
  ]);

  const updateField = (
    field,
    value,
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    setErrorMessage("");
  };

  const toggleParticipant = (
    profileId,
  ) => {
    setForm((currentForm) => {
      const selected =
        currentForm.participantIds.includes(
          profileId,
        );

      return {
        ...currentForm,
        participantIds: selected
          ? currentForm.participantIds.filter(
              (id) => id !== profileId,
            )
          : [
              ...currentForm.participantIds,
              profileId,
            ],
      };
    });

    setErrorMessage("");
  };

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();
    setErrorMessage("");

    if (!form.title.trim()) {
      setErrorMessage(
        "Renseigne un titre pour la sortie.",
      );
      return;
    }

    const rideDate = createIsoDate(
      form.date,
      form.time,
    );

    if (!rideDate) {
      setErrorMessage(
        "Renseigne une date et une heure valides.",
      );
      return;
    }

    const numericFields = [
      form.distanceKm,
      form.elevationM,
      form.durationMinutes,
      form.averageSpeed,
    ];

    const hasNegativeValue =
      numericFields.some(
        (value) =>
          value !== "" &&
          Number(value) < 0,
      );

    if (hasNegativeValue) {
      setErrorMessage(
        "Les valeurs numériques ne peuvent pas être négatives.",
      );
      return;
    }

    try {
      await onSubmit({
        title: form.title,
        description:
          form.description,
        rideDate,
        location: form.location,
        distanceKm:
          form.distanceKm || 0,
        elevationM:
          form.elevationM || 0,
        durationMinutes:
          form.durationMinutes ||
          null,
        averageSpeed:
          form.averageSpeed || null,
        status: form.status,
        participantIds:
          form.participantIds,
      });
    } catch (error) {
      setErrorMessage(
        error?.message ??
          "Impossible d’enregistrer la sortie.",
      );
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="bike-modal__overlay"
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
            className="bike-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bike-modal-title"
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.97,
            }}
          >
            <header className="bike-modal__header">
              <div className="bike-modal__title">
                <span>
                  <Bike size={22} />
                </span>

                <div>
                  <small>
                    Module cyclisme
                  </small>

                  <h2 id="bike-modal-title">
                    {ride
                      ? "Modifier la sortie"
                      : "Ajouter une sortie"}
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
              className="bike-form"
              onSubmit={handleSubmit}
            >
              <div className="bike-form__body">
                <label className="bike-form__field bike-form__field--wide">
                  <span>
                    Titre *
                  </span>

                  <div className="bike-form__control">
                    <Route size={18} />

                    <input
                      type="text"
                      value={form.title}
                      maxLength={120}
                      placeholder="Ex. Boucle de la Scarpe"
                      disabled={saving}
                      onChange={(event) =>
                        updateField(
                          "title",
                          event.target.value,
                        )
                      }
                    />
                  </div>
                </label>

                <label className="bike-form__field bike-form__field--wide">
                  <span>
                    Description
                  </span>

                  <textarea
                    value={form.description}
                    rows={4}
                    maxLength={800}
                    placeholder="Rythme, pauses, informations utiles…"
                    disabled={saving}
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <div className="bike-form__grid">
                  <label className="bike-form__field">
                    <span>
                      Date *
                    </span>

                    <div className="bike-form__control">
                      <CalendarDays
                        size={18}
                      />

                      <input
                        type="date"
                        value={form.date}
                        disabled={saving}
                        onChange={(event) =>
                          updateField(
                            "date",
                            event.target.value,
                          )
                        }
                      />
                    </div>
                  </label>

                  <label className="bike-form__field">
                    <span>
                      Heure *
                    </span>

                    <div className="bike-form__control">
                      <Clock3 size={18} />

                      <input
                        type="time"
                        value={form.time}
                        disabled={saving}
                        onChange={(event) =>
                          updateField(
                            "time",
                            event.target.value,
                          )
                        }
                      />
                    </div>
                  </label>
                </div>

                <label className="bike-form__field bike-form__field--wide">
                  <span>
                    Lieu
                  </span>

                  <div className="bike-form__control">
                    <MapPin size={18} />

                    <input
                      type="text"
                      value={form.location}
                      maxLength={180}
                      placeholder="Ex. Place de Cuincy"
                      disabled={saving}
                      onChange={(event) =>
                        updateField(
                          "location",
                          event.target.value,
                        )
                      }
                    />
                  </div>
                </label>

                <div className="bike-form__metrics">
                  <label className="bike-form__field">
                    <span>
                      Distance
                    </span>

                    <div className="bike-form__control">
                      <Route size={18} />

                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={
                          form.distanceKm
                        }
                        placeholder="65"
                        disabled={saving}
                        onChange={(event) =>
                          updateField(
                            "distanceKm",
                            event.target.value,
                          )
                        }
                      />

                      <small>
                        km
                      </small>
                    </div>
                  </label>

                  <label className="bike-form__field">
                    <span>
                      Dénivelé
                    </span>

                    <div className="bike-form__control">
                      <Mountain size={18} />

                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={
                          form.elevationM
                        }
                        placeholder="420"
                        disabled={saving}
                        onChange={(event) =>
                          updateField(
                            "elevationM",
                            event.target.value,
                          )
                        }
                      />

                      <small>
                        m
                      </small>
                    </div>
                  </label>

                  <label className="bike-form__field">
                    <span>
                      Durée
                    </span>

                    <div className="bike-form__control">
                      <Clock3 size={18} />

                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={
                          form.durationMinutes
                        }
                        placeholder="180"
                        disabled={saving}
                        onChange={(event) =>
                          updateField(
                            "durationMinutes",
                            event.target.value,
                          )
                        }
                      />

                      <small>
                        min
                      </small>
                    </div>
                  </label>

                  <label className="bike-form__field">
                    <span>
                      Vitesse moyenne
                    </span>

                    <div className="bike-form__control">
                      <Gauge size={18} />

                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={
                          form.averageSpeed
                        }
                        placeholder="24.5"
                        disabled={saving}
                        onChange={(event) =>
                          updateField(
                            "averageSpeed",
                            event.target.value,
                          )
                        }
                      />

                      <small>
                        km/h
                      </small>
                    </div>
                  </label>
                </div>

                <label className="bike-form__field">
                  <span>
                    Statut
                  </span>

                  <select
                    value={form.status}
                    disabled={saving}
                    onChange={(event) =>
                      updateField(
                        "status",
                        event.target.value,
                      )
                    }
                  >
                    <option value="planned">
                      Prévue
                    </option>

                    <option value="completed">
                      Terminée
                    </option>

                    <option value="cancelled">
                      Annulée
                    </option>
                  </select>
                </label>

                <fieldset className="bike-form__participants">
                  <legend>
                    <Users size={17} />
                    Participants
                  </legend>

                  <div>
                    {members.map(
                      (member) => {
                        const selected =
                          form.participantIds.includes(
                            member.id,
                          );

                        return (
                          <button
                            key={member.id}
                            type="button"
                            className={
                              selected
                                ? "bike-form__participant bike-form__participant--active"
                                : "bike-form__participant"
                            }
                            disabled={
                              saving
                            }
                            onClick={() =>
                              toggleParticipant(
                                member.id,
                              )
                            }
                          >
                            <span>
                              {
                                member.initials
                              }
                            </span>

                            <strong>
                              {
                                member.nickname
                              }
                            </strong>

                            {selected && (
                              <Check
                                size={16}
                              />
                            )}
                          </button>
                        );
                      },
                    )}
                  </div>
                </fieldset>

                {errorMessage && (
                  <motion.div
                    className="bike-form__error"
                    initial={{
                      opacity: 0,
                      y: -5,
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
                      {errorMessage}
                    </span>
                  </motion.div>
                )}
              </div>

              <footer className="bike-modal__footer">
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
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        className="bike-form__spinner"
                        size={18}
                      />

                      Enregistrement…
                    </>
                  ) : (
                    <>
                      {ride ? (
                        <Save size={18} />
                      ) : (
                        <Bike size={18} />
                      )}

                      {ride
                        ? "Enregistrer"
                        : "Créer la sortie"}
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

export default BikeRideFormModal;