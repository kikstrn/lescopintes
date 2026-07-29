import {
  Bike,
  CalendarDays,
  Medal,
  Trophy,
} from "lucide-react";

import HeroBanner from "../../../components/HeroBanner";
import StatCard from "../../../components/StatCard";
import EventCard from "../../../components/EventCard";
import Podium from "../../../components/Podium";
import ActivityChart from "../../../components/ActivityChart";
import ActivityFeed from "../../../components/ActivityFeed";

import { useAuth } from "../../../context/AuthContext";
import { useAppData } from "../../context/AppDataContext";
import { useNavigation } from "../../context/NavigationContext";

import {
  getMemberName,
  getMemberWins,
  useHomeDashboard,
} from "./useHomeDashboard";

function HomePage() {
  const {
    user,
    profile,
  } = useAuth();

  const {
    members = [],
    events = [],
    tennisMatches = [],
    bikeRides = [],
    gages = [],
    tribunalCases = [],
    activeChallenge = null,

    openCreateEvent,
    openScoreModal,
  } = useAppData();

  const {
    navigateTo,
  } = useNavigation();

  const {
    sortedMembers,
    leader,

    connectedMember,
    connectedPoints,
    connectedRanking,

    totalMatches,
    totalBikeKm,

    upcomingEvents,
    activityData,
    chartSummary,
    recentActivities,
  } = useHomeDashboard({
    members,
    profile,
    user,
    events,
    tennisMatches,
    bikeRides,
    gages,
    tribunalCases,
  });

  const nickname =
    profile?.nickname ??
    user?.email?.split("@")[0] ??
    "Membre";

  const memberWins =
    getMemberWins(
      connectedMember,
    );

  return (
    <>
      <HeroBanner
        nickname={nickname}
        memberCount={members.length}
        eventCount={events.length}
        matchCount={totalMatches}
        leaderName={
          leader
            ? getMemberName(leader)
            : null
        }
        currentChallenge={
          activeChallenge
        }
        onCreateEvent={
          openCreateEvent
        }
        onAddScore={
          openScoreModal
        }
        onOpenMembers={() =>
          navigateTo("members")
        }
      />

      <section className="stats-grid">
        <StatCard
          icon={Trophy}
          label="Matchs joués"
          value={totalMatches}
          detail={`${memberWins} victoire${
            memberWins > 1 ? "s" : ""
          } pour toi`}
          accent="green"
        />

        <StatCard
          icon={Bike}
          label="Kilomètres vélo"
          value={Math.round(
            totalBikeKm,
          ).toLocaleString(
            "fr-FR",
          )}
          detail={`${bikeRides.length} sortie${
            bikeRides.length > 1
              ? "s"
              : ""
          } enregistrée${
            bikeRides.length > 1
              ? "s"
              : ""
          }`}
          accent="blue"
        />

        <StatCard
          icon={CalendarDays}
          label="Événements"
          value={events.length}
          detail={`${upcomingEvents.length} à venir`}
          accent="amber"
        />

        <StatCard
          icon={Medal}
          label={`Points de ${nickname}`}
          value={connectedPoints}
          detail={
            connectedRanking
              ? `${connectedRanking}${
                  connectedRanking === 1
                    ? "er"
                    : "e"
                } sur ${members.length}`
              : "Non classé"
          }
          accent="purple"
        />
      </section>

      <section className="dashboard-grid dashboard-grid--main">
        <div className="dashboard-column dashboard-column--wide">
          <section className="section-block">
            <div className="section-heading">
              <div>
                <span className="section-heading__eyebrow">
                  Agenda
                </span>

                <h2>
                  Prochains événements
                </h2>
              </div>

              <button
                type="button"
                className="text-button"
                onClick={() =>
                  navigateTo("events")
                }
              >
                Tout afficher
              </button>
            </div>

            <div className="events-grid">
              {upcomingEvents
                .slice(0, 3)
                .map(
                  (event, index) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      index={index}
                    />
                  ),
                )}

              {upcomingEvents.length === 0 && (
                <div className="home-empty-state glass-panel">
                  <CalendarDays size={24} />

                  <div>
                    <strong>
                      Aucun événement à venir
                    </strong>

                    <p>
                      Crée un événement pour
                      l’afficher sur l’accueil.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <div>
                <span className="section-heading__eyebrow">
                  Performances
                </span>

                <h2>
                  Activité du groupe
                </h2>
              </div>
            </div>

            <ActivityChart
              data={activityData}
              summary={chartSummary}
            />
          </section>
        </div>

        <aside className="dashboard-column dashboard-column--side">
          <Podium
            members={sortedMembers}
          />

          <ActivityFeed
            activities={
              recentActivities
            }
            onOpenActivity={(
              activity,
            ) =>
              navigateTo(
                activity.page ??
                  "home",
              )
            }
          />
        </aside>
      </section>
    </>
  );
}

export default HomePage;