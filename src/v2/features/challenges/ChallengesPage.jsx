import ChallengesSection from "../../../components/challenges/ChallengesSection";

import { useAuth } from "../../../context/AuthContext";
import { useAppData } from "../../context/AppDataContext";

function ChallengesPage() {
  const {
    user,
    isAdmin,
  } = useAuth();

  const {
    members = [],
    tennisMatches = [],
    bikeRides = [],
    events = [],
    galleryPhotos = [],
    tribunalCases = [],
    gages = [],

    challenges = [],
    activeChallenge = null,

    createChallenge,
    updateChallenge,
    archiveChallenge,
  } = useAppData();

  return (
    <ChallengesSection
      members={members}
      tennisMatches={tennisMatches}
      bikeRides={bikeRides}
      events={events}
      galleryPhotos={galleryPhotos}
      tribunalCases={tribunalCases}
      gages={gages}

      challenges={challenges}
      activeChallenge={activeChallenge}

      createChallenge={createChallenge}
      updateChallenge={updateChallenge}
      archiveChallenge={archiveChallenge}

      isAdmin={isAdmin}
      currentProfileId={user?.id}
    />
  );
}

export default ChallengesPage;