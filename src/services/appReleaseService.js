import { supabase } from "../lib/supabase";

export async function getLatestActiveRelease() {
  const { data, error } = await supabase
    .from("app_releases")
    .select(`
      id,
      version,
      title,
      message,
      changes,
      released_at,
      is_active
    `)
    .eq("is_active", true)
    .order("released_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export async function hasViewedRelease(
  releaseId,
  profileId,
) {
  if (!releaseId || !profileId) {
    return true;
  }

  const { data, error } = await supabase
    .from("app_release_views")
    .select("release_id")
    .eq("release_id", releaseId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function markReleaseAsViewed(
  releaseId,
  profileId,
) {
  if (!releaseId || !profileId) {
    return;
  }

  const { error } = await supabase
    .from("app_release_views")
    .upsert(
      {
        release_id: releaseId,
        profile_id: profileId,
        viewed_at:
          new Date().toISOString(),
      },
      {
        onConflict:
          "release_id,profile_id",
      },
    );

  if (error) {
    throw error;
  }
}

/*
 * IMPORTANT :
 * Les notifications app_update sont désormais créées côté Supabase
 * par un trigger sur app_releases.
 *
 * Le navigateur ne tente plus d'insérer directement dans
 * public.notifications. Cela évite les problèmes de RLS et garantit
 * que la notification existe même si l'utilisateur n'a pas l'app ouverte.
 */
export async function checkForAppUpdate(
  profileId,
) {
  if (!profileId) {
    return null;
  }

  const release =
    await getLatestActiveRelease();

  if (!release) {
    return null;
  }

  const viewed =
    await hasViewedRelease(
      release.id,
      profileId,
    );

  return {
    release,
    viewed,
  };
}
