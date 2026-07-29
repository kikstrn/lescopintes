import { useMemo, useState } from "react";
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

const [modalOpen, setModalOpen] =
    useState(false);

function ChallengesSection({
    activeChallenge,
    challenges,
    createChallenge,
    members,
    bikeRides,
    tennisMatches,
    events,
    tribunalCases,
    gages,
}) {
    const leaderboard = useMemo(() => {
        if (!activeChallenge) return [];

        return members
            .map((member) => {
                let value = 0;

                switch (activeChallenge.challenge_type) {
                    case "bike_distance":
                        value = bikeRides
                            .filter(
                                (ride) =>
                                    ride.profile_id === member.id,
                            )
                            .reduce(
                                (sum, ride) =>
                                    sum +
                                    Number(
                                        ride.distance_km ?? 0,
                                    ),
                                0,
                            );
                        break;

                    case "bike_rides":
                        value = bikeRides.filter(
                            (ride) =>
                                ride.profile_id === member.id,
                        ).length;
                        break;

                    case "tennis_matches":
                        value = tennisMatches.filter(
                            (match) =>
                                match.player1_id ===
                                member.id ||
                                match.player2_id ===
                                member.id ||
                                match.player3_id ===
                                member.id ||
                                match.player4_id ===
                                member.id,
                        ).length;
                        break;

                    case "tennis_wins":
                        value =
                            member.tennisWins ?? 0;
                        break;

                    case "events":
                        value = events.filter(
                            (event) =>
                                event.creator_id ===
                                member.id,
                        ).length;
                        break;

                    case "gages_completed":
                        value = gages.filter(
                            (gage) =>
                                gage.assigned_profile_id ===
                                member.id &&
                                gage.status ===
                                "validated",
                        ).length;
                        break;

                    case "points":
                        value =
                            member.calculatedPoints ??
                            0;
                        break;

                    default:
                        value = 0;
                }

                return {
                    ...member,
                    value,
                };
            })
            .sort(
                (a, b) => b.value - a.value,
            );
    }, [
        activeChallenge,
        members,
        bikeRides,
        tennisMatches,
        events,
        tribunalCases,
        gages,
    ]);

    if (!activeChallenge) {
        return (
            <section className="glass-panel">
                <h2>Aucun défi actif</h2>

                <p>
                    Crée ton premier défi
                    hebdomadaire.
                </p>
            </section>
        );
    }

    const Icon =
        challengeIcons[
        activeChallenge.challenge_type
        ] ?? Flame;

    return (
        <>
            <div className="challenge-header">

                <h1>
                    Défis hebdomadaires
                </h1>

                <button
                    className="primary-button"
                    onClick={() =>
                        setModalOpen(true)
                    }
                >
                    + Nouveau défi
                </button>

            </div>
            <section className="challenge-page">

                <div className="challenge-hero glass-panel">

                    <div className="challenge-icon">
                        <Icon size={42} />
                    </div>

                    <div>

                        <h1>
                            {activeChallenge.title}
                        </h1>

                        <p>
                            {
                                activeChallenge.description
                            }
                        </p>

                    </div>

                </div>

                <div className="challenge-progress glass-panel">

                    <h3>
                        Objectif
                    </h3>

                    <strong>
                        {
                            activeChallenge.target_value
                        }
                    </strong>

                </div>

                <div className="challenge-leaderboard glass-panel">

                    <h2>
                        Classement
                    </h2>

                    {leaderboard.map(
                        (
                            member,
                            index,
                        ) => (
                            <div
                                key={member.id}
                                className="challenge-member"
                            >

                                <span>
                                    #{index + 1}
                                </span>

                                <strong>
                                    {
                                        member.nickname
                                    }
                                </strong>

                                <span>
                                    {member.value}
                                </span>

                            </div>
                        ),
                    )}

                </div>

                <div className="challenge-history glass-panel">

                    <h2>
                        Historique
                    </h2>

                    {challenges
                        .filter(
                            (c) =>
                                c.status !==
                                "active",
                        )
                        .map(
                            (
                                challenge,
                            ) => (
                                <div
                                    key={
                                        challenge.id
                                    }
                                >

                                    <strong>
                                        {
                                            challenge.title
                                        }
                                    </strong>

                                    <small>
                                        {
                                            challenge.status
                                        }
                                    </small>

                                </div>
                            ),
                        )}

                </div>

            </section>
            <CreateChallengeModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onCreate={createChallenge}
            />
        </>
    );
}

export default ChallengesSection;