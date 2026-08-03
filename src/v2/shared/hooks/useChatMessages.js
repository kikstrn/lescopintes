import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "../../../lib/supabase";

import {
  deleteChatMessage,
  getChatMessageById,
  getChatMessages,
  sendChatMessage,
  toggleChatReaction,
  updateChatMessage,
} from "../../../services/chatService";

function sortMessages(items) {
  return [...items].sort(
    (messageA, messageB) =>
      new Date(
        messageA.createdAt,
      ).getTime() -
      new Date(
        messageB.createdAt,
      ).getTime(),
  );
}

export function useChatMessages(
  currentProfileId,
) {
  const [messages, setMessages] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState(null);

  const fetchMessages =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const rows =
          await getChatMessages({
            limit: 100,
          });

        setMessages(
          sortMessages(rows),
        );
      } catch (requestError) {
        console.error(
          "Impossible de charger le chat :",
          requestError,
        );

        setError(
          requestError?.message ??
            "Impossible de charger le chat.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const channel = supabase
      .channel(
        "group-chat-messages",
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table:
            "chat_messages",
        },
        async (payload) => {
          try {
            const message =
              await getChatMessageById(
                payload.new.id,
              );

            if (!message) {
              return;
            }

            setMessages(
              (currentMessages) => {
                const exists =
                  currentMessages.some(
                    (item) =>
                      item.id ===
                      message.id,
                  );

                if (exists) {
                  return currentMessages;
                }

                return sortMessages([
                  ...currentMessages,
                  message,
                ]);
              },
            );
          } catch (requestError) {
            console.error(
              "Impossible d’ajouter le nouveau message :",
              requestError,
            );
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table:
            "chat_messages",
        },
        async (payload) => {
          try {
            const message =
              await getChatMessageById(
                payload.new.id,
              );

            if (!message) {
              return;
            }

            setMessages(
              (currentMessages) =>
                currentMessages.map(
                  (item) =>
                    item.id ===
                    message.id
                      ? message
                      : item,
                ),
            );
          } catch (requestError) {
            console.error(
              "Impossible de mettre à jour le message :",
              requestError,
            );
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table:
            "chat_messages",
        },
        (payload) => {
          const deletedId =
            payload.old?.id;

          if (!deletedId) {
            return;
          }

          setMessages(
            (currentMessages) =>
              currentMessages.filter(
                (message) =>
                  message.id !==
                  deletedId,
              ),
          );
        },
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table:
            "chat_message_reactions",
        },
        async (payload) => {
          const messageId =
            payload.new?.message_id ??
            payload.old?.message_id;

          if (!messageId) {
            return;
          }

          try {
            const refreshedMessage =
              await getChatMessageById(
                messageId,
              );

            if (!refreshedMessage) {
              return;
            }

            setMessages(
              (currentMessages) =>
                currentMessages.map(
                  (message) =>
                    String(
                      message.id,
                    ) ===
                    String(
                      refreshedMessage.id,
                    )
                      ? refreshedMessage
                      : message,
                ),
            );
          } catch (requestError) {
            console.error(
              "Impossible de mettre à jour les réactions :",
              requestError,
            );
          }
        },
      )
      .subscribe((status) => {
        if (
          status ===
          "CHANNEL_ERROR"
        ) {
          console.error(
            "Erreur Realtime du chat.",
          );
        }
      });

    return () => {
      supabase.removeChannel(
        channel,
      );
    };
  }, []);

  const sendMessage =
    useCallback(
      async ({
        content,
        replyToId = null,
      }) => {
        if (!currentProfileId) {
          throw new Error(
            "Utilisateur connecté introuvable.",
          );
        }

        setSending(true);
        setError(null);

        try {
          const createdMessage =
            await sendChatMessage({
              profileId:
                currentProfileId,
              content,
              replyToId,
            });

          if (createdMessage) {
            setMessages(
              (currentMessages) => {
                const alreadyExists =
                  currentMessages.some(
                    (message) =>
                      String(
                        message.id,
                      ) ===
                      String(
                        createdMessage.id,
                      ),
                  );

                if (alreadyExists) {
                  return currentMessages;
                }

                return sortMessages([
                  ...currentMessages,
                  createdMessage,
                ]);
              },
            );
          }

          return createdMessage;
        } catch (requestError) {
          setError(
            requestError?.message ??
              "Impossible d’envoyer le message.",
          );

          throw requestError;
        } finally {
          setSending(false);
        }
      },
      [currentProfileId],
    );

  const editMessage =
    useCallback(
      async ({
        messageId,
        content,
      }) => {
        setSending(true);
        setError(null);

        try {
          return await updateChatMessage({
            messageId,
            content,
          });
        } catch (requestError) {
          setError(
            requestError?.message ??
              "Impossible de modifier le message.",
          );

          throw requestError;
        } finally {
          setSending(false);
        }
      },
      [],
    );

  const removeMessage =
    useCallback(
      async (messageId) => {
        setSending(true);
        setError(null);

        try {
          await deleteChatMessage(
            messageId,
          );
        } catch (requestError) {
          setError(
            requestError?.message ??
              "Impossible de supprimer le message.",
          );

          throw requestError;
        } finally {
          setSending(false);
        }
      },
      [],
    );


  const reactToMessage =
    useCallback(
      async ({
        messageId,
        emoji,
      }) => {
        if (!currentProfileId) {
          throw new Error(
            "Utilisateur connecté introuvable.",
          );
        }

        setError(null);

        try {
          await toggleChatReaction({
            messageId,
            profileId:
              currentProfileId,
            emoji,
          });

          /*
           * Mise à jour immédiate sur l’appareil
           * qui a ajouté ou retiré la réaction.
           * Realtime synchronise les autres membres.
           */
          const refreshedMessage =
            await getChatMessageById(
              messageId,
            );

          if (refreshedMessage) {
            setMessages(
              (currentMessages) =>
                currentMessages.map(
                  (message) =>
                    String(
                      message.id,
                    ) ===
                    String(
                      messageId,
                    )
                      ? refreshedMessage
                      : message,
                ),
            );
          }

          return refreshedMessage;
        } catch (requestError) {
          setError(
            requestError?.message ??
              "Impossible de modifier la réaction.",
          );

          throw requestError;
        }
      },
      [currentProfileId],
    );

  return {
    messages,
    loading,
    sending,
    error,

    sendMessage,
    editMessage,
    removeMessage,
    reactToMessage,

    refreshMessages:
      fetchMessages,
  };
}

export default useChatMessages;