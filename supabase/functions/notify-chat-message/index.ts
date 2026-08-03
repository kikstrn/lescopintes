import {
  createClient,
} from "npm:@supabase/supabase-js@2";

import webpush from "npm:web-push@3.6.7";

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

function getRequiredSecret(
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

function getMessagePreview(
  content: string,
) {
  const normalized =
    content
      .replace(
        /\s+/g,
        " ",
      )
      .trim();

  if (
    normalized.length <=
    110
  ) {
    return normalized;
  }

  return `${normalized.slice(
    0,
    107,
  )}…`;
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
        getRequiredSecret(
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

      const requestBody =
        await request.json();

      const messageId =
        typeof requestBody
          ?.messageId ===
          "string"
          ? requestBody.messageId
          : null;

      if (!messageId) {
        return jsonResponse(
          {
            error:
              "Identifiant du message manquant.",
          },
          400,
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
          message,
        error:
          messageError,
      } = await adminClient
        .from(
          "chat_messages",
        )
        .select(`
          id,
          profile_id,
          content,
          created_at,

          author:profiles!chat_messages_profile_id_fkey (
            id,
            nickname,
            first_name
          )
        `)
        .eq(
          "id",
          messageId,
        )
        .single();

      if (
        messageError ||
        !message
      ) {
        return jsonResponse(
          {
            error:
              "Message du chat introuvable.",
          },
          404,
        );
      }

      if (
        message.profile_id !==
        user.id
      ) {
        return jsonResponse(
          {
            error:
              "Tu ne peux notifier que les messages que tu viens d’envoyer.",
          },
          403,
        );
      }

      const {
        data:
          subscriptions,
        error:
          subscriptionsError,
      } = await adminClient
        .from(
          "push_subscriptions",
        )
        .select(`
          id,
          profile_id,
          endpoint,
          p256dh,
          auth
        `)
        .eq(
          "is_active",
          true,
        )
        .neq(
          "profile_id",
          user.id,
        );

      if (
        subscriptionsError
      ) {
        throw subscriptionsError;
      }

      if (
        !subscriptions ||
        subscriptions.length ===
          0
      ) {
        return jsonResponse({
          ok:
            true,

          delivered:
            0,

          failed:
            0,

          devices:
            0,
        });
      }

      const vapidPublicKey =
        getRequiredSecret(
          "VAPID_PUBLIC_KEY",
        );

      const vapidPrivateKey =
        getRequiredSecret(
          "VAPID_PRIVATE_KEY",
        );

      const vapidSubject =
        getRequiredSecret(
          "VAPID_SUBJECT",
        );

      webpush.setVapidDetails(
        vapidSubject,
        vapidPublicKey,
        vapidPrivateKey,
      );

      const authorRelation =
        Array.isArray(
          message.author,
        )
          ? message.author[0]
          : message.author;

      const authorName =
        authorRelation
          ?.nickname ??
        authorRelation
          ?.first_name ??
        "Un membre";

      const payload =
        JSON.stringify({
          title:
            `💬 ${authorName}`,

          body:
            getMessagePreview(
              message.content ??
              "",
            ),

          url:
            "/?page=chat",

          pageId:
            "chat",

          icon:
            "/android-chrome-192x192.png",

          badge:
            "/notification-badge-96x96.png",

          tag:
            `chat-message-${message.id}`,

          renotify:
            true,

          data: {
            kind:
              "chat_message",

            messageId:
              message.id,

            senderProfileId:
              message.profile_id,
          },
        });

      let delivered = 0;
      let failed = 0;

      await Promise.allSettled(
        subscriptions.map(
          async (
            subscription,
          ) => {
            try {
              await webpush
                .sendNotification(
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
                  {
                    TTL:
                      5 * 60,

                    urgency:
                      "high",
                  },
                );

              delivered += 1;

              await adminClient
                .from(
                  "push_subscriptions",
                )
                .update({
                  is_active:
                    true,

                  last_seen_at:
                    new Date()
                      .toISOString(),
                })
                .eq(
                  "id",
                  subscription.id,
                );
            } catch (
              pushError
            ) {
              failed += 1;

              const statusCode =
                Number(
                  (
                    pushError as {
                      statusCode?:
                        number;
                    }
                  ).statusCode ??
                  0,
                );

              if (
                statusCode ===
                  404 ||
                statusCode ===
                  410
              ) {
                await adminClient
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

              console.warn(
                "Échec notification chat :",
                {
                  subscriptionId:
                    subscription.id,

                  statusCode,

                  error:
                    pushError instanceof
                    Error
                      ? pushError.message
                      : String(
                          pushError,
                        ),
                },
              );
            }
          },
        ),
      );

      console.log(
        JSON.stringify({
          event:
            "chat_push_sent",

          messageId:
            message.id,

          senderId:
            user.id,

          delivered,
          failed,
        }),
      );

      return jsonResponse({
        ok:
          true,

        delivered,
        failed,

        devices:
          subscriptions.length,
      });
    } catch (error) {
      console.error(
        "notify-chat-message:",
        error,
      );

      return jsonResponse(
        {
          error:
            error instanceof
            Error
              ? error.message
              : "Erreur interne pendant l’envoi des notifications du chat.",
        },
        500,
      );
    }
  },
);
