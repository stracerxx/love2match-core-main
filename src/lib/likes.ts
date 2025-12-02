import { supabase } from "@/integrations/supabase/client";
import { canUserLike } from "./membership";

export type LikeStatus = "like" | "pass";

export async function upsertLike(userId: string, targetUserId: string, status: LikeStatus) {
  if (status === 'like') {
    const { canLike, remaining } = await canUserLike(userId);
    if (!canLike) {
      return { data: null, error: { message: `You have no likes remaining. You have ${remaining} likes left today.` } };
    }
  }

  const { data, error } = await supabase
    .from("likes")
    .upsert(
      { user_id: userId, target_user_id: targetUserId, status },
      { onConflict: "user_id,target_user_id" }
    )
    .select()
    .single();

  if (!error && status === 'like') {
    // This is a bit of a hack, but it's the easiest way to do this without a transaction
    // We should ideally use a transaction here to ensure atomicity
    const { error: updateError } = await supabase.rpc('increment_likes', { user_id_param: userId });
    if (updateError) {
      console.error('Failed to increment likes', updateError);
      // Not returning error here as the like was still successful
    }
  }


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
