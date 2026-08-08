export function parseBirthDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : new Date(
          value.getFullYear(),
          value.getMonth(),
          value.getDate(),
        );
  }

  if (typeof value !== "string") {
    return null;
  }

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})$/,
  );

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
  );

  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }

  return date;
}

export function isValidBirthDate(value) {
  if (!value) {
    return true;
  }

  const date = parseBirthDate(value);

  if (!date) {
    return false;
  }

  const today = new Date();
  const oldestAllowed = new Date(
    today.getFullYear() - 120,
    today.getMonth(),
    today.getDate(),
  );

  return (
    date <= today &&
    date >= oldestAllowed
  );
}

export function getAgeFromBirthDate(
  value,
  referenceDate = new Date(),
) {
  const birthDate =
    parseBirthDate(value);

  if (!birthDate) {
    return null;
  }

  let age =
    referenceDate.getFullYear() -
    birthDate.getFullYear();

  const beforeBirthday =
    referenceDate.getMonth() <
      birthDate.getMonth() ||
    (
      referenceDate.getMonth() ===
        birthDate.getMonth() &&
      referenceDate.getDate() <
        birthDate.getDate()
    );

  if (beforeBirthday) {
    age -= 1;
  }

  return Math.max(age, 0);
}

export function formatBirthDate(value) {
  const birthDate =
    parseBirthDate(value);

  if (!birthDate) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(birthDate);
}

export function formatBirthdayWithAge(
  value,
) {
  const formatted =
    formatBirthDate(value);

  const age =
    getAgeFromBirthDate(value);

  if (!formatted) {
    return "";
  }

  return age === null
    ? formatted
    : `${formatted} · ${age} ans`;
}
