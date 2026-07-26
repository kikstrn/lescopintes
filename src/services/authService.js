import { supabase } from "../lib/supabase";

export async function signIn(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}

export async function getProfile(userId) {
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
        id,
        first_name,
        nickname,
        initials,
        role,
        avatar_url,
        bio,
        tennis_elo,
        tennis_wins,
        tennis_losses,
        bike_km,
        event_count,
        general_points
      `,
    )
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}