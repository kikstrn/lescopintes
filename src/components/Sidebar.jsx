import { motion } from "framer-motion";
import { LogOut, Settings } from "lucide-react";

function Sidebar({ items, activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <span>CP</span>
        </div>

        <div className="sidebar__brand-text">
          <strong>Les Co’Pintes</strong>
          <small>Jeu, set et tournée !</small>
        </div>
      </div>

      <nav className="sidebar__navigation" aria-label="Navigation principale">
        <p className="sidebar__section-label">Navigation</p>

        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activePage;

          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar__nav-item ${
                isActive ? "sidebar__nav-item--active" : ""
              }`}
              onClick={() => onNavigate(item.id)}
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
                <Icon size={20} strokeWidth={2} />
              </span>

              <span className="sidebar__nav-label">{item.label}</span>

              {item.id === "tribunal" && (
                <span className="sidebar__badge">2</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar__bottom">
        <div className="sidebar__member-card">
          <div className="sidebar__member-avatar">KK</div>

          <div className="sidebar__member-info">
            <strong>Kiks</strong>
            <small>Administrateur</small>
          </div>

          <button
            type="button"
            className="sidebar__mini-button"
            aria-label="Réglages"
          >
            <Settings size={17} />
          </button>
        </div>

        <button type="button" className="sidebar__logout">
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;