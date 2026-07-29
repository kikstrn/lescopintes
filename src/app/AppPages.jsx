import HomePage from "../features/home/HomePage";

import EventsSection from "../components/EventsSection";
import TennisSection from "../components/TennisSection";
import CyclingSection from "../components/CyclingSection";
import RankingSection from "../components/RankingSection";
import StatisticsSection from "../components/StatisticsSection";

import GallerySection from "../components/gallery/GallerySection";
import ProfileSection from "../components/profile/ProfileSection";
import GagesSection from "../components/gages/GagesSection";
import MembersSection from "../components/members/MembersSection";
import TribunalSection from "../components/tribunal/TribunalSection";

import ChallengesSection from "../components/challenges/ChallengesSection";

function AppPages({
  activePage,

  homeProps,

  members = [],
  profile,
  user,
  isAdmin = false,

  events = [],
  eventsLoading = false,
  eventsSaving = false,
  eventsError,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onAttendance,

  tennisMatches = [],
  tennisLoading = false,
  tennisError,
  onAddMatch,

  bikeRides = [],
  bikeLoading = false,
  bikeSaving = false,
  bikeError,
  onCreateBikeRide,
  onEditBikeRide,
  onDeleteBikeRide,
  onJoinBikeRide,
  onLeaveBikeRide,

  galleryAlbums = [],
  galleryPhotos = [],
  galleryLoading = false,
  galleryError,
  onOpenGalleryUpload,
  onOpenGalleryPhoto,
  onLikeGalleryPhoto,
  onDeleteGalleryPhoto,

  personalProfile,
  profileStatistics,
  profileLoading = false,
  profileActivityLoading = false,
  profileSaving = false,
  uploadingAvatar = false,
  profileError,
  galleryComments = [],
  onEditProfile,
  onChangePassword,
  onUploadAvatar,
  onDeleteAvatar,
  onNavigate,

  gages = [],
  gagesLoading = false,
  gagesError,
  onCreateGage,
  onOpenGage,

  tribunalCases = [],
  tribunalLoading = false,
  tribunalSaving = false,
  tribunalError,
  onCreateTribunalCase,
  onOpenTribunalCase,

  profilesLoading = false,
  profilesError,
  onOpenMember,

  challenges = [],
  activeChallenge,
  createChallenge,
  updateChallenge,
  archiveChallenge,

  renderPlaceholderPage,
  isImplementedPage,
}) {
  const currentProfile =
    profile ?? {
      id: user?.id,
      nickname: "Membre",
      initials: "CP",
    };

  return (
    <>
      {profilesLoading && (
        <section className="data-status glass-panel">
          <span className="data-status__spinner" />

          <div>
            <strong>
              Chargement des membres
            </strong>

            <p>
              Récupération des données
              Supabase…
            </p>
          </div>
        </section>
      )}

      {profilesError && (
        <section className="data-status data-status--error glass-panel">
          <div>
            <strong>
              Impossible de charger les
              membres
            </strong>

            <p>{profilesError}</p>
          </div>
        </section>
      )}

      {activePage === "home" && (
        <HomePage {...homeProps} />
      )}

      {activePage === "events" && (
        <EventsSection
          events={events}
          loading={eventsLoading}
          saving={eventsSaving}
          error={eventsError}
          currentProfile={currentProfile}
          isAdmin={isAdmin}
          onCreate={onCreateEvent}
          onEdit={onEditEvent}
          onDelete={onDeleteEvent}
          onAttendance={onAttendance}
        />
      )}

      {activePage === "tennis" && (
        <TennisSection
          matches={tennisMatches}
          members={members}
          loading={tennisLoading}
          error={tennisError}
          onAddMatch={onAddMatch}
        />
      )}

      {activePage === "bike" && (
        <CyclingSection
          rides={bikeRides}
          members={members}
          loading={bikeLoading}
          saving={bikeSaving}
          error={bikeError}
          currentProfile={currentProfile}
          isAdmin={isAdmin}
          onCreate={onCreateBikeRide}
          onEdit={onEditBikeRide}
          onDelete={onDeleteBikeRide}
          onJoin={onJoinBikeRide}
          onLeave={onLeaveBikeRide}
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
          currentProfile={currentProfile}
          isAdmin={isAdmin}
          onOpenUpload={onOpenGalleryUpload}
          onOpenPhoto={onOpenGalleryPhoto}
          onLikePhoto={onLikeGalleryPhoto}
          onDeletePhoto={onDeleteGalleryPhoto}
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
            profileActivityLoading
          }
          saving={profileSaving}
          uploadingAvatar={
            uploadingAvatar
          }
          error={profileError}
          onEditProfile={onEditProfile}
          onChangePassword={
            onChangePassword
          }
          onUploadAvatar={onUploadAvatar}
          onDeleteAvatar={onDeleteAvatar}
          onNavigate={onNavigate}
        />
      )}

      {activePage === "gages" && (
        <GagesSection
          gages={gages}
          loading={gagesLoading}
          error={gagesError}
          onCreate={onCreateGage}
          onOpen={onOpenGage}
        />
      )}

      {activePage === "members" && (
        <MembersSection
          members={members}
          loading={profilesLoading}
          error={profilesError}
          currentProfileId={user?.id}
          onOpenMember={onOpenMember}
        />
      )}

      {activePage === "tribunal" && (
        <TribunalSection
          cases={tribunalCases}
          loading={tribunalLoading}
          saving={tribunalSaving}
          error={tribunalError}
          isAdmin={isAdmin}
          onCreate={onCreateTribunalCase}
          onOpenCase={onOpenTribunalCase}
        />
      )}

      {activePage === "challenges" && (
        <ChallengesSection
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
          members={members}
          tennisMatches={tennisMatches}
          bikeRides={bikeRides}
          events={events}
          tribunalCases={tribunalCases}
          gages={gages}
          galleryPhotos={galleryPhotos}
          isAdmin={isAdmin}
          currentProfileId={user?.id}
        />
      )}

      {!isImplementedPage(activePage) &&
        renderPlaceholderPage?.()}
    </>
  );
}

export default AppPages;