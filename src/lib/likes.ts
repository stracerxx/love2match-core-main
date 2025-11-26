import { supabase } from "@/lib/supabase";

export type LikeStatus = "like" | "pass";

export async function upsertLike(userId: string, targetUserId: string, status: LikeStatus) {
  const { data, error } = await supabase
    .from("likes")
    .upsert(
      { user_id: userId, target_user_id: targetUserId, status },
      { onConflict: "user_id,target_user_id" }
    )
    .select()
    .single();

  return { data, error };
}

export type MutualMatch = {
  id: string;
  email: string;
  display_name: string;
  full_name: string;
  // keep it flexible, DB generated type includes more fields
  [key: string]: unknown;
};

export async function getMutualMatches() {
  const { data, error } = await supabase.rpc("get_mutual_matches");
  return { matches: (data as MutualMatch[]) || [], error };
}
