import { motion } from "framer-motion";
import {
  Bike,
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  PartyPopper,
  Trophy,
  Users,
} from "lucide-react";

const eventIcons = {
  tennis: Trophy,
  bike: Bike,
  party: PartyPopper,
};

const eventLabels = {
  tennis: "Tennis",
  bike: "Cyclisme",
  party: "Apéro",
};

function EventCard({ event, index = 0 }) {
  const Icon = eventIcons[event.type] ?? CalendarDays;
  const categoryLabel = eventLabels[event.type] ?? "Événement";

  return (
    <motion.article
      className={`event-card event-card--${event.accent}`}
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -6,
        transition: {
          duration: 0.22,
        },
      }}
      transition={{
        delay: index * 0.06,
        duration: 0.42,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="event-card__glow" />

      <div className="event-card__header">
        <div className="event-card__category">
          <span className="event-card__category-icon">
            <Icon size={18} />
          </span>

          <span>{categoryLabel}</span>
        </div>

        <span className="event-card__status">
          <i />
          {event.status}
        </span>
      </div>

      <div className="event-card__content">
        <h3>{event.title}</h3>

        <div className="event-card__details">
          <div className="event-card__detail">
            <CalendarDays size={16} />
            <span>{event.date}</span>
          </div>

          <div className="event-card__detail">
            <Clock3 size={16} />
            <span>{event.time}</span>
          </div>

          <div className="event-card__detail">
            <MapPin size={16} />
            <span>{event.location}</span>
          </div>
        </div>

        {event.type === "bike" && (
          <div className="event-card__bike-stats">
            <div>
              <small>Distance</small>
              <strong>{event.distance} km</strong>
            </div>

            <div>
              <small>Dénivelé</small>
              <strong>{event.elevation} m</strong>
            </div>
          </div>
        )}
      </div>

      <div className="event-card__footer">
        <div className="event-card__participants">
          <div className="event-card__avatars">
            {event.participants.slice(0, 4).map((participant, avatarIndex) => (
              <span
                key={participant}
                className={`event-card__avatar event-card__avatar--${
                  avatarIndex + 1
                }`}
                title={participant}
              >
                {participant.slice(0, 2).toUpperCase()}
              </span>
            ))}

            {event.participants.length > 4 && (
              <span className="event-card__avatar event-card__avatar--count">
                +{event.participants.length - 4}
              </span>
            )}
          </div>

          <span className="event-card__participant-count">
            <Users size={15} />
            {event.participants.length} participants
          </span>
        </div>

        <motion.button
          type="button"
          className="event-card__action"
          aria-label={`Voir ${event.title}`}
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.94 }}
        >
          <ChevronRight size={19} />
        </motion.button>
      </div>
    </motion.article>
  );
}

export default EventCard;