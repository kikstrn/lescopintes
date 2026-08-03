import {
  useCallback,
  useMemo,
  useState,
} from "react";

function getClosedAdminState() {
  return {
    open: false,
    mode: "edit",
    tournament: null,
  };
}

function getClosedMatchAdminState() {
  return {
    open: false,
    action: "history",
    match: null,
  };
}

function useTournamentController({
  tournamentsApi,
  personalProfile,
}) {
  const [
    creationOpen,
    setCreationOpen,
  ] = useState(false);

  const [
    scoreMatch,
    setScoreMatch,
  ] = useState(null);

  const [
    correctionMatch,
    setCorrectionMatch,
  ] = useState(null);

  const [
    tournamentAdmin,
    setTournamentAdmin,
  ] = useState(
    getClosedAdminState,
  );

  const [
    matchAdmin,
    setMatchAdmin,
  ] = useState(
    getClosedMatchAdminState,
  );

  const canManage =
    personalProfile?.role ===
    "admin";

  const closeCreation =
    useCallback(() => {
      setCreationOpen(false);
    }, []);

  const openCreation =
    useCallback(() => {
      setCreationOpen(true);
    }, []);

  const createTournament =
    useCallback(
      async (payload) => {
        await tournamentsApi
          .addTournament(payload);

        closeCreation();
      },
      [
        closeCreation,
        tournamentsApi,
      ],
    );

  const openScore =
    useCallback((match) => {
      setScoreMatch(
        match ?? null,
      );
    }, []);

  const closeScore =
    useCallback(() => {
      setScoreMatch(null);
    }, []);

  const saveScore =
    useCallback(
      async (matchData) => {
        if (!scoreMatch?.id) {
          throw new Error(
            "Match du tournoi introuvable.",
          );
        }

        await tournamentsApi
          .saveTournamentMatch({
            tournamentMatchId:
              scoreMatch.id,

            playerOneId:
              scoreMatch.playerOneId,

            playerTwoId:
              scoreMatch.playerTwoId,

            sets:
              matchData.sets,

            playedAt:
              matchData.playedAt,

            notes:
              matchData.notes,
          });

        closeScore();
      },
      [
        closeScore,
        scoreMatch,
        tournamentsApi,
      ],
    );

  const openCorrection =
    useCallback(
      async (match) => {
        if (!match?.id) {
          return;
        }

        setCorrectionMatch(
          match,
        );

        await tournamentsApi
          .loadCorrectionDraft(
            match.id,
          );
      },
      [tournamentsApi],
    );

  const closeCorrection =
    useCallback(() => {
      setCorrectionMatch(null);

      tournamentsApi
        .clearCorrectionDraft();
    }, [tournamentsApi]);

  const saveCorrection =
    useCallback(
      async (matchData) => {
        if (!correctionMatch?.id) {
          throw new Error(
            "Match du tournoi introuvable.",
          );
        }

        await tournamentsApi
          .saveCorrectionDraft({
            tournamentMatchId:
              correctionMatch.id,

            playerOneId:
              correctionMatch
                .playerOneId,

            playerTwoId:
              correctionMatch
                .playerTwoId,

            sets:
              matchData.sets,

            playedAt:
              matchData.playedAt,

            notes:
              matchData.notes,

            reason:
              correctionMatch
                .correctionReason ??
              "Correction préparée depuis l’administration.",
          });

        closeCorrection();
      },
      [
        closeCorrection,
        correctionMatch,
        tournamentsApi,
      ],
    );

  const applyCorrection =
    useCallback(
      async (match) => {
        if (!match?.id) {
          return;
        }

        const pendingCorrection =
          await tournamentsApi
            .loadCorrectionDraft(
              match.id,
            );

        const hasPendingCorrection =
          Boolean(
            pendingCorrection?.id &&
            pendingCorrection?.status ===
              "pending",
          );

        if (
          !hasPendingCorrection
        ) {
          setCorrectionMatch(
            match,
          );

          window.alert(
            "Aucune correction enregistrée n’est en attente. Prépare d’abord le nouveau score, puis clique de nouveau sur « Appliquer la correction ».",
          );

          return;
        }

        const confirmed =
          window.confirm(
            "Appliquer cette correction ? L’ELO, les statistiques tennis, les points, l’XP et les badges seront recalculés depuis les matchs valides.",
          );

        if (!confirmed) {
          return;
        }

        await tournamentsApi
          .applyCorrection(
            match.id,
          );
      },
      [tournamentsApi],
    );

  const openTournamentAdmin =
    useCallback(
      (mode, tournament) => {
        if (!canManage) {
          return;
        }

        setTournamentAdmin({
          open: true,
          mode:
            mode ?? "edit",
          tournament:
            tournament ?? null,
        });
      },
      [canManage],
    );

  const closeTournamentAdmin =
    useCallback(() => {
      setTournamentAdmin(
        getClosedAdminState(),
      );
    }, []);

  const runTournamentAdmin =
    useCallback(
      async (action) => {
        try {
          await action();
          closeTournamentAdmin();
        } catch {
          /*
           * L’erreur reste exposée par useTournaments.
           */
        }
      },
      [closeTournamentAdmin],
    );

  const openMatchAdmin =
    useCallback(
      async (action, match) => {
        if (
          !canManage ||
          !match?.id
        ) {
          return;
        }

        setMatchAdmin({
          open: true,
          action:
            action ??
            "history",
          match,
        });

        if (
          action === "history"
        ) {
          await tournamentsApi
            .loadMatchHistory(
              match.id,
            );
        } else {
          tournamentsApi
            .clearMatchHistory();
        }

        if (
          action ===
            "cancel_result" ||
          action === "replay"
        ) {
          await tournamentsApi
            .loadResetImpact(
              match.id,
            );
        } else {
          tournamentsApi
            .clearResetImpact();
        }
      },
      [
        canManage,
        tournamentsApi,
      ],
    );

  const closeMatchAdmin =
    useCallback(() => {
      tournamentsApi
        .clearMatchHistory();

      tournamentsApi
        .clearResetImpact();

      setMatchAdmin(
        getClosedMatchAdminState(),
      );
    }, [tournamentsApi]);

  const confirmMatchAdmin =
    useCallback(
      async ({
        reason = "",
      } = {}) => {
        const {
          action,
          match,
        } = matchAdmin;

        if (!match?.id) {
          return;
        }

        if (
          action ===
            "edit_result"
        ) {
          try {
            await tournamentsApi
              .resetMatchResult({
                tournamentMatchId:
                  match.id,

                mode:
                  "replay",

                reason:
                  reason ||
                  "Préparation d’une correction de score.",
              });

            closeMatchAdmin();

            await openCorrection(
              match,
            );
          } catch {
            /*
             * La modale conserve l’erreur du hook.
             */
          }

          return;
        }

        if (
          action ===
            "cancel_result" ||
          action === "replay"
        ) {
          try {
            await tournamentsApi
              .resetMatchResult({
                tournamentMatchId:
                  match.id,

                mode:
                  action ===
                  "replay"
                    ? "replay"
                    : "cancel",

                reason,
              });

            closeMatchAdmin();
          } catch {
            /*
             * La modale affiche l’erreur du hook.
             */
          }

          return;
        }

        closeMatchAdmin();
      },
      [
        closeMatchAdmin,
        matchAdmin,
        openCorrection,
        tournamentsApi,
      ],
    );

  const syncRewards =
    useCallback(async () => {
      const confirmed =
        window.confirm(
          "Resynchroniser toutes les récompenses tennis ? Les transactions tennis de points et d’XP seront reconstruites depuis les matchs valides, puis les badges seront recalculés.",
        );

      if (!confirmed) {
        return;
      }

      await tournamentsApi
        .syncTennisRewards();
    }, [tournamentsApi]);

  const correctionInitialValues =
    useMemo(() => {
      if (
        !correctionMatch ||
        !tournamentsApi
          .correctionDraft
      ) {
        return null;
      }

      const draft =
        tournamentsApi
          .correctionDraft;

      return {
        matchType:
          "single",

        playerOneId:
          correctionMatch
            .playerOneId,

        playerTwoId:
          correctionMatch
            .playerTwoId,

        sets:
          draft.sets,

        playedDate:
          draft.playedAt
            ? new Date(
                draft.playedAt,
              )
                .toISOString()
                .slice(0, 10)
            : undefined,

        notes:
          draft.notes,
      };
    }, [
      correctionMatch,
      tournamentsApi
        .correctionDraft,
    ]);

  const scoreInitialValues =
    useMemo(() => {
      if (!scoreMatch) {
        return null;
      }

      return {
        matchType:
          "single",

        playerOneId:
          scoreMatch.playerOneId,

        playerTwoId:
          scoreMatch.playerTwoId,

        notes:
          "Match de tournoi",
      };
    }, [scoreMatch]);

  return {
    canManage,

    creationOpen,
    openCreation,
    closeCreation,
    createTournament,

    scoreMatch,
    scoreInitialValues,
    openScore,
    closeScore,
    saveScore,

    correctionMatch,
    correctionInitialValues,
    openCorrection,
    closeCorrection,
    saveCorrection,
    applyCorrection,

    tournamentAdmin,
    openTournamentAdmin,
    closeTournamentAdmin,
    runTournamentAdmin,

    matchAdmin,
    openMatchAdmin,
    closeMatchAdmin,
    confirmMatchAdmin,

    syncRewards,
  };
}

export default useTournamentController;
