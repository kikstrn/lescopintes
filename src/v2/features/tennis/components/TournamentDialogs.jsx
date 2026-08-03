import ScoreModal from "../../../../components/ScoreModal";
import TennisTournamentAdminModal from "../../../../components/tennis/TennisTournamentAdminModal";
import TennisTournamentFormModal from "../../../../components/tennis/TennisTournamentFormModal";
import TennisTournamentMatchAdminModal from "../../../../components/tennis/TennisTournamentMatchAdminModal";

function TournamentDialogs({
  members = [],
  personalProfile,
  tournamentsApi,
  controller,
}) {
  return (
    <>
      <TennisTournamentMatchAdminModal
        open={
          controller
            .matchAdmin.open
        }
        action={
          controller
            .matchAdmin.action
        }
        match={
          controller
            .matchAdmin.match
        }
        history={
          tournamentsApi
            .matchHistory
        }
        historyLoading={
          tournamentsApi
            .matchHistoryLoading
        }
        historyError={
          tournamentsApi
            .matchHistoryError
        }
        resetImpact={
          tournamentsApi
            .resetImpact
        }
        resetImpactLoading={
          tournamentsApi
            .resetImpactLoading
        }
        resetImpactError={
          tournamentsApi
            .resetImpactError
        }
        saving={
          tournamentsApi.saving
        }
        error={
          tournamentsApi.error
        }
        onClose={
          controller
            .closeMatchAdmin
        }
        onConfirm={
          controller
            .confirmMatchAdmin
        }
      />

      <ScoreModal
        open={
          Boolean(
            controller
              .correctionMatch,
          )
        }
        members={members}
        saving={
          tournamentsApi.saving ||
          tournamentsApi
            .correctionDraftLoading
        }
        initialValues={
          controller
            .correctionInitialValues
        }
        lockMatchType
        lockPlayers
        eyebrow="Correction"
        title="Préparer le nouveau score"
        submitLabel="Enregistrer la correction"
        onClose={
          controller
            .closeCorrection
        }
        onSave={
          controller
            .saveCorrection
        }
      />

      <TennisTournamentAdminModal
        open={
          controller
            .tournamentAdmin.open
        }
        mode={
          controller
            .tournamentAdmin.mode
        }
        tournament={
          controller
            .tournamentAdmin
            .tournament
        }
        saving={
          tournamentsApi.saving
        }
        error={
          tournamentsApi.error
        }
        onClose={
          controller
            .closeTournamentAdmin
        }
        onSaveTournament={(
          payload,
        ) =>
          controller
            .runTournamentAdmin(
              () =>
                tournamentsApi
                  .editTournament(
                    payload,
                  ),
            )
        }
        onSaveSeeds={(
          payload,
        ) =>
          controller
            .runTournamentAdmin(
              () =>
                tournamentsApi
                  .reorderTournamentPlayers(
                    payload,
                  ),
            )
        }
        onRegenerate={(
          tournamentId,
        ) =>
          controller
            .runTournamentAdmin(
              () =>
                tournamentsApi
                  .regenerateBracket(
                    tournamentId,
                  ),
            )
        }
        onDuplicate={(
          tournamentId,
        ) =>
          controller
            .runTournamentAdmin(
              () =>
                tournamentsApi
                  .copyTournament({
                    tournamentId,

                    createdBy:
                      personalProfile?.id,
                  }),
            )
        }
        onCancelTournament={(
          tournamentId,
        ) =>
          controller
            .runTournamentAdmin(
              () =>
                tournamentsApi
                  .stopTournament(
                    tournamentId,
                  ),
            )
        }
        onDeleteTournament={(
          tournamentId,
        ) =>
          controller
            .runTournamentAdmin(
              () =>
                tournamentsApi
                  .removeTournament(
                    tournamentId,
                  ),
            )
        }
      />

      <ScoreModal
        open={
          Boolean(
            controller.scoreMatch,
          )
        }
        members={members}
        saving={
          tournamentsApi.saving
        }
        initialValues={
          controller
            .scoreInitialValues
        }
        lockMatchType
        lockPlayers
        eyebrow="Tournoi"
        title="Entrer le résultat"
        submitLabel="Enregistrer le résultat"
        onClose={
          controller.closeScore
        }
        onSave={
          controller.saveScore
        }
      />

      <TennisTournamentFormModal
        open={
          controller
            .creationOpen
        }
        members={members}
        currentProfileId={
          personalProfile?.id
        }
        saving={
          tournamentsApi.saving
        }
        error={
          tournamentsApi.error
        }
        onClose={
          controller
            .closeCreation
        }
        onSubmit={
          controller
            .createTournament
        }
      />
    </>
  );
}

export default TournamentDialogs;
