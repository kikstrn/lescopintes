import {
  UserRound,
} from "lucide-react";

import ProfileActivity from "./ProfileActivity";
import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";

function ProfileSection({
  profile,
  statistics,

  tennisMatches = [],
  bikeRides = [],
  galleryPhotos = [],
  galleryComments = [],

  loading = false,
  activityLoading = false,
  saving = false,
  uploadingAvatar = false,
  error = null,

  onEditProfile,
  onChangePassword,
  onUploadAvatar,
  onDeleteAvatar,
  onNavigate,
}) {
  if (loading) {
    return (
      <section className="profile-section">
        <div className="profile-loading glass-panel">
          <span className="data-status__spinner" />

          <div>
            <strong>
              Chargement du profil
            </strong>

            <p>
              Récupération de tes informations et de tes statistiques…
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="profile-section">
        <div className="profile-empty glass-panel">
          <span>
            <UserRound size={35} />
          </span>

          <h2>Profil introuvable</h2>

          <p>
            Impossible de charger les informations de ton compte.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-section">
      <ProfileHeader
        profile={profile}
        saving={saving}
        uploadingAvatar={uploadingAvatar}
        error={error}
        onEditProfile={onEditProfile}
        onChangePassword={onChangePassword}
        onUploadAvatar={onUploadAvatar}
        onDeleteAvatar={onDeleteAvatar}
      />

      <ProfileStats
        statistics={statistics}
      />

      <ProfileActivity
        tennisMatches={tennisMatches}
        bikeRides={bikeRides}
        galleryPhotos={galleryPhotos}
        galleryComments={galleryComments}
        currentProfileId={profile.id}
        loading={activityLoading}
        onNavigate={onNavigate}
      />
    </section>
  );
}

export default ProfileSection;