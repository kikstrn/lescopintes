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
    .order("released_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export async function hasViewedRelease(
  releaseId,
  profileId,
) {
  if (!releaseId || !profileId) return true;

  const { data, error } = await supabase
    .from("app_release_views")
    .select("release_id")
    .eq("release_id", releaseId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function markReleaseAsViewed(
  releaseId,
  profileId,
) {
  if (!releaseId || !profileId) return;

  const { error } = await supabase
    .from("app_release_views")
    .upsert(
      {
        release_id: releaseId,
        profile_id: profileId,
        viewed_at: new Date().toISOString(),
      },
      {
        onConflict: "release_id,profile_id",
      },
    );

  if (error) throw error;
}

export async function createReleaseNotification(
  release,
  profileId,
) {
  if (!release?.id || !profileId) return null;

  const dedupeKey =
    `app-release:${release.id}:${profileId}`;

  const { data: existing, error: lookupError } =
    await supabase
      .from("notifications")
      .select("id")
      .eq("recipient_id", profileId)
      .eq("notification_type", "app_update")
      .contains("metadata", {
        dedupe_key: dedupeKey,
      })
      .limit(1)
      .maybeSingle();

  if (lookupError) throw lookupError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      recipient_id: profileId,
      actor_id: null,
      notification_type: "app_update",
      title:
        release.title ||
        `✨ Nouvelle version ${release.version}`,
      message:
        release.message ||
        "Une nouvelle mise à jour des Co'Pintes est disponible.",
      entity_type: "app_release",
      entity_id: String(release.id),
      page_id: "updates",
      metadata: {
        dedupe_key: dedupeKey,
        release_id: release.id,
        version: release.version,
        changes: release.changes ?? [],
      },
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function checkForAppUpdate(
  profileId,
) {
  if (!profileId) return null;

  const release =
    await getLatestActiveRelease();

  if (!release) return null;

  const viewed =
    await hasViewedRelease(
      release.id,
      profileId,
    );

  if (!viewed) {
    await createReleaseNotification(
      release,
      profileId,
    );
  }

  return {
    release,
    viewed,
  };
}
