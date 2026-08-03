import {
  Activity,
  Crown,
  Medal,
  Target,
  Trophy,
  UsersRound,
} from "lucide-react";

function getProfileName(
  profile,
) {
  return (
    profile?.nickname ??
    profile?.firstName ??
    "Membre"
  );
}

function buildTournamentStats(
  tournament,
) {
  const players =
    tournament?.players ?? [];

  const matches =
    tournament?.matches ?? [];

  const playerMap =
    new Map();

  for (const player of players) {
    const profileId =
      player.profileId ??
      player.profile?.id;

    if (!profileId) {
      continue;
    }

    playerMap.set(
      String(profileId),
      {
        id: profileId,

        name:
          getProfileName(
            player.profile,
          ),

        avatarUrl:
          player.profile
            ?.avatarUrl ??
          null,

        initials:
          player.profile
            ?.initials ??
          "CP",

        seed:
          Number(
            player.seed ?? 0,
          ),

        startingElo:
          Number(
            player.startingElo ??
            player.profile?.elo ??
            1500,
          ),

        wins: 0,
        losses: 0,
        played: 0,
      },
    );
  }

  let completedMatches = 0;

  for (const match of matches) {
    if (
      match.status !==
        "completed" ||
      !match.winnerId
    ) {
      continue;
    }

    completedMatches += 1;

    const winner =
      playerMap.get(
        String(
          match.winnerId,
        ),
      );

    const loser =
      playerMap.get(
        String(
          match.loserId,
        ),
      );

    if (winner) {
      winner.wins += 1;
      winner.played += 1;
    }

    if (loser) {
      loser.losses += 1;
      loser.played += 1;
    }
  }

  const ranking =
    [...playerMap.values()]
      .sort(
        (playerA, playerB) =>
          playerB.wins -
            playerA.wins ||
          playerA.losses -
            playerB.losses ||
          playerA.seed -
            playerB.seed,
      );

  const mvp =
    ranking.find(
      (player) =>
        player.wins > 0,
    ) ?? null;

  const totalMatches =
    matches.length;

  return {
    ranking,
    mvp,
    completedMatches,
    totalMatches,

    completionRate:
      totalMatches > 0
        ? Math.round(
            (
              completedMatches /
              totalMatches
            ) * 100,
          )
        : 0,

    activePlayers:
      ranking.filter(
        (player) =>
          player.played > 0,
      ).length,
  };
}

function StatCard({
  icon: Icon,
  value,
  label,
}) {
  return (
    <article className="tournament-stat-card">
      <span className="tournament-stat-card__icon">
        <Icon size={18} />
      </span>

      <div>
        <strong>
          {value}
        </strong>

        <span>
          {label}
        </span>
      </div>
    </article>
  );
}

function TennisTournamentStatistics({
  tournament,
}) {
  const stats =
    buildTournamentStats(
      tournament,
    );

  return (
    <section className="tournament-statistics">
      <header className="tournament-statistics__heading">
        <div>
          <span className="section-heading__eyebrow">
            Analyse
          </span>

          <h3>
            Statistiques du tournoi
          </h3>
        </div>

        <Trophy size={22} />
      </header>

      <div className="tournament-statistics__cards">
        <StatCard
          icon={Activity}
          value={
            `${stats.completionRate}%`
          }
          label="Progression"
        />

        <StatCard
          icon={Target}
          value={
            stats.completedMatches
          }
          label="Matchs terminés"
        />

        <StatCard
          icon={UsersRound}
          value={
            stats.activePlayers
          }
          label="Joueurs actifs"
        />

        <StatCard
          icon={Crown}
          value={
            stats.mvp?.name ??
            "—"
          }
          label="Meilleur parcours"
        />
      </div>

      <div className="tournament-statistics__ranking">
        <header>
          <strong>
            Classement du tournoi
          </strong>

          <span>
            Victoires / défaites
          </span>
        </header>

        <div>
          {stats.ranking.map(
            (
              player,
              index,
            ) => (
              <article
                key={player.id}
                className="tournament-statistics-player"
              >
                <span className="tournament-statistics-player__rank">
                  {index < 3 ? (
                    <Medal
                      size={16}
                    />
                  ) : (
                    index + 1
                  )}
                </span>

                <span className="tournament-statistics-player__avatar">
                  {player.avatarUrl ? (
                    <img
                      src={
                        player.avatarUrl
                      }
                      alt=""
                    />
                  ) : (
                    player.initials
                  )}
                </span>

                <span className="tournament-statistics-player__identity">
                  <strong>
                    {player.name}
                  </strong>

                  <small>
                    Tête de série #
                    {player.seed || "—"}
                  </small>
                </span>

                <span className="tournament-statistics-player__record">
                  <strong>
                    {player.wins}
                  </strong>

                  <small>
                    victoire(s)
                  </small>
                </span>

                <span className="tournament-statistics-player__record tournament-statistics-player__record--losses">
                  <strong>
                    {player.losses}
                  </strong>

                  <small>
                    défaite(s)
                  </small>
                </span>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

export default TennisTournamentStatistics;
