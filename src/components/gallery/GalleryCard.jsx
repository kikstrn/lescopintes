import { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Heart,
  MessageCircle,
  MoreVertical,
  Trash2,
  UserRound,
} from "lucide-react";

function formatPhotoDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function GalleryCard({
  photo,
  currentProfile,
  isAdmin = false,
  onOpen,
  onLike,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const liked =
    photo.likedByIds?.includes(
      currentProfile?.id,
    ) ?? false;

  const canDelete =
    isAdmin ||
    photo.uploadedBy ===
      currentProfile?.id;

  const handleDelete = async (
    event,
  ) => {
    event.stopPropagation();

    const confirmed =
      window.confirm(
        "Supprimer définitivement cette photo ?",
      );

    if (!confirmed) {
      return;
    }

    setMenuOpen(false);
    await onDelete(photo);
  };

  const handleLike = async (
    event,
  ) => {
    event.stopPropagation();

    await onLike({
      photoId: photo.id,
      profileId:
        currentProfile.id,
    });
  };

  return (
    <motion.article
      layout
      className="gallery-card"
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.97,
      }}
      whileHover={{
        y: -4,
      }}
      onClick={() =>
        onOpen(photo)
      }
    >
      <div className="gallery-card__image-wrapper">
        {photo.signedUrl ? (
          <img
            src={photo.signedUrl}
            alt={
              photo.caption ||
              photo.fileName ||
              "Photo de la galerie"
            }
            loading="lazy"
          />
        ) : (
          <div className="gallery-card__image-placeholder">
            Image indisponible
          </div>
        )}

        <div className="gallery-card__gradient" />

        {photo.album && (
          <span className="gallery-card__album">
            {photo.album.name}
          </span>
        )}

        {canDelete && (
          <div className="gallery-card__menu-wrapper">
            <button
              type="button"
              className="gallery-card__menu-button"
              aria-label="Actions de la photo"
              onClick={(event) => {
                event.stopPropagation();

                setMenuOpen(
                  (current) =>
                    !current,
                );
              }}
            >
              <MoreVertical
                size={19}
              />
            </button>

            {menuOpen && (
              <motion.div
                className="gallery-card__menu"
                initial={{
                  opacity: 0,
                  y: -5,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
              >
                <button
                  type="button"
                  className="gallery-card__delete"
                  onClick={
                    handleDelete
                  }
                >
                  <Trash2
                    size={16}
                  />
                  Supprimer
                </button>
              </motion.div>
            )}
          </div>
        )}

        <div className="gallery-card__overlay-content">
          {photo.caption && (
            <p>
              {photo.caption}
            </p>
          )}

          <div className="gallery-card__meta">
            <span>
              <UserRound
                size={14}
              />

              {photo.uploader
                ?.nickname ??
                "Un membre"}
            </span>

            {(photo.takenAt ||
              photo.createdAt) && (
              <span>
                <CalendarDays
                  size={14}
                />

                {formatPhotoDate(
                  photo.takenAt ??
                    photo.createdAt,
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      <footer className="gallery-card__footer">
        <button
          type="button"
          className={
            liked
              ? "gallery-card__action gallery-card__action--liked"
              : "gallery-card__action"
          }
          onClick={handleLike}
        >
          <Heart
            size={17}
            fill={
              liked
                ? "currentColor"
                : "none"
            }
          />

          <span>
            {photo.likeCount ?? 0}
          </span>
        </button>

        <button
          type="button"
          className="gallery-card__action"
          onClick={(event) => {
            event.stopPropagation();
            onOpen(photo);
          }}
        >
          <MessageCircle
            size={17}
          />

          <span>
            {photo.commentCount ??
              0}
          </span>
        </button>

        <div className="gallery-card__members">
          {photo.taggedMembers
            ?.slice(0, 4)
            .map((member) => (
              <span
                key={member.id}
                title={
                  member.nickname
                }
              >
                {member.initials}
              </span>
            ))}

          {photo.taggedMembers
            ?.length > 4 && (
            <span>
              +
              {photo.taggedMembers
                .length - 4}
            </span>
          )}
        </div>
      </footer>
    </motion.article>
  );
}

export default GalleryCard;