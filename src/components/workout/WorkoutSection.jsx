import {
  useMemo,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import "./workout.css";

import {
  BarChart3,
  CalendarDays,
  Clock3,
  Dumbbell,
  Flame,
  Plus,
  Target,
  Trash2,
  Trophy,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatNumber(value) {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      maximumFractionDigits: 0,
    },
  ).format(value ?? 0);
}

function formatDuration(minutes) {
  const safeMinutes =
    Number(minutes ?? 0);

  const hours = Math.floor(
    safeMinutes / 60,
  );

  const remaining =
    safeMinutes % 60;

  if (hours <= 0) {
    return `${remaining} min`;
  }

  return `${hours} h ${String(
    remaining,
  ).padStart(2, "0")}`;
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
    },
  ).format(new Date(value));
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  accent,
}) {
  return (
    <motion.article
      className={`workout-stat workout-stat--${accent}`}
      whileHover={{ y: -4 }}
    >
      <span className="workout-stat__icon">
        <Icon size={20} />
      </span>

      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
    </motion.article>
  );
}

function SessionCard({
  session,
  currentProfileId,
  isAdmin,
  onDelete,
}) {
  const canDelete =
    isAdmin ||
    String(session.profileId) ===
      String(currentProfileId);

  return (
    <motion.article
      className="workout-session-card glass-panel"
      initial={{
        opacity: 0,
        y: 14,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
    >
      <div className="workout-session-card__header">
        <span className="workout-session-card__avatar">
          {session.profile?.initials ??
            "CP"}
        </span>

        <div>
          <strong>
            {session.profile?.nickname ??
              "Membre"}
          </strong>
          <small>
            {formatDate(
              session.startedAt,
            )}
          </small>
        </div>

        {canDelete && (
          <button
            type="button"
            aria-label="Supprimer la séance"
            onClick={() =>
              onDelete(session.id)
            }
          >
            <Trash2 size={17} />
          </button>
        )}
      </div>

      <h3>{session.title}</h3>

      <div className="workout-session-card__metrics">
        <span>
          <Clock3 size={15} />
          {formatDuration(
            session.durationMinutes,
          )}
        </span>

        <span>
          <Dumbbell size={15} />
          {formatNumber(
            session.totalVolume,
          )}{" "}
          kg
        </span>

        <span>
          <Target size={15} />
          {session.completedSets} séries
        </span>
      </div>

      <div className="workout-session-card__exercises">
        {session.exercises
          .slice(0, 4)
          .map((item) => (
            <span key={item.id}>
              {item.exercise.name}
              <small>
                {item.sets.length} séries
              </small>
            </span>
          ))}
      </div>

      {session.notes && (
        <p>{session.notes}</p>
      )}
    </motion.article>
  );
}

function Leaderboard({
  sessions,
}) {
  const ranking = useMemo(() => {
    const totals = new Map();

    sessions.forEach((session) => {
      const key =
        session.profileId;

      const current =
        totals.get(key) ?? {
          id: key,
          profile:
            session.profile,
          sessions: 0,
          volume: 0,
        };

      current.sessions += 1;
      current.volume +=
        session.totalVolume ?? 0;

      totals.set(key, current);
    });

    return [...totals.values()]
      .sort(
        (first, second) =>
          second.sessions -
            first.sessions ||
          second.volume -
            first.volume,
      )
      .slice(0, 5);
  }, [sessions]);

  return (
    <section className="workout-leaderboard glass-panel">
      <div className="workout-section-heading">
        <div>
          <span className="section-heading__eyebrow">
            Classement
          </span>
          <h2>
            Les plus réguliers
          </h2>
        </div>

        <Trophy size={21} />
      </div>

      <div className="workout-leaderboard__list">
        {ranking.map(
          (item, index) => (
            <div
              key={item.id}
              className="workout-leaderboard__row"
            >
              <strong>
                {index + 1}
              </strong>

              <span>
                {item.profile
                  ?.initials ??
                  "CP"}
              </span>

              <div>
                <strong>
                  {item.profile
                    ?.nickname ??
                    "Membre"}
                </strong>
                <small>
                  {formatNumber(
                    item.volume,
                  )}{" "}
                  kg
                </small>
              </div>

              <b>
                {item.sessions}
                <small>
                  séance
                  {item.sessions > 1
                    ? "s"
                    : ""}
                </small>
              </b>
            </div>
          ),
        )}

        {ranking.length === 0 && (
          <p className="workout-empty-copy">
            Le classement apparaîtra
            après la première séance.
          </p>
        )}
      </div>
    </section>
  );
}

function WorkoutSection({
  sessions,
  statistics,
  loading,
  saving,
  error,
  currentProfileId,
  isAdmin,
  onCreate,
  onDelete,
}) {
  const [activeTab, setActiveTab] =
    useState("dashboard");

  const chartData = useMemo(() => {
    const days = Array.from(
      { length: 7 },
      (_, offset) => {
        const date = new Date();

        date.setDate(
          date.getDate() -
            (6 - offset),
        );

        return {
          key: date
            .toISOString()
            .slice(0, 10),
          label:
            new Intl.DateTimeFormat(
              "fr-FR",
              {
                weekday: "short",
              },
            ).format(date),
          volume: 0,
        };
      },
    );

    sessions.forEach((session) => {
      const key = new Date(
        session.startedAt,
      )
        .toISOString()
        .slice(0, 10);

      const day = days.find(
        (item) => item.key === key,
      );

      if (day) {
        day.volume +=
          session.totalVolume ?? 0;
      }
    });

    return days;
  }, [sessions]);

  const personalSessions =
    sessions.filter(
      (session) =>
        String(
          session.profileId,
        ) ===
        String(
          currentProfileId,
        ),
    );

  return (
    <section className="workout-module">
      <header className="workout-hero">
        <div>
          <span className="section-heading__eyebrow">
            Les Co’Pintes Training
          </span>

          <h1>
            Musculation
          </h1>

          <p>
            Enregistre les séances,
            suis la progression du groupe
            et bats tes prochains records.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={onCreate}
        >
          <Plus size={18} />
          Nouvelle séance
        </button>
      </header>

      <nav className="workout-tabs">
        {[
          ["dashboard", "Dashboard"],
          ["history", "Historique"],
          ["ranking", "Classement"],
        ].map(
          ([id, label]) => (
            <button
              key={id}
              type="button"
              className={
                activeTab === id
                  ? "workout-tabs__button workout-tabs__button--active"
                  : "workout-tabs__button"
              }
              onClick={() =>
                setActiveTab(id)
              }
            >
              {label}
            </button>
          ),
        )}
      </nav>

      {error && (
        <div className="workout-status workout-status--error">
          {error}
        </div>
      )}

      {loading && (
        <div className="workout-status">
          Chargement des séances…
        </div>
      )}

      {activeTab === "dashboard" && (
        <>
          <div className="workout-stats-grid">
            <StatCard
              icon={Flame}
              label="Séances semaine"
              value={
                statistics
                  .weeklySessions
              }
              detail="Régularité actuelle"
              accent="orange"
            />

            <StatCard
              icon={Dumbbell}
              label="Volume semaine"
              value={`${formatNumber(
                statistics.weeklyVolume,
              )} kg`}
              detail="Poids × répétitions"
              accent="green"
            />

            <StatCard
              icon={Clock3}
              label="Temps semaine"
              value={formatDuration(
                statistics.weeklyMinutes,
              )}
              detail="Durée cumulée"
              accent="blue"
            />

            <StatCard
              icon={CalendarDays}
              label="Total séances"
              value={
                statistics
                  .totalSessions
              }
              detail="Depuis le début"
              accent="purple"
            />
          </div>

          <div className="workout-dashboard-grid">
            <section className="workout-chart glass-panel">
              <div className="workout-section-heading">
                <div>
                  <span className="section-heading__eyebrow">
                    Progression
                  </span>
                  <h2>
                    Volume sur 7 jours
                  </h2>
                </div>

                <BarChart3 size={21} />
              </div>

              <div className="workout-chart__canvas">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={chartData}
                  >
                    <CartesianGrid
                      strokeDasharray="4 8"
                      vertical={false}
                      stroke="rgba(255,255,255,.07)"
                    />

                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill:
                          "rgba(236,250,241,.46)",
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill:
                          "rgba(236,250,241,.36)",
                        fontSize: 10,
                      }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="volume"
                      fill="var(--green)"
                      radius={[
                        7,
                        7,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <Leaderboard
              sessions={sessions}
            />
          </div>

          <section className="workout-latest">
            <div className="workout-section-heading">
              <div>
                <span className="section-heading__eyebrow">
                  Activité récente
                </span>
                <h2>
                  Dernières séances
                </h2>
              </div>
            </div>

            <div className="workout-session-grid">
              {sessions
                .slice(0, 6)
                .map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    currentProfileId={
                      currentProfileId
                    }
                    isAdmin={isAdmin}
                    onDelete={onDelete}
                  />
                ))}
            </div>
          </section>
        </>
      )}

      {activeTab === "history" && (
        <section className="workout-history">
          <div className="workout-section-heading">
            <div>
              <span className="section-heading__eyebrow">
                Mes entraînements
              </span>
              <h2>
                Historique personnel
              </h2>
            </div>
          </div>

          <div className="workout-session-grid">
            {personalSessions.map(
              (session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  currentProfileId={
                    currentProfileId
                  }
                  isAdmin={isAdmin}
                  onDelete={onDelete}
                />
              ),
            )}

            {personalSessions.length ===
              0 && (
              <div className="workout-empty glass-panel">
                <Dumbbell
                  size={34}
                />
                <strong>
                  Aucune séance
                </strong>
                <p>
                  Enregistre ton premier
                  entraînement pour commencer
                  ton suivi.
                </p>
                <button
                  type="button"
                  className="primary-button"
                  onClick={onCreate}
                >
                  <Plus size={17} />
                  Commencer
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === "ranking" && (
        <Leaderboard
          sessions={sessions}
        />
      )}

      {saving && (
        <div className="workout-saving">
          Enregistrement…
        </div>
      )}
    </section>
  );
}

export default WorkoutSection;
