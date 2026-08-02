import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "../../../lib/supabase";

export function useChatUnreadCount(
  profileId,
) {
  const [unreadCount, setUnreadCount] =
    useState(0);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState(null);

  const refreshUnreadCount =
    useCallback(async () => {
      if (!profileId) {
        setUnreadCount(0);
        setLoading(false);
        return 0;
      }

      setError(null);

      try {
        const {
          data: readStatus,
          error: statusError,
        } = await supabase
          .from("chat_read_status")
          .select("last_read_at")
          .eq("profile_id", profileId)
          .maybeSingle();

        if (statusError) {
          throw statusError;
        }

        const lastReadAt =
          readStatus?.last_read_at ??
          "1970-01-01T00:00:00.000Z";

        const {
          count,
          error: countError,
        } = await supabase
          .from("chat_messages")
          .select("id", {
            count: "exact",
            head: true,
          })
          .neq("profile_id", profileId)
          .gt("created_at", lastReadAt);

        if (countError) {
          throw countError;
        }

        const nextCount = count ?? 0;
        setUnreadCount(nextCount);
        return nextCount;
      } catch (requestError) {
        console.error(
          "Impossible de charger les messages non lus :",
          requestError,
        );
        setError(
          requestError?.message ??
            "Impossible de charger les messages non lus.",
        );
        return 0;
      } finally {
        setLoading(false);
      }
    }, [profileId]);

  const markChatAsRead =
    useCallback(async () => {
      if (!profileId) {
        return;
      }

      const now =
        new Date().toISOString();

      const { error: upsertError } =
        await supabase
          .from("chat_read_status")
          .upsert(
            {
              profile_id: profileId,
              last_read_at: now,
              updated_at: now,
            },
            {
              onConflict: "profile_id",
            },
          );

      if (upsertError) {
        console.error(
          "Impossible de marquer le chat comme lu :",
          upsertError,
        );
        throw upsertError;
      }

      setUnreadCount(0);
    }, [profileId]);

  useEffect(() => {
    setLoading(true);
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (!profileId) {
      return undefined;
    }

    const channel = supabase
      .channel(
        `chat-unread-${profileId}`,
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          if (
            String(
              payload.new?.profile_id,
            ) !== String(profileId)
          ) {
            refreshUnreadCount();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    profileId,
    refreshUnreadCount,
  ]);

  return {
    unreadCount,
    loading,
    error,
    markChatAsRead,
    refreshUnreadCount,
  };
}

export default useChatUnreadCount;
