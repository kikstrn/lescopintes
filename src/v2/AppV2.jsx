import AppLayout from "./app/AppLayout";
import AppProviders from "./app/AppProviders";
import AppRouter from "./app/AppRouter";

import {
  v2Pages,
} from "./app/pages";

function AppV2({
  appData,
  fallback = null,
}) {
  return (
    <AppProviders
      appData={appData}
    >
      <AppLayout>
        <AppRouter
          pages={v2Pages}
          fallback={fallback}
        />
      </AppLayout>
    </AppProviders>
  );
}

export default AppV2;