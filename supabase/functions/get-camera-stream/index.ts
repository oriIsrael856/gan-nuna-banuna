import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type CameraSchedule = {
  timezone?: string;
  days?: number[];
  startTime?: string;
  endTime?: string;
};

function isWithinSchedule(schedule: CameraSchedule | null): boolean {
  if (!schedule?.startTime || !schedule?.endTime) {
    return true;
  }

  const now = new Date();
  const day = now.getDay();
  const days = schedule.days ?? [0, 1, 2, 3, 4, 5, 6];
  if (!days.includes(day)) {
    return false;
  }

  const [startH, startM] = schedule.startTime.split(":").map(Number);
  const [endH, endM] = schedule.endTime.split(":").map(Number);
  const minutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  return minutes >= startMinutes && minutes <= endMinutes;
}

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
    const { cameraId } = body as { cameraId: string };

    if (!cameraId) {
      return new Response(JSON.stringify({ error: "Missing cameraId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: profile } = await admin
      .from("profiles")
      .select("role, daycare_id")
      .eq("id", caller.id)
      .single();

    if (!profile?.daycare_id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (profile.role === "parent") {
      const { data: consent } = await admin
        .from("camera_consents")
        .select("profile_id")
        .eq("profile_id", caller.id)
        .eq("daycare_id", profile.daycare_id)
        .maybeSingle();

      if (!consent) {
        return new Response(JSON.stringify({ error: "Consent required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { data: camera, error: cameraError } = await admin
      .from("cameras")
      .select("*")
      .eq("id", cameraId)
      .eq("daycare_id", profile.daycare_id)
      .single();

    if (cameraError || !camera) {
      return new Response(JSON.stringify({ error: "Camera not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!camera.is_enabled) {
      return new Response(JSON.stringify({ error: "Camera disabled" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isWithinSchedule(camera.schedule_json as CameraSchedule)) {
      return new Response(JSON.stringify({ error: "Outside viewing hours" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const streamUrl = camera.stream_external_id?.trim();
    if (!streamUrl) {
      return new Response(JSON.stringify({ error: "Stream not configured" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("camera_access_logs").insert({
      camera_id: cameraId,
      profile_id: caller.id,
    });

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    return new Response(
      JSON.stringify({
        streamUrl,
        expiresAt,
        provider: camera.stream_provider,
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
