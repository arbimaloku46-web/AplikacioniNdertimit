import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  // CORS handling for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || "https://kfodljdnoaapfsocmywl.supabase.co").replace(/\/rest\/v1\/?$/, "");
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server." });
    }

    const token = authHeader.split(" ")[1];
    
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return res.status(401).json({ error: "Invalid token or user not found" });
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      throw deleteError;
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Delete account error:", error);
    res.status(500).json({ error: error.message || "Failed to delete account" });
  }
}
