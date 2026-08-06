import {
  useState,
} from "react";

import WorkoutSection from "../../../components/workout/WorkoutSection";
import WorkoutSessionModal from "../../../components/workout/WorkoutSessionModal";

import {
  useAuth,
} from "../../../context/AuthContext";

import {
  useWorkouts,
} from "../../../hooks/useWorkouts";

function WorkoutPage() {
  const {
    profile,
    user,
    isAdmin,
  } = useAuth();

  const [modalOpen, setModalOpen] =
    useState(false);

  const workoutApi =
    useWorkouts({
      profileId:
        profile?.id ??
        user?.id,
      isAdmin,
    });

  return (
    <>
      <WorkoutSection
        sessions={
          workoutApi.sessions
        }
        statistics={
          workoutApi.statistics
        }
        loading={
          workoutApi.loading
        }
        saving={
          workoutApi.saving
        }
        error={
          workoutApi.error
        }
        currentProfileId={
          profile?.id ??
          user?.id
        }
        isAdmin={isAdmin}
        onCreate={() =>
          setModalOpen(true)
        }
        onDelete={
          workoutApi.removeSession
        }
      />

      <WorkoutSessionModal
        open={modalOpen}
        exercises={
          workoutApi.exercises
        }
        saving={
          workoutApi.saving
        }
        onClose={() =>
          setModalOpen(false)
        }
        onSave={
          workoutApi.addSession
        }
      />
    </>
  );
}

export default WorkoutPage;
