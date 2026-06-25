import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-provision-secret",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const provisionSecret = Deno.env.get("PROVISION_SECRET") ?? "";
    const requestSecret = req.headers.get("x-provision-secret") ?? "";

    if (!provisionSecret || requestSecret !== provisionSecret) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const {
      clientId,
      name,
      adminEmail,
      adminFullName,
      adminPassword,
      adminPhone,
      ownerName,
      tagline,
      subtitle,
      primaryColor,
      secondaryColor,
      supportPhone,
      supportEmail,
    } = body as {
      clientId: string;
      name: string;
      adminEmail: string;
      adminFullName: string;
      adminPassword: string;
      adminPhone?: string;
      ownerName?: string;
      tagline?: string;
      subtitle?: string;
      primaryColor?: string;
      secondaryColor?: string;
      supportPhone?: string;
      supportEmail?: string;
    };

    if (!clientId?.trim() || !name?.trim() || !adminEmail?.trim() || !adminFullName?.trim()) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedClientId = clientId.trim().toLowerCase();
    const normalizedEmail = adminEmail.trim().toLowerCase();

    const { data: existingDaycare } = await admin
      .from("daycares")
      .select("id")
      .eq("client_id", normalizedClientId)
      .maybeSingle();

    if (existingDaycare) {
      return new Response(JSON.stringify({ error: "client_id already exists" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: daycareRow, error: daycareError } = await admin
      .from("daycares")
      .insert({ client_id: normalizedClientId, name: name.trim() })
      .select("id")
      .single();

    if (daycareError || !daycareRow) {
      return new Response(JSON.stringify({ error: daycareError?.message ?? "Daycare insert failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const daycareId = daycareRow.id as string;

    const { error: settingsError } = await admin.from("daycare_settings").insert({
      daycare_id: daycareId,
      owner_name: ownerName?.trim() || adminFullName.trim(),
      tagline: tagline?.trim() || null,
      subtitle: subtitle?.trim() || null,
      primary_color: primaryColor?.trim() || "#7A9A72",
      secondary_color: secondaryColor?.trim() || "#F4D6C6",
      background_color: "#FFF8F1",
      card_background_color: "#FFFFFF",
      text_primary_color: "#26382E",
      text_secondary_color: "#6B6B6B",
      support_phone: supportPhone?.trim() || null,
      support_email: supportEmail?.trim() || normalizedEmail,
      setup_completed: false,
    });

    if (settingsError) {
      await admin.from("daycares").delete().eq("id", daycareId);
      return new Response(JSON.stringify({ error: settingsError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let userId: string;
    let userStatus: "created" | "linked" = "created";

    const { data: usersList } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const existingUser = usersList?.users?.find(
      (u) => u.email?.toLowerCase() === normalizedEmail,
    );

    if (existingUser) {
      userId = existingUser.id;
      userStatus = "linked";
    } else {
      if (!adminPassword?.trim()) {
        await admin.from("daycares").delete().eq("id", daycareId);
        return new Response(JSON.stringify({ error: "adminPassword required for new user" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: createData, error: createError } = await admin.auth.admin.createUser({
        email: normalizedEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { full_name: adminFullName.trim() },
      });

      if (createError || !createData.user) {
        await admin.from("daycares").delete().eq("id", daycareId);
        return new Response(JSON.stringify({ error: createError?.message ?? "User create failed" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = createData.user.id;
    }

    const { error: profileError } = await admin.from("profiles").upsert(
      {
        id: userId,
        daycare_id: daycareId,
        role: "admin",
        full_name: adminFullName.trim(),
        phone: adminPhone?.trim() || null,
      },
      { onConflict: "id" },
    );

    if (profileError) {
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        daycareId,
        clientId: normalizedClientId,
        adminUserId: userId,
        userStatus,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
