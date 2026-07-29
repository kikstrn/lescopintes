import StatisticsSection from "../../../components/StatisticsSection";

import { useAppData } from "../../context/AppDataContext";

function StatisticsPage() {
  const {
    members = [],
    tennisMatches = [],
    bikeRides = [],
    events = [],
    galleryPhotos = [],
    gages = [],
    tribunalCases = [],

    loading = {},
    errors = {},
  } = useAppData();

  const isLoading =
    Boolean(loading.profiles) ||
    Boolean(loading.tennis) ||
    Boolean(loading.bike) ||
    Boolean(loading.events) ||
    Boolean(loading.gallery) ||
    Boolean(loading.gages) ||
    Boolean(loading.tribunal);

  const firstError =
    errors.profiles ??
    errors.tennis ??
    errors.bike ??
    errors.events ??
    errors.gallery ??
    errors.gages ??
    errors.tribunal ??
    null;

  return (
    <StatisticsSection
      members={members}
      tennisMatches={tennisMatches}
      bikeRides={bikeRides}
      events={events}
      galleryPhotos={galleryPhotos}
      gages={gages}
      tribunalCases={tribunalCases}
      loading={isLoading}
      error={firstError}
    />
  );
}

export default StatisticsPage;