import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-release-secret",
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

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "string",
    )
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(
      "ok",
      { headers: corsHeaders },
    );
  }

  if (req.method !== "POST") {
    return jsonResponse(
      { error: "Method not allowed" },
      405,
    );
  }

  const expectedSecret =
    Deno.env.get(
      "RELEASE_WEBHOOK_SECRET",
    );

  const receivedSecret =
    req.headers.get(
      "x-release-secret",
    );

  if (
    !expectedSecret ||
    receivedSecret !== expectedSecret
  ) {
    return jsonResponse(
      { error: "Unauthorized" },
      401,
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
    );

  if (
    !supabaseUrl ||
    !serviceRoleKey
  ) {
    return jsonResponse(
      {
        error:
          "Configuration Supabase serveur manquante.",
      },
      500,
    );
  }

  const pushConfigured =
    Boolean(
      vapidPublicKey &&
      vapidPrivateKey &&
      vapidSubject,
    );

  if (pushConfigured) {
    webpush.setVapidDetails(
      vapidSubject!,
      vapidPublicKey!,
      vapidPrivateKey!,
    );
  }

  let payload: {
    version?: string;
    title?: string;
    message?: string;
    changes?: string[];
  };

  try {
    payload =
      await req.json();
  } catch {
    return jsonResponse(
      {
        error:
          "Le corps JSON est invalide.",
      },
      400,
    );
  }

  const version =
    String(
      payload.version ?? "",
    ).trim();

  const title =
    String(
      payload.title ??
      "✨ Nouvelle mise à jour disponible",
    ).trim();

  const message =
    String(
      payload.message ??
      "Une nouvelle version des Co'Pintes est disponible.",
    ).trim();

  const changes =
    isStringArray(payload.changes)
      ? payload.changes
          .map((change) =>
            change.trim(),
          )
          .filter(Boolean)
      : [];

  if (!version) {
    return jsonResponse(
      {
        error:
          "Le numéro de version est obligatoire.",
      },
      400,
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

  /*
   * L'INSERT déclenche le trigger déjà installé sur app_releases.
   * Ce trigger crée les notifications internes app_update.
   */
  const {
    data: release,
    error: releaseError,
  } = await supabase
    .from("app_releases")
    .insert({
      version,
      title,
      message,
      changes,
      is_active: true,
      released_at:
        new Date().toISOString(),
    })
    .select(
      "id, version, title, message, changes, released_at",
    )
    .single();

  if (releaseError) {
    /*
     * Un même commit GitHub peut être rejoué.
     * Si la version existe déjà, on répond proprement
     * sans envoyer de Push en double.
     */
    if (
      releaseError.code ===
      "23505"
    ) {
      return jsonResponse({
        ok: true,
        duplicate: true,
        version,
        message:
          "Cette release a déjà été publiée.",
      });
    }

    return jsonResponse(
      {
        error:
          releaseError.message,
        code:
          releaseError.code,
      },
      500,
    );
  }

  /*
   * Le trigger SQL est synchrone : les notifications internes
   * sont présentes dès que l'INSERT ci-dessus se termine.
   */
  const {
    data: notifications,
    error: notificationError,
  } = await supabase
    .from("notifications")
    .select(
      "id, recipient_id, push_sent_at",
    )
    .eq(
      "notification_type",
      "app_update",
    )
    .eq(
      "entity_type",
      "app_release",
    )
    .eq(
      "entity_id",
      String(release.id),
    );

  if (notificationError) {
    return jsonResponse(
      {
        error:
          notificationError.message,
        release,
      },
      500,
    );
  }

  let pushSent = 0;
  let pushFailed = 0;
  let pushSkipped = 0;
  const pushErrors: unknown[] = [];

  if (pushConfigured) {
    for (
      const notification
      of notifications ?? []
    ) {
      if (
        notification.push_sent_at
      ) {
        pushSkipped += 1;
        continue;
      }

      const {
        data: subscriptions,
        error: subscriptionError,
      } = await supabase
        .from(
          "push_subscriptions",
        )
        .select(
          "id, endpoint, p256dh, auth",
        )
        .eq(
          "profile_id",
          notification.recipient_id,
        )
        .eq(
          "is_active",
          true,
        );

      if (subscriptionError) {
        pushFailed += 1;
        pushErrors.push({
          recipientId:
            notification.recipient_id,
          error:
            subscriptionError.message,
        });
        continue;
      }

      let recipientSent = false;
      const recipientErrors: string[] = [];

      const pushPayload =
        JSON.stringify({
          title,
          body:
            message ||
            "Une nouvelle version des Co'Pintes est disponible.",

          icon:
            "/android-chrome-192x192.png",

          badge:
            "/notification-badge-96x96.png",

          tag:
            `app-release:${release.id}`,

          url:
            "/",

          data: {
            notificationId:
              notification.id,
            releaseId:
              release.id,
            version:
              release.version,
            pageId:
              "updates",
          },
        });

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
            pushPayload,
          );

          recipientSent = true;
          pushSent += 1;
        } catch (error) {
          pushFailed += 1;

          const pushError =
            error as {
              statusCode?: number;
              message?: string;
            };

          recipientErrors.push(
            pushError.message ??
            "Erreur Push inconnue.",
          );

          if (
            pushError.statusCode === 404 ||
            pushError.statusCode === 410
          ) {
            await supabase
              .from(
                "push_subscriptions",
              )
              .update({
                is_active: false,
              })
              .eq(
                "id",
                subscription.id,
              );
          }
        }
      }

      if (
        !subscriptions?.length
      ) {
        pushSkipped += 1;
      }

      await supabase
        .from("notifications")
        .update({
          push_sent_at:
            recipientSent
              ? new Date()
                  .toISOString()
              : null,

          push_error:
            recipientErrors.length
              ? recipientErrors
                  .slice(0, 3)
                  .join(" | ")
              : null,
        })
        .eq(
          "id",
          notification.id,
        );
    }
  }

  return jsonResponse({
    ok: true,
    release,
    internalNotifications:
      notifications?.length ?? 0,
    pushConfigured,
    pushSent,
    pushFailed,
    pushSkipped,
    pushErrors,
  });
});
