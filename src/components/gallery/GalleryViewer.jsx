import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { createPortal } from "react-dom";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  ChevronLeft,
  ChevronRight,
  Heart,
  LoaderCircle,
  MessageCircle,
  Pencil,
  Send,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

function formatCommentDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function GalleryViewer({
  photos = [],
  currentIndex = 0,
  isOpen,
  currentProfile,
  isAdmin = false,
  saving = false,
  onClose,
  onPrevious,
  onNext,
  onLike,
  onAddComment,
  onEditComment,
  onDeleteComment,
}) {
  const [zoom, setZoom] = useState(1);
  const [commentValue, setCommentValue] =
    useState("");
  const [editingCommentId, setEditingCommentId] =
    useState(null);
  const [editingValue, setEditingValue] =
    useState("");
  const [commentError, setCommentError] =
    useState("");

  const photo = photos[currentIndex];

  const liked =
    photo?.likedByIds?.includes(
      currentProfile?.id,
    ) ?? false;

  const comments = useMemo(() => {
    return photo?.comments ?? [];
  }, [photo]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (
        event.key === "ArrowLeft" &&
        document.activeElement?.tagName !==
          "TEXTAREA" &&
        document.activeElement?.tagName !==
          "INPUT"
      ) {
        onPrevious?.();
      }

      if (
        event.key === "ArrowRight" &&
        document.activeElement?.tagName !==
          "TEXTAREA" &&
        document.activeElement?.tagName !==
          "INPUT"
      ) {
        onNext?.();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    isOpen,
    onClose,
    onPrevious,
    onNext,
  ]);

  useEffect(() => {
    setZoom(1);
    setCommentValue("");
    setEditingCommentId(null);
    setEditingValue("");
    setCommentError("");
  }, [currentIndex]);

  const handleLike = async () => {
    if (
      !photo?.id ||
      !currentProfile?.id ||
      !onLike
    ) {
      return;
    }

    await onLike({
      photoId: photo.id,
      profileId: currentProfile.id,
    });
  };

  const handleCommentSubmit = async (
    event,
  ) => {
    event.preventDefault();
    setCommentError("");

    const cleanedValue =
      commentValue.trim();

    if (!cleanedValue) {
      setCommentError(
        "Écris un commentaire avant de l’envoyer.",
      );
      return;
    }

    try {
      await onAddComment({
        photoId: photo.id,
        content: cleanedValue,
      });

      setCommentValue("");
    } catch (error) {
      setCommentError(
        error?.message ??
          "Impossible d’ajouter le commentaire.",
      );
    }
  };

  const startEditingComment = (
    comment,
  ) => {
    setEditingCommentId(comment.id);
    setEditingValue(comment.content);
    setCommentError("");
  };

  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditingValue("");
  };

  const saveEditedComment = async (
    commentId,
  ) => {
    const cleanedValue =
      editingValue.trim();

    if (!cleanedValue) {
      setCommentError(
        "Le commentaire ne peut pas être vide.",
      );
      return;
    }

    try {
      await onEditComment({
        photoId: photo.id,
        commentId,
        content: cleanedValue,
      });

      cancelEditingComment();
    } catch (error) {
      setCommentError(
        error?.message ??
          "Impossible de modifier le commentaire.",
      );
    }
  };

  const deleteComment = async (
    commentId,
  ) => {
    const confirmed = window.confirm(
      "Supprimer ce commentaire ?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await onDeleteComment({
        photoId: photo.id,
        commentId,
      });
    } catch (error) {
      setCommentError(
        error?.message ??
          "Impossible de supprimer le commentaire.",
      );
    }
  };

  const viewer = (
    <AnimatePresence>
      {isOpen && photo && (
        <motion.div
          className="gallery-viewer"
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
          <button
            type="button"
            className="gallery-viewer__backdrop"
            aria-label="Fermer la visionneuse"
            onClick={onClose}
          />

          <section className="gallery-viewer__panel">
            <button
              type="button"
              className="gallery-viewer__close"
              aria-label="Fermer"
              onClick={onClose}
            >
              <X size={24} />
            </button>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  className="gallery-viewer__navigation gallery-viewer__navigation--previous"
                  aria-label="Photo précédente"
                  onClick={onPrevious}
                >
                  <ChevronLeft size={25} />
                </button>

                <button
                  type="button"
                  className="gallery-viewer__navigation gallery-viewer__navigation--next"
                  aria-label="Photo suivante"
                  onClick={onNext}
                >
                  <ChevronRight size={25} />
                </button>
              </>
            )}

            <div className="gallery-viewer__layout">
              <div className="gallery-viewer__media">
                <div className="gallery-viewer__image">
                  {photo.signedUrl ? (
                    <motion.img
                      key={photo.id}
                      src={photo.signedUrl}
                      alt={
                        photo.caption ||
                        photo.fileName ||
                        "Photo de la galerie"
                      }
                      initial={{
                        opacity: 0,
                        scale: 0.97,
                      }}
                      animate={{
                        opacity: 1,
                        scale: zoom,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                      draggable="false"
                    />
                  ) : (
                    <div className="gallery-viewer__unavailable">
                      Image indisponible
                    </div>
                  )}
                </div>

                <footer className="gallery-viewer__footer">
                  <div className="gallery-viewer__information">
                    <span>
                      {photo.album?.name ??
                        "Galerie"}
                    </span>

                    <h3>
                      {photo.caption ||
                        "Sans légende"}
                    </h3>

                    <p>
                      Partagée par{" "}
                      <strong>
                        {photo.uploader
                          ?.nickname ??
                          "un membre"}
                      </strong>
                    </p>
                  </div>

                  <div className="gallery-viewer__toolbar">
                    <button
                      type="button"
                      aria-label="Dézoomer"
                      disabled={zoom <= 1}
                      onClick={() =>
                        setZoom(
                          (currentZoom) =>
                            Math.max(
                              1,
                              currentZoom -
                                0.25,
                            ),
                        )
                      }
                    >
                      <ZoomOut size={19} />
                    </button>

                    <span className="gallery-viewer__zoom">
                      {Math.round(
                        zoom * 100,
                      )}
                      %
                    </span>

                    <button
                      type="button"
                      aria-label="Zoomer"
                      disabled={zoom >= 3}
                      onClick={() =>
                        setZoom(
                          (currentZoom) =>
                            Math.min(
                              3,
                              currentZoom +
                                0.25,
                            ),
                        )
                      }
                    >
                      <ZoomIn size={19} />
                    </button>

                    <span className="gallery-viewer__separator" />

                    <button
                      type="button"
                      className={
                        liked
                          ? "gallery-viewer__like gallery-viewer__like--active"
                          : "gallery-viewer__like"
                      }
                      onClick={handleLike}
                    >
                      <Heart
                        size={19}
                        fill={
                          liked
                            ? "currentColor"
                            : "none"
                        }
                      />

                      {photo.likeCount ?? 0}
                    </button>

                    <div className="gallery-viewer__comments-count">
                      <MessageCircle
                        size={19}
                      />

                      {photo.commentCount ??
                        0}
                    </div>
                  </div>
                </footer>
              </div>

              <aside className="gallery-viewer__comments">
                <header className="gallery-viewer__comments-header">
                  <div>
                    <span className="section-heading__eyebrow">
                      Discussion
                    </span>

                    <h3>Commentaires</h3>
                  </div>

                  <span>
                    <MessageCircle
                      size={18}
                    />

                    {comments.length}
                  </span>
                </header>

                <div className="gallery-viewer__comments-list">
                  {comments.length === 0 ? (
                    <div className="gallery-viewer__comments-empty">
                      <MessageCircle
                        size={28}
                      />

                      <strong>
                        Aucun commentaire
                      </strong>

                      <p>
                        Sois le premier à
                        commenter cette photo.
                      </p>
                    </div>
                  ) : (
                    comments.map(
                      (comment) => {
                        const canManage =
                          isAdmin ||
                          comment.profileId ===
                            currentProfile?.id;

                        const editing =
                          editingCommentId ===
                          comment.id;

                        return (
                          <article
                            key={comment.id}
                            className="gallery-viewer__comment"
                          >
                            <span className="gallery-viewer__comment-avatar">
                              {comment.author
                                ?.initials ??
                                "CP"}
                            </span>

                            <div className="gallery-viewer__comment-content">
                              <header>
                                <div>
                                  <strong>
                                    {comment
                                      .author
                                      ?.nickname ??
                                      "Membre"}
                                  </strong>

                                  <small>
                                    {formatCommentDate(
                                      comment.createdAt,
                                    )}
                                  </small>
                                </div>

                                {canManage &&
                                  !editing && (
                                    <div className="gallery-viewer__comment-actions">
                                      <button
                                        type="button"
                                        aria-label="Modifier"
                                        onClick={() =>
                                          startEditingComment(
                                            comment,
                                          )
                                        }
                                      >
                                        <Pencil
                                          size={14}
                                        />
                                      </button>

                                      <button
                                        type="button"
                                        aria-label="Supprimer"
                                        onClick={() =>
                                          deleteComment(
                                            comment.id,
                                          )
                                        }
                                      >
                                        <Trash2
                                          size={14}
                                        />
                                      </button>
                                    </div>
                                  )}
                              </header>

                              {editing ? (
                                <div className="gallery-viewer__comment-edit">
                                  <textarea
                                    value={
                                      editingValue
                                    }
                                    maxLength={500}
                                    disabled={
                                      saving
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      setEditingValue(
                                        event
                                          .target
                                          .value,
                                      )
                                    }
                                  />

                                  <div>
                                    <button
                                      type="button"
                                      className="secondary-button"
                                      disabled={
                                        saving
                                      }
                                      onClick={
                                        cancelEditingComment
                                      }
                                    >
                                      Annuler
                                    </button>

                                    <button
                                      type="button"
                                      className="primary-button"
                                      disabled={
                                        saving
                                      }
                                      onClick={() =>
                                        saveEditedComment(
                                          comment.id,
                                        )
                                      }
                                    >
                                      Enregistrer
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p>
                                  {
                                    comment.content
                                  }
                                </p>
                              )}
                            </div>
                          </article>
                        );
                      },
                    )
                  )}
                </div>

                <form
                  className="gallery-viewer__comment-form"
                  onSubmit={
                    handleCommentSubmit
                  }
                >
                  <span>
                    {currentProfile?.initials ??
                      "CP"}
                  </span>

                  <div>
                    <textarea
                      value={commentValue}
                      maxLength={500}
                      rows={2}
                      disabled={saving}
                      placeholder="Écrire un commentaire…"
                      onChange={(event) => {
                        setCommentValue(
                          event.target.value,
                        );

                        setCommentError("");
                      }}
                    />

                    <small>
                      {commentValue.length} / 500
                    </small>
                  </div>

                  <button
                    type="submit"
                    aria-label="Envoyer le commentaire"
                    disabled={
                      saving ||
                      !commentValue.trim()
                    }
                  >
                    {saving ? (
                      <LoaderCircle
                        className="gallery-viewer__spinner"
                        size={18}
                      />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </form>

                {commentError && (
                  <div className="gallery-viewer__comment-error">
                    {commentError}
                  </div>
                )}
              </aside>
            </div>
          </section>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(
    viewer,
    document.body,
  );
}

export default GalleryViewer;