import { createClient } from "@supabase/supabase-js";
async function test() {
  try {
    const supabase = createClient("https://kfodljdnoaapfsocmywl.supabase.co", "this is not a jwt");
    const res = await supabase.auth.getUser("this is not a jwt");
    console.log(res);
  } catch(e) {
    console.log("Error 1:", e.message);
  }
}
test();
