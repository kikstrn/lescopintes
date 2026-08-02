import RankingSection from "../../../components/RankingSection";

import { useAppData } from "../../context/AppDataContext";

function RankingPage() {
  const {
    members = [],
    events = [],
    gages = [],

    loading = {},
    errors = {},

    pointsTotalsLoading = false,
    pointsTotalsError = null,
  } = useAppData();

  return (
    <RankingSection
      members={members}
      events={events}
      gages={gages}
      loading={
        Boolean(
          loading.profiles ||
          pointsTotalsLoading,
        )
      }
      error={
        errors.profiles ??
        pointsTotalsError ??
        null
      }
    />
  );
}

export default RankingPage;