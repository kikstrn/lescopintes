import {
  Bell,
  BellOff,
  BellRing,
  CheckCircle2,
  Inbox,
  Laptop,
  Settings2,
  SlidersHorizontal,
  Smartphone,
  Trash2,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  useAppData,
} from "../../v2/context/AppDataContext";

import {
  useNavigation,
} from "../../v2/context/NavigationContext";

import usePushNotifications from "../../pwa/usePushNotifications";
import useNotificationPreferences from "../../hooks/useNotificationPreferences";
import usePushDevices from "../../hooks/usePushDevices";

function formatNotificationDate(
  value,
) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle:
        "short",

      timeStyle:
        "short",
    },
  ).format(
    new Date(value),
  );
}


const NOTIFICATION_PREFERENCE_ITEMS = [
  {
    key:
      "chat_enabled",

    label:
      "Chat",

    description:
      "Nouveaux messages, réponses et réactions.",
  },
  {
    key:
      "events_enabled",

    label:
      "Événements",

    description:
      "Créations, modifications et réponses de présence.",
  },
  {
    key:
      "tennis_enabled",

    label:
      "Tennis",

    description:
      "Tournois, matchs, résultats et corrections.",
  },
  {
    key:
      "cycling_enabled",

    label:
      "Cyclisme",

    description:
      "Nouvelles sorties et activités vélo.",
  },
  {
    key:
      "challenges_enabled",

    label:
      "Défis",

    description:
      "Nouveaux défis, participations et validations.",
  },
  {
    key:
      "gages_enabled",

    label:
      "Gages",

    description:
      "Attributions, preuves et changements de statut.",
  },
  {
    key:
      "tribunal_enabled",

    label:
      "Tribunal",

    description:
      "Affaires, votes et verdicts.",
  },
  {
    key:
      "rewards_enabled",

    label:
      "Badges et XP",

    description:
      "Badges débloqués, XP et récompenses.",
  },
  {
    key:
      "members_enabled",

    label:
      "Membres",

    description:
      "Arrivée de nouveaux membres.",
  },
  {
    key:
      "birthdays_enabled",

    label:
      "Anniversaires",

    description:
      "Rappels le jour de l’anniversaire des autres membres.",
  },
  {
    key:
      "system_enabled",

    label:
      "Annonces générales",

    description:
      "Informations importantes de l’application.",
  },
];

function UnifiedNotificationCenter({
  profileId,
}) {
  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "notifications",
  );

  const {
    notifications = [],
    unreadNotificationsCount = 0,
    notificationsLoading = false,
    notificationsError = null,

    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearReadNotifications,
  } = useAppData();

  const {
    navigateTo,
  } = useNavigation();

  const push =
    usePushNotifications(
      profileId,
    );

  const notificationPreferences =
    useNotificationPreferences(
      profileId,
    );

  const [
    currentEndpoint,
    setCurrentEndpoint,
  ] = useState(null);

  useEffect(() => {
    if (
      !(
        "serviceWorker" in
        navigator
      )
    ) {
      return;
    }

    navigator.serviceWorker.ready
      .then(
        (registration) =>
          registration.pushManager
            .getSubscription(),
      )
      .then(
        (subscription) => {
          setCurrentEndpoint(
            subscription?.endpoint ??
              null,
          );
        },
      )
      .catch(() => {});
  }, [
    push.subscribed,
  ]);

  const pushDevices =
    usePushDevices({
      profileId,
      currentEndpoint,
    });

  const handleNotificationClick =
    async (notification) => {
      if (
        !notification.read_at
      ) {
        try {
          await markNotificationAsRead?.(
            notification.id,
          );
        } catch {
          /*
           * L’état sera resynchronisé par le hook.
           */
        }
      }

      if (
        notification.page_id
      ) {
        navigateTo(
          notification.page_id,
        );
      }

      setOpen(false);
    };

  const handleEnablePush =
    async () => {
      try {
        await push.enable();
      } catch {
        /*
         * L’erreur est affichée dans l’onglet Push.
         */
      }
    };

  const handleDisablePush =
    async () => {
      try {
        await push.disable();
      } catch {
        /*
         * L’erreur est affichée dans l’onglet Push.
         */
      }
    };

  return (
    <div className="unified-notifications">
      <button
        type="button"
        className={[
          "icon-button",
          "unified-notifications__trigger",
          push.subscribed
            ? "unified-notifications__trigger--push-active"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="Ouvrir les notifications"
        aria-expanded={open}
        onClick={() =>
          setOpen(
            (current) =>
              !current,
          )
        }
      >
        <Bell size={20} />

        {unreadNotificationsCount >
          0 && (
          <span className="notification-badge">
            {unreadNotificationsCount >
            99
              ? "99+"
              : unreadNotificationsCount}
          </span>
        )}

        {push.subscribed && (
          <span
            className="unified-notifications__push-dot"
            aria-label="Notifications push actives"
          />
        )}
      </button>

      {open &&
        createPortal(
          <div
            className="unified-notifications__backdrop"
            role="presentation"
            onClick={() =>
              setOpen(false)
            }
          >
            <section
              className="unified-notifications__panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="unified-notifications-title"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <header className="unified-notifications__header">
                <div>
                  <span className="section-heading__eyebrow">
                    Centre personnel
                  </span>

                  <h2 id="unified-notifications-title">
                    Notifications
                  </h2>
                </div>

                <button
                  type="button"
                  className="unified-notifications__close"
                  aria-label="Fermer"
                  onClick={() =>
                    setOpen(false)
                  }
                >
                  <X size={20} />
                </button>
              </header>

              <nav
                className="unified-notifications__tabs"
                aria-label="Sections des notifications"
              >
                <button
                  type="button"
                  className={
                    activeTab ===
                    "notifications"
                      ? "is-active"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab(
                      "notifications",
                    )
                  }
                >
                  <Inbox size={17} />

                  Activité

                  {unreadNotificationsCount >
                    0 && (
                    <span>
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  className={
                    activeTab ===
                    "push"
                      ? "is-active"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab(
                      "push",
                    )
                  }
                >
                  <Smartphone
                    size={17}
                  />

                  Push

                  <span
                    className={[
                      "unified-notifications__tab-state",
                      push.subscribed
                        ? "is-enabled"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                </button>

                <button
                  type="button"
                  className={
                    activeTab ===
                    "devices"
                      ? "is-active"
                      : ""
                  }
                  onClick={() => {
                    setActiveTab(
                      "devices",
                    );

                    pushDevices.refresh();
                  }}
                >
                  <Laptop size={17} />

                  Appareils

                  {pushDevices.devices.length >
                    0 && (
                    <span>
                      {
                        pushDevices
                          .devices
                          .length
                      }
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  className={
                    activeTab ===
                    "preferences"
                      ? "is-active"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab(
                      "preferences",
                    )
                  }
                >
                  <SlidersHorizontal
                    size={17}
                  />

                  Préférences
                </button>
              </nav>

              {activeTab ===
                "notifications" && (
                <div className="unified-notifications__activity">
                  <div className="unified-notifications__actions">
                    <button
                      type="button"
                      disabled={
                        unreadNotificationsCount ===
                        0
                      }
                      onClick={
                        markAllNotificationsAsRead
                      }
                    >
                      <CheckCircle2
                        size={15}
                      />
                      Tout lire
                    </button>

                    <button
                      type="button"
                      onClick={
                        clearReadNotifications
                      }
                    >
                      <Trash2 size={15} />
                      Effacer les lues
                    </button>
                  </div>

                  <div className="unified-notifications__list">
                    {notificationsLoading && (
                      <div className="unified-notifications__empty">
                        Chargement…
                      </div>
                    )}

                    {!notificationsLoading &&
                      notificationsError && (
                        <div className="unified-notifications__empty unified-notifications__empty--error">
                          {notificationsError}
                        </div>
                      )}

                    {!notificationsLoading &&
                      !notificationsError &&
                      notifications.length ===
                        0 && (
                        <div className="unified-notifications__empty">
                          <BellOff
                            size={27}
                          />

                          <strong>
                            Rien de nouveau
                          </strong>

                          <span>
                            Tes prochaines activités apparaîtront ici.
                          </span>
                        </div>
                      )}

                    {!notificationsLoading &&
                      !notificationsError &&
                      notifications.map(
                        (
                          notification,
                        ) => (
                          <article
                            key={
                              notification.id
                            }
                            className={[
                              "unified-notification-item",
                              notification.read_at
                                ? "is-read"
                                : "is-unread",
                            ].join(
                              " ",
                            )}
                          >
                            <button
                              type="button"
                              className="unified-notification-item__main"
                              onClick={() =>
                                handleNotificationClick(
                                  notification,
                                )
                              }
                            >
                              <span className="unified-notification-item__dot" />

                              <span className="unified-notification-item__content">
                                <strong>
                                  {
                                    notification.title
                                  }
                                </strong>

                                {notification.message && (
                                  <span>
                                    {
                                      notification.message
                                    }
                                  </span>
                                )}

                                <small>
                                  {formatNotificationDate(
                                    notification.created_at,
                                  )}
                                </small>
                              </span>
                            </button>

                            <button
                              type="button"
                              className="unified-notification-item__delete"
                              aria-label="Supprimer cette notification"
                              onClick={() =>
                                deleteNotification?.(
                                  notification.id,
                                )
                              }
                            >
                              <X size={16} />
                            </button>
                          </article>
                        ),
                      )}
                  </div>
                </div>
              )}

              {activeTab ===
                "push" && (
                <div className="unified-notifications__push">
                  {push.loading ? (
                    <div className="unified-notifications__empty">
                      Vérification de l’appareil…
                    </div>
                  ) : (
                    <>
                      <div
                        className={[
                          "unified-notifications__push-status",
                          push.subscribed
                            ? "is-enabled"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {push.subscribed ? (
                          <BellRing
                            size={23}
                          />
                        ) : (
                          <BellOff
                            size={23}
                          />
                        )}

                        <div>
                          <strong>
                            {push.subscribed
                              ? "Push actives sur cet appareil"
                              : "Push désactivées sur cet appareil"}
                          </strong>

                          <p>
                            {push.subscribed
                              ? `${push.deviceCount} appareil(s) actif(s) pour ton compte.`
                              : "Active-les pour recevoir les alertes même lorsque l’application est fermée."}
                          </p>
                        </div>
                      </div>

                      {!push.supported && (
                        <p className="unified-notifications__warning">
                          Ce navigateur ne prend pas en charge les notifications push.
                        </p>
                      )}

                      {push.isIos &&
                        !push.installed && (
                          <p className="unified-notifications__warning">
                            Sur iPhone ou iPad, installe d’abord Les Co’Pintes sur l’écran d’accueil.
                          </p>
                        )}

                      {!push.configured && (
                        <p className="unified-notifications__warning">
                          La clé publique VAPID n’est pas configurée.
                        </p>
                      )}

                      {push.permission ===
                        "denied" && (
                          <p className="unified-notifications__warning unified-notifications__warning--error">
                            Les notifications sont bloquées dans les réglages du navigateur ou du téléphone.
                          </p>
                        )}

                      {push.error && (
                        <p className="unified-notifications__warning unified-notifications__warning--error">
                          {push.error}
                        </p>
                      )}

                      <button
                        type="button"
                        className={
                          push.subscribed
                            ? "unified-notifications__push-disable"
                            : "unified-notifications__push-enable"
                        }
                        disabled={
                          push.loading ||
                          push.saving ||
                          (
                            !push.subscribed &&
                            (
                              !push.supported ||
                              !push.configured ||
                              push.permission ===
                                "denied"
                            )
                          )
                        }
                        onClick={
                          push.subscribed
                            ? handleDisablePush
                            : handleEnablePush
                        }
                      >
                        {push.saving
                          ? "Traitement…"
                          : push.subscribed
                            ? "Désactiver sur cet appareil"
                            : "Activer les notifications push"}
                      </button>

                      <div className="unified-notifications__preferences-preview">
                        <Settings2
                          size={18}
                        />

                        <div>
                          <strong>
                            Préférences personnalisées
                          </strong>

                          <p>
                            La prochaine phase ajoutera les réglages par catégorie directement dans cette cloche.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab ===
                "devices" && (
                <div className="unified-notifications__devices">
                  <div className="unified-notifications__devices-header">
                    <strong>
                      Appareils enregistrés
                    </strong>

                    <p>
                      Retire les anciens téléphones ou navigateurs qui ne doivent plus recevoir de Push.
                    </p>
                  </div>

                  {pushDevices.loading ? (
                    <div className="unified-notifications__empty">
                      Chargement des appareils…
                    </div>
                  ) : pushDevices.devices.length ===
                    0 ? (
                    <div className="unified-notifications__empty">
                      <Smartphone
                        size={27}
                      />

                      <strong>
                        Aucun appareil
                      </strong>

                      <span>
                        Active les notifications Push sur un téléphone ou un navigateur.
                      </span>
                    </div>
                  ) : (
                    <div className="unified-notifications__devices-list">
                      {pushDevices.devices.map(
                        (
                          device,
                        ) => (
                          <article
                            key={
                              device.id
                            }
                            className={[
                              "unified-notifications__device",
                              device.isCurrent
                                ? "is-current"
                                : "",
                              device.is_active
                                ? "is-active"
                                : "is-inactive",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            <span className="unified-notifications__device-icon">
                              {/android|iphone|ipad/i.test(
                                device.device_label ??
                                  "",
                              ) ? (
                                <Smartphone
                                  size={20}
                                />
                              ) : (
                                <Laptop
                                  size={20}
                                />
                              )}
                            </span>

                            <div className="unified-notifications__device-content">
                              <strong>
                                {device.device_label ??
                                  "Appareil"}
                              </strong>

                              <span>
                                {device.isCurrent
                                  ? "Appareil actuel"
                                  : device.is_active
                                    ? "Actif"
                                    : "Inactif"}
                              </span>

                              <small>
                                Dernière activité :{" "}
                                {formatNotificationDate(
                                  device.last_seen_at ??
                                    device.updated_at ??
                                    device.created_at,
                                )}
                              </small>
                            </div>

                            <button
                              type="button"
                              className="unified-notifications__device-remove"
                              disabled={
                                pushDevices.deletingId ===
                                device.id
                              }
                              onClick={async () => {
                                if (
                                  device.isCurrent &&
                                  push.subscribed
                                ) {
                                  try {
                                    await push.disable();
                                    setCurrentEndpoint(
                                      null,
                                    );
                                    await pushDevices.refresh();
                                  } catch {
                                    return;
                                  }
                                } else {
                                  await pushDevices
                                    .removeDevice(
                                      device,
                                    )
                                    .catch(
                                      () => {},
                                    );
                                }
                              }}
                            >
                              <Trash2
                                size={16}
                              />

                              {pushDevices.deletingId ===
                              device.id
                                ? "Suppression…"
                                : "Retirer"}
                            </button>
                          </article>
                        ),
                      )}
                    </div>
                  )}

                  {pushDevices.error && (
                    <p className="unified-notifications__warning unified-notifications__warning--error">
                      {
                        pushDevices.error
                      }
                    </p>
                  )}
                </div>
              )}

              {activeTab ===
                "preferences" && (
                <div className="unified-notifications__preferences">
                  <div className="unified-notifications__preferences-header">
                    <div>
                      <strong>
                        Choisis ce que tu souhaites recevoir
                      </strong>

                      <p>
                        Un réglage désactivé retire les notifications internes et les Push de cette catégorie.
                      </p>
                    </div>

                    <div className="unified-notifications__preferences-global-actions">
                      <button
                        type="button"
                        disabled={
                          notificationPreferences.savingKey ===
                          "all"
                        }
                        onClick={
                          notificationPreferences.enableAll
                        }
                      >
                        Tout activer
                      </button>

                      <button
                        type="button"
                        disabled={
                          notificationPreferences.savingKey ===
                          "all"
                        }
                        onClick={
                          notificationPreferences.disableAll
                        }
                      >
                        Tout désactiver
                      </button>
                    </div>
                  </div>

                  {notificationPreferences.loading ? (
                    <div className="unified-notifications__empty">
                      Chargement des préférences…
                    </div>
                  ) : (
                    <div className="unified-notifications__preferences-list">
                      {NOTIFICATION_PREFERENCE_ITEMS.map(
                        (
                          item,
                        ) => {
                          const enabled =
                            Boolean(
                              notificationPreferences
                                .preferences[
                                  item.key
                                ],
                            );

                          const saving =
                            notificationPreferences
                              .savingKey ===
                              item.key;

                          return (
                            <label
                              key={
                                item.key
                              }
                              className="unified-notifications__preference-item"
                            >
                              <span>
                                <strong>
                                  {
                                    item.label
                                  }
                                </strong>

                                <small>
                                  {
                                    item.description
                                  }
                                </small>
                              </span>

                              <input
                                type="checkbox"
                                checked={
                                  enabled
                                }
                                disabled={
                                  saving ||
                                  notificationPreferences
                                    .savingKey ===
                                    "all"
                                }
                                onChange={(
                                  event,
                                ) =>
                                  notificationPreferences
                                    .updatePreference(
                                      item.key,
                                      event
                                        .target
                                        .checked,
                                    )
                                    .catch(
                                      () => {},
                                    )
                                }
                              />

                              <span className="unified-notifications__switch">
                                <span />
                              </span>
                            </label>
                          );
                        },
                      )}
                    </div>
                  )}

                  {notificationPreferences.error && (
                    <p className="unified-notifications__warning unified-notifications__warning--error">
                      {
                        notificationPreferences.error
                      }
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default UnifiedNotificationCenter;
