import {
  createClient,
} from "npm:@supabase/supabase-js@2";

import webpush from "npm:web-push@3.6.7";

type WebhookPayload = {
  type?: string;
  table?: string;
  schema?: string;
  record?: {
    id?: string;
  };
  old_record?: unknown;
};

const corsHeaders = {
  "Access-Control-Allow-Origin":
    "*",

  "Access-Control-Allow-Headers":
    "content-type, x-notification-secret",

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
      const expectedSecret =
        getRequiredSecret(
          "NOTIFICATION_WEBHOOK_SECRET",
        );

      const suppliedSecret =
        request.headers.get(
          "x-notification-secret",
        );

      if (
        !suppliedSecret ||
        suppliedSecret !==
          expectedSecret
      ) {
        return jsonResponse(
          {
            error:
              "Secret du webhook invalide.",
          },
          401,
        );
      }

      const payload =
        await request
          .json() as WebhookPayload;

      if (
        payload.type !==
          "INSERT" ||
        payload.table !==
          "notifications"
      ) {
        return jsonResponse({
          ok:
            true,

          ignored:
            true,
        });
      }

      const notificationId =
        payload.record?.id;

      if (!notificationId) {
        return jsonResponse(
          {
            error:
              "Identifiant de notification manquant.",
          },
          400,
        );
      }

      const supabaseUrl =
        getRequiredSecret(
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
          notification,
        error:
          notificationError,
      } = await adminClient
        .from(
          "notifications",
        )
        .select(`
          id,
          recipient_id,
          actor_id,
          notification_type,
          title,
          message,
          entity_type,
          entity_id,
          page_id,
          metadata,
          push_sent_at
        `)
        .eq(
          "id",
          notificationId,
        )
        .single();

      if (
        notificationError ||
        !notification
      ) {
        return jsonResponse(
          {
            error:
              "Notification introuvable.",
          },
          404,
        );
      }

      if (
        notification.push_sent_at
      ) {
        return jsonResponse({
          ok:
            true,

          duplicate:
            true,
        });
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
          endpoint,
          p256dh,
          auth
        `)
        .eq(
          "profile_id",
          notification.recipient_id,
        )
        .eq(
          "is_active",
          true,
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
        await adminClient
          .from(
            "notifications",
          )
          .update({
            push_error:
              "Aucun appareil actif.",
          })
          .eq(
            "id",
            notification.id,
          );

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

      const pageId =
        notification.page_id ??
        "home";

      const pushPayload =
        JSON.stringify({
          title:
            notification.title,

          body:
            notification.message,

          url:
            `/?page=${encodeURIComponent(
              pageId,
            )}`,

          pageId,

          notificationId:
            notification.id,

          icon:
            "/android-chrome-192x192.png",

          badge:
            "/notification-badge-96x96.png",

          tag:
            `${notification.notification_type}-${notification.id}`,

          renotify:
            false,

          data: {
            kind:
              notification.notification_type,

            entityType:
              notification.entity_type,

            entityId:
              notification.entity_id,

            ...(notification.metadata ??
              {}),
          },
        });

      let delivered = 0;
      let failed = 0;

      const errors:
        string[] = [];

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
                  pushPayload,
                  {
                    TTL:
                      10 * 60,

                    urgency:
                      "normal",
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

              const errorMessage =
                pushError instanceof
                Error
                  ? pushError.message
                  : String(
                      pushError,
                    );

              errors.push(
                `${subscription.id}: ${statusCode || "?"} ${errorMessage}`,
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
            }
          },
        ),
      );

      await adminClient
        .from(
          "notifications",
        )
        .update({
          push_sent_at:
            delivered > 0
              ? new Date()
                  .toISOString()
              : null,

          push_error:
            failed > 0
              ? errors
                  .join(" | ")
                  .slice(
                    0,
                    2000,
                  )
              : null,
        })
        .eq(
          "id",
          notification.id,
        );

      console.log(
        JSON.stringify({
          event:
            "notification_dispatched",

          notificationId:
            notification.id,

          type:
            notification.notification_type,

          recipientId:
            notification.recipient_id,

          delivered,
          failed,
        }),
      );

      return jsonResponse({
        ok:
          delivered > 0,

        delivered,
        failed,

        devices:
          subscriptions.length,
      });
    } catch (error) {
      console.error(
        "dispatch-notification:",
        error,
      );

      return jsonResponse(
        {
          error:
            error instanceof
            Error
              ? error.message
              : "Erreur interne pendant l’envoi de la notification.",
        },
        500,
      );
    }
  },
);
