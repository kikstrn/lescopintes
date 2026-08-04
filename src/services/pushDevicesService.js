import {
  supabase,
} from "../lib/supabase";

const TABLE_NAME =
  "push_subscriptions";

export async function fetchPushDevices(
  profileId,
) {
  if (!profileId) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from(TABLE_NAME)
    .select(`
      id,
      endpoint,
      device_label,
      user_agent,
      is_active,
      last_seen_at,
      created_at,
      updated_at
    `)
    .eq(
      "profile_id",
      profileId,
    )
    .order(
      "last_seen_at",
      {
        ascending:
          false,
      },
    );

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function deletePushDevice({
  profileId,
  deviceId,
}) {
  if (
    !profileId ||
    !deviceId
  ) {
    throw new Error(
      "Appareil introuvable.",
    );
  }

  const {
    error,
  } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq(
      "profile_id",
      profileId,
    )
    .eq(
      "id",
      deviceId,
    );

  if (error) {
    throw error;
  }
}

export async function disablePushDevice({
  profileId,
  deviceId,
}) {
  if (
    !profileId ||
    !deviceId
  ) {
    throw new Error(
      "Appareil introuvable.",
    );
  }

  const {
    error,
  } = await supabase
    .from(TABLE_NAME)
    .update({
      is_active:
        false,

      updated_at:
        new Date()
          .toISOString(),
    })
    .eq(
      "profile_id",
      profileId,
    )
    .eq(
      "id",
      deviceId,
    );

  if (error) {
    throw error;
  }
}
