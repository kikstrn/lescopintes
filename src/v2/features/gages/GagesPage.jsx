import GagesSection from "../../../components/gages/GagesSection";

import { useAppData } from "../../context/AppDataContext";

function GagesPage() {
  const {
    gages = [],

    loading = {},
    errors = {},

    openGageForm,
    openGageDetails,
  } = useAppData();

  return (
    <GagesSection
      gages={gages}
      loading={loading.gages ?? false}
      error={errors.gages ?? null}
      onCreate={openGageForm}
      onOpen={openGageDetails}
    />
  );
}

export default GagesPage;