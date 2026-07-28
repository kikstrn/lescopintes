import { supabase } from "../lib/supabase";

export async function getTribunalCases() {
  const { data, error } = await supabase
    .from("tribunal_cases")
    .select(`
      *,
      accusedProfile:profiles!tribunal_cases_accused_profile_id_fkey(*),
      createdByProfile:profiles!tribunal_cases_created_by_fkey(*),
      votes:tribunal_votes(*)
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createTribunalCase(payload) {
  const { data, error } = await supabase
    .from("tribunal_cases")
    .insert({
      accused_profile_id:
        payload.accusedProfileId,

      created_by:
        payload.createdBy,

      title: payload.title,

      description:
        payload.description,

      evidence:
        payload.evidence,

      status:
        payload.status ?? "pending",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateTribunalStatus(
  caseId,
  status,
) {
  const { error } = await supabase
    .from("tribunal_cases")
    .update({
      status,
    })
    .eq("id", caseId);

  if (error) {
    throw error;
  }
}

export async function judgeTribunalCase(
  caseId,
  verdict,
  sanction,
) {
  const { error } = await supabase
    .from("tribunal_cases")
    .update({
      status: "judged",
      verdict,
      sanction,
      judged_at: new Date(),
    })
    .eq("id", caseId);

  if (error) {
    throw error;
  }
}

export async function voteTribunalCase(
  caseId,
  profileId,
  vote,
) {
  const { error } = await supabase
    .from("tribunal_votes")
    .upsert(
      {
        tribunal_case_id: caseId,
        profile_id: profileId,
        vote,
      },
      {
        onConflict:
          "tribunal_case_id,profile_id",
      },
    );

  if (error) {
    throw error;
  }
}

export async function dismissTribunalCase(
  caseId,
) {
  const { error } = await supabase
    .from("tribunal_cases")
    .update({
      status: "dismissed",
    })
    .eq("id", caseId);

  if (error) {
    throw error;
  }
}