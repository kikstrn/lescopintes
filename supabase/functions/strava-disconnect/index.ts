import {
  createClient,
} from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin":
    "*",

  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",

  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

function jsonResponse(
  payload: unknown,
  status = 200,
) {
  return new Response(
    JSON.stringify(payload),
    {
      status,

      headers: {
        ...corsHeaders,
        "Content-Type":
          "application/json",
      },
    },
  );
}

function requiredSecret(
  name: string,
) {
  const value =
    Deno.env.get(name);

  if (!value) {
    throw new Error(
      `Secret ${name} manquant.`,
    );
  }

  return value;
}

Deno.serve(
  async (request) => {
    if (
      request.method ===
      "OPTIONS"
    ) {
      return new Response(
        "ok",
        {
          headers:
            corsHeaders,
        },
      );
    }

    if (
      request.method !==
      "POST"
    ) {
      return jsonResponse(
        {
          error:
            "Méthode non autorisée.",
        },
        405,
      );
    }

    try {
      const authorization =
        request.headers.get(
          "Authorization",
        );

      if (!authorization) {
        return jsonResponse(
          {
            error:
              "Authentification requise.",
          },
          401,
        );
      }

      const supabaseUrl =
        requiredSecret(
          "SUPABASE_URL",
        );

      const anonKey =
        Deno.env.get(
          "SUPABASE_ANON_KEY",
        ) ??
        Deno.env.get(
          "SUPABASE_PUBLISHABLE_KEY",
        );

      const serviceRoleKey =
        Deno.env.get(
          "SUPABASE_SERVICE_ROLE_KEY",
        ) ??
        Deno.env.get(
          "SUPABASE_SECRET_KEY",
        );

      if (
        !anonKey ||
        !serviceRoleKey
      ) {
        throw new Error(
          "Clés Supabase serveur manquantes.",
        );
      }

      const userClient =
        createClient(
          supabaseUrl,
          anonKey,
          {
            global: {
              headers: {
                Authorization:
                  authorization,
              },
            },

            auth: {
              persistSession:
                false,

              autoRefreshToken:
                false,
            },
          },
        );

      const {
        data: {
          user,
        },
        error:
          userError,
      } = await userClient
        .auth
        .getUser();

      if (
        userError ||
        !user
      ) {
        return jsonResponse(
          {
            error:
              "Session invalide ou expirée.",
          },
          401,
        );
      }

      const adminClient =
        createClient(
          supabaseUrl,
          serviceRoleKey,
          {
            auth: {
              persistSession:
                false,

              autoRefreshToken:
                false,
            },
          },
        );

      const {
        data:
          connection,
        error:
          connectionError,
      } = await adminClient
        .from(
          "strava_connections",
        )
        .select(`
          access_token,
          refresh_token
        `)
        .eq(
          "profile_id",
          user.id,
        )
        .maybeSingle();

      if (connectionError) {
        throw connectionError;
      }

      if (!connection) {
        return jsonResponse({
          ok:
            true,

          already_disconnected:
            true,
        });
      }

      const basicCredentials =
        btoa(
          `${requiredSecret("STRAVA_CLIENT_ID")}:${requiredSecret("STRAVA_CLIENT_SECRET")}`,
        );

      const revokeBody =
        new URLSearchParams({
          token:
            connection.refresh_token,

          token_type_hint:
            "refresh_token",
        });

      const revokeResponse =
        await fetch(
          "https://www.strava.com/oauth/revoke",
          {
            method:
              "POST",

            headers: {
              Authorization:
                `Basic ${basicCredentials}`,

              "Content-Type":
                "application/x-www-form-urlencoded",
            },

            body:
              revokeBody.toString(),
          },
        );

      if (
        !revokeResponse.ok
      ) {
        const responseText =
          await revokeResponse.text();

        console.error(
          "Révocation Strava :",
          revokeResponse.status,
          responseText,
        );

        throw new Error(
          "Strava n’a pas confirmé la révocation de l’accès.",
        );
      }

      const {
        error:
          deleteError,
      } = await adminClient
        .from(
          "strava_connections",
        )
        .delete()
        .eq(
          "profile_id",
          user.id,
        );

      if (deleteError) {
        throw deleteError;
      }

      return jsonResponse({
        ok:
          true,
      });
    } catch (error) {
      console.error(
        "strava-disconnect:",
        error,
      );

      return jsonResponse(
        {
          error:
            error instanceof
            Error
              ? error.message
              : "Impossible de déconnecter Strava.",
        },
        500,
      );
    }
  },
);
