import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Bike,
  CalendarCheck,
  ChartNoAxesCombined,
  ChevronDown,
  Gauge,
  Medal,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const periodOptions = [
  {
    id: "season",
    label: "Saison 2026",
  },
  {
    id: "six-months",
    label: "6 derniers mois",
  },
  {
    id: "three-months",
    label: "3 derniers mois",
  },
];

const MONTH_NAMES = [
  "Jan",
  "Fév",
  "Mars",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sept",
  "Oct",
  "Nov",
  "Déc",
];

function getDateValue(item) {
  return (
    item?.date ??
    item?.playedAt ??
    item?.played_at ??
    item?.rideDate ??
    item?.ride_date ??
    item?.eventDate ??
    item?.event_date ??
    item?.startDate ??
    item?.start_date ??
    item?.createdAt ??
    item?.created_at ??
    null
  );
}

function getTimestamp(item) {
  const value = getDateValue(item);

  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
}

function getProfileId(value) {
  return String(
    value?.profileId ??
    value?.profile_id ??
    value?.userId ??
    value?.user_id ??
    value?.memberId ??
    value?.member_id ??
    value?.id ??
    "",
  );
}

function getBikeDistance(ride) {
  return Number(
    ride?.distanceKm ??
    ride?.distance_km ??
    ride?.distance ??
    ride?.kilometers ??
    ride?.km ??
    0,
  );
}

function getEventParticipants(event) {
  const participants =
    event?.participants ??
    event?.eventParticipants ??
    event?.event_participants ??
    event?.members ??
    [];

  return Array.isArray(participants)
    ? participants
    : [];
}

function getMatchPlayers(match) {
  const players =
    match?.players ??
    match?.matchPlayers ??
    match?.tennisMatchPlayers ??
    match?.tennis_match_players ??
    [];

  return Array.isArray(players)
    ? players
    : [];
}

function isMatchCompleted(match) {
  return (
    match?.status === "completed" ||
    match?.status === "finished" ||
    match?.winnerTeam != null ||
    match?.winner_team != null
  );
}

function getPeriodStart(period) {
  const now = new Date();

  if (period === "three-months") {
    return new Date(
      now.getFullYear(),
      now.getMonth() - 2,
      1,
    ).getTime();
  }

  if (period === "six-months") {
    return new Date(
      now.getFullYear(),
      now.getMonth() - 5,
      1,
    ).getTime();
  }

  return new Date(
    now.getFullYear(),
    0,
    1,
  ).getTime();
}

function isInsidePeriod(item, period) {
  const timestamp = getTimestamp(item);

  if (!timestamp) {
    return true;
  }

  return timestamp >= getPeriodStart(period);
}

function normalizeMemberName(member) {
  return (
    member?.nickname ??
    member?.firstName ??
    member?.first_name ??
    "Membre"
  );
}

function StatisticsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="statistics-tooltip">
      <strong>{label}</strong>

      {payload.map((item) => (
        <div
          key={item.dataKey}
          className="statistics-tooltip__row"
        >
          <span
            className={`statistics-tooltip__dot statistics-tooltip__dot--${item.dataKey}`}
          />

          <span>
            {item.dataKey === "tennis" && "Matchs de tennis"}
            {item.dataKey === "bike" && "Kilomètres vélo"}
            {item.dataKey === "events" && "Événements"}
            {item.dataKey === "wins" && "Victoires"}
            {item.dataKey === "losses" && "Défaites"}
          </span>

          <strong>
            {item.value}
            {item.dataKey === "bike" ? " km" : ""}
          </strong>
        </div>
      ))}
    </div>
  );
}

function StatisticCard({
  icon: Icon,
  label,
  value,
  detail,
  accent = "green",
  delay = 0,
}) {
  return (
    <motion.article
      className={`statistics-summary-card statistics-summary-card--${accent}`}
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -5,
      }}
      transition={{
        delay,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="statistics-summary-card__top">
        <span className="statistics-summary-card__icon">
          <Icon size={21} />
        </span>

        <span className="statistics-summary-card__trend">
          <TrendingUp size={14} />
          {detail}
        </span>
      </div>

      <div className="statistics-summary-card__content">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <div className="statistics-summary-card__line">
        <span />
      </div>
    </motion.article>
  );
}

function StatisticsSection({
  members = [],
  tennisMatches = [],
  bikeRides = [],
  events = [],
  galleryPhotos = [],
  gages = [],
  tribunalCases = [],
}) {
  const [selectedMemberId, setSelectedMemberId] = useState(
    members[0]?.id ?? "",
  );

  const [selectedPeriod, setSelectedPeriod] = useState("season");

  useEffect(() => {
    if (
      members.length > 0 &&
      !members.some(
        (member) =>
          String(member.id) ===
          String(selectedMemberId),
      )
    ) {
      setSelectedMemberId(
        String(members[0].id),
      );
    }
  }, [
    members,
    selectedMemberId,
  ]);

  const selectedMember = useMemo(() => {
    return members.find(
      (member) =>
        String(member.id) ===
        String(selectedMemberId),
    );
  }, [members, selectedMemberId]);

  const filteredTennisMatches = useMemo(() => {
    return tennisMatches.filter(
      (match) =>
        isInsidePeriod(
          match,
          selectedPeriod,
        ) &&
        isMatchCompleted(match),
    );
  }, [
    tennisMatches,
    selectedPeriod,
  ]);

  const filteredBikeRides = useMemo(() => {
    return bikeRides.filter((ride) =>
      isInsidePeriod(
        ride,
        selectedPeriod,
      ),
    );
  }, [
    bikeRides,
    selectedPeriod,
  ]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) =>
      isInsidePeriod(
        event,
        selectedPeriod,
      ),
    );
  }, [
    events,
    selectedPeriod,
  ]);

  const filteredPhotos = useMemo(() => {
    return galleryPhotos.filter((photo) =>
      isInsidePeriod(
        photo,
        selectedPeriod,
      ),
    );
  }, [
    galleryPhotos,
    selectedPeriod,
  ]);

  const filteredGages = useMemo(() => {
    return gages.filter((gage) =>
      isInsidePeriod(
        gage,
        selectedPeriod,
      ),
    );
  }, [
    gages,
    selectedPeriod,
  ]);

  const filteredTribunalCases = useMemo(() => {
    return tribunalCases.filter(
      (tribunalCase) =>
        isInsidePeriod(
          tribunalCase,
          selectedPeriod,
        ),
    );
  }, [
    tribunalCases,
    selectedPeriod,
  ]);

  const memberChartData = useMemo(() => {
    return members.map((member) => {
      const profileId =
        String(member.id);

      return {
        id: member.id,
        name: normalizeMemberName(member),

        wins: Number(
          member.tennisWins ??
          member.wins ??
          0,
        ),

        losses: Number(
          member.tennisLosses ??
          member.losses ??
          0,
        ),

        bikeKm: Number(
          member.bikeDistance ??
          member.bikeKm ??
          0,
        ),

        events: filteredEvents.filter(
          (event) =>
            getEventParticipants(
              event,
            ).some(
              (participant) =>
                getProfileId(participant) ===
                profileId,
            ),
        ).length,
      };
    });
  }, [
    members,
    filteredEvents,
  ]);

  const totalMatches =
    filteredTennisMatches.length;

  const totalBikeKm = useMemo(() => {
    return filteredBikeRides.reduce(
      (total, ride) =>
        total + getBikeDistance(ride),
      0,
    );
  }, [filteredBikeRides]);

  const totalEvents =
    filteredEvents.length;

  const totalWins = useMemo(() => {
    return members.reduce(
      (total, member) =>
        total +
        Number(
          member.tennisWins ??
          member.wins ??
          0,
        ),
      0,
    );
  }, [members]);

  const totalLosses = useMemo(() => {
    return members.reduce(
      (total, member) =>
        total +
        Number(
          member.tennisLosses ??
          member.losses ??
          0,
        ),
      0,
    );
  }, [members]);

  const monthlyActivity = useMemo(() => {
    const monthCount =
      selectedPeriod === "three-months"
        ? 3
        : selectedPeriod ===
          "six-months"
          ? 6
          : 12;

    const now = new Date();

    const months = Array.from(
      {
        length: monthCount,
      },
      (_, index) => {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() -
          (monthCount - 1 - index),
          1,
        );

        return {
          year: date.getFullYear(),
          monthIndex: date.getMonth(),
          month:
            MONTH_NAMES[
            date.getMonth()
            ],
          tennis: 0,
          bike: 0,
          events: 0,
        };
      },
    );

    filteredTennisMatches.forEach(
      (match) => {
        const date = new Date(
          getDateValue(match),
        );

        const target = months.find(
          (month) =>
            month.year ===
            date.getFullYear() &&
            month.monthIndex ===
            date.getMonth(),
        );

        if (target) {
          target.tennis += 1;
        }
      },
    );

    filteredBikeRides.forEach((ride) => {
      const date = new Date(
        getDateValue(ride),
      );

      const target = months.find(
        (month) =>
          month.year ===
          date.getFullYear() &&
          month.monthIndex ===
          date.getMonth(),
      );

      if (target) {
        target.bike +=
          getBikeDistance(ride);
      }
    });

    filteredEvents.forEach((event) => {
      const date = new Date(
        getDateValue(event),
      );

      const target = months.find(
        (month) =>
          month.year ===
          date.getFullYear() &&
          month.monthIndex ===
          date.getMonth(),
      );

      if (target) {
        target.events += 1;
      }
    });

    return months.map((month) => ({
      month: month.month,
      tennis: month.tennis,
      bike: Math.round(
        month.bike * 10,
      ) / 10,
      events: month.events,
    }));
  }, [
    filteredTennisMatches,
    filteredBikeRides,
    filteredEvents,
    selectedPeriod,
  ]);

  const activityDistribution = useMemo(() => {
    const activities = [
      {
        name: "Tennis",
        count:
          filteredTennisMatches.length,
        color: "#5ee49b",
      },
      {
        name: "Cyclisme",
        count:
          filteredBikeRides.length,
        color: "#63b8ff",
      },
      {
        name: "Événements",
        count: filteredEvents.length,
        color: "#ffbb58",
      },
      {
        name: "Galerie",
        count: filteredPhotos.length,
        color: "#b38cff",
      },
      {
        name: "Gages",
        count: filteredGages.length,
        color: "#ff7f94",
      },
      {
        name: "Tribunal",
        count:
          filteredTribunalCases.length,
        color: "#e3b765",
      },
    ];

    const total = activities.reduce(
      (sum, activity) =>
        sum + activity.count,
      0,
    );

    return activities.map(
      (activity) => ({
        name: activity.name,
        color: activity.color,
        count: activity.count,

        value:
          total > 0
            ? Math.round(
              (activity.count /
                total) *
              100,
            )
            : 0,
      }),
    );
  }, [
    filteredTennisMatches,
    filteredBikeRides,
    filteredEvents,
    filteredPhotos,
    filteredGages,
    filteredTribunalCases,
  ]);

  const averageWinRate =
    totalWins + totalLosses > 0
      ? Math.round(
        (totalWins /
          (totalWins +
            totalLosses)) *
        100,
      )
      : 0;

  const selectedMemberWins =
    Number(
      selectedMember?.tennisWins ??
      selectedMember?.wins ??
      0,
    );

  const selectedMemberLosses =
    Number(
      selectedMember?.tennisLosses ??
      selectedMember?.losses ??
      0,
    );

  const selectedMemberMatches =
    selectedMemberWins +
    selectedMemberLosses;

  const selectedMemberWinRate =
    selectedMemberMatches > 0
      ? Math.round(
        (selectedMemberWins /
          selectedMemberMatches) *
        100,
      )
      : 0;

  const records = useMemo(() => {
    if (members.length === 0) {
      return [];
    }

    const byWins = [...members].sort(
      (memberA, memberB) =>
        Number(
          memberB.tennisWins ??
          memberB.wins ??
          0,
        ) -
        Number(
          memberA.tennisWins ??
          memberA.wins ??
          0,
        ),
    );

    const byBike = [...members].sort(
      (memberA, memberB) =>
        Number(
          memberB.bikeDistance ??
          memberB.bikeKm ??
          0,
        ) -
        Number(
          memberA.bikeDistance ??
          memberA.bikeKm ??
          0,
        ),
    );

    const byEvents = [
      ...memberChartData,
    ].sort(
      (memberA, memberB) =>
        memberB.events -
        memberA.events,
    );

    const byRate = [...members]
      .map((member) => {
        const wins = Number(
          member.tennisWins ??
          member.wins ??
          0,
        );

        const losses = Number(
          member.tennisLosses ??
          member.losses ??
          0,
        );

        const matches =
          wins + losses;

        return {
          ...member,
          calculatedRate:
            matches > 0
              ? Math.round(
                (wins / matches) *
                100,
              )
              : 0,
          calculatedMatches:
            matches,
        };
      })
      .filter(
        (member) =>
          member.calculatedMatches > 0,
      )
      .sort(
        (memberA, memberB) =>
          memberB.calculatedRate -
          memberA.calculatedRate,
      );

    const topWins = byWins[0];
    const topBike = byBike[0];
    const topEvents = byEvents[0];
    const topRate = byRate[0];

    return [
      {
        id: "wins",
        icon: Trophy,
        label: "Plus de victoires",
        member:
          normalizeMemberName(topWins),
        value: `${Number(
          topWins?.tennisWins ??
          topWins?.wins ??
          0,
        )} victoires`,
        accent: "green",
      },
      {
        id: "bike",
        icon: Bike,
        label: "Plus de kilomètres",
        member:
          normalizeMemberName(topBike),
        value: `${Number(
          topBike?.bikeDistance ??
          topBike?.bikeKm ??
          0,
        ).toLocaleString(
          "fr-FR",
        )} km`,
        accent: "blue",
      },
      {
        id: "events",
        icon: CalendarCheck,
        label: "Plus présent",
        member:
          topEvents?.name ??
          "—",
        value: `${topEvents?.events ?? 0} participations`,
        accent: "amber",
      },
      {
        id: "rate",
        icon: Target,
        label: "Meilleur taux",
        member:
          normalizeMemberName(topRate),
        value: `${topRate?.calculatedRate ?? 0} % de victoires`,
        accent: "purple",
      },
    ];
  }, [
    members,
    memberChartData,
  ]);

  return (
    <section className="statistics-section">
      <motion.header
        className="statistics-section__hero glass-panel"
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="statistics-section__hero-content">
          <span className="section-heading__eyebrow">
            Performances
          </span>

          <h2>Statistiques des Co’Pintes</h2>

          <p>
            Retrouve l’évolution du groupe, les performances
            individuelles et les records de la saison.
          </p>
        </div>

        <div className="statistics-section__period">
          <label htmlFor="statistics-period">
            Période affichée
          </label>

          <div className="statistics-section__select">
            <ChartNoAxesCombined size={17} />

            <select
              id="statistics-period"
              value={selectedPeriod}
              onChange={(event) => {
                setSelectedPeriod(event.target.value);
              }}
            >
              {periodOptions.map((period) => (
                <option
                  key={period.id}
                  value={period.id}
                >
                  {period.label}
                </option>
              ))}
            </select>

            <ChevronDown size={17} />
          </div>
        </div>
      </motion.header>

      <section className="statistics-summary-grid">
        <StatisticCard
          icon={Trophy}
          label="Matchs disputés"
          value={totalMatches}
          detail={`${totalWins} victoires`}
          accent="green"
          delay={0}
        />

        <StatisticCard
          icon={Bike}
          label="Kilomètres vélo"
          value={Math.round(
            totalBikeKm,
          ).toLocaleString("fr-FR")}
          detail={`${filteredBikeRides.length} sorties`}
          accent="blue"
          delay={0.05}
        />

        <StatisticCard
          icon={CalendarCheck}
          label="Événements"
          value={totalEvents}
          detail={`${members.length} membres`}
          accent="amber"
          delay={0.1}
        />

        <StatisticCard
          icon={Target}
          label="Taux de victoire global"
          value={`${averageWinRate} %`}
          detail={`${totalWins + totalLosses} résultats`}
          accent="purple"
          delay={0.15}
        />
      </section>

      <section className="statistics-main-grid">
        <motion.article
          className="statistics-chart-card statistics-chart-card--wide glass-panel"
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.1,
            duration: 0.42,
          }}
        >
          <div className="statistics-card-heading">
            <div>
              <span className="section-heading__eyebrow">
                Évolution
              </span>

              <h3>Activité sur la saison</h3>
            </div>

            <div className="statistics-chart-legend">
              <span>
                <i className="statistics-chart-legend__dot statistics-chart-legend__dot--green" />
                Tennis
              </span>

              <span>
                <i className="statistics-chart-legend__dot statistics-chart-legend__dot--blue" />
                Vélo
              </span>
            </div>
          </div>

          <div className="statistics-area-chart">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={monthlyActivity}
                margin={{
                  top: 15,
                  right: 10,
                  left: -22,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="statisticsTennisGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#5ee49b"
                      stopOpacity={0.38}
                    />

                    <stop
                      offset="100%"
                      stopColor="#5ee49b"
                      stopOpacity={0}
                    />
                  </linearGradient>

                  <linearGradient
                    id="statisticsBikeGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#63b8ff"
                      stopOpacity={0.3}
                    />

                    <stop
                      offset="100%"
                      stopColor="#63b8ff"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  vertical={false}
                  strokeDasharray="4 8"
                  stroke="rgba(255,255,255,0.07)"
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "rgba(255,255,255,0.48)",
                    fontSize: 12,
                  }}
                  dy={10}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "rgba(255,255,255,0.38)",
                    fontSize: 11,
                  }}
                />

                <Tooltip
                  content={<StatisticsTooltip />}
                  cursor={{
                    stroke: "rgba(255,255,255,0.14)",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="bike"
                  stroke="#63b8ff"
                  strokeWidth={2.5}
                  fill="url(#statisticsBikeGradient)"
                  animationDuration={1100}
                />

                <Area
                  type="monotone"
                  dataKey="tennis"
                  stroke="#5ee49b"
                  strokeWidth={2.5}
                  fill="url(#statisticsTennisGradient)"
                  animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.article>

        <motion.article
          className="statistics-chart-card statistics-distribution-card glass-panel"
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.16,
            duration: 0.42,
          }}
        >
          <div className="statistics-card-heading">
            <div>
              <span className="section-heading__eyebrow">
                Répartition
              </span>

              <h3>Activités du groupe</h3>
            </div>
          </div>

          <div className="statistics-donut">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={activityDistribution.filter(
                    (item) => item.value > 0,
                  )}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={66}
                  outerRadius={94}
                  paddingAngle={4}
                  animationDuration={900}
                >
                  {activityDistribution
                    .filter(
                      (item) => item.value > 0,
                    )
                    .map((item) => (
                      <Cell
                        key={item.name}
                        fill={item.color}
                      />
                    ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="statistics-donut__center">
              <strong>100 %</strong>
              <span>des activités</span>
            </div>
          </div>

          <div className="statistics-distribution-list">
            {activityDistribution.map((item) => (
              <div
                key={item.name}
                className="statistics-distribution-item"
              >
                <span
                  className="statistics-distribution-item__dot"
                  style={{
                    background: item.color,
                  }}
                />

                <span>{item.name}</span>

                <strong>{item.value} %</strong>
              </div>
            ))}
          </div>
        </motion.article>
      </section>

      <section className="statistics-secondary-grid">
        <motion.article
          className="statistics-chart-card glass-panel"
          initial={{
            opacity: 0,
            y: 18,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
        >
          <div className="statistics-card-heading">
            <div>
              <span className="section-heading__eyebrow">
                Tennis
              </span>

              <h3>Victoires et défaites</h3>
            </div>
          </div>

          <div className="statistics-bar-chart">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={memberChartData}
                margin={{
                  top: 15,
                  right: 5,
                  left: -22,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="4 8"
                  stroke="rgba(255,255,255,0.07)"
                />

                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "rgba(255,255,255,0.48)",
                    fontSize: 11,
                  }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "rgba(255,255,255,0.38)",
                    fontSize: 11,
                  }}
                />

                <Tooltip content={<StatisticsTooltip />} />

                <Bar
                  dataKey="wins"
                  fill="#5ee49b"
                  radius={[6, 6, 0, 0]}
                  animationDuration={850}
                />

                <Bar
                  dataKey="losses"
                  fill="#ff6f78"
                  radius={[6, 6, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.article>

        <motion.article
          className="statistics-member-panel glass-panel"
          initial={{
            opacity: 0,
            y: 18,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
        >
          <div className="statistics-card-heading">
            <div>
              <span className="section-heading__eyebrow">
                Fiche individuelle
              </span>

              <h3>Statistiques par membre</h3>
            </div>
          </div>

          <label className="statistics-member-selector">
            <span>Choisir un membre</span>

            <div>
              <Users size={17} />

              <select
                value={selectedMemberId}
                onChange={(event) => {
                  setSelectedMemberId(event.target.value);
                }}
              >
                {members.map((member) => (
                  <option
                    key={member.id}
                    value={member.id}
                  >
                    {member.nickname}
                  </option>
                ))}
              </select>

              <ChevronDown size={17} />
            </div>
          </label>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMember?.id}
              className="statistics-member-profile"
              initial={{
                opacity: 0,
                x: 12,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -12,
              }}
              transition={{
                duration: 0.25,
              }}
            >
              <div className="statistics-member-profile__identity">
                <span className="statistics-member-profile__avatar">
                  {selectedMember?.initials ??
                    selectedMember?.nickname
                      ?.slice(0, 2)
                      .toUpperCase()}
                </span>

                <div>
                  <strong>
                    {selectedMember?.nickname ?? "—"}
                  </strong>

                  <small>
                    {selectedMember?.firstName ?? ""}
                  </small>
                </div>

                <span className="statistics-member-profile__rank">
                  <Medal size={16} />
                  {selectedMember?.points ?? 0} pts
                </span>
              </div>

              <div className="statistics-member-profile__grid">
                <div>
                  <span>
                    <Trophy size={16} />
                  </span>

                  <small>Victoires</small>
                  <strong>
                    {selectedMemberWins}
                  </strong>
                </div>

                <div>
                  <span>
                    <Target size={16} />
                  </span>

                  <small>Réussite</small>
                  <strong>
                    {selectedMemberWinRate} %
                  </strong>
                </div>

                <div>
                  <span>
                    <Bike size={16} />
                  </span>

                  <small>Vélo</small>
                  <strong>
                    {Number(
                      selectedMember?.bikeDistance ??
                      selectedMember?.bikeKm ??
                      0,
                    ).toLocaleString("fr-FR")}{" "}
                    km
                  </strong>
                </div>

                <div>
                  <span>
                    <CalendarCheck size={16} />
                  </span>

                  <small>Événements</small>
                  <strong>
                    {selectedMember?.events ?? 0}
                  </strong>
                </div>
              </div>

              <div className="statistics-member-profile__progress">
                <div>
                  <span>Taux de victoire</span>
                  <strong>
                    {selectedMemberWinRate} %
                  </strong>
                </div>

                <span>
                  <motion.i
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${selectedMemberWinRate}%`,
                    }}
                    transition={{
                      duration: 0.65,
                    }}
                  />
                </span>
              </div>

              <div className="statistics-member-profile__elo">
                <div>
                  <small>Classement ELO</small>
                  <strong>
                    {selectedMember?.elo ?? 1500}
                  </strong>
                </div>

                <span>
                  <Gauge size={18} />
                  Niveau actuel
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.article>
      </section>

      <section className="statistics-records">
        <div className="section-heading">
          <div>
            <span className="section-heading__eyebrow">
              Records
            </span>

            <h2>Les meilleurs de la saison</h2>
          </div>
        </div>

        <div className="statistics-records__grid">
          {records.map((record, index) => {
            const Icon = record.icon;

            return (
              <motion.article
                key={record.id}
                className={`statistics-record-card statistics-record-card--${record.accent} glass-panel`}
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  delay: index * 0.06,
                }}
                whileHover={{
                  y: -5,
                }}
              >
                <span className="statistics-record-card__icon">
                  <Icon size={22} />
                </span>

                <div>
                  <small>{record.label}</small>
                  <strong>{record.member}</strong>
                  <span>{record.value}</span>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <motion.footer
        className="statistics-footer glass-panel"
        initial={{
          opacity: 0,
          y: 18,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.2,
        }}
      >
        <span className="statistics-footer__icon">
          <Activity size={22} />
        </span>

        <div>
          <strong>
            L’activité du groupe progresse
          </strong>

          <p>
            Les Co’Pintes ont joué davantage de matchs et
            parcouru plus de kilomètres que sur la période
            précédente.
          </p>
        </div>

        <span className="statistics-footer__value">
          +18,4 %
        </span>
      </motion.footer>
    </section>
  );
}

export default StatisticsSection;