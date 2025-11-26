import { useLocation, useNavigate } from 'react-router-dom';
import { VideoCallInterface } from '@/components/VideoCallInterface';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface VideoCallLocationState {
  matchId: string;
  receiverEmail: string;
  receiverName?: string;
  callType: 'video' | 'audio';
}

const VideoCall = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as VideoCallLocationState;

  // If no state provided, redirect back to matches
  if (!state) {
    navigate('/matches');
    return null;
  }

  const handleCallEnd = (duration: number, status: string) => {
    console.log(`Call ended: ${status}, duration: ${duration} seconds`);
    // In a real app, you might want to save call history here
  };

  const handleBackToMatches = () => {
    navigate('/matches');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card/50 to-background p-4 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToMatches}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Matches
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">
                {state.callType === 'video' ? 'Video' : 'Audio'} Call
              </h1>
              <p className="text-muted-foreground">
                Connecting with {state.receiverName || state.receiverEmail}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Call Interface */}
      <div className="max-w-4xl mx-auto">
        <VideoCallInterface
          matchId={state.matchId}
          receiverEmail={state.receiverEmail}
          receiverName={state.receiverName}
          onCallEnd={handleCallEnd}
          initialCallType={state.callType}
        />
      </div>

      {/* Call Instructions */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Call Instructions</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Make sure you're in a quiet environment for better audio quality</li>
            <li>• Ensure good lighting for video calls</li>
            <li>• Use headphones to prevent echo</li>
            <li>• Check your internet connection before starting the call</li>
            <li>• You can toggle video and audio during the call</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;