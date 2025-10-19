// src/main.jsx or src/index.jsx (your file path is src/main.jsx? you shared index; use whichever you actually mount from)
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";


// ✅ Mantine v7 style imports
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";

import "./index.css";
import "./App.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MantineProvider defaultColorScheme="light">
      <DatesProvider settings={{ consistentWeeks: true, firstDayOfWeek: 0 }}>
        <App />
      </DatesProvider>
    </MantineProvider>
  </StrictMode>
);
