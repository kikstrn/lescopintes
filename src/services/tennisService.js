import { supabase } from "../lib/supabase";

const MATCH_SELECT = `
  id,
  created_by,
  match_type,
  played_at,
  player_one_id,
  player_two_id,
  player_three_id,
  player_four_id,
  winner_team,
  elo_processed,
  notes,
  created_at,

  creator:profiles!tennis_matches_created_by_fkey (
    id,
    nickname,
    initials
  ),

  playerOne:profiles!tennis_matches_player_one_id_fkey (
    id,
    first_name,
    nickname,
    initials,
    tennis_elo
  ),

  playerTwo:profiles!tennis_matches_player_two_id_fkey (
    id,
    first_name,
    nickname,
    initials,
    tennis_elo
  ),

  playerThree:profiles!tennis_matches_player_three_id_fkey (
    id,
    first_name,
    nickname,
    initials,
    tennis_elo
    ),

    playerFour:profiles!tennis_matches_player_four_id_fkey (
    id,
    first_name,
    nickname,
    initials,
    tennis_elo
    ),

  sets:tennis_sets (
    id,
    set_number,
    team_one_score,
    team_two_score
  )
`;

function mapPlayer(player) {
  if (!player) {
    return null;
  }

  return {
    id: player.id,
    firstName: player.first_name,
    nickname: player.nickname,
    initials:
      player.initials ??
      player.nickname?.slice(0, 2).toUpperCase() ??
      "CP",
    elo: player.tennis_elo ?? 1500,
  };
}

export function mapTennisMatch(match) {
  if (!match) {
    return null;
  }

  const sets = [...(match.sets ?? [])]
    .sort(
      (setA, setB) =>
        setA.set_number - setB.set_number,
    )
    .map((set) => ({
      id: set.id,
      setNumber: set.set_number,
      playerOne: set.team_one_score,
      playerTwo: set.team_two_score,
    }));

  const playerOne = mapPlayer(match.playerOne);
  const playerTwo = mapPlayer(match.playerTwo);
  const playerThree = mapPlayer(match.playerThree);
  const playerFour = mapPlayer(match.playerFour);

  const playerOneSets = sets.filter(
    (set) => set.playerOne > set.playerTwo,
  ).length;

  const playerTwoSets = sets.filter(
    (set) => set.playerTwo > set.playerOne,
  ).length;

  return {
    id: match.id,
    createdBy: match.created_by,
    matchType: match.match_type,
    playedAt: match.played_at,
    playerOne,
    playerTwo,
    playerThree,
    playerFour,

    teamOne:
    match.match_type === "double"
        ? [playerOne, playerTwo]
        : [playerOne],

    teamTwo:
    match.match_type === "double"
        ? [playerThree, playerFour]
        : [playerTwo],
    winnerTeam: match.winner_team,
    winner:
      match.winner_team === 1
        ? playerOne
        : playerTwo,
    loser:
      match.winner_team === 1
        ? playerTwo
        : playerOne,
    playerOneSets,
    playerTwoSets,
    sets,
    notes: match.notes ?? "",
    eloProcessed: match.elo_processed,
    creator: match.creator
      ? {
          id: match.creator.id,
          nickname: match.creator.nickname,
          initials: match.creator.initials,
        }
      : null,
    createdAt: match.created_at,
  };
}

export async function getTennisMatches() {
  const { data, error } = await supabase
    .from("tennis_matches")
    .select(MATCH_SELECT)
    .order("played_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapTennisMatch);
}

export async function getTennisMatchById(matchId) {
  const { data, error } = await supabase
    .from("tennis_matches")
    .select(MATCH_SELECT)
    .eq("id", matchId)
    .single();

  if (error) {
    throw error;
  }

  return mapTennisMatch(data);
}

export async function recordTennisMatch({
  matchType,
  playerOneId,
  playerTwoId,
  playerThreeId,
  playerFourId,
  sets,
  playedAt,
  notes,
}) {
  const formattedSets = sets.map((set) => ({
    teamOne: Number(set.teamOne),
    teamTwo: Number(set.teamTwo),
  }));

  const { data: matchId, error } =
    await supabase.rpc("record_tennis_match", {
      p_match_type: matchType,
      p_player_one: playerOneId,
      p_player_two: playerTwoId,
      p_player_three:
        matchType === "double"
          ? playerThreeId
          : null,
      p_player_four:
        matchType === "double"
          ? playerFourId
          : null,
      p_sets: formattedSets,
      p_played_at:
        playedAt || new Date().toISOString(),
      p_notes: notes?.trim() || null,
    });

  if (error) {
    throw error;
  }

  return getTennisMatchById(matchId);
}