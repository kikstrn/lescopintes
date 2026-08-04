import {
  supabase,
} from "../lib/supabase";

const DAILY_STEPS_SELECT = `
  id,
  profile_id,
  step_date,
  step_count,
  goal_steps,
  source,
  created_at,
  updated_at
`;

export function estimateWalkingMetrics(
  stepCount,
) {
  const safeSteps =
    Math.max(
      0,
      Number(stepCount) ||
      0,
    );

  /*
   * Estimations simples :
   * - longueur moyenne d’un pas : 0,75 m ;
   * - dépense moyenne : 0,04 kcal par pas.
   *
   * Elles servent à donner un ordre de grandeur,
   * pas une mesure médicale.
   */
  return {
    distanceKm:
      Number(
        (
          safeSteps *
          0.00075
        ).toFixed(2),
      ),

    calories:
      Math.round(
        safeSteps *
        0.04,
      ),
  };
}

function mapDailySteps(
  row,
) {
  if (!row) {
    return null;
  }

  const stepCount =
    Number(
      row.step_count ??
      0,
    );

  const goalSteps =
    Math.max(
      1,
      Number(
        row.goal_steps ??
        10_000,
      ),
    );

  const estimates =
    estimateWalkingMetrics(
      stepCount,
    );

  return {
    id:
      row.id,

    profileId:
      row.profile_id,

    stepDate:
      row.step_date,

    stepCount,
    goalSteps,

    progress:
      Math.min(
        100,
        Math.round(
          stepCount /
          goalSteps *
          100,
        ),
      ),

    source:
      row.source ??
      "manual",

    distanceKm:
      estimates.distanceKm,

    calories:
      estimates.calories,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

function getTodayDate() {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone:
        Intl.DateTimeFormat()
          .resolvedOptions()
          .timeZone,
    },
  ).format(
    new Date(),
  );
}

function getDateDaysAgo(
  days,
) {
  const date =
    new Date();

  date.setDate(
    date.getDate() -
    days,
  );

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone:
        Intl.DateTimeFormat()
          .resolvedOptions()
          .timeZone,
    },
  ).format(date);
}

export async function getMyDailySteps(
  profileId,
) {
  if (!profileId) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase
    .from("daily_steps")
    .select(
      DAILY_STEPS_SELECT,
    )
    .eq(
      "profile_id",
      profileId,
    )
    .eq(
      "step_date",
      getTodayDate(),
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  return mapDailySteps(
    data,
  );
}

export async function getMyStepsHistory(
  profileId,
  days = 7,
) {
  if (!profileId) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from("daily_steps")
    .select(
      DAILY_STEPS_SELECT,
    )
    .eq(
      "profile_id",
      profileId,
    )
    .gte(
      "step_date",
      getDateDaysAgo(
        Math.max(
          0,
          days - 1,
        ),
      ),
    )
    .lte(
      "step_date",
      getTodayDate(),
    )
    .order(
      "step_date",
      {
        ascending:
          false,
      },
    );

  if (error) {
    throw error;
  }

  return (
    data ??
    []
  ).map(
    mapDailySteps,
  );
}

export async function saveMyDailySteps({
  profileId,
  stepCount,
  goalSteps,
}) {
  if (!profileId) {
    throw new Error(
      "Profil connecté introuvable.",
    );
  }

  const normalizedSteps =
    Math.round(
      Number(stepCount),
    );

  const normalizedGoal =
    Math.round(
      Number(goalSteps),
    );

  if (
    !Number.isFinite(
      normalizedSteps,
    ) ||
    normalizedSteps < 0 ||
    normalizedSteps >
      100_000
  ) {
    throw new Error(
      "Le nombre de pas doit être compris entre 0 et 100 000.",
    );
  }

  if (
    !Number.isFinite(
      normalizedGoal,
    ) ||
    normalizedGoal < 1_000 ||
    normalizedGoal >
      50_000
  ) {
    throw new Error(
      "L’objectif doit être compris entre 1 000 et 50 000 pas.",
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("daily_steps")
    .upsert(
      {
        profile_id:
          profileId,

        step_date:
          getTodayDate(),

        step_count:
          normalizedSteps,

        goal_steps:
          normalizedGoal,

        source:
          "manual",

        updated_at:
          new Date()
            .toISOString(),
      },
      {
        onConflict:
          "profile_id,step_date",
      },
    )
    .select(
      DAILY_STEPS_SELECT,
    )
    .single();

  if (error) {
    throw error;
  }

  return mapDailySteps(
    data,
  );
}


function getStartOfWeekDate(
  weeksAgo = 0,
) {
  const date =
    new Date();

  const day =
    date.getDay();

  const mondayOffset =
    day === 0
      ? -6
      : 1 - day;

  date.setDate(
    date.getDate() +
    mondayOffset -
    weeksAgo * 7,
  );

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone:
        Intl.DateTimeFormat()
          .resolvedOptions()
          .timeZone,
    },
  ).format(date);
}

function getEndOfWeekDate(
  weeksAgo = 0,
) {
  const date =
    new Date(
      `${getStartOfWeekDate(
        weeksAgo,
      )}T12:00:00`,
    );

  date.setDate(
    date.getDate() +
    6,
  );

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone:
        Intl.DateTimeFormat()
          .resolvedOptions()
          .timeZone,
    },
  ).format(date);
}

export async function getWalkingLeaderboard(
  limit = 50,
) {
  const {
    data,
    error,
  } = await supabase.rpc(
    "get_weekly_walking_leaderboard",
    {
      p_week_start:
        getStartOfWeekDate(
          0,
        ),

      p_week_end:
        getEndOfWeekDate(
          0,
        ),

      p_limit:
        limit,
    },
  );

  if (error) {
    throw error;
  }

  return (
    data ??
    []
  ).map(
    (row) => ({
      rank:
        Number(
          row.rank_position ??
          0,
        ),

      profileId:
        row.profile_id,

      nickname:
        row.nickname ??
        "Membre",

      avatarUrl:
        row.avatar_url ??
        null,

      totalSteps:
        Number(
          row.total_steps ??
          0,
        ),

      activeDays:
        Number(
          row.active_days ??
          0,
        ),

      averageSteps:
        Number(
          row.average_steps ??
          0,
        ),

      bestDaySteps:
        Number(
          row.best_day_steps ??
          0,
        ),
    }),
  );
}

export async function getWalkingPersonalStats(
  profileId,
) {
  if (!profileId) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_my_walking_stats",
    {
      p_profile_id:
        profileId,

      p_current_week_start:
        getStartOfWeekDate(
          0,
        ),

      p_current_week_end:
        getEndOfWeekDate(
          0,
        ),

      p_previous_week_start:
        getStartOfWeekDate(
          1,
        ),

      p_previous_week_end:
        getEndOfWeekDate(
          1,
        ),
    },
  );

  if (error) {
    throw error;
  }

  const row =
    Array.isArray(data)
      ? data[0]
      : data;

  if (!row) {
    return null;
  }

  return {
    currentWeekSteps:
      Number(
        row.current_week_steps ??
        0,
      ),

    previousWeekSteps:
      Number(
        row.previous_week_steps ??
        0,
      ),

    differenceSteps:
      Number(
        row.difference_steps ??
        0,
      ),

    differencePercent:
      row.difference_percent ===
        null
        ? null
        : Number(
            row.difference_percent,
          ),

    currentStreak:
      Number(
        row.current_streak ??
        0,
      ),

    longestStreak:
      Number(
        row.longest_streak ??
        0,
      ),

    bestDaySteps:
      Number(
        row.best_day_steps ??
        0,
      ),

    bestDayDate:
      row.best_day_date ??
      null,

    totalRecordedDays:
      Number(
        row.total_recorded_days ??
        0,
      ),
  };
}

export async function getMyStepsCalendar(
  profileId,
  days = 35,
) {
  if (!profileId) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from("daily_steps")
    .select(
      DAILY_STEPS_SELECT,
    )
    .eq(
      "profile_id",
      profileId,
    )
    .gte(
      "step_date",
      getDateDaysAgo(
        Math.max(
          0,
          days - 1,
        ),
      ),
    )
    .lte(
      "step_date",
      getTodayDate(),
    )
    .order(
      "step_date",
      {
        ascending:
          true,
      },
    );

  if (error) {
    throw error;
  }

  return (
    data ??
    []
  ).map(
    mapDailySteps,
  );
}


export async function getMyWalkingRewards(
  profileId,
) {
  if (!profileId) {
    return {
      todayXp:
        0,

      totalXp:
        0,

      unlockedBadges:
        [],

      nextMilestone:
        null,
    };
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_my_walking_rewards",
    {
      p_profile_id:
        profileId,
    },
  );

  if (error) {
    throw error;
  }

  const row =
    Array.isArray(data)
      ? data[0]
      : data;

  return {
    todayXp:
      Number(
        row?.today_xp ??
        0,
      ),

    totalXp:
      Number(
        row?.total_xp ??
        0,
      ),

    unlockedBadges:
      row?.unlocked_badges ??
      [],

    nextMilestone:
      row?.next_milestone ??
      null,
  };
}
