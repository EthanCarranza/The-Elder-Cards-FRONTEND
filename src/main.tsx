import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
// Handler global para filtrar el error de listener asíncrono (problema con algunos navegadores basados en Chromium)
window.addEventListener("error", function (event) {
  if (
    event.message &&
    event.message.includes(
      "A listener indicated an asynchronous response by returning true"
    )
  ) {
    event.preventDefault();
  }
});
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
