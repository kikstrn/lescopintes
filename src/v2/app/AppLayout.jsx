import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  Bell,
  ChevronRight,
  Menu,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Sidebar from "../../components/Sidebar";
import MobileNavigation from "../../components/MobileNavigation";

import { useAuth } from "../../context/AuthContext";
import { useAppData } from "../context/AppDataContext";

import {
  useNavigation,
} from "../context/NavigationContext";

import {
  getNavigationItem,
  navigation,
} from "../shared/constants/navigation";

import useModuleUnreadCounts from "../shared/hooks/useModuleUnreadCounts";

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

  const {
    notifications = [],
    unreadNotificationsCount = 0,
    notificationsLoading = false,
    notificationsError = null,

    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearReadNotifications,

    chatUnreadCount = 0,

    events = [],
    tennisMatches = [],
    bikeRides = [],
    galleryPhotos = [],
  } = useAppData();

  const currentNavigationItem =
    getNavigationItem(activePage);

  const {
    unreadCounts:
      moduleUnreadCounts,

    markModuleAsRead,
  } = useModuleUnreadCounts({
    profileId:
      user?.id,

    activePage,
    events,
    tennisMatches,
    bikeRides,
    galleryPhotos,
  });

  const navigationItems = useMemo(
    () =>
      navigation.map(
        (
          item,
        ) => ({
          ...item,

          badge:
            item.id ===
            "chat"
              ? chatUnreadCount
              : moduleUnreadCounts[
                  item.id
                ] ??
                item.badge,
        }),
      ),
    [
      chatUnreadCount,
      moduleUnreadCounts,
    ],
  );

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

    markModuleAsRead(
      pageId,
    );

    navigateTo(
      pageId,
    );
  };

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const notificationsRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(
          event.target,
        )
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick,
      );
    };
  }, []);

  const handleNotificationClick =
    async (notification) => {
      if (!notification.read_at) {
        await markNotificationAsRead?.(
          notification.id,
        );
      }

      if (notification.page_id) {
        navigateTo(notification.page_id);
      }

      setNotificationsOpen(false);
    };

  return (
    <div className="app-shell">
      <div className="background-orb background-orb--one" />
      <div className="background-orb background-orb--two" />
      <div className="background-grid" />

      <Sidebar
        items={navigationItems}
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
            <div
              className="notification-center"
              ref={notificationsRef}
            >
              <button
                type="button"
                className="icon-button notification-button"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() =>
                  setNotificationsOpen(
                    (current) => !current,
                  )
                }
              >
                <Bell size={20} />

                {unreadNotificationsCount > 0 && (
                  <span className="notification-badge">
                    {unreadNotificationsCount > 99
                      ? "99+"
                      : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <section className="notification-panel">
                  <header className="notification-panel__header">
                    <div>
                      <span className="section-heading__eyebrow">
                        Activité récente
                      </span>

                      <h2>Notifications</h2>
                    </div>

                    <button
                      type="button"
                      className="notification-panel__close"
                      onClick={() =>
                        setNotificationsOpen(false)
                      }
                    >
                      ×
                    </button>
                  </header>

                  <div className="notification-panel__actions">
                    <button
                      type="button"
                      disabled={
                        unreadNotificationsCount === 0
                      }
                      onClick={
                        markAllNotificationsAsRead
                      }
                    >
                      Tout marquer comme lu
                    </button>

                    <button
                      type="button"
                      onClick={
                        clearReadNotifications
                      }
                    >
                      Effacer les lues
                    </button>
                  </div>

                  <div className="notification-panel__content">
                    {notificationsLoading && (
                      <div className="notification-panel__state">
                        Chargement…
                      </div>
                    )}

                    {!notificationsLoading &&
                      notificationsError && (
                        <div className="notification-panel__state notification-panel__state--error">
                          {notificationsError}
                        </div>
                      )}

                    {!notificationsLoading &&
                      !notificationsError &&
                      notifications.length === 0 && (
                        <div className="notification-panel__state">
                          Aucune notification.
                        </div>
                      )}

                    {!notificationsLoading &&
                      !notificationsError &&
                      notifications.map(
                        (notification) => (
                          <article
                            key={notification.id}
                            className={`notification-item ${notification.read_at
                                ? "notification-item--read"
                                : "notification-item--unread"
                              }`}
                          >
                            <button
                              type="button"
                              className="notification-item__main"
                              onClick={() =>
                                handleNotificationClick(
                                  notification,
                                )
                              }
                            >
                              <span className="notification-item__dot" />

                              <span className="notification-item__body">
                                <strong>
                                  {notification.title}
                                </strong>

                                {notification.message && (
                                  <span>
                                    {
                                      notification.message
                                    }
                                  </span>
                                )}

                                <small>
                                  {new Intl.DateTimeFormat(
                                    "fr-FR",
                                    {
                                      dateStyle: "short",
                                      timeStyle: "short",
                                    },
                                  ).format(
                                    new Date(
                                      notification.created_at,
                                    ),
                                  )}
                                </small>
                              </span>
                            </button>

                            <button
                              type="button"
                              className="notification-item__delete"
                              aria-label="Supprimer"
                              onClick={() =>
                                deleteNotification?.(
                                  notification.id,
                                )
                              }
                            >
                              ×
                            </button>
                          </article>
                        ),
                      )}
                  </div>
                </section>
              )}
            </div>

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
        items={navigationItems}
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