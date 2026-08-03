const SERVICE_WORKER_URL =
  "/service-worker.js";

export const PWA_UPDATE_AVAILABLE_EVENT =
  "copintes:pwa-update-available";

export const PWA_CONTROLLER_CHANGED_EVENT =
  "copintes:pwa-controller-changed";

function dispatchUpdateAvailable(
  registration,
) {
  window.dispatchEvent(
    new CustomEvent(
      PWA_UPDATE_AVAILABLE_EVENT,
      {
        detail: {
          registration,
        },
      },
    ),
  );
}

function observeInstallingWorker(
  registration,
) {
  const installingWorker =
    registration.installing;

  if (!installingWorker) {
    return;
  }

  installingWorker.addEventListener(
    "statechange",
    () => {
      if (
        installingWorker.state ===
          "installed" &&
        navigator.serviceWorker
          .controller
      ) {
        dispatchUpdateAvailable(
          registration,
        );
      }
    },
  );
}

export function registerServiceWorker() {
  if (
    import.meta.env.DEV ||
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  let refreshing = false;

  navigator.serviceWorker.addEventListener(
    "controllerchange",
    () => {
      if (refreshing) {
        return;
      }

      refreshing = true;

      window.dispatchEvent(
        new CustomEvent(
          PWA_CONTROLLER_CHANGED_EVENT,
        ),
      );
    },
  );

  window.addEventListener(
    "load",
    async () => {
      try {
        const registration =
          await navigator
            .serviceWorker
            .register(
              SERVICE_WORKER_URL,
              {
                scope: "/",
                updateViaCache:
                  "none",
              },
            );

        if (
          registration.waiting &&
          navigator.serviceWorker
            .controller
        ) {
          dispatchUpdateAvailable(
            registration,
          );
        }

        registration.addEventListener(
          "updatefound",
          () => {
            observeInstallingWorker(
              registration,
            );
          },
        );

        /*
         * Vérification immédiate, puis à chaque retour
         * sur l’application après une période d’inactivité.
         */
        await registration.update();

        const checkForUpdate =
          () => {
            if (
              document.visibilityState ===
              "visible"
            ) {
              registration
                .update()
                .catch(
                  (error) => {
                    console.warn(
                      "Vérification de mise à jour PWA impossible :",
                      error,
                    );
                  },
                );
            }
          };

        document.addEventListener(
          "visibilitychange",
          checkForUpdate,
        );

        window.setInterval(
          () => {
            registration
              .update()
              .catch(() => {});
          },
          60 * 60 * 1000,
        );

        console.info(
          "Service worker Les Co'Pintes enregistré.",
        );
      } catch (error) {
        console.error(
          "Impossible d’enregistrer le service worker :",
          error,
        );
      }
    },
  );
}

export async function activateWaitingServiceWorker(
  registration,
) {
  const waitingWorker =
    registration?.waiting;

  if (!waitingWorker) {
    return false;
  }

  waitingWorker.postMessage({
    type:
      "SKIP_WAITING",
  });

  return true;
}
