import { createClient } from "@supabase/supabase-js";
async function test() {
  try {
    const supabase = createClient("https://kfodljdnoaapfsocmywl.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmb2RsamRub2FhcGZzb2NteXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMjE1MjMsImV4cCI6MjA4MDc5NzUyM30.9iP3HXdTil43MyVIkjYhMc1vgLJ9mLM9xxOUMM3iX4E");
    const res = await supabase.auth.getUser("this is a completely invalid token!!!");
    console.log(res);
  } catch(e) {
    console.log("Error 1:", e.message);
  }
}
test();
