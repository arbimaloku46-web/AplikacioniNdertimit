import { createClient } from "@supabase/supabase-js";
async function test() {
  try {
    const supabase = createClient("https://kfodljdnoaapfsocmywl.supabase.co", "eyJhb... \n ");
    const res = await supabase.auth.admin.deleteUser("a1215b22-1234-4000-8000-123456789012");
    console.log(res);
  } catch(e) {
    console.log("Error 1:", e.message);
  }
}
test();
