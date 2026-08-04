import {
  supabase,
} from "../lib/supabase";

async function getFunctionErrorMessage(
  error,
  fallback,
) {
  let message =
    error?.message ??
    fallback;

  try {
    const response =
      error?.context;

    if (
      response &&
      typeof response.json ===
        "function"
    ) {
      const payload =
        await response.json();

      message =
        payload?.error ??
        payload?.message ??
        message;
    }
  } catch {
    // Le message initial reste utilisé.
  }

  return message;
}

export async function getStravaConnectionStatus() {
  const {
    data,
    error,
  } = await supabase.rpc(
    "get_my_strava_connection_status",
  );

  if (error) {
    throw error;
  }

  return Array.isArray(data)
    ? data[0] ?? null
    : data ?? null;
}

export async function beginStravaAuthorization() {
  const {
    data,
    error,
  } = await supabase.functions.invoke(
    "strava-authorize",
    {
      body: {},
    },
  );

  if (error) {
    throw new Error(
      await getFunctionErrorMessage(
        error,
        "Impossible de démarrer la connexion Strava.",
      ),
    );
  }

  if (!data?.authorization_url) {
    throw new Error(
      "L’adresse d’autorisation Strava est absente.",
    );
  }

  return data.authorization_url;
}

export async function disconnectStrava() {
  const {
    data,
    error,
  } = await supabase.functions.invoke(
    "strava-disconnect",
    {
      body: {},
    },
  );

  if (error) {
    throw new Error(
      await getFunctionErrorMessage(
        error,
        "Impossible de déconnecter Strava.",
      ),
    );
  }

  return data ?? null;
}
