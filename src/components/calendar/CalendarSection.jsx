import {
  Bike,
  CakeSlice,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Plus,
  Trophy,
  Users,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  addMonths,
  buildMonthGrid,
  CALENDAR_ITEM_TYPES,
  CALENDAR_TYPE_LABELS,
  CALENDAR_WEEKDAYS,
  countItemsByType,
  formatLongDate,
  formatMonthTitle,
  getItemsForDate,
  groupCalendarItemsByDate,
  getUpcomingBirthdays,
  isSameDay,
  toDateKey,
} from "../../v2/features/calendar/calendarUtils";
  
const TYPE_CONFIG = {
  [CALENDAR_ITEM_TYPES.EVENT]: {
    icon: CalendarDays,
    className: "event",
  },
  [CALENDAR_ITEM_TYPES.BIKE]: {
    icon: Bike,
    className: "bike",
  },
  [CALENDAR_ITEM_TYPES.TENNIS]: {
    icon: Trophy,
    className: "tennis",
  },
  [CALENDAR_ITEM_TYPES.BIRTHDAY]: {
    icon: CakeSlice,
    className: "birthday",
  },
};

function CalendarLegend() {
  return (
    <div className="cop-calendar__legend">
      {Object.entries(TYPE_CONFIG).map(
        ([type, config]) => {
          const Icon = config.icon;

          return (
            <span
              key={type}
              className={`cop-calendar__legend-item cop-calendar__legend-item--${config.className}`}
            >
              <Icon size={14} />
              {CALENDAR_TYPE_LABELS[type]}
            </span>
          );
        },
      )}
    </div>
  );
}

function CalendarHeader({
  currentMonth,
  counts,
  onPreviousMonth,
  onNextMonth,
  onToday,
}) {
  return (
    <header className="cop-calendar__header">
      <div className="cop-calendar__heading">
        <span className="section-heading__eyebrow">
          Agenda partagé
        </span>

        <h2>{formatMonthTitle(currentMonth)}</h2>

        <p>
          Événements, sorties vélo, matchs de tennis et anniversaires du groupe.
        </p>
      </div>

      <div className="cop-calendar__header-actions">
        <div className="cop-calendar__summary">
          <span>
            <strong>{counts.total}</strong>
            activité{counts.total > 1 ? "s" : ""}
          </span>

          <span className="cop-calendar__summary-separator" />

          <span>
            {counts.event} événement
            {counts.event > 1 ? "s" : ""}
          </span>

          <span>
            {counts.bike} vélo
          </span>

          <span>
            {counts.tennis} tennis
          </span>

          <span>
            {counts.birthday} anniversaire
            {counts.birthday > 1 ? "s" : ""}
          </span>
        </div>

        <div className="cop-calendar__navigation">
          <button
            type="button"
            className="cop-calendar__today-button"
            onClick={onToday}
          >
            Aujourd’hui
          </button>

          <button
            type="button"
            className="cop-calendar__month-button"
            aria-label="Mois précédent"
            onClick={onPreviousMonth}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            className="cop-calendar__month-button"
            aria-label="Mois suivant"
            onClick={onNextMonth}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

function CalendarItemChip({
  item,
  compact = false,
  onClick,
}) {
  const config =
    TYPE_CONFIG[item.type] ??
    TYPE_CONFIG[CALENDAR_ITEM_TYPES.EVENT];

  const Icon = config.icon;

  return (
    <button
      type="button"
      className={[
        "cop-calendar-chip",
        `cop-calendar-chip--${config.className}`,
        compact
          ? "cop-calendar-chip--compact"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      title={item.title}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(item);
      }}
    >
      <Icon size={compact ? 12 : 14} />

      <span className="cop-calendar-chip__content">
        {item.timeLabel && (
          <small>{item.timeLabel}</small>
        )}

        <strong>{item.title}</strong>
      </span>
    </button>
  );
}

function CalendarDayCell({
  day,
  items,
  selected,
  onSelect,
  onOpenItem,
}) {
  const visibleItems = items.slice(0, 3);
  const hiddenCount =
    Math.max(0, items.length - visibleItems.length);

  return (
    <motion.button
      type="button"
      className={[
        "cop-calendar-day",
        !day.isCurrentMonth
          ? "cop-calendar-day--outside"
          : "",
        day.isToday
          ? "cop-calendar-day--today"
          : "",
        selected
          ? "cop-calendar-day--selected"
          : "",
        items.length > 0
          ? "cop-calendar-day--has-items"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onSelect(day.date)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.16 }}
    >
      <span className="cop-calendar-day__number">
        {day.dayNumber}
      </span>

      <span className="cop-calendar-day__items">
        {visibleItems.map((item) => (
          <CalendarItemChip
            key={item.id}
            item={item}
            compact
            onClick={onOpenItem}
          />
        ))}

        {hiddenCount > 0 && (
          <span className="cop-calendar-day__more">
            +{hiddenCount} autre
            {hiddenCount > 1 ? "s" : ""}
          </span>
        )}
      </span>

      <span className="cop-calendar-day__mobile-dots">
        {items.slice(0, 4).map((item) => {
          const config =
            TYPE_CONFIG[item.type] ??
            TYPE_CONFIG[CALENDAR_ITEM_TYPES.EVENT];

          return (
            <i
              key={item.id}
              className={`cop-calendar-day__dot cop-calendar-day__dot--${config.className}`}
            />
          );
        })}
      </span>
    </motion.button>
  );
}

function CalendarGrid({
  currentMonth,
  selectedDate,
  itemsByDate,
  onSelectDate,
  onOpenItem,
}) {
  const days = useMemo(
    () => buildMonthGrid(currentMonth),
    [currentMonth],
  );

  return (
    <div className="cop-calendar__grid-wrapper">
      <div className="cop-calendar__weekdays">
        {CALENDAR_WEEKDAYS.map((weekday) => (
          <span key={weekday}>
            {weekday}
          </span>
        ))}
      </div>

      <div className="cop-calendar__grid">
        {days.map((day) => (
          <CalendarDayCell
            key={day.key}
            day={day}
            items={itemsByDate[day.key] ?? []}
            selected={isSameDay(
              selectedDate,
              day.date,
            )}
            onSelect={onSelectDate}
            onOpenItem={onOpenItem}
          />
        ))}
      </div>
    </div>
  );
}

function DetailMeta({
  icon: Icon,
  children,
}) {
  if (!children) {
    return null;
  }

  return (
    <span className="cop-calendar-detail__meta">
      <Icon size={15} />
      {children}
    </span>
  );
}

function CalendarItemDetail({
  item,
  onClose,
}) {
  if (!item) {
    return null;
  }

  const config =
    TYPE_CONFIG[item.type] ??
    TYPE_CONFIG[CALENDAR_ITEM_TYPES.EVENT];

  const Icon = config.icon;

  return (
    <motion.article
      className={`cop-calendar-detail cop-calendar-detail--${config.className}`}
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -8,
      }}
    >
      <header className="cop-calendar-detail__header">
        <span className="cop-calendar-detail__icon">
          <Icon size={21} />
        </span>

        <div>
          <small>
            {CALENDAR_TYPE_LABELS[item.type]}
          </small>
          <h3>{item.title}</h3>
        </div>

        {onClose && (
          <button
            type="button"
            aria-label="Fermer le détail"
            onClick={onClose}
          >
            ×
          </button>
        )}
      </header>

      <div className="cop-calendar-detail__meta-list">
        <DetailMeta icon={CalendarDays}>
          {formatLongDate(item.date)}
        </DetailMeta>

        <DetailMeta icon={Clock3}>
          {item.timeLabel}
        </DetailMeta>

        <DetailMeta icon={MapPin}>
          {item.location}
        </DetailMeta>

        {item.participants?.length > 0 && (
          <DetailMeta icon={Users}>
            {item.participants.join(", ")}
          </DetailMeta>
        )}
      </div>

      {item.type === CALENDAR_ITEM_TYPES.BIKE && (
        <div className="cop-calendar-detail__bike-stats">
          {item.distance && (
            <div>
              <small>Distance</small>
              <strong>{item.distance} km</strong>
            </div>
          )}

          {item.elevation && (
            <div>
              <small>Dénivelé</small>
              <strong>{item.elevation} m</strong>
            </div>
          )}
        </div>
      )}

      {item.type === CALENDAR_ITEM_TYPES.TENNIS &&
        item.score && (
          <div className="cop-calendar-detail__score">
            <small>Score</small>
            <strong>{item.score}</strong>
          </div>
        )}

      {item.type === CALENDAR_ITEM_TYPES.BIRTHDAY &&
        item.age !== null && (
          <div className="cop-calendar-detail__birthday-age">
            <small>Âge fêté</small>
            <strong>{item.age} ans 🎉</strong>
          </div>
        )}

      {item.description && (
        <p className="cop-calendar-detail__description">
          {item.description}
        </p>
      )}
    </motion.article>
  );
}

function CalendarSidebar({
  selectedDate,
  selectedItems,
  openedItem,
  onOpenItem,
  onCloseItem,
}) {
  return (
    <aside className="cop-calendar-sidebar glass-panel">
      <div className="cop-calendar-sidebar__heading">
        <span className="section-heading__eyebrow">
          Journée sélectionnée
        </span>

        <h3>{formatLongDate(selectedDate)}</h3>

        <p>
          {selectedItems.length === 0
            ? "Aucune activité enregistrée."
            : `${selectedItems.length} activité${
                selectedItems.length > 1
                  ? "s"
                  : ""
              } prévue${
                selectedItems.length > 1
                  ? "s"
                  : ""
              }.`}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {openedItem ? (
          <CalendarItemDetail
            key={openedItem.id}
            item={openedItem}
            onClose={onCloseItem}
          />
        ) : (
          <motion.div
            key={toDateKey(selectedDate)}
            className="cop-calendar-sidebar__list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {selectedItems.map((item) => (
              <CalendarItemChip
                key={item.id}
                item={item}
                onClick={onOpenItem}
              />
            ))}

            {selectedItems.length === 0 && (
              <div className="cop-calendar-sidebar__empty">
                <CalendarDays size={28} />

                <strong>Journée libre</strong>

                <span>
                  Aucun événement, match, sortie vélo ou anniversaire
                  à cette date.
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}


function UpcomingBirthdays({
  items,
  onOpenItem,
}) {
  const birthdays = useMemo(
    () =>
      getUpcomingBirthdays(
        items,
        {
          limit: 1,
        },
      ),
    [items],
  );

  if (birthdays.length === 0) {
    return null;
  }

  return (
    <section className="cop-calendar-birthdays glass-panel">
      <div className="cop-calendar-birthdays__heading">
        <div>
          <span className="section-heading__eyebrow">
            Anniversaires
          </span>

          <h3>Prochain anniversaire</h3>
        </div>

        <CakeSlice size={20} />
      </div>

      <div className="cop-calendar-birthdays__list">
        {birthdays.map((item) => (
          <button
            key={item.id}
            type="button"
            className="cop-calendar-birthday-card"
            onClick={() =>
              onOpenItem(item)
            }
          >
            <span className="cop-calendar-birthday-card__icon">
              🎂
            </span>

            <span className="cop-calendar-birthday-card__content">
              <strong>
                {item.member?.nickname ??
                  item.member?.firstName ??
                  "Membre"}
              </strong>

              <small>
                {new Intl.DateTimeFormat(
                  "fr-FR",
                  {
                    day: "numeric",
                    month: "long",
                  },
                ).format(item.date)}
                {item.age !== null
                  ? ` · ${item.age} ans`
                  : ""}
              </small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function CalendarQuickActions({
  onCreateEvent,
  onCreateBikeRide,
  onCreateTennisMatch,
}) {
  return (
    <div className="cop-calendar__quick-actions">
      <button
        type="button"
        className="cop-calendar__quick-action cop-calendar__quick-action--event"
        onClick={onCreateEvent}
      >
        <CalendarDays size={17} />
        <span>Nouvel événement</span>
        <Plus size={15} />
      </button>

      <button
        type="button"
        className="cop-calendar__quick-action cop-calendar__quick-action--bike"
        onClick={onCreateBikeRide}
      >
        <Bike size={17} />
        <span>Nouvelle sortie</span>
        <Plus size={15} />
      </button>

      <button
        type="button"
        className="cop-calendar__quick-action cop-calendar__quick-action--tennis"
        onClick={onCreateTennisMatch}
      >
        <Trophy size={17} />
        <span>Nouveau match</span>
        <Plus size={15} />
      </button>
    </div>
  );
}

function CalendarSection({
  items = [],
  initialMonth = new Date(),
  loading = false,
  error = null,
  onCreateEvent,
  onCreateBikeRide,
  onCreateTennisMatch,
}) {
  const [currentMonth, setCurrentMonth] =
    useState(initialMonth);

  const [selectedDate, setSelectedDate] =
    useState(new Date());

  const [openedItem, setOpenedItem] =
    useState(null);

  const itemsByDate = useMemo(
    () => groupCalendarItemsByDate(items),
    [items],
  );

  const selectedItems = useMemo(
    () =>
      getItemsForDate(
        items,
        selectedDate,
      ),
    [items, selectedDate],
  );

  const currentMonthItems = useMemo(
    () =>
      items.filter((item) => {
        const date = item.date;

        return (
          date.getFullYear() ===
            currentMonth.getFullYear() &&
          date.getMonth() ===
            currentMonth.getMonth()
        );
      }),
    [items, currentMonth],
  );

  const counts = useMemo(
    () => countItemsByType(currentMonthItems),
    [currentMonthItems],
  );

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setOpenedItem(null);

    if (
      date.getMonth() !==
        currentMonth.getMonth() ||
      date.getFullYear() !==
        currentMonth.getFullYear()
    ) {
      setCurrentMonth(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          1,
        ),
      );
    }
  };

  const handleToday = () => {
    const today = new Date();

    setCurrentMonth(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      ),
    );

    setSelectedDate(today);
    setOpenedItem(null);
  };

  const handleOpenBirthday = (item) => {
    setCurrentMonth(
      new Date(
        item.date.getFullYear(),
        item.date.getMonth(),
        1,
      ),
    );
    setSelectedDate(item.date);
    setOpenedItem(item);
  };

  return (
    <section className="cop-calendar">
      <CalendarHeader
        currentMonth={currentMonth}
        counts={counts}
        onPreviousMonth={() => {
          setCurrentMonth(
            addMonths(currentMonth, -1),
          );
          setOpenedItem(null);
        }}
        onNextMonth={() => {
          setCurrentMonth(
            addMonths(currentMonth, 1),
          );
          setOpenedItem(null);
        }}
        onToday={handleToday}
      />

      <CalendarLegend />

      <UpcomingBirthdays
        items={items}
        onOpenItem={handleOpenBirthday}
      />

      <CalendarQuickActions
        onCreateEvent={onCreateEvent}
        onCreateBikeRide={onCreateBikeRide}
        onCreateTennisMatch={onCreateTennisMatch}
      />

      {error && (
        <div className="cop-calendar__status cop-calendar__status--error">
          Impossible de charger une partie du calendrier : {String(error)}
        </div>
      )}

      {loading && (
        <div className="cop-calendar__status">
          Synchronisation du calendrier…
        </div>
      )}

      <div className="cop-calendar__layout">
        <motion.div
          className="cop-calendar__main glass-panel"
          key={formatMonthTitle(currentMonth)}
          initial={{
            opacity: 0,
            x: 10,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.25,
          }}
        >
          <CalendarGrid
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            itemsByDate={itemsByDate}
            onSelectDate={handleSelectDate}
            onOpenItem={(item) => {
              setSelectedDate(item.date);
              setOpenedItem(item);
            }}
          />
        </motion.div>

        <CalendarSidebar
          selectedDate={selectedDate}
          selectedItems={selectedItems}
          openedItem={openedItem}
          onOpenItem={setOpenedItem}
          onCloseItem={() =>
            setOpenedItem(null)
          }
        />
      </div>
    </section>
  );
}

export default CalendarSection;
