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

import {
  activityData,
  events,
  members,
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
  "statistics",
  "gallery",
  "gages",
];

function App() {
  const [activePage, setActivePage] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);

  const sortedMembers = useMemo(() => {
    return [...members].sort((memberA, memberB) => {
      return memberB.points - memberA.points;
    });
  }, []);

  const totalBikeKm = useMemo(() => {
    return members.reduce((total, member) => {
      return total + member.bikeKm;
    }, 0);
  }, []);

  const totalMatches = useMemo(() => {
    const matchesPlayed = members.reduce((total, member) => {
      return total + member.wins + member.losses;
    }, 0);

    /*
     * Un même match est comptabilisé pour les deux joueurs.
     * On divise donc le total par deux.
     */
    return Math.round(matchesPlayed / 2);
  }, []);

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
                KK
              </span>

              <span className="profile-button__text">
                <strong>Kiks</strong>
                <small>Administrateur</small>
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
              {activePage === "home" && (
                <>
                  <HeroBanner
                    onCreateEvent={() => navigateTo("events")}
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
                          {events.map((event, index) => (
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
        onClose={() => setScoreModalOpen(false)}
      />
    </div>
  );
}

export default App;