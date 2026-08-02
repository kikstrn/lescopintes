import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../../../lib/supabase";

function normalizePresenceMember(value) {
  return {
    id:
      value.profileId ??
      value.profile_id ??
      value.id,
    nickname:
      value.nickname ??
      "Membre",
    initials:
      value.initials ??
      value.nickname
        ?.slice(0, 2)
        .toUpperCase() ??
      "CP",
    avatarUrl:
      value.avatarUrl ??
      value.avatar_url ??
      null,
    onlineAt:
      value.onlineAt ??
      value.online_at ??
      null,
  };
}

export function useChatPresence(
  profile,
) {
  const [presenceState, setPresenceState] =
    useState({});

  useEffect(() => {
    if (!profile?.id) {
      setPresenceState({});
      return undefined;
    }

    const channel = supabase.channel(
      "group-chat-presence",
      {
        config: {
          presence: {
            key: String(profile.id),
          },
        },
      },
    );

    channel
      .on(
        "presence",
        {
          event: "sync",
        },
        () => {
          setPresenceState(
            channel.presenceState(),
          );
        },
      )
      .on(
        "presence",
        {
          event: "join",
        },
        () => {
          setPresenceState(
            channel.presenceState(),
          );
        },
      )
      .on(
        "presence",
        {
          event: "leave",
        },
        () => {
          setPresenceState(
            channel.presenceState(),
          );
        },
      )
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            profileId: profile.id,
            nickname:
              profile.nickname ??
              profile.firstName ??
              profile.first_name ??
              "Membre",
            initials:
              profile.initials ??
              profile.nickname
                ?.slice(0, 2)
                .toUpperCase() ??
              "CP",
            avatarUrl:
              profile.avatarUrl ??
              profile.avatar_url ??
              null,
            onlineAt:
              new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [
    profile?.id,
    profile?.nickname,
    profile?.firstName,
    profile?.first_name,
    profile?.initials,
    profile?.avatarUrl,
    profile?.avatar_url,
  ]);

  const onlineMembers = useMemo(() => {
    const membersById = new Map();

    Object.values(presenceState)
      .flat()
      .forEach((presence) => {
        const member =
          normalizePresenceMember(
            presence,
          );

        if (member.id) {
          membersById.set(
            String(member.id),
            member,
          );
        }
      });

    return Array.from(
      membersById.values(),
    ).sort((first, second) =>
      first.nickname.localeCompare(
        second.nickname,
        "fr",
      ),
    );
  }, [presenceState]);

  const onlineProfileIds = useMemo(
    () =>
      new Set(
        onlineMembers.map((member) =>
          String(member.id),
        ),
      ),
    [onlineMembers],
  );

  return {
    onlineMembers,
    onlineProfileIds,
    onlineCount:
      onlineMembers.length,
  };
}

export default useChatPresence;
