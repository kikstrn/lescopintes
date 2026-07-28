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
  Plus,
  Scale,
  Trophy,
  Clock3,
  MapPin,
  Mountain,
  Route,
  LogOut,
} from "lucide-react";


import Sidebar from "./components/Sidebar";
import MobileNavigation from "./components/MobileNavigation";
import HeroBanner from "./components/HeroBanner";
import StatCard from "./components/StatCard";
import EventCard from "./components/EventCard";
import Podium from "./components/Podium";
import ActivityChart from "./components/ActivityChart";
import BikeMap from "./components/BikeMap";
import ActivityFeed from "./components/ActivityFeed";
import WeeklyChallenge from "./components/WeeklyChallenge";
import ScoreModal from "./components/ScoreModal";

import GagesSection from "./components/GagesSection";
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

import { useTribunalCases } from "./hooks/useTribunalCases";

import { getProfileStatistics } from "./services/profileService";

import { useProfile } from "./hooks/useProfile";
import { useProfiles } from "./hooks/useProfiles";

import { useGallery } from "./hooks/useGallery";

import { useEffect } from "react";
import { testSupabaseConnection } from "./lib/testSupabase";
import { useAuth } from "./context/AuthContext";

import {
  activityData,
  recentActivities,
  weeklyChallenge,
} from "./data/demoData";

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
    return [...members].sort((memberA, memberB) => {
      return memberB.points - memberA.points;
    });
  }, [members]);

  const totalBikeKm = useMemo(() => {
    return members.reduce((total, member) => {
      return total + Number(member.bikeKm ?? 0);
    }, 0);
  }, [members]);

  const totalMatches = useMemo(() => {
    const totalParticipations = members.reduce(
      (total, member) => {
        return (
          total +
          Number(member.wins ?? 0) +
          Number(member.losses ?? 0)
        );
      },
      0,
    );

    return Math.round(totalParticipations / 2);
  }, [members]);

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
                    onCreateEvent={openCreateEventModal}
                    onAddScore={() => setScoreModalOpen(true)}
                  />

                  <section className="stats-grid">
                    <StatCard
                      icon={Trophy}
                      label="Matchs joués"
                      value={totalMatches}
                      detail="+30 % ce mois-ci"
                      accent="green"
                    />

                    <StatCard
                      icon={Bike}
                      label="Kilomètres vélo"
                      value={totalBikeKm.toLocaleString("fr-FR")}
                      detail="+486 km ce mois-ci"
                      accent="blue"
                    />

                    <StatCard
                      icon={CalendarDays}
                      label="Événements"
                      value="26"
                      detail="4 événements à venir"
                      accent="amber"
                    />

                    <StatCard
                      icon={Trophy}
                      label="Points de Kiks"
                      value="248"
                      detail="1er du classement"
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
                          {events
                            .filter(
                              (event) =>
                                new Date(event.startsAt).getTime() >=
                                Date.now(),
                            )
                            .slice(0, 3)
                            .map((event, index) => (
                              <EventCard
                                key={event.id}
                                event={event}
                                index={index}
                              />
                            ))}
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

                        <ActivityChart data={activityData} />
                      </section>
                    </div>

                    <aside className="dashboard-column dashboard-column--side">
                      <Podium members={sortedMembers} />

                      <WeeklyChallenge
                        challenge={weeklyChallenge}
                      />

                      <ActivityFeed
                        activities={recentActivities}
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
                <RankingSection members={members} />
              )}

              {activePage === "statistics" && (
                <StatisticsSection members={members} />
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
                <GagesSection members={members} />
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