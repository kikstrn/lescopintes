import { useMemo } from "react";

import { motion } from "framer-motion";

import {
  Bike,
  CalendarDays,
  Camera,
  Heart,
  Image,
  MapPin,
  MessageCircle,
  Mountain,
  Route,
  Sparkles,
  Trophy,
} from "lucide-react";

function formatActivityDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDistance(value) {
  return Number(value ?? 0).toLocaleString(
    "fr-FR",
    {
      maximumFractionDigits: 1,
    },
  );
}

function getActivityIcon(type) {
  switch (type) {
    case "tennis":
      return Trophy;

    case "bike":
      return Bike;

    case "photo":
      return Camera;

    case "like":
      return Heart;

    case "comment":
      return MessageCircle;

    default:
      return Sparkles;
  }
}

function getActivityAccent(type) {
  switch (type) {
    case "tennis":
      return "green";

    case "bike":
      return "blue";

    case "photo":
      return "purple";

    case "like":
      return "red";

    case "comment":
      return "amber";

    default:
      return "green";
  }
}

function ProfileActivity({
  tennisMatches = [],
  bikeRides = [],
  galleryPhotos = [],
  galleryComments = [],
  currentProfileId,
  loading = false,
  onNavigate,
}) {
  const activities = useMemo(() => {
    const tennisActivities = tennisMatches
      .filter((match) => {
        const participantIds =
          match.playerIds ??
          match.participantIds ??
          [];

        return participantIds.includes(
          currentProfileId,
        );
      })
      .map((match) => ({
        id: `tennis-${match.id}`,
        type: "tennis",
        title:
          match.title ??
          "Match de tennis",
        description:
          match.winnerTeam
            ? `Match terminé · équipe ${match.winnerTeam} victorieuse`
            : "Match enregistré",
        date:
          match.playedAt ??
          match.matchDate ??
          match.createdAt,
        page: "tennis",
        meta: [
          match.location
            ? {
                icon: MapPin,
                label:
                  match.location,
              }
            : null,
        ].filter(Boolean),
      }));

    const bikeActivities = bikeRides
      .filter((ride) =>
        ride.participantIds?.includes(
          currentProfileId,
        ),
      )
      .map((ride) => ({
        id: `bike-${ride.id}`,
        type: "bike",
        title: ride.title,
        description:
          ride.status === "planned"
            ? "Sortie vélo planifiée"
            : ride.status === "cancelled"
              ? "Sortie vélo annulée"
              : "Sortie vélo terminée",
        date:
          ride.rideDate ??
          ride.createdAt,
        page: "bike",
        meta: [
          Number(ride.distanceKm) > 0
            ? {
                icon: Route,
                label: `${formatDistance(
                  ride.distanceKm,
                )} km`,
              }
            : null,
          Number(ride.elevationM) > 0
            ? {
                icon: Mountain,
                label: `${Math.round(
                  ride.elevationM,
                )} m`,
              }
            : null,
          ride.location
            ? {
                icon: MapPin,
                label: ride.location,
              }
            : null,
        ].filter(Boolean),
      }));

    const photoActivities = galleryPhotos
      .filter(
        (photo) =>
          photo.uploadedBy ===
          currentProfileId,
      )
      .map((photo) => ({
        id: `photo-${photo.id}`,
        type: "photo",
        title:
          photo.caption ||
          "Nouvelle photo partagée",
        description:
          photo.album?.name
            ? `Ajoutée dans l’album ${photo.album.name}`
            : "Ajoutée à la galerie",
        date:
          photo.createdAt ??
          photo.takenAt,
        page: "gallery",
        imageUrl:
          photo.signedUrl ??
          null,
        meta: [
          {
            icon: Heart,
            label: `${photo.likeCount ?? 0} like${
              (photo.likeCount ?? 0) > 1
                ? "s"
                : ""
            }`,
          },
          {
            icon: MessageCircle,
            label: `${
              photo.commentCount ?? 0
            } commentaire${
              (photo.commentCount ?? 0) >
              1
                ? "s"
                : ""
            }`,
          },
        ],
      }));

    const commentActivities =
      galleryComments
        .filter(
          (comment) =>
            comment.profileId ===
            currentProfileId,
        )
        .map((comment) => ({
          id: `comment-${comment.id}`,
          type: "comment",
          title:
            "Commentaire publié",
          description:
            comment.content,
          date:
            comment.createdAt,
          page: "gallery",
          meta: [],
        }));

    return [
      ...tennisActivities,
      ...bikeActivities,
      ...photoActivities,
      ...commentActivities,
    ]
      .filter(
        (activity) =>
          activity.date,
      )
      .sort(
        (activityA, activityB) =>
          new Date(
            activityB.date,
          ).getTime() -
          new Date(
            activityA.date,
          ).getTime(),
      )
      .slice(0, 12);
  }, [
    tennisMatches,
    bikeRides,
    galleryPhotos,
    galleryComments,
    currentProfileId,
  ]);

  if (loading) {
    return (
      <section className="profile-activity">
        <header className="profile-section-heading">
          <div>
            <span className="section-heading__eyebrow">
              Historique
            </span>

            <h2>
              Mon activité récente
            </h2>
          </div>
        </header>

        <div className="profile-activity__loading glass-panel">
          <span className="data-status__spinner" />

          <div>
            <strong>
              Chargement de l’activité
            </strong>

            <p>
              Récupération de tes dernières actions…
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-activity">
      <header className="profile-section-heading">
        <div>
          <span className="section-heading__eyebrow">
            Historique
          </span>

          <h2>
            Mon activité récente
          </h2>
        </div>

        <span className="profile-section-heading__icon">
          <CalendarDays size={21} />
        </span>
      </header>

      {activities.length === 0 ? (
        <div className="profile-activity__empty glass-panel">
          <span>
            <Sparkles size={32} />
          </span>

          <h3>
            Aucune activité récente
          </h3>

          <p>
            Tes matchs, sorties vélo, photos et commentaires
            apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="profile-activity__timeline">
          {activities.map(
            (activity, index) => {
              const Icon =
                getActivityIcon(
                  activity.type,
                );

              const accent =
                getActivityAccent(
                  activity.type,
                );

              return (
                <motion.article
                  key={activity.id}
                  className="profile-activity__item glass-panel"
                  initial={{
                    opacity: 0,
                    x: -12,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.04,
                  }}
                  onClick={() =>
                    activity.page &&
                    onNavigate?.(
                      activity.page,
                    )
                  }
                >
                  <div
                    className={`profile-activity__icon profile-activity__icon--${accent}`}
                  >
                    <Icon size={20} />
                  </div>

                  {activity.imageUrl && (
                    <div className="profile-activity__image">
                      <img
                        src={
                          activity.imageUrl
                        }
                        alt=""
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="profile-activity__content">
                    <div className="profile-activity__heading">
                      <div>
                        <strong>
                          {activity.title}
                        </strong>

                        <small>
                          {formatActivityDate(
                            activity.date,
                          )}
                        </small>
                      </div>

                      <span
                        className={`profile-activity__type profile-activity__type--${accent}`}
                      >
                        {activity.type ===
                        "tennis"
                          ? "Tennis"
                          : activity.type ===
                              "bike"
                            ? "Cyclisme"
                            : activity.type ===
                                "photo"
                              ? "Galerie"
                              : activity.type ===
                                  "comment"
                                ? "Commentaire"
                                : "Activité"}
                      </span>
                    </div>

                    {activity.description && (
                      <p>
                        {
                          activity.description
                        }
                      </p>
                    )}

                    {activity.meta.length >
                      0 && (
                      <div className="profile-activity__meta">
                        {activity.meta.map(
                          (
                            metaItem,
                            metaIndex,
                          ) => {
                            const MetaIcon =
                              metaItem.icon ??
                              Image;

                            return (
                              <span
                                key={`${activity.id}-${metaIndex}`}
                              >
                                <MetaIcon
                                  size={14}
                                />

                                {
                                  metaItem.label
                                }
                              </span>
                            );
                          },
                        )}
                      </div>
                    )}
                  </div>
                </motion.article>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}

export default ProfileActivity;