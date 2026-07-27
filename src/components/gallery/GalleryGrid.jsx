import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  ImageOff,
  Images,
  Plus,
} from "lucide-react";

import GalleryCard from "./GalleryCard";

function GalleryGrid({
  photos = [],
  loading = false,
  currentProfile,
  isAdmin = false,
  onOpenPhoto,
  onLikePhoto,
  onDeletePhoto,
  onUpload,
}) {
  if (loading) {
    return (
      <section className="gallery-grid">
        {Array.from({ length: 8 }).map(
          (_, index) => (
            <div
              key={index}
              className="gallery-grid__skeleton"
            >
              <span />
              <span />
            </div>
          ),
        )}
      </section>
    );
  }

  if (photos.length === 0) {
    return (
      <motion.section
        className="gallery-grid__empty glass-panel"
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <span className="gallery-grid__empty-icon">
          <ImageOff size={34} />
        </span>

        <div>
          <span className="section-heading__eyebrow">
            Galerie
          </span>

          <h3>Aucune photo pour le moment</h3>

          <p>
            Ajoute les premiers souvenirs des
            Co’Pintes pour lancer la galerie.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={onUpload}
        >
          <Plus size={18} />
          Ajouter des photos
        </button>
      </motion.section>
    );
  }

  return (
    <section className="gallery-grid-wrapper">
      <header className="gallery-grid__header">
        <div>
          <span className="section-heading__eyebrow">
            Souvenirs
          </span>

          <h3>
            {photos.length} photo
            {photos.length > 1 ? "s" : ""}
          </h3>
        </div>

        <span className="gallery-grid__count">
          <Images size={16} />
          {photos.length}
        </span>
      </header>

      <motion.section
        layout
        className="gallery-grid"
      >
        <AnimatePresence mode="popLayout">
          {photos.map((photo, index) => (
            <motion.div
              layout
              key={photo.id}
              className="gallery-grid__item"
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
              }}
              transition={{
                delay: Math.min(
                  index * 0.035,
                  0.35,
                ),
              }}
            >
              <GalleryCard
                photo={photo}
                currentProfile={currentProfile}
                isAdmin={isAdmin}
                onOpen={onOpenPhoto}
                onLike={onLikePhoto}
                onDelete={onDeletePhoto}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.section>
    </section>
  );
}

export default GalleryGrid;