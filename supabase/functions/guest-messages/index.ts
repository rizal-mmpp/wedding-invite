// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Missing Supabase environment variables",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const { data, error } = await supabase
      .from("guest_list")
      .select("id,name,title,slug,rsvp_status,rsvp_message")
      .not("rsvp_message", "is", null)
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    const messages = (data ?? []).map((row) => ({
      id: String(row.id),
      name: row.name,
      title: row.title ?? undefined,
      slug: row.slug,
      rsvpStatus: row.rsvp_status,
      rsvpMessage: row.rsvp_message ?? undefined,
    }));

    return new Response(JSON.stringify({ success: true, data: messages }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("guest-messages function error:", error);
    return new Response(JSON.stringify({ success: false, error: "Failed to load messages" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
