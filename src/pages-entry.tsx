import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

const root = document.getElementById("app");
if (!root) throw new Error("Missing app root");

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={getRouter()} />
  </StrictMode>,
);

if ("serviceWorker" in navigator) {
  // A private browser session or a failed download can leave offline use unavailable.
  void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}pages-sw.js`).catch(() => {});
}
