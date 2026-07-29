import RankingSection from "../../../components/RankingSection";

import { useAppData } from "../../context/AppDataContext";

function RankingPage() {
  const {
    members = [],
    events = [],
    gages = [],

    loading = {},
    errors = {},
  } = useAppData();

  return (
    <RankingSection
      members={members}
      events={events}
      gages={gages}
      loading={
        loading.profiles ??
        false
      }
      error={
        errors.profiles ??
        null
      }
    />
  );
}

export default RankingPage;