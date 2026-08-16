import { createClient } from "@supabase/supabase-js";

try {
  const url = "https://kfodljdnoaapfsocmywl.supabase.co ";
  const key = "invalid";
  const supabase = createClient(url, key);
} catch (e) {
  console.log("createClient error:", e.message);
}

try {
  atob("12345");
} catch(e) {
  console.log("atob error:", e.message);
}
