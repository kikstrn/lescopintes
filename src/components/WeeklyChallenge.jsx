import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  Flame,
  Sparkles,
  Trophy,
} from "lucide-react";

function WeeklyChallenge({ challenge }) {
  const progress = Math.min(
    100,
    Math.round((challenge.current / challenge.target) * 100),
  );

  const complete = challenge.current >= challenge.target;

  return (
    <motion.section
      className="weekly-challenge glass-panel"
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -4,
      }}
      transition={{
        duration: 0.42,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="weekly-challenge__glow" />

      <div className="weekly-challenge__header">
        <div className="weekly-challenge__icon">
          {complete ? (
            <CheckCircle2 size={22} />
          ) : (
            <Flame size={22} />
          )}
        </div>

        <div className="weekly-challenge__title-group">
          <span className="section-heading__eyebrow">
            Défi de la semaine
          </span>

          <h2>{challenge.title}</h2>
        </div>

        <button
          type="button"
          className="weekly-challenge__action"
          aria-label="Voir le défi"
        >
          <ArrowUpRight size={18} />
        </button>
      </div>

      <p className="weekly-challenge__description">
        {challenge.description}
      </p>

      <div className="weekly-challenge__reward">
        <span>
          <Sparkles size={17} />
          Récompense
        </span>

        <strong>+{challenge.reward} points</strong>
      </div>

      <div className="weekly-challenge__progress-header">
        <span>Progression</span>

        <strong>
          {challenge.current}/{challenge.target}
        </strong>
      </div>

      <div
        className="weekly-challenge__progress"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax={challenge.target}
        aria-valuenow={challenge.current}
      >
        <motion.span
          className="weekly-challenge__progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{
            delay: 0.35,
            duration: 0.75,
            ease: [0.22, 1, 0.36, 1],
          }}
        />

        <span className="weekly-challenge__progress-highlight" />
      </div>

      <div className="weekly-challenge__footer">
        <span className="weekly-challenge__footer-icon">
          <Trophy size={16} />
        </span>

        <span>
          Plus que {Math.max(0, challenge.target - challenge.current)} service
          {challenge.target - challenge.current > 1 ? "s" : ""} gagnant
          {challenge.target - challenge.current > 1 ? "s" : ""}
        </span>
      </div>
    </motion.section>
  );
}

export default WeeklyChallenge;