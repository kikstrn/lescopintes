import { supabase } from "../lib/supabase";

const CHAT_MESSAGE_SELECT = `
  id,
  profile_id,
  content,
  reply_to_id,
  edited_at,
  created_at,

  author:profiles!chat_messages_profile_id_fkey (
    id,
    first_name,
    nickname,
    initials,
    avatar_url,
    role
  )
`;

function normalizeAuthor(author) {
  if (!author) {
    return null;
  }

  return {
    id: author.id,
    firstName:
      author.first_name ?? null,
    nickname:
      author.nickname ?? "Membre",
    initials:
      author.initials ??
      author.nickname
        ?.slice(0, 2)
        .toUpperCase() ??
      "CP",
    avatarUrl:
      author.avatar_url ?? null,
    role:
      author.role ?? "member",
  };
}

export function normalizeChatMessage(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    profileId:
      row.profile_id,
    content:
      row.content ?? "",
    replyToId:
      row.reply_to_id ?? null,
    editedAt:
      row.edited_at ?? null,
    createdAt:
      row.created_at,
    author:
      normalizeAuthor(
        row.author,
      ),
  };
}

export async function getChatMessages({
  limit = 100,
} = {}) {
  const { data, error } =
    await supabase
      .from("chat_messages")
      .select(CHAT_MESSAGE_SELECT)
      .order("created_at", {
        ascending: true,
      })
      .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []).map(
    normalizeChatMessage,
  );
}

export async function getChatMessageById(
  messageId,
) {
  if (!messageId) {
    return null;
  }

  const { data, error } =
    await supabase
      .from("chat_messages")
      .select(CHAT_MESSAGE_SELECT)
      .eq("id", messageId)
      .single();

  if (error) {
    throw error;
  }

  return normalizeChatMessage(data);
}

export async function sendChatMessage({
  profileId,
  content,
  replyToId = null,
}) {
  const trimmedContent =
    content?.trim();

  if (!profileId) {
    throw new Error(
      "Profil utilisateur introuvable.",
    );
  }

  if (!trimmedContent) {
    throw new Error(
      "Le message ne peut pas être vide.",
    );
  }

  const { data, error } =
    await supabase
      .from("chat_messages")
      .insert({
        profile_id:
          profileId,
        content:
          trimmedContent,
        reply_to_id:
          replyToId,
      })
      .select(CHAT_MESSAGE_SELECT)
      .single();

  if (error) {
    throw error;
  }

  return normalizeChatMessage(data);
}

export async function updateChatMessage({
  messageId,
  content,
}) {
  const trimmedContent =
    content?.trim();

  if (!messageId) {
    throw new Error(
      "Message introuvable.",
    );
  }

  if (!trimmedContent) {
    throw new Error(
      "Le message ne peut pas être vide.",
    );
  }

  const { data, error } =
    await supabase
      .from("chat_messages")
      .update({
        content:
          trimmedContent,
        edited_at:
          new Date().toISOString(),
      })
      .eq("id", messageId)
      .select(CHAT_MESSAGE_SELECT)
      .single();

  if (error) {
    throw error;
  }

  return normalizeChatMessage(data);
}

export async function deleteChatMessage(
  messageId,
) {
  if (!messageId) {
    throw new Error(
      "Message introuvable.",
    );
  }

  const { error } =
    await supabase
      .from("chat_messages")
      .delete()
      .eq("id", messageId);

  if (error) {
    throw error;
  }
}