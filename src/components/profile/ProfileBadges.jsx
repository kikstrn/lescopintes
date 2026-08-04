import {
  Award,
  Bike,
  CalendarCheck,
  Crown,
  Dices,
  Flame,
  Footprints,
  Image,
  Medal,
  ShieldCheck,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

const iconMap = {
  award: Award,
  bike: Bike,
  "calendar-check": CalendarCheck,
  crown: Crown,
  dices: Dices,
  flame: Flame,
  footprints: Footprints,
  image: Image,
  medal: Medal,
  "shield-check": ShieldCheck,
  star: Star,
  target: Target,
  trophy: Trophy,
  zap: Zap,
};

function formatAwardDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(new Date(value));
}

function ProfileBadges({
  badges = [],
  loading = false,
  error = null,
}) {
  const unlockedCount =
    badges.filter(
      (badge) =>
        badge.unlocked,
    ).length;

  if (loading) {
    return (
      <section className="profile-badges glass-panel">
        <p className="profile-badges__state">
          Chargement des badges…
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="profile-badges glass-panel">
        <p className="profile-badges__state profile-badges__state--error">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className="profile-badges glass-panel">
      <header className="profile-badges__header">
        <div>
          <span className="section-heading__eyebrow">
            Récompenses
          </span>

          <h2>
            Badges et succès
          </h2>

          <p>
            {unlockedCount} badge
            {unlockedCount > 1
              ? "s"
              : ""}{" "}
            débloqué
            {unlockedCount > 1
              ? "s"
              : ""}{" "}
            sur {badges.length}
          </p>
        </div>

        <div className="profile-badges__summary">
          <Trophy size={22} />

          <strong>
            {unlockedCount}/
            {badges.length}
          </strong>
        </div>
      </header>

      {badges.length === 0 ? (
        <div className="profile-badges__empty">
          Aucun badge disponible.
        </div>
      ) : (
        <div className="profile-badges__grid">
          {badges.map(
            (badge) => {
              const Icon =
                iconMap[
                badge.icon
                ] ?? Award;

              const awardedBadge =
                badge.awardedBadge;

              return (
                <article
                  key={badge.id}
                  className={[
                    "profile-badge",
                    badge.unlocked
                      ? "profile-badge--unlocked"
                      : "profile-badge--locked",
                  ].join(" ")}
                >
                  <div className="profile-badge__icon">
                    <Icon size={23} />
                  </div>

                  <div className="profile-badge__content">
                    <strong>
                      {badge.name}
                    </strong>

                    <p>
                      {
                        badge.description
                      }
                    </p>

                    {badge.unlocked ? (
                      <small>
                        Débloqué le{" "}
                        {formatAwardDate(
                          awardedBadge
                            ?.awardedAt,
                        )}
                      </small>
                    ) : (
                      <>
                        <div className="profile-badge__progress">
                          <div className="profile-badge__progress-label">
                            <span>
                              {Number(
                                badge.currentValue ?? 0,
                              ).toLocaleString(
                                "fr-FR",
                                {
                                  maximumFractionDigits: 1,
                                },
                              )}
                            </span>

                            <span>
                              /{" "}
                              {Number(
                                badge.targetValue ??
                                badge.threshold ??
                                0,
                              ).toLocaleString(
                                "fr-FR",
                              )}
                            </span>
                          </div>

                          <div className="profile-badge__progress-bar">
                            <span
                              style={{
                                width: `${badge.progressPercent ??
                                  0
                                  }%`,
                              }}
                            />
                          </div>

                          <small>
                            {badge.progressPercent ?? 0} %
                          </small>
                        </div>
                      </>
                    )}
                  </div>

                  <span className="profile-badge__status">
                    {badge.unlocked
                      ? "Débloqué"
                      : "Verrouillé"}
                  </span>
                </article>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}

export default ProfileBadges;