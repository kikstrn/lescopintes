import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

function jsonResponse(
  body: unknown,
  status = 200,
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type":
          "application/json; charset=utf-8",
      },
    },
  );
}

function getParisDateParts(
  date = new Date(),
) {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Europe/Paris",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    ).formatToParts(date);

  const values =
    Object.fromEntries(
      parts.map((part) => [
        part.type,
        part.value,
      ]),
    );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

function memberName(
  profile: Record<string, unknown>,
) {
  return (
    profile.nickname ||
    profile.first_name ||
    "un membre"
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(
      "ok",
      { headers: corsHeaders },
    );
  }

  if (
    req.method !== "POST" &&
    req.method !== "GET"
  ) {
    return jsonResponse(
      { error: "Method not allowed" },
      405,
    );
  }

  const supabaseUrl =
    Deno.env.get("SUPABASE_URL");

  const serviceRoleKey =
    Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY",
    );

  if (
    !supabaseUrl ||
    !serviceRoleKey
  ) {
    return jsonResponse(
      {
        error:
          "Supabase server secrets are missing.",
      },
      500,
    );
  }

  /*
   * Facultatif mais recommandé pour les appels Cron externes.
   * Si BIRTHDAY_CRON_SECRET existe, l'appel doit fournir :
   * x-cron-secret: <secret>
   */
  const cronSecret =
    Deno.env.get(
      "BIRTHDAY_CRON_SECRET",
    );

  if (cronSecret) {
    const receivedSecret =
      req.headers.get(
        "x-cron-secret",
      );

    if (
      receivedSecret !== cronSecret
    ) {
      return jsonResponse(
        { error: "Unauthorized" },
        401,
      );
    }
  }

  const supabase =
    createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

  const today =
    getParisDateParts();

  const {
    data: profiles,
    error: profilesError,
  } = await supabase
    .from("profiles")
    .select(
      "id, first_name, nickname, initials, avatar_path, birth_date",
    );

  if (profilesError) {
    return jsonResponse(
      {
        error:
          profilesError.message,
      },
      500,
    );
  }

  const allProfiles =
    profiles ?? [];

  const birthdays =
    allProfiles.filter(
      (profile) => {
        if (!profile.birth_date) {
          return false;
        }

        const parts =
          String(
            profile.birth_date,
          )
            .split("-")
            .map(Number);

        return (
          parts.length === 3 &&
          parts[1] === today.month &&
          parts[2] === today.day
        );
      },
    );

  if (!birthdays.length) {
    return jsonResponse({
      ok: true,
      date:
        `${today.year}-${String(
          today.month,
        ).padStart(2, "0")}-${String(
          today.day,
        ).padStart(2, "0")}`,
      birthdays: 0,
      created: 0,
      skipped: 0,
    });
  }

  let created = 0;
  let skipped = 0;
  const errors: Array<{
    recipientId: string;
    birthdayProfileId: string;
    message: string;
  }> = [];

  for (
    const birthdayProfile
    of birthdays
  ) {
    const recipients =
      allProfiles.filter(
        (profile) =>
          String(profile.id) !==
          String(
            birthdayProfile.id,
          ),
      );

    for (
      const recipient
      of recipients
    ) {
      const dedupeKey = [
        "birthday",
        today.year,
        birthdayProfile.id,
        recipient.id,
      ].join(":");

      const {
        data: existing,
        error: existingError,
      } = await supabase
        .from("notifications")
        .select("id")
        .eq(
          "recipient_id",
          recipient.id,
        )
        .eq(
          "notification_type",
          "birthday",
        )
        .contains(
          "metadata",
          {
            dedupe_key:
              dedupeKey,
          },
        )
        .limit(1)
        .maybeSingle();

      if (existingError) {
        errors.push({
          recipientId:
            String(
              recipient.id,
            ),
          birthdayProfileId:
            String(
              birthdayProfile.id,
            ),
          message:
            existingError.message,
        });

        continue;
      }

      if (existing) {
        skipped += 1;
        continue;
      }

      const name =
        String(
          memberName(
            birthdayProfile,
          ),
        );

      const {
        error: insertError,
      } = await supabase
        .from("notifications")
        .insert({
          recipient_id:
            recipient.id,

          actor_id:
            birthdayProfile.id,

          notification_type:
            "birthday",

          title:
            `🎉 Anniversaire de ${name}`,

          message:
            `Aujourd’hui, c’est l’anniversaire de ${name} ! Souhaitez-lui un joyeux anniversaire 🎂`,

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
              today.year,

            birth_date:
              birthdayProfile.birth_date,

            timezone:
              "Europe/Paris",
          },
        });

      if (insertError) {
        errors.push({
          recipientId:
            String(
              recipient.id,
            ),
          birthdayProfileId:
            String(
              birthdayProfile.id,
            ),
          message:
            insertError.message,
        });

        continue;
      }

      created += 1;
    }
  }

  return jsonResponse(
    {
      ok:
        errors.length === 0,
      date:
        `${today.year}-${String(
          today.month,
        ).padStart(2, "0")}-${String(
          today.day,
        ).padStart(2, "0")}`,
      birthdays:
        birthdays.length,
      created,
      skipped,
      errors,
    },
    errors.length
      ? 207
      : 200,
  );
});
