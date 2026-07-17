import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { MyContextProvider } from "./contexts/MyContext.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <MyContextProvider>
    <App />
  </MyContextProvider>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("SW registered:", reg.scope))
      .catch((err) => console.log("SW registration failed:", err));
  });
}

