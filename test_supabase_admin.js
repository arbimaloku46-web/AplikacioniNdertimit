import { createClient } from "@supabase/supabase-js";
async function test() {
  try {
    const supabaseAdmin = createClient("https://kfodljdnoaapfsocmywl.supabase.co/rest/v1/", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmb2RsamRub2FhcGZzb2NteXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMjE1MjMsImV4cCI6MjA4MDc5NzUyM30.9iP3HXdTil43MyVIkjYhMc1vgLJ9mLM9xxOUMM3iX4E");
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser("a1215b22-1234-4000-8000-123456789012");
    console.log(deleteError);
  } catch (e) {
    console.log("Exception:", e.message);
  }
}
test();
