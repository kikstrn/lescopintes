import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Camera,
  ChevronLeft,
  ChevronRight,
  Heart,
  Images,
  MapPin,
  Plus,
  X,
} from "lucide-react";

const galleryItems = [
  {
    id: 1,
    title: "Tournoi des Co’Pintes",
    category: "tennis",
    date: "12 juillet 2026",
    location: "Tennis Club de Cuincy",
    image: "/images/gallery/tennis-1.jpg",
    reactions: 14,
    featured: true,
  },
  {
    id: 2,
    title: "Sortie le long de la Scarpe",
    category: "bike",
    date: "5 juillet 2026",
    location: "Douaisis",
    image: "/images/gallery/bike-1.jpg",
    reactions: 11,
  },
  {
    id: 3,
    title: "Apéro chez Tonton",
    category: "party",
    date: "27 juin 2026",
    location: "Chez Tonton",
    image: "/images/gallery/party-1.jpg",
    reactions: 18,
  },
  {
    id: 4,
    title: "Double Kiks & Raf",
    category: "tennis",
    date: "20 juin 2026",
    location: "Cuincy",
    image: "/images/gallery/tennis-2.jpg",
    reactions: 9,
  },
  {
    id: 5,
    title: "Pause vélo bien méritée",
    category: "bike",
    date: "14 juin 2026",
    location: "Bord de Scarpe",
    image: "/images/gallery/bike-2.jpg",
    reactions: 13,
  },
  {
    id: 6,
    title: "Barbecue des Co’Pintes",
    category: "party",
    date: "6 juin 2026",
    location: "Chez Fab",
    image: "/images/gallery/party-2.jpg",
    reactions: 21,
    featured: true,
  },
  {
    id: 7,
    title: "Entraînement du mercredi",
    category: "tennis",
    date: "3 juin 2026",
    location: "Tennis Club de Cuincy",
    image: "/images/gallery/tennis-3.jpg",
    reactions: 8,
  },
  {
    id: 8,
    title: "Boucle du dimanche matin",
    category: "bike",
    date: "31 mai 2026",
    location: "Cuincy",
    image: "/images/gallery/bike-3.jpg",
    reactions: 10,
  },
];

const filters = [
  {
    id: "all",
    label: "Toutes",
  },
  {
    id: "tennis",
    label: "Tennis",
  },
  {
    id: "bike",
    label: "Cyclisme",
  },
  {
    id: "party",
    label: "Apéros",
  },
];

const categoryLabels = {
  tennis: "Tennis",
  bike: "Cyclisme",
  party: "Apéro",
};

function GallerySection() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedPhotoId, setSelectedPhotoId] = useState(null);
  const [likedPhotos, setLikedPhotos] = useState([]);

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") {
      return galleryItems;
    }

    return galleryItems.filter((item) => {
      return item.category === activeFilter;
    });
  }, [activeFilter]);

  const selectedPhoto = galleryItems.find((item) => {
    return item.id === selectedPhotoId;
  });

  const selectedPhotoIndex = selectedPhoto
    ? galleryItems.findIndex((item) => item.id === selectedPhoto.id)
    : -1;

  const toggleLike = (photoId) => {
    setLikedPhotos((currentPhotos) => {
      if (currentPhotos.includes(photoId)) {
        return currentPhotos.filter((id) => id !== photoId);
      }

      return [...currentPhotos, photoId];
    });
  };

  const showPreviousPhoto = () => {
    if (selectedPhotoIndex < 0) {
      return;
    }

    const previousIndex =
      selectedPhotoIndex === 0
        ? galleryItems.length - 1
        : selectedPhotoIndex - 1;

    setSelectedPhotoId(galleryItems[previousIndex].id);
  };

  const showNextPhoto = () => {
    if (selectedPhotoIndex < 0) {
      return;
    }

    const nextIndex =
      selectedPhotoIndex === galleryItems.length - 1
        ? 0
        : selectedPhotoIndex + 1;

    setSelectedPhotoId(galleryItems[nextIndex].id);
  };

  return (
    <section className="gallery-section">
      <motion.header
        className="gallery-section__hero glass-panel"
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="gallery-section__hero-content">
          <span className="section-heading__eyebrow">
            Souvenirs
          </span>

          <h2>Galerie des Co’Pintes</h2>

          <p>
            Retrouve les meilleurs moments du groupe : matchs,
            sorties vélo, apéros et souvenirs mémorables.
          </p>
        </div>

        <motion.button
          type="button"
          className="primary-button"
          whileHover={{
            y: -2,
          }}
          whileTap={{
            scale: 0.97,
          }}
        >
          <Plus size={18} />
          Ajouter une photo
        </motion.button>
      </motion.header>

      <div className="gallery-section__toolbar">
        <div className="gallery-filters">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;

            return (
              <button
                key={filter.id}
                type="button"
                className={`gallery-filter ${
                  isActive ? "gallery-filter--active" : ""
                }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {isActive && (
                  <motion.span
                    layoutId="gallery-active-filter"
                    className="gallery-filter__background"
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 34,
                    }}
                  />
                )}

                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>

        <div className="gallery-section__counter">
          <Images size={17} />
          <span>
            {filteredItems.length} photo
            {filteredItems.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          className="gallery-grid"
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -10,
          }}
          transition={{
            duration: 0.28,
          }}
        >
          {filteredItems.map((item, index) => {
            const isLiked = likedPhotos.includes(item.id);

            return (
              <motion.article
                key={item.id}
                className={`gallery-card ${
                  item.featured ? "gallery-card--featured" : ""
                }`}
                initial={{
                  opacity: 0,
                  y: 18,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                whileHover={{
                  y: -6,
                }}
                transition={{
                  delay: index * 0.05,
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <button
                  type="button"
                  className="gallery-card__image-button"
                  onClick={() => setSelectedPhotoId(item.id)}
                  aria-label={`Ouvrir la photo ${item.title}`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="gallery-card__image"
                  />

                  <span className="gallery-card__overlay" />

                  <span className="gallery-card__category">
                    {categoryLabels[item.category]}
                  </span>

                  <span className="gallery-card__zoom">
                    <Camera size={18} />
                    Voir la photo
                  </span>
                </button>

                <div className="gallery-card__content">
                  <div className="gallery-card__heading">
                    <div>
                      <h3>{item.title}</h3>

                      <span>
                        <CalendarDays size={14} />
                        {item.date}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`gallery-card__like ${
                        isLiked ? "gallery-card__like--active" : ""
                      }`}
                      aria-label={
                        isLiked
                          ? "Retirer la réaction"
                          : "Ajouter une réaction"
                      }
                      onClick={() => toggleLike(item.id)}
                    >
                      <Heart
                        size={18}
                        fill={isLiked ? "currentColor" : "none"}
                      />

                      <span>
                        {item.reactions + (isLiked ? 1 : 0)}
                      </span>
                    </button>
                  </div>

                  <div className="gallery-card__location">
                    <MapPin size={14} />
                    {item.location}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {filteredItems.length === 0 && (
        <div className="gallery-empty glass-panel">
          <span>
            <Images size={30} />
          </span>

          <h3>Aucune photo</h3>

          <p>
            Aucune photo n’est encore disponible dans cette catégorie.
          </p>
        </div>
      )}

      <AnimatePresence>
        {selectedPhoto && (
          <>
            <motion.button
              type="button"
              className="gallery-viewer__overlay"
              aria-label="Fermer la galerie"
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
                scale: 0.97,
              }}
              onClick={() => setSelectedPhotoId(null)}
            />

            <motion.section
              className="gallery-viewer"
              role="dialog"
              aria-modal="true"
              aria-label={selectedPhoto.title}
              initial={{
                opacity: 0,
                scale: 0.94,
                y: 25,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 15,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 28,
              }}
            >
              <div className="gallery-viewer__image-wrapper">
                <motion.img
                  key={selectedPhoto.id}
                  src={selectedPhoto.image}
                  alt={selectedPhoto.title}
                  className="gallery-viewer__image"
                  initial={{
                    opacity: 0,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                />

                <button
                  type="button"
                  className="gallery-viewer__close icon-button"
                  aria-label="Fermer"
                  onClick={() => setSelectedPhotoId(null)}
                >
                  <X size={21} />
                </button>

                <button
                  type="button"
                  className="gallery-viewer__navigation gallery-viewer__navigation--previous"
                  aria-label="Photo précédente"
                  onClick={showPreviousPhoto}
                >
                  <ChevronLeft size={24} />
                </button>

                <button
                  type="button"
                  className="gallery-viewer__navigation gallery-viewer__navigation--next"
                  aria-label="Photo suivante"
                  onClick={showNextPhoto}
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              <div className="gallery-viewer__details">
                <div>
                  <span className="section-heading__eyebrow">
                    {categoryLabels[selectedPhoto.category]}
                  </span>

                  <h3>{selectedPhoto.title}</h3>
                </div>

                <div className="gallery-viewer__meta">
                  <span>
                    <CalendarDays size={15} />
                    {selectedPhoto.date}
                  </span>

                  <span>
                    <MapPin size={15} />
                    {selectedPhoto.location}
                  </span>
                </div>

                <button
                  type="button"
                  className={`gallery-viewer__like ${
                    likedPhotos.includes(selectedPhoto.id)
                      ? "gallery-viewer__like--active"
                      : ""
                  }`}
                  onClick={() => toggleLike(selectedPhoto.id)}
                >
                  <Heart
                    size={18}
                    fill={
                      likedPhotos.includes(selectedPhoto.id)
                        ? "currentColor"
                        : "none"
                    }
                  />

                  {selectedPhoto.reactions +
                    (likedPhotos.includes(selectedPhoto.id) ? 1 : 0)}{" "}
                  réactions
                </button>
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

export default GallerySection;