import { motion } from "framer-motion";

import {
  Bike,
  Camera,
  Heart,
  Medal,
  Mountain,
  Sparkles,
  Trophy,
} from "lucide-react";

function formatDistance(value) {
  return Number(value ?? 0).toLocaleString(
    "fr-FR",
    {
      maximumFractionDigits: 1,
    },
  );
}

function ProfileStats({
  statistics = {
    tennisMatches: 0,
    tennisWins: 0,
    tennisWinRate: 0,
    bikeRideCount: 0,
    bikeDistance: 0,
    bikeElevation: 0,
    photoCount: 0,
    receivedLikeCount: 0,
  },
}) {
  const statisticCards = [
    {
      id: "tennis-matches",
      label: "Matchs joués",
      value:
        statistics.tennisMatches ?? 0,
      icon: Trophy,
      accent: "green",
    },
    {
      id: "tennis-wins",
      label: "Victoires",
      value:
        statistics.tennisWins ?? 0,
      icon: Medal,
      accent: "amber",
    },
    {
      id: "tennis-win-rate",
      label: "Taux de victoire",
      value: `${
        statistics.tennisWinRate ?? 0
      } %`,
      icon: Sparkles,
      accent: "purple",
    },
    {
      id: "bike-rides",
      label: "Sorties vélo",
      value:
        statistics.bikeRideCount ?? 0,
      icon: Bike,
      accent: "blue",
    },
    {
      id: "bike-distance",
      label: "Distance vélo",
      value: `${formatDistance(
        statistics.bikeDistance,
      )} km`,
      icon: Bike,
      accent: "blue",
    },
    {
      id: "bike-elevation",
      label: "Dénivelé cumulé",
      value: `${Math.round(
        Number(
          statistics.bikeElevation ?? 0,
        ),
      ).toLocaleString("fr-FR")} m`,
      icon: Mountain,
      accent: "green",
    },
    {
      id: "photos",
      label: "Photos partagées",
      value:
        statistics.photoCount ?? 0,
      icon: Camera,
      accent: "purple",
    },
    {
      id: "likes",
      label: "Likes reçus",
      value:
        statistics.receivedLikeCount ??
        0,
      icon: Heart,
      accent: "red",
    },
  ];

  return (
    <section className="profile-statistics">
      <header className="profile-section-heading">
        <div>
          <span className="section-heading__eyebrow">
            Performances
          </span>

          <h2>Mes statistiques</h2>
        </div>

        <span className="profile-section-heading__icon">
          <Sparkles size={21} />
        </span>
      </header>

      <div className="profile-statistics__grid">
        {statisticCards.map(
          (
            {
              id,
              label,
              value,
              icon: Icon,
              accent,
            },
            index,
          ) => (
            <motion.article
              key={id}
              className={`profile-stat-card profile-stat-card--${accent} glass-panel`}
              initial={{
                opacity: 0,
                y: 14,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.04,
              }}
            >
              <span className="profile-stat-card__icon">
                <Icon size={21} />
              </span>

              <div className="profile-stat-card__content">
                <small>{label}</small>
                <strong>{value}</strong>
              </div>
            </motion.article>
          ),
        )}
      </div>

      <section className="profile-overview-grid">
        <motion.article
          className="profile-overview-card glass-panel"
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.1,
          }}
        >
          <div className="profile-overview-card__icon">
            <Trophy size={23} />
          </div>

          <div>
            <span className="section-heading__eyebrow">
              Tennis
            </span>

            <h3>
              {statistics.tennisWins ?? 0} victoire
              {(statistics.tennisWins ?? 0) >
              1
                ? "s"
                : ""}
            </h3>

            <p>
              Sur{" "}
              {statistics.tennisMatches ?? 0} match
              {(statistics.tennisMatches ??
                0) > 1
                ? "s"
                : ""}{" "}
              enregistré
              {(statistics.tennisMatches ??
                0) > 1
                ? "s"
                : ""}.
            </p>
          </div>
        </motion.article>

        <motion.article
          className="profile-overview-card glass-panel"
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.15,
          }}
        >
          <div className="profile-overview-card__icon profile-overview-card__icon--bike">
            <Bike size={23} />
          </div>

          <div>
            <span className="section-heading__eyebrow">
              Cyclisme
            </span>

            <h3>
              {formatDistance(
                statistics.bikeDistance,
              )}{" "}
              km
            </h3>

            <p>
              Parcourus sur{" "}
              {statistics.bikeRideCount ?? 0} sortie
              {(statistics.bikeRideCount ??
                0) > 1
                ? "s"
                : ""}.
            </p>
          </div>
        </motion.article>

        <motion.article
          className="profile-overview-card glass-panel"
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
          }}
        >
          <div className="profile-overview-card__icon profile-overview-card__icon--gallery">
            <Camera size={23} />
          </div>

          <div>
            <span className="section-heading__eyebrow">
              Galerie
            </span>

            <h3>
              {statistics.photoCount ?? 0} photo
              {(statistics.photoCount ?? 0) >
              1
                ? "s"
                : ""}
            </h3>

            <p>
              Avec{" "}
              {statistics.receivedLikeCount ??
                0}{" "}
              mention
              {(statistics.receivedLikeCount ??
                0) > 1
                ? "s"
                : ""}{" "}
              J’aime reçue
              {(statistics.receivedLikeCount ??
                0) > 1
                ? "s"
                : ""}.
            </p>
          </div>
        </motion.article>
      </section>
    </section>
  );
}

export default ProfileStats;