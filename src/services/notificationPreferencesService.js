import {
  supabase,
} from "../lib/supabase";

const TABLE_NAME =
  "notification_preferences";

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  chat_enabled:
    true,

  events_enabled:
    true,

  tennis_enabled:
    true,

  cycling_enabled:
    true,

  gages_enabled:
    true,

  tribunal_enabled:
    true,

  challenges_enabled:
    true,

  rewards_enabled:
    true,

  members_enabled:
    true,

  system_enabled:
    true,
};

export async function fetchNotificationPreferences(
  profileId,
) {
  if (!profileId) {
    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq(
      "profile_id",
      profileId,
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
    };
  }

  return {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...data,
  };
}

export async function saveNotificationPreferences({
  profileId,
  preferences,
}) {
  if (!profileId) {
    throw new Error(
      "Profil introuvable.",
    );
  }

  const payload = {
    profile_id:
      profileId,

    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...preferences,

    updated_at:
      new Date()
        .toISOString(),
  };

  const {
    data,
    error,
  } = await supabase
    .from(TABLE_NAME)
    .upsert(
      payload,
      {
        onConflict:
          "profile_id",
      },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...data,
  };
}
