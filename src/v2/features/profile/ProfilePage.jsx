import ProfileSection from "../../../components/profile/ProfileSection";

import { useAppData } from "../../context/AppDataContext";
import { useNavigation } from "../../context/NavigationContext";

function ProfilePage() {
  const {
    personalProfile,
    profileStatistics,

    tennisMatches = [],
    bikeRides = [],
    galleryPhotos = [],
    galleryComments = [],

    loading = {},
    errors = {},

    openEditProfile,
    openChangePassword,
    uploadAvatar,
    deleteAvatar,
  } = useAppData();

  const {
    navigateTo,
  } = useNavigation();

  const activityLoading =
    Boolean(loading.tennis) ||
    Boolean(loading.bike) ||
    Boolean(loading.gallery);

  return (
    <ProfileSection
      profile={personalProfile}
      statistics={profileStatistics}
      tennisMatches={tennisMatches}
      bikeRides={bikeRides}
      galleryPhotos={galleryPhotos}
      galleryComments={galleryComments}
      loading={loading.profile ?? false}
      activityLoading={activityLoading}
      saving={loading.profileSaving ?? false}
      uploadingAvatar={
        loading.uploadingAvatar ?? false
      }
      error={errors.profile ?? null}
      onEditProfile={openEditProfile}
      onChangePassword={
        openChangePassword
      }
      onUploadAvatar={uploadAvatar}
      onDeleteAvatar={deleteAvatar}
      onNavigate={navigateTo}
    />
  );
}

export default ProfilePage;