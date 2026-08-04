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

function createStateToken() {
  const bytes =
    crypto.getRandomValues(
      new Uint8Array(32),
    );

  return Array.from(
    bytes,
    (byte) =>
      byte
        .toString(16)
        .padStart(2, "0"),
  ).join("");
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

      await adminClient.rpc(
        "cleanup_expired_strava_oauth_states",
      );

      const stateToken =
        createStateToken();

      const expiresAt =
        new Date(
          Date.now() +
            10 * 60 * 1000,
        ).toISOString();

      const {
        error:
          stateError,
      } = await adminClient
        .from(
          "strava_oauth_states",
        )
        .insert({
          state_token:
            stateToken,

          profile_id:
            user.id,

          expires_at:
            expiresAt,
        });

      if (stateError) {
        throw stateError;
      }

      const clientId =
        requiredSecret(
          "STRAVA_CLIENT_ID",
        );

      const redirectUri =
        requiredSecret(
          "STRAVA_REDIRECT_URI",
        );

      const authorizationUrl =
        new URL(
          "https://www.strava.com/oauth/authorize",
        );

      authorizationUrl.searchParams.set(
        "client_id",
        clientId,
      );

      authorizationUrl.searchParams.set(
        "redirect_uri",
        redirectUri,
      );

      authorizationUrl.searchParams.set(
        "response_type",
        "code",
      );

      authorizationUrl.searchParams.set(
        "approval_prompt",
        "auto",
      );

      authorizationUrl.searchParams.set(
        "scope",
        "read,activity:read_all",
      );

      authorizationUrl.searchParams.set(
        "state",
        stateToken,
      );

      return jsonResponse({
        authorization_url:
          authorizationUrl.toString(),
      });
    } catch (error) {
      console.error(
        "strava-authorize:",
        error,
      );

      return jsonResponse(
        {
          error:
            error instanceof
            Error
              ? error.message
              : "Impossible de démarrer l’autorisation Strava.",
        },
        500,
      );
    }
  },
);
