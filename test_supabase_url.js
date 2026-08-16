import { createClient } from "@supabase/supabase-js";
async function test() {
  try {
    const supabaseAdmin = createClient("https://kfodljdnoaapfsocmywl.supabase.co/rest/v1/", "eyJhb... ");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser("token");
    console.log(userError);
  } catch (e) {
    console.log("Error:", e.message);
  }
}
test();
