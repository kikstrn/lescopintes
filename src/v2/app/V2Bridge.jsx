import AppV2 from "../AppV2";

function V2Bridge({
  members = [],
  events = [],
  tennisMatches = [],
  bikeRides = [],
  galleryAlbums = [],
  galleryPhotos = [],
  galleryComments = [],
  tribunalCases = [],
  gages = [],
  challenges = [],
  activeChallenge = null,

  personalProfile = null,
  profileStatistics = null,

  loading = {},
  errors = {},
  actions = {},
}) {
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

    ...actions,
  };

  return (
    <AppV2
      appData={appData}
    />
  );
}

export default V2Bridge;