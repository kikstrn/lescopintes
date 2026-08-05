import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const NavigationContext =
  createContext(null);

const ACTIVE_PAGE_STORAGE_KEY =
  "copintes_navigation_active_page";

const SCROLL_STORAGE_KEY =
  "copintes_navigation_scroll_positions";

function readStoredPage() {
  try {
    return (
      window.localStorage.getItem(
        ACTIVE_PAGE_STORAGE_KEY,
      ) ||
      "home"
    );
  } catch {
    return "home";
  }
}

function readScrollPositions() {
  try {
    const value =
      window.localStorage.getItem(
        SCROLL_STORAGE_KEY,
      );

    if (!value) {
      return {};
    }

    const parsed =
      JSON.parse(value);

    return parsed &&
      typeof parsed ===
        "object"
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function saveScrollPositions(
  positions,
) {
  try {
    window.localStorage.setItem(
      SCROLL_STORAGE_KEY,
      JSON.stringify(
        positions,
      ),
    );
  } catch {
    // Le navigateur peut bloquer le stockage privé.
  }
}

export function NavigationProvider({
  children,
}) {
  const [
    activePage,
    setActivePage,
  ] = useState(
    readStoredPage,
  );

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const activePageRef =
    useRef(activePage);

  const scrollPositionsRef =
    useRef(
      readScrollPositions(),
    );

  useEffect(() => {
    activePageRef.current =
      activePage;
  }, [activePage]);

  const saveCurrentScroll =
    useCallback(() => {
      const pageId =
        activePageRef.current;

      if (!pageId) {
        return;
      }

      scrollPositionsRef.current = {
        ...scrollPositionsRef.current,

        [pageId]:
          Math.max(
            0,
            Math.round(
              window.scrollY ||
              0,
            ),
          ),
      };

      saveScrollPositions(
        scrollPositionsRef.current,
      );
    }, []);

  const restorePageScroll =
    useCallback(
      (
        pageId,
        behavior = "auto",
      ) => {
        const storedTop =
          Number(
            scrollPositionsRef
              .current?.[pageId],
          ) ||
          0;

        if (storedTop <= 0) {
          window.scrollTo({
            top:
              0,

            behavior,
          });

          return;
        }

        let attempt = 0;

        const maximumAttempts =
          18;

        const retryDelays = [
          0,
          40,
          80,
          140,
          220,
          320,
          450,
          600,
          800,
          1050,
          1350,
          1700,
          2100,
          2550,
          3050,
          3600,
          4200,
          5000,
        ];

        const tryRestore =
          () => {
            attempt += 1;

            const maximumScrollTop =
              Math.max(
                0,
                document.documentElement
                  .scrollHeight -
                window.innerHeight,
              );

            const targetTop =
              Math.min(
                storedTop,
                maximumScrollTop,
              );

            window.scrollTo({
              top:
                targetTop,

              behavior:
                attempt ===
                maximumAttempts
                  ? behavior
                  : "auto",
            });

            const currentTop =
              Math.round(
                window.scrollY ||
                0,
              );

            const closeEnough =
              Math.abs(
                currentTop -
                storedTop,
              ) <= 8;

            const pageTallEnough =
              maximumScrollTop >=
              storedTop - 8;

            if (
              closeEnough ||
              (
                pageTallEnough &&
                currentTop ===
                  targetTop
              ) ||
              attempt >=
                maximumAttempts
            ) {
              return;
            }

            window.setTimeout(
              tryRestore,
              retryDelays[
                attempt
              ] ??
              500,
            );
          };

        window.requestAnimationFrame(
          () => {
            window.requestAnimationFrame(
              tryRestore,
            );
          },
        );
      },
      [],
    );

  const navigateTo =
    useCallback(
      (
        pageId,
        options = {},
      ) => {
        if (!pageId) {
          return;
        }

        const {
          preserveScroll =
            true,

          restoreScroll =
            true,

          scrollToTop =
            false,
        } = options;

        if (preserveScroll) {
          saveCurrentScroll();
        }

        setActivePage(
          pageId,
        );

        activePageRef.current =
          pageId;

        try {
          window.localStorage.setItem(
            ACTIVE_PAGE_STORAGE_KEY,
            pageId,
          );
        } catch {
          // Le changement de page fonctionne sans stockage.
        }

        setMobileMenuOpen(
          false,
        );

        if (scrollToTop) {
          scrollPositionsRef.current = {
            ...scrollPositionsRef.current,

            [pageId]:
              0,
          };

          saveScrollPositions(
            scrollPositionsRef.current,
          );

          window.scrollTo({
            top:
              0,

            behavior:
              options.behavior ??
              "smooth",
          });

          return;
        }

        if (restoreScroll) {
          restorePageScroll(
            pageId,
            options.behavior ??
              "auto",
          );
        }
      },
      [
        restorePageScroll,
        saveCurrentScroll,
      ],
    );

  const resetNavigation =
    useCallback(() => {
      try {
        window.localStorage.removeItem(
          ACTIVE_PAGE_STORAGE_KEY,
        );

        window.localStorage.removeItem(
          SCROLL_STORAGE_KEY,
        );
      } catch {
        // Aucun blocage de la déconnexion.
      }

      scrollPositionsRef.current =
        {};

      activePageRef.current =
        "home";

      setActivePage(
        "home",
      );

      setMobileMenuOpen(
        false,
      );

      window.scrollTo({
        top:
          0,

        behavior:
          "auto",
      });
    }, []);

  /*
   * Restaure la position après un F5.
   */
  useEffect(() => {
    restorePageScroll(
      activePage,
      "auto",
    );
  }, [
    activePage,
    restorePageScroll,
  ]);

  /*
   * Sauvegarde la position pendant le défilement.
   * Le délai évite d’écrire dans localStorage à chaque pixel.
   */
  useEffect(() => {
    let timeoutId =
      null;

    const handleScroll =
      () => {
        if (timeoutId) {
          window.clearTimeout(
            timeoutId,
          );
        }

        timeoutId =
          window.setTimeout(
            () => {
              saveCurrentScroll();
            },
            120,
          );
      };

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive:
          true,
      },
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );

      if (timeoutId) {
        window.clearTimeout(
          timeoutId,
        );
      }

      saveCurrentScroll();
    };
  }, [
    saveCurrentScroll,
  ]);

  /*
   * Sauvegarde le scroll avant fermeture ou actualisation.
   */
  useEffect(() => {
    const handleBeforeUnload =
      () => {
        saveCurrentScroll();
      };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload,
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload,
      );

      saveCurrentScroll();
    };
  }, [
    saveCurrentScroll,
  ]);

  const value =
    useMemo(
      () => ({
        activePage,
        mobileMenuOpen,

        navigateTo,
        resetNavigation,
        saveCurrentScroll,

        openMobileMenu:
          () =>
            setMobileMenuOpen(
              true,
            ),

        closeMobileMenu:
          () =>
            setMobileMenuOpen(
              false,
            ),
      }),
      [
        activePage,
        mobileMenuOpen,
        navigateTo,
        resetNavigation,
        saveCurrentScroll,
      ],
    );

  return (
    <NavigationContext.Provider
      value={
        value
      }
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context =
    useContext(
      NavigationContext,
    );

  if (!context) {
    throw new Error(
      "useNavigation doit être utilisé dans NavigationProvider.",
    );
  }

  return context;
}
