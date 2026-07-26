import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="activity-chart__tooltip">
      <strong>{label}</strong>

      {payload.map((item) => (
        <div
          key={item.dataKey}
          className="activity-chart__tooltip-row"
        >
          <span
            className={`activity-chart__tooltip-dot activity-chart__tooltip-dot--${item.dataKey}`}
          />

          <span>
            {item.dataKey === "tennis" ? "Matchs de tennis" : "Kilomètres vélo"}
          </span>

          <strong>
            {item.value}
            {item.dataKey === "velo" ? " km" : ""}
          </strong>
        </div>
      ))}
    </div>
  );
}

function ActivityChart({ data }) {
  return (
    <motion.div
      className="activity-chart glass-panel"
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
      <div className="activity-chart__summary">
        <div>
          <span>Activité globale</span>
          <strong>+18,4 %</strong>
        </div>

        <p>
          Progression par rapport aux six mois précédents.
        </p>
      </div>

      <div className="activity-chart__container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 15,
              right: 5,
              left: -20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="tennisGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#5ee49b"
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor="#5ee49b"
                  stopOpacity={0}
                />
              </linearGradient>

              <linearGradient
                id="bikeGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#63b8ff"
                  stopOpacity={0.34}
                />
                <stop
                  offset="100%"
                  stopColor="#63b8ff"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="4 8"
              vertical={false}
              stroke="rgba(255,255,255,0.07)"
            />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{
                fill: "rgba(255,255,255,0.5)",
                fontSize: 12,
              }}
              dy={10}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{
                fill: "rgba(255,255,255,0.4)",
                fontSize: 11,
              }}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "rgba(255,255,255,0.16)",
                strokeWidth: 1,
              }}
            />

            <Area
              type="monotone"
              dataKey="velo"
              stroke="#63b8ff"
              strokeWidth={2.5}
              fill="url(#bikeGradient)"
              activeDot={{
                r: 5,
                strokeWidth: 3,
                stroke: "#0b1512",
                fill: "#63b8ff",
              }}
              animationDuration={1100}
              animationEasing="ease-out"
            />

            <Area
              type="monotone"
              dataKey="tennis"
              stroke="#5ee49b"
              strokeWidth={2.5}
              fill="url(#tennisGradient)"
              activeDot={{
                r: 5,
                strokeWidth: 3,
                stroke: "#0b1512",
                fill: "#5ee49b",
              }}
              animationDuration={900}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default ActivityChart;