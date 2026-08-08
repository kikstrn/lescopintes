import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bike,
  CalendarDays,
  Clock3,
  MapPin,
  PartyPopper,
  Trophy,
  UserRound,
  Users,
  X,
} from "lucide-react";

const TYPE_ICONS = {
  tennis: Trophy,
  bike: Bike,
  party: PartyPopper,
  barbecue: PartyPopper,
  other: CalendarDays,
};

function EventDetailsModal({
  event,
  open,
  onClose,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open, onClose]);

  if (!event) return null;

  const Icon =
    TYPE_ICONS[event.type] ??
    CalendarDays;

  const goingParticipants =
    (event.participantDetails ?? [])
      .filter(
        (participant) =>
          participant.attendanceStatus ===
          "going",
      );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="event-details-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              onClose();
            }
          }}
        >
          <motion.section
            className={`event-details-modal event-details-modal--${event.accent ?? "green"}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-details-title"
            initial={{
              opacity: 0,
              y: 24,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 24,
              scale: 0.98,
            }}
            transition={{
              duration: 0.2,
            }}
          >
            <header className="event-details-modal__header">
              <div className="event-details-modal__category">
                <span>
                  <Icon size={20} />
                </span>

                <div>
                  <small>
                    {event.typeLabel ??
                      "Événement"}
                  </small>

                  <strong>
                    {event.statusLabel ??
                      "Confirmé"}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                className="event-details-modal__close"
                aria-label="Fermer"
                onClick={onClose}
              >
                <X size={21} />
              </button>
            </header>

            <div className="event-details-modal__scroll">
              <h2 id="event-details-title">
                {event.title}
              </h2>

              {event.description && (
                <div className="event-details-modal__description">
                  <small>Description</small>
                  <p>
                    {event.description}
                  </p>
                </div>
              )}

              <div className="event-details-modal__information">
                <div>
                  <CalendarDays
                    size={18}
                  />
                  <span>
                    <small>Date</small>
                    <strong>
                      {event.date}
                    </strong>
                  </span>
                </div>

                <div>
                  <Clock3 size={18} />
                  <span>
                    <small>Horaire</small>
                    <strong>
                      {event.time}
                      {event.endTime
                        ? ` – ${event.endTime}`
                        : ""}
                    </strong>
                  </span>
                </div>

                {event.location && (
                  <div>
                    <MapPin size={18} />
                    <span>
                      <small>Lieu</small>
                      <strong>
                        {event.location}
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              {event.type === "bike" && (
                <div className="event-details-modal__bike">
                  <div>
                    <Bike size={18} />
                    <span>
                      <small>
                        Distance
                      </small>
                      <strong>
                        {event.distance || 0} km
                      </strong>
                    </span>
                  </div>

                  <div>
                    <span>
                      <small>
                        Dénivelé
                      </small>
                      <strong>
                        {event.elevation || 0} m
                      </strong>
                    </span>
                  </div>
                </div>
              )}

              <div className="event-details-modal__participants">
                <div className="event-details-modal__section-title">
                  <span>
                    <Users size={17} />
                    Participants
                  </span>

                  <strong>
                    {event.goingCount ?? goingParticipants.length} présent
                    {(event.goingCount ??
                      goingParticipants.length) > 1
                      ? "s"
                      : ""}
                  </strong>
                </div>

                {goingParticipants.length >
                0 ? (
                  <div className="event-details-modal__people">
                    {goingParticipants.map(
                      (participant) => (
                        <span
                          key={
                            participant.id
                          }
                        >
                          <i>
                            {participant
                              .profile
                              ?.initials ??
                              "CP"}
                          </i>

                          {participant
                            .profile
                            ?.nickname ??
                            "Membre"}
                        </span>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="event-details-modal__empty">
                    Aucun participant confirmé.
                  </p>
                )}
              </div>

              <div className="event-details-modal__creator">
                <UserRound size={16} />
                Créé par{" "}
                <strong>
                  {event.creator?.nickname ??
                    "un membre"}
                </strong>
              </div>
            </div>

            <footer className="event-details-modal__footer">
              <button
                type="button"
                className="primary-button"
                onClick={onClose}
              >
                Fermer
              </button>
            </footer>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default EventDetailsModal;
