import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "leaflet/dist/leaflet.css";
import "./styles/theme.css";

import { registerSW } from "virtual:pwa-register";

if (import.meta.env.PROD) {
  registerSW({
    onNeedRefresh() {
      console.log("New content available, reload to update.");
    },
    onOfflineReady() {
      console.log("App ready to work offline.");
    },
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
