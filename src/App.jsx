import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "./lib/supabase";
import V2Bridge from "./v2/app/V2Bridge";
import {
  Bell,
  Bike,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronRight,
  CircleUserRound,
  Dices,
  House,
  Images,
  Medal,
  Menu,
  Flame,
  Plus,
  Scale,
  Trophy,
  Clock3,
  MapPin,
  Mountain,
  Route,
  LogOut,
} from "lucide-react";
import {
  AppDataProvider,
} from "./context/AppDataContext";

import {
  AuthProvider,
} from "./context/AuthContext";
import AppShell from "./app/AppShell";
import {
  getNavigationItem,
  getPageTitle,
  isImplementedPage,
  navigation,
} from "./app/navigation";
import HomePage from "./features/home/HomePage";
import AppModals from "./app/AppModals";
import AppPages from "./app/AppPages";
import { useHomeDashboard } from "./features/home/useHomeDashboard";


import Sidebar from "./components/Sidebar";
import MobileNavigation from "./components/MobileNavigation";
import BikeMap from "./components/BikeMap";
// import WeeklyChallenge from "./components/WeeklyChallenge";
import useChallenges from "./hooks/useChallenges";
import { useEvents } from "./hooks/useEvents";
import { useTennisMatches } from "./hooks/useTennisMatches";
import { useBikeRides } from "./hooks/useBikeRides";
import { useGages } from "./hooks/useGages";
import { useTribunalCases } from "./hooks/useTribunalCases";
import { getProfileStatistics } from "./services/profileService";
import { useProfile } from "./hooks/useProfile";
import { useProfiles } from "./hooks/useProfiles";
import { useGallery } from "./hooks/useGallery";
import { useEffect } from "react";
import { testSupabaseConnection } from "./lib/testSupabase";
import { useAuth } from "./context/AuthContext";

function formatBikeRideDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(value));
}

function formatBikeRideTime(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatBikeRideDuration(minutes) {
  if (!minutes) {
    return null;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${String(
    remainingMinutes,
  ).padStart(2, "0")}`;
}

function App() {

  const {
    profiles: members,
    loading: profilesLoading,
    error: profilesError,
  } = useProfiles();

  const {
    profile,
    user,
    isAdmin,
    logout,
  } = useAuth();

  const [eventModalOpen, setEventModalOpen] =
    useState(false);

  const [eventBeingEdited, setEventBeingEdited] =
    useState(null);

  const [bikeModalOpen, setBikeModalOpen] =
    useState(false);

  const [bikeRideBeingEdited, setBikeRideBeingEdited] =
    useState(null);

  const [galleryUploadOpen, setGalleryUploadOpen] =
    useState(false);

  const [galleryViewerOpen, setGalleryViewerOpen] =
    useState(false);

  const [galleryViewerIndex, setGalleryViewerIndex] =
    useState(0);

  const [editProfileModalOpen, setEditProfileModalOpen] =
    useState(false);

  const [changePasswordModalOpen, setChangePasswordModalOpen] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

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
    selectedMember,
    setSelectedMember,
  ] = useState(null);

  const [
    memberModalOpen,
    setMemberModalOpen,
  ] = useState(false);

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

  const [gageDetailsOpen, setGageDetailsOpen] =
    useState(false);

  const [selectedGage, setSelectedGage] =
    useState(null);

  const {
    events,
    loading: eventsLoading,
    saving: eventsSaving,
    error: eventsError,
    addEvent,
    editEvent,
    removeEvent,
    changeAttendance,
  } = useEvents();

  const {
    matches: tennisMatches,
    loading: tennisLoading,
    saving: tennisSaving,
    error: tennisError,
    addMatch,
  } = useTennisMatches();

  const {
    rides: bikeRides,
    loading: bikeLoading,
    saving: bikeSaving,
    error: bikeError,
    addRide,
    editRide,
    removeRide,
    joinRide,
    leaveRide,
  } = useBikeRides();

  const {
    cases: tribunalCases,
    loading: tribunalLoading,
    saving: tribunalSaving,
    error: tribunalError,
    addCase: addTribunalCase,
    startVoting: startTribunalVoting,
    vote: voteTribunalCase,
    judgeCase: judgeTribunalCase,
    dismissCase: dismissTribunalCase,
  } = useTribunalCases(user?.id);

  const {
    challenges,
    activeChallenge,

    createChallenge,

    updateChallenge,

    archiveChallenge,
  } = useChallenges();

  const {
    albums: galleryAlbums,
    photos: galleryPhotos,
    loading: galleryLoading,
    saving: gallerySaving,
    uploading: galleryUploading,
    uploadProgress: galleryUploadProgress,
    error: galleryError,
    uploadPhotos,
    removePhoto,
    toggleLike,
    addComment,
    editComment,
    removeComment,
  } = useGallery(user?.id);

  const {
    gages,
    loading: gagesLoading,
    saving: gagesSaving,
    uploading: gagesUploading,
    error: gagesError,

    addGage,
    startGage,
    completeGage,
    validateGage,
    cancelGage,
    uploadProof,
    removeProof,
    removeGage,
  } = useGages(user?.id);

  const {
    profile: personalProfile,
    statistics: profileStatistics,
    loading: profileLoading,
    saving: profileSaving,
    uploadingAvatar,
    changingPassword,
    error: profileError,
    refreshProfile,
    refreshStatistics,
    saveProfile,
    saveAvatar,
    removeAvatar,
    savePassword,
  } = useProfile(user?.id);

  const openGageForm = () => {
    setGageFormOpen(true);
  };

  const closeGageForm = () => {
    if (gagesSaving) {
      return;
    }

    setGageFormOpen(false);
  };

  const openGageDetails = (gage) => {
    setSelectedGage(gage);
    setGageDetailsOpen(true);
  };

  const closeGageDetails = () => {
    if (gagesSaving || gagesUploading) {
      return;
    }

    setGageDetailsOpen(false);

    window.setTimeout(() => {
      setSelectedGage(null);
    }, 220);
  };

  const handleGageSubmit = async (gageData) => {
    await addGage(gageData);
    setGageFormOpen(false);
  };

  const handleStartGage = async (gage) => {
    await startGage(gage);
  };

  const handleCompleteGage = async (gage) => {
    await completeGage(gage);
  };

  const handleValidateGage = async (gage) => {
    const confirmed = window.confirm(
      "Valider définitivement ce gage ?",
    );

    if (!confirmed) {
      return;
    }

    await validateGage(gage);
  };

  const handleCancelGage = async (gage) => {
    const confirmed = window.confirm(
      "Annuler définitivement ce gage ?",
    );

    if (!confirmed) {
      return;
    }

    await cancelGage(gage);
  };

  const handleUploadGageProof = async ({
    gage,
    file,
  }) => {
    await uploadProof({
      gage,
      file,
    });
  };

  const handleDeleteGageProof = async (gage) => {
    const confirmed = window.confirm(
      "Supprimer cette preuve ?",
    );

    if (!confirmed) {
      return;
    }

    await removeProof(gage);
  };

  const handleDeleteGage = async (gage) => {
    const confirmed = window.confirm(
      "Supprimer définitivement ce gage ?",
    );

    if (!confirmed) {
      return;
    }

    await removeGage(gage);
    closeGageDetails();
  };

  const openTribunalForm = () => {
    setTribunalFormOpen(true);
  };

  const closeTribunalForm = () => {
    if (tribunalSaving) {
      return;
    }

    setTribunalFormOpen(false);
  };

  const openTribunalCase = (
    tribunalCase,
  ) => {
    setSelectedTribunalCase(
      tribunalCase,
    );

    setTribunalCaseModalOpen(true);
  };

  const closeTribunalCase = () => {
    if (tribunalSaving) {
      return;
    }

    setTribunalCaseModalOpen(false);

    window.setTimeout(() => {
      setSelectedTribunalCase(null);
    }, 220);
  };

  const handleTribunalSubmit = async (
    tribunalData,
  ) => {
    await addTribunalCase(
      tribunalData,
    );

    setTribunalFormOpen(false);
  };

  const handleTribunalVote = async ({
    tribunalCase,
    value,
  }) => {
    await voteTribunalCase({
      tribunalCase,
      value,
    });

    setSelectedTribunalCase(
      (currentCase) => {
        if (!currentCase) {
          return currentCase;
        }

        const currentVotes =
          currentCase.votes ?? [];

        const remainingVotes =
          currentVotes.filter(
            (voteItem) =>
              (voteItem.profileId ??
                voteItem.profile_id) !==
              user?.id,
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
      },
    );
  };

  const handleStartTribunalVoting =
    async (tribunalCase) => {
      await startTribunalVoting(
        tribunalCase,
      );

      setSelectedTribunalCase(
        (currentCase) =>
          currentCase
            ? {
              ...currentCase,
              status: "voting",
            }
            : currentCase,
      );
    };

  const handleDismissTribunalCase =
    async (tribunalCase) => {
      const confirmed =
        window.confirm(
          "Classer cette affaire sans suite ?",
        );

      if (!confirmed) {
        return;
      }

      await dismissTribunalCase(
        tribunalCase,
      );

      closeTribunalCase();
    };

  const handleJudgeTribunalCase =
    async (tribunalCase) => {
      const sanction =
        window.prompt(
          "Indique la sanction ou le gage si le membre est déclaré coupable :",
          "",
        );

      await judgeTribunalCase(
        tribunalCase,
        sanction?.trim() || null,
      );

      closeTribunalCase();
    };

  const openMemberProfile = async (member) => {
    if (!member?.id) {
      return;
    }

    setSelectedMember(member);
    setSelectedMemberStatistics(null);
    setMemberStatisticsError(null);
    setMemberModalOpen(true);
    setMemberStatisticsLoading(true);

    try {
      const statistics =
        await getProfileStatistics(member.id);

      setSelectedMemberStatistics(
        statistics,
      );
    } catch (error) {
      console.error(
        "Impossible de charger les statistiques du membre :",
        error,
      );

      setMemberStatisticsError(
        error?.message ??
        "Impossible de charger les statistiques.",
      );
    } finally {
      setMemberStatisticsLoading(false);
    }
  };

  const closeMemberProfile = () => {
    setMemberModalOpen(false);
    setMemberStatisticsError(null);

    window.setTimeout(() => {
      setSelectedMember(null);
      setSelectedMemberStatistics(null);
    }, 220);
  };

  const galleryComments = useMemo(() => {
    return galleryPhotos.flatMap((photo) =>
      (photo.comments ?? []).map((comment) => ({
        ...comment,
        photoId: photo.id,
        photoCaption: photo.caption,
        photoSignedUrl: photo.signedUrl,
      })),
    );
  }, [galleryPhotos]);

  const openEditProfileModal = () => {
    setEditProfileModalOpen(true);
  };

  const closeEditProfileModal = () => {
    if (profileSaving) {
      return;
    }

    setEditProfileModalOpen(false);
  };

  const openChangePasswordModal = () => {
    setChangePasswordModalOpen(true);
  };

  const closeChangePasswordModal = () => {
    if (changingPassword) {
      return;
    }

    setChangePasswordModalOpen(false);
  };

  const handleProfileSubmit = async (profileData) => {
    await saveProfile(profileData);

    setEditProfileModalOpen(false);

    /*
     * Si ton useAuth possède une fonction de rafraîchissement
     * du profil global, appelle-la ici également.
     */
    await refreshProfile({
      showLoading: false,
    });
  };

  const handleAvatarUpload = async (file) => {
    await saveAvatar(file);

    await refreshProfile({
      showLoading: false,
    });
  };

  const handleAvatarDelete = async () => {
    await removeAvatar();

    await refreshProfile({
      showLoading: false,
    });
  };

  const handlePasswordSubmit = async (newPassword) => {
    await savePassword(newPassword);
  };

  const handleProfileLogout = async () => {
    await signOut();
  };

  const handleGalleryCommentAdd = async ({
    photoId,
    content,
  }) => {
    if (!user?.id) {
      throw new Error(
        "Utilisateur connecté introuvable.",
      );
    }

    return addComment({
      photoId,
      profileId: user.id,
      content,
    });
  };

  const handleGalleryCommentEdit = async ({
    photoId,
    commentId,
    content,
  }) => {
    return editComment({
      photoId,
      commentId,
      content,
    });
  };

  const handleGalleryCommentDelete = async ({
    photoId,
    commentId,
  }) => {
    return removeComment({
      photoId,
      commentId,
    });
  };

const useLegacy =
  new URLSearchParams(
    window.location.search,
  ).get("legacy") === "1";

const useV2 = !useLegacy;

  const showPreviousGalleryPhoto = () => {
    setGalleryViewerIndex(
      (currentIndex) =>
        currentIndex <= 0
          ? galleryPhotos.length - 1
          : currentIndex - 1,
    );
  };

  const showNextGalleryPhoto = () => {
    setGalleryViewerIndex(
      (currentIndex) =>
        currentIndex >=
          galleryPhotos.length - 1
          ? 0
          : currentIndex + 1,
    );
  };

  const nextPlannedBikeRide = useMemo(() => {
    const now = Date.now();

    return (
      bikeRides
        .filter((ride) => {
          const rideTime = new Date(
            ride.rideDate,
          ).getTime();

          return (
            ride.status === "planned" &&
            rideTime >= now
          );
        })
        .sort((rideA, rideB) => {
          return (
            new Date(rideA.rideDate).getTime() -
            new Date(rideB.rideDate).getTime()
          );
        })[0] ?? null
    );
  }, [bikeRides]);

  const openGalleryUploadModal = () => {
    setGalleryUploadOpen(true);
  };

  const closeGalleryUploadModal = () => {
    if (galleryUploading) {
      return;
    }

    setGalleryUploadOpen(false);
  };

  const handleGalleryUpload = async (uploadData) => {
    await uploadPhotos(uploadData);
    setGalleryUploadOpen(false);
  };

  const openGalleryPhoto = (photo) => {
    const photoIndex = galleryPhotos.findIndex(
      (galleryPhoto) => galleryPhoto.id === photo.id,
    );

    if (photoIndex < 0) {
      return;
    }

    setGalleryViewerIndex(photoIndex);
    setGalleryViewerOpen(true);
  };

  const closeGalleryViewer = () => {
    setGalleryViewerOpen(false);
  };

  const handleGalleryLike = async ({
    photoId,
    profileId,
  }) => {
    await toggleLike({
      photoId,
      profileId,
    });
  };

  const handleGalleryPhotoDelete = async (photo) => {
    await removePhoto(photo);

    if (galleryViewerOpen) {
      setGalleryViewerOpen(false);
    }
  };


  const handleSaveTennisMatch =
    async (matchData) => {
      await addMatch(matchData);
      setScoreModalOpen(false);
    };

  const openCreateEventModal = () => {
    setEventBeingEdited(null);
    setEventModalOpen(true);
  };

  const openEditEventModal = (event) => {
    setEventBeingEdited(event);
    setEventModalOpen(true);
  };

  const closeEventModal = () => {
    if (eventsSaving) {
      return;
    }

    setEventModalOpen(false);
    setEventBeingEdited(null);
  };

  const openCreateBikeRideModal = () => {
    setBikeRideBeingEdited(null);
    setBikeModalOpen(true);
  };

  const openEditBikeRideModal = (ride) => {
    setBikeRideBeingEdited(ride);
    setBikeModalOpen(true);
  };

  const closeBikeRideModal = () => {
    if (bikeSaving) {
      return;
    }

    setBikeModalOpen(false);
    setBikeRideBeingEdited(null);
  };

  const handleBikeRideSubmit = async (rideData) => {
    if (bikeRideBeingEdited) {
      await editRide(
        bikeRideBeingEdited.id,
        rideData,
      );
    } else {
      if (!user?.id) {
        throw new Error(
          "Utilisateur connecté introuvable.",
        );
      }

      await addRide({
        ...rideData,
        createdBy: user.id,
      });
    }

    setBikeModalOpen(false);
    setBikeRideBeingEdited(null);
  };

  const handleJoinBikeRide = async (rideId) => {
    if (!user?.id) {
      throw new Error(
        "Utilisateur connecté introuvable.",
      );
    }

    await joinRide({
      rideId,
      profileId: user.id,
    });
  };

  const handleLeaveBikeRide = async (rideId) => {
    if (!user?.id) {
      throw new Error(
        "Utilisateur connecté introuvable.",
      );
    }

    await leaveRide({
      rideId,
      profileId: user.id,
    });
  };

  const handleDeleteBikeRide = async (rideId) => {
    await removeRide(rideId);
  };

  const handleEventSubmit = async (eventData) => {
    if (eventBeingEdited) {
      await editEvent(
        eventBeingEdited.id,
        eventData,
      );
    } else {
      if (!user?.id) {
        throw new Error(
          "Utilisateur connecté introuvable.",
        );
      }

      await addEvent({
        ...eventData,
        createdBy: user.id,
      });
    }

    setEventModalOpen(false);
    setEventBeingEdited(null);
  };

  const handleAttendance = async ({
    eventId,
    attendanceStatus,
  }) => {
    if (!user?.id) {
      throw new Error(
        "Utilisateur connecté introuvable.",
      );
    }

    await changeAttendance({
      eventId,
      profileId: user.id,
      attendanceStatus,
    });
  };

  const connectedNickname =
    profile?.nickname ??
    user?.email?.split("@")[0] ??
    "Membre";

  const connectedInitials =
    profile?.initials ??
    connectedNickname.slice(0, 2).toUpperCase();

  const connectedRole =
    isAdmin ? "Administrateur" : "Membre";

  const [activePage, setActivePage] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);

  const {
    sortedMembers,
    totalMatches,
    totalBikeKm,
    upcomingEvents,
    connectedMember,
    connectedPoints,
    connectedRanking,
    leader,
    homeActivityData,
    homeChartSummary,
    homeRecentActivities,
    getMemberName,
    getMemberWins,
  } = useHomeDashboard({
    members,
    profile,
    user,
    events,
    tennisMatches,
    bikeRides,
    gages,
    tribunalCases,
  });

  const currentNavigationItem =
    getNavigationItem(activePage);

  const pageTitle =
    getPageTitle(activePage);

  const navigateTo = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!selectedGage?.id) {
      return;
    }

    const refreshedGage =
      gages.find(
        (gage) =>
          gage.id === selectedGage.id,
      );

    if (refreshedGage) {
      setSelectedGage(refreshedGage);
    }
  }, [
    gages,
    selectedGage?.id,
  ]);

  useEffect(() => {
    if (!selectedTribunalCase?.id) {
      return;
    }

    const refreshedCase =
      tribunalCases.find(
        (tribunalCase) =>
          tribunalCase.id ===
          selectedTribunalCase.id,
      );

    if (refreshedCase) {
      setSelectedTribunalCase(
        refreshedCase,
      );
    }
  }, [
    tribunalCases,
    selectedTribunalCase?.id,
  ]);

  const renderPlaceholderPage = () => {
    const CurrentIcon =
      currentNavigationItem?.icon ??
      navigation[0].icon;

    return (
      <section className="placeholder-page glass-panel">
        <div className="placeholder-page__icon">
          <CurrentIcon size={34} />
        </div>

        <p className="section-heading__eyebrow">
          Module en préparation
        </p>

        <h2>{pageTitle}</h2>

        <p>
          Cette page sera construite lors des prochaines étapes.
          La navigation est déjà prête et le contenu viendra
          s’intégrer ici sans modifier l’architecture générale.
        </p>

        {activePage === "tennis" && (
          <button
            type="button"
            className="primary-button"
            onClick={() => setScoreModalOpen(true)}
          >
            <Plus size={18} />
            Saisir un premier score
          </button>
        )}
      </section>
    );
  };

  const authContextValue = {
    user,
    profile,
    // login,
    logout,

    isAdmin:
      profile?.role === "admin",
  };

  const appDataValue = {
    members,
    profile,
    user,
    events,
    tennisMatches,
    bikeRides,
    galleryPhotos,
    tribunalCases,
    gages,
    challenges,
    // refreshProfiles,
    // refreshEvents,
    // refreshTennisMatches,
    // refreshBikeRides,
    // refreshGallery,
    // refreshTribunalCases,
    // refreshGages,
  };

  const v2Actions = {
    openCreateEvent:
      openCreateEventModal,

    openEditEvent:
      openEditEventModal,

    deleteEvent:
      removeEvent,

    changeEventAttendance:
      handleAttendance,

    openScoreModal: () =>
      setScoreModalOpen(true),

    openCreateBikeRide:
      openCreateBikeRideModal,

    openEditBikeRide:
      openEditBikeRideModal,

    deleteBikeRide:
      handleDeleteBikeRide,

    joinBikeRide:
      handleJoinBikeRide,

    leaveBikeRide:
      handleLeaveBikeRide,

    openGalleryUpload:
      openGalleryUploadModal,

    openGalleryPhoto,

    likeGalleryPhoto:
      handleGalleryLike,

    deleteGalleryPhoto:
      handleGalleryPhotoDelete,

    openMemberProfile,

    openGageForm,
    openGageDetails,

    openTribunalForm,
    openTribunalCase,

    openEditProfile:
      openEditProfileModal,

    openChangePassword:
      openChangePasswordModal,

    uploadAvatar:
      handleAvatarUpload,

    deleteAvatar:
      handleAvatarDelete,

      createChallenge,
updateChallenge,
archiveChallenge,

    navigateToLegacy: navigateTo,
  };

  const v2Loading = {
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

  const v2Errors = {
    profiles: profilesError,
    events: eventsError,
    tennis: tennisError,
    bike: bikeError,
    gallery: galleryError,
    tribunal: tribunalError,
    gages: gagesError,
  };

  if (useV2) {
    return (
      <>
        <V2Bridge
          members={members}
          events={events}
          tennisMatches={tennisMatches}
          bikeRides={bikeRides}
          galleryAlbums={galleryAlbums}
          galleryPhotos={galleryPhotos}
          galleryComments={galleryComments}
          tribunalCases={tribunalCases}
          gages={gages}
          challenges={challenges}
          activeChallenge={activeChallenge}

          personalProfile={personalProfile}
          profileStatistics={profileStatistics}

          loading={v2Loading}
          errors={v2Errors}
          actions={v2Actions}
        />

        <AppModals
          members={members}
          user={user}
          profile={profile}
          isAdmin={isAdmin}

          scoreModalOpen={scoreModalOpen}
          tennisSaving={tennisSaving}
          onSaveTennisMatch={
            handleSaveTennisMatch
          }
          onCloseScoreModal={() => {
            if (!tennisSaving) {
              setScoreModalOpen(false);
            }
          }}

          bikeModalOpen={bikeModalOpen}
          bikeRideBeingEdited={
            bikeRideBeingEdited
          }
          bikeSaving={bikeSaving}
          onCloseBikeModal={
            closeBikeRideModal
          }
          onSubmitBikeRide={
            handleBikeRideSubmit
          }

          eventModalOpen={
            eventModalOpen
          }
          eventBeingEdited={
            eventBeingEdited
          }
          eventsSaving={
            eventsSaving
          }

          galleryUploadOpen={galleryUploadOpen}
          galleryAlbums={galleryAlbums}
          galleryUploading={galleryUploading}
          galleryUploadProgress={
            galleryUploadProgress
          }
          onCloseGalleryUpload={
            closeGalleryUploadModal
          }
          onUploadGalleryPhotos={
            handleGalleryUpload
          }

          galleryViewerOpen={galleryViewerOpen}
          galleryPhotos={galleryPhotos}
          galleryViewerIndex={galleryViewerIndex}
          gallerySaving={gallerySaving}
          onCloseGalleryViewer={
            closeGalleryViewer
          }
          onPreviousGalleryPhoto={
            showPreviousGalleryPhoto
          }
          onNextGalleryPhoto={
            showNextGalleryPhoto
          }
          onLikeGalleryPhoto={
            handleGalleryLike
          }
          onAddGalleryComment={
            handleGalleryCommentAdd
          }
          onEditGalleryComment={
            handleGalleryCommentEdit
          }
          onDeleteGalleryComment={
            handleGalleryCommentDelete
          }
          onCloseEventModal={
            closeEventModal
          }
          onSubmitEvent={
            handleEventSubmit
          }

          memberModalOpen={memberModalOpen}
          selectedMember={selectedMember}
          selectedMemberStatistics={
            selectedMemberStatistics
          }
          memberStatisticsLoading={
            memberStatisticsLoading
          }
          memberStatisticsError={
            memberStatisticsError
          }
          onCloseMemberProfile={
            closeMemberProfile
          }

          gageFormOpen={gageFormOpen}
          gagesSaving={gagesSaving}
          gagesError={gagesError}
          onCloseGageForm={closeGageForm}
          onSubmitGage={handleGageSubmit}

          gageDetailsOpen={gageDetailsOpen}
          selectedGage={selectedGage}
          gagesUploading={gagesUploading}
          onCloseGageDetails={closeGageDetails}
          onStartGage={handleStartGage}
          onCompleteGage={handleCompleteGage}
          onValidateGage={handleValidateGage}
          onCancelGage={handleCancelGage}
          onUploadGageProof={
            handleUploadGageProof
          }
          onDeleteGageProof={
            handleDeleteGageProof
          }
          onDeleteGage={handleDeleteGage}

          tribunalFormOpen={
            tribunalFormOpen
          }
          tribunalSaving={
            tribunalSaving
          }
          tribunalError={
            tribunalError
          }
          onCloseTribunalForm={
            closeTribunalForm
          }
          onSubmitTribunal={
            handleTribunalSubmit
          }

          tribunalCaseModalOpen={
            tribunalCaseModalOpen
          }
          selectedTribunalCase={
            selectedTribunalCase
          }
          onCloseTribunalCase={
            closeTribunalCase
          }
          onVoteTribunal={
            handleTribunalVote
          }
          onStartTribunalVoting={
            handleStartTribunalVoting
          }
          onJudgeTribunal={
            handleJudgeTribunalCase
          }
          onDismissTribunal={
            handleDismissTribunalCase
          }

          editProfileModalOpen={
            editProfileModalOpen
          }
          personalProfile={
            personalProfile
          }
          profileSaving={
            profileSaving
          }
          onCloseEditProfile={
            closeEditProfileModal
          }
          onSubmitProfile={
            handleProfileSubmit
          }

          changePasswordModalOpen={
            changePasswordModalOpen
          }
          changingPassword={
            changingPassword
          }
          onCloseChangePassword={
            closeChangePasswordModal
          }
          onSubmitPassword={
            handlePasswordSubmit
          }
        />
      </>
    );
  }

  return (

    <div className="app-shell">
      <div className="background-orb background-orb--one" />
      <div className="background-orb background-orb--two" />
      <div className="background-grid" />

      <Sidebar
        items={navigation}
        activePage={activePage}
        onNavigate={navigateTo}
        onLogout={logout}
        profile={profile}
        isOpen={mobileSidebarOpen}
        onClose={() =>
          setMobileSidebarOpen(false)
        }
      />

      <div className="app-content">
        <header className="topbar">
          <div className="topbar__left">
            <button
              type="button"
              className="icon-button mobile-menu-button"
              aria-label="Ouvrir le menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="topbar__eyebrow">
                Les Co’Pintes
              </p>

              <h1 className="topbar__title">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="topbar__actions">
            <button
              type="button"
              className="icon-button notification-button"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="notification-dot" />
            </button>

            <button
              type="button"
              className="profile-button"
              aria-label="Ouvrir le profil de Kiks"
              onClick={() => navigateTo("profile")}
            >
              <span className="profile-button__avatar">
                {connectedInitials}
              </span>

              <span className="profile-button__text">
                <strong>{connectedNickname}</strong>
                <small>{connectedRole}</small>
              </span>

              <ChevronRight size={18} />
            </button>
          </div>
        </header>

        <main className="dashboard">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
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
                ease: [0.22, 1, 0.36, 1],
              }}
            >

              {profilesLoading && (
                <section className="data-status glass-panel">
                  <span className="data-status__spinner" />

                  <div>
                    <strong>Chargement des membres</strong>
                    <p>Récupération des données Supabase…</p>
                  </div>
                </section>
              )}

              {profilesError && (
                <section className="data-status data-status--error glass-panel">
                  <div>
                    <strong>Impossible de charger les membres</strong>
                    <p>{profilesError}</p>
                  </div>
                </section>
              )}

              <AppPages
                activePage={activePage}
                homeProps={homeProps}

                members={members}
                profile={profile}
                user={user}
                isAdmin={isAdmin}

                events={events}
                eventsLoading={eventsLoading}
                eventsSaving={eventsSaving}
                eventsError={eventsError}
                onCreateEvent={
                  openCreateEventModal
                }
                onEditEvent={
                  openEditEventModal
                }
                onDeleteEvent={removeEvent}
                onAttendance={
                  handleAttendance
                }

                tennisMatches={tennisMatches}
                tennisLoading={tennisLoading}
                tennisError={tennisError}
                onAddMatch={() =>
                  setScoreModalOpen(true)
                }

                bikeRides={bikeRides}
                bikeLoading={bikeLoading}
                bikeSaving={bikeSaving}
                bikeError={bikeError}
                onCreateBikeRide={
                  openCreateBikeRideModal
                }
                onEditBikeRide={
                  openEditBikeRideModal
                }
                onDeleteBikeRide={
                  handleDeleteBikeRide
                }
                onJoinBikeRide={
                  handleJoinBikeRide
                }
                onLeaveBikeRide={
                  handleLeaveBikeRide
                }

                galleryAlbums={galleryAlbums}
                galleryPhotos={galleryPhotos}
                galleryLoading={galleryLoading}
                galleryError={galleryError}
                onOpenGalleryUpload={
                  openGalleryUploadModal
                }
                onOpenGalleryPhoto={
                  openGalleryPhoto
                }
                onLikeGalleryPhoto={
                  handleGalleryLike
                }
                onDeleteGalleryPhoto={
                  handleGalleryPhotoDelete
                }

                personalProfile={personalProfile}
                profileStatistics={
                  profileStatistics
                }
                profileLoading={profileLoading}
                profileActivityLoading={
                  tennisLoading ||
                  bikeLoading ||
                  galleryLoading
                }
                profileSaving={profileSaving}
                uploadingAvatar={
                  uploadingAvatar
                }
                profileError={profileError}
                galleryComments={
                  galleryComments
                }
                onEditProfile={
                  openEditProfileModal
                }
                onChangePassword={
                  openChangePasswordModal
                }
                onUploadAvatar={
                  handleAvatarUpload
                }
                onDeleteAvatar={
                  handleAvatarDelete
                }
                onNavigate={navigateTo}

                gages={gages}
                gagesLoading={gagesLoading}
                gagesError={gagesError}
                onCreateGage={openGageForm}
                onOpenGage={openGageDetails}

                tribunalCases={tribunalCases}
                tribunalLoading={
                  tribunalLoading
                }
                tribunalSaving={
                  tribunalSaving
                }
                tribunalError={tribunalError}
                onCreateTribunalCase={
                  openTribunalForm
                }
                onOpenTribunalCase={
                  openTribunalCase
                }

                profilesLoading={
                  profilesLoading
                }
                profilesError={profilesError}
                onOpenMember={
                  openMemberProfile
                }

                challenges={challenges}
                activeChallenge={
                  activeChallenge
                }
                createChallenge={
                  createChallenge
                }
                updateChallenge={
                  updateChallenge
                }
                archiveChallenge={
                  archiveChallenge
                }

                renderPlaceholderPage={
                  renderPlaceholderPage
                }
                isImplementedPage={
                  isImplementedPage
                }
              />


              {!isImplementedPage(activePage) &&
                renderPlaceholderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MobileNavigation
        items={navigation}
        activePage={activePage}
        onNavigate={navigateTo}
        onLogout={logout}
        profile={profile}
        menuOpen={mobileMenuOpen}
        onClose={() =>
          setMobileMenuOpen(false)
        }
      />

      <AppModals
        members={members}
        user={user}
        profile={profile}
        isAdmin={isAdmin}

        tennisSaving={tennisSaving}
        scoreModalOpen={scoreModalOpen}
        onSaveTennisMatch={handleSaveTennisMatch}
        onCloseScoreModal={() => {
          if (!tennisSaving) {
            setScoreModalOpen(false);
          }
        }}

        eventModalOpen={eventModalOpen}
        eventBeingEdited={eventBeingEdited}
        eventsSaving={eventsSaving}
        onCloseEventModal={closeEventModal}
        onSubmitEvent={handleEventSubmit}

        bikeModalOpen={bikeModalOpen}
        bikeRideBeingEdited={bikeRideBeingEdited}
        bikeSaving={bikeSaving}
        onCloseBikeModal={closeBikeRideModal}
        onSubmitBikeRide={handleBikeRideSubmit}

        tribunalFormOpen={tribunalFormOpen}
        tribunalSaving={tribunalSaving}
        tribunalError={tribunalError}
        onCloseTribunalForm={closeTribunalForm}
        onSubmitTribunal={handleTribunalSubmit}

        tribunalCaseModalOpen={
          tribunalCaseModalOpen
        }
        selectedTribunalCase={
          selectedTribunalCase
        }
        onCloseTribunalCase={
          closeTribunalCase
        }
        onVoteTribunal={
          handleTribunalVote
        }
        onStartTribunalVoting={
          handleStartTribunalVoting
        }
        onJudgeTribunal={
          handleJudgeTribunalCase
        }
        onDismissTribunal={
          handleDismissTribunalCase
        }

        gageFormOpen={gageFormOpen}
        gagesSaving={gagesSaving}
        gagesError={gagesError}
        onCloseGageForm={closeGageForm}
        onSubmitGage={handleGageSubmit}

        gageDetailsOpen={gageDetailsOpen}
        selectedGage={selectedGage}
        gagesUploading={gagesUploading}
        onCloseGageDetails={closeGageDetails}
        onStartGage={handleStartGage}
        onCompleteGage={handleCompleteGage}
        onValidateGage={handleValidateGage}
        onCancelGage={handleCancelGage}
        onUploadGageProof={
          handleUploadGageProof
        }
        onDeleteGageProof={
          handleDeleteGageProof
        }
        onDeleteGage={handleDeleteGage}

        memberModalOpen={memberModalOpen}
        selectedMember={selectedMember}
        selectedMemberStatistics={
          selectedMemberStatistics
        }
        memberStatisticsLoading={
          memberStatisticsLoading
        }
        memberStatisticsError={
          memberStatisticsError
        }
        onCloseMemberProfile={
          closeMemberProfile
        }

        galleryUploadOpen={galleryUploadOpen}
        galleryAlbums={galleryAlbums}
        galleryUploading={galleryUploading}
        galleryUploadProgress={
          galleryUploadProgress
        }
        onCloseGalleryUpload={
          closeGalleryUploadModal
        }
        onUploadGalleryPhotos={
          handleGalleryUpload
        }

        galleryViewerOpen={galleryViewerOpen}
        galleryPhotos={galleryPhotos}
        galleryViewerIndex={galleryViewerIndex}
        gallerySaving={gallerySaving}
        onCloseGalleryViewer={
          closeGalleryViewer
        }
        onPreviousGalleryPhoto={
          showPreviousGalleryPhoto
        }
        onNextGalleryPhoto={
          showNextGalleryPhoto
        }
        onLikeGalleryPhoto={
          handleGalleryLike
        }
        onAddGalleryComment={
          handleGalleryCommentAdd
        }
        onEditGalleryComment={
          handleGalleryCommentEdit
        }
        onDeleteGalleryComment={
          handleGalleryCommentDelete
        }

        editProfileModalOpen={
          editProfileModalOpen
        }
        personalProfile={personalProfile}
        profileSaving={profileSaving}
        onCloseEditProfile={
          closeEditProfileModal
        }
        onSubmitProfile={
          handleProfileSubmit
        }

        changePasswordModalOpen={
          changePasswordModalOpen
        }
        changingPassword={changingPassword}
        onCloseChangePassword={
          closeChangePasswordModal
        }
        onSubmitPassword={
          handlePasswordSubmit
        }
      />

      {/* <ChallengesSection
      challenges={challenges}
      activeChallenge={activeChallenge}
      createChallenge={createChallenge}
      updateChallenge={updateChallenge}
      archiveChallenge={archiveChallenge}
      members={members}
      tennisMatches={tennisMatches}
      bikeRides={bikeRides}
      events={events}
      tribunalCases={tribunalCases}
      gages={gages}
    /> */}

    </div>
  );
}

export default App;