import TennisSection from "../../../components/tennis/TennisSection";
import TennisTournamentsSection from "../../../components/tennis/TennisTournamentsSection";

import { useAppData } from "../../context/AppDataContext";
import useTournaments from "../../shared/hooks/useTournaments";

import TournamentDialogs from "./components/TournamentDialogs";
import useTournamentController from "./hooks/useTournamentController";

function TennisPage() {
  const {
    members = [],
    tennisMatches = [],

    tennisLeaderboard = [],
    tennisLeaderboardLoading = false,
    tennisLeaderboardError = null,

    personalProfile,

    loading = {},
    errors = {},

    openScoreModal,
  } = useAppData();

  const tournamentsApi =
    useTournaments();

  const controller =
    useTournamentController({
      tournamentsApi,
      personalProfile,
    });

  return (
    <>
      <TennisSection
        matches={tennisMatches}
        members={members}
        tennisLeaderboard={
          tennisLeaderboard
        }
        tennisLeaderboardLoading={
          tennisLeaderboardLoading
        }
        tennisLeaderboardError={
          tennisLeaderboardError
        }
        loading={
          loading.tennis ??
          false
        }
        error={
          errors.tennis ??
          null
        }
        onAddMatch={
          openScoreModal
        }
      />

      <TennisTournamentsSection
        tournaments={
          tournamentsApi
            .tournaments
        }
        loading={
          tournamentsApi.loading
        }
        saving={
          tournamentsApi.saving
        }
        error={
          tournamentsApi.error
        }
        canManage={
          controller.canManage
        }
        onCreate={
          controller.openCreation
        }
        onEnterScore={
          controller.openScore
        }
        onAdminAction={
          controller
            .openTournamentAdmin
        }
        onMatchAdminAction={
          controller
            .openMatchAdmin
        }
        onPrepareCorrection={
          controller
            .openCorrection
        }
        onApplyCorrection={
          controller
            .applyCorrection
        }
        correctionSaving={
          tournamentsApi.saving
        }
        rewardSyncResult={
          tournamentsApi
            .rewardSyncResult
        }
        rewardSyncError={
          tournamentsApi
            .rewardSyncError
        }
        onSyncRewards={
          controller.syncRewards
        }
        diagnostics={
          tournamentsApi
            .diagnostics
        }
        diagnosticsLoading={
          tournamentsApi
            .diagnosticsLoading
        }
        diagnosticsError={
          tournamentsApi
            .diagnosticsError
        }
        onLoadDiagnostics={
          tournamentsApi
            .loadDiagnostics
        }
      />

      <TournamentDialogs
        members={members}
        personalProfile={
          personalProfile
        }
        tournamentsApi={
          tournamentsApi
        }
        controller={
          controller
        }
      />
    </>
  );
}

export default TennisPage;
