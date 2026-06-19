# Edge Function template: send push when a notification is created.
# Deploy with: supabase functions deploy send-push-notification
# Set secrets: EXPO_ACCESS_TOKEN

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

Deno.serve(async (req) => {
  const { record } = await req.json();
  const recipientId = record?.recipient_id;
  if (!recipientId) {
    return new Response(JSON.stringify({ skipped: true }), { status: 200 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data: tokens } = await supabase
    .from("push_tokens")
    .select("token")
    .eq("profile_id", recipientId);

  if (!tokens?.length) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  }

  const messages = tokens.map((row) => ({
    to: row.token,
    title: record.title,
    body: record.body ?? "",
    sound: "default",
  }));

  const expoRes = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messages),
  });

  return new Response(JSON.stringify({ sent: messages.length, expo: await expoRes.json() }), {
    status: 200,
  });
});
