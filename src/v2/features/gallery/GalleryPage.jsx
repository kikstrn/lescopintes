import GallerySection from "../../../components/gallery/GallerySection";

import { useAuth } from "../../../context/AuthContext";
import { useAppData } from "../../context/AppDataContext";

function GalleryPage() {
  const {
    profile,
    isAdmin,
  } = useAuth();

  const {
    galleryAlbums = [],
    galleryPhotos = [],

    loading = {},
    errors = {},

    openGalleryUpload,
    openGalleryPhoto,
    likeGalleryPhoto,
    deleteGalleryPhoto,
  } = useAppData();

  return (
    <GallerySection
      albums={galleryAlbums}
      photos={galleryPhotos}
      loading={loading.gallery ?? false}
      error={errors.gallery ?? null}
      currentProfile={profile}
      isAdmin={isAdmin}
      onOpenUpload={openGalleryUpload}
      onOpenPhoto={openGalleryPhoto}
      onLikePhoto={likeGalleryPhoto}
      onDeletePhoto={deleteGalleryPhoto}
    />
  );
}

export default GalleryPage;