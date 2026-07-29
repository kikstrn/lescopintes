import { AppDataProvider } from "../context/AppDataContext";
import { NavigationProvider } from "../context/NavigationContext";

function AppProviders({
  appData,
  children,
}) {
  return (
    <NavigationProvider>
      <AppDataProvider
        value={appData}
      >
        {children}
      </AppDataProvider>
    </NavigationProvider>
  );
}

export default AppProviders;