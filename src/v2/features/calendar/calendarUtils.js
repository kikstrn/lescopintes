export const CALENDAR_ITEM_TYPES = {
  EVENT: "event",
  BIKE: "bike",
  TENNIS: "tennis",
  BIRTHDAY: "birthday",
};

export const CALENDAR_TYPE_LABELS = {
  [CALENDAR_ITEM_TYPES.EVENT]: "Événement",
  [CALENDAR_ITEM_TYPES.BIKE]: "Sortie vélo",
  [CALENDAR_ITEM_TYPES.TENNIS]: "Match de tennis",
  [CALENDAR_ITEM_TYPES.BIRTHDAY]: "Anniversaire",
};

export const CALENDAR_WEEKDAYS = [
  "Lun",
  "Mar",
  "Mer",
  "Jeu",
  "Ven",
  "Sam",
  "Dim",
];

const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

export function toDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : new Date(value);
  }

  if (typeof value === "string") {
    const shortIso = value.match(
      /^(\d{4})-(\d{2})-(\d{2})$/,
    );

    if (shortIso) {
      const [, year, month, day] = shortIso;

      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
      );
    }
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

export function toDateKey(value) {
  const date = toDate(value);

  if (!date) {
    return null;
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function formatMonthTitle(value) {
  const date = toDate(value) ?? new Date();

  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatLongDate(value) {
  const date = toDate(value);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatTime(value) {
  const date = toDate(value);

  if (!date) {
    return "";
  }

  const hasTime =
    date.getHours() !== 0 ||
    date.getMinutes() !== 0;

  if (!hasTime) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getMonthStart(value) {
  const date = toDate(value) ?? new Date();

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
  );
}

export function addMonths(value, amount) {
  const date = toDate(value) ?? new Date();

  return new Date(
    date.getFullYear(),
    date.getMonth() + amount,
    1,
  );
}

export function isSameDay(firstValue, secondValue) {
  const first = toDate(firstValue);
  const second = toDate(secondValue);

  if (!first || !second) {
    return false;
  }

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function isSameMonth(firstValue, secondValue) {
  const first = toDate(firstValue);
  const second = toDate(secondValue);

  if (!first || !second) {
    return false;
  }

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth()
  );
}

export function buildMonthGrid(monthValue) {
  const monthStart = getMonthStart(monthValue);
  const mondayIndex =
    (monthStart.getDay() + 6) % 7;

  const gridStart = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth(),
    1 - mondayIndex,
  );

  return Array.from(
    { length: 42 },
    (_, index) => {
      const date = new Date(
        gridStart.getFullYear(),
        gridStart.getMonth(),
        gridStart.getDate() + index,
      );

      return {
        date,
        key: toDateKey(date),
        dayNumber: date.getDate(),
        isCurrentMonth: isSameMonth(
          date,
          monthStart,
        ),
        isToday: isSameDay(
          date,
          new Date(),
        ),
      };
    },
  );
}

function firstValue(source, keys) {
  for (const key of keys) {
    const value = source?.[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return null;
}

function resolveDate(source) {
  const dateValue = firstValue(source, [
    "startsAt",
    "starts_at",
    "startAt",
    "start_at",
    "startDate",
    "start_date",
    "scheduledAt",
    "scheduled_at",
    "eventDate",
    "event_date",
    "rideDate",
    "ride_date",
    "matchDate",
    "match_date",
    "playedAt",
    "played_at",
    "startedAt",
    "started_at",
    "date",
  ]);

  const date = toDate(dateValue);

  if (!date) {
    return null;
  }

  const timeValue = firstValue(source, [
    "time",
    "startTime",
    "start_time",
    "scheduledTime",
    "scheduled_time",
  ]);

  if (
    typeof timeValue === "string" &&
    /^\d{1,2}:\d{2}/.test(timeValue) &&
    date.getHours() === 0 &&
    date.getMinutes() === 0
  ) {
    const [hours, minutes] =
      timeValue.split(":");

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0,
    );
  }

  return date;
}

function displayName(profile) {
  return (
    profile?.nickname ??
    profile?.displayName ??
    profile?.display_name ??
    profile?.fullName ??
    profile?.full_name ??
    profile?.firstName ??
    profile?.first_name ??
    profile?.name ??
    null
  );
}

function participantNames(source) {
  const profiles =
    source.participantProfiles ??
    source.participants ??
    [];

  if (!Array.isArray(profiles)) {
    return [];
  }

  return profiles
    .map((participant) => {
      if (typeof participant === "string") {
        return participant;
      }

      return displayName(
        participant?.profile ??
        participant,
      );
    })
    .filter(Boolean);
}

function getBirthDateParts(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})$/,
  );

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;

  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
  };
}

function isLeapYear(year) {
  return (
    year % 400 === 0 ||
    (year % 4 === 0 && year % 100 !== 0)
  );
}

function getBirthdayDateForYear(
  birthDate,
  year,
) {
  const parts = getBirthDateParts(
    birthDate,
  );

  if (!parts) {
    return null;
  }

  /*
   * Pour les personnes nées le 29 février, on affiche
   * l'anniversaire le 28 février les années non bissextiles.
   */
  const effectiveDay =
    parts.month === 2 &&
    parts.day === 29 &&
    !isLeapYear(year)
      ? 28
      : parts.day;

  return new Date(
    year,
    parts.month - 1,
    effectiveDay,
    12,
    0,
    0,
    0,
  );
}

function normaliseBirthday(
  member,
  year,
) {
  const date =
    getBirthdayDateForYear(
      member.birthDate ??
        member.birth_date,
      year,
    );

  if (!date) {
    return null;
  }

  const parts = getBirthDateParts(
    member.birthDate ??
      member.birth_date,
  );

  const age = parts
    ? year - parts.year
    : null;

  const name =
    displayName(member) ??
    "un membre";

  return {
    id: `birthday:${member.id}:${year}`,
    sourceId: member.id,
    type: CALENDAR_ITEM_TYPES.BIRTHDAY,
    title: `🎂 Anniversaire de ${name}`,
    date,
    dateKey: toDateKey(date),
    timeLabel: "",
    location: "",
    description:
      age !== null
        ? `${name} fête ses ${age} ans.`
        : `C’est l’anniversaire de ${name}.`,
    participants: [],
    age,
    member,
    status: "birthday",
    source: member,
  };
}

export function buildBirthdayItems(
  members = [],
  {
    fromYear = new Date().getFullYear() - 2,
    toYear = new Date().getFullYear() + 3,
  } = {},
) {
  const items = [];

  members.forEach((member) => {
    const birthDate =
      member?.birthDate ??
      member?.birth_date;

    if (!birthDate) {
      return;
    }

    for (
      let year = fromYear;
      year <= toYear;
      year += 1
    ) {
      const item = normaliseBirthday(
        member,
        year,
      );

      if (item) {
        items.push(item);
      }
    }
  });

  return items;
}

export function getUpcomingBirthdays(
  items = [],
  {
    from = new Date(),
    limit = 5,
  } = {},
) {
  const fromDate = new Date(
    from.getFullYear(),
    from.getMonth(),
    from.getDate(),
  );

  return items
    .filter(
      (item) =>
        item.type ===
          CALENDAR_ITEM_TYPES.BIRTHDAY &&
        item.date >= fromDate,
    )
    .sort(
      (first, second) =>
        first.date.getTime() -
        second.date.getTime(),
    )
    .slice(0, limit);
}

function normaliseEvent(event) {
  const date = resolveDate(event);

  if (!date) {
    return null;
  }

  return {
    id: `event:${event.id}`,
    sourceId: event.id,
    type: CALENDAR_ITEM_TYPES.EVENT,
    title:
      event.title ??
      event.name ??
      "Événement",
    date,
    dateKey: toDateKey(date),
    timeLabel:
      event.time ??
      formatTime(date),
    location:
      event.location ??
      "",
    description:
      event.description ??
      "",
    participants:
      participantNames(event),
    status:
      event.status ??
      null,
    source: event,
  };
}

function normaliseBikeRide(ride) {
  const date = resolveDate(ride);

  if (!date) {
    return null;
  }

  const distance =
    ride.distanceKm ??
    ride.distance_km ??
    ride.distance ??
    null;

  return {
    id: `bike:${ride.id}`,
    sourceId: ride.id,
    type: CALENDAR_ITEM_TYPES.BIKE,
    title:
      ride.title ??
      (
        distance
          ? `Sortie vélo ${distance} km`
          : "Sortie vélo"
      ),
    date,
    dateKey: toDateKey(date),
    timeLabel: formatTime(date),
    location:
      ride.location ??
      "",
    description:
      ride.description ??
      "",
    participants:
      participantNames(ride),
    distance,
    elevation:
      ride.elevationM ??
      ride.elevation_m ??
      ride.elevation ??
      null,
    duration:
      ride.durationMinutes ??
      ride.duration_minutes ??
      null,
    status:
      ride.status ??
      null,
    source: ride,
  };
}

function teamNames(team) {
  if (!Array.isArray(team)) {
    return [];
  }

  return team
    .map(displayName)
    .filter(Boolean);
}

function normaliseTennisMatch(match) {
  const date = resolveDate(match);

  if (!date) {
    return null;
  }

  const teamOne =
    teamNames(match.teamOne);

  const teamTwo =
    teamNames(match.teamTwo);

  const participants = [
    ...teamOne,
    ...teamTwo,
  ];

  const title =
    match.matchType === "double"
      ? `${
          teamOne.join(" / ") || "Équipe 1"
        } vs ${
          teamTwo.join(" / ") || "Équipe 2"
        }`
      : `${
          teamOne[0] ??
          displayName(match.playerOne) ??
          "Joueur 1"
        } vs ${
          teamTwo[0] ??
          displayName(match.playerTwo) ??
          "Joueur 2"
        }`;

  const score = Array.isArray(match.sets)
    ? match.sets
        .map(
          (set) =>
            `${set.playerOne}-${set.playerTwo}`,
        )
        .join(", ")
    : null;

  return {
    id: `tennis:${match.id}`,
    sourceId: match.id,
    type: CALENDAR_ITEM_TYPES.TENNIS,
    title,
    date,
    dateKey: toDateKey(date),
    timeLabel: formatTime(date),
    location:
      match.location ??
      "",
    description:
      match.notes ??
      "",
    participants,
    score,
    status:
      match.status ??
      "completed",
    source: match,
  };
}

export function buildCalendarItems({
  events = [],
  bikeRides = [],
  tennisMatches = [],
  members = [],
} = {}) {
  return [
    ...events.map(normaliseEvent),
    ...bikeRides.map(normaliseBikeRide),
    ...tennisMatches.map(normaliseTennisMatch),
    ...buildBirthdayItems(members),
  ]
    .filter(Boolean)
    .sort(
      (first, second) =>
        first.date.getTime() -
        second.date.getTime(),
    );
}

export function groupCalendarItemsByDate(
  items = [],
) {
  return items.reduce(
    (groups, item) => {
      const key =
        item.dateKey ??
        toDateKey(item.date);

      if (!key) {
        return groups;
      }

      groups[key] ??= [];
      groups[key].push(item);

      return groups;
    },
    {},
  );
}

export function getItemsForDate(
  items = [],
  date,
) {
  const key = toDateKey(date);

  return items.filter(
    (item) =>
      (
        item.dateKey ??
        toDateKey(item.date)
      ) === key,
  );
}

export function countItemsByType(
  items = [],
) {
  return items.reduce(
    (counts, item) => {
      if (counts[item.type] !== undefined) {
        counts[item.type] += 1;
        counts.total += 1;
      }

      return counts;
    },
    {
      total: 0,
      event: 0,
      bike: 0,
      tennis: 0,
      birthday: 0,
    },
  );
}
