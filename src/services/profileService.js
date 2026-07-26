import { supabase } from "../lib/supabase";

const PROFILE_COLUMNS = `
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
  general_points,
  created_at,
  updated_at
`;

function mapProfile(profile) {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    firstName: profile.first_name,
    nickname: profile.nickname,
    initials:
      profile.initials ??
      profile.nickname?.slice(0, 2).toUpperCase() ??
      "CP",
    role: profile.role,
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    elo: profile.tennis_elo ?? 1500,
    wins: profile.tennis_wins ?? 0,
    losses: profile.tennis_losses ?? 0,
    bikeKm: Number(profile.bike_km ?? 0),
    events: profile.event_count ?? 0,
    points: profile.general_points ?? 0,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

export async function getProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .order("general_points", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapProfile);
}

export async function getProfileById(profileId) {
  if (!profileId) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", profileId)
    .single();

  if (error) {
    throw error;
  }

  return mapProfile(data);
}

export async function updateOwnProfile(profileId, updates) {
  if (!profileId) {
    throw new Error("Identifiant du profil manquant.");
  }

  const databaseUpdates = {};

  if (updates.firstName !== undefined) {
    databaseUpdates.first_name = updates.firstName.trim();
  }

  if (updates.nickname !== undefined) {
    databaseUpdates.nickname = updates.nickname.trim();
  }

  if (updates.initials !== undefined) {
    databaseUpdates.initials = updates.initials
      .trim()
      .toUpperCase()
      .slice(0, 3);
  }

  if (updates.bio !== undefined) {
    databaseUpdates.bio = updates.bio?.trim() || null;
  }

  if (updates.avatarUrl !== undefined) {
    databaseUpdates.avatar_url = updates.avatarUrl || null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(databaseUpdates)
    .eq("id", profileId)
    .select(PROFILE_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return mapProfile(data);
}