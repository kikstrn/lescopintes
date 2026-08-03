import React from "react";
import ReactDOM from "react-dom/client";
import "leaflet/dist/leaflet.css";

import App from "./App";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { registerServiceWorker } from "./pwa/registerServiceWorker";
import "./styles.css";

registerServiceWorker();

ReactDOM.createRoot(
  document.getElementById("root"),
).render(
  <React.StrictMode>
    <AuthProvider>
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    </AuthProvider>
  </React.StrictMode>,
);
