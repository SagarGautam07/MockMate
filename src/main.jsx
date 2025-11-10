// Main entry point for MockMate application
// Initializes React root and renders the App component

import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

