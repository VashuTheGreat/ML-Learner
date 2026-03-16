import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <GlobalErrorBoundary>
    <ThemeProvider>
    <App />
  </ThemeProvider>
  </GlobalErrorBoundary>
);

