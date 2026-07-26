import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

function StatCard({ icon: Icon, label, value, detail, accent = "green" }) {
  return (
    <motion.article
      className={`stat-card stat-card--${accent}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -5,
        transition: {
          duration: 0.2,
        },
      }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="stat-card__top">
        <div className="stat-card__icon">
          <Icon size={21} />
        </div>

        <button
          type="button"
          className="stat-card__link"
          aria-label={`Voir les détails de ${label}`}
        >
          <ArrowUpRight size={18} />
        </button>
      </div>

      <div className="stat-card__content">
        <span className="stat-card__label">{label}</span>

        <motion.strong
          className="stat-card__value"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.12,
            duration: 0.35,
          }}
        >
          {value}
        </motion.strong>

        <span className="stat-card__detail">{detail}</span>
      </div>

      <div className="stat-card__decorative-line" />
    </motion.article>
  );
}

export default StatCard;