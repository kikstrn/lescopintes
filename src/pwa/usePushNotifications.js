import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getPushDeviceCount,
  removePushSubscription,
  savePushSubscription,
  touchPushSubscription,
} from "../services/pushService";

function urlBase64ToUint8Array(
  base64String,
) {
  const padding =
    "=".repeat(
      (
        4 -
        (
          base64String.length %
          4
        )
      ) %
        4,
    );

  const base64 =
    (
      base64String +
      padding
    )
      .replace(
        /-/g,
        "+",
      )
      .replace(
        /_/g,
        "/",
      );

  const rawData =
    window.atob(base64);

  return Uint8Array.from(
    [...rawData].map(
      (character) =>
        character.charCodeAt(
          0,
        ),
    ),
  );
}

function isStandaloneMode() {
  return (
    window.matchMedia(
      "(display-mode: standalone)",
    ).matches ||
    window.navigator
      .standalone === true
  );
}

function isIosDevice() {
  return (
    /iphone|ipad|ipod/i.test(
      window.navigator
        .userAgent,
    ) ||
    (
      window.navigator
        .platform ===
        "MacIntel" &&
      (
        window.navigator
          .maxTouchPoints ??
        0
      ) > 1
    )
  );
}

function usePushNotifications(
  profileId,
) {
  const [
    permission,
    setPermission,
  ] = useState(
    () =>
      typeof Notification ===
        "undefined"
        ? "unsupported"
        : Notification
            .permission,
  );

  const [
    subscription,
    setSubscription,
  ] = useState(null);

  const [
    deviceCount,
    setDeviceCount,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  const supported =
    useMemo(
      () =>
        typeof window !==
          "undefined" &&
        "serviceWorker" in
          navigator &&
        "PushManager" in
          window &&
        "Notification" in
          window,
      [],
    );

  const isIos =
    useMemo(
      () =>
        typeof window !==
          "undefined" &&
        isIosDevice(),
      [],
    );

  const installed =
    useMemo(
      () =>
        typeof window !==
          "undefined" &&
        isStandaloneMode(),
      [],
    );

  const vapidPublicKey =
    import.meta.env
      .VITE_VAPID_PUBLIC_KEY ??
    "";

  const configured =
    Boolean(
      vapidPublicKey,
    );

  const subscribed =
    Boolean(subscription);

  const loadStatus =
    useCallback(async () => {
      if (
        !supported ||
        !profileId
      ) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const registration =
          await navigator
            .serviceWorker
            .ready;

        const currentSubscription =
          await registration
            .pushManager
            .getSubscription();

        setSubscription(
          currentSubscription,
        );

        setPermission(
          Notification.permission,
        );

        if (
          currentSubscription
        ) {
          await touchPushSubscription({
            profileId,

            endpoint:
              currentSubscription
                .endpoint,
          });
        }

        const count =
          await getPushDeviceCount(
            profileId,
          );

        setDeviceCount(
          count,
        );
      } catch (requestError) {
        console.error(
          "Impossible de vérifier les notifications push :",
          requestError,
        );

        setError(
          requestError?.message ??
            "Impossible de vérifier les notifications push.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      profileId,
      supported,
    ]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const enable =
    useCallback(async () => {
      if (!supported) {
        throw new Error(
          "Les notifications push ne sont pas prises en charge sur cet appareil.",
        );
      }

      if (
        isIos &&
        !installed
      ) {
        throw new Error(
          "Sur iPhone ou iPad, installe d’abord l’application sur l’écran d’accueil puis ouvre-la depuis son icône.",
        );
      }

      if (!configured) {
        throw new Error(
          "La clé publique VAPID n’est pas configurée dans VITE_VAPID_PUBLIC_KEY.",
        );
      }

      if (!profileId) {
        throw new Error(
          "Profil introuvable.",
        );
      }

      setSaving(true);
      setError(null);

      try {
        const newPermission =
          await Notification
            .requestPermission();

        setPermission(
          newPermission,
        );

        if (
          newPermission !==
          "granted"
        ) {
          throw new Error(
            newPermission ===
              "denied"
              ? "Les notifications sont bloquées dans les réglages du navigateur."
              : "L’autorisation des notifications n’a pas été accordée.",
          );
        }

        const registration =
          await navigator
            .serviceWorker
            .ready;

        let currentSubscription =
          await registration
            .pushManager
            .getSubscription();

        if (
          !currentSubscription
        ) {
          currentSubscription =
            await registration
              .pushManager
              .subscribe({
                userVisibleOnly:
                  true,

                applicationServerKey:
                  urlBase64ToUint8Array(
                    vapidPublicKey,
                  ),
              });
        }

        await savePushSubscription({
          profileId,
          subscription:
            currentSubscription,
        });

        setSubscription(
          currentSubscription,
        );

        setDeviceCount(
          await getPushDeviceCount(
            profileId,
          ),
        );

        return currentSubscription;
      } catch (requestError) {
        setError(
          requestError?.message ??
            "Impossible d’activer les notifications push.",
        );

        throw requestError;
      } finally {
        setSaving(false);
      }
    }, [
      configured,
      installed,
      isIos,
      profileId,
      supported,
      vapidPublicKey,
    ]);

  const disable =
    useCallback(async () => {
      if (
        !subscription ||
        !profileId
      ) {
        return;
      }

      setSaving(true);
      setError(null);

      try {
        const endpoint =
          subscription.endpoint;

        await subscription
          .unsubscribe();

        await removePushSubscription({
          profileId,
          endpoint,
        });

        setSubscription(null);

        setDeviceCount(
          await getPushDeviceCount(
            profileId,
          ),
        );
      } catch (requestError) {
        setError(
          requestError?.message ??
            "Impossible de désactiver les notifications push.",
        );

        throw requestError;
      } finally {
        setSaving(false);
      }
    }, [
      profileId,
      subscription,
    ]);

  return {
    supported,
    configured,
    installed,
    isIos,

    permission,
    subscribed,
    deviceCount,

    loading,
    saving,
    error,

    enable,
    disable,
    refresh:
      loadStatus,
  };
}

export default usePushNotifications;
