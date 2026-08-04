import {
  createClient,
} from "npm:@supabase/supabase-js@2";

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

function appRedirect(
  status: string,
  message?: string,
) {
  const appUrl =
    new URL(
      requiredSecret(
        "STRAVA_APP_URL",
      ),
    );

  appUrl.searchParams.set(
    "page",
    "bike",
  );

  appUrl.searchParams.set(
    "strava",
    status,
  );

  if (message) {
    appUrl.searchParams.set(
      "strava_message",
      message.slice(
        0,
        180,
      ),
    );
  }

  return Response.redirect(
    appUrl.toString(),
    302,
  );
}

Deno.serve(
  async (request) => {
    try {
      const requestUrl =
        new URL(
          request.url,
        );

      const errorCode =
        requestUrl.searchParams.get(
          "error",
        );

      if (errorCode) {
        return appRedirect(
          "denied",
        );
      }

      const code =
        requestUrl.searchParams.get(
          "code",
        );

      const stateToken =
        requestUrl.searchParams.get(
          "state",
        );

      if (
        !code ||
        !stateToken
      ) {
        return appRedirect(
          "error",
          "Code ou état OAuth manquant.",
        );
      }

      const supabaseUrl =
        requiredSecret(
          "SUPABASE_URL",
        );

      const serviceRoleKey =
        Deno.env.get(
          "SUPABASE_SERVICE_ROLE_KEY",
        ) ??
        Deno.env.get(
          "SUPABASE_SECRET_KEY",
        );

      if (!serviceRoleKey) {
        throw new Error(
          "Clé serveur Supabase manquante.",
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
          oauthState,
        error:
          stateError,
      } = await adminClient
        .from(
          "strava_oauth_states",
        )
        .select(`
          state_token,
          profile_id,
          expires_at,
          used_at
        `)
        .eq(
          "state_token",
          stateToken,
        )
        .single();

      if (
        stateError ||
        !oauthState
      ) {
        return appRedirect(
          "error",
          "État OAuth Strava invalide.",
        );
      }

      if (
        oauthState.used_at ||
        new Date(
          oauthState.expires_at,
        ).getTime() <
          Date.now()
      ) {
        return appRedirect(
          "error",
          "La demande de connexion Strava a expiré.",
        );
      }

      const tokenBody =
        new URLSearchParams({
          client_id:
            requiredSecret(
              "STRAVA_CLIENT_ID",
            ),

          client_secret:
            requiredSecret(
              "STRAVA_CLIENT_SECRET",
            ),

          code,

          grant_type:
            "authorization_code",
        });

      const tokenResponse =
        await fetch(
          "https://www.strava.com/api/v3/oauth/token",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded",
            },

            body:
              tokenBody.toString(),
          },
        );

      const tokenPayload =
        await tokenResponse.json();

      if (
        !tokenResponse.ok
      ) {
        console.error(
          "Réponse Strava OAuth :",
          tokenPayload,
        );

        return appRedirect(
          "error",
          "Strava a refusé l’échange du code.",
        );
      }

      const athlete =
        tokenPayload.athlete ??
        {};

      const acceptedScope =
        String(
          tokenPayload.scope ??
          requestUrl.searchParams.get(
            "scope",
          ) ??
          "",
        );

      const {
        error:
          connectionError,
      } = await adminClient
        .from(
          "strava_connections",
        )
        .upsert(
          {
            profile_id:
              oauthState.profile_id,

            strava_athlete_id:
              athlete.id,

            athlete_firstname:
              athlete.firstname ??
              null,

            athlete_lastname:
              athlete.lastname ??
              null,

            athlete_username:
              athlete.username ??
              null,

            athlete_city:
              athlete.city ??
              null,

            athlete_state:
              athlete.state ??
              null,

            athlete_country:
              athlete.country ??
              null,

            athlete_profile:
              athlete.profile ??
              null,

            athlete_profile_medium:
              athlete.profile_medium ??
              null,

            accepted_scope:
              acceptedScope,

            access_token:
              tokenPayload.access_token,

            refresh_token:
              tokenPayload.refresh_token,

            token_expires_at:
              tokenPayload.expires_at,

            connected_at:
              new Date()
                .toISOString(),
          },
          {
            onConflict:
              "profile_id",
          },
        );

      if (connectionError) {
        console.error(
          "Enregistrement Strava :",
          connectionError,
        );

        return appRedirect(
          "error",
          connectionError.code ===
            "23505"
            ? "Ce compte Strava est déjà lié à un autre membre."
            : "Impossible d’enregistrer la connexion Strava.",
        );
      }

      await adminClient
        .from(
          "strava_oauth_states",
        )
        .update({
          used_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "state_token",
          stateToken,
        );

      return appRedirect(
        "connected",
      );
    } catch (error) {
      console.error(
        "strava-callback:",
        error,
      );

      return appRedirect(
        "error",
        error instanceof
          Error
          ? error.message
          : "Erreur interne pendant la connexion Strava.",
      );
    }
  },
);
