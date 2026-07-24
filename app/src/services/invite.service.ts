import { isSupabaseConfigured, supabase } from "../lib/supabase";

export type InviteParentStatus = "invited" | "already_exists" | "failed" | "skipped";

export interface InviteParentResult {
  status: InviteParentStatus;
  error?: string;
}

export async function inviteParent(input: {
  email: string;
  fullName: string;
  phone?: string;
  guardianId: string;
  daycareId: string;
}): Promise<InviteParentResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { status: "skipped" };
  }

  if (!input.email.trim()) {
    return { status: "skipped" };
  }

  const { data, error } = await supabase.functions.invoke("invite-parent", {
    body: input,
  });

  if (error) {
    // FunctionsHttpError hides the response body behind `context`;
    // extract the real error message the function returned.
    let detail = error.message;
    const response = (error as { context?: Response }).context;
    if (response && typeof response.json === "function") {
      try {
        const body = (await response.json()) as { error?: string } | null;
        if (body?.error) {
          detail = body.error;
        }
      } catch {
        // keep the generic message
      }
    }
    return { status: "failed", error: detail };
  }

  const payload = data as { status?: InviteParentStatus; error?: string } | null;
  if (!payload || payload.error) {
    return { status: "failed", error: payload?.error ?? "Invite failed" };
  }

  return { status: payload.status ?? "invited" };
}
