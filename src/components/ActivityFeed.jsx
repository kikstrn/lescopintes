import { motion } from "framer-motion";
import {
  Bike,
  ChevronRight,
  Clock3,
  Dices,
  PartyPopper,
  Scale,
  Trophy,
  Award,
} from "lucide-react";

const activityIcons = {
  tennis: Trophy,
  bike: Bike,
  party: PartyPopper,
  trophy: Trophy,
  gage: Dices,
  tribunal: Scale,
  badge_unlocked: Award,
};

function ActivityFeed({
  activities = [],
  onOpenActivity,
}) {
  return (
    <motion.section
      className="activity-feed glass-panel"
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: 0.12,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="activity-feed__header">
        <div>
          <span className="section-heading__eyebrow">
            Communauté
          </span>

          <h2>
            Activité récente
          </h2>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="activity-feed__empty">
          <Clock3 size={24} />

          <strong>
            Aucune activité récente
          </strong>

          <p>
            Les prochaines actions du
            groupe apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="activity-feed__list">
          {activities.map(
            (activity, index) => {
              const Icon =
                activityIcons[
                  activity.icon
                ] ?? Trophy;

              return (
                <motion.article
                  key={activity.id}
                  className="activity-feed__item"
                  initial={{
                    opacity: 0,
                    x: 14,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay:
                      0.25 +
                      index * 0.06,
                    duration: 0.35,
                  }}
                >
                  <div
                    className={`activity-feed__icon activity-feed__icon--${activity.icon}`}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="activity-feed__content">
                    <strong>
                      {activity.title}
                    </strong>

                    <p>
                      {activity.description}
                    </p>

                    <span className="activity-feed__time">
                      <Clock3 size={13} />
                      {activity.time}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="activity-feed__item-action"
                    aria-label={`Voir ${activity.title}`}
                    onClick={() =>
                      onOpenActivity?.(
                        activity,
                      )
                    }
                  >
                    <ChevronRight size={17} />
                  </button>
                </motion.article>
              );
            },
          )}
        </div>
      )}
    </motion.section>
  );
}

export default ActivityFeed;