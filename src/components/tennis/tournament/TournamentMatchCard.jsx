import {
  useState,
} from "react";

import {
  History,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";

import {
  ROUND_LABELS,
} from "./tournamentConstants";

import TournamentPlayerLine from "./TournamentPlayerLine";

function TournamentMatchCard({
  match,
  canManage = false,
  onEnterScore,
  onMatchAdminAction,
  onPrepareCorrection,
  onApplyCorrection,
  correctionSaving = false,
}) {
  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const ready =
    match?.status === "ready";

  const completed =
    match?.status === "completed";

  const resultLocked =
    Boolean(
      match?.resultLocked,
    );

  const runAdminAction = (
    action,
  ) => {
    setMenuOpen(false);

    onMatchAdminAction?.(
      action,
      match,
    );
  };

  const playerOneIsWinner =
    Boolean(
      match?.winnerId &&
      String(
        match.winnerId,
      ) ===
        String(
          match.playerOneId,
        ),
    );

  const playerTwoIsWinner =
    Boolean(
      match?.winnerId &&
      String(
        match.winnerId,
      ) ===
        String(
          match.playerTwoId,
        ),
    );

  return (
    <article
      className={[
        "bracket-match",

        ready &&
        !resultLocked
          ? "bracket-match--ready"
          : "",

        resultLocked
          ? "bracket-match--correction-pending"
          : "",

        completed
          ? "bracket-match--completed"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="bracket-match__header">
        <span>
          {ROUND_LABELS[
            match?.roundCode
          ] ??
            match?.roundCode ??
            "Match"}
        </span>

        <div className="bracket-match__header-actions">
          <small>
            {resultLocked
              ? "Correction en attente"
              : ready
                ? "Prêt à jouer"
                : completed
                  ? "Terminé"
                  : "En attente"}
          </small>

          {canManage && (
            <div className="bracket-match-admin-menu-wrap">
              <button
                type="button"
                className="bracket-match-admin-trigger"
                aria-label="Administrer ce match"
                aria-expanded={
                  menuOpen
                }
                onClick={() =>
                  setMenuOpen(
                    (current) =>
                      !current,
                  )
                }
              >
                <MoreHorizontal
                  size={17}
                />
              </button>

              {menuOpen && (
                <div className="bracket-match-admin-menu">
                  {ready &&
                    !resultLocked && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(
                            false,
                          );

                          onEnterScore?.(
                            match,
                          );
                        }}
                      >
                        <Trophy
                          size={16}
                        />

                        Entrer le score
                      </button>
                    )}

                  {completed && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          runAdminAction(
                            "edit_result",
                          )
                        }
                      >
                        <Pencil
                          size={16}
                        />

                        Modifier le résultat
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          runAdminAction(
                            "cancel_result",
                          )
                        }
                      >
                        <XCircle
                          size={16}
                        />

                        Annuler le résultat
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          runAdminAction(
                            "replay",
                          )
                        }
                      >
                        <RotateCcw
                          size={16}
                        />

                        Rejouer le match
                      </button>
                    </>
                  )}

                  {resultLocked && (
                    <p className="bracket-match-admin-menu__notice">
                      Le match est verrouillé jusqu’au recalcul sportif.
                    </p>
                  )}

                  <span />

                  <button
                    type="button"
                    onClick={() =>
                      runAdminAction(
                        "history",
                      )
                    }
                  >
                    <History
                      size={16}
                    />

                    Voir l’historique
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <TournamentPlayerLine
        player={
          match?.playerOne
        }
        isWinner={
          playerOneIsWinner
        }
      />

      <div className="bracket-match__versus">
        VS
      </div>

      <TournamentPlayerLine
        player={
          match?.playerTwo
        }
        isWinner={
          playerTwoIsWinner
        }
      />

      {ready &&
        !resultLocked && (
          <button
            type="button"
            className="bracket-match__score-button"
            onClick={() =>
              onEnterScore?.(
                match,
              )
            }
          >
            Entrer le score
          </button>
        )}

      {resultLocked && (
        <div className="bracket-match__correction-note">
          <span>
            Résultat retiré du tableau. Une correction peut maintenant être préparée.
          </span>

          {canManage && (
            <div className="bracket-match__correction-actions">
              <button
                type="button"
                disabled={
                  correctionSaving
                }
                onClick={() =>
                  onPrepareCorrection?.(
                    match,
                  )
                }
              >
                Préparer / modifier
              </button>

              <button
                type="button"
                className="bracket-match__correction-apply"
                disabled={
                  correctionSaving
                }
                onClick={() =>
                  onApplyCorrection?.(
                    match,
                  )
                }
              >
                {correctionSaving
                  ? "Application…"
                  : "Appliquer la correction"}
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default TournamentMatchCard;
