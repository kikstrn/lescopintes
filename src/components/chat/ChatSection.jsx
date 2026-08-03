import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Check,
  Edit3,
  MessageCircle,
  MoreHorizontal,
  Send,
  Smile,
  SmilePlus,
  Trash2,
  Users,
  X,
} from "lucide-react";

import EmojiPicker from "./EmojiPicker";

const QUICK_REACTIONS = [
  "👍",
  "❤️",
  "😂",
  "🔥",
  "🎾",
];

function formatMessageDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(new Date(value));
}

function ChatSection({
  currentProfile,
  messages = [],
  onlineMembers = [],
  onlineProfileIds = new Set(),
  loading = false,
  sending = false,
  error = null,
  onSend,
  onEdit,
  onDelete,
  onToggleReaction,
}) {
  const [content, setContent] =
    useState("");
  const [editingMessageId, setEditingMessageId] =
    useState(null);
  const [editingContent, setEditingContent] =
    useState("");
  const [openMenuId, setOpenMenuId] =
    useState(null);
  const [messageToDelete, setMessageToDelete] =
    useState(null);

  const [composerEmojiOpen, setComposerEmojiOpen] =
    useState(false);

  const [reactionPickerMessageId, setReactionPickerMessageId] =
    useState(null);

  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const composerTextareaRef = useRef(null);

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (firstMessage, secondMessage) =>
          new Date(
            firstMessage.createdAt,
          ).getTime() -
          new Date(
            secondMessage.createdAt,
          ).getTime(),
      ),
    [messages],
  );

  useEffect(() => {
    messagesEndRef.current
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }, [sortedMessages.length]);

  useEffect(() => {
    const closeMenu = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target,
        )
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener(
      "pointerdown",
      closeMenu,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        closeMenu,
      );
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedContent =
      content.trim();

    if (!trimmedContent || sending) {
      return;
    }

    await onSend?.({
      content: trimmedContent,
    });
    setContent("");
  };

  const startEditing = (message) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
    setOpenMenuId(null);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const saveEditing = async (
    messageId,
  ) => {
    const trimmedContent =
      editingContent.trim();

    if (!trimmedContent || sending) {
      return;
    }

    await onEdit?.({
      messageId,
      content: trimmedContent,
    });
    cancelEditing();
  };

  const confirmDelete = async () => {
    if (!messageToDelete?.id || sending) {
      return;
    }

    await onDelete?.(
      messageToDelete.id,
    );
    setMessageToDelete(null);
  };

  const insertEmojiInComposer = (
    emoji,
  ) => {
    const textarea =
      composerTextareaRef.current;

    const selectionStart =
      textarea?.selectionStart ??
      content.length;

    const selectionEnd =
      textarea?.selectionEnd ??
      selectionStart;

    const nextContent = [
      content.slice(
        0,
        selectionStart,
      ),
      emoji,
      content.slice(
        selectionEnd,
      ),
    ].join("");

    setContent(nextContent);
    setComposerEmojiOpen(false);

    window.requestAnimationFrame(
      () => {
        textarea?.focus();

        const nextPosition =
          selectionStart +
          emoji.length;

        textarea?.setSelectionRange(
          nextPosition,
          nextPosition,
        );
      },
    );
  };

  const getReactionGroups = (
    message,
  ) => {
    const groups =
      new Map();

    for (
      const reaction
      of message.reactions ?? []
    ) {
      const emoji =
        reaction.emoji;

      if (!emoji) {
        continue;
      }

      const current =
        groups.get(emoji) ?? {
          emoji,
          count: 0,
          reactedByCurrentUser:
            false,
        };

      current.count += 1;

      if (
        String(
          reaction.profileId,
        ) ===
        String(
          currentProfile?.id,
        )
      ) {
        current.reactedByCurrentUser =
          true;
      }

      groups.set(
        emoji,
        current,
      );
    }

    return Array.from(
      groups.values(),
    );
  };

  const handleReaction = async (
    messageId,
    emoji,
  ) => {
    await onToggleReaction?.({
      messageId,
      emoji,
    });

    setReactionPickerMessageId(
      null,
    );
  };

  return (
    <section className="chat-page">
      <header className="chat-header glass-panel">
        <div>
          <span className="section-heading__eyebrow">
            Discussion
          </span>
          <h1>Chat des Co&apos;Pintes</h1>
          <p>
            Discutez ensemble en temps réel.
          </p>
        </div>

        <div className="chat-presence">
          <div className="chat-presence__summary">
            <span className="chat-presence__dot" />
            <Users size={17} />
            <strong>
              {onlineMembers.length}
            </strong>
            <span>
              en ligne
            </span>
          </div>

          <div className="chat-presence__avatars">
            {onlineMembers
              .slice(0, 6)
              .map((member) => (
                <span
                  key={member.id}
                  className="chat-presence__avatar"
                  title={`${member.nickname} est en ligne`}
                >
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt=""
                    />
                  ) : (
                    member.initials
                  )}
                  <i />
                </span>
              ))}

            {onlineMembers.length > 6 && (
              <span className="chat-presence__more">
                +{onlineMembers.length - 6}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="chat-panel glass-panel">
        <div className="chat-messages">
          {loading && (
            <div className="chat-state">
              Chargement des messages…
            </div>
          )}

          {!loading && error && (
            <div className="chat-state chat-state--error">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            sortedMessages.length === 0 && (
              <div className="chat-empty">
                <MessageCircle size={38} />
                <strong>Aucun message</strong>
                <p>
                  Sois le premier à écrire dans le chat.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            sortedMessages.map((message) => {
              const isCurrentUser =
                String(message.profileId) ===
                String(currentProfile?.id);
              const authorName =
                message.author?.nickname ??
                message.author?.firstName ??
                "Membre";
              const avatarUrl =
                message.author?.avatarUrl ??
                null;
              const initials =
                message.author?.initials ??
                authorName
                  .slice(0, 2)
                  .toUpperCase();
              const isEditing =
                editingMessageId ===
                message.id;
              const isOnline =
                onlineProfileIds.has(
                  String(message.profileId),
                );

              return (
                <article
                  key={message.id}
                  className={[
                    "chat-message",
                    isCurrentUser
                      ? "chat-message--mine"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="chat-message__avatar">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt=""
                      />
                    ) : (
                      initials
                    )}
                    {isOnline && <i />}
                  </div>

                  <div className="chat-message__body">
                    <header className="chat-message__header">
                      <strong>{authorName}</strong>

                      <div className="chat-message__meta">
                        <small>
                          {formatMessageDate(
                            message.createdAt,
                          )}
                          {message.editedAt
                            ? " · modifié"
                            : ""}
                        </small>

                        {isCurrentUser &&
                          !isEditing && (
                            <div
                              className="chat-message__menu-wrap"
                              ref={
                                openMenuId ===
                                message.id
                                  ? menuRef
                                  : null
                              }
                            >
                              <button
                                type="button"
                                className="chat-message__menu-button"
                                aria-label="Ouvrir les actions du message"
                                aria-expanded={
                                  openMenuId ===
                                  message.id
                                }
                                onClick={() =>
                                  setOpenMenuId(
                                    (current) =>
                                      current ===
                                      message.id
                                        ? null
                                        : message.id,
                                  )
                                }
                              >
                                <MoreHorizontal size={18} />
                              </button>

                              {openMenuId ===
                                message.id && (
                                <div
                                  className="chat-message__menu"
                                  role="menu"
                                >
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className="chat-message__menu-edit"
                                    onClick={() =>
                                      startEditing(
                                        message,
                                      )
                                    }
                                  >
                                    <span>
                                      <Edit3 size={16} />
                                    </span>

                                    <div>
                                      <strong>
                                        Modifier
                                      </strong>

                                      <small>
                                        Corriger ce message
                                      </small>
                                    </div>
                                  </button>

                                  <span className="chat-message__menu-divider" />

                                  <button
                                    type="button"
                                    role="menuitem"
                                    className="chat-message__menu-delete"
                                    onClick={() => {
                                      setMessageToDelete(
                                        message,
                                      );
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    <span>
                                      <Trash2 size={16} />
                                    </span>

                                    <div>
                                      <strong>
                                        Supprimer
                                      </strong>

                                      <small>
                                        Retirer définitivement
                                      </small>
                                    </div>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    </header>

                    {isEditing ? (
                      <div className="chat-message__edit">
                        <textarea
                          autoFocus
                          value={editingContent}
                          onChange={(event) =>
                            setEditingContent(
                              event.target.value,
                            )
                          }
                          maxLength={1000}
                        />

                        <div>
                          <button
                            type="button"
                            onClick={cancelEditing}
                          >
                            <X size={16} />
                            Annuler
                          </button>
                          <button
                            type="button"
                            className="chat-message__save"
                            disabled={sending}
                            onClick={() =>
                              saveEditing(
                                message.id,
                              )
                            }
                          >
                            <Check size={16} />
                            Enregistrer
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}

                    {!isEditing && (
                      <div className="chat-message__reactions-area">
                        {getReactionGroups(
                          message,
                        ).length > 0 && (
                          <div className="chat-message__reactions">
                            {getReactionGroups(
                              message,
                            ).map(
                              (reaction) => (
                                <button
                                  key={
                                    reaction.emoji
                                  }
                                  type="button"
                                  className={
                                    reaction.reactedByCurrentUser
                                      ? "chat-reaction chat-reaction--mine"
                                      : "chat-reaction"
                                  }
                                  aria-label={`${reaction.emoji} ${reaction.count} réaction${reaction.count > 1 ? "s" : ""}`}
                                  onClick={() =>
                                    handleReaction(
                                      message.id,
                                      reaction.emoji,
                                    )
                                  }
                                >
                                  <span>
                                    {reaction.emoji}
                                  </span>

                                  <strong>
                                    {reaction.count}
                                  </strong>
                                </button>
                              ),
                            )}
                          </div>
                        )}

                        <div className="chat-message__reaction-add">
                          <button
                            type="button"
                            className="chat-message__reaction-button"
                            aria-label="Ajouter une réaction"
                            aria-expanded={
                              reactionPickerMessageId ===
                              message.id
                            }
                            onClick={() =>
                              setReactionPickerMessageId(
                                (current) =>
                                  current ===
                                  message.id
                                    ? null
                                    : message.id,
                              )
                            }
                          >
                            <SmilePlus size={15} />
                          </button>

                          {reactionPickerMessageId ===
                            message.id && (
                            <div className="chat-message__reaction-popover">
                              <div className="chat-message__quick-reactions">
                                {QUICK_REACTIONS.map(
                                  (emoji) => (
                                    <button
                                      key={emoji}
                                      type="button"
                                      onClick={() =>
                                        handleReaction(
                                          message.id,
                                          emoji,
                                        )
                                      }
                                    >
                                      {emoji}
                                    </button>
                                  ),
                                )}
                              </div>

                              <EmojiPicker
                                open
                                compact
                                title="Réagir au message"
                                onClose={() =>
                                  setReactionPickerMessageId(
                                    null,
                                  )
                                }
                                onSelect={(emoji) =>
                                  handleReaction(
                                    message.id,
                                    emoji,
                                  )
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}

          <div ref={messagesEndRef} />
        </div>

        <form
          className="chat-composer chat-composer--with-emoji"
          onSubmit={handleSubmit}
        >
          <div className="chat-composer__emoji-wrap">
            <button
              type="button"
              className="chat-composer__emoji-button"
              aria-label="Ajouter un emoji"
              aria-expanded={
                composerEmojiOpen
              }
              onClick={() =>
                setComposerEmojiOpen(
                  (current) =>
                    !current,
                )
              }
            >
              <Smile size={20} />
            </button>

            <EmojiPicker
              open={
                composerEmojiOpen
              }
              title="Ajouter un emoji"
              onClose={() =>
                setComposerEmojiOpen(
                  false,
                )
              }
              onSelect={
                insertEmojiInComposer
              }
            />
          </div>

          <textarea
            ref={
              composerTextareaRef
            }
            placeholder="Écrire un message…"
            value={content}
            maxLength={1000}
            disabled={sending}
            onChange={(event) =>
              setContent(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                handleSubmit(event);
              }
            }}
          />

          <button
            type="submit"
            className="primary-button"
            disabled={
              sending || !content.trim()
            }
          >
            <Send size={18} />
            <span>Envoyer</span>
          </button>
        </form>
      </div>

      {messageToDelete && (
        <div
          className="chat-delete-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-delete-title"
        >
          <button
            type="button"
            className="chat-delete-modal__overlay"
            aria-label="Annuler"
            onClick={() =>
              setMessageToDelete(null)
            }
          />

          <section className="chat-delete-modal__card glass-panel">
            <span className="chat-delete-modal__icon">
              <Trash2 size={24} />
            </span>
            <h2 id="chat-delete-title">
              Supprimer ce message ?
            </h2>
            <p>
              Cette action est définitive. Le message ne pourra pas être récupéré.
            </p>
            <blockquote>
              {messageToDelete.content}
            </blockquote>
            <div className="chat-delete-modal__actions">
              <button
                type="button"
                onClick={() =>
                  setMessageToDelete(null)
                }
              >
                Annuler
              </button>
              <button
                type="button"
                className="chat-delete-modal__confirm"
                disabled={sending}
                onClick={confirmDelete}
              >
                <Trash2 size={16} />
                Supprimer
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

export default ChatSection;
