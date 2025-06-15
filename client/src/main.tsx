import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Sistema de prevenção de regressões (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  import('./lib/development-hooks');
}

createRoot(document.getElementById("root")!).render(<App />);
