function DiagnosticValue({
  value,
  label,
}) {
  return (
    <article>
      <strong>
        {value}
      </strong>

      <span>
        {label}
      </span>
    </article>
  );
}

function TournamentDiagnosticsPanel({
  canManage = false,
  tournamentId,
  diagnostics = null,
  loading = false,
  error = null,
  onLoad,
}) {
  if (
    !canManage ||
    !tournamentId
  ) {
    return null;
  }

  const healthLabel =
    diagnostics?.health ===
    "healthy"
      ? "Sain"
      : diagnostics?.health ===
          "critical"
        ? "Critique"
        : "À vérifier";

  return (
    <section className="tournament-diagnostics-panel glass-panel">
      <header>
        <div>
          <strong>
            Diagnostic du tournoi
          </strong>

          <span>
            Vérifie la cohérence du tableau, des résultats et du champion.
          </span>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() =>
            onLoad?.(
              tournamentId,
            )
          }
        >
          {loading
            ? "Analyse…"
            : "Lancer le diagnostic"}
        </button>
      </header>

      {error && (
        <p className="tournament-diagnostics-panel__error">
          {error}
        </p>
      )}

      {diagnostics && (
        <div
          className={[
            "tournament-diagnostics-grid",
            `tournament-diagnostics-grid--${diagnostics.health ?? "warning"}`,
          ].join(" ")}
        >
          <DiagnosticValue
            value={healthLabel}
            label="État général"
          />

          <DiagnosticValue
            value={Number(
              diagnostics.lockedMatches ??
                0,
            )}
            label="Matchs verrouillés"
          />

          <DiagnosticValue
            value={Number(
              diagnostics.pendingCorrections ??
                0,
            )}
            label="Corrections en attente"
          />

          <DiagnosticValue
            value={Number(
              diagnostics.orphanedResults ??
                0,
            )}
            label="Résultats orphelins"
          />

          <DiagnosticValue
            value={Number(
              diagnostics.invalidWinnerLinks ??
                0,
            )}
            label="Liaisons invalides"
          />

          <DiagnosticValue
            value={
              diagnostics.championIsValid
                ? "Oui"
                : "Non"
            }
            label="Champion cohérent"
          />
        </div>
      )}
    </section>
  );
}

export default TournamentDiagnosticsPanel;
