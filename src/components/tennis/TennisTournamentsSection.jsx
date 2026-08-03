import {
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  ChevronDown,
  Plus,
  Shuffle,
  Sparkles,
  Trophy,
  UsersRound,
} from "lucide-react";

import TournamentAdminMenu from "./tournament/TournamentAdminMenu";
import TournamentBracket from "./tournament/TournamentBracket";
import TournamentDiagnosticsPanel from "./tournament/TournamentDiagnosticsPanel";
import TournamentRewardSync from "./tournament/TournamentRewardSync";
import TennisTournamentStatistics from "./tournament/TennisTournamentStatistics";
import TournamentPodium from "./tournament/TournamentPodium";

import {
  formatTournamentDate,
  STATUS_LABELS,
} from "./tournament/tournamentConstants";

function TennisTournamentsSection({
  tournaments = [],
  loading = false,
  saving = false,
  error = null,
  canManage = false,

  onCreate,
  onEnterScore,
  onAdminAction,
  onMatchAdminAction,
  onPrepareCorrection,
  onApplyCorrection,
  correctionSaving = false,

  rewardSyncResult = null,
  rewardSyncError = null,
  onSyncRewards = null,

  diagnostics = null,
  diagnosticsLoading = false,
  diagnosticsError = null,
  onLoadDiagnostics = null,
}) {
  const [
    selectedTournamentId,
    setSelectedTournamentId,
  ] = useState(null);

  const [
    adminMenuOpen,
    setAdminMenuOpen,
  ] = useState(false);

  const selectedTournament =
    useMemo(() => {
      if (
        tournaments.length === 0
      ) {
        return null;
      }

      return (
        tournaments.find(
          (tournament) =>
            String(
              tournament.id,
            ) ===
            String(
              selectedTournamentId,
            ),
        ) ??
        tournaments[0]
      );
    }, [
      selectedTournamentId,
      tournaments,
    ]);

  const completedMatchCount =
    selectedTournament?.matches?.filter(
      (match) =>
        match.status ===
        "completed",
    ).length ?? 0;

  const totalMatchCount =
    selectedTournament?.matches?.length ??
    0;

  const tournamentProgress =
    totalMatchCount > 0
      ? Math.min(
          100,
          Math.round(
            (
              completedMatchCount /
              totalMatchCount
            ) * 100,
          ),
        )
      : 0;

  const selectTournament = (
    tournamentId,
  ) => {
    setAdminMenuOpen(false);
    setSelectedTournamentId(
      tournamentId,
    );
  };

  const runAdminAction = (
    action,
  ) => {
    if (!selectedTournament) {
      return;
    }

    onAdminAction?.(
      action,
      selectedTournament,
    );
  };

  return (
    <section className="tennis-tournaments-section">
      <header className="tournaments-heading glass-panel">
        <div>
          <span className="section-heading__eyebrow">
            Compétition
          </span>

          <h2>
            Tournois de tennis
          </h2>

          <p>
            Tableau simple à 5 joueurs avec un préliminaire, deux demi-finales et une finale.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            className="primary-button"
            disabled={saving}
            onClick={onCreate}
          >
            <Plus size={18} />
            Nouveau tournoi
          </button>
        )}
      </header>

      <TournamentRewardSync
        canManage={canManage}
        result={rewardSyncResult}
        error={rewardSyncError}
        loading={
          correctionSaving
        }
        onSync={onSyncRewards}
      />

      <TournamentDiagnosticsPanel
        canManage={canManage}
        tournamentId={
          selectedTournament?.id
        }
        diagnostics={diagnostics}
        loading={
          diagnosticsLoading
        }
        error={
          diagnosticsError
        }
        onLoad={
          onLoadDiagnostics
        }
      />

      {loading && (
        <div className="tournaments-state glass-panel">
          Chargement des tournois…
        </div>
      )}

      {!loading && error && (
        <div className="tournaments-state tournaments-state--error glass-panel">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        tournaments.length === 0 && (
          <div className="tournaments-empty glass-panel">
            <Trophy size={42} />

            <h3>
              Aucun tournoi
            </h3>

            <p>
              Crée le premier tableau à cinq joueurs.
            </p>

            {canManage && (
              <button
                type="button"
                className="primary-button"
                onClick={onCreate}
              >
                <Sparkles
                  size={18}
                />
                Créer un tournoi
              </button>
            )}
          </div>
        )}

      {!loading &&
        !error &&
        selectedTournament && (
          <div className="tournaments-layout">
            <aside className="tournaments-list glass-panel">
              <header>
                <strong>
                  Les tournois
                </strong>

                <span>
                  {tournaments.length}
                </span>
              </header>

              <div>
                {tournaments.map(
                  (tournament) => {
                    const selected =
                      String(
                        tournament.id,
                      ) ===
                      String(
                        selectedTournament.id,
                      );

                    return (
                      <button
                        key={
                          tournament.id
                        }
                        type="button"
                        className={
                          selected
                            ? "tournament-list-card tournament-list-card--active"
                            : "tournament-list-card"
                        }
                        onClick={() =>
                          selectTournament(
                            tournament.id,
                          )
                        }
                      >
                        <span className="tournament-list-card__icon">
                          <Trophy
                            size={19}
                          />
                        </span>

                        <span className="tournament-list-card__content">
                          <strong>
                            {tournament.name}
                          </strong>

                          <small>
                            {STATUS_LABELS[
                              tournament.status
                            ] ??
                              tournament.status}
                          </small>
                        </span>

                        <ChevronDown
                          size={16}
                        />
                      </button>
                    );
                  },
                )}
              </div>
            </aside>

            <article className="tournament-details glass-panel">
              <header className="tournament-details__header">
                <div>
                  <span className="tournament-status">
                    {STATUS_LABELS[
                      selectedTournament
                        .status
                    ] ??
                      selectedTournament
                        .status}
                  </span>

                  <h3>
                    {selectedTournament.name}
                  </h3>

                  {selectedTournament.description && (
                    <p>
                      {selectedTournament.description}
                    </p>
                  )}
                </div>

                <div className="tournament-details__actions">
                  <div className="tournament-details__meta">
                    <span>
                      <UsersRound
                        size={16}
                      />

                      {Number(
                        selectedTournament.playerCount ??
                          selectedTournament.players
                            ?.length ??
                          0,
                      )}{" "}
                      joueurs
                    </span>

                    <span>
                      {selectedTournament.generationMode ===
                      "random" ? (
                        <Shuffle
                          size={16}
                        />
                      ) : (
                        <Trophy
                          size={16}
                        />
                      )}

                      {selectedTournament.generationMode ===
                      "random"
                        ? "Aléatoire"
                        : "Selon l’ELO"}
                    </span>

                    <span>
                      <CalendarDays
                        size={16}
                      />

                      {formatTournamentDate(
                        selectedTournament.startsAt,
                      )}
                    </span>
                  </div>

                  {canManage && (
                    <TournamentAdminMenu
                      open={
                        adminMenuOpen
                      }
                      onToggle={
                        setAdminMenuOpen
                      }
                      onAction={
                        runAdminAction
                      }
                    />
                  )}
                </div>
              </header>

              <div className="tournament-progress-card">
                <header>
                  <span>
                    Progression
                  </span>

                  <strong>
                    {tournamentProgress} %
                  </strong>
                </header>

                <div>
                  <span
                    style={{
                      width:
                        `${tournamentProgress}%`,
                    }}
                  />
                </div>

                <small>
                  {completedMatchCount} match(s) terminé(s) sur {totalMatchCount}
                </small>
              </div>

              <div className="tournament-seeds">
                {(selectedTournament.players ?? [])
                  .slice()
                  .sort(
                    (playerA, playerB) =>
                      Number(
                        playerA.seed ?? 0,
                      ) -
                      Number(
                        playerB.seed ?? 0,
                      ),
                  )
                  .map(
                    (player) => (
                      <div
                        key={player.id}
                        className="tournament-seed"
                      >
                        <strong>
                          #{player.seed}
                        </strong>

                        <span>
                          {player.profile
                            ?.nickname ??
                            "Membre"}
                        </span>

                        <small>
                          ELO{" "}
                          {Number(
                            player.startingElo ??
                              1500,
                          )}
                        </small>

                        {player.receivedBye && (
                          <em>
                            Exempté
                          </em>
                        )}
                      </div>
                    ),
                  )}
              </div>

              <TournamentBracket
                tournament={
                  selectedTournament
                }
                canManage={canManage}
                onEnterScore={
                  onEnterScore
                }
                onMatchAdminAction={
                  onMatchAdminAction
                }
                onPrepareCorrection={
                  onPrepareCorrection
                }
                onApplyCorrection={
                  onApplyCorrection
                }
                correctionSaving={
                  correctionSaving
                }
              />

              <TournamentPodium
                tournament={
                  selectedTournament
                }
              />

              <TennisTournamentStatistics
                tournament={
                  selectedTournament
                }
              />
            </article>
          </div>
        )}
    </section>
  );
}

export default TennisTournamentsSection;
