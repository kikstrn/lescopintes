import { useCallback, useState } from "react";

export function useAppModals() {
  const [scoreModalOpen, setScoreModalOpen] =
    useState(false);

  const [eventModalOpen, setEventModalOpen] =
    useState(false);

  const [eventBeingEdited, setEventBeingEdited] =
    useState(null);

  const [bikeModalOpen, setBikeModalOpen] =
    useState(false);

  const [
    bikeRideBeingEdited,
    setBikeRideBeingEdited,
  ] = useState(null);

  const [
    galleryUploadOpen,
    setGalleryUploadOpen,
  ] = useState(false);

  const [
    galleryViewerOpen,
    setGalleryViewerOpen,
  ] = useState(false);

  const [
    galleryViewerIndex,
    setGalleryViewerIndex,
  ] = useState(0);

  const [
    tribunalFormOpen,
    setTribunalFormOpen,
  ] = useState(false);

  const [
    tribunalCaseModalOpen,
    setTribunalCaseModalOpen,
  ] = useState(false);

  const [
    selectedTribunalCase,
    setSelectedTribunalCase,
  ] = useState(null);

  const [
    memberModalOpen,
    setMemberModalOpen,
  ] = useState(false);

  const [
    selectedMember,
    setSelectedMember,
  ] = useState(null);

  const [
    selectedMemberStatistics,
    setSelectedMemberStatistics,
  ] = useState(null);

  const [
    memberStatisticsLoading,
    setMemberStatisticsLoading,
  ] = useState(false);

  const [
    memberStatisticsError,
    setMemberStatisticsError,
  ] = useState(null);

  const [gageFormOpen, setGageFormOpen] =
    useState(false);

  const [
    gageDetailsOpen,
    setGageDetailsOpen,
  ] = useState(false);

  const [
    selectedGage,
    setSelectedGage,
  ] = useState(null);

  const [
    editProfileModalOpen,
    setEditProfileModalOpen,
  ] = useState(false);

  const [
    changePasswordModalOpen,
    setChangePasswordModalOpen,
  ] = useState(false);

  const openScoreModal = useCallback(() => {
    setScoreModalOpen(true);
  }, []);

  const closeScoreModal = useCallback(() => {
    setScoreModalOpen(false);
  }, []);

  const openCreateEventModal =
    useCallback(() => {
      setEventBeingEdited(null);
      setEventModalOpen(true);
    }, []);

  const openEditEventModal = useCallback(
    (event) => {
      setEventBeingEdited(event);
      setEventModalOpen(true);
    },
    [],
  );

  const closeEventModal = useCallback(() => {
    setEventModalOpen(false);
    setEventBeingEdited(null);
  }, []);

  const openCreateBikeRideModal =
    useCallback(() => {
      setBikeRideBeingEdited(null);
      setBikeModalOpen(true);
    }, []);

  const openEditBikeRideModal = useCallback(
    (ride) => {
      setBikeRideBeingEdited(ride);
      setBikeModalOpen(true);
    },
    [],
  );

  const closeBikeRideModal =
    useCallback(() => {
      setBikeModalOpen(false);
      setBikeRideBeingEdited(null);
    }, []);

  const openGalleryUploadModal =
    useCallback(() => {
      setGalleryUploadOpen(true);
    }, []);

  const closeGalleryUploadModal =
    useCallback(() => {
      setGalleryUploadOpen(false);
    }, []);

  const openGalleryViewer = useCallback(
    (index = 0) => {
      setGalleryViewerIndex(index);
      setGalleryViewerOpen(true);
    },
    [],
  );

  const closeGalleryViewer =
    useCallback(() => {
      setGalleryViewerOpen(false);
    }, []);

  const showPreviousGalleryPhoto =
    useCallback((photosLength) => {
      setGalleryViewerIndex(
        (currentIndex) =>
          currentIndex <= 0
            ? Math.max(
                Number(photosLength) - 1,
                0,
              )
            : currentIndex - 1,
      );
    }, []);

  const showNextGalleryPhoto =
    useCallback((photosLength) => {
      setGalleryViewerIndex(
        (currentIndex) =>
          currentIndex >=
          Number(photosLength) - 1
            ? 0
            : currentIndex + 1,
      );
    }, []);

  const openTribunalForm =
    useCallback(() => {
      setTribunalFormOpen(true);
    }, []);

  const closeTribunalForm =
    useCallback(() => {
      setTribunalFormOpen(false);
    }, []);

  const openTribunalCase = useCallback(
    (tribunalCase) => {
      setSelectedTribunalCase(
        tribunalCase,
      );

      setTribunalCaseModalOpen(true);
    },
    [],
  );

  const closeTribunalCase =
    useCallback(() => {
      setTribunalCaseModalOpen(false);

      window.setTimeout(() => {
        setSelectedTribunalCase(null);
      }, 220);
    }, []);

  const openMemberProfile = useCallback(
    (member) => {
      setSelectedMember(member);
      setSelectedMemberStatistics(null);
      setMemberStatisticsError(null);
      setMemberModalOpen(true);
    },
    [],
  );

  const closeMemberProfile =
    useCallback(() => {
      setMemberModalOpen(false);
      setMemberStatisticsError(null);

      window.setTimeout(() => {
        setSelectedMember(null);
        setSelectedMemberStatistics(null);
      }, 220);
    }, []);

  const openGageForm = useCallback(() => {
    setGageFormOpen(true);
  }, []);

  const closeGageForm = useCallback(() => {
    setGageFormOpen(false);
  }, []);

  const openGageDetails = useCallback(
    (gage) => {
      setSelectedGage(gage);
      setGageDetailsOpen(true);
    },
    [],
  );

  const closeGageDetails =
    useCallback(() => {
      setGageDetailsOpen(false);

      window.setTimeout(() => {
        setSelectedGage(null);
      }, 220);
    }, []);

  const openEditProfileModal =
    useCallback(() => {
      setEditProfileModalOpen(true);
    }, []);

  const closeEditProfileModal =
    useCallback(() => {
      setEditProfileModalOpen(false);
    }, []);

  const openChangePasswordModal =
    useCallback(() => {
      setChangePasswordModalOpen(true);
    }, []);

  const closeChangePasswordModal =
    useCallback(() => {
      setChangePasswordModalOpen(false);
    }, []);

  return {
    scoreModalOpen,
    eventModalOpen,
    eventBeingEdited,
    bikeModalOpen,
    bikeRideBeingEdited,

    galleryUploadOpen,
    galleryViewerOpen,
    galleryViewerIndex,

    tribunalFormOpen,
    tribunalCaseModalOpen,
    selectedTribunalCase,

    memberModalOpen,
    selectedMember,
    selectedMemberStatistics,
    memberStatisticsLoading,
    memberStatisticsError,

    gageFormOpen,
    gageDetailsOpen,
    selectedGage,

    editProfileModalOpen,
    changePasswordModalOpen,

    setScoreModalOpen,
    setEventModalOpen,
    setEventBeingEdited,
    setBikeModalOpen,
    setBikeRideBeingEdited,

    setGalleryUploadOpen,
    setGalleryViewerOpen,
    setGalleryViewerIndex,

    setTribunalFormOpen,
    setTribunalCaseModalOpen,
    setSelectedTribunalCase,

    setMemberModalOpen,
    setSelectedMember,
    setSelectedMemberStatistics,
    setMemberStatisticsLoading,
    setMemberStatisticsError,

    setGageFormOpen,
    setGageDetailsOpen,
    setSelectedGage,

    setEditProfileModalOpen,
    setChangePasswordModalOpen,

    openScoreModal,
    closeScoreModal,

    openCreateEventModal,
    openEditEventModal,
    closeEventModal,

    openCreateBikeRideModal,
    openEditBikeRideModal,
    closeBikeRideModal,

    openGalleryUploadModal,
    closeGalleryUploadModal,
    openGalleryViewer,
    closeGalleryViewer,
    showPreviousGalleryPhoto,
    showNextGalleryPhoto,

    openTribunalForm,
    closeTribunalForm,
    openTribunalCase,
    closeTribunalCase,

    openMemberProfile,
    closeMemberProfile,

    openGageForm,
    closeGageForm,
    openGageDetails,
    closeGageDetails,

    openEditProfileModal,
    closeEditProfileModal,
    openChangePasswordModal,
    closeChangePasswordModal,
  };
}

export default useAppModals;