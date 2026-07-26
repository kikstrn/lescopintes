import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Bike,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronRight,
  CircleUserRound,
  Dices,
  House,
  Images,
  Medal,
  Menu,
  Plus,
  Scale,
  Trophy,
} from "lucide-react";


import Sidebar from "./components/Sidebar";
import MobileNavigation from "./components/MobileNavigation";
import HeroBanner from "./components/HeroBanner";
import StatCard from "./components/StatCard";
import EventCard from "./components/EventCard";
import Podium from "./components/Podium";
import ActivityChart from "./components/ActivityChart";
import BikeMap from "./components/BikeMap";
import ActivityFeed from "./components/ActivityFeed";
import WeeklyChallenge from "./components/WeeklyChallenge";
import ScoreModal from "./components/ScoreModal";

import GallerySection from "./components/GallerySection";
import GagesSection from "./components/GagesSection";
import RankingSection from "./components/RankingSection";
import StatisticsSection from "./components/StatisticsSection";

import { useProfiles } from "./hooks/useProfiles";
import EventsSection from "./components/EventsSection";
import EventFormModal from "./components/EventFormModal";
import { useEvents } from "./hooks/useEvents";
import TennisSection from "./components/TennisSection";
import { useTennisMatches } from "./hooks/useTennisMatches";

import { useEffect } from "react";
import { testSupabaseConnection } from "./lib/testSupabase";
import { useAuth } from "./context/AuthContext";

import {
  activityData,
  recentActivities,
  weeklyChallenge,
} from "./data/demoData";

const navigation = [
  {
    id: "home",
    label: "Accueil",
    icon: House,
  },
  {
    id: "events",
    label: "Événements",
    icon: CalendarDays,
  },
  {
    id: "tennis",
    label: "Tennis",
    icon: Trophy,
  },
  {
    id: "bike",
    label: "Cyclisme",
    icon: Bike,
  },
  {
    id: "ranking",
    label: "Classement",
    icon: Medal,
  },
  {
    id: "statistics",
    label: "Statistiques",
    icon: ChartNoAxesCombined,
  },
  {
    id: "gallery",
    label: "Galerie",
    icon: Images,
  },
  {
    id: "gages",
    label: "Gages",
    icon: Dices,
  },
  {
    id: "tribunal",
    label: "Tribunal",
    icon: Scale,
  },
  {
    id: "members",
    label: "Membres",
    icon: CircleUserRound,
  },
];

const implementedPages = [
  "home",
  "ranking",
  "events",
  "statistics",
  "tennis",
  "gallery",
  "gages",
];

function App() {

  const {
    profiles: members,
    loading: profilesLoading,
    error: profilesError,
  } = useProfiles();

  const {
    profile,
    user,
    isAdmin,
    logout,
  } = useAuth();

  const [eventModalOpen, setEventModalOpen] =
    useState(false);

  const [eventBeingEdited, setEventBeingEdited] =
    useState(null);

  const {
    events,
    loading: eventsLoading,
    saving: eventsSaving,
    error: eventsError,
    addEvent,
    editEvent,
    removeEvent,
    changeAttendance,
  } = useEvents();

  const {
    matches: tennisMatches,
    loading: tennisLoading,
    saving: tennisSaving,
    error: tennisError,
    addMatch,
  } = useTennisMatches();

  const handleSaveTennisMatch =
    async (matchData) => {
      await addMatch(matchData);
      setScoreModalOpen(false);
    };

  const openCreateEventModal = () => {
    setEventBeingEdited(null);
    setEventModalOpen(true);
  };

  const openEditEventModal = (event) => {
    setEventBeingEdited(event);
    setEventModalOpen(true);
  };

  const closeEventModal = () => {
    if (eventsSaving) {
      return;
    }

    setEventModalOpen(false);
    setEventBeingEdited(null);
  };

  const handleEventSubmit = async (eventData) => {
    if (eventBeingEdited) {
      await editEvent(
        eventBeingEdited.id,
        eventData,
      );
    } else {
      if (!user?.id) {
        throw new Error(
          "Utilisateur connecté introuvable.",
        );
      }

      await addEvent({
        ...eventData,
        createdBy: user.id,
      });
    }

    setEventModalOpen(false);
    setEventBeingEdited(null);
  };

  const handleAttendance = async ({
    eventId,
    attendanceStatus,
  }) => {
    if (!user?.id) {
      throw new Error(
        "Utilisateur connecté introuvable.",
      );
    }

    await changeAttendance({
      eventId,
      profileId: user.id,
      attendanceStatus,
    });
  };

  const connectedNickname =
    profile?.nickname ??
    user?.email?.split("@")[0] ??
    "Membre";

  const connectedInitials =
    profile?.initials ??
    connectedNickname.slice(0, 2).toUpperCase();

  const connectedRole =
    isAdmin ? "Administrateur" : "Membre";

  const [activePage, setActivePage] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);

  const sortedMembers = useMemo(() => {
    return [...members].sort((memberA, memberB) => {
      return memberB.points - memberA.points;
    });
  }, [members]);

  const totalBikeKm = useMemo(() => {
    return members.reduce((total, member) => {
      return total + Number(member.bikeKm ?? 0);
    }, 0);
  }, [members]);

  const totalMatches = useMemo(() => {
    const totalParticipations = members.reduce(
      (total, member) => {
        return (
          total +
          Number(member.wins ?? 0) +
          Number(member.losses ?? 0)
        );
      },
      0,
    );

    return Math.round(totalParticipations / 2);
  }, [members]);

  const currentNavigationItem = navigation.find((item) => {
    return item.id === activePage;
  });

  const pageTitle = currentNavigationItem?.label ?? "Accueil";

  const navigateTo = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const renderPlaceholderPage = () => {
    const CurrentIcon = currentNavigationItem?.icon ?? House;

    return (
      <section className="placeholder-page glass-panel">
        <div className="placeholder-page__icon">
          <CurrentIcon size={34} />
        </div>

        <p className="section-heading__eyebrow">
          Module en préparation
        </p>

        <h2>{pageTitle}</h2>

        <p>
          Cette page sera construite lors des prochaines étapes.
          La navigation est déjà prête et le contenu viendra
          s’intégrer ici sans modifier l’architecture générale.
        </p>

        {activePage === "tennis" && (
          <button
            type="button"
            className="primary-button"
            onClick={() => setScoreModalOpen(true)}
          >
            <Plus size={18} />
            Saisir un premier score
          </button>
        )}
      </section>
    );
  };

  return (
    <div className="app-shell">
      <div className="background-orb background-orb--one" />
      <div className="background-orb background-orb--two" />
      <div className="background-grid" />

      <Sidebar
        items={navigation}
        activePage={activePage}
        onNavigate={navigateTo}
        onLogout={logout}
        profile={profile}
      />

      <div className="app-content">
        <header className="topbar">
          <div className="topbar__left">
            <button
              type="button"
              className="icon-button mobile-menu-button"
              aria-label="Ouvrir le menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="topbar__eyebrow">
                Les Co’Pintes
              </p>

              <h1 className="topbar__title">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="topbar__actions">
            <button
              type="button"
              className="icon-button notification-button"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="notification-dot" />
            </button>

            <button
              type="button"
              className="profile-button"
              aria-label="Ouvrir le profil de Kiks"
              onClick={() => navigateTo("members")}
            >
              <span className="profile-button__avatar">
                {connectedInitials}
              </span>

              <span className="profile-button__text">
                <strong>{connectedNickname}</strong>
                <small>{connectedRole}</small>
              </span>

              <ChevronRight size={18} />
            </button>
          </div>
        </header>

        <main className="dashboard">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{
                opacity: 0,
                y: 14,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              transition={{
                duration: 0.28,
                ease: [0.22, 1, 0.36, 1],
              }}
            >

              {profilesLoading && (
                <section className="data-status glass-panel">
                  <span className="data-status__spinner" />

                  <div>
                    <strong>Chargement des membres</strong>
                    <p>Récupération des données Supabase…</p>
                  </div>
                </section>
              )}

              {profilesError && (
                <section className="data-status data-status--error glass-panel">
                  <div>
                    <strong>Impossible de charger les membres</strong>
                    <p>{profilesError}</p>
                  </div>
                </section>
              )}

              {activePage === "home" && (
                <>
                  <HeroBanner
                    onCreateEvent={openCreateEventModal}
                    onAddScore={() => setScoreModalOpen(true)}
                  />

                  <section className="stats-grid">
                    <StatCard
                      icon={Trophy}
                      label="Matchs joués"
                      value={totalMatches}
                      detail="+12 % ce mois-ci"
                      accent="green"
                    />

                    <StatCard
                      icon={Bike}
                      label="Kilomètres vélo"
                      value={totalBikeKm.toLocaleString("fr-FR")}
                      detail="+486 km ce mois-ci"
                      accent="blue"
                    />

                    <StatCard
                      icon={CalendarDays}
                      label="Événements"
                      value="26"
                      detail="4 événements à venir"
                      accent="amber"
                    />

                    <StatCard
                      icon={Trophy}
                      label="Points de Kiks"
                      value="248"
                      detail="1er du classement"
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
                            onClick={() => navigateTo("events")}
                          >
                            Tout afficher
                            <ChevronRight size={17} />
                          </button>
                        </div>

                        <div className="events-grid">
                          {events
                            .filter(
                              (event) =>
                                new Date(event.startsAt).getTime() >=
                                Date.now(),
                            )
                            .slice(0, 3)
                            .map((event, index) => (
                              <EventCard
                                key={event.id}
                                event={event}
                                index={index}
                              />
                            ))}
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

                        <ActivityChart data={activityData} />
                      </section>

                      <section className="section-block">
                        <div className="section-heading">
                          <div>
                            <span className="section-heading__eyebrow">
                              Cyclisme
                            </span>

                            <h2>
                              Prochaine sortie vélo
                            </h2>
                          </div>

                          <button
                            type="button"
                            className="primary-button primary-button--compact"
                            onClick={() => navigateTo("bike")}
                          >
                            Voir le parcours
                            <ChevronRight size={17} />
                          </button>
                        </div>

                        <BikeMap />
                      </section>
                    </div>

                    <aside className="dashboard-column dashboard-column--side">
                      <Podium members={sortedMembers} />

                      <WeeklyChallenge
                        challenge={weeklyChallenge}
                      />

                      <ActivityFeed
                        activities={recentActivities}
                      />
                    </aside>
                  </section>
                </>
              )}

              {activePage === "events" && (
                <EventsSection
                  events={events}
                  loading={eventsLoading}
                  saving={eventsSaving}
                  error={eventsError}
                  currentProfile={profile}
                  isAdmin={isAdmin}
                  onCreate={openCreateEventModal}
                  onEdit={openEditEventModal}
                  onDelete={removeEvent}
                  onAttendance={handleAttendance}
                />
              )}

              {activePage === "tennis" && (
                <TennisSection
                  matches={tennisMatches}
                  members={members}
                  loading={tennisLoading}
                  error={tennisError}
                  onAddMatch={() =>
                    setScoreModalOpen(true)
                  }
                />
              )}

              {activePage === "ranking" && (
                <RankingSection members={members} />
              )}

              {activePage === "statistics" && (
                <StatisticsSection members={members} />
              )}

              {activePage === "gallery" && (
                <GallerySection />
              )}

              {activePage === "gages" && (
                <GagesSection members={members} />
              )}

              {!implementedPages.includes(activePage) &&
                renderPlaceholderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MobileNavigation
        items={navigation}
        activePage={activePage}
        onNavigate={navigateTo}
        menuOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <ScoreModal
        open={scoreModalOpen}
        members={members}
        saving={tennisSaving}
        onSave={handleSaveTennisMatch}
        onClose={() => {
          if (!tennisSaving) {
            setScoreModalOpen(false);
          }
        }}
      />

      <EventFormModal
        open={eventModalOpen}
        event={eventBeingEdited}
        saving={eventsSaving}
        onClose={closeEventModal}
        onSubmit={handleEventSubmit}
      />
    </div>
  );
}

export default App;