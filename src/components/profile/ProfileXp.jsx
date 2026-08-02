import {
  Award,
  Bike,
  CalendarCheck,
  Dices,
  Flame,
  Medal,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react";

const sourceIcons = {
  tennis: Trophy,
  bike: Bike,

  event_created:
    CalendarCheck,

  event_participation:
    CalendarCheck,

  gage: Dices,

  weekly_challenge:
    Target,

  badge: Award,
};

function formatXpDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(
    new Date(value),
  );
}

function ProfileXp({
  level = 1,
  totalXp = 0,

  xpInLevel = 0,
  xpRequired = 100,
  remainingXp = 100,
  progressPercent = 0,

  transactions = [],

  loading = false,
  error = null,
}) {
  if (loading) {
    return (
      <section className="profile-xp glass-panel">
        <div className="profile-xp__state">
          Chargement de l’expérience…
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="profile-xp glass-panel">
        <div className="profile-xp__state profile-xp__state--error">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="profile-xp glass-panel">
      <header className="profile-xp__header">
        <div>
          <span className="section-heading__eyebrow">
            Progression
          </span>

          <h2>
            Niveau et expérience
          </h2>

          <p>
            Continue à participer aux
            activités pour progresser.
          </p>
        </div>

        <div className="profile-xp__level">
          <Sparkles size={20} />

          <span>
            Niveau
          </span>

          <strong>
            {level}
          </strong>
        </div>
      </header>

      <div className="profile-xp__progress">
        <div className="profile-xp__progress-top">
          <div>
            <strong>
              {xpInLevel.toLocaleString(
                "fr-FR",
              )}
            </strong>

            <span>
              {" / "}
              {xpRequired.toLocaleString(
                "fr-FR",
              )} XP
            </span>
          </div>

          <strong>
            {progressPercent} %
          </strong>
        </div>

        <div className="profile-xp__progress-bar">
          <span
            style={{
              width:
                `${progressPercent}%`,
            }}
          />
        </div>

        <div className="profile-xp__progress-bottom">
          <span>
            {totalXp.toLocaleString(
              "fr-FR",
            )} XP au total
          </span>

          <span>
            Encore{" "}
            {remainingXp.toLocaleString(
              "fr-FR",
            )} XP avant le niveau{" "}
            {level + 1}
          </span>
        </div>
      </div>

      <div className="profile-xp__history">
        <header>
          <div>
            <Medal size={18} />

            <strong>
              Derniers gains d’XP
            </strong>
          </div>

          <span>
            {transactions.length}
          </span>
        </header>

        {transactions.length === 0 ? (
          <div className="profile-xp__empty">
            <Star size={24} />

            <p>
              Aucun gain d’XP pour
              le moment.
            </p>
          </div>
        ) : (
          <div className="profile-xp__list">
            {transactions.map(
              (transaction) => {
                const Icon =
                  sourceIcons[
                    transaction
                      .sourceType
                  ] ?? Flame;

                return (
                  <article
                    key={
                      transaction.id
                    }
                    className="profile-xp__transaction"
                  >
                    <span className="profile-xp__transaction-icon">
                      <Icon
                        size={18}
                      />
                    </span>

                    <div>
                      <strong>
                        {
                          transaction.title
                        }
                      </strong>

                      <small>
                        {formatXpDate(
                          transaction
                            .createdAt,
                        )}
                      </small>
                    </div>

                    <strong className="profile-xp__amount">
                      +
                      {transaction.amount.toLocaleString(
                        "fr-FR",
                      )}{" "}
                      XP
                    </strong>
                  </article>
                );
              },
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default ProfileXp;