import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    createTribunalCase,
    dismissTribunalCase,
    getTribunalCases,
    judgeTribunalCase,
    updateTribunalStatus,
    voteTribunalCase,
} from "../services/tribunalService";

export function useTribunalCases(
    currentProfileId,
) {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] =
        useState(true);
    const [saving, setSaving] =
        useState(false);
    const [error, setError] =
        useState(null);

    const judgeCase = async (
        tribunalCase,
        sanction = null,
    ) => {
        setSaving(true);
        setError(null);

        try {
            const votes =
                tribunalCase.votes ?? [];

            const guiltyVotes = votes.filter(
                (voteItem) =>
                    voteItem.vote === "guilty" ||
                    voteItem.value === "guilty",
            ).length;

            const notGuiltyVotes = votes.filter(
                (voteItem) =>
                    voteItem.vote === "not_guilty" ||
                    voteItem.value === "not_guilty",
            ).length;

            const verdict =
                guiltyVotes > notGuiltyVotes
                    ? "guilty"
                    : "not_guilty";

            await judgeTribunalCase(
                tribunalCase.id,
                verdict,
                verdict === "guilty"
                    ? sanction
                    : null,
            );

            await loadCases({
                showLoading: false,
            });
        } catch (requestError) {
            setError(
                requestError?.message ??
                "Impossible de rendre le verdict.",
            );

            throw requestError;
        } finally {
            setSaving(false);
        }
    };

    const loadCases = useCallback(
        async ({ showLoading = true } = {}) => {
            if (showLoading) {
                setLoading(true);
            }

            setError(null);

            try {
                const rows =
                    await getTribunalCases();

                setCases(rows);
                return rows;
            } catch (requestError) {
                console.error(
                    "Impossible de charger le tribunal :",
                    requestError,
                );

                setError(
                    requestError?.message ??
                    "Impossible de charger le tribunal.",
                );

                return [];
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    useEffect(() => {
        loadCases();
    }, [loadCases]);

    const addCase = async (payload) => {
        setSaving(true);
        setError(null);

        try {
            await createTribunalCase(payload);
            await loadCases({
                showLoading: false,
            });
        } catch (requestError) {
            setError(
                requestError?.message ??
                "Impossible de créer l’affaire.",
            );

            throw requestError;
        } finally {
            setSaving(false);
        }
    };

    const startVoting = async (
        tribunalCase,
    ) => {
        setSaving(true);

        try {
            await updateTribunalStatus(
                tribunalCase.id,
                "voting",
            );

            await loadCases({
                showLoading: false,
            });
        } finally {
            setSaving(false);
        }
    };

    const vote = async ({
        tribunalCase,
        value,
    }) => {
        if (!currentProfileId) {
            throw new Error(
                "Utilisateur connecté introuvable.",
            );
        }

        setSaving(true);

        try {
            await voteTribunalCase(
                tribunalCase.id,
                currentProfileId,
                value,
            );

            await loadCases({
                showLoading: false,
            });
        } finally {
            setSaving(false);
        }
    };

    const dismissCase = async (
        tribunalCase,
    ) => {
        setSaving(true);

        try {
            await dismissTribunalCase(
                tribunalCase.id,
            );

            await loadCases({
                showLoading: false,
            });
        } finally {
            setSaving(false);
        }
    };

    return {
        cases,
        loading,
        saving,
        error,
        addCase,
        startVoting,
        vote,
        judgeCase,
        dismissCase,
        refreshCases: loadCases,
    };
}

export default useTribunalCases;