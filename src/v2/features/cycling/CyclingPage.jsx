import CyclingSection from "../../../components/CyclingSection";

import { useAuth } from "../../../context/AuthContext";
import { useAppData } from "../../context/AppDataContext";

function CyclingPage() {
  const {
    profile,
    isAdmin,
  } = useAuth();

  const {
    members = [],
    bikeRides = [],

    loading = {},
    errors = {},

    openCreateBikeRide,
    openEditBikeRide,
    deleteBikeRide,
    joinBikeRide,
    leaveBikeRide,
  } = useAppData();

  return (
    <CyclingSection
      rides={bikeRides}
      members={members}
      loading={loading.bike ?? false}
      saving={loading.bikeSaving ?? false}
      error={errors.bike ?? null}
      currentProfile={profile}
      isAdmin={isAdmin}
      onCreate={openCreateBikeRide}
      onEdit={openEditBikeRide}
      onDelete={deleteBikeRide}
      onJoin={joinBikeRide}
      onLeave={leaveBikeRide}
    />
  );
}

export default CyclingPage;