import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const NavigationContext =
  createContext(null);

const STORAGE_KEY =
  "kiks_last_page";

export function NavigationProvider({
  children,
}) {
  const [activePage, setActivePage] =
    useState(() => {
      return (
        localStorage.getItem(
          STORAGE_KEY,
        ) || "home"
      );
    });

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const navigateTo = useCallback(
    (
      pageId,
      options = {},
    ) => {
      if (!pageId) {
        return;
      }

      setActivePage(pageId);

      localStorage.setItem(
        STORAGE_KEY,
        pageId,
      );

      setMobileMenuOpen(false);

      if (
        options.scroll !== false
      ) {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    },
    [],
  );

  const resetNavigation =
    useCallback(() => {
      localStorage.removeItem(
        STORAGE_KEY,
      );

      setActivePage(
        "home",
      );
    }, []);

  const value = useMemo(
    () => ({
      activePage,
      mobileMenuOpen,

      navigateTo,

      resetNavigation,

      openMobileMenu: () =>
        setMobileMenuOpen(
          true,
        ),

      closeMobileMenu: () =>
        setMobileMenuOpen(
          false,
        ),
    }),
    [
      activePage,
      mobileMenuOpen,
      navigateTo,
      resetNavigation,
    ],
  );

  return (
    <NavigationContext.Provider
      value={value}
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