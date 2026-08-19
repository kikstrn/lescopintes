const CALENDAR_EVENT_TYPES = new Set([
  "tennis",
  "party",
  "barbecue",
  "other",
]);

export function canAddEventToCalendar(event) {
  if (!event) return false;

  return (
    CALENDAR_EVENT_TYPES.has(event.type) &&
    event.status !== "cancelled" &&
    Boolean(event.startsAt)
  );
}

function escapeIcsText(value = "") {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatIcsDate(value) {
  return new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function foldIcsLine(line) {
  const maxLength = 73;

  if (line.length <= maxLength) {
    return line;
  }

  const chunks = [];

  for (
    let index = 0;
    index < line.length;
    index += maxLength
  ) {
    chunks.push(
      `${index === 0 ? "" : " "}${line.slice(
        index,
        index + maxLength,
      )}`,
    );
  }

  return chunks.join("\r\n");
}

function createCalendarDescription(event) {
  const parts = [];

  if (event.description) {
    parts.push(event.description);
  }

  if (event.typeLabel) {
    parts.push(
      `Type : ${event.typeLabel}`,
    );
  }

  parts.push(
    "Ajouté depuis Les Co'Pintes.",
  );

  return parts.join("\n\n");
}

function createIcs(event) {
  const start =
    formatIcsDate(event.startsAt);

  const endDate =
    event.endsAt
      ? new Date(event.endsAt)
      : new Date(
          new Date(event.startsAt).getTime() +
            60 * 60 * 1000,
        );

  const end =
    formatIcsDate(endDate);

  const uid =
    `${event.id ?? crypto.randomUUID()}@les-copintes`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Les Co'Pintes//Evenements//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsText(event.title || "Événement Les Co'Pintes")}`,
    `DESCRIPTION:${escapeIcsText(createCalendarDescription(event))}`,
  ];

  if (event.location) {
    lines.push(
      `LOCATION:${escapeIcsText(event.location)}`,
    );
  }

  lines.push(
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  );

  return `${lines
    .map(foldIcsLine)
    .join("\r\n")}\r\n`;
}

function sanitizeFilename(value) {
  return String(value || "evenement")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function addEventToCalendar(event) {
  if (!canAddEventToCalendar(event)) {
    return false;
  }

  const blob =
    new Blob(
      [createIcs(event)],
      {
        type:
          "text/calendar;charset=utf-8",
      },
    );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download =
    `${sanitizeFilename(event.title)}.ics`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(
    () =>
      URL.revokeObjectURL(url),
    1000,
  );

  return true;
}
