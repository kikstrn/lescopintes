import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "./lib/supabase";
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


import Sidebar from "./components/Sidebar";
import MobileNavigation from "./components/MobileNavigation";
import HeroBanner from "./components/HeroBanner";
import StatCard from "./components/StatCard";
import EventCard from "./components/EventCard";
import Podium from "./components/Podium";
import ActivityChart from "./components/ActivityChart";
import BikeMap from "./components/BikeMap";
import ActivityFeed from "./components/ActivityFeed";
// import WeeklyChallenge from "./components/WeeklyChallenge";
import useChallenges from "./hooks/useChallenges";
import ScoreModal from "./components/ScoreModal";
import RankingSection from "./components/RankingSection";
import StatisticsSection from "./components/StatisticsSection";
import EventsSection from "./components/EventsSection";
import EventFormModal from "./components/EventFormModal";
import { useEvents } from "./hooks/useEvents";
import TennisSection from "./components/TennisSection";
import { useTennisMatches } from "./hooks/useTennisMatches";
import CyclingSection from "./components/CyclingSection";
import BikeRideFormModal from "./components/BikeRideFormModal";
import { useBikeRides } from "./hooks/useBikeRides";
import GallerySection from "./components/gallery/GallerySection";
import GalleryViewer from "./components/gallery/GalleryViewer";
import UploadPhotosModal from "./components/gallery/UploadPhotosModal";
import ProfileSection from "./components/profile/ProfileSection";
import EditProfileModal from "./components/profile/EditProfileModal";
import ChangePasswordModal from "./components/profile/ChangePasswordModal";
import MembersSection from "./components/members/MembersSection";
import MemberProfileModal from "./components/members/MemberProfileModal";
import TribunalSection from "./components/tribunal/TribunalSection";
import TribunalCaseModal from "./components/tribunal/TribunalCaseModal";
import TribunalFormModal from "./components/tribunal/TribunalFormModal";
import GagesSection from "./components/gages/GagesSection";
import GageFormModal from "./components/gages/GageFormModal";
import GageDetailsModal from "./components/gages/GageDetailsModal";
import { useGages } from "./hooks/useGages";
import { useTribunalCases } from "./hooks/useTribunalCases";
import { getProfileStatistics } from "./services/profileService";
import { useProfile } from "./hooks/useProfile";
import { useProfiles } from "./hooks/useProfiles";
import { useGallery } from "./hooks/useGallery";
import { useEffect } from "react";
import { testSupabaseConnection } from "./lib/testSupabase";
import { useAuth } from "./context/AuthContext";

const navigation = [
  {
    id: "home",
    label: "Accueil",
    icon: House,
  },
  {
    id: "events",
    label: "Événements",
    icon: CalendarDays,
  },
  {
    id: "tennis",
    label: "Tennis",
    icon: Trophy,
  },
  {
    id: "bike",
    label: "Cyclisme",
    icon: Bike,
  },
  {
    id: "ranking",
    label: "Classement",
    icon: Medal,
  },
  {
    id: "statistics",
    label: "Statistiques",
    icon: ChartNoAxesCombined,
  },
  {
    id: "gallery",
    label: "Galerie",
    icon: Images,
  },
  {
    id: "gages",
    label: "Gages",
    icon: Dices,
  },
  {
    id: "tribunal",
    label: "Tribunal",
    icon: Scale,
  },
  {
    id: "members",
    label: "Membres",
    icon: CircleUserRound,
  },
  {
    id: "challenges",
    label: "Défis",
    icon: Flame,
  },
  {
    id: "logout",
    label: "Déconnexion",
    icon: LogOut,
  },
];

const implementedPages = [
  "home",
  "ranking",
  "events",
  "statistics",
  "bike",
  "tennis",
  "gallery",
  "gages",
  "profile",
  "members",
  "tribunal",
  "challenges",
];

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

const HOME_MONTH_LABELS = [
  "Jan",
  "Fév",
  "Mars",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sept",
  "Oct",
  "Nov",
  "Déc",
];

function getSafeDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function getItemDate(item) {
  return (
    item?.startsAt ??
    item?.starts_at ??
    item?.rideDate ??
    item?.ride_date ??
    item?.playedAt ??
    item?.played_at ??
    item?.matchDate ??
    item?.match_date ??
    item?.createdAt ??
    item?.created_at ??
    null
  );
}

function getBikeDistance(ride) {
  return Number(
    ride?.distanceKm ??
    ride?.distance_km ??
    ride?.distance ??
    0,
  );
}

function getMemberPoints(member) {
  return Number(
    member?.calculatedPoints ??
    member?.totalPoints ??
    member?.points ??
    0,
  );
}

function getMemberWins(member) {
  return Number(
    member?.tennisWins ??
    member?.wins ??
    0,
  );
}

function getMemberLosses(member) {
  return Number(
    member?.tennisLosses ??
    member?.losses ??
    0,
  );
}

function getMemberBikeKm(member) {
  return Number(
    member?.bikeDistance ??
    member?.bikeKm ??
    0,
  );
}

function getMemberName(member) {
  return (
    member?.nickname ??
    member?.firstName ??
    member?.first_name ??
    "Membre"
  );
}

function formatRelativeActivityDate(value) {
  const date = getSafeDate(value);

  if (!date) {
    return "Date inconnue";
  }

  const difference =
    Date.now() - date.getTime();

  const minutes = Math.floor(
    difference / 60000,
  );

  if (minutes < 1) {
    return "À l’instant";
  }

  if (minutes < 60) {
    return `Il y a ${minutes} min`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `Il y a ${hours} h`;
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days === 1) {
    return "Hier";
  }

  if (days < 7) {
    return `Il y a ${days} jours`;
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "numeric",
      month: "short",
    },
  ).format(date);
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

  const sortedMembers = useMemo(() => {
    return [...members].sort(
      (memberA, memberB) => {
        const pointsDifference =
          getMemberPoints(memberB) -
          getMemberPoints(memberA);

        if (pointsDifference !== 0) {
          return pointsDifference;
        }

        return (
          getMemberWins(memberB) -
          getMemberWins(memberA)
        );
      },
    );
  }, [members]);

  const completedTennisMatches =
    useMemo(() => {
      return tennisMatches.filter(
        (match) =>
          match.status === "completed" ||
          match.status === "finished" ||
          match.winnerTeam != null ||
          match.winner_team != null,
      );
    }, [tennisMatches]);

  const totalMatches =
    completedTennisMatches.length;

  const totalBikeKm = useMemo(() => {
    if (bikeRides.length > 0) {
      return bikeRides.reduce(
        (total, ride) =>
          total + getBikeDistance(ride),
        0,
      );
    }

    return members.reduce(
      (total, member) =>
        total +
        getMemberBikeKm(member),
      0,
    );
  }, [
    bikeRides,
    members,
  ]);

  const upcomingEvents = useMemo(() => {
    const now = Date.now();

    return events
      .filter((event) => {
        const date = getSafeDate(
          event.startsAt ??
          event.starts_at,
        );

        return (
          date &&
          date.getTime() >= now &&
          event.status !== "cancelled"
        );
      })
      .sort((eventA, eventB) => {
        return (
          getSafeDate(
            eventA.startsAt ??
            eventA.starts_at,
          )?.getTime() -
          getSafeDate(
            eventB.startsAt ??
            eventB.starts_at,
          )?.getTime()
        );
      });
  }, [events]);

  const connectedRanking = useMemo(() => {
    if (!user?.id) {
      return null;
    }

    const index =
      sortedMembers.findIndex(
        (member) =>
          String(member.id) ===
          String(user.id),
      );

    return index >= 0
      ? index + 1
      : null;
  }, [
    sortedMembers,
    user?.id,
  ]);

  const connectedMember = useMemo(() => {
    return (
      members.find(
        (member) =>
          String(member.id) ===
          String(user?.id),
      ) ??
      profile ??
      null
    );
  }, [
    members,
    profile,
    user?.id,
  ]);

  const connectedPoints =
    getMemberPoints(connectedMember);

  const leader =
    sortedMembers[0] ?? null;

  const homeActivityData = useMemo(() => {
    const now = new Date();

    const months = Array.from(
      { length: 6 },
      (_, index) => {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() -
          (5 - index),
          1,
        );

        return {
          year: date.getFullYear(),
          monthIndex: date.getMonth(),
          month:
            HOME_MONTH_LABELS[
            date.getMonth()
            ],
          tennis: 0,
          velo: 0,
        };
      },
    );

    completedTennisMatches.forEach(
      (match) => {
        const date = getSafeDate(
          getItemDate(match),
        );

        if (!date) {
          return;
        }

        const target = months.find(
          (month) =>
            month.year ===
            date.getFullYear() &&
            month.monthIndex ===
            date.getMonth(),
        );

        if (target) {
          target.tennis += 1;
        }
      },
    );

    bikeRides.forEach((ride) => {
      const date = getSafeDate(
        getItemDate(ride),
      );

      if (!date) {
        return;
      }

      const target = months.find(
        (month) =>
          month.year ===
          date.getFullYear() &&
          month.monthIndex ===
          date.getMonth(),
      );

      if (target) {
        target.velo +=
          getBikeDistance(ride);
      }
    });

    return months.map((month) => ({
      month: month.month,
      tennis: month.tennis,
      velo:
        Math.round(
          month.velo * 10,
        ) / 10,
    }));
  }, [
    completedTennisMatches,
    bikeRides,
  ]);

  const homeChartSummary = useMemo(() => {
    const totalTennis =
      homeActivityData.reduce(
        (total, month) =>
          total + month.tennis,
        0,
      );

    const totalBike =
      homeActivityData.reduce(
        (total, month) =>
          total + month.velo,
        0,
      );

    return {
      title: `${totalTennis} match${totalTennis > 1 ? "s" : ""
        } · ${Math.round(
          totalBike,
        ).toLocaleString("fr-FR")} km`,

      description:
        "Activité enregistrée pendant les six derniers mois.",
    };
  }, [homeActivityData]);

  const homeRecentActivities =
    useMemo(() => {
      const matchActivities =
        tennisMatches.map((match) => ({
          id: `tennis-${match.id}`,
          icon: "tennis",
          title:
            match.title ??
            "Match de tennis enregistré",
          description:
            match.scoreSummary ??
            match.score_summary ??
            match.result ??
            "Un nouveau résultat a été ajouté.",
          date: getItemDate(match),
          page: "tennis",
        }));

      const bikeActivities =
        bikeRides.map((ride) => ({
          id: `bike-${ride.id}`,
          icon: "bike",
          title:
            ride.title ??
            "Sortie vélo",
          description: `${getBikeDistance(
            ride,
          ).toLocaleString(
            "fr-FR",
            {
              maximumFractionDigits: 1,
            },
          )} km${ride.location
              ? ` · ${ride.location}`
              : ""
            }`,
          date: getItemDate(ride),
          page: "bike",
        }));

      const eventActivities =
        events.map((event) => ({
          id: `event-${event.id}`,
          icon: "party",
          title:
            event.title ??
            "Nouvel événement",
          description:
            event.description ??
            "Un événement a été ajouté.",
          date: getItemDate(event),
          page: "events",
        }));

      const gageActivities =
        gages.map((gage) => ({
          id: `gage-${gage.id}`,
          icon: "gage",
          title:
            gage.title ??
            "Nouveau gage",
          description:
            gage.status === "validated"
              ? "Le gage a été validé."
              : gage.status ===
                "completed"
                ? "Le gage a été réalisé."
                : "Un gage a été attribué.",
          date: getItemDate(gage),
          page: "gages",
        }));

      const tribunalActivities =
        tribunalCases.map(
          (tribunalCase) => ({
            id: `tribunal-${tribunalCase.id}`,
            icon: "tribunal",
            title:
              tribunalCase.title ??
              "Nouvelle affaire",
            description:
              tribunalCase.status ===
                "judged"
                ? "Le verdict a été rendu."
                : tribunalCase.status ===
                  "voting"
                  ? "Le vote est ouvert."
                  : "Une affaire a été créée.",
            date:
              getItemDate(
                tribunalCase,
              ),
            page: "tribunal",
          }),
        );

      return [
        ...matchActivities,
        ...bikeActivities,
        ...eventActivities,
        ...gageActivities,
        ...tribunalActivities,
      ]
        .filter((activity) =>
          Boolean(
            getSafeDate(
              activity.date,
            ),
          ),
        )
        .sort((activityA, activityB) => {
          return (
            getSafeDate(
              activityB.date,
            ).getTime() -
            getSafeDate(
              activityA.date,
            ).getTime()
          );
        })
        .slice(0, 6)
        .map((activity) => ({
          ...activity,
          time:
            formatRelativeActivityDate(
              activity.date,
            ),
        }));
    }, [
      tennisMatches,
      bikeRides,
      events,
      gages,
      tribunalCases,
    ]);

  const currentNavigationItem = navigation.find((item) => {
    return item.id === activePage;
  });

  const pageTitle = currentNavigationItem?.label ?? "Accueil";

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
    const CurrentIcon = currentNavigationItem?.icon ?? House;

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

              {activePage === "home" && (
                <>
                  <HeroBanner
                    nickname={connectedNickname}
                    memberCount={members.length}
                    eventCount={events.length}
                    matchCount={totalMatches}
                    leaderName={
                      leader
                        ? getMemberName(leader)
                        : null
                    }
                    currentChallenge={null}
                    onCreateEvent={openCreateEventModal}
                    onAddScore={() =>
                      setScoreModalOpen(true)
                    }
                    onOpenMembers={() =>
                      navigateTo("members")
                    }
                  />

                  <section className="stats-grid">
                    <StatCard
                      icon={Trophy}
                      label="Matchs joués"
                      value={totalMatches}
                      detail={`${getMemberWins(
                        connectedMember,
                      )} victoire${getMemberWins(
                        connectedMember,
                      ) > 1
                          ? "s"
                          : ""
                        } pour toi`}
                      accent="green"
                    />

                    <StatCard
                      icon={Bike}
                      label="Kilomètres vélo"
                      value={Math.round(
                        totalBikeKm,
                      ).toLocaleString("fr-FR")}
                      detail={`${bikeRides.length} sortie${bikeRides.length > 1
                          ? "s"
                          : ""
                        } enregistrée${bikeRides.length > 1
                          ? "s"
                          : ""
                        }`}
                      accent="blue"
                    />

                    <StatCard
                      icon={CalendarDays}
                      label="Événements"
                      value={events.length}
                      detail={`${upcomingEvents.length} à venir`}
                      accent="amber"
                    />

                    <StatCard
                      icon={Medal}
                      label={`Points de ${connectedNickname}`}
                      value={connectedPoints}
                      detail={
                        connectedRanking
                          ? `${connectedRanking}${connectedRanking === 1
                            ? "er"
                            : "e"
                          } sur ${members.length}`
                          : "Non classé"
                      }
                      accent="purple"
                    />
                  </section>

                  <section className="dashboard-grid dashboard-grid--main">
                    <div className="dashboard-column dashboard-column--wide">
                      <section className="section-block">
                        <div className="section-heading">
                          <div>
                            <span className="section-heading__eyebrow">
                              Agenda
                            </span>

                            <h2>
                              Prochains événements
                            </h2>
                          </div>

                          <button
                            type="button"
                            className="text-button"
                            onClick={() => navigateTo("events")}
                          >
                            Tout afficher
                            <ChevronRight size={17} />
                          </button>
                        </div>

                        <div className="events-grid">
                          {upcomingEvents
                            .slice(0, 3)
                            .map((event, index) => (
                              <EventCard
                                key={event.id}
                                event={event}
                                index={index}
                              />
                            ))}
                          {upcomingEvents.length === 0 && (
                            <div className="home-empty-state glass-panel">
                              <CalendarDays size={24} />

                              <div>
                                <strong>
                                  Aucun événement à venir
                                </strong>

                                <p>
                                  Crée un événement pour
                                  l’afficher sur l’accueil.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </section>

                      <section className="next-bike-ride glass-panel">
                        <header className="next-bike-ride__header">
                          <div>
                            <span className="section-heading__eyebrow">
                              Cyclisme
                            </span>

                            <h2>Prochaine sortie vélo</h2>
                          </div>

                          <button
                            type="button"
                            className="text-button"
                            onClick={() => navigateTo("bike")}
                          >
                            Voir les sorties
                            <ChevronRight size={17} />
                          </button>
                        </header>

                        {bikeLoading ? (
                          <div className="next-bike-ride__state">
                            <span className="data-status__spinner" />

                            <p>Chargement de la prochaine sortie…</p>
                          </div>
                        ) : nextPlannedBikeRide ? (
                          <motion.article
                            key={nextPlannedBikeRide.id}
                            className="next-bike-ride__content"
                            initial={{
                              opacity: 0,
                              y: 12,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                          >
                            <div className="next-bike-ride__icon">
                              <Bike size={29} />
                            </div>

                            <div className="next-bike-ride__main">
                              <span className="next-bike-ride__badge">
                                Sortie prévue
                              </span>

                              <h3>{nextPlannedBikeRide.title}</h3>

                              {nextPlannedBikeRide.description && (
                                <p>
                                  {nextPlannedBikeRide.description}
                                </p>
                              )}

                              <div className="next-bike-ride__meta">
                                <span>
                                  <CalendarDays size={16} />

                                  {formatBikeRideDate(
                                    nextPlannedBikeRide.rideDate,
                                  )}
                                </span>

                                <span>
                                  <Clock3 size={16} />

                                  {formatBikeRideTime(
                                    nextPlannedBikeRide.rideDate,
                                  )}
                                </span>

                                {nextPlannedBikeRide.location && (
                                  <span>
                                    <MapPin size={16} />

                                    {nextPlannedBikeRide.location}
                                  </span>
                                )}
                              </div>

                              <div className="next-bike-ride__metrics">
                                <div>
                                  <Route size={17} />

                                  <span>
                                    <small>Distance</small>

                                    <strong>
                                      {nextPlannedBikeRide.distanceKm || 0} km
                                    </strong>
                                  </span>
                                </div>

                                <div>
                                  <Mountain size={17} />

                                  <span>
                                    <small>Dénivelé</small>

                                    <strong>
                                      {nextPlannedBikeRide.elevationM || 0} m
                                    </strong>
                                  </span>
                                </div>

                                {nextPlannedBikeRide.durationMinutes && (
                                  <div>
                                    <Clock3 size={17} />

                                    <span>
                                      <small>Durée</small>

                                      <strong>
                                        {formatBikeRideDuration(
                                          nextPlannedBikeRide.durationMinutes,
                                        )}
                                      </strong>
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="next-bike-ride__side">
                              <div className="next-bike-ride__participants">
                                <small>Participants</small>

                                <div>
                                  {nextPlannedBikeRide.participantProfiles
                                    .slice(0, 5)
                                    .map((participant) => (
                                      <span
                                        key={participant.id}
                                        title={participant.nickname}
                                      >
                                        {participant.initials}
                                      </span>
                                    ))}
                                </div>
                              </div>

                              <button
                                type="button"
                                className="primary-button"
                                onClick={() => navigateTo("bike")}
                              >
                                Voir la sortie
                              </button>
                            </div>
                          </motion.article>
                        ) : (
                          <div className="next-bike-ride__empty">
                            <span>
                              <Bike size={29} />
                            </span>

                            <div>
                              <strong>Aucune sortie prévue</strong>

                              <p>
                                Ajoute une sortie avec le statut « Prévue » pour
                                l’afficher ici.
                              </p>
                            </div>

                            <button
                              type="button"
                              className="primary-button"
                              onClick={openCreateBikeRideModal}
                            >
                              <Plus size={17} />
                              Planifier une sortie
                            </button>
                          </div>
                        )}
                      </section>

                      <section className="section-block">
                        <div className="section-heading">
                          <div>
                            <span className="section-heading__eyebrow">
                              Performances
                            </span>

                            <h2>
                              Activité du groupe
                            </h2>
                          </div>

                          <div className="chart-legend">
                            <span className="chart-legend__item">
                              <i className="chart-legend__dot chart-legend__dot--green" />
                              Tennis
                            </span>

                            <span className="chart-legend__item">
                              <i className="chart-legend__dot chart-legend__dot--blue" />
                              Vélo
                            </span>
                          </div>
                        </div>

                        <ActivityChart
                          data={homeActivityData}
                          summary={homeChartSummary}
                        />
                      </section>
                    </div>

                    <aside className="dashboard-column dashboard-column--side">
                      <Podium members={sortedMembers} />

                      {/* <WeeklyChallenge
                        challenge={weeklyChallenge}
                      /> */}
                      <section className="weekly-challenge weekly-challenge--empty glass-panel">
                        <div className="weekly-challenge__header">
                          <div className="weekly-challenge__icon">
                            <Dices size={22} />
                          </div>

                          <div className="weekly-challenge__title-group">
                            <span className="section-heading__eyebrow">
                              Défi de la semaine
                            </span>

                            <h2>
                              Aucun challenge actif
                            </h2>
                          </div>
                        </div>

                        <p className="weekly-challenge__description">
                          Les challenges hebdomadaires
                          seront bientôt gérés depuis une
                          page dédiée.
                        </p>
                      </section>

                      <ActivityFeed
                        activities={homeRecentActivities}
                        onOpenActivity={(activity) =>
                          navigateTo(
                            activity.page ?? "home",
                          )
                        }
                      />
                    </aside>
                  </section>
                </>
              )}

              {activePage === "events" && (
                <EventsSection
                  events={events}
                  loading={eventsLoading}
                  saving={eventsSaving}
                  error={eventsError}
                  currentProfile={profile}
                  isAdmin={isAdmin}
                  onCreate={openCreateEventModal}
                  onEdit={openEditEventModal}
                  onDelete={removeEvent}
                  onAttendance={handleAttendance}
                />
              )}

              {activePage === "tennis" && (
                <TennisSection
                  matches={tennisMatches}
                  members={members}
                  loading={tennisLoading}
                  error={tennisError}
                  onAddMatch={() =>
                    setScoreModalOpen(true)
                  }
                />
              )}

              {activePage === "bike" && (
                <CyclingSection
                  rides={bikeRides}
                  members={members}
                  loading={bikeLoading}
                  saving={bikeSaving}
                  error={bikeError}
                  currentProfile={profile}
                  isAdmin={isAdmin}
                  onCreate={openCreateBikeRideModal}
                  onEdit={openEditBikeRideModal}
                  onDelete={handleDeleteBikeRide}
                  onJoin={handleJoinBikeRide}
                  onLeave={handleLeaveBikeRide}
                />
              )}

              {activePage === "ranking" && (
                <RankingSection
                  members={members}
                  events={events}
                  gages={gages}
                />
              )}

              {activePage === "statistics" && (
                <StatisticsSection
                  members={members}
                  tennisMatches={tennisMatches}
                  bikeRides={bikeRides}
                  events={events}
                  galleryPhotos={galleryPhotos}
                  gages={gages}
                  tribunalCases={tribunalCases}
                />
              )}

              {activePage === "gallery" && (
                <GallerySection
                  albums={galleryAlbums}
                  photos={galleryPhotos}
                  loading={galleryLoading}
                  error={galleryError}
                  currentProfile={
                    profile ?? {
                      id: user?.id,
                      nickname: "Membre",
                      initials: "CP",
                    }
                  }
                  isAdmin={isAdmin}
                  onOpenUpload={openGalleryUploadModal}
                  onOpenPhoto={openGalleryPhoto}
                  onLikePhoto={handleGalleryLike}
                  onDeletePhoto={handleGalleryPhotoDelete}
                />
              )}

              {activePage === "profile" && (
                <ProfileSection
                  profile={personalProfile}
                  statistics={profileStatistics}
                  tennisMatches={tennisMatches}
                  bikeRides={bikeRides}
                  galleryPhotos={galleryPhotos}
                  galleryComments={galleryComments}
                  loading={profileLoading}
                  activityLoading={
                    tennisLoading ||
                    bikeLoading ||
                    galleryLoading
                  }
                  saving={profileSaving}
                  uploadingAvatar={uploadingAvatar}
                  error={profileError}
                  onEditProfile={openEditProfileModal}
                  onChangePassword={openChangePasswordModal}
                  onUploadAvatar={handleAvatarUpload}
                  onDeleteAvatar={handleAvatarDelete}
                  onNavigate={navigateTo}
                />
              )}

              {activePage === "gages" && (
                <GagesSection
                  gages={gages}
                  loading={gagesLoading}
                  error={gagesError}
                  onCreate={openGageForm}
                  onOpen={openGageDetails}
                />
              )}

              {activePage === "members" && (
                <MembersSection
                  members={members}
                  loading={profilesLoading}
                  error={profilesError}
                  currentProfileId={user?.id}
                  onOpenMember={openMemberProfile}
                />
              )}

              {activePage === "tribunal" && (
                <TribunalSection
                  cases={tribunalCases}
                  loading={tribunalLoading}
                  saving={tribunalSaving}
                  error={tribunalError}
                  isAdmin={isAdmin}
                  onCreate={openTribunalForm}
                  onOpenCase={openTribunalCase}
                />
              )}

              {!implementedPages.includes(activePage) &&
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

      <ScoreModal
        open={scoreModalOpen}
        members={members}
        saving={tennisSaving}
        onSave={handleSaveTennisMatch}
        onClose={() => {
          if (!tennisSaving) {
            setScoreModalOpen(false);
          }
        }}
      />

      <EventFormModal
        open={eventModalOpen}
        event={eventBeingEdited}
        saving={eventsSaving}
        onClose={closeEventModal}
        onSubmit={handleEventSubmit}
      />

      <BikeRideFormModal
        open={bikeModalOpen}
        ride={bikeRideBeingEdited}
        members={members}
        currentProfileId={user?.id}
        saving={bikeSaving}
        onClose={closeBikeRideModal}
        onSubmit={handleBikeRideSubmit}
      />

      <TribunalFormModal
        open={tribunalFormOpen}
        members={members}
        currentProfileId={user?.id}
        saving={tribunalSaving}
        error={tribunalError}
        onClose={closeTribunalForm}
        onSubmit={handleTribunalSubmit}
      />

      <TribunalCaseModal
        open={tribunalCaseModalOpen}
        tribunalCase={selectedTribunalCase}
        currentProfile={profile}
        saving={tribunalSaving}
        error={tribunalError}
        onClose={closeTribunalCase}
        onVote={handleTribunalVote}
        onStartVoting={
          handleStartTribunalVoting
        }
        onJudge={
          handleJudgeTribunalCase
        }
        onDismiss={
          handleDismissTribunalCase
        }
      />

      <GageFormModal
        open={gageFormOpen}
        members={members}
        currentProfileId={user?.id}
        saving={gagesSaving}
        error={gagesError}
        onClose={closeGageForm}
        onSubmit={handleGageSubmit}
      />

      <GageDetailsModal
        open={gageDetailsOpen}
        gage={selectedGage}
        currentProfile={profile}
        saving={gagesSaving}
        uploading={gagesUploading}
        error={gagesError}
        onClose={closeGageDetails}
        onStart={handleStartGage}
        onComplete={handleCompleteGage}
        onValidate={handleValidateGage}
        onCancel={handleCancelGage}
        onUploadProof={handleUploadGageProof}
        onDeleteProof={handleDeleteGageProof}
        onDelete={handleDeleteGage}
      />

      <MemberProfileModal
        open={memberModalOpen}
        member={selectedMember}
        statistics={selectedMemberStatistics}
        loading={memberStatisticsLoading}
        error={memberStatisticsError}
        onClose={closeMemberProfile}
      />

      <UploadPhotosModal
        open={galleryUploadOpen}
        albums={galleryAlbums}
        members={members}
        currentProfileId={user?.id}
        uploading={galleryUploading}
        uploadProgress={galleryUploadProgress}
        onClose={closeGalleryUploadModal}
        onUpload={handleGalleryUpload}
      />

      <GalleryViewer
        photos={galleryPhotos}
        currentIndex={galleryViewerIndex}
        isOpen={galleryViewerOpen}
        currentProfile={
          profile ?? {
            id: user?.id,
            nickname: "Membre",
            initials: "CP",
          }
        }
        isAdmin={isAdmin}
        saving={gallerySaving}
        onClose={closeGalleryViewer}
        onPrevious={showPreviousGalleryPhoto}
        onNext={showNextGalleryPhoto}
        onLike={handleGalleryLike}
        onAddComment={handleGalleryCommentAdd}
        onEditComment={handleGalleryCommentEdit}
        onDeleteComment={handleGalleryCommentDelete}
      />

      <EditProfileModal
        open={editProfileModalOpen}
        profile={personalProfile}
        saving={profileSaving}
        onClose={closeEditProfileModal}
        onSubmit={handleProfileSubmit}
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

      <ChangePasswordModal
        open={changePasswordModalOpen}
        changingPassword={changingPassword}
        onClose={closeChangePasswordModal}
        onSubmit={handlePasswordSubmit}
      />
    </div>
  );
}

export default App;