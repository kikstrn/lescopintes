import TennisSection from "../../../components/TennisSection";

import { useAppData } from "../../context/AppDataContext";

function TennisPage() {
  const {
    members = [],
    tennisMatches = [],

    loading = {},
    errors = {},

    openScoreModal,
  } = useAppData();

  return (
    <TennisSection
      matches={tennisMatches}
      members={members}
      loading={loading.tennis ?? false}
      error={errors.tennis ?? null}
      onAddMatch={openScoreModal}
    />
  );
}

export default TennisPage;