import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";

function sortNotifications(items) {
  return [...items].sort((first, second) => {
    return (
      new Date(second.created_at).getTime() -
      new Date(first.created_at).getTime()
    );
  });
}

export function useNotifications() {
  const { user } = useAuth();

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const fetchNotifications =
    useCallback(async () => {
      if (!user?.id) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: fetchError } =
        await supabase
          .from("notifications")
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
            read_at,
            created_at
          `)
          .eq("recipient_id", user.id)
          .order("created_at", {
            ascending: false,
          })
          .limit(50);

      if (fetchError) {
        console.error(
          "Impossible de charger les notifications :",
          fetchError,
        );

        setError(
          fetchError.message ??
            "Impossible de charger les notifications.",
        );

        setLoading(false);
        return;
      }

      setNotifications(
        sortNotifications(data ?? []),
      );

      setLoading(false);
    }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    const channel = supabase
      .channel(
        `notifications:${user.id}`,
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification =
            payload.new;

          setNotifications(
            (currentNotifications) => {
              const alreadyExists =
                currentNotifications.some(
                  (notification) =>
                    notification.id ===
                    newNotification.id,
                );

              if (alreadyExists) {
                return currentNotifications;
              }

              return sortNotifications([
                newNotification,
                ...currentNotifications,
              ]);
            },
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedNotification =
            payload.new;

          setNotifications(
            (currentNotifications) =>
              currentNotifications.map(
                (notification) =>
                  notification.id ===
                  updatedNotification.id
                    ? updatedNotification
                    : notification,
              ),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          const deletedId =
            payload.old?.id;

          if (!deletedId) {
            return;
          }

          setNotifications(
            (currentNotifications) =>
              currentNotifications.filter(
                (notification) =>
                  notification.id !==
                  deletedId,
              ),
          );
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error(
            "Erreur Realtime des notifications.",
          );
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const unreadCount = useMemo(() => {
    return notifications.filter(
      (notification) =>
        !notification.read_at,
    ).length;
  }, [notifications]);

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!notificationId) {
        return;
      }

      const readAt =
        new Date().toISOString();

      setNotifications(
        (currentNotifications) =>
          currentNotifications.map(
            (notification) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    read_at: readAt,
                  }
                : notification,
          ),
      );

      const { error: updateError } =
        await supabase
          .from("notifications")
          .update({
            read_at: readAt,
          })
          .eq("id", notificationId)
          .eq("recipient_id", user?.id);

      if (updateError) {
        console.error(
          "Impossible de marquer la notification comme lue :",
          updateError,
        );

        await fetchNotifications();

        throw updateError;
      }
    },
    [
      fetchNotifications,
      user?.id,
    ],
  );

  const markAllAsRead =
    useCallback(async () => {
      if (!user?.id || unreadCount === 0) {
        return;
      }

      const readAt =
        new Date().toISOString();

      setNotifications(
        (currentNotifications) =>
          currentNotifications.map(
            (notification) => ({
              ...notification,
              read_at:
                notification.read_at ??
                readAt,
            }),
          ),
      );

      const { error: updateError } =
        await supabase
          .from("notifications")
          .update({
            read_at: readAt,
          })
          .eq("recipient_id", user.id)
          .is("read_at", null);

      if (updateError) {
        console.error(
          "Impossible de tout marquer comme lu :",
          updateError,
        );

        await fetchNotifications();

        throw updateError;
      }
    }, [
      fetchNotifications,
      unreadCount,
      user?.id,
    ]);

  const deleteNotification =
    useCallback(
      async (notificationId) => {
        if (!notificationId) {
          return;
        }

        setNotifications(
          (currentNotifications) =>
            currentNotifications.filter(
              (notification) =>
                notification.id !==
                notificationId,
            ),
        );

        const { error: deleteError } =
          await supabase
            .from("notifications")
            .delete()
            .eq("id", notificationId)
            .eq(
              "recipient_id",
              user?.id,
            );

        if (deleteError) {
          console.error(
            "Impossible de supprimer la notification :",
            deleteError,
          );

          await fetchNotifications();

          throw deleteError;
        }
      },
      [
        fetchNotifications,
        user?.id,
      ],
    );

  const clearReadNotifications =
    useCallback(async () => {
      if (!user?.id) {
        return;
      }

      setNotifications(
        (currentNotifications) =>
          currentNotifications.filter(
            (notification) =>
              !notification.read_at,
          ),
      );

      const { error: deleteError } =
        await supabase
          .from("notifications")
          .delete()
          .eq("recipient_id", user.id)
          .not("read_at", "is", null);

      if (deleteError) {
        console.error(
          "Impossible de supprimer les notifications lues :",
          deleteError,
        );

        await fetchNotifications();

        throw deleteError;
      }
    }, [
      fetchNotifications,
      user?.id,
    ]);

  return {
    notifications,
    unreadCount,
    loading,
    error,

    refreshNotifications:
      fetchNotifications,

    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
  };
}

export default useNotifications;