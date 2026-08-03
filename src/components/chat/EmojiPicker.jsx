import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Search,
  X,
} from "lucide-react";

const EMOJI_CATEGORIES = [
  {
    id: "recent",
    label: "Récents",
    icon: "🕘",
    emojis: [],
  },
  {
    id: "smileys",
    label: "Smileys",
    icon: "😊",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅",
      "😂", "🤣", "😊", "🙂", "🙃", "😉",
      "😍", "🥰", "😘", "😎", "🤩", "🥳",
      "😏", "😌", "😴", "🤔", "🤨", "😐",
      "😑", "🙄", "😬", "🤐", "😮", "😲",
      "😳", "🥺", "😭", "😤", "😡", "🤯",
    ],
  },
  {
    id: "gestures",
    label: "Gestes",
    icon: "👍",
    emojis: [
      "👍", "👎", "👌", "✌️", "🤞", "🤟",
      "🤘", "👏", "🙌", "🫶", "🤝", "🙏",
      "💪", "👊", "✊", "🤜", "🤛", "👋",
    ],
  },
  {
    id: "hearts",
    label: "Émotions",
    icon: "❤️",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜",
      "🖤", "🤍", "🤎", "💔", "❣️", "💕",
      "💞", "💓", "💗", "💖", "💘", "💝",
      "🔥", "✨", "⭐", "💫", "💥", "💯",
    ],
  },
  {
    id: "club",
    label: "Co’Pintes",
    icon: "🎾",
    emojis: [
      "🎾", "🚴", "🍺", "🍻", "🏆", "🥇",
      "🥈", "🥉", "🏅", "🎯", "🎉", "🥂",
      "🍕", "🍔", "🌭", "🥩", "☕", "🎮",
      "😈", "⚖️", "🎲", "📸", "🚀", "💪",
    ],
  },
];

const STORAGE_KEY =
  "copintes-recent-emojis";

function loadRecentEmojis() {
  try {
    const value =
      window.localStorage.getItem(
        STORAGE_KEY,
      );

    const parsed =
      value ? JSON.parse(value) : [];

    return Array.isArray(parsed)
      ? parsed.slice(0, 18)
      : [];
  } catch {
    return [];
  }
}

function saveRecentEmoji(
  emoji,
  currentItems,
) {
  const nextItems = [
    emoji,
    ...currentItems.filter(
      (item) => item !== emoji,
    ),
  ].slice(0, 18);

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextItems),
    );
  } catch {
    // Le sélecteur reste utilisable sans localStorage.
  }

  return nextItems;
}

function EmojiPicker({
  open = false,
  onSelect,
  onClose,
  title = "Choisir un emoji",
  compact = false,
}) {
  const [activeCategory, setActiveCategory] =
    useState("smileys");

  const [search, setSearch] =
    useState("");

  const [recentEmojis, setRecentEmojis] =
    useState([]);

  const pickerRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setRecentEmojis(
      loadRecentEmojis(),
    );
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (
      event,
    ) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(
          event.target,
        )
      ) {
        onClose?.();
      }
    };

    const handleKeyDown = (
      event,
    ) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    open,
    onClose,
  ]);

  const categories =
    useMemo(
      () =>
        EMOJI_CATEGORIES.map(
          (category) =>
            category.id === "recent"
              ? {
                  ...category,
                  emojis:
                    recentEmojis,
                }
              : category,
        ).filter(
          (category) =>
            category.id !== "recent" ||
            category.emojis.length > 0,
        ),
      [recentEmojis],
    );

  const visibleEmojis =
    useMemo(() => {
      if (search.trim()) {
        /*
         * Les emojis n'ont pas de libellé textuel dans
         * cette version légère : la recherche permet
         * surtout de coller directement un emoji.
         */
        const value =
          search.trim();

        return categories
          .flatMap(
            (category) =>
              category.emojis,
          )
          .filter(
            (emoji, index, array) =>
              emoji.includes(value) &&
              array.indexOf(emoji) ===
                index,
          );
      }

      return (
        categories.find(
          (category) =>
            category.id ===
            activeCategory,
        )?.emojis ?? []
      );
    }, [
      activeCategory,
      categories,
      search,
    ]);

  const handleSelect = (
    emoji,
  ) => {
    setRecentEmojis(
      (currentItems) =>
        saveRecentEmoji(
          emoji,
          currentItems,
        ),
    );

    onSelect?.(emoji);
  };

  if (!open) {
    return null;
  }

  return (
    <section
      ref={pickerRef}
      className={[
        "emoji-picker",
        compact
          ? "emoji-picker--compact"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={title}
    >
      <header className="emoji-picker__header">
        <div>
          <span>Emoji</span>
          <strong>{title}</strong>
        </div>

        <button
          type="button"
          aria-label="Fermer le sélecteur"
          onClick={onClose}
        >
          <X size={17} />
        </button>
      </header>

      {!compact && (
        <label className="emoji-picker__search">
          <Search size={15} />

          <input
            type="text"
            value={search}
            placeholder="Coller un emoji…"
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
          />
        </label>
      )}

      <div className="emoji-picker__categories">
        {categories.map(
          (category) => (
            <button
              key={category.id}
              type="button"
              className={
                activeCategory ===
                category.id
                  ? "emoji-picker__category emoji-picker__category--active"
                  : "emoji-picker__category"
              }
              title={category.label}
              aria-label={category.label}
              onClick={() => {
                setActiveCategory(
                  category.id,
                );
                setSearch("");
              }}
            >
              {category.icon}
            </button>
          ),
        )}
      </div>

      <div className="emoji-picker__grid">
        {visibleEmojis.length === 0 ? (
          <p className="emoji-picker__empty">
            Aucun emoji trouvé.
          </p>
        ) : (
          visibleEmojis.map(
            (emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                type="button"
                onClick={() =>
                  handleSelect(emoji)
                }
              >
                {emoji}
              </button>
            ),
          )
        )}
      </div>
    </section>
  );
}

export default EmojiPicker;
