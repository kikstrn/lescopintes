import { supabase } from "../lib/supabase";

export async function getChallenges() {
  const { data, error } = await supabase
    .from("weekly_challenges")
    .select("*")
    .order("start_date", {
      ascending: false,
    });

  if (error) throw error;

  return data ?? [];
}

export async function createChallenge(challenge) {
  const { data, error } = await supabase
    .from("weekly_challenges")
    .insert(challenge)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateChallenge(id, values) {
  const { data, error } = await supabase
    .from("weekly_challenges")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function archiveChallenge(id) {
  const { error } = await supabase
    .from("weekly_challenges")
    .update({
      status: "archived",
    })
    .eq("id", id);

  if (error) throw error;
}