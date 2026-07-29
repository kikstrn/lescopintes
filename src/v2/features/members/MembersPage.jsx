import MembersSection from "../../../components/members/MembersSection";

import { useAuth } from "../../../context/AuthContext";
import { useAppData } from "../../context/AppDataContext";

function MembersPage() {
  const {
    user,
  } = useAuth();

  const {
    members = [],

    loading = {},
    errors = {},

    openMemberProfile,
  } = useAppData();

  return (
    <MembersSection
      members={members}
      loading={loading.profiles ?? false}
      error={errors.profiles ?? null}
      currentProfileId={user?.id}
      onOpenMember={openMemberProfile}
    />
  );
}

export default MembersPage;