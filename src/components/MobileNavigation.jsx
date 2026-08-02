import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

function MobileNavigation({
  items = [],
  activePage,
  onNavigate,
  onLogout,
  menuOpen,
  onClose,
  profile,
}) {
  const primaryItems = items
    .filter((item) => item.id !== "logout")
    .slice(0, 5);

  const closeMenu = () => {
    onClose?.();
  };

  const handleItemClick = async (item) => {
    if (item.id === "logout") {
      if (typeof onLogout !== "function") {
        console.error(
          "MobileNavigation : aucune fonction onLogout n’a été fournie.",
        );
        return;
      }

      try {
        await onLogout();
        closeMenu();
      } catch (error) {
        console.error(
          "MobileNavigation : erreur pendant la déconnexion.",
          error,
        );
      }

      return;
    }

    onNavigate?.(item.id);
    closeMenu();
  };

  return (
    <>
      <nav
        className="mobile-bottom-nav"
        aria-label="Navigation mobile"
      >
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.id === activePage;

          return (
            <button
              key={item.id}
              type="button"
              className={[
                "mobile-bottom-nav__item",
                isActive
                  ? "mobile-bottom-nav__item--active"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() =>
                handleItemClick(item)
              }
            >
              <span className="mobile-bottom-nav__icon">
                {isActive && (
                  <motion.span
                    layoutId="mobile-active-item"
                    className="mobile-bottom-nav__active-background"
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 34,
                    }}
                  />
                )}

                <Icon
                  size={21}
                  strokeWidth={
                    isActive ? 2.4 : 2
                  }
                />

                {Number(item.badge) > 0 && (
                  <span className="mobile-bottom-nav__badge">
                    {Number(item.badge) > 99
                      ? "99+"
                      : item.badge}
                  </span>
                )}
              </span>

              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              className="mobile-drawer__overlay"
              aria-label="Fermer le menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
            />

            <motion.aside
              className="mobile-drawer"
              initial={{
                x: "-100%",
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: "-100%",
              }}
              transition={{
                type: "spring",
                stiffness: 330,
                damping: 34,
              }}
            >
              <div className="mobile-drawer__header">
                <div className="mobile-drawer__brand">
                  <div className="mobile-drawer__logo">
                    CP
                  </div>

                  <div>
                    <strong>
                      Les Co’Pintes
                    </strong>

                    <small>
                      Jeu, set et tournée !
                    </small>
                  </div>
                </div>

                <button
                  type="button"
                  className="icon-button"
                  aria-label="Fermer"
                  onClick={closeMenu}
                >
                  <X size={22} />
                </button>
              </div>

              <button
                type="button"
                className="mobile-drawer__profile"
                onClick={() =>
                  handleItemClick({
                    id: "profile",
                  })
                }
              >
                <div className="mobile-drawer__avatar">
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt=""
                    />
                  ) : (
                    <span>
                      {profile?.initials ??
                        "CP"}
                    </span>
                  )}
                </div>

                <div>
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

              <nav className="mobile-drawer__navigation">
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
                        "mobile-drawer__item",
                        isActive
                          ? "mobile-drawer__item--active"
                          : "",
                        isLogout
                          ? "mobile-drawer__item--logout"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() =>
                        handleItemClick(item)
                      }
                    >
                      <Icon size={20} />

                      <span>
                        {item.label}
                      </span>

                      {Number(item.badge) > 0 && (
                        <span className="mobile-drawer__badge">
                          {Number(item.badge) > 99
                            ? "99+"
                            : item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default MobileNavigation;