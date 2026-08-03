function TournamentRewardSync({
  canManage = false,
  result = null,
  error = null,
  loading = false,
  onSync,
}) {
  if (!canManage) {
    return null;
  }

  if (!result && !error) {
    return (
      <div className="tennis-reward-sync-launcher">
        <button
          type="button"
          disabled={loading}
          onClick={onSync}
        >
          Vérifier les points, l’XP et les badges
        </button>
      </div>
    );
  }

  return (
    <aside
      className={[
        "tennis-reward-sync",
        error
          ? "tennis-reward-sync--error"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {error ? (
        <>
          <strong>
            Synchronisation incomplète
          </strong>

          <span>
            {error}
          </span>
        </>
      ) : (
        <>
          <strong>
            Récompenses synchronisées
          </strong>

          <span>
            {Number(
              result?.validTennisMatchCount ??
                0,
            )}{" "}
            matchs valides ·{" "}
            {Number(
              result?.pointsTransactionCount ??
                0,
            )}{" "}
            transactions de points ·{" "}
            {Number(
              result?.xpTransactionCount ??
                0,
            )}{" "}
            transactions XP ·{" "}
            {Number(
              result?.refreshedProfileCount ??
                0,
            )}{" "}
            profils actualisés
          </span>
        </>
      )}

      <button
        type="button"
        disabled={loading}
        onClick={onSync}
      >
        Resynchroniser
      </button>
    </aside>
  );
}

export default TournamentRewardSync;
