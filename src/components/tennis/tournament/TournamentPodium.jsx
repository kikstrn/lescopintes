import {
  Crown,
  Medal,
  Trophy,
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

function getFinalists(
  tournament,
) {
  const finalMatch =
    tournament?.matches?.find(
      (match) =>
        match.roundCode ===
        "final",
    );

  if (!finalMatch) {
    return {
      champion: null,
      finalist: null,
    };
  }

  const champion =
    tournament?.winner ??
    finalMatch.winner ??
    null;

  const finalist =
    finalMatch.loserId
      ? [
          finalMatch.playerOne,
          finalMatch.playerTwo,
        ].find(
          (profile) =>
            String(profile?.id) ===
            String(
              finalMatch.loserId,
            ),
        ) ?? null
      : null;

  return {
    champion,
    finalist,
  };
}

function PodiumPlayer({
  profile,
  place,
  label,
}) {
  const Icon =
    place === 1
      ? Crown
      : Medal;

  return (
    <article
      className={[
        "tournament-podium-player",
        `tournament-podium-player--${place}`,
      ].join(" ")}
    >
      <span className="tournament-podium-player__place">
        <Icon size={20} />
        #{place}
      </span>

      <span className="tournament-podium-player__avatar">
        {profile?.avatarUrl ? (
          <img
            src={
              profile.avatarUrl
            }
            alt=""
          />
        ) : (
          profile?.initials ??
          "CP"
        )}
      </span>

      <strong>
        {profile
          ? getProfileName(profile)
          : "À déterminer"}
      </strong>

      <small>
        {label}
      </small>
    </article>
  );
}

function TournamentPodium({
  tournament,
}) {
  const {
    champion,
    finalist,
  } = getFinalists(
    tournament,
  );

  if (
    tournament?.status !==
      "completed" &&
    !champion
  ) {
    return null;
  }

  return (
    <section className="tournament-podium">
      <header>
        <span className="section-heading__eyebrow">
          Palmarès
        </span>

        <h3>
          Podium du tournoi
        </h3>

        <Trophy size={24} />
      </header>

      <div className="tournament-podium__players">
        <PodiumPlayer
          profile={champion}
          place={1}
          label="Champion"
        />

        <PodiumPlayer
          profile={finalist}
          place={2}
          label="Finaliste"
        />
      </div>
    </section>
  );
}

export default TournamentPodium;
