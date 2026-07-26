import {
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
  CheckCircle2,
  Clock3,
  Edit3,
  HelpCircle,
  MapPin,
  MoreVertical,
  PartyPopper,
  Plus,
  Trash2,
  Trophy,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";

const FILTERS = [
  {
    id: "all",
    label: "Tous",
  },
  {
    id: "tennis",
    label: "Tennis",
  },
  {
    id: "bike",
    label: "Cyclisme",
  },
  {
    id: "party",
    label: "Apéros",
  },
  {
    id: "barbecue",
    label: "Barbecues",
  },
  {
    id: "other",
    label: "Autres",
  },
];

const TYPE_ICONS = {
  tennis: Trophy,
  bike: Bike,
  party: PartyPopper,
  barbecue: PartyPopper,
  other: CalendarDays,
};

function AttendanceButton({
  active,
  icon: Icon,
  label,
  accent,
  disabled,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`events-attendance-button events-attendance-button--${accent} ${
        active
          ? "events-attendance-button--active"
          : ""
      }`}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}

function EventsSection({
  events,
  loading,
  saving,
  error,
  currentProfile,
  isAdmin,
  onCreate,
  onEdit,
  onDelete,
  onAttendance,
}) {
  const [activeFilter, setActiveFilter] =
    useState("all");

  const [period, setPeriod] = useState("upcoming");
  const [openActionsId, setOpenActionsId] =
    useState(null);

  const now = Date.now();

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        if (
          activeFilter !== "all" &&
          event.type !== activeFilter
        ) {
          return false;
        }

        const eventTime = new Date(
          event.startsAt,
        ).getTime();

        if (period === "upcoming") {
          return eventTime >= now;
        }

        return eventTime < now;
      })
      .sort((eventA, eventB) => {
        const dateA = new Date(
          eventA.startsAt,
        ).getTime();

        const dateB = new Date(
          eventB.startsAt,
        ).getTime();

        return period === "upcoming"
          ? dateA - dateB
          : dateB - dateA;
      });
  }, [events, activeFilter, period, now]);

  const upcomingCount = events.filter(
    (event) =>
      new Date(event.startsAt).getTime() >= now,
  ).length;

  const getCurrentAttendance = (event) => {
    return event.participantDetails.find(
      (participant) =>
        participant.profileId === currentProfile?.id,
    )?.attendanceStatus;
  };

  const canManageEvent = (event) => {
    return (
      isAdmin ||
      event.createdBy === currentProfile?.id
    );
  };

  const handleDelete = async (event) => {
    const confirmed = window.confirm(
      `Supprimer définitivement l’événement « ${event.title} » ?`,
    );

    if (!confirmed) {
      return;
    }

    setOpenActionsId(null);
    await onDelete(event.id);
  };

  return (
    <section className="events-section">
      <motion.header
        className="events-section__hero glass-panel"
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <div>
          <span className="section-heading__eyebrow">
            Agenda partagé
          </span>

          <h2>Événements des Co’Pintes</h2>

          <p>
            Organise les prochains matchs, sorties vélo,
            apéros et moments à partager avec toute la bande.
          </p>
        </div>

        <div className="events-section__hero-actions">
          <div className="events-section__hero-stat">
            <small>À venir</small>
            <strong>{upcomingCount}</strong>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={onCreate}
          >
            <Plus size={18} />
            Créer un événement
          </button>
        </div>
      </motion.header>

      <div className="events-section__toolbar">
        <div className="events-section__periods">
          <button
            type="button"
            className={
              period === "upcoming"
                ? "events-section__period--active"
                : ""
            }
            onClick={() => setPeriod("upcoming")}
          >
            À venir
          </button>

          <button
            type="button"
            className={
              period === "past"
                ? "events-section__period--active"
                : ""
            }
            onClick={() => setPeriod("past")}
          >
            Passés
          </button>
        </div>

        <div className="events-section__filters">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={
                activeFilter === filter.id
                  ? "events-section__filter--active"
                  : ""
              }
              onClick={() =>
                setActiveFilter(filter.id)
              }
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="data-status glass-panel">
          <span className="data-status__spinner" />

          <div>
            <strong>
              Chargement des événements
            </strong>

            <p>
              Récupération de l’agenda Supabase…
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="data-status data-status--error glass-panel">
          <AlertCircle size={22} />

          <div>
            <strong>
              Une erreur est survenue
            </strong>

            <p>{error}</p>
          </div>
        </div>
      )}

      {!loading && filteredEvents.length === 0 && (
        <motion.div
          className="events-section__empty glass-panel"
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          <span>
            <CalendarDays size={31} />
          </span>

          <h3>Aucun événement</h3>

          <p>
            Aucun événement ne correspond actuellement aux
            filtres sélectionnés.
          </p>

          {period === "upcoming" && (
            <button
              type="button"
              className="primary-button"
              onClick={onCreate}
            >
              <Plus size={18} />
              Créer le premier événement
            </button>
          )}
        </motion.div>
      )}

      <AnimatePresence mode="popLayout">
        <div className="events-section__grid">
          {filteredEvents.map((event, index) => {
            const Icon =
              TYPE_ICONS[event.type] ??
              CalendarDays;

            const currentAttendance =
              getCurrentAttendance(event);

            const manageable =
              canManageEvent(event);

            return (
              <motion.article
                layout
                key={event.id}
                className={`events-detailed-card events-detailed-card--${event.accent}`}
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                }}
                transition={{
                  delay: index * 0.04,
                }}
              >
                <div className="events-detailed-card__glow" />

                <header className="events-detailed-card__header">
                  <div className="events-detailed-card__category">
                    <span>
                      <Icon size={19} />
                    </span>

                    <div>
                      <small>
                        {event.typeLabel}
                      </small>

                      <strong>
                        {event.statusLabel}
                      </strong>
                    </div>
                  </div>

                  {manageable && (
                    <div className="events-detailed-card__actions">
                      <button
                        type="button"
                        className="events-detailed-card__menu-button"
                        aria-label="Actions"
                        onClick={() =>
                          setOpenActionsId(
                            openActionsId === event.id
                              ? null
                              : event.id,
                          )
                        }
                      >
                        <MoreVertical size={19} />
                      </button>

                      <AnimatePresence>
                        {openActionsId ===
                          event.id && (
                          <motion.div
                            className="events-detailed-card__menu"
                            initial={{
                              opacity: 0,
                              y: -5,
                              scale: 0.96,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              scale: 1,
                            }}
                            exit={{
                              opacity: 0,
                              y: -5,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionsId(
                                  null,
                                );

                                onEdit(event);
                              }}
                            >
                              <Edit3 size={16} />
                              Modifier
                            </button>

                            <button
                              type="button"
                              className="events-detailed-card__delete"
                              onClick={() =>
                                handleDelete(event)
                              }
                            >
                              <Trash2 size={16} />
                              Supprimer
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </header>

                <div className="events-detailed-card__content">
                  <h3>{event.title}</h3>

                  {event.description && (
                    <p>
                      {event.description}
                    </p>
                  )}

                  <div className="events-detailed-card__information">
                    <span>
                      <CalendarDays size={16} />
                      {event.date}
                    </span>

                    <span>
                      <Clock3 size={16} />
                      {event.time}
                      {event.endTime
                        ? ` – ${event.endTime}`
                        : ""}
                    </span>

                    {event.location && (
                      <span>
                        <MapPin size={16} />
                        {event.location}
                      </span>
                    )}
                  </div>

                  {event.type === "bike" && (
                    <div className="events-detailed-card__bike-data">
                      <div>
                        <small>Distance</small>
                        <strong>
                          {event.distance || 0} km
                        </strong>
                      </div>

                      <div>
                        <small>Dénivelé</small>
                        <strong>
                          {event.elevation || 0} m
                        </strong>
                      </div>
                    </div>
                  )}
                </div>

                <div className="events-detailed-card__participants">
                  <div className="events-detailed-card__participants-heading">
                    <span>
                      <Users size={16} />
                      Participants
                    </span>

                    <strong>
                      {event.goingCount} présent
                      {event.goingCount > 1
                        ? "s"
                        : ""}
                    </strong>
                  </div>

                  <div className="events-detailed-card__participant-list">
                    {event.participantDetails
                      .filter(
                        (participant) =>
                          participant.attendanceStatus ===
                          "going",
                      )
                      .slice(0, 6)
                      .map((participant) => (
                        <span
                          key={participant.id}
                          title={
                            participant.profile
                              ?.nickname
                          }
                        >
                          {participant.profile
                            ?.initials ?? "CP"}
                        </span>
                      ))}

                    {event.goingCount === 0 && (
                      <small>
                        Aucun participant confirmé.
                      </small>
                    )}
                  </div>
                </div>

                <footer className="events-detailed-card__footer">
                  <span className="events-detailed-card__attendance-label">
                    Ta réponse
                  </span>

                  <div className="events-detailed-card__attendance">
                    <AttendanceButton
                      icon={CheckCircle2}
                      label="Présent"
                      accent="going"
                      active={
                        currentAttendance ===
                        "going"
                      }
                      disabled={saving}
                      onClick={() =>
                        onAttendance({
                          eventId: event.id,
                          attendanceStatus:
                            "going",
                        })
                      }
                    />

                    <AttendanceButton
                      icon={HelpCircle}
                      label="Peut-être"
                      accent="maybe"
                      active={
                        currentAttendance ===
                        "maybe"
                      }
                      disabled={saving}
                      onClick={() =>
                        onAttendance({
                          eventId: event.id,
                          attendanceStatus:
                            "maybe",
                        })
                      }
                    />

                    <AttendanceButton
                      icon={XCircle}
                      label="Absent"
                      accent="not-going"
                      active={
                        currentAttendance ===
                        "not_going"
                      }
                      disabled={saving}
                      onClick={() =>
                        onAttendance({
                          eventId: event.id,
                          attendanceStatus:
                            "not_going",
                        })
                      }
                    />
                  </div>
                </footer>

                <div className="events-detailed-card__creator">
                  <UserRound size={14} />
                  Créé par{" "}
                  <strong>
                    {event.creator?.nickname ??
                      "un membre"}
                  </strong>
                </div>
              </motion.article>
            );
          })}
        </div>
      </AnimatePresence>
    </section>
  );
}

export default EventsSection;