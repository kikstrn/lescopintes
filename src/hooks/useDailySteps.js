import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getMyDailySteps,
  getMyStepsCalendar,
  getMyStepsHistory,
  getMyWalkingRewards,
  getWalkingLeaderboard,
  getWalkingPersonalStats,
  saveMyDailySteps,
} from "../services/dailyStepsService";

function useDailySteps(
  profileId,
) {
  const [
    today,
    setToday,
  ] = useState(null);

  const [
    history,
    setHistory,
  ] = useState([]);

  const [
    calendar,
    setCalendar,
  ] = useState([]);

  const [
    leaderboard,
    setLeaderboard,
  ] = useState([]);

  const [
    personalStats,
    setPersonalStats,
  ] = useState(null);

  const [
    rewards,
    setRewards,
  ] = useState({
    todayXp:
      0,

    totalXp:
      0,

    unlockedBadges:
      [],

    nextMilestone:
      null,
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  const load =
    useCallback(async () => {
      if (!profileId) {
        setToday(null);
        setHistory([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [
          todayResult,
          historyResult,
          calendarResult,
          leaderboardResult,
          personalStatsResult,
          rewardsResult,
        ] =
          await Promise.all([
            getMyDailySteps(
              profileId,
            ),

            getMyStepsHistory(
              profileId,
              7,
            ),

            getMyStepsCalendar(
              profileId,
              35,
            ),

            getWalkingLeaderboard(
              50,
            ),

            getWalkingPersonalStats(
              profileId,
            ),

            getMyWalkingRewards(
              profileId,
            ),
          ]);

        setToday(
          todayResult,
        );

        setHistory(
          historyResult,
        );

        setCalendar(
          calendarResult,
        );

        setLeaderboard(
          leaderboardResult,
        );

        setPersonalStats(
          personalStatsResult,
        );

        setRewards(
          rewardsResult,
        );
      } catch (
        requestError
      ) {
        setError(
          requestError?.message ??
            "Impossible de charger les pas.",
        );
      } finally {
        setLoading(false);
      }
    }, [profileId]);

  useEffect(() => {
    load();
  }, [load]);

  const save =
    useCallback(
      async ({
        stepCount,
        goalSteps,
      }) => {
        setSaving(true);
        setError(null);

        try {
          const saved =
            await saveMyDailySteps({
              profileId,
              stepCount,
              goalSteps,
            });

          setToday(saved);

          setHistory(
            (
              currentHistory,
            ) => [
              saved,
              ...currentHistory.filter(
                (item) =>
                  item.stepDate !==
                  saved.stepDate,
              ),
            ].slice(
              0,
              7,
            ),
          );

          await load();

          return saved;
        } catch (
          requestError
        ) {
          setError(
            requestError?.message ??
              "Impossible d’enregistrer les pas.",
          );

          throw requestError;
        } finally {
          setSaving(false);
        }
      },
      [profileId],
    );

  return {
    today,
    history,
    calendar,
    leaderboard,
    personalStats,
    rewards,
    loading,
    saving,
    error,

    save,
    refresh:
      load,
  };
}

export default useDailySteps;
