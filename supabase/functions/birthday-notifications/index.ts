import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

function response(
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

function parisDate(
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

function displayName(
  profile: Record<string, unknown>,
) {
  return String(
    profile.nickname ||
      profile.first_name ||
      "un membre",
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
    return response(
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

  const vapidPublicKey =
    Deno.env.get(
      "VAPID_PUBLIC_KEY",
    );

  const vapidPrivateKey =
    Deno.env.get(
      "VAPID_PRIVATE_KEY",
    );

  const vapidSubject =
    Deno.env.get(
      "VAPID_SUBJECT",
    ) ??
    "mailto:lescopintes@email.com";

  if (
    !supabaseUrl ||
    !serviceRoleKey
  ) {
    return response(
      {
        error:
          "SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY absent.",
      },
      500,
    );
  }

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
      return response(
        { error: "Unauthorized" },
        401,
      );
    }
  }

  const pushConfigured =
    Boolean(
      vapidPublicKey &&
      vapidPrivateKey,
    );

  if (pushConfigured) {
    webpush.setVapidDetails(
      vapidSubject,
      vapidPublicKey!,
      vapidPrivateKey!,
    );
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
    parisDate();

  const {
    data: profiles,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      "id, first_name, nickname, initials, avatar_path, birth_date",
    );

  if (profileError) {
    return response(
      {
        error:
          profileError.message,
      },
      500,
    );
  }

  const members =
    profiles ?? [];

  const birthdays =
    members.filter(
      (profile) => {
        if (!profile.birth_date) {
          return false;
        }

        const [
          ,
          month,
          day,
        ] =
          String(
            profile.birth_date,
          )
            .split("-")
            .map(Number);

        return (
          month === today.month &&
          day === today.day
        );
      },
    );

  let notificationsCreated = 0;
  let notificationsSkipped = 0;
  let pushSent = 0;
  let pushFailed = 0;
  let preferenceSkipped = 0;

  const errors: unknown[] = [];

  for (
    const birthdayProfile
    of birthdays
  ) {
    const name =
      displayName(
        birthdayProfile,
      );

    const recipients =
      members.filter(
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
      /*
       * Absence de ligne de préférences = valeurs par défaut,
       * donc anniversaires activés.
       */
      const {
        data: preference,
        error: preferenceError,
      } = await supabase
        .from(
          "notification_preferences",
        )
        .select(
          "birthdays_enabled",
        )
        .eq(
          "profile_id",
          recipient.id,
        )
        .maybeSingle();

      if (preferenceError) {
        errors.push({
          stage:
            "preferences",
          recipientId:
            recipient.id,
          message:
            preferenceError.message,
        });
        continue;
      }

      if (
        preference &&
        preference.birthdays_enabled ===
          false
      ) {
        preferenceSkipped += 1;
        continue;
      }

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
        .select(
          "id, push_sent_at, push_error",
        )
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
          stage:
            "dedupe",
          recipientId:
            recipient.id,
          message:
            existingError.message,
        });
        continue;
      }

      let notificationId =
        existing?.id ??
        null;

      if (!notificationId) {
        const {
          data: inserted,
          error: insertError,
        } = await supabase
          .from(
            "notifications",
          )
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
            },
          })
          .select("id")
          .single();

        if (insertError) {
          errors.push({
            stage:
              "notification",
            recipientId:
              recipient.id,
            message:
              insertError.message,
          });
          continue;
        }

        notificationId =
          inserted.id;

        notificationsCreated += 1;
      } else {
        notificationsSkipped += 1;
      }

      /*
       * Si la notification existe déjà et qu'un Push a déjà été
       * marqué envoyé, on ne le renvoie pas.
       */
      if (
        existing?.push_sent_at
      ) {
        continue;
      }

      if (!pushConfigured) {
        continue;
      }

      const {
        data: subscriptions,
        error: subscriptionsError,
      } = await supabase
        .from(
          "push_subscriptions",
        )
        .select(
          "id, endpoint, p256dh, auth",
        )
        .eq(
          "profile_id",
          recipient.id,
        )
        .eq(
          "is_active",
          true,
        );

      if (subscriptionsError) {
        errors.push({
          stage:
            "subscriptions",
          recipientId:
            recipient.id,
          message:
            subscriptionsError.message,
        });
        continue;
      }

      const payload =
        JSON.stringify({
          title:
            `🎉 Anniversaire de ${name}`,

          body:
            `Aujourd’hui, c’est l’anniversaire de ${name} ! 🎂`,

          url:
            "/?page=members",

          icon:
            "/android-chrome-192x192.png",

          badge:
            "/notification-badge-96x96.png",

          tag:
            dedupeKey,

          data: {
            notificationId,
            birthdayProfileId:
              birthdayProfile.id,
          },
        });

      const pushErrors:
        string[] = [];

      let recipientPushSent =
        false;

      for (
        const subscription
        of subscriptions ?? []
      ) {
        try {
          await webpush.sendNotification(
            {
              endpoint:
                subscription.endpoint,

              keys: {
                p256dh:
                  subscription.p256dh,
                auth:
                  subscription.auth,
              },
            },
            payload,
          );

          pushSent += 1;
          recipientPushSent =
            true;
        } catch (pushError) {
          pushFailed += 1;

          const error =
            pushError as {
              statusCode?: number;
              message?: string;
            };

          pushErrors.push(
            error.message ??
              "Erreur Push inconnue.",
          );

          /*
           * 404 / 410 = abonnement navigateur expiré.
           */
          if (
            error.statusCode ===
              404 ||
            error.statusCode ===
              410
          ) {
            await supabase
              .from(
                "push_subscriptions",
              )
              .update({
                is_active:
                  false,
              })
              .eq(
                "id",
                subscription.id,
              );
          }
        }
      }

      if (notificationId) {
        await supabase
          .from("notifications")
          .update({
            push_sent_at:
              recipientPushSent
                ? new Date()
                    .toISOString()
                : null,

            push_error:
              pushErrors.length
                ? pushErrors
                    .slice(0, 3)
                    .join(" | ")
                : null,
          })
          .eq(
            "id",
            notificationId,
          );
      }
    }
  }

  return response({
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

    notificationsCreated,
    notificationsSkipped,
    preferenceSkipped,

    pushConfigured,
    pushSent,
    pushFailed,

    errors,
  });
});
