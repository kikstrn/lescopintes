import { AppDataProvider } from "../context/AppDataContext";

function AppProviders({
  appData,
  children,
}) {
  return (
    <AppDataProvider value={appData}>
      {children}
    </AppDataProvider>
  );
}

export default AppProviders;