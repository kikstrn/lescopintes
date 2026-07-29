import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  Bell,
  ChevronRight,
  Menu,
} from "lucide-react";

import Sidebar from "../../components/Sidebar";
import MobileNavigation from "../../components/MobileNavigation";

import { useAuth } from "../../context/AuthContext";

import {
  useNavigation,
} from "../context/NavigationContext";

import {
  getNavigationItem,
  navigation,
} from "../shared/constants/navigation";

function AppLayout({
  children,
}) {
  const {
    user,
    profile,
    isAdmin,
    logout,
  } = useAuth();

  const {
    activePage,
    mobileMenuOpen,
    navigateTo,
    openMobileMenu,
    closeMobileMenu,
  } = useNavigation();

  const currentNavigationItem =
    getNavigationItem(activePage);

  const pageTitle =
    currentNavigationItem?.label ??
    "Accueil";

  const nickname =
    profile?.nickname ??
    user?.email?.split("@")[0] ??
    "Membre";

  const initials =
    profile?.initials ??
    nickname
      .slice(0, 2)
      .toUpperCase();

  const roleLabel =
    isAdmin
      ? "Administrateur"
      : "Membre";

  const handleNavigate = async (
    pageId,
  ) => {
    if (pageId === "logout") {
      closeMobileMenu();
      await logout?.();
      return;
    }

    navigateTo(pageId);
  };

  return (
    <div className="app-shell">
      <div className="background-orb background-orb--one" />
      <div className="background-orb background-orb--two" />
      <div className="background-grid" />

      <Sidebar
        items={navigation}
        activePage={activePage}
        onNavigate={handleNavigate}
        onLogout={logout}
        profile={profile}
        isOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
      />

      <div className="app-content">
        <header className="topbar">
          <div className="topbar__left">
            <button
              type="button"
              className="icon-button mobile-menu-button"
              aria-label="Ouvrir le menu"
              onClick={openMobileMenu}
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
              aria-label={`Ouvrir le profil de ${nickname}`}
              onClick={() =>
                navigateTo("profile")
              }
            >
              <span className="profile-button__avatar">
                {initials}
              </span>

              <span className="profile-button__text">
                <strong>
                  {nickname}
                </strong>

                <small>
                  {roleLabel}
                </small>
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
                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MobileNavigation
        items={navigation}
        activePage={activePage}
        onNavigate={handleNavigate}
        onLogout={logout}
        profile={profile}
        menuOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
      />
    </div>
  );
}

export default AppLayout;