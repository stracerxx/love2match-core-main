import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle, Heart, Video, Phone } from "lucide-react";
import { getMutualMatches, MutualMatch } from "@/lib/likes";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Matches = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<MutualMatch[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const { matches, error } = await getMutualMatches();
    if (error) {
      toast({
        title: "Error loading matches",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setMatches(matches || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user, load]);

  const openChat = async (partnerId: string) => {
    // Navigate to messages page with intent to open/create thread
    navigate("/messages", { state: { partnerId } });
  };

  const startVideoCall = (match: MutualMatch) => {
    navigate("/video-call", {
      state: {
        matchId: match.id,
        receiverEmail: match.email,
        receiverName: match.display_name,
        callType: 'video'
      }
    });
  };

  const startAudioCall = (match: MutualMatch) => {
    navigate("/video-call", {
      state: {
        matchId: match.id,
        receiverEmail: match.email,
        receiverName: match.display_name,
        callType: 'audio'
      }
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 md:ml-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:ml-20">
      {/* Header */}
      <div className="border-b border-border/50 bg-gradient-to-r from-background to-card p-4 md:px-8 md:py-6">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Matches</h1>
        <p className="text-sm text-muted-foreground mt-1">{matches.length} mutual matches</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-8">
        {matches.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Heart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h2 className="mb-2 text-2xl font-bold text-primary">No matches yet</h2>
              <p className="text-muted-foreground">Keep discovering profiles and liking people to get matches.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl">
            {matches.map((m) => (
              <Card key={m.id} className="shadow-card hover:shadow-card-hover transition border-0 overflow-hidden">
                <CardContent className="p-4">
                  <div className="mb-1 text-lg font-semibold text-foreground">{m.display_name || m.email}</div>
                  <div className="text-xs text-muted-foreground mb-4">{m.email}</div>
                  
                  {/* Call Buttons */}
                  <div className="flex gap-2 mb-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => startVideoCall(m)}
                    >
                      <Video className="mr-1 h-3 w-3" />
                      Video
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => startAudioCall(m)}
                    >
                      <Phone className="mr-1 h-3 w-3" />
                      Audio
                    </Button>
                  </div>
                  
                  {/* Message Button */}
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                    onClick={() => openChat(m.id)}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
