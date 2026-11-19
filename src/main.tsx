import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initThemeEarly } from "./components/ThemeToggle";
import { initAnalytics } from "./lib/analytics";
import { I18nProvider } from "./lib/i18n";
import "./index.css";

initThemeEarly();
initAnalytics();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
