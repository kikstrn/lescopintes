import { useEffect, useMemo } from "react";

import AppV2 from "../AppV2";
import AppModals from "./AppModals";

import { useAppActions } from "../shared/hooks/useAppActions";
import { useAppModals } from "../shared/hooks/useAppModals";
import { useNotifications } from "../shared/hooks/useNotifications";
import { useActivityFeed } from "../shared/hooks/useActivityFeed";

import useChallenges from "../../hooks/useChallenges";
import { useBikeRides } from "../../hooks/useBikeRides";
import { useEvents } from "../../hooks/useEvents";
import { useGages } from "../../hooks/useGages";
import { useGallery } from "../../hooks/useGallery";
import { useProfile } from "../../hooks/useProfile";
import { useProfiles } from "../../hooks/useProfiles";
import { useTennisMatches } from "../../hooks/useTennisMatches";
import { useTribunalCases } from "../../hooks/useTribunalCases";

import { useAuth } from "../../context/AuthContext";
import { getProfileStatistics } from "../../services/profileService";

function AppController() {
  const activityFeedState =
    useActivityFeed({
      limit: 30,
    });
  const { profile, user, isAdmin } = useAuth();
  const modals = useAppModals();

  const {
    profiles: members,
    loading: profilesLoading,
    error: profilesError,
  } = useProfiles();

  const eventsApi = useEvents();
  const tennisApi = useTennisMatches();
  const bikeApi = useBikeRides();
  const tribunalApi = useTribunalCases(user?.id);
  const galleryApi = useGallery(user?.id);
  const gagesApi = useGages(user?.id);
  const profileApi = useProfile(user?.id);
  const challengesApi = useChallenges();
  const notificationsState = useNotifications();

  const {
    events,
    loading: eventsLoading,
    saving: eventsSaving,
    error: eventsError,
  } = eventsApi;

  const {
    matches: tennisMatches,
    loading: tennisLoading,
    saving: tennisSaving,
    error: tennisError,
  } = tennisApi;

  const {
    rides: bikeRides,
    loading: bikeLoading,
    saving: bikeSaving,
    error: bikeError,
  } = bikeApi;

  const {
    cases: tribunalCases,
    loading: tribunalLoading,
    saving: tribunalSaving,
    error: tribunalError,
  } = tribunalApi;

  const {
    albums: galleryAlbums,
    photos: galleryPhotos,
    loading: galleryLoading,
    saving: gallerySaving,
    uploading: galleryUploading,
    uploadProgress: galleryUploadProgress,
    error: galleryError,
  } = galleryApi;

  const {
    gages,
    loading: gagesLoading,
    saving: gagesSaving,
    uploading: gagesUploading,
    error: gagesError,
  } = gagesApi;

  const {
    profile: personalProfile,
    statistics: profileStatistics,
    loading: profileLoading,
    saving: profileSaving,
    uploadingAvatar,
    changingPassword,
    error: profileError,
  } = profileApi;

  const {
    challenges,
    activeChallenge,
    createChallenge,
    updateChallenge,
    archiveChallenge,
  } = challengesApi;

  const actions = useAppActions({
    user,
    eventsApi,
    tennisApi,
    bikeApi,
    galleryApi,
    profileApi,
    gagesApi,
    tribunalApi: {
      addTribunalCase: tribunalApi.addCase,
      startTribunalVoting: tribunalApi.startVoting,
      voteTribunalCase: tribunalApi.vote,
      judgeTribunalCase: tribunalApi.judgeCase,
      dismissTribunalCase: tribunalApi.dismissCase,
    },
    membersApi: {
      getProfileStatistics,
    },
    modals,
  });

  const galleryComments = useMemo(
    () =>
      galleryPhotos.flatMap((photo) =>
        (photo.comments ?? []).map((comment) => ({
          ...comment,
          photoId: photo.id,
          photoCaption: photo.caption,
          photoSignedUrl: photo.signedUrl,
        })),
      ),
    [galleryPhotos],
  );

  const openGalleryPhoto = (photo) => {
    const index = galleryPhotos.findIndex(
      (galleryPhoto) => galleryPhoto.id === photo?.id,
    );

    if (index >= 0) {
      modals.openGalleryViewer(index);
    }
  };

  const closeScoreModal = () => {
    if (!tennisSaving) {
      modals.closeScoreModal();
    }
  };

  const closeEventModal = () => {
    if (!eventsSaving) {
      modals.closeEventModal();
    }
  };

  const closeBikeRideModal = () => {
    if (!bikeSaving) {
      modals.closeBikeRideModal();
    }
  };

  const closeGalleryUploadModal = () => {
    if (!galleryUploading) {
      modals.closeGalleryUploadModal();
    }
  };

  const closeTribunalForm = () => {
    if (!tribunalSaving) {
      modals.closeTribunalForm();
    }
  };

  const closeTribunalCase = () => {
    if (!tribunalSaving) {
      modals.closeTribunalCase();
    }
  };

  const closeGageForm = () => {
    if (!gagesSaving) {
      modals.closeGageForm();
    }
  };

  const closeGageDetails = () => {
    if (!gagesSaving && !gagesUploading) {
      modals.closeGageDetails();
    }
  };

  const closeEditProfileModal = () => {
    if (!profileSaving) {
      modals.closeEditProfileModal();
    }
  };

  const closeChangePasswordModal = () => {
    if (!changingPassword) {
      modals.closeChangePasswordModal();
    }
  };

  useEffect(() => {
    if (!modals.selectedGage?.id) {
      return;
    }

    const refreshedGage = gages.find(
      (gage) => gage.id === modals.selectedGage.id,
    );

    if (refreshedGage) {
      modals.setSelectedGage(refreshedGage);
    }
  }, [gages, modals.selectedGage?.id, modals.setSelectedGage]);

  useEffect(() => {
    if (!modals.selectedTribunalCase?.id) {
      return;
    }

    const refreshedCase = tribunalCases.find(
      (tribunalCase) =>
        tribunalCase.id === modals.selectedTribunalCase.id,
    );

    if (refreshedCase) {
      modals.setSelectedTribunalCase(refreshedCase);
    }
  }, [
    tribunalCases,
    modals.selectedTribunalCase?.id,
    modals.setSelectedTribunalCase,
  ]);

  const loading = {
    profiles: profilesLoading,
    events: eventsLoading,
    eventsSaving,
    tennis: tennisLoading,
    tennisSaving,
    bike: bikeLoading,
    bikeSaving,
    gallery: galleryLoading,
    gallerySaving,
    galleryUploading,
    tribunal: tribunalLoading,
    tribunalSaving,
    gages: gagesLoading,
    gagesSaving,
    gagesUploading,
    profile: profileLoading,
    profileSaving,
    uploadingAvatar,
    changingPassword,
  };

  const errors = {
    profiles: profilesError,
    events: eventsError,
    tennis: tennisError,
    bike: bikeError,
    gallery: galleryError,
    tribunal: tribunalError,
    gages: gagesError,
    profile: profileError,
  };

  const appData = {
    members,
    events,
    tennisMatches,
    bikeRides,
    galleryAlbums,
    galleryPhotos,
    galleryComments,
    tribunalCases,
    gages,
    challenges,
    activeChallenge,
    personalProfile,
    profileStatistics,
    loading,
    errors,

    openCreateEvent: modals.openCreateEventModal,
    openEditEvent: modals.openEditEventModal,
    deleteEvent: actions.handleDeleteEvent,
    changeEventAttendance: actions.handleAttendance,

    openScoreModal: modals.openScoreModal,

    openCreateBikeRide: modals.openCreateBikeRideModal,
    openEditBikeRide: modals.openEditBikeRideModal,
    deleteBikeRide: actions.handleDeleteBikeRide,
    joinBikeRide: actions.handleJoinBikeRide,
    leaveBikeRide: actions.handleLeaveBikeRide,

    openGalleryUpload: modals.openGalleryUploadModal,
    openGalleryPhoto,
    likeGalleryPhoto: actions.handleGalleryLike,
    deleteGalleryPhoto: actions.handleGalleryPhotoDelete,

    openMemberProfile: actions.handleOpenMemberProfile,

    openGageForm: modals.openGageForm,
    openGageDetails: modals.openGageDetails,

    openTribunalForm: modals.openTribunalForm,
    openTribunalCase: modals.openTribunalCase,

    openEditProfile: modals.openEditProfileModal,
    openChangePassword: modals.openChangePasswordModal,
    uploadAvatar: actions.handleAvatarUpload,
    deleteAvatar: actions.handleAvatarDelete,

    notifications:
      notificationsState.notifications,

    unreadNotificationsCount:
      notificationsState.unreadCount,

    notificationsLoading:
      notificationsState.loading,

    notificationsError:
      notificationsState.error,

    markNotificationAsRead:
      notificationsState.markAsRead,

    markAllNotificationsAsRead:
      notificationsState.markAllAsRead,

    deleteNotification:
      notificationsState.deleteNotification,

    clearReadNotifications:
      notificationsState.clearReadNotifications,

    activityFeed:
      activityFeedState.activities,

    activityFeedLoading:
      activityFeedState.loading,

    activityFeedError:
      activityFeedState.error,

    refreshActivityFeed:
      activityFeedState.refreshActivityFeed,

    createChallenge,
    updateChallenge,
    archiveChallenge,
  };

  return (
    <>
      <AppV2 appData={appData} />

      <AppModals
        members={members}
        user={user}
        profile={profile}
        isAdmin={isAdmin}

        scoreModalOpen={modals.scoreModalOpen}
        tennisSaving={tennisSaving}
        onSaveTennisMatch={actions.handleSaveTennisMatch}
        onCloseScoreModal={closeScoreModal}

        eventModalOpen={modals.eventModalOpen}
        eventBeingEdited={modals.eventBeingEdited}
        eventsSaving={eventsSaving}
        onCloseEventModal={closeEventModal}
        onSubmitEvent={actions.handleEventSubmit}

        bikeModalOpen={modals.bikeModalOpen}
        bikeRideBeingEdited={modals.bikeRideBeingEdited}
        bikeSaving={bikeSaving}
        onCloseBikeModal={closeBikeRideModal}
        onSubmitBikeRide={actions.handleBikeRideSubmit}

        tribunalFormOpen={modals.tribunalFormOpen}
        tribunalSaving={tribunalSaving}
        tribunalError={tribunalError}
        onCloseTribunalForm={closeTribunalForm}
        onSubmitTribunal={actions.handleTribunalSubmit}

        tribunalCaseModalOpen={modals.tribunalCaseModalOpen}
        selectedTribunalCase={modals.selectedTribunalCase}
        onCloseTribunalCase={closeTribunalCase}
        onVoteTribunal={actions.handleTribunalVote}
        onStartTribunalVoting={actions.handleStartTribunalVoting}
        onJudgeTribunal={actions.handleJudgeTribunalCase}
        onDismissTribunal={actions.handleDismissTribunalCase}

        gageFormOpen={modals.gageFormOpen}
        gagesSaving={gagesSaving}
        gagesError={gagesError}
        onCloseGageForm={closeGageForm}
        onSubmitGage={actions.handleGageSubmit}

        gageDetailsOpen={modals.gageDetailsOpen}
        selectedGage={modals.selectedGage}
        gagesUploading={gagesUploading}
        onCloseGageDetails={closeGageDetails}
        onStartGage={actions.handleStartGage}
        onCompleteGage={actions.handleCompleteGage}
        onValidateGage={actions.handleValidateGage}
        onCancelGage={actions.handleCancelGage}
        onUploadGageProof={actions.handleUploadGageProof}
        onDeleteGageProof={actions.handleDeleteGageProof}
        onDeleteGage={actions.handleDeleteGage}

        memberModalOpen={modals.memberModalOpen}
        selectedMember={modals.selectedMember}
        selectedMemberStatistics={modals.selectedMemberStatistics}
        memberStatisticsLoading={modals.memberStatisticsLoading}
        memberStatisticsError={modals.memberStatisticsError}
        onCloseMemberProfile={actions.handleCloseMemberProfile}

        galleryUploadOpen={modals.galleryUploadOpen}
        galleryAlbums={galleryAlbums}
        galleryUploading={galleryUploading}
        galleryUploadProgress={galleryUploadProgress}
        onCloseGalleryUpload={closeGalleryUploadModal}
        onUploadGalleryPhotos={actions.handleGalleryUpload}

        galleryViewerOpen={modals.galleryViewerOpen}
        galleryPhotos={galleryPhotos}
        galleryViewerIndex={modals.galleryViewerIndex}
        gallerySaving={gallerySaving}
        onCloseGalleryViewer={modals.closeGalleryViewer}
        onPreviousGalleryPhoto={() =>
          actions.showPreviousGalleryPhoto(galleryPhotos.length)
        }
        onNextGalleryPhoto={() =>
          actions.showNextGalleryPhoto(galleryPhotos.length)
        }
        onLikeGalleryPhoto={actions.handleGalleryLike}
        onAddGalleryComment={actions.handleGalleryCommentAdd}
        onEditGalleryComment={actions.handleGalleryCommentEdit}
        onDeleteGalleryComment={actions.handleGalleryCommentDelete}

        editProfileModalOpen={modals.editProfileModalOpen}
        personalProfile={personalProfile}
        profileSaving={profileSaving}
        onCloseEditProfile={closeEditProfileModal}
        onSubmitProfile={actions.handleProfileSubmit}

        changePasswordModalOpen={modals.changePasswordModalOpen}
        changingPassword={changingPassword}
        onCloseChangePassword={closeChangePasswordModal}
        onSubmitPassword={actions.handlePasswordSubmit}
      />
    </>
  );
}

export default AppController;
