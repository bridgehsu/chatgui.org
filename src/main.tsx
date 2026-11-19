import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App";
import { initThemeEarly } from "./components/ThemeToggle";
import { initAnalytics } from "./lib/analytics";
import { I18nProvider } from "./lib/i18n";
import { AboutPage } from "./pages/AboutPage";
import { ChatPage } from "./pages/ChatPage";
import { DocsPage } from "./pages/DocsPage";
import "./index.css";

initThemeEarly();
initAnalytics();

const basename = (import.meta.env.BASE_URL || "/").replace(/\/$/, "") || "/";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route element={<App />}>
            <Route index element={<ChatPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="docs" element={<DocsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  </StrictMode>,
);
