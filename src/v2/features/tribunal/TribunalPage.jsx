import TribunalSection from "../../../components/tribunal/TribunalSection";

import { useAuth } from "../../../context/AuthContext";
import { useAppData } from "../../context/AppDataContext";

function TribunalPage() {
  const {
    isAdmin,
  } = useAuth();

  const {
    tribunalCases = [],

    loading = {},
    errors = {},

    openTribunalForm,
    openTribunalCase,
  } = useAppData();

  return (
    <TribunalSection
      cases={tribunalCases}
      loading={
        loading.tribunal ?? false
      }
      saving={
        loading.tribunalSaving ?? false
      }
      error={
        errors.tribunal ?? null
      }
      isAdmin={isAdmin}
      onCreate={openTribunalForm}
      onOpenCase={openTribunalCase}
    />
  );
}

export default TribunalPage;