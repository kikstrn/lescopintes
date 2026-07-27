import { motion } from "framer-motion";
import { Settings, X } from "lucide-react";

function Sidebar({
  items = [],
  activePage,
  onNavigate,
  onLogout,
  profile,
  isOpen = false,
  onClose,
}) {
  const closeSidebar = () => {
    onClose?.();
  };

  const handleItemClick = async (event, item) => {
    event.preventDefault();
    event.stopPropagation();

    if (item.id === "logout") {
      if (typeof onLogout !== "function") {
        console.error(
          "Sidebar : aucune fonction onLogout n’a été fournie.",
        );
        return;
      }

      try {
        await onLogout();
        closeSidebar();
      } catch (error) {
        console.error(
          "Sidebar : erreur pendant la déconnexion.",
          error,
        );
      }

      return;
    }

    onNavigate?.(item.id);
    closeSidebar();
  };

  const openProfile = (event) => {
    event?.preventDefault();
    event?.stopPropagation();

    onNavigate?.("profile");
    closeSidebar();
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Fermer le menu"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={[
          "sidebar",
          isOpen ? "sidebar--open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="sidebar__top">
          <div className="sidebar__brand">
            <div className="sidebar__logo">
              <span>CP</span>
            </div>

            <div className="sidebar__brand-text">
              <strong>Les Co’Pintes</strong>
              <small>Jeu, set et tournée !</small>
            </div>

            <button
              type="button"
              className="sidebar__close"
              aria-label="Fermer le menu"
              onClick={closeSidebar}
            >
              <X size={20} />
            </button>
          </div>

          <nav
            className="sidebar__navigation"
            aria-label="Navigation principale"
          >
            <p className="sidebar__section-label">
              Navigation
            </p>

            <div className="sidebar__navigation-list">
              {items.map((item) => {
                const Icon = item.icon;
                const isLogout =
                  item.id === "logout";

                const isActive =
                  !isLogout &&
                  item.id === activePage;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={[
                      "sidebar__nav-item",
                      isActive
                        ? "sidebar__nav-item--active"
                        : "",
                      isLogout
                        ? "sidebar__nav-item--logout"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={(event) =>
                      handleItemClick(
                        event,
                        item,
                      )
                    }
                  >
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active-background"
                        className="sidebar__active-background"
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 34,
                        }}
                      />
                    )}

                    <span className="sidebar__nav-icon">
                      <Icon
                        size={20}
                        strokeWidth={2}
                      />
                    </span>

                    <span className="sidebar__nav-label">
                      {item.label}
                    </span>

                    {item.id === "tribunal" && (
                      <span className="sidebar__badge">
                        2
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        <div className="sidebar__bottom">
          <div className="sidebar__member-card">
            <button
              type="button"
              className="sidebar__member-main"
              onClick={openProfile}
            >
              <div className="sidebar__member-avatar">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={`Profil de ${
                      profile?.nickname ??
                      "Membre"
                    }`}
                  />
                ) : (
                  <span>
                    {profile?.initials ??
                      "CP"}
                  </span>
                )}
              </div>

              <div className="sidebar__member-info">
                <strong>
                  {profile?.nickname ??
                    "Membre"}
                </strong>

                <small>
                  {profile?.role ===
                  "admin"
                    ? "Administrateur"
                    : "Membre"}
                </small>
              </div>
            </button>

            <button
              type="button"
              className="sidebar__mini-button"
              aria-label="Ouvrir mon profil"
              onClick={openProfile}
            >
              <Settings size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;