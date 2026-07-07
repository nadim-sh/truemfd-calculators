import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { App } from "./core/App";
import { NotFound } from "./core/NotFound";
import { calculators } from "./calculators/definitions";
import "./styles.css";

const CalculatorPage = lazy(() => import("./calculators/CalculatorPage").then((module) => ({ default: module.CalculatorPage })));

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  ...calculators.map((calculator) => ({
    path: `/calculators/${calculator.slug}`,
    element: (
      <Suspense fallback={<main className="route-loading">Loading calculator...</main>}>
        <CalculatorPage calculator={calculator} />
      </Suspense>
    )
  })),
  { path: "*", element: <NotFound /> }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // The app works normally if service worker registration is blocked.
    });
  });
}
