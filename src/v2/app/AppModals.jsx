import ScoreModal from "../../components/ScoreModal";
import EventFormModal from "../../components/EventFormModal";
import BikeRideFormModal from "../../components/BikeRideFormModal";

import TribunalFormModal from "../../components/tribunal/TribunalFormModal";
import TribunalCaseModal from "../../components/tribunal/TribunalCaseModal";

import GageFormModal from "../../components/gages/GageFormModal";
import GageDetailsModal from "../../components/gages/GageDetailsModal";

import MemberProfileModal from "../../components/members/MemberProfileModal";

import UploadPhotosModal from "../../components/gallery/UploadPhotosModal";
import GalleryViewer from "../../components/gallery/GalleryViewer";

import EditProfileModal from "../../components/profile/EditProfileModal";
import ChangePasswordModal from "../../components/profile/ChangePasswordModal";

function AppModals({
  members = [],
  user,
  profile,
  isAdmin = false,

  tennisSaving = false,
  scoreModalOpen = false,
  onSaveTennisMatch,
  onCloseScoreModal,

  eventModalOpen = false,
  eventBeingEdited,
  eventsSaving = false,
  onCloseEventModal,
  onSubmitEvent,

  bikeModalOpen = false,
  bikeRideBeingEdited,
  bikeSaving = false,
  onCloseBikeModal,
  onSubmitBikeRide,

  tribunalFormOpen = false,
  tribunalSaving = false,
  tribunalError,
  onCloseTribunalForm,
  onSubmitTribunal,

  tribunalCaseModalOpen = false,
  selectedTribunalCase,
  onCloseTribunalCase,
  onVoteTribunal,
  onStartTribunalVoting,
  onJudgeTribunal,
  onDismissTribunal,

  gageFormOpen = false,
  gagesSaving = false,
  gagesError,
  onCloseGageForm,
  onSubmitGage,

  gageDetailsOpen = false,
  selectedGage,
  gagesUploading = false,
  onCloseGageDetails,
  onStartGage,
  onCompleteGage,
  onValidateGage,
  onCancelGage,
  onUploadGageProof,
  onDeleteGageProof,
  onDeleteGage,

  memberModalOpen = false,
  selectedMember,
  selectedMemberStatistics,
  memberStatisticsLoading = false,
  memberStatisticsError,
  onCloseMemberProfile,

  galleryUploadOpen = false,
  galleryAlbums = [],
  galleryUploading = false,
  galleryUploadProgress = 0,
  onCloseGalleryUpload,
  onUploadGalleryPhotos,

  galleryViewerOpen = false,
  galleryPhotos = [],
  galleryViewerIndex = 0,
  gallerySaving = false,
  onCloseGalleryViewer,
  onPreviousGalleryPhoto,
  onNextGalleryPhoto,
  onLikeGalleryPhoto,
  onAddGalleryComment,
  onEditGalleryComment,
  onDeleteGalleryComment,

  editProfileModalOpen = false,
  personalProfile,
  profileSaving = false,
  onCloseEditProfile,
  onSubmitProfile,

  changePasswordModalOpen = false,
  changingPassword = false,
  onCloseChangePassword,
  onSubmitPassword,
}) {
  const currentProfile =
    profile ?? {
      id: user?.id,
      nickname: "Membre",
      initials: "CP",
    };

  return (
    <>
      <ScoreModal
        open={scoreModalOpen}
        members={members}
        saving={tennisSaving}
        onSave={onSaveTennisMatch}
        onClose={onCloseScoreModal}
      />

      <EventFormModal
        open={eventModalOpen}
        event={eventBeingEdited}
        saving={eventsSaving}
        onClose={onCloseEventModal}
        onSubmit={onSubmitEvent}
      />

      <BikeRideFormModal
        open={bikeModalOpen}
        ride={bikeRideBeingEdited}
        members={members}
        currentProfileId={user?.id}
        saving={bikeSaving}
        onClose={onCloseBikeModal}
        onSubmit={onSubmitBikeRide}
      />

      <TribunalFormModal
        open={tribunalFormOpen}
        members={members}
        currentProfileId={user?.id}
        saving={tribunalSaving}
        error={tribunalError}
        onClose={onCloseTribunalForm}
        onSubmit={onSubmitTribunal}
      />

      <TribunalCaseModal
        open={tribunalCaseModalOpen}
        tribunalCase={selectedTribunalCase}
        currentProfile={currentProfile}
        saving={tribunalSaving}
        error={tribunalError}
        onClose={onCloseTribunalCase}
        onVote={onVoteTribunal}
        onStartVoting={onStartTribunalVoting}
        onJudge={onJudgeTribunal}
        onDismiss={onDismissTribunal}
      />

      <GageFormModal
        open={gageFormOpen}
        members={members}
        currentProfileId={user?.id}
        saving={gagesSaving}
        error={gagesError}
        onClose={onCloseGageForm}
        onSubmit={onSubmitGage}
      />

      <GageDetailsModal
        open={gageDetailsOpen}
        gage={selectedGage}
        currentProfile={currentProfile}
        saving={gagesSaving}
        uploading={gagesUploading}
        error={gagesError}
        onClose={onCloseGageDetails}
        onStart={onStartGage}
        onComplete={onCompleteGage}
        onValidate={onValidateGage}
        onCancel={onCancelGage}
        onUploadProof={onUploadGageProof}
        onDeleteProof={onDeleteGageProof}
        onDelete={onDeleteGage}
      />

      <MemberProfileModal
        open={memberModalOpen}
        member={selectedMember}
        statistics={selectedMemberStatistics}
        loading={memberStatisticsLoading}
        error={memberStatisticsError}
        onClose={onCloseMemberProfile}
      />

      <UploadPhotosModal
        open={galleryUploadOpen}
        albums={galleryAlbums}
        members={members}
        currentProfileId={user?.id}
        uploading={galleryUploading}
        uploadProgress={galleryUploadProgress}
        onClose={onCloseGalleryUpload}
        onUpload={onUploadGalleryPhotos}
      />

      <GalleryViewer
        photos={galleryPhotos}
        currentIndex={galleryViewerIndex}
        isOpen={galleryViewerOpen}
        currentProfile={currentProfile}
        isAdmin={isAdmin}
        saving={gallerySaving}
        onClose={onCloseGalleryViewer}
        onPrevious={onPreviousGalleryPhoto}
        onNext={onNextGalleryPhoto}
        onLike={onLikeGalleryPhoto}
        onAddComment={onAddGalleryComment}
        onEditComment={onEditGalleryComment}
        onDeleteComment={onDeleteGalleryComment}
      />

      <EditProfileModal
        open={editProfileModalOpen}
        profile={personalProfile}
        saving={profileSaving}
        onClose={onCloseEditProfile}
        onSubmit={onSubmitProfile}
      />

      <ChangePasswordModal
        open={changePasswordModalOpen}
        changingPassword={changingPassword}
        onClose={onCloseChangePassword}
        onSubmit={onSubmitPassword}
      />
    </>
  );
}

export default AppModals;