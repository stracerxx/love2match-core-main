import { supabase } from "@/lib/supabase";

export type ThreadListItem = {
  thread_id: string;
  partner_id: string;
  partner_email: string;
  partner_display_name: string;
  last_message_at: string | null;
};

export type Message = {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export async function getOrCreateThread(otherUserId: string) {
  const { data, error } = await supabase.rpc("get_or_create_thread", {
    other_user_id: otherUserId,
  });
  return { threadId: data ?? null, error };
}

export async function listThreads() {
  const { data, error } = await supabase.rpc("list_threads");
  return { threads: (data as ThreadListItem[]) || [], error };
}

export async function listMessages(threadId: string) {
  const { data, error } = await supabase.rpc("list_messages", {
    p_thread_id: threadId,
  });
  return { messages: (data as Message[]) || [], error };
}

export async function sendMessage(threadId: string, senderId: string, content: string) {
  const { data, error } = await supabase
    .from("messages")
    .insert({ thread_id: threadId, sender_id: senderId, content })
    .select()
    .single();

  return { message: data || null, error };
}
