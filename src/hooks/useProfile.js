import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    changePassword,
    deleteAvatar,
    getProfile,
    getProfileStatistics,
    updateProfile,
    uploadAvatar,
} from "../services/profileService";

export function useProfile(profileId) {
    const [profile, setProfile] =
        useState(null);

    const [statistics, setStatistics] =
        useState({
            tennisMatches: 0,
            tennisWins: 0,
            tennisWinRate: 0,
            bikeRideCount: 0,
            bikeDistance: 0,
            bikeElevation: 0,
            photoCount: 0,
            receivedLikeCount: 0,
        });

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [
        uploadingAvatar,
        setUploadingAvatar,
    ] = useState(false);

    const [
        changingPassword,
        setChangingPassword,
    ] = useState(false);

    const [error, setError] =
        useState(null);

    const loadProfile = useCallback(
        async ({
            showLoading = true,
        } = {}) => {
            if (!profileId) {
                setProfile(null);
                setLoading(false);
                return;
            }

            if (showLoading) {
                setLoading(true);
            }

            setError(null);

            try {
                const profileData =
                    await getProfile(profileId);

                let statisticsData = {
                    tennisMatches: 0,
                    tennisWins: 0,
                    tennisWinRate: 0,
                    bikeRideCount: 0,
                    bikeDistance: 0,
                    bikeElevation: 0,
                    photoCount: 0,
                    receivedLikeCount: 0,
                };

                try {
                    statisticsData =
                        await getProfileStatistics(
                            profileId,
                        );
                } catch (statisticsError) {
                    console.error(
                        "Impossible de charger les statistiques du profil :",
                        statisticsError,
                    );
                }

                setProfile(profileData);
                setStatistics(statisticsData);

                setProfile(profileData);

                setStatistics(
                    statisticsData,
                );
            } catch (requestError) {
                console.error(
                    "Impossible de charger le profil :",
                    requestError,
                );

                setError(
                    requestError?.message ??
                    "Impossible de charger le profil.",
                );
            } finally {
                if (showLoading) {
                    setLoading(false);
                }
            }
        },
        [profileId],
    );

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const saveProfile = useCallback(
        async (profileData) => {
            if (!profileId) {
                throw new Error(
                    "Profil utilisateur introuvable.",
                );
            }

            setSaving(true);
            setError(null);

            try {
                const updatedProfile =
                    await updateProfile(
                        profileId,
                        profileData,
                    );

                setProfile(
                    updatedProfile,
                );

                return updatedProfile;
            } catch (requestError) {
                console.error(
                    "Impossible de modifier le profil :",
                    requestError,
                );

                setError(
                    requestError?.message ??
                    "Impossible de modifier le profil.",
                );

                throw requestError;
            } finally {
                setSaving(false);
            }
        },
        [profileId],
    );

    const saveAvatar = useCallback(
        async (file) => {
            if (!profileId) {
                throw new Error(
                    "Profil utilisateur introuvable.",
                );
            }

            setUploadingAvatar(true);
            setError(null);

            try {
                const updatedProfile =
                    await uploadAvatar({
                        profileId,
                        file,
                        previousAvatarPath:
                            profile?.avatarPath ??
                            null,
                    });

                setProfile(
                    updatedProfile,
                );

                return updatedProfile;
            } catch (requestError) {
                console.error(
                    "Impossible de modifier l’avatar :",
                    requestError,
                );

                setError(
                    requestError?.message ??
                    "Impossible de modifier l’avatar.",
                );

                throw requestError;
            } finally {
                setUploadingAvatar(false);
            }
        },
        [
            profileId,
            profile?.avatarPath,
        ],
    );

    const removeAvatar =
        useCallback(async () => {
            if (!profileId) {
                throw new Error(
                    "Profil utilisateur introuvable.",
                );
            }

            setUploadingAvatar(true);
            setError(null);

            try {
                const updatedProfile =
                    await deleteAvatar({
                        profileId,
                        avatarPath:
                            profile?.avatarPath ??
                            null,
                    });

                setProfile(
                    updatedProfile,
                );

                return updatedProfile;
            } catch (requestError) {
                console.error(
                    "Impossible de supprimer l’avatar :",
                    requestError,
                );

                setError(
                    requestError?.message ??
                    "Impossible de supprimer l’avatar.",
                );

                throw requestError;
            } finally {
                setUploadingAvatar(false);
            }
        }, [
            profileId,
            profile?.avatarPath,
        ]);

    const savePassword = useCallback(
        async (newPassword) => {
            setChangingPassword(true);
            setError(null);

            try {
                await changePassword(
                    newPassword,
                );
            } catch (requestError) {
                console.error(
                    "Impossible de modifier le mot de passe :",
                    requestError,
                );

                setError(
                    requestError?.message ??
                    "Impossible de modifier le mot de passe.",
                );

                throw requestError;
            } finally {
                setChangingPassword(false);
            }
        },
        [],
    );

    const refreshStatistics =
        useCallback(async () => {
            if (!profileId) {
                return;
            }

            try {
                const statisticsData =
                    await getProfileStatistics(
                        profileId,
                    );

                setStatistics(
                    statisticsData,
                );
            } catch (requestError) {
                console.error(
                    "Impossible d’actualiser les statistiques du profil :",
                    requestError,
                );

                setError(
                    requestError?.message ??
                    "Impossible d’actualiser les statistiques.",
                );
            }
        }, [profileId]);

    return {
        profile,
        statistics,

        loading,
        saving,
        uploadingAvatar,
        changingPassword,
        error,

        refreshProfile:
            loadProfile,

        refreshStatistics,

        saveProfile,
        saveAvatar,
        removeAvatar,
        savePassword,
    };
}