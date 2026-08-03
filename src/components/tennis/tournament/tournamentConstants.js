export const ROUND_LABELS = {
  preliminary: "Tour préliminaire",
  semi_final: "Demi-finale",
  final: "Finale",
};

export const STATUS_LABELS = {
  draft: "Brouillon",
  ready: "Prêt",
  in_progress: "En cours",
  completed: "Terminé",
  cancelled: "Annulé",
};

export function formatTournamentDate(
  value,
) {
  if (!value) {
    return "Date à définir";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(
    new Date(value),
  );
}
