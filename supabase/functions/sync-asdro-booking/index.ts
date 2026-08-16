import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PROVIDER = "asdro";

function jsonResponse(
  body: unknown,
  status = 200,
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        "Content-Type":
          "application/json; charset=utf-8",
      },
    },
  );
}

function matchLabel(
  matchType: string | null,
) {
  return matchType === "DOUBLES"
    ? "Double"
    : matchType === "SINGLES"
      ? "Simple"
      : "Tennis";
}

type Payload = {
  provider?: string;
  externalBookingId?: string;
  organizerExternalMemberId?: string;
  participantExternalMemberIds?: string[];
  startsAt?: string;
  endsAt?: string;
  status?: string;
  matchType?: string | null;
  courtName?: string | null;
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse(
      { error: "Method not allowed" },
      405,
    );
  }

  const expectedSecret =
    Deno.env.get(
      "ASDRO_SYNC_SECRET",
    );

  if (
    !expectedSecret ||
    req.headers.get(
      "x-asdro-sync-secret",
    ) !== expectedSecret
  ) {
    return jsonResponse(
      { error: "Unauthorized" },
      401,
    );
  }

  const supabaseUrl =
    Deno.env.get("SUPABASE_URL");

  const serviceRoleKey =
    Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY",
    );

  if (
    !supabaseUrl ||
    !serviceRoleKey
  ) {
    return jsonResponse(
      {
        error:
          "Configuration Supabase serveur manquante.",
      },
      500,
    );
  }

  let payload: Payload;

  try {
    payload =
      await req.json();
  } catch {
    return jsonResponse(
      { error: "JSON invalide." },
      400,
    );
  }

  const provider =
    payload.provider ??
    PROVIDER;

  if (provider !== PROVIDER) {
    return jsonResponse(
      {
        error:
          "Provider non autorisé.",
      },
      400,
    );
  }

  const externalBookingId =
    String(
      payload.externalBookingId ??
      "",
    ).trim();

  const organizerExternalMemberId =
    String(
      payload.organizerExternalMemberId ??
      "",
    ).trim();

  if (
    !externalBookingId ||
    !organizerExternalMemberId
  ) {
    return jsonResponse(
      {
        error:
          "externalBookingId et organizerExternalMemberId sont obligatoires.",
      },
      400,
    );
  }

  const supabase =
    createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

  const {
    data: organizerLink,
    error: organizerError,
  } = await supabase
    .from(
      "external_member_links",
    )
    .select(
      "profile_id",
    )
    .eq(
      "provider",
      PROVIDER,
    )
    .eq(
      "external_member_id",
      organizerExternalMemberId,
    )
    .maybeSingle();

  if (organizerError) {
    return jsonResponse(
      {
        error:
          organizerError.message,
      },
      500,
    );
  }

  if (!organizerLink) {
    return jsonResponse(
      {
        error:
          "Le membre ASDRO organisateur n'est pas encore lié à un profil Les Co'Pintes.",
        missingOrganizerExternalMemberId:
          organizerExternalMemberId,
      },
      422,
    );
  }

  const organizerProfileId =
    organizerLink.profile_id;

  const {
    data: existingLink,
    error: existingLinkError,
  } = await supabase
    .from(
      "external_event_links",
    )
    .select(
      "event_id",
    )
    .eq(
      "provider",
      PROVIDER,
    )
    .eq(
      "external_booking_id",
      externalBookingId,
    )
    .maybeSingle();

  if (existingLinkError) {
    return jsonResponse(
      {
        error:
          existingLinkError.message,
      },
      500,
    );
  }

  const isCancelled =
    payload.status ===
    "CANCELLED";

  if (isCancelled) {
    if (!existingLink) {
      return jsonResponse({
        ok: true,
        action:
          "cancel-no-linked-event",
        externalBookingId,
      });
    }

    const {
      error: cancelError,
    } = await supabase
      .from("events")
      .update({
        status:
          "cancelled",
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        existingLink.event_id,
      );

    if (cancelError) {
      return jsonResponse(
        {
          error:
            cancelError.message,
        },
        500,
      );
    }

    return jsonResponse({
      ok: true,
      action: "cancelled",
      eventId:
        existingLink.event_id,
    });
  }

  if (
    !payload.startsAt ||
    !payload.endsAt
  ) {
    return jsonResponse(
      {
        error:
          "startsAt et endsAt sont obligatoires pour une réservation active.",
      },
      400,
    );
  }

  const label =
    matchLabel(
      payload.matchType ??
      null,
    );

  const eventPayload = {
    created_by:
      organizerProfileId,

    title:
      `🎾 Réservation tennis · ${label}`,

    description:
      "Créneau réservé automatiquement via ASDRO.",

    event_type:
      "tennis",

    location:
      payload.courtName ||
      "ASDRO",

    starts_at:
      payload.startsAt,

    ends_at:
      payload.endsAt,

    status:
      "confirmed",

    updated_at:
      new Date().toISOString(),
  };

  let eventId:
    string;

  let action:
    "created" | "updated";

  if (existingLink) {
    const {
      data: updated,
      error: updateError,
    } = await supabase
      .from("events")
      .update(
        eventPayload,
      )
      .eq(
        "id",
        existingLink.event_id,
      )
      .select("id")
      .single();

    if (updateError) {
      return jsonResponse(
        {
          error:
            updateError.message,
        },
        500,
      );
    }

    eventId =
      updated.id;
    action =
      "updated";
  } else {
    const {
      data: created,
      error: createError,
    } = await supabase
      .from("events")
      .insert(
        eventPayload,
      )
      .select("id")
      .single();

    if (createError) {
      return jsonResponse(
        {
          error:
            createError.message,
        },
        500,
      );
    }

    eventId =
      created.id;
    action =
      "created";

    const {
      error: linkError,
    } = await supabase
      .from(
        "external_event_links",
      )
      .insert({
        provider:
          PROVIDER,
        external_booking_id:
          externalBookingId,
        event_id:
          eventId,
        updated_at:
          new Date().toISOString(),
      });

    if (linkError) {
      await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      return jsonResponse(
        {
          error:
            linkError.message,
        },
        500,
      );
    }
  }

  /*
   * Participants synchronisés :
   * on retire uniquement ceux précédemment apportés par ASDRO.
   * Les participants ajoutés manuellement dans Les Co'Pintes sont conservés.
   */
  const {
    data: oldSyncedParticipants,
  } = await supabase
    .from(
      "external_event_participant_links",
    )
    .select(
      "profile_id",
    )
    .eq(
      "provider",
      PROVIDER,
    )
    .eq(
      "external_booking_id",
      externalBookingId,
    );

  const oldProfileIds =
    Array.from(
      new Set(
        (
          oldSyncedParticipants ??
          []
        )
          .map(
            (row) =>
              row.profile_id,
          )
          .filter(Boolean),
      ),
    );

  if (oldProfileIds.length) {
    await supabase
      .from(
        "event_participants",
      )
      .delete()
      .eq(
        "event_id",
        eventId,
      )
      .in(
        "profile_id",
        oldProfileIds,
      );
  }

  await supabase
    .from(
      "external_event_participant_links",
    )
    .delete()
    .eq(
      "provider",
      PROVIDER,
    )
    .eq(
      "external_booking_id",
      externalBookingId,
    );

  const externalMemberIds =
    Array.from(
      new Set([
        organizerExternalMemberId,
        ...(
          payload
            .participantExternalMemberIds ??
          []
        ),
      ]),
    )
      .map(String)
      .filter(Boolean);

  const {
    data: memberLinks,
    error: memberLinksError,
  } = await supabase
    .from(
      "external_member_links",
    )
    .select(
      "external_member_id, profile_id",
    )
    .eq(
      "provider",
      PROVIDER,
    )
    .in(
      "external_member_id",
      externalMemberIds,
    );

  if (memberLinksError) {
    return jsonResponse(
      {
        error:
          memberLinksError.message,
      },
      500,
    );
  }

  const linkByExternalId =
    new Map(
      (
        memberLinks ??
        []
      ).map(
        (row) => [
          row.external_member_id,
          row.profile_id,
        ],
      ),
    );

  const mapped =
    externalMemberIds
      .map(
        (externalMemberId) => ({
          externalMemberId,
          profileId:
            linkByExternalId.get(
              externalMemberId,
            ),
        }),
      )
      .filter(
        (
          row,
        ): row is {
          externalMemberId: string;
          profileId: string;
        } =>
          Boolean(
            row.profileId,
          ),
      );

  const unmappedParticipantIds =
    externalMemberIds.filter(
      (externalMemberId) =>
        !linkByExternalId.has(
          externalMemberId,
        ),
    );

  if (mapped.length) {
    const uniqueProfileIds =
      Array.from(
        new Set(
          mapped.map(
            (row) =>
              row.profileId,
          ),
        ),
      );

    const {
      error:
        participationError,
    } = await supabase
      .from(
        "event_participants",
      )
      .upsert(
        uniqueProfileIds.map(
          (profileId) => ({
            event_id:
              eventId,
            profile_id:
              profileId,
            attendance_status:
              "going",
          }),
        ),
        {
          onConflict:
            "event_id,profile_id",
        },
      );

    if (participationError) {
      return jsonResponse(
        {
          error:
            participationError.message,
        },
        500,
      );
    }

    const {
      error:
        externalParticipantsError,
    } = await supabase
      .from(
        "external_event_participant_links",
      )
      .insert(
        mapped.map(
          (row) => ({
            provider:
              PROVIDER,
            external_booking_id:
              externalBookingId,
            external_member_id:
              row.externalMemberId,
            profile_id:
              row.profileId,
          }),
        ),
      );

    if (
      externalParticipantsError
    ) {
      return jsonResponse(
        {
          error:
            externalParticipantsError.message,
        },
        500,
      );
    }
  }

  await supabase
    .from(
      "external_event_links",
    )
    .update({
      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "provider",
      PROVIDER,
    )
    .eq(
      "external_booking_id",
      externalBookingId,
    );

  return jsonResponse({
    ok: true,
    action,
    eventId,
    externalBookingId,
    mappedParticipants:
      mapped.length,
    unmappedParticipantIds,
  });
});
