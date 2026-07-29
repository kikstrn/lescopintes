import AppProviders from "./AppProviders";
import AppLayout from "./AppLayout";

function AppShell({
  appData,
  navigation,
  activePage,
  pageTitle,
  profile,
  connectedNickname,
  connectedInitials,
  connectedRole,
  mobileMenuOpen,
  mobileSidebarOpen,
  onNavigate,
  onLogout,
  onOpenMobileMenu,
  onCloseMobileMenu,
  onCloseSidebar,
  children,
}) {
  return (
    <AppProviders appData={appData}>
      <AppLayout
        navigation={navigation}
        activePage={activePage}
        pageTitle={pageTitle}
        profile={profile}
        connectedNickname={connectedNickname}
        connectedInitials={connectedInitials}
        connectedRole={connectedRole}
        mobileMenuOpen={mobileMenuOpen}
        mobileSidebarOpen={mobileSidebarOpen}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onOpenMobileMenu={onOpenMobileMenu}
        onCloseMobileMenu={onCloseMobileMenu}
        onCloseSidebar={onCloseSidebar}
      >
        {children}
      </AppLayout>
    </AppProviders>
  );
}

export default AppShell;