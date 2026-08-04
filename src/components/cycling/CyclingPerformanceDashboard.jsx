import {
  Activity,
  Clock3,
  Gauge,
  Mountain,
  Route,
  Trophy,
} from "lucide-react";

import {
  useMemo,
} from "react";


function roundToTenth(
  value,
) {
  const numericValue =
    Number(value);

  if (
    !Number.isFinite(
      numericValue,
    )
  ) {
    return 0;
  }

  return (
    Math.round(
      (
        numericValue +
        Number.EPSILON
      ) *
      10,
    ) /
    10
  );
}

function formatSpeed(
  value,
) {
  const rounded =
    roundToTenth(
      value,
    );

  return rounded > 0
    ? `${rounded.toLocaleString(
        "fr-FR",
        {
          minimumFractionDigits:
            1,

          maximumFractionDigits:
            1,
        },
      )} km/h`
    : "—";
}

function formatDuration(
  minutes,
) {
  const total =
    Math.max(
      0,
      Math.round(
        Number(minutes) ||
        0,
      ),
    );

  const hours =
    Math.floor(
      total / 60,
    );

  const remaining =
    total % 60;

  if (hours <= 0) {
    return `${remaining} min`;
  }

  return `${hours} h ${String(
    remaining,
  ).padStart(2, "0")}`;
}

function CyclingPerformanceDashboard({
  rides = [],
  profileId,
}) {
  const statistics =
    useMemo(() => {
      const personalRides =
        rides.filter(
          (ride) =>
            ride.status ===
              "completed" &&
            (
              ride.createdBy ===
                profileId ||
              ride.participantIds
                ?.includes(
                  profileId,
                )
            ),
        );

      const totals =
        personalRides.reduce(
          (
            result,
            ride,
          ) => {
            result.distance +=
              Number(
                ride.distanceKm ??
                0,
              );

            result.elevation +=
              Number(
                ride.elevationM ??
                0,
              );

            result.duration +=
              Number(
                ride.durationMinutes ??
                0,
              );

            return result;
          },
          {
            distance: 0,
            elevation: 0,
            duration: 0,
          },
        );

      const longestRide =
        personalRides.reduce(
          (
            best,
            ride,
          ) =>
            Number(
              ride.distanceKm ??
              0,
            ) >
            Number(
              best?.distanceKm ??
              0,
            )
              ? ride
              : best,
          null,
        );

      const averageSpeed =
        totals.duration > 0
          ? totals.distance /
            (
              totals.duration /
              60
            )
          : 0;

      return {
        rideCount:
          personalRides.length,

        ...totals,

        averageSpeed,
        longestRide,
      };
    }, [
      profileId,
      rides,
    ]);

  const cards = [
    {
      label:
        "Activités",

      value:
        statistics.rideCount,

      icon:
        Activity,
    },
    {
      label:
        "Distance",

      value:
        `${statistics.distance.toLocaleString(
          "fr-FR",
          {
            maximumFractionDigits:
              1,
          },
        )} km`,

      icon:
        Route,
    },
    {
      label:
        "Temps de parcours",

      value:
        formatDuration(
          statistics.duration,
        ),

      icon:
        Clock3,
    },
    {
      label:
        "Ascension totale",

      value:
        `${Math.round(
          statistics.elevation,
        ).toLocaleString(
          "fr-FR",
        )} m`,

      icon:
        Mountain,
    },
    {
      label:
        "Vitesse moyenne",

      value:
        formatSpeed(
          statistics.averageSpeed,
        ),

      icon:
        Gauge,
    },
    {
      label:
        "Plus longue sortie",

      value:
        statistics.longestRide
          ? `${Number(
              statistics
                .longestRide
                .distanceKm,
            ).toFixed(1)} km`
          : "—",

      icon:
        Trophy,
    },
  ];

  return (
    <section className="cycling-performance">
      <header className="cycling-performance__header">
        <div>
          <span className="section-heading__eyebrow">
            Mon activité
          </span>

          <h2>
            Tableau cyclisme
          </h2>
        </div>

        <span className="cycling-performance__period">
          Depuis le début
        </span>
      </header>

      <div className="cycling-performance__grid">
        {cards.map(
          (
            card,
          ) => {
            const Icon =
              card.icon;

            return (
              <article
                key={
                  card.label
                }
                className="cycling-performance__card"
              >
                <span className="cycling-performance__icon">
                  <Icon
                    size={20}
                  />
                </span>

                <small>
                  {card.label}
                </small>

                <strong>
                  {card.value}
                </strong>
              </article>
            );
          },
        )}
      </div>
    </section>
  );
}

export default CyclingPerformanceDashboard;
