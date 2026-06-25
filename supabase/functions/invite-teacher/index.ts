import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user: caller },
    } = await callerClient.auth.getUser();

    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { email, fullName, phone, daycareId } = body as {
      email: string;
      fullName: string;
      phone?: string;
      daycareId: string;
    };

    if (!email?.trim() || !fullName?.trim() || !daycareId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerProfile } = await admin
      .from("profiles")
      .select("role, daycare_id")
      .eq("id", caller.id)
      .single();

    if (
      !callerProfile ||
      callerProfile.role !== "admin" ||
      callerProfile.daycare_id !== daycareId
    ) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let userId: string | null = null;
    let status: "invited" | "already_exists" = "invited";

    const { data: usersList } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const existingUser = usersList?.users?.find(
      (u) => u.email?.toLowerCase() === normalizedEmail,
    );

    if (existingUser) {
      userId = existingUser.id;
      status = "already_exists";
    } else {
      const redirectTo = Deno.env.get("INVITE_REDIRECT_URL") ?? "gan-nuna-banuna://reset-password";
      const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
        normalizedEmail,
        { redirectTo, data: { full_name: fullName.trim() } },
      );

      if (inviteError || !inviteData.user) {
        return new Response(
          JSON.stringify({ error: inviteError?.message ?? "Invite failed" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      userId = inviteData.user.id;
    }

    const { error: profileError } = await admin.from("profiles").upsert(
      {
        id: userId,
        daycare_id: daycareId,
        role: "teacher",
        full_name: fullName.trim(),
        phone: phone?.trim() || null,
      },
      { onConflict: "id" },
    );

    if (profileError) {
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ status, userId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
