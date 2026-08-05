import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const MODULE_PAGE_IDS = [
  "events",
  "tennis",
  "bike",
  "gallery",
];

function getStorageKey(
  profileId,
) {
  return `copintes_module_reads_${profileId}`;
}

function getItemTimestamp(
  item,
) {
  const value =
    item?.createdAt ??
    item?.created_at ??
    item?.uploadedAt ??
    item?.uploaded_at ??
    item?.insertedAt ??
    item?.inserted_at ??
    item?.dateCreated ??
    item?.date_created ??
    null;

  if (!value) {
    return 0;
  }

  const timestamp =
    new Date(
      value,
    ).getTime();

  return Number.isFinite(
    timestamp,
  )
    ? timestamp
    : 0;
}

function getLatestTimestamp(
  items,
) {
  return (
    items ??
    []
  ).reduce(
    (
      latest,
      item,
    ) =>
      Math.max(
        latest,
        getItemTimestamp(
          item,
        ),
      ),
    0,
  );
}

function readSeenState(
  profileId,
) {
  if (!profileId) {
    return {};
  }

  try {
    const raw =
      window.localStorage.getItem(
        getStorageKey(
          profileId,
        ),
      );

    if (!raw) {
      return {};
    }

    const parsed =
      JSON.parse(raw);

    return parsed &&
      typeof parsed ===
        "object"
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function writeSeenState(
  profileId,
  state,
) {
  if (!profileId) {
    return;
  }

  try {
    window.localStorage.setItem(
      getStorageKey(
        profileId,
      ),
      JSON.stringify(
        state,
      ),
    );
  } catch {
    // Le compteur reste disponible pour la session.
  }
}

export function useModuleUnreadCounts({
  profileId,
  activePage,
  events = [],
  tennisMatches = [],
  bikeRides = [],
  galleryPhotos = [],
}) {
  const moduleItems =
    useMemo(
      () => ({
        events,
        tennis:
          tennisMatches,

        bike:
          bikeRides,

        gallery:
          galleryPhotos,
      }),
      [
        events,
        tennisMatches,
        bikeRides,
        galleryPhotos,
      ],
    );

  const [
    seenState,
    setSeenState,
  ] = useState(
    () =>
      readSeenState(
        profileId,
      ),
  );

  /*
   * Change de stockage lors d’un changement de membre.
   */
  useEffect(() => {
    setSeenState(
      readSeenState(
        profileId,
      ),
    );
  }, [
    profileId,
  ]);

  /*
   * À la toute première installation, les contenus historiques
   * sont considérés comme déjà vus. Seuls les futurs ajouts
   * déclencheront un badge.
   */
  useEffect(() => {
    if (!profileId) {
      return;
    }

    setSeenState(
      (
        currentState,
      ) => {
        let changed =
          false;

        const nextState = {
          ...currentState,
        };

        MODULE_PAGE_IDS.forEach(
          (
            pageId,
          ) => {
            if (
              nextState[pageId] !==
                undefined
            ) {
              return;
            }

            nextState[pageId] =
              getLatestTimestamp(
                moduleItems[
                  pageId
                ],
              ) ||
              Date.now();

            changed =
              true;
          },
        );

        if (changed) {
          writeSeenState(
            profileId,
            nextState,
          );

          return nextState;
        }

        return currentState;
      },
    );
  }, [
    moduleItems,
    profileId,
  ]);

  const markModuleAsRead =
    useCallback(
      (
        pageId,
      ) => {
        if (
          !profileId ||
          !MODULE_PAGE_IDS.includes(
            pageId,
          )
        ) {
          return;
        }

        setSeenState(
          (
            currentState,
          ) => {
            const nextState = {
              ...currentState,

              [pageId]:
                Math.max(
                  Date.now(),
                  getLatestTimestamp(
                    moduleItems[
                      pageId
                    ],
                  ),
                ),
            };

            writeSeenState(
              profileId,
              nextState,
            );

            return nextState;
          },
        );
      },
      [
        moduleItems,
        profileId,
      ],
    );

  /*
   * Dès que le membre est sur une page, tout ce qui y arrive
   * est considéré comme vu.
   */
  useEffect(() => {
    if (
      MODULE_PAGE_IDS.includes(
        activePage,
      )
    ) {
      markModuleAsRead(
        activePage,
      );
    }
  }, [
    activePage,
    markModuleAsRead,
    moduleItems,
  ]);

  const unreadCounts =
    useMemo(() => {
      const result = {};

      MODULE_PAGE_IDS.forEach(
        (
          pageId,
        ) => {
          if (
            activePage ===
            pageId
          ) {
            result[pageId] =
              0;

            return;
          }

          const lastSeen =
            Number(
              seenState[
                pageId
              ],
            ) ||
            0;

          result[pageId] = (
            moduleItems[
              pageId
            ] ??
            []
          ).filter(
            (
              item,
            ) =>
              getItemTimestamp(
                item,
              ) >
              lastSeen,
          ).length;
        },
      );

      return result;
    }, [
      activePage,
      moduleItems,
      seenState,
    ]);

  return {
    unreadCounts,
    markModuleAsRead,
  };
}

export default useModuleUnreadCounts;
