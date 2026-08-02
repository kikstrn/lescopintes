import {
  useEffect,
  useMemo,
} from "react";

import {
  Award,
  Sparkles,
  X,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { createPortal } from "react-dom";

const CONFETTI_COUNT = 54;

function createConfettiPieces() {
  return Array.from(
    {
      length:
        CONFETTI_COUNT,
    },
    (_, index) => ({
      id: index,

      left:
        (index * 37) % 100,

      delay:
        (index % 12) * 0.06,

      duration:
        2.7 +
        (index % 7) * 0.18,

      rotation:
        180 +
        (index % 9) * 55,

      drift:
        -85 +
        (index % 13) * 14,

      size:
        6 +
        (index % 4) * 2,

      shape:
        index % 3,
    }),
  );
}

function extractBadgeName(
  notification,
) {
  const message =
    notification?.message ?? "";

  const quotedName =
    message.match(
      /badge\s+[«"]([^»"]+)[»"]/i,
    )?.[1];

  return (
    quotedName ??
    notification?.title ??
    "Nouveau badge"
  );
}

function extractDescription(
  notification,
  badgeName,
) {
  const message =
    notification?.message ?? "";

  if (!message) {
    return "Une nouvelle récompense vient d’être ajoutée à ton profil.";
  }

  const prefixPatterns = [
    new RegExp(
      `^Tu as obtenu le badge\\s+[«"]${badgeName.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      )}[»"]\\s*!?\\s*`,
      "i",
    ),

    /^Tu as obtenu un nouveau badge\s*!?\s*/i,
  ];

  let cleanedMessage =
    message;

  for (
    const pattern
    of prefixPatterns
  ) {
    cleanedMessage =
      cleanedMessage.replace(
        pattern,
        "",
      );
  }

  return (
    cleanedMessage.trim() ||
    "Une nouvelle récompense vient d’être ajoutée à ton profil."
  );
}

function BadgeUnlockedCelebration({
  notification,
  open = false,
  onClose,
}) {
  const confettiPieces =
    useMemo(
      createConfettiPieces,
      [],
    );

  const badgeName =
    extractBadgeName(
      notification,
    );

  const description =
    extractDescription(
      notification,
      badgeName,
    );

  useEffect(() => {
    if (
      !open ||
      typeof navigator ===
        "undefined" ||
      typeof navigator.vibrate !==
        "function"
    ) {
      return;
    }

    navigator.vibrate([
      70,
      45,
      110,
    ]);
  }, [open]);

  if (
    typeof document ===
    "undefined"
  ) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open && notification && (
        <motion.div
          className="badge-celebration"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
        >
          <div
            className="badge-celebration__confetti"
            aria-hidden="true"
          >
            {confettiPieces.map(
              (piece) => (
                <motion.span
                  key={piece.id}
                  className={[
                    "badge-celebration__confetti-piece",
                    `badge-celebration__confetti-piece--${piece.shape}`,
                  ].join(" ")}
                  style={{
                    left: `${piece.left}%`,
                    width:
                      piece.size,
                    height:
                      piece.size,
                  }}
                  initial={{
                    y: -40,
                    x: 0,
                    opacity: 0,
                    rotate: 0,
                  }}
                  animate={{
                    y: "105vh",
                    x: piece.drift,
                    opacity: [
                      0,
                      1,
                      1,
                      0,
                    ],
                    rotate:
                      piece.rotation,
                  }}
                  transition={{
                    delay:
                      piece.delay,
                    duration:
                      piece.duration,
                    ease: "easeIn",
                    repeat:
                      Infinity,
                    repeatDelay:
                      0.4,
                  }}
                />
              ),
            )}
          </div>

          <motion.section
            className="badge-celebration__card"
            initial={{
              opacity: 0,
              y: -55,
              scale: 0.82,
              rotateX: -18,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              rotateX: 0,
            }}
            exit={{
              opacity: 0,
              y: -28,
              scale: 0.9,
            }}
            transition={{
              type: "spring",
              stiffness: 265,
              damping: 20,
            }}
            role="status"
            aria-live="polite"
          >
            <button
              type="button"
              className="badge-celebration__close"
              aria-label="Fermer la célébration"
              onClick={onClose}
            >
              <X size={18} />
            </button>

            <motion.div
              className="badge-celebration__icon"
              animate={{
                scale: [
                  1,
                  1.1,
                  1,
                ],
                rotate: [
                  0,
                  -4,
                  4,
                  0,
                ],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Award size={43} />

              <span>
                <Sparkles
                  size={18}
                />
              </span>
            </motion.div>

            <span className="badge-celebration__eyebrow">
              Nouveau badge débloqué
            </span>

            <h2>
              {badgeName}
            </h2>

            <p>
              {description}
            </p>

            <div className="badge-celebration__shine" />
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default BadgeUnlockedCelebration;
