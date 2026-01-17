import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { supabaseClient, PROJECT_URL } from "@/lib/supabaseClient";
import { logger } from "@/lib/logger";

// Dev-only debug logs to confirm the exact backend URL used in the app
logger.log("Supabase URL:", PROJECT_URL);

// Dev-only sanity query to confirm connectivity + auth header attachment
supabaseClient
  .from("uol_schools")
  .select("school_id", { count: "exact", head: true })
  .then(({ count, error }) => {
    if (error) {
      logger.error("Supabase sanity query failed:", error);
    } else {
      logger.log("Supabase sanity query OK. uol_schools count:", count);
    }
  });

createRoot(document.getElementById("root")!).render(<App />);
