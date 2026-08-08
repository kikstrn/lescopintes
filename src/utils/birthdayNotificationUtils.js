export function parseBirthDate(value) {
  if (!value || typeof value !== "string") return null;

  const match = value.match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }

  return date;
}

export function isBirthdayToday(birthDateValue, referenceDate = new Date()) {
  const birthDate = parseBirthDate(birthDateValue);
  if (!birthDate) return false;

  return (
    birthDate.getMonth() === referenceDate.getMonth() &&
    birthDate.getDate() === referenceDate.getDate()
  );
}

export function getBirthdayAge(birthDateValue, referenceDate = new Date()) {
  const birthDate = parseBirthDate(birthDateValue);
  if (!birthDate) return null;

  return referenceDate.getFullYear() - birthDate.getFullYear();
}

function getMemberName(member) {
  return (
    member?.nickname ??
    member?.firstName ??
    member?.first_name ??
    member?.name ??
    "un membre"
  );
}

export function getBirthdayNotificationTitle(member) {
  return `🎉 Anniversaire de ${getMemberName(member)}`;
}

export function getBirthdayNotificationBody(member) {
  return `Aujourd’hui, c’est l’anniversaire de ${getMemberName(member)} ! Souhaitez-lui un joyeux anniversaire 🎂`;
}

export function getBirthdayNotificationKey({
  recipientId,
  birthdayProfileId,
  year = new Date().getFullYear(),
}) {
  if (!recipientId || !birthdayProfileId) return null;

  return ["birthday", year, birthdayProfileId, recipientId].join(":");
}

export function shouldNotifyMember({
  recipientId,
  birthdayProfileId,
}) {
  if (!recipientId || !birthdayProfileId) return false;

  return String(recipientId) !== String(birthdayProfileId);
}
