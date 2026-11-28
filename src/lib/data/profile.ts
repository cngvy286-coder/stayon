import { requireUser } from "./events";

/** The signed-in user's display name from their profile, or null if they haven't set one. */
export async function getDisplayName(): Promise<string | null> {
  const { supabase, userId } = await requireUser();
  const { data } = await supabase.from("profiles").select("display_name").eq("id", userId).single();
  const name = (data as { display_name?: string | null } | null)?.display_name?.trim();
  return name ? name : null;
}
