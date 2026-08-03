import {
  useEffect,
} from "react";

import ChatSection from "../../components/chat/ChatSection";
import { useAppData } from "../context/AppDataContext";

function ChatPage() {
  const {
    personalProfile,
    chatMessages = [],
    chatOnlineMembers = [],
    chatOnlineProfileIds = new Set(),
    chatLoading = false,
    chatSending = false,
    chatError = null,
    markChatAsRead,
    sendChatMessage,
    editChatMessage,
    deleteChatMessage,
    toggleChatReaction,
  } = useAppData();

  useEffect(() => {
    markChatAsRead?.();
  }, [
    markChatAsRead,
    chatMessages.length,
  ]);

  return (
    <ChatSection
      currentProfile={personalProfile}
      messages={chatMessages}
      onlineMembers={chatOnlineMembers}
      onlineProfileIds={
        chatOnlineProfileIds
      }
      loading={chatLoading}
      sending={chatSending}
      error={chatError}
      onSend={sendChatMessage}
      onEdit={editChatMessage}
      onDelete={deleteChatMessage}
      onToggleReaction={
        toggleChatReaction
      }
    />
  );
}

export default ChatPage;
