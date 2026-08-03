import {
  Trophy,
} from "lucide-react";

import TournamentMatchCard from "./TournamentMatchCard";

function TournamentBracket({
  tournament,
  canManage = false,
  onEnterScore,
  onMatchAdminAction,
  onPrepareCorrection,
  onApplyCorrection,
  correctionSaving = false,
}) {
  const matches =
    tournament?.matches ?? [];

  const preliminary =
    matches.find(
      (match) =>
        match.roundCode ===
        "preliminary",
    ) ?? null;

  const semiFinals =
    matches
      .filter(
        (match) =>
          match.roundCode ===
          "semi_final",
      )
      .sort(
        (matchA, matchB) =>
          Number(
            matchA.position ?? 0,
          ) -
          Number(
            matchB.position ?? 0,
          ),
      );

  const finalMatch =
    matches.find(
      (match) =>
        match.roundCode ===
        "final",
    ) ?? null;

  const matchProps = {
    canManage,
    onEnterScore,
    onMatchAdminAction,
    onPrepareCorrection,
    onApplyCorrection,
    correctionSaving,
  };

  return (
    <div className="tournament-bracket">
      <div className="tournament-bracket__round">
        <h4>
          Préliminaire
        </h4>

        {preliminary ? (
          <TournamentMatchCard
            match={preliminary}
            {...matchProps}
          />
        ) : (
          <div className="bracket-match bracket-match--placeholder">
            Aucun match préliminaire
          </div>
        )}
      </div>

      <div className="tournament-bracket__connector tournament-bracket__connector--one" />

      <div className="tournament-bracket__round tournament-bracket__round--semis">
        <h4>
          Demi-finales
        </h4>

        {semiFinals.map(
          (match) => (
            <TournamentMatchCard
              key={match.id}
              match={match}
              {...matchProps}
            />
          ),
        )}
      </div>

      <div className="tournament-bracket__connector tournament-bracket__connector--two" />

      <div className="tournament-bracket__round tournament-bracket__round--final">
        <h4>
          Finale
        </h4>

        {finalMatch ? (
          <TournamentMatchCard
            match={finalMatch}
            {...matchProps}
          />
        ) : (
          <div className="bracket-match bracket-match--placeholder">
            Finale en attente
          </div>
        )}

        {tournament?.winner && (
          <div className="tournament-champion tournament-champion--animated">
            <div className="tournament-champion__glow" />

            <Trophy size={38} />

            <span>
              Champion du tournoi
            </span>

            <strong>
              {tournament.winner
                .nickname ??
                "Champion"}
            </strong>

            <small>
              Félicitations pour cette victoire
            </small>
          </div>
        )}
      </div>
    </div>
  );
}

export default TournamentBracket;
