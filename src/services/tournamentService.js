import { supabase } from "../lib/supabase";

import {
  recordTennisMatch,
} from "./tennisService";

const TOURNAMENTS_TABLE =
  "tennis_tournaments";

const PLAYERS_TABLE =
  "tennis_tournament_players";

const MATCHES_TABLE =
  "tennis_tournament_matches";

function normalizeProfile(profile) {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,

    firstName:
      profile.first_name ??
      profile.firstName ??
      null,

    nickname:
      profile.nickname ??
      profile.first_name ??
      "Membre",

    initials:
      profile.initials ??
      profile.nickname
        ?.slice(0, 2)
        .toUpperCase() ??
      "CP",

    avatarUrl:
      profile.avatar_url ??
      profile.avatarUrl ??
      null,

    elo:
      Number(
        profile.tennis_elo ??
        profile.elo ??
        1500,
      ),
  };
}

function normalizeTournamentPlayer(row) {
  return {
    id: row.id,

    tournamentId:
      row.tournament_id,

    profileId:
      row.profile_id,

    seed:
      Number(row.seed ?? 0),

    startingElo:
      Number(
        row.starting_elo ?? 1500,
      ),

    receivedBye:
      Boolean(
        row.received_bye,
      ),

    eliminatedAt:
      row.eliminated_at ?? null,

    finalPosition:
      row.final_position ?? null,

    createdAt:
      row.created_at,

    profile:
      normalizeProfile(
        row.profile,
      ),
  };
}

function normalizeTournamentMatch(row) {
  return {
    id: row.id,

    tournamentId:
      row.tournament_id,

    tennisMatchId:
      row.tennis_match_id ?? null,

    archivedTennisMatchId:
      row.archived_tennis_match_id ??
      null,

    resultLocked:
      Boolean(
        row.result_locked,
      ),

    correctionReason:
      row.correction_reason ??
      null,

    roundCode:
      row.round_code,

    roundNumber:
      Number(
        row.round_number ?? 0,
      ),

    position:
      Number(
        row.position ?? 0,
      ),

    playerOneId:
      row.player_one_id ?? null,

    playerTwoId:
      row.player_two_id ?? null,

    winnerId:
      row.winner_id ?? null,

    loserId:
      row.loser_id ?? null,

    nextMatchId:
      row.next_match_id ?? null,

    nextSlot:
      row.next_slot ?? null,

    status:
      row.status ?? "waiting",

    scheduledAt:
      row.scheduled_at ?? null,

    completedAt:
      row.completed_at ?? null,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,

    playerOne:
      normalizeProfile(
        row.playerOne,
      ),

    playerTwo:
      normalizeProfile(
        row.playerTwo,
      ),

    winner:
      normalizeProfile(
        row.winner,
      ),
  };
}

function normalizeTournament(
  row,
  players = [],
  matches = [],
) {
  return {
    id: row.id,
    name: row.name,
    description:
      row.description ?? "",

    status:
      row.status ?? "draft",

    generationMode:
      row.generation_mode ??
      "elo",

    playerCount:
      Number(
        row.player_count ?? 0,
      ),

    winnerProfileId:
      row.winner_profile_id ??
      null,

    createdBy:
      row.created_by,

    startsAt:
      row.starts_at ?? null,

    completedAt:
      row.completed_at ?? null,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,

    creator:
      normalizeProfile(
        row.creator,
      ),

    winner:
      normalizeProfile(
        row.winner,
      ),

    players:
      players
        .filter(
          (player) =>
            String(
              player.tournamentId,
            ) ===
            String(row.id),
        )
        .sort(
          (playerA, playerB) =>
            playerA.seed -
            playerB.seed,
        ),

    matches:
      matches
        .filter(
          (match) =>
            String(
              match.tournamentId,
            ) ===
            String(row.id),
        )
        .sort(
          (matchA, matchB) =>
            matchA.roundNumber -
              matchB.roundNumber ||
            matchA.position -
              matchB.position,
        ),
  };
}

export async function getTournaments() {
  const [
    tournamentsResult,
    playersResult,
    matchesResult,
  ] = await Promise.all([
    supabase
      .from(TOURNAMENTS_TABLE)
      .select(`
        *,
        creator:profiles!tennis_tournaments_created_by_fkey (
          id,
          first_name,
          nickname,
          initials,
          avatar_url,
          tennis_elo
        ),
        winner:profiles!tennis_tournaments_winner_profile_id_fkey (
          id,
          first_name,
          nickname,
          initials,
          avatar_url,
          tennis_elo
        )
      `)
      .order(
        "created_at",
        {
          ascending: false,
        },
      ),

    supabase
      .from(PLAYERS_TABLE)
      .select(`
        *,
        profile:profiles!tennis_tournament_players_profile_id_fkey (
          id,
          first_name,
          nickname,
          initials,
          avatar_url,
          tennis_elo
        )
      `)
      .order(
        "seed",
        {
          ascending: true,
        },
      ),

    supabase
      .from(MATCHES_TABLE)
      .select(`
        *,
        playerOne:profiles!tennis_tournament_matches_player_one_id_fkey (
          id,
          first_name,
          nickname,
          initials,
          avatar_url,
          tennis_elo
        ),
        playerTwo:profiles!tennis_tournament_matches_player_two_id_fkey (
          id,
          first_name,
          nickname,
          initials,
          avatar_url,
          tennis_elo
        ),
        winner:profiles!tennis_tournament_matches_winner_id_fkey (
          id,
          first_name,
          nickname,
          initials,
          avatar_url,
          tennis_elo
        )
      `)
      .order(
        "round_number",
        {
          ascending: true,
        },
      )
      .order(
        "position",
        {
          ascending: true,
        },
      ),
  ]);

  if (tournamentsResult.error) {
    throw tournamentsResult.error;
  }

  if (playersResult.error) {
    throw playersResult.error;
  }

  if (matchesResult.error) {
    throw matchesResult.error;
  }

  const players =
    (
      playersResult.data ?? []
    ).map(
      normalizeTournamentPlayer,
    );

  const matches =
    (
      matchesResult.data ?? []
    ).map(
      normalizeTournamentMatch,
    );

  return (
    tournamentsResult.data ?? []
  ).map(
    (row) =>
      normalizeTournament(
        row,
        players,
        matches,
      ),
  );
}

function shuffleItems(items) {
  const result = [...items];

  for (
    let index =
      result.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex =
      Math.floor(
        Math.random() *
          (index + 1),
      );

    [
      result[index],
      result[randomIndex],
    ] = [
      result[randomIndex],
      result[index],
    ];
  }

  return result;
}

async function getProfilesForSeeding(
  participantIds,
) {
  const { data, error } =
    await supabase
      .from("profiles")
      .select(`
        id,
        first_name,
        nickname,
        initials,
        avatar_url,
        tennis_elo
      `)
      .in(
        "id",
        participantIds,
      );

  if (error) {
    throw error;
  }

  if (
    (data ?? []).length !==
    participantIds.length
  ) {
    throw new Error(
      "Un ou plusieurs participants sont introuvables.",
    );
  }

  return data ?? [];
}

export async function createTournament({
  name,
  description = "",
  generationMode = "elo",
  participantIds = [],
  createdBy,
  startsAt = null,
}) {
  const cleanName =
    name?.trim();

  const uniqueParticipantIds =
    Array.from(
      new Set(
        participantIds.filter(
          Boolean,
        ),
      ),
    );

  if (!cleanName) {
    throw new Error(
      "Le nom du tournoi est obligatoire.",
    );
  }

  if (!createdBy) {
    throw new Error(
      "Créateur du tournoi introuvable.",
    );
  }

  if (
    uniqueParticipantIds.length !== 5
  ) {
    throw new Error(
      "Le tournoi doit contenir exactement 5 joueurs.",
    );
  }

  const profiles =
    await getProfilesForSeeding(
      uniqueParticipantIds,
    );

  const seededProfiles =
    generationMode === "random"
      ? shuffleItems(profiles)
      : [...profiles].sort(
          (
            profileA,
            profileB,
          ) =>
            Number(
              profileB.tennis_elo ??
                1500,
            ) -
            Number(
              profileA.tennis_elo ??
                1500,
            ),
        );

  const {
    data: tournament,
    error: tournamentError,
  } = await supabase
    .from(TOURNAMENTS_TABLE)
    .insert({
      name:
        cleanName,

      description:
        description?.trim() ||
        null,

      generation_mode:
        generationMode,

      player_count:
        5,

      created_by:
        createdBy,

      starts_at:
        startsAt || null,

      status:
        "draft",
    })
    .select("*")
    .single();

  if (tournamentError) {
    throw tournamentError;
  }

  const playerRows =
    seededProfiles.map(
      (profile, index) => ({
        tournament_id:
          tournament.id,

        profile_id:
          profile.id,

        seed:
          index + 1,

        starting_elo:
          Number(
            profile.tennis_elo ??
              1500,
          ),
      }),
    );

  const {
    error: playersError,
  } = await supabase
    .from(PLAYERS_TABLE)
    .insert(playerRows);

  if (playersError) {
    await supabase
      .from(TOURNAMENTS_TABLE)
      .delete()
      .eq(
        "id",
        tournament.id,
      );

    throw playersError;
  }

  const {
    error: generationError,
  } = await supabase.rpc(
    "generate_five_player_tournament",
    {
      p_tournament_id:
        tournament.id,
    },
  );

  if (generationError) {
    await supabase
      .from(TOURNAMENTS_TABLE)
      .delete()
      .eq(
        "id",
        tournament.id,
      );

    throw generationError;
  }

  const tournaments =
    await getTournaments();

  return (
    tournaments.find(
      (item) =>
        String(item.id) ===
        String(tournament.id),
    ) ?? null
  );
}

export async function cancelTournament(
  tournamentId,
) {
  if (!tournamentId) {
    throw new Error(
      "Tournoi introuvable.",
    );
  }

  const { error } =
    await supabase
      .from(TOURNAMENTS_TABLE)
      .update({
        status:
          "cancelled",

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        tournamentId,
      );

  if (error) {
    throw error;
  }
}

export async function deleteTournament(
  tournamentId,
) {
  if (!tournamentId) {
    throw new Error(
      "Tournoi introuvable.",
    );
  }

  const { error } =
    await supabase
      .from(TOURNAMENTS_TABLE)
      .delete()
      .eq(
        "id",
        tournamentId,
      );

  if (error) {
    throw error;
  }
}


export async function recordTournamentMatch({
  tournamentMatchId,
  playerOneId,
  playerTwoId,
  sets,
  playedAt,
  notes = "",
}) {
  if (!tournamentMatchId) {
    throw new Error(
      "Match du tournoi introuvable.",
    );
  }

  if (
    !playerOneId ||
    !playerTwoId
  ) {
    throw new Error(
      "Les deux joueurs du match sont obligatoires.",
    );
  }

  const {
    data: tournamentMatch,
    error: tournamentMatchError,
  } = await supabase
    .from(MATCHES_TABLE)
    .select(`
      id,
      tournament_id,
      player_one_id,
      player_two_id,
      status,
      tennis_match_id
    `)
    .eq(
      "id",
      tournamentMatchId,
    )
    .single();

  if (tournamentMatchError) {
    throw tournamentMatchError;
  }

  if (
    tournamentMatch.status !==
    "ready"
  ) {
    throw new Error(
      "Ce match n’est pas prêt à être joué.",
    );
  }

  if (
    tournamentMatch.tennis_match_id
  ) {
    throw new Error(
      "Le résultat de ce match a déjà été enregistré.",
    );
  }

  const expectedPlayers =
    [
      tournamentMatch.player_one_id,
      tournamentMatch.player_two_id,
    ]
      .map(String)
      .sort();

  const submittedPlayers =
    [
      playerOneId,
      playerTwoId,
    ]
      .map(String)
      .sort();

  if (
    expectedPlayers[0] !==
      submittedPlayers[0] ||
    expectedPlayers[1] !==
      submittedPlayers[1]
  ) {
    throw new Error(
      "Les joueurs sélectionnés ne correspondent pas au tableau.",
    );
  }

  const match =
    await recordTennisMatch({
      matchType: "single",
      playerOneId,
      playerTwoId,
      playerThreeId: null,
      playerFourId: null,
      sets,
      playedAt,
      notes:
        [
          notes?.trim(),
          `Tournoi ${tournamentMatch.tournament_id}`,
        ]
          .filter(Boolean)
          .join(" — "),
    });

  if (!match?.id) {
    throw new Error(
      "Le match de tennis n’a pas pu être créé.",
    );
  }

  const {
    error: completionError,
  } = await supabase.rpc(
    "complete_tennis_tournament_match",
    {
      p_tournament_match_id:
        tournamentMatchId,

      p_tennis_match_id:
        match.id,
    },
  );

  if (completionError) {
    throw new Error(
      `Le match a été enregistré, mais le tableau n’a pas pu avancer : ${completionError.message}`,
    );
  }

  const tournaments =
    await getTournaments();

  return {
    match,

    tournament:
      tournaments.find(
        (tournament) =>
          String(
            tournament.id,
          ) ===
          String(
            tournamentMatch.tournament_id,
          ),
      ) ?? null,
  };
}


export async function updateTournament({
  tournamentId,
  name,
  description = "",
  generationMode,
  startsAt = null,
}) {
  if (!tournamentId) {
    throw new Error(
      "Tournoi introuvable.",
    );
  }

  const cleanName =
    name?.trim();

  if (!cleanName) {
    throw new Error(
      "Le nom du tournoi est obligatoire.",
    );
  }

  const updatePayload = {
    name: cleanName,
    description:
      description?.trim() ||
      null,
    starts_at:
      startsAt || null,
    updated_at:
      new Date().toISOString(),
  };

  if (generationMode) {
    updatePayload.generation_mode =
      generationMode;
  }

  const { error } =
    await supabase
      .from(TOURNAMENTS_TABLE)
      .update(updatePayload)
      .eq(
        "id",
        tournamentId,
      );

  if (error) {
    throw error;
  }
}

export async function regenerateTournament(
  tournamentId,
) {
  if (!tournamentId) {
    throw new Error(
      "Tournoi introuvable.",
    );
  }

  const { error } =
    await supabase.rpc(
      "regenerate_five_player_tournament",
      {
        p_tournament_id:
          tournamentId,
      },
    );

  if (error) {
    throw error;
  }
}

export async function updateTournamentSeeds({
  tournamentId,
  orderedProfileIds,
}) {
  if (!tournamentId) {
    throw new Error(
      "Tournoi introuvable.",
    );
  }

  if (
    !Array.isArray(
      orderedProfileIds,
    ) ||
    orderedProfileIds.length !== 5
  ) {
    throw new Error(
      "Il faut exactement 5 joueurs.",
    );
  }

  const { error } =
    await supabase.rpc(
      "update_tennis_tournament_seeds",
      {
        p_tournament_id:
          tournamentId,
        p_profile_ids:
          orderedProfileIds,
      },
    );

  if (error) {
    throw error;
  }
}

export async function duplicateTournament({
  tournamentId,
  createdBy,
}) {
  if (!tournamentId) {
    throw new Error(
      "Tournoi introuvable.",
    );
  }

  if (!createdBy) {
    throw new Error(
      "Créateur introuvable.",
    );
  }

  const tournaments =
    await getTournaments();

  const source =
    tournaments.find(
      (tournament) =>
        String(
          tournament.id,
        ) ===
        String(
          tournamentId,
        ),
    );

  if (!source) {
    throw new Error(
      "Tournoi source introuvable.",
    );
  }

  return createTournament({
    name:
      `${source.name} (copie)`,

    description:
      source.description,

    generationMode:
      source.generationMode,

    participantIds:
      source.players
        .sort(
          (playerA, playerB) =>
            playerA.seed -
            playerB.seed,
        )
        .map(
          (player) =>
            player.profileId,
        ),

    createdBy,

    startsAt: null,
  });
}


function normalizeTournamentMatchHistory(row) {
  return {
    id: row.id,

    tournamentMatchId:
      row.tournament_match_id,

    tournamentId:
      row.tournament_id,

    action:
      row.action,

    previousData:
      row.previous_data ?? {},

    newData:
      row.new_data ?? {},

    note:
      row.note ?? "",

    createdBy:
      row.created_by ?? null,

    createdAt:
      row.created_at,

    author:
      normalizeProfile(
        row.author,
      ),
  };
}

export async function getTournamentMatchHistory(
  tournamentMatchId,
) {
  if (!tournamentMatchId) {
    throw new Error(
      "Match du tournoi introuvable.",
    );
  }

  const { data, error } =
    await supabase
      .from(
        "tennis_tournament_match_history",
      )
      .select(`
        id,
        tournament_match_id,
        tournament_id,
        action,
        previous_data,
        new_data,
        note,
        created_by,
        created_at,

        author:profiles!tennis_tournament_match_history_created_by_fkey (
          id,
          first_name,
          nickname,
          initials,
          avatar_url,
          tennis_elo
        )
      `)
      .eq(
        "tournament_match_id",
        tournamentMatchId,
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      );

  if (error) {
    throw error;
  }

  return (data ?? []).map(
    normalizeTournamentMatchHistory,
  );
}


export async function resetTournamentMatchResult({
  tournamentMatchId,
  mode = "cancel",
  reason = "",
}) {
  if (!tournamentMatchId) {
    throw new Error(
      "Match du tournoi introuvable.",
    );
  }

  if (
    mode !== "cancel" &&
    mode !== "replay"
  ) {
    throw new Error(
      "Mode de réinitialisation invalide.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "reset_tennis_tournament_match_result",
      {
        p_tournament_match_id:
          tournamentMatchId,

        p_mode:
          mode,

        p_reason:
          reason?.trim() ||
          null,
      },
    );

  if (error) {
    throw error;
  }

  return data ?? null;
}


export async function getTournamentMatchResetImpact(
  tournamentMatchId,
) {
  if (!tournamentMatchId) {
    throw new Error(
      "Match du tournoi introuvable.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "get_tennis_tournament_reset_impact",
      {
        p_tournament_match_id:
          tournamentMatchId,
      },
    );

  if (error) {
    throw error;
  }

  return {
    affectedMatchCount:
      Number(
        data?.affected_match_count ??
        0,
      ),

    completedMatchCount:
      Number(
        data?.completed_match_count ??
        0,
      ),

    championWillBeRemoved:
      Boolean(
        data?.champion_will_be_removed,
      ),

    affectedMatches:
      Array.isArray(
        data?.affected_matches,
      )
        ? data.affected_matches
        : [],
  };
}

export async function resetTournamentMatchBranch({
  tournamentMatchId,
  mode = "cancel",
  reason = "",
}) {
  if (!tournamentMatchId) {
    throw new Error(
      "Match du tournoi introuvable.",
    );
  }

  if (
    mode !== "cancel" &&
    mode !== "replay"
  ) {
    throw new Error(
      "Mode de réinitialisation invalide.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "reset_tennis_tournament_match_branch",
      {
        p_tournament_match_id:
          tournamentMatchId,

        p_mode:
          mode,

        p_reason:
          reason?.trim() ||
          null,
      },
    );

  if (error) {
    throw error;
  }

  return data ?? null;
}


export async function getArchivedTournamentMatchResult(
  tournamentMatchId,
) {
  if (!tournamentMatchId) {
    throw new Error(
      "Match du tournoi introuvable.",
    );
  }

  const {
    data: tournamentMatch,
    error: tournamentMatchError,
  } = await supabase
    .from(MATCHES_TABLE)
    .select(`
      id,
      archived_tennis_match_id,
      player_one_id,
      player_two_id
    `)
    .eq(
      "id",
      tournamentMatchId,
    )
    .single();

  if (tournamentMatchError) {
    throw tournamentMatchError;
  }

  if (
    !tournamentMatch
      .archived_tennis_match_id
  ) {
    return null;
  }

  const {
    data: tennisMatch,
    error: tennisMatchError,
  } = await supabase
    .from("tennis_matches")
    .select(`
      id,
      match_type,
      played_at,
      notes,
      player_one_id,
      player_two_id,

      sets:tennis_sets (
        id,
        set_number,
        team_one_score,
        team_two_score
      )
    `)
    .eq(
      "id",
      tournamentMatch
        .archived_tennis_match_id,
    )
    .single();

  if (tennisMatchError) {
    throw tennisMatchError;
  }

  return {
    id:
      tennisMatch.id,

    matchType:
      tennisMatch.match_type,

    playedAt:
      tennisMatch.played_at,

    notes:
      tennisMatch.notes ?? "",

    playerOneId:
      tennisMatch.player_one_id,

    playerTwoId:
      tennisMatch.player_two_id,

    sets:
      [...(
        tennisMatch.sets ?? []
      )]
        .sort(
          (setA, setB) =>
            setA.set_number -
            setB.set_number,
        )
        .map(
          (set) => ({
            teamOne:
              Number(
                set.team_one_score,
              ),

            teamTwo:
              Number(
                set.team_two_score,
              ),
          }),
        ),
  };
}

export async function getPendingTournamentCorrection(
  tournamentMatchId,
) {
  if (!tournamentMatchId) {
    return null;
  }

  const { data, error } =
    await supabase
      .from(
        "tennis_tournament_match_corrections",
      )
      .select(`
        id,
        tournament_match_id,
        tournament_id,
        archived_tennis_match_id,
        player_one_id,
        player_two_id,
        sets,
        played_at,
        notes,
        reason,
        status,
        created_by,
        created_at,
        updated_at
      `)
      .eq(
        "tournament_match_id",
        tournamentMatchId,
      )
      .eq(
        "status",
        "pending",
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,

    tournamentMatchId:
      data.tournament_match_id,

    tournamentId:
      data.tournament_id,

    archivedTennisMatchId:
      data.archived_tennis_match_id,

    playerOneId:
      data.player_one_id,

    playerTwoId:
      data.player_two_id,

    sets:
      Array.isArray(data.sets)
        ? data.sets
        : [],

    playedAt:
      data.played_at,

    notes:
      data.notes ?? "",

    reason:
      data.reason ?? "",

    status:
      data.status,

    createdBy:
      data.created_by,

    createdAt:
      data.created_at,

    updatedAt:
      data.updated_at,
  };
}

export async function savePendingTournamentCorrection({
  tournamentMatchId,
  playerOneId,
  playerTwoId,
  sets,
  playedAt,
  notes = "",
  reason = "",
}) {
  if (!tournamentMatchId) {
    throw new Error(
      "Match du tournoi introuvable.",
    );
  }

  if (
    !playerOneId ||
    !playerTwoId
  ) {
    throw new Error(
      "Les deux joueurs sont obligatoires.",
    );
  }

  if (
    !Array.isArray(sets) ||
    sets.length < 2
  ) {
    throw new Error(
      "Le score doit contenir au moins deux sets.",
    );
  }

  const formattedSets =
    sets.map(
      (set, index) => ({
        setNumber:
          index + 1,

        teamOne:
          Number(
            set.teamOne,
          ),

        teamTwo:
          Number(
            set.teamTwo,
          ),
      }),
    );

  const { data, error } =
    await supabase.rpc(
      "save_pending_tennis_tournament_correction",
      {
        p_tournament_match_id:
          tournamentMatchId,

        p_player_one_id:
          playerOneId,

        p_player_two_id:
          playerTwoId,

        p_sets:
          formattedSets,

        p_played_at:
          playedAt ||
          new Date().toISOString(),

        p_notes:
          notes?.trim() ||
          null,

        p_reason:
          reason?.trim() ||
          null,
      },
    );

  if (error) {
    throw error;
  }

  return data ?? null;
}

export async function discardPendingTournamentCorrection(
  tournamentMatchId,
) {
  if (!tournamentMatchId) {
    throw new Error(
      "Match du tournoi introuvable.",
    );
  }

  const { error } =
    await supabase.rpc(
      "discard_pending_tennis_tournament_correction",
      {
        p_tournament_match_id:
          tournamentMatchId,
      },
    );

  if (error) {
    throw error;
  }
}


export async function applyPendingTournamentCorrection({
  tournamentMatchId,
}) {
  if (!tournamentMatchId) {
    throw new Error(
      "Match du tournoi introuvable.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "apply_pending_tennis_tournament_correction_with_rewards",
      {
        p_tournament_match_id:
          tournamentMatchId,
      },
    );

  if (error) {
    throw error;
  }

  return {
    tournamentMatchId:
      data?.tournament_match_id ??
      tournamentMatchId,

    tennisMatchId:
      data?.tennis_match_id ??
      null,

    winnerId:
      data?.winner_id ??
      null,

    recalculatedMatchCount:
      Number(
        data?.recalculated_match_count ??
        0,
      ),

    excludedArchivedMatchCount:
      Number(
        data?.excluded_archived_match_count ??
        0,
      ),

    baselineElo:
      Number(
        data?.baseline_elo ??
        1500,
      ),

    pointsTransactionCount:
      Number(
        data?.points_transaction_count ??
        0,
      ),

    xpTransactionCount:
      Number(
        data?.xp_transaction_count ??
        0,
      ),

    refreshedProfileCount:
      Number(
        data?.refreshed_profile_count ??
        0,
      ),

    validTennisMatchCount:
      Number(
        data?.valid_tennis_match_count ??
        0,
      ),
  };
}


export async function resyncAllTennisRewards() {
  const { data, error } =
    await supabase.rpc(
      "resync_all_tennis_rewards",
    );

  if (error) {
    throw error;
  }

  return {
    pointsTransactionCount:
      Number(
        data?.points_transaction_count ??
        0,
      ),

    xpTransactionCount:
      Number(
        data?.xp_transaction_count ??
        0,
      ),

    refreshedProfileCount:
      Number(
        data?.refreshed_profile_count ??
        0,
      ),

    validTennisMatchCount:
      Number(
        data?.valid_tennis_match_count ??
        0,
      ),
  };
}


export async function getTennisTournamentDiagnostics(
  tournamentId,
) {
  if (!tournamentId) {
    throw new Error(
      "Tournoi introuvable.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "get_tennis_tournament_diagnostics",
      {
        p_tournament_id:
          tournamentId,
      },
    );

  if (error) {
    throw error;
  }

  return {
    tournamentId:
      data?.tournament_id ??
      tournamentId,

    status:
      data?.status ??
      "unknown",

    totalMatches:
      Number(
        data?.total_matches ??
        0,
      ),

    completedMatches:
      Number(
        data?.completed_matches ??
        0,
      ),

    readyMatches:
      Number(
        data?.ready_matches ??
        0,
      ),

    waitingMatches:
      Number(
        data?.waiting_matches ??
        0,
      ),

    lockedMatches:
      Number(
        data?.locked_matches ??
        0,
      ),

    pendingCorrections:
      Number(
        data?.pending_corrections ??
        0,
      ),

    orphanedResults:
      Number(
        data?.orphaned_results ??
        0,
      ),

    invalidWinnerLinks:
      Number(
        data?.invalid_winner_links ??
        0,
      ),

    missingPlayers:
      Number(
        data?.missing_players ??
        0,
      ),

    championIsValid:
      Boolean(
        data?.champion_is_valid,
      ),

    health:
      data?.health ??
      "warning",

    checkedAt:
      data?.checked_at ??
      new Date().toISOString(),
  };
}
