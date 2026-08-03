import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "../../../lib/supabase";

import {
  applyPendingTournamentCorrection,
  cancelTournament,
  createTournament,
  deleteTournament,
  discardPendingTournamentCorrection,
  duplicateTournament,
  getArchivedTournamentMatchResult,
  getPendingTournamentCorrection,
  getTennisTournamentDiagnostics,
  getTournamentMatchHistory,
  getTournamentMatchResetImpact,
  getTournaments,
  recordTournamentMatch,
  regenerateTournament,
  resetTournamentMatchBranch,
  resyncAllTennisRewards,
  savePendingTournamentCorrection,
  updateTournament,
  updateTournamentSeeds,
} from "../../../services/tournamentService";

export function useTournaments() {
  const [
    tournaments,
    setTournaments,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [
    matchHistory,
    setMatchHistory,
  ] = useState([]);

  const [
    matchHistoryLoading,
    setMatchHistoryLoading,
  ] = useState(false);

  const [
    matchHistoryError,
    setMatchHistoryError,
  ] = useState(null);

  const [
    resetImpact,
    setResetImpact,
  ] = useState(null);

  const [
    resetImpactLoading,
    setResetImpactLoading,
  ] = useState(false);

  const [
    resetImpactError,
    setResetImpactError,
  ] = useState(null);

  const [
    correctionDraft,
    setCorrectionDraft,
  ] = useState(null);

  const [
    correctionDraftLoading,
    setCorrectionDraftLoading,
  ] = useState(false);

  const [
    correctionDraftError,
    setCorrectionDraftError,
  ] = useState(null);

  const [
    rewardSyncResult,
    setRewardSyncResult,
  ] = useState(null);

  const [
    rewardSyncError,
    setRewardSyncError,
  ] = useState(null);

  const [
    diagnostics,
    setDiagnostics,
  ] = useState(null);

  const [
    diagnosticsLoading,
    setDiagnosticsLoading,
  ] = useState(false);

  const [
    diagnosticsError,
    setDiagnosticsError,
  ] = useState(null);

  const refreshTimeoutRef =
    useRef(null);

  const loadTournaments =
    useCallback(
      async ({
        showLoading = true,
      } = {}) => {
        if (showLoading) {
          setLoading(true);
        }

        setError(null);

        try {
          const rows =
            await getTournaments();

          setTournaments(rows);

          return rows;
        } catch (requestError) {
          console.error(
            "Impossible de charger les tournois :",
            requestError,
          );

          setError(
            requestError?.message ??
              "Impossible de charger les tournois.",
          );

          return [];
        } finally {
          if (showLoading) {
            setLoading(false);
          }
        }
      },
      [],
    );

  const scheduleRefresh =
    useCallback(() => {
      if (
        refreshTimeoutRef.current
      ) {
        window.clearTimeout(
          refreshTimeoutRef.current,
        );
      }

      refreshTimeoutRef.current =
        window.setTimeout(() => {
          loadTournaments({
            showLoading: false,
          });
        }, 140);
    }, [loadTournaments]);

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  useEffect(() => {
    const channel = supabase
      .channel(
        "copintes-tennis-tournaments",
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table:
            "tennis_tournaments",
        },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table:
            "tennis_tournament_players",
        },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table:
            "tennis_tournament_matches",
        },
        scheduleRefresh,
      )
      .subscribe();

    return () => {
      if (
        refreshTimeoutRef.current
      ) {
        window.clearTimeout(
          refreshTimeoutRef.current,
        );
      }

      supabase.removeChannel(
        channel,
      );
    };
  }, [scheduleRefresh]);

  const addTournament =
    useCallback(
      async (payload) => {
        setSaving(true);
        setError(null);

        try {
          const tournament =
            await createTournament(
              payload,
            );

          await loadTournaments({
            showLoading: false,
          });

          return tournament;
        } catch (requestError) {
          setError(
            requestError?.message ??
              "Impossible de créer le tournoi.",
          );

          throw requestError;
        } finally {
          setSaving(false);
        }
      },
      [loadTournaments],
    );

  const stopTournament =
    useCallback(
      async (tournamentId) => {
        setSaving(true);
        setError(null);

        try {
          await cancelTournament(
            tournamentId,
          );

          await loadTournaments({
            showLoading: false,
          });
        } catch (requestError) {
          setError(
            requestError?.message ??
              "Impossible d’annuler le tournoi.",
          );

          throw requestError;
        } finally {
          setSaving(false);
        }
      },
      [loadTournaments],
    );

  const removeTournament =
    useCallback(
      async (tournamentId) => {
        setSaving(true);
        setError(null);

        try {
          await deleteTournament(
            tournamentId,
          );

          await loadTournaments({
            showLoading: false,
          });
        } catch (requestError) {
          setError(
            requestError?.message ??
              "Impossible de supprimer le tournoi.",
          );

          throw requestError;
        } finally {
          setSaving(false);
        }
      },
      [loadTournaments],
    );


  const saveTournamentMatch =
    useCallback(
      async (payload) => {
        setSaving(true);
        setError(null);

        try {
          const result =
            await recordTournamentMatch(
              payload,
            );

          await loadTournaments({
            showLoading: false,
          });

          return result;
        } catch (requestError) {
          setError(
            requestError?.message ??
              "Impossible d’enregistrer le résultat du tournoi.",
          );

          throw requestError;
        } finally {
          setSaving(false);
        }
      },
      [loadTournaments],
    );


  const editTournament =
    useCallback(
      async (payload) => {
        setSaving(true);
        setError(null);

        try {
          await updateTournament(
            payload,
          );

          await loadTournaments({
            showLoading: false,
          });
        } catch (requestError) {
          setError(
            requestError?.message ??
              "Impossible de modifier le tournoi.",
          );

          throw requestError;
        } finally {
          setSaving(false);
        }
      },
      [loadTournaments],
    );

  const regenerateBracket =
    useCallback(
      async (tournamentId) => {
        setSaving(true);
        setError(null);

        try {
          await regenerateTournament(
            tournamentId,
          );

          await loadTournaments({
            showLoading: false,
          });
        } catch (requestError) {
          setError(
            requestError?.message ??
              "Impossible de régénérer le tableau.",
          );

          throw requestError;
        } finally {
          setSaving(false);
        }
      },
      [loadTournaments],
    );

  const reorderTournamentPlayers =
    useCallback(
      async (payload) => {
        setSaving(true);
        setError(null);

        try {
          await updateTournamentSeeds(
            payload,
          );

          await loadTournaments({
            showLoading: false,
          });
        } catch (requestError) {
          setError(
            requestError?.message ??
              "Impossible de modifier l’ordre des joueurs.",
          );

          throw requestError;
        } finally {
          setSaving(false);
        }
      },
      [loadTournaments],
    );

  const copyTournament =
    useCallback(
      async (payload) => {
        setSaving(true);
        setError(null);

        try {
          const tournament =
            await duplicateTournament(
              payload,
            );

          await loadTournaments({
            showLoading: false,
          });

          return tournament;
        } catch (requestError) {
          setError(
            requestError?.message ??
              "Impossible de dupliquer le tournoi.",
          );

          throw requestError;
        } finally {
          setSaving(false);
        }
      },
      [loadTournaments],
    );


  const loadMatchHistory =
    useCallback(
      async (tournamentMatchId) => {
        if (!tournamentMatchId) {
          setMatchHistory([]);
          setMatchHistoryError(null);
          return [];
        }

        setMatchHistoryLoading(true);
        setMatchHistoryError(null);

        try {
          const rows =
            await getTournamentMatchHistory(
              tournamentMatchId,
            );

          setMatchHistory(rows);

          return rows;
        } catch (requestError) {
          console.error(
            "Impossible de charger l’historique du match :",
            requestError,
          );

          setMatchHistory([]);

          setMatchHistoryError(
            requestError?.message ??
              "Impossible de charger l’historique du match.",
          );

          return [];
        } finally {
          setMatchHistoryLoading(false);
        }
      },
      [],
    );

  const clearMatchHistory =
    useCallback(() => {
      setMatchHistory([]);
      setMatchHistoryError(null);
      setMatchHistoryLoading(false);
    }, []);



  const loadResetImpact =
    useCallback(
      async (tournamentMatchId) => {
        if (!tournamentMatchId) {
          setResetImpact(null);
          setResetImpactError(null);
          return null;
        }

        setResetImpactLoading(true);
        setResetImpactError(null);

        try {
          const impact =
            await getTournamentMatchResetImpact(
              tournamentMatchId,
            );

          setResetImpact(impact);

          return impact;
        } catch (requestError) {
          console.error(
            "Impossible d’analyser la branche du tournoi :",
            requestError,
          );

          setResetImpact(null);

          setResetImpactError(
            requestError?.message ??
              "Impossible d’analyser les conséquences de cette action.",
          );

          return null;
        } finally {
          setResetImpactLoading(false);
        }
      },
      [],
    );

  const clearResetImpact =
    useCallback(() => {
      setResetImpact(null);
      setResetImpactError(null);
      setResetImpactLoading(false);
    }, []);


  const loadCorrectionDraft =
    useCallback(
      async (tournamentMatchId) => {
        if (!tournamentMatchId) {
          setCorrectionDraft(null);
          setCorrectionDraftError(null);
          return null;
        }

        setCorrectionDraftLoading(true);
        setCorrectionDraftError(null);

        try {
          const [
            pendingCorrection,
            archivedResult,
          ] = await Promise.all([
            getPendingTournamentCorrection(
              tournamentMatchId,
            ),

            getArchivedTournamentMatchResult(
              tournamentMatchId,
            ),
          ]);

          const draft =
            pendingCorrection ??
            archivedResult;

          setCorrectionDraft(draft);

          return draft;
        } catch (requestError) {
          console.error(
            "Impossible de préparer la correction :",
            requestError,
          );

          setCorrectionDraft(null);

          setCorrectionDraftError(
            requestError?.message ??
              "Impossible de préparer la correction du score.",
          );

          return null;
        } finally {
          setCorrectionDraftLoading(false);
        }
      },
      [],
    );

  const saveCorrectionDraft =
    useCallback(
      async (payload) => {
        setSaving(true);
        setError(null);
        setCorrectionDraftError(null);

        try {
          const result =
            await savePendingTournamentCorrection(
              payload,
            );

          await loadCorrectionDraft(
            payload.tournamentMatchId,
          );

          await loadMatchHistory(
            payload.tournamentMatchId,
          );

          return result;
        } catch (requestError) {
          setCorrectionDraftError(
            requestError?.message ??
              "Impossible d’enregistrer la correction en attente.",
          );

          throw requestError;
        } finally {
          setSaving(false);
        }
      },
      [
        loadCorrectionDraft,
        loadMatchHistory,
      ],
    );


  const applyCorrection =
    useCallback(
      async (tournamentMatchId) => {
        if (!tournamentMatchId) {
          throw new Error(
            "Match du tournoi introuvable.",
          );
        }

        setSaving(true);
        setError(null);
        setCorrectionDraftError(null);

        try {
          const result =
            await applyPendingTournamentCorrection({
              tournamentMatchId,
            });

          setRewardSyncResult(
            result,
          );

          setRewardSyncError(
            null,
          );

          setCorrectionDraft(null);

          await Promise.all([
            loadTournaments({
              showLoading: false,
            }),

            loadMatchHistory(
              tournamentMatchId,
            ),
          ]);

          return result;
        } catch (requestError) {
          setCorrectionDraftError(
            requestError?.message ??
              "Impossible d’appliquer la correction.",
          );

          setRewardSyncError(
            requestError?.message ??
              "Impossible de synchroniser les récompenses tennis.",
          );

          throw requestError;
        } finally {
          setSaving(false);
        }
      },
      [
        loadMatchHistory,
        loadTournaments,
      ],
    );



  const loadDiagnostics =
    useCallback(
      async (tournamentId) => {
        if (!tournamentId) {
          setDiagnostics(null);
          setDiagnosticsError(null);
          return null;
        }

        setDiagnosticsLoading(true);
        setDiagnosticsError(null);

        try {
          const result =
            await getTennisTournamentDiagnostics(
              tournamentId,
            );

          setDiagnostics(result);

          return result;
        } catch (requestError) {
          setDiagnostics(null);

          setDiagnosticsError(
            requestError?.message ??
              "Impossible d’analyser le tournoi.",
          );

          return null;
        } finally {
          setDiagnosticsLoading(false);
        }
      },
      [],
    );

  const clearDiagnostics =
    useCallback(() => {
      setDiagnostics(null);
      setDiagnosticsError(null);
      setDiagnosticsLoading(false);
    }, []);

  const syncTennisRewards =
    useCallback(
      async () => {
        setSaving(true);
        setError(null);
        setRewardSyncError(null);

        try {
          const result =
            await resyncAllTennisRewards();

          setRewardSyncResult(
            result,
          );

          return result;
        } catch (requestError) {
          setRewardSyncError(
            requestError?.message ??
              "Impossible de synchroniser les points, l’XP et les badges.",
          );

          throw requestError;
        } finally {
          setSaving(false);
        }
      },
      [],
    );

  const clearRewardSyncResult =
    useCallback(() => {
      setRewardSyncResult(null);
      setRewardSyncError(null);
    }, []);

  const discardCorrectionDraft =
    useCallback(
      async (tournamentMatchId) => {
        setSaving(true);
        setError(null);
        setCorrectionDraftError(null);

        try {
          await discardPendingTournamentCorrection(
            tournamentMatchId,
          );

          setCorrectionDraft(null);

          await loadMatchHistory(
            tournamentMatchId,
          );
        } catch (requestError) {
          setCorrectionDraftError(
            requestError?.message ??
              "Impossible de supprimer la correction en attente.",
          );

          throw requestError;
        } finally {
          setSaving(false);
        }
      },
      [loadMatchHistory],
    );

  const clearCorrectionDraft =
    useCallback(() => {
      setCorrectionDraft(null);
      setCorrectionDraftError(null);
      setCorrectionDraftLoading(false);
    }, []);

  const resetMatchResult =
    useCallback(
      async ({
        tournamentMatchId,
        mode,
        reason = "",
      }) => {
        setSaving(true);
        setError(null);

        try {
          const result =
            await resetTournamentMatchBranch({
              tournamentMatchId,
              mode,
              reason,
            });

          await loadTournaments({
            showLoading: false,
          });

          if (tournamentMatchId) {
            await loadMatchHistory(
              tournamentMatchId,
            );
          }

          return result;
        } catch (requestError) {
          setError(
            requestError?.message ??
              "Impossible de réinitialiser le résultat.",
          );

          throw requestError;
        } finally {
          setSaving(false);
        }
      },
      [
        loadMatchHistory,
        loadTournaments,
      ],
    );

  return {
    tournaments,
    loading,
    saving,
    error,

    addTournament,
    stopTournament,
    removeTournament,
    saveTournamentMatch,

    matchHistory,
    matchHistoryLoading,
    matchHistoryError,
    loadMatchHistory,
    clearMatchHistory,

    resetImpact,
    resetImpactLoading,
    resetImpactError,
    loadResetImpact,
    clearResetImpact,

    correctionDraft,
    correctionDraftLoading,
    correctionDraftError,
    loadCorrectionDraft,
    saveCorrectionDraft,
    applyCorrection,
    discardCorrectionDraft,
    clearCorrectionDraft,

    rewardSyncResult,
    rewardSyncError,
    syncTennisRewards,
    clearRewardSyncResult,

    diagnostics,
    diagnosticsLoading,
    diagnosticsError,
    loadDiagnostics,
    clearDiagnostics,

    resetMatchResult,

    editTournament,
    regenerateBracket,
    reorderTournamentPlayers,
    copyTournament,

    refreshTournaments:
      loadTournaments,
  };
}

export default useTournaments;
