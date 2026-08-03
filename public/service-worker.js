/* Les Co'Pintes — Service Worker PWA Foundation 1.3 */

const CACHE_VERSION =
  "copintes-pwa-v5";

const STATIC_CACHE =
  `${CACHE_VERSION}-static`;

const RUNTIME_CACHE =
  `${CACHE_VERSION}-runtime`;

const APP_SHELL = [
  "/",
  "/site.webmanifest",
  "/favicon.ico",
  "/favicon-32x32.png",
  "/apple-touch-icon.png",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
  "/maskable-icon-512x512.png",
  "/offline.html",
];

self.addEventListener(
  "install",
  (event) => {
    /*
     * On ne force plus immédiatement skipWaiting().
     * L’utilisateur choisit quand appliquer la mise à jour,
     * ce qui évite de recharger l’application en plein usage.
     */
    event.waitUntil(
      caches
        .open(STATIC_CACHE)
        .then((cache) =>
          cache.addAll(
            APP_SHELL,
          ),
        ),
    );
  },
);

self.addEventListener(
  "activate",
  (event) => {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(
            cacheNames
              .filter(
                (cacheName) =>
                  cacheName.startsWith(
                    "copintes-pwa-",
                  ) &&
                  cacheName !==
                    STATIC_CACHE &&
                  cacheName !==
                    RUNTIME_CACHE,
              )
              .map(
                (cacheName) =>
                  caches.delete(
                    cacheName,
                  ),
              ),
          ),
        )
        .then(() =>
          self.clients.claim(),
        ),
    );
  },
);

function isSameOrigin(
  requestUrl,
) {
  return (
    requestUrl.origin ===
    self.location.origin
  );
}

function isStaticAsset(
  request,
) {
  return [
    "style",
    "script",
    "font",
    "image",
  ].includes(
    request.destination,
  );
}

async function networkFirst(
  request,
) {
  const cache =
    await caches.open(
      RUNTIME_CACHE,
    );

  try {
    const response =
      await fetch(request);

    if (
      response &&
      response.ok
    ) {
      await cache.put(
        request,
        response.clone(),
      );
    }

    return response;
  } catch (error) {
    const cachedResponse =
      await cache.match(
        request,
      );

    if (cachedResponse) {
      return cachedResponse;
    }

    const cachedHome =
      await caches.match("/");

    if (cachedHome) {
      return cachedHome;
    }

    const offlinePage =
      await caches.match(
        "/offline.html",
      );

    if (offlinePage) {
      return offlinePage;
    }

    throw error;
  }
}

async function staleWhileRevalidate(
  request,
) {
  const cache =
    await caches.open(
      RUNTIME_CACHE,
    );

  const cachedResponse =
    await cache.match(
      request,
    );

  const networkPromise =
    fetch(request)
      .then(
        async (response) => {
          if (
            response &&
            response.ok
          ) {
            await cache.put(
              request,
              response.clone(),
            );
          }

          return response;
        },
      )
      .catch(() => null);

  return (
    cachedResponse ||
    networkPromise
  );
}

self.addEventListener(
  "fetch",
  (event) => {
    const {
      request,
    } = event;

    if (
      request.method !==
      "GET"
    ) {
      return;
    }

    const requestUrl =
      new URL(
        request.url,
      );

    if (
      !isSameOrigin(
        requestUrl,
      )
    ) {
      return;
    }

    if (
      request.mode ===
      "navigate"
    ) {
      event.respondWith(
        networkFirst(
          request,
        ),
      );

      return;
    }

    if (
      isStaticAsset(
        request,
      )
    ) {
      event.respondWith(
        staleWhileRevalidate(
          request,
        ),
      );
    }
  },
);

self.addEventListener(
  "message",
  (event) => {
    if (
      event.data?.type ===
      "SKIP_WAITING"
    ) {
      self.skipWaiting();
    }
  },
);


/* =========================================================
   NOTIFICATIONS PUSH
   ========================================================= */

self.addEventListener(
  "push",
  (event) => {
    let payload = {};

    try {
      payload =
        event.data?.json() ??
        {};
    } catch {
      payload = {
        body:
          event.data?.text() ??
          "",
      };
    }

    const title =
      payload.title ??
      "Les Co’Pintes";

    const options = {
      body:
        payload.body ??
        "Tu as une nouvelle notification.",

      icon:
        payload.icon ??
        "/android-chrome-192x192.png",

      badge:
        payload.badge ??
        "/favicon-48x48.png",

      image:
        payload.image ??
        undefined,

      tag:
        payload.tag ??
        undefined,

      renotify:
        Boolean(
          payload.renotify,
        ),

      data: {
        url:
          payload.url ??
          "/",

        pageId:
          payload.pageId ??
          null,

        notificationId:
          payload.notificationId ??
          null,

        ...(payload.data ?? {}),
      },

      actions:
        Array.isArray(
          payload.actions,
        )
          ? payload.actions
          : [],
    };

    event.waitUntil(
      self.registration
        .showNotification(
          title,
          options,
        ),
    );
  },
);

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const targetUrl =
      event.notification
        .data?.url ??
      "/";

    event.waitUntil(
      self.clients
        .matchAll({
          type:
            "window",

          includeUncontrolled:
            true,
        })
        .then(
          async (clientList) => {
            for (
              const client
              of clientList
            ) {
              if (
                "focus" in client
              ) {
                await client.focus();

                client.postMessage({
                  type:
                    "PUSH_NOTIFICATION_CLICKED",

                  pageId:
                    event.notification
                      .data?.pageId ??
                    null,

                  notificationId:
                    event.notification
                      .data?.notificationId ??
                    null,
                });

                if (
                  "navigate" in
                    client
                ) {
                  await client.navigate(
                    targetUrl,
                  );
                }

                return;
              }
            }

            if (
              self.clients
                .openWindow
            ) {
              await self.clients
                .openWindow(
                  targetUrl,
                );
            }
          },
        ),
    );
  },
);
