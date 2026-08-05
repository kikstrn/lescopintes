import { motion } from "framer-motion";
import {
  ArrowUpRight,
} from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  accent = "green",
  onClick,
}) {
  const handleClick = () => {
    if (typeof onClick === "function") {
      onClick();
    }
  };

  const handleKeyDown = (
    event,
  ) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      className={[
        "stat-card",
        `stat-card--${accent}`,
        onClick
          ? "stat-card--clickable"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role={
        onClick
          ? "button"
          : undefined
      }
      tabIndex={
        onClick
          ? 0
          : undefined
      }
      onClick={
        onClick
          ? handleClick
          : undefined
      }
      onKeyDown={
        onClick
          ? handleKeyDown
          : undefined
      }
    >
      <div className="stat-card__top">
        <span className="stat-card__icon">
          <Icon size={22} />
        </span>

        {onClick && (
          <button
            type="button"
            className="stat-card__arrow"
            aria-label={`Ouvrir ${label}`}
            onClick={(
              event,
            ) => {
              event.stopPropagation();
              handleClick();
            }}
          >
            <ArrowUpRight
              size={17}
            />
          </button>
        )}
      </div>

      <span className="stat-card__label">
        {label}
      </span>

      <strong className="stat-card__value">
        {value}
      </strong>

      <span className="stat-card__detail">
        {detail}
      </span>

      <span className="stat-card__progress" />
    </article>
  );
}

export default StatCard;