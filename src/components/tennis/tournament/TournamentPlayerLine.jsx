import {
  Trophy,
} from "lucide-react";

function TournamentPlayerLine({
  player,
  isWinner = false,
  placeholder =
    "En attente du vainqueur",
}) {
  if (!player) {
    return (
      <div className="bracket-player bracket-player--empty">
        <span>?</span>

        <small>
          {placeholder}
        </small>
      </div>
    );
  }

  return (
    <div
      className={
        isWinner
          ? "bracket-player bracket-player--winner"
          : "bracket-player"
      }
    >
      <span className="bracket-player__avatar">
        {player.avatarUrl ? (
          <img
            src={player.avatarUrl}
            alt=""
          />
        ) : (
          player.initials ??
          player.nickname
            ?.slice(0, 2)
            .toUpperCase() ??
          "CP"
        )}
      </span>

      <span className="bracket-player__identity">
        <strong>
          {player.nickname ??
            "Membre"}
        </strong>

        <small>
          ELO{" "}
          {Number(
            player.elo ?? 1500,
          )}
        </small>
      </span>

      {isWinner && (
        <Trophy size={15} />
      )}
    </div>
  );
}

export default TournamentPlayerLine;
