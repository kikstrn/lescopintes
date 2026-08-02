import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const BADGE_NOTIFICATION_TYPE =
  "badge_unlocked";

const AUTO_CLOSE_DELAY = 6000;

export function useBadgeCelebration({
  notifications = [],
  loading = false,
} = {}) {
  const initializedRef =
    useRef(false);

  const seenNotificationIdsRef =
    useRef(new Set());

  const closeTimeoutRef =
    useRef(null);

  const [queue, setQueue] =
    useState([]);

  const [
    currentCelebration,
    setCurrentCelebration,
  ] = useState(null);

  const clearCloseTimeout =
    useCallback(() => {
      if (
        closeTimeoutRef.current
      ) {
        window.clearTimeout(
          closeTimeoutRef.current,
        );

        closeTimeoutRef.current =
          null;
      }
    }, []);

  const closeCelebration =
    useCallback(() => {
      clearCloseTimeout();
      setCurrentCelebration(null);
    }, [clearCloseTimeout]);

  useEffect(() => {
    if (loading) {
      return;
    }

    /*
     * Le premier chargement sert uniquement
     * à mémoriser les notifications existantes.
     * Elles ne déclenchent donc pas d’animation
     * lors d’un simple rafraîchissement de page.
     */
    if (!initializedRef.current) {
      notifications.forEach(
        (notification) => {
          if (notification?.id) {
            seenNotificationIdsRef
              .current
              .add(
                notification.id,
              );
          }
        },
      );

      initializedRef.current = true;
      return;
    }

    const newBadgeNotifications =
      notifications.filter(
        (notification) => {
          if (
            !notification?.id ||
            notification.notification_type !==
              BADGE_NOTIFICATION_TYPE
          ) {
            return false;
          }

          return !seenNotificationIdsRef
            .current
            .has(notification.id);
        },
      );

    notifications.forEach(
      (notification) => {
        if (notification?.id) {
          seenNotificationIdsRef
            .current
            .add(notification.id);
        }
      },
    );

    if (
      newBadgeNotifications.length ===
      0
    ) {
      return;
    }

    /*
     * Les notifications sont généralement
     * triées de la plus récente à la plus
     * ancienne. On inverse ici pour afficher
     * les badges dans leur ordre d’arrivée.
     */
    setQueue((currentQueue) => [
      ...currentQueue,
      ...newBadgeNotifications
        .slice()
        .reverse(),
    ]);
  }, [
    loading,
    notifications,
  ]);

  useEffect(() => {
    if (
      currentCelebration ||
      queue.length === 0
    ) {
      return;
    }

    const [
      nextCelebration,
      ...remainingQueue
    ] = queue;

    setCurrentCelebration(
      nextCelebration,
    );

    setQueue(
      remainingQueue,
    );
  }, [
    currentCelebration,
    queue,
  ]);

  useEffect(() => {
    if (!currentCelebration) {
      return undefined;
    }

    clearCloseTimeout();

    closeTimeoutRef.current =
      window.setTimeout(() => {
        setCurrentCelebration(
          null,
        );
      }, AUTO_CLOSE_DELAY);

    return clearCloseTimeout;
  }, [
    clearCloseTimeout,
    currentCelebration,
  ]);

  useEffect(() => {
    return clearCloseTimeout;
  }, [clearCloseTimeout]);

  return {
    currentCelebration,

    isOpen:
      Boolean(
        currentCelebration,
      ),

    pendingCount:
      queue.length,

    closeCelebration,
  };
}

export default useBadgeCelebration;
