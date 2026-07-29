import {
  useEffect,
  useState,
} from "react";

import {
  archiveChallenge,
  createChallenge,
  getChallenges,
  updateChallenge,
} from "../services/challengeService";

export default function useChallenges() {
  const [loading, setLoading] =
    useState(true);

  const [challenges, setChallenges] =
    useState([]);

  async function refresh() {
    setLoading(true);

    try {
      const data =
        await getChallenges();

      setChallenges(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function create(values) {
    await createChallenge(values);
    refresh();
  }

  async function update(id, values) {
    await updateChallenge(
      id,
      values,
    );

    refresh();
  }

  async function archive(id) {
    await archiveChallenge(id);
    refresh();
  }

  const activeChallenge =
    challenges.find(
      (challenge) =>
        challenge.status === "active",
    );

  return {
    loading,

    challenges,

    activeChallenge,

    refresh,

    createChallenge: create,

    updateChallenge: update,

    archiveChallenge: archive,
  };
}