import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BancoLogin } from "./components/BancoLogin.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BancoLogin />
  </StrictMode>,
);
