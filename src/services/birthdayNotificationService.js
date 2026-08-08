import { supabase } from "../lib/supabase";

const BIRTHDAY_NOTIFICATION_TYPE =
  "birthday";

function getMemberName(profile) {
  return (
    profile?.nickname ||
    profile?.first_name ||
    profile?.firstName ||
    "un membre"
  );
}

export async function getBirthdaysForDate(
  referenceDate = new Date(),
) {
  const month =
    referenceDate.getMonth() + 1;
  const day =
    referenceDate.getDate();

  const { data, error } =
    await supabase
      .from("profiles")
      .select(`
        id,
        first_name,
        nickname,
        initials,
        avatar_path,
        birth_date
      `)
      .not("birth_date", "is", null);

  if (error) {
    throw error;
  }

  return (data ?? []).filter(
    (profile) => {
      const parts =
        String(profile.birth_date)
          .split("-")
          .map(Number);

      if (parts.length !== 3) {
        return false;
      }

      const birthMonth = parts[1];
      const birthDay = parts[2];

      return (
        birthMonth === month &&
        birthDay === day
      );
    },
  );
}

export async function getBirthdayRecipients(
  birthdayProfileId,
) {
  const { data, error } =
    await supabase
      .from("profiles")
      .select("id")
      .neq("id", birthdayProfileId);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export function buildBirthdayDedupeKey({
  recipientId,
  birthdayProfileId,
  year = new Date().getFullYear(),
}) {
  return [
    "birthday",
    year,
    birthdayProfileId,
    recipientId,
  ].join(":");
}

export async function birthdayNotificationExists({
  recipientId,
  birthdayProfileId,
  year = new Date().getFullYear(),
}) {
  const dedupeKey =
    buildBirthdayDedupeKey({
      recipientId,
      birthdayProfileId,
      year,
    });

  const { data, error } =
    await supabase
      .from("notifications")
      .select("id")
      .eq(
        "recipient_id",
        recipientId,
      )
      .eq(
        "notification_type",
        BIRTHDAY_NOTIFICATION_TYPE,
      )
      .contains("metadata", {
        dedupe_key: dedupeKey,
      })
      .limit(1)
      .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function createBirthdayNotification({
  recipientId,
  birthdayProfile,
  year = new Date().getFullYear(),
}) {
  if (
    !recipientId ||
    !birthdayProfile?.id
  ) {
    return null;
  }

  if (
    String(recipientId) ===
    String(birthdayProfile.id)
  ) {
    return null;
  }

  const dedupeKey =
    buildBirthdayDedupeKey({
      recipientId,
      birthdayProfileId:
        birthdayProfile.id,
      year,
    });

  const alreadyExists =
    await birthdayNotificationExists({
      recipientId,
      birthdayProfileId:
        birthdayProfile.id,
      year,
    });

  if (alreadyExists) {
    return null;
  }

  const memberName =
    getMemberName(
      birthdayProfile,
    );

  const { data, error } =
    await supabase
      .from("notifications")
      .insert({
        recipient_id:
          recipientId,

        actor_id:
          birthdayProfile.id,

        notification_type:
          BIRTHDAY_NOTIFICATION_TYPE,

        title:
          `🎉 Anniversaire de ${memberName}`,

        message:
          `Aujourd’hui, c’est l’anniversaire de ${memberName} ! Souhaitez-lui un joyeux anniversaire 🎂`,

        entity_type:
          "profile",

        entity_id:
          String(
            birthdayProfile.id,
          ),

        page_id:
          "members",

        metadata: {
          dedupe_key:
            dedupeKey,

          birthday_profile_id:
            birthdayProfile.id,

          birthday_year:
            year,

          birth_date:
            birthdayProfile.birth_date,
        },
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}
