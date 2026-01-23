import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { listThreads, listMessages, sendMessage, getOrCreateThread, ThreadListItem, Message } from "@/lib/messages";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, MessageCircle, Gift, Video, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SendGiftModal } from "@/components/SendGiftModal";

type LocationState = {
  partnerId?: string;
};

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { partnerId } = (location.state || {}) as LocationState;

  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<ThreadListItem[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [selectedPartnerName, setSelectedPartnerName] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState("");
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const selectedThread = useMemo(
    () => threads.find((t) => t.thread_id === selectedThreadId) || null,
    [threads, selectedThreadId]
  );

  // Scroll messages to bottom when updated
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedThreadId]);

  const loadThreads = async () => {
    const { threads, error } = await listThreads();
    if (error) {
      toast({
        title: "Error loading threads",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setThreads(threads);
  };

  const loadMessages = async (threadId: string) => {
    const { messages, error } = await listMessages(threadId);
    if (error) {
      toast({
        title: "Error loading messages",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setMessages(messages);
  };

  // Setup realtime for messages in the selected thread
  useEffect(() => {
    // cleanup previous channel
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }

    if (!selectedThreadId) return;

    const channel = supabase
      .channel(`thread-${selectedThreadId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `thread_id=eq.${selectedThreadId}` },
        (payload) => {
          const newMsg = payload.new as unknown as Message;
          setMessages((prev) => {
            // avoid duplicates if we already have it
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe((status) => {
        // noop; could handle status
      });

    realtimeChannelRef.current = channel;

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
    };
  }, [selectedThreadId]);

  // Initialize: load threads, handle deep-link from Matches
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (!user) return;
      setLoading(true);
      try {
        if (partnerId) {
          // create or fetch thread with partner
          const { threadId, error } = await getOrCreateThread(partnerId);
          if (error) {
            toast({
              title: "Error creating thread",
              description: error.message,
              variant: "destructive",
            });
          }
          await loadThreads();
          if (threadId) {
            setSelectedThreadId(threadId);
            await loadMessages(threadId);
            const t = threads.find((th) => th.thread_id === threadId);
            setSelectedPartnerName(t?.partner_display_name || t?.partner_email || null);
          }
        } else {
          await loadThreads();
          // preselect most recent thread if any
          if (threads.length > 0) {
            const first = threads[0];
            setSelectedThreadId(first.thread_id);
            setSelectedPartnerName(first.partner_display_name || first.partner_email || null);
            await loadMessages(first.thread_id);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, partnerId]);

  // Update selected partner name when thread changes
  useEffect(() => {
    const t = threads.find((th) => th.thread_id === selectedThreadId);
    setSelectedPartnerName(t?.partner_display_name || t?.partner_email || null);
  }, [threads, selectedThreadId]);

  const handleSelectThread = async (thread: ThreadListItem) => {
    setSelectedThreadId(thread.thread_id);
    setSelectedPartnerName(thread.partner_display_name || thread.partner_email || null);
    await loadMessages(thread.thread_id);
  };

  const handleSend = async () => {
    if (!user || !selectedThreadId || !content.trim()) return;
    setSending(true);

    // optimistic
    const temp: Message = {
      id: `temp-${Date.now()}`,
      thread_id: selectedThreadId,
      sender_id: user.id,
      content: content.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, temp]);
    const sendingContent = content.trim();
    setContent("");

    const { message, error } = await sendMessage(selectedThreadId, user.id, sendingContent);
    if (error || !message) {
      toast({
        title: "Send failed",
        description: error?.message || "Unable to send message.",
        variant: "destructive",
      });
      // rollback temp
      setMessages((prev) => prev.filter((m) => m.id !== temp.id));
    } else {
      // replace temp if needed
      setMessages((prev) => prev.map((m) => (m.id === temp.id ? message : m)));
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 md:ml-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:ml-20 bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-gradient-to-r from-background to-card p-4 md:px-8 md:py-6">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Messages</h1>
        <p className="text-sm text-muted-foreground mt-1">{threads.length} conversations</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 grid gap-6 md:grid-cols-[280px_1fr]">
        {/* Threads list */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Conversations</h2>
            {threads.length === 0 ? (
              <Card className="shadow-card border-0">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <MessageCircle className="mx-auto mb-2 h-10 w-10 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-2">
                {threads.map((t) => {
                  const isActive = t.thread_id === selectedThreadId;
                  return (
                    <button
                      key={t.thread_id}
                      onClick={() => handleSelectThread(t)}
                      className={`w-full rounded-lg border p-3 text-left transition-all ${isActive
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border/50 hover:bg-muted/50 hover:border-border"
                        }`}
                    >
                      <div className="font-medium text-foreground">
                        {t.partner_display_name || t.partner_email}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {t.last_message_at ? new Date(t.last_message_at).toLocaleString() : "No messages yet"}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Message pane */}
        <div className="flex min-h-[60vh] md:min-h-[70vh] flex-col rounded-lg border border-border/50 bg-card overflow-hidden shadow-card">
          {selectedThreadId ? (
            <>
              {/* Header */}
              <div className="border-b border-border/50 bg-gradient-to-r from-card to-secondary/50 p-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-primary">{selectedPartnerName || "Messages"}</h3>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary/40 text-primary hover:bg-primary/10"
                    onClick={() => navigate(`/video-call?matchId=${selectedThread?.partner_id}&callType=audio`)}
                    title="Start audio call"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary/40 text-primary hover:bg-primary/10"
                    onClick={() => navigate(`/video-call?matchId=${selectedThread?.partner_id}&callType=video`)}
                    title="Start video call"
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-accent/40 text-accent hover:bg-accent/10"
                    onClick={() => setIsGiftModalOpen(true)}
                  >
                    <Gift className="mr-2 h-4 w-4" />
                    Send Gift
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <MessageCircle className="h-8 w-8 opacity-50 mx-auto mb-2" />
                      <p>Say hello! 👋</p>
                    </div>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMine = m.sender_id === user?.id;
                    return (
                      <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${isMine
                            ? "bg-gradient-primary text-white shadow-md"
                            : "bg-secondary/70 text-foreground border border-border/50"
                            }`}
                        >
                          <div>{m.content}</div>
                          <div className={`mt-1 text-xs ${isMine ? 'text-white/70' : 'text-muted-foreground'}`}>
                            {new Date(m.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border/50 bg-secondary/30 p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    disabled={!selectedThreadId || sending}
                    className="bg-background border-border/50"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!selectedThreadId || sending || !content.trim()}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full grid place-items-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 opacity-50 mx-auto mb-4" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedThread && (
        <SendGiftModal
          isOpen={isGiftModalOpen}
          onClose={() => setIsGiftModalOpen(false)}
          receiverEmail={selectedThread.partner_email}
          receiverName={selectedThread.partner_display_name || selectedThread.partner_email}
        />
      )}
    </div>
  );
};

export default Messages;
