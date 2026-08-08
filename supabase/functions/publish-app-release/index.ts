import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

function isStringArray(
  value: unknown,
): value is string[] {
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
   * IMPORTANT :
   * Cette fonction ne pousse PLUS elle-même de Web Push.
   *
   * Elle crée uniquement la release.
   * Le trigger app_releases_notify_members crée ensuite les lignes
   * `app_update` dans public.notifications.
   *
   * Ton système Push existant prend déjà en charge les nouvelles
   * notifications de cette table. Envoyer ici un second Web Push
   * créait donc les doublons sur téléphone.
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
   * Le trigger SQL est synchrone.
   * On vérifie simplement combien de notifications internes
   * ont été créées pour cette release.
   */
  const {
    data: notifications,
    error: notificationError,
  } = await supabase
    .from("notifications")
    .select(
      "id, recipient_id, push_sent_at, push_error",
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

  return jsonResponse({
    ok: true,
    release,
    internalNotifications:
      notifications?.length ?? 0,
    pushDelivery:
      "handled-by-existing-notification-system",
  });
});
