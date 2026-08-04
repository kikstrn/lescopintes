import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
  Footprints,
  Gauge,
  Medal,
  Route,
  Save,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAuth,
} from "../../../context/AuthContext";

import useDailySteps from "../../../hooks/useDailySteps";

function formatDate(
  value,
) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      weekday:
        "short",

      day:
        "2-digit",

      month:
        "short",
    },
  ).format(
    new Date(
      `${value}T12:00:00`,
    ),
  );
}

function formatNumber(
  value,
) {
  return Number(
    value ??
    0,
  ).toLocaleString(
    "fr-FR",
  );
}


function getCalendarDays(
  source,
) {
  const byDate =
    new Map(
      source.map(
        (item) => [
          item.stepDate,
          item,
        ],
      ),
    );

  const result = [];

  for (
    let offset = 34;
    offset >= 0;
    offset -= 1
  ) {
    const date =
      new Date();

    date.setDate(
      date.getDate() -
      offset,
    );

    const key =
      new Intl.DateTimeFormat(
        "en-CA",
      ).format(date);

    result.push({
      date:
        key,

      item:
        byDate.get(
          key,
        ) ??
        null,

      day:
        new Intl.DateTimeFormat(
          "fr-FR",
          {
            weekday:
              "short",
          },
        )
          .format(date)
          .slice(
            0,
            2,
          ),

      dayNumber:
        date.getDate(),
    });
  }

  return result;
}

function getCalendarLevel(
  item,
) {
  if (!item) {
    return 0;
  }

  const progress =
    item.progress;

  if (progress >= 100) {
    return 4;
  }

  if (progress >= 75) {
    return 3;
  }

  if (progress >= 40) {
    return 2;
  }

  if (progress > 0) {
    return 1;
  }

  return 0;
}

function WalkingPage() {
  const {
    profile,
    user,
  } = useAuth();

  const profileId =
    profile?.id ??
    user?.id;

  const steps =
    useDailySteps(
      profileId,
    );

  const [
    stepCount,
    setStepCount,
  ] = useState("");

  const [
    goalSteps,
    setGoalSteps,
  ] = useState(
    "10000",
  );

  const [
    notice,
    setNotice,
  ] = useState(null);

  useEffect(() => {
    setStepCount(
      steps.today
        ? String(
            steps.today
              .stepCount,
          )
        : "",
    );

    setGoalSteps(
      String(
        steps.today
          ?.goalSteps ??
        10_000,
      ),
    );
  }, [
    steps.today,
  ]);

  const preview =
    useMemo(() => {
      const count =
        Math.max(
          0,
          Number(
            stepCount,
          ) ||
          0,
        );

      const goal =
        Math.max(
          1,
          Number(
            goalSteps,
          ) ||
          10_000,
        );

      return {
        count,
        goal,

        progress:
          Math.min(
            100,
            Math.round(
              count /
              goal *
              100,
            ),
          ),

        distanceKm:
          count *
          0.00075,

        calories:
          Math.round(
            count *
            0.04,
          ),

        remaining:
          Math.max(
            0,
            goal -
            count,
          ),
      };
    }, [
      goalSteps,
      stepCount,
    ]);

  const weeklyTotal =
    useMemo(
      () =>
        steps.history.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.stepCount,
          0,
        ),
      [
        steps.history,
      ],
    );

  const bestDay =
    useMemo(
      () =>
        steps.history.reduce(
          (
            best,
            item,
          ) =>
            item.stepCount >
            (
              best?.stepCount ??
              -1
            )
              ? item
              : best,
          null,
        ),
      [
        steps.history,
      ],
    );

  const calendarDays =
    useMemo(
      () =>
        getCalendarDays(
          steps.calendar,
        ),
      [
        steps.calendar,
      ],
    );

  const handleSubmit =
    async (event) => {
      event.preventDefault();
      setNotice(null);

      try {
        await steps.save({
          stepCount,
          goalSteps,
        });

        setNotice(
          "Tes pas du jour ont bien été enregistrés.",
        );
      } catch {
        // Le message est géré par le hook.
      }
    };

  return (
    <div className="walking-page">
      <section className="walking-hero">
        <div className="walking-hero__content">
          <span className="walking-hero__icon">
            <Footprints
              size={28}
            />
          </span>

          <div>
            <span className="section-heading__eyebrow">
              Activité quotidienne
            </span>

            <h2>
              Mes pas
            </h2>

            <p>
              Enregistre manuellement tes pas pour participer même sans faire de cyclisme.
            </p>
          </div>
        </div>

        <span className="walking-hero__source">
          Saisie manuelle
        </span>
      </section>

      {steps.loading ? (
        <section className="walking-state">
          Chargement de ton activité…
        </section>
      ) : (
        <>
          <section className="walking-today">
            <header className="walking-today__header">
              <div>
                <span className="section-heading__eyebrow">
                  Aujourd’hui
                </span>

                <h2>
                  {formatNumber(
                    preview.count,
                  )}{" "}
                  pas
                </h2>
              </div>

              <strong>
                {
                  preview.progress
                } %
              </strong>
            </header>

            <div
              className="walking-progress"
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={
                preview.progress
              }
            >
              <span
                style={{
                  width:
                    `${preview.progress}%`,
                }}
              />
            </div>

            <div className="walking-today__goal">
              <span>
                Objectif :{" "}
                <strong>
                  {formatNumber(
                    preview.goal,
                  )}{" "}
                  pas
                </strong>
              </span>

              <span>
                {preview.remaining >
                0
                  ? `${formatNumber(
                      preview.remaining,
                    )} pas restants`
                  : "Objectif atteint 🎉"}
              </span>
            </div>

            <div className="walking-metrics">
              <article>
                <Route size={20} />
                <small>
                  Distance estimée
                </small>
                <strong>
                  {preview.distanceKm.toLocaleString(
                    "fr-FR",
                    {
                      maximumFractionDigits:
                        2,
                    },
                  )}{" "}
                  km
                </strong>
              </article>

              <article>
                <Flame size={20} />
                <small>
                  Calories estimées
                </small>
                <strong>
                  {formatNumber(
                    preview.calories,
                  )}{" "}
                  kcal
                </strong>
              </article>

              <article>
                <Target size={20} />
                <small>
                  Objectif quotidien
                </small>
                <strong>
                  {formatNumber(
                    preview.goal,
                  )}
                </strong>
              </article>

              <article>
                <Gauge size={20} />
                <small>
                  Progression
                </small>
                <strong>
                  {
                    preview.progress
                  } %
                </strong>
              </article>
            </div>
          </section>

          <section className="walking-entry">
            <header>
              <div>
                <span className="section-heading__eyebrow">
                  Mise à jour
                </span>

                <h2>
                  Renseigner mes pas
                </h2>
              </div>

              <Activity
                size={22}
              />
            </header>

            <form
              onSubmit={
                handleSubmit
              }
            >
              <label>
                <span>
                  Nombre de pas aujourd’hui
                </span>

                <div className="walking-entry__control">
                  <Footprints
                    size={20}
                  />

                  <input
                    type="number"
                    min="0"
                    max="100000"
                    step="1"
                    inputMode="numeric"
                    value={
                      stepCount
                    }
                    placeholder="8 742"
                    disabled={
                      steps.saving
                    }
                    onChange={(
                      event,
                    ) =>
                      setStepCount(
                        event.target
                          .value,
                      )
                    }
                  />
                </div>
              </label>

              <label>
                <span>
                  Mon objectif quotidien
                </span>

                <div className="walking-entry__control">
                  <Target
                    size={20}
                  />

                  <input
                    type="number"
                    min="1000"
                    max="50000"
                    step="500"
                    inputMode="numeric"
                    value={
                      goalSteps
                    }
                    disabled={
                      steps.saving
                    }
                    onChange={(
                      event,
                    ) =>
                      setGoalSteps(
                        event.target
                          .value,
                      )
                    }
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={
                  steps.saving ||
                  stepCount ===
                    ""
                }
              >
                <Save size={18} />

                {steps.saving
                  ? "Enregistrement…"
                  : steps.today
                    ? "Modifier mes pas"
                    : "Enregistrer mes pas"}
              </button>
            </form>

            {notice && (
              <p className="walking-message walking-message--success">
                <CheckCircle2
                  size={16}
                />
                {notice}
              </p>
            )}

            {steps.error && (
              <p className="walking-message walking-message--error">
                {steps.error}
              </p>
            )}
          </section>

          <section className="walking-rewards walking-rewards--xp-only">
            <header className="walking-week__header">
              <div>
                <span className="section-heading__eyebrow">
                  Récompenses
                </span>

                <h2>
                  XP de marche
                </h2>
              </div>

              <Sparkles size={22} />
            </header>

            <div className="walking-rewards__summary walking-rewards__summary--xp-only">
              <article>
                <Star size={21} />

                <small>
                  XP aujourd’hui
                </small>

                <strong>
                  +{formatNumber(
                    steps.rewards
                      ?.todayXp,
                  )} XP
                </strong>
              </article>

              <article>
                <Sparkles size={21} />

                <small>
                  XP marche total
                </small>

                <strong>
                  {formatNumber(
                    steps.rewards
                      ?.totalXp,
                  )} XP
                </strong>
              </article>
            </div>

            {steps.rewards
              ?.nextMilestone && (
              <div className="walking-rewards__next">
                <Target size={18} />

                <div>
                  <strong>
                    Prochain palier
                  </strong>

                  <span>
                    {
                      steps.rewards
                        .nextMilestone
                        .label
                    }
                  </span>
                </div>

                <b>
                  {
                    steps.rewards
                      .nextMilestone
                      .remaining
                  }{" "}
                  pas
                </b>
              </div>
            )}

            <p className="walking-rewards__profile-hint">
              Les badges Marche sont regroupés avec tous tes autres succès dans la page Profil.
            </p>
          </section>

          <section className="walking-insights">
            <header className="walking-week__header">
              <div>
                <span className="section-heading__eyebrow">
                  Progression
                </span>

                <h2>
                  Mes performances
                </h2>
              </div>

              <Sparkles size={22} />
            </header>

            <div className="walking-insights__grid">
              <article>
                <Flame size={20} />

                <small>
                  Série actuelle
                </small>

                <strong>
                  {formatNumber(
                    steps.personalStats
                      ?.currentStreak,
                  )}{" "}
                  jour(s)
                </strong>
              </article>

              <article>
                <Trophy size={20} />

                <small>
                  Plus longue série
                </small>

                <strong>
                  {formatNumber(
                    steps.personalStats
                      ?.longestStreak,
                  )}{" "}
                  jour(s)
                </strong>
              </article>

              <article>
                <Footprints size={20} />

                <small>
                  Cette semaine
                </small>

                <strong>
                  {formatNumber(
                    steps.personalStats
                      ?.currentWeekSteps,
                  )}{" "}
                  pas
                </strong>
              </article>

              <article>
                {(steps.personalStats
                  ?.differenceSteps ??
                  0) >= 0 ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}

                <small>
                  Vs semaine passée
                </small>

                <strong>
                  {(steps.personalStats
                    ?.differenceSteps ??
                    0) >= 0
                    ? "+"
                    : ""}
                  {formatNumber(
                    steps.personalStats
                      ?.differenceSteps,
                  )}{" "}
                  pas
                </strong>
              </article>

              <article>
                <Medal size={20} />

                <small>
                  Meilleure journée
                </small>

                <strong>
                  {formatNumber(
                    steps.personalStats
                      ?.bestDaySteps,
                  )}{" "}
                  pas
                </strong>
              </article>

              <article>
                <CalendarDays size={20} />

                <small>
                  Jours enregistrés
                </small>

                <strong>
                  {formatNumber(
                    steps.personalStats
                      ?.totalRecordedDays,
                  )}
                </strong>
              </article>
            </div>
          </section>

          <section className="walking-calendar">
            <header className="walking-week__header">
              <div>
                <span className="section-heading__eyebrow">
                  Calendrier
                </span>

                <h2>
                  Mes 5 dernières semaines
                </h2>
              </div>

              <CalendarDays size={22} />
            </header>

            <div className="walking-calendar__weekdays">
              {[
                "L",
                "M",
                "M",
                "J",
                "V",
                "S",
                "D",
              ].map(
                (
                  label,
                  index,
                ) => (
                  <span
                    key={`${label}-${index}`}
                  >
                    {label}
                  </span>
                ),
              )}
            </div>

            <div className="walking-calendar__grid">
              {calendarDays.map(
                (day) => (
                  <article
                    key={
                      day.date
                    }
                    className={`walking-calendar__day level-${getCalendarLevel(
                      day.item,
                    )}`}
                    title={
                      day.item
                        ? `${formatNumber(
                            day.item.stepCount,
                          )} pas`
                        : "Aucune saisie"
                    }
                  >
                    <small>
                      {day.dayNumber}
                    </small>

                    <strong>
                      {day.item
                        ? Math.round(
                            day.item.stepCount /
                            1000,
                          )
                        : "—"}
                    </strong>
                  </article>
                ),
              )}
            </div>

            <div className="walking-calendar__legend">
              <span>
                Moins
              </span>

              {[0, 1, 2, 3, 4].map(
                (level) => (
                  <i
                    key={
                      level
                    }
                    className={`level-${level}`}
                  />
                ),
              )}

              <span>
                Objectif atteint
              </span>
            </div>
          </section>

          <section className="walking-ranking">
            <header className="walking-week__header">
              <div>
                <span className="section-heading__eyebrow">
                  Communauté
                </span>

                <h2>
                  Classement de la semaine
                </h2>
              </div>

              <Trophy size={22} />
            </header>

            {steps.leaderboard.length ===
            0 ? (
              <div className="walking-week__empty">
                Le classement apparaîtra dès que des membres auront enregistré leurs pas.
              </div>
            ) : (
              <div className="walking-ranking__list">
                {steps.leaderboard.map(
                  (member) => (
                    <article
                      key={
                        member.profileId
                      }
                      className={[
                        "walking-ranking__item",
                        member.profileId ===
                        profileId
                          ? "is-current"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span className="walking-ranking__rank">
                        {member.rank <= 3
                          ? ["🥇", "🥈", "🥉"][
                              member.rank - 1
                            ]
                          : member.rank}
                      </span>

                      {member.avatarUrl ? (
                        <img
                          src={
                            member.avatarUrl
                          }
                          alt=""
                        />
                      ) : (
                        <span className="walking-ranking__avatar">
                          <Footprints size={18} />
                        </span>
                      )}

                      <div>
                        <strong>
                          {member.nickname}
                        </strong>

                        <small>
                          {member.activeDays} jour(s) actif(s)
                        </small>
                      </div>

                      <div className="walking-ranking__score">
                        <strong>
                          {formatNumber(
                            member.totalSteps,
                          )}
                        </strong>

                        <small>
                          pas
                        </small>
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
          </section>

          <section className="walking-week">
            <header className="walking-week__header">
              <div>
                <span className="section-heading__eyebrow">
                  Historique
                </span>

                <h2>
                  Mes 7 derniers jours
                </h2>
              </div>

              <CalendarDays
                size={22}
              />
            </header>

            <div className="walking-week__summary">
              <article>
                <small>
                  Total enregistré
                </small>

                <strong>
                  {formatNumber(
                    weeklyTotal,
                  )}{" "}
                  pas
                </strong>
              </article>

              <article>
                <small>
                  Meilleure journée
                </small>

                <strong>
                  {bestDay
                    ? `${formatNumber(
                        bestDay.stepCount,
                      )} pas`
                    : "—"}
                </strong>
              </article>
            </div>

            {steps.history.length ===
            0 ? (
              <div className="walking-week__empty">
                Ta première journée enregistrée apparaîtra ici.
              </div>
            ) : (
              <div className="walking-week__list">
                {steps.history.map(
                  (day) => (
                    <article
                      key={
                        day.id
                      }
                      className="walking-day"
                    >
                      <div>
                        <strong>
                          {formatDate(
                            day.stepDate,
                          )}
                        </strong>

                        <span>
                          {day.progress >=
                          100
                            ? "Objectif atteint"
                            : `${day.progress} % de l’objectif`}
                        </span>
                      </div>

                      <div className="walking-day__bar">
                        <span
                          style={{
                            width:
                              `${day.progress}%`,
                          }}
                        />
                      </div>

                      <strong className="walking-day__steps">
                        {formatNumber(
                          day.stepCount,
                        )}
                      </strong>
                    </article>
                  ),
                )}
              </div>
            )}

            <p className="walking-week__disclaimer">
              La distance et les calories sont des estimations indicatives calculées à partir du nombre de pas.
            </p>
          </section>
        </>
      )}
    </div>
  );
}

export default WalkingPage;
