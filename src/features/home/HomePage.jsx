import { motion } from "framer-motion";
import {
  Bike,
  CalendarDays,
  ChevronRight,
  Clock3,
  Dices,
  MapPin,
  Medal,
  Mountain,
  Plus,
  Route,
  Trophy,
} from "lucide-react";

import HeroBanner from "../../components/HeroBanner";
import StatCard from "../../components/StatCard";
import EventCard from "../../components/EventCard";
import Podium from "../../components/Podium";
import ActivityChart from "../../components/ActivityChart";
import ActivityFeed from "../../components/ActivityFeed";

function HomePage({
  connectedNickname,
  connectedMember,
  connectedPoints,
  connectedRanking,

  members = [],
  events = [],
  bikeRides = [],

  totalMatches = 0,
  totalBikeKm = 0,

  leader,
  sortedMembers = [],
  upcomingEvents = [],
  nextPlannedBikeRide = null,

  bikeLoading = false,

  homeActivityData = [],
  homeChartSummary = null,
  homeRecentActivities = [],

  activeChallenge = null,

  getMemberName,
  getMemberWins,
  formatBikeRideDate,
  formatBikeRideTime,
  formatBikeRideDuration,

  onNavigate,
  onCreateEvent,
  onAddScore,
  onCreateBikeRide,
}) {
  const memberWins =
    typeof getMemberWins === "function"
      ? getMemberWins(connectedMember)
      : Number(
          connectedMember?.tennisWins ??
            connectedMember?.wins ??
            0,
        );

  return (
    <>
      <HeroBanner
        nickname={connectedNickname}
        memberCount={members.length}
        eventCount={events.length}
        matchCount={totalMatches}
        leaderName={
          leader && typeof getMemberName === "function"
            ? getMemberName(leader)
            : leader?.nickname ?? null
        }
        currentChallenge={activeChallenge}
        onCreateEvent={onCreateEvent}
        onAddScore={onAddScore}
        onOpenMembers={() => onNavigate?.("members")}
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
          value={Math.round(totalBikeKm).toLocaleString(
            "fr-FR",
          )}
          detail={`${bikeRides.length} sortie${
            bikeRides.length > 1 ? "s" : ""
          } enregistrée${
            bikeRides.length > 1 ? "s" : ""
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
          label={`Points de ${connectedNickname}`}
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

                <h2>Prochains événements</h2>
              </div>

              <button
                type="button"
                className="text-button"
                onClick={() => onNavigate?.("events")}
              >
                Tout afficher
                <ChevronRight size={17} />
              </button>
            </div>

            <div className="events-grid">
              {upcomingEvents
                .slice(0, 3)
                .map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={index}
                  />
                ))}

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

          <section className="next-bike-ride glass-panel">
            <header className="next-bike-ride__header">
              <div>
                <span className="section-heading__eyebrow">
                  Cyclisme
                </span>

                <h2>Prochaine sortie vélo</h2>
              </div>

              <button
                type="button"
                className="text-button"
                onClick={() => onNavigate?.("bike")}
              >
                Voir les sorties
                <ChevronRight size={17} />
              </button>
            </header>

            {bikeLoading ? (
              <div className="next-bike-ride__state">
                <span className="data-status__spinner" />

                <p>
                  Chargement de la prochaine
                  sortie…
                </p>
              </div>
            ) : nextPlannedBikeRide ? (
              <motion.article
                key={nextPlannedBikeRide.id}
                className="next-bike-ride__content"
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
              >
                <div className="next-bike-ride__icon">
                  <Bike size={29} />
                </div>

                <div className="next-bike-ride__main">
                  <span className="next-bike-ride__badge">
                    Sortie prévue
                  </span>

                  <h3>
                    {nextPlannedBikeRide.title}
                  </h3>

                  {nextPlannedBikeRide.description && (
                    <p>
                      {
                        nextPlannedBikeRide.description
                      }
                    </p>
                  )}

                  <div className="next-bike-ride__meta">
                    <span>
                      <CalendarDays size={16} />

                      {formatBikeRideDate?.(
                        nextPlannedBikeRide.rideDate,
                      )}
                    </span>

                    <span>
                      <Clock3 size={16} />

                      {formatBikeRideTime?.(
                        nextPlannedBikeRide.rideDate,
                      )}
                    </span>

                    {nextPlannedBikeRide.location && (
                      <span>
                        <MapPin size={16} />
                        {
                          nextPlannedBikeRide.location
                        }
                      </span>
                    )}
                  </div>

                  <div className="next-bike-ride__metrics">
                    <div>
                      <Route size={17} />

                      <span>
                        <small>Distance</small>

                        <strong>
                          {Number(
                            nextPlannedBikeRide.distanceKm ??
                              nextPlannedBikeRide.distance_km ??
                              0,
                          ).toLocaleString(
                            "fr-FR",
                            {
                              maximumFractionDigits: 1,
                            },
                          )}{" "}
                          km
                        </strong>
                      </span>
                    </div>

                    <div>
                      <Mountain size={17} />

                      <span>
                        <small>Dénivelé</small>

                        <strong>
                          {Number(
                            nextPlannedBikeRide.elevationM ??
                              nextPlannedBikeRide.elevation_m ??
                              0,
                          ).toLocaleString(
                            "fr-FR",
                          )}{" "}
                          m
                        </strong>
                      </span>
                    </div>

                    {nextPlannedBikeRide.durationMinutes && (
                      <div>
                        <Clock3 size={17} />

                        <span>
                          <small>Durée</small>

                          <strong>
                            {formatBikeRideDuration?.(
                              nextPlannedBikeRide.durationMinutes,
                            )}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="next-bike-ride__side">
                  <div className="next-bike-ride__participants">
                    <small>Participants</small>

                    <div>
                      {(
                        nextPlannedBikeRide.participantProfiles ??
                        []
                      )
                        .slice(0, 5)
                        .map((participant) => (
                          <span
                            key={participant.id}
                            title={
                              participant.nickname
                            }
                          >
                            {participant.initials}
                          </span>
                        ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      onNavigate?.("bike")
                    }
                  >
                    Voir la sortie
                  </button>
                </div>
              </motion.article>
            ) : (
              <div className="next-bike-ride__empty">
                <span>
                  <Bike size={29} />
                </span>

                <div>
                  <strong>
                    Aucune sortie prévue
                  </strong>

                  <p>
                    Ajoute une sortie avec le
                    statut « Prévue » pour
                    l’afficher ici.
                  </p>
                </div>

                <button
                  type="button"
                  className="primary-button"
                  onClick={onCreateBikeRide}
                >
                  <Plus size={17} />
                  Planifier une sortie
                </button>
              </div>
            )}
          </section>

          <section className="section-block">
            <div className="section-heading">
              <div>
                <span className="section-heading__eyebrow">
                  Performances
                </span>

                <h2>Activité du groupe</h2>
              </div>

              <div className="chart-legend">
                <span className="chart-legend__item">
                  <i className="chart-legend__dot chart-legend__dot--green" />
                  Tennis
                </span>

                <span className="chart-legend__item">
                  <i className="chart-legend__dot chart-legend__dot--blue" />
                  Vélo
                </span>
              </div>
            </div>

            <ActivityChart
              data={homeActivityData}
              summary={homeChartSummary}
            />
          </section>
        </div>

        <aside className="dashboard-column dashboard-column--side">
          <Podium members={sortedMembers} />

          {activeChallenge ? (
            <section className="weekly-challenge glass-panel">
              <div className="weekly-challenge__header">
                <div className="weekly-challenge__icon">
                  <Dices size={22} />
                </div>

                <div className="weekly-challenge__title-group">
                  <span className="section-heading__eyebrow">
                    Défi de la semaine
                  </span>

                  <h2>
                    {activeChallenge.title}
                  </h2>
                </div>
              </div>

              <p className="weekly-challenge__description">
                {activeChallenge.description ??
                  "Un nouveau défi est en cours."}
              </p>

              <button
                type="button"
                className="text-button"
                onClick={() =>
                  onNavigate?.("challenges")
                }
              >
                Voir le défi
                <ChevronRight size={17} />
              </button>
            </section>
          ) : (
            <section className="weekly-challenge weekly-challenge--empty glass-panel">
              <div className="weekly-challenge__header">
                <div className="weekly-challenge__icon">
                  <Dices size={22} />
                </div>

                <div className="weekly-challenge__title-group">
                  <span className="section-heading__eyebrow">
                    Défi de la semaine
                  </span>

                  <h2>
                    Aucun challenge actif
                  </h2>
                </div>
              </div>

              <p className="weekly-challenge__description">
                Crée un défi depuis la page
                dédiée pour l’afficher ici.
              </p>
            </section>
          )}

          <ActivityFeed
            activities={homeRecentActivities}
            onOpenActivity={(activity) =>
              onNavigate?.(
                activity.page ?? "home",
              )
            }
          />
        </aside>
      </section>
    </>
  );
}

export default HomePage;