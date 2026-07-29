import { useMemo } from "react";

const MONTH_LABELS = [
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

function getSafeDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function getItemDate(item) {
  return (
    item?.startsAt ??
    item?.starts_at ??
    item?.rideDate ??
    item?.ride_date ??
    item?.playedAt ??
    item?.played_at ??
    item?.matchDate ??
    item?.match_date ??
    item?.createdAt ??
    item?.created_at ??
    null
  );
}

function getBikeDistance(ride) {
  return Number(
    ride?.distanceKm ??
      ride?.distance_km ??
      ride?.distance ??
      0,
  );
}

function getMemberPoints(member) {
  return Number(
    member?.calculatedPoints ??
      member?.totalPoints ??
      member?.points ??
      0,
  );
}

export function getMemberWins(member) {
  return Number(
    member?.tennisWins ??
      member?.wins ??
      0,
  );
}

function getMemberBikeDistance(member) {
  return Number(
    member?.bikeDistance ??
      member?.bikeKm ??
      0,
  );
}

export function getMemberName(member) {
  return (
    member?.nickname ??
    member?.firstName ??
    member?.first_name ??
    "Membre"
  );
}

function formatRelativeDate(value) {
  const date = getSafeDate(value);

  if (!date) {
    return "Date inconnue";
  }

  const difference =
    Date.now() - date.getTime();

  const minutes = Math.floor(
    difference / 60000,
  );

  if (minutes < 1) {
    return "À l’instant";
  }

  if (minutes < 60) {
    return `Il y a ${minutes} min`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `Il y a ${hours} h`;
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days === 1) {
    return "Hier";
  }

  if (days < 7) {
    return `Il y a ${days} jours`;
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "numeric",
      month: "short",
    },
  ).format(date);
}

export function useHomeDashboard({
  members = [],
  profile,
  user,
  events = [],
  tennisMatches = [],
  bikeRides = [],
  gages = [],
  tribunalCases = [],
}) {
  const sortedMembers = useMemo(() => {
    return [...members].sort(
      (memberA, memberB) => {
        const pointDifference =
          getMemberPoints(memberB) -
          getMemberPoints(memberA);

        if (pointDifference !== 0) {
          return pointDifference;
        }

        return (
          getMemberWins(memberB) -
          getMemberWins(memberA)
        );
      },
    );
  }, [members]);

  const completedMatches = useMemo(() => {
    return tennisMatches.filter(
      (match) =>
        match.status === "completed" ||
        match.status === "finished" ||
        match.winnerTeam != null ||
        match.winner_team != null,
    );
  }, [tennisMatches]);

  const totalBikeKm = useMemo(() => {
    if (bikeRides.length > 0) {
      return bikeRides.reduce(
        (total, ride) =>
          total + getBikeDistance(ride),
        0,
      );
    }

    return members.reduce(
      (total, member) =>
        total +
        getMemberBikeDistance(member),
      0,
    );
  }, [bikeRides, members]);

  const upcomingEvents = useMemo(() => {
    const now = Date.now();

    return events
      .filter((event) => {
        const date = getSafeDate(
          event.startsAt ??
            event.starts_at,
        );

        return (
          date &&
          date.getTime() >= now &&
          event.status !== "cancelled"
        );
      })
      .sort((eventA, eventB) => {
        const firstDate =
          getSafeDate(
            eventA.startsAt ??
              eventA.starts_at,
          )?.getTime() ?? 0;

        const secondDate =
          getSafeDate(
            eventB.startsAt ??
              eventB.starts_at,
          )?.getTime() ?? 0;

        return firstDate - secondDate;
      });
  }, [events]);

  const connectedMember = useMemo(() => {
    return (
      members.find(
        (member) =>
          String(member.id) ===
          String(user?.id),
      ) ??
      profile ??
      null
    );
  }, [
    members,
    profile,
    user?.id,
  ]);

  const connectedRanking = useMemo(() => {
    if (!user?.id) {
      return null;
    }

    const position =
      sortedMembers.findIndex(
        (member) =>
          String(member.id) ===
          String(user.id),
      );

    return position >= 0
      ? position + 1
      : null;
  }, [
    sortedMembers,
    user?.id,
  ]);

  const activityData = useMemo(() => {
    const now = new Date();

    const months = Array.from(
      { length: 6 },
      (_, index) => {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() -
            (5 - index),
          1,
        );

        return {
          year: date.getFullYear(),
          monthIndex: date.getMonth(),
          month:
            MONTH_LABELS[
              date.getMonth()
            ],
          tennis: 0,
          velo: 0,
        };
      },
    );

    completedMatches.forEach(
      (match) => {
        const date = getSafeDate(
          getItemDate(match),
        );

        if (!date) {
          return;
        }

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

    bikeRides.forEach((ride) => {
      const date = getSafeDate(
        getItemDate(ride),
      );

      if (!date) {
        return;
      }

      const target = months.find(
        (month) =>
          month.year ===
            date.getFullYear() &&
        month.monthIndex ===
          date.getMonth(),
      );

      if (target) {
        target.velo +=
          getBikeDistance(ride);
      }
    });

    return months.map((month) => ({
      month: month.month,
      tennis: month.tennis,
      velo:
        Math.round(
          month.velo * 10,
        ) / 10,
    }));
  }, [
    completedMatches,
    bikeRides,
  ]);

  const chartSummary = useMemo(() => {
    const matches =
      activityData.reduce(
        (total, month) =>
          total + month.tennis,
        0,
      );

    const kilometers =
      activityData.reduce(
        (total, month) =>
          total + month.velo,
        0,
      );

    return {
      title: `${matches} match${
        matches > 1 ? "s" : ""
      } · ${Math.round(
        kilometers,
      ).toLocaleString("fr-FR")} km`,

      description:
        "Activité enregistrée pendant les six derniers mois.",
    };
  }, [activityData]);

  const recentActivities = useMemo(() => {
    const matchActivities =
      tennisMatches.map((match) => ({
        id: `tennis-${match.id}`,
        icon: "tennis",
        title:
          match.title ??
          "Match de tennis enregistré",
        description:
          match.scoreSummary ??
          match.score_summary ??
          match.result ??
          "Un nouveau résultat a été ajouté.",
        date: getItemDate(match),
        page: "tennis",
      }));

    const bikeActivities =
      bikeRides.map((ride) => ({
        id: `bike-${ride.id}`,
        icon: "bike",
        title:
          ride.title ??
          "Sortie vélo",
        description: `${getBikeDistance(
          ride,
        ).toLocaleString(
          "fr-FR",
          {
            maximumFractionDigits: 1,
          },
        )} km${
          ride.location
            ? ` · ${ride.location}`
            : ""
        }`,
        date: getItemDate(ride),
        page: "bike",
      }));

    const eventActivities =
      events.map((event) => ({
        id: `event-${event.id}`,
        icon: "party",
        title:
          event.title ??
          "Nouvel événement",
        description:
          event.description ??
          "Un événement a été ajouté.",
        date: getItemDate(event),
        page: "events",
      }));

    const gageActivities =
      gages.map((gage) => ({
        id: `gage-${gage.id}`,
        icon: "gage",
        title:
          gage.title ??
          "Nouveau gage",
        description:
          gage.status === "validated"
            ? "Le gage a été validé."
            : gage.status ===
                "completed"
              ? "Le gage a été réalisé."
              : "Un gage a été attribué.",
        date: getItemDate(gage),
        page: "gages",
      }));

    const tribunalActivities =
      tribunalCases.map(
        (tribunalCase) => ({
          id: `tribunal-${tribunalCase.id}`,
          icon: "tribunal",
          title:
            tribunalCase.title ??
            "Nouvelle affaire",
          description:
            tribunalCase.status ===
            "judged"
              ? "Le verdict a été rendu."
              : tribunalCase.status ===
                  "voting"
                ? "Le vote est ouvert."
                : "Une affaire a été créée.",
          date:
            getItemDate(
              tribunalCase,
            ),
          page: "tribunal",
        }),
      );

    return [
      ...matchActivities,
      ...bikeActivities,
      ...eventActivities,
      ...gageActivities,
      ...tribunalActivities,
    ]
      .filter((activity) =>
        Boolean(
          getSafeDate(
            activity.date,
          ),
        ),
      )
      .sort((activityA, activityB) => {
        const firstDate =
          getSafeDate(
            activityA.date,
          )?.getTime() ?? 0;

        const secondDate =
          getSafeDate(
            activityB.date,
          )?.getTime() ?? 0;

        return secondDate - firstDate;
      })
      .slice(0, 6)
      .map((activity) => ({
        ...activity,
        time:
          formatRelativeDate(
            activity.date,
          ),
      }));
  }, [
    tennisMatches,
    bikeRides,
    events,
    gages,
    tribunalCases,
  ]);

  return {
    sortedMembers,
    leader:
      sortedMembers[0] ?? null,

    connectedMember,
    connectedPoints:
      getMemberPoints(
        connectedMember,
      ),
    connectedRanking,

    totalMatches:
      completedMatches.length,
    totalBikeKm,

    upcomingEvents,
    activityData,
    chartSummary,
    recentActivities,
  };
}

export default useHomeDashboard;