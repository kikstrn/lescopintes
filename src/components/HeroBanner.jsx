import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarPlus,
  CircleDot,
  Plus,
  Sparkles,
  Trophy,
} from "lucide-react";

function HeroBanner({
  nickname = "Membre",
  memberCount = 0,
  eventCount = 0,
  matchCount = 0,
  leaderName = null,
  currentChallenge = null,
  onCreateEvent,
  onAddScore,
  onOpenMembers,
}) {
  const currentYear =
    new Date().getFullYear();

  return (
    <section className="hero-banner">
      <div className="hero-banner__glow hero-banner__glow--one" />
      <div className="hero-banner__glow hero-banner__glow--two" />

      <motion.div
        className="hero-banner__content"
        initial={{
          opacity: 0,
          x: -24,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="hero-banner__status">
          <span className="hero-banner__status-dot">
            <CircleDot size={14} />
          </span>

          <span>
            La saison {currentYear} est lancée
          </span>
        </div>

        <p className="hero-banner__welcome">
          Salut {nickname} 👋
        </p>

        <h2 className="hero-banner__title">
          Entre sport, sueur
          <span>
            et soirées arrosées.
          </span>
        </h2>

        <p className="hero-banner__description">
          Organise les prochains matchs,
          retrouve les sorties vélo et garde
          une trace de tous les bons moments
          des Co’Pintes.
        </p>

        <div className="hero-banner__actions">
          <motion.button
            type="button"
            className="primary-button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onCreateEvent}
          >
            <CalendarPlus size={19} />
            Créer un événement
          </motion.button>

          <motion.button
            type="button"
            className="secondary-button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAddScore}
          >
            <Trophy size={18} />
            Ajouter un score
          </motion.button>
        </div>

        <div className="hero-banner__quick-stats">
          <div className="hero-banner__quick-stat">
            <strong>{memberCount}</strong>
            <span>
              Membre{memberCount > 1 ? "s" : ""}
            </span>
          </div>

          <div className="hero-banner__separator" />

          <div className="hero-banner__quick-stat">
            <strong>{eventCount}</strong>
            <span>
              Événement{eventCount > 1 ? "s" : ""}
            </span>
          </div>

          <div className="hero-banner__separator" />

          <div className="hero-banner__quick-stat">
            <strong>{matchCount}</strong>
            <span>
              Match{matchCount > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="hero-banner__visual"
        initial={{
          opacity: 0,
          scale: 0.94,
          y: 18,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        transition={{
          delay: 0.12,
          duration: 0.65,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="hero-banner__image-card">
          <div className="hero-banner__image-background" />

          <motion.img
            src="/images/equipe-copintes.png"
            alt="Illustration des membres des Co’Pintes"
            className="hero-banner__image"
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              duration: 5,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />

          <div className="hero-banner__image-gradient" />

          <div className="hero-banner__image-caption">
            <div>
              <span>
                La bande au complet
              </span>

              <strong>
                Les Co’Pintes
              </strong>
            </div>

            <button
              type="button"
              className="hero-banner__round-action"
              aria-label="Voir les membres"
              onClick={onOpenMembers}
            >
              <ArrowUpRight size={20} />
            </button>
          </div>
        </div>

        <motion.div
          className="hero-floating-card hero-floating-card--ranking"
          initial={{
            opacity: 0,
            x: 20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 0.55,
          }}
        >
          <span className="hero-floating-card__icon">
            <Trophy size={17} />
          </span>

          <div>
            <small>
              Classement actuel
            </small>

            <strong>
              {leaderName
                ? `${leaderName} est en tête`
                : "Classement à venir"}
            </strong>
          </div>
        </motion.div>

        <motion.div
          className="hero-floating-card hero-floating-card--challenge"
          initial={{
            opacity: 0,
            x: -20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 0.68,
          }}
        >
          <span className="hero-floating-card__icon">
            <Sparkles size={17} />
          </span>

          <div>
            <small>
              Défi en cours
            </small>

            <strong>
              {currentChallenge
                ? currentChallenge.title
                : "Aucun défi actif"}
            </strong>
          </div>
        </motion.div>

        <button
          type="button"
          className="hero-banner__mobile-add-button"
          onClick={onCreateEvent}
          aria-label="Créer un événement"
        >
          <Plus size={22} />
        </button>
      </motion.div>
    </section>
  );
}

export default HeroBanner;