import {
  supabase,
} from "../lib/supabase";

const TABLE_NAME =
  "push_subscriptions";

function getSubscriptionKeys(
  subscription,
) {
  const json =
    subscription.toJSON();

  return {
    endpoint:
      json.endpoint,

    p256dh:
      json.keys?.p256dh ??
      null,

    auth:
      json.keys?.auth ??
      null,
  };
}

export async function savePushSubscription({
  profileId,
  subscription,
}) {
  if (!profileId) {
    throw new Error(
      "Profil introuvable.",
    );
  }

  if (!subscription) {
    throw new Error(
      "Abonnement push introuvable.",
    );
  }

  const {
    endpoint,
    p256dh,
    auth,
  } = getSubscriptionKeys(
    subscription,
  );

  if (
    !endpoint ||
    !p256dh ||
    !auth
  ) {
    throw new Error(
      "L’abonnement push est incomplet.",
    );
  }

  const { data, error } =
    await supabase
      .from(TABLE_NAME)
      .upsert(
        {
          profile_id:
            profileId,

          endpoint,
          p256dh,
          auth,

          user_agent:
            window.navigator
              .userAgent,

          device_label:
            getDeviceLabel(),

          is_active:
            true,

          last_seen_at:
            new Date()
              .toISOString(),
        },
        {
          onConflict:
            "endpoint",
        },
      )
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function removePushSubscription({
  profileId,
  endpoint,
}) {
  if (
    !profileId ||
    !endpoint
  ) {
    return;
  }

  const { error } =
    await supabase
      .from(TABLE_NAME)
      .delete()
      .eq(
        "profile_id",
        profileId,
      )
      .eq(
        "endpoint",
        endpoint,
      );

  if (error) {
    throw error;
  }
}

export async function touchPushSubscription({
  profileId,
  endpoint,
}) {
  if (
    !profileId ||
    !endpoint
  ) {
    return;
  }

  const { error } =
    await supabase
      .from(TABLE_NAME)
      .update({
        is_active:
          true,

        last_seen_at:
          new Date()
            .toISOString(),

        user_agent:
          window.navigator
            .userAgent,

        device_label:
          getDeviceLabel(),
      })
      .eq(
        "profile_id",
        profileId,
      )
      .eq(
        "endpoint",
        endpoint,
      );

  if (error) {
    throw error;
  }
}

export async function getPushDeviceCount(
  profileId,
) {
  if (!profileId) {
    return 0;
  }

  const {
    count,
    error,
  } = await supabase
    .from(TABLE_NAME)
    .select(
      "id",
      {
        count:
          "exact",

        head:
          true,
      },
    )
    .eq(
      "profile_id",
      profileId,
    )
    .eq(
      "is_active",
      true,
    );

  if (error) {
    throw error;
  }

  return Number(
    count ?? 0,
  );
}

function getDeviceLabel() {
  const userAgent =
    window.navigator
      .userAgent;

  if (
    /iphone|ipad|ipod/i.test(
      userAgent,
    )
  ) {
    return "iPhone / iPad";
  }

  if (
    /android/i.test(
      userAgent,
    )
  ) {
    return "Android";
  }

  if (
    /windows/i.test(
      userAgent,
    )
  ) {
    return "Windows";
  }

  if (
    /macintosh|mac os x/i.test(
      userAgent,
    )
  ) {
    return "Mac";
  }

  return "Navigateur";
}


export async function sendTestPushNotification() {
  const {
    data,
    error,
  } = await supabase
    .functions
    .invoke(
      "send-test-push",
      {
        body: {
          title:
            "Les Co’Pintes",

          body:
            "Les notifications push fonctionnent sur cet appareil 🎉",

          url:
            "/",
        },
      },
    );

  if (error) {
    let message =
      error.message ??
      "Impossible d’envoyer la notification de test.";

    /*
     * FunctionsHttpError expose parfois le corps via context.
     */
    try {
      const response =
        error.context;

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

    throw new Error(message);
  }

  return data ?? null;
}
