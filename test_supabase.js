import { createClient } from "@supabase/supabase-js";
try {
  createClient("https://kfodljdnoaapfsocmywl.supabase.co", "invalid-key");
} catch(e) {
  console.log("Error 1:", e.message);
}
try {
  createClient("invalid-url", "invalid-key");
} catch(e) {
  console.log("Error 2:", e.message);
}
