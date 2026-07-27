import {
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Camera,
  ChevronDown,
  Filter,
  Heart,
  ImagePlus,
  Images,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

import GalleryGrid from "./GalleryGrid";

function GallerySection({
  albums = [],
  photos = [],
  loading = false,
  error = null,
  currentProfile,
  isAdmin = false,
  onOpenUpload,
  onOpenPhoto,
  onLikePhoto,
  onDeletePhoto,
}) {
  const [selectedAlbumId, setSelectedAlbumId] =
    useState("all");

  const [selectedAuthorId, setSelectedAuthorId] =
    useState("all");

  const [searchValue, setSearchValue] =
    useState("");

  const authors = useMemo(() => {
    const authorMap = new Map();

    photos.forEach((photo) => {
      if (!photo.uploader?.id) {
        return;
      }

      authorMap.set(
        photo.uploader.id,
        photo.uploader,
      );
    });

    return Array.from(authorMap.values()).sort(
      (authorA, authorB) =>
        authorA.nickname.localeCompare(
          authorB.nickname,
          "fr",
        ),
    );
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    const cleanedSearch =
      searchValue.trim().toLowerCase();

    return photos.filter((photo) => {
      const matchesAlbum =
        selectedAlbumId === "all" ||
        photo.albumId === selectedAlbumId;

      const matchesAuthor =
        selectedAuthorId === "all" ||
        photo.uploadedBy === selectedAuthorId;

      const searchableText = [
        photo.caption,
        photo.fileName,
        photo.album?.name,
        photo.uploader?.nickname,
        ...(photo.taggedMembers ?? []).map(
          (member) => member.nickname,
        ),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !cleanedSearch ||
        searchableText.includes(
          cleanedSearch,
        );

      return (
        matchesAlbum &&
        matchesAuthor &&
        matchesSearch
      );
    });
  }, [
    photos,
    selectedAlbumId,
    selectedAuthorId,
    searchValue,
  ]);

  const totalLikes = useMemo(() => {
    return photos.reduce(
      (total, photo) =>
        total + Number(photo.likeCount ?? 0),
      0,
    );
  }, [photos]);

  const taggedMemberIds = useMemo(() => {
    const ids = new Set();

    photos.forEach((photo) => {
      photo.taggedMembers?.forEach((member) => {
        ids.add(member.id);
      });
    });

    return ids;
  }, [photos]);

  const mostLikedPhoto = useMemo(() => {
    if (photos.length === 0) {
      return null;
    }

    return [...photos].sort(
      (photoA, photoB) =>
        photoB.likeCount - photoA.likeCount,
    )[0];
  }, [photos]);

  const clearFilters = () => {
    setSelectedAlbumId("all");
    setSelectedAuthorId("all");
    setSearchValue("");
  };

  const filtersActive =
    selectedAlbumId !== "all" ||
    selectedAuthorId !== "all" ||
    searchValue.trim() !== "";

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
      >
        <div className="gallery-section__hero-content">
          <span className="section-heading__eyebrow">
            Souvenirs des Co’Pintes
          </span>

          <h2>Galerie photos</h2>

          <p>
            Retrouve les matchs, les sorties vélo,
            les apéros et tous les bons moments du
            groupe au même endroit.
          </p>
        </div>

        <div className="gallery-section__hero-actions">
          <div className="gallery-section__hero-stat">
            <small>Photos</small>
            <strong>{photos.length}</strong>
          </div>

          <div className="gallery-section__hero-stat">
            <small>Albums</small>
            <strong>{albums.length}</strong>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={onOpenUpload}
          >
            <ImagePlus size={18} />
            Ajouter des photos
          </button>
        </div>
      </motion.header>

      <section className="gallery-summary-grid">
        <article className="gallery-summary-card glass-panel">
          <span>
            <Images size={22} />
          </span>

          <div>
            <small>Photos partagées</small>
            <strong>{photos.length}</strong>
          </div>
        </article>

        <article className="gallery-summary-card glass-panel">
          <span>
            <Heart size={22} />
          </span>

          <div>
            <small>Mentions J’aime</small>
            <strong>{totalLikes}</strong>
          </div>
        </article>

        <article className="gallery-summary-card glass-panel">
          <span>
            <Users size={22} />
          </span>

          <div>
            <small>Membres identifiés</small>
            <strong>{taggedMemberIds.size}</strong>
          </div>
        </article>

        <article className="gallery-summary-card glass-panel">
          <span>
            <Sparkles size={22} />
          </span>

          <div>
            <small>Photo favorite</small>
            <strong>
              {mostLikedPhoto
                ? `${mostLikedPhoto.likeCount} likes`
                : "—"}
            </strong>
          </div>
        </article>
      </section>

      <section className="gallery-filters glass-panel">
        <div className="gallery-filters__heading">
          <div>
            <span className="section-heading__eyebrow">
              Explorer
            </span>

            <h3>Filtrer les souvenirs</h3>
          </div>

          <span>
            <Filter size={19} />
          </span>
        </div>

        <div className="gallery-filters__controls">
          <label className="gallery-filters__search">
            <Search size={18} />

            <input
              type="search"
              value={searchValue}
              placeholder="Rechercher une photo, un membre…"
              onChange={(event) =>
                setSearchValue(event.target.value)
              }
            />
          </label>

          <label className="gallery-filters__select">
            <Camera size={18} />

            <select
              value={selectedAlbumId}
              onChange={(event) =>
                setSelectedAlbumId(
                  event.target.value,
                )
              }
            >
              <option value="all">
                Tous les albums
              </option>

              {albums.map((album) => (
                <option
                  key={album.id}
                  value={album.id}
                >
                  {album.name}
                </option>
              ))}
            </select>

            <ChevronDown size={17} />
          </label>

          <label className="gallery-filters__select">
            <Users size={18} />

            <select
              value={selectedAuthorId}
              onChange={(event) =>
                setSelectedAuthorId(
                  event.target.value,
                )
              }
            >
              <option value="all">
                Tous les auteurs
              </option>

              {authors.map((author) => (
                <option
                  key={author.id}
                  value={author.id}
                >
                  {author.nickname}
                </option>
              ))}
            </select>

            <ChevronDown size={17} />
          </label>

          {filtersActive && (
            <button
              type="button"
              className="secondary-button"
              onClick={clearFilters}
            >
              Réinitialiser
            </button>
          )}
        </div>
      </section>

      {error && (
        <div className="data-status data-status--error glass-panel">
          <div>
            <strong>
              Impossible de charger la galerie
            </strong>

            <p>{error}</p>
          </div>
        </div>
      )}

      <GalleryGrid
        photos={filteredPhotos}
        loading={loading}
        currentProfile={currentProfile}
        isAdmin={isAdmin}
        onOpenPhoto={onOpenPhoto}
        onLikePhoto={onLikePhoto}
        onDeletePhoto={onDeletePhoto}
        onUpload={onOpenUpload}
      />
    </section>
  );
}

export default GallerySection;