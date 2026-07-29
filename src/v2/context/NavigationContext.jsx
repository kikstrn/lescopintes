import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const NavigationContext =
  createContext(null);

export function NavigationProvider({
  children,
}) {
  const [activePage, setActivePage] =
    useState("home");

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const navigateTo = useCallback(
    (pageId) => {
      if (!pageId) {
        return;
      }

      setActivePage(pageId);
      setMobileMenuOpen(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    [],
  );

  const value = useMemo(
    () => ({
      activePage,
      mobileMenuOpen,

      navigateTo,

      openMobileMenu: () =>
        setMobileMenuOpen(true),

      closeMobileMenu: () =>
        setMobileMenuOpen(false),
    }),
    [
      activePage,
      mobileMenuOpen,
      navigateTo,
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
    useContext(NavigationContext);

  if (!context) {
    throw new Error(
      "useNavigation doit être utilisé dans NavigationProvider.",
    );
  }

  return context;
}