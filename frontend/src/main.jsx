
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Apply the saved theme before React renders.
const savedTheme = localStorage.getItem("fetowatch-theme");

document.documentElement.dataset.theme =
    savedTheme === "dark" ? "dark" : "light";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>
);
