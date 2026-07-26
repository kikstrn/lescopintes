import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

function MobileNavigation({
  items,
  activePage,
  onNavigate,
  menuOpen,
  onClose,
}) {
  const primaryItems = items.slice(0, 5);

  return (
    <>
      <nav className="mobile-bottom-nav" aria-label="Navigation mobile">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activePage;

          return (
            <button
              key={item.id}
              type="button"
              className={`mobile-bottom-nav__item ${
                isActive ? "mobile-bottom-nav__item--active" : ""
              }`}
              onClick={() => onNavigate(item.id)}
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

                <Icon size={21} strokeWidth={isActive ? 2.4 : 2} />
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
              onClick={onClose}
            />

            <motion.aside
              className="mobile-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "spring",
                stiffness: 330,
                damping: 34,
              }}
            >
              <div className="mobile-drawer__header">
                <div className="mobile-drawer__brand">
                  <div className="mobile-drawer__logo">CP</div>

                  <div>
                    <strong>Les Co’Pintes</strong>
                    <small>Jeu, set et tournée !</small>
                  </div>
                </div>

                <button
                  type="button"
                  className="icon-button"
                  aria-label="Fermer"
                  onClick={onClose}
                >
                  <X size={22} />
                </button>
              </div>

              <div className="mobile-drawer__profile">
                <div className="mobile-drawer__avatar">KK</div>

                <div>
                  <strong>Kiks</strong>
                  <small>Administrateur</small>
                </div>
              </div>

              <nav className="mobile-drawer__navigation">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.id === activePage;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`mobile-drawer__item ${
                        isActive ? "mobile-drawer__item--active" : ""
                      }`}
                      onClick={() => onNavigate(item.id)}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
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