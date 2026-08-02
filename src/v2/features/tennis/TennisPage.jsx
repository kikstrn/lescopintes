import TennisSection from "../../../components/TennisSection";

import { useAppData } from "../../context/AppDataContext";

function TennisPage() {
  const {
    members = [],
    tennisMatches = [],

    tennisLeaderboard = [],
    tennisLeaderboardLoading = false,
    tennisLeaderboardError = null,

    loading = {},
    errors = {},

    openScoreModal,
  } = useAppData();

  return (
    <TennisSection
      matches={tennisMatches}
      members={members}
      tennisLeaderboard={
        tennisLeaderboard
      }

      tennisLeaderboardLoading={
        tennisLeaderboardLoading
      }

      tennisLeaderboardError={
        tennisLeaderboardError
      }
      loading={loading.tennis ?? false}
      error={errors.tennis ?? null}
      onAddMatch={openScoreModal}
    />
  );
}

export default TennisPage;