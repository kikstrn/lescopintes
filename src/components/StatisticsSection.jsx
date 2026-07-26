import { useMemo, useState } from "react";
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

const monthlyActivity = [
  {
    month: "Fév",
    tennis: 4,
    bike: 140,
    events: 3,
  },
  {
    month: "Mars",
    tennis: 7,
    bike: 230,
    events: 4,
  },
  {
    month: "Avr",
    tennis: 6,
    bike: 315,
    events: 4,
  },
  {
    month: "Mai",
    tennis: 9,
    bike: 460,
    events: 6,
  },
  {
    month: "Juin",
    tennis: 11,
    bike: 620,
    events: 7,
  },
  {
    month: "Juil",
    tennis: 13,
    bike: 745,
    events: 8,
  },
];

const activityDistribution = [
  {
    name: "Tennis",
    value: 42,
    color: "#5ee49b",
  },
  {
    name: "Cyclisme",
    value: 34,
    color: "#63b8ff",
  },
  {
    name: "Apéros",
    value: 16,
    color: "#ffbb58",
  },
  {
    name: "Autres",
    value: 8,
    color: "#b38cff",
  },
];

const records = [
  {
    id: 1,
    icon: Trophy,
    label: "Plus de victoires",
    member: "Kiks",
    value: "18 victoires",
    accent: "green",
  },
  {
    id: 2,
    icon: Bike,
    label: "Plus de kilomètres",
    member: "Raf",
    value: "1 242 km",
    accent: "blue",
  },
  {
    id: 3,
    icon: CalendarCheck,
    label: "Plus présent",
    member: "Kiks",
    value: "26 événements",
    accent: "amber",
  },
  {
    id: 4,
    icon: Target,
    label: "Meilleur taux",
    member: "Kiks",
    value: "75 % de victoires",
    accent: "purple",
  },
];

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

function StatisticsSection({ members = [] }) {
  const [selectedMemberId, setSelectedMemberId] = useState(
    members[0]?.id ?? "",
  );

  const [selectedPeriod, setSelectedPeriod] = useState("season");

  const selectedMember = useMemo(() => {
    return members.find((member) => {
      return member.id === Number(selectedMemberId);
    });
  }, [members, selectedMemberId]);

  const memberChartData = useMemo(() => {
    return members.map((member) => {
      return {
        name: member.nickname,
        wins: member.wins ?? 0,
        losses: member.losses ?? 0,
        bikeKm: member.bikeKm ?? 0,
        events: member.events ?? 0,
      };
    });
  }, [members]);

  const totalWins = useMemo(() => {
    return members.reduce((total, member) => {
      return total + (member.wins ?? 0);
    }, 0);
  }, [members]);

  const totalLosses = useMemo(() => {
    return members.reduce((total, member) => {
      return total + (member.losses ?? 0);
    }, 0);
  }, [members]);

  const totalMatches = Math.round((totalWins + totalLosses) / 2);

  const totalBikeKm = useMemo(() => {
    return members.reduce((total, member) => {
      return total + (member.bikeKm ?? 0);
    }, 0);
  }, [members]);

  const totalEvents = useMemo(() => {
    return members.reduce((total, member) => {
      return total + (member.events ?? 0);
    }, 0);
  }, [members]);

  const averageWinRate = useMemo(() => {
    if (members.length === 0) {
      return 0;
    }

    const totalRate = members.reduce((total, member) => {
      const matches =
        (member.wins ?? 0) +
        (member.losses ?? 0);

      if (matches === 0) {
        return total;
      }

      return total + ((member.wins ?? 0) / matches) * 100;
    }, 0);

    return Math.round(totalRate / members.length);
  }, [members]);

  const selectedMemberMatches =
    (selectedMember?.wins ?? 0) +
    (selectedMember?.losses ?? 0);

  const selectedMemberWinRate =
    selectedMemberMatches > 0
      ? Math.round(
          ((selectedMember?.wins ?? 0) /
            selectedMemberMatches) *
            100,
        )
      : 0;

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
          detail="+12 %"
          accent="green"
          delay={0}
        />

        <StatisticCard
          icon={Bike}
          label="Kilomètres vélo"
          value={totalBikeKm.toLocaleString("fr-FR")}
          detail="+18 %"
          accent="blue"
          delay={0.05}
        />

        <StatisticCard
          icon={CalendarCheck}
          label="Participations"
          value={totalEvents}
          detail="+9 %"
          accent="amber"
          delay={0.1}
        />

        <StatisticCard
          icon={Target}
          label="Taux de victoire moyen"
          value={`${averageWinRate} %`}
          detail="+4 %"
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
                  data={activityDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={66}
                  outerRadius={94}
                  paddingAngle={4}
                  animationDuration={900}
                >
                  {activityDistribution.map((item) => (
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
                    {selectedMember?.wins ?? 0}
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
                    {(selectedMember?.bikeKm ?? 0).toLocaleString(
                      "fr-FR",
                    )}{" "}
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