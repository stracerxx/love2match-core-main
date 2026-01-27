import { supabase } from "@/integrations/supabase/client";

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
  const { data, error } = await supabase.rpc("escrow_v13_final", {
    p_tid: threadId,
    p_sid: senderId,
    p_content: content,
  });

  if (error) {
    console.error("Error sending message:", error);
    return { message: null, error };
  }

  // The RPC now returns the UUID directly on success
  const messageId = data as unknown as string;

  // Fetch the created message to keep existing return type compatibility
  const { data: message, error: messageError } = await supabase
    .from("messages")
    .select("*")
    .eq("id", messageId)
    .single();

  return { message: message || null, error: messageError };
}
