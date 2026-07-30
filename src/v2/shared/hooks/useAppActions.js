import { useCallback } from "react";

export function useAppActions({
  user,
  eventsApi,
  tennisApi,
  bikeApi,
  galleryApi,
  profileApi,
  gagesApi,
  tribunalApi,
  membersApi,
  modals,
}) {
  const {
    addEvent,
    editEvent,
    removeEvent,
    changeAttendance,
  } = eventsApi;

  const { addMatch } = tennisApi;

  const {
    addRide,
    editRide,
    removeRide,
    joinRide,
    leaveRide,
  } = bikeApi;

  const {
    uploadPhotos,
    removePhoto,
    toggleLike,
    addComment,
    editComment,
    removeComment,
  } = galleryApi;

  const {
    saveProfile,
    saveAvatar,
    removeAvatar,
    savePassword,
    refreshProfile,
  } = profileApi;

  const {
    addGage,
    startGage,
    completeGage,
    validateGage,
    cancelGage,
    uploadProof,
    removeProof,
    removeGage,
  } = gagesApi;

  const {
    addTribunalCase,
    startTribunalVoting,
    voteTribunalCase,
    judgeTribunalCase,
    dismissTribunalCase,
  } = tribunalApi;

  const { getProfileStatistics } = membersApi;

  const {
    eventBeingEdited,
    bikeRideBeingEdited,

    setScoreModalOpen,
    setEventModalOpen,
    setEventBeingEdited,
    setBikeModalOpen,
    setBikeRideBeingEdited,

    setGalleryUploadOpen,
    setGalleryViewerOpen,
    setGalleryViewerIndex,

    setEditProfileModalOpen,
    setChangePasswordModalOpen,

    setGageFormOpen,
    setGageDetailsOpen,
    setSelectedGage,

    setTribunalFormOpen,
    setTribunalCaseModalOpen,
    setSelectedTribunalCase,

    setMemberModalOpen,
    setSelectedMember,
    setSelectedMemberStatistics,
    setMemberStatisticsLoading,
    setMemberStatisticsError,
  } = modals;

  const handleSaveTennisMatch = useCallback(
    async (matchData) => {
      await addMatch(matchData);
      setScoreModalOpen(false);
    },
    [addMatch, setScoreModalOpen],
  );

  const handleEventSubmit = useCallback(
    async (eventData) => {
      if (eventBeingEdited) {
        await editEvent(eventBeingEdited.id, eventData);
      } else {
        if (!user?.id) {
          throw new Error("Utilisateur connecté introuvable.");
        }

        await addEvent({
          ...eventData,
          createdBy: user.id,
        });
      }

      setEventModalOpen(false);
      setEventBeingEdited(null);
    },
    [
      addEvent,
      editEvent,
      eventBeingEdited,
      setEventBeingEdited,
      setEventModalOpen,
      user?.id,
    ],
  );

  const handleAttendance = useCallback(
    async ({ eventId, attendanceStatus }) => {
      if (!user?.id) {
        throw new Error("Utilisateur connecté introuvable.");
      }

      await changeAttendance({
        eventId,
        profileId: user.id,
        attendanceStatus,
      });
    },
    [changeAttendance, user?.id],
  );

  const handleDeleteEvent = useCallback(
    async (eventId) => {
      await removeEvent(eventId);
    },
    [removeEvent],
  );

  const handleBikeRideSubmit = useCallback(
    async (rideData) => {
      if (bikeRideBeingEdited) {
        await editRide(bikeRideBeingEdited.id, rideData);
      } else {
        if (!user?.id) {
          throw new Error("Utilisateur connecté introuvable.");
        }

        await addRide({
          ...rideData,
          createdBy: user.id,
        });
      }

      setBikeModalOpen(false);
      setBikeRideBeingEdited(null);
    },
    [
      addRide,
      bikeRideBeingEdited,
      editRide,
      setBikeModalOpen,
      setBikeRideBeingEdited,
      user?.id,
    ],
  );

  const handleJoinBikeRide = useCallback(
    async (rideId) => {
      if (!user?.id) {
        throw new Error("Utilisateur connecté introuvable.");
      }

      await joinRide({
        rideId,
        profileId: user.id,
      });
    },
    [joinRide, user?.id],
  );

  const handleLeaveBikeRide = useCallback(
    async (rideId) => {
      if (!user?.id) {
        throw new Error("Utilisateur connecté introuvable.");
      }

      await leaveRide({
        rideId,
        profileId: user.id,
      });
    },
    [leaveRide, user?.id],
  );

  const handleDeleteBikeRide = useCallback(
    async (rideId) => {
      await removeRide(rideId);
    },
    [removeRide],
  );

  const handleGalleryUpload = useCallback(
    async (uploadData) => {
      await uploadPhotos(uploadData);
      setGalleryUploadOpen(false);
    },
    [setGalleryUploadOpen, uploadPhotos],
  );

  const handleGalleryLike = useCallback(
    async ({ photoId, profileId }) => {
      await toggleLike({ photoId, profileId });
    },
    [toggleLike],
  );

  const handleGalleryPhotoDelete = useCallback(
    async (photo) => {
      await removePhoto(photo);
      setGalleryViewerOpen(false);
    },
    [removePhoto, setGalleryViewerOpen],
  );

  const handleGalleryCommentAdd = useCallback(
    async ({ photoId, content }) => {
      if (!user?.id) {
        throw new Error("Utilisateur connecté introuvable.");
      }

      return addComment({
        photoId,
        profileId: user.id,
        content,
      });
    },
    [addComment, user?.id],
  );

  const handleGalleryCommentEdit = useCallback(
    async ({ photoId, commentId, content }) => {
      return editComment({ photoId, commentId, content });
    },
    [editComment],
  );

  const handleGalleryCommentDelete = useCallback(
    async ({ photoId, commentId }) => {
      return removeComment({ photoId, commentId });
    },
    [removeComment],
  );

  const showPreviousGalleryPhoto = useCallback(
    (photosLength) => {
      setGalleryViewerIndex((currentIndex) =>
        currentIndex <= 0
          ? Math.max(Number(photosLength) - 1, 0)
          : currentIndex - 1,
      );
    },
    [setGalleryViewerIndex],
  );

  const showNextGalleryPhoto = useCallback(
    (photosLength) => {
      setGalleryViewerIndex((currentIndex) =>
        currentIndex >= Number(photosLength) - 1
          ? 0
          : currentIndex + 1,
      );
    },
    [setGalleryViewerIndex],
  );

  const handleProfileSubmit = useCallback(
    async (profileData) => {
      await saveProfile(profileData);
      setEditProfileModalOpen(false);
      await refreshProfile({ showLoading: false });
    },
    [refreshProfile, saveProfile, setEditProfileModalOpen],
  );

  const handleAvatarUpload = useCallback(
    async (file) => {
      await saveAvatar(file);
      await refreshProfile({ showLoading: false });
    },
    [refreshProfile, saveAvatar],
  );

  const handleAvatarDelete = useCallback(async () => {
    await removeAvatar();
    await refreshProfile({ showLoading: false });
  }, [refreshProfile, removeAvatar]);

  const handlePasswordSubmit = useCallback(
    async (newPassword) => {
      await savePassword(newPassword);
      setChangePasswordModalOpen(false);
    },
    [savePassword, setChangePasswordModalOpen],
  );

  const handleGageSubmit = useCallback(
    async (gageData) => {
      await addGage(gageData);
      setGageFormOpen(false);
    },
    [addGage, setGageFormOpen],
  );

  const handleStartGage = useCallback(
    async (gage) => {
      await startGage(gage);
    },
    [startGage],
  );

  const handleCompleteGage = useCallback(
    async (gage) => {
      await completeGage(gage);
    },
    [completeGage],
  );

  const handleValidateGage = useCallback(
    async (gage) => {
      if (!window.confirm("Valider définitivement ce gage ?")) {
        return;
      }
      await validateGage(gage);
    },
    [validateGage],
  );

  const handleCancelGage = useCallback(
    async (gage) => {
      if (!window.confirm("Annuler définitivement ce gage ?")) {
        return;
      }
      await cancelGage(gage);
    },
    [cancelGage],
  );

  const handleUploadGageProof = useCallback(
    async ({ gage, file }) => {
      await uploadProof({ gage, file });
    },
    [uploadProof],
  );

  const handleDeleteGageProof = useCallback(
    async (gage) => {
      if (!window.confirm("Supprimer cette preuve ?")) {
        return;
      }
      await removeProof(gage);
    },
    [removeProof],
  );

  const handleDeleteGage = useCallback(
    async (gage) => {
      if (!window.confirm("Supprimer définitivement ce gage ?")) {
        return;
      }

      await removeGage(gage);
      setGageDetailsOpen(false);
      window.setTimeout(() => setSelectedGage(null), 220);
    },
    [removeGage, setGageDetailsOpen, setSelectedGage],
  );

  const handleTribunalSubmit = useCallback(
    async (tribunalData) => {
      await addTribunalCase(tribunalData);
      setTribunalFormOpen(false);
    },
    [addTribunalCase, setTribunalFormOpen],
  );

  const handleTribunalVote = useCallback(
    async ({ tribunalCase, value }) => {
      await voteTribunalCase({ tribunalCase, value });

      setSelectedTribunalCase((currentCase) => {
        if (!currentCase) {
          return currentCase;
        }

        const remainingVotes = (currentCase.votes ?? []).filter(
          (voteItem) =>
            String(voteItem.profileId ?? voteItem.profile_id ?? "") !==
            String(user?.id ?? ""),
        );

        return {
          ...currentCase,
          votes: [
            ...remainingVotes,
            {
              profileId: user?.id,
              profile_id: user?.id,
              value,
              vote: value,
            },
          ],
        };
      });
    },
    [setSelectedTribunalCase, user?.id, voteTribunalCase],
  );

  const handleStartTribunalVoting = useCallback(
    async (tribunalCase) => {
      await startTribunalVoting(tribunalCase);
      setSelectedTribunalCase((currentCase) =>
        currentCase
          ? {
              ...currentCase,
              status: "voting",
            }
          : currentCase,
      );
    },
    [setSelectedTribunalCase, startTribunalVoting],
  );

  const handleDismissTribunalCase = useCallback(
    async (tribunalCase) => {
      if (!window.confirm("Classer cette affaire sans suite ?")) {
        return;
      }

      await dismissTribunalCase(tribunalCase);
      setTribunalCaseModalOpen(false);
      window.setTimeout(() => setSelectedTribunalCase(null), 220);
    },
    [
      dismissTribunalCase,
      setSelectedTribunalCase,
      setTribunalCaseModalOpen,
    ],
  );

  const handleJudgeTribunalCase = useCallback(
    async (tribunalCase) => {
      const sanction = window.prompt(
        "Indique la sanction ou le gage si le membre est déclaré coupable :",
        "",
      );

      await judgeTribunalCase(
        tribunalCase,
        sanction?.trim() || null,
      );

      setTribunalCaseModalOpen(false);
      window.setTimeout(() => setSelectedTribunalCase(null), 220);
    },
    [judgeTribunalCase, setSelectedTribunalCase, setTribunalCaseModalOpen],
  );

  const handleOpenMemberProfile = useCallback(
    async (member) => {
      if (!member?.id) {
        return;
      }

      setSelectedMember(member);
      setSelectedMemberStatistics(null);
      setMemberStatisticsError(null);
      setMemberModalOpen(true);
      setMemberStatisticsLoading(true);

      try {
        const statistics = await getProfileStatistics(member.id);
        setSelectedMemberStatistics(statistics);
      } catch (error) {
        console.error(
          "Impossible de charger les statistiques du membre :",
          error,
        );
        setMemberStatisticsError(
          error?.message ?? "Impossible de charger les statistiques.",
        );
      } finally {
        setMemberStatisticsLoading(false);
      }
    },
    [
      getProfileStatistics,
      setMemberModalOpen,
      setMemberStatisticsError,
      setMemberStatisticsLoading,
      setSelectedMember,
      setSelectedMemberStatistics,
    ],
  );

  const handleCloseMemberProfile = useCallback(() => {
    setMemberModalOpen(false);
    setMemberStatisticsError(null);
    window.setTimeout(() => {
      setSelectedMember(null);
      setSelectedMemberStatistics(null);
    }, 220);
  }, [
    setMemberModalOpen,
    setMemberStatisticsError,
    setSelectedMember,
    setSelectedMemberStatistics,
  ]);

  return {
    handleSaveTennisMatch,
    handleEventSubmit,
    handleAttendance,
    handleDeleteEvent,
    handleBikeRideSubmit,
    handleJoinBikeRide,
    handleLeaveBikeRide,
    handleDeleteBikeRide,
    handleGalleryUpload,
    handleGalleryLike,
    handleGalleryPhotoDelete,
    handleGalleryCommentAdd,
    handleGalleryCommentEdit,
    handleGalleryCommentDelete,
    showPreviousGalleryPhoto,
    showNextGalleryPhoto,
    handleProfileSubmit,
    handleAvatarUpload,
    handleAvatarDelete,
    handlePasswordSubmit,
    handleGageSubmit,
    handleStartGage,
    handleCompleteGage,
    handleValidateGage,
    handleCancelGage,
    handleUploadGageProof,
    handleDeleteGageProof,
    handleDeleteGage,
    handleTribunalSubmit,
    handleTribunalVote,
    handleStartTribunalVoting,
    handleDismissTribunalCase,
    handleJudgeTribunalCase,
    handleOpenMemberProfile,
    handleCloseMemberProfile,
  };
}

export default useAppActions;
