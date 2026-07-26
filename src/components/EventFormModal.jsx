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
  Bike,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  LoaderCircle,
  MapPin,
  Mountain,
  PartyPopper,
  Save,
  Trophy,
  X,
} from "lucide-react";

const EVENT_TYPES = [
  {
    id: "tennis",
    label: "Tennis",
    icon: Trophy,
  },
  {
    id: "bike",
    label: "Cyclisme",
    icon: Bike,
  },
  {
    id: "party",
    label: "Apéro",
    icon: PartyPopper,
  },
  {
    id: "barbecue",
    label: "Barbecue",
    icon: PartyPopper,
  },
  {
    id: "other",
    label: "Autre",
    icon: CalendarDays,
  },
];

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function toLocalDateParts(value) {
  if (!value) {
    return {
      date: "",
      time: "",
    };
  }

  const date = new Date(value);

  return {
    date: [
      date.getFullYear(),
      padNumber(date.getMonth() + 1),
      padNumber(date.getDate()),
    ].join("-"),
    time: `${padNumber(date.getHours())}:${padNumber(
      date.getMinutes(),
    )}`,
  };
}

function createIsoDate(dateValue, timeValue) {
  if (!dateValue || !timeValue) {
    return null;
  }

  const localDate = new Date(
    `${dateValue}T${timeValue}:00`,
  );

  if (Number.isNaN(localDate.getTime())) {
    return null;
  }

  return localDate.toISOString();
}

function EventFormModal({
  open,
  event,
  saving,
  onClose,
  onSubmit,
}) {
  const initialValues = useMemo(() => {
    const start = toLocalDateParts(event?.startsAt);
    const end = toLocalDateParts(event?.endsAt);

    return {
      title: event?.title ?? "",
      description: event?.description ?? "",
      eventType: event?.type ?? "tennis",
      location: event?.location ?? "",
      date: start.date,
      startTime: start.time,
      endTime: end.time,
      distanceKm:
        event?.distance && event.distance > 0
          ? String(event.distance)
          : "",
      elevationM:
        event?.elevation && event.elevation > 0
          ? String(event.elevation)
          : "",
      status: event?.status ?? "confirmed",
    };
  }, [event]);

  const [form, setForm] = useState(initialValues);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (open) {
      setForm(initialValues);
      setErrorMessage("");
    }
  }, [open, initialValues]);

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    setErrorMessage("");
  };

  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();
    setErrorMessage("");

    if (!form.title.trim()) {
      setErrorMessage(
        "Renseigne un titre pour l’événement.",
      );
      return;
    }

    if (!form.date || !form.startTime) {
      setErrorMessage(
        "Renseigne la date et l’heure de début.",
      );
      return;
    }

    const startsAt = createIsoDate(
      form.date,
      form.startTime,
    );

    const endsAt = form.endTime
      ? createIsoDate(form.date, form.endTime)
      : null;

    if (!startsAt) {
      setErrorMessage(
        "La date ou l’heure de début est invalide.",
      );
      return;
    }

    if (
      endsAt &&
      new Date(endsAt).getTime() <=
        new Date(startsAt).getTime()
    ) {
      setErrorMessage(
        "L’heure de fin doit être postérieure à l’heure de début.",
      );
      return;
    }

    try {
      await onSubmit({
        title: form.title,
        description: form.description,
        eventType: form.eventType,
        location: form.location,
        startsAt,
        endsAt,
        distanceKm: form.distanceKm,
        elevationM: form.elevationM,
        status: form.status,
      });
    } catch (error) {
      setErrorMessage(
        error?.message ??
          "Impossible d’enregistrer l’événement.",
      );
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="event-form-modal__overlay"
            aria-label="Fermer la fenêtre"
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
            onClick={onClose}
          />

          <motion.section
            className="event-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-form-title"
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.96,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 28,
            }}
          >
            <div className="event-form-modal__glow" />

            <header className="event-form-modal__header">
              <div>
                <span className="section-heading__eyebrow">
                  Agenda des Co’Pintes
                </span>

                <h2 id="event-form-title">
                  {event
                    ? "Modifier l’événement"
                    : "Créer un événement"}
                </h2>
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
              className="event-form"
              onSubmit={handleSubmit}
            >
              <div className="event-form__body">
                <fieldset className="event-form__types">
                  <legend>Type d’événement</legend>

                  <div>
                    {EVENT_TYPES.map((type) => {
                      const Icon = type.icon;
                      const selected =
                        form.eventType === type.id;

                      return (
                        <button
                          key={type.id}
                          type="button"
                          className={`event-form__type ${
                            selected
                              ? "event-form__type--active"
                              : ""
                          }`}
                          onClick={() =>
                            updateField(
                              "eventType",
                              type.id,
                            )
                          }
                        >
                          <Icon size={18} />
                          <span>{type.label}</span>

                          {selected && (
                            <Check size={15} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <label className="event-form__field event-form__field--wide">
                  <span>Titre *</span>

                  <input
                    type="text"
                    value={form.title}
                    maxLength={100}
                    placeholder="Ex. Tournoi des Co’Pintes"
                    disabled={saving}
                    onChange={(inputEvent) =>
                      updateField(
                        "title",
                        inputEvent.target.value,
                      )
                    }
                  />
                </label>

                <label className="event-form__field event-form__field--wide">
                  <span>Description</span>

                  <textarea
                    value={form.description}
                    rows={4}
                    maxLength={800}
                    placeholder="Ajoute quelques informations utiles…"
                    disabled={saving}
                    onChange={(inputEvent) =>
                      updateField(
                        "description",
                        inputEvent.target.value,
                      )
                    }
                  />
                </label>

                <div className="event-form__grid">
                  <label className="event-form__field">
                    <span>Date *</span>

                    <div className="event-form__control">
                      <CalendarDays size={18} />

                      <input
                        type="date"
                        value={form.date}
                        disabled={saving}
                        onChange={(inputEvent) =>
                          updateField(
                            "date",
                            inputEvent.target.value,
                          )
                        }
                      />
                    </div>
                  </label>

                  <label className="event-form__field">
                    <span>Heure de début *</span>

                    <div className="event-form__control">
                      <Clock3 size={18} />

                      <input
                        type="time"
                        value={form.startTime}
                        disabled={saving}
                        onChange={(inputEvent) =>
                          updateField(
                            "startTime",
                            inputEvent.target.value,
                          )
                        }
                      />
                    </div>
                  </label>

                  <label className="event-form__field">
                    <span>Heure de fin</span>

                    <div className="event-form__control">
                      <Clock3 size={18} />

                      <input
                        type="time"
                        value={form.endTime}
                        disabled={saving}
                        onChange={(inputEvent) =>
                          updateField(
                            "endTime",
                            inputEvent.target.value,
                          )
                        }
                      />
                    </div>
                  </label>

                  <label className="event-form__field">
                    <span>Statut</span>

                    <div className="event-form__control">
                      <Check size={18} />

                      <select
                        value={form.status}
                        disabled={saving}
                        onChange={(inputEvent) =>
                          updateField(
                            "status",
                            inputEvent.target.value,
                          )
                        }
                      >
                        <option value="draft">
                          Brouillon
                        </option>

                        <option value="confirmed">
                          Confirmé
                        </option>

                        <option value="cancelled">
                          Annulé
                        </option>

                        <option value="completed">
                          Terminé
                        </option>
                      </select>

                      <ChevronDown size={17} />
                    </div>
                  </label>
                </div>

                <label className="event-form__field event-form__field--wide">
                  <span>Lieu</span>

                  <div className="event-form__control">
                    <MapPin size={18} />

                    <input
                      type="text"
                      value={form.location}
                      maxLength={180}
                      placeholder="Ex. Tennis Club de Cuincy"
                      disabled={saving}
                      onChange={(inputEvent) =>
                        updateField(
                          "location",
                          inputEvent.target.value,
                        )
                      }
                    />
                  </div>
                </label>

                {form.eventType === "bike" && (
                  <motion.div
                    className="event-form__bike-fields"
                    initial={{
                      opacity: 0,
                      height: 0,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                    }}
                  >
                    <label className="event-form__field">
                      <span>Distance prévue</span>

                      <div className="event-form__control">
                        <Bike size={18} />

                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={form.distanceKm}
                          placeholder="62"
                          disabled={saving}
                          onChange={(inputEvent) =>
                            updateField(
                              "distanceKm",
                              inputEvent.target.value,
                            )
                          }
                        />

                        <small>km</small>
                      </div>
                    </label>

                    <label className="event-form__field">
                      <span>Dénivelé positif</span>

                      <div className="event-form__control">
                        <Mountain size={18} />

                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={form.elevationM}
                          placeholder="340"
                          disabled={saving}
                          onChange={(inputEvent) =>
                            updateField(
                              "elevationM",
                              inputEvent.target.value,
                            )
                          }
                        />

                        <small>m</small>
                      </div>
                    </label>
                  </motion.div>
                )}

                {errorMessage && (
                  <motion.div
                    className="event-form__error"
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
                    <AlertCircle size={18} />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </div>

              <footer className="event-form-modal__footer">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={saving}
                  onClick={onClose}
                >
                  Annuler
                </button>

                <motion.button
                  type="submit"
                  className="primary-button"
                  whileTap={{
                    scale: 0.97,
                  }}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        className="event-form__spinner"
                        size={18}
                      />
                      Enregistrement…
                    </>
                  ) : (
                    <>
                      {event ? (
                        <Save size={18} />
                      ) : (
                        <CalendarDays size={18} />
                      )}

                      {event
                        ? "Enregistrer les modifications"
                        : "Créer l’événement"}
                    </>
                  )}
                </motion.button>
              </footer>
            </form>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}

export default EventFormModal;