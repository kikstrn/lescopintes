import { useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  Bike,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Gauge,
  MapPin,
  MoreVertical,
  Mountain,
  Plus,
  Route,
  Trash2,
  Trophy,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

function formatRideDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatRideTime(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDuration(minutes) {
  if (
    minutes === null ||
    minutes === undefined ||
    minutes <= 0
  ) {
    return "—";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes =
    minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${String(
    remainingMinutes,
  ).padStart(2, "0")}`;
}

function getStatusLabel(status) {
  switch (status) {
    case "planned":
      return "Prévue";

    case "cancelled":
      return "Annulée";

    case "completed":
    default:
      return "Terminée";
  }
}

function getStatusIcon(status) {
  if (status === "planned") {
    return CalendarDays;
  }

  if (status === "cancelled") {
    return XCircle;
  }

  return CheckCircle2;
}

function CyclingSection({
  rides = [],
  members = [],
  loading = false,
  saving = false,
  error = null,
  currentProfile,
  isAdmin = false,
  onCreate,
  onEdit,
  onDelete,
  onJoin,
  onLeave,
}) {
  const [
    activeFilter,
    setActiveFilter,
  ] = useState("all");

  const [
    openMenuId,
    setOpenMenuId,
  ] = useState(null);

  const completedRides = useMemo(() => {
    return rides.filter(
      (ride) =>
        ride.status === "completed",
    );
  }, [rides]);

  const filteredRides = useMemo(() => {
    if (activeFilter === "all") {
      return rides;
    }

    return rides.filter(
      (ride) =>
        ride.status === activeFilter,
    );
  }, [rides, activeFilter]);

  const totalDistance = useMemo(() => {
    return completedRides.reduce(
      (total, ride) =>
        total +
        Number(
          ride.distanceKm ?? 0,
        ),
      0,
    );
  }, [completedRides]);

  const totalElevation = useMemo(() => {
    return completedRides.reduce(
      (total, ride) =>
        total +
        Number(
          ride.elevationM ?? 0,
        ),
      0,
    );
  }, [completedRides]);

  const averageSpeed = useMemo(() => {
    const speeds = completedRides
      .map((ride) =>
        Number(
          ride.averageSpeed ?? 0,
        ),
      )
      .filter(
        (speed) =>
          Number.isFinite(speed) &&
          speed > 0,
      );

    if (speeds.length === 0) {
      return 0;
    }

    return (
      speeds.reduce(
        (total, speed) =>
          total + speed,
        0,
      ) / speeds.length
    );
  }, [completedRides]);

  const memberRanking =
    useMemo(() => {
      return members
        .map((member) => {
          const memberRides =
            completedRides.filter(
              (ride) =>
                ride.participantIds.includes(
                  member.id,
                ),
            );

          return {
            ...member,

            bikeRideCount:
              memberRides.length,

            bikeDistance:
              memberRides.reduce(
                (total, ride) =>
                  total +
                  Number(
                    ride.distanceKm ??
                      0,
                  ),
                0,
              ),

            bikeElevation:
              memberRides.reduce(
                (total, ride) =>
                  total +
                  Number(
                    ride.elevationM ??
                      0,
                  ),
                0,
              ),
          };
        })
        .sort(
          (memberA, memberB) =>
            memberB.bikeDistance -
            memberA.bikeDistance,
        );
    }, [members, completedRides]);

  const activeMemberCount =
    memberRanking.filter(
      (member) =>
        member.bikeRideCount > 0,
    ).length;

  const canManageRide = (
    ride,
  ) => {
    return (
      isAdmin ||
      ride.createdBy ===
        currentProfile?.id
    );
  };

  const isCurrentUserParticipant = (
    ride,
  ) => {
    return ride.participantIds.includes(
      currentProfile?.id,
    );
  };

  const handleDelete = async (
    ride,
  ) => {
    const confirmed =
      window.confirm(
        `Supprimer définitivement la sortie « ${ride.title} » ?`,
      );

    if (!confirmed) {
      return;
    }

    setOpenMenuId(null);

    try {
      await onDelete(ride.id);
    } catch (deleteError) {
      console.error(
        "Impossible de supprimer la sortie :",
        deleteError,
      );
    }
  };

  const handleJoin = async (
    rideId,
  ) => {
    try {
      await onJoin(rideId);
    } catch (joinError) {
      console.error(
        "Impossible de rejoindre la sortie :",
        joinError,
      );
    }
  };

  const handleLeave = async (
    rideId,
  ) => {
    try {
      await onLeave(rideId);
    } catch (leaveError) {
      console.error(
        "Impossible de quitter la sortie :",
        leaveError,
      );
    }
  };

  return (
    <section className="cycling-section">
      <motion.header
        className="cycling-section__hero glass-panel"
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <div className="cycling-section__hero-content">
          <span className="section-heading__eyebrow">
            Peloton des Co’Pintes
          </span>

          <h2>
            Sorties cyclistes
          </h2>

          <p>
            Enregistre les parcours,
            les performances et tous
            les kilomètres parcourus
            ensemble.
          </p>
        </div>

        <div className="cycling-section__hero-actions">
          <div className="cycling-section__hero-stat">
            <small>
              Sorties terminées
            </small>

            <strong>
              {
                completedRides.length
              }
            </strong>
          </div>

          <div className="cycling-section__hero-stat">
            <small>
              Distance totale
            </small>

            <strong>
              {totalDistance.toLocaleString(
                "fr-FR",
                {
                  maximumFractionDigits: 1,
                },
              )}{" "}
              km
            </strong>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={onCreate}
          >
            <Plus size={18} />

            Ajouter une sortie
          </button>
        </div>
      </motion.header>

      <section className="cycling-summary-grid">
        <article className="cycling-summary-card glass-panel">
          <span className="cycling-summary-card__icon">
            <Route size={22} />
          </span>

          <div>
            <small>
              Distance cumulée
            </small>

            <strong>
              {totalDistance.toLocaleString(
                "fr-FR",
                {
                  maximumFractionDigits: 1,
                },
              )}{" "}
              km
            </strong>
          </div>
        </article>

        <article className="cycling-summary-card glass-panel">
          <span className="cycling-summary-card__icon">
            <Mountain size={22} />
          </span>

          <div>
            <small>
              Dénivelé cumulé
            </small>

            <strong>
              {Math.round(
                totalElevation,
              ).toLocaleString(
                "fr-FR",
              )}{" "}
              m
            </strong>
          </div>
        </article>

        <article className="cycling-summary-card glass-panel">
          <span className="cycling-summary-card__icon">
            <Gauge size={22} />
          </span>

          <div>
            <small>
              Vitesse moyenne
            </small>

            <strong>
              {averageSpeed > 0
                ? `${averageSpeed.toFixed(
                    1,
                  )} km/h`
                : "—"}
            </strong>
          </div>
        </article>

        <article className="cycling-summary-card glass-panel">
          <span className="cycling-summary-card__icon">
            <Users size={22} />
          </span>

          <div>
            <small>
              Membres actifs
            </small>

            <strong>
              {activeMemberCount}
            </strong>
          </div>
        </article>
      </section>

      <div className="cycling-section__toolbar">
        <div className="cycling-section__filters">
          {[
            {
              id: "all",
              label: "Toutes",
            },
            {
              id: "planned",
              label: "Prévues",
            },
            {
              id: "completed",
              label: "Terminées",
            },
            {
              id: "cancelled",
              label: "Annulées",
            },
          ].map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={
                activeFilter ===
                filter.id
                  ? "cycling-section__filter cycling-section__filter--active"
                  : "cycling-section__filter"
              }
              onClick={() =>
                setActiveFilter(
                  filter.id,
                )
              }
            >
              {filter.label}
            </button>
          ))}
        </div>

        <span className="cycling-section__result-count">
          {filteredRides.length} sortie
          {filteredRides.length > 1
            ? "s"
            : ""}
        </span>
      </div>

      {loading && (
        <div className="data-status glass-panel">
          <span className="data-status__spinner" />

          <div>
            <strong>
              Chargement des sorties
            </strong>

            <p>
              Récupération des données
              Supabase…
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="data-status data-status--error glass-panel">
          <div>
            <strong>
              Impossible de charger
              le cyclisme
            </strong>

            <p>{error}</p>
          </div>
        </div>
      )}

      <section className="cycling-layout">
        <div className="cycling-rides">
          <div className="section-heading">
            <div>
              <span className="section-heading__eyebrow">
                Historique
              </span>

              <h2>
                Les sorties du groupe
              </h2>
            </div>
          </div>

          <AnimatePresence
            mode="popLayout"
          >
            <div className="cycling-rides__grid">
              {filteredRides.map(
                (ride, index) => {
                  const StatusIcon =
                    getStatusIcon(
                      ride.status,
                    );

                  const manageable =
                    canManageRide(
                      ride,
                    );

                  const joined =
                    isCurrentUserParticipant(
                      ride,
                    );

                  return (
                    <motion.article
                      layout
                      key={ride.id}
                      className={`cycling-ride-card cycling-ride-card--${ride.status} glass-panel`}
                      initial={{
                        opacity: 0,
                        y: 16,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.97,
                      }}
                      transition={{
                        delay:
                          index * 0.04,
                      }}
                    >
                      <div className="cycling-ride-card__glow" />

                      <header className="cycling-ride-card__top">
                        <span
                          className={`cycling-ride-card__status cycling-ride-card__status--${ride.status}`}
                        >
                          <StatusIcon
                            size={15}
                          />

                          {getStatusLabel(
                            ride.status,
                          )}
                        </span>

                        {manageable && (
                          <div className="cycling-ride-card__menu-wrapper">
                            <button
                              type="button"
                              className="cycling-ride-card__menu-button"
                              aria-label="Actions de la sortie"
                              onClick={() =>
                                setOpenMenuId(
                                  openMenuId ===
                                    ride.id
                                    ? null
                                    : ride.id,
                                )
                              }
                            >
                              <MoreVertical
                                size={19}
                              />
                            </button>

                            <AnimatePresence>
                              {openMenuId ===
                                ride.id && (
                                <motion.div
                                  className="cycling-ride-card__menu"
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
                                    y: -4,
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(
                                        null,
                                      );

                                      onEdit(
                                        ride,
                                      );
                                    }}
                                  >
                                    <Edit3
                                      size={16}
                                    />

                                    Modifier
                                  </button>

                                  <button
                                    type="button"
                                    className="cycling-ride-card__delete"
                                    onClick={() =>
                                      handleDelete(
                                        ride,
                                      )
                                    }
                                  >
                                    <Trash2
                                      size={16}
                                    />

                                    Supprimer
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </header>

                      <div className="cycling-ride-card__icon">
                        <Bike size={29} />
                      </div>

                      <h3>
                        {ride.title}
                      </h3>

                      {ride.description && (
                        <p className="cycling-ride-card__description">
                          {
                            ride.description
                          }
                        </p>
                      )}

                      <div className="cycling-ride-card__meta">
                        <span>
                          <CalendarDays
                            size={15}
                          />

                          {formatRideDate(
                            ride.rideDate,
                          )}
                        </span>

                        <span>
                          <Clock3 size={15} />

                          {formatRideTime(
                            ride.rideDate,
                          )}
                        </span>

                        {ride.location && (
                          <span>
                            <MapPin
                              size={15}
                            />

                            {
                              ride.location
                            }
                          </span>
                        )}
                      </div>

                      <div className="cycling-ride-card__metrics">
                        <div>
                          <Route size={17} />

                          <small>
                            Distance
                          </small>

                          <strong>
                            {
                              ride.distanceKm
                            }{" "}
                            km
                          </strong>
                        </div>

                        <div>
                          <Mountain
                            size={17}
                          />

                          <small>
                            Dénivelé
                          </small>

                          <strong>
                            {
                              ride.elevationM
                            }{" "}
                            m
                          </strong>
                        </div>

                        <div>
                          <Clock3 size={17} />

                          <small>
                            Durée
                          </small>

                          <strong>
                            {formatDuration(
                              ride.durationMinutes,
                            )}
                          </strong>
                        </div>

                        <div>
                          <Gauge size={17} />

                          <small>
                            Vitesse
                          </small>

                          <strong>
                            {ride.averageSpeed
                              ? `${ride.averageSpeed} km/h`
                              : "—"}
                          </strong>
                        </div>
                      </div>

                      <div className="cycling-ride-card__participants">
                        <div className="cycling-ride-card__participants-heading">
                          <Users size={16} />

                          <span>
                            {
                              ride
                                .participantProfiles
                                .length
                            }{" "}
                            participant
                            {ride
                              .participantProfiles
                              .length > 1
                              ? "s"
                              : ""}
                          </span>
                        </div>

                        <div className="cycling-ride-card__avatars">
                          {ride.participantProfiles
                            .slice(0, 6)
                            .map(
                              (
                                participant,
                              ) => (
                                <span
                                  key={
                                    participant.id
                                  }
                                  title={
                                    participant.nickname
                                  }
                                >
                                  {
                                    participant.initials
                                  }
                                </span>
                              ),
                            )}

                          {ride
                            .participantProfiles
                            .length >
                            6 && (
                            <span>
                              +
                              {ride
                                .participantProfiles
                                .length -
                                6}
                            </span>
                          )}
                        </div>
                      </div>

                      <footer className="cycling-ride-card__footer">
                        <span className="cycling-ride-card__creator">
                          Créée par{" "}
                          <strong>
                            {ride.creator
                              ?.nickname ??
                              "un membre"}
                          </strong>
                        </span>

                        {joined ? (
                          <button
                            type="button"
                            className="secondary-button secondary-button--compact"
                            disabled={
                              saving
                            }
                            onClick={() =>
                              handleLeave(
                                ride.id,
                              )
                            }
                          >
                            <XCircle
                              size={16}
                            />

                            Quitter
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="primary-button primary-button--compact"
                            disabled={
                              saving
                            }
                            onClick={() =>
                              handleJoin(
                                ride.id,
                              )
                            }
                          >
                            <UserPlus
                              size={16}
                            />

                            Participer
                          </button>
                        )}
                      </footer>
                    </motion.article>
                  );
                },
              )}
            </div>
          </AnimatePresence>

          {!loading &&
            filteredRides.length ===
              0 && (
              <motion.div
                className="cycling-empty glass-panel"
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
                  <Bike size={34} />
                </span>

                <h3>
                  Aucune sortie
                </h3>

                <p>
                  Aucune sortie cycliste
                  ne correspond au filtre
                  sélectionné.
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={onCreate}
                >
                  <Plus size={18} />

                  Ajouter une sortie
                </button>
              </motion.div>
            )}
        </div>

        <aside className="cycling-ranking glass-panel">
          <div className="cycling-ranking__heading">
            <div>
              <span className="section-heading__eyebrow">
                Classement
              </span>

              <h3>
                Les plus gros
                rouleurs
              </h3>
            </div>

            <span>
              <Trophy size={21} />
            </span>
          </div>

          <div className="cycling-ranking__list">
            {memberRanking.map(
              (member, index) => (
                <motion.article
                  key={member.id}
                  className={
                    index === 0
                      ? "cycling-ranking__row cycling-ranking__row--leader"
                      : "cycling-ranking__row"
                  }
                  initial={{
                    opacity: 0,
                    x: 10,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.04,
                  }}
                >
                  <strong className="cycling-ranking__position">
                    {index + 1}
                  </strong>

                  <span className="cycling-ranking__avatar">
                    {
                      member.initials
                    }
                  </span>

                  <div className="cycling-ranking__identity">
                    <strong>
                      {
                        member.nickname
                      }
                    </strong>

                    <small>
                      {
                        member.bikeRideCount
                      }{" "}
                      sortie
                      {member.bikeRideCount >
                      1
                        ? "s"
                        : ""}
                    </small>
                  </div>

                  <div className="cycling-ranking__distance">
                    <strong>
                      {member.bikeDistance.toLocaleString(
                        "fr-FR",
                        {
                          maximumFractionDigits: 1,
                        },
                      )}
                    </strong>

                    <small>km</small>
                  </div>
                </motion.article>
              ),
            )}
          </div>
        </aside>
      </section>
    </section>
  );
}

export default CyclingSection;