import {
  useMemo,
  useState,
} from "react";

import {
  Bike,
  CalendarDays,
  CheckCircle2,
  Flame,
  Gavel,
  Images,
  Medal,
  Trophy,
} from "lucide-react";

import CreateChallengeModal from "./CreateChallengeModal";

const challengeIcons = {
  bike_distance: Bike,
  bike_rides: Bike,
  tennis_matches: Trophy,
  tennis_wins: Medal,
  events: CalendarDays,
  gallery_uploads: Images,
  tribunal_votes: Gavel,
  gages_completed: CheckCircle2,
  points: Flame,
};

function getMemberId(member) {
  return String(member?.id ?? "");
}

function getRideProfileId(ride) {
  return String(
    ride?.profileId ??
      ride?.profile_id ??
      ride?.createdBy ??
      ride?.created_by ??
      "",
  );
}

function getRideDistance(ride) {
  return Number(
    ride?.distanceKm ??
      ride?.distance_km ??
      ride?.distance ??
      0,
  );
}

function getMatchPlayers(match) {
  const players =
    match?.players ??
    match?.matchPlayers ??
    match?.match_players ??
    [];

  if (Array.isArray(players) && players.length > 0) {
    return players.map((player) =>
      String(
        player?.profileId ??
          player?.profile_id ??
          player?.memberId ??
          player?.member_id ??
          player?.id ??
          "",
      ),
    );
  }

  return [
    match?.player1Id ??
      match?.player1_id,
    match?.player2Id ??
      match?.player2_id,
    match?.player3Id ??
      match?.player3_id,
    match?.player4Id ??
      match?.player4_id,
  ]
    .filter(Boolean)
    .map(String);
}

function getEventParticipants(event) {
  const participants =
    event?.participants ??
    event?.eventParticipants ??
    event?.event_participants ??
    [];

  return Array.isArray(participants)
    ? participants
    : [];
}

function getParticipantProfileId(participant) {
  return String(
    participant?.profileId ??
      participant?.profile_id ??
      participant?.memberId ??
      participant?.member_id ??
      participant?.userId ??
      participant?.user_id ??
      participant?.id ??
      "",
  );
}

function getGageAssignedProfileId(gage) {
  return String(
    gage?.assignedProfileId ??
      gage?.assigned_profile_id ??
      gage?.assignedProfile?.id ??
      "",
  );
}

function getPhotoProfileId(photo) {
  return String(
    photo?.profileId ??
      photo?.profile_id ??
      photo?.uploadedBy ??
      photo?.uploaded_by ??
      photo?.createdBy ??
      photo?.created_by ??
      "",
  );
}

function getTribunalVotes(tribunalCase) {
  const votes =
    tribunalCase?.votes ??
    tribunalCase?.tribunalVotes ??
    tribunalCase?.tribunal_votes ??
    [];

  return Array.isArray(votes)
    ? votes
    : [];
}

function getVoteProfileId(vote) {
  return String(
    vote?.profileId ??
      vote?.profile_id ??
      vote?.userId ??
      vote?.user_id ??
      "",
  );
}

function ChallengesSection({
  activeChallenge = null,
  challenges = [],
  createChallenge,
  updateChallenge,
  archiveChallenge,

  members = [],
  bikeRides = [],
  tennisMatches = [],
  events = [],
  tribunalCases = [],
  gages = [],
  galleryPhotos = [],

  isAdmin = false,
  currentProfileId = null,
}) {
  const [modalOpen, setModalOpen] =
    useState(false);

  const challengeType =
    activeChallenge?.challenge_type ??
    activeChallenge?.category ??
    null;

  const leaderboard = useMemo(() => {
    if (!activeChallenge || !challengeType) {
      return [];
    }

    return members
      .map((member) => {
        const memberId =
          getMemberId(member);

        let value = 0;

        switch (challengeType) {
          case "bike_distance":
            value = bikeRides
              .filter(
                (ride) =>
                  getRideProfileId(ride) ===
                  memberId,
              )
              .reduce(
                (sum, ride) =>
                  sum +
                  getRideDistance(ride),
                0,
              );
            break;

          case "bike_rides":
            value = bikeRides.filter(
              (ride) =>
                getRideProfileId(ride) ===
                memberId,
            ).length;
            break;

          case "tennis_matches":
            value = tennisMatches.filter(
              (match) =>
                getMatchPlayers(match).includes(
                  memberId,
                ),
            ).length;
            break;

          case "tennis_wins":
            value = Number(
              member?.tennisWins ??
                member?.wins ??
                0,
            );
            break;

          case "events":
            value = events.filter((event) =>
              getEventParticipants(event).some(
                (participant) =>
                  getParticipantProfileId(
                    participant,
                  ) === memberId,
              ),
            ).length;
            break;

          case "gallery_uploads":
            value = galleryPhotos.filter(
              (photo) =>
                getPhotoProfileId(photo) ===
                memberId,
            ).length;
            break;

          case "tribunal_votes":
            value = tribunalCases.reduce(
              (total, tribunalCase) =>
                total +
                getTribunalVotes(
                  tribunalCase,
                ).filter(
                  (vote) =>
                    getVoteProfileId(vote) ===
                    memberId,
                ).length,
              0,
            );
            break;

          case "gages_completed":
            value = gages.filter(
              (gage) =>
                getGageAssignedProfileId(
                  gage,
                ) === memberId &&
                [
                  "completed",
                  "validated",
                ].includes(gage?.status),
            ).length;
            break;

          case "points":
            value = Number(
              member?.calculatedPoints ??
                member?.totalPoints ??
                member?.points ??
                0,
            );
            break;

          default:
            value = 0;
        }

        return {
          ...member,
          value:
            Math.round(value * 10) / 10,
        };
      })
      .sort((memberA, memberB) => {
        const valueDifference =
          memberB.value -
          memberA.value;

        if (valueDifference !== 0) {
          return valueDifference;
        }

        return String(
          memberA?.nickname ??
            memberA?.firstName ??
            "",
        ).localeCompare(
          String(
            memberB?.nickname ??
              memberB?.firstName ??
              "",
          ),
          "fr",
          {
            sensitivity: "base",
          },
        );
      });
  }, [
    activeChallenge,
    challengeType,
    members,
    bikeRides,
    tennisMatches,
    events,
    tribunalCases,
    gages,
    galleryPhotos,
  ]);

  const Icon =
    challengeIcons[challengeType] ??
    Flame;

  const handleCreateChallenge =
    async (challengeData) => {
      if (
        typeof createChallenge !==
        "function"
      ) {
        console.error(
          "ChallengesSection : createChallenge est absente.",
        );

        return;
      }

      await createChallenge(
        challengeData,
      );

      setModalOpen(false);
    };

  return (
    <>
      <div className="challenge-header">
        <div>
          <span className="section-heading__eyebrow">
            Saison des Co’Pintes
          </span>

          <h1>
            Défis hebdomadaires
          </h1>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="primary-button"
            onClick={() =>
              setModalOpen(true)
            }
          >
            Nouveau défi
          </button>
        )}
      </div>

      {!activeChallenge ? (
        <section className="challenge-empty glass-panel">
          <div className="challenge-empty__icon">
            <Flame size={30} />
          </div>

          <div>
            <h2>
              Aucun défi actif
            </h2>

            <p>
              Crée le premier défi
              hebdomadaire depuis le
              bouton ci-dessus.
            </p>
          </div>
        </section>
      ) : (
        <section className="challenge-page">
          <div className="challenge-hero glass-panel">
            <div className="challenge-icon">
              <Icon size={42} />
            </div>

            <div>
              <span className="section-heading__eyebrow">
                Défi actif
              </span>

              <h2>
                {activeChallenge.title}
              </h2>

              {activeChallenge.description && (
                <p>
                  {
                    activeChallenge.description
                  }
                </p>
              )}
            </div>
          </div>

          <div className="challenge-progress glass-panel">
            <span>
              Objectif
            </span>

            <strong>
              {Number(
                activeChallenge.target_value ??
                  0,
              ).toLocaleString(
                "fr-FR",
              )}
            </strong>

            {activeChallenge.reward && (
              <p>
                Récompense :{" "}
                {activeChallenge.reward}
              </p>
            )}
          </div>

          <div className="challenge-leaderboard glass-panel">
            <div className="challenge-leaderboard__header">
              <div>
                <span className="section-heading__eyebrow">
                  Progression
                </span>

                <h2>
                  Classement
                </h2>
              </div>
            </div>

            {leaderboard.length === 0 ? (
              <p>
                Aucune progression
                disponible.
              </p>
            ) : (
              <div className="challenge-leaderboard__list">
                {leaderboard.map(
                  (member, index) => (
                    <div
                      key={member.id}
                      className="challenge-member"
                    >
                      <span className="challenge-member__position">
                        #{index + 1}
                      </span>

                      <div className="challenge-member__identity">
                        <strong>
                          {member.nickname ??
                            member.firstName ??
                            "Membre"}
                        </strong>

                        <small>
                          {member.role ===
                          "admin"
                            ? "Administrateur"
                            : "Membre"}
                        </small>
                      </div>

                      <strong className="challenge-member__value">
                        {Number(
                          member.value ?? 0,
                        ).toLocaleString(
                          "fr-FR",
                          {
                            maximumFractionDigits: 1,
                          },
                        )}
                      </strong>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          <div className="challenge-history glass-panel">
            <div>
              <span className="section-heading__eyebrow">
                Archives
              </span>

              <h2>
                Historique
              </h2>
            </div>

            {challenges.filter(
              (challenge) =>
                challenge.id !==
                activeChallenge.id,
            ).length === 0 ? (
              <p>
                Aucun ancien défi.
              </p>
            ) : (
              challenges
                .filter(
                  (challenge) =>
                    challenge.id !==
                    activeChallenge.id,
                )
                .map((challenge) => (
                  <article
                    key={challenge.id}
                    className="challenge-history__item"
                  >
                    <strong>
                      {challenge.title}
                    </strong>

                    <small>
                      {challenge.status ??
                        "archived"}
                    </small>
                  </article>
                ))
            )}
          </div>
        </section>
      )}

      <CreateChallengeModal
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        onCreate={
          handleCreateChallenge
        }
        currentProfileId={
          currentProfileId
        }
      />
    </>
  );
}

export default ChallengesSection;