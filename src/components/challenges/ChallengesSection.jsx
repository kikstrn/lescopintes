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

import ChallengeEntryModal from "../../v2/features/challenges/ChallengeEntryModal";
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
  other: Flame,
  bar: Trophy,
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

  if (
    Array.isArray(players) &&
    players.length > 0
  ) {
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

function getEntryMemberName(entry) {
  return (
    entry?.profile?.nickname ??
    entry?.profile?.first_name ??
    entry?.profile?.firstName ??
    "Membre"
  );
}

function getEntryInitials(entry) {
  const name =
    getEntryMemberName(entry);

  return (
    entry?.profile?.initials ??
    name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  );
}

function EntryProof({ entry }) {
  if (!entry?.proofUrl) {
    return null;
  }

  return (
    <button
      type="button"
      className="challenge-entry-card__proof-image"
      onClick={() =>
        window.open(
          entry.proofUrl,
          "_blank",
          "noopener,noreferrer",
        )
      }
    >
      <img
        src={entry.proofUrl}
        alt={`Preuve envoyée par ${getEntryMemberName(
          entry,
        )}`}
        loading="lazy"
      />

      <span>
        Voir la preuve en grand
      </span>
    </button>
  );
}

function ChallengeEntryCard({
  entry,
  saving = false,
  showActions = false,
  onValidate,
  onReject,
}) {
  return (
    <article className="challenge-entry-card">
      <div className="challenge-entry-card__member">
        <span className="challenge-entry-card__avatar">
          {entry.profile?.avatar_url ? (
            <img
              src={
                entry.profile.avatar_url
              }
              alt=""
            />
          ) : (
            getEntryInitials(entry)
          )}
        </span>

        <div>
          <strong>
            {getEntryMemberName(entry)}
          </strong>

          <small>
            Progression :{" "}
            {Number(
              entry.progressValue ?? 0,
            ).toLocaleString(
              "fr-FR",
            )}
          </small>

          {entry.status ===
            "validated" && (
              <small>
                Points attribués :{" "}
                {Number(
                  entry.pointsAwarded ?? 0,
                ).toLocaleString(
                  "fr-FR",
                )}
              </small>
            )}
        </div>
      </div>

      {entry.proofText && (
        <p className="challenge-entry-card__proof">
          {entry.proofText}
        </p>
      )}

      <EntryProof entry={entry} />

      {showActions && (
        <div className="challenge-entry-card__actions">
          <button
            type="button"
            className="secondary-button challenge-entry-card__reject"
            disabled={saving}
            onClick={() =>
              onReject?.(entry)
            }
          >
            Refuser
          </button>

          <button
            type="button"
            className="primary-button"
            disabled={saving}
            onClick={() =>
              onValidate?.(entry)
            }
          >
            Valider
          </button>
        </div>
      )}
    </article>
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

  currentChallengeEntry = null,
  pendingChallengeEntries = [],
  validatedChallengeEntries = [],

  challengeEntriesLoading = false,
  challengeEntriesSaving = false,
  challengeEntriesError = null,

  submitChallengeEntry,
  validateChallengeEntry,
  rejectChallengeEntry,

  isAdmin = false,
  currentProfileId = null,
}) {
  const [modalOpen, setModalOpen] =
    useState(false);

  const [
    entryModalOpen,
    setEntryModalOpen,
  ] = useState(false);

  const challengeType =
    activeChallenge?.challenge_type ??
    activeChallenge?.category ??
    null;

  const leaderboard = useMemo(() => {
    if (!activeChallenge) {
      return [];
    }

    return members
      .map((member) => {
        const memberId = String(
          member?.id ?? "",
        );

        const validatedEntry =
          validatedChallengeEntries.find(
            (entry) =>
              String(entry.profileId) ===
              memberId &&
              entry.status ===
              "validated",
          );

        return {
          ...member,
          value: Number(
            validatedEntry?.pointsAwarded ??
            0,
          ),
        };
      })
      .sort((memberA, memberB) => {
        const difference =
          memberB.value -
          memberA.value;

        if (difference !== 0) {
          return difference;
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
        );
      });
  }, [
    activeChallenge,
    members,
    validatedChallengeEntries,
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

  const handleValidateEntry =
    async (entry) => {
      if (
        typeof validateChallengeEntry !==
        "function"
      ) {
        return;
      }

      const rewardPoints =
        Number(
          activeChallenge?.points_reward,
        ) > 0
          ? Number(
            activeChallenge.points_reward,
          )
          : Number(
            activeChallenge?.reward ?? 0,
          );

      await validateChallengeEntry({
        entryId: entry.id,
        validatorId:
          currentProfileId,
        pointsAwarded: Number.isFinite(rewardPoints)
          ? rewardPoints
          : 0,
      });
    };

  const handleRejectEntry =
    async (entry) => {
      if (
        typeof rejectChallengeEntry !==
        "function"
      ) {
        return;
      }

      const reason =
        window.prompt(
          "Indique la raison du refus :",
          "",
        );

      if (reason === null) {
        return;
      }

      await rejectChallengeEntry({
        entryId: entry.id,
        validatorId:
          currentProfileId,
        reason,
      });
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

            <button
              type="button"
              className="primary-button challenge-progress__participate"
              disabled={
                challengeEntriesLoading ||
                challengeEntriesSaving ||
                currentChallengeEntry
                  ?.status ===
                "validated"
              }
              onClick={() =>
                setEntryModalOpen(true)
              }
            >
              {currentChallengeEntry
                ?.status ===
                "validated"
                ? "Participation validée"
                : currentChallengeEntry
                  ? "Modifier ma participation"
                  : "Participer au défi"}
            </button>

            {currentChallengeEntry
              ?.status ===
              "submitted" && (
                <p className="challenge-entry-status challenge-entry-status--pending">
                  Ta participation attend la
                  validation d’un administrateur.
                </p>
              )}

            {currentChallengeEntry
              ?.status ===
              "rejected" && (
                <p className="challenge-entry-status challenge-entry-status--rejected">
                  Participation refusée
                  {currentChallengeEntry
                    .rejectionReason
                    ? ` : ${currentChallengeEntry.rejectionReason}`
                    : "."}
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

          {isAdmin && (
            <section className="challenge-admin glass-panel">
              <header className="challenge-admin__header">
                <div>
                  <span className="section-heading__eyebrow">
                    Administration
                  </span>

                  <h2>
                    Participations à valider
                  </h2>
                </div>

                <span className="challenge-admin__count">
                  {
                    pendingChallengeEntries.length
                  }
                </span>
              </header>

              {challengeEntriesLoading ? (
                <div className="challenge-admin__state">
                  Chargement des participations…
                </div>
              ) : challengeEntriesError ? (
                <div className="challenge-admin__state challenge-admin__state--error">
                  {challengeEntriesError}
                </div>
              ) : pendingChallengeEntries.length ===
                0 ? (
                <div className="challenge-admin__state">
                  Aucune participation en attente.
                </div>
              ) : (
                <div className="challenge-admin__list">
                  {pendingChallengeEntries.map(
                    (entry) => (
                      <ChallengeEntryCard
                        key={entry.id}
                        entry={entry}
                        saving={
                          challengeEntriesSaving
                        }
                        showActions
                        onValidate={
                          handleValidateEntry
                        }
                        onReject={
                          handleRejectEntry
                        }
                      />
                    ),
                  )}
                </div>
              )}
            </section>
          )}

          {isAdmin &&
            validatedChallengeEntries.length >
            0 && (
              <section className="challenge-admin glass-panel">
                <header className="challenge-admin__header">
                  <div>
                    <span className="section-heading__eyebrow">
                      Historique
                    </span>

                    <h2>
                      Participations validées
                    </h2>
                  </div>

                  <span className="challenge-admin__count">
                    {
                      validatedChallengeEntries.length
                    }
                  </span>
                </header>

                <div className="challenge-admin__list">
                  {validatedChallengeEntries.map(
                    (entry) => (
                      <ChallengeEntryCard
                        key={entry.id}
                        entry={entry}
                      />
                    ),
                  )}
                </div>
              </section>
            )}
        </section>
      )}

      <ChallengeEntryModal
        open={entryModalOpen}
        challenge={activeChallenge}
        currentEntry={
          currentChallengeEntry
        }
        saving={
          challengeEntriesSaving
        }
        onClose={() =>
          setEntryModalOpen(false)
        }
        onSubmit={
          submitChallengeEntry
        }
      />

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
